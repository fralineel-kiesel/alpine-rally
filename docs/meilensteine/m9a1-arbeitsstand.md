# M9a.1 – Arbeitsstand (Faden für neue Sitzungen)

Ziel: Touch-Feinschliff – R = Handbremse (über A/B), L = zurück auf die Strasse, kleine Knöpfe (Pillen), D-Pad quer
grösser mit asymmetrischen Zonen, AUTO-GAS, HAPTIK. Fahren, Ton, Physik, Autos, Tachos, Bestzeiten, Desktop unverändert.
Branch `claude/beautiful-dijkstra-a2clsc`, ein Commit je Teil. Vergleichsstand 0.9a: `git worktree add <ordner> 12de5b8`.
Test: `node tools/m9a1-test.mjs --alt <ordner 0.9a> [--nur a,b] [--lang]`.

- [x] A Belegung (touch.js: R = Handbremse gehalten, L = zurück/Kurztaste der Seite, R im Menü nichts), R direkt über A
      (`schulterR` 80x44, Hoch- und Querformat), kleine Knöpfe als Pillen 26 hoch mit Beschriftung innen (Treffer quer
      ≥ 36, hoch 44), quer seitlich: NOTES oben rechts (frei geworden), START unten rechts. Texte de/en.
      Tests (a) (b) grün; (c) Layout siehe unten; alte m9a-Tests auf R/L nachgezogen.
- [x] B D-Pad quer eigene Grösse (`quer.dpad` 176, ≤ 44 % der Höhe, Zone links ≤ 27 %): 874x402 176 statt 131,
      874x330 145, mit Safe-Area 166. Bild dafür kleiner (874x402: 501x282 statt 544x306), mittig zwischen den Zonen
      (`bildMittig: false`). Fahr-Zone (`fahrZone`): ←/→ ±50°, ↑/↓ ±15° bis 1.15 Radien, 35 % über/unter dem Kreuz,
      waagrecht bis 4 px vors Bild (quer) bzw. Mitte D-Pad–B (hoch); Knöpfe in der Zone haben Vorrang. Menü klassisch.
      Tests (e)-(h) grün, m9a (b) auf die neuen Sektoren nachgezogen.
- [x] C AUTO-GAS (`touchAutoGas`, Standard aus, geprüft beim Laden): touch.js setzt `touchEingabe.autoGas` je Bild nur
      bei Zustand 'rennen' und rennen 'laeuft'; input.js: Gas, solange Touch nicht bremst (B oder D-Pad ↓). A zeigt
      klein "AUTO" (grün). Eintrag nach TOUCH-STEUERUNG, nur im Touch-Modus (Desktop-Seite unverändert). (i)-(k) grün.
- [x] D HAPTIK (`js/haptik.js`, Einstellung `haptik` aus/knoepfe/voll, Standard voll; HAPTIK TESTEN als Aktion mit
      Meldung des Wegs). vibrate: Knopf 10, Gang 12, Checkpoint 15-30-15, Ziel, Aufprall 20..60 nach Wucht/14 wie im Ton;
      sonst iPhone: einmal angelegter versteckter <input switch> + label.click(). Knopf-Tick im pointerdown. Rate-Limit
      40 / 120 ms. Hooks in main.js nur bei Zustand 'rennen'. (m)-(p) grün – nur Chromium mit Zähler, iPhone ungeprüft.
- [ ] E Tests, Bilder, Bericht, Version 0.9a.1

Offen: quer liegt rechts vom Kreuz kaum Platz (Zone nur 4 px breiter als das Kreuz) – Gewinn vor allem senkrecht.
