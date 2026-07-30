import asyncio
import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ["DEBUG"] = "false"

from app.core.config import Settings, SettingsConfigDict
from app.core import config

class TestSettings(Settings):
    model_config = SettingsConfigDict(env_file=None)
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"

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


@pytest_asyncio.fixture
async def engine():
    eng = create_async_engine("sqlite+aiosqlite:///./test.db", echo=False)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest_asyncio.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seeded_db(db_session: AsyncSession):
    for role_enum in RoleEnum:
        db_session.add(Role(role_name=role_enum.value))
    await db_session.commit()
    return db_session


async def create_test_user(db: AsyncSession, role_name: str, email: str = "test@example.com", password: str = "testpass123", **kwargs) -> tuple[User, str]:
    role = (await db.execute(select(Role).where(Role.role_name == role_name))).scalar_one()
    user = User(
        role_id=role.role_id,
        email=email,
        full_name=kwargs.get("full_name", "Test User"),
        phone=kwargs.get("phone", "1234567890"),
        password_hash=hash_password(password),
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token({"sub": str(user.user_id), "role": role_name})
    return user, token


async def create_test_resident(db: AsyncSession, flat_number: str = "A-101", email: str = "resident@example.com") -> tuple[User, ResidentProfile, str]:
    block = (await db.execute(select(Block))).scalar_one_or_none()
    if block is None:
        block = Block(block_name="Block A", total_flats=100)
        db.add(block)
        await db.commit()
        await db.refresh(block)
    
    flat = (await db.execute(select(Flat).where(Flat.flat_number == flat_number))).scalar_one_or_none()
    if flat is None:
        flat = Flat(flat_number=flat_number, floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        db.add(flat)
        await db.commit()
        await db.refresh(flat)
    
    user, token = await create_test_user(db, RoleEnum.RESIDENT.value, email=email)
    profile = ResidentProfile(user_id=user.user_id, flat_id=flat.flat_id)
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return user, profile, token