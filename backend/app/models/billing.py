"""
Billing & Payment component (component design doc section 1.8).

Adapted from the user-supplied reference files (billing_model.py,
billing_schema.py, billing_service.py, billing.py) -- those were async
(AsyncSession) and used raw HTTPException/ValueError, inconsistent with
the rest of this codebase, which is fully synchronous (SQLAlchemy
Session) and routes every expected error through app.utils.api_error.
Rebuilt on the same footing as the rest of the app; see
app/services/billing_service.py for the specific bugs this fixes
(float-precision money, client-supplied receipt numbers, no ownership
checks, no double-payment guard, bill amount not reconciled against line
items).
"""
from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import ist_now


class MaintenanceBill(Base):
    __tablename__ = "maintenance_bills"

    bill_id = Column(Integer, primary_key=True, autoincrement=True)
    flat_id = Column(Integer, ForeignKey("flats.flat_id"), nullable=False)
    billing_month = Column(String(7), nullable=False)  # "YYYY-MM"
    amount = Column(Numeric(10, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="unpaid")  # unpaid, paid
    generated_at = Column(DateTime, default=ist_now, nullable=False)
    updated_at = Column(DateTime, default=None, onupdate=ist_now, nullable=True)

    flat = relationship("Flat", back_populates="bills")
    items = relationship("BillItem", back_populates="bill", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="bill", cascade="all, delete-orphan")


class BillItem(Base):
    __tablename__ = "bill_items"

    item_id = Column(Integer, primary_key=True, autoincrement=True)
    bill_id = Column(Integer, ForeignKey("maintenance_bills.bill_id"), nullable=False)
    description = Column(String(200), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)

    bill = relationship("MaintenanceBill", back_populates="items")


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, autoincrement=True)
    bill_id = Column(Integer, ForeignKey("maintenance_bills.bill_id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(30), nullable=False)
    transaction_reference = Column(String(100), unique=True, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending, success, failed
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=ist_now, nullable=False)

    bill = relationship("MaintenanceBill", back_populates="payments")
    receipt = relationship("Receipt", back_populates="payment", uselist=False, cascade="all, delete-orphan")


class Receipt(Base):
    __tablename__ = "receipts"

    receipt_id = Column(Integer, primary_key=True, autoincrement=True)
    payment_id = Column(Integer, ForeignKey("payments.payment_id"), unique=True, nullable=False)
    receipt_number = Column(String(30), unique=True, nullable=False)
    file_path = Column(String(255), nullable=True)
    generated_at = Column(DateTime, default=ist_now, nullable=False)

    payment = relationship("Payment", back_populates="receipt")