// Abkürzungs-Sperren: Felsbrocken, Tannengruppen und umgefallene Baumstämme
// auf der Innenseite von Kurven, die man sonst schneiden könnte.
//
// Wo eine Sperre steht, rechnet das Werkzeug tools/abkuerzungen.mjs aus und
// schreibt es nach js/abkuerzungen.js. Jede Sperre ist eine Linie, die an der
// Stelle s quer von der Strasse weg ins Kurveninnere führt (von / bis = Abstand
// zur Strassenmitte). Wie die Sperre aussieht (Mischung, Grössen, Lücken),
// wird hier beim Laden aus config.js gebaut – mit festem Zufalls-Startwert,
// also bei jeder Fahrt gleich.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische } from './util.js';
import { rindenTextur, holzringTextur } from './pixel.js';

const GRAD = Math.PI / 180;

// Zufallszahl zwischen a und b, ganze Zahl zwischen a und b
const zwischen = (rnd, [a, b]) => mische(a, b, rnd());
const ganz = (rnd, [a, b]) => a + Math.floor(rnd() * (b - a + 1));

// Plant die Teile einer Sperre (ohne 3D-Objekte; das Werkzeug braucht das auch).
// sperre: { s, seite (+1 = rechts, -1 = links), von, bis }
// tex: Seitenverhältnisse der Sprites { tanne, fels, stein }
// Ergebnis: { tannen, felsen, steine, staemme, hindernisse }
export function planeSperre(sperre, strecke, welt, tex) {
  const c = CONFIG.sperren;
  const rnd = zufall(c.seed + Math.round(sperre.s * 10) * 2 + (sperre.seite > 0 ? 1 : 0));
  const p = strecke.punktBei(sperre.s);
  const nx = -p.tz * sperre.seite, nz = p.tx * sperre.seite; // von der Strasse weg ins Kurveninnere
  const ux = p.tx, uz = p.tz;                                // entlang der Strasse
  const welt2 = (d, u) => [p.x + nx * d + ux * u, p.z + nz * d + uz * u];
  const q = {};

  // Darf ein Kreis hier stehen? (weit genug von jeder Strasse, nicht in der Felswand)
  function platzOk(x, z, r, mindest) {
    strecke.abfrage(x, z, q);
    if (q.abstand - r < mindest) return false;
    if (q.wandSeite && Math.sign(q.seite) === q.wandSeite && q.wandStaerke > 0.05) return false;
    return true;
  }

  // --- Bausteine. Jeder liefert Kreise in Sperren-Koordinaten (d = weg von der
  // Strasse, u = entlang der Strasse) und was gezeichnet wird.
  function felsGruppe(pos, u0) {
    const teile = [];
    let d = pos;
    const n = ganz(rnd, c.felsGruppe);
    for (let k = 0; k < n; k++) {
      const h = zwischen(rnd, c.felsHoehe) * (k ? 0.8 : 1);
      const b = h * tex.fels.seitenVerhaeltnis;
      const r = b * c.felsFaktor;
      d += r - (k ? zwischen(rnd, [0.2, 0.6]) : 0);
      teile.push({ art: 'fels', d, u: u0 + (rnd() - 0.5) * 0.8, r, h, b });
      d += r;
    }
    return teile;
  }
  function baumGruppe(pos, u0) {
    const teile = [];
    const n = ganz(rnd, c.baumGruppe);
    const kette = Math.max(2, Math.ceil(n * 0.6));
    const r = CONFIG.kollision.stammRadius;
    let d = pos + r;
    for (let k = 0; k < kette; k++) {
      if (k) d += zwischen(rnd, c.baumAbstand);
      teile.push({ art: 'tanne', d, u: u0 + (rnd() - 0.5) * 0.6, r, h: zwischen(rnd, c.baumHoehe) });
    }
    // die übrigen Tannen etwas daneben (dichte Gruppe statt Reihe)
    for (let k = kette; k < n; k++) {
      const an = teile[Math.floor(rnd() * kette)];
      teile.push({
        art: 'tanne', d: an.d + (rnd() - 0.5) * 1.2, u: an.u + (rnd() < 0.5 ? -1 : 1) * zwischen(rnd, [1.1, 1.8]),
        r, h: zwischen(rnd, c.baumHoehe) * 0.85,
      });
    }
    return teile;
  }
  function stammStapel(pos, u0) {
    const laenge = zwischen(rnd, c.stammLaenge);
    const dicke = zwischen(rnd, c.stammDicke);
    const anzahl = ganz(rnd, c.stammStapel);
    const w = (rnd() - 0.5) * 2 * c.stammDrehung * GRAD; // Drehung gegen die Querrichtung
    const ad = Math.cos(w), au = Math.sin(w);              // Richtung des Stamms (d, u)
    const r = dicke / 2;
    // Mitte so, dass das nahe Ende bei pos liegt
    const dm = pos + r + ((laenge - r) / 2) * Math.abs(ad), um = u0 + (rnd() - 0.5) * 0.6;
    // unten 1 oder 2 Stämme nebeneinander, beim 3er-Stapel einer oben drauf
    const unten = anzahl === 1 ? [0] : [-r * 1.02, r * 1.02];
    const lagen = unten.map((v) => ({ v, hoch: 0 }));
    if (anzahl === 3) lagen.push({ v: 0, hoch: r * 1.7 });
    return lagen.map((lage, k) => ({
      art: 'stamm', d: dm - au * lage.v, u: um + ad * lage.v, ad, au, laenge: laenge * (k === 2 ? 0.85 : 1) * (k === 1 ? 0.92 : 1),
      r, hoch: lage.hoch, oben: lage.hoch > 0,
    }));
  }

  // Kreise eines Teils (für Kollision und Lückenprüfung)
  function kreise(t) {
    if (t.art !== 'stamm') return [{ d: t.d, u: t.u, r: t.r }];
    if (t.oben) return []; // liegt auf den anderen, die halten schon
    const liste = [];
    const n = Math.max(1, Math.round(t.laenge / c.stammKreisAbstand));
    for (let k = 0; k <= n; k++) {
      const f = k / n - 0.5;
      liste.push({ d: t.d + t.ad * f * (t.laenge - t.r), u: t.u + t.au * f * (t.laenge - t.r), r: t.r });
    }
    return liste;
  }
  // kleinste Lücke (Kante zu Kante) zwischen zwei Gruppen von Kreisen
  function luecke(a, b) {
    let min = Infinity;
    for (const k1 of a) for (const k2 of b) min = Math.min(min, Math.hypot(k1.d - k2.d, k1.u - k2.u) - k1.r - k2.r);
    return min;
  }
  const verschiebe = (teile, dd) => teile.forEach((t) => { t.d += dd; });

  // --- Sperre aufbauen: Bausteine von der Strasse weg aneinanderreihen
  const alle = [];
  let vorher = null; // Kreise des vorherigen Bausteins
  // Die Sperre verläuft leicht schräg und pendelt seitlich (keine gerade Reihe)
  const schraeg = Math.tan((rnd() - 0.5) * 2 * c.schraeg * GRAD);
  let pos = sperre.von, pendel = (rnd() - 0.5) * c.seitlich, letzteArt = '';
  const uBei = (d) => (d - sperre.von) * schraeg + pendel;
  while (pos < sperre.bis) {
    const u0 = uBei(pos);
    // Mischung; Tannen nicht zu nah an der Strasse (Kronen), nicht zweimal dasselbe
    let art;
    for (let versuch = 0; versuch < 6; versuch++) {
      const w = rnd() * (c.mischung.fels + c.mischung.baeume + c.mischung.stamm);
      art = w < c.mischung.fels ? 'fels' : w < c.mischung.fels + c.mischung.baeume ? 'baeume' : 'stamm';
      if (art === 'baeume' && pos < c.baumAbstandMitte) continue;
      if (art !== letzteArt || versuch > 3) break;
    }
    if (art === 'baeume' && pos < c.baumAbstandMitte) art = rnd() < 0.5 ? 'fels' : 'stamm';
    const teile = art === 'fels' ? felsGruppe(pos, u0) : art === 'baeume' ? baumGruppe(pos, u0) : stammStapel(pos, u0);
    let k = teile.flatMap(kreise);
    // Lücke zum vorherigen Baustein nie grösser als maxLuecke (sonst passt ein Auto durch)
    if (vorher) {
      for (let runde = 0; runde < 5; runde++) {
        const l = luecke(vorher, k);
        if (l <= c.maxLuecke) break;
        verschiebe(teile, -(l - c.maxLuecke * 0.7));
        k = teile.flatMap(kreise);
      }
    }
    // Platz prüfen (Strasse frei lassen); der erste Baustein darf weiter weg rücken
    let ok = false;
    for (let versuch = 0; versuch < (vorher ? 1 : 8); versuch++) {
      ok = teile.every((t) => {
        const mind = t.art === 'tanne' ? c.baumAbstandMitte : c.abstandMitte;
        return kreise(t).concat(t.oben ? [] : [{ d: t.d, u: t.u, r: t.r }])
          .every((kr) => platzOk(...welt2(kr.d, kr.u), kr.r, mind));
      });
      if (ok) break;
      verschiebe(teile, 0.5);
      k = teile.flatMap(kreise);
    }
    if (!ok) break; // hier geht es nicht weiter (z. B. die nächste Kehre kommt)
    alle.push(...teile);
    vorher = k;
    // ab und zu ein Begleiter daneben: macht aus der Reihe eine Gruppe
    if (rnd() < c.begleitChance) {
      const an = teile[0];
      const seite = rnd() < 0.5 ? -1 : 1;
      const b = rnd() < 0.5 && an.d > c.baumAbstandMitte
        ? { art: 'tanne', r: CONFIG.kollision.stammRadius, h: zwischen(rnd, c.baumHoehe) }
        : (() => { const h = zwischen(rnd, c.felsHoehe) * 0.7, bb = h * tex.fels.seitenVerhaeltnis; return { art: 'fels', h, b: bb, r: bb * c.felsFaktor }; })();
      b.d = an.d + (rnd() - 0.5) * 1.5;
      b.u = an.u + seite * (an.r + b.r + zwischen(rnd, [0.3, 1.5]));
      const mind = b.art === 'tanne' ? c.baumAbstandMitte : c.abstandMitte;
      if (platzOk(...welt2(b.d, b.u), b.r, mind)) alle.push(b);
    }
    pos = Math.max(...k.map((kr) => kr.d + kr.r)) + zwischen(rnd, c.luecke);
    pendel = Math.max(-c.seitlich, Math.min(c.seitlich, pendel + (rnd() - 0.5) * c.seitlich));
    letzteArt = art;
  }

  // ein paar kleine Steine als Begleiter (sieht natürlicher aus)
  const begleiter = [];
  if (alle.length) {
    const n = ganz(rnd, c.begleitSteine);
    for (let k = 0; k < n; k++) {
      const an = alle[Math.floor(rnd() * alle.length)];
      const h = zwischen(rnd, CONFIG.sprites.steinHoehe);
      const b = h * tex.stein.seitenVerhaeltnis, r = b * CONFIG.kollision.steinFaktor;
      const t = { art: 'stein', d: an.d + (rnd() - 0.5) * 2, u: an.u + (rnd() < 0.5 ? -1 : 1) * zwischen(rnd, [1.8, 3.2]), r, h, b };
      if (platzOk(...welt2(t.d, t.u), r, c.abstandMitte)) begleiter.push(t);
    }
  }

  // --- in Weltkoordinaten umrechnen
  const ergebnis = { tannen: [], felsen: [], steine: [], staemme: [], hindernisse: [] };
  const sprite = (t, x, z, versinken, varianten) => ({
    x, z, y: welt.gelaendeHoehe(x, z) - versinken, h: t.h, b: t.b,
    variante: Math.floor(rnd() * varianten), hell: 0.82 + rnd() * 0.22, spiegeln: rnd() < 0.5,
  });
  for (const t of [...alle, ...begleiter]) {
    const [x, z] = welt2(t.d, t.u);
    if (t.art === 'tanne') {
      t.b = t.h * tex.tanne.seitenVerhaeltnis;
      ergebnis.tannen.push(sprite(t, x, z, 0.25, tex.tanne.varianten));
    } else if (t.art === 'fels') {
      ergebnis.felsen.push(sprite(t, x, z, 0.35, tex.fels.varianten));
    } else if (t.art === 'stein') {
      ergebnis.steine.push(sprite(t, x, z, 0.25, tex.stein.varianten));
    } else {
      // Stamm: Richtung in der Welt
      const dx = nx * t.ad + ux * t.au, dz = nz * t.ad + uz * t.au;
      ergebnis.staemme.push({ x, z, dx, dz, laenge: t.laenge, r: t.r, hoch: t.hoch, aeste: ganz(rnd, c.aeste), zufall: rnd() });
    }
    for (const kr of kreise(t)) {
      const [kx, kz] = welt2(kr.d, kr.u);
      ergebnis.hindernisse.push({ x: kx, z: kz, r: kr.r, sperre: true });
    }
  }
  return ergebnis;
}

// Alle Sperren einer Liste planen
export function planeAlleSperren(liste, strecke, welt, tex) {
  const alle = { tannen: [], felsen: [], steine: [], staemme: [], hindernisse: [] };
  for (const sperre of liste) {
    const e = planeSperre(sperre, strecke, welt, tex);
    for (const k of Object.keys(alle)) alle[k].push(...e[k]);
  }
  return alle;
}

// Die liegenden Baumstämme zeichnen: Low-Poly-Zylinder mit Rinde und hellem
// Holzring an den Enden, dazu ein paar abgebrochene Äste. Alles instanziert
// (ein Zeichenaufruf für alle Stämme, einer für alle Äste).
export function baueStaemme(szene, staemme, welt) {
  if (!staemme.length) return;
  const c = CONFIG.sperren;
  const rinde = rindenTextur();
  rinde.repeat.set(1, 2);
  const holz = holzringTextur();
  const matRinde = new THREE.MeshLambertMaterial({ map: rinde, flatShading: true });
  const matHolz = new THREE.MeshLambertMaterial({ map: holz, flatShading: true });

  // Zylinder liegt entlang x, Länge 1, Radius 1 (wird pro Stamm skaliert)
  const geo = new THREE.CylinderGeometry(1, 1, 1, c.stammSeiten, 1, false);
  geo.rotateZ(Math.PI / 2);
  const stammMesh = new THREE.InstancedMesh(geo, [matRinde, matHolz, matHolz], staemme.length);

  const astGeo = new THREE.CylinderGeometry(0.6, 1, 1, 5, 1, false);
  astGeo.translate(0, 0.5, 0); // Ast wächst vom Fuss nach oben (y)
  const anzahlAeste = staemme.reduce((n, s) => n + s.aeste, 0);
  const astMesh = new THREE.InstancedMesh(astGeo, matRinde, Math.max(1, anzahlAeste));

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const pos = new THREE.Vector3(), skal = new THREE.Vector3();
  let nAst = 0;
  staemme.forEach((s, i) => {
    const rnd = zufall(Math.floor(s.zufall * 1e9));
    const yaw = Math.atan2(-s.dz, s.dx); // Drehung um die Hochachse (x-Achse -> Stammrichtung)
    const halbe = s.laenge / 2;
    // Gelände unter dem Stamm abtasten (entlang und etwas quer), damit nichts durchsticht
    const h1 = welt.gelaendeHoehe(s.x - s.dx * halbe, s.z - s.dz * halbe);
    const h2 = welt.gelaendeHoehe(s.x + s.dx * halbe, s.z + s.dz * halbe);
    let heben = -Infinity;
    for (let f = -0.5; f <= 0.5001; f += 0.5 / Math.ceil(halbe / 0.4)) {
      const achse = mische(h1, h2, f + 0.5);
      for (const quer of [-0.7, 0, 0.7]) {
        const x = s.x + s.dx * f * s.laenge - s.dz * quer * s.r, z = s.z + s.dz * f * s.laenge + s.dx * quer * s.r;
        heben = Math.max(heben, welt.gelaendeHoehe(x, z) - achse);
      }
    }
    // Stamm liegt auf (Achse ca. 0.8 Radien über dem höchsten Punkt darunter)
    const y = (h1 + h2) / 2 + heben + s.r * c.stammAufliegen + s.hoch;
    const neigung = Math.atan2(h2 - h1, s.laenge);
    e.set(0, yaw, neigung, 'YZX');
    q.setFromEuler(e);
    pos.set(s.x, y, s.z);
    skal.set(s.laenge, s.r, s.r);
    m.compose(pos, q, skal);
    stammMesh.setMatrixAt(i, m);
    // Farbe leicht variieren
    const hell = 0.85 + rnd() * 0.25;
    stammMesh.setColorAt(i, new THREE.Color(hell, hell, hell));

    // abgebrochene Äste: kurze Stummel, schräg nach oben/aussen
    for (let k = 0; k < s.aeste; k++) {
      const f = (rnd() - 0.5) * 0.8;
      const um = rnd() * Math.PI * 2;
      const lokal = new THREE.Vector3(f * s.laenge, Math.cos(um) * s.r * 0.9, Math.sin(um) * s.r * 0.9).applyQuaternion(q);
      const ap = new THREE.Vector3(s.x, y, s.z).add(lokal);
      // Richtung: vom Stamm weg (Umfang) und etwas entlang des Stamms
      const richtung = new THREE.Vector3((rnd() - 0.5) * 0.8, Math.cos(um), Math.sin(um)).applyQuaternion(q).normalize();
      if (richtung.y < -0.2) richtung.y = -richtung.y; // nicht in den Boden
      const aq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), richtung);
      const dicke = s.r * (0.12 + rnd() * 0.1);
      m.compose(ap, aq, new THREE.Vector3(dicke, s.r * (0.6 + rnd() * 1.2), dicke));
      astMesh.setMatrixAt(nAst++, m);
    }
  });
  stammMesh.instanceMatrix.needsUpdate = true;
  if (stammMesh.instanceColor) stammMesh.instanceColor.needsUpdate = true;
  astMesh.count = nAst;
  astMesh.instanceMatrix.needsUpdate = true;
  szene.add(stammMesh, astMesh);
}
