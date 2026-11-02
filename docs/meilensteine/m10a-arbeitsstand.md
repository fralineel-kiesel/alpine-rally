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

## Teil B – Lader und Alpenstrecke (in Arbeit)
- `strecken/alpen.js` (53 KB) aus 0.9a.2 erzeugt (Zahlen als Text übernommen; Punkte geprüft: 195/195 gleich).
- Neu: `js/strecken.js` (Register), `js/streckenlader.js` (Top-Level-await, StreckenFehler), `js/start.js`, `js/fehlerseite.js`.
- `config.js` verweist auf die Datei; track/world/leben/lebenbild/startzielbild/inhalte/sprites/kuehe/pacenotes/absperrungen umgestellt;
  js/abkuerzungen.js, baumfolge.js, kuhfolge.js, pacenotes-tempo.js gelöscht (jetzt `erzeugt.*`).
- Werkzeuge: `tools/strecke-erzeugt.mjs` (Blöcke lesen/schreiben), abkuerzungen/pacenotes-test/kuhfolge-schreiben/nebenweg-bogen umgestellt.
  nebenweg-bogen weicht in der 4. Nachkommastelle ab – genau wie schon in 0.9a.2 (kein neuer Fehler).
- Gemessen: Testfahrer identisch (2:59.33 / 2:42.35 / 2:31.92, alle Zeilen), Abkürzungen identisch (127/2/342/84).
- Offen: tools/m10a-test.mjs (a)–(j), Bildvergleich, Ton, Bestzeiten, Fehlerseite, grep, Ladezeit.
## Teil C – Prüfwerkzeuge (offen)
## Teil D – Bericht (offen)
