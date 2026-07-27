#!/bin/bash
# Build production site and push live branch (dist only) for Hostinger Git.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Building site…"
npm run build

echo "→ Publishing live branch (dist contents only, no videos)…"
WORK=$(mktemp -d)
rsync -a --exclude 'videos' dist/ "$WORK/"
cd "$WORK"
git init -q
git checkout -q -b live
git add -A
git commit -q -m "Live deploy: $(date '+%Y-%m-%d %H:%M')"
git remote add origin git@github.com:aicastingcom/george-felner-portfolio.git
git push -f origin live

cd "$OLDPWD"
git add -A
if ! git diff --staged --quiet; then
  git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')" || true
  git push origin main || true
fi

echo ""
echo "Done. Hostinger should pull branch: live (Directory: blank)"
