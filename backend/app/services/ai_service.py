"""
Module 1.10 — AI Community Intelligence business logic.

One domain service file (same pattern as complaint_service / billing_service).
Routers stay thin: Depends + call here + success_response.
"""
from __future__ import annotations

import hashlib
import json
import logging
import re
from collections import Counter
from typing import Any, Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.config import settings
from app.models.ai import AiInferenceLog
from app.models.apartment import Flat, ResidentProfile
from app.models.auth import RoleEnum, User
from app.models.communication import Announcement
from app.models.complaint import Complaint, ComplaintCategory, MaintenanceTask
from app.models.mixins import ist_now
from app.models.staff import MaintenanceStaff
from app.schemas.ai_schema import (
    AlternativeCategory,
    ChatCitation,
    ChatMessage,
    ChatResponse,
    ClassifyRequest,
    ClassifyResponse,
    ComplaintSummaryMetrics,
    ComplaintSummaryRequest,
    ComplaintSummaryResponse,
    MaintenanceStaffListItem,
    SearchResponse,
    SearchResultItem,
    StaffRecommendationItem,
    StaffRecommendationsResponse,
)
from app.services import complaint_service
from app.utils import ai_prompts
from app.utils.api_error import BadRequest, ServiceUnavailable
from app.utils.groq_client import chat_completion, ensure_ai_enabled, parse_json_content
from app.utils.redis_client import get_redis_client

logger = logging.getLogger("neighbourly.ai")

VALID_PRIORITIES = frozenset({"low", "medium", "high", "critical"})
OPEN_TASK_STATUSES = frozenset({"accepted", "in_progress"})
_RERANK_THRESHOLD = 8
_SEARCH_CANDIDATE_LIMIT = 40


def _role_name(user: User) -> str:
    return user.role.role_name.value


def _truncate(text: Optional[str], n: int = 500) -> str:
    if not text:
        return ""
    text = text.strip()
    return text if len(text) <= n else text[: n - 1] + "…"


_MARKDOWN_BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
_MARKDOWN_ITALIC_RE = re.compile(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)")
_ID_IN_PARENS_RE = re.compile(
    r"\s*\((?:announcement|complaint|notice)_id\s*=\s*\d+\)",
    re.IGNORECASE,
)
_BARE_ID_RE = re.compile(
    r"\b(?:announcement_id|complaint_id|notice_id)\s*=\s*\d+\b",
    re.IGNORECASE,
)


def _plain_chat_reply(text: Optional[str]) -> str:
    """Strip markdown and raw entity ids so the chat bubble stays readable."""
    cleaned = _MARKDOWN_BOLD_RE.sub(r"\1", text or "")
    cleaned = _MARKDOWN_ITALIC_RE.sub(r"\1", cleaned)
    cleaned = cleaned.replace("`", "")
    cleaned = _ID_IN_PARENS_RE.sub("", cleaned)
    cleaned = _BARE_ID_RE.sub("", cleaned)
    cleaned = re.sub(r"[ \t]+\n", "\n", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = re.sub(r" {2,}", " ", cleaned)
    return cleaned.strip()


def _request_hash(payload: Any) -> str:
    raw = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _log_inference(
    db: Session,
    *,
    feature: str,
    user_id: Optional[int],
    entity_type: Optional[str],
    entity_id: Optional[int],
    request_hash: Optional[str],
    latency_ms: Optional[int],
    raw_response: str,
) -> None:
    db.add(
        AiInferenceLog(
            feature=feature,
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            request_hash=request_hash,
            model=settings.GROQ_MODEL,
            latency_ms=latency_ms,
            raw_response=_truncate(raw_response, 2000),
        )
    )
    db.commit()


def _clamp_priority(value: Any) -> str:
    priority = str(value or "medium").strip().lower()
    if priority not in VALID_PRIORITIES:
        return "medium"
    return priority


def _clamp_confidence(value: Any) -> float:
    try:
        conf = float(value)
    except (TypeError, ValueError):
        return 0.5
    return max(0.0, min(1.0, conf))


# ---------------------------------------------------------------------------
# Maintenance staff directory (non-AI prerequisite)
# ---------------------------------------------------------------------------


def list_maintenance_staff(db: Session) -> list[MaintenanceStaffListItem]:
    staff_rows = (
        db.query(MaintenanceStaff)
        .options(joinedload(MaintenanceStaff.user))
        .order_by(MaintenanceStaff.staff_id)
        .all()
    )
    open_counts = dict(
        db.query(MaintenanceTask.staff_id, func.count(MaintenanceTask.task_id))
        .filter(MaintenanceTask.status.in_(list(OPEN_TASK_STATUSES)))
        .group_by(MaintenanceTask.staff_id)
        .all()
    )
    items: list[MaintenanceStaffListItem] = []
    for staff in staff_rows:
        user = staff.user
        items.append(
            MaintenanceStaffListItem(
                staff_id=staff.staff_id,
                user_id=staff.user_id,
                full_name=user.full_name if user else None,
                email=user.email if user else None,
                phone=user.phone if user else None,
                specialization=staff.specialization,
                experience_years=staff.experience_years,
                is_available=bool(staff.is_available),
                open_task_count=int(open_counts.get(staff.staff_id, 0)),
            )
        )
    return items


# ---------------------------------------------------------------------------
# Classify
# ---------------------------------------------------------------------------


def classify_complaint(db: Session, user: User, payload: ClassifyRequest) -> ClassifyResponse:
    ensure_ai_enabled()
    categories = db.query(ComplaintCategory).order_by(ComplaintCategory.category_id).all()
    if not categories:
        raise BadRequest("No complaint categories are configured yet.")

    category_payload = [
        {"category_id": c.category_id, "category_name": c.category_name} for c in categories
    ]
    by_id = {c.category_id: c for c in categories}

    user_content = {
        "description": payload.description.strip(),
        "categories": category_payload,
        "category_hints": payload.category_hints or [],
    }
    messages = [
        {"role": "system", "content": ai_prompts.CLASSIFY_SYSTEM},
        {"role": "user", "content": json.dumps(user_content)},
    ]
    content, latency_ms = chat_completion(messages, response_json=True, max_tokens=600)
    parsed = parse_json_content(content)

    try:
        category_id = int(parsed.get("category_id"))
    except (TypeError, ValueError) as exc:
        raise ServiceUnavailable("AI returned an invalid category_id.") from exc

    if category_id not in by_id:
        # Fallback: first category rather than hard-failing a good description
        category_id = categories[0].category_id

    alt_ids: list[int] = []
    for raw in parsed.get("alternative_category_ids") or []:
        try:
            cid = int(raw)
        except (TypeError, ValueError):
            continue
        if cid in by_id and cid != category_id and cid not in alt_ids:
            alt_ids.append(cid)

    result = ClassifyResponse(
        category_id=category_id,
        category_name=by_id[category_id].category_name,
        priority=_clamp_priority(parsed.get("priority")),
        confidence=_clamp_confidence(parsed.get("confidence")),
        rationale=_truncate(str(parsed.get("rationale") or "Suggested from complaint text."), 400),
        alternative_categories=[
            AlternativeCategory(category_id=cid, category_name=by_id[cid].category_name)
            for cid in alt_ids[:5]
        ],
    )

    _log_inference(
        db,
        feature="classify",
        user_id=user.user_id,
        entity_type=None,
        entity_id=None,
        request_hash=_request_hash(user_content),
        latency_ms=latency_ms,
        raw_response=content,
    )
    return result


# ---------------------------------------------------------------------------
# Staff recommendations
# ---------------------------------------------------------------------------


def recommend_staff_for_complaint(
    db: Session, user: User, complaint_id: int
) -> StaffRecommendationsResponse:
    ensure_ai_enabled()
    complaint = complaint_service.get_complaint_or_404(db, complaint_id)
    category = (
        db.query(ComplaintCategory)
        .filter(ComplaintCategory.category_id == complaint.category_id)
        .first()
    )
    staff_items = list_maintenance_staff(db)
    if not staff_items:
        raise BadRequest("No maintenance staff accounts exist to recommend.")

    candidates = [item.model_dump() for item in staff_items]
    user_content = {
        "complaint": {
            "complaint_id": complaint.complaint_id,
            "description": complaint.description,
            "priority": complaint.priority,
            "category_name": category.category_name if category else None,
            "status": complaint.status,
        },
        "candidates": candidates,
    }
    messages = [
        {"role": "system", "content": ai_prompts.RECOMMEND_SYSTEM},
        {"role": "user", "content": json.dumps(user_content)},
    ]
    content, latency_ms = chat_completion(messages, response_json=True, max_tokens=800)
    parsed = parse_json_content(content)

    by_id = {item.staff_id: item for item in staff_items}
    rankings = parsed.get("rankings") or []
    ordered_ids: list[int] = []
    reasons: dict[int, str] = {}
    for row in rankings:
        try:
            sid = int(row.get("staff_id"))
        except (TypeError, ValueError, AttributeError):
            continue
        if sid in by_id and sid not in ordered_ids:
            ordered_ids.append(sid)
            reasons[sid] = _truncate(str(row.get("reason") or "Matched by specialization and load."), 300)

    # Append any missing candidates (available first, then by open load)
    leftovers = [s for s in staff_items if s.staff_id not in ordered_ids]
    leftovers.sort(key=lambda s: (not s.is_available, s.open_task_count, -(s.experience_years or 0)))
    ordered_ids.extend(s.staff_id for s in leftovers)

    # Stable prefer available near top if model ranked unavailable first
    available = [sid for sid in ordered_ids if by_id[sid].is_available]
    unavailable = [sid for sid in ordered_ids if not by_id[sid].is_available]
    final_ids = available + unavailable

    recommendations = [
        StaffRecommendationItem(
            staff_id=sid,
            full_name=by_id[sid].full_name,
            specialization=by_id[sid].specialization,
            experience_years=by_id[sid].experience_years,
            is_available=by_id[sid].is_available,
            open_task_count=by_id[sid].open_task_count,
            reason=reasons.get(sid, "Added from staff directory after AI ranking."),
        )
        for sid in final_ids
    ]

    _log_inference(
        db,
        feature="recommend",
        user_id=user.user_id,
        entity_type="complaint",
        entity_id=complaint_id,
        request_hash=_request_hash({"complaint_id": complaint_id}),
        latency_ms=latency_ms,
        raw_response=content,
    )
    return StaffRecommendationsResponse(complaint_id=complaint_id, recommendations=recommendations)


# ---------------------------------------------------------------------------
# Smart search
# ---------------------------------------------------------------------------


def _resident_profile_id(db: Session, user: User) -> Optional[int]:
    profile = (
        db.query(ResidentProfile).filter(ResidentProfile.user_id == user.user_id).first()
    )
    return profile.resident_id if profile else None


def _maintenance_staff_id(db: Session, user: User) -> Optional[int]:
    staff = (
        db.query(MaintenanceStaff).filter(MaintenanceStaff.user_id == user.user_id).first()
    )
    return staff.staff_id if staff else None


def smart_search(db: Session, user: User, query: str, limit: int = 10) -> SearchResponse:
    q = (query or "").strip()
    if len(q) < 2:
        raise BadRequest("Search query must be at least 2 characters.")
    limit = max(1, min(int(limit or 10), 25))
    role = _role_name(user)
    like = f"%{q}%"

    complaint_stmt = (
        select(Complaint)
        .options(selectinload(Complaint.category))
        .where(Complaint.description.ilike(like))
        .order_by(Complaint.created_at.desc())
        .limit(_SEARCH_CANDIDATE_LIMIT)
    )
    if role == RoleEnum.RESIDENT.value:
        resident_id = _resident_profile_id(db, user)
        if resident_id is None:
            complaint_stmt = complaint_stmt.where(Complaint.complaint_id == -1)
        else:
            complaint_stmt = complaint_stmt.where(Complaint.resident_id == resident_id)
    elif role == RoleEnum.MAINTENANCE.value:
        staff_id = _maintenance_staff_id(db, user)
        if staff_id is None:
            complaint_stmt = complaint_stmt.where(Complaint.complaint_id == -1)
        else:
            complaint_stmt = complaint_stmt.join(MaintenanceTask).where(
                MaintenanceTask.staff_id == staff_id
            )
    elif role == RoleEnum.SECURITY.value:
        # Security has no complaint ownership — announcements only for search.
        complaint_stmt = complaint_stmt.where(Complaint.complaint_id == -1)
    # Admin / Committee: all complaints

    complaints = list(db.execute(complaint_stmt).scalars().unique().all())

    today = ist_now().date()
    ann_stmt = (
        select(Announcement)
        .where(
            Announcement.is_active.is_(True),
            or_(Announcement.expiry_date.is_(None), Announcement.expiry_date >= today),
            or_(
                Announcement.title.ilike(like),
                Announcement.description.ilike(like),
            ),
        )
        .order_by(Announcement.published_at.desc())
        .limit(_SEARCH_CANDIDATE_LIMIT)
    )
    announcements = list(db.execute(ann_stmt).scalars().all())

    candidates: list[SearchResultItem] = []
    for c in complaints:
        cat = c.category.category_name if c.category else "Complaint"
        candidates.append(
            SearchResultItem(
                entity_type="complaint",
                entity_id=c.complaint_id,
                title=f"{cat} · {c.priority or 'medium'}",
                snippet=_truncate(c.description, 180),
            )
        )
    for a in announcements:
        candidates.append(
            SearchResultItem(
                entity_type="announcement",
                entity_id=a.announcement_id,
                title=a.title,
                snippet=_truncate(a.description or a.title, 180),
            )
        )

    if not candidates:
        return SearchResponse(query=q, results=[], reranked=False)

    reranked = False
    ordered = candidates
    latency_ms: Optional[int] = None
    raw_content = ""

    if len(candidates) > _RERANK_THRESHOLD and settings.AI_ENABLED and settings.GROQ_API_KEY:
        try:
            payload = {
                "query": q,
                "candidates": [
                    {
                        "id": f"{item.entity_type}:{item.entity_id}",
                        "title": item.title,
                        "snippet": item.snippet,
                    }
                    for item in candidates
                ],
            }
            messages = [
                {"role": "system", "content": ai_prompts.SEARCH_RERANK_SYSTEM},
                {"role": "user", "content": json.dumps(payload)},
            ]
            raw_content, latency_ms = chat_completion(messages, response_json=True, max_tokens=500)
            parsed = parse_json_content(raw_content)
            by_key = {f"{i.entity_type}:{i.entity_id}": i for i in candidates}
            ordered_ids = parsed.get("ordered_ids") or []
            seen: list[SearchResultItem] = []
            for key in ordered_ids:
                item = by_key.get(str(key))
                if item and item not in seen:
                    seen.append(item)
            for item in candidates:
                if item not in seen:
                    seen.append(item)
            ordered = seen
            reranked = True
            _log_inference(
                db,
                feature="search",
                user_id=user.user_id,
                entity_type=None,
                entity_id=None,
                request_hash=_request_hash({"q": q}),
                latency_ms=latency_ms,
                raw_response=raw_content,
            )
        except ServiceUnavailable:
            # Retrieval-only fallback
            ordered = candidates

    return SearchResponse(query=q, results=ordered[:limit], reranked=reranked)


# ---------------------------------------------------------------------------
# Admin summary
# ---------------------------------------------------------------------------


def _summary_cache_key(payload: ComplaintSummaryRequest) -> str:
    return "ai:summary:" + _request_hash(payload.model_dump())


def summarize_complaints(
    db: Session, user: User, payload: ComplaintSummaryRequest
) -> ComplaintSummaryResponse:
    ensure_ai_enabled()
    cache_key = _summary_cache_key(payload)
    try:
        cached_raw = get_redis_client().get(cache_key)
        if cached_raw:
            data = json.loads(cached_raw)
            data["cached"] = True
            return ComplaintSummaryResponse.model_validate(data)
    except Exception as exc:
        logger.warning("Summary cache read failed: %s", exc)

    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.category),
            selectinload(Complaint.resident).selectinload(ResidentProfile.flat).selectinload(Flat.block),
        )
    )
    if payload.from_date is not None:
        stmt = stmt.where(func.date(Complaint.created_at) >= payload.from_date)
    if payload.to_date is not None:
        stmt = stmt.where(func.date(Complaint.created_at) <= payload.to_date)
    if payload.block_id is not None:
        stmt = (
            stmt.join(ResidentProfile, Complaint.resident_id == ResidentProfile.resident_id)
            .join(Flat, ResidentProfile.flat_id == Flat.flat_id)
            .where(Flat.block_id == payload.block_id)
        )

    complaints = list(db.execute(stmt).scalars().unique().all())
    by_status: Counter[str] = Counter()
    by_priority: Counter[str] = Counter()
    by_category: Counter[str] = Counter()
    flat_counter: Counter[str] = Counter()
    oldest_open_days: Optional[int] = None
    now = ist_now()

    samples: list[str] = []
    for c in complaints:
        by_status[c.status or "unknown"] += 1
        by_priority[_clamp_priority(c.priority)] += 1
        cat_name = c.category.category_name if c.category else "Unknown"
        by_category[cat_name] += 1
        flat = c.resident.flat if c.resident else None
        if flat:
            block_name = flat.block.block_name if flat.block else "?"
            flat_counter[f"{block_name}-{flat.flat_number}"] += 1
        if (c.status or "") in {"open", "assigned", "in_progress"} and c.created_at:
            age = max(0, (now - c.created_at).days)
            if oldest_open_days is None or age > oldest_open_days:
                oldest_open_days = age
        if len(samples) < 8:
            samples.append(_truncate(c.description, 120))

    metrics = ComplaintSummaryMetrics(
        total=len(complaints),
        by_status=dict(by_status),
        by_priority=dict(by_priority),
        by_category=dict(by_category),
        oldest_open_days=oldest_open_days,
        top_flats=[
            {"flat": name, "count": count}
            for name, count in flat_counter.most_common(5)
        ],
    )

    aggregates = {
        "filters": payload.model_dump(mode="json"),
        "metrics": metrics.model_dump(),
        "sample_descriptions": samples,
    }
    messages = [
        {"role": "system", "content": ai_prompts.SUMMARY_SYSTEM},
        {"role": "user", "content": json.dumps(aggregates)},
    ]
    content, latency_ms = chat_completion(messages, response_json=True, max_tokens=900)
    parsed = parse_json_content(content)

    result = ComplaintSummaryResponse(
        metrics=metrics,
        headline=_truncate(str(parsed.get("headline") or "Community complaint summary"), 200),
        narrative=_truncate(str(parsed.get("narrative") or ""), 2000),
        insights=[_truncate(str(x), 240) for x in (parsed.get("insights") or [])][:8],
        recommended_actions=[
            _truncate(str(x), 240) for x in (parsed.get("recommended_actions") or [])
        ][:8],
        cached=False,
    )

    _log_inference(
        db,
        feature="summary",
        user_id=user.user_id,
        entity_type="block" if payload.block_id else None,
        entity_id=payload.block_id,
        request_hash=_request_hash(payload.model_dump()),
        latency_ms=latency_ms,
        raw_response=content,
    )

    try:
        get_redis_client().setex(
            cache_key,
            settings.AI_SUMMARY_CACHE_TTL_SECONDS,
            result.model_dump_json(),
        )
    except Exception as exc:
        logger.warning("Summary cache write failed: %s", exc)

    return result


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------


def _enforce_chat_rate_limit(user_id: int) -> None:
    key = f"ai:chat:rl:{user_id}:{ist_now().strftime('%Y%m%d%H%M')}"
    try:
        client = get_redis_client()
        count = client.incr(key)
        if count == 1:
            client.expire(key, 70)
        if count > settings.AI_CHAT_RATE_LIMIT_PER_MINUTE:
            raise ServiceUnavailable(
                "Chat rate limit exceeded. Please wait a minute and try again."
            )
    except ServiceUnavailable:
        raise
    except Exception as exc:
        # If Redis is down, allow the request rather than hard-failing chat.
        logger.warning("Chat rate limit check failed: %s", exc)


def _build_chat_context(db: Session, user: User) -> list[dict[str, Any]]:
    role = _role_name(user)
    context: list[dict[str, Any]] = []
    today = ist_now().date()

    ann_stmt = (
        select(Announcement)
        .where(
            Announcement.is_active.is_(True),
            or_(Announcement.expiry_date.is_(None), Announcement.expiry_date >= today),
        )
        .order_by(Announcement.published_at.desc())
        .limit(8)
    )
    for a in db.execute(ann_stmt).scalars().all():
        context.append(
            {
                "entity_type": "announcement",
                "entity_id": a.announcement_id,
                "title": a.title,
                "text": _truncate(a.description or "", 240),
            }
        )

    complaint_stmt = (
        select(Complaint)
        .options(selectinload(Complaint.category))
        .order_by(Complaint.created_at.desc())
        .limit(12)
    )
    if role == RoleEnum.RESIDENT.value:
        resident_id = _resident_profile_id(db, user)
        if resident_id is None:
            return context
        complaint_stmt = complaint_stmt.where(Complaint.resident_id == resident_id)
    elif role == RoleEnum.MAINTENANCE.value:
        staff_id = _maintenance_staff_id(db, user)
        if staff_id is None:
            return context
        complaint_stmt = complaint_stmt.join(MaintenanceTask).where(
            MaintenanceTask.staff_id == staff_id
        )
    elif role == RoleEnum.SECURITY.value:
        return context
    # Admin / Committee: recent society-wide complaints (ids + truncated text only)

    for c in db.execute(complaint_stmt).scalars().unique().all():
        context.append(
            {
                "entity_type": "complaint",
                "entity_id": c.complaint_id,
                "title": c.category.category_name if c.category else "Complaint",
                "status": c.status,
                "priority": c.priority,
                "text": _truncate(c.description, 200),
            }
        )
    return context


def chat(db: Session, user: User, messages: list[ChatMessage]) -> ChatResponse:
    ensure_ai_enabled()
    if not messages:
        raise BadRequest("messages must not be empty.")
    if messages[-1].role != "user":
        raise BadRequest("The last message must be from the user.")

    _enforce_chat_rate_limit(user.user_id)
    context = _build_chat_context(db, user)

    # Only pass a short trailing window to the model
    history = [{"role": m.role, "content": m.content} for m in messages[-10:]]
    groq_messages = [
        {"role": "system", "content": ai_prompts.CHAT_SYSTEM},
        {
            "role": "system",
            "content": "CONTEXT:\n" + json.dumps({"role": _role_name(user), "items": context}),
        },
        *history,
    ]
    content, latency_ms = chat_completion(groq_messages, response_json=True, max_tokens=700)
    parsed = parse_json_content(content)

    allowed = {(i["entity_type"], int(i["entity_id"])) for i in context}
    citations: list[ChatCitation] = []
    for raw in parsed.get("citations") or []:
        try:
            et = str(raw.get("entity_type"))
            eid = int(raw.get("entity_id"))
        except (TypeError, ValueError, AttributeError):
            continue
        if et in {"complaint", "announcement"} and (et, eid) in allowed:
            citations.append(ChatCitation(entity_type=et, entity_id=eid))

    result = ChatResponse(
        reply=_truncate(
            _plain_chat_reply(
                str(parsed.get("reply") or "I don't know based on available community records.")
            ),
            4000,
        ),
        citations=citations[:10],
        refused=bool(parsed.get("refused", False)),
    )

    _log_inference(
        db,
        feature="chat",
        user_id=user.user_id,
        entity_type=None,
        entity_id=None,
        request_hash=_request_hash({"last": messages[-1].content}),
        latency_ms=latency_ms,
        raw_response=content,
    )
    return result
