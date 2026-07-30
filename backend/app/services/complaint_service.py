from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintImageOut,
    ComplaintAssignmentOut,
    MaintenanceTaskOut,
    ComplaintCommentOut,
)


VALID_TRANSITIONS = {
    "open": ["assigned"],
    "assigned": ["in_progress"],
    "in_progress": ["resolved"],
    "resolved": ["closed", "assigned"],
}


async def create_complaint(db: AsyncSession, payload: ComplaintCreate, resident_id: int) -> Complaint:
    complaint = Complaint(
        resident_id=resident_id,
        category_id=payload.category_id,
        description=payload.description,
        priority=payload.priority,
        status=payload.status,
    )
    db.add(complaint)
    await db.flush()

    for url in payload.image_urls or []:
        db.add(ComplaintImage(complaint_id=complaint.complaint_id, url=url))

    await db.commit()
    result = await db.execute(
        select(Complaint)
        .where(Complaint.complaint_id == complaint.complaint_id)
        .options(
            selectinload(Complaint.images),
            selectinload(Complaint.assignments),
            selectinload(Complaint.tasks),
            selectinload(Complaint.comments),
        )
    )
    return result.scalar_one()


async def list_complaints(db: AsyncSession, resident_id: Optional[int] = None) -> list[Complaint]:
    stmt = select(Complaint).options(
        selectinload(Complaint.images),
        selectinload(Complaint.assignments),
        selectinload(Complaint.tasks),
        selectinload(Complaint.comments),
    )
    if resident_id is not None:
        stmt = stmt.where(Complaint.resident_id == resident_id)
    result = await db.execute(stmt.order_by(Complaint.created_at.desc()))
    return list(result.scalars().all())


async def get_complaint(db: AsyncSession, complaint_id: int) -> Optional[Complaint]:
    result = await db.execute(
        select(Complaint)
        .where(Complaint.complaint_id == complaint_id)
        .options(
            selectinload(Complaint.images),
            selectinload(Complaint.assignments),
            selectinload(Complaint.tasks),
            selectinload(Complaint.comments),
        )
    )
    return result.scalar_one_or_none()


async def update_complaint(db: AsyncSession, complaint_id: int, payload: ComplaintUpdate, user_role: str) -> Complaint:
    complaint = await get_complaint(db, complaint_id)
    if complaint is None:
        raise ValueError("Complaint not found")

    old_status = complaint.status
    new_status = payload.status or old_status

    if user_role != "Admin" and new_status != old_status:
        if new_status not in VALID_TRANSITIONS.get(old_status, []):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Invalid status transition from {old_status} to {new_status}")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(complaint, field, value)

    if new_status == "resolved" and old_status != "resolved":
        complaint.resolved_at = datetime.utcnow()
    if new_status == "closed" and old_status != "closed":
        complaint.closed_at = datetime.utcnow()

    await db.commit()
    result = await db.execute(
        select(Complaint)
        .where(Complaint.complaint_id == complaint_id)
        .options(
            selectinload(Complaint.images),
            selectinload(Complaint.assignments),
            selectinload(Complaint.tasks),
            selectinload(Complaint.comments),
        )
    )
    return result.scalar_one()


async def assign_complaint(db: AsyncSession, complaint_id: int, staff_id: int) -> ComplaintAssignment:
    assignment = ComplaintAssignment(complaint_id=complaint_id, assigned_to=staff_id)
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def add_comment(db: AsyncSession, complaint_id: int, user_id: int, feedback: str, rating: Optional[int] = None) -> ComplaintComment:
    complaint = await get_complaint(db, complaint_id)
    if complaint is None:
        raise ValueError("Complaint not found")
    if complaint.status != "resolved" and rating is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Rating can only be set on closing comment")

    comment = ComplaintComment(
        complaint_id=complaint_id,
        user_id=user_id,
        feedback=feedback,
        rating=rating,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment