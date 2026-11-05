// Meilenstein 10c.2 prüfen:  node tools/m10c2-test.mjs --alt <ordner 0.10c.1> [--alt10c <ordner 0.10c>] [--nur a,b,...] [--lang]
// (0.10c.1: git worktree add <ordner> 0fdf269; 0.10c: 612cc62, nur für die Kamera-Tabelle). Alles in Chromium (Playwright,
// Software-Grafik), kein echtes Handy, kein Gamepad, Ton nur gemessen (nicht gehört). Vorlage: tools/m10c1-test.mjs.
//   Teil A – Wand-Strafe „Motor sammelt sich“: (a) Dauer nach Verlust, (b) Leistungskurve, (c) Schalten, (d) Stapeln,
//       (e) Zurücksetzen/Pause, (f) Sprung-Landung ohne Strafe, (g) kein Steckenbleiben, (h) MOTOR-Leuchte im HUD,
//       (i) ohne Kontakt bit-gleich, (j) Kurven-Vergleich, (k) Abkürzungen, (l) alte rote Tests, (m) Ton
//   Teil B – Sprungkamera-Stufen: (n) NORMAL-Metriken, (o) RUHIG bit-gleich, (p) AUS, (q) Migration, (r) Pixelraster,
//       (s) Flugweiten, (t) Bildzeit
//   Teil C – Landungs-Wums: (u) Pegel, (v) Spitze, (w) Ducking, (x) Pause/Lautstärke, (y) Alpen still, (z) Haptik
//   Unveränderlich: (x1) Alpen Länge/Abkürzungen, (x2) Strecken-Daten gleich, (zz) nur mit --lang: frühere Tests

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k) || (/^x\d$/.test(k) && NUR.includes('x1-5'));
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m10c2';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M10C2_AUTOS ? process.env.M10C2_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const BASIS = '0fdf269'; // 0.10c.1
const ALT10C = arg('--alt10c') ? path.resolve(arg('--alt10c')) : null;
if (!ALT) info(`Vergleiche gegen 0.10c.1 nur mit --alt <ordner> (git worktree add <ordner> ${BASIS})`);
const med = (l) => { const a = [...l].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };

// Spiel öffnen (wie tools/m10c-test.mjs). uhr: eigene Bild-Uhr; speicher: localStorage; finnland: Streckendatei unterschieben
async function oeffne(wurzel, adresse = '', { uhr = false, speicher = null, auto, finnland = null, breite = 640, hoehe = 360, geraet } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, ...(auto ? { auto } : {}), ...(geraet ? { geraet } : {}) });
  s.fehler = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  if (finnland) await s.page.route('**/strecken/finnland.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: finnland }));
  if (uhr) await s.page.addInitScript(() => {
    let jetzt = 0; const warte = [];
    performance.now = () => jetzt;
    window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
    window.cancelAnimationFrame = () => {};
    window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
    window.__foto = () => {
      window.__bild(1, 1000 / 60);
      const a = document.getElementById('spiel'), h = document.getElementById('hud');
      const c = document.createElement('canvas'); c.width = h.width; c.height = h.height;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      x.drawImage(a, 0, 0, h.width, h.height); x.drawImage(h, 0, 0);
      return c.toDataURL();
    };
  });
  await s.page.goto(`${s.url}/index.html${adresse}`);
  return s;
}
const bereit = (s) => s.page.waitForFunction(() => window.__alpineRally || window.__fehlerseite, null, { timeout: 120000, polling: 100 });
const bilder = (s, n) => s.page.evaluate((n) => window.__bild(n, 1000 / 60), n);

const foto = (s) => s.page.evaluate(() => window.__foto());

// ===================================================================== Bausteine (aus tools/m10c1-test.mjs)
const STILE_B = ['vorsichtig', 'mittel', 'flott', 'digital', 'wand'];
function testfahrerLauf(strecke, auto, wurzel = WURZEL, stand = "neu", extra = []) {
  const datei = path.join(LOG, `fahrt-${stand}-${strecke}-${auto}${extra.length ? `-${extra.join("")}` : ""}.json`);
  if (fs.existsSync(datei) && !(stand === 'neu' && process.env.M10C2_NEU)) return JSON.parse(fs.readFileSync(datei, 'utf8'));
  const a = [path.join(wurzel, 'strecken', `${strecke}.js`), '--auto', auto, '--stil', STILE_B.join(','), '--json', datei, '--aus', path.join(LOG, `fahrt-${stand}-${strecke}-${auto}.txt`)];
  if (wurzel !== WURZEL) a.push("--wurzel", wurzel);
  a.push(...extra);
  const r = werkzeug('strecke-abfahren.mjs', a);
  if (!fs.existsSync(datei)) { console.log(r.text.slice(-2000)); throw new Error(`strecke-abfahren ${strecke} ${auto} ${stand}`); }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
const fmtZ = (t) => (t == null ? 'NICHT IM ZIEL' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);

// Im Spiel: Auto an eine echte Leitplanke (Alpen) bzw. Felswand stellen
const AN_DIE_WAND = ({ art, winkel, kmh, gas = 0, bremse = 0, sek = 1.5, lenk = 0, abstand = 0.6 }) => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke, q = {};
  A.anhalten = true;
  let s0 = null, seite = 0, lat = 0;
  if (art === 'fels') {
    for (let i = 300; i < S.anzahl - 300 && s0 == null; i += 5) if (S.wandStaerke[i] > 0.95 && S.wandStaerke[i + 30] > 0.95 && S.wandStaerke[i - 30] > 0.95) { s0 = i; seite = S.wandSeite[i]; lat = A.CONFIG.grenze.wandGrenze; }
  } else {
    // eine lange gerade Leitplanke: Kreis, dessen Nachbarn 10 m vor und zurück gleich weit neben der Mitte stehen
    const pl = A.strassenrand.hindernisse.filter((h) => h.rand === 'planke');
    for (const h of pl) {
      S.abfrage(h.x, h.z, q); const sh = q.s, la = q.seite;
      if (sh < 300 || Math.abs(la) > 7) continue;
      const nah = pl.filter((g) => Math.hypot(g.x - h.x, g.z - h.z) < 12).map((g) => S.abfrage(g.x, g.z, {}));
      if (nah.length > 25 && nah.every((g) => Math.abs(g.seite - la) < 0.15)) { s0 = sh; seite = Math.sign(la); lat = Math.abs(la) - h.r; break; }
    }
  }
  const p = S.punktBei(s0);
  A.setzeAuf(s0);
  const rx = -p.tz, rz = p.tx; // rechts (seite > 0 = rechts)
  const a = winkel * Math.PI / 180, fx = Math.cos(a) * p.tx + Math.sin(a) * rx * seite, fz = Math.cos(a) * p.tz + Math.sin(a) * rz * seite;
  const g = Math.atan2(fx, fz);
  // Auto so hin, dass die vordere Ecke zur Wand hin noch "abstand" Meter Luft hat
  const L = A.CONFIG.kollision.autoLaenge / 2, Bh = A.CONFIG.kollision.autoBreite / 2;
  const ecke = L * Math.sin(a) + Bh * Math.cos(a);
  const d = lat - ecke - abstand;
  P.reset(p.x + rx * seite * d, p.z + rz * seite * d, g);
  P.vx = Math.sin(g) * kmh / 3.6; P.vz = Math.cos(g) * kmh / 3.6;
  const out = { s0, seite, lat, kontakte: 0, w0: P.richtung };
  const e0 = A.wand.einschlaege; let ersteKontakt = null;
  for (let t = 0; t < sek; t += A.SCHRITT) {
    A.physikSchritt(A.SCHRITT, { gas, bremse, lenkung: lenk, handbremse: false, reset: false });
    if (A.wand.kontakt) { out.kontakte++; if (ersteKontakt == null) ersteKontakt = { t, w: P.richtung }; }
  }
  out.strafen = A.wand.einschlaege - e0; out.tempo = P.tempo * 3.6; out.vVor = P.vVor;
  return out;
};

// ===================================================================== Teil A: Wand-Strafe „Motor sammelt sich“
const pz = (x) => `${(x * 100).toFixed(0)} %`;
// Formel aus dem Auftrag (km/h -> s), unabhängig vom Spiel gerechnet
const dauerFormel = (v) => (v < 10 ? 0 : Math.max(2, Math.min(4, 2 + ((v - 10) / 40) * 2)));
// Treffer mit genau so viel Tempoverlust (km/h) einspielen (wie wand.ende nach einem Kontakt-Schritt)
const TREFFER = (kmh, frontal = false) => {
  const W = window.__alpineRally.wand;
  W.uhr += 1; // sicher ein neuer Treffer
  W.schrittVerlust = kmh / 3.6; W.strafe = frontal; W.letzter = frontal ? { winkel: 90, vorher: 0, nachher: 0, strafe: 0.75 } : W.letzter;
  W.treffer(); W.strafe = false;
  return { rest: W.strafeRest, leistung: W.leistung() };
};
// Auto auf eine freie Stelle der Strasse stellen (kein Kontakt), stehen lassen; n Physik-Schritte, je Schritt f()
const FREI = ({ s = 2200, schritte = 1, kmh = 0 } = {}) => {
  const A = window.__alpineRally; A.anhalten = true; A.setzeAuf(s);
  A.physik.vx = Math.sin(A.physik.richtung) * kmh / 3.6; A.physik.vz = Math.cos(A.physik.richtung) * kmh / 3.6; A.physik.vVor = kmh / 3.6;
  return true;
};
if (['a', 'b', 'c', 'd', 'e', 'g'].some(teil)) {
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  const ev = (f, a) => s.page.evaluate(`(${f})(${JSON.stringify(a ?? null)})`);
  await s.page.evaluate(`window.__TREFFER = ${TREFFER}; window.__FREI = ${FREI}; window.__WAND = ${AN_DIE_WAND};`);
  if (teil('a')) {
    console.log('(a) Strafe-Dauer gegen die Formel 2 s + (Verlust − 10) / 40 · 2 s, 2 bis 4 s (±0.05 s), gemessen bis die Strafe aus ist');
    for (const v of [9, 10, 20, 30, 50, 80]) {
      const r = await s.page.evaluate((v) => {
        const A = window.__alpineRally; window.__FREI({ s: 2200 });
        const t0 = window.__TREFFER(v); let t = 0;
        while (A.wand.strafeRest > 0 && t < 10) { A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 1, lenkung: 0, handbremse: false, reset: false }); t += A.SCHRITT; }
        return { rest0: t0.rest, t, kontakt: A.wand.kontaktSchritte };
      }, v);
      const soll = dauerFormel(v);
      melde(Math.abs(r.t - soll) <= 0.05 && Math.abs(r.rest0 - soll) <= 0.05, `${v} km/h Verlust: Strafe ${r.rest0.toFixed(3)} s, gemessen ${r.t.toFixed(3)} s bis aus (Formel ${soll.toFixed(2)} s${v < 10 ? ', keine Strafe' : ''})`);
    }
    // echte Treffer im Spiel (Leitplanke, Felswand): Dauer = Formel für den gemessenen Verlust; frontal = 4 s
    for (const [art, winkel, kmh] of [['planke', 20, 80], ['planke', 45, 90], ['fels', 30, 70], ['planke', 88, 40]]) {
      const r = await s.page.evaluate(([art, winkel, kmh]) => {
        const A = window.__alpineRally; const n0 = A.wand.strafen;
        const o = window.__WAND({ art, winkel, kmh, gas: 1, sek: 0.6, abstand: 0.3 });
        return { ...o, neu: A.wand.strafen - n0, l: A.wand.strafeLetzte, rest: A.wand.strafeRest };
      }, [art, winkel, kmh]);
      const soll = r.l ? (r.l.frontal ? 4 : dauerFormel(r.l.verlust)) : 0;
      melde(r.neu >= 1 && Math.abs(r.l.dauer - soll) <= 0.05, `${art} ${winkel}° mit ${kmh} km/h: ${r.neu} Treffer mit Strafe, Verlust ${r.l ? r.l.verlust.toFixed(1) : '–'} km/h${r.l && r.l.frontal ? ' (frontal)' : ''}, Dauer ${r.l ? r.l.dauer.toFixed(2) : '–'} s (Soll ${soll.toFixed(2)} s)`);
    }
  }
  if (teil('b')) {
    console.log('(b) Antriebsfaktor 0.25 → 1.0 glatt (smoothstep), Ende ohne Sprung');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally; window.__FREI({ s: 2200 });
      window.__TREFFER(30);
      const l = [A.wand.leistung()];
      while (A.wand.strafeRest > 0) { A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 1, lenkung: 0, handbremse: false, reset: false }); l.push(A.wand.leistung()); }
      let maxD = 0, steigt = true; for (let i = 1; i < l.length; i++) { maxD = Math.max(maxD, Math.abs(l[i] - l[i - 1])); if (l[i] < l[i - 1] - 1e-12) steigt = false; }
      return { start: l[0], vorEnde: l[l.length - 2], ende: l[l.length - 1], maxD, steigt, n: l.length, mitte: l[Math.floor(l.length / 2)] };
    });
    melde(Math.abs(r.start - 0.25) < 1e-9 && r.steigt && r.maxD < 0.004 && r.vorEnde > 0.9999 && r.ende === 1 && Math.abs(r.mitte - 0.625) < 0.01,
      `Start ${r.start.toFixed(3)}, Mitte ${r.mitte.toFixed(3)}, letzter Schritt vor Ende ${r.vorEnde.toFixed(6)}, danach ${r.ende}; grösster Schritt ${r.maxD.toFixed(4)} (${r.n} Schritte, steigt nur)`);
    // Wirkung im Antrieb: Antriebskraft aus dem Getriebe vor und nach der Drosselung (main.js), Vollgas 40 km/h
    const a = await s.page.evaluate(() => {
      const A = window.__alpineRally, Gt = A.getriebe, G = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false };
      const orig = Gt.schritt; let vor = 0, obj = null;
      Gt.schritt = function (...x) { obj = orig.apply(this, x); vor = obj.beschl; return obj; };
      const l = [];
      try {
        window.__FREI({ s: 2200, kmh: 40 }); for (let i = 0; i < 30; i++) A.physikSchritt(A.SCHRITT, G);
        A.physikSchritt(A.SCHRITT, G); const normal = obj.beschl / vor;
        window.__TREFFER(50);
        for (let i = 0; i < 480 && A.wand.strafeRest > 0; i++) { A.physikSchritt(A.SCHRITT, G); if (vor > 0) l.push([obj.beschl / vor, A.wand.leistung()]); }
        return { normal, erst: l[0][0], abw: Math.max(...l.map(([r, w]) => Math.abs(r - w))), n: l.length };
      } finally { Gt.schritt = orig; }
    });
    melde(a.normal === 1 && Math.abs(a.erst - 0.25) < 0.01 && a.abw < 1e-9, `Antriebskraft ohne Strafe ×${a.normal}, im ersten Schritt nach dem Treffer ×${a.erst.toFixed(3)}, danach immer genau der Leistungsfaktor (grösste Abweichung ${a.abw.toExponential(1)}, ${a.n} Schritte mit Gas)`);
  }
  if (teil('c')) {
    console.log('(c) Gangwechsel: während der Strafe doppelt so lang, sonst gleich (Schaltlicht aus)');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, Gt = A.getriebe, G = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false };
      const miss = (strafe) => {
        window.__FREI({ s: 30, kmh: 25 });
        if (strafe) window.__TREFFER(80);
        let t = 0, an = null, dauer = null, n = 0;
        while (t < 6 && dauer == null) {
          if (strafe && A.wand.strafeRest < 1) window.__TREFFER(80); // Strafe bleibt sicher an
          A.physikSchritt(A.SCHRITT, G); t += A.SCHRITT; n++;
          if (Gt.schaltet && an == null) an = t;
          if (!Gt.schaltet && an != null) dauer = t - an;
        }
        return dauer;
      };
      return { normal: miss(false), strafe: miss(true), soll: A.CONFIG.getriebe.schaltDauerHoch, faktor: A.CONFIG.kollision.wandStrafe.schaltFaktor };
    });
    melde(Math.abs(r.normal - r.soll) <= 0.01 && Math.abs(r.strafe - r.soll * r.faktor) <= 0.01, `Hochschalten 1→2: normal ${r.normal.toFixed(3)} s (Getriebe ${r.soll} s), während der Strafe ${r.strafe.toFixed(3)} s (Soll ${(r.soll * r.faktor).toFixed(2)} s)`);
  }
  if (teil('d')) {
    console.log('(d) Stapeln: zweiter Treffer = Restzeit + neue Dauer, höchstens 6 s; Leistung fällt wieder auf 0.25');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, B = { gas: 0, bremse: 1, lenkung: 0, handbremse: false, reset: false };
      window.__FREI({ s: 2200 });
      const e1 = window.__TREFFER(30);                                   // 3 s
      for (let i = 0; i < 120; i++) A.physikSchritt(A.SCHRITT, B);       // 1 s später: noch 2 s, Leistung gestiegen
      const vor = { rest: A.wand.strafeRest, leistung: A.wand.leistung() };
      const e2 = window.__TREFFER(20);                                   // + 2.5 s = 4.5 s
      const e3 = window.__TREFFER(50);                                   // + 4 s, höchstens 6 s
      const e4 = window.__TREFFER(80);
      return { e1, vor, e2, e3, e4 };
    });
    melde(Math.abs(r.e1.rest - 3) < 0.01 && Math.abs(r.vor.rest - 2) < 0.01 && Math.abs(r.e2.rest - 4.5) < 0.01 && r.e2.leistung === 0.25 && r.e3.rest === 6 && r.e4.rest === 6,
      `3 s; nach 1 s Rest ${r.vor.rest.toFixed(2)} s (Leistung ${r.vor.leistung.toFixed(2)}); + 20 km/h → ${r.e2.rest.toFixed(2)} s (Leistung ${r.e2.leistung}); + 50 km/h → ${r.e3.rest.toFixed(2)} s; + 80 km/h → ${r.e4.rest.toFixed(2)} s`);
  }
  if (teil('e')) {
    console.log('(e) Zurücksetzen: R, Neustart, Menü, Countdown beenden die Strafe; Pause friert sie ein (Wasser: Finnland unten)');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, out = {};
      const an = () => { window.__TREFFER(80); window.__TREFFER(80); return A.wand.strafeRest; };
      window.__FREI({ s: 2200 }); an(); A.aufStrasse(); out.aufStrasse = A.wand.strafeRest;
      window.__FREI({ s: 2200 }); an(); A.neustart(); out.neustart = A.wand.strafeRest;
      return out;
    });
    melde(r.aufStrasse === 0 && r.neustart === 0, `nach „zurück auf die Strasse“ ${r.aufStrasse} s, nach Neustart ${r.neustart} s Strafe`);
    await s.schliessen();
    // Echte Spielschleife mit eigener Bild-Uhr: Taste R (mit Wartezeit), Pause, Menü, Countdown
    const u = await oeffne(WURZEL, '?menue=aus&ton=aus', { uhr: true });
    await bereit(u);
    await u.page.evaluate(`window.__TREFFER = ${TREFFER};`);
    await u.page.evaluate(() => window.__alpineRally.start({ countdown: false }));
    await bilder(u, 30);
    const p = await u.page.evaluate(() => {
      const A = window.__alpineRally, out = {};
      window.__TREFFER(80); window.__TREFFER(80); out.vor = A.wand.strafeRest;
      A.pausieren(); window.__bild(240, 1000 / 60); out.inPause = A.wand.strafeRest; A.weiter(); window.__bild(60, 1000 / 60); out.nachWeiter = A.wand.strafeRest;
      A.rTaste(); window.__bild(60 * 5, 1000 / 60); out.nachR = A.wand.strafeRest; out.rRest = A.rueck.rest;
      window.__TREFFER(80); window.__TREFFER(80); out.vorMenue = A.wand.strafeRest; A.zumHauptmenue(); window.__bild(5, 1000 / 60); out.nachMenue = A.wand.strafeRest;
      window.__TREFFER(80); A.start(); window.__bild(5, 1000 / 60); out.countdown = A.wand.strafeRest; out.zustand = A.rennen.zustand;
      return out;
    });
    melde(p.vor === 6 && p.inPause === 6 && p.nachWeiter < 6 && p.nachWeiter > 4.9, `Pause: 6 s → nach 4 s Pause ${p.inPause.toFixed(2)} s (eingefroren), 1 s nach Weiter ${p.nachWeiter.toFixed(2)} s`);
    melde(p.nachR === 0, `Taste R (4 s Wartezeit, dann zurück auf die Strasse): Strafe danach ${p.nachR} s (6 s Strafe, 5 s gewartet: ohne R wären noch ca. 1 s übrig; R-Zähler ${p.rRest})`);
    melde(p.nachMenue === 0 && p.countdown === 0, `Hauptmenü: ${p.nachMenue} s; Start mit Countdown (${p.zustand}): ${p.countdown} s`);
    melde(u.fehler.length === 0, `Konsole ohne Fehler (${u.fehler.length})`);
    await u.schliessen();
  } else await s.schliessen();
}
if (teil('g')) {
  console.log('(g) kein Steckenbleiben: Treffer mit Strafe an Leitplanke bzw. Felswand, dann rückwärts frei (gleich weit wie ohne Strafe)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  await s.page.evaluate(`window.__WAND = ${AN_DIE_WAND};`);
  for (const art of ['planke', 'fels']) {
    const r = await s.page.evaluate((art) => {
      const A = window.__alpineRally, P = A.physik, out = {};
      for (const an of [true, false]) {
        A.CONFIG.kollision.wandStrafe.an = an;
        const o = window.__WAND({ art, winkel: 70, kmh: 40, gas: 1, sek: 1.2, abstand: 0.3 });
        const x0 = P.x, z0 = P.z, rest = A.wand.strafeRest;
        for (let t = 0; t < 2.5; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 1, lenkung: 0, handbremse: false, reset: false });
        out[an ? 'mit' : 'ohne'] = { weg: Math.hypot(P.x - x0, P.z - z0), rest, kontakt: A.wand.kontakt, s0: o.s0 };
      }
      A.CONFIG.kollision.wandStrafe.an = true;
      return out;
    }, art);
    melde(r.mit.rest > 1 && r.mit.weg > 1 && !r.mit.kontakt && Math.abs(r.mit.weg - r.ohne.weg) < 0.05, `${art} bei ${r.mit.s0.toFixed(0)} m, 70° mit 40 km/h: Strafe ${r.mit.rest.toFixed(2)} s; 2.5 s rückwärts ${r.mit.weg.toFixed(2)} m (ohne Strafe ${r.ohne.weg.toFixed(2)} m), Kontakt am Ende ${r.mit.kontakt}`);
  }
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
// ---- (i) Läufe ohne Kontakt bit-gleich (Testfahrer, beide Strecken, alle Autos, alle Stile), Läufe mit Kontakt berichten
let laufe = null;
function alleLaeufe() {
  if (laufe) return laufe;
  laufe = { neu: {}, alt: {} };
  for (const strecke of ['alpen', 'finnland']) for (const id of AUTOS) {
    laufe.neu[`${strecke}-${id}`] = testfahrerLauf(strecke, id);
    if (ALT) laufe.alt[`${strecke}-${id}`] = testfahrerLauf(strecke, id, ALT, 'alt');
  }
  return laufe;
}
// Zeit je 10 m ab dem ersten Messpunkt (rennen.uhr läuft schon vor dem Start, ihr Anfang zählt nicht)
const relativ = (l) => { const a = (l || []).find((x) => x >= 0); return (l || []).map((x) => (x < 0 ? x : +(x - a).toFixed(9))); };
if (teil('i')) {
  console.log('(i) Läufe ohne Hindernis-Kontakt bit-gleich wie 0.10c.1 (Alpen und Finnland, alle Autos, alle Stile)');
  if (!ALT) info('nur mit --alt');
  else {
    const L = alleLaeufe();
    const ohne = [], anders = [], mit = [], tab = ['| Strecke | Auto | Stil | 0.10c.1: Zeit (Wand, Aufpr.) | 0.10c.2: Zeit (Wand, Aufpr., Motor-Strafen, Zeit mit Strafe) |', '|---|---|---|---|---|'];
    const rev = [];
    for (const k of Object.keys(L.neu)) for (const stil of STILE_B) {
      const x = L.neu[k].stile.find((q) => q.stil === stil), y = L.alt[k].stile.find((q) => q.stil === stil);
      const [strecke, id] = k.split('-');
      tab.push(`| ${strecke} | ${id} | ${stil} | ${fmtZ(y.zeit)} (${y.wandKontakte.length}, ${y.aufpralle}) | ${fmtZ(x.zeit)} (${x.wandKontakte.length}, ${x.aufpralle}, ${x.motorStrafen.length}, ${x.strafeZeit.toFixed(1)} s) |`);
      if (stil === 'mittel' && Math.abs((x.zeit ?? 999) - (y.zeit ?? 999)) > 1) rev.push(`${k} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)}`);
      const kontakt = y.wandKontakte.length > 0 || x.wandKontakte.length > 0;
      if (kontakt) { mit.push(`${k}/${stil} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)} (Wand ${y.wandKontakte.length} → ${x.wandKontakte.length}, Motor-Strafen ${x.motorStrafen.length})`); continue; }
      ohne.push(k);
      if (x.zeit !== y.zeit || x.aufpralle !== y.aufpralle || JSON.stringify(x.cps) !== JSON.stringify(y.cps) || JSON.stringify(x.aufprallListe) !== JSON.stringify(y.aufprallListe) || JSON.stringify(relativ(x.zeitBei)) !== JSON.stringify(relativ(y.zeitBei))) anders.push(`${k}/${stil} ${fmtZ(y.zeit)} → ${fmtZ(x.zeit)}`);
    }
    fs.writeFileSync(path.join(LOG, 'testfahrer-tabelle.md'), `${tab.join('\n')}\n`);
    fs.writeFileSync(path.join(LOG, 'laeufe-mit-kontakt.txt'), `${mit.join('\n')}\n`);
    melde(anders.length === 0 && ohne.length > 0, `${ohne.length} Läufe ohne Wandkontakt: Zeit, Zwischenzeiten, Zeit je 10 m und Aufpralle (Ort, Tempo) gleich${anders.length ? ` – ANDERS: ${anders.join('; ')}` : ''}`);
    info(`${mit.length} Läufe mit Wandkontakt (dürfen sich ändern): ${LOG}/laeufe-mit-kontakt.txt; Tabelle ${LOG}/testfahrer-tabelle.md`);
    melde(rev.length === 0, `Stil „mittel“: keine Verschiebung über 1 s (sonst neue revision)${rev.length ? `: ${rev.join('; ')}` : ''}`);
    // Lanza 073 Finnland „digital“: Kontakte, Zeit mit/ohne Strafe
    const l = L.neu['finnland-l073'];
    if (l) {
      const ohneStr = testfahrerLauf('finnland', 'l073', WURZEL, 'neu', ['--ohne-strafe']);
      for (const stil of ['digital', 'mittel']) {
        const x = l.stile.find((q) => q.stil === stil), o = ohneStr.stile.find((q) => q.stil === stil), y = L.alt['finnland-l073'].stile.find((q) => q.stil === stil);
        info(`Lanza 073 Finnland „${stil}“: 0.10c.1 ${fmtZ(y.zeit)} (${y.aufpralle} Aufpralle, ${y.wandKontakte.length} Wandkontakte) → mit Strafe ${fmtZ(x.zeit)} (${x.aufpralle} Aufpralle, ${x.wandKontakte.length} Wandkontakte, ${x.motorStrafen.length} Motor-Strafen ${x.motorStrafen.map((m) => `${m.s} m/${m.verlust} km/h/${m.dauer} s`).join(', ')}), ohne Strafe ${fmtZ(o.zeit)}; Aufpralle: ${x.aufprallListe.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}`);
      }
    }
  }
}
// ---- (j) Kurven-Vergleich: Stil „wand“ in keiner Kehre schneller als die beste kontaktfreie Fahrt (±0.1 s)
function kurvenVergleich(strecke, auto, wurzel, stand) {
  const datei = path.join(LOG, `kv-${stand}-${strecke}-${auto}.json`);
  if (!fs.existsSync(datei) || (stand === 'neu' && process.env.M10C2_NEU)) {
    const a = [path.join(wurzel, 'strecken', `${strecke}.js`), '--auto', auto, '--kurven-vergleich', '--json', datei];
    if (wurzel !== WURZEL) a.push('--wurzel', wurzel);
    const r = werkzeug('strecke-abfahren.mjs', a);
    if (!fs.existsSync(datei)) { console.log(r.text.slice(-1500)); throw new Error(`kurven-vergleich ${strecke} ${auto} ${stand}`); }
  }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
if (teil('j')) {
  console.log('(j) Kurven-Vergleich je Kehre/180-Grad-Kurve (100 m davor bis 100 m danach): „wand“ gegen beste kontaktfreie Fahrt (flott/digital)');
  const tab = ['| Strecke | Auto | Kurve (m) | beste ohne Kontakt | wand 0.10c.1 | wand 0.10c.2 (Strafen) | Gegenprobe: sanft ohne Kontakt | wand gegen sanft |', '|---|---|---|---|---|---|---|---|'];
  const schneller = [], ohneVgl = [], schnellerSanft = [];
  for (const strecke of ['alpen', 'finnland']) for (const id of AUTOS) {
    const n = kurvenVergleich(strecke, id, WURZEL, 'neu'), a = ALT ? kurvenVergleich(strecke, id, ALT, 'alt') : null;
    n.forEach((k, i) => {
      const ka = a && a[i];
      const d = (x) => (x == null ? '–' : `${x >= 0 ? '+' : ''}${x.toFixed(2)} s`);
      const ref = [k.best, k.bestDosiert].filter(Boolean).reduce((m, x) => (!m || x.zeit < m.zeit ? x : m), null);
      const dS = ref && k.wand.fertig ? k.wand.zeit - ref.zeit : null;
      tab.push(`| ${strecke} | ${id} | ${k.von}–${k.bis} | ${k.best ? `${k.best.stil} ${k.best.zeit.toFixed(2)} s${k.ersatz ? ' (Ersatz mittel)' : ''}` : '–'} | ${ka ? `${d(ka.diff)}${ka.wand.kontakt ? '' : ' (ohne Kontakt)'}` : '–'} | ${d(k.diff)}${k.wand.kontakt ? ` (${k.wand.strafen})` : ' (ohne Kontakt)'} | ${k.bestDosiert ? `${k.bestDosiert.zeit.toFixed(2)} s` : '–'} | ${d(dS)} |`);
      if (k.diff == null) ohneVgl.push(`${strecke}/${id} ${k.von} m`);
      else if (k.diff < -0.1 && k.wand.kontakt) schneller.push(`${strecke}/${id} ${k.von} m ${d(k.diff)}`);
      if (dS != null && dS < -0.1 && k.wand.kontakt) schnellerSanft.push(`${strecke}/${id} ${k.von} m ${d(dS)}`);
    });
  }
  fs.writeFileSync(path.join(LOG, 'kurven-vergleich.md'), `${tab.join('\n')}\n`);
  for (const z of tab.filter((z) => z.includes('| alpen |'))) info(z);
  melde(schneller.length === 0, `„wand“ mit Wandkontakt in keiner Kurve mehr als 0.1 s schneller als die beste kontaktfreie Fahrt${schneller.length ? `: ${schneller.join('; ')}` : ''}${ohneVgl.length ? ` (ohne Vergleich: ${ohneVgl.join(', ')})` : ''}; Tabelle ${LOG}/kurven-vergleich.md`);
  info(`Gegenprobe (kontaktfrei, sanftes Gas wie die Strafe ab dem Scheitel, beste von flott/digital/sanft): „wand“ mehr als 0.1 s schneller in ${schnellerSanft.length} Kurven${schnellerSanft.length ? `: ${schnellerSanft.join('; ')}` : ''}`);
}
// ---- (k) Abkürzungs-Prüfungen nicht schlechter
if (teil('k')) {
  console.log('(k) Abkürzungs-Prüfung Alpen nicht schlechter (127 / 2 / 342 / 84), Finnland nicht schlechter als 0.10c.1');
  const z = (t) => [...t.matchAll(/übrig in Kurve [\d – ]+: (\d+) Linien/g)].map((m) => +m[1]).join('/') + ` | Durchkommen ${(/Durchkommen in gesperrten Kurven: (\d+)/.exec(t) || [])[1]}`;
  const r = werkzeug('abkuerzungen.mjs', ['--strecke', 'alpen', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-alpen.log'), r.text);
  melde(r.code === 0 && z(r.text) === '127/2/342/84 | Durchkommen 0', `Alpen: ${z(r.text)}`);
  const n = werkzeug('abkuerzungen.mjs', ['--strecke', 'finnland', '--pruefen']);
  fs.writeFileSync(path.join(LOG, 'abkuerzungen-finnland.log'), n.text);
  const a = ALT ? werkzeug('abkuerzungen.mjs', ['--strecke', 'finnland', '--pruefen'], ALT) : null;
  melde(n.code === 0 && (!a || z(n.text) === z(a.text)), `Finnland: ${z(n.text)}${a ? ` (0.10c.1: ${z(a.text)})` : ''}`);
}
// ---- (l) die alten roten Tests (aus dem 0.10c.1-Bericht): entschieden und grün
if (teil('l')) {
  console.log('(l) alte rote Tests: strassenrand/felswand/startziel (Erwartung angepasst), nebenweg (Fahrskript behoben)');
  for (const datei of ['strassenrand-test.mjs', 'felswand-test.mjs', 'startziel-test.mjs', 'nebenweg-test.mjs']) {
    const r = werkzeug(datei, []);
    fs.writeFileSync(path.join(LOG, datei.replace('.mjs', '.log')), r.text);
    const rot = r.text.split('\n').filter((x) => /^\s*(FEHLT|FEHLER)\s/.test(x));
    melde(r.code === 0 && rot.length === 0, `${datei}: ${rot.length ? rot.slice(0, 2).map((x) => x.trim().slice(0, 140)).join(' | ') : 'grün'}`);
  }
}
// ---- (e) Wasser-Teleport (Finnland, Seekehre) und (f) Sprung-Landung ohne Strafe
// Fahren mit einfachem Nachlenken auf die Strassenmitte (15 m voraus), Gas voll
const FOLGE = (sek, gas = 1, proSchritt = null) => {
  const A = window.__alpineRally, P = A.physik, S = A.strecke, q = {};
  for (let t = 0; t < sek; t += A.SCHRITT) {
    S.abfrage(P.x, P.z, q); const z = S.punktBei(Math.min(S.laenge - 1, q.s + 15));
    const f = Math.atan2(Math.sin(Math.atan2(z.x - P.x, z.z - P.z) - P.richtung), Math.cos(Math.atan2(z.x - P.x, z.z - P.z) - P.richtung));
    A.physikSchritt(A.SCHRITT, { gas, bremse: 0, lenkung: Math.max(-1, Math.min(1, -f * 2.5)), handbremse: false, reset: false });
    if (proSchritt && proSchritt(t)) break;
  }
};
if (teil('e') || teil('f')) {
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  await s.page.evaluate(`window.__TREFFER = ${TREFFER}; window.__FOLGE = ${FOLGE};`);
  if (teil('e')) {
    console.log('(e) Wasser-Teleport (Seekehre) beendet die Strafe');
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, P = A.physik;
      A.anhalten = true; A.rennen.naechsterCp = 3; A.setzeAuf(3280); A.rennen.zustand = 'laeuft';
      P.vx = Math.sin(P.richtung) * 25; P.vz = Math.cos(P.richtung) * 25;
      window.__TREFFER(80); window.__TREFFER(80);
      const bad0 = A.wasserBad.anzahl; let rein = null, nachTeleport = null;
      for (let t = 0; t < 12; t += A.SCHRITT) {
        A.rennSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false });
        if (rein == null && A.wasserBad.anzahl > bad0) rein = { t, rest: A.wand.strafeRest };
        if (rein && A.wasserBad.versetzt && nachTeleport == null) nachTeleport = A.wand.strafeRest;
        if (rein && !A.wasserBad.aktiv) break;
      }
      return { rein, nachTeleport, ende: A.wand.strafeRest };
    });
    melde(r.rein && r.rein.rest > 0 && r.nachTeleport === 0 && r.ende === 0, `Strafe beim Platsch ${r.rein ? r.rein.rest.toFixed(2) : '–'} s, nach dem Teleport ${r.nachTeleport} s, nach dem Schwarzbild ${r.ende} s`);
  }
  if (teil('f')) {
    console.log('(f) Sprung-Landung löst keine Strafe aus (4 Sprünge, 110 und 140 km/h, Gas, harte Landungen)');
    for (const kmh of [110, 140]) {
      const r = await s.page.evaluate((kmh) => {
        const A = window.__alpineRally, P = A.physik, out = [];
        A.anhalten = true; A.rennen.zustand = 'bereit'; // (laufendes Rennen: Sprung über einen Checkpoint = zurück zum verpassten)
        for (const z of A.strecke.sprungZonen) {
          A.setzeAuf(z.kante - 60); P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6; P.vVor = kmh / 3.6;
          const n0 = A.wand.strafen; let luft = false, gelandet = false, kontakt = false;
          // geradeaus mit Gas wie die Kamera-Messung in tools/m10c1-test.mjs (bis 2 s nach der Landung)
          for (let t = 0, nach = 0; t < 8 && nach < 2; t += A.SCHRITT) {
            A.physikSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false });
            if (A.flug.inLuft) luft = true; else if (luft) { gelandet = true; nach += A.SCHRITT; }
            if (A.wand.kontakt) kontakt = true;
          }
          out.push({ kante: Math.round(z.kante), luft, gelandet, strafen: A.wand.strafen - n0, rest: A.wand.strafeRest, kontakt, landung: A.flug.letzteLandung.klasse });
        }
        return out;
      }, kmh);
      melde(r.every((x) => x.luft && x.gelandet && x.strafen === 0 && !x.kontakt), `${kmh} km/h: ${r.map((x) => `${x.kante} m ${x.luft ? 'Flug' : 'KEIN FLUG'}${x.landung ? ` (${x.landung})` : ''}, Strafen ${x.strafen}${x.kontakt ? ' (Wandkontakt nach der Landung)' : ''}`).join('; ')}`);
    }
  }
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}
// ---- (h) MOTOR-Leuchte: nur während der Strafe, weg bei HUD aus, überlappt nichts (3 Auflösungen, HUD-Grössen, Touch)
// Vergleich HUD-Bild mit/ohne Strafe (Auto steht, Bild-Uhr eigene): Unterschied = Leuchte; dort war ohne Strafe nichts gemalt
const HUD_PRUEF = async (s) => s.page.evaluate(() => {
  const A = window.__alpineRally;
  const leinwaende = () => [document.getElementById('hud'), ...document.querySelectorAll('canvas.hud-ebene')].filter((c) => c.style.display !== 'none');
  const pixel = () => leinwaende().map((c) => ({ b: c.width, h: c.height, d: c.getContext('2d').getImageData(0, 0, c.width, c.height).data }));
  const W = A.wand;
  W.strafeAus(); window.__bild(40, 1000 / 60); const ohne = pixel();
  W.strafeRest = 3; W.strafeGesamt = 3; W.strafeSeit = 0.1; window.__bild(1, 1000 / 60); const mit = pixel();
  W.strafeSeit = 1.0; window.__bild(1, 1000 / 60); const aus = pixel(); // Aus-Phase des Blinkens
  A.hudUmschalten(); A.hudSchalter.hinweis = 0; window.__bild(1, 1000 / 60); const hudAus = pixel(); // (Hinweis „HUD AUS“ blendet aus: weg)
  W.strafeAus(); window.__bild(1, 1000 / 60); const hudAusOhne = pixel(); A.hudUmschalten(); // (HUD aus: Hinweis „HUD AUS“ steht in beiden)
  window.__bild(2, 1000 / 60);
  const ergebnis = [];
  for (let k = 0; k < mit.length; k++) {
    const a = ohne[k], m = mit[k], b = a.b;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0, blinkt = 0;
    for (let i = 0; i < a.d.length; i += 4) if (a.d[i] !== m.d[i] || a.d[i + 1] !== m.d[i + 1] || a.d[i + 2] !== m.d[i + 2] || a.d[i + 3] !== m.d[i + 3]) {
      const p = i / 4, x = p % b, y = Math.floor(p / b); n++;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      if (aus[k].d[i] !== m.d[i]) blinkt++;
    }
    if (!n) { ergebnis.push({ k, n: 0 }); continue; }
    // ohne Strafe: im Rahmen der Leuchte (plus 1 Pixel Rand) ganz leer?
    let belegt = 0;
    for (let y = Math.max(0, y0 - 1); y <= Math.min(a.h - 1, y1 + 1); y++) for (let x = Math.max(0, x0 - 1); x <= Math.min(b - 1, x1 + 1); x++) if (a.d[(y * b + x) * 4 + 3] !== 0) belegt++;
    let restHudAus = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) for (let c = 0; c < 4; c++) if (hudAus[k].d[(y * b + x) * 4 + c] !== hudAusOhne[k].d[(y * b + x) * 4 + c]) { restHudAus++; break; }
    // Lage auf dem Bildschirm (für Touch-Knöpfe)
    const c = leinwaende()[k], r = c.getBoundingClientRect(), sx = r.width / c.width, sy = r.height / c.height;
    const schirm = { l: r.left + x0 * sx, o: r.top + y0 * sy, r: r.left + (x1 + 1) * sx, u: r.top + (y1 + 1) * sy };
    const knoepfe = [...document.querySelectorAll('.touch-knopf')].filter((e) => e.offsetParent).map((e) => e.getBoundingClientRect()).filter((q) => q.width > 0);
    const ueberKnopf = knoepfe.filter((q) => q.left < schirm.r && q.right > schirm.l && q.top < schirm.u && q.bottom > schirm.o).length;
    ergebnis.push({ k, n, x0, y0, x1, y1, belegt, restHudAus, blinkt, ueberKnopf, knoepfe: knoepfe.length, leinwand: `${b}x${a.h}` });
  }
  return ergebnis.filter((e) => e.n > 0);
});
if (teil('h')) {
  console.log('(h) MOTOR-Leuchte im HUD: nur während der Strafe, blinkt, weg mit H, überlappt nichts (Zeit, Pace-Notes, Karte, Tachos, Touch-Knöpfe)');
  const faelle = [
    { name: '320x180', adr: '&aufloesung=320x180' }, { name: '480x270', adr: '&aufloesung=480x270' }, { name: '640x360', adr: '&aufloesung=640x360' },
    { name: '640x360 HUD GROSS', adr: '&aufloesung=640x360', speicher: { hudGroesse: 'gross' } }, { name: '640x360 HUD KLEIN', adr: '&aufloesung=640x360', speicher: { hudGroesse: 'klein' } },
    { name: 'englisch (ENGINE)', adr: '&aufloesung=640x360', speicher: { sprache: 'en' } },
    { name: 'Touch quer (iPhone 844x390)', adr: '', breite: 844, hoehe: 390, geraet: { hasTouch: true, isMobile: true, deviceScaleFactor: 3 } },
    { name: 'Touch hoch (iPhone 390x844)', adr: '', breite: 390, hoehe: 844, geraet: { hasTouch: true, isMobile: true, deviceScaleFactor: 3 } },
  ];
  for (const f of faelle) {
    const sp = f.speicher ? { 'alpineRally.einstellungen': JSON.stringify(f.speicher) } : null;
    const s = await oeffne(WURZEL, `?menue=aus&ton=aus${f.adr}`, { uhr: true, speicher: sp, breite: f.breite || 640, hoehe: f.hoehe || 360, geraet: f.geraet });
    await bereit(s);
    await s.page.evaluate(() => { const A = window.__alpineRally; A.start({ countdown: false }); A.anhalten = true; });
    await bilder(s, 20);
    const e = await HUD_PRUEF(s);
    const x = e[0];
    melde(e.length === 1 && x.n > 20 && x.belegt === 0 && x.restHudAus === 0 && x.blinkt > 0 && x.ueberKnopf === 0,
      `${f.name}: Leuchte ${x ? `${x.x1 - x.x0 + 1}x${x.y1 - x.y0 + 1} Pixel bei (${x.x0}, ${x.y0}) auf ${x.leinwand}, ${x.n} Pixel, blinkt (${x.blinkt} Pixel anders), dort ohne Strafe belegt ${x.belegt}, bei HUD aus ${x.restHudAus}, über Touch-Knöpfen ${x.ueberKnopf} (von ${x.knoepfe})` : 'NICHT GEFUNDEN'}${s.fehler.length ? `, Konsole: ${s.fehler[0]}` : ''}`);
    await s.schliessen();
  }
}
// ---- (m) Ton: Aussetzer erzeugt Ton (Motor setzt aus, Pops), Pause dämpft, Lautstärke wirkt (offline, js/audio.js)
if (teil('m')) {
  console.log('(m) Ton: Motor-Aussetzer nach Wand-Treffer (offline gerechnet), Pause stumm, LAUTSTÄRKE wirkt');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
  await bereit(s);
  const r = await s.page.evaluate(async () => {
    const T = await import('/tools/ton-pruefung.js');
    const rms = (d, a, b) => { let x = 0; const i0 = Math.round(a * T.RATE), i1 = Math.round(b * T.RATE); for (let i = i0; i < i1; i++) x += d[i] * d[i]; return Math.sqrt(x / (i1 - i0)); };
    const fahrt = (strafeAb, pauseAb = 99) => T.rendereVerlauf((w, t) => {
      w.aktualisiere(1 / 60, T.zustand({ modus: t >= pauseAb ? 'pause' : 'rennen', drehzahl: 4500, gang: 3, zielGang: 3, gas: 1, tempo: 25, vVor: 25, motorStrafen: t >= strafeAb ? 1 : 0 }));
    }, 2.0, { limiter: false });
    const a = await fahrt(1.0), b = await fahrt(99), p = await fahrt(1.0, 1.02);
    let diff = 0; for (let i = Math.round(1.0 * T.RATE); i < Math.round(1.5 * T.RATE); i++) diff += (a.daten[i] - b.daten[i]) ** 2;
    return {
      vor: rms(a.daten, 0.6, 1.0), aus1: rms(a.daten, 1.07, 1.11), normal1: rms(b.daten, 1.07, 1.11), diff: Math.sqrt(diff / (0.5 * T.RATE)),
      zaehler: a.werk.zaehler ? a.werk.zaehler.aussetzer : null, ohne: b.werk.zaehler ? b.werk.zaehler.aussetzer : null,
      pause: rms(p.daten, 1.3, 2.0), pauseNormal: rms(b.daten, 1.3, 2.0),
    };
  });
  const db = (x, y) => (20 * Math.log10(x / y)).toFixed(1);
  melde(r.diff > 0.01 && r.aus1 < r.normal1 * 0.7, `Aussetzer: Ton anders als ohne Treffer (Unterschied RMS ${r.diff.toFixed(3)}), im ersten Aussetzer ${db(r.aus1, r.normal1)} dB gegen normal; Zähler aussetzer ${r.zaehler} (ohne Treffer ${r.ohne})`);
  melde(r.pause < r.pauseNormal * 0.1, `Pause direkt nach dem Treffer: ${db(r.pause, r.pauseNormal)} dB gegen Fahrt (Motor und Pops stumm)`);
  // Lautstärke: Pops gehen über den Motor-Bus unter master (LAUTSTÄRKE = master.gain); hier nur Aufbau geprüft
  const l = await s.page.evaluate(() => { const A = window.__alpineRally; return typeof A.ton.lautstaerke === 'function'; });
  info(`LAUTSTÄRKE: Aussetzer und Pops laufen über den Motor-Bus (motorAus → … → master), master.gain = LAUTSTÄRKE (Regler vorhanden: ${l})`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

// ===================================================================== Teil C: Landungs-Wums (offline gerechnet, js/audio.js)
// Bezug: Fahrgeräusch bei 100 km/h mit Gas (Motor, Reifen, Wind; Drehzahl und Gang aus dem echten Getriebe), Fenster 150 ms.
// Landung allein: RMS und Spitze in den ersten 150 ms. Alles über die ganze Kette (Limiter, Decke), LAUTSTÄRKE 100 %.
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
  // Verhältnis Wums : Fahrgeräusch VOR dem Limiter (der Limiter regelt die Summe mit einer Verstärkung: so steht es im Mix),
  // Spitzen und Pegel NACH der ganzen Kette (Limiter, Decke)
  const motor = await fahrt(null), motorV = await fahrt(null, false);
  const mRms = rms(motor.daten, 1.0, 1.15), mVor = rms(motor.daten, 0.6, 0.95), mRmsV = rms(motorV.daten, 1.0, 1.15);
  const out = { drehzahl: Math.round(A.getriebe.drehzahl), gang: A.getriebe.gang, motorRms: db(mRms), motorRmsVor: db(mRmsV), stufen: {} };
  const T0 = C.sprung.ton, alt = { ...T0 };
  for (const k of Object.keys(LAND)) {
    const allein = await T.rendere((w) => { w.busse.master.gain.value = lautstaerke; w.sprung('landung', { haerte: LAND[k], klasse: k, s: 0 }); }, 0.6);
    const alleinV = await T.rendere((w) => { w.busse.master.gain.value = lautstaerke; w.sprung('landung', { haerte: LAND[k], klasse: k, s: 0 }); }, 0.6, { limiter: false });
    const mit = await fahrt(k);
    // Ducking: dieselbe Fahrt, Landungs-Klänge stumm (alle Pegel 0) – übrig bleibt nur die Wirkung auf das Fahrgeräusch
    for (const key of Object.keys(T0)) if (/Pegel$|^LANDUNG_WUMMS_LAUTSTAERKE$/.test(key)) T0[key] = 0;
    const duck = await fahrt(k);
    Object.assign(T0, alt);
    out.stufen[k] = {
      rms: db(rms(allein.daten, 0, 0.15)), spitze: db(spitze(allein.daten, 0, 0.6)), rmsRel: db(rms(alleinV.daten, 0, 0.15) / mRmsV), rmsRelNach: db(rms(allein.daten, 0, 0.15) / mRms),
      spitzeMit: db(spitze(mit.daten, 0.95, 1.6)),
      duckMitte: db(rms(duck.daten, 1.05, 1.2) / mVor), duckNach: db(rms(duck.daten, 1.5, 1.7) / mVor),
    };
  }
  return out;
};
let wumsAlt = null, wumsNeu = null;
async function wumsMessung(wurzel, extra = {}) {
  const s = await oeffne(wurzel, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  const r = await s.page.evaluate(MESSE_WUMS, extra);
  await s.schliessen();
  return r;
}
if (['u', 'v', 'w'].some(teil)) {
  wumsNeu = await wumsMessung(WURZEL);
  if (ALT) wumsAlt = await wumsMessung(ALT);
  const f = (x) => `${x >= 0 ? '+' : ''}${x.toFixed(1)} dB`;
  const tab = ['| Landung | alt: gegen Fahrt im Mix (vor Limiter) / nach Kette | neu: gegen Fahrt im Mix / nach Kette | Ziel (im Mix) | Spitze alt (allein / mit Fahrt) | Spitze neu (allein / mit Fahrt) |', '|---|---|---|---|---|---|'];
  const ziel = { sauber: -3, hart: 6, sehrHart: 10 };
  for (const k of Object.keys(ziel)) {
    const a = wumsAlt && wumsAlt.stufen[k], n = wumsNeu.stufen[k];
    tab.push(`| ${k} | ${a ? `${f(a.rmsRel)} / ${f(a.rmsRelNach)}` : '–'} | ${f(n.rmsRel)} / ${f(n.rmsRelNach)} | ≥ ${f(ziel[k])} | ${a ? `${a.spitze.toFixed(1)} / ${a.spitzeMit.toFixed(1)} dBFS` : '–'} | ${n.spitze.toFixed(1)} / ${n.spitzeMit.toFixed(1)} dBFS |`);
  }
  fs.writeFileSync(path.join(LOG, 'wums-pegel.md'), `Fahrgeräusch 100 km/h, Gas, ${wumsNeu.gang}. Gang, ${wumsNeu.drehzahl}/min: RMS ${wumsNeu.motorRms.toFixed(1)} dBFS nach der Kette, ${wumsNeu.motorRmsVor.toFixed(1)} dBFS vor dem Limiter\n\n${tab.join('\n')}\n`);
  for (const z of tab) info(z);
  if (teil('u')) {
    console.log('(u) Wums-Pegel (RMS der ersten 150 ms gegen das Fahrgeräusch bei 100 km/h mit Gas, im Mix = vor dem Limiter): sauber ≥ −3 dB, hart ≥ +6 dB, sehr hart ≥ +10 dB');
    for (const k of Object.keys(ziel)) melde(wumsNeu.stufen[k].rmsRel >= ziel[k], `${k}: ${f(wumsNeu.stufen[k].rmsRel)} (Ziel ≥ ${f(ziel[k])}${wumsAlt ? `, alt ${f(wumsAlt.stufen[k].rmsRel)}` : ''})`);
  }
  if (teil('v')) {
    console.log('(v) Spitzenpegel nie über −1 dBFS (Landung allein und mit Fahrgeräusch, LAUTSTÄRKE 100 %)');
    for (const k of Object.keys(ziel)) melde(wumsNeu.stufen[k].spitze <= -1 && wumsNeu.stufen[k].spitzeMit <= -1, `${k}: allein ${wumsNeu.stufen[k].spitze.toFixed(2)} dBFS, mit Fahrt ${wumsNeu.stufen[k].spitzeMit.toFixed(2)} dBFS`);
  }
  if (teil('w')) {
    console.log('(w) Ducking: Fahrgeräusch während des Wums ca. −6 dB, 0.5 s danach wieder wie vorher (±1 dB)');
    for (const k of Object.keys(ziel)) { const n = wumsNeu.stufen[k]; melde(n.duckMitte <= -4.5 && n.duckMitte >= -7.5 && Math.abs(n.duckNach) <= 1, `${k}: während ${f(n.duckMitte)}, 0.5 s danach ${f(n.duckNach)}${wumsAlt ? ` (alt: ${f(wumsAlt.stufen[k].duckMitte)} / ${f(wumsAlt.stufen[k].duckNach)})` : ''}`); }
  }
}
if (teil('x')) {
  console.log('(x) Pause stumm, LAUTSTÄRKE wirkt (Wums bei 50 % genau −6 dB gegen 100 %, offline, vor dem Limiter)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  const r = await s.page.evaluate(async () => {
    const T = await import('/tools/ton-pruefung.js');
    const rms = (d, a, b) => { let x = 0; const i0 = Math.round(a * T.RATE), i1 = Math.round(b * T.RATE); for (let i = i0; i < i1; i++) x += d[i] * d[i]; return Math.sqrt(x / (i1 - i0)); };
    const land = (laut, pause) => T.rendereVerlauf((w, t) => {
      w.aktualisiere(1 / 60, T.zustand({ modus: pause && t >= 0.5 ? 'pause' : 'rennen', drehzahl: 900, gas: 0 }));
      if (t >= 0.5 && !w.__l) { w.__l = true; if (!pause) w.sprung('landung', { haerte: 1, klasse: 'sehrHart', s: 0 }); }
    }, 1.2, { limiter: false, vorher: (w) => { w.busse.master.gain.value = laut; } });
    const v = await land(1, false), h = await land(0.5, false), p = await land(1, true);
    return { voll: rms(v.daten, 0.5, 0.65), halb: rms(h.daten, 0.5, 0.65), pause: rms(p.daten, 0.6, 1.2), vor: rms(v.daten, 0.2, 0.45) };
  });
  const db = (x) => 20 * Math.log10(x);
  melde(Math.abs(db(r.halb / r.voll) + 6.02) < 0.3, `Wums bei LAUTSTÄRKE 50 % (master.gain 0.5): ${db(r.halb / r.voll).toFixed(2)} dB gegen 100 %`);
  melde(r.pause < r.vor * 0.5, `Pause: keine Landung ausgelöst (die Welt steht), Pegel ${db(r.pause / r.vor).toFixed(1)} dB gegen Leerlauf vorher`);
  await s.schliessen();
}
if (teil('y')) {
  console.log('(y) Alpen: keine Sprünge, kein Wums (Ton der Alpen gleich wie 0.10c.1: Klangpuffer, Testfahrer-Ton)');
  const r1 = await (async () => {
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus');
    await bereit(s);
    const r = await s.page.evaluate(async () => {
      const A = window.__alpineRally, T = await import('/tools/ton-pruefung.js');
      const { daten, werk } = await T.rendere(() => {}, 0.1);
      const sum = {}; for (const [k, b] of Object.entries(werk.puffer)) { const d = b.getChannelData(0); let x = 0; for (let i = 0; i < d.length; i += 7) x += d[i] * (i % 13 + 1); sum[k] = `${d.length}:${x.toFixed(6)}`; }
      return { zonen: A.strecke.sprungZonen.length, sum };
    });
    await s.schliessen();
    return r;
  })();
  let r0 = null;
  if (ALT) { const s = await oeffne(ALT, '?menue=aus&ton=aus'); await bereit(s); r0 = await s.page.evaluate(async () => { const T = await import('/tools/ton-pruefung.js'); const { werk } = await T.rendere(() => {}, 0.1); const sum = {}; for (const [k, b] of Object.entries(werk.puffer)) { const d = b.getChannelData(0); let x = 0; for (let i = 0; i < d.length; i += 7) x += d[i] * (i % 13 + 1); sum[k] = `${d.length}:${x.toFixed(6)}`; } return { sum }; }); await s.schliessen(); }
  const anders = r0 ? Object.keys(r0.sum).filter((k) => r0.sum[k] !== r1.sum[k]) : [];
  melde(r1.zonen === 0 && anders.length === 0, `Alpen: ${r1.zonen} Sprungzonen (kein Wums möglich); Klangpuffer gleich wie 0.10c.1: ${r0 ? (anders.length ? `ANDERS: ${anders.join(', ')}` : `alle ${Object.keys(r0.sum).length} gleich`) : 'nur mit --alt'}; neue Puffer: ${Object.keys(r1.sum).filter((k) => !r0 || !(k in r0.sum)).join(', ') || 'keine'}`);
}
if (teil('z')) {
  console.log('(z) Haptik-Ereignis „Landung“ unverändert (main.js: spielTick(\'landung\', Härte) wie in 0.10c.1)');
  const zeile = (w) => fs.readFileSync(path.join(w, 'js/main.js'), 'utf8').split('\n').find((z) => z.includes("spielTick('landung'"));
  const n = zeile(WURZEL), a = ALT ? zeile(ALT) : null;
  melde(n && (!a || n.trim() === a.trim()), `Aufruf: ${n ? n.trim().slice(0, 120) : 'FEHLT'}${a ? (n.trim() === a.trim() ? ' (gleich wie 0.10c.1)' : ' (ANDERS als 0.10c.1)') : ''}`);
}

// ===================================================================== Teil B: Sprungkamera-Stufen (Messung wie tools/m10c1-test.mjs)
const KAMERA_FILM = ({ kmh = 110, kante, cp, bilder = 260 }) => {
  const A = window.__alpineRally, P = A.physik, F = A.flug, K = A.kamera, c = A.CONFIG.kamera, out = [];
  A.anhalten = false; A.rennen.naechsterCp = cp;
  A.setzeAuf(kante - 60); A.kameraSofort();
  P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
  A.testEingabe = { gas: 1 };
  const rh = A.renderer ? A.renderer.domElement.height : document.getElementById('spiel').height;
  for (let k = 0; k < bilder; k++) {
    window.__bild(1, 1000 / 60);
    const y = A.autoModell.objekt.position.y, yaw = A.kam.yaw;
    const bx = P.x + Math.sin(yaw) * c.blickVoraus, bz = P.z + Math.cos(yaw) * c.blickVoraus, by = y + c.blickHoehe;
    const neig = Math.atan2(K.position.y - by, Math.hypot(K.position.x - bx, K.position.z - bz)) * 180 / Math.PI;
    out.push({ k, inLuft: F.inLuft, e: A.sk.e, ruck: A.sk.ruckPx, view: K.view && K.view.enabled ? Math.abs(K.view.offsetY) : 0, anheb: A.kam.ziel.y - y - c.hoehe, fov: K.fov, zoom: K.zoom, rh,
      y, kamY: K.position.y, zielY: A.kam.ziel.y, abstand: Math.hypot(K.position.x - P.x, K.position.z - P.z), neig });
  }
  A.testEingabe = null;
  return out;
};
const KAMERA_NORMAL = { abstand: 6.9, hoehe: 2.5, blickHoehe: 1.2, blickVoraus: 4 };
const neigNormal = Math.atan2(KAMERA_NORMAL.hoehe - KAMERA_NORMAL.blickHoehe, KAMERA_NORMAL.abstand + KAMERA_NORMAL.blickVoraus) * 180 / Math.PI;
function kameraMetriken(f) {
  const ab = f.findIndex((x) => x.inLuft), land = f.findIndex((x, i) => i > ab && !x.inLuft);
  if (ab < 0 || land < 0) return null;
  const vor = f[Math.max(0, ab - 5)], fenster = f.slice(ab, Math.min(f.length, land + 40));
  const zoom = Math.max(...fenster.map((x) => x.abstand)) / vor.abstand - 1;
  const ueber = Math.max(...fenster.map((x) => x.kamY - x.y));
  const anheb = Math.max(...fenster.map((x) => x.anheb)); // Anhebung des Kamera-Ziels über die normale Höhe (ohne Nachlaufen)
  const neig = Math.max(...fenster.map((x) => Math.abs(x.neig - neigNormal)));
  const neigVor = Math.abs(vor.neig - neigNormal);
  const ruck = Math.max(...f.slice(land, land + 20).map((x) => x.view)) / f[0].rh;
  let normal = f.findIndex((x, i) => i >= land && x.e === 0 && x.ruck === 0 && x.view === 0);
  const zeitNormal = normal < 0 ? Infinity : (normal - land) / 60;
  // Nachlaufen: um wie viele Bilder hinkt die Kamerahöhe ihrem Ziel hinterher (bester Verzug im Flug)
  let best = 0, bestF = Infinity;
  for (let d = 0; d <= 30; d++) {
    let q = 0;
    for (let i = ab + d; i < land + 10 && i < f.length; i++) q += (f[i].kamY - f[i - d].zielY) ** 2;
    if (q < bestF) { bestF = q; best = d; }
  }
  // Überschwingen: nach dem Normalzustand tiefer als die normale Höhe über dem Auto
  const unter = Math.max(0, ...f.slice(land, Math.min(f.length, land + 60)).map((x) => KAMERA_NORMAL.hoehe - (x.kamY - x.y)));
  const nach = f[Math.min(f.length - 1, land + 60)];
  return { ab, land, flug: (land - ab) / 60, zoom, ueber, anheb, ueberMehr: ueber - (vor.kamY - vor.y), neig, neigVor, ruck, ruckPx: Math.max(...f.slice(land, land + 20).map((x) => x.view)), zeitNormal,
    nachlauf: best / 60, unter, nach, ganz: f.every((x) => Number.isInteger(x.view) && Number.isInteger(x.ruck) && x.fov === f[0].fov && x.zoom === 1) };
}
const SPRUENGE = [{ name: 'KIEFERNKUPPE', kante: 495, cp: 0 }, { name: 'BIRKENKUPPE', kante: 1830, cp: 2 }, { name: 'HOCHWALDKUPPE', kante: 3090, cp: 3 }, { name: 'SEEKUPPE', kante: 3656, cp: 4 }];
const WEITEN = (kmhs) => {
  const A = window.__alpineRally, P = A.physik, F = A.flug; A.anhalten = true; const out = {};
  for (const z of A.strecke.sprungZonen) {
    out[z.name] = [];
    for (const kmh of kmhs) {
      A.setzeAuf(z.kante - 6); P.vx = Math.sin(P.richtung) * kmh / 3.6; P.vz = Math.cos(P.richtung) * kmh / 3.6;
      const n0 = F.ereignis.landung, a0 = F.ereignis.abheben;
      for (let t = 0; t < 6 && F.ereignis.landung === n0; t += A.SCHRITT) A.physikSchritt(A.SCHRITT, { gas: 0.4, bremse: 0, lenkung: 0, handbremse: false }, true);
      const L = F.letzteLandung;
      out[z.name].push(F.ereignis.abheben === a0 ? { kmh, ab: false } : { kmh, ab: true, weite: L.weite, hoehe: L.hoehe, zeit: L.zeit, verlust: L.verlust });
    }
  }
  return out;
};
const WEITEN_010C = { KIEFERNKUPPE: 14.5, BIRKENKUPPE: 23.8, HOCHWALDKUPPE: 38.0, SEEKUPPE: 30.3 };
// werte: NORMAL-Werte vor dem Filmen überschreiben (nur zum Abstimmen)
async function kameraMessung(wurzel, stufe = null, extra = '', werte = null) {
  const speicher = stufe == null ? null : { 'alpineRally.einstellungen': JSON.stringify({ sprungkamera: stufe }) };
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=finnland${extra}`, { uhr: true, ...(speicher ? { speicher } : {}) });
  await bereit(s);
  if (werte) await s.page.evaluate((w) => Object.assign(window.__alpineRally.CONFIG.sprung.SPRUNGKAMERA_STUFEN.normal, w), werte);
  await bilder(s, 320);
  const r = [];
  for (const j of SPRUENGE) r.push({ ...j, film: await s.page.evaluate(KAMERA_FILM, { kante: j.kante, cp: j.cp }) });
  const fehlerS = s.fehler.slice();
  const einst = await s.page.evaluate(() => window.__alpineRally.einstellungen.sprungkamera);
  await s.schliessen();
  return { r, fehler: fehlerS, einst };
}
const pz1 = (x) => `${(x * 100).toFixed(1)} %`;
const kamZeile = (m) => (m ? `Zoom-Out ${pz1(m.zoom)}, Anhebung ${m.anheb.toFixed(2)} m, Neigung ${m.neig.toFixed(1)}°, Ruck ${pz1(m.ruck)} (${m.ruckPx} px), normal nach ${m.zeitNormal.toFixed(2)} s, Nachlaufen ${m.nachlauf.toFixed(3)} s, Überschwingen ${m.unter.toFixed(3)} m` : 'KEIN SPRUNG');
if (['n', 'o', 'r'].some(teil)) {
  const KW = process.env.M10C2_KAMERA ? JSON.parse(process.env.M10C2_KAMERA) : null; // (Abstimmen: NORMAL-Werte probieren)
  const normal = await kameraMessung(WURZEL, 'normal', '', KW);
  const mN = normal.r.map((j) => kameraMetriken(j.film));
  const tab = ['| Sprung | 0.10c | RUHIG (= 0.10c.1) | NORMAL |', '|---|---|---|---|'];
  let mR = null, mA = null, ruhig = null, alt = null;
  if (teil('o') || teil('n')) {
    ruhig = await kameraMessung(WURZEL, 'ruhig'); mR = ruhig.r.map((j) => kameraMetriken(j.film));
    if (ALT10C) { const a10 = await kameraMessung(ALT10C); mA = a10.r.map((j) => kameraMetriken(j.film)); }
  }
  SPRUENGE.forEach((j, i) => tab.push(`| ${j.name} | ${mA ? kamZeile(mA[i]) : '–'} | ${mR ? kamZeile(mR[i]) : '–'} | ${kamZeile(mN[i])} |`));
  fs.writeFileSync(path.join(LOG, 'kamera-tabelle.md'), `${tab.join('\n')}\n`);
  if (teil('n')) {
    console.log('(n) NORMAL: Zoom-Out 6–8 %, Neigung höchstens 10° (Sprung 3 6–10°), Ruck 0.8–1.2 % der Bildhöhe, normal nach 0.25–0.35 s, kein Überschwingen');
    SPRUENGE.forEach((j, i) => {
      const m = mN[i];
      const neigOk = m && m.neig <= 10 && (j.name !== 'HOCHWALDKUPPE' || m.neig >= 6);
      melde(m && m.zoom >= 0.06 && m.zoom <= 0.08 && neigOk && m.ruck >= 0.008 && m.ruck <= 0.012 && m.zeitNormal >= 0.25 && m.zeitNormal <= 0.35 && m.unter < 0.05, `${j.name}: ${kamZeile(m)}`);
    });
    info(`Tabelle 0.10c / RUHIG / NORMAL: ${LOG}/kamera-tabelle.md`);
    melde(normal.einst === 'normal' && normal.fehler.length === 0, `Einstellung ${normal.einst}, Konsole ohne Fehler (${normal.fehler.length})`);
  }
  if (teil('o')) {
    console.log('(o) RUHIG bit-gleich zu 0.10c.1 (jedes Bild: Kamera, Ziel, Ruck, Zoom)');
    if (!ALT) info('nur mit --alt');
    else {
      alt = await kameraMessung(ALT);
      const gleich = alt.r.every((j, i) => JSON.stringify(j.film) === JSON.stringify(ruhig.r[i].film));
      melde(gleich, `4 Sprünge, ${ruhig.r.reduce((n, j) => n + j.film.length, 0)} Bilder: ${gleich ? 'Zahl für Zahl gleich wie 0.10c.1 (Standard AN)' : 'ANDERS'}`);
    }
  }
  if (teil('r')) {
    console.log('(r) NORMAL ganzzahlig im Pixelraster in 320x180 / 480x270 / 640x360 (Versatz ganze Bildpunkte, Blickwinkel fest, Zoom 1; Ruck ca. 1 %)');
    for (const a of ['320x180', '480x270', '640x360']) {
      const k = await kameraMessung(WURZEL, 'normal', `&aufloesung=${a}`);
      const m = k.r.map((j) => kameraMetriken(j.film));
      melde(m.every((x) => x && x.ganz && x.ruck >= 0.008 && x.ruck <= 0.012), `${a}: ganzzahlig ${m.map((x) => x && x.ganz).join('/')}, Ruck ${m.map((x) => `${x.ruckPx} px = ${pz1(x.ruck)}`).join(', ')}`);
    }
  }
}
if (teil('p')) {
  console.log('(p) SPRUNGKAMERA AUS: Kamera bewegt sich bei Sprüngen nicht');
  const { r, fehler: fe } = await kameraMessung(WURZEL, 'aus');
  for (const j of r) {
    const ab = j.film.findIndex((x) => x.inLuft);
    const normal = j.film.every((x) => x.e === 0 && x.ruck === 0 && x.view === 0 && Math.abs(x.zielY - (x.y + KAMERA_NORMAL.hoehe)) < 1e-9);
    melde(ab > 0 && normal, `${j.name}: gesprungen (Bild ${ab}), in allen ${j.film.length} Bildern kein Zurückziehen, kein Ruck, Kamera-Ziel = Autohöhe + 2.5 m`);
  }
  melde(fe.length === 0, `Konsole ohne Fehler (${fe.length})`);
}
if (teil('q')) {
  console.log('(q) Migration: gespeichert AN → NORMAL, AUS → AUS, ohne Eintrag → NORMAL; Menü mit drei Werten (de/en)');
  for (const [gesp, soll] of [[true, 'normal'], [false, 'aus'], [undefined, 'normal'], ['ruhig', 'ruhig']]) {
    const sp = { 'alpineRally.einstellungen': JSON.stringify(gesp === undefined ? { lautstaerke: 80 } : { sprungkamera: gesp }) };
    const s = await oeffne(WURZEL, '?menue=aus&ton=aus', { speicher: sp });
    await bereit(s);
    const r = await s.page.evaluate(() => { const A = window.__alpineRally; const e = A.seiten.einstellungen.eintraege.find((x) => x.text === 'einst.sprungkamera'); return { wert: A.einstellungen.sprungkamera, menue: e && e.lesen(), optionen: e && e.optionen ? e.optionen().map((o) => o.wert).join('/') : null }; });
    await s.schliessen();
    melde(r.wert === soll && r.menue === soll && r.optionen === 'aus/ruhig/normal', `gespeichert ${JSON.stringify(gesp)} → ${r.wert} (Menü ${r.menue}, Werte ${r.optionen})`);
  }
  const q = fs.readFileSync(path.join(WURZEL, 'js/texte.js'), 'utf8');
  const t = /'wert\.ruhig': \{ de: '([^']+)', en: '([^']+)' \}/.exec(q);
  melde(t && /^[A-ZÄÖÜ ]+$/.test(t[1]) && /^[A-Z ]+$/.test(t[2]), `Text RUHIG: de ${t && t[1]}, en ${t && t[2]} (Pixelschrift: nur Grossbuchstaben)`);
}
if (teil('s')) {
  console.log('(s) Flugweiten bei 100 km/h unverändert (±0.5 m: 14.5 / 23.8 / 38.0 / 30.3 m)');
  const s = await oeffne(WURZEL, '?menue=aus&ton=aus&strecke=finnland');
  await bereit(s);
  const w = await s.page.evaluate(WEITEN, [100]);
  await s.schliessen();
  for (const [name, [r]] of Object.entries(w)) melde(r.ab && Math.abs(r.weite - WEITEN_010C[name]) <= 0.5, `${name}: ${r.weite.toFixed(2)} m (0.10c ${WEITEN_010C[name]} m), Höhe ${r.hoehe.toFixed(2)} m, ${r.zeit.toFixed(2)} s`);
}
async function bildzeitLauf(wurzel, strecke, extra = '', speicher = null) {
  const s = await oeffne(wurzel, `?menue=aus&ton=aus&strecke=${strecke}${extra}`, speicher ? { speicher } : {});
  await bereit(s);
  await s.page.evaluate(() => new Promise((ok) => setTimeout(ok, 4500)));
  const r = await s.page.evaluate(async (strecke) => {
    const A = window.__alpineRally, P = A.physik;
    A.rennen.naechsterCp = strecke === 'finnland' ? 3 : 2; A.setzeAuf(strecke === 'finnland' ? 3020 : 2560); A.kameraSofort();
    P.vx = Math.sin(P.richtung) * 110 / 3.6; P.vz = Math.cos(P.richtung) * 110 / 3.6; A.testEingabe = { gas: 1 };
    const zeiten = []; let t0 = performance.now(); const l0 = A.flug ? A.flug.ereignis.landung : 0;
    await new Promise((ok) => { const f = () => { const t = performance.now(); zeiten.push(t - t0); t0 = t; if (zeiten.length < 150) requestAnimationFrame(f); else ok(); }; requestAnimationFrame(f); });
    A.testEingabe = null; zeiten.sort((a, b) => a - b);
    return { ms: zeiten[Math.floor(zeiten.length / 2)], gesprungen: A.flug ? A.flug.ereignis.landung - l0 : 0, rh: document.getElementById('spiel').height };
  }, strecke);
  await s.schliessen();
  return r;
}
if (teil('t')) {
  console.log('(t) Bildzeit Finnland mit Sprung (SPRUNGKAMERA NORMAL, Median aus 5, im selben Lauf gegen die Alpen) gegen 0.10c.1, 320x180');
  if (!ALT) info('nur mit --alt');
  else {
    const reihen = { alpenAlt: [], alpenNeu: [], fiAlt: [], fiNeu: [] };
    for (let i = 0; i < 5; i++) {
      reihen.alpenAlt.push(await bildzeitLauf(ALT, 'alpen')); reihen.alpenNeu.push(await bildzeitLauf(WURZEL, 'alpen'));
      reihen.fiAlt.push(await bildzeitLauf(ALT, 'finnland')); reihen.fiNeu.push(await bildzeitLauf(WURZEL, 'finnland'));
    }
    const m = Object.fromEntries(Object.entries(reihen).map(([k, v]) => [k, med(v.map((x) => x.ms))]));
    const rel = (a, b) => (a / b - 1) * 100;
    const bereinigt = rel(m.fiNeu / m.alpenNeu, m.fiAlt / m.alpenAlt);
    fs.writeFileSync(path.join(LOG, 'bildzeit.json'), JSON.stringify({ reihen, median: m }, null, 1));
    info(`Median je Bild (ms): Alpen alt ${m.alpenAlt.toFixed(1)} / neu ${m.alpenNeu.toFixed(1)}; Finnland alt ${m.fiAlt.toFixed(1)} / neu ${m.fiNeu.toFixed(1)}`);
    melde(reihen.fiNeu.every((x) => x.gesprungen >= 1) && (rel(m.fiNeu, m.fiAlt) <= 1 || bereinigt <= 1), `Bildzeit Finnland ${rel(m.fiNeu, m.fiAlt).toFixed(1)} % gegen 0.10c.1, gegen die Alpen bereinigt ${bereinigt.toFixed(1)} % (Grenze +1 %)`);
  }
}

// ===================================================================== Unveränderlich
if (teil('x1')) {
  console.log('(x1) Längen: Alpen 3667.587 m, Finnland 4161.6 m (±0.5), Sprungzonen und Checkpoints gleich wie 0.10c.1');
  const info1 = async (w, st) => { const s = await oeffne(w, `?menue=aus&ton=aus&strecke=${st}`); await bereit(s); const r = await s.page.evaluate(() => { const A = window.__alpineRally; return { laenge: A.strecke.laenge, cps: A.CONFIG.checkpoints.beiMeter, zonen: A.strecke.sprungZonen.map((z) => [z.kante, z.landeVon, z.landeBis]) }; }); await s.schliessen(); return r; };
  for (const [st, soll] of [['alpen', 3667.587], ['finnland', 4161.6]]) {
    const n = await info1(WURZEL, st), a = ALT ? await info1(ALT, st) : null;
    melde(Math.abs(n.laenge - soll) <= 0.5 && (!a || JSON.stringify(a) === JSON.stringify(n)), `${st}: ${n.laenge.toFixed(3)} m, Checkpoints ${n.cps.join('/')}, Sprungzonen ${n.zonen.length}${a ? ` – ${JSON.stringify(a) === JSON.stringify(n) ? 'gleich' : 'ANDERS'} wie 0.10c.1` : ''}`);
  }
}
if (teil('x2')) {
  console.log('(x2) Alpen-Testfahrer Prototyp (Referenz 2:59.33 / 2:42.35 / 2:31.92) gleich wie 0.10c.1');
  const zeilen = (t) => t.split('\n').filter((x) => /^\s+(vorsichtig|mittel|flott|Talschleife|Almweg|Wiesenweg)\b/.test(x)).map((x) => x.trim());
  const neu = werkzeug('testfahrer.mjs', ['--auto', 'prototyp']);
  fs.writeFileSync(path.join(LOG, 'testfahrer-prototyp.log'), neu.text);
  const zn = zeilen(neu.text), zeiten = zn.filter((x) => /^(vorsichtig|mittel|flott)/.test(x)).map((x) => x.split(/\s+/)[1]).join(' / ');
  const za = ALT ? zeilen(werkzeug('testfahrer.mjs', ['--auto', 'prototyp', '--wurzel', ALT]).text) : null;
  melde(zeiten === '2:59.33 / 2:42.35 / 2:31.92' && (!za || JSON.stringify(za) === JSON.stringify(zn)), `prototyp: ${zeiten} – ${zn.length} Zeilen${za ? (JSON.stringify(za) === JSON.stringify(zn) ? ' identisch wie 0.10c.1' : ' ANDERS') : ''}`);
}
if (teil('zz') && process.argv.includes('--lang')) {
  console.log('(zz) Frühere Tests (Teile, die nicht am alten Quelltext hängen)');
  const laeufe = [
    ['pacenotes-test.mjs', []], ['leben-test.mjs', []], ['kuh-test.mjs', []], ['startziel-test.mjs', []], ['strassenrand-test.mjs', []],
    ['nebenweg-test.mjs', []], ['felswand-test.mjs', []], ['belag-test.mjs', []], ['rennablauf-test.mjs', []], ['menue-test.mjs', []],
    ['overlay-test.mjs', []], ['m9a2-test.mjs', ['--nur', 'a,c,e,f,g,h,k,l,m']], ['m9a1-test.mjs', ['--nur', 'a,b,c,e,f,g,h,i,j,k,m,n,o,p,r']],
    ['m8h-test.mjs', []], ['m10c-test.mjs', ['--nur', 'c,d,e,f,g,h,i,l,m,o,r,s,t,v,x,y']],
    ['m10c1-test.mjs', ['--nur', 'h,i,j,k,n,o,p,q,s,t,v,w,y,z,aa,ab,ad']], // (M10c.2: Teile, die nicht an Kamera-Werten hängen)
  ];
  const vorher = new Set(spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter(Boolean));
  for (const [datei, a] of laeufe) {
    if (!fs.existsSync(path.join(WURZEL, 'tools', datei))) continue;
    const r = werkzeug(datei, a);
    fs.writeFileSync(path.join(LOG, datei.replace('.mjs', '.log')), r.text);
    const zeilenVon = (t) => t.split('\n').filter((x) => /^\s*(ok|OK|FEHLER)\s/.test(x));
    const z = zeilenVon(r.text);
    const rot = z.filter((x) => /^\s*FEHLER/.test(x)).map((x) => x.trim());
    // Rot? Dann denselben Test in 0.10c.1: sind genau diese Zeilen dort auch rot, ist es nicht durch M10c.2 gekommen
    let vorher = false;
    if (r.code !== 0 && ALT && fs.existsSync(path.join(ALT, 'tools', datei))) {
      const ra = werkzeug(datei, a, ALT);
      const rotAlt = new Set(zeilenVon(ra.text).filter((x) => /^\s*FEHLER/.test(x)).map((x) => x.trim()));
      vorher = rot.length > 0 && rot.every((x) => rotAlt.has(x));
    }
    melde(r.code === 0 || vorher, `${datei} ${a.join(' ')}: ${z.length - rot.length} ok, ${rot.length} rot${vorher ? ' (genau diese Zeilen sind schon in 0.10c.1 rot)' : ''}${rot.length ? ` – ${rot.slice(0, 2).map((x) => x.slice(0, 150)).join(' | ')}` : ''}`);
  }
  // Messdateien, die alte Tests neu schreiben, zurücksetzen
  const neu = spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter((d) => d && !vorher.has(d) && /^(screenshots|tools)\//.test(d));
  if (neu.length) spawnSync('git', ['checkout', '--', ...neu], { cwd: WURZEL });
  info(`von den alten Tests geänderte Messdateien zurückgesetzt: ${neu.length}`);
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
