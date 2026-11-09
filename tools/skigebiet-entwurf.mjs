// Entwurf der Strecke "Skigebiet" (M11b, Vorlage war der Entwurf des Gletschers aus M11a):
//   node tools/skigebiet-entwurf.mjs [--schreiben]
// Die Strecke ist eine Folge "Gerade / Kurve mit Radius" (ENTWURF), dazu ein Höhenprofil (STUETZEN: Meter über dem
// Dorf je Streckenmeter). Das Werkzeug rechnet die Stützpunkte (alle ca. 25 m) und zeigt eine Tabelle mit den
// Streckenmetern jedes Stücks (für Kehren, Kuppen, Orte). Mit --schreiben ersetzt es die Punkte in
// strecken/skigebiet.js zwischen "// <punkte>" und "// </punkte>" (alles andere bleibt).
// Danach: laenge in der Datei nachführen (node tools/strecke-karte.mjs --strecke skigebiet meldet die echte Länge).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Stücke: { ab } = neuer Abschnitt, { gerade: Meter }, { kurve: Grad (+ rechts, - links), radius: Meter },
// g: Steigung in Prozent (+ bergauf, - bergab; fehlt = wie das Stück davor), welle: kleine Wellen (Meter, Grat),
// abzweig/einmuendung: Nebenweg, marke: Text für die Tabelle (Orte für M11c, Sprünge)
// M11b: Höhenprofil "Steil": hoch zur Bergstation (Spitzkehren), Grat, steile Abfahrt, Ziel im Talboden.
export const ENTWURF = [
  { ab: 'Dorf' }, { gerade: 230, g: 0 },
  // Pistenzufahrt: Schenkel je 50 m vor und nach einer Kehre flacher (sonst wird der Hang zwischen zwei Schenkeln
  // zu steil, Hang-Check), dazwischen steil; das STEILSTÜCK ist die steilste Stelle (Anfahren am Hang, Teil B)
  { ab: 'Zufahrt' }, { kurve: -65, radius: 40, g: 1, abzweig: 'Pistenzufahrt' }, { gerade: 70, g: 7 }, { gerade: 120, g: 23, marke: 'STEILSTÜCK' }, { gerade: 70, g: 7 },
  { ab: 'Kehren' }, { kurve: 128, radius: 18, g: 3 }, { gerade: 70, g: 6 }, { gerade: 70, g: 22 }, { gerade: 70, g: 6 },
  { kurve: -128, radius: 18, g: 3 }, { gerade: 70, g: 6 }, { gerade: 70, g: 22 }, { gerade: 70, g: 6 },
  { kurve: 128, radius: 18, g: 3 }, { gerade: 70, g: 6 }, { gerade: 50, g: 22 }, { gerade: 70, g: 6 },
  { kurve: -128, radius: 18, g: 3 }, { gerade: 70, g: 6 }, { gerade: 70, g: 22 }, { gerade: 70, g: 6 },
  { kurve: 128, radius: 18, g: 3 }, { gerade: 70, g: 6 }, { gerade: 50, g: 21 }, { gerade: 70, g: 6 },
  { kurve: -128, radius: 18, g: 3 }, { gerade: 70, g: 6 }, { gerade: 60, g: 14 },
  { ab: 'Bergstation' }, { kurve: 65, radius: 60, g: 4 }, { gerade: 80, g: 0, marke: 'BERGSTATION' },
  { ab: 'Grat' }, { kurve: 60, radius: 150, g: 2.5, welle: 3 }, { gerade: 150, g: 1.5 }, { kurve: 30, radius: 200, g: 0 },
  { ab: 'Abfahrt' }, { kurve: 20, radius: 150, g: -12, welle: 0 }, { gerade: 200, g: -23, marke: 'NATÜRLICHER SPRUNG' }, { gerade: 70, g: -6 },
  { kurve: 130, radius: 18, g: -3 }, { gerade: 70, g: -6 }, { gerade: 70, g: -23 }, { gerade: 70, g: -6 },
  { kurve: -130, radius: 18, g: -3 }, { gerade: 70, g: -6 }, { gerade: 180, g: -22 },
  { ab: 'Funpark' }, { kurve: 50, radius: 150, g: -16 }, { gerade: 400, g: -15, marke: 'KICKER' }, { kurve: -40, radius: 200, g: -16 }, { gerade: 70, g: -14 }, { gerade: 50, g: -3 },
  { ab: 'Zielarena' }, { kurve: -90, radius: 30, g: 0, einmuendung: 'Pistenzufahrt' }, { gerade: 120, g: 0 },
];

// Höhenprofil: Steigung je Stück (Prozent), über +-GLATT Meter gemittelt (weiche Übergänge, kein Knick), aufsummiert.
// Dazu auf dem Grat kleine Wellen (welle). Die Sprünge (Kuppe, Kicker) legt das Spiel selbst als Sprungzone darüber.
const GLATT = 20;
let PROFIL = null; // Höhe je Meter (aus rechne)
export function hoehe(s) {
  const i = Math.max(0, Math.min(PROFIL.length - 1, s));
  const k = Math.floor(i), f = i - k;
  return k + 1 < PROFIL.length ? PROFIL[k] * (1 - f) + PROFIL[k + 1] * f : PROFIL[k];
}
function baueProfil(stuecke, laenge) {
  const n = Math.ceil(laenge) + 1, g = new Float64Array(n), w = new Float64Array(n);
  for (const st of stuecke) for (let i = Math.floor(st.von); i < Math.min(n, Math.ceil(st.bis)); i++) { g[i] = st.g / 100; w[i] = st.welle; }
  const gs = new Float64Array(n);
  for (let i = 0; i < n; i++) { let su = 0, c = 0; for (let d = -GLATT; d <= GLATT; d++) { const j = i + d; if (j >= 0 && j < n) { su += g[j]; c++; } } gs[i] = su / c; }
  const h = new Float64Array(n);
  for (let i = 1; i < n; i++) h[i] = h[i - 1] + gs[i - 1];
  // Wellen (Grat): sanfte Kuppen alle ca. 140 m, an den Enden weich ein- und ausgeblendet
  const ws = new Float64Array(n);
  for (let i = 0; i < n; i++) { let su = 0, c = 0; for (let d = -40; d <= 40; d += 4) { const j = i + d; if (j >= 0 && j < n) { su += w[j]; c++; } } ws[i] = su / c; }
  for (let i = 0; i < n; i++) h[i] += ws[i] * Math.sin((2 * Math.PI * i) / 140) ** 2;
  return h;
}

export function rechne() {
  const pkt = [{ x: 0, z: 0, s: 0, kommentar: null, ab: null }];
  let x = 0, z = 0, w = 0, s = 0, ab = null, abAktuell = null;
  const tabelle = [], marken = { kuppen: [], senken: [], wege: {}, ruhig: [], kehren: [], marken: [] }, stuecke = [];
  let gAkt = 0, welleAkt = 0;
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
    if (st.g != null) gAkt = st.g;
    if (st.welle != null) welleAkt = st.welle;
    stuecke.push({ von: s0, bis: s, g: gAkt, welle: welleAkt });
    if (st.marke) marken.marken.push({ von: s0, bis: s, name: st.marke });
    if (st.kurve && Math.abs(st.kurve) >= 120) marken.kehren.push({ von: s0, bis: s });
    if (st.abzweig) (marken.wege[st.abzweig] ||= {}).abzweig = s0;
    if (st.einmuendung) (marken.wege[st.einmuendung] ||= {}).einmuendung = s;
    tabelle.push({ ab: abAktuell, von: Math.round(s0), bis: Math.round(s), was: st.gerade ? `gerade ${st.gerade}` : `${st.kurve > 0 ? 'R' : 'L'} ${Math.abs(st.kurve)}° r${st.radius}`, kuppe: `${gAkt} %${st.marke ? ` ${st.marke}` : ''}` });
  }
  if (pkt[1] && pkt[1].ab) { pkt[0].ab = pkt[1].ab; pkt[1].ab = null; }
  marken.laenge = s;
  PROFIL = baueProfil(stuecke, s);
  for (const p of pkt) p.h = Math.round(hoehe(p.s) * 100) / 100;
  return { pkt, tabelle, marken, laenge: s, ende: { x, z, w } };
}

const r1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { pkt, tabelle, marken, laenge, ende } = rechne();
  for (const t of tabelle) console.log(`${String(t.von).padStart(5)} – ${String(t.bis).padStart(5)}  ${t.was}  ${t.kuppe}  [${t.ab}]`);
  console.log(`Linie ${laenge.toFixed(1)} m, ${pkt.length} Punkte, Ende bei x ${ende.x.toFixed(0)} z ${ende.z.toFixed(0)}, Richtung ${(ende.w * 180 / Math.PI).toFixed(0)}°`);
  console.log(`Nebenwege: ${Object.entries(marken.wege).map(([n, w]) => `${n} ${w.abzweig.toFixed(1)}–${(w.einmuendung || 0).toFixed(1)} m`).join(', ')}`);
  console.log(`Kehren (${marken.kehren.length}): ${marken.kehren.map((k) => `${k.von.toFixed(0)}–${k.bis.toFixed(0)}`).join(', ')}`);
  let st25 = 0, ge25 = 0; for (let i = 0; i + 25 < PROFIL.length; i++) { const d = (PROFIL[i + 25] - PROFIL[i]) / 25; st25 = Math.max(st25, d); ge25 = Math.min(ge25, d); }
  console.log(`Steigung über 25 m: max +${(st25 * 100).toFixed(1)} %, Gefälle max ${(ge25 * 100).toFixed(1)} % (ohne Sprungzonen)`);
  const hs = pkt.map((p) => p.h);
  let steil = 0;
  for (let i = 1; i < pkt.length; i++) steil = Math.max(steil, Math.abs(pkt[i].h - pkt[i - 1].h) / (pkt[i].s - pkt[i - 1].s));
  console.log(`Höhe ${Math.min(...hs).toFixed(1)} bis ${Math.max(...hs).toFixed(1)} m (Höhenunterschied ${(Math.max(...hs) - Math.min(...hs)).toFixed(1)} m, Ziel auf ${hs[hs.length - 1].toFixed(1)} m), steilstes Stück ${(steil * 100).toFixed(1)} %`);
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
    const datei = path.join(WURZEL, 'strecken/skigebiet.js');
    const alt = fs.readFileSync(datei, 'utf8');
    const a = alt.indexOf('    // <punkte>'), e = alt.indexOf('    // </punkte>');
    if (a < 0 || e < 0) throw new Error('Marken "// <punkte>" und "// </punkte>" fehlen in strecken/skigebiet.js');
    const erster = zeilen.findIndex((zl) => zl.trim());
    fs.writeFileSync(datei, `${alt.slice(0, a)}    // <punkte> (geschrieben von tools/skigebiet-entwurf.mjs – Entwurf dort ändern)\n${zeilen.slice(erster).join('\n')}\n${alt.slice(e)}`);
    console.log('-> strecken/skigebiet.js: Punkte geschrieben');
  }
}
