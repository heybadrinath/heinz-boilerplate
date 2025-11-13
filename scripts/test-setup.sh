#!/bin/bash

# Test script to verify the setup is working
# This script runs a comprehensive test of the FastAPI backend

set -e

SKIP_E2E=false
for arg in "$@"; do
    case $arg in
        --skip-e2e)
        SKIP_E2E=true
        shift
        ;;
        *)
        ;;
    esac
done

echo "🧪 Testing FastAPI Backend Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

function print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

function print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

function print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

tests_passed=0
tests_failed=0

function test_step() {
    local name="$1"
    local test_command="$2"
    
    print_status "Testing: $name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$name ✓"
        ((tests_passed++))
    else
        print_error "$name ✗"
        ((tests_failed++))
    fi
    echo
}

# Generate random strings for testing
RANDOM_ID=$RANDOM
TEST_USERNAME="testuser_$RANDOM_ID"
TEST_EMAIL="test_${RANDOM_ID}@example.com"
TEST_PASSWORD="testpassword123"

# Test 1: Check if API is responding
test_step "API Health Check" "curl -f -s http://localhost:8000/api/v1/health | grep -q '\"status\":\"ok\"'"

# Test 2: Check API documentation
test_step "API Documentation" "curl -f -s http://localhost:8000/docs > /dev/null"

# Test 3: Test user registration
print_status "Testing: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$TEST_USERNAME\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q "\"username\""; then
    print_success "User Registration ✓"
    ((tests_passed++))
else
    print_error "User Registration ✗"
    ((tests_failed++))
fi
echo

# Test 4: Test user login
print_status "Testing: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$TEST_USERNAME\", \"password\": \"$TEST_PASSWORD\"}")

AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$AUTH_TOKEN" ]; then
    print_success "User Login ✓"
    ((tests_passed++))
else
    print_error "User Login ✗"
    ((tests_failed++))
fi
echo

# Test 5: Test authenticated endpoint
print_status "Testing: Authenticated Request"
ME_RESPONSE=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "http://localhost:8000/api/v1/me")

if echo "$ME_RESPONSE" | grep -q "$TEST_USERNAME"; then
    print_success "Authenticated Request ✓"
    ((tests_passed++))
else
    print_error "Authenticated Request ✗"
    ((tests_failed++))
fi
echo

# Test 6: Test Todo creation
print_status "Testing: Todo Creation"
TODO_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/todos" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Todo", "description": "This is a test todo", "priority": "high"}')

TODO_ID=$(echo "$TODO_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$TODO_ID" ]; then
    print_success "Todo Creation ✓"
    ((tests_passed++))
else
    print_error "Todo Creation ✗"
    ((tests_failed++))
fi
echo

# Test 7: Test Todo retrieval
test_step "Todo Retrieval" "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' 'http://localhost:8000/api/v1/todos' | grep -q '\"title\"'"

# Test 8: Test Todo update
if [ -n "$TODO_ID" ]; then
    print_status "Testing: Todo Update"
    UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:8000/api/v1/todos/$TODO_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"completed": true, "priority": "low"}')
    
    if echo "$UPDATE_RESPONSE" | grep -q '"completed":true'; then
        print_success "Todo Update ✓"
        ((tests_passed++))
    else
        print_error "Todo Update ✗"
        ((tests_failed++))
    fi
    echo
fi

# Test 9: Test Prometheus metrics
test_step "Prometheus Metrics" "curl -s http://localhost:8000/metrics | grep -q 'http_requests_total'"

# Test 10: Test Todo deletion
if [ -n "$TODO_ID" ]; then
    test_step "Todo Deletion" "curl -s -X DELETE -H 'Authorization: Bearer $AUTH_TOKEN' 'http://localhost:8000/api/v1/todos/$TODO_ID' | grep -q '\"success\":true'"
fi

# Optional: Run E2E tests if requested
if [ "$SKIP_E2E" = false ] && [ -f "tests/e2e/package.json" ]; then
    print_status "Testing: E2E Tests"
    
    cd tests/e2e
    if [ ! -d "node_modules" ]; then
        print_status "Installing E2E test dependencies..."
        npm install > /dev/null 2>&1
        npm run install > /dev/null 2>&1
    fi
    
    export API_BASE_URL="http://localhost:8000"
    if npm test > /dev/null 2>&1; then
        print_success "E2E Tests ✓"
        ((tests_passed++))
    else
        print_error "E2E Tests ✗"
        ((tests_failed++))
    fi
    cd ../..
    echo
fi

# Results
echo
echo -e "${CYAN}==================================================${NC}"
echo -e "${CYAN}TEST RESULTS${NC}"
echo -e "${CYAN}==================================================${NC}"
echo

if [ $tests_failed -eq 0 ]; then
    print_success "🎉 All tests passed! ($tests_passed/$((tests_passed + tests_failed)))"
    echo
    echo -e "${GREEN}Your FastAPI backend is working correctly!${NC}"
    echo
    echo -e "${CYAN}Available endpoints:${NC}"
    echo -e "${NC}• API: http://localhost:8000${NC}"
    echo -e "${NC}• Docs: http://localhost:8000/docs${NC}"
    echo -e "${NC}• Health: http://localhost:8000/api/v1/health${NC}"
    echo -e "${NC}• Metrics: http://localhost:8000/metrics${NC}"
    
    if docker ps > /dev/null 2>&1; then
        echo
        echo -e "${CYAN}If using Docker, also check:${NC}"
        echo -e "${NC}• Grafana: http://localhost:3001 (admin/admin)${NC}"
        echo -e "${NC}• Prometheus: http://localhost:9090${NC}"
        echo -e "${NC}• Jaeger: http://localhost:16686${NC}"
    fi
    
else
    print_error "❌ $tests_failed test(s) failed, $tests_passed passed"
    echo
    echo -e "${YELLOW}Common solutions:${NC}"
    echo -e "${NC}1. Make sure the backend is running: uvicorn app.main:app --reload${NC}"
    echo -e "${NC}2. Check the server logs for errors${NC}"
    echo -e "${NC}3. Verify the database is accessible${NC}"
    echo -e "${NC}4. See TROUBLESHOOTING.md for detailed help${NC}"
    exit 1
fi

echo