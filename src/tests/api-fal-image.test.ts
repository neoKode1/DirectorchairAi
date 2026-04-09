/**
 * Integration tests for /api/fal/image route (FFmpeg frame extraction proxy).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock @fal-ai/client
const mockSubscribe = vi.fn();
vi.mock('@fal-ai/client', () => ({
  createFalClient: () => ({
    subscribe: mockSubscribe,
  }),
}));

const { POST } = await import('@/app/api/fal/image/route');

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/fal/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/fal/image (FFmpeg proxy)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when model is missing', async () => {
    const req = createRequest({ video_url: 'https://example.com/video.mp4' });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('Model parameter');
  });

  it('returns 400 when non-FFmpeg model is used', async () => {
    const req = createRequest({
      model: 'fal-ai/flux-pro/v1.1-ultra',
      video_url: 'https://example.com/video.mp4',
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('not supported');
    expect(data.error).toContain('/api/generate');
  });

  it('returns 400 when video_url is missing for FFmpeg', async () => {
    const req = createRequest({
      model: 'fal-ai/ffmpeg-api/extract-frame',
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('video_url is required');
  });

  it('returns extracted frame on success', async () => {
    mockSubscribe.mockResolvedValueOnce({
      data: { image: { url: 'https://fal.media/frame.jpg' } },
      requestId: 'ffmpeg-req-1',
    });

    const req = createRequest({
      model: 'fal-ai/ffmpeg-api/extract-frame',
      video_url: 'https://example.com/video.mp4',
      frame_type: 'last',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.image.url).toBe('https://fal.media/frame.jpg');
    expect(data.requestId).toBe('ffmpeg-req-1');
    expect(data.model).toContain('ffmpeg-api/extract-frame');
  });

  it('returns error when FAL call fails', async () => {
    mockSubscribe.mockRejectedValueOnce({
      status: 500,
      message: 'Internal server error',
      body: { detail: 'FFmpeg failed' },
    });

    const req = createRequest({
      model: 'fal-ai/ffmpeg-api/extract-frame',
      video_url: 'https://example.com/bad-video.mp4',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
  });

  it('accepts endpoint or endpointId as model alias', async () => {
    mockSubscribe.mockResolvedValueOnce({
      data: { image: { url: 'https://fal.media/frame.jpg' } },
      requestId: 'test-req',
    });

    const req = createRequest({
      endpointId: 'fal-ai/ffmpeg-api/extract-frame',
      video_url: 'https://example.com/video.mp4',
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
