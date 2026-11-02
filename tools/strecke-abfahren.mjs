// Strecke mit dem Testfahrer abfahren (M10a):  node tools/strecke-abfahren.mjs <datei> [--auto <id>] [--aus <datei.txt>]
// Lädt das Spiel im Headless-Chromium mit dieser Streckendatei (statt strecken/alpen.js) und lässt den vorhandenen
// Testfahrer (tools/testfahrer-browser.js, fahreEtappe – nicht neu geschrieben) die Etappe in der echten Physik fahren,
// in den drei Stilen vorsichtig / mittel / flott wie tools/testfahrer.mjs. Meldet Gesamtzeit, Zwischenzeiten, Aufpralle,
// Stellen mit Abkommen (Gras), Wandnähe (Felswand) und Stillstand, höchstes Tempo je Abschnitt.
// Ganze Ausgabe in die Datei (Standard /tmp/strecke-abfahren-<id>-<auto>.txt), im Terminal nur die Zusammenfassung.
// Für die Alpen muss es die Zeiten von tools/testfahrer.mjs treffen (Beleg, Test (l) in tools/m10a-test.mjs).

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL, AUTO } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const datei = process.argv.slice(2).find((a, i, l) => !a.startsWith('--') && !(l[i - 1] || '').startsWith('--'));
if (!datei || !fs.existsSync(datei)) { console.log('Aufruf: node tools/strecke-abfahren.mjs <datei> [--auto <id>] [--aus <datei.txt>]'); process.exit(1); }
const inhalt = fs.readFileSync(datei, 'utf8');
const id = (/id: '([^']+)'/.exec(inhalt) || [])[1] || path.basename(datei, '.js');
const aus = arg('--aus') || `/tmp/strecke-abfahren-${id}-${AUTO}.txt`;
const fmt = (t) => (t == null ? '--' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);

const spiel = await starteSpiel();
// Streckendatei unterschieben: das Spiel lädt sie über window.__streckeAdresse (js/strecken.js, nur für Werkzeuge)
await spiel.page.route('**/__strecke/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: inhalt }));
await spiel.page.addInitScript((n) => { window.__streckeAdresse = `${location.origin}/__strecke/${n}`; }, path.basename(datei));
const fehlerSeite = [];
spiel.page.on('pageerror', (e) => fehlerSeite.push(String(e.message || e)));
await spiel.page.goto(`${spiel.url}/index.html?menue=aus&ton=aus`);
await spiel.page.waitForFunction(() => window.__alpineRally || window.__fehlerseite, null, { timeout: 180000, polling: 100 });
const fs0 = await spiel.page.evaluate(() => window.__fehlerseite || null);
if (fs0) { console.log(`FEHLER: Strecke lässt sich nicht laden (${fs0.grund}): ${fs0.mehr}`); await spiel.schliessen(); process.exit(1); }
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
await spiel.page.evaluate((code) => { window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }, fahrerCode);

const zeilen = [`Strecke ${id} (${datei}), Fahrprofil ${AUTO}`];
const zeiten = [];
let probleme = 0;
for (const profil of ['vorsichtig', 'mittel', 'flott']) {
  const r = await spiel.page.evaluate(async (profil) => {
    const f = await import(window.__fahrerUrl);
    const A = window.__alpineRally, S = A.strecke, C = A.CONFIG, q = {};
    const ab = S.abschnitte.map((a) => ({ name: a.name, von: a.von, bis: a.bis, max: 0 }));
    const gras = [], wand = [], stand = [];
    let grasAn = null, wandAn = null, standT = 0, standS = null;
    // je Schritt nur lesen (die Physik merkt nichts davon)
    const proSchritt = () => {
      if (A.rennen.zustand !== 'laeuft') return;
      const p = A.physik, s = A.rennen.letztesS;
      S.abfrage(p.x, p.z, q);
      const a = ab[S.abschnittNr[Math.max(0, Math.min(S.anzahl - 1, Math.round(q.s)))]];
      if (a) a.max = Math.max(a.max, p.tempo * 3.6);
      const art = A.welt.bodenBei(p.x, p.z, q).art; // (q: Ergebnis der Streckenabfrage, wie im Testfahrer)
      if (art === 'gras') { if (grasAn == null) grasAn = s; } else if (grasAn != null) { gras.push([grasAn, s]); grasAn = null; }
      const anWand = q.wandSeite !== 0 && q.wandStaerke > 0.5 && Math.sign(q.seite) === q.wandSeite && Math.abs(q.seite) > C.grenze.wandGrenze - 0.3;
      if (anWand) { if (wandAn == null) wandAn = s; } else if (wandAn != null) { wand.push([wandAn, s]); wandAn = null; }
      if (p.tempo < 0.5) { standT += A.SCHRITT; if (standS == null) standS = s; } else { if (standT > 1 && standS != null) stand.push([standS, standT]); standT = 0; standS = null; }
    };
    const e = f.fahreEtappe(A, profil, proSchritt);
    if (grasAn != null) gras.push([grasAn, A.rennen.letztesS]);
    if (wandAn != null) wand.push([wandAn, A.rennen.letztesS]);
    return { ...e, ab, gras, wand, stand, checkpoints: A.checkpoints.map((c) => c.s), wandGrenze: C.grenze.wandGrenze };
  }, profil);
  zeiten.push(r.ziel ? fmt(r.zeit) : 'NICHT IM ZIEL');
  const m = (l) => l.map(([a, b]) => `${Math.round(a)}–${Math.round(b)} m`).join(', ') || 'keine';
  zeilen.push('', `${profil}: ${r.ziel ? fmt(r.zeit) : 'NICHT IM ZIEL'}`,
    `  Zwischenzeiten: ${r.cps.map((t, i) => `CP${i + 1} (${r.checkpoints[i]} m) ${fmt(t)}`).join(', ')}`,
    `  Aufpralle: ${r.aufpralle.length ? r.aufpralle.join(', ') : 'keine'}; hängen geblieben: ${r.haenger}; max. ${r.maxAbstand.toFixed(1)} m neben der Mitte`,
    `  Abkommen (Gras): ${m(r.gras)}`,
    `  Wandnähe (Felswand: Automitte mehr als ${(r.wandGrenze - 0.3).toFixed(1)} m neben der Mitte auf der Wandseite): ${m(r.wand)}`,
    `  Stillstand über 1 s: ${r.stand.map(([s, t]) => `${Math.round(s)} m (${t.toFixed(1)} s)`).join(', ') || 'keiner'}`,
    '  Höchstes Tempo je Abschnitt:',
    ...r.ab.map((a) => `    ${a.name.padEnd(16)} ${Math.round(a.von)}–${Math.round(a.bis)} m: ${Math.round(a.max)} km/h`));
  for (const w of r.wege || []) zeilen.push(`  Nebenweg ${w.name} (${w.belag}): ${w.zeit.toFixed(2)} s, max. ${w.maxAbstand.toFixed(1)} m neben der Mitte, neben dem Weg ${w.daneben.toFixed(2)} s`);
  if (!r.ziel) probleme++;
  console.log(`${profil.padEnd(10)} ${r.ziel ? fmt(r.zeit) : 'NICHT IM ZIEL'}  CPs ${r.cps.map(fmt).join(' / ')}  Aufpralle ${r.aufpralle.length}, Gras ${r.gras.length}x, Wandnähe ${r.wand.length}x, Stillstand ${r.stand.length}x`);
}
if (fehlerSeite.length) zeilen.push('', `Konsole: ${fehlerSeite.join(' | ')}`);
fs.writeFileSync(aus, `${zeilen.join('\n')}\n`);
console.log(`Gesamtzeiten: ${zeiten.join(' / ')}`);
console.log(`Bericht: ${aus}`);
await spiel.schliessen();
process.exit(probleme ? 1 : 0); // 1 = nicht ins Ziel gekommen (Aufpralle usw. stehen nur im Bericht)
