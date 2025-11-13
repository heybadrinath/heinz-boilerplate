# Complete Setup Guide

This guide will help you set up the FastAPI backend boilerplate on any Windows, macOS, or Linux machine.

## Prerequisites Check

### Required Software
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/) 
- **Node.js 18+** - [Download here](https://nodejs.org/) (Required for frontend builds and dependency management)
- **Git** - [Download here](https://git-scm.com/downloads)

### For Backend Development Only
- **Python 3.11+** - [Download here](https://www.python.org/downloads/) (Only needed if developing backend outside Docker)

### Optional but Recommended
- **Visual Studio Code** - [Download here](https://code.visualstudio.com/)

## Quick Setup Options

### Option 1: Full Stack with Docker (Recommended)

This gives you the complete experience with observability stack (Grafana, Prometheus, Jaeger).

#### Windows:
```powershell
# If Docker is not installed, install it first:
powershell -ExecutionPolicy Bypass -File scripts/install-docker-windows.ps1

# Then run the bootstrap:
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-backend.ps1
```

#### macOS/Linux:
```bash
# Make sure Docker Desktop is running, then:
chmod +x scripts/bootstrap-backend.sh
./scripts/bootstrap-backend.sh
```

### Option 2: Backend Only (No Docker Required)

This runs just the FastAPI backend with SQLite database.

#### Windows:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-backend.ps1 -SkipDocker
```

#### macOS/Linux:
```bash
chmod +x scripts/bootstrap-backend.sh
./scripts/bootstrap-backend.sh --skip-docker
```

### Option 3: Manual Setup

If scripts don't work, follow the manual setup below.

## Manual Setup Instructions

### Step 1: Environment Setup

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd heinz-boilerplate
```

2. **Create environment file**:
```bash
cp .env.example .env
```

3. **Edit .env file** with your configuration:
```bash
# Generate a secure JWT secret:
# Option 1: Use Python
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"

# Option 2: Use OpenSSL (if available)
openssl rand -hex 32

# Update .env with the generated secret
```

### Step 2: Python Environment

1. **Create virtual environment**:
```bash
cd backend
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

2. **Install dependencies**:
```bash
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Step 3: Database Setup

#### Option A: With Docker (PostgreSQL + Redis + Observability)

1. **Start Docker Desktop**
2. **Start services**:
```bash
cd .. # Back to repo root
docker-compose up -d postgres redis otel-collector jaeger prometheus grafana
```

3. **Wait for services** and run migrations:
```bash
cd backend
export DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/fastapi_db"  # Linux/macOS
# Windows: $env:DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5432/fastapi_db"
alembic upgrade head
```

#### Option B: Without Docker (SQLite only)

1. **Use SQLite** (no setup required):
```bash
cd backend
export DATABASE_URL="sqlite+aiosqlite:///./app.db"  # Linux/macOS
# Windows: $env:DATABASE_URL = "sqlite+aiosqlite:///./app.db"
alembic upgrade head
```

### Step 4: Start the Application

```bash
# From backend directory with activated venv
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Verify Setup

1. **Health check**: http://localhost:8000/api/v1/health
2. **API docs**: http://localhost:8000/docs

If using Docker, also check:
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

## Troubleshooting

### Docker Issues

**Error**: `docker: command not found` or `The system cannot find the file specified`
- **Solution**: Install Docker Desktop and make sure it's running
- **Windows**: Use the install script: `powershell -ExecutionPolicy Bypass -File scripts/install-docker-windows.ps1`

**Error**: `docker-compose: command not found`
- **Solution**: Docker Compose is included with Docker Desktop. Make sure you have the latest version.

**Error**: `error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine"`
- **Solution**: Start Docker Desktop and wait for it to fully load

### Node.js Issues

**Error**: `node: command not found` or `Node.js not found`
- **Solution**: Install Node.js 18+ from [nodejs.org](https://nodejs.org/) and make sure it's in your PATH
- **Verification**: Run `node --version` to confirm installation

**Error**: `npm: command not found`
- **Solution**: npm is included with Node.js. Reinstall Node.js if npm is missing

**Error**: Frontend dependencies installation failed
- **Solution**: Clear npm cache and try again:
```bash
npm cache clean --force
cd frontend && npm install
```

### Python Issues

**Error**: `python: command not found`
- **Solution**: Install Python 3.11+ and make sure it's in your PATH
- **Windows**: Use `py` instead of `python`

**Error**: `alembic: command not found`
- **Solution**: Make sure virtual environment is activated and dependencies are installed

### Database Issues

**Error**: Connection refused to PostgreSQL
- **Solution**: Make sure PostgreSQL container is running: `docker-compose ps`

**Error**: SQLite database locked
- **Solution**: Close any database connections and restart the app

### Port Conflicts

**Error**: Port 8000 already in use
- **Solution**: Kill existing processes or use a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

### Permission Issues (Linux/macOS)

**Error**: Permission denied
- **Solution**: Make scripts executable:
```bash
chmod +x scripts/bootstrap-backend.sh
```

## Testing Your Setup

### Quick API Test

1. **Register a user**:
```bash
curl -X POST "http://localhost:8000/api/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'
```

2. **Login and get token**:
```bash
curl -X POST "http://localhost:8000/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'
```

3. **Create a todo** (replace YOUR_TOKEN):
```bash
curl -X POST "http://localhost:8000/api/v1/todos" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Todo", "priority": "high"}'
```

### Run Tests

```bash
# Unit tests
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pytest

# E2E tests (requires Node.js)
cd ../tests/e2e
npm install
npm run install
npm test
```

## Development Workflow

### Common Commands

```bash
# Start development server
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Run tests
pytest

# Format code
black app/

# Lint code
ruff app/

# Type checking
mypy app/
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild backend
docker-compose build backend

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

## Production Deployment

### Environment Variables

Update your `.env` for production:

```bash
ENVIRONMENT=production
DEBUG=false
JWT_SECRET_KEY=your-super-secure-production-key
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db:5432/db
REDIS_URL=redis://prod-redis:6379
```

### Docker Build

```bash
# Build production image
docker build -t fastapi-backend ./backend

# Run in production
docker run -p 8000:8000 --env-file .env fastapi-backend
```

### Kubernetes

```bash
# Deploy with Helm
helm install fastapi-backend ./charts/backend \
  --set image.tag=your-tag \
  --set secrets.JWT_SECRET_KEY=your-secret
```

## Getting Help

### Check Logs

```bash
# Application logs
docker-compose logs backend

# Database logs
docker-compose logs postgres

# All services
docker-compose logs
```

### Health Checks

```bash
# API health
curl http://localhost:8000/api/v1/health

# Metrics
curl http://localhost:8000/metrics

# Database check
docker-compose exec postgres pg_isready -U postgres
```

### Common Issues and Solutions

1. **"Module not found" errors**: Make sure virtual environment is activated
2. **Database connection issues**: Check if PostgreSQL is running
3. **Port conflicts**: Change ports in docker-compose.yml or stop conflicting services
4. **Permission errors**: Run as administrator/sudo or fix file permissions

### Support Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

If you're still having issues, check the logs and error messages carefully - they usually provide good clues about what's wrong.