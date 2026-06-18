/**
 * Integration tests for /api/chat/agent route.
 * Tests the route handler directly, mocking Anthropic SDK.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}));

// Mock input validation — pass through
vi.mock('@/lib/input-validation', () => ({
  validateChatInput: vi.fn().mockReturnValue({ valid: true, sanitized: { prompt: '', model: '' } }),
}));

// Mock Anthropic SDK
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
      constructor() {}
    },
  };
});

// Mock agent tools
vi.mock('@/lib/agent-tools', () => ({
  AGENT_TOOLS: [],
}));

// Import after mocks
const { POST } = await import('@/app/api/chat/agent/route');

function createRequest(body: Record<string, unknown>, headers?: Record<string, string>): NextRequest {
  const h = new Headers({ 'Content-Type': 'application/json', ...headers });
  return new NextRequest('http://localhost:3000/api/chat/agent', {
    method: 'POST',
    headers: h,
    body: JSON.stringify(body),
  });
}

describe('/api/chat/agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
  });

  it('returns 400 when userInput is missing', async () => {
    const req = createRequest({ conversationHistory: [] });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('userInput');
  });

  it('returns 413 when request is too large', async () => {
    const req = createRequest(
      { userInput: 'test' },
      { 'content-length': String(5 * 1024 * 1024) },
    );
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(413);
    expect(data.error).toContain('too large');
  });

  it('returns 500 when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const req = createRequest({ userInput: 'Hello', conversationHistory: [] });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toContain('not configured');
  });

  it('returns text response from Claude on success', async () => {
    mockCreate.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'I am DirectorChairAI.' }],
    });

    const req = createRequest({
      userInput: 'Hello director',
      conversationHistory: [],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.response).toContain('DirectorChairAI');
    expect(data.actions).toEqual([]);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      model: 'claude-sonnet-4-5-20250929',
    }));
  });

  it('handles tool_use response for image generation', async () => {
    // First call returns tool_use
    mockCreate.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [
        { type: 'text', text: 'Generating an image for you.' },
        {
          type: 'tool_use',
          id: 'tool-1',
          name: 'generate_image',
          input: {
            model: 'fal-ai/imagen4/preview',
            prompt: 'A cinematic sunset',
            aspect_ratio: '16:9',
          },
        },
      ],
    });
    // Second call after tool results
    mockCreate.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Image queued!' }],
    });

    const req = createRequest({
      userInput: 'Create a sunset image',
      conversationHistory: [],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.actions).toHaveLength(1);
    expect(data.actions[0].type).toBe('generate');
    expect(data.actions[0].model).toBe('fal-ai/imagen4/preview');
  });

  it('handles Anthropic SDK errors gracefully', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Rate limit exceeded'));

    const req = createRequest({
      userInput: 'test',
      conversationHistory: [],
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Rate limit');
  });
});
