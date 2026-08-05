from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mixins import ist_now
from app.models.visitor import Visitor, VisitorRequest, VisitorLog
from app.models.staff import SecurityGuard
from app.schemas.visitor_schema import VisitorCreate, VisitorRequestCreate
from app.services import notification_service
from app.utils.api_error import BadRequest, Conflict, NotFound
from app.utils.otp import hash_otp, verify_otp


def create_visitor(db: Session, payload: VisitorCreate) -> Visitor:
    visitor = Visitor(**payload.model_dump())
    db.add(visitor)
    db.commit()
    db.refresh(visitor)
    return visitor


def get_visitor(db: Session, visitor_id: int) -> Optional[Visitor]:
    result = db.execute(select(Visitor).where(Visitor.visitor_id == visitor_id))
    return result.scalar_one_or_none()


def create_visitor_request(db: Session, payload: VisitorRequestCreate, otp: str) -> VisitorRequest:
    request = VisitorRequest(
        **payload.model_dump(),
        otp=hash_otp(otp),
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def list_visitor_requests(db: Session, resident_id: Optional[int] = None) -> list[VisitorRequest]:
    stmt = select(VisitorRequest)
    if resident_id is not None:
        stmt = stmt.where(VisitorRequest.resident_id == resident_id)
    result = db.execute(stmt.order_by(VisitorRequest.created_at.desc()))
    return list(result.scalars().all())


def get_visitor_request(db: Session, request_id: int) -> Optional[VisitorRequest]:
    result = db.execute(select(VisitorRequest).where(VisitorRequest.request_id == request_id))
    return result.scalar_one_or_none()


def verify_visitor_otp(db: Session, request_id: int, otp: str, guard_id: int) -> VisitorLog:
    """
    `guard_id` is the SecurityGuard row of whoever is actually calling
    this (see app.core.dependencies.get_security_guard_profile).

    BUGFIX: this used to do `db.query(SecurityGuard).first()` and log
    the verification against whichever guard happened to be first in
    the table, completely ignoring who was actually authenticated and
    performing the check -- the visitor log's security_guard_id was
    meaningless. It's now the caller's own guard row, and we validate it
    actually exists rather than assuming.
    """
    request = get_visitor_request(db, request_id)
    if request is None:
        raise NotFound("Visitor request not found.")
    if request.status == "arrived":
        raise BadRequest("Visitor already arrived.")
    if request.status == "denied":
        raise BadRequest("Visitor request was denied.")

    if not verify_otp(otp, request.otp):
        raise BadRequest("Invalid OTP.")

    guard = db.query(SecurityGuard).filter(SecurityGuard.guard_id == guard_id).first()
    if guard is None:
        raise NotFound("Security guard profile not found for this account.")

    request.status = "arrived"
    request.approved_at = ist_now()

    log = VisitorLog(
        visitor_id=request.visitor_id,
        resident_id=request.resident_id,
        security_guard_id=guard.guard_id,
        request_id=request.request_id,
        otp_verified=True,
        entry_time=ist_now(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    notification_service.create_notification(
        db,
        user_id=request.resident.user_id,
        notification_type="visitor_arrival",
        title="Visitor arrived",
        message=f"Your visitor has arrived and been verified at the gate.",
    )
    return log


def log_visitor_exit(db: Session, log_id: int) -> VisitorLog:
    log = get_visitor_log(db, log_id)
    if log is None:
        raise NotFound("Visitor log not found.")
    if log.exit_time is not None:
        raise Conflict("Exit was already logged for this visit.")
    log.exit_time = ist_now()
    db.commit()
    db.refresh(log)
    return log


def get_visitor_log(db: Session, log_id: int) -> Optional[VisitorLog]:
    result = db.execute(select(VisitorLog).where(VisitorLog.log_id == log_id))
    return result.scalar_one_or_none()


def list_visitor_logs(db: Session) -> list[VisitorLog]:
    result = db.execute(select(VisitorLog).order_by(VisitorLog.created_at.desc()))
    return list(result.scalars().all())