from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_resident
from app.models.apartment import ResidentProfile
from app.models.auth import User
from app.schemas.user_schema import ResidentProfileOut, ResidentSelfUpdate
from app.services import profile_service
from app.utils.api_error import NotFound
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/residents/me", tags=["profile"])


def _get_own_resident_profile(current_user: User) -> ResidentProfile:
    # require_resident already guarantees role == Resident, but a
    # resident_profile row could in principle be missing (e.g. old data) --
    # fail clearly rather than crashing on a None attribute access.
    if current_user.resident_profile is None:
        raise NotFound("Resident profile not found for this account.")
    return current_user.resident_profile


@router.patch("")
def update_my_profile(
    payload: ResidentSelfUpdate,
    current_user: User = Depends(require_resident),
    db: Session = Depends(get_db),
):
    """Resident self-service: update phone and profile contact fields."""
    profile = _get_own_resident_profile(current_user)
    data = payload.model_dump(exclude_unset=True)
    if "phone" in data:
        current_user.phone = data.pop("phone")
    for field, value in data.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)
    return success_response(
        data={
            "phone": current_user.phone,
            "resident_profile": ResidentProfileOut.model_validate(profile),
        },
        message="Profile updated.",
    )


@router.post("/profile-picture")
def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(require_resident),
    db: Session = Depends(get_db),
):
    """Resident-only. Replaces any existing profile picture."""
    profile = _get_own_resident_profile(current_user)
    updated = profile_service.upload_profile_picture(db, profile, file)
    return success_response(
        data=ResidentProfileOut.model_validate(updated),
        message="Profile picture updated successfully.",
    )


@router.delete("/profile-picture")
def remove_profile_picture(
    current_user: User = Depends(require_resident),
    db: Session = Depends(get_db),
):
    profile = _get_own_resident_profile(current_user)
    updated = profile_service.delete_profile_picture(db, profile)
    return success_response(
        data=ResidentProfileOut.model_validate(updated),
        message="Profile picture removed.",
    )
