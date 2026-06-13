# Complete Lawn Service MS — Website Mockup (outdoor-services reference template)

**Lead:** Complete Lawn Service MS LLC · Lawn Care Service · Jackson, MS
**Score:** HOT (9) — outdated non-mobile site, no SSL, no contact form, socials inactive, 0 Google reviews, no ads
**Contact:** Michael Bowling · michael@completelawnservicems.com · (601) 497-8249
**Grounded facts used:** local lawn & landscape maintenance company serving the Jackson
Metro Area since 2009; greater Jackson + Ridgeland service area; 904 Euclid Ave, Jackson MS
39202; owner-run (Michael Bowling); services = mowing (push mowers for smaller/tight yards),
weed-eating around trees/flower beds/fences, edging where grass meets hard surfaces,
clean-up of all trimmings ("clean and manicured look"), landscape maintenance; active
Facebook page (facebook.com/completelawnservicems). No reviews/ratings/hours/licenses are
shown anywhere because none are verifiable — the "House Rules" section replaces
testimonials until real Google reviews exist.

## The concept — "Field-Built Organic Modernism"

A premium trade brand with the texture of the actual outdoors: bone paper, pine ink, and
**marking-paint orange** (the spray crews mark lawns with), survey/topographic motifs, film
grain, hand-drawn SVG accents. Type: Bricolage Grotesque (variable) display, Instrument
Serif italic accents, Spline Sans Mono survey labels — all self-hosted, zero external
requests. The magnolia line-mark is a Mississippi emblem, not a brand name.

2026 trends in play: kinetic variable-font type (hero letters gain weight near the cursor),
halftone "ghost" typography via background-clip:text (hero line 2, process numbers, footer
wordmark), scrollytelling with a measuring-tape progress rail, broken grids, grain + texture.

## What's in it

- **Intro wipe** — letter-cascade wordmark + paint-stroke line, once per session
- **Hero** — stacked kinetic headline (EVERY BLADE / EVERY EDGE halftone / *every season*
  serif with a hand-sprayed underline), rotating FREE QUOTES stamp, survey-stake eyebrow
- **Tilted services ticker**, pause on hover
- **Six field-tag service cards** — grounded service menu, stamped indexes, self-drawing
  icons, hand-drawn orange circle on hover (card 6 is an honest "Something else? Call" card)
- **The Proof** — hand-illustrated SVG before/after yard slider (kept vs. not), dragged by
  an orange survey stake; real `<input type="range">` underneath for a11y; a push mower
  parked mid-stripe on the "after" side
- **Process scrollytelling** — sticky halftone step number + serif word swap, measuring-tape
  rail fills with scroll (Walk → Quote → Cut → Wave)
- **Stats band** — grounded counters (2009 / 17 seasons / 100% local / 1 call)
- **House Rules** — tilted promise cards in place of testimonials (lead has 0 reviews)
- **Service-area survey map** — hand-drawn Jackson metro, Pearl River, dashed bounds,
  compass + scale bar; city list ↔ map pin hover sync
- **Quote section** — marking-paint orange, form with chip multi-select, rubber-stamp
  REQUEST RECEIVED success state (front-end demo only)
- **Footer** — giant halftone/solid wordmark, grass-blade silhouette rising into the orange
  section, drifting fireflies (Mississippi dusk), parked mower
- **Mobile** — sticky call bar (hides over form/footer), full-screen ink menu, touch slider

### Easter eggs
1. Click the **parked mower** in the footer — it drives across the screen leaving a stripe
2. Type `m` `o` `w` anywhere — same mower run
3. Open the **dev console** — a note from the crew

Accessibility: `prefers-reduced-motion` honored everywhere (intro skipped, reveals static,
marquee wraps), skip link, semantic landmarks, keyboard-driggable comparison slider,
focus-visible rings, JSON-LD LocalBusiness schema.

## Files

```
public/             deploy this folder (index.html + css/ + js/ + assets/fonts/ + favicon + og.png)
wrangler.jsonc      Cloudflare Workers static assets ("name" = complete-lawn-service-ms)
```

No build step — plain static. `npm run dev -- complete-lawn-service-ms` from the repo root.

## HANDOFF — remaining work for the next agent

The site was ported from an earlier standalone branch and re-grounded onto this lead's real
facts. Code + copy are complete; the following still needs doing:

1. **Regenerate `public/og.png`** — it still shows the old placeholder brand ("Magnolia
   Grounds Co."). Recreate at 1200×630 in the site's design language with the headline
   "EVERY BLADE. / EVERY season." + "COMPLETE LAWN SERVICE MS — JACKSON, MS" (ink bg, topo
   lines, halftone first line, orange grass-blade strip at the bottom, self-hosted fonts).
   Easiest path: build a small HTML card in `public/`, screenshot at 1200×630 with
   Playwright against `npm run dev -- complete-lawn-service-ms`, save, delete the card.
2. **Screenshot verification pass** (desktop 1440 / tablet 834 / mobile 390): confirm the
   halftone "EVERY EDGE." hero line, the two NEW service icons (string trimmer on card 02,
   edger on card 03 — hand-drawn this round, never rendered yet), the push mower added to
   the after-side of the B/A illustration (replaces an old sprinkler), the House Rules
   cards, footer wordmark "COMPLETE / LAWN SERVICE", and the stats band (2009 counter
   starts at 1992 via `data-from`). Fix any geometry that looks off.
3. **Functional re-test**: mobile menu open/close, call bar show/hide (hidden over
   quote/footer), B/A drag, form success stamp, mower egg, reduced-motion.
4. **Update the Archetypes table** in the root `README.md` — row is added; verify wording
   and flip status if anything changes.
5. **Deploy** once verified: `npm run deploy -- complete-lawn-service-ms` (needs
   `npx wrangler login`), then smoke-test the `*.workers.dev` URL.
6. **Branch hygiene**: two superseded branches hold the pre-port standalone version
   (`outdoor-services-template-v1`, `claude/exciting-newton-tutdn4` — Vite-based, fictional
   "Magnolia Grounds Co." brand, invented reviews/stats that violate the facts-only rule).
   Delete them after confirming this branch (`template/outdoor-services`) has everything.
7. Optional polish ideas, in keeping with the concept: orange highlight for the two *named*
   service cities (Jackson, Ridgeland) on the map; `_headers` file with long-cache for
   `/assets/fonts/*`.
