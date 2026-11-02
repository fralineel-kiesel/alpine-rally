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
Eine Strecke wechselt man (ab M10b) durch Neuladen: alle Bauteile entstehen beim Laden aus genau einer Strecke.

## Felder

| Feld | Inhalt |
|---|---|
| `format` | Version des Formats, heute `1` |
| `id` | Kennung der Strecke (Dateiname ohne `.js`), z. B. `'alpen'` |
| `etappe` | Kennung für Bestzeiten und letzten Lauf (`alpineRally.bestzeiten2[etappe]`), Alpen: `'passstrasse'` – **nie ändern**, sonst sind die Bestzeiten weg |
| `name`, `beschreibung` | `{ de, en }`, Grossbuchstaben (Pixelschrift) – Menü ETAPPE und Bestzeiten |
| `laenge` | Länge in Metern zur Kontrolle (das Spiel rechnet nach: mehr als 0.5 m daneben = Fehlerseite) |
| `seeds` | alle Zufallszahlen der Welt (Liste `SEEDS` in `js/streckenpruefung.js`): gleiche Zahl = gleiche Welt |
| `abschnitte` | `{ Name: { baeume, wald, nah, wand, voegel } }` – Bäume (1 = normal), Wald 0..1, `nah` = Bäume dürfen näher, `wand` = `'links'`/`'rechts'` Felswand, `voegel` = Vogel-Dichte für den Ton |
| `punkte` | Stützpunkte `[x, z, h]` in Metern (x Osten, z Süden, h Höhe), dazwischen Abschnitts-Namen als Text: ein Name gilt für alle Punkte danach. Weiche Kurve (Spline) durch alle Punkte |
| `strasse` | `startBeiMeter`, `zielVorEnde`, `spawnBeiMeter` |
| `checkpoints` | Streckenmeter der Tore, aufsteigend, zwischen Start und Ziel |
| `nebenwege` | Untergrund-Abschnitte: `{ name, abzweig, einmuendung, belag, … }`, Belag `asphalt`/`schotter`/`wiesenweg`, sonst Asphalt |
| `umgebung` | `farben` (Palette, Himmel, Dunst), `licht`, `nebel`, `berge`, `fernwald` (Farben), `gelaende` (Landschafts-Charakter), `landschaft` (Hügel/Senken von Hand) |
| `natur` | Baumdichte (`sprites`), Büsche (`buesche`), Kühe (`kuehe`), Waldrand-Gruppen an den Nebenwegen |
| `startZiel` | Verlängerungen hinter Start und Ziel, Bäume um Start und Ziel |
| `leben` | Leben an der Strecke (Weide, Fan-Spots, Wracks, Zäune, Herden), `an: false` = nichts |
| `beschriftung` | Fan-Banner, Wegweiser, Sponsoren (erfundene Namen, Grossbuchstaben) |
| `klang` | `publikumOrte` (Start, Ziel, je Fan-Spot), `boeenAbschnitt` (Windböen) |
| `abkuerzung` | von Hand: `immerSperren`, `immerFrei`, `sperrThemen` |
| `erzeugt` | von Werkzeugen geschrieben, **nicht von Hand ändern**: `abkuerzungen` (`tools/abkuerzungen.mjs`), `kurvenTempo` (`tools/pacenotes-test.mjs --schreiben`), `baumfolge`, `kuhfolge` (`tools/kuhfolge-schreiben.mjs`). Passen sie nicht zur Strecke (Länge, Seed), lässt das Spiel sie weg |

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

## Prüfen

```
node tools/strecke-pruefen.mjs strecken/alpen.js
```

Prüft alles (Pflichtfelder, Wertebereiche, Start vor Checkpoints vor Ziel, Reihenfolge, Punkte lückenlos und ohne
Sprung/Knick, bekannte Beläge und Absperrungen, Seeds, Fan-Spots mit Banner und Klang, erzeugte Daten passend).
Meldet Fehler mit Pfad (`checkpoints[2]: 3700 liegt hinter dem Ziel …`), Rückgabe 0 = in Ordnung, 1 = Fehler.
Pace-Notes stehen nicht in der Datei: Das Spiel berechnet sie aus der Geometrie (Symbole sind darum immer bekannt).

## Neue Strecke anlegen (für M10b)

1. `strecken/alpen.js` kopieren, `id`, `etappe`, Namen ändern, Punkte und Orte ersetzen.
2. Eintrag in `js/strecken.js` ergänzen.
3. `node tools/strecke-pruefen.mjs strecken/<id>.js`, dann die Werkzeuge für `erzeugt` laufen lassen.
