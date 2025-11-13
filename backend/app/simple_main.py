"""
Simple FastAPI application for testing without complex dependencies.
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import time

app = FastAPI(
    title="FastAPI Backend Boilerplate",
    description="Simple version for testing",
    version="1.0.0"
)

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "fastapi-backend", "timestamp": time.time()}

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "FastAPI Backend is running!",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

@app.get("/api/v1/hello/{name}")
async def hello(name: str):
    """Simple hello endpoint."""
    return {"message": f"Hello, {name}!", "service": "fastapi-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("simple_main:app", host="0.0.0.0", port=8000, reload=True)