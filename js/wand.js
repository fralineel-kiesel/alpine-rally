// M10c.1: Wand-Strafe. Seitlicher Kontakt mit Leitplanke, Zaun, Brückengeländer, Absperr-Wand (Kreisreihen in
// js/kollision.js) und Felswand (js/main.js) kostet echtes Tempo, statt dass das Auto mit vollem Tempo an der Wand
// entlang in die neue Richtung gleitet (Linos „Cheat“ in M10c). Bäume, Steine und Stämme bleiben wie bisher.
//   Einschlag: Tempo nach dem Winkel zwischen Fahrtrichtung und Wand (Streifen 25 %, steil 60 %, frontal höchstens 75 %),
//              das Auto prallt leicht ab (der Rest des Tempos zeigt entlang der Wand und etwas von ihr weg).
//   Dauerkontakt: solange es an der Wand schleift, zusätzlich ein fester Anteil pro Sekunde.
//   Keine Ausrichtung: die Wand dreht das Auto nicht in ihre Richtung (nur aus der Wand geschoben).
// M10c.2: Motor-Strafe („Motor sammelt sich“): ein spürbarer Treffer (ab WAND_STRAFE_MIN km/h Tempoverlust im Kontakt)
// drosselt den Motor für 2 bis 4 s (25 % → 100 %, glatt), Schalten dauert länger, Drehzahl sackt kurz ein, MOTOR-Leuchte.
// Werte: config.js, Blöcke kollision.wand und kollision.wandStrafe. Diese Datei kennt kein Three.js.

import { CONFIG } from './config.js';

const GRAD = Math.PI / 180;

// Strafe (Anteil des Tempos) bei einem Einschlagwinkel in Grad (0 = parallel zur Wand, 90 = frontal)
export function wandStrafe(winkel) {
  const W = CONFIG.kollision.wand;
  const [w0, p0] = W.streifen, [w1, p1] = W.steil, [w2, p2] = W.frontal;
  if (winkel <= w0) return p0;
  if (winkel <= w1) return p0 + ((p1 - p0) * (winkel - w0)) / (w1 - w0);
  if (winkel <= w2) return p1 + ((p2 - p1) * (winkel - w1)) / (w2 - w1);
  return p2;
}

// M10c.2: Dauer der Motor-Strafe (s) für einen Treffer mit so viel Tempoverlust (km/h); 0 = keine Strafe.
// frontal = ein Einschlag ab wandStrafe.frontalAb Grad: immer die volle Dauer
export function strafeDauer(verlustKmh, frontal = false) {
  const T = CONFIG.kollision.wandStrafe;
  if (verlustKmh < T.WAND_STRAFE_MIN) return 0;
  if (frontal) return T.dauerMax;
  const d = T.dauerMin + ((verlustKmh - T.WAND_STRAFE_MIN) / (T.hartAb - T.WAND_STRAFE_MIN)) * (T.dauerMax - T.dauerMin);
  return Math.max(T.dauerMin, Math.min(T.dauerMax, d));
}

export function baueWand() {
  const w = {
    uhr: 0,              // eigene Uhr (Sekunden, läuft mit jedem Physik-Schritt)
    letzteStrafe: -99,   // Zeitpunkt der letzten Einschlag-Strafe
    kontakt: false,      // in diesem Schritt an einer Wand
    strafe: false,       // in diesem Schritt eine Einschlag-Strafe
    verlust: 0,          // in diesem Schritt durch Einschläge verlorenes Tempo (m/s, für Ton, Staub, Haptik)
    einschlaege: 0,      // Zähler (Werkzeuge, Tests): Einschlag-Strafen seit dem Laden
    kontaktSchritte: 0,  // Zähler: Schritte mit Wandkontakt
    letzter: null,       // letzter Einschlag { winkel, vorher, nachher, strafe } (Werkzeuge, Tests)
    // M10c.2: Motor-Strafe
    schrittVerlust: 0,   // in diesem Schritt durch die Wand verlorenes Tempo (m/s, Einschlag, Reibung und Schleifen)
    epVerlust: 0,        // Treffer = zusammenhängender Kontakt: so viel Tempo (km/h) hat er bisher gekostet
    epLetzt: -99,        // letzter Schritt mit Kontakt (Uhr)
    epDauer: 0,          // Strafe (s), die dieser Treffer schon ausgelöst hat
    epFrontal: false,    // in diesem Treffer ein frontaler Einschlag
    strafeRest: 0,       // so lange (s) läuft die Motor-Strafe noch (0 = keine)
    strafeGesamt: 0,     // so lang war sie ab dem letzten Auslösen (für die Leistungskurve)
    strafeSeit: 99,      // so lange (s) ist das letzte Auslösen her (Drehzahl-Einbruch)
    strafen: 0,          // Zähler: Treffer mit Strafe seit dem Laden (Ton: Aussetzer bei jedem neuen; Werkzeuge, Tests)
    strafeLetzte: null,  // letzter Treffer mit Strafe { verlust (km/h), dauer, frontal } (Werkzeuge, Tests)

    // Anteil der Motorleistung (0.25 direkt nach dem Treffer, glatt zurück auf 1 am Ende der Strafe)
    leistung() {
      if (w.strafeRest <= 0) return 1;
      const T = CONFIG.kollision.wandStrafe, p = 1 - w.strafeRest / w.strafeGesamt;
      return T.leistungStart + (1 - T.leistungStart) * p * p * (3 - 2 * p);
    },
    // Anteil der angezeigten Drehzahl (Tacho, Ton): sackt beim Treffer kurz auf drehzahlTief und kommt glatt zurück
    drehzahlFaktor() {
      const T = CONFIG.kollision.wandStrafe;
      if (w.strafeRest <= 0 || w.strafeSeit >= T.drehzahlZeit + T.drehzahlZurueck) return 1;
      if (w.strafeSeit < T.drehzahlZeit) return T.drehzahlTief;
      const p = (w.strafeSeit - T.drehzahlZeit) / T.drehzahlZurueck;
      return T.drehzahlTief + (1 - T.drehzahlTief) * p * p * (3 - 2 * p);
    },
    // Strafe sofort beenden (Taste R, Wasser, Neustart, Menü, Countdown)
    strafeAus() { w.strafeRest = 0; w.strafeGesamt = 0; w.strafeSeit = 99; w.epVerlust = 0; w.epDauer = 0; w.epFrontal = false; w.epLetzt = -99; },

    // Am Anfang jedes Physik-Schritts
    anfang(dt) {
      w.uhr += dt; w.kontakt = false; w.strafe = false; w.verlust = 0; w.schrittVerlust = 0;
      if (w.strafeRest > 0) { w.strafeRest = Math.max(0, w.strafeRest - dt); w.strafeSeit += dt; } // M10c.2 (Pause: keine Schritte = eingefroren)
    },

    // Kontakt mit einer Wand: nx/nz zeigt von der Wand zum Auto (Einheitsvektor). Das Auto ist schon aus der Wand
    // geschoben. Ergebnis: Tempo Richtung Wand (m/s, wie die Wucht bei Bäumen; 0 = fährt nicht hinein)
    stoss(physik, nx, nz) {
      const W = CONFIG.kollision.wand;
      w.kontakt = true;
      const vn = physik.vx * nx + physik.vz * nz;
      if (vn >= 0) return 0;
      const v = Math.hypot(physik.vx, physik.vz);
      const stossTempo = -vn;
      // Abprall: Anteil Richtung Wand wird umgedreht und klein. Anteil entlang der Wand: Reibung, die mit dem Druck auf die
      // Wand wächst (wer an einer gebogenen Wand entlang rutscht, wird gebremst, je stärker die Wand ihn umlenkt)
      const tx = -nz, tz = nx, vt = physik.vx * tx + physik.vz * tz;
      const vtNeu = Math.sign(vt) * Math.max(0, Math.abs(vt) - stossTempo * W.reibung);
      let rx = tx * vtNeu + nx * stossTempo * W.abprall, rz = tz * vtNeu + nz * stossTempo * W.abprall;
      if (stossTempo >= W.einschlagAb && w.uhr - w.letzteStrafe >= W.pause) {
        // Einschlag: Tempo nach dem Winkel, Richtung = abgeprallt
        const winkel = Math.asin(Math.min(1, stossTempo / Math.max(v, 1e-6))) / GRAD;
        // (Richtung wie ohne Reibung: entlang der Wand und etwas weg; die Strafe ersetzt hier die Reibung)
        rx = tx * vt + nx * stossTempo * W.abprall; rz = tz * vt + nz * stossTempo * W.abprall;
        const p = wandStrafe(winkel), rl = Math.hypot(rx, rz), soll = v * (1 - p);
        if (rl > 1e-6) { rx *= soll / rl; rz *= soll / rl; } else { rx = nx * soll; rz = nz * soll; }
        w.letzteStrafe = w.uhr; w.strafe = true; w.einschlaege++;
        w.verlust += v - soll;
        w.letzter = { winkel, vorher: v, nachher: soll, strafe: p };
      }
      physik.vx = rx; physik.vz = rz;
      w.schrittVerlust += Math.max(0, v - Math.hypot(rx, rz)); // M10c.2
      physik.drehrate *= CONFIG.kollision.drehBremse;
      return stossTempo;
    },

    // Am Ende der Kollisionen eines Schritts: Dauerkontakt (Schleifen) kostet Tempo pro Sekunde
    ende(physik, dt) {
      if (!w.kontakt) return;
      w.kontaktSchritte++;
      if (!w.strafe) {
        const f = (1 - CONFIG.kollision.wand.schleifen) ** dt;
        w.schrittVerlust += Math.hypot(physik.vx, physik.vz) * (1 - f); // M10c.2
        physik.vx *= f; physik.vz *= f;
      }
      w.treffer();
    },

    // M10c.2: Treffer zählen und die Motor-Strafe auslösen bzw. verlängern (am Ende jedes Schritts mit Kontakt)
    treffer() {
      const T = CONFIG.kollision.wandStrafe;
      if (!T.an) return;
      if (w.uhr - w.epLetzt > T.trennung) { w.epVerlust = 0; w.epDauer = 0; w.epFrontal = false; } // neuer Treffer
      w.epLetzt = w.uhr;
      w.epVerlust += w.schrittVerlust * 3.6;
      if (w.strafe && w.letzter.winkel >= T.frontalAb) w.epFrontal = true;
      const d = strafeDauer(w.epVerlust, w.epFrontal);
      if (d <= w.epDauer) return;
      if (w.epDauer === 0) {
        // neuer Treffer: Dauer zur Restzeit dazu (höchstens gesamtMax), Leistung fällt wieder auf den Anfang
        w.strafeRest = Math.min(T.gesamtMax, w.strafeRest + d);
        w.strafeGesamt = w.strafeRest; w.strafeSeit = 0; w.strafen++;
      } else {
        // derselbe Treffer kostet weiter Tempo (Schleifen): Strafe wächst mit
        const plus = Math.min(T.gesamtMax, w.strafeRest + d - w.epDauer) - w.strafeRest;
        w.strafeRest += plus; w.strafeGesamt += plus;
      }
      w.epDauer = d;
      w.strafeLetzte = { verlust: w.epVerlust, dauer: d, frontal: w.epFrontal };
    },

    reset() { w.letzteStrafe = -99; w.kontakt = false; w.strafe = false; w.verlust = 0; w.strafeAus(); },
  };
  return w;
}
