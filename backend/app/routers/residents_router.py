"""
BUGFIX / gap-fill: the backend README documents a full
`/api/v1/residents` router (directory, profile edit, move-in/move-out,
occupancy history) and every function it needs already exists in
apartment_service.py -- but no router file wired any of it up, so none
of these endpoints actually existed. This is that router.

Distinct from /api/v1/residents/me/... (profile_router.py), which is a
Resident managing their own profile picture.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin_or_committee
from app.models.apartment import ResidentProfile
from app.schemas.apartment_schema import (
    MoveInRequest,
    MoveOutRequest,
    OccupancyHistoryOut,
    ResidentDirectoryOut,
    ResidentProfileUpdate,
)
from app.services import apartment_service
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/residents", tags=["residents"])


def _to_directory_out(profile: ResidentProfile) -> ResidentDirectoryOut:
    flat = profile.flat
    return ResidentDirectoryOut(
        resident_id=profile.resident_id,
        user_id=profile.user_id,
        full_name=profile.user.full_name,
        email=profile.user.email,
        phone=profile.user.phone,
        is_verified=profile.user.is_verified,
        flat_id=profile.flat_id,
        flat_number=flat.flat_number if flat else None,
        block_name=flat.block.block_name if flat and flat.block else None,
        occupation=profile.occupation,
        emergency_contact=profile.emergency_contact,
        alternate_phone=profile.alternate_phone,
    )


@router.get("")
def list_residents(
    block_id: Optional[int] = Query(default=None),
    flat_id: Optional[int] = Query(default=None),
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    residents = apartment_service.list_residents(db, block_id=block_id, flat_id=flat_id)
    return success_response(data=[_to_directory_out(r) for r in residents])


@router.get("/{resident_id}")
def get_resident(resident_id: int, _staff=Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    profile = apartment_service.get_resident_profile(db, resident_id)
    return success_response(data=_to_directory_out(profile))


@router.patch("/{resident_id}")
def update_resident(
    resident_id: int,
    payload: ResidentProfileUpdate,
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    profile = apartment_service.update_resident_profile(db, resident_id, payload)
    return success_response(data=_to_directory_out(profile), message="Resident profile updated.")


@router.post("/{resident_id}/move-in")
def move_in(
    resident_id: int,
    payload: MoveInRequest,
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    occupancy = apartment_service.move_in(
        db, resident_id, payload.flat_id, payload.occupancy_type, payload.move_in_date
    )
    return success_response(data=OccupancyHistoryOut.model_validate(occupancy), message="Resident moved in.")


@router.post("/{resident_id}/move-out")
def move_out(
    resident_id: int,
    payload: MoveOutRequest,
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    occupancy = apartment_service.move_out(db, resident_id, payload.move_out_date)
    return success_response(data=OccupancyHistoryOut.model_validate(occupancy), message="Resident moved out.")


@router.get("/{resident_id}/occupancy-history")
def occupancy_history(resident_id: int, _staff=Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    history = apartment_service.occupancy_history_for_resident(db, resident_id)
    return success_response(data=[OccupancyHistoryOut.model_validate(h) for h in history])
