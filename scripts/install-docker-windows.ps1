# Install Docker Desktop on Windows
# This script helps install Docker Desktop if it's not already installed

param(
    [switch]$Force = $false
)

Write-Host "🐳 Docker Desktop Installation Helper" -ForegroundColor Cyan

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

# Check if Docker is already installed and running
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Docker is already installed: $dockerVersion"
        
        try {
            docker info | Out-Null
            Write-Status "Docker is running and ready!"
            Write-Host "You can now run the bootstrap script:" -ForegroundColor Green
            Write-Host "powershell -ExecutionPolicy Bypass -File scripts/bootstrap-backend.ps1" -ForegroundColor Cyan
            exit 0
        } catch {
            Write-Warning "Docker is installed but not running."
            Write-Host "Please start Docker Desktop and wait for it to be ready." -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Status "Docker not found, proceeding with installation guidance..."
}

# Check Windows version compatibility
$osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
$buildNumber = [int]$osInfo.BuildNumber

Write-Status "Windows version: $($osInfo.Caption) (Build $buildNumber)"

if ($buildNumber -lt 19041) {
    Write-Warning "Your Windows version may not support Docker Desktop."
    Write-Warning "Docker Desktop requires Windows 10 version 2004 or higher, or Windows 11."
}

# Check if Hyper-V or WSL2 is available
$hypervFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -ErrorAction SilentlyContinue
$wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -ErrorAction SilentlyContinue

Write-Status "Checking virtualization features..."

if ($wslFeature -and $wslFeature.State -eq "Enabled") {
    Write-Status "WSL2 is available (recommended for Docker Desktop)"
} elseif ($hypervFeature -and $hypervFeature.State -eq "Enabled") {
    Write-Status "Hyper-V is available"
} else {
    Write-Warning "Neither WSL2 nor Hyper-V appears to be enabled."
    Write-Warning "You may need to enable these features for Docker Desktop."
}

# Download and install Docker Desktop
Write-Host ""
Write-Host "=== Docker Desktop Installation ===" -ForegroundColor Cyan
Write-Host ""

if ($Force -or (Read-Host "Do you want to download and install Docker Desktop? (y/N)") -match '^[Yy]') {
    
    Write-Status "Downloading Docker Desktop installer..."
    
    $dockerInstallerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $installerPath = "$env:TEMP\DockerDesktopInstaller.exe"
    
    try {
        Invoke-WebRequest -Uri $dockerInstallerUrl -OutFile $installerPath -UseBasicParsing
        Write-Status "Downloaded Docker Desktop installer"
        
        Write-Status "Starting Docker Desktop installation..."
        Write-Warning "This will require administrator privileges."
        
        # Run installer with admin privileges
        Start-Process -FilePath $installerPath -ArgumentList "install", "--quiet" -Verb RunAs -Wait
        
        Write-Status "Docker Desktop installation completed!"
        Write-Warning "Please restart your computer to complete the installation."
        Write-Warning "After restart, start Docker Desktop and wait for it to be ready."
        
        # Clean up installer
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
        
    } catch {
        Write-Error "Failed to download or install Docker Desktop: $_"
        Write-Host ""
        Write-Host "Manual installation steps:" -ForegroundColor Yellow
        Write-Host "1. Go to https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        Write-Host "2. Download Docker Desktop for Windows" -ForegroundColor Yellow
        Write-Host "3. Run the installer as Administrator" -ForegroundColor Yellow
        Write-Host "4. Follow the installation wizard" -ForegroundColor Yellow
        Write-Host "5. Restart your computer" -ForegroundColor Yellow
        Write-Host "6. Start Docker Desktop" -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "Manual installation steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host "2. Download Docker Desktop for Windows" -ForegroundColor Yellow
    Write-Host "3. Run the installer as Administrator" -ForegroundColor Yellow
    Write-Host "4. Follow the installation wizard" -ForegroundColor Yellow
    Write-Host "5. Restart your computer" -ForegroundColor Yellow
    Write-Host "6. Start Docker Desktop" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== After Docker Installation ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Docker Desktop from the Start Menu" -ForegroundColor Green
Write-Host "2. Wait for Docker to be ready (whale icon in system tray)" -ForegroundColor Green
Write-Host "3. Run the bootstrap script:" -ForegroundColor Green
Write-Host "   powershell -ExecutionPolicy Bypass -File scripts/bootstrap-backend.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you encounter issues, you can run without Docker:" -ForegroundColor Yellow
Write-Host "   powershell -ExecutionPolicy Bypass -File scripts/bootstrap-backend.ps1 -SkipDocker" -ForegroundColor Cyan