#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "refactor: trim 25 verbose debug logs from script-maker/page.tsx

script-maker/page.tsx: 2051 → 1938 lines (-113).
Removed character-matching debug dumps, JSON parse tracing,
model request/response verbose logging, and storyboard parse logs.
Kept all 17 console.error statements for real error tracking." > /tmp/gc.txt 2>&1
git push origin main >> /tmp/gc.txt 2>&1
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
echo "DONE" >> /tmp/gc.txt
