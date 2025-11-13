"""
Todo CRUD tests.
"""
import pytest
import httpx


class TestTodos:
    """Todo endpoint tests."""
    
    async def test_create_todo(self, client: AsyncClient, auth_headers):
        """Test creating a todo."""
        todo_data = {
            "title": "Test Todo",
            "description": "This is a test todo",
            "priority": "high"
        }
        
        response = await client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == todo_data["title"]
        assert data["description"] == todo_data["description"]
        assert data["priority"] == todo_data["priority"]
        assert data["completed"] is False
        assert "id" in data
    
    async def test_create_todo_invalid_priority(self, client: AsyncClient, auth_headers):
        """Test creating a todo with invalid priority."""
        todo_data = {
            "title": "Test Todo",
            "priority": "invalid"
        }
        
        response = await client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
        
        assert response.status_code == 400
        assert "Priority must be one of" in response.json()["detail"]
    
    async def test_list_todos(self, client: AsyncClient, auth_headers):
        """Test listing todos."""
        # Create a todo first
        todo_data = {"title": "Test Todo", "description": "Test description"}
        await client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
        
        response = await client.get("/api/v1/todos", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    async def test_list_todos_with_pagination(self, client: AsyncClient, auth_headers):
        """Test listing todos with pagination."""
        # Create multiple todos
        for i in range(5):
            todo_data = {"title": f"Todo {i}"}
            await client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
        
        response = await client.get("/api/v1/todos?skip=2&limit=2", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2
    
    async def test_get_todo(self, client: AsyncClient, auth_headers):
        """Test getting a specific todo."""
        # Create a todo first
        todo_data = {"title": "Test Todo"}
        create_response = await client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
        todo_id = create_response.json()["id"]
        
        response = await client.get(f"/api/v1/todos/{todo_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == todo_id
        assert data["title"] == todo_data["title"]
    
    async def test_get_nonexistent_todo(self, client: AsyncClient, auth_headers):
        """Test getting a non-existent todo."""
        response = await client.get("/api/v1/todos/999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Todo not found" in response.json()["detail"]
    
    async def test_update_todo(self, client: AsyncClient, auth_headers):
        """Test updating a todo."""
        # Create a todo first
        todo_data = {"title": "Original Title"}
        create_response = await client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
        todo_id = create_response.json()["id"]
        
        # Update the todo
        update_data = {
            "title": "Updated Title",
            "completed": True,
            "priority": "low"
        }
        response = await client.put(f"/api/v1/todos/{todo_id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["completed"] == update_data["completed"]
        assert data["priority"] == update_data["priority"]
    
    async def test_delete_todo(self, client: AsyncClient, auth_headers):
        """Test deleting a todo."""
        # Create a todo first
        todo_data = {"title": "To be deleted"}
        create_response = await client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
        todo_id = create_response.json()["id"]
        
        # Delete the todo
        response = await client.delete(f"/api/v1/todos/{todo_id}", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json()["success"] is True
        
        # Verify todo is deleted
        get_response = await client.get(f"/api/v1/todos/{todo_id}", headers=auth_headers)
        assert get_response.status_code == 404
    
    async def test_get_todo_stats(self, client: AsyncClient, auth_headers):
        """Test getting todo statistics."""
        # Create some todos
        await client.post("/api/v1/todos", json={"title": "Todo 1", "completed": True}, headers=auth_headers)
        await client.post("/api/v1/todos", json={"title": "Todo 2", "completed": False}, headers=auth_headers)
        
        response = await client.get("/api/v1/todos/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "completed" in data
        assert "pending" in data
        assert "completion_rate" in data
    
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test accessing todos without authentication."""
        response = await client.get("/api/v1/todos")
        
        assert response.status_code == 401