"""
Module 1.10 — AI Community Intelligence HTTP API.

Thin router: auth Depends + ai_service + success_response.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_admin_or_committee,
)
from app.models.auth import RoleEnum, User
from app.schemas.ai_schema import (
    ChatRequest,
    ClassifyRequest,
    ComplaintSummaryRequest,
)
from app.services import ai_service
from app.utils.api_error import NotAuthorized
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


def _authorize_classify(user: User = Depends(get_current_user)) -> User:
    role = user.role.role_name.value
    if role in (RoleEnum.ADMIN.value, RoleEnum.COMMITTEE.value):
        return user
    if role == RoleEnum.RESIDENT.value:
        if not user.is_verified:
            raise NotAuthorized(
                "Your account is pending verification by a committee member. "
                "This action isn't available until then."
            )
        return user
    raise NotAuthorized("Permission denied.")


@router.post("/complaints/classify")
def classify_complaint(
    payload: ClassifyRequest,
    user: User = Depends(_authorize_classify),
    db: Session = Depends(get_db),
):
    result = ai_service.classify_complaint(db, user, payload)
    return success_response(data=result.model_dump(), message="Complaint classified.")


@router.get("/complaints/{complaint_id}/staff-recommendations")
def staff_recommendations(
    complaint_id: int,
    user: User = Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    result = ai_service.recommend_staff_for_complaint(db, user, complaint_id)
    return success_response(data=result.model_dump(), message="Staff recommendations ready.")


@router.get("/search")
def smart_search(
    q: str = Query(..., min_length=2, max_length=200),
    limit: int = Query(10, ge=1, le=25),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = ai_service.smart_search(db, user, q, limit=limit)
    return success_response(data=result.model_dump())


@router.post("/reports/complaints/summary")
def complaint_summary(
    payload: ComplaintSummaryRequest,
    user: User = Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    result = ai_service.summarize_complaints(db, user, payload)
    return success_response(data=result.model_dump(), message="Summary generated.")


@router.post("/chat")
def chat(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = ai_service.chat(db, user, payload.messages)
    return success_response(data=result.model_dump())
