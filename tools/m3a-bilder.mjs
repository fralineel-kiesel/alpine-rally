// Screenshots und Leistungszahlen für Meilenstein 3a (Nebenweg, Absperrungen, Schotter).
//
//   node tools/m3a-bilder.mjs --endung b                     Screenshots nach screenshots/m3a/<nr>b-<stelle>.png
//   node tools/m3a-bilder.mjs --wurzel <ordner> --endung a   alte Version (vorher), gleiche Stellen
//   --keine-bilder                                           nur Zahlen (Zeichenaufrufe, Dreiecke, Ladezeit)
//
// Bilder in 1280x720, ohne HUD. Fahrerperspektive = Auto auf der Strassenmitte, Kamera wie im Spiel.
// Absperrungen (nur neue Version): jede der vier Arten aus ca. 15 m (für die Bilder wird die
// Absperrung am Abzweig der Reihe nach ausgetauscht, das Spiel selbst bleibt wie es ist).
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const bilder = !process.argv.includes('--keine-bilder');
const ordner = path.join(WURZEL, 'screenshots/m3a');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
const ladezeiten = [];
for (let n = 0; n < 4; n++) ladezeiten.push(await spiel.ladeSpiel());
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });
const neu = await page.evaluate(() => !!window.__alpineRally.netz);

const warte = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const info = () => page.evaluate(() => {
  const r = window.__alpineRally.renderer.info.render;
  return { calls: r.calls, dreiecke: r.triangles };
});

// Stellen: s = Auto steht dort (Kamera wie im Spiel dahinter), oben = Kreuzung von oben,
// sperre = Absperrart aus ca. 15 m (nur neue Version)
const STELLEN = [
  { nr: '01', name: 'start', s: 12, zahl: true },
  { nr: '02', name: '200m-vor-abzweig', s: 600 },
  { nr: '03', name: '100m-vor-abzweig', s: 700, zahl: true },
  { nr: '04', name: '40m-vor-abzweig', s: 760 },
  { nr: '05', name: 'im-abzweig', s: 808 },
  { nr: '06', name: 'mitten-im-nebenweg', s: 900, zahl: true },
  { nr: '07', name: 'vor-der-einmuendung', s: 995 },
  { nr: '08', name: 'nach-der-einmuendung', s: 1035 },
  { nr: '09', name: 'nach-der-einmuendung-100m', s: 1100, zahl: true },
  { nr: '10', name: 'abzweig-von-oben', oben: 800 },
  { nr: '11', name: 'einmuendung-von-oben', oben: 1020 },
  { nr: '12', name: 'kehren', s: 1400, zahl: true },
  { nr: '13', name: 'ziel', s: 3560, zahl: true },
  { nr: '14', name: 'absperrung-band', sperre: 'band' },
  { nr: '15', name: 'absperrung-reifen', sperre: 'reifen' },
  { nr: '16', name: 'absperrung-heu', sperre: 'heu' },
  { nr: '17', name: 'absperrung-zaun', sperre: 'zaun' },
  { nr: '18', name: 'stummel-abzweig-blick', stummelBlick: 0 },
  { nr: '19', name: 'stummel-einmuendung-blick', stummelBlick: 1 },
];

const ergebnis = [];
for (const st of STELLEN) {
  if ((st.sperre || st.stummelBlick !== undefined) && !neu) continue;
  await page.evaluate(async (st) => {
    const A = window.__alpineRally, S = A.strecke, N = A.netz;
    A.testKamera = null;
    if (A.__testSperre) { A.szene.remove(A.__testSperre); A.__testSperre = null; if (A.absperrungen.mesh) A.absperrungen.mesh.visible = true; }
    if (st.oben !== undefined) {
      const p = S.punktBei(st.oben);
      A.setzeAuf(st.oben - 40);
      A.testKamera = { pos: [p.x - p.tx * 25 - p.tz * 15, p.h + 48, p.z - p.tz * 25 + p.tx * 15], ziel: [p.x + p.tx * 8, p.h, p.z + p.tz * 8] };
    } else if (st.sperre) {
      // Absperrung am Abzweig austauschen (nur für das Bild)
      const ast = N.aeste[0], alt = ast.sperreArt;
      ast.sperreArt = st.sperre;
      const { baueAbsperrungen } = await import('/js/absperrungen.js');
      const nurDiese = { ...A.welt, netz: { ...N, aeste: [ast] } };
      const b = baueAbsperrungen(A.szene, nurDiese);
      ast.sperreArt = alt;
      A.__testSperre = b.mesh;
      if (A.absperrungen.mesh) A.absperrungen.mesh.visible = false;
      const u = ast.sperreU, i = Math.round(u - 15), j = Math.round(u);
      const pk = (k, lat, h) => [ast.px[k] - ast.tz[k] * lat, ast.py[k] + h, ast.pz[k] + ast.tx[k] * lat];
      A.setzeAuf(ast.sJ - 40);
      A.testKamera = { pos: pk(i, -1.5, 1.7), ziel: pk(j, 0, 0.6) };
    } else if (st.stummelBlick !== undefined) {
      // Fahrerblick am Rand der Kreuzung in den Stummel hinein
      const ast = N.aeste[st.stummelBlick];
      const pk = (k, lat, h) => [ast.px[k] - ast.tz[k] * lat, ast.py[k] + h, ast.pz[k] + ast.tx[k] * lat];
      A.setzeAuf(ast.sJ);
      A.testKamera = { pos: pk(2, 0, 2.5), ziel: pk(Math.round(ast.sperreU + 25), 0, 1.0) };
    } else {
      A.setzeAuf(st.s);
    }
  }, st);
  await warte();
  const z = await info();
  if (bilder) await page.screenshot({ path: path.join(ordner, `${st.nr}${endung}-${st.name}.png`) });
  if (st.zahl) ergebnis.push({ stelle: st.name, ...z });
}
await page.evaluate(() => { const A = window.__alpineRally; if (A.__testSperre) { A.szene.remove(A.__testSperre); A.absperrungen.mesh.visible = true; } A.testKamera = null; });

// Schlimmste Stelle: alle 25 m hinter dem Auto
const laenge = await page.evaluate(() => window.__alpineRally.strecke.laenge);
let schlimmst = { calls: 0, dreiecke: 0 }, schlimmstCalls = { calls: 0 };
for (let s = 10; s < laenge - 5; s += 25) {
  await page.evaluate((s) => window.__alpineRally.setzeAuf(s), s);
  await warte();
  const z = await info();
  if (z.dreiecke > schlimmst.dreiecke) schlimmst = { ...z, s };
  if (z.calls > schlimmstCalls.calls) schlimmstCalls = { ...z, s };
}
const mittel = Math.round(ladezeiten.slice(1).reduce((a, b) => a + b, 0) / (ladezeiten.length - 1));
console.log(`Version: ${wurzel === WURZEL ? 'dieses Projekt' : wurzel}`);
console.log(`Ladezeit (Headless, Software-Grafik): ${ladezeiten.join(' / ')} ms, Mittel ohne ersten Lauf ${mittel} ms`);
for (const e of ergebnis) console.log(`  ${e.stelle.padEnd(28)} Zeichenaufrufe ${String(e.calls).padStart(3)}  Dreiecke ${e.dreiecke}`);
console.log(`  meiste Dreiecke: ${schlimmst.dreiecke} bei ${schlimmst.s} m (${schlimmst.calls} Zeichenaufrufe)`);
console.log(`  meiste Zeichenaufrufe: ${schlimmstCalls.calls} bei ${schlimmstCalls.s} m (${schlimmstCalls.dreiecke} Dreiecke)`);
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`, spiel.fehler);
await spiel.schliessen();
