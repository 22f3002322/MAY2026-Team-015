from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class ResidentProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    flat_id: Optional[int] = None
    emergency_contact: Optional[str] = None
    alternate_phone: Optional[str] = None
    occupation: Optional[str] = None
    profile_image: Optional[str] = None


class MaintenanceProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    is_available: bool


class SecurityProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    gate_assigned: Optional[str] = None
    shift: Optional[str] = None


class MeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool

    resident_profile: Optional[ResidentProfileOut] = None
    maintenance_profile: Optional[MaintenanceProfileOut] = None
    security_profile: Optional[SecurityProfileOut] = None
