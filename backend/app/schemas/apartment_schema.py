from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# --------------------------------------------------------------------------
# Blocks
# --------------------------------------------------------------------------
class BlockCreate(BaseModel):
    block_name: str = Field(min_length=1, max_length=50)
    total_flats: int = Field(gt=0)


class BlockUpdate(BaseModel):
    block_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    total_flats: Optional[int] = Field(default=None, gt=0)


class BlockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    block_id: int
    block_name: str
    total_flats: int
    flat_count: int = 0  # computed (len(block.flats)) -- not a DB column, built by the router


# --------------------------------------------------------------------------
# Flats
# --------------------------------------------------------------------------
class FlatCreate(BaseModel):
    block_id: int
    flat_number: str = Field(min_length=1, max_length=20)
    floor_number: Optional[int] = None
    flat_type: Optional[str] = Field(default=None, max_length=20)


class FlatUpdate(BaseModel):
    flat_number: Optional[str] = Field(default=None, min_length=1, max_length=20)
    floor_number: Optional[int] = None
    flat_type: Optional[str] = Field(default=None, max_length=20)


class FlatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    flat_id: int
    block_id: Optional[int] = None
    flat_number: Optional[str] = None
    floor_number: Optional[int] = None
    flat_type: Optional[str] = None
    occupancy_status: str
    block_name: Optional[str] = None


class ResidentSummaryOut(BaseModel):
    """Lightweight resident reference used when listing who's in a flat --
    the full directory entry (ResidentDirectoryOut below) is heavier."""

    resident_id: int
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: str


class FlatDetailOut(FlatOut):
    current_residents: list[ResidentSummaryOut] = []


# --------------------------------------------------------------------------
# Occupancy (move-in / move-out)
# --------------------------------------------------------------------------
class MoveInRequest(BaseModel):
    flat_id: int
    occupancy_type: str = Field(pattern="^(Owner|Rental)$")
    move_in_date: Optional[date] = None  # defaults to today in the service layer


class MoveOutRequest(BaseModel):
    move_out_date: Optional[date] = None  # defaults to today in the service layer


class OccupancyHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    occupancy_id: int
    flat_id: int
    occupancy_type: Optional[str] = None
    move_in_date: Optional[date] = None
    move_out_date: Optional[date] = None
    is_current: bool


# --------------------------------------------------------------------------
# Resident directory / admin profile management
# --------------------------------------------------------------------------
class ResidentDirectoryOut(BaseModel):
    resident_id: int
    user_id: int
    full_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    is_verified: bool
    flat_id: Optional[int] = None
    flat_number: Optional[str] = None
    block_name: Optional[str] = None
    occupation: Optional[str] = None
    occupancy_type: Optional[str] = None  # Owner | Rental from current occupancy
    emergency_contact: Optional[str] = None
    alternate_phone: Optional[str] = None


class ResidentProfileUpdate(BaseModel):
    """Admin/Committee edit of a resident's contact details. flat_id is
    deliberately excluded -- that only ever changes via move-in/move-out
    so occupancy_history stays authoritative."""

    emergency_contact: Optional[str] = Field(default=None, max_length=20)
    alternate_phone: Optional[str] = Field(default=None, max_length=20)
    occupation: Optional[str] = Field(default=None, max_length=100)