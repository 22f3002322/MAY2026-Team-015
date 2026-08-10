"""
Import every model here so `Base.metadata` is fully populated wherever
`app.models` is imported -- needed by scripts/init_db.py's create_all().
"""
from app.models.auth import Role, User, RefreshToken  # noqa: F401
from app.models.apartment import Block, Flat, ResidentProfile, OccupancyHistory # noqa: F401
from app.models.staff import MaintenanceStaff, SecurityGuard # noqa: F401
from app.models.visitor import Visitor, VisitorRequest, VisitorLog # noqa: F401
from app.models.facility import Facility, FacilityBooking # noqa: F401
from app.models.complaint import ComplaintCategory, Complaint, ComplaintImage, ComplaintAssignment, ComplaintComment, MaintenanceTask # noqa: F401
from app.models.billing import MaintenanceBill, BillItem, Payment, Receipt # noqa: F401
from app.models.communication import Announcement, Notification # noqa: F401
from app.models.community import Poll, PollOption, PollVote # noqa: F401
from app.models.ai import AiInferenceLog  # noqa: F401

__all__ = [
    "Role",
    "User",
    "RefreshToken",
    "ResidentProfile",
    "MaintenanceStaff",
    "SecurityGuard",
    "Block",
    "Flat",
    "OccupancyHistory",
    "Visitor",
    "VisitorRequest",
    "VisitorLog",
    "Facility",
    "FacilityBooking",
    "ComplaintCategory",
    "Complaint",
    "ComplaintImage",
    "ComplaintAssignment",
    "ComplaintComment",
    "MaintenanceTask",
    "MaintenanceBill",
    "BillItem",
    "Payment",
    "Receipt",
    "Announcement",
    "Notification",
    "Poll",
    "PollOption",
    "PollVote",
    "AiInferenceLog",
]