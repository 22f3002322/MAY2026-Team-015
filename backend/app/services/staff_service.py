"""
Gap-fill (CODE_REVIEW.md 3.1): staff directory + availability, the
maintenance/security-guard equivalent of apartment_service's resident
directory. See staff_router.py for the endpoints this backs.
"""
from typing import Optional

from sqlalchemy.orm import Session

from app.models.complaint import MaintenanceTask
from app.models.staff import MaintenanceStaff, SecurityGuard
from app.utils.api_error import NotFound

# Matches the MaintenanceTask.status lifecycle in complaint_service.py:
# assigned (pending accept) -> accepted -> in_progress -> completed, or
# declined at any point before it's accepted. The first three represent
# real, current workload on a staff member; completed/declined don't.
ACTIVE_TASK_STATUSES = ("assigned", "accepted", "in_progress")


def list_maintenance_staff(
    db: Session,
    is_available: Optional[bool] = None,
    specialization: Optional[str] = None,
) -> list[MaintenanceStaff]:
    query = db.query(MaintenanceStaff)
    if is_available is not None:
        query = query.filter(MaintenanceStaff.is_available == is_available)
    if specialization is not None:
        query = query.filter(MaintenanceStaff.specialization == specialization)
    return query.order_by(MaintenanceStaff.staff_id.asc()).all()


def get_maintenance_staff(db: Session, staff_id: int) -> MaintenanceStaff:
    staff = db.query(MaintenanceStaff).filter(MaintenanceStaff.staff_id == staff_id).first()
    if staff is None:
        raise NotFound("Maintenance staff member not found.")
    return staff


def active_task_count(db: Session, staff_id: int) -> int:
    return (
        db.query(MaintenanceTask)
        .filter(MaintenanceTask.staff_id == staff_id, MaintenanceTask.status.in_(ACTIVE_TASK_STATUSES))
        .count()
    )


def update_own_availability(db: Session, staff: MaintenanceStaff, is_available: bool) -> MaintenanceStaff:
    staff.is_available = is_available
    db.commit()
    db.refresh(staff)
    return staff


def list_security_guards(db: Session) -> list[SecurityGuard]:
    return db.query(SecurityGuard).order_by(SecurityGuard.guard_id.asc()).all()


def get_security_guard(db: Session, guard_id: int) -> SecurityGuard:
    guard = db.query(SecurityGuard).filter(SecurityGuard.guard_id == guard_id).first()
    if guard is None:
        raise NotFound("Security guard not found.")
    return guard
