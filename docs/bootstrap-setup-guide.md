# FastAPI Backend Bootstrap Setup Guide

This guide covers the setup process for the FastAPI backend using the improved bootstrap scripts with enhanced logging and user experience.

## Overview

The project provides two main setup modes:

1. **Development Mode** - Lightweight setup with SQLite (no Docker required)
2. **Full Stack Mode** - Complete setup with PostgreSQL, Redis, and observability stack (Docker required)

## Setup Scripts

### Development Mode Scripts

#### Windows PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-backend-dev.ps1
```

#### Linux/macOS Bash
```bash
chmod +x scripts/start-backend-dev.sh
./scripts/start-backend-dev.sh
```

**Features:**
- ✅ SQLite database (no external dependencies)
- ✅ FastAPI backend with auto-reload
- ✅ API documentation at `/docs`
- ✅ Health check endpoint
- ✅ Automatic Python virtual environment setup
- ✅ Compatible with Python 3.11+ and 3.13

### Full Stack Mode Scripts

#### Windows PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-backend.ps1
```

#### Linux/macOS Bash  
```bash
chmod +x scripts/bootstrap-backend.sh
./scripts/bootstrap-backend.sh
```

**Features:**
- ✅ PostgreSQL database
- ✅ Redis for caching
- ✅ OpenTelemetry for observability
- ✅ Jaeger for distributed tracing
- ✅ Prometheus for metrics
- ✅ Grafana for visualization
- ✅ Docker containerized services

## Prerequisites

### Development Mode
- **Python 3.11+** (Python 3.13 supported)
- **pip** (Python package manager)

### Full Stack Mode
- **Python 3.11+**
- **Docker Desktop**
- **docker-compose**

## Setup Process Walkthrough

### Development Mode Setup (5 Steps)

The improved bootstrap script provides clear step-by-step progress:

```
FastAPI Backend Development Setup
============================================
[1/5] Setting up environment configuration
[OK] Environment configured with SQLite and secure JWT secret
[2/5] Activating virtual environment  
[OK] Virtual environment created
[3/5] Installing dependencies
[OK] Python 3.13 compatible packages installed
[4/5] Setting up database
[OK] Database initialized and migrations applied
[5/5] Starting development server

============================================

Backend ready at http://localhost:8000

API Docs: http://localhost:8000/docs
Health:   http://localhost:8000/api/v1/health

Press Ctrl+C to stop
```

### Full Stack Mode Setup (6 Steps)

```
FastAPI Backend Bootstrap (Full Stack)
=======================================
[1/6] Setting up environment configuration
[OK] Environment template created
[2/6] Starting infrastructure services
[OK] Docker services started
[3/6] Waiting for PostgreSQL to be ready
[OK] Infrastructure services are ready
[4/6] Installing Python dependencies
[OK] Dependencies installed successfully
[5/6] Running database migrations
[OK] Database migrations completed
[6/6] Building and starting backend service
[OK] Backend is ready!

=== Service URLs ===
Backend API:      http://localhost:8000
API Docs:         http://localhost:8000/docs
Grafana:          http://localhost:3001 (admin/admin)
Prometheus:       http://localhost:9090
Jaeger:           http://localhost:16686
```

## Environment Configuration

### Automatic Configuration (Development Mode)

The development script automatically:
- Creates `.env` file from `.env.example`
- Generates secure JWT secret key
- Configures SQLite database URL
- Sets up proper Python virtual environment

### Manual Configuration (Full Stack Mode)

For full stack mode, you may need to customize:

```env
# Security
JWT_SECRET_KEY=your-secure-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/fastapi_db

# Redis
REDIS_URL=redis://localhost:6379

# OpenTelemetry
OTEL_COLLECTOR_ENDPOINT=http://localhost:4317
```

## Python Version Support

### Python 3.13 Compatibility

The scripts automatically detect Python 3.13 and use compatible requirements:

- **Python 3.13**: `requirements-minimal-py313.txt`
- **Python 3.11-3.12**: `requirements-minimal.txt`
- **Full development**: `requirements.txt` + `requirements-dev.txt`

### Virtual Environment Management

Both scripts handle virtual environment creation and activation:
- Creates `venv/` directory if not present
- Activates environment automatically
- Installs dependencies with appropriate Python version support

## Troubleshooting

### Common Issues

#### 1. Python Version Compatibility
```bash
# Check Python version
python --version
python3 --version

# Ensure Python 3.11+ is installed
```

#### 2. Docker Issues (Full Stack Mode)
```bash
# Check Docker status
docker info

# Start Docker Desktop
# Windows: Start Docker Desktop application
# Linux: sudo systemctl start docker
```

#### 3. Port Conflicts
If port 8000 is in use:
```bash
# Find process using port 8000
# Windows: netstat -ano | findstr :8000
# Linux/macOS: lsof -i :8000

# Kill process or use different port
uvicorn app.main:app --port 8001
```

#### 4. Permission Issues (Linux/macOS)
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run with proper permissions
sudo ./scripts/bootstrap-backend.sh
```

### Reset Environment

To completely reset your development environment:

```bash
# Stop all services
docker-compose down

# Remove virtual environment
rm -rf backend/venv

# Remove database files
rm -f backend/app.db

# Clean Docker (optional)
docker system prune
```

## Development Workflow

### Daily Development

1. **Start development server:**
   ```bash
   ./scripts/start-backend-dev.sh
   ```

2. **Access services:**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Health: http://localhost:8000/api/v1/health

3. **Run tests:**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pytest
   ```

4. **View logs:**
   ```bash
   # Development mode: logs in terminal
   # Full stack mode: docker-compose logs -f backend
   ```

### Code Changes

The development server uses `--reload` flag, so code changes are automatically detected and the server restarts.

## Production Deployment

For production deployment, consider:

1. **Environment Variables:**
   - Use secure JWT secrets
   - Configure production database URLs
   - Set appropriate CORS origins

2. **Database:**
   - Use PostgreSQL for production
   - Set up proper backup strategies
   - Configure connection pooling

3. **Observability:**
   - Enable OpenTelemetry in production
   - Set up proper log aggregation
   - Configure alerting rules

4. **Security:**
   - Use HTTPS in production
   - Implement rate limiting
   - Set up proper authentication

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Ensure all prerequisites are met
4. Try resetting the environment

The improved bootstrap scripts provide clear error messages and suggestions for resolving common issues.