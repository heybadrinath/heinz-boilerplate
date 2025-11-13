# Heinz Boilerplate

A comprehensive monorepo boilerplate for building modern web applications with FastAPI backend and observability stack.

## Overview

This boilerplate provides a production-ready foundation with:

- **Backend**: FastAPI with async SQLAlchemy, JWT authentication, and comprehensive testing
- **Observability**: OpenTelemetry, Prometheus, Grafana, and Jaeger integration  
- **Database**: PostgreSQL with Alembic migrations
- **Caching**: Redis integration
- **Security**: JWT tokens, password hashing, CORS, rate limiting
- **Testing**: Unit, integration, and E2E tests
- **Deployment**: Docker, Kubernetes Helm charts
- **Code Quality**: SonarQube configuration, linting, formatting

## Quick Start

### Prerequisites

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Node.js 18+** - [Download here](https://nodejs.org/) (Required for frontend builds)
- Python 3.11+ (for backend development)

### Get Started

Choose one of these setup options:

#### Option 1: Full Stack with Start Scripts (Recommended)
Includes Frontend + Backend + PostgreSQL + Redis + Observability Stack

**Windows:**
```powershell
.\start-app.ps1 -Dev
```

**Linux/macOS:**
```bash
chmod +x start-app.sh
./start-app.sh dev
```

**Alternative - Bootstrap Scripts:**
```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-backend.ps1

# Linux/macOS  
chmod +x scripts/bootstrap-backend.sh
./scripts/bootstrap-backend.sh
```

#### Option 2: Backend Only (No Docker Required)
Just FastAPI + SQLite (perfect for development)

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-backend-dev.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/start-backend-dev.sh
./scripts/start-backend-dev.sh
```

#### Option 3: Skip Docker
If you have issues with Docker but want the full experience:

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-backend.ps1 -SkipDocker
```

**Linux/macOS:**
```bash
./scripts/bootstrap-backend.sh --skip-docker
```

2. **Access the services**:
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Jaeger: http://localhost:16686

### Manual Setup

If you prefer manual setup:

1. **Environment setup**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. **Start infrastructure**:
```bash
docker-compose up -d postgres redis otel-collector jaeger prometheus grafana
```

3. **Backend setup**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│   PostgreSQL    │
│   (Future)      │     │   FastAPI       │     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Redis       │◀────┤ Observability   │────▶│    Grafana      │
│    Cache        │     │     Stack       │     │   Dashboard     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │    Jaeger       │
                        │   Tracing       │
                        └─────────────────┘
```

## Project Structure

```
heinz-boilerplate/
├── backend/                 # FastAPI backend application
│   ├── app/                # Application code
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Configuration and utilities
│   │   ├── db/             # Database models and repositories
│   │   ├── services/       # Business logic
│   │   └── tests/          # Test suites
│   ├── alembic/            # Database migrations
│   ├── charts/             # Helm charts for Kubernetes
│   └── requirements.txt    # Python dependencies
├── tests/e2e/              # End-to-end tests
├── observability/          # Monitoring configuration
│   ├── grafana/            # Grafana dashboards
│   └── prometheus.yml      # Prometheus configuration
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── docker-compose.yml      # Local development stack
```

## Features

### Backend API

- **FastAPI Framework**: Modern, fast, and async Python web framework
- **Authentication**: JWT-based auth with access/refresh tokens
- **Database**: PostgreSQL with async SQLAlchemy and Alembic migrations
- **CRUD Operations**: Example Todo resource with full CRUD
- **Validation**: Pydantic models for request/response validation
- **Error Handling**: Comprehensive error handling and logging

### Observability

- **Metrics**: Prometheus metrics collection with custom business metrics
- **Tracing**: OpenTelemetry distributed tracing with Jaeger
- **Logging**: Structured JSON logging with request correlation
- **Dashboards**: Pre-configured Grafana dashboards
- **Health Checks**: Health and readiness probes

### Security

- **JWT Tokens**: Secure access and refresh token implementation
- **Password Hashing**: bcrypt password hashing
- **CORS**: Configurable CORS middleware
- **Rate Limiting**: Redis-based rate limiting (configurable)
- **Input Validation**: Comprehensive request validation

### Testing

- **Unit Tests**: Service and repository layer tests
- **Integration Tests**: API endpoint tests with test database
- **E2E Tests**: End-to-end API testing with Playwright
- **Test Coverage**: Code coverage reporting
- **Test Fixtures**: Comprehensive test fixtures and utilities

### Deployment

- **Docker**: Multi-stage production-ready Dockerfile
- **Kubernetes**: Helm charts with configurable values
- **Local Development**: Docker Compose for local stack
- **CI/CD Ready**: SonarQube integration, test configurations

## API Examples

### Authentication

```bash
# Register user
curl -X POST "http://localhost:8000/api/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "email": "user@example.com", "password": "password"}'

# Login
curl -X POST "http://localhost:8000/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "password"}'
```

### Todo Operations

```bash
# Create todo (requires auth token)
curl -X POST "http://localhost:8000/api/v1/todos" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Todo", "priority": "high"}'

# List todos
curl -X GET "http://localhost:8000/api/v1/todos" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Development

### Running Tests

```bash
# Backend unit tests
cd backend
source venv/bin/activate
pytest

# E2E tests
cd tests/e2e
npm install && npm run install
npm test
```

### Code Quality

```bash
# Format code
cd backend
black app/

# Lint code
ruff app/

# Type checking
mypy app/

# SonarQube analysis
sonar-scanner
```

### Database Management

```bash
# Create migration
cd backend
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Deployment

### Docker

```bash
# Build and run
docker build -t fastapi-backend ./backend
docker run -p 8000:8000 fastapi-backend
```

### Kubernetes

```bash
# Deploy with Helm
helm install fastapi-backend ./charts/backend \
  --set image.tag=your-tag \
  --set secrets.JWT_SECRET_KEY=your-secret
```

### Production Configuration

Key environment variables for production:

```bash
ENVIRONMENT=production
DEBUG=false
JWT_SECRET_KEY=your-production-secret
DATABASE_URL=postgresql://user:pass@prod-db:5432/db
REDIS_URL=redis://prod-redis:6379
```

## Monitoring

Access the monitoring stack:

- **Grafana**: http://localhost:3001 (admin/admin)
  - Pre-configured FastAPI dashboard
  - Request metrics, error rates, response times
- **Prometheus**: http://localhost:9090
  - Metrics collection and alerting
- **Jaeger**: http://localhost:16686
  - Distributed tracing visualization

## Documentation

- [Backend Setup](backend/README.md)
- [Observability Guide](docs/observability.md)
- [Secret Management](docs/secrets.md)
- [E2E Tests](tests/e2e/README.md)

## ⚠️ Having Issues with Docker?

**No problem!** If Docker isn't working on your machine, you can still use the backend:

### Quick Start (No Docker)

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-backend-dev.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/start-backend-dev.sh
./scripts/start-backend-dev.sh
```

This will:
- Set up a Python virtual environment
- Install all dependencies
- Create an SQLite database
- Start the FastAPI server at http://localhost:8000

## Testing the Setup

### Quick Health Check

Once everything is running, test with these commands:

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Should return: {"status": "ok", "service": "fastapi-backend"}
```

### Comprehensive Test

Run our automated test suite to verify everything is working:

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-setup.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/test-setup.sh
./scripts/test-setup.sh
```

This will test:
- ✅ API health and documentation
- ✅ User registration and authentication  
- ✅ Todo CRUD operations
- ✅ Prometheus metrics
- ✅ E2E test suite (optional)

### Create a Todo Example

```bash
# 1. Register a user
curl -X POST "http://localhost:8000/api/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'

# 2. Login to get token
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}' | \
  python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# 3. Create a todo
curl -X POST "http://localhost:8000/api/v1/todos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Todo", "description": "Testing the API", "priority": "high"}'

# 4. List todos
curl -X GET "http://localhost:8000/api/v1/todos" \
  -H "Authorization: Bearer $TOKEN"
```

## Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass
5. Use conventional commit messages

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Next Steps

This boilerplate provides a solid foundation. Consider adding:

- Frontend application (React, Vue, or Angular)
- Message queuing (Celery, RQ)
- File storage integration
- Email services
- Additional authentication providers
- Rate limiting enhancements
- More comprehensive monitoring

## Support

For questions and support:
- Check the documentation in the `docs/` directory
- Review the example configurations
- Check the issue tracker for common problems
