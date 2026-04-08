#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "refactor: extract chat-prompt-examples.ts from simple-chat-interface

Extract 155-line MODEL_PROMPT_EXAMPLES data object into dedicated module.
simple-chat-interface.tsx: 1610 → 1455 lines (-155).

Total decomposition so far: 293 lines extracted into 2 modules:
- chat-model-data.tsx (148 lines): model catalog + dropdown rendering
- chat-prompt-examples.ts (155 lines): per-model placeholder hints" > /tmp/gc.txt 2>&1
git push origin main >> /tmp/gc.txt 2>&1
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
echo "DONE" >> /tmp/gc.txt
