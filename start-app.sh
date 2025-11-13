#!/bin/bash
# Heinz Boilerplate - Full Stack Application Launcher
# This script starts both backend and frontend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${GREEN}Heinz Boilerplate - Full Stack Application Launcher${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./start-app.sh dev      # Start development environment"
    echo "  ./start-app.sh prod     # Start production environment"
    echo "  ./start-app.sh stop     # Stop all services"
    echo "  ./start-app.sh clean    # Clean and rebuild everything"
    echo "  ./start-app.sh help     # Show this help"
    echo ""
    echo -e "${CYAN}Development URLs:${NC}"
    echo "  Frontend:     http://localhost:3000"
    echo "  Backend API:  http://localhost:8000"
    echo "  API Docs:     http://localhost:8000/docs"
    echo "  Storybook:    http://localhost:6006"
    echo "  Grafana:      http://localhost:3001"
    echo "  Jaeger:       http://localhost:16686"
    echo "  Prometheus:   http://localhost:9090"
    echo ""
}

check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check Docker
    check_docker
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
    else
        echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "docker-compose.yml" ]; then
        echo -e "${RED}❌ docker-compose.yml not found. Please run from project root.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Project structure verified${NC}"
    echo ""
}

start_development() {
    echo -e "${GREEN}🚀 Starting Heinz Boilerplate in Development Mode...${NC}"
    echo ""
    
    check_prerequisites
    
    # Copy environment files if they don't exist
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${CYAN}📄 Created .env from .env.example${NC}"
    fi
    
    if [ ! -f "frontend/.env.local" ] && [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env.local
        echo -e "${CYAN}📄 Created frontend/.env.local from .env.example${NC}"
    fi
    
    # Install frontend dependencies if needed
    if [ ! -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    fi
    
    # Start with Docker Compose
    echo -e "${YELLOW}🐳 Starting all services with Docker Compose...${NC}"
    docker-compose up -d
    
    echo ""
    echo -e "${GREEN}🎉 Application started successfully!${NC}"
    echo ""
    echo -e "${CYAN}📱 Application URLs:${NC}"
    echo -e "  Frontend App:     ${WHITE}http://localhost:3000${NC}"
    echo -e "  Backend API:      ${WHITE}http://localhost:8000${NC}"
    echo -e "  API Documentation: ${WHITE}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${CYAN}🛠️  Development Tools:${NC}"
    echo -e "  Storybook:        ${WHITE}http://localhost:6006 (run separately: cd frontend && npm run storybook)${NC}"
    echo ""
    echo -e "${CYAN}📊 Observability Stack:${NC}"
    echo -e "  Grafana:          ${WHITE}http://localhost:3001 (admin/admin)${NC}"
    echo -e "  Jaeger Tracing:   ${WHITE}http://localhost:16686${NC}"
    echo -e "  Prometheus:       ${WHITE}http://localhost:9090${NC}"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "  - Watch logs: docker-compose logs -f"
    echo "  - Stop services: ./start-app.sh stop"
    echo "  - Start Storybook: cd frontend && npm run storybook"
    echo "  - Run tests: cd frontend && npm test"
    echo ""
}

start_production() {
    echo -e "${GREEN}🏭 Starting Heinz Boilerplate in Production Mode...${NC}"
    echo ""
    
    check_prerequisites
    
    # Build production images
    echo -e "${YELLOW}🔨 Building production images...${NC}"
    docker-compose -f docker-compose.yml build --no-cache
    
    # Start production services
    echo -e "${YELLOW}🐳 Starting production services...${NC}"
    docker-compose -f docker-compose.yml up -d
    
    echo ""
    echo -e "${GREEN}🎉 Production environment started!${NC}"
    echo ""
    echo -e "${CYAN}📱 Application URLs:${NC}"
    echo -e "  Frontend App:     ${WHITE}http://localhost:3000${NC}"
    echo -e "  Backend API:      ${WHITE}http://localhost:8000${NC}"
    echo -e "  API Documentation: ${WHITE}http://localhost:8000/docs${NC}"
    echo ""
}

stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down
        echo -e "${GREEN}✅ All services stopped${NC}"
    else
        echo -e "${RED}❌ docker-compose.yml not found${NC}"
    fi
}

clean_environment() {
    echo -e "${YELLOW}🧹 Cleaning environment...${NC}"
    
    # Stop all services
    stop_services
    
    # Remove Docker containers, networks, and volumes
    echo -e "${YELLOW}🗑️  Removing Docker containers and volumes...${NC}"
    docker-compose down -v --remove-orphans
    
    # Clean frontend node_modules and build artifacts
    if [ -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}🗑️  Removing frontend/node_modules...${NC}"
        rm -rf frontend/node_modules
    fi
    
    if [ -d "frontend/.next" ]; then
        echo -e "${YELLOW}🗑️  Removing frontend/.next...${NC}"
        rm -rf frontend/.next
    fi
    
    # Clean Docker system (optional - uncomment if desired)
    # echo -e "${YELLOW}🗑️  Cleaning Docker system...${NC}"
    # docker system prune -f
    
    echo -e "${GREEN}✅ Environment cleaned${NC}"
    echo -e "${YELLOW}💡 Run ./start-app.sh dev to rebuild and start${NC}"
}

wait_for_services() {
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        sleep 2
        
        if curl -s -f "http://localhost:8000/api/v1/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
            break
        else
            echo -e "${YELLOW}⏳ Waiting for backend... (attempt $attempt/$max_attempts)${NC}"
        fi
        
        if [ $attempt -ge $max_attempts ]; then
            echo -e "${YELLOW}⚠️  Backend health check timeout. Services might still be starting...${NC}"
            break
        fi
    done
}

# Make script executable
chmod +x "$0"

# Main script logic
case "${1:-dev}" in
    "help"|"--help"|"-h")
        show_help
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        clean_environment
        ;;
    "prod"|"production")
        start_production
        wait_for_services
        ;;
    "dev"|"development"|"")
        start_development
        wait_for_services
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac