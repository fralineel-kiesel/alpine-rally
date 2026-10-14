// Testlauf Handbremse und Geradeauslauf (Meilenstein 3a.2).
// Läuft ohne Browser:  node tools/handbremse-test.mjs
//                      node tools/handbremse-test.mjs --wurzel <ordner>   (alte Version messen, ohne Prüfungen)
// Rechnet mit der echten Fahrphysik (js/physics.js) und dem Getriebe auf flachem Boden.
//   1. Handbremse lange halten (Vollausschlag, mit und ohne Gas): Tempoverlauf, wann unter 10 km/h
//   2. Handbremse kurz ziehen (0.3 / 0.5 s): wie viel Tempo kostet das gegenüber gleichem Lenken ohne Handbremse
//   3. Rückstellung: 0.5 s voll einlenken, loslassen, Zeit bis Gierrate und Schwimmwinkel nahe 0 (60/120/180 km/h)
//   4. Drift (Handbremse) bleibt Drift: nach dem Loslassen schiebt das Auto weiter wie ohne Geradeauslauf

import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const lade = (datei) => import(pathToFileURL(path.join(wurzel, 'js', datei)).href);
const { CONFIG } = await lade('config.js');
const { Fahrphysik } = await lade('physics.js');
const { Getriebe } = await lade('getriebe.js');
const neueVersion = !!CONFIG.auto.geradeauslauf;

const DT = 1 / 120;
const GRAD = 180 / Math.PI;
const fmt = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
const kmh = (v) => v * 3.6;

function boden(art) {
  const u = CONFIG.untergrund[art];
  return { ...u, steigung: 0, rueckwaerts: u.rueckwaerts ?? 1, heck: u.heck ?? 1, stabilitaet: u.stabilitaet ?? 1, geradeaus: u.geradeaus ?? 1 };
}

// Auto mit Tempo kmh geradeaus, Getriebe im passenden Gang
function auto(tempo) {
  const p = new Fahrphysik();
  p.reset(0, 0, 0);
  p.vz = tempo / 3.6;
  p.vVor = p.vz;
  p.g = new Getriebe();
  for (let i = 0; i < 240; i++) p.g.schritt(DT, { gas: 0.5, bremse: 0, lenkung: 0, handbremse: false }, p.vVor, p.tempo, 1);
  return p;
}
const schritt = (p, e, b) => p.schritt(DT, e, b, p.g.schritt(DT, e, p.vVor, p.tempo, b.grip));

// Tastatur-Lenkung wie in js/input.js (baut sich weich auf und ab)
function tastatur(lenk, ziel) {
  const s = CONFIG.steuerung;
  if (ziel !== 0) return Math.max(-1, Math.min(1, lenk + ziel * s.tastaturLenkTempo * DT));
  const r = s.tastaturRueckTempo * DT;
  return Math.abs(lenk) <= r ? 0 : lenk - Math.sign(lenk) * r;
}

// --- 1. + 2. Handbremse ------------------------------------------------------
// Ab 80 km/h: Handbremse hbDauer Sekunden ziehen (währenddessen per Tastatur voll lenken), danach loslassen.
function handbremse(art, gas, hbDauer, mitHb = true, dauer = 8) {
  const b = boden(art);
  const p = auto(80);
  const punkte = {};
  let unter10 = null, maxVerz = 0, vAlt = p.tempo, lenk = 0;
  for (let t = 0; t < dauer - 1e-9; t += DT) {
    const an = t < hbDauer;
    lenk = tastatur(lenk, an ? 1 : 0);
    schritt(p, { gas, bremse: 0, lenkung: lenk, handbremse: mitHb && an }, b);
    if (vAlt > 15 / 3.6) maxVerz = Math.max(maxVerz, (vAlt - p.tempo) / DT); // ruckartiges Anhalten?
    vAlt = p.tempo;
    if (unter10 === null && kmh(p.tempo) < 10) unter10 = t + DT;
    for (const x of [0.5, 1, 1.5, 2, 3, 4, 5]) if (Math.abs(t + DT - x) < DT / 2) punkte[x] = kmh(p.tempo);
  }
  return { punkte, unter10, maxVerz, ende: kmh(p.tempo) };
}

// --- 3. Rückstellung ---------------------------------------------------------
// Tempo halten (Gas etwa so viel, wie das Tempo braucht), 0.5 s voll einlenken, loslassen.
// "gerade" = ab dann bleiben Gierrate unter 1 °/s und Schwimmwinkel unter 0.5°.
function rueckstellung(art, tempo, pad, ohneHilfe = false) {
  const gl = CONFIG.auto.geradeauslauf;
  const alt = gl ? { ...gl } : null;
  if (ohneHilfe && gl) { gl.gier = 0; gl.schwimm = 0; }
  const b = boden(art);
  const p = auto(tempo);
  const gas = tempo <= 60 ? 0.25 : tempo <= 120 ? 0.45 : 0.9;
  const LENKEN = 0.5;
  let lenk = 0, letzteUnruhe = 0, maxSchwimm = 0, gierLos = 0, schwimmLos = 0;
  for (let t = 0; t < 4 - 1e-9; t += DT) {
    const ziel = t < LENKEN ? 1 : 0;
    lenk = pad ? ziel : tastatur(lenk, ziel);
    schritt(p, { gas, bremse: 0, lenkung: lenk, handbremse: false }, b);
    const gier = Math.abs(p.drehrate * GRAD), schwimm = Math.abs(p.driftWinkel);
    if (Math.abs(t + DT - LENKEN) < DT / 2) { gierLos = gier; schwimmLos = schwimm; }
    if (t + DT > LENKEN) {
      maxSchwimm = Math.max(maxSchwimm, schwimm);
      if (gier >= 1 || schwimm >= 0.5) letzteUnruhe = t + DT;
    }
  }
  if (alt) Object.assign(gl, alt);
  return { gerade: Math.max(0, letzteUnruhe - LENKEN), gierLos, schwimmLos, maxSchwimm };
}

// --- 4. Drift bleibt Drift ----------------------------------------------------
// 80 km/h, 0.6 s Handbremse und voll lenken, dann alles los (Gas halb). Schwimmwinkel 0.3 s und 0.6 s danach.
function drift(art, ohneHilfe = false) {
  const gl = CONFIG.auto.geradeauslauf;
  const alt = gl ? { ...gl } : null;
  if (ohneHilfe && gl) { gl.gier = 0; gl.schwimm = 0; }
  const b = boden(art);
  const p = auto(80);
  let lenk = 0;
  const r = {};
  for (let t = 0; t < 1.2 - 1e-9; t += DT) {
    const an = t < 0.6;
    lenk = tastatur(lenk, an ? 1 : 0);
    schritt(p, { gas: an ? 0 : 0.5, bremse: 0, lenkung: lenk, handbremse: an }, b);
    if (Math.abs(t + DT - 0.6) < DT / 2) r.los = p.driftWinkel;
    if (Math.abs(t + DT - 0.9) < DT / 2) r.d03 = p.driftWinkel;
    if (Math.abs(t + DT - 1.2) < DT / 2) r.d06 = p.driftWinkel;
  }
  if (alt) Object.assign(gl, alt);
  return r;
}

console.log(`Fahrphysik aus: ${wurzel}${neueVersion ? '' : '  (Version vor M3a.2: nur Messwerte, keine Prüfungen)'}`);

console.log('\n1. Handbremse lange halten, ab 80 km/h, voll lenken (Tastatur)');
console.log('| Untergrund | Gas | 0.5 s | 1 s | 1.5 s | 2 s | 3 s | 4 s | 5 s | unter 10 km/h nach | stärkstes Abbremsen über 15 km/h |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
const halten = {};
for (const art of ['asphalt', 'schotter']) {
  for (const gas of [0, 1]) {
    const r = handbremse(art, gas, 99);
    halten[art + gas] = r;
    console.log(`| ${art} | ${gas ? 'voll' : 'los'} | ${[0.5, 1, 1.5, 2, 3, 4, 5].map((x) => fmt(r.punkte[x], 0)).join(' | ')} |` +
      ` ${r.unter10 === null ? 'nie (8 s: ' + fmt(r.ende, 0) + ' km/h)' : fmt(r.unter10, 2) + ' s'} | ${fmt(r.maxVerz, 1)} m/s² |`);
  }
}

console.log('\n2. Handbremse kurz ziehen (dabei voll lenken, danach Lenkung los), Tempo 1.5 s nach dem Start');
console.log('| Untergrund | Gas | ohne Handbremse | 0.3 s gezogen | 0.5 s gezogen |');
console.log('|---|---|---|---|---|');
const kurz = {};
for (const art of ['asphalt', 'schotter']) {
  for (const gas of [0, 1]) {
    const ohne = handbremse(art, gas, 0.5, false, 1.5).punkte[1.5];
    const a = handbremse(art, gas, 0.3, true, 1.5).punkte[1.5];
    const b = handbremse(art, gas, 0.5, true, 1.5).punkte[1.5];
    kurz[art + gas] = { ohne, a, b };
    console.log(`| ${art} | ${gas ? 'voll' : 'los'} | ${fmt(ohne, 0)} km/h | ${fmt(a, 0)} km/h (${fmt(a - ohne, 0)}) | ${fmt(b, 0)} km/h (${fmt(b - ohne, 0)}) |`);
  }
}

console.log('\n3. Rückstellung: 0.5 s voll einlenken, loslassen. Zeit bis gerade (Gierrate unter 1 °/s, Schwimmwinkel unter 0.5°)');
console.log('| Untergrund | Lenkung | Tempo | gerade nach | beim Loslassen: Gierrate / Schwimmwinkel | grösster Schwimmwinkel danach |');
console.log('|---|---|---|---|---|---|');
const rueck = {};
for (const art of ['asphalt', 'schotter']) {
  for (const pad of [false, true]) {
    for (const tempo of [60, 120, 180]) {
      const r = rueckstellung(art, tempo, pad);
      rueck[`${art}-${pad}-${tempo}`] = r;
      console.log(`| ${art} | ${pad ? 'Gamepad' : 'Tastatur'} | ${tempo} km/h | ${fmt(r.gerade, 2)} s | ${fmt(r.gierLos, 1)} °/s / ${fmt(r.schwimmLos, 1)}° | ${fmt(r.maxSchwimm, 1)}° |`);
    }
  }
}

console.log('\n4. Drift mit Handbremse (80 km/h, 0.6 s), danach alles los: Schwimmwinkel');
const drifts = {};
for (const art of ['asphalt', 'schotter']) {
  const r = drift(art), o = neueVersion ? drift(art, true) : null;
  drifts[art] = { r, o };
  console.log(`  ${art.padEnd(8)} beim Loslassen ${fmt(r.los, 1)}°, 0.3 s danach ${fmt(r.d03, 1)}°, 0.6 s danach ${fmt(r.d06, 1)}°` +
    (o ? `  (ohne Geradeauslauf: ${fmt(o.d03, 1)}° / ${fmt(o.d06, 1)}°)` : ''));
}

if (!neueVersion) process.exit(0);

let fehler = 0;
const pruefe = (ok, text) => { console.log(`  ${ok ? 'OK  ' : 'FEHLT'} ${text}`); if (!ok) fehler++; };
console.log('\nPrüfungen:');
for (const gas of [0, 1]) {
  const a = halten['asphalt' + gas], s = halten['schotter' + gas];
  pruefe(a.unter10 !== null && a.unter10 >= 2 && a.unter10 <= 5,
    `Halten, Asphalt, Gas ${gas ? 'voll' : 'los'}: nach 2–5 s unter 10 km/h (${a.unter10 === null ? 'nie' : fmt(a.unter10, 2) + ' s'})`);
  pruefe(s.unter10 !== null && s.unter10 >= a.unter10 && s.unter10 <= 5.5,
    `Halten, Schotter, Gas ${gas ? 'voll' : 'los'}: unter 10 km/h nach höchstens 5.5 s, nicht früher als Asphalt (${s.unter10 === null ? 'nie' : fmt(s.unter10, 2) + ' s'})`);
  for (const art of ['asphalt', 'schotter']) {
    const r = halten[art + gas];
    pruefe(r.maxVerz < 25, `Halten, ${art}, Gas ${gas ? 'voll' : 'los'}: kein schlagartiges Anhalten (höchstens ${fmt(r.maxVerz, 1)} m/s², Grenze 25)`);
    pruefe(r.punkte[5] < 10, `Halten, ${art}, Gas ${gas ? 'voll' : 'los'}: nach 5 s kein Kreisen mehr (${fmt(r.punkte[5], 0)} km/h)`);
  }
}
for (const art of ['asphalt', 'schotter']) {
  for (const gas of [0, 1]) {
    const k = kurz[art + gas];
    pruefe(k.ohne - k.a <= 8, `Kurz ziehen 0.3 s, ${art}, Gas ${gas ? 'voll' : 'los'}: kostet höchstens 8 km/h (${fmt(k.ohne - k.a, 1)})`);
    pruefe(k.ohne - k.b <= 15, `Kurz ziehen 0.5 s, ${art}, Gas ${gas ? 'voll' : 'los'}: kostet höchstens 15 km/h (${fmt(k.ohne - k.b, 1)})`);
  }
}
pruefe(rueck['asphalt-false-120'].gerade >= 0.4 && rueck['asphalt-false-120'].gerade <= 0.7,
  `Rückstellung Asphalt, Tastatur, 120 km/h: 0.4–0.7 s (${fmt(rueck['asphalt-false-120'].gerade, 2)} s)`);
for (const pad of [false, true]) {
  for (const tempo of [60, 120, 180]) {
    const r = rueck[`asphalt-${pad}-${tempo}`];
    pruefe(r.gerade <= 0.8, `Rückstellung Asphalt, ${pad ? 'Gamepad' : 'Tastatur'}, ${tempo} km/h: höchstens 0.8 s (${fmt(r.gerade, 2)} s)`);
    // Einlenken unverändert: bis zum Loslassen gleich wie ohne Geradeauslauf. Mit der Tastatur wirkt die Hilfe
    // in den ersten Hundertstelsekunden (Lenkung noch fast 0) ganz leicht mit: Abweichung weit unter 0.1 °/s.
    const o = rueckstellung('asphalt', tempo, pad, true);
    const dG = Math.abs(o.gierLos - r.gierLos), dS = Math.abs(o.schwimmLos - r.schwimmLos);
    pruefe(dG < 0.05 && dS < 0.02,
      `Einlenken ${pad ? 'Gamepad' : 'Tastatur'} ${tempo} km/h wie ohne Geradeauslauf (Gierrate ${fmt(r.gierLos, 2)} °/s, Abweichung ${fmt(dG, 4)} °/s, Schwimmwinkel ${fmt(dS, 4)}°)`);
  }
}
for (const art of ['asphalt', 'schotter']) {
  const { r, o } = drifts[art];
  pruefe(Math.abs(r.d03 - o.d03) < 0.5, `Drift ${art}: schiebt nach dem Loslassen weiter wie ohne Geradeauslauf (${fmt(r.d03, 1)}° statt ${fmt(o.d03, 1)}°)`);
}
console.log(fehler ? `\n${fehler} Prüfung(en) nicht erfüllt.` : '\nAlle Prüfungen erfüllt.');
process.exit(fehler ? 1 : 0);
