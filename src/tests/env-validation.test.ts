/**
 * Tests for environment variable validation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('env validation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('warns in development when required vars are missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Clear required vars
    const saved = { ...process.env };
    delete process.env.FAL_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    process.env.NODE_ENV = 'development';

    const { env } = await import('@/lib/env');

    // Should not throw in dev
    expect(env).toBeDefined();
    expect(env.NODE_ENV).toBe('development');

    // Restore
    process.env = saved;
    warnSpy.mockRestore();
  });

  it('returns validated env when all required vars present', async () => {
    const saved = { ...process.env };
    process.env.FAL_KEY = 'test-fal-key-12345';
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret-value';
    process.env.NODE_ENV = 'development';

    const { env } = await import('@/lib/env');

    expect(env.FAL_KEY).toBe('test-fal-key-12345');
    expect(env.ANTHROPIC_API_KEY).toBe('sk-ant-test-key');
    expect(env.NEXTAUTH_SECRET).toBe('test-secret-value');

    process.env = saved;
  });
});
