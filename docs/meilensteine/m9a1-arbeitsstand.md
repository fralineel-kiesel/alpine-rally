# M9a.1 – Arbeitsstand (Faden für neue Sitzungen)

Ziel: Touch-Feinschliff – R = Handbremse (über A/B), L = zurück auf die Strasse, kleine Knöpfe (Pillen), D-Pad quer
grösser mit asymmetrischen Zonen, AUTO-GAS, HAPTIK. Fahren, Ton, Physik, Autos, Tachos, Bestzeiten, Desktop unverändert.
Branch `claude/beautiful-dijkstra-a2clsc`, ein Commit je Teil. Vergleichsstand 0.9a: `git worktree add <ordner> 12de5b8`.
Test: `node tools/m9a1-test.mjs --alt <ordner 0.9a> [--nur a,b] [--lang]`.

- [x] A Belegung (touch.js: R = Handbremse gehalten, L = zurück/Kurztaste der Seite, R im Menü nichts), R direkt über A
      (`schulterR` 80x44, Hoch- und Querformat), kleine Knöpfe als Pillen 26 hoch mit Beschriftung innen (Treffer quer
      ≥ 36, hoch 44), quer seitlich: NOTES oben rechts (frei geworden), START unten rechts. Texte de/en.
      Tests (a) (b) grün; (c) Layout siehe unten; alte m9a-Tests auf R/L nachgezogen.
- [ ] B D-Pad quer grösser, Zonen beim Fahren asymmetrisch (Menü klassisch)
- [ ] C AUTO-GAS
- [ ] D HAPTIK (js/haptik.js schon vorgeschrieben, noch nicht eingebunden)
- [ ] E Tests, Bilder, Bericht, Version 0.9a.1

Offen: Querformat-Bild wird mit grösserem D-Pad kleiner (Zone links) – Plan: Bild zwischen den Zonen statt exakt mittig.
