# M10c.1 – Arbeitsstand (höchstens 20 Zeilen)

Ziel: steifere Sprungkamera (A), Wand-Strafe (B), Seekehre 3314 m (C), kleinere Vorschaukarte (D), AUTO-Auflösung (E), Bericht (F).
Referenz: 0.10c = 612cc62 (Worktree), Bilder/Zeiten bei 320x180. Test: `node tools/m10c1-test.mjs --alt <0.10c> [--lang]`.

- **A** (95cc14f): Zoom-Out 14.4 → 3.4 %, Neigung Sprung 3 27.9° → 2.3°, Ruck 0.56 % (1 Bildpunkt), normal nach 0.23 s.
- **B** (3d67fa5): `js/wand.js`, Stil `wand`, `tools/wand-kurven.mjs`. Exploit-Kurven 25 → 16 (Finnland 0, Alpen-Kehren 1–4
  bleiben +0.3–0.9 s). Ohne Wandkontakt bit-gleich, keine neue revision.
- **C** (70f870b + Nachbesserung in F: See zusammenhängend, Kreise r 10): Planke weg, naher See, Ufer 2–7 m, Wasserbad → 3270 m.
- **D** (0a80732): Karte 74x62, Sprungrekord in der Liste. **E** (be03caf): AUTO, Migration, Werkzeuge fest 320x180.
- **F**: Version 0.10c.1, Bilder (6) in `screenshots/m10c1/`, Bericht `docs/meilensteine/m10c1.md`, STAND/KONZEPT.
  Schlusslauf: F1 (alle Tests), F2 (`--lang`, frühere Tests), F3 (Bildzeit f, bz) → Logs `/tmp/m10c1-F*.log`.
- Offen/melden: Alpen-Kehren, ganze Etappe wand > mittel (Kurvenplanung), Ufer-Breite, kein Testfahrer-Wasserbad,
  Auflösungswechsel 0.4–0.9 s für 2 Bilder im Software-Browser.
