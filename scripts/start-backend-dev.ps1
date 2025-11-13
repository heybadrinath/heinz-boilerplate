# Simple development server script (no Docker required)
# This script starts just the FastAPI backend with SQLite

Write-Host ""
Write-Host "FastAPI Backend Development Setup" -ForegroundColor Green -BackgroundColor Black
Write-Host "============================================" -ForegroundColor DarkGray

function Write-Step {
    param($Step, $Message)
    Write-Host "[$Step] " -NoNewline -ForegroundColor Cyan
    Write-Host "$Message" -ForegroundColor White
}

function Write-Success {
    param($Message)
    Write-Host "[OK] " -NoNewline -ForegroundColor Green
    Write-Host "$Message" -ForegroundColor Gray
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] " -NoNewline -ForegroundColor Yellow
    Write-Host "$Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] " -NoNewline -ForegroundColor Red
    Write-Host "$Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "backend\app\main.py")) {
    Write-Error "Please run this script from the repository root directory"
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Step "1/5" "Setting up environment configuration"
    Copy-Item ".env.example" ".env"
    
    # Generate a random JWT secret
    $jwtSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "your-super-secret-jwt-key-change-this-in-production", $jwtSecret
    $envContent = $envContent -replace "postgresql\+asyncpg://postgres:password@localhost:5432/fastapi_db", "sqlite+aiosqlite:///./app.db"
    Set-Content ".env" $envContent
    
    Write-Success "Environment configured with SQLite and secure JWT secret"
} else {
    Write-Success "Environment configuration already exists"
}

Set-Location backend

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Step "2/5" "Creating Python virtual environment"
    python -m venv venv
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create virtual environment. Make sure Python 3.11+ is installed."
        exit 1
    }
    Write-Success "Virtual environment created"
} else {
    Write-Success "Virtual environment already exists"
}

# Activate virtual environment
Write-Step "2/5" "Activating virtual environment"
& "venv\Scripts\Activate.ps1"

# Install dependencies
Write-Step "3/5" "Installing dependencies"
python -m pip install --upgrade pip --quiet

# Check Python version and use appropriate requirements
$pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
if ($pythonVersion -eq "3.13" -and (Test-Path "requirements-minimal-py313.txt")) {
    pip install -r requirements-minimal-py313.txt --quiet
    Write-Success "Python 3.13 compatible packages installed"
} elseif (Test-Path "requirements-minimal.txt") {
    pip install -r requirements-minimal.txt --quiet
    Write-Success "Minimal requirements installed"
} else {
    pip install -r requirements.txt --quiet
    Write-Success "Full requirements installed"
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies. Check your internet connection and Python installation."
    exit 1
}

# Set up SQLite database
Write-Step "4/5" "Setting up database"
$env:DATABASE_URL = "sqlite+aiosqlite:///./app.db"

# Run migrations
alembic upgrade head

if ($LASTEXITCODE -ne 0) {
    Write-Error "Database migration failed. Check the error messages above."
    exit 1
}

Write-Success "Database initialized and migrations applied"

# Start the server
Write-Step "5/5" "Starting development server"
Write-Host ""
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Backend ready at " -NoNewline -ForegroundColor Green
Write-Host "http://localhost:8000" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "API Docs: " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "Health:   " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000/api/v1/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000