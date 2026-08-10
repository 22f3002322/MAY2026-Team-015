from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session

from app.models.mixins import ist_now
from app.models.complaint import (
    Complaint,
    ComplaintCategory,
    ComplaintImage,
    ComplaintAssignment,
    MaintenanceTask,
    ComplaintComment,
)
from app.models.staff import MaintenanceStaff
from app.models.apartment import ResidentProfile
from app.schemas.complaint_schema import (
    ComplaintCommentCreate,
    ComplaintCreate,
    ComplaintUpdate,
)
from app.utils.api_error import BadRequest, NotFound
from app.services import notification_service


VALID_TRANSITIONS = {
    "open": ["assigned"],
    "assigned": ["in_progress"],
    "in_progress": ["resolved"],
    "resolved": ["closed", "assigned"],
}

_LOAD_OPTIONS = (
    selectinload(Complaint.images),
    selectinload(Complaint.assignments),
    selectinload(Complaint.tasks),
    selectinload(Complaint.comments),
)


def create_complaint(db: Session, payload: ComplaintCreate, resident_id: int) -> Complaint:
    # BUGFIX (CODE_REVIEW.md 1.2): category_id was never checked against
    # ComplaintCategory before insert -- an invalid id tripped a raw FK
    # violation on commit, surfacing as an unhandled 500 instead of a
    # clean 404. Same fix pattern already applied to assign_complaint's
    # staff_id check below.
    category = (
        db.query(ComplaintCategory)
        .filter(ComplaintCategory.category_id == payload.category_id)
        .first()
    )
    if category is None:
        raise NotFound("Complaint category not found.")

    complaint = Complaint(
        resident_id=resident_id,
        category_id=payload.category_id,
        description=payload.description,
        priority=payload.priority,
        # BUGFIX (CODE_REVIEW.md 1.1): status is no longer a field on
        # ComplaintCreate (see complaint_schema.py) -- every complaint
        # starts "open" server-side, full stop. Previously
        # payload.status was written straight through with no
        # constraint anywhere in the pipeline, so a resident could file
        # a complaint already "resolved" and skip the whole
        # assignment/work workflow entirely.
        status="open",
    )
    db.add(complaint)
    db.flush()

    for url in payload.image_urls or []:
        db.add(ComplaintImage(complaint_id=complaint.complaint_id, url=url))

    db.commit()
    result = db.execute(
        select(Complaint).where(Complaint.complaint_id == complaint.complaint_id).options(*_LOAD_OPTIONS)
    )
    return result.scalar_one()


def list_complaints(db: Session, resident_id: Optional[int] = None) -> list[Complaint]:
    stmt = select(Complaint).options(*_LOAD_OPTIONS)
    if resident_id is not None:
        stmt = stmt.where(Complaint.resident_id == resident_id)
    result = db.execute(stmt.order_by(Complaint.created_at.desc()))
    return list(result.scalars().all())


def get_complaint(db: Session, complaint_id: int) -> Optional[Complaint]:
    result = db.execute(
        select(Complaint).where(Complaint.complaint_id == complaint_id).options(*_LOAD_OPTIONS)
    )
    return result.scalar_one_or_none()


def get_complaint_or_404(db: Session, complaint_id: int) -> Complaint:
    complaint = get_complaint(db, complaint_id)
    if complaint is None:
        raise NotFound("Complaint not found.")
    return complaint


def update_complaint(db: Session, complaint_id: int, payload: ComplaintUpdate, user_role: str) -> Complaint:
    complaint = get_complaint_or_404(db, complaint_id)

    old_status = complaint.status
    new_status = payload.status or old_status

    if user_role != "Admin" and new_status != old_status:
        if new_status not in VALID_TRANSITIONS.get(old_status, []):
            raise BadRequest(f"Invalid status transition from {old_status} to {new_status}")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(complaint, field, value)

    if new_status == "resolved" and old_status != "resolved":
        complaint.resolved_at = ist_now()
    if new_status == "closed" and old_status != "closed":
        complaint.closed_at = ist_now()

    db.commit()
    result = db.execute(
        select(Complaint).where(Complaint.complaint_id == complaint_id).options(*_LOAD_OPTIONS)
    )
    return result.scalar_one()


def assign_complaint(db: Session, complaint_id: int, staff_id: int) -> ComplaintAssignment:
    """
    BUGFIXES:
    - Previously didn't check complaint_id/staff_id existed at all --
      an invalid id tripped a raw FK-violation IntegrityError on commit,
      surfaced to the client as an unhelpful 500. Both are validated
      up front now, with proper 404s.
    - Previously never touched Complaint.status, so a freshly-assigned
      complaint stayed "open" forever, and the VALID_TRANSITIONS state
      machine (which requires "assigned" before "in_progress") could
      never actually be reached through the normal assignment flow.
      Assigning now flips status "open" -> "assigned", matching the
      documented workflow.
    """
    complaint = get_complaint_or_404(db, complaint_id)

    staff = db.query(MaintenanceStaff).filter(MaintenanceStaff.staff_id == staff_id).first()
    if staff is None:
        raise NotFound("Maintenance staff member not found.")

    assignment = ComplaintAssignment(complaint_id=complaint_id, assigned_to=staff_id)
    db.add(assignment)

    if complaint.status == "open":
        complaint.status = "assigned"

    db.commit()
    db.refresh(assignment)

    notification_service.create_notification(
        db,
        user_id=complaint.resident.user_id,
        notification_type="complaint_update",
        title="Complaint assigned",
        message=f"Your complaint #{complaint_id} has been assigned to a maintenance staff member.",
    )
    return assignment


def add_comment(db: Session, complaint_id: int, user_id: int, payload: ComplaintCommentCreate) -> ComplaintComment:
    complaint = get_complaint_or_404(db, complaint_id)
    if complaint.status != "resolved" and payload.rating is not None:
        raise BadRequest("A rating can only be added to a comment on a resolved complaint.")

    comment = ComplaintComment(
        complaint_id=complaint_id,
        user_id=user_id,
        feedback=payload.feedback,
        rating=payload.rating,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


# --------------------------------------------------------------------------
# Maintenance task workflow (accept -> schedule -> start -> complete).
# Previously the MaintenanceTask model/schema existed with no way to
# actually drive it through the API -- see routers/maintenance_router.py.
# --------------------------------------------------------------------------
def get_task_or_404(db: Session, task_id: int) -> MaintenanceTask:
    task = db.query(MaintenanceTask).filter(MaintenanceTask.task_id == task_id).first()
    if task is None:
        raise NotFound("Maintenance task not found.")
    return task


def create_task_for_assignment(db: Session, complaint_id: int, staff_id: int) -> MaintenanceTask:
    task = MaintenanceTask(complaint_id=complaint_id, staff_id=staff_id, status="accepted", accepted_at=ist_now())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def schedule_task(db: Session, task_id: int, staff_id: int, scheduled_at) -> MaintenanceTask:
    task = get_task_or_404(db, task_id)
    if task.staff_id != staff_id:
        raise BadRequest("This task isn't assigned to you.")
    task.scheduled_at = scheduled_at
    db.commit()
    db.refresh(task)
    return task


def start_task(db: Session, task_id: int, staff_id: int) -> MaintenanceTask:
    task = get_task_or_404(db, task_id)
    if task.staff_id != staff_id:
        raise BadRequest("This task isn't assigned to you.")
    if task.status not in ("accepted",):
        raise BadRequest(f"Cannot start a task in status '{task.status}'.")
    task.status = "in_progress"
    task.started_at = ist_now()

    complaint = get_complaint_or_404(db, task.complaint_id)
    if complaint.status == "assigned":
        complaint.status = "in_progress"

    db.commit()
    db.refresh(task)
    return task


def complete_task(db: Session, task_id: int, staff_id: int) -> MaintenanceTask:
    task = get_task_or_404(db, task_id)
    if task.staff_id != staff_id:
        raise BadRequest("This task isn't assigned to you.")
    if task.status not in ("in_progress",):
        raise BadRequest(f"Cannot complete a task in status '{task.status}'.")
    task.status = "completed"
    task.completed_at = ist_now()

    complaint = get_complaint_or_404(db, task.complaint_id)
    if complaint.status == "in_progress":
        complaint.status = "resolved"
        complaint.resolved_at = ist_now()

    db.commit()
    db.refresh(task)

    if complaint.status == "resolved":
        notification_service.create_notification(
            db,
            user_id=complaint.resident.user_id,
            notification_type="complaint_update",
            title="Complaint resolved",
            message=f"Your complaint #{complaint.complaint_id} has been marked resolved. Let us know how we did!",
        )
    return task


def list_tasks_for_staff(db: Session, staff_id: int) -> list[MaintenanceTask]:
    return (
        db.query(MaintenanceTask)
        .filter(MaintenanceTask.staff_id == staff_id)
        .order_by(MaintenanceTask.created_at.desc())
        .all()
    )