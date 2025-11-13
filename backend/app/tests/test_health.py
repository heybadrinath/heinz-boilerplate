"""
Health check tests.
"""
import pytest
import httpx


class TestHealth:
    """Health check endpoint tests."""
    
    async def test_health_check(self, client: AsyncClient):
        """Test health check endpoint."""
        response = await client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "fastapi-backend"
    
    async def test_metrics_endpoint(self, client: AsyncClient):
        """Test Prometheus metrics endpoint."""
        response = await client.get("/metrics")
        
        assert response.status_code == 200
        assert "text/plain" in response.headers["content-type"]
        
        # Check for some expected metrics
        content = response.text
        assert "http_requests_total" in content
        assert "http_request_duration_seconds" in content