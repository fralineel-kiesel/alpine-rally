// Hilfe M8g: Tacho-Ausschnitt des HUD als Text-Pixelkarte (für die Planung, ohne Bilder anzusehen)
// node tools/m8g-karte.mjs [auto] [x y b h] [--klassisch]
import { starteSpiel } from './spiel-browser.mjs';
const a = process.argv.slice(2).filter((x) => !x.startsWith('--'));
const id = a[0] || 'rt4';
const [x, y, b, h] = a.length >= 5 ? a.slice(1, 5).map(Number) : [205, 118, 115, 62];
const s = await starteSpiel({ breite: 640, hoehe: 360 });
await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
const zeilen = await s.page.evaluate(async ([x, y, b, h, kl]) => {
  if (kl && window.__alpineRally.setzeEinstellung) window.__alpineRally.setzeEinstellung('tacho', 'klassisch');
  await new Promise((r) => setTimeout(r, 600));
  const d = document.getElementById('hud').getContext('2d').getImageData(x, y, b, h).data;
  const out = [];
  for (let j = 0; j < h; j++) {
    let z = '';
    for (let i = 0; i < b; i++) {
      const k = (j * b + i) * 4, r = d[k], g = d[k + 1], bl = d[k + 2], al = d[k + 3];
      z += al < 20 ? ' ' : r > 200 && g > 180 && bl < 120 ? 'Y' : r > 180 && g < 110 ? 'R' : r > 190 && g > 190 && bl > 170 ? 'W' : g > 150 && r < 140 ? 'G' : bl > 120 && r < 90 ? 'B' : r < 40 && g < 45 ? '.' : ':';
    }
    out.push(z);
  }
  return out;
}, [x, y, b, h, process.argv.includes('--klassisch')]);
console.log(zeilen.map((z, i) => `${String(y + i).padStart(3)} ${z}`).join('\n'));
await s.schliessen();
