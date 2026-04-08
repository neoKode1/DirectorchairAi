#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "refactor: complete logging migration + health tests

1. Server libs converted to pino:
   - claude-api.ts: 10 calls with proper { err } format
   - upload-handlers.ts: 7 calls with structured fields
   - film-director-data.ts: 4 calls consolidated to 2
   - rate-limit.ts: kept console.error for fail-open edge case

2. Client debug logs removed:
   - timeline/page.tsx: 14 debug logs removed
   - gallery-view.tsx: 11 debug logs removed
   - simple-chat-interface.tsx: 8 debug logs removed
   - content-storage.ts: 13 debug logs removed
   - 0 console.log remaining in entire codebase
   - 54 console.error kept in client catch blocks

3. Health endpoint tests (health.test.ts):
   - Tests service status response
   - Tests unconfigured services
   - Tests uptime/version fields
   - 31 total tests across 5 suites, all passing"
git push origin main
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
