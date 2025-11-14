/**
 * Minimal auth flow E2E tests. Assumes AUTH_ENABLED is true and DB is ready.
 */
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${BASE_URL}/api/v1`;

function randomUser() {
  const id = Math.random().toString(36).slice(2, 8);
  return {
    username: `user_${id}`,
    email: `user_${id}@example.com`,
    password: 'Password123!'
  };
}

test.describe('Auth happy path', () => {
  test('Register -> Login -> Me -> Refresh', async ({ request }) => {
    // If auth is disabled or DB unavailable, skip gracefully based on error codes
    const user = randomUser();

    // Register
    const r1 = await request.post(`${API_V1}/register`, { data: user });
    if (r1.status() === 404) {
      console.log('Auth not enabled - skipping test');
      test.skip();
    }
    expect([200, 201]).toContain(r1.status());
    const reg = await r1.json();
    expect(reg.username).toBe(user.username);
    expect(reg.email).toBe(user.email);

    // Login
    const r2 = await request.post(`${API_V1}/login`, { data: { username: user.username, password: user.password } });
    expect(r2.ok()).toBeTruthy();
    const tokens = await r2.json();
    expect(tokens.access_token).toBeTruthy();
    expect(tokens.refresh_token).toBeTruthy();

    // Me
    const r3 = await request.get(`${API_V1}/me`, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    expect(r3.ok()).toBeTruthy();
    const me = await r3.json();
    expect(me.username).toBe(user.username);

    // Refresh
    const r4 = await request.post(`${API_V1}/refresh`, { data: { refresh_token: tokens.refresh_token } });
    expect(r4.ok()).toBeTruthy();
    const newTokens = await r4.json();
    expect(newTokens.access_token).toBeTruthy();
  });
});
