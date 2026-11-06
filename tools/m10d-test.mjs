// Meilenstein 10d prüfen:  node tools/m10d-test.mjs --alt <ordner 0.10c.2> [--alt017 <ordner vor dem Schaltton-Fehler>] [--nur a,b,...] [--lang]
// (0.10c.2: git worktree add <ordner> b14cecc; vor dem Fehler: git worktree add <ordner> 017fb8f, nur für den Schaltton-Vergleich).
// Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein Gamepad, Ton nur gemessen (nicht gehört).
// Vorlage: tools/m10c2-test.mjs.
//   Teil A – Schaltton und Wums: (a) Schalt-Ereignisse = Gangwechsel (Testfahrer, alle Autos, beide Strecken),
//       (a2) Klang/Pegel wie vor dem Fehler (±1 dB), (a3) Stille (Menü-Demo, Countdown, Pause), (b) Quelltext-Wächter,
//       (c) Schaltton-Pegel über Mindestschwelle, (d) Wums-Pegel, (e) Spitze ≤ −1 dBFS, (f) Pause, LAUTSTÄRKE, Ducking

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

// ===================================================================== Zusammenfassung
const zeilen = ergebnisse.map((e) => `| ${e.titel.slice(0, 110)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
fs.writeFileSync(path.join(LOG, 'tabelle.md'), `| Test | Ergebnis |\n|---|---|\n${zeilen.join('\n')}\n`);
console.log(fehler ? `${fehler} FEHLER` : 'alles ok');
process.exit(fehler ? 1 : 0);
