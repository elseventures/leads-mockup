# Leads Mockup Sites

Website mockups for HOT leads from the AK Creative lead list (`data/source/`),
built one **industry archetype** at a time and deployed to Cloudflare.

## Structure

```
sites/
  <archetype>/            # one design template per industry archetype
    <lead-slug>/          # instantiated mockup for a specific lead
      wrangler.jsonc      # Cloudflare Workers config (static assets)
      public/             # the deployable site (vanilla HTML/CSS/JS, no build step)
```

## Archetypes

| Archetype | Lead | Design concept | Status |
|---|---|---|---|
| `home-services` | Buford Plumbing Company, Jackson MS (lead score 9) | "The Copper Standard" — heritage trade-craft: cream paper / pine ink / copper-pipe accents, Fraunces + Libre Franklin + IBM Plex Mono, scroll-driven copper pipe that fills with water, pressure-gauge scroll indicator, work-order testimonial tickets, hand-drawn SVG metro map | Built ✔ |

The home-services template is designed to re-skin for the other home-services
HOT leads (electrical, HVAC, pest control, roofing, lawn care…): swap the copy,
service cards, map labels, and accent hue — the structure, motion, and
component system carry over.

### Easter eggs (home-services)

- Click the rubber duck in the footer waves — it squeaks (WebAudio, no assets).
  Five squeaks summon the flotilla.
- Type `leak` anywhere — it rains; check the console.
- The pressure gauge (bottom right) tracks scroll PSI; clicking it vents
  pressure and returns to top. It trembles at 100 PSI.

## Local preview

```sh
cd sites/home-services/buford-plumbing/public
python3 -m http.server 8741   # → http://localhost:8741
```

## Deploy (Cloudflare)

One-time: `npx wrangler login` (or export `CLOUDFLARE_API_TOKEN`).

```sh
cd sites/home-services/buford-plumbing
npx wrangler deploy           # → https://buford-plumbing.<account>.workers.dev
```
