"""
Database configuration and session management.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import StaticPool

from app.core.config import settings

# Create async engine
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite configuration for testing
    database_url = settings.DATABASE_URL
    # Only replace if it's not already aiosqlite
    if "aiosqlite" not in database_url:
        database_url = database_url.replace("sqlite://", "sqlite+aiosqlite://")
    
    engine = create_async_engine(
        database_url,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    # PostgreSQL configuration
    engine = create_async_engine(
        settings.DATABASE_URL,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        echo=settings.DEBUG,
        pool_pre_ping=True
    )

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create declarative base
Base = declarative_base()


async def get_database_session() -> AsyncSession:
    """Dependency to get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()