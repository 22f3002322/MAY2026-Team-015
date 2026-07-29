from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class MaintenanceStaff(Base, TimestampMixin):
    
    __tablename__ = "maintenance_staff"

    staff_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)

    specialization = Column(String(100), nullable=True)
    experience_years = Column(Integer, nullable=True)
    is_available = Column(Boolean, nullable=False, default=True)

    user = relationship("User", back_populates="maintenance_staff_profile")


class SecurityGuard(Base, TimestampMixin):
    __tablename__ = "security_guards"

    guard_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)

    gate_assigned = Column(String(50), nullable=True)
    shift = Column(String(20), nullable=True)

    user = relationship("User", back_populates="security_guard_profile")