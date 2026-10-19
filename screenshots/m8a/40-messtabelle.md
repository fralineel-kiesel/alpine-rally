# Meilenstein 8a – Messtabellen

Erzeugt mit `node tools/auto-messung.mjs` (Werte in `tools/auto-messung.json`). Physik ohne Browser, 120 Schritte pro Sekunde.
Kompromisse (❌) sind in STAND.md erklärt.

## Fahrgefühl: RT4 gegen prototyp (Tabelle B3)

| Messung | prototyp | RT4 | Unterschied | Ziel | erfüllt? |
|---|---|---|---|---|---|
| 0–100 km/h Asphalt | 5.13 s | 5.03 s | -2.1 % | ±3 % | ✅ |
| 0–100 km/h Schotter | 5.78 s | 5.48 s | -5.2 % | 5–12 % schneller | ✅ |
| 0–100 km/h Wiesenweg | 8.28 s | 7.50 s | -9.5 % | 5–12 % schneller | ✅ |
| 0–60 km/h Gras | 10.10 s | 10.10 s | +0.0 % | gleich oder langsamer | ✅ |
| 0–100 km/h Bankett | 6.15 s | 6.03 s | -2.0 % | gleich oder langsamer | ❌ Kompromiss |
| Bremsweg 100–0 Asphalt | 35.8 m | 35.8 m | +0.0 % | ±5 % | ✅ |
| Kreis R 25 m Grenztempo Asphalt | 54.4 km/h | 55.8 km/h | +2.6 % | ±3 % | ✅ |
| Kreis R 25 m Grenztempo Schotter | 49.3 km/h | 50.6 km/h | +2.6 % | +4 bis +10 % | ❌ Kompromiss |
| Kreis R 25 m Grenztempo Wiesenweg (Info) | 40.9 km/h | 44.4 km/h | +8.5 % | – | – |
| Lenkwinkel 80 km/h auf R 60 m | 3.54° | 4.10° | +15.8 % | +8 bis +20 % | ✅ |
| Heck: 90 km/h R 80 m, Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s | -0.3° | 2.3° | 2.5° | +2 bis +5° | ✅ |
| ... eingefangen nach (s) | 0.00 | 0.38 | | unter ca. 1 s | ✅ |
| Heck: dasselbe mit Vollbremsung (Info) | -0.4° | 4.4° | 4.8° | – | – |
| Vollgas in der Kurve R 80 m: Schwimmwinkel max | 3.9° | 2.9° | -25.9 % | kleiner oder gleich | ✅ |
| ... auf Schotter (Info) | 3.3° | 3.1° | -5.6 % | – | – |
| Handbremsen-Drift Asphalt: Driftwinkel nach 0.5 s | 6.7° | 6.1° | -8.8 % | ±20 % | ✅ |
| Handbremsen-Drift Schotter: nach 0.5 s (Info) | 6.1° | 5.7° | -6.6 % | – | – |
| Rückwärts Asphalt: Höchsttempo | 32.4 km/h | 32.4 km/h | +0.0 % | identisch | ✅ |
| Rückwärts Asphalt: Tempo nach 1 s | 9.35 km/h | 9.35 km/h | +0.0 % | identisch | ✅ |
| Rückwärts Gras: Tempo nach 1 s | 13.79 km/h | 13.79 km/h | +0.0 % | identisch | ✅ |

## Testfahrer: ganze Etappe und Abschnitte

| Profil | prototyp | RT4 | Unterschied | Almweg | Wiesenweg | Talschleife | Asphalt (Summe) | Aufpralle / Hänger RT4 |
|---|---|---|---|---|---|---|---|---|
| vorsichtig | 2:59.33 | 2:58.73 | -0.3 % | 20.47 → 20.45 s (-0.1 %) | 17.43 → 17.27 s (-1.0 %) | 18.50 → 18.42 s (-0.5 %) | 122.91 → 122.59 s (-0.3 %) | 0 / 0 |
| mittel | 2:42.35 | 2:41.83 | -0.3 % | 18.71 → 18.66 s (-0.3 %) | 15.58 → 15.43 s (-1.0 %) | 16.03 → 16.02 s (-0.1 %) | 112.03 → 111.71 s (-0.3 %) | 0 / 0 |
| flott | 2:31.92 | 2:31.24 | -0.4 % | 17.10 → 17.02 s (-0.4 %) | 14.50 → 14.38 s (-0.8 %) | 14.53 → 14.51 s (-0.2 %) | 105.79 → 105.33 s (-0.4 %) | 0 / 0 |

## Optik und Referenz: 0.7b gegen 0.8a (Profil prototyp)

```
Auto: 23 -> 9 Draw Calls, 412 -> 1306 Dreiecke
Szene: 122 / 113 / 81 -> 108 / 99 / 67 Draw Calls (60 / 1170 / 2900 m)
  vorsichtig: 2:59.33 -> 2:59.33 (identisch, auch Zwischenzeiten und Statistik)
  mittel: 2:42.35 -> 2:42.35 (identisch, auch Zwischenzeiten und Statistik)
  flott: 2:31.92 -> 2:31.92 (identisch, auch Zwischenzeiten und Statistik)
  Physik-Messungen prototyp: bit-genau identisch
```
