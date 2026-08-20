from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_resident_profile,
    get_security_guard_profile,
    require_admin_or_committee,
    require_verified_resident,
    require_verified_security,
)
from app.models.auth import User
from app.models.apartment import ResidentProfile
from app.models.staff import SecurityGuard
from app.models.visitor import Visitor
from app.services import visitor_service
from app.schemas.visitor_schema import (
    VisitorLogOut,
    VisitorOtpVerifyRequest,
    VisitorPreRegisterRequest,
    VisitorRequestCreate,
    VisitorRequestOut,
)
from app.utils.api_response import success_response
from app.utils.otp import generate_otp

router = APIRouter(prefix="/api/v1/visitors", tags=["visitors"])


def _request_out(request, otp: str | None = None) -> VisitorRequestOut:
    visitor = getattr(request, "visitor", None)
    return VisitorRequestOut(
        request_id=request.request_id,
        resident_id=request.resident_id,
        visitor_id=request.visitor_id,
        expected_date=request.expected_date,
        expected_time=request.expected_time,
        status=request.status,
        approved_at=request.approved_at,
        otp=otp if otp is not None else request.otp,
        created_at=request.created_at,
        visitor_name=visitor.visitor_name if visitor else None,
        visitor_phone=visitor.phone if visitor else None,
        visitor_type=visitor.visitor_type if visitor else None,
    )


def _log_out(log) -> VisitorLogOut:
    visitor = getattr(log, "visitor", None)
    resident = getattr(log, "resident", None)
    flat = getattr(resident, "flat", None) if resident else None
    return VisitorLogOut(
        log_id=log.log_id,
        visitor_id=log.visitor_id,
        resident_id=log.resident_id,
        security_guard_id=log.security_guard_id,
        request_id=log.request_id,
        otp_verified=log.otp_verified,
        entry_time=log.entry_time,
        exit_time=log.exit_time,
        created_at=log.created_at,
        visitor_name=visitor.visitor_name if visitor else None,
        visitor_phone=visitor.phone if visitor else None,
        visitor_type=visitor.visitor_type if visitor else None,
        resident_name=resident.user.full_name if resident and resident.user else None,
        flat_number=flat.flat_number if flat else None,
    )


@router.post("/pre-register")
def pre_register_visitor(
    payload: VisitorPreRegisterRequest,
    current_user: User = Depends(require_verified_resident),
    profile: ResidentProfile = Depends(get_resident_profile),
    db: Session = Depends(get_db),
):
    """
    BUGFIX: this used to declare visitor_name/visitor_phone/visitor_type/
    expected_date/expected_time as bare function parameters with NO type
    annotations on the last two -- FastAPI needs an annotation to build a
    validation field for every non-Depends parameter, so this failed at
    route registration. Replaced with a proper request body
    (VisitorPreRegisterRequest).
    """
    visitor = db.query(Visitor).filter(Visitor.phone == payload.visitor_phone).first()
    if visitor is None:
        visitor = Visitor(
            visitor_name=payload.visitor_name,
            phone=payload.visitor_phone,
            visitor_type=payload.visitor_type,
        )
        db.add(visitor)
        db.flush()

    request_payload = VisitorRequestCreate(
        resident_id=profile.resident_id,
        visitor_id=visitor.visitor_id,
        expected_date=payload.expected_date,
        expected_time=payload.expected_time,
    )
    otp = generate_otp(6)
    request = visitor_service.create_visitor_request(db, request_payload, otp)
    # Reload with visitor relationship for denormalized fields
    db.refresh(request)
    if request.visitor is None:
        request.visitor = visitor
    data = _request_out(request, otp=otp)
    return success_response(data=data, message="Visitor pre-registered. Share the OTP with your visitor.")


@router.get("/requests")
def list_my_requests(
    current_user: User = Depends(require_verified_resident),
    profile: ResidentProfile = Depends(get_resident_profile),
    db: Session = Depends(get_db),
):
    requests = visitor_service.list_visitor_requests(db, resident_id=profile.resident_id)
    return success_response(data=[_request_out(r) for r in requests])


@router.post("/{request_id}/deny")
def deny_visitor_request(
    request_id: int,
    current_user: User = Depends(require_verified_resident),
    profile: ResidentProfile = Depends(get_resident_profile),
    db: Session = Depends(get_db),
):
    """Gap-fill (CODE_REVIEW.md 3.2): lets the resident who
    pre-registered a visitor call it off before they arrive."""
    request = visitor_service.deny_visitor_request(db, request_id, profile.resident_id)
    return success_response(data=_request_out(request), message="Visitor request denied.")


@router.post("/{request_id}/verify-otp")
def verify_otp(
    request_id: int,
    payload: VisitorOtpVerifyRequest,
    current_user: User = Depends(require_verified_security),
    guard: SecurityGuard = Depends(get_security_guard_profile),
    db: Session = Depends(get_db),
):
    # BUGFIX: previously ignored `current_user`/whoever was actually
    # authenticated and logged the verification against
    # db.query(SecurityGuard).first() -- always the same arbitrary guard.
    log = visitor_service.verify_visitor_otp(db, request_id, payload.otp, guard.guard_id)
    return success_response(data={"log_id": log.log_id, "otp_verified": log.otp_verified})


@router.post("/logs/{log_id}/exit")
def log_exit(
    log_id: int,
    current_user: User = Depends(require_verified_security),
    db: Session = Depends(get_db),
):
    log = visitor_service.log_visitor_exit(db, log_id)
    return success_response(data={"log_id": log.log_id, "exit_time": log.exit_time})


@router.get("/logs")
def list_visitor_logs(_staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    logs = visitor_service.list_visitor_logs(db)
    return success_response(data=[_log_out(l) for l in logs])