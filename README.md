# leads-mockup

Industry-archetype website templates for the HOT leads in
`data/source/AK_Creative_Lead_List_Combined20260611.xlsx` (parsed copy in
`data/leads.json`). One flagship template per industry archetype; each is a
standalone static site that runs with Vite and deploys to Cloudflare Workers
static assets.

## Templates

| Template | Status | Covers (HOT leads) |
| --- | --- | --- |
| `templates/outdoor-services` | ✅ built | Complete Lawn Service, Holland Lawns, Busby's Landscaping, Williams Irrigation, Joe Jackson Tree Service, Big Bull Tree Service, Roc Auto Spa & Soft Washing, Proper Pool Service |

The outdoor-services demo brand is **Magnolia Grounds Co.** — a fictional
full-service grounds company in Jackson, MS, sized so its sections map onto
every lead in the archetype (lawn, landscape, tree, irrigation, pressure
washing, cleanups).

## Commands

```bash
npm install

npm run dev:outdoor-services      # dev server (Vite, http://localhost:5173)
npm run build:outdoor-services    # production build → templates/outdoor-services/dist
npm run preview:outdoor-services  # serve the production build locally
npm run deploy:outdoor-services   # build + deploy to Cloudflare (wrangler)
```

Deploying needs a one-time `npx wrangler login` (or `CLOUDFLARE_API_TOKEN`).
Worker name is set in `templates/outdoor-services/wrangler.jsonc`
(`outdoor-services-template`), so the site lands on
`outdoor-services-template.<account>.workers.dev` until a custom domain is
attached.

## Outdoor-services template notes

Design language: "field-built organic modernism" — bone paper, pine ink,
marking-paint orange (the spray paint crews mark lawns with), survey/topo
motifs, film grain. Type: Bricolage Grotesque (variable), Instrument Serif
italic accents, Spline Sans Mono labels — all self-hosted in
`public/fonts/`, no external requests.

Built-in moments worth showing a lead:

- Intro wipe + staggered kinetic hero; headline letters gain weight near the
  cursor (desktop)
- Halftone "ghost" typography (hero line 2, process numbers, footer wordmark)
- Hand-drawn SVG before/after yard slider — drag the orange stake
- Scrollytelling process section with a measuring-tape progress rail
- Survey-sketch service-area map synced to the city list on hover
- Demo quote form with rubber-stamp success state; sticky call bar on mobile
- Easter egg: click the parked mower in the footer (or type `m`-`o`-`w`);
  fireflies drift over the footer at dusk
- `prefers-reduced-motion` honored everywhere; semantic landmarks; the
  comparison slider is a real `<input type="range">`

Personalizing for a specific lead: swap the wordmark/brand strings in
`index.html` (name, phone, areas, license), adjust `--paint`/`--moss` tokens
in `assets/css/main.css`, and update `wrangler.jsonc` `name`. Form is
demo-only (no backend) — wire `#qform` to the client's intake before launch.

## Data

- `data/leads.json` — parsed leads with `template`, `leadScore`, pain points
- HOT outdoor-services leads are the eight scored 7–9 with
  `template: "outdoor-services"`
