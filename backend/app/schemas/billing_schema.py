from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class BillItemBase(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    # BUGFIX: reference schema used `float` for money. Floats can't
    # represent currency amounts exactly (0.1 + 0.2 != 0.3), which
    # compounds across bill items/payments/summaries. Decimal matches
    # the underlying Numeric(10, 2) column exactly.
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)


class BillItemCreate(BillItemBase):
    pass


class BillItemOut(BillItemBase):
    model_config = ConfigDict(from_attributes=True)

    item_id: int
    bill_id: int


class MaintenanceBillBase(BaseModel):
    flat_id: int
    # "YYYY-MM" -- validated with a pattern instead of accepting any string.
    billing_month: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    due_date: date


class MaintenanceBillCreate(MaintenanceBillBase):
    # BUGFIX: reference required a separate top-level `amount` with no
    # relationship enforced against `items` -- a client could send
    # amount=1 with items totalling 5000. When items are supplied,
    # billing_service.create_bill computes `amount` as their sum and
    # ignores this field; it's used as-is only when items is empty
    # (e.g. a flat flat maintenance fee with no line-item breakdown).
    amount: Optional[Decimal] = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    items: list[BillItemCreate] = []


class MaintenanceBillUpdate(BaseModel):
    due_date: Optional[date] = None
    status: Optional[str] = Field(default=None, pattern="^(unpaid|paid)$")


class MaintenanceBillOut(MaintenanceBillBase):
    model_config = ConfigDict(from_attributes=True)

    bill_id: int
    amount: Decimal
    status: str
    generated_at: Optional[datetime] = None
    items: list[BillItemOut] = []
    flat_number: Optional[str] = None
    block_name: Optional[str] = None


class PaymentCreate(BaseModel):
    bill_id: int
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    payment_method: str = Field(min_length=1, max_length=30)
    transaction_reference: str = Field(min_length=1, max_length=100)
    # Mocked payment gateway callback -- there's no real payment
    # processor wired up (same "not built yet" caveat as email
    # notifications elsewhere in this codebase), so the caller reports
    # the outcome directly. Validated against a known set in
    # billing_service rather than accepted as an arbitrary string.
    status: str = Field(default="pending", pattern="^(pending|success|failed)$")


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    payment_id: int
    bill_id: int
    amount: Decimal
    payment_method: str
    transaction_reference: str
    status: str
    paid_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


# --------------------------------------------------------------------------
# Gap-fill (CODE_REVIEW.md 3.6): a "pending" payment used to be a dead
# end -- nothing anywhere ever moved it forward. This transitions it to
# its final outcome; "pending" isn't a valid target here since you can't
# reset something back to pending, and success/failed are meant to be
# terminal (see billing_service.update_payment_status).
# --------------------------------------------------------------------------
class PaymentStatusUpdate(BaseModel):
    status: str = Field(pattern="^(success|failed)$")


class ReceiptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    receipt_id: int
    payment_id: int
    receipt_number: str
    file_path: Optional[str] = None
    generated_at: Optional[datetime] = None


# --------------------------------------------------------------------------
# "Provide administrators with billing records and financial summaries"
# (component design doc 1.8) -- not present at all in the reference.
# --------------------------------------------------------------------------
class BillingSummaryOut(BaseModel):
    total_billed: Decimal
    total_collected: Decimal
    total_outstanding: Decimal
    unpaid_bill_count: int