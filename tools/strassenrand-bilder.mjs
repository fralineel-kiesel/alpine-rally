// Screenshots und Leistungszahlen für den Strassenrand (Meilenstein 2a).
//
//   node tools/strassenrand-bilder.mjs --endung b          Screenshots nach screenshots/m2a/<nr>b-<stelle>.png
//   node tools/strassenrand-bilder.mjs --wurzel <ordner> --endung a   alte Version (vorher)
//   --keine-bilder                                         nur Zahlen (Zeichenaufrufe, Dreiecke, Ladezeit)
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
const ordner = path.join(WURZEL, 'screenshots/m2a');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
// Ladezeit: dreimal laden, Mittelwert (der erste Lauf ist oft langsamer)
const ladezeiten = [];
for (let n = 0; n < 3; n++) ladezeiten.push(await spiel.ladeSpiel());
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });

// ein paar Bilder warten, dann Zahlen lesen
const warte = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const info = () => page.evaluate(() => {
  const r = window.__alpineRally.renderer.info.render;
  return { calls: r.calls, dreiecke: r.triangles };
});

// Stellen: s = Streckenmeter (Auto steht dort, Kamera dahinter) oder freie Kamera
const STELLEN = [
  { nr: '01', name: 'start', s: 12 },
  { nr: '02', name: 'talabschnitt', s: 540 },
  { nr: '03', name: 'talabschnitt-wiese', s: 300 },
  { nr: '04', name: 'kehren-hinter-auto', s: 1475 },
  { nr: '05', name: 'kehren-von-aussen', frei: 'kehrenAussen' },
  { nr: '06', name: 'kehre-1-hinter-auto', s: 1352 },
  { nr: '07', name: 'felswand', s: 2150 },
  { nr: '08', name: 'passhoehe', s: 2586 },
  { nr: '09', name: 'abfahrt', s: 3080 },
  { nr: '10', name: 'abfahrt-schikane', s: 3175 },
  { nr: '11', name: 'ziel', s: 3560 },
  // Nahaufnahmen (nur mit Strassenrand): Kamera auf der Strasse, schaut auf das Objekt
  { nr: '12', name: 'nah-doppelkurve-vor-waldstueck', nah: 'schild:warnung:0' },
  { nr: '13', name: 'nah-kehre-1-chevrons', nah: 'schild:kehre:0' },
  { nr: '14', name: 'nah-steinschlag-gefaelle', nah: 'schild:gefahr:1' },
  { nr: '15', name: 'nah-weidetor', nah: 'tor:0' },
  { nr: '16', name: 'nah-kilometertafel', nah: 'schild:km:0' },
];

const ergebnis = [];
const mitRand = await page.evaluate(() => !!window.__alpineRally.strassenrand);
for (const st of STELLEN) {
  if (st.nah && !mitRand) continue;
  await page.evaluate(({ s, frei, nah }) => {
    const A = window.__alpineRally;
    A.testKamera = null;
    if (nah) {
      const R = A.strassenrand.plan;
      const [typ, a, b] = nah.split(':');
      let ss, x, z, y, abst = 14;
      if (typ === 'schild') { const sch = R.schilder.filter((o) => o.art === a)[+b]; ss = sch.s; x = sch.x; z = sch.z; y = sch.y + 1.6; }
      else { const t = R.tore.filter((o) => o.offen)[+a]; ss = (t.von + t.bis) / 2; const p = R.punkt(ss, t.seite * 6.4); x = p.x; z = p.z; y = A.welt.gelaendeHoehe(x, z) + 0.6; abst = 10; }
      A.setzeAuf(Math.max(5, ss - abst - 5));
      const k = R.punkt(ss - abst, 0);
      A.testKamera = { pos: [k.x, k.h + 1.7, k.z], ziel: [x, y, z] };
    } else if (frei === 'kehrenAussen') {
      // von schräg oben ausserhalb der Kehrengruppe (Südwesten) auf die vier Kehren schauen
      const p = A.strecke.punktBei(1480);
      A.setzeAuf(1480);
      const x = p.x + 95, z = p.z + 70;
      A.testKamera = { pos: [x, A.welt.gelaendeHoehe(x, z) + 38, z], ziel: [p.x - 10, p.h - 8, p.z - 10] };
    } else {
      A.setzeAuf(s);
    }
  }, st);
  await warte();
  const z = await info();
  ergebnis.push({ ...st, ...z });
  if (bilder) await page.screenshot({ path: path.join(ordner, `${st.nr}${endung}-${st.name}.png`) });
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
const rand = await page.evaluate(() => {
  const r = window.__alpineRally.strassenrand;
  return r ? r.statistik : null;
});

const mittel = Math.round(ladezeiten.slice(1).reduce((a, b) => a + b, 0) / (ladezeiten.length - 1));
console.log(`Version: ${wurzel === WURZEL ? 'dieses Projekt' : wurzel}`);
console.log(`Ladezeit (Headless, Software-Grafik): ${ladezeiten.join(' / ')} ms, Mittel ohne ersten Lauf ${mittel} ms`);
console.log('| Stelle | Zeichenaufrufe | Dreiecke |');
console.log('|---|---|---|');
for (const e of ergebnis) if (!e.nah) console.log(`| ${e.name}${e.s != null ? ` (${e.s} m)` : ''} | ${e.calls} | ${e.dreiecke} |`);
const maxCalls = durchlauf.reduce((a, b) => (b.calls > a.calls ? b : a));
const maxDr = durchlauf.reduce((a, b) => (b.dreiecke > a.dreiecke ? b : a));
console.log(`Durchlauf alle 50 m: meiste Zeichenaufrufe ${maxCalls.calls} bei ${maxCalls.s} m, meiste Dreiecke ${maxDr.dreiecke} bei ${maxDr.s} m`);
fs.writeFileSync(path.join(ordner, `zahlen-${endung}.json`), JSON.stringify({ ladezeiten, stellen: ergebnis, durchlauf, rand }, null, 1) + '\n');
if (rand) console.log('Strassenrand:', JSON.stringify(rand));
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`);
await spiel.schliessen();
