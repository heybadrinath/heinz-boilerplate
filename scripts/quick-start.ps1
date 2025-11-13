# Quick start script that installs only essential dependencies
Write-Host "🚀 Quick FastAPI Setup (Essential Dependencies Only)" -ForegroundColor Green

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "backend\app\main.py")) {
    Write-Error "Please run this script from the repository root directory"
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Status "Creating .env file..."
    Copy-Item ".env.example" ".env"
    
    # Generate a random JWT secret
    Add-Type -AssemblyName System.Web
    $jwtSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "your-super-secret-jwt-key-change-this-in-production", $jwtSecret
    $envContent = $envContent -replace "postgresql\+asyncpg://postgres:password@localhost:5432/fastapi_db", "sqlite+aiosqlite:///./app.db"
    Set-Content ".env" $envContent
    Write-Status "Generated secure JWT secret"
}

Set-Location backend

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Status "Creating Python virtual environment..."
    python -m venv venv
}

# Activate virtual environment
Write-Status "Activating virtual environment..."
& "venv\Scripts\Activate.ps1"

# Install only the most essential packages
Write-Status "Installing essential dependencies (this may take a few minutes)..."

# Install packages one by one with error handling
$essentialPackages = @(
    "fastapi==0.104.1",
    "uvicorn[standard]==0.24.0", 
    "sqlalchemy==2.0.23",
    "aiosqlite==0.19.0",
    "alembic==1.12.1",
    "pydantic==2.5.0",
    "python-multipart==0.0.6"
)

foreach ($package in $essentialPackages) {
    Write-Status "Installing $package..."
    pip install $package --no-deps --force-reinstall
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Retrying $package with different approach..."
        pip install $package
    }
}

# Install dependencies for the packages we installed
Write-Status "Installing package dependencies..."
pip install annotated-types typing-extensions starlette anyio

# Set up SQLite database
Write-Status "Setting up SQLite database..."
$env:DATABASE_URL = "sqlite+aiosqlite:///./app.db"

# Create a simple alembic.ini for SQLite
$alembicConfig = @"
[alembic]
script_location = alembic
sqlalchemy.url = sqlite:///./app.db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
"@

Set-Content "alembic-sqlite.ini" $alembicConfig

# Run migrations with SQLite config
Write-Status "Running database migrations..."
alembic -c alembic-sqlite.ini upgrade head

if ($LASTEXITCODE -ne 0) {
    Write-Error "Database migration failed. Let's try manual setup..."
    # Create tables manually using SQLAlchemy
    python -c @"
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.base import Base

async def create_tables():
    engine = create_async_engine('sqlite+aiosqlite:///./app.db')
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print('Tables created successfully')

asyncio.run(create_tables())
"@
}

Write-Status "Starting FastAPI development server..."
Write-Host ""
Write-Host "🎉 FastAPI Backend is starting..." -ForegroundColor Green
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔍 Health Check: http://localhost:8000/api/v1/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Set environment variable and start server
$env:DATABASE_URL = "sqlite+aiosqlite:///./app.db"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000