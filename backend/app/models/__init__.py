"""
Import every model here so `Base.metadata` is fully populated wherever
`app.models` is imported -- needed by scripts/init_db.py's create_all().
"""
from app.models.auth import Role, User, RefreshToken  # noqa: F401
from app.models.apartment import Block, Flat, ResidentProfile, OccupancyHistory # noqa: F401
from app.models.staff import MaintenanceStaff, SecurityGuard # noqa: F401

__all__ = [
    "Role",
    "User",
    "RefreshToken",
    "ResidentProfile",
    "MaintenanceStaff",
    "SecurityGuard",
    "Block",
    "Flat",
    "OccupancyHistory"
]
