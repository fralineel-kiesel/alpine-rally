// Bilder zu Meilenstein 11b.1 (Skigebiet-Feinschliff):  node tools/m11b1-bilder.mjs [--nur kehre,kicker,kamera,grat]
// 01 Anstieg mit Kehre (breite Piste, Netze, Tannen, Felsen), 02 Kicker aus ca. 110 m, 03 Kamera im steilsten Gefälle
// vorher/nachher (zusammengesetzt), 04 Panorama am Grat. 640x360 (Standard AUTO), zugeschnitten. Nach screenshots/m11b1/.
// Vorlage: tools/m11b-bilder.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ZIEL = path.join(WURZEL, 'screenshots', 'm11b1');
fs.mkdirSync(ZIEL, { recursive: true });
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));

// s0: Streckenmeter des Autos; Ausschnitt oben/unten als Anteil der Höhe; gefaelle: Kamera-Gefälle-Stärke (null = wie Strecke)
async function aufnahme(s0, { oben = 0.12, unten = 0.8, faktor = 2, gefaelle = null } = {}) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: 'rt4', geraet: { deviceScaleFactor: faktor } });
  await s.page.goto(`${s.url}/index.html?menue=aus&ton=aus&strecke=skigebiet&aufloesung=640x360`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await warte(3000);
  await s.page.evaluate(([s0, g]) => {
    const A = window.__alpineRally;
    if (g != null) A.CONFIG.kamera.gefaelle.staerke = g;
    A.start({ countdown: false }); A.setzeAuf(s0); A.kameraSofort(); A.anhalten = true;
    if (A.hudSchalter.an) A.hudUmschalten(); A.hudSchalter.hinweis = 0; // HUD aus (wie Taste H), ohne Hinweis
  }, [s0, gefaelle]);
  await warte(2000);
  const bild = await s.page.screenshot({ clip: { x: 0, y: 360 * oben, width: 640, height: 360 * (unten - oben) } });
  await s.schliessen();
  return bild;
}
async function bild(s0, datei, o) { fs.writeFileSync(path.join(ZIEL, datei), await aufnahme(s0, o)); console.log(`${datei}: ${s0} m`); }

if (teil('kehre')) await bild(1215, '01-anstieg-kehre.png', { oben: 0.05, unten: 0.82 });
if (teil('kicker')) await bild(3450, '02-kicker-110m.png', { oben: 0.12, unten: 0.7 });
if (teil('kamera')) {
  // zwei Aufnahmen (Kamera wie 0.11b / mit Gefälle) nebeneinander, beschriftet, in einem Browser zusammengesetzt
  const vor = await aufnahme(3250, { oben: 0, unten: 1, faktor: 1, gefaelle: 0 }), nach = await aufnahme(3250, { oben: 0, unten: 1, faktor: 1, gefaelle: 1 });
  const s = await starteSpiel({ breite: 1300, hoehe: 400 });
  const png = await s.page.evaluate(async ([a, b]) => {
    const lade = (d) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = `data:image/png;base64,${d}`; });
    const [ia, ib] = await Promise.all([lade(a), lade(b)]);
    const c = document.createElement('canvas'); c.width = ia.width * 2 + 12; c.height = ia.height; const g = c.getContext('2d');
    g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height); g.drawImage(ia, 0, 0); g.drawImage(ib, ia.width + 12, 0);
    g.font = 'bold 18px monospace'; g.fillStyle = '#ffeb3b';
    g.fillText('VORHER (0.11b-Kamera)', 10, 24); g.fillText('NACHHER (Kamera folgt dem Gefälle)', ia.width + 22, 24);
    return c.toDataURL('image/png').split(',')[1];
  }, [vor.toString('base64'), nach.toString('base64')]);
  await s.schliessen();
  fs.writeFileSync(path.join(ZIEL, '03-kamera-gefaelle-vorher-nachher.png'), Buffer.from(png, 'base64'));
  console.log('03-kamera-gefaelle-vorher-nachher.png: 3250 m');
}
if (teil('grat')) await bild(2130, '04-grat-panorama.png', { oben: 0, unten: 0.72 });
