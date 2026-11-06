// Meilenstein 10d: Bilder für den Bericht nach screenshots/m10d/ (höchstens 3):  node tools/m10d-bilder.mjs [--nur sprung,schatten]
// 01-alpen-sprung-phasen (Zielkuppe: Abheben / Gipfel / Landung), 02-alpen-schatten (kurze Mittags-Schatten: Auto, Bäume,
// Steine bei 1200 m; links AUS, rechts AN). Auflösung fest 320x180, eigene Bild-Uhr (gleiche Bilder bei jedem Lauf).
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ZIEL = path.join(WURZEL, 'screenshots', 'm10d');
fs.mkdirSync(ZIEL, { recursive: true });
const UHR = () => {
  let jetzt = 0; const warte = [];
  performance.now = () => jetzt;
  window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
  window.cancelAnimationFrame = () => {};
  window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
  // Foto: 3D-Bild und HUD (beide 320x180) übereinander
  window.__foto = (mitHud = true) => {
    const a = document.getElementById('spiel'), h = document.getElementById('hud');
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(a, 0, 0, 320, 180); if (mitHud) x.drawImage(h, 0, 0, 320, 180);
    return c;
  };
};
async function oeffne(adresse, speicher = {}) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: 'rt4' });
  await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  await s.page.addInitScript(UHR);
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 600000, polling: 200 });
  await s.page.evaluate(() => window.__bild(330, 1000 / 60));
  return s;
}
const speichere = (url, name) => { fs.writeFileSync(path.join(ZIEL, name), Buffer.from(url.split(',')[1], 'base64')); console.log(name); };

if (!NUR || NUR.includes('sprung')) {
  // Zielkuppe (3440 m) mit 110 km/h, SPRUNGKAMERA NORMAL: 5 Bilder nach dem Abheben / Gipfel / 3 Bilder nach der Landung
  const s = await oeffne('?menue=aus&ton=aus&aufloesung=320x180', { 'alpineRally.einstellungen': JSON.stringify({ sprungkamera: 'normal' }) });
  const url = await s.page.evaluate(() => {
    const A = window.__alpineRally, P = A.physik, F = A.flug;
    A.anhalten = false; A.rennen.naechsterCp = 3; A.setzeAuf(3380); A.kameraSofort();
    P.vx = Math.sin(P.richtung) * 110 / 3.6; P.vz = Math.cos(P.richtung) * 110 / 3.6; A.testEingabe = { gas: 1 };
    const l0 = F.ereignis.landung; let k = 0, ab = -1, best = -1e9, gipfel = null, abBild = null;
    while (k++ < 500 && F.ereignis.landung === l0) {
      window.__bild(1, 1000 / 60);
      if (F.inLuft && ab < 0) ab = k;
      if (ab > 0 && k === ab + 5) abBild = window.__foto();
      if (F.inLuft && A.autoModell.objekt.position.y > best) { best = A.autoModell.objekt.position.y; gipfel = window.__foto(); }
    }
    window.__bild(3, 1000 / 60); const land = window.__foto();
    A.testEingabe = null; A.anhalten = true;
    const d = document.createElement('canvas'); d.width = 960 + 8; d.height = 180;
    const z = d.getContext('2d'); z.imageSmoothingEnabled = false; z.fillStyle = '#101418'; z.fillRect(0, 0, d.width, d.height);
    [abBild, gipfel, land].forEach((c, i) => z.drawImage(c, i * 324, 0));
    return d.toDataURL();
  });
  speichere(url, '01-alpen-sprung-phasen.png');
  await s.schliessen();
}
if (!NUR || NUR.includes('schatten')) {
  // Talschleife (1200 m, Bäume nah an der Strasse): Auto steht, links SCHATTEN AUS, rechts AN, ohne HUD, je doppelt vergrössert
  const fotos = [];
  for (const an of [false, true]) {
    const s = await oeffne('?menue=aus&ton=aus&aufloesung=320x180', { 'alpineRally.einstellungen': JSON.stringify({ schatten: an }) });
    fotos.push(await s.page.evaluate(() => {
      const A = window.__alpineRally; A.anhalten = true; A.setzeAuf(1200); A.kameraSofort(); window.__bild(3, 1000 / 60);
      return window.__foto(false).toDataURL();
    }));
    await s.schliessen();
  }
  const s = await oeffne('?menue=aus&ton=aus&aufloesung=320x180');
  const url = await s.page.evaluate(async (fotos) => {
    const bilder = await Promise.all(fotos.map((u) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = u; })));
    const d = document.createElement('canvas'); d.width = 1280 + 8; d.height = 360;
    const z = d.getContext('2d'); z.imageSmoothingEnabled = false; z.fillStyle = '#101418'; z.fillRect(0, 0, d.width, d.height);
    bilder.forEach((b, i) => z.drawImage(b, i * 648, 0, 640, 360));
    return d.toDataURL();
  }, fotos);
  speichere(url, '02-alpen-schatten.png');
  await s.schliessen();
}
