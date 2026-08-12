# Leads Mockup Sites

Website concepts and lead mockups maintained by ELSE Ventures and deployed to
Cloudflare Workers. The repository contains several generations of sites: plain
static HTML, generated static sites, Vite React SPAs, and TanStack Start Workers.

`tools/sites.registry.mjs` is the source of truth for how each project is built,
previewed, and deployed. Do not infer a site's architecture from whether it has a
`public/` directory.

## Repository layout

```text
data/
  leads.json              Lead facts and archetype status
  source/                 Original lead spreadsheet
sites/
  <category>/<site>/      One independently designed mockup
tools/
  sites.registry.mjs      Explicit inventory and commands for all sites
  site.mjs                Unified build, preview, and deployment CLI
```

## Current inventory

| Category | Site | Type |
|---|---|---|
| adcamp | `adcamp-inc-first-design` | Generated Vite SPA snapshot |
| adcamp | `adcamp-webdesign-1` | Vite SPA |
| adcamp | `adcamp-webdesign-3-decent` | Vite SPA |
| agentconsulting | `agentconsulting` | Generated Vite SPA snapshot |
| brandoncomer | `editorial-authority` | Static |
| brandoncomer | `typographic-minimal` | Static |
| construction | `midstate-construction` | Generated static |
| home-services | `buford-plumbing` | Static |
| newcrestimage | `newcrestimage-2` | TanStack Start Worker |
| newcrestimage | `newcrestimage-mockup` | TanStack Start Worker |
| outdoor-services | `complete-lawn-service-ms` | Static |
| personal-brand | `maxlittlejohn` | Generated Vite SPA snapshot |
| restaurant | `new-orleans-grill` | Static |
| waste-management | `customcarting` | TanStack Start Worker |

Run `npm run sites` for the authoritative, registry-generated list.

The lead archetype reference sites tracked in `data/leads.json` are
`buford-plumbing`, `midstate-construction`, `complete-lawn-service-ms`, and
`new-orleans-grill`. The other directories are standalone concepts or design
alternatives and are intentionally kept in the same operational registry.

## Requirements

- Node.js 22.9 or newer
- npm 11.9 (declared in `package.json`)
- Bun 1.3.14 for TanStack projects
- Cloudflare credentials only when performing a real deployment

Install the pinned root tooling and each site's locked dependencies:

```sh
npm ci
npm run install:sites
```

Older Vite projects use npm lockfiles. TanStack projects use Bun lockfiles. Keep
one package-manager lock format per project and use the registry commands instead
of choosing an installer ad hoc.

## Standard workflow

```sh
npm run sites
npm run check
npm run build

npm run dev -- <slug> [<slug> ...]
npm run deploy:check -- <slug> [<slug> ...]
npm run deploy -- <slug> [<slug> ...]
```

- `dev` runs static sites with the contained local server and framework sites
  with their native dev command. With no slug in a terminal, it opens a picker.
- `deploy:check` builds and runs Wrangler's non-publishing dry run.
- `deploy` requires at least one explicit slug so a broad deployment cannot happen
  accidentally.
- Use `--port 9000` to select another preview base port. Multiple selected sites
  use consecutive ports.

The preview server binds to the local network for phone testing. Request paths are
decoded and checked against the selected site's output directory before files are
served.

## Mockup form behavior

Forms in this repository are presentation-only demos. They validate and preview a
confirmation state locally, but do not transmit, store, email, or otherwise retain
the entered information. Keep that limitation explicit in form copy and success
states. A real submission backend is outside this repository's scope.

## Adding a site

1. Create `sites/<category>/<slug>/` and document the design and grounded facts in
   that site's README.
2. Add an explicit entry to `tools/sites.registry.mjs`, including its type,
   deterministic install command, build command, output, dev mode, and deployment
   configuration.
3. Keep Cloudflare's `compatibility_date` current. Static sites should use a
   `wrangler.jsonc`; framework builds may generate the deployable config.
4. Run `npm run check`, build the new slug, and run its deployment dry run.
5. Update this inventory and `data/leads.json` when the project represents a lead
   archetype rather than a standalone concept.

## Design ground rules

- Use grounded lead facts; do not fabricate reviews, ratings, awards,
  certifications, dates, or business claims.
- Give each new archetype an independent visual system. A per-lead mockup may
  re-skin its own archetype's reference design without borrowing from unrelated
  categories.
- Preserve a clear source/build boundary. Generated output must be reproducible
  from committed source and a locked dependency graph.
- Optimize large images and keep essential branding/social assets under project
  control instead of depending on temporary editor-hosted URLs.

GitHub Actions installs dependencies from their lockfiles, validates the registry
and preview path handling, and builds the full inventory on pushes and pull
requests.
