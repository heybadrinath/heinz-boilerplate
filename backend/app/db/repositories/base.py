"""
Base repository class with common CRUD operations.
"""
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def get(self, id: Any) -> Optional[ModelType]:
        """Get a single record by ID."""
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()
    
    async def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get multiple records with pagination."""
        result = await self.db.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return result.scalars().all()
    
    async def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def update(self, id: Any, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """Update an existing record."""
        await self.db.execute(
            update(self.model).where(self.model.id == id).values(**obj_in)
        )
        return await self.get(id)
    
    async def delete(self, id: Any) -> bool:
        """Delete a record."""
        result = await self.db.execute(
            delete(self.model).where(self.model.id == id)
        )
        return result.rowcount > 0