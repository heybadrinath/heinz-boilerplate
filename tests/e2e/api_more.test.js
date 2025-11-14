/**
 * Additional E2E API tests to expand coverage.
 */
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${BASE_URL}/api/v1`;

// Utility to skip test if endpoint not found
async function skipIf404(response, message) {
  if (response.status() === 404) {
    console.log(`${message} - skipping test`);
    test.skip();
  }
}

test.describe('Additional Backend API Tests', () => {
  test('OpenAPI schema should be available in development', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/openapi.json`);
    if (response.status() === 404) {
      console.log('OpenAPI not available (likely not development) - skipping test');
      test.skip();
    }
    expect(response.ok()).toBeTruthy();
    const schema = await response.json();
    expect(schema.openapi).toBeDefined();
    expect(schema.paths).toBeDefined();
    // Check a known path
    expect(schema.paths['/api/v1/health']).toBeDefined();
  });

  test('Docs endpoint should respond when enabled', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/docs`);
    if (response.status() === 404) {
      console.log('Docs not enabled - skipping test');
      test.skip();
    }
    expect(response.status()).toBe(200);
    const text = await response.text();
    // Title may include project name; be lenient
    expect(text).toContain('Swagger UI');
    // And ensure the Swagger container is present
    expect(text).toContain('id="swagger-ui"');
  });

  test('Auth endpoints exist and validate input', async ({ request }) => {
    // Sending incomplete body should return 422 validation error
    const register = await request.post(`${API_V1}/register`, { data: {} });
    expect(register.status()).toBe(422);

    const login = await request.post(`${API_V1}/login`, { data: {} });
    expect(login.status()).toBe(422);

    const refresh = await request.post(`${API_V1}/refresh`, { data: {} });
    expect(refresh.status()).toBe(422);
  });

  test('Unknown route should return 404', async ({ request }) => {
    const response = await request.get(`${API_V1}/__unknown__`);
    expect(response.status()).toBe(404);
  });
});
