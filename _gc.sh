#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "refactor: replace all console.log with pino in secondary API routes

- script-maker/analyze: 31 calls converted with proper pino format
- fal/proxy: rewrote to remove excessive debug logging (security risk)
- fal/image, extract-prompt, personas, upload-image, generate-video: all converted
- 0 console calls remaining in entire API layer
- All log calls use proper pino format: log.level({ data }, 'message')
- 28 tests passing, build clean"
git push origin main
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
