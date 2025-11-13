# Test script to verify the setup is working
# This script runs a comprehensive test of the FastAPI backend

param(
    [switch]$SkipE2E = $false
)

Write-Host "🧪 Testing FastAPI Backend Setup..." -ForegroundColor Green

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

$testsPassed = 0
$testsFailed = 0

function Test-Step {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Status "Testing: $Name"
    try {
        & $Test
        Write-Success "$Name ✓"
        $script:testsPassed++
    } catch {
        Write-Error "$Name ✗ - $_"
        $script:testsFailed++
    }
    Write-Host ""
}

# Test 1: Check if API is responding
Test-Step "API Health Check" {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/health" -TimeoutSec 10
    if ($response.status -ne "ok") {
        throw "Health check failed: $($response | ConvertTo-Json)"
    }
}

# Test 2: Check API documentation
Test-Step "API Documentation" {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -ne 200) {
        throw "Documentation not accessible"
    }
}

# Test 3: Test user registration
Test-Step "User Registration" {
    $userData = @{
        username = "testuser_$(Get-Random)"
        email = "test_$(Get-Random)@example.com"
        password = "testpassword123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/register" -Method POST -Body $userData -ContentType "application/json"
    if (-not $response.username) {
        throw "User registration failed"
    }
    $script:testUsername = $response.username
    $script:testPassword = "testpassword123"
}

# Test 4: Test user login
Test-Step "User Login" {
    $loginData = @{
        username = $script:testUsername
        password = $script:testPassword
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/login" -Method POST -Body $loginData -ContentType "application/json"
    if (-not $response.access_token) {
        throw "User login failed"
    }
    $script:authToken = $response.access_token
}

# Test 5: Test authenticated endpoint
Test-Step "Authenticated Request" {
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/me" -Headers $headers
    if ($response.username -ne $script:testUsername) {
        throw "Authenticated request failed"
    }
}

# Test 6: Test Todo creation
Test-Step "Todo Creation" {
    $todoData = @{
        title = "Test Todo"
        description = "This is a test todo"
        priority = "high"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/todos" -Method POST -Body $todoData -Headers $headers
    if ($response.title -ne "Test Todo") {
        throw "Todo creation failed"
    }
    $script:todoId = $response.id
}

# Test 7: Test Todo retrieval
Test-Step "Todo Retrieval" {
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/todos" -Headers $headers
    if ($response.Count -eq 0) {
        throw "No todos found"
    }
}

# Test 8: Test Todo update
Test-Step "Todo Update" {
    $updateData = @{
        completed = $true
        priority = "low"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/todos/$($script:todoId)" -Method PUT -Body $updateData -Headers $headers
    if ($response.completed -ne $true) {
        throw "Todo update failed"
    }
}

# Test 9: Test Prometheus metrics
Test-Step "Prometheus Metrics" {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/metrics" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -ne 200 -or $response.Content -notlike "*http_requests_total*") {
        throw "Metrics endpoint failed"
    }
}

# Test 10: Test Todo deletion
Test-Step "Todo Deletion" {
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/todos/$($script:todoId)" -Method DELETE -Headers $headers
    if ($response.success -ne $true) {
        throw "Todo deletion failed"
    }
}

# Optional: Run E2E tests if requested
if (-not $SkipE2E -and (Test-Path "tests/e2e/package.json")) {
    Test-Step "E2E Tests" {
        Push-Location "tests/e2e"
        try {
            if (-not (Test-Path "node_modules")) {
                Write-Status "Installing E2E test dependencies..."
                npm install
                npm run install
            }
            
            $env:API_BASE_URL = "http://localhost:8000"
            npm test
        } finally {
            Pop-Location
        }
    }
}

# Results
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "TEST RESULTS" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Success "🎉 All tests passed! ($testsPassed/$($testsPassed + $testsFailed))"
    Write-Host ""
    Write-Host "Your FastAPI backend is working correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available endpoints:" -ForegroundColor Cyan
    Write-Host "• API: http://localhost:8000" -ForegroundColor White
    Write-Host "• Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host "• Health: http://localhost:8000/api/v1/health" -ForegroundColor White
    Write-Host "• Metrics: http://localhost:8000/metrics" -ForegroundColor White
    
    if (Get-Process | Where-Object { $_.ProcessName -eq "docker" }) {
        Write-Host ""
        Write-Host "If using Docker, also check:" -ForegroundColor Cyan
        Write-Host "• Grafana: http://localhost:3001 (admin/admin)" -ForegroundColor White
        Write-Host "• Prometheus: http://localhost:9090" -ForegroundColor White
        Write-Host "• Jaeger: http://localhost:16686" -ForegroundColor White
    }
    
} else {
    Write-Error "❌ $testsFailed test(s) failed, $testsPassed passed"
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure the backend is running: uvicorn app.main:app --reload" -ForegroundColor White
    Write-Host "2. Check the server logs for errors" -ForegroundColor White
    Write-Host "3. Verify the database is accessible" -ForegroundColor White
    Write-Host "4. See TROUBLESHOOTING.md for detailed help" -ForegroundColor White
    exit 1
}

Write-Host ""