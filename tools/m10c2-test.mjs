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

// ===================================================================== Unveränderlich: Alpen (aus tools/m10c-test.mjs, gegen 0.10c)
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
