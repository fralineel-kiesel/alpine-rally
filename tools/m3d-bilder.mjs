// Screenshots und Leistungszahlen für Meilenstein 3d (Leben an der Strecke).
//
//   node tools/m3d-bilder.mjs --endung b                     Bilder nach screenshots/m3d/<nr>b-<stelle>.png
//   node tools/m3d-bilder.mjs --wurzel <ordner> --endung a   alte Version (vorher), gleiche Kamerastellen
//   --keine-bilder                                            nur Zahlen (Zeichenaufrufe, Dreiecke)
//
// Bilder in 1280x720, ohne HUD. Die Kamerastellen rechnet die neue Version aus (Orte aus config.js, Block
// "leben") und legt sie in screenshots/m3d/stellen.json ab; die alte Version nimmt dieselben.
//   Wiesenweg: von hinter dem Auto (Fahrersicht), von weitem, aus der Nähe (Hütte)
//   Fan-Spots: Fahrersicht (Auto 35 m davor) und aus ca. 30 m
//   Wracks: aus 60, 30 und 10 m (Kamera auf der Strasse, Blick zum Wrack), dazu Fahrersicht
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const bilder = !process.argv.includes('--keine-bilder');
const ordner = path.join(WURZEL, 'screenshots/m3d');
fs.mkdirSync(ordner, { recursive: true });
const stellenDatei = path.join(ordner, 'stellen.json');

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
await spiel.ladeSpiel();
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });
const warte = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const info = () => page.evaluate(() => { const r = window.__alpineRally.renderer.info.render; return { calls: r.calls, dreiecke: r.triangles }; });

// Kamerastellen (nur die neue Version kennt die Orte)
let stellen;
if (wurzel === WURZEL) {
  stellen = await page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, L = A.CONFIG.leben, W = A.welt;
    const pk = (s, lat) => { const p = S.punktBei(s); return [p.x - p.tz * lat, p.z + p.tx * lat]; };
    const h = (x, z) => W.gelaendeHoehe(x, z);
    const blick = (pos, ziel) => ({ pos, ziel });
    const aus = [];
    // Kamera auf der Strassenmitte, d Meter (Luftlinie) vor dem Ziel (x, z), 1.7 m hoch
    const vonStrasse = (s0, x, z, d, hoch = 1.7) => {
      let s = s0;
      for (let k = 0; k < 400; k++) { const [a, b] = pk(s, 0); if (Math.hypot(a - x, b - z) >= d) break; s -= 0.5; }
      const [a, b] = pk(s, 0);
      return { s, kamera: blick([a, h(a, b) + hoch, b], [x, h(x, z) + 0.9, z]) };
    };
    // Wiesenweg
    const hu = L.wiesenweg.huette, [hx, hz] = pk(hu.s, hu.seite * hu.lat);
    aus.push({ name: 'wiesenweg-fahrersicht', fahrer: 2940 });
    aus.push({ name: 'wiesenweg-fahrersicht-2', fahrer: 2870 });
    {
      const [a, b] = pk(2905, 34);
      aus.push({ name: 'wiesenweg-von-weitem', auto: 2950, kamera: blick([a, h(a, b) + 26, b], [hx, h(hx, hz) - 4, hz]) });
    }
    {
      const [a, b] = pk(hu.s - 8, hu.seite * 24);
      aus.push({ name: 'wiesenweg-huette-nah', auto: hu.s - 20, kamera: blick([a, h(a, b) + 2, b], [hx, h(hx, hz) + 1.5, hz]) });
    }
    {
      const st = L.wiesenweg.stadel, [sx, sz] = pk(st.s, st.seite * st.lat), [a, b] = pk(st.s - 48, st.seite * 10);
      aus.push({ name: 'wiesenweg-stadel-heurollen', auto: st.s - 30, kamera: blick([a, h(a, b) + 2.5, b], [sx, h(sx, sz) + 1, sz]) });
    }
    // Fan-Spots: Fahrersicht 20 m vor dem Spot; dazu Kamera auf der Strasse ca. 30 m vor der Mitte der Fans
    for (const sp of L.fans.spots) {
      const fig = A.leben.figuren.filter((f) => f.ort === sp.name);
      const fx = fig.reduce((m, f) => m + f.x, 0) / fig.length, fz = fig.reduce((m, f) => m + f.z, 0) / fig.length;
      aus.push({ name: `fans-${sp.name}-fahrersicht`, fahrer: sp.s[0] - 20 });
      const v = vonStrasse(S.abfrage(fx, fz, {}).s, fx, fz, 30, 4);
      aus.push({ name: `fans-${sp.name}-30m`, auto: Math.max(5, v.s - 12), kamera: v.kamera });
    }
    // Wracks
    for (const w of A.leben.wracks) {
      for (const d of [60, 30, 10]) {
        const v = vonStrasse(w.s, w.x, w.z, d);
        aus.push({ name: `wrack-${w.name}-${d}m`, auto: Math.max(5, v.s - 12), kamera: v.kamera });
      }
      aus.push({ name: `wrack-${w.name}-fahrersicht`, fahrer: w.s - 30 });
    }
    return aus;
  });
  fs.writeFileSync(stellenDatei, JSON.stringify(stellen, null, 1));
} else {
  stellen = JSON.parse(fs.readFileSync(stellenDatei, 'utf8'));
}

let nr = 1;
for (const st of stellen) {
  await page.evaluate((st) => {
    const A = window.__alpineRally;
    A.testKamera = null;
    if (st.fahrer !== undefined) { A.setzeAuf(st.fahrer); return; }
    A.setzeAuf(st.auto);
    A.testKamera = st.kamera;
  }, st);
  await warte(); await warte();
  if (bilder) await page.screenshot({ path: path.join(ordner, `${String(nr).padStart(2, '0')}${endung}-${st.name}.png`) });
  nr++;
}
await page.evaluate(() => { window.__alpineRally.testKamera = null; });

// Leistung an festen Stellen (Auto dort, Kamera wie im Spiel) und die schlimmste Stelle (alle 25 m)
const ergebnis = [];
const FEST = [['Start', 12], ['Kehren (1650 m)', 1650], ['Kehren-Fans (1690 m)', 1690], ['Passhöhe (2590 m)', 2590], ['Wrack Abfahrt (2470 m)', 2470],
  ['Wiesenweg (2950 m)', 2950], ['Wrack Tal (610 m)', 610], ['Ziel (30 m vor der Linie)', -30]];
for (const [name, s0] of FEST) {
  await page.evaluate((s0) => { const S = window.__alpineRally.strecke; window.__alpineRally.setzeAuf(s0 < 0 ? S.zielS + s0 : s0); }, s0);
  await warte(); await warte();
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
for (const e of ergebnis) console.log(`  ${e.stelle.padEnd(28)} Zeichenaufrufe ${String(e.calls).padStart(3)}  Dreiecke ${e.dreiecke}`);
console.log(`  meiste Dreiecke: ${schlimmst.dreiecke} bei ${schlimmst.s} m (${schlimmst.calls} Zeichenaufrufe)`);
console.log(`  meiste Zeichenaufrufe: ${schlimmstCalls.calls} bei ${schlimmstCalls.s} m (${schlimmstCalls.dreiecke} Dreiecke)`);
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`, spiel.fehler);
await spiel.schliessen();
