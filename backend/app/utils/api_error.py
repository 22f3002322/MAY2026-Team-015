"""
Renamed from errors.py. Standard error-response shape:

    { "success": false, "message": "Invalid email or password" }

AppError is the one exception type routers/services raise for expected,
user-facing errors. main.py's global exception handlers turn any AppError
-- and, as a safety net, any stray fastapi/starlette HTTPException that
slips out of a dependency (e.g. OAuth2PasswordBearer's automatic 401) --
into that same shape, so every error response the API returns looks
identical regardless of where it was raised.

`details` is optional, internal-only payload (e.g. per-field validation
errors). main.py surfaces it under an additional "errors" key when
present, but every error response always has "success" and "message".
"""
from typing import Any


class AppError(Exception):
    def __init__(self, status_code: int, message: str, details: Any = None):
        self.status_code = status_code
        self.message = message
        self.details = details
        super().__init__(message)


class BadRequest(AppError):
    def __init__(self, message: str = "Bad request."):
        super().__init__(400, message)


class InvalidCredentials(AppError):
    def __init__(self, message: str = "Invalid email or password."):
        super().__init__(401, message)


class NotAuthenticated(AppError):
    def __init__(self, message: str = "Not authenticated."):
        super().__init__(401, message)


class Deactivated(AppError):
    def __init__(self, message: str = "This account has been deactivated."):
        super().__init__(403, message)


class NotAuthorized(AppError):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(403, message)


class NotFound(AppError):
    def __init__(self, message: str = "Resource not found."):
        super().__init__(404, message)


class Conflict(AppError):
    def __init__(self, message: str):
        super().__init__(409, message)


class ValidationFailed(AppError):
    def __init__(self, message: str = "Request validation failed.", details: Any = None):
        super().__init__(422, message, details=details)


class ServerError(AppError):
    def __init__(self, message: str = "Something went wrong. Please try again."):
        super().__init__(500, message)
