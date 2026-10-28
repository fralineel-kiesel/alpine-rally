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

## Offen
- Teil C (HUD-GRÖSSE, Entwurf: eigene Leinwand je Faktor), Teil D (Bilder, Bericht, Version).
