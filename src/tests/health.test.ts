/**
 * Tests for the /api/health endpoint.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('/api/health', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns 200 with health status', async () => {
    // Set env vars for health check
    const saved = { ...process.env };
    process.env.FAL_KEY = 'test-fal-key-valid-format';
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-valid';

    const { GET } = await import('@/app/api/health/route');
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    // Status may be 'healthy' or 'degraded' depending on which services are configured
    expect(['healthy', 'degraded']).toContain(data.status);
    expect(data.services).toBeDefined();
    expect(data.services.fal).toBeDefined();
    expect(data.services.anthropic).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeGreaterThanOrEqual(0);

    process.env = saved;
  });

  it('returns services as unconfigured when env vars missing', async () => {
    const saved = { ...process.env };
    delete process.env.FAL_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const { GET } = await import('@/app/api/health/route');
    const res = await GET();
    const data = await res.json();

    expect(data.services.fal.status).toBe('unconfigured');
    expect(data.services.anthropic.status).toBe('unconfigured');

    process.env = saved;
  });

  it('includes version and uptime fields', async () => {
    const { GET } = await import('@/app/api/health/route');
    const res = await GET();
    const data = await res.json();

    expect(data.version).toBeDefined();
    expect(typeof data.uptime).toBe('number');
  });
});
