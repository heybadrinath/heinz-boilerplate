# E2E Tests

Basic end-to-end tests for the FastAPI backend using Playwright.

## Setup

1. **Install Node.js** (if not already installed)
2. **Install dependencies**:
```bash
cd tests/e2e
npm install
npm run install  # Install Playwright browsers
```

## Running Tests

### Prerequisites
Ensure the backend is running:
```bash
# From repo root
docker-compose up -d
# Or
./scripts/bootstrap-backend.sh
```

### Run Tests
```bash
# Run all E2E tests
npm test

# Run with browser UI (for debugging)
npm run test:headed

# Debug mode (step through tests)
npm run test:debug
```

### Environment Configuration
Set the API base URL if different from default:
```bash
export API_BASE_URL=http://localhost:8000
npm test
```

## Test Coverage

The E2E tests cover:
- ✅ Health check endpoint
- ✅ Metrics endpoint

## Test Results

Test results are generated in multiple formats:
- HTML report: `test-results/playwright-report/index.html`
- JSON results: `test-results/results.json`
- JUnit XML: `test-results/results.xml`

## CI/CD Integration

The tests can be integrated into CI pipelines:

```yaml
# GitHub Actions example
- name: Run E2E Tests
  run: |
    cd tests/e2e
    npm install
    npm run install
    npm test
```

## Adding New Tests

Create new test files following the pattern:
```javascript
test.describe('Feature Name', () => {
  test('should do something', async ({ request }) => {
    const response = await request.get('/api/v1/endpoint');
    expect(response.ok()).toBeTruthy();
  });
});
```