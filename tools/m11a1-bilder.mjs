// Meilenstein 11a.1: Bilder für den Bericht nach screenshots/m11a1/ (höchstens 4):  node tools/m11a1-bilder.mjs [--nur see,hohlweg,berge,ski]
// 01 Eissee von der Strasse aus (kleiner See am Gletscherrand), 02 Hohlweg im Linksbogen (Schneebank, Fels, Spurrillen),
// 03 Panorama: Strecke zwischen den Bergen (vier Reihen, Gletscherzunge), 04 Skipiste mit Skifahrern am Hang (Hochebene).
// Alles Chromium mit Software-Grafik, 3D-Bild 640x360 (Standard AUTO), doppelt vergrössert, unten zugeschnitten (HUD/Auto).
// M11b: Die Etappe Gletscher ist entfernt. Dieses Werkzeug malte Gletscher-Bilder und läuft nur noch im alten Stand
// (git worktree add <ordner> 471d726 = 0.11a.1, dort ausführen). Die Bilder liegen weiter unter screenshots/.
if (!process.argv.includes('--trotzdem')) { console.log('Gletscher entfernt (M11b): nur im Stand 0.11a.1 ausführen (git worktree add <ordner> 471d726).'); process.exit(0); }
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ZIEL = path.join(WURZEL, 'screenshots', 'm11a1');
fs.mkdirSync(ZIEL, { recursive: true });
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));

// s0: Streckenmeter der Kamera; Ausschnitt: oberer Teil des Bildes (y von … bis, Anteil der Höhe)
async function bild(s0, datei, { oben = 0.12, unten = 0.8, sekunden = 1.5 } = {}) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: 'rt4', geraet: { deviceScaleFactor: 2 } });
  await s.page.goto(`${s.url}/index.html?menue=aus&ton=aus&strecke=gletscher&aufloesung=640x360`);
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
if (teil('see')) await bild(1328, '01-eissee.png', { oben: 0.25, unten: 0.78 });
if (teil('hohlweg')) await bild(1552, '02-hohlweg.png', { oben: 0.25, unten: 0.82 });
if (teil('berge')) await bild(1290, '03-panorama-berge.png', { oben: 0, unten: 0.62 });
if (teil('ski')) await bild(3470, '04-skipiste.png', { oben: 0.1, unten: 0.7, sekunden: 3 });
