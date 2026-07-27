#!/usr/bin/env python3
"""
Install AI-generated frames into public/sequences.
Post-process: letterbox 720x1080 on pure black, verify corners.
READ SEQUENCE_RULES.md before changing.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
GEN = Path("/Users/mano/.cursor/projects/Users-mano-Desktop-Website-Assets/assets")
OUT_W, OUT_H = 720, 1080


def fit_on_black(bgr: np.ndarray) -> np.ndarray:
    h, w = bgr.shape[:2]
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    ys, xs = np.where(g > 12)
    if len(xs) > 40:
        pad = 12
        y0 = max(0, int(ys.min()) - pad)
        y1 = min(h, int(ys.max()) + pad)
        x0 = max(0, int(xs.min()) - pad)
        x1 = min(w, int(xs.max()) + pad)
        bgr = bgr[y0:y1, x0:x1]
        h, w = bgr.shape[:2]

    scale = min(OUT_W / w, OUT_H / h) * 0.90
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = cv2.resize(bgr, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    canvas = np.zeros((OUT_H, OUT_W, 3), np.uint8)
    x = (OUT_W - nw) // 2
    y = max(0, OUT_H - nh - int(OUT_H * 0.04))
    canvas[y : y + nh, x : x + nw] = resized
    return canvas


def corner_black(bgr: np.ndarray) -> float:
    m = 12
    corners = np.vstack(
        [bgr[:m, :m].reshape(-1, 3), bgr[:m, -m:].reshape(-1, 3)]
    )
    return float(np.all(corners < 20, axis=1).mean())


def install_category(cat: str, pattern: str) -> bool:
    out_dir = ROOT / "public" / "sequences" / cat
    out_dir.mkdir(parents=True, exist_ok=True)
    ok = True
    for i in range(5):
        src = GEN / pattern.format(i=i)
        if not src.exists():
            print(f"  MISSING {src}")
            ok = False
            continue
        img = cv2.imread(str(src))
        if img is None:
            print(f"  BAD READ {src}")
            ok = False
            continue
        frame = fit_on_black(img)
        cb = corner_black(frame)
        dest = out_dir / f"frame-{i:02d}.jpg"
        cv2.imwrite(str(dest), frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
        print(f"  frame-{i:02d} corners_black={cb:.0%} -> {dest.name}")
        if cb < 0.9:
            ok = False
    return ok


def main() -> int:
  cats = sys.argv[1:] if len(sys.argv) > 1 else ["ai"]
  patterns = {
      "cinema": "gen-cinema-frame-{i:02d}.png",
      "advertising": "gen-advertising-frame-{i:02d}.png",
      "ai": "gen-ai-frame-{i:02d}.png",
      "corporate": "gen-corporate-frame-{i:02d}.png",
      "animation": "gen-animation-frame-{i:02d}.png",
      "social": "gen-social-frame-{i:02d}.png",
      "drone": "gen-drone-frame-{i:02d}.png",
      "webseries": "gen-webseries-frame-{i:02d}.png",
  }
  failed = False
  for cat in cats:
      pat = patterns.get(cat)
      if not pat:
          print(f"No pattern for {cat}")
          failed = True
          continue
      print(f"Installing {cat}...")
      if not install_category(cat, pat):
          failed = True
  return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
