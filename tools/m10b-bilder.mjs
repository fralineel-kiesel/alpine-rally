// Bilder für Meilenstein 10b:  node tools/m10b-bilder.mjs   (nach screenshots/m10b/)
//   01-etappenwahl.png   Etappenwahl mit Vorschau-Karte im Hoch- (402x874) und Querformat (874x402), Touch
//   02-finnland-wald.png Finnland im Rennen: Kiefernwald vor der Kiefernkuppe
//   03-finnland-see.png  Finnland im Rennen: Zielgerade am See
//   04-finnland-karte.png Karte und Höhenprofil (tools/strecke-karte.mjs), nebeneinander
//   05-bestzeiten.png    Bestzeiten-Seite mit Etappen-Umschalter (Alpen | Finnland)
// Alles in Chromium (Software-Grafik), eigene Bild-Uhr wie in tools/m10b-test.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const AUS = path.join(WURZEL, 'screenshots/m10b');
fs.mkdirSync(AUS, { recursive: true });
const BZ = JSON.stringify({
  passstrasse: { rt4: [{ zeit: 151.23, cps: [30, 80, 120], datum: '2026-10-01T10:00:00.000Z', auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 50 }] },
  finnland: { imprexa: [{ zeit: 101.4, cps: [25, 54, 85], datum: '2026-11-01T10:00:00.000Z', auto: 'imprexa', aufpralle: 0, resets: 0, hoechstTempo: 50 }],
    rt4: [{ zeit: 103.07, cps: [26, 55, 87], datum: '2026-11-02T10:00:00.000Z', auto: 'rt4', aufpralle: 1, resets: 0, hoechstTempo: 50 }] },
});
const UHR = () => {
  let jetzt = 0; const warte = [];
  performance.now = () => jetzt;
  window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
  window.cancelAnimationFrame = () => {};
  window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
  window.__foto = () => { window.__bild(1, 1000 / 60); const a = document.getElementById('spiel'), h = document.getElementById('hud'); const c = document.createElement('canvas'); c.width = h.width; c.height = h.height; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(a, 0, 0, h.width, h.height); x.drawImage(h, 0, 0); return c.toDataURL(); };
};
const speichere = (name, url) => fs.writeFileSync(path.join(AUS, name), Buffer.from(url.split(',')[1], 'base64'));
// Bilder (data-URLs) nebeneinander, skaliert auf Höhe h, mit Abstand
async function collage(seite, bilder, h) {
  return seite.evaluate(async ({ bilder, h }) => {
    const ims = await Promise.all(bilder.map(async (u) => createImageBitmap(await (await fetch(u)).blob())));
    const breiten = ims.map((im) => Math.round(im.width * h / im.height));
    const c = document.createElement('canvas'); c.width = breiten.reduce((a, b) => a + b, 0) + 8 * (ims.length - 1); c.height = h;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
    let ox = 0; ims.forEach((im, i) => { x.drawImage(im, ox, 0, breiten[i], h); ox += breiten[i] + 8; });
    return c.toDataURL();
  }, { bilder, h });
}

// 01: Etappenwahl hoch und quer (Touch), Finnland markiert
const etappen = [];
for (const [b, h] of [[402, 874], [874, 402]]) {
  const s = await starteSpiel({ breite: b, hoehe: h, geraet: { hasTouch: true, isMobile: true, deviceScaleFactor: 1 } });
  await s.page.addInitScript((bz) => { localStorage.clear(); localStorage.setItem('alpineRally.bestzeiten2', bz); }, BZ);
  await s.page.goto(`${s.url}/index.html?ton=aus`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 180000 });
  await s.page.evaluate(async () => { const A = window.__alpineRally; A.zumMenue(); A.menue.oeffne(A.seiten.etappe); await new Promise((o) => setTimeout(o, 1500)); A.menue.runter(); A.menue.neuZeichnen(); });
  await s.page.waitForTimeout(1500);
  etappen.push(`data:image/png;base64,${(await s.page.screenshot()).toString('base64')}`);
  if (etappen.length === 2) speichere('01-etappenwahl.png', await collage(s.page, etappen, 600));
  await s.schliessen();
}

// 02, 03: Finnland im Rennen (HUD an)
{
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.addInitScript(UHR);
  await s.page.goto(`${s.url}/index.html?menue=aus&ton=aus&strecke=finnland`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 180000 });
  await s.page.evaluate(() => window.__bild(2, 1000 / 60));
  for (const [name, sM] of [['02-finnland-wald.png', 655], ['03-finnland-see.png', 2640]]) {
    await s.page.evaluate((sM) => { const A = window.__alpineRally; A.anhalten = true; A.setzeAuf(sM); A.kameraSofort(); window.__bild(6, 1000 / 60); }, sM);
    const klein = await s.page.evaluate(() => window.__foto());
    speichere(name, await collage(s.page, [klein], 360));
  }
  await s.schliessen();
}

// 04: Karte und Höhenprofil
{
  const tmp = '/tmp/m10b-karte';
  spawnSync('node', [path.join(WURZEL, 'tools/strecke-karte.mjs'), '--strecke', 'finnland', '--aus', tmp], { cwd: WURZEL, stdio: 'ignore' });
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/tools/leer.html`).catch(() => {});
  const url = (f) => `data:image/png;base64,${fs.readFileSync(path.join(tmp, f)).toString('base64')}`;
  speichere('04-finnland-karte.png', await collage(s.page, [url('finnland-karte.png'), url('finnland-profil.png')], 700));
  await s.schliessen();
}

// 05: Bestzeiten mit Umschalter (Alpen, dann Finnland), Menü-Leinwand 320x180, doppelt gross
{
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.addInitScript((bz) => { localStorage.clear(); localStorage.setItem('alpineRally.bestzeiten2', bz); }, BZ);
  await s.page.goto(`${s.url}/index.html?ton=aus`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 180000 });
  const bilder = await s.page.evaluate(async () => {
    const A = window.__alpineRally; A.szene.visible = false; A.zumMenue(); A.menue.oeffne(A.seiten.bestzeiten);
    await new Promise((o) => setTimeout(o, 1200));
    const male = () => { const t = document.createElement('canvas'); t.width = 320; t.height = 180; const x = t.getContext('2d'); x.fillStyle = '#1e2a22'; x.fillRect(0, 0, 320, 180); A.menue.zeichne(x, 0, 1); return t.toDataURL(); };
    const a = male(); A.menue.rechts(); const b = male();
    return [a, b];
  });
  speichere('05-bestzeiten.png', await collage(s.page, bilder, 360));
  await s.schliessen();
}
console.log(`Bilder: ${fs.readdirSync(AUS).join(', ')} in screenshots/m10b/`);
