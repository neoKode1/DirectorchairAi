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
const mockQueueSubmit = vi.fn();
const mockStorageUpload = vi.fn();
vi.mock('@fal-ai/client', () => ({
  createFalClient: () => ({
    queue: { submit: mockQueueSubmit },
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

  it('queues a character sheet job and returns the requestId immediately', async () => {
    // Mock storage upload for URL references (non-base64)
    mockStorageUpload.mockResolvedValue('https://fal.media/uploaded.jpg');

    mockQueueSubmit.mockResolvedValueOnce({ request_id: 'cs-req-1' });

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
    expect(data.status).toBe('IN_QUEUE');
    expect(data.model).toContain('nano-banana');
    expect(data.fallbackUsed).toBe(false);
    // The route must NOT block on generation — only one submit call expected.
    expect(mockQueueSubmit).toHaveBeenCalledTimes(1);
    expect(mockQueueSubmit.mock.calls[0][0]).toBe('fal-ai/nano-banana-pro/edit');
  });

  it('queues with the Seedream fallback model when useFallback is true', async () => {
    mockStorageUpload.mockResolvedValue('https://fal.media/uploaded.jpg');
    mockQueueSubmit.mockResolvedValueOnce({ request_id: 'fallback-req' });

    const req = createRequest({
      personaId: 'p-1',
      referenceImages: ['https://example.com/img.jpg'],
      useFallback: true,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestId).toBe('fallback-req');
    expect(data.model).toContain('seedream');
    expect(data.fallbackUsed).toBe(true);
    expect(mockQueueSubmit.mock.calls[0][0]).toBe('fal-ai/bytedance/seedream/v4/edit');
  });

  it('flags 422 submit errors as recoverable so the client can retry with the fallback', async () => {
    mockStorageUpload.mockResolvedValue('https://fal.media/uploaded.jpg');
    mockQueueSubmit.mockRejectedValueOnce({
      status: 422,
      body: { detail: [{ msg: 'could not generate' }] },
    });

    const req = createRequest({
      personaId: 'p-1',
      referenceImages: ['https://example.com/img.jpg'],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.error).toContain('Failed to submit');
    expect(data.recoverable).toBe(true);
  });

  it('returns a non-recoverable error on 500 from fal queue', async () => {
    mockStorageUpload.mockResolvedValue('https://fal.media/uploaded.jpg');
    mockQueueSubmit.mockRejectedValueOnce({
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
    expect(data.error).toContain('Failed to submit');
    expect(data.recoverable).toBe(false);
  });
});
