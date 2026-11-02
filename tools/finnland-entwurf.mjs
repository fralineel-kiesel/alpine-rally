// Entwurf der Strecke "Finnland-Schotter" (M10b):  node tools/finnland-entwurf.mjs [--schreiben]
// Die Strecke ist als Folge "Gerade / Kurve mit Radius" beschrieben (unten, ENTWURF), dazu ein Höhenprofil (Wellen,
// Kuppen, Senke an der Brücke). Das Werkzeug rechnet daraus die Stützpunkte (alle ca. 25 m) und zeigt eine Tabelle
// mit den Streckenmetern jedes Stücks (für Orte wie Dorf, Brücke, Seen, Kuppen). Mit --schreiben ersetzt es die
// Punkte in strecken/finnland.js zwischen "// <punkte>" und "// </punkte>" (alles andere bleibt).
// Danach: laenge in der Datei nachführen (node tools/strecke-karte.mjs --strecke finnland meldet die echte Länge).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Stücke: { ab } = neuer Abschnitt, { gerade: Meter }, { kurve: Grad (+ rechts, - links), radius: Meter }
export const ENTWURF = [
  { ab: 'Start am Waldrand' }, { gerade: 180 },
  { ab: 'Kiefernwald' }, { kurve: 40, radius: 260 }, { gerade: 70 }, { kurve: -55, radius: 200 }, { gerade: 150, kuppe: 'KIEFERNKUPPE' },
  { ab: 'Seeufer' }, { kurve: 60, radius: 260 }, { gerade: 120 },
  { ab: 'Dorf' }, { kurve: -90, radius: 28 }, { gerade: 90 }, { kurve: 95, radius: 24 }, { gerade: 110, bruecke: true },
  { ab: 'Birkenhain' }, { kurve: -40, radius: 200 }, { gerade: 140, kuppe: 'BIRKENKUPPE', kuppeBei: 0.4 }, { kurve: 60, radius: 160 },
  { ab: 'Kehre am Hügel' }, { kurve: -165, radius: 22 }, { gerade: 80 },
  { ab: 'Hochwald' }, { kurve: 45, radius: 140 }, { kurve: -45, radius: 140 }, { gerade: 150, kuppe: 'HOCHWALDKUPPE' },
  { ab: 'Zielgerade am See' }, { kurve: -35, radius: 300 }, { gerade: 200, kuppe: 'SEEKUPPE', kuppeBei: 0.3, kuppeHoehe: 1.5 },
];

// Höhenprofil (Meter über dem Start) über die Streckenmeter s der Linie: zwei Wellen, Kuppen, Senke an der Brücke
export function hoehe(s, marken) {
  let h = 5 * Math.sin((2 * Math.PI * s) / 700) + 2.5 * Math.sin((2 * Math.PI * s) / 260 + 1.3);
  h -= 5 * Math.sin(1.3) * 0.5; // Start etwa auf 0
  for (const k of marken.kuppen) h += (k.hoehe ?? 2.2) * Math.exp(-(((s - k.s) / 19) ** 2)) - 0.7 * Math.exp(-(((s - k.s + 45) / 16) ** 2)); // Kuppe, davor eine kleine Mulde
  if (marken.bruecke) h -= 3 * Math.exp(-(((s - marken.bruecke) / 45) ** 2)); // Flusstal
  for (const d of marken.dorf) h = h * (1 - 0.6 * Math.exp(-(((s - d) / 120) ** 2))); // Dorf flacher
  return h;
}

// Linie rechnen: Punkte alle ca. 25 m, Marken (Streckenmeter)
export function rechne() {
  const pkt = [{ x: 0, z: 0, s: 0, kommentar: null, ab: null }];
  let x = 0, z = 0, w = 0, s = 0, ab = null, abAktuell = null;
  const tabelle = [], marken = { kuppen: [], bruecke: null, dorf: [] };
  for (const st of ENTWURF) {
    if (st.ab) { ab = st.ab; abAktuell = st.ab; continue; }
    const s0 = s;
    if (st.gerade) {
      const n = Math.max(1, Math.round(st.gerade / 25)), d = st.gerade / n;
      for (let i = 1; i <= n; i++) { x += Math.sin(w) * d; z -= Math.cos(w) * d; s += d; pkt.push({ x, z, s, ab: i === 1 ? ab : null, kommentar: i === 1 ? `gerade ${st.gerade} m` : null }); ab = null; }
    } else {
      const winkel = (st.kurve * Math.PI) / 180, L = Math.abs(winkel) * st.radius, n = Math.max(2, Math.round(L / 25)), dw = winkel / n;
      for (let i = 1; i <= n; i++) {
        // Sehne eines Kreisbogens: Richtung in der Mitte des Teilbogens
        const sehne = 2 * st.radius * Math.sin(Math.abs(dw) / 2), wm = w + dw / 2;
        x += Math.sin(wm) * sehne; z -= Math.cos(wm) * sehne; w += dw; s += L / n;
        pkt.push({ x, z, s, ab: i === 1 ? ab : null, kommentar: i === 1 ? `Kurve ${st.kurve > 0 ? 'rechts' : 'links'} ${Math.abs(st.kurve)}°, Radius ${st.radius} m` : null }); ab = null;
      }
    }
    if (st.kuppe) marken.kuppen.push({ s: s0 + (s - s0) * (st.kuppeBei ?? 0.5), name: st.kuppe, hoehe: st.kuppeHoehe });
    if (st.bruecke) marken.bruecke = (s0 + s) / 2;
    tabelle.push({ ab: abAktuell, von: Math.round(s0), bis: Math.round(s), was: st.gerade ? `gerade ${st.gerade}` : `${st.kurve > 0 ? 'R' : 'L'} ${Math.abs(st.kurve)}° r${st.radius}`, kuppe: st.kuppe || '' });
  }
  // Der erste Abschnitts-Name gehört vor den Startpunkt
  if (pkt[1] && pkt[1].ab) { pkt[0].ab = pkt[1].ab; pkt[1].ab = null; }
  const dorfStuecke = tabelle.filter((t) => t.ab === 'Dorf');
  marken.dorf = [(dorfStuecke[0].von + dorfStuecke[dorfStuecke.length - 1].bis) / 2];
  for (const p of pkt) p.h = Math.round(hoehe(p.s, marken) * 100) / 100;
  return { pkt, tabelle, marken, laenge: s, ende: { x, z, w } };
}

const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { pkt, tabelle, marken, laenge, ende } = rechne();
  for (const t of tabelle) console.log(`${String(t.von).padStart(5)} – ${String(t.bis).padStart(5)}  ${t.was}${t.kuppe ? `  (Kuppe ${t.kuppe})` : ''}`);
  console.log(`Linie ${laenge.toFixed(1)} m, ${pkt.length} Punkte, Ende bei x ${ende.x.toFixed(0)} z ${ende.z.toFixed(0)}, Richtung ${(ende.w * 180 / Math.PI).toFixed(0)}°`);
  console.log(`Kuppen: ${marken.kuppen.map((k) => `${k.name} ${k.s.toFixed(0)} m`).join(', ')}; Brücke ${marken.bruecke.toFixed(0)} m`);
  const hs = pkt.map((p) => p.h);
  console.log(`Höhe ${Math.min(...hs).toFixed(1)} bis ${Math.max(...hs).toFixed(1)} m`);
  // engster Abstand zweier Streckenteile, die mehr als 150 m auseinander liegen
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
    const datei = path.join(WURZEL, 'strecken/finnland.js');
    const alt = fs.readFileSync(datei, 'utf8');
    const a = alt.indexOf('    // <punkte>'), e = alt.indexOf('    // </punkte>');
    if (a < 0 || e < 0) throw new Error('Marken "// <punkte>" und "// </punkte>" fehlen in strecken/finnland.js');
    const erster = zeilen.findIndex((z) => z.trim());
    fs.writeFileSync(datei, `${alt.slice(0, a)}    // <punkte> (geschrieben von tools/finnland-entwurf.mjs – Entwurf dort ändern)\n${zeilen.slice(erster).join('\n')}\n${alt.slice(e)}`);
    console.log('-> strecken/finnland.js: Punkte geschrieben');
  }
}
