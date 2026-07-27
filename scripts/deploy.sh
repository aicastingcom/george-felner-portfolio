#!/bin/bash
# Build → push GitHub live branch → trigger Hostinger → verify georgefelner.com
set -euo pipefail
cd "$(dirname "$0")/.."

SITE_URL="${DEPLOY_SITE_URL:-https://georgefelner.com}"
WEBHOOK_FILE="$(dirname "$0")/.hostinger-webhook"

echo "→ Building site…"
npm run build

EXPECTED_JS=$(grep -oE 'index-[A-Za-z0-9_-]+\.js' dist/index.html | head -1)
EXPECTED_CSS=$(grep -oE 'index-[A-Za-z0-9_-]+\.css' dist/index.html | head -1)
echo "→ Build assets: ${EXPECTED_JS}, ${EXPECTED_CSS}"

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

trigger_hostinger() {
  if [[ -f "$WEBHOOK_FILE" ]]; then
    local url
    url=$(tr -d '[:space:]' < "$WEBHOOK_FILE")
    if [[ -n "$url" ]]; then
      echo "→ Triggering Hostinger deploy…"
      local status
      status=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$url" || echo "000")
      if [[ "$status" =~ ^(200|201|202|204)$ ]]; then
        echo "   Hostinger webhook OK ($status)"
        return 0
      fi
      echo "   Hostinger webhook returned HTTP $status"
      return 1
    fi
  fi
  echo "→ No Hostinger webhook at scripts/.hostinger-webhook"
  echo "   (One-time setup — see README Deploy section)"
  return 1
}

verify_live() {
  local html js css i
  for i in 1 2 3 4 5 6; do
    html=$(curl -sSL "$SITE_URL/" 2>/dev/null || true)
    js=$(grep -oE 'index-[A-Za-z0-9_-]+\.js' <<<"$html" | head -1 || true)
    css=$(grep -oE 'index-[A-Za-z0-9_-]+\.css' <<<"$html" | head -1 || true)
    if [[ "$js" == "$EXPECTED_JS" && "$css" == "$EXPECTED_CSS" ]]; then
      echo "✓ Live site updated: $SITE_URL ($js)"
      return 0
    fi
    if [[ $i -lt 6 ]]; then
      echo "   Waiting for Hostinger… ($i/6, live has ${js:-unknown})"
      sleep 15
    fi
  done
  echo "✗ Live site still on old build (expected $EXPECTED_JS, got ${js:-nothing})"
  return 1
}

trigger_hostinger || true
if verify_live; then
  echo ""
  echo "Done — georgefelner.com is live."
  exit 0
fi

echo ""
echo "GitHub is updated (branch: live) but Hostinger did not pull yet."
echo ""
echo "ONE-TIME FIX so future Deploy works automatically:"
echo "  1. Hostinger hPanel → Websites → georgefelner.com → Advanced → Git"
echo "  2. Click ⋯ → Auto Deployment"
echo "  3. Copy the Webhook URL"
echo "  4. Paste it into: portfolio/scripts/.hostinger-webhook"
echo "  5. Say Deploy again"
echo ""
echo "OR click Deploy once in Hostinger Git now, then hard-refresh the site."
exit 1
