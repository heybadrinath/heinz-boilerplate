/**
 * End-to-End API Tests using Playwright
 * 
 * This script tests the basic API functionality:
 * - User registration and login
 * - Todo CRUD operations
 * - Authentication flow
 */

const { test, expect } = require('@playwright/test');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const API_V1 = `${BASE_URL}/api/v1`;

// Test data
const testUser = {
  username: 'e2e-test-user',
  email: 'e2e-test@example.com',
  password: 'e2e-test-password'
};

let authToken = '';
let todoId = '';

test.describe('FastAPI Backend E2E Tests', () => {
  
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
    
    expect(response.ok()).toBeTruthy();
    const metricsText = await response.text();
    expect(metricsText).toContain('http_requests_total');
    expect(metricsText).toContain('http_request_duration_seconds');
  });

  test('User registration should work', async ({ request }) => {
    const response = await request.post(`${API_V1}/register`, {
      data: testUser
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.username).toBe(testUser.username);
    expect(data.email).toBe(testUser.email);
    expect(data.id).toBeDefined();
  });

  test('User login should return tokens', async ({ request }) => {
    const response = await request.post(`${API_V1}/login`, {
      data: {
        username: testUser.username,
        password: testUser.password
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.access_token).toBeDefined();
    expect(data.refresh_token).toBeDefined();
    expect(data.token_type).toBe('bearer');
    
    // Store token for subsequent tests
    authToken = data.access_token;
  });

  test('Get current user info should work with token', async ({ request }) => {
    const response = await request.get(`${API_V1}/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.username).toBe(testUser.username);
    expect(data.email).toBe(testUser.email);
  });

  test('Create todo should work', async ({ request }) => {
    const todoData = {
      title: 'E2E Test Todo',
      description: 'This is a todo created during E2E testing',
      priority: 'high'
    };

    const response = await request.post(`${API_V1}/todos`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: todoData
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.title).toBe(todoData.title);
    expect(data.description).toBe(todoData.description);
    expect(data.priority).toBe(todoData.priority);
    expect(data.completed).toBe(false);
    expect(data.id).toBeDefined();
    
    // Store todo ID for subsequent tests
    todoId = data.id;
  });

  test('List todos should include created todo', async ({ request }) => {
    const response = await request.get(`${API_V1}/todos`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const todos = await response.json();
    expect(Array.isArray(todos)).toBeTruthy();
    expect(todos.length).toBeGreaterThan(0);
    
    const createdTodo = todos.find(todo => todo.id === todoId);
    expect(createdTodo).toBeDefined();
    expect(createdTodo.title).toBe('E2E Test Todo');
  });

  test('Get specific todo should work', async ({ request }) => {
    const response = await request.get(`${API_V1}/todos/${todoId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBe(todoId);
    expect(data.title).toBe('E2E Test Todo');
  });

  test('Update todo should work', async ({ request }) => {
    const updateData = {
      title: 'Updated E2E Test Todo',
      completed: true,
      priority: 'low'
    };

    const response = await request.put(`${API_V1}/todos/${todoId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: updateData
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.title).toBe(updateData.title);
    expect(data.completed).toBe(updateData.completed);
    expect(data.priority).toBe(updateData.priority);
  });

  test('Get todo stats should work', async ({ request }) => {
    const response = await request.get(`${API_V1}/todos/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.total).toBeDefined();
    expect(data.completed).toBeDefined();
    expect(data.pending).toBeDefined();
    expect(data.completion_rate).toBeDefined();
    expect(data.total).toBeGreaterThan(0);
  });

  test('Delete todo should work', async ({ request }) => {
    const response = await request.delete(`${API_V1}/todos/${todoId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Deleted todo should not be accessible', async ({ request }) => {
    const response = await request.get(`${API_V1}/todos/${todoId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(404);
  });

  test('Unauthorized request should fail', async ({ request }) => {
    const response = await request.get(`${API_V1}/todos`);
    
    expect(response.status()).toBe(401);
  });

  test('Invalid token should fail', async ({ request }) => {
    const response = await request.get(`${API_V1}/todos`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    expect(response.status()).toBe(401);
  });

});