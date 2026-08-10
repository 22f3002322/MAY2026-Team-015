"""
Auth & Authorization service layer.

Schema: er-dbml.txt (roles, users, resident_profiles, maintenance_staff,
security_guards, refresh_tokens). full_name / phone / is_active /
is_verified / last_login all live on `users`, matching the diagram --
profile tables only hold the genuinely role-specific extra fields
(resident: flat_id/emergency_contact/alternate_phone/occupation/
profile_image; maintenance: specialization/experience_years/is_available;
security: gate_assigned/shift).

Workflow:
- Admin is seeded (scripts/seed.py), never created through the API.
- Admin creates Committee accounts -- top-down, generated password,
  auto-verified (is_verified=True; verification is not a concept that
  applies to admin-provisioned accounts).
- Resident / Maintenance / Security accounts are PUBLIC self-registrations
  (POST /signup, no auth required) -- they choose their own password and
  start with is_verified=False.
- is_active still independently gates login -- a freshly signed-up user
  CAN log in right away; is_verified is a separate business flag that
  later modules (complaints, bookings, etc.) check before granting full
  access -- see app.core.dependencies.require_roles_verified.

JWT: PyJWT via app.utils.security (create_access_token / verify_access_token).

Refresh tokens (Postgres, app.models.auth.RefreshToken)
------------------------------------------------------------------
Only a SHA-256 hash of the opaque token is stored (app.utils.security.
hash_token). Rotation is single-use: redeeming a refresh token revokes it
and links it (replaced_by_token_id) to the row minted in its place, so
reusing an already-rotated token is detectable and rejected.

Redis key schema (password reset only -- refresh tokens moved to Postgres)
----------------------------------------------------------------------------
pwdreset:{token}          -> "{user_id}"      TTL = PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
"""
import logging
from datetime import timedelta, timezone
from datetime import datetime as dt

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.staff import MaintenanceStaff, SecurityGuard
from app.models.mixins import ist_now
from app.models.apartment import OccupancyHistory, ResidentProfile
from app.models.auth import Role, RoleEnum, User, RefreshToken
from app.schemas.auth_schema import (
    CreateCommitteeRequest,
    MaintenanceProfileIn,
    ResidentProfileIn,
    SecurityProfileIn,
    SignupRequest,
)
from app.services import apartment_service
from app.services import notification_service
from app.utils.api_error import (
    BadRequest,
    Conflict,
    Deactivated,
    InvalidCredentials,
    NotAuthenticated,
    NotFound,
    ServerError,
)
from app.utils.password import hash_password, verify_password
from app.utils.security import create_access_token, generate_opaque_token, hash_token

logger = logging.getLogger("neighbourly.auth")

SELF_REGISTERABLE_ROLES = {RoleEnum.RESIDENT, RoleEnum.MAINTENANCE, RoleEnum.SECURITY}

# Applied at verification time if a Committee member doesn't specify
# otherwise -- see verify_user(). Most self-registered residents in a
# typical building are owners, so this keeps the common case a one-click
# verification while still allowing an explicit override for tenants.
DEFAULT_OCCUPANCY_TYPE = "Owner"

REFRESH_TOKEN_TTL = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
RESET_TTL_SECONDS = settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES * 60


# --------------------------------------------------------------------------
# Lookups
# --------------------------------------------------------------------------
def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.user_id == user_id).first()


def get_role(db: Session, role_enum: RoleEnum) -> Role | None:
    return db.query(Role).filter(Role.role_name == role_enum).first()


# --------------------------------------------------------------------------
# Authentication
# --------------------------------------------------------------------------
def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise InvalidCredentials("Incorrect email or password.")

    if not user.is_active:
        raise Deactivated()

    # Not gated on is_verified -- unverified users can still log in; it's
    # up to later modules to check is_verified before granting access to
    # specific features (see app.core.dependencies.require_roles_verified).
    user.last_login = ist_now()
    db.commit()

    return user


# --------------------------------------------------------------------------
# Token issuance / rotation / revocation (refresh tokens -> Postgres)
# --------------------------------------------------------------------------
def _resolve_flat_id(user: User) -> int | None:
    if user.role.role_name == RoleEnum.RESIDENT and user.resident_profile:
        return user.resident_profile.flat_id
    return None


def access_token_payload(user: User) -> dict:
    return {
        "sub": str(user.user_id),
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.role_name.value,
        "is_verified": user.is_verified,
        # BUGFIX (caught in testing): ist_now() is a NAIVE datetime that
        # numerically represents IST wall-clock time (see
        # app/models/mixins.py). Calling .timestamp() on a naive
        # datetime interprets it as the system's LOCAL timezone, not
        # IST -- on a UTC-clocked server this produced an "iat" ~5.5
        # hours in the future. PyJWT validates "iat" by default
        # (verify_iat=True) and rejects a token whose iat is in the
        # future, so every access token would fail verification. Use an
        # explicit UTC-aware timestamp instead, matching how `exp` is
        # computed in app/utils/security.py.
        "iat": int(dt.now(timezone.utc).timestamp()),
    }


def issue_token_pair(db: Session, user: User) -> tuple[str, str]:
    access_token = create_access_token(access_token_payload(user))

    refresh_token = generate_opaque_token()
    db.add(
        RefreshToken(
            user_id=user.user_id,
            token_hash=hash_token(refresh_token),
            expires_at=ist_now() + REFRESH_TOKEN_TTL,
        )
    )
    db.commit()

    return access_token, refresh_token


def rotate_refresh_token(db: Session, old_refresh_token: str) -> tuple[User, str, str]:
    old_hash = hash_token(old_refresh_token)
    token_row = db.query(RefreshToken).filter(RefreshToken.token_hash == old_hash).first()

    # BUGFIX: `token_row.expires_at` comes back from Postgres as a naive
    # datetime (the column is TIMESTAMP WITHOUT TIME ZONE). ist_now() now
    # returns a matching naive IST datetime (see mixins.py) instead of a
    # tz-aware one -- previously this comparison raised
    # "can't compare offset-naive and offset-aware datetimes" on every
    # call that found a non-revoked token, i.e. almost every real
    # refresh attempt.
    if token_row is None or token_row.revoked or token_row.expires_at < ist_now():
        raise NotAuthenticated("Invalid or expired refresh token.")

    user = get_user_by_id(db, token_row.user_id)
    if user is None or not user.is_active:
        raise NotAuthenticated("Invalid or expired refresh token.")

    new_access_token, new_refresh_token = issue_token_pair(db, user)

    # Retire the old token and link it to whatever replaced it, in the
    # same transaction as issuing the new pair.
    new_row = db.query(RefreshToken).filter(RefreshToken.token_hash == hash_token(new_refresh_token)).first()
    token_row.revoked = True
    token_row.revoked_at = ist_now()
    token_row.replaced_by_token_id = new_row.token_id
    db.commit()

    return user, new_access_token, new_refresh_token


def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    token_hash = hash_token(refresh_token)
    token_row = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if token_row is not None and not token_row.revoked:
        token_row.revoked = True
        token_row.revoked_at = ist_now()
        db.commit()


def revoke_all_refresh_tokens(db: Session, user_id: int) -> None:
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked.is_(False),
    ).update({"revoked": True, "revoked_at": ist_now()})
    db.commit()


# --------------------------------------------------------------------------
# Admin creates Committee -- the only account-creation path that needs an
# authenticated caller. Committee has no profile table in er-dbml.txt, so
# there's nothing to create beyond the `users` row.
# --------------------------------------------------------------------------
def create_committee_member(db: Session, payload: CreateCommitteeRequest) -> tuple[User, str]:
    if get_user_by_email(db, payload.email) is not None:
        raise Conflict(f"A user with email '{payload.email}' already exists.")

    role = get_role(db, RoleEnum.COMMITTEE)
    if role is None:
        raise ServerError("Committee role is not seeded. Run scripts/seed.py first.")

    user = User(
        role_id=role.role_id,
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        password_hash=hash_password(payload.password),
        is_active=True,
        is_verified=True,  # admin-provisioned -- not part of the self-signup/verification workflow
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # TODO(future notifications module): email this instead of returning
    # it in the API response once that module exists.
    logger.info("Admin provisioned committee member %s.", user.email)

    return user, payload.password


# --------------------------------------------------------------------------
# Public self-registration: Resident / Maintenance / Security
# --------------------------------------------------------------------------
def signup_user(db: Session, payload: SignupRequest) -> User:
    role_enum = RoleEnum(payload.role)
    if role_enum not in SELF_REGISTERABLE_ROLES:
        raise BadRequest("This role cannot self-register.")

    if get_user_by_email(db, payload.email) is not None:
        raise Conflict(f"A user with email '{payload.email}' already exists.")

    role = get_role(db, role_enum)
    if role is None:
        raise ServerError(f"Role '{role_enum.value}' is not seeded. Run scripts/seed.py first.")

    user = User(
        role_id=role.role_id,
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        password_hash=hash_password(payload.password),
        is_active=True,
        is_verified=False,  # pending committee verification
    )
    db.add(user)
    db.flush()  # assigns user.user_id without committing yet

    if role_enum == RoleEnum.RESIDENT:
        p = payload.resident_profile or ResidentProfileIn()
        if p.flat_id is not None:
            # BUGFIX (CODE_REVIEW.md 2): get_flat() used to be a plain,
            # unlocked SELECT here -- two near-simultaneous signups
            # against the same flat_id could both read
            # occupancy_status="vacant" and both find no
            # already_claimed row before either commits, since the
            # check below is application-level only (no DB uniqueness
            # constraint backs it). for_update=True locks the flat row
            # for the rest of this transaction (signup_user only
            # commits once, at the very end), so the second concurrent
            # signup blocks here until the first commits, then re-reads
            # and correctly hits one of the two Conflicts below.
            flat = apartment_service.get_flat(db, p.flat_id, for_update=True)  # raises NotFound if it doesn't exist
            if flat.occupancy_status != "vacant":
                raise Conflict(f"Flat '{flat.flat_number}' is already occupied.")
            # BUGFIX: occupancy_status only flips to "occupied" at
            # verification (move_in), not at signup -- so without this
            # check, a second resident could sign up against the same
            # still-"vacant" flat while the first signup is pending
            # committee review. Any resident_profile already pointing at
            # this flat_id (verified-and-current, or just pending) means
            # it's spoken for.
            already_claimed = (
                db.query(ResidentProfile)
                .filter(ResidentProfile.flat_id == p.flat_id)
                .first()
            )
            if already_claimed is not None:
                raise Conflict(
                    f"Flat '{flat.flat_number}' has already been requested by another "
                    "pending signup. Please contact a committee member."
                )
        db.add(
            ResidentProfile(
                user_id=user.user_id,
                flat_id=p.flat_id,
                emergency_contact=p.emergency_contact,
                alternate_phone=p.alternate_phone,
                occupation=p.occupation,
                # BUGFIX: profile_image is no longer accepted from the
                # signup payload -- see ResidentProfileIn in
                # auth_schema.py. It's only ever set via the validated
                # upload endpoint (profile_service.upload_profile_picture).
            )
        )
    
    elif role_enum == RoleEnum.MAINTENANCE:
        p = payload.maintenance_profile or MaintenanceProfileIn()
        db.add(
            MaintenanceStaff(
                user_id=user.user_id,
                specialization=p.specialization,
                experience_years=p.experience_years,
            )
        )
    
    elif role_enum == RoleEnum.SECURITY:
        p = payload.security_profile or SecurityProfileIn()
        db.add(
            SecurityGuard(
                user_id=user.user_id,
                gate_assigned=p.gate_assigned,
                shift=p.shift,
            )
        )

    db.commit()
    db.refresh(user)

    logger.info("Self-registration: %s signed up as %s (pending committee verification).", user.email, role_enum.value)

    return user


# --------------------------------------------------------------------------
# Committee verification workflow
# --------------------------------------------------------------------------
def list_pending_verifications(db: Session) -> list[User]:
    return (
        db.query(User)
        .join(Role)
        .filter(
            Role.role_name.in_(list(SELF_REGISTERABLE_ROLES)),
            User.is_verified.is_(False),
        )
        .order_by(User.created_at.asc())
        .all()
    )


def verify_user(db: Session, user_id: int, occupancy_type: str | None = None) -> User:
    user = get_user_by_id(db, user_id)
    if user is None:
        raise NotFound("User not found.")

    if user.role.role_name not in SELF_REGISTERABLE_ROLES:
        raise BadRequest("This role does not go through verification.")

    # If this Resident selected a flat at signup (resident_profiles.flat_id
    # was set then, but no occupancy_history row exists yet -- see
    # signup_user), this is the moment that request becomes official:
    # verification IS the move-in, dated to right now. Guarded by
    # `already_current` so re-verifying (or verifying someone an Admin
    # already moved in manually beforehand) is a harmless no-op rather
    # than a duplicate/conflicting move-in.
    needs_move_in = False
    profile = user.resident_profile
    if user.role.role_name == RoleEnum.RESIDENT and profile is not None and profile.flat_id is not None:
        already_current = (
            db.query(OccupancyHistory)
            .filter(
                OccupancyHistory.resident_id == profile.resident_id,
                OccupancyHistory.is_current.is_(True),
            )
            .first()
        )
        needs_move_in = already_current is None

    user.is_verified = True
    db.commit()
    db.refresh(user)

    if needs_move_in:
        apartment_service.move_in(
            db,
            profile.resident_id,
            profile.flat_id,
            occupancy_type or DEFAULT_OCCUPANCY_TYPE,
            ist_now().date(),
        )
        db.refresh(user)

    notification_service.create_notification(
        db,
        user_id=user.user_id,
        notification_type="account_verified",
        title="Account verified",
        message="Your account has been verified by a committee member. You now have full access.",
    )

    return user


# --------------------------------------------------------------------------
# Account deactivation / reactivation.
#
# BUGFIX (CODE_REVIEW.md 1.5): `Deactivated` is a real exception and
# both get_current_user and authenticate_user check `is_active` -- but
# nothing anywhere ever set it to False after account creation. There
# was no admin "suspend a bad actor" path at all short of a manual DB
# edit, unlike is_verified, which has a full read+write lifecycle
# (list_pending_verifications / verify_user). Deactivating also revokes
# every refresh token the user currently holds, same as a password
# reset, so an existing session dies immediately rather than staying
# valid until its access token naturally expires.
# --------------------------------------------------------------------------
def deactivate_user(db: Session, user_id: int, actor_user_id: int) -> User:
    if user_id == actor_user_id:
        raise BadRequest("You cannot deactivate your own account.")

    user = get_user_by_id(db, user_id)
    if user is None:
        raise NotFound("User not found.")

    if user.is_active:
        user.is_active = False
        db.commit()
        db.refresh(user)
        revoke_all_refresh_tokens(db, user.user_id)

    return user


def reactivate_user(db: Session, user_id: int) -> User:
    user = get_user_by_id(db, user_id)
    if user is None:
        raise NotFound("User not found.")

    if not user.is_active:
        user.is_active = True
        db.commit()
        db.refresh(user)

    return user


# --------------------------------------------------------------------------
# Password reset -- the only way to get a new password (no self-service
# change-password endpoint). Still backed by Redis (short-lived, TTL is
# exactly what Redis is good at); unrelated to the refresh-token store.
# --------------------------------------------------------------------------
def start_password_reset(db: Session, redis, email: str) -> None:
    user = get_user_by_email(db, email)
    if user is None:
        return  # no user enumeration -- same response either way

    token = generate_opaque_token()
    redis.set(f"pwdreset:{token}", str(user.user_id), ex=RESET_TTL_SECONDS)

    # TODO(future notifications module): email this instead of just logging it.
    logger.info("Password reset requested for %s. Reset token: %s", user.email, token)


def complete_password_reset(db: Session, redis, token: str, new_password: str) -> None:
    user_id_raw = redis.get(f"pwdreset:{token}")
    if not user_id_raw:
        raise BadRequest("This password reset link is invalid or has expired.")

    redis.delete(f"pwdreset:{token}")  # single-use

    user = get_user_by_id(db, int(user_id_raw))
    if user is None:
        raise NotFound("User no longer exists.")

    user.password_hash = hash_password(new_password)
    db.commit()

    revoke_all_refresh_tokens(db, user.user_id)