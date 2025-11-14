"""
Security utilities for JWT tokens and password hashing.
Simple hashlib-based implementation to avoid bcrypt compatibility issues.
"""
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Union

from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None


def get_password_hash(password: str) -> str:
    """Hash a password using SHA-256 with salt."""
    # Generate a random salt
    salt = secrets.token_hex(16)
    # Hash password with salt
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    # Return salt + hash for storage
    return f"{salt}:{password_hash}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        # Split salt and hash
        salt, stored_hash = hashed_password.split(":", 1)
        # Hash the provided password with the stored salt
        password_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        # Compare hashes
        return password_hash == stored_hash
    except ValueError:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        
        # Verify token type
        if payload.get("type") != token_type:
            return None
        
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        
        if username is None:
            return None
        
        token_data = TokenData(username=username, user_id=user_id)
        return token_data
    except JWTError:
        return None


def create_token_pair(user_id: int, username: str) -> Token:
    """Create access and refresh token pair."""
    data = {"sub": username, "user_id": user_id}
    
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )