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

## Teil B – Finnland-Schotter (fertig)
- `strecken/finnland.js` (2795.7 m, gefahren 2725.7 m, 88.6 % Schotter, Asphalt nur im Dorf), Entwurf in
  `tools/finnland-entwurf.mjs`; 4 markierte Kuppen (`sprung`), CPs 800/1500/2220, 18 Pace-Notes (5 Kuppen, 1 Kehre).
- Neu im Code (für die Alpen wirkungslos): `belagAbschnitte` (Belag ohne Abzweig), `js/wasser.js` (Seen, Fluss,
  Holzbrücke mit Geländer, Gelände ausgehoben, Bäume weg vom Wasser), Häuser/Stege, Wasser-Klang an mehreren Orten.
- Testfahrer Finnland (vorsichtig / mittel / flott): Prototyp 1:52.03 / 1:40.81 / 1:33.71, Audan 1:51.80 / 1:40.44 /
  1:33.58, Delto 1:51.76 / 1:40.81 / 1:33.79, Escorta 1:52.80 / 1:41.75 / 1:47.93 (flott 3 Aufpralle),
  Lanza 073 1:51.33 / 1:56.23 / 1:54.49 (mittel/flott Aufpralle), Subora 1:51.68 / 1:40.45 / 1:33.44.
- Abkürzungen Finnland: 3 Kurven gesperrt, 3 frei (übrig 8/9/11 Linien, Gewinn bis 3–4 m), Durchkommen gesperrt 0.
- Seen näher an die Strasse gerückt (Ufer 20 m), Wald dort lichter (danach Abkürzungen neu).

## Teil C – Etappenwahl, Bestzeiten je Etappe (fertig)
- `js/etappenwahl.js`: Infos aller Strecken (andere erst beim Öffnen von ETAPPE/BESTZEITEN geladen, nur Daten),
  Vorschau-Karte (einmal gemalt), Wählen = merken (`alpineRally.etappe`) + Neuladen, danach direkt Hauptmenü auf ETAPPE.
- Seite ETAPPE: Liste (Name, Untergrund, Länge, Bestzeit), rechts Karte; Hauptmenü zeigt den Namen der Strecke.
- BESTZEITEN: Zeile „GESAMT TOP 3 ◀ ETAPPE ▶“ (Kopf + Umschalter in einer Zeile, sonst rollt die Seite).
- Kaputte andere Strecke: in der Liste „DATEI KAPUTT“; war sie gewählt: Fehlerseite + Taste = zurück zur Standard-Etappe.
- Tests (k)–(s) grün: Tastatur, Gamepad, Maus, Touch, Neuladen, getrennte Listen, Live-Vergleich, Layout 5 Grössen.

## Offen / Fragen
- Kuh-Warnschild ist eine allgemeine Tier-Silhouette (bleibt auch in Finnland so).
- Teil D: volle Regression, Bilder, Bericht, Version 0.10b. Ton nach Etappenwechsel erst ab der nächsten Eingabe.
