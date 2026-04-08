/**
 * Integration tests for /api/generate route.
 *
 * Tests the route handler directly (no HTTP server needed).
 * Mocks the FAL client to avoid real API calls.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock rate limiting — always allow in tests
vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}));

// Mock @fal-ai/client
const mockSubscribe = vi.fn();
vi.mock('@fal-ai/client', () => ({
  createFalClient: () => ({
    subscribe: mockSubscribe,
  }),
}));

// Import after mocks are set up
const { POST } = await import('@/app/api/generate/route');

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when model is missing', async () => {
    const req = createRequest({ prompt: 'test' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Model');
  });

  it('returns 400 when prompt is missing', async () => {
    const req = createRequest({ model: 'fal-ai/imagen4/preview' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('returns generated image URL on success', async () => {
    mockSubscribe.mockResolvedValueOnce({
      data: { images: [{ url: 'https://fal.media/test.jpg' }] },
      requestId: 'req-123',
    });

    const req = createRequest({
      model: 'fal-ai/imagen4/preview',
      prompt: 'A beautiful sunset',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.images[0].url).toBe('https://fal.media/test.jpg');
    expect(data.requestId).toBe('req-123');
  });

  it('returns FAL error status on API failure', async () => {
    mockSubscribe.mockRejectedValueOnce({
      status: 422,
      message: 'Invalid parameters',
      body: { detail: 'unsupported aspect ratio' },
    });

    const req = createRequest({
      model: 'fal-ai/imagen4/preview',
      prompt: 'test',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.success).toBe(false);
    expect(data.error).toContain('FAL');
  });

  it('includes requestId in response', async () => {
    mockSubscribe.mockResolvedValueOnce({
      data: { images: [{ url: 'https://fal.media/test.jpg' }] },
      requestId: 'fal-req-abc',
    });

    const req = createRequest({
      model: 'fal-ai/flux-pro/v1.1-ultra',
      prompt: 'test prompt',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.requestId).toBeDefined();
  });
});
