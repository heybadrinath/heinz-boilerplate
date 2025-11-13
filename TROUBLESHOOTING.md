# Troubleshooting Guide

This guide helps you resolve common issues when setting up the FastAPI backend boilerplate.

## Start Script Prerequisites

### Node.js Requirement for Start Scripts

**Important**: The start scripts (`start-app.ps1` and `start-app.sh`) require **Node.js 18+** to be installed, even when using Docker. This is because:

1. The scripts install frontend dependencies during setup
2. Frontend builds require Node.js for the containerized build process
3. Development workflow includes frontend dependency management

**If you get**: `ERROR: Node.js not found. Please install Node.js 18+`

**Solution**:
1. Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Restart your terminal/command prompt  
3. Verify: `node --version` should show v18 or higher
4. Re-run the start script

**Alternative**: If you only want the backend, use the backend-only scripts:
- Windows: `.\scripts\start-backend-dev.ps1`
- Linux/macOS: `./scripts/start-backend-dev.sh`

## 🚨 Most Common Issues & Solutions

### 1. Docker Issues

#### Problem: "Docker not running" or "cannot find Docker"
```
ERROR: error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine"
```

**Solutions:**
1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop/
2. **Start Docker Desktop** and wait for it to fully load (green whale icon)
3. **Use the no-Docker option**:
   ```powershell
   # Windows
   powershell -ExecutionPolicy Bypass -File scripts/start-backend-dev.ps1
   
   # Linux/macOS  
   ./scripts/start-backend-dev.sh
   ```

#### Problem: "docker-compose: command not found"
**Solution:** Docker Compose is included with Docker Desktop. Update to the latest version.

#### Problem: "Port already in use"
**Solution:** Stop conflicting services:
```powershell
# Windows
docker-compose down
netstat -ano | findstr :8000

# Linux/macOS
docker-compose down
lsof -i :8000
```

### 2. Python Issues

#### Problem: "python: command not found"
**Solutions:**
1. **Install Python 3.11+**: https://www.python.org/downloads/
2. **On Windows, try**: `py` instead of `python`
3. **Add Python to PATH** during installation

#### Problem: "Permission denied" (Linux/macOS)
**Solution:**
```bash
chmod +x scripts/*.sh
sudo chown -R $USER:$USER .
```

#### Problem: Virtual environment creation fails
**Solution:**
```bash
# Make sure python3-venv is installed (Ubuntu/Debian)
sudo apt update && sudo apt install python3-venv

# Or try with specific Python version
python3.11 -m venv venv
```

### 3. Database Issues

#### Problem: "Connection refused" to PostgreSQL
**Solutions:**
1. **Check if PostgreSQL container is running**:
   ```bash
   docker-compose ps
   docker-compose logs postgres
   ```

2. **Restart PostgreSQL**:
   ```bash
   docker-compose restart postgres
   ```

3. **Use SQLite instead** (no Docker required):
   ```bash
   export DATABASE_URL="sqlite+aiosqlite:///./app.db"
   ```

#### Problem: "Database does not exist"
**Solution:** Run migrations:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
alembic upgrade head
```

### 4. Port Conflicts

#### Problem: Port 8000 already in use
**Solutions:**
1. **Find and kill the process**:
   ```powershell
   # Windows
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   
   # Linux/macOS
   lsof -i :8000
   kill -9 <PID>
   ```

2. **Use different port**:
   ```bash
   uvicorn app.main:app --port 8001
   ```

### 5. Installation Issues

#### Problem: "pip install failed"
**Solutions:**
1. **Upgrade pip**:
   ```bash
   python -m pip install --upgrade pip
   ```

2. **Use different index**:
   ```bash
   pip install --index-url https://pypi.org/simple/ -r requirements.txt
   ```

3. **Install with no cache**:
   ```bash
   pip install --no-cache-dir -r requirements.txt
   ```

## 🔧 Step-by-Step Diagnostic

### Step 1: Verify Prerequisites

```bash
# Check Python version (should be 3.11+)
python --version
python3 --version
py --version  # Windows

# Check Git
git --version

# Check Docker (optional)
docker --version
docker-compose --version
```

### Step 2: Test Basic Setup

```bash
# Test if you're in the right directory
ls -la  # Should see: backend/, scripts/, docker-compose.yml

# Test .env creation
cat .env  # Should exist after running any bootstrap script
```

### Step 3: Test Python Environment

```bash
cd backend

# Test virtual environment creation
python -m venv test_venv
source test_venv/bin/activate  # or test_venv\Scripts\activate on Windows
pip --version
deactivate
rm -rf test_venv
```

### Step 4: Test Database Connection

```bash
# Test SQLite (always works)
python -c "import sqlite3; print('SQLite OK')"

# Test PostgreSQL (if Docker is running)
docker-compose exec postgres pg_isready -U postgres
```

## 🎯 Environment-Specific Solutions

### Windows-Specific Issues

#### PowerShell Execution Policy
```powershell
# If you get "execution policy" error
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Long Path Names
```powershell
# Enable long paths in Windows
git config --system core.longpaths true
```

#### Windows Defender / Antivirus
- Add the project folder to antivirus exclusions
- Docker Desktop needs Hyper-V or WSL2 enabled

### macOS-Specific Issues

#### Homebrew Dependencies
```bash
# Install required tools
brew install python@3.11
brew install --cask docker
```

#### Permission Issues
```bash
# Fix common permission issues
sudo chown -R $(whoami) /usr/local/lib/python3.11/site-packages
```

### Linux-Specific Issues

#### Docker Installation (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Logout and login again
```

#### Python Development Headers
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11-dev python3.11-venv build-essential

# CentOS/RHEL
sudo yum install python3-devel gcc
```

## 🚀 Quick Reset Commands

### Complete Reset (Nuclear Option)

```bash
# Stop all services
docker-compose down -v

# Clean up Docker
docker system prune -a

# Remove Python environment
rm -rf backend/venv

# Remove database files
rm -f backend/*.db

# Remove .env file
rm .env

# Start fresh
./scripts/start-backend-dev.sh  # No Docker needed
```

### Soft Reset

```bash
# Just restart services
docker-compose restart

# Or recreate backend environment
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📞 Getting Help

### Collecting Information for Support

If you need help, please provide:

1. **Operating System**: Windows/macOS/Linux version
2. **Python Version**: `python --version`
3. **Error Message**: Full error text
4. **What you tried**: Which commands you ran
5. **Environment**: Docker/No Docker

### Useful Diagnostic Commands

```bash
# System information
python --version
docker --version
docker-compose --version

# Project status
ls -la
cat .env

# Service status (if using Docker)
docker-compose ps
docker-compose logs

# Python environment
pip list
pip check

# Network diagnostics
curl http://localhost:8000/api/v1/health
netstat -tulpn | grep 8000  # Linux
netstat -ano | findstr 8000  # Windows
```

### Log Files to Check

1. **Application logs**: `docker-compose logs backend`
2. **Database logs**: `docker-compose logs postgres`
3. **Python errors**: Usually shown in terminal
4. **Docker logs**: Docker Desktop → Troubleshoot → Show logs

## ✅ Success Verification

Once everything works, you should be able to:

1. **Access the API**: http://localhost:8000/api/v1/health
2. **View documentation**: http://localhost:8000/docs
3. **Register a user**:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/register" \
     -H "Content-Type: application/json" \
     -d '{"username": "test", "email": "test@example.com", "password": "test123"}'
   ```

## 🔄 Still Having Issues?

Try these fallback options:

### Option 1: Minimal Setup
```bash
# Just get the API running with SQLite
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic aiosqlite
export DATABASE_URL="sqlite+aiosqlite:///./app.db"
alembic upgrade head
uvicorn app.main:app --reload
```

### Option 2: Use GitHub Codespaces
If local setup fails, try GitHub Codespaces or similar cloud development environment.

### Option 3: Contact Support
- Check the project's GitHub Issues
- Create a new issue with:
  - Your OS and versions
  - Full error messages
  - Steps you've tried

Remember: The no-Docker option (`scripts/start-backend-dev.sh`) works on 99% of systems and gives you a fully functional FastAPI backend!