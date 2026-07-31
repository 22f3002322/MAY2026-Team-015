from datetime import datetime, time, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.facility import Facility, FacilityBooking
from app.models.apartment import ResidentProfile
from app.schemas.facility_schema import FacilityCreate, FacilityUpdate, FacilityBookingCreate, FacilityBookingUpdate


def create_facility(db: Session, payload: FacilityCreate) -> Facility:
    facility = Facility(**payload.model_dump())
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


def list_facilities(db: Session) -> list[Facility]:
    result = db.execute(select(Facility).order_by(Facility.facility_id))
    return list(result.scalars().all())


def get_facility(db: Session, facility_id: int) -> Optional[Facility]:
    result = db.execute(select(Facility).where(Facility.facility_id == facility_id))
    return result.scalar_one_or_none()


def update_facility(db: Session, facility_id: int, payload: FacilityUpdate) -> Facility:
    facility = get_facility(db, facility_id)
    if facility is None:
        raise ValueError("Facility not found")
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


def create_booking(db: Session, payload: FacilityBookingCreate) -> FacilityBooking:
    facility = get_facility(db, payload.facility_id)
    if facility is None:
        raise ValueError("Facility not found")

    if payload.end_time <= payload.start_time:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "End time must be after start time")

    duration = (datetime.combine(datetime.today(), payload.end_time) - datetime.combine(datetime.today(), payload.start_time)).seconds // 60
    if duration > facility.maximum_duration:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Booking exceeds maximum duration of {facility.maximum_duration} minutes")

    if check_booking_conflict(db, payload.facility_id, payload.booking_date, payload.start_time, payload.end_time):
        raise HTTPException(status.HTTP_409_CONFLICT, "This time slot is already booked")

    booking = FacilityBooking(**payload.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def list_bookings(db: Session, resident_id: Optional[int] = None) -> list[FacilityBooking]:
    stmt = select(FacilityBooking)
    if resident_id is not None:
        stmt = stmt.where(FacilityBooking.resident_id == resident_id)
    result = db.execute(stmt.order_by(FacilityBooking.created_at.desc()))
    return list(result.scalars().all())


def get_booking(db: Session, booking_id: int) -> Optional[FacilityBooking]:
    result = db.execute(select(FacilityBooking).where(FacilityBooking.booking_id == booking_id))
    return result.scalar_one_or_none()


def update_booking(db: Session, booking_id: int, payload: FacilityBookingUpdate) -> FacilityBooking:
    booking = get_booking(db, booking_id)
    if booking is None:
        raise ValueError("Booking not found")

    update_data = payload.model_dump(exclude_unset=True)
    new_start = update_data.get("start_time", booking.start_time)
    new_end = update_data.get("end_time", booking.end_time)
    new_date = update_data.get("booking_date", booking.booking_date)

    if new_start and new_end and new_end <= new_start:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "End time must be after start time")

    if check_booking_conflict(db, booking.facility_id, new_date, new_start, new_end, exclude_booking_id=booking_id):
        raise HTTPException(status.HTTP_409_CONFLICT, "This time slot is already booked")

    for field, value in update_data.items():
        setattr(booking, field, value)
    db.commit()
    db.refresh(booking)
    return booking
