/**
 * Sentry client-side configuration.
 * This file configures the Sentry SDK for the browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring — sample 10% of transactions
  tracesSampleRate: 0.1,

  // Session replay — capture 1% of sessions, 100% of error sessions
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],

  // Don't send PII
  sendDefaultPii: false,

  // Ignore common non-actionable errors
  ignoreErrors: [
    'ResizeObserver loop',
    'Network request failed',
    'Load failed',
    'AbortError',
    'ChunkLoadError',
  ],
});
