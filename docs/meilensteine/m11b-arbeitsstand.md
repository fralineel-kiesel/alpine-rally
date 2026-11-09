# M11b – Arbeitsstand (Skigebiet ersetzt den Gletscher)

Ziel: dritte Etappe „Skigebiet“ (hoch mit Spitzkehren, Grat, steile Abfahrt mit Kickern), Version 0.11b. Referenz 0.11a.1 = 471d726.

- **Teil A fertig:** Gletscher aus dem Register, `strecken/gletscher.js` gelöscht, `strecken/skigebiet.js` (revision 1, Platzhalter
  1164 m flach), Entwurf `tools/skigebiet-entwurf.mjs` (Steigung je Stück statt Kosinus). `m11a-test`/`m11a1-test` gekürzt
  (Gletscher-Teile „Erwartung alt, Gletscher entfernt“; Eissee/Hohlweg/Skipiste als Engine-Test auf einer Test-Variante),
  `overlay-test` wartet mit Wiederholung. `tools/m11b-test.mjs` (a–d). Skipisten-Bildzeit 0.11a.1 nachgemessen (siehe Bericht).
- **Teil B fertig:** 4329.0 m, Asphalt 7.3 / Schotter 5.3 / Schnee 87.4 %, 6 Kehren hoch + 2 runter, Bergstation 1985–2065 m.
  Max +22.7 % (1.57× Alpen 14.5), Höhe −65.6…178.9 m = 244.5 m (1.54× Alpen 158.8). `hangabtrieb` 1.6 (neu, Standard 1),
  `strassenBreite` 4.9 m 300–2400 m (neu, `js/breite.js`). Testfahrer 15/15 im Ziel, Allrad 3:21.9–3:38.5, Escorta, Lanza 073
  +8.4/+9.8/+8.5 %. 0–40 am 22.5-%-Hang (Schnee): Allrad 4.0–4.3 s, Hinterrad 10.1/11.4 s. Hang-Check 0 (Werkzeug zählt jetzt
  Tiefschnee mit – vorher blind!). Alpen/Finnland bit-gleich (j).
- Nächster Teil: C (Fangnetze `js/fangnetz.js` vorbereitet, Stationen, Zielarena, Pistenkreuzungen, Kontrast).
