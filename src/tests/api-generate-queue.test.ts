/**
 * Integration tests for queued /api/generate endpoints.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}));

const mockQueueSubmit = vi.fn();
const mockQueueStatus = vi.fn();
const mockQueueResult = vi.fn();

vi.mock('@fal-ai/client', () => ({
  createFalClient: () => ({
    queue: {
      submit: mockQueueSubmit,
      status: mockQueueStatus,
      result: mockQueueResult,
    },
  }),
}));

const submitRoute = await import('@/app/api/generate/submit/route');
const statusRoute = await import('@/app/api/generate/status/route');

function postRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/generate/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getStatusRequest(model: string, requestId: string): NextRequest {
  const url = `http://localhost:3000/api/generate/status?model=${encodeURIComponent(model)}&requestId=${encodeURIComponent(requestId)}`;
  return new NextRequest(url, { method: 'GET' });
}

describe('queued /api/generate endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FAL_KEY = 'test-fal-key';
  });

  it('submits a generation to Fal queue and returns immediately', async () => {
    mockQueueSubmit.mockResolvedValueOnce({ status: 'IN_QUEUE', request_id: 'queue-123' });

    const res = await submitRoute.POST(postRequest({
      model: 'fal-ai/imagen4/preview',
      prompt: 'A cinematic sunset',
      aspect_ratio: '16:9',
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.queued).toBe(true);
    expect(data.requestId).toBe('queue-123');
    expect(mockQueueSubmit).toHaveBeenCalledTimes(1);
    expect(mockQueueSubmit.mock.calls[0][0]).toBe('fal-ai/imagen4/preview');
    expect(mockQueueSubmit.mock.calls[0][1].input.prompt).toBe('A cinematic sunset');
  });

  it('uses the shared payload shaper for queued Hailuo 2.3 jobs', async () => {
    mockQueueSubmit.mockResolvedValueOnce({ status: 'IN_QUEUE', request_id: 'hailuo-q' });

    await submitRoute.POST(postRequest({
      model: 'fal-ai/minimax/hailuo-2.3/standard/image-to-video',
      prompt: 'animate this image',
      image_url: 'https://example.com/image.jpg',
      resolution: '720p',
    }));

    const input = mockQueueSubmit.mock.calls[0][1].input;
    expect(input.prompt_optimizer).toBe(true);
    expect(input.duration).toBe('6');
    expect(input).not.toHaveProperty('resolution');
  });

  it('returns pending queue status without requesting result', async () => {
    mockQueueStatus.mockResolvedValueOnce({ status: 'IN_PROGRESS' });

    const res = await statusRoute.GET(getStatusRequest('fal-ai/imagen4/preview', 'queue-123'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('IN_PROGRESS');
    expect(data.requestId).toBe('queue-123');
    expect(mockQueueResult).not.toHaveBeenCalled();
  });

  it('returns normalized media when queue status is completed', async () => {
    mockQueueStatus.mockResolvedValueOnce({ status: 'COMPLETED' });
    mockQueueResult.mockResolvedValueOnce({ data: { video: { url: 'https://fal.media/out.mp4' } } });

    const res = await statusRoute.GET(getStatusRequest('fal-ai/sora-2/image-to-video', 'queue-video'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('COMPLETED');
    expect(data.data.video.url).toBe('https://fal.media/out.mp4');
    expect(data.videos[0].url).toBe('https://fal.media/out.mp4');
    expect(mockQueueResult).toHaveBeenCalledWith('fal-ai/sora-2/image-to-video', { requestId: 'queue-video' });
  });
});
