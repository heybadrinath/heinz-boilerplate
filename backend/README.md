# FastAPI Backend Boilerplate

A production-ready FastAPI backend with comprehensive observability, authentication, and testing infrastructure.

## Features

- **FastAPI**: Modern, fast web framework for building APIs
- **Authentication**: JWT-based auth with access/refresh tokens
- **Database**: PostgreSQL with SQLAlchemy async and Alembic migrations
- **Observability**: OpenTelemetry tracing, Prometheus metrics, Grafana dashboards
- **Testing**: Comprehensive unit and integration tests
- **Security**: CORS, rate limiting, input validation
- **Documentation**: Auto-generated API docs with Swagger UI

## Quick Start

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- PostgreSQL (for development)

### Local Development Setup

1. **Clone and setup environment**:
```bash
# Copy environment variables
cp .env.example .env
# Update .env with your configuration, especially JWT_SECRET_KEY
```

2. **Install dependencies**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

3. **Start infrastructure services**:
```bash
cd .. # Back to repo root
docker-compose up -d postgres redis otel-collector jaeger prometheus grafana
```

4. **Run database migrations**:
```bash
cd backend
export DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/fastapi_db"
alembic upgrade head
```

5. **Start the application**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Using the Bootstrap Script

Alternatively, use the automated bootstrap script:

```bash
chmod +x scripts/bootstrap-backend.sh
./scripts/bootstrap-backend.sh
```

## API Documentation

Once running, visit:
- API Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/api/v1/health

## Testing

### Run Unit Tests
```bash
cd backend
source venv/bin/activate
pytest app/tests/ -v
```

### Run Integration Tests (with Docker)
```bash
# Ensure PostgreSQL is running
docker-compose up -d postgres
pytest app/tests/ -v --integration
```

### Run Tests with Coverage
```bash
pytest app/tests/ --cov=app --cov-report=html
```

## Database Migrations

### Create a new migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migration
```bash
alembic downgrade -1
```

## Observability

### Metrics
- Prometheus metrics: http://localhost:9090
- Application metrics: http://localhost:8000/metrics

### Tracing
- Jaeger UI: http://localhost:16686
- Traces are automatically collected for HTTP requests and database queries

### Dashboards
- Grafana: http://localhost:3001 (admin/admin)
- Pre-configured dashboard for FastAPI metrics

### Monitoring Endpoints

The application exposes the following endpoints for monitoring:

- `/api/v1/health` - Health check
- `/metrics` - Prometheus metrics
- Request/response times and error rates are automatically tracked

## API Usage Examples

### Authentication

1. **Register a user**:
```bash
curl -X POST "http://localhost:8000/api/v1/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword"
  }'
```

2. **Login**:
```bash
curl -X POST "http://localhost:8000/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword"
  }'
```

### User Operations

3. **Get current user** (requires authentication):
```bash
curl -X GET "http://localhost:8000/api/v1/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

4. **Refresh token**:
```bash
curl -X POST "http://localhost:8000/api/v1/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

5. **Logout**:
```bash
curl -X POST "http://localhost:8000/api/v1/logout" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # Application entry point
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py      # Authentication endpoints
│   │       └── auth.py      # Authentication endpoints
│   ├── core/
│   │   ├── config.py        # Configuration management
│   │   ├── security.py      # JWT and password utilities
│   │   └── logging.py       # Structured logging setup
│   ├── db/
│   │   ├── base.py          # Database configuration
│   │   ├── models/          # SQLAlchemy models
│   │   └── repositories/    # Data access layer
│   ├── services/            # Business logic
│   └── tests/              # Test suites
├── alembic/                # Database migrations
├── charts/                 # Helm charts for Kubernetes
├── requirements.txt        # Production dependencies
├── requirements-dev.txt    # Development dependencies
└── Dockerfile             # Container image definition
```

## Environment Variables

Key environment variables (see `.env.example`):

- `JWT_SECRET_KEY`: Secret key for JWT tokens (required)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `ENVIRONMENT`: Application environment (development/production)
- `DEBUG`: Enable debug mode (true/false)

## Deployment

### Docker

Build and run with Docker:
```bash
docker build -t fastapi-backend ./backend
docker run -p 8000:8000 fastapi-backend
```

### Docker Compose

Run full stack:
```bash
docker-compose up -d
```

### Kubernetes with Helm

Deploy to Kubernetes:
```bash
helm install fastapi-backend ./charts/backend \
  --set image.tag=your-image-tag \
  --set secrets.JWT_SECRET_KEY=your-secret-key
```

## Security Considerations

- Change `JWT_SECRET_KEY` in production
- Use environment-specific database credentials
- Enable HTTPS in production
- Configure rate limiting appropriately
- Regular security updates for dependencies

## Development

### Code Quality

```bash
# Format code
black app/

# Lint code
ruff app/

# Type checking
mypy app/
```

### SonarQube Analysis

Run SonarQube analysis:
```bash
sonar-scanner -Dsonar.projectKey=fastapi-backend
```

## Troubleshooting

### Common Issues

1. **Database connection errors**: Ensure PostgreSQL is running and credentials are correct
2. **JWT token errors**: Verify `JWT_SECRET_KEY` is set
3. **Import errors**: Ensure you're in the virtual environment

### Logs

View application logs:
```bash
docker-compose logs -f backend
```

### Health Checks

Check service health:
```bash
curl http://localhost:8000/api/v1/health
```

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass

## License

MIT License - see LICENSE file for details.