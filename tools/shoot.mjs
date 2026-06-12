/**
 * shoot.mjs — visual QA screenshots for a mockup site.
 * Usage: node tools/shoot.mjs sites/midstate-construction/public [outDir]
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const root = resolve(process.argv[2] || 'sites/midstate-construction/public');
const out = resolve(process.argv[3] || 'shots');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const server = createServer(async (req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  try {
    const buf = await readFile(join(root, p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404); res.end('nope');
  }
});
await new Promise((r) => server.listen(4173, r));

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const shoot = async (name, { w = 1600, h = 1000, scrollTo = null, before = null, full = false, dark = false } = {}) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2400); // loader + intro
  if (dark) {
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight');
    await page.keyboard.press('b'); await page.keyboard.press('a');
    await page.waitForTimeout(900);
  }
  if (scrollTo !== null) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollTo);
    await page.waitForTimeout(1600);
  }
  if (full) {
    // walk the page so reveal-on-scroll content is visible in the stitched capture
    await page.evaluate(async () => {
      const step = innerHeight * 0.7;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 90));
      }
      scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(700);
  }
  if (before) await before(page);
  await page.screenshot({ path: join(out, `${name}.png`), fullPage: full });
  await page.close();
  console.log('shot:', name);
};

// scroll positions are computed live from section offsets
const page0 = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page0.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page0.waitForTimeout(2400);
const pos = await page0.evaluate(() => {
  const g = (s) => document.querySelector(s)?.getBoundingClientRect().top + scrollY || 0;
  return {
    services: g('#services'), work: g('#work'),
    workMid: g('#work') + (document.querySelector('#work').offsetHeight - innerHeight) * 0.55,
    process: g('#process') + 200, about: g('#about'), quote: g('#about') + 100,
    contact: g('#contact'), footer: document.body.scrollHeight,
  };
});
await page0.close();

await shoot('01-hero');
await shoot('02-services', { scrollTo: pos.services });
await shoot('03-services-open', {
  scrollTo: pos.services,
  before: async (p) => { await p.click('.svc-row:nth-child(3) .svc-btn'); await p.waitForTimeout(800); },
});
await shoot('04-work-scrub', { scrollTo: pos.workMid });
await shoot('05-process', { scrollTo: pos.process });
await shoot('06-about', { scrollTo: pos.about + 300 });
await shoot('07-contact', { scrollTo: pos.contact });
await shoot('08-footer', { scrollTo: pos.footer });
await shoot('09-blueprint-hero', { dark: true });
await shoot('10-blueprint-about', { dark: true, scrollTo: pos.about + 300 });
await shoot('11-mobile-hero', { w: 390, h: 844 });
await shoot('12-mobile-full', { w: 390, h: 844, full: true });
await shoot('13-404', { before: async (p) => { await p.goto('http://localhost:4173/404.html'); await p.waitForTimeout(600); } });

await browser.close();
server.close();
console.log('done →', out);
