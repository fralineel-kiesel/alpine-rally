# M11b – Arbeitsstand (Skigebiet ersetzt den Gletscher)

Ziel: dritte Etappe „Skigebiet“ (hoch mit Spitzkehren, Grat, steile Abfahrt mit Kickern), Version 0.11b. Referenz 0.11a.1 = 471d726.

- **Teil A fertig:** Gletscher aus dem Register, `strecken/gletscher.js` gelöscht, `strecken/skigebiet.js` (revision 1, Platzhalter
  1164 m flach), Entwurf `tools/skigebiet-entwurf.mjs` (Steigung je Stück statt Kosinus). `m11a-test`/`m11a1-test` gekürzt
  (Gletscher-Teile „Erwartung alt, Gletscher entfernt“; Eissee/Hohlweg/Skipiste als Engine-Test auf einer Test-Variante),
  `overlay-test` wartet mit Wiederholung. `tools/m11b-test.mjs` (a–d). Skipisten-Bildzeit 0.11a.1 nachgemessen (siehe Bericht).
- Explore (Teil B vorab): Hangabtrieb gibt es schon (`physics.js:176`, 0.45·g·Steigung), Breite nur je Belag, Skipiste
  Einzelobjekt, kein Fangnetz. Alpen max +14.5 % (Sprungrampe 2129 m; ohne ca. 11.6 %), Höhe −0.8…158 m; Finnland +11.9/−16.7 %.
- Nächster Teil: B (Streckenverlauf aus dem Entwurf, Hangabtrieb-Faktor je Strecke, Breite je Abschnitt).
