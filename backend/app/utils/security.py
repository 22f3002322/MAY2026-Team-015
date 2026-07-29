from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from app.core.config import settings


def create_access_token(data: dict) -> str:
  
    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({"exp": expire})

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    # payload: {"sub": str(user.id), "full_name": user.full_name, "email": user.email, "role": user.role.name, "exp": expire}

    return token


def verify_access_token(token: str):

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        return payload

    except ExpiredSignatureError:
        return None

    except InvalidTokenError:
        return None


# --------------------------------------------------------------------------
# Opaque tokens for refresh tokens / password-reset tokens.
# Deliberately NOT JWTs -- their only job is to be looked up server-side
# (Postgres for refresh tokens, Redis for password-reset tokens), so a
# random string + a server-side lookup is simpler and trivially revocable
# (a JWT refresh token would need its own server-side blacklist to be
# revocable anyway, so there's no benefit to encoding it).
# --------------------------------------------------------------------------
import hashlib
import secrets


def generate_opaque_token(n_bytes: int = 48) -> str:
    return secrets.token_urlsafe(n_bytes)


def hash_token(token: str) -> str:
    """
    SHA-256 hex digest of an opaque token, for storing refresh tokens at
    rest in Postgres (app/models/refresh_token.py). Refresh tokens are
    bearer secrets -- exactly like a password -- so, like
    `users.password_hash`, we never persist the raw value, only a hash we
    can look up by. (A fast hash is fine here, unlike a password hash:
    the input is already a 48-byte cryptographically random token, not a
    human-guessable secret, so there's no brute-force surface to slow
    down.)
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
