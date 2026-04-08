#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "feat: P1 production readiness — health check, Sentry, tests

1. Health endpoint (/api/health):
   - Checks FAL, Anthropic, Upstash connectivity
   - Returns 200 healthy / 503 unhealthy with per-service latency
   - Public (no auth) for uptime monitoring tools

2. Sentry error tracking (@sentry/nextjs):
   - Client config: replay (1% sessions, 100% errors), browser tracing
   - Server config: 10% transaction sampling
   - Edge config for middleware
   - Global error boundary (global-error.tsx) captures + reports
   - Instrumentation hook for server/edge runtime init
   - Wired into next.config.mjs with source map upload
   - Tunnel route /monitoring to bypass ad-blockers

3. Integration tests (vitest):
   - api-generate.test.ts: 5 tests (missing params, success, error, requestId)
   - rate-limit.test.ts: 2 tests (unconfigured fail-open behavior)
   - env-validation.test.ts: 2 tests (dev mode warn, valid env)
   - All 9 tests passing, vitest config updated with @ alias" > /tmp/gc.txt 2>&1
git push origin main >> /tmp/gc.txt 2>&1
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
echo "DONE" >> /tmp/gc.txt
