"""
Seed roles, bootstrap Admin, and a full Indian-society demo dataset.

Safe to re-run:
  - roles / admin are created only if missing
  - demo data is skipped if the marker user already exists

Usage:
    python -m scripts.seed

Demo login password for all seeded non-admin accounts:
    Demo@1234
"""
from __future__ import annotations

from datetime import time, timedelta
from decimal import Decimal

from app.core.config import settings
from app.core.database import SessionLocal
from app.models import (
    Announcement,
    BillItem,
    Block,
    Complaint,
    ComplaintAssignment,
    ComplaintCategory,
    ComplaintComment,
    ComplaintImage,
    Facility,
    FacilityBooking,
    Flat,
    MaintenanceBill,
    MaintenanceStaff,
    MaintenanceTask,
    Notification,
    OccupancyHistory,
    Payment,
    Poll,
    PollOption,
    PollVote,
    Receipt,
    ResidentProfile,
    Role,
    SecurityGuard,
    User,
    Visitor,
    VisitorLog,
    VisitorRequest,
)
from app.models.auth import RoleEnum
from app.models.mixins import ist_now
from app.utils.password import hash_password

DEMO_PASSWORD = "Demo@1234"
DEMO_MARKER_EMAIL = "ananya.iyer@neighbourly.com"
SOCIETY_NAME = "Shanti Vihar Apartments"


def _get_role(db, role_enum: RoleEnum) -> Role:
    role = db.query(Role).filter(Role.role_name == role_enum).first()
    if role is None:
        raise RuntimeError(f"Role {role_enum.value} missing — seed roles first.")
    return role


def _ensure_user(
    db,
    *,
    email: str,
    full_name: str,
    phone: str,
    role: Role,
    verified: bool = True,
    active: bool = True,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user is not None:
        return user
    user = User(
        role_id=role.role_id,
        full_name=full_name,
        email=email,
        phone=phone,
        password_hash=hash_password(DEMO_PASSWORD),
        is_active=active,
        is_verified=verified,
        last_login=ist_now() - timedelta(hours=2),
    )
    db.add(user)
    db.flush()
    return user


def seed_roles(db) -> None:
    for role_enum in RoleEnum:
        if not db.query(Role).filter(Role.role_name == role_enum).first():
            db.add(Role(role_name=role_enum))
    db.commit()
    print(f"Roles seeded: {[r.value for r in RoleEnum]}")


def seed_admin(db) -> None:
    admin_role = _get_role(db, RoleEnum.ADMIN)
    existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if existing is None:
        admin = User(
            role_id=admin_role.role_id,
            full_name="System Admin",
            email=settings.ADMIN_EMAIL,
            phone="9999999999",
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        db.commit()
        print(
            f"Bootstrap admin created: {settings.ADMIN_EMAIL} "
            f"(password from ADMIN_PASSWORD env var)."
        )
    else:
        print(f"Admin {settings.ADMIN_EMAIL} already exists, skipping.")


def seed_demo(db) -> None:
    if db.query(User).filter(User.email == DEMO_MARKER_EMAIL).first():
        print("Demo data already present (marker user found), skipping demo seed.")
        return

    print(f"Seeding Indian demo dataset for {SOCIETY_NAME}...")

    roles = {r.value: _get_role(db, r) for r in RoleEnum}
    today = ist_now().date()
    now = ist_now()

    # ── Users ──────────────────────────────────────────────────────────────
    committee = _ensure_user(
        db,
        email=DEMO_MARKER_EMAIL,
        full_name="Ananya Iyer",
        phone="9876501001",
        role=roles["Committee"],
    )
    committee2 = _ensure_user(
        db,
        email="rajesh.menon@neighbourly.com",
        full_name="Rajesh Menon",
        phone="9876501002",
        role=roles["Committee"],
    )

    residents_spec = [
        ("priya.sharma@neighbourly.com", "Priya Sharma", "9876502001", "Software Engineer"),
        ("arjun.patel@neighbourly.com", "Arjun Patel", "9876502002", "Chartered Accountant"),
        ("sneha.reddy@neighbourly.com", "Sneha Reddy", "9876502003", "Doctor"),
        ("vikram.singh@neighbourly.com", "Vikram Singh", "9876502004", "Bank Manager"),
        ("meera.krishnan@neighbourly.com", "Meera Krishnan", "9876502005", "Teacher"),
        ("rohan.deshmukh@neighbourly.com", "Rohan Deshmukh", "9876502006", "Product Manager"),
        ("kavya.nair@neighbourly.com", "Kavya Nair", "9876502007", "Architect"),
        ("pending.gupta@neighbourly.com", "Aman Gupta", "9876502008", "Student"),  # unverified
    ]
    resident_users: list[User] = []
    for i, (email, name, phone, _) in enumerate(residents_spec):
        verified = email != "pending.gupta@neighbourly.com"
        resident_users.append(
            _ensure_user(
                db,
                email=email,
                full_name=name,
                phone=phone,
                role=roles["Resident"],
                verified=verified,
            )
        )

    security_users = [
        _ensure_user(
            db,
            email="ramesh.yadav@neighbourly.com",
            full_name="Ramesh Yadav",
            phone="9876503001",
            role=roles["Security"],
        ),
        _ensure_user(
            db,
            email="suresh.kulkarni@neighbourly.com",
            full_name="Suresh Kulkarni",
            phone="9876503002",
            role=roles["Security"],
        ),
    ]
    maintenance_users = [
        _ensure_user(
            db,
            email="deepak.verma@neighbourly.com",
            full_name="Deepak Verma",
            phone="9876504001",
            role=roles["Maintenance"],
        ),
        _ensure_user(
            db,
            email="amit.joshi@neighbourly.com",
            full_name="Amit Joshi",
            phone="9876504002",
            role=roles["Maintenance"],
        ),
    ]
    db.flush()

    # ── Blocks & flats ─────────────────────────────────────────────────────
    block_a = Block(block_name="A-Wing", total_flats=12)
    block_b = Block(block_name="B-Wing", total_flats=12)
    block_c = Block(block_name="C-Wing", total_flats=10)
    db.add_all([block_a, block_b, block_c])
    db.flush()

    flats: list[Flat] = []
    flat_layouts = [
        (block_a, ["101", "102", "103", "104", "201", "202", "203", "204"]),
        (block_b, ["101", "102", "103", "104", "201", "202", "203", "204"]),
        (block_c, ["101", "102", "103", "201", "202", "203"]),
    ]
    for block, numbers in flat_layouts:
        for number in numbers:
            floor = int(number[0])
            ftype = "2BHK" if int(number) % 2 == 0 else "3BHK"
            flats.append(
                Flat(
                    block_id=block.block_id,
                    flat_number=number,
                    floor_number=floor,
                    flat_type=ftype,
                    occupancy_status="vacant",
                )
            )
    db.add_all(flats)
    db.flush()

    # Assign first 7 verified residents to flats; leave some vacant for demos
    profiles: list[ResidentProfile] = []
    for (_, _, _, occupation), user, flat in zip(
        residents_spec[:7], resident_users[:7], flats[:7]
    ):
        profile = ResidentProfile(
            user_id=user.user_id,
            flat_id=flat.flat_id,
            emergency_contact="9876511111",
            alternate_phone=user.phone,
            occupation=occupation,
        )
        profiles.append(profile)
        flat.occupancy_status = "occupied"

    # Unverified resident requested a flat but has no occupancy yet
    pending_user = resident_users[7]
    pending_profile = ResidentProfile(
        user_id=pending_user.user_id,
        flat_id=flats[7].flat_id,
        emergency_contact="9876522222",
        occupation=residents_spec[7][3],
    )
    profiles.append(pending_profile)
    db.add_all(profiles)
    db.flush()

    for profile, flat in zip(profiles[:7], flats[:7]):
        db.add(
            OccupancyHistory(
                resident_id=profile.resident_id,
                flat_id=flat.flat_id,
                occupancy_type="Owner" if profile.resident_id % 2 else "Rental",
                move_in_date=today - timedelta(days=120 + profile.resident_id * 10),
                is_current=True,
            )
        )

    # ── Staff profiles ─────────────────────────────────────────────────────
    guards = [
        SecurityGuard(user_id=security_users[0].user_id, gate_assigned="Main Gate", shift="Morning"),
        SecurityGuard(user_id=security_users[1].user_id, gate_assigned="Service Gate", shift="Night"),
    ]
    staff = [
        MaintenanceStaff(
            user_id=maintenance_users[0].user_id,
            specialization="Plumbing & Water Supply",
            experience_years=8,
            is_available=True,
        ),
        MaintenanceStaff(
            user_id=maintenance_users[1].user_id,
            specialization="Electrical & AC",
            experience_years=6,
            is_available=True,
        ),
    ]
    db.add_all(guards + staff)
    db.flush()

    # ── Facilities ─────────────────────────────────────────────────────────
    facilities = [
        Facility(
            facility_name="Club House",
            description="Community hall for meetings, birthdays and festivals.",
            capacity=80,
            opening_time=time(8, 0),
            closing_time=time(22, 0),
            slot_duration=60,
            maximum_duration=240,
        ),
        Facility(
            facility_name="Swimming Pool",
            description="Temperature-controlled pool with separate kids area.",
            capacity=30,
            opening_time=time(6, 0),
            closing_time=time(20, 0),
            slot_duration=60,
            maximum_duration=120,
        ),
        Facility(
            facility_name="Gym",
            description="Fully equipped gym with cardio and strength zones.",
            capacity=20,
            opening_time=time(5, 30),
            closing_time=time(22, 0),
            slot_duration=60,
            maximum_duration=120,
        ),
        Facility(
            facility_name="Party Hall",
            description="AC banquet hall for functions, with pantry access.",
            capacity=120,
            opening_time=time(9, 0),
            closing_time=time(23, 0),
            slot_duration=120,
            maximum_duration=360,
        ),
        Facility(
            facility_name="Tennis Court",
            description="Floodlit synthetic tennis court.",
            capacity=4,
            opening_time=time(6, 0),
            closing_time=time(21, 0),
            slot_duration=60,
            maximum_duration=120,
        ),
    ]
    db.add_all(facilities)
    db.flush()

    bookings = [
        FacilityBooking(
            facility_id=facilities[0].facility_id,
            resident_id=profiles[0].resident_id,
            booking_date=today + timedelta(days=3),
            start_time=time(17, 0),
            end_time=time(20, 0),
            status="approved",
            approved_at=now - timedelta(days=1),
        ),
        FacilityBooking(
            facility_id=facilities[1].facility_id,
            resident_id=profiles[1].resident_id,
            booking_date=today + timedelta(days=1),
            start_time=time(7, 0),
            end_time=time(8, 0),
            status="booked",
        ),
        FacilityBooking(
            facility_id=facilities[2].facility_id,
            resident_id=profiles[2].resident_id,
            booking_date=today - timedelta(days=2),
            start_time=time(18, 0),
            end_time=time(19, 0),
            status="completed",
            approved_at=now - timedelta(days=3),
        ),
        FacilityBooking(
            facility_id=facilities[3].facility_id,
            resident_id=profiles[3].resident_id,
            booking_date=today + timedelta(days=10),
            start_time=time(16, 0),
            end_time=time(21, 0),
            status="cancelled",
            cancelled_by=committee.user_id,
            cancelled_at=now - timedelta(hours=5),
        ),
    ]
    db.add_all(bookings)

    # ── Complaints ─────────────────────────────────────────────────────────
    categories = [
        ComplaintCategory(category_name="Plumbing"),
        ComplaintCategory(category_name="Electrical"),
        ComplaintCategory(category_name="Housekeeping"),
        ComplaintCategory(category_name="Civil / Structural"),
        ComplaintCategory(category_name="Security & Safety"),
    ]
    db.add_all(categories)
    db.flush()

    complaints = [
        Complaint(
            resident_id=profiles[0].resident_id,
            category_id=categories[0].category_id,
            description="Kitchen sink leakage in A-101. Water dripping under the platform since yesterday.",
            priority="high",
            status="assigned",
        ),
        Complaint(
            resident_id=profiles[1].resident_id,
            category_id=categories[1].category_id,
            description="Living room tube light flickering and main switchboard gets warm.",
            priority="medium",
            status="in_progress",
        ),
        Complaint(
            resident_id=profiles[2].resident_id,
            category_id=categories[2].category_id,
            description="Staircase landing on 2nd floor needs deep cleaning after Holi decorations.",
            priority="low",
            status="open",
        ),
        Complaint(
            resident_id=profiles[3].resident_id,
            category_id=categories[3].category_id,
            description="Balcony railing paint peeling and minor plaster cracks near the corner.",
            priority="medium",
            status="resolved",
            resolved_at=now - timedelta(days=2),
        ),
        Complaint(
            resident_id=profiles[4].resident_id,
            category_id=categories[4].category_id,
            description="Visitor parking area CCTV camera near C-Wing appears offline.",
            priority="high",
            status="closed",
            resolved_at=now - timedelta(days=5),
            closed_at=now - timedelta(days=4),
        ),
    ]
    db.add_all(complaints)
    db.flush()

    db.add(
        ComplaintImage(
            complaint_id=complaints[0].complaint_id,
            url="/media/demo/sink-leak.jpg",
        )
    )
    db.add_all(
        [
            ComplaintAssignment(
                complaint_id=complaints[0].complaint_id,
                assigned_to=staff[0].staff_id,
                assigned_at=now - timedelta(hours=20),
            ),
            ComplaintAssignment(
                complaint_id=complaints[1].complaint_id,
                assigned_to=staff[1].staff_id,
                assigned_at=now - timedelta(hours=12),
            ),
            ComplaintAssignment(
                complaint_id=complaints[3].complaint_id,
                assigned_to=staff[0].staff_id,
                assigned_at=now - timedelta(days=4),
            ),
        ]
    )
    db.add_all(
        [
            MaintenanceTask(
                complaint_id=complaints[0].complaint_id,
                staff_id=staff[0].staff_id,
                status="accepted",
                accepted_at=now - timedelta(hours=18),
                scheduled_at=now + timedelta(hours=6),
            ),
            MaintenanceTask(
                complaint_id=complaints[1].complaint_id,
                staff_id=staff[1].staff_id,
                status="in_progress",
                accepted_at=now - timedelta(hours=10),
                scheduled_at=now - timedelta(hours=2),
                started_at=now - timedelta(hours=1),
            ),
            MaintenanceTask(
                complaint_id=complaints[3].complaint_id,
                staff_id=staff[0].staff_id,
                status="completed",
                accepted_at=now - timedelta(days=4),
                scheduled_at=now - timedelta(days=3),
                started_at=now - timedelta(days=3) + timedelta(hours=2),
                completed_at=now - timedelta(days=2),
            ),
        ]
    )
    db.add_all(
        [
            ComplaintComment(
                complaint_id=complaints[0].complaint_id,
                user_id=committee.user_id,
                feedback="Assigned to Deepak bhai from plumbing. Please keep bucket under the sink till then.",
            ),
            ComplaintComment(
                complaint_id=complaints[3].complaint_id,
                user_id=resident_users[3].user_id,
                feedback="Issue fixed properly. Thank you!",
                rating=5,
            ),
        ]
    )

    # ── Visitors ───────────────────────────────────────────────────────────
    visitors = [
        Visitor(visitor_name="Rahul Mehta", phone="9988776655", visitor_type="guest"),
        Visitor(visitor_name="Swiggy Delivery", phone="9900112233", visitor_type="delivery"),
        Visitor(visitor_name="Neha Kapoor", phone="9811223344", visitor_type="guest"),
        Visitor(visitor_name="Amazon Delivery", phone="9001122334", visitor_type="delivery"),
        Visitor(visitor_name="Dr. Sanjay Rao", phone="9822334455", visitor_type="guest"),
    ]
    db.add_all(visitors)
    db.flush()

    # NOTE: OTPs are now stored in plaintext (see
    # visitor_service.create_visitor_request) -- seeded directly as
    # plain values below, matching what a real pre-register would store.
    demo_otp_plain = "482913"
    visitor_requests = [
        VisitorRequest(
            resident_id=profiles[0].resident_id,
            visitor_id=visitors[0].visitor_id,
            expected_date=today,
            expected_time=time(18, 30),
            status="expected",
            otp=demo_otp_plain,
        ),
        VisitorRequest(
            resident_id=profiles[1].resident_id,
            visitor_id=visitors[1].visitor_id,
            expected_date=today,
            expected_time=time(13, 0),
            status="arrived",
            approved_at=now - timedelta(hours=3),
            otp="111222",
        ),
        VisitorRequest(
            resident_id=profiles[2].resident_id,
            visitor_id=visitors[2].visitor_id,
            expected_date=today + timedelta(days=1),
            expected_time=time(11, 0),
            status="expected",
            otp="334455",
        ),
        VisitorRequest(
            resident_id=profiles[4].resident_id,
            visitor_id=visitors[4].visitor_id,
            expected_date=today - timedelta(days=1),
            expected_time=time(16, 0),
            status="arrived",
            approved_at=now - timedelta(days=1, hours=2),
            otp="667788",
        ),
    ]
    db.add_all(visitor_requests)
    db.flush()

    db.add_all(
        [
            VisitorLog(
                visitor_id=visitors[1].visitor_id,
                resident_id=profiles[1].resident_id,
                security_guard_id=guards[0].guard_id,
                request_id=visitor_requests[1].request_id,
                otp_verified=True,
                entry_time=now - timedelta(hours=3),
                exit_time=now - timedelta(hours=2, minutes=40),
            ),
            VisitorLog(
                visitor_id=visitors[4].visitor_id,
                resident_id=profiles[4].resident_id,
                security_guard_id=guards[1].guard_id,
                request_id=visitor_requests[3].request_id,
                otp_verified=True,
                entry_time=now - timedelta(days=1, hours=2),
                exit_time=now - timedelta(days=1, hours=1),
            ),
            VisitorLog(
                visitor_id=visitors[3].visitor_id,
                resident_id=profiles[5].resident_id,
                security_guard_id=guards[0].guard_id,
                request_id=None,
                otp_verified=False,
                entry_time=now - timedelta(hours=5),
                exit_time=now - timedelta(hours=4, minutes=50),
            ),
        ]
    )

    # ── Billing ────────────────────────────────────────────────────────────
    billing_month = today.strftime("%Y-%m")
    prev_month_date = (today.replace(day=1) - timedelta(days=1))
    prev_month = prev_month_date.strftime("%Y-%m")

    bills: list[MaintenanceBill] = []
    for i, flat in enumerate(flats[:7]):
        amount = Decimal("3500.00") + Decimal(i * 150)
        due = today + timedelta(days=10) if i < 4 else today - timedelta(days=5)
        status = "unpaid" if i < 4 else "paid"
        month = billing_month if i < 4 else prev_month
        bill = MaintenanceBill(
            flat_id=flat.flat_id,
            billing_month=month,
            amount=amount,
            due_date=due,
            status=status,
            generated_at=now - timedelta(days=8),
        )
        bills.append(bill)
    db.add_all(bills)
    db.flush()

    for bill in bills:
        maintenance = (bill.amount * Decimal("0.70")).quantize(Decimal("0.01"))
        sinking = (bill.amount * Decimal("0.20")).quantize(Decimal("0.01"))
        water = bill.amount - maintenance - sinking
        db.add_all(
            [
                BillItem(bill_id=bill.bill_id, description="Maintenance charges", amount=maintenance),
                BillItem(bill_id=bill.bill_id, description="Sinking fund", amount=sinking),
                BillItem(bill_id=bill.bill_id, description="Water charges", amount=water),
            ]
        )

    for idx, bill in enumerate(bills[4:]):
        payment = Payment(
            bill_id=bill.bill_id,
            amount=bill.amount,
            payment_method="upi",
            transaction_reference=f"UPI-SHANTI-{bill.bill_id:04d}-{idx}",
            status="success",
            paid_at=now - timedelta(days=3 - idx),
        )
        db.add(payment)
        db.flush()
        db.add(
            Receipt(
                payment_id=payment.payment_id,
                receipt_number=f"RCPT-SV-{today.year}-{payment.payment_id:04d}",
                file_path=None,
            )
        )

    # ── Announcements & notifications ──────────────────────────────────────
    announcements = [
        Announcement(
            title="Ganesh Chaturthi Celebration",
            description=(
                f"{SOCIETY_NAME} will host Ganesh sthapana in the Club House on Saturday 6 PM. "
                "All residents and families are invited. Prasad will be distributed after aarti."
            ),
            priority="high",
            published_at=now - timedelta(days=2),
            expiry_date=today + timedelta(days=10),
        ),
        Announcement(
            title="Water Tank Cleaning — A & B Wings",
            description=(
                "Overhead tank cleaning is scheduled this Wednesday 10 AM–1 PM. "
                "Kindly store water in advance. Inconvenience regretted."
            ),
            priority="urgent",
            published_at=now - timedelta(days=1),
            expiry_date=today + timedelta(days=3),
        ),
        Announcement(
            title="Monthly Maintenance Reminder",
            description="Please clear pending maintenance bills before the due date to avoid late fees.",
            priority="normal",
            published_at=now - timedelta(days=5),
            expiry_date=today + timedelta(days=20),
        ),
    ]
    db.add_all(announcements)

    notifications = [
        Notification(
            user_id=resident_users[0].user_id,
            notification_type="complaint_update",
            title="Complaint assigned",
            message="Your plumbing complaint for A-101 has been assigned to Deepak Verma.",
            is_read=False,
        ),
        Notification(
            user_id=resident_users[1].user_id,
            notification_type="booking_update",
            title="Facility booking received",
            message="Your swimming pool booking request for tomorrow 7 AM is awaiting approval.",
            is_read=False,
        ),
        Notification(
            user_id=resident_users[3].user_id,
            notification_type="billing",
            title="Payment successful",
            message="Maintenance bill payment via UPI was successful. Receipt is available in Bills.",
            is_read=True,
        ),
        Notification(
            user_id=resident_users[0].user_id,
            notification_type="announcement",
            title="Ganesh Chaturthi Celebration",
            message="Join the society celebration at the Club House this Saturday evening.",
            is_read=False,
        ),
        Notification(
            user_id=committee.user_id,
            notification_type="account_verified",
            title="Pending verification",
            message="Aman Gupta (C-Wing interest) is awaiting committee verification.",
            is_read=False,
        ),
    ]
    db.add_all(notifications)

    # ── Polls ──────────────────────────────────────────────────────────────
    poll_diwali = Poll(
        question="Should we hire a professional DJ for Diwali night at Shanti Vihar?",
        allow_multiple_votes=False,
        anonymous=False,
        start_date=today - timedelta(days=2),
        end_date=today + timedelta(days=12),
        is_active=True,
    )
    poll_parking = Poll(
        question="Preferred visitor parking rule for weekends?",
        allow_multiple_votes=False,
        anonymous=True,
        start_date=today - timedelta(days=20),
        end_date=today - timedelta(days=5),
        is_active=False,
    )
    db.add_all([poll_diwali, poll_parking])
    db.flush()

    diwali_options = [
        PollOption(poll_id=poll_diwali.poll_id, option_text="Yes, hire a DJ"),
        PollOption(poll_id=poll_diwali.poll_id, option_text="No, keep traditional music only"),
        PollOption(poll_id=poll_diwali.poll_id, option_text="Need more details on budget first"),
    ]
    parking_options = [
        PollOption(poll_id=poll_parking.poll_id, option_text="First-come free parking"),
        PollOption(poll_id=poll_parking.poll_id, option_text="Paid visitor slots only"),
        PollOption(poll_id=poll_parking.poll_id, option_text="Residents must pre-approve each visitor vehicle"),
    ]
    db.add_all(diwali_options + parking_options)
    db.flush()

    db.add_all(
        [
            PollVote(
                poll_id=poll_diwali.poll_id,
                option_id=diwali_options[0].option_id,
                user_id=resident_users[0].user_id,
            ),
            PollVote(
                poll_id=poll_diwali.poll_id,
                option_id=diwali_options[2].option_id,
                user_id=resident_users[1].user_id,
            ),
            PollVote(
                poll_id=poll_diwali.poll_id,
                option_id=diwali_options[0].option_id,
                user_id=resident_users[2].user_id,
            ),
            PollVote(
                poll_id=poll_parking.poll_id,
                option_id=parking_options[2].option_id,
                user_id=resident_users[3].user_id,
            ),
            PollVote(
                poll_id=poll_parking.poll_id,
                option_id=parking_options[0].option_id,
                user_id=resident_users[4].user_id,
            ),
        ]
    )

    db.commit()

    print("Demo seed complete.")
    print()
    print("=" * 64)
    print(f"  {SOCIETY_NAME} - demo credentials")
    print("=" * 64)
    print(f"  Admin (from .env):     {settings.ADMIN_EMAIL} / <ADMIN_PASSWORD>")
    print(f"  Committee:             {DEMO_MARKER_EMAIL} / {DEMO_PASSWORD}")
    print(f"  Committee:             rajesh.menon@neighbourly.com / {DEMO_PASSWORD}")
    print(f"  Resident (verified):   priya.sharma@neighbourly.com / {DEMO_PASSWORD}")
    print(f"  Resident (verified):   arjun.patel@neighbourly.com / {DEMO_PASSWORD}")
    print(f"  Resident (pending):    pending.gupta@neighbourly.com / {DEMO_PASSWORD}")
    print(f"  Security:              ramesh.yadav@neighbourly.com / {DEMO_PASSWORD}")
    print(f"  Maintenance:           deepak.verma@neighbourly.com / {DEMO_PASSWORD}")
    print(f"  Visitor OTP (expected): {demo_otp_plain}  (Priya -> Rahul Mehta)")
    print("=" * 64)
    print(f"  Also created: {committee2.full_name}, more residents, bills, polls, etc.")
    print("  refresh_tokens is intentionally left empty (login creates those).")
    print("=" * 64)


def run() -> None:
    db = SessionLocal()
    try:
        seed_roles(db)
        seed_admin(db)
        seed_demo(db)
    finally:
        db.close()


if __name__ == "__main__":
    run()