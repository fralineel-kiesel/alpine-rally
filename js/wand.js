// M10c.1: Wand-Strafe. Seitlicher Kontakt mit Leitplanke, Zaun, Brückengeländer, Absperr-Wand (Kreisreihen in
// js/kollision.js) und Felswand (js/main.js) kostet echtes Tempo, statt dass das Auto mit vollem Tempo an der Wand
// entlang in die neue Richtung gleitet (Linos „Cheat“ in M10c). Bäume, Steine und Stämme bleiben wie bisher.
//   Einschlag: Tempo nach dem Winkel zwischen Fahrtrichtung und Wand (Streifen 25 %, steil 60 %, frontal höchstens 75 %),
//              das Auto prallt leicht ab (der Rest des Tempos zeigt entlang der Wand und etwas von ihr weg).
//   Dauerkontakt: solange es an der Wand schleift, zusätzlich ein fester Anteil pro Sekunde.
//   Keine Ausrichtung: die Wand dreht das Auto nicht in ihre Richtung (nur aus der Wand geschoben).
// Werte: config.js, Block kollision.wand. Diese Datei kennt kein Three.js.

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

    // Am Anfang jedes Physik-Schritts
    anfang(dt) { w.uhr += dt; w.kontakt = false; w.strafe = false; w.verlust = 0; },

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
      physik.drehrate *= CONFIG.kollision.drehBremse;
      return stossTempo;
    },

    // Am Ende der Kollisionen eines Schritts: Dauerkontakt (Schleifen) kostet Tempo pro Sekunde
    ende(physik, dt) {
      if (!w.kontakt) return;
      w.kontaktSchritte++;
      if (w.strafe) return; // in diesem Schritt schon der Einschlag
      const f = (1 - CONFIG.kollision.wand.schleifen) ** dt;
      physik.vx *= f; physik.vz *= f;
    },

    reset() { w.letzteStrafe = -99; w.kontakt = false; w.strafe = false; w.verlust = 0; },
  };
  return w;
}
