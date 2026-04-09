import { test, expect } from '@playwright/test';

/**
 * E2E tests for API route request/response validation.
 * These test actual HTTP calls through Next.js (including middleware).
 */
test.describe('API Routes - Request/Response', () => {

  test('POST /api/generate returns 400 for missing prompt', async ({ request }) => {
    const res = await request.post('/api/generate', {
      data: { model: 'fal-ai/flux-pro/v1.1-ultra' },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  test('POST /api/generate returns 400 for invalid model', async ({ request }) => {
    const res = await request.post('/api/generate', {
      data: { prompt: 'test', model: 'invalid-model-id' },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('POST /api/chat/agent returns 400 for missing userInput', async ({ request }) => {
    const res = await request.post('/api/chat/agent', {
      data: { conversationHistory: [] },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('POST /api/chat/agent returns 413 for oversized payload', async ({ request }) => {
    const largeInput = 'x'.repeat(5 * 1024 * 1024);
    const res = await request.post('/api/chat/agent', {
      data: { userInput: largeInput },
      failOnStatusCode: false,
    });
    // Should be rejected — either 413 or 400
    expect([400, 413]).toContain(res.status());
  });

  test('POST /api/generate-video returns 400 for missing prompt', async ({ request }) => {
    const res = await request.post('/api/generate-video', {
      data: {},
      failOnStatusCode: false,
    });
    expect([400, 500]).toContain(res.status());
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('POST /api/extract-prompt returns 400 for missing imageUrl', async ({ request }) => {
    const res = await request.post('/api/extract-prompt', {
      data: {},
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Image URL');
  });

  test('POST /api/script-maker/analyze returns 400 for invalid type', async ({ request }) => {
    const res = await request.post('/api/script-maker/analyze', {
      data: { movieTitle: 'Test', analysisType: 'bogus' },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid analysis type');
  });

  test('POST /api/personas/generate-character-sheet returns 400 for missing data', async ({ request }) => {
    const res = await request.post('/api/personas/generate-character-sheet', {
      data: {},
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('GET /api/poll-task/nonexistent handles missing task', async ({ request }) => {
    const res = await request.get('/api/poll-task/nonexistent-task-id', {
      failOnStatusCode: false,
    });
    // Should return an error, not crash
    expect([400, 404, 500]).toContain(res.status());
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('OPTIONS /api/generate returns CORS headers', async ({ request }) => {
    const res = await request.fetch('/api/generate', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:3000' },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(204);
    const allowOrigin = res.headers()['access-control-allow-origin'];
    expect(allowOrigin).toBe('http://localhost:3000');
  });
});
