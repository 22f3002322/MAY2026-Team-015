"""
Billing & Payment component (design doc 1.8).

Rewritten from the reference (billing_service.py / billing.py), which
was async (AsyncSession) -- inconsistent with the rest of this
synchronous-Session codebase -- and had several real gaps:

- `amount` and `items` were independent client inputs with no
  relationship enforced -- a client could bill 5000 worth of items but
  claim amount=1. Now: if items are supplied, amount is computed from
  them and the client-supplied amount is ignored.
- Money was `float` in the schema (fixed to Decimal -- see
  billing_schema.py).
- `create_payment`/`get_payment` had no ownership check at all: any
  authenticated user could pay or view any bill's payments.
- Nothing stopped paying an already-paid bill twice.
- `Receipt`/`receipt_number` was client-suppliable and never actually
  wired to any endpoint -- receipts are now auto-generated server-side
  the moment a payment succeeds.
- `list_my_bills`/`list_my_payments` existed but no router ever called
  them -- residents had no way to see their own bills at all.
"""
from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.apartment import ResidentProfile
from app.models.billing import BillItem, MaintenanceBill, Payment, Receipt
from app.models.mixins import ist_now
from app.schemas.billing_schema import MaintenanceBillCreate, MaintenanceBillUpdate, PaymentCreate
from app.services import apartment_service, notification_service
from app.utils.api_error import BadRequest, Conflict, NotFound

_BILL_LOAD = (selectinload(MaintenanceBill.items),)


def create_bill(db: Session, payload: MaintenanceBillCreate) -> MaintenanceBill:
    apartment_service.get_flat(db, payload.flat_id)  # raises NotFound if the flat doesn't exist

    if payload.items:
        amount = sum((item.amount for item in payload.items), Decimal("0"))
    elif payload.amount is not None:
        amount = payload.amount
    else:
        raise BadRequest("Provide either an amount or at least one bill item.")

    bill = MaintenanceBill(
        flat_id=payload.flat_id,
        billing_month=payload.billing_month,
        amount=amount,
        due_date=payload.due_date,
        status="unpaid",
    )
    db.add(bill)
    db.flush()

    for item in payload.items:
        db.add(BillItem(bill_id=bill.bill_id, description=item.description, amount=item.amount))

    db.commit()

    # "Notify residents about maintenance bill generation" (design doc 1.7)
    for resident in _residents_of_flat(db, payload.flat_id):
        notification_service.create_notification(
            db,
            user_id=resident.user_id,
            notification_type="bill_generated",
            title="New maintenance bill",
            message=f"A bill of {amount} for {payload.billing_month} is due on {payload.due_date}.",
        )

    result = db.execute(select(MaintenanceBill).where(MaintenanceBill.bill_id == bill.bill_id).options(*_BILL_LOAD))
    return result.scalar_one()


def _residents_of_flat(db: Session, flat_id: int) -> list[ResidentProfile]:
    return db.query(ResidentProfile).filter(ResidentProfile.flat_id == flat_id).all()


def list_bills(db: Session, flat_id: Optional[int] = None) -> list[MaintenanceBill]:
    stmt = select(MaintenanceBill).options(*_BILL_LOAD)
    if flat_id is not None:
        stmt = stmt.where(MaintenanceBill.flat_id == flat_id)
    result = db.execute(stmt.order_by(MaintenanceBill.generated_at.desc()))
    return list(result.scalars().all())


def get_bill(db: Session, bill_id: int) -> MaintenanceBill:
    result = db.execute(select(MaintenanceBill).where(MaintenanceBill.bill_id == bill_id).options(*_BILL_LOAD))
    bill = result.scalar_one_or_none()
    if bill is None:
        raise NotFound("Bill not found.")
    return bill


def update_bill(db: Session, bill_id: int, payload: MaintenanceBillUpdate) -> MaintenanceBill:
    bill = get_bill(db, bill_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(bill, field, value)
    db.commit()
    db.refresh(bill)
    return bill


def list_my_bills(db: Session, flat_id: int) -> list[MaintenanceBill]:
    return list_bills(db, flat_id=flat_id)


# --------------------------------------------------------------------------
# Payments & receipts
# --------------------------------------------------------------------------
def _generate_receipt_number(payment_id: int) -> str:
    return f"RCPT-{ist_now().year}-{payment_id:06d}"


def create_payment(db: Session, payload: PaymentCreate) -> Payment:
    # BUGFIX (CODE_REVIEW.md 2): get_bill() was a plain, unlocked SELECT
    # -- two concurrent POST /payments for the same bill could both read
    # status="unpaid" before either commits, both pass every check below,
    # and both create a Payment + Receipt against one bill. Locking this
    # row for the rest of the transaction means the second concurrent
    # request blocks here until the first commits, then re-reads the
    # now-"paid" row and correctly hits the Conflict below instead of
    # double-booking the payment.
    bill = (
        db.query(MaintenanceBill)
        .filter(MaintenanceBill.bill_id == payload.bill_id)
        .with_for_update()
        .first()
    )
    if bill is None:
        raise NotFound("Bill not found.")

    if bill.status == "paid":
        raise Conflict("This bill has already been paid.")

    # BUGFIX (CODE_REVIEW.md 1.3): payload.amount was never checked
    # against the bill it's paying -- a client could submit amount=1
    # with status="success" against a much larger bill and the bill
    # would still flip to "paid" in full. This system doesn't support
    # partial payments (MaintenanceBill has a single `amount` and a
    # binary unpaid/paid status, no running balance to track against),
    # so a payment must cover the bill exactly or it's rejected outright
    # -- same principle as create_bill reconciling `amount` against
    # `items` rather than trusting a client-supplied total.
    if payload.amount != bill.amount:
        raise BadRequest(
            f"Payment amount ({payload.amount}) does not match the bill amount ({bill.amount})."
        )

    existing_ref = (
        db.query(Payment).filter(Payment.transaction_reference == payload.transaction_reference).first()
    )
    if existing_ref is not None:
        raise Conflict("A payment with this transaction reference already exists.")

    payment = Payment(
        bill_id=payload.bill_id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        transaction_reference=payload.transaction_reference,
        status=payload.status,
    )
    if payload.status == "success":
        payment.paid_at = ist_now()
    db.add(payment)
    db.flush()

    if payload.status == "success":
        bill.status = "paid"
        # BUGFIX: the reference never actually created a Receipt anywhere,
        # and its ReceiptCreate schema let a client pick the
        # receipt_number themselves (spoofable/collidable). Auto-generated
        # here, the moment a payment actually succeeds.
        db.add(
            Receipt(
                payment_id=payment.payment_id,
                receipt_number=_generate_receipt_number(payment.payment_id),
            )
        )

        for resident in _residents_of_flat(db, bill.flat_id):
            notification_service.create_notification(
                db,
                user_id=resident.user_id,
                notification_type="payment_success",
                title="Payment received",
                message=f"Your payment of {payment.amount} for bill #{bill.bill_id} was received. Thank you!",
            )

    db.commit()
    db.refresh(payment)
    return payment


def update_payment_status(db: Session, payment_id: int, new_status: str) -> Payment:
    """
    Gap-fill (CODE_REVIEW.md 3.6): PaymentCreate.status could be
    "pending", but nothing anywhere ever moved a pending payment
    forward -- the caller had to create an entirely new Payment row
    with a different transaction_reference just to actually complete
    the bill. This is the missing "gateway callback" half of the same
    mocked-payment-gateway pattern already documented on
    PaymentCreate.status. Only a "pending" payment can be transitioned,
    and only once -- success/failed are terminal, matching how a real
    gateway callback would behave.
    """
    # Lock both rows up front, same pattern as create_payment's race fix
    # (CODE_REVIEW.md 2) -- two concurrent PATCHes on the same payment
    # shouldn't both be able to flip it and both flip the bill to paid.
    payment = (
        db.query(Payment)
        .filter(Payment.payment_id == payment_id)
        .with_for_update()
        .first()
    )
    if payment is None:
        raise NotFound("Payment not found.")

    if payment.status != "pending":
        raise Conflict(f"This payment is already '{payment.status}' and can't be changed.")

    bill = (
        db.query(MaintenanceBill)
        .filter(MaintenanceBill.bill_id == payment.bill_id)
        .with_for_update()
        .first()
    )
    if bill is None:
        raise NotFound("Bill not found.")

    if new_status == "success":
        if bill.status == "paid":
            raise Conflict("This bill has already been paid by another payment.")
        # Same amount-must-match-the-bill rule as create_payment (CODE_REVIEW.md 1.3).
        if payment.amount != bill.amount:
            raise BadRequest(
                f"Payment amount ({payment.amount}) does not match the bill amount ({bill.amount})."
            )
        payment.status = "success"
        payment.paid_at = ist_now()
        bill.status = "paid"
        db.add(
            Receipt(
                payment_id=payment.payment_id,
                receipt_number=_generate_receipt_number(payment.payment_id),
            )
        )
        for resident in _residents_of_flat(db, bill.flat_id):
            notification_service.create_notification(
                db,
                user_id=resident.user_id,
                notification_type="payment_success",
                title="Payment received",
                message=f"Your payment of {payment.amount} for bill #{bill.bill_id} was received. Thank you!",
            )
    else:
        payment.status = "failed"

    db.commit()
    db.refresh(payment)
    return payment


def list_payments(db: Session, bill_id: Optional[int] = None) -> list[Payment]:
    stmt = select(Payment)
    if bill_id is not None:
        stmt = stmt.where(Payment.bill_id == bill_id)
    result = db.execute(stmt.order_by(Payment.created_at.desc()))
    return list(result.scalars().all())


def get_payment(db: Session, payment_id: int) -> Payment:
    result = db.execute(select(Payment).where(Payment.payment_id == payment_id))
    payment = result.scalar_one_or_none()
    if payment is None:
        raise NotFound("Payment not found.")
    return payment


def list_my_payments(db: Session, flat_id: int) -> list[Payment]:
    stmt = (
        select(Payment)
        .join(MaintenanceBill, Payment.bill_id == MaintenanceBill.bill_id)
        .where(MaintenanceBill.flat_id == flat_id)
    )
    result = db.execute(stmt.order_by(Payment.created_at.desc()))
    return list(result.scalars().all())


def get_receipt_for_payment(db: Session, payment_id: int) -> Receipt:
    receipt = db.query(Receipt).filter(Receipt.payment_id == payment_id).first()
    if receipt is None:
        raise NotFound("No receipt exists for this payment (it may not have succeeded yet).")
    return receipt


# --------------------------------------------------------------------------
# "Provide administrators with billing records and financial summaries"
# --------------------------------------------------------------------------
def billing_summary(db: Session) -> dict:
    bills = db.query(MaintenanceBill).all()
    total_billed = sum((b.amount for b in bills), Decimal("0"))
    total_outstanding = sum((b.amount for b in bills if b.status != "paid"), Decimal("0"))
    unpaid_count = sum(1 for b in bills if b.status != "paid")
    return {
        "total_billed": total_billed,
        "total_collected": total_billed - total_outstanding,
        "total_outstanding": total_outstanding,
        "unpaid_bill_count": unpaid_count,
    }