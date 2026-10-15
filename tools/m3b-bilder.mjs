// Screenshots und Leistungszahlen für Meilenstein 3b (Almweg und Wiesenweg).
//
//   node tools/m3b-bilder.mjs --endung b                     Bilder nach screenshots/m3b/<nr>b-<stelle>.png
//   node tools/m3b-bilder.mjs --wurzel <ordner> --endung a   alte Version (vorher), gleiche Streckenmeter
//   --keine-bilder                                            nur Zahlen (Zeichenaufrufe, Dreiecke)
//
// Bilder in 1280x720, ohne HUD. "Fahrersicht" = Auto auf der Etappe, Kamera wie im Spiel dahinter.
//   Je Nebenweg: Abzweig und Einmündung aus 60, 30 und 15 m (Abstand des Autos zur Stelle, wo der Belag
//   des Nebenwegs beginnt bzw. die Asphaltkante erreicht), mitten im Weg, Fahrersicht mit Stummel
//   (25 m vor dem Abzweig, Blick in den Stummel mit Absperrung; auf dem Nebenweg 25 m vor der
//   Einmündung), Staub bei normaler Fahrt, jede Absperrung aus 20 m (Blick den Stummel entlang).
// Die Streckenmeter rechnet die neue Version aus und legt sie in screenshots/m3b/stellen.json ab
// (die alte Version hat diese Nebenwege nicht und nimmt dieselben Meter).
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const bilder = !process.argv.includes('--keine-bilder');
const ordner = path.join(WURZEL, 'screenshots/m3b');
fs.mkdirSync(ordner, { recursive: true });
const stellenDatei = path.join(ordner, 'stellen.json');

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
await spiel.ladeSpiel();
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });
const warte = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const info = () => page.evaluate(() => { const r = window.__alpineRally.renderer.info.render; return { calls: r.calls, dreiecke: r.triangles }; });

// Bezugsstellen (nur die neue Version kennt sie)
let bezug;
if (wurzel === WURZEL) {
  bezug = await page.evaluate(() => {
    const N = window.__alpineRally.netz, A = window.__alpineRally;
    return N.nebenwege.filter((w) => w.name !== 'Talschleife').map((w) => {
      const ab = N.aeste.find((a) => a.nebenweg === w && a.art === 'abzweig');
      const ein = N.aeste.find((a) => a.nebenweg === w && a.art === 'einmuendung');
      const sperren = A.absperrungen.liste.filter((e) => e.art !== 'richtungstafel' && (e.ast === ab.nr || e.ast === ein.nr))
        .map((e) => ({ ast: e.ast, art: e.art, x: e.x, z: e.z, richtung: e.richtung }));
      return { name: w.name, belag: w.belag, abzweig: w.abzweig, einmuendung: ein.muendung ? ein.muendung.sC : w.einmuendung - 20, ende: w.einmuendung, sperren };
    });
  });
  fs.writeFileSync(stellenDatei, JSON.stringify(bezug, null, 1));
} else {
  bezug = JSON.parse(fs.readFileSync(stellenDatei, 'utf8'));
}

const STELLEN = [];
let nr = 1;
const neu = (o) => STELLEN.push({ nr: String(nr++).padStart(2, '0'), ...o });
for (const w of bezug) {
  const k = w.name.toLowerCase();
  for (const d of [60, 30, 15]) neu({ name: `${k}-abzweig-${d}m`, s: w.abzweig - d });
  neu({ name: `${k}-fahrersicht-stummel-abzweig`, s: w.abzweig - 25, blickStummel: true, ast: w.sperren[0] && w.sperren[0].ast });
  neu({ name: `${k}-mitte`, s: (w.abzweig + w.ende) / 2 });
  neu({ name: `${k}-fahrersicht-vor-einmuendung`, s: w.einmuendung - 25 });
  for (const d of [60, 30, 15]) neu({ name: `${k}-einmuendung-${d}m`, s: w.einmuendung - d });
  neu({ name: `${k}-staub`, staub: (w.abzweig + w.ende) / 2 + 20, belag: w.belag });
  for (const sp of w.sperren) neu({ name: `${k}-absperrung-${sp.art}-20m`, sperre: sp });
}

for (const st of STELLEN) {
  await page.evaluate((st) => {
    const A = window.__alpineRally, S = A.strecke;
    A.testKamera = null;
    if (st.sperre) {
      const e = st.sperre;
      A.setzeAuf(Math.max(0, S.abfrage(e.x, e.z).s - 60));
      const h = A.welt.bodenBei(e.x, e.z).h;
      // in der alten Version gibt es die Absperrung nicht: gleiche Stelle, gleicher Blick
      const kx = e.x - e.richtung[0] * 20, kz = e.z - e.richtung[1] * 20;
      A.testKamera = { pos: [kx, Math.max(h, A.welt.bodenBei(kx, kz).h) + 1.7, kz], ziel: [e.x, h + 0.9, e.z] };
    } else if (st.staub !== undefined) {
      // geradeaus, ca. 65 km/h, Gas halb (wie in M3a.1): normale Fahrt
      const p = S.punktBei(st.staub);
      A.setzeAuf(st.staub);
      const w = Math.atan2(p.tx, p.tz), v = 18;
      A.physik.reset(p.x, p.z, w);
      A.physik.vx = Math.sin(w) * v; A.physik.vz = Math.cos(w) * v; A.physik.vVor = v;
      const e = { gas: 0.5, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
      for (let k = 0; k < Math.round(1.1 / A.SCHRITT); k++) {
        const z = S.abfrage(A.physik.x, A.physik.z, {});
        const p2 = S.punktBei(Math.min(S.laenge - 1, z.s + 12));
        const f = Math.atan2(p2.x - A.physik.x, p2.z - A.physik.z) - A.physik.richtung;
        e.lenkung = Math.max(-1, Math.min(1, -Math.atan2(Math.sin(f), Math.cos(f)) * 2.5));
        A.physikSchritt(A.SCHRITT, e);
        const art = A.welt.bodenBei(A.physik.x, A.physik.z).art;
        A.staub.aktualisiere(A.SCHRITT, {
          x: A.physik.x, y: A.welt.bodenBei(A.physik.x, A.physik.z).h, z: A.physik.z, richtung: A.physik.richtung,
          vx: A.physik.vx, vz: A.physik.vz, tempo: A.physik.tempo, drift: A.physik.driftWinkel, gas: e.gas, handbremse: false,
          schotter: !!(A.CONFIG.staub.belaege ? A.CONFIG.staub.belaege[art] : art === 'schotter'), belag: art,
        });
      }
      const f = { x: Math.sin(A.physik.richtung), z: Math.cos(A.physik.richtung) }, y0 = A.welt.bodenBei(A.physik.x, A.physik.z).h;
      A.testKamera = { pos: [A.physik.x - f.x * 4 - f.z * 6, y0 + 4.5, A.physik.z - f.z * 4 + f.x * 6], ziel: [A.physik.x - f.x * 9, y0 + 0.5, A.physik.z - f.z * 9] };
    } else {
      A.setzeAuf(st.s);
      if (st.blickStummel) {
        // Auto schaut von der Etappe in den Stummel (geradeaus, wo es nicht weitergeht)
        const ast = A.netz.aeste.find((a) => a.nr === st.ast && a.sperre);
        if (ast) {
          const p = S.punktBei(st.s), i = Math.min(ast.anzahl - 1, 40);
          A.physik.reset(p.x, p.z, Math.atan2(ast.px[i] - p.x, ast.pz[i] - p.z));
          A.kameraSofort();
        }
      }
    }
  }, st);
  await warte(); await warte();
  if (bilder) await page.screenshot({ path: path.join(ordner, `${st.nr}${endung}-${st.name}.png`) });
}
await page.evaluate(() => { const A = window.__alpineRally; A.testKamera = null; A.staub.aktualisiere(10, { schotter: false, tempo: 0 }); });

// Leistung an festen Stellen (Auto dort, Kamera wie im Spiel) und die schlimmste Stelle (alle 25 m)
const ergebnis = [];
const FEST = [['Start', 12], ['Nebenweg 1 (900 m)', 900], ['Almweg (2150 m)', 2150], ['Wiesenweg (2950 m)', 2950], ['Ziel (30 m vor der Linie)', -30]];
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
