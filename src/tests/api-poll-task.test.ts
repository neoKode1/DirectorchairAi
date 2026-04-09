/**
 * Integration tests for /api/poll-task/[taskId] route.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Spy on globalThis.fetch before importing the route
const mockFetch = vi.spyOn(globalThis, 'fetch');

const { GET } = await import('@/app/api/poll-task/[taskId]/route');

function createGetRequest(taskId: string): [NextRequest, { params: Promise<{ taskId: string }> }] {
  const req = new NextRequest(`http://localhost:3000/api/poll-task/${taskId}`);
  const params = { params: Promise.resolve({ taskId }) };
  return [req, params];
}

describe('/api/poll-task/[taskId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BYTEPLUS_API_KEY = 'test-byteplus-key';
    process.env.BYTEPLUS_BASE_URL = 'https://ark.test.bytepluses.com/api/v3';
  });

  it('returns 500 when BYTEPLUS_API_KEY is missing', async () => {
    delete process.env.BYTEPLUS_API_KEY;
    const [req, ctx] = createGetRequest('task-123');
    const res = await GET(req, ctx);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toContain('API key not configured');
  });

  it('returns task status when polling succeeds', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'running', progress: 50 }), { status: 200 })
    );

    const [req, ctx] = createGetRequest('task-abc-123');
    const res = await GET(req, ctx);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('running');
    expect(data.progress).toBe(50);
  });

  it('returns completed task with video URL', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({
        status: 'succeeded',
        result: { video_url: 'https://cdn.byteplus.com/output.mp4' },
      }), { status: 200 })
    );

    const [req, ctx] = createGetRequest('task-done-456');
    const res = await GET(req, ctx);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('succeeded');
    expect(data.result.video_url).toBe('https://cdn.byteplus.com/output.mp4');
  });

  it('returns error when BytePlus poll fails', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 })
    );

    const [req, ctx] = createGetRequest('nonexistent-task');
    const res = await GET(req, ctx);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it('calls correct BytePlus API URL', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'running' }), { status: 200 })
    );

    const [req, ctx] = createGetRequest('my-task-id');
    await GET(req, ctx);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/contents/generations/tasks/my-task-id');
  });
});
