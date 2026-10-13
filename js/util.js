// Kleine Hilfsfunktionen: Zufall mit festem Startwert, Rauschen, Mathe.

// Zufallsgenerator mit Startwert (gleicher Seed = gleiche Zahlenfolge)
export function zufall(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pseudo-Zufallswert 0..1 für einen Gitterpunkt
function gitterWert(ix, iz, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(seed, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Weiches Wertrauschen 0..1
export function rauschen(x, z, seed = 0) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = gitterWert(ix, iz, seed), b = gitterWert(ix + 1, iz, seed);
  const c = gitterWert(ix, iz + 1, seed), d = gitterWert(ix + 1, iz + 1, seed);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

// Mehrere Rausch-Lagen übereinander (natürlicher), Ergebnis ca. 0..1
export function fbm(x, z, seed = 0, lagen = 4) {
  let summe = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < lagen; i++) {
    summe += amp * rauschen(x * freq, z * freq, seed + i * 17);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return summe / norm;
}

export const begrenze = (w, min, max) => (w < min ? min : w > max ? max : w);
export const mische = (a, b, t) => a + (b - a) * t;
export function glatt(a, b, x) {
  const t = begrenze((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

// Winkel auf -PI..PI bringen
export function winkelNorm(w) {
  while (w > Math.PI) w -= Math.PI * 2;
  while (w < -Math.PI) w += Math.PI * 2;
  return w;
}
