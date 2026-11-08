// Meilenstein 11a: Bilder für den Bericht nach screenshots/m11a/ (höchstens 4):  node tools/m11a-bilder.mjs [--nur schnee,eis,etappe,sprung]
// 01 Gletscher, Schnee-Passage am Gletscherrand (blauer Himmel), 02 Eisstelle in der Senke am Eisfeld (Fahrbahn glänzt),
// 03 Etappenwahl mit 3 Etappen im Handy-Hochformat (Touch emuliert), 04 Sprung über die Moränenkuppe (in der Luft).
// Alles Chromium mit Software-Grafik, 3D-Bild fest 320x180 (doppelt vergrössert gezeigt).
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ZIEL = path.join(WURZEL, 'screenshots', 'm11a');
fs.mkdirSync(ZIEL, { recursive: true });
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));

async function rennen(s0, datei, { kmh = 0, sprung = false } = {}) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: 'rt4' });
  await s.page.goto(`${s.url}/index.html?menue=aus&ton=aus&strecke=gletscher&aufloesung=320x180`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await warte(3000);
  await s.page.evaluate(([s0, kmh]) => {
    const A = window.__alpineRally, P = A.physik;
    A.start({ countdown: false }); A.setzeAuf(s0); A.kameraSofort();
    if (kmh) { P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6; A.testEingabe = { gas: 0.6 }; }
  }, [s0, kmh]);
  if (sprung) await s.page.waitForFunction(() => window.__alpineRally.flug.inLuft, null, { timeout: 20000, polling: 'raf' }).catch(() => {});
  else await warte(1500);
  if (sprung) await warte(120);
  await s.page.screenshot({ path: path.join(ZIEL, datei) });
  await s.schliessen();
}

if (teil('schnee')) await rennen(1640, '01-gletscher-schnee.png');
if (teil('eis')) await rennen(2405, '02-gletscher-eis.png');
if (teil('etappe')) {
  const s = await starteSpiel({ breite: 402, hoehe: 874, geraet: { hasTouch: true, isMobile: true, deviceScaleFactor: 1 } });
  await s.page.goto(`${s.url}/index.html?ton=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await s.page.evaluate(async () => { const A = window.__alpineRally; A.zumMenue(); A.menue.oeffne(A.seiten.etappe); });
  await warte(2500);
  await s.page.evaluate(() => window.__alpineRally.menue.neuZeichnen());
  await warte(500);
  await s.page.screenshot({ path: path.join(ZIEL, '03-etappenwahl-hoch.png'), clip: { x: 0, y: 0, width: 402, height: 420 } });
  await s.schliessen();
}
if (teil('sprung')) await rennen(3150, '04-gletscher-sprung.png', { kmh: 115, sprung: true });
console.log(`Bilder: ${fs.readdirSync(ZIEL).join(', ')}`);
