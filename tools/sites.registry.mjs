/**
 * Explicit inventory for every deployable mockup in this repository.
 *
 * Paths are relative to the repository root. Keeping this data explicit avoids
 * guessing an application's architecture from incidental folders such as
 * `public/`.
 */
export const SITE_KINDS = new Set([
  'static',
  'generated-static',
  'vite-spa',
  'tanstack-worker',
]);

export const sites = [
  staticSite('adcamp-inc-first-design', 'adcamp', {
    kind: 'generated-static',
    build: nodeBuild('sites/adcamp/adcamp-inc-first-design'),
    install: npmInstall('sites/adcamp/adcamp-inc-first-design/app'),
    quality: npmQuality('sites/adcamp/adcamp-inc-first-design/app'),
  }),
  viteSite('adcamp-webdesign-1', 'adcamp'),
  viteSite('adcamp-webdesign-3-decent', 'adcamp'),
  staticSite('agentconsulting', 'agentconsulting', {
    kind: 'generated-static',
    build: nodeBuild('sites/agentconsulting/agentconsulting'),
    install: npmInstall('sites/agentconsulting/agentconsulting/app'),
    quality: npmQuality('sites/agentconsulting/agentconsulting/app'),
  }),
  staticSite('editorial-authority', 'brandoncomer'),
  staticSite('typographic-minimal', 'brandoncomer'),
  staticSite('midstate-construction', 'construction', {
    kind: 'generated-static',
    build: nodeBuild('sites/construction/midstate-construction'),
  }),
  staticSite('buford-plumbing', 'home-services'),
  workerSite('newcrestimage-2', 'newcrestimage'),
  workerSite('newcrestimage-mockup', 'newcrestimage'),
  staticSite('complete-lawn-service-ms', 'outdoor-services'),
  {
    ...viteSite('maxlittlejohn', 'personal-brand'),
    // This project's Worker config intentionally deploys the generated public/ snapshot.
    build: nodeBuild('sites/personal-brand/maxlittlejohn'),
    output: 'public',
  },
  staticSite('new-orleans-grill', 'restaurant'),
  workerSite('customcarting', 'waste-management'),
].sort((a, b) => a.slug.localeCompare(b.slug));

function siteDir(category, slug) {
  return `sites/${category}/${slug}`;
}

function command(cwd, executable, args) {
  return { cwd, executable, args };
}

function npmInstall(cwd) {
  return command(cwd, 'npm', ['ci']);
}

function npmQuality(cwd) {
  return { cwd, manager: 'npm' };
}

function bunQuality(cwd) {
  return { cwd, manager: 'bun' };
}

function bunInstall(cwd) {
  return command(cwd, 'bun', ['install', '--frozen-lockfile']);
}

function nodeBuild(cwd) {
  return command(cwd, 'node', ['tools/build.mjs']);
}

function staticSite(slug, category, overrides = {}) {
  const dir = siteDir(category, slug);
  return {
    slug,
    category,
    kind: 'static',
    dir,
    output: 'public',
    build: null,
    install: null,
    dev: { mode: 'static' },
    deployConfig: 'wrangler.jsonc',
    ...overrides,
  };
}

function viteSite(slug, category) {
  const dir = siteDir(category, slug);
  return {
    slug,
    category,
    kind: 'vite-spa',
    dir,
    output: 'dist',
    install: npmInstall(dir),
    quality: npmQuality(dir),
    build: command(dir, 'npm', ['run', 'build']),
    dev: { mode: 'command', executable: 'npm', args: ['run', 'dev', '--'] },
    deployConfig: 'wrangler.jsonc',
  };
}

function workerSite(slug, category, overrides = {}) {
  const dir = siteDir(category, slug);
  return {
    slug,
    category,
    kind: 'tanstack-worker',
    dir,
    output: 'dist/server',
    install: bunInstall(dir),
    quality: bunQuality(dir),
    build: command(dir, 'bun', ['run', 'build']),
    dev: { mode: 'command', executable: 'bun', args: ['run', 'dev', '--'] },
    // The Cloudflare Vite plugin emits the deployable Worker configuration.
    deployConfig: 'dist/server/wrangler.json',
    ...overrides,
  };
}
