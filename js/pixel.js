// Pixel-Texturen, im Code gezeichnet (keine Bilddateien).
// Jede Funktion malt Pixel für Pixel auf ein kleines Canvas.

import * as THREE from 'three';
import { zufall } from './util.js';

export function leinwand(b, h) {
  const c = document.createElement('canvas');
  c.width = b;
  c.height = h;
  const ctx = c.getContext('2d');
  const bild = ctx.createImageData(b, h);
  return { c, ctx, bild, b, h };
}

export function hexZuRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function setze(l, x, y, rgb, a = 255) {
  if (x < 0 || y < 0 || x >= l.b || y >= l.h) return;
  const i = (y * l.b + x) * 4;
  l.bild.data[i] = rgb[0];
  l.bild.data[i + 1] = rgb[1];
  l.bild.data[i + 2] = rgb[2];
  l.bild.data[i + 3] = a;
}

export function zuTextur(l, { wiederholen = false, mipmaps = true } = {}) {
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

// Felsbrocken: grosse, kantige Blöcke mit Flächen, Rissen und etwas Moos, je 24x20 Pixel
const FELSBROCKEN = ['#403e3b', '#5a5752', '#77736b', '#938f85', '#2c2b28'];
const MOOS = ['#4f6a2c', '#677f36'];
export function felsbrockenTextur(varianten = 3, seed = 41) {
  const B = 24, H = 20;
  const l = leinwand(B * varianten, H);
  const rnd = zufall(seed);
  const farben = FELSBROCKEN.map(hexZuRgb), moos = MOOS.map(hexZuRgb);
  for (let v = 0; v < varianten; v++) {
    const ox = v * B;
    // Umriss: Vieleck mit flachem Boden
    const n = 9, ecken = [];
    for (let i = 0; i < n; i++) ecken.push(0.72 + rnd() * 0.3);
    // ein paar Kanten (Lichtgrenzen) quer über den Block
    const kanten = [];
    for (let i = 0; i < 3; i++) kanten.push({ a: (rnd() - 0.5) * 1.6, b: (rnd() - 0.5) * 0.6, s: rnd() < 0.5 ? -1 : 1 });
    const risse = [];
    for (let i = 0; i < 2; i++) risse.push({ x: 5 + rnd() * 14, y: 4 + rnd() * 8, l: 3 + rnd() * 5, d: rnd() < 0.5 ? 1 : -1 });
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        const dx = (x + 0.5 - 12) / 11.5, dy = (y + 0.5 - 20) / 19;
        const w = Math.atan2(dy, dx);
        const idx = ((w / (Math.PI * 2)) * n + n) % n;
        const i0 = Math.floor(idx), t = idx - i0;
        const r = ecken[i0] * (1 - t) + ecken[(i0 + 1) % n] * t; // kantiger Umriss
        if (Math.hypot(dx, dy) > r) continue;
        // Licht von links oben, Flächen über die Kanten verschieden hell
        let licht = -dx * 0.55 - dy * 0.75 - 0.35;
        for (const k of kanten) if ((dy + 0.5) - (k.a * dx + k.b) > 0) licht += 0.18 * k.s;
        let f = licht > 0.4 ? 3 : licht > 0.1 ? 2 : licht > -0.25 ? 1 : 0;
        if (rnd() < 0.08) f = Math.max(0, f - 1);
        if (rnd() < 0.04) f = 4;
        let farbe = farben[f];
        // Moos oben auf dem Block
        if (dy < -0.62 && rnd() < 0.45) farbe = moos[rnd() < 0.6 ? 0 : 1];
        setze(l, ox + x, y, farbe);
      }
    }
    // Risse
    for (const rr of risse) {
      for (let i = 0; i < rr.l; i++) {
        const x = Math.round(rr.x + i * 0.5 * rr.d), y = Math.round(rr.y + i);
        const k = (y * l.b + ox + x) * 4;
        if (x >= 0 && x < B && y < H && l.bild.data[k + 3]) setze(l, ox + x, y, farben[4]);
      }
    }
  }
  return { textur: zuTextur(l), varianten, seitenVerhaeltnis: B / H };
}

// Baumstamm: Rinde (rundherum x entlang), 8x32 Pixel, wiederholt sich entlang des Stamms
const RINDE = ['#3b2a1c', '#4e3624', '#64462d', '#2a1d13'];
export function rindenTextur(seed = 51) {
  const B = 8, H = 32;
  const l = leinwand(B, H);
  const rnd = zufall(seed);
  const farben = RINDE.map(hexZuRgb);
  for (let x = 0; x < B; x++) {
    let furche = rnd() < 0.35;
    for (let y = 0; y < H; y++) {
      if (rnd() < 0.12) furche = !furche; // Furchen der Rinde laufen längs
      let f = furche ? 0 : rnd() < 0.3 ? 2 : 1;
      if (rnd() < 0.05) f = 3;
      setze(l, x, y, farben[f]);
    }
  }
  return zuTextur(l, { wiederholen: true });
}

// Baumstamm: Schnittfläche am Ende (heller Holzring mit Jahresringen), 16x16 Pixel
const HOLZ = ['#c9a571', '#b38e5a', '#9a7647', '#3b2a1c'];
export function holzringTextur(seed = 53) {
  const N = 16;
  const l = leinwand(N, N);
  const rnd = zufall(seed);
  const farben = HOLZ.map(hexZuRgb);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 8) / 8;
      let f;
      if (d > 0.82) f = 3;                     // Rinde aussen
      else f = Math.floor(d * 7 + rnd() * 0.5) % 2 ? 1 : 0; // Jahresringe
      if (d < 0.12) f = 2;                     // Kern
      if (d <= 0.82 && rnd() < 0.06) f = 2;
      setze(l, x, y, farben[f]);
    }
  }
  return zuTextur(l);
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

// Schotter (Meilenstein 3a): helles Graubeige mit Kieseln, zwei dunklere, festgefahrene
// Fahrspuren, am Rand locker (ein paar Erdpixel vom Bankett).
// Bild 48x32 Pixel: links 32 Pixel = ganze Wegbreite (Teil 0..SCHOTTER_U), rechts 16 Pixel
// lockerer Kies ohne Fahrspuren (für die abgerundeten Ecken an den Einfahrten). 32 Pixel = 6 m lang.
export const SCHOTTER_LAENGE = 6;
export const SCHOTTER_U = 32 / 48;
export function schotterTextur(farben, seed = 37) {
  const B = 48, H = 32;
  const l = leinwand(B, H);
  const rnd = zufall(seed);
  const kies = hexZuRgb(farben.schotter), spur = hexZuRgb(farben.schotterSpur), bank = hexZuRgb(farben.bankett);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < B; x++) {
      const weg = x < 32;
      // Fahrspuren: zwei Streifen, leicht wellig
      const welle = Math.round(Math.sin((y / H) * Math.PI * 2) * 0.6);
      const inSpur = weg && ((x >= 10 + welle && x <= 12 + welle) || (x >= 19 + welle && x <= 21 + welle));
      const amRand = weg && (x <= 1 || x >= 30);
      let c = inSpur ? spur : kies;
      const r = rnd();
      // Kiesel: hell und dunkel gesprenkelt (in den Spuren weniger, dort ist es festgefahren)
      const sprenkel = inSpur ? 0.5 : 1;
      if (r < 0.07 * sprenkel) c = variiere(c, 1.1);
      else if (r < 0.14 * sprenkel) c = variiere(c, 0.88);
      else if (r < 0.16 * sprenkel) c = variiere(c, 0.76);
      else c = variiere(c, 0.96 + rnd() * 0.06);
      if (amRand && rnd() < 0.45) c = variiere(bank, 0.9 + rnd() * 0.2);
      // (M3a.1: im Teil für die Ecken keine Erdpixel mehr, sie wurden dort zu langen braunen Strichen gezogen)
      setze(l, x, y, c);
    }
  }
  const t = zuTextur(l, { wiederholen: true });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter; // wie Asphalt: in der Ferne ruhig, nah harte Pixel
  return t;
}

// Wiesenweg (Meilenstein 3b): Feldweg über die Wiese. Erdbraun mit zwei festgefahrenen, etwas
// dunkleren Fahrspuren; in der Mitte zwischen den Spuren und am Rand wächst Gras herein (unregelmässig,
// wellig entlang des Wegs). Kein Mittelstrich.
// Bild 48x32 Pixel wie der Schotter: links 32 Pixel = ganze Wegbreite (Teil 0..WIESENWEG_U), rechts
// 16 Pixel Erde mit ein paar Grasbüscheln (für die abgerundeten Ecken an den Einfahrten). 32 Pixel = 6 m lang.
export const WIESENWEG_LAENGE = 6;
export const WIESENWEG_U = 32 / 48;
export function wiesenwegTextur(farben, seed = 53) {
  const B = 48, H = 32;
  const l = leinwand(B, H);
  const rnd = zufall(seed);
  const erde = hexZuRgb(farben.wiesenweg), spur = hexZuRgb(farben.wiesenwegSpur), gras = hexZuRgb(farben.wiesenwegGras);
  const grasD = variiere(gras, 0.8);
  // langsame Wellen (nahtlos über die Länge): wie weit das Gras in der Mitte und am Rand hereinwächst
  const ph = [rnd(), rnd(), rnd(), rnd()].map((p) => p * Math.PI * 2);
  const welle = (y, k, a) => Math.sin((y / H) * Math.PI * 2 * a + ph[k]);
  for (let y = 0; y < H; y++) {
    const mitte = 2.2 + 1.0 * welle(y, 0, 1) + 0.5 * welle(y, 1, 3);    // halbe Breite des Grasstreifens in der Mitte (Pixel)
    const randL = 3.2 + 1.2 * welle(y, 2, 2) + 0.6 * welle(y, 1, 5);    // so weit wächst das Gras links herein
    const randR = 3.2 + 1.2 * welle(y, 3, 2) + 0.6 * welle(y, 0, 4);
    const sw = Math.round(welle(y, 2, 1) * 0.6);                        // Spuren leicht wellig
    for (let x = 0; x < B; x++) {
      let c;
      if (x < 32) {
        const xm = Math.abs(x + 0.5 - 16);
        const inSpur = (x >= 8 + sw && x <= 12 + sw) || (x >= 20 + sw && x <= 24 + sw);
        // Gras: in der Mitte und am Rand sicher, am Übergang ausgefranst
        const grasMitte = xm < mitte + (rnd() - 0.5) * 1.6;
        const grasRand = x < randL + (rnd() - 0.5) * 1.8 || 31 - x < randR + (rnd() - 0.5) * 1.8;
        if ((grasMitte || grasRand) && !(inSpur && rnd() < 0.85)) {
          c = rnd() < 0.3 ? grasD : variiere(gras, 0.92 + rnd() * 0.16);
        } else {
          c = inSpur ? spur : erde;
          const r = rnd();
          if (r < 0.08) c = variiere(c, 1.12);            // trockene, helle Krümel
          else if (r < 0.16) c = variiere(c, 0.85);       // feuchte, dunkle Stellen
          else c = variiere(c, 0.95 + rnd() * 0.08);
          if (!inSpur && rnd() < 0.05) c = variiere(gras, 0.85 + rnd() * 0.2); // einzelne Halme
        }
      } else {
        // Ecken: Erde mit ein paar Grasbüscheln (1-2 Pixel)
        const r = rnd();
        c = r < 0.12 ? variiere(gras, 0.85 + rnd() * 0.2) : variiere(erde, 0.92 + rnd() * 0.14);
      }
      setze(l, x, y, c);
    }
  }
  const t = zuTextur(l, { wiederholen: true });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter; // wie Asphalt und Schotter: in der Ferne ruhig, nah harte Pixel
  return t;
}

// Rand des Wiesenwegs (M3b, statt des erdigen Banketts): vor allem Gras, zum Weg hin ein paar Erdflecken.
// 16 Pixel quer (u = 0 aussen, u = 1 am Weg), 32 Pixel = 4 m lang (wie das Bankett).
export function wiesenwegRandTextur(farben, seed = 59) {
  const B = 16, H = 32;
  const l = leinwand(B, H);
  const rnd = zufall(seed);
  const erde = hexZuRgb(farben.wiesenweg), gras = hexZuRgb(farben.gras), grasD = hexZuRgb(farben.grasDunkel);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < B; x++) {
      const zumWeg = x / (B - 1);
      const c = rnd() < 0.22 * zumWeg * zumWeg ? variiere(erde, 0.9 + rnd() * 0.15)
        : variiere(rnd() < 0.35 ? grasD : gras, 0.9 + rnd() * 0.16);
      setze(l, x, y, c);
    }
  }
  const t = zuTextur(l, { wiederholen: true });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

// Ausfransen (M3a): Asphaltbrocken, die an der Einfahrt in den Schotter auslaufen.
// u = 0 an der Asphaltkante (fast geschlossen), u = 1 aussen (nur noch einzelne Brocken).
// Löcher sind durchsichtig (alphaTest). 16x16 Pixel = 2 m lang.
export const FRANSEN_LAENGE = 2;
export function fransenTextur(farben, seed = 43) {
  // M3a.1: weicher, sauberer Rand statt Zacken. Die Tiefe ändert sich entlang der Kante langsam
  // (zwei überlagerte Wellen, nahtlos wiederholbar), dazu ein paar kleine Krümel knapp davor.
  // Als DataTexture: Auch die durchsichtigen Pixel behalten die Asphaltfarbe (im Canvas würden sie
  // schwarz), sonst wird der Rand in der Ferne (verkleinerte Stufen) dunkel.
  const NX = 16, NY = 32;
  const daten = new Uint8Array(NX * NY * 4);
  const rnd = zufall(seed);
  const asph = hexZuRgb(farben.asphalt);
  const p1 = rnd() * 6.28, p2 = rnd() * 6.28;
  for (let y = 0; y < NY; y++) {
    const w = (y / NY) * Math.PI * 2;
    const tiefe = 0.62 + 0.1 * Math.sin(w + p1) + 0.05 * Math.sin(3 * w + p2); // innere 43 % = unter der Kante
    for (let x = 0; x < NX; x++) {
      const u = (x + 0.5) / NX;
      const kruemel = u > tiefe && u < tiefe + 0.2 && rnd() < 0.12;
      const drin = u < tiefe || kruemel;
      const c = variiere(asph, 0.97 + rnd() * 0.07);
      daten.set([c[0], c[1], c[2], drin ? 255 : 0], (y * NX + x) * 4);
    }
  }
  const t = new THREE.DataTexture(daten, NX, NY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapNearestFilter;
  t.generateMipmaps = true;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
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

// ---------------------------------------------------------------------
// Strassenrand (Meilenstein 2a): alles auf einem Bild (Atlas), damit Leitplanken,
// Zäune und Schilder mit einem einzigen Material gezeichnet werden können.
// Ergebnis: { textur, kachel(name) -> { u0, v0, u1, v1 } }
// ---------------------------------------------------------------------
const ZIFFERN0 = { ...ZIFFERN, 0: ['###', '#.#', '#.#', '#.#', '###'] };
// tempoZahlen: Zahlen für die Tempo-Tafeln (z. B. [50, 60, 80]). Seit M2a.1 ist das Bild 128x256
// (oben dieselben Kacheln wie bisher, darunter die neuen).
export function strassenrandAtlas(kmZahlen = [], kehren = 4, seed = 61, tempoZahlen = []) {
  const N = 128, NH = 256, RAND = 2;
  const l = leinwand(N, NH);
  const rnd = zufall(seed);
  const rechtecke = {};
  let x0 = 0, y0 = 0, zeileH = 0;
  // Kachel anlegen: malen(px) zeichnet mit px(x, y, rgb, a) in die Kachel.
  // Undurchsichtige Kacheln bekommen einen Rand aus wiederholten Randpixeln (gegen
  // Farbsäume in der Ferne), durchsichtige einen leeren Rand.
  function kachel(name, b, h, malen, durchsichtig = false) {
    if (x0 + b + RAND * 2 > N) { x0 = 0; y0 += zeileH; zeileH = 0; }
    if (y0 + h + RAND * 2 > NH) throw new Error(`Atlas voll bei Kachel ${name}`);
    const ox = x0 + RAND, oy = y0 + RAND;
    const daten = new Array(b * h).fill(null);
    malen((x, y, rgb, a = 255) => {
      if (x >= 0 && y >= 0 && x < b && y < h) daten[y * b + x] = { rgb, a };
    });
    for (let y = -RAND; y < h + RAND; y++) {
      for (let x = -RAND; x < b + RAND; x++) {
        const innen = x >= 0 && y >= 0 && x < b && y < h;
        if (!innen && durchsichtig) continue;
        const d = daten[Math.min(h - 1, Math.max(0, y)) * b + Math.min(b - 1, Math.max(0, x))];
        if (d) setze(l, ox + x, oy + y, d.rgb, d.a);
      }
    }
    rechtecke[name] = { x: ox, y: oy, b, h };
    x0 += b + RAND * 2;
    zeileH = Math.max(zeileH, h + RAND * 2);
  }
  const hell = (rgb, f) => rgb.map((c) => Math.max(0, Math.min(255, Math.round(c * f))));

  // Leitplanke: verzinktes Wellprofil (helle Kanten, dunkle Rille), leicht verwittert. 32x8 = 4 m
  const PLANKE = ['#8a9096', '#cdd2d6', '#b5bbc0', '#80868c', '#6b7177', '#a7adb2', '#c3c8cc', '#6c7176'].map(hexZuRgb);
  const ROST = hexZuRgb('#8a6a4c');
  kachel('planke', 32, 8, (px) => {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 32; x++) {
        let c = PLANKE[y];
        const r = rnd();
        if (r < 0.1) c = hell(c, 0.86);
        else if (r < 0.14) c = hell(c, 1.06);
        if (y >= 5 && rnd() < 0.025) c = ROST;
        px(x, y, c);
      }
    }
    // Stoss zweier Bleche mit Schrauben
    for (let y = 1; y < 7; y++) px(0, y, hell(PLANKE[y], 0.8));
    px(1, 2, [60, 62, 64]); px(1, 5, [60, 62, 64]);
  });
  // Stahl (Pfosten der Leitplanke, Schilderpfosten): dunkelgrau
  kachel('stahl', 8, 16, (px) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 8; x++) {
        const basis = x < 2 ? '#6c7177' : x > 5 ? '#3c3f43' : '#50545a';
        px(x, y, hell(hexZuRgb(basis), 0.94 + rnd() * 0.1));
      }
    }
  });
  // Reflektoren: orange und weiss
  kachel('reflOrange', 4, 4, (px) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) px(x, y, hexZuRgb(x === 1 && y === 1 ? '#ffd9a0' : '#ff8a1c'));
  });
  kachel('reflWeiss', 4, 4, (px) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) px(x, y, hexZuRgb(x === 1 && y === 1 ? '#ffffff' : '#e8e8e2'));
  });
  // Holzlatte: Maserung längs, ein paar Astlöcher. 32x4
  const HOLZ_L = ['#6b5236', '#8a6b46', '#a1815a', '#4d3b27'].map(hexZuRgb);
  kachel('latte', 32, 4, (px) => {
    for (let y = 0; y < 4; y++) {
      let f = rnd() < 0.5 ? 1 : 2;
      for (let x = 0; x < 32; x++) {
        if (rnd() < 0.15) f = f === 1 ? 2 : 1;
        let c = HOLZ_L[f];
        if (y === 3) c = HOLZ_L[0];
        if (rnd() < 0.04) c = HOLZ_L[3];
        px(x, y, c);
      }
    }
    px(9, 1, HOLZ_L[3]); px(10, 1, HOLZ_L[0]); px(23, 2, HOLZ_L[3]);
  });
  // Holzpfosten: verwittertes, graubraunes Holz. 8x16
  const HOLZ_P = ['#5a4a36', '#6f5d45', '#86735a', '#3f3426'].map(hexZuRgb);
  kachel('holzpfosten', 8, 16, (px) => {
    for (let x = 0; x < 8; x++) {
      let f = x < 3 ? 2 : x > 5 ? 0 : 1;
      for (let y = 0; y < 16; y++) {
        let c = HOLZ_P[f];
        if (rnd() < 0.08) c = HOLZ_P[3];
        else if (rnd() < 0.1) c = HOLZ_P[Math.min(2, f + 1)];
        px(x, y, c);
      }
    }
  });
  // Rückseite der Schilder: Blech
  kachel('blech', 8, 8, (px) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) px(x, y, hell(hexZuRgb('#8e9297'), 0.94 + rnd() * 0.1));
  });

  // --- Schilder. Sie sind im Spiel nur ca. 10–20 Bildpunkte gross. Darum werden sie in
  // halber Auflösung mit groben Pixeln gezeichnet und doppelt so gross abgelegt: so bleiben
  // sie auch in der Ferne (kleinere Mipmap-Stufe) scharf statt zu grauem Brei zu werden.
  function kachel2(name, b, h, malen, durchsichtig = false) {
    kachel(name, b * 2, h * 2, (px) => malen((x, y, rgb, a) => {
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) px(x * 2 + dx, y * 2 + dy, rgb, a);
    }), durchsichtig);
  }
  // Muster aus Text: jedes Zeichen ein Pixel, '.' = leer
  const muster = (px, zeilen, x0, y0, farben) => zeilen.forEach((z, y) => [...z].forEach((ch, x) => {
    if (farben[ch]) px(x0 + x, y0 + y, farben[ch]);
  }));
  const ROT = hexZuRgb('#c81e28'), WEISS = hexZuRgb('#f4f2ea'), SCHWARZ = hexZuRgb('#1e1e1e'), GRAU = hexZuRgb('#8e9297');

  // Warnschilder: rotes Dreieck, weiss innen, schwarzes Symbol. 16x14 (abgelegt 32x28)
  const WB = 16, WH = 14;
  function imDreieck(x, y) {
    const py = y + 0.5, pxx = x + 0.5;
    const halb = (py / WH) * (WB / 2);
    return Math.min((halb - Math.abs(pxx - WB / 2)) * 0.87, WH - py); // Abstand zum Rand (negativ = aussen)
  }
  function dreieck(name, symbol) {
    kachel2(name, WB, WH, (px) => {
      for (let y = 0; y < WH; y++) {
        for (let x = 0; x < WB; x++) {
          const d = imDreieck(x, y);
          if (d >= 0) px(x, y, d < 1.4 ? ROT : WEISS);
        }
      }
      muster(px, symbol, 4, 5, { k: SCHWARZ });
    }, true);
  }
  // Kurve rechts (für links wird das Schild gespiegelt)
  dreieck('warnKurve', [
    '........',
    '....k...',
    '..kkkk..',
    '..k.k...',
    '..k.....',
    '..k.....',
    '..k.....',
  ]);
  // Doppelkurve, zuerst rechts (für zuerst links gespiegelt)
  dreieck('warnDoppel', [
    '....k...',
    '...kkk..',
    '....k...',
    '...k....',
    '...k....',
    '....k...',
    '...k....',
  ]);
  // Steinschlag: Felshang links, Steine fallen nach rechts
  dreieck('warnStein', [
    '........',
    '..k.....',
    '..kk.k..',
    '.kkk....',
    '.kkk..k.',
    '.kkkk...',
    'kkkkk.k.',
  ]);
  // Gefälle: Keil, der nach rechts abfällt
  dreieck('warnGefaelle', [
    '........',
    '........',
    'k.......',
    'kkk.....',
    'kkkkk...',
    'kkkkkkk.',
    '........',
  ]);
  // Rückseite der Warnschilder: graues Dreieck
  kachel2('warnRuecken', WB, WH, (px) => {
    for (let y = 0; y < WH; y++) for (let x = 0; x < WB; x++) if (imDreieck(x, y) >= 0) px(x, y, hell(GRAU, 0.94 + rnd() * 0.1));
  }, true);

  // Richtungstafel (Chevron): rot mit weissem Pfeil nach links (für rechts gespiegelt). 8x10
  kachel2('chevron', 8, 10, (px) => {
    for (let y = 0; y < 10; y++) for (let x = 0; x < 8; x++) px(x, y, ROT);
    muster(px, [
      '........',
      '.....ww.',
      '....ww..',
      '...ww...',
      '..ww....',
      '..ww....',
      '...ww...',
      '....ww..',
      '.....ww.',
      '........',
    ], 0, 0, { w: WEISS });
  });
  // Kehren-Nummern: blaue Tafel, weisser Rand, weisse Ziffer. 8x7
  const BLAU = hexZuRgb('#1f4f9a');
  for (let k = 1; k <= kehren; k++) {
    kachel2(`kehre${k}`, 8, 7, (px) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 8; x++) px(x, y, x === 0 || y === 0 || x === 7 || y === 6 ? WEISS : BLAU);
      muster(px, ZIFFERN0[k] || ZIFFERN0[9], 3, 1, { '#': WEISS });
    });
  }
  // Kilometertafeln: weiss mit schwarzem Rand und Zahl wie "1.5". 12x7
  for (const zahl of kmZahlen) {
    kachel2(`km${zahl}`, 12, 7, (px) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 12; x++) px(x, y, x === 0 || y === 0 || x === 11 || y === 6 ? SCHWARZ : WEISS);
      const zeichen = zahl.split('');
      const breite = zeichen.reduce((n, z) => n + (z === '.' ? 2 : 4), -1);
      let x = Math.floor((12 - breite) / 2);
      for (const z of zeichen) {
        if (z === '.') { px(x, 5, SCHWARZ); x += 2; continue; }
        muster(px, ZIFFERN0[z], x, 1, { '#': SCHWARZ });
        x += 4;
      }
    });
  }

  // --- Meilenstein 2a.1 ---------------------------------------------------------
  // Weitere Warnschilder: Kühe (Weide/Viehtrieb) und Kreuzung (Feldweg mündet ein)
  dreieck('warnKuh', [
    '........',
    'k.......',
    'kkkkkkk.',
    'kkkkkkkk',
    '..kkkkk.',
    '..k...k.',
    '..k...k.',
  ]);
  dreieck('warnKreuzung', [
    '........',
    '...kk...',
    '...kk...',
    '.kkkkkk.',
    '...kk...',
    '...kk...',
    '...kk...',
  ]);
  // Tempo-Tafeln: rund, weiss mit rotem Rand, schwarze Zahl (generisch, ohne Landeszeichen). 12x12
  const imKreis = (x, y) => Math.hypot(x + 0.5 - 6, y + 0.5 - 6);
  for (const zahl of tempoZahlen) {
    kachel2(`tempo${zahl}`, 12, 12, (px) => {
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 12; x++) {
          const r = imKreis(x, y);
          if (r < 6.05) px(x, y, r >= 4.3 ? ROT : WEISS);
        }
      }
      const zeichen = String(zahl).split('');
      let x = Math.floor((12 - (zeichen.length * 4 - 1)) / 2);
      for (const z of zeichen) { muster(px, ZIFFERN0[z], x, 3, { '#': SCHWARZ }); x += 4; }
    }, true);
  }
  // Rückseite der Tempo-Tafeln: graue Scheibe
  kachel2('tempoRuecken', 12, 12, (px) => {
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) if (imKreis(x, y) < 6.05) px(x, y, hell(GRAU, 0.94 + rnd() * 0.1));
  }, true);

  const textur = zuTextur(l);
  return {
    textur,
    // Texturbereich einer Kachel (u nach rechts, v nach oben, wie Three.js es will)
    kachel(name) {
      const r = rechtecke[name];
      if (!r) throw new Error(`Atlas: Kachel ${name} fehlt`);
      return { u0: r.x / N, u1: (r.x + r.b) / N, v0: 1 - (r.y + r.h) / NH, v1: 1 - r.y / NH };
    },
  };
}

// Büsche und Grasbüschel (Meilenstein 2b), je 16x16 Pixel, Boden unten:
//   0–2 grüne Sträucher, 3 Alpenrose (rosa Blüten), 4 Heidelbeere (niedrig, blaue Beeren),
//   5–6 hohes Gras mit ein paar Blumen
export const BUSCH = { gruen: [0, 1, 2], bluete: 3, beere: 4, gras: [5, 6] };
const BUSCHGRUEN = ['#24481c', '#335f24', '#4a7e2e', '#679a3a', '#183614'];
const BLUETE = ['#d0457a', '#e870a0', '#f3a6c4'];
const BEERE = ['#2c3f6e', '#4a5f9c'];
const GRAS = ['#2f5a1c', '#4f7f2a', '#6d9a36', '#a3b752'];
const BLUME = ['#f4f0e0', '#f2d24a', '#9a7ad0'];
export function buschTextur(seed = 83) {
  const B = 16, H = 16, N = 7;
  const l = leinwand(B * N, H);
  const rnd = zufall(seed);
  const gruen = BUSCHGRUEN.map(hexZuRgb), bluete = BLUETE.map(hexZuRgb), beere = BEERE.map(hexZuRgb);
  const gras = GRAS.map(hexZuRgb), blume = BLUME.map(hexZuRgb);
  // Strauch aus ein paar Kreisen, Licht von links oben
  function strauch(ox, hoehe, breite, punkte) {
    const kreise = [];
    const n = 4 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const r = 2.6 + rnd() * 2.2;
      kreise.push({ x: 8 + (rnd() - 0.5) * breite, y: H - r * 0.8 - rnd() * (hoehe - r * 1.6), r });
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        let drin = null;
        for (const k of kreise) if (Math.hypot(x + 0.5 - k.x, y + 0.5 - k.y) < k.r + (rnd() - 0.5) * 0.8) drin = k;
        if (!drin) continue;
        const lx = (x + 0.5 - drin.x) / drin.r, ly = (y + 0.5 - drin.y) / drin.r;
        const licht = -lx * 0.6 - ly * 0.8 - (y > H - 3 ? 0.4 : 0);
        let f = licht > 0.5 ? 3 : licht > 0.05 ? 2 : licht > -0.5 ? 1 : 0;
        if (rnd() < 0.14) f = Math.max(0, f - 1);
        if (rnd() < 0.04) f = 4;
        let farbe = gruen[f];
        // Blüten oder Beeren obenauf (dort, wo Licht hinkommt)
        if (punkte && licht > -0.2 && rnd() < punkte.anteil) farbe = punkte.farben[Math.floor(rnd() * punkte.farben.length)];
        setze(l, ox + x, y, farbe);
      }
    }
  }
  strauch(0, 12, 9);
  strauch(B, 10, 11);
  strauch(B * 2, 13, 8);
  strauch(B * 3, 10, 10, { anteil: 0.22, farben: bluete });   // Alpenrose
  strauch(B * 4, 7, 12, { anteil: 0.16, farben: beere });     // Heidelbeere (niedrig)
  // Grasbüschel: Halme von unten Mitte fächerförmig nach oben, ein paar Blumen
  for (let v = 0; v < 2; v++) {
    const ox = B * (5 + v);
    const halme = 18 + Math.floor(rnd() * 5);
    for (let i = 0; i < halme; i++) {
      const fuss = 8 + (rnd() - 0.5) * 6, neigung = (rnd() - 0.5) * 0.9, laenge = 5 + rnd() * 10;
      for (let t = 0; t < laenge; t++) {
        const x = Math.round(fuss + neigung * t + neigung * neigung * t * 0.15), y = H - 1 - t;
        setze(l, ox + x, y, gras[t > laenge - 3 ? 3 : t < 3 ? 0 : 1 + Math.floor(rnd() * 2)]);
      }
      if (rnd() < 0.4) {
        const x = Math.round(fuss + neigung * laenge), y = Math.max(0, Math.round(H - 1 - laenge));
        const b = blume[Math.floor(rnd() * blume.length)];
        setze(l, ox + x, y, b); setze(l, ox + x + 1, y, b);
      }
    }
  }
  return { textur: zuTextur(l), varianten: N, seitenVerhaeltnis: B / H };
}

// ---------------------------------------------------------------------
// Absperrungen (Meilenstein 3a): alle Teile auf einem Bild (Atlas), ein Material.
// Flatterband, Warnstangen, Schild "STRASSE GESPERRT", Rally-Pfeil, Reifen, Strohballen, Holz.
// Ergebnis: { textur, kachel(name) -> { u0, v0, u1, v1 } }
// ---------------------------------------------------------------------
export function absperrAtlas(seed = 71) {
  const N = 128, NH = 128, RAND = 2;
  const l = leinwand(N, NH);
  const rnd = zufall(seed);
  const rechtecke = {};
  let x0 = 0, y0 = 0, zeileH = 0;
  // wie beim Strassenrand-Atlas: Kachel mit Rand aus wiederholten Randpixeln
  function kachel(name, b, h, malen) {
    if (x0 + b + RAND * 2 > N) { x0 = 0; y0 += zeileH; zeileH = 0; }
    if (y0 + h + RAND * 2 > NH) throw new Error(`Atlas voll bei Kachel ${name}`);
    const ox = x0 + RAND, oy = y0 + RAND;
    const daten = new Array(b * h).fill(null);
    malen((x, y, rgb) => { if (x >= 0 && y >= 0 && x < b && y < h) daten[y * b + x] = rgb; });
    for (let y = -RAND; y < h + RAND; y++) {
      for (let x = -RAND; x < b + RAND; x++) {
        const d = daten[Math.min(h - 1, Math.max(0, y)) * b + Math.min(b - 1, Math.max(0, x))];
        if (d) setze(l, ox + x, oy + y, d);
      }
    }
    rechtecke[name] = { x: ox, y: oy, b, h };
    x0 += b + RAND * 2;
    zeileH = Math.max(zeileH, h + RAND * 2);
  }
  const hell = (rgb, f) => rgb.map((c) => Math.max(0, Math.min(255, Math.round(c * f))));
  const ROT = hexZuRgb('#c8202a'), WEISS = hexZuRgb('#f2f0e8'), SCHWARZ = hexZuRgb('#1c1c1c'), GELB = hexZuRgb('#f0c020');

  // M3a.1: Verbots-Symbol (rotes Rund, weisser Balken), aus der Fahrt gut lesbar. 24x24, rund (aussen durchsichtig)
  kachel('verbot', 24, 24, (px) => {
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 24; x++) {
        const r = Math.hypot(x + 0.5 - 12, y + 0.5 - 12);
        if (r > 11.8) continue;
        const balken = Math.abs(y + 0.5 - 12) <= 2.6 && Math.abs(x + 0.5 - 12) <= 8;
        px(x, y, balken ? WEISS : r > 11 ? hell(ROT, 0.8) : hell(ROT, 0.97 + rnd() * 0.06));
      }
    }
  });
  kachel('verbotRuecken', 24, 24, (px) => {
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) if (Math.hypot(x + 0.5 - 12, y + 0.5 - 12) <= 11.8) px(x, y, hell(hexZuRgb('#8e9297'), 0.95 + rnd() * 0.08));
  });
  // Chevron: rote Tafel, weisser Winkel nach rechts (für links gespiegelt). 12x16
  kachel('chevron', 12, 16, (px) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 12; x++) {
        const dy = Math.abs(y + 0.5 - 8);
        const winkel = Math.abs(x + 0.5 - (3 + (8 - dy) * 0.62)) <= 1.7;
        px(x, y, winkel ? WEISS : x === 0 || x === 11 || y === 0 || y === 15 ? hell(ROT, 0.75) : ROT);
      }
    }
  });
  // Grosse Richtungstafel: gelb, schwarzer Rand, drei schwarze Winkel nach rechts. 32x14
  kachel('richtung', 32, 14, (px) => {
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 32; x++) {
        const dy = Math.abs(y + 0.5 - 7);
        let c = x === 0 || y === 0 || x === 31 || y === 13 ? SCHWARZ : hell(GELB, 0.97 + rnd() * 0.05);
        for (const x0 of [5, 13, 21]) if (Math.abs(x + 0.5 - (x0 + (6 - dy) * 0.75)) <= 1.9 && dy <= 5.2) c = SCHWARZ;
        px(x, y, c);
      }
    }
  });
  // Rückseite der Schilder: grau
  kachel('blech', 4, 4, (px) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) px(x, y, hell(hexZuRgb('#8e9297'), 0.95 + rnd() * 0.08)); });
  // Warnstange: rot-weiss geringelt (je 4 Pixel). 4x16
  kachel('stange', 4, 16, (px) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 4; x++) px(x, y, hell(Math.floor(y / 4) % 2 ? WEISS : ROT, x === 3 ? 0.8 : 1));
  });
  // Flatterband: rot-weiss schräg gestreift. 32x3
  kachel('band', 32, 3, (px) => {
    for (let y = 0; y < 3; y++) for (let x = 0; x < 32; x++) px(x, y, Math.floor((x + y) / 4) % 2 ? WEISS : ROT);
  });
  // Altreifen (M3a.1): Lauffläche schwarzgrau mit Profil, oben und unten die hellere, gewölbte
  // Flanke (grauer Ring) – so sieht man im Stapel jeden Reifen einzeln. 16x6
  const GUMMI = ['#141416', '#2f2f33', '#424246', '#6a6a70', '#85858b'].map(hexZuRgb);
  kachel('reifenSeite', 16, 6, (px) => {
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 16; x++) {
        let c = (x + (y % 2)) % 3 === 0 ? GUMMI[0] : GUMMI[1];
        if (rnd() < 0.08) c = GUMMI[2];
        if (y === 0 || y === 5) c = rnd() < 0.8 ? GUMMI[4] : GUMMI[3];
        if (y === 1 || y === 4) c = GUMMI[3];
        px(x, y, c);
      }
    }
  });
  // weiss gestrichener Reifen (Farbe abgeplatzt, Flanken grau). 16x6
  kachel('reifenWeiss', 16, 6, (px) => {
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 16; x++) {
        let c = hell(WEISS, 0.92 + rnd() * 0.08);
        if (rnd() < 0.07) c = GUMMI[1];
        if (y === 0 || y === 5) c = GUMMI[3];
        px(x, y, c);
      }
    }
  });
  // Reifen von oben: grauer Gummiring (Flanke), innen ein dunkles Loch. 16x16
  kachel('reifenOben', 16, 16, (px) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = Math.hypot(x + 0.5 - 8, y + 0.5 - 8);
        let c = r < 4.4 ? GUMMI[0] : r < 5.4 ? GUMMI[4] : r < 7 ? GUMMI[3] : GUMMI[2];
        if (r >= 4.4 && rnd() < 0.1) c = GUMMI[1];
        px(x, y, c);
      }
    }
  });
  // Strohballen: gelbbeige Halme längs, zwei dunklere Schnüre. 16x12 (Seite) und 12x12 (Stirn)
  const STROH = ['#d8bd6a', '#c7a955', '#e6d088', '#a98c40'].map(hexZuRgb);
  kachel('strohSeite', 16, 12, (px) => {
    for (let y = 0; y < 12; y++) {
      let f = rnd() < 0.5 ? 0 : 1;
      for (let x = 0; x < 16; x++) {
        if (rnd() < 0.25) f = Math.floor(rnd() * 3);
        let c = STROH[f];
        if (rnd() < 0.06) c = STROH[3];
        if (x === 4 || x === 11) c = hell(STROH[3], 0.8); // Schnur
        px(x, y, c);
      }
    }
  });
  kachel('strohOben', 16, 12, (px) => {
    for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) px(x, y, hell(STROH[rnd() < 0.6 ? 2 : 0], 0.95 + rnd() * 0.1));
  });
  kachel('strohEnde', 12, 12, (px) => {
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) px(x, y, hell(STROH[rnd() < 0.5 ? 1 : 3], 0.9 + rnd() * 0.2));
  });
  // Holz: Brett (Maserung längs) und Pfosten, wie der Holzzaun am Strassenrand. 32x4 / 8x16
  const HOLZ_L = ['#6b5236', '#8a6b46', '#a1815a', '#4d3b27'].map(hexZuRgb);
  kachel('brett', 32, 4, (px) => {
    for (let y = 0; y < 4; y++) {
      let f = rnd() < 0.5 ? 1 : 2;
      for (let x = 0; x < 32; x++) {
        if (rnd() < 0.15) f = f === 1 ? 2 : 1;
        let c = HOLZ_L[f];
        if (y === 3) c = HOLZ_L[0];
        if (rnd() < 0.04) c = HOLZ_L[3];
        px(x, y, c);
      }
    }
  });
  // Brett rot-weiss gestrichen (verwittert: hier und da Holz). 32x4
  kachel('brettRot', 32, 4, (px) => {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 32; x++) {
        let c = Math.floor(x / 6) % 2 ? WEISS : ROT;
        if (y === 3) c = hell(c, 0.8);
        if (rnd() < 0.07) c = HOLZ_L[1];
        px(x, y, c);
      }
    }
  });
  kachel('pfosten', 8, 16, (px) => {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 16; y++) {
        let c = HOLZ_L[x < 3 ? 2 : x > 5 ? 0 : 1];
        if (rnd() < 0.08) c = HOLZ_L[3];
        px(x, y, c);
      }
    }
  });

  const textur = zuTextur(l);
  return {
    textur,
    kachel(name) {
      const r = rechtecke[name];
      if (!r) throw new Error(`Atlas: Kachel ${name} fehlt`);
      return { u0: r.x / N, u1: (r.x + r.b) / N, v0: 1 - (r.y + r.h) / NH, v1: 1 - r.y / NH };
    },
  };
}
