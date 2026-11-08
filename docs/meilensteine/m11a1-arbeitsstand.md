# M11a.1 – Arbeitsstand (Gletscher-Feinschliff)

Ziel: Eis nur als 2–3 Eisseen, Hohlwege + Tiefschnee-Rand statt Dauer-Schneewall, mehr Berge, keine Bäume, Skipiste.
Vergleichsstand 0.11a = 06417f7 (Worktree). Tests: `node tools/m11a1-test.mjs --alt <0.11a> [--nur …]`, Logs `/tmp/m11a1/`.

**Teil A fertig:** (a) EIS in der Legende de/en (20 Symbole) grün. (b) Zeit je Sprung, Testfahrer „mittel“, mit/ohne
Sprungzonen: immer langsamer (+0.10 … +0.46 s), nie Gewinn. (c) Kreuzung 356 m: Lanza 073 flott/digital rutscht mit 34/42 km/h
aussen ins Absperrband → Entscheidung Testfahrer-Stil; rückwärts frei (12 m in 3 s), danach weiter. (d) Finnland-Pace-Notes:
beide Zeilen „Erwartung alt → angepasst“ (Messfahrt fliegt über die Birkenkuppe; SPRUNG ist feste Ansage), Daten unverändert.
(e) Alpen/Finnland 50/50 Läufe bit-gleich, 18 Bilder pixelgleich.

**Teil B fertig:** 3 Eisseen (`js/eissee.js`, Streckenfeld `eisseen`): 1351–1420 m (70×32 m), 2380–2479 m (100×38 m),
3398–3457 m (60×32 m); Eis 4.6 % (vorher 13.1 %), nichts auf den Seen, Bremsweg 1.48–1.49 / 2.81–2.83, Rand bremst, keine Strafe.
Testfahrer „mittel“ Allrad 3:21.1–3:21.4, Escorta 3:31.1, Lanza 3:32.4 (+5.7 %); ehem. Eiskehre beste Fahrt 4–5 s schneller.
Wall lohnt sich in Kehren für Hinterradler noch (Escorta −1.4 s) → fällt mit Teil C weg. Farbe: See aus 80 m B−R 64–93 gegen 22.
Offen: Teile C–E. Engine-Kartierung: kein Hohlweg-Mechanismus, keine lokale Verbreiterung, Berge fix 2 Ringe, Off-Road = gras.
