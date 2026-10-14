// Absperrungen (seit Meilenstein 3a, als Leitwand seit M3a.1): Wo die Etappe von der Hauptstrasse
// abbiegt (oder wieder einmündet), ist die andere Richtung der Hauptstrasse (der Stummel) zu – wie
// bei einer echten Rallye. Die Absperrung steht direkt an der Kreuzung und ist gebogen: Sie beginnt
// an der Aussenseite der Kurve, schwingt sich quer über die Geradeaus-Richtung und läuft zum
// Nebenweg hin (Linie aus netz.js, "ast.sperre"). So sieht man sofort: hier nicht geradeaus.
// Vier Arten (config.js, "absperrung" und "nebenwege"):
//   band   rot-weisses Flatterband (zwei Bänder) an 1.5 m hohen Warnstangen
//   reifen Reifenstapel (ca. 1.3 m), zwei versetzte Reihen, einzelne Reifen weiss gestrichen
//   heu    Strohballen (1.2-m-Würfel), zwei Lagen
//   zaun   Holzböcke (1.3 m, A-Beine, rot-weisse Bretter), leicht schief
// Dazu: grosses Verbots-Symbol (rotes Rund, weisser Balken) über der Geradeaus-Richtung, rot-weisse
// Chevrons entlang der Leitwand und ca. 70 m vor der Kreuzung eine grosse Richtungstafel.
// Kollision hart (Kreise wie beim Zaun). An beiden Enden schliesst der Seitenschutz an
// (strassenrand.js), damit niemand um die Absperrung herumfährt.
// Gezeichnet wird alles mit einem Material und einem Bild (pixel.js, absperrAtlas): ein Zeichenaufruf.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische } from './util.js';
import { absperrAtlas } from './pixel.js';
import { ABKUERZUNGEN } from './abkuerzungen.js';

// andere: Hindernisse, die schon stehen (Bäume, Strassenrand) – die Richtungstafel weicht ihnen aus
export function baueAbsperrungen(szene, welt, andere = []) {
  const t0 = performance.now();
  const netz = welt.netz;
  const c = CONFIG.absperrung;
  const atlas = absperrAtlas();
  const pos = [], uv = [], col = [], idx = [];
  const hindernisse = [];
  const liste = [];
  const boden = (x, z) => welt.bodenBei(x, z).h;

  // --- kleine Bauteile ------------------------------------------------------------
  // Viereck a-b-c-d (unten links, unten rechts, oben rechts, oben links)
  function viereck(a, b, cc, d, kachel, hell = 1, spiegeln = false) {
    const t = atlas.kachel(kachel);
    let u0 = t.u0, u1 = t.u1;
    if (spiegeln) [u0, u1] = [u1, u0];
    const basis = pos.length / 3;
    pos.push(...a, ...b, ...cc, ...d);
    uv.push(u0, t.v0, u1, t.v0, u1, t.v1, u0, t.v1);
    for (let k = 0; k < 4; k++) col.push(hell, hell, hell);
    idx.push(basis, basis + 1, basis + 2, basis, basis + 2, basis + 3);
  }
  // Quader: Mitte unten (x, y, z), entlang (ux, uz), Länge L, Tiefe T, Höhe H
  function quader(x, y, z, ux, uz, L, T, H, kSeite, kOben, kEnde = kSeite, hell = 1) {
    const vx = -uz, vz = ux, l = L / 2, t = T / 2;
    const p = (a, b, oben) => [x + ux * a * l + vx * b * t, y + (oben ? H : 0), z + uz * a * l + vz * b * t];
    viereck(p(-1, -1, 0), p(1, -1, 0), p(1, -1, 1), p(-1, -1, 1), kSeite, hell);
    viereck(p(1, 1, 0), p(-1, 1, 0), p(-1, 1, 1), p(1, 1, 1), kSeite, hell * 0.9);
    viereck(p(1, -1, 0), p(1, 1, 0), p(1, 1, 1), p(1, -1, 1), kEnde, hell * 0.95);
    viereck(p(-1, 1, 0), p(-1, -1, 0), p(-1, -1, 1), p(-1, 1, 1), kEnde, hell * 0.95);
    viereck(p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1), kOben, hell * 1.05);
  }
  // Balken von Punkt a nach Punkt b (quadratischer Querschnitt, dicke)
  function balken(a, b, dicke, kachel, hell = 1) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
    const hilf = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const e1 = new THREE.Vector3().crossVectors(d, hilf).normalize().multiplyScalar(dicke / 2);
    const e2 = new THREE.Vector3().crossVectors(d, e1).normalize().multiplyScalar(dicke / 2);
    const ecke = (p, s1, s2) => [p[0] + e1.x * s1 + e2.x * s2, p[1] + e1.y * s1 + e2.y * s2, p[2] + e1.z * s1 + e2.z * s2];
    const s = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    for (let k = 0; k < 4; k++) {
      const [a1, a2] = s[k], [b1, b2] = s[(k + 1) % 4];
      viereck(ecke(a, a1, a2), ecke(a, b1, b2), ecke(b, b1, b2), ecke(b, a1, a2), kachel, hell * (k % 2 ? 0.9 : 1));
    }
  }
  // Reifen (liegend): Mitte unten (x, y, z), Radius r, Höhe h, n Seiten, Drehung w.
  // deckel = oben ein Ring (nur beim obersten Reifen eines Stapels, die anderen sieht man nicht)
  function reifen(x, y, z, r, h, n, kMantel, w, hell, deckel) {
    const t = atlas.kachel(kMantel), o = atlas.kachel('reifenOben');
    const ring = [];
    for (let k = 0; k <= n; k++) {
      const a = w + (k / n) * Math.PI * 2;
      ring.push([Math.cos(a), Math.sin(a)]);
    }
    for (let k = 0; k < n; k++) {
      const [c1, s1] = ring[k], [c2, s2] = ring[k + 1];
      const basis = pos.length / 3;
      pos.push(x + c1 * r, y, z + s1 * r, x + c2 * r, y, z + s2 * r, x + c2 * r, y + h, z + s2 * r, x + c1 * r, y + h, z + s1 * r);
      const u0 = mische(t.u0, t.u1, k / n), u1 = mische(t.u0, t.u1, (k + 1) / n);
      uv.push(u0, t.v0, u1, t.v0, u1, t.v1, u0, t.v1);
      const hh = hell * (0.85 + 0.15 * Math.abs(c1));
      for (let j = 0; j < 4; j++) col.push(hh, hh, hh);
      idx.push(basis, basis + 1, basis + 2, basis, basis + 2, basis + 3);
    }
    if (!deckel) return;
    // Deckel als Fächer (Textur: Gummiring mit Loch)
    const basis = pos.length / 3;
    pos.push(x, y + h, z);
    uv.push((o.u0 + o.u1) / 2, (o.v0 + o.v1) / 2);
    col.push(hell, hell, hell);
    for (let k = 0; k <= n; k++) {
      const [ck, sk] = ring[k];
      pos.push(x + ck * r, y + h, z + sk * r);
      uv.push(mische(o.u0, o.u1, 0.5 + ck * 0.5), mische(o.v0, o.v1, 0.5 + sk * 0.5));
      col.push(hell, hell, hell);
    }
    for (let k = 0; k < n; k++) idx.push(basis, basis + 1 + k, basis + 2 + k);
  }
  // Tafel an einem Pfosten: Mitte (x, z), Unterkante "unten" über y, schaut in Richtung (bx, bz)
  function tafel(x, y, z, bx, bz, b, h, unten, kachel, spiegeln = false, ruecken = 'blech', pfosten = true) {
    const rx = bz, rz = -bx; // rechts aus Sicht des Betrachters
    if (pfosten) pfostenStahl(x - bx * 0.05, y, z - bz * 0.05, unten + h * 0.8);
    const p = (f, oben, hinten = 0) => [x + rx * (b / 2) * f - bx * hinten, y + unten + (oben ? h : 0), z + rz * (b / 2) * f - bz * hinten];
    viereck(p(-1, 0), p(1, 0), p(1, 1), p(-1, 1), kachel, 1.15, spiegeln);
    viereck(p(1, 0, 0.03), p(-1, 0, 0.03), p(-1, 1, 0.03), p(1, 1, 0.03), ruecken, 0.9);
  }
  function pfostenStahl(x, y, z, hoch, dicke = 0.08) {
    balken([x, y - 0.1, z], [x, y + hoch, z], dicke, 'blech', 0.7);
  }

  // Linie der Leitwand mit Bogenlänge: punktBei(a) = Punkt a Meter vom Anfang (aussen)
  function linienLaeufer(li) {
    const m = [0];
    for (let k = 1; k < li.length; k++) m.push(m[k - 1] + Math.hypot(li[k].x - li[k - 1].x, li[k].z - li[k - 1].z));
    const laenge = m[m.length - 1];
    const punktBei = (a) => {
      a = Math.max(0, Math.min(laenge, a));
      let k = 1;
      while (k < li.length - 1 && m[k] < a) k++;
      const f = (a - m[k - 1]) / Math.max(1e-6, m[k] - m[k - 1]), p = li[k - 1], q = li[k];
      const tx = q.x - p.x, tz = q.z - p.z, tl = Math.hypot(tx, tz) || 1;
      return { x: mische(p.x, q.x, f), z: mische(p.z, q.z, f), tx: tx / tl, tz: tz / tl, nx: mische(p.nx, q.nx, f), nz: mische(p.nz, q.nz, f), s: mische(p.s, q.s, f), l: mische(p.l, q.l, f) };
    };
    return { laenge, punktBei };
  }

  // --- Kreuzungen ------------------------------------------------------------------
  const rndHaupt = zufall(c.seed);
  for (const ast of netz.aeste) {
    if (!ast.sperre) continue;
    const art = ast.sperreArt;
    const sp = ast.sperre;
    const rnd = zufall(c.seed + ast.nr * 97 + Math.floor(rndHaupt() * 1000));
    const { laenge, punktBei } = linienLaeufer(sp.linie);
    // vorne = zur Etappe hin (n), hinten = weg von ihr. Die Linie ist die Vorderkante der Absperrung.
    const hinten = (p, d) => [p.x - p.nx * d, p.z - p.nz * d];
    let tiefe = 0.15, hoehe = 1.0;     // für die Kollision und die Höhe der Schilder darüber

    if (art === 'band') {
      const cb = c.band;
      const n = Math.max(2, Math.round(laenge / cb.pfostenAbstand));
      const posten = [];
      for (let k = 0; k <= n; k++) {
        const p = punktBei((laenge * k) / n);
        const [x, z] = hinten(p, 0.1 + (rnd() - 0.5) * 0.06);
        const y = boden(x, z);
        posten.push({ x, z, y });
        quader(x, y - 0.1, z, p.tx, p.tz, 0.09, 0.09, cb.hoehe + 0.1, 'stange', 'stange');
      }
      // zwei Bänder zwischen den Stangen, leicht durchhängend
      for (let k = 0; k < n; k++) {
        const a = posten[k], b = posten[k + 1];
        for (const h of cb.hoehen) {
          const m = 3;
          for (let j = 0; j < m; j++) {
            const f0 = j / m, f1 = (j + 1) / m;
            const sag = (f) => cb.durchhang * 4 * f * (1 - f);
            const p0 = [mische(a.x, b.x, f0), mische(a.y, b.y, f0) + h - sag(f0), mische(a.z, b.z, f0)];
            const p1 = [mische(a.x, b.x, f1), mische(a.y, b.y, f1) + h - sag(f1), mische(a.z, b.z, f1)];
            viereck([p0[0], p0[1] - 0.06, p0[2]], [p1[0], p1[1] - 0.06, p1[2]], [p1[0], p1[1] + 0.06, p1[2]], [p0[0], p0[1] + 0.06, p0[2]], 'band', 1.15);
          }
        }
      }
      tiefe = 0.2; hoehe = cb.hoehe;
    } else if (art === 'reifen') {
      // zwei Reihen Stapel, die hintere um einen halben Reifen versetzt (wirkt massiv, nicht wie eine Reihe)
      const cr = c.reifen;
      const schritt = cr.radius * 2.04;
      for (const [reihe, versatz, lagen] of [[0, 0, cr.lagen], [1, 0.5, cr.lagenHinten]]) {
        const n = Math.floor((laenge - (reihe ? schritt : 0)) / schritt) + 1;
        for (let k = 0; k < n; k++) {
          const p = punktBei(cr.radius + (k + versatz) * schritt);
          const [x0, z0] = hinten(p, cr.radius + reihe * cr.radius * 1.75 + (rnd() - 0.5) * 0.06);
          let y = boden(x0, z0) - 0.02;
          const anzahl = lagen[0] + Math.floor(rnd() * (lagen[1] - lagen[0] + 1));
          // weiss gestrichene Reifen: ganze Stapel im Wechsel (vorne), hinten einzelne
          const weissStapel = reihe === 0 && k % 2 === 1;
          for (let j = 0; j < anzahl; j++) {
            const x = x0 + (rnd() - 0.5) * 0.07, z = z0 + (rnd() - 0.5) * 0.07;
            const weiss = weissStapel ? rnd() > 0.15 : rnd() < cr.weissAnteil * 0.3;
            reifen(x, y, z, cr.radius * (0.95 + rnd() * 0.08), cr.hoehe, cr.seiten, weiss ? 'reifenWeiss' : 'reifenSeite', rnd() * Math.PI,
              (weiss ? 1 : cr.hell) * (0.85 + rnd() * 0.25), j === anzahl - 1);
            y += cr.hoehe;
          }
        }
      }
      tiefe = cr.radius * 3.8; hoehe = cr.hoehe * cr.lagen[1];
    } else if (art === 'heu') {
      // Strohballen (Würfel), unten durchgehend, oben versetzt mit ein paar Lücken
      const ch = c.heu;
      const n = Math.max(1, Math.round(laenge / ch.laenge));
      const unten = [];
      for (let k = 0; k < n; k++) {
        const p = punktBei(((k + 0.5) * laenge) / n);
        const [x, z] = hinten(p, ch.tiefe / 2 + (rnd() - 0.5) * 0.1);
        const w = (rnd() - 0.5) * 0.1;
        const ux = p.tx * Math.cos(w) - p.nx * Math.sin(w), uz = p.tz * Math.cos(w) - p.nz * Math.sin(w);
        const y = boden(x, z) - 0.03;
        unten.push(y);
        quader(x, y, z, ux, uz, (laenge / n) * (0.97 + rnd() * 0.04), ch.tiefe, ch.hoehe, 'strohSeite', 'strohOben', 'strohEnde', 0.9 + rnd() * 0.2);
      }
      for (let k = 0; k < n - 1; k++) {
        if (rnd() > ch.obenAnteil) continue;
        const p = punktBei(((k + 1) * laenge) / n);
        const [x, z] = hinten(p, ch.tiefe / 2 + 0.08 + (rnd() - 0.5) * 0.12);
        const w = (rnd() - 0.5) * 0.16;
        const ux = p.tx * Math.cos(w) - p.nx * Math.sin(w), uz = p.tz * Math.cos(w) - p.nz * Math.sin(w);
        quader(x, Math.max(unten[k], unten[k + 1]) + ch.hoehe - 0.05, z, ux, uz, (laenge / n) * (0.95 + rnd() * 0.04), ch.tiefe * 0.95, ch.hoehe,
          'strohSeite', 'strohOben', 'strohEnde', 0.9 + rnd() * 0.2);
      }
      tiefe = ch.tiefe; hoehe = ch.hoehe * 2;
    } else {
      // Holzböcke: zwei A-Beine, drei Bretter (die oberen zwei rot-weiss), leicht schief
      const cz = c.zaun;
      const n = Math.max(2, Math.round(laenge / cz.bockBreite));
      const breite = laenge / n;
      for (let k = 0; k < n; k++) {
        const p = punktBei(breite * (k + 0.5));
        const [x, z] = hinten(p, 0.4 + (rnd() - 0.5) * 0.15);
        const w = ((rnd() - 0.5) * 2 * cz.schief * Math.PI) / 180;
        const ux = p.tx * Math.cos(w) - p.nx * Math.sin(w), uz = p.tz * Math.cos(w) - p.nz * Math.sin(w);
        const vx = -uz, vz = ux;
        const halbB = (breite * 0.94) / 2;
        const enden = [-1, 1].map((sd) => {
          const ex = x + ux * sd * (halbB - 0.15), ez = z + uz * sd * (halbB - 0.15);
          return { x: ex, z: ez, y: boden(ex, ez) };
        });
        const hoch = cz.hoehe + (rnd() - 0.5) * 0.08;
        for (const e of enden) {
          const top = [e.x, e.y + hoch, e.z];
          for (const v of [-1, 1]) balken([e.x + vx * v * 0.38, e.y - 0.05, e.z + vz * v * 0.38], top, 0.07, 'pfosten', 0.85 + rnd() * 0.2);
        }
        for (const [h, kachel] of [[hoch - 0.08, 'brettRot'], [hoch * 0.68, 'brettRot'], [hoch * 0.36, 'brett']]) {
          const d = (rnd() - 0.5) * 0.08;
          const a = enden[0], b = enden[1];
          const ax = a.x - ux * 0.18, az = a.z - uz * 0.18, bx2 = b.x + ux * 0.18, bz2 = b.z + uz * 0.18;
          const ya = a.y + h + d, yb = b.y + h - d;
          // vor den Beinen (zur Etappe hin)
          const fx = p.nx * 0.42, fz = p.nz * 0.42;
          viereck([ax + fx, ya - 0.11, az + fz], [bx2 + fx, yb - 0.11, bz2 + fz], [bx2 + fx, yb + 0.11, bz2 + fz], [ax + fx, ya + 0.11, az + fz], kachel, 0.95 + rnd() * 0.15);
        }
      }
      tiefe = 0.8; hoehe = cz.hoehe;
    }

    // --- Kollision: Kreise entlang der Leitwand, knapp hinter der Vorderkante (hart, wie ein Zaun)
    const r = c.kreisRadius;
    const nK = Math.ceil(laenge / c.kreisAbstand);
    for (let k = 0; k <= nK; k++) {
      const p = punktBei((laenge * k) / nK);
      for (let d = r; d <= Math.max(r, tiefe - r) + 1e-6; d += Math.max(0.5, tiefe - 2 * r)) {
        const [x, z] = hinten(p, d);
        hindernisse.push({ x, z, r, rand: 'absperrung' });
      }
    }

    // --- Verbots-Symbol über der Geradeaus-Richtung: schaut zum Fahrer, der auf die Kreuzung zufährt
    const cs = c.symbol;
    const sAnfahrt = Math.min(sp.linie[0].s, sp.linie[sp.linie.length - 1].s) - 30;
    const pA = netz.etappePunkt(sAnfahrt);
    {
      const m = sp.mitte;
      const [x, z] = hinten(m, tiefe + 0.15);
      let bx = pA.x - x, bz = pA.z - z;
      const bl = Math.hypot(bx, bz) || 1; bx /= bl; bz /= bl;
      tafel(x, boden(x, z), z, bx, bz, cs.durchmesser, cs.durchmesser, hoehe + cs.ueber, 'verbot', false, 'verbotRuecken');
    }
    // --- Chevrons entlang der Leitwand (zeigen in Fahrtrichtung), schauen zur Etappe
    const cc = c.chevron;
    const nC = Math.max(2, Math.round(laenge / cc.abstand));
    for (let k = 0; k <= nC; k++) {
      const a = (laenge * k) / nC;
      const p = punktBei(a);
      if (Math.hypot(p.x - sp.mitte.x, p.z - sp.mitte.z) < cs.durchmesser * 0.9) continue; // Platz für das Symbol
      const [x, z] = hinten(p, Math.min(tiefe, 0.5) + 0.08);
      // halb zur Etappe, halb zum Fahrer, der auf die Kreuzung zufährt (so liest man sie schon von weitem)
      let bx = p.nx, bz = p.nz;
      const ax = pA.x - x, az = pA.z - z, al = Math.hypot(ax, az) || 1;
      bx += (ax / al) * cc.zumFahrer; bz += (az / al) * cc.zumFahrer;
      const bl = Math.hypot(bx, bz) || 1; bx /= bl; bz /= bl;
      // Fahrtrichtung der Etappe hier (Pfeil zeigt dorthin)
      const q = netz.etappePunkt(p.s);
      const rx = bz, rz = -bx;   // rechts aus Sicht des Fahrers, der auf die Tafel schaut
      tafel(x, boden(x, z), z, bx, bz, cc.breite, cc.hoehe, hoehe + 0.05, 'chevron', rx * q.tx + rz * q.tz < 0, 'blech');
    }

    // --- Richtungstafel ca. 70 m vor der Kreuzung (Kurven-Aussenseite), Pfeil in Abbiegerichtung
    const ct = c.richtungstafel;
    if (ct.an) {
      const sKurve = Math.min(sp.linie[0].s, sp.linie[sp.linie.length - 1].s);
      const frei = (x, z) => andere.every((h) => Math.hypot(h.x - x, h.z - z) > h.r + 1.0);
      // Seite: Kurven-Aussenseite der Kreuzung – ausser dort ist die Innenseite einer freien Kurve
      // ("schneiden"): dann auf die andere Seite, sonst stünde die Tafel den Schneidern im Weg
      const sT = sKurve - ct.vorher;
      const schneidet = ABKUERZUNGEN.schneiden.some((k) => sT > k.sVon - 10 && sT < k.sBis + 10 && (k.seite === 'rechts' ? 1 : -1) === sp.sigma);
      const seite = schneidet ? -sp.sigma : sp.sigma;
      let platz = null;
      for (const ds of [0, 2, -2, 4, -4, 6, -6, 8, -8, 10, -10, 12, -12]) {
        const s = sT + ds;
        const p = netz.etappePunkt(s);
        const L = netz.halbBei(s) + CONFIG.strasse.bankett + ct.abstand + ct.breite / 2;
        const x = p.x - p.tz * seite * L, z = p.z + p.tx * seite * L;
        const ok = [-0.5, 0, 0.5].every((f) => frei(x - p.tz * seite * f * ct.breite, z + p.tx * seite * f * ct.breite));
        if (ok) { platz = { x, z, p, s }; break; }
      }
      if (platz) {
        const { x, z } = platz;
        // schaut zum Fahrer, der 40 m davor kommt
        const q = netz.etappePunkt(platz.s - 40);
        let bx = q.x - x, bz = q.z - z;
        const bl = Math.hypot(bx, bz) || 1; bx /= bl; bz /= bl;
        const y = boden(x, z);
        const rx = bz, rz = -bx;
        // zwei Pfosten
        for (const f of [-0.38, 0.38]) {
          const px = x + rx * f * ct.breite - bx * 0.06, pz = z + rz * f * ct.breite - bz * 0.06;
          pfostenStahl(px, boden(px, pz), pz, ct.unten + ct.hoehe * 0.9, 0.1);
          hindernisse.push({ x: px, z: pz, r: 0.15, rand: 'schild' });
        }
        // Abbiegerichtung: wohin dreht die Etappe an der Kreuzung? (rechts aus Sicht des Fahrers)
        const k0 = netz.etappePunkt(sKurve), k1 = netz.etappePunkt(sKurve + 25);
        const dreh = k0.tx * k1.tz - k0.tz * k1.tx; // > 0: nach rechts (x nach Osten, z nach Süden)
        tafel(x, y, z, bx, bz, ct.breite, ct.hoehe, ct.unten, 'richtung', dreh < 0, 'blech', false);
        liste.push({ ast: ast.nr, art: 'richtungstafel', x, z, s: platz.s, links: dreh < 0, seite });
      }
    }

    // Für Werkzeuge: Mitte (wo die Geradeaus-Richtung die Leitwand kreuzt) und Blickrichtung dorthin
    const i = Math.max(0, Math.min(ast.anzahl - 1, Math.round(sp.mitte.u)));
    const e0 = sp.linie[0], e1 = sp.linie[sp.linie.length - 1];
    liste.push({ ast: ast.nr, art, u: sp.mitte.u, x: sp.mitte.x, z: sp.mitte.z, links: [e0.x, e0.z], rechts: [e1.x, e1.z],
      richtung: [ast.tx[i], ast.tz[i]], breite: laenge, hoehe });
  }

  let mesh = null;
  if (idx.length) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      map: atlas.textur, vertexColors: true, flatShading: true, side: THREE.DoubleSide, alphaTest: 0.5,
    }));
    mesh.name = 'absperrungen';
    szene.add(mesh);
  }
  const sperren = liste.filter((e) => e.art !== 'richtungstafel');
  return {
    liste: sperren, tafeln: liste.filter((e) => e.art === 'richtungstafel'), hindernisse, mesh,
    statistik: { anzahl: sperren.length, dreiecke: idx.length / 3, kreise: hindernisse.length, ms: Math.round(performance.now() - t0) },
  };
}
