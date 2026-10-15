// Fahrgefühl je Belag messen (Meilenstein 3b).  node tools/belag-test.mjs [--wurzel <ordner>]
// Läuft ohne Browser: echte Fahrphysik (js/physics.js) und Getriebe, flacher Boden (ausser "Anfahren am Berg").
// Für jeden Untergrund (asphalt, schotter, wiesenweg, bankett, gras):
//   1. Kurvenfahrt unter Gas: 70 km/h, Tastatur voll eingelenkt, Gas voll – grösster und mittlerer
//      Driftwinkel (Heck kommt?), wie viel Tempo nach 2 s noch da ist
//   2. Handbremse: 80 km/h, 0.6 s ziehen und voll lenken, dann los und gegenlenken bis gerade –
//      grösster Driftwinkel und wie lange bis wieder gerade (unter 3°) = "einfangen"
//   3. Bremsweg 80 -> 0 km/h (Vollbremsung geradeaus)
//   4. Ausrollen: 80 km/h, Gas weg – Tempo nach 3 s
//   5. Anfahren am Berg (8 % bergauf): Zeit von 0 auf 50 km/h
//   6. engster Kurvenradius bei 60 km/h (wie viel Haftung in der Kurve)
// Prüft: Asphalt und Schotter genau wie vorher (Werte aus M3a/M3a.2 unverändert), der Wiesenweg liegt
// zwischen Schotter und Gras (weniger Haftung als Schotter, kein Eis: wird immer wieder eingefangen).

import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const lade = (datei) => import(pathToFileURL(path.join(wurzel, 'js', datei)).href);
const { CONFIG } = await lade('config.js');
const { Fahrphysik } = await lade('physics.js');
const { Getriebe } = await lade('getriebe.js');

const DT = 1 / 120;
const GRAD = 180 / Math.PI;
const kmh = (v) => v * 3.6;
const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1);

function boden(art, steigung = 0) {
  const u = CONFIG.untergrund[art];
  return { ...u, steigung, rueckwaerts: u.rueckwaerts ?? 1, heck: u.heck ?? 1, stabilitaet: u.stabilitaet ?? 1, geradeaus: u.geradeaus ?? 1 };
}
function auto(tempo) {
  const p = new Fahrphysik();
  p.reset(0, 0, 0);
  p.vz = tempo / 3.6; p.vVor = p.vz;
  p.g = new Getriebe();
  for (let i = 0; i < 240; i++) p.g.schritt(DT, { gas: 0.5, bremse: 0, lenkung: 0, handbremse: false }, p.vVor, p.tempo, 1);
  return p;
}
const schritt = (p, e, b) => p.schritt(DT, e, b, p.g.schritt(DT, e, p.vVor, p.tempo, b.grip));
function tastatur(lenk, ziel) {
  const s = CONFIG.steuerung;
  if (ziel !== 0) return Math.max(-1, Math.min(1, lenk + ziel * s.tastaturLenkTempo * DT));
  const r = s.tastaturRueckTempo * DT;
  return Math.abs(lenk) <= r ? 0 : lenk - Math.sign(lenk) * r;
}

// 1. Kurvenfahrt unter Gas
function kurveGas(art) {
  const b = boden(art), p = auto(70);
  let lenk = 0, max = 0, summe = 0, n = 0;
  for (let t = 0; t < 2; t += DT) {
    lenk = tastatur(lenk, 1);
    schritt(p, { gas: 1, bremse: 0, lenkung: lenk, handbremse: false }, b);
    const d = Math.abs(p.driftWinkel);
    max = Math.max(max, d);
    if (t > 0.8) { summe += d; n++; }
  }
  return { max, mittel: summe / n, tempo: kmh(p.tempo) };
}
// 2. Handbremse und einfangen (gegenlenken wie ein Fahrer: Lenkung gegen den Driftwinkel)
function handbremse(art) {
  const b = boden(art), p = auto(80);
  let lenk = 0, max = 0, gerade = null, dreher = false;
  for (let t = 0; t < 6; t += DT) {
    const an = t < 0.6;
    let ziel = an ? 1 : 0;
    if (!an) ziel = Math.max(-1, Math.min(1, -p.driftWinkel / 12)); // gegenlenken
    lenk = an ? tastatur(lenk, 1) : ziel;
    schritt(p, { gas: an ? 0.2 : 0.5, bremse: 0, lenkung: lenk, handbremse: an }, b);
    max = Math.max(max, Math.abs(p.driftWinkel));
    if (Math.abs(p.driftWinkel) > 100) dreher = true;
    if (!an && gerade === null && Math.abs(p.driftWinkel) < 3 && t > 0.7) gerade = t - 0.6;
  }
  return { max, gerade, dreher, tempo: kmh(p.tempo) };
}
// 3. Bremsweg
function bremsweg(art) {
  const b = boden(art), p = auto(80);
  let weg = 0;
  for (let t = 0; t < 10 && p.tempo > 0.3; t += DT) { schritt(p, { gas: 0, bremse: 1, lenkung: 0, handbremse: false }, b); weg += p.tempo * DT; }
  return weg;
}
// 4. Ausrollen
function ausrollen(art) {
  const b = boden(art), p = auto(80);
  for (let t = 0; t < 3; t += DT) schritt(p, { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, b);
  return kmh(p.tempo);
}
// 5. Anfahren am Berg (8 %)
function anfahren(art) {
  const b = boden(art, Math.sin(Math.atan(0.08))), p = auto(0);
  for (let t = 0; t < 20; t += DT) {
    schritt(p, { gas: 1, bremse: 0, lenkung: 0, handbremse: false }, b);
    if (kmh(p.tempo) >= 50) return t;
  }
  return null;
}
// 6. Engster Kurvenradius bei 60 km/h: Tempo gehalten, Tastatur voll eingelenkt. Radius der Bahn = Tempo /
//    Drehung der Fahrtrichtung (nicht der Blickrichtung: im Drift dreht das Auto mehr, als es um die Kurve fährt),
//    gemittelt über die letzte Sekunde. Kleiner = mehr Haftung
function kreis(art) {
  const b = boden(art), p = auto(60);
  let lenk = 0, summe = 0, n = 0, wAlt = Math.atan2(p.vx, p.vz);
  for (let t = 0; t < 3; t += DT) {
    lenk = tastatur(lenk, 1);
    schritt(p, { gas: p.tempo < 60 / 3.6 ? 1 : 0.3, bremse: 0, lenkung: lenk, handbremse: false }, b);
    const w = Math.atan2(p.vx, p.vz), dw = Math.atan2(Math.sin(w - wAlt), Math.cos(w - wAlt)) / DT;
    wAlt = w;
    if (t > 2) { summe += p.tempo / Math.max(1e-3, Math.abs(dw)); n++; }
  }
  return summe / n;
}

const ARTEN = ['asphalt', 'schotter', 'wiesenweg', 'bankett', 'gras'].filter((a) => CONFIG.untergrund[a]);
const zeilen = {};
console.log(`Fahrphysik aus: ${wurzel}`);
console.log('Belag       | Kurve unter Gas: Drift max/mittel, Tempo nach 2 s | Handbremse: Drift max, wieder gerade nach | Bremsweg 80->0 | ausrollen 80 km/h, nach 3 s | 0->50 km/h am Berg (8 %) | engster Radius bei 60 km/h');
for (const art of ARTEN) {
  const k = kurveGas(art), h = handbremse(art), bw = bremsweg(art), ar = ausrollen(art), an = anfahren(art), kr = kreis(art);
  zeilen[art] = { k, h, bw, ar, an, kr };
  console.log(`${art.padEnd(11)} | ${f1(k.max).padStart(5)}° / ${f1(k.mittel).padStart(5)}°, ${f1(k.tempo).padStart(5)} km/h` +
    `                     | ${f1(h.max).padStart(5)}°, ${h.gerade === null ? 'NIE' : f1(h.gerade) + ' s'}${h.dreher ? ' (DREHER)' : ''}` +
    `                     | ${f1(bw).padStart(5)} m       | ${f1(ar).padStart(5)} km/h                  | ${an === null ? 'nie' : f1(an) + ' s'}                     | ${f1(kr)} m`);
}
let fehler = 0;
const pruefe = (ok, text) => { console.log(`${ok ? 'OK    ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const w = zeilen.wiesenweg, s = zeilen.schotter, g = zeilen.gras, a = zeilen.asphalt;
if (w) {
  pruefe(w.k.mittel > s.k.mittel, `Wiesenweg driftet unter Gas mehr als Schotter (${f1(w.k.mittel)}° gegen ${f1(s.k.mittel)}°)`);
  pruefe(w.h.gerade !== null && w.h.gerade < 3 && !w.h.dreher, `Wiesenweg: nach der Handbremse wieder eingefangen (${w.h.gerade === null ? 'nie' : f1(w.h.gerade) + ' s'}, kein Dreher) – kein Eis`);
  pruefe(w.bw < a.bw * 1.25, `Bremsweg Wiesenweg höchstens 25 % länger als auf Asphalt (${f1(w.bw)} m gegen ${f1(a.bw)} m) – kein Eis`);
  pruefe(w.ar < s.ar && w.ar > g.ar, `Ausrollen: Wiesenweg bremst mehr als Schotter, viel weniger als Gras (nach 3 s ${f1(w.ar)} km/h; Schotter ${f1(s.ar)}, Gras ${f1(g.ar)})`);
  pruefe(w.kr > s.kr && w.kr <= g.kr * 1.05, `Kurve: weniger Haftung als Schotter, nicht weniger als Gras (engster Radius ${f1(w.kr)} m; Schotter ${f1(s.kr)}, Gras ${f1(g.kr)})`);
  pruefe(w.an !== null && w.an < g.an, `Anfahren am Berg klappt (${f1(w.an)} s, Gras ${f1(g.an)} s, Asphalt ${f1(a.an)} s)`);
}
process.exit(fehler ? 1 : 0);
