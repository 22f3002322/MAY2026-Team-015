from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
import enum
from sqlalchemy import Enum

from app.core.database import Base
from app.models.mixins import TimestampMixin
from app.models.mixins import ist_now

class RoleEnum(enum.Enum):
    ADMIN = "Admin"
    COMMITTEE = "Committee"
    RESIDENT = "Resident"
    SECURITY = "Security"
    MAINTENANCE = "Maintenance"


class Role(Base):
  
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True)
    role_name = Column(Enum(RoleEnum), unique=True, nullable=False)

    users = relationship("User", back_populates="role")



class User(Base, TimestampMixin):

    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False, index=True)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    last_login = Column(DateTime, nullable=True)


    # Relationships
    role = relationship("Role", back_populates="users")
    resident_profile = relationship(
        "ResidentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    maintenance_staff_profile = relationship(
        "MaintenanceStaff", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    security_guard_profile = relationship(
        "SecurityGuard", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    # Added: persisted refresh-token store (Postgres). See
    # app/models/refresh_token.py for why this replaced the Redis-only
    # implementation.
    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="RefreshToken.user_id",
    )
    complaint_comments = relationship("ComplaintComment", back_populates="user")
    # Added alongside the communication/community modules --
    # Notification.user and PollVote.user both declare
    # back_populates="..." pointing here, which requires the reverse
    # side to actually exist on User.
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    poll_votes = relationship("PollVote", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    """
    Persisted refresh-token store (Postgres).

    Only a SHA-256 hash of the token is stored, never the raw value --
    same principle as `users.password_hash`. See
    app/utils/security.py:hash_token().

    issued_at/expires_at/revoked_at are naive IST wall-clock values (see
    app/models/mixins.py:ist_now) -- these columns are plain DateTime
    (TIMESTAMP WITHOUT TIME ZONE), so ist_now() is deliberately naive to
    match what's actually stored. Always compare against ist_now(), not
    a tz-aware datetime.
    """

    __tablename__ = "refresh_tokens"

    token_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)

    token_hash = Column(String(64), unique=True, nullable=False, index=True)

    issued_at = Column(DateTime, default=ist_now, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

    # Rotation chain: refresh tokens are single-use (see
    # auth_service.rotate_refresh_token). When one is redeemed, this row
    # is marked revoked and pointed at the row that replaced it, so the
    # full chain is reconstructable for auditing/anomaly detection.
    
    replaced_by_token_id = Column(Integer, ForeignKey("refresh_tokens.token_id"), nullable=True)

    user = relationship("User", back_populates="refresh_tokens", foreign_keys=[user_id])