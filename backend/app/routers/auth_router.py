from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_admin_or_committee, require_committee
from app.models.auth import User
from app.schemas.auth_schema import (
    CreateCommitteeRequest,
    CreateCommitteeResponse,
    DeactivateRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    PendingUserOut,
    ReactivateRequest,
    RefreshRequest,
    ResetPasswordRequest,
    SignupRequest,
    SignupResponse,
    UserOut,
    VerifyUserRequest
)
from app.schemas.user_schema import MaintenanceProfileOut, MeResponse, ResidentProfileOut, SecurityProfileOut
from app.services import auth_service
from app.utils.api_response import success_response
from app.utils.redis_client import get_redis_client

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def get_redis():
    return get_redis_client()


def _to_me_response(user: User) -> MeResponse:
    return MeResponse(
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role.role_name.value,
        is_active=user.is_active,
        is_verified=user.is_verified,
        resident_profile=ResidentProfileOut.model_validate(user.resident_profile) if user.resident_profile else None,
        maintenance_profile=MaintenanceProfileOut.model_validate(user.maintenance_staff_profile)
        if user.maintenance_staff_profile
        else None,
        security_profile=SecurityProfileOut.model_validate(user.security_guard_profile)
        if user.security_guard_profile
        else None,
    )


# --------------------------------------------------------------------------
# Account creation
# --------------------------------------------------------------------------
@router.post("/register-committee")
def register_committee(
    payload: CreateCommitteeRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only. The ONLY way a Committee account gets created."""
    user, initial_password = auth_service.create_committee_member(db, payload)
    data = CreateCommitteeResponse(
        user_id=user.user_id,
        email=user.email,
        role=user.role.role_name.value,
        initial_password=initial_password,
    )
    return success_response(data=data, message="Committee member created successfully.")


@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Public. Self-registration for Resident / Maintenance / Security.
    Starts unverified -- a Committee member must call POST /verify/{user_id}."""
    user = auth_service.signup_user(db, payload)
    data = SignupResponse(
        user_id=user.user_id, email=user.email, role=user.role.role_name.value, is_verified=user.is_verified
    )
    return success_response(
        data=data,
        message="Registered successfully. A committee member must verify your account before it's fully active.",
    )


# --------------------------------------------------------------------------
# Session
# --------------------------------------------------------------------------
@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    access_token, refresh_token = auth_service.issue_token_pair(db, user)
    data = LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role.role_name.value,
        is_verified=user.is_verified,
    )
    return success_response(data=data, message="Login successful.")


@router.post("/refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    user, access_token, refresh_token = auth_service.rotate_refresh_token(db, payload.refresh_token)
    data = LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role.role_name.value,
        is_verified=user.is_verified,
    )
    return success_response(data=data, message="Token refreshed.")


@router.post("/logout")
def logout(payload: LogoutRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service.revoke_refresh_token(db, payload.refresh_token)
    return success_response(message="Logged out.")


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db), redis=Depends(get_redis)):
    auth_service.start_password_reset(db, redis, payload.email)
    return success_response(message="If that email exists, a password reset link has been sent.")


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db), redis=Depends(get_redis)):
    auth_service.complete_password_reset(db, redis, payload.token, payload.new_password)
    return success_response(message="Password reset successfully. Please log in.")


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return success_response(data=_to_me_response(current_user))


# --------------------------------------------------------------------------
# Committee verification workflow
# --------------------------------------------------------------------------
@router.get("/pending-verifications")
def pending_verifications(committee: User = Depends(require_committee), db: Session = Depends(get_db)):
    users = auth_service.list_pending_verifications(db)
    data = [
        PendingUserOut(
            user_id=u.user_id,
            full_name=u.full_name,
            email=u.email,
            phone=u.phone,
            role=u.role.role_name.value,
            created_at=u.created_at.isoformat() if u.created_at else None,
        )
        for u in users
    ]
    return success_response(data=data, message=f"{len(data)} account(s) pending verification.")


@router.post("/verify/{user_id}")
def verify(
    user_id: int,
    payload: Optional[VerifyUserRequest] = None,
    _committee: User = Depends(require_committee),
    db: Session = Depends(get_db),
):
    """Verifies the account. If the user is a Resident who selected a
    flat at signup, this is also the moment they're officially moved in
    (occupancy_history row created, flat flipped to occupied) --
    optionally pass {"occupancy_type": "Owner"|"Rental"} in the body;
    defaults to "Owner" if omitted. Ignored for Maintenance/Security or a
    Resident with no flat_id set."""
    occupancy_type = payload.occupancy_type if payload else None
    user = auth_service.verify_user(db, user_id, occupancy_type=occupancy_type)
    return success_response(data=_to_me_response(user), message="User verified successfully.")


# --------------------------------------------------------------------------
# User management (Admin and Committee)
# --------------------------------------------------------------------------
router_users = APIRouter(prefix="/api/v1/users", tags=["users"])


@router_users.get("")
def list_users(
    role: Optional[str] = None,
    is_verified: Optional[bool] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    _staff: User = Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    users = auth_service.list_users(db, role=role, is_verified=is_verified, is_active=is_active, search=search)
    data = [
        UserOut(
            user_id=u.user_id,
            full_name=u.full_name,
            email=u.email,
            phone=u.phone,
            role=u.role.role_name.value,
            is_active=u.is_active,
            is_verified=u.is_verified,
            created_at=u.created_at.isoformat() if u.created_at else None,
        )
        for u in users
    ]
    return success_response(data=data)


@router_users.post("/{user_id}/deactivate")
def deactivate_user_endpoint(
    user_id: int,
    _staff: User = Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    user = auth_service.deactivate_user(db, user_id, actor_user_id=_staff.user_id)
    return success_response(data=UserOut(
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role.role_name.value,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat() if user.created_at else None,
    ), message="User deactivated.")


@router_users.post("/{user_id}/reactivate")
def reactivate_user_endpoint(
    user_id: int,
    _staff: User = Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    user = auth_service.reactivate_user(db, user_id)
    return success_response(data=UserOut(
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role.role_name.value,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat() if user.created_at else None,
    ), message="User reactivated.")


# --------------------------------------------------------------------------
# Account deactivation / reactivation
#
# BUGFIX (CODE_REVIEW.md 1.5): no endpoint anywhere ever wrote
# is_active=False -- the only way to suspend a bad actor's access was a
# manual DB edit. Admin-only (not Admin/Committee): this is a stronger
# action than day-to-day account verification (which is deliberately
# Committee-only elsewhere in this router), since it can suspend anyone
# including Committee/Security/Maintenance accounts.
# --------------------------------------------------------------------------
@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only. Suspends login access immediately (revokes every
    refresh token the user currently holds); doesn't delete any data.
    An admin can't deactivate their own account."""
    user = auth_service.deactivate_user(db, user_id, admin.user_id)
    return success_response(data=_to_me_response(user), message="Account deactivated.")


@router.post("/users/{user_id}/reactivate")
def reactivate_user(
    user_id: int,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin-only. Restores login access for a previously deactivated account."""
    user = auth_service.reactivate_user(db, user_id)
    return success_response(data=_to_me_response(user), message="Account reactivated.")