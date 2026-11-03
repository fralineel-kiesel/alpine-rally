// Meilenstein 10b.1 prüfen:  node tools/m10b1-test.mjs --alt <ordner 0.10b> [--nur a,b,...] [--lang]
// (0.10b: git worktree add <ordner> 61004a7). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein Safari.
// Vorlage: tools/m10b-test.mjs. Buchstaben wie im Auftrag:
//   Teil A – Finnland neu: (a) Prüfer/Länge/Checkpoints/revision, (b) Testfahrer-Zeiten, Schnitt, Tempoprofil, Unfälle,
//       (c) Untergrundwechsel nur an Einmündungen, (d) keine Klemmstellen, (e) Abkürzungen, (f) Bestzeiten mit revision
//   Teil B – Wald/Deko: (g) Dichte je 100 m, (h) Dorf, (i) Baum-Anteile, (j) Farbtest, (k) Bildzeit, (l) Alpen-Bilder
//   Teil C – Escorta: (m) schotterGrip nur Schotter/Escorta, (n) Reihenfolge Finnland, (o) Alpen, (p) Garage-Text
//   Teil D – Schatten: (q) Alpen ohne Schatten, (r) Schatten unter allen Autos, (s) SCHATTEN AUS, (t) kein Flackern, (u) Bildzeit
//   Unveränderlich (Alpen wie 0.10b): (x1) Länge/Abkürzungen, (x2) Testfahrer, (x3) Pace-Notes/Strecke, (x4) Bilder, (x5) Ton
//   (z) nur mit --lang: frühere Tests

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k) || NUR.includes(k[0]); // x1..x5 gehören zu x
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m10b1';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M10B1_AUTOS ? process.env.M10B1_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const BASIS = '61004a7'; // 0.10b
if (!ALT) info(`Vergleiche gegen 0.10b nur mit --alt <ordner> (git worktree add <ordner> ${BASIS})`);

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
  console.log('(x2) Alpen-Testfahrer: Prototyp und Autos gleich wie 0.10b (Escorta ab Teil C: nur Schotterstellen)');
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
    melde(gleich, `${id}: ${zeiten} – ${zn.length} Zeilen (Zeiten, Checkpoints, Aufpralle, Abstände, Gänge, Nebenwege) ${gleich ? 'identisch' : 'ANDERS'} wie 0.10b${id === 'prototyp' ? ' (Referenz 2:59.33 / 2:42.35 / 2:31.92)' : ''}`);
    if (!gleich) for (let i = 0; i < Math.max(za.length, zn.length); i++) if (za[i] !== zn[i]) { info(`alt: ${za[i]}`); info(`neu: ${zn[i]}`); break; }
  }
}

// ===================================================================== (d) Pace-Notes, Checkpoints, Strecke
async function streckenAbdruck(wurzel) {
  const s = await oeffne(wurzel, '?menue=aus&ton=aus');
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
    melde(anders === 0 && neu.notes.length >= 20, `Pace-Notes: ${neu.notes.length} Ansagen, Symbole/Zusätze/Stellen/Reihenfolge ${anders ? `${anders} anders` : 'identisch'} wie 0.10b`);
    melde(neu.checkpoints === alt.checkpoints, `Checkpoints gleich (${neu.checkpoints})`);
    melde(neu.abschnitte === alt.abschnitte, 'Abschnitte gleich (Namen, Bäume, Wald, Felswand, von/bis)');
    melde(neu.punkte === alt.punkte && neu.laenge === alt.laenge && neu.start === alt.start && neu.ziel === alt.ziel, `Strassenpunkte (1-m-Raster, Richtung, Felswand, Baumdichte) bit-gleich, Länge ${neu.laenge} = ${alt.laenge}`);
    // CONFIG: gleich bis auf die Reihenfolge innerhalb von "leben" (Seeds kommen aus "seeds") und die Version
    // (M10b: Fahnen-Art 'kreuz' heisst jetzt 'motiv' = Landesfahne der Strecke; gleiche Wirkung, darum gleichgesetzt)
    const ordne = (o) => (Array.isArray(o) ? o.map(ordne) : o && typeof o === 'object' ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, ordne(o[k])])) : o === 'motiv' ? 'kreuz' : o);
    const cn = ordne(JSON.parse(neu.config)), ca = ordne(JSON.parse(alt.config));
    const NEU_M10B = ['unterholz']; // neue Blöcke in M10b.1 (Unterholz, nur Finnland nutzt es)
    // neue Werte innerhalb der Blöcke (M10b.1, für die Alpen wirkungslos): deko.unterholz/tierschild, auto.schotterGrip
    for (const c of [cn, ca]) { if (c.deko) { delete c.deko.unterholz; delete c.deko.tierschild; } if (c.auto) delete c.auto.schotterGrip; }
    const unterschiede = Object.keys({ ...ca, ...cn }).filter((k) => !NEU_M10B.includes(k) && JSON.stringify(ca[k]) !== JSON.stringify(cn[k]));
    melde(unterschiede.length === 0, `CONFIG (alle Werte, sortiert) gleich wie 0.10b${unterschiede.length ? `; anders: ${unterschiede.join(', ')}` : ''}`);
    const reihenfolge = Object.keys(JSON.parse(neu.config)).filter((k) => !NEU_M10B.includes(k)).join() === Object.keys(JSON.parse(alt.config)).join();
    melde(reihenfolge, `CONFIG: Reihenfolge der Blöcke gleich (neu dazu: ${NEU_M10B.join(', ')})`);
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
if (teil('x4') || teil('l')) {
  console.log('(x4) Alpen-Bilder gegen 0.10b (eigene Bild-Uhr, gleiche Seeds)');
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
    // Seit Teil E steht 0.10b.1 statt 0.10b in der Versionszeile (Titel, Credits): dort darf genau diese eine Textzeile
    // anders sein (Unterschied höchstens 7 Pixel hoch, ganz in der Zeile, in der die Version steht)
    const versionsZeile = (k, box) => box && box[3] - box[1] <= 7 && ((/^(titel|demo)$/.test(k) && box[0] >= 230 && box[1] >= 168) || k === 'menü credits');
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
    melde(rot.length === 0, `${paare.length} Bilder verglichen: ${paare.length - nurVersion.length - neuGestaltet.length} pixelgleich wie 0.10b, ${nurVersion.length} bis auf die Versionszeile, ${neuGestaltet.length} Menüseite(n) mit neuer Finnland-Zeile (Titel, Demo-Fahrt, Start, ${PUNKTE.length - 1} Streckenpunkte, fünf Autos am Start und auf der Passhöhe mit Tachos und Minimap, ${Object.keys(neu.seiten).length} Menüseiten inkl. Bestzeiten)${rot.length ? `; anders: ${rot.join(', ')}` : ''}`);
    if (nurVersion.length) info(`nur die Versionszeile anders (0.10b -> 0.10b.1): ${nurVersion.join(', ')}`);
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
    const dateien = ['js/audio.js', 'js/musik.js', 'js/musikstueck.js', 'js/tonfahrt.js'];
    const geaendert = dateien.filter((d) => spawnSync('git', ['diff', '--quiet', BASIS, '--', d], { cwd: WURZEL }).status !== 0);
    melde(geaendert.length === 0, `Ton-Code unverändert seit 0.10b (${dateien.join(', ')}; umgebung.js geändert, Wirkung für die Alpen gleich)${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
    // Offline gerechnete Klänge (OfflineAudioContext): Messzahlen von ton-umgebung-test in beiden Ständen
    const zahlen = (t) => t.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x)).map((x) => x.replace(/\d+(\.\d+)? ?ms\b/g, 'X ms').trim());
    // Diese Zeilen messen in Echtzeit im laufenden Spiel (Tiefpass/Pegel mitten im Übergang, Zeitpunkt des Stopps,
    // Ton-Labor live): sie schwanken schon zwischen zwei Läufen desselben Stands (gemessen) und werden nur gemeldet.
    // "Pause: leise Variante" und "aus der Pause zum Hauptmenü" sind darum auch in 0.10b manchmal rot (alte Wackel-Tests aus M7b)
    const ECHTZEIT = /^(OK|FEHLER)\s+(Pause: Umgebung läuft gedämpft|Weiter: Musik blendet|Ton-Labor: Umgebung mit VORBEIFAHREN|STARTEN: Musik blendet|Pause: leise Variante|aus der Pause zum Hauptmenü: Musik beginnt)/;
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
    melde(zn.length > 20 && zn.length === za.length && anders.length === 0 && rotN === 0, `ton-umgebung-test (Glocken, Publikum, Vögel, Brunnen, Böen, Musik offline gerechnet): ${zn.length} Messzeilen, ohne die ${zn.filter((x) => ECHTZEIT.test(x)).length} Echtzeit-Zeilen ${anders.length ? `${anders.length} anders` : 'Zahl für Zahl gleich'} wie 0.10b (rot: neu ${zn.filter((x) => x.startsWith('FEHLER')).length}, alt ${za.filter((x) => x.startsWith('FEHLER')).length}, nur Echtzeit-Zeilen)`);
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

// ===================================================================== Teil A: Finnland neu (a)–(f)
const FI = 'finnland';
const BILDZEIT = {}; // (k) -> (u)
const zeitSek = (t) => { const m = /^(\d+):(\d+\.\d+)$/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : NaN; };
if (teil('a')) {
  console.log('(a) Finnland: Prüfer, Länge 3.9–4.2 km, Checkpoints, revision');
  const ok = werkzeug('strecke-pruefen.mjs', ['strecken/finnland.js']);
  melde(ok.code === 0, `tools/strecke-pruefen.mjs strecken/finnland.js: Rückgabe ${ok.code} – ${ok.text.trim().split('\n')[0].slice(0, 160)}`);
  const alp = werkzeug('strecke-pruefen.mjs', ['strecken/alpen.js']);
  melde(alp.code === 0, `strecken/alpen.js (ohne revision) weiter gültig: Rückgabe ${alp.code}`);
  const { pruefeStrecke, bestzeitSchluessel } = await import('../js/streckenpruefung.js');
  const original = (await import('../strecken/finnland.js')).default;
  const alpen = (await import('../strecken/alpen.js')).default;
  const roh = () => JSON.parse(JSON.stringify(original));
  const faelle = [
    ['revision 0', (d) => { d.revision = 0; }, 'revision:'],
    ['revision keine Ganzzahl', (d) => { d.revision = 1.5; }, 'revision:'],
    ['revision als Text', (d) => { d.revision = 'zwei'; }, 'revision:'],
    ['Nebenweg ohne Einmündung', (d) => { delete d.nebenwege[1].einmuendung; }, 'nebenwege[1]:'],
    ['Nebenwege überlappen', (d) => { d.nebenwege[1].abzweig = 1200; }, 'nebenwege[1]:'],
    ['Belag unbekannt', (d) => { d.belagAbschnitte = [{ von: 0, bis: 50, belag: 'eis' }]; }, 'belagAbschnitte[0].belag:'],
    ['Sprung hinter dem Ende', (d) => { d.sprung[3].s = 5000; }, 'sprung[3].s:'],
    ['Länge passt nicht', (d) => { d.laenge = 3500; }, 'laenge:'],
    ['Checkpoint hinter dem Ziel', (d) => { d.checkpoints[3] = 4150; }, 'checkpoints[3]:'],
    ['Haus-Typ unbekannt (M10b.1)', (d) => { d.leben.wiesenweg.haeuser[0].typ = 'iglu'; }, 'leben.wiesenweg.haeuser[0].typ:'],
    ['Dachfarbe unbekannt (M10b.1)', (d) => { d.leben.wiesenweg.haeuser[0].dach = 'lila'; }, 'leben.wiesenweg.haeuser[0].dach:'],
    ['Boot ohne Seite (M10b.1)', (d) => { delete d.leben.wiesenweg.boote[0].seite; }, 'leben.wiesenweg.boote[0]:'],
    ['Unterholz unbekannt (M10b.1)', (d) => { d.deko.unterholz = 'tropisch'; }, 'deko.unterholz:'],
  ];
  const schlecht = [];
  for (const [name, aendere, pfad] of faelle) { const d = roh(); aendere(d); const f = pruefeStrecke(d, { voll: true }); if (!f.some((x) => x.startsWith(pfad))) schlecht.push(`${name} -> ${f[0] || 'kein Fehler'}`); }
  melde(schlecht.length === 0, `${faelle.length - schlecht.length} von ${faelle.length} kaputten Varianten abgelehnt (revision, Nebenwege, Belag, Sprung, Länge, Checkpoint)${schlecht.length ? `; nicht erkannt: ${schlecht.join(' | ')}` : ''}`);
  melde(bestzeitSchluessel(alpen) === 'passstrasse' && bestzeitSchluessel(original) === 'finnland-r2' && original.revision === 2,
    `Bestzeiten-Schlüssel: Alpen "${bestzeitSchluessel(alpen)}" (unverändert), Finnland "${bestzeitSchluessel(original)}" (revision ${original.revision})`);
  const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${FI}`);
  await bereit(s);
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, st = A.strecke;
    return { laenge: st.laenge, start: st.startS, ziel: st.zielS, cps: A.checkpoints.map((c) => c.s) };
  });
  melde(r.laenge >= 3900 && r.laenge <= 4200 && Math.abs(r.laenge - original.laenge) <= 0.5, `Länge ${r.laenge.toFixed(3)} m (Ziel 3900–4200, Datei ${original.laenge}), gefahren ${(r.ziel - r.start).toFixed(1)} m`);
  melde(r.cps.length === 4 && r.cps.every((c, i) => c > r.start && c < r.ziel && (i === 0 || c > r.cps[i - 1])), `4 Checkpoints ${r.cps.join(' / ')} m in Reihenfolge zwischen Start ${r.start} m und Ziel ${r.ziel.toFixed(1)} m (Abstände ${[r.start, ...r.cps, r.ziel].slice(1).map((c, i, l) => Math.round(c - [r.start, ...r.cps][i])).join(' / ')} m)`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
// Testfahrer auf Finnland: einmal je Auto (für b, d und später n)
const FAHRTEN = {};
function fahrten(liste = ['prototyp', ...AUTOS]) {
  for (const id of liste) {
    if (FAHRTEN[id]) continue;
    const aus = path.join(LOG, `abfahren-${FI}-${id}.txt`);
    const r = werkzeug('strecke-abfahren.mjs', ['--strecke', FI, '--auto', id, '--tempo', '--aus', aus]);
    fs.writeFileSync(path.join(LOG, `abfahren-${FI}-${id}.log`), r.text);
    const bericht = fs.existsSync(aus) ? fs.readFileSync(aus, 'utf8') : '';
    const stile = {};
    for (const st of ['vorsichtig', 'mittel', 'flott']) {
      const block = (new RegExp(`^${st}: [\\s\\S]*?(?=^\\w+: |$(?![\\s\\S]))`, 'm').exec(bericht) || [''])[0];
      const zeile = (new RegExp(`^${st} +(\\S+) .*Aufpralle (\\d+), Gras (\\d+)x, Wandnähe (\\d+)x, Stillstand (\\d+)x`, 'm').exec(r.text) || []);
      const schnitt = (new RegExp(`^${st} [^\\n]*\\n +Schnitt ([\\d.]+) km/h, nahe Höchsttempo ([\\d.]+) %`, 'm').exec(r.text) || []);
      stile[st] = { zeit: zeile[1], aufpralle: +zeile[2], gras: +zeile[3], wand: +zeile[4], stand: +zeile[5], schnitt: +schnitt[1], nah: +schnitt[2],
        haenger: +((/hängen geblieben: (\d+)/.exec(block) || [])[1] || 0), stellen: ((/Aufprall-Stellen: (.*)/.exec(block) || [])[1] || '').trim(),
        profil: ((/Höchstes Tempo je 100 m: (.*)/.exec(block) || [])[1] || '').trim() };
    }
    FAHRTEN[id] = { code: r.code, stile };
  }
  return FAHRTEN;
}
// Unfall-Regel (Auftrag): vorsichtig und mittel bei allen null; flott dürfen Lanza 073 und (vor Teil C) Escorta
const FLOTT_ERLAUBT = process.env.M10B1_VOR_C ? ['l073', 'escorta'] : ['l073'];
if (teil('b')) {
  console.log('(b) Finnland: Testfahrer-Zeiten, Schnitt, Tempoprofil, Unfälle (strecke-abfahren, fünf Autos und Prototyp)');
  const F = fahrten();
  const p = F.prototyp.stile.vorsichtig;
  melde(F.prototyp.code === 0 && zeitSek(p.zeit) >= 152 && zeitSek(p.zeit) <= 178, `Prototyp vorsichtig ${p.zeit} (Richtwert ca. 2:35–2:55, ±3 s)${zeitSek(p.zeit) > 175 ? ' – knapp über 2:55' : ''}`);
  melde(p.schnitt >= 83 && p.schnitt <= 92, `Schnitt vorsichtig ${p.schnitt} km/h (Richtwert ca. 85–90; Alpen 73 km/h)${p.schnitt < 85 ? ' – knapp unter 85' : ''}`);
  melde(p.nah <= 45, `nahe Höchsttempo (ab 90 % des Höchsttempos dieses Laufs): ${p.nah} % der Strecke (höchstens ca. 45 %)`);
  info(`Tempoprofil Prototyp vorsichtig (höchstes Tempo je 100 m): ${p.profil}`);
  for (const id of ['prototyp', ...AUTOS]) {
    const S = F[id].stile;
    const zeiten = ['vorsichtig', 'mittel', 'flott'].map((st) => S[st].zeit).join(' / ');
    const rot = ['vorsichtig', 'mittel', 'flott'].filter((st) => S[st].aufpralle > 0 && !(st === 'flott' && FLOTT_ERLAUBT.includes(id)));
    melde(F[id].code === 0 && rot.length === 0, `${id}: ${zeiten} – Aufpralle ${['vorsichtig', 'mittel', 'flott'].map((st) => S[st].aufpralle).join(' / ')}${FLOTT_ERLAUBT.includes(id) ? ' (flott darf)' : ''}${rot.length ? `; nicht erlaubt: ${rot.map((st) => `${st} ${S[st].stellen}`).join('; ')}` : ''}`);
  }
}
if (teil('c')) {
  console.log('(c) Finnland: jeder Untergrundwechsel liegt an einer Einmündung/einem Abzweig (Daten und gebautes Netz)');
  const daten = (await import('../strecken/finnland.js')).default;
  melde(!daten.belagAbschnitte || daten.belagAbschnitte.length === 0, `keine belagAbschnitte (Wechsel ohne Abzweig) in strecken/finnland.js; ${daten.nebenwege.length} Nebenwege: ${daten.nebenwege.map((w) => `${w.name} ${w.abzweig}–${w.einmuendung} m (${w.belag})`).join(', ')}`);
  const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${FI}`);
  await bereit(s);
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, st = A.strecke, n = A.netz;
    const wechsel = [];
    for (let i = Math.ceil(st.startS) + 1; i <= st.zielS; i++) if (n.belag[i] !== n.belag[i - 1]) wechsel.push({ s: i, von: n.belag[i - 1], nach: n.belag[i] });
    const kreuz = n.nebenwege.flatMap((w) => [w.abzweig, w.einmuendung]);
    const stummel = n.stummel.map((a) => `${a.art} ${Math.round(a.sJ)} m (Sperre ${a.sperreArt}, Mündung ${a.muendung ? 'ja' : 'nein'})`);
    const notes = A.paceNotes.notes.filter((x) => /abzweig|einmuendung/.test(JSON.stringify(x))).length;
    return { wechsel, kreuz, stummel, notes };
  });
  const ohne = r.wechsel.filter((w) => !r.kreuz.some((k) => Math.abs(k - w.s) <= 1.5));
  melde(r.wechsel.length === 4 && ohne.length === 0, `${r.wechsel.length} Wechsel zwischen Start und Ziel (${r.wechsel.map((w) => `${w.s} m ${w.von}->${w.nach}`).join(', ')}), alle an Abzweig/Einmündung${ohne.length ? `; OHNE Kreuzung: ${ohne.map((w) => w.s).join(', ')}` : ''}`);
  melde(r.stummel.length === 4 && r.stummel.every((x) => /Mündung ja/.test(x)), `je Wechsel ein abgesperrter Asphalt-Stummel mit Einfahrt (wie Alpen): ${r.stummel.join('; ')}`);
  melde(r.notes >= 4, `Pace-Notes ABZWEIG/EINMÜNDUNG: ${r.notes}`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
if (teil('d')) {
  console.log('(d) Finnland: keine Klemmstellen (Testfahrer hängt nicht, steht nicht still, keine Felswand)');
  const F = fahrten();
  for (const id of ['prototyp', ...AUTOS]) {
    const S = F[id].stile;
    const klemm = ['vorsichtig', 'mittel'].filter((st) => S[st].haenger > 0 || S[st].stand > 0 || S[st].wand > 0);
    melde(klemm.length === 0, `${id}: vorsichtig/mittel hängen ${S.vorsichtig.haenger}/${S.mittel.haenger}, Stillstand ${S.vorsichtig.stand}/${S.mittel.stand}, Wandnähe ${S.vorsichtig.wand}/${S.mittel.wand}; flott hängen ${S.flott.haenger}, Stillstand ${S.flott.stand}`);
  }
}
if (teil('e')) {
  console.log('(e) Finnland: Abkürzungen (abkuerzungen.mjs --pruefen --strecke finnland)');
  const r = werkzeug('abkuerzungen.mjs', ['--pruefen', '--strecke', FI]);
  fs.writeFileSync(path.join(LOG, `abkuerzungen-${FI}.log`), r.text);
  const kern = (/übrige Linien je Kurve ([\d/]+|\(keine\))/.exec(r.text) || [])[1];
  const durch = +((/Durchkommen in gesperrten Kurven: (\d+)/.exec(r.text) || [])[1]);
  const zonen = [...r.text.matchAll(/übrig in Kurve ([\d – ]+): (\d+) Linien, Gewinn bis ([\d.]+) m/g)].map((m) => `${m[1].trim()} m: ${m[2]} Linien, bis ${m[3]} m`);
  const nicht = (/"nicht schneiden": (\d+), "schneiden": (\d+)/.exec(r.text) || []).slice(1);
  const gross = [...r.text.matchAll(/übrig in Kurve [\d – ]+: \d+ Linien, Gewinn bis ([\d.]+) m \(frei/g)].map((m) => +m[1]).filter((g) => g >= 12);
  melde(r.code === 0 && durch === 0 && gross.length === 0, `übrige Linien je Kurve ${kern}; gesperrt ${nicht[0]}, frei ${nicht[1]}; Durchkommen in gesperrten Kurven ${durch}; freie Kurven mit Gewinn ab 12 m: ${gross.length}`);
  info(`freie Kurven (Schneiden erlaubt, Pace-Note „schneiden“): ${zonen.join('; ')}`);
}
if (teil('f')) {
  console.log('(f) Bestzeiten mit revision: Alpen bleiben, Finnland nach dem Update leer, neuer Lauf schreibt finnland-r2');
  const alt = { zeit: 101.5, cps: [27, 59, 94], datum: '2026-10-20T10:00:00.000Z', auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 40, spur: [] };
  const alpenZeit = { ...alt, zeit: 162.3, cps: [30, 80, 120], datum: '2026-10-21T10:00:00.000Z' };
  const speicher = {
    'alpineRally.bestzeiten2': JSON.stringify({ passstrasse: { rt4: [alpenZeit] }, finnland: { rt4: [alt] } }),
    'alpineRally.letzterLauf': JSON.stringify({ finnland: { zeit: 101.5, cps: [27, 59, 94], spur: [], datum: '2026-10-20T10:00:00.000Z' } }),
  };
  const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${FI}&auto=rt4`, { speicher, auto: 'rt4' });
  await bereit(s);
  const vor = await s.page.evaluate(async () => {
    const B = await import('/js/bestzeiten.js'), I = await import('/js/inhalte.js'), W = await import('/js/etappenwahl.js');
    await W.ladeAlleInfos();
    return { etappe: I.ETAPPEN[0].id, fi: B.ladeBestzeiten(I.ETAPPEN[0].id, 'rt4').length, gesamt: B.ladeGesamtTop(I.ETAPPEN[0].id).length,
      alpen: B.ladeBestzeiten('passstrasse', 'rt4').map((x) => x.zeit), letzter: B.ladeLetztenLauf(I.ETAPPEN[0].id),
      infos: W.ETAPPEN_INFO.map((i) => `${i.id}:${i.etappe}`) };
  });
  melde(vor.etappe === 'finnland-r2' && vor.fi === 0 && vor.gesamt === 0 && vor.letzter == null, `Finnland nach dem Update: Schlüssel "${vor.etappe}", Bestzeiten Audan ${vor.fi}, Gesamt ${vor.gesamt}, letzter Lauf ${vor.letzter ? 'da' : 'leer'} (alte Zeit 1:41.50 unter "finnland" wird nicht gezeigt)`);
  melde(vor.alpen.join() === '162.3' && vor.infos.join() === 'alpen:passstrasse,finnland:finnland-r2', `Alpen-Bestzeit bleibt (${vor.alpen.join()}); Etappenwahl/Bestzeiten-Seite nutzen ${vor.infos.join(', ')}`);
  const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const lauf = await s.page.evaluate(async (code) => {
    const f = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
    const r = f.fahreEtappe(window.__alpineRally, 'mittel');
    await new Promise((ok) => { let n = 0; const g = () => (++n > 10 ? ok() : requestAnimationFrame(g)); requestAnimationFrame(g); });
    return { zeit: r.zeit, ziel: r.ziel, speicher: JSON.parse(localStorage.getItem('alpineRally.bestzeiten2')), letzter: JSON.parse(localStorage.getItem('alpineRally.letzterLauf')) };
  }, fahrerCode);
  const sp = lauf.speicher;
  melde(lauf.ziel && sp['finnland-r2'] && sp['finnland-r2'].rt4 && Math.abs(sp['finnland-r2'].rt4[0].zeit - lauf.zeit) < 0.01 && sp.finnland.rt4[0].zeit === 101.5 && sp.passstrasse.rt4[0].zeit === 162.3,
    `neuer Lauf (${lauf.zeit.toFixed(2)} s) unter "finnland-r2"; alte Finnland-Zeit liegt unverändert unter "finnland" (nicht gelöscht, nicht gezeigt); Alpen unverändert; Schlüssel: ${Object.keys(sp).join(', ')}`);
  melde(lauf.letzter['finnland-r2'] && Math.abs(lauf.letzter['finnland-r2'].zeit - lauf.zeit) < 0.01, `letzter Lauf unter "finnland-r2" (${lauf.letzter['finnland-r2'] && lauf.letzter['finnland-r2'].zeit})`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

// ===================================================================== Teil B: Wald, Deko, Dorf (g)–(l)
async function dekoDaten() {
  const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${FI}`);
  await bereit(s);
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, P = A.pflanzen, D = A.deko, L = A.leben, R = A.strassenrand, q = {};
    // Dichte: je Strassenseite und 100-m-Stück die Deko neben der Strecke (5 bis 30 m neben der Mitte, nicht hinter der Strasse)
    const n100 = Math.ceil(S.laenge / 100), zahl = [new Int32Array(n100), new Int32Array(n100)];
    const zaehle = (x, z) => { S.abfrage(x, z, q); if (q.abstand < 5 || q.abstand > 30) return; const k = Math.floor(Math.max(0, q.s) / 100); if (k < n100) zahl[q.seite > 0 ? 1 : 0][k]++; };
    for (const t of [...P.tannen, ...P.laubbaeume, ...P.steine, ...D.buesche, ...(D.unterholz || []), ...D.jungTannen]) zaehle(t.x, t.z);
    for (const h of [...L.hindernisse, ...(R.hindernisse || [])]) zaehle(h.x, h.z);
    // grösste Lücke je Seite (in Metern, auf 1 m genau: Deko je Meter)
    const meter = [new Uint8Array(Math.ceil(S.laenge) + 1), new Uint8Array(Math.ceil(S.laenge) + 1)];
    const mark = (x, z) => { S.abfrage(x, z, q); if (q.abstand < 5 || q.abstand > 30) return; const i = Math.round(Math.max(0, Math.min(S.laenge, q.s))); meter[q.seite > 0 ? 1 : 0][i] = 1; };
    for (const t of [...P.tannen, ...P.laubbaeume, ...P.steine, ...D.buesche, ...(D.unterholz || []), ...D.jungTannen]) mark(t.x, t.z);
    for (const h of [...L.hindernisse, ...(R.hindernisse || [])]) mark(h.x, h.z);
    const luecke = meter.map((m) => { let best = 0, von = 0, an = 0; for (let i = Math.ceil(S.startS); i <= S.zielS; i++) { if (m[i]) { if (i - an > best) { best = i - an; von = an; } an = i; } } return { best, von }; });
    // Bäume nahe der Strecke (bis 60 m): Fichten = Varianten 0-3 des Nordwald-Bilds, Kiefern 4-5, Birken = Laubbäume
    const nah = (t) => S.abfrage(t.x, t.z, q).abstand < 60;
    const ta = P.tannen.filter(nah), la = P.laubbaeume.filter(nah);
    const fichte = ta.filter((t) => t.variante < 4).length;
    // Dorf: Gebäude zwischen Einmündung und Abzweig
    const W = A.CONFIG.leben.wiesenweg, dorf = A.netz.nebenwege;
    const imDorf = (W.haeuser || []).filter((h) => h.s > dorf[0].einmuendung && h.s < dorf[1].abzweig);
    return { luecke, min100: zahl.map((z) => Math.min(...z.slice(0, n100 - 1))), fichte, kiefer: ta.length - fichte, birke: la.length,
      unterholz: (D.unterholz || []).length, dorf: imDorf.map((h) => `${h.typ}${h.dach ? '/' + h.dach : ''}`), abgelehnt: L.statistik.abgelehnt.slice(),
      deko: A.CONFIG.deko, fehler: null };
  });
  r.fehler = s.fehler.slice();
  await s.schliessen();
  return r;
}
let DEKO_D = null;
if (teil('g') || teil('h') || teil('i')) DEKO_D = await dekoDaten();
if (teil('g')) {
  console.log('(g) Finnland: keine Lücke über 150 m ohne Deko neben der Strecke (beide Seiten, 5–30 m neben der Mitte)');
  const [l, r] = DEKO_D.luecke;
  melde(l.best <= 150 && r.best <= 150, `grösste Lücke links ${l.best} m (ab ${l.von} m), rechts ${r.best} m (ab ${r.von} m); kleinste Zahl je 100 m: links ${DEKO_D.min100[0]}, rechts ${DEKO_D.min100[1]}; Unterholz ${DEKO_D.unterholz} Stück`);
}
if (teil('h')) {
  console.log('(h) Finnland: Dorf mit 5–6 Gebäuden in mindestens 3 Bauarten');
  const arten = new Set(DEKO_D.dorf.map((x) => x.split('/')[0]));
  const daecher = new Set(DEKO_D.dorf.map((x) => x.split('/')[1] || 'grau'));
  melde(DEKO_D.dorf.length >= 5 && DEKO_D.dorf.length <= 6 && arten.size >= 3, `${DEKO_D.dorf.length} Gebäude im Dorf (${DEKO_D.dorf.join(', ')}), ${arten.size} Bauarten, ${daecher.size} Dachfarben`);
  melde(DEKO_D.abgelehnt.length === 0, `alle Objekte stehen (abgelehnt: ${DEKO_D.abgelehnt.join(', ') || 'keins'})`);
  melde(DEKO_D.fehler.length === 0, `Konsole ohne Fehler (${DEKO_D.fehler.length})`);
}
if (teil('i')) {
  console.log('(i) Finnland: Baum-Anteile (Richtwert Fichte/Tanne 55 %, Kiefer 30 %, Birke 15 %)');
  const n = DEKO_D.fichte + DEKO_D.kiefer + DEKO_D.birke, p = (x) => (100 * x) / n;
  melde(Math.abs(p(DEKO_D.fichte) - 55) <= 5 && Math.abs(p(DEKO_D.kiefer) - 30) <= 5 && Math.abs(p(DEKO_D.birke) - 15) <= 5,
    `${n} Bäume bis 60 m neben der Strecke: Fichten ${p(DEKO_D.fichte).toFixed(1)} %, Kiefern ${p(DEKO_D.kiefer).toFixed(1)} %, Birken ${p(DEKO_D.birke).toFixed(1)} % (je ±5 %)`);
  melde(DEKO_D.deko.nadelbaum === 'nordwald' && DEKO_D.deko.unterholz === 'nordisch' && DEKO_D.deko.tierschild === 'elch', `Deko-Set: nadelbaum ${DEKO_D.deko.nadelbaum}, laubbaum ${DEKO_D.deko.laubbaum}, unterholz ${DEKO_D.deko.unterholz}, tierschild ${DEKO_D.deko.tierschild}`);
}
if (teil('j')) {
  console.log('(j) Farbtest der Baum-Pixel (Kronen dunkelgrün, Stämme nicht orange; Alpen-Tanne unverändert)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  const r = await s.page.evaluate(async () => {
    const P = await import('/js/pixel.js');
    const lesen = (t) => { const c = t.image; return c.getContext('2d').getImageData(0, 0, c.width, c.height); };
    // Krone = grünliche Pixel (g > r), Stamm = Pixel mit r > g (braun/orange/grau)
    const mittel = (tex, von = 0, bis = tex.varianten) => {
      const d = lesen(tex.textur), B = d.width / tex.varianten, k = [0, 0, 0, 0], st = [0, 0, 0, 0];
      for (let y = 0; y < d.height; y++) for (let x = von * B; x < bis * B; x++) {
        const i = (y * d.width + x) * 4; if (d.data[i + 3] < 128) continue;
        const [r, g, b] = [d.data[i], d.data[i + 1], d.data[i + 2]];
        const z = g > r ? k : st; z[0] += r; z[1] += g; z[2] += b; z[3]++;
      }
      const m = (z) => (z[3] ? [z[0] / z[3], z[1] / z[3], z[2] / z[3]].map(Math.round) : null);
      return { krone: m(k), stamm: m(st), kroneN: k[3], stammN: st[3] };
    };
    const nw = P.nordwaldTextur(), birke = P.birkenTextur();
    return { fichte: mittel(nw, 0, P.NORDWALD.fichten), kiefer: mittel(nw, P.NORDWALD.fichten), birke: mittel(birke), tanne: mittel(P.tannenTextur()) };
  });
  await s.schliessen();
  const hell = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  const dunkelgruen = (c) => c && c[1] > c[0] && c[1] >= c[2] && hell(c) < 75;
  const orange = (c) => c && c[0] - c[2] > 45 && c[0] > 110; // stark rot-gelb und hell = orange
  melde(dunkelgruen(r.fichte.krone) && dunkelgruen(r.kiefer.krone), `Kronen dunkelgrün: Fichte rgb(${r.fichte.krone}) Helligkeit ${hell(r.fichte.krone).toFixed(0)}, Kiefer rgb(${r.kiefer.krone}) ${hell(r.kiefer.krone).toFixed(0)} (Grenze < 75; Alpen-Tanne rgb(${r.tanne.krone}) ${hell(r.tanne.krone).toFixed(0)})`);
  melde(!orange(r.fichte.stamm) && !orange(r.kiefer.stamm), `Stämme nicht orange: Fichte rgb(${r.fichte.stamm}) (${r.fichte.stammN} Pixel), Kiefer rgb(${r.kiefer.stamm}) (${r.kiefer.stammN} Pixel); Stamm-Anteil Fichte ${(100 * r.fichte.stammN / (r.fichte.stammN + r.fichte.kroneN)).toFixed(1)} %, Kiefer ${(100 * r.kiefer.stammN / (r.kiefer.stammN + r.kiefer.kroneN)).toFixed(1)} %`);
  melde(r.birke.krone && r.birke.krone[1] > r.birke.krone[0] + 25 && hell(r.birke.krone) < 110, `Birkenlaub grün, nicht gelb-orange: rgb(${r.birke.krone}) Helligkeit ${hell(r.birke.krone).toFixed(0)}`);
}
if (teil('k')) {
  console.log('(k) Bildzeit Finnland gegen 0.10b (höchstens +10 %), Alpen unverändert; kein Garbage pro Bild');
  if (!ALT) info('nur mit --alt');
  else {
    // je zwei Messungen, die bessere zählt (Software-Grafik im Test-Browser streut)
    const mess = async (w, extra, sM) => { const a = await leistung(w, extra, sM), b = await leistung(w, extra, sM); return a.ms <= b.ms ? a : b; };
    const fn = await mess(WURZEL, `&strecke=${FI}`, 600), fa = await mess(ALT, `&strecke=${FI}`, 640);
    const an = await mess(WURZEL), aa = await mess(ALT);
    BILDZEIT.finnland = fn.ms;
    melde(fn.ms <= fa.ms * 1.10, `Bildzeit Finnland im Wald (Vollgas, 4 s): 0.10b ${fa.ms.toFixed(1)} ms, jetzt ${fn.ms.toFixed(1)} ms (${((fn.ms / fa.ms - 1) * 100).toFixed(1)} %, höchstens +10 %)`);
    melde(an.ms <= aa.ms * 1.10, `Bildzeit Alpen (Passhöhe): 0.10b ${aa.ms.toFixed(1)} ms, jetzt ${an.ms.toFixed(1)} ms (${((an.ms / aa.ms - 1) * 100).toFixed(1)} %, Streuung ±10 %)`);
    melde(fn.rest < fa.rest + 300000 && an.rest < aa.rest + 300000, `Speicher nach 4 s Fahren (nach GC): Finnland ${(fn.rest / 1024).toFixed(0)} KB (0.10b ${(fa.rest / 1024).toFixed(0)} KB), Alpen ${(an.rest / 1024).toFixed(0)} KB (0.10b ${(aa.rest / 1024).toFixed(0)} KB) – kein Leck`);
  }
}

//@@TEILE@@

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
    melde(r.code === 0 || vorher, `${datei} ${a.join(' ')}: ${z.length - rot.length} ok, ${rot.length} rot${vorher ? ' (genau diese Zeilen sind schon in 0.10b rot)' : ''}${rot.length ? ` – ${rot.slice(0, 2).map((x) => x.slice(0, 150)).join(' | ')}` : ''}`);
  }
  // Messdateien, die alte Tests neu schreiben, zurücksetzen
  const neu = spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter((d) => d && !vorher.has(d) && /^(screenshots|tools)\//.test(d));
  if (neu.length) spawnSync('git', ['checkout', '--', ...neu], { cwd: WURZEL });
  info(`von den alten Tests geänderte Messdateien zurückgesetzt: ${neu.length}`);
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);