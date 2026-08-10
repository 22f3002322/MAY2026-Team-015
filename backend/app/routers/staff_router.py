"""
Gap-fill (CODE_REVIEW.md 3.1): maintenance-staff / security-guard
directory. Mirrors residents_router.py's shape for the two staff profile
tables that had no equivalent before -- an Admin/Committee assigning a
complaint (POST /complaints/{id}/assign) previously had no API-driven
way to discover valid staff_ids, specializations, or current workload.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_maintenance_staff_profile, require_admin_or_committee, require_verified_maintenance
from app.models.auth import User
from app.models.staff import MaintenanceStaff, SecurityGuard
from app.schemas.staff_schema import MaintenanceAvailabilityUpdate, MaintenanceStaffOut, SecurityGuardOut
from app.services import staff_service
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/maintenance-staff", tags=["staff-directory"])


def _to_maintenance_out(db: Session, staff: MaintenanceStaff) -> MaintenanceStaffOut:
    return MaintenanceStaffOut(
        staff_id=staff.staff_id,
        user_id=staff.user_id,
        full_name=staff.user.full_name,
        email=staff.user.email,
        phone=staff.user.phone,
        specialization=staff.specialization,
        experience_years=staff.experience_years,
        is_available=staff.is_available,
        active_task_count=staff_service.active_task_count(db, staff.staff_id),
    )


def _to_security_out(guard: SecurityGuard) -> SecurityGuardOut:
    return SecurityGuardOut(
        guard_id=guard.guard_id,
        user_id=guard.user_id,
        full_name=guard.user.full_name,
        email=guard.user.email,
        phone=guard.user.phone,
        gate_assigned=guard.gate_assigned,
        shift=guard.shift,
    )


@router.get("")
def list_maintenance_staff(
    is_available: Optional[bool] = Query(default=None),
    specialization: Optional[str] = Query(default=None),
    _staff: User = Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    """Admin/Committee only."""
    staff_list = staff_service.list_maintenance_staff(db, is_available=is_available, specialization=specialization)
    return success_response(data=[_to_maintenance_out(db, s) for s in staff_list])


@router.get("/{staff_id}")
def get_maintenance_staff(staff_id: int, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    """Admin/Committee only."""
    staff = staff_service.get_maintenance_staff(db, staff_id)
    return success_response(data=_to_maintenance_out(db, staff))


@router.patch("/me/availability")
def update_my_availability(
    payload: MaintenanceAvailabilityUpdate,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    """Verified Maintenance only, own profile. Gap-fill (CODE_REVIEW.md
    3.1): is_available previously had no write path at all after signup."""
    updated = staff_service.update_own_availability(db, staff, payload.is_available)
    return success_response(data=_to_maintenance_out(db, updated), message="Availability updated.")


router_security = APIRouter(prefix="/api/v1/security-guards", tags=["staff-directory"])


@router_security.get("")
def list_security_guards(_staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    """Admin/Committee only."""
    guards = staff_service.list_security_guards(db)
    return success_response(data=[_to_security_out(g) for g in guards])


@router_security.get("/{guard_id}")
def get_security_guard(guard_id: int, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    """Admin/Committee only."""
    guard = staff_service.get_security_guard(db, guard_id)
    return success_response(data=_to_security_out(guard))