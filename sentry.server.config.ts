/**
 * Sentry server-side configuration.
 * This file configures the Sentry SDK for Node.js (API routes, SSR).
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring — sample 10% of server transactions
  tracesSampleRate: 0.1,

  // Don't send PII
  sendDefaultPii: false,
});
