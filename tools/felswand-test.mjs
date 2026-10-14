// Felswand-Test (Meilenstein 3a.3): Wie genau stoppt die Felswand das Auto?
//
//   node tools/felswand-test.mjs                    dieses Projekt
//   node tools/felswand-test.mjs --wurzel <ordner>  eine andere (z. B. alte) Version messen
//
// 1. Oberfläche: Entlang aller Felswand-Abschnitte (jeden Meter) wird die sichtbare Wandfläche mit
//    einem Strahl von der Strasse quer nach aussen gemessen (das echte Felswand-Mesh) und mit der
//    Kollisionskante verglichen. Alte Version: Automitte stoppt bei grenze.wandGrenze (4.3 m), die
//    Karosserie ist 0.93 m breit (halb) – parallel zur Wand reicht sie also bis 5.23 m.
// 2. Aufprall: Das Auto fährt mit 20 / 60 / 100 km/h unter 15°, 30°, 60° und 90° gegen die Wand
//    (an drei Stellen), hält danach noch 1 s Vollgas. Gemessen wird, wie tief die Karosserie
//    (Umriss in 0.1 / 0.5 / 0.9 m Höhe) in der sichtbaren Wandfläche steckt. Danach bremsen bis
//    zum Stand und 3 s rückwärts (wie weit kommt das Auto weg?).
// 3. Kamera: Auto steht an der Wand (parallel, Heck zur Wand, schräg): Steckt die Kamera
//    (ihre vordere Schnittfläche) in der Wand?
// Das Spiel selbst lädt diese Datei nicht.

import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const spiel = await starteSpiel({ wurzel });
await spiel.ladeSpiel();
const page = spiel.page;
let fehler = 0;
const pruefe = (ok, text) => { console.log(`  ${ok ? 'OK    ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const neu = wurzel === WURZEL;

// Hilfsfunktionen im Browser
await page.evaluate(() => {
  const A = window.__alpineRally, S = A.strecke, T = A.THREE;
  // Felswand-Mesh finden (alte Version: das erste Mesh mit Vertexfarben, flach schattiert, beidseitig)
  let wand = A.welt.felswandMesh;
  if (!wand) A.szene.traverse((o) => { if (!wand && o.isMesh && o.material.vertexColors && o.material.flatShading && o.material.side === T.DoubleSide) wand = o; });
  const ray = new T.Raycaster(), o = new T.Vector3(), d = new T.Vector3();
  const q = {};
  // sichtbare Wandfläche: Strahl ab 2 m neben der Mitte quer nach aussen, Höhe y (Welt)
  // i = Streckenpunkt, laengs = Versatz entlang der Strecke. Ergebnis: Abstand von der Mitte (m) oder null
  function flaeche(i, laengs, y, ws) {
    const rx = -S.tz[i] * ws, rz = S.tx[i] * ws;
    o.set(S.px[i] + S.tx[i] * laengs + rx * 2, y, S.pz[i] + S.tz[i] * laengs + rz * 2);
    d.set(rx, 0, rz);
    ray.set(o, d); ray.far = 30;
    const t = ray.intersectObject(wand, false);
    return t.length ? 2 + t[0].distance : null;
  }
  // Umriss der Karosserie (sichtbar: 4.48 x 1.86 m) in drei Höhen über dem Boden
  function umriss() {
    const P = A.physik, f = [Math.sin(P.richtung), Math.cos(P.richtung)], l = [Math.cos(P.richtung), -Math.sin(P.richtung)];
    const HL = 2.24, HB = 0.93, pk = [];
    for (let k = 0; k <= 8; k++) { const a = -1 + k / 4; pk.push([a, -1], [a, 1]); }
    for (let k = 1; k < 4; k++) { const b = -1 + k / 2; pk.push([-1, b], [1, b]); }
    return pk.map(([a, b]) => [P.x + f[0] * a * HL + l[0] * b * HB, P.z + f[1] * a * HL + l[1] * b * HB]);
  }
  // Wie tief steckt die Karosserie in der sichtbaren Wand? (m, negativ = Luft dazwischen)
  function eindringen() {
    let max = -Infinity;
    for (const [x, z] of umriss()) {
      S.abfrage(x, z, q);
      const ws = q.wandSeite;
      if (!ws || Math.sign(q.seite) !== ws) continue;
      const g = A.welt.bodenBei(x, z).h;
      for (const hy of [0.1, 0.5, 0.9]) {
        const laengs = q.s - S.s[q.i];
        const L = flaeche(q.i, laengs, g + hy, ws);
        if (L == null) continue;
        max = Math.max(max, Math.abs(q.seite) - L);
      }
    }
    return max;
  }
  window.__fw = { wand, flaeche, eindringen, umriss };
});

// --- 1. Oberfläche gegen Kollisionskante -------------------------------------------------------
console.log(`Version: ${neu ? 'dieses Projekt' : wurzel}`);
const ob = await page.evaluate(() => {
  const A = window.__alpineRally, S = A.strecke, W = window.__fw, g = A.CONFIG.grenze;
  const res = { punkte: 0, maxDiff: 0, maxBei: 0, ohneKante: 0, ohneBei: [], parallelAlt: 0, diffs: [] };
  const q = {};
  for (let i = 0; i < S.anzahl; i++) {
    const ws = S.wandSeite[i];
    if (!ws) continue;
    // Bodenhöhe am Wandfuss (Bankett-Kante), 10 cm darüber
    const rx = -S.tz[i] * ws, rz = S.tx[i] * ws;
    const g0 = A.welt.bodenBei(S.px[i] + rx * 5, S.pz[i] + rz * 5).h;
    const L = W.flaeche(i, 0, g0 + 0.1, ws);
    if (L == null || L > 12) continue; // hier ist die Wand (noch) nicht über dem Boden
    res.punkte++;
    let kante;
    if (A.welt.wandKante) {
      const x = S.px[i] + rx * L, z = S.pz[i] + rz * L;
      S.abfrage(x, z, q);
      kante = A.welt.wandKante(q, g0 + 0.1 - q.h);
    } else {
      kante = S.wandStaerke[i] > 0.3 ? g.wandGrenze + 0.93 : Infinity;
    }
    if (!isFinite(kante)) { res.ohneKante++; if (res.ohneBei.length < 400) res.ohneBei.push(Math.round(S.s[i])); continue; }
    const diff = kante - L;
    res.diffs.push(diff);
    if (Math.abs(diff) > Math.abs(res.maxDiff)) { res.maxDiff = diff; res.maxBei = Math.round(S.s[i]); }
  }
  res.maxRein = Math.max(0, ...res.diffs); res.maxLuft = Math.max(0, ...res.diffs.map((d) => -d));
  const a = res.diffs.map(Math.abs).sort((x, y) => x - y);
  res.mittel = a.reduce((s, v) => s + v, 0) / a.length;
  res.p95 = a[Math.floor(a.length * 0.95)];
  res.zuTief = res.diffs.filter((d) => d > 0.05).length;
  delete res.diffs;
  // Bereiche ohne Kollision zusammenfassen
  const br = [];
  for (const s of res.ohneBei) { const b = br[br.length - 1]; if (b && s - b[1] <= 2) b[1] = s; else br.push([s, s]); }
  res.ohneBereiche = br.map(([a, b]) => `${a}–${b} m`).join(', ');
  delete res.ohneBei;
  return res;
});
const cm = (m) => `${(m * 100).toFixed(0)} cm`;
console.log('\n1. Sichtbare Wandfläche (10 cm über dem Boden) gegen Kollisionskante, jeden Meter:');
console.log(`  Messpunkte mit sichtbarer Wand: ${ob.punkte}`);
console.log(`  ${neu ? 'Kollisionskante folgt der Wandfläche' : 'Kollisionskante (parallel stehendes Auto, Karosserie bei 4.3 + 0.93 m)'}:` +
  ` grösster Unterschied ${cm(ob.maxDiff)} (bei ${ob.maxBei} m), Mittel ${cm(ob.mittel)}, 95 % unter ${cm(ob.p95)}` +
  `, Stellen mehr als 5 cm in der Wand: ${ob.zuTief}`);
console.log(`  davon: Kollision am weitesten in der Wand ${cm(ob.maxRein)}, am weitesten vor der Wand (Luft) ${cm(ob.maxLuft)}`);
console.log(`  Wand sichtbar, aber gar keine Kollision: ${ob.ohneKante} Stellen${ob.ohneKante ? ` (${ob.ohneBereiche})` : ''}`);
if (!neu) console.log('  (schräg stehendes Auto: Die Ecken ragen noch weiter hinaus, bei 90° bis 4.3 + 2.24 = 6.54 m)');
if (neu) {
  pruefe(ob.maxRein < 0.03 && ob.maxLuft < 0.1, 'Kollisionskante höchstens 3 cm in und 10 cm vor der sichtbaren Wandfläche');
  pruefe(ob.ohneKante === 0, 'überall, wo die Wand sichtbar ist, gibt es eine Kollision');
}

// --- 2. Aufprall ------------------------------------------------------------------------------
console.log('\n2. Aufprall gegen die Wand (danach 1 s Vollgas, bremsen bis zum Stand, dann 3 s rückwärts):');
const STELLEN = [2117, 2300, 3100];
let maxEin = -Infinity, maxEinText = '';
for (const s0 of STELLEN) {
  for (const v of [20, 60, 100]) {
    const zeilen = [];
    for (const winkel of [15, 30, 60, 90]) {
      const r = await page.evaluate(({ s0, v, winkel }) => {
        const A = window.__alpineRally, S = A.strecke, P = A.physik, W = window.__fw;
        const p0 = S.punktBei(s0), ws = S.wandSeite[p0.i];
        const a = (winkel * Math.PI) / 180;
        const ext = 2.24 * Math.sin(a) + 0.93 * Math.cos(a);
        const quer = 5.1 - ext - 0; // so weit seitlich bis zur Wand (ab Strassenmitte)
        const zurueck = winkel < 89 ? quer / Math.tan(a) : 0;
        const p = S.punktBei(s0 - zurueck);
        const rx = -p.tz * ws, rz = p.tx * ws;
        const dx = p.tx * Math.cos(a) + rx * Math.sin(a), dz = p.tz * Math.cos(a) + rz * Math.sin(a);
        A.setzeAuf(s0 - zurueck);
        P.reset(p.x, p.z, Math.atan2(dx, dz));
        const dt = A.SCHRITT, ms = v / 3.6;
        const GAS = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
        const RUECK = { gas: 0, bremse: 1, lenkung: 0, handbremse: false, reset: false, debug: false };
        const q = {};
        let t = 0, kontakt = -1, maxE = -Infinity, nach02 = null, vorAufprall = 0;
        const nahe = () => {
          S.abfrage(P.x, P.z, q);
          const rel = P.richtung - Math.atan2(q.tx, q.tz);
          const e = 2.24 * Math.abs(Math.sin(rel)) + 0.93 * Math.abs(Math.cos(rel));
          return q.seite * ws + e;
        };
        while (t < 6) {
          if (kontakt < 0) { P.vx = Math.sin(P.richtung) * ms; P.vz = Math.cos(P.richtung) * ms; P.vVor = ms; }
          const vor = Math.hypot(P.vx, P.vz);
          A.physikSchritt(dt, GAS);
          t += dt;
          const e = W.eindringen();
          maxE = Math.max(maxE, e);
          if (kontakt < 0 && (e > -0.03 || Math.hypot(P.vx, P.vz) < vor - 0.5 || nahe() > 5.3)) { kontakt = t; vorAufprall = vor; }
          if (kontakt >= 0 && nach02 == null && t >= kontakt + 0.2) nach02 = P.tempo;
          if (kontakt >= 0 && t >= kontakt + 1) break;
        }
        // bremsen bis zum Stand (höchstens 5 s), dann 3 s rückwärts raus
        for (let k = 0; k < Math.round(5 / dt) && P.vVor > 0.2; k++) { A.physikSchritt(dt, RUECK); maxE = Math.max(maxE, W.eindringen()); }
        const xS = P.x, zS = P.z;
        let vRueck = 0;
        for (let k = 0; k < Math.round(3 / dt); k++) { A.physikSchritt(dt, RUECK); maxE = Math.max(maxE, W.eindringen()); vRueck = Math.min(vRueck, P.vVor); }
        const weg = Math.hypot(P.x - xS, P.z - zS);
        return { kontakt: kontakt >= 0, vorAufprall: vorAufprall * 3.6, nach02: (nach02 ?? 0) * 3.6, maxE, weg, vRueck: -vRueck * 3.6, luft: -W.eindringen() };
      }, { s0, v, winkel });
      zeilen.push(`${String(winkel).padStart(2)}°: ${r.kontakt ? '' : 'KEIN KONTAKT '}nach 0.2 s ${r.nach02.toFixed(0).padStart(3)} km/h, ` +
        `steckt max. ${cm(Math.max(0, r.maxE)).padStart(6)}, rückwärts ${r.weg.toFixed(1)} m`);
      if (r.maxE > maxEin) { maxEin = r.maxE; maxEinText = `${s0} m, ${v} km/h, ${winkel}°`; }
      if (neu) {
        if (!r.kontakt || r.weg < 1 || (winkel >= 60 && r.nach02 > 15)) {
          pruefe(false, `${s0} m, ${v} km/h, ${winkel}°: ${!r.kontakt ? 'kein Kontakt' : r.weg < 1 ? 'kommt rückwärts nicht raus' : 'kein harter Halt'}`);
        }
      }
    }
    console.log(`  ${s0} m, ${String(v).padStart(3)} km/h  ${zeilen.join(' | ')}`);
  }
}
console.log(`  am tiefsten: ${cm(Math.max(0, maxEin))} (${maxEinText})`);
if (neu) {
  pruefe(maxEin < 0.06, 'Karosserie steckt nirgends mehr als ein paar cm (unter 6 cm) in der sichtbaren Wand');
  pruefe(true, 'alle Aufpralle mit Kontakt, harter Halt ab 60°, rückwärts wieder raus (sonst oben als FEHLER)');
}

// --- 3. Kamera ---------------------------------------------------------------------------------
console.log('\n3. Kamera, wenn das Auto an der Wand steht:');
let kamMin = Infinity;
for (const s0 of STELLEN) {
  const zeilen = [];
  for (const [name, winkel] of [['parallel', 0], ['schräg, Heck zur Wand', -45], ['Heck zur Wand', -90]]) {
    await page.evaluate(({ s0, winkel }) => {
      const A = window.__alpineRally, S = A.strecke, P = A.physik;
      const p = S.punktBei(s0), ws = S.wandSeite[p.i];
      const a = (winkel * Math.PI) / 180; // Winkel der Front zur Wand hin (negativ = von der Wand weg)
      const rx = -p.tz * ws, rz = p.tx * ws;
      const dx = p.tx * Math.cos(a) + rx * Math.sin(a), dz = p.tz * Math.cos(a) + rz * Math.sin(a);
      // so weit zur Wand, wie die Karosserie (sichtbar 4.48 x 1.86) Platz hat, 3 cm Luft
      const ext = 2.24 * Math.abs(Math.sin(a)) + 0.93 * Math.abs(Math.cos(a));
      A.setzeAuf(s0);
      const L = window.__fw.flaeche(p.i, 0, p.h + 0.1, ws) ?? 5.1;
      P.reset(p.x + rx * (L - ext - 0.03), p.z + rz * (L - ext - 0.03), Math.atan2(dx, dz));
      A.kameraSofort();
    }, { s0, winkel });
    // ein paar Bilder laufen lassen (Kamera folgt im Spiel weich nach)
    for (let k = 0; k < 40; k++) await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    const r = await page.evaluate(() => {
      const A = window.__alpineRally, S = A.strecke, K = A.kamera, W = window.__fw, T = A.THREE;
      K.updateMatrixWorld();
      // Ecken der vorderen Schnittfläche (near plane) und die Kamera selbst
      const pk = [[0, 0, -1], [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1]].map(([x, y, z]) => new T.Vector3(x, y, z).unproject(K));
      pk.push(K.position.clone());
      let luft = Infinity;
      const q = {};
      for (const v of pk) {
        S.abfrage(v.x, v.z, q);
        if (!q.wandSeite || Math.sign(q.seite) !== q.wandSeite) continue;
        const L = W.flaeche(q.i, q.s - S.s[q.i], v.y, q.wandSeite);
        if (L != null) luft = Math.min(luft, L - Math.abs(q.seite));
      }
      return luft;
    });
    kamMin = Math.min(kamMin, r);
    zeilen.push(`${name}: ${isFinite(r) ? `${cm(r)} Luft` : 'weit weg'}`);
  }
  console.log(`  ${s0} m  ${zeilen.join(' | ')}`);
}
console.log(`  kleinster Abstand Kamera (vordere Schnittfläche) zur Wand: ${cm(kamMin)}`);
if (neu) pruefe(kamMin > 0, 'Kamera ragt nie in die Wand');

if (spiel.fehler.length) { console.log('Fehler im Spiel:', spiel.fehler); fehler++; }
console.log(neu ? (fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen erfüllt.') : '');
await spiel.schliessen();
process.exit(neu && fehler ? 1 : 0);
