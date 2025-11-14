/**
 * Health and Metrics E2E tests.
 */
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

function containsAny(haystack, needles) {
  return needles.some((n) => haystack.includes(n));
}

test.describe('Health and Metrics', () => {
  test('Health endpoint should return status ok and service name', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/v1/health`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: 'ok' });
    expect(typeof json.service).toBe('string');
    expect(json.service.length).toBeGreaterThan(0);
  });

  test('Metrics endpoint should expose Prometheus metrics', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/metrics`);
    if (res.status() === 404) {
      console.log('Metrics endpoint not enabled - skipping test');
      test.skip();
    }
    expect(res.status()).toBe(200);
    const text = await res.text();
    // Should be Prometheus text exposition format
    expect(text).toContain('# TYPE');
    // Be flexible about metric names; accept any of these common ones
    const ok = containsAny(text, [
      'http_request_duration_seconds',
      'http_requests_total',
      'process_cpu_seconds_total',
      'python_gc_objects_collected_total',
    ]);
    expect(ok).toBeTruthy();
  });
});
