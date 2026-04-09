/**
 * Structured JSON logger for server-side API routes.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *
 *   // Create a child logger with request context
 *   const log = logger.child({ requestId, model, route: '/api/generate' });
 *   log.info({ prompt: prompt.slice(0, 80) }, 'Generation started');
 *   log.error({ error: err.message, status: 422 }, 'FAL API failed');
 *
 * In development, outputs human-readable logs to stdout (no worker threads).
 * In production, outputs JSON for log aggregators (Datadog, CloudWatch, etc.).
 *
 * NOTE: Do NOT use pino `transport` option — it spawns worker threads that
 * crash inside Next.js webpack bundles (.next/server/vendor-chunks/) causing
 * "Error: the worker has exited" on every log call.
 */
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // No `transport` — writes directly to stdout (sync, no worker threads).
  // This avoids the "Cannot find module vendor-chunks/lib/worker.js" crash
  // that happens when pino tries to spawn workers inside Next.js bundles.

  // Base fields on every log line
  base: {
    service: 'directorchair-api',
    env: process.env.NODE_ENV || 'development',
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'image_url',
      'image_urls[*]',
      'apiKey',
    ],
    remove: false, // Replace with [Redacted] rather than deleting
  },

  // Customize serializers
  serializers: {
    err: pino.stdSerializers.err,
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a request-scoped logger with common context fields.
 */
export function createRequestLogger(opts: {
  requestId: string;
  route: string;
  model?: string;
  userIp?: string;
}) {
  return logger.child({
    requestId: opts.requestId,
    route: opts.route,
    model: opts.model,
    clientIp: opts.userIp,
  });
}
