// Meilenstein 10c.1 prüfen:  node tools/m10c1-test.mjs --alt <ordner 0.10c> [--nur a,b,...] [--lang]
// (0.10c: git worktree add <ordner> 612cc62). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein Gamepad.
// Vorlage: tools/m10c-test.mjs. Referenz für Bilder und Zeiten: 0.10c bei fest eingestellten 320x180 (seit Teil E fügt
// tools/spiel-browser.mjs jeder Spiel-Adresse ?aufloesung=320x180 an, ausser bei --aufloesung <wert>).
//   Teil A – Sprungkamera: (a) Kamera-Metriken je Sprung (alt/neu, Zielbereiche), (b) nach dem Sprung exakt wie vorher,
//       (c) ganze Bildpunkte, (d) SPRUNGKAMERA AUS, (e) Flugweiten bei 100 km/h, (f) Bildzeit Finnland
//   Teil B – Wand: (g) Testfahrer-Tabelle mit Stil "wand", (h) Strafe nach Winkel, (i) Gier je Kontakt, (j) Dauerkontakt,
//       (k) kein Steckenbleiben, (l) ohne Wandkontakt bit-gleich, (m) Abkürzungen, (n) Ton
//   Teil C – Seekehre: (o) Leitplanke nur dort weg, (p) Ufer-Querschnitte, (q) Hang-Check, (r) Verlauf/Länge/CPs/Pace-Notes,
//       (s) Teleport, (t) Deko-Lücken, (u) Abkürzungen Finnland
//   Teil D – Vorschaukarte: (v) Kantenlänge, (w) Menü ETAPPE in 3 Auflösungen ohne Überlappung, (x) Menü-Test
//   Teil E – Auflösung: (y) Standard AUTO, (z) Runterschalten, (aa) Merken, (ab) Migration, (ac) Bilder 320x180,
//       (ad) HUD in 3 Auflösungen, (ae) Physik/Ton unabhängig von der Auflösung
//   Unveränderlich: (x1) Alpen Länge/Abkürzungen, (x2) Alpen-Testfahrer, (x3) Pace-Notes/Strecke, (x4) Alpen-Bilder, (x5) Ton
//   (zz) nur mit --lang: frühere Tests

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k) || (/^x\d$/.test(k) && NUR.includes('x1-5'));
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m10c1';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M10C1_AUTOS ? process.env.M10C1_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const BASIS = '612cc62'; // 0.10c
if (!ALT) info(`Vergleiche gegen 0.10c nur mit --alt <ordner> (git worktree add <ordner> ${BASIS})`);
const med = (l) => { const a = [...l].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };

// Spiel öffnen (wie tools/m10c-test.mjs). uhr: eigene Bild-Uhr; speicher: localStorage; finnland: Streckendatei unterschieben
async function oeffne(wurzel, adresse = '', { uhr = false, speicher = null, auto, finnland = null, breite = 640, hoehe = 360, geraet } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, ...(auto ? { auto } : {}), ...(geraet ? { geraet } : {}) });
  s.fehler = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  if (finnland) await s.page.route('**/strecken/finnland.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: finnland }));
  if (uhr) await s.page.addInitScript(() => {
    let jetzt = 0; const warte = [];
    performance.now = () => jetzt;
    window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
    window.cancelAnimationFrame = () => {};
    window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
    window.__foto = () => {
      window.__bild(1, 1000 / 60);
      const a = document.getElementById('spiel'), h = document.getElementById('hud');
      const c = document.createElement('canvas'); c.width = h.width; c.height = h.height;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      x.drawImage(a, 0, 0, h.width, h.height); x.drawImage(h, 0, 0);
      return c.toDataURL();
    };
  });
  await s.page.goto(`${s.url}/index.html${adresse}`);
  return s;
}
const bereit = (s) => s.page.waitForFunction(() => window.__alpineRally || window.__fehlerseite, null, { timeout: 120000, polling: 100 });
const bilder = (s, n) => s.page.evaluate((n) => window.__bild(n, 1000 / 60), n);

// ===================================================================== Teil A: Sprungkamera
// Echte Spielschleife (eigene Bild-Uhr): Auto 60 m vor die Kante, 110 km/h, Gas; je Bild Kamera und Auto mitschreiben.
// Metriken je Sprung: Zoom-Out (waagrechter Abstand Kamera–Auto gegen vorher), Kamera über dem Auto (m), Neigung gegen
// die normale Kamera (Grad: Blick von der Kamera auf den Blickpunkt gegen den Blick der normalen Kamera ohne Sprung),
// Ruck (Anteil der Bildhöhe), Zeit bis Normalzustand (ab Landung, bis Zurückziehen und Ruck 0 sind), Nachlaufen (Verzug der
// Kamerahöhe gegen ihr Ziel, Bilder), Überschwingen (Kamera nach der Landung tiefer als normal).
const KAMERA_FILM = ({ kmh = 110, kante, cp, bilder = 260 }) => {
  const A = window.__alpineRally, P = A.physik, F = A.flug, K = A.kamera, c = A.CONFIG.kamera, out = [];
  A.anhalten = false; A.rennen.naechsterCp = cp;
  A.setzeAuf(kante - 60); A.kameraSofort();
  P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
  A.testEingabe = { gas: 1 };
  const rh = A.renderer ? A.renderer.domElement.height : document.getElementById('spiel').height;
  for (let k = 0; k < bilder; k++) {
    window.__bild(1, 1000 / 60);
    const y = A.autoModell.objekt.position.y, yaw = A.kam.yaw;
    const bx = P.x + Math.sin(yaw) * c.blickVoraus, bz = P.z + Math.cos(yaw) * c.blickVoraus, by = y + c.blickHoehe;
    const neig = Math.atan2(K.position.y - by, Math.hypot(K.position.x - bx, K.position.z - bz)) * 180 / Math.PI;
    out.push({ k, inLuft: F.inLuft, e: A.sk.e, ruck: A.sk.ruckPx, view: K.view && K.view.enabled ? Math.abs(K.view.offsetY) : 0, anheb: A.kam.ziel.y - y - c.hoehe, fov: K.fov, zoom: K.zoom, rh,
      y, kamY: K.position.y, zielY: A.kam.ziel.y, abstand: Math.hypot(K.position.x - P.x, K.position.z - P.z), neig });
  }
  A.testEingabe = null;
  return out;
};
const KAMERA_NORMAL = { abstand: 6.9, hoehe: 2.5, blickHoehe: 1.2, blickVoraus: 4 };
const neigNormal = Math.atan2(KAMERA_NORMAL.hoehe - KAMERA_NORMAL.blickHoehe, KAMERA_NORMAL.abstand + KAMERA_NORMAL.blickVoraus) * 180 / Math.PI;
function kameraMetriken(f) {
  const ab = f.findIndex((x) => x.inLuft), land = f.findIndex((x, i) => i > ab && !x.inLuft);
  if (ab < 0 || land < 0) return null;
  const vor = f[Math.max(0, ab - 5)], fenster = f.slice(ab, Math.min(f.length, land + 40));
  const zoom = Math.max(...fenster.map((x) => x.abstand)) / vor.abstand - 1;
  const ueber = Math.max(...fenster.map((x) => x.kamY - x.y));
  const anheb = Math.max(...fenster.map((x) => x.anheb)); // Anhebung des Kamera-Ziels über die normale Höhe (ohne Nachlaufen)
  const neig = Math.max(...fenster.map((x) => Math.abs(x.neig - neigNormal)));
  const neigVor = Math.abs(vor.neig - neigNormal);
  const ruck = Math.max(...f.slice(land, land + 20).map((x) => x.view)) / f[0].rh;
  let normal = f.findIndex((x, i) => i >= land && x.e === 0 && x.ruck === 0 && x.view === 0);
  const zeitNormal = normal < 0 ? Infinity : (normal - land) / 60;
  // Nachlaufen: um wie viele Bilder hinkt die Kamerahöhe ihrem Ziel hinterher (bester Verzug im Flug)
  let best = 0, bestF = Infinity;
  for (let d = 0; d <= 30; d++) {
    let q = 0;
    for (let i = ab + d; i < land + 10 && i < f.length; i++) q += (f[i].kamY - f[i - d].zielY) ** 2;
    if (q < bestF) { bestF = q; best = d; }
  }
  // Überschwingen: nach dem Normalzustand tiefer als die normale Höhe über dem Auto
  const unter = Math.max(0, ...f.slice(land, Math.min(f.length, land + 60)).map((x) => KAMERA_NORMAL.hoehe - (x.kamY - x.y)));
  const nach = f[Math.min(f.length - 1, land + 60)];
  return { ab, land, flug: (land - ab) / 60, zoom, ueber, anheb, ueberMehr: ueber - (vor.kamY - vor.y), neig, neigVor, ruck, ruckPx: Math.max(...f.slice(land, land + 20).map((x) => x.view)), zeitNormal,
    nachlauf: best / 60, unter, nach, ganz: f.every((x) => Number.isInteger(x.view) && Number.isInteger(x.ruck) && x.fov === f[0].fov && x.zoom === 1) };
}
const SPRUENGE = [{ name: 'KIEFERNKUPPE', kante: 495, cp: 0 }, { name: 'BIRKENKUPPE', kante: 1830, cp: 2 }, { name: 'HOCHWALDKUPPE', kante: 3090, cp: 3 }, { name: 'SEEKUPPE', kante: 3656, cp: 4 }];
async function kameraMessung(wurzel, speicher = null, extra = '') {
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=finnland${extra}`, { uhr: true, ...(speicher ? { speicher } : {}) });
  await bereit(s);
  await bilder(s, 320);
  const r = [];
  for (const j of SPRUENGE) r.push({ ...j, film: await s.page.evaluate(KAMERA_FILM, { kante: j.kante, cp: j.cp }) });
  const fehlerS = s.fehler.slice();
  await s.schliessen();
  return { r, fehler: fehlerS };
}
const pz = (x) => `${(x * 100).toFixed(1)} %`;
if (teil('a') || teil('b') || teil('c')) {
  console.log('(a) Sprungkamera-Metriken je Sprung (110 km/h, 60 m vor der Kante, Gas) – alt 0.10c / neu');
  const neu = await kameraMessung(WURZEL);
  const alt = ALT ? await kameraMessung(ALT) : null;
  const tab = ['| Sprung | Zoom-Out alt / neu | Anhebung (m) alt / neu | Kamera über dem Auto (m) alt / neu | Neigung gegen normal alt / neu | Ruck (Bildhöhe) alt / neu | Normal nach (s) alt / neu | Nachlaufen (s) alt / neu |', '|---|---|---|---|---|---|---|---|'];
  const mNeu = [];
  for (let i = 0; i < SPRUENGE.length; i++) {
    const m = kameraMetriken(neu.r[i].film), a = alt ? kameraMetriken(alt.r[i].film) : null;
    mNeu.push(m);
    const z = (f, x) => (a ? `${f(a[x])} / ` : '') + f(m[x]);
    tab.push(`| ${SPRUENGE[i].name} | ${z(pz, 'zoom')} | ${z((v) => v.toFixed(2), 'anheb')} | ${z((v) => v.toFixed(2), 'ueber')} | ${z((v) => `${v.toFixed(1)}°`, 'neig')} | ${z(pz, 'ruck')} | ${z((v) => v.toFixed(2), 'zeitNormal')} | ${z((v) => v.toFixed(3), 'nachlauf')} |`);
    if (teil('a')) melde(m && m.zoom <= 0.055 && m.anheb <= 0.245 && (!a || m.ueberMehr <= 0.4 * a.ueberMehr) && m.neig <= 3 && m.ruck <= 0.0065 && m.ruckPx >= 1 && m.zeitNormal <= 0.3 && m.nachlauf <= 0.1 && m.unter < 0.05,
      `${SPRUENGE[i].name}: Flug ${m.flug.toFixed(2)} s, Zoom-Out ${pz(m.zoom)} (≤ 5 %), Anhebung ${m.anheb.toFixed(2)} m (≤ 0.24 = 40 % von 0.6), Kamera über dem Auto bis ${m.ueber.toFixed(2)} m (+${m.ueberMehr.toFixed(2)} m mit Nachlaufen${a ? `, 0.10c +${a.ueberMehr.toFixed(2)} m` : ''}), Neigung gegen normal bis ${m.neig.toFixed(1)}° (≤ 3°, vor dem Sprung ${m.neigVor.toFixed(1)}°), Ruck ${m.ruckPx} Bildpunkte = ${pz(m.ruck)} der Bildhöhe (≤ 0.5 %), normal nach ${m.zeitNormal.toFixed(2)} s (≈ 0.25), Nachlaufen ${m.nachlauf.toFixed(3)} s (≤ 0.1), Überschwingen ${m.unter.toFixed(3)} m`);
  }
  fs.writeFileSync(path.join(LOG, 'kamera-tabelle.md'), `${tab.join('\n')}\n`);
  for (const z of tab) info(z);
  if (teil('b')) {
    console.log('(b) Kamera-Zustand 1 s nach der Landung genau wie ohne Sprung');
    for (let i = 0; i < SPRUENGE.length; i++) {
      const n = mNeu[i].nach;
      melde(n.e === 0 && n.ruck === 0 && n.view === 0 && Math.abs(n.zielY - (n.y + KAMERA_NORMAL.hoehe)) < 1e-9, `${SPRUENGE[i].name}: e ${n.e}, Ruck ${n.ruck}, Versatz ${n.view}, Kamera-Ziel = Autohöhe + ${KAMERA_NORMAL.hoehe} m`);
    }
  }
  if (teil('c')) {
    console.log('(c) alle Kamerabilder ganzzahlig im Pixelraster (Versatz ganze Bildpunkte, Blickwinkel fest, Zoom 1)');
    melde(mNeu.every((m) => m.ganz), `${neu.r.reduce((n, j) => n + j.film.length, 0)} Bilder: ganzzahlig ${mNeu.map((m) => m.ganz).join(' / ')}`);
  }
  melde(neu.fehler.length === 0, `Konsole ohne Fehler (${neu.fehler.length})`);
}
if (teil('d')) {
  console.log('(d) SPRUNGKAMERA AUS: Kamera bewegt sich bei Sprüngen nicht (wie bisher)');
  const { r, fehler: fe } = await kameraMessung(WURZEL, { 'alpineRally.einstellungen': JSON.stringify({ sprungkamera: false }) });
  for (const j of r) {
    const ab = j.film.findIndex((x) => x.inLuft);
    const normal = j.film.every((x) => x.e === 0 && x.ruck === 0 && x.view === 0 && Math.abs(x.zielY - (x.y + KAMERA_NORMAL.hoehe)) < 1e-9);
    melde(ab > 0 && normal, `${j.name}: gesprungen (Bild ${ab}), in allen ${j.film.length} Bildern kein Zurückziehen, kein Ruck, Kamera-Ziel = Autohöhe + 2.5 m`);
  }
  melde(fe.length === 0, `Konsole ohne Fehler (${fe.length})`);
}
// Flugweiten bei festem Absprungtempo (wie tools/m10c-test.mjs, WEITEN): Auto 6 m vor der Kante auf Tempo gesetzt
const WEITEN = (kmhs) => {
  const A = window.__alpineRally, P = A.physik, F = A.flug; A.anhalten = true; const out = {};
  for (const z of A.strecke.sprungZonen) {
    out[z.name] = [];
    for (const kmh of kmhs) {
      A.setzeAuf(z.kante - 6); P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
      const n0 = F.ereignis.landung, a0 = F.ereignis.abheben;
      for (let t = 0; t < 6 && F.ereignis.landung === n0; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 0.4, bremse: 0, lenkung: 0, handbremse: false }, true);
      const L = F.letzteLandung;
      out[z.name].push(F.ereignis.abheben === a0 ? { kmh, ab: false } : { kmh, ab: true, weite: L.weite, hoehe: L.hoehe, zeit: L.zeit, verlust: L.verlust });
    }
  }
  return out;
};
const WEITEN_010C = { KIEFERNKUPPE: 14.5, BIRKENKUPPE: 23.8, HOCHWALDKUPPE: 38.0, SEEKUPPE: 30.3 };
if (teil('e')) {
  console.log('(e) Flugweiten bei 100 km/h unverändert (±0.5 m gegen 0.10c: 14.5 / 23.8 / 38.0 / 30.3 m)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  const w = await s.page.evaluate(WEITEN, [100]);
  await s.schliessen();
  for (const [name, [r]] of Object.entries(w)) melde(r.ab && Math.abs(r.weite - WEITEN_010C[name]) <= 0.5, `${name}: ${r.weite.toFixed(2)} m (0.10c ${WEITEN_010C[name]} m), Höhe ${r.hoehe.toFixed(2)} m, ${r.zeit.toFixed(2)} s`);
}
// Bildzeit: ein Lauf = 150 echte Bilder ab 70 m vor der Hochwaldkuppe mit 110 km/h (Sprung, Staub, Kamera); Alpen Passhöhe
async function bildzeitLauf(wurzel, strecke, extra = '', speicher = null) {
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=${strecke}${extra}`, speicher ? { speicher } : {});
  await bereit(s);
  await s.page.evaluate(() => new Promise((ok) => setTimeout(ok, 4500)));
  const r = await s.page.evaluate(async (strecke) => {
    const A = window.__alpineRally, P = A.physik;
    A.rennen.naechsterCp = strecke === 'finnland' ? 3 : 2; A.setzeAuf(strecke === 'finnland' ? 3020 : 2560); A.kameraSofort();
    P.vx = Math.sin(P.richtung) * 110 / 3.6; P.vz = Math.cos(P.richtung) * 110 / 3.6; A.testEingabe = { gas: 1 };
    const zeiten = []; let t0 = performance.now(); const l0 = A.flug ? A.flug.ereignis.landung : 0;
    await new Promise((ok) => { const f = () => { const t = performance.now(); zeiten.push(t - t0); t0 = t; if (zeiten.length < 150) requestAnimationFrame(f); else ok(); }; requestAnimationFrame(f); });
    A.testEingabe = null; zeiten.sort((a, b) => a - b);
    return { ms: zeiten[Math.floor(zeiten.length / 2)], gesprungen: A.flug ? A.flug.ereignis.landung - l0 : 0, rh: document.getElementById('spiel').height };
  }, strecke);
  await s.schliessen();
  return r;
}
if (teil('f')) {
  console.log('(f) Bildzeit Finnland mit Sprung (Median aus 5, im selben Lauf gegen die Alpen) gegen 0.10c, je 320x180');
  if (!ALT) info('nur mit --alt');
  else {
    const reihen = { alpenAlt: [], alpenNeu: [], fiAlt: [], fiNeu: [] };
    for (let i = 0; i < 5; i++) {
      reihen.alpenAlt.push(await bildzeitLauf(ALT, 'alpen')); reihen.alpenNeu.push(await bildzeitLauf(WURZEL, 'alpen'));
      reihen.fiAlt.push(await bildzeitLauf(ALT, 'finnland')); reihen.fiNeu.push(await bildzeitLauf(WURZEL, 'finnland'));
    }
    const m = Object.fromEntries(Object.entries(reihen).map(([k, v]) => [k, med(v.map((x) => x.ms))]));
    const rel = (a, b) => (a / b - 1) * 100;
    const bereinigt = rel(m.fiNeu / m.alpenNeu, m.fiAlt / m.alpenAlt);
    fs.writeFileSync(path.join(LOG, 'bildzeit-a.json'), JSON.stringify({ reihen, median: m }, null, 1));
    info(`Median je Bild (ms): Alpen alt ${m.alpenAlt.toFixed(1)} / neu ${m.alpenNeu.toFixed(1)}; Finnland alt ${m.fiAlt.toFixed(1)} / neu ${m.fiNeu.toFixed(1)}; Bildhöhe ${reihen.fiNeu[0].rh}`);
    melde(reihen.fiNeu.every((x) => x.gesprungen >= 1) && (rel(m.fiNeu, m.fiAlt) <= 1 || bereinigt <= 1), `Bildzeit Finnland ${rel(m.fiNeu, m.fiAlt).toFixed(1)} % gegen 0.10c, gegen die Alpen bereinigt ${bereinigt.toFixed(1)} % (Grenze +1 %)`);
  }
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
