from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
                            env_file=".env", 
                            env_file_encoding="utf-8", 
                            case_sensitive=False,
                            ignore_extra=True
                            )
    # Application
    APP_NAME: str = "Neighbourly"
    APP_VERSION: str
    DEBUG: bool

    ENV: str = "development"

    # Database
    DATABASE_URL: str

    # Redis -- now used only for short-lived password-reset tokens.
    # Refresh tokens moved to Postgres, see app/models/refresh_token.py.
    REDIS_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    # Password reset
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int

    # OTP generation for Visitor Requests
    OTP_HASH_SECRET: str

    # Bootstrap admin (used only by scripts/seed.py)
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    # Media storage -- resident profile pictures today, room to grow
    # (complaint images, receipts, etc.) in later modules.
    # MEDIA_ROOT is a local filesystem path; MEDIA_URL is the path prefix
    # the app serves it under (see app.mount(...) in main.py).
    MEDIA_ROOT: str = "media"
    MEDIA_URL: str = "/media"

settings = Settings()

# To check if the settings are loaded correctly, you can uncomment the following line to print the settings:
# print(f"Loaded settings from .env: {settings.model_dump()}")