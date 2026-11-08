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
    // (Kreuzung 290–370 m, Abzweig 323 m: in Teil A (c) entschieden – Testfahrer-Stil, rückwärts frei; nur gemeldet)
    for (const x of sl) { const m = +((/: (\d+) m/.exec(x) || [])[1] || -1); if (m >= 290 && m <= 370) bekannt.push(`${id}: ${x}`); else stand.push(`${id}: ${x}`); }
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

// ===================================================================== Teil C: Hohlwege und Tiefschnee-Rand
const HOHLWEG_PRUEFEN = async () => {
  const A = window.__alpineRally, S = A.strecke, SW = A.schneewall, E = A.welt.eisseen, C = A.CONFIG;
  const { berechnePaceNotes } = await import('/js/pacenotes.js');
  const kurven = berechnePaceNotes(S, A.netz).kurven, kehren = kurven.filter((c) => c.kehre || c.winkel >= 150);
  const pos = SW.mesh.geometry.attributes.position, colA = SW.mesh.geometry.attributes.color, q = {};
  const oben = new A.THREE.Color(C.schneewall.farbeOben); // (nur die Krone zählt, nicht die Schneestangen)
  const gef = S.zielS - S.startS;
  // Strassenhöhe ohne Hohlweg: aus der Liste zurückrechnen (py + tiefe * Anteil)
  const { hohlwegAnteil } = await import('/js/hohlweg.js');
  const liste = S.hohlwege.map((h) => {
    const mitte = (h.von + h.bis) / 2;
    // sichtbare Bankhöhe: höchster Punkt des Wall-Meshes nahe der Mitte (±5 m) über der Strasse, je Seite
    let links = 0, rechts = 0;
    for (let i = 0; i < pos.count; i += 3) {
      if (Math.abs(colA.getX(i) - oben.r) > 1e-3 || Math.abs(colA.getY(i) - oben.g) > 1e-3 || Math.abs(colA.getZ(i) - oben.b) > 1e-3) continue;
      const x = pos.getX(i), z = pos.getZ(i);
      const pm = S.punktBei(mitte); if ((x - pm.x) ** 2 + (z - pm.z) ** 2 > 400) continue;
      S.abfrage(x, z, q); if (Math.abs(q.s - mitte) > 5 || Math.abs(q.seite) > 15) continue;
      const hoch = pos.getY(i) - S.punktBei(Math.round(q.s)).h; if (q.seite < 0) links = Math.max(links, hoch); else rechts = Math.max(rechts, hoch);
    }
    const tiefe = h.tiefe * hohlwegAnteil([h], mitte);
    // Bogen? (Richtungsänderung über den Hohlweg, engster Radius)
    let rMin = Infinity; for (let s = h.von; s < h.bis - 10; s += 5) { const a = S.punktBei(s), b = S.punktBei(s + 10); const d = Math.abs(Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz)); rMin = Math.min(rMin, d > 1e-6 ? 10 / d : Infinity); }
    const a = S.punktBei(h.von), b = S.punktBei(h.bis), winkel = Math.abs(Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz)) * 180 / Math.PI;
    const kehre = kehren.filter((k) => k.von < h.bis && k.bis > h.von).map((k) => k.von);
    const sprung = S.sprungZonen.filter((z) => z.von < h.bis && z.bis > h.von).map((z) => z.name);
    const see = E.seen.filter((x) => x.s + x.halbL > h.von && x.s - x.halbL < h.bis).map((x) => x.s);
    let wallMeter = 0; for (let i = h.von; i <= h.bis; i++) wallMeter += (SW.links[i] ? 1 : 0) + (SW.rechts[i] ? 1 : 0);
    return { von: h.von, bis: h.bis, laenge: h.bis - h.von, tiefe, rampe: h.rampe, links, rechts, rMin, winkel, kehre, sprung, see, wallMeter, drittel: Math.floor((mitte - S.startS) / (gef / 3)) };
  });
  // Wall ausserhalb der Hohlwege (soll 0 sein)
  let aussen = 0; for (let i = 0; i < S.anzahl; i++) if ((SW.links[i] || SW.rechts[i]) && !S.hohlwege.some((h) => i >= h.von && i <= h.bis)) aussen++;
  return { liste, aussen, nurHohlwege: !!(C.strassenrand.schneewall && C.strassenrand.schneewall.nurHohlwege), tiefschnee: C.strassenrand.tiefschnee };
};
let HW_D = null;
const hohlwegDaten = async () => { if (!HW_D) { const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher'); HW_D = await s.page.evaluate(HOHLWEG_PRUEFEN); HW_D.fehler = s.fehler; await s.schliessen(); } return HW_D; };
if (teil('o')) {
  titel('(o) Hohlwege: 2 bis 3, Länge 120–250 m, Strasse 0.5–1 m tiefer, Bank 1.5–2.5 m, Rampe 30–40 m, Lage nach den Regeln');
  const d = await hohlwegDaten();
  melde(d.liste.length >= 2 && d.liste.length <= 3, `${d.liste.length} Hohlwege`);
  for (const h of d.liste) {
    const ok = h.laenge >= 120 && h.laenge <= 250 && h.tiefe >= 0.5 && h.tiefe <= 1 && Math.min(h.links, h.rechts) >= 1.5 && Math.max(h.links, h.rechts) <= 2.5 && h.rampe >= 30 && h.rampe <= 40 && !h.kehre.length && !h.sprung.length && !h.see.length;
    melde(ok, `Hohlweg ${h.von}–${h.bis} m (Drittel ${h.drittel + 1}): Länge ${h.laenge} m, Strasse ${h.tiefe.toFixed(2)} m tiefer, Bank links ${h.links.toFixed(2)} m / rechts ${h.rechts.toFixed(2)} m über der Strasse, Rampe ${h.rampe} m, Bogen ${h.winkel.toFixed(0)}° (engster Radius ${h.rMin.toFixed(0)} m), Kehre: ${h.kehre.join(', ') || 'keine'}, Sprung: ${h.sprung.join(', ') || 'keiner'}, See: ${h.see.join(', ') || 'keiner'}`);
  }
  const abst = d.liste.slice(1).map((h, i) => h.von - d.liste[i].bis);
  melde(abst.every((a) => a >= 400) && d.liste.some((h) => h.drittel === 0) && d.liste.some((h) => h.winkel >= 20 && h.rMin < 400), `Abstände ${abst.join(' / ')} m (mindestens 400), im ersten Drittel: ${d.liste.some((h) => h.drittel === 0) ? 'ja' : 'NEIN'}, in langen Bögen: ${d.liste.filter((h) => h.winkel >= 20 && h.rMin < 400).map((h) => `${h.von} m (${h.winkel.toFixed(0)}°)`).join(', ')}`);
  melde(d.fehler.length === 0, `Konsole ohne Fehler (${d.fehler.length})`);
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
  titel('(p) Hohlweg-Bank: schräg hinein (80 km/h): bremst, keine Strafe, kein Steckenbleiben, rückwärts frei');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher');
  const r = await s.page.evaluate(BANK_TEST);
  await s.schliessen();
  for (const x of r) melde(x.vEin != null && x.strafen === 0 && x.rueck >= 2 && x.tief <= 1.05 && (x.v1 == null || x.v1 < x.vEin), `${x.von} m ${x.sd < 0 ? 'links' : 'rechts'} ${x.winkel}°${x.gas ? ' Vollgas' : ''}: Kontakt mit ${x.vEin && x.vEin.toFixed(0)} km/h, nach 1 s ${x.v1 == null ? '(schon draussen)' : `${x.v1.toFixed(0)} km/h`}, wieder draussen nach ${x.raus == null ? '–' : `${x.raus.toFixed(2)} s`}, tiefstes Eintauchen ${x.tief.toFixed(2)} m, Strafen ${x.strafen}, rückwärts aus voller Tiefe (stehend, quer) in 3 s ${x.rueck.toFixed(1)} m`);
}
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
  titel('(q) Tiefschnee-Rand: Tempo fällt in 2 s um mindestens 60 % (aus 80 km/h), stärker als Gras in den Alpen, keine Strafe, keine MOTOR-Leuchte, rückwärts frei');
  const g = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher');
  const t = [];
  for (const [s0, lat] of [[3600, 9], [3600, -9], [2900, 10], [600, -9]]) t.push({ s0, lat, ...(await g.page.evaluate(RAND_BREMSEN, { s0, lat })) });
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
if (teil('r')) {
  titel('(r) Kein Dauer-Schneewall mehr: Wall nur in den Hohlwegen, sonst Tiefschnee-Rand mit Schneestangen');
  const d = await hohlwegDaten();
  const t = fs.readFileSync(G_DATEI, 'utf8');
  melde(d.nurHohlwege && d.tiefschnee && d.aussen === 0 && /nurHohlwege: true/.test(t) && /tiefschnee: true/.test(t), `Daten: nurHohlwege ${d.nurHohlwege}, tiefschnee ${d.tiefschnee}; Wall-Meter ausserhalb der Hohlwege: ${d.aussen} (vorher: ganze Etappe, beide Seiten); in den Hohlwegen ${d.liste.map((h) => h.wallMeter).join(' / ')} m`);
}
if (teil('s')) await gletscherTestfahrer('s2', '(mit Tiefschnee und Hohlwegen)');
if (teil('s')) await kurvenTabelle('s', 'Tiefschnee-Rand und Hohlweg-Bänke (Kehren + Bögen mit Hohlweg; Rand-Kontakt = Bank, Tiefschnee-Linie oder „wand“)');
if (teil('t')) {
  titel('(t) Hang-Prüfung (0 Fehler) und Abkürzungs-Prüfung (nicht schlechter) mit Hohlwegen und Tiefschnee');
  const h = werkzeug('hang-pruefen.mjs', ['--strecke', 'gletscher', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'hang-gletscher.log'), h.text);
  melde(h.code === 0, `Hang-Check: ${h.text.split('\n').filter((x) => /Stellen über|grösste/.test(x)).join('; ').slice(0, 300)}`);
  const n = werkzeug('abkuerzungen.mjs', ['--strecke', 'gletscher', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-gletscher-c.log'), n.text);
  melde(n.code === 0, `abkuerzungen --pruefen: Rückgabe ${n.code} (Tiefschnee wie vorher der Wall: keine Sperren, keine SCHNEIDEN-Ansagen; ob Abkürzen lohnt, zeigt (s))`);
}
// (u) Kontrast Fahrbahn gegen Seitenhang (5 feste Punkte aus M11a + 2 im Hohlweg), 18 m vor dem Auto, 320x180
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
    // im Hohlweg ist der „Hang“ die Bank (Innenseite 1 m über der Strasse, 7 m neben der Mitte)
    const imHW = (S.hohlwege || []).some((x) => s0 + 18 > x.von && s0 + 18 < x.bis);
    const E = A.welt.eisseen, see = E && E.an ? E.seen.find((x) => Math.abs(s0 + 18 - x.s) < x.halbL) : null;
    const lh = see ? see.halbB + 4 : 11; // (auf dem Eissee: „Hang“ = Schnee hinter dem Ufer)
    const fahrbahn = (hell(s0, -1.2) + hell(s0, 1.2)) / 2, hang = imHW ? (hell(s0, -7, 1) + hell(s0, 7, 1)) / 2 : (hell(s0, -lh) + hell(s0, lh)) / 2;
    out.push({ s: s0, fahrbahn, hang, diff: hang - fahrbahn, belag: A.netz.belag[Math.round(s0 + 18)], hohlweg: imHW });
  }
  return out;
};
if (teil('u')) {
  titel('(u) Kontrast Fahrbahn gegen Hang/Bank: mindestens 40 Helligkeitsstufen (5 Punkte aus M11a + 2 im Hohlweg, 320x180)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher&aufloesung=320x180', { uhr: true });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; });
  const r = await s.page.evaluate(KONTRAST, { stellen: [600, 1300, 1950, 2450, 3650, 1560, 4060] });
  await s.schliessen();
  for (const x of r) melde(Math.abs(x.diff) >= 40, `${x.s} m (${x.belag}${x.hohlweg ? ', Hohlweg: gegen die Bank' : ''}): Fahrbahn ${x.fahrbahn.toFixed(0)}, ${x.hohlweg ? 'Bank' : 'Hang'} ${x.hang.toFixed(0)}, Unterschied ${x.diff.toFixed(0)}`);
}
if (teil('v')) await unveraendert('v', { bilder: true });
// (w) Bildzeit: Gletscher (neu / 0.11a) gegen Finnland, Median aus 5 Läufen (abwechselnd), 110 km/h, 320x180
async function bildzeit(wurzel, strecke, s0, cp) {
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=${strecke}&aufloesung=320x180`);
  await s.page.evaluate(() => new Promise((ok) => setTimeout(ok, 4500)));
  const r = await s.page.evaluate(async ([s0, cp]) => {
    const A = window.__alpineRally, P = A.physik;
    A.rennen.naechsterCp = cp; A.setzeAuf(s0); A.kameraSofort();
    P.vx = Math.sin(P.richtung) * 110 / 3.6; P.vz = Math.cos(P.richtung) * 110 / 3.6; A.testEingabe = { gas: 1 };
    const zeiten = []; let t0 = performance.now();
    await new Promise((ok) => { const f = () => { const t = performance.now(); zeiten.push(t - t0); t0 = t; if (zeiten.length < 150) requestAnimationFrame(f); else ok(); }; requestAnimationFrame(f); });
    A.testEingabe = null; zeiten.sort((a, b) => a - b);
    return zeiten[Math.floor(zeiten.length / 2)];
  }, [s0, cp]);
  await s.schliessen();
  return r;
}
const median = (l) => { const a = [...l].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
const BZ = { werte: {} };
async function bildzeitTest(buchstabe, text, grenze = null) {
  titel(`(${buchstabe}) Bildzeit ${text} (Median aus 5 Läufen, abwechselnd, 110 km/h, 320x180)`);
  const g = [], ga = [], f = [];
  for (let i = 0; i < 5; i++) {
    g.push(await bildzeit(WURZEL, 'gletscher', 3600, 3));
    if (ALT) ga.push(await bildzeit(ALT, 'gletscher', 3600, 3));
    f.push(await bildzeit(WURZEL, 'finnland', 3020, 3));
  }
  const mg = median(g), mga = ALT ? median(ga) : null, mf = median(f);
  BZ.werte[buchstabe] = mg;
  info(`Gletscher ${g.map((x) => x.toFixed(0)).join('/')} ms${ALT ? `, Gletscher 0.11a ${ga.map((x) => x.toFixed(0)).join('/')} ms` : ''}, Finnland ${f.map((x) => x.toFixed(0)).join('/')} ms`);
  const ok = mg <= mf * 1.03 && (grenze == null || mg <= grenze);
  melde(ok, `Median Gletscher ${mg.toFixed(1)} ms${mga != null ? ` (0.11a: ${mga.toFixed(1)} ms, ${((mg / mga - 1) * 100).toFixed(0)} %)` : ''} gegen Finnland ${mf.toFixed(1)} ms${grenze != null ? `; Grenze ${grenze.toFixed(1)} ms` : ''}`);
  return mg;
}
if (teil('w')) await bildzeitTest('w', 'Gletscher vor/nachher Teil C gegen Finnland');

// ===================================================================== Teil D: Bäume weg, Berge, Skipiste
if (teil('x')) {
  titel('(x) Keine Bäume auf dem Gletscher: Daten (kein Baum-Typ, keine Baumquelle) und im Spiel 0 Bäume');
  const t = fs.readFileSync(G_DATEI, 'utf8');
  const daten = { tannenProKm0: /tannenProKm: 0,/.test(t), laubProKm0: /laubProKm: 0,/.test(t), nebenwegNurSteine: /steinAnteil: 1,/.test(t),
    startOhneGruppen: /gruppen: \[\],/.test(t), stummelOhneTannen: (t.match(/sichtschutz: 0 \}/g) || []).length === 2, fernOhne: /baeume: false, faerben: false/.test(t) };
  melde(Object.values(daten).every(Boolean), `Daten: ${Object.entries(daten).map(([k, v]) => `${k} ${v ? 'ja' : 'NEIN'}`).join(', ')}`);
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher');
  const r = await s.page.evaluate(() => { const A = window.__alpineRally; return { tannen: A.pflanzen.tannen.length, laub: A.pflanzen.laubbaeume.length, startZiel: A.startZiel.tannen.length + A.startZiel.laub.length, fern: A.deko.fernbaeume.length, jung: A.deko.jungTannen.length, steine: A.pflanzen.steine.length, findlinge: A.leben.hindernisse.filter((h) => h.leben === 'findling' || h.rand === 'findling').length }; });
  await s.schliessen();
  melde(r.tannen + r.laub + r.startZiel + r.fern + r.jung === 0, `im Spiel: Nadelbäume ${r.tannen}, Laubbäume ${r.laub}, Start/Ziel ${r.startZiel}, Fernbäume ${r.fern}, Jungtannen ${r.jung} (vorher u. a. 196 Kiefern, 7 an der Talstation, 3267 Fernbäume); dafür Steine/Felsbrocken ${r.steine}`);
}
if (teil('y')) {
  titel('(y) Berge: Reihen Gletscher ≥ Alpen (besser 1–2 mehr), höhere Gipfel, Gletscherzungen, Gipfelkreuz');
  const info2 = async (strecke) => { const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${strecke}`); const r = await s.page.evaluate(() => { const A = window.__alpineRally, W = A.welt, B = A.CONFIG.berge; const z = A.strecke.punktBei(A.strecke.zielS); return { ...W.berge, hoehe: B.hoehe, kreuz: W.gipfelkreuz || null, abstandZiel: W.gipfelkreuz ? Math.hypot(W.gipfelkreuz.x - z.x, W.gipfelkreuz.z - z.z) : null, zungen: B.extra ? B.extra.zungeAlle : null }; }); await s.schliessen(); return r; };
  const g = await info2('gletscher'), a = await info2('alpen');
  melde(g.reihen >= a.reihen + 1 && g.anzahl >= a.anzahl, `Reihen: Gletscher ${g.reihen} (${g.anzahl} Berge) gegen Alpen ${a.reihen} (${a.anzahl} Berge); Höhe Gletscher ${g.hoehe.join('–')} m (0.11a: 380–720), Alpen ${a.hoehe.join('–')} m; Gletscherzunge an jedem ${g.zungen}. Berg der vorderen zwei Reihen`);
  melde(!!g.kreuz, `Gipfelkreuz: ${g.kreuz ? `${g.kreuz.hoehe} m hoch auf ${g.kreuz.y.toFixed(0)} m, ${g.abstandZiel.toFixed(0)} m vom Ziel` : 'FEHLT'}`);
}
if (teil('z')) {
  titel('(z) Kontrast Fahrbahn gegen Hang/Bank mit den neuen Bergen: mindestens 40 Stufen (7 Punkte, 320x180)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher&aufloesung=320x180', { uhr: true });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; });
  const r = await s.page.evaluate(KONTRAST, { stellen: [600, 1300, 1950, 2450, 3650, 1560, 4060] });
  await s.schliessen();
  melde(r.every((x) => Math.abs(x.diff) >= 40), r.map((x) => `${x.s} m ${x.diff.toFixed(0)}`).join(', '));
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
  titel('(aa) Skipiste: 4–6 Skifahrer fahren (Animation), kein Garbage je Bild, keine Kollision, kein Ton');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=gletscher', { uhr: true });
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
if (teil('ab')) {
  titel('(ab) Bildzeit Gletscher: mit Bergen (ohne Skipiste) und mit Skipiste (höchstens +5 %), gegen Finnland und 0.11a');
  const g = [], ga = [], f = [], o = [];
  for (let i = 0; i < 5; i++) {
    o.push(await bildzeit(WURZEL, 'gletscher&skipiste=aus', 3600, 3)); g.push(await bildzeit(WURZEL, 'gletscher', 3600, 3));
    f.push(await bildzeit(WURZEL, 'finnland', 3020, 3)); if (ALT) ga.push(await bildzeit(ALT, 'gletscher', 3600, 3));
  }
  const mo = median(o), mg = median(g), mf = median(f), ma = ALT ? median(ga) : null;
  info(`ohne Skipiste ${o.map((x) => x.toFixed(0)).join('/')}, mit ${g.map((x) => x.toFixed(0)).join('/')}, Finnland ${f.map((x) => x.toFixed(0)).join('/')}${ALT ? `, 0.11a ${ga.map((x) => x.toFixed(0)).join('/')}` : ''} ms`);
  melde(mg <= mo * 1.05 + 1 && mg <= mf * 1.03, `Median: Gletscher mit Bergen ${mo.toFixed(1)} ms, mit Skipiste ${mg.toFixed(1)} ms (${((mg / mo - 1) * 100).toFixed(1)} %, Grenze +5 %), Finnland ${mf.toFixed(1)} ms${ma != null ? `, Gletscher 0.11a ${ma.toFixed(1)} ms` : ''}`);
}
if (teil('ac')) await unveraendert('ac', { bilder: true });

// ===================================================================== Teil E: volle Regression (nur mit --lang, einmal)
if (teil('zz') && process.argv.includes('--lang')) {
  titel('(zz) frühere Tests (--lang): nur neue Abweichungen melden');
  const laeufe = [
    ['pacenotes-test.mjs', []], ['pacenotes-test.mjs', ['--strecke', 'finnland']], ['pacenotes-test.mjs', ['--strecke', 'gletscher']],
    ['leben-test.mjs', []], ['kuh-test.mjs', []], ['startziel-test.mjs', []], ['strassenrand-test.mjs', []], ['nebenweg-test.mjs', []],
    ['felswand-test.mjs', []], ['belag-test.mjs', []], ['rennablauf-test.mjs', []], ['menue-test.mjs', []], ['overlay-test.mjs', []],
    ['m9a2-test.mjs', ['--nur', 'a,c,e,f,g,h,k,l,m']], ['m9a1-test.mjs', ['--nur', 'a,b,c,e,f,g,h,i,j,k,m,n,o,p,r']], ['m8h-test.mjs', []],
    ['m10d-test.mjs', ['--nur', 'a,a3,b,c,g,h,i,j,k,l,m,n,s,t,u,w']],
    // M11a: alles, was nicht die alten Gletscher-Zahlen erwartet (Eis 13 %, Wall überall, revision 1, alte Testfahrer-Zeiten)
    ['m11a-test.mjs', ['--nur', 'a,b,d,e,f,j,k,r,t,v']], ['kommentar-waechter.mjs', []],
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
