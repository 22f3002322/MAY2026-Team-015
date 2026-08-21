from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_committee
from app.models.auth import User
from app.schemas.auth_schema import (
    ChangePasswordRequest,
    CreateCommitteeRequest,
    CreateCommitteeResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    PendingUserOut,
    RefreshRequest,
    ResetPasswordRequest,
    SignupRequest,
    SignupResponse,
    VerifyUserRequest
)
from app.schemas.user_schema import MaintenanceProfileOut, MeResponse, ResidentProfileOut, SecurityProfileOut
from app.services import auth_service
from app.utils.api_response import success_response
from app.utils.redis_client import get_redis_client

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def get_redis():
    return get_redis_client()


def _to_resident_profile_out(profile) -> ResidentProfileOut | None:
    if profile is None:
        return None
    flat = profile.flat
    return ResidentProfileOut(
        resident_id=profile.resident_id,
        flat_id=profile.flat_id,
        flat_number=flat.flat_number if flat else None,
        block_name=flat.block.block_name if flat and flat.block else None,
        emergency_contact=profile.emergency_contact,
        alternate_phone=profile.alternate_phone,
        occupation=profile.occupation,
        profile_image=profile.profile_image,
    )


def _to_me_response(user: User) -> MeResponse:
    return MeResponse(
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role.role_name.value,
        is_active=user.is_active,
        is_verified=user.is_verified,
        resident_profile=_to_resident_profile_out(user.resident_profile),
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


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_service.change_password(
        db, current_user, payload.current_password, payload.new_password
    )
    return success_response(message="Password changed successfully. Please log in again.")


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return success_response(data=_to_me_response(current_user))


# --------------------------------------------------------------------------
# Committee verification workflow
# --------------------------------------------------------------------------
@router.get("/pending-verifications")
def pending_verifications(committee: User = Depends(require_committee), db: Session = Depends(get_db)):
    users = auth_service.list_pending_verifications(db)
    data = []
    for u in users:
        flat_id = None
        flat_number = None
        block_name = None
        profile = u.resident_profile
        if profile is not None:
            flat_id = profile.flat_id
            if profile.flat is not None:
                flat_number = profile.flat.flat_number
                if profile.flat.block is not None:
                    block_name = profile.flat.block.block_name
        data.append(
            PendingUserOut(
                user_id=u.user_id,
                full_name=u.full_name,
                email=u.email,
                phone=u.phone,
                role=u.role.role_name.value,
                created_at=u.created_at.isoformat() if u.created_at else None,
                flat_id=flat_id,
                flat_number=flat_number,
                block_name=block_name,
            )
        )
    return success_response(data=data, message=f"{len(data)} account(s) pending verification.")


@router.post("/verify/{user_id}")
def verify(
    user_id: int,
    payload: Optional[VerifyUserRequest] = None,
    _committee: User = Depends(require_committee),
    db: Session = Depends(get_db),
):
    """Verifies the account. For Residents, verification also performs
    move-in when a flat is available (from signup or from flat_id in the
    body). Pass {"occupancy_type": "Owner"|"Rental", "flat_id": <id>} —
    flat_id is required when the resident has no flat yet."""
    occupancy_type = payload.occupancy_type if payload else None
    flat_id = payload.flat_id if payload else None
    user = auth_service.verify_user(
        db, user_id, occupancy_type=occupancy_type, flat_id=flat_id
    )
    return success_response(data=_to_me_response(user), message="User verified successfully.")


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