# George Felner Portfolio

Scroll-driven portfolio for [georgefelner.com](https://georgefelner.com).

## Live deploy (Hostinger)

Hostinger Git pulls this repo and serves the **`dist`** folder.

| Field | Value |
|-------|-------|
| Repository | `https://github.com/aicastingcom/george-felner-portfolio.git` |
| Branch | `main` |
| Directory | `dist` |

**Videos** are not in Git (too large). Upload them to Hostinger `public_html/videos/` with folders: `cinema`, `ai`, `advertising`, `corporate`, `social`, `webseries`, `Animation`.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Commit the updated `dist/` folder before deploying.
