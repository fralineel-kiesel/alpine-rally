# M11a – Arbeitsstand (Schnee/Eis, Etappe Gletscher)

Ziel: Untergrund Schnee/Eis, Schneewall, dritte Etappe „Gletscher“ (ca. 4 km), Version 0.11a. Referenz 0.10d = 40c41f3
(Worktree `/tmp/ref010d`). Test: `node tools/m11a-test.mjs --alt /tmp/ref010d [--nur a,b]`, Logs `/tmp/m11a/`.

- **Teil A fertig:** Zielbildschirm: Zeit + Unterschied in einer Zeile, Zwischenzeiten zweispaltig (`js/menueseiten.js`),
  `js/menue.js` Zeilenhöhe `??` statt `||` (Daten-Einträge mit Höhe 0). Ungünstigster Fall 132 von 150 px, 18 px frei.
  pacenotes-test: Messfahrt ohne Wand-Strafe → 796/981 m wieder gleich (Erwartung richtig, Messung war gestört).
  menue-test: Credits-Namen aus config.js (Lino hat „SHAI-RON, BENJAMIN“ selbst eingetragen, Erwartung alt).
  m8h-test (i): „voll“ darf nicht mehr rollen. Bild `screenshots/m11a/04-zielbildschirm.png`.
- **Teil B fertig:** `untergrund.schnee/eis` (ein Block in config.js), `schneeGrip/eisGrip` je Auto + `allrad/heckJeBelag`
  schnee/eis; Bremsweg gegen Schotter 1.48–1.49 / 2.81–2.83; 0-60 Schnee Allrad 4.2–4.4 s, Hinterrad 6.9–7.1 s. Ton
  (Kies tiefer, Eis-Zischen), Staub weiss, Texturen, EIS-Pace-Note (Schneeflocke, 150 m), Schattenfarbe je Strecke,
  `js/schneewall.js` (weicher Rand, ca. 45 %/s, schiebt heraus, keine Strafe). Tests d,e,f,g,h,j grün, (i) in Teil C.
  Messwerkzeug `tools/schnee-messung.mjs`. Alpen/Finnland: 50 Testfahrer-Läufe bit-gleich zu 0.10d.
- Teil C: Entwurf `tools/gletscher-entwurf.mjs` (4352 m, 3 Kehren, Senke 2440 m, Kuppen 718/3196/3845). Teil D: offen.
