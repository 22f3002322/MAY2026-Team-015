import bcrypt

from app.utils.api_error import BadRequest

# bcrypt only looks at the first 72 BYTES of the input and hard-errors (raises ValueError) on anything longer.

MAX_PASSWORD_BYTES = 72


def _check_length(password: str) -> None:
    if len(password.encode("utf-8")) > MAX_PASSWORD_BYTES:
        raise BadRequest(f"Password must be at most {MAX_PASSWORD_BYTES} bytes long.")


def hash_password(password: str) -> str:
    _check_length(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:

    # A too-long login attempt should fail authentication cleanly, not
    # crash the request -- so this path returns False instead of raising.
    
    if len(plain_password.encode("utf-8")) > MAX_PASSWORD_BYTES:
        return False
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )