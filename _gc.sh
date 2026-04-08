#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "feat: P2 production readiness — CI/CD, input validation, structured logging

1. CI/CD pipeline (.github/workflows/ci.yml):
   - Lint + type-check + vitest on every push/PR
   - Build step with stub env vars
   - Concurrency control (cancel in-progress)

2. Input validation (src/lib/input-validation.ts):
   - sanitizePrompt: trim, strip control chars, length limit
   - isValidModel: allowlist from model catalog
   - validateGenerateInput: model + prompt + image_urls validation
   - validateChatInput: message length + conversation size limits
   - Wired into /api/generate and /api/chat/agent

3. Structured logging (src/lib/logger.ts):
   - Pino-based JSON logger for production
   - Request-scoped child loggers with requestId, route, model
   - Sensitive field redaction (auth, cookies, API keys)
   - ISO timestamps, service metadata

4. Tests: 28 passing across 4 suites (up from 9)" > /tmp/gc.txt 2>&1
git push origin main >> /tmp/gc.txt 2>&1
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
echo "DONE" >> /tmp/gc.txt
