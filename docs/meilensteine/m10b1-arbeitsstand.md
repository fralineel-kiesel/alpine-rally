# M10b.1 – Arbeitsstand

**Ziel:** Finnland-Feinschliff (Strecke ca. 4 km mit mehr Kurven, Einmündungen am Untergrundwechsel, Wald/Dorf, Escorta-Schotter-Bonus, Kunst-Schatten), Version 0.10b.1.

## Teil A – Strecke (erledigt, Commit 1)
- Neuer Verlauf aus `tools/finnland-entwurf.mjs`: **4161.6 m** (gefahren 4091.6 m), 3 Spitzkehren (R 17 m gemessen), 1 Schikane, 4 Kreuzungen, 4 Kuppen (`sprung` 487 / 1747 / 3108 / 3656 m), Checkpoints 1000 / 1707 / 2614 / 3419 m, `revision: 2`.
- Untergrundwechsel wie Alpen (`nebenwege`, keine Code-Erweiterung): Start Asphalt → Abzweig 100 m → Einmündung Dorf 1362.9 m → Abzweig 1592.9 m → Einmündung 4051.1 m (Seestrasse). Schotter 90.9 %.
- Bremszonen vor Kehren/Kreuzungen gerade (120–170 m), Gelände dort geglättet; Bäume erst ab 10.5 m (`natur.sprites.mindestAbstand`, neu als Streckenwert), Waldrand am Nebenweg innen 9.2–10 m.
- Bestzeiten: Schlüssel `finnland-r2` (`bestzeitSchluessel` in `js/streckenpruefung.js`), alte `finnland`-Zeiten bleiben liegen, werden nicht gezeigt.
- Testfahrer Prototyp 2:55.88 / 2:39.06 / 2:28.61, Schnitt vorsichtig 83.7 km/h, nahe Höchsttempo 3 %.
- Tests `tools/m10b1-test.mjs --nur a,c,d,e,f` grün; (b) rot: Audan flott 2, Subora flott 1, Lanza 073 mittel 1 Aufprall (Kontrollverlust in schnellen Schotter-Bögen/Kreuzungen, je Lauf an anderer Stelle – hängt stark an der Baumverteilung). Nach Teil B (Wald neu) erneut abstimmen.

## Offen
- Teil B (Wald, Dorf), C (Escorta), D (Schatten), E (Tests, Bilder, Bericht).
- Unfälle (b) nach Teil B neu messen.
