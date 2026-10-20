// Fahrphysik des Autos (Arcade mit etwas Gewicht).
// Einfaches "Fahrrad-Modell": eine Vorder- und eine Hinterachse,
// jede Achse hat begrenzten Grip. Dadurch kann das Auto rutschen,
// schieben (untersteuern) und mit der Handbremse driften.
// Diese Datei kennt kein Three.js – reine Rechnerei.
// Seit M8a (Fahrprofile, js/fahrprofil.js): Achslasten mit statischer Verteilung (lastVorneAnteil) und
// Gewichtsverlagerung längs (gewichtstransfer), Heck-Grip je Belag (heckJeBelag), seit M8b Front-Grip je Belag
// (vorneJeBelag). Im Profil "prototyp" sind diese Werte neutral (0.5, 0, 1, 1): dann rechnet alles genau wie vorher.

import { CONFIG } from './config.js';

const G = 9.81;
const GRAD = Math.PI / 180;
const LUFT_BEZUG = 190 / 3.6; // auto.luftwiderstand gilt bei 190 km/h

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
    this.hbZeit = 0;          // so lange (s) ist die Handbremse schon gezogen (M3a.2)
    this.rueckDeckel = 0;     // zuletzt geltendes Rückwärts-Höchsttempo (m/s, M5a.1: für den weichen Belagwechsel)
    this.transfer = 0;        // M8a: Gewichtsverlagerung längs, geglättet (m/s² Achslast; + = mehr hinten)
    this.lastVorne = G / 2;   // M8a: aktuelle Achslast vorne und hinten (m/s², nur zum Anzeigen)
    this.lastHinten = G / 2;
  }

  get tempo() {
    return Math.hypot(this.vx, this.vz);
  }

  // Ein Physik-Schritt.
  // eingabe: { gas 0..1, bremse 0..1, lenkung -1..1 (+ = rechts), handbremse true/false }
  // boden:   { grip, rollen, rollenTempo, steigung (+ = bergauf, als Sinus), rueckwaerts (Faktor Rückwärtsgang),
  //           heck (Faktor Grip hinten), stabilitaet (Faktor Stabilitätshilfe) – beide seit M3a, fehlen = 1,
  //           geradeaus (Faktor Geradeauslauf, seit M3a.2, fehlt = 1),
  //           rueckwaertsMax (Faktor Rückwärts-Höchsttempo, seit M5a.1, fehlt = 1),
  //           belag (Name des Untergrunds, seit M8a für auto.heckJeBelag; fehlt = kein Faktor) }
  // motor:   vom Getriebe (getriebe.js): { beschl: Antrieb vorwärts (m/s²), motorbremse (m/s²) }
  schritt(dt, eingabe, boden, motor) {
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
    const last = G / 2;               // Last pro Achse im Prototyp (als Beschleunigung)
    // M8a: Achslasten. Statisch: lastVorneAnteil (0.5 = je G/2 wie im Prototyp). Dazu die Gewichtsverlagerung längs:
    // beim Bremsen mehr Last vorne und weniger hinten, beim Gasgeben umgekehrt (gewichtstransfer, 0 = aus), aus der
    // Längsbeschleunigung des letzten Schritts, leicht geglättet, je Achse begrenzt auf 0.6 bis 1.4 des Normalwerts.
    // Die Haftungsgrenze jeder Achse wächst mit ihrer Last; die Seitensteifigkeit der Reifen ändert sich nur mit der
    // Verlagerung (statisch bleibt sie gleich verteilt).
    const pV = c.lastVorneAnteil ?? 0.5, kT = c.gewichtstransfer ?? 0;
    if (kT !== 0) {
      const ziel = (kT * this.beschlVor) / 2;
      this.transfer += (ziel - this.transfer) * (1 - Math.exp(-dt / Math.max(1e-3, c.gewichtstransferGlaettung ?? 0.1)));
    } else this.transfer = 0;
    const lastV0 = G * pV, lastH0 = G * (1 - pV);
    const lastV = begrenze(lastV0 - this.transfer, lastV0 * 0.6, lastV0 * 1.4);
    const lastH = begrenze(lastH0 + this.transfer, lastH0 * 0.6, lastH0 * 1.4);
    this.lastVorne = lastV; this.lastHinten = lastH;

    // --- Grip ---
    let gripV = c.gripVorne * boden.grip;
    // M8b: Grip vorne je Belag (Allrad zieht die Front auf losem Boden in die Kurve; Prototyp: 1 = ohne Wirkung)
    if (boden.belag && c.vorneJeBelag) gripV *= c.vorneJeBelag[boden.belag] ?? 1;
    // heck (seit M3a): auf Schotter hält das Heck etwas weniger als die Front -> driftet früher
    // (M8a: mal heckJeBelag des Profils, z. B. Allrad hält das Heck auf Schotter besser; Prototyp: 1)
    let gripH = c.gripHinten * boden.grip * (boden.heck ?? 1);
    if (boden.belag && c.heckJeBelag) gripH *= c.heckJeBelag[boden.belag] ?? 1;
    const schraeg = Math.atan2(vSeit, Math.max(Math.abs(vVor), 0.5));
    if (Math.abs(schraeg) > 0.12) gripH *= 1 - c.gasImDrift * eingabe.gas;

    // --- Seitenkräfte der Reifen (Schräglauf) ---
    const vBasis = Math.max(Math.abs(vVor), 0.5);
    const schraeglaufV = Math.atan2(vSeit + this.drehrate * a, vBasis) - delta;
    const schraeglaufH = Math.atan2(vSeit - this.drehrate * b, vBasis);
    const steifV = c.reifenSteifigkeit * last * (lastV / lastV0), steifH = c.reifenSteifigkeit * last * (lastH / lastH0);
    const kraftV = begrenze(-steifV * schraeglaufV, -gripV * lastV, gripV * lastV);
    let kraftH = begrenze(-steifH * schraeglaufH, -gripH * lastH, gripH * lastH);
    // Handbremse lange gehalten (M3a.2): je länger gezogen, desto stärker bremsen die blockierten
    // Hinterräder und desto weniger Antrieb kommt an (0 = gerade gezogen, 1 = voll nach handbremseAufbau)
    this.hbZeit = eingabe.handbremse ? this.hbZeit + dt : 0;
    const hbLang = eingabe.handbremse ? glatt(0, c.handbremseAufbau, this.hbZeit) : 0;

    if (eingabe.handbremse && vVor > 0.5) {
      // Handbremse: Hinterräder blockieren und rutschen. Sie halten seitlich
      // kaum noch, solange das Heck nicht schon quer steht -> das Heck kommt.
      kraftH = -Math.sin(schraeglaufH) * c.handbremseGrip * boden.grip * lastH;
    }

    // Stabilität: ohne Handbremse zieht der Grip das Auto langsam gerade
    const stabZiel = eingabe.handbremse ? 0 : 1;
    this.stabAnteil += (stabZiel - this.stabAnteil) * Math.min(1, dt * c.stabilitaetRueckkehr);

    // --- Längs: Antrieb ---
    let antrieb = 0;
    // Rückwärts-Höchsttempo hier (M5a.1: je Untergrund, auf Asphalt höher)
    const rueckMax = c.rueckwaertsTempo * (boden.rueckwaertsMax ?? 1);
    // (mit lange gehaltener Handbremse kommt nur noch handbremseAntrieb an: die Hinterräder stehen)
    if (eingabe.gas > 0 && vVor > -0.5) antrieb += motor.beschl * (1 - (1 - c.handbremseAntrieb) * hbLang);
    if (eingabe.bremse > 0 && vVor <= 0.5 && eingabe.gas < 0.1) {
      // rückwärts fahren
      // (boden.rueckwaerts: Faktor je Untergrund, auf Gras und Bankett stärker als auf Asphalt)
      if (vVor > -rueckMax) antrieb -= eingabe.bremse * c.rueckwaertsBeschl * (boden.rueckwaerts ?? 1);
    }
    // Steigung (im Stand ohne Gas hält das Auto an)
    const stehtFast = Math.abs(vVor) < 0.6 && eingabe.gas < 0.05 && eingabe.bremse < 0.05;
    if (!stehtFast) antrieb -= G * boden.steigung * c.steigungsFaktor;

    // --- Längs: Widerstände (bremsen nur bis Stillstand) ---
    let widerstand = 0;
    // Luftwiderstand: sorgt für das weiche Auslaufen beim Höchsttempo
    widerstand += c.luftwiderstand * (vVor / LUFT_BEZUG) ** 2;
    widerstand += motor.motorbremse;
    widerstand += boden.rollen + boden.rollenTempo * Math.abs(vVor);
    if (eingabe.bremse > 0 && vVor > 0.5) widerstand += eingabe.bremse * c.bremse * Math.min(1, boden.grip + 0.2);
    if (eingabe.gas > 0 && vVor < -0.5) widerstand += eingabe.gas * c.bremse * 0.6;
    // Handbremse: die blockierten Hinterräder rutschen und bremsen das Auto entlang seiner Fahrtrichtung,
    // egal ob es gerade oder quer rutscht (vorher nur längs: quer im Kreis rutschte es fast ungebremst).
    // Wert wächst mit der Haltezeit von handbremseBremse auf handbremseBremseLang (mal Grip: Schotter länger).
    let hbBrems = 0, hbV = 0;
    if (eingabe.handbremse) {
      hbV = Math.hypot(vVor, vSeit);
      if (hbV > 0.3) {
        hbBrems = (c.handbremseBremse + (c.handbremseBremseLang - c.handbremseBremse) * hbLang) * Math.min(1, boden.grip + 0.2);
        widerstand += hbBrems * Math.abs(vVor) / hbV;
      }
    }

    // --- Beschleunigungen im Auto-Koordinatensystem ---
    const quer = kraftV * Math.cos(delta) + kraftH;
    // Längsanteil der Vorderrad-Seitenkraft: mit dem Einschlag ohne den Extra-Einschlag
    // im Schritttempo gerechnet, damit Rückwärtsfahren und Anfahren wie bisher bleiben
    // (der Extra-Einschlag wirkt nur aufs Drehen).
    // Ohne Pedal und fast im Stand gibt es keinen Längsanteil (sonst kroch das Auto beim
    // blossen Lenken im Stand von selbst rückwärts).
    const deltaLaengs = begrenze(delta, -maxLenkAlt, maxLenkAlt);
    const ohnePedal = eingabe.gas < 0.05 && eingabe.bremse < 0.05;
    const laengsQuer = -kraftV * Math.sin(deltaLaengs) * (ohnePedal ? glatt(0.5, 2.0, Math.abs(vVor)) : 1);
    const drehBeschl = (a * kraftV * Math.cos(delta) - b * kraftH) / c.traegheit
      + c.stabilitaet * (boden.stabilitaet ?? 1) * this.stabAnteil * schraeg * Math.min(1, Math.abs(vVor) / 10);

    // Längs zuerst Antrieb + Querkraft-Anteil, dann Widerstand (ohne Vorzeichenwechsel)
    let vVorNeu = vVor + (antrieb + laengsQuer) * dt;
    const wDt = widerstand * dt;
    if (Math.abs(vVorNeu) <= wDt) vVorNeu = 0;
    else vVorNeu -= Math.sign(vVorNeu) * wDt;

    let vSeitNeu = vSeit + quer * dt;
    let drehrate = this.drehrate + drehBeschl * dt;

    // --- Geradeauslauf (M3a.2): Lenkrad gerade und das Auto rutscht nicht -> schnell wieder geradeaus ---
    // Vorher drehte das Auto nach dem Loslassen noch lange nach und schob seitlich (bei 120 km/h ca. 1.5 s).
    // Wirkt nur, wenn das Auto stärker dreht, als die Räder vorgeben (beim Einlenken also nie),
    // und nicht bei Handbremse oder im Drift (grosser Schwimmwinkel); auf Schotter schwächer (boden.geradeaus).
    const gl = c.geradeauslauf;
    if (gl.gier > 0 && vVorNeu > 0 && !eingabe.handbremse) {
      const w = (1 - glatt(0, gl.lenkBis, Math.abs(eingabe.lenkung))) * this.stabAnteil * (boden.geradeaus ?? 1)
        * (1 - glatt(gl.rutschAb, gl.rutschBis, Math.abs(schraeg) / GRAD)) * Math.min(1, vVorNeu / 10);
      if (w > 0) {
        // Drehen auf das abbremsen, was der Lenkeinschlag vorgibt
        const drehRad = (vVorNeu * Math.tan(delta)) / L;
        if ((drehrate - drehRad) * drehrate > 0) drehrate = drehRad + (drehrate - drehRad) * Math.exp(-gl.gier * w * dt);
        // Fahrtrichtung zur Blickrichtung drehen (Tempo bleibt gleich)
        const v = Math.hypot(vVorNeu, vSeitNeu);
        const beta = Math.atan2(vSeitNeu, vVorNeu) * Math.exp(-gl.schwimm * w * dt);
        vVorNeu = v * Math.cos(beta);
        vSeitNeu = v * Math.sin(beta);
      }
    }

    // --- Sehr langsam: einfache Lenkgeometrie statt Reifenmodell (ruhig, kein Zittern) ---
    const k = vVorNeu > 0 ? glatt(1.0, 5.0, vVorNeu) : 0;
    const drehKinematisch = (vVorNeu * Math.tan(delta)) / L;
    let drehNormal = drehKinematisch + (drehrate - drehKinematisch) * k;
    let vSeitNormal = vSeitNeu * k;
    // Rückwärts: auf Rückwärtstempo begrenzen.
    // M5a.1: Kommt das Auto schneller vom Asphalt (9 m/s) aufs Bankett oder Gras (6 m/s), springt das Tempo
    // nicht auf den neuen Deckel, sondern läuft mit der Reibung des Untergrunds aus (Deckel sinkt mit, steigt
    // aber nie über den vorherigen). Sonst (gleicher Untergrund) wie bisher.
    const deckel = Math.max(rueckMax, Math.min(this.rueckDeckel, -vVorNeu));
    this.rueckDeckel = deckel;
    const vVorNormal = Math.max(vVorNeu, -deckel);
    // Dreher (M3a.2): rutscht das Auto schnell quer (z. B. mit Handbremse quergestellt), gilt oben
    // nicht. Vorher hielt es dann schlagartig an (von 60 auf 10 km/h in 0.1 s). Jetzt rutscht es
    // mit der Reibung der Reifen aus und hört höchstens mit dreher.drehBremse auf zu drehen.
    const dreher = glatt(c.dreher.abSeit * 0.5, c.dreher.abSeit, Math.abs(vSeitNeu));
    if (dreher > 0) {
      const dw = c.dreher.drehBremse * dt;
      drehNormal += (begrenze(drehNormal, drehrate - dw, drehrate + dw) - drehNormal) * dreher;
      vSeitNormal += (vSeitNeu - vSeitNormal) * dreher;
      vVorNeu = vVorNormal + (vVorNeu - vVorNormal) * dreher;
    } else {
      vVorNeu = vVorNormal;
    }
    drehrate = drehNormal;
    vSeitNeu = vSeitNormal;

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
