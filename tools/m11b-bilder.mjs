// Bilder zu Meilenstein 11b (Skigebiet):  node tools/m11b-bilder.mjs [--nur start,kehre,grat,funpark]
// 01 Talstation und Start (Dorf, Gondelhaus, Parkplatz), 02 Anstieg mit Kehre (schmale Piste, Netze, Gondeln),
// 03 Grat mit Panorama (Berge rundum), 04 Funpark-Kicker. 640x360 (Standard AUTO), doppelt vergrössert, zugeschnitten.
// Nach screenshots/m11b/. Vorlage: tools/m11a1-bilder.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ZIEL = path.join(WURZEL, 'screenshots', 'm11b');
fs.mkdirSync(ZIEL, { recursive: true });
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));

// s0: Streckenmeter der Kamera; Ausschnitt: Teil des Bildes (y von … bis, Anteil der Höhe)
async function bild(s0, datei, { oben = 0.12, unten = 0.8, sekunden = 2 } = {}) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: 'rt4', geraet: { deviceScaleFactor: 2 } });
  await s.page.goto(`${s.url}/index.html?menue=aus&ton=aus&strecke=skigebiet&aufloesung=640x360`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await warte(3000);
  await s.page.evaluate((s0) => {
    const A = window.__alpineRally;
    A.start({ countdown: false }); A.setzeAuf(s0); A.kameraSofort(); A.anhalten = true;
    if (A.hudSchalter.an) A.hudUmschalten(); A.hudSchalter.hinweis = 0; // HUD aus (wie Taste H), ohne Hinweis
  }, s0);
  await warte(sekunden * 1000);
  await s.page.screenshot({ path: path.join(ZIEL, datei), clip: { x: 0, y: 360 * oben, width: 640, height: 360 * (unten - oben) } });
  await s.schliessen();
  console.log(`${datei}: ${s0} m`);
}
if (teil('start')) await bild(28, '01-talstation-start.png', { oben: 0.12, unten: 0.82 });
if (teil('kehre')) await bild(1215, '02-anstieg-kehre.png', { oben: 0.05, unten: 0.82 });
if (teil('grat')) await bild(2130, '03-grat-panorama.png', { oben: 0, unten: 0.7 });
if (teil('funpark')) await bild(3525, '04-funpark-kicker.png', { oben: 0.1, unten: 0.82 });
