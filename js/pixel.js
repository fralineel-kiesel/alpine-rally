// Pixel-Texturen, im Code gezeichnet (keine Bilddateien).
// Jede Funktion malt Pixel für Pixel auf ein kleines Canvas.

import * as THREE from 'three';
import { zufall } from './util.js';

function leinwand(b, h) {
  const c = document.createElement('canvas');
  c.width = b;
  c.height = h;
  const ctx = c.getContext('2d');
  const bild = ctx.createImageData(b, h);
  return { c, ctx, bild, b, h };
}

function hexZuRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function setze(l, x, y, rgb, a = 255) {
  if (x < 0 || y < 0 || x >= l.b || y >= l.h) return;
  const i = (y * l.b + x) * 4;
  l.bild.data[i] = rgb[0];
  l.bild.data[i + 1] = rgb[1];
  l.bild.data[i + 2] = rgb[2];
  l.bild.data[i + 3] = a;
}

function zuTextur(l, { wiederholen = false, mipmaps = true } = {}) {
  l.ctx.putImageData(l.bild, 0, 0);
  const t = new THREE.CanvasTexture(l.c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = mipmaps ? THREE.NearestMipmapNearestFilter : THREE.NearestFilter;
  t.generateMipmaps = mipmaps;
  if (wiederholen) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const TANNE = ['#173d22', '#1f4d2a', '#2c6634', '#3d7d3c', '#0f2c18'];
const STAMM = ['#4a3020', '#634329'];
const LAUB = ['#2a5a22', '#3c7a2c', '#58993a', '#78b048', '#1d4218'];
const STEIN = ['#55534f', '#77746e', '#96938b', '#b4b1a8', '#3f3d3a'];

// Tannen: mehrere Varianten nebeneinander, je 16x32 Pixel
export function tannenTextur(varianten = 3, seed = 11) {
  const B = 16, H = 32;
  const l = leinwand(B * varianten, H);
  const rnd = zufall(seed);
  const farben = TANNE.map(hexZuRgb), stamm = STAMM.map(hexZuRgb);
  for (let v = 0; v < varianten; v++) {
    const ox = v * B;
    const stufen = 4 + Math.floor(rnd() * 2);
    const kroneOben = 1, kroneUnten = 27 - Math.floor(rnd() * 2);
    const stufenH = (kroneUnten - kroneOben) / stufen;
    // Stamm
    for (let y = kroneUnten - 2; y < H; y++) {
      setze(l, ox + 7, y, stamm[0]);
      setze(l, ox + 8, y, stamm[1]);
    }
    // Krone aus Stufen (jede Stufe wird nach unten breiter)
    for (let y = kroneOben; y <= kroneUnten; y++) {
      const k = Math.min(stufen - 1, Math.floor((y - kroneOben) / stufenH));
      const inStufe = (y - kroneOben - k * stufenH) / stufenH; // 0..1
      const oben = 0.8 + k * 1.2;
      const unten = 2.6 + k * 1.35;
      const hb = Math.min(7.6, oben + (unten - oben) * inStufe);
      for (let x = 0; x < B; x++) {
        const dx = x + 0.5 - 8;
        const rand = hb + (rnd() - 0.5) * 1.1;
        if (Math.abs(dx) > rand) continue;
        // Licht von links oben: linke Seite heller, rechte dunkler
        let f = 1;
        const rel = dx / Math.max(1, hb);
        if (rel < -0.35) f = rnd() < 0.7 ? 2 : 3;
        else if (rel > 0.45) f = rnd() < 0.6 ? 0 : 1;
        else f = rnd() < 0.25 ? 2 : 1;
        if (inStufe > 0.82 && rnd() < 0.6) f = 0; // Schatten unter den Ästen
        if (rnd() < 0.05) f = 4;
        setze(l, ox + x, y, farben[f]);
      }
    }
    setze(l, ox + 7, 0, farben[2]);
    setze(l, ox + 8, 0, farben[1]);
  }
  return { textur: zuTextur(l), varianten, seitenVerhaeltnis: B / H };
}

// Laubbäume: runde Krone aus Kreisen, je 24x32 Pixel
export function laubTextur(varianten = 2, seed = 23) {
  const B = 24, H = 32;
  const l = leinwand(B * varianten, H);
  const rnd = zufall(seed);
  const farben = LAUB.map(hexZuRgb), stamm = STAMM.map(hexZuRgb);
  for (let v = 0; v < varianten; v++) {
    const ox = v * B;
    for (let y = 17; y < H; y++) {
      setze(l, ox + 11, y, stamm[0]);
      setze(l, ox + 12, y, stamm[1]);
      if (y > 28) setze(l, ox + 10, y, stamm[0]);
    }
    const kreise = [];
    for (let i = 0; i < 6; i++) {
      kreise.push({ x: 12 + (rnd() - 0.5) * 10, y: 10 + (rnd() - 0.5) * 9, r: 4.5 + rnd() * 3 });
    }
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < B; x++) {
        let drin = null;
        for (const k of kreise) {
          const d = Math.hypot(x + 0.5 - k.x, y + 0.5 - k.y);
          if (d < k.r + (rnd() - 0.5) * 0.9) { drin = k; }
        }
        if (!drin) continue;
        const lx = (x + 0.5 - drin.x) / drin.r, ly = (y + 0.5 - drin.y) / drin.r;
        const licht = -lx * 0.6 - ly * 0.8;
        let f = licht > 0.45 ? 3 : licht > 0.0 ? 2 : licht > -0.5 ? 1 : 0;
        if (rnd() < 0.12) f = Math.max(0, f - 1);
        if (rnd() < 0.04) f = 4;
        setze(l, ox + x, y, farben[f]);
      }
    }
  }
  return { textur: zuTextur(l), varianten, seitenVerhaeltnis: B / H };
}

// Steine: unregelmässige Klumpen, je 16x12 Pixel
export function steinTextur(varianten = 3, seed = 31) {
  const B = 16, H = 12;
  const l = leinwand(B * varianten, H);
  const rnd = zufall(seed);
  const farben = STEIN.map(hexZuRgb);
  for (let v = 0; v < varianten; v++) {
    const ox = v * B;
    const ecken = [];
    const n = 7;
    for (let i = 0; i < n; i++) ecken.push(0.75 + rnd() * 0.3);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const dx = (x + 0.5 - 8) / 7.5, dy = (y + 0.5 - 12) / 11; // Boden unten
        const w = Math.atan2(dy, dx);
        const idx = ((w / (Math.PI * 2)) * n + n) % n;
        const r = ecken[Math.floor(idx)];
        const d = Math.hypot(dx, dy);
        if (d > r) continue;
        const licht = -dx * 0.5 - dy * 0.9 - 0.4;
        let f = licht > 0.35 ? 3 : licht > 0.05 ? 2 : licht > -0.3 ? 1 : 0;
        if (rnd() < 0.1) f = Math.max(0, f - 1);
        if (rnd() < 0.05) f = 4;
        setze(l, ox + x, y, farben[f]);
      }
    }
  }
  return { textur: zuTextur(l), varianten, seitenVerhaeltnis: B / H };
}

// Körnung für Gras und Fels (graue Pixel, wird mit der Geländefarbe multipliziert)
export function koernungTextur(seed = 5) {
  const N = 32;
  const l = leinwand(N, N);
  const rnd = zufall(seed);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const r = rnd();
      const g = r < 0.15 ? 200 : r < 0.75 ? 228 : r < 0.95 ? 245 : 255;
      setze(l, x, y, [g, g, g]);
    }
  }
  return zuTextur(l, { wiederholen: true });
}

// Strasse: Asphalt, Bankett und Mittellinie haben je eine eigene Textur.
// So mischt die Grafikkarte in der Ferne (kleinere Mipmap-Stufen) nie
// Grau und Braun zusammen – die Strasse bleibt bis zum Horizont grau.
const variiere = (rgb, s) => rgb.map((c) => Math.max(0, Math.min(255, Math.round(c * s))));

// Asphalt: 32 Pixel quer (= ganze Strassenbreite), 32 Pixel = 7 Meter lang
export const ASPHALT_LAENGE = 7;
export function asphaltTextur(farben, seed = 9) {
  const N = 32;
  const l = leinwand(N, N);
  const rnd = zufall(seed);
  const asph = hexZuRgb(farben.asphalt);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const r = rnd();
      const s = r < 0.06 ? 0.85 : r < 0.12 ? 1.12 : 0.96 + rnd() * 0.08;
      // leicht dunklerer Rand zum Bankett
      setze(l, x, y, variiere(asph, x === 0 || x === N - 1 ? 0.88 : s));
    }
  }
  const t = zuTextur(l, { wiederholen: true });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter; // in der Ferne ruhig, nah bleiben harte Pixel
  return t;
}

// Bankett: 16 Pixel quer (= 2 Meter), 32 Pixel = 4 Meter lang
export const BANKETT_LAENGE = 4;
export function bankettTextur(farben, seed = 19) {
  const B = 16, H = 32;
  const l = leinwand(B, H);
  const rnd = zufall(seed);
  const bank = hexZuRgb(farben.bankett);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < B; x++) {
      // erdiges Bankett mit Kieseln
      const r = rnd();
      const s = r < 0.1 ? 0.78 : r < 0.2 ? 1.18 : 0.92 + rnd() * 0.12;
      setze(l, x, y, variiere(bank, s));
    }
  }
  const t = zuTextur(l, { wiederholen: true });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

// Mittellinie: 1 Pixel breit, 32 Pixel lang (= ein Strich + eine Lücke).
// Die Lücke ist durchsichtig. In der Ferne wird daraus eine durchgehende,
// schwache Linie (statt zu flimmern).
export function mittellinienTextur(farben, strichAnteil = 0.375, seed = 29) {
  const H = 32;
  const daten = new Uint8Array(H * 4);
  const rnd = zufall(seed);
  const linie = hexZuRgb(farben.mittellinie);
  for (let y = 0; y < H; y++) {
    // Farbe auch in der Lücke setzen, damit die Ferne nicht dunkler wird
    const c = variiere(linie, 0.95 + rnd() * 0.08);
    daten.set([c[0], c[1], c[2], y < H * strichAnteil ? 255 : 0], y * 4);
  }
  const t = new THREE.DataTexture(daten, 1, H);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

// Schachbrett für Start- und Ziellinie
export function zielTextur() {
  const l = leinwand(14, 3);
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 14; x++) setze(l, x, y, (x + y) % 2 ? [30, 30, 30] : [240, 240, 236]);
  return zuTextur(l, { mipmaps: false });
}

// Kleine Ziffern (3x5 Pixel) für das Checkpoint-Banner
const ZIFFERN = {
  1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'], 6: ['.##', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '.#.', '.#.', '.#.'], 8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], P: ['##.', '#.#', '##.', '#..', '#..'],
};

// Checkpoint-Banner: gelb-schwarze Schrägstreifen, in der Mitte "CP" + Nummer
export function checkpointBannerTextur(nummer) {
  const B = 48, H = 8;
  const l = leinwand(B, H);
  const gelb = [242, 196, 26], schwarz = [24, 24, 24];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < B; x++) setze(l, x, y, Math.floor((x + y) / 4) % 2 ? schwarz : gelb);
  // schwarzes Feld mit gelber Schrift
  const text = ['C', 'P', String(nummer)];
  const breite = text.length * 4 + 1, ox = Math.floor((B - breite) / 2);
  for (let y = 0; y < H; y++) for (let x = ox - 1; x < ox + breite + 1; x++) setze(l, x, y, schwarz);
  text.forEach((z, n) => {
    const muster = ZIFFERN[z] || ZIFFERN[9];
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 3; x++) if (muster[y][x] === '#') setze(l, ox + 1 + n * 4 + x, 1 + y, gelb);
  });
  return zuTextur(l);
}

// Pfosten: gelb-schwarz geringelt
export function pfostenTextur() {
  const l = leinwand(2, 8);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 2; x++) setze(l, x, y, y < 4 ? [242, 196, 26] : [24, 24, 24]);
  return zuTextur(l, { wiederholen: true });
}
