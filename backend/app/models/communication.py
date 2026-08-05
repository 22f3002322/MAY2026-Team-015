"""
Communication & Notification component (component design doc section
1.7). Adapted from the reference communication_model.py -- switched
func.now() server defaults to ist_now() for consistency with the rest of
the app, and added Notification.is_read (the reference had no
read/unread tracking at all, which makes a notification list far less
useful).

Announcements are admin/committee-authored broadcasts (see
communication_router.py). Notifications are per-user and are created
internally by other services (complaint_service, booking_service,
visitor_service, billing_service, auth_service) via
notification_service.notify_user/notify_all_residents -- there is
deliberately no public "create a notification for someone" endpoint.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import ist_now


class Announcement(Base):
    __tablename__ = "announcements"

    announcement_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="normal")  # normal, high, urgent
    published_at = Column(DateTime, default=ist_now, nullable=False)
    expiry_date = Column(Date, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    notification_type = Column(String(30), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    sent_at = Column(DateTime, default=ist_now, nullable=False)

    user = relationship("User", back_populates="notifications")