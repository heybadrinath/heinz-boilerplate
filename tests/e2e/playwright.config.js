/**
 * Playwright configuration for E2E tests
 */

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  testMatch: '**/*test*.js',
  timeout: 30 * 1000, // 30 seconds
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'API Tests',
      use: {},
    },
  ],

  webServer: process.env.CI ? undefined : {
    command: 'docker-compose up -d',
    port: 8000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
});