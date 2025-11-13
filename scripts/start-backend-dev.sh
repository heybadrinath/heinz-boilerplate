#!/bin/bash

# Simple development server script (no Docker required)
# This script starts just the FastAPI backend with SQLite

set -e

echo ""
echo -e "\033[32;40m🚀 FastAPI Backend Development Setup\033[0m"
echo -e "\033[90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[90m'
WHITE='\033[1;37m'
BLUE_BG='\033[44m'
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
if [ ! -f "backend/app/main.py" ]; then
    print_error "Please run this script from the repository root directory"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_step "1/5" "Setting up environment configuration"
    cp .env.example .env
    
    # Generate a random JWT secret
    if command -v openssl >/dev/null 2>&1; then
        JWT_SECRET=$(openssl rand -hex 32)
    else
        JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    fi
    
    # Update .env file
    sed -i.bak "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
    sed -i.bak "s|postgresql+asyncpg://postgres:password@localhost:5432/fastapi_db|sqlite+aiosqlite:///./app.db|" .env
    rm .env.bak 2>/dev/null || true
    
    print_success "Environment configured with SQLite and secure JWT secret"
else
    print_success "Environment configuration already exists"
fi

cd backend

# Check Python version
python_version=$(python3 -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
min_version="3.11"

if [ "$(printf '%s\n' "$min_version" "$python_version" | sort -V | head -n1)" != "$min_version" ]; then
    print_error "Python 3.11+ is required. You have Python $python_version"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_step "2/5" "Creating Python virtual environment"
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        print_error "Failed to create virtual environment. Make sure Python 3.11+ is installed."
        exit 1
    fi
    print_success "Virtual environment created"
else
    print_success "Virtual environment already exists"
fi

# Activate virtual environment
print_step "2/5" "Activating virtual environment"
source venv/bin/activate

# Install dependencies
print_step "3/5" "Installing dependencies"
python -m pip install --upgrade pip --quiet

# Check Python version and use appropriate requirements
python_version=$(python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
if [ "$python_version" = "3.13" ] && [ -f "requirements-minimal-py313.txt" ]; then
    pip install -r requirements-minimal-py313.txt --quiet
    print_success "Python 3.13 compatible packages installed"
elif [ -f "requirements-minimal.txt" ]; then
    pip install -r requirements-minimal.txt --quiet
    print_success "Minimal requirements installed"
else
    pip install -r requirements.txt --quiet
    print_success "Full requirements installed"
fi

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies. Check your internet connection and Python installation."
    exit 1
fi

# Set up SQLite database
print_step "4/5" "Setting up database"
export DATABASE_URL="sqlite+aiosqlite:///./app.db"

# Run migrations
alembic upgrade head

if [ $? -ne 0 ]; then
    print_error "Database migration failed. Check the error messages above."
    exit 1
fi

print_success "Database initialized and migrations applied"

# Start the server
print_step "5/5" "Starting development server"
echo ""
echo -e "\033[90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo ""
echo -e "${GREEN}🎉 Backend ready at ${NC}${WHITE}${BLUE_BG}http://localhost:8000${NC}"
echo ""
echo -e "${CYAN}📚 API Docs: ${NC}${GRAY}http://localhost:8000/docs${NC}"
echo -e "${CYAN}🔍 Health:   ${NC}${GRAY}http://localhost:8000/api/v1/health${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000