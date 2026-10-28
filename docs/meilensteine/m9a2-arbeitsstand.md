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

## Offen
- Teil B (KNOPFGRÖSSE, LAYOUT), Teil C (HUD-GRÖSSE), Teil D (Bilder, Bericht, Version).
