// Bilder für Meilenstein 10c:  node tools/m10c-bilder.mjs   -> screenshots/m10c/ (6 Bilder, zugeschnitten)
//   01-sprung-phasen.png   Hochwaldkuppe (der grosse Sprung) in drei Phasen: Abheben | Gipfel | Landung (Sprungkamera AN)
//   02-schatten-luft.png   Schatten-Fleck bleibt am Boden, das Auto fliegt darüber (Ausschnitt um das Auto)
//   03-pacenote-sprung.png Pace-Note SPRUNG oben im HUD (Ausschnitt)
//   04-ziel-spruenge.png   Zielbildschirm mit den Sprung-Zeilen (Finnland, Audan Quarto, Testfahrer mittel)
//   05-einstellungen.png   EINSTELLUNGEN mit der neuen Zeile SPRUNGKAMERA
//   06-profil-finnland.png Höhenprofil von Finnland mit den vier Sprüngen (aus tools/strecke-karte.mjs, Ausschnitt)
// Alles in Chromium (Software-Grafik). Das Spiel selbst lädt diese Datei nicht.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const AUS = path.join(WURZEL, 'screenshots/m10c');
fs.mkdirSync(AUS, { recursive: true });
// eigene Bild-Uhr (wie die Tests): Bilder laufen nur auf Befehl, __foto = 3D-Bild + HUD in HUD-Grösse
const UHR = () => {
  let jetzt = 0; const warte = [];
  performance.now = () => jetzt;
  window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
  window.cancelAnimationFrame = () => {};
  window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
  window.__foto = () => {
    window.__bild(1, 1000 / 60);
    const a = document.getElementById('spiel'), h = document.getElementById('hud');
    const c = document.createElement('canvas'); c.width = h.width; c.height = h.height;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(a, 0, 0, h.width, h.height); x.drawImage(h, 0, 0);
    return c.toDataURL();
  };
};
const speichere = (name, url) => { fs.writeFileSync(path.join(AUS, name), Buffer.from(url.split(',')[1], 'base64')); console.log(`screenshots/m10c/${name}`); };
async function seite(adresse, speicher = null) {
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  await s.page.addInitScript(UHR);
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 180000, polling: 200 });
  await s.page.evaluate(() => window.__bild(320, 1000 / 60)); // Countdown vorbei
  return s;
}
// Bilder (data-URLs) im Browser zuschneiden und nebeneinander setzen: teile = [{ url, x, y, b, h }], mal = Vergrösserung
const ZUSAMMEN = async ({ teile, mal, luecke }) => {
  const bilder = await Promise.all(teile.map(async (t) => createImageBitmap(await (await fetch(t.url)).blob())));
  const B = teile.reduce((s, t) => s + t.b * mal, 0) + luecke * (teile.length - 1), H = Math.max(...teile.map((t) => t.h * mal));
  const c = document.createElement('canvas'); c.width = B; c.height = H;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#000'; x.fillRect(0, 0, B, H);
  let xl = 0;
  teile.forEach((t, i) => { x.drawImage(bilder[i], t.x, t.y, t.b, t.h, xl, 0, t.b * mal, t.h * mal); xl += t.b * mal + luecke; });
  return c.toDataURL();
};

// --- 1, 2, 3: Fahrt über die Hochwaldkuppe (110 km/h, Vollgas), Phasen und HUD ---
{
  const s = await seite('?menue=aus&ton=aus&strecke=finnland&auto=rt4');
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, P = A.physik, F = A.flug, out = {};
    A.anhalten = false; A.rennen.naechsterCp = 3;
    // Pace-Note: im Stand 160 m vor der Kante (die Kachel SPRUNG erscheint 175 m vorher)
    A.setzeAuf(2930); A.kameraSofort(); A.paceNotes.zuruecksetzen();
    let pn = null;
    for (let k = 0; k < 120 && !pn; k++) {
      window.__bild(1, 1000 / 60);
      const an = A.paceNotes.anzeige;
      for (let i = 0; i < an.anzahl; i++) if (A.paceNotes.kacheln[an.kacheln[i].nr].symbol === 'sprung' && an.kacheln[i].alpha >= 1) pn = window.__foto();
    }
    // Sprung: auf der Geraden 70 m vor der Kante, 115 km/h, Vollgas
    A.setzeAuf(3020); A.kameraSofort();
    P.vx = Math.sin(P.richtung) * 115 / 3.6; P.vz = Math.cos(P.richtung) * 115 / 3.6; A.testEingabe = { gas: 1 };
    let ab = -1, land = -1, best = 0;
    for (let k = 0; k < 900; k++) {
      window.__bild(1, 1000 / 60);
      if (F.inLuft && ab < 0) ab = k;
      if (ab >= 0 && k === ab + 8) out.abheben = window.__foto();
      if (F.inLuft && F.ueberBoden > best) { best = F.ueberBoden; out.gipfel = window.__foto(); out.gipfelH = best; }
      if (ab >= 0 && !F.inLuft && land < 0) land = k;
      if (land >= 0 && k === land + 3) { out.landung = window.__foto(); break; }
    }
    A.testEingabe = null; out.pn = pn;
    return out;
  });
  // Fotos im 320x180-Raster: Ausschnitt um das Auto (ohne Tachos), doppelt gross (scharfe Pixel)
  const phase = (url) => ({ url, x: 60, y: 8, b: 200, h: 130 });
  speichere('01-sprung-phasen.png', await s.page.evaluate(ZUSAMMEN, { teile: [phase(r.abheben), phase(r.gipfel), phase(r.landung)], mal: 2, luecke: 6 }));
  speichere('02-schatten-luft.png', await s.page.evaluate(ZUSAMMEN, { teile: [{ url: r.gipfel, x: 100, y: 40, b: 120, h: 100 }], mal: 3, luecke: 0 }));
  console.log(`   (Gipfel: Auto ${r.gipfelH.toFixed(2)} m über dem Boden)`);
  if (r.pn) speichere('03-pacenote-sprung.png', await s.page.evaluate(ZUSAMMEN, { teile: [{ url: r.pn, x: 100, y: 0, b: 120, h: 34 }], mal: 3, luecke: 0 }));
  else console.log('03: Pace-Note SPRUNG nicht gesehen');
  await s.schliessen();
}

// --- 4: Zielbildschirm nach einer Fahrt mit dem Testfahrer (mittel), 5: EINSTELLUNGEN ---
{
  const s = await seite('?menue=aus&ton=aus&strecke=finnland&auto=rt4', { 'alpineRally.sprungRekorde': JSON.stringify({ finnland: { weite: 44.5, auto: 'rt4', datum: '2026-11-01T10:00:00.000Z' } }) });
  const code = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const bild = await s.page.evaluate(async (code) => {
    const f = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
    const A = window.__alpineRally;
    f.fahreEtappe(A, 'mittel');
    window.__bild(400, 1000 / 60); // Zielbildschirm erscheint nach 3 s
    const ziel = window.__foto();
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const x = c.getContext('2d'); A.menue.zeige(A.seiten.einstellungen, true); x.clearRect(0, 0, 320, 180); A.menue.zeichne(x, 0, 1);
    return { ziel, einst: c.toDataURL(), zustand: A.ablauf.zustand };
  }, code);
  speichere('04-ziel-spruenge.png', bild.ziel);
  speichere('05-einstellungen.png', await s.page.evaluate(ZUSAMMEN, { teile: [{ url: bild.einst, x: 0, y: 0, b: 320, h: 180 }], mal: 2, luecke: 0 }));
  await s.schliessen();
}

// --- 6: Höhenprofil (strecke-karte.mjs schreibt nach /tmp/strecke-karte/) ---
{
  const r = spawnSync(process.execPath, [path.join(WURZEL, 'tools/strecke-karte.mjs'), '--strecke', 'finnland', '--aus', '/tmp/m10c-karte'], { encoding: 'utf8', cwd: WURZEL });
  const quelle = '/tmp/m10c-karte/finnland-profil.png';
  if (r.status === 0 && fs.existsSync(quelle)) { fs.copyFileSync(quelle, path.join(AUS, '06-profil-finnland.png')); console.log('screenshots/m10c/06-profil-finnland.png'); }
  else console.log(`06: strecke-karte fehlgeschlagen: ${(r.stdout || '') + (r.stderr || '')}`.slice(0, 400));
}
