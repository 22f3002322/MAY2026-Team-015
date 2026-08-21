from sqlalchemy import Column, Integer, String, Text, Boolean, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Facility(Base, TimestampMixin):
    __tablename__ = "facilities"

    facility_id = Column(Integer, primary_key=True, autoincrement=True)
    facility_name = Column(String, nullable=False)
    description = Column(Text)
    capacity = Column(Integer)
    opening_time = Column(Time, nullable=False)
    closing_time = Column(Time, nullable=False)
    slot_duration = Column(Integer, nullable=False)
    maximum_duration = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

    bookings = relationship("FacilityBooking", back_populates="facility", cascade="all, delete-orphan")


class FacilityBooking(Base, TimestampMixin):
    __tablename__ = "facility_bookings"

    booking_id = Column(Integer, primary_key=True, autoincrement=True)
    facility_id = Column(Integer, ForeignKey("facilities.facility_id"), nullable=False)
    resident_id = Column(Integer, ForeignKey("resident_profiles.resident_id"), nullable=False)
    booking_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String, default="booked")
    guest_count = Column(Integer, nullable=True)
    approved_at = Column(DateTime)
    cancelled_by = Column(Integer, ForeignKey("users.user_id"))
    cancelled_at = Column(DateTime)

    facility = relationship("Facility", back_populates="bookings")
    resident = relationship("ResidentProfile", back_populates="bookings")
    cancelled_by_user = relationship("User")
