// Bilder für Meilenstein 5a.1 (Credits, Bäume im Fels, Wurf an der Felswand).
//
//   node tools/m5a1-bilder.mjs --endung b                     Bilder nach screenshots/m5a-1/ (nachher)
//   node tools/m5a1-bilder.mjs --wurzel <ordner> --endung a   alte Version (vorher), gleiche Stellen, ohne Credits
//
// 1280x720, ohne HUD:
//   fels-…   Stellen, an denen vorher Bäume/Steine im Fels standen (1948 m usw.) und alle Wand-Enden
//   wurf-…   Auto fährt neben der Strasse (Wiese, 18 m neben der Mitte) mit 60 km/h geradeaus auf den Anfang
//            der Felswand bei 1914 m: drei Bilder hintereinander (kurz vor, kurz nach dem Kontakt, 0.6 s später),
//            feste Kamera von der anderen Strassenseite, dazu die Spielkamera
//   credits-…  Credits Deutsch und Englisch (auch 320x180), dazu eine Probe mit 6 Namen
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const ordner = path.join(WURZEL, 'screenshots/m5a-1');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
await spiel.ladeSpiel();
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });
const warte = (n = 3) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const foto = async (name) => { await warte(4); await page.screenshot({ path: path.join(ordner, `${name}-${endung}.png`) }); console.log('  ', `${name}-${endung}.png`); };

// --- 1. Felswand-Stellen (von der Strasse her, Kamera auf der anderen Strassenseite) ---
// s = Blickziel (Meter), von = Kamera so viele Meter davor (negativ = dahinter), lat = Ziel so weit neben der Mitte
const STELLEN = [
  { name: 'fels-01-1948m-wand-ende-links-nah', s: 1948, von: 22, lat: 9, h: 3 },
  { name: 'fels-02-1948m-fahrersicht', s: 1948, fahrer: true },
  { name: 'fels-03-1914m-wandanfang-links', s: 1922, von: 26, lat: 9, h: 3 },
  { name: 'fels-04-1966m-wandende-links', s: 1958, von: -26, lat: 9, h: 3 },
  { name: 'fels-05-2430m-wandanfang-links', s: 2432, von: 24, lat: 10, h: 2 },
  { name: 'fels-06-2494m-wandende-links', s: 2486, von: -26, lat: 9, h: 3 },
  { name: 'fels-07-3170m-abfahrt-rechts', s: 3172, von: 24, lat: 9, h: 3 },
  { name: 'fels-08-3132m-wandanfang-rechts', s: 3140, von: 26, lat: 9, h: 3 },
  { name: 'fels-09-3417m-wandende-rechts', s: 3410, von: -26, lat: 9, h: 3 },
];
for (const st of STELLEN) {
  await page.evaluate((st) => {
    const A = window.__alpineRally, S = A.strecke;
    A.testKamera = null;
    let ws = 0;
    for (let d = 0; d < 60 && !ws; d++) ws = S.wandSeite[S.punktBei(st.s + d).i] || S.wandSeite[S.punktBei(st.s - d).i];
    if (st.fahrer) { A.setzeAuf(st.s - 12, 1.75 * ws); return; }
    const p = S.punktBei(st.s), k = S.punktBei(st.s - st.von);
    A.setzeAuf(st.s - st.von - 40 * Math.sign(st.von || 1)); // Auto aus dem Bild
    A.testKamera = {
      pos: [k.x + k.tz * ws * 3, k.h + 1.7, k.z - k.tx * ws * 3],
      ziel: [p.x - p.tz * ws * st.lat, p.h + st.h, p.z + p.tx * ws * st.lat],
    };
  }, st);
  await foto(st.name);
}
await page.evaluate(() => { window.__alpineRally.testKamera = null; });

// --- 2. Wurf: von der Wiese geradeaus auf den Wandanfang (1914 m, links, 12 m neben der Mitte, 60 km/h) ---
// erst ohne Bilder durchfahren: Wann berührt das Auto die Wand (erste Korrektur der Grenze)?
const FAHRT = { sZiel: 1918, lat: 18, kmh: 60 };
const kontakt = await page.evaluate((F) => {
  const A = window.__alpineRally, S = A.strecke, P = A.physik, dt = A.SCHRITT;
  const ws = -1, p = S.punktBei(F.sZiel - 35);
  window.__wurfStart = () => {
    A.setzeAuf(S.s[p.i], 0);
    const blick = Math.atan2(p.tx, p.tz);
    P.reset(p.x - p.tz * ws * F.lat, p.z + p.tx * ws * F.lat, blick);
    P.vx = Math.sin(blick) * F.kmh / 3.6; P.vz = Math.cos(blick) * F.kmh / 3.6;
    A.getriebe.reset();
    A.kameraSofort();
  };
  window.__wurfGas = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
  window.__wurfStart();
  const orig = P.anGrenze;
  let t = 0, erst = null;
  P.anGrenze = function (...a) { if (erst == null && a[2] > 0) erst = t; return orig.apply(this, a); };
  for (; t < 3.5 && erst == null; t += dt) A.physikSchritt(dt, window.__wurfGas, true);
  P.anGrenze = orig;
  return erst;
}, FAHRT);
console.log(`  Wurf-Szene: erste Berührung der Wand nach ${kontakt == null ? '–' : kontakt.toFixed(2) + ' s'}`);
const zeiten = kontakt == null ? [1.5, 2.0, 2.5] : [Math.max(0, kontakt - 0.1), kontakt + 0.05, kontakt + 0.6];
for (const kamera of ['fest', 'spiel']) {
  await page.evaluate(() => window.__wurfStart());
  let t = 0;
  for (let n = 0; n < zeiten.length; n++) {
    const info = await page.evaluate(([bis, t0, kamera]) => {
      const A = window.__alpineRally, S = A.strecke, P = A.physik, dt = A.SCHRITT;
      let t = t0;
      for (; t < bis - 1e-9; t += dt) A.physikSchritt(dt, window.__wurfGas, true);
      const q = S.abfrage(P.x, P.z);
      if (kamera === 'fest') {
        const k = S.punktBei(1900), z = S.punktBei(1918);
        A.testKamera = { pos: [k.x + k.tz * -1 * 10, k.h + 9, k.z - k.tx * -1 * 10], ziel: [z.x - z.tz * -1 * 10, z.h, z.z + z.tx * -1 * 10] };
      } else { A.testKamera = null; A.kameraSofort(); }
      return { t, s: q.s, seite: -q.seite, kmh: P.tempo * 3.6 };
    }, [zeiten[n], t, kamera]);
    t = info.t;
    await foto(`wurf-${kamera}-${n + 1}`);
    console.log(`      t ${info.t.toFixed(2)} s: ${info.s.toFixed(1)} m, ${info.seite.toFixed(1)} m neben der Mitte (Wandseite), ${info.kmh.toFixed(0)} km/h`);
  }
}
await page.evaluate(() => { window.__alpineRally.testKamera = null; });

// --- 3. Credits (nur dieses Projekt) ---
if (wurzel === WURZEL) {
  await page.evaluate(() => {
    const A = window.__alpineRally;
    A.setzeAuf(1500);
    A.zumHauptmenue();
    A.menue.oeffne(A.seiten.credits);
  });
  await page.addStyleTag({ content: '#hud { display: block !important; }' });
  const sprache = (s) => page.evaluate((s) => {
    const e = window.__alpineRally.seiten.einstellungen.eintraege.find((x) => x.text === 'einst.sprache' && x.typ === 'auswahl');
    e.setzen(s);
  }, s);
  for (const spr of ['de', 'en']) {
    await sprache(spr);
    await page.waitForTimeout(500);
    await foto(`credits-${spr}`);
    await page.setViewportSize({ width: 320, height: 180 });
    await page.waitForTimeout(400);
    await foto(`credits-${spr}-320x180`);
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  // Probe: 6 Namen (3 + 3), rollt die Seite?
  await sprache('de');
  await page.evaluate(() => {
    const A = window.__alpineRally, C = A.CONFIG.menue.credits;
    window.__creditsAlt = { ...C };
    C.mitwirkende = ['LOUIS', 'ANNA', 'BEAT']; C.unterstuetzer = ['SHAI-RON', 'MARIA', 'ZOE'];
    A.menue.schliesse(); A.menue.oeffne(A.seiten.credits);
  });
  await page.waitForTimeout(500);
  await foto('credits-probe-6-namen-oben');
  for (let k = 0; k < 12; k++) await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(500);
  await foto('credits-probe-6-namen-unten');
  await page.evaluate(() => { Object.assign(window.__alpineRally.CONFIG.menue.credits, window.__creditsAlt); });
}
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`, spiel.fehler);
await spiel.schliessen();
