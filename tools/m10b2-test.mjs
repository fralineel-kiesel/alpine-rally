// Meilenstein 10b.2 prüfen:  node tools/m10b2-test.mjs --alt <ordner 0.10b.1> [--nur a,b,...] [--lang]
// (0.10b.1: git worktree add <ordner> a289fad). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein Safari.
// Vorlage: tools/m10b1-test.mjs. Buchstaben wie im Auftrag:
//   Teil A – Hang: (a) Hang-Check Finnland + Prüfer boeschung, (b) Meter 969: hineinrollen und herausfahren,
//       (c) Finnland-Strasse/Pace-Notes/Checkpoints/Länge gleich, Testfahrer-Zeiten gleich, Abkürzungen, (d) Alpen-Hang-Bericht,
//       (e) Bild Meter 969 alt/neu
//   Teil B – Wasser: (f) tiefer See, (g) flaches Ufer, (h) Eingaben gesperrt, (i) Alpen ohne Wasser, (j) Ton
//   Teil C – Escorta: (k) Tabelle Autos x Stile, (l) nur Escorta/Schotter, (m) Kurzmessungen, (n) Alpen, (o) Garage-Text
//   Teil D – Rentier-Ton: (p) Reichweite/Stereo/Abstand, (q) Alpen ohne, (r) Pause, (s) kein Objekt pro Bild
//   Teil E – Schatten: (t) Alpen pixelgleich, (u) Schatten unter allen Autos, (v) SCHATTEN AUS, (w) kein Flackern, (x) Bildzeit
//   Unveränderlich (Alpen wie 0.10b.1): (x1) Länge/Abkürzungen, (x2) Testfahrer, (x3) Pace-Notes/Strecke, (x4) Bilder, (x5) Ton
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
const LOG = '/tmp/m10b2';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M10B2_AUTOS ? process.env.M10B2_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const BASIS = 'a289fad'; // 0.10b.1
if (!ALT) info(`Vergleiche gegen 0.10b.1 nur mit --alt <ordner> (git worktree add <ordner> ${BASIS})`);

// Spiel öffnen. uhr: Playwright-Uhr vor dem Laden anhalten (Bilder in beiden Ständen gleich weit); speicher: localStorage
async function oeffne(wurzel, adresse = '', { uhr = false, speicher = null, route = null, auto } = {}) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360, ...(auto ? { auto } : {}) });
  s.fehler = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  if (route) await s.page.route('**/strecken/alpen.js', route);
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
  console.log('(x2) Alpen-Testfahrer: Prototyp und Autos gleich wie 0.10b.1 (Escorta ab Teil C: nur Schotterstellen)');
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
    melde(gleich, `${id}: ${zeiten} – ${zn.length} Zeilen (Zeiten, Checkpoints, Aufpralle, Abstände, Gänge, Nebenwege) ${gleich ? 'identisch' : 'ANDERS'} wie 0.10b.1${id === 'prototyp' ? ' (Referenz 2:59.33 / 2:42.35 / 2:31.92)' : ''}`);
    if (!gleich) for (let i = 0; i < Math.max(za.length, zn.length); i++) if (za[i] !== zn[i]) { info(`alt: ${za[i]}`); info(`neu: ${zn[i]}`); break; }
  }
}

// ===================================================================== (d) Pace-Notes, Checkpoints, Strecke
// M10b.2: weitere neue CONFIG-Werte, die für die Alpen nichts ändern (je Teil ergänzt)
const NEU_WERTE = [
  (c) => { delete c.wasserAn; if (c.wasser) delete c.wasser.bad; }, // Teil B: Wasserbad (Alpen: kein Wasser)
  (c) => { if (c.auto) for (const k of ['schotterHeck', 'schotterStabil', 'schotterTraktion']) delete c.auto[k]; // Teil C: Escorta (nur Schotter)
    const e = c.fahrprofile && c.fahrprofile.escorta && c.fahrprofile.escorta.auto; if (e) for (const k of ['schotterGrip', 'schotterHeck', 'schotterStabil', 'schotterTraktion']) delete e[k]; },
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
    melde(anders === 0 && neu.notes.length >= 20, `Pace-Notes: ${neu.notes.length} Ansagen, Symbole/Zusätze/Stellen/Reihenfolge ${anders ? `${anders} anders` : 'identisch'} wie 0.10b.1`);
    melde(neu.checkpoints === alt.checkpoints, `Checkpoints gleich (${neu.checkpoints})`);
    melde(neu.abschnitte === alt.abschnitte, 'Abschnitte gleich (Namen, Bäume, Wald, Felswand, von/bis)');
    melde(neu.punkte === alt.punkte && neu.laenge === alt.laenge && neu.start === alt.start && neu.ziel === alt.ziel, `Strassenpunkte (1-m-Raster, Richtung, Felswand, Baumdichte) bit-gleich, Länge ${neu.laenge} = ${alt.laenge}`);
    // CONFIG: gleich bis auf die Reihenfolge innerhalb von "leben" (Seeds kommen aus "seeds") und die Version
    // (M10b: Fahnen-Art 'kreuz' heisst jetzt 'motiv' = Landesfahne der Strecke; gleiche Wirkung, darum gleichgesetzt)
    const ordne = (o) => (Array.isArray(o) ? o.map(ordne) : o && typeof o === 'object' ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, ordne(o[k])])) : o === 'motiv' ? 'kreuz' : o);
    const cn = ordne(JSON.parse(neu.config)), ca = ordne(JSON.parse(alt.config));
    const NEU_M10B = ['wasserAn', 'rentierKlang']; // neue Blöcke in M10b.2 (wasserAn: Strecke hat Wasser, Alpen false)
    // neue Werte innerhalb der Blöcke (M10b.2, für die Alpen wirkungslos): gelaende.boeschung (Alpen null), NEU_WERTE
    for (const c of [cn, ca]) { if (c.gelaende) delete c.gelaende.boeschung; for (const f of NEU_WERTE) f(c); }
    const unterschiede = Object.keys({ ...ca, ...cn }).filter((k) => !NEU_M10B.includes(k) && JSON.stringify(ca[k]) !== JSON.stringify(cn[k]));
    melde(unterschiede.length === 0, `CONFIG (alle Werte, sortiert) gleich wie 0.10b.1${unterschiede.length ? `; anders: ${unterschiede.join(', ')}` : ''}`);
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
  console.log('(x4) Alpen-Bilder gegen 0.10b.1 (eigene Bild-Uhr, gleiche Seeds)');
  if (!ALT) info('nur mit --alt');
  else {
    const neu = await bilderVon(WURZEL), alt = await bilderVon(process.env.M10B_SELBST ? WURZEL : ALT); // (M10B_SELBST=1: Gegenkontrolle neu gegen neu)
    const s = await starteSpiel({ breite: 320, hoehe: 200 });
    await s.page.goto(`${s.url}/tools/leer.html`).catch(() => {});
    const paare = Object.keys(neu).filter((k) => k !== 'seiten' && k !== 'fehler').map((k) => [k, neu[k], alt[k]])
      .concat(Object.keys(neu.seiten).map((k) => [`menü ${k}`, neu.seiten[k], alt.seiten[k]]));
    const rot = [], nurVersion = [], neuGestaltet = [];
    // M10b.1: Seite ETAPPE zeigt die Finnland-Zeile (Länge, Vorschau-Karte) der neuen Strecke – absichtlich anders
    const NEU_GESTALTET = ['menü etappe'];
    // Seit Teil F steht 0.10b.2 statt 0.10b.1 in der Versionszeile (Titel, Credits): dort darf genau diese eine Textzeile
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
    melde(rot.length === 0, `${paare.length} Bilder verglichen: ${paare.length - nurVersion.length - neuGestaltet.length} pixelgleich wie 0.10b.1, ${nurVersion.length} bis auf die Versionszeile, ${neuGestaltet.length} Menüseite(n) mit neuer Finnland-Zeile (Titel, Demo-Fahrt, Start, ${PUNKTE.length - 1} Streckenpunkte, fünf Autos am Start und auf der Passhöhe mit Tachos und Minimap, ${Object.keys(neu.seiten).length} Menüseiten inkl. Bestzeiten)${rot.length ? `; anders: ${rot.join(', ')}` : ''}`);
    if (nurVersion.length) info(`nur die Versionszeile anders (0.10b.1 -> 0.10b.2): ${nurVersion.join(', ')}`);
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
    melde(geaendert.length === 0, `Ton-Code unverändert seit 0.10b.1 (${dateien.join(', ')}; umgebung.js geändert, Wirkung für die Alpen gleich)${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
    // Offline gerechnete Klänge (OfflineAudioContext): Messzahlen von ton-umgebung-test in beiden Ständen
    const zahlen = (t) => t.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x)).map((x) => x.replace(/\d+(\.\d+)? ?ms\b/g, 'X ms').trim());
    // Diese Zeilen messen in Echtzeit im laufenden Spiel (Tiefpass/Pegel mitten im Übergang, Zeitpunkt des Stopps,
    // Ton-Labor live): sie schwanken schon zwischen zwei Läufen desselben Stands (gemessen) und werden nur gemeldet.
    // "Pause: leise Variante" und "aus der Pause zum Hauptmenü" sind darum auch in 0.10b.1 manchmal rot (alte Wackel-Tests aus M7b);
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
    melde(zn.length > 20 && zn.length === za.length && anders.length === 0 && rotN === 0, `ton-umgebung-test (Glocken, Publikum, Vögel, Brunnen, Böen, Musik offline gerechnet): ${zn.length} Messzeilen, ohne die ${zn.filter((x) => ECHTZEIT.test(x)).length} Echtzeit-Zeilen ${anders.length ? `${anders.length} anders` : 'Zahl für Zahl gleich'} wie 0.10b.1 (rot: neu ${zn.filter((x) => x.startsWith('FEHLER')).length}, alt ${za.filter((x) => x.startsWith('FEHLER')).length}, nur Echtzeit-Zeilen)`);
    if (anders.length) info(`erste Abweichung: ${anders[0].slice(0, 200)}`);
  }
}

// ===================================================================== (j) Ladezeit, Bildzeit, Garbage, Grösse
async function leistung(wurzel, extra = '', sM = 2610) {
  const s = await oeffne(wurzel, `?menue=aus&ton=aus${extra}`);
  await bereit(s);
  const cdp = await s.page.context().newCDPSession(s.page);
  const heap = async () => { for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  await s.page.evaluate((sM) => { const A = window.__alpineRally; A.setzeAuf(sM); A.kameraSofort(); }, sM);
  await s.page.waitForTimeout(1500);
  // Garbage: Speicher vor und nach 4 s Fahren im Rennen (Testfahrer-Gas), ohne GC dazwischen gemessen über die Zunahme
  const h0 = await heap();
  const r = await s.page.evaluate(async () => {
    const A = window.__alpineRally; A.testEingabe = { gas: 1 };
    const m0 = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const t0 = performance.now(); let n = 0;
    await new Promise((ok) => { const f = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else ok(); }; requestAnimationFrame(f); });
    const ms = (performance.now() - t0) / n;
    const m1 = performance.memory ? performance.memory.usedJSHeapSize : 0;
    A.testEingabe = null;
    return { ms, n, zuwachs: m1 - m0 };
  });
  const h1 = await heap();
  await s.schliessen();
  return { ...r, rest: h1 - h0 };
}

// ===================================================================== Teil A: Hang (a)–(e)
const { hangPruefen, hangText, GRENZEN } = await import('./hang-pruefen.mjs');
// Finnland-Referenz 0.10b.1 (Testfahrer, strecke-abfahren): vorsichtig / mittel / flott
const FI_REF = { prototyp: '2:55.88 / 2:39.06 / 2:28.61', rt4: '2:55.53 / 2:38.81 / 2:31.98', delto: '2:55.49 / 2:38.84 / 2:28.64',
  escorta: '2:53.72 / 2:38.24 / 2:30.63', l073: '2:54.53 / 2:50.53 / 2:43.15', imprexa: '2:55.18 / 2:38.78 / 2:36.62' };
const sek = (t) => { const [m, s] = t.split(':'); return +m * 60 + +s; };
// Finnland abfahren (strecke-abfahren, je Auto einmal, für (c) und später (k))
const abfahrten = {};
function abfahren(id, extra = [], wurzel = WURZEL) {
  const schluessel = `${wurzel}|${id}|${extra.join(' ')}`;
  if (abfahrten[schluessel]) return abfahrten[schluessel];
  const r = werkzeug('strecke-abfahren.mjs', ['--strecke', 'finnland', '--auto', id, '--aus', path.join(LOG, `abfahren-${id}${extra.join('')}${wurzel === WURZEL ? '' : '-alt'}.txt`), ...extra], wurzel);
  const zeiten = (/Gesamtzeiten: (.*)/.exec(r.text) || [])[1] || '';
  const aufpralle = [...r.text.matchAll(/Aufpralle (\d+)/g)].map((m) => +m[1]);
  return (abfahrten[schluessel] = { zeiten: zeiten.trim(), aufpralle, text: r.text });
}
// Hang hinunterrollen (Tempo km/h, quer zur Strasse, 4 m links) und rückwärts wieder hinauf
async function hangFahrt(wurzel, sM, kmh = 20) {
  const s = await oeffne(wurzel, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  const r = await s.page.evaluate(({ sM, kmh }) => {
    const A = window.__alpineRally, S = A.strecke, P = A.physik, W = A.welt, q = {};
    A.anhalten = true;
    const p = S.punktBei(sM);
    P.reset(p.x + p.tz * 4, p.z - p.tx * 4, Math.atan2(p.tz, -p.tx));
    P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
    const neig = () => { const x = P.x, z = P.z, lx = Math.cos(P.richtung), lz = -Math.sin(P.richtung), fx = Math.sin(P.richtung), fz = Math.cos(P.richtung);
      const hl = W.bodenBei(x + lx * 0.8, z + lz * 0.8).h, hr = W.bodenBei(x - lx * 0.8, z - lz * 0.8).h, hv = W.bodenBei(x + fx * 1.3, z + fz * 1.3).h, hh = W.bodenBei(x - fx * 1.3, z - fz * 1.3).h;
      return Math.max(Math.abs(Math.atan2(hl - hr, 1.6)), Math.abs(Math.atan2(hv - hh, 2.6))) * 180 / Math.PI; };
    let lat = 0, maxNeig = 0, tief = 0;
    for (let t = 0; t < 6; t += A.SCHRITT) { A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, true); S.abfrage(P.x, P.z, q); lat = Math.max(lat, q.abstand); maxNeig = Math.max(maxNeig, neig()); tief = Math.min(tief, W.bodenBei(P.x, P.z).h - S.py[Math.round(sM)]); }
    const stand = P.tempo * 3.6;
    let raus = null;
    for (let t = 0; t < 20; t += A.SCHRITT) { A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 1, lenkung: 0, handbremse: false }, true); S.abfrage(P.x, P.z, q); maxNeig = Math.max(maxNeig, neig()); if (q.abstand < 4) { raus = t; break; } }
    return { lat, maxNeig, tief, stand, raus };
  }, { sM, kmh });
  await s.schliessen();
  return r;
}

if (teil('a')) {
  console.log('(a) Hang-Check Finnland (tools/hang-pruefen.mjs) und Prüfer für umgebung.boeschung');
  const e = await hangPruefen({ strecke: 'finnland' });
  fs.writeFileSync(path.join(LOG, 'hang-finnland.txt'), hangText(e));
  const flussS = [1477]; // Brücke (strecken/finnland.js, wasser.fluesse)
  const begruendet = (x) => ['Brücke', 'Kreuzung'].includes(x.ursache) || (x.ursache === 'Ufer' && flussS.some((f) => Math.abs(x.von - f) <= 30));
  const ueber35 = e.ziel.filter((x) => !['Wand', 'Abhang', 'Brücke', 'Kreuzung'].includes(x.ursache));
  melde(e.fehler === 0, `Finnland: ${e.fehler} Stellen über ${GRENZEN.warnung} ohne Absicht (Ziel 0); mit Absicht ${e.absicht} (Brücke/Kreuzung)`);
  melde(ueber35.every(begruendet) && e.maxOhne <= GRENZEN.warnung, `Finnland: ${ueber35.length} Stellen über ${GRENZEN.ziel}, alle begründet (Brückenrampe: zwischen Strasse und Fluss zu wenig Platz) – ${ueber35.map((x) => `${x.von}–${x.bis} m ${x.max.toFixed(2)} ${x.ursache}`).join(', ') || 'keine'}; grösste Steigung ${e.maxOhne.toFixed(3)}`);
  melde(e.maxKnick <= 0.4, `Finnland: keine Grate (grösster Knick ${e.maxKnick.toFixed(3)}, Knicke über ${GRENZEN.knick}: ${e.fehlerKnick})`);
  if (ALT) {
    const a = await hangPruefen({ wurzel: ALT, strecke: 'finnland' });
    fs.writeFileSync(path.join(LOG, 'hang-finnland-alt.txt'), hangText(a));
    info(`0.10b.1 zum Vergleich: ${a.fehler} Stellen über ${GRENZEN.warnung}, grösste Steigung ${a.maxOhne.toFixed(2)}, ${a.warn.filter((x) => x.ursache === 'Ufer').map((x) => `${x.von}–${x.bis} m ${x.max.toFixed(2)}`).join(', ')}`);
  }
  const ok = ['finnland', 'alpen'].every((id) => werkzeug('strecke-pruefen.mjs', [`strecken/${id}.js`]).code === 0);
  const quelle = fs.readFileSync(path.join(WURZEL, 'strecken/finnland.js'), 'utf8');
  const MUSTER = /boeschung: \{ schulter: 2\.5, steigung: 0\.3, weich: 4, reichweite: 40 \}/;
  const kaputt = ["{ schulter: 2.5, steigung: 1.2, weich: 4, reichweite: 40 }", "{ schulter: 2.5, weich: 4, reichweite: 40 }", "'flach'", "{ schulter: -1, steigung: 0.3, weich: 4, reichweite: 40 }", "{ schulter: 2.5, steigung: 0.3, weich: 4, reichweite: 200 }"];
  let abgelehnt = 0;
  for (const k of kaputt) {
    const d = path.join(LOG, 'finnland-kaputt.js');
    fs.writeFileSync(d, quelle.replace(MUSTER, `boeschung: ${k}`));
    const r = werkzeug('strecke-pruefen.mjs', [d]);
    if (r.code === 1 && /boeschung/.test(r.text)) abgelehnt++;
  }
  melde(ok && MUSTER.test(quelle) && abgelehnt === kaputt.length, `Prüfer: Finnland und Alpen ok, ${abgelehnt}/${kaputt.length} kaputte boeschung-Werte abgelehnt (Negativtest)`);
}

if (teil('b')) {
  console.log('(b) Meter 969 (Hang zum See): hineinrollen und rückwärts wieder auf die Strasse');
  for (const [sM, kmh] of [[969, 20], [960, 20], [990, 20], [1030, 20], [969, 40]]) {
    const n = await hangFahrt(WURZEL, sM, kmh);
    const a = ALT ? await hangFahrt(ALT, sM, kmh) : null;
    melde(n.raus != null && n.maxNeig < 25, `${sM} m, ${kmh} km/h hinein: rollt ${n.lat.toFixed(1)} m neben die Mitte (${n.tief.toFixed(1)} m tief), steht, rückwärts nach ${n.raus == null ? 'NIE' : n.raus.toFixed(1) + ' s'} wieder auf der Strasse, Neigung höchstens ${n.maxNeig.toFixed(0)}°${a ? ` (0.10b.1: ${a.raus == null ? 'kommt nicht heraus' : 'heraus nach ' + a.raus.toFixed(1) + ' s'}, Neigung ${a.maxNeig.toFixed(0)}°, ${a.tief.toFixed(1)} m tief)` : ''}`);
  }
}

if (teil('c')) {
  console.log('(c) Finnland: Strasse, Pace-Notes, Checkpoints, Länge unverändert; Testfahrer-Zeiten gleich; Abkürzungen');
  const neu = await streckenAbdruck(WURZEL, 'finnland');
  melde(Math.abs(neu.laenge - 4161.6) <= 0.5, `Länge ${neu.laenge.toFixed(3)} m (4161.6 ±0.5), ${neu.notes.length} Pace-Notes`);
  if (ALT) {
    const alt = await streckenAbdruck(ALT, 'finnland');
    melde(neu.notes.join() === alt.notes.join() && neu.checkpoints === alt.checkpoints && neu.punkte === alt.punkte && neu.abschnitte === alt.abschnitte,
      `Pace-Notes (${neu.notes.length}), Checkpoints, Abschnitte und Strassenpunkte bit-gleich wie 0.10b.1`);
  }
  for (const id of ['prototyp', ...AUTOS]) {
    if (id === 'escorta') continue; // Escorta ändert sich ab Teil C (siehe (k))
    const r = abfahren(id);
    const d = r.zeiten.split(' / ').map((t, i) => Math.abs(sek(t) - sek(FI_REF[id].split(' / ')[i])));
    melde(d.length === 3 && d.every((x) => x <= 0.05), `${id}: ${r.zeiten} (0.10b.1: ${FI_REF[id]}), Abweichung höchstens ${Math.max(...d).toFixed(2)} s`);
  }
  // Nicht schlechter = gesperrte Kurven bleiben dicht (Durchkommen 0), gleich viele Einträge schneiden/nicht schneiden, und
  // keine freie Kurve bringt mehr Gewinn als die bisher beste freie Kurve der Strecke (mehr Linien in einer freien Kurve sind
  // erlaubt: der Hang am See blockierte vorher Linien, die jetzt fahrbar sind)
  const zahlen = (t) => ({ linien: ((/übrige Linien je Kurve ([\d/]+)/.exec(t) || [])[1] || ''), durch: +((/Durchkommen in gesperrten Kurven: (\d+)/.exec(t) || [])[1]),
    gewinn: [...t.matchAll(/übrig in Kurve ([\d – ]+): \d+ Linien, Gewinn bis ([\d.]+) m/g)].map((m) => [m[1].trim(), +m[2]]),
    eintraege: ((/Einträge "nicht schneiden": (\d+), "schneiden": (\d+)/.exec(t) || []).slice(1).join('/')) });
  const an = zahlen(werkzeug('abkuerzungen.mjs', ['--strecke', 'finnland']).text);
  const aa = ALT ? zahlen(werkzeug('abkuerzungen.mjs', ['--strecke', 'finnland'], ALT).text) : null;
  const maxG = (z) => Math.max(...z.gewinn.map((g) => g[1]));
  const anders = aa ? an.gewinn.filter((g, i) => !aa.gewinn[i] || g[1] !== aa.gewinn[i][1]).map((g) => `${g[0]} m: Gewinn bis ${aa.gewinn.find((x) => x[0] === g[0])?.[1]} -> ${g[1]} m`) : [];
  melde(an.durch === 0 && (!aa || (an.eintraege === aa.eintraege && maxG(an) <= maxG(aa))),
    `Abkürzungen Finnland: Durchkommen in gesperrten Kurven ${an.durch}, Einträge nicht schneiden/schneiden ${an.eintraege}, grösster Gewinn ${maxG(an)} m${aa ? ` (0.10b.1: ${aa.durch}, ${aa.eintraege}, ${maxG(aa)} m)` : ''}`);
  if (anders.length) info(`freie Kurven anders: ${anders.join('; ')} (übrige Linien ${an.linien}, 0.10b.1 ${aa.linien})`);
}

if (teil('d')) {
  console.log('(d) Hang-Check Alpen: nur Bericht (nichts an den Alpen geändert; Alpen-Gleichheit: x1–x5)');
  const e = await hangPruefen({ strecke: 'alpen' });
  fs.writeFileSync(path.join(LOG, 'hang-alpen.txt'), hangText(e));
  const je = e.warn.reduce((m, x) => { m[x.ursache] = (m[x.ursache] || 0) + 1; return m; }, {});
  melde(e.warn.length > 0, `Alpen: ${e.warn.length} Stellen über ${GRENZEN.warnung} (${Object.entries(je).map(([k, v]) => `${k} ${v}`).join(', ')}), Liste: ${LOG}/hang-alpen.txt`);
  const geaendert = ['strecken/alpen.js'].filter((d) => spawnSync('git', ['diff', '--quiet', BASIS, '--', d], { cwd: WURZEL }).status !== 0);
  melde(geaendert.length === 0 && !/boeschung/.test(fs.readFileSync(path.join(WURZEL, 'strecken/alpen.js'), 'utf8')), 'strecken/alpen.js unverändert, ohne boeschung (Gelände wie 0.10b.1)');
}

// Bild Meter 969: Kamera neben der Strasse bei 948 m, Blick zum Seeufer, Auto im Hang
async function bildHang(wurzel) {
  const s = await oeffne(wurzel, '?menue=aus&ton=aus&strecke=finnland', { uhr: true });
  await bereit(s);
  await bilder(s, 2);
  await s.page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, W = A.welt; A.anhalten = true;
    const p = S.punktBei(969), k = S.punktBei(946), z = S.punktBei(990);
    A.physik.reset(p.x + p.tz * 9, p.z - p.tx * 9, Math.atan2(p.tz, -p.tx) + 0.6);
    const ky = S.py[946] + 3.2;
    A.testKamera = { pos: [k.x - k.tz * 3, ky, k.z + k.tx * 3], ziel: [z.x + z.tz * 13, W.gelaendeHoehe(z.x + z.tz * 13, z.z - z.tx * 13), z.z - z.tx * 13] };
    A.hudSchalter.an = false;
  });
  await bilder(s, 4);
  const b = await foto(s);
  await s.schliessen();
  return b;
}
if (teil('e')) {
  console.log('(e) Bild Meter 969 alt/neu (Hang zum See)');
  const neu = await bildHang(WURZEL);
  fs.writeFileSync(path.join(LOG, 'hang-969-neu.png'), Buffer.from(neu.split(',')[1], 'base64'));
  if (!ALT) info('nur mit --alt');
  else {
    const alt = await bildHang(ALT);
    fs.writeFileSync(path.join(LOG, 'hang-969-alt.png'), Buffer.from(alt.split(',')[1], 'base64'));
    const s = await starteSpiel({ breite: 320, hoehe: 200 });
    const v = await vergleiche(s.page, alt, neu, true);
    await s.schliessen();
    if (v.url) fs.writeFileSync(path.join(LOG, 'hang-969-vergleich.png'), Buffer.from(v.url.split(',')[1], 'base64'));
    melde(v.anders > 2000, `Hang bei 969 m sichtbar anders: ${v.anders} von ${v.pixel} Pixeln (Bilder ${LOG}/hang-969-alt.png, -neu.png, -vergleich.png)`);
  }
}

// ===================================================================== Teil B: Wasser (f)–(j)
// Auto auf der Strasse bei 950 m ins Rennen setzen, kurz fahren (sichere Stelle), dann quer zum See bei 969 m
// mit Tempo kmh hineinfahren lassen. Ergebnis im Browser: window.__wb
const WASSER_FAHRT = ({ kmh, gasWasser }) => {
  const A = window.__alpineRally, S = A.strecke, P = A.physik;
  A.anhalten = true;
  A.setzeAuf(950); A.rennen.zustand = 'laeuft'; A.rennen.letztesS = 950; A.rennen.zeit = 20;
  for (let i = 0; i < 120; i++) A.rennSchritt(A.SCHRITT, { gas: 0.4, bremse: 0, lenkung: 0, handbremse: false });
  const sicher = A.wasserBad.sicherS, cp = A.rennen.naechsterCp;
  const p = S.punktBei(969);
  P.reset(p.x + p.tz * 6, p.z - p.tx * 6, Math.atan2(p.tz, -p.tx)); P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
  window.__wb = { sicher, cp, zeit0: A.rennen.zeit, gasWasser };
};
const WASSER_BIS = ({ bis }) => { // fahren, bis das Schwarzbild (bis = 'schwarz') oder das Wasserbad zu Ende ist ('ende')
  const A = window.__alpineRally, P = A.physik, W = window.__wb;
  for (let i = 0; i < 120 * 15; i++) {
    const e = A.wasserBad.aktiv ? { gas: 1, bremse: 0, lenkung: 1, handbremse: true } : { gas: W.gasWasser, bremse: 0, lenkung: 0, handbremse: false };
    const r0 = P.richtung, v0 = P.tempo, aktiv0 = A.wasserBad.aktiv;
    A.rennSchritt(A.SCHRITT, e);
    if (A.wasserBad.aktiv && W.start == null) { W.start = A.rennen.zeit; W.anzahl0 = A.wasserBad.anzahl; }
    if (aktiv0 && A.wasserBad.aktiv && !A.wasserBad.versetzt) { W.maxBeschl = Math.max(W.maxBeschl || 0, P.tempo - v0); W.maxDreh = Math.max(W.maxDreh || 0, Math.abs(P.richtung - r0)); }
    if (A.wasserSchwarz() >= 0.5) { W.schwarz = (W.schwarz || 0) + A.SCHRITT; if (W.r == null) W.r = A.rTaste(); }
    if (bis === 'schwarz' && A.wasserBad.aktiv && A.wasserBad.t > 1.5) return true;
    if (bis === 'ende' && W.start != null && !A.wasserBad.aktiv) return true;
  }
  return false;
};
async function wasserFahrt(wurzel, kmh = 40, { ton = false } = {}) {
  const s = ton ? await (async () => { const x = await starteSpiel({ wurzel, args: ['--autoplay-policy=no-user-gesture-required'] }); await x.page.goto(`${x.url}/index.html?strecke=finnland`); return x; })()
    : await oeffne(wurzel, '?menue=aus&ton=aus&strecke=finnland', { uhr: true });
  await bereit(s);
  return s;
}

if (teil('f') || teil('h')) {
  console.log('(f) tiefer See: Platsch, Schwarzbild 2–4 s mit HUD, Zeit läuft, zurück auf die Strasse; (h) Eingaben gesperrt');
  const s = await wasserFahrt(WURZEL);
  await bilder(s, 2);
  await s.page.evaluate(WASSER_FAHRT, { kmh: 40, gasWasser: 1 });
  const ok1 = await s.page.evaluate(WASSER_BIS, { bis: 'schwarz' });
  // Bild mitten im Schwarzbild: 3D-Bild schwarz, HUD (Zeit oben links, Tacho unten, Karte oben rechts) sichtbar
  const b = await foto(s);
  fs.writeFileSync(path.join(LOG, 'wasser-schwarz.png'), Buffer.from(b.split(',')[1], 'base64'));
  const px = await s.page.evaluate(async (url) => {
    const im = await createImageBitmap(await (await fetch(url)).blob()), c = new OffscreenCanvas(im.width, im.height), x = c.getContext('2d');
    x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, im.width, im.height).data, W = im.width, H = im.height;
    const hell = (x0, y0, x1, y1) => { let n = 0, a = 0; for (let y = Math.floor(y0 * H); y < y1 * H; y++) for (let xx = Math.floor(x0 * W); xx < x1 * W; xx++) { const i = (y * W + xx) * 4; a++; if (d[i] + d[i + 1] + d[i + 2] > 60) n++; } return n / a; };
    return { mitte: hell(0.3, 0.35, 0.7, 0.6), zeit: hell(0, 0, 0.25, 0.15), unten: hell(0, 0.7, 1, 1), karte: hell(0.75, 0, 1, 0.3) };
  }, b);
  // Pause im Schwarzbild: Zeit des Wasserbads steht, danach weiter
  const pause = await s.page.evaluate(() => { const A = window.__alpineRally, t0 = A.wasserBad.t; A.pausieren(); return { t0, zustand: A.ablauf.zustand }; });
  await bilder(s, 30);
  const nachPause = await s.page.evaluate(() => { const A = window.__alpineRally, t = A.wasserBad.t, schwarz = A.wasserSchwarz(); A.weiter(); A.anhalten = true; return { t, schwarz, zustand: A.ablauf.zustand }; });
  const ok2 = await s.page.evaluate(WASSER_BIS, { bis: 'ende' });
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, P = A.physik, W = window.__wb, q = S.abfrage(P.x, P.z, {});
    const p = S.punktBei(q.s);
    return { ...W, anzahl: A.wasserBad.anzahl, zeit: A.rennen.zeit, s: q.s, abstand: q.abstand, tempo: P.tempo, richtungDiff: Math.abs(Math.atan2(Math.sin(P.richtung - Math.atan2(p.tx, p.tz)), Math.cos(P.richtung - Math.atan2(p.tx, p.tz)))), cpNachher: A.rennen.naechsterCp, zustand: A.rennen.zustand, rNachher: A.rTaste() };
  });
  await s.schliessen();
  melde(ok1 && ok2 && r.anzahl === 1 && r.anzahl0 === 1, `Auto fährt mit 40 km/h bei 969 m in den See: Wasserbad ausgelöst (einmal, keine Mehrfach-Auslösung: ${r.anzahl})`);
  melde(r.schwarz >= 2 && r.schwarz <= 4, `Schwarzbild (mindestens halb dunkel) ${r.schwarz.toFixed(2)} s (2–4 s; abblenden ${0.3} + schwarz 3.0 + einblenden 0.3)`);
  melde(px.mitte < 0.02 && px.zeit > 0.03 && px.unten > 0.03 && px.karte > 0.03, `Bild im Schwarzbild: Mitte ${(px.mitte * 100).toFixed(1)} % hell (schwarz), HUD sichtbar: Zeit ${(px.zeit * 100).toFixed(0)} %, Tacho-Zeile ${(px.unten * 100).toFixed(0)} %, Karte ${(px.karte * 100).toFixed(0)} % (${LOG}/wasser-schwarz.png)`);
  const lief = r.zeit - r.start;
  melde(lief >= 3.3 && lief <= 3.8, `Zeit läuft weiter: ${lief.toFixed(2)} s zwischen Platsch und Ende (Strafe), Rennen ${r.zustand}`);
  melde(r.abstand < 0.5 && Math.abs(r.s - r.sicher) < 25 && r.tempo < 0.01 && r.richtungDiff < 0.01 && r.cpNachher === r.cp, `danach auf der Strasse: ${r.s.toFixed(1)} m (letzte sichere Stelle ${r.sicher.toFixed(1)} m, nicht über den See), Mitte ${r.abstand.toFixed(2)} m, Tempo ${r.tempo.toFixed(2)}, Richtung = Strecke (${r.richtungDiff.toFixed(3)} rad), Checkpoint-Fortschritt gleich (${r.cpNachher})`);
  console.log('(h) Eingaben im Schwarzbild gesperrt');
  melde((r.maxBeschl || 0) <= 0.001 && (r.maxDreh || 0) < 0.01, `Gas, Lenkung und Handbremse voll im Schwarzbild: Tempo steigt nie (${(r.maxBeschl || 0).toFixed(4)} m/s je Schritt), Drehung höchstens ${(r.maxDreh || 0).toFixed(4)} rad je Schritt`);
  melde(r.r === 'gesperrt' && r.rNachher !== 'gesperrt', `Taste R im Schwarzbild: "${r.r}" (nichts passiert), danach wieder "${r.rNachher}"`);
  melde(pause.zustand === 'pause' && Math.abs(nachPause.t - pause.t0) < 1e-9 && nachPause.schwarz > 0.9 && nachPause.zustand === 'rennen', `Pause im Schwarzbild: Wasserbad steht (${pause.t0.toFixed(2)} s -> ${nachPause.t.toFixed(2)} s), Bild bleibt schwarz, weiter geht es normal`);
  info('Touch, Gamepad und Tastatur gehen alle durch dieselbe Eingabe: im Wasserbad ersetzt sie die Sperre (wie beim R-Countdown)');
}

if (teil('g')) {
  console.log('(g) flaches Ufer: Spritzer, sonst nichts; Demo-Fahrt löst nichts aus');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, P = A.physik, W = A.welt, f = W.wasser.seen[0];
    A.anhalten = true; A.setzeAuf(1100); A.rennen.zustand = 'laeuft'; A.rennen.naechsterCp = 1; // (CP1 bei 1000 m schon durch)
    // Punkt im flachen Wasser am Ufer des ersten Sees suchen (0.15–0.4 m tief), weit weg von der Strasse
    let ziel = null;
    for (let k = 0; k < 360 && !ziel; k++) {
      const w = k / 360 * Math.PI * 2;
      for (let r = 0.9; r < 1.03 && !ziel; r += 0.005) { // (Wasserfläche reicht ufer*0.2 = 1.8 m über die Ellipse)
        const q0 = Math.cos(w) * f.rx * r, l0 = Math.sin(w) * f.rz * r, x = f.x + f.uz * q0 + f.ux * l0, z = f.z - f.ux * q0 + f.uz * l0;
        const b = W.bodenBei(x, z); const t = f.h - b.h;
        const ab = S.abfrage(x, z, {}).abstand;
        if (b.art === 'gras' && t > 0.15 && t < 0.4 && ab > 22 && ab < 38) ziel = { x, z, t, w };
      }
    }
    if (!ziel) return { gefunden: false };
    // längs am Ufer langsam fahren (Richtung tangential)
    P.reset(ziel.x, ziel.z, Math.atan2(-Math.sin(ziel.w) * f.rx, Math.cos(ziel.w) * f.rz)); P.vx = Math.sin(P.richtung) * 5; P.vz = Math.cos(P.richtung) * 5;
    const a0 = A.wasserBad.anzahl, sp0 = A.wasserBad.spritzer; let nass = 0, spritz = 0;
    for (let i = 0; i < 120; i++) { A.rennSchritt(A.SCHRITT, { gas: 0.3, bremse: 0, lenkung: 0, handbremse: false }); if (A.wasserBad.nass) nass++; spritz = A.wasserBad.spritzer - sp0; }
    return { gefunden: true, tiefe: ziel.t, anzahl: A.wasserBad.anzahl - a0, nass, spritz, aktiv: A.wasserBad.aktiv };
  });
  await s.schliessen();
  melde(r.gefunden && r.anzahl === 0 && !r.aktiv && r.nass > 10 && r.spritz > 0, `flaches Wasser ${r.tiefe?.toFixed(2)} m tief: ${r.nass} von 120 Schritten nass, ${r.spritz} kleine Spritzer mit Plätschern, Wasserbad ${r.anzahl}× (Ziel 0), man fährt weiter`);
  const d = await oeffne(WURZEL, '?ton=aus&strecke=finnland');
  await bereit(d);
  const demo = await d.page.evaluate(async () => {
    const A = window.__alpineRally, P = A.physik, S = A.strecke, p = S.punktBei(969);
    await new Promise((ok) => setTimeout(ok, 1500));
    // Demo-Fahrt (nurFahren): auch quer in den See gesetzt löst nichts aus
    P.reset(p.x + p.tz * 20, p.z - p.tx * 20, Math.atan2(p.tz, -p.tx)); P.vx = Math.sin(P.richtung) * 10; P.vz = Math.cos(P.richtung) * 10;
    for (let i = 0; i < 240; i++) A.physikSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false }, true);
    return { anzahl: A.wasserBad.anzahl, aktiv: A.wasserBad.aktiv, zustand: A.ablauf.zustand };
  });
  await d.schliessen();
  melde(demo.anzahl === 0 && !demo.aktiv, `Menü-Demofahrt (${demo.zustand}): Wasser löst nichts aus (Wasserbad ${demo.anzahl}×)`);
}

if (teil('i')) {
  console.log('(i) Alpen: kein Wasser, nichts angefasst');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  const r = await s.page.evaluate(() => { const A = window.__alpineRally; return { an: A.welt.wasser.an, wasserAn: A.CONFIG.wasserAn, boeschung: A.CONFIG.gelaende.boeschung }; });
  await s.schliessen();
  melde(r.an === false && r.wasserAn === false && r.boeschung === null, `Alpen: keine Wasserflächen (befahrbares Wasser: keins; der Brunnen ist ein Hindernis), kein Platsch-Klang, keine Böschung – Gleichheit mit 0.10b.1: x1–x5`);
}

if (teil('j')) {
  console.log('(j) Ton: Platsch erzeugt Ton, Motor im Schwarzbild aus, danach wieder an');
  const s = await wasserFahrt(WURZEL, 40, { ton: true });
  await s.page.waitForTimeout(1500);
  await s.page.keyboard.press('Enter'); // Taste auf dem Titel: Ton an (wie ton-test)
  const bereitTon = await s.page.evaluate(async () => {
    const A = window.__alpineRally; A.ton.entsperren();
    for (let i = 0; i < 200 && !(A.ton.werk && A.ton.werk.aufbau.fertig); i++) await new Promise((ok) => setTimeout(ok, 100));
    return !!(A.ton.werk && A.ton.werk.aufbau.fertig && A.ton.werk.puffer.platsch);
  });
  await s.page.evaluate(() => { const A = window.__alpineRally; A.start({ countdown: false }); A.anhalten = true; });
  await s.page.evaluate(WASSER_FAHRT, { kmh: 40, gasWasser: 1 });
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, Z = A.ton.werk.zaehler, zu = A.ton.werk.zustand, out = { vorher: zu.motorAn };
    const p0 = Z.platsch || 0;
    let aus = false, wiederAn = false;
    for (let i = 0; i < 120 * 12; i++) {
      A.rennSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false });
      if (i % 2 === 0) A.tonBild(A.SCHRITT * 2);
      if (A.wasserBad.aktiv && !A.wasserBad.versetzt && A.wasserBad.t > 0.5 && zu.motorAn === 0) aus = true;
      if (aus && A.wasserBad.versetzt && zu.motorAn === 1) { wiederAn = true; break; }
    }
    return { ...out, platsch: (Z.platsch || 0) - p0, aus, wiederAn };
  });
  await s.schliessen();
  melde(bereitTon && r.platsch === 1 && r.aus && r.wiederAn, `Platsch-Puffer gebaut ${bereitTon}, Platsch gespielt ${r.platsch}×, Motor im Schwarzbild aus ${r.aus}, nach dem Zurücksetzen wieder an ${r.wiederAn}`);
}

// ===================================================================== Teil C: Escorta auf Schotter (k)–(o)
const STILE = ['vorsichtig', 'mittel', 'flott', 'digital'];
// Finnland je Auto in allen vier Stilen, neu und (mit --alt) im Stand 0.10b.1 (Spiel und Streckendatei von dort,
// Testfahrer von hier, damit es den Stil "digital" auch für den alten Stand gibt)
function abfahrenAlle(id, wurzel) {
  const extra = ['--stil', STILE.join(',')];
  if (wurzel !== WURZEL) extra.unshift(path.join(wurzel, 'strecken/finnland.js'), '--wurzel', wurzel);
  const r = werkzeug('strecke-abfahren.mjs', [...(wurzel === WURZEL ? ['--strecke', 'finnland'] : []), '--auto', id, '--aus', path.join(LOG, `stile-${id}${wurzel === WURZEL ? '' : '-alt'}.txt`), ...extra]);
  const z = {};
  for (const st of STILE) {
    const m = new RegExp(`^${st}\\s+(\\S+).*Aufpralle (\\d+)`, 'm').exec(r.text);
    z[st] = m ? { zeit: m[1], aufpralle: +m[2] } : { zeit: '--', aufpralle: null };
  }
  return z;
}
const tabelle = {};
if (teil('k') || teil('n')) {
  console.log('(k) Finnland: alle Autos x vier Stile (vorsichtig, mittel, flott, digital), vorher (0.10b.1) / nachher');
  for (const id of ['prototyp', ...AUTOS]) {
    const neu = abfahrenAlle(id, WURZEL), alt = ALT ? abfahrenAlle(id, ALT) : null;
    tabelle[id] = { neu, alt };
    info(`${id.padEnd(9)} ${STILE.map((st) => `${st} ${alt ? `${alt[st].zeit} (${alt[st].aufpralle}) -> ` : ''}${neu[st].zeit} (${neu[st].aufpralle})`).join(' | ')}`);
  }
  const t = (id, st) => sek(tabelle[id].neu[st].zeit);
  if (ALT) {
    const andere = ['prototyp', ...AUTOS].filter((id) => id !== 'escorta');
    const gleich = andere.every((id) => STILE.every((st) => tabelle[id].neu[st].zeit === tabelle[id].alt[st].zeit && tabelle[id].neu[st].aufpralle === tabelle[id].alt[st].aufpralle));
    melde(gleich, `die anderen fünf Profile sind in allen vier Stilen Zeile für Zeile gleich wie 0.10b.1 (Teil C wirkt nur beim Escorta)`);
    const a = tabelle.escorta.alt.digital, i = tabelle.imprexa.alt.digital, l = tabelle.l073.alt.digital;
    info(`vorher (0.10b.1, digital): Escorta ${a.zeit} (${a.aufpralle} Aufpralle), Lanza 073 ${l.zeit}, Imprexa ${i.zeit} – Escorta ${(sek(a.zeit) - sek(i.zeit)).toFixed(1)} s hinter dem Imprexa`);
  }
  const d = t('imprexa', 'digital') - t('escorta', 'digital');
  melde(d >= 0.3 && d <= 1.0, `digital: Escorta ${tabelle.escorta.neu.digital.zeit} ist ${d.toFixed(2)} s schneller als Imprexa ${tabelle.imprexa.neu.digital.zeit} (Richtwert 0.3–1.0 s)`);
  const vor = ['delto', 'prototyp', 'l073'].map((id) => [id, t(id, 'digital') - t('escorta', 'digital')]);
  melde(vor.every(([, x]) => x >= 0.4), `digital: Escorta vor ${vor.map(([id, x]) => `${id} (+${x.toFixed(2)} s)`).join(', ')}`);
  melde(STILE.every((st) => tabelle.escorta.neu[st].aufpralle === 0), `Escorta ohne Unfall in allen vier Stilen (${STILE.map((st) => `${st} ${tabelle.escorta.neu[st].aufpralle}`).join(', ')})`);
}

if (teil('l') || teil('m')) {
  const { schotterMessung, messText } = await import('./schotter-messung.mjs');
  const neu = await schotterMessung(WURZEL), alt = ALT ? await schotterMessung(ALT) : null;
  fs.writeFileSync(path.join(LOG, 'schotter-messung.txt'), `neu\n${messText(neu)}\n${alt ? `\n0.10b.1\n${messText(alt)}\n` : ''}`);
  if (teil('l')) {
    console.log('(l) neue Werte wirken nur beim Escorta und nur auf Schotter');
    if (alt) {
      const andere = Object.keys(neu).filter((id) => id !== 'escorta');
      melde(andere.every((id) => JSON.stringify(neu[id]) === JSON.stringify(alt[id])), `andere Autos: alle Messwerte (0–80, Drift auf Schotter und Asphalt) bit-gleich wie 0.10b.1`);
      const e = neu.escorta, ea = alt.escorta;
      melde(e.null80Asphalt === ea.null80Asphalt && e.driftAsphalt === ea.driftAsphalt && e.fangenAsphalt === ea.fangenAsphalt, `Escorta auf Asphalt bit-gleich (0–80 ${e.null80Asphalt.toFixed(2)} s, Drift ${e.driftAsphalt.toFixed(1)}°), auf Schotter anders (Drift ${ea.drift.toFixed(1)}° -> ${e.drift.toFixed(1)}°)`);
    }
    const { CONFIG } = await import('../js/config.js');
    const fremde = Object.entries(CONFIG.fahrprofile).filter(([id, p]) => id !== 'escorta' && p.auto && ['schotterHeck', 'schotterStabil', 'schotterTraktion', 'schotterGrip'].some((k) => k in p.auto));
    melde(fremde.length === 0 && CONFIG.auto.schotterHeck === 1 && CONFIG.auto.schotterStabil === 1 && CONFIG.auto.schotterTraktion === 1, `schotterHeck/-Stabil/-Traktion: Standard 1 (= keine Rechnung), gesetzt nur beim Escorta`);
  }
  if (teil('m')) {
    console.log('(m) Kurzmessungen auf Schotter (0–80 km/h, Drift-Winkel bei digitalem Vollausschlag mit Vollgas, 70 km/h)');
    for (const z of messText(neu).split('\n')) info(z);
    const e = neu.escorta, i = neu.imprexa;
    melde(e.null80 <= i.null80 * 1.05, `0–80 Schotter: Escorta ${e.null80.toFixed(2)} s, Imprexa ${i.null80.toFixed(2)} s (${((e.null80 / i.null80 - 1) * 100).toFixed(1)} %, höchstens +5 %)${alt ? `; vorher ${alt.escorta.null80.toFixed(2)} s` : ''}`);
    melde(e.drift < neu.l073.drift && e.drift <= neu.delto.drift + 0.05 && Math.abs(e.drift - i.drift) <= 1, `Drift-Maximum: Escorta ${e.drift.toFixed(2)}° (Lanza 073 ${neu.l073.drift.toFixed(2)}°, Delto ${neu.delto.drift.toFixed(2)}°, Imprexa ${i.drift.toFixed(2)}°)${alt ? `; vorher ${alt.escorta.drift.toFixed(1)}°` : ''}`);
    melde(!e.dreher && e.fangen != null && e.fangen <= 0.5, `Escorta fängt sich ohne Gegenlenken nach ${e.fangen == null ? 'nie' : e.fangen.toFixed(2) + ' s'}${alt ? ` (vorher ${alt.escorta.fangen?.toFixed(2)} s)` : ''}`);
  }
}

if (teil('n')) {
  console.log('(n) Alpen: Escorta nur an den Schotterstellen anders (andere Autos: x2, Bilder mit Escorta auf Asphalt: x4)');
  const zeilen = (t) => t.split('\n').filter((x) => /^\s+(vorsichtig|mittel|flott)\b/.test(x)).map((x) => x.trim().split(/\s+/)[1]);
  const n = zeilen(werkzeug('testfahrer.mjs', ['--auto', 'escorta']).text);
  const a = ALT ? zeilen(werkzeug('testfahrer.mjs', ['--auto', 'escorta', '--wurzel', ALT]).text) : null;
  melde(n.length === 3, `Escorta Alpen: ${a ? `${a.join(' / ')} -> ` : ''}${n.join(' / ')} (nur Talschleife und Almweg sind Schotter)`);
}

if (teil('o')) {
  console.log('(o) Garage: Zusatz beim Escorta (de + en)');
  const { TEXTE } = await import('../js/texte.js');
  const t = TEXTE['auto.escorta.daten2'];
  melde(/SCHOTTER-SPEZIALIST/.test(t.de) && /GRAVEL SPECIALIST/.test(t.en), `Garage-Zeile: "${t.de}" / "${t.en}"`);
  if (ALT) melde(fs.readFileSync(path.join(ALT, 'js/autos.js'), 'utf8') === fs.readFileSync(path.join(WURZEL, 'js/autos.js'), 'utf8'), 'js/autos.js (Werte-Balken, Aussehen) unverändert gegen 0.10b.1');
}

// ===================================================================== Teil D: Rentier-Ton (p)–(s)
// Spiel mit Ton (Taste auf dem Titel), Umgebung direkt mit einem gedachten Hörer rechnen (wie das Spiel jedes Bild)
async function tonSpiel(strecke) {
  const s = await starteSpiel({ args: ['--autoplay-policy=no-user-gesture-required'] });
  await s.page.goto(`${s.url}/index.html?strecke=${strecke}`);
  await bereit(s);
  await s.page.waitForTimeout(1500);
  await s.page.keyboard.press('Enter');
  await s.page.waitForFunction(() => { const t = window.__alpineRally.ton; return t.werk && t.werk.aufbau.fertig; }, null, { timeout: 60000 });
  return s;
}
// Hörer im Abstand d (m) neben der nächsten Herde (seite +1 = Herde rechts vom Hörer), sek Sekunden lang Bilder rechnen
const HOEREN = ({ d, seite, sek, modus = 'rennen', herde = 0 }) => {
  const A = window.__alpineRally, U = A.ton.werk.umgebung, H = U.quellen.herden[herde];
  const Z = { hx: H.x + seite * (H.r + d), hz: H.z, hyaw: 0, s: 0, tempo: 0 }; // Blick +z: rechts = -x (Herde rechts = Hörer weiter +x)
  const z0 = { ...U.zaehler };
  for (let t = 0; t < sek; t += 1 / 60) U.aktualisiere(1 / 60, modus, Z);
  const neu = (k) => (U.zaehler[k] || 0) - (z0[k] || 0);
  const pans = U.protokoll.filter((p) => /^rentier/.test(p.art)).slice(-5).map((p) => Math.round(p.wert * 100) / 100);
  return { schnauben: neu('rentier-schnauben'), klick: neu('rentier-klick'), schreck: neu('rentier-schreck'), glocke: neu('glocke'), pans, herden: U.quellen.herden.length };
};
if (teil('p') || teil('r') || teil('s')) {
  const s = await tonSpiel('finnland');
  if (teil('p')) {
    console.log('(p) Rentiere: Ton nur in Reichweite, Stereo-Seite stimmt, Abstand dämpft, selten, Aufschrecken beim Vorbeifahren');
    const nah = await s.page.evaluate(HOEREN, { d: 25, seite: 1, sek: 60 });
    const fern = await s.page.evaluate(HOEREN, { d: 60, seite: 1, sek: 60 });
    const links = await s.page.evaluate(HOEREN, { d: 25, seite: -1, sek: 30 });
    const schreck = await s.page.evaluate(HOEREN, { d: 8, seite: 1, sek: 10 });
    const laute = nah.schnauben + nah.klick;
    melde(nah.herden > 0 && laute >= 6 && laute <= 25 && nah.glocke === 0, `${nah.herden} Rentier-Herden; 25 m daneben in 60 s: ${nah.schnauben}× Schnauben, ${nah.klick}× Klicken (selten: alle 2.5–7 s, keine Glocken)`);
    melde(fern.schnauben + fern.klick + fern.schreck === 0, `60 m weg (Reichweite 45 m): nichts zu hören (${fern.schnauben + fern.klick})`);
    melde(nah.pans.every((p) => p > 0.05) && links.pans.every((p) => p < -0.05), `Stereo: Herde rechts -> Pan ${nah.pans.join(', ')}; Herde links -> ${links.pans.join(', ')}`);
    melde(schreck.schreck === 1, `8 m daneben (Rentier nah an der Strasse): einmal aufgeschreckt (${schreck.schreck}×), nicht dauernd`);
    const g = await s.page.evaluate(async () => {
      const { raumWerte } = await import('./js/umgebung.js');
      const R = window.__alpineRally.CONFIG.rentierKlang, o = {};
      return [5, 10, 20, 35, 44].map((d) => Math.round(raumWerte(0, 0, 0, -d, 0, R, o).gain * 1000) / 1000);
    });
    melde(g.every((x, i) => i === 0 || x < g[i - 1]) && g[0] === 1, `Abstand dämpft: Pegel bei 5/10/20/35/44 m = ${g.join(' / ')}`);
  }
  if (teil('r')) {
    console.log('(r) Pause dämpft (wie die übrige Umgebung), in der Pause nichts Neues');
    const r = await s.page.evaluate(HOEREN, { d: 20, seite: 1, sek: 30, modus: 'pause' });
    const P = await s.page.evaluate(() => { const A = window.__alpineRally; A.ton.werk.aktualisiere(0.5, { ...A.tonZ, modus: 'pause' }); return { pegel: A.CONFIG.audio.pause.pegel, filter: A.CONFIG.audio.pause.filter }; });
    melde(r.schnauben + r.klick + r.schreck === 0, `Pause: keine neuen Rentier-Laute (${r.schnauben + r.klick + r.schreck}); laufende werden über die Umgebungs-Schiene gedämpft (Pegel ${P.pegel}, Tiefpass ${P.filter} Hz, wie Kuhglocken)`);
  }
  if (teil('s')) {
    console.log('(s) kein neues Objekt pro Bild (Rechnen ohne Laut)');
    const cdp = await s.page.context().newCDPSession(s.page);
    const heap = async () => { for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
    await s.page.evaluate(() => { window.__Z = { hx: 1e5, hz: 1e5, hyaw: 0, s: 0, tempo: 0 }; });
    const h0 = await heap();
    const m = await s.page.evaluate(() => { const U = window.__alpineRally.ton.werk.umgebung, R = () => U.protokoll.filter((p) => /^rentier/.test(p.art)).length, p0 = R(); const m0 = performance.memory.usedJSHeapSize; for (let i = 0; i < 6000; i++) U.aktualisiere(1 / 60, 'rennen', window.__Z); return { zuwachs: performance.memory.usedJSHeapSize - m0, laute: R() - p0 }; });
    const h1 = await heap();
    melde(h1 - h0 < 64 * 1024 && m.laute === 0, `6000 Bilder Umgebung mit Rentieren (ohne Laut): Speicher nach GC ${((h1 - h0) / 1024).toFixed(1)} KB (Grenze 64 KB), Zuwachs ohne GC ${(m.zuwachs / 1024).toFixed(0)} KB, Rentier-Laute ${m.laute}`);
  }
  await s.schliessen();
}
if (teil('q')) {
  console.log('(q) Alpen: keine Rentier-Laute, Kuhglocken wie bisher');
  const s = await tonSpiel('alpen');
  const r = await s.page.evaluate(HOEREN, { d: 15, seite: 1, sek: 30 });
  const pu = await s.page.evaluate(() => Object.keys(window.__alpineRally.ton.werk.puffer).filter((k) => /rentier|platsch/.test(k)));
  await s.schliessen();
  melde(r.schnauben + r.klick + r.schreck === 0 && r.glocke > 0 && pu.length === 0, `Alpen: ${r.glocke}× Glocke, 0 Rentier-Laute, keine Rentier-/Platsch-Puffer (${pu.join(', ') || 'keine'})`);
}

// @@TEILE@@

// ===================================================================== (u) Frühere Tests (nur mit --lang)
if (teil('z') && process.argv.includes('--lang')) {
  console.log('(z) Frühere Tests (Teile, die nicht am alten Quelltext hängen)');
  const laeufe = [
    ['pacenotes-test.mjs', []], ['leben-test.mjs', []], ['kuh-test.mjs', []], ['startziel-test.mjs', []], ['strassenrand-test.mjs', []],
    ['nebenweg-test.mjs', []], ['felswand-test.mjs', []], ['belag-test.mjs', []], ['rennablauf-test.mjs', []], ['menue-test.mjs', []],
    ['overlay-test.mjs', []], ['m9a2-test.mjs', ['--nur', 'a,c,e,f,g,h,k,l,m']], ['m9a1-test.mjs', ['--nur', 'a,b,c,e,f,g,h,i,j,k,m,n,o,p,r']],
    ['m8h-test.mjs', []],
  ];
  const vorher = new Set(spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter(Boolean));
  for (const [datei, a] of laeufe) {
    if (!fs.existsSync(path.join(WURZEL, 'tools', datei))) continue;
    const r = werkzeug(datei, a);
    fs.writeFileSync(path.join(LOG, datei.replace('.mjs', '.log')), r.text);
    const zeilenVon = (t) => t.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x));
    const z = zeilenVon(r.text);
    const rot = z.filter((x) => /^\s*FEHLER/.test(x)).map((x) => x.trim());
    // Rot? Dann denselben Test in 0.10b: sind genau diese Zeilen dort auch rot, ist es nicht durch M10a gekommen
    let vorher = false;
    if (r.code !== 0 && ALT && fs.existsSync(path.join(ALT, 'tools', datei))) {
      const ra = werkzeug(datei, a, ALT);
      const rotAlt = new Set(zeilenVon(ra.text).filter((x) => /^\s*FEHLER/.test(x)).map((x) => x.trim()));
      vorher = rot.length > 0 && rot.every((x) => rotAlt.has(x));
    }
    melde(r.code === 0 || vorher, `${datei} ${a.join(' ')}: ${z.length - rot.length} ok, ${rot.length} rot${vorher ? ' (genau diese Zeilen sind schon in 0.10b.1 rot)' : ''}${rot.length ? ` – ${rot.slice(0, 2).map((x) => x.slice(0, 150)).join(' | ')}` : ''}`);
  }
  // Messdateien, die alte Tests neu schreiben, zurücksetzen
  const neu = spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter((d) => d && !vorher.has(d) && /^(screenshots|tools)\//.test(d));
  if (neu.length) spawnSync('git', ['checkout', '--', ...neu], { cwd: WURZEL });
  info(`von den alten Tests geänderte Messdateien zurückgesetzt: ${neu.length}`);
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);