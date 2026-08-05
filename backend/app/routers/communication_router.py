from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin_or_committee
from app.models.auth import RoleEnum, User
from app.services import notification_service
from app.schemas.communication_schema import (
    AnnouncementCreate,
    AnnouncementOut,
    AnnouncementUpdate,
    NotificationOut,
)
from app.utils.api_response import success_response

# BUGFIX: reference restricted announcement management to Admin only
# (require_admin). Switched to require_admin_or_committee for
# consistency with every other admin-capable module in this codebase
# (blocks/flats/complaint-categories/facilities all treat Committee as
# a co-equal manager, not just Admin) and with the design doc's
# "administrators" language, read the same way elsewhere in this app.
router = APIRouter(prefix="/api/v1/announcements", tags=["announcements"])


@router.post("")
def create_announcement(payload: AnnouncementCreate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    announcement = notification_service.create_announcement(db, payload)
    return success_response(data=AnnouncementOut.model_validate(announcement), message="Announcement published.")


@router.get("")
def list_announcements(
    include_inactive: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only Admin/Committee may see inactive/expired announcements --
    # everyone else always gets the currently-live list.
    show_inactive = include_inactive and current_user.role.role_name in (RoleEnum.ADMIN, RoleEnum.COMMITTEE)
    announcements = notification_service.list_announcements(db, include_inactive=show_inactive)
    return success_response(data=[AnnouncementOut.model_validate(a) for a in announcements])


@router.get("/{announcement_id}")
def get_announcement(announcement_id: int, _user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    announcement = notification_service.get_announcement(db, announcement_id)
    return success_response(data=AnnouncementOut.model_validate(announcement))


@router.patch("/{announcement_id}")
def update_announcement(announcement_id: int, payload: AnnouncementUpdate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    announcement = notification_service.update_announcement(db, announcement_id, payload)
    return success_response(data=AnnouncementOut.model_validate(announcement), message="Announcement updated.")


@router.delete("/{announcement_id}")
def delete_announcement(announcement_id: int, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    notification_service.delete_announcement(db, announcement_id)
    return success_response(message="Announcement deleted.")


# --------------------------------------------------------------------------
# Notifications -- personal inbox, no create endpoint (see
# notification_service.py's module docstring for why).
# --------------------------------------------------------------------------
router_notifications = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router_notifications.get("")
def list_my_notifications(
    unread_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifications = notification_service.list_my_notifications(db, current_user.user_id, unread_only=unread_only)
    return success_response(data=[NotificationOut.model_validate(n) for n in notifications])


@router_notifications.post("/{notification_id}/read")
def mark_notification_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = notification_service.mark_notification_read(db, notification_id, current_user.user_id)
    return success_response(data=NotificationOut.model_validate(notification))


@router_notifications.post("/read-all")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = notification_service.mark_all_read(db, current_user.user_id)
    return success_response(data={"marked_read": count})