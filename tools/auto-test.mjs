// Auto prüfen (Meilenstein 8a).  node tools/auto-test.mjs [--nur a,b,c] [--auto prototyp]
// Standard-Profil: rt4 (wo nicht anders genannt). Läuft im Headless-Browser (tools/spiel-browser.mjs) und ohne Browser.
//   (a) Modell: Masse, Radmitten, Radradius, Draw Calls und Dreiecke des Autos, kein NaN, alle Teile mit Material, Schatten
//   (b) Räder: nur vorne lenken (nie über radEinschlagMax), Drehung = Strecke / Radius, rückwärts umgekehrt,
//       Felge weich zur Scheibe ab radUnschaerfeAb (kein Springen)
//   (c) Federung: Sprungantwort (Stoss): höchstens ein Überschwinger, ruhig in unter 1.2 s, Grenzen, kein NaN;
//       Physik und stat.aufpralle mit und ohne Federung identisch; kein Speichermüll pro Bild
//   (d) Lichter: Bremslicht bei Bremse oder Handbremse, Rückfahrlicht nur rückwärts; keine neuen Materialien/Objekte
//   (e) Dreck: wächst auf Schotter, Wiesenweg, Gras, Bankett; nicht auf Asphalt (und wird dort nicht kleiner); Obergrenze;
//       sauber bei Start und Neustart; die Demo-Fahrt ändert den Dreck im Rennen nicht; kein zusätzlicher Draw Call
//   (f) Lackierungen: alle drei, Textur mit NearestFilter ohne Mipmaps, nur Zeichen der Pixelschrift, Wechsel ohne
//       Fehler, keine Datei geladen
//   (n) Auto-Labor: lädt ohne Fehler, dieselbe baueAuto(), Ansichten und Regler wirken, BILD SPEICHERN gibt ein PNG,
//       Spiel unberührt
// (g)-(m) und (o) kommen mit Teil B (Fahrgefühl) dazu.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const PROFIL = arg('--auto') || 'rt4';
const teil = (k) => !NUR || NUR.includes(k);
const ARGS = ['--js-flags=--expose-gc', '--enable-precise-memory-info'];

let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const f2 = (n) => (n == null ? '--' : Number(n).toFixed(2));

async function ladeSpiel(spiel, adresse = '?menue=aus') {
  const sep = adresse.includes('?') ? '&' : '?';
  await spiel.page.goto(`${spiel.url}/index.html${adresse}${adresse.includes('auto=') ? '' : `${sep}auto=${PROFIL}`}`);
  await spiel.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
}

const spiel = await starteSpiel({ breite: 640, hoehe: 360, args: ARGS });
const anfragen = [];
spiel.page.on('request', (r) => anfragen.push(r.url()));
await ladeSpiel(spiel);
await spiel.page.evaluate(() => { window.__alpineRally.anhalten = true; });
const P = spiel.page;

// ---------------------------------------------------------------- (a) Modell
if (teil('a')) {
  console.log('(a) Modell');
  const r = await P.evaluate(() => {
    const A = window.__alpineRally, M = A.autoModell, T = A.THREE, o = M.objekt;
    A.setzeAuf(60); A.kameraSofort();
    // Masse im Auto-Koordinatensystem (ohne Gelände-Neigung, Räder gerade, Federung in Ruhe)
    const rot = o.rotation.clone(), pos = o.position.clone();
    o.rotation.set(0, 0, 0); o.position.set(0, 0, 0); M.federung({ nicken: 0, rollen: 0, hub: 0 });
    M.raederBewegen({ lenkwinkel: 0, strecke: 0, tempo: 0 });
    o.updateMatrixWorld(true);
    const box = new T.Box3(), boxRad = new T.Box3();
    let nan = 0, ohneMat = 0, meshes = 0, dreiecke = 0, schatten = null;
    o.traverse((m) => {
      if (!m.isMesh) return;
      meshes++;
      const p = m.geometry.attributes.position;
      for (let i = 0; i < p.array.length; i++) if (!Number.isFinite(p.array[i])) nan++;
      if (!m.material || (Array.isArray(m.material) && !m.material.length)) ohneMat++;
      dreiecke += (m.geometry.index ? m.geometry.index.count : p.count) / 3;
      if (m.name === 'auto-schatten') { schatten = m.geometry.parameters; return; }
      box.expandByObject(m);
      if (m.name === 'auto-rad') boxRad.expandByObject(m);
    });
    const radMitten = M.raeder.map((r) => r.lenk.position.toArray());
    const radGeo = M.raeder[0].dreh.geometry; radGeo.computeBoundingBox();
    const rb = radGeo.boundingBox;
    // Draw Calls: nur das Auto zeichnen (Spielkamera dahinter)
    o.rotation.copy(rot); o.position.copy(pos); o.updateMatrixWorld(true);
    const sicht = A.szene.children.map((c) => c.visible);
    A.szene.children.forEach((c) => { c.visible = c === o; });
    A.renderer.render(A.szene, A.kamera);
    const calls = A.renderer.info.render.calls, tri = A.renderer.info.render.triangles;
    A.szene.children.forEach((c, i) => { c.visible = sicht[i]; });
    return {
      laenge: box.max.z - box.min.z, breite: box.max.x - box.min.x, hoehe: box.max.y - box.min.y, unten: box.min.y,
      radMitten, radRadius: (rb.max.y - rb.min.y) / 2, radBreite: rb.max.x - rb.min.x, nan, ohneMat, meshes, dreiecke, calls, tri, schatten,
      masse: M.modell.masse,
    };
  });
  melde(r.laenge <= 4.48 + 1e-6, `Länge ${r.laenge.toFixed(3)} m (höchstens 4.48)`);
  melde(r.breite <= 1.86 + 1e-6, `Breite ${r.breite.toFixed(3)} m mit Kotflügeln (höchstens 1.86)`);
  melde(r.hoehe >= 1.2 && r.hoehe <= 1.45, `Höhe ${r.hoehe.toFixed(3)} m (1.2 bis 1.45)`);
  const soll = [[0.8, 0.33, 1.26], [-0.8, 0.33, 1.26], [0.8, 0.33, -1.26], [-0.8, 0.33, -1.26]];
  melde(r.radMitten.every((p, i) => p.every((w, k) => Math.abs(w - soll[i][k]) < 1e-9)), `Radmitten ${r.radMitten.map((p) => `(${p.map((w) => w.toFixed(2)).join(', ')})`).join(' ')}`);
  melde(Math.abs(r.radRadius - 0.33) < 1e-6, `Radradius ${r.radRadius.toFixed(3)} m`);
  melde(r.calls <= 12, `Draw Calls des Autos: ${r.calls} (höchstens 12; ${r.meshes} Teile)`);
  melde(r.tri <= 1800, `Dreiecke des Autos: ${r.tri} gezeichnet, ${Math.round(r.dreiecke)} im Modell (höchstens 1800)`);
  melde(r.nan === 0, `keine ungültigen Zahlen in den Geometrien (${r.nan})`);
  melde(r.ohneMat === 0, `alle Teile haben ein Material (${r.meshes} Teile)`);
  melde(r.schatten && Math.abs(r.schatten.width - r.breite) < 0.25 && Math.abs(r.schatten.height - r.laenge) < 0.15,
    `Schattenfleck ${r.schatten ? `${r.schatten.width} x ${r.schatten.height}` : '--'} m passt zum Auto (${r.breite.toFixed(2)} x ${r.laenge.toFixed(2)})`);
}

// ---------------------------------------------------------------- (b) Räder
if (teil('b')) {
  console.log('(b) Räder');
  const r = await P.evaluate(() => {
    const A = window.__alpineRally, M = A.autoModell, O = A.CONFIG.autoOptik;
    A.setzeAuf(60); A.kameraSofort();
    const radMax = O.radEinschlagMax * Math.PI / 180;
    const lenk = (w) => { A.physik.lenkwinkel = w; A.autoZeichnen(1 / 60, 0); return M.raeder.map((r) => r.lenk.rotation.y); };
    const l1 = lenk(0.3), l2 = lenk(1.4), l3 = lenk(-1.4), l0 = lenk(0);
    const w0 = M.radWinkel;
    const rad = (l, s, v) => M.raederBewegen({ lenkwinkel: l, strecke: s, tempo: v });
    rad(0, 2.0, 5); const vor = M.radWinkel - w0;
    rad(0, -0.66, -3); const rueck = M.radWinkel - w0 - vor;
    // Unschärfe über das Tempo
    const u = [];
    for (let v = 0; v <= 40; v += 0.05) { rad(0, 0, v); u.push([v, M.uniforms.unschaerfe.value]); }
    rad(0, 0, 0);
    return { l1, l2, l3, l0, radMax, vor, rueck, r: M.modell.raeder.radius, u, ab: O.radUnschaerfeAb, breite: O.radUnschaerfeBreite };
  });
  melde(Math.abs(r.l1[0] - 0.3) < 1e-9 && Math.abs(r.l1[1] - 0.3) < 1e-9 && r.l1[2] === 0 && r.l1[3] === 0, `nur die Vorderräder lenken (0.3 rad: ${r.l1.map(f2).join(' / ')})`);
  melde(Math.abs(r.l2[0] - r.radMax) < 1e-9 && Math.abs(r.l3[0] + r.radMax) < 1e-9, `höchstens radEinschlagMax (${(r.radMax * 180 / Math.PI).toFixed(0)}°): bei ±1.4 rad -> ${f2(r.l2[0])} / ${f2(r.l3[0])} rad`);
  melde(r.l0.every((w) => w === 0), 'gerade: alle Räder gerade');
  melde(Math.abs(r.vor - 2.0 / r.r) < 1e-9, `Drehung = Strecke / Radius (2 m -> ${r.vor.toFixed(3)} rad, soll ${(2 / r.r).toFixed(3)})`);
  melde(Math.abs(r.rueck + 0.66 / r.r) < 1e-9, `rückwärts umgekehrt (-0.66 m -> ${r.rueck.toFixed(3)} rad)`);
  const unter = r.u.filter(([v]) => v <= r.ab).every(([, x]) => x === 0);
  const ueber = r.u.filter(([v]) => v >= r.ab + r.breite + 1e-9).every(([, x]) => x === 1);
  let maxSprung = 0, monoton = true;
  for (let i = 1; i < r.u.length; i++) { maxSprung = Math.max(maxSprung, r.u[i][1] - r.u[i - 1][1]); if (r.u[i][1] < r.u[i - 1][1] - 1e-12) monoton = false; }
  melde(unter && ueber && monoton && maxSprung < 0.02, `Felge: bis ${r.ab} m/s Speichen, ab ${r.ab + r.breite} m/s Scheibe, dazwischen weich (grösster Schritt ${maxSprung.toFixed(4)} je 0.05 m/s)`);
}

// ---------------------------------------------------------------- (c) Federung
if (teil('c')) {
  console.log('(c) Federung');
  // Sprungantwort ohne Browser (js/federung.js rechnet ohne Three.js)
  const { CONFIG } = await import(pathToFileURL(path.join(WURZEL, 'js/config.js')).href);
  const { baueFederung } = await import(pathToFileURL(path.join(WURZEL, 'js/federung.js')).href);
  const F = CONFIG.autoOptik.feder, GRAD = 180 / Math.PI;
  const verlauf = (anregen, eingang, dauer = 3) => {
    const f = baueFederung(); anregen(f);
    const x = [];
    for (let t = 0; t < dauer; t += 1 / 60) { f.schritt(1 / 60, ...eingang(t)); x.push([f.nicken, f.rollen, f.hub]); }
    return x;
  };
  // Auswertung einer Achse: erster Ausschlag, Überschwinger (Gegenausschläge über 5 % davon), ruhig ab (unter 2 %)
  const auswerten = (x, k, ziel = 0) => {
    const d = x.map((p) => p[k] - ziel);
    let erster = 0;
    for (const w of d) if (Math.abs(w) > Math.abs(erster)) erster = w;
    let ueber = 0, vorz = Math.sign(d.find((w) => Math.abs(w) > Math.abs(erster) * 0.05) || 0), spitze = 0;
    for (const w of d) {
      if (Math.sign(w) !== vorz && Math.abs(w) > Math.abs(erster) * 0.05) { ueber++; vorz = Math.sign(w); spitze = Math.max(spitze, Math.abs(w)); }
    }
    let ruhig = 0;
    for (let i = d.length - 1; i >= 0; i--) if (Math.abs(d[i]) > Math.abs(erster) * 0.02) { ruhig = (i + 1) / 60; break; }
    return { erster, ueber, ruhig, spitze };
  };
  const st = verlauf((f) => f.stoss(-10, 0), () => [0, 0, 0]);
  const sn = auswerten(st, 0), sh = auswerten(st, 2);
  melde(sn.ueber <= 1 && sn.ruhig < 1.2, `Stoss frontal 10 m/s: Nicken bis ${(sn.erster * GRAD).toFixed(2)}°, ${sn.ueber} Überschwinger (${(sn.spitze * GRAD).toFixed(2)}°), ruhig nach ${sn.ruhig.toFixed(2)} s`);
  melde(sh.ueber <= 1 && sh.ruhig < 1.2, `... Hub bis ${(sh.erster * 100).toFixed(1)} cm, ${sh.ueber} Überschwinger, ruhig nach ${sh.ruhig.toFixed(2)} s`);
  const sq = verlauf((f) => f.stoss(0, -8), () => [0, 0, 0]);
  const sr = auswerten(sq, 1);
  melde(sr.ueber <= 1 && sr.ruhig < 1.2, `Stoss seitlich 8 m/s: Rollen bis ${(sr.erster * GRAD).toFixed(2)}°, ${sr.ueber} Überschwinger, ruhig nach ${sr.ruhig.toFixed(2)} s`);
  // Sprung im Eingang: 1 s Vollbremsung (-10 m/s²), dann los
  const br = verlauf(() => {}, (t) => [t < 1 ? -10 : 0, 0, 0]);
  const zielB = Math.min(F.nickenMax / GRAD, 10 * F.nicken);
  const bEin = auswerten(br.slice(0, 60), 0, zielB), bAus = auswerten(br.slice(60), 0, 0);
  melde(bEin.ueber <= 1 && bAus.ueber <= 1 && bAus.ruhig < 1.2, `Vollbremsung: Nase taucht auf ${(br[59][0] * GRAD).toFixed(2)}° (Ziel ${(zielB * GRAD).toFixed(2)}°), danach ${bAus.ueber} Überschwinger, ruhig nach ${bAus.ruhig.toFixed(2)} s`);
  // Grenzen und ungültige Eingaben
  const gr = verlauf((f) => { f.stoss(-200, 200); }, (t) => [t < 1 ? -400 : 400, 300, t < 1.5 ? 900 : -900]);
  const maxW = [0, 1, 2].map((k) => Math.max(...gr.map((p) => Math.abs(p[k]))));
  melde(maxW[0] <= F.nickenMax / GRAD + 1e-9 && maxW[1] <= F.rollenMax / GRAD + 1e-9 && maxW[2] <= F.hubMax + 1e-9,
    `Grenzen gehalten: Nicken ${(maxW[0] * GRAD).toFixed(2)}° / ${F.nickenMax}°, Rollen ${(maxW[1] * GRAD).toFixed(2)}° / ${F.rollenMax}°, Hub ${(maxW[2] * 100).toFixed(1)} / ${F.hubMax * 100} cm`);
  const nn = verlauf((f) => f.stoss(NaN, Infinity), () => [NaN, Infinity, -Infinity]);
  melde(nn.flat().every(Number.isFinite), 'kein NaN bei ungültigen Eingaben');
  // Physik mit und ohne Federung: dieselbe Fahrt (mit Aufprall) zweimal, Bild für Bild wie im Spiel
  const r = await P.evaluate(() => {
    const A = window.__alpineRally, F = A.CONFIG.autoOptik.feder;
    const fahrt = (an) => {
      F.an = an;
      A.start({ countdown: false }); A.anhalten = true;
      A.setzeAuf(36, 0);
      const e = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
      let maxNicken = 0;
      for (let i = 0; i < 1800; i++) {
        e.lenkung = i < 300 ? 0 : i < 700 ? 0.55 : -0.2;
        A.rennSchritt(A.SCHRITT, e);
        if (i % 2) { A.autoZeichnen(1 / 60, 0.2); maxNicken = Math.max(maxNicken, Math.abs(A.federung.nicken)); }
      }
      const p = A.physik;
      return { x: p.x, z: p.z, vx: p.vx, vz: p.vz, w: p.richtung, auf: A.stat.aufpralle, kol: A.kollision.letzterAufprall ? 1 : 0, maxNicken };
    };
    const mit = fahrt(true), ohne = fahrt(false);
    F.an = true;
    return { mit, ohne };
  });
  const gleich = ['x', 'z', 'vx', 'vz', 'w', 'auf'].every((k) => Object.is(r.mit[k], r.ohne[k]));
  melde(gleich && r.mit.maxNicken > 0 && r.ohne.maxNicken === 0, `Physik mit/ohne Federung bit-genau gleich (Ort ${r.mit.x.toFixed(3)}, ${r.mit.z.toFixed(3)}; Aufpralle ${r.mit.auf} / ${r.ohne.auf}; Nicken mit Federung bis ${(r.mit.maxNicken * 180 / Math.PI).toFixed(2)}°)`);
  // Speicher pro Bild: die neuen Teile (Federung, Karosserie, Räder, Lichter, Dreck) in Node mit Attrappen
  // (tools/node-three.mjs). Im Headless-Browser legt schon jede Zuweisung einer Kommazahl an ein Objekt ein kleines
  // Objekt an (der Test-Browser optimiert nicht wie ein normaler Browser) – darum dort nur zum Vergleich.
  // Je Bild wie im Spiel: Federung, Karosserie, Räder, Lichter, Dreck. Gemessen mit grossem Speicherbereich (kein
  // Aufräumen während der Messung), Median aus 3 Läufen. Ein paar Byte entstehen in V8 schon, weil Kommazahlen als
  // Argumente übergeben werden (das war vorher genauso); neue Objekte, Felder oder Materialien wären viel mehr.
  // Zum Vergleich dieselbe Messung mit dem Auto vor M8a (nur Neigen und Räder), falls --alt <ordner> angegeben ist.
  const heapCode = (wurzel, neu) => `
    import { ladeAuto } from ${JSON.stringify(pathToFileURL(path.join(WURZEL, 'tools/node-three.mjs')).href)};
    const { baueAuto } = await ladeAuto(${JSON.stringify(wurzel)});
    const M = baueAuto();
    ${neu ? `const { baueFederung } = await import(${JSON.stringify(pathToFileURL(path.join(wurzel, 'js/federung.js')).href)}); const f = baueFederung();` : ''}
    const d = { menge: 0, r: 0.3, g: 0.2, b: 0.1 }, rz = { lenkwinkel: 0, strecke: 0.4, tempo: 20 };
    const bild = (k) => {
      ${neu ? `f.schritt(1 / 60, (k % 7) - 3, (k % 5) - 2, (k % 3) - 1);
      M.federung(f); rz.lenkwinkel = (k % 9) * 0.01; rz.tempo = 20 + (k % 10); M.raederBewegen(rz);
      M.lichter(k % 2 === 0, k % 3 === 0); d.menge = (k % 50) / 60; M.dreck(d);`
    : `M.karosse.rotation.set((k % 7) * 0.01, 0, (k % 5) * 0.01); M.raederBewegen((k % 9) * 0.01, 0.4);`}
    };
    const werte = [];
    for (let lauf = 0; lauf < 3; lauf++) {
      for (let k = 0; k < 20000; k++) bild(k);
      global.gc(); const h0 = process.memoryUsage().heapUsed;
      for (let k = 0; k < 100000; k++) bild(k);
      werte.push((process.memoryUsage().heapUsed - h0) / 100000);
    }
    console.log(werte.sort((a, b) => a - b)[1].toFixed(3));`;
  const { execFileSync } = await import('node:child_process');
  const miss = (wurzel, neu) => Number(execFileSync(process.execPath, ['--expose-gc', '--max-semi-space-size=256', '--input-type=module', '-e', heapCode(wurzel, neu)], { encoding: 'utf8' }).trim());
  const heap = miss(WURZEL, true), heapAlt = arg('--alt') ? miss(path.resolve(arg('--alt')), false) : null;
  melde(heap < 16, `kein Speichermüll pro Bild (Node, 100000 Bilder): ${heap.toFixed(2)} Byte je Bild` +
    (heapAlt !== null ? ` (Auto vor M8a: ${heapAlt.toFixed(2)} Byte)` : '') + '; ein neues Objekt wären 16 Byte und mehr');
  const heapBrowser = await P.evaluate(() => {
    const A = window.__alpineRally, M = A.autoModell, f = A.federung;
    if (!window.gc || !performance.memory) return null;
    const o = { a: 0.5 };
    const miss = (fn) => {
      for (let k = 0; k < 5000; k++) fn(k);
      window.gc(); const h0 = performance.memory.usedJSHeapSize;
      for (let k = 0; k < 20000; k++) fn(k);
      return (performance.memory.usedJSHeapSize - h0) / 20000;
    };
    return {
      auto: miss((k) => { f.schritt(1 / 60, (k % 7) - 3, 0, 0); M.federung(f); M.raederBewegen({ lenkwinkel: 0, strecke: 0.4, tempo: 24 }); M.lichter(k % 2 === 0, false); A.dreckSchritt(1 / 60); }),
      eineZahl: miss((k) => { o.a = k * 0.001 + 0.3; }),
    };
  });
  if (heapBrowser) console.log(`       (zum Vergleich im Test-Browser: ${heapBrowser.auto.toFixed(1)} Byte je Bild; dort kostet schon eine einzige Zuweisung einer Kommazahl ${heapBrowser.eineZahl.toFixed(1)} Byte)`);
}

// ---------------------------------------------------------------- (d) Lichter
if (teil('d')) {
  console.log('(d) Lichter');
  const r = await P.evaluate(() => {
    const A = window.__alpineRally, M = A.autoModell, F = A.CONFIG.autoOptik.farben, T = A.THREE;
    A.setzeAuf(60); A.kameraSofort();
    const hinten = M.teilMeshes.find((m) => m.name === 'auto-ruecklicht').material, rueck = M.teilMeshes.find((m) => m.name === 'auto-rueckfahrlicht').material;
    const farbe = (m) => `#${m.color.getHexString()}`;
    const fall = (gas, bremse, hb, gang, vVor) => {
      Object.assign(A.lichtEin, { gas, bremse, handbremse: hb });
      A.getriebe.gang = gang; A.physik.vVor = vVor;
      A.autoZeichnen(1 / 60, 0);
      return [farbe(hinten), farbe(rueck)];
    };
    const an = `#${new T.Color(F.ruecklichtAn).getHexString()}`, aus = `#${new T.Color(F.ruecklichtAus).getHexString()}`;
    const rAn = `#${new T.Color(F.rueckfahrAn).getHexString()}`, rAus = `#${new T.Color(F.rueckfahrAus).getHexString()}`;
    const faelle = {
      nichts: fall(0, 0, false, 2, 10), gas: fall(1, 0, false, 2, 10), bremse: fall(0, 1, false, 2, 10), handbremse: fall(0, 0, true, 2, 10),
      rueckwaerts: fall(0, 1, false, -1, -3), rueckGasBremst: fall(1, 0, false, -1, -3), stand: fall(0, 0, false, 0, 0),
    };
    // keine neuen Materialien und Objekte pro Bild: zählen, 600 Bilder mit wechselnden Lichtern, nochmals zählen
    const zaehle = () => {
      const mats = new Set(); let obj = 0;
      A.szene.traverse((o) => { obj++; if (o.material) mats.add(o.material); });
      return { mats: mats.size, obj, prog: A.renderer.info.programs.length, geo: A.renderer.info.memory.geometries, tex: A.renderer.info.memory.textures };
    };
    A.renderer.render(A.szene, A.kamera);
    const vorher = zaehle();
    for (let k = 0; k < 600; k++) { fall(k % 3 === 0 ? 1 : 0, k % 2, k % 5 === 0, k % 4 === 0 ? -1 : 2, k % 4 === 0 ? -2 : 8); if (k % 50 === 0) A.renderer.render(A.szene, A.kamera); }
    A.renderer.render(A.szene, A.kamera);
    const nachher = zaehle();
    fall(0, 0, false, 0, 0);
    return { faelle, an, aus, rAn, rAus, vorher, nachher };
  });
  const { faelle: c, an, aus, rAn, rAus } = r;
  melde(c.bremse[0] === an && c.handbremse[0] === an && c.rueckGasBremst[0] === an, `Bremslicht an bei Bremse, Handbremse und Gas beim Rückwärtsrollen (${c.bremse[0]})`);
  melde(c.nichts[0] === aus && c.gas[0] === aus && c.rueckwaerts[0] === aus && c.stand[0] === aus, `sonst aus (${c.nichts[0]}), auch beim Rückwärtsfahren mit dem Bremspedal`);
  melde(c.rueckwaerts[1] === rAn && c.rueckGasBremst[1] === rAn && [c.nichts, c.gas, c.bremse, c.handbremse, c.stand].every((x) => x[1] === rAus), `Rückfahrlicht nur im Rückwärtsgang (${c.rueckwaerts[1]} / sonst ${c.nichts[1]})`);
  melde(JSON.stringify(r.vorher) === JSON.stringify(r.nachher), `keine neuen Materialien oder Objekte: ${JSON.stringify(r.vorher)} -> ${JSON.stringify(r.nachher)}`);
}

// ---------------------------------------------------------------- (e) Dreck
if (teil('e')) {
  console.log('(e) Dreck');
  const r = await P.evaluate(() => {
    const A = window.__alpineRally, D = A.CONFIG.autoOptik.dreck, S = A.strecke;
    const q = {};
    // je Belag eine Stelle suchen (Hauptstrecke, Bankett und Wiese neben Asphalt)
    const stelle = (art) => {
      for (let s = 40; s < S.zielS; s += 7) {
        for (const seite of [0, 4.3, -4.3, 9, -9]) {
          const p = S.punktBei(s), x = p.x - p.tz * seite, z = p.z + p.tx * seite;
          if (A.welt.bodenBei(x, z, S.abfrage(x, z, q)).art === art) return { s, seite };
        }
      }
      return null;
    };
    const erg = {};
    A.start({ countdown: false }); A.anhalten = true;
    for (const art of ['asphalt', 'schotter', 'wiesenweg', 'gras', 'bankett']) {
      const st = stelle(art);
      if (!st) { erg[art] = null; continue; }
      A.setzeAuf(st.s, st.seite);
      A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false });
      const unter = A.untergrund;
      const vorher = A.dreck.menge;
      const p = A.physik; p.vx = Math.sin(p.richtung) * 20; p.vz = Math.cos(p.richtung) * 20; // 20 m/s, nur für den Dreck (kein Physik-Schritt)
      for (let i = 0; i < 30; i++) A.dreckSchritt(1 / 60);
      erg[art] = { unter, vorher, nachher: A.dreck.menge, farbe: [A.dreck.r, A.dreck.g, A.dreck.b] };
    }
    // Obergrenze: lange auf Gras
    const g = stelle('gras'); A.setzeAuf(g.s, g.seite); A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false });
    A.physik.vx = 30; for (let i = 0; i < 2000; i++) A.dreckSchritt(1 / 60);
    const voll = A.dreck.menge, uniform = A.autoModell.uniforms.dreck.value;
    // Asphalt wäscht nichts ab
    A.setzeAuf(60); A.physikSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false });
    A.physik.vx = 30; for (let i = 0; i < 600; i++) A.dreckSchritt(1 / 60);
    const nachAsphalt = A.dreck.menge;
    // Draw Calls des Autos mit und ohne Dreck gleich
    const calls = (menge) => {
      A.autoModell.dreck({ menge, r: 0.5, g: 0.4, b: 0.3 });
      const o = A.autoModell.objekt, sicht = A.szene.children.map((c) => c.visible);
      A.szene.children.forEach((c) => { c.visible = c === o; });
      A.renderer.render(A.szene, A.kamera);
      const n = A.renderer.info.render.calls;
      A.szene.children.forEach((c, i) => { c.visible = sicht[i]; });
      return n;
    };
    const callsSauber = calls(0), callsDreck = calls(0.85);
    A.autoModell.dreck(A.dreck);
    // Neustart (mit Countdown wie im Spiel) und Start: sauber
    A.neustart(); const nachNeustart = A.dreck.menge;
    A.physik.vx = 30; for (let i = 0; i < 60; i++) A.dreckSchritt(1 / 60); // (Startlinie: Asphalt)
    A.start(); const nachStart = A.dreck.menge;
    // Demo-Fahrt im Menü über den Schotter, dann STARTEN: im Rennen sauber
    A.zumHauptmenue();
    const demo = A.demo; demo.start();
    let dreckDemo = 0;
    for (let i = 0; i < 120 * 60 && A.rennen.letztesS < 1100; i++) {
      demo.schritt(A.SCHRITT);
      if (i % 2) A.dreckSchritt(1 / 60);
      dreckDemo = Math.max(dreckDemo, A.dreck.menge);
      A.rennen.letztesS = A.strecke.abfrage(A.physik.x, A.physik.z, q).s;
    }
    A.start(); const nachDemoStart = A.dreck.menge;
    A.ablauf.wechsle('rennen');
    return { erg, voll, uniform, max: D.max, nachAsphalt, callsSauber, callsDreck, nachNeustart, nachStart, dreckDemo, nachDemoStart };
  });
  for (const art of ['schotter', 'wiesenweg', 'gras', 'bankett']) {
    const e = r.erg[art];
    melde(e && e.unter === art && e.nachher > e.vorher, `${art}: Dreck wächst (${e ? `${f2(e.vorher)} -> ${f2(e.nachher)}` : 'keine Stelle gefunden'})`);
  }
  const a = r.erg.asphalt;
  melde(a && a.unter === 'asphalt' && a.nachher === a.vorher, `Asphalt: kein Dreck dazu (${a ? `${f2(a.vorher)} -> ${f2(a.nachher)}` : '--'})`);
  melde(Math.abs(r.voll - r.max) < 1e-9 && Math.abs(r.uniform - r.max) < 1e-6, `Obergrenze dreck.max = ${r.max} (lange auf Gras: ${f2(r.voll)})`);
  melde(r.nachAsphalt === r.voll, `Asphalt wäscht nichts ab (${f2(r.voll)} -> ${f2(r.nachAsphalt)} nach 10 s mit 108 km/h)`);
  melde(r.callsDreck === r.callsSauber, `Dreck ohne zusätzlichen Draw Call (${r.callsSauber} -> ${r.callsDreck})`);
  melde(r.nachNeustart === 0 && r.nachStart === 0, `sauber nach Neustart (${r.nachNeustart}) und Start (${r.nachStart})`);
  melde(r.dreckDemo > 0 && r.nachDemoStart === 0, `Demo-Fahrt: Dreck in der Demo (${f2(r.dreckDemo)}), im Rennen danach sauber (${r.nachDemoStart})`);
}

// ---------------------------------------------------------------- (f) Lackierungen
if (teil('f')) {
  console.log('(f) Lackierungen');
  const vorAnfragen = anfragen.length;
  const r = await P.evaluate(async () => {
    const A = window.__alpineRally, M = A.autoModell, T = A.THREE;
    const { SCHRIFT_ZEICHEN } = await import('/js/pixel.js');
    const { texteDesModells, AUTO_MODELLE } = await import('/js/autos.js');
    const L = A.CONFIG.autoOptik.lackierungen;
    const mat = M.teilMeshes.find((m) => m.name === 'auto-karosserie').material, tex = mat.map;
    const rad = M.raeder[0].dreh.material.map;
    const texte = Object.values(AUTO_MODELLE).flatMap(texteDesModells);
    const fehlt = [...new Set(texte.join('').split(''))].filter((z) => !SCHRIFT_ZEICHEN.includes(z));
    const wechsel = [];
    for (const n of Object.keys(L)) {
      try { const name = M.lackierung(n); A.renderer.render(A.szene, A.kamera); wechsel.push([n, name === n]); } catch (e) { wechsel.push([n, String(e)]); }
    }
    M.lackierung(A.CONFIG.autoOptik.lackierung);
    return {
      namen: Object.keys(L), modell: M.modell.lackierungen, texte, fehlt, wechsel,
      filter: [tex.magFilter === T.NearestFilter, tex.minFilter === T.NearestFilter, tex.generateMipmaps === false, tex.isCanvasTexture,
        rad.magFilter === T.NearestFilter, rad.minFilter === T.NearestFilter, rad.generateMipmaps === false],
      groesse: [tex.image.width, tex.image.height],
    };
  });
  melde(['werk', 'gletscher', 'dunkel'].every((n) => r.namen.includes(n) && r.modell.includes(n)), `drei Lackierungen: ${r.namen.join(', ')} (Standard ${'werk'})`);
  melde(r.filter.every(Boolean), `Textur im Code gemalt (${r.groesse.join('x')}), NearestFilter, ohne Mipmaps (auch die Räder)`);
  melde(r.fehlt.length === 0, `nur Zeichen der Pixelschrift (${r.texte.join(', ')})${r.fehlt.length ? ` – fehlt: ${r.fehlt.join(' ')}` : ''}`);
  melde(r.wechsel.every(([, ok]) => ok === true), `Wechsel ohne Fehler: ${r.wechsel.map(([n, ok]) => `${n} ${ok === true ? 'ok' : ok}`).join(', ')}`);
  const dateien = anfragen.filter((u) => !/\.(js|mjs|html|css)(\?|$)/.test(new URL(u).pathname) && !u.startsWith('data:') && !u.startsWith('blob:'));
  melde(dateien.length === 0, `keine Datei geladen ausser Code (Bilder, Modelle, Schriften: ${dateien.length})${dateien.length ? ` ${dateien.slice(0, 5).join(' ')}` : ''}`);
  void vorAnfragen;
}

// ---------------------------------------------------------------- (n) Auto-Labor
if (teil('n')) {
  console.log('(n) Auto-Labor');
  const labor = await starteSpiel({ breite: 1300, hoehe: 800 });
  const geladen = [];
  labor.page.on('request', (r) => geladen.push(new URL(r.url()).pathname));
  await labor.page.goto(`${labor.url}/auto-labor.html`);
  await labor.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  await labor.page.waitForTimeout(500);
  const quelle = fs.readFileSync(path.join(WURZEL, 'js/autolabor.js'), 'utf8');
  melde(labor.fehler.length === 0, `Seite lädt ohne Fehler (${labor.fehler.length})`);
  melde(geladen.includes('/js/car.js') && /import \{ baueAuto \} from '\.\/car\.js'/.test(quelle) && !/function baueAuto/.test(quelle),
    'nutzt dieselbe baueAuto() aus js/car.js (keine Kopie des Modells)');
  const r = await labor.page.evaluate(async () => {
    const L = window.__autoLabor, $ = (id) => document.getElementById(id);
    const kam = {};
    for (const n of Object.keys(L.ANSICHTEN)) { L.ansicht(n); L.zeichne(0); kam[n] = L.kamera.position.toArray().map((w) => Math.round(w * 100) / 100); }
    const setze = (id, w) => { $(id).value = w; $(id).dispatchEvent(new Event('input')); };
    setze('lenkung', 1); setze('nicken', 3); setze('rollen', -4); setze('hub', 6); setze('dreck', 0.7); setze('tempo', 120);
    const w0 = L.auto.radWinkel; L.zeichne(0.1);
    const radDreht = L.auto.radWinkel - w0;
    const lenk = L.auto.raeder[0].lenk.rotation.y, k = L.auto.karosse;
    $('bremslicht').click(); $('rueckfahrlicht').click(); L.zeichne(0.016);
    const licht = L.auto.teilMeshes.filter((m) => /licht/.test(m.name)).map((m) => `#${m.material.color.getHexString()}`);
    $('lackierung').value = 'dunkel'; $('lackierung').dispatchEvent(new Event('change')); L.zeichne(0.016);
    $('staub').click(); for (let i = 0; i < 30; i++) L.zeichne(1 / 60);
    const staub = L.staub.zustand.aktiv;
    for (const nr of [0, 1, 2]) { L.aufloesung(nr); L.zeichne(0); }
    const bild = L.bildDaten();
    const img = new Image(); img.src = bild; await img.decode();
    return {
      kam, radDreht, lenk, nicken: k.rotation.x, rollen: k.rotation.z, hub: k.position.y, dreck: L.auto.uniforms.dreck.value, unsch: L.auto.uniforms.unschaerfe.value,
      licht, lack: L.auto.lackName, staub, png: bild.slice(0, 22), w: img.width, h: img.height, speicher: localStorage.length,
      radMax: L.CONFIG.autoOptik.radEinschlagMax * Math.PI / 180, sp: L.auto.modell.schwerpunktHoehe,
    };
  });
  const orte = Object.values(r.kam).map((p) => p.join());
  melde(new Set(orte).size === orte.length, `sechs Ansichten mit verschiedenen Kamera-Orten (${Object.keys(r.kam).join(', ')})`);
  melde(Math.abs(r.lenk + r.radMax) < 1e-9 && r.radDreht > 0 && r.unsch === 1, `Regler Lenkung (${f2(r.lenk)} rad) und Tempo (Rad dreht ${f2(r.radDreht)} rad in 0.1 s, Unschärfe ${r.unsch})`);
  melde(Math.abs(r.nicken - 3 * Math.PI / 180) < 1e-9 && Math.abs(r.rollen + 4 * Math.PI / 180) < 1e-9 && Math.abs(r.hub - (r.sp + 0.06)) < 1e-9 && Math.abs(r.dreck - 0.7) < 1e-9,
    `Regler Nicken/Rollen/Hub/Dreck wirken (${f2(r.nicken)}, ${f2(r.rollen)}, ${f2(r.hub)}, ${f2(r.dreck)})`);
  melde(r.licht.length === 2 && r.lack === 'dunkel' && r.staub > 0, `Bremslicht/Rückfahrlicht (${r.licht.join(', ')}), Lackierung (${r.lack}), Staub (${r.staub} Wölkchen)`);
  // BILD SPEICHERN: echter Klick, Download abfangen
  const [download] = await Promise.all([labor.page.waitForEvent('download'), labor.page.click('#speichern')]);
  const datei = await download.path();
  const kopf = datei ? fs.readFileSync(datei).subarray(0, 8) : Buffer.alloc(0);
  melde(r.png === 'data:image/png;base64,' && r.w === 640 && r.h === 360 && kopf[1] === 0x50 && kopf[2] === 0x4e && kopf[3] === 0x47,
    `BILD SPEICHERN liefert ein PNG (${download.suggestedFilename()}, ${r.w}x${r.h})`);
  melde(r.speicher === 0 && labor.fehler.length === 0, `Spiel unberührt: nichts im Browser-Speicher (${r.speicher}), keine Fehler`);
  await labor.schliessen();
}

if (spiel.fehler.length) melde(false, `Fehler in der Konsole des Spiels: ${spiel.fehler.slice(0, 3).join(' | ')}`);
await spiel.schliessen();
console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
