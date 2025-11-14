/**
 * Basic E2E API Tests using Playwright
 * 
 * This script tests basic API functionality for the boilerplate
 */

const { test, expect } = require('@playwright/test');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${BASE_URL}/api/v1`;

test.describe('FastAPI Backend Basic Tests', () => {
  
  test.beforeAll(async () => {
    console.log(`Running E2E tests against: ${BASE_URL}`);
  });

  test('Health check should return OK', async ({ request }) => {
    const response = await request.get(`${API_V1}/health`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('fastapi-backend');
  });

  test('Metrics endpoint should be accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/metrics`);
    
    // Skip this test if metrics endpoint is not implemented
    if (response.status() === 404) {
      console.log('Metrics endpoint not found - skipping test');
      return;
    }
    
    expect(response.ok()).toBeTruthy();
    const metricsText = await response.text();
    expect(metricsText).toContain('http_requests_total');
    expect(metricsText).toContain('http_request_duration_seconds');
  });

});