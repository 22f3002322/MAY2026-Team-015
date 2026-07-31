from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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
def create_category(payload: ComplaintCategoryCreate, _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    from app.models.complaint import ComplaintCategory
    category = ComplaintCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("", response_model=list[ComplaintCategoryOut])
def list_categories(_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    from app.models.complaint import ComplaintCategory
    from sqlalchemy import select
    result = db.execute(select(ComplaintCategory).order_by(ComplaintCategory.category_id))
    return list(result.scalars().all())


router_complaints = APIRouter(prefix="/api/v1/complaints", tags=["complaints"])


@router_complaints.post("", response_model=ComplaintOut)
def create_complaint(payload: ComplaintCreate, current_user: User = Depends(require_resident), profile: ResidentProfile = Depends(get_resident_profile), db: Session = Depends(get_db)):
    return complaint_service.create_complaint(db, payload, profile.resident_id)


@router_complaints.get("", response_model=list[ComplaintOut])
def list_complaints(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.role_name == RoleEnum.RESIDENT:
        profile = get_resident_profile(current_user, db)
        return complaint_service.list_complaints(db, resident_id=profile.resident_id)
    return complaint_service.list_complaints(db)


@router_complaints.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(complaint_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    complaint = complaint_service.get_complaint(db, complaint_id)
    if complaint is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Complaint not found")
    return complaint


@router_complaints.patch("/{complaint_id}", response_model=ComplaintOut)
def update_complaint(complaint_id: int, payload: ComplaintUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return complaint_service.update_complaint(db, complaint_id, payload, current_user.role.role_name.value)
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router_complaints.post("/{complaint_id}/assign")
def assign_complaint(complaint_id: int, staff_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    if current_user.role.role_name != RoleEnum.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only admin can assign complaints")
    assignment = complaint_service.assign_complaint(db, complaint_id, staff_id)
    return {"assignment_id": assignment.assignment_id}


@router_complaints.post("/{complaint_id}/comments")
def add_comment(complaint_id: int, feedback: str, rating: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    comment = complaint_service.add_comment(db, complaint_id, current_user.user_id, feedback, rating)
    return {"comment_id": comment.comment_id}
