"""
Test configuration and fixtures.
"""
import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from testcontainers.postgres import PostgresContainer

from app.main import app
from app.db.base import Base, get_database_session
from app.core.config import settings


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def postgres_container():
    """Start PostgreSQL container for testing."""
    with PostgresContainer("postgres:15") as postgres:
        postgres.with_env("POSTGRES_DB", "test_db")
        postgres.with_env("POSTGRES_USER", "test_user")
        postgres.with_env("POSTGRES_PASSWORD", "test_password")
        yield postgres


@pytest_asyncio.fixture(scope="session")
async def test_engine(postgres_container):
    """Create test database engine."""
    database_url = postgres_container.get_connection_url().replace(
        "postgresql://", "postgresql+asyncpg://"
    )
    
    engine = create_async_engine(database_url, echo=True)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def test_db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    TestSessionLocal = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(test_db_session) -> AsyncGenerator[httpx.AsyncClient, None]:
    """Create test client with database session override."""
    
    def override_get_db():
        return test_db_session
    
    app.dependency_overrides[get_database_session] = override_get_db
    
    async with httpx.AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(test_db_session):
    """Create test user."""
    from app.services.auth import AuthService
    
    auth_service = AuthService(test_db_session)
    user = await auth_service.create_user(
        username="testuser",
        email="test@example.com",
        password="testpassword"
    )
    await test_db_session.commit()
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user, test_db_session):
    """Create authentication headers for test user."""
    from app.services.auth import AuthService
    
    auth_service = AuthService(test_db_session)
    tokens = await auth_service.login("testuser", "testpassword")
    
    return {"Authorization": f"Bearer {tokens.access_token}"}


# SQLite fixtures for offline testing
@pytest_asyncio.fixture
async def sqlite_engine():
    """Create SQLite engine for offline testing."""
    from sqlalchemy.ext.asyncio import create_async_engine
    
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=True
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    await engine.dispose()


@pytest_asyncio.fixture
async def sqlite_session(sqlite_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create SQLite test session."""
    TestSessionLocal = async_sessionmaker(
        sqlite_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()