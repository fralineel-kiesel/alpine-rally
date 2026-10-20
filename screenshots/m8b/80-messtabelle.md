# Messtabelle M8b (node tools/m8b-messung.mjs)

| Messung | prototyp | M8a (0.8a) | M8b (jetzt) | Ziel M8b | erfüllt? |
|---|---|---|---|---|---|
| 0–100 km/h Asphalt | 5.13 | 5.03 (-2.1 %) | 5.03 (-2.1 %) | ±3 % | ✅ |
| 0–100 km/h Schotter | 5.78 | 5.48 (-5.2 %) | 5.45 (-5.6 %) | 7 bis 10 % schneller | ❌ |
| 0–60 km/h Schotter (Info, z. B. aus der Kehre) | 3.01 | 2.80 (-6.9 %) | 2.77 (-7.8 %) | – | – |
| 0–100 km/h Wiesenweg | 8.28 | 7.50 (-9.5 %) | 7.23 (-12.8 %) | 11 bis 14 % schneller | ✅ |
| 0–60 km/h Gras | 10.10 | 10.10 (+0.0 %) | 10.10 (+0.0 %) | gleich | ✅ |
| 0–100 km/h Bankett | 6.15 | 6.03 (-2.0 %) | 6.03 (-2.0 %) | nicht schneller als M8a (−2.0 %) | ✅ |
| Bremsweg 100 → 0 Asphalt | 35.75 | 35.75 (+0.0 %) | 35.75 (+0.0 %) | ±5 % | ✅ |
| Kreis R 25 m Grenztempo Asphalt | 54.38 | 55.81 (+2.6 %) | 55.73 (+2.5 %) | +1 bis +3 % | ✅ |
| Kreis R 25 m Grenztempo Schotter | 49.30 | 50.60 (+2.6 %) | 51.91 (+5.3 %) | +5 bis +8 % | ✅ |
| Kreis R 25 m Grenztempo Wiesenweg | 40.91 | 44.40 (+8.5 %) | 46.04 (+12.5 %) | +10 bis +14 % | ✅ |
| Lenkwinkel 80 km/h auf R 60 m | 3.54 | 4.10 (+15.8 %) | 4.14 (+16.9 %) | +10 bis +20 % | ✅ |
| Heck: 90 km/h, R 80 m, Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s | -0.3° | +2.3° | +3.6° | +3.5 bis +5° | ✅ |
| ... eingefangen nach (s) | -- | 0.38 s | 0.57 s | unter 0.8 s | ✅ |
| Heck: dasselbe mit Vollbremsung | -0.4° | +4.4° | +5.3° | höchstens 7° | ✅ |
| Vollgas in der Kurve R 80 m, Schwimmwinkel | 3.93 | 2.91 (-25.9 %) | 2.77 (-29.6 %) | kleiner oder gleich prototyp | ✅ |
| ... auf Schotter (Info) | 3.33 | 3.15 (-5.6 %) | 3.29 (-1.4 %) | – | – |
| Handbremsen-Drift Asphalt nach 0.5 s | 6.71 | 6.11 (-8.8 %) | 6.26 (-6.6 %) | ±15 % | ✅ |
| Handbremsen-Drift Schotter nach 0.5 s (Info) | 6.09 | 5.69 (-6.6 %) | 6.00 (-1.5 %) | – | – |
| Rückwärts Asphalt: Höchsttempo | 32.40 | 32.40 (+0.0 %) | 32.40 (+0.0 %) | identisch | ✅ |
| Rückwärts Asphalt: Tempo nach 1 s | 9.35 | 9.35 (+0.0 %) | 9.35 (+0.0 %) | identisch | ✅ |
| Rückwärts Gras: Tempo nach 1 s | 13.79 | 13.79 (+0.0 %) | 13.79 (+0.0 %) | identisch | ✅ |

| Testfahrer | prototyp | RT4 M8a (0.8a) | Audan Quarto M8b | Unterschied M8b | Asphalt-Abschnitte | Aufpralle / Hänger | Ziel |
|---|---|---|---|---|---|---|---|
| vorsichtig | 2:59.33 | 2:58.73 (-0.3 %) | 2:58.65 | -0.4 % | 122.58 s gegen 122.93 s (-0.3 %) | keine / 0 | 0.5 bis 1.5 % schneller, Asphalt ±2 % ❌ |
| … Talschleife | 18.50 s | 18.42 s | 18.42 s | -0.4 % | | | |
| … Almweg | 20.47 s | 20.45 s | 20.45 s | -0.1 % | | | |
| … Wiesenweg | 17.43 s | 17.27 s | 17.20 s | -1.3 % | | | |
| mittel | 2:42.35 | 2:41.83 (-0.3 %) | 2:41.76 | -0.4 % | 111.70 s gegen 112.03 s (-0.3 %) | keine / 0 | 0.5 bis 1.5 % schneller, Asphalt ±2 % ❌ |
| … Talschleife | 16.03 s | 16.02 s | 16.02 s | -0.1 % | | | |
| … Almweg | 18.71 s | 18.66 s | 18.66 s | -0.3 % | | | |
| … Wiesenweg | 15.58 s | 15.43 s | 15.38 s | -1.3 % | | | |
| flott | 2:31.92 | 2:31.24 (-0.4 %) | 2:31.22 | -0.5 % | 105.35 s gegen 105.79 s (-0.4 %) | keine / 0 | 0.5 bis 1.5 % schneller, Asphalt ±2 % ❌ |
| … Talschleife | 14.53 s | 14.51 s | 14.50 s | -0.2 % | | | |
| … Almweg | 17.10 s | 17.02 s | 17.03 s | -0.4 % | | | |
| … Wiesenweg | 14.50 s | 14.38 s | 14.34 s | -1.1 % | | | |
