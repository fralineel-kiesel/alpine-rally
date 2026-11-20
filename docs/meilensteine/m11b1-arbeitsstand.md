# M11b.1 Arbeitsstand (Skigebiet-Feinschliff)

Referenz 0.11b = 59a6a32 (`git worktree add <ordner> 59a6a32`), Test: `node tools/m11b1-test.mjs --alt <ordner> --nur …`.

- **Teil A (breite Piste):** Breiten Dorf 10 m (95–200), Anstieg/Kehren/Grat 9.5 m (290–2480), Abfahrt/Funpark 11 m
  (2480–4115); Start/Ziel 7 m (Bogen, Band, Stroh fest). `js/breite.js`: angrenzende Abschnitte gehen weich ineinander über.
  Verlauf unverändert (Hang-Prüfung sofort 0 Fehler, max 0.408), Kehren 128/130°. Piste: `pisteTextur` (Cord-Rillen, 2 Bahnen),
  heller Rand (bankett #dbe4f0), Netze 2.0 statt 0.6 m hinter dem Bankett. Kontrast 50–107 (Hang auf der Seite ohne Netz).
  Testfahrer bit-gleich wie 0.11b (fährt Mitte). revision 2.
- Offen in A: Kurven-Vergleich erreichte den Tiefschnee nicht (Abkürz-Linien 4–14 m) → Linien um (halb − 2.45) nach innen.
  → erledigt: Kurven-Vergleich jetzt mit Tiefschnee-Linien 6–20 m innen: knappste +11.15 s (Escorta 2803 m), 134/200
  Linien bleiben stecken; Netze werden auf der breiten Piste nicht mehr berührt. Abkürzungen 0. **Teil A fertig (Commit 1).**
- **Teil B (Grip):** Streckenfeld `untergrund` (überschreibt config.js je Belag, nur Skigebiet). Piste: grip 0.6, traktion 0.8,
  heck 1.0 (sonst drifteten Escorta/Lanza 073 mit mehr Tempo ab) → Bremsweg 1.20×; 0–60 Allrad 3.6–3.8, Hinterrad 5.9–6.3 s;
  Hang 0–40 Allrad 3.2–3.4, Hinterrad 7.4–8.4 s. Testfahrer +7.3/+8.9/+7.4 %, sauber. Tiefschnee-Kehre ≥ +5.1 s. **Commit 2.**
  Tiefschnee: grip 0.65, rollen 0.8, rollenTempo 0.1, neu rollenQuadrat 0.03 (physics.js). Ein harter km/h-Deckel existierte nie
  (0.11b: rollenTempo 0.7 = Gleichgewicht ca. 20–25 km/h). Herauskommen 2.3–3.5 s (80 Fahrten), Verlust 2 s: −44…−74 %.
- **Teil C (Kamera):** `kameraGefaelle: 1` (Skigebiet), Werte `CONFIG.kamera.gefaelle` (Schwelle 3 %, +8 m Höhe / +45 m Blick
  je 100 % Gefälle, Tiefpass 1.5/s, in der Luft eingefroren). Steilstücke: Kamera 2.5 → 3.8–4.0 m über dem Auto, sichtbare
  Strecke 0/58/0 → 93/140/140 m. Eben/bergauf: Lage gleich 0.11b, Bild pixelgleich. Ruckeln max 1.4 cm/Bild. **Commit 3.**
- **Teil D (Kicker):** Befund: gebaut, aber unsichtbar (Rampe = Knick −15 → −9 % im Hang). Neu `kickerMesh` (js/skigebiet.js):
  Schneewände, rot-orange Lippe, Schattenband, Tor mit Banner, Fangzaun am Landehang, Fahnen; Zuschauer FUNPARK.
  Aus 100 m: 12 px hoch, 120 px, Kontrast 118 (vorher 18 px Fläche); 150 m: 9 px. Weiten 16.5–16.9 / 19.8–20.4 m. **Commit 4.**
- **Teil E (Szene):** Schneetannen (`schneetannenTextur`, Gruppen `natur.sprites.gruppe` 3–12): 3544 Stück, Gruppen-Median 7,
  ≥ 4.5 m hinter dem Bankett. Felswand nein (steht fest 5.2 m neben der Mitte) → 163 eingeschneite Felsen/Felsrücken in 5
  Abschnitten. Deko: 6 eingeschneite Hütten/Heustadel, Holzzäune + Holzstapel am Dorf, Wegweiser. Bildzeit 27 → 79 ms
  (Tannen +138 %, Rest ~1 %), Finnland 339 ms. Kontrast 50–67. Optionale Deko nicht gebaut. **Commit 5.** Danach: Teil F.
