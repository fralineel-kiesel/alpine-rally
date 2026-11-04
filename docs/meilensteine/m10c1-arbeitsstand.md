# M10c.1 – Arbeitsstand (höchstens 20 Zeilen)

Ziel: steifere Sprungkamera (A), Wand-Strafe (B), Seekehre 3314 m (C), kleinere Vorschaukarte (D), AUTO-Auflösung (E), Bericht (F).
Referenz: 0.10c = 612cc62 (Worktree im Scratchpad), Bilder/Zeiten bei 320x180. Test: `node tools/m10c1-test.mjs --alt <0.10c>`.

- **A fertig:** `sprung.kamera` zurueck 0.05, heben 0.24, landenZeit 0.25, folgenHoehe 25, ruckAnteil 0.4–0.6 % der Bildhöhe,
  ruckZeit 0.1; Kamera hält im Flug nicht mehr die Abhebe-Höhe. Messung (110 km/h, alt/neu): Zoom-Out 14.4/3.4 %, Neigung
  gegen normal bis 27.9°/2.3° (Sprung 3), Anhebung 8.63/0.24 m, Ruck 1.7/0.6 % (1 Bildpunkt bei 180), normal nach 0.38/0.23 s,
  Nachlaufen 0.050/0.033 s. Tests a–e grün, (f) Bildzeit läuft.
- B: Entwurf in `js/wand.js` (Scratchpad-Kopie), Stil `wand` im Testfahrer, Wandkontakte in `strecke-abfahren.mjs`.
