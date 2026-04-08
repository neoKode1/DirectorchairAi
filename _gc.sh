#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "security: P0 hardening — auth, rate limiting, CORS, env validation

1. Auth middleware (middleware.ts):
   - Extended matcher to protect ALL API routes (/api/generate,
     /api/chat, /api/fal, /api/personas, /api/script-maker, etc.)
   - Dev mode still bypasses auth for local iteration
   - fal/proxy excluded (uses server-side FAL_KEY auth)

2. Rate limiting (lib/rate-limit.ts):
   - Upstash Redis sliding window rate limiter
   - 3 tiers: generate (30/min), chat (20/min), standard (60/min)
   - Applied to: /api/generate, /api/chat/agent, /api/script-maker/analyze,
     /api/personas/generate-character-sheet
   - Fails open if Upstash not configured (dev-friendly)
   - Returns 429 with Retry-After header

3. CORS hardening (api/generate/route.ts):
   - Removed Access-Control-Allow-Origin: * wildcard
   - Restrict to NEXTAUTH_URL + localhost origins only

4. Env validation (lib/env.ts):
   - Zod schema validates FAL_KEY, ANTHROPIC_API_KEY, NEXTAUTH_SECRET
   - Production: fails hard on missing required vars
   - Development: warns but continues with degraded features
   - Added ANTHROPIC_API_KEY to .env.example" > /tmp/gc.txt 2>&1
git push origin main >> /tmp/gc.txt 2>&1
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
echo "DONE" >> /tmp/gc.txt
