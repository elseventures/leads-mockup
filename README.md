# Leads Mockup Sites

Website mockups for HOT leads from the AK Creative lead list (`data/source/`),
built one **industry archetype** at a time and deployed to Cloudflare.

## Structure

```
sites/
  <archetype>/            # an industry design system — the "template" layer
    <lead-slug>/          # one site. The flagship is the archetype's REFERENCE
      wrangler.jsonc      #   TEMPLATE; later leads are per-lead MOCKUPS that re-skin it
      public/             # the deployable site (vanilla HTML/CSS/JS, zero npm deps)
      tools/build.mjs     # OPTIONAL — if present, regenerates public/ from src/
tools/
  site.mjs                # standardized build / dev / deploy CLI for every site
data/
  leads.json              # parsed lead facts, grouped by archetype + per-lead status/branch
  source/                 # the original AK Creative lead list (.xlsx)
```

Every site is driven by the same three verbs (`build`, `dev`, `deploy`) via
`tools/site.mjs`, so the workflow is identical whether a site is plain static
HTML or has a generator step.

## How the work is split — templates vs. per-lead mockups

There are **two kinds of work** in this repo, and they follow different rules.
An agent is normally spun up to do **exactly one of them, on its own branch.**

1. **Industry template (archetype).** Invent the overarching design language for a
   whole industry — its concept, palette, type, motion, and component system. The
   first site built for an archetype becomes its **reference template**: the
   flagship lead's fully-built site that every later lead in that industry re-skins.
   _Today: `home-services` → `buford-plumbing`, `construction` → `midstate-construction`._

2. **Per-lead mockup.** Take an *existing* archetype's reference template and
   instantiate it for a *specific* lead — swap the copy, branding, accent hue,
   service list, and local details. You **inherit** the design system; you do **not**
   reinvent it.

### Ground rules (every agent gets these)

- **Structure & naming.** A site lives at `sites/<archetype>/<lead-slug>/` with a
  `public/` folder and a `wrangler.jsonc` whose `"name"` equals the `<lead-slug>`.
  Vanilla HTML/CSS/JS, **zero npm dependencies**. Optional `tools/build.mjs`
  generator (resolves paths from its own location, so it survives moves).
- **Deployment area.** Cloudflare Workers static assets. `npm run deploy -- <slug>`
  publishes to `https://<slug>.<account>.workers.dev`. Always keep
  `"not_found_handling": "single-page-application"` and a current
  `compatibility_date` in `wrangler.jsonc`.
- **Local preview.** `npm run dev -- <slug>` — see the CLI section below.
- **Facts only.** Pull your lead's *real* facts from `data/leads.json` (parsed,
  grouped by archetype; carries per-lead `status`/`siteSlug`/`branch` and a
  `branchKey` explaining what every branch is). It contains **no design direction**
  on purpose — that's yours to invent. Never fabricate reviews, ratings, awards,
  dates, certifications, or claims — list the grounded facts you used (see each
  site's `README.md` for the pattern).
- **One branch per piece of work, branched off `main`.** Name it
  `template/<archetype>` or `mockup/<lead-slug>`.
- **Quality bar & skills.** Distinctive, hand-crafted, a *named* design concept,
  real details, at least one easter egg — never generic "AI-slop" layout. Verify
  with screenshots. Lean on the relevant skills: **frontend-design** and
  **copywriting** for the design/copy, **cloudflare** / **wrangler** for deploy.

### Design isolation (this is the point)

So each industry — and each lead — feels genuinely its own rather than a recolor of
its neighbor, **do not let other designs leak into yours:**

- **Building a new archetype template:** do **not** open, read, or branch from any
  *other* archetype's files. Start from a blank page + the flagship lead's facts +
  the skills, and invent a fresh concept. The only shared inputs are these ground
  rules and the lead context.
- **Building a per-lead mockup:** open **only** your assigned archetype's reference
  template and your lead's facts. Do **not** browse other leads' mockups or other
  archetypes for "inspiration" — that is what homogenizes the output.
- **Always branch off `main`** (it carries the CLI + rules but no rival designs),
  **never off another design branch**, and don't merge sibling design work into
  yours. This keeps each agent's context clean by construction.

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
base port with `--port 9000`. Per-site shortcuts also exist
(`npm run dev:buford-plumbing`, `…:midstate-construction`).

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

## Recipes

### Start a new archetype template (Workflow 1)

You're designing a brand-new industry. **Read only the ground rules above and your
flagship lead's facts — not other archetypes.**

1. `git switch main && git switch -c template/<archetype>`.
2. Create `sites/<archetype>/<flagship-lead-slug>/` with a `public/` folder and a
   `wrangler.jsonc` (`"name"` = the slug; copy the asset block from an existing
   `wrangler.jsonc`, but **do not** copy another archetype's design).
3. Invent the concept and build it with the **frontend-design** + **copywriting**
   skills. Add a `README.md` to the site dir naming the concept and the grounded
   facts used. Add a generator under `tools/build.mjs` only if you need one.
4. `npm run dev -- <slug>`, refine, screenshot, then add a row to the Archetypes
   table here.

### Add a per-lead mockup (Workflow 2)

You're instantiating an *existing* archetype for another lead. **Open only that
archetype's reference template and your lead's facts.**

1. `git switch main && git switch -c mockup/<lead-slug>`.
2. Copy the archetype's reference template folder to a new
   `sites/<archetype>/<lead-slug>/`; set `wrangler.jsonc` `"name"` to the new slug.
3. Re-skin only: copy, branding, accent hue, service cards, map labels, local
   details. Keep the structure, motion, and component system intact.
4. `npm run dev -- <slug>`, refine against the lead's real facts, screenshot, deploy.

### Optional per-site shortcuts

Add `dev:<slug>` / `build:<slug>` / `deploy:<slug>` lines to `package.json` if you
want them — the generic `npm run dev -- <slug>` works immediately without any edits.
