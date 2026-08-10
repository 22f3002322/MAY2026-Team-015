from datetime import datetime, time
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.facility import Facility, FacilityBooking
from app.models.mixins import ist_now
from app.schemas.facility_schema import FacilityCreate, FacilityUpdate, FacilityBookingCreate, FacilityBookingUpdate
from app.services import notification_service
from app.utils.api_error import BadRequest, Conflict, NotFound


def create_facility(db: Session, payload: FacilityCreate) -> Facility:
    facility = Facility(**payload.model_dump())
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


def list_facilities(db: Session) -> list[Facility]:
    result = db.execute(select(Facility).order_by(Facility.facility_id))
    return list(result.scalars().all())


def get_facility(db: Session, facility_id: int) -> Facility:
    result = db.execute(select(Facility).where(Facility.facility_id == facility_id))
    facility = result.scalar_one_or_none()
    if facility is None:
        raise NotFound("Facility not found.")
    return facility


def update_facility(db: Session, facility_id: int, payload: FacilityUpdate) -> Facility:
    facility = get_facility(db, facility_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(facility, field, value)
    db.commit()
    db.refresh(facility)
    return facility


def check_booking_conflict(db: Session, facility_id: int, booking_date, start_time: time, end_time: time, exclude_booking_id: Optional[int] = None) -> bool:
    stmt = select(FacilityBooking).where(
        FacilityBooking.facility_id == facility_id,
        FacilityBooking.booking_date == booking_date,
        FacilityBooking.status == "booked",
        FacilityBooking.start_time < end_time,
        FacilityBooking.end_time > start_time,
    )
    if exclude_booking_id is not None:
        stmt = stmt.where(FacilityBooking.booking_id != exclude_booking_id)
    result = db.execute(stmt)
    return result.scalar_one_or_none() is not None


def _validate_booking_window(facility: Facility, booking_date, start_time: time, end_time: time) -> None:
    """
    BUGFIX: previously the only checks were end_time > start_time and
    duration <= maximum_duration -- nothing stopped a booking outside the
    facility's opening_time/closing_time, against an inactive facility,
    or for a date/time already in the past, despite Facility having all
    the fields needed to check this.
    """
    if not facility.is_active:
        raise BadRequest(f"'{facility.facility_name}' isn't currently accepting bookings.")

    if end_time <= start_time:
        raise BadRequest("End time must be after start time.")

    if start_time < facility.opening_time or end_time > facility.closing_time:
        raise BadRequest(
            f"'{facility.facility_name}' is only bookable between "
            f"{facility.opening_time} and {facility.closing_time}."
        )

    duration_minutes = (
        datetime.combine(booking_date, end_time) - datetime.combine(booking_date, start_time)
    ).seconds // 60
    if duration_minutes > facility.maximum_duration:
        raise BadRequest(f"Booking exceeds maximum duration of {facility.maximum_duration} minutes.")

    booking_datetime = datetime.combine(booking_date, start_time)
    if booking_datetime < ist_now():
        raise BadRequest("Cannot book a slot in the past.")


def create_booking(db: Session, payload: FacilityBookingCreate, resident_id: int) -> FacilityBooking:
    # BUGFIX (CODE_REVIEW.md 2): get_facility() was a plain, unlocked
    # SELECT -- two concurrent bookings for the same facility/date/
    # overlapping time could both pass check_booking_conflict before
    # either commits, since nothing serialized them (a booked slot has
    # no row of its own to lock until after it's inserted). Locking the
    # facility row itself for the duration of the check + insert closes
    # that gap: the second concurrent request blocks here until the
    # first commits, then re-checks against the now-committed booking
    # and correctly hits the Conflict below. This briefly serializes
    # bookings against the SAME facility only -- different facilities
    # are unaffected.
    facility = (
        db.query(Facility)
        .filter(Facility.facility_id == payload.facility_id)
        .with_for_update()
        .first()
    )
    if facility is None:
        raise NotFound("Facility not found.")

    _validate_booking_window(facility, payload.booking_date, payload.start_time, payload.end_time)

    if check_booking_conflict(db, payload.facility_id, payload.booking_date, payload.start_time, payload.end_time):
        raise Conflict("This time slot is already booked.")

    booking = FacilityBooking(resident_id=resident_id, **payload.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)

    notification_service.create_notification(
        db,
        user_id=booking.resident.user_id,
        notification_type="booking_update",
        title="Facility booked",
        message=f"Your booking for '{facility.facility_name}' on {payload.booking_date} is confirmed.",
    )
    return booking


def list_bookings(db: Session, resident_id: Optional[int] = None) -> list[FacilityBooking]:
    stmt = select(FacilityBooking)
    if resident_id is not None:
        stmt = stmt.where(FacilityBooking.resident_id == resident_id)
    result = db.execute(stmt.order_by(FacilityBooking.created_at.desc()))
    return list(result.scalars().all())


def get_booking(db: Session, booking_id: int) -> FacilityBooking:
    result = db.execute(select(FacilityBooking).where(FacilityBooking.booking_id == booking_id))
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFound("Booking not found.")
    return booking


def update_booking(db: Session, booking_id: int, payload: FacilityBookingUpdate) -> FacilityBooking:
    booking = get_booking(db, booking_id)

    update_data = payload.model_dump(exclude_unset=True)
    new_start = update_data.get("start_time", booking.start_time)
    new_end = update_data.get("end_time", booking.end_time)
    new_date = update_data.get("booking_date", booking.booking_date)

    # BUGFIX (CODE_REVIEW.md 2): same race as create_booking above --
    # only lock the facility when we're actually about to re-check the
    # conflict window (date/time changed), so a pure status update (e.g.
    # admin cancelling) doesn't pay for a lock it doesn't need.
    if {"start_time", "end_time", "booking_date"} & update_data.keys():
        facility = (
            db.query(Facility)
            .filter(Facility.facility_id == booking.facility_id)
            .with_for_update()
            .first()
        )
        if facility is None:
            raise NotFound("Facility not found.")
        _validate_booking_window(facility, new_date, new_start, new_end)

    if check_booking_conflict(db, booking.facility_id, new_date, new_start, new_end, exclude_booking_id=booking_id):
        raise Conflict("This time slot is already booked.")

    for field, value in update_data.items():
        setattr(booking, field, value)
    db.commit()
    db.refresh(booking)

    if "status" in update_data:
        notification_service.create_notification(
            db,
            user_id=booking.resident.user_id,
            notification_type="booking_update",
            title="Booking status updated",
            message=f"Your booking #{booking.booking_id} status changed to '{booking.status}'.",
        )
    return booking