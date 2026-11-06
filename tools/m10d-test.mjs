// Meilenstein 10d prüfen:  node tools/m10d-test.mjs --alt <ordner 0.10c.2> [--alt017 <ordner vor dem Schaltton-Fehler>] [--nur a,b,...] [--lang]
// (0.10c.2: git worktree add <ordner> b14cecc; vor dem Fehler: git worktree add <ordner> 017fb8f, nur für den Schaltton-Vergleich).
// Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein Gamepad, Ton nur gemessen (nicht gehört).
// Vorlage: tools/m10c2-test.mjs.
//   Teil A – Schaltton und Wums: (a) Schalt-Ereignisse = Gangwechsel (Testfahrer, alle Autos, beide Strecken),
//       (a2) Klang/Pegel wie vor dem Fehler (±1 dB), (a3) Stille (Menü-Demo, Countdown, Pause), (b) Quelltext-Wächter,
//       (c) Schaltton-Pegel über Mindestschwelle, (d) Wums-Pegel, (e) Spitze ≤ −1 dBFS, (f) Pause, LAUTSTÄRKE, Ducking
//   Teil B – Wand-Strafe: (g) Dauer, (h) Faktor-Verlauf, (i) Stapeln, (j) Schalten, (k) Zurücksetzen, (l) Landung/Wasser,
//       (m) kein Steckenbleiben, (n) MOTOR-Leuchte, (o) Kurven-Vergleich, (p) ohne Kontakt bit-gleich, (q) umgestellte Tests,
//       (zeit) Zeitverlust Streifer/Frontal (Bericht)
//   Teil C – Alpen-Sprünge: (r) Länge/Verlauf, (s) Flugweiten, (t) Orte, (u) Landungen, (v) kein Zeitgewinn, (w) SPRUNG-Ansage,
//       (abk) Abkürzungen, (x) Finnland bit-gleich, (y) Bildzeit
//   Teil D – Mittags-Schatten Alpen: (z) AUS bit-gleich (--altC <Stand nach C>), (aa) Budget/Auto, (ab) Bildzeit, (ac) Finnland-Bilder

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';
import { pruefe as kommentarPruefen } from './kommentar-waechter.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;       // 0.10c.2
const ALT017 = arg('--alt017') ? path.resolve(arg('--alt017')) : null; // vor dem Schaltton-Fehler (M10c Teil B)
let fehler = 0;
const ergebnisse = [];
let aktuell = null;
const titel = (t) => { console.log(t); aktuell = { titel: t, ok: 0, rot: 0 }; ergebnisse.push(aktuell); };
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; if (aktuell) aktuell[ok ? 'ok' : 'rot']++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m10d';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M10D_AUTOS ? process.env.M10D_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const STRECKEN = ['alpen', 'finnland'];
if (!ALT) info('Vergleiche gegen 0.10c.2 nur mit --alt <ordner> (git worktree add <ordner> b14cecc)');

// Spiel öffnen. uhr: eigene Bild-Uhr (window.__bild(n, dt))
async function oeffne(wurzel, adresse = '', { uhr = false, auto, breite = 640, hoehe = 360, geraet, speicher = null } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, ...(auto ? { auto } : {}), ...(geraet ? { geraet } : {}) });
  s.fehler = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
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

// ===================================================================== Teil A1: Schaltton
// (a) Testfahrer "mittel" fährt die ganze Etappe; jedes Bild läuft tonBild() wie im Spiel, der Ton-Zustand tonZ geht zusätzlich
// in ein eigenes (offline) Klangwerk. Gezählt: Schalt-Ereignisse im Tonweg (schalten-hoch/-runter) gegen Gangwechsel
// (Beginn jeder Schaltpause im Getriebe)
const SCHALT_FAHRT = async () => {
  const A = window.__alpineRally; A.anhalten = true;
  const F = await import('/tools/testfahrer-browser.js');
  const { baueKlangwerk } = await import('/js/audio.js');
  const w = baueKlangwerk(new OfflineAudioContext(1, 4410, 44100));
  let acc = 0, wechsel = 0, vor = false;
  const e = F.fahreEtappe(A, 'mittel', () => {
    if (A.getriebe.schaltet && !vor) wechsel++;
    vor = A.getriebe.schaltet;
    acc += A.SCHRITT;
    if (acc >= 1 / 60 - 1e-9) { acc -= 1 / 60; A.tonBild(1 / 60); w.aktualisiere(1 / 60, { ...A.tonZ, modus: 'rennen' }); }
  });
  const z = w.zaehler;
  return { zeit: e.zeit, wechsel, hoch: z['schalten-hoch'] || 0, runter: z['schalten-runter'] || 0, klack: z.klack || 0, zwischengas: z.zwischengas || 0, modus: A.tonZ.modus };
};
if (teil('a')) {
  titel('(a) Schalt-Ton-Ereignisse im Tonweg = Gangwechsel (Testfahrer „mittel“, alle Autos, Alpen und Finnland)');
  const auftraege = [];
  for (const strecke of STRECKEN) for (const auto of AUTOS) auftraege.push(async () => {
    const s = await oeffne(WURZEL, `?menue=aus&ton=aus&strecke=${strecke}`, { auto });
    const r = await s.page.evaluate(SCHALT_FAHRT);
    await s.schliessen();
    return { strecke, auto, ...r };
  });
  for (const r of await parallel(auftraege)) {
    melde(r.wechsel > 10 && r.hoch + r.runter === r.wechsel, `${r.strecke}/${r.auto}: ${r.wechsel} Gangwechsel, Ton: ${r.hoch} hoch + ${r.runter} runter (Klack ${r.klack}, Zwischengas ${r.zwischengas})`);
  }
}

// Schaltton offline: Hoch (2 → 3, Vollgas, 6200 → 4600/min) und runter (3 → 2, Gas 0.4, 3800 → 5200/min), Schaltpause 0.28 s.
// Pegel = RMS des Schalt-Anteils (mit Schalten minus ohne, 0.6–1.2 s), vor dem Limiter
const SCHALT_PEGEL = async () => {
  const T = await import('/tools/ton-pruefung.js');
  const rms = (d, a, b) => { let x = 0; const i0 = Math.round(a * T.RATE), i1 = Math.round(b * T.RATE); for (let i = i0; i < i1; i++) x += d[i] * d[i]; return Math.sqrt(x / (i1 - i0)); };
  const db = (x) => 20 * Math.log10(Math.max(1e-9, x));
  const fall = (hoch, schalten) => T.rendereVerlauf((w, t) => {
    const im = schalten && t >= 0.6 && t < 0.88, nach = schalten && t >= 0.88, g0 = hoch ? 2 : 3, g1 = hoch ? 3 : 2;
    const dz = hoch ? (nach ? 4600 : 6200) : (nach ? 5200 : 3800);
    w.aktualisiere(1 / 60, T.zustand({ drehzahl: dz, gang: nach ? g1 : g0, zielGang: im || nach ? g1 : g0, schaltet: im, gas: hoch ? 1 : 0.4, tempo: 20, vVor: 20, untergrund: 'asphalt' }));
  }, 1.4, { limiter: false });
  const r = {};
  for (const hoch of [true, false]) {
    const m = await fall(hoch, true), o = await fall(hoch, false);
    const d = new Float32Array(m.daten.length); for (let i = 0; i < d.length; i++) d[i] = m.daten[i] - o.daten[i];
    r[hoch ? 'hoch' : 'runter'] = { anteil: db(rms(d, 0.6, 1.2)), ereignisse: Object.keys(m.werk.zaehler).filter((k) => /schalt|klack|zwischen/.test(k)).sort().join(' ') };
  }
  return r;
};
async function schaltPegel(wurzel) {
  const auftraege = [];
  for (const strecke of STRECKEN) for (const auto of AUTOS) auftraege.push(async () => {
    const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=${strecke}`, { auto });
    const r = await s.page.evaluate(SCHALT_PEGEL);
    await s.schliessen();
    return [`${strecke}/${auto}`, r];
  });
  return Object.fromEntries(await parallel(auftraege));
}
if (teil('a2') || teil('c')) {
  const neu = await schaltPegel(WURZEL), alt = ALT017 ? await schaltPegel(ALT017) : null;
  fs.writeFileSync(path.join(LOG, 'schaltpegel.json'), JSON.stringify({ neu, alt }, null, 1));
  if (teil('a2')) {
    titel('(a2) Schaltton wie vor dem Fehler (Stand 017fb8f): Pegel des Schalt-Anteils ±1 dB, gleiche Klänge (alle Autos, hoch/runter, Alpen/Finnland)');
    if (!alt) melde(false, 'nur mit --alt017 <ordner> (git worktree add <ordner> 017fb8f)');
    else for (const k of Object.keys(neu)) for (const r of ['hoch', 'runter']) {
      const d = neu[k][r].anteil - alt[k][r].anteil;
      melde(Math.abs(d) <= 1 && neu[k][r].ereignisse === alt[k][r].ereignisse, `${k} ${r}: ${neu[k][r].anteil.toFixed(2)} dB (vorher ${alt[k][r].anteil.toFixed(2)} dB, Δ ${d.toFixed(2)}), ${neu[k][r].ereignisse}`);
    }
  }
  if (teil('c')) {
    titel('(c) Schaltton-Pegel (offline, Schalt-Anteil vor dem Limiter) über der Mindestschwelle −24 dBFS, alle Autos');
    for (const k of Object.keys(neu)) melde(neu[k].hoch.anteil > -24 && neu[k].runter.anteil > -24, `${k}: hoch ${neu[k].hoch.anteil.toFixed(1)} dB, runter ${neu[k].runter.anteil.toFixed(1)} dB`);
  }
}

// (a3) Stille: Menü mit Demo-Fahrt, Countdown (Vollgas), Pause (Vollgas): keine Schalt-Ereignisse im Tonweg.
// Das echte ton.aktualisiere wird angezapft, der Zustand geht zusätzlich in ein eigenes Klangwerk
const STILLE = async ({ phase }) => {
  const A = window.__alpineRally;
  const { baueKlangwerk } = await import('/js/audio.js');
  const w = baueKlangwerk(new OfflineAudioContext(1, 4410, 44100));
  let gw = 0, vor = false;
  const orig = A.ton.aktualisiere;
  const modi = {};
  A.ton.aktualisiere = (dt, z) => { orig.call(A.ton, dt, z); modi[z.modus] = (modi[z.modus] || 0) + 1; if (A.getriebe.schaltet && !vor) gw++; vor = A.getriebe.schaltet; w.aktualisiere(dt, z); };
  if (phase === 'countdown') { A.start({ countdown: true }); A.testEingabe = { gas: 1 }; window.__bild(150, 1000 / 60); }
  if (phase === 'pause') { A.start({ countdown: false }); A.testEingabe = { gas: 1 }; window.__bild(200, 1000 / 60); A.pausieren(); gw = 0; for (const k of Object.keys(w.zaehler)) delete w.zaehler[k]; window.__bild(300, 1000 / 60); }
  if (phase === 'menue') window.__bild(1800, 1000 / 60);
  A.testEingabe = null; A.ton.aktualisiere = orig;
  const z = w.zaehler;
  return { modi, gw, schalt: (z['schalten-hoch'] || 0) + (z['schalten-runter'] || 0), klack: z.klack || 0, zustand: A.ablauf.zustand, demoS: A.demo && A.demo.s };
};
if (teil('a3')) {
  titel('(a3) Stille: Menü-Demo-Fahrt, Countdown und Pause ohne Schaltton');
  for (const phase of ['menue', 'countdown', 'pause']) {
    const s = await oeffne(WURZEL, phase === 'menue' ? '?ton=aus' : '?menue=aus&ton=aus', { uhr: true });
    if (phase !== 'menue') await s.page.evaluate(() => { window.__alpineRally.anhalten = false; });
    const r = await s.page.evaluate(STILLE, { phase });
    melde(r.schalt === 0 && r.klack === 0, `${phase}: ${r.schalt} Schalt-Ereignisse, ${r.klack} Klack im Tonweg (Ton-Modi ${JSON.stringify(r.modi)}, Gangwechsel im Getriebe ${r.gw}, Zustand ${r.zustand}${phase === "pause" ? ", gezählt ab dem Pausieren" : ""})`);
    melde(s.fehler.length === 0, `${phase}: Konsole ohne Fehler (${s.fehler.length})`);
    await s.schliessen();
  }
}

// (b) Quelltext-Wächter: auskommentierte Zuweisungen/Aufrufe in js/*.js (Ausnahmen begründet in tools/kommentar-waechter.mjs)
if (teil('b')) {
  titel('(b) Quelltext-Wächter: keine auskommentierte Zuweisung / kein auskommentierter Aufruf in js/*.js (ausser begründete Ausnahmen)');
  const funde = kommentarPruefen(WURZEL), offen = funde.filter((f) => !f.ausnahme);
  for (const f of offen) info(`${f.datei}:${f.zeile} ${f.text}`);
  melde(offen.length === 0, `${offen.length} verdächtige Zeilen, ${funde.length - offen.length} begründete Ausnahmen`);
  if (ALT) {
    const a = kommentarPruefen(ALT).filter((f) => !f.ausnahme && f.datei === 'js/main.js');
    melde(a.some((f) => f.text.startsWith('tonZ.drehzahl')), `Gegenprobe 0.10c.2: der Wächter hätte den Fehler gefunden (${a.map((f) => `main.js:${f.zeile}`).join(', ') || 'NICHT gefunden'})`);
  }
}

// ===================================================================== Teil A2: Landungs-Wums (offline, wie tools/m10c2-test.mjs)
// Bezug: Fahrgeräusch bei 100 km/h mit Gas (Finnland 2200 m, echtes Getriebe), RMS der ersten 150 ms.
const MESSE_WUMS = async ({ lautstaerke = 1 } = {}) => {
  const A = window.__alpineRally, T = await import('/tools/ton-pruefung.js'), C = A.CONFIG;
  A.anhalten = true; A.setzeAuf(2200);
  const P = A.physik, G = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false };
  P.vx = Math.sin(P.richtung) * 27.8; P.vz = Math.cos(P.richtung) * 27.8; P.vVor = 27.8;
  for (let i = 0; i < 240; i++) { A.physikSchritt(A.SCHRITT, G); if (P.vVor > 27.8) { P.vx *= 27.8 / P.vVor; P.vz *= 27.8 / P.vVor; } }
  const z = T.zustand({ drehzahl: A.getriebe.drehzahl, gang: A.getriebe.gang, zielGang: A.getriebe.gang, gas: 1, tempo: 27.8, vVor: 27.8, untergrund: 'schotter', motorStrafen: 0 });
  const rms = (d, a, b) => { let x = 0; const i0 = Math.round(a * T.RATE), i1 = Math.round(b * T.RATE); for (let i = i0; i < i1; i++) x += d[i] * d[i]; return Math.sqrt(x / (i1 - i0)); };
  const spitze = (d, a = 0, b = d.length / T.RATE) => { let m = 0; for (let i = Math.round(a * T.RATE); i < Math.round(b * T.RATE); i++) m = Math.max(m, Math.abs(d[i])); return m; };
  const db = (x) => 20 * Math.log10(Math.max(1e-9, x));
  const LAND = { sauber: 0.25, hart: 0.6, sehrHart: 1.0 };
  const fahrt = (landung, limiter = true, dauer = 2.2) => T.rendereVerlauf((w, t) => {
    w.aktualisiere(1 / 60, z);
    if (landung && t >= 1.0 && !w.__gelandet) { w.__gelandet = true; w.sprung('landung', { haerte: LAND[landung], klasse: landung, s: 0 }); }
  }, dauer, { limiter, vorher: (w) => { w.busse.master.gain.value = lautstaerke; } });
  const motor = await fahrt(null), motorV = await fahrt(null, false);
  const mRms = rms(motor.daten, 1.0, 1.15), mVor = rms(motor.daten, 0.6, 0.95), mRmsV = rms(motorV.daten, 1.0, 1.15);
  const out = { drehzahl: Math.round(A.getriebe.drehzahl), gang: A.getriebe.gang, motorRms: db(mRms), motorRmsVor: db(mRmsV), stufen: {} };
  const T0 = C.sprung.ton, alt = { ...T0 };
  for (const k of Object.keys(LAND)) {
    const allein = await T.rendere((w) => { w.busse.master.gain.value = lautstaerke; w.sprung('landung', { haerte: LAND[k], klasse: k, s: 0 }); }, 0.6);
    const alleinV = await T.rendere((w) => { w.busse.master.gain.value = lautstaerke; w.sprung('landung', { haerte: LAND[k], klasse: k, s: 0 }); }, 0.6, { limiter: false });
    const mit = await fahrt(k);
    for (const key of Object.keys(T0)) if (/Pegel$|^LANDUNG_WUMMS_LAUTSTAERKE$/.test(key)) T0[key] = 0; // Ducking allein
    const duck = await fahrt(k);
    Object.assign(T0, alt);
    out.stufen[k] = {
      rmsAbs: db(rms(allein.daten, 0, 0.15)), spitze: db(spitze(allein.daten, 0, 0.6)), rmsRel: db(rms(alleinV.daten, 0, 0.15) / mRmsV), rmsRelNach: db(rms(allein.daten, 0, 0.15) / mRms),
      spitzeMit: db(spitze(mit.daten, 0.95, 1.6)), duckMitte: db(rms(duck.daten, 1.05, 1.2) / mVor), duckNach: db(rms(duck.daten, 1.5, 1.7) / mVor),
    };
  }
  return out;
};
async function wumsMessung(wurzel) {
  const s = await oeffne(wurzel, '?menue=aus&ton=aus&strecke=finnland');
  const r = await s.page.evaluate(MESSE_WUMS, {});
  await s.schliessen();
  return r;
}
if (['d', 'e', 'f'].some(teil)) {
  const neu = await wumsMessung(WURZEL), alt = ALT ? await wumsMessung(ALT) : null;
  const f = (x) => `${x >= 0 ? '+' : ''}${x.toFixed(1)} dB`;
  const tab = ['| Landung | 0.10c.2: gegen Motor im Mix / nach Kette / absolut | 0.10d: gegen Motor im Mix / nach Kette / absolut | Ziel | Spitze 0.10c.2 (allein / mit Fahrt) | Spitze 0.10d | Ducking 0.10c.2 / 0.10d |', '|---|---|---|---|---|---|---|'];
  const ziel = { sauber: null, hart: 8, sehrHart: 12 };
  for (const k of Object.keys(ziel)) {
    const a = alt && alt.stufen[k], n = neu.stufen[k];
    tab.push(`| ${k} | ${a ? `${f(a.rmsRel)} / ${f(a.rmsRelNach)} / ${a.rmsAbs.toFixed(1)} dBFS` : '–'} | ${f(n.rmsRel)} / ${f(n.rmsRelNach)} / ${n.rmsAbs.toFixed(1)} dBFS | ${ziel[k] == null ? 'wie bisher' : `ca. ${f(ziel[k])}`} | ${a ? `${a.spitze.toFixed(1)} / ${a.spitzeMit.toFixed(1)} dBFS` : '–'} | ${n.spitze.toFixed(1)} / ${n.spitzeMit.toFixed(1)} dBFS | ${a ? f(a.duckMitte) : '–'} / ${f(n.duckMitte)} |`);
  }
  fs.writeFileSync(path.join(LOG, 'wums-pegel.md'), `Fahrgeräusch 100 km/h, Gas, ${neu.gang}. Gang, ${neu.drehzahl}/min: RMS ${neu.motorRms.toFixed(1)} dBFS nach der Kette, ${neu.motorRmsVor.toFixed(1)} dBFS vor dem Limiter\n\n${tab.join('\n')}\n`);
  for (const z of tab) info(z);
  if (teil('d')) {
    titel('(d) Wums-Pegel (RMS erste 150 ms gegen Motor bei 100 km/h, im Mix = vor dem Limiter): hart ca. +8 dB, sehr hart ca. +12 dB, sauber wie 0.10c.2');
    melde(neu.stufen.hart.rmsRel >= 7.5, `hart: ${f(neu.stufen.hart.rmsRel)}${alt ? ` (0.10c.2 ${f(alt.stufen.hart.rmsRel)})` : ''}`);
    melde(neu.stufen.sehrHart.rmsRel >= 11.5, `sehr hart: ${f(neu.stufen.sehrHart.rmsRel)}${alt ? ` (0.10c.2 ${f(alt.stufen.sehrHart.rmsRel)})` : ''}`);
    melde(!alt || Math.abs(neu.stufen.sauber.rmsRel - alt.stufen.sauber.rmsRel) < 0.05, `sauber: ${f(neu.stufen.sauber.rmsRel)}${alt ? ` (0.10c.2 ${f(alt.stufen.sauber.rmsRel)}, unverändert)` : ''}`);
  }
  if (teil('e')) {
    titel('(e) Spitzenpegel nie über −1 dBFS (Landung allein und mit Fahrgeräusch, LAUTSTÄRKE 100 %)');
    for (const k of Object.keys(ziel)) melde(neu.stufen[k].spitze <= -1 && neu.stufen[k].spitzeMit <= -1, `${k}: allein ${neu.stufen[k].spitze.toFixed(2)} dBFS, mit Fahrt ${neu.stufen[k].spitzeMit.toFixed(2)} dBFS`);
  }
  if (teil('f')) {
    titel('(f) Ducking (sauber ca. −6 dB, hart/sehr hart ca. −9 dB für 0.3 s, danach zurück), Pause stumm, LAUTSTÄRKE wirkt');
    for (const k of Object.keys(ziel)) {
      const n = neu.stufen[k], [lo, hi] = k === 'sauber' ? [-7.5, -4.5] : [-10.5, -7.5];
      melde(n.duckMitte >= lo && n.duckMitte <= hi && Math.abs(n.duckNach) <= 1, `${k}: während ${f(n.duckMitte)}, 0.5 s danach ${f(n.duckNach)}`);
    }
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
    const r = await s.page.evaluate(async () => {
      const T = await import('/tools/ton-pruefung.js');
      const rms = (d, a, b) => { let x = 0; const i0 = Math.round(a * T.RATE), i1 = Math.round(b * T.RATE); for (let i = i0; i < i1; i++) x += d[i] * d[i]; return Math.sqrt(x / (i1 - i0)); };
      const land = (laut, pause, klasse = 'sehrHart') => T.rendereVerlauf((w, t) => {
        w.aktualisiere(1 / 60, T.zustand({ modus: pause && t >= 0.5 ? 'pause' : 'rennen', drehzahl: 900, gas: 0 }));
        if (t >= 0.5 && !w.__l) { w.__l = true; if (!pause) w.sprung('landung', { haerte: klasse === 'hart' ? 0.6 : 1, klasse, s: 0 }); }
      }, 1.2, { limiter: false, vorher: (w) => { w.busse.master.gain.value = laut; } });
      const v = await land(1, false), h = await land(0.5, false), p = await land(1, true), vh = await land(1, false, 'hart'), hh = await land(0.5, false, 'hart');
      return { voll: rms(v.daten, 0.5, 0.65), halb: rms(h.daten, 0.5, 0.65), vollH: rms(vh.daten, 0.5, 0.65), halbH: rms(hh.daten, 0.5, 0.65), pause: rms(p.daten, 0.6, 1.2), vor: rms(v.daten, 0.2, 0.45) };
    });
    const db = (x) => 20 * Math.log10(x);
    melde(Math.abs(db(r.halb / r.voll) + 6.02) < 0.3 && Math.abs(db(r.halbH / r.vollH) + 6.02) < 0.3, `LAUTSTÄRKE 50 %: sehr hart ${db(r.halb / r.voll).toFixed(2)} dB, hart ${db(r.halbH / r.vollH).toFixed(2)} dB gegen 100 %`);
    melde(r.pause < r.vor * 0.5, `Pause: keine Landung, Pegel ${db(r.pause / r.vor).toFixed(1)} dB gegen Leerlauf vorher`);
    await s.schliessen();
  }
}

// ===================================================================== Teil B: Wand-Strafe deutlich stärker
const STILE_B = ['vorsichtig', 'mittel', 'flott', 'digital', 'wand'];
const fmtZ = (t) => (t == null ? 'NICHT IM ZIEL' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);
// Formel aus dem Auftrag (km/h -> s), unabhängig vom Spiel: 3 s + (Verlust − 10) / 40 · 3 s, 3 bis 6 s
const dauerFormel = (v) => (v < 10 ? 0 : Math.max(3, Math.min(6, 3 + ((v - 10) / 40) * 3)));
// Treffer mit genau so viel Tempoverlust (km/h) einspielen (wie wand.ende nach einem Kontakt-Schritt)
const TREFFER = (kmh, frontal = false) => {
  const W = window.__alpineRally.wand;
  W.uhr += 1;
  W.schrittVerlust = kmh / 3.6; W.strafe = frontal; W.letzter = frontal ? { winkel: 90, vorher: 0, nachher: 0, strafe: 0.75 } : W.letzter;
  W.treffer(); W.strafe = false;
  return { rest: W.strafeRest, leistung: W.leistung() };
};
const FREI = ({ s = 2200, kmh = 0 } = {}) => {
  const A = window.__alpineRally; A.anhalten = true; A.setzeAuf(s);
  A.physik.vx = Math.sin(A.physik.richtung) * kmh / 3.6; A.physik.vz = Math.cos(A.physik.richtung) * kmh / 3.6; A.physik.vVor = kmh / 3.6;
};
// Fahren mit einfachem Nachlenken auf die Strassenmitte (15 m voraus); bisMeter: bis so viele Meter gefahren sind
const FOLGE = ({ sek = 20, gas = 1, bisMeter = Infinity }) => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke, q = {};
  const s0 = S.abfrage(P.x, P.z, q).s; let t = 0;
  for (; t < sek; t += A.SCHRITT) {
    S.abfrage(P.x, P.z, q); if (q.s - s0 >= bisMeter) break;
    const z = S.punktBei(Math.min(S.laenge - 1, q.s + 15));
    const f = Math.atan2(Math.sin(Math.atan2(z.x - P.x, z.z - P.z) - P.richtung), Math.cos(Math.atan2(z.x - P.x, z.z - P.z) - P.richtung));
    A.physikSchritt(A.SCHRITT, { gas, bremse: 0, lenkung: Math.max(-1, Math.min(1, -f * 2.5)), handbremse: false, reset: false });
  }
  return t;
};
const schritt = (A, e = {}) => A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, ...e });
if (['g', 'h', 'i', 'm', 'zeit'].some(teil)) {
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await s.page.evaluate(`window.__TREFFER = ${TREFFER}; window.__FREI = ${FREI}; window.__FOLGE = ${FOLGE}; window.__schritt = ${schritt};`);
  if (teil('g')) {
    titel('(g) Strafe-Dauer = 3 s + (Verlust − 10) / 40 · 3 s, 3 bis 6 s (±0.05 s), gemessen bis die Strafe aus ist');
    for (const v of [9, 10, 20, 30, 50, 80]) {
      const r = await s.page.evaluate((v) => {
        const A = window.__alpineRally; window.__FREI({});
        const t0 = window.__TREFFER(v); let t = 0;
        while (A.wand.strafeRest > 0 && t < 12) { window.__schritt(A, { bremse: 1 }); t += A.SCHRITT; }
        return { rest0: t0.rest, t };
      }, v);
      const soll = dauerFormel(v);
      melde(Math.abs(r.t - soll) <= 0.05 && Math.abs(r.rest0 - soll) <= 0.05, `${v} km/h Verlust: Strafe ${r.rest0.toFixed(3)} s, gemessen ${r.t.toFixed(3)} s (Formel ${soll.toFixed(2)} s${v < 10 ? ', keine Strafe' : ''})`);
    }
  }
  if (teil('h')) {
    titel('(h) Antriebsfaktor: 0.03 für 1.0 s, glatter Übergang (0.15 s) auf 0.10, glatt auf 1.0, kein Sprung am Ende');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally; window.__FREI({});
      window.__TREFFER(30); // 4.5 s
      const l = [A.wand.leistung()], t = [0];
      while (A.wand.strafeRest > 0) { window.__schritt(A, { bremse: 1 }); l.push(A.wand.leistung()); t.push(t[t.length - 1] + A.SCHRITT); }
      let maxD = 0, maxD2 = 0, steigt = true;
      for (let i = 1; i < l.length; i++) { maxD = Math.max(maxD, Math.abs(l[i] - l[i - 1])); if (l[i] < l[i - 1] - 1e-12) steigt = false; if (i > 1) maxD2 = Math.max(maxD2, Math.abs(l[i] - 2 * l[i - 1] + l[i - 2])); }
      const bei = (x) => l[t.findIndex((y) => y >= x - 1e-9)];
      const stall = l.filter((_, i) => t[i] < 1.0 - 1e-9);
      return { stallMin: Math.min(...stall), stallMax: Math.max(...stall), n: stall.length, bei1: bei(1.0), bei115: bei(1.15), bei2: bei(2.0), bei3: bei(3.0), vorEnde: l[l.length - 2], ende: l[l.length - 1], maxD, maxD2, steigt };
    });
    melde(r.stallMin === 0.03 && r.stallMax === 0.03, `Phase 1: ${r.n} Schritte (1.0 s) genau ${r.stallMin}`);
    melde(Math.abs(r.bei115 - 0.10) < 0.002 && r.bei1 >= 0.03 && r.maxD < 0.007 && r.steigt, `Übergang: bei 1.0 s ${r.bei1.toFixed(4)}, bei 1.15 s ${r.bei115.toFixed(4)}; grösster Schritt ${r.maxD.toFixed(4)} (kein Sprung), steigt nur`);
    melde(r.vorEnde > 0.9999 && r.ende === 1 && r.maxD2 < 0.002, `Phase 2: bei 2 s ${r.bei2.toFixed(3)}, bei 3 s ${r.bei3.toFixed(3)}, letzter Schritt ${r.vorEnde.toFixed(6)} → ${r.ende} (glatt, grösste Krümmung ${r.maxD2.toExponential(1)})`);
    const a = await s.page.evaluate(() => {
      const A = window.__alpineRally, Gt = A.getriebe, G = { gas: 1 };
      const orig = Gt.schritt; let vor = 0, obj = null;
      Gt.schritt = function (...x) { obj = orig.apply(this, x); vor = obj.beschl; return obj; };
      const l = [];
      try {
        window.__FREI({ kmh: 40 }); for (let i = 0; i < 30; i++) window.__schritt(A, G);
        window.__TREFFER(50);
        for (let i = 0; i < 900 && A.wand.strafeRest > 0; i++) { window.__schritt(A, G); if (vor > 0) l.push([obj.beschl / vor, A.wand.leistung()]); }
        return { erst: l[0][0], abw: Math.max(...l.map(([q, w]) => Math.abs(q - w))), n: l.length };
      } finally { Gt.schritt = orig; }
    });
    melde(Math.abs(a.erst - 0.03) < 1e-9 && a.abw < 1e-9, `Antriebskraft im ersten Schritt ×${a.erst.toFixed(3)}, danach immer genau der Leistungsfaktor (Abweichung ${a.abw.toExponential(1)}, ${a.n} Schritte)`);
    const d = await s.page.evaluate(() => {
      const A = window.__alpineRally, out = [];
      window.__FREI({ kmh: 60 }); for (let i = 0; i < 30; i++) window.__schritt(A, { gas: 1 });
      const normal = A.getriebe.drehzahl;
      window.__TREFFER(30);
      for (let i = 0; i < 240; i++) { window.__schritt(A, { gas: 1 }); if (i % 24 === 0) out.push(+(A.wand.drehzahlFaktor()).toFixed(3)); }
      return { normal: Math.round(normal), out };
    });
    melde(d.out[0] === 0.3 && d.out[4] === 0.3, `Drehzahl (Tacho/Ton): Faktor alle 0.2 s ${d.out.join(' / ')} (Phase 1 auf 30 %, dann glatt zurück)`);
  }
  if (teil('i')) {
    titel('(i) Stapeln: Restzeit + neue Dauer, höchstens 9 s; ein neuer Treffer startet Phase 1 neu (sofort 0.03)');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally; window.__FREI({});
      const e1 = window.__TREFFER(30);                                     // 4.5 s
      for (let i = 0; i < 240; i++) window.__schritt(A, { bremse: 1 });    // 2 s später: Phase 2
      const vor = { rest: A.wand.strafeRest, leistung: A.wand.leistung() };
      const e2 = window.__TREFFER(20);                                     // + 3.75 s
      for (let i = 0; i < 60; i++) window.__schritt(A, { bremse: 1 });
      const phase1 = A.wand.leistung();
      const e3 = window.__TREFFER(50), e4 = window.__TREFFER(80);
      return { e1, vor, e2, phase1, e3, e4 };
    });
    melde(Math.abs(r.e1.rest - 4.5) < 1e-6 && Math.abs(r.vor.rest - 2.5) < 0.01 && Math.abs(r.e2.rest - 6.25) < 0.01 && r.e3.rest === 9 && r.e4.rest === 9,
      `30 km/h: 4.5 s; nach 2 s Rest ${r.vor.rest.toFixed(2)} s; + 20 km/h (3.75 s) → ${r.e2.rest.toFixed(2)} s; + 50 km/h → ${r.e3.rest} s; + 80 km/h → ${r.e4.rest} s (Obergrenze 9 s)`);
    melde(r.vor.leistung > 0.1 && r.e2.leistung === 0.03 && r.phase1 === 0.03 && r.e3.leistung === 0.03, `Leistung vor dem 2. Treffer ${r.vor.leistung.toFixed(3)}, direkt danach ${r.e2.leistung}, 0.5 s danach ${r.phase1} (Phase 1 neu)`);
  }
  if (teil('m')) {
    titel('(m) kein Steckenbleiben: Rückwärts (über die Bremse) mit Strafe gleich wie ohne, auch am steilsten Hang (bergauf und bergab)');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, P = A.physik, S = A.strecke;
      let best = 0, sH = 0;
      for (let i = 200; i < S.anzahl - 200; i += 2) { const st = Math.abs(S.py[i + 3] - S.py[i - 3]) / Math.hypot(S.px[i + 3] - S.px[i - 3], S.pz[i + 3] - S.pz[i - 3]); if (st > best) { best = st; sH = i; } }
      const sHang = S.abfrage(S.px[sH], S.pz[sH], {}).s;
      const out = { steigung: best };
      for (const [name, s0, dreh] of [['eben', 2200, 0], ['Hang, Nase bergauf', sHang, 0], ['Hang, Nase bergab', sHang, Math.PI]]) {
        const w = {};
        for (const mit of [false, true]) {
          window.__FREI({ s: s0 }); if (dreh) P.reset(P.x, P.z, P.richtung + dreh);
          for (let i = 0; i < 60; i++) window.__schritt(A, { bremse: 1 });  // stehen lassen
          if (mit) window.__TREFFER(80, true);
          const x0 = P.x, z0 = P.z;
          for (let t = 0; t < 2.5; t += A.SCHRITT) window.__schritt(A, { bremse: 1 });
          w[mit ? 'mit' : 'ohne'] = Math.hypot(P.x - x0, P.z - z0); w.rest = A.wand.strafeRest;
          A.wand.strafeAus();
        }
        out[name] = w;
      }
      return out;
    });
    for (const k of ['eben', 'Hang, Nase bergauf', 'Hang, Nase bergab']) melde(r[k].mit > 1 && Math.abs(r[k].mit - r[k].ohne) < 1e-6, `${k}${k === 'eben' ? '' : ` (Steigung ${(r.steigung * 100).toFixed(1)} %)`}: 2.5 s rückwärts mit Strafe (0.03, noch ${r[k].rest.toFixed(1)} s) ${r[k].mit.toFixed(2)} m, ohne ${r[k].ohne.toFixed(2)} m`);
  }
  if (teil('zeit')) {
    titel('(zeit) Zeitverlust: kleiner Streifer (10–15 km/h Verlust) und harter Frontaltreffer (nur Bericht; 150 m Vollgas danach)');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, out = {};
      for (const [name, kmh, verlust, frontal] of [['Streifer 10 km/h', 70, 10, false], ['Streifer 15 km/h', 70, 15, false], ['Frontal (aus 60 km/h auf 15)', 15, 45, true]]) {
        const t = [];
        for (const mit of [false, true]) {
          window.__FREI({ s: 2150, kmh }); A.wand.strafeAus();
          if (mit) window.__TREFFER(verlust, frontal);
          t.push(window.__FOLGE({ bisMeter: 150 }));
        }
        out[name] = { ohne: t[0], mit: t[1], dauer: Math.min(6, Math.max(3, 3 + (verlust - 10) / 40 * 3)) };
        A.wand.strafeAus();
      }
      return out;
    });
    for (const [k, v] of Object.entries(r)) info(`${k}: 150 m in ${v.ohne.toFixed(2)} s ohne, ${v.mit.toFixed(2)} s mit Strafe → +${(v.mit - v.ohne).toFixed(2)} s`);
    fs.writeFileSync(path.join(LOG, 'zeitverlust.json'), JSON.stringify(r, null, 1));
    melde(true, 'gemessen');
  }
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
// (j) Schalten, (k) Zurücksetzen/Pause/Wasser, (l) Landung ohne Strafe, (n) MOTOR-Leuchte, (q) umgestellte M10c.2-Tests:
// die Prüfungen aus tools/m10c2-test.mjs (Werte dort auf M10d umgestellt, jede Änderung mit Kommentar „M10d“)
const m10c2Teil = (buchstaben, titelText) => {
  titel(titelText);
  const r = werkzeug('m10c2-test.mjs', ['--nur', buchstaben]);
  fs.writeFileSync(path.join(LOG, `m10c2-${buchstaben.replace(/,/g, '')}.log`), r.text);
  const z = r.text.split('\n').filter((x) => /^(  ok  |FEHLER) /.test(x));
  for (const x of z.filter((x) => x.startsWith('FEHLER'))) info(x.slice(0, 200));
  melde(r.code === 0 && z.length > 0, `tools/m10c2-test.mjs --nur ${buchstaben}: ${z.filter((x) => x.startsWith('  ok')).length} ok, ${z.filter((x) => x.startsWith('FEHLER')).length} rot`);
};
if (teil('j')) m10c2Teil('c', '(j) Gangwechsel doppelt so lang nur während der Strafe (m10c2 (c))');
if (teil('k')) m10c2Teil('e', '(k) R, Wasser, Neustart, Menü beenden die Strafe, Pause friert ein, Countdown ohne Strafe (m10c2 (e), auf 9 s umgestellt)');
if (teil('l')) m10c2Teil('f', '(l) Sprung-Landung (Finnland, 110/140 km/h) und Wasser lösen keine Strafe aus (m10c2 (f), (e)); Alpen-Sprünge: Teil C (u)');
if (teil('n')) m10c2Teil('h', '(n) MOTOR-Leuchte nur während der Strafe, blinkt, überlappt nichts (3 Auflösungen, HUD-Grössen, englisch, Touch quer/hoch emuliert)');
if (teil('q')) m10c2Teil('a,b,d,g,m', '(q) M10c.2-Tests Dauer (a), Faktor (b), Stapeln (d), Steckenbleiben (g), Aussetzer-Ton (m) auf die neuen Werte umgestellt');

// (o) Kurven-Vergleich: „wand“ gegen die beste kontaktfreie Fahrt inkl. sanfter Gas-Rampe (Toleranz 0.1 s)
function kurvenVergleich(strecke, auto, wurzel, stand) {
  const datei = path.join(LOG, `kv-${stand}-${strecke}-${auto}.json`);
  if (!fs.existsSync(datei)) {
    const a = [path.join(wurzel, 'strecken', `${strecke}.js`), '--auto', auto, '--kurven-vergleich', '--json', datei];
    if (wurzel !== WURZEL) a.push('--wurzel', wurzel);
    const r = werkzeug('strecke-abfahren.mjs', a);
    if (!fs.existsSync(datei)) { console.log(r.text.slice(-1500)); throw new Error(`kurven-vergleich ${strecke} ${auto} ${stand}`); }
  }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
if (teil('o')) {
  titel('(o) Kurven-Vergleich (alle Kehren/180-Grad-Kurven, 100 m davor bis 100 m danach): „wand“ nirgends > 0.1 s schneller als die beste kontaktfreie Fahrt inkl. Gas-Rampe');
  const d = (x) => (x == null ? '–' : `${x >= 0 ? '+' : ''}${x.toFixed(2)} s`);
  const tab = ['| Strecke | Auto | Kurve (m) | beste kontaktfrei (inkl. Rampe) | wand 0.10c.2 | wand 0.10d (Strafen, Strafzeit) |', '|---|---|---|---|---|---|'];
  const schneller = [], schnellerAlt = [], ohneVgl = [];
  for (const strecke of STRECKEN) for (const id of AUTOS) {
    const n = kurvenVergleich(strecke, id, WURZEL, 'neu'), a = ALT ? kurvenVergleich(strecke, id, ALT, 'alt') : null;
    n.forEach((k, i) => {
      const ka = a && a[i];
      tab.push(`| ${strecke} | ${id} | ${k.von}–${k.bis} | ${k.bestAlle ? `${k.bestAlle.stil} ${k.bestAlle.zeit.toFixed(2)} s` : '–'} | ${ka ? `${d(ka.diff)}${ka.wand.kontakt ? '' : ' (ohne Kontakt)'}` : '–'} | ${d(k.diff)}${k.wand.kontakt ? '' : ' (ohne Kontakt)'}${k.wand.strafen ? ` (${k.wand.strafen}, ${k.wand.strafeZeit.toFixed(1)} s)` : ''} |`);
      if (k.diff == null) ohneVgl.push(`${strecke}/${id} ${k.von} m`);
      else if (k.diff < -0.1 && k.wand.kontakt) schneller.push(`${strecke}/${id} ${k.von} m ${d(k.diff)}`);
      if (ka && ka.diff != null && ka.diff < -0.1 && ka.wand.kontakt) schnellerAlt.push(`${strecke}/${id} ${ka.von} m ${d(ka.diff)}`);
    });
  }
  fs.writeFileSync(path.join(LOG, 'kurven-vergleich.md'), `${tab.join('\n')}\n`);
  for (const z of tab.filter((z) => z.includes('| alpen |'))) info(z);
  if (ALT) info(`0.10c.2 (gleiche Messlatte inkl. Rampe): „wand“ schneller in ${schnellerAlt.length} Kurven${schnellerAlt.length ? `: ${schnellerAlt.join('; ')}` : ''}`);
  melde(schneller.length === 0, `0.10d: „wand“ mit Wandkontakt in ${schneller.length} Kurven mehr als 0.1 s schneller${schneller.length ? `: ${schneller.join('; ')}` : ''}${ohneVgl.length ? ` (ohne Vergleich: ${ohneVgl.join(', ')})` : ''}`);
}

// (p) Läufe ohne Hindernis-Kontakt bit-gleich wie 0.10c.2 (Testfahrer, beide Strecken, alle Autos, alle Stile)
function testfahrerLauf(strecke, auto, wurzel = WURZEL, stand = 'neu', extra = []) {
  const datei = path.join(LOG, `fahrt-${stand}-${strecke}-${auto}${extra.length ? `-${extra.join('')}` : ''}.json`);
  if (fs.existsSync(datei) && !(stand === 'neu' && process.env.M10D_NEU)) return JSON.parse(fs.readFileSync(datei, 'utf8'));
  const a = [path.join(wurzel, 'strecken', `${strecke}.js`), '--auto', auto, '--stil', STILE_B.join(','), '--json', datei, '--aus', path.join(LOG, `fahrt-${stand}-${strecke}-${auto}.txt`)];
  if (wurzel !== WURZEL) a.push('--wurzel', wurzel);
  a.push(...extra);
  const r = werkzeug('strecke-abfahren.mjs', a);
  if (!fs.existsSync(datei)) { console.log(r.text.slice(-2000)); throw new Error(`strecke-abfahren ${strecke} ${auto} ${stand}`); }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
const relativ = (l) => { const a = (l || []).find((x) => x >= 0); return (l || []).map((x) => (x < 0 ? x : +(x - a).toFixed(9))); };
// streckenListe: welche Strecken bit-gleich sein müssen (ab Teil C nur noch Finnland)
function bitGleich(streckenListe, bezeichnung) {
  const ohne = [], anders = [], mit = [], rev = [];
  const tab = ['| Strecke | Auto | Stil | 0.10c.2: Zeit (Wand, Aufpr.) | jetzt: Zeit (Wand, Aufpr., Motor-Strafen, Strafzeit) |', '|---|---|---|---|---|'];
  for (const strecke of streckenListe) for (const id of AUTOS) {
    const n = testfahrerLauf(strecke, id), a = testfahrerLauf(strecke, id, ALT, 'alt');
    for (const stil of STILE_B) {
      const x = n.stile.find((q) => q.stil === stil), y = a.stile.find((q) => q.stil === stil), k = `${strecke}/${id}/${stil}`;
      tab.push(`| ${strecke} | ${id} | ${stil} | ${fmtZ(y.zeit)} (${y.wandKontakte.length}, ${y.aufpralle}) | ${fmtZ(x.zeit)} (${x.wandKontakte.length}, ${x.aufpralle}, ${x.motorStrafen.length}, ${x.strafeZeit.toFixed(1)} s) |`);
      if (stil === 'mittel' && Math.abs((x.zeit ?? 999) - (y.zeit ?? 999)) > 1) rev.push(`${k} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)}`);
      if (y.wandKontakte.length > 0 || x.wandKontakte.length > 0) { mit.push(`${k} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)} (Wand ${y.wandKontakte.length} → ${x.wandKontakte.length}, Motor-Strafen ${y.motorStrafen.length} → ${x.motorStrafen.length}, Strafzeit ${y.strafeZeit.toFixed(1)} → ${x.strafeZeit.toFixed(1)} s)`); continue; }
      ohne.push(k);
      if (x.zeit !== y.zeit || x.aufpralle !== y.aufpralle || JSON.stringify(x.cps) !== JSON.stringify(y.cps) || JSON.stringify(x.aufprallListe) !== JSON.stringify(y.aufprallListe) || JSON.stringify(relativ(x.zeitBei)) !== JSON.stringify(relativ(y.zeitBei))) anders.push(k);
    }
  }
  fs.writeFileSync(path.join(LOG, `testfahrer-${bezeichnung}.md`), `${tab.join('\n')}\n\nmit Kontakt:\n${mit.join('\n')}\n`);
  melde(anders.length === 0 && ohne.length > 0, `${ohne.length} Läufe ohne Wandkontakt (${streckenListe.join(', ')}): Zeit, Zwischenzeiten, Zeit je 10 m, Aufpralle gleich wie 0.10c.2${anders.length ? ` – ANDERS: ${anders.join('; ')}` : ''}`);
  info(`${mit.length} Läufe mit Wandkontakt (dürfen sich ändern): ${LOG}/testfahrer-${bezeichnung}.md`);
  for (const m of mit.filter((m) => m.startsWith('finnland/l073/digital'))) info(`Lanza 073 Finnland digital: ${m}`);
  return { rev, mit };
}
if (teil('p')) {
  titel('(p) Läufe ohne Hindernis-Kontakt bit-gleich wie 0.10c.2 (Alpen und Finnland, alle Autos, alle Stile)');
  if (!ALT) melde(false, 'nur mit --alt');
  else {
    const { rev } = bitGleich(STRECKEN, 'teilB');
    melde(rev.length === 0, `Stil „mittel“: keine Verschiebung über 1 s (sonst neue revision)${rev.length ? `: ${rev.join('; ')}` : ''}`);
  }
}

// ===================================================================== Teil C: Alpen mit 3 Sprüngen
const med = (l) => { const a = [...l].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
const ALPEN_SPRUENGE = [180, 2140, 3440]; // Kanten (strecken/alpen.js, Feld sprung)
const WEITEN = (kmhs) => {
  const A = window.__alpineRally, P = A.physik, F = A.flug; A.anhalten = true; const out = {};
  for (const z of A.strecke.sprungZonen) {
    out[z.name] = [];
    for (const kmh of kmhs) {
      A.setzeAuf(z.kante - 6); P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
      const n0 = F.ereignis.landung, a0 = F.ereignis.abheben;
      for (let t = 0; t < 6 && F.ereignis.landung === n0; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 0.4, bremse: 0, lenkung: 0, handbremse: false }, true);
      const L = F.letzteLandung;
      out[z.name].push(F.ereignis.abheben === a0 ? { kmh, ab: false } : { kmh, ab: true, weite: L.weite, verlust: L.verlust, klasse: L.klasse, kante: z.kante });
    }
  }
  return out;
};
if (teil('r')) {
  titel('(r) Alpen: Länge 3667.587 m (±0.5), Verlauf (Draufsicht) und Checkpoints wie 0.10c.2');
  const lies = async (w) => { const s = await oeffne(w, '?menue=aus&ton=aus'); const r = await s.page.evaluate(() => { const S = window.__alpineRally.strecke; let h = 0; for (let i = 0; i < S.anzahl; i += 7) h += S.px[i] * 1.3 + S.pz[i]; return { laenge: S.laenge, anzahl: S.anzahl, xz: h.toFixed(6), cps: window.__alpineRally.checkpoints.map((c) => Math.round(c.s ?? c)) }; }); await s.schliessen(); return r; };
  const n = await lies(WURZEL), a = ALT ? await lies(ALT) : null;
  melde(Math.abs(n.laenge - 3667.587) <= 0.5, `Länge ${n.laenge.toFixed(3)} m`);
  melde(!a || (n.xz === a.xz && n.anzahl === a.anzahl && JSON.stringify(n.cps) === JSON.stringify(a.cps)), `Draufsicht (Prüfsumme x/z ${n.xz}) und Checkpoints ${JSON.stringify(n.cps)}${a ? (n.xz === a.xz ? ' gleich wie 0.10c.2' : ` ANDERS (0.10c.2 ${a.xz})`) : ''}`);
}
if (teil('s')) {
  titel('(s) Flugweiten bei 100 km/h: alle 3 Alpen-Sprünge 15–25 m (klein 15–18, mittel 20–25), alle 5 Autos (±0.5 m)');
  for (const auto of AUTOS) {
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus', { auto });
    const w = await s.page.evaluate(WEITEN, [100]);
    await s.schliessen();
    const t = Object.entries(w).map(([k, v]) => `${k} ${v[0].ab ? `${v[0].weite.toFixed(1)} m` : 'kein Flug'}`).join(', ');
    const [a, b, c] = Object.values(w).map((v) => (v[0].ab ? v[0].weite : 0));
    melde(a >= 14.5 && a <= 18.5 && b >= 14.5 && b <= 25.5 && c >= 19.5 && c <= 25.5 && b > a - 0.5 && c > b - 0.5, `${auto}: ${t}`);
  }
}
if (teil('t')) {
  titel('(t) Orte nach den Regeln: Prüfer grün, Landezone 60 m frei (keine Felswand, Leitplanke, Hindernis auf ±7 m), nicht im 250 m vor einer Kehre, je ein Drittel');
  const r = werkzeug('strecke-pruefen.mjs', ['strecken/alpen.js']);
  melde(r.code === 0 && /^ok /m.test(r.text), `tools/strecke-pruefen.mjs: ${r.text.trim().split('\n').pop().slice(0, 140)}`);
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  const o = await s.page.evaluate(async () => {
    const A = window.__alpineRally, S = A.strecke, q = {};
    const { berechnePaceNotes } = await import('/js/pacenotes.js');
    const kehren = berechnePaceNotes(S, A.netz).kurven.filter((c) => c.kehre || c.winkel >= 150).map((c) => c.von);
    const rand = A.strassenrand.hindernisse.map((h) => ({ ...S.abfrage(h.x, h.z, {}), art: h.rand }));
    const baeume = A.pflanzen.hindernisse.map((h) => ({ ...S.abfrage(h.x, h.z, {}), r: h.r }));
    return S.sprungZonen.map((z) => {
      const a = z.landeVon, b = z.landeVon + 60;
      const planke = rand.filter((h) => h.s > a && h.s < b && h.art === 'planke').length;
      let fels = 0; for (let m = a; m < b; m++) { const p = S.punktBei(m); if (S.wandStaerke[p.i] > 0.3) fels++; }
      const hind = baeume.filter((h) => h.s > a && h.s < b && Math.abs(h.seite) - (h.r || 0) < 7).length;
      const kehre = kehren.filter((k) => k > z.kante && k - z.landeBis < 250);
      return { name: z.name, kante: z.kante, planke, fels, hind, kehre, drittel: Math.floor(z.kante / (S.laenge / 3)) };
    });
  });
  await s.schliessen();
  for (const z of o) melde(z.planke === 0 && z.fels === 0 && z.hind === 0 && !z.kehre.length, `${z.name} (Kante ${z.kante} m, Drittel ${z.drittel + 1}): Landezone ${z.kante}+: Leitplanke ${z.planke}, Felswand ${z.fels} m, Hindernisse auf ±7 m ${z.hind}, Kehre in 250 m nach der Landezone: ${z.kehre.join(', ') || 'keine'}`);
  melde(new Set(o.map((z) => z.drittel)).size === 3, `je ein Sprung pro Drittel (${o.map((z) => z.drittel + 1).join(', ')})`);
}
// Testfahrer-Läufe (strecke-abfahren --json: Sprünge je Stil) – Alpen jetzt mit Sprüngen; Vergleich ohne Sprünge = Stand nach
// Teil B (vorC, gleich wie 0.10c.2 ohne Kontakt)
if (teil('u') || teil('v')) {
  const zeile = [], schlecht = [], gewinn = [];
  const zt = (z, k) => z[(k + 150) / 10] - z[(k - 100) / 10];
  for (const id of AUTOS) {
    const n = testfahrerLauf('alpen', id), o = ALT ? testfahrerLauf('alpen', id, ALT, 'alt') : null;
    for (const st of n.stile) {
      const x = o && o.stile.find((q) => q.stil === st.stil);
      const sp = st.spruenge || [];
      const nahAufprall = (st.aufprallListe || []).filter((p) => ALPEN_SPRUENGE.some((k) => { const m = parseFloat(p.s ?? p); return m > k && m < k + 120; }));
      const nahStrafe = (st.motorStrafen || []).filter((p) => ALPEN_SPRUENGE.some((k) => (p.s ?? 0) > k && (p.s ?? 0) < k + 120));
      const ok = sp.length === 3 && sp.every((q) => q.verlust <= 0.35 && q.aufStrasse) && !nahAufprall.length && !nahStrafe.length && st.zeit != null;
      if (!ok) schlecht.push(`${id}/${st.stil}: ${sp.length} Sprünge, ${sp.map((q) => `${q.klasse} −${(q.verlust * 100).toFixed(0)} %${q.aufStrasse ? '' : ' neben der Strasse'}`).join(', ')}, Aufpralle nah ${nahAufprall.length}, Strafen nah ${nahStrafe.length}`);
      const d = x ? ALPEN_SPRUENGE.map((k) => zt(st.zeitBei, k) - zt(x.zeitBei, k)) : [];
      if (d.some((v) => v < -0.2)) gewinn.push(`${id}/${st.stil} ${d.map((v) => v.toFixed(2)).join(' / ')} s`);
      zeile.push(`| ${id} | ${st.stil} | ${sp.map((q) => `${q.weite.toFixed(1)} m @ ${q.abTempo.toFixed(0)} km/h, ${q.klasse}`).join('; ')} | ${d.map((v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}`).join(' / ')} s | ${fmtZ(st.zeit)}${x ? ` (vorher ${fmtZ(x.zeit)})` : ''} |`);
    }
  }
  fs.writeFileSync(path.join(LOG, 'spruenge-alpen.md'), `| Auto | Stil | Sprünge (Weite @ Absprung, Landung) | Zeit je Sprung (−100 bis +150 m) gegen ohne Sprung | Etappe |\n|---|---|---|---|---|\n${zeile.join('\n')}\n`);
  if (teil('u')) { titel('(u) Alpen-Sprünge: kein Überschlag/Schaden, Landung nur Tempoverlust ≤ 35 %, keine Wand-Strafe (alle 5 Autos, alle Stile)'); for (const z of schlecht) info(z); melde(!schlecht.length, `${AUTOS.length * STILE_B.length - schlecht.length} von ${AUTOS.length * STILE_B.length} Läufen: alle 3 Sprünge auf der Strasse gelandet, Verlust ≤ 35 %, kein Aufprall, keine Strafe (Tabelle ${LOG}/spruenge-alpen.md)`); }
  if (teil('v')) { titel('(v) kein Zeitgewinn über 0.2 s je Sprung (Zeit 100 m vor bis 150 m nach der Kante gegen dieselbe Strecke ohne Kuppe)'); if (!ALT) melde(false, 'nur mit --alt'); else melde(!gewinn.length, `${gewinn.length ? gewinn.join('; ') : 'nirgends schneller als 0.2 s – Sprünge sind keine Abkürzung'}`); }
}
if (teil('w')) {
  titel('(w) SPRUNG-Ansage 175 m vor jeder Kante (Alpen), Pace-Notes sonst wie bisher (pacenotes-test)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  const r = await s.page.evaluate(async () => {
    const A = window.__alpineRally, { berechnePaceNotes } = await import('/js/pacenotes.js');
    const d = berechnePaceNotes(A.strecke, A.netz);
    const teile = d.notes.flatMap((x) => x.teile).filter((t) => t.art === 'sprung');
    return { sprung: teile.map((t) => ({ s: Math.round(t.s), vorlauf: t.vorlauf })), vor: A.CONFIG.pacenotes.sprungVor };
  });
  await s.schliessen();
  melde(r.sprung.length === 3 && r.vor === 175 && r.sprung.every((t, i) => t.s === ALPEN_SPRUENGE[i] && t.vorlauf === 175), `${r.sprung.length} SPRUNG-Ansagen: ${JSON.stringify(r.sprung)}, Vorlauf pacenotes.sprungVor = ${r.vor} m; im Spiel gemessen: pacenotes-test (h)`);
  const p = werkzeug('pacenotes-test.mjs', []);
  fs.writeFileSync(path.join(LOG, 'pacenotes.log'), p.text);
  const rot = p.text.split('\n').filter((x) => /^FEHLER/.test(x));
  const neu = rot.filter((x) => !(x.includes('(c) alle Kurven gemessen') && x.includes('796–847 m heute 60.3')));
  for (const x of rot) info(x.slice(0, 220));
  melde(!neu.length || (neu.length === 1 && rot[0].includes('981–1026 m')), `pacenotes-test: ${rot.length} rot (bekannt: 796–847 m 60.3 statt 59.9 km/h; neu seit Teil B, nicht durch die Sprünge: 981–1026 m 63.2 statt 62.1 km/h – Messfahrt streift die Absperrung, Spiel nutzt die gespeicherten Werte)`);
}
if (teil('abk')) {
  titel('(abk) Abkürzungs-Prüfung Alpen vorher/nachher (127 / 2 / 342 / 84, keine neue gefährliche Abkürzung)');
  const z = (t) => [...t.matchAll(/übrig in Kurve [\d – ]+: (\d+) Linien/g)].map((m) => +m[1]).join('/') + ` | Durchkommen ${(/Durchkommen in gesperrten Kurven: (\d+)/.exec(t) || [])[1]}`;
  const r = werkzeug('abkuerzungen.mjs', ['--strecke', 'alpen', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-alpen.log'), r.text);
  melde(r.code === 0 && z(r.text) === '127/2/342/84 | Durchkommen 0', `Alpen jetzt: ${z(r.text)} (vorher 127/2/342/84 | Durchkommen 0)`);
}
if (teil('x')) {
  titel('(x) Finnland bit-gleich zu 0.10c.2 (Läufe ohne Kontakt, alle Autos, alle Stile; Länge, Sprünge 14.5 / 23.8 / 38.0 / 30.3 m)');
  if (!ALT) melde(false, 'nur mit --alt');
  else bitGleich(['finnland'], 'finnland');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  const w = await s.page.evaluate(WEITEN, [100]), L = await s.page.evaluate(() => window.__alpineRally.strecke.laenge);
  await s.schliessen();
  const soll = { KIEFERNKUPPE: 14.5, BIRKENKUPPE: 23.8, HOCHWALDKUPPE: 38.0, SEEKUPPE: 30.3 };
  melde(Math.abs(L - 4161.6) <= 0.5 && Object.entries(soll).every(([k, v]) => w[k] && Math.abs(w[k][0].weite - v) <= 0.5), `Länge ${L.toFixed(1)} m; Weiten ${Object.entries(w).map(([k, v]) => `${k} ${v[0].weite.toFixed(1)}`).join(', ')}`);
}
// Bildzeit: Median aus 5 Läufen, abwechselnd alt/neu, im selben Lauf gegen eine Referenz (Finnland, unverändert)
async function bildzeitLauf(wurzel, strecke, s0, cp, extra = '', speicher = null) {
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=${strecke}${extra}`, speicher ? { speicher } : {});
  await s.page.evaluate(() => new Promise((ok) => setTimeout(ok, 4500)));
  const r = await s.page.evaluate(async ([s0, cp]) => {
    const A = window.__alpineRally, P = A.physik;
    A.rennen.naechsterCp = cp; A.setzeAuf(s0); A.kameraSofort();
    P.vx = Math.sin(P.richtung) * 110 / 3.6; P.vz = Math.cos(P.richtung) * 110 / 3.6; A.testEingabe = { gas: 1 };
    const zeiten = []; let t0 = performance.now(); const l0 = A.flug ? A.flug.ereignis.landung : 0;
    await new Promise((ok) => { const f = () => { const t = performance.now(); zeiten.push(t - t0); t0 = t; if (zeiten.length < 150) requestAnimationFrame(f); else ok(); }; requestAnimationFrame(f); });
    A.testEingabe = null; zeiten.sort((a, b) => a - b);
    return { ms: zeiten[Math.floor(zeiten.length / 2)], gesprungen: A.flug ? A.flug.ereignis.landung - l0 : 0, rh: document.getElementById('spiel').height };
  }, [s0, cp]);
  await s.schliessen();
  return r;
}
async function bildzeitVergleich(a, b, n = 5) {
  // a, b: { wurzel, extra, speicher }; Strecke Alpen ab 2080 m (über die Almkuppe), Referenz Finnland 3020 m
  const reihen = { a: [], b: [], refA: [], refB: [] }, spr = [];
  for (let i = 0; i < n; i++) {
    const x = await bildzeitLauf(a.wurzel, 'alpen', 2080, 2, a.extra || '', a.speicher); reihen.a.push(x.ms);
    const y = await bildzeitLauf(b.wurzel, 'alpen', 2080, 2, b.extra || '', b.speicher); reihen.b.push(y.ms); spr.push(y.gesprungen);
    reihen.refA.push((await bildzeitLauf(a.wurzel, 'finnland', 3020, 3, a.extra || '')).ms);
    reihen.refB.push((await bildzeitLauf(b.wurzel, 'finnland', 3020, 3, b.extra || '')).ms);
  }
  const m = Object.fromEntries(Object.entries(reihen).map(([k, v]) => [k, med(v)]));
  return { m, roh: (m.b / m.a - 1) * 100, bereinigt: ((m.b / m.refB) / (m.a / m.refA) - 1) * 100, spr, reihen };
}
if (teil('y')) {
  titel('(y) Bildzeit Alpen (über die Almkuppe, 110 km/h, Median aus 5, abwechselnd, gegen Finnland bereinigt): Sprünge höchstens +3 %');
  if (!ALT) melde(false, 'nur mit --alt');
  else {
    const r = await bildzeitVergleich({ wurzel: ALT, extra: '&aufloesung=320x180' }, { wurzel: WURZEL, extra: '&aufloesung=320x180' });
    fs.writeFileSync(path.join(LOG, 'bildzeit-C.json'), JSON.stringify(r, null, 1));
    info(`Median (ms): Alpen 0.10c.2 ${r.m.a.toFixed(1)} / jetzt ${r.m.b.toFixed(1)}; Finnland ${r.m.refA.toFixed(1)} / ${r.m.refB.toFixed(1)}; gesprungen ${r.spr.join(',')}`);
    melde(r.spr.every((x) => x >= 1) && (r.roh <= 3 || r.bereinigt <= 3), `Alpen ${r.roh >= 0 ? '+' : ''}${r.roh.toFixed(1)} %, bereinigt ${r.bereinigt >= 0 ? '+' : ''}${r.bereinigt.toFixed(1)} %`);
  }
}

// ===================================================================== Teil D: kurze Mittags-Schatten in den Alpen
// Bild-Prüfsumme: Spiel mit eigener Bild-Uhr, Auto an festen Stellen, 3D-Bild (fest 320x180) als Zahl
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
  return { out, gezeigt: A.schatten ? A.schatten.gezeigt : null, anzahl: A.schatten ? A.schatten.anzahl : null };
};
async function bildSummen(wurzel, strecke, schattenAn, stellen) {
  const sp = { 'alpineRally.einstellungen': JSON.stringify({ schatten: schattenAn }) };
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=${strecke}&aufloesung=320x180`, { uhr: true, speicher: sp });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; window.__bild(5, 1000 / 60); });
  const r = await s.page.evaluate(BILD_SUMME, { stellen });
  await s.schliessen();
  return r;
}
const STELLEN_A = [300, 1200, 2140, 2560, 3300], STELLEN_F = [495, 1500, 2600, 3300];
if (teil('z')) {
  titel('(z) SCHATTEN AUS: Alpen-Bilder bit-gleich zu Stand nach Teil C (5 Stellen, 320x180)');
  const altC = arg('--altC') ? path.resolve(arg('--altC')) : null;
  if (!altC) melde(false, 'nur mit --altC <ordner Stand nach Teil C>');
  else { const n = await bildSummen(WURZEL, 'alpen', false, STELLEN_A), a = await bildSummen(altC, 'alpen', false, STELLEN_A); melde(JSON.stringify(n.out) === JSON.stringify(a.out), `${n.out.filter((x, i) => x === a.out[i]).length} von ${n.out.length} Bildern gleich`); }
}
if (teil('aa')) {
  titel('(aa) SCHATTEN AN (Alpen): Flecken ≤ Budget 60 je Bild, Auto-Schatten vorhanden, Bild anders als AUS');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&aufloesung=320x180', { uhr: true });
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally, S = A.schatten; A.anhalten = true; let max = 0, n = 0;
    for (let s0 = 50; s0 < A.strecke.laenge - 50; s0 += 25) { A.setzeAuf(s0); window.__bild(1, 1000 / 60); max = Math.max(max, S.gezeigt); n++; }
    return { max, n, anzahl: S.anzahl, auto: !!(S.auto && S.auto.visible), aktiv: S.aktiv, budget: A.CONFIG.schatten.max };
  });
  await s.schliessen();
  melde(r.aktiv && r.max <= r.budget && r.max > 10 && r.auto, `${r.anzahl} Schatten-Quellen nahe der Strasse; je Bild höchstens ${r.max} Flecken (Budget ${r.budget}, ${r.n} Stellen); Auto-Schatten ${r.auto ? 'da' : 'FEHLT'}`);
  const an = await bildSummen(WURZEL, 'alpen', true, STELLEN_A), aus = await bildSummen(WURZEL, 'alpen', false, STELLEN_A);
  melde(an.out.every((x, i) => x !== aus.out[i]), `AN gegen AUS: ${an.out.filter((x, i) => x !== aus.out[i]).length} von ${an.out.length} Bildern anders`);
}
if (teil('ab')) {
  titel('(ab) Bildzeit Alpen mit gegen ohne Schatten (Median aus 5, abwechselnd, gegen Finnland bereinigt): höchstens +10 %');
  const r = await bildzeitVergleich({ wurzel: WURZEL, extra: '&aufloesung=320x180', speicher: { 'alpineRally.einstellungen': JSON.stringify({ schatten: false }) } },
    { wurzel: WURZEL, extra: '&aufloesung=320x180', speicher: { 'alpineRally.einstellungen': JSON.stringify({ schatten: true }) } });
  fs.writeFileSync(path.join(LOG, 'bildzeit-D.json'), JSON.stringify(r, null, 1));
  info(`Median (ms): Alpen ohne ${r.m.a.toFixed(1)} / mit Schatten ${r.m.b.toFixed(1)}; Finnland ${r.m.refA.toFixed(1)} / ${r.m.refB.toFixed(1)}`);
  melde(r.roh <= 10 || r.bereinigt <= 10, `Alpen mit Schatten ${r.roh >= 0 ? '+' : ''}${r.roh.toFixed(1)} %, bereinigt ${r.bereinigt >= 0 ? '+' : ''}${r.bereinigt.toFixed(1)} %`);
}
if (teil('ac')) {
  titel('(ac) Finnland-Bilder bit-gleich zu 0.10c.2 (SCHATTEN AN und AUS, 4 Stellen, 320x180)');
  if (!ALT) melde(false, 'nur mit --alt');
  else for (const an of [true, false]) { const n = await bildSummen(WURZEL, 'finnland', an, STELLEN_F), a = await bildSummen(ALT, 'finnland', an, STELLEN_F); melde(JSON.stringify(n.out) === JSON.stringify(a.out), `SCHATTEN ${an ? 'AN' : 'AUS'}: ${n.out.filter((x, i) => x === a.out[i]).length} von ${n.out.length} gleich`); }
}

// ===================================================================== Zusammenfassung
const zeilen = ergebnisse.map((e) => `| ${e.titel.slice(0, 110)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
fs.writeFileSync(path.join(LOG, 'tabelle.md'), `| Test | Ergebnis |\n|---|---|\n${zeilen.join('\n')}\n`);
console.log(fehler ? `${fehler} FEHLER` : 'alles ok');
process.exit(fehler ? 1 : 0);
