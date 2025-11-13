# PowerShell bootstrap script for FastAPI backend
# Bootstrap script for FastAPI backend on Windows

param(
    [switch]$SkipDocker = $false,
    [switch]$InstallDocker = $false
)

Write-Host ""
Write-Host "FastAPI Backend Bootstrap (Full Stack)" -ForegroundColor Green -BackgroundColor Black
Write-Host "=======================================" -ForegroundColor DarkGray

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
if (-not (Test-Path "docker-compose.yml")) {
    Write-Error "Please run this script from the repository root directory"
    exit 1
}

# Create .env file from example if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Step "1/6" "Setting up environment configuration"
    Copy-Item ".env.example" ".env"
    Write-Warning "Please update .env file with your configuration before proceeding"
    Write-Warning "Especially update JWT_SECRET_KEY with a secure random value"
    Write-Success "Environment template created"
} else {
    Write-Success "Environment configuration already exists"
}

if (-not $SkipDocker) {
    # Check if Docker is running
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Docker not running"
        }
    } catch {
        Write-Error "Docker Desktop is not running or not installed."
        Write-Host ""
        Write-Host "Options to fix this:" -ForegroundColor Cyan
        Write-Host "1. Install Docker Desktop automatically:" -ForegroundColor Yellow
        Write-Host "   powershell -ExecutionPolicy Bypass -File scripts/install-docker-windows.ps1" -ForegroundColor Green
        Write-Host ""
        Write-Host "2. Manual Docker installation:" -ForegroundColor Yellow
        Write-Host "   - Go to https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        Write-Host "   - Download and install Docker Desktop" -ForegroundColor Yellow
        Write-Host "   - Start Docker Desktop and wait for it to be ready" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "3. Skip Docker and run backend only (no observability stack):" -ForegroundColor Yellow
        Write-Host "   powershell -ExecutionPolicy Bypass -File scripts/bootstrap-backend.ps1 -SkipDocker" -ForegroundColor Green
        Write-Host ""
        
        if ($InstallDocker) {
            Write-Step "2/6" "Attempting to install Docker Desktop"
            & "scripts/install-docker-windows.ps1" -Force
            exit $LASTEXITCODE
        }
        
        exit 1
    }

    # Check if docker-compose is available
    try {
        docker-compose version | Out-Null
    } catch {
        Write-Error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    }

    Write-Step "2/6" "Starting infrastructure services"
    docker-compose up -d postgres redis otel-collector jaeger prometheus grafana

    # Wait for PostgreSQL to be ready
    Write-Step "3/6" "Waiting for PostgreSQL to be ready"
    do {
        Write-Host "." -NoNewline -ForegroundColor Yellow
        $pgReady = docker-compose exec -T postgres pg_isready -U postgres
        Start-Sleep 2
    } while ($LASTEXITCODE -ne 0)
    Write-Host ""

    # Wait for Redis to be ready
    Write-Step "3/6" "Waiting for Redis to be ready"
    do {
        Write-Host "." -NoNewline -ForegroundColor Yellow
        $redisReady = docker-compose exec -T redis redis-cli ping
        Start-Sleep 2
    } while ($LASTEXITCODE -ne 0)
    Write-Host ""

    Write-Success "Infrastructure services are ready"
}

# Install Python dependencies
Write-Step "4/6" "Installing Python dependencies"
Set-Location backend

if (-not (Test-Path "venv")) {
    Write-Step "4/6" "Creating Python virtual environment"
    python -m venv venv
}

& "venv\Scripts\Activate.ps1"
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
pip install -r requirements-dev.txt --quiet

Write-Success "Dependencies installed successfully"

# Run Alembic migrations
if (-not $SkipDocker) {
    Write-Step "5/6" "Running database migrations"
    $env:DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5432/fastapi_db"
    alembic upgrade head
    Write-Success "Database migrations completed"
} else {
    Write-Warning "Skipping database migrations (Docker not available)"
    Write-Warning "You can run migrations later when PostgreSQL is available: alembic upgrade head"
}

# Build and start backend service
Set-Location ..
if (-not $SkipDocker) {
    Write-Step "6/6" "Building and starting backend service"
    docker-compose up -d backend

    # Wait for backend to be ready
    Write-Step "6/6" "Waiting for backend to be ready"
    do {
        Write-Host "." -NoNewline -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -UseBasicParsing -TimeoutSec 2
            $ready = $response.StatusCode -eq 200
        } catch {
            $ready = $false
        }
        Start-Sleep 2
    } while (-not $ready)
    Write-Host ""
}

Write-Success "Backend is ready!"

Write-Host ""
Write-Host "=== Service URLs ===" -ForegroundColor Cyan
Write-Host "Backend API:      http://localhost:8000"
Write-Host "API Docs:         http://localhost:8000/docs"
Write-Host "Grafana:          http://localhost:3001 (admin/admin)"
Write-Host "Prometheus:       http://localhost:9090"
Write-Host "Jaeger:           http://localhost:16686"
Write-Host ""
Write-Host "=== Useful Commands ===" -ForegroundColor Cyan
Write-Host "View logs:        docker-compose logs -f backend"
Write-Host "Run tests:        cd backend && venv\Scripts\activate && pytest"
Write-Host "Stop services:    docker-compose down"
Write-Host ""
Write-Host "[SUCCESS] Bootstrap completed successfully!" -ForegroundColor Green