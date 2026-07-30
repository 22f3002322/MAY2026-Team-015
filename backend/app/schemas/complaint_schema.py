from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


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


class ComplaintCommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    comment_id: int
    complaint_id: int
    user_id: int
    feedback: str
    rating: Optional[int] = None
    created_at: Optional[datetime] = None


class ComplaintBase(BaseModel):
    resident_id: int
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