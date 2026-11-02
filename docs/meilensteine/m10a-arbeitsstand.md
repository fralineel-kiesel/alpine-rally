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

## Teil B – Lader und Alpenstrecke (fertig, Commit a635197)
- `strecken/alpen.js` (53 KB) aus 0.9a.2 erzeugt (Zahlen als Text übernommen; Punkte geprüft: 195/195 gleich).
- Neu: `js/strecken.js` (Register), `js/streckenlader.js` (Top-Level-await, StreckenFehler), `js/start.js`, `js/fehlerseite.js`.
- `config.js` verweist auf die Datei; track/world/leben/lebenbild/startzielbild/inhalte/sprites/kuehe/pacenotes/absperrungen umgestellt;
  js/abkuerzungen.js, baumfolge.js, kuhfolge.js, pacenotes-tempo.js gelöscht (jetzt `erzeugt.*`).
- Werkzeuge: `tools/strecke-erzeugt.mjs` (Blöcke lesen/schreiben), abkuerzungen/pacenotes-test/kuhfolge-schreiben/nebenweg-bogen umgestellt.
  nebenweg-bogen weicht in der 4. Nachkommastelle ab – genau wie schon in 0.9a.2 (kein neuer Fehler).
- Gemessen: Testfahrer identisch (2:59.33 / 2:42.35 / 2:31.92, alle Zeilen), Abkürzungen identisch (127/2/342/84).
- Tests (a)–(j) grün: 72 kaputte Varianten erkannt, 6 Testfahrer-Profile zeilengleich, 30 Pace-Notes gleich, 26 Bilder
  pixelgleich (eigene Bild-Uhr im Test), Ton gleich (ohne Echtzeit-Zeilen), Bestzeiten, Fehlerseite (5 Fälle), grep leer.
- Ladezeit: ohne Vorab-Laden +39/+57 ms; mit `modulepreload` für js/main.js in index.html +18/−13/+39 ms (Streuung ±100).
## Teil C – Prüfwerkzeuge (fertig)
- `tools/strecke-karte.mjs` (Karte, Profil, Bericht; Kuppen/Senken wie die Pace-Notes), `tools/strecke-abfahren.mjs`
  (Testfahrer wiederverwendet, Zeiten exakt wie testfahrer.mjs: Prototyp und Lanza 073). Tests (k), (l) grün.
## Teil D – Bericht (fertig)
- Version 0.10a; Bericht `docs/meilensteine/m10a.md`, Bilder `screenshots/m10a/` (4), STAND.md, KONZEPT.md.
- Regression `--lang`: (a)–(l) grün, alte Tests grün bis auf menue-test (2 Zeilen, gleich rot in 0.9a.2).
