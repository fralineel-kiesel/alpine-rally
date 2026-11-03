# M10b.2 – Arbeitsstand

Ziel: Finnland-Hang bei 969 m abschleifen + Hang-Check, Wasser mit Teleport, Escorta auf Schotter, Rentier-Ton,
Kunst-Schatten, Version 0.10b.2. Vergleichsstand 0.10b.1 = `a289fad` (`git worktree add <ordner> a289fad`).

## Teil A – Hang (fertig)
- Ursache: `js/wasser.js` hob das Ufer nur 9 m breit aus, dahinter sprang das Gelände senkrecht auf die alte Höhe
  (bei 969 m: Strasse 4.5 m über dem See) → „Faltenwurf“. Neu: Streckenfeld `umgebung.boeschung`
  (Finnland `{ schulter 2.5, steigung 0.3, weich 4, reichweite 40 }`): Ufer steigt weich an, neben der Strasse
  flache Schulter und höchstens 0.3 Gefälle (aufgefüllt, Ufer rückt weg). Fluss 2.5 statt 3.0 m tief (Brückenrampe).
- `tools/hang-pruefen.mjs`: Finnland vorher 7 Stellen > 0.45 (bis 4.63), jetzt 0; > 0.35 nur 2 an der Brücke (0.38/0.42).
  Alpen: 33 Stellen > 0.45 (nur Bericht, nichts geändert).
- Meter 969: 0.10b.1 bleibt das Auto stecken (Neigung 38°), jetzt 2.1 s rückwärts wieder auf der Strasse (Neigung 12°).
  Neigungs-Begrenzung nicht nötig (höchstens 17° bei 40 km/h).
- Finnland-Testfahrer alle 6 Profile identisch wie 0.10b.1; Alpen x1–x4 grün (26 Bilder pixelgleich).
- Schilf nur noch, wo der Seerand nicht aufgefüllt ist. Test: `node tools/m10b2-test.mjs --alt <0.10b.1> --nur a,b,c,d,e`.

## Teil B – Wasser (fertig)
- `CONFIG.wasser.bad`: zu tief = Boden 0.6 m unter dem Spiegel; abblenden 0.3 s, schwarz 3.0 s, einblenden 0.3 s (3.3 s
  mindestens halb dunkel). HUD bleibt (Schwarz hinter das HUD gemalt), Steuerung gesperrt, Motor aus, Platsch + Spritzer.
  Zurück auf die letzte sichere Stelle der Etappe (Blick in Fahrtrichtung, Tempo 0, Checkpoints bleiben), Zeit läuft weiter.
- Flaches Wasser: kleine Spritzer und Plätschern. Taste R im Schwarzbild gesperrt, Pause friert es ein, Demo löst nichts aus.
- Platsch-Klang nur auf Strecken mit Wasser (`CONFIG.wasserAn`), Alpen: Bilder/Ton/Zeiten gleich. Tests (f)–(j) grün.

## Teil C – Escorta (fertig)
- Testfahrer-Stil `digital` (`strecke-abfahren --stil digital`): Gas voll, Tasten antippen mit der Lenk-Rampe aus input.js.
  Vorher Finnland digital: Escorta 3:00.80 (8 Aufpralle), L073 3:04.90, Imprexa 2:37.66. Kurztest Schotter 70 km/h
  Vollausschlag + Vollgas: Escorta 37° Schwimmwinkel, gefangen nach 2.6 s (Imprexa 3°).
- Neu (nur Escorta, nur Schotter): `schotterHeck 0.5`, `schotterStabil 4`, `schotterTraktion 1.05`, `schotterGrip` 1.065 → 1.08.
- Nachher digital 2:37.03 (0 Aufpralle), 0.63 s vor Imprexa; Drift 3.3°, 0–80 Schotter 4.21 s (+3 % zum Imprexa).
  Andere Autos bit-gleich (alle Stile, Messwerte, Alpen x2). Escorta Alpen 2:59.95/2:43.43/2:34.08 → 2:59.80/2:43.13/2:33.50.
- Handbremsen-Drift Schotter: Einlenken gleich, Spitze 25° statt 43°, gefangen 0.9 s statt 1.8 s (Asphalt bit-gleich).

## Teil D – Rentier-Ton (fertig)
- `deko.tierKlang: 'rentier'` (Finnland), `CONFIG.rentierKlang`: Schnauben und Klicken (im Code erzeugt), alle 2.5–7 s aus der
  nächsten Herde in 45 m, Stereo/Abstand wie Kuhglocken, einmal Aufschrecken unter 16 m. Pause: nichts Neues, Umgebung gedämpft.
- Alpen: Glocken wie bisher, keine Rentier-Puffer; x5 grün (eine Musik-Echtzeitzeile wackelt, zweiter Lauf grün).

## Offen / nächste Schritte
- E Schatten, F Bericht.
- Bild Meter 969: Kamera für die Bilder in Teil F neu ausrichten (Hang besser im Bild).
