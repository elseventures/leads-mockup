# Leads Mockup

Personalized website mockups for HOT leads (Jackson, MS metro), used in sales outreach. Each mockup is a standalone static site that deploys directly to Cloudflare Pages — no build step.

> **Keep this repo private.** `data/leads.json` contains lead contact information.

## How It Works

1. **`templates/`** holds five industry archetype templates built with plain HTML + Tailwind (CDN). Templates use `{{TOKEN}}` placeholders for everything lead-specific.
2. **`data/leads.json`** holds the 53 HOT leads extracted from the source spreadsheet — contact info, template assignment, and branding (colors, tagline).
3. **`scripts/scaffold.js`** generates a personalized site in **`mockups/<slug>/`** by copying the lead's template and filling in the tokens.
4. Each `mockups/<slug>/` folder is hand-refined afterward (logo, photos, copy) and deployed to Cloudflare Pages.

```
templates/<archetype>/  --(scaffold + leads.json)-->  mockups/<slug>/  -->  Cloudflare Pages
```

## Folder Structure

```
data/
  leads.json            # 53 HOT leads: contact info, template assignment, branding
  source/               # original lead list spreadsheet
templates/
  home-services/        # plumbing, electrical, HVAC, pest control, appliance repair,
                        #   septic, locksmith, garage doors, security, cleaning, moving
  construction/         # builders, GCs, roofing, masonry, paving, foundation, fence,
                        #   flooring, windows/doors, drywall, painting, demo, gutters
  construction-v1/      # original construction starter, kept as version 1
                        #   (not assigned to leads; they use construction/)
  outdoor-services/     # lawn care, landscaping, irrigation, tree service,
                        #   pressure washing, pool service
  restaurant/           # restaurants, food truck, catering
  auto-services/        # auto repair, body shop, towing
mockups/
  <lead-slug>/          # generated, self-contained site (Cloudflare Pages root)
scripts/
  scaffold.js           # template -> mockup generator
```

## Usage

```bash
# List all leads and their assigned templates
node scripts/scaffold.js --list

# Scaffold one lead
node scripts/scaffold.js buford-plumbing-company

# Scaffold everything
node scripts/scaffold.js --all

# Regenerate (overwrites! hand edits in that mockup are lost)
node scripts/scaffold.js buford-plumbing-company --force
```

Existing mockup folders are **skipped** unless `--force` is passed, so hand-customized mockups are never silently overwritten.

### Preview locally

```bash
npx serve mockups          # browse all mockups at http://localhost:3000
# or
python3 -m http.server -d mockups/<slug> 8080
```

## Personalization Tokens

Templates may use these placeholders; the scaffold script fills them from `data/leads.json`:

| Token | Source |
|---|---|
| `{{BUSINESS_NAME}}` | businessName |
| `{{INDUSTRY}}` | industry |
| `{{CITY}}` | city |
| `{{PHONE}}` | phone, display format |
| `{{PHONE_TEL}}` | phone, digits only (for `tel:` links) |
| `{{EMAIL}}` | email (empty if unknown) |
| `{{OWNER}}` | owner/decision-maker |
| `{{TAGLINE}}` | branding.tagline (sensible default if empty) |
| `{{PRIMARY_COLOR}}` `{{SECONDARY_COLOR}}` `{{ACCENT_COLOR}}` | branding colors |
| `{{YEAR}}` | current year |

To change a lead's colors or tagline, edit its `branding` block in `data/leads.json` and re-run scaffold with `--force` (or hand-edit the mockup directly if it's already customized).

## Deploying a Mockup to Cloudflare Pages

Each mockup folder is a complete static site — the folder itself is the build output.

**CLI (wrangler):**

```bash
npx wrangler pages deploy mockups/<slug> --project-name <slug>
```

**Dashboard:** Cloudflare Dashboard → Workers & Pages → Create → Pages → *Upload assets*, then drag in the `mockups/<slug>` folder. No build command, no framework preset.

## Workflow for a New Mockup

1. Check the lead in `data/leads.json` (or `--list`); adjust `template`/`branding` if needed
2. `node scripts/scaffold.js <slug>`
3. Refine `mockups/<slug>/` by hand: logo into `assets/img/`, real photos, tailored copy
4. Deploy to Cloudflare Pages and share the preview URL in outreach
