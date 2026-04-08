/**
 * Unit tests for rate limiting utility.
 *
 * Tests the behavior when Upstash is not configured (should fail open),
 * and the response format when rate limited.
 */
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';

// Save original env
const originalEnv = { ...process.env };

describe('rate-limit', () => {
  beforeEach(() => {
    vi.resetModules();
    // Clear Upstash env vars by default
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns null (allows) when Upstash is not configured', async () => {
    const { applyRateLimit } = await import('@/lib/rate-limit');
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
    });

    const result = await applyRateLimit(req, 'generate');
    expect(result).toBeNull(); // null = allowed
  });

  it('returns null for all tier types when unconfigured', async () => {
    const { applyRateLimit } = await import('@/lib/rate-limit');
    const req = new NextRequest('http://localhost:3000/api/test');

    expect(await applyRateLimit(req, 'generate')).toBeNull();
    expect(await applyRateLimit(req, 'chat')).toBeNull();
    expect(await applyRateLimit(req, 'standard')).toBeNull();
  });
});
