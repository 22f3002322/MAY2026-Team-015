from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.visitor import Visitor, VisitorRequest, VisitorLog
from app.models.staff import SecurityGuard
from app.models.apartment import ResidentProfile
from app.schemas.visitor import (
    VisitorCreate,
    VisitorRequestCreate,
    VisitorRequestOut,
    VisitorLogCreate,
    VisitorLogOut,
)
from app.utils.otp import generate_otp, hash_otp, verify_otp


async def create_visitor(db: AsyncSession, payload: VisitorCreate) -> Visitor:
    visitor = Visitor(**payload.model_dump())
    db.add(visitor)
    await db.commit()
    await db.refresh(visitor)
    return visitor


async def get_visitor(db: AsyncSession, visitor_id: int) -> Optional[Visitor]:
    result = await db.execute(select(Visitor).where(Visitor.visitor_id == visitor_id))
    return result.scalar_one_or_none()


async def create_visitor_request(db: AsyncSession, payload: VisitorRequestCreate, otp: str) -> VisitorRequest:
    request = VisitorRequest(
        **payload.model_dump(),
        otp=hash_otp(otp),
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


async def list_visitor_requests(db: AsyncSession, resident_id: Optional[int] = None) -> list[VisitorRequest]:
    stmt = select(VisitorRequest)
    if resident_id is not None:
        stmt = stmt.where(VisitorRequest.resident_id == resident_id)
    result = await db.execute(stmt.order_by(VisitorRequest.created_at.desc()))
    return list(result.scalars().all())


async def get_visitor_request(db: AsyncSession, request_id: int) -> Optional[VisitorRequest]:
    result = await db.execute(select(VisitorRequest).where(VisitorRequest.request_id == request_id))
    return result.scalar_one_or_none()


async def verify_visitor_otp(db: AsyncSession, request_id: int, otp: str) -> VisitorLog:
    request = await get_visitor_request(db, request_id)
    if request is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Visitor request not found")
    if request.status == "arrived":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Visitor already arrived")
    if request.status == "denied":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Visitor request was denied")

    if not verify_otp(otp, request.otp):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid OTP")

    request.status = "arrived"
    request.approved_at = datetime.utcnow()

    guard = await db.execute(select(SecurityGuard).limit(1))
    guard = guard.scalar_one_or_none()
    if guard is None:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "No security guard available")

    log = VisitorLog(
        visitor_id=request.visitor_id,
        resident_id=request.resident_id,
        security_guard_id=guard.guard_id,
        request_id=request.request_id,
        otp_verified=True,
        entry_time=datetime.utcnow(),
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def log_visitor_exit(db: AsyncSession, log_id: int) -> VisitorLog:
    log = await get_visitor_log(db, log_id)
    if log is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Visitor log not found")
    log.exit_time = datetime.utcnow()
    await db.commit()
    await db.refresh(log)
    return log


async def get_visitor_log(db: AsyncSession, log_id: int) -> Optional[VisitorLog]:
    result = await db.execute(select(VisitorLog).where(VisitorLog.log_id == log_id))
    return result.scalar_one_or_none()


async def list_visitor_logs(db: AsyncSession) -> list[VisitorLog]:
    result = await db.execute(select(VisitorLog).order_by(VisitorLog.created_at.desc()))
    return list(result.scalars().all())
