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

// ===================================================================== Zusammenfassung (Teile B bis E folgen)
console.log('\n| Test | Ergebnis |\n|---|---|');
for (const e of ergebnisse) console.log(`| ${e.titel.slice(0, 120)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);
