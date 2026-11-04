# M10c – Arbeitsstand (Sprünge mit Flugphase)

Vergleichsstand 0.10b.2: `git worktree add <ordner> ffca7c3`. Tests: `node tools/m10c-test.mjs --alt <ordner> [--nur …]`.

## Teil A – Flugphase (fertig)
- `js/sprung.js`: Sprungzonen aus `sprung` (von/bis/kante/landeVon/landeBis/staerke/form), Höhen-Zusatz auf die Strasse
  (track.js, nach dem Spline: Länge/Draufsicht/Streckenmeter gleich), Prüfer-Regeln, Klasse `Flugphase`.
- Abheben nur in der Abhebe-Strecke einer Zone (Kante −3 m bis landeBis, ±10 m): „angedrückter Körper“, frei, sobald der
  Boden schneller fällt als die Parabel, ab 4 cm Abstand = in der Luft. Luft: `physics.luftSchritt` (Tempo, Gier bleiben).
- Landung: Verlust aus Aufprall senkrecht (frei bis 6.5 m/s, hart 25 % bei 11 m/s, max 35 %), Nase voran (bis 12 %), Gier (bis 10 %).
- Testfahrer `strecke-abfahren.mjs`: Sprünge je Stil (Weite, Zeit, Höhe, Verlust), `--json`, Tempo an Kuppen/Kanten.
- Tests a, c–h grün (Ballistik −0.7…−3.7 %, 1000 Zufallssprünge sauber); Alpen x1–x5 grün (Zeiten, 26 Bilder, Ton bit-gleich).

## Teil B – Finnland (fertig)
- 4 Zonen in `strecken/finnland.js` (Kante 495 / 1830 / 3090 / 3656 m), `revision` 3 (Bestzeiten `finnland-r3`).
- Flugweite bei 100 km/h: 14.5 / 23.8 / 38.0 / 30.3 m; 70 km/h alle im Landehang; 120 km/h Hochwald 57 m (Landezone bis 3160).
- BIRKENKUPPE: Kante 1830 statt 1751 m (Checkpoint 2 bei 1707 m, 60-m-Regel); Fans dort mit der Kante um 60 m verschoben.
- Testfahrer: vor der Kante höchstens 95 (vorsichtig) / 115 km/h (mittel, digital), flott voll. 80 Sprünge, alle auf
  Strasse/Schulter, mittel höchstens 9 % Verlust. Lanza 073 bleibt unfallträchtig (mittel 3, digital 10; 0.10b.2: 1 / 12).
- Pace-Note SPRUNG (eigene Ansage, 164–175 m vor der Kante), Legende de/en; km-Tafel 0.5 aus der Landezone gerückt.
- Tests i–o, a, x1–x5 grün.

## Offen
- Teil C (Kamera/Ton/Schatten/Haptik), D (Statistik), E (optional), F.
