from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_resident_profile, require_admin_or_committee, require_verified_resident
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
from app.utils.api_error import NotAuthorized
from app.utils.api_response import success_response

# BUGFIX: every endpoint below used to require Committee specifically
# (require_committee) and excluded Admin entirely, unlike every other
# admin-capable module in this app (blocks/flats use
# require_admin_or_committee) and unlike the component design doc, which
# describes facility approval as an administrator action. Switched to
# require_admin_or_committee throughout.
router = APIRouter(prefix="/api/v1/admin/facilities", tags=["facilities"])


def _to_booking_out(booking) -> FacilityBookingOut:
    data = FacilityBookingOut.model_validate(booking)
    data.facility_name = booking.facility.facility_name if booking.facility else None
    if booking.resident and booking.resident.user:
        data.resident_name = booking.resident.user.full_name
    if booking.resident and booking.resident.flat:          # NEW
        data.flat_number = booking.resident.flat.flat_number  # NEW
    return data


@router.post("")
def create_facility(payload: FacilityCreate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    facility = booking_service.create_facility(db, payload)
    return success_response(data=FacilityOut.model_validate(facility), message="Facility created.")


@router.get("")
# Change: Depends(require_admin_or_committee) to Depends(get_current_user)
def list_facilities(_staff: User = Depends(get_current_user), db: Session = Depends(get_db)):
    facilities = booking_service.list_facilities(db)
    return success_response(data=[FacilityOut.model_validate(f) for f in facilities])


@router.get("/{facility_id}")
def get_facility(facility_id: int, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    facility = booking_service.get_facility(db, facility_id)  # raises NotFound if missing
    return success_response(data=FacilityOut.model_validate(facility))


@router.patch("/{facility_id}")
def update_facility(facility_id: int, payload: FacilityUpdate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    facility = booking_service.update_facility(db, facility_id, payload)
    return success_response(data=FacilityOut.model_validate(facility), message="Facility updated.")


router_bookings = APIRouter(prefix="/api/v1/facility-bookings", tags=["facility-bookings"])


@router_bookings.post("")
def create_booking(
    payload: FacilityBookingCreate,
    current_user: User = Depends(require_verified_resident),
    profile: ResidentProfile = Depends(get_resident_profile),
    db: Session = Depends(get_db),
):
    # resident_id is always the caller's own profile, never
    # client-supplied -- see FacilityBookingCreate in facility_schema.py.
    booking = booking_service.create_booking(db, payload, profile.resident_id)
    return success_response(data=_to_booking_out(booking), message="Facility booked.")


@router_bookings.get("")
def list_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.role_name == RoleEnum.RESIDENT:
        profile = get_resident_profile(current_user, db)
        bookings = booking_service.list_bookings(db, resident_id=profile.resident_id)
    else:
        bookings = booking_service.list_bookings(db)
    return success_response(data=[_to_booking_out(b) for b in bookings])


@router_bookings.get("/{booking_id}")
def get_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = booking_service.get_booking(db, booking_id)  # raises NotFound if missing

    # BUGFIX: previously any authenticated user (any role) could fetch
    # any booking by id -- a resident could read another resident's
    # booking just by guessing the id.
    if current_user.role.role_name == RoleEnum.RESIDENT:
        profile = get_resident_profile(current_user, db)
        if booking.resident_id != profile.resident_id:
            raise NotAuthorized("You can only access your own bookings.")

    return success_response(data=_to_booking_out(booking))


@router_bookings.patch("/{booking_id}")
def update_booking(
    booking_id: int,
    payload: FacilityBookingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    BUGFIX (CODE_REVIEW.md 3.3): this used to be Admin/Committee-only,
    but design doc 1.6 calls for residents to modify or cancel their own
    bookings too. A Resident may reschedule (date/time -- re-validated
    against the facility window and conflict-checked exactly like an
    admin edit) or cancel their own booking; they can't touch any other
    field, set any other status, or reach anyone else's booking.
    Admin/Committee keep full, unrestricted edit power, same as before.
    """
    booking = booking_service.get_booking(db, booking_id)  # raises NotFound if missing
    role = current_user.role.role_name

    if role in (RoleEnum.ADMIN, RoleEnum.COMMITTEE):
        updated = booking_service.update_booking(db, booking_id, payload, actor_user_id=current_user.user_id)
        return success_response(data=_to_booking_out(updated), message="Booking updated.")

    if role == RoleEnum.RESIDENT:
        if not current_user.is_verified:
            raise NotAuthorized(
                "Your account is pending verification by a committee member. "
                "This action isn't available until then."
            )
        profile = get_resident_profile(current_user, db)
        if booking.resident_id != profile.resident_id:
            raise NotAuthorized("You can only modify your own bookings.")

        update_data = payload.model_dump(exclude_unset=True)
        disallowed = set(update_data.keys()) - {"booking_date", "start_time", "end_time", "status"}
        if disallowed:
            raise NotAuthorized(f"You cannot modify: {', '.join(sorted(disallowed))}.")
        if "status" in update_data and update_data["status"] != "cancelled":
            raise NotAuthorized("You can only cancel your own booking, not set any other status.")

        updated = booking_service.update_booking(db, booking_id, payload, actor_user_id=current_user.user_id)
        return success_response(data=_to_booking_out(updated), message="Booking updated.")

    raise NotAuthorized("You do not have permission to modify this booking.")