// Bilder für Meilenstein 8b:  node tools/m8b-bilder.mjs [--alt <ordner der Version 0.8a>] [--nur vergleich,labor,menue,fahrlabor]
// Schreibt screenshots/m8b/:
//  - vergleich: Spielbild an der Startlinie (Heck = Spielkamera, Drei-Viertel, Seite, Front), je 1280x720 und
//    Originalgrösse 320x180; "vorher" (0.8a, nur mit --alt) und "nachher"
//  - labor: Auto-Labor in Originalgrösse 320x180, 480x270, 640x360: Heck, Seite, Front, Drei-Viertel (vorher/nachher),
//    alle drei Lackierungen von hinten (Heck wie im Spiel und nah), Helme nah (Seite und Front, alle Lackierungen)
//  - menue: Menüseite AUTO (de und en) in 320x180 und 1280x720
//  - fahrlabor: Fahr-Labor mit den neuen Reglern; Auto-Labor-Seite (bei labor); Ton-Labor mit ECHTER LADEDRUCK AN
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : ['vergleich', 'labor', 'menue', 'fahrlabor'];
const ORDNER = path.join(WURZEL, 'screenshots/m8b');
fs.mkdirSync(ORDNER, { recursive: true });
const GROESSEN = ['320x180', '480x270', '640x360'];

// ------------------------------------------------------------------------------------------------ Spielbilder
async function vergleich(wurzel, praefix) {
  const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720, auto: 'rt4' });
  const p = spiel.page;
  await p.goto(`${spiel.url}/index.html?menue=aus`);
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const bilder = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  const ruhe = async (ms = 400) => { await p.waitForTimeout(ms); await bilder(3); };
  const kamera = (k) => p.evaluate((k) => {
    const A = window.__alpineRally;
    if (!k) { A.testKamera = null; return; }
    const ph = A.physik, s = Math.sin(ph.richtung), c = Math.cos(ph.richtung), y = A.autoModell.objekt.position.y;
    const w = (x, yy, z) => [ph.x + x * c + z * s, y + yy, ph.z - x * s + z * c];
    A.testKamera = { pos: w(k[0], k[1], k[2]), ziel: w(k[3], k[4], k[5]) };
  }, k);
  await p.evaluate(() => { const A = window.__alpineRally; A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(70); A.kameraSofort(); const h = document.getElementById('hud'); if (h) h.style.visibility = 'hidden'; });
  const ANSICHTEN = { heck: null, dreiviertel: [-4.6, 2.2, -5.4, 0, 0.7, 0], seite: [6.2, 1.5, 0, 0, 0.7, 0], front: [0.6, 1.3, 6.4, 0, 0.8, 0] };
  for (const [n, k] of Object.entries(ANSICHTEN)) {
    for (const [b, h, zusatz] of [[1280, 720, ''], [320, 180, '-320x180']]) {
      await p.setViewportSize({ width: b, height: h });
      await kamera(k); await ruhe();
      await p.screenshot({ path: path.join(ORDNER, `${praefix}-${n}${zusatz}.png`) });
    }
    console.log('  ', `${praefix}-${n}`);
  }
  if (spiel.fehler.length) console.log('Fehler im Spiel:', spiel.fehler.slice(0, 3).join(' | '));
  await spiel.schliessen();
}

// ------------------------------------------------------------------------------------------------ Auto-Labor
async function labor(wurzel, praefix, serien) {
  const spiel = await starteSpiel({ wurzel, breite: 1400, hoehe: 900 });
  const p = spiel.page;
  await p.goto(`${spiel.url}/auto-labor.html`);
  await p.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  if (serien.seite) await p.screenshot({ path: path.join(ORDNER, '50-auto-labor-seite.png') });
  async function raster(name, liste, aufl) {
    const d = await p.evaluate(async ([liste, aufl]) => {
      const L = window.__autoLabor;
      L.aufloesung(aufl);
      const imgs = [];
      for (const b of liste) {
        Object.assign(L.zustand, { lenkung: 0, tempo: 0, nicken: 0, rollen: 0, hub: 0, dreck: 0, dreckBelag: 'wiesenweg', bremslicht: false, rueckfahrlicht: false, staub: false, hell: true, federTest: 0 }, b.zustand || {});
        L.auto.lackierung(b.lack || 'werk');
        L.ansicht(b.ansicht);
        if (b.abstand) L.orbit.abstand *= b.abstand;
        for (let i = 0; i < 4; i++) L.zeichne(1 / 60);
        const img = new Image(); img.src = L.bildDaten(); await img.decode(); imgs.push(img);
      }
      const w = imgs[0].width, h = imgs[0].height, sp = Math.min(3, imgs.length);
      const c = document.createElement('canvas'); c.width = w * sp; c.height = h * Math.ceil(imgs.length / sp);
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      imgs.forEach((im, i) => x.drawImage(im, (i % sp) * w, Math.floor(i / sp) * h));
      L.auto.lackierung('werk');
      return c.toDataURL();
    }, [liste, aufl]);
    const datei = `${praefix}-${name}-${GROESSEN[aufl]}.png`;
    fs.writeFileSync(path.join(ORDNER, datei), Buffer.from(d.split(',')[1], 'base64'));
    console.log('  ', datei);
  }
  for (const [name, liste] of Object.entries(serien.liste)) for (const aufl of [0, 1, 2]) await raster(name, liste, aufl);
  if (spiel.fehler.length) console.log('Fehler im Auto-Labor:', spiel.fehler.slice(0, 3).join(' | '));
  await spiel.schliessen();
}
const LACKE = ['werk', 'gletscher', 'dunkel'];
const VIER = { ansichten: ['heck', 'seite', 'front', 'hinten34', 'vorne34', 'oben'].map((a) => ({ ansicht: a })) };
const NEU = {
  ...VIER,
  'heck-lackierungen': [...LACKE.map((l) => ({ ansicht: 'heck', lack: l })), ...LACKE.map((l) => ({ ansicht: 'heck', lack: l, abstand: 0.45 }))],
  'helme-nah': [...LACKE.map((l) => ({ ansicht: 'seite', lack: l, abstand: 0.4 })), ...LACKE.map((l) => ({ ansicht: 'front', lack: l, abstand: 0.4 }))],
};

// ------------------------------------------------------------------------------------------------ Menü AUTO
async function menue() {
  for (const sprache of ['de', 'en']) {
    for (const [b, h] of [[320, 180], [1280, 720]]) {
      const spiel = await starteSpiel({ breite: b, hoehe: h, auto: '' });
      const p = spiel.page;
      await p.goto(`${spiel.url}/index.html`);
      await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
      await p.evaluate((s) => { localStorage.setItem(window.__alpineRally.CONFIG.menue.speicherName, JSON.stringify({ sprache: s })); }, sprache);
      await p.reload();
      await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
      await p.evaluate(() => { const A = window.__alpineRally; A.zumHauptmenue(); A.menue.zeige(A.seiten.auto, true); });
      await p.waitForTimeout(1200);
      await p.screenshot({ path: path.join(ORDNER, `60-menue-auto-${sprache}-${b}x${h}.png`) });
      console.log('  ', `60-menue-auto-${sprache}-${b}x${h}`);
      await spiel.schliessen();
    }
  }
}

// ------------------------------------------------------------------------------------------------ Fahr-Labor
async function fahrlabor() {
  const spiel = await starteSpiel({ breite: 1280, hoehe: 900 });
  const p = spiel.page;
  await p.goto(`${spiel.url}/index.html?menue=aus&auto=rt4&fahrlabor=1`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.fahrlabor, null, { timeout: 120000 });
  await p.evaluate(() => {
    const A = window.__alpineRally;
    A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(900); A.kameraSofort();
    const r = [...A.fahrlabor.panel.querySelectorAll('.regler')].find((z) => z.querySelector('.name').textContent === 'auto.vorneJeBelag.schotter');
    if (r) { const e = r.querySelector('input'); e.value = 1.1; e.dispatchEvent(new Event('input')); }
    A.fahrlabor.panel.querySelector('#fahrlaborKopieren').click();
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(ORDNER, '70-fahrlabor.png') });
  console.log('   70-fahrlabor');
  await spiel.schliessen();
}

// ------------------------------------------------------------------------------------------------ Ton-Labor
async function tonlabor() {
  const spiel = await starteSpiel({ breite: 1400, hoehe: 1000, args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = spiel.page;
  await p.goto(`${spiel.url}/ton-labor.html`);
  await p.waitForFunction(() => window.__tonLabor, null, { timeout: 60000 });
  await p.click('#tonStarten');
  await p.waitForFunction(() => window.__tonLabor.ton.werk && window.__tonLabor.ton.werk.aufbau.fertig, null, { timeout: 30000 });
  await p.evaluate(() => {
    const $ = (id) => document.getElementById(id);
    const setze = (id, v) => { $(id).value = v; $(id).dispatchEvent(new Event('input')); };
    setze('drehzahl', 5200); setze('gas', 1); setze('tempo', 110);
    $('echterLadedruck').checked = true; $('echterLadedruck').dispatchEvent(new Event('change'));
    setze('ladedruck', 0.85);
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(ORDNER, '71-ton-labor.png') });
  console.log('   71-ton-labor');
  await spiel.schliessen();
}

const alt = arg('--alt') ? path.resolve(arg('--alt')) : null;
if (NUR.includes('vergleich')) {
  if (alt) await vergleich(alt, '01-vorher');
  await vergleich(WURZEL, '02-nachher');
}
if (NUR.includes('labor')) {
  if (alt) await labor(alt, '10-vorher', { liste: VIER });
  await labor(WURZEL, '11-nachher', { liste: NEU, seite: true });
}
if (NUR.includes('menue')) await menue();
if (NUR.includes('fahrlabor')) { await fahrlabor(); await tonlabor(); }
