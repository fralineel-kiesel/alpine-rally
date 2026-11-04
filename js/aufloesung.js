// M10c.1: Auflösung des 3D-Bilds mit AUTO (Standard). AUTO startet auf 640x360 und schaltet eine Stufe herunter
// (640 -> 480 -> 320), wenn die Bildrate im Rennen länger einbricht; nie automatisch wieder hoch in derselben Sitzung.
// Die automatisch gewählte Stufe merkt sich der Browser (einstellungen.autoStufe), damit ein schwaches Gerät nicht bei jedem
// Start erst ruckelt. HUD und Menü bleiben im 320x180-Raster (wirken in jeder Auflösung gleich gross).
// Werte: config.js, Block menue.autoAufloesung. Kein Garbage pro Bild (feste Puffer).

import { CONFIG } from './config.js';

export function baueAutoAufloesung(einstellungen, setze) {
  const A = CONFIG.menue.autoAufloesung;
  const N = Math.ceil(A.fenster * 240) + 8; // genug Platz für 240 Bilder pro Sekunde
  const dts = new Float32Array(N), sortiert = new Float32Array(N);
  const z = {
    test: null,          // nur Werkzeuge (?aufloesung=WxH): feste Stufe für diese Sitzung, nicht gespeichert
    ruhe: A.ruheNachStart, // so lange (s) wird nicht gemessen (nach dem Laden, Etappen- oder Auflösungswechsel)
    n: 0, zeit: 0, schlecht: 0, hz: 60, gesenkt: 0,
    // Nummer in menue.aufloesungen, die gerade gilt
    stufe() {
      if (z.test != null) return z.test;
      return einstellungen.aufloesungAuto !== false ? einstellungen.autoStufe : einstellungen.aufloesung;
    },
    istAuto() { return z.test == null && einstellungen.aufloesungAuto !== false; },
    ruhig() { z.ruhe = A.ruheNachStart; z.n = 0; z.zeit = 0; z.schlecht = 0; },
    // Ein Bild: dt (s); messen = im Rennen, läuft (nicht Menü, Pause, Countdown, Schwarzbild). Ergebnis: true = gesenkt
    bild(dt, messen) {
      if (!z.istAuto() || !messen || dt <= 0) { if (!messen) { z.n = 0; z.zeit = 0; } return false; }
      if (z.ruhe > 0) { z.ruhe -= dt; return false; }
      if (z.n < N) dts[z.n++] = dt;
      z.zeit += dt;
      if (z.zeit < A.fenster) return false;
      // Median der Bildzeit im Fenster
      for (let i = 0; i < z.n; i++) sortiert[i] = dts[i];
      const teil = sortiert.subarray(0, z.n); teil.sort();
      const fpsMedian = 1 / Math.max(1e-4, teil[z.n >> 1]);
      z.n = 0; z.zeit = 0;
      // Anzeige mit 120 Hz erkennbar (Bildrate deutlich über 60)? Dann gilt die höhere Grenze
      if (fpsMedian > A.hz120Ab) z.hz = 120;
      const grenze = z.hz >= 120 ? A.grenze120 : A.grenze;
      z.schlecht = fpsMedian < grenze ? z.schlecht + 1 : 0;
      if (z.schlecht < A.fensterNacheinander || einstellungen.autoStufe <= 0) return false;
      setze('autoStufe', einstellungen.autoStufe - 1);
      z.gesenkt++;
      z.ruhig();
      return true;
    },
  };
  return z;
}
