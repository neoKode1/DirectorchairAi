#!/bin/bash
cd /Users/babypegasus/Desktop/prototypes/DirectorchairAi
git add -A
git status --short > /tmp/gitstatus.txt
git commit -m "refactor: delete dead files and trim utils" > /tmp/gitcommit.txt 2>&1
git push origin main > /tmp/gitpush.txt 2>&1
echo "done" > /tmp/gitdone.txt
