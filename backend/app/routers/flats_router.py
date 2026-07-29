from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin_or_committee
from app.schemas.apartment_schema import FlatCreate, FlatDetailOut, FlatOut, FlatUpdate, ResidentSummaryOut
from app.services import apartment_service
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/flats", tags=["apartments"])


@router.post("")
def create_flat(
    payload: FlatCreate,
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    """Admin/Committee only."""
    flat = apartment_service.create_flat(db, payload)
    return success_response(data=FlatOut.model_validate(flat), message="Flat created successfully.")


@router.get("")
def list_flats(
    block_id: Optional[int] = Query(default=None),
    occupancy_status: Optional[str] = Query(default=None),
    flat_number: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Deliberately PUBLIC (no auth) -- this is how the signup form resolves
    a flat_number a not-yet-registered resident types in to a flat_id
    (e.g. GET /api/v1/flats?block_id=1&flat_number=101), which has to
    work before they have any credentials. Only structural info is
    returned here (FlatOut has no resident names/contact details) --
    that stays behind GET /{flat_id}, which IS authenticated.
    """
    flats = apartment_service.list_flats(
        db, block_id=block_id, occupancy_status=occupancy_status, flat_number=flat_number
    )
    return success_response(data=[FlatOut.model_validate(f) for f in flats])


@router.get("/{flat_id}")
def get_flat(flat_id: int, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Authenticated (any role) -- unlike the list endpoint above, this
    includes current_residents (names/phone/email), which is why it
    isn't public."""
    flat = apartment_service.get_flat(db, flat_id)
    residents = apartment_service.current_residents_of_flat(db, flat_id)
    data = FlatDetailOut(
        **FlatOut.model_validate(flat).model_dump(),
        current_residents=[
            ResidentSummaryOut(
                resident_id=r.resident_id,
                full_name=r.user.full_name,
                phone=r.user.phone,
                email=r.user.email,
            )
            for r in residents
        ],
    )
    return success_response(data=data)


@router.patch("/{flat_id}")
def update_flat(
    flat_id: int,
    payload: FlatUpdate,
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    """Admin/Committee only. occupancy_status isn't editable here -- it's
    derived from occupancy_history via move-in/move-out."""
    flat = apartment_service.update_flat(db, flat_id, payload)
    return success_response(data=FlatOut.model_validate(flat), message="Flat updated successfully.")