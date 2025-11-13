# Heinz Boilerplate - Full Stack Application Launcher
# This script starts both backend and frontend services

param(
    [switch]$Dev,
    [switch]$Prod,
    [switch]$Stop,
    [switch]$Clean,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "Heinz Boilerplate - Full Stack Application Launcher" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\start-app.ps1 -Dev     # Start development environment"
    Write-Host "  .\start-app.ps1 -Prod    # Start production environment"
    Write-Host "  .\start-app.ps1 -Stop    # Stop all services"
    Write-Host "  .\start-app.ps1 -Clean   # Clean and rebuild everything"
    Write-Host "  .\start-app.ps1 -Help    # Show this help"
    Write-Host ""
    Write-Host "Development URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend:     http://localhost:3000"
    Write-Host "  Backend API:  http://localhost:8000"
    Write-Host "  API Docs:     http://localhost:8000/docs"
    Write-Host "  Storybook:    http://localhost:6006"
    Write-Host "  Grafana:      http://localhost:3001"
    Write-Host "  Jaeger:       http://localhost:16686"
    Write-Host "  Prometheus:   http://localhost:9090"
    Write-Host ""
}

function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        return $false
    }
}

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Docker
    if (-not (Test-DockerRunning)) {
        exit 1
    }
    Write-Host "SUCCESS: Docker is running" -ForegroundColor Green
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "SUCCESS: Node.js version: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Node.js not found. Please install Node.js 18+" -ForegroundColor Red
        exit 1
    }
    
    # Check if we're in the right directory
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Host "ERROR: docker-compose.yml not found. Please run from project root." -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Project structure verified" -ForegroundColor Green
    Write-Host ""
}

function Start-Development {
    Write-Host "Starting Heinz Boilerplate in Development Mode..." -ForegroundColor Green
    Write-Host ""
    
    Test-Prerequisites
    
    # Copy environment files if they don't exist
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "INFO: Created .env from .env.example" -ForegroundColor Cyan
        }
    }
    
    if (-not (Test-Path "frontend/.env.local")) {
        if (Test-Path "frontend/.env.example") {
            Copy-Item "frontend/.env.example" "frontend/.env.local"
            Write-Host "INFO: Created frontend/.env.local from .env.example" -ForegroundColor Cyan
        }
    }
    
    # Install frontend dependencies if needed
    if (-not (Test-Path "frontend/node_modules")) {
        Write-Host "INFO: Installing frontend dependencies..." -ForegroundColor Yellow
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Host "SUCCESS: Frontend dependencies installed" -ForegroundColor Green
    }
    
    # Start with Docker Compose
    Write-Host "INFO: Starting all services with Docker Compose..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host ""
    Write-Host "SUCCESS: Application started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Application URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend App:     http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend API:      http://localhost:8000" -ForegroundColor White
    Write-Host "  API Documentation: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Development Tools:" -ForegroundColor Cyan
    Write-Host "  Storybook:        http://localhost:6006 (run separately)" -ForegroundColor White
    Write-Host ""
    Write-Host "Observability Stack:" -ForegroundColor Cyan
    Write-Host "  Grafana:          http://localhost:3001 (admin/admin)" -ForegroundColor White
    Write-Host "  Jaeger Tracing:   http://localhost:16686" -ForegroundColor White
    Write-Host "  Prometheus:       http://localhost:9090" -ForegroundColor White
    Write-Host ""
    Write-Host "Tips:" -ForegroundColor Yellow
    Write-Host "  - Watch logs: docker-compose logs -f"
    Write-Host "  - Stop services: .\start-app.ps1 -Stop"
    Write-Host "  - Start Storybook: cd frontend; npm run storybook"
    Write-Host "  - Run tests: cd frontend; npm test"
    Write-Host ""
}

function Start-Production {
    Write-Host "🏭 Starting Heinz Boilerplate in Production Mode..." -ForegroundColor Green
    Write-Host ""
    
    Test-Prerequisites
    
    # Build production images
    Write-Host "🔨 Building production images..." -ForegroundColor Yellow
    docker-compose -f docker-compose.yml build --no-cache
    
    # Start production services
    Write-Host "🐳 Starting production services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.yml up -d
    
    Write-Host ""
    Write-Host "🎉 Production environment started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Application URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend App:     http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend API:      http://localhost:8000" -ForegroundColor White
    Write-Host "  API Documentation: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
}

function Stop-Services {
    Write-Host "INFO: Stopping all services..." -ForegroundColor Yellow
    
    if (Test-Path "docker-compose.yml") {
        docker-compose down
        Write-Host "SUCCESS: All services stopped" -ForegroundColor Green
    } else {
        Write-Host "ERROR: docker-compose.yml not found" -ForegroundColor Red
    }
}

function Clean-Environment {
    Write-Host "INFO: Cleaning environment..." -ForegroundColor Yellow
    
    # Stop all services
    Stop-Services
    
    # Remove Docker containers, networks, and volumes
    Write-Host "🗑️  Removing Docker containers and volumes..." -ForegroundColor Yellow
    docker-compose down -v --remove-orphans
    
    # Clean frontend node_modules and build artifacts
    if (Test-Path "frontend/node_modules") {
        Write-Host "🗑️  Removing frontend/node_modules..." -ForegroundColor Yellow
        Remove-Item "frontend/node_modules" -Recurse -Force
    }
    
    if (Test-Path "frontend/.next") {
        Write-Host "🗑️  Removing frontend/.next..." -ForegroundColor Yellow
        Remove-Item "frontend/.next" -Recurse -Force
    }
    
    # Clean Docker system (optional - uncomment if desired)
    # Write-Host "🗑️  Cleaning Docker system..." -ForegroundColor Yellow
    # docker system prune -f
    
    Write-Host "Environment cleaned successfully" -ForegroundColor Green
    Write-Host "Run .\start-app.ps1 -Dev to rebuild and start" -ForegroundColor Yellow
}

function Wait-ForServices {
    Write-Host "INFO: Waiting for services to be ready..." -ForegroundColor Yellow
    
    $maxAttempts = 30
    $attempt = 0
    
    do {
        $attempt++
        Start-Sleep -Seconds 2
        
        try {
            $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -TimeoutSec 5 -UseBasicParsing
            if ($backendResponse.StatusCode -eq 200) {
                Write-Host "SUCCESS: Backend is ready!" -ForegroundColor Green
                break
            }
        }
        catch {
            Write-Host "Waiting for backend... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        }
        
        if ($attempt -ge $maxAttempts) {
            Write-Host "Backend health check timeout. Services might still be starting..." -ForegroundColor Yellow
            break
        }
    } while ($attempt -lt $maxAttempts)
}

# Main script logic
if ($Help) {
    Show-Help
    exit 0
}

if ($Stop) {
    Stop-Services
    exit 0
}

if ($Clean) {
    Clean-Environment
    exit 0
}

if ($Prod) {
    Start-Production
    Wait-ForServices
    exit 0
}

# Default to development mode
if ($Dev -or (-not $Prod -and -not $Stop -and -not $Clean)) {
    Start-Development
    Wait-ForServices
    exit 0
}

# If no valid parameters, show help
Show-Help