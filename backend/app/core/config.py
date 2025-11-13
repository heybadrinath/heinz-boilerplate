"""
Application configuration using environment variables.
"""
import os
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    JWT_SECRET_KEY: str = "development-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    DATABASE_TEST_URL: str = "sqlite:///./test.db"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    
    
    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = ["http://localhost:3000", "http://localhost:8080"]
    
    
    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 100
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str) and v:
            return [origin.strip() for origin in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://localhost:8080"]
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()