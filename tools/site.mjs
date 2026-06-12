#!/usr/bin/env node
/**
 * site.mjs — one standardized CLI for every lead mockup.
 *
 * Convention: each site lives at  sites/<category>/<slug>/  and contains
 *   public/          the deployable static site (always)
 *   wrangler.jsonc   Cloudflare Workers static-assets config (for deploy)
 *   tools/build.mjs  optional — if present, `build` regenerates public/
 *
 * Commands:
 *   node tools/site.mjs list
 *   node tools/site.mjs build  [<slug> …]
 *   node tools/site.mjs dev    [<slug> …] [--port 8741]   # no slug → interactive picker
 *   node tools/site.mjs deploy [<slug> …]
 *
 * `dev` runs every selected site at once, each on its own port (8741, 8742, …),
 * in a single process. Ctrl+C stops them all.
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { readFile as readFileAsync } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createInterface } from 'node:readline';
import { spawnSync } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITES = join(REPO, 'sites');
const DEFAULT_PORT = 8741;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

/** Walk sites/<category>/<slug> and return every site that has a public/ dir. */
function discoverSites() {
  if (!existsSync(SITES)) return [];
  const out = [];
  for (const category of readdirSync(SITES)) {
    const catDir = join(SITES, category);
    if (!statSync(catDir).isDirectory()) continue;
    for (const slug of readdirSync(catDir)) {
      const dir = join(catDir, slug);
      if (!statSync(dir).isDirectory()) continue;
      if (!existsSync(join(dir, 'public'))) continue;
      out.push({
        slug,
        category,
        dir,
        public: join(dir, 'public'),
        hasBuild: existsSync(join(dir, 'tools', 'build.mjs')),
        hasWrangler:
          existsSync(join(dir, 'wrangler.jsonc')) ||
          existsSync(join(dir, 'wrangler.json')) ||
          existsSync(join(dir, 'wrangler.toml')),
      });
    }
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

function findSite(slug) {
  const sites = discoverSites();
  if (!slug) {
    if (sites.length === 1) return sites[0];
    fail(
      `Multiple sites — specify a slug.\n` +
        sites.map((s) => `  • ${s.slug}`).join('\n')
    );
  }
  const match = sites.find((s) => s.slug === slug);
  if (!match) {
    fail(
      `No site named "${slug}".\nKnown sites:\n` +
        sites.map((s) => `  • ${s.slug}`).join('\n')
    );
  }
  return match;
}

/** Resolve explicit slugs to sites; with none, fall back to the single-site rule. */
function sitesFromSlugs(slugs) {
  if (!slugs.length) return [findSite(undefined)];
  return slugs.map((s) => findSite(s));
}

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

function lanAddress() {
  for (const addrs of Object.values(networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return null;
}

function build(site) {
  if (!site.hasBuild) {
    console.log(`• ${site.slug}: static site, no build step — public/ is ready as-is.`);
    return;
  }
  console.log(`• ${site.slug}: building public/ from src/ …`);
  const r = spawnSync(process.execPath, [join('tools', 'build.mjs')], {
    cwd: site.dir,
    stdio: 'inherit',
  });
  if (r.status !== 0) fail(`build failed for ${site.slug}`);
}

/** Start one static server (with SPA fallback) for a site. Resolves to the server. */
function startServer(site, port) {
  build(site);
  const root = site.public;
  const indexPath = join(root, 'index.html');
  if (!existsSync(indexPath)) fail(`${site.slug}: ${indexPath} is missing.`);

  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' || p.endsWith('/')) p += 'index.html';
    let filePath = join(root, p);
    try {
      const buf = await readFileAsync(filePath);
      res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(buf);
    } catch {
      // SPA fallback — mirrors wrangler "not_found_handling": "single-page-application"
      try {
        const buf = await readFileAsync(indexPath);
        res.writeHead(200, { 'content-type': MIME['.html'] });
        res.end(buf);
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('404');
      }
    }
  });

  return new Promise((resolveServer, rejectServer) => {
    server.once('error', rejectServer);
    server.listen(port, '0.0.0.0', () => resolveServer(server));
  });
}

/** Run one or more sites concurrently, each on its own port starting at basePort. */
async function dev(sites, basePort) {
  const started = [];
  let port = basePort;
  for (const site of sites) {
    try {
      await startServer(site, port);
    } catch (e) {
      fail(`could not start ${site.slug} on port ${port}: ${e.message}` +
        (e.code === 'EADDRINUSE' ? `  (try --port <free-port>)` : ''));
    }
    started.push({ site, port });
    port++;
  }

  const lan = lanAddress();
  const label = started.length === 1 ? 'site' : 'sites';
  console.log(`\n  Serving ${started.length} ${label}:\n`);
  for (const { site, port } of started) {
    const local = `http://localhost:${port}`;
    const net = lan ? `http://${lan}:${port}` : '';
    console.log(`  ${site.slug.padEnd(24)} ${local.padEnd(26)} ${net}`);
  }
  if (lan) {
    console.log(`\n  Network URLs (right) open on a phone on the same Wi-Fi.`);
  }
  console.log(`\n  Ctrl+C to stop${started.length > 1 ? ' all' : ''}.\n`);
}

/** Interactive picker when `dev` is run with no slugs. Returns chosen sites. */
async function pickSites(sites) {
  console.log(`\n  Which site(s) do you want to run?\n`);
  sites.forEach((s, i) => {
    console.log(`  ${String(i + 1).padStart(2)}.  ${s.slug.padEnd(24)} ${s.category}`);
  });
  console.log(
    `\n  Enter numbers ("1 3"), a range ("1-2"), names, or "all".` +
      `  Empty = all.\n`
  );
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((res) =>
    rl.question('  > ', (a) => {
      rl.close();
      res(a.trim());
    })
  );
  return resolveSelection(answer, sites);
}

/** Parse a picker/CLI selection string into a de-duped, ordered site list. */
function resolveSelection(input, sites) {
  if (!input || input.toLowerCase() === 'all') return sites;
  const picked = new Map();
  for (const tok of input.split(/[\s,]+/).filter(Boolean)) {
    const range = tok.match(/^(\d+)-(\d+)$/);
    if (range) {
      let [a, b] = [Number(range[1]), Number(range[2])];
      if (a > b) [a, b] = [b, a];
      for (let i = a; i <= b; i++) {
        const s = sites[i - 1];
        if (s) picked.set(s.slug, s);
      }
    } else if (/^\d+$/.test(tok)) {
      const s = sites[Number(tok) - 1];
      if (!s) fail(`No site #${tok}.`);
      picked.set(s.slug, s);
    } else {
      const s = sites.find((x) => x.slug === tok);
      if (!s) fail(`No site named "${tok}".`);
      picked.set(s.slug, s);
    }
  }
  if (!picked.size) fail('No sites selected.');
  return [...picked.values()];
}

function deploy(site) {
  if (!site.hasWrangler) fail(`${site.slug}: no wrangler config — cannot deploy.`);
  build(site);
  console.log(`• ${site.slug}: deploying to Cloudflare …`);
  const r = spawnSync('npx', ['wrangler', 'deploy'], { cwd: site.dir, stdio: 'inherit' });
  if (r.status !== 0) fail(`deploy failed for ${site.slug}`);
}

function list() {
  const sites = discoverSites();
  if (!sites.length) return console.log('No sites found under sites/.');
  console.log('\nSites:\n');
  for (const s of sites) {
    const flags = [s.hasBuild ? 'build' : 'static', s.hasWrangler ? 'deployable' : 'no-wrangler'];
    console.log(`  ${s.slug.padEnd(28)} ${s.category.padEnd(16)} [${flags.join(', ')}]`);
  }
  console.log('');
}

// --- arg parsing ---------------------------------------------------------
const cmd = process.argv[2];
const rest = process.argv.slice(3);
let port = Number(process.env.PORT) || DEFAULT_PORT;
const slugs = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a === '--port' || a === '-p') {
    port = Number(rest[++i]);
    continue;
  }
  if (a.startsWith('-')) continue;
  slugs.push(a);
}

const usage =
  `Usage:\n` +
  `  node tools/site.mjs list\n` +
  `  node tools/site.mjs build  [<slug> …]\n` +
  `  node tools/site.mjs dev    [<slug> …] [--port ${DEFAULT_PORT}]   (no slug → picker)\n` +
  `  node tools/site.mjs deploy [<slug> …]\n`;

switch (cmd) {
  case 'list':
    list();
    break;
  case 'build':
    for (const s of sitesFromSlugs(slugs)) build(s);
    break;
  case 'dev':
  case 'serve': {
    const all = discoverSites();
    if (!all.length) fail('No sites found under sites/.');
    const chosen = slugs.length ? slugs.map((s) => findSite(s)) : await pickSites(all);
    await dev(chosen, port);
    break;
  }
  case 'deploy':
    for (const s of sitesFromSlugs(slugs)) deploy(s);
    break;
  default:
    console.log(usage);
    process.exit(cmd ? 1 : 0);
}
