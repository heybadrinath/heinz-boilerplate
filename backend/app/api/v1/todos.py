"""
Todo CRUD API endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.base import get_database_session
from app.db.models.user import User
from app.services.todo import TodoService

router = APIRouter()


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None


class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: str
    owner_id: int
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


class TodoStats(BaseModel):
    total: int
    completed: int
    pending: int
    completion_rate: float


@router.post("/todos", response_model=TodoResponse)
async def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session)
):
    """Create a new todo."""
    todo_service = TodoService(db)
    todo = await todo_service.create_todo(todo_data.dict(), current_user.id)
    return todo


@router.get("/todos", response_model=List[TodoResponse])
async def list_todos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session)
):
    """List todos for the current user."""
    todo_service = TodoService(db)
    todos = await todo_service.get_user_todos(current_user.id, skip, limit)
    return todos


@router.get("/todos/stats", response_model=TodoStats)
async def get_todo_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session)
):
    """Get todo statistics for the current user."""
    todo_service = TodoService(db)
    stats = await todo_service.get_todo_stats(current_user.id)
    return stats


@router.get("/todos/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session)
):
    """Get a specific todo."""
    todo_service = TodoService(db)
    todo = await todo_service.get_todo(todo_id, current_user.id)
    return todo


@router.put("/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session)
):
    """Update a todo."""
    todo_service = TodoService(db)
    todo = await todo_service.update_todo(todo_id, todo_data.dict(exclude_unset=True), current_user.id)
    return todo


@router.delete("/todos/{todo_id}")
async def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session)
):
    """Delete a todo."""
    todo_service = TodoService(db)
    success = await todo_service.delete_todo(todo_id, current_user.id)
    return {"success": success}