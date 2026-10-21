// Browser-Hilfe für tools/ton-test.mjs (M7a) und tools/ton-messung.mjs (M7a.1): rechnet Klänge mit js/audio.js offline (OfflineAudioContext),
// misst sie (Spitze, RMS, Gleichspannung, Anfang, Ausklingen) und malt Spektrogramme. Das Spiel lädt diese Datei nicht.

import { baueKlangwerk, materialNr } from '../js/audio.js';
import { CONFIG } from '../js/config.js';

export const RATE = 44100;

// Zustand wie tonZ in main.js
export function zustand(t = {}) {
  return {
    modus: 'rennen', drehzahl: CONFIG.getriebe.leerlauf, gang: 1, zielGang: t.gang ?? 1, schaltet: false, gas: 0, bremse: 0, tempo: 0, vVor: 0,
    untergrund: 'asphalt', drift: 0, handbremse: false, aufprall: 0, aufprallArt: 0, kontaktArt: -1, kontaktTempo: 0, ...t,
  };
}

// Offline rechnen: aufbau(werk) richtet ein (Zustand setzen, Ereignisse auslösen), dauer in Sekunden.
// limiter = false (M7a.1): Pegel "vor dem Limiter" messen (master direkt an den Ausgang)
export async function rendere(aufbau, dauer = 1.5, { limiter = true } = {}) {
  const ctx = new OfflineAudioContext(1, Math.round(RATE * dauer), RATE);
  const w = baueKlangwerk(ctx);
  w.puffernSofort();
  w.busse.master.gain.value = 1; // Regler auf 100 %
  if (!limiter) { w.busse.master.disconnect(); w.busse.master.connect(ctx.destination); }
  aufbau(w, ctx);
  const buf = await ctx.startRendering();
  return { daten: buf.getChannelData(0), werk: w };
}

// Offline mit Verlauf (M7a.1): bild(werk, t) wird alle 1/60 s aufgerufen (wie im Spiel), z. B. Getriebe + aktualisiere
export async function rendereVerlauf(bild, dauer = 2, { limiter = true, vorher = null } = {}) {
  const ctx = new OfflineAudioContext(1, Math.round(RATE * dauer), RATE);
  const w = baueKlangwerk(ctx);
  w.puffernSofort();
  w.busse.master.gain.value = 1;
  if (!limiter) { w.busse.master.disconnect(); w.busse.master.connect(ctx.destination); }
  if (vorher) vorher(w, ctx);
  const dt = 1 / 60;
  bild(w, 0);
  for (let k = 1; k * dt < dauer - 0.01; k++) {
    const t = k * dt;
    ctx.suspend(t).then(() => { bild(w, t); ctx.resume(); });
  }
  const buf = await ctx.startRendering();
  return { daten: buf.getChannelData(0), werk: w };
}

// Knoten zählen (M7a.1): alle Audio-Knoten, die baueKlangwerk und der Puffer-Aufbau dauerhaft anlegen
export function zaehleKnoten() {
  const ctx = new OfflineAudioContext(1, RATE, RATE);
  const zahl = {};
  for (const name of ['createGain', 'createBiquadFilter', 'createOscillator', 'createConstantSource', 'createWaveShaper', 'createDynamicsCompressor', 'createBufferSource', 'createAnalyser']) {
    const orig = ctx[name].bind(ctx);
    ctx[name] = (...a) => { zahl[name] = (zahl[name] || 0) + 1; return orig(...a); };
  }
  const w = baueKlangwerk(ctx);
  w.puffernSofort();
  return { summe: Object.values(zahl).reduce((a, b) => a + b, 0), je: zahl };
}

// Leistungsspektrum eines Ausschnitts (Mittel über Hann-Fenster à 4096 Samples), für Schwerpunkt und Anteile
export function spektrum(d, von = 0, bis = Infinity) {
  const N = 4096, a0 = Math.max(0, Math.round(von * RATE)), b0 = Math.min(d.length, Math.round(bis * RATE));
  const re = new Float64Array(N), im = new Float64Array(N), p = new Float64Array(N / 2);
  const fen = new Float64Array(N); for (let i = 0; i < N; i++) fen[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  let n = 0;
  for (let a = a0; a + N <= Math.max(b0, a0 + N); a += N / 2) {
    for (let i = 0; i < N; i++) { re[i] = (d[a + i] || 0) * fen[i]; im[i] = 0; }
    fft(re, im);
    for (let k = 0; k < N / 2; k++) p[k] += re[k] * re[k] + im[k] * im[k];
    n++;
    if (a + N >= b0) break;
  }
  return { p, df: RATE / N };
}
// Spektralschwerpunkt (Hz, 20 Hz .. 20 kHz): wo der Klang "wohnt"
export function schwerpunkt(s) {
  let a = 0, b = 0;
  for (let k = 1; k < s.p.length; k++) { const f = k * s.df; if (f < 20 || f > 20000) continue; a += f * s.p[k]; b += s.p[k]; }
  return b > 0 ? a / b : 0;
}
// Anteil der Energie über f Hz (0..1)
export function anteilUeber(s, f) {
  let a = 0, b = 0;
  for (let k = 1; k < s.p.length; k++) { const fk = k * s.df; if (fk < 20) continue; b += s.p[k]; if (fk > f) a += s.p[k]; }
  return b > 0 ? a / b : 0;
}
// A-bewerteter Pegel (dB, nur zum Vergleichen): Energie gewichtet wie das Ohr (tiefe Töne zählen weniger)
export function pegelA(s) {
  let q = 0;
  for (let k = 1; k < s.p.length; k++) {
    const f = k * s.df, f2 = f * f;
    const ra = (12194 ** 2 * f2 * f2) / ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2));
    q += s.p[k] * ra * ra * 1.2589; // +2 dB: A(1 kHz) = 0 dB
  }
  return 10 * Math.log10(q + 1e-30);
}
// Stärkste Spitze über f Hz gegen die stärkste insgesamt (dB, im Spektrum)
export function spitzeUeber(s, f) {
  let alle = 0, oben = 0;
  for (let k = 1; k < s.p.length; k++) { const fk = k * s.df; if (fk < 20) continue; alle = Math.max(alle, s.p[k]); if (fk > f) oben = Math.max(oben, s.p[k]); }
  return 10 * Math.log10(oben / alle + 1e-20);
}

// Hüllkurve (RMS je 5 ms) eines einmaligen Klangs: Anfang, Ausklingzeit bis db unter der lautesten Stelle, RMS im aktiven Teil
export function huelle(d, db = -40) {
  const fen = Math.round(RATE * 0.005), n = Math.floor(d.length / fen);
  const r = new Float64Array(n);
  let max = 0;
  for (let j = 0; j < n; j++) { let q = 0; for (let i = j * fen; i < (j + 1) * fen; i++) q += d[i] * d[i]; r[j] = Math.sqrt(q / fen); max = Math.max(max, r[j]); }
  const g = max * 10 ** (db / 20);
  let erst = -1, letzt = -1;
  for (let j = 0; j < n; j++) if (r[j] >= g) { if (erst < 0) erst = j; letzt = j; }
  const g20 = max * 0.1;
  let a20 = -1, b20 = -1;
  for (let j = 0; j < n; j++) if (r[j] >= g20) { if (a20 < 0) a20 = j; b20 = j; }
  let q = 0;
  for (let i = a20 * fen; i < (b20 + 1) * fen; i++) q += d[i] * d[i];
  return {
    anfang: erst * fen / RATE, ausklingen: (letzt - erst + 1) * fen / RATE,
    rmsAktiv: Math.sqrt(q / Math.max(1, (b20 - a20 + 1) * fen)), aktivDauer: (b20 - a20 + 1) * fen / RATE,
  };
}
const dB = (x) => 20 * Math.log10(Math.max(1e-9, x));
export { dB };

// Messwerte eines Ausschnitts (von, bis in Sekunden)
export function miss(d, von = 0, bis = Infinity) {
  const a = Math.max(0, Math.round(von * RATE)), b = Math.min(d.length, Math.round(bis * RATE));
  let spitze = 0, summe = 0, quad = 0, nan = 0;
  for (let i = a; i < b; i++) {
    const x = d[i];
    if (!Number.isFinite(x)) { nan++; continue; }
    spitze = Math.max(spitze, Math.abs(x)); summe += x; quad += x * x;
  }
  const n = Math.max(1, b - a);
  return { spitze, rms: Math.sqrt(quad / n), mittel: summe / n, nan };
}

// Ein Puffer (einmaliger Klang) direkt: Anfang (erste 0.5 ms gegen die Spitze, erstes Sample), Ausklingzeit bis -60 dB, Länge
export function pufferMessen(buf) {
  const d = buf.getChannelData(0);
  const m = miss(d);
  let anfang = 0;
  for (let i = 0; i < Math.round(buf.sampleRate * 0.0005); i++) anfang = Math.max(anfang, Math.abs(d[i]));
  let letzt = 0;
  const grenze = m.spitze * 1e-3;
  for (let i = d.length - 1; i >= 0; i--) if (Math.abs(d[i]) > grenze) { letzt = i; break; }
  return { ...m, erstes: Math.abs(d[0]) / (m.spitze || 1), anfang: anfang / (m.spitze || 1), ausklingen: letzt / buf.sampleRate, laenge: d.length / buf.sampleRate, ende: Math.abs(d[d.length - 1]) };
}

// Stärkste Frequenz in einem Bereich (Goertzel über Kandidaten), für den Grundton
export function staerksteFrequenz(d, von, bis, fMin, fMax, schritt = 0.5) {
  const a = Math.round(von * RATE), b = Math.round(bis * RATE);
  let best = 0, bestF = 0;
  for (let f = fMin; f <= fMax; f += schritt) {
    const w = 2 * Math.PI * f / RATE, k = 2 * Math.cos(w);
    let s1 = 0, s2 = 0;
    for (let i = a; i < b; i++) { const s = d[i] + k * s1 - s2; s2 = s1; s1 = s; }
    const p = s1 * s1 + s2 * s2 - k * s1 * s2;
    if (p > best) { best = p; bestF = f; }
  }
  return bestF;
}

// Spektrogramm (Zeit nach rechts, Frequenz nach oben, logarithmisch 30 Hz .. fMax) als PNG (Data-URL)
export function spektrogramm(d, titel, { fMax = 8000, breite = 640, hoehe = 300 } = {}) {
  const N = 2048, hop = Math.max(64, Math.floor(d.length / breite));
  const c = document.createElement('canvas');
  const rand = 40, kopf = 22;
  c.width = breite + rand; c.height = hoehe + kopf + 18;
  const x = c.getContext('2d');
  x.fillStyle = '#0d1218'; x.fillRect(0, 0, c.width, c.height);
  const re = new Float64Array(N), im = new Float64Array(N);
  const fen = new Float64Array(N); for (let i = 0; i < N; i++) fen[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  const bild = x.createImageData(breite, hoehe);
  const fMin = 30, lnA = Math.log(fMin), lnB = Math.log(fMax);
  const spalten = [];
  let max = 1e-12;
  for (let s = 0; s < breite; s++) {
    const a = s * hop;
    for (let i = 0; i < N; i++) { re[i] = (d[a + i] || 0) * fen[i]; im[i] = 0; }
    fft(re, im);
    const sp = new Float64Array(N / 2);
    for (let k = 0; k < N / 2; k++) { sp[k] = Math.hypot(re[k], im[k]); max = Math.max(max, sp[k]); }
    spalten.push(sp);
  }
  for (let s = 0; s < breite; s++) {
    for (let y = 0; y < hoehe; y++) {
      const f = Math.exp(lnA + (lnB - lnA) * (1 - y / hoehe));
      const k = Math.min(N / 2 - 1, Math.round(f * N / RATE));
      const db = 20 * Math.log10(spalten[s][k] / max + 1e-9);
      const t = Math.max(0, Math.min(1, (db + 80) / 80));
      const o = (y * breite + s) * 4;
      bild.data[o] = Math.round(255 * Math.min(1, t * 1.6)); bild.data[o + 1] = Math.round(255 * Math.max(0, t * 1.4 - 0.4)); bild.data[o + 2] = Math.round(255 * Math.max(0, t * 2 - 1.2) + 40 * (1 - t));
      bild.data[o + 3] = 255;
    }
  }
  x.putImageData(bild, rand, kopf);
  x.fillStyle = '#f4f4ee'; x.font = '13px monospace';
  x.fillText(titel, rand, 15);
  x.fillStyle = '#aab4be'; x.font = '10px monospace';
  for (const f of [50, 100, 200, 500, 1000, 2000, 5000]) {
    if (f > fMax) continue;
    const y = kopf + hoehe * (1 - (Math.log(f) - lnA) / (lnB - lnA));
    x.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, 4, y + 3);
    x.fillRect(rand - 4, Math.round(y), 3, 1);
  }
  const sek = d.length / RATE;
  for (let t = 0; t <= sek + 1e-9; t += sek > 2 ? 0.5 : 0.25) {
    const px = rand + t / sek * breite;
    x.fillText(`${t.toFixed(2)} s`, Math.min(px, c.width - 40), kopf + hoehe + 13);
  }
  return c.toDataURL('image/png');
}

// Radix-2-FFT (an Ort und Stelle)
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const w = -2 * Math.PI / len, wr = Math.cos(w), wi = Math.sin(w);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

export { materialNr, CONFIG };

// M8e: Band-Filter (je zwei Hoch- und Tiefpässe 2. Ordnung, Butterworth) für Messungen in einem Frequenzband
export function band(d, lo, hi) {
  const biquad = (x, f, hoch) => {
    const w = 2 * Math.PI * f / RATE, c = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2);
    const b0 = hoch ? (1 + c) / 2 : (1 - c) / 2, b1 = hoch ? -(1 + c) : 1 - c, b2 = b0, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
    const y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
      const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
    }
    return y;
  };
  let y = d;
  for (let k = 0; k < 2; k++) { y = biquad(y, lo, true); y = biquad(y, hi, false); }
  return y;
}
// M8e: Unregelmässigkeit = Schwankung der Kurzzeit-Energie: Energie in Fenstern von "fenster" Sekunden, Standardabweichung
// geteilt durch den Mittelwert (0 = gleichmässig). Dazu die mittlere Energie (für Vergleiche "Energie im Band")
export function schwankung(d, von, bis, fenster = 0.02) {
  const n = Math.round(fenster * RATE), a = Math.round(von * RATE), b = Math.min(d.length, Math.round(bis * RATE));
  const e = [];
  for (let i = a; i + n <= b; i += n) { let s = 0; for (let k = i; k < i + n; k++) s += d[k] * d[k]; e.push(s / n); }
  const m = e.reduce((x, y) => x + y, 0) / e.length;
  const sd = Math.sqrt(e.reduce((x, y) => x + (y - m) ** 2, 0) / e.length);
  return { cv: sd / (m || 1e-30), energie: m, fenster: e.length };
}
