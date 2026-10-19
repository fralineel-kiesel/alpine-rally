// Browser-Hilfe für tools/ton-umgebung-test.mjs (M7b): rechnet Umgebungsklänge und Musik offline (OfflineAudioContext,
// auch in Stereo) mit js/audio.js, js/umgebung.js und js/musik.js. Das Spiel lädt diese Datei nicht.

import { baueKlangwerk } from '../js/audio.js';
import { raumWerte, umgebungsQuellen, SCHLEIFE_RMS, VOGEL_DAUER } from '../js/umgebung.js';
import { testRender, HAUPT_STUECK, ZIEL_STUECK, abschnittSchritt, kompiliere } from '../js/musik.js';
import { ABSCHNITTE, AUSKLANG, AKKORDE, TONARTEN } from '../js/musikstueck.js';
import { CONFIG } from '../js/config.js';
export * from './ton-pruefung.js';
const HAUPT = HAUPT_STUECK(), SCHLEIFE_ZIEL = ZIEL_STUECK();
export { raumWerte, umgebungsQuellen, SCHLEIFE_RMS, VOGEL_DAUER, testRender, HAUPT, SCHLEIFE_ZIEL, abschnittSchritt, kompiliere, ABSCHNITTE, AUSKLANG, AKKORDE, TONARTEN, CONFIG };

const RATE = 44100;
// Künstliche Quellen um den Ursprung (für Messungen ohne Spielwelt)
export function quellenTest({ herden = [], orte = [], brunnen = null, dichte = 0, pass = null, laenge = 4000 } = {}) {
  const d = new Float32Array(Math.ceil(laenge) + 1).fill(dichte);
  return {
    herden: herden.map((h, nr) => ({ nr, x: h.x, z: h.z, r: h.r ?? 3, anzahl: h.kuehe.length, posen: [0, 0, 0], kuehe: Float32Array.from(h.kuehe.flatMap((k) => [k[0], k[1], k[2] ?? 1])) })),
    orte: orte.map((o) => ({ name: o.name, staerke: o.staerke ?? 1, punkte: Float32Array.from(o.punkte), sVon: o.sVon ?? -1e9, sBis: o.sBis ?? -1e9, fan: !!o.fan, murmeln: o.murmeln })),
    brunnen, voegel: { dichte: d, fehlen: [], namen: [] }, pass, laenge,
  };
}
// Hörer: { hx, hz, hyaw, s, tempo } (Objekt wird pro Bild verändert)
// Offline rendern: aufbau(werk, ctx) einmal, bild(werk, t, hoerer) alle 1/60 s; die Umgebung bekommt dann modus (Standard 'rennen').
// Ergebnis { links, rechts, mono, werk }. motor: auch werk.aktualisiere (mit zustand) statt nur der Umgebung
export async function rendereRaum({ dauer = 2, kanaele = 2, aufbau = null, bild = null, quellen = null, hoerer = null, modus = 'rennen', limiter = false, zustand = null, lautstaerke = 100 } = {}) {
  const ctx = new OfflineAudioContext(kanaele, Math.round(RATE * dauer), RATE);
  const w = baueKlangwerk(ctx);
  w.puffernSofort();
  w.busse.master.gain.value = (lautstaerke / 100) ** CONFIG.audio.lautKurve;
  if (!limiter) { w.busse.master.disconnect(); w.busse.master.connect(ctx.destination); }
  if (quellen) w.setzeQuellen(quellen);
  const h = { hx: 0, hz: 0, hyaw: 0, s: 0, tempo: 0, ...(hoerer || {}) };
  if (aufbau) aufbau(w, ctx, h);
  const dt = 1 / 60;
  const schritt = (t) => {
    if (bild) bild(w, t, h);
    if (zustand) w.aktualisiere(dt, { ...zustand, ...h, modus, musikModus: zustand.musikModus || 'aus' });
    else w.umgebung.aktualisiere(dt, modus, h);
  };
  schritt(0);
  for (let k = 1; k * dt < dauer - 0.01; k++) { const t = k * dt; ctx.suspend(t).then(() => { schritt(t); ctx.resume(); }); }
  const buf = await ctx.startRendering();
  const links = buf.getChannelData(0), rechts = kanaele > 1 ? buf.getChannelData(1) : links;
  const mono = new Float32Array(links.length);
  for (let i = 0; i < mono.length; i++) mono[i] = (links[i] + rechts[i]) / 2;
  return { links, rechts, mono, werk: w };
}
// Ein Puffer des Klangwerks (für Tonhöhe, Dauer, Schleifen-Naht)
export function pufferDaten(name) {
  const ctx = new OfflineAudioContext(1, RATE, RATE);
  const w = baueKlangwerk(ctx);
  w.puffernSofort();
  const b = w.puffer[name];
  return b ? { daten: b.getChannelData(0), rate: b.sampleRate, dauer: b.duration, ende: b.schleifeEnde || b.length } : null;
}
// RMS (dB) in Fenstern
export function rmsDb(d, von = 0, bis = Infinity) {
  const a = Math.max(0, Math.round(von * RATE)), b = Math.min(d.length, Math.round(bis * RATE));
  let q = 0; for (let i = a; i < b; i++) q += d[i] * d[i];
  return 10 * Math.log10(q / Math.max(1, b - a) + 1e-20);
}
export function spitzeDb(d, von = 0, bis = Infinity) {
  const a = Math.max(0, Math.round(von * RATE)), b = Math.min(d.length, Math.round(bis * RATE));
  let s = 0; for (let i = a; i < b; i++) s = Math.max(s, Math.abs(d[i]));
  return 20 * Math.log10(s + 1e-12);
}
// Klick-Messer (M7b): ein Klick (Sprung im Signal) ist breitbandig, die Musik hat über 12 kHz fast nichts (Tiefpass,
// bandbegrenzte Wellen). Ergebnis: grösster Ausschlag nach einem Hochpass bei 12 kHz (2. Ordnung, Butterworth)
export function klickWert(d, rate = 44100, von = 0, bis = d.length) {
  const w = Math.tan(Math.PI * 12000 / rate), k = 1 / (1 + Math.SQRT2 * w + w * w);
  const b0 = k, b1 = -2 * k, b2 = k, a1 = 2 * (w * w - 1) * k, a2 = (1 - Math.SQRT2 * w + w * w) * k;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, max = 0;
  for (let i = von; i < bis; i++) {
    const x = d[i], y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    if (i > von + 64) max = Math.max(max, Math.abs(y));
  }
  return max;
}
// Grösster Sprung zwischen zwei Abtastwerten (wörtlich, für die Messtabelle)
export function groessterSprung(d, von = 1, bis = d.length) {
  let s = 0; for (let i = Math.max(1, von); i < bis; i++) s = Math.max(s, Math.abs(d[i] - d[i - 1])); return s;
}
