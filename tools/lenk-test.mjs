// Testlauf für die Lenkung (Meilenstein 1.2, Teil 2).
// Läuft ohne Browser:  node tools/lenk-test.mjs
// Rechnet mit der echten Fahrphysik (js/physics.js) auf flachem Asphalt.
// Für jedes Tempo: Auto fährt mit vollem Lenkeinschlag im Kreis, ein einfacher
// Regler hält das Tempo. Gemessen werden Einschlag, Wendekreis-Radius und Drehrate,
// einmal ohne (vorher) und einmal mit dem neuen Extra-Einschlag im Schritttempo.

import { CONFIG } from '../js/config.js';
import { Fahrphysik } from '../js/physics.js';
import { Getriebe } from '../js/getriebe.js';

const DT = 1 / 120;
const BODEN = { ...CONFIG.untergrund.asphalt, steigung: 0 };
const GRAD = 180 / Math.PI;
const fmt = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);

// Ein Physik-Schritt wie im Spiel: das Getriebe liefert Antrieb und Motorbremse
function schritt(p, e) {
  if (!p.getriebe) p.getriebe = new Getriebe();
  p.schritt(DT, e, BODEN, p.getriebe.schritt(DT, e, p.vVor, p.tempo, BODEN.grip));
}

// Kreisfahrt mit Tempo kmh (negativ = rückwärts), vollem Einschlag nach rechts.
// Ein Regler (P + I) hält das Tempo.
function kreis(kmh) {
  const p = new Fahrphysik();
  p.reset(0, 0, 0);
  const ziel = kmh / 3.6;
  let drehSumme = 0, vSumme = 0, n = 0, lenk = 0, integral = 0;
  for (let t = 0; t < 10; t += DT) {
    const fehlerV = Math.abs(ziel) - Math.abs(p.vVor);
    integral = Math.max(-2, Math.min(2, integral + fehlerV * DT));
    const f = fehlerV * 3 + integral * 2;
    const treten = Math.max(0, Math.min(1, f)), bremsen = Math.max(0, Math.min(1, -f));
    const e = ziel >= 0
      ? { gas: treten, bremse: p.vVor > 0.6 ? bremsen : 0, lenkung: 1, handbremse: false }
      : { gas: p.vVor < -0.6 ? bremsen : 0, bremse: treten, lenkung: 1, handbremse: false };
    schritt(p, e);
    if (t > 6) { drehSumme += Math.abs(p.drehrate); vSumme += p.tempo; lenk = Math.max(lenk, Math.abs(p.lenkwinkel)); n++; }
  }
  const dreh = drehSumme / n, v = vSumme / n;
  return { tempo: v * 3.6, lenk: lenk * GRAD, dreh: dreh * GRAD, radius: dreh > 1e-6 ? v / dreh : Infinity };
}

// Hohes Tempo: geradeaus mit kmh, dann 1 s voll einlenken (Gas gehalten).
// Gemessen: Einschlag sofort, Drehrate nach 0.5 s, Tempo und Driftwinkel nach 1 s.
function einlenken(kmh) {
  const p = new Fahrphysik();
  p.reset(0, 0, 0);
  p.vz = kmh / 3.6;
  p.vVor = p.vz;
  let lenk = 0, dreh = 0;
  for (let t = 0; t < 1 - 1e-9; t += DT) {
    schritt(p, { gas: 1, bremse: 0, lenkung: 1, handbremse: false });
    if (!lenk) lenk = Math.abs(p.lenkwinkel) * GRAD;
    if (Math.abs(t - 0.5) < DT / 2) dreh = Math.abs(p.drehrate) * GRAD;
  }
  return { tempo: p.tempo * 3.6, lenk, dreh, drift: Math.abs(p.driftWinkel), radius: p.tempo / (Math.abs(p.drehrate) || 1e-9) };
}

// Ablauf wie nach einem Aufprall: Stand -> rückwärts mit vollem Einschlag -> vorwärts mit vollem Einschlag
function ablauf() {
  const p = new Fahrphysik();
  p.reset(0, 0, 0);
  const zeilen = [];
  const phase = (name, e, dauer) => {
    for (let t = 0; t < dauer; t += DT) schritt(p, e);
    zeilen.push(`  ${name.padEnd(28)} Tempo ${fmt(p.vVor * 3.6, 1).padStart(6)} km/h, Einschlag ${fmt(Math.abs(p.lenkwinkel) * GRAD, 1)}°,` +
      ` Blickrichtung ${fmt(p.richtung * GRAD, 0)}°`);
  };
  phase('Stand (1 s nichts)', { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, 1);
  phase('1.5 s rückwärts, voll links', { gas: 0, bremse: 1, lenkung: -1, handbremse: false }, 1.5);
  phase('0.8 s bremsen (Gas)', { gas: 1, bremse: 0, lenkung: -1, handbremse: false }, 0.8);
  phase('1.5 s vorwärts, voll rechts', { gas: 0.5, bremse: 0, lenkung: 1, handbremse: false }, 1.5);
  return zeilen;
}

const tempi = [5, 10, -5, -10, 20, 30];
const schnell = [40, 100, 150];
const ergebnis = {};
for (const art of ['vorher', 'nachher']) {
  const alt = CONFIG.auto.lenkwinkelStand;
  if (art === 'vorher') CONFIG.auto.lenkwinkelStand = 0;
  ergebnis[art] = tempi.map(kreis);
  ergebnis[art + 'Schnell'] = schnell.map(einlenken);
  ergebnis[art + 'Ablauf'] = ablauf();
  CONFIG.auto.lenkwinkelStand = alt;
}

console.log('\nKreisfahrt mit vollem Lenkeinschlag (flacher Asphalt), vorher -> nachher');
console.log('| Tempo (gemessen) | Einschlag | Wendekreis-Radius | Drehrate |');
console.log('|---|---|---|---|');
tempi.forEach((k, i) => {
  const a = ergebnis.vorher[i], b = ergebnis.nachher[i];
  console.log(`| ${k} km/h${k < 0 ? ' rückwärts' : ''} (${fmt(a.tempo)} / ${fmt(b.tempo)}) | ${fmt(a.lenk)}° -> ${fmt(b.lenk)}° |` +
    ` ${fmt(a.radius, 2)} m -> ${fmt(b.radius, 2)} m | ${fmt(a.dreh, 0)}°/s -> ${fmt(b.dreh, 0)}°/s |`);
});
console.log('\nHohes Tempo: geradeaus, dann 1 s voll einlenken mit Gas (vorher | nachher)');
schnell.forEach((k, i) => {
  const a = ergebnis.vorherSchnell[i], b = ergebnis.nachherSchnell[i];
  const t = (r) => `Einschlag ${fmt(r.lenk)}°, Drehrate ${fmt(r.dreh, 1)}°/s, nach 1 s ${fmt(r.tempo, 1)} km/h, Drift ${fmt(r.drift, 1)}°`;
  console.log(`  ${k} km/h: ${t(a)} | ${t(b)}`);
});
console.log('\nAblauf nach einem Aufprall, vorher:');
console.log(ergebnis.vorherAblauf.join('\n'));
console.log('nachher:');
console.log(ergebnis.nachherAblauf.join('\n'));

let fehler = 0;
const pruefe = (ok, text) => { console.log(`  ${ok ? 'OK  ' : 'FEHLT'} ${text}`); if (!ok) fehler++; };
console.log('\nPrüfungen:');
const n5 = ergebnis.nachher[0];
pruefe(n5.radius < 3, `5 km/h: Wendekreis-Radius unter 3 m (${fmt(n5.radius, 2)} m)`);
pruefe(n5.dreh >= 30, `5 km/h: Drehrate mindestens 30°/s (${fmt(n5.dreh, 0)}°/s)`);
for (const k of schnell) {
  const i = schnell.indexOf(k), a = ergebnis.vorherSchnell[i], b = ergebnis.nachherSchnell[i];
  pruefe(a.lenk === b.lenk && a.dreh === b.dreh && a.tempo === b.tempo && a.drift === b.drift,
    `${k} km/h: genau wie vorher (Einschlag ${fmt(b.lenk)}°, Drehrate ${fmt(b.dreh, 1)}°/s)`);
}
{
  // Im Stand nur lenken (kein Pedal): das Auto darf sich nicht von selbst bewegen
  const p = new Fahrphysik();
  p.reset(0, 0, 0);
  for (let t = 0; t < 2; t += DT) schritt(p, { gas: 0, bremse: 0, lenkung: 1, handbremse: false });
  pruefe(Math.hypot(p.x, p.z) < 0.01 && Math.abs(p.richtung) < 0.01,
    `im Stand nur lenken: bleibt stehen (Weg ${fmt(Math.hypot(p.x, p.z), 2)} m, gedreht ${fmt(p.richtung * GRAD, 1)}°, vorher in M1.1: 3.7 m rückwärts gekrochen)`);
}
console.log(fehler ? `\n${fehler} Prüfung(en) nicht erfüllt.` : '\nAlle Prüfungen erfüllt.');
