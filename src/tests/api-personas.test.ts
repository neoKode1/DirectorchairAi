/**
 * Integration tests for /api/personas/generate-character-sheet route.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}));

// Mock @fal-ai/client
const mockSubscribe = vi.fn();
const mockStorageUpload = vi.fn();
vi.mock('@fal-ai/client', () => ({
  createFalClient: () => ({
    subscribe: mockSubscribe,
    storage: { upload: mockStorageUpload },
  }),
}));

const { POST } = await import('@/app/api/personas/generate-character-sheet/route');

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/personas/generate-character-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/personas/generate-character-sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FAL_KEY = 'test-fal-key';
  });

  it('returns 400 when personaId is missing', async () => {
    const req = createRequest({ referenceImages: ['https://example.com/img.jpg'] });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('Missing persona');
  });

  it('returns 400 when referenceImages is empty', async () => {
    const req = createRequest({ personaId: 'p-1', referenceImages: [] });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('Missing persona');
  });

  it('returns 500 when FAL_KEY is missing', async () => {
    delete process.env.FAL_KEY;
    const req = createRequest({
      personaId: 'p-1',
      referenceImages: ['https://example.com/img.jpg'],
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toContain('FAL_KEY');
  });

  it('returns generated character sheet on success', async () => {
    // Mock storage upload for URL references (non-base64)
    mockStorageUpload.mockResolvedValue('https://fal.media/uploaded.jpg');

    mockSubscribe.mockResolvedValueOnce({
      requestId: 'cs-req-1',
      data: {
        images: [
          { url: 'https://fal.media/sheet1.png' },
          { url: 'https://fal.media/sheet2.png' },
        ],
      },
    });

    const req = createRequest({
      personaId: 'persona-123',
      referenceImages: ['https://example.com/photo1.jpg'],
      personaName: 'Samantha',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestId).toBe('cs-req-1');
    expect(data.images).toHaveLength(2);
    expect(data.model).toContain('nano-banana');
  });

  it('falls back to Seedream v4 on 422 error', async () => {
    // Primary fails with 422
    mockSubscribe.mockRejectedValueOnce({
      status: 422,
      body: { detail: [{ msg: 'could not generate' }] },
    });

    // Fallback succeeds
    mockSubscribe.mockResolvedValueOnce({
      requestId: 'fallback-req',
      data: {
        images: [{ url: 'https://fal.media/fallback.png' }],
      },
    });

    const req = createRequest({
      personaId: 'p-1',
      referenceImages: ['https://example.com/img.jpg'],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.model).toContain('seedream');
    expect(data.fallbackUsed).toBe(true);
  });

  it('returns error when both primary and fallback fail', async () => {
    mockSubscribe.mockRejectedValueOnce({
      status: 500,
      message: 'Server error',
    });

    const req = createRequest({
      personaId: 'p-1',
      referenceImages: ['https://example.com/img.jpg'],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain('Failed to generate');
  });
});
