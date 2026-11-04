# M10c.1 – Arbeitsstand (höchstens 20 Zeilen)

Ziel: steifere Sprungkamera (A), Wand-Strafe (B), Seekehre 3314 m (C), kleinere Vorschaukarte (D), AUTO-Auflösung (E), Bericht (F).
Referenz: 0.10c = 612cc62 (Worktree im Scratchpad), Bilder/Zeiten bei 320x180. Test: `node tools/m10c1-test.mjs --alt <0.10c>`.

- **A fertig:** `sprung.kamera` zurueck 0.05, heben 0.24, landenZeit 0.25, folgenHoehe 25, ruckAnteil 0.4–0.6 % der Bildhöhe,
  ruckZeit 0.1; Kamera hält im Flug nicht mehr die Abhebe-Höhe. Messung (110 km/h, alt/neu): Zoom-Out 14.4/3.4 %, Neigung
  gegen normal bis 27.9°/2.3° (Sprung 3), Anhebung 8.63/0.24 m, Ruck 1.7/0.6 % (1 Bildpunkt bei 180), normal nach 0.38/0.23 s,
  Nachlaufen 0.050/0.033 s. Tests a–f grün (Bildzeit Finnland −0.8 %). Commit 95cc14f.
- **B:** `js/wand.js` (Einschlag 25/60/75 % nach Winkel zur Wandrichtung, Pause 0.25 s, Schleifen 35 %/s + Reibung, keine
  Ausrichtung), Felswand ebenso; Stil `wand` (wie digital, enge Wand-Kurven ohne Bremsen); `tools/wand-kurven.mjs` = Wert der
  Wand je Kurve (schnellste Fahrt mit gegen ohne Wandkontakt). Exploit-Kurven 0.10c 25 → neu 17 (Finnland 4 → 0, Alpen-Kehren
  1226/1411/1558/1705 bleiben +0.3–1.0 s). Ganze Etappe: wand schneller als mittel, weil enge Kurven auch ohne Wand schneller
  gehen, als mittel plant (kein Wand-Effekt). Mittel/vorsichtig ohne Wandkontakt bit-gleich, h–n grün.
- Nächste: D (Patch im Scratchpad `teil-d.py`), C, E (`teil-e.py`, `js/aufloesung.js`), F.
