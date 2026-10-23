// Bilder zu Meilenstein 9a:  node tools/m9a-bilder.mjs [--nur hoch,rennen,...]
// Chromium mit Touch-Emulation (kein echtes Handy, keine Notch): screenshots/m9a/
//   hoch-titel, hoch-menue, hoch-rennen (402x874, iPhone 16 Pro), quer-rennen (874x402), quer-safari (874x330),
//   android-hoch (360x640), garage (D-Pad ↓ gedrückt, markiertes Auto), einstellung (TOUCH-STEUERUNG gewählt),
//   steuerung (Seite mit TOUCH oben), gedrueckt (Steuerfläche: ↖, A, L gleichzeitig)

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ORDNER = path.join(WURZEL, 'screenshots/m9a');
fs.mkdirSync(ORDNER, { recursive: true });
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

async function seite(W, H, adresse = '?ton=aus') {
  const s = await starteSpiel({ breite: W, hoehe: H, geraet: { hasTouch: true, isMobile: true, deviceScaleFactor: 1 }, auto: '' });
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
  const cdp = await s.page.context().newCDPSession(s.page);
  const finger = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const lay = () => s.page.evaluate(() => window.__alpineRally.touch.layoutJetzt);
  return { s, finger, lay, ev: (f, a) => s.page.evaluate(f, a) };
}
// Rennen kurz nach dem Start auf der ersten Geraden (Auto steht still, Hilfezeilen weg)
async function imRennen(p) {
  await p.ev(async () => {
    const A = window.__alpineRally;
    A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(120); A.kameraSofort(); A.rennen.hilfe = false;
    await new Promise((r) => setTimeout(r, 1500));
  });
}
const bild = async (p, name, clip) => { await p.s.page.screenshot({ path: path.join(ORDNER, `${name}.png`), clip }); console.log(`screenshots/m9a/${name}.png`); };
const soll = (n) => !NUR || NUR.includes(n);

if (soll('hoch')) {
  const p = await seite(402, 874);
  await warte(2500); await bild(p, 'hoch-titel');
  await p.ev(() => window.__alpineRally.zumMenue()); await warte(1500); await bild(p, 'hoch-menue');
  await imRennen(p); await bild(p, 'hoch-rennen');
  await p.s.schliessen();
}
for (const [name, W, H] of [['quer-rennen', 874, 402], ['quer-safari', 874, 330], ['android-hoch', 360, 640]]) {
  if (!soll(name)) continue;
  const p = await seite(W, H, '?menue=aus&ton=aus');
  await imRennen(p); await bild(p, name);
  await p.s.schliessen();
}
if (soll('garage')) {
  const p = await seite(402, 874);
  await p.ev(() => { const A = window.__alpineRally; A.zumMenue(); A.menue.oeffne(A.seiten.auto, true); });
  await warte(1500);
  const L = await p.lay(); const d = L.el.dpad.v;
  await p.finger('touchStart', [{ x: d.x + d.b / 2, y: d.y + d.b * 0.85, id: 1 }]); await warte(200);
  await bild(p, 'garage'); await p.finger('touchEnd', [{ x: d.x + d.b / 2, y: d.y + d.b * 0.85, id: 1 }]);
  await p.s.schliessen();
}
if (soll('einstellung') || soll('steuerung')) {
  const p = await seite(402, 874);
  await p.ev(() => {
    const A = window.__alpineRally; A.zumMenue(); A.menue.oeffne(A.seiten.einstellungen, true);
    const nr = A.seiten.einstellungen.eintraege.findIndex((e) => e.text === 'einst.touch');
    while (A.menue.wahl !== nr) A.menue.runter();
  });
  await warte(1500); const L = await p.lay();
  if (soll('einstellung')) await bild(p, 'einstellung', { x: 0, y: L.bild.y, width: 402, height: L.bild.h });
  await p.ev(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); A.menue.oeffne(A.seiten.steuerung, true); });
  await warte(1500);
  if (soll('steuerung')) await bild(p, 'steuerung', { x: 0, y: L.bild.y, width: 402, height: L.bild.h });
  await p.s.schliessen();
}
if (soll('gedrueckt')) {
  const p = await seite(402, 874, '?menue=aus&ton=aus');
  await p.ev(() => { window.__alpineRally.anhalten = true; });
  const L = await p.lay(); const d = L.el.dpad.v, r = d.b / 2;
  const m = (e) => ({ x: e.v.x + e.v.b / 2, y: e.v.y + e.v.h / 2 });
  await p.finger('touchStart', [{ x: d.x + r * 0.5, y: d.y + r * 0.5, id: 1 }, { ...m(L.el.a), id: 2 }, { ...m(L.el.l), id: 3 }]);
  await warte(400);
  await bild(p, 'gedrueckt', { x: 0, y: L.flaeche.y - 2, width: 402, height: L.flaeche.h + 2 });
  await p.s.schliessen();
}
