"""
Maintenance task workflow (accept -> schedule -> start -> complete).

BUGFIX / gap-fill: `MaintenanceTask` already existed as a model and a
schema (MaintenanceTaskOut), and the component design doc calls out
Maintenance Staff Management as its own component, but there was no
router at all for it -- assigned staff had no way to act on their work
through the API. complaint_router.assign_complaint now creates a
MaintenanceTask row per assignment (status="accepted"); this router lets
the assigned staff member move it through the rest of its lifecycle,
which also drives the parent Complaint's status forward
(complaint_service.start_task/complete_task).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_maintenance_staff_profile, require_verified_maintenance
from app.models.auth import User
from app.models.staff import MaintenanceStaff
from app.services import complaint_service
from app.schemas.complaint_schema import MaintenanceTaskOut, MaintenanceTaskScheduleRequest
from app.utils.api_error import NotAuthorized
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/maintenance/tasks", tags=["maintenance"])


@router.get("")
def list_my_tasks(
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    tasks = complaint_service.list_tasks_for_staff(db, staff.staff_id)
    return success_response(data=[MaintenanceTaskOut.model_validate(t) for t in tasks])


@router.get("/{task_id}")
def get_task(
    task_id: int,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    task = complaint_service.get_task_or_404(db, task_id)
    if task.staff_id != staff.staff_id:
        raise NotAuthorized("This task isn't assigned to you.")
    return success_response(data=MaintenanceTaskOut.model_validate(task))


@router.post("/{task_id}/accept")
def accept_task(
    task_id: int,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    """Gap-fill (CODE_REVIEW.md 3.4): a task used to arrive already
    "accepted" the instant it was assigned -- this is the real accept
    step design doc 1.4 calls for."""
    task = complaint_service.accept_task(db, task_id, staff.staff_id)
    return success_response(data=MaintenanceTaskOut.model_validate(task), message="Task accepted.")


@router.post("/{task_id}/decline")
def decline_task(
    task_id: int,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    """Gap-fill (CODE_REVIEW.md 3.4): the missing opt-out -- sends the
    complaint back to "open" for an Admin/Committee to reassign."""
    task = complaint_service.decline_task(db, task_id, staff.staff_id)
    return success_response(data=MaintenanceTaskOut.model_validate(task), message="Task declined.")


@router.post("/{task_id}/schedule")
def schedule_task(
    task_id: int,
    payload: MaintenanceTaskScheduleRequest,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    task = complaint_service.schedule_task(db, task_id, staff.staff_id, payload.scheduled_at)
    return success_response(data=MaintenanceTaskOut.model_validate(task), message="Task scheduled.")


@router.post("/{task_id}/start")
def start_task(
    task_id: int,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    task = complaint_service.start_task(db, task_id, staff.staff_id)
    return success_response(data=MaintenanceTaskOut.model_validate(task), message="Task started.")


@router.post("/{task_id}/complete")
def complete_task(
    task_id: int,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    task = complaint_service.complete_task(db, task_id, staff.staff_id)
    return success_response(data=MaintenanceTaskOut.model_validate(task), message="Task completed.")