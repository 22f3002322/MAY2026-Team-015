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
from app.core.dependencies import (
    get_maintenance_staff_profile,
    require_admin_or_committee,
    require_verified_maintenance,
)
from app.models.auth import User
from app.models.staff import MaintenanceStaff
from app.services import ai_service, complaint_service
from app.schemas.complaint_schema import MaintenanceTaskOut, MaintenanceTaskScheduleRequest
from app.utils.api_error import NotAuthorized
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/maintenance/tasks", tags=["maintenance"])

# Admin/Committee staff directory — prerequisite for AI staff recommendations
# (Module 1.10) and assign UI. Same multi-router pattern as facilities_router.
router_staff_admin = APIRouter(prefix="/api/v1/admin/maintenance-staff", tags=["maintenance"])


@router_staff_admin.get("")
def list_maintenance_staff(
    _user: User = Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    items = ai_service.list_maintenance_staff(db)
    return success_response(data=[item.model_dump() for item in items])


def _to_task_out(task) -> MaintenanceTaskOut:
    """
    Gap-fill: enriches MaintenanceTaskOut with denormalized complaint
    context (description/priority/status/category, resident + flat) and
    the resident's post-resolution rating/feedback, if any -- same
    denormalization pattern as complaint_router._to_complaint_out /
    facilities_router._to_booking_out. Without this the maintenance
    staff UI had no way to show what a task was actually about, or any
    feedback a resident left after the work was completed.
    """
    data = MaintenanceTaskOut.model_validate(task)
    complaint = getattr(task, "complaint", None)
    if complaint is not None:
        data.complaint_description = complaint.description
        data.complaint_priority = complaint.priority
        data.complaint_status = complaint.status
        if complaint.category:
            data.complaint_category = complaint.category.category_name

        resident = getattr(complaint, "resident", None)
        if resident is not None:
            if resident.user:
                data.resident_name = resident.user.full_name
            if resident.flat:
                data.flat_number = resident.flat.flat_number

        # Resident feedback is a ComplaintComment with a rating attached
        # (see complaint_service.add_comment -- a rating is only
        # accepted once the complaint is resolved). Multiple comments
        # can exist; surface the most recent rated one.
        rated_comments = [c for c in (complaint.comments or []) if c.rating is not None]
        if rated_comments:
            latest = max(rated_comments, key=lambda c: c.created_at)
            data.resident_rating = latest.rating
            data.resident_feedback = latest.feedback
    return data


@router.get("")
def list_my_tasks(
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    tasks = complaint_service.list_tasks_for_staff(db, staff.staff_id)
    return success_response(data=[_to_task_out(t) for t in tasks])


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
    return success_response(data=_to_task_out(task))


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
    return success_response(data=_to_task_out(task), message="Task accepted.")


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
    return success_response(data=_to_task_out(task), message="Task declined.")


@router.post("/{task_id}/schedule")
def schedule_task(
    task_id: int,
    payload: MaintenanceTaskScheduleRequest,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    task = complaint_service.schedule_task(db, task_id, staff.staff_id, payload.scheduled_at)
    return success_response(data=_to_task_out(task), message="Task scheduled.")


@router.post("/{task_id}/start")
def start_task(
    task_id: int,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    task = complaint_service.start_task(db, task_id, staff.staff_id)
    return success_response(data=_to_task_out(task), message="Task started.")


@router.post("/{task_id}/complete")
def complete_task(
    task_id: int,
    _user: User = Depends(require_verified_maintenance),
    staff: MaintenanceStaff = Depends(get_maintenance_staff_profile),
    db: Session = Depends(get_db),
):
    task = complaint_service.complete_task(db, task_id, staff.staff_id)
    return success_response(data=_to_task_out(task), message="Task completed.")