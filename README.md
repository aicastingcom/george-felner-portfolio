# George Felner Portfolio

Scroll-driven portfolio for [georgefelner.com](https://georgefelner.com).

## Deploy (say "Deploy" in chat)

When you say **Deploy**, we run:

```bash
npm run deploy
```

That will:

1. Build the site
2. Push to GitHub **`live`** branch (built files only, no videos)
3. **Trigger Hostinger** via webhook (if configured)
4. **Verify** georgefelner.com shows the new build

### One-time Hostinger setup (required for automatic deploy)

| Field | Value |
|-------|-------|
| Repository | `https://github.com/aicastingcom/george-felner-portfolio.git` |
| Branch | **`live`** |
| Directory | **blank** (empty) |

Then enable **Auto Deployment**:

1. Hostinger hPanel → **Websites** → **georgefelner.com** → **Advanced** → **Git**
2. Click **⋯** on the repo → **Auto Deployment**
3. Copy the **Webhook URL**
4. Save it locally (not in Git):

```bash
cp scripts/.hostinger-webhook.example scripts/.hostinger-webhook
# paste your webhook URL into scripts/.hostinger-webhook
```

After that, **Deploy** = push + live site updates automatically.

**Videos** stay on the server at `public_html/videos/` (not in Git).

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
