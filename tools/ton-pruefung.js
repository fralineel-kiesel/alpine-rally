// Browser-Hilfe für tools/ton-test.mjs (M7a): rechnet Klänge mit js/audio.js offline (OfflineAudioContext),
// misst sie (Spitze, RMS, Gleichspannung, Anfang, Ausklingen) und malt Spektrogramme. Das Spiel lädt diese Datei nicht.

import { baueKlangwerk, materialNr } from '../js/audio.js';
import { CONFIG } from '../js/config.js';

export const RATE = 44100;

// Zustand wie tonZ in main.js
export function zustand(t = {}) {
  return {
    modus: 'rennen', drehzahl: CONFIG.getriebe.leerlauf, gang: 1, schaltet: false, gas: 0, bremse: 0, tempo: 0, vVor: 0,
    untergrund: 'asphalt', drift: 0, handbremse: false, aufprall: 0, aufprallArt: 0, kontaktArt: -1, kontaktTempo: 0, ...t,
  };
}

// Offline rechnen: aufbau(werk) richtet ein (Zustand setzen, Ereignisse auslösen), dauer in Sekunden
export async function rendere(aufbau, dauer = 1.5) {
  const ctx = new OfflineAudioContext(1, Math.round(RATE * dauer), RATE);
  const w = baueKlangwerk(ctx);
  w.puffernSofort();
  w.busse.master.gain.value = 1; // Regler auf 100 %
  aufbau(w, ctx);
  const buf = await ctx.startRendering();
  return { daten: buf.getChannelData(0), werk: w };
}

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
