// Screenshots und Leistungszahlen für Meilenstein 2b (Kühe, Büsche, Wald in der Ferne).
//
//   node tools/m2b-bilder.mjs --endung b                       Screenshots nach screenshots/m2b/<nr>b-<stelle>.png
//   node tools/m2b-bilder.mjs --wurzel <ordner> --endung a     alte Version (vorher), gleiche Kameras
//   --keine-bilder                                             nur Zahlen (Zeichenaufrufe, Dreiecke, Ladezeit)
//
// Bilder in 1280x720, ohne HUD. Zahlen: Zeichenaufrufe und Dreiecke aus renderer.info
// (hinter dem Auto), dazu ein Durchlauf alle 50 m über die ganze Strecke (schlimmste Stelle).
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const bilder = !process.argv.includes('--keine-bilder');
const ordner = path.join(WURZEL, 'screenshots/m2b');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
// Ladezeit: viermal laden, Mittelwert ohne den ersten Lauf (der ist oft langsamer)
const ladezeiten = [];
for (let n = 0; n < 4; n++) ladezeiten.push(await spiel.ladeSpiel());
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });

const warte = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const info = () => page.evaluate(() => {
  const r = window.__alpineRally.renderer.info.render;
  return { calls: r.calls, dreiecke: r.triangles };
});

// Stellen: s = Streckenmeter (Auto steht dort, Kamera dahinter) oder freie Kamera
// (k = [s, seitlich, Höhe über der Strasse], blick = [s, seitlich, Höhe] wohin geschaut wird)
const STELLEN = [
  { nr: '01', name: 'start', s: 12, zahl: true },
  { nr: '02', name: 'weide-tal-hinter-auto', s: 700, zahl: true },
  { nr: '03', name: 'weide-tal-seitlich', k: [812, 1, 2], blick: [838, 30, 0.5] },
  { nr: '04', name: 'kehren-hinter-auto', s: 1400, zahl: true },
  { nr: '05', name: 'kehren-von-oben', frei: 'kehrenOben' },
  { nr: '06', name: 'passhoehe', s: 2586, zahl: true },
  { nr: '07', name: 'alpwiese-seitlich', k: [2596, 1, 2], blick: [2619, 30, 0.5] },
  { nr: '08', name: 'abfahrt', s: 3080 },
  { nr: '09', name: 'ziel', s: 3560, zahl: true },
  { nr: '10', name: 'tal-von-oben', frei: 'talOben' },
  { nr: '11', name: 'pass-von-oben', frei: 'passOben' },
];

const ergebnis = [];
for (const st of STELLEN) {
  await page.evaluate((st) => {
    const A = window.__alpineRally, S = A.strecke;
    A.testKamera = null;
    const punkt = (s, lat, hoch) => { const p = S.punktBei(s); return [p.x - p.tz * lat, p.h + hoch, p.z + p.tx * lat]; };
    if (st.k) {
      A.setzeAuf(Math.max(5, st.k[0] - 30));
      A.testKamera = { pos: punkt(...st.k), ziel: punkt(...st.blick) };
    } else if (st.frei === 'kehrenOben') {
      // von schräg oben ausserhalb der Kehrengruppe auf die vier Kehren und den Hang dahinter
      const p = S.punktBei(1480);
      A.setzeAuf(1480);
      const x = p.x + 140, z = p.z + 120;
      A.testKamera = { pos: [x, A.welt.gelaendeHoehe(x, z) + 70, z], ziel: [p.x - 60, p.h - 10, p.z - 60] };
    } else if (st.frei === 'talOben') {
      // hoch über dem Tal (bei 400 m), Blick die Strecke entlang auf die Hänge
      const p = S.punktBei(400), z = S.punktBei(1100);
      A.setzeAuf(400);
      A.testKamera = { pos: [p.x - 60, p.h + 90, p.z + 80], ziel: [z.x, z.h + 20, z.z] };
    } else if (st.frei === 'passOben') {
      const p = S.punktBei(2600), z = S.punktBei(3300);
      A.setzeAuf(2600);
      A.testKamera = { pos: [p.x - 80, p.h + 80, p.z + 60], ziel: [z.x, z.h, z.z] };
    } else {
      A.setzeAuf(st.s);
    }
  }, st);
  await warte();
  const z = await info();
  ergebnis.push({ ...st, ...z });
  if (bilder) await page.screenshot({ path: path.join(ordner, `${st.nr}${endung}-${st.name}.png`) });
}

// Nahaufnahmen der Kühe (nur neue Version): eine Kuh aus 7 m von vorne, Seite, hinten
const nah = await page.evaluate(() => {
  const A = window.__alpineRally;
  if (!A.kuehe || !A.kuehe.kuehe.length) return [];
  const K = A.kuehe.kuehe;
  // eine stehende Kuh nahe der Strasse und eine liegende
  const wahl = [K.filter((k) => k.pose === 0).sort((a, b) => a.abstand - b.abstand)[0], K.find((k) => k.pose === 2), K.find((k) => k.pose === 1)].filter(Boolean);
  return wahl.map((k) => ({ x: k.x, y: k.y, z: k.z, blick: k.blick, pose: k.pose, art: k.art }));
});
let nn = 0;
for (const k of nah) {
  for (const [name, w] of [['vorne', 0], ['schraeg', 0.8], ['seite', Math.PI / 2], ['hinten', Math.PI]]) {
    if (k.pose !== 0 && name !== 'seite' && name !== 'schraeg') continue;
    await page.evaluate(({ k, w }) => {
      const A = window.__alpineRally;
      const a = k.blick + w, d = 7;
      const x = k.x + Math.sin(a) * d, z = k.z + Math.cos(a) * d;
      A.testKamera = { pos: [x, Math.max(A.welt.gelaendeHoehe(x, z), k.y) + 1.6, z], ziel: [k.x, k.y + 0.8, k.z] };
    }, { k, w });
    await warte();
    if (bilder) await page.screenshot({ path: path.join(ordner, `12${endung}-kuh${nn}-${['stehend', 'grasend', 'liegend'][k.pose]}-${name}.png`) });
  }
  nn++;
}
await page.evaluate(() => { window.__alpineRally.testKamera = null; });

// ganze Strecke alle 50 m hinter dem Auto: schlimmste Stelle
const durchlauf = [];
const laenge = await page.evaluate(() => window.__alpineRally.strecke.laenge);
for (let s = 10; s < laenge - 10; s += 50) {
  await page.evaluate((s) => window.__alpineRally.setzeAuf(s), s);
  await warte();
  durchlauf.push({ s, ...(await info()) });
}
const stat = await page.evaluate(() => {
  const A = window.__alpineRally;
  return { kuehe: A.kuehe ? A.kuehe.statistik : null, deko: A.deko ? A.deko.statistik : null, hindernisse: A.kollision.anzahl };
});

const mittel = Math.round(ladezeiten.slice(1).reduce((a, b) => a + b, 0) / (ladezeiten.length - 1));
console.log(`Version: ${wurzel === WURZEL ? 'dieses Projekt' : wurzel}`);
console.log(`Ladezeit (Headless, Software-Grafik): ${ladezeiten.join(' / ')} ms, Mittel ohne ersten Lauf ${mittel} ms`);
console.log('| Stelle | Zeichenaufrufe | Dreiecke |');
console.log('|---|---|---|');
for (const e of ergebnis) if (e.zahl) console.log(`| ${e.name} (${e.s} m) | ${e.calls} | ${e.dreiecke} |`);
const maxCalls = durchlauf.reduce((a, b) => (b.calls > a.calls ? b : a));
const maxDr = durchlauf.reduce((a, b) => (b.dreiecke > a.dreiecke ? b : a));
console.log(`Durchlauf alle 50 m: meiste Zeichenaufrufe ${maxCalls.calls} bei ${maxCalls.s} m, meiste Dreiecke ${maxDr.dreiecke} bei ${maxDr.s} m`);
console.log('Statistik:', JSON.stringify(stat));
fs.writeFileSync(path.join(ordner, `zahlen-${endung}.json`), JSON.stringify({ ladezeiten, stellen: ergebnis, durchlauf, stat }, null, 1) + '\n');
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`);
await spiel.schliessen();
