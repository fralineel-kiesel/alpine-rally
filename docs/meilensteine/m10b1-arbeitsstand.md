# M10b.1 – Arbeitsstand

**Ziel:** Finnland-Feinschliff (Strecke ca. 4 km mit mehr Kurven, Einmündungen am Untergrundwechsel, Wald/Dorf, Escorta-Schotter-Bonus, Kunst-Schatten), Version 0.10b.1.

## Teil A – Strecke (erledigt, Commit 1)
- Neuer Verlauf aus `tools/finnland-entwurf.mjs`: **4161.6 m** (gefahren 4091.6 m), 3 Spitzkehren (R 17 m gemessen), 1 Schikane, 4 Kreuzungen, 4 Kuppen (`sprung` 487 / 1747 / 3108 / 3656 m), Checkpoints 1000 / 1707 / 2614 / 3419 m, `revision: 2`.
- Untergrundwechsel wie Alpen (`nebenwege`, keine Code-Erweiterung): Start Asphalt → Abzweig 100 m → Einmündung Dorf 1362.9 m → Abzweig 1592.9 m → Einmündung 4051.1 m (Seestrasse). Schotter 90.9 %.
- Bremszonen vor Kehren/Kreuzungen gerade (120–170 m), Gelände dort geglättet; Bäume erst ab 10.5 m (`natur.sprites.mindestAbstand`, neu als Streckenwert), Waldrand am Nebenweg innen 9.2–10 m.
- Bestzeiten: Schlüssel `finnland-r2` (`bestzeitSchluessel` in `js/streckenpruefung.js`), alte `finnland`-Zeiten bleiben liegen, werden nicht gezeigt.
- Testfahrer Prototyp 2:55.88 / 2:39.06 / 2:28.61, Schnitt vorsichtig 83.7 km/h, nahe Höchsttempo 3 %.
- Tests `tools/m10b1-test.mjs --nur a,c,d,e,f` grün; (b) rot: Audan flott 2, Subora flott 1, Lanza 073 mittel 1 Aufprall (Kontrollverlust in schnellen Schotter-Bögen/Kreuzungen, je Lauf an anderer Stelle – hängt stark an der Baumverteilung). Nach Teil B (Wald neu) erneut abstimmen.

## Teil B – Wald, Deko, Dorf (erledigt, Commit 2)
- Bäume: neues Bild `nordwald` (4 Fichten + 2 Kiefern, js/pixel.js), Kiefer dunkler, Birkenlaub kühler. Anteile bis 60 m: Fichte 57.0 / Kiefer 28.3 / Birke 14.7 %. Farbtest grün (Krone Fichte Helligkeit 42, Stamm-Anteil 2.6 %).
- Unterholz (`deko.unterholz: 'nordisch'`): Farn, Heide, Stumpf, Totholz, Findling, Schilf am See (4615 Stück, eigenes Bild, ohne Kollision). Grösste Lücke ohne Deko 25 m.
- Dorf: 6 Gebäude (holzhaus ×3, scheune, holzschuppen, saunahuette), Dachfarben rot/braun/grau, Zäune, Briefkästen, Holzstapel, Heuballen, Brunnen, 2 parkende Wagen, 28 Fans; Ruderboote an beiden Stegen; Elch-Warnschild.
- Waldrand am Nebenweg im Dorf aus (`wald.vor/nach: 6`), innen 9.5–10.3 m, ohne Felsbrocken.
- Bildzeit: erste Messung +4.6 % war eine Fehlmessung (in Teil E ca. +100 % gefunden, Wald abgespeckt, siehe Bericht). Alpen 26 Bilder pixelgleich.

## Teil C – Escorta (erledigt, Commit 3)
- `auto.schotterGrip` (Standard 1, Escorta **1.065**): Seitengriff vorne/hinten und Traktion nur auf Schotter. Testfahrer nutzt den Griff in der Kurven-Zielgeschwindigkeit (nur wenn ≠ 1, andere Autos bit-gleich).
- Finnland mittel: Escorta 2:38.24, 0.57 s vor Audan (2:38.81), 0.54 s vor Subora (2:38.78); Delto 2:38.84, Prototyp 2:39.06 dahinter; flott 2:30.63 ohne Unfall.
- Alpen Escorta alt 3:00.68 / 2:44.02 / 2:34.68 → neu 2:59.95 / 2:43.43 / 2:34.08; alle anderen Autos identisch. Garage-Zeile „LEICHT, DRIFTET GERN, SCHOTTER-SPEZIALIST“.
- Teil D (Schatten) wird weggelassen (Kontext knapp, Auftrag erlaubt es) – in STAND.md offen.

## Teil E – Abschluss (Commit 5)
- Version 0.10b.1, Bilder `screenshots/m10b1/` (6), Bericht `docs/meilensteine/m10b1.md`, STAND/KONZEPT nachgeführt.
- Volle Regression `node tools/m10b1-test.mjs --alt /tmp/alt-010b --lang` einmal (Ergebnis im Bericht).

## Teil E – Nachtrag
- Wald für die Bildzeit abgespeckt (3600 statt 6200 Versuche/km, Waldrand lockerer): Einzelmessung +2–5 %, Testlauf +30 % (Streuung). Anteile 57.6/28.8/13.5 %.

## Offen
- Teil D (Kunst-Schatten) weggelassen – offen für einen späteren Auftrag.
- Unfälle (b) nach Teil B: Audan flott 2 (2024, 3946 m), Subora flott 1 (3040 m), Lanza 073 mittel 1 (Zaun an der Einmündung 4015 m) – nicht erreicht, Kontrollverlust des Testfahrers.
