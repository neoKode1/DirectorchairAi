#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "refactor: extract chat-model-data.tsx from simple-chat-interface

Extract 148-line MODEL_GROUPS constant, CompanyIcon component, and
renderModelGroups helper into dedicated chat-model-data.tsx module.
simple-chat-interface.tsx: 1748 → 1610 lines (-138).

Single source of truth for model dropdown data, importable by any
component that needs model listings." > /tmp/gc.txt 2>&1
git push origin main >> /tmp/gc.txt 2>&1
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
echo "DONE" >> /tmp/gc.txt
