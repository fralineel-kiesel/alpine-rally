# M9a.2 – Arbeitsstand

Ziel: R zurück in die Ecke, Haptik nur Android, KNOPFGRÖSSE + LAYOUT (gespiegelt), HUD-GRÖSSE. Version 0.9a.2.
Test: `node tools/m9a2-test.mjs --alt <ordner 0.9a.1>` (0.9a.1 = `git worktree add <ordner> 4a265b2`).

## Teil A (erledigt)
- `js/touchlayout.js`: R wieder oben rechts in der Ecke (Hoch: oben rechts auf der Steuerfläche, Quer: oben rechts
  in der Zone), gleiche Höhe wie L. Grösse wie in 0.9a.1 (80x44, quer nicht mit dem Faktor verkleinert).
  Querformat „seitlich“ (Safari-Leisten): NOTES jetzt direkt unter R (vorher oben in der Ecke).
- Spalte rechts braucht keinen Platz mehr für R über A: Hochformat 375x667+Safe-Area und 360x640 (±Safe-Area)
  bekommen eine 2–22 px niedrigere Steuerfläche (Bild und Knöpfe rutschen etwas). Sonst ausser R alles wie 0.9a.1.
- `js/haptik.js`: iOS-Schalter entfernt, `haptikMoeglich()`; HAPTIK / HAPTIK TESTEN nur mit `navigator.vibrate`.
  Texte: Hinweis HAPTIK neu („VIBRATION BEI KNÖPFEN UND IM RENNEN“), `haptik.schalter` / `haptik.keiner` gelöscht.
- `tools/m9a1-test.mjs`: Erwartung R (Ecke) und Haptik (kein Schalter) nachgezogen.
- Test (b): 22 Layouts ok.

## Teil B (erledigt)
- KNOPFGRÖSSE (`touch.knopfGroessen` klein 0.85 / normal 1 / gross 1.2) und LAYOUT (normal / gespiegelt), nur Touch,
  nach TOUCH-STEUERUNG; wirken sofort (`anpassen()`), Prüfung beim Laden. Gespiegelt = normal gerechnet (Safe-Area
  links/rechts getauscht) und gespiegelt; Bilder der Knöpfe nicht gespiegelt.
- Quer GROSS: Bild kleiner (874x402: 439x247 statt 501x282; 640x360: 264x149); KLEIN grösser (874x402: 547x308).
  Faktor wird in engen Fenstern begrenzt (z. B. 640x360 GROSS wirklich 1.02).
- Tests (e)–(i): 131 ok (66 Varianten, Aktionen gespiegelt + Mehrfinger, Zonen, Neuladen, Standard = 0.9a.1).

## Teil C (erledigt)
- HUD-GRÖSSE (alle Geräte, unter ANZEIGE): `hud.groesse` klein 0.8 / mittel 1 / gross 1.43 (Tacho 1.25). Teil mit
  Faktor ≠ 1 malt auf eigene Leinwand 320/f x 180/f unter dem HUD (400x225, 224x126, 256x144); MITTEL ohne Ebene.
- Touch + GROSS: Hilfezeilen vor dem Start rücken über den Tacho (sonst 60 Bildpunkte Überlappung).
- Tests (j) MITTEL pixelgleich (5 Autos x 3 Pixelgrössen), (k) 90 Fälle ohne Pixel-Überlappung, Tacho GROSS 41 %,
  (l) Neuladen/Pause/Demo, Bildzeit hud.zeichne 0.47 ms wie 0.9a.1, (m) Texte. (d) Foto schwankt (Last), Pixel-Vergleich.

## Teil D (erledigt)
- Version 0.9a.2, Bilder `screenshots/m9a2/` (6), Bericht `docs/meilensteine/m9a2.md`, STAND/KONZEPT nachgeführt.
- Voller Lauf `--lang`: 290 ok, 12 rot (9 bekannte Altlasten, Foto 1 Bildpunkt 3D, overlay „darin“ und m9a1 (k)
  nachgezogen, overlay-Hinweis = Bildrate des Test-Browsers, alt/neu gleich nachgemessen).
