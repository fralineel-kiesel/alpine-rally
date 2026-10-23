// Icons für den Web-App-Modus bauen (Meilenstein 9a):  node tools/icons-bauen.mjs
// Malt ein eigenes kleines Pixel-Motiv (Himmel, Berge mit Schnee, Wiese, Strasse, Schriftzug ALPINE RALLY in der
// Pixelschrift des Spiels aus js/pixel.js) Pixel für Pixel im Code und vergrössert es ohne Glätten auf ganze Vielfache.
// Keine fremden Bilder, keine Marken. Ergebnis (wird mit eingecheckt): icons/icon-192.png, icons/icon-512.png,
// icons/icon-maskable-512.png (Inhalt im inneren Kreis, für runde Masken), icons/apple-touch-icon-180.png.
// Wiederholbar: gleiche Eingabe = gleiche Dateien.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

// Grösse in Pixeln, Grundraster (das Motiv wird in diesem Raster gemalt), Rand für runde Masken
const ICONS = [
  ['icon-192.png', 192, 48, false],
  ['icon-512.png', 512, 64, false],
  ['icon-maskable-512.png', 512, 64, true],
  ['apple-touch-icon-180.png', 180, 45, false],
];

const s = await starteSpiel({ breite: 320, hoehe: 180 });
await s.page.goto(`${s.url}/tools/icons-bauen.mjs`); // (leichte Seite auf demselben Server; das Spiel wird nicht geladen)
await s.page.setContent('<!doctype html><html><head><script type="importmap">{ "imports": { "three": "/lib/three.module.min.js" } }</script></head><body></body></html>');
const daten = await s.page.evaluate(async (icons) => {
  const P = await import('/js/pixel.js');
  const out = {};
  for (const [name, groesse, n, maske] of icons) {
    const c = document.createElement('canvas'); c.width = n; c.height = n;
    const x = c.getContext('2d');
    const px = (a, b, f) => { x.fillStyle = f; x.fillRect(a, b, 1, 1); };
    const reihe = (y, a, b, f) => { x.fillStyle = f; x.fillRect(a, y, b - a, 1); };
    // Himmel in drei Bändern (wie das Spiel: klares Blau oben, Dunst am Horizont)
    const horizont = Math.round(n * 0.68);
    for (let y = 0; y < horizont; y++) reihe(y, 0, n, y < n * 0.3 ? '#2d6fd2' : y < n * 0.5 ? '#4f8fe0' : '#aabdc8');
    // Berge: drei Gipfel, Fels grau, Schnee oben
    const gipfel = [[0.18, 0.44], [0.56, 0.38], [0.88, 0.48]];
    for (let xx = 0; xx < n; xx++) {
      let top = horizont;
      for (const [gx, gy] of gipfel) top = Math.min(top, Math.round(gy * n + Math.abs(xx - gx * n) * 0.95));
      for (let y = top; y < horizont; y++) {
        const schnee = gipfel.some(([gx, gy]) => y < gy * n + n * 0.07 && Math.abs(xx - gx * n) < (y - gy * n) / 0.95 + 1);
        px(xx, y, schnee ? '#f4f4ee' : (xx * 7 + y * 3) % 11 === 0 ? '#6f7882' : '#8d96a0');
      }
    }
    // Wiese mit dunklerem Band, Tannen am Horizont
    for (let y = horizont; y < n; y++) reihe(y, 0, n, y < horizont + n * 0.06 ? '#2f6b2a' : '#4a9a3a');
    for (let i = 0; i < 7; i++) {
      const tx = Math.round((i + 0.5) * n / 7 + (i % 2 ? 1 : -1)), th = Math.max(3, Math.round(n * 0.08));
      for (let k = 0; k < th; k++) reihe(horizont - k, tx - Math.floor((th - k) / 2), tx + Math.ceil((th - k) / 2), '#1f4a24');
    }
    // Strasse: von unten Mitte zum Horizont, mit Mittellinie
    for (let y = horizont + 1; y < n; y++) {
      const t = (y - horizont) / (n - horizont), mitte = n * 0.5 + Math.sin(t * 2.2) * n * 0.08, breit = 1 + t * n * 0.34;
      reihe(y, Math.round(mitte - breit / 2), Math.round(mitte + breit / 2), '#5a6168');
      if (y % 4 < 2 && t > 0.2) px(Math.round(mitte), y, '#f4f4ee');
    }
    // Schriftzug in der Pixelschrift des Spiels (gelb mit dunklem Schatten), innerhalb des sicheren Kreises
    const y0 = Math.round(n * (maske ? 0.18 : 0.07));
    P.pixelText(x, 'ALPINE', n / 2, y0, 1, '#ffd23c', 'mitte', '#101418');
    P.pixelText(x, 'RALLY', n / 2, y0 + 9, 1, '#ffd23c', 'mitte', '#101418');
    // vergrössern ohne Glätten
    const g = document.createElement('canvas'); g.width = groesse; g.height = groesse;
    const gx = g.getContext('2d'); gx.imageSmoothingEnabled = false;
    const f = groesse / n;
    if (maske) { gx.fillStyle = '#121820'; gx.fillRect(0, 0, groesse, groesse); }
    gx.drawImage(c, 0, 0, n * f, n * f);
    out[name] = g.toDataURL('image/png').split(',')[1];
  }
  return out;
}, ICONS);
await s.schliessen();
const ordner = path.join(WURZEL, 'icons');
fs.mkdirSync(ordner, { recursive: true });
for (const [name, b64] of Object.entries(daten)) {
  fs.writeFileSync(path.join(ordner, name), Buffer.from(b64, 'base64'));
  console.log(`icons/${name}: ${Buffer.from(b64, 'base64').length} Bytes`);
}
