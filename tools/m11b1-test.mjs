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
  await skiTestfahrer('f', `neu${arg('--stand') || 'A'}`); // (--stand B, C, …: frische Läufe nach jedem Teil)
  const z = await anfahren([['hang', HANG_S, 40]]);
  const allrad = Math.max(...ALLRAD.map((id) => z[id].hang.t)), hinten = Math.min(...HINTERRAD.map((id) => z[id].hang.t));
  melde(allrad < hinten && hinten >= allrad * 1.15, `Anfahren am steilsten Hang (${HANG_S} m, ${(z[AUTOS[0]].hang.steigung * 100).toFixed(1)} %, 0–40 km/h): ${AUTOS.map((id) => `${id} ${z[id].hang.t.toFixed(2)} s`).join(', ')} – Allrad klar vorn`);
}
if (teil('g')) await unveraendert('g', { bilder: true });

// ===================================================================== Teil B: Grip Piste und Tiefschnee
const FAHRER_CODE = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
async function mitFahrer(s) { await s.page.evaluate((code) => { window.__alpineRally.anhalten = true; window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }, FAHRER_CODE); }
// Herauskommen: Auto steht still 5 m neben der Piste (Fahrbahnkante + 5 m, Tiefschnee), Blick in Fahrtrichtung. Der
// Testfahrer (Stil mittel/flott) fährt eine Linie schräg zurück zur Strassenmitte (25 m), vorwärts, ohne Rückwärts-Trick.
// Gemessen: Zeit bis das Auto wieder auf der Piste ist (Mitte innerhalb der Fahrbahn)
const HERAUS = async ({ stellen, stile }) => {
  const f = await import(window.__fahrerUrl);
  const A = window.__alpineRally, S = A.strecke, q = {}, out = [];
  A.anhalten = true;
  for (const [s0, sd] of stellen) for (const stil of stile) {
    const hb = A.netz.halbBei(s0), lat0 = sd * (hb + 5), xs = [], zs = [];
    for (let i = 0; i <= 70; i++) {
      const p = S.punktBei(s0 + i), t = Math.min(1, i / 25), l = lat0 * (1 - t * t * (3 - 2 * t));
      xs.push(p.x - p.tz * l); zs.push(p.z + p.tx * l);
    }
    const pf = f.bauePfad(A, xs, zs, f.PROFILE[stil]); pf.vZiel[0] = 0;
    let tPiste = null, t = 0, art0 = null, rueck = false; const schritt = A.physikSchritt;
    A.physikSchritt = (dt, e, nf) => {
      schritt(dt, e, nf); t += dt; art0 = art0 || A.untergrund;
      if (e.bremse > 0.05 && A.physik.vVor < 0) rueck = true;
      S.abfrage(A.physik.x, A.physik.z, q);
      if (tPiste == null && Math.abs(q.seite) <= A.netz.halbBei(q.s)) tPiste = t;
    };
    try { f.fahreStueck(A, pf, 40); } finally { A.physikSchritt = schritt; }
    out.push({ s: s0, seite: sd, stil, t: tPiste, start: art0, rueck });
  }
  return out;
};
// Aus kmh in den Tiefschnee (Auto 3 m hinter der Fahrbahnkante hineinversetzt, geradeaus), 2 s Gas los bzw. Vollgas:
// Tempo-Verlauf je 0.1 s (kein fester Deckel: das Tempo fällt stetig)
const TIEF_BREMSEN = async ({ s0, sd, kmh }) => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke; A.anhalten = true;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, out = {};
  for (const [name, gas] of [['los', 0], ['voll', 1]]) {
    A.setzeAuf(s0); const p = S.punktBei(s0), lat = sd * (A.netz.halbBei(s0) + A.CONFIG.strasse.bankett + 3);
    P.x = p.x - p.tz * lat; P.z = p.z + p.tx * lat; if (A.getriebe) A.getriebe.reset();
    P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6; P.vVor = kmh / 3.6;
    const st0 = A.wand.strafen, verlauf = []; let art = null, tief = true;
    for (let t = 0, k = 0; t < 2 - 1e-9; t += A.SCHRITT, k++) {
      A.physikSchritt(A.SCHRITT, { ...LEER, gas }, true); art = art || A.untergrund; if (A.untergrund !== 'tiefschnee') tief = false;
      if (k % Math.round(0.1 / A.SCHRITT) === Math.round(0.1 / A.SCHRITT) - 1) verlauf.push(P.tempo * 3.6);
    }
    out[name] = { v2: P.tempo * 3.6, verlust: 1 - P.tempo * 3.6 / kmh, art, tief, strafen: A.wand.strafen - st0, verlauf, motorLeuchte: A.wand.strafeRest > 0 };
  }
  return out;
};
const ROLLEN_STELLEN = [[700, 1, 'Anstieg'], [2150, -1, 'Grat'], [2900, 1, 'Abfahrt'], [3700, -1, 'Funpark']];
if (teil('h') || teil('i')) {
  const e = await (await import('./schnee-messung.mjs')).schneeMessung(WURZEL, { kreis: false, strecke: 'skigebiet', autos: AUTOS, belaege: ['schotter', 'schnee'] });
  fs.writeFileSync(path.join(LOG, 'schnee-messung.json'), JSON.stringify(e, null, 1));
  if (teil('h')) {
    titel('(h) Piste (Belag Schnee, Skigebiet) griffiger: Bremsweg 100 → 0 = 1.15–1.25 × Schotter (0.11b: 1.48–1.49)');
    const v = AUTOS.map((id) => [id, e[id].schnee.bremsweg / e[id].schotter.bremsweg]);
    melde(v.every(([, x]) => x >= 1.15 && x <= 1.25), `Bremsweg Schnee/Schotter: ${v.map(([id, x]) => `${id} ${x.toFixed(2)}`).join(', ')}`);
    const a = (await import('./schnee-messung.mjs')).schneeMessung;
    info('Alpen/Finnland haben keinen Schnee-Belag (geprüft: nur strecken/skigebiet.js nutzt belag schnee); der Grundwert in config.js bleibt (Engine-Test m11a1 (i) unverändert 1.48–1.49)');
  }
  if (teil('i')) {
    titel('(i) 0–60 km/h auf der Piste (eben) und Anfahren am 22.5-%-Hang (0–40): etwas besser, Allrad klar vor Hinterrad');
    info(`0–60 (schnee-messung, eben): ${AUTOS.map((id) => `${id} ${e[id].schnee.null60.toFixed(2)} s`).join(', ')} (0.11b: Allrad 4.2–4.4 s, Hinterrad 6.9–7.4 s)`);
    const a60 = Math.max(...ALLRAD.map((id) => e[id].schnee.null60)), h60 = Math.min(...HINTERRAD.map((id) => e[id].schnee.null60));
    melde(a60 < 4.4 && a60 * 1.15 < h60 && h60 < 7.4, `0–60 eben: langsamster Allrad ${a60.toFixed(2)} s < schnellster Hinterrad ${h60.toFixed(2)} s (+${((h60 / a60 - 1) * 100).toFixed(0)} %), beide besser als 0.11b`);
    const z = await anfahren([['hang', HANG_S, 40], ['flach', 100, 40]]);
    const allrad = Math.max(...ALLRAD.map((id) => z[id].hang.t)), hinten = Math.min(...HINTERRAD.map((id) => z[id].hang.t));
    info(`Hang ${HANG_S} m (${(z[AUTOS[0]].hang.steigung * 100).toFixed(1)} %, ${z[AUTOS[0]].hang.untergrund}): ${AUTOS.map((id) => `${id} ${z[id].hang.t.toFixed(2)} s`).join(', ')} (0.11b: Allrad 3.98–4.25, Escorta 10.08, Lanza 073 11.42)`);
    melde(allrad < hinten && hinten >= allrad * 1.15 && hinten <= 11.42, `Hang 0–40: langsamster Allrad ${allrad.toFixed(2)} s, schnellster Hinterrad ${hinten.toFixed(2)} s (+${((hinten / allrad - 1) * 100).toFixed(0)} %), Hinterrad nicht schlechter als 0.11b`);
  }
}
if (teil('j') || teil('l')) {
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet');
  const r = [];
  for (const [s0, sd, wo] of ROLLEN_STELLEN) r.push({ wo, s0, sd, x80: await s.page.evaluate(TIEF_BREMSEN, { s0, sd, kmh: 80 }), x120: await s.page.evaluate(TIEF_BREMSEN, { s0, sd, kmh: 120 }) });
  const cfg = await s.page.evaluate(() => window.__alpineRally.CONFIG.untergrund.tiefschnee);
  await s.schliessen();
  if (teil('j')) {
    titel('(j) Kein hartes Tempolimit im Tiefschnee: aus 80 und 120 km/h fällt das Tempo stetig (Widerstand wächst mit dem Tempo), kein fester Deckel');
    info(`Tiefschnee Skigebiet: ${JSON.stringify(cfg)} (0.11b: rollen 1.2, rollenTempo 0.7, kein rollenQuadrat; einen festen km/h-Deckel gab es auch dort nicht)`);
    for (const x of r) {
      // kein Deckel: (1) das Tempo fällt stetig, (2) nach 0.5 s ist die Fahrt aus 120 km/h noch mindestens 10 km/h schneller
      // als die aus 80 (ein fester Deckel setzte beide sofort auf denselben Wert), (3) kein Abfall über 15 km/h je 0.1 s (kein Ruck)
      const v = x.x120.voll.verlauf, w = x.x80.voll.verlauf, stetig = v.every((y, i) => i === 0 || y < v[i - 1] + 0.01);
      const sprung = Math.max(...v.map((y, i) => (i ? v[i - 1] - y : 120 - y)));
      melde(stetig && x.x120.voll.tief && v[4] - w[4] >= 10 && sprung <= 15, `${x.wo} ${x.s0} m: Vollgas aus 120 km/h ${v.filter((_, i) => i % 4 === 3).map((y) => y.toFixed(0)).join(' → ')} km/h, aus 80 ${w.filter((_, i) => i % 4 === 3).map((y) => y.toFixed(0)).join(' → ')} km/h; nach 0.5 s ${v[4].toFixed(0)} gegen ${w[4].toFixed(0)} km/h, grösster Abfall je 0.1 s ${sprung.toFixed(1)} km/h`);
    }
  }
  if (teil('l')) {
    titel('(l) Tempoverlust: aus 80 km/h in 2 s mindestens ca. 40 % (Gas los und Vollgas), ohne Wand-Strafe und ohne MOTOR-Leuchte');
    for (const x of r) melde(x.x80.los.verlust >= 0.4 && x.x80.voll.verlust >= 0.4 && !x.x80.los.strafen && !x.x80.voll.strafen && !x.x80.voll.motorLeuchte && x.x80.los.art === 'tiefschnee',
      `${x.wo} ${x.s0} m: Gas los −${(x.x80.los.verlust * 100).toFixed(0)} %, Vollgas −${(x.x80.voll.verlust * 100).toFixed(0)} % (${x.x80.voll.v2.toFixed(0)} km/h), Strafen ${x.x80.los.strafen + x.x80.voll.strafen}`);
  }
}
if (teil('k')) {
  titel('(k) Herauskommen: Stillstand 5 m neben der Piste, alle 5 Autos (Testfahrer mittel und flott), in höchstens ca. 4 s zurück auf der Piste, ohne Rückwärts');
  const stellen = [[700, -1], [1200, -1], [1400, 1], [2150, 1], [2150, -1], [2900, 1], [3300, -1], [3600, 1]]; // (Seiten ohne Fangnetz: hinter dem Netz kommt man nicht vorwärts zurück)
  const tab = [];
  let alle = true, max = 0, maxWo = '';
  for (const id of AUTOS) {
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet', { auto: id });
    await mitFahrer(s);
    const r = await s.page.evaluate(HERAUS, { stellen, stile: ['mittel', 'flott'] });
    await s.schliessen();
    for (const x of r) { if (x.t == null || x.t > 4.05 || x.rueck || x.start !== 'tiefschnee') alle = false; if ((x.t ?? 99) > max) { max = x.t ?? 99; maxWo = `${id} ${x.s} m ${x.seite < 0 ? 'links' : 'rechts'} ${x.stil}`; } }
    tab.push(`${id}: ${r.map((x) => `${x.s}${x.seite < 0 ? 'L' : 'R'}/${x.stil[0]} ${x.t == null ? '–' : x.t.toFixed(1)}`).join(' ')}`);
  }
  for (const z of tab) info(z);
  melde(alle, `alle ${AUTOS.length * stellen.length * 2} Fahrten zurück auf der Piste, langsamste ${max.toFixed(2)} s (${maxWo}), kein Rückwärts`);
}
if (teil('m')) {
  titel('(m) Kein Exploit: Tiefschnee-Linie in jeder Kehre mindestens 0.3 s langsamer als die beste Fahrt auf der Strasse, Netz nie schneller; Abkürzungen 0');
  await kurvenTest('neuB', 0.3, 'Tiefschnee/Netz weniger als 0.3 s langsamer');
  abkuerzungTest();
}
if (teil('n')) await unveraendert('n', { bilder: true });

// ===================================================================== Teil C: Kamera folgt dem Gefälle
// Sicht: Bild rendern, Punkte der Strassenmitte alle 2.5 m von 0 bis 150 m voraus prüfen: im Bild und nicht verdeckt
// (Strahl von der Kamera trifft nichts, was mehr als 1 m davor liegt: Auto, Gelände, Netze). Ergebnis in Metern.
const SICHT = async ({ stellen, staerke }) => {
  const A = window.__alpineRally, S = A.strecke, T = A.THREE, out = [];
  const G = A.CONFIG.kamera.gefaelle, alt = G.staerke; G.staerke = staerke;
  const ray = new T.Raycaster(); ray.camera = A.kamera;
  const ziele = []; A.szene.traverse((o) => { if ((o.isMesh || o.isInstancedMesh) && o.visible !== false && !(o.material && o.material.transparent && o.material.opacity < 0.5)) ziele.push(o); });
  for (const s0 of stellen) {
    A.setzeAuf(s0); A.kameraSofort(); window.__bild(2, 1000 / 60);
    A.kamera.updateMatrixWorld(); const kp = A.kamera.position.clone();
    const autoY = A.autoModell.objekt.position.y;
    let sicht = 0, weitest = 0;
    for (let d = 2.5; d <= 150; d += 2.5) {
      const p = S.punktBei(s0 + d), P = new T.Vector3(p.x, p.h + 0.3, p.z), v = P.clone().project(A.kamera);
      if (Math.abs(v.x) > 1 || Math.abs(v.y) > 1 || v.z > 1) continue;
      const dir = P.clone().sub(kp), L = dir.length(); ray.set(kp, dir.normalize()); ray.far = L - 1;
      const hit = ray.intersectObjects(ziele, false).find((h) => !(h.object.isSprite));
      if (!hit) { sicht += 2.5; weitest = d; }
    }
    // Auto im Bild und frei sichtbar (Dachmitte: Strahl trifft vorher nichts ausser dem Auto selbst)
    const ap = A.autoModell.objekt.position, dach = new T.Vector3(ap.x, ap.y + 1.1, ap.z), va = dach.clone().project(A.kamera);
    const dA = dach.clone().sub(kp), LA = dA.length(); ray.set(kp, dA.normalize()); ray.far = LA - 0.3;
    let istAuto = (o) => { for (let q = o; q; q = q.parent) if (q === A.autoModell.objekt) return true; return false; };
    const vor = ray.intersectObjects(ziele, false).filter((h) => !h.object.isSprite && !istAuto(h.object));
    out.push({ s: s0, hoehe: kp.y - autoY, f: A.kameraGefaelle.f, sicht, weitest, autoImBild: Math.abs(va.x) < 0.9 && Math.abs(va.y) < 0.9, autoFrei: vor.length === 0, autoY: va.y });
  }
  G.staerke = alt;
  return out;
};
const STEIL = [2540, 2950, 3250]; // steilste Gefälle (−22…−23 %; 2540 m: 100 m vor der Schneekuppe, dahinter verdeckt die Kuppe)
if (teil('o')) {
  titel('(o) Kamera bergab: im steilsten Gefälle deutlich höher, sichtbare Strecke voraus ≥ ca. 60 m (vorher/nachher, 320x180)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet&aufloesung=320x180', { uhr: true });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; });
  const vor = await s.page.evaluate(SICHT, { stellen: STEIL, staerke: 0 }), nach = await s.page.evaluate(SICHT, { stellen: STEIL, staerke: 1 });
  await s.schliessen();
  fs.writeFileSync(path.join(LOG, 'kamera-sicht.json'), JSON.stringify({ vor, nach }, null, 1));
  melde(nach.every((x) => x.autoImBild && x.autoFrei), `Auto immer im Bild und frei sichtbar (nicht von Netz/Mast verdeckt): ${nach.map((x) => `${x.s} m Bildhöhe ${((x.autoY + 1) * 50).toFixed(0)} %`).join(', ')}`);
  STEIL.forEach((m, i) => melde(nach[i].hoehe >= vor[i].hoehe + 1 && nach[i].sicht >= 60, `${m} m: Kamera ${vor[i].hoehe.toFixed(2)} → ${nach[i].hoehe.toFixed(2)} m über dem Auto; Strecke sichtbar (0–150 m voraus) ${vor[i].sicht.toFixed(0)} → ${nach[i].sicht.toFixed(0)} m, weitester sichtbarer Punkt ${vor[i].weitest.toFixed(0)} → ${nach[i].weitest.toFixed(0)} m`));
}
// Kamera ohne Gefälle unverändert: Kamera-Lage gleich wie 0.11b (Zahlen) und Bild gleich wie mit kameraGefaelle 0
const KAM_LAGE = async ({ stellen, staerke }) => {
  const A = window.__alpineRally, out = [];
  if (A.CONFIG.kamera.gefaelle) A.CONFIG.kamera.gefaelle.staerke = staerke;
  for (const s0 of stellen) {
    A.setzeAuf(s0); A.kameraSofort(); window.__bild(3, 1000 / 60);
    A.kamera.updateMatrixWorld(); out.push(Array.from(A.kamera.matrixWorld.elements).map((x) => x.toFixed(9)).join(','));
  }
  return out;
};
if (teil('p')) {
  titel('(p) Ebene und bergauf: Kamera wie 0.11b (Lage Zahl für Zahl) und Bild pixelgleich zu „ohne Kamera-Gefälle“ (Skigebiet an 3 Stellen)');
  const stellen = [150, 700, 2300]; // Dorf (eben), Anstieg (bergauf), Grat (eben/wellig)
  const n = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet&aufloesung=320x180', { uhr: true });
  await n.page.evaluate(() => { window.__alpineRally.anhalten = true; window.__bild(5, 1000 / 60); });
  const lageNeu = await n.page.evaluate(KAM_LAGE, { stellen, staerke: 1 });
  const bildMit = await n.page.evaluate(BILD_SUMME, { stellen });
  await n.schliessen();
  // (zweite Seite mit derselben Bild-Uhr: Gondeln und Skifahrer stehen an derselben Stelle)
  const o = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet&aufloesung=320x180', { uhr: true });
  await o.page.evaluate(() => { window.__alpineRally.anhalten = true; window.__bild(5, 1000 / 60); });
  await o.page.evaluate(KAM_LAGE, { stellen, staerke: 0 });
  const bildOhne = await o.page.evaluate(BILD_SUMME, { stellen });
  await o.schliessen();
  if (ALT) {
    const a = await oeffne(ALT, '?menue=aus&ton=aus&strecke=skigebiet&aufloesung=320x180', { uhr: true });
    await a.page.evaluate(() => { window.__alpineRally.anhalten = true; window.__bild(5, 1000 / 60); });
    const lageAlt = await a.page.evaluate(KAM_LAGE, { stellen, staerke: 0 });
    await a.schliessen();
    melde(lageNeu.every((x, i) => x === lageAlt[i]), `Kamera-Lage an ${stellen.join(' / ')} m ${lageNeu.map((x, i) => (x === lageAlt[i] ? 'gleich' : 'ANDERS')).join(' / ')} wie 0.11b`);
  }
  melde(bildMit.every((x, i) => x === bildOhne[i]), `Bild mit/ohne Kamera-Gefälle an ${stellen.join(' / ')} m: ${bildMit.map((x, i) => (x === bildOhne[i] ? 'pixelgleich' : 'ANDERS')).join(' / ')}`);
}
// Ruckeln: Testfahrer (mittel, 60 Bilder/s) fährt Grat → Abfahrt → Funpark; Kamera wird jedes Bild nachgeführt
const RUCKELN = async ({ von, bis }) => {
  const f = await import(window.__fahrerUrl);
  const A = window.__alpineRally, K = A.kameraGefaelle, G = A.CONFIG.kamera.gefaelle; A.anhalten = true;
  A.setzeAuf(von); A.kameraSofort(); A.rennen.zustand = 'laeuft';
  let n = 0, fAlt = K.f, yAlt = null, maxDF = 0, maxDY = 0, maxF = 0, maxFbei = 0, dyBei = 0, tUeber = 0;
  const proBild = Math.round((1 / 60) / A.SCHRITT);
  f.fahreBis(A, 'mittel', { bisS: bis, proSchritt: () => {
    if (++n % proBild) return;
    A.autoZeichnen(1 / 60, 0); A.kameraFuehren(1 / 60); // (wie im Spiel je Bild: erst das Auto, dann die Kamera)
    const off = A.kamera.position.y - A.autoModell.objekt.position.y;
    const df = Math.abs(K.f - fAlt) * G.hoehe; fAlt = K.f;
    if (df > maxDF) maxDF = df;
    if (yAlt != null && Math.abs(off - yAlt) > maxDY) { maxDY = Math.abs(off - yAlt); dyBei = A.rennen.letztesS; }
    yAlt = off; if (K.f > maxF) { maxF = K.f; maxFbei = A.rennen.letztesS; }
    A.kamera.updateMatrixWorld(); const va = A.autoModell.objekt.position.clone().project(A.kamera); if (Math.abs(va.x) > 0.95 || Math.abs(va.y) > 0.95) tUeber++;
  } });
  return { maxDF, maxDY, dyBei, maxF, maxFbei, bilder: Math.floor(n / proBild), ausserhalb: tUeber };
};
if (teil('q')) {
  titel('(q) Kein Ruckeln: Kamerahöhe aus dem Gefälle ändert sich je Bild (60/s) um höchstens 2 cm (Testfahrer Grat → Ziel)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet', { auto: 'rt4' });
  await mitFahrer(s);
  const r = await s.page.evaluate(RUCKELN, { von: 2300, bis: 4100 });
  await s.schliessen();
  melde(r.maxDF <= 0.02 && r.ausserhalb === 0, `${r.bilder} Bilder (Auto ${r.ausserhalb ? `${r.ausserhalb}-mal ausserhalb` : 'immer'} im Bild): grösster Sprung der Gefälle-Höhe je Bild ${(r.maxDF * 100).toFixed(2)} cm (Grenze 2 cm); grösste Wirkung ${(r.maxF * 8).toFixed(2)} m höher bei ${r.maxFbei.toFixed(0)} m; Kamera gegen Auto gesamt höchstens ${(r.maxDY * 100).toFixed(1)} cm je Bild (bei ${r.dyBei.toFixed(0)} m, mit Federung/Sprüngen)`);
}
if (teil('r')) await unveraendert('r', { bilder: true, stile: ['mittel'] });

// ===================================================================== Teil D: Kicker sichtbar machen
// Sichtbarkeit: Auto (Kamera) steht dist Meter vor der Kicker-Kante; Bild mit und ohne Kicker-Deko (320x180). Pixel, die
// sich um mindestens 20 Helligkeitsstufen ändern = Kicker-Deko. Ergebnis: Höhe (Bildzeilen) und mittlerer Kontrast.
const KICKER_SICHT = async ({ kante, dist, meshes }) => {
  const A = window.__alpineRally, D = A.skigebietDeko, M = meshes === 'alle' ? D.meshes : [D.kickerMesh].filter(Boolean);
  A.setzeAuf(kante - dist); A.kameraSofort(); window.__bild(2, 1000 / 60);
  const c = document.getElementById('spiel'), g = c.getContext('webgl2') || c.getContext('webgl');
  const w = g.drawingBufferWidth, h = g.drawingBufferHeight;
  const lies = () => { const px = new Uint8Array(w * h * 4); A.renderer.render(A.szene, A.kamera); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px); const l = new Float32Array(w * h); for (let i = 0; i < w * h; i++) l[i] = 0.299 * px[4 * i] + 0.587 * px[4 * i + 1] + 0.114 * px[4 * i + 2]; return l; };
  const mit = lies(); for (const m of M) m.visible = false; const ohne = lies(); for (const m of M) m.visible = true;
  let y0 = h, y1 = -1, x0 = w, x1 = -1, n = 0, sum = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.abs(mit[y * w + x] - ohne[y * w + x]); if (d >= 20) { n++; sum += d; y0 = Math.min(y0, y); y1 = Math.max(y1, y); x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }
  return { pixel: n, hoehe: n ? y1 - y0 + 1 : 0, breite: n ? x1 - x0 + 1 : 0, kontrast: n ? sum / n : 0 };
};
if (teil('s')) {
  titel('(s) Kicker in den Daten und gezeichnet (Sprungzonen KICKER, Funpark-Optik, Kicker-Mesh mit Wänden, Tor, Zaun)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet');
  const r = await s.page.evaluate(() => { const A = window.__alpineRally, D = A.skigebietDeko; return { zonen: A.strecke.sprungZonen.map((z) => [z.name, z.kante, z.landeVon, z.landeBis]), kicker: D.kicker.map((k) => k.kante), mesh: !!D.kickerMesh, dreiecke: D.kickerMesh ? D.kickerMesh.geometry.index.count / 3 : 0, meshes: D.meshes.length }; });
  await s.schliessen();
  const k = r.zonen.filter((z) => z[0] === 'KICKER');
  melde(k.length === 3 && r.kicker.length === 3, `Sprungzonen: ${r.zonen.map((z) => `${z[0]} ${z[1]} m`).join(', ')}; Funpark-Kanten ${r.kicker.join(' / ')} m`);
  melde(r.mesh && r.dreiecke > 100, `Kicker-Mesh gezeichnet: ${r.dreiecke} Dreiecke (Wände, Schattenband, Tor, Zaun, Fahnen), ${r.meshes} Zeichenaufrufe Skigebiet-Deko`);
  info('Befund 0.11b: Kicker waren gebaut (Sprungzonen + farbiger Streifen + 2 Fahnen), aber die Rampe ist nur ein Knick im −15-%-Hang (−15 % → −9 %): von weitem nicht als Schanze zu sehen');
}
if (teil('t')) {
  titel('(t) Kicker aus 100 und 150 m sichtbar: mindestens ca. 8 Pixel hoch und ≥ 40 Helligkeitsstufen Kontrast bei 100 m (320x180), vorher/nachher');
  const z = [];
  for (const [w, wurzel] of [['nachher', WURZEL], ['vorher (0.11b)', ALT]]) {
    if (!wurzel) continue;
    const s = await oeffne(wurzel, '?menue=aus&ton=aus&strecke=skigebiet&aufloesung=320x180', { uhr: true });
    await s.page.evaluate(() => { window.__alpineRally.anhalten = true; window.__bild(5, 1000 / 60); });
    for (const [kante, dist] of [[3560, 100], [3560, 120], [3560, 150]]) z.push({ w, kante, dist, ...(await s.page.evaluate(KICKER_SICHT, { kante, dist, meshes: w === 'nachher' ? 'kicker' : 'alle' })) });
    await s.schliessen();
  }
  for (const x of z) info(`${x.w}: Kicker ${x.kante} m aus ${x.dist} m: ${x.hoehe} Pixel hoch, ${x.breite} breit, ${x.pixel} Pixel, Kontrast ${x.kontrast.toFixed(0)}`);
  const n100 = z.filter((x) => x.w === 'nachher' && x.dist === 100), n150 = z.find((x) => x.w === 'nachher' && x.dist === 150);
  melde(n100.every((x) => x.hoehe >= 8 && x.kontrast >= 40), `100 m: ${n100.map((x) => `${x.hoehe} px / Kontrast ${x.kontrast.toFixed(0)}`).join(', ')} (Ziel ≥ 8 px, ≥ 40)`);
  melde(n150.hoehe >= 5, `150 m: ${n150.hoehe} px hoch, Kontrast ${n150.kontrast.toFixed(0)} (noch erkennbar)`);
}
if (teil('u')) {
  titel('(u) Sprünge wie bisher mit der breiten Piste: Weiten bei 100 km/h (Kuppe 15–25 m, Kicker 10–20 m), Landungen, Zeitgewinn ≤ 0.2 s');
  for (const id of AUTOS) {
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet', { auto: id });
    const r = await s.page.evaluate(WEITEN, [100]);
    await s.schliessen();
    const z = Object.entries(r.out).map(([name, l]) => ({ name, ...l[0] }));
    const ok = z.every((x) => x.ab && x.belag === 'schnee' && (x.name === 'KICKER' ? x.weite >= 10 && x.weite <= 20 : x.weite >= 15 && x.weite <= 25));
    melde(ok, `${id}: ${z.map((x) => `${x.name} ${x.ab ? `${x.weite.toFixed(1)} m (${x.belag}, Verlust ${(x.verlust * 100).toFixed(0)} %)` : 'rollt'}`).join(', ')}`);
  }
  info('(WEITEN misst je Name einmal: die drei Kicker sind gleich gebaut, gemessen wird der letzte Eintrag je Name)');

  {
  const d = await parallel(AUTOS.map((id) => () => testfahrerLauf(G_DATEI, id, WURZEL, 'neuD1', STILE)), 3);
  const schlecht = [], wandStrafen = []; let n = 0, weit = 0;
  AUTOS.forEach((id, k) => {
    for (const st of d[k].stile) {
      for (const j of st.spruenge || []) { n++; weit = Math.max(weit, j.weite); if (Math.abs(j.seite || 0) > 4.5 || j.ausserhalb) schlecht.push(`${id}/${st.stil} ${j.weite.toFixed(0)} m seitlich ${(j.seite || 0).toFixed(1)}`); }
      if (st.zeit == null) schlecht.push(`${id}/${st.stil} nicht im Ziel`);
      // (der Stil „wand“ fährt absichtlich an Netze und Zäune – seine Strafen sind kein Landungsfehler, nur gemeldet)
      if ((st.motorStrafen || []).length) (st.stil === 'wand' ? wandStrafen : schlecht).push(`${id}/${st.stil} ${(st.motorStrafen || []).length} Strafen`);
    }
  });
  melde(schlecht.length === 0, `${n} Sprünge in ${AUTOS.length * STILE.length} Läufen, weitester ${weit.toFixed(1)} m${schlecht.length ? ` – ${schlecht.join('; ')}` : ''}`);
  if (wandStrafen.length) info(`Stil „wand“ (fährt absichtlich an die Netze): ${wandStrafen.join('; ')}`);
  }
  {
  const ohne = ohneSpruenge();
  const kanten = [...fs.readFileSync(G_DATEI, 'utf8').matchAll(/, kante: (\d{3,}),/g)].map((m) => +m[1]);
  const zt = (z, k) => z[Math.round((k + 150) / 10)] - z[Math.round((k - 100) / 10)];
  const tab = ['| Auto | ' + kanten.map((k) => `${k} m: mit / ohne / Unterschied`).join(' | ') + ' | Flugweiten |', '|---|' + kanten.map(() => '---|').join('') + '---|'];
  const gewinn = [];
  const l = await parallel(AUTOS.flatMap((id) => [() => testfahrerLauf(G_DATEI, id, WURZEL, 'neuD1', STILE), () => testfahrerLauf(ohne, id, WURZEL, 'ohne', ['mittel'])]), 4);
  AUTOS.forEach((id, k) => {
    const m = l[2 * k].stile.find((x) => x.stil === 'mittel'), o = l[2 * k + 1].stile[0];
    const z = kanten.map((kk) => [zt(m.zeitBei, kk), zt(o.zeitBei, kk)]);
    z.forEach(([a, b], j) => { if (a - b < -0.2) gewinn.push(`${id} ${kanten[j]} m ${(a - b).toFixed(2)} s`); });
    tab.push(`| ${id} | ${z.map(([a, b]) => `${a.toFixed(2)} / ${b.toFixed(2)} / ${a - b >= 0 ? '+' : ''}${(a - b).toFixed(2)} s`).join(' | ')} | ${(m.spruenge || []).map((x) => `${x.weite.toFixed(0)} m`).join(' / ')} |`);
  });
  fs.writeFileSync(path.join(LOG, 'zeit-je-sprung.md'), tab.join('\n') + '\n');
  for (const z of tab) info(z);
  melde(gewinn.length === 0, `kein Sprung bringt mehr als 0.2 s${gewinn.length ? ` – ${gewinn.join('; ')}` : ''}`);
  }
}
function ohneSpruenge() {
  const t2 = fs.readFileSync(G_DATEI, 'utf8');
  let n = 0;
  const neu = t2.replace(/\{ s: (\d+), name: '([^']+)', von:[^\n]*\n\s*form: \{[^}]*\} \}/g, (_, a, b) => { n++; return `{ s: ${a}, name: '${b}' }`; });
  if (n !== 4) throw new Error(`ohneSpruenge: ${n} statt 4 Sprungzonen ersetzt`);
  const datei = path.join(LOG, 'skigebiet-ohne-spruenge.js');
  fs.writeFileSync(datei, neu);
  return datei;
}

if (teil('v')) {
  titel('(v) Sprung-Statistik fürs Skigebiet zählt die Kicker: Anzahl und weitester Sprung im Zielbildschirm, Rekord unter „skigebiet“');
  const s = await oeffne(WURZEL, '?ton=aus&menue=aus&strecke=skigebiet', { speicher: {} });
  const code = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const r = await s.page.evaluate(async (code) => {
    const f = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
    const A = window.__alpineRally; A.neustart();
    let n = 0; while (A.ablauf.zustand === 'countdown' && n++ < 3000) A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false });
    const z = f.fahreEtappe(A, 'mittel');
    await new Promise((ok) => { let k = 0; const g = () => (++k > 10 ? ok() : requestAnimationFrame(g)); requestAnimationFrame(g); });
    return { ziel: z.ziel, erg: A.lauf.ergebnis && A.lauf.ergebnis.spruenge, speicher: localStorage.getItem('alpineRally.sprungRekorde') };
  }, code);
  await s.schliessen();
  const rek = r.speicher ? JSON.parse(r.speicher).skigebiet : null;
  melde(r.ziel && r.erg && r.erg.anzahl >= 3 && r.erg.weitester > 10, `Lauf im Ziel: ${r.erg && r.erg.anzahl} Sprünge gezählt, weitester ${r.erg && r.erg.weitester.toFixed(1)} m`);
  melde(!!rek && Math.abs(rek.weite - Math.round(r.erg.weitester * 10) / 10) < 1e-9, `Rekord gespeichert unter „skigebiet“: ${rek && rek.weite} m (${rek && rek.auto})`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
}
if (teil('w')) await unveraendert('w', { bilder: true, stile: ['mittel', 'wand'] });

// ===================================================================== Zusammenfassung
console.log('\n| Test | Ergebnis |\n|---|---|');
for (const e of ergebnisse) console.log(`| ${e.titel.slice(0, 120)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);
