# M10a – Arbeitsstand

Ziel: Alpenstrecke als Datendatei (`strecken/alpen.js`), Spiel bleibt 1:1 (Referenzwerte, pixelgleich), plus Prüfwerkzeuge.
Vergleichsstand 0.9a.2 = Commit 90df3d8 (Arbeitskopie: `git worktree add <ordner> 90df3d8`).

## Teil A – Inventur und Format (fertig)
- Inventur: `docs/meilensteine/m10a-inventur.md` (Daten vs. Regel, Seeds, Ausnahmen).
- Format: `docs/strecken-format.md` (ES-Modul mit reinen Daten, `format: 1`, Felder, Beispiel).
- Prüfer: `js/streckenpruefung.js` (schnell/voll, ohne Three.js), Werkzeug `tools/strecke-pruefen.mjs <datei>` (0/1).
- Entscheidung: `config.js` bindet die Streckenwerte unter den alten Namen ein (Spielcode bleibt gleich);
  Lader mit Top-Level-await, Fehlerseite in `js/start.js`.
- Ausgangswerte 0.9a.2 gemessen: Testfahrer 2:59.33 / 2:42.35 / 2:31.92, Abkürzungen 127/2/342/84 (je ca. 10 s).

## Teil B – Lader und Alpenstrecke (offen)
## Teil C – Prüfwerkzeuge (offen)
## Teil D – Bericht (offen)
