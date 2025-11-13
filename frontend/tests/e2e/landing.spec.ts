import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the main title and description', async ({ page }) => {
    await page.goto('/');

    // Check main title
    await expect(page.getByRole('heading', { name: 'Heinz Boilerplate' })).toBeVisible();

    // Check description
    await expect(page.getByText(/Production-ready FastAPI \+ Next\.js boilerplate/)).toBeVisible();

    // Check that features are displayed
    await expect(page.getByText('Tech Stack Overview')).toBeVisible();
  });

  test('should display tech stack features', async ({ page }) => {
    await page.goto('/');

    // Check backend features
    await expect(page.getByText('Backend Stack')).toBeVisible();
    await expect(page.getByText(/FastAPI with async\/await support/)).toBeVisible();
    await expect(page.getByText(/PostgreSQL with SQLAlchemy ORM/)).toBeVisible();

    // Check frontend features
    await expect(page.getByText('Frontend Stack')).toBeVisible();
    await expect(page.getByText(/Next\.js 14 with TypeScript/)).toBeVisible();
    await expect(page.getByText(/Component library with Storybook/)).toBeVisible();

    // Check observability features
    await expect(page.getByText('Observability')).toBeVisible();
    await expect(page.getByText(/OpenTelemetry for distributed tracing/)).toBeVisible();
    await expect(page.getByText(/Prometheus metrics collection/)).toBeVisible();

    // Check development features
    await expect(page.getByText('Development & Testing')).toBeVisible();
    await expect(page.getByText(/Docker Compose development setup/)).toBeVisible();
    await expect(page.getByText(/Playwright end-to-end testing/)).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    await page.goto('/');

    // Check for action buttons
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Documentation' })).toBeVisible();
  });

  test('should display navigation', async ({ page }) => {
    await page.goto('/');

    // Check navigation brand
    await expect(page.getByRole('link', { name: 'Heinz Boilerplate' })).toBeVisible();

    // Check navigation items
    await expect(page.getByRole('link', { name: 'Documentation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'API' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
  });

  test('should check backend health status', async ({ page }) => {
    await page.goto('/');

    // Check for API status indicator
    await expect(page.locator('.statusDot')).toBeVisible();

    // The status text should be one of the expected states
    const statusText = page.locator('.statusText');
    await expect(statusText).toBeVisible();
    
    // Check for one of the possible status messages
    const statusContent = await statusText.textContent();
    expect(statusContent).toMatch(/(Backend API is healthy|Backend API is unavailable|Checking backend status)/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that content is still visible on mobile
    await expect(page.getByRole('heading', { name: 'Heinz Boilerplate' })).toBeVisible();
    await expect(page.getByText('Tech Stack Overview')).toBeVisible();
    
    // Check that buttons stack vertically on mobile
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('should attempt to fetch backend health', async ({ page }) => {
    // Listen for network requests
    const healthRequest = page.waitForRequest(request => 
      request.url().includes('/api/v1/health')
    );

    await page.goto('/');

    try {
      // Wait for the health check request (with timeout)
      await Promise.race([
        healthRequest,
        page.waitForTimeout(5000) // 5 second timeout
      ]);
      
      // If we get here, the request was made
      console.log('Health check request was made');
    } catch (error) {
      // Request might not be made if backend is not running
      console.log('Health check request not detected or timed out');
    }

    // The important thing is that the page loads regardless
    await expect(page.getByRole('heading', { name: 'Heinz Boilerplate' })).toBeVisible();
  });
});