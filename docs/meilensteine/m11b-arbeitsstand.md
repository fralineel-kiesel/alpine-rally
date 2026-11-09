# M11b – Arbeitsstand (Skigebiet ersetzt den Gletscher)

Ziel: dritte Etappe „Skigebiet“ (hoch mit Spitzkehren, Grat, steile Abfahrt mit Kickern), Version 0.11b. Referenz 0.11a.1 = 471d726.

- **A fertig:** Gletscher raus, `skigebiet.js` rev 1, alte Tests gekürzt (Erwartung alt), overlay robuster,
  Skipisten-Bildzeit 0.11a.1: −0.3 % (Median aus 5). `tools/m11b-test.mjs` (a–d).
- **B fertig:** 4329.0 m, 6+2 Kehren, max +22.7 % (1.57× Alpen), 244.5 m Höhe (1.54×), `hangabtrieb` 1.6, `strassenBreite` 4.9 m.
  Testfahrer 15/15, Allrad vorn, Lanza 073 +8–10 %; 0–40 am Hang Allrad 4.0–4.3 s, Hinterrad 10–11 s. Hang-Werkzeug zählt Tiefschnee.
- **C fertig:** Fangnetze (`js/fangnetz.js`, Wand-Strafe), Pistenstangen, Felsbrocken statt Felswand (Hang 1.19, NaN), Stationen,
  Tribüne + Pistenkreuzungen (`js/skigebiet.js`). Kurven-Vergleich Rand ≥ +0.65 s, Abkürzungen 0, Kontrast 49–76.
- **D fertig:** Schneekuppe 2640 m (20 m bei 100 km/h), 3 Kicker 3560/3670/3780 m (16.7 m), alle auf Schnee; 100 Sprünge in
  25 Läufen ok; jeder Sprung kostet Zeit (+0.23…+1.37 s); Rekord unter „skigebiet“. Funpark-Optik in `js/skigebiet.js`.
- Nächster Teil: E (`js/seilbahn.js` geschrieben, Skipiste als Liste, Berge, Tannen nur im Dorf, Bildzeit).
