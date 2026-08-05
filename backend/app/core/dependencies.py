from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.auth import User, RoleEnum
from app.utils.api_error import Deactivated, NotAuthenticated, NotAuthorized
from app.utils.security import verify_access_token
from app.models.apartment import ResidentProfile
from app.models.staff import SecurityGuard, MaintenanceStaff

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):

    payload = verify_access_token(token)

    if payload is None:
        raise NotAuthenticated("Invalid or expired token.")

    user_id_raw = payload.get("sub")

    try:
        user_id = int(user_id_raw)
    except (TypeError, ValueError):
        raise NotAuthenticated("Malformed token.")

    user = (
        db.query(User)
        .filter(User.user_id == user_id)
        .first()
    )

    if user is None:
        raise NotAuthenticated("User not found.")

    if not user.is_active:
        raise Deactivated()

    return user


def require_roles(*roles):

    def checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role.role_name.value not in roles:
            raise NotAuthorized("Permission denied.")

        return current_user

    return checker


def get_resident_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResidentProfile:
    profile = (
        db.query(ResidentProfile)
        .filter(ResidentProfile.user_id == user.user_id)
        .first()
    )
    if not profile:
        raise NotAuthorized("No resident profile linked to this account")

    return profile


def get_security_guard_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SecurityGuard:

    profile = (
        db.query(SecurityGuard)
        .filter(SecurityGuard.user_id == user.user_id)
        .first()
    )
    if not profile:
        raise NotAuthorized("No security guard profile linked to this account")

    return profile


def get_maintenance_staff_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MaintenanceStaff:
    
    profile = (
        db.query(MaintenanceStaff)
        .filter(MaintenanceStaff.user_id == user.user_id)
        .first()
    )
    if not profile:
        raise NotAuthorized("No maintenance staff profile linked to this account")

    return profile

def require_roles_verified(*roles):
    
    # Same role check as require_roles, plus is_verified.
    role_checker = require_roles(*roles)

    def checker(current_user: User = Depends(role_checker)):
        if not current_user.is_verified:
            raise NotAuthorized(
                "Your account is pending verification by a committee member. "
                "This action isn't available until then."
            )
        return current_user

    return checker


require_admin = require_roles(RoleEnum.ADMIN.value)

require_committee = require_roles(RoleEnum.COMMITTEE.value)

require_resident = require_roles(RoleEnum.RESIDENT.value)

require_security = require_roles(RoleEnum.SECURITY.value)

require_maintenance = require_roles(RoleEnum.MAINTENANCE.value)

# Convenience for endpoints Admin and Committee both may use.
require_admin_or_committee = require_roles(RoleEnum.ADMIN.value, RoleEnum.COMMITTEE.value)

# Verified-only variants -- use these instead of the plain role checks
# above for actions that should wait until a committee member has
# verified the account (filing complaints, booking facilities,pre-registering visitors, verifying visitor OTPs)

require_verified_resident = require_roles_verified(RoleEnum.RESIDENT.value)
require_verified_security = require_roles_verified(RoleEnum.SECURITY.value)
require_verified_maintenance = require_roles_verified(RoleEnum.MAINTENANCE.value)