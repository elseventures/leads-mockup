#!/usr/bin/env node
/**
 * Scaffold personalized mockup sites from industry templates.
 *
 * Usage:
 *   node scripts/scaffold.js <slug> [<slug> ...]   scaffold specific leads
 *   node scripts/scaffold.js --all                 scaffold every lead in data/leads.json
 *   node scripts/scaffold.js --list                list available slugs and their templates
 *   node scripts/scaffold.js <slug> --force        overwrite an existing mockup
 *
 * Copies templates/<lead.template>/ to mockups/<slug>/ and replaces {{TOKEN}}
 * placeholders in text files. Existing mockups are skipped unless --force is
 * given, so hand-customized mockups are never silently clobbered.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LEADS_FILE = path.join(ROOT, 'data', 'leads.json');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const MOCKUPS_DIR = path.join(ROOT, 'mockups');

const TEXT_EXTENSIONS = new Set(['.html', '.htm', '.css', '.js', '.json', '.txt', '.md', '.svg', '.xml']);

function buildTokens(lead) {
  const phone = lead.phone || '';
  return {
    BUSINESS_NAME: lead.businessName || '',
    INDUSTRY: lead.industry || '',
    CITY: lead.city || '',
    PHONE: phone,
    PHONE_TEL: phone.replace(/\D/g, ''),
    EMAIL: lead.email || '',
    OWNER: lead.owner || '',
    TAGLINE: (lead.branding && lead.branding.tagline) || `Proudly serving ${lead.city || 'our community'} and the surrounding area.`,
    PRIMARY_COLOR: (lead.branding && lead.branding.primaryColor) || '#1d4ed8',
    SECONDARY_COLOR: (lead.branding && lead.branding.secondaryColor) || '#0f172a',
    ACCENT_COLOR: (lead.branding && lead.branding.accentColor) || '#f59e0b',
    YEAR: String(new Date().getFullYear()),
  };
}

function replaceTokens(content, tokens) {
  return content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(tokens, name) ? tokens[name] : match
  );
}

function copyDir(src, dest, tokens) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, tokens);
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const content = fs.readFileSync(srcPath, 'utf8');
      fs.writeFileSync(destPath, replaceTokens(content, tokens));
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function scaffoldLead(lead, force) {
  const templateDir = path.join(TEMPLATES_DIR, lead.template);
  const destDir = path.join(MOCKUPS_DIR, lead.slug);

  if (!fs.existsSync(templateDir)) {
    console.error(`  ✗ ${lead.slug}: template "${lead.template}" not found in templates/`);
    return false;
  }
  if (fs.existsSync(destDir) && !force) {
    console.log(`  - ${lead.slug}: already exists, skipping (use --force to overwrite)`);
    return false;
  }

  copyDir(templateDir, destDir, buildTokens(lead));
  console.log(`  ✓ ${lead.slug}  (${lead.template})`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const all = args.includes('--all');
  const list = args.includes('--list');
  const slugs = args.filter((a) => !a.startsWith('--'));

  const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));

  if (list) {
    for (const lead of leads) {
      console.log(`${lead.slug.padEnd(40)} ${lead.template.padEnd(18)} ${lead.businessName}`);
    }
    return;
  }

  let targets;
  if (all) {
    targets = leads;
  } else if (slugs.length > 0) {
    targets = [];
    for (const slug of slugs) {
      const lead = leads.find((l) => l.slug === slug);
      if (!lead) {
        console.error(`Unknown slug: "${slug}" (run with --list to see available slugs)`);
        process.exitCode = 1;
        return;
      }
      targets.push(lead);
    }
  } else {
    console.log('Usage: node scripts/scaffold.js <slug> [...] | --all [--force] | --list');
    return;
  }

  console.log(`Scaffolding ${targets.length} mockup(s)...`);
  let created = 0;
  for (const lead of targets) {
    if (scaffoldLead(lead, force)) created++;
  }
  console.log(`Done. ${created} created, ${targets.length - created} skipped.`);
}

main();
