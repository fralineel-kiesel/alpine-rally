// Testlauf für den Aufprall (Meilenstein 1.1, Teil 1).
// Läuft ohne Browser:  node tools/aufprall-test.mjs
// Rechnet mit der echten Fahrphysik (js/physics.js) und Kollision (js/kollision.js)
// auf flachem Asphalt. Das Spiel selbst lädt diese Datei nicht.

import { CONFIG } from '../js/config.js';
import { Fahrphysik } from '../js/physics.js';
import { baueKollision } from '../js/kollision.js';

const DT = 1 / 120;
const BODEN = { ...CONFIG.untergrund.asphalt, steigung: 0 };
const GRAD = 180 / Math.PI;
const kmh = (v) => v * 3.6;

// Auto fährt mit Tempo v0 (km/h) in Richtung +z auf die Hindernisse zu.
// eingabe: was der Fahrer drückt (vor und nach dem Aufprall)
function fahre({ hindernisse, v0, x0 = 0, start = -4, richtung = 0, vorher, nachher, nachherDauer = 2, stopNach = 0.4 }) {
  const kol = baueKollision(hindernisse);
  const p = new Fahrphysik();
  p.reset(x0, start, richtung);
  p.vx = Math.sin(richtung) * v0 / 3.6;
  p.vz = Math.cos(richtung) * v0 / 3.6;
  let t = 0, aufprallT = -1, vorherTempo = 0, minZ = Infinity, maxEindringen = 0;
  let stand = null, ende = null;
  const schritt = (e) => {
    const xA = p.x, zA = p.z, wA = p.richtung;
    const tempoVor = p.tempo;
    p.schritt(DT, e, BODEN);
    const traf = kol.loese(p, xA, zA, wA);
    if (traf && aufprallT < 0) { aufprallT = t; vorherTempo = tempoVor; }
    // eindringen: wie tief steckt ein Hindernis im Auto (nach der Kollision)?
    maxEindringen = Math.max(maxEindringen, eindringen(p, hindernisse));
    t += DT;
  };
  // Phase 1: zufahren mit konstantem Tempo (Gas so, dass es etwa bleibt) bis kurz nach dem Aufprall
  while (t < 10 && (aufprallT < 0 || t < aufprallT + stopNach)) {
    schritt(aufprallT < 0 ? vorher : nachher);
  }
  stand = { t, x: p.x, z: p.z, w: p.richtung, tempo: p.tempo };
  const ersterAufprall = kol.letzterAufprall;
  // Phase 2: Fahrer drückt "nachher" für nachherDauer Sekunden
  const t0 = t;
  let maxTempo2 = 0;
  while (t < t0 + nachherDauer) { schritt(nachher); maxTempo2 = Math.max(maxTempo2, p.tempo); }
  ende = { x: p.x, z: p.z, w: p.richtung, tempo: p.tempo };
  return { kol, ersterAufprall, aufprallT, vorherTempo, stand, ende, eingedrungen: maxEindringen > 0.05, maxEindringen, maxTempo2, x0, richtung };
}

// Wie tief steckt das tiefste Hindernis im Auto-Rechteck (Meter, 0 = gar nicht)?
function eindringen(p, hindernisse) {
  const k = CONFIG.kollision;
  const kl = k.autoLaenge / 2 - k.eckRadius, kb = k.autoBreite / 2 - k.eckRadius;
  let max = 0;
  for (const h of hindernisse) {
    const dx = h.x - p.x, dz = h.z - p.z;
    const v = dx * Math.sin(p.richtung) + dz * Math.cos(p.richtung);
    const s = dx * Math.cos(p.richtung) - dz * Math.sin(p.richtung);
    const ev = Math.abs(v) - kl, es = Math.abs(s) - kb;
    const d = ev > 0 || es > 0 ? Math.hypot(Math.max(ev, 0), Math.max(es, 0)) : Math.max(ev, es);
    max = Math.max(max, h.r + k.eckRadius - d);
  }
  return max;
}

const GAS = { gas: 1, bremse: 0, lenkung: 0, handbremse: false };
const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false };
const BREMSE = { gas: 0, bremse: 1, lenkung: 0, handbremse: false };
const tanne = (x = 0) => [{ x, z: 0, r: CONFIG.kollision.stammRadius }];
const fmt = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
let fehler = 0;
function pruefe(ok, text) {
  console.log(`  ${ok ? 'OK  ' : 'FEHLT'} ${text}`);
  if (!ok) fehler++;
}

// --- 1. Frontal 100 km/h gegen eine Tanne -------------------------------
console.log('\n1. Frontal mit 100 km/h gegen eine Tanne');
for (const [name, nachher] of [['Bremse/Rückwärts', BREMSE], ['Gas gehalten', GAS], ['nichts gedrückt', LEER]]) {
  const r = fahre({ hindernisse: tanne(0), v0: 100, vorher: LEER, nachher });
  const kr = r.ersterAufprall;
  const seit = r.stand.x - r.x0;
  const dreh = (r.stand.w - r.richtung) * GRAD;
  console.log(`  -- danach: ${name}`);
  console.log(`     Aufprall (F3): ${fmt(kmh(kr.vorher), 0)} -> ${fmt(kmh(kr.nachher), 1)} km/h,` +
    ` 0.4 s danach: ${fmt(kmh(r.stand.tempo), 1)} km/h, seitlich ${fmt(seit, 2)} m, Drehung ${fmt(dreh, 2)}°`);
  if (name === 'Bremse/Rückwärts') {
    pruefe(kmh(kr.nachher) < 5, `Tempo danach unter 5 km/h (${fmt(kmh(kr.nachher), 1)})`);
    pruefe(Math.abs(seit) < 0.5, `seitlich unter 0.5 m (${fmt(seit, 2)})`);
    pruefe(Math.abs(dreh) <= 5, `Drehung höchstens 5° (${fmt(dreh, 2)})`);
    pruefe(kmh(kr.nachher) <= 3, `Rückprall höchstens 3 km/h (${fmt(kmh(kr.nachher), 1)})`);
    const zurueck = r.stand.z - r.ende.z;
    console.log(`     nach 2 s Bremse/Rückwärts: ${fmt(zurueck, 2)} m rückwärts weg (gerechnet ab 0.4 s nach dem Aufprall)`);
    // wie lange bis 8 m?
    const r2 = fahre({ hindernisse: tanne(0), v0: 100, vorher: LEER, nachher: BREMSE, nachherDauer: 10 });
    let tt = 0; {
      const kol = baueKollision(tanne(0)); const p = new Fahrphysik(); p.reset(0, r.stand.z, 0);
      const z0 = p.z; while (z0 - p.z < 8 && tt < 10) { const a = [p.x, p.z, p.richtung]; p.schritt(DT, BREMSE, BODEN); kol.loese(p, ...a); tt += DT; }
    }
    let weg2 = 0; {
      const p = new Fahrphysik(); p.reset(0, 0, 0);
      for (let t2 = 0; t2 < 2 - 1e-9; t2 += DT) p.schritt(DT, BREMSE, BODEN);
      weg2 = -p.z;
    }
    console.log(`     aus dem Stand am Baum: nach 2 s ${fmt(weg2, 2)} m rückwärts, 8 m nach ${fmt(tt, 2)} s (Rückwärtsgang: max ${fmt(kmh(CONFIG.auto.rueckwaertsTempo), 0)} km/h)`);
    pruefe(zurueck > 3 && !r2.eingedrungen, 'fährt rückwärts weg, bleibt nicht hängen');
  }
  if (name === 'Gas gehalten') {
    const bew = Math.hypot(r.ende.x - r.stand.x, r.ende.z - r.stand.z);
    const dreh2 = (r.ende.w - r.stand.w) * GRAD;
    console.log(`     2 s Gas am Baum: bewegt ${fmt(bew, 3)} m, gedreht ${fmt(dreh2, 2)}°, max. Tempo ${fmt(kmh(r.maxTempo2), 2)} km/h`);
    pruefe(bew < 0.1 && Math.abs(dreh2) < 1 && !r.eingedrungen, 'mit Gas bleibt das Auto ruhig stehen');
  }
}

// --- 2. Spiegeltest -------------------------------------------------------
console.log('\n2. Spiegeltest (Tanne links/rechts der Automitte, 100 km/h, danach nichts gedrückt)');
for (const versatz of [0.4, 0.9, 1.2]) {
  const res = [-1, 1].map((seite) => {
    const r = fahre({ hindernisse: tanne(seite * versatz), v0: 100, vorher: LEER, nachher: LEER, stopNach: 1.5 });
    return { seite, tempo: r.stand.tempo, x: r.stand.x, z: r.stand.z, w: r.stand.w, nach: r.ersterAufprall.nachher };
  });
  const [l, rr] = res;
  const gleich = Math.abs(l.tempo - rr.tempo) < 1e-9 && Math.abs(l.x + rr.x) < 1e-9 && Math.abs(l.z - rr.z) < 1e-9 && Math.abs(l.w + rr.w) < 1e-9;
  console.log(`  ${versatz} m: links -> ${fmt(kmh(l.nach), 1)} km/h, x ${fmt(l.x, 3)}, Drehung ${fmt(l.w * GRAD, 2)}°` +
    ` | rechts -> ${fmt(kmh(rr.nach), 1)} km/h, x ${fmt(rr.x, 3)}, Drehung ${fmt(rr.w * GRAD, 2)}°`);
  pruefe(gleich, `spiegelbildlich gleich bei ${versatz} m`);
}

// --- 3. Schräg und Streifschuss -------------------------------------------
// Ein liegender Stamm (Kreise alle 0.6 m) quer zur Fahrt, das Auto trifft ihn
// unter dem Winkel "winkel" (0° = frontal, 90° = parallel).
console.log('\n3. Schräger Aufprall gegen einen liegenden Stamm (100 km/h, Gas los)');
function stamm(winkelGrad, laenge = 60, r = 0.45, mz = 10) {
  // Stamm-Achse: 0° = quer zur Fahrt, 90° = parallel, geht durch (0, mz)
  const a = winkelGrad / GRAD;
  const ax = Math.cos(a), az = Math.sin(a);
  const liste = [];
  for (let d = -laenge / 2; d <= laenge / 2 + 1e-9; d += 0.6) liste.push({ x: ax * d, z: mz + az * d, r });
  return liste;
}
// Startpunkt so, dass das Auto am Anfang frei steht (vor dem Stamm)
const stammStart = (winkelGrad) => Math.min(4, 7.3 - 1.6 * Math.tan(Math.min(89, winkelGrad) / GRAD));
const zeile = [];
for (const winkel of [0, 15, 20, 30, 45, 60, 70, 75, 80, 85]) {
  const r = fahre({ hindernisse: stamm(winkel), v0: 100, start: stammStart(winkel), vorher: LEER, nachher: LEER, stopNach: 0.001 });
  const a = r.ersterAufprall;
  const rest = a ? a.nachher / a.vorher : 1;
  zeile.push(`${winkel}°: ${fmt(rest * 100, 0)} % (gemessen ${fmt(a ? a.winkel : 0, 0)}°)`);
  if (winkel === 20) pruefe(rest < 0.05, `20°: praktisch Stopp (${fmt(rest * 100, 0)} % bleiben)`);
  if (winkel === 45) pruefe(rest >= 0.18 && rest <= 0.32, `45°: 20–30 % bleiben (${fmt(rest * 100, 0)} %)`);
  if (winkel === 75) pruefe(rest >= 0.78 && rest <= 0.9, `75°: 10–20 % Verlust (${fmt((1 - rest) * 100, 0)} %)`);
}
console.log('  Tempo direkt nach dem Aufprall (Anteil vom Tempo davor): ' + zeile.join(', '));
for (const winkel of [45, 75]) {
  const r = fahre({ hindernisse: stamm(winkel), v0: 100, start: stammStart(winkel), vorher: LEER, nachher: LEER, stopNach: 1 });
  console.log(`  ${winkel}°, 1 s danach: ${fmt(kmh(r.stand.tempo), 0)} km/h, Blickrichtung gedreht um ${fmt((r.stand.w) * GRAD, 1)}°, im Stamm: ${r.eingedrungen ? 'JA' : 'nein'}`);
  pruefe(!r.eingedrungen && Math.abs(r.stand.w * GRAD) < 60, `${winkel}°: kontrollierbar, kein wildes Drehen`);
}

// --- 4. 190 km/h -------------------------------------------------------------
console.log('\n4. 190 km/h');
{
  let durch = 0, n = 0;
  for (let versatz = -1.3; versatz <= 1.3; versatz += 0.05) {
    for (const nach of [GAS, LEER]) {
      const r = fahre({ hindernisse: tanne(versatz), v0: 190, start: -10, vorher: GAS, nachher: nach, stopNach: 1 });
      n++;
      if (r.eingedrungen) durch++;
    }
  }
  const r = fahre({ hindernisse: tanne(0), v0: 190, start: -10, vorher: GAS, nachher: LEER });
  console.log(`  frontal: ${fmt(kmh(r.ersterAufprall.vorher), 0)} -> ${fmt(kmh(r.ersterAufprall.nachher), 1)} km/h`);
  pruefe(durch === 0, `nie durch den Stamm (${n} Anfahrten, Versatz -1.3 bis 1.3 m)`);
  // zufällige Richtungen gegen Stämme und Steine
  let rnd = 7;
  const zz = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  let durch2 = 0;
  for (let i = 0; i < 300; i++) {
    const w = (zz() - 0.5) * 1.2;
    const hind = i % 3 === 0 ? stamm(zz() * 90) : i % 3 === 1 ? tanne((zz() - 0.5) * 2.4) : [{ x: (zz() - 0.5) * 3, z: 0, r: 1.4 }];
    const p = new Fahrphysik(); p.reset(-Math.sin(w) * 30, -Math.cos(w) * 30, w);
    p.vx = Math.sin(w) * 52.5; p.vz = Math.cos(w) * 52.5;
    const kol = baueKollision(hind);
    for (let t = 0; t < 2; t += DT) {
      const a = [p.x, p.z, p.richtung]; p.schritt(DT, GAS, BODEN); kol.loese(p, ...a);
      if (eindringen(p, hind) > 0.05) { durch2++; break; }
    }
  }
  pruefe(durch2 === 0, `300 Anfahrten mit 190 km/h aus zufälligen Richtungen (Tannen, Stämme, Felsbrocken): ${durch2} mal eingedrungen`);
}

// --- 5. Stein wie Baum --------------------------------------------------------
console.log('\n5. Stein (Radius 0.6 m) und grosser Felsbrocken (Radius 1.4 m), frontal 100 km/h');
for (const r0 of [0.6, 1.4]) {
  const r = fahre({ hindernisse: [{ x: 0.3, z: 0, r: r0 }], v0: 100, vorher: LEER, nachher: BREMSE });
  const a = r.ersterAufprall;
  console.log(`  Radius ${r0}: ${fmt(kmh(a.vorher), 0)} -> ${fmt(kmh(a.nachher), 1)} km/h, seitlich ${fmt(r.stand.x, 2)} m, Drehung ${fmt(r.stand.w * GRAD, 2)}°, nach 2 s rückwärts ${fmt(r.stand.z - r.ende.z, 1)} m`);
  pruefe(kmh(a.nachher) < 5 && Math.abs(r.stand.x - 0) < 0.5, `Stein Radius ${r0} verhält sich wie ein Baum`);
}

console.log(fehler ? `\n${fehler} Prüfung(en) nicht erfüllt.` : '\nAlle Prüfungen erfüllt.');
