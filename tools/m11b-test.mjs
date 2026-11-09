// Meilenstein 11b prüfen:  node tools/m11b-test.mjs --alt <ordner 0.11a.1> [--nur a,b,...] [--lang]
// (0.11a.1: git worktree add <ordner> 471d726). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein
// Gamepad, Ton nur gemessen (nicht gehört). Vorlage: tools/m11a1-test.mjs.
//   Teil A – Gletscher raus, Skigebiet rein: (a) Gletscher weg, (b) Skigebiet wählbar/startet, (c) alte Tests entschieden,
//       (d) Alpen/Finnland bit-gleich
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

// <TEILE B-F>

// ===================================================================== Zusammenfassung
console.log('\n| Test | Ergebnis |\n|---|---|');
for (const e of ergebnisse) console.log(`| ${e.titel.slice(0, 120)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);
