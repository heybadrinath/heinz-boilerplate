"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_token
from app.db.base import get_database_session
from app.db.repositories.user import UserRepository
from app.services.auth import AuthService

router = APIRouter()
security = HTTPBearer()


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    
    class Config:
        from_attributes = True


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_database_session)
):
    """Dependency to get current authenticated user."""
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_repository = UserRepository(db)
    user = await user_repository.get(token_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_database_session)
):
    """Register a new user."""
    auth_service = AuthService(db)
    user = await auth_service.create_user(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    return user


@router.post("/login")
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_database_session)
):
    """Login and get access token."""
    auth_service = AuthService(db)
    tokens = await auth_service.login(user_data.username, user_data.password)
    return tokens


@router.post("/refresh")
async def refresh_token(
    token_request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_database_session)
):
    """Refresh access token using refresh token."""
    auth_service = AuthService(db)
    tokens = await auth_service.refresh_token(token_request.refresh_token)
    return tokens


@router.post("/logout")
async def logout(
    token_request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_database_session)
):
    """Logout and revoke refresh token."""
    auth_service = AuthService(db)
    success = await auth_service.logout(token_request.refresh_token)
    return {"success": success}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    """Get current user information."""
    return current_user