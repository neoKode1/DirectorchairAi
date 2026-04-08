#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "refactor: extract script-maker utilities and types

- Created script-maker-utils.ts (90 lines):
  - getModelFriendlyName() pure function
  - GENRE_OPTIONS, PHOTO_STYLE_OPTIONS constants
  - STORYBOARD_MODEL_OPTIONS, ERA_OPTIONS constants
  - downloadImage() utility function
  - FullscreenImageState, CharacterReferenceImage, StyleReferenceImage types
- page.tsx: replaced inline options with constants, inline types with imports
- Remaining page.tsx (1,928 lines) is tightly coupled state+handlers"
git push origin main
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
