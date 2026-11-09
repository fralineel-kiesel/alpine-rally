// Meilenstein 11a prüfen:  node tools/m11a-test.mjs [--alt <ordner 0.10d>] [--nur a,b,...] [--lang]
// (0.10d: git worktree add <ordner> 40c41f3). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein
// Gamepad, Ton nur gemessen (nicht gehört). Vorlage: tools/m10d-test.mjs.
//   Teil A – Kleinigkeiten aus M10d: (a) Zielbildschirm passt ohne Rollen (alle Fenstergrössen, Alpen und Finnland, Reserve),
//       (b) die zwei umgestellten Alt-Tests (pacenotes 981 m, menue Credits) sind grün
//   Teil B – Schnee und Eis: (d) Bremsweg, (e) Allrad vorn, (f) kein Escorta-Bonus, (g) Schotter/Asphalt bit-gleich,
//       (h) Schneewall, (i) Kurven-Vergleich Schneewall, (j) Ton
//   Teil C – Gletscher (M11b: entfernt, siehe unten): (k) Prüfer, (l) Länge/Anteile, (m) Testfahrer, (n) Abkürzung/Hang, (o) Kontrast, (p) Kurven-Vergleich,
//       (q) Sprünge, (r) nicht beim Start geladen, (s) Bildzeit
//   Teil D – (t) Etappenwahl, (u) Bestzeiten, (v) Demo, Unveränderlich (x), (zz) nur mit --lang: frühere Tests (einmal)

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null; // 0.10d
let fehler = 0;
const ergebnisse = [];
let aktuell = null;
const titel = (t) => { console.log(t); aktuell = { titel: t, ok: 0, rot: 0 }; ergebnisse.push(aktuell); };
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; if (aktuell) aktuell[ok ? 'ok' : 'rot']++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m11a';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M11A_AUTOS ? process.env.M11A_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
if (!ALT) info('Vergleiche gegen 0.10d nur mit --alt <ordner> (git worktree add <ordner> 40c41f3)');

// Spiel öffnen
async function oeffne(wurzel, adresse = '', { auto, breite = 640, hoehe = 360, geraet, speicher = null, uhr = false } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, ...(auto ? { auto } : {}), ...(geraet ? { geraet } : {}) });
  s.fehler = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  // uhr: eigene Bild-Uhr (window.__bild(n, dt)), damit Bilder pixelgleich vergleichbar sind (wie m10d-test)
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
// höchstens n Aufgaben gleichzeitig (Browser je Aufgabe)
async function parallel(aufgaben, n = 3) {
  const out = new Array(aufgaben.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < aufgaben.length) { const k = i++; out[k] = await aufgaben[k](); } }));
  return out;
}
const FENSTER = [[402, 874, true], [874, 402, true], [640, 360, false], [640, 360, true], [1280, 720, false]];
const TOUCH = { hasTouch: true, isMobile: true, deviceScaleFactor: 1 };

// ===================================================================== Teil A
// (a) Zielbildschirm im ungünstigsten Fall: beide Platz-Zeilen, NICHT GESPEICHERT, Sprung-Zeilen mit REKORD, alle
// Zwischenzeiten mit Unterschied; dazu "vorsorglich": so viele Pixel bleiben frei (Ziel: 2 bis 3 Zeilen à 9 Pixel)
const ZIEL_VOLL = async ([sprache, mehrCps]) => {
  const A = window.__alpineRally, TX = await import('/js/texte.js');
  TX.setzeSprache(sprache);
  const n = A.checkpoints.length + mehrCps, cps = Array.from({ length: n }, (_, i) => 30 + 40 * i);
  const voll = {
    zeit: 199.99, cps, auto: 'imprexa', aufpralle: 12, resets: 3, hoechstTempo: 52.7,
    platz: 2, anzahl: 2, bisher: { zeit: 188.88, cps: cps.map((c) => c - 0.5) }, gespeichert: false, neueBest: false,
    gesamtPlatz: 3, gesamtBisher: { zeit: 150 }, gesamtRekord: false,
    spruenge: { anzahl: 4, weitester: 38.4, hoechster: 3.2, laengste: 1.8, rekord: true, ersterRekord: false, rekordBisher: 30 },
  };
  A.lauf.ergebnis = voll;
  if (A.ablauf.zustand !== 'ziel') {
    // wie m8h-test: kurz vor dem Ziel einsetzen, über die Linie rollen, bis der Zielbildschirm kommt
    const L = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
    const erg = A.lauf.ergebnis;
    A.anhalten = true; A.start({ countdown: false }); A.setzeAuf(A.strecke.zielS - 30);
    const p = A.physik; p.vx = Math.sin(p.richtung) * 20; p.vz = Math.cos(p.richtung) * 20; p.vVor = 20;
    A.rennen.zustand = 'laeuft'; A.rennen.zwischenzeiten = cps.slice(); A.rennen.naechsterCp = A.checkpoints.length;
    for (let k = 0; k < 2000 && A.rennen.zustand !== 'ziel'; k++) A.physikSchritt(A.SCHRITT, { ...L, gas: 0.5 });
    A.rennen.endZeit = 199.99; A.rennen.zeit = 199.99; A.rennSchritt(A.SCHRITT, L);
    for (let k = 0; A.ablauf.zustand !== 'ziel' && k < 5000; k++) A.rennSchritt(A.SCHRITT, L);
    A.lauf.ergebnis = erg;
  }
  A.menue.neuZeichnen();
  await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  const m = A.menue.rollen, tr = A.menue.treffer.map((t) => [t.x, t.y, t.b, t.h]);
  let ueber = 0;
  for (let i = 0; i < tr.length; i++) for (let j = i + 1; j < tr.length; j++) { const [ax, ay, ab, ah] = tr[i], [bx, by, bb, bh] = tr[j]; if (ax < bx + bb && bx < ax + ab && ay < by + bh && by < ay + ah) ueber++; }
  const out = { cps: n, x: Math.round((320 - m.breite) / 2), y: m.y0, b: m.breite, h: m.hoehe, rollen: m.max, gesamt: m.gesamt, sichtH: m.sichtH, ueber };
  TX.setzeSprache('de');
  return out;
};

if (teil('a')) {
  titel('(a) Zielbildschirm passt ohne Rollen (ungünstigster Fall, alle Fenstergrössen, Alpen und Finnland, de/en)');
  for (const strecke of ['alpen', 'finnland']) {
    const zeilen = [];
    let ok = true, reserve = Infinity;
    for (const [b, h, touch] of FENSTER) {
      const s = await oeffne(WURZEL, `?strecke=${strecke}&menue=aus`, { breite: b, hoehe: h, ...(touch ? { geraet: TOUCH } : {}) });
      for (const sp of ['de', 'en']) {
        const r = await s.page.evaluate(ZIEL_VOLL, [sp, 0]);
        const passt = r.rollen === 0 && r.x >= 0 && r.y >= 0 && r.x + r.b <= 320 && r.y + r.h <= 180 && r.ueber === 0;
        ok = ok && passt; reserve = Math.min(reserve, r.sichtH - r.gesamt + (180 - 8 - r.h));
        if (!passt || (sp === 'de' && b === 640 && !touch)) zeilen.push(`${b}x${h}${touch ? ' Touch' : ''} ${sp}: ${r.cps} CP, Tafel ${r.b}x${r.h} bei ${r.x},${r.y}, Inhalt ${r.gesamt} px${r.rollen ? `, ROLLT ${r.rollen}` : ''}${r.ueber ? `, ${r.ueber} Überlappungen` : ''}`);
      }
      // ein Bild (Alpen, 640x360, deutsch, nur die Tafel) zur Sichtprüfung
      if (strecke === 'alpen' && b === 640 && !touch) {
        const r = await s.page.evaluate(ZIEL_VOLL, ['de', 0]);
        fs.mkdirSync(path.join(WURZEL, 'screenshots/m11a'), { recursive: true });
        await s.page.screenshot({ path: path.join(LOG, 'zielbildschirm.png'), clip: { x: r.x * 2, y: r.y * 2, width: r.b * 2, height: r.h * 2 } });
      }
      // vorsorglich: mit 2 Zwischenzeiten mehr (= 1 Zeile, zweispaltig) passt es noch?
      if (b === 640 && !touch) {
        const r = await s.page.evaluate(ZIEL_VOLL, ['de', 2]);
        zeilen.push(`mit ${r.cps} CP (vorsorglich): Inhalt ${r.gesamt} px${r.rollen ? `, ROLLT ${r.rollen}` : ', rollt nicht'}`);
        ok = ok && r.rollen === 0;
      }
      melde(s.fehler.length === 0, `${strecke} ${b}x${h}: Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
      await s.schliessen();
    }
    melde(ok && reserve >= 18, `${strecke}: nirgends gerollt, Tafel im Bild, nichts überlappt; frei im ungünstigsten Fall ${reserve} px (Ziel ≥ 18 = 2 Zeilen); ${zeilen.join('; ')}`);
  }
}

// (b) die zwei umgestellten Alt-Tests (begründet im Bericht): pacenotes-test (c) und menue-test (j)
if (teil('b')) {
  titel('(b) umgestellte Alt-Tests: pacenotes-test (Messfahrt ohne Wand-Strafe), menue-test (Credits aus config.js)');
  for (const [datei, muster] of [['pacenotes-test.mjs', /\(c\)/], ['menue-test.mjs', /Deutsch: MITWIRKENDE|Englisch: CONTRIBUTORS/]]) {
    const r = werkzeug(datei);
    fs.writeFileSync(path.join(LOG, datei.replace('.mjs', '.log')), r.text);
    const z = r.text.split('\n').filter((x) => muster.test(x));
    const rot = r.text.split('\n').filter((x) => /^\s*FEHLER/.test(x));
    melde(z.length >= 2 && z.every((x) => /^\s*(ok|OK)\s/.test(x)) && rot.length === 0, `${datei}: ${z.map((x) => x.trim().slice(0, 110)).join(' | ')}; rot insgesamt ${rot.length}`);
  }
}

// ===================================================================== Teil B: Schnee und Eis
// (d), (e), (f): Kurzmessungen ohne Browser (tools/schnee-messung.mjs, echte Physik und Getriebe)
let SM = null;
const schneeMessen = async () => { if (!SM) SM = (await import('./schnee-messung.mjs')).schneeMessung(WURZEL); return SM; };
const ALLRAD = ['rt4', 'delto', 'imprexa'], HINTERRAD = ['escorta', 'l073'];
if (teil('d')) {
  titel('(d) Bremsweg 100 -> 0 km/h gegen Schotter: Schnee ca. 1.5, Eis ca. 2.8 (±15 %), alle 5 Autos');
  const e = await schneeMessen();
  const zeilen = [];
  let ok = true;
  for (const id of AUTOS) {
    const r = e[id], vs = r.schnee.bremsweg / r.schotter.bremsweg, ve = r.eis.bremsweg / r.schotter.bremsweg;
    ok = ok && Math.abs(vs / 1.5 - 1) <= 0.15 && Math.abs(ve / 2.8 - 1) <= 0.15;
    zeilen.push(`${id} Schotter ${r.schotter.bremsweg.toFixed(1)} m, Schnee ${r.schnee.bremsweg.toFixed(1)} m (${vs.toFixed(2)}), Eis ${r.eis.bremsweg.toFixed(1)} m (${ve.toFixed(2)})`);
  }
  melde(ok, zeilen.join('; '));
  fs.writeFileSync(path.join(LOG, 'schnee-messung.md'), (await import('./schnee-messung.mjs')).messText(e));
  info(`Tabelle: ${LOG}/schnee-messung.md`);
}
if (teil('e')) {
  titel('(e) Vortrieb auf Schnee (0-60 km/h): alle Allrad-Autos vor allen Hinterrad-Autos');
  const e = await schneeMessen(), t = (id, b) => e[id][b].null60;
  const langsamsterAllrad = Math.max(...ALLRAD.map((id) => t(id, 'schnee'))), schnellsterHinten = Math.min(...HINTERRAD.map((id) => t(id, 'schnee')));
  melde(langsamsterAllrad < schnellsterHinten, `Schnee 0-60: ${AUTOS.map((id) => `${id} ${t(id, 'schnee').toFixed(2)} s`).join(', ')}; Eis 0-60: ${AUTOS.map((id) => `${id} ${t(id, 'eis').toFixed(2)} s`).join(', ')}`);
  const kreis = (b) => AUTOS.map((id) => `${id} ${e[id][b].kreis.toFixed(1)}`).join(', ');
  info(`Kreis R50 (km/h) Schotter: ${kreis('schotter')}; Schnee: ${kreis('schnee')}; Eis: ${kreis('eis')}`);
}
if (teil('f')) {
  titel('(f) Fard Escorta: kein Schotter-Bonus auf Schnee/Eis (Griff/Traktion wie ein Hinterrad-Auto ohne Schotter-Werte)');
  // Gegenprobe: Escorta mit abgeschalteten schotter*-Werten muss auf Schnee/Eis genau gleich fahren
  const lade = (d) => import(path.join(WURZEL, 'js', d));
  const { CONFIG } = await lade('config.js'), fp = await lade('fahrprofil.js');
  const { Fahrphysik } = await lade('physics.js'), { Getriebe } = await lade('getriebe.js');
  const { baueMessung } = await import('./fahrmessung.js');
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const mess = () => ['schnee', 'eis'].map((b) => [m.bremsweg(b, 100), m.beschleunigung(b, 60), m.kreisGrenze(50, b)].map((x) => x.toFixed(6)).join('/')).join(' | ');
  fp.waehleFahrprofil('escorta');
  const mit = mess();
  Object.assign(CONFIG.auto, { schotterGrip: 1, schotterHeck: 1, schotterTraktion: 1, schotterStabil: 1 });
  const ohne = mess();
  fp.waehleFahrprofil(fp.STANDARD_PROFIL);
  melde(mit === ohne, `Escorta Schnee | Eis (Bremsweg/0-60/Kreis): mit Schotter-Werten ${mit} = ohne ${ohne}; schneeGrip ${CONFIG.fahrprofile.escorta.auto.schneeGrip}, eisGrip ${CONFIG.fahrprofile.escorta.auto.eisGrip}`);
}

// (g) Alpen und Finnland: Testfahrer-Läufe (alle Autos, alle Stile) genau gleich wie 0.10d
const STILE = ['vorsichtig', 'mittel', 'flott', 'digital', 'wand'];
function testfahrerLauf(strecke, auto, wurzel = WURZEL, stand = 'neu', extra = []) {
  const datei = path.join(LOG, `fahrt-${stand}-${path.basename(strecke, '.js')}-${auto}${extra.length ? `-${extra.join('').replace(/[^a-z0-9]/gi, '')}` : ''}.json`);
  if (fs.existsSync(datei) && !(stand === 'neu' && process.env.M11A_NEU)) return Promise.resolve(JSON.parse(fs.readFileSync(datei, 'utf8')));
  const a = [path.join(wurzel, 'tools', 'strecke-abfahren.mjs'), strecke.includes('/') ? strecke : path.join(wurzel, 'strecken', `${strecke}.js`), '--auto', auto, '--stil', STILE.join(','), '--json', datei, '--aus', datei.replace('.json', '.txt')];
  if (wurzel !== WURZEL) a.push('--wurzel', wurzel);
  a.push(...extra);
  return new Promise((ok, nein) => {
    import('node:child_process').then(({ spawn }) => {
      const k = spawn(process.execPath, a, { cwd: WURZEL });
      let txt = ''; k.stdout.on('data', (d) => { txt += d; }); k.stderr.on('data', (d) => { txt += d; });
      k.on('close', () => { if (!fs.existsSync(datei)) { console.log(txt.slice(-1500)); nein(new Error(`strecke-abfahren ${strecke} ${auto} ${stand}`)); } else ok(JSON.parse(fs.readFileSync(datei, 'utf8'))); });
    });
  });
}
const fmtZ = (t) => (t == null ? 'NICHT IM ZIEL' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);
// zeitBei relativ zum ersten Wert (der absolute Anfang hängt an der Ladezeit, wie in m10d-test)
const relativ = (l) => { const a = (l || []).find((x) => x >= 0); return (l || []).map((x) => (x < 0 ? x : +(x - a).toFixed(9))); };
const kern = (x) => JSON.stringify({ zeit: x.zeit, cps: x.cps, aufpralle: x.aufpralle, aufprallListe: x.aufprallListe, zeitBei: relativ(x.zeitBei), wand: (x.wandKontakte || []).length, strafen: (x.motorStrafen || []).length, spruenge: x.spruenge });
if (teil('g')) {
  titel('(g) Alpen und Finnland: Testfahrer-Läufe genau gleich wie 0.10d (alle 5 Autos, alle 5 Stile, Zeit, Zwischenzeiten, Zeit je 10 m, Aufpralle, Sprünge)');
  if (!ALT) melde(false, 'nur mit --alt <ordner 0.10d>');
  else for (const strecke of ['alpen', 'finnland']) {
    const paare = await parallel(AUTOS.flatMap((id) => [() => testfahrerLauf(strecke, id), () => testfahrerLauf(strecke, id, ALT, 'alt')]), 4);
    const anders = [];
    let n = 0;
    AUTOS.forEach((id, k) => {
      const neu = paare[2 * k], alt = paare[2 * k + 1];
      for (const stil of STILE) { n++; const x = neu.stile.find((q) => q.stil === stil), y = alt.stile.find((q) => q.stil === stil); if (kern(x) !== kern(y)) anders.push(`${id}/${stil} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)}`); }
    });
    melde(anders.length === 0 && n === 25, `${strecke}: ${n - anders.length} von ${n} Läufen bit-gleich${anders.length ? ` – ANDERS: ${anders.join('; ')}` : ''}`);
  }
}

// (h) Schneewall: gerade Teststrasse im Browser (echte Physik, Schnee), Auto fährt schräg in den Wall
const WALL_TEST = async () => {
  const A = window.__alpineRally, C = A.CONFIG;
  const { baueSchneewall } = await import('/js/schneewall.js');
  const { baueMessung } = await import('/tools/fahrmessung.js');
  const { Fahrphysik } = await import('/js/physics.js'), { Getriebe } = await import('/js/getriebe.js');
  const m = baueMessung({ CONFIG: C, Fahrphysik, Getriebe });
  // gerade Strasse nach +z, 1 m je Punkt
  const N = 600, px = new Float64Array(N), pz = new Float64Array(N), py = new Float64Array(N), tx = new Float64Array(N), tz = new Float64Array(N).fill(1);
  for (let i = 0; i < N; i++) pz[i] = i;
  const strecke = { anzahl: N, px, py, pz, tx, tz, wandSeite: new Int8Array(N) };
  const netz = { halbBei: () => C.belaege.schnee.breite / 2, aeste: [] };
  const welt = { gelaendeHoehe: () => 0 };
  const alt = C.strassenrand.schneewall; C.strassenrand.schneewall = { an: true };
  const sw = baueSchneewall(strecke, netz, welt);
  C.strassenrand.schneewall = alt;
  const abfrage = (p) => ({ i: Math.max(0, Math.min(N - 1, Math.round(p.z))), seite: -p.x, tx: 0, tz: 1 }); // rechts = -x
  const kante = sw.kante[100], SW = C.schneewall, b = m.boden('schnee'), DT = m.DT;
  const fahrt = (kmh, winkelGrad, sek, eingabe) => {
    const p = m.auto(kmh / 3.6);
    p.z = 50; const w = -winkelGrad * Math.PI / 180; p.richtung = w; p.vx = Math.sin(w) * kmh / 3.6; p.vz = Math.cos(w) * kmh / 3.6;
    p.x = -(kante - SW.autoHalb - 0.05); // knapp vor dem rechten Wall
    let tMax = 0, kontaktT = 0, vEin = null, v1 = null, raus = null, minV = 1e9;
    for (let t = 0; t < sek; t += DT) {
      m.schritt(p, eingabe(t), b);
      const r = sw.wirke(p, abfrage(p), DT);
      if (r) { if (vEin == null) vEin = p.tempo; kontaktT += DT; tMax = Math.max(tMax, r.tiefe); if (v1 == null && kontaktT >= 1 - 1e-9) v1 = p.tempo; }
      else if (vEin != null && raus == null) raus = { t: kontaktT, v: p.tempo * 3.6 };
      minV = Math.min(minV, p.tempo);
    }
    return { vEin: vEin && vEin * 3.6, v1: v1 && v1 * 3.6, kontakt: kontaktT, tiefeMax: tMax, raus, minV: minV * 3.6, ende: p.tempo * 3.6, x: p.x };
  };
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false };
  const out = {};
  // 1. Rollen ohne Gas schräg hinein (15° / 30°): Verlust in der ersten Sekunde, Tiefe, rutscht heraus
  out.roll15 = fahrt(80, 15, 4, () => LEER);
  out.roll30 = fahrt(80, 30, 4, () => LEER);
  // 2. mit Vollgas geradeaus weiter in den Wall (lenkt nicht weg): wird gebremst, bleibt nicht stecken (rutscht entlang)
  out.gas = fahrt(80, 20, 4, () => ({ ...LEER, gas: 1 }));
  // 3. frontal (80°) mit 60 km/h, danach rückwärts (Bremse halten = rückwärts)
  out.frontal = fahrt(60, 80, 1.5, () => LEER);
  const p = m.auto(0); p.z = 50; p.richtung = -Math.PI / 2; p.x = -(kante - SW.autoHalb + SW.tiefeMax); // ganz tief im Wall, steht, Nase in den Wall
  let x0 = p.x;
  for (let t = 0; t < 2; t += DT) { m.schritt(p, { ...LEER, bremse: 1 }, b); sw.wirke(p, abfrage(p), DT); }
  out.rueck = { weg: Math.abs(p.x - x0), tiefe: -p.x + SW.autoHalb - kante };
  // 4. stehend tief im Wall ohne Eingabe: Feder schiebt heraus
  const p2 = m.auto(0); p2.z = 50; p2.x = -(kante - SW.autoHalb + SW.tiefeMax); x0 = p2.x;
  for (let t = 0; t < 3; t += DT) { m.schritt(p2, LEER, b); sw.wirke(p2, abfrage(p2), DT); }
  out.feder = { tiefe: -p2.x + SW.autoHalb - kante };
  out.dreiecke = sw.dreiecke; out.SW = { tiefeMax: SW.tiefeMax, verlust: SW.verlustJeSek };
  return out;
};
if (teil('h')) {
  titel('(h) Schneewall: bremst deutlich (40-50 %/s), taucht ein und rutscht heraus, kein Stillstand, kein Steckenbleiben, keine Strafe');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  const r = await s.page.evaluate(WALL_TEST);
  const f = (x) => (x == null ? '--' : x.toFixed(1));
  const verl = (q) => 1 - q.v1 / q.vEin;
  for (const [k, q] of Object.entries({ 'rollen 15°': r.roll15, 'rollen 30°': r.roll30, 'Vollgas 20°': r.gas })) {
    // rollen: 40-50 % je Sekunde (±10 % wegen Eintauchen/Schlucken), Vollgas: mindestens 25 % (der Motor schiebt dagegen)
    const grenze = k.startsWith('Vollgas') ? [0.25, 0.6] : [0.35, 0.6];
    const ok = q.raus && (q.v1 == null || (verl(q) >= grenze[0] && verl(q) <= grenze[1]));
    melde(ok && q.tiefeMax <= r.SW.tiefeMax + 0.01 && q.ende > 5, `${k}, 80 km/h: hinein mit ${f(q.vEin)} km/h, nach 1 s Kontakt ${f(q.v1)} km/h (${q.v1 != null ? `${(verl(q) * 100).toFixed(0)} % weniger` : 'schon wieder draussen'}), tiefste Stelle ${q.tiefeMax.toFixed(2)} m (max ${r.SW.tiefeMax}), ${q.raus ? `nach ${q.raus.t.toFixed(2)} s Kontakt wieder draussen mit ${f(q.raus.v)} km/h` : 'NICHT HERAUS'}, am Ende ${f(q.ende)} km/h`);
  }
  melde(r.frontal.tiefeMax <= r.SW.tiefeMax + 0.01, `frontal (80°) mit 60 km/h: tiefste Stelle ${r.frontal.tiefeMax.toFixed(2)} m, nach 1.5 s ${f(r.frontal.ende)} km/h (kein Abprallen, kein Durchfahren)`);
  melde(r.rueck.weg > 1 && r.rueck.tiefe <= 0, `rückwärts aus dem Wall (steht 1 m tief, Bremse = rückwärts, 2 s): ${r.rueck.weg.toFixed(2)} m gefahren, danach ${r.rueck.tiefe <= 0 ? 'frei' : `noch ${r.rueck.tiefe.toFixed(2)} m tief`}`);
  melde(r.feder.tiefe < 0.3, `ohne Eingabe (steht 1 m tief, 3 s): die Feder schiebt das Auto heraus (Tiefe danach ${r.feder.tiefe.toFixed(2)} m)`);
  info(`Form: ${r.dreiecke} Dreiecke auf 600 m Teststrasse (beide Seiten). Keine Strafe: js/schneewall.js ruft js/wand.js nicht auf; im Rennen geprüft in Teil C (p).`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
  await s.schliessen();
}

// (j) Ton: Schnee knirscht (Kies-Schicht, tiefer), Eis zischt (Quietschen leise), Pause dämpft – offline gerechnet
const TON_TEST = async () => {
  const A = window.__alpineRally;
  const { baueKlangwerk } = await import('/js/audio.js');
  const w = baueKlangwerk(new OfflineAudioContext(1, 4410, 44100));
  let z0 = null;
  const orig = A.ton.aktualisiere;
  A.ton.aktualisiere = (dt, z) => { orig.call(A.ton, dt, z); z0 = z0 || JSON.parse(JSON.stringify(z)); };
  A.start({ countdown: false }); A.testEingabe = { gas: 1 };
  for (let i = 0; i < 60 && !z0; i++) await new Promise((ok) => setTimeout(ok, 50));
  A.testEingabe = null; A.ton.aktualisiere = orig;
  // Zielwerte der Audio-Parameter mitschreiben (offline läuft keine Zeit, .value bliebe beim Anfangswert)
  const ziel = new Map();
  for (const prm of [w.knoten.kiesBp.frequency, w.busse.reifenPause.gain]) { const o = prm.setTargetAtTime.bind(prm); prm.setTargetAtTime = (v, t, tau) => { ziel.set(prm, v); return o(v, t, tau); }; }
  const zw = (prm) => (ziel.has(prm) ? ziel.get(prm) : prm.value);
  const fall = (untergrund, drift, modus = 'rennen') => {
    const z = { ...z0, modus, untergrund, tempo: 20, vVor: 20, drift, inLuft: false };
    for (let i = 0; i < 40; i++) w.aktualisiere(1 / 60, z);
    const u = w.zustand, K = w.knoten;
    return { kies: u.kies, surren: u.surren, rutschen: u.rutschen, quietschen: u.quietschen, kiesHz: zw(K.kiesBp.frequency), pause: zw(w.busse.reifenPause.gain) };
  };
  return { schotter: fall('schotter', 0), schnee: fall('schnee', 0), eis: fall('eis', 0), schneeDrift: fall('schnee', 30), eisDrift: fall('eis', 30), schotterDrift: fall('schotter', 30), pause: fall('schnee', 30, 'pause') };
};
if (teil('j')) {
  titel('(j) Ton (offline): Schnee knirscht dumpf, Eis zischt leise beim Rutschen, Pause dämpft');
  const s = await oeffne(WURZEL, '?menue=aus');
  const r = await s.page.evaluate(TON_TEST).catch((e) => ({ fehler: String(e) }));
  if (r.fehler) melde(false, r.fehler);
  else {
    const f = (x) => x.toFixed(3);
    melde(r.schnee.kies > 0 && r.schnee.kies < r.schotter.kies && r.schnee.kiesHz < r.schotter.kiesHz, `Schnee: Knirschen ${f(r.schnee.kies)} (Schotter ${f(r.schotter.kies)}), Helligkeit ${r.schnee.kiesHz.toFixed(0)} Hz (Schotter ${r.schotter.kiesHz.toFixed(0)} Hz): tiefer und leiser`);
    melde(r.eis.kies === 0 && r.eis.surren > 0 && r.eisDrift.quietschen > 0 && r.eisDrift.rutschen === 0 && r.eisDrift.quietschen < r.schotterDrift.rutschen, `Eis: kein Knirschen, leises Surren ${f(r.eis.surren)}; beim Rutschen (30°) Zischen/Quietschen ${f(r.eisDrift.quietschen)} statt Knirschen (Schotter rutscht mit ${f(r.schotterDrift.rutschen)})`);
    melde(r.schneeDrift.rutschen > 0 && r.schneeDrift.rutschen < r.schotterDrift.rutschen, `Schnee rutschen (30°): ${f(r.schneeDrift.rutschen)} (weicher als Schotter ${f(r.schotterDrift.rutschen)})`);
    melde(r.pause.pause < r.schnee.pause, `Pause dämpft den Reifenton: Pausen-Regler ${f(r.pause.pause)} statt ${f(r.schnee.pause)}`);
  }
  await s.schliessen();
}

// ===================================================================== Teil C: Strecke Gletscher
// M11b: Die Etappe Gletscher ist entfernt (ersetzt durch das Skigebiet). (k) Prüfer, (l) Länge/Anteile, (m) Testfahrer,
// (n) Abkürzung/Hang, (o) Kontrast, (p)/(i) Kurven-Vergleich, (q) Sprünge und (s) Bildzeit prüften Gletscher-Zahlen:
// Erwartung alt, Gletscher entfernt -> gestrichen. Dieselben Prüfungen für das Skigebiet: tools/m11b-test.mjs.
// (r), (t), (u), (v) prüfen allgemeine Dinge (Laden bei Bedarf, Etappenwahl, Bestzeiten-Schlüssel, Demo) und laufen
// jetzt mit der dritten Etappe Skigebiet (Erwartung alt: Name/Länge des Gletschers -> angepasst).
const G_DATEI = path.join(WURZEL, 'strecken', 'skigebiet.js');
const G_LAENGE = Number(/laenge: ([\d.]+)/.exec(fs.readFileSync(G_DATEI, 'utf8'))[1]); // Länge aus der Datei (ändert sich mit dem Verlauf)
if (teil('r')) {
  titel('(r) Skigebiet wird nur geladen, wenn gewählt (Start, Alpen, Finnland laden ihn nicht)');
  const zeilen = []; let ok = true;
  for (const adresse of ['', '?strecke=alpen&menue=aus', '?strecke=finnland&menue=aus']) {
    const s = await starteSpiel({ breite: 640, hoehe: 360 });
    const geladen = []; s.page.on('request', (q) => { if (/strecken\//.test(q.url())) geladen.push(q.url().replace(/^.*strecken\//, '')); });
    await s.page.goto(`${s.url}/index.html${adresse}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    await new Promise((ok2) => setTimeout(ok2, 1500));
    ok = ok && !geladen.some((x) => x.startsWith('skigebiet'));
    zeilen.push(`${adresse || 'Start'}: ${[...new Set(geladen)].join(', ')}`);
    await s.schliessen();
  }
  melde(ok, zeilen.join('; '));
}

// ===================================================================== Teil D: Etappenwahl, Bestzeiten, Demo, Unveränderlich
const MENUE_LAYOUT = async (seiten) => {
  const A = window.__alpineRally, aus = {};
  A.zumMenue();
  for (const n of seiten) {
    A.menue.oeffne(A.seiten[n]);
    await new Promise((ok) => setTimeout(ok, 1500));
    for (let k = 0; k < 20 && !(A.menue.rollen && A.menue.rollen.hoehe); k++) { A.menue.neuZeichnen(); await new Promise((ok) => setTimeout(ok, 300)); }
    const m = A.menue.rollen, tr = A.menue.treffer.map((t) => [t.x, t.y, t.b, t.h]);
    let ueber = 0;
    for (let i = 0; i < tr.length; i++) for (let j = i + 1; j < tr.length; j++) { const [ax, ay, ab, ah] = tr[i], [bx, by, bb, bh] = tr[j]; if (ax < bx + bb && bx < ax + ab && ay < by + bh && by < ay + ah) ueber++; }
    const se = A.menue.seite, l = typeof se.eintraege === 'function' ? se.eintraege() : se.eintraege;
    aus[n] = { x: Math.round((320 - m.breite) / 2), y: m.y0, b: m.breite, h: m.hoehe, rollen: m.max, ueber, zeilen: l.filter((e) => e.etappeId).map((e) => e.etappeId), texte: l.filter((e) => e.etappeId).map((e) => e.inhalt()) };
    A.menue.zurueck();
  }
  return aus;
};
if (teil('t')) {
  titel('(t) Etappenwahl mit 3 Etappen: Layout in allen Fenstergrössen, Wählen mit Tastatur und Maus, gespeichert');
  for (const [b, h, touch] of FENSTER) {
    const s = await oeffne(WURZEL, '', { breite: b, hoehe: h, ...(touch ? { geraet: TOUCH } : {}) });
    const r = await s.page.evaluate(MENUE_LAYOUT, ['etappe', 'bestzeiten']);
    const ok = Object.values(r).every((m) => m.x >= 0 && m.y >= 0 && m.x + m.b <= 320 && m.y + m.h <= 180 && !m.rollen && m.ueber === 0) && r.etappe.zeilen.join() === 'alpen,finnland,skigebiet';
    melde(ok, `${b}x${h}${touch ? ' Touch' : ''}: Etappe ${r.etappe.b}x${r.etappe.h} bei ${r.etappe.x},${r.etappe.y} (${r.etappe.zeilen.join(', ')})${r.etappe.rollen ? ' ROLLT' : ''}, Bestzeiten ${r.bestzeiten.b}x${r.bestzeiten.h}${r.bestzeiten.rollen ? ' ROLLT' : ''}${r.etappe.ueber + r.bestzeiten.ueber ? ' ÜBERLAPPT' : ''}`);
    if (b === 640 && !touch) info(`Zeile Skigebiet: ${r.etappe.texte[2]}`);
    await s.schliessen();
  }
  // Tastatur: Menü ETAPPE, zweimal runter, Enter -> lädt neu mit Skigebiet, gespeichert
  const s = await oeffne(WURZEL, '');
  await s.page.evaluate(async () => { const A = window.__alpineRally; A.zumMenue(); A.menue.oeffne(A.seiten.etappe); await new Promise((ok) => setTimeout(ok, 1500)); });
  const k0 = await s.page.evaluate(() => window.__alpineRally.menue.seite.id);
  for (const t of ['ArrowDown', 'ArrowDown', 'Enter']) { await s.page.keyboard.press(t); await new Promise((ok) => setTimeout(ok, 300)); }
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.strecke && localStorage.getItem('alpineRally.etappe') === 'skigebiet', null, { timeout: 60000 }).catch(() => {});
  await new Promise((ok) => setTimeout(ok, 2000));
  const nach = await s.page.evaluate(() => ({ etappe: localStorage.getItem('alpineRally.etappe'), laenge: window.__alpineRally && window.__alpineRally.strecke.laenge, seite: window.__alpineRally && window.__alpineRally.menue.seite && window.__alpineRally.menue.seite.id }));
  melde(nach.etappe === 'skigebiet' && Math.abs(nach.laenge - G_LAENGE) < 1, `Tastatur (Seite ${k0}: 2x runter, Enter): gespeichert "${nach.etappe}", neu geladen mit ${nach.laenge && nach.laenge.toFixed(1)} m, danach Seite ${nach.seite}`);
  // Maus: Klick auf die Zeile ALPEN wählt die Alpen wieder
  await s.page.evaluate(async () => { const A = window.__alpineRally; A.zumMenue(); A.menue.oeffne(A.seiten.etappe); await new Promise((ok) => setTimeout(ok, 1500)); A.menue.neuZeichnen(); await new Promise((ok) => setTimeout(ok, 300)); });
  const ziel = await s.page.evaluate(() => { const A = window.__alpineRally, l = A.menue.seite.eintraege(), i = l.findIndex((e) => e.etappeId === 'alpen'), t = A.menue.treffer.find((x) => x.i === i) || A.menue.treffer[i]; const c = document.getElementById('menue') || document.getElementById('spiel'); const r = c.getBoundingClientRect(); return t ? { x: r.left + (t.x + t.b / 2) / 320 * r.width, y: r.top + (t.y + t.h / 2) / 180 * r.height } : null; });
  if (ziel) { await s.page.mouse.click(ziel.x, ziel.y); await new Promise((ok) => setTimeout(ok, 400)); await s.page.mouse.click(ziel.x, ziel.y); }
  await s.page.waitForFunction(() => localStorage.getItem('alpineRally.etappe') === 'alpen', null, { timeout: 30000 }).catch(() => {});
  const m2 = await s.page.evaluate(() => localStorage.getItem('alpineRally.etappe'));
  melde(m2 === 'alpen', `Maus (Klick auf ALPEN): gespeichert "${m2}"`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
  await s.schliessen();
}
if (teil('u')) {
  titel('(u) Bestzeiten: eigener Schlüssel Skigebiet (revision 1), Umschalter mit 3 Etappen, Alpen und Finnland unangetastet');
  // vorbefüllt: je eine Zeit Alpen (passstrasse-r2) und Finnland (finnland-r3), dann eine Skigebiet-Zeit speichern
  const s1 = await oeffne(WURZEL, '?menue=aus&ton=aus');
  const roh = await s1.page.evaluate(async () => {
    const B = await import('/js/bestzeiten.js'); localStorage.clear();
    B.speichereBestzeit('passstrasse-r2', { zeit: 170.5, cps: [50, 100, 150], auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 40, spur: [] });
    B.speichereBestzeit('finnland-r3', { zeit: 165.25, cps: [40, 80, 120, 150], auto: 'escorta', aufpralle: 1, resets: 0, hoechstTempo: 41, spur: [] });
    return localStorage.getItem('alpineRally.bestzeiten2');
  });
  await s1.schliessen();
  const s = await oeffne(WURZEL, '?ton=aus', { speicher: { 'alpineRally.bestzeiten2': roh, 'alpineRally.etappe': 'skigebiet' } });
  const r = await s.page.evaluate(async () => {
    const A = window.__alpineRally, B = await import('/js/bestzeiten.js'), E = await import('/js/etappenwahl.js');
    await E.ladeAlleInfos();
    const vorher = JSON.parse(localStorage.getItem('alpineRally.bestzeiten2'));
    B.speichereBestzeit(E.aktuelleInfo().etappe, { zeit: 214.1, cps: [40, 90, 140, 190], auto: 'delto', aufpralle: 0, resets: 0, hoechstTempo: 38, spur: [] });
    const nach = JSON.parse(localStorage.getItem('alpineRally.bestzeiten2'));
    A.zumMenue(); A.menue.oeffne(A.seiten.bestzeiten); await new Promise((ok) => setTimeout(ok, 800));
    const se = A.menue.seite, l = () => (typeof se.eintraege === 'function' ? se.eintraege() : se.eintraege);
    const wahl = l().find((e) => e.etappeWahl);
    const zeiten = () => l().filter((e) => e.inhalt).map((e) => e.inhalt()).filter((x) => /\d:\d\d\.\d\d/.test(x)).join(' | ');
    const out = { schluessel: E.ETAPPEN_INFO.map((i) => i.etappe), optionen: wahl.optionen().length, seiten: {} };
    for (let i = 0; i < 3; i++) { wahl.setzen(i); A.menue.neuZeichnen(); out.seiten[i] = zeiten(); }
    out.alpenGleich = JSON.stringify(vorher['passstrasse-r2']) === JSON.stringify(nach['passstrasse-r2']);
    out.finnlandGleich = JSON.stringify(vorher['finnland-r3']) === JSON.stringify(nach['finnland-r3']);
    out.gletscher = nach.skigebiet ? Object.keys(nach.skigebiet) : null;
    return out;
  });
  // (revision 1 = Schlüssel ohne Zusatz, docs/strecken-format.md: erst ab revision 2 heisst er <etappe>-r<revision>)
  melde(r.schluessel.join() === 'passstrasse-r2,finnland-r3,skigebiet' && r.optionen === 3, `Schlüssel ${r.schluessel.join(', ')}; Umschalter mit ${r.optionen} Etappen`);
  melde(r.alpenGleich && r.finnlandGleich && r.gletscher && r.gletscher.includes('delto'), `Skigebiet-Zeit unter „skigebiet“ (${r.gletscher}); Alpen und Finnland unverändert: ${r.alpenGleich} / ${r.finnlandGleich}`);
  melde(/02:50\.50/.test(r.seiten[0]) && !/03:34\.10/.test(r.seiten[0]) && /02:45\.25/.test(r.seiten[1]) && /03:34\.10/.test(r.seiten[2]) && !/02:50\.50|02:45\.25/.test(r.seiten[2]), `keine Vermischung: Alpen „${r.seiten[0].slice(0, 60)}“; Finnland „${r.seiten[1].slice(0, 60)}“; Skigebiet „${r.seiten[2].slice(0, 60)}“`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
  await s.schliessen();
}
if (teil('v')) {
  titel('(v) Demo-Fahrt im Hauptmenü fährt die gewählte Etappe (Skigebiet), kein leeres Bild');
  const s = await oeffne(WURZEL, '?ton=aus', { speicher: { 'alpineRally.etappe': 'skigebiet' } });
  await new Promise((ok) => setTimeout(ok, 3000));
  await s.page.evaluate(() => window.__alpineRally.zumMenue()); // (die Demo fährt hinter dem Hauptmenü)
  await new Promise((ok) => setTimeout(ok, 8000));
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, c = document.getElementById('spiel'), g = c.getContext('webgl2') || c.getContext('webgl');
    A.renderer.render(A.szene, A.kamera);
    const w = g.drawingBufferWidth, h = g.drawingBufferHeight, px = new Uint8Array(w * h * 4); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px);
    const farben = new Set(); for (let i = 0; i < px.length; i += 4 * 97) farben.add((px[i] >> 4) * 256 + (px[i + 1] >> 4) * 16 + (px[i + 2] >> 4));
    const q = A.strecke.abfrage(A.physik.x, A.physik.z, {});
    return { strecke: A.strecke.laenge, demoS: A.demo && A.demo.s != null ? A.demo.s : q.s, zustand: A.ablauf.zustand, farben: farben.size };
  });
  melde(Math.abs(r.strecke - G_LAENGE) < 1 && r.demoS > 30 && r.farben > 20, `Strecke ${r.strecke.toFixed(1)} m, Demo bei ${r.demoS && r.demoS.toFixed(0)} m, Zustand ${r.zustand}, ${r.farben} Farbstufen im Bild`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
  await s.schliessen();
}
// (x) Unveränderlich: Längen, Sprungweiten, Bestzeiten-Schlüssel, Bilder pixelgleich zu 0.10d (Alpen, Finnland, SCHATTEN AN/AUS)
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
if (teil('x')) {
  titel('(x) Unveränderlich: Alpen und Finnland (Länge, Sprungweiten, Bestzeiten-Schlüssel, Bilder pixelgleich zu 0.10d)');
  for (const [strecke, laenge, weiten] of [['alpen', 3667.587, [16.6, 19.6, 22.5]], ['finnland', 4161.6, [14.5, 23.8, 38.0, 30.3]]]) {
    const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${strecke}`, { auto: 'rt4' });
    const r = await s.page.evaluate(WEITEN, [100]);
    const L = await s.page.evaluate(() => window.__alpineRally.strecke.laenge);
    await s.schliessen();
    const w = Object.values(r.out).map((l) => l[0].weite);
    melde(Math.abs(L - laenge) <= 0.5 && w.length === weiten.length && w.every((x, i) => Math.abs(x - weiten[i]) <= 0.5), `${strecke}: Länge ${L.toFixed(3)} m, Sprünge bei 100 km/h (Audan) ${w.map((x) => x.toFixed(1)).join(' / ')} m (soll ${weiten.join(' / ')})`);
  }
  if (!ALT) melde(false, 'Bilder nur mit --alt');
  else {
    const stellen = { alpen: [300, 1200, 2100, 3000, 3500], finnland: [600, 1500, 2600, 3500] };
    const anders = [];
    for (const strecke of ['alpen', 'finnland']) for (const sch of [true, false]) {
      const n = await bildSummen(WURZEL, strecke, sch, stellen[strecke]), a = await bildSummen(ALT, strecke, sch, stellen[strecke]);
      n.forEach((x, i) => { if (x !== a[i]) anders.push(`${strecke} ${sch ? 'AN' : 'AUS'} ${stellen[strecke][i]} m`); });
    }
    melde(anders.length === 0, `3D-Bilder (320x180) an ${2 * (5 + 4)} Stellen pixelgleich zu 0.10d (SCHATTEN AN und AUS)${anders.length ? ` – ANDERS: ${anders.join(', ')}` : ''}`);
  }
}
// (zz) frühere Tests (nur mit --lang, einmal): nur neue Abweichungen melden
if (teil('zz') && process.argv.includes('--lang')) {
  titel('(zz) frühere Tests (--lang)');
  const laeufe = [
    ['pacenotes-test.mjs', []], ['pacenotes-test.mjs', ['--strecke', 'finnland']], ['leben-test.mjs', []], ['kuh-test.mjs', []], ['startziel-test.mjs', []],
    ['strassenrand-test.mjs', []], ['nebenweg-test.mjs', []], ['felswand-test.mjs', []], ['belag-test.mjs', []], ['rennablauf-test.mjs', []],
    ['menue-test.mjs', []], ['overlay-test.mjs', []], ['m9a2-test.mjs', ['--nur', 'a,c,e,f,g,h,k,l,m']], ['m9a1-test.mjs', ['--nur', 'a,b,c,e,f,g,h,i,j,k,m,n,o,p,r']],
    ['m8h-test.mjs', []], ['m10d-test.mjs', ['--nur', 'a,a3,b,c,g,h,i,j,k,l,m,n,s,t,u,w']], ['kommentar-waechter.mjs', []],
  ];
  for (const [datei, a] of laeufe) {
    const r = werkzeug(datei, a);
    fs.writeFileSync(path.join(LOG, `${datei.replace('.mjs', '')}${a.length ? '-' + a.join('').replace(/[^a-z0-9]/gi, '') : ''}.log`), r.text);
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
