/**
 * Integration tests for /api/extract-prompt route.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { POST } = await import('@/app/api/extract-prompt/route');

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/extract-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/extract-prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when imageUrl is missing', async () => {
    const req = createRequest({});
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('Image URL is required');
  });

  it('returns extracted prompt on success', async () => {
    const req = createRequest({ imageUrl: 'https://example.com/test-image.jpg' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.prompt).toBeDefined();
    expect(typeof data.prompt).toBe('string');
    expect(data.prompt.length).toBeGreaterThan(0);
  });

  it('returns methods breakdown', async () => {
    const req = createRequest({ imageUrl: 'https://example.com/image.png' });
    const res = await POST(req);
    const data = await res.json();

    expect(data.methods).toBeDefined();
    expect(data.methods.blip).toBeDefined();
    expect(data.methods.extraction).toBeDefined();
    expect(data.methods.cinematic).toBeDefined();
  });

  it('prompt includes cinematic terms', async () => {
    const req = createRequest({ imageUrl: 'https://example.com/photo.jpg' });
    const res = await POST(req);
    const data = await res.json();

    // The combined prompt should include cinematic quality markers
    expect(data.prompt).toContain('cinematic');
  });
});
