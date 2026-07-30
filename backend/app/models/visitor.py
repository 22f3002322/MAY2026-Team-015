from sqlalchemy import Column, Integer, String, Boolean, Date, Time, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Visitor(Base):
    __tablename__ = "visitors"

    visitor_id = Column(Integer, primary_key=True, autoincrement=True)
    visitor_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    visitor_type = Column(String, nullable=False)

    requests = relationship("VisitorRequest", back_populates="visitor", cascade="all, delete-orphan")
    logs = relationship("VisitorLog", back_populates="visitor", cascade="all, delete-orphan")


class VisitorRequest(Base):
    __tablename__ = "visitor_requests"

    request_id = Column(Integer, primary_key=True, autoincrement=True)
    resident_id = Column(Integer, ForeignKey("resident_profiles.resident_id"), nullable=False)
    visitor_id = Column(Integer, ForeignKey("visitors.visitor_id"), nullable=False)
    expected_date = Column(Date, nullable=False)
    expected_time = Column(Time, nullable=False)
    status = Column(String, default="expected")
    approved_at = Column(DateTime)
    otp = Column(String)
    created_at = Column(DateTime, server_default=func.now())

    resident = relationship("ResidentProfile", back_populates="visitor_requests")
    visitor = relationship("Visitor", back_populates="requests")
    logs = relationship("VisitorLog", back_populates="request", cascade="all, delete-orphan")


class VisitorLog(Base):
    __tablename__ = "visitor_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    visitor_id = Column(Integer, ForeignKey("visitors.visitor_id"), nullable=False)
    resident_id = Column(Integer, ForeignKey("resident_profiles.resident_id"), nullable=False)
    security_guard_id = Column(Integer, ForeignKey("security_guards.guard_id"), nullable=False)
    request_id = Column(Integer, ForeignKey("visitor_requests.request_id"), nullable=True)
    otp_verified = Column(Boolean, default=False)
    entry_time = Column(DateTime)
    exit_time = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    visitor = relationship("Visitor", back_populates="logs")
    resident = relationship("ResidentProfile")
    security_guard = relationship("SecurityGuard", back_populates="visitor_logs")
    request = relationship("VisitorRequest", back_populates="logs")
