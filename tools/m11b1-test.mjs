// Meilenstein 11b.1 prüfen:  node tools/m11b1-test.mjs --alt <ordner 0.11b> [--nur a,b,...] [--lang]
// (0.11b: git worktree add <ordner> 59a6a32). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein
// Gamepad, Ton nur gemessen (nicht gehört). Vorlage: tools/m11b-test.mjs.
//   Teil A – breite Piste: (a) Breiten, (b) Kehren, (c) Hang-Prüfung, (d) Kurven-Vergleich/Abkürzungen, (e) Kontrast,
//       (f) Testfahrer/Staffelung/Anfahren am Hang, (g) Alpen/Finnland bit-gleich
//   Teil B – Grip: (h) Bremsweg Piste, (i) 0–60 und Hang, (j) kein hartes Tempolimit, (k) Herauskommen, (l) Tempoverlust,
//       (m) Kurven-Vergleich Tiefschnee, (n) bit-gleich
//   Teil C – Kamera: (o) Höhe/Sicht bergab, (p) Ebene/bergauf pixelgleich, (q) kein Ruckeln, (r) Alpen/Finnland pixelgleich
//   Teil D – Kicker: (s) Daten/gezeichnet, (t) Sichtbarkeit 100 m, (u) Weiten/Zeit/Landungen, (v) Statistik, (w) bit-gleich
//   Teil E – Szene: (x) Schneetannen, (y) Hang-Prüfung, (z) Felsen, (aa) Deko-Sorten, (ab) Kontrast, (ac) Bildzeit, (ad) bit-gleich
//   (zz) nur mit --lang: frühere Tests (einmal)
// Umgebungsvariablen: M11B1_AUTOS=rt4,l073 (weniger Autos), M11B1_NEU=1 (Testfahrer-Läufe neu statt aus /tmp/m11b1).


import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null; // 0.11b
let fehler = 0;
const ergebnisse = [];
let aktuell = null;
const titel = (t) => { console.log(t); aktuell = { titel: t, ok: 0, rot: 0 }; ergebnisse.push(aktuell); };
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; if (aktuell) aktuell[ok ? 'ok' : 'rot']++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m11b1';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M11B1_AUTOS ? process.env.M11B1_AUTOS.split(',') : ['rt4', 'delto', 'imprexa', 'escorta', 'l073'];
const ALLRAD = ['rt4', 'delto', 'imprexa'].filter((a) => AUTOS.includes(a)), HINTERRAD = ['escorta', 'l073'].filter((a) => AUTOS.includes(a));
const G_DATEI = path.join(WURZEL, 'strecken', 'skigebiet.js');
if (!ALT) info('Vergleiche Alpen/Finnland nur mit --alt <ordner 0.11b> (git worktree add <ordner> 59a6a32)');

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
  if (fs.existsSync(datei) && !(stand === 'neu' && process.env.M11B1_NEU)) return Promise.resolve(JSON.parse(fs.readFileSync(datei, 'utf8')));
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
// Unveränderlich: Alpen/Finnland (Testfahrer bit-gleich zum Referenz-Stand, Längen, Sprünge, Bilder) – in jedem Teil (e, m, v, ac)
async function unveraendert(buchstabe, { bilder = true, stile = STILE } = {}) {
  titel(`(${buchstabe}) Alpen und Finnland unverändert: Testfahrer bit-gleich zum Referenz-Stand (alle Autos, Stile ${stile.join('/')}), Länge, Sprünge${bilder ? ', Bilder pixelgleich' : ''}`);
  if (!ALT) { melde(false, 'nur mit --alt <ordner 0.11b>'); return; }
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
    melde(anders.length === 0, `3D-Bilder (320x180) an ${2 * (5 + 4)} Stellen pixelgleich zum Referenz-Stand (SCHATTEN AN und AUS)${anders.length ? ` – ANDERS: ${anders.join(', ')}` : ''}`);
  }
}

// gemeinsame Helfer (aus m11b-test übernommen)
const STILE_S = ['mittel', 'flott', 'digital'];
const SKI = {};
async function skiLaeufe(stand) { if (!SKI[stand]) SKI[stand] = await parallel(AUTOS.map((id) => () => testfahrerLauf(G_DATEI, id, WURZEL, stand, STILE_S)), 3); return SKI[stand]; }
function kurvenVergleich(auto, stand) {
  const datei = path.join(LOG, `kurven-${stand}-${auto}.json`);
  if (!fs.existsSync(datei) || process.env.M11B1_NEU) {
    const r = werkzeug('strecke-abfahren.mjs', [G_DATEI, '--auto', auto, '--kurven-vergleich', '--json', datei]);
    if (!fs.existsSync(datei)) { console.log(r.text.slice(-1500)); throw new Error(`kurven-vergleich ${auto}`); }
  }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
const dS = (x) => (x == null ? '–' : `${x >= 0 ? '+' : ''}${x.toFixed(2)} s`);
// Kurven-Vergleich: Tabelle und knappste Linie mit Rand-Kontakt (Netz-„wand“ und Tiefschnee-Abkürzen)
async function kurvenTest(stand, grenze, text) {
  const neu = await parallel(AUTOS.map((id) => async () => kurvenVergleich(id, stand)), 3);
  const tab = ['| Auto | Kurve (m) | beste auf der Strasse | Netz-Linie („wand“) | beste Tiefschnee-Linie (abkürzen innen) |', '|---|---|---|---|---|'];
  const zuSchnell = []; let knapp = Infinity, knappWo = '', knappT = Infinity, knappTWo = '', fest = 0, n = 0;
  AUTOS.forEach((id, k) => {
    for (const c of neu[k]) {
      const best = c.bestAlle ? c.bestAlle.zeit : null;
      const w = c.wand, wDiff = best != null && w.fertig ? w.zeit - best : null;
      const ab = (c.abkuerzen || []).filter((x) => x.fertig && x.kontakt).reduce((m, x) => (!m || x.zeit < m.zeit ? x : m), null);
      const abDiff = ab && best != null ? ab.zeit - best : null;
      fest += (c.abkuerzen || []).filter((x) => !x.fertig).length; n += (c.abkuerzen || []).length;
      tab.push(`| ${id} | ${c.von}–${c.bis} | ${c.bestAlle ? `${c.bestAlle.stil} ${best.toFixed(2)} s` : '–'} | ${dS(wDiff)}${w.kontakt ? ` (Kontakt ${w.kontakt.toFixed(2)} s)` : ' (ohne Kontakt)'} | ${ab ? `${dS(abDiff)} (${ab.stil})` : 'keine kommt durch'} |`);
      if (wDiff != null && w.kontakt && wDiff < knapp) { knapp = wDiff; knappWo = `${id} ${c.von} m`; }
      if (abDiff != null && abDiff < knappT) { knappT = abDiff; knappTWo = `${id} ${c.von} m`; }
      if (wDiff != null && w.kontakt && wDiff < grenze) zuSchnell.push(`${id} ${c.von} m Netz ${dS(wDiff)}`);
      if (abDiff != null && abDiff < grenze) zuSchnell.push(`${id} ${c.von} m Tiefschnee ${dS(abDiff)}`);
    }
  });
  fs.writeFileSync(path.join(LOG, `kurven-${stand}.md`), tab.join('\n') + '\n');
  info(`Tabelle: ${LOG}/kurven-${stand}.md (${tab.length - 2} Zeilen); Tiefschnee-Linien, die stecken bleiben (60 s): ${fest} von ${n}`);
  melde(zuSchnell.length === 0, `${text}: ${zuSchnell.length} Verstösse${zuSchnell.length ? `: ${zuSchnell.join('; ')}` : ''}; knappste Netz-Linie mit Kontakt ${dS(knapp === Infinity ? null : knapp)}${knappWo ? ` (${knappWo})` : ' (die Netze werden nicht mehr berührt)'}, knappste Tiefschnee-Linie ${dS(knappT === Infinity ? null : knappT)} (${knappTWo})`);
  return { knapp, knappT };
}
function abkuerzungTest() {
  const a = werkzeug('abkuerzungen.mjs', ['--strecke', 'skigebiet', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-skigebiet.log'), a.text);
  const z = a.text.split('\n').filter((x) => /Abkürzungen mit Gewinn|Durchkommen/.test(x)).map((x) => x.trim()).join(' | ');
  melde(a.code === 0 && /Abkürzungen mit Gewinn >= 3 m: 0 /.test(a.text), `abkuerzungen --pruefen: Rückgabe ${a.code}; ${z.slice(0, 250)}`);
}
function hangTest() {
  const h = werkzeug('hang-pruefen.mjs', ['--strecke', 'skigebiet', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'hang-skigebiet.log'), h.text);
  const z = h.text.split('\n').filter((x) => /Stellen über|grösste/.test(x)).join(' | ');
  melde(h.code === 0, `Rückgabe ${h.code}: ${z.slice(0, 300)}`);
}
// Kontrast Fahrbahn gegen Hang (320x180, 18 m vor dem Auto). Hang 6 m hinter der Fahrbahnkante auf jeder Seite ohne
// Fangnetz an der Messstelle (das Netz verdeckt sonst den Hang; M11b wählte dafür Stellen ohne Netz); haben beide
// Seiten ein Netz, wird zwischen Pistenrand und Netz gemessen
const KONTRAST = async ({ stellen }) => {
  const A = window.__alpineRally, out = [];
  for (const s0 of stellen) {
    A.setzeAuf(s0); A.kameraSofort(); window.__bild(3, 1000 / 60);
    const c = document.getElementById('spiel'), g = c.getContext('webgl2') || c.getContext('webgl');
    const w = g.drawingBufferWidth, h = g.drawingBufferHeight, px = new Uint8Array(w * h * 4);
    A.renderer.render(A.szene, A.kamera); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px);
    const S = A.strecke, V = new A.THREE.Vector3();
    const hell = (s, lat, y = 0.05) => {
      const p = S.punktBei(s + 18); V.set(p.x - p.tz * lat, p.h + y, p.z + p.tx * lat).project(A.kamera);
      const x = Math.round((V.x + 1) / 2 * w), yy = Math.round((V.y + 1) / 2 * h); let sum = 0, n = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const i = ((yy + dy) * w + (x + dx)) * 4; if (i >= 0 && i < px.length) { sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]; n++; } }
      return n ? sum / n : null;
    };
    const sm = s0 + 18, hb = A.netz.halbBei(sm), fb = hb * 0.5;
    const netzAn = (sd) => A.fangnetze.liste.some((nz) => nz.seite === sd && sm >= nz.von - 25 && sm <= nz.bis + 25);
    const frei = [-1, 1].filter((sd) => !netzAn(sd));
    const hangPunkte = frei.length ? frei.map((sd) => sd * (hb + 6)) : [-(hb + A.CONFIG.strasse.bankett + 1), hb + A.CONFIG.strasse.bankett + 1];
    const fahrbahn = (hell(s0, -fb) + hell(s0, fb)) / 2, hang = hangPunkte.reduce((a, l) => a + hell(s0, l), 0) / hangPunkte.length;
    out.push({ s: s0, fahrbahn, hang, diff: hang - fahrbahn, belag: A.netz.belag[Math.round(sm)], wo: frei.length === 2 ? 'beide Seiten' : frei.length ? (frei[0] < 0 ? 'links' : 'rechts') : 'zwischen Rand und Netz' });
  }
  return out;
};
const KONTRAST_STELLEN = [[640, 'Anstieg'], [930, 'Anstieg'], [1500, 'vor Kehre 5'], [2150, 'Grat'], [2300, 'Grat'], [2780, 'vor Abfahrt-Kehre'], [3400, 'Abfahrt (Funpark-Einfahrt)']];
async function kontrastTest(buchstabe, text) {
  titel(`(${buchstabe}) Kontrast Fahrbahn gegen Hang ${text}: mindestens 40 Helligkeitsstufen (320x180, 7 Stellen aus M11b)`);
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet&aufloesung=320x180', { uhr: true });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; });
  const r = await s.page.evaluate(KONTRAST, { stellen: KONTRAST_STELLEN.map((x) => x[0]) });
  await s.schliessen();
  r.forEach((x, i) => melde(Math.abs(x.diff) >= 40, `${x.s} m ${KONTRAST_STELLEN[i][1]} (${x.belag}): Fahrbahn ${x.fahrbahn.toFixed(0)}, Hang ${x.hang.toFixed(0)} (${x.wo}), Unterschied ${x.diff.toFixed(0)}`));
}
// Testfahrer Skigebiet (alle Autos, mittel/flott/digital): Zeiten gestaffelt, im Ziel, kein Stillstand/Klemmen
async function skiTestfahrer(buchstabe, stand) {
  titel(`(${buchstabe}) Testfahrer Skigebiet (mittel, flott, digital; strecke-abfahren): alle im Ziel, kein Klemmen, gestaffelt`);
  const d = await skiLaeufe(stand);
  const tab = ['| Auto | ' + STILE_S.join(' | ') + ' | Aufpralle / Strafen (m · f · d) | Stillstand |', '|---|---|---|---|---|---|'];
  let alleIm = true; const stand2 = [];
  AUTOS.forEach((id, k) => {
    const z = (st) => d[k].stile.find((x) => x.stil === st);
    for (const st of STILE_S) if (z(st).zeit == null) alleIm = false;
    const f = path.join(LOG, `fahrt-${stand}-skigebiet-${id}-${STILE_S.join('').slice(0, 24)}.txt`);
    const sl = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter((x) => /Stillstand über 1 s: (?!keiner)/.test(x)).map((x) => x.trim().slice(0, 60)) : [];
    for (const x of sl) stand2.push(`${id}: ${x}`);
    tab.push(`| ${id} | ${STILE_S.map((st) => fmtZ(z(st).zeit)).join(' | ')} | ${STILE_S.map((st) => `${z(st).aufpralle}/${(z(st).motorStrafen || []).length}`).join(' · ')} | ${sl.length ? sl.join('; ') : '–'} |`);
  });
  fs.writeFileSync(path.join(LOG, `testfahrer-skigebiet-${buchstabe}.md`), tab.join('\n') + '\n');
  for (const z of tab) info(z);
  melde(alleIm && stand2.length === 0, `alle ${AUTOS.length * 3} Läufe im Ziel, kein Stillstand über 1 s${stand2.length ? ` – ${stand2.join('; ')}` : ''}`);
  for (const st of STILE_S) {
    const t = Object.fromEntries(AUTOS.map((id, k) => [id, d[k].stile.find((x) => x.stil === st).zeit ?? 9999]));
    const best = Math.min(...Object.values(t)), schlecht = Math.max(...Object.values(t));
    const allradVorn = Math.max(...ALLRAD.map((id) => t[id])) < Math.min(...HINTERRAD.map((id) => t[id]));
    const reihe = !t.escorta || !t.l073 || t.escorta <= t.l073;
    melde(allradVorn && reihe && schlecht <= best * 1.3, `${st}: Allrad ${ALLRAD.map((id) => fmtZ(t[id])).join(' / ')}, Escorta ${fmtZ(t.escorta)}, Lanza 073 ${fmtZ(t.l073)}; langsamster +${((schlecht / best - 1) * 100).toFixed(1)} % zum Besten`);
  }
  return d;
}
// Anfahren aus dem Stand bis kmh (Vollgas geradeaus) bei s0
const ANFAHREN = ([s0, kmh]) => {
  const A = window.__alpineRally, P = A.physik; A.anhalten = true;
  A.setzeAuf(s0); P.vx = 0; P.vz = 0;
  const steig = A.strecke.punktBei(s0 + 15).h - A.strecke.punktBei(s0 - 15).h;
  let t = 0; for (; t < 25 && P.tempo * 3.6 < kmh; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false }, true);
  return { t, steigung: steig / 30, untergrund: A.untergrund };
};
const HANG_S = 415; // steilste Stelle (22.5 %, Schnee), wie M11b
async function anfahren(stellen) {
  const z = {};
  for (const id of AUTOS) {
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet', { auto: id });
    z[id] = {}; for (const [name, s0, kmh] of stellen) z[id][name] = await s.page.evaluate(ANFAHREN, [s0, kmh]);
    await s.schliessen();
  }
  return z;
}

// ===================================================================== Teil A: breite Piste
if (teil('a')) {
  titel('(a) Pistenbreite im Zielbereich: Anstieg/Grat 9–10 m, Abfahrt 10–12 m, Dorf ca. 10 m (gemessen), Alpen 7 m zum Vergleich');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet');
  const r = await s.page.evaluate(() => { const N = window.__alpineRally.netz; return [150, 400, 556, 700, 1290, 1800, 2020, 2200, 2400, 2600, 2820, 3000, 3600, 4000, 4250].map((m) => [m, 2 * N.halbBei(m)]); });
  await s.schliessen();
  const b = Object.fromEntries(r);
  info(r.map(([m, x]) => `${m} m: ${x.toFixed(2)} m`).join(', '));
  melde([400, 556, 700, 1290, 1800, 2020, 2200, 2400].every((m) => b[m] >= 9 && b[m] <= 10), `Anstieg, Kehren, Bergstation, Grat: ${[400, 556, 1290, 2200].map((m) => b[m].toFixed(1)).join(' / ')} m (Ziel 9–10)`);
  melde([2600, 2820, 3000, 3600, 4000].every((m) => b[m] >= 10 && b[m] <= 12), `Abfahrt, Kehren der Abfahrt, Funpark: ${[2600, 2820, 3600].map((m) => b[m].toFixed(1)).join(' / ')} m (Ziel 10–12)`);
  melde(b[150] >= 9.9, `Dorfstrasse ${b[150].toFixed(1)} m (Start- und Zielbereich bleiben 7 m: Bogen, Band und Stroh stehen dort fest; Zielarena ${b[4250].toFixed(1)} m)`);
  info('Alpen-Strasse: 7.0 m (Asphalt), Schotter-Nebenwege 6.2 m; 0.11b Skigebiet: 4.9 m (Anstieg/Grat), 6.2 m (Abfahrt)');
}
if (teil('b')) {
  titel('(b) Kehren mit der breiten Piste: Verlauf unverändert (Stützpunkte gleich wie 0.11b), Kehrenwinkel ≥ 128°');
  const neu = fs.readFileSync(G_DATEI, 'utf8'), alt = ALT ? fs.readFileSync(path.join(ALT, 'strecken', 'skigebiet.js'), 'utf8') : null;
  const pkt = (q) => q.slice(q.indexOf('// <punkte>'), q.indexOf('// </punkte>'));
  if (alt) melde(pkt(neu) === pkt(alt), `Stützpunkte ${pkt(neu) === pkt(alt) ? 'gleich wie 0.11b (keine Änderung am Verlauf nötig)' : 'GEÄNDERT'}`);
  const { ENTWURF } = await import('./skigebiet-entwurf.mjs');
  const kehren = ENTWURF.filter((x) => x.kurve && Math.abs(x.kurve) >= 120).map((x) => Math.abs(x.kurve));
  melde(kehren.length === 8 && kehren.every((w) => w >= 128), `${kehren.length} Kehren (6 hoch, 2 runter), Winkel ${kehren.join(' / ')}° (≥ 128°)`);
  const L = /laenge: ([\d.]+)/.exec(neu);
  melde(Math.abs(+L[1] - 4329) <= 4329 * 0.05, `Länge ${(+L[1]).toFixed(1)} m (4329 ±5 %), revision ${/revision: (\d+)/.exec(neu)[1]}`);
}
if (teil('c')) { titel('(c) Hang-Prüfung (tools/hang-pruefen.mjs --pruefen, mit Tiefschnee): 0 Fehler'); hangTest(); }
if (teil('d')) {
  titel('(d) Kein Exploit mit der breiten Piste: Netz/Tiefschnee in keiner Kehre > 0.1 s schneller als die beste Fahrt auf der Strasse (alle 5 Autos); Abkürzungen 0');
  await kurvenTest('neuA2', -0.1, 'Rand-Kontakt mehr als 0.1 s schneller');
  abkuerzungTest();
}
if (teil('e')) await kontrastTest('e', '(breite Piste, heller Rand)');
if (teil('f')) {
  await skiTestfahrer('f', 'neuA');
  const z = await anfahren([['hang', HANG_S, 40]]);
  const allrad = Math.max(...ALLRAD.map((id) => z[id].hang.t)), hinten = Math.min(...HINTERRAD.map((id) => z[id].hang.t));
  melde(allrad < hinten && hinten >= allrad * 1.15, `Anfahren am steilsten Hang (${HANG_S} m, ${(z[AUTOS[0]].hang.steigung * 100).toFixed(1)} %, 0–40 km/h): ${AUTOS.map((id) => `${id} ${z[id].hang.t.toFixed(2)} s`).join(', ')} – Allrad klar vorn`);
}
if (teil('g')) await unveraendert('g', { bilder: true });

// ===================================================================== Zusammenfassung
console.log('\n| Test | Ergebnis |\n|---|---|');
for (const e of ergebnisse) console.log(`| ${e.titel.slice(0, 120)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);
