from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict


class VisitorBase(BaseModel):
    visitor_name: str
    phone: str
    visitor_type: str


class VisitorCreate(VisitorBase):
    pass


class VisitorOut(VisitorBase):
    model_config = ConfigDict(from_attributes=True)

    visitor_id: int


class VisitorRequestBase(BaseModel):
    resident_id: int
    visitor_id: int
    expected_date: date
    expected_time: time


class VisitorRequestCreate(VisitorRequestBase):
    pass


class VisitorRequestOut(VisitorRequestBase):
    model_config = ConfigDict(from_attributes=True)

    request_id: int
    status: str
    approved_at: Optional[datetime] = None
    otp: Optional[str] = None
    created_at: Optional[datetime] = None


class VisitorLogBase(BaseModel):
    visitor_id: int
    resident_id: int
    security_guard_id: int
    request_id: Optional[int] = None
    otp_verified: Optional[bool] = False
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None


class VisitorLogCreate(VisitorLogBase):
    pass


class VisitorLogOut(VisitorLogBase):
    model_config = ConfigDict(from_attributes=True)

    log_id: int
    created_at: Optional[datetime] = None
