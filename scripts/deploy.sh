#!/bin/bash
# Build production files and push to GitHub (Hostinger pulls from there).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Building site…"
npm run build

echo "→ Committing changes…"
git add -A
if git diff --staged --quiet; then
  echo "No changes to commit — pushing anyway."
else
  git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')"
fi

echo "→ Pushing to GitHub…"
git push origin main

echo ""
echo "Done. If georgefelner.com does not update within 2 minutes,"
echo "open Hostinger → Advanced → Git → Deploy."
