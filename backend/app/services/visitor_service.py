from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.mixins import ist_now

from app.models.visitor import Visitor, VisitorRequest, VisitorLog
from app.models.staff import SecurityGuard
from app.models.apartment import ResidentProfile
from app.schemas.visitor_schema import (
    VisitorCreate,
    VisitorRequestCreate,
    VisitorRequestOut,
    VisitorLogCreate,
    VisitorLogOut,
)
from app.utils.otp import generate_otp, hash_otp, verify_otp


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


def verify_visitor_otp(db: Session, request_id: int, otp: str) -> VisitorLog:
    request = get_visitor_request(db, request_id)
    if request is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Visitor request not found")
    if request.status == "arrived":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Visitor already arrived")
    if request.status == "denied":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Visitor request was denied")

    if not verify_otp(otp, request.otp):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid OTP")

    request.status = "arrived"
    request.approved_at = ist_now()

    guard = db.query(SecurityGuard).first()
    if guard is None:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "No security guard available")

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
    return log


def log_visitor_exit(db: Session, log_id: int) -> VisitorLog:
    log = get_visitor_log(db, log_id)
    if log is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Visitor log not found")
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
