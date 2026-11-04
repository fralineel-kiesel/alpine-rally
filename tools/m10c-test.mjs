// Meilenstein 10c prüfen (Sprünge mit Flugphase):  node tools/m10c-test.mjs --alt <ordner 0.10b.2> [--nur a,b,...] [--lang]
// (0.10b.2: git worktree add <ordner> ffca7c3). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein Safari.
// Vorlage: tools/m10b2-test.mjs. Buchstaben wie im Auftrag:
//   Teil A – Flugphase: (a) nie Flug ausserhalb einer Zone (Testfahrer, 5 Autos x 4 Stile, Alpen und Finnland),
//       (b) Alpen bit-gleich (siehe x1–x5), (c) Ballistik gegen Formel, (d) zu langsam bleibt am Boden,
//       (e) Landung parallel = 0 %, Nase voran > 0 %, (f) 1000 Zufallssprünge, (g) R / Pause / Wasser im Flug, (h) Prüfer
//   Unveränderlich (Alpen wie 0.10b.2): (x1) Länge/Abkürzungen, (x2) Testfahrer, (x3) Pace-Notes/Strecke, (x4) Bilder, (x5) Ton
//   (z) nur mit --lang: frühere Tests

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k) || (/^x\d$/.test(k) && NUR.includes('x1-5')); // --nur x1-5 = alle Alpen-Tests
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m10c';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M10C_AUTOS ? process.env.M10C_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const BASIS = 'ffca7c3'; // 0.10b.2
if (!ALT) info(`Vergleiche gegen 0.10b.2 nur mit --alt <ordner> (git worktree add <ordner> ${BASIS})`);

// Spiel öffnen. uhr: Playwright-Uhr vor dem Laden anhalten (Bilder in beiden Ständen gleich weit); speicher: localStorage
async function oeffne(wurzel, adresse = '', { uhr = false, speicher = null, route = null, auto, finnland = null } = {}) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360, ...(auto ? { auto } : {}) });
  s.fehler = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  if (route) await s.page.route('**/strecken/alpen.js', route);
  // M10c: Finnland mit anderem Inhalt (z. B. eingesetzter Sprungzone) unterschieben
  if (finnland) await s.page.route('**/strecken/finnland.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: finnland }));
  // uhr: eigene Bild-Uhr (nur Test): performance.now steht, bis der Test Bilder weiterschaltet; requestAnimationFrame
  // läuft nur auf Befehl (__bild). So bekommen beide Stände genau dieselben Zeitschritte, egal wie lange das Laden dauert.
  if (uhr) await s.page.addInitScript(() => {
    let jetzt = 0; const warte = [];
    performance.now = () => jetzt;
    window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
    window.cancelAnimationFrame = () => {};
    window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
    // Foto: noch ein Bild zeichnen und sofort 3D-Bild und HUD auslesen (in Grösse der HUD-Leinwand, scharfe Pixel)
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
  console.log('(x2) Alpen-Testfahrer: Prototyp und Autos gleich wie 0.10b.2 (Escorta ab Teil C: nur Schotterstellen)');
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
    if (id === 'escorta' && !gleich) { info(`escorta: ${zeiten} – absichtlich anders (Teil C, Schotter-Griff; siehe (o))`); continue; }
    melde(gleich, `${id}: ${zeiten} – ${zn.length} Zeilen (Zeiten, Checkpoints, Aufpralle, Abstände, Gänge, Nebenwege) ${gleich ? 'identisch' : 'ANDERS'} wie 0.10b.2${id === 'prototyp' ? ' (Referenz 2:59.33 / 2:42.35 / 2:31.92)' : ''}`);
    if (!gleich) for (let i = 0; i < Math.max(za.length, zn.length); i++) if (za[i] !== zn[i]) { info(`alt: ${za[i]}`); info(`neu: ${zn[i]}`); break; }
  }
}

// ===================================================================== (d) Pace-Notes, Checkpoints, Strecke
// M10c: neue CONFIG-Werte, die für die Alpen nichts ändern (je Teil ergänzt)
const NEU_WERTE = [];
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
    melde(anders === 0 && neu.notes.length >= 20, `Pace-Notes: ${neu.notes.length} Ansagen, Symbole/Zusätze/Stellen/Reihenfolge ${anders ? `${anders} anders` : 'identisch'} wie 0.10b.2`);
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
    melde(unterschiede.length === 0, `CONFIG (alle Werte, sortiert) gleich wie 0.10b.2${unterschiede.length ? `; anders: ${unterschiede.join(', ')}` : ''}`);
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
  console.log('(x4) Alpen-Bilder gegen 0.10b.2 (eigene Bild-Uhr, gleiche Seeds)');
  if (!ALT) info('nur mit --alt');
  else {
    const neu = await bilderVon(WURZEL), alt = await bilderVon(process.env.M10B_SELBST ? WURZEL : ALT); // (M10B_SELBST=1: Gegenkontrolle neu gegen neu)
    const s = await starteSpiel({ breite: 320, hoehe: 200 });
    await s.page.goto(`${s.url}/tools/leer.html`).catch(() => {});
    const paare = Object.keys(neu).filter((k) => k !== 'seiten' && k !== 'fehler').map((k) => [k, neu[k], alt[k]])
      .concat(Object.keys(neu.seiten).map((k) => [`menü ${k}`, neu.seiten[k], alt.seiten[k]]));
    const rot = [], nurVersion = [], neuGestaltet = [];
    // M10b.1: Seite ETAPPE zeigt die Finnland-Zeile (Länge, Vorschau-Karte) der neuen Strecke – absichtlich anders
    const NEU_GESTALTET = []; // (M10c: je Teil ergänzt)
    // Seit Teil F steht 0.10b.2 statt 0.10b.2 in der Versionszeile (Titel, Credits): dort darf genau diese eine Textzeile
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
    melde(rot.length === 0, `${paare.length} Bilder verglichen: ${paare.length - nurVersion.length - neuGestaltet.length} pixelgleich wie 0.10b.2, ${nurVersion.length} bis auf die Versionszeile, ${neuGestaltet.length} Menüseite(n) mit neuer Finnland-Zeile (Titel, Demo-Fahrt, Start, ${PUNKTE.length - 1} Streckenpunkte, fünf Autos am Start und auf der Passhöhe mit Tachos und Minimap, ${Object.keys(neu.seiten).length} Menüseiten inkl. Bestzeiten)${rot.length ? `; anders: ${rot.join(', ')}` : ''}`);
    if (nurVersion.length) info(`nur die Versionszeile anders (0.10b.2 -> 0.10b.2): ${nurVersion.join(', ')}`);
    if (neuGestaltet.length) info(`absichtlich anders (M10b.1, Finnland-Zeile): ${neuGestaltet.join(', ')}`);
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
    melde(geaendert.length === 0, `Ton-Code unverändert seit 0.10b.2 (${dateien.join(', ')}; umgebung.js geändert, Wirkung für die Alpen gleich)${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
    // Offline gerechnete Klänge (OfflineAudioContext): Messzahlen von ton-umgebung-test in beiden Ständen
    const zahlen = (t) => t.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x)).map((x) => x.replace(/\d+(\.\d+)? ?ms\b/g, 'X ms').trim());
    // Diese Zeilen messen in Echtzeit im laufenden Spiel (Tiefpass/Pegel mitten im Übergang, Zeitpunkt des Stopps,
    // Ton-Labor live): sie schwanken schon zwischen zwei Läufen desselben Stands (gemessen) und werden nur gemeldet.
    // "Pause: leise Variante" und "aus der Pause zum Hauptmenü" sind darum auch in 0.10b.2 manchmal rot (alte Wackel-Tests aus M7b);
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
    melde(zn.length > 20 && zn.length === za.length && anders.length === 0 && rotN === 0, `ton-umgebung-test (Glocken, Publikum, Vögel, Brunnen, Böen, Musik offline gerechnet): ${zn.length} Messzeilen, ohne die ${zn.filter((x) => ECHTZEIT.test(x)).length} Echtzeit-Zeilen ${anders.length ? `${anders.length} anders` : 'Zahl für Zahl gleich'} wie 0.10b.2 (rot: neu ${zn.filter((x) => x.startsWith('FEHLER')).length}, alt ${za.filter((x) => x.startsWith('FEHLER')).length}, nur Echtzeit-Zeilen)`);
    if (anders.length) info(`erste Abweichung: ${anders[0].slice(0, 200)}`);
  }
}

// ===================================================================== M10c Hilfen
const FI_DATEI = path.join(WURZEL, 'strecken/finnland.js');
// Finnland-Quelltext mit anderem Feld "sprung" (Liste von Objekten) – für Tests mit eingesetzten Zonen
function finnlandMit(sprung) {
  const t = fs.readFileSync(FI_DATEI, 'utf8');
  const a = t.indexOf('\n  sprung: ['), e = t.indexOf('\n  ],', a);
  return `${t.slice(0, a)}\n  sprung: ${JSON.stringify(sprung)},${t.slice(e + 5)}`;
}
// Test-Zone (Teil A): grosser Sprung an der Hochwaldkuppe, Form wie im Entwurf
const TEST_ZONE = { s: 3090, name: 'TESTKUPPE', von: 2890, bis: 3245, kante: 3090, landeVon: 3100, landeBis: 3160, form: { rampe: 0.12, gefaelle: 0.1, anlauf: 40, auslauf: 30 } };
// Im Browser: Auto vor die Kante setzen, Tempo geben, Schritte bis zur Landung (gibt Messwerte zurück)
const SPRUNG_FAHRT = ({ s, kmh, seite = 0, gier = 0, gas = 0, dt = null, maxT = 10 }) => {
  const A = window.__alpineRally, P = A.physik, F = A.flug;
  A.anhalten = true;
  A.setzeAuf(s, seite);
  P.richtung += gier * Math.PI / 180;
  P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
  const n0 = F.ereignis.landung, a0 = F.ereignis.abheben;
  const e = { gas, bremse: 0, lenkung: 0, handbremse: false };
  let unter = 0, nan = 0, luft = 0, tAb = null, abKmh = null;
  for (let t = 0; t < maxT; t += dt || A.SCHRITT) {
    A.physikSchritt(dt || A.SCHRITT, e, true);
    const h = A.welt.bodenBei(P.x, P.z).h;
    if (F.inLuft) { luft++; if (F.y < h - 1e-6) unter++; if (tAb == null) { tAb = t; abKmh = F.abTempo * 3.6; } }
    if (![P.x, P.z, P.vx, P.vz, F.y, F.vy].every(Number.isFinite)) nan++;
    if (F.ereignis.landung !== n0 && t > (tAb ?? 0) + 0.3) break;
  }
  const L = F.letzteLandung;
  return { abgehoben: F.ereignis.abheben - a0, gelandet: F.ereignis.landung - n0, inLuft: F.inLuft, unter, nan, luft, abKmh,
    weite: L.weite, zeit: L.zeit, hoehe: L.hoehe, verlust: L.verlust, vSenk: L.vSenk, nase: L.winkel, klasse: L.klasse, s: L.s, startS: L.startS };
};

// ===================================================================== (h) Prüfer: Sprungzonen
if (teil('h')) {
  console.log('(h) Prüfer: Sprungzonen (gültig und kaputte Varianten)');
  const { pruefeStrecke } = await import(pathToFileURL(path.join(WURZEL, 'js/streckenpruefung.js')).href);
  const basis = (await import(`${pathToFileURL(FI_DATEI).href}?h=${Date.now()}`)).default;
  const kopie = () => { const d = structuredClone(basis); d.sprung = [{ ...TEST_ZONE }]; return d; };
  const gut = pruefeStrecke(kopie(), { voll: true });
  melde(gut.length === 0, `Finnland mit Test-Zone gültig${gut.length ? `: ${gut.join('; ')}` : ''}`);
  const alt = structuredClone(basis); alt.sprung = [{ s: 487, name: 'ALT' }];
  melde(pruefeStrecke(alt, { voll: true }).length === 0, 'alte Markierung { s, name } ohne Zone bleibt gültig (abwärtskompatibel)');
  const faelle = [
    ['Zonen überlappen', (d) => { d.sprung = [{ ...TEST_ZONE }, { ...TEST_ZONE, s: 3200, name: 'B', kante: 3200, von: 3150, bis: 3400, landeVon: 3210, landeBis: 3250 }]; }, 'überlappt'],
    ['Landezone vor der Kante', (d) => { d.sprung[0].landeVon = 3080; }, 'nicht hinter der Kante'],
    ['Checkpoint in der Zone', (d) => { d.sprung[0] = { ...TEST_ZONE, s: 1000, kante: 1000, von: 850, bis: 1100, landeVon: 1010, landeBis: 1050 }; }, 'Checkpoint 1'],
    ['Checkpoint 50 m nach der Zone', (d) => { d.sprung[0] = { ...TEST_ZONE, s: 800, kante: 800, von: 620, bis: 950, landeVon: 810, landeBis: 850 }; }, 'Checkpoint 1'],
    ['Zone ausserhalb der Strecke', (d) => { d.sprung[0] = { ...TEST_ZONE, s: 4100, kante: 4100, von: 3950, bis: 4300, landeVon: 4110, landeBis: 4150 }; }, 'nicht auf der Strecke'],
    ['Landezone im See', (d) => { d.sprung[0] = { ...TEST_ZONE, s: 1150, kante: 1150, von: 1080, bis: 1300, landeVon: 1160, landeBis: 1200 }; d.checkpoints = [400, 1707, 2614, 3419]; }, 'im See'],
    ['Landezone am Fluss', (d) => { d.sprung[0] = { ...TEST_ZONE, s: 1460, kante: 1460, von: 1395, bis: 1560, landeVon: 1470, landeBis: 1500 }; }, 'am Fluss'],
    ['Zone ohne landeBis', (d) => { delete d.sprung[0].landeBis; }, 'braucht von, bis'],
    ['staerke 5', (d) => { d.sprung[0].staerke = 5; }, 'staerke'],
    ['rampe 0.9', (d) => { d.sprung[0].form = { rampe: 0.9 }; }, 'form.rampe'],
    ['Anlauf zu kurz', (d) => { d.sprung[0].von = 3040; }, 'Anlauf zu kurz'],
    ['Zone endet vor dem Auslauf', (d) => { d.sprung[0].bis = 3170; }, 'vor dem Auslauf'],
  ];
  let ok = 0;
  for (const [name, f, erwartet] of faelle) {
    const d = kopie(); f(d);
    const e = pruefeStrecke(d, { voll: true });
    if (e.some((x) => x.includes(erwartet))) ok++; else info(`nicht erkannt: ${name} -> ${e.join('; ') || 'keine Meldung'}`);
  }
  melde(ok === faelle.length, `${ok}/${faelle.length} kaputte Sprungzonen erkannt (${faelle.map((f) => f[0]).join(', ')})`);
  melde(pruefeStrecke((await import(pathToFileURL(path.join(WURZEL, 'strecken/alpen.js')).href)).default, { voll: true }).length === 0, 'Alpen weiterhin gültig');
}

// ===================================================================== (c) (d) (e) Ballistik, zu langsam, Landung
if (teil('c') || teil('d') || teil('e')) {
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland', { finnland: finnlandMit([TEST_ZONE]) });
  await bereit(s);
  // künstlicher Boden im Browser (echte Werte aus CONFIG.sprung, echte Klasse Flugphase)
  const kuenstlich = await s.page.evaluate(() => {
    const A = window.__alpineRally, Fl = A.flug.constructor, W = A.CONFIG.sprung, g = W.schwerkraft * W.SCHWERKRAFT_FAKTOR;
    const flug = (boden, kmh, zone) => {
      const F = new Fl(W, [zone]);
      const p = { x: -50, z: 0, vx: kmh / 3.6, vz: 0, richtung: Math.PI / 2 }, q = { s: 0, seite: 0, tx: 1, tz: 0 };
      for (let k = 0; k < 120 * 15; k++) {
        const xa = p.x; p.x += p.vx / 120; q.s = p.x + 1000;
        if (F.nachher(1 / 120, p, xa, 0, q, (x) => boden(x))) return { ...F.letzteLandung, abgehoben: true };
        if (p.x > 400) break;
      }
      return { abgehoben: F.ereignis.abheben > 0, weite: 0 };
    };
    const zone = { kante: 1000, von: 800, bis: 1400, landeVon: 1001, landeBis: 1390 };
    // (c) Rampe mit Steigung 0.12, Kante bei x = 0, danach ebener Boden auf Kantenhöhe: Weite = 2 v² tanθ / g
    const c = [70, 100, 130].map((kmh) => { const v = kmh / 3.6, r = flug((x) => (x < 0 ? 0.12 * x : 0), kmh, zone); return { kmh, weite: r.weite, formel: (2 * v * v * 0.12) / g }; });
    // (d) runde Kuppe mit Radius 30 m: abheben erst ab v² / R > g (ca. 62 km/h)
    const kuppe = (x) => (x < 0 ? 0 : -(x * x) / 60);
    const d = [40, 55, 75, 90].map((kmh) => ({ kmh, ab: flug(kuppe, kmh, zone).abgehoben, grenze: Math.sqrt(g * 30) * 3.6 }));
    // (e) Landung direkt: parallel zum Hang (Hang 11°, Flugbahn 12°, Nase 11°) und Nase voran (eben, Nase 15° tief), hart (eben, 10 m/s senkrecht)
    const landung = (gHang, vyAnteil, nickGrad, vy = null) => {
      const F = new Fl(W, [zone]); const v = 30;
      const p = { x: 0, z: 0, vx: v, vz: 0, richtung: Math.PI / 2 }, q = { s: 1050, seite: 0, tx: 1, tz: 0 };
      F.inLuft = true; F.vy = vy ?? v * vyAnteil; F.nick = nickGrad * Math.PI / 180;
      F.landen(p, q, (x) => gHang * x);
      return { verlust: F.letzteLandung.verlust, vSenk: F.letzteLandung.vSenk, nase: F.letzteLandung.winkel, klasse: F.letzteLandung.klasse };
    };
    const e = { parallel: landung(-0.2, -0.22, -11.3), nase: landung(0, 0, -15, -5), hart: landung(0, 0, 0, -10), schraeg: null };
    { const F = new Fl(W, [zone]); const p = { x: 0, z: 0, vx: 30 * Math.cos(0.6), vz: 30 * Math.sin(0.6), richtung: Math.PI / 2 - 0.6 }, q = { s: 1050, seite: 0, tx: 1, tz: 0 };
      F.inLuft = true; F.vy = 0; F.nick = 0; F.landen(p, q, () => 0); e.schraeg = { verlust: F.letzteLandung.verlust, gier: F.letzteLandung.gier }; }
    return { c, d, e };
  });
  if (teil('c')) {
    console.log('(c) Ballistik: Abhebetempo -> Flugweite gegen die Formel (±5 %), künstlich und auf der Test-Kuppe');
    for (const r of kuenstlich.c) melde(Math.abs(r.weite / r.formel - 1) <= 0.05, `Rampe 12 %, ${r.kmh} km/h: Weite ${r.weite.toFixed(2)} m, Formel 2·v²·tanθ/g = ${r.formel.toFixed(2)} m (${((r.weite / r.formel - 1) * 100).toFixed(1)} %)`);
    // echte Strecke: Wurfparabel aus Abhebepunkt, Tempo und Senkrecht-Tempo gegen das gezeichnete Strassenprofil
    for (const kmh of [80, 100, 120]) {
      const r = await s.page.evaluate(({ kmh, z }) => {
        const A = window.__alpineRally, P = A.physik, F = A.flug, S = A.strecke, g = A.CONFIG.sprung.schwerkraft * A.CONFIG.sprung.SCHWERKRAFT_FAKTOR;
        A.anhalten = true; A.setzeAuf(z.kante - 40);
        P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
        let start = null;
        for (let t = 0; t < 8; t += A.SCHRITT) {
          A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, true);
          if (F.inLuft && !start) start = { x: P.x, z: P.z, y: F.y, vy: F.vy, vx: P.vx, vz: P.vz };
          if (start && !F.inLuft) break;
        }
        // Vorhersage: Parabel (mit Luftwiderstand vernachlässigt) bis zum Boden, 1-cm-Schritte in der Zeit
        const v = Math.hypot(start.vx, start.vz);
        let t = 0, x = start.x, zz = start.z, y = start.y;
        while (t < 8) { t += 0.0005; x = start.x + start.vx * t; zz = start.z + start.vz * t; y = start.y + start.vy * t - 0.5 * g * t * t; if (y <= A.welt.bodenBei(x, zz).h) break; }
        return { weite: F.letzteLandung.weite, formel: Math.hypot(x - start.x, zz - start.z) + 0, ab: v * 3.6 };
      }, { kmh, z: TEST_ZONE });
      melde(Math.abs(r.weite / r.formel - 1) <= 0.05, `Test-Kuppe, Anfahrt ${kmh} km/h (ab ${r.ab.toFixed(0)} km/h): Weite ${r.weite.toFixed(1)} m, Wurfparabel auf dem Strassenprofil ${r.formel.toFixed(1)} m (${((r.weite / r.formel - 1) * 100).toFixed(1)} %)`);
    }
  }
  if (teil('d')) {
    console.log('(d) zu langsam: das Auto bleibt am Boden');
    const g = kuenstlich.d[0].grenze;
    melde(kuenstlich.d.every((r) => r.ab === (r.kmh > g)), `Kuppe Radius 30 m (Grenze v² / R = g bei ${g.toFixed(0)} km/h): ${kuenstlich.d.map((r) => `${r.kmh} km/h ${r.ab ? 'hebt ab' : 'bleibt am Boden'}`).join(', ')}`);
    for (const kmh of [30, 45]) {
      const r = await s.page.evaluate(SPRUNG_FAHRT, { s: TEST_ZONE.kante - 30, kmh, maxT: 6 });
      melde(r.abgehoben === 0 && r.luft === 0, `Test-Kuppe mit ${kmh} km/h (ohne Gas): bleibt am Boden (abgehoben ${r.abgehoben}x)`);
    }
  }
  if (teil('e')) {
    console.log('(e) Landung: parallel zum Hang = 0 %, Nase voran > 0 %');
    const { parallel: p, nase: n, hart: h, schraeg: g } = kuenstlich.e;
    melde(p.verlust === 0, `parallel zum Landehang (Hang 11.3°, Flugbahn 12.4°, Nase 11.3°): Verlust ${(p.verlust * 100).toFixed(1)} % (senkrecht ${p.vSenk.toFixed(2)} m/s, ${p.klasse})`);
    melde(n.verlust > 0, `Nase voran (eben, Nase 15° tief, senkrecht 5 m/s): Verlust ${(n.verlust * 100).toFixed(1)} %`);
    melde(h.verlust > 0.05 && h.verlust <= 0.35, `hart (eben, 10 m/s senkrecht, Nase gerade): Verlust ${(h.verlust * 100).toFixed(1)} % (höchstens 35 %)`);
    melde(g.verlust > 0 && g.verlust <= 0.1, `schräg gelandet (Gier ${g.gier.toFixed(0)}° zur Strasse): Verlust ${(g.verlust * 100).toFixed(1)} % (höchstens 10 %)`);
    const r100 = await s.page.evaluate(SPRUNG_FAHRT, { s: TEST_ZONE.kante - 40, kmh: 100 });
    const r130 = await s.page.evaluate(SPRUNG_FAHRT, { s: TEST_ZONE.kante - 40, kmh: 135 });
    melde(r100.verlust < 0.02 && r130.verlust > r100.verlust, `Test-Kuppe: Anfahrt 100 km/h ${r100.weite.toFixed(1)} m, Verlust ${(r100.verlust * 100).toFixed(1)} % (${r100.klasse}); 135 km/h ${r130.weite.toFixed(1)} m, Verlust ${(r130.verlust * 100).toFixed(1)} % (${r130.klasse})`);
  }
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

// ===================================================================== (f) 1000 Zufallssprünge
if (teil('f')) {
  console.log('(f) 1000 Zufallssprünge (Tempo, Gier, Seite, Auto, auch grosse Zeitschritte): nie unter dem Boden, nie NaN, nie hängen');
  const sum = { n: 0, ab: 0, unter: 0, nan: 0, haengt: 0, unfall: 0, notbremse: 0, maxWeite: 0, maxVerlust: 0 };
  for (const id of AUTOS) {
    const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=finnland&auto=${id}`, { finnland: finnlandMit([TEST_ZONE]), auto: id });
    await bereit(s);
    const r = await s.page.evaluate(({ z, n, seed }) => {
      let x = seed; const zufall = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
      const A = window.__alpineRally, P = A.physik, F = A.flug, W = A.CONFIG.sprung;
      const e = { gas: 0, bremse: 0, lenkung: 0, handbremse: false };
      const o = { n: 0, ab: 0, unter: 0, nan: 0, haengt: 0, unfall: 0, notbremse: 0, maxWeite: 0, maxVerlust: 0 };
      A.anhalten = true;
      for (let i = 0; i < n; i++) {
        const kmh = 20 + zufall() * 150, seite = (zufall() - 0.5) * 10, gier = (zufall() - 0.5) * 50, drift = (zufall() - 0.5) * 20;
        const dt = [A.SCHRITT, A.SCHRITT, 1 / 60, 1 / 20][Math.floor(zufall() * 4)];
        A.setzeAuf(z.kante - 15 - zufall() * 30, seite);
        P.richtung += gier * Math.PI / 180;
        const w = P.richtung + drift * Math.PI / 180;
        P.vx = Math.sin(w) * kmh / 3.6; P.vz = Math.cos(w) * kmh / 3.6;
        e.gas = zufall(); e.lenkung = (zufall() - 0.5) * 2; e.handbremse = zufall() < 0.1;
        const a0 = F.ereignis.abheben, l0 = F.ereignis.landung;
        let t = 0;
        for (; t < 9; t += dt) {
          A.physikSchritt(dt, e, true);
          const h = A.welt.bodenBei(P.x, P.z).h;
          if (F.inLuft && F.y < h - 1e-6) o.unter++;
          if (![P.x, P.z, P.vx, P.vz, F.y, F.vy, F.nick].every(Number.isFinite)) { o.nan++; break; }
          if (F.ereignis.landung > l0 && !F.inLuft && t > 0.5) break;
        }
        o.n++;
        if (F.ereignis.abheben > a0) {
          o.ab++;
          if (F.inLuft) o.haengt++;
          if (F.letzteLandung.zeit > W.maxFlugZeit - 0.01) o.notbremse++;
          o.maxWeite = Math.max(o.maxWeite, F.letzteLandung.weite); o.maxVerlust = Math.max(o.maxVerlust, F.letzteLandung.verlust);
        }
        // nach der Landung weiterfahren: kommt das Auto vom Fleck (kein Steckenbleiben)?
        // (vorwärts 1 s Vollgas, sonst rückwärts 2 s: steht es nach einem Unfall vor einem Baum, kommt es rückwärts weg)
        const x0 = P.x, z0 = P.z;
        for (let k = 0; k < 120; k++) A.physikSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false }, true);
        if (Math.hypot(P.x - x0, P.z - z0) < 0.5) {
          o.unfall++;
          for (let k = 0; k < 240; k++) A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 1, lenkung: 0, handbremse: false }, true);
          if (Math.hypot(P.x - x0, P.z - z0) < 0.5) o.haengt++;
        }
      }
      return o;
    }, { z: TEST_ZONE, n: 200, seed: 7 + AUTOS.indexOf(id) });
    for (const k of Object.keys(sum)) sum[k] = /^max/.test(k) ? Math.max(sum[k], r[k]) : sum[k] + r[k];
    info(`${id}: ${r.n} Versuche, ${r.ab} abgehoben, unter dem Boden ${r.unter}, NaN ${r.nan}, hängt ${r.haengt}, Unfall (vorwärts blockiert, rückwärts frei) ${r.unfall}, Notbremse ${r.notbremse}`);
    if (s.fehler.length) info(`Konsole ${id}: ${s.fehler.join(' | ')}`);
    sum.konsole = (sum.konsole || 0) + s.fehler.length;
    await s.schliessen();
  }
  melde(sum.n === 1000 && sum.ab > 500 && sum.unter === 0 && sum.nan === 0 && sum.haengt === 0 && sum.notbremse === 0 && !sum.konsole,
    `${sum.n} Sprünge (${sum.ab} abgehoben): unter dem Boden ${sum.unter}, NaN ${sum.nan}, hängen/stecken ${sum.haengt}, Notbremse ${sum.notbremse}; weitester ${sum.maxWeite.toFixed(1)} m, grösster Verlust ${(sum.maxVerlust * 100).toFixed(1)} %`);
}

// ===================================================================== (g) R / Pause / Wasser / Checkpoint im Flug
if (teil('g')) {
  console.log('(g) R, Pause, Wasser-Teleport und Checkpoint-Meldung im Flug: Zustand sauber');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland', { finnland: finnlandMit([TEST_ZONE]), uhr: true });
  await bereit(s);
  await bilder(s, 2);
  const inDieLuft = (s2) => s2.page.evaluate((z) => {
    const A = window.__alpineRally, P = A.physik, F = A.flug;
    A.anhalten = true; A.setzeAuf(z.kante - 40);
    P.vx = Math.sin(P.richtung) * 110 / 3.6; P.vz = Math.cos(P.richtung) * 110 / 3.6;
    for (let t = 0; t < 4 && !F.inLuft; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false }, true);
    for (let k = 0; k < 20; k++) A.physikSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false }, true);
    return { inLuft: F.inLuft, ueber: F.ueberBoden };
  }, TEST_ZONE);
  const danach = (s2) => s2.page.evaluate(() => {
    const A = window.__alpineRally, P = A.physik, F = A.flug, h = A.welt.bodenBei(P.x, P.z).h;
    const r = { inLuft: F.inLuft, bereit: F.bereit, tempo: P.tempo, luft: 0, nan: 0 };
    for (let k = 0; k < 240; k++) { A.physikSchritt(A.SCHRITT, { gas: 0.5, bremse: 0, lenkung: 0, handbremse: false }, true); if (F.inLuft) r.luft++; if (![P.x, P.z, F.y].every(Number.isFinite)) r.nan++; }
    A.autoZeichnen(1 / 60, 0);
    r.yAuto = A.autoModell.objekt.position.y - A.welt.bodenBei(P.x, P.z).h; r.h = h;
    return r;
  });
  const fall = async (name, aktion, pruefe) => {
    const a = await inDieLuft(s);
    await s.page.evaluate(aktion);
    const r = await danach(s);
    melde(a.inLuft && pruefe(r), `${name}: vorher in der Luft (${a.ueber.toFixed(2)} m), danach inLuft ${r.inLuft}, ${r.luft} Flugschritte in 2 s, NaN ${r.nan}, Auto ${r.yAuto.toFixed(2)} m über dem Boden`);
  };
  // R (sofort, ausserhalb des Rennens) und R-Countdown im Rennen
  await fall('Taste R (sofort auf die Strasse)', () => window.__alpineRally.rTaste(), (r) => !r.inLuft && r.luft === 0 && r.nan === 0 && Math.abs(r.yAuto) < 0.6);
  await fall('Wasser-Teleport (setzeAuf auf die letzte sichere Stelle)', () => { const A = window.__alpineRally; A.setzeAuf(A.strecke.sprungZonen[0].von - 100); }, (r) => !r.inLuft && r.luft === 0 && r.nan === 0 && Math.abs(r.yAuto) < 0.6);
  // R-Countdown im laufenden Rennen: fliegt zu Ende, landet, dann zurück auf die Strasse
  {
    await inDieLuft(s);
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, F = A.flug, P = A.physik;
      A.rennen.zustand = 'laeuft'; A.rennen.naechsterCp = A.checkpoints.length; const antwort = A.rTaste(), n0 = A.rueck.anzahl, warte = A.rueck.rest; let nan = 0, k = 0, luftDanach = 0;
      for (; k < 120 * 8 && A.rueck.anzahl === n0; k++) { A.physikSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 1, handbremse: false }); if (![P.x, P.z, F.y].every(Number.isFinite)) nan++; }
      const q = A.strecke.abfrage(P.x, P.z, {}), r = { antwort, warte, inLuft: F.inLuft, tempo: P.tempo, abstand: q.abstand, nan, gesetzt: A.rueck.anzahl - n0 };
      for (let j = 0; j < 240; j++) { A.physikSchritt(A.SCHRITT, { gas: 0.5, bremse: 0, lenkung: 0, handbremse: false }); if (F.inLuft) luftDanach++; }
      return { ...r, luftDanach };
    });
    melde(r.antwort === 'countdown' && r.gesetzt === 1 && !r.inLuft && r.tempo < 0.01 && r.abstand < 0.5 && r.nan === 0 && r.luftDanach === 0, `R-Countdown (${r.warte} s) im Rennen während des Flugs: "${r.antwort}", danach mitten auf der Strasse (Abstand ${r.abstand.toFixed(2)} m, Tempo ${r.tempo.toFixed(2)}, nicht in der Luft), 2 s weiter ohne Flug`);
  }
  // Pause im Flug (echte Spielschleife): nichts bewegt sich, danach fliegt es weiter und landet
  {
    await inDieLuft(s);
    const vor = await s.page.evaluate(() => { const A = window.__alpineRally; A.rennen.zustand = 'laeuft'; A.anhalten = false; A.pausieren(); return { x: A.physik.x, y: A.flug.y, inLuft: A.flug.inLuft, zustand: A.ablauf.zustand }; });
    await bilder(s, 60);
    const mitte = await s.page.evaluate(() => { const A = window.__alpineRally; return { x: A.physik.x, y: A.flug.y, inLuft: A.flug.inLuft }; });
    await s.page.evaluate(() => window.__alpineRally.weiter());
    await bilder(s, 240);
    const nach = await s.page.evaluate(() => { const A = window.__alpineRally; return { inLuft: A.flug.inLuft, landungen: A.flug.ereignis.landung }; });
    melde(vor.zustand === 'pause' && vor.inLuft && mitte.x === vor.x && mitte.y === vor.y && mitte.inLuft && !nach.inLuft, `Pause im Flug: 1 s Pause, Auto steht in der Luft still (x und Höhe gleich), danach gelandet`);
  }
  // Checkpoint-Meldung während des Flugs: Checkpoint knapp hinter der Kante (nur Test), Flug läuft weiter
  {
    await inDieLuft(s);
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, F = A.flug, P = A.physik, q = A.strecke.abfrage(P.x, P.z, {});
      A.anhalten = true; A.rennen.zustand = 'laeuft'; A.rennen.naechsterCp = 0; const n0 = A.rennen.naechsterCp, cp = A.checkpoints[n0], alt = cp.s;
      A.rennen.letztesS = q.s; cp.s = q.s + 3; // Tor 3 m vor dem fliegenden Auto
      let durch = false, nan = 0;
      for (let k = 0; k < 120 * 3; k++) { A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false }); if (A.rennen.naechsterCp > n0) durch = true; if (![P.x, P.z, F.y].every(Number.isFinite)) nan++; }
      cp.s = alt;
      return { durch, gelandet: !F.inLuft, nan };
    });
    melde(r.durch && r.gelandet && r.nan === 0, `Checkpoint im Flug durchfahren: Zwischenzeit gezählt ${r.durch}, danach normal gelandet`);
  }
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

// ===================================================================== (a) nie Flug ausserhalb einer Zone
// Testfahrer (strecke-abfahren, --json) je Auto und Strecke in vier Stilen; Ergebnis wird für spätere Tests gemerkt
const STILE4 = 'vorsichtig,mittel,flott,digital';
const sprungLaeufe = {};
function sprungLauf(strecke, id, wurzel = WURZEL, datei = null) {
  const k = `${wurzel}|${strecke}|${id}|${datei || ''}`;
  if (sprungLaeufe[k]) return sprungLaeufe[k];
  const json = path.join(LOG, `lauf-${strecke}-${id}${wurzel === WURZEL ? '' : '-alt'}${datei ? '-datei' : ''}.json`);
  const r = werkzeug('strecke-abfahren.mjs', [...(datei ? [datei] : ['--strecke', strecke]), '--auto', id, '--stil', STILE4, '--json', json, '--aus', json.replace('.json', '.txt')], wurzel);
  const d = fs.existsSync(json) ? JSON.parse(fs.readFileSync(json, 'utf8')) : { stile: [] };
  return (sprungLaeufe[k] = { ...d, code: r.code, text: r.text });
}
if (teil('a')) {
  console.log('(a) Testfahrer: ausserhalb von Sprungzonen nie in der Luft (5 Autos x 4 Stile, Alpen und Finnland)');
  for (const strecke of ['alpen', 'finnland']) {
    const zeilen = [];
    let aussen = 0, luft = 0, spruenge = 0, laeufe = 0;
    for (const id of AUTOS) {
      const r = sprungLauf(strecke, id);
      for (const st of r.stile) { laeufe++; aussen += st.ausserhalb; luft += st.luftSchritte; spruenge += st.spruenge.length; }
      zeilen.push(`${id} ${r.stile.map((st) => `${st.stil[0]}:${st.spruenge.length}`).join(' ')}`);
    }
    const zonen = strecke === 'alpen' ? 0 : (await import(`${pathToFileURL(FI_DATEI).href}?a=${Date.now()}`)).default.sprung.filter((z) => z.von != null).length;
    melde(laeufe === AUTOS.length * 4 && aussen === 0 && (zonen > 0 || luft === 0), `${strecke}: ${laeufe} Läufe, ${zonen} Sprungzonen, ${spruenge} Sprünge, Flugschritte ausserhalb einer Zone ${aussen}${zonen ? '' : `, Flugschritte überhaupt ${luft}`} (${zeilen.join('; ')})`);
  }
}
