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