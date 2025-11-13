"""
Authentication service with business logic.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    get_password_hash,
    verify_password,
    create_token_pair,
    verify_token
)
from app.db.repositories.user import UserRepository
from app.db.models.user import User

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


class AuthService:
    """Authentication service."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repository = UserRepository(db)
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password."""
        with tracer.start_as_current_span("service.auth.authenticate_user") as span:
            span.set_attribute("auth.username", username)
            
            user = await self.user_repository.get_by_username(username)
            if not user:
                span.set_attribute("auth.result", "user_not_found")
                return None
            
            if not verify_password(password, user.hashed_password):
                span.set_attribute("auth.result", "invalid_password")
                return None
            
            if not user.is_active:
                span.set_attribute("auth.result", "user_inactive")
                return None
            
            span.set_attribute("auth.result", "success")
            return user
    
    async def create_user(self, username: str, email: str, password: str) -> User:
        """Create a new user."""
        with tracer.start_as_current_span("service.auth.create_user") as span:
            span.set_attribute("auth.username", username)
            span.set_attribute("auth.email", email)
            
            # Check if user already exists
            existing_user = await self.user_repository.get_by_username(username)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            
            existing_email = await self.user_repository.get_by_email(email)
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Create user
            hashed_password = get_password_hash(password)
            user_data = {
                "username": username,
                "email": email,
                "hashed_password": hashed_password,
                "is_active": True
            }
            
            user = await self.user_repository.create(user_data)
            span.set_attribute("auth.user_created", True)
            return user
    
    async def login(self, username: str, password: str):
        """Login user and return tokens."""
        with tracer.start_as_current_span("service.auth.login") as span:
            user = await self.authenticate_user(username, password)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Create token pair
            tokens = create_token_pair(user.id, user.username)
            
            # Store refresh token
            expires_at = datetime.utcnow() + timedelta(days=7)
            await self.user_repository.create_refresh_token({
                "token": tokens.refresh_token,
                "user_id": user.id,
                "expires_at": expires_at
            })
            
            span.set_attribute("auth.login_success", True)
            return tokens
    
    async def refresh_token(self, refresh_token: str):
        """Refresh access token using refresh token."""
        with tracer.start_as_current_span("service.auth.refresh_token") as span:
            # Verify refresh token
            token_data = verify_token(refresh_token, "refresh")
            if not token_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token"
                )
            
            # Check if token exists in database
            stored_token = await self.user_repository.get_refresh_token(refresh_token)
            if not stored_token or stored_token.expires_at < datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token expired or invalid"
                )
            
            # Get user
            user = await self.user_repository.get(token_data.user_id)
            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive"
                )
            
            # Create new token pair
            tokens = create_token_pair(user.id, user.username)
            
            # Revoke old refresh token
            await self.user_repository.revoke_refresh_token(refresh_token)
            
            # Store new refresh token
            expires_at = datetime.utcnow() + timedelta(days=7)
            await self.user_repository.create_refresh_token({
                "token": tokens.refresh_token,
                "user_id": user.id,
                "expires_at": expires_at
            })
            
            span.set_attribute("auth.token_refreshed", True)
            return tokens
    
    async def logout(self, refresh_token: str):
        """Logout user by revoking refresh token."""
        with tracer.start_as_current_span("service.auth.logout") as span:
            success = await self.user_repository.revoke_refresh_token(refresh_token)
            span.set_attribute("auth.logout_success", success)
            return success