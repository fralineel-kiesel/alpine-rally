// Meilenstein 10b prüfen:  node tools/m10b-test.mjs --alt <ordner 0.10a> [--nur a,b,...] [--lang]
// (0.10a: git worktree add <ordner> e7054e3). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein Safari.
// Vorlage: tools/m10a-test.mjs (Prüfungen dort umbenannt, siehe Buchstaben).
//   Teil A – Alpen-Spezifisches zu Daten, Werkzeuge mit Streckenwahl:
//   (a) Alpen gleich wie 0.10a: Länge/Abkürzungen (a1), Testfahrer alle Autos (a2), Pace-Notes/Strecke/CONFIG (a3),
//       Bilder pixelgleich an festen Punkten (a4), Ton (a5)
//   (b) Prüfer: alpen.js (neu und 0.10a) gültig, kaputte Varianten abgelehnt (auch deko/sprung/untergrundInfo)
//   (c) grep: nichts Alpines im Spielcode (Namen, Zahlen, Motive)
//   (d) Werkzeuge mit --strecke alpen wie vorher (Karte, Abfahren, Abkürzungen)
//   Teil B – Finnland: (e) Prüfer, (f) Länge/Checkpoints/Start/Ziel, (g) Testfahrer fünf Autos, (h) Abkürzungen,
//       (i) Bilder (nur Ansicht), (j) Finnland nicht beim Start geladen, Ladezeit/Bildzeit/Garbage Alpen
//   Teil C – Etappenwahl: (k) Auswahl startet gewählte Strecke, (l) Bestzeiten getrennt, (m) vorbefüllte Alpen-Bestzeiten,
//       (n) Umschalter Bestzeiten-Seite, (o) Live-Vergleich/Zielbildschirm Finnland, (p) Etappe bleibt nach Neuladen,
//       (q) Layout alle Fenstergrössen, (r) Bedienung Tastatur/Gamepad/Maus/Touch, (s) Fehlerfall Finnland kaputt
//   Teil D – (u) mit --lang: frühere Tests

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k) || NUR.includes(k[0]); // a1..a5 gehören zu a
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m10b';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M10B_AUTOS ? process.env.M10B_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const BASIS = 'e7054e3'; // 0.10a
if (!ALT) info(`Vergleiche gegen 0.10a nur mit --alt <ordner> (git worktree add <ordner> ${BASIS})`);

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

// ===================================================================== (a) Prüfer
if (teil('b')) {
  console.log('(b) Prüfer: strecken/alpen.js gültig, kaputte Varianten abgelehnt');
  const ok = werkzeug('strecke-pruefen.mjs', ['strecken/alpen.js']);
  melde(ok.code === 0, `tools/strecke-pruefen.mjs strecken/alpen.js: Rückgabe ${ok.code} – ${ok.text.trim().split('\n')[0]}`);
  const { pruefeStrecke, BELAEGE, SEEDS } = await import('../js/streckenpruefung.js');
  const { CONFIG } = await import('../js/config.js');
  melde(JSON.stringify(Object.keys(CONFIG.belaege)) === JSON.stringify(BELAEGE), `bekannte Beläge im Prüfer = config.belaege (${BELAEGE.join(', ')})`);
  const original = (await import('../strecken/alpen.js')).default;
  const roh = () => JSON.parse(JSON.stringify(original));
  // Fälle: [Name, Änderung, erwarteter Pfad im Fehler]
  const faelle = [];
  for (const k of ['format', 'id', 'etappe', 'name', 'beschreibung', 'laenge', 'seeds', 'abschnitte', 'punkte', 'strasse', 'checkpoints', 'nebenwege', 'umgebung',
    'natur', 'startZiel', 'leben', 'beschriftung', 'klang', 'abkuerzung', 'erzeugt']) faelle.push([`ohne ${k}`, (d) => { delete d[k]; }, `${k}:`]);
  faelle.push(['format 2', (d) => { d.format = 2; }, 'format:']);
  faelle.push(['id mit Grossbuchstaben', (d) => { d.id = 'Alpen'; }, 'id:']);
  faelle.push(['name klein', (d) => { d.name.de = 'Passstrasse'; }, 'name.de:']);
  faelle.push(['laenge 50', (d) => { d.laenge = 50; }, 'laenge:']);
  faelle.push(['laenge passt nicht zu den Punkten', (d) => { d.laenge = 4200; }, 'laenge:']);
  for (const k of SEEDS) faelle.push([`ohne seeds.${k}`, (d) => { delete d.seeds[k]; }, `seeds.${k}:`]);
  faelle.push(['seed negativ', (d) => { d.seeds.sprites = -3; }, 'seeds.sprites:']);
  faelle.push(['abschnitt wald 2', (d) => { d.abschnitte.Almweg.wald = 2; }, 'abschnitte["Almweg"].wald:']);
  faelle.push(['abschnitt wand oben', (d) => { d.abschnitte['Felswand 1'].wand = 'oben'; }, 'abschnitte["Felswand 1"].wand:']);
  faelle.push(['punkte ohne Abschnitt am Anfang', (d) => { d.punkte.shift(); }, 'punkte[0]:']);
  faelle.push(['unbekannter Abschnitt', (d) => { d.punkte[0] = 'Mondbasis'; }, 'punkte[0]:']);
  faelle.push(['Punkt mit zwei Zahlen', (d) => { d.punkte[3] = [0, -25]; }, 'punkte[3]:']);
  faelle.push(['Lücke in den Punkten', (d) => { d.punkte.splice(4, 4); }, 'punkte[4]:']);
  faelle.push(['Sprung in der Höhe', (d) => { d.punkte[5][2] = 30; }, 'punkte[5]:']);
  faelle.push(['Knick', (d) => { d.punkte[5] = [20, -125, 0]; }, 'punkte[']);
  faelle.push(['Punkt doppelt', (d) => { d.punkte.splice(3, 0, [...d.punkte[2]]); }, 'punkte[3]:']);
  faelle.push(['spawn hinter Start', (d) => { d.strasse.spawnBeiMeter = 30; }, 'strasse.spawnBeiMeter:']);
  faelle.push(['Checkpoint vor dem Start', (d) => { d.checkpoints[0] = 40; }, 'checkpoints[0]:']);
  faelle.push(['Checkpoint hinter dem Ziel', (d) => { d.checkpoints[2] = 3650; }, 'checkpoints[2]:']);
  faelle.push(['Checkpoints vertauscht', (d) => { d.checkpoints = [1870, 900, 2880]; }, 'checkpoints[1]:']);
  faelle.push(['keine Checkpoints', (d) => { d.checkpoints = []; }, 'checkpoints:']);
  faelle.push(['unbekannter Belag', (d) => { d.nebenwege[1].belag = 'eis'; }, 'nebenwege[1].belag:']);
  faelle.push(['Nebenweg verkehrt', (d) => { d.nebenwege[0].einmuendung = 700; }, 'nebenwege[0]:']);
  faelle.push(['Nebenwege überlappen', (d) => { d.nebenwege[1].abzweig = 1000; }, 'nebenwege[1]:']);
  faelle.push(['unbekannte Absperrung', (d) => { d.nebenwege[0].sperreAbzweig = 'mauer'; }, 'nebenwege[0].sperreAbzweig:']);
  faelle.push(['Farbe kaputt', (d) => { d.umgebung.farben.gras = 'grün'; }, 'umgebung.farben.gras:']);
  faelle.push(['Nebel verkehrt', (d) => { d.umgebung.nebel.ende = 50; }, 'umgebung.nebel:']);
  faelle.push(['Nebel zu dicht', (d) => { d.umgebung.nebel.maxDichte = 3; }, 'umgebung.nebel.maxDichte:']);
  faelle.push(['Hügel ohne Radius', (d) => { d.umgebung.landschaft[0].radius = 0; }, 'umgebung.landschaft[0]:']);
  faelle.push(['Böen in unbekanntem Abschnitt', (d) => { d.klang.boeenAbschnitt = 'Mond'; }, 'klang.boeenAbschnitt:']);
  faelle.push(['Fan-Spot ohne Publikum', (d) => { delete d.klang.publikumOrte.pass; }, 'klang.publikumOrte:']);
  faelle.push(['Banner fehlt', (d) => { delete d.beschriftung.banner.alm; }, 'leben.fans.spots[2].banner:']);
  faelle.push(['Sperr-Thema unbekannt', (d) => { d.abkuerzung.sperrThemen = { 1400: 'lava' }; }, 'abkuerzung.sperrThemen["1400"]:']);
  faelle.push(['Abkürzungen zu anderer Länge', (d) => { d.erzeugt.abkuerzungen.streckenLaenge = 3000; }, 'erzeugt.abkuerzungen.streckenLaenge:']);
  faelle.push(['Kurventempo kaputt', (d) => { d.erzeugt.kurvenTempo.kurven[0].bis = 100; }, 'erzeugt.kurvenTempo.kurven[0]:']);
  faelle.push(['Baumfolge zu anderem Seed', (d) => { d.erzeugt.baumfolge.seed = 1; }, 'erzeugt.baumfolge.seed:']);
  faelle.push(['Kurventempo fehlt', (d) => { delete d.erzeugt.kurvenTempo; }, 'erzeugt.kurvenTempo:']);
  // M10b: neue, freiwillige Felder
  faelle.push(['untergrundInfo klein', (d) => { d.untergrundInfo.de = 'Schotter'; }, 'untergrundInfo.de:']);
  faelle.push(['untergrundInfo ohne en', (d) => { delete d.untergrundInfo.en; }, 'untergrundInfo.en:']);
  faelle.push(['untergrundInfo zu lang', (d) => { d.untergrundInfo.de = 'ASPHALT, SCHOTTER UND WIESENWEG'; }, 'untergrundInfo.de:']);
  faelle.push(['untergrundInfo kein Objekt', (d) => { d.untergrundInfo = 'SCHOTTER'; }, 'untergrundInfo:']);
  faelle.push(['deko kein Objekt', (d) => { d.deko = ['kuh']; }, 'deko:']);
  faelle.push(['deko Fahne unbekannt', (d) => { d.deko.fahne = 'mond'; }, 'deko.fahne:']);
  faelle.push(['deko Tier unbekannt', (d) => { d.deko.tier = 'lama'; }, 'deko.tier:']);
  faelle.push(['deko Haus unbekannt', (d) => { d.deko.haus = 'iglu'; }, 'deko.haus:']);
  faelle.push(['deko Baum unbekannt', (d) => { d.deko.nadelbaum = 'palme'; }, 'deko.nadelbaum:']);
  faelle.push(['deko Feld unbekannt', (d) => { d.deko.wetter = 'regen'; }, 'deko.wetter:']);
  faelle.push(['sprung keine Liste', (d) => { d.sprung = { s: 100 }; }, 'sprung:']);
  faelle.push(['sprung ohne Namen', (d) => { d.sprung = [{ s: 500 }]; }, 'sprung[0]:']);
  faelle.push(['sprung hinter dem Ende', (d) => { d.sprung = [{ s: 9000, name: 'WEG' }]; }, 'sprung[0].s:']);
  faelle.push(['sprung verkehrt', (d) => { d.sprung = [{ s: 900, name: 'A' }, { s: 500, name: 'B' }]; }, 'sprung[1].s:']);
  faelle.push(['Wasser-Klang kaputt', (d) => { d.klang.wasser = [[100]]; }, 'klang.wasser:']);
  let gut = 0;
  const schlecht = [];
  for (const [name, aendere, pfad] of faelle) {
    const d = roh(); aendere(d);
    const f = pruefeStrecke(d, { voll: true });
    if (f.length && f.some((x) => x.startsWith(pfad))) gut++; else schlecht.push(`${name} -> ${f[0] || 'kein Fehler'}`);
  }
  melde(schlecht.length === 0, `${gut} von ${faelle.length} kaputten Varianten abgelehnt, mit Pfad im Fehler${schlecht.length ? `; nicht erkannt: ${schlecht.slice(0, 4).join(' | ')}` : ''}`);
  // Werkzeug selbst: Rückgabe 1 und Meldung mit Pfad (Datei im Protokoll-Ordner, nicht im Repo)
  const d = roh(); d.checkpoints[2] = 3650;
  fs.writeFileSync(path.join(LOG, 'kaputt.js'), `export default ${JSON.stringify(d)};\n`);
  const k = werkzeug('strecke-pruefen.mjs', [path.join(LOG, 'kaputt.js')]);
  melde(k.code === 1 && /checkpoints\[2\]: 3650 liegt hinter dem Ziel/.test(k.text), `Werkzeug mit kaputter Datei: Rückgabe ${k.code}, Meldung „${(k.text.split('\n')[1] || '').trim()}“`);
  fs.writeFileSync(path.join(LOG, 'syntax.js'), 'export default { format: 1, \n');
  const sx = werkzeug('strecke-pruefen.mjs', [path.join(LOG, 'syntax.js')]);
  melde(sx.code === 1, `Werkzeug mit Datei voller Tippfehler: Rückgabe ${sx.code} (${sx.text.trim().slice(0, 90)})`);
  const schnell = pruefeStrecke(roh());
  melde(schnell.length === 0, 'schnelle Prüfung des Laders (Version, Pflichtfelder) akzeptiert alpen.js');
  // M10b: alte Datei (0.10a, ohne deko/untergrundInfo/sprung) bleibt gültig
  if (ALT) {
    const a = werkzeug('strecke-pruefen.mjs', [path.join(ALT, 'strecken/alpen.js')]);
    melde(a.code === 0, `alte strecken/alpen.js aus 0.10a (ohne neue Felder) gültig: ${a.text.trim().split('\n')[0].slice(0, 90)}`);
  }
  // M10b: bekannte Deko-Typen im Prüfer = Pixelfunktionen im Code (im Browser, die Bilder brauchen Three.js)
  {
    const { DEKO } = await import('../js/streckenpruefung.js');
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
    await bereit(s);
    const code = await s.page.evaluate(async () => {
      const [mo, ku, le, px] = await Promise.all(['/js/motive.js', '/js/kuhbild.js', '/js/leben.js', '/js/pixel.js'].map((u) => import(u)));
      return { fahne: Object.keys(mo.FAHNEN), tier: ku.TIER_TYPEN, haus: Object.keys(le.HAUS_TYPEN), nadelbaum: px.BAUM_TYPEN.nadelbaum, laubbaum: px.BAUM_TYPEN.laubbaum };
    });
    await s.schliessen();
    const gleich = ['fahne', 'tier', 'haus', 'nadelbaum', 'laubbaum'].every((k) => JSON.stringify([...DEKO[k]].sort()) === JSON.stringify([...code[k]].sort())) && JSON.stringify(DEKO.stadel) === JSON.stringify(DEKO.haus);
    melde(gleich, `Deko-Typen im Prüfer = Code: Fahnen ${code.fahne.join('/')}, Tiere ${code.tier.join('/')}, Häuser ${code.haus.join('/')}, Bäume ${code.nadelbaum.join('/')} + ${code.laubbaum.join('/')}`);
  }
}

// ===================================================================== (b) Länge und Abkürzungen
if (teil('a1')) {
  console.log('(a1) Länge und Abkürzungen');
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
if (teil('a2')) {
  console.log('(a2) Testfahrer: Prototyp und fünf Autos gleich wie 0.10a');
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
    melde(gleich, `${id}: ${zeiten} – ${zn.length} Zeilen (Zeiten, Checkpoints, Aufpralle, Abstände, Gänge, Nebenwege) ${gleich ? 'identisch' : 'ANDERS'} wie 0.10a${id === 'prototyp' ? ' (Referenz 2:59.33 / 2:42.35 / 2:31.92)' : ''}`);
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
if (teil('a3')) {
  console.log('(a3) Pace-Notes, Checkpoints, Abschnitte, Strassenpunkte, CONFIG');
  const neu = await streckenAbdruck(WURZEL);
  info(`${neu.notes.length} Pace-Notes, Checkpoints ${neu.checkpoints}`);
  if (ALT) {
    const alt = await streckenAbdruck(ALT);
    const anders = neu.notes.filter((n, i) => n !== alt.notes[i]).length + Math.abs(neu.notes.length - alt.notes.length);
    melde(anders === 0 && neu.notes.length >= 20, `Pace-Notes: ${neu.notes.length} Ansagen, Symbole/Zusätze/Stellen/Reihenfolge ${anders ? `${anders} anders` : 'identisch'} wie 0.10a`);
    melde(neu.checkpoints === alt.checkpoints, `Checkpoints gleich (${neu.checkpoints})`);
    melde(neu.abschnitte === alt.abschnitte, 'Abschnitte gleich (Namen, Bäume, Wald, Felswand, von/bis)');
    melde(neu.punkte === alt.punkte && neu.laenge === alt.laenge && neu.start === alt.start && neu.ziel === alt.ziel, `Strassenpunkte (1-m-Raster, Richtung, Felswand, Baumdichte) bit-gleich, Länge ${neu.laenge} = ${alt.laenge}`);
    // CONFIG: gleich bis auf die Reihenfolge innerhalb von "leben" (Seeds kommen aus "seeds") und die Version
    // (M10b: Fahnen-Art 'kreuz' heisst jetzt 'motiv' = Landesfahne der Strecke; gleiche Wirkung, darum gleichgesetzt)
    const ordne = (o) => (Array.isArray(o) ? o.map(ordne) : o && typeof o === 'object' ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, ordne(o[k])])) : o === 'motiv' ? 'kreuz' : o);
    const cn = ordne(JSON.parse(neu.config)), ca = ordne(JSON.parse(alt.config));
    const NEU_M10B = ['deko', 'klangWasser', 'belagAbschnitte', 'wasser']; // neue Blöcke in M10b (gleiche Wirkung: Wahl der Alpen wie vorher im Code)
    const unterschiede = Object.keys({ ...ca, ...cn }).filter((k) => !NEU_M10B.includes(k) && JSON.stringify(ca[k]) !== JSON.stringify(cn[k]));
    melde(unterschiede.length === 0, `CONFIG (alle Werte, sortiert) gleich wie 0.10a${unterschiede.length ? `; anders: ${unterschiede.join(', ')}` : ''}`);
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
if (teil('a4')) {
  console.log('(a4) Bildvergleich gegen 0.10a (eigene Bild-Uhr, gleiche Seeds)');
  if (!ALT) info('nur mit --alt');
  else {
    const neu = await bilderVon(WURZEL), alt = await bilderVon(process.env.M10B_SELBST ? WURZEL : ALT); // (M10B_SELBST=1: Gegenkontrolle neu gegen neu)
    const s = await starteSpiel({ breite: 320, hoehe: 200 });
    await s.page.goto(`${s.url}/tools/leer.html`).catch(() => {});
    const paare = Object.keys(neu).filter((k) => k !== 'seiten' && k !== 'fehler').map((k) => [k, neu[k], alt[k]])
      .concat(Object.keys(neu.seiten).map((k) => [`menü ${k}`, neu.seiten[k], alt.seiten[k]]));
    const rot = [], nurVersion = [];
    // Seit Teil D steht 0.10b statt 0.10a in der Versionszeile (Titel, Credits): dort darf genau diese eine Textzeile
    // anders sein (Unterschied höchstens 7 Pixel hoch, ganz in der Zeile, in der die Version steht)
    const versionsZeile = (k, box) => box && box[3] - box[1] <= 7 && ((/^(titel|demo)$/.test(k) && box[0] >= 230 && box[1] >= 168) || k === 'menü credits');
    for (const [k, n, a] of paare) {
      const v = await vergleiche(s.page, a, n, k === 'rt4-weide' || k === 'titel');
      if (v.anders !== 0 && versionsZeile(k, v.box)) nurVersion.push(`${k} (${v.anders} Pixel in x ${v.box[0]}–${v.box[2]}, y ${v.box[1]}–${v.box[3]})`);
      else if (v.anders !== 0) rot.push(`${k}: ${v.anders} Pixel (${v.box})`);
      if (v.url) fs.writeFileSync(path.join(LOG, `vergleich-${k}.png`), Buffer.from(v.url.split(',')[1], 'base64'));
    }
    // Gegenprobe: zwei verschiedene Punkte sind verschieden (der Vergleich sieht Unterschiede)
    const gegen = await vergleiche(s.page, neu['rt4-pass'], neu['rt4-weide']);
    await s.schliessen();
    for (const [k, b] of Object.entries(neu)) if (typeof b === 'string') fs.writeFileSync(path.join(LOG, `neu-${k}.png`), Buffer.from(b.split(',')[1], 'base64'));
    melde(rot.length === 0, `${paare.length} Bilder verglichen: ${paare.length - nurVersion.length} pixelgleich wie 0.10a, ${nurVersion.length} bis auf die Versionszeile (Titel, Demo-Fahrt, Start, ${PUNKTE.length - 1} Streckenpunkte, fünf Autos am Start und auf der Passhöhe mit Tachos und Minimap, ${Object.keys(neu.seiten).length} Menüseiten inkl. Bestzeiten)${rot.length ? `; anders: ${rot.join(', ')}` : ''}`);
    if (nurVersion.length) info(`nur die Versionszeile anders (0.10a -> 0.10b): ${nurVersion.join(', ')}`);
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
if (teil('a5')) {
  console.log('(a5) Ton gleich');
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
    melde(geaendert.length === 0, `Ton-Code unverändert seit 0.10a (${dateien.join(', ')}; umgebung.js geändert, Wirkung für die Alpen gleich)${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
    // Offline gerechnete Klänge (OfflineAudioContext): Messzahlen von ton-umgebung-test in beiden Ständen
    const zahlen = (t) => t.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x)).map((x) => x.replace(/\d+(\.\d+)? ?ms\b/g, 'X ms').trim());
    // Diese Zeilen messen in Echtzeit im laufenden Spiel (Tiefpass/Pegel mitten im Übergang, Zeitpunkt des Stopps,
    // Ton-Labor live): sie schwanken schon zwischen zwei Läufen desselben Stands (gemessen) und werden nur gemeldet.
    // "Pause: leise Variante" und "aus der Pause zum Hauptmenü" sind darum auch in 0.10a manchmal rot (alte Wackel-Tests aus M7b)
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
    melde(zn.length > 20 && zn.length === za.length && anders.length === 0 && rotN === 0, `ton-umgebung-test (Glocken, Publikum, Vögel, Brunnen, Böen, Musik offline gerechnet): ${zn.length} Messzeilen, ohne die ${zn.filter((x) => ECHTZEIT.test(x)).length} Echtzeit-Zeilen ${anders.length ? `${anders.length} anders` : 'Zahl für Zahl gleich'} wie 0.10a (rot: neu ${zn.filter((x) => x.startsWith('FEHLER')).length}, alt ${za.filter((x) => x.startsWith('FEHLER')).length}, nur Echtzeit-Zeilen)`);
    if (anders.length) info(`erste Abweichung: ${anders[0].slice(0, 200)}`);
  }
}

// ===================================================================== (g) Bestzeiten
if (teil('m')) {
  console.log('(m) Bestzeiten: alte bleiben, neuer Lauf schreibt richtig');
  const alteZeit = { zeit: 140.12, cps: [27.1, 75.2, 112.3], datum: '2026-09-01T10:00:00.000Z', auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 51, spur: [] };
  const speicher = {
    'alpineRally.bestzeiten2': JSON.stringify({ passstrasse: { rt4: [alteZeit], l073: [{ ...alteZeit, zeit: 139.5, auto: 'l073' }] } }),
    'alpineRally.letzterLauf': JSON.stringify({ passstrasse: { zeit: 150, cps: [30, 80, 120], spur: [], datum: '2026-09-02T10:00:00.000Z' } }),
  };
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&auto=rt4', { speicher, auto: 'rt4' });
  await bereit(s);
  const vor = await s.page.evaluate(async () => {
    const B = await import('/js/bestzeiten.js'), I = await import('/js/inhalte.js');
    return { etappe: I.ETAPPEN[0].id, rt4: B.ladeBestzeiten(I.ETAPPEN[0].id, 'rt4').map((x) => x.zeit), gesamt: B.ladeGesamtTop(I.ETAPPEN[0].id).map((x) => `${x.auto} ${x.zeit}`), schluessel: B.BESTZEITEN_SCHLUESSEL };
  });
  melde(vor.etappe === 'passstrasse' && vor.schluessel === 'alpineRally.bestzeiten2', `Etappen-Kennung "${vor.etappe}", Speicher "${vor.schluessel}" (wie 0.10a)`);
  melde(vor.rt4[0] === 140.12 && vor.gesamt.join() === 'l073 139.5,rt4 140.12', `vorbefüllte Bestzeiten sichtbar: Audan ${vor.rt4.join(', ')}, Gesamt ${vor.gesamt.join(' / ')}`);
  const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const lauf = await s.page.evaluate(async (code) => {
    const f = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
    const r = f.fahreEtappe(window.__alpineRally, 'flott');
    await new Promise((ok) => { let n = 0; const g = () => (++n > 10 ? ok() : requestAnimationFrame(g)); requestAnimationFrame(g); });
    return { zeit: r.zeit, ziel: r.ziel, speicher: JSON.parse(localStorage.getItem('alpineRally.bestzeiten2')), letzter: JSON.parse(localStorage.getItem('alpineRally.letzterLauf')) };
  }, fahrerCode);
  const rt4 = lauf.speicher.passstrasse.rt4.map((x) => x.zeit);
  melde(lauf.ziel && Object.keys(lauf.speicher).join() === 'passstrasse' && rt4.includes(140.12) && rt4.length === 2 && lauf.speicher.passstrasse.l073[0].zeit === 139.5,
    `neuer Lauf (${lauf.zeit.toFixed(2)} s): unter passstrasse.rt4 jetzt ${rt4.join(', ')}; alte Zeiten (Audan, Lanza 073) erhalten; keine neue Etappen-Kennung`);
  melde(lauf.letzter && lauf.letzter.passstrasse && Math.abs(lauf.letzter.passstrasse.zeit - lauf.zeit) < 0.01, `letzter Lauf unter passstrasse überschrieben (${lauf.letzter.passstrasse.zeit})`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

// ===================================================================== (h) Fehlerseite
if (teil('s')) {
  console.log('(s) Fehlende oder kaputte Streckendatei: Fehlerseite');
  const original = fs.readFileSync(path.join(WURZEL, 'strecken/alpen.js'), 'utf8');
  const faelle = [
    ['fehlt (404)', (r) => r.fulfill({ status: 404, body: 'nicht da' }), 'datei'],
    ['Tippfehler im Code', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: original.slice(0, 5000) }), 'datei'],
    ['falsche Version', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: original.replace('format: 1,', 'format: 2,') }), 'ungueltig'],
    ['Pflichtfeld fehlt', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: original.replace('  checkpoints: [', '  checkpunkte: [') }), 'ungueltig'],
    ['Länge passt nicht', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: original.replace('laenge: 3667.587,', 'laenge: 3600,') }), 'laenge'],
  ];
  for (const [name, route, grund] of faelle) {
    for (const sprache of ['de', 'en']) {
      if (sprache === 'en' && name !== 'fehlt (404)') continue;
      const s = await oeffne(WURZEL, '', { route, speicher: { 'alpineRally.einstellungen': JSON.stringify({ sprache }) } });
      await bereit(s).catch(() => {});
      await s.page.waitForTimeout(300);
      const r = await s.page.evaluate(() => {
        const c = document.getElementById('fehlerseite');
        let farben = 0;
        if (c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const set = new Set(); for (let i = 0; i < d.length; i += 4) set.add(`${d[i]},${d[i + 1]},${d[i + 2]}`); farben = set.size; }
        const lade = document.getElementById('lade');
        return { f: window.__fehlerseite || null, sichtbar: !!c && c.getBoundingClientRect().width > 100, farben, ladeWeg: !lade || getComputedStyle(lade).display === 'none', spiel: !!window.__alpineRally };
      });
      const png = await s.page.screenshot();
      fs.writeFileSync(path.join(LOG, `fehlerseite-${grund}-${sprache}.png`), png);
      melde(r.f && r.f.grund === grund && r.sichtbar && r.farben >= 4 && r.ladeWeg && !r.spiel,
        `${name} (${sprache}): Fehlerseite „${grund}“ sichtbar (${r.farben} Farben, Ladeanzeige weg, Spiel nicht gestartet) – ${r.f ? String(r.f.mehr).slice(0, 80) : 'KEINE'}`);
      await s.schliessen();
    }
  }
  info(`Bilder: ${LOG}/fehlerseite-*.png (die kaputten Dateien liegen nur im Test, nicht im Repo)`);
  // M10b: Finnland kaputt. (1) In der Etappenwahl: Zeile „DATEI KAPUTT“, nicht wählbar, Alpen laufen weiter.
  const fiKaputt = (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'export default { format: 1, \n' });
  {
    const s = await starteSpiel({ breite: 640, hoehe: 360 });
    s.fehler = []; s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
    await s.page.route('**/strecken/finnland.js', fiKaputt);
    await s.page.goto(`${s.url}/index.html?ton=aus`);
    await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 180000 });
    const r = await s.page.evaluate(async () => {
      const A = window.__alpineRally; A.szene.visible = false; A.zumMenue(); A.menue.oeffne(A.seiten.etappe);
      await new Promise((o) => setTimeout(o, 1500));
      A.menue.runter(); A.menue.bestaetigen();
      await new Promise((o) => setTimeout(o, 500));
      return { zeilen: A.seiten.etappe.eintraege().filter((e) => e.etappeId).map((e) => e.inhalt()), seite: A.menue.seite.id, speicher: localStorage.getItem('alpineRally.etappe'), laenge: A.strecke.laenge };
    });
    melde(r.seite === 'etappe' && r.speicher === null && Math.abs(r.laenge - 3667.587) < 0.5, `Finnland-Datei kaputt, Alpen geladen: Etappenwahl zeigt Finnland nicht wählbar (Bestätigen tut nichts), Alpen laufen weiter (${r.laenge.toFixed(1)} m)`);
    await s.schliessen();
  }
  // (2) Finnland gewählt und kaputt: Fehlerseite mit „zur Standard-Etappe“, Taste lädt die Alpen
  {
    const s = await starteSpiel({ breite: 640, hoehe: 360 });
    await s.page.route('**/strecken/finnland.js', fiKaputt);
    await s.page.addInitScript(() => { if (!sessionStorage.getItem('m10bs')) { localStorage.setItem('alpineRally.etappe', 'finnland'); sessionStorage.setItem('m10bs', '1'); } });
    await s.page.goto(`${s.url}/index.html?ton=aus`);
    await s.page.waitForFunction(() => window.__alpineRally || window.__fehlerseite, null, { timeout: 180000 });
    const f = await s.page.evaluate(() => ({ f: window.__fehlerseite || null, speicher: localStorage.getItem('alpineRally.etappe') }));
    fs.writeFileSync(path.join(LOG, 'fehlerseite-finnland.png'), await s.page.screenshot());
    await Promise.all([s.page.waitForNavigation({ timeout: 60000 }), s.page.keyboard.press('Enter')]);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 180000 });
    const l = await s.page.evaluate(() => window.__alpineRally.strecke.laenge);
    melde(f.f && f.f.zurueck && f.f.grund === 'datei' && f.speicher === 'alpen' && Math.abs(l - 3667.587) < 0.5, `Finnland gewählt und kaputt: Fehlerseite „${f.f && f.f.grund}“ mit Hinweis zur Standard-Etappe, Wahl zurück auf "${f.speicher}"; Taste -> Alpen spielbar (${l.toFixed(1)} m)`);
    await s.schliessen();
  }
}

// ===================================================================== (i) grep: nichts Alpines im Spielcode
if (teil('c')) {
  console.log('(c) Nichts Alpines im Spielcode (js/*.js ohne Kommentare)');
  const daten = (await import(pathToFileURL(path.join(WURZEL, 'strecken/alpen.js')).href)).default;
  // Namen: Abschnitte, Nebenwege, Etappe, Beschriftungen
  const namen = new Set([...Object.keys(daten.abschnitte), ...daten.nebenwege.map((w) => w.name), daten.name.de, daten.name.en, daten.beschreibung.de,
    ...Object.values(daten.beschriftung.banner).map((b) => b[0]), ...daten.beschriftung.wegweiser, ...daten.beschriftung.sponsoren.map((b) => b[0])]);
  // Autos dürfen ihre eigenen Sponsoren tragen (Lackierung in js/autos.js, nicht streckenspezifisch)
  const autoSponsoren = ['MURMELI', 'SENNHOF', 'AUDAN']; // (AUDAN = Automarke im Spiel, auch Sponsor an Start/Ziel)
  // Zahlen: Länge, Checkpoints, Nebenwege, von Hand gesetzte Orte (s) in leben/natur
  // (runde Zahlen unter 1000 wie 800/900/150 kommen auch als allgemeine Werte vor – z. B. Gänge, Hz – und werden darum
  //  nicht gesucht; die Checkpoints prüft die Zeile weiter unten über den Verweis in config.js)
  const zahlenAlle = new Set([String(daten.laenge), '3667.59', ...daten.checkpoints.map(String), ...daten.nebenwege.flatMap((w) => [String(w.abzweig), String(w.einmuendung)]), String(daten.natur.kuehe.passBei),
    ...JSON.stringify(daten.leben).match(/"s":\[?\d+(\.\d+)?/g).map((x) => x.replace(/"s":\[?/, '')), ...daten.natur.nebenwegWaldGruppen.map((g) => String(g.s)), ...daten.natur.kuehe.zusatzHerden.map((h) => String(h.s))]);
  const zahlen = new Set([...zahlenAlle].filter((n) => !(+n < 1000 && +n % 50 === 0)));
  const ohneKommentar = (t) => t.split('\n').map((z) => { let inS = null; for (let i = 0; i < z.length; i++) { const c = z[i]; if (inS) { if (c === '\\') i++; else if (c === inS) inS = null; } else if (c === '"' || c === "'" || c === '`') inS = c; else if (c === '/' && z[i + 1] === '/') return z.slice(0, i); } return z; }).join('\n');
  // Ton-Code: viele Frequenzen in Hz (z. B. 2900) – Zahlen dort nicht gesucht; er ist laut (f) unverändert seit 0.10a
  const TON = ['audio.js', 'umgebung.js', 'musik.js', 'musikstueck.js', 'tonlabor.js', 'tonfahrt.js'];
  // Belag-Namen sind Regeln (Belag-Katalog), auch wenn ein Nebenweg genauso heisst (Wiesenweg)
  for (const b of ['Asphalt', 'Schotter', 'Wiesenweg']) namen.delete(b);
  const treffer = [];
  for (const f of fs.readdirSync(path.join(WURZEL, 'js')).filter((x) => x.endsWith('.js'))) {
    const zeilen = ohneKommentar(fs.readFileSync(path.join(WURZEL, 'js', f), 'utf8')).split('\n');
    zeilen.forEach((z, i) => {
      // Namen nur als ganzes Wort (nicht in Bezeichnern wie torBreiteWiesenweg); Autonamen dürfen überall stehen
      for (const n of namen) if (!autoSponsoren.includes(n) && new RegExp(`(^|[^A-Za-zÄÖÜäöüß])${n}(?![A-Za-zÄÖÜäöüß])`).test(z)) treffer.push(`${f}:${i + 1} "${n}"`);
      if (!TON.includes(f)) for (const n of zahlen) if (new RegExp(`(^|[^\\d.])${n.replace('.', '\\.')}(?![\\d.])`).test(z)) treffer.push(`${f}:${i + 1} Zahl ${n}`);
    });
  }
  // Ausnahme: Belag-Namen (schotter, wiesenweg) sind Regeln (Belag-Katalog), Kleinschreibung; "Waldstück" als Wort kommt nur in Kommentaren vor
  melde(treffer.length === 0, `${namen.size} Namen und ${zahlen.size} Streckenzahlen gesucht: ${treffer.length ? `gefunden: ${treffer.slice(0, 8).join(', ')}` : 'nichts im Spielcode'} (Kommentare ausgenommen, Zahlen nicht im Ton-Code; Auto-Sponsoren ${autoSponsoren.join('/')} gehören zur Lackierung)`);
  // M10b: Motive/Typen der Alpen (Schweizer Fahne, Kuh, Alphütte, Heustadel, Glocke, Tanne) entscheidet nur noch die
  // Streckendatei (deko). Im Spielcode stehen sie nur noch in den Pixelfunktionen bzw. Typ-Listen, die den Namen im
  // Daten-Sinn tragen: motive.js (Fahnen), kuhbild.js (Tiere), pixel.js (Bäume), leben.js HAUS_TYPEN (Häuser),
  // streckenpruefung.js (bekannte Typen), config.js (Standard für Dateien ohne deko-Block).
  {
    const MOTIVE = /'(schweiz|kuh|alphuette|heustadel|glocke|tanne|laub)'/;
    const ERLAUBT = ['motive.js', 'kuhbild.js', 'pixel.js', 'streckenpruefung.js', 'config.js'];
    const mt = [];
    for (const f of fs.readdirSync(path.join(WURZEL, 'js')).filter((x) => x.endsWith('.js') && !ERLAUBT.includes(x))) {
      const text = ohneKommentar(fs.readFileSync(path.join(WURZEL, 'js', f), 'utf8'));
      // leben.js: nur in der Typ-Liste HAUS_TYPEN (Pixel-Bauformen der Häuser)
      const ohneListe = f === 'leben.js' ? text.replace(/export const HAUS_TYPEN = \{[\s\S]*?\n\};/, '') : text;
      ohneListe.split('\n').forEach((z, i) => { const m = MOTIVE.exec(z); if (m) mt.push(`${f}:${i + 1} ${m[0]}`); });
    }
    // Erlaubt als Klang-Typ: umgebung.js prüft deko.tierKlang === 'glocke' (Art des Klangs, nicht welches Tier)
    // Ebenso interne Rollen-Namen (kein Motiv): Sperr-Art 'tanne' (Baumgruppe aus dem Nadelbaum der Strecke, sperren.js),
    // Mesh-Name 'laub' (sprites.js), Aufprall-Material 'kuh' (= Tier, weich; audio.js)
    const ROLLEN = /^(umgebung\.js:\d+ 'glocke'|sperren\.js:\d+ 'tanne'|sprites\.js:\d+ 'laub'|audio\.js:\d+ 'kuh')$/;
    const rest = mt.filter((t) => !ROLLEN.test(t));
    melde(rest.length === 0, `Motive der Alpen (Fahne, Tier, Haus, Klang, Bäume) im Spielcode nur als Typ-Namen in den Pixelfunktionen: ${rest.length ? `gefunden: ${rest.slice(0, 6).join(', ')}` : `sonst nirgends (ausgenommen ${mt.length - rest.length} interne Rollen-Namen: ${mt.filter((t) => ROLLEN.test(t)).join(', ')})`}`);
    const alpenDaten = (await import(pathToFileURL(path.join(WURZEL, 'strecken/alpen.js')).href)).default;
    melde(alpenDaten.deko && alpenDaten.deko.fahne === 'schweiz' && alpenDaten.deko.tier === 'kuh' && alpenDaten.deko.haus === 'alphuette', `Alpen wählen ihre Motive in der Datei: ${JSON.stringify(alpenDaten.deko)}`);
  }
  const geloescht = ['js/abkuerzungen.js', 'js/baumfolge.js', 'js/kuhfolge.js', 'js/pacenotes-tempo.js'].filter((d) => fs.existsSync(path.join(WURZEL, d)));
  const configText = fs.readFileSync(path.join(WURZEL, 'js/config.js'), 'utf8');
  melde(/beiMeter: S\.checkpoints/.test(configText) && /startBeiMeter: S\.strasse\.startBeiMeter/.test(configText) && /nebenwege: S\.nebenwege/.test(configText), 'Checkpoints, Start/Ziel und Nebenwege: config.js verweist auf die Streckendatei');
  melde(geloescht.length === 0, 'erzeugte Daten (Abkürzungen, Baumfolge, Kuhfolge, Kurventempo) nur noch in der Streckendatei');
  const config = fs.readFileSync(path.join(WURZEL, 'js/config.js'), 'utf8');
  const farben = (ohneKommentar(config).match(/^\s+(himmelOben|dunst|grasDunkel|sonneFarbe|sonneRichtung|umgebungFarbe|maxDichte|bergDunst|schneeAb):/gm) || []);
  melde(farben.length === 0 && /farben: U\.farben/.test(config) && /nebel: U\.nebel/.test(config) && /licht: U\.licht/.test(config) && /berge: U\.berge/.test(config), 'Himmel, Farben, Nebel, Licht, Berge: Werte aus der Streckendatei (config.js verweist nur)');
  melde(/dichte: S\.klang\.voegelDichte/.test(config) && /orte: S\.klang\.publikumOrte/.test(config) && /abschnitt: S\.klang\.boeenAbschnitt/.test(config) && /seed: Z\.umgebung/.test(config), 'Umgebungsklang (Vögel je Abschnitt, Publikum-Orte, Böen, Seed): aus der Streckendatei');
}

// ===================================================================== (j) Ladezeit, Bildzeit, Garbage, Grösse
async function leistung(wurzel) {
  const s = await oeffne(wurzel, '?menue=aus&ton=aus');
  await bereit(s);
  const cdp = await s.page.context().newCDPSession(s.page);
  const heap = async () => { for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  await s.page.evaluate(() => { const A = window.__alpineRally; A.setzeAuf(2610); A.kameraSofort(); });
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
if (teil('j')) {
  console.log('(j) Ladezeit, Bildzeit, Garbage, Grösse der Streckendatei');
  const groesse = fs.statSync(path.join(WURZEL, 'strecken/alpen.js')).size;
  const alteDateien = ['js/abkuerzungen.js', 'js/baumfolge.js', 'js/kuhfolge.js', 'js/pacenotes-tempo.js', 'js/track.js', 'js/config.js'];
  if (ALT) {
    const summe = (w, liste) => liste.reduce((a, d) => a + (fs.existsSync(path.join(w, d)) ? fs.statSync(path.join(w, d)).size : 0), 0);
    const alles = (w) => fs.readdirSync(path.join(w, 'js')).filter((x) => x.endsWith('.js')).reduce((a, d) => a + fs.statSync(path.join(w, 'js', d)).size, 0) + (fs.existsSync(path.join(w, 'strecken')) ? fs.readdirSync(path.join(w, 'strecken')).reduce((a, d) => a + fs.statSync(path.join(w, 'strecken', d)).size, 0) : 0);
    info(`Streckendatei ${(groesse / 1024).toFixed(1)} KB; geladene Spieldateien zusammen 0.10a ${(alles(ALT) / 1024).toFixed(1)} KB, jetzt ${(alles(WURZEL) / 1024).toFixed(1)} KB (Daten aus ${alteDateien.join(', ')}: ${(summe(ALT, alteDateien) / 1024).toFixed(1)} KB -> ${(summe(WURZEL, alteDateien) / 1024 + groesse / 1024).toFixed(1)} KB mit Streckendatei)`);
    const lz = werkzeug('ladezeit.mjs', [ALT, '9']);
    fs.writeFileSync(path.join(LOG, 'ladezeit.log'), lz.text);
    const med = (n) => +((new RegExp(`${n} .*Median (\\d+)`).exec(lz.text) || [])[1]);
    melde(med('neu') - med('alt') <= 30, `Ladezeit (Median aus 9, bis die Welt gebaut ist): 0.10a ${med('alt')} ms, 0.10a ${med('neu')} ms (${med('neu') - med('alt') >= 0 ? '+' : ''}${med('neu') - med('alt')} ms, höchstens +30; Streuung ca. ±100)`);
    const ln = await leistung(WURZEL), la = await leistung(ALT);
    melde(ln.ms <= la.ms * 1.15, `Bildzeit im Rennen (Passhöhe, Vollgas, 4 s): 0.10a ${la.ms.toFixed(1)} ms, 0.10a ${ln.ms.toFixed(1)} ms (höchstens +15 %; Software-Grafik)`);
    melde(ln.rest < la.rest + 300000, `Speicher nach 4 s Fahren (nach GC): 0.10a ${(la.rest / 1024).toFixed(0)} KB, 0.10a ${(ln.rest / 1024).toFixed(0)} KB mehr als vorher (kein Leck); Heap-Zuwachs ohne GC ${(la.zuwachs / 1024).toFixed(0)} / ${(ln.zuwachs / 1024).toFixed(0)} KB in ${la.n} / ${ln.n} Bildern`);
  } else info('nur mit --alt');
}

// ===================================================================== (k) (l) Prüfwerkzeuge (Teil C)
if (teil('d')) {
  console.log('(d) strecke-karte: Karte, Profil, Bericht');
  if (!fs.existsSync(path.join(WURZEL, 'tools/strecke-karte.mjs'))) melde(false, 'tools/strecke-karte.mjs fehlt');
  else {
    const r = werkzeug('strecke-karte.mjs', ['strecken/alpen.js', '--aus', LOG]);
    fs.writeFileSync(path.join(LOG, 'karte.log'), r.text);
    const bericht = fs.existsSync(path.join(LOG, 'alpen-bericht.txt')) ? fs.readFileSync(path.join(LOG, 'alpen-bericht.txt'), 'utf8') : '';
    const laenge = +((/Länge: ([\d.]+) m/.exec(bericht) || [])[1]);
    const cps = +((/Checkpoints: (\d+)/.exec(bericht) || [])[1]);
    const notes = +((/Pace-Notes: (\d+)/.exec(bericht) || [])[1]);
    const bilderDa = ['alpen-karte.png', 'alpen-profil.png'].every((d) => fs.existsSync(path.join(LOG, d)) && fs.statSync(path.join(LOG, d)).size > 5000);
    melde(r.code === 0 && bilderDa && Math.abs(laenge - 3667.587) <= 0.5 && cps === 3 && notes >= 20, `Karte und Höhenprofil erzeugt (${bilderDa ? 'beide Bilder da' : 'BILDER FEHLEN'}), Bericht: Länge ${laenge} m, ${cps} Checkpoints, ${notes} Pace-Notes`);
  }
}
if (teil('d')) {
  console.log('(d) strecke-abfahren: reproduziert die Testfahrer-Zeiten');
  if (!fs.existsSync(path.join(WURZEL, 'tools/strecke-abfahren.mjs'))) melde(false, 'tools/strecke-abfahren.mjs fehlt');
  else {
    for (const [id, erwartet] of [['prototyp', '2:59.33 / 2:42.35 / 2:31.92'], ['l073', null]]) {
      const r = werkzeug('strecke-abfahren.mjs', ['strecken/alpen.js', '--auto', id, '--aus', path.join(LOG, `abfahren-${id}.txt`)]);
      const zeiten = ((/Gesamtzeiten: (.*)/.exec(r.text) || [])[1] || '').trim();
      let soll = erwartet;
      if (!soll) { const t = werkzeug('testfahrer.mjs', ['--auto', id]).text; soll = t.split('\n').filter((x) => /^\s+(vorsichtig|mittel|flott)\b/.test(x)).map((x) => x.trim().split(/\s+/)[1]).join(' / '); }
      melde(r.code === 0 && zeiten === soll, `${id}: ${zeiten || r.text.trim().slice(0, 120)} (Testfahrer: ${soll})`);
    }
  }
}

// ===================================================================== Teil B: Finnland (e)–(i)
const FI = 'finnland';
if (teil('e')) {
  console.log('(e) Prüfer: strecken/finnland.js gültig, kaputte Varianten abgelehnt');
  const ok = werkzeug('strecke-pruefen.mjs', ['strecken/finnland.js']);
  melde(ok.code === 0, `tools/strecke-pruefen.mjs strecken/finnland.js: Rückgabe ${ok.code} – ${ok.text.trim().split('\n')[0].slice(0, 160)}`);
  const { pruefeStrecke } = await import('../js/streckenpruefung.js');
  const original = (await import('../strecken/finnland.js')).default;
  const roh = () => JSON.parse(JSON.stringify(original));
  const faelle = [
    ['Belag unbekannt', (d) => { d.belagAbschnitte[0].belag = 'eis'; }, 'belagAbschnitte[0].belag:'],
    ['Belag-Abschnitte überlappen', (d) => { d.belagAbschnitte[1].von = 1000; }, 'belagAbschnitte[1]:'],
    ['Belag-Abschnitt verkehrt', (d) => { d.belagAbschnitte[0].bis = -5; }, 'belagAbschnitte[0]:'],
    ['See zu nah an der Strasse', (d) => { d.wasser.seen[0].lat = 50; }, 'wasser.seen[0]:'],
    ['See ohne Seite', (d) => { delete d.wasser.seen[0].seite; }, 'wasser.seen[0]:'],
    ['Fluss zu schräg', (d) => { d.wasser.fluesse[0].winkel = 70; }, 'wasser.fluesse[0].winkel:'],
    ['Fluss hinter dem Ende', (d) => { d.wasser.fluesse[0].s = 9000; }, 'wasser.fluesse[0].s:'],
    ['Haus ohne Seite', (d) => { delete d.leben.wiesenweg.haeuser[0].seite; }, 'leben.wiesenweg.haeuser[0]:'],
    ['Steg ohne Länge', (d) => { delete d.leben.wiesenweg.stege[0].laenge; }, 'leben.wiesenweg.stege[0]:'],
    ['Tier unbekannt', (d) => { d.deko.tier = 'elch'; }, 'deko.tier:'],
    ['Sprung hinter dem Ende', (d) => { d.sprung[3].s = 5000; }, 'sprung[3].s:'],
    ['untergrundInfo klein', (d) => { d.untergrundInfo.de = 'Schotter'; }, 'untergrundInfo.de:'],
    ['Länge passt nicht', (d) => { d.laenge = 3500; }, 'laenge:'],
    ['Checkpoint hinter dem Ziel', (d) => { d.checkpoints[2] = 2790; }, 'checkpoints[2]:'],
  ];
  const schlecht = [];
  for (const [name, aendere, pfad] of faelle) { const d = roh(); aendere(d); const f = pruefeStrecke(d, { voll: true }); if (!f.some((x) => x.startsWith(pfad))) schlecht.push(`${name} -> ${f[0] || 'kein Fehler'}`); }
  melde(schlecht.length === 0, `${faelle.length - schlecht.length} von ${faelle.length} kaputten Finnland-Varianten abgelehnt${schlecht.length ? `; nicht erkannt: ${schlecht.join(' | ')}` : ''}`);
  const reg = fs.readFileSync(path.join(WURZEL, 'js/strecken.js'), 'utf8');
  melde(/id: 'alpen', datei: 'alpen\.js'/.test(reg) && /id: 'finnland', datei: 'finnland\.js'/.test(reg), 'Register js/strecken.js: alpen (erster Eintrag, Standard) und finnland');
}
if (teil('f')) {
  console.log('(f) Finnland: Länge, Checkpoints, Start/Ziel, Belag, Kuppen');
  const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${FI}`);
  await bereit(s);
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, st = A.strecke, n = A.netz;
    let schotter = 0, alle = 0;
    for (let i = Math.ceil(st.startS); i <= st.zielS; i++) { alle++; if (n.belag[i] === 'schotter') schotter++; }
    return { id: A.CONFIG.deko.fahne, laenge: st.laenge, start: st.startS, ziel: st.zielS, cps: A.checkpoints.map((c) => c.s), notes: A.paceNotes.notes.map((x) => (/"kuppe"/.test(JSON.stringify(x)) ? "kuppe" : "andere")), schotter: schotter / alle, wasser: A.welt.wasser.seen.length + '/' + A.welt.wasser.fluesse.length };
  });
  const daten = (await import('../strecken/finnland.js')).default;
  melde(r.laenge >= 2500 && r.laenge <= 3000 && Math.abs(r.laenge - daten.laenge) <= 0.5, `Länge ${r.laenge.toFixed(3)} m (Ziel 2500–3000, Datei ${daten.laenge}), gefahren ${(r.ziel - r.start).toFixed(1)} m`);
  melde(r.cps.length >= 3 && r.cps.length <= 4 && r.cps.every((c, i) => c > r.start && c < r.ziel && (i === 0 || c > r.cps[i - 1])), `Checkpoints ${r.cps.join(' / ')} m in Reihenfolge zwischen Start ${r.start} m und Ziel ${r.ziel.toFixed(1)} m`);
  melde(r.schotter > 0.8, `Belag zwischen Start und Ziel: ${(r.schotter * 100).toFixed(1)} % Schotter (Rest Asphalt im Dorf)`);
  const kuppen = r.notes.filter((x) => x === 'kuppe').length;
  melde(kuppen >= 3 && daten.sprung.length >= 3 && daten.sprung.length <= 4, `${daten.sprung.length} markierte Kuppen (sprung: ${daten.sprung.map((k) => `${k.name} ${k.s} m`).join(', ')}), ${kuppen} Kuppen-Ansagen, ${r.notes.length} Pace-Notes`);
  melde(r.wasser === '2/1' && r.id === 'finnland', `Wasser: ${r.wasser} (Seen/Flüsse), Fahnen-Motiv ${r.id}`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
if (teil('g')) {
  console.log('(g) Finnland: Testfahrer, fünf Autos und Prototyp (strecke-abfahren, drei Stile)');
  const tabelle = [];
  for (const id of ['prototyp', ...AUTOS]) {
    const r = werkzeug('strecke-abfahren.mjs', ['--strecke', FI, '--auto', id, '--aus', path.join(LOG, `abfahren-${FI}-${id}.txt`)]);
    fs.writeFileSync(path.join(LOG, `abfahren-${FI}-${id}.log`), r.text);
    const z = (/Gesamtzeiten: (.+)/.exec(r.text) || [])[1] || '--';
    const vorsichtig = (/^vorsichtig .*$/m.exec(r.text) || [''])[0];
    const sauber = /Aufpralle 0, Gras 0x, Wandnähe 0x, Stillstand 0x/.test(vorsichtig);
    const stile = ['vorsichtig', 'mittel', 'flott'].map((st) => (new RegExp(`^${st} .*Aufpralle (\\d+), Gras (\\d+)x, Wandnähe (\\d+)x, Stillstand (\\d+)x`, 'm').exec(r.text) || []).slice(1).join('/'));
    tabelle.push(`${id}: ${z} (Aufpralle/Gras/Wand/Stillstand je Stil: ${stile.join(' | ')})`);
    melde(r.code === 0 && sauber, `${id}: ${z} – alle Stile im Ziel, vorsichtig ohne Aufprall/Abkommen/Stillstand${sauber ? '' : ' (NICHT sauber)'}`);
  }
  info(`Tabelle: ${tabelle.join('; ')}`);
  const proto = fs.readFileSync(path.join(LOG, `abfahren-${FI}-prototyp.log`), 'utf8');
  const sek = ((/^mittel\s+(\d+):(\d+\.\d+)/m.exec(proto) || []).slice(1)).map(Number);
  melde(sek.length === 2 && sek[0] * 60 + sek[1] >= 95 && sek[0] * 60 + sek[1] <= 140, `Prototyp „mittel“ ${sek.join(':')} (Richtwert 1:50–2:20 für den Testfahrer; Schnitt höher als in den Alpen)`);
}
if (teil('h')) {
  console.log('(h) Finnland: Abkürzungen (abkuerzungen.mjs --pruefen --strecke finnland)');
  const r = werkzeug('abkuerzungen.mjs', ['--pruefen', '--strecke', FI]);
  fs.writeFileSync(path.join(LOG, `abkuerzungen-${FI}.log`), r.text);
  const kern = (/übrige Linien je Kurve ([\d/]+|\(keine\))/.exec(r.text) || [])[1];
  const durch = +((/Durchkommen in gesperrten Kurven: (\d+)/.exec(r.text) || [])[1]);
  const zonen = [...r.text.matchAll(/übrig in Kurve ([\d – ]+): (\d+) Linien, Gewinn bis ([\d.]+) m/g)].map((m) => `${m[1].trim()} m: ${m[2]} Linien, bis ${m[3]} m`);
  const nicht = (/"nicht schneiden": (\d+), "schneiden": (\d+)/.exec(r.text) || []).slice(1);
  melde(r.code === 0 && durch === 0, `Strecke finnland: übrige Linien je Kurve ${kern}; gesperrt ${nicht[0]} Kurven, frei ${nicht[1]}; Durchkommen in gesperrten Kurven ${durch}`);
  info(`freie Kurven (Schneiden erlaubt, Pace-Note „schneiden“): ${zonen.join('; ')}`);
}
if (teil('i')) {
  console.log('(i) Finnland: Bilder an festen Punkten (nur zur Ansicht)');
  const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${FI}`, { uhr: true });
  await bereit(s);
  await bilder(s, 2);
  const punkte = [['start', null], ['kiefernwald', 640], ['seeufer', 935], ['dorf', 1240], ['bruecke', 1372], ['birkenkuppe', 1600], ['kehre', 1890], ['ziel', 2700]];
  for (const [name, sM] of punkte) {
    if (sM != null) await s.page.evaluate((sM) => { const A = window.__alpineRally; A.anhalten = true; A.setzeAuf(sM); A.kameraSofort(); }, sM);
    await bilder(s, 6);
    fs.writeFileSync(path.join(LOG, `finnland-${name}.png`), Buffer.from((await foto(s)).split(',')[1], 'base64'));
  }
  melde(s.fehler.length === 0, `${punkte.length} Bilder: ${LOG}/finnland-*.png (Konsole ohne Fehler: ${s.fehler.length})`);
  await s.schliessen();
}

// ===================================================================== Teil C: Etappenwahl (k)–(r)
// Spiel mit Menü öffnen (Speicher einmal vorbefüllt, bleibt über Neuladen), Menü-Leinwand ohne 3D (Test-Browser langsam)
async function mitMenue({ speicher = null, breite = 640, hoehe = 360, geraet = undefined, gamepad = false } = {}) {
  const s = await starteSpiel({ breite, hoehe, ...(geraet ? { geraet } : {}) });
  s.fehler = [];
  s.anfragen = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  s.page.on('request', (r) => s.anfragen.push(r.url()));
  if (gamepad) await s.page.addInitScript(() => { window.__knopf = -1; navigator.getGamepads = () => [{ connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: i === window.__knopf, value: i === window.__knopf ? 1 : 0 })) }]; });
  await s.page.addInitScript((sp) => { if (!sessionStorage.getItem('m10b')) { localStorage.clear(); for (const [k, v] of Object.entries(sp || {})) localStorage.setItem(k, v); sessionStorage.setItem('m10b', '1'); } }, speicher);
  await s.page.goto(`${s.url}/index.html?ton=aus`);
  await bereitMenue(s);
  return s;
}
const bereitMenue = async (s) => { await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 180000, polling: 200 }); await s.page.evaluate(() => { window.__alpineRally.szene.visible = false; }); };
const zustand = (s) => s.page.evaluate(() => { const A = window.__alpineRally; return { strecke: A.strecke.laenge, id: A.CONFIG.deko.fahne === 'finnland' ? 'finnland' : 'alpen', ablauf: A.ablauf.zustand, seite: A.menue.seite && A.menue.seite.id, wahl: A.menue.wahl, speicher: localStorage.getItem('alpineRally.etappe') }; });
const zeilenText = (s) => s.page.evaluate(() => { const A = window.__alpineRally; const l = typeof A.menue.seite.eintraege === 'function' ? A.menue.seite.eintraege() : A.menue.seite.eintraege; return l.map((e) => (e.inhalt ? e.inhalt() : e.typ === 'aktion' ? `${e.text}${e.wert ? `=${e.wert()}` : ''}` : e.typ === 'auswahl' ? `${e.text}:${e.lesen()}` : e.typ)); });
const warteNeuladen = async (s) => { await s.page.waitForLoadState('load'); await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue && window.__alpineRally.ablauf.zustand === 'menue', null, { timeout: 180000, polling: 200 }); await s.page.evaluate(() => { window.__alpineRally.szene.visible = false; }); };
const BZ = (etappe, auto, zeit, cps) => ({ [etappe]: { [auto]: [{ zeit, cps, datum: '2026-09-01T10:00:00.000Z', auto, aufpralle: 0, resets: 0, hoechstTempo: 50, spur: [] }] } });

if (teil('k') || teil('p') || teil('r')) {
  console.log('(k) (p) (r) Etappe wählen (Tastatur), Neuladen, gewählte Strecke startet; Gamepad, Maus, Touch');
  const s = await mitMenue();
  const a0 = await zustand(s);
  melde(a0.id === 'alpen' && a0.ablauf === 'titel' && a0.speicher === null, `Start ohne Wahl: Alpen (${a0.strecke.toFixed(1)} m), Titel; Finnland-Datei beim Start nicht geladen: ${!s.anfragen.some((u) => /finnland\.js/.test(u)) ? 'ja' : 'NEIN'}`);
  await s.page.keyboard.press('Enter');
  await s.page.waitForFunction(() => window.__alpineRally.ablauf.zustand === 'menue');
  const haupt = await zeilenText(s);
  melde(haupt.includes('menue.etappe=PASSSTRASSE'), `Hauptmenü: Zeile ETAPPE zeigt den Namen der gewählten Strecke (${haupt.find((x) => x.startsWith('menue.etappe'))})`);
  // ETAPPE öffnen (Pfeil runter zweimal, Enter)
  await s.page.keyboard.press('ArrowDown'); await s.page.keyboard.press('ArrowDown'); await s.page.keyboard.press('Enter');
  await s.page.waitForFunction(() => window.__alpineRally.menue.seite.id === 'etappe');
  await s.page.waitForFunction(() => window.__alpineRally.menue.seite.eintraege().filter((e) => e.etappeId).every((e) => !/^[a-z]+$/.test(e.inhalt())), null, { timeout: 30000 });
  const liste = await zeilenText(s);
  melde(liste[0].startsWith('PASSSTRASSE ASPHALT UND SCHOTTER 3.6 KM') && liste[1].startsWith('FINNLAND-SCHOTTER SCHOTTER 2.7 KM') && liste.some((x) => x === 'zurueck'), `Etappenliste: ${liste.slice(0, 2).join(' | ')}`);
  melde(s.anfragen.some((u) => /finnland\.js/.test(u)), 'Finnland-Daten erst beim Öffnen der Seite ETAPPE geladen (nur die Datei, keine Welt)');
  const w0 = await zustand(s);
  melde(w0.wahl === 0, `Zeiger beginnt auf der gewählten Etappe (Zeile ${w0.wahl})`);
  // Zurück ohne Änderung
  await s.page.keyboard.press('Escape');
  const z1 = await zustand(s);
  melde(z1.seite === 'haupt' && z1.speicher === null, `Zurück (Esc) verlässt ohne Änderung (Seite ${z1.seite}, Speicher ${z1.speicher})`);
  await s.page.keyboard.press('Enter');
  await s.page.waitForFunction(() => window.__alpineRally.menue.seite.id === 'etappe');
  await s.page.keyboard.press('ArrowDown');
  await Promise.all([s.page.waitForNavigation({ timeout: 60000 }), s.page.keyboard.press('Enter')]);
  await warteNeuladen(s);
  const z2 = await zustand(s);
  const haupt2 = await zeilenText(s);
  melde(z2.id === 'finnland' && z2.speicher === 'finnland' && z2.ablauf === 'menue' && z2.seite === 'haupt' && z2.wahl === 2, `nach Enter: Seite neu geladen mit Finnland (${z2.strecke.toFixed(1)} m), Speicher "${z2.speicher}", direkt im Hauptmenü auf ETAPPE (Zeile ${z2.wahl})`);
  melde(haupt2.includes('menue.etappe=FINNLAND-SCHOTTER'), `Hauptmenü zeigt ${haupt2.find((x) => x.startsWith('menue.etappe'))}`);
  // (p) nach Neuladen (ohne Merker) bleibt die Etappe
  await s.page.reload();
  await bereitMenue(s);
  const z3 = await zustand(s);
  melde(z3.id === 'finnland' && z3.ablauf === 'titel', `(p) normales Neuladen: Finnland bleibt gewählt (${z3.strecke.toFixed(1)} m), Start wieder mit Titel`);
  // (k) STARTEN startet die gewählte Strecke
  await s.page.keyboard.press('Enter');
  await s.page.waitForFunction(() => window.__alpineRally.ablauf.zustand === 'menue');
  await s.page.keyboard.press('Enter'); // STARTEN
  await s.page.waitForFunction(() => window.__alpineRally.ablauf.zustand !== 'menue', null, { timeout: 30000 });
  const z4 = await s.page.evaluate(() => ({ ablauf: window.__alpineRally.ablauf.zustand, laenge: window.__alpineRally.strecke.laenge, x: window.__alpineRally.physik.x }));
  melde(['countdown', 'rennen'].includes(z4.ablauf) && Math.abs(z4.laenge - 2795.7) < 1, `(k) STARTEN: ${z4.ablauf} auf Finnland (${z4.laenge.toFixed(1)} m)`);
  // (r) Maus: Hauptmenü -> ETAPPE -> Klick auf PASSSTRASSE
  await s.page.evaluate(() => window.__alpineRally.zumHauptmenue());
  await s.page.evaluate(() => { const A = window.__alpineRally; A.menue.oeffne(A.seiten.etappe); });
  await s.page.waitForFunction(() => window.__alpineRally.menue.treffer.length > 2, null, { timeout: 30000 });
  const klick = await s.page.evaluate(() => {
    const A = window.__alpineRally, h = A.menue.treffer.find((t) => t.nr === 0), c = document.getElementById('menue') || document.getElementById('hud');
    const r = c.getBoundingClientRect();
    return { x: r.left + (h.x + h.b / 2) * r.width / 320, y: r.top + (h.y + h.h / 2) * r.height / 180 };
  });
  await s.page.mouse.move(klick.x, klick.y);
  await Promise.all([s.page.waitForNavigation({ timeout: 60000 }), s.page.mouse.click(klick.x, klick.y)]);
  await warteNeuladen(s);
  const z5 = await zustand(s);
  melde(z5.id === 'alpen' && z5.speicher === 'alpen', `(r) Maus: Klick auf PASSSTRASSE wählt die Alpen (${z5.strecke.toFixed(1)} m, Speicher "${z5.speicher}")`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length}${s.fehler.length ? `: ${s.fehler[0]}` : ''})`);
  await s.schliessen();
  // (r) Gamepad: Steuerkreuz runter (Knopf 13), A (Knopf 0)
  {
    const g = await mitMenue({ gamepad: true });
    const druecke = async (k) => { await g.page.evaluate((k) => { window.__knopf = k; }, k); await g.page.waitForTimeout(250); await g.page.evaluate(() => { window.__knopf = -1; }); await g.page.waitForTimeout(250); };
    await druecke(0); // Titel -> Menü
    await g.page.waitForFunction(() => window.__alpineRally.ablauf.zustand === 'menue', null, { timeout: 20000 });
    await druecke(13); await druecke(13); await druecke(0);
    await g.page.waitForFunction(() => window.__alpineRally.menue.seite.id === 'etappe', null, { timeout: 20000 });
    await druecke(13);
    const wahl = (await zustand(g)).wahl;
    await Promise.all([g.page.waitForNavigation({ timeout: 60000 }), druecke(0)]);
    await warteNeuladen(g);
    const z = await zustand(g);
    melde(wahl === 1 && z.id === 'finnland', `(r) Gamepad (Steuerkreuz, A): Finnland gewählt (${z.strecke.toFixed(1)} m)`);
    await g.schliessen();
  }
  // (r) Touch: Antippen der Zeile FINNLAND (Handy hoch 402x874)
  {
    const h = await mitMenue({ breite: 402, hoehe: 874, geraet: { hasTouch: true, isMobile: true, deviceScaleFactor: 1 } });
    const cdp = await h.page.context().newCDPSession(h.page);
    const tippe = async (p) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y, id: 1 }] }); await h.page.waitForTimeout(60); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await h.page.waitForTimeout(200); };
    const punkt = (nr) => h.page.evaluate((nr) => { const A = window.__alpineRally, t = A.menue.treffer.find((x) => x.nr === nr); const c = document.getElementById('menue') || document.getElementById('hud'); const r = c.getBoundingClientRect(); return { x: r.left + (t.x + t.b / 2) * r.width / 320, y: r.top + (t.y + t.h / 2) * r.height / 180 }; }, nr);
    await h.page.evaluate(() => window.__alpineRally.zumMenue ? window.__alpineRally.zumMenue() : null);
    await h.page.evaluate(() => { const A = window.__alpineRally; A.menue.oeffne(A.seiten.etappe); });
    await h.page.waitForFunction(() => window.__alpineRally.menue.treffer.some((t) => t.nr === 1), null, { timeout: 30000 });
    const p = await punkt(1);
    // Antippen: wählt die Zeile; lädt das nicht schon neu, bestätigt ein zweites Antippen (wie bei den anderen Seiten)
    const nav1 = h.page.waitForNavigation({ timeout: 8000 }).then(() => true, () => false);
    await tippe(p);
    let zweimal = false;
    if (!(await nav1)) { zweimal = true; await Promise.all([h.page.waitForNavigation({ timeout: 60000 }), tippe(p)]); }
    await warteNeuladen(h);
    const z = await zustand(h);
    melde(z.id === 'finnland', `(r) Touch (Antippen, Handy hoch 402x874): Finnland gewählt (${z.strecke.toFixed(1)} m, ${zweimal ? 'zweimal' : 'einmal'} angetippt)`);
    await h.schliessen();
  }
}

if (teil('l') || teil('m') || teil('n') || teil('o')) {
  console.log('(l) (m) (n) (o) Bestzeiten je Etappe, Umschalter, Live-Vergleich');
  const alpen = BZ('passstrasse', 'rt4', 140.12, [27.1, 75.2, 112.3]);
  const speicher = { 'alpineRally.bestzeiten2': JSON.stringify({ ...alpen, ...BZ('finnland', 'rt4', 99.5, [20.5, 50.5, 80.5]) }) };
  const s = await oeffne(WURZEL, `?menue=aus&ton=aus&auto=rt4&strecke=${FI}`, { speicher, auto: 'rt4' });
  await bereit(s);
  // (o) Live-Vergleich gegen die Finnland-Bestzeit des gefahrenen Autos
  const ref = await s.page.evaluate(() => { const A = window.__alpineRally; A.referenzLaden(); return Array.from(A.vergleich.refCps); });
  melde(ref[0] === 20.5 && ref[2] === 80.5, `(o) Live-Vergleich auf Finnland: Referenz = Finnland-Bestzeit Audan (Zwischenzeiten ${ref.join(' / ')}; Alpen wären 27.1 / 75.2 / 112.3)`);
  const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const lauf = await s.page.evaluate(async (code) => {
    const f = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
    const r = f.fahreEtappe(window.__alpineRally, 'mittel');
    await new Promise((ok) => { let n = 0; const g = () => (++n > 10 ? ok() : requestAnimationFrame(g)); requestAnimationFrame(g); });
    return { zeit: r.zeit, ziel: r.ziel, speicher: JSON.parse(localStorage.getItem('alpineRally.bestzeiten2')), letzter: JSON.parse(localStorage.getItem('alpineRally.letzterLauf')) };
  }, fahrerCode);
  const fi = lauf.speicher.finnland.rt4.map((x) => x.zeit), al = lauf.speicher.passstrasse.rt4.map((x) => x.zeit);
  melde(lauf.ziel && fi.length === 2 && fi.includes(99.5) && JSON.stringify(lauf.speicher.passstrasse) === JSON.stringify(alpen.passstrasse), `(l) Lauf auf Finnland (${lauf.zeit.toFixed(2)} s): finnland.rt4 = ${fi.join(', ')}; Alpen-Liste unverändert (${al.join(', ')})`);
  melde(lauf.letzter && lauf.letzter.finnland && !lauf.letzter.passstrasse, `(l) letzter Lauf unter "finnland" (${lauf.letzter.finnland.zeit.toFixed(2)} s), nichts unter "passstrasse"`);
  await s.schliessen();
  // (n) Bestzeiten-Seite mit Etappen-Umschalter (Alpen geladen, vorbefüllt mit beiden Etappen)
  const s2 = await oeffne(WURZEL, '?ton=aus', { speicher: { 'alpineRally.bestzeiten2': JSON.stringify(lauf.speicher) } });
  await s2.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 180000 });
  const seite = await s2.page.evaluate(async () => {
    const A = window.__alpineRally;
    A.szene.visible = false;
    A.menue.zeige(A.seiten.bestzeiten);
    const text = () => A.seiten.bestzeiten.eintraege().map((e) => (e.inhalt ? e.inhalt() : e.typ === 'auswahl' ? `${e.text}:${e.lesen()}` : e.typ));
    const vorher = text();
    await new Promise((ok) => setTimeout(ok, 1500)); // Finnland-Daten laden
    const zeile = A.seiten.bestzeiten.eintraege().find((e) => e.etappeWahl);
    zeile.setzen(1);
    const nachher = text();
    zeile.setzen(0);
    return { vorher, nachher, zurueck: text(), optionen: zeile.optionen().map((o) => (typeof o.text === 'function' ? o.text() : o.text)) };
  });
  const zeiten = (l) => l.filter((x) => /^\d+\. \d/.test(x)).join(' | ');
  melde(/140\.12|02:20\.12/.test(zeiten(seite.vorher)) && !/01:39\.50/.test(zeiten(seite.vorher)), `(m) Alpen-Seite zeigt die alten Alpen-Zeiten: ${zeiten(seite.vorher).slice(0, 120)}`);
  melde(/01:39\.50/.test(zeiten(seite.nachher)) && !/02:20\.12/.test(zeiten(seite.nachher)), `(n) Umschalter auf ${seite.optionen[1]}: nur Finnland-Zeiten (${zeiten(seite.nachher).slice(0, 120)})`);
  melde(JSON.stringify(seite.zurueck) === JSON.stringify(seite.vorher), `(n) zurück auf ${seite.optionen[0]}: wieder genau die Alpen-Liste`);
  melde(s2.fehler.length === 0, `Konsole ohne Fehler (${s2.fehler.length})`);
  await s2.schliessen();
}

if (teil('q')) {
  console.log('(q) Layout der Etappenwahl und Bestzeiten in allen Fenstergrössen (M9a)');
  for (const [b, h, touch] of [[402, 874, true], [874, 402, true], [640, 360, false], [640, 360, true], [1280, 720, false]]) {
    const s = await mitMenue({ breite: b, hoehe: h, ...(touch ? { geraet: { hasTouch: true, isMobile: true, deviceScaleFactor: 1 } } : {}) });
    const r = await s.page.evaluate(async () => {
      const A = window.__alpineRally, aus = {};
      A.zumMenue();
      for (const n of ['etappe', 'bestzeiten', 'haupt']) {
        A.menue.oeffne(A.seiten[n]);
        await new Promise((ok) => setTimeout(ok, 800));
        A.menue.neuZeichnen();
        await new Promise((ok) => setTimeout(ok, 300));
        const m = A.menue.rollen, tr = A.menue.treffer.map((t) => [t.x, t.y, t.b, t.h]);
        let ueber = 0;
        for (let i = 0; i < tr.length; i++) for (let j = i + 1; j < tr.length; j++) { const [ax, ay, ab, ah] = tr[i], [bx, by, bb, bh] = tr[j]; if (ax < bx + bb && bx < ax + ab && ay < by + bh && by < ay + ah) ueber++; }
        aus[n] = { x: Math.round((320 - m.breite) / 2), y: m.y0, b: m.breite, h: m.hoehe, rollen: m.max, treffer: tr.length, ueber };
        A.menue.zurueck();
      }
      return aus;
    });
    const ok = Object.values(r).every((m) => m.x >= 0 && m.y >= 0 && m.x + m.b <= 320 && m.y + m.h <= 180 && !m.rollen && m.ueber === 0);
    melde(ok, `${b}x${h}${touch ? ' Touch' : ''}: ${Object.entries(r).map(([n, m]) => `${n} ${m.b}x${m.h} bei ${m.x},${m.y}${m.rollen ? ' ROLLT' : ''}${m.ueber ? ` ${m.ueber} Überlappungen` : ''}`).join(', ')}`);
    await s.schliessen();
  }
}

// ===================================================================== (u) Frühere Tests (nur mit --lang)
if (teil('u') && process.argv.includes('--lang')) {
  console.log('(u) Frühere Tests (Teile, die nicht am alten Quelltext hängen)');
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
    // Rot? Dann denselben Test in 0.10a: sind genau diese Zeilen dort auch rot, ist es nicht durch M10a gekommen
    let vorher = false;
    if (r.code !== 0 && ALT && fs.existsSync(path.join(ALT, 'tools', datei))) {
      const ra = werkzeug(datei, a, ALT);
      const rotAlt = new Set(zeilenVon(ra.text).filter((x) => /^\s*FEHLER/.test(x)).map((x) => x.trim()));
      vorher = rot.length > 0 && rot.every((x) => rotAlt.has(x));
    }
    melde(r.code === 0 || vorher, `${datei} ${a.join(' ')}: ${z.length - rot.length} ok, ${rot.length} rot${vorher ? ' (genau diese Zeilen sind schon in 0.10a rot)' : ''}${rot.length ? ` – ${rot.slice(0, 2).map((x) => x.slice(0, 150)).join(' | ')}` : ''}`);
  }
  // Messdateien, die alte Tests neu schreiben, zurücksetzen
  const neu = spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter((d) => d && !vorher.has(d) && /^(screenshots|tools)\//.test(d));
  if (neu.length) spawnSync('git', ['checkout', '--', ...neu], { cwd: WURZEL });
  info(`von den alten Tests geänderte Messdateien zurückgesetzt: ${neu.length}`);
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
