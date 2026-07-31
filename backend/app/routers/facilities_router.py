from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_committee, require_resident
from app.core.dependencies import get_resident_profile
from app.models.auth import User
from app.models.apartment import ResidentProfile
from app.models.auth import RoleEnum
from app.services import booking_service
from app.schemas.facility_schema import (
    FacilityCreate,
    FacilityOut,
    FacilityUpdate,
    FacilityBookingCreate,
    FacilityBookingOut,
    FacilityBookingUpdate,
)

router = APIRouter(prefix="/api/v1/admin/facilities", tags=["facilities"])


@router.post("", response_model=FacilityOut)
def create_facility(payload: FacilityCreate, _committee: User = Depends(require_committee), db: Session = Depends(get_db)):
    return booking_service.create_facility(db, payload)


@router.get("", response_model=list[FacilityOut])
def list_facilities(_committee: User = Depends(require_committee), db: Session = Depends(get_db)):
    return booking_service.list_facilities(db)


@router.get("/{facility_id}", response_model=FacilityOut)
def get_facility(facility_id: int, _committee: User = Depends(require_committee), db: Session = Depends(get_db)):
    facility = booking_service.get_facility(db, facility_id)
    if facility is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Facility not found")
    return facility


@router.patch("/{facility_id}", response_model=FacilityOut)
def update_facility(facility_id: int, payload: FacilityUpdate, _committee: User = Depends(require_committee), db: Session = Depends(get_db)):
    try:
        return booking_service.update_facility(db, facility_id, payload)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Facility not found")


router_bookings = APIRouter(prefix="/api/v1/facility-bookings", tags=["facility-bookings"])


@router_bookings.post("", response_model=FacilityBookingOut)
def create_booking(payload: FacilityBookingCreate, current_user: User = Depends(require_resident), profile: ResidentProfile = Depends(get_resident_profile), db: Session = Depends(get_db)):
    payload_dict = payload.model_dump()
    payload_dict["resident_id"] = profile.resident_id
    from app.schemas.facility_schema import FacilityBookingCreate
    new_payload = FacilityBookingCreate(**payload_dict)
    return booking_service.create_booking(db, new_payload)


@router_bookings.get("", response_model=list[FacilityBookingOut])
def list_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.role_name == RoleEnum.RESIDENT:
        profile = get_resident_profile(current_user, db)
        return booking_service.list_bookings(db, resident_id=profile.resident_id)
    return booking_service.list_bookings(db)


@router_bookings.get("/{booking_id}", response_model=FacilityBookingOut)
def get_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = booking_service.get_booking(db, booking_id)
    if booking is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
    return booking


@router_bookings.patch("/{booking_id}", response_model=FacilityBookingOut)
def update_booking(booking_id: int, payload: FacilityBookingUpdate, _committee: User = Depends(require_committee), db: Session = Depends(get_db)):
    try:
        return booking_service.update_booking(db, booking_id, payload)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
