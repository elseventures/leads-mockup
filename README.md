# Leads Mockup Factory

Website mockups for the **HOT leads** in `data/source/AK_Creative_Lead_List_Combined*.xlsx`,
built one industry at a time. Each mockup is a self-contained static site under `sites/`,
ready to deploy to **Cloudflare Pages** as its own project (its own `*.pages.dev` URL you
can send straight to the lead).

## Current mockups

| Lead | Industry | Folder | Status |
|---|---|---|---|
| Mid-State Construction (Jackson, MS) | Commercial Construction | `sites/midstate-construction/` | ✅ Ready to deploy |

**Construction industry — next candidates** (from the lead list, all HOT score 9):
Scott Builders & Development (residential), Tri County Homes (custom homes),
S Graves Construction & Roofing (no website at all — greenfield), Laws Construction (general contractor).

## Repo layout

```
data/source/          the lead list (xlsx)
sites/<lead>/
  public/             ← the deployable site (point Cloudflare at this)
  src/                HTML template (SVG art gets injected at build)
  tools/              art generator + build script
tools/shoot.mjs       Playwright visual-QA screenshots for any site
```

## Workflow

```bash
npm run build:midstate    # regenerate public/index.html from src + generated art
npm run shoot:midstate    # screenshot suite → shots/ (desktop, mobile, blueprint mode, 404)
npm run deploy:midstate   # deploy to Cloudflare Pages (needs wrangler auth, see below)
```

## Deploying to Cloudflare

Two ways — both free on Cloudflare Pages:

**A. Wrangler CLI (fastest)**
```bash
npx wrangler login                       # one-time browser auth
npm run deploy:midstate                  # → https://midstate-construction-mockup.pages.dev
```

**B. Dashboard Git integration (auto-deploys on push)**
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → pick this repo.
2. Build command: *(leave empty)* — the sites are pre-built static files.
3. Build output directory: `sites/midstate-construction/public`
4. Save & deploy. Add a custom domain later if the pitch lands.

Each future lead mockup gets its own Pages project the same way — just point the
output directory at its `public/` folder.

> Mockups ship with `<meta name="robots" content="noindex">` so demo URLs never
> pollute search results for the real businesses.

## Adding the next mockup

1. Copy the structure of `sites/midstate-construction/` (or start fresh — each site is standalone).
2. Pull the lead's facts from the xlsx (owner, phone, services, gaps) and any public info.
3. Design to the trade — the anti-slop rule: if the homepage would work for any other
   company, it isn't done.
