from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AnnouncementBase(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: Optional[str] = None
    priority: Optional[str] = Field(default="normal", pattern="^(normal|high|urgent)$")
    expiry_date: Optional[date] = None


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=150)
    description: Optional[str] = None
    priority: Optional[str] = Field(default=None, pattern="^(normal|high|urgent)$")
    expiry_date: Optional[date] = None
    is_active: Optional[bool] = None


class AnnouncementOut(AnnouncementBase):
    model_config = ConfigDict(from_attributes=True)

    announcement_id: int
    is_active: bool
    published_at: Optional[datetime] = None


# --------------------------------------------------------------------------
# Notifications are created internally by other services (see
# notification_service.notify_user/notify_all_residents), never through a
# public "create a notification for someone" endpoint -- so there's
# deliberately no NotificationCreate schema here.
# --------------------------------------------------------------------------
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    notification_id: int
    user_id: int
    notification_type: str
    title: str
    message: str
    is_read: bool
    sent_at: Optional[datetime] = None