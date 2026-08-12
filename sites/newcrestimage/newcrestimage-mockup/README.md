# NewcrestImage — Editorial concept

Ported as-is from [`ELSE-Ventures-LLC/newcrestimage-mockup`](https://github.com/ELSE-Ventures-LLC/newcrestimage-mockup):
an Index Ventures-style editorial rebuild of newcrestimage.com — warm
off-white canvas, serif display type with italic emphasis, a horizontal
portfolio image strip, and a thin red accent pulled from the NewcrestImage
wordmark. See `.lovable/plan.md` in this folder for the original design brief.

## Not a static site — this one is different from the rest of `sites/`

Every other site in this repo is vanilla HTML/CSS/JS with zero npm
dependencies, driven by `tools/site.mjs`. This one is a full
**TanStack Start SSR app** (React 19 + Vite + `@cloudflare/vite-plugin`,
deployed as a Cloudflare Worker, not static assets) — it came with its own
toolchain and wasn't rebuilt to fit the convention. It has its own
`package.json`, `bun.lock`, and `wrangler.jsonc`, and is deployed directly
rather than through `npm run dev`/`deploy -- <slug>`.

## Local preview

```sh
cd sites/newcrestimage/newcrestimage-mockup
bun install
bun run dev
```

## Deploy (Cloudflare Workers)

```sh
cd sites/newcrestimage/newcrestimage-mockup
bun install
bun run build          # vite build — generates dist/client + dist/server
npx wrangler deploy    # picks up dist/server/wrangler.json automatically
```

Live at: https://newcrestimage-mockup.elseventures.workers.dev

Note: the portfolio JPGs in `src/assets/portfolio/` are large (~1.5-2MB each,
un-optimized originals) — Cloudflare's asset-upload API intermittently drops
the connection on some of the bigger uploads. Re-running `wrangler deploy`
resumes cleanly since already-uploaded assets are skipped by hash; it may
take two or three attempts to fully converge.
