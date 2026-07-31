import asyncio
import os
from collections.abc import Generator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, Session

os.environ["DEBUG"] = "false"

from app.core.config import Settings, SettingsConfigDict
from app.core import config

class TestSettings(Settings):
    DATABASE_URL: str = "sqlite:///./test.db"
    OTP_HASH_SECRET: str = "test-secret-key-for-otp-hashing"

config.settings = TestSettings()

import app.utils.security
app.utils.security.settings = config.settings

from app.core.database import Base, get_db
from app.models.auth import RoleEnum
from app.models.auth import Role, User
from app.models.apartment import Flat, ResidentProfile, Block
from app.utils.password import hash_password
from app.utils.security import create_access_token
from app.main import app


@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def engine():
    eng = create_engine("sqlite:///./test.db", echo=False)
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)
    eng.dispose()


@pytest.fixture
def db_session(engine) -> Generator[Session, None, None]:
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.rollback()
    session.close()


@pytest_asyncio.fixture
async def client(db_session: Session) -> Generator[AsyncClient, None]:
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_db(db_session: Session):
    db_session.query(Role).delete()
    for role_enum in RoleEnum:
        db_session.add(Role(role_name=role_enum.name))
    db_session.commit()
    return db_session


import uuid

def create_test_user(db: Session, role_name: str, email: str = "test@example.com", password: str = "testpass123", **kwargs) -> tuple[User, str]:
    unique_email = f"{uuid.uuid4().hex[:8]}@{email}"
    role = db.query(Role).filter(Role.role_name == role_name).one()
    user = User(
        role_id=role.role_id,
        email=unique_email,
        full_name=kwargs.get("full_name", "Test User"),
        phone=kwargs.get("phone", "1234567890"),
        password_hash=hash_password(password),
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.user_id), "role": role_name})
    return user, token


def create_test_resident(db: Session, flat_number: str = "A-101", email: str = "resident@example.com") -> tuple[User, ResidentProfile, str]:
    block = db.query(Block).first()
    if block is None:
        block = Block(block_name="Block A", total_flats=100)
        db.add(block)
        db.commit()
        db.refresh(block)
    
    flat = db.query(Flat).filter(Flat.flat_number == flat_number).first()
    if flat is None:
        flat = Flat(flat_number=flat_number, floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        db.add(flat)
        db.commit()
        db.refresh(flat)
    
    user, token = create_test_user(db, RoleEnum.RESIDENT.name, email=email)
    profile = ResidentProfile(user_id=user.user_id, flat_id=flat.flat_id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return user, profile, token
