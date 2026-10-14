// Screenshots und Leistungszahlen für Meilenstein 3a.1 (Nebenweg-Korrektur).
//
//   node tools/m3a1-bilder.mjs --endung b                     Bilder nach screenshots/m3a-1/<nr>b-<stelle>.png
//   node tools/m3a1-bilder.mjs --wurzel <ordner> --endung a   alte Version (vorher), gleiche Stellen
//   --keine-bilder                                            nur Zahlen (Zeichenaufrufe, Dreiecke, Ladezeit)
//
// Bilder in 1280x720, ohne HUD. "Fahrersicht" = Auto auf der Etappe, Kamera wie im Spiel dahinter.
//   Abzweig / Einmündung aus 60, 30, 15, 8 und 4 m (Abstand des Autos zur Stelle, wo der Schotter
//   die Hauptstrasse berührt), jede Absperr-Art aus 20 m (Blick geradeaus den Stummel entlang) und
//   aus Fahrersicht 60 m vor dem Abzweig, Staub bei normaler Fahrt (ohne Drift, ohne Handbremse).
// Für die Absperr-Bilder wird die Absperrung am Abzweig der Reihe nach ausgetauscht (nur fürs Bild).
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const bilder = !process.argv.includes('--keine-bilder');
const ordner = path.join(WURZEL, 'screenshots/m3a-1');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
const ladezeiten = [];
for (let n = 0; n < 4; n++) ladezeiten.push(await spiel.ladeSpiel());
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });

const warte = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const info = () => page.evaluate(() => {
  const r = window.__alpineRally.renderer.info.render;
  return { calls: r.calls, dreiecke: r.triangles };
});

// Bezugsstellen: Abzweig = Beginn des Schotters, Einmündung = wo der Schotter die Asphaltkante erreicht
const bezug = await page.evaluate(() => {
  const N = window.__alpineRally.netz, a = N.aeste;
  const nw = N.nebenwege[0];
  const e = a.find((x) => x.art === 'einmuendung');
  return { abzweig: nw.abzweig, einmuendung: e && e.muendung ? e.muendung.sC : nw.einmuendung - 20 };
});

const STELLEN = [];
let nr = 1;
const neu = (o) => STELLEN.push({ nr: String(nr++).padStart(2, '0'), ...o });
for (const [name, s] of [['abzweig', bezug.abzweig], ['einmuendung', bezug.einmuendung]]) {
  for (const d of [60, 30, 15, 8, 4]) neu({ name: `${name}-${String(d).padStart(2, '0')}m`, s: s - d, zahl: d === 60 });
}
neu({ name: 'abzweig-von-oben', oben: bezug.abzweig + 10 });
neu({ name: 'einmuendung-von-oben', oben: bezug.einmuendung });
for (const art of ['band', 'reifen', 'heu', 'zaun']) {
  neu({ name: `absperrung-${art}-20m`, sperre: art, nah: 20 });
  neu({ name: `absperrung-${art}-fahrer-60m`, sperre: art, fahrer: 60 });
}
neu({ name: 'staub-normal-fahrt', staub: true });
// Richtungstafeln (nur neue Version): Auto 40 m davor
const tafeln = await page.evaluate(() => (window.__alpineRally.absperrungen.tafeln || []).map((t) => t.s));
tafeln.forEach((s, k) => neu({ name: `richtungstafel-${k ? 'einmuendung' : 'abzweig'}-40m`, s: s - 40 }));

const ergebnis = [];
for (const st of STELLEN) {
  await page.evaluate(async (st) => {
    const A = window.__alpineRally, S = A.strecke, N = A.netz;
    A.testKamera = null;
    if (A.__testSperre) { A.szene.remove(A.__testSperre); A.__testSperre = null; if (A.absperrungen.mesh) A.absperrungen.mesh.visible = true; }
    if (st.sperre) {
      // Absperrung am Abzweig austauschen (nur für das Bild)
      const ast = N.aeste[0], alt = ast.sperreArt;
      ast.sperreArt = st.sperre;
      const { baueAbsperrungen } = await import('/js/absperrungen.js');
      const b = baueAbsperrungen(A.szene, { ...A.welt, netz: { ...N, aeste: [ast] } });
      ast.sperreArt = alt;
      A.__testSperre = b.mesh;
      if (A.absperrungen.mesh) A.absperrungen.mesh.visible = false;
      const e = b.liste[0];
      if (st.nah) {
        A.setzeAuf(ast.sJ - 60);
        const h = A.welt.bodenBei(e.x, e.z).h;
        A.testKamera = { pos: [e.x - e.richtung[0] * st.nah, h + 1.7, e.z - e.richtung[1] * st.nah], ziel: [e.x, h + 0.9, e.z] };
      } else {
        A.setzeAuf(ast.sJ - st.fahrer);
      }
    } else if (st.oben !== undefined) {
      const p = S.punktBei(st.oben);
      A.setzeAuf(st.oben - 40);
      A.testKamera = { pos: [p.x - p.tx * 22 - p.tz * 14, p.h + 40, p.z - p.tz * 22 + p.tx * 14], ziel: [p.x + p.tx * 6, p.h, p.z + p.tz * 6] };
    } else if (st.staub) {
      // geradeaus auf dem Schotter, ca. 65 km/h, Gas halb: normale Fahrt (kein Drift)
      const p = S.punktBei(846);
      A.setzeAuf(846);
      const w = Math.atan2(p.tx, p.tz), v = 18;
      A.physik.reset(p.x, p.z, w);
      A.physik.vx = Math.sin(w) * v; A.physik.vz = Math.cos(w) * v; A.physik.vVor = v;
      const e = { gas: 0.5, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
      const dt = A.SCHRITT;
      for (let k = 0; k < Math.round(1.1 / dt); k++) {
        const z = S.abfrage(A.physik.x, A.physik.z, {});
        const p2 = S.punktBei(Math.min(S.laenge - 1, z.s + 12));
        const f = Math.atan2(p2.x - A.physik.x, p2.z - A.physik.z) - A.physik.richtung;
        e.lenkung = Math.max(-1, Math.min(1, -Math.atan2(Math.sin(f), Math.cos(f)) * 2.5));
        A.physikSchritt(dt, e);
        A.staub.aktualisiere(dt, {
          x: A.physik.x, y: A.welt.bodenBei(A.physik.x, A.physik.z).h, z: A.physik.z, richtung: A.physik.richtung,
          vx: A.physik.vx, vz: A.physik.vz, tempo: A.physik.tempo, drift: A.physik.driftWinkel, gas: e.gas, handbremse: false, schotter: true,
        });
      }
      // Kamera höher und weiter hinten, damit man die Staubspur hinter beiden Rädern sieht
      const f = { x: Math.sin(A.physik.richtung), z: Math.cos(A.physik.richtung) }, y0 = A.welt.bodenBei(A.physik.x, A.physik.z).h;
      A.testKamera = { pos: [A.physik.x - f.x * 4 - f.z * 6, y0 + 4.5, A.physik.z - f.z * 4 + f.x * 6], ziel: [A.physik.x - f.x * 9, y0 + 0.5, A.physik.z - f.z * 9] };
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

// Leistung an festen Stellen und die schlimmste Stelle (alle 25 m hinter dem Auto)
// (vorher den Staub vom Staub-Bild ausblenden, sonst zählt er als Zeichenaufruf mit)
await page.evaluate(() => window.__alpineRally.staub.aktualisiere(10, { schotter: false, tempo: 0 }));
const FEST = [['start', 12], ['700 m (vor dem Abzweig)', 700], ['900 m (im Nebenweg)', 900], ['1100 m (nach der Einmündung)', 1100], ['ziel', 3560]];
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
const mittel = Math.round(ladezeiten.slice(1).reduce((a, b) => a + b, 0) / (ladezeiten.length - 1));
console.log(`Version: ${wurzel === WURZEL ? 'dieses Projekt' : wurzel}`);
console.log(`Ladezeit (Headless, Software-Grafik): ${ladezeiten.join(' / ')} ms, Mittel ohne ersten Lauf ${mittel} ms`);
for (const e of ergebnis) console.log(`  ${e.stelle.padEnd(30)} Zeichenaufrufe ${String(e.calls).padStart(3)}  Dreiecke ${e.dreiecke}`);
console.log(`  meiste Dreiecke: ${schlimmst.dreiecke} bei ${schlimmst.s} m (${schlimmst.calls} Zeichenaufrufe)`);
console.log(`  meiste Zeichenaufrufe: ${schlimmstCalls.calls} bei ${schlimmstCalls.s} m (${schlimmstCalls.dreiecke} Dreiecke)`);
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`, spiel.fehler);
await spiel.schliessen();
