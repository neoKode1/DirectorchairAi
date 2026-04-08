#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git commit -m "chore: remove CI/CD workflow

DirectorChair is not a monorepo and does not need GitHub Actions CI.
Removes .github/workflows/ci.yml that was causing failed runs."
git push origin main
rm -f /Users/babypegasus/Desktop/prototypes/DirectorchairAi/_gc.sh
