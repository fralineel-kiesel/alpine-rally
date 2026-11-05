# M10c.2 Arbeitsstand (Wand-Strafe, Sprungkamera-Stufen, Landungs-Wums)

- Teil A fertig (Commit 1): js/wand.js (Dauer, Treffer, Leistung, Drehzahl), main.js, getriebe.js, tacho.js (MOTOR-Leuchte),
  audio.js (Aussetzer), config.js kollision.wandStrafe. Tests (a)–(m) grün ausser (j).
- Alte rote Tests: strassenrand/felswand/startziel = Erwartung alt (angepasst), nebenweg = Fahrskript (4-m-Kreis). Grün.
- (i) 37 Läufe ohne Kontakt bit-gleich, 13 mit Kontakt geändert, keine neue revision. Lanza Fi digital 3:12.83 → 3:10.38.
- (j) Alpen-Kehren rt4 1353/1499/1645/1792: vorher −0.26/−0.52/−0.71/−0.72 s, nachher +0.22/+0.21/+0.37/+0.41 s.
  Rot: escorta alle 4 (Traktion: Drossel = Traktionshilfe für Vollgas-Testfahrer; mit sanftem Gas −0.42/−0.08/−0.07/+0.10),
  l073 1353 −0.15 / 1645 −0.18, imprexa 1792 −0.58 (je 1 Treffer: weniger Schleifen). Vorschläge V1/V2 in /tmp/m10c2/kvV*.
- Gefunden, nicht behoben: main.js tonZ.schaltet/zielGang auskommentiert seit M10c (Schalt-Ton im Rennen).
- Als Nächstes: Teil C (Wums), dann B (Kamera), D (Bericht). Worktrees scratchpad/alt (0.10c.1), scratchpad/alt10c (0.10c).
