"""
Seed the 5 roles and (if missing) a bootstrap Admin account.

There's no API path that can create the first Admin -- POST
/api/v1/auth/register-committee requires an existing Admin caller. This
script is the one-time bootstrap, safe to re-run (no-ops on anything that
already exists).

Usage:
    python -m scripts.seed
"""
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.auth import User, Role, RoleEnum
from app.utils.password import hash_password


def run() -> None:
    db = SessionLocal()
    try:
        for role_enum in RoleEnum:
            if not db.query(Role).filter(Role.role_name == role_enum).first():
                db.add(Role(role_name=role_enum))
        db.commit()
        print(f"Roles seeded: {[r.value for r in RoleEnum]}")

        admin_role = db.query(Role).filter(Role.role_name == RoleEnum.ADMIN).first()
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing is None:
            admin = User(
                role_id=admin_role.role_id,
                full_name="Admin",
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.commit()
            print(
                f"Bootstrap admin created: {settings.ADMIN_EMAIL} "
                f"(password from ADMIN_PASSWORD env var -- change it after first login)."
            )
        else:
            print(f"Admin {settings.ADMIN_EMAIL} already exists, skipping.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
