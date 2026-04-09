/**
 * Integration tests for /api/script-maker/analyze route.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}));

// Mock Claude API
const mockIsAPIAvailable = vi.fn().mockReturnValue(true);
vi.mock('@/lib/claude-api', () => ({
  claudeAPI: {
    isAPIAvailable: mockIsAPIAvailable,
  },
}));

// Mock Anthropic SDK
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
    constructor() {}
  },
}));

const { POST } = await import('@/app/api/script-maker/analyze/route');

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/script-maker/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/script-maker/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAPIAvailable.mockReturnValue(true);
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
  });

  it('returns 503 when Claude API is unavailable', async () => {
    mockIsAPIAvailable.mockReturnValue(false);
    const req = createRequest({
      movieTitle: 'Test Movie',
      plot: 'A hero saves the world',
      analysisType: 'plot-formalization',
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(503);
    expect(data.error).toContain('Claude API');
  });

  it('returns 400 for invalid analysis type', async () => {
    const req = createRequest({
      movieTitle: 'Test',
      analysisType: 'invalid-type',
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('Invalid analysis type');
  });

  it('returns plot formalization result', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'A compelling story about a hero...' }],
    });

    const req = createRequest({
      movieTitle: 'Hero Story',
      plot: 'A hero saves the world from destruction',
      genreIdea: 'action',
      eraSetting: 'modern',
      photoStyle: 'cinematic',
      minutesToExtract: 5,
      analysisType: 'plot-formalization',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.result).toContain('hero');
    expect(data.analysisType).toBe('plot-formalization');
  });

  it('returns parsed JSON for character generation', async () => {
    const characters = [{ name: 'John', age: 30, role: 'Protagonist' }];
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(characters) }],
    });

    const req = createRequest({
      movieTitle: 'Character Test',
      plot: 'An adventure story',
      genreIdea: 'adventure',
      eraSetting: 'medieval',
      photoStyle: 'fantasy',
      minutesToExtract: 10,
      analysisType: 'character-generation',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result[0].name).toBe('John');
  });

  it('handles Claude API errors gracefully', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API quota exceeded'));

    const req = createRequest({
      movieTitle: 'Test',
      plot: 'test',
      analysisType: 'plot-formalization',
      genreIdea: 'drama',
      eraSetting: 'modern',
      photoStyle: 'noir',
      minutesToExtract: 3,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});
