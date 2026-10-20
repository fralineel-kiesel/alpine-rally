// Bilder für Meilenstein 8c:  node tools/m8c-bilder.mjs [--nur garage,spiel,fahrt,labor,bestzeiten,tabelle,labore]
// Schreibt screenshots/m8c/ (jeweils 1280x720 und Originalgrösse 320x180, das Auto-Labor in 320x180/480x270/640x360):
//  - garage:     Menüseite AUTO (Garage) mit jedem Auto und jeder Lackierung, dazu einmal englisch
//  - spiel:      Audan, Delto und Escorta im Spiel an der Startlinie: Heck (Spielkamera), Seite, Front, Drei-Viertel
//  - fahrt:      Delto und Escorta in einer Kurve (Seite sichtbar), Escorta im Drift auf Schotter
//  - labor:      Auto-Labor: alle Ansichten und alle Lackierungen von hinten (Heck wie im Spiel und nah)
//  - bestzeiten: gemeinsame Bestzeiten-Liste mit Kurznamen (de, en)
//  - tabelle:    die Messtabelle aus tools/auto-messung.json als Bild (80-messtabelle.png) und Text (80-messtabelle.md)
//  - labore:     Fahr-Labor (vier Profile), Auto-Labor-Seite, Ton-Labor mit Profil Fard Escorta
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : ['garage', 'spiel', 'fahrt', 'labor', 'bestzeiten', 'tabelle', 'labore'];
const ORDNER = path.join(WURZEL, 'screenshots/m8c');
fs.mkdirSync(ORDNER, { recursive: true });
const GROESSEN = ['320x180', '480x270', '640x360'];
const { AUTO_MODELLE } = await import(new URL('../js/autos.js', import.meta.url).href);
const NEUE = ['delto', 'escorta'];
const bilder = (p, n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

// ------------------------------------------------------------------------------------------------ Garage
async function garage() {
  for (const [b, h] of [[320, 180], [1280, 720]]) {
    const spiel = await starteSpiel({ breite: b, hoehe: h, auto: '' });
    const p = spiel.page;
    await p.goto(`${spiel.url}/index.html`);
    await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
    await p.evaluate(() => { const A = window.__alpineRally; A.zumMenue(); A.menue.zeige(A.seiten.auto, true); });
    for (const id of Object.keys(AUTO_MODELLE)) {
      for (const lack of AUTO_MODELLE[id].lackierungen) {
        await p.evaluate(([id, lack]) => {
          const A = window.__alpineRally; // mit dem Zeiger wählen (wie mit der Tastatur), dann die Lackierung
          for (let k = 0; k < 8 && A.menue.seite.eintraege()[A.menue.wahl].autoId !== id; k++) A.menue.taste('ArrowDown', false);
          A.autoWechseln(id, lack);
        }, [id, lack]);
        await p.waitForTimeout(1500); await bilder(p, 3);
        const datei = `10-garage-${id}-${lack}-${b}x${h}.png`;
        await p.screenshot({ path: path.join(ORDNER, datei) });
        console.log('  ', datei);
      }
    }
    // englisch
    await p.evaluate(async () => { const A = window.__alpineRally; const T = await import('/js/texte.js'); T.setzeSprache('en'); A.autoWechseln('escorta', 'kanarie'); A.menue.neuZeichnen(); });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(ORDNER, `11-garage-en-${b}x${h}.png`) });
    if (spiel.fehler.length) console.log('Fehler:', spiel.fehler.slice(0, 3).join(' | '));
    await spiel.schliessen();
  }
}

// ------------------------------------------------------------------------------------------------ Spielbilder
async function oeffneSpiel(auto, b = 1280, h = 720) {
  const spiel = await starteSpiel({ breite: b, hoehe: h, auto });
  const p = spiel.page;
  await p.goto(`${spiel.url}/index.html?menue=aus`);
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  return spiel;
}
const kamera = (p, k) => p.evaluate((k) => {
  const A = window.__alpineRally;
  if (!k) { A.testKamera = null; return; }
  const ph = A.physik, s = Math.sin(ph.richtung), c = Math.cos(ph.richtung), y = A.autoModell.objekt.position.y;
  const w = (x, yy, z) => [ph.x + x * c + z * s, y + yy, ph.z - x * s + z * c];
  A.testKamera = { pos: w(k[0], k[1], k[2]), ziel: w(k[3], k[4], k[5]) };
}, k);
async function spielbilder() {
  for (const id of ['rt4', ...NEUE]) {
    const spiel = await oeffneSpiel(id);
    const p = spiel.page;
    await p.evaluate(() => { const A = window.__alpineRally; A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(70); A.kameraSofort(); document.getElementById('hud').style.visibility = 'hidden'; });
    const ANSICHTEN = { heck: null, dreiviertel: [-4.6, 2.2, -5.4, 0, 0.7, 0], seite: [6.2, 1.5, 0, 0, 0.7, 0], front: [0.6, 1.3, 6.4, 0, 0.8, 0] };
    for (const [n, k] of Object.entries(ANSICHTEN)) {
      for (const [b, h, zusatz] of [[1280, 720, ''], [320, 180, '-320x180']]) {
        await p.setViewportSize({ width: b, height: h });
        await kamera(p, k); await p.waitForTimeout(400); await bilder(p, 3);
        await p.screenshot({ path: path.join(ORDNER, `20-${id}-${n}${zusatz}.png`) });
      }
      console.log('  ', `20-${id}-${n}`);
    }
    await spiel.schliessen();
  }
}

// ------------------------------------------------------------------------------------------------ Kurve und Drift
async function fahrt() {
  for (const id of NEUE) {
    const spiel = await oeffneSpiel(id);
    const p = spiel.page;
    // Kurve: vor Kehre 1 (1353 m) mit 45 km/h hinein, Lenkung voll links, Kamera folgt wie im Spiel
    const auf = async (s, v, eingabe, sek, datei) => {
      await p.evaluate(async ([s, v, e, sek]) => {
        const A = window.__alpineRally;
        A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(s); A.kameraSofort();
        document.getElementById('hud').style.visibility = 'hidden';
        A.physik.vx = Math.sin(A.physik.richtung) * v; A.physik.vz = Math.cos(A.physik.richtung) * v; A.physik.vVor = v;
        A.getriebe.gang = 2; A.getriebe.zielGang = 2;
        A.testEingabe = e;
        for (let t = 0; t < sek; t += 1 / 30) {
          for (let k = 0; k < 4; k++) A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false, ...e });
          A.autoZeichnen(1 / 30, A.physik.tempo / 30);
          await new Promise((r) => requestAnimationFrame(r));
        }
        A.testEingabe = null;
      }, [s, v, eingabe, sek]);
      for (const [b, h, zusatz] of [[1280, 720, ''], [320, 180, '-320x180']]) {
        await p.setViewportSize({ width: b, height: h });
        await p.waitForTimeout(150);
        await p.screenshot({ path: path.join(ORDNER, `${datei}${zusatz}.png`) });
      }
      const d = await p.evaluate(() => window.__alpineRally.physik.driftWinkel);
      console.log('  ', datei, `Driftwinkel ${d.toFixed(1)}°`);
    };
    await auf(1336, 12, { gas: 0.3, lenkung: -1 }, 0.9, `30-${id}-kurve`);
    if (id === 'escorta') await auf(852, 17, { gas: 0.4, lenkung: 1, handbremse: true }, 0.55, '31-escorta-drift-schotter');
    if (id === 'escorta') await auf(852, 15, { gas: 1, lenkung: 0.8 }, 1.2, '32-escorta-drift-gas-schotter');
    await spiel.schliessen();
  }
}

// ------------------------------------------------------------------------------------------------ Auto-Labor
async function labor() {
  const spiel = await starteSpiel({ breite: 1400, hoehe: 900 });
  const p = spiel.page;
  await p.goto(`${spiel.url}/auto-labor.html`);
  await p.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  async function raster(id, name, liste, aufl) {
    const d = await p.evaluate(async ([id, liste, aufl]) => {
      const L = window.__autoLabor;
      L.aufloesung(aufl); L.modellWaehlen(id);
      const imgs = [];
      for (const b of liste) {
        Object.assign(L.zustand, { lenkung: 0, tempo: 0, nicken: 0, rollen: 0, hub: 0, dreck: 0, bremslicht: false, rueckfahrlicht: false, staub: false, hell: true, federTest: 0 });
        L.auto.lackierung(b.lack || L.auto.modell.lackierungen[0]);
        L.ansicht(b.ansicht);
        if (b.abstand) L.orbit.abstand *= b.abstand;
        for (let i = 0; i < 4; i++) L.zeichne(1 / 60);
        const img = new Image(); img.src = L.bildDaten(); await img.decode(); imgs.push(img);
      }
      const w = imgs[0].width, h = imgs[0].height, sp = Math.min(3, imgs.length);
      const c = document.createElement('canvas'); c.width = w * sp; c.height = h * Math.ceil(imgs.length / sp);
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      imgs.forEach((im, i) => x.drawImage(im, (i % sp) * w, Math.floor(i / sp) * h));
      return c.toDataURL();
    }, [id, liste, aufl]);
    const datei = `40-labor-${id}-${name}-${GROESSEN[aufl]}.png`;
    fs.writeFileSync(path.join(ORDNER, datei), Buffer.from(d.split(',')[1], 'base64'));
    console.log('  ', datei);
  }
  for (const id of NEUE) {
    const lacke = AUTO_MODELLE[id].lackierungen;
    for (const aufl of [0, 1, 2]) {
      await raster(id, 'ansichten', ['heck', 'seite', 'front', 'hinten34', 'vorne34', 'oben'].map((a) => ({ ansicht: a })), aufl);
      await raster(id, 'heck-lackierungen', [...lacke.map((l) => ({ ansicht: 'heck', lack: l })), ...lacke.map((l) => ({ ansicht: 'heck', lack: l, abstand: 0.45 }))], aufl);
      await raster(id, 'lackierungen-dreiviertel', [...lacke.map((l) => ({ ansicht: 'hinten34', lack: l, abstand: 0.6 })), ...lacke.map((l) => ({ ansicht: 'vorne34', lack: l, abstand: 0.6 }))], aufl);
    }
  }
  // alle drei Autos nebeneinander von hinten (wie im Spiel) und drei Viertel
  for (const aufl of [0, 2]) {
    const d = await p.evaluate(async (aufl) => {
      const L = window.__autoLabor, imgs = [];
      L.aufloesung(aufl);
      for (const [id, ansicht] of [['rt4', 'heck'], ['delto', 'heck'], ['escorta', 'heck'], ['rt4', 'hinten34'], ['delto', 'hinten34'], ['escorta', 'hinten34']]) {
        L.modellWaehlen(id); L.auto.lackierung(L.auto.modell.lackierungen[0]); L.ansicht(ansicht); L.orbit.abstand *= 0.7;
        for (let i = 0; i < 4; i++) L.zeichne(1 / 60);
        const img = new Image(); img.src = L.bildDaten(); await img.decode(); imgs.push(img);
      }
      const w = imgs[0].width, h = imgs[0].height;
      const c = document.createElement('canvas'); c.width = w * 3; c.height = h * 2;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      imgs.forEach((im, i) => x.drawImage(im, (i % 3) * w, Math.floor(i / 3) * h));
      return c.toDataURL();
    }, aufl);
    fs.writeFileSync(path.join(ORDNER, `41-alle-drei-${GROESSEN[aufl]}.png`), Buffer.from(d.split(',')[1], 'base64'));
    console.log('  ', `41-alle-drei-${GROESSEN[aufl]}`);
  }
  if (spiel.fehler.length) console.log('Fehler im Auto-Labor:', spiel.fehler.slice(0, 3).join(' | '));
  await spiel.schliessen();
}

// ------------------------------------------------------------------------------------------------ Bestzeiten
async function bestzeiten() {
  const liste = [
    { zeit: 161.6, cps: [31, 90, 132], datum: '2026-10-20T10:00:00.000Z', auto: 'delto' },
    { zeit: 164.01, cps: [31.5, 91.2, 133.9], datum: '2026-10-20T10:10:00.000Z', auto: 'escorta' },
    { zeit: 166.42, cps: [31.6, 91.9, 135.1], datum: '2026-10-19T10:00:00.000Z', auto: 'rt4' },
    { zeit: 170.11, cps: [32, 93, 138], datum: '2026-09-01T10:00:00.000Z' },
    { zeit: 172.33, cps: [32, 94, 139], datum: '2026-09-03T10:00:00.000Z', auto: 'prototyp' },
  ];
  for (const sprache of ['de', 'en']) {
    for (const [b, h] of [[320, 180], [1280, 720]]) {
      const spiel = await starteSpiel({ breite: b, hoehe: h, auto: '' });
      const p = spiel.page;
      await p.goto(`${spiel.url}/index.html`);
      await p.evaluate(([l, s]) => { localStorage.setItem('alpineRally.bestzeiten', JSON.stringify({ passstrasse: l })); localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache: s })); }, [liste, sprache]);
      await p.reload();
      await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
      await p.evaluate(() => { const A = window.__alpineRally; A.zumHauptmenue(); A.menue.zeige(A.seiten.bestzeiten, true); });
      await p.waitForTimeout(1200);
      await p.screenshot({ path: path.join(ORDNER, `70-bestzeiten-${sprache}-${b}x${h}.png`) });
      console.log('  ', `70-bestzeiten-${sprache}-${b}x${h}`);
      await spiel.schliessen();
    }
  }
}

// ------------------------------------------------------------------------------------------------ Messtabelle
async function tabelle() {
  const r = spawnSync(process.execPath, [path.join(WURZEL, 'tools/auto-messung.mjs'), '--nur-tabelle'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const text = (r.stdout || '').split('=== Tabelle M8c')[1];
  if (!text) { console.log('keine Tabelle (erst node tools/auto-messung.mjs)'); return; }
  const md = `# M8c: Messtabelle (node tools/auto-messung.mjs)\n\n## Fahrmessung${text.replace(/^[^\n]*\n/, '\n')}`;
  fs.writeFileSync(path.join(ORDNER, '80-messtabelle.md'), md);
  const zeilen = md.split('\n');
  const html = [];
  let tab = null;
  for (const z of zeilen) {
    if (z.startsWith('|')) {
      const zellen = z.split('|').slice(1, -1).map((c) => c.trim());
      if (zellen.every((c) => /^-+$/.test(c))) continue;
      if (!tab) { tab = []; html.push('<table>'); html.push(`<tr>${zellen.map((c) => `<th>${c}</th>`).join('')}</tr>`); continue; }
      html.push(`<tr>${zellen.map((c) => `<td>${c}</td>`).join('')}</tr>`);
    } else {
      if (tab) { html.push('</table>'); tab = null; }
      if (z.startsWith('# ')) html.push(`<h1>${z.slice(2)}</h1>`);
      else if (z.startsWith('=== ')) html.push(`<h2>${z.replace(/=/g, '').trim()}</h2>`);
      else if (z.startsWith('## ')) html.push(`<h2>${z.slice(3)}</h2>`);
      else if (z.trim()) html.push(`<p>${z}</p>`);
    }
  }
  if (tab) html.push('</table>');
  const spiel = await starteSpiel({ breite: 1500, hoehe: 900 });
  await spiel.page.setContent(`<html><body style="background:#121820;color:#f4f4ee;font:13px monospace;padding:12px">
    <style>table{border-collapse:collapse;margin:6px 0 14px}td,th{border:1px solid #445;padding:3px 7px}th{color:#ffd23c;text-align:left}h1{color:#ffd23c;font-size:18px}h2{color:#8fb4d8;font-size:15px}</style>
    ${html.join('\n')}</body></html>`);
  await spiel.page.screenshot({ path: path.join(ORDNER, '80-messtabelle.png'), fullPage: true });
  console.log('   80-messtabelle');
  await spiel.schliessen();
}

// ------------------------------------------------------------------------------------------------ Labore
async function labore() {
  const s = await starteSpiel({ breite: 1280, hoehe: 900 });
  const p = s.page;
  await p.goto(`${s.url}/index.html?menue=aus&auto=escorta&fahrlabor=1`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.fahrlabor, null, { timeout: 120000 });
  await p.evaluate(() => {
    const A = window.__alpineRally;
    A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(900); A.kameraSofort();
    A.fahrlabor.panel.querySelector('[data-profil="escorta"]').click();
    A.fahrlabor.panel.querySelector('#fahrlaborKopieren').click();
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(ORDNER, '90-fahrlabor.png') });
  await p.goto(`${s.url}/auto-labor.html`);
  await p.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  await p.evaluate(() => { const L = window.__autoLabor; L.modellWaehlen('delto', 'rosso'); L.aufloesung(1); L.ansicht('hinten34'); });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(ORDNER, '91-auto-labor.png') });
  await s.schliessen();
  const t = await starteSpiel({ breite: 1400, hoehe: 1000, args: ['--autoplay-policy=no-user-gesture-required'] });
  await t.page.goto(`${t.url}/ton-labor.html`);
  await t.page.waitForFunction(() => window.__tonLabor, null, { timeout: 60000 });
  await t.page.evaluate(() => { const $ = (id) => document.getElementById(id); $('tonProfil').value = 'escorta'; $('tonProfil').dispatchEvent(new Event('change')); });
  await t.page.waitForTimeout(500);
  await t.page.screenshot({ path: path.join(ORDNER, '92-ton-labor-escorta.png') });
  await t.schliessen();
  console.log('   90-fahrlabor, 91-auto-labor, 92-ton-labor-escorta');
}

if (NUR.includes('garage')) await garage();
if (NUR.includes('spiel')) await spielbilder();
if (NUR.includes('fahrt')) await fahrt();
if (NUR.includes('labor')) await labor();
if (NUR.includes('bestzeiten')) await bestzeiten();
if (NUR.includes('tabelle')) await tabelle();
if (NUR.includes('labore')) await labore();
