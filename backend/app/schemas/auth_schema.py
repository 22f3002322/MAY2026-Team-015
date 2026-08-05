from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

# bcrypt silently truncates/errors past 72 *bytes* -- see
# app/utils/password.py. Capping every password field here at 72 characters.

PASSWORD_MAX_LENGTH = 36


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=PASSWORD_MAX_LENGTH)


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    role: str
    is_verified: bool


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=PASSWORD_MAX_LENGTH)


# --------------------------------------------------------------------------
# Admin creates Committee -- the ONLY account-creation path that requires
# an authenticated caller. Everything else is public self-registration.
# --------------------------------------------------------------------------
class CreateCommitteeRequest(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=PASSWORD_MAX_LENGTH)


class CreateCommitteeResponse(BaseModel):
    user_id: int
    email: EmailStr
    role: str
    # NOTE: returned only because the notification module (Celery email
    # dispatch) isn't built yet -- see auth_service.create_committee_member.
    initial_password: str


# --------------------------------------------------------------------------
# Public self-registration: Resident / Maintenance / Security.
# One optional nested schema per er-dbml.txt profile table -- only the one
# matching `role` is used.
# --------------------------------------------------------------------------
class ResidentProfileIn(BaseModel):
    # The resident picks an existing flat at signup (frontend resolves a
    # flat_number the resident types into a flat_id via
    # GET /api/v1/flats?flat_number=..., which is public precisely so a
    # not-yet-authenticated signup flow can call it). Backend still
    # validates flat_id refers to a real flat -- see
    # auth_service.signup_user. This is only a "requested" flat until a
    # Committee member verifies the account: that's what actually creates
    # the occupancy_history row and flips the flat to occupied -- see
    # auth_service.verify_user / app/services/apartment_service.move_in.
    flat_id: Optional[int] = None
    emergency_contact: Optional[str] = None
    alternate_phone: Optional[str] = None
    occupation: Optional[str] = None
    # The only way to set a
    # profile picture is now POST /api/v1/residents/me/profile-picture
    # after the account exists. See ResidentProfileOut in user_schema.py
    # for how it's surfaced back to the client.


class MaintenanceProfileIn(BaseModel):
    specialization: Optional[str] = None
    experience_years: Optional[int] = None


class SecurityProfileIn(BaseModel):
    gate_assigned: Optional[str] = None
    shift: Optional[str] = None


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=PASSWORD_MAX_LENGTH)
    full_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    
    # This was `Literal[RoleEnum.RESIDENT, RoleEnum.MAINTENANCE,
    # RoleEnum.SECURITY]`. A Literal of enum *members* only matches an
    # input that's already that exact enum member -- pydantic v2 does
    # NOT coerce a plain JSON string like "Resident" into it the way it
    # would for a bare `role: RoleEnum` field.
    role: Literal["Resident", "Maintenance", "Security"]

    # Only the one matching `role` needs to be supplied -- all fields on
    # each are optional, so an empty/omitted profile is fine too (e.g. a
    # resident who doesn't know their flat_id yet).
    resident_profile: Optional[ResidentProfileIn] = None
    maintenance_profile: Optional[MaintenanceProfileIn] = None
    security_profile: Optional[SecurityProfileIn] = None


class SignupResponse(BaseModel):
    user_id: int
    email: EmailStr
    role: str
    is_verified: bool
    # NOTE: the human-readable "registered, pending verification" message
    # now lives in the envelope's top-level `message` (set by the router),
    # not duplicated here.


# --------------------------------------------------------------------------
# Committee verification workflow
# --------------------------------------------------------------------------
class VerifyUserRequest(BaseModel):
    # Only meaningful when verifying a Resident who selected a flat_id at
    # signup -- that's the moment it becomes an official move-in (see
    # auth_service.verify_user). Defaults to "Owner" if omitted; pass
    # "Rental" explicitly when that's the actual arrangement. Ignored
    # entirely for Maintenance/Security verification or a Resident with
    # no flat_id set.
    occupancy_type: Optional[str] = Field(default=None, pattern="^(Owner|Rental)$")


class PendingUserOut(BaseModel):
    user_id: int
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    role: str
    created_at: Optional[str] = None