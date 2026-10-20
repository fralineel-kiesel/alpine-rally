# M8c: Messtabelle (node tools/auto-messung.mjs)

## Fahrmessung
| Messung | prototyp | Audan | Delto | Ziel Delto | Escorta | Ziel Escorta |
|---|---|---|---|---|---|---|
| 0-100 km/h Asphalt | 5.13 s | 5.03 s (-2.1 %) | 4.91 s (-4.4 %) ✅ | -8 bis -4 % | 5.56 s (+8.3 %) ✅ | 4 bis 9 % |
| 0-100 km/h Schotter | 5.78 s | 5.45 s (-5.6 %) | 5.37 s (-7.1 %) ✅ | -11 bis -6 % | 6.23 s (+7.9 %) ✅ | 0 bis 8 % |
| 0-100 km/h Wiesenweg | 8.28 s | 7.23 s (-12.8 %) | 7.42 s (-10.5 %) ✅ | -14 bis -9 % | 9.61 s (+16.0 %) ✅ | 10 bis 20 % |
| 0-60 km/h Gras | 10.10 s | 10.10 s (+0.0 %) | 10.10 s (+0.0 %) ✅ | mindestens -0.05 % | 10.10 s (+0.0 %) ✅ | mindestens -0.05 % |
| 0-100 km/h Bankett | 6.15 s | 6.03 s (-2.0 %) | 6.26 s (+1.8 %) ✅ | mindestens -0.05 % | 6.72 s (+9.2 %) ✅ | mindestens -0.05 % |
| Höchsttempo (Vollgas) | 188.1 km/h | 189.8 km/h (+0.9 %) | 177.9 km/h (-5.4 %) ✅ | -7 bis -3 % | 172.4 km/h (-8.3 %) ✅ | -10 bis -6 % |
| Bremsweg 100-0 Asphalt | 35.8 m | 35.8 m (+0.0 %) | 35.6 m (-0.3 %) ✅ | -6 bis 6 % | 35.6 m (-0.4 %) ✅ | -5 bis 5 % |
| Kreis R 25 m Asphalt | 54.4 km/h | 55.7 km/h (+2.5 %) | 55.4 km/h (+1.9 %) ✅ | 1 bis 5 % | 54.6 km/h (+0.4 %) ✅ | -2 bis 2 % |
| Kreis R 25 m Schotter | 49.3 km/h | 51.9 km/h (+5.3 %) | 51.6 km/h (+4.6 %) ✅ | 4 bis 9 % | 49.3 km/h (-0.1 %) ✅ | -2 bis 3 % |
| Kreis R 25 m Wiesenweg | 40.9 km/h | 46.0 km/h (+12.5 %) | 45.8 km/h (+11.9 %) ✅ | 8 bis 13 % | 41.1 km/h (+0.5 %) ✅ | -2 bis 4 % |
| Lenkwinkel 80 km/h auf R 60 m | 3.54 ° | 4.14 ° (+16.9 %) | 3.80 ° (+7.4 %) ✅ | -5 bis 8 % | 3.13 ° (-11.5 %) ✅ | -15 bis -5 % |
| Heck: Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s | -0.26 ° | 3.59 ° | 3.17 ° ✅ | 3 bis 6 ° | 6.29 ° ✅ | 6 bis 10 ° |
| ... wieder eingefangen nach | 0.00 s | 0.57 s | 0.38 s ✅ | 0 bis 0.9 s | 1.05 s ✅ | 0 bis 1.2 s |
| Vollgas in der Kurve R 80 m: Schwimmwinkel | 3.93 ° | 2.77 ° (-1.2°) | 3.15 ° (-0.8°) ✅ | höchstens 0° mehr | 6.35 ° (+2.4°) ✅ | 2 bis 6° mehr |
| Handbremsen-Drift Asphalt nach 0.5 s | 6.71 ° | 6.26 ° (-6.6 %) | 8.03 ° (+19.7 %) ✅ | -20 bis 20 % | 8.47 ° (+26.3 %) ✅ | 10 bis 30 % |
| Rückwärts Höchsttempo | 32.4 km/h | 32.4 km/h | 32.4 km/h ✅ | identisch | 32.4 km/h ✅ | identisch |
| Rückwärts nach 1 s Asphalt | 9.4 km/h | 9.4 km/h | 9.4 km/h ✅ | identisch | 9.4 km/h ✅ | identisch |
| Rückwärts nach 1 s Gras | 13.8 km/h | 13.8 km/h | 13.8 km/h ✅ | identisch | 13.8 km/h ✅ | identisch |

| Testfahrer | prototyp | Audan | Delto | Escorta |
|---|---|---|---|---|
| vorsichtig | 2:59.33 | 2:58.65 (-0.4 %, Aufpralle 0, Hänger 0) | 2:58.61 (-0.4 %, Aufpralle 0, Hänger 0) | 3:00.68 (+0.8 %, Aufpralle 0, Hänger 0) |
| mittel | 2:42.35 | 2:41.76 (-0.4 %, Aufpralle 0, Hänger 0) | 2:41.60 (-0.5 %, Aufpralle 0, Hänger 0) | 2:44.02 (+1.0 %, Aufpralle 0, Hänger 0) |
| flott | 2:31.92 | 2:31.22 (-0.5 %, Aufpralle 0, Hänger 0) | 2:31.22 (-0.5 %, Aufpralle 0, Hänger 0) | 2:34.68 (+1.8 %, Aufpralle 0, Hänger 0) |
(Ziele: Delto -0.5 bis 1.5 % und nicht schneller als der Audan, Escorta 1 bis 4 %, ohne Aufprall und Hänger)

=== Werte-Balken der Garage (WERTE_VORSCHRIFT in js/autos.js) ===
AUDAN QUARTO  gemessen {"beschleunigung":7,"tempo":6,"grip":8,"drift":5}  in autos.js {"beschleunigung":7,"tempo":6,"grip":8,"drift":5} (passt)
LANZA DELTO   gemessen {"beschleunigung":8,"tempo":3,"grip":8,"drift":7}  in autos.js {"beschleunigung":8,"tempo":3,"grip":8,"drift":7} (passt)
FARD ESCORTA  gemessen {"beschleunigung":3,"tempo":2,"grip":6,"drift":10}  in autos.js {"beschleunigung":3,"tempo":2,"grip":6,"drift":10} (passt)
