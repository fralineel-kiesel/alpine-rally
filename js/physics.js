// Fahrphysik des Autos (Arcade mit etwas Gewicht).
// Einfaches "Fahrrad-Modell": eine Vorder- und eine Hinterachse,
// jede Achse hat begrenzten Grip. Dadurch kann das Auto rutschen,
// schieben (untersteuern) und mit der Handbremse driften.
// Diese Datei kennt kein Three.js – reine Rechnerei.

import { CONFIG } from './config.js';

const G = 9.81;
const GRAD = Math.PI / 180;

const begrenze = (w, min, max) => (w < min ? min : w > max ? max : w);
const glatt = (a, b, x) => {
  const t = begrenze((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export class Fahrphysik {
  constructor() {
    this.reset(0, 0, 0);
  }

  // Auto an eine Stelle setzen, Stillstand.
  reset(x, z, richtung) {
    this.x = x;
    this.z = z;
    this.richtung = richtung; // Blickrichtung (Gierwinkel), 0 = +z
    this.vx = 0;
    this.vz = 0;
    this.drehrate = 0;        // wie schnell sich das Auto dreht (rad/s)
    this.lenkwinkel = 0;      // aktueller Radeinschlag (rad, + = links)
    this.vVor = 0;            // Tempo in Blickrichtung
    this.vSeit = 0;           // Tempo seitwärts (+ = links)
    this.beschlVor = 0;       // für Karosserie-Nicken
    this.beschlSeit = 0;      // für Karosserie-Rollen
    this.driftWinkel = 0;     // Winkel zwischen Blick- und Fahrtrichtung (Grad)
    this.stabAnteil = 1;      // Stabilitätshilfe (0 während Handbremse)
  }

  get tempo() {
    return Math.hypot(this.vx, this.vz);
  }

  // Ein Physik-Schritt.
  // eingabe: { gas 0..1, bremse 0..1, lenkung -1..1 (+ = rechts), handbremse true/false }
  // boden:   { grip, rollen, rollenTempo, steigung (+ = bergauf, als Sinus) }
  schritt(dt, eingabe, boden) {
    const c = CONFIG.auto;

    // Blickrichtung und "links" als Vektoren
    const fx = Math.sin(this.richtung), fz = Math.cos(this.richtung);
    const lx = Math.cos(this.richtung), lz = -Math.sin(this.richtung);

    let vVor = this.vx * fx + this.vz * fz;
    let vSeit = this.vx * lx + this.vz * lz;

    // --- Lenkung: langsam direkt, schnell ruhiger ---
    const tAnteil = Math.sqrt(begrenze(Math.abs(vVor) / c.lenkReferenzTempo, 0, 1));
    const maxLenkAlt = (c.lenkwinkelLangsam + (c.lenkwinkelSchnell - c.lenkwinkelLangsam) * tAnteil) * GRAD;
    let maxLenk = maxLenkAlt;
    // Im Schritttempo (vorwärts und rückwärts) zusätzlicher Einschlag: voll bis zu einem
    // Viertel von lenkStandBisTempo, dann weich auslaufend, darüber wie bisher.
    if (c.lenkwinkelStand > 0) {
      const stand = 1 - glatt(c.lenkStandBisTempo * 0.25, c.lenkStandBisTempo, Math.abs(vVor));
      maxLenk += (c.lenkwinkelStand * GRAD - maxLenk) * stand;
    }
    const delta = -eingabe.lenkung * maxLenk; // + = links
    this.lenkwinkel = delta;

    // --- Achsgeometrie ---
    const L = c.radstand;
    const a = L * c.schwerpunktVorne; // Schwerpunkt -> Vorderachse
    const b = L - a;                  // Schwerpunkt -> Hinterachse
    const last = G / 2;               // Last pro Achse (als Beschleunigung)

    // --- Grip ---
    let gripV = c.gripVorne * boden.grip;
    let gripH = c.gripHinten * boden.grip;
    const schraeg = Math.atan2(vSeit, Math.max(Math.abs(vVor), 0.5));
    if (Math.abs(schraeg) > 0.12) gripH *= 1 - c.gasImDrift * eingabe.gas;

    // --- Seitenkräfte der Reifen (Schräglauf) ---
    const vBasis = Math.max(Math.abs(vVor), 0.5);
    const schraeglaufV = Math.atan2(vSeit + this.drehrate * a, vBasis) - delta;
    const schraeglaufH = Math.atan2(vSeit - this.drehrate * b, vBasis);
    const steif = c.reifenSteifigkeit * last;
    const kraftV = begrenze(-steif * schraeglaufV, -gripV * last, gripV * last);
    let kraftH = begrenze(-steif * schraeglaufH, -gripH * last, gripH * last);
    if (eingabe.handbremse && vVor > 0.5) {
      // Handbremse: Hinterräder blockieren und rutschen. Sie halten seitlich
      // kaum noch, solange das Heck nicht schon quer steht -> das Heck kommt.
      kraftH = -Math.sin(schraeglaufH) * c.handbremseGrip * boden.grip * last;
    }

    // Stabilität: ohne Handbremse zieht der Grip das Auto langsam gerade
    const stabZiel = eingabe.handbremse ? 0 : 1;
    this.stabAnteil += (stabZiel - this.stabAnteil) * Math.min(1, dt * c.stabilitaetRueckkehr);

    // --- Längs: Antrieb ---
    let antrieb = 0;
    if (eingabe.gas > 0 && vVor > -0.5) antrieb += eingabe.gas * c.beschleunigung;
    if (eingabe.bremse > 0 && vVor <= 0.5 && eingabe.gas < 0.1) {
      // rückwärts fahren
      if (vVor > -c.rueckwaertsTempo) antrieb -= eingabe.bremse * c.rueckwaertsBeschl;
    }
    // Steigung (im Stand ohne Gas hält das Auto an)
    const stehtFast = Math.abs(vVor) < 0.6 && eingabe.gas < 0.05 && eingabe.bremse < 0.05;
    if (!stehtFast) antrieb -= G * boden.steigung * c.steigungsFaktor;

    // --- Längs: Widerstände (bremsen nur bis Stillstand) ---
    let widerstand = 0;
    // Luftwiderstand: sorgt für das weiche Auslaufen beim Höchsttempo
    widerstand += c.beschleunigung * (vVor / c.hoechsttempo) ** 2;
    if (eingabe.gas < 0.05) widerstand += c.motorbremse;
    widerstand += boden.rollen + boden.rollenTempo * Math.abs(vVor);
    if (eingabe.bremse > 0 && vVor > 0.5) widerstand += eingabe.bremse * c.bremse * Math.min(1, boden.grip + 0.2);
    if (eingabe.gas > 0 && vVor < -0.5) widerstand += eingabe.gas * c.bremse * 0.6;
    if (eingabe.handbremse && Math.abs(vVor) > 0.3) widerstand += c.handbremseBremse * Math.abs(Math.cos(schraeglaufH));

    // --- Beschleunigungen im Auto-Koordinatensystem ---
    const quer = kraftV * Math.cos(delta) + kraftH;
    // Längsanteil der Vorderrad-Seitenkraft: mit dem Einschlag ohne den Extra-Einschlag
    // im Schritttempo gerechnet, damit Rückwärtsfahren und Anfahren wie bisher bleiben
    // (der Extra-Einschlag wirkt nur aufs Drehen).
    const deltaLaengs = begrenze(delta, -maxLenkAlt, maxLenkAlt);
    const laengsQuer = -kraftV * Math.sin(deltaLaengs);
    const drehBeschl = (a * kraftV * Math.cos(delta) - b * kraftH) / c.traegheit
      + c.stabilitaet * this.stabAnteil * schraeg * Math.min(1, Math.abs(vVor) / 10);

    // Längs zuerst Antrieb + Querkraft-Anteil, dann Widerstand (ohne Vorzeichenwechsel)
    let vVorNeu = vVor + (antrieb + laengsQuer) * dt;
    const wDt = widerstand * dt;
    if (Math.abs(vVorNeu) <= wDt) vVorNeu = 0;
    else vVorNeu -= Math.sign(vVorNeu) * wDt;

    let vSeitNeu = vSeit + quer * dt;
    let drehrate = this.drehrate + drehBeschl * dt;

    // --- Sehr langsam: einfache Lenkgeometrie statt Reifenmodell (ruhig, kein Zittern) ---
    const k = vVorNeu > 0 ? glatt(1.0, 5.0, vVorNeu) : 0;
    const drehKinematisch = (vVorNeu * Math.tan(delta)) / L;
    drehrate = drehKinematisch + (drehrate - drehKinematisch) * k;
    vSeitNeu *= k;

    // Rückwärts: auf Rückwärtstempo begrenzen
    if (vVorNeu < -c.rueckwaertsTempo) vVorNeu = -c.rueckwaertsTempo;

    this.beschlVor = (vVorNeu - vVor) / dt;
    this.beschlSeit = quer * k;

    // zurück in Weltkoordinaten
    this.vx = fx * vVorNeu + lx * vSeitNeu;
    this.vz = fz * vVorNeu + lz * vSeitNeu;
    this.drehrate = drehrate;
    this.richtung += drehrate * dt;
    this.x += this.vx * dt;
    this.z += this.vz * dt;

    this.vVor = vVorNeu;
    this.vSeit = vSeitNeu;
    this.driftWinkel = this.tempo > 2 ? Math.atan2(vSeitNeu, Math.abs(vVorNeu)) / GRAD : 0;
  }

  // Unsichtbare Wand: nx/nz zeigt von der Strasse weg (Richtung Wand),
  // ueber = wie weit das Auto drüber ist.
  anGrenze(nx, nz, ueber) {
    const g = CONFIG.grenze;
    this.x -= nx * ueber;
    this.z -= nz * ueber;
    const vn = this.vx * nx + this.vz * nz;
    if (vn > 0) {
      this.vx -= nx * vn * (1 + g.abprallen);
      this.vz -= nz * vn * (1 + g.abprallen);
      // Reibung an der Wand bremst etwas
      const reib = Math.max(0, 1 - 0.04 * vn);
      this.vx *= reib;
      this.vz *= reib;
      this.drehrate *= 0.6;
    }
    // Schaut das Auto in die Wand, dreht die Wand es langsam entlang
    // (sonst bleibt es frontal an der Wand kleben).
    const fx = Math.sin(this.richtung), fz = Math.cos(this.richtung);
    if (fx * nx + fz * nz > 0.05) {
      let tx = -nz, tz = nx;
      if (tx * fx + tz * fz < 0) { tx = -tx; tz = -tz; }
      let diff = Math.atan2(tx, tz) - this.richtung;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.richtung += Math.sign(diff) * Math.min(Math.abs(diff), 0.012);
    }
  }
}
