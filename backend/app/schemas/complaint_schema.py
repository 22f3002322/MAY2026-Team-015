from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ComplaintCategoryBase(BaseModel):
    category_name: str


class ComplaintCategoryCreate(ComplaintCategoryBase):
    pass


class ComplaintCategoryOut(ComplaintCategoryBase):
    model_config = ConfigDict(from_attributes=True)

    category_id: int


class ComplaintImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    image_id: int
    complaint_id: int
    url: str
    uploaded_at: Optional[datetime] = None


class ComplaintAssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    assignment_id: int
    complaint_id: int
    assigned_to: int
    assigned_at: Optional[datetime] = None


# --------------------------------------------------------------------------
# Assign complaint to a maintenance staff member. Added a proper body
# schema so the router doesn't take `staff_id` as a bare query param.
# --------------------------------------------------------------------------
class ComplaintAssignRequest(BaseModel):
    staff_id: int


class MaintenanceTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    task_id: int
    complaint_id: int
    staff_id: int
    status: str
    accepted_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MaintenanceTaskScheduleRequest(BaseModel):
    scheduled_at: datetime


class ComplaintCommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    comment_id: int
    complaint_id: int
    user_id: int
    feedback: str
    rating: Optional[int] = None
    created_at: Optional[datetime] = None


# --------------------------------------------------------------------------
# Adding a comment/feedback -- was previously bare `feedback`/`rating`
# query params on the router (add_comment). A proper body schema also
# lets us validate the rating range here instead of trusting whatever
# int a client sends.
# --------------------------------------------------------------------------
class ComplaintCommentCreate(BaseModel):
    feedback: str = Field(min_length=1, max_length=2000)
    rating: Optional[int] = Field(default=None, ge=1, le=5)


class ComplaintBase(BaseModel):
    category_id: int
    description: str
    priority: Optional[str] = "medium"
    status: Optional[str] = "open"


class ComplaintCreate(ComplaintBase):
    image_urls: Optional[list[str]] = []


class ComplaintUpdate(BaseModel):
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class ComplaintOut(ComplaintBase):
    model_config = ConfigDict(from_attributes=True)

    complaint_id: int
    resident_id: int
    category_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    images: list[ComplaintImageOut] = []
    assignments: list[ComplaintAssignmentOut] = []
    tasks: list[MaintenanceTaskOut] = []
    comments: list[ComplaintCommentOut] = []