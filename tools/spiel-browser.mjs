// Hilfe für die Werkzeuge: kleiner Webserver für den Projektordner und das Spiel
// im Headless-Browser (Playwright mit Chromium, in der Testumgebung vorhanden).
// Das Spiel selbst lädt diese Datei nicht.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function ladePlaywright() {
  for (const versuch of [
    () => import('playwright'),
    () => import(createRequire(import.meta.url).resolve('playwright', { paths: [process.env.NODE_PATH || '', '/opt/node22/lib/node_modules'] })),
  ]) {
    try { return await versuch(); } catch { /* weiter */ }
  }
  throw new Error('Playwright nicht gefunden (npm i -g playwright)');
}

const TYPEN = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

// Startet Server + Browser. wurzel: Projektordner (Standard: dieser).
// Ergebnis: { page, ladeSpiel(), schliessen() }
export async function starteSpiel({ wurzel = WURZEL, breite = 640, hoehe = 360 } = {}) {
  const server = http.createServer((req, res) => {
    const datei = path.join(wurzel, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!datei.startsWith(wurzel) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPEN[path.extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(datei).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  const url = `http://localhost:${server.address().port}`;
  const pw = await ladePlaywright();
  const { chromium } = pw.chromium ? pw : pw.default;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: breite, height: hoehe } });
  const fehler = [];
  page.on('pageerror', (e) => { fehler.push(String(e)); console.log('Fehler im Spiel:', String(e)); });
  page.on('console', (m) => { if (m.type() === 'error') { fehler.push(m.text()); console.log('Konsole:', m.text()); } });
  return {
    page, url, fehler,
    // Spiel laden; anhalten = Physik läuft nur, wenn das Werkzeug sie aufruft
    async ladeSpiel(anhalten = true) {
      const t0 = Date.now();
      await page.goto(`${url}/index.html`);
      await page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
      const ms = Date.now() - t0;
      if (anhalten) await page.evaluate(() => { window.__alpineRally.anhalten = true; });
      return ms;
    },
    async schliessen() { await browser.close(); server.close(); },
  };
}
