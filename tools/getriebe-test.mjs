// Testlauf für das Getriebe (Meilenstein 1.2, Teil 3).
// Läuft ohne Browser:  node tools/getriebe-test.mjs
// Rechnet mit der echten Fahrphysik (js/physics.js) und dem Getriebe (js/getriebe.js)
// auf flachem Asphalt, geradeaus. Das Spiel selbst lädt diese Datei nicht.

import { CONFIG } from '../js/config.js';
import { Fahrphysik } from '../js/physics.js';
import { Getriebe } from '../js/getriebe.js';

const DT = 1 / 120;
const BODEN = { ...CONFIG.untergrund.asphalt, steigung: 0 };
const fmt = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
const kmh = (v) => v * 3.6;

// Auto + Getriebe, ein Schritt wie im Spiel (main.js)
function neuesAuto(v0 = 0) {
  const p = new Fahrphysik(), g = new Getriebe();
  p.reset(0, 0, 0);
  p.vz = v0;
  p.vVor = v0;
  return {
    p, g,
    schritt(e, boden = BODEN) {
      const motor = g.schritt(DT, e, p.vVor, p.tempo, boden.grip);
      p.schritt(DT, e, boden, motor);
      return motor;
    },
  };
}
const GAS = { gas: 1, bremse: 0, lenkung: 0, handbremse: false };

// --- 1. Vollgas aus dem Stand --------------------------------------------------
console.log('\n1. Vollgas aus dem Stand (flacher Asphalt)');
console.log('| Zeit | Tempo | Gang | Drehzahl | Schaltpause |');
console.log('|---|---|---|---|---|');
const a = neuesAuto();
let t = 0, t100 = null, t160 = null, t185 = null, n = 0;
const schaltungen = [];
let schaltStart = null;
while (t < 60) {
  const vorher = a.p.vVor, warSchalten = a.g.schaltet;
  const motor = a.schritt(GAS);
  t += DT; n++;
  if (!warSchalten && a.g.schaltet) {
    // Beschleunigung direkt vor der Pause (aus dem letzten Schritt mit Antrieb)
    schaltStart = { t, v: vorher, von: a.g.gang, nach: a.g.zielGang, beschlVorher: schaltungen.beschl };
  }
  if (warSchalten && !a.g.schaltet && schaltStart) {
    schaltStart.vEnde = a.p.vVor; schaltStart.tEnde = t; schaltStart.dauer = t - schaltStart.t;
    schaltStart.beschlNachher = null;
    schaltungen.push(schaltStart); schaltStart = null;
  } else if (!a.g.schaltet && schaltungen.length && schaltungen[schaltungen.length - 1].beschlNachher === null) {
    schaltungen[schaltungen.length - 1].beschlNachher = (a.p.vVor - vorher) / DT;
  }
  if (!a.g.schaltet) schaltungen.beschl = (a.p.vVor - vorher) / DT;
  if (n % 30 === 0 && t <= 12.001) {
    console.log(`| ${fmt(t, 2)} s | ${fmt(kmh(a.p.vVor))} km/h | ${a.g.anzeige} | ${Math.round(a.g.drehzahl)} | ${a.g.schaltet ? 'ja' : ''} |`);
  }
  if (t100 === null && kmh(a.p.vVor) >= 100) t100 = t;
  if (t160 === null && kmh(a.p.vVor) >= 160) t160 = t;
  if (t185 === null && kmh(a.p.vVor) >= 185) t185 = t;
}
const vMax = kmh(a.p.vVor);
console.log(`\n0 auf 100 km/h: ${fmt(t100, 2)} s (mit ${schaltungen.filter((s) => s.t < t100).length} Schaltpausen)`);
console.log(`0 auf 160 km/h: ${fmt(t160, 2)} s, 0 auf 185 km/h: ${t185 ? fmt(t185, 1) + ' s' : 'nie'}`);
console.log(`Höchsttempo nach 60 s: ${fmt(vMax)} km/h im ${a.g.anzeige}. Gang bei ${Math.round(a.g.drehzahl)} U/min`);
console.log('\nHochschaltungen:');
console.log('| Schaltung | bei | Dauer | Tempo vorher -> nachher | Verlust gegenüber durchgehendem Antrieb | Beschleunigung vorher -> nachher |');
console.log('|---|---|---|---|---|---|');
for (const s of schaltungen) {
  const verlust = s.v + s.beschlVorher * s.dauer - s.vEnde;
  console.log(`| ${s.von} -> ${s.nach} | ${fmt(kmh(s.v))} km/h | ${fmt(s.dauer, 2)} s | ${fmt(kmh(s.v))} -> ${fmt(kmh(s.vEnde))} km/h` +
    ` (${fmt(kmh(s.vEnde - s.v), 2)}) | ${fmt(kmh(verlust))} km/h | ${fmt(s.beschlVorher, 2)} -> ${fmt(s.beschlNachher, 2)} m/s² |`);
}

// --- 2. Vergleich mit der Fahrphysik von M1.1 (ohne Getriebe) ---------------------
// Damals: Antrieb 6.2 m/s² mal Gas, Luftwiderstand 6.2 * (v / 52.5)².
{
  let v = 0, tt = 0, a100 = null, a160 = null, a185 = null;
  while (tt < 60) {
    v += (6.2 - 6.2 * (v / 52.5) ** 2 - BODEN.rollen) * DT; tt += DT;
    if (a100 === null && kmh(v) >= 100) a100 = tt;
    if (a160 === null && kmh(v) >= 160) a160 = tt;
    if (a185 === null && kmh(v) >= 185) a185 = tt;
  }
  console.log(`\nZum Vergleich M1.1 (ohne Getriebe): 0-100 ${fmt(a100, 2)} s, 0-160 ${fmt(a160, 2)} s, 0-185 ${a185 ? fmt(a185, 1) + ' s' : 'nie'}, Spitze ${fmt(kmh(v))} km/h`);
}

// --- 3. Bremstest: von Höchsttempo voll bremsen bis zum Stand ---------------------
console.log('\n3. Bremstest: mit 180 km/h im 5. Gang, dann voll bremsen bis zum Stand');
{
  const b = neuesAuto(180 / 3.6);
  b.g.gang = 5; b.g.zielGang = 5;
  for (let i = 0; i < 60; i++) b.schritt({ ...GAS, gas: 0.9 }); // einpendeln
  const liste = [];
  let letzte = b.g.letzteSchaltung;
  let tt = 0;
  console.log(`  Start: ${fmt(kmh(b.p.vVor))} km/h, Gang ${b.g.anzeige}`);
  while (b.p.vVor > 0.6 && tt < 20) {
    b.schritt({ gas: 0, bremse: 1, lenkung: 0, handbremse: false }); tt += DT;
    if (b.g.letzteSchaltung !== letzte) { letzte = b.g.letzteSchaltung; liste.push(`${letzte.von} -> ${letzte.nach} bei ${fmt(kmh(letzte.tempo))} km/h (${fmt(tt, 2)} s)`); }
  }
  console.log(`  Runterschaltungen: ${liste.join(', ')}`);
  console.log(`  Stand nach ${fmt(tt, 2)} s`);
}

// --- 4. Ausrollen ohne Gas (Motorbremse je Gang) ----------------------------------
console.log('\n4. Motorbremse: Ausrollen ohne Gas, Verzögerung (m/s²) je Gang (ohne Luft, Rollen)');
{
  const zeilen = [];
  for (let gang = 1; gang <= 5; gang++) {
    const vs = [0.5, 0.8].map((f) => (CONFIG.getriebe.gaenge[gang - 1] / 3.6) * f);
    const werte = vs.map((v) => {
      const b = neuesAuto(v); b.g.gang = gang; b.g.zielGang = gang;
      const m = b.g.schritt(DT, { gas: 0, bremse: 0 }, v, v, 1);
      return `${fmt(kmh(v), 0)} km/h (${Math.round(b.g.drehzahl > 0 ? (v * 3.6 / CONFIG.getriebe.gaenge[gang - 1]) * 7000 : 0)} U/min): ${fmt(m.motorbremse, 2)}`;
    });
    zeilen.push(`  ${gang}. Gang: ${werte.join(', ')}`);
  }
  console.log(zeilen.join('\n'));
  // Ausrollen von 120 km/h ohne Gas: schaltet es hin und her?
  const b = neuesAuto(120 / 3.6);
  b.g.gang = 4; b.g.zielGang = 4;
  let wechsel = 0, letzte = b.g.letzteSchaltung, tt = 0;
  while (b.p.vVor > 1 && tt < 120) { b.schritt({ gas: 0, bremse: 0, lenkung: 0, handbremse: false }); tt += DT; if (b.g.letzteSchaltung !== letzte) { letzte = b.g.letzteSchaltung; wechsel++; } }
  console.log(`  Ausrollen ab 120 km/h im 4. Gang bis fast zum Stand: ${fmt(tt, 1)} s, ${wechsel} Schaltvorgänge (nur runter, kein Hin und Her)`);
}

// --- 5. Kickdown ---------------------------------------------------------------
console.log('\n5. Kickdown: mit 60 km/h im 3. Gang rollen, dann Vollgas');
{
  const b = neuesAuto(60 / 3.6); b.g.gang = 3; b.g.zielGang = 3;
  b.schritt({ gas: 0.3, bremse: 0, lenkung: 0, handbremse: false });
  const vorher = b.g.anzeige;
  let tt = 0;
  while (tt < 0.3) { b.schritt(GAS); tt += DT; }
  console.log(`  Gang vorher ${vorher}, nach 0.3 s: ${b.g.anzeige} (Drehzahl ${Math.round(b.g.drehzahl)})`);
}

// --- 6. Anfahren auf Gras und Leerlauf ---------------------------------------------
console.log('\n6. Anfahren auf Gras / Leerlauf / Rückwärts');
{
  const gras = { ...CONFIG.untergrund.gras, steigung: 0 };
  for (const [name, boden] of [['Asphalt', BODEN], ['Gras', gras]]) {
    const b = neuesAuto();
    let tt = 0, maxB = 0;
    while (tt < 1) { const m = b.schritt(GAS, boden); maxB = Math.max(maxB, m.beschl); tt += DT; }
    console.log(`  ${name}: Antrieb max ${fmt(maxB, 2)} m/s², nach 1 s ${fmt(kmh(b.p.vVor))} km/h`);
  }
  const b = neuesAuto();
  const anz = [];
  for (const [name, e, dauer] of [['Stand', { gas: 0, bremse: 0 }, 1], ['Gas', { gas: 1, bremse: 0 }, 0.5], ['Bremse', { gas: 0, bremse: 1 }, 1.5],
    ['Rückwärts', { gas: 0, bremse: 1 }, 1], ['loslassen', { gas: 0, bremse: 0 }, 3]]) {
    let wechsel = new Set();
    for (let tt = 0; tt < dauer; tt += DT) { b.schritt({ ...e, lenkung: 0, handbremse: false }); wechsel.add(b.g.anzeige); }
    anz.push(`${name}: ${[...wechsel].join('/')} (${fmt(kmh(b.p.vVor))} km/h, ${Math.round(b.g.drehzahl)} U/min)`);
  }
  console.log(`  ${anz.join(' -> ')}`);
}
