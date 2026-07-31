from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_resident, require_security
from app.core.dependencies import get_resident_profile
from app.models.auth import User
from app.models.apartment import ResidentProfile
from app.models.visitor import Visitor
from app.services import visitor_service
from app.schemas.visitor_schema import (
    VisitorOut,
    VisitorRequestCreate,
    VisitorRequestOut,
    VisitorLogOut,
)
from app.utils.otp import generate_otp

router = APIRouter(prefix="/api/v1/visitors", tags=["visitors"])


@router.post("/pre-register", response_model=VisitorRequestOut)
def pre_register_visitor(
    visitor_name: str,
    visitor_phone: str,
    visitor_type: str,
    expected_date,
    expected_time,
    current_user: User = Depends(require_resident),
    profile: ResidentProfile = Depends(get_resident_profile),
    db: Session = Depends(get_db),
):
    visitor = db.query(Visitor).filter(Visitor.phone == visitor_phone).first()
    if visitor is None:
        visitor = Visitor(visitor_name=visitor_name, phone=visitor_phone, visitor_type=visitor_type)
        db.add(visitor)
        db.flush()
    visitor_id = visitor.visitor_id

    from app.schemas.visitor_schema import VisitorRequestCreate
    payload = VisitorRequestCreate(
        resident_id=profile.resident_id,
        visitor_id=visitor_id,
        expected_date=expected_date,
        expected_time=expected_time,
    )
    otp = generate_otp(6)
    request = visitor_service.create_visitor_request(db, payload, otp)
    return VisitorRequestOut(
        request_id=request.request_id,
        resident_id=request.resident_id,
        visitor_id=request.visitor_id,
        expected_date=request.expected_date,
        expected_time=request.expected_time,
        status=request.status,
        approved_at=request.approved_at,
        otp=otp,
        created_at=request.created_at,
    )


@router.get("/requests", response_model=list[VisitorRequestOut])
def list_my_requests(current_user: User = Depends(require_resident), profile: ResidentProfile = Depends(get_resident_profile), db: Session = Depends(get_db)):
    return visitor_service.list_visitor_requests(db, resident_id=profile.resident_id)


@router.post("/{request_id}/verify-otp")
def verify_otp(request_id: int, otp: str = Body(..., embed=True), current_user: User = Depends(require_security), db: Session = Depends(get_db)):
    log = visitor_service.verify_visitor_otp(db, request_id, otp)
    return {"log_id": log.log_id, "otp_verified": log.otp_verified}


@router.post("/logs/{log_id}/exit")
def log_exit(log_id: int, current_user: User = Depends(require_security), db: Session = Depends(get_db)):
    log = visitor_service.log_visitor_exit(db, log_id)
    return {"log_id": log.log_id, "exit_time": log.exit_time}


@router.get("/logs", response_model=list[VisitorLogOut])
def list_visitor_logs(_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return visitor_service.list_visitor_logs(db)
