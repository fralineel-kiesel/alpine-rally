# Streckenformat (seit M10a, `format: 1`)

Eine Strecke ist **eine Datei** unter `strecken/` (z. B. `strecken/alpen.js`), ein ES-Modul mit **reinen Daten**:
`export default { ... }` – keine Funktionen, keine Imports, keine Rechnung. Kommentare sind erlaubt und erwünscht.

**Warum ein ES-Modul und keine `.json`:** Es lädt wie alle anderen Spieldateien (GitHub Pages, Entwicklungsserver, Node-
Werkzeuge) ohne `fetch`-Sonderfälle und darf Kommentare tragen – die Stützpunkte und Orte sind ohne Kommentare kaum lesbar.

Das Spiel lädt die Strecke so: `index.html` → `js/start.js` → `js/main.js` → … → `js/config.js` → `js/streckenlader.js`.
Der Lader holt die Datei aus dem Register (`js/strecken.js`), prüft sie schnell (`js/streckenpruefung.js`: Version und
Pflichtfelder) und stellt sie als `STRECKE` bereit. `config.js` bindet die Streckenwerte unter den alten Namen ein
(z. B. `CONFIG.nebenwege`), darum bleibt der übrige Spielcode gleich. Geht etwas schief, zeigt das Spiel eine Fehlerseite
(„STRECKE KONNTE NICHT GELADEN WERDEN“ mit Grund) statt eines leeren Bildschirms.
Eine Strecke wechselt man (seit M10b) durch Neuladen: alle Bauteile entstehen beim Laden aus genau einer Strecke. Welche,
sagt `?strecke=<id>` in der Adresse (Werkzeuge, Tests) oder sonst die Wahl im Menü ETAPPE (Browser-Speicher
`alpineRally.etappe`); Standard ist die erste Strecke im Register (Alpen). Andere Strecken lädt das Spiel nicht beim Start.

## Felder

| Feld | Inhalt |
|---|---|
| `format` | Version des Formats, heute `1` |
| `id` | Kennung der Strecke (Dateiname ohne `.js`), z. B. `'alpen'` |
| `etappe` | Kennung für Bestzeiten und letzten Lauf (`alpineRally.bestzeiten2[etappe]`), Alpen: `'passstrasse'` – **nie ändern**, sonst sind die Bestzeiten weg |
| `revision` | *(seit M10b.1, freiwillig)* Ganzzahl ab 1, fehlt = 1: Stand des Verlaufs. Bekommt eine Strecke einen neuen Verlauf, zählt man sie hoch; dann speichern Bestzeiten und letzter Lauf unter `<etappe>-r<revision>` (Finnland ab M10b.1: `finnland-r2`). Alte Zeiten bleiben im Speicher liegen, werden aber nicht mehr gezeigt. Ohne `revision` (Alpen) bleibt der Schlüssel genau `etappe` |
| `name`, `beschreibung` | `{ de, en }`, Grossbuchstaben (Pixelschrift) – Menü ETAPPE und Bestzeiten |
| `laenge` | Länge in Metern zur Kontrolle (das Spiel rechnet nach: mehr als 0.5 m daneben = Fehlerseite) |
| `seeds` | alle Zufallszahlen der Welt (Liste `SEEDS` in `js/streckenpruefung.js`): gleiche Zahl = gleiche Welt |
| `abschnitte` | `{ Name: { baeume, wald, nah, wand, voegel } }` – Bäume (1 = normal), Wald 0..1, `nah` = Bäume dürfen näher, `wand` = `'links'`/`'rechts'` Felswand, `voegel` = Vogel-Dichte für den Ton |
| `punkte` | Stützpunkte `[x, z, h]` in Metern (x Osten, z Süden, h Höhe), dazwischen Abschnitts-Namen als Text: ein Name gilt für alle Punkte danach. Weiche Kurve (Spline) durch alle Punkte |
| `strasse` | `startBeiMeter`, `zielVorEnde`, `spawnBeiMeter` |
| `checkpoints` | Streckenmeter der Tore, aufsteigend, zwischen Start und Ziel |
| `nebenwege` | Untergrund-Abschnitte: `{ name, abzweig, einmuendung, belag, … }`, Belag `asphalt`/`schotter`/`wiesenweg`, sonst Asphalt |
| `umgebung` | `farben` (Palette, Himmel, Dunst), `licht`, `nebel`, `berge`, `fernwald` (Farben), `gelaende` (Landschafts-Charakter), `landschaft` (Hügel/Senken von Hand) |
| `natur` | Baumdichte (`sprites`), Büsche (`buesche`), Kühe (`kuehe`), Waldrand-Gruppen an den Nebenwegen. *Seit M10b.1 freiwillig:* `sprites.mindestAbstand` / `sprites.waldAbstand` (so nah dürfen Bäume an die Strassenmitte, fehlt = 9 / 7.5 m wie in den Alpen; Finnland 10.5 m: auf Schotter rutscht man weiter) |
| `startZiel` | Verlängerungen hinter Start und Ziel, Bäume um Start und Ziel |
| `leben` | Leben an der Strecke (Weide, Fan-Spots, Wracks, Zäune, Herden), `an: false` = nichts |
| `beschriftung` | Fan-Banner, Wegweiser, Sponsoren (erfundene Namen, Grossbuchstaben) |
| `klang` | `publikumOrte` (Start, Ziel, je Fan-Spot), `boeenAbschnitt` (Windböen) |
| `abkuerzung` | von Hand: `immerSperren`, `immerFrei`, `sperrThemen` |
| `untergrundInfo` | *(seit M10b, freiwillig)* `{ de, en }`, Grossbuchstaben, höchstens 22 Zeichen – Kurzinfo in der Etappenwahl, z. B. `'SCHOTTER'` |
| `deko` | *(seit M10b, freiwillig)* welche Motive/Typen der Code malt: `fahne` (`schweiz`, `finnland`), `tier` (`kuh`, `rentier`), `tierKlang` (`'glocke'` oder `null`), `haus` / `stadel` (`alphuette`, `heustadel`, `holzhaus`, `holzschuppen`), `nadelbaum` (`tanne`, `kiefer`), `laubbaum` (`laub`, `birke`). Fehlt ein Wert: Standard aus `config.js` (= Alpen) |
| `sprung` | *(seit M10b, freiwillig)* markierte Kuppen `[{ s, name }]`, aufsteigend – heute ohne Wirkung, ab M10c Sprünge |
| `belagAbschnitte` | *(seit M10b, freiwillig)* Untergrund ohne Abzweig/Stummel `[{ von, bis, belag }]`. Seit M10b.1 nutzt keine Strecke das mehr (Wechsel „aus dem Nichts“); Finnland wechselt wie die Alpen über `nebenwege` |
| `wasser` | *(seit M10b, freiwillig)* `seen: [{ s, seite, lat, rx, rz, drehung, tiefe }]` (Ellipse neben der Strasse, Spiegel `tiefe` unter der Strasse), `fluesse: [{ s, breite, laenge, winkel, tiefe }]` (kreuzt die Strasse bei `s`, dort steht eine Holzbrücke) |
| `klang.wasser` | *(seit M10b, freiwillig)* Wasser-Klang an mehreren Orten `[[s, seitlich], ...]` (der nächste klingt) |
| `leben.wiesenweg.haeuser`, `.stege` | *(seit M10b, freiwillig)* weitere Häuser (`{ s, seite, lat, drehung, laenge, tiefe, hoehe, schuppen }`) und Stege am Wasser (`{ s, seite, lat, drehung, laenge, hoehe }`) |
| `erzeugt` | von Werkzeugen geschrieben, **nicht von Hand ändern**: `abkuerzungen` (`tools/abkuerzungen.mjs`), `kurvenTempo` (`tools/pacenotes-test.mjs --schreiben`), `baumfolge`, `kuhfolge` (`tools/kuhfolge-schreiben.mjs`; beide seit M10b freiwillig, nur für „eingefrorene“ Welten wie die Alpen). Passen sie nicht zur Strecke (Länge, Seed), lässt das Spiel sie weg |

Werte, die für jede Strecke gleich wirken (Grössen von Bögen, Bändern, Schildern, Physik, Belag-Katalog), bleiben in
`js/config.js`. Was berechnet wird (Pace-Notes, Leitplanken, Schilder, Minimap, Stummel), kommt aus den Regeln im Code.

## Beispiel (gekürzt)

```js
export default {
  format: 1, id: 'alpen', etappe: 'passstrasse',
  name: { de: 'PASSSTRASSE', en: 'MOUNTAIN PASS' },
  beschreibung: { de: 'ASPHALT, SCHOTTER, WIESENWEG', en: 'TARMAC, GRAVEL, MEADOW TRACK' },
  laenge: 3667.587,
  seeds: { gelaende: 1987, sprites: 4242, /* … */ },
  abschnitte: { 'Start im Tal': { baeume: 0.35, wald: 0, voegel: 0.7 }, /* … */ },
  punkte: [
    'Start im Tal',
    [0, 0, 0],
    // gerade 250 m, Steigung 0 %
    [0.0, -25.0, 0.0], [0.0, -50.0, 0.0], /* … */
  ],
  strasse: { startBeiMeter: 25, zielVorEnde: 45, spawnBeiMeter: 10 },
  checkpoints: [900, 1870, 2880],
  nebenwege: [{ name: 'Talschleife', abzweig: 800, einmuendung: 1020.5, belag: 'schotter' }, /* … */],
  /* umgebung, natur, startZiel, leben, beschriftung, klang, abkuerzung, erzeugt */
};
```

## Untergrundwechsel an Einmündungen (seit M10b.1 auch Finnland)

Ein Wechsel zwischen Asphalt und Schotter liegt immer an einer Kreuzung: Die Etappe **biegt ab** (`abzweig` = Anfang der
Abbiege-Kurve) oder **mündet ein** (`einmuendung` = Ende der Einmündungs-Kurve), die Asphaltstrasse läuft dort als
abgesperrter Stummel weiter (Absperrung, Verbots-Symbol, Richtungstafel, Pace-Note ABZWEIG/EINMÜNDUNG). Das ist der
Mechanismus der Alpen (`nebenwege`), unverändert und ohne Erweiterung: Finnland beginnt auf einer Asphaltstrasse, biegt
nach 100 m auf den Schotter ab, mündet ins Dorf ein (Asphalt mit Brücke), biegt hinter der Brücke wieder ab und mündet
kurz vor dem Ziel in die Seestrasse (Asphalt) ein. Also zwei Nebenwege mit Schotter, vier Kreuzungen.
Hinweise aus dem Bau: Die Einmündungs-Kurve darf (gemessen) höchstens ca. 40 m lang sein, sonst kommt die Pace-Note zu
früh (`pacenotes-test.mjs` (e)); ein Stützpunkt 8 m vor der Kurve hält die Spline-Kurve kurz. Bei flachen Kreuzungen (50°)
`hoeheAngleichen: [26, 46]` wie Almweg/Wiesenweg. Mit `wald` am Nebenweg (Waldrand) lässt sich der Abstand der Bäume
einstellen (`innenVorNach` = wie weit vor/nach engen Kurven die dichte Innenseite gilt; Finnland 60 m, damit zwischen
den Schenkeln einer Spitzkehre keine Abkürzung bleibt).

## Prüfen

```
node tools/strecke-pruefen.mjs strecken/alpen.js
```

Prüft alles (Pflichtfelder, Wertebereiche, Start vor Checkpoints vor Ziel, Reihenfolge, Punkte lückenlos und ohne
Sprung/Knick, bekannte Beläge und Absperrungen, Seeds, Fan-Spots mit Banner und Klang, erzeugte Daten passend).
Meldet Fehler mit Pfad (`checkpoints[2]: 3700 liegt hinter dem Ziel …`), Rückgabe 0 = in Ordnung, 1 = Fehler.
Pace-Notes stehen nicht in der Datei: Das Spiel berechnet sie aus der Geometrie (Symbole sind darum immer bekannt).

## Ansehen und abfahren (Werkzeuge, seit M10a)

Beide laden das Spiel im Headless-Chromium mit der angegebenen Datei (statt `strecken/alpen.js`), bauen die Strecke mit
den echten Regeln des Spiels und ändern nichts am Spiel.

```
node tools/strecke-karte.mjs strecken/alpen.js [--aus <ordner>]
```

Schreibt nach `/tmp/strecke-karte/` (oder `--aus`): `<id>-karte.png` (Draufsicht: Strasse mit Breite und Belag, Stummel,
Felswände, Start/Ziel, Checkpoints mit Nummer, Pace-Notes mit Kürzel wie `3R` = Stufe 3 rechts, `KEL` = Kehre links,
Abkürzungen rot/grün, enge Kurven unter 30 m rot), `<id>-profil.png` (Höhenprofil, gefärbt nach Steigung, Kuppen,
Senken, Checkpoints, Belag) und `<id>-bericht.txt` (Länge, Höhenmeter, Steigung/Gefälle, engster Radius, Anteile je
Belag, Anzahl Pace-Notes und Checkpoints). Der Bericht steht auch im Terminal.

```
node tools/strecke-abfahren.mjs strecken/alpen.js [--auto <id>] [--aus <datei.txt>]
```

Lässt den vorhandenen Testfahrer (`tools/testfahrer-browser.js`) die Etappe in drei Stilen (vorsichtig, mittel, flott)
in der echten Physik fahren. Terminal: je Stil Zeit, Zwischenzeiten, Anzahl Aufpralle/Abkommen/Wandnähe/Stillstand und
die Zeile `Gesamtzeiten: …`. Datei (Standard `/tmp/strecke-abfahren-<id>-<auto>.txt`): alle Stellen in Streckenmetern
und das höchste Tempo je Abschnitt. Rückgabe 1, wenn ein Stil nicht ins Ziel kommt. Für die Alpen trifft es die Zeiten
von `tools/testfahrer.mjs` genau (Prototyp 2:59.33 / 2:42.35 / 2:31.92).

## Streckenwahl in den Werkzeugen (seit M10b)

Alle Werkzeuge nehmen `--strecke <id oder Datei>` (Standard `alpen`): `strecke-karte.mjs`, `strecke-abfahren.mjs`,
`abkuerzungen.mjs` (Zahlen für jede Strecke, Erwartung 127 / 2 / 342 / 84 nur für die Alpen), `pacenotes-test.mjs
--schreiben`, `kuhfolge-schreiben.mjs`, `testfahrer.mjs` (über `tools/spiel-browser.mjs`). Erzeugte Daten gehen in die
gewählte Datei.

## Neue Strecke anlegen

1. Vorlage: `strecken/finnland.js` (kleiner als die Alpen) kopieren, `id`, `etappe`, Namen, `deko` ändern, Punkte und Orte
   ersetzen. Punkte bequem aus „Gerade / Kurve mit Radius“: Vorbild `tools/finnland-entwurf.mjs`.
2. Eintrag in `js/strecken.js` ergänzen.
3. `node tools/strecke-pruefen.mjs strecken/<id>.js`, Karte ansehen (`strecke-karte.mjs --strecke <id>`), abfahren, dann
   `node tools/abkuerzungen.mjs --strecke <id>` und `node tools/pacenotes-test.mjs --strecke <id> --schreiben`.
