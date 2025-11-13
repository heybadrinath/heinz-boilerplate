"""
Authentication tests.
"""
import pytest
import httpx


class TestAuth:
    """Authentication endpoint tests."""
    
    async def test_register_user(self, client: AsyncClient):
        """Test user registration."""
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword"
        }
        
        response = await client.post("/api/v1/register", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert "id" in data
    
    async def test_register_duplicate_username(self, client: AsyncClient, test_user):
        """Test registration with duplicate username."""
        user_data = {
            "username": "testuser",  # Same as test_user
            "email": "different@example.com",
            "password": "password"
        }
        
        response = await client.post("/api/v1/register", json=user_data)
        
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]
    
    async def test_login_success(self, client: AsyncClient, test_user):
        """Test successful login."""
        login_data = {
            "username": "testuser",
            "password": "testpassword"
        }
        
        response = await client.post("/api/v1/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    async def test_login_invalid_credentials(self, client: AsyncClient, test_user):
        """Test login with invalid credentials."""
        login_data = {
            "username": "testuser",
            "password": "wrongpassword"
        }
        
        response = await client.post("/api/v1/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
    
    async def test_get_current_user(self, client: AsyncClient, auth_headers):
        """Test getting current user info."""
        response = await client.get("/api/v1/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
    
    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/api/v1/me", headers=headers)
        
        assert response.status_code == 401
    
    async def test_refresh_token(self, client: AsyncClient, test_user, test_db_session):
        """Test token refresh."""
        from app.services.auth import AuthService
        
        auth_service = AuthService(test_db_session)
        tokens = await auth_service.login("testuser", "testpassword")
        
        refresh_data = {"refresh_token": tokens.refresh_token}
        response = await client.post("/api/v1/refresh", json=refresh_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    async def test_logout(self, client: AsyncClient, test_user, test_db_session):
        """Test logout."""
        from app.services.auth import AuthService
        
        auth_service = AuthService(test_db_session)
        tokens = await auth_service.login("testuser", "testpassword")
        
        logout_data = {"refresh_token": tokens.refresh_token}
        response = await client.post("/api/v1/logout", json=logout_data)
        
        assert response.status_code == 200
        assert response.json()["success"] is True