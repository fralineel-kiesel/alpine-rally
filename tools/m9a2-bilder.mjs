// Bilder zu Meilenstein 9a.2:  node tools/m9a2-bilder.mjs [--nur quer,gross,klein,hoch,hudgross,hudklein] [--auto <id>]
// Chromium mit Touch-Emulation (kein echtes Handy, keine Notch): screenshots/m9a2/
//   quer-rennen (874x402: R oben rechts und L oben links in den Ecken, R gedrückt),
//   quer-gespiegelt-gross (874x402: LAYOUT GESPIEGELT + KNOPFGRÖSSE GROSS), quer-klein (874x402: KNOPFGRÖSSE KLEIN),
//   hoch-gespiegelt (402x874: LAYOUT GESPIEGELT), hud-gross / hud-klein (Desktop 640x360, HUD-GRÖSSE GROSS / KLEIN,
//   Auto mit dem breitesten Tacho, Standard Lanza 073; alle HUD-Teile sichtbar)

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const AUTO = arg('--auto') || 'l073';
const ORDNER = path.join(WURZEL, 'screenshots/m9a2');
fs.mkdirSync(ORDNER, { recursive: true });
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const HANDY = { hasTouch: true, isMobile: true, deviceScaleFactor: 1 };

async function seite(W, H, adresse, geraet = HANDY, einst = {}) {
  const s = await starteSpiel({ breite: W, hoehe: H, geraet, auto: '' });
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
  await s.page.evaluate((v) => import('/js/einstellungen.js').then((E) => { for (const [k, w] of Object.entries(v)) E.setze(k, w); }), einst);
  const cdp = await s.page.context().newCDPSession(s.page);
  const finger = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const lay = () => s.page.evaluate(() => window.__alpineRally.touch.layoutJetzt);
  return { s, finger, lay, ev: (f, a) => s.page.evaluate(f, a) };
}
// Rennen auf der ersten Geraden (Auto steht still); mitHud: alle HUD-Teile sichtbar (Vergleich, Meldung, R-Countdown)
async function imRennen(p, mitHud = false) {
  await p.ev(async (mitHud) => {
    const A = window.__alpineRally;
    A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(mitHud ? 300 : 120); A.kameraSofort(); A.rennen.hilfe = false; A.rennen.zustand = 'laeuft';
    if (mitHud) {
      A.rennen.zeit = 61.23; A.rennen.zwischenzeiten[0] = 30.5;
      A.rennen.meldung = { text: 'CP 1  00:30.50  -0.8', farbe: '#5fe35a', bis: 1e9 }; A.rennen.uhr = 0;
      A.rueck.rest = 2.5;
      const fest = { sichtbar: true, wert: 8, stufe: -1, uhr: 0, version: 1 };
      A.vergleich.aktualisiere = () => fest;
      A.physik.tempo = 33; A.getriebe.drehzahl = 6100; A.getriebe.anzeige = '3'; A.getriebe.ladedruck = 0.7;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }, mitHud);
}
const bild = async (p, name, clip) => { await p.s.page.screenshot({ path: path.join(ORDNER, `${name}.png`), clip }); console.log(`screenshots/m9a2/${name}.png`); };
const soll = (n) => !NUR || NUR.includes(n);
const mitte = (e) => ({ x: e.v.x + e.v.b / 2, y: e.v.y + e.v.h / 2 });

for (const [name, datei, W, H, einst, druecken] of [
  ['quer', 'quer-rennen', 874, 402, {}, true],
  ['gross', 'quer-gespiegelt-gross', 874, 402, { touchLayout: 'gespiegelt', knopfGroesse: 'gross' }, false],
  ['klein', 'quer-klein', 874, 402, { knopfGroesse: 'klein' }, false],
  ['hoch', 'hoch-gespiegelt', 402, 874, { touchLayout: 'gespiegelt' }, false],
]) {
  if (!soll(name)) continue;
  const p = await seite(W, H, '?menue=aus&ton=aus', HANDY, einst);
  await imRennen(p);
  if (druecken) { const L = await p.lay(); await p.finger('touchStart', [{ ...mitte(L.el.r), id: 1 }]); await warte(500); }
  await bild(p, datei);
  await p.s.schliessen();
}
for (const [name, g] of [['hudgross', 'gross'], ['hudklein', 'klein']]) {
  if (!soll(name)) continue;
  const p = await seite(640, 360, `?menue=aus&ton=aus&auto=${AUTO}`, {}, { hudGroesse: g });
  await imRennen(p, true);
  await bild(p, `hud-${g}`);
  await p.s.schliessen();
}
