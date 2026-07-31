from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, ist_now


class ComplaintCategory(Base):
    __tablename__ = "complaint_categories"

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    category_name = Column(String, nullable=False)

    complaints = relationship("Complaint", back_populates="category")


class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"

    complaint_id = Column(Integer, primary_key=True, autoincrement=True)
    resident_id = Column(Integer, ForeignKey("resident_profiles.resident_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("complaint_categories.category_id"), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="medium")
    status = Column(String, default="open")
    resolved_at = Column(DateTime(timezone = True))
    closed_at = Column(DateTime(timezone = True))

    resident = relationship("ResidentProfile", back_populates="complaints")
    category = relationship("ComplaintCategory", back_populates="complaints")
    images = relationship("ComplaintImage", back_populates="complaint", cascade="all, delete-orphan")
    assignments = relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan")
    tasks = relationship("MaintenanceTask", back_populates="complaint", cascade="all, delete-orphan")
    comments = relationship("ComplaintComment", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintImage(Base):
    __tablename__ = "complaint_images"

    image_id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    url = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone = True), default=ist_now)

    complaint = relationship("Complaint", back_populates="images")


class ComplaintAssignment(Base):
    __tablename__ = "complaint_assignments"

    assignment_id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("maintenance_staff.staff_id"), nullable=False)
    assigned_at = Column(DateTime(timezone = True), default=ist_now)

    complaint = relationship("Complaint", back_populates="assignments")
    assigned_to_staff = relationship("MaintenanceStaff", back_populates="assignments")


class MaintenanceTask(Base, TimestampMixin):
    __tablename__ = "maintenance_tasks"

    task_id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("maintenance_staff.staff_id"), nullable=False)
    status = Column(String, default="accepted")
    accepted_at = Column(DateTime(timezone = True))
    scheduled_at = Column(DateTime(timezone = True))
    started_at = Column(DateTime(timezone = True))
    completed_at = Column(DateTime(timezone = True))

    complaint = relationship("Complaint", back_populates="tasks")
    staff = relationship("MaintenanceStaff", back_populates="tasks")


class ComplaintComment(Base):
    __tablename__ = "complaint_comments"

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    feedback = Column(Text, nullable=False)
    rating = Column(Integer)
    created_at = Column(DateTime(timezone = True), default=ist_now)

    complaint = relationship("Complaint", back_populates="comments")
    user = relationship("User", back_populates="complaint_comments")