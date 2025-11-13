"""
Todo repository with user-specific methods.
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models.todo import Todo
from app.db.repositories.base import BaseRepository


class TodoRepository(BaseRepository[Todo]):
    """Todo repository."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Todo, db)
    
    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Todo]:
        """Get todos by user ID with pagination."""
        result = await self.db.execute(
            select(Todo)
            .where(Todo.owner_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(Todo.created_at.desc())
        )
        return result.scalars().all()
    
    async def get_user_todo(self, todo_id: int, user_id: int) -> Optional[Todo]:
        """Get a specific todo for a user."""
        result = await self.db.execute(
            select(Todo).where(
                Todo.id == todo_id,
                Todo.owner_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    async def get_completed_by_user(self, user_id: int) -> List[Todo]:
        """Get completed todos for a user."""
        result = await self.db.execute(
            select(Todo).where(
                Todo.owner_id == user_id,
                Todo.completed == True
            ).order_by(Todo.updated_at.desc())
        )
        return result.scalars().all()
    
    async def count_by_user(self, user_id: int) -> int:
        """Count total todos for a user."""
        result = await self.db.execute(
            select(Todo).where(Todo.owner_id == user_id)
        )
        return len(result.scalars().all())