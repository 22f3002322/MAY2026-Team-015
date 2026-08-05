from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    get_resident_profile,
    require_admin,
    require_admin_or_committee,
    require_verified_resident,
)
from app.models.auth import User, RoleEnum
from app.models.apartment import ResidentProfile
from app.models.complaint import Complaint, ComplaintCategory
from app.models.staff import MaintenanceStaff
from app.services import complaint_service
from app.schemas.complaint_schema import (
    ComplaintAssignRequest,
    ComplaintCategoryCreate,
    ComplaintCategoryOut,
    ComplaintCommentCreate,
    ComplaintCreate,
    ComplaintOut,
    ComplaintUpdate,
)
from app.utils.api_error import NotAuthorized
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/admin/complaint-categories", tags=["complaint-categories"])


@router.post("")
def create_category(payload: ComplaintCategoryCreate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    category = ComplaintCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return success_response(data=ComplaintCategoryOut.model_validate(category), message="Category created.")


@router.get("")
def list_categories_admin(_staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    categories = db.query(ComplaintCategory).order_by(ComplaintCategory.category_id).all()
    return success_response(data=[ComplaintCategoryOut.model_validate(c) for c in categories])


# --------------------------------------------------------------------------
# BUGFIX: residents need a valid category_id to file a complaint
# (ComplaintCreate.category_id), but the only way to list categories used
# to be the Admin-only endpoint above -- there was no way for a resident
# to discover what categories exist. This is a read-only endpoint any
# authenticated user can hit; only creating/managing categories stays
# Admin/Committee-only.
# --------------------------------------------------------------------------
router_categories_public = APIRouter(prefix="/api/v1/complaint-categories", tags=["complaint-categories"])


@router_categories_public.get("")
def list_categories(_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    categories = db.query(ComplaintCategory).order_by(ComplaintCategory.category_id).all()
    return success_response(data=[ComplaintCategoryOut.model_validate(c) for c in categories])


router_complaints = APIRouter(prefix="/api/v1/complaints", tags=["complaints"])


def _staff_profile_for(db: Session, user: User) -> Optional[MaintenanceStaff]:
    return db.query(MaintenanceStaff).filter(MaintenanceStaff.user_id == user.user_id).first()


def _authorize_complaint_access(db: Session, complaint: Complaint, current_user: User) -> None:
    """
    BUGFIX: previously ANY authenticated user (any role) could fetch or
    edit ANY complaint by id via get_current_user with no ownership
    check at all -- a resident could read or modify another resident's
    complaint just by guessing the id. Now: Admin/Committee can access
    anything; a Resident only their own; Maintenance only complaints
    they're assigned to; everyone else is refused.
    """
    role = current_user.role.role_name
    if role in (RoleEnum.ADMIN, RoleEnum.COMMITTEE):
        return

    if role == RoleEnum.RESIDENT:
        profile = get_resident_profile(current_user, db)
        if complaint.resident_id == profile.resident_id:
            return
        raise NotAuthorized("You can only access your own complaints.")

    if role == RoleEnum.MAINTENANCE:
        staff = _staff_profile_for(db, current_user)
        if staff is not None and any(a.assigned_to == staff.staff_id for a in complaint.assignments):
            return
        raise NotAuthorized("You can only access complaints assigned to you.")

    raise NotAuthorized("You do not have permission to access this complaint.")


@router_complaints.post("")
def create_complaint(
    payload: ComplaintCreate,
    current_user: User = Depends(require_verified_resident),
    profile: ResidentProfile = Depends(get_resident_profile),
    db: Session = Depends(get_db),
):
    complaint = complaint_service.create_complaint(db, payload, profile.resident_id)
    return success_response(data=ComplaintOut.model_validate(complaint), message="Complaint filed successfully.")


@router_complaints.get("")
def list_complaints(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = current_user.role.role_name
    if role == RoleEnum.RESIDENT:
        profile = get_resident_profile(current_user, db)
        complaints = complaint_service.list_complaints(db, resident_id=profile.resident_id)
    elif role == RoleEnum.MAINTENANCE:
        # BUGFIX: maintenance staff used to get every complaint in the
        # system via this same "not Resident" fallback -- now scoped to
        # complaints actually assigned to them.
        staff = _staff_profile_for(db, current_user)
        staff_id = staff.staff_id if staff else None
        complaints = [
            c for c in complaint_service.list_complaints(db)
            if staff_id is not None and any(a.assigned_to == staff_id for a in c.assignments)
        ]
    else:
        complaints = complaint_service.list_complaints(db)
    return success_response(data=[ComplaintOut.model_validate(c) for c in complaints])


@router_complaints.get("/{complaint_id}")
def get_complaint(complaint_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    complaint = complaint_service.get_complaint_or_404(db, complaint_id)
    _authorize_complaint_access(db, complaint, current_user)
    return success_response(data=ComplaintOut.model_validate(complaint))


@router_complaints.patch("/{complaint_id}")
def update_complaint(complaint_id: int, payload: ComplaintUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    complaint = complaint_service.get_complaint_or_404(db, complaint_id)
    _authorize_complaint_access(db, complaint, current_user)

    role = current_user.role.role_name
    # Residents may only edit description/priority on their own complaint,
    # never the status directly -- status moves through
    # assign_complaint / the maintenance task endpoints instead.
    if role == RoleEnum.RESIDENT and payload.status is not None:
        raise NotAuthorized("Residents cannot change a complaint's status directly.")

    effective_role = "Admin" if role in (RoleEnum.ADMIN, RoleEnum.COMMITTEE) else role.value
    updated = complaint_service.update_complaint(db, complaint_id, payload, effective_role)
    return success_response(data=ComplaintOut.model_validate(updated), message="Complaint updated.")


@router_complaints.post("/{complaint_id}/assign")
def assign_complaint(complaint_id: int, payload: ComplaintAssignRequest, current_user: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    assignment = complaint_service.assign_complaint(db, complaint_id, payload.staff_id)
    # BUGFIX: a MaintenanceTask row is what actually lets the assigned
    # staff member drive the accept/start/complete workflow (see
    # routers/maintenance_router.py) -- previously nothing created one on
    # assignment, so the assigned staff had no way to act on it at all.
    complaint_service.create_task_for_assignment(db, complaint_id, payload.staff_id)
    return success_response(data={"assignment_id": assignment.assignment_id}, message="Complaint assigned.")


@router_complaints.post("/{complaint_id}/comments")
def add_comment(complaint_id: int, payload: ComplaintCommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    complaint = complaint_service.get_complaint_or_404(db, complaint_id)
    _authorize_complaint_access(db, complaint, current_user)
    comment = complaint_service.add_comment(db, complaint_id, current_user.user_id, payload)
    return success_response(data={"comment_id": comment.comment_id}, message="Comment added.")