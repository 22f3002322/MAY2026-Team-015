from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.auth import RoleEnum


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


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
    new_password: str = Field(min_length=8, max_length=128)


# --------------------------------------------------------------------------
# Admin creates Committee -- the ONLY account-creation path that requires
# an authenticated caller. Everything else is public self-registration.
# --------------------------------------------------------------------------
class CreateCommitteeRequest(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=128)


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
    flat_id: Optional[int] = None
    emergency_contact: Optional[str] = None
    alternate_phone: Optional[str] = None
    occupation: Optional[str] = None
    profile_image: Optional[str] = None


class MaintenanceProfileIn(BaseModel):
    specialization: Optional[str] = None
    experience_years: Optional[int] = None


class SecurityProfileIn(BaseModel):
    gate_assigned: Optional[str] = None
    shift: Optional[str] = None


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    role: Literal[RoleEnum.RESIDENT, RoleEnum.MAINTENANCE, RoleEnum.SECURITY]

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
class PendingUserOut(BaseModel):
    user_id: int
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    role: str
    created_at: Optional[str] = None
