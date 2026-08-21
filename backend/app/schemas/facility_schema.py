from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FacilityBase(BaseModel):
    facility_name: str
    description: Optional[str] = None
    capacity: Optional[int] = None
    opening_time: time
    closing_time: time
    slot_duration: int
    maximum_duration: int
    is_active: Optional[bool] = True


class FacilityCreate(FacilityBase):
    pass


class FacilityUpdate(BaseModel):
    facility_name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    slot_duration: Optional[int] = None
    maximum_duration: Optional[int] = None
    is_active: Optional[bool] = None


class FacilityOut(FacilityBase):
    model_config = ConfigDict(from_attributes=True)

    facility_id: int


class FacilityBookingBase(BaseModel):
    facility_id: int
    booking_date: date
    start_time: time
    end_time: time
    guest_count: Optional[int] = None


class FacilityBookingCreate(FacilityBookingBase):
    # BUGFIX: resident_id used to be a required client-supplied field
    # here even though the router always overwrites it with the caller's
    # own resident profile id (facilities_router.create_booking) --
    # confusing API surface for no benefit. Removed from the input
    # schema; it's still present on FacilityBookingOut as the actual
    # stored value.
    pass


class FacilityBookingUpdate(BaseModel):
    booking_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[str] = None
    guest_count: Optional[int] = None


class FacilityBookingOut(FacilityBookingBase):
    model_config = ConfigDict(from_attributes=True)

    booking_id: int
    resident_id: int
    status: str
    guest_count: Optional[int] = None
    approved_at: Optional[datetime] = None
    cancelled_by: Optional[int] = None
    cancelled_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    facility_name: Optional[str] = None
    resident_name: Optional[str] = None
    flat_number: Optional[str] = None
