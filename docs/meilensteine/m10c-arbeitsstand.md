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

## Messwerte für Teil B
- Testfahrer-Tempo an den markierten Kuppen (0.10b.2): 113–141 km/h (Audan mittel: 129 / 115 / 141 / 119).
- Checkpoint 2 bei 1707 m liegt 44 m vor der Birkenkuppe (1751 m): Kante muss wegen der 60-m-Regel auf ca. 1840 m.
- Entwurf (Node-Simulation): Hochwald rampe 0.12 / gefaelle 0.10: 100 km/h 42 m, 120 km/h 63 m, 70 km/h 16.5 m.

## Offen
- Teil B (Finnland-Profil, Pace-Note), C (Kamera/Ton/Schatten/Haptik), D (Statistik), E (optional), F.
