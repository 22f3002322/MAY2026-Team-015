"""
Gap-fill (CODE_REVIEW.md 3.1): there was a full resident directory
(residents_router.py / apartment_schema.py's ResidentDirectoryOut) but
nothing equivalent for MaintenanceStaff/SecurityGuard -- an Admin
assigning a complaint (POST /complaints/{id}/assign, body
{"staff_id": ...}) had no API-driven way to discover valid staff_ids,
specializations, or workload. These schemas back the new directory
endpoints in staff_router.py.
"""
from typing import Optional

from pydantic import BaseModel, EmailStr


class MaintenanceStaffOut(BaseModel):
    staff_id: int
    user_id: int
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    is_available: bool
    # Computed by staff_service.active_task_count -- not a DB column.
    # "assigned"/"accepted"/"in_progress" tasks all count as active
    # workload; "completed"/"declined" don't.
    active_task_count: int = 0


class MaintenanceAvailabilityUpdate(BaseModel):
    # Gap-fill (CODE_REVIEW.md 3.1): is_available was set once at signup
    # and never read or written anywhere else in the codebase -- this is
    # the missing write path that makes it a real, usable flag.
    is_available: bool


class SecurityGuardOut(BaseModel):
    guard_id: int
    user_id: int
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    gate_assigned: Optional[str] = None
    shift: Optional[str] = None
