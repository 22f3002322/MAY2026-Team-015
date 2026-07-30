from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_resident, require_maintenance
from app.core.dependencies import get_resident_profile
from app.models.auth import User
from app.models.apartment import ResidentProfile
from app.models.auth import RoleEnum
from app.services import complaint_service
from app.schemas.complaint_schema import (
    ComplaintCategoryCreate,
    ComplaintCategoryOut,
    ComplaintCreate,
    ComplaintOut,
    ComplaintUpdate,
)

router = APIRouter(prefix="/api/v1/admin/complaint-categories", tags=["complaint-categories"])


@router.post("", response_model=ComplaintCategoryOut)
async def create_category(payload: ComplaintCategoryCreate, _admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    from app.models.complaint import ComplaintCategory
    from app.schemas.complaint_schema import ComplaintCategoryCreate
    category = ComplaintCategory(**payload.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.get("", response_model=list[ComplaintCategoryOut])
async def list_categories(_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    from app.models.complaint import ComplaintCategory
    from sqlalchemy import select
    result = await db.execute(select(ComplaintCategory).order_by(ComplaintCategory.category_id))
    return list(result.scalars().all())


router_complaints = APIRouter(prefix="/api/v1/complaints", tags=["complaints"])


@router_complaints.post("", response_model=ComplaintOut)
async def create_complaint(payload: ComplaintCreate, current_user: User = Depends(require_resident), profile: ResidentProfile = Depends(get_resident_profile), db: AsyncSession = Depends(get_db)):
    return await complaint_service.create_complaint(db, payload, profile.resident_id)


@router_complaints.get("", response_model=list[ComplaintOut])
async def list_complaints(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role.role_name == RoleEnum.RESIDENT:
        profile = await get_resident_profile(current_user, db)
        return await complaint_service.list_complaints(db, resident_id=profile.resident_id)
    return await complaint_service.list_complaints(db)


@router_complaints.get("/{complaint_id}", response_model=ComplaintOut)
async def get_complaint(complaint_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    complaint = await complaint_service.get_complaint(db, complaint_id)
    if complaint is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Complaint not found")
    return complaint


@router_complaints.patch("/{complaint_id}", response_model=ComplaintOut)
async def update_complaint(complaint_id: int, payload: ComplaintUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await complaint_service.update_complaint(db, complaint_id, payload, current_user.role.role_name)
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router_complaints.post("/{complaint_id}/assign")
async def assign_complaint(complaint_id: int, staff_id: int, current_user: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if current_user.role.role_name != RoleEnum.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only admin can assign complaints")
    assignment = await complaint_service.assign_complaint(db, complaint_id, staff_id)
    return {"assignment_id": assignment.assignment_id}


@router_complaints.post("/{complaint_id}/comments")
async def add_comment(complaint_id: int, feedback: str, rating: Optional[int] = None, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    comment = await complaint_service.add_comment(db, complaint_id, current_user.user_id, feedback, rating)
    return {"comment_id": comment.comment_id}