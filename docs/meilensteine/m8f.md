# Meilenstein 8f – Lanza 073 überarbeitet, Subora Imprexa in Blau-Gelb mit höherer Drehzahl, Kontext-Diät

Version **0.8f**. Sechs Teile, sechs Commits (Teil 0, A bis E), ein Pull Request.

**Ehrlich vorweg:** Ich kann weder hören noch fahren. Alles zu Ton und Fahrgefühl unten ist **gemessen**, nicht erlebt.
Ob der Lanza sich jetzt „fangbar“ anfühlt und ob der Lader „klar hörbar“ ist, kann nur Lino sagen.

## Was ist neu?

### Teil 0 – Kontext-Diät
- Die alte `STAND.md` (**566 183 Bytes, 7246 Zeilen, ca. 162 000 Token**) liegt **unverändert** in
  `docs/archiv/STAND-bis-m8e.md` (verschoben mit `git mv`, Prüfsumme sha256 `6118f43c…bb347` vorher und nachher gleich).
- Neues Inhaltsverzeichnis `docs/archiv/INDEX.md` (Zeile: Überschrift, 40 Zeilen).
- Neue, kurze `STAND.md`: **165 Zeilen / 13 727 Bytes (ca. 3 900 Token)** nach Teil 0, mit der M8f-Zusammenfassung am
  Schluss **190 Zeilen / 15 907 Bytes (ca. 4500 Token)** – rund 36-mal kleiner als vorher, mit Aktuell, Steuerung, Wo steht was
  (je Datei eine Zeile), Referenzwerten, Werkzeugen, offenen Problemen und Ideen. Ausführliche Berichte kommen jetzt hierher
  (`docs/meilensteine/`).
- `CLAUDE.md` mit Spar-Regeln (Archiv nie ganz lesen, grosse Dateien bereichsweise, Bilder sparsam) und „Compact instructions“.
- Kein Werkzeug liest `STAND.md` ein (nur Texte und Kommentare nennen sie); geändert wurden nur Dokumente.

### Teil A – Lanza 073: Heck als Gruppe-B-Keil statt Pritsche
- Der Motordeckel fällt jetzt von ca. **1.02 m an der Kabine auf 0.83 m am Heck** (Neigung **9.2°**, leicht gewölbt).
- **Finnen** vom Dachende schräg hinunter auf die Kotflügel: von der Seite fällt die Linie vom Dach (1.25 m) bis zum Heck
  durchgehend ab.
- Die **Hinterkotflügel stehen als Kamm** seitlich über dem Deckel (Tal in der Mitte, 4.6 bis 6.0 cm tief, Kamm über dem
  Rad 0.99 m).
- **Kurze Rückwand** (0.36 m über der Schürze), Heckleuchten etwas tiefer, darüber ein **Heckflügel auf zwei Stützen**
  (Oberkante 1.04 m, Farbe `fluegel`, hintere Kante im Akzent).
- Lüftungsschlitze und GIPFELWERK liegen auf dem geneigten Deckel im Tal; die Nummern bleiben auf Haube und Dach.
- Doppelauspuff unverändert; die Flamme (`auspuff`) sitzt geprüft am Ende der Rohre.
- Masse, Radstand, Räder, Kollisionsbox, Staub: unverändert (geprüft gegen 0.8e). 9 Draw Calls, 1376 Dreiecke.
- **Gemessen am Seitenprofil** (`tools/m8f-form.js`, höchste Stelle der Karosserie je Zentimeter): längste flache Strecke
  (Neigung unter 3°) hinter z = -0.5 **vorher 1.11 m, jetzt 0 m**; längste Strecke mit weniger als 2 cm Höhenunterschied
  vorher 0.59 m, jetzt 0.19 m.

### Teil B – Lanza 073: fangbar statt Seife
- Geändert (nur `fahrprofile.l073.auto`): `stabilitaet` 4.5 → **6.8**, `gewichtstransfer` 0.8 → **0.75**, `gasImDrift` 0.15 →
  **0.1**, `heckJeBelag.schotter` 1.36 → **1.34**. `gripHinten` bleibt 1.0 (siehe unten), `antriebHinten` 1.2, `traegheit` 2.45,
  `schwerpunktVorne` 0.525 unverändert.
- Neue Kontrolltests mit der **Tastatur-Lenkung wie im Spiel** (Hinweis: die Tastatur wird schon geglättet: voller Einschlag
  nach ca. 0.31 s, zurück in 0.17 s; `js/input.js`, `steuerung.tastaturLenkTempo` 3.2 / `tastaturRueckTempo` 6). Ergebnisse
  in den Tabellen unten.
- `gripHinten` 1.05 wäre ruhiger gewesen, aber dann prallt der flotte Testfahrer an der Wiesenweg-Einfahrt (2794 m) in die
  Absperrung (das Auto lenkt weniger ein). Darum fängt jetzt vor allem `stabilitaet`.
- Die Fahrer-Anpassung `gasImDrift [3, 9]` in `tools/testfahrer-browser.js` bleibt: ohne sie oder mit `[5, 12]` prallt der
  flotte Testfahrer auf (geprüft).

### Teil C – Lanza 073: Klang tiefer, Lader lauter, Gänge länger
- Ton (`fahrprofile.l073.ton.motor`): `hoechstTon` 580 → **440**, `saege` 0.42 → 0.5, `puls` 0.5 → 0.45, `unter` 0.06 → 0.25,
  `bissHz` 3000 → 2300, `filterGas` 5200 → 3800, Lader `pegel` 0.075 → **0.17** (+7 dB), `faktor` 14 → **9.5** (2.2 statt 3.3 kHz),
  `gasAnteil` 0.7 → 0.85 (ohne Gas so leise wie vorher), `schaltKnallPegel` 1.1 (sonst übersteigt die Spitze die des Audan).
  `rauh` 0.4 bleibt.
- Getriebe (`fahrprofile.l073.getriebe`): `gaenge` [46, 78, 108, 136, 164] → **[48, 82, 117, 149, 188]**, `hochVollgas` **6600**,
  eigene **Drehmomentkurve** (Kompressor: voll bis 5800/min, dann fallend). Vorher lief der Lanza bei Höchsttempo mit
  **7700/min am Begrenzer**, jetzt mit **6800/min**.
- Die Gänge sind länger als der Richtwert (+5 bis 8 %): 4. Gang +10 %, 5. Gang +15 %. Bei 140 km/h Konstantfahrt zählt nur die
  Übersetzung; mit +8 % lag die Drehzahl dort 12 % über dem Audan.
- Verworfen: mehr Luftwiderstand gegen das Höchsttempo – er ändert auch das Rückwärts-Tempo, das identisch bleiben muss.

### Teil D – Subora Imprexa: Blau mit gelber Schrift, höhere Drehzahl, Tacho-Skala
- **Werk-Lack** sattes Rallye-Blau `#1d46a8`, Unterteil `#0f2150`, Schrift, Nummern, Streifen und Akzente gelb `#f5d020`,
  Heckflügel blau mit gelben Seitenteilen und gelber Kante. Nur die Farbgebung: Namen und Sponsoren bleiben erfunden
  (TALFUNK, NORDHANG, KRISTALL), keine Logos, kein Originaldekor.
- **Vierter Lack ROT** = der alte dunkelrote Werk-Lack (die Lack-Zeile der Garage blättert, vier Lacke passen).
- **Keine goldenen Felgen:** die Felgenfarbe ist für alle Autos gleich, es gibt keinen Felgen-Slot je Lackierung – laut
  Auftrag nicht umgebaut.
- Drehzahl: `nennDrehzahl` 8000, `gaenge` [48, 82, 118, 150, 190], `hochVollgas` **7800**, `hochWenigGas` 5200, `runterVollgas`
  3000, Kickdown 4800 / 7400 (an die höhere Drehzahl angepasst), Drehmoment bis 8000/min mit Zug, `zugkraftFaktor` 1.03,
  `allrad.gras` 0.99 (sonst wäre er auf der Wiese 0.08 % schneller als der Prototyp). Bei Höchsttempo **7820/min**.
- Ton: `hoechstDrehzahl` 8300, `begrenzerAb` 8200, `hoechstTon` 540 (bei 7000/min derselbe Grundton wie 0.8e, darüber steigt
  er weiter), `schaltKnallPegel` 1.1 (Spitze). Filter wie bisher (dumpf).
- **Tacho-Skala je Profil** (`tacho: { drehzahlMax, drehzahlRotAb, tempoMax }` im Fahrprofil, sonst `hud.tacho`):
  Subora 9 / rot ab 8. `js/tacho.js` malt die Zifferblätter beim Autowechsel neu (je Skala einmal, dann aus dem Vorrat).
  Alle anderen Autos pixelgleich wie 0.8e.

## Messtabellen (gerechnet, nicht gespürt / nicht gehört)

### Lanza 073: Fahrmessung gegen den Prototyp (Delto und Escorta zum Vergleich)

| Messung | Prototyp | Lanza 073 0.8e | Lanza 073 0.8f | Ziel Lanza 073 | Lanza Delto | Fard Escorta |
|---|---|---|---|---|---|---|
| 0-100 km/h Asphalt | 5.13 s | 4.60 s (-10.4 %) | 4.58 s (-10.7 %) ✅ | -13 bis -8 % | 4.91 s (-4.4 %) | 5.56 s (+8.3 %) |
| 0-100 km/h Schotter | 5.78 s | 5.47 s (-5.3 %) | 5.45 s (-5.6 %) ✅ | -6 bis 0 % | 5.37 s (-7.1 %) | 6.23 s (+7.9 %) |
| 0-100 km/h Wiesenweg | 8.28 s | 8.86 s (+6.9 %) | 8.86 s (+6.9 %) ✅ | 0 bis 10 % | 7.42 s (-10.5 %) | 9.61 s (+16.0 %) |
| 0-60 km/h Gras | 10.10 s | 10.22 s (+1.2 %) | 10.22 s (+1.2 %) ✅ | mindestens -0.05 % | 10.10 s (+0.0 %) | 10.10 s (+0.0 %) |
| 0-100 km/h Bankett | 6.15 s | 6.38 s (+3.8 %) | 6.37 s (+3.5 %) ✅ | mindestens -0.05 % | 6.26 s (+1.8 %) | 6.72 s (+9.2 %) |
| Höchsttempo (Vollgas) | 188.1 km/h | 180.4 km/h (-4.1 %) | 182.6 km/h (-2.9 %) ❌ | -8 bis -3 % | 177.9 km/h (-5.4 %) | 172.4 km/h (-8.3 %) |
| Bremsweg 100-0 Asphalt | 35.8 m | 35.6 m (-0.3 %) | 35.6 m (-0.4 %) ✅ | -6 bis 6 % | 35.6 m (-0.3 %) | 35.6 m (-0.4 %) |
| Kreis R 25 m Asphalt | 54.4 km/h | 56.0 km/h (+3.0 %) | 56.3 km/h (+3.6 %) ✅ | 3 bis 7 % | 55.4 km/h (+1.9 %) | 54.6 km/h (+0.4 %) |
| Kreis R 25 m Schotter | 49.3 km/h | 51.0 km/h (+3.5 %) | 51.2 km/h (+3.9 %) ✅ | 0 bis 5 % | 51.6 km/h (+4.6 %) | 49.3 km/h (-0.1 %) |
| Kreis R 25 m Wiesenweg | 40.9 km/h | 41.2 km/h (+0.7 %) | 41.5 km/h (+1.3 %) ✅ | 0 bis 6 % | 45.8 km/h (+11.9 %) | 41.1 km/h (+0.5 %) |
| Lenkwinkel 80 km/h auf R 60 m | 3.54 ° | 2.83 ° (-19.9 %) | 3.18 ° (-10.3 %) ✅ | -20 bis -10 % | 3.80 ° (+7.4 %) | 3.13 ° (-11.5 %) |
| Heck: Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s | -0.26 ° | 10.00 ° | 5.73 ° ✅ | 4 bis 6.5 ° | 3.17 ° | 6.29 ° |
| ... wieder eingefangen nach | 0.00 s | 1.28 s | 0.68 s ✅ | 0.3 bis 0.8 s | 0.38 s | 1.05 s |
| Vollgas in der Kurve R 80 m: Schwimmwinkel | 3.93 ° | 6.45 ° (+2.5°) | 5.59 ° (+1.7°) ✅ | 0.5 bis 2° mehr | 3.15 ° (-0.8°) | 6.35 ° (+2.4°) |
| Handbremsen-Drift Asphalt nach 0.5 s | 6.71 ° | 8.40 ° (+25.3 %) | 8.27 ° (+23.4 %) ✅ | 15 bis 35 % | 8.03 ° (+19.7 %) | 8.47 ° (+26.3 %) |
| Rückwärts Höchsttempo | 32.4 km/h | 32.4 km/h | 32.4 km/h ✅ | identisch | 32.4 km/h | 32.4 km/h |
| Rückwärts nach 1 s Asphalt | 9.4 km/h | 9.4 km/h | 9.4 km/h ✅ | identisch | 9.4 km/h | 9.4 km/h |
| Rückwärts nach 1 s Gras | 13.8 km/h | 13.8 km/h | 13.8 km/h ✅ | identisch | 13.8 km/h | 13.8 km/h |

### Lanza 073: Kontrolltests („Seifen-Test“, Tastatur-Lenkung wie im Spiel)

„Gas gehalten“ = das Gas, mit dem das Auto geradeaus das Tempo hält. K2: 0.4 s nach dem Loslassen die Gegentaste 0.2 s
antippen. K4: seitlich gerutscht = Weg quer zur eigenen Blickrichtung, aufsummiert über 3 s.

| Kontrolltest (Tastatur) | Prototyp | Lanza 073 0.8e | Lanza 073 0.8f | Ziel | Lanza Delto | Fard Escorta |
|---|---|---|---|---|---|---|
| K1 Schotter 90 km/h, voll links 1 s, dann los: grösster Schwimmwinkel | 8.27 ° | 23.80 ° | 17.55 ° ✅ | höchstens 25 ° | 16.76 ° | 20.43 ° |
| K1 ... gerade (unter 5°) nach dem Loslassen, ohne Gegenlenken | 0.39 s | 1.67 s | 1.16 s ✅ | 0 bis 1.2 s | 1.12 s | 1.76 s |
| K2 wie K1, 0.4 s nach dem Loslassen 0.2 s gegenlenken (Taste): gefangen nach | 0.39 s | 1.63 s | 1.13 s ❌ | 0 bis 0.8 s | 1.10 s | 1.72 s |
| K3 Slalom Asphalt 120 km/h (je 1 s): grösster Gierwinkel | 26.89 ° | 104.03 ° | 33.92 ° ✅ | höchstens 60 ° | 32.51 ° | 33.85 ° |
| K4 Wiesenweg 60 km/h, Vollgas, leichter Einschlag 3 s: seitlich gerutscht | 9.30 m | 17.48 m | 11.95 m ❌ | höchstens 4 m | 2.28 m | 21.28 m |

Kippschwelle `antriebHinten`: Vollgas in der Kurve zwischen 0.9 und 2.4 ohne Sprung über 1°; Heck beim Bremsen in der Kurve
jetzt glatt (1.0 bis 1.4: +6.1° bis +5.2°; in 0.8e sprang es von +7.3° bei 1.15 auf +13° bei 1.25).

### Lanza 073: Drehzahl bei gleichem Tempo gegen den Audan

| Drehzahl (U/min) | Audan | Lanza 073 0.8e | Lanza 073 0.8f | gegen Audan |
|---|---|---|---|---|
| 50 km/h Vollgas (beim Durchfahren) | 4185 | 4349 | 4128 | -1.4 % |
| 50 km/h Konstantfahrt | 4223 | 4512 | 4279 | +1.3 % |
| 100 km/h Vollgas (beim Durchfahren) | 5865 | 6404 | 5903 | +0.6 % |
| 100 km/h Konstantfahrt | 4488 | 4208 | 4613 | +2.8 % |
| 140 km/h Vollgas (beim Durchfahren) | 6251 | 5948 | 6546 | +4.7 % |
| 140 km/h Konstantfahrt | 5011 | 5975 | 5213 | +4.0 % |
| Schaltpunkte Vollgas 1-2 / 2-3 / 3-4 / 4-5 | 6631 / 6782 / 6846 / 6880 | 6599 / 6763 / 6829 / 6864 | 6318 / 6463 / 6537 / 6570 | |
| Höchsttempo (km/h) und Drehzahl dort | 189.9 / 6817 | 180.4 / 7700 | 182.6 / 6799 | |

### Motorklang der fünf Autos

| Messung | Audan | Delto | Escorta | Subora 0.8f | Lanza 073 0.8e | Lanza 073 0.8f |
|---|---|---|---|---|---|---|
| Grundton Leerlauf (Hz) | 41.6 | 33.3 | 33.3 | 33.3 | 33.3 | 33.3 |
| Grundton 5000/min (Hz) | 290 | 308 | 274 | 279 | 317 | 244 |
| Grundton 7000/min (Hz) | 462 | 517 | 424 | 434 | 554 | 420 |
| Schwerpunkt Vollgas 5000/min (Hz) | 822 | 916 | 641 | 736 | 1100 | 758 |
| Energie < 200 Hz Teillast | 7.80e-3 | 9.70e-3 | 7.40e-3 | 1.10e-2 | 5.90e-3 | 7.70e-3 |
| RMS Vollgas 5000/min | 0.213 | 0.231 | 0.195 | 0.214 | 0.191 | 0.194 |
| Lader: Tonhöhe 7000/min (Hz) | – | – | – | – | 3266 | 2216 |
| Lader: gegen Motor (dB, Vollgas) | – | – | – | – | -11.1 | -4.1 |
| Turbo-Pfeifen (Hz / RMS) | 5185 / 0.0245 | 5960 / 0.0280 | – | 4150 / 0.0161 | – | – |
| Spitze vor dem Limiter | 1.318 | 1.163 | 0.584 | 1.207 | 1.277 | 1.227 |
| Pops je Minute | 82 | 75 | 83 | 151 | 77 | 71 |

### Subora Imprexa: Fahrmessung gegen den Prototyp

| Messung | Prototyp | Subora 0.8f | Ziel |
|---|---|---|---|
| 0-100 km/h Asphalt | 5.13 | 4.92 (-4.2) ✅ | -6 bis -3 % |
| 0-100 km/h Schotter | 5.78 | 5.36 (-7.2) ✅ | -9 bis -5 % |
| 0-100 km/h Wiesenweg | 8.28 | 7.32 (-11.7) ✅ | -14 bis -9 % |
| 0-60 km/h Gras | 10.10 | 10.43 (+3.2) ✅ | mindestens -0.05 % |
| 0-100 km/h Bankett | 6.15 | 6.28 (+2.2) ✅ | mindestens -0.05 % |
| Höchsttempo (Vollgas) | 188.08 | 185.64 (-1.3) ✅ | -4 bis 0 % |
| Bremsweg 100-0 Asphalt | 35.75 | 35.60 (-0.4) ✅ | -5 bis 5 % |
| Kreis R 25 m Asphalt | 54.38 | 56.45 (+3.8) ✅ | 1.5 bis 4 % |
| Kreis R 25 m Schotter | 49.30 | 52.10 (+5.7) ✅ | 4 bis 8 % |
| Kreis R 25 m Wiesenweg | 40.91 | 45.98 (+12.4) ✅ | 9 bis 13 % |
| Lenkwinkel 80 km/h auf R 60 m | 3.54 | 3.71 (+4.8) ✅ | -3 bis 5 % |
| Heck: Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s | -0.26 | 2.96 (+3.0) ✅ | 2.5 bis 4.5 ° |
| ... wieder eingefangen nach | 0.00 | 0.33 (+0.3) ✅ | 0 bis 0.6 s |
| Vollgas in der Kurve R 80 m: Schwimmwinkel | 3.93 | 3.22 (-0.7) ✅ | höchstens 0° mehr |
| Handbremsen-Drift Asphalt nach 0.5 s | 6.71 | 7.61 (+13.5) ✅ | -15 bis 15 % |
| Rückwärts Höchsttempo | 32.40 | 32.40 (gleich) ✅ | identisch |
| Rückwärts nach 1 s Asphalt | 9.35 | 9.35 (gleich) ✅ | identisch |
| Rückwärts nach 1 s Gras | 13.79 | 13.79 (gleich) ✅ | identisch |

### Testfahrer (ganze Etappe, drei Stile; im Spiel)

| Stil | Prototyp | Audan | Delto | Lanza 073 0.8e | Lanza 073 0.8f | Subora 0.8e | Subora 0.8f |
|---|---|---|---|---|---|---|---|
| vorsichtig | 2:59.33 | 2:58.65 | 2:58.61 | 2:57.95 | 2:58.03 (−0.33 % zum Delto) | 2:58.53 | 2:58.89 (−0.24 % zum Prototyp, +0.14 % zum Audan) |
| mittel | 2:42.35 | 2:41.76 | 2:41.60 | 2:41.04 | 2:40.96 (−0.40 %) | 2:41.55 | 2:41.62 (−0.45 %, −0.09 %) |
| flott | 2:31.92 | 2:31.22 | 2:31.22 | 2:32.03 | 2:33.37 (+1.42 %) | 2:30.91 | 2:30.98 (−0.62 %, −0.16 %) |

Alle ohne Aufprall, Kontakt oder Hänger. Pace-Notes mit dem Lanza (nur gemeldet, nichts neu geschrieben): 3 Kurven ausserhalb
des Zielbereichs (0.8e: 4).

## Selbst getestet (`node tools/m8f-test.mjs --alt <0.8e>`)

- (a) Lanza-Körper: **alle bestanden** (Seitenprofil, Deckel 9.2°, Tal 4.6–6.0 cm, Flügel 1.04 m, 9 Draw Calls / 1376 Dreiecke,
  mit Flamme 10 / 1380, Scheiben-Option, Auspuff am Rohr, Masse unverändert).
- (b) Lanza fahren: **bestanden mit 3 Kompromissen** (Höchsttempo −2.93 %, K2, K4 – siehe unten); Werte-Balken neu (Grip 6 → 7).
- (c) Lanza Ton: **alle bestanden** (16 Zeilen), Drehzahl höchstens +4.7 % zum Audan, Schaltpunkte darunter.
- (d) Subora: **alle bestanden** (Lack, Kontrast 5.6:1 und 10.3:1, vier Lacke, 18 Fahrzeilen, Schaltpunkte, 7820/min bei
  Höchsttempo, Testfahrer, 11 Ton-Zeilen).
- (e) Tacho: **alle bestanden** (Prototyp, Audan, Delto, Escorta, Lanza pixelgleich mit 0.8e; 20 Wechsel, 3 Zifferblätter im Vorrat).
- (f) Unveränderlich: **alle bestanden** (Fahrmessung, Motorwerte, Ton, Textur, Geometrie bit-gleich bzw. im Rechenrauschen;
  Prototyp 2:59.33 / 2:42.35 / 2:31.92; Abkürzungen 127 / 2 / 342 / 84, auch mit Lanza und Subora; Strecke 3667.587 m;
  Pace-Notes-Tabelle, Abkürzungs-Daten, schneiden-zeiten.json unverändert).
- (g) **Regression** (alle bisherigen Tests einmal): `getriebe-`, `lenk-`, `handbremse-`, `belag-`, `rueckwaerts-`, `aufprall-`,
  `pacenotes-`, `ton-`, `ton-umgebung-`, `auto-test` bestanden; `m8c`, `m8d`, `m8e` (ohne die absichtlich geänderten
  Lanza-Ziele d/h/j) bestanden bis auf die Punkte unten. Der Gesamtlauf mit `--lang` stiess an das 2-Stunden-Limit der
  Testumgebung (m8d-test startet selbst noch einmal alle alten Tests); die restlichen Tests liefen danach einzeln.
  - **Gleich in 0.8e (nicht von M8f):** `menue-test` (Credits: der Test kennt nur SHAI-RON, in `config.js` steht seit Linos
    Commit „Update supporters list“ SHAI-RON, BENJAMIN), Pace-Notes mit dem Audan bei 1028 m ausserhalb (seit M8e bekannt),
    m8c (d) Speicher (Geometrien 113 → 112, in 0.8e genauso).
  - **Zeitkritisch, beim zweiten Lauf bestanden:** `rennablauf-test` (Countdown +0.15 s im ersten Bild, unter Last).
  - **Alte Tests angepasst (nur wegen des vierten Lacks):** `tools/m8c-test.mjs` (k) und `tools/m8e-test.mjs` (i) verlangten
    genau drei Lackierungen je Auto; jetzt drei für die alten Autos, vier für den Subora.
  - **Bildzeit** mit jedem Auto im Rahmen (9 Draw Calls je Auto). **Ladezeit** knapp über der Grenze: +69 / +82 / +32 ms in
    drei Läufen (Grenze +30, Streuung ca. ±100; 0.8e gegen sich selbst +11 ms). Einzeln getauscht ergaben Tacho/HUD +38 ms
    und config/autos −27 ms – keine klare Ursache gefunden, wahrscheinlich Streuung, aber nicht sicher.

## Was ein Ziel nicht erreicht hat (offen gemeldet)

| Ziel | erreicht | Warum |
|---|---|---|
| Lanza Höchsttempo −8 bis −3 % | **−2.93 %** | Auftrag: Drehzahl vor Höchsttempo. Damit der Lanza bei 140 km/h höchstens 5 % höher dreht als der Audan, braucht er einen 5. Gang von 188; die Drehmomentkurve bremst das Höchsttempo, aber 0.07 Punkte fehlen. Noch weniger Zug oben (7000/min 0.62) brachte dem flotten Testfahrer einen Streifkontakt. |
| K2: mit Gegenlenken gefangen in höchstens 0.8 s | **1.13 s** | Ein kurzes Gegenlenken mit der Taste ändert in diesem Fahrmodell fast nichts (Delto 1.10 s, Escorta 1.72 s); hält man die Gegentaste, pendeln **alle** Autos auf die andere Seite. Das Einfangen macht hier vor allem die Stabilität des Autos. |
| K4: Wiesenweg, Vollgas, höchstens 4 m seitlich gerutscht | **11.9 m** | Mit Vollgas rutschen auch Prototyp (9.3 m) und Escorta (21.3 m) mehr als 4 m; nur die Allradler (Audan 1.7 m, Delto 2.3 m) bleiben darunter. 0.8e: 17.5 m. |
| Gänge des Lanza +5 bis 8 % länger | **+4 bis +15 %** | 4. und 5. Gang mussten länger sein (+10 / +15 %), sonst dreht er bei 100 und 140 km/h mehr als 5 % höher als der Audan. |
| Goldgelbe Felgen für den blauen Subora | **nein** | Es gibt keinen Felgen-Slot je Lackierung; laut Auftrag nicht umgebaut. |

Die Kontrolltests K1–K4 habe ich selbst festgelegt (Tastatur-Rampe wie im Spiel, „Gas gehalten“ = das Gas, das 90 km/h
geradeaus hält). Wer sie anders liest (z. B. Vollgas in K1), bekommt andere Zahlen: mit Vollgas lag der Lanza in K1 bei
31.7° / 2.3 s (vorher), der Escorta bei 41.4° / 2.5 s.

## Ehrlich beurteilt – wo ich am unsichersten bin

1. **Fahrgefühl Lanza:** Die Messung sagt „fangbar wie Delto/Escorta“ (K1 17.6° / 1.16 s, Slalom ohne Dreher). Ob das
   für Lino immer noch „Seife“ ist, hängt viel an der **Tastatur**: sie lenkt in 0.3 s voll ein, da kommt jedes Heck. Wenn es
   mit Controller gut und mit Tastatur schlecht ist, liegt das Problem bei der Lenkung, nicht beim Auto.
2. **Lader-Pegel:** +7 dB gegenüber 0.8e, im Mittel aber noch ca. 4 dB unter dem Motor. Weil er als heller Ton um 2.2 kHz
   liegt, wo der Motor weniger Energie hat, sollte er klar herausstechen – gehört habe ich es nicht. Der Lader ist hart an
   die Drehzahl gekoppelt (Korrelation 0.998, Anstieg 33 ms), das Turbo-Pfeifen der anderen folgt dem Ladedruck (Aufbau
   0.3 bis 0.35 s) und liegt bei 4 bis 5 kHz: messbar verschieden.
3. **Lanza-Motor jetzt der tiefste:** 420 Hz bei 7000/min, knapp unter dem Escorta (424). Vielleicht schon zu dumpf –
   im Ton-Labor nachstellen (WERTE KOPIEREN).
4. **Keil-Form – sieht es nach Keil aus oder nach Kiste?** Von der Seite klar Keil: die Linie fällt vom Dach über die
   Finnen bis zum Flügel durchgehend ab, keine Pritsche mehr. Schräg von hinten wirkt das Heck noch eher breit und
   kastig (breite Kotflügel, flache Rückwand) – das ist auch beim Vorbild so, kann aber für Lino noch „Kiste“ sein. Bei 320x180 sind Tal und
   Flügelstützen nur ein bis zwei Pixel – das Heck liest sich dort vor allem über die schräge Linie.
5. **Flotter Testfahrer am Lanza:** sehr empfindlich an der Rechtskurve bei 2760 m (spätes Bremsen aus 107 km/h). Kleine
   Änderungen (4. Gang 150, 3. Gang 116/118, `gripHinten` 1.05) liessen ihn aufprallen. Die gewählten Werte sind sauber
   (0 Aufpralle), aber das ist ein schmaler Grat.
6. **Subora-Drehzahl:** Schaltet bei 7800/min (die Anzeige erreicht wegen der Nadel-Glättung ca. 7500–7770). Der Grundton
   steigt bis 8000/min auf 515 Hz; ob der Boxer dabei noch „dumpf“ wirkt, kann nur Lino sagen.

## Bilder (`screenshots/m8f/`)

- `10-lanza-seite-hinten34-vorher-08e-480x270.png`, `…-nachher-08f-480x270.png` – Lanza Seite und schräg hinten, vorher/nachher
- `11-lanza-seite-hinten34-vorher-08e-320x180.png`, `…-nachher-08f-320x180.png` – dasselbe bei 320x180 (3-fach)
- `12-lanza-vorne34-heck-oben-nachher-08f-480x270.png` – schräg vorne, Heck (Standardblick), von oben
- `20-garage-zeiger-lanza073-480x270.png`, `21-garage-subora-gewaehlt-480x270.png` – Garage mit fünf Autos (Deutsch)
- `30-subora-blau-320x180.png`, `…-480x270.png`, `…-640x360.png` – Subora in Blau-Gelb (schräg vorne, schräg hinten, Seite)
- `31-subora-vier-lacke-480x270.png` – Werk (Blau), Polar, Dunkel, Rot
- `40-tacho-audan-subora-4fach.png` – Tacho Audan (bis 8) und Subora (bis 9), 4-fach; `50-tacho-subora-110x60.png` Originalgrösse
- `m8f-l073-*.png`, `m8f-imprexa-*.png` – Spektrogramme (Motor bei 3000/5000/7000, Vergleichsfahrt, Pops, Hochschalten)
- `60-…md` bis `64-…md` – die Messtabellen oben als Dateien

## Test-Anleitung für Lino (M8f)

Am besten auf beiden Rechnern, mit Ton (Kopfhörer). Jeder Punkt ist ein Klickpfad; darunter steht, was du mir schreiben
kannst, wenn etwas nicht passt.

**1. Lanza 073 von hinten ansehen**
Hauptmenü → AUTO → Pfeil runter bis LANZA 073 (die Vorschau dreht sich). Dann `auto-labor.html` öffnen, Auto LANZA 073,
Ansichten SEITE LINKS, DREI-VIERTEL HINTEN, HECK.
- Wenn er **immer noch wie ein Pick-up** aussieht → schreib, welche Ansicht; dann senke ich den Deckel weiter oder ziehe
  die Finnen länger nach hinten.
- Wenn der **Flügel zu klein oder zu gross** wirkt → „Flügel grösser/kleiner/höher“.
- Wenn das **Tal zwischen den Kotflügeln** nicht zu sehen ist → „Kotflügel höher“.

**2. Lanza 073 fahren, Schotter, mit Tastatur**
Garage → LANZA 073 mit Leertaste wählen → STARTEN. Nach dem ersten Abzweig (ca. 800 m, Schotter): voll einlenken, Gas
stehen lassen, dann die Lenktaste loslassen.
- Wenn er sich **immer noch wegdreht** wie Seife → schreib „noch zu rutschig“ und wo (Schotter, Asphalt, Wiese, beim Bremsen).
- Wenn er **zu brav** geworden ist (Heck kommt kaum noch) → „wieder zickiger“; dann nehme ich `stabilitaet` etwas zurück.
- Wenn er beim **Bremsen in der Kurve** immer noch quer kommt → „Bremsen in der Kurve zu wild“.

**3. Lanza 073 fahren mit Controller**
Gleiche Strecke mit dem linken Stick, sanft gegenlenken, wenn das Heck kommt.
- Wenn er sich mit Controller **viel besser** anfühlt als mit Tastatur → schreib das; dann ist die Tastatur-Lenkung das Problem
  (Einschlag baut in ca. 0.3 s voll auf) und nicht das Auto.

**4. Lader hören**
Im Spiel mit dem Lanza aus dem Stand Vollgas, dann Gas weg. Vergleich: `ton-labor.html` → VERGLEICH (alle fünf Autos).
- Der Motor soll jetzt **tiefer** sein als beim Audan, darüber ein **heulender Ton** (ca. 2 kHz), der **mit der Drehzahl**
  steigt und fällt, ohne Gas fast weg.
- Wenn der Lader **zu leise** ist → „Lader lauter“; **zu schrill** → „Lader tiefer“; klingt wie **Turbo-Pfeifen** → schreib das.
- Für den Feinschliff: im Ton-Labor beim Lanza die Regler „Lader-Heulen“ verschieben und **WERTE KOPIEREN** in den Chat
  schicken (das wird M8f.1).
- Wenn der Motor jetzt **zu tief oder zu dumpf** ist → „Lanza wieder etwas heller“.

**5. Subora Farbe**
Garage → SUBORA IMPREXA. LACK: WERK ist jetzt **blau mit gelber Schrift**; mit links/rechts gibt es auch ROT (der alte Lack),
POLAR, DUNKEL. In den Einstellungen die Pixelgrösse auf 480x270 oder 640x360 stellen, dann sieht man die Schrift.
- Wenn das Blau **zu hell/zu dunkel** oder das Gelb **zu blass** ist → schreib „heller/dunkler“.
- Die Felgen sind silbern wie bei allen Autos (goldene Felgen bräuchten einen Umbau, nicht gemacht).

**6. Subora hochdrehen**
Mit dem Subora aus dem Stand Vollgas: er schaltet jetzt erst bei ca. **7800/min**, der Ton steigt bis dorthin.
- Wenn er **zu früh** oder **zu spät** schaltet → schreib die Drehzahl, die du willst.
- Wenn er sich **langsamer** anfühlt als vorher → schreib das (gemessen ist er gleich schnell wie in 0.8e).

**7. Tacho**
Mit dem Subora fahren: der Drehzahlmesser geht jetzt **bis 9**, rot ab 8. Bei allen anderen Autos bis 8 wie bisher.
- Die Ziffern 4 und 5 stehen beim Subora eng beieinander – eigene Tachos je Auto kommen in M8g.
