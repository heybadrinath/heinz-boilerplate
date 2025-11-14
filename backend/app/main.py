"""
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager
import time
import uuid

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import auth
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.base import Base, engine
# Ensure models are imported so SQLAlchemy registers tables
from app.db import models as _db_models  # noqa: F401
from prometheus_fastapi_instrumentator import Instrumentator

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info("FastAPI application starting up")
    # Ensure DB tables exist for auth flows
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables checked/created")
    except Exception as e:
        logger.error(f"Database init failed: {e}")
    yield
    # Shutdown
    logger.info("FastAPI application shutting down")


app = FastAPI(
    title="FastAPI Backend Boilerplate",
    description=(
        "Production-ready FastAPI backend. "
        + ("Auth endpoints enabled." if settings.AUTH_ENABLED else "Auth endpoints disabled in this environment.")
    ),
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan
)

# Expose Prometheus /metrics endpoint and instrument requests
Instrumentator().instrument(app).expose(app, include_in_schema=False)
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next):
    """Add request ID and timing to all requests."""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)
    
    logger.info(
        "Request completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration": process_time
        }
    )
    
    return response


@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "fastapi-backend"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with logging."""
    request_id = getattr(request.state, "request_id", "unknown")
    
    logger.error(
        "Unhandled exception",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method,
            "exception": str(exc)
        },
        exc_info=True
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": request_id
        }
    )


# Include routers
from app.api.v1 import tests as tests_router

# Only include auth endpoints when enabled
if settings.AUTH_ENABLED:
    app.include_router(auth.router, prefix="/api/v1", tags=["auth"])

# Hide test-control endpoints from OpenAPI schema
app.include_router(tests_router.router, prefix="/api/v1", tags=["e2e-tests"], include_in_schema=False)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)