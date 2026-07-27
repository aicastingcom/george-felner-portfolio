#!/bin/bash
# Local dev only — mirrors Hostinger public_html/videos/Animation/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$(cd "$ROOT/.." && pwd)/Assets"
DEST="$ROOT/public/videos/Animation"
mkdir -p "$DEST"
ln -sf "$ASSETS/Social Media/Animation/AAAD - animation.mp4" "$DEST/AAAD - animation.mp4"
ln -sf "$ASSETS/Corporate/Skittles - Animation.mp4" "$DEST/Skittles - Animation.mp4"
ln -sf "$ASSETS/Webseries/Money Talks Showreel.mp4" "$DEST/Money Talks Showreel.mp4"
ln -sf "$ASSETS/Webseries/Money Talks 01.mp4" "$DEST/Money Talks 01.mp4"
ln -sf "$ASSETS/Webseries/Money Talks - The Crypto Mountain.mp4" "$DEST/Money Talks - The Crypto Mountain.mp4"
echo "Linked Animation videos into $DEST"
