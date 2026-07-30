from datetime import datetime, time, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.facility import Facility, FacilityBooking
from app.models.apartment import ResidentProfile
from backend.app.schemas.facility_schema import FacilityCreate, FacilityUpdate, FacilityBookingCreate, FacilityBookingUpdate


async def create_facility(db: AsyncSession, payload: FacilityCreate) -> Facility:
    facility = Facility(**payload.model_dump())
    db.add(facility)
    await db.commit()
    await db.refresh(facility)
    return facility


async def list_facilities(db: AsyncSession) -> list[Facility]:
    result = await db.execute(select(Facility).order_by(Facility.facility_id))
    return list(result.scalars().all())


async def get_facility(db: AsyncSession, facility_id: int) -> Optional[Facility]:
    result = await db.execute(select(Facility).where(Facility.facility_id == facility_id))
    return result.scalar_one_or_none()


async def update_facility(db: AsyncSession, facility_id: int, payload: FacilityUpdate) -> Facility:
    facility = await get_facility(db, facility_id)
    if facility is None:
        raise ValueError("Facility not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(facility, field, value)
    await db.commit()
    await db.refresh(facility)
    return facility


async def check_booking_conflict(db: AsyncSession, facility_id: int, booking_date, start_time: time, end_time: time, exclude_booking_id: Optional[int] = None) -> bool:
    stmt = select(FacilityBooking).where(
        FacilityBooking.facility_id == facility_id,
        FacilityBooking.booking_date == booking_date,
        FacilityBooking.status == "booked",
        FacilityBooking.start_time < end_time,
        FacilityBooking.end_time > start_time,
    )
    if exclude_booking_id is not None:
        stmt = stmt.where(FacilityBooking.booking_id != exclude_booking_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None


async def create_booking(db: AsyncSession, payload: FacilityBookingCreate) -> FacilityBooking:
    facility = await get_facility(db, payload.facility_id)
    if facility is None:
        raise ValueError("Facility not found")

    if payload.end_time <= payload.start_time:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "End time must be after start time")

    duration = (datetime.combine(datetime.today(), payload.end_time) - datetime.combine(datetime.today(), payload.start_time)).seconds // 60
    if duration > facility.maximum_duration:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Booking exceeds maximum duration of {facility.maximum_duration} minutes")

    if await check_booking_conflict(db, payload.facility_id, payload.booking_date, payload.start_time, payload.end_time):
        raise HTTPException(status.HTTP_409_CONFLICT, "This time slot is already booked")

    booking = FacilityBooking(**payload.model_dump())
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking


async def list_bookings(db: AsyncSession, resident_id: Optional[int] = None) -> list[FacilityBooking]:
    stmt = select(FacilityBooking)
    if resident_id is not None:
        stmt = stmt.where(FacilityBooking.resident_id == resident_id)
    result = await db.execute(stmt.order_by(FacilityBooking.created_at.desc()))
    return list(result.scalars().all())


async def get_booking(db: AsyncSession, booking_id: int) -> Optional[FacilityBooking]:
    result = await db.execute(select(FacilityBooking).where(FacilityBooking.booking_id == booking_id))
    return result.scalar_one_or_none()


async def update_booking(db: AsyncSession, booking_id: int, payload: FacilityBookingUpdate) -> FacilityBooking:
    booking = await get_booking(db, booking_id)
    if booking is None:
        raise ValueError("Booking not found")

    update_data = payload.model_dump(exclude_unset=True)
    new_start = update_data.get("start_time", booking.start_time)
    new_end = update_data.get("end_time", booking.end_time)
    new_date = update_data.get("booking_date", booking.booking_date)

    if new_start and new_end and new_end <= new_start:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "End time must be after start time")

    if await check_booking_conflict(db, booking.facility_id, new_date, new_start, new_end, exclude_booking_id=booking_id):
        raise HTTPException(status.HTTP_409_CONFLICT, "This time slot is already booked")

    for field, value in update_data.items():
        setattr(booking, field, value)
    await db.commit()
    await db.refresh(booking)
    return booking
