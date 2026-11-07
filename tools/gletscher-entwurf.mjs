// Entwurf der Strecke "Gletscher" (M11a):  node tools/gletscher-entwurf.mjs [--schreiben]
// Vorbild tools/finnland-entwurf.mjs: die Strecke ist eine Folge "Gerade / Kurve mit Radius" (ENTWURF), dazu ein
// Höhenprofil (stetiger Anstieg von der Talstation zur Bergstation, eine Senke am Eisfeld, Kuppen für die Sprünge,
// ruhige Bremszonen vor den Kehren). Das Werkzeug rechnet die Stützpunkte (alle ca. 25 m) und zeigt eine Tabelle mit
// den Streckenmetern jedes Stücks (für Eisstellen, Kuppen, Orte). Mit --schreiben ersetzt es die Punkte in
// strecken/gletscher.js zwischen "// <punkte>" und "// </punkte>" (alles andere bleibt).
// Danach: laenge in der Datei nachführen (node tools/strecke-karte.mjs --strecke gletscher meldet die echte Länge).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Stücke: { ab } = neuer Abschnitt, { gerade: Meter }, { kurve: Grad (+ rechts, - links), radius: Meter },
// kuppe: Name (Sprung-Kuppe, Höhe macht die Sprungzone), senke: Tiefe (m), abzweig/einmuendung: Nebenweg
export const ENTWURF = [
  { ab: 'Talstation' }, { gerade: 110 }, { kurve: 25, radius: 260 }, { gerade: 100 },
  { ab: 'Gletscherstrasse' }, { kurve: 70, radius: 40, abzweig: 'Gletscherstrasse' }, { gerade: 60 },
  { kurve: -35, radius: 260 }, { gerade: 230, kuppe: 'SCHNEEKUPPE', kuppeBei: 0.55 }, { kurve: 30, radius: 300 }, { gerade: 70 },
  { ab: 'Erste Kehre' }, { gerade: 60 }, { kurve: -165, radius: 22 }, { gerade: 70 },
  { ab: 'Gletscherrand' }, { kurve: 40, radius: 200 }, { gerade: 120 }, { kurve: -55, radius: 180 }, { gerade: 90 },
  { kurve: 60, radius: 150 }, { gerade: 80 },
  { ab: 'Eiskehre' }, { gerade: 60 }, { kurve: 170, radius: 21 }, { gerade: 60 },
  { ab: 'Eisfeld' }, { kurve: -45, radius: 200 }, { gerade: 200, senke: 4 }, { kurve: 50, radius: 154 }, { gerade: 60 }, // (gleich lange Bögen wie -30°/r300 und 35°/r220: alle Meter bleiben)
  { ab: 'Dritte Kehre' }, { gerade: 60 }, { kurve: -160, radius: 23 }, { gerade: 60 },
  { ab: 'Moräne' }, { kurve: 35, radius: 240 }, { gerade: 260, kuppe: 'MORÄNENKUPPE', kuppeBei: 0.5 }, { kurve: -40, radius: 260 }, { gerade: 60 },
  { ab: 'Hochebene' }, { kurve: 30, radius: 320 }, { gerade: 220, kuppe: 'FIRNKUPPE', kuppeBei: 0.5 }, { kurve: -25, radius: 300 }, { gerade: 104 }, { gerade: 8 },
  { ab: 'Bergstation' }, { kurve: -55, radius: 36, einmuendung: 'Gletscherstrasse' }, { gerade: 110 },
];

// Höhenprofil (Meter über der Talstation) über die Streckenmeter s: Stützwerte [s, h], dazwischen weich (Kosinus, an
// jedem Stützwert flach). Der Anstieg liegt auf der Zufahrt (bis zur ersten Kehre) und an der Moräne; Gletscherrand und
// Eisfeld (die zwei Schenkel um die Eiskehre liegen nur 40–60 m nebeneinander) sind fast flach, sonst entstünde
// zwischen ihnen ein Steilhang. Flache Stellen auch an den Sprung-Kuppen. Dazu kleine Wellen und die Senke am Eisfeld.
const STUETZEN = [[0, 0], [330, 3], [650, 26], [800, 29], [1100, 45], [1180, 46], [2060, 50], [2120, 51], [2800, 52],
  [2860, 53], [3120, 72], [3280, 77], [3600, 99], [3780, 103], [3920, 105], [4400, 111]];
function stuetzHoehe(s) {
  for (let k = 1; k < STUETZEN.length; k++) {
    const [s0, h0] = STUETZEN[k - 1], [s1, h1] = STUETZEN[k];
    if (s <= s1 || k === STUETZEN.length - 1) { const t = Math.max(0, Math.min(1, (s - s0) / (s1 - s0))); return h0 + (h1 - h0) * (0.5 - 0.5 * Math.cos(Math.PI * t)); }
  }
  return 0;
}
function grundHoehe(s, marken) {
  let h = stuetzHoehe(s);
  h += 1.2 * Math.sin((2 * Math.PI * s) / 520 + 0.7) - 1.2 * Math.sin(0.7); // kleine Wellen
  for (const sk of marken.senken) h -= sk.tiefe * Math.exp(-(((s - sk.s) / 60) ** 2)); // Senke (dort liegt Eis)
  return h;
}
export function hoehe(s, marken) {
  let h = grundHoehe(s, marken);
  for (const r of marken.ruhig || []) {
    let m = 0;
    for (let d = -140; d <= 40; d += 10) m += grundHoehe(r + d, marken) / 19;
    h += 0.9 * Math.exp(-(((s - (r - 50)) / 120) ** 2)) * (m - h);
  }
  return h;
}

export function rechne() {
  const pkt = [{ x: 0, z: 0, s: 0, kommentar: null, ab: null }];
  let x = 0, z = 0, w = 0, s = 0, ab = null, abAktuell = null;
  const tabelle = [], marken = { kuppen: [], senken: [], wege: {}, ruhig: [], kehren: [] };
  for (const st of ENTWURF) {
    if (st.ab) { ab = st.ab; abAktuell = st.ab; continue; }
    const s0 = s;
    if (st.gerade) {
      const n = Math.max(1, Math.round(st.gerade / 25)), d = st.gerade / n;
      for (let i = 1; i <= n; i++) { x += Math.sin(w) * d; z -= Math.cos(w) * d; s += d; pkt.push({ x, z, s, ab: i === 1 ? ab : null, kommentar: i === 1 ? `gerade ${st.gerade} m` : null }); ab = null; }
    } else {
      const winkel = (st.kurve * Math.PI) / 180, L = Math.abs(winkel) * st.radius, n = Math.max(2, Math.round(L / 25), Math.ceil(Math.abs(st.kurve) / 50)), dw = winkel / n;
      for (let i = 1; i <= n; i++) {
        const sehne = 2 * st.radius * Math.sin(Math.abs(dw) / 2), wm = w + dw / 2;
        x += Math.sin(wm) * sehne; z -= Math.cos(wm) * sehne; w += dw; s += L / n;
        pkt.push({ x, z, s, ab: i === 1 ? ab : null, kommentar: i === 1 ? `Kurve ${st.kurve > 0 ? 'rechts' : 'links'} ${Math.abs(st.kurve)}°, Radius ${st.radius} m` : null }); ab = null;
      }
    }
    if (st.kuppe) marken.kuppen.push({ s: s0 + (s - s0) * (st.kuppeBei ?? 0.5), name: st.kuppe });
    if (st.senke) marken.senken.push({ s: (s0 + s) / 2, tiefe: st.senke });
    if (st.kurve && (Math.abs(st.kurve) >= 150 || st.abzweig || st.einmuendung)) marken.ruhig.push(s0);
    if (st.kurve && Math.abs(st.kurve) >= 150) marken.kehren.push({ von: s0, bis: s });
    if (st.abzweig) (marken.wege[st.abzweig] ||= {}).abzweig = s0;
    if (st.einmuendung) (marken.wege[st.einmuendung] ||= {}).einmuendung = s;
    tabelle.push({ ab: abAktuell, von: Math.round(s0), bis: Math.round(s), was: st.gerade ? `gerade ${st.gerade}` : `${st.kurve > 0 ? 'R' : 'L'} ${Math.abs(st.kurve)}° r${st.radius}`, kuppe: st.kuppe || '' });
  }
  if (pkt[1] && pkt[1].ab) { pkt[0].ab = pkt[1].ab; pkt[1].ab = null; }
  marken.laenge = s;
  for (const p of pkt) p.h = Math.round(hoehe(p.s, marken) * 100) / 100;
  return { pkt, tabelle, marken, laenge: s, ende: { x, z, w } };
}

const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { pkt, tabelle, marken, laenge, ende } = rechne();
  for (const t of tabelle) console.log(`${String(t.von).padStart(5)} – ${String(t.bis).padStart(5)}  ${t.was}${t.kuppe ? `  (Kuppe ${t.kuppe})` : ''}  [${t.ab}]`);
  console.log(`Linie ${laenge.toFixed(1)} m, ${pkt.length} Punkte, Ende bei x ${ende.x.toFixed(0)} z ${ende.z.toFixed(0)}, Richtung ${(ende.w * 180 / Math.PI).toFixed(0)}°`);
  console.log(`Nebenwege: ${Object.entries(marken.wege).map(([n, w]) => `${n} ${w.abzweig.toFixed(1)}–${w.einmuendung.toFixed(1)} m`).join(', ')}`);
  console.log(`Kuppen: ${marken.kuppen.map((k) => `${k.name} ${k.s.toFixed(0)} m`).join(', ')}; Senken: ${marken.senken.map((k) => k.s.toFixed(0)).join(', ')}; Kehren: ${marken.kehren.map((k) => `${k.von.toFixed(0)}–${k.bis.toFixed(0)}`).join(', ')}`);
  const hs = pkt.map((p) => p.h);
  let steil = 0;
  for (let i = 1; i < pkt.length; i++) steil = Math.max(steil, Math.abs(pkt[i].h - pkt[i - 1].h) / (pkt[i].s - pkt[i - 1].s));
  console.log(`Höhe ${Math.min(...hs).toFixed(1)} bis ${Math.max(...hs).toFixed(1)} m, steilstes Stück ${(steil * 100).toFixed(1)} %`);
  let eng = { d: Infinity };
  for (let i = 0; i < pkt.length; i++) for (let j = i + 1; j < pkt.length; j++) if (pkt[j].s - pkt[i].s > 150) { const d = Math.hypot(pkt[i].x - pkt[j].x, pkt[i].z - pkt[j].z); if (d < eng.d) eng = { d, a: pkt[i].s, b: pkt[j].s }; }
  console.log(`engster Abstand zweier Teile: ${eng.d.toFixed(0)} m (bei ${eng.a.toFixed(0)} und ${eng.b.toFixed(0)} m)`);
  if (process.argv.includes('--schreiben')) {
    const zeilen = [];
    for (const p of pkt) {
      if (p.ab) zeilen.push('', `    '${p.ab}',`);
      if (p.kommentar) zeilen.push(`    // ${p.kommentar}`);
      zeilen.push(`    [${r1(p.x)}, ${r1(p.z)}, ${p.h.toFixed(2)}],`);
    }
    const datei = path.join(WURZEL, 'strecken/gletscher.js');
    const alt = fs.readFileSync(datei, 'utf8');
    const a = alt.indexOf('    // <punkte>'), e = alt.indexOf('    // </punkte>');
    if (a < 0 || e < 0) throw new Error('Marken "// <punkte>" und "// </punkte>" fehlen in strecken/gletscher.js');
    const erster = zeilen.findIndex((zl) => zl.trim());
    fs.writeFileSync(datei, `${alt.slice(0, a)}    // <punkte> (geschrieben von tools/gletscher-entwurf.mjs – Entwurf dort ändern)\n${zeilen.slice(erster).join('\n')}\n${alt.slice(e)}`);
    console.log('-> strecken/gletscher.js: Punkte geschrieben');
  }
}
