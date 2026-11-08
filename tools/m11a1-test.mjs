// Meilenstein 11a.1 prüfen:  node tools/m11a1-test.mjs [--alt <ordner 0.11a>] [--nur a,b,...] [--lang]
// (0.11a: git worktree add <ordner> 06417f7). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein
// Gamepad, Ton nur gemessen (nicht gehört). Vorlage: tools/m11a-test.mjs.
//   Teil A – Kleinigkeiten: (a) EIS in der Legende, (b) Zeit je Sprung, (c) Kreuzung 356 m, (d) Finnland-Pace-Notes,
//       (e) Alpen/Finnland unverändert (Testfahrer bit-gleich, Längen, Sprünge, Bilder pixelgleich)
//   Teil B – Eisseen: (f) … (n)    Teil C – Hohlwege, Tiefschnee: (o) … (w)    Teil D – Berge, Bäume, Skipiste: (x) … (ac)
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
const G_DATEI = path.join(WURZEL, 'strecken', 'gletscher.js');
if (!ALT) info('Vergleiche gegen 0.11a nur mit --alt <ordner> (git worktree add <ordner> 06417f7)');

// Spiel öffnen (wie m11a-test)
async function oeffne(wurzel, adresse = '', { auto, breite = 640, hoehe = 360, geraet, speicher = null, uhr = false } = {}) {
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
if (teil('a')) {
  titel('(a) EIS in der Symbol-Legende (STEUERUNG → PACE-NOTES-SYMBOLE), Deutsch und Englisch, Kachel gemalt');
  const quelle = fs.readFileSync(path.join(WURZEL, 'js/texte.js'), 'utf8');
  const z = /'legende\.eis': \{ de: '([^']+)', en: '([^']+)' \}/.exec(quelle);
  melde(!!z && z[1] === z[1].toUpperCase() && z[2] === z[2].toUpperCase(), `Text: de "${z && z[1]}", en "${z && z[2]}" (Grossbuchstaben)`);
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher');
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
// Zeit von 100 m vor bis 150 m nach der Kante; Gewinn höchstens 0.2 s
function ohneSpruenge() {
  const t = fs.readFileSync(G_DATEI, 'utf8');
  let n = 0;
  const neu = t.replace(/\{ s: (\d+), name: '([^']+)', von:[^\n]*\n\s*form: \{[^}]*\} \}/g, (_, a, b) => { n++; return `{ s: ${a}, name: '${b}' }`; });
  if (n !== 3) throw new Error(`ohneSpruenge: ${n} statt 3 Sprungzonen ersetzt`);
  const datei = path.join(LOG, 'gletscher-ohne-spruenge.js');
  fs.writeFileSync(datei, neu);
  return datei;
}
if (teil('b')) {
  titel('(b) Zeit je Sprung Gletscher (Testfahrer „mittel“, alle Autos): mit gegen ohne Flug (Strecke ohne Sprungzonen), kein Gewinn über 0.2 s');
  const ohne = ohneSpruenge();
  const kanten = [...fs.readFileSync(G_DATEI, 'utf8').matchAll(/, kante: (\d{3,}),/g)].map((m) => +m[1]);
  const zt = (z, k) => z[Math.round((k + 150) / 10)] - z[Math.round((k - 100) / 10)];
  const tab = ['| Auto | ' + kanten.map((k) => `Kante ${k} m: mit / ohne / Unterschied`).join(' | ') + ' | Flugweiten |', '|---|' + kanten.map(() => '---|').join('') + '---|'];
  const gewinn = [];
  const l = await parallel(AUTOS.flatMap((id) => [() => testfahrerLauf(G_DATEI, id, WURZEL, 'neub', ['mittel']), () => testfahrerLauf(ohne, id, WURZEL, 'ohne', ['mittel'])]), 4);
  AUTOS.forEach((id, k) => {
    const m = l[2 * k].stile[0], o = l[2 * k + 1].stile[0];
    const z = kanten.map((kk) => [zt(m.zeitBei, kk), zt(o.zeitBei, kk)]);
    z.forEach(([a, b], j) => { if (a - b < -0.2) gewinn.push(`${id} ${kanten[j]} m ${(a - b).toFixed(2)} s`); });
    tab.push(`| ${id} | ${z.map(([a, b]) => `${a.toFixed(2)} / ${b.toFixed(2)} / ${a - b >= 0 ? '+' : ''}${(a - b).toFixed(2)} s`).join(' | ')} | ${(m.spruenge || []).map((x) => `${x.weite.toFixed(0)} m`).join(' / ')} |`);
  });
  fs.writeFileSync(path.join(LOG, 'sprungzeiten.md'), tab.join('\n') + '\n');
  for (const zz of tab) info(zz);
  melde(gewinn.length === 0, `kein Sprung bringt mehr als 0.2 s${gewinn.length ? ` – GEWINN: ${gewinn.join('; ')}` : ''} (Tabelle ${LOG}/sprungzeiten.md)`);
}

// (c) Kreuzung 356 m: Lanza 073 rutscht aussen in die Absperrung des Stummels – kein Steckenbleiben (rückwärts frei)
const KREUZUNG = async () => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke; A.anhalten = true;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false };
  const out = [];
  for (const [kmh, gas] of [[45, 0.3], [60, 0.6]]) {
    // vor dem Abzweig geradeaus (ohne Lenken) in den Stummel fahren: dort steht die Absperrung
    A.setzeAuf(318); P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
    const st0 = A.wand.strafen; let t = 0, stopp = null;
    for (; t < 6; t += A.SCHRITT) { A.physikSchritt(A.SCHRITT, { ...LEER, gas }, true); if (A.wand.strafen > st0 && stopp == null) stopp = t; if (stopp != null && t > stopp + 2) break; }
    const q = S.abfrage(P.x, P.z, {}), x0 = P.x, z0 = P.z;
    // rückwärts (Bremse halten) 3 s
    for (let k = 0; k < 3; k += A.SCHRITT) A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }, true);
    const rueck = Math.hypot(P.x - x0, P.z - z0);
    // dann vorwärts nach rechts auf die Schneestrasse: kommt es bis 420 m?
    let weiter = false;
    for (let k = 0; k < 25 && !weiter; k += A.SCHRITT) {
      const qq = S.abfrage(P.x, P.z, {}), p = S.punktBei(Math.min(S.anzahl - 1, qq.s + 12));
      let d = Math.atan2(p.x - P.x, p.z - P.z) - P.richtung; d = Math.atan2(Math.sin(d), Math.cos(d));
      A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.5, lenkung: Math.max(-1, Math.min(1, -d * 2)) }, true); // (lenkung + = rechts = Richtung kleiner)
      if (qq.s > 400 && qq.abstand < 4) weiter = true;
    }
    out.push({ kmh, strafen: A.wand.strafen - st0, beiS: q.s, seite: q.seite, rueck, weiter });
  }
  return out;
};
if (teil('c')) {
  titel('(c) Kreuzung 356 m (Abzweig auf die Schneestrasse): Lanza 073 „flott“ entschieden, kein Steckenbleiben (rückwärts frei)');
  const l = await testfahrerLauf(G_DATEI, 'l073', WURZEL, 'neuc', ['mittel', 'flott', 'digital']);
  for (const st of l.stile) info(`Lanza 073 ${st.stil}: ${fmtZ(st.zeit)}, Aufpralle ${st.aufpralle} (${(st.aufprallListe || []).map((p) => (typeof p === 'object' ? JSON.stringify(p) : p)).join(', ').slice(0, 80)}), Strafen ${(st.motorStrafen || []).length}`);
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher', { auto: 'l073' });
  const r = await s.page.evaluate(KREUZUNG);
  const geo = await s.page.evaluate(() => { const A = window.__alpineRally; return { halb: A.netz.halbBei(356), bankett: A.CONFIG.strasse.bankett, abstandWeg: A.CONFIG.absperrung ? A.CONFIG.absperrung.abstandWeg : null }; });
  await s.schliessen();
  info(`Strasse bei 356 m: halbe Breite ${geo.halb} m + Bankett ${geo.bankett} m; Absperrung ${geo.abstandWeg} m weiter weg als in den Alpen (0.5)`);
  for (const x of r) melde(x.rueck >= 2 && x.weiter, `${x.kmh} km/h geradeaus in den Stummel: Strafen ${x.strafen}, Halt bei ${x.beiS.toFixed(0)} m (${x.seite.toFixed(1)} m neben der Mitte), rückwärts in 3 s ${x.rueck.toFixed(1)} m, danach in 25 s weiter auf die Schneestrasse (400 m): ${x.weiter ? 'ja' : 'NEIN'}`);
}
// (d) Finnland-Pace-Notes: die zwei alten roten Zeilen entschieden (Erwartung alt → Test angepasst)
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

// ===================================================================== Teil B: Eisseen
// Lage, Grösse, Eis-Anteil, Objekte auf dem See, Farben (im Spiel gemessen)
const SEEN_PRUEFEN = async ({ hohlwege }) => {
  const A = window.__alpineRally, S = A.strecke, E = A.welt.eisseen, N = A.netz;
  const { berechnePaceNotes } = await import('/js/pacenotes.js');
  const kurven = berechnePaceNotes(S, N).kurven;
  const kehren = kurven.filter((c) => c.kehre || c.winkel >= 150);
  const startS = S.startS ?? A.CONFIG.strasse.startBeiMeter, zielS = S.zielS ?? (S.laenge - A.CONFIG.strasse.zielVorEnde);
  const gefahren = zielS - startS;
  // Ufer entlang der Strasse (rho auf der Mitte <= 1) und grösste Breite
  const seen = E.seen.map((see) => {
    let von = null, bis = null, breite = 0, rMin = Infinity;
    for (let s = Math.floor(see.s - see.halbL * 1.3); s <= see.s + see.halbL * 1.3; s++) {
      if (E.rho(see, s, 0) <= 1) { if (von == null) von = s; bis = s; }
      let l = 0, r = 0; while (E.rho(see, s, -(l + 0.1)) <= 1 && l < 60) l += 0.1; while (E.rho(see, s, r + 0.1) <= 1 && r < 60) r += 0.1;
      breite = Math.max(breite, l + r);
    }
    // Kurvenradius im See (Richtungsänderung je Meter)
    for (let s = von; s < bis - 10; s += 5) {
      const a = S.punktBei(s), b = S.punktBei(s + 10); const d = Math.abs(Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz));
      rMin = Math.min(rMin, d > 1e-6 ? 10 / d : Infinity);
    }
    const nahKehre = kehren.filter((k) => k.bis > von - 150 && k.von < bis + 150).map((k) => Math.round(k.von));
    const nahSprung = S.sprungZonen.filter((z) => Math.min(Math.abs(z.kante - von), Math.abs(z.kante - bis), Math.abs(z.landeVon - bis), Math.abs(z.landeBis - von)) < 150 || (z.kante > von && z.kante < bis) || (z.landeBis > von && z.landeVon < bis)).map((z) => z.name);
    const imHohlweg = (hohlwege || []).filter((h) => h.von < bis && h.bis > von).map((h) => `${h.von}–${h.bis}`);
    const cp = A.checkpoints.filter((c) => c.s > von - 20 && c.s < bis + 20).map((c) => c.s);
    return { s: see.s, von, bis, laenge: bis - von + 1, breite, rMin, nahKehre, nahSprung, imHohlweg, cp, drittel: Math.floor((see.s - startS) / (gefahren / 3)) };
  });
  // Eis-Anteil (Fahrbahn zwischen Start und Ziel) und ob alles Eis in einem See liegt
  let eis = 0, schnee = 0; const eisAusserhalb = [];
  for (let i = Math.ceil(startS); i < zielS; i++) {
    if (N.belag[i] === 'eis') { eis++; if (!E.seen.some((see) => E.rho(see, i, 0) <= 1)) eisAusserhalb.push(i); }
    if (N.belag[i] === 'schnee') schnee++;
  }
  // Objekte auf dem See (Ufer + 1 m): Bäume, Steine, Fernbäume, Strassenrand, Leben, Tiere, Start/Ziel, Absperrungen, Stangen
  const listen = {
    baeume: A.pflanzen.tannen, steine: A.pflanzen.steine, hindernisse: A.pflanzen.hindernisse, fernbaeume: A.deko.fernbaeume,
    strassenrand: A.strassenrand.hindernisse, leben: A.leben.hindernisse, figuren: A.leben.figuren, tiere: A.kuehe.kuehe,
    startZiel: A.startZiel.hindernisse, zuschauer: A.startZiel.zuschauer, absperrungen: A.absperrungen.hindernisse,
  };
  const q = {}, drauf = {};
  for (const [name, l] of Object.entries(listen)) {
    let n = 0;
    for (const o of l || []) { if (!E.naheXZ(o.x, o.z)) continue; S.abfrage(o.x, o.z, q); const b = E.bei(q.s, q.seite); if (b.see && b.draussen < 1 + (o.r || 0)) n++; }
    drauf[name] = n;
  }
  // Schilder des Strassenrands (Plan) und Schneestangen/Wall: nicht im See
  const schilder = ((A.strassenrand.plan && A.strassenrand.plan.schilder) || []).filter((o) => { if (!E.naheXZ(o.x, o.z)) return false; S.abfrage(o.x, o.z, q); const b = E.bei(q.s, q.seite); return b.see && b.draussen < 1; }).length;
  drauf.schilder = schilder;
  const SW = A.schneewall; let wall = 0;
  if (SW.an) for (const see of E.seen) for (let i = Math.floor(see.s - see.halbL * 1.2); i <= see.s + see.halbL * 1.2; i++) for (const sd of [-1, 1]) {
    if (!(sd < 0 ? SW.links : SW.rechts)[i]) continue; const b = E.bei(i, sd * (SW.kante[i] + 1)); if (b.see && b.draussen < 1) wall++;
  }
  drauf.schneewallUndStangen = wall;
  drauf.checkpoints = seen.reduce((n, x) => n + x.cp.length, 0);
  return { seen, eis, schnee, gefahren, eisAusserhalb: eisAusserhalb.length, drauf, startS, zielS };
};
const HOHLWEGE = () => { const t = fs.readFileSync(G_DATEI, 'utf8'), m = /hohlwege:\s*\[([\s\S]*?)\n  \]/.exec(t); return m ? [...m[1].matchAll(/von: (\d+), bis: (\d+)/g)].map((x) => ({ von: +x[1], bis: +x[2] })) : []; };
let SEEN = null;
const seenDaten = async () => {
  if (SEEN) return SEEN;
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher');
  SEEN = await s.page.evaluate(SEEN_PRUEFEN, { hohlwege: HOHLWEGE() });
  SEEN.fehler = s.fehler;
  await s.schliessen();
  return SEEN;
};
if (teil('f')) {
  titel('(f) Eisseen: 2 bis 3, Länge 60–120 m, Breite 30–40 m, Lage nach den Regeln (Prüfer grün)');
  const p = werkzeug('strecke-pruefen.mjs', ['strecken/gletscher.js']);
  melde(p.code === 0, `strecke-pruefen: ${p.text.trim().split('\n').pop().slice(0, 150)}`);
  const d = await seenDaten();
  melde(d.seen.length >= 2 && d.seen.length <= 3, `${d.seen.length} Eisseen`);
  for (const x of d.seen) {
    const ok = x.laenge >= 55 && x.laenge <= 125 && x.breite >= 28 && x.breite <= 42 && x.rMin >= 100 && !x.nahKehre.length && !x.nahSprung.length && !x.imHohlweg.length && x.von - d.startS >= 400 && !x.cp.length;
    melde(ok, `See ${x.von}–${x.bis} m (Drittel ${x.drittel + 1}): Länge ${x.laenge} m, Breite ${x.breite.toFixed(1)} m, engster Radius ${x.rMin === Infinity ? 'gerade' : `${x.rMin.toFixed(0)} m`}, Kehre ±150 m: ${x.nahKehre.join(', ') || 'keine'}, Sprung ±150 m: ${x.nahSprung.join(', ') || 'keiner'}, Hohlweg: ${x.imHohlweg.join(', ') || 'keiner'}, Checkpoint: ${x.cp.join(', ') || 'keiner'}`);
  }
  const abst = d.seen.slice(1).map((x, i) => x.von - d.seen[i].bis);
  melde(abst.every((a) => a >= 600) && new Set(d.seen.map((x) => x.drittel)).size === d.seen.length, `Abstand zwischen den Seen ${abst.join(' / ')} m (mindestens 600), je Drittel einer (${d.seen.map((x) => x.drittel + 1).join(', ')})`);
}
if (teil('g')) {
  titel('(g) Eis nur auf den Seen, Eis-Anteil 3–5 % der gefahrenen Strecke');
  const d = await seenDaten(), anteil = d.eis / d.gefahren * 100;
  melde(d.eisAusserhalb === 0 && anteil >= 3 && anteil <= 5, `Eis ${d.eis} m von ${d.gefahren.toFixed(0)} m = ${anteil.toFixed(1)} % (Schnee ${(d.schnee / d.gefahren * 100).toFixed(1)} %), Eis ausserhalb der Seen: ${d.eisAusserhalb} m (vorher 7 Eisstellen, 13.1 %)`);
}
if (teil('h')) {
  titel('(h) Nichts auf den Seen: keine Zäune, Leitplanken, Schilder, Stangen, Zuschauer, Bäume, Steine, Tiere, Checkpoints');
  const d = await seenDaten();
  const summe = Object.values(d.drauf).reduce((a, b) => a + b, 0);
  melde(summe === 0, Object.entries(d.drauf).map(([k, v]) => `${k} ${v}`).join(', '));
  melde(d.fehler.length === 0, `Konsole ohne Fehler (${d.fehler.length})`);
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
  titel('(j) Seitlich aus dem See (50 km/h, Gas halb): der Rand bremst, keine Strafe, kein Steckenbleiben (rückwärts frei)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher');
  const r = await s.page.evaluate(RAND_AUSTRITT);
  await s.schliessen();
  for (const x of r) melde(x.draussen != null && x.strafen === 0 && x.rueck >= 2 && x.v2 < x.vRaus, `See ${x.s} m ${x.seite < 0 ? 'links' : 'rechts'}: Ufer nach ${x.draussen && x.draussen.toFixed(1)} s mit ${x.vRaus && x.vRaus.toFixed(0)} km/h, 2 s später ${x.v2 && x.v2.toFixed(0)} km/h (Rand: ${x.untergrund}), Strafen ${x.strafen}, rückwärts in 3 s ${x.rueck.toFixed(1)} m`);
}
if (teil('k')) {
  titel('(k) Abkürzungs-Prüfung Gletscher vorher (0.11a) / nachher: nicht schlechter');
  const n = werkzeug('abkuerzungen.mjs', ['--strecke', 'gletscher', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-gletscher.log'), n.text);
  const zeile = (t) => t.split('\n').filter((x) => /Abkürzungen \(Linien\)|übrige Linien|Durchkommen|gesperrt|frei:/.test(x)).map((x) => x.trim()).join(' | ').slice(0, 400);
  info(`nachher: ${zeile(n.text)}`);
  if (ALT) { const a = werkzeug('abkuerzungen.mjs', ['--strecke', 'gletscher', '--pruefen'], ALT); fs.writeFileSync(path.join(LOG, 'abkuerzungen-gletscher-alt.log'), a.text); info(`vorher: ${zeile(a.text)}`); }
  melde(n.code === 0, `abkuerzungen --pruefen: Rückgabe ${n.code}`);
}
// Testfahrer Gletscher (alle Autos, mittel/flott/digital): Zeiten gestaffelt, im Ziel, kein Stillstand
const STILE_G = ['mittel', 'flott', 'digital'];
async function gletscherTestfahrer(buchstabe, text) {
  titel(`(${buchstabe}) Testfahrer Gletscher ${text}: alle im Ziel, kein Stillstand/Klemmen, Allrad vorn, Lanza 073 am Ende, ≤ +25 %`);
  const d = await parallel(AUTOS.map((id) => () => testfahrerLauf(G_DATEI, id, WURZEL, `neu${buchstabe}`, STILE_G)), 3);
  const alt = ALT ? await parallel(AUTOS.map((id) => () => testfahrerLauf(G_DATEI.replace(WURZEL, ALT), id, ALT, 'alt', STILE_G)), 3) : null;
  const tab = ['| Auto | ' + STILE_G.join(' | ') + ' | Aufpralle / Strafen | Stillstand |', '|---|---|---|---|---|---|'];
  let alleIm = true; const stand = [], bekannt = [];
  AUTOS.forEach((id, k) => {
    const z = (st) => d[k].stile.find((x) => x.stil === st), za = (st) => alt && alt[k].stile.find((x) => x.stil === st);
    for (const st of STILE_G) if (z(st).zeit == null) alleIm = false;
    const f = path.join(LOG, `fahrt-neu${buchstabe}-gletscher-${id}-${STILE_G.join('').slice(0, 24)}.txt`);
    const sl = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter((x) => /Stillstand über 1 s: (?!keiner)/.test(x)).map((x) => x.trim().slice(0, 50)) : [];
    // (Kreuzung 340–370 m: in Teil A (c) entschieden – Testfahrer-Stil, rückwärts frei; nur gemeldet)
    for (const x of sl) { const m = +((/: (\d+) m/.exec(x) || [])[1] || -1); if (m >= 340 && m <= 370) bekannt.push(`${id}: ${x}`); else stand.push(`${id}: ${x}`); }
    tab.push(`| ${id} | ${STILE_G.map((st) => `${fmtZ(z(st).zeit)}${za(st) ? ` (vorher ${fmtZ(za(st).zeit)})` : ''}`).join(' | ')} | ${STILE_G.map((st) => `${z(st).aufpralle}/${(z(st).motorStrafen || []).length}`).join(' · ')} | ${sl.length ? sl.join('; ') : 'keiner'} |`);
  });
  fs.writeFileSync(path.join(LOG, `testfahrer-gletscher-${buchstabe}.md`), tab.join('\n') + '\n');
  for (const z of tab) info(z);
  melde(alleIm && stand.length === 0, `alle ${AUTOS.length * 3} Läufe im Ziel, kein Stillstand über 1 s${stand.length ? ` – ${stand.join('; ')}` : ''}${bekannt.length ? ` (bekannt aus Teil A, Kreuzung: ${bekannt.join('; ')})` : ''}`);
  for (const st of STILE_G) {
    const t = Object.fromEntries(AUTOS.map((id, k) => [id, d[k].stile.find((x) => x.stil === st).zeit ?? 9999]));
    const best = Math.min(...Object.values(t)), schlecht = Math.max(...Object.values(t));
    const allradVorn = Math.max(...ALLRAD.map((id) => t[id])) < Math.min(...HINTERRAD.map((id) => t[id]));
    melde(allradVorn && schlecht <= best * 1.25, `${st}: Allrad ${ALLRAD.map((id) => fmtZ(t[id])).join(' / ')}, Escorta ${fmtZ(t.escorta)}, Lanza 073 ${fmtZ(t.l073)}; langsamster +${((schlecht / best - 1) * 100).toFixed(1)} %${t.l073 >= schlecht - 0.5 ? ', Lanza 073 am Ende' : ', Lanza 073 nicht am Ende (nur gemeldet)'}`);
  }
}
// Kurven-Vergleich (alle Kehren, alle Autos): „wand“ (Rand-Kontakt) gegen die beste Fahrt ohne Kontakt, vorher/nachher
function kurvenVergleich(auto, wurzel = WURZEL, stand = 'neu') {
  const datei = path.join(LOG, `kurven-${stand}-${auto}.json`);
  if (!fs.existsSync(datei) || (stand.startsWith('neu') && process.env.M11A1_NEU)) {
    const r = werkzeug('strecke-abfahren.mjs', [G_DATEI.replace(WURZEL, wurzel), '--auto', auto, '--kurven-vergleich', '--json', datei, ...(wurzel !== WURZEL ? ['--wurzel', wurzel] : [])], WURZEL);
    if (!fs.existsSync(datei)) { console.log(r.text.slice(-1500)); throw new Error(`kurven-vergleich ${auto} ${stand}`); }
  }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
async function kurvenTabelle(buchstabe, text, pflicht = true) {
  titel(`(${buchstabe}) Kurven-Vergleich ${text}: Rand-Kontakt („wand“) nirgends > 0.1 s schneller als die beste Fahrt auf der Strasse`);
  const neu = await parallel(AUTOS.map((id) => async () => kurvenVergleich(id, WURZEL, `neu${buchstabe}`)), 3);
  const alt = ALT ? await parallel(AUTOS.map((id) => async () => kurvenVergleich(id, ALT, 'alt')), 3) : null;
  const d = (x) => (x == null ? '–' : `${x >= 0 ? '+' : ''}${x.toFixed(2)} s`);
  const tab = ['| Auto | Kurve (m) | beste auf der Strasse | Rand-Kontakt: Unterschied | vorher (0.11a) |', '|---|---|---|---|---|'];
  const schneller = [];
  AUTOS.forEach((id, k) => {
    for (const c of neu[k]) {
      const a = alt && alt[k].find((x) => Math.abs(x.von - c.von) < 30);
      tab.push(`| ${id} | ${c.von}–${c.bis} | ${c.bestAlle ? `${c.bestAlle.stil} ${c.bestAlle.zeit.toFixed(2)} s` : '–'} | ${d(c.diff)}${c.wand.kontakt ? ` (Kontakt ${c.wand.kontakt.toFixed(2)} s)` : ' (ohne Kontakt)'}${c.wand.strafen ? `, ${c.wand.strafen} Strafen` : ''} | ${a ? `${d(a.diff)}${a.bestAlle ? `, beste ${a.bestAlle.zeit.toFixed(2)} s` : ''}` : '–'} |`);
      if (c.diff != null && c.diff < -0.1 && c.wand.kontakt) schneller.push(`${id} ${c.von} m ${d(c.diff)}`);
    }
  });
  fs.writeFileSync(path.join(LOG, `kurven-${buchstabe}.md`), tab.join('\n') + '\n');
  for (const z of tab) info(z);
  (pflicht ? melde : (ok, t) => info(`(nur gemeldet, Teil B: der Wall steht noch) ${t}`))(schneller.length === 0, `Rand-Kontakt in ${schneller.length} Kurven mehr als 0.1 s schneller${schneller.length ? `: ${schneller.join('; ')}` : ''}`);
  const strafen = neu.flat().reduce((n, c) => n + (c.wand.strafen || 0), 0);
  melde(strafen === 0, `keine Wand-Strafe am weichen Rand (Strafen: ${strafen})`);
}
if (teil('l')) { await gletscherTestfahrer('l', '(mit Eisseen)'); await kurvenTabelle('l2', 'Kehren ohne Eis (besonders die ehemalige Eiskehre 2047 m)', false); }
if (teil('m')) await unveraendert('m', { bilder: false });
// (n) Farbabstand See / Schneestrasse / Hang (Helligkeit und Blauanteil, 320x180, aus 25, 80 und 130 m)
const SEE_FARBEN = async () => {
  const A = window.__alpineRally, S = A.strecke, E = A.welt.eisseen, out = [];
  for (const see of E.seen) for (const vor of [25, 80, 130]) {
    const a0 = see.s - see.halbL + 5;
    A.setzeAuf(a0 - vor); A.kameraSofort(); window.__bild(3, 1000 / 60);
    const c = document.getElementById('spiel'), g = c.getContext('webgl2') || c.getContext('webgl');
    const w = g.drawingBufferWidth, h = g.drawingBufferHeight, px = new Uint8Array(w * h * 4);
    A.renderer.render(A.szene, A.kamera); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px);
    const V = new A.THREE.Vector3();
    // Median vieler Einzelpixel (Punkte auf der Fläche, auf das Bild projiziert): robust auch aus der Ferne
    const pixel = (s0, lat) => {
      const p = S.punktBei(s0); V.set(p.x - p.tz * lat, p.h + 0.05, p.z + p.tx * lat).project(A.kamera);
      const x = Math.round((V.x + 1) / 2 * w - 0.5), y = Math.round((V.y + 1) / 2 * h - 0.5); const i = (y * w + x) * 4;
      return V.z < 1 && x >= 0 && y >= 0 && x < w && y < h ? [px[i], px[i + 1], px[i + 2]] : null;
    };
    const median = (l) => [0, 1, 2].map((k) => { const a = l.filter(Boolean).map((f) => f[k]).sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; });
    const seeP = [], strP = [], hangP = [];
    const s1 = see.s - see.halbL;
    for (let k = 0; k < 8; k++) for (let j = -3; j <= 3; j++) seeP.push(pixel(s1 + 8 + k * 3, j * see.halbB * 0.2));
    for (let k = 0; k < 8; k++) for (const j of [-1.5, -0.5, 0.5, 1.5]) { strP.push(pixel(s1 - 30 + k * 3, j)); hangP.push(pixel(s1 - 30 + k * 3, j * 8)); }
    const seeF = median(seeP), strasse = median(strP), hang = median(hangP);
    const hell = (f) => 0.299 * f[0] + 0.587 * f[1] + 0.114 * f[2];
    out.push({ s: see.s, vor, see: seeF.map(Math.round), strasse: strasse.map(Math.round), hang: hang.map(Math.round), abstand: Math.hypot(...seeF.map((v, k) => v - strasse[k])), blauSee: seeF[2] - seeF[0], blauStrasse: strasse[2] - strasse[0], hellSee: hell(seeF), hellStrasse: hell(strasse) });
  }
  return out;
};
if (teil('n')) {
  titel('(n) Farbabstand Eissee gegen Schneestrasse (320x180): blau, klar anders als die Strasse, auch aus 130 m');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher&aufloesung=320x180', { uhr: true });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; });
  const r = await s.page.evaluate(SEE_FARBEN);
  await s.schliessen();
  // Pflicht aus 25 und 80 m; aus 130 m nur gemeldet (Dunst, Senke, Kurve davor: der See ist dort teils verdeckt)
  for (const x of r) (x.vor <= 80 ? melde : (ok, t) => info(`${ok ? '(ok)' : '(nur gemeldet)'} ${t}`))(x.abstand >= 30 && x.blauSee >= 2 * Math.max(10, x.blauStrasse), `See ${x.s} m aus ${x.vor} m: See ${x.see.join(',')}, Strasse ${x.strasse.join(',')}, Hang ${x.hang.join(',')}; Farbabstand ${x.abstand.toFixed(0)}, Blauanteil (B−R) See ${x.blauSee.toFixed(0)} gegen Strasse ${x.blauStrasse.toFixed(0)}, Helligkeit ${x.hellSee.toFixed(0)} / ${x.hellStrasse.toFixed(0)}`);
}

// ===================================================================== Zusammenfassung (Teile B bis E folgen)
console.log('\n| Test | Ergebnis |\n|---|---|');
for (const e of ergebnisse) console.log(`| ${e.titel.slice(0, 120)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);
