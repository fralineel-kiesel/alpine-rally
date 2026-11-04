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

const foto = (s) => s.page.evaluate(() => window.__foto());

// ===================================================================== Unveränderlich: Alpen (aus tools/m10c-test.mjs, gegen 0.10c)
// ===================================================================== (b) Länge und Abkürzungen
if (teil('x1')) {
  console.log('(x1) Alpen: Länge und Abkürzungen');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  const l = await s.page.evaluate(() => ({ laenge: window.__alpineRally.strecke.laenge, start: window.__alpineRally.strecke.startS, ziel: window.__alpineRally.strecke.zielS }));
  await s.schliessen();
  melde(Math.abs(l.laenge - 3667.587) <= 0.5, `Strecke ${l.laenge.toFixed(3)} m (Ziel 3667.587 ±0.5), Start ${l.start} m, Ziel ${l.ziel.toFixed(2)} m`);
  const r = werkzeug('abkuerzungen.mjs', ['--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen.log'), r.text);
  const n = [...r.text.matchAll(/übrig in Kurve [\d – ]+: (\d+) Linien/g)].map((m) => +m[1]);
  const durch = +((/Durchkommen in gesperrten Kurven: (\d+)/.exec(r.text) || [])[1]);
  melde(r.code === 0 && n.join('/') === '127/2/342/84' && durch === 0, `abkuerzungen.mjs --pruefen: ${n.join(' / ')} (Ziel 127 / 2 / 342 / 84), Durchkommen in gesperrten Kurven ${durch}`);
}

// ===================================================================== (c) Testfahrer
if (teil('x2')) {
  console.log('(x2) Alpen-Testfahrer: Prototyp und Autos gleich wie 0.10c (Escorta ab Teil C: nur Schotterstellen)');
  const zeilen = (t) => t.split('\n').filter((x) => /^\s+(vorsichtig|mittel|flott|Talschleife|Almweg|Wiesenweg)\b/.test(x)).map((x) => x.trim());
  for (const id of ['prototyp', ...AUTOS]) {
    const neu = werkzeug('testfahrer.mjs', ['--auto', id]);
    fs.writeFileSync(path.join(LOG, `testfahrer-${id}.log`), neu.text);
    const zn = zeilen(neu.text);
    const zeiten = zn.filter((x) => /^(vorsichtig|mittel|flott)/.test(x)).map((x) => x.split(/\s+/)[1]).join(' / ');
    if (!ALT) { melde(zn.length >= 3, `${id}: ${zeiten} (ohne --alt kein Vergleich)`); continue; }
    const alt = werkzeug('testfahrer.mjs', ['--auto', id, '--wurzel', ALT]);
    const za = zeilen(alt.text);
    const gleich = za.length >= 3 && JSON.stringify(za) === JSON.stringify(zn);
    melde(gleich, `${id}: ${zeiten} – ${zn.length} Zeilen (Zeiten, Checkpoints, Aufpralle, Abstände, Gänge, Nebenwege) ${gleich ? 'identisch' : 'ANDERS'} wie 0.10c${id === 'prototyp' ? ' (Referenz 2:59.33 / 2:42.35 / 2:31.92)' : ''}`);
    if (!gleich) for (let i = 0; i < Math.max(za.length, zn.length); i++) if (za[i] !== zn[i]) { info(`alt: ${za[i]}`); info(`neu: ${zn[i]}`); break; }
  }
}

// ===================================================================== (d) Pace-Notes, Checkpoints, Strecke
// M10c: neue CONFIG-Werte, die für die Alpen nichts ändern (je Teil ergänzt)
const NEU_WERTE = [
  (c) => { if (c.kollision) delete c.kollision.wand; }, // Teil B: Wand-Strafe (Alpen: nur bei Wandkontakt, siehe x2)
  (c) => { if (c.strassenrand && c.strassenrand.planke) delete c.strassenrand.planke.ohne; }, // Teil C: Bereiche ohne Leitplanke (Alpen: keine)
  (c) => { if (c.menue) { delete c.menue.etappenSeite; } }, // Teil D: kleinere Vorschaukarte (nur Menü ETAPPE)
  (c) => { if (c.menue) { delete c.menue.autoAufloesung; if (c.menue.standard) { delete c.menue.standard.aufloesungAuto; delete c.menue.standard.autoStufe; } } }, // Teil E
  (c) => { if (c.version) delete c.version; }, // Teil F
];
async function streckenAbdruck(wurzel, strecke = 'alpen') {
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=${strecke}`);
  await bereit(s);
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, st = A.strecke;
    const h = (arr) => { let x = 7; for (let i = 0; i < arr.length; i++) x = (x * 31 + Math.round(arr[i] * 1e4)) % 1000000007; return x; };
    return {
      notes: A.paceNotes.notes.map((n) => JSON.stringify(n, (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v))),
      kacheln: A.paceNotes.kacheln ? A.paceNotes.kacheln.length : null,
      checkpoints: JSON.stringify(A.checkpoints.map((c) => ({ s: c.s, nummer: c.nummer }))),
      abschnitte: JSON.stringify(st.abschnitte),
      punkte: [h(st.px), h(st.py), h(st.pz), h(st.tx), h(st.tz), h(st.wandStaerke), h(st.baumFaktor), h(st.waldAnteil), h(st.nahWald), st.anzahl].join(','),
      netz: JSON.stringify(Object.keys(A.netz)),
      start: st.startS, ziel: st.zielS, laenge: st.laenge,
      config: JSON.stringify(A.CONFIG),
    };
  });
  await s.schliessen();
  return r;
}
if (teil('x3')) {
  console.log('(x3) Alpen: Pace-Notes, Checkpoints, Abschnitte, Strassenpunkte, CONFIG');
  const neu = await streckenAbdruck(WURZEL);
  info(`${neu.notes.length} Pace-Notes, Checkpoints ${neu.checkpoints}`);
  if (ALT) {
    const alt = await streckenAbdruck(ALT);
    const anders = neu.notes.filter((n, i) => n !== alt.notes[i]).length + Math.abs(neu.notes.length - alt.notes.length);
    melde(anders === 0 && neu.notes.length >= 20, `Pace-Notes: ${neu.notes.length} Ansagen, Symbole/Zusätze/Stellen/Reihenfolge ${anders ? `${anders} anders` : 'identisch'} wie 0.10c`);
    melde(neu.checkpoints === alt.checkpoints, `Checkpoints gleich (${neu.checkpoints})`);
    melde(neu.abschnitte === alt.abschnitte, 'Abschnitte gleich (Namen, Bäume, Wald, Felswand, von/bis)');
    melde(neu.punkte === alt.punkte && neu.laenge === alt.laenge && neu.start === alt.start && neu.ziel === alt.ziel, `Strassenpunkte (1-m-Raster, Richtung, Felswand, Baumdichte) bit-gleich, Länge ${neu.laenge} = ${alt.laenge}`);
    // CONFIG: gleich bis auf die Reihenfolge innerhalb von "leben" (Seeds kommen aus "seeds") und die Version
    // (M10b: Fahnen-Art 'kreuz' heisst jetzt 'motiv' = Landesfahne der Strecke; gleiche Wirkung, darum gleichgesetzt)
    const ordne = (o) => (Array.isArray(o) ? o.map(ordne) : o && typeof o === 'object' ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, ordne(o[k])])) : o === 'motiv' ? 'kreuz' : o);
    const cn = ordne(JSON.parse(neu.config)), ca = ordne(JSON.parse(alt.config));
    const NEU_M10B = ['sprung']; // neue Blöcke in M10c (Flugphase: nur in Sprungzonen, Alpen haben keine)
    // neue Werte innerhalb der Blöcke (M10b.2, für die Alpen wirkungslos): gelaende.boeschung (Alpen null), NEU_WERTE
    for (const c of [cn, ca]) { if (c.gelaende) delete c.gelaende.boeschung; for (const f of NEU_WERTE) f(c); }
    const unterschiede = Object.keys({ ...ca, ...cn }).filter((k) => !NEU_M10B.includes(k) && JSON.stringify(ca[k]) !== JSON.stringify(cn[k]));
    melde(unterschiede.length === 0, `CONFIG (alle Werte, sortiert) gleich wie 0.10c${unterschiede.length ? `; anders: ${unterschiede.join(', ')}` : ''}`);
    const reihenfolge = Object.keys(JSON.parse(neu.config)).filter((k) => !NEU_M10B.includes(k)).join() === Object.keys(JSON.parse(alt.config)).join();
    melde(reihenfolge, `CONFIG: Reihenfolge der Blöcke gleich${NEU_M10B.length ? ` (neu dazu: ${NEU_M10B.join(', ')})` : ''}`);
  }
}

// ===================================================================== (e) Bildvergleich
// Feste Punkte: [Name, Streckenmeter]
const PUNKTE = [['start', null], ['tal', 300], ['talschleife', 860], ['kehren', 1700], ['felswand', 1420], ['alm', 1980], ['pass', 2610], ['weide', 2965], ['abfahrt', 3240], ['ziel', 3585]];
async function bilderVon(wurzel) {
  const out = {};
  const bz = { passstrasse: { rt4: [{ zeit: 151.23, cps: [30.1, 80.2, 120.3], datum: '2026-10-01T10:00:00.000Z', auto: 'rt4', aufpralle: 1, resets: 0, hoechstTempo: 50 }],
    delto: [{ zeit: 155.5, cps: [31, 82, 123], datum: '2026-10-02T10:00:00.000Z', auto: 'delto', aufpralle: 0, resets: 0, hoechstTempo: 48 }] } };
  // Titel und Demo-Fahrt (mit Menü)
  {
    const s = await oeffne(wurzel, '?ton=aus', { uhr: true, speicher: { 'alpineRally.bestzeiten2': JSON.stringify(bz) } });
    await bereit(s);
    await bilder(s, 3); out.titel = await foto(s);
    await bilder(s, 400); out.demo = await foto(s);
    // Menüseiten (Menü-Leinwand allein, wie m9a2-test)
    out.seiten = await s.page.evaluate(() => {
      const A = window.__alpineRally, c = document.createElement('canvas'); c.width = 320; c.height = 180;
      const x = c.getContext('2d'), r = {};
      for (const n of ['haupt', 'auto', 'etappe', 'bestzeiten', 'credits', 'einstellungen']) {
        A.menue.zeige(A.seiten[n], true); x.clearRect(0, 0, 320, 180); A.menue.zeichne(x, 0, 1); r[n] = c.toDataURL();
      }
      return r;
    });
    out.fehler = s.fehler.slice();
    await s.schliessen();
  }
  // Rennen: Start, Streckenpunkte, fünf Autos (HUD mit Tachos und Minimap im Bild)
  for (const id of AUTOS) {
    const s = await oeffne(wurzel, `?menue=aus&ton=aus&auto=${id}`, { uhr: true, auto: id });
    await bereit(s);
    await bilder(s, 2);
    const nur = id === 'rt4' ? PUNKTE : [['start', null], ['pass', 2610]];
    for (const [name, sM] of nur) {
      if (sM != null) await s.page.evaluate((sM) => { const A = window.__alpineRally; A.anhalten = true; A.setzeAuf(sM); A.kameraSofort(); }, sM);
      await bilder(s, 6);
      out[`${id}-${name}`] = await foto(s);
    }
    out.fehler = (out.fehler || []).concat(s.fehler);
    await s.schliessen();
  }
  return out;
}
// Zwei Bilder (base64-PNG oder data-URL) Pixel für Pixel vergleichen; mit bild: Vergleichsbild (alt | neu | Unterschied)
async function vergleiche(seite, a, b, bild = false) {
  return seite.evaluate(async ({ a, b, bild }) => {
    const lade = async (x) => createImageBitmap(await (await fetch(x.startsWith('data:') ? x : `data:image/png;base64,${x}`)).blob());
    const [ia, ib] = [await lade(a), await lade(b)];
    const daten = (im) => { const c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height); };
    const da = daten(ia), db = daten(ib);
    if (da.width !== db.width || da.height !== db.height) return { anders: -1 };
    let anders = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    const diff = new ImageData(da.width, da.height);
    for (let i = 0; i < da.data.length; i += 4) {
      const g = da.data[i] === db.data[i] && da.data[i + 1] === db.data[i + 1] && da.data[i + 2] === db.data[i + 2] && da.data[i + 3] === db.data[i + 3];
      if (!g) { anders++; const p = i / 4, px = p % da.width, py = Math.floor(p / da.width); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); }
      diff.data[i] = g ? da.data[i] * 0.3 : 255; diff.data[i + 1] = g ? da.data[i + 1] * 0.3 : 0; diff.data[i + 2] = g ? da.data[i + 2] * 0.3 : 255; diff.data[i + 3] = 255;
    }
    let url = null;
    if (bild) {
      const c = document.createElement('canvas'); c.width = da.width * 3 + 8; c.height = da.height; const x = c.getContext('2d');
      x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
      x.putImageData(da, 0, 0); x.putImageData(db, da.width + 4, 0); x.putImageData(diff, 2 * da.width + 8, 0);
      url = c.toDataURL();
    }
    return { anders, pixel: da.width * da.height, url, box: anders ? [x0, y0, x1, y1] : null };
  }, { a, b, bild });
}
if (teil('x4')) {
  console.log('(x4) Alpen-Bilder gegen 0.10c (eigene Bild-Uhr, gleiche Seeds)');
  if (!ALT) info('nur mit --alt');
  else {
    const neu = await bilderVon(WURZEL), alt = await bilderVon(process.env.M10B_SELBST ? WURZEL : ALT); // (M10B_SELBST=1: Gegenkontrolle neu gegen neu)
    const s = await starteSpiel({ breite: 320, hoehe: 200 });
    await s.page.goto(`${s.url}/tools/leer.html`).catch(() => {});
    const paare = Object.keys(neu).filter((k) => k !== 'seiten' && k !== 'fehler').map((k) => [k, neu[k], alt[k]])
      .concat(Object.keys(neu.seiten).map((k) => [`menü ${k}`, neu.seiten[k], alt.seiten[k]]));
    const rot = [], nurVersion = [], neuGestaltet = [];
    // M10b.1: Seite ETAPPE zeigt die Finnland-Zeile (Länge, Vorschau-Karte) der neuen Strecke – absichtlich anders
    const NEU_GESTALTET = ['menü einstellungen', 'menü etappe']; // (M10c.1: AUFLÖSUNG AUTO, kleinere Vorschaukarte)
    // Seit Teil F steht 0.10c statt 0.10c in der Versionszeile (Titel, Credits): dort darf genau diese eine Textzeile
    // anders sein (Unterschied höchstens 7 Pixel hoch, ganz in der Zeile, in der die Version steht)
    const versionsZeile = (k, box) => box && box[3] - box[1] <= 7 && ((/^(titel|demo)$/.test(k) && box[0] >= 220 && box[1] >= 168) || k === 'menü credits');
    for (const [k, n, a] of paare) {
      const v = await vergleiche(s.page, a, n, k === 'rt4-weide' || k === 'titel');
      if (v.anders !== 0 && NEU_GESTALTET.includes(k)) neuGestaltet.push(`${k} (${v.anders} Pixel)`);
      else if (v.anders !== 0 && versionsZeile(k, v.box)) nurVersion.push(`${k} (${v.anders} Pixel in x ${v.box[0]}–${v.box[2]}, y ${v.box[1]}–${v.box[3]})`);
      else if (v.anders !== 0) rot.push(`${k}: ${v.anders} Pixel (${v.box})`);
      if (v.url) fs.writeFileSync(path.join(LOG, `vergleich-${k}.png`), Buffer.from(v.url.split(',')[1], 'base64'));
    }
    // Gegenprobe: zwei verschiedene Punkte sind verschieden (der Vergleich sieht Unterschiede)
    const gegen = await vergleiche(s.page, neu['rt4-pass'], neu['rt4-weide']);
    await s.schliessen();
    for (const [k, b] of Object.entries(neu)) if (typeof b === 'string') fs.writeFileSync(path.join(LOG, `neu-${k}.png`), Buffer.from(b.split(',')[1], 'base64'));
    melde(rot.length === 0, `${paare.length} Bilder verglichen: ${paare.length - nurVersion.length - neuGestaltet.length} pixelgleich wie 0.10c, ${nurVersion.length} bis auf die Versionszeile, ${neuGestaltet.length} Menüseite(n) absichtlich neu (AUFLÖSUNG, ETAPPE) (Titel, Demo-Fahrt, Start, ${PUNKTE.length - 1} Streckenpunkte, fünf Autos am Start und auf der Passhöhe mit Tachos und Minimap, ${Object.keys(neu.seiten).length} Menüseiten inkl. Bestzeiten)${rot.length ? `; anders: ${rot.join(', ')}` : ''}`);
    if (nurVersion.length) info(`nur die Versionszeile anders (0.10c -> 0.10c): ${nurVersion.join(', ')}`);
    if (neuGestaltet.length) info(`absichtlich anders (M10c.1: AUFLÖSUNG AUTO, kleinere Vorschaukarte): ${neuGestaltet.join(', ')}`);
    melde(gegen.anders > 1000, `Gegenprobe: Passhöhe und Weide unterscheiden sich in ${gegen.anders} Pixeln (der Vergleich sieht Unterschiede)`);
    melde(neu.fehler.length === 0 && alt.fehler.length === 0, `Konsole ohne Fehler (neu ${neu.fehler.length}, alt ${alt.fehler.length})`);
    info(`Bilder: ${LOG}/neu-*.png, Vergleich alt | neu | Unterschied: ${LOG}/vergleich-weide.png`);
  }
}

// ===================================================================== (f) Ton
async function tonAbdruck(wurzel) {
  const s = await oeffne(wurzel, '?menue=aus');
  await bereit(s);
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally;
    const rund = (k, v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v);
    return { quellen: JSON.stringify(A.tonQuellen, rund), audio: JSON.stringify(A.CONFIG.audio) };
  });
  await s.schliessen();
  return r;
}
if (teil('x5')) {
  console.log('(x5) Alpen: Ton gleich');
  if (!ALT) info('nur mit --alt');
  else {
    const neu = await tonAbdruck(WURZEL), alt = await tonAbdruck(ALT);
    const q = JSON.parse(neu.quellen);
    melde(neu.quellen === alt.quellen && neu.quellen.length > 1000, `Umgebungs-Quellen gleich: ${q.herden.length} Herden (Kuhglocken), ${q.orte.length} Publikum-Orte, Brunnen ${q.brunnen ? 'ja' : 'nein'}, Vögel je Meter (${q.voegel.namen.length} Abschnitte, fehlend: ${q.voegel.fehlen.length}), Böen auf der Passhöhe ${q.pass ? `${Math.round(q.pass.von)}–${Math.round(q.pass.bis)} m` : 'keine'}`);
    melde(neu.audio === alt.audio, 'CONFIG.audio identisch (alle Klangwerte, Seeds, Umgebung)');
    // M10b: js/umgebung.js absichtlich geändert (Glocken nur bei deko.tierKlang 'glocke', mehrere Wasser-Orte);
    // für die Alpen zählt, dass Quellen (oben) und offline gerechnete Klänge (unten) gleich sind
    const dateien = ['js/musik.js', 'js/musikstueck.js', 'js/tonfahrt.js']; // (js/audio.js: M10b.2 Platsch, nur bei Wasser; Wirkung unten offline geprüft)
    const geaendert = dateien.filter((d) => spawnSync('git', ['diff', '--quiet', BASIS, '--', d], { cwd: WURZEL }).status !== 0);
    melde(geaendert.length === 0, `Ton-Code unverändert seit 0.10c (${dateien.join(', ')}; umgebung.js geändert, Wirkung für die Alpen gleich)${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
    // Offline gerechnete Klänge (OfflineAudioContext): Messzahlen von ton-umgebung-test in beiden Ständen
    const zahlen = (t) => t.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x)).map((x) => x.replace(/\d+(\.\d+)? ?ms\b/g, 'X ms').trim());
    // Diese Zeilen messen in Echtzeit im laufenden Spiel (Tiefpass/Pegel mitten im Übergang, Zeitpunkt des Stopps,
    // Ton-Labor live): sie schwanken schon zwischen zwei Läufen desselben Stands (gemessen) und werden nur gemeldet.
    // "Pause: leise Variante" und "aus der Pause zum Hauptmenü" sind darum auch in 0.10c manchmal rot (alte Wackel-Tests aus M7b);
    // M10b.2: "vom Zielbildschirm zum Hauptmenü" ebenso (einmal rot, im nächsten Lauf desselben Stands grün)
    const ECHTZEIT = /^(OK|FEHLER)\s+(Pause: Umgebung läuft gedämpft|Weiter: Musik blendet|Ton-Labor: Umgebung mit VORBEIFAHREN|STARTEN: Musik blendet|Pause: leise Variante|aus der Pause zum Hauptmenü: Musik beginnt|vom Zielbildschirm zum Hauptmenü: wieder Menü-Musik)/;
    const geaendert0 = new Set(spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter(Boolean));
    const tn = werkzeug('ton-umgebung-test.mjs', []), ta = werkzeug('ton-umgebung-test.mjs', [], ALT);
    // (der alte Test schreibt Spektrogramme und Messtabelle neu: zurücksetzen)
    const neuGeschrieben = spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter((d) => d && !geaendert0.has(d) && /^(screenshots|tools)\//.test(d) && !/\.mjs$/.test(d));
    if (neuGeschrieben.length) spawnSync('git', ['checkout', '--', ...neuGeschrieben], { cwd: WURZEL });
    fs.writeFileSync(path.join(LOG, 'ton-umgebung-neu.log'), tn.text); fs.writeFileSync(path.join(LOG, 'ton-umgebung-alt.log'), ta.text);
    const zn = zahlen(tn.text), za = zahlen(ta.text);
    const andersAlle = zn.filter((x, i) => x !== za[i]);
    const anders = andersAlle.filter((x) => !ECHTZEIT.test(x));
    if (andersAlle.length > anders.length) info(`Echtzeit-Zeilen anders (schwanken auch neu gegen neu): ${andersAlle.length - anders.length}`);
    const rotN = zn.filter((x) => x.startsWith('FEHLER') && !ECHTZEIT.test(x)).length;
    melde(zn.length > 20 && zn.length === za.length && anders.length === 0 && rotN === 0, `ton-umgebung-test (Glocken, Publikum, Vögel, Brunnen, Böen, Musik offline gerechnet): ${zn.length} Messzeilen, ohne die ${zn.filter((x) => ECHTZEIT.test(x)).length} Echtzeit-Zeilen ${anders.length ? `${anders.length} anders` : 'Zahl für Zahl gleich'} wie 0.10c (rot: neu ${zn.filter((x) => x.startsWith('FEHLER')).length}, alt ${za.filter((x) => x.startsWith('FEHLER')).length}, nur Echtzeit-Zeilen)`);
    if (anders.length) info(`erste Abweichung: ${anders[0].slice(0, 200)}`);
  }
}


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

// ===================================================================== Teil B: Wand-Strafe
// Testfahrer-Läufe (strecke-abfahren.mjs, 5 Stile, --json) je Auto und Strecke, alt (0.10c, mit dessen Streckendatei) und neu.
// Ergebnis wird in LOG zwischengespeichert (M10C1_NEU=1 erzwingt neue Läufe für "neu").
const STILE_B = ['vorsichtig', 'mittel', 'flott', 'digital', 'wand'];
function testfahrerLauf(strecke, auto, wurzel = WURZEL, stand = 'neu') {
  const datei = path.join(LOG, `fahrt-${stand}-${strecke}-${auto}.json`);
  if (fs.existsSync(datei) && !(stand === 'neu' && process.env.M10C1_NEU)) return JSON.parse(fs.readFileSync(datei, 'utf8'));
  const a = [path.join(wurzel, 'strecken', `${strecke}.js`), '--auto', auto, '--stil', STILE_B.join(','), '--json', datei, '--aus', path.join(LOG, `fahrt-${stand}-${strecke}-${auto}.txt`)];
  if (wurzel !== WURZEL) a.push('--wurzel', wurzel);
  const r = werkzeug('strecke-abfahren.mjs', a);
  if (!fs.existsSync(datei)) { console.log(r.text.slice(-2000)); throw new Error(`strecke-abfahren ${strecke} ${auto} ${stand}`); }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
const fmtZ = (t) => (t == null ? 'NICHT IM ZIEL' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);
// Exploit-Kurven je Auto und Strecke mit tools/wand-kurven.mjs (Wand bringt mehr als 0.3 s gegen die schnellste Fahrt ohne Wand)
function wandKurven(strecke, auto, wurzel, stand) {
  const datei = path.join(LOG, `wk-${stand}-${strecke}-${auto}.json`);
  if (!fs.existsSync(datei) || (stand === 'neu' && process.env.M10C1_NEU)) {
    const r = werkzeug('wand-kurven.mjs', ['--strecke', strecke, '--auto', auto, '--wurzel', wurzel, '--datei', path.join(wurzel, 'strecken', `${strecke}.js`), '--json', datei]);
    if (!fs.existsSync(datei)) { console.log(r.text.slice(-1500)); throw new Error(`wand-kurven ${strecke} ${auto} ${stand}`); }
  }
  return JSON.parse(fs.readFileSync(datei, 'utf8')).kurven.filter((k) => k.gewinn > 0.3).map((k) => ({ s: k.s, gewinn: k.gewinn }));
}
let laufeB = null;
function alleLaeufeB() {
  if (laufeB) return laufeB;
  laufeB = { neu: {}, alt: {} };
  for (const strecke of ['alpen', 'finnland']) for (const id of AUTOS) {
    laufeB.neu[`${strecke}-${id}`] = testfahrerLauf(strecke, id);
    if (ALT) laufeB.alt[`${strecke}-${id}`] = testfahrerLauf(strecke, id, ALT, 'alt');
  }
  return laufeB;
}
if (teil('g')) {
  console.log('(g) Testfahrer alt/neu (Autos x Stile x Strecken, Zeit, Wandkontakte, Aufpralle) und Exploit-Kurven');
  const L = alleLaeufeB();
  const tab = ['| Strecke | Auto | Stil | Zeit 0.10c (Wand, Aufpr.) | Zeit 0.10c.1 (Wand, Aufpr., Wasser) |', '|---|---|---|---|---|'];
  const kurven = [];
  let wandSchneller = [];
  for (const k of Object.keys(L.neu)) {
    const [strecke, id] = k.split('-');
    const n = Object.fromEntries(L.neu[k].stile.map((x) => [x.stil, x])), a = L.alt[k] ? Object.fromEntries(L.alt[k].stile.map((x) => [x.stil, x])) : null;
    for (const stil of STILE_B) {
      const x = n[stil], y = a && a[stil];
      tab.push(`| ${strecke} | ${id} | ${stil} | ${y ? `${fmtZ(y.zeit)} (${(y.wandKontakte || []).length}, ${y.aufpralle})` : '–'} | ${fmtZ(x.zeit)} (${x.wandKontakte.length}, ${x.aufpralle}, ${x.wasserBad || 0}) |`);
    }
    const ka = a ? wandKurven(strecke, id, ALT, 'alt') : [], kn = wandKurven(strecke, id, WURZEL, 'neu');
    kurven.push({ strecke, id, alt: ka, neu: kn });
    if (n.wand.zeit == null || n.mittel.zeit == null || n.wand.zeit < n.mittel.zeit - 0.3) wandSchneller.push(`${strecke}/${id}: wand ${fmtZ(n.wand.zeit)} gegen mittel ${fmtZ(n.mittel.zeit)}`);
  }
  fs.writeFileSync(path.join(LOG, 'testfahrer-tabelle.md'), `${tab.join('\n')}\n`);
  const kt = kurven.map((k) => `${k.strecke}/${k.id}: alt ${k.alt.map((x) => `${x.s} m (−${x.gewinn.toFixed(2)} s)`).join(', ') || 'keine'} → neu ${k.neu.map((x) => `${x.s} m (−${x.gewinn.toFixed(2)} s)`).join(', ') || 'keine'}`);
  fs.writeFileSync(path.join(LOG, 'exploit-kurven.txt'), `${kt.join('\n')}\n`);
  for (const z of kt) info(z);
  const nAlt = kurven.reduce((n, k) => n + k.alt.length, 0), nNeu = kurven.reduce((n, k) => n + k.neu.length, 0);
  if (ALT) melde(nAlt > 0, `vorher (0.10c): ${nAlt} Exploit-Kurven (die Wand bringt mehr als 0.3 s gegen die schnellste Fahrt ohne Wand, tools/wand-kurven.mjs) – der Testfahrer zeigt den Exploit`);
  melde(nNeu === 0, `nachher: ${nNeu} Exploit-Kurven`);
  melde(wandSchneller.length === 0, `ganze Etappe: Stil wand nirgends schneller als mittel (Toleranz 0.3 s; Achtung: misst auch, dass enge Kurven ohne Wand schneller gehen, als "mittel" plant)${wandSchneller.length ? `: ${wandSchneller.join('; ')}` : ''}; Tabelle ${LOG}/testfahrer-tabelle.md`);
  // Unfälle vorsichtig/mittel dürfen nicht steigen
  const mehr = [];
  if (ALT) for (const k of Object.keys(L.neu)) for (const stil of ['vorsichtig', 'mittel']) {
    const x = L.neu[k].stile.find((q) => q.stil === stil), y = L.alt[k].stile.find((q) => q.stil === stil);
    if (x.aufpralle > y.aufpralle) mehr.push(`${k}/${stil} ${y.aufpralle} → ${x.aufpralle}`);
    if (k === 'finnland-l073' && stil === 'mittel') info(`Lanza 073 Finnland mittel: Aufpralle ${y.aufpralle} → ${x.aufpralle} (${x.aufprallListe.join(', ')})`);
  }
  if (ALT) melde(mehr.length === 0, `Unfälle vorsichtig/mittel nicht mehr als in 0.10c${mehr.length ? `: ${mehr.join('; ')}` : ''}`);
  // Teil C: Wasserbäder je Stil (Finnland); vorsichtig/mittel/digital nie, flott/wand dürfen an der Seekehre baden
  const bad = {}, falsch = [];
  for (const k of Object.keys(L.neu)) if (k.startsWith('finnland')) for (const x of L.neu[k].stile) { bad[x.stil] = (bad[x.stil] || 0) + (x.wasserBad || 0); if (x.wasserBad && ['vorsichtig', 'mittel', 'digital'].includes(x.stil)) falsch.push(`${k}/${x.stil}`); }
  melde(falsch.length === 0, `Finnland Wasserbäder je Stil (5 Autos): ${Object.entries(bad).map(([k, v]) => `${k} ${v}`).join(', ')}${falsch.length ? ` – NICHT ERLAUBT: ${falsch.join(', ')}` : ''}`);
}
if (teil('l')) {
  console.log('(l) Läufe ohne Wandkontakt bit-gleich wie 0.10c (beide Strecken; Zeit, Zwischenzeiten, Aufpralle)');
  if (!ALT) info('nur mit --alt');
  else {
    const L = alleLaeufeB();
    const ohne = [], anders = [], mit = [];
    for (const k of Object.keys(L.neu)) for (const stil of STILE_B) {
      const x = L.neu[k].stile.find((q) => q.stil === stil), y = L.alt[k].stile.find((q) => q.stil === stil);
      const kontakt = (y.wandKontakte || []).length > 0 || x.wandKontakte.length > 0;
      if (kontakt) { mit.push(`${k}/${stil} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)} (Wand ${(y.wandKontakte || []).length} → ${x.wandKontakte.length})`); continue; }
      ohne.push(k);
      if (x.zeit !== y.zeit || x.aufpralle !== y.aufpralle || JSON.stringify(x.cps) !== JSON.stringify(y.cps) || JSON.stringify(x.aufprallListe) !== JSON.stringify(y.aufprallListe)) anders.push(`${k}/${stil} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)}`);
    }
    melde(anders.length === 0 && ohne.length > 0, `${ohne.length} Läufe ohne Wandkontakt: Zeit, Zwischenzeiten und Aufpralle (Ort, Tempo) gleich${anders.length ? ` – ANDERS: ${anders.join('; ')}` : ''}`);
    fs.writeFileSync(path.join(LOG, 'laeufe-mit-wand.txt'), `${mit.join('\n')}\n`);
    info(`${mit.length} Läufe mit Wandkontakt (dürfen sich ändern): ${LOG}/laeufe-mit-wand.txt`);
  }
}
// Synthetische Leitplanke (gerade Reihe Kreise wie js/strassenrand.js, Art 'planke') mit der echten Kollision und Wand-Strafe
const WAND_LABOR = async ({ winkel, kmh, schritte = 1, schleifen = false }) => {
  const { baueKollision } = await import('/js/kollision.js');
  const { baueWand } = await import('/js/wand.js');
  const A = window.__alpineRally, C = A.CONFIG, pr = C.strassenrand.planke;
  const hin = []; for (let z = -60; z <= 60; z += pr.kreisAbstand) hin.push({ x: 0, z, r: pr.kreisRadius, rand: 'planke' });
  const wand = baueWand(), kol = baueKollision(hin, null, wand);
  const g = winkel * Math.PI / 180, v0 = kmh / 3.6;
  // Auto links der Planke (x < 0), fährt in +z mit winkel Richtung Planke (+x)
  const ph = { x: -(C.kollision.autoBreite / 2 + pr.kreisRadius + 0.6), z: 0, richtung: g, drehrate: 0, vx: Math.sin(g) * v0, vz: Math.cos(g) * v0, get tempo() { return Math.hypot(this.vx, this.vz); } };
  const dt = 1 / 120, w0 = ph.richtung; let kontakte = 0, vor = null;
  for (let i = 0; i < 2400 && i < schritte + 2400; i++) {
    wand.anfang(dt);
    const xa = ph.x, za = ph.z, wa = ph.richtung;
    if (schleifen) { ph.vx = 0.01; ph.x = -(C.kollision.autoBreite / 2 + pr.kreisRadius) + 0.001; } // ständig ganz leicht an die Planke gelehnt (1 mm, weit unter der Einschlag-Grenze)
    ph.x += ph.vx * dt; ph.z += ph.vz * dt;
    const v = ph.tempo;
    kol.loese(ph, xa, za, wa);
    wand.ende(ph, dt);
    if (wand.kontakt) { kontakte++; if (vor == null) vor = v; }
    if (!schleifen && wand.einschlaege > 0 && kontakte > 0 && !wand.kontakt) break;
    if (schleifen && i >= 120) break;
  }
  return { vor, nach: ph.tempo, strafe: wand.letzter, einschlaege: wand.einschlaege, gier: Math.abs(ph.richtung - w0) * 180 / Math.PI, kontakte, v0 };
};
const strafeFormel = (w) => (w <= 15 ? 0.25 : w <= 60 ? 0.25 + (0.35 * (w - 15)) / 45 : w <= 80 ? 0.6 + (0.15 * (w - 60)) / 20 : 0.75);
if (teil('h') || teil('i') || teil('j')) {
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  if (teil('h')) {
    console.log('(h) Strafe nach Einschlagwinkel gegen die Formel (±3 %), synthetische Leitplanke, 100 km/h');
    for (const w of [8, 15, 37.5, 60, 70, 85]) {
      const r = await s.page.evaluate(WAND_LABOR, { winkel: w, kmh: 100 });
      const verlust = 1 - r.strafe.nachher / r.strafe.vorher, soll = strafeFormel(r.strafe.winkel);
      melde(r.einschlaege === 1 && Math.abs(verlust - soll) <= 0.03 && Math.abs(r.strafe.winkel - w) < 3, `${w}°: gemessener Einschlagwinkel ${r.strafe.winkel.toFixed(1)}°, Verlust ${pz(verlust)} (Formel ${pz(soll)}), ${r.einschlaege} Einschlag-Strafe, Tempo danach ${(r.nach * 3.6).toFixed(0)} km/h`);
    }
  }
  if (teil('i')) {
    console.log('(i) Gier-Änderung durch die Wand je Kontakt höchstens 6° (synthetisch, Lenkung 0)');
    for (const w of [5, 20, 45, 80]) {
      const r = await s.page.evaluate(WAND_LABOR, { winkel: w, kmh: 120 });
      melde(r.gier <= 6, `${w}° mit 120 km/h: Gier-Änderung ${r.gier.toFixed(2)}° in ${r.kontakte} Kontakt-Schritten`);
    }
  }
  if (teil('j')) {
    console.log('(j) Dauerkontakt kostet Tempo (1 s an der Planke schleifen, ohne Einschlag)');
    const r = await s.page.evaluate(WAND_LABOR, { winkel: 0, kmh: 80, schleifen: true });
    melde(r.einschlaege === 0 && r.kontakte > 100 && r.nach / r.v0 < 0.68 && r.nach / r.v0 > 0.58, `${r.kontakte} Schritte an der Planke, nach 1 s Schleifen ${(r.nach * 3.6).toFixed(1)} km/h von ${(r.v0 * 3.6).toFixed(0)} (${pz(1 - r.nach / r.v0)} weniger; Ziel ca. 35 % plus etwas Reibung durch das Anlehnen), Einschläge ${r.einschlaege}`);
  }
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
// Im Spiel: Auto an eine echte Leitplanke (Alpen) bzw. Felswand stellen
const AN_DIE_WAND = ({ art, winkel, kmh, gas = 0, bremse = 0, sek = 1.5, lenk = 0, abstand = 0.6 }) => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke, q = {};
  A.anhalten = true;
  let s0 = null, seite = 0, lat = 0;
  if (art === 'fels') {
    for (let i = 300; i < S.anzahl - 300 && s0 == null; i += 5) if (S.wandStaerke[i] > 0.95 && S.wandStaerke[i + 30] > 0.95 && S.wandStaerke[i - 30] > 0.95) { s0 = i; seite = S.wandSeite[i]; lat = A.CONFIG.grenze.wandGrenze; }
  } else {
    // eine lange gerade Leitplanke: Kreis, dessen Nachbarn 10 m vor und zurück gleich weit neben der Mitte stehen
    const pl = A.strassenrand.hindernisse.filter((h) => h.rand === 'planke');
    for (const h of pl) {
      S.abfrage(h.x, h.z, q); const sh = q.s, la = q.seite;
      if (sh < 300 || Math.abs(la) > 7) continue;
      const nah = pl.filter((g) => Math.hypot(g.x - h.x, g.z - h.z) < 12).map((g) => S.abfrage(g.x, g.z, {}));
      if (nah.length > 25 && nah.every((g) => Math.abs(g.seite - la) < 0.15)) { s0 = sh; seite = Math.sign(la); lat = Math.abs(la) - h.r; break; }
    }
  }
  const p = S.punktBei(s0);
  A.setzeAuf(s0);
  const rx = -p.tz, rz = p.tx; // rechts (seite > 0 = rechts)
  const a = winkel * Math.PI / 180, fx = Math.cos(a) * p.tx + Math.sin(a) * rx * seite, fz = Math.cos(a) * p.tz + Math.sin(a) * rz * seite;
  const g = Math.atan2(fx, fz);
  // Auto so hin, dass die vordere Ecke zur Wand hin noch "abstand" Meter Luft hat
  const L = A.CONFIG.kollision.autoLaenge / 2, Bh = A.CONFIG.kollision.autoBreite / 2;
  const ecke = L * Math.sin(a) + Bh * Math.cos(a);
  const d = lat - ecke - abstand;
  P.reset(p.x + rx * seite * d, p.z + rz * seite * d, g);
  P.vx = Math.sin(g) * kmh / 3.6; P.vz = Math.cos(g) * kmh / 3.6;
  const out = { s0, seite, lat, kontakte: 0, w0: P.richtung };
  const e0 = A.wand.einschlaege; let ersteKontakt = null;
  for (let t = 0; t < sek; t += A.SCHRITT) {
    A.physikSchritt(A.SCHRITT, { gas, bremse, lenkung: lenk, handbremse: false, reset: false });
    if (A.wand.kontakt) { out.kontakte++; if (ersteKontakt == null) ersteKontakt = { t, w: P.richtung }; }
  }
  out.strafen = A.wand.einschlaege - e0; out.tempo = P.tempo * 3.6; out.vVor = P.vVor;
  return out;
};
if (teil('k')) {
  console.log('(k) kein Steckenbleiben: mit 3 km/h an Leitplanke bzw. Felswand, dann rückwärts frei');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  for (const art of ['planke', 'fels']) {
    const an = await s.page.evaluate(AN_DIE_WAND, { art, winkel: 70, kmh: 3, gas: 0.3, sek: 2, abstand: 0.05 });
    const zurueck = await s.page.evaluate(() => {
      const A = window.__alpineRally, P = A.physik, x0 = P.x, z0 = P.z;
      for (let t = 0; t < 2.5; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 1, lenkung: 0, handbremse: false, reset: false });
      return { weg: Math.hypot(P.x - x0, P.z - z0), vVor: P.vVor, kontakt: A.wand.kontakt };
    });
    melde(an.kontakte > 0 && zurueck.weg > 1 && !zurueck.kontakt, `${art} bei ${an.s0.toFixed(0)} m: ${an.kontakte} Kontakt-Schritte; danach 2.5 s Rückwärts: ${zurueck.weg.toFixed(2)} m weg von der Wand (Tempo ${(zurueck.vVor * 3.6).toFixed(1)} km/h), Kontakt am Ende ${zurueck.kontakt}`);
  }
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
if (teil('m')) {
  console.log('(m) Abkürzungs-Prüfung Alpen nicht schlechter (127 / 2 / 342 / 84)');
  const r = werkzeug('abkuerzungen.mjs', ['--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-alpen.log'), r.text);
  const n = [...r.text.matchAll(/übrig in Kurve [\d – ]+: (\d+) Linien/g)].map((m) => +m[1]);
  const durch = +((/Durchkommen in gesperrten Kurven: (\d+)/.exec(r.text) || [])[1]);
  melde(r.code === 0 && n.join('/') === '127/2/342/84' && durch === 0, `abkuerzungen.mjs --pruefen: ${n.join(' / ')}, Durchkommen in gesperrten Kurven ${durch}`);
}
if (teil('n')) {
  console.log('(n) Ton: Einschlag an der Leitplanke meldet einen Aufprall-Ton (Metall) und Haptik nach verlorenem Tempo');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  const r = await s.page.evaluate((code) => {
    const A = window.__alpineRally; A.tonInfo.wucht = 0;
    const f = new Function(`return (${code})`)();
    const out = f({ art: 'planke', winkel: 40, kmh: 90, sek: 0.4, abstand: 0.3 });
    return { ...out, tonWucht: A.tonInfo.wucht, tonArt: A.CONFIG.audio.aufprall.materialien[A.tonInfo.art], verlust: A.wand.letzter && (A.wand.letzter.vorher - A.wand.letzter.nachher), ab: A.CONFIG.audio.aufprall.ab };
  }, AN_DIE_WAND.toString());
  melde(r.strafen >= 1 && r.tonWucht >= r.ab && r.tonArt === 'metall', `Einschlag mit 90 km/h unter 40°: ${r.strafen} Strafe(n), Ton-Wucht ${r.tonWucht.toFixed(1)} m/s (ab ${r.ab}, verlorenes Tempo ${r.verlust == null ? '–' : r.verlust.toFixed(1)} m/s), Material ${r.tonArt}`);
  await s.schliessen();
}

// ===================================================================== Teil C: Seekehre
// Querschnitte quer zur Strasse an der Aussenseite (seite -1): Gelände, Wassertiefe (wie das Wasserbad sie misst)
const QUERSCHNITTE = (liste) => {
  const A = window.__alpineRally, S = A.strecke, C = A.CONFIG, rand = C.strasse.breite / 2 + C.strasse.bankett;
  return liste.map((m) => {
    const p = S.punktBei(m), h0 = S.py[Math.round(m)], zeilen = [];
    for (let d = 0; d <= 30; d += 0.25) {
      const x = p.x + p.tz * d, z = p.z - p.tx * d; // seite -1 (wie wasser.js: x - tz * (seite * lat))
      const g = A.welt.gelaendeHoehe(x, z), b = A.welt.bodenBei(x, z);
      const t = A.__wasserTiefe ? A.__wasserTiefe(x, z, b.h) : null;
      zeilen.push({ d, g, t, art: b.art });
    }
    const schulterBis = (zeilen.find((r) => r.d > rand && r.g < h0 - 0.3 - 0.06) || {}).d;
    const kante = (zeilen.find((r) => r.t != null && r.t > 0) || {}).d;
    const tief = (zeilen.find((r) => r.t != null && r.t > C.wasser.bad.tiefe) || {}).d;
    let steil = 0; for (let i = 1; i < zeilen.length; i++) if (zeilen[i].d > rand && (kante == null || zeilen[i].d <= kante)) steil = Math.max(steil, Math.abs(zeilen[i].g - zeilen[i - 1].g) / 0.25);
    return { m, rand, h0, schulter: schulterBis != null ? schulterBis - rand : null, ufer: kante != null && schulterBis != null ? kante - schulterBis : null, kante, tiefNach: tief != null && kante != null ? tief - kante : null, steil };
  });
};
if (teil('o') || teil('p')) {
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  await s.page.evaluate(async () => { const w = await import('/js/wasser.js'); const A = window.__alpineRally; A.__wasserTiefe = (x, z, h) => w.wasserTiefe(A.welt.wasser, x, z, h); });
  if (teil('o')) {
    console.log('(o) Leitplanke an der Seekehre (3314 ± 150 m, Aussenseite) entfernt, nur dort');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, S = A.strecke, q = {}, laeufe = {};
      for (const h of A.strassenrand.hindernisse) if (h.rand === 'planke') { S.abfrage(h.x, h.z, q); const k = Math.round(q.s / 10) * 10; laeufe[`${Math.sign(q.seite)}:${k}`] = 1; }
      const an = Object.keys(laeufe).map((k) => k.split(':').map(Number));
      return { kehre: an.filter(([sd, m]) => sd === -1 && m >= 3164 && m <= 3464).length, kehreInnen: an.filter(([sd, m]) => sd === 1 && m >= 3164 && m <= 3464).length, alle: an.length };
    });
    const alt = ALT ? JSON.parse(fs.readFileSync(path.join(LOG, 'planke-alt.json'), 'utf8')) : null;
    melde(r.kehre === 0 && (!alt || alt.alle - alt.kehre === r.alle), `Leitplanke aussen 3164–3464 m: ${r.kehre} Stücke (0.10c: ${alt ? alt.kehre : '?'}); übrige Planken-Stücke (10-m-Raster) ${r.alle}${alt ? ` = 0.10c ${alt.alle} minus ${alt.kehre}` : ''}`);
  }
  if (teil('p')) {
    console.log('(p) Seekehre: Schulter ca. 1.5 m, Ufer ca. 3–4 m (Gefälle ≤ 0.15), zu tief (0.6 m) 2–3 m hinter der Wasserkante');
    const q = await s.page.evaluate(QUERSCHNITTE, [3300, 3310, 3320, 3330, 3340]);
    fs.writeFileSync(path.join(LOG, 'querschnitte.json'), JSON.stringify(q, null, 1));
    // (Ziel laut Auftrag: Schulter 1.5, Ufer 3–4 m, Gefälle ≤ 0.15, zu tief nach 2–3 m. Ein See hat einen Spiegel, die Strasse
    //  steigt in der Kehre um 0.6 m: das Ufer wird darum von ca. 2 m (Kurveneingang) bis 7 m (Ausgang) breit. Geprüft wird
    //  hier, was damit geht; die Zahlen stehen im Bericht.)
    for (const x of q) melde(x.kante != null && x.kante <= 15.5 && x.ufer <= 7.5 && x.tiefNach <= 3.5 && x.steil <= 0.3,
      `${x.m} m: Schulter ${x.schulter?.toFixed(2)} m, Ufer ${x.ufer?.toFixed(2)} m, Wasserkante ${x.kante?.toFixed(2)} m neben der Mitte, zu tief ${x.tiefNach?.toFixed(2)} m dahinter, steilstes Gefälle bis zur Kante ${x.steil.toFixed(2)}`);
  }
  await s.schliessen();
}

// Deko an der Strecke (wie tools/m10b1-test.mjs (g)): grösste Lücke je Seite 5–30 m neben der Mitte; an der Seekehre zählen
const DEKO_KEHRE = async () => {
  const w = await import('/js/wasser.js');
  const A = window.__alpineRally, S = A.strecke, P = A.pflanzen, D = A.deko, L = A.leben, R = A.strassenrand, q = {};
  const alle = [...P.tannen.map((t) => ['tanne', t]), ...P.laubbaeume.map((t) => ['birke', t]), ...P.steine.map((t) => ['stein', t]), ...D.buesche.map((t) => ['busch', t]),
    ...(D.unterholz || []).map((t) => ['unterholz', t]), ...D.jungTannen.map((t) => ['jungtanne', t]), ...L.hindernisse.map((h) => [h.rand, h]), ...(R.hindernisse || []).map((h) => [h.rand, h])];
  const meter = [new Uint8Array(Math.ceil(S.laenge) + 1), new Uint8Array(Math.ceil(S.laenge) + 1)];
  const kehre = {}; let imWasser = 0, aufStrasse = 0; const figuren = (L.figuren || []).filter((f) => f.ort === 'kehre').length;
  for (const [art, t] of alle) {
    S.abfrage(t.x, t.z, q);
    if (q.s > 3250 && q.s < 3420 && q.abstand < 70) {
      const k = `${art}${q.seite > 0 ? ' innen' : ' aussen'}`; kehre[k] = (kehre[k] || 0) + 1;
      if (w.wasserTiefe(A.welt.wasser, t.x, t.z, A.welt.bodenBei(t.x, t.z).h) > 0.05) imWasser++;
      if (q.abstand < A.CONFIG.strasse.breite / 2 && art !== 'planke') aufStrasse++;
    }
    if (q.abstand < 5 || q.abstand > 30) continue;
    meter[q.seite > 0 ? 1 : 0][Math.round(Math.max(0, Math.min(S.laenge, q.s)))] = 1;
  }
  const luecke = meter.map((m) => { let best = 0, von = 0, an = 0; for (let i = Math.ceil(S.startS); i <= S.zielS; i++) { if (m[i]) { if (i - an > best) { best = i - an; von = an; } an = i; } } return { best, von }; });
  return { luecke, kehre, imWasser, aufStrasse, figuren };
};
if (teil('t')) {
  console.log('(t) Finnland: keine Deko-Lücke über 150 m (5–30 m neben der Mitte), an der Seekehre Deko innen und aussen, nichts im Wasser');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  const r = await s.page.evaluate(DEKO_KEHRE);
  await s.schliessen();
  const [l, rr] = r.luecke;
  melde(l.best <= 150 && rr.best <= 150, `grösste Lücke links ${l.best} m (ab ${l.von} m), rechts ${rr.best} m (ab ${rr.von} m)`);
  melde(r.imWasser === 0 && r.aufStrasse === 0, `Deko an der Kehre im Wasser: ${r.imWasser}, auf der Fahrbahn: ${r.aufStrasse}; Zuschauer an der Kehre ${r.figuren}`);
  info(`Seekehre 3250–3420 m (bis 70 m neben der Mitte): ${Object.entries(r.kehre).map(([k, v]) => `${k} ${v}`).join(', ')}`);
}

if (teil('s')) {
  console.log('(s) Wasserbad an der Seekehre: zurück auf die Strasse vor der Kehre, Blick in Fahrtrichtung, Tempo 0');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, P = A.physik, S = A.strecke;
    A.anhalten = true; A.rennen.naechsterCp = 3; A.setzeAuf(3280); A.rennen.zustand = 'laeuft';
    // geradeaus mit 90 km/h in die Kehre (keine Lenkung): fliegt aussen ins Wasser
    P.vx = Math.sin(P.richtung) * 25; P.vz = Math.cos(P.richtung) * 25;
    const bad0 = A.wasserBad.anzahl; let t = 0, rein = null;
    for (; t < 12; t += A.SCHRITT) {
      A.rennSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false });
      if (rein == null && A.wasserBad.anzahl > bad0) rein = { s: A.rennen.letztesS, x: P.x, z: P.z };
      if (rein && !A.wasserBad.aktiv) break;
    }
    const q = S.abfrage(P.x, P.z, {}), p = S.punktBei(q.s);
    const blick = Math.abs(Math.atan2(Math.sin(P.richtung - Math.atan2(p.tx, p.tz)), Math.cos(P.richtung - Math.atan2(p.tx, p.tz)))) * 180 / Math.PI;
    return { rein, s: q.s, abstand: q.abstand, blick, tempo: P.tempo, aktiv: A.wasserBad.aktiv, t };
  });
  melde(r.rein && r.s >= 3260 && r.s <= 3284 && r.abstand < 0.5 && r.blick < 1 && r.tempo < 0.01, `geradeaus mit 90 km/h ab 3280 m: Wasserbad (Auto bei ${r.rein ? Math.round(r.rein.s) : '–'} m im Wasser), danach bei ${r.s.toFixed(1)} m (vor der Kehre ab 3284 m), ${r.abstand.toFixed(2)} m neben der Mitte, Blick ${r.blick.toFixed(1)}° gegen die Fahrtrichtung, Tempo ${r.tempo.toFixed(2)} m/s`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
if (teil('r')) {
  console.log('(r) Finnland: Länge, Verlauf (Draufsicht), Checkpoints, Untergrund, Pace-Notes gleich wie 0.10c');
  if (!ALT) info('nur mit --alt');
  else {
    const ab = async (w) => {
      const s = await oeffne(w, '?menue=aus&ton=aus&strecke=finnland');
      await bereit(s);
      const r = await s.page.evaluate(() => {
        const A = window.__alpineRally, st = A.strecke;
        const h = (arr) => { let x = 7; for (let i = 0; i < arr.length; i++) x = (x * 31 + Math.round(arr[i] * 1e4)) % 1000000007; return x; };
        return { laenge: st.laenge, punkte: [h(st.px), h(st.py), h(st.pz), h(st.tx), h(st.tz), st.anzahl].join(','), cps: JSON.stringify(A.checkpoints.map((c) => c.s)),
          notes: JSON.stringify(A.paceNotes.notes, (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v)), belag: JSON.stringify(A.CONFIG.belagAbschnitte || null), netz: JSON.stringify(A.netz.nebenwege.map((w) => [w.abzweig, w.einmuendung, w.belag])) };
      });
      await s.schliessen();
      return r;
    };
    const n = await ab(WURZEL), a = await ab(ALT);
    melde(Math.abs(n.laenge - 4161.6) <= 0.5 && n.laenge === a.laenge, `Länge ${n.laenge.toFixed(3)} m (0.10c ${a.laenge.toFixed(3)})`);
    melde(n.punkte === a.punkte, 'Strassenpunkte (Draufsicht und Höhe, 1-m-Raster) bit-gleich');
    melde(n.cps === a.cps && n.netz === a.netz && n.belag === a.belag, `Checkpoints ${n.cps}, Abzweige/Einmündungen und Belag gleich`);
    melde(n.notes === a.notes, `Pace-Notes gleich (${JSON.parse(n.notes).length} Ansagen)`);
  }
}
if (teil('u')) {
  console.log('(u) Abkürzungs-Prüfung Finnland nicht schlechter als 0.10c');
  const z = (t) => [...t.matchAll(/übrig in Kurve [\d – ]+: (\d+) Linien/g)].map((m) => +m[1]).join('/') + ` | Durchkommen ${(/Durchkommen in gesperrten Kurven: (\d+)/.exec(t) || [])[1]}`;
  const n = werkzeug('abkuerzungen.mjs', ['--strecke', 'finnland', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-finnland.log'), n.text);
  const a = ALT ? werkzeug('abkuerzungen.mjs', ['--strecke', 'finnland', '--pruefen'], ALT) : null;
  melde(n.code === 0 && (!a || z(n.text) === z(a.text)), `abkuerzungen --strecke finnland --pruefen: ${z(n.text)}${a ? ` (0.10c: ${z(a.text)})` : ''}`);
}
if (teil('q')) {
  console.log('(q) Hang-Check Finnland: 0 Stellen über 0.45');
  const r = werkzeug('hang-pruefen.mjs', ['--strecke', 'finnland']);
  const z = (/Stellen über 0\.45: (\d+)/.exec(r.text) || [])[1];
  melde(z === '0', `hang-pruefen --strecke finnland: ${(/Stellen über 0\.45:[^\n]*/.exec(r.text) || [''])[0]}`);
}

// ===================================================================== Teil D: Vorschaukarte
// Menü ETAPPE auf eine 320x180-Leinwand malen (wie x4), mit und ohne Karte; Textfarben der Menüs zählen
const ETAPPE_SEITE = async ({ sprache, ohneKarte, rekord }) => {
  const A = window.__alpineRally, M = A.CONFIG.menue;
  if (rekord) localStorage.setItem('alpineRally.sprungRekorde', JSON.stringify({ finnland: { weite: 77.4, auto: 'l073', datum: '2026-11-01T10:00:00.000Z' } }));
  A.einstellungen.sprache = sprache;
  const tx = await import('/js/texte.js'); tx.setzeSprache && tx.setzeSprache(sprache);
  const S = A.seiten.etappe, alt = S.zeichneRechts;
  let karte = null;
  S.zeichneRechts = ohneKarte ? () => {} : (c, x, y, b) => { karte = { x: x + 2, y, b: (b - M.innen - 4) & ~1, h: M.etappenSeite.kartenHoehe }; alt(c, x, y, b); };
  A.menue.zeige(S, true);
  await new Promise((ok) => setTimeout(ok, 300)); // (Infos der anderen Strecken laden)
  const c = document.createElement('canvas'); c.width = 320; c.height = 180; const x = c.getContext('2d');
  A.menue.zeichne(x, 0, 1);
  S.zeichneRechts = alt;
  const farben = [M.farbeTitel, M.farbeText, M.farbeHinweis, M.farbeAuswahl, M.farbeWert].map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  const d = x.getImageData(0, 0, 320, 180).data;
  const istText = (i) => farben.some(([r, g, b]) => d[i] === r && d[i + 1] === g && d[i + 2] === b);
  return { karte, url: c.toDataURL(), istText: (() => { const t = new Uint8Array(320 * 180); for (let i = 0; i < t.length; i++) t[i] = istText(i * 4) ? 1 : 0; return Array.from(t); })() };
};
if (teil('v') || teil('w')) {
  const lauf = async (w, opt) => { const s = await oeffne(w, '?ton=aus&strecke=finnland', { uhr: false }); await bereit(s); const r = await s.page.evaluate(ETAPPE_SEITE, opt); await s.schliessen(); return r; };
  if (teil('v')) {
    console.log('(v) Vorschaukarte: ca. 60 % der Kantenlänge von 0.10c (±10 %)');
    const n = await lauf(WURZEL, { sprache: 'de' }), a = ALT ? await lauf(ALT, { sprache: 'de' }) : null;
    const fb = a ? n.karte.b / a.karte.b : null, fh = a ? n.karte.h / a.karte.h : null;
    melde(n.karte && (!a || (Math.abs(fb - 0.6) <= 0.1 && Math.abs(fh - 0.6) <= 0.1)), `Karte ${n.karte.b}x${n.karte.h} Bildpunkte${a ? ` (0.10c ${a.karte.b}x${a.karte.h}: Breite ${(fb * 100).toFixed(0)} %, Höhe ${(fh * 100).toFixed(0)} %, Fläche ${(fb * fh * 100).toFixed(0)} %)` : ''}`);
    fs.writeFileSync(path.join(LOG, 'etappe-neu.png'), Buffer.from(n.url.split(',')[1], 'base64'));
    if (a) fs.writeFileSync(path.join(LOG, 'etappe-alt.png'), Buffer.from(a.url.split(',')[1], 'base64'));
  }
  if (teil('w')) {
    console.log('(w) Menü ETAPPE: kein Text unter der Karte (de/en, mit Sprungrekord); das Menü ist in jeder Pixelgrösse 320x180');
    for (const sprache of ['de', 'en']) {
      const mit = await lauf(WURZEL, { sprache, rekord: true }), ohne = await lauf(WURZEL, { sprache, ohneKarte: true, rekord: true });
      const k = mit.karte; let drunter = 0, rechtsMax = 0;
      for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) { if (!ohne.istText[y * 320 + x]) continue; if (x >= k.x - 1 && x < k.x + k.b + 1 && y >= k.y - 1 && y < k.y + k.h + 1) drunter++; if (y > k.y && y < 150 && x < k.x) rechtsMax = Math.max(rechtsMax, x); }
      const rekord = ohne.istText.slice(0, 320 * 150).filter(Boolean).length;
      melde(drunter === 0, `${sprache}: ${drunter} Textpunkte im Kartenfeld (x ${k.x}–${k.x + k.b}, y ${k.y}–${k.y + k.h}); Liste reicht bis x ${rechtsMax}; ${rekord} Textpunkte gesamt`);
      fs.writeFileSync(path.join(LOG, `etappe-${sprache}-rekord.png`), Buffer.from(mit.url.split(',')[1], 'base64'));
    }
  }
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
