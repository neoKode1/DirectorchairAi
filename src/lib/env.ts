/**
 * Server-side environment variable validation.
 * Import this at the top of any API route to fail fast on missing config.
 *
 * Usage: import { env } from '@/lib/env';
 */
import { z } from 'zod';

const serverEnvSchema = z.object({
  // ── Required: AI services ──
  FAL_KEY: z.string().min(1, 'FAL_KEY is required for image/video generation'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required for Claude chat'),

  // ── Required: Auth ──
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required for session security'),
  NEXTAUTH_URL: z.string().url().optional(), // Auto-detected in production

  // ── Optional: OAuth (required for Google sign-in) ──
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── Optional: Rate limiting ──
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().optional(),

  // ── Optional: Other services ──
  PLAYHT_USER_ID: z.string().optional(),
  PLAYHT_SECRET_KEY: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().optional(),
  BYTEPLUS_API_KEY: z.string().optional(),

  // ── Runtime ──
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validated environment variables.
 * Throws on first import if required vars are missing — prevents silent failures.
 *
 * In development, missing optional services log warnings instead of crashing.
 */
function validateEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const missing = Object.entries(errors)
      .map(([key, msgs]) => `  • ${key}: ${(msgs as string[]).join(', ')}`)
      .join('\n');

    // In development, warn but don't crash for required AI keys
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `⚠️  [env] Missing environment variables (dev mode — continuing with degraded features):\n${missing}`
      );
      // Return a partial parse, filling missing required fields with empty strings
      return serverEnvSchema.parse({
        ...process.env,
        FAL_KEY: process.env.FAL_KEY || 'MISSING',
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'MISSING',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-not-for-production',
      });
    }

    // In production, fail hard
    console.error(`❌ [env] Missing required environment variables:\n${missing}`);
    throw new Error(`Missing required environment variables:\n${missing}`);
  }

  return result.data;
}

export const env = validateEnv();
