// Nebenweg-Bogen in die Strecke einpassen (seit Meilenstein 3a).
//
//   node tools/nebenweg-bogen.mjs            rechnet und schreibt die Stützpunkte in js/track.js
//   node tools/nebenweg-bogen.mjs --zeigen   rechnet nur und zeigt das Ergebnis
//
// Ein Nebenweg ersetzt ein Stück der Etappe: Die Etappe verlässt die Hauptstrasse (Abzweig),
// fährt über den Nebenweg und mündet wieder in eine Hauptstrasse ein (Einmündung). Damit sich
// danach nichts verschiebt (Checkpoints, Sperren, Schilder, Abkürzungen hängen an den
// Streckenmetern), muss der neue Bogen genau so lang sein wie das alte Stück und genau dort
// ankommen, wo das alte Stück aufgehört hat (gleiche Stelle, gleiche Richtung).
//
// Der Bogen wird wie die übrige Strecke aus "Gerade" und "Kurve mit Radius" gebaut (BOGEN unten).
// Zwei Geraden (frei: 'lage') werden so ausgerechnet, dass der Bogen am Endpunkt ankommt, und ein
// Winkel (frei: 'laenge') wird gesucht, bis die ganze Strecke wieder genau gleich lang ist.
// Die letzte Kurve (frei: 'richtung') dreht so weit, dass die Richtung am Ende passt.
// Das Ergebnis kommt in js/track.js zwischen die Zeilen "<nebenweg NAME>" und "</nebenweg>".
//
// Für einen weiteren Nebenweg (M3b): einen neuen Eintrag in BOGEN_LISTE anlegen (Start- und
// Endpunkt sind Stützpunkte, die bleiben; dazwischen wird ersetzt) und im track.js die zwei
// Marker-Zeilen an die Stelle setzen.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'node:module';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// "three" für Node auf die Datei in lib/ umleiten (im Browser macht das die Import-Map)
register(`data:text/javascript,${encodeURIComponent(`export async function resolve(s, c, n) {
  if (s === 'three') return { url: ${JSON.stringify('file://' + path.join(WURZEL, 'lib/three.module.min.js'))}, shortCircuit: true };
  return n(s, c);
}`)}`);
const THREE = await import(path.join(WURZEL, 'lib/three.module.min.js'));
const TRACK = path.join(WURZEL, 'js/track.js');

// Länge der Strecke vor M3a (Meter) – alles danach soll an derselben Stelle bleiben
const ZIEL_LAENGE = 3667.5869258559796;

// ---------------------------------------------------------------------------
// Der Bogen. Richtung in Grad: 0 = Norden (-z), + = nach Osten (Rechtskurve dreht +).
//   { gerade: m }                         Gerade
//   { kurve: Grad (+ rechts, - links), radius: m }
//   frei: 'lage'     diese Gerade wird ausgerechnet (zwei Stück)
//   frei: 'laenge'   dieser Kurvenwinkel wird gesucht (Gesamtlänge)
//   frei: 'richtung' dieser Kurvenwinkel ergibt sich aus der Richtung am Ende
//   marke: Text      Marke für den Kommentar im track.js und die Meter in config.js
//   belag/abschnitt: Abschnitts-Zeile, die VOR diesem Stück in track.js eingefügt wird
// Höhe: gleichmässig vom Start- zum Endpunkt, dazu "huegel" (Mitte als Anteil 0..1 des Bogens,
// Breite als Anteil, Höhe in m).
// ---------------------------------------------------------------------------
const BOGEN_LISTE = [{
  name: 'Talschleife',
  start: { x: 74.2, z: -746.7 },   // bleibt (gehört noch zur Kurve 482–752)
  ende: { x: 113.7, z: -980.4 },   // bleibt (danach kommt die Kurve 1085–1230)
  stuecke: [
    { gerade: 10, marke: 'Hauptstrasse bis zum Abzweig' },
    { abschnitt: "{ abschnitt: 'Waldstück', baeume: 2.2, wald: 1, nah: true }" },
    { kurve: 80, radius: 28, marke: 'Abzweig: rechts auf den Nebenweg (Schotter)' },
    { gerade: 20, frei: 'lage' },
    { kurve: -67, radius: 35, frei: 'laenge', marke: 'Nebenweg: Kurve links' },
    { gerade: 12, frei: 'lage' },
    { kurve: 62, radius: 38, marke: 'Nebenweg: Kurve rechts' },
    { gerade: 16 },
    { kurve: -66, radius: 28, marke: 'Einmündung: links auf die Hauptstrasse' },
    { gerade: 6, marke: 'Hauptstrasse' },
    { kurve: 30, radius: 45, frei: 'richtung', marke: 'Hauptstrasse: Kurve rechts' },
    { gerade: 4 },
  ],
  huegel: [{ mitte: 0.42, breite: 0.34, hoehe: 2.6 }, { mitte: 0.74, breite: 0.22, hoehe: -1.4 }],
  punktAbstand: 9,   // Abstand der Stützpunkte auf Geraden (m), in Kurven etwas enger
  // So viele Stützpunkte wie das ersetzte Stück hatte (zwischen Start und Ende): Dann rechnet
  // Three.js die Länge der übrigen Strecke genau gleich aus, und alles danach bleibt auf den
  // Millimeter an seinem Platz. Leer lassen = Abstand nach punktAbstand.
  anzahlPunkte: 15,
  kurveGewicht: 8,   // Meter pro Radiant Drehung (dichter in Kurven)
}];

const GRAD = Math.PI / 180;
const richtungVek = (w) => [Math.sin(w * GRAD), -Math.cos(w * GRAD)];

// Stützpunkte aus der Liste in track.js lesen (ohne Three.js: nur die Zahlen)
function lesePunkte(text) {
  const liste = [];
  const re = /\{ abschnitt: [^}]*\}|\{ x: (-?[\d.]+), z: (-?[\d.]+), h: (-?[\d.]+) \}/g;
  const block = text.slice(text.indexOf('export const STRECKEN_PUNKTE'), text.indexOf('];', text.indexOf('export const STRECKEN_PUNKTE')));
  let m;
  while ((m = re.exec(block))) {
    if (m[1] === undefined) liste.push({ abschnitt: m[0] });
    else liste.push({ x: +m[1], z: +m[2], h: +m[3] });
  }
  return liste;
}

// Länge der ganzen Strecke wie in baueStrecke (gleiche Spline, gleiche Unterteilung)
function streckenLaenge(punkte) {
  const v = punkte.filter((p) => p.x !== undefined).map((p) => new THREE.Vector3(p.x, p.h, p.z));
  const kurve = new THREE.CatmullRomCurve3(v, false, 'centripetal');
  kurve.arcLengthDivisions = 20000;
  return kurve.getLength();
}

// Bogen ablaufen: Ergebnis Stützpunkte (ohne Start- und Endpunkt), Endlage, Marken
function baueBogen(def, start, w0, winkel, laengen, mitPunkten = false) {
  let x = start.x, z = start.z, w = w0, t = 0;
  const punkte = [], marken = [];
  def.stuecke.forEach((st, k) => {
    if (st.abschnitt) { if (mitPunkten) punkte.push({ abschnitt: st.abschnitt }); return; }
    const vorher = { x, z, w, t };
    if (st.gerade !== undefined) {
      const L = laengen[k] ?? st.gerade;
      const n = Math.max(1, Math.round(L / def.punktAbstand));
      const [dx, dz] = richtungVek(w);
      for (let j = 1; j <= n; j++) {
        if (mitPunkten) punkte.push({ x: x + (dx * L * j) / n, z: z + (dz * L * j) / n, t: t + (L * j) / n, stueck: k });
      }
      x += dx * L; z += dz * L; t += L;
    } else {
      const a = winkel[k] ?? st.kurve, R = st.radius;
      const bogen = Math.abs(a) * GRAD * R;
      const n = Math.max(2, Math.round(bogen / (def.punktAbstand * 0.8)));
      for (let j = 1; j <= n; j++) {
        // Kreisbogen exakt: Mittelpunkt seitlich
        const s = Math.sign(a), wj = w + (a * j) / n;
        const [rx, rz] = richtungVek(w + s * 90);
        const mx = x + rx * R, mz = z + rz * R;
        const [qx, qz] = richtungVek(wj - s * 90);
        if (mitPunkten || j === n) {
          const p = { x: mx + qx * R, z: mz + qz * R, t: t + (bogen * j) / n, stueck: k };
          if (mitPunkten) punkte.push(p);
          if (j === n) { x = p.x; z = p.z; }
        }
      }
      w += a; t += bogen;
    }
    marken.push({ k, st, von: vorher, bis: { x, z, w, t } });
  });
  return { punkte, ende: { x, z, w }, laenge: t, marken };
}

// Zwei lineare Unbekannte (Längen der Geraden mit frei: 'lage') so, dass der Bogen am Ziel ankommt
function loeseLage(def, start, w0, winkel, ziel) {
  const freie = def.stuecke.map((st, k) => (st.frei === 'lage' ? k : -1)).filter((k) => k >= 0);
  const basis = {};
  for (const k of freie) basis[k] = 0;
  const e0 = baueBogen(def, start, w0, winkel, basis).ende;
  const spalten = freie.map((k) => {
    const l = { ...basis, [k]: 1 };
    const e = baueBogen(def, start, w0, winkel, l).ende;
    return [e.x - e0.x, e.z - e0.z];
  });
  const [a, c] = spalten[0], [b, d] = spalten[1];
  const rx = ziel.x - e0.x, rz = ziel.z - e0.z, det = a * d - b * c;
  return { [freie[0]]: (rx * d - b * rz) / det, [freie[1]]: (a * rz - c * rx) / det };
}

const text = fs.readFileSync(TRACK, 'utf8');
let neuText = text;
for (const def of BOGEN_LISTE) {
  const marke0 = `// <nebenweg ${def.name}>`, marke1 = '// </nebenweg>';
  // Punkte der Strecke ohne den alten/aktuellen Bogen
  const alle = lesePunkte(text);
  const iS = alle.findIndex((p) => p.x === def.start.x && p.z === def.start.z);
  const iE = alle.findIndex((p) => p.x === def.ende.x && p.z === def.ende.z);
  if (iS < 0 || iE < 0) throw new Error('Start- oder Endpunkt nicht in track.js gefunden');
  const vor = alle.slice(0, iS + 1), nach = alle.slice(iE);
  const pS = alle[iS], pE = alle[iE];
  // Richtung am Start: wie die Spline am Startpunkt (vom Punkt davor zum Startpunkt hin, gemittelt)
  const davor = vor.filter((p) => p.x !== undefined).slice(-2)[0];
  const danach = nach.filter((p) => p.x !== undefined)[1];
  const w0 = Math.atan2(pS.x - davor.x, -(pS.z - davor.z)) / GRAD;
  const wE = Math.atan2(danach.x - pE.x, -(danach.z - pE.z)) / GRAD;
  const iL = def.stuecke.findIndex((st) => st.frei === 'laenge');
  const iR = def.stuecke.findIndex((st) => st.frei === 'richtung');

  // Für einen Winkel der 'laenge'-Kurve: Richtungs-Kurve und Lage-Geraden ausrechnen, Punkte bauen
  function versuch(aL) {
    const winkel = { [iL]: aL };
    const summe = def.stuecke.reduce((s, st, k) => s + (st.kurve !== undefined && k !== iR ? (winkel[k] ?? st.kurve) : 0), 0);
    winkel[iR] = wE - w0 - summe;
    const laengen = loeseLage(def, pS, w0, winkel, pE);
    if (Object.values(laengen).some((l) => !(Math.abs(l) < 2000))) return { winkel, laengen, laenge: Infinity, b: { laenge: 0 }, punkte: [] };
    let b = baueBogen(def, pS, w0, winkel, laengen, true);
    if (def.anzahlPunkte) {
      // gleich viele Stützpunkte wie das alte Stück: gleichmässig verteilt (siehe anzahlPunkte oben)
      const dicht = baueBogen({ ...def, punktAbstand: 0.25 }, pS, w0, winkel, laengen, true);
      const N = def.anzahlPunkte, neu = [];
      // Mass entlang des Bogens: Meter plus (kurveGewicht x Drehung in Radiant) – in Kurven
      // liegen die Punkte so dichter als auf Geraden
      const dp = dicht.punkte.filter((p) => !p.abschnitt);
      let m = 0;
      dp.forEach((p, i) => {
        if (i > 0) {
          const q = dp[i - 1], r = dp[Math.min(dp.length - 1, i + 1)];
          const w1 = Math.atan2(p.x - q.x, p.z - q.z), w2 = Math.atan2(r.x - p.x, r.z - p.z);
          const dreh = r === p ? 0 : Math.abs(Math.atan2(Math.sin(w2 - w1), Math.cos(w2 - w1)));
          m += Math.hypot(p.x - q.x, p.z - q.z) + (def.kurveGewicht || 0) * dreh;
        }
        p.m = m;
      });
      const mGesamt = m + 0.25;
      let j = 0, abschnitt = null;
      for (let k = 1; k <= N + 1; k++) {
        const mk = (mGesamt * k) / (N + 1);
        while (j < dicht.punkte.length - 1 && (dicht.punkte[j].abschnitt || dicht.punkte[j].m < mk)) {
          if (dicht.punkte[j].abschnitt) abschnitt = dicht.punkte[j];
          j++;
        }
        if (abschnitt) { neu.push(abschnitt); abschnitt = null; }
        const p1 = dicht.punkte[j], p0 = dicht.punkte[j - 1] && !dicht.punkte[j - 1].abschnitt ? dicht.punkte[j - 1] : p1;
        const f = p1.m > p0.m ? Math.min(1, (mk - p0.m) / (p1.m - p0.m)) : 0;
        neu.push({ x: p0.x + (p1.x - p0.x) * f, z: p0.z + (p1.z - p0.z) * f, t: p0.t + (p1.t - p0.t) * f, stueck: f < 0.5 ? p0.stueck : p1.stueck });
      }
      b = { ...dicht, punkte: neu };
    }
    // Höhen: gleichmässig + Hügel (weich, ohne Knick an den Enden der Hügel)
    const L = b.laenge;
    const pkt = b.punkte.map((p) => {
      if (p.abschnitt) return p;
      const f = p.t / L;
      let h = pS.h + (pE.h - pS.h) * f;
      for (const hg of def.huegel) {
        const u = (f - hg.mitte) / (hg.breite / 2);
        if (Math.abs(u) < 1) h += hg.hoehe * Math.cos((u * Math.PI) / 2) ** 2;
      }
      return { ...p, h };
    });
    // letzter Punkt des Bogens = Endpunkt (bleibt), nicht doppelt
    pkt.pop();
    const runden = pkt.map((p) => (p.abschnitt ? p : { ...p, x: Math.round(p.x * 1e4) / 1e4, z: Math.round(p.z * 1e4) / 1e4, h: Math.round(p.h * 1e4) / 1e4 }));
    const laenge = streckenLaenge([...vor, ...runden, ...nach]);
    return { winkel, laengen, b, punkte: runden, laenge };
  }
  // Winkel der 'laenge'-Kurve: erst grob abtasten (alle Geraden mindestens 3 m lang), dann halbieren
  const gueltig = (v) => Object.values(v.laengen).every((l) => l >= 3);
  const basisA = def.stuecke[iL].kurve, richtungA = Math.sign(basisA);
  let v1 = null, lo = null, hi = null;
  let vorher = null;
  for (let a = Math.max(2, Math.abs(basisA) - 20); a <= Math.abs(basisA) + 20; a += 1) {
    const v = versuch(richtungA * a);
    if (process.argv.includes('--abtasten')) console.log(a, (v.laenge - ZIEL_LAENGE).toFixed(2), Object.values(v.laengen).map((l) => l.toFixed(1)).join(' '));
    if (vorher && gueltig(v) && gueltig(vorher.v) && Math.sign(v.laenge - ZIEL_LAENGE) !== Math.sign(vorher.v.laenge - ZIEL_LAENGE)) {
      // die Lösung, die dem Wunschwinkel am nächsten liegt
      if (!lo || Math.abs(a - Math.abs(basisA)) < Math.abs(Math.abs(lo) - Math.abs(basisA))) { lo = richtungA * vorher.a; hi = richtungA * a; }
    }
    vorher = { a, v };
  }
  if (lo === null) throw new Error('Keine passende Länge gefunden – Bogen anpassen (--abtasten zeigt die Werte)');
  let vLo = versuch(lo);
  for (let it = 0; it < 60; it++) {
    const m = (lo + hi) / 2, vm = versuch(m);
    v1 = vm;
    if (Math.abs(vm.laenge - ZIEL_LAENGE) < 1e-6 || Math.abs(hi - lo) < 1e-12) break;
    if (Math.sign(vm.laenge - ZIEL_LAENGE) === Math.sign(vLo.laenge - ZIEL_LAENGE)) { lo = m; vLo = vm; } else hi = m;
  }
  // Feinschliff: wegen der gerundeten Koordinaten (0.1 mm) springt die Länge in kleinen Stufen –
  // in der Nähe die Stufe suchen, die am besten passt
  let v = v1;
  for (let d = -200; d <= 200; d++) {
    const w = versuch(v1.winkel[iL] + d * 2e-6);
    if (Math.abs(w.laenge - ZIEL_LAENGE) < Math.abs(v.laenge - ZIEL_LAENGE)) v = w;
  }
  console.log(`Nebenweg "${def.name}": Strecke ${v.laenge.toFixed(4)} m (Ziel ${ZIEL_LAENGE.toFixed(4)} m, Abweichung ${(v.laenge - ZIEL_LAENGE).toExponential(2)} m)`);
  console.log(`  Start-Richtung ${w0.toFixed(1)}°, End-Richtung ${wE.toFixed(1)}°, Bogen ${v.b.laenge.toFixed(1)} m`);
  for (const mk of v.b.marken) {
    const st = mk.st;
    const txt = st.gerade !== undefined ? `Gerade ${(mk.bis.t - mk.von.t).toFixed(1)} m`
      : `Kurve ${(mk.bis.w - mk.von.w) > 0 ? 'rechts' : 'links'} ${Math.abs(mk.bis.w - mk.von.w).toFixed(1)}°, Radius ${st.radius} m`;
    console.log(`  ab Bogen-Meter ${mk.von.t.toFixed(1).padStart(6)}: ${txt}${st.marke ? `  (${st.marke})` : ''}`);
  }
  if (Object.values(v.laengen).some((l) => l < 3)) console.log('  ACHTUNG: eine Gerade ist kürzer als 3 m – Bogen anpassen!');

  // Text für track.js: Kommentar pro Stück wie im Rest der Datei, Punkte 3 pro Zeile
  const zeilen = [marke0, '  // (automatisch von tools/nebenweg-bogen.mjs – Bogen dort ändern, nicht hier)'];
  let zeile = [];
  const flush = () => { if (zeile.length) zeilen.push('  ' + zeile.join(', ') + ','); zeile = []; };
  let stueck = -1;
  const steigung = (k) => {
    const ps = v.punkte.filter((p) => p.stueck === k);
    return ps.length > 1 ? ((ps[ps.length - 1].h - ps[0].h) / (ps[ps.length - 1].t - ps[0].t)) * 100 : 0;
  };
  for (const p of v.punkte) {
    if (p.abschnitt) { flush(); zeilen.push('  ' + p.abschnitt + ','); continue; }
    if (p.stueck !== stueck) {
      flush();
      stueck = p.stueck;
      const mk = v.b.marken.find((m) => m.k === stueck), st = mk.st;
      const was = st.gerade !== undefined ? `gerade ${Math.round(mk.bis.t - mk.von.t)} m`
        : `Kurve ${(mk.bis.w - mk.von.w) > 0 ? 'rechts' : 'links'} ${Math.round(Math.abs(mk.bis.w - mk.von.w))}°, Radius ${st.radius} m`;
      zeilen.push(`  // ${was}, Steigung ${steigung(stueck).toFixed(0)} %${st.marke ? ` – ${st.marke}` : ''}`);
    }
    zeile.push(`{ x: ${p.x.toFixed(4)}, z: ${p.z.toFixed(4)}, h: ${p.h.toFixed(4)} }`);
    if (zeile.length === 3) flush();
  }
  flush();
  zeilen.push('  ' + marke1);
  const block = zeilen.join('\n');

  const a = neuText.indexOf(marke0), e = neuText.indexOf(marke1);
  if (a < 0 || e < 0) throw new Error(`Marker "${marke0}" / "${marke1}" fehlen in js/track.js`);
  const zeilenAnfang = neuText.lastIndexOf('\n', a) + 1;
  neuText = neuText.slice(0, zeilenAnfang) + block + neuText.slice(e + marke1.length);
}
if (!process.argv.includes('--zeigen')) {
  fs.writeFileSync(TRACK, neuText);
  console.log('-> js/track.js geschrieben');
}
