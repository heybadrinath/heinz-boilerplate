"""
User repository with authentication-specific methods.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
try:
    from opentelemetry import trace
    tracer = trace.get_tracer(__name__)
except ImportError:
    # OpenTelemetry not available, use no-op tracer
    class NoOpTracer:
        def start_as_current_span(self, name):
            class NoOpSpan:
                def __enter__(self):
                    return self
                def __exit__(self, *args):
                    pass
                def set_attribute(self, key, value):
                    pass
            return NoOpSpan()
    tracer = NoOpTracer()

from app.db.models.user import User, RefreshToken
from app.db.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """User repository."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        with tracer.start_as_current_span("db.query.get_by_username") as span:
            span.set_attribute("db.operation", "select")
            span.set_attribute("db.table", "users")
            span.set_attribute("db.username", username)
            
            result = await self.db.execute(
                select(User).where(User.username == username)
            )
            return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        with tracer.start_as_current_span("db.query.get_by_email") as span:
            span.set_attribute("db.operation", "select")
            span.set_attribute("db.table", "users")
            
            result = await self.db.execute(
                select(User).where(User.email == email)
            )
            return result.scalar_one_or_none()
    
    async def create_refresh_token(self, token_data: dict) -> RefreshToken:
        """Create a refresh token."""
        with tracer.start_as_current_span("db.query.create_refresh_token") as span:
            span.set_attribute("db.operation", "insert")
            span.set_attribute("db.table", "refresh_tokens")
            
            refresh_token = RefreshToken(**token_data)
            self.db.add(refresh_token)
            await self.db.flush()
            await self.db.refresh(refresh_token)
            return refresh_token
    
    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        """Get refresh token by token string."""
        with tracer.start_as_current_span("db.query.get_refresh_token") as span:
            span.set_attribute("db.operation", "select")
            span.set_attribute("db.table", "refresh_tokens")
            
            result = await self.db.execute(
                select(RefreshToken).where(
                    RefreshToken.token == token,
                    RefreshToken.is_revoked == False
                )
            )
            return result.scalar_one_or_none()
    
    async def revoke_refresh_token(self, token: str) -> bool:
        """Revoke a refresh token."""
        with tracer.start_as_current_span("db.query.revoke_refresh_token") as span:
            span.set_attribute("db.operation", "update")
            span.set_attribute("db.table", "refresh_tokens")
            
            token_obj = await self.get_refresh_token(token)
            if token_obj:
                token_obj.is_revoked = True
                return True
            return False