// Screenshots und Leistungszahlen für Meilenstein 3c (Start- und Zielbereich).
//
//   node tools/m3c-bilder.mjs --endung b                     Bilder nach screenshots/m3c/<nr>b-<stelle>.png
//   node tools/m3c-bilder.mjs --wurzel <ordner> --endung a   alte Version (vorher), gleiche Stellen
//   --keine-bilder                                            nur Zahlen (Zeichenaufrufe, Dreiecke)
//
// Bilder in 1280x720, ohne HUD. Stellen (m = Meter ab Strassenanfang; negativ = hinter dem Start,
// grösser als die Streckenlänge = nach dem Strassenende, auf der Verlängerung):
//   01 Startaufstellung aus Fahrersicht   02 Start von hinten/oben   03 Blick rückwärts (Auto gewendet)
//   04 Zieleinfahrt aus 100 m             05 aus 30 m                06 nach dem Ziel beim Ausrollen
//   07 Ende der Ausrollzone               08 Start von der Seite     09 Ziel von oben
//   10 Servicepark hinter der Absperrung  11 Zeitnahme-Container     12 Zuschauer aus der Nähe
//   13 Zielbogen aus 12 m
// Leistung (Zeichenaufrufe/Dreiecke) dazu an Start, Ziel und Streckenmitte, Kamera wie im Spiel.
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const bilder = !process.argv.includes('--keine-bilder');
const ordner = path.join(WURZEL, 'screenshots/m3c');
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

// art: 'auto' = Auto steht dort (Blick in Fahrtrichtung, Kamera wie im Spiel), 'wenden' = Auto um 180° gedreht,
// 'kamera' = freie Kamera (pos: [m, seitlich, Höhe], ziel: [m, seitlich, Höhe])
const STELLEN = [
  { nr: '01', name: 'start-fahrersicht', m: 10, art: 'auto', zahl: 'Start' },
  { nr: '02', name: 'start-von-hinten-oben', art: 'kamera', pos: [-45, 0, 22], ziel: [35, 0, 0] },
  { nr: '03', name: 'start-blick-rueckwaerts', m: 10, art: 'wenden' },
  { nr: '04', name: 'zieleinfahrt-100m', zm: -100, art: 'auto' },
  { nr: '05', name: 'zieleinfahrt-30m', zm: -30, art: 'auto', zahl: 'Ziel' },
  { nr: '06', name: 'nach-dem-ziel-ausrollen', zm: 70, art: 'auto' },
  { nr: '07', name: 'ende-ausrollzone', zm: 175, art: 'auto' },
  { nr: '08', name: 'start-von-der-seite', art: 'kamera', pos: [5, -32, 9], ziel: [22, 2, 2] },
  { nr: '09', name: 'ziel-von-oben', art: 'kamera', zpos: [-60, 18, 35], zziel: [40, 0, 0] },
  { nr: '10', name: 'servicepark-hinter-der-absperrung', art: 'kamera', pos: [-62, 16, 6], ziel: [-40, 2, 1] },
  { nr: '11', name: 'ziel-container-nah', art: 'kamera', zpos: [-4, 3, 2.2], zziel: [8, -11, 1.5] },
  { nr: '12', name: 'zuschauer-nah', art: 'kamera', pos: [38, 2.5, 1.7], ziel: [52, 9, 1.2] },
  { nr: '13', name: 'zielbogen-nah', zm: -12, art: 'auto' },
  { nr: '14', name: 'mitte', m: 1835, art: 'auto', zahl: 'Mitte', ohneBild: true },
];

const ergebnis = [];
for (const st of STELLEN) {
  await page.evaluate((st) => {
    const A = window.__alpineRally, S = A.strecke, N = A.netz;
    A.testKamera = null;
    // Punkt bei m Metern: auf der Etappe, sonst auf der Verlängerung (neue Version) oder gerade weiter (alte)
    const punkt = (m) => {
      const ende = m < 0 ? 'start' : m > S.laenge ? 'ziel' : null;
      if (!ende) return S.punktBei(m);
      const u = ende === 'start' ? -m : m - S.laenge;
      const ast = N.aeste.find((a) => a.art === (ende === 'start' ? 'startVerl' : 'zielVerl'));
      if (ast) {
        const i = Math.min(ast.anzahl - 1, Math.round(u));
        const r = ende === 'start' ? -1 : 1; // Fahrtrichtung der Etappe
        return { x: ast.px[i], h: ast.py[i], z: ast.pz[i], tx: ast.tx[i] * r, tz: ast.tz[i] * r };
      }
      const p = S.punktBei(ende === 'start' ? 0 : S.laenge);
      const d = ende === 'start' ? -u : u;
      return { x: p.x + p.tx * d, h: p.h, z: p.z + p.tz * d, tx: p.tx, tz: p.tz };
    };
    const m = st.zm !== undefined ? S.zielS + st.zm : st.m;
    const neben = (p, lat) => [p.x - p.tz * lat, p.z + p.tx * lat];
    if (st.art === 'auto' || st.art === 'wenden') {
      const p = punkt(m);
      const w = Math.atan2(p.tx, p.tz) + (st.art === 'wenden' ? Math.PI : 0);
      A.setzeAuf(Math.max(0, Math.min(S.laenge, m)));
      A.physik.reset(p.x, p.z, w);
      A.kameraSofort();
    } else {
      A.setzeAuf(10);
      const pm = (v) => (st.zpos ? S.zielS + v : v);
      const a = st.zpos || st.pos, b = st.zziel || st.ziel;
      const pa = punkt(pm(a[0])), pb = punkt(pm(b[0]));
      const [ax, az] = neben(pa, a[1]), [bx, bz] = neben(pb, b[1]);
      A.testKamera = { pos: [ax, pa.h + a[2], az], ziel: [bx, pb.h + b[2], bz] };
    }
  }, st);
  await warte(); await warte();
  const z = await info();
  if (st.zahl) ergebnis.push({ stelle: st.zahl, ...z });
  if (bilder && !st.ohneBild) await page.screenshot({ path: path.join(ordner, `${st.nr}${endung}-${st.name}.png`) });
  console.log(`${st.nr} ${st.name}: ${z.calls} Zeichenaufrufe, ${z.dreiecke} Dreiecke`);
}
console.log('Leistung:', JSON.stringify(ergebnis));
if (spiel.fehler.length) console.log('Fehler im Spiel:', spiel.fehler);
await spiel.schliessen();
