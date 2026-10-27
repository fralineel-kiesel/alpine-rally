// Bilder zu Meilenstein 9a.1:  node tools/m9a1-bilder.mjs [--nur quer,safari,hoch,einstellungen,zonen]
// Chromium mit Touch-Emulation (kein echtes Handy, keine Notch): screenshots/m9a1/
//   quer-rennen (874x402: neues D-Pad, kleine Knöpfe, R über A/B; AUTO-GAS an, R und ← gedrückt),
//   quer-safari (874x330, mit Safari-Leisten), hoch-rennen (402x874), einstellungen (AUTO-GAS und HAPTIK, quer),
//   zonen (874x402: Trefferzonen des D-Pads beim Fahren farbig eingeblendet – die Einblendung gibt es nur hier im Test)

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ORDNER = path.join(WURZEL, 'screenshots/m9a1');
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
// Rennen auf der ersten Geraden (Auto steht still, Hilfezeilen weg)
async function imRennen(p) {
  await p.ev(async () => {
    const A = window.__alpineRally;
    A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(120); A.kameraSofort(); A.rennen.hilfe = false; A.rennen.zustand = 'laeuft';
    await new Promise((r) => setTimeout(r, 1500));
  });
}
const bild = async (p, name, clip) => { await p.s.page.screenshot({ path: path.join(ORDNER, `${name}.png`), clip }); console.log(`screenshots/m9a1/${name}.png`); };
const soll = (n) => !NUR || NUR.includes(n);
const mitte = (e) => ({ x: e.v.x + e.v.b / 2, y: e.v.y + e.v.h / 2 });

if (soll('quer')) {
  const p = await seite(874, 402, '?menue=aus&ton=aus');
  await p.ev(() => import('/js/einstellungen.js').then((E) => E.setze('touchAutoGas', true)));
  await imRennen(p);
  const L = await p.lay(); const d = L.el.dpad.v;
  await p.finger('touchStart', [{ x: d.x + d.b * 0.12, y: d.y + d.b / 2, id: 1 }, { ...mitte(L.el.r), id: 2 }]);
  await warte(500); await bild(p, 'quer-rennen');
  await p.s.schliessen();
}
for (const [name, W, H] of [['safari', 874, 330], ['hoch', 402, 874]]) {
  if (!soll(name)) continue;
  const p = await seite(W, H, '?menue=aus&ton=aus');
  await imRennen(p); await bild(p, name === 'safari' ? 'quer-safari' : 'hoch-rennen');
  await p.s.schliessen();
}
if (soll('einstellungen')) {
  const p = await seite(874, 402);
  await p.ev(() => {
    const A = window.__alpineRally; A.zumMenue(); A.menue.oeffne(A.seiten.einstellungen, true);
    const nr = A.seiten.einstellungen.eintraege.findIndex((e) => e.text === 'einst.haptik');
    while (A.menue.wahl !== nr) A.menue.runter();
  });
  await warte(1500); const L = await p.lay();
  await bild(p, 'einstellungen', { x: L.bild.x, y: L.bild.y, width: L.bild.b, height: L.bild.h });
  await p.s.schliessen();
}
if (soll('zonen')) {
  const p = await seite(874, 402, '?menue=aus&ton=aus');
  await imRennen(p);
  // nur im Test: Leinwand über der Seite, jeder Punkt nach dem, was ein Finger dort beim Fahren auslösen würde
  // (blau ← / →, rot ↑ / ↓, gelb Schrägen, grau tote Mitte bzw. ↑ / ↓ zu weit weg; andere Knöpfe weiss umrandet)
  const L = await p.ev(() => {
    const A = window.__alpineRally, L = A.touch.layoutJetzt;
    const c = document.createElement('canvas'); c.width = innerWidth; c.height = innerHeight;
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: 99, pointerEvents: 'none' });
    const x = c.getContext('2d');
    const farbe = { 3: 'rgba(60,140,255,.45)', 7: 'rgba(60,140,255,.45)', 1: 'rgba(255,60,60,.5)', 5: 'rgba(255,60,60,.5)', 2: 'rgba(255,220,0,.5)', 4: 'rgba(255,220,0,.5)', 6: 'rgba(255,220,0,.5)', 8: 'rgba(255,220,0,.5)', 0: 'rgba(160,160,160,.45)' };
    for (let py = 0; py < innerHeight; py += 2) for (let px = 0; px < L.bild.x; px += 2) {
      const r = A.touch.probe(px, py, true);
      if (r.el !== 'dpad') continue;
      x.fillStyle = farbe[r.richtung]; x.fillRect(px, py, 2, 2);
    }
    x.strokeStyle = '#fff'; x.lineWidth = 1;
    for (const n of ['l', 'select']) { const e = L.el[n]; x.strokeRect(e.x + 0.5, e.y + 0.5, e.b - 1, e.h - 1); }
    const z = L.el.dpad.zone; x.setLineDash([4, 3]); x.strokeRect(z.x + 0.5, z.y + 0.5, z.b - 1, z.h - 1);
    document.body.appendChild(c);
    return L;
  });
  await warte(300);
  await bild(p, 'zonen', { x: 0, y: 0, width: Math.ceil(L.bild.x + 60), height: 402 });
  await p.s.schliessen();
}
