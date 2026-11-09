// Meilenstein 11b prüfen:  node tools/m11b-test.mjs --alt <ordner 0.11a.1> [--nur a,b,...] [--lang]
// (0.11a.1: git worktree add <ordner> 471d726). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein
// Gamepad, Ton nur gemessen (nicht gehört). Vorlage: tools/m11a1-test.mjs.
//   Teil A – Gletscher raus, Skigebiet rein: (a) Gletscher weg, (b) Skigebiet wählbar/startet, (c) alte Tests entschieden,
//       (d) Alpen/Finnland bit-gleich
//   Teil B – Höhenprofil, Physik, Verlauf: (e) Länge/Steigung/Höhe gegen Alpen, (f) Testfahrer, (g) Staffelung,
//       (h) Anfahren am Hang Allrad/Hinterrad, (i) Hang-Prüfung, (j) Alpen/Finnland bit-gleich
//   Teil C – Ränder, Stationen: (k) Netz/Tiefschnee, (l) Kurven-Vergleich/Abkürzungen, (m) Kontrast, (n) Stationen,
//       (o) Pistenkreuzungen, (p) Alpen/Finnland bit-gleich
//   Teil D – Sprünge: (q) Weiten, (r) Landungen, (s) Zeit je Sprung, (t) Sprung-Statistik, (u) Alpen/Finnland bit-gleich
//   (zz) nur mit --lang: frühere Tests (einmal)
// Umgebungsvariablen: M11B_AUTOS=rt4,l073 (weniger Autos), M11B_NEU=1 (Testfahrer-Läufe neu statt aus /tmp/m11b).

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
const LOG = '/tmp/m11b';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M11B_AUTOS ? process.env.M11B_AUTOS.split(',') : ['rt4', 'delto', 'imprexa', 'escorta', 'l073'];
const ALLRAD = ['rt4', 'delto', 'imprexa'].filter((a) => AUTOS.includes(a)), HINTERRAD = ['escorta', 'l073'].filter((a) => AUTOS.includes(a));
const G_DATEI = path.join(WURZEL, 'strecken', 'skigebiet.js');
if (!ALT) info('Vergleiche Alpen/Finnland nur mit --alt <ordner 0.11a.1> (git worktree add <ordner> 471d726)');

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
  if (fs.existsSync(datei) && !(stand === 'neu' && process.env.M11B_NEU)) return Promise.resolve(JSON.parse(fs.readFileSync(datei, 'utf8')));
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
  if (!ALT) { melde(false, 'nur mit --alt <ordner 0.11a.1>'); return; }
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

// ===================================================================== Teil A
if (teil('a')) {
  titel('(a) Gletscher überall weg: kein Eintrag im Register, keine Datei, nichts im Menü (nur Kommentare und die Lackierung „GLETSCHER“)');
  const reg = fs.readFileSync(path.join(WURZEL, 'js/strecken.js'), 'utf8');
  melde(!/gletscher/i.test(reg.replace(/\/\/.*$/gm, '')) && /id: 'skigebiet'/.test(reg), 'js/strecken.js: kein Gletscher, Skigebiet eingetragen');
  melde(!fs.existsSync(path.join(WURZEL, 'strecken/gletscher.js')) && fs.existsSync(G_DATEI), 'strecken/gletscher.js gelöscht (Git-Verlauf reicht), strecken/skigebiet.js da');
  // Code-Zeilen (ohne Kommentare) in js/ und index.html, die „gletscher“ nennen: erlaubt nur die Auto-Lackierung
  const treffer = [];
  for (const f of ['index.html', ...fs.readdirSync(path.join(WURZEL, 'js')).map((x) => `js/${x}`)]) {
    fs.readFileSync(path.join(WURZEL, f), 'utf8').split('\n').forEach((z, i) => {
      const code = z.replace(/\/\/.*$/, '');
      if (/gletscher/i.test(code)) treffer.push(`${f}:${i + 1}`);
    });
  }
  const lack = treffer.filter((x) => /^js\/(autos|texte|config)\.js/.test(x));
  melde(treffer.length === lack.length, `Code-Zeilen mit „gletscher“: ${treffer.length}, alle davon Lackierung (autos/texte/config): ${lack.join(', ')}${treffer.length !== lack.length ? ` – ANDERE: ${treffer.filter((x) => !lack.includes(x)).join(', ')}` : ''}`);
  const s = await oeffne(WURZEL, '?ton=aus');
  const r = await s.page.evaluate(async () => {
    const E = await import('/js/etappenwahl.js'); await E.ladeAlleInfos();
    return { ids: E.ETAPPEN_INFO.map((i) => i.id), etappen: E.ETAPPEN_INFO.map((i) => i.etappe) };
  });
  await s.schliessen();
  melde(r.ids.join() === 'alpen,finnland,skigebiet' && !r.etappen.some((e) => /gletscher/.test(e)), `Etappenwahl/Bestzeiten/Statistik kennen: ${r.ids.join(', ')} (Bestzeiten-Schlüssel ${r.etappen.join(', ')}; Gletscher-Zeiten werden nicht mehr gezeigt)`);
}
if (teil('b')) {
  titel('(b) Skigebiet im Menü wählbar (SKIGEBIET / SKI RESORT), Vorschau-Karte gemalt, startet und fährt ohne Fehler');
  const s = await oeffne(WURZEL, '?ton=aus');
  const r = await s.page.evaluate(async () => {
    const A = window.__alpineRally, E = await import('/js/etappenwahl.js'), TX = await import('/js/texte.js'); await E.ladeAlleInfos();
    const info = E.ETAPPEN_INFO.find((i) => i.id === 'skigebiet'), namen = {};
    for (const sp of ['de', 'en']) { TX.setzeSprache(sp); namen[sp] = TX.t(info.name); } // (info.name = Text-Schlüssel)
    TX.setzeSprache('de');
    const k = E.vorschauKarte(info, 64, 40), x = k.getContext('2d').getImageData(0, 0, k.width, k.height).data;
    let farbig = 0; for (let i = 0; i < x.length; i += 4) if (Math.abs(x[i] - x[0]) + Math.abs(x[i + 1] - x[1]) + Math.abs(x[i + 2] - x[2]) > 30) farbig++; // (anders als der Hintergrund = Strasse, Start, Ziel)
    A.zumMenue(); A.menue.oeffne(A.seiten.etappe); await new Promise((ok) => setTimeout(ok, 800));
    const zeilen = A.menue.seite.eintraege().filter((e) => e.etappeId).map((e) => e.etappeId);
    return { namen, farbig, zeilen, revision: info.revision ?? null };
  });
  await s.schliessen();
  melde(r.namen.de === 'SKIGEBIET' && r.namen.en === 'SKI RESORT' && r.zeilen.includes('skigebiet'), `Menü ETAPPE: ${r.zeilen.join(', ')}; Name de „${r.namen.de}“, en „${r.namen.en}“`);
  melde(r.farbig > 100, `Vorschau-Karte 64x40: ${r.farbig} Pixel Strecke (anders als der Hintergrund)`);
  // Start ohne Fehler: Spiel mit ?strecke=skigebiet laden (Konsole), dann der Testfahrer „mittel“ einmal ins Ziel
  const g = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet');
  const f = await g.page.evaluate(() => ({ laenge: window.__alpineRally.strecke.laenge, fehlerseite: !!window.__fehlerseite }));
  await g.schliessen();
  melde(!f.fehlerseite && g.fehler.length === 0, `?strecke=skigebiet lädt (Länge ${f.laenge.toFixed(1)} m), Konsole ohne Fehler (${g.fehler.join(' | ').slice(0, 200)})`);
  const l = await testfahrerLauf(G_DATEI, 'rt4', WURZEL, 'neub', ['mittel']);
  melde(l.stile[0].zeit != null, `Testfahrer Audan „mittel“: ${fmtZ(l.stile[0].zeit)} im Ziel`);
}
if (teil('c')) {
  titel('(c) Alte Tests entschieden: m11a-test und m11a1-test gekürzt (Gletscher-Teile: Erwartung alt), Rest grün; overlay-test robuster');
  for (const [datei, a] of [['m11a1-test.mjs', ['--nur', 'a,i,j,p,q,aa']], ['m11a-test.mjs', ['--nur', 'h,r,t,u,v']]]) {
    const r = werkzeug(datei, a);
    fs.writeFileSync(path.join(LOG, `c-${datei.replace('.mjs', '')}.log`), r.text);
    const z = r.text.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x)), rot = z.filter((x) => /^\s*FEHLER/.test(x));
    melde(r.code === 0 && rot.length === 0 && z.length > 5, `${datei} ${a.join(' ')}: ${z.length - rot.length} ok${rot.length ? `, rot: ${rot.join(' | ').slice(0, 300)}` : ''}`);
  }
  const quelle = fs.readFileSync(path.join(WURZEL, 'tools/m11a1-test.mjs'), 'utf8') + fs.readFileSync(path.join(WURZEL, 'tools/m11a-test.mjs'), 'utf8');
  melde(/Erwartung alt, Gletscher entfernt/.test(quelle), 'Begründung im Kopf beider Tests: „Erwartung alt, Gletscher entfernt“');
  const o = fs.readFileSync(path.join(WURZEL, 'tools/overlay-test.mjs'), 'utf8');
  melde(/bis zu 8-mal je 0\.4 s nachsehen/.test(o), 'overlay-test: „Hinweis nach 1.5 s weg“ wartet jetzt mit Wiederholung (bis ca. 5 s) statt fest 1.8 s (Spieluhr läuft bei Software-Grafik hinterher)');
}
if (teil('d')) await unveraendert('d', { bilder: true });

// ===================================================================== Teil B: Höhenprofil, Physik, Streckenverlauf
// Höhenprofil aus dem Kartenbericht (strecke-karte: Steigung über 25 m, Höhenmeter; mit Sprungrampen)
function profilZahlen(strecke) {
  const r = werkzeug('strecke-karte.mjs', ['--strecke', strecke, '--aus', LOG]);
  const st = /Steigung \(über 25 m\): max\. \+([\d.]+) % bei (\d+) m, Gefälle max\. -([\d.]+) %/.exec(r.text);
  const hm = /tiefster Punkt (-?[\d.]+) m, höchster (-?[\d.]+) m/.exec(r.text);
  const L = /Länge: ([\d.]+) m/.exec(r.text), b = /Belag zwischen Start und Ziel: (.*)/.exec(r.text);
  return { steigung: +st[1], bei: +st[2], gefaelle: +st[3], tief: +hm[1], hoch: +hm[2], diff: +hm[2] - +hm[1], laenge: +L[1], belag: b ? b[1] : '', text: r.text };
}
if (teil('e')) {
  titel('(e) Länge 3800–4400 m, Höhenprofil gegen Alpen/Finnland: maximale Steigung ≥ 1.5× Alpen, Höhenunterschied ≥ 1.5× Alpen');
  const s = profilZahlen('skigebiet'), a = profilZahlen('alpen'), f = profilZahlen('finnland');
  fs.writeFileSync(path.join(LOG, 'profil.txt'), s.text);
  melde(s.laenge >= 3800 && s.laenge <= 4400, `Länge ${s.laenge.toFixed(1)} m; Belag ${s.belag}`);
  info(`Alpen: max +${a.steigung} % (bei ${a.bei} m), Gefälle −${a.gefaelle} %, Höhe ${a.tief}…${a.hoch} m (${a.diff.toFixed(1)} m); Finnland: +${f.steigung} % / −${f.gefaelle} %, ${f.diff.toFixed(1)} m`);
  melde(s.steigung >= 1.5 * a.steigung - 0.05, `Skigebiet max +${s.steigung} % bei ${s.bei} m = ${(s.steigung / a.steigung).toFixed(2)}× Alpen (Alpen-Maximum ist die Sprungrampe bei 2129 m; ohne Sprung ca. 11.6 %)`);
  melde(s.diff >= 1.5 * a.diff, `Höhenunterschied ${s.diff.toFixed(1)} m (${s.tief}…${s.hoch} m) = ${(s.diff / a.diff).toFixed(2)}× Alpen; Gefälle max −${s.gefaelle} %`);
  const q = fs.readFileSync(G_DATEI, 'utf8'), ha = /hangabtrieb: ([\d.]+)/.exec(q), br = /strassenBreite: \[\{ von: (\d+), bis: (\d+), breite: ([\d.]+) \}\]/.exec(q);
  info(`Hangabtrieb ${ha && ha[1]} (Alpen/Finnland 1 = Faktor 0.45 g·Steigung, Skigebiet ${(0.45 * +ha[1]).toFixed(2)} g·Steigung); schmale Strasse ${br && `${br[1]}–${br[2]} m: ${br[3]} m (${(+br[3] / 7 * 100).toFixed(0)} % der Alpen-Breite 7 m)`}`);
}
// Testfahrer Skigebiet (alle Autos, mittel/flott/digital): Zeiten gestaffelt, im Ziel, kein Stillstand/Klemmen
const STILE_S = ['mittel', 'flott', 'digital'];
const SKI = {};
async function skiLaeufe(stand) { if (!SKI[stand]) SKI[stand] = await parallel(AUTOS.map((id) => () => testfahrerLauf(G_DATEI, id, WURZEL, stand, STILE_S)), 3); return SKI[stand]; }
async function skiTestfahrer(buchstabe, text, stand) {
  titel(`(${buchstabe}) Testfahrer Skigebiet ${text}: alle im Ziel, kein Stillstand/Klemmen`);
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
  return d;
}
function staffelung(buchstabe, d) {
  titel(`(${buchstabe}) Zeiten gestaffelt: Allrad (Audan, Delto, Imprexa) vorn, Escorta dahinter, Lanza 073 am Ende, höchstens ca. +30 %`);
  for (const st of STILE_S) {
    const t = Object.fromEntries(AUTOS.map((id, k) => [id, d[k].stile.find((x) => x.stil === st).zeit ?? 9999]));
    const best = Math.min(...Object.values(t)), schlecht = Math.max(...Object.values(t));
    const allradVorn = Math.max(...ALLRAD.map((id) => t[id])) < Math.min(...HINTERRAD.map((id) => t[id]));
    const reihe = !t.escorta || !t.l073 || t.escorta <= t.l073;
    melde(allradVorn && reihe && schlecht <= best * 1.3, `${st}: Allrad ${ALLRAD.map((id) => fmtZ(t[id])).join(' / ')}, Escorta ${fmtZ(t.escorta)}, Lanza 073 ${fmtZ(t.l073)}; langsamster +${((schlecht / best - 1) * 100).toFixed(1)} % zum Besten`);
  }
}
if (teil('f') || teil('g')) {
  const d = await skiTestfahrer('f', '(Stile mittel, flott, digital; strecke-abfahren)', 'neuB');
  if (teil('g')) staffelung('g', d);
}
// (h) Anfahren am steilsten Hang: 0 → 40 km/h aus dem Stand, Vollgas geradeaus, gegen dasselbe im flachen Dorf
const ANFAHREN = ([s0]) => {
  const A = window.__alpineRally, P = A.physik; A.anhalten = true;
  A.setzeAuf(s0); P.vx = 0; P.vz = 0;
  const steig = A.strecke.punktBei(s0 + 15).h - A.strecke.punktBei(s0 - 15).h;
  let t = 0; for (; t < 20 && P.tempo * 3.6 < 40; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false }, true);
  return { t, steigung: steig / 30, untergrund: A.untergrund };
};
if (teil('h')) {
  titel('(h) Steilster Anstieg: Allrad fährt merklich besser an als Hinterrad (0–40 km/h aus dem Stand am Hang, gegen flach im Dorf)');
  const prof = profilZahlen('skigebiet'), s0 = prof.bei - 10;
  const z = {};
  for (const id of AUTOS) {
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet', { auto: id });
    z[id] = { hang: await s.page.evaluate(ANFAHREN, [s0]), flach: await s.page.evaluate(ANFAHREN, [100]) };
    await s.schliessen();
  }
  const zeile = (id) => `${id} ${z[id].hang.t.toFixed(2)} s (flach ${z[id].flach.t.toFixed(2)} s, +${((z[id].hang.t / z[id].flach.t - 1) * 100).toFixed(0)} %)`;
  info(`Hang bei ${s0} m: Steigung ${(z[AUTOS[0]].hang.steigung * 100).toFixed(1)} %, Untergrund ${z[AUTOS[0]].hang.untergrund}`);
  info(AUTOS.map(zeile).join('; '));
  const allrad = Math.max(...ALLRAD.map((id) => z[id].hang.t)), hinten = Math.min(...HINTERRAD.map((id) => z[id].hang.t));
  const verlustA = Math.max(...ALLRAD.map((id) => z[id].hang.t - z[id].flach.t)), verlustH = Math.min(...HINTERRAD.map((id) => z[id].hang.t - z[id].flach.t));
  melde(allrad < hinten && hinten >= allrad * 1.15, `langsamster Allrad ${allrad.toFixed(2)} s, schnellster Hinterrad ${hinten.toFixed(2)} s (+${((hinten / allrad - 1) * 100).toFixed(0)} %, Ziel mindestens +15 %)`);
  info(`Zeitverlust durch den Hang: Allrad höchstens +${verlustA.toFixed(2)} s, Hinterrad mindestens +${verlustH.toFixed(2)} s`);
}
if (teil('i')) {
  titel('(i) Hang-Prüfung (tools/hang-pruefen.mjs --pruefen): 0 Fehler (seit M11b zählt auch Tiefschnee-Gelände)');
  const h = werkzeug('hang-pruefen.mjs', ['--strecke', 'skigebiet', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'hang-skigebiet.log'), h.text);
  const z = h.text.split('\n').filter((x) => /Stellen über|grösste/.test(x)).join(' | ');
  melde(h.code === 0, `Rückgabe ${h.code}: ${z.slice(0, 300)}`);
}
if (teil('j')) await unveraendert('j', { bilder: true });

// ===================================================================== Teil C: Ränder, Stationen, Zielarena
// (k) Fangnetz: schräg hinein (25°, 60 km/h, Gas halb) -> Wand-Strafe; Tiefschnee-Rand: 80 km/h hineinversetzt, 2 s
const NETZ_TEST = ({ stellen }) => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke; A.anhalten = true;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, out = [];
  for (const [s0, sd] of stellen) {
    A.setzeAuf(s0); P.richtung -= sd * 25 * Math.PI / 180; // (Richtung kleiner = nach rechts)
    P.vx = Math.sin(P.richtung) * 60 / 3.6; P.vz = Math.cos(P.richtung) * 60 / 3.6;
    const st0 = A.wand.strafen; let maxSeite = 0; const q = {};
    for (let t = 0; t < 3; t += A.SCHRITT) { A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.5 }, true); S.abfrage(P.x, P.z, q); maxSeite = Math.max(maxSeite, Math.abs(q.seite)); }
    out.push({ s: s0, seite: sd, strafen: A.wand.strafen - st0, maxSeite, halb: A.netz.halbBei(s0) });
  }
  return out;
};
const RAND_BREMSEN = async ({ s0, lat }) => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke; A.anhalten = true;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false }, out = {};
  for (const [name, gas] of [['los', 0], ['voll', 1]]) {
    A.setzeAuf(s0); const p = S.punktBei(s0); P.x = p.x - p.tz * lat; P.z = p.z + p.tx * lat;
    P.vx = Math.sin(P.richtung) * 80 / 3.6; P.vz = Math.cos(P.richtung) * 80 / 3.6;
    const st0 = A.wand.strafen; let art = null;
    for (let t = 0; t < 2; t += A.SCHRITT) { A.physikSchritt(A.SCHRITT, { ...LEER, gas }, true); art = art || A.untergrund; }
    const v2 = P.tempo * 3.6;
    const x0 = P.x, z0 = P.z; for (let t = 0; t < 3; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }, true);
    out[name] = { v2, verlust: 1 - v2 / 80, art, strafen: A.wand.strafen - st0, rueck: Math.hypot(P.x - x0, P.z - z0) };
  }
  return out;
};
if (teil('k')) {
  titel('(k) Fangnetze lösen die Wand-Strafe aus (wie Zaun/Leitplanke); Tiefschnee-Rand bremst ≥ 60 % in 2 s ohne Strafe');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet');
  const n = await s.page.evaluate(NETZ_TEST, { stellen: [[440, -1], [700, 1], [1200, 1], [2900, -1], [3280, 1]] });
  const daten = await s.page.evaluate(() => ({ an: window.__alpineRally.fangnetze.an, n: window.__alpineRally.fangnetze.liste.length, kreise: window.__alpineRally.fangnetze.hindernisse.length }));
  info(`${daten.n} Netz-Abschnitte, ${daten.kreise} Kollisionskreise (rand 'zaun')`);
  for (const x of n) melde(x.strafen >= 1 && x.maxSeite < x.halb + 4.5, `Netz ${x.s} m ${x.seite < 0 ? 'links' : 'rechts'}: ${x.strafen} Wand-Strafe(n), weiteste Lage ${x.maxSeite.toFixed(1)} m neben der Mitte (Netz bei ${(x.halb + 2.6).toFixed(1)} m)`);
  for (const [s0, lat] of [[2150, 9], [2300, -9], [3600, 10], [3700, -9]]) {
    const x = await s.page.evaluate(RAND_BREMSEN, { s0, lat });
    melde(x.los.art === 'tiefschnee' && x.los.verlust >= 0.6 && !x.los.strafen && !x.voll.strafen && x.los.rueck >= 2, `Tiefschnee ${s0} m ${lat < 0 ? 'links' : 'rechts'}: Gas los −${(x.los.verlust * 100).toFixed(0)} %, Vollgas −${(x.voll.verlust * 100).toFixed(0)} % in 2 s, Strafen ${x.los.strafen + x.voll.strafen}, rückwärts ${x.los.rueck.toFixed(1)} m in 3 s`);
  }
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
  await s.schliessen();
}
// (l) Kurven-Vergleich (alle Kehren und engen Kurven, alle Autos): Rand-Kontakt (Netz-„wand“, Tiefschnee-Abkürzen) gegen die beste Fahrt
function kurvenVergleich(auto, stand) {
  const datei = path.join(LOG, `kurven-${stand}-${auto}.json`);
  if (!fs.existsSync(datei) || process.env.M11B_NEU) {
    const r = werkzeug('strecke-abfahren.mjs', [G_DATEI, '--auto', auto, '--kurven-vergleich', '--json', datei]);
    if (!fs.existsSync(datei)) { console.log(r.text.slice(-1500)); throw new Error(`kurven-vergleich ${auto}`); }
  }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
if (teil('l')) {
  titel('(l) Kein Exploit: Netz/Tiefschnee in keiner Kehre > 0.1 s schneller als die beste Fahrt auf der Strasse (alle 5 Autos); Abkürzungs-Prüfung 0 Funde');
  const neu = await parallel(AUTOS.map((id) => async () => kurvenVergleich(id, 'neuC')), 3);
  const d = (x) => (x == null ? '–' : `${x >= 0 ? '+' : ''}${x.toFixed(2)} s`);
  const tab = ['| Auto | Kurve (m) | beste auf der Strasse | Rand-Kontakt: Unterschied |', '|---|---|---|---|'];
  const schneller = []; let knapp = Infinity;
  AUTOS.forEach((id, k) => {
    for (const c of neu[k]) {
      tab.push(`| ${id} | ${c.von}–${c.bis} | ${c.bestAlle ? `${c.bestAlle.stil} ${c.bestAlle.zeit.toFixed(2)} s` : '–'} | ${d(c.diff)}${c.wand.kontakt ? ` (Kontakt ${c.wand.kontakt.toFixed(2)} s)` : ' (ohne Kontakt)'}${c.wand.strafen ? `, ${c.wand.strafen} Strafen` : ''} |`);
      if (c.diff != null && c.wand.kontakt) knapp = Math.min(knapp, c.diff);
      if (c.diff != null && c.diff < -0.1 && c.wand.kontakt) schneller.push(`${id} ${c.von} m ${d(c.diff)}`);
    }
  });
  fs.writeFileSync(path.join(LOG, 'kurven-C.md'), tab.join('\n') + '\n');
  info(`Tabelle: ${LOG}/kurven-C.md (${tab.length - 2} Zeilen)`);
  melde(schneller.length === 0, `Rand-Kontakt in ${schneller.length} Kurven mehr als 0.1 s schneller${schneller.length ? `: ${schneller.join('; ')}` : ''}; knappste Linie mit Kontakt ${d(knapp === Infinity ? null : knapp)}`);
  const a = werkzeug('abkuerzungen.mjs', ['--strecke', 'skigebiet', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-skigebiet.log'), a.text);
  const z = a.text.split('\n').filter((x) => /Abkürzungen mit Gewinn|Durchkommen/.test(x)).map((x) => x.trim()).join(' | ');
  melde(a.code === 0 && /Abkürzungen mit Gewinn >= 3 m: 0 /.test(a.text), `abkuerzungen --pruefen: Rückgabe ${a.code}; ${z.slice(0, 250)}`);
}
// (m) Kontrast Fahrbahn gegen Hang (Helligkeit 0–255, 18 m vor dem Auto, 320x180), Stellen ohne Netz im Blick
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
    const fb = A.netz.halbBei(s0 + 18) * 0.5, lh = A.netz.halbBei(s0 + 18) + 6;
    const fahrbahn = (hell(s0, -fb) + hell(s0, fb)) / 2, hang = (hell(s0, -lh) + hell(s0, lh)) / 2;
    out.push({ s: s0, fahrbahn, hang, diff: hang - fahrbahn, belag: A.netz.belag[Math.round(s0 + 18)] });
  }
  return out;
};
const KONTRAST_STELLEN = [[640, 'Anstieg'], [930, 'Anstieg'], [1500, 'vor Kehre 5'], [2150, 'Grat'], [2300, 'Grat'], [2780, 'vor Abfahrt-Kehre'], [3600, 'Funpark'], [3400, 'Abfahrt (Funpark-Einfahrt)']]; // (Stellen, an denen kein oranges Netz im Messpunkt steht)
async function kontrastTest(buchstabe, text) {
  titel(`(${buchstabe}) Kontrast Fahrbahn gegen Hang ${text}: mindestens 40 Helligkeitsstufen (320x180)`);
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet&aufloesung=320x180', { uhr: true });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; });
  const r = await s.page.evaluate(KONTRAST, { stellen: KONTRAST_STELLEN.map((x) => x[0]) });
  await s.schliessen();
  r.forEach((x, i) => melde(Math.abs(x.diff) >= 40, `${x.s} m ${KONTRAST_STELLEN[i][1]} (${x.belag}): Fahrbahn ${x.fahrbahn.toFixed(0)}, Hang ${x.hang.toFixed(0)}, Unterschied ${x.diff.toFixed(0)}`));
}
if (teil('m')) await kontrastTest('m', '(Anstieg, Kehren, Grat, Abfahrt)');
// (n) Talstation, Bergstation, Zielarena: laden ohne Fehler, Deko steht nicht auf der Strasse, keine Kollision ausser Netzen
if (teil('n')) {
  titel('(n) Talstation, Bergstation, Zielarena laden ohne Fehler; Deko ohne Kollision (ausser Netze), nicht auf der Strasse');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet');
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, q = {}, D = A.skigebietDeko;
    const haeuser = A.STRECKE ? null : null;
    const alle = [...A.strassenrand.hindernisse, ...A.pflanzen.hindernisse];
    // Kollisionskreise nahe Tribüne und Pistenkreuzungen (ausser Netzen): soll 0 sein
    const nahe = (s0, lat, r) => alle.filter((h) => { if (h.netz) return false; S.abfrage(h.x, h.z, q); return Math.abs(q.s - s0) < r && Math.sign(q.seite) === Math.sign(lat) && Math.abs(Math.abs(q.seite) - Math.abs(lat)) < 8; }).length;
    const trib = D.tribuenen.map((t) => ({ s: t.s, kreise: nahe(t.s, t.seite * (t.lat + 2), t.laenge / 2), lat: t.lat }));
    const netzAufStrasse = A.fangnetze.hindernisse.filter((h) => { S.abfrage(h.x, h.z, q); return Math.abs(q.seite) < A.netz.halbBei(q.s) + A.CONFIG.strasse.bankett; }).length;
    return { trib, netzAufStrasse, kreuzungen: D.kreuzungen.length, haeuser: A.leben.haeuser ? A.leben.haeuser.length : null, parkwagen: (A.leben.parkwagen || []).length };
  });
  const q = fs.readFileSync(G_DATEI, 'utf8');
  melde(/Talstation \(Gondelhaus\)/.test(q) && /Bergstation/.test(q) && /Hütte \(Après-Ski\)/.test(q) && /parkwagen: \[/.test(q) && /name: 'apres'/.test(q) && /name: 'arena'/.test(q), 'Daten: Talstation (Gondelhaus), Parkplatz mit 7 Deko-Autos, Bergstation, Hütte mit Après-Ski-Gruppe (5 Figuren), Zielarena mit Tribüne und Zuschauern');
  melde(r.trib.every((x) => x.kreise === 0 && x.lat >= 12), `Tribüne: ${r.trib.map((x) => `${x.s} m, ${x.lat} m neben der Mitte, ${x.kreise} Kollisionskreise`).join('; ')}`);
  melde(r.netzAufStrasse === 0, `kein Netz auf Fahrbahn oder Bankett (${r.netzAufStrasse} Kreise)`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
  await s.schliessen();
}
// (o) Pistenkreuzungen: nur Optik und Schild, keine Wirkung aufs Fahren (keine Hindernisse, Untergrund unverändert)
if (teil('o')) {
  titel('(o) Pistenkreuzungen (2): Schild und Spuren da, keine Wirkung aufs Fahren (kein Hindernis, Untergrund und Tempo gleich)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet');
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, P = A.physik, q = {}, D = A.skigebietDeko, out = [];
    for (const k of D.kreuzungen) {
      const kreise = [...A.strassenrand.hindernisse, ...A.pflanzen.hindernisse].filter((h) => { S.abfrage(h.x, h.z, q); return Math.abs(q.s - k.s) < 6 && Math.abs(q.seite) < 12 && !h.netz; }).length;
      const p = S.punktBei(k.s), art = A.welt.bodenBei(p.x, p.z).art;
      // durchfahren mit 60 km/h, Gas halb: Tempo vor und nach der Kreuzung (gegen dieselbe Fahrt 40 m früher)
      const fahrt = (s0) => { A.anhalten = true; A.setzeAuf(s0); P.vx = Math.sin(P.richtung) * 60 / 3.6; P.vz = Math.cos(P.richtung) * 60 / 3.6; let v = []; for (let t = 0; t < 1.2; t += A.SCHRITT) { A.physikSchritt(A.SCHRITT, { gas: 0.5, bremse: 0, lenkung: 0, handbremse: false }, true); } v = P.tempo * 3.6; return v; };
      out.push({ s: k.s, kreise, art, v: fahrt(k.s - 10), schild: k.schildS });
    }
    return out;
  });
  await s.schliessen();
  melde(r.length === 2, `${r.length} Kreuzungen: ${r.map((x) => `${x.s} m (Schild bei ${x.schild} m)`).join(', ')}`);
  for (const x of r) melde(x.kreise === 0 && x.art === 'schnee', `${x.s} m: ${x.kreise} Hindernisse auf ±6 m, Untergrund ${x.art}, nach 1.2 s ${x.v.toFixed(1)} km/h (kein Bremsen)`);
}
if (teil('p')) await unveraendert('p', { bilder: true });

// ===================================================================== Teil D: Sprünge und Funpark-Kicker
if (teil('q')) {
  titel('(q) Weiten bei 100 km/h: natürlicher Sprung 15–25 m, Kicker 10–20 m (alle 5 Autos), Landung auf Schnee');
  for (const id of AUTOS) {
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=skigebiet', { auto: id });
    const r = await s.page.evaluate(WEITEN, [100]);
    await s.schliessen();
    const z = Object.entries(r.out).map(([name, l]) => ({ name, ...l[0] }));
    const ok = z.every((x) => x.ab && x.belag === 'schnee' && (x.name === 'KICKER' ? x.weite >= 10 && x.weite <= 20 : x.weite >= 15 && x.weite <= 25));
    melde(ok, `${id}: ${z.map((x) => `${x.name} ${x.ab ? `${x.weite.toFixed(1)} m (${x.belag}, Verlust ${(x.verlust * 100).toFixed(0)} %)` : 'rollt'}`).join(', ')}`);
  }
  info('(WEITEN misst je Name einmal: die drei Kicker sind gleich gebaut, gemessen wird der letzte Eintrag je Name)');
}
// Sprünge im Testfahrer (alle Autos, alle Stile): sauber gelandet (auf der Strasse, nicht ausserhalb), keine Strafe
if (teil('r')) {
  titel('(r) Alle Landungen in Ordnung: alle 5 Autos, alle 5 Stile (strecke-abfahren), auf der Strasse, keine Strafe, kein Flug ausserhalb');
  const d = await parallel(AUTOS.map((id) => () => testfahrerLauf(G_DATEI, id, WURZEL, 'neuD', STILE)), 3);
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
// (s) Zeit je Sprung: Testfahrer „mittel“ mit gegen ohne Sprungzonen (dieselbe Strecke, Kuppen ohne Zone = keine Kuppe)
function ohneSpruenge() {
  const t2 = fs.readFileSync(G_DATEI, 'utf8');
  let n = 0;
  const neu = t2.replace(/\{ s: (\d+), name: '([^']+)', von:[^\n]*\n\s*form: \{[^}]*\} \}/g, (_, a, b) => { n++; return `{ s: ${a}, name: '${b}' }`; });
  if (n !== 4) throw new Error(`ohneSpruenge: ${n} statt 4 Sprungzonen ersetzt`);
  const datei = path.join(LOG, 'skigebiet-ohne-spruenge.js');
  fs.writeFileSync(datei, neu);
  return datei;
}
if (teil('s')) {
  titel('(s) Zeit je Sprung (Testfahrer „mittel“, alle Autos): mit gegen ohne Sprungzone, kein Gewinn über 0.2 s');
  const ohne = ohneSpruenge();
  const kanten = [...fs.readFileSync(G_DATEI, 'utf8').matchAll(/, kante: (\d{3,}),/g)].map((m) => +m[1]);
  const zt = (z, k) => z[Math.round((k + 150) / 10)] - z[Math.round((k - 100) / 10)];
  const tab = ['| Auto | ' + kanten.map((k) => `${k} m: mit / ohne / Unterschied`).join(' | ') + ' | Flugweiten |', '|---|' + kanten.map(() => '---|').join('') + '---|'];
  const gewinn = [];
  const l = await parallel(AUTOS.flatMap((id) => [() => testfahrerLauf(G_DATEI, id, WURZEL, 'neuD', STILE), () => testfahrerLauf(ohne, id, WURZEL, 'ohne', ['mittel'])]), 4);
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
// (t) Sprung-Statistik: ein ganzer Lauf (Testfahrer im Spiel) zählt die Sprünge und speichert den Rekord unter "skigebiet"
if (teil('t')) {
  titel('(t) Sprung-Statistik fürs Skigebiet: Anzahl und weitester Sprung im Zielbildschirm, Rekord unter „skigebiet“');
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
if (teil('u')) await unveraendert('u', { bilder: true });

// <TEILE E-F>

// ===================================================================== Zusammenfassung
console.log('\n| Test | Ergebnis |\n|---|---|');
for (const e of ergebnisse) console.log(`| ${e.titel.slice(0, 120)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);
