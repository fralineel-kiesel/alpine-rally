# M11a – Arbeitsstand (Schnee/Eis, Etappe Gletscher)

Ziel: Untergrund Schnee/Eis, Schneewall, dritte Etappe „Gletscher“ (ca. 4 km), Version 0.11a. Referenz 0.10d = 40c41f3
(Worktree `/tmp/ref010d`). Test: `node tools/m11a-test.mjs --alt /tmp/ref010d [--nur a,b]`, Logs `/tmp/m11a/`.

- **Teil A fertig:** Zielbildschirm: Zeit + Unterschied in einer Zeile, Zwischenzeiten zweispaltig (`js/menueseiten.js`),
  `js/menue.js` Zeilenhöhe `??` statt `||` (Daten-Einträge mit Höhe 0). Ungünstigster Fall 132 von 150 px, 18 px frei.
  pacenotes-test: Messfahrt ohne Wand-Strafe → 796/981 m wieder gleich (Erwartung richtig, Messung war gestört).
  menue-test: Credits-Namen aus config.js (Lino hat „SHAI-RON, BENJAMIN“ selbst eingetragen, Erwartung alt).
  m8h-test (i): „voll“ darf nicht mehr rollen. Bild `screenshots/m11a/04-zielbildschirm.png`.
- Teil B: offen. Teil C: offen. Teil D: offen.
