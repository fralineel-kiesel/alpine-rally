// Meilenstein 11a.1 prüfen (seit M11b gekürzt):  node tools/m11a1-test.mjs [--alt <ordner>] [--nur a,b,...] [--lang]
// Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein Gamepad, Ton nur gemessen (nicht gehört).
// M11b: Die Etappe Gletscher ist entfernt (ersetzt durch das Skigebiet). Was nur Gletscher-Zahlen prüfte, ist gestrichen
// (Erwartung alt, Gletscher entfernt): (b) Zeit je Sprung, (c) Kreuzung 356 m, (f)/(g)/(h) Lage und Anteil der Eisseen,
// (k) Abkürzungen, (l)/(s) Testfahrer und Kurven-Vergleich, (n) Farbabstand See, (o)/(r) Lage der Hohlwege, (t) Hang,
// (u)/(z) Kontrast, (w)/(ab) Bildzeit, (x) keine Bäume, (y) Berge – die Prüfungen fürs Skigebiet stehen in tools/m11b-test.mjs.
// Was bleibt (Engine-Code, der im Spiel bleibt):
//   (a) EIS in der Symbol-Legende, (d) Finnland-Pace-Notes, (e) Alpen/Finnland unverändert (mit --alt <ordner>),
//   (i) Bremsweg Schnee/Eis, (q) Tiefschnee-Rand (jetzt auf dem Skigebiet),
//   (j) Eissee, (p) Hohlweg-Bank und (aa) Skipiste als Engine-Test: auf einer Test-Variante des Skigebiets, in die
//       ein Hohlweg, ein Eissee und eine Skipiste eingesetzt werden (ENGINE unten), weil keine Strecke sie mehr nutzt
//   (zz) nur mit --lang: frühere Tests (einmal)
// Umgebungsvariablen: M11A1_AUTOS=rt4,l073 (weniger Autos), M11A1_NEU=1 (Testfahrer-Läufe neu statt aus /tmp/m11a1).

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null; // 0.11a
let fehler = 0;
const ergebnisse = [];
let aktuell = null;
const titel = (t) => { console.log(t); aktuell = { titel: t, ok: 0, rot: 0 }; ergebnisse.push(aktuell); };
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; if (aktuell) aktuell[ok ? 'ok' : 'rot']++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m11a1';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M11A1_AUTOS ? process.env.M11A1_AUTOS.split(',') : ['rt4', 'delto', 'imprexa', 'escorta', 'l073'];
const ALLRAD = ['rt4', 'delto', 'imprexa'].filter((a) => AUTOS.includes(a)), HINTERRAD = ['escorta', 'l073'].filter((a) => AUTOS.includes(a));
const G_DATEI = path.join(WURZEL, 'strecken', 'skigebiet.js');
if (!ALT) info('Vergleiche Alpen/Finnland nur mit --alt <ordner> (Referenz-Stand, z. B. git worktree add <ordner> 471d726 = 0.11a.1)');

// Spiel öffnen (wie m11a-test)
async function oeffne(wurzel, adresse = '', { auto, breite = 640, hoehe = 360, geraet, speicher = null, uhr = false, datei = null } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, ...(auto ? { auto } : {}), ...(geraet ? { geraet } : {}) });
  s.fehler = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  // uhr: eigene Bild-Uhr (window.__bild(n, dt)), damit Bilder pixelgleich vergleichbar sind
  if (uhr) await s.page.addInitScript(() => {
    let jetzt = 0; const warte = [];
    performance.now = () => jetzt;
    window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
    window.cancelAnimationFrame = () => {};
    window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
  });
  // datei: andere Streckendatei unterschieben (wie tools/strecke-abfahren.mjs, über window.__streckeAdresse)
  if (datei) {
    const inhalt = fs.readFileSync(datei, 'utf8');
    await s.page.route('**/__strecke/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: inhalt }));
    await s.page.addInitScript((n) => { window.__streckeAdresse = `${location.origin}/__strecke/${n}`; }, path.basename(datei));
  }
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally || window.__fehlerseite, null, { timeout: 120000, polling: 100 });
  return s;
}
// höchstens n Aufgaben gleichzeitig
async function parallel(aufgaben, n = 3) {
  const out = new Array(aufgaben.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < aufgaben.length) { const k = i++; out[k] = await aufgaben[k](); } }));
  return out;
}
const STILE = ['vorsichtig', 'mittel', 'flott', 'digital', 'wand'];
// Testfahrer-Lauf (strecke-abfahren --json), Ergebnis in LOG zwischengespeichert
function testfahrerLauf(strecke, auto, wurzel = WURZEL, stand = 'neu', stile = STILE, extra = []) {
  const name = `fahrt-${stand}-${path.basename(strecke, '.js')}-${auto}-${stile.join('').slice(0, 24)}${extra.length ? `-${extra.join('').replace(/[^a-z0-9]/gi, '')}` : ''}`;
  const datei = path.join(LOG, `${name}.json`);
  if (fs.existsSync(datei) && !(stand === 'neu' && process.env.M11A1_NEU)) return Promise.resolve(JSON.parse(fs.readFileSync(datei, 'utf8')));
  const a = [path.join(wurzel, 'tools', 'strecke-abfahren.mjs'), strecke.includes('/') ? strecke : path.join(wurzel, 'strecken', `${strecke}.js`), '--auto', auto, '--stil', stile.join(','), '--json', datei, '--aus', datei.replace('.json', '.txt')];
  if (wurzel !== WURZEL) a.push('--wurzel', wurzel);
  a.push(...extra);
  return new Promise((ok, nein) => {
    const k = spawn(process.execPath, a, { cwd: WURZEL });
    let txt = ''; k.stdout.on('data', (d) => { txt += d; }); k.stderr.on('data', (d) => { txt += d; });
    k.on('close', () => { if (!fs.existsSync(datei)) { console.log(txt.slice(-1500)); nein(new Error(`strecke-abfahren ${strecke} ${auto} ${stand}`)); } else ok(JSON.parse(fs.readFileSync(datei, 'utf8'))); });
  });
}
const fmtZ = (t) => (t == null ? 'NICHT IM ZIEL' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);
const relativ = (l) => { const a = (l || []).find((x) => x >= 0); return (l || []).map((x) => (x < 0 ? x : +(x - a).toFixed(9))); };
const kern = (x) => JSON.stringify({ zeit: x.zeit, cps: x.cps, aufpralle: x.aufpralle, aufprallListe: x.aufprallListe, zeitBei: relativ(x.zeitBei), wand: (x.wandKontakte || []).length, strafen: (x.motorStrafen || []).length, spruenge: x.spruenge });

// Sprungweiten an jeder Zone (wie m11a-test)
const WEITEN = (kmhs) => {
  const A = window.__alpineRally, P = A.physik, F = A.flug; A.anhalten = true; const out = {};
  for (const z of A.strecke.sprungZonen) {
    out[z.name] = [];
    for (const kmh of kmhs) {
      A.setzeAuf(z.kante - 6); P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
      const n0 = F.ereignis.landung, a0 = F.ereignis.abheben;
      for (let t = 0; t < 6 && F.ereignis.landung === n0; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 0.4, bremse: 0, lenkung: 0, handbremse: false }, true);
      const L = F.letzteLandung, belag = A.netz.belag[Math.round(L.s)];
      out[z.name].push(F.ereignis.abheben === a0 ? { kmh, ab: false } : { kmh, ab: true, weite: L.weite, verlust: L.verlust, klasse: L.klasse, belag, s: L.s, strafen: A.wand.strafen });
    }
  }
  return { out };
};
// Bild-Prüfsumme an festen Stellen (eigene Bild-Uhr, 320x180)
const BILD_SUMME = async ({ stellen }) => {
  const A = window.__alpineRally, out = [];
  for (const s0 of stellen) {
    A.setzeAuf(s0); A.kameraSofort(); window.__bild(3, 1000 / 60);
    const c = document.getElementById('spiel'), g = c.getContext('webgl2') || c.getContext('webgl');
    const w = g.drawingBufferWidth, h = g.drawingBufferHeight, px = new Uint8Array(w * h * 4);
    A.renderer.render(A.szene, A.kamera); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px);
    let x = 0; for (let i = 0; i < px.length; i += 3) x = (x * 31 + px[i]) % 1000000007;
    out.push(`${w}x${h}:${x}`);
  }
  return out;
};
async function bildSummen(wurzel, strecke, schattenAn, stellen) {
  const sp = { 'alpineRally.einstellungen': JSON.stringify({ schatten: schattenAn }) };
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=${strecke}&aufloesung=320x180`, { uhr: true, speicher: sp });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; window.__bild(5, 1000 / 60); });
  const r = await s.page.evaluate(BILD_SUMME, { stellen });
  await s.schliessen();
  return r;
}
// Unveränderlich: Alpen/Finnland (Testfahrer bit-gleich zu 0.11a, Längen, Sprünge, Bilder) – in jedem Teil (e, m, v, ac)
async function unveraendert(buchstabe, { bilder = true, stile = STILE } = {}) {
  titel(`(${buchstabe}) Alpen und Finnland unverändert: Testfahrer bit-gleich zu 0.11a (alle Autos, Stile ${stile.join('/')}), Länge, Sprünge${bilder ? ', Bilder pixelgleich' : ''}`);
  if (!ALT) { melde(false, 'nur mit --alt <ordner 0.11a>'); return; }
  for (const strecke of ['alpen', 'finnland']) {
    const paare = await parallel(AUTOS.flatMap((id) => [() => testfahrerLauf(strecke, id, WURZEL, `neu${buchstabe}`, stile), () => testfahrerLauf(strecke, id, ALT, 'alt', stile)]), 4);
    const anders = []; let n = 0;
    AUTOS.forEach((id, k) => {
      const neu = paare[2 * k], alt = paare[2 * k + 1];
      for (const stil of stile) { n++; const x = neu.stile.find((q) => q.stil === stil), y = alt.stile.find((q) => q.stil === stil); if (kern(x) !== kern(y)) anders.push(`${id}/${stil} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)}`); }
    });
    melde(anders.length === 0, `${strecke}: ${n - anders.length} von ${n} Läufen bit-gleich (auch mit Wandkontakt)${anders.length ? ` – ANDERS: ${anders.join('; ')}` : ''}`);
  }
  for (const [strecke, laenge, weiten] of [['alpen', 3667.587, [16.6, 19.6, 22.5]], ['finnland', 4161.6, [14.5, 23.8, 38.0, 30.3]]]) {
    const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${strecke}`, { auto: 'rt4' });
    const r = await s.page.evaluate(WEITEN, [100]);
    const L = await s.page.evaluate(() => window.__alpineRally.strecke.laenge);
    await s.schliessen();
    const w = Object.values(r.out).map((l) => l[0].weite);
    melde(Math.abs(L - laenge) <= 0.5 && w.length === weiten.length && w.every((x, i) => Math.abs(x - weiten[i]) <= 0.5), `${strecke}: Länge ${L.toFixed(3)} m, Sprünge bei 100 km/h (Audan) ${w.map((x) => x.toFixed(1)).join(' / ')} m (soll ${weiten.join(' / ')})`);
  }
  if (bilder) {
    const stellen = { alpen: [300, 1200, 2100, 3000, 3500], finnland: [600, 1500, 2600, 3500] };
    const anders = [];
    for (const strecke of ['alpen', 'finnland']) for (const sch of [true, false]) {
      const n = await bildSummen(WURZEL, strecke, sch, stellen[strecke]), a = await bildSummen(ALT, strecke, sch, stellen[strecke]);
      n.forEach((x, i) => { if (x !== a[i]) anders.push(`${strecke} ${sch ? 'AN' : 'AUS'} ${stellen[strecke][i]} m`); });
    }
    melde(anders.length === 0, `3D-Bilder (320x180) an ${2 * (5 + 4)} Stellen pixelgleich zu 0.11a (SCHATTEN AN und AUS)${anders.length ? ` – ANDERS: ${anders.join(', ')}` : ''}`);
  }
}

// ===================================================================== Teil A

// ===================================================================== Teil A
if (teil('a')) {
  titel('(a) EIS in der Symbol-Legende (STEUERUNG → PACE-NOTES-SYMBOLE), Deutsch und Englisch, Kachel gemalt');
  const quelle = fs.readFileSync(path.join(WURZEL, 'js/texte.js'), 'utf8');
  const z = /'legende\.eis': \{ de: '([^']+)', en: '([^']+)' \}/.exec(quelle);
  melde(!!z && z[1] === z[1].toUpperCase() && z[2] === z[2].toUpperCase(), `Text: de "${z && z[1]}", en "${z && z[2]}" (Grossbuchstaben)`);
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=alpen');
  const r = await s.page.evaluate(async () => {
    const A = window.__alpineRally, TX = await import('/js/texte.js'), aus = {};
    for (const sp of ['de', 'en']) {
      TX.setzeSprache(sp);
      const l = A.seiten.symbole.eintraege, c = document.createElement('canvas'); c.width = 320; c.height = 600;
      const x = c.getContext('2d');
      // die Liste hat einen Eintrag mehr als vorher (20 statt 19 Symbole); der 8. ist EIS (nach SPRUNG)
      const n = l.filter((e) => e.waehlbar).length;
      x.clearRect(0, 0, 320, 600);
      const eintrag = l[7]; eintrag.zeichne(x, 0, 0, 300, false); // 8. Eintrag = EIS (nach SPRUNG)
      const kachel = x.getImageData(10, 0, 28, 16).data; let farbig = 0;
      for (let p = 0; p < kachel.length; p += 4) if (kachel[p + 3] > 0 && (kachel[p] > 150 && kachel[p + 1] > 150 && kachel[p + 2] > 150)) farbig++;
      aus[sp] = { n, farbig, text: TX.t('legende.eis'), breite: eintrag.breite() };
    }
    TX.setzeSprache('de');
    return aus;
  });
  await s.schliessen();
  for (const sp of ['de', 'en']) melde(r[sp].n === 20 && r[sp].farbig > 10, `${sp}: ${r[sp].n} Symbole (vorher 19), 8. Eintrag "${r[sp].text}" mit gemalter Schneeflocke (${r[sp].farbig} helle Pixel in der Kachel), Breite ${r[sp].breite} px (Seite 320)`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
}

// (b) Zeit je Sprung: Testfahrer „mittel“ mit gegen ohne Sprungzonen (dieselbe Strecke, Kuppen ohne Zone = flach),

// (d) Finnland-Pace-Notes
if (teil('d')) {
  titel('(d) Finnland pacenotes-test: die zwei roten Zeilen (1812–1964 m Messung über die Birkenkuppe, Abstand 18 m zum SPRUNG) entschieden');
  const r = werkzeug('pacenotes-test.mjs', ['--strecke', 'finnland']);
  fs.writeFileSync(path.join(LOG, 'pacenotes-finnland.log'), r.text);
  const rot = r.text.split('\n').filter((x) => /^FEHLER/.test(x));
  melde(r.code === 0 && rot.length === 0 && /nur gemeldet \(Sprungkante in der Kurve\): 1812/.test(r.text), `pacenotes-test --strecke finnland: ${rot.length ? rot.join(' | ') : 'alles grün'}; Kurve 1812–1964 m nur gemeldet (Sprungkante 1830 m), erzeugt.kurvenTempo unverändert`);
  const g = fs.readFileSync(path.join(WURZEL, 'strecken/finnland.js'), 'utf8');
  const a = ALT ? fs.readFileSync(path.join(ALT, 'strecken/finnland.js'), 'utf8') : g;
  melde(g === a, `strecken/finnland.js unverändert gegen 0.11a${ALT ? '' : ' (ohne --alt nicht geprüft)'}`);
}
if (teil('e')) await unveraendert('e');

// ===================================================================== Engine-Test-Variante (M11b)
// Keine Strecke nutzt mehr Eissee, Hohlweg und (bis Teil E) die Skipiste. Damit der Code geprüft bleibt, wird das
// Skigebiet kopiert und ein Hohlweg, ein Eissee (mit Eis-Belag 6 m hinter dem Ufer) und eine Skipiste eingesetzt.
// ENGINE: Orte (Streckenmeter) auf geraden Stücken des Skigebiets.
const ENGINE = { hohlweg: [500, 660], see: { s: 950, laenge: 70, breite: 32 }, piste: { s: [700, 640], seite: 1, lat: [220, 50], breite: 28, skifahrer: 5, seed: 5150 } };
function engineVariante() {
  const t = fs.readFileSync(G_DATEI, 'utf8'), E = ENGINE;
  const vonEis = E.see.s - E.see.laenge / 2 + 6, bisEis = E.see.s + E.see.laenge / 2 - 6;
  let neu = t.replace(/\n  sprung: \[/, `\n  hohlwege: [{ von: ${E.hohlweg[0]}, bis: ${E.hohlweg[1]} }],\n  eisseen: [{ s: ${E.see.s}, laenge: ${E.see.laenge}, breite: ${E.see.breite} }],\n  skipiste: ${JSON.stringify(E.piste)},\n  sprung: [`);
  // Eis-Belag als letzten Eintrag der belagAbschnitte (spätere Einträge gehen vor)
  const ba = neu.indexOf('\n  belagAbschnitte: ['), ende = neu.indexOf('\n  ],', ba);
  neu = `${neu.slice(0, ende)}\n    { von: ${vonEis}, bis: ${bisEis}, belag: 'eis' },${neu.slice(ende)}`;
  const datei = path.join(LOG, 'skigebiet-engine.js');
  fs.writeFileSync(datei, neu);
  return datei;
}

if (teil('i')) {
  titel('(i) Bremsweg 100 → 0 gegen Schotter: Schnee ca. 1.5, Eis ca. 2.8 (±15 %, wie 0.11a: 1.48–1.49 / 2.81–2.83)');
  const e = await (await import('./schnee-messung.mjs')).schneeMessung(WURZEL);
  let ok = true; const z = [];
  for (const id of AUTOS) {
    const r = e[id], vs = r.schnee.bremsweg / r.schotter.bremsweg, ve = r.eis.bremsweg / r.schotter.bremsweg;
    ok = ok && vs >= 1.475 && vs <= 1.495 && ve >= 2.805 && ve <= 2.835;
    z.push(`${id} ${vs.toFixed(2)} / ${ve.toFixed(2)}`);
  }
  melde(ok, `Schnee / Eis: ${z.join(', ')}`);
}
// (j) seitlich aus dem See fahren: Rand bremst, keine Strafe, kein Steckenbleiben
const RAND_AUSTRITT = async () => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke, E = A.welt.eisseen; A.anhalten = true;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, out = [];
  for (const see of E.seen) for (const sd of [-1, 1]) {
    // von der Seemitte quer zum Ufer (45° zur Strasse), 50 km/h, Gas halb
    A.setzeAuf(see.s); const p = S.punktBei(see.s);
    P.richtung += sd * -Math.PI / 4; // (Richtung kleiner = nach rechts)
    P.vx = Math.sin(P.richtung) * 50 / 3.6; P.vz = Math.cos(P.richtung) * 50 / 3.6;
    const st0 = A.wand.strafen, q = {}; let draussen = null, vRaus = null, v2 = null, maxSeite = 0;
    for (let t = 0; t < 8; t += A.SCHRITT) {
      A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.5 }, true);
      S.abfrage(P.x, P.z, q); const b = E.bei(q.s, q.seite); maxSeite = Math.max(maxSeite, Math.abs(q.seite));
      if (draussen == null && (!b.see || b.rho > 1)) { draussen = t; vRaus = P.tempo * 3.6; }
      if (draussen != null && v2 == null && t >= draussen + 2) v2 = P.tempo * 3.6;
    }
    const x0 = P.x, z0 = P.z; for (let t = 0; t < 3; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }, true);
    out.push({ s: see.s, seite: sd, draussen, vRaus, v2, strafen: A.wand.strafen - st0, rueck: Math.hypot(P.x - x0, P.z - z0), untergrund: A.welt.bodenBei(x0, z0).art, maxSeite });
  }
  return out;
};
if (teil('j')) {
  titel('(j) Engine-Test Eissee: seitlich aus dem See (50 km/h, Gas halb): der Rand bremst, keine Strafe, kein Steckenbleiben (rückwärts frei)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus', { datei: engineVariante() });
  const r = await s.page.evaluate(RAND_AUSTRITT);
  await s.schliessen();
  for (const x of r) melde(x.draussen != null && x.strafen === 0 && x.rueck >= 2 && x.v2 < x.vRaus, `See ${x.s} m ${x.seite < 0 ? 'links' : 'rechts'}: Ufer nach ${x.draussen && x.draussen.toFixed(1)} s mit ${x.vRaus && x.vRaus.toFixed(0)} km/h, 2 s später ${x.v2 && x.v2.toFixed(0)} km/h (Rand: ${x.untergrund}), Strafen ${x.strafen}, rückwärts in 3 s ${x.rueck.toFixed(1)} m`);
}
// (p) Hohlweg-Bank (wie der Schneewall aus M11a): schräg hinein, bremst, keine Strafe, rutscht heraus, rückwärts frei
const BANK_TEST = async () => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke, SW = A.schneewall; A.anhalten = true;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, out = [];
  for (const h of S.hohlwege) for (const [sd, winkel, gas] of [[1, 15, 0], [-1, 30, 0], [1, 20, 1]]) {
    const s0 = Math.round((h.von + h.bis) / 2) - 25;
    A.setzeAuf(s0); P.richtung -= sd * winkel * Math.PI / 180; // (Richtung kleiner = nach rechts)
    P.vx = Math.sin(P.richtung) * 80 / 3.6; P.vz = Math.cos(P.richtung) * 80 / 3.6;
    const st0 = A.wand.strafen; let kontakt = 0, v1 = null, vEin = null, raus = null, tief = 0;
    for (let t = 0; t < 5; t += A.SCHRITT) {
      A.physikSchritt(A.SCHRITT, { ...LEER, gas }, true);
      if (SW.kontakt) { if (vEin == null) vEin = P.tempo * 3.6; kontakt += A.SCHRITT; if (v1 == null && kontakt >= 1) v1 = P.tempo * 3.6; }
      else if (vEin != null && raus == null) raus = kontakt;
      const q = S.abfrage(P.x, P.z, {}); tief = Math.max(tief, Math.abs(q.seite) + A.CONFIG.schneewall.autoHalb - SW.kante[Math.round(q.i)]);
    }
    const x0 = P.x, z0 = P.z; for (let t = 0; t < 3; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }, true);
    // rückwärts: stehend, Nase quer in der Bank, ganz eingetaucht (tiefeMax) – kommt das Auto heraus?
    const m = Math.round((h.von + h.bis) / 2); A.setzeAuf(m); const p = S.punktBei(m), C = A.CONFIG.schneewall;
    const l = sd * (SW.kante[m] + C.tiefeMax - C.autoHalb); P.x = p.x - p.tz * l; P.z = p.z + p.tx * l; P.richtung -= sd * Math.PI / 2; P.vx = 0; P.vz = 0;
    const x1 = P.x, z1 = P.z; for (let t = 0; t < 3; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }, true);
    out.push({ von: h.von, sd, winkel, gas, vEin, v1, raus, tief, strafen: A.wand.strafen - st0, rueck: Math.hypot(P.x - x1, P.z - z1) });
  }
  return out;
};
if (teil('p')) {
  titel('(p) Engine-Test Hohlweg-Bank: schräg hinein (80 km/h): bremst, keine Strafe, kein Steckenbleiben, rückwärts frei');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus', { datei: engineVariante() });
  const r = await s.page.evaluate(BANK_TEST);
  await s.schliessen();
  for (const x of r) melde(x.vEin != null && x.strafen === 0 && x.rueck >= 2 && x.tief <= 1.05 && (x.v1 == null || x.v1 < x.vEin), `${x.von} m ${x.sd < 0 ? 'links' : 'rechts'} ${x.winkel}°${x.gas ? ' Vollgas' : ''}: Kontakt mit ${x.vEin && x.vEin.toFixed(0)} km/h, nach 1 s ${x.v1 == null ? '(schon draussen)' : `${x.v1.toFixed(0)} km/h`}, wieder draussen nach ${x.raus == null ? '–' : `${x.raus.toFixed(2)} s`}, tiefstes Eintauchen ${x.tief.toFixed(2)} m, Strafen ${x.strafen}, rückwärts aus voller Tiefe (stehend, quer) in 3 s ${x.rueck.toFixed(1)} m`);
}
// M11b: Stellen auf dem Skigebiet (gerade Stücke ohne Netz/Deko daneben)
const TIEFSCHNEE_STELLEN = [[200, 9], [200, -9], [560, 10], [1000, -9]];
// (q) Tiefschnee-Rand: 80 km/h seitlich hineinversetzt, 2 s (Gas los / Vollgas); Vergleich Gras in den Alpen
const RAND_BREMSEN = async ({ s0, lat }) => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke; A.anhalten = true;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, out = {};
  for (const [name, gas] of [['los', 0], ['voll', 1]]) {
    A.setzeAuf(s0); const p = S.punktBei(s0); P.x = p.x - p.tz * lat; P.z = p.z + p.tx * lat;
    P.vx = Math.sin(P.richtung) * 80 / 3.6; P.vz = Math.cos(P.richtung) * 80 / 3.6;
    const st0 = A.wand.strafen; let art = null;
    for (let t = 0; t < 2; t += A.SCHRITT) { A.physikSchritt(A.SCHRITT, { ...LEER, gas }, true); art = art || A.untergrund; }
    const v2 = P.tempo * 3.6, motor = A.wand.strafeRest > 0;
    // rückwärts 3 s (Bremse halten), dann 10 s zurück auf die Strasse (Gas, zur Mitte lenken)
    const x0 = P.x, z0 = P.z; for (let t = 0; t < 3; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }, true);
    const rueck = Math.hypot(P.x - x0, P.z - z0);
    out[name] = { v2, verlust: 1 - v2 / 80, art, strafen: A.wand.strafen - st0, motor, rueck };
  }
  return out;
};
if (teil('q')) {
  titel('(q) Tiefschnee-Rand (Skigebiet): Tempo fällt in 2 s um mindestens 60 % (aus 80 km/h), stärker als Gras in den Alpen, keine Strafe, keine MOTOR-Leuchte, rückwärts frei');
  const g = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet');
  const t = [];
  for (const [s0, lat] of TIEFSCHNEE_STELLEN) t.push({ s0, lat, ...(await g.page.evaluate(RAND_BREMSEN, { s0, lat })) });
  const extra = await g.page.evaluate(() => ({ staub: window.__alpineRally.CONFIG.staub.belaege.tiefschnee, ton: window.__alpineRally.CONFIG.audio && null }));
  await g.schliessen();
  const a = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=alpen');
  let gras = null;
  for (const [s0, lat] of [[300, 10], [1500, 9], [2500, -9], [600, 8], [3200, 9]]) {
    const x = await a.page.evaluate(RAND_BREMSEN, { s0, lat });
    if (x.los.art === 'gras' && x.los.v2 > 1 && x.voll.v2 > 1) { gras = { ...x, s0, lat }; break; } // (Stelle ohne Hindernis)
  }
  await a.schliessen();
  info(`Gras Alpen (${gras.s0} m, ${gras.lat} m neben der Mitte, ${gras.los.art}): Gas los −${(gras.los.verlust * 100).toFixed(0)} % (${gras.los.v2.toFixed(0)} km/h), Vollgas −${(gras.voll.verlust * 100).toFixed(0)} %`);
  for (const x of t) melde(x.los.art === 'tiefschnee' && x.los.verlust >= 0.6 && x.los.verlust > gras.los.verlust + 0.15 && x.voll.verlust > gras.voll.verlust && !x.los.strafen && !x.voll.strafen && !x.los.motor && !x.voll.motor && x.los.rueck >= 2 && x.voll.rueck >= 2,
    `${x.s0} m ${x.lat < 0 ? 'links' : 'rechts'} (${x.los.art}): Gas los −${(x.los.verlust * 100).toFixed(0)} % (${x.los.v2.toFixed(0)} km/h), Vollgas −${(x.voll.verlust * 100).toFixed(0)} % (${x.voll.v2.toFixed(0)} km/h), Strafen ${x.los.strafen + x.voll.strafen}, MOTOR ${x.los.motor || x.voll.motor ? 'AN' : 'aus'}, rückwärts ${x.los.rueck.toFixed(1)} / ${x.voll.rueck.toFixed(1)} m in 3 s`);
  melde(!!extra.staub && extra.staub.farbe === '#ffffff', `Schneestaub im Tiefschnee weiss (${JSON.stringify(extra.staub)}); Ton: Rollgeräusch „weich“ (dumpf, 200 Hz), nur gemessen`);
}
// (aa) Skipiste: Skifahrer bewegen sich (Bild-Uhr), kein Garbage je Bild, keine Kollision
const SKI_TEST = async () => {
  const A = window.__alpineRally, K = A.skipiste; if (!K.an) return { an: false };
  const sichtbar = (f) => f.sprites[f.sprites[0].visible ? 0 : 1].position.clone(); // (je Fahrer die gerade sichtbare Haltung)
  const vorher = K.fahrer.map(sichtbar);
  window.__bild(60, 1000 / 60); // 1 s Spielzeit
  const bewegt = K.fahrer.map((f, j) => sichtbar(f).distanceTo(vorher[j]));
  // Garbage: 200 000 Aufrufe von aktualisiere ohne GC dazwischen
  const m0 = performance.memory ? performance.memory.usedJSHeapSize : 0;
  for (let i = 0; i < 200000; i++) K.aktualisiere(1 / 60);
  const m1 = performance.memory ? performance.memory.usedJSHeapSize : 0;
  // keine Kollision: nichts von der Piste in den Hindernis-Listen, und das Auto fährt ungebremst hindurch
  const S = A.strecke, P = A.physik, q = {};
  const nahe = (l) => l.filter((h) => Math.hypot(h.x - K.oben[0], h.z - K.oben[1]) < 3 || Math.hypot(h.x - K.unten[0], h.z - K.unten[1]) < 3).length;
  const pist = nahe(A.pflanzen.hindernisse) + nahe(A.leben.hindernisse) + nahe(A.strassenrand.hindernisse);
  return { an: true, fahrer: K.fahrer.length, bewegt, zuwachs: m1 - m0, laenge: K.laenge, pist, sichtbar: K.fahrer.every((f) => f.sprites.some((s) => s.visible)) };
};
if (teil('aa')) {
  titel('(aa) Engine-Test Skipiste: 4–6 Skifahrer fahren (Animation), kein Garbage je Bild, keine Kollision, kein Ton');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus', { uhr: true, datei: engineVariante() });
  await s.page.evaluate(() => { window.__bild(5, 1000 / 60); });
  const r = await s.page.evaluate(SKI_TEST);
  await s.schliessen();
  if (!r.an) melde(false, 'Skipiste nicht gebaut');
  else {
    melde(r.fahrer >= 4 && r.fahrer <= 6 && r.bewegt.every((d) => (d > 1 && d < 30) || d > r.laenge * 0.7) && r.sichtbar, `${r.fahrer} Skifahrer, in 1 s bewegt: ${r.bewegt.map((d) => (d > r.laenge * 0.7 ? `${d.toFixed(0)} m (unten angekommen, oben neu gestartet)` : `${d.toFixed(1)} m`)).join(', ')}; Piste ${r.laenge.toFixed(0)} m lang`);
    melde(r.zuwachs < 200000, `200 000 Aufrufe von aktualisiere: Speicher-Zuwachs ${(r.zuwachs / 1024).toFixed(0)} KB (ohne GC dazwischen; Wege vorberechnet, je Bild nur position.set)`);
    melde(r.pist === 0, `keine Hindernisse an der Piste (${r.pist}); Skipiste ohne Ton (kein Eintrag in klang)`);
  }
}
// ===================================================================== Teil E: volle Regression (nur mit --lang, einmal)
if (teil('zz') && process.argv.includes('--lang')) {
  titel('(zz) frühere Tests (--lang): nur neue Abweichungen melden');
  const laeufe = [
    ['pacenotes-test.mjs', []], ['pacenotes-test.mjs', ['--strecke', 'finnland']], ['pacenotes-test.mjs', ['--strecke', 'skigebiet']],
    ['leben-test.mjs', []], ['kuh-test.mjs', []], ['startziel-test.mjs', []], ['strassenrand-test.mjs', []], ['nebenweg-test.mjs', []],
    ['felswand-test.mjs', []], ['belag-test.mjs', []], ['rennablauf-test.mjs', []], ['menue-test.mjs', []], ['overlay-test.mjs', []],
    ['m9a2-test.mjs', ['--nur', 'a,c,e,f,g,h,k,l,m']], ['m9a1-test.mjs', ['--nur', 'a,b,c,e,f,g,h,i,j,k,m,n,o,p,r']], ['m8h-test.mjs', []],
    ['m10d-test.mjs', ['--nur', 'a,a3,b,c,g,h,i,j,k,l,m,n,s,t,u,w']],
    // M11a: was nach dem Gletscher-Ausbau noch gilt (M11b: Gletscher-Teile gestrichen, r/t/u/v aufs Skigebiet umgestellt)
    ['m11a-test.mjs', ['--nur', 'a,b,d,e,f,h,j,r,t,u,v']], ['kommentar-waechter.mjs', []],
  ];
  for (const [datei, a] of laeufe) {
    const r = werkzeug(datei, a);
    fs.writeFileSync(path.join(LOG, `zz-${datei.replace('.mjs', '')}${a.length ? '-' + a.join('').replace(/[^a-z0-9]/gi, '') : ''}.log`), r.text);
    const z = r.text.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x));
    const rot = z.filter((x) => /^\s*FEHLER/.test(x)).map((x) => x.trim().slice(0, 160));
    melde(rot.length === 0 && r.code === 0, `${datei} ${a.join(' ')}: ${z.length - rot.length} ok${rot.length ? `, ${rot.length} rot: ${rot.join(' | ')}` : ''}${r.code ? ` (Rückgabe ${r.code})` : ''}`);
  }
}

// ===================================================================== Zusammenfassung
console.log('\n| Test | Ergebnis |\n|---|---|');
for (const e of ergebnisse) console.log(`| ${e.titel.slice(0, 120)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);