# M11b – Arbeitsstand (Skigebiet ersetzt den Gletscher)

Ziel: dritte Etappe „Skigebiet“ (hoch mit Spitzkehren, Grat, steile Abfahrt mit Kickern), Version 0.11b. Referenz 0.11a.1 = 471d726.

- **Teil A fertig:** Gletscher raus, `skigebiet.js` rev 1, alte Tests gekürzt (Erwartung alt), overlay robuster,
  Skipisten-Bildzeit 0.11a.1: −0.3 % (Median aus 5). `tools/m11b-test.mjs` (a–d).
- **Teil B fertig:** 4329.0 m, Asphalt 7.3 / Schotter 5.3 / Schnee 87.4 %, 6 Kehren hoch + 2 runter, Bergstation 1985–2065 m.
  Max +22.7 % (1.57× Alpen 14.5), Höhe −65.6…178.9 m = 244.5 m (1.54× Alpen 158.8). `hangabtrieb` 1.6 (neu, Standard 1),
  `strassenBreite` 4.9 m 300–2400 m (neu, `js/breite.js`). Testfahrer 15/15 im Ziel, Allrad 3:21.9–3:38.5, Escorta, Lanza 073
  +8.4/+9.8/+8.5 %. 0–40 am 22.5-%-Hang (Schnee): Allrad 4.0–4.3 s, Hinterrad 10.1/11.4 s. Hang-Check 0 (Werkzeug zählt jetzt
  Tiefschnee mit – vorher blind!). Alpen/Finnland bit-gleich (j).
- **Teil C fertig:** Fangnetze (`js/fangnetz.js`, 14 Abschnitte, rand 'zaun' = Wand-Strafe), Pistenstangen rot/blau,
  Felsbrocken statt Felswand (Felswand auf schmaler Strasse: Hang bis 1.19, NaN), Talstation+Parkplatz, Bergstation+Après-Ski,
  Tribüne + Pistenkreuzungen (`js/skigebiet.js`). Kurven-Vergleich: Rand-Kontakt ≥ +0.65 s, Abkürzungen 0, Kontrast 49–76.
- Nächster Teil: D (Sprünge `patchD.py`, Funpark-Optik schon in `js/skigebiet.js`).
