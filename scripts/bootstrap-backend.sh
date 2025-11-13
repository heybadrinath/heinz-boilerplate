#!/bin/bash

# Bootstrap script for FastAPI backend
set -e

# Parse command line arguments
SKIP_DOCKER=false
for arg in "$@"; do
    case $arg in
        --skip-docker)
        SKIP_DOCKER=true
        shift
        ;;
        *)
        ;;
    esac
done

echo ""
echo -e "\033[32;40m🚀 FastAPI Backend Bootstrap (Full Stack)\033[0m"
echo -e "\033[90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[90m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${CYAN}[$1]${NC} ${WHITE}$2${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${GRAY}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}✗${NC} ${RED}$1${NC}"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the repository root directory"
    exit 1
fi

# Create .env file from example if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
    print_warning "Please update .env file with your configuration before proceeding"
    echo "Especially update JWT_SECRET_KEY with a secure random value"
else
    print_status ".env file already exists"
fi

if [ "$SKIP_DOCKER" = false ]; then
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running or not installed."
        echo ""
        print_warning "Options to fix this:"
        echo "1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
        echo "2. Start Docker Desktop and wait for it to be ready"
        echo "3. Run this script again"
        echo ""
        echo "Alternatively, skip Docker and run backend only:"
        echo "./scripts/bootstrap-backend.sh --skip-docker"
        exit 1
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi

    print_status "Starting infrastructure services..."
    docker-compose up -d postgres redis otel-collector jaeger prometheus grafana

    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    until docker-compose exec -T postgres pg_isready -U postgres; do
        print_status "Waiting for PostgreSQL..."
        sleep 2
    done

    # Wait for Redis to be ready
    print_status "Waiting for Redis to be ready..."
    until docker-compose exec -T redis redis-cli ping; do
        print_status "Waiting for Redis..."
        sleep 2
    done

    print_status "Infrastructure services are ready!"
else
    print_warning "Skipping Docker services. Running backend only."
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
cd backend

if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt

print_status "Dependencies installed successfully!"

# Run Alembic migrations
if [ "$SKIP_DOCKER" = false ]; then
    print_status "Running database migrations..."
    export DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/fastapi_db"
    alembic upgrade head
    print_status "Database migrations completed!"
else
    print_status "Skipping database migrations (using SQLite)"
    export DATABASE_URL="sqlite+aiosqlite:///./app.db"
    alembic upgrade head
    print_status "Database migrations completed with SQLite!"
fi

# Build and start backend service
cd ..
if [ "$SKIP_DOCKER" = false ]; then
    print_status "Building and starting backend service..."
    docker-compose up -d backend

    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    until curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; do
        print_status "Waiting for backend service..."
        sleep 2
    done
else
    print_status "Start the backend manually with:"
    echo "cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
fi

print_status "🎉 Backend is ready!"

echo ""
echo "=== Service URLs ==="
echo "Backend API:      http://localhost:8000"
echo "API Docs:         http://localhost:8000/docs"
echo "Grafana:          http://localhost:3001 (admin/admin)"
echo "Prometheus:       http://localhost:9090"
echo "Jaeger:           http://localhost:16686"
echo ""
echo "=== Useful Commands ==="
echo "View logs:        docker-compose logs -f backend"
echo "Run tests:        cd backend && source venv/bin/activate && pytest"
echo "Stop services:    docker-compose down"
echo ""
echo "✅ Bootstrap completed successfully!"