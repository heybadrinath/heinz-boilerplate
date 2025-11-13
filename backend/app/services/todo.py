"""
Todo service with business logic.
"""
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.todo import TodoRepository
from app.db.models.todo import Todo

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


class TodoService:
    """Todo service."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.todo_repository = TodoRepository(db)
    
    async def create_todo(self, todo_data: dict, user_id: int) -> Todo:
        """Create a new todo."""
        with tracer.start_as_current_span("service.todo.create") as span:
            span.set_attribute("todo.user_id", str(user_id))
            span.set_attribute("todo.title", todo_data.get("title", ""))
            
            # Add owner_id to todo data
            todo_data["owner_id"] = user_id
            
            # Validate priority
            valid_priorities = ["low", "medium", "high"]
            if "priority" in todo_data and todo_data["priority"] not in valid_priorities:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Priority must be one of: {', '.join(valid_priorities)}"
                )
            
            todo = await self.todo_repository.create(todo_data)
            span.set_attribute("todo.created_id", str(todo.id))
            
            # Increment metrics
            from app.main import TODO_CREATED
            TODO_CREATED.inc()
            
            return todo
    
    async def get_user_todos(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Todo]:
        """Get todos for a user."""
        with tracer.start_as_current_span("service.todo.get_user_todos") as span:
            span.set_attribute("todo.user_id", str(user_id))
            span.set_attribute("todo.skip", skip)
            span.set_attribute("todo.limit", limit)
            
            todos = await self.todo_repository.get_by_user(user_id, skip, limit)
            span.set_attribute("todo.count", len(todos))
            return todos
    
    async def get_todo(self, todo_id: int, user_id: int) -> Todo:
        """Get a specific todo for a user."""
        with tracer.start_as_current_span("service.todo.get") as span:
            span.set_attribute("todo.id", str(todo_id))
            span.set_attribute("todo.user_id", str(user_id))
            
            todo = await self.todo_repository.get_user_todo(todo_id, user_id)
            if not todo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Todo not found"
                )
            
            span.set_attribute("todo.found", True)
            return todo
    
    async def update_todo(self, todo_id: int, todo_data: dict, user_id: int) -> Todo:
        """Update a todo."""
        with tracer.start_as_current_span("service.todo.update") as span:
            span.set_attribute("todo.id", str(todo_id))
            span.set_attribute("todo.user_id", str(user_id))
            
            # Check if todo exists and belongs to user
            existing_todo = await self.todo_repository.get_user_todo(todo_id, user_id)
            if not existing_todo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Todo not found"
                )
            
            # Validate priority if provided
            if "priority" in todo_data:
                valid_priorities = ["low", "medium", "high"]
                if todo_data["priority"] not in valid_priorities:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Priority must be one of: {', '.join(valid_priorities)}"
                    )
            
            # Remove None values and owner_id (shouldn't be updated)
            update_data = {k: v for k, v in todo_data.items() if v is not None and k != "owner_id"}
            
            todo = await self.todo_repository.update(todo_id, update_data)
            span.set_attribute("todo.updated", True)
            return todo
    
    async def delete_todo(self, todo_id: int, user_id: int) -> bool:
        """Delete a todo."""
        with tracer.start_as_current_span("service.todo.delete") as span:
            span.set_attribute("todo.id", str(todo_id))
            span.set_attribute("todo.user_id", str(user_id))
            
            # Check if todo exists and belongs to user
            existing_todo = await self.todo_repository.get_user_todo(todo_id, user_id)
            if not existing_todo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Todo not found"
                )
            
            success = await self.todo_repository.delete(todo_id)
            span.set_attribute("todo.deleted", success)
            return success
    
    async def get_todo_stats(self, user_id: int) -> dict:
        """Get todo statistics for a user."""
        with tracer.start_as_current_span("service.todo.stats") as span:
            span.set_attribute("todo.user_id", str(user_id))
            
            total_todos = await self.todo_repository.count_by_user(user_id)
            completed_todos = await self.todo_repository.get_completed_by_user(user_id)
            completed_count = len(completed_todos)
            
            stats = {
                "total": total_todos,
                "completed": completed_count,
                "pending": total_todos - completed_count,
                "completion_rate": (completed_count / total_todos * 100) if total_todos > 0 else 0
            }
            
            span.set_attribute("todo.stats.total", total_todos)
            span.set_attribute("todo.stats.completed", completed_count)
            
            return stats