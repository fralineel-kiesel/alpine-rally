# M10b – Arbeitsstand (wird nach jedem Teil nachgeführt)

Ziel: Etappenwahl im Menü + zweite Strecke „Finnland-Schotter“, Version 0.10b. Alpen bleiben exakt wie 0.10a.

## Teil A – Deko zu Daten, Format, Werkzeuge (fertig)
- `deko` in der Streckendatei (Fahne, Tier, Tier-Klang, Haus, Stadel, Nadel-/Laubbaum); Code wählt Pixelbilder:
  `js/motive.js` (Fahnen), `kuhbild.js` (Tier-Typ, neu Rentier), `pixel.js` (Kiefer, Birke), `leben.js` HAUS_TYPEN.
- Fahnen-Art in den Daten `kreuz` → `motiv` (alter Name gilt weiter). Himmel/Licht/Nebel/Fels waren schon Daten.
- Neue freiwillige Felder: `untergrundInfo`, `deko`, `sprung`, `klang.wasser`; Prüfer + Negativtests (16 neue Fälle).
- Werkzeuge: `--strecke <id|Datei>` (Karte, Abfahren, Abkürzungen, Pace-Notes --schreiben, Kuhfolge, spiel-browser).
- Messwerte Alpen gegen 0.10a: 26/26 Bilder pixelgleich, Pace-Notes 30 identisch, Strassenpunkte bit-gleich,
  Ton-Quellen + offline Klänge gleich (107 Zeilen). CONFIG gleich bis auf neue Blöcke und `kreuz`→`motiv`.
- Test: `tools/m10b-test.mjs --alt <0.10a>` (Vorlage m10a-test, Buchstaben neu: a1–a5 Alpen gleich).

## Offen / Fragen
- Kuh-Warnschild ist eine allgemeine Tier-Silhouette (bleibt auch in Finnland so).
- Teil B: Finnland-Datei, Wasser (Seen, Fluss, Brücke), Schotter ohne Abzweig (`belagAbschnitte`).
