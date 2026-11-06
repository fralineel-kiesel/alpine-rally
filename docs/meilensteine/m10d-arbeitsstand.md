# M10d – Arbeitsstand (höchstens 15 Zeilen)

Ziel: Schaltton, Wums, Wand-Strafe, Alpen mit Sprüngen/Schatten/Deko, 0.10d. Tests `tools/m10d-test.mjs`. Referenzen: 0.10c.2 = b14cecc, vor Schaltton-Fehler = 017fb8f.
- **A:** Ursache `main.js` (9c1c555, Kommentar am Zeilenende schluckte `tonZ.zielGang/schaltet`), sonst nichts. Pegel = vorher (Δ 0.00 dB).
  Wächter (a) Ereignisse = Gangwechsel, (b) `tools/kommentar-waechter.mjs`, (c) Pegel. Wums im Mix: hart +6.7 → +8.8, sehr hart
  +10.3 → +12.2 dB (Bass-Abfall länger, Ducking −9 dB), Spitze ≤ −1.05 dBFS; mehr Rauschen hob die Spitze → Faktor 1.0.
- **B:** Dauer 3–6 s, Stapeln 9 s, 0.03 für 1 s, glatt 0.10 → 1. Kurven-Vergleich inkl. Gas-Rampe: 4 (alt 7) → **0** offen,
  kein Nachziehen. Streifer +1.2 s, frontal +3.5 s. 37 Läufe ohne Kontakt bit-gleich. l073 Finnland digital 1 Strafe 4.0 s.
- **C:** Sprünge STARTKUPPE 180 / ALMKUPPE 2140 / ZIELKUPPE 3440 m: 16.6 / 19.6 / 22.5 m bei 100 km/h (alle Autos ±0.6),
  190 km/h bis 58 / 68 / 75 m, Verlust ≤ 28 %. Alpen `revision: 2`. 25 Läufe: keine Aufpralle/Strafen, kein Zeitgewinn.
  Abkürzungen unverändert. pacenotes-test: SPRUNG-Ausnahme ergänzt; 981 m 63.2 statt 62.1 km/h kommt aus Teil B.
  rt4 „flott“ fliegt 450 m nach der Startkuppe bei 655 m ab (bekannte Empfindlichkeit, M8f). Bildzeit +2.3 % (Grenze 3 %).
- **D:** `schatten` Alpen: Sonne 125°, Länge 0.7, Dunkelheit 0.6 (0.5/0.45 war unsichtbar), Steine/Felsbrocken; Budget 60 (oft voll). Bildzeit +5.4 %
  (bereinigt +3.5 %; mit 0.5/0.45 waren es +0.2 %). AUS bit-gleich zu C, Finnland-Bilder bit-gleich (AN/AUS). E fällt weg (Kontext). Nächster: F.
- **F:** Regression `--lang` einmal; 5 Tests umgestellt (Schlüssel `passstrasse-r2`, Referenzen, Sprungzone, Strafe), Bericht m10d.md.
