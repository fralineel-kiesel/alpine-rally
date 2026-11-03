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

## Offen / nächste Schritte
- Teil B Wasser (Platsch, Schwarzbild, zurück), C Escorta, D Rentier-Ton, E Schatten, F Bericht.
- Bild Meter 969: Kamera für die Bilder in Teil F neu ausrichten (Hang besser im Bild).
