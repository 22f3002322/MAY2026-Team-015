import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.routers import auth_router
from app.routers import blocks_router
from app.routers import flats_router
from app.routers import profile_router
from app.routers import residents_router
from app.routers import complaint_router
from app.routers import maintenance_router
from app.routers import facilities_router
from app.routers import visitors_router
from app.utils.api_error import AppError
from app.utils.api_response import success_response

# logging.basicConfig(level=logging.INFO)


def _error_response(message: str, details=None) -> dict:
    body = {"success": False, "message": message}
    if details is not None:
        
        # Extra key for per-field validation errors. The two required keys (success, message) are always present.
        
        body["errors"] = details
    return body


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
    )

    app.add_middleware(
        CORSMiddleware,
        # BUGFIX: this list used to be hardcoded to
        # ["http://localhost:5173"] with no way to add a staging/prod
        # origin without editing code. Now driven by CORS_ORIGINS in
        # .env (comma-separated), defaulting to the same localhost value
        # for local dev. See app/core/config.py.
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError):
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_response(exc.message, exc.details),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(_: Request, exc: StarletteHTTPException):
        # Safety net for HTTPExceptions we didn't raise ourselves -- e.g.
        # OAuth2PasswordBearer's automatic 401 when no Authorization
        # header is sent, or FastAPI's own 404/405 for
        # unknown routes/methods. Without this handler those would fall
        # through to Starlette's default {"detail": ...} body instead of
        # our {"success": false, "message": ...} shape.
        detail = exc.detail if isinstance(exc.detail, str) else "Request failed."
        return JSONResponse(status_code=exc.status_code, content=_error_response(detail))

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content=_error_response("Request validation failed.", exc.errors()),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_: Request, exc: Exception):
        logging.getLogger("neighbourly").exception("Unhandled error")
        return JSONResponse(
            status_code=500,
            content=_error_response("Something went wrong. Please try again."),
        )

    app.include_router(auth_router.router)
    app.include_router(profile_router.router)
    app.include_router(blocks_router.router)
    app.include_router(flats_router.router)
    app.include_router(residents_router.router)
    app.include_router(complaint_router.router)
    app.include_router(complaint_router.router_categories_public)
    app.include_router(complaint_router.router_complaints)
    app.include_router(maintenance_router.router)
    app.include_router(facilities_router.router)
    app.include_router(facilities_router.router_bookings)
    app.include_router(visitors_router.router)

    # Serve uploaded media (resident profile pictures, etc.) statically.
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
    app.mount(settings.MEDIA_URL, StaticFiles(directory=settings.MEDIA_ROOT), name="media")

    @app.get("/health")
    async def health():
        return success_response(data={"status": "ok"})

    return app


app = create_app()