import os
import uuid
from typing import Optional

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session

from app.core.config import settings
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
    # BUGFIX (CODE_REVIEW.md 3.4): this used to create the task already
    # status="accepted", the instant an Admin assigned it -- the staff
    # member never actually did anything to accept it, and there was no
    # way to decline. Design doc 1.4 lists "allow maintenance personnel
    # to accept assigned work requests" as a distinct action, so the
    # task now starts "assigned" (pending the staff member's decision);
    # see accept_task/decline_task below for the two ways it can move
    # forward from here.
    task = MaintenanceTask(complaint_id=complaint_id, staff_id=staff_id, status="assigned")
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def accept_task(db: Session, task_id: int, staff_id: int) -> MaintenanceTask:
    """Gap-fill (CODE_REVIEW.md 3.4): the explicit accept step that was
    previously skipped entirely (assignment = automatic acceptance)."""
    task = get_task_or_404(db, task_id)
    if task.staff_id != staff_id:
        raise BadRequest("This task isn't assigned to you.")
    if task.status != "assigned":
        raise BadRequest(f"Cannot accept a task in status '{task.status}'.")
    task.status = "accepted"
    task.accepted_at = ist_now()
    db.commit()
    db.refresh(task)
    return task


def decline_task(db: Session, task_id: int, staff_id: int) -> MaintenanceTask:
    """
    Gap-fill (CODE_REVIEW.md 3.4): the missing opt-out. Declining sends
    the complaint back to "open" so an Admin/Committee can reassign it
    to someone else -- it deliberately doesn't touch the existing
    ComplaintAssignment row (kept as a historical record of who was
    offered the work and turned it down).
    """
    task = get_task_or_404(db, task_id)
    if task.staff_id != staff_id:
        raise BadRequest("This task isn't assigned to you.")
    if task.status != "assigned":
        raise BadRequest(f"Cannot decline a task in status '{task.status}'.")
    task.status = "declined"

    complaint = get_complaint_or_404(db, task.complaint_id)
    if complaint.status == "assigned":
        complaint.status = "open"

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


# --------------------------------------------------------------------------
# Complaint image uploads.
#
# Gap-fill (CODE_REVIEW.md 3.5): ComplaintCreate.image_urls accepted
# arbitrary client-supplied strings with no relationship to any real
# upload -- unlike profile pictures (profile_service.py), there was no
# endpoint anywhere that produced a real, validated URL to put there.
# Same validated-upload pattern as profile_service.upload_profile_picture
# (content-type sniffing against magic bytes, bounded chunked reads,
# server-generated filename -- no path-traversal surface from a
# client-supplied name). Deliberately not sharing profile_service's
# helpers to keep this section's changes isolated to the complaint
# module; the ~20 lines of duplication is a reasonable trade-off.
# --------------------------------------------------------------------------
MAX_COMPLAINT_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB, same cap as profile pictures
_COMPLAINT_IMAGE_CHUNK_SIZE = 1024 * 1024

_ALLOWED_COMPLAINT_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def _sniff_complaint_image_type(header: bytes) -> Optional[str]:
    if header[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if header[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"
    return None


def _read_complaint_image_bounded(file: UploadFile, max_bytes: int) -> bytes:
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = file.file.read(_COMPLAINT_IMAGE_CHUNK_SIZE)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise BadRequest(f"Image must be smaller than {max_bytes // (1024 * 1024)} MB.")
        chunks.append(chunk)
    return b"".join(chunks)


def _complaint_image_dir() -> str:
    path = os.path.join(settings.MEDIA_ROOT, "complaint_images")
    os.makedirs(path, exist_ok=True)
    return path


def add_complaint_image(db: Session, complaint_id: int, file: UploadFile) -> ComplaintImage:
    get_complaint_or_404(db, complaint_id)  # 404 if the complaint doesn't exist

    if file.content_type not in _ALLOWED_COMPLAINT_IMAGE_TYPES:
        raise BadRequest("Only JPEG, PNG, or WEBP images are allowed.")

    contents = _read_complaint_image_bounded(file, MAX_COMPLAINT_IMAGE_BYTES)
    if not contents:
        raise BadRequest("Uploaded file is empty.")

    sniffed_type = _sniff_complaint_image_type(contents[:12])
    if sniffed_type is None or sniffed_type != file.content_type:
        raise BadRequest("The uploaded file doesn't look like a valid JPEG, PNG, or WEBP image.")

    extension = _ALLOWED_COMPLAINT_IMAGE_TYPES[sniffed_type]
    filename = f"{complaint_id}_{uuid.uuid4().hex}.{extension}"
    full_path = os.path.join(_complaint_image_dir(), filename)

    with open(full_path, "wb") as f:
        f.write(contents)

    image = ComplaintImage(
        complaint_id=complaint_id,
        url=f"{settings.MEDIA_URL}/complaint_images/{filename}",
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image