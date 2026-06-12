# Leads Mockup Sites

Website mockups for HOT leads from the AK Creative lead list (`data/source/`),
built one **industry archetype** at a time and deployed to Cloudflare.

## Structure

```
sites/
  <archetype>/            # one design template per industry archetype
    <lead-slug>/          # instantiated mockup for a specific lead
      wrangler.jsonc      # Cloudflare Workers config (static assets)
      public/             # the deployable site (vanilla HTML/CSS/JS)
      tools/build.mjs     # OPTIONAL — if present, regenerates public/ from src/
tools/
  site.mjs                # standardized build / dev / deploy CLI for every site
```

Every site is driven by the same three verbs (`build`, `dev`, `deploy`) via
`tools/site.mjs`, so the workflow is identical whether a site is plain static
HTML or has a generator step.

## Archetypes

| Archetype | Lead | Design concept | Status |
|---|---|---|---|
| `home-services` | Buford Plumbing Company, Jackson MS (lead score 9) | "The Copper Standard" — heritage trade-craft: cream paper / pine ink / copper-pipe accents, Fraunces + Libre Franklin + IBM Plex Mono, scroll-driven copper pipe that fills with water, pressure-gauge scroll indicator, work-order testimonial tickets, hand-drawn SVG metro map | Built ✔ |
| `construction` | Mid-State Construction, Jackson MS (lead score 9) | "The Working Drawing" — the whole site is art-directed as a set of construction documents: numbered sheets, drafting-paper palette, ink hairlines, safety-orange accents, self-drawing isometric buildings (30° geometry), pinned horizontal drawing-set scrub, rubber stamps with ink-bleed, CAD crosshair cursor. Has a generator step (`tools/build.mjs` + `tools/iso-art.mjs`). | Built ✔ |

Each archetype is designed to re-skin for the other HOT leads in its category —
swap the copy, service cards, map labels, and accent hue; the structure, motion,
and component system carry over. (home-services → electrical, HVAC, pest control,
roofing, lawn care…; construction → GCs, roofing, masonry, paving, concrete…)

### Easter eggs (home-services)

- Click the rubber duck in the footer waves — it squeaks (WebAudio, no assets).
  Five squeaks summon the flotilla.
- Type `leak` anywhere — it rains; check the console.
- The pressure gauge (bottom right) tracks scroll PSI; clicking it vents
  pressure and returns to top. It trembles at 100 PSI.

## Standardized workflow

All commands run from the repo root. `<slug>` is the lead folder name
(e.g. `buford-plumbing`). Run `npm run sites` to list them.

```sh
npm run sites                       # list every site

npm run build  -- <slug> [<slug>…]  # regenerate public/ (no-op for static sites)
npm run dev                         # interactive picker → run one or several at once
npm run dev    -- <slug> [<slug>…]  # local + LAN preview (phone-ready), :8741, :8742…
npm run deploy -- <slug> [<slug>…]  # build, then wrangler deploy to Cloudflare
```

### Pick what to run locally (one or many)

`npm run dev` with **no slug** prints a numbered menu of every site and waits for
a selection — type numbers (`1 3`), a range (`1-2`), names, or `all` (empty =
all). Each selected site runs in the **same process** on its own port starting at
`:8741` (`:8742`, `:8743`, …); one `Ctrl+C` stops them all. Pass slugs directly to
skip the menu: `npm run dev -- buford-plumbing midstate-construction`. Change the
base port with `--port 9000`.

Per-site shortcuts mirror the same verbs (add three lines to `package.json`
when you add a lead):

```sh
npm run dev:buford-plumbing
npm run build:buford-plumbing
npm run deploy:buford-plumbing
```

### Preview on your phone

`npm run dev` binds `0.0.0.0` and prints a **Network** URL. On a phone on the
same Wi-Fi, open that URL (e.g. `http://10.0.0.184:8741`). Change the port with
`-- <slug> --port 9000`. The dev server uses the same SPA fallback as
production (`not_found_handling: single-page-application`).

### Deploy (Cloudflare)

One-time: `npx wrangler login` (or export `CLOUDFLARE_API_TOKEN`). Then:

```sh
npm run deploy -- buford-plumbing   # → https://buford-plumbing.<account>.workers.dev
```

### Adding a new lead site

1. Create `sites/<archetype>/<slug>/` with a `public/` folder and a
   `wrangler.jsonc` (copy an existing one, change `name`).
2. Optionally add `tools/build.mjs` if it needs a generator step.
3. (Optional) Add `dev:<slug>` / `build:<slug>` / `deploy:<slug>` shortcuts to
   `package.json`. The generic `npm run dev -- <slug>` works immediately
   without any edits.
