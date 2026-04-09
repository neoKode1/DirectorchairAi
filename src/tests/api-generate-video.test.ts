/**
 * Integration tests for /api/generate-video route (BytePlus Seedance).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Spy on globalThis.fetch before importing the route
const mockFetch = vi.spyOn(globalThis, 'fetch');

const { POST } = await import('@/app/api/generate-video/route');

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/generate-video', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BYTEPLUS_API_KEY = 'test-byteplus-key';
    process.env.BYTEPLUS_BASE_URL = 'https://ark.test.bytepluses.com/api/v3';
  });

  it('returns 500 when BYTEPLUS_API_KEY is missing', async () => {
    delete process.env.BYTEPLUS_API_KEY;
    const req = createRequest({ prompt: 'A sunset video' });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error.message).toContain('API key not configured');
  });

  it('returns 400 when prompt is missing', async () => {
    const req = createRequest({});
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.message).toContain('Prompt is required');
  });

  it('returns 400 when prompt is empty string', async () => {
    const req = createRequest({ prompt: '   ' });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.message).toContain('Prompt is required');
  });

  it('returns task_id on successful task creation', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ task_id: 'task-abc-123' }), { status: 200 })
    );

    const req = createRequest({ prompt: 'A beautiful sunset over mountains' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.task_id).toBe('task-abc-123');
  });

  it('returns error when BytePlus API returns error', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Rate limited' }), { status: 429 })
    );

    const req = createRequest({ prompt: 'test video' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBeDefined();
  });

  it('returns 500 when no task_id returned from API', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    const req = createRequest({ prompt: 'test' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error.message).toContain('No task_id');
  });

  it('sends correct default parameters to BytePlus API', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ task_id: 'task-123' }), { status: 200 })
    );

    const req = createRequest({ prompt: 'test prompt' });
    await POST(req);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/contents/generations/tasks');
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.model).toBe('seedance-2-0');
    expect(body.content.text).toBe('test prompt');
    expect(body.parameters.duration).toBe(10);
    expect(body.parameters.resolution).toBe('1080p');
    expect(body.parameters.ratio).toBe('16:9');
  });
});
