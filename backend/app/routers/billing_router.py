from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    get_resident_profile,
    require_admin_or_committee,
    require_resident,
)
from app.models.apartment import ResidentProfile
from app.models.auth import RoleEnum, User
from app.services import billing_service
from app.schemas.billing_schema import (
    BillingSummaryOut,
    MaintenanceBillCreate,
    MaintenanceBillOut,
    MaintenanceBillUpdate,
    PaymentCreate,
    PaymentOut,
    ReceiptOut,
)
from app.utils.api_error import NotAuthorized
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/admin/bills", tags=["billing"])


@router.post("")
def create_bill(payload: MaintenanceBillCreate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    bill = billing_service.create_bill(db, payload)
    return success_response(data=MaintenanceBillOut.model_validate(bill), message="Bill generated.")


@router.get("/summary")
def get_billing_summary(_staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    summary = billing_service.billing_summary(db)
    return success_response(data=BillingSummaryOut(**summary))


@router.get("")
def list_bills(
    flat_id: Optional[int] = Query(default=None),
    _staff: User = Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    bills = billing_service.list_bills(db, flat_id=flat_id)
    return success_response(data=[MaintenanceBillOut.model_validate(b) for b in bills])


@router.get("/{bill_id}")
def get_bill(bill_id: int, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    bill = billing_service.get_bill(db, bill_id)
    return success_response(data=MaintenanceBillOut.model_validate(bill))


@router.patch("/{bill_id}")
def update_bill(bill_id: int, payload: MaintenanceBillUpdate, _staff: User = Depends(require_admin_or_committee), db: Session = Depends(get_db)):
    bill = billing_service.update_bill(db, bill_id, payload)
    return success_response(data=MaintenanceBillOut.model_validate(bill), message="Bill updated.")


# --------------------------------------------------------------------------
# Resident-facing "my bills / my payments" -- BUGFIX: the reference had
# list_my_bills()/list_my_payments() in the service layer but no router
# ever called them, so a resident had no way to see their own billing
# history at all.
# --------------------------------------------------------------------------
router_my_billing = APIRouter(prefix="/api/v1/billing/me", tags=["billing"])


@router_my_billing.get("/bills")
def list_my_bills(current_user: User = Depends(require_resident), profile: ResidentProfile = Depends(get_resident_profile), db: Session = Depends(get_db)):
    bills = billing_service.list_my_bills(db, profile.flat_id) if profile.flat_id else []
    return success_response(data=[MaintenanceBillOut.model_validate(b) for b in bills])


@router_my_billing.get("/payments")
def list_my_payments(current_user: User = Depends(require_resident), profile: ResidentProfile = Depends(get_resident_profile), db: Session = Depends(get_db)):
    payments = billing_service.list_my_payments(db, profile.flat_id) if profile.flat_id else []
    return success_response(data=[PaymentOut.model_validate(p) for p in payments])


# --------------------------------------------------------------------------
# Payments & receipts
# --------------------------------------------------------------------------
router_payments = APIRouter(prefix="/api/v1/payments", tags=["payments"])


def _assert_can_touch_bill(db: Session, current_user: User, flat_id: int) -> None:
    """
    BUGFIX: the reference let ANY authenticated user pay or view ANY
    bill's payments -- no ownership check existed at all. Admin/
    Committee can touch any bill; a Resident only one for their own flat.
    """
    if current_user.role.role_name in (RoleEnum.ADMIN, RoleEnum.COMMITTEE):
        return
    if current_user.role.role_name == RoleEnum.RESIDENT:
        profile = get_resident_profile(current_user, db)
        if profile.flat_id == flat_id:
            return
        raise NotAuthorized("You can only manage payments for your own flat's bills.")
    raise NotAuthorized("You do not have permission to access this bill's payments.")


def _require_biller(current_user: User = Depends(get_current_user)) -> User:
    """
    BUGFIX (CODE_REVIEW.md 1.4): create_payment's route dependency used
    to be require_verified_resident, which hard-restricts the *entire*
    endpoint to Residents -- but _assert_can_touch_bill (above) already
    explicitly branches for Admin/Committee. That branch was dead code:
    FastAPI resolves require_verified_resident before the handler body
    ever runs, so an Admin/Committee caller got a 403 there first and
    never reached _assert_can_touch_bill at all. In practice there was
    no way to record a cash/manual payment an admin collected in
    person -- every payment had to be self-reported by the resident.
    Admin/Committee pass straight through here, same as everywhere else
    in this router; a Resident must still be verified, matching every
    other verified-resident-gated write path in the app. Ownership
    (which bill a Resident may pay) is still enforced by
    _assert_can_touch_bill, called right after this in create_payment.
    """
    role = current_user.role.role_name
    if role in (RoleEnum.ADMIN, RoleEnum.COMMITTEE):
        return current_user
    if role == RoleEnum.RESIDENT:
        if not current_user.is_verified:
            raise NotAuthorized(
                "Your account is pending verification by a committee member. "
                "This action isn't available until then."
            )
        return current_user
    raise NotAuthorized("You do not have permission to record payments.")


@router_payments.post("")
def create_payment(payload: PaymentCreate, current_user: User = Depends(_require_biller), db: Session = Depends(get_db)):
    bill = billing_service.get_bill(db, payload.bill_id)
    _assert_can_touch_bill(db, current_user, bill.flat_id)
    payment = billing_service.create_payment(db, payload)
    return success_response(data=PaymentOut.model_validate(payment), message="Payment recorded.")


@router_payments.get("")
def list_payments(
    bill_id: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.role_name in (RoleEnum.ADMIN, RoleEnum.COMMITTEE):
        payments = billing_service.list_payments(db, bill_id=bill_id)
    elif current_user.role.role_name == RoleEnum.RESIDENT:
        profile = get_resident_profile(current_user, db)
        payments = billing_service.list_my_payments(db, profile.flat_id) if profile.flat_id else []
        if bill_id is not None:
            payments = [p for p in payments if p.bill_id == bill_id]
    else:
        raise NotAuthorized("You do not have permission to view payments.")
    return success_response(data=[PaymentOut.model_validate(p) for p in payments])


@router_payments.get("/{payment_id}")
def get_payment(payment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payment = billing_service.get_payment(db, payment_id)
    bill = billing_service.get_bill(db, payment.bill_id)
    _assert_can_touch_bill(db, current_user, bill.flat_id)
    return success_response(data=PaymentOut.model_validate(payment))


@router_payments.get("/{payment_id}/receipt")
def get_receipt(payment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payment = billing_service.get_payment(db, payment_id)
    bill = billing_service.get_bill(db, payment.bill_id)
    _assert_can_touch_bill(db, current_user, bill.flat_id)
    receipt = billing_service.get_receipt_for_payment(db, payment_id)
    return success_response(data=ReceiptOut.model_validate(receipt))