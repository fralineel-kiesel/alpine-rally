// Hang-Check (M10b.2):  node tools/hang-pruefen.mjs --strecke <id> [--aus <datei.txt>] [--json] [--wurzel <ordner>]
// Lädt das Spiel im Headless-Chromium und misst neben der Strasse (beide Seiten, die ersten 15 m ab Bankett-Rand) im
// gezeichneten Gelände (welt.gelaendeHoehe = genau die Dreiecke, auf denen auch das Auto fährt):
//   - Steigung quer zur Strasse (Höhenänderung pro Meter), alle 0.5 m
//   - Grate/Zacken: Knick = Unterschied der Steigung zweier benachbarter 1-m-Stücke (Faltenkante zwischen Dreiecken)
// Stellen über dem Grenzwert werden zu Abschnitten zusammengefasst (Meter von–bis, Seite, grösste Steigung, Ursache):
//   Wand   = Felswand-Seite (Absicht, kein Fehler)    Abhang = Gegenseite der Felswand (Absicht, unsichtbare Grenze)
//   Ufer   = bis 25 m vor einem See/Fluss               Böschung = Gelände fällt von der Strasse weg
//   Kuppe  = Gelände steigt neben der Strasse an         Kehre = Hang zum anderen Ast einer Serpentine
//   Brücke = Fahrbahn über dem Fluss (±6 m), Kreuzung = Grasstreifen zwischen zwei Banketten am Abzweig (beide Absicht)
// Grenzwerte: WARNUNG 0.45 (ca. 24°), ZIEL 0.35 (ca. 19°), KNICK 0.35. Wand/Abhang zählen nicht als Fehler.
// Rückgabe 0, ausser --pruefen und Stellen über WARNUNG (ohne Wand/Abhang).

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL, STRECKE_ARG } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
export const GRENZEN = { warnung: 0.45, ziel: 0.35, knick: 0.35, breite: 15, schritt: 2 };

// Misst eine Strecke; wurzel = Projektordner (für den Vergleich alt/neu)
export async function hangPruefen({ wurzel = WURZEL, strecke = STRECKE_ARG || 'alpen' } = {}) {
  const spiel = await starteSpiel({ wurzel, auto: 'prototyp' });
  await spiel.page.goto(`${spiel.url}/index.html?menue=aus&ton=aus&strecke=${strecke}`);
  await spiel.page.waitForFunction(() => window.__alpineRally, null, { timeout: 180000, polling: 200 });
  const r = await spiel.page.evaluate((G) => {
    const A = window.__alpineRally, S = A.strecke, N = A.netz, W = A.welt, C = A.CONFIG;
    const plan = W.wasser || { seen: [], fluesse: [] };
    const flaechen = plan.an ? plan.seen.concat(plan.fluesse) : [];
    // Abstand zum Wasserrand (wie js/wasser.js)
    const wasserAbstand = (x, z) => {
      let best = Infinity;
      for (const f of flaechen) {
        const dx = x - f.x, dz = z - f.z;
        let d;
        if (f.art === 'see') {
          const l = dx * f.ux + dz * f.uz, q = dx * f.uz - dz * f.ux;
          d = (Math.hypot(q / f.rx, l / f.rz) - 1) * Math.min(f.rx, f.rz);
        } else {
          const l = dx * f.ux + dz * f.uz, q = dx * -f.uz + dz * f.ux;
          d = Math.abs(l) > f.laenge / 2 ? Infinity : Math.abs(q) - f.breite / 2;
        }
        best = Math.min(best, d);
      }
      return best;
    };
    const q = {}, punkte = [];
    const bank = C.strasse.bankett;
    for (let s = 0; s <= S.laenge; s += G.schritt) {
      const p = N ? N.etappePunkt(s) : S.punktBei(s);
      const i = Math.max(0, Math.min(S.anzahl - 1, Math.round(s)));
      const hb = (N ? N.halbBei(s) : C.strasse.breite / 2) + bank;
      for (const sd of [-1, 1]) {
        const rx = -p.tz * sd, rz = p.tx * sd;
        let maxSt = 0, maxKn = 0, stLat = 0, richtung = 0, nahWasser = false, hoehen = [];
        for (let k = 0; k <= G.breite * 2; k++) {
          const lat = hb + k * 0.5, x = p.x + rx * lat, z = p.z + rz * lat;
          // nur Gelände, das zu dieser Stelle der Etappe gehört (nicht die Kehre darüber, kein Stummel)
          S.abfrage(x, z, q);
          const fremd = Math.abs(q.s - s) > 25 || W.bodenBei(x, z).art !== 'gras';
          const wd = wasserAbstand(x, z);
          if (wd < 25) nahWasser = true;
          // erster Punkt = äussere Bankett-Kante (Strassenhöhe - 0.35): so zählt auch eine Stufe Strasse -> Gras
          if (k === 0) hoehen.push(S.py[i] - 0.35);
          else hoehen.push(fremd || wd < 0 ? null : W.gelaendeHoehe(x, z));
        }
        for (let k = 1; k < hoehen.length; k++) {
          if (hoehen[k] == null || hoehen[k - 1] == null) continue;
          const st = (hoehen[k] - hoehen[k - 1]) / 0.5;
          if (Math.abs(st) > maxSt) { maxSt = Math.abs(st); stLat = hb + k * 0.5; richtung = Math.sign(st); }
          if (k >= 4 && hoehen[k - 2] != null && hoehen[k - 4] != null) {
            const a = (hoehen[k - 2] - hoehen[k - 4]) / 1, b = (hoehen[k] - hoehen[k - 2]) / 1;
            maxKn = Math.max(maxKn, Math.abs(b - a));
          }
        }
        let wand = S.wandSeite[i] && S.wandStaerke[i] > 0.3 ? (S.wandSeite[i] === sd ? 'Wand' : 'Abhang') : null;
        // Brücke (Fahrbahn über dem Fluss, ±6 m) und Kreuzungs-Zwickel (schmaler Grasstreifen zwischen zwei Banketten
        // an Abzweig/Einmündung) sind Absicht, kein Hang
        if (!wand && flaechen.some((f) => f.art === 'fluss' && Math.abs(s - f.s) <= f.breite / 2 + C.wasser.brueckeUeber + 6)) wand = 'Brücke';
        if (!wand && N) { // Kreuzung: 2 m neben dem Bankett liegt schon eine zweite Strasse (Stummel)
          const x = p.x + rx * (hb + 2), z = p.z + rz * (hb + 2), q1 = N.abfrage(x, z, {}), q2 = {};
          if (q1.ast || (N.zweiteStrasse(x, z, q1, hb + 4, q2) && q2.ast)) wand = 'Kreuzung';
        }
        // Kehre: 15 m neben der Strasse liegt schon ein anderer Ast der Etappe (Serpentine, Hang von Strasse zu Strasse)
        let kehre = false;
        if (!wand) { const x = p.x + rx * (hb + 15), z = p.z + rz * (hb + 15); kehre = !!S.andererAst(x, z, s, 40, 25, {}); }
        const ursache = wand || (nahWasser ? 'Ufer' : kehre ? 'Kehre' : richtung < 0 ? 'Böschung' : 'Kuppe');
        punkte.push({ s, seite: sd, st: maxSt, kn: maxKn, lat: stLat, ursache });
      }
    }
    return { laenge: S.laenge, punkte };
  }, GRENZEN);
  await spiel.schliessen();
  const ABSICHT = ['Wand', 'Abhang', 'Brücke', 'Kreuzung'];
  const absicht = (x) => ABSICHT.includes(x.ursache);
  // Abschnitte bilden: aufeinanderfolgende Punkte derselben Seite über der Grenze
  const stellen = (grenze, wert) => {
    const aus = [];
    for (const sd of [-1, 1]) for (const mitAbsicht of [false, true]) {
      let cur = null;
      for (const p of r.punkte.filter((x) => x.seite === sd)) {
        if (p[wert] > grenze && absicht(p) === mitAbsicht) {
          if (cur && p.s - cur.bis <= GRENZEN.schritt * 2) { cur.bis = p.s; if (p[wert] > cur.max) { cur.max = p[wert]; cur.lat = p.lat; } }
          else { cur = { von: p.s, bis: p.s, seite: sd, max: p[wert], lat: p.lat, ursache: p.ursache }; aus.push(cur); }
        } else if (cur && p.s - cur.bis > GRENZEN.schritt * 2) cur = null;
      }
    }
    return aus.sort((a, b) => a.von - b.von);
  };
  const warn = stellen(GRENZEN.warnung, 'st'), ziel = stellen(GRENZEN.ziel, 'st'), knick = stellen(GRENZEN.knick, 'kn');
  const maxOhne = r.punkte.filter((p) => !absicht(p)).reduce((m, p) => Math.max(m, p.st), 0);
  const maxKnick = r.punkte.filter((p) => !absicht(p)).reduce((m, p) => Math.max(m, p.kn), 0);
  return {
    strecke, laenge: r.laenge, warn, ziel, knick, maxOhne, maxKnick,
    fehler: warn.filter((x) => !absicht(x)).length, fehlerZiel: ziel.filter((x) => !absicht(x)).length,
    fehlerKnick: knick.filter((x) => !absicht(x)).length, absicht: warn.filter(absicht).length,
    punkte: r.punkte,
  };
}

export function hangText(e) {
  const z = (x) => `${String(x.von).padStart(5)}–${String(x.bis).padEnd(5)} m ${x.seite < 0 ? 'links ' : 'rechts'}  max ${x.max.toFixed(2)} (${(Math.atan(x.max) * 180 / Math.PI).toFixed(0)}°) bei ${x.lat.toFixed(1)} m neben der Mitte  ${x.ursache}`;
  const l = [`Hang-Check ${e.strecke} (${e.laenge.toFixed(1)} m), Grenzen: Warnung ${GRENZEN.warnung}, Ziel ${GRENZEN.ziel}, Knick ${GRENZEN.knick}`,
    `Stellen über ${GRENZEN.warnung}: ${e.fehler} (dazu ${e.absicht} mit Absicht: Wand/Abhang/Brücke/Kreuzung)`,
    `Stellen über ${GRENZEN.ziel}: ${e.fehlerZiel} ohne Absicht, Knicke über ${GRENZEN.knick}: ${e.fehlerKnick}`,
    `grösste Steigung ohne Absicht: ${e.maxOhne.toFixed(3)}, grösster Knick: ${e.maxKnick.toFixed(3)}`,
    `nach Ursache (über ${GRENZEN.warnung}): ${Object.entries(e.warn.reduce((m, x) => { m[x.ursache] = (m[x.ursache] || 0) + 1; return m; }, {})).map(([k, v]) => `${k} ${v}`).join(', ') || 'keine'}`,
    '', `-- über ${GRENZEN.warnung} --`, ...e.warn.map(z), '', `-- über ${GRENZEN.ziel} --`, ...e.ziel.map(z), '', `-- Knicke über ${GRENZEN.knick} --`, ...e.knick.map(z)];
  return l.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const e = await hangPruefen({ wurzel: arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL });
  const t = hangText(e);
  const aus = arg('--aus') || `/tmp/hang-${e.strecke}.txt`;
  fs.writeFileSync(aus, t + '\n');
  if (process.argv.includes('--json')) fs.writeFileSync(aus.replace(/\.txt$/, '') + '.json', JSON.stringify({ ...e, punkte: undefined }, null, 1));
  console.log(t.split('\n').slice(0, 5).join('\n'));
  console.log(`(ganze Liste: ${aus})`);
  process.exit(process.argv.includes('--pruefen') && e.fehler > 0 ? 1 : 0);
}
