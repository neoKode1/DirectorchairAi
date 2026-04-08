#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "refactor: replace console.log with structured pino logger in API routes

- generate/route.ts: 35 console calls → 35 pino calls (info/debug/warn/error)
- chat/agent/route.ts: 7 console calls → 7 pino calls
- All logs now include requestId, model, duration as structured fields
- Debug-level for model config, info for request lifecycle, error for failures
- Sensitive fields (auth, cookies, API keys) auto-redacted by pino config"
git push origin main
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
