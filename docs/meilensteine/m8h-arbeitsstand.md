# M8h – Arbeitsstand (Faden für neue Sitzungen)

Ziel: Bestzeiten je Auto (Top 10), Gesamt-Top-3 (abgeleitet), Live-Vergleich und Zielbildschirm gegen die Bestzeit des
gefahrenen Autos, GESAMTREKORD, Bestzeiten-Seite mit Umschalten. Branch `claude/bold-hawking-2x50ka`, ein Commit je Teil.
Vergleichsstand 0.8g: `git worktree add /tmp/alt08g ed0e695`.

- [x] A Speicher: neuer Schlüssel `alpineRally.bestzeiten2` = { etappe: { auto|_ohne: [Top 10] } }, Übernahme der alten
      Liste beim ersten Lesen (alter Schlüssel nur gelesen), `ladeGesamtTop`, `gesamtPlatz`/`gesamtBisher`, Löschen beider
      Schlüssel, Speicher voll = Zeiten gelten bis zum Neuladen. `tools/m8h-test.mjs --nur a,b,c,d,e,f` alles ok.
- [x] B Referenz = Bestzeit des gefahrenen Autos (`laufAuto()`, keine Referenz ohne eigene Zeit, Garage lädt nach),
      `gesamtPlatz/gesamtBisher/gesamtRekord`, Titel GESAMTREKORD! > NEUE BESTZEIT! > ZIEL!, Zeile "PLATZ p VON n ·
      GESAMT PLATZ 3" (eine Zeile, Tafel höchstens 163 wie 0.8g), lange Fanfare auch beim Rekord, BESTZEIT AUTO / CAR BEST.
      (h)(i)(j) ok; Delto mittel 2:41.60 unverändert.
- [x] C Bestzeiten-Seite: Kopf GESAMT TOP 3 (Etappe rechts), 3 Zeilen mit Kurznamen, AUTO < NAME > (Links/Rechts, Maus,
      Gamepad), TOP 10 des Autos; Zeit-Zeilen 8 Pixel, Listen aufgefüllt -> Tafel immer 172 hoch, kein Rollen (Menü ist
      immer 320x180). Ohne gültige Id: "--". Rückfrage "ALLE BESTZEITEN ALLER AUTOS …". (k)(l)(m) ok.
      Alte Tests angepasst (rennablauf, overlay, m8c g, m8e e, ton-test, menue-test): neuer Schlüssel, Seite, GESAMTREKORD.
- [ ] D Tests, Bilder, Bericht, Version

Werte: Speicher voll belegt (5 Autos x 10 + 10 ohne Auto, mit Spur) ca. 146 KB Text (ca. 293 KB im Browser).
Menü ist immer im 320x180-Raster (auch bei 480x270/640x360): Tafel höchstens 172 Pixel hoch.
