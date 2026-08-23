import hashlib
import hmac
import secrets

from app.core.config import settings


def hash_otp(otp: str) -> str:
    return hmac.new(
        settings.OTP_HASH_SECRET.encode(), otp.encode(), hashlib.sha256
    ).hexdigest()


def generate_otp(length: int = 6) -> str:
    return "".join(secrets.choice("0123456789") for _ in range(length))


def verify_otp(otp: str, hashed: str) -> bool:
    return hmac.compare_digest(hash_otp(otp), hashed)


def verify_plain_otp(otp: str, stored: str | None) -> bool:
    """
    Timing-safe comparison for a plaintext-stored visitor OTP (see
    visitor_service.create_visitor_request). hash_otp/verify_otp above
    are no longer used by the visitor flow -- left defined rather than
    removed, in case anything else ever needs a hashed OTP.

    Product trade-off, explicitly requested and accepted: there's no
    email/SMS gateway wired up yet, so the resident has no way to
    receive the code a second time except by re-reading it from the
    app themselves -- see visitors_router.list_my_requests, the only
    place this ever gets read back, scoped to the owning resident and
    only while the request is still "expected". Still routed through
    hmac.compare_digest (rather than `==`) purely to avoid a naive
    timing side-channel on the comparison itself.
    """
    if not stored:
        return False
    return hmac.compare_digest(otp, stored)