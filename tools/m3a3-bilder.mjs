// Screenshots und Leistungszahlen für Meilenstein 3a.3 (Felswand: Kollision, Grasstellen).
//
//   node tools/m3a3-bilder.mjs --endung b                     Bilder nach screenshots/m3a-3/<nr>b-<stelle>.png
//   node tools/m3a3-bilder.mjs --wurzel <ordner> --endung a   alte Version (vorher), gleiche Stellen
//   --keine-bilder                                            nur Zahlen (Zeichenaufrufe, Dreiecke)
//
// Bilder in 1280x720, ohne HUD. An drei Felswand-Stellen (2117 m, 2300 m links, 3100 m rechts):
//   fahrer   = Auto auf der Fahrspur neben der Wand, Kamera wie im Spiel
//   1m       = Kamera 1 m vor dem Wandfuss in 1.2 m Höhe, schaut schräg den Wandfuss entlang
//   auto     = Auto ist mit 60 km/h unter 30° an die Wand gefahren (Kamera wie im Spiel)
//   auto-nah = dasselbe, Kamera von der Strasse her auf die Ecke an der Wand
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const bilder = !process.argv.includes('--keine-bilder');
const ordner = path.join(WURZEL, 'screenshots/m3a-3');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
await spiel.ladeSpiel();
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });

const warte = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const info = () => page.evaluate(() => {
  const r = window.__alpineRally.renderer.info.render;
  return { calls: r.calls, dreiecke: r.triangles };
});

const STELLEN = [];
let nr = 1;
for (const s of [2117, 2300, 3100]) {
  for (const art of ['fahrer', '1m', 'auto', 'auto-nah']) STELLEN.push({ nr: String(nr++).padStart(2, '0'), name: `${s}m-${art}`, s, art });
}
// Wand-Enden (dort war früher Gras zu sehen) und ein Überblick
STELLEN.push({ nr: String(nr++).padStart(2, '0'), name: '1925m-wandanfang-1m', s: 1925, art: '1m' });
STELLEN.push({ nr: String(nr++).padStart(2, '0'), name: '2485m-wandende-fahrer', s: 2470, art: 'fahrer' });
STELLEN.push({ nr: String(nr++).padStart(2, '0'), name: '3000m-wand-ueberblick', s: 3000, art: 'ueberblick' });

const ergebnis = [];
for (const st of STELLEN) {
  await page.evaluate((st) => {
    const A = window.__alpineRally, S = A.strecke, P = A.physik;
    A.testKamera = null;
    const p = S.punktBei(st.s), ws = S.wandSeite[p.i] || -1;
    const rx = -p.tz * ws, rz = p.tx * ws; // zur Wand
    if (st.art === 'fahrer') {
      A.setzeAuf(st.s, 1.75 * ws); // Fahrspur auf der Wandseite
    } else if (st.art === '1m') {
      A.setzeAuf(st.s - 30);
      const q = S.punktBei(st.s + 7);
      const L = 5.1;
      A.testKamera = {
        pos: [p.x + rx * (L - 1), p.h + 1.2, p.z + rz * (L - 1)],
        ziel: [q.x - q.tz * ws * L, q.h + 0.1, q.z + q.tx * ws * L],
      };
    } else if (st.art === 'auto' || st.art === 'auto-nah') {
      // mit 60 km/h unter 30° gegen die Wand, dann stehen lassen
      const a = Math.PI / 6;
      const start = S.punktBei(st.s - 6), sx = -start.tz * ws, sz = start.tx * ws;
      const dx = start.tx * Math.cos(a) + sx * Math.sin(a), dz = start.tz * Math.cos(a) + sz * Math.sin(a);
      A.setzeAuf(st.s - 6);
      P.reset(start.x, start.z, Math.atan2(dx, dz));
      const v = 60 / 3.6, dt = A.SCHRITT;
      const GAS = { gas: 0.4, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
      const BREMSE = { gas: 0, bremse: 1, lenkung: 0, handbremse: false, reset: false, debug: false };
      let t = 0, stoss = -1;
      while (t < 4) {
        if (stoss < 0) { P.vx = Math.sin(P.richtung) * v; P.vz = Math.cos(P.richtung) * v; P.vVor = v; }
        const vor = Math.hypot(P.vx, P.vz);
        A.physikSchritt(dt, stoss < 0 ? GAS : BREMSE);
        t += dt;
        if (stoss < 0 && Math.hypot(P.vx, P.vz) < vor - 1) stoss = t;
        if (stoss >= 0 && (P.tempo < 0.1 || P.vVor < 0)) break;
      }
      P.vx = 0; P.vz = 0; P.vVor = 0;
      A.kameraSofort();
      if (st.art === 'auto-nah') {
        // Ecke vorne auf der Wandseite, Kamera von der Strasse her (schräg von vorne)
        const fx = Math.sin(P.richtung), fz = Math.cos(P.richtung), lx = Math.cos(P.richtung), lz = -Math.sin(P.richtung);
        const sl = Math.sign(lx * rx + lz * rz); // Seite des Autos, die zur Wand zeigt
        const ex = P.x + fx * 2.2 + lx * sl * 0.9, ez = P.z + fz * 2.2 + lz * sl * 0.9;
        const h = A.welt.bodenBei(ex, ez).h;
        A.testKamera = { pos: [ex - rx * 3 + p.tx * 3.5, h + 1.5, ez - rz * 3 + p.tz * 3.5], ziel: [ex, h + 0.3, ez] };
      }
    } else if (st.art === 'ueberblick') {
      A.setzeAuf(st.s);
      const q = S.punktBei(st.s + 40);
      A.testKamera = { pos: [p.x - rx * 6, p.h + 7, p.z - rz * 6], ziel: [q.x + q.tz * -ws * -5, q.h + 2, q.z - q.tx * -ws * -5] };
    }
  }, st);
  for (let k = 0; k < 3; k++) await warte();
  if (bilder) await page.screenshot({ path: path.join(ordner, `${st.nr}${endung}-${st.name}.png`) });
}
await page.evaluate(() => { window.__alpineRally.testKamera = null; });

// Leistung: an festen Stellen und die schlimmste Stelle (alle 25 m)
const FEST = [['start', 12], ['2117 m (Felswand 1)', 2117], ['2300 m (Felswand 1)', 2300], ['3100 m (Abfahrt, Felswand)', 3100], ['ziel', 3560]];
for (const [name, s] of FEST) {
  await page.evaluate((s) => window.__alpineRally.setzeAuf(s), s);
  await warte();
  ergebnis.push({ stelle: name, ...(await info()) });
}
const laenge = await page.evaluate(() => window.__alpineRally.strecke.laenge);
let schlimmst = { dreiecke: 0 }, schlimmstCalls = { calls: 0 };
for (let s = 10; s < laenge - 5; s += 25) {
  await page.evaluate((s) => window.__alpineRally.setzeAuf(s), s);
  await warte();
  const z = await info();
  if (z.dreiecke > schlimmst.dreiecke) schlimmst = { ...z, s };
  if (z.calls > schlimmstCalls.calls) schlimmstCalls = { ...z, s };
}
console.log(`Version: ${wurzel === WURZEL ? 'dieses Projekt' : wurzel}`);
for (const e of ergebnis) console.log(`  ${e.stelle.padEnd(30)} Zeichenaufrufe ${String(e.calls).padStart(3)}  Dreiecke ${e.dreiecke}`);
console.log(`  meiste Dreiecke: ${schlimmst.dreiecke} bei ${schlimmst.s} m (${schlimmst.calls} Zeichenaufrufe)`);
console.log(`  meiste Zeichenaufrufe: ${schlimmstCalls.calls} bei ${schlimmstCalls.s} m (${schlimmstCalls.dreiecke} Dreiecke)`);
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`, spiel.fehler);
await spiel.schliessen();
