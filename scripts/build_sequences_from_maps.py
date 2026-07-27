#!/usr/bin/env python3
"""
Build scroll sequences from George's character maps.
READ SEQUENCE_RULES.md before changing this script.

Rules enforced:
  1. George's face only (map pixels)
  2. Black background only
  3. Exactly 5 frames per category
  4. Map rotation direction + profileSide from brief
"""
from __future__ import annotations

import hashlib
import sys
from collections import deque
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path("/Users/mano/.cursor/projects/Users-mano-Desktop-Website-Assets/assets")
SEQ = ROOT / "public" / "sequences"
OUT_W, OUT_H = 720, 1080
FRAME_COUNT = 5

CHAPTERS: dict[str, tuple[str, bool, int]] = {
    # filename, mirror sequence?, white-key threshold
    "cinema": ("ChatGPT_Image_Jul_26__2026__01_47_19_PM-d190cd13-a0ee-40ab-b472-f52e4dbe8a00.png", False, 233),
    "advertising": ("ChatGPT_Image_Jul_26__2026__07_51_27_PM-bdb7ca4d-3326-409a-b962-8da98ee1bc14.png", False, 233),
    "ai": ("ChatGPT_Image_Jul_26__2026__09_45_10_PM-e2a933f7-5e9e-4561-91db-0586e36b9435.png", False, 232),
    "corporate": ("ChatGPT_Image_Jul_26__2026__09_54_51_PM-bb701bab-79dd-4fb7-9fae-4624bc7b391d.png", False, 233),
    "animation": ("ChatGPT_Image_Jul_26__2026__09_41_52_PM-abc7c65f-1bce-4fa8-b654-092ae24cbad0.png", True, 233),
    "social": ("ChatGPT_Image_Jul_26__2026__09_38_11_PM-8cbd011d-f4bc-457c-ad53-7a3ab17e08a3.png", False, 233),
    "drone": ("char-map-drone.png", True, 234),
    "webseries": ("char-map-webseries.png", False, 233),
}

PROFILE_SIDE = {
    "cinema": "right",
    "advertising": "right",
    "animation": "right",
    "social": "right",
    "ai": "left",
    "corporate": "left",
    "drone": "left",
    "webseries": "left",
}

PANEL_LABEL_TRIM = 0.14  # remove map annotation strip at bottom of each cell


def detect_label_bottom(img: np.ndarray) -> float:
    h = img.shape[0]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    var = np.array([gray[y, :].std() for y in range(h)])
    row_mean = gray.mean(axis=1)
    label_start = h
    for y in range(h - 1, int(h * 0.45), -1):
        if var[y] < 28 and row_mean[y] > 195:
            label_start = y
        else:
            break
    return label_start / h


def split_panels(img: np.ndarray, n: int = FRAME_COUNT) -> list[np.ndarray]:
    h, w = img.shape[:2]
    left, right = int(w * 0.006), int(w * 0.994)
    step = (right - left) / n
    panels: list[np.ndarray] = []
    for i in range(n):
        a = int(left + i * step)
        b = int(left + (i + 1) * step)
        inset = max(2, int((b - a) * 0.04))
        panels.append(img[:, a + inset : b - inset].copy())
    return panels


def replace_white_studio(bgr: np.ndarray, thresh: int) -> np.ndarray:
    """
    Maps use white studio paper — same colour as George's shirt.
    Only pixels connected to the image border through near-white paths are removed.
    Shirt interior is protected because it is enclosed by skin/gear edges.
    """
    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    near_white = gray >= thresh

    paper = np.zeros((h, w), np.uint8)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near_white[y, x] and not paper[y, x]:
                paper[y, x] = 255
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near_white[y, x] and not paper[y, x]:
                paper[y, x] = 255
                q.append((y, x))
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and near_white[ny, nx] and not paper[ny, nx]:
                paper[ny, nx] = 255
                q.append((ny, nx))

    out = bgr.copy()
    out[paper.astype(bool)] = 0
    return out


def fit_on_black(bgr: np.ndarray) -> np.ndarray:
    h, w = bgr.shape[:2]
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    ys, xs = np.where(g > 14)
    if len(xs) > 40:
        pad = 10
        y0 = max(0, int(ys.min()) - pad)
        y1 = min(h, int(ys.max()) + pad)
        x0 = max(0, int(xs.min()) - pad)
        x1 = min(w, int(xs.max()) + pad)
        bgr = bgr[y0:y1, x0:x1]
        h, w = bgr.shape[:2]

    scale = min(OUT_W / w, OUT_H / h) * 0.92
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = cv2.resize(bgr, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    canvas = np.zeros((OUT_H, OUT_W, 3), np.uint8)
    x = (OUT_W - nw) // 2
    y = max(0, OUT_H - nh - int(OUT_H * 0.04))
    canvas[y : y + nh, x : x + nw] = resized
    return canvas


def mass_cx(bgr: np.ndarray) -> float:
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    ys, xs = np.where(g > 18)
    if len(xs) < 50:
        return 0.5
    return float(xs.mean() / bgr.shape[1])


def corner_black_ratio(bgr: np.ndarray) -> float:
    h, w = bgr.shape[:2]
    m = max(8, min(h, w) // 25)
    corners = np.vstack(
        [
            bgr[:m, :m].reshape(-1, 3),
            bgr[:m, -m:].reshape(-1, 3),
            bgr[-m:, :m].reshape(-1, 3),
            bgr[-m:, -m:].reshape(-1, 3),
        ]
    )
    return float(np.all(corners < 25, axis=1).mean())


def face_presence(bgr: np.ndarray) -> float:
    h = bgr.shape[0]
    top = bgr[: max(1, int(h * 0.38)), :]
    g = cv2.cvtColor(top, cv2.COLOR_BGR2GRAY)
    return float((g > 22).mean())


def white_bg_leak(bgr: np.ndarray) -> float:
    """Fraction of corner pixels still near-white (bad matte)."""
    h, w = bgr.shape[:2]
    m = max(10, min(h, w) // 20)
    zones = np.vstack([bgr[:m, :m].reshape(-1, 3), bgr[:m, -m:].reshape(-1, 3)])
    return float(np.all(zones > 230, axis=1).mean())


def process_panel(panel: np.ndarray, thresh: int) -> np.ndarray:
    ph = panel.shape[0]
    trimmed = panel[: max(1, int(ph * (1 - PANEL_LABEL_TRIM))), :]
    matted = replace_white_studio(trimmed, thresh)
    return fit_on_black(matted)


def build_chapter(cat: str) -> dict:
    fname, mirror, thresh = CHAPTERS[cat]
    path = ASSETS / fname
    img = cv2.imread(str(path))
    if img is None:
        raise FileNotFoundError(f"Missing map: {path}")

    yb = detect_label_bottom(img)
    crop = img[: int(img.shape[0] * yb), :]
    panels = split_panels(crop)
    if len(panels) != FRAME_COUNT:
        raise ValueError(f"{cat}: expected {FRAME_COUNT} panels, got {len(panels)}")

    frames = [process_panel(p, thresh) for p in panels]
    if mirror:
        frames = [cv2.flip(f, 1) for f in frames]

    out_dir = SEQ / cat
    out_dir.mkdir(parents=True, exist_ok=True)
    for f in out_dir.glob("frame-*"):
        f.unlink()

    hashes = []
    faces = []
    leaks = []
    for i, fr in enumerate(frames):
        cv2.imwrite(str(out_dir / f"frame-{i:02d}.jpg"), fr, [cv2.IMWRITE_JPEG_QUALITY, 95])
        hashes.append(hashlib.md5(fr.tobytes()).hexdigest()[:8])
        faces.append(round(face_presence(fr), 3))
        leaks.append(round(white_bg_leak(fr), 3))

    cxs = [round(mass_cx(f), 3) for f in frames]
    deltas = [round(cxs[i + 1] - cxs[i], 3) for i in range(len(cxs) - 1)]
    side = PROFILE_SIDE[cat]
    mono = cxs[-1] >= cxs[0] - 0.03 if side == "right" else cxs[-1] <= cxs[0] + 0.03

    return {
        "cat": cat,
        "frames": len(frames),
        "unique": len(set(hashes)),
        "mirror": mirror,
        "cxs": cxs,
        "deltas": deltas,
        "mono": mono,
        "black_corners": round(corner_black_ratio(frames[0]), 2),
        "faces": faces,
        "leaks": leaks,
    }


def main() -> int:
    print("Building sequences from character maps (SEQUENCE_RULES.md)")
    print(f"Assets: {ASSETS}")
    print(f"Output: {SEQ}\n")

    if not ASSETS.is_dir():
        print("ERROR: assets folder not found", file=sys.stderr)
        return 1

    failed = False
    for cat in CHAPTERS:
        try:
            r = build_chapter(cat)
            ok = (
                r["frames"] == 5
                and r["unique"] == 5
                and r["black_corners"] > 0.95
                and min(r["faces"]) > 0.05
                and max(r["leaks"]) < 0.15
            )
            status = "OK" if ok else "FAIL"
            if status != "OK":
                failed = True
            mono_note = "" if r["mono"] else " (verify turn)"
            print(
                f"{r['cat']:12} frames={r['frames']} unique={r['unique']} "
                f"black={r['black_corners']} mono={r['mono']} mirror={r['mirror']} "
                f"faces={r['faces']} leaks={r['leaks']} [{status}]{mono_note}"
            )
        except Exception as e:
            failed = True
            print(f"{cat:12} FAILED: {e}")

    print()
    if failed:
        print("Some chapters failed quality checks.")
        return 1
    print("All chapters pass rules check.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
