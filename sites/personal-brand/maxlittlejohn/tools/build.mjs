/** Builds the vendored Vite app into deployable Cloudflare static assets. */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const publicDir = join(root, 'public');

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`\n✖ \"${command} ${args.join(' ')}\" failed in ${root}\n`);
    process.exit(result.status || 1);
  }
}

if (!existsSync(join(root, 'node_modules'))) {
  console.log('• maxlittlejohn: installing dependencies …');
  // The upstream lockfile is not currently in sync with package.json.
  // npm install refreshes it before the Vite build.
  run('npm', ['install']);
}

console.log('• maxlittlejohn: building Vite app …');
run('npm', ['run', 'build']);

rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });
cpSync(dist, publicDir, { recursive: true });
console.log('built public/ from dist');
