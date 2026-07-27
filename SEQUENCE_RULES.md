# George Felner — Sequence Build Rules

**Read this file at the start of every new version / rebuild.**

Source of truth: George's **character maps** (face + tool rotation worksheets) and `HANDOFF_BRIEF.md`.

---

## Rule 0 — verify before you speak (George's rule)

**ALWAYS check what you made before telling George it's ready.**

1. Open the **live site** in a browser (or headless screenshot) — not just files on disk.
2. Scroll through **every chapter** you changed.
3. Compare to the brief + maps + rules below.
4. If it is **not 100%** what was asked → **start again**. Do not ship partial work.
5. **Never** say "done", "ready", "fixed", or "all chapters pass" until you have **looked** and confirmed.

Partial completion (e.g. 1 of 8 chapters) is **not ready**. Say exactly what is done and what is not.

---

## Rules — never break

1. **Never make a face that isn't George's.**  
   Use his face reference (`FACE-*.png`) + real photos. Maps show his likeness — match them.

2. **Never use a background that isn't black.**  
   The site void is `#000`. Subject stands *in* the black space — not on white/grey studio paper, not a cutout halo, not a white rectangle pasted on black. If any white/grey studio remains behind George → redo until professional.

3. **Never ship fewer than 5 frames per category.**  
   Every chapter has exactly **5** scroll-scrubbed keys: `frame-00` … `frame-04` (0° → 15° → 30° → 60° → 90°).

4. **Never change rotation direction or ignore the map.**  
   Map panels define pose, grip, gaze, and turn direction. One-way turn only. If `profileSide` is **right**, end profile faces **left** (lens aiming left). If **left**, end profile faces **right**.

---

## Maps are GUIDES — not assets to paste

Character maps tell you:
- **Which way** George turns (one-way)
- **Exact angle** per frame (0°, 15°, 30°, 60°, 90°)
- **Tool grip** and where he looks
- **Clothes** for that chapter (white shirt, etc.)

**Do NOT** slice map panels and paste them on the site. That looks like 2010 cutout software.

**DO** use AI image generation to create premium cinematic frames on pure black, guided by:
1. `FACE-*.png` + George's real photos → **identity**
2. Map panel for that frame → **pose, rotation, grip, gaze**
3. Brief → **tool, profileSide, device**

---

## Map → category

| Category | Map file | Map turn | profileSide | End profile faces |
|----------|----------|----------|-------------|-------------------|
| cinema | `ChatGPT_Image_Jul_26__2026__01_47_19_PM-d190cd13-*.png` | turning right | right | left |
| advertising | `ChatGPT_Image_Jul_26__2026__07_51_27_PM-bdb7ca4d-*.png` | turning right | right | left |
| ai | `ChatGPT_Image_Jul_26__2026__09_45_10_PM-e2a933f7-*.png` | turning left | left | right |
| corporate | `ChatGPT_Image_Jul_26__2026__09_54_51_PM-bb701bab-*.png` | turning left | left | right |
| animation | `ChatGPT_Image_Jul_26__2026__09_41_52_PM-abc7c65f-*.png` | turning left → mirror for profile right | right | left |
| social | `ChatGPT_Image_Jul_26__2026__09_38_11_PM-8cbd011d-*.png` | turning right | right | left |
| drone | `char-map-drone.png` | turning left → mirror for profile left | left | right |
| webseries | `char-map-webseries.png` | turning left | left | right |

Face identity reference: `FACE-b78d12bb-*.png`

---

## Allowed pipeline

1. Read map panel for frame N → pose, angle, grip, gaze.
2. **AI-generate** photoreal frame: George's face + correct tool + correct rotation + **pure black `#000` void**.
3. Verify visually: face = George, black bg, no halos, matches map angle.
4. Letterbox to `720×1080` on pure black.
5. Install as `public/sequences/{category}/frame-0N.jpg`.

## Forbidden

- Pasting/slicing map worksheet panels onto the site
- White/grey studio backgrounds or cutout halos
- GrabCut / flood-fill matting on map slices
- Wrong rotation direction vs map
- Fewer than 5 frames
- Shipping without visually checking each frame
- Telling George something is ready without opening the live site
- Claiming "all chapters pass" when only some were rebuilt
