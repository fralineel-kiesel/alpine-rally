# Alpine Rally – Stand

Aktuell: **Mini-Meilenstein 2c fertig** – raus aus dem Gras und von der Bankett-Kante: Rückwärts kommt
man jetzt auch bergauf aus der Wiese, und das Auto bleibt nicht mehr an der Kante zwischen Bankett und
Wiese hängen. Dazu alles aus 2b (Kühe, Büsche, Wald in der Ferne), 2a.1 (natürlichere Sperren,
Tempo-Tafeln), 2a (Leitplanken, Holzzäune, Schilder), 1.3b (kein Dunststreifen), 1.2 (Kurven schneiden,
Getriebe, Tachos), 1.1 (harter Aufprall) und 1 (Etappe „Passstrasse“). Das Konzept und der Fahrplan stehen
in `KONZEPT.md`.

## Steuerung

| Aktion | Tastatur | Gamepad (Xbox / PlayStation) |
|---|---|---|
| Gas | Pfeil hoch oder W | RT / R2 (analog) |
| Bremse / Rückwärts | Pfeil runter oder S | LT / L2 |
| Lenken | Pfeil links/rechts oder A/D | linker Stick |
| Handbremse | Leertaste | A / Kreuz |
| Zurück auf die Strasse | R | Start / Options |
| Neustart nach dem Ziel | R | Start / Options |
| Debug-Anzeige | F3 | – |

Tastatur und Gamepad gehen gleichzeitig, nichts einzustellen. Geschaltet wird automatisch.

---

## Mini-Meilenstein 2c: Raus aus dem Gras und von der Bankett-Kante ✅

### Was war das Problem?

1. **Rückwärts im Gras ging bergauf kaum.** Der Rückwärtsgang schiebt mit 3 m/s², das Gras bremst mit
   2.2 m/s², dazu zieht der Hang. Schon ab ca. 8 % bergauf hinter dem Auto kam man rückwärts nicht mehr
   vom Fleck. Nach einem Aufprall steht man oft genau so in der Wiese.
2. **An der Bankett-Kante blieb das Auto hängen**, wenn man langsam quer von der Strasse wegfuhr (war
   seit M1 so). **Ursache:** Die Prüfung „zu steiler Hang, da kommt das Auto nicht hoch“ verglich die
   Höhe auf dem Bankett mit der Höhe der Wiese. Das Bankett fällt nach aussen um 35 cm ab, die Wiese
   liegt 30 cm unter der Strasse – an der Kante ist also eine kleine Stufe von ca. 5 cm (an manchen
   Stellen bis 16 cm). Das Auto kommt pro Rechenschritt (1/120 s) nur ein paar Millimeter weiter. 5 cm
   Höhe auf ein paar Millimeter Weg sah für die Prüfung aus wie eine senkrechte Wand, also wurde das Auto
   zurückgeschoben – immer wieder, solange es nicht schnell genug war (je nach Stufe bis über 25 km/h).
   Die Böschung (`randSteigung`) war nicht schuld.

### Was geändert wurde

1. **Rückwärts-Schub je Untergrund** (`js/config.js`, Block `untergrund`, neuer Wert `rueckwaerts`):
   Der Rückwärtsgang schiebt auf dem Untergrund so viel mal stärker. Wirkt nur im Rückwärtsgang.

   | Untergrund | `rueckwaerts` | heisst |
   |---|---|---|
   | Asphalt | 1.0 | genau wie bisher (3 m/s²) |
   | Bankett | 1.5 | 4.5 m/s² |
   | Gras | 2.2 | 6.6 m/s² |

   Sonst ist nichts an der Fahrphysik anders. Das Höchsttempo rückwärts bleibt 6 m/s (ca. 22 km/h).
2. **Bankett-Kante** (`js/main.js`, eine Zeile): Die Hang-Prüfung misst jetzt die Steigung **im
   Gelände**: Stand das Auto vorher auf dem Bankett, nimmt sie dort die Höhe der Wiese statt die Höhe
   des Banketts. So zählt nur noch der echte Hang, nicht die kleine Stufe an der Kante. Gelände und
   Strasse sind unverändert, steile Hänge bremsen genau wie vorher.

### So testest du (abseits fahren, rückwärts rauskommen)

1. **Langsam quer von der Strasse in die Wiese** (5–25 km/h, z. B. am Start oder im Tal bei 600 m): Das
   Auto rollt jetzt einfach übers Bankett auf die Wiese, ohne an der Kante zu stoppen.
2. **Rückwärts raus, auch bergauf:** In der Wiese anhalten, so dass die Strasse **hinter** dir und
   **oberhalb** ist (z. B. in den Kehren 1400–1800 m auf der Talseite, auf der Passhöhe ab 2480 m oder
   bei 2930 m links), dann Bremse/Rückwärts halten. Das Auto fährt zügig rückwärts den Hang hinauf auf
   die Strasse.
3. **In eine Kuh oder einen Baum fahren** und rückwärts raus – geht jetzt auch, wenn es dahinter
   bergauf geht.
4. **Auf der Strasse** soll sich rückwärts **nichts** anders anfühlen als vorher.

### Wo man schrauben kann (`js/config.js`, Block `untergrund`)

- `gras.rueckwaerts` (2.2): höher = rückwärts im Gras kräftiger. **Unter ca. 1.7** kommt das Auto am
  steilsten Hang, den es überhaupt hochkommt (`grenze.steilsterHang` 0.55), nicht mehr sicher raus.
  Auf flacher Wiese erreicht man schon ab ca. 1.5 schnell das Höchsttempo rückwärts.
- `bankett.rueckwaerts` (1.5): dasselbe auf dem Bankett.
- `asphalt.rueckwaerts` (1.0): bitte so lassen, sonst ändert sich der Rückwärtsgang auf der Strasse.

### Selbst getestet

- **Neuer Test `node tools/gras-test.mjs`** (echtes Spiel im Headless-Browser):
  - **Im Gras abgestellt, Rückwärtsgang voll: 20 von 20 zurück auf dem Asphalt** (vorher 12 von 20).
    6 Mal eben (Auto gerade und 30°/50° schräg zur Strasse), 14 Mal bergauf von 5 % bis 46 % (das ist
    die steilste Stelle neben der Strecke, von der aus der ganze Weg zur Strasse höchstens so steil ist
    wie `steilsterHang`). Dauer 1.3–8.4 s, nie hängen geblieben.
  - **Reine Fahrphysik genau an der Grenze** (`steilsterHang`, Gras): nach 2 s 14 km/h rückwärts
    (vorher 0 km/h). Asphalt: auf die Tausendstel gleich wie ohne den neuen Wert.
  - **Von der Bankett-Kante mit 5, 10, 15, 20 und 25 km/h seitlich weg: 20 von 20** über die Kante und
    rückwärts zurück auf den Asphalt (vorher 14 von 20; geprüft an den 4 Stellen mit der grössten Stufe,
    15–16 cm und 7 cm).
  - **Dasselbe an allen freien Stellen der ganzen Strecke** (alle 7 m, beide Seiten, ohne Felswand und
    Hindernisse): **867 von 867** über die Kante und zurück (vorher 542 von 867 über die Kante).
  - Nicht mitgezählt: bei 1756 m links (zwischen zwei Kehren) rollt das Auto ab 15 km/h über die steile
    Böschung (über 100 %) Richtung untere Kehre. Dort kommt es absichtlich nicht mehr hoch, siehe unten.
- **Asphalt unverändert:**
  - `testfahrer.mjs`: auf die Hundertstel gleich, **2:33.24 / 2:19.11 / 2:10.41**, kein Aufprall,
    nirgends hängen geblieben.
  - `node tools/abkuerzungen.mjs --pruefen`: offene Linien **128 / 5 / 342 / 84**, unverändert.
  - `lenk-test.mjs`, `aufprall-test.mjs`, `kuh-test.mjs`, `strassenrand-test.mjs`: alle Prüfungen
    erfüllt. `getriebe-test.mjs` läuft durch (Rückwärts auf Asphalt rechnet mit Faktor 1.0, also genau wie
    vorher). Im `kuh-test` kommt das Auto nach einem Aufprall jetzt 12–20 m rückwärts raus (vorher
    2–5 m).
  - Keine Fehler in der Browser-Konsole.

### Bekannte Probleme

- **Rückwärts auf flacher Wiese ist jetzt fast so schnell wie auf der Strasse** (bis ca. 22 km/h nach
  ca. 1.5 s). Das ist der Preis dafür, dass es bergauf sicher klappt. Wenn es dir zu flott ist:
  `gras.rueckwaerts` auf 1.8 (unter 1.7 wird es am steilsten Hang knapp).
- **Steile Böschung zwischen zwei Kehren** (z. B. 1756 m links): Fährt man dort schneller als ca.
  15 km/h quer runter, rollt man über eine sehr steile Stelle und kommt nicht mehr hoch (gewollt:
  `grenze.steilsterHang`). Weiter runter zur unteren Kehre fahren oder „R“ drücken.
- Die übrigen Punkte aus 2b unten gelten weiter.

### Ideen/Vorschläge (nicht umgesetzt)

- Kleines Rüttel-/Hüpfgefühl beim Überfahren der Bankett-Kante (Kamera oder Karosserie), damit man
  spürt, dass man die Strasse verlässt.
- Rückwärts im Gras eine leichte Staubwolke / Grasbüschel, die hochfliegen (Optik, wenn die Räder
  durchdrehen).

---

## Meilenstein 2b: Leben im Gelände (Kühe, Büsche, Wald in der Ferne) ✅

### Was gebaut wurde

**1. Kühe** (neue Dateien `js/kuehe.js` und `js/kuhbild.js`, Werte in `config.js` Block `kuehe`)

- **34 Kühe** in 11 Herden (2–6 Tiere) plus ein paar Einzeltiere. 19 stehen auf den eingezäunten Weiden im
  Tal, 15 auf den Alpwiesen oben (Passhöhe, Hochweide, Zielgerade).
- Drei Fantasie-Fellarten in Schweizer Art: **braun-weiss gefleckt** (weisser Kopf), **schwarz-weiss
  gefleckt** (weisse Blesse) und **einfarbig braun** (helles Maul), jeweils mit oder ohne Hörner. Drei Posen:
  **stehend**, **grasend** (Kopf unten) und **liegend** (wiederkäuend, Kopf oben). Höhe ca. 1.4 m, Länge 2.4 m.
- **Keine Pappfiguren:** Jede Kuh hat eine eigene Blickrichtung. Je nachdem, von wo man schaut, sieht man sie
  von vorne, schräg vorne, von der Seite, schräg hinten oder von hinten – insgesamt **8 Ansichten** (wie
  bei Doom). Fährt man an einer Kuh vorbei, dreht sie sich also nicht mit, man sieht nach und nach ihre
  Seite und dann ihr Hinterteil.
- **Wie die Bilder entstehen:** Jede Kuh ist im Code aus einfachen Formen gebaut (eiförmige Teile für Rumpf,
  Hals, Kopf, Maul, Beine, Hufe, Ohren, Hörner, Schwanz). Beim Laden wird daraus für jede Ansicht ein kleines
  Pixelbild (32x24 Pixel) „abgetastet“, grob in 4 Helligkeitsstufen schattiert, mit dunkler Kante. So sitzen
  die Flecken in jeder Ansicht an derselben Stelle. Keine Bilddatei, keine Marke.
- **Wo:** Die grösste Herde steht auf der Weide hinter dem Schild „Kühe“ (rechts, ca. 830–845 m), eine
  Herde sicher auf der Alpwiese nahe der Passhöhe (rechts, ca. 2615–2622 m). Pro Herde werden ein paar
  Plätze ausgewürfelt und der genommen, den man von der Strasse aus am besten sieht (wenigste Baumkronen
  dazwischen).
- **Regeln, die nie gebrochen werden** (vom Test `tools/kuh-test.mjs` nachgerechnet):
  mindestens 8 m von jeder Strassenmitte (auch von anderen Kehren; heute nächste 14.4 m), nie auf Asphalt
  oder Bankett; hinter einem Zaun im Feld, mindestens 3.5 m weg von Zaun, Planke und Schild (heute
  nächste 6.8 m Kante zu Kante); 5 m weg von jedem Weidetor und kein Tier auf dem Weg 20 m ins Feld hinter
  dem Tor; nie auf der Innenseite der Abkürzungs-Kurven („nicht schneiden“ +20 m, „schneiden“ +50 m);
  nur wo es flach ist (höchstens 20 %) und kein Wald steht; nicht unter Baumkronen.
- **Füsse auf dem Boden:** Die Kuh steht auf dem tiefsten Punkt unter ihrem Körper (an Hängen schwebt so
  kein Bein in der Luft).
- **Aufprall:** Kreis um den Körper (0.95 m, liegend 0.75 m, mal Grösse). Wie bei einem Baum: hart zum Halt,
  dann rückwärts raus. Die Kuh bewegt sich nicht.
- **Ein Zeichenaufruf für alle Kühe.** Das Sprite-System ist dafür kaum umgebaut: Die Kühe benutzen dasselbe
  Material wie die Bäume (`spriteMaterial` in `js/sprites.js`), nur mit einem eigenen Vertex-Shader. Der
  rechnet aus dem Winkel zwischen Blickrichtung der Kuh und Kamera aus, welche der 8 Ansichten (Spalte im
  Bild) gezeigt wird. Bäume und Steine sind unverändert.

**2. Büsche und mehr Vielfalt** (`js/sprites.js` Funktion `baueDeko`, `js/pixel.js` `buschTextur`, Block `buesche`)

- **730 Büsche** in drei grünen Sorten, dazu **rosa blühende Alpenrosen** (ca. 18 %) und **niedrige
  Heidelbeer-Sträucher** mit blauen Beeren (ca. 15 %), 0.6–1.2 m hoch.
- **358 hohe Gras-/Blumenbüschel** (weiss, gelb, violett blühend) und **76 Jungtannen** (1.1–1.9 m).
- Verteilt: in Gruppen am Strassenrand (6.5–14 m), hinter Zäunen und Leitplanken, an Waldrändern (dort
  auch die Jungtannen), vereinzelt auf den Wiesen (eher Grasbüschel). Nie näher als 6 m an der Strassenmitte
  (Jungtannen 9 m, so verdecken sie keine Schilder), nicht in Weidetoren, nicht in Kühen, nicht an steilen
  Felshängen.
- **Keine Kollision** – man fährt „drüber“. Darum ändern sie nichts an den Abkürzungen.
- Büsche und Grasbüschel sind ein Bild zusammen (ein Zeichenaufruf). Die Jungtannen sind Tannen und kommen
  in den Zeichenaufruf der Tannen (kein zusätzlicher).

**3. Wald in der Ferne** (`js/world.js` Geländefarbe, `js/sprites.js` Fernbäume, Block `fernwald`)

Vorher endeten Bäume ca. 230 m neben der Strasse, dahinter war alles kahle grüne Fläche. Jetzt, in zwei
Schritten (wie im Auftrag):
1. **Geländefarbe:** Ab ca. 140 m neben der Strasse (voll ab 230 m) wird das Gelände nach **denselben
   Waldstücken** eingefärbt, nach denen nahe der Strasse die Tannen stehen: Wald dunkles, fleckiges
   Tannengrün, Wiese etwas heller, an Hängen ein paar graue Geröllflecken. Kostet beim Zeichnen nichts.
   Weiter weg (ab 250 m, voll ab 600 m) sind die Talflanken bewaldeter als der Talboden an der Strasse –
   im Tal stehen an der Strasse nur 35 % der Bäume, die Hänge dahinter sollen trotzdem nach Wald aussehen.
2. **Fernbäume:** Weil die Farbe allein am Horizont flach wirkte (siehe Screenshot `10`), dazu **6 283
   grosse Tannen** (12–22 m) zwischen ca. 200 und 900 m neben der Strasse, nur an Waldstellen, an Hängen
   etwas mehr. Sie stehen im Boden des groben Geländes (weit weg wird nur das gezeichnet), sind etwas
   dunkler und haben keine Kollision. Sie kommen in den Zeichenaufruf der Tannen (kein zusätzlicher).
   Übergang weich: Die Fernbäume werden ab 200 m langsam dichter (die nahen Bäume dort langsam dünner),
   zwischen 700 und 900 m hören sie langsam auf, dahinter ist nur noch die Geländefarbe.

### So testest du

| Wo | Was |
|---|---|
| Start (0–100 m), links | Herden auf der Weide hinter dem Zaun (ca. 25–30 m und 70 m) |
| 612 m rechts | Schild „Kühe“, dahinter (ca. 830–845 m rechts) die grösste Herde (6 Tiere) |
| 810–860 m links | weitere Herde |
| Talabschnitt, von oben/hinten | Hänge links und rechts bewaldet statt kahl |
| Kehren (1350–1855 m) | Büsche, Jungtannen; von oben: Wald geht weich über die 230 m hinaus |
| ca. 2615 m rechts | Herde auf der Alpwiese nahe der Passhöhe (liegende und grasende Tiere) |
| 2780–2840 m links, Zielgerade | weitere Kühe auf der Hochweide |

Bitte ausprobieren:
1. **Kühe von nahem ansehen** (z. B. durchs Weidetor fahren oder am Start links aufs Feld): Erkennst du
   sie als Kühe? Drehen sie sich beim Vorbeifahren „richtig“ (Seite, dann Hinterteil)? Flackern sie?
2. **In eine Kuh fahren:** harter Halt, dann rückwärts raus (seit 2c auch bergauf im Gras).
3. **Fernwald:** Achte auf Hänge und Horizont, z. B. am Start, in den Kehren und an der Passhöhe. Wirkt
   der Wald glaubhaft oder wie aufgemalt? Siehst du irgendwo noch eine Kante, wo der Wald aufhört?
4. **FPS mit F3** auf beiden Rechnern (besonders am Start und in der Weide bei 700 m).

### Wo man schrauben kann (`js/config.js`)

Block `kuehe`:
- `an` (false = keine Kühe), `seed` (andere Zahl = andere Kühe), `anzahl` (34), `herde` ([2, 6]),
  `einzeln` (3), `anteilTal` (0.6 = 60 % im Tal).
- `posen` ([0.45, 0.35, 0.2] = Anteil stehend, grasend, liegend), `groesse`, `gleicheRichtung`.
- Abstände: `abstandStrasse` (8), `abstandZaun` (3.5), `abstandTor` (5) / `torTiefe` (20),
  `abstandBaum`, `abstandKuh`, `herdenAbstand` (45 m zwischen Herden).
- Wo: `weideTiefe` (3–25 m hinter dem Zaun), `alpAb` (Strasse höher als 120 m = Alpwiese), `alpBreite`
  (10–30 m neben der Strasse), `passBei` (2586: dort steht sicher eine Herde), `sichtVersuche` (4).
- `maxSteigung` (0.2), `maxWald` (0.25), `radius` / `radiusLiegend` (Kollision).
- **Wichtig:** Nach einer Änderung im Block `kuehe` stehen die Kühe anders. Dann
  `node tools/abkuerzungen.mjs --pruefen` und `node tools/kuh-test.mjs` laufen lassen.

Block `buesche`:
- `an`, `seed`, `mindestAbstand` (6), `hoehe` ([0.6, 1.2]), `grasHoehe`, `jungHoehe` ([1.1, 1.9]).
- Wie viele: `randGruppenProKm` (Gruppen am Strassenrand), `zaunProKm` (hinter Zäunen/Planken),
  `waldrandProKm` (Waldrand, mit Jungtannen), `wieseProKm` (Wiese). Höher = mehr.
- `blueten` (0.18 Alpenrosen), `beeren` (0.15 Heidelbeeren), `maxSteil` (0.6).

Block `fernwald`:
- `faerben` (false = Gelände wie früher), `farbeAb` ([140, 230]), `dichteAb` ([250, 600]).
- Farben: `waldFarbe`, `waldDunkel`, `wiesenFarbe`, `geroellFarbe`; `waldStaerke` (1.0),
  `wiesenStaerke` (0.35), `geroell` (0.74, höher = weniger Geröllflecken).
- Fernbäume: `baeume` (false = keine), `baeumeProKm` (6500 Versuche; höher = dichter, kostet Dreiecke),
  `von`/`voll`/`aus`/`bis` (200/270/700/900 m), `hoehe` ([12, 22]), `hang` (1.4), `helligkeit`.

### Selbst getestet

- **Abkürzungen** (`node tools/abkuerzungen.mjs --pruefen`, vorher und nachher): **gleich.** Offene Linien
  128 / 5 / 342 / 84, gesperrte Kurven 0. Sogar **genau dieselben 559 Linien** sind offen (Vergleich mit
  `--offen-merken` vorher/nachher). `js/abkuerzungen.js` wurde nicht angefasst.
- **`testfahrer.mjs`:** auf die Hundertstel gleich (2:33.24 / 2:19.11 / 2:10.41), kein Aufprall, nirgends
  hängen geblieben.
- **`kuh-test.mjs` (neu), alle Prüfungen erfüllt:** Das Auto fährt von der Strasse her mit 40 km/h in jede
  Kuh, bei der der Weg frei ist (20 Anfahrten an 12 Kühen, auch liegende, mittig und 0.6 m versetzt):
  jedes Mal die Kuh getroffen, nach 0.4 s 0 km/h (hart zum Halt), nie im Hindernis stecken geblieben
  (0.00 m), jedes Mal rückwärts raus (mehr als 2 m in 4 s). Dazu: alle Regeln oben für jede Kuh, Füsse
  nicht über dem Boden, Büsche/Jungtannen/Fernbäume ohne Kollision, Büsche ≥ 6 m von der Strasse und
  ≤ 1.2 m hoch, Jungtannen < 2 m, Fernbäume ≥ 199 m von jeder Strasse, gleicher seed = gleiche Kühe.
- `aufprall-test.mjs`, `strassenrand-test.mjs`, `lenk-test.mjs`: alle Prüfungen erfüllt,
  `getriebe-test.mjs` läuft durch. Keine Fehler in der Browser-Konsole.
- **Leistung** (Software-Grafik ohne Grafikkarte, Kamera hinter dem Auto, `node tools/m2b-bilder.mjs`):

  | Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
  |---|---|---|
  | Start (12 m) | 112 → 114 | 107 922 → 122 884 |
  | Weide im Tal (700 m) | 88 → 90 | 121 918 → 136 880 |
  | Kehren (1400 m) | 72 → 74 | 115 376 → 130 338 |
  | Passhöhe (2586 m) | 79 → 81 | 104 860 → 119 822 |
  | Ziel (3560 m) | 53 → 55 | 78 352 → 93 314 |

  Schlimmste Stelle beim Durchlauf alle 50 m: 116 → **118** Zeichenaufrufe, 131 146 → **146 108** Dreiecke.
  Also überall **+2 Zeichenaufrufe** (Kühe, Büsche) und **+14 962 Dreiecke** (Budget: +6 und +40 000).
  Die Dreiecke sind überall gleich viele mehr, weil Sprites immer alle gezeichnet werden (ein Viereck = 2
  Dreiecke pro Kuh, Busch, Fernbaum). Die meisten davon sind Fernbäume (6 283 x 2).
- **Ladezeit** (`node tools/ladezeit.mjs <alte Version> 7`: alt und neu abwechselnd je 7 Mal, gemessen im
  Spiel bis die Welt fertig ist): vorher **1 041 ms**, nachher **1 198 ms** (Median) = **+157 ms**
  (Budget +300). Davon Kühe ca. 50 ms (Kuh-Bilder ca. 30 ms), Büsche + Fernbäume ca. 50–70 ms, der Rest
  ist die Geländefarbe.
- **FPS auf echten Rechnern kann ich hier nicht messen** (nur Software-Grafik). Bitte mit F3 auf beiden
  Rechnern nachsehen.
- **Screenshots** (1280x720, ohne HUD) unter `screenshots/m2b/`: `a` = vorher, `b` = nachher, gleiche
  Kamera. `01` Start, `02` Weide im Tal hinter dem Auto, `03` Weide seitlich (Herde hinter dem Schild),
  `04` Kehren hinter dem Auto, `05` Kehren von oben, `06` Passhöhe, `07` Alpwiese seitlich, `08` Abfahrt,
  `09` Ziel, `10` Tal von oben, `11` Passhöhe von oben, `12b-kuh…` Nahaufnahmen von Kühen (vorne,
  schräg, Seite, hinten; liegend und grasend). Neu erzeugen: `node tools/m2b-bilder.mjs --endung b`
  (vorher: `--wurzel <alte Version> --endung a`).
- **Ehrlich zur Optik:**
  - Die **Kühe** sehen aus der Nähe (5–15 m) wirklich nach Kühen aus, auch von vorne und hinten, und die
    Ansichten passen zusammen. Beim normalen Fahren sind sie aber **klein** (eine Kuh 25 m weg ist im
    320x180-Bild nur ca. 8 Pixel hoch) – man erkennt Herden und Fellfarben, Details nicht. Die braunen
    Kühe gehen auf der Wiese etwas unter.
  - Der **Fernwald** wirkt von oben und am Horizont deutlich besser als vorher (Bild `10`, `05`: vorher ein
    Baumband entlang der Strasse mit kahler Fläche dahinter, jetzt Waldstücke und Wiesen an den Hängen).
    Die eingefärbten Waldflächen ganz weit weg (hinter 900 m, ohne Bäume) sind etwas „weich“ und können
    aus der Höhe wie aufgemalt wirken. Aus der Fahrersicht fällt das kaum auf.
  - **Büsche** bringen Abwechslung am Strassenrand, sind aber bewusst klein und dezent.
  - Zu viel ist es meiner Meinung nach nicht; eher könnte es noch etwas mehr Kühe nahe der Strasse geben.

### Bekannte Probleme

- **Kühe hinter 45 m sind nicht erreichbar:** Die unsichtbare Grenze (`grenze.maxAbstand`) gilt weiter.
  Heute stehen alle Kühe näher.
- **Ansicht springt:** Die Kuh wechselt die Ansicht in 45°-Schritten (wie bei Doom). Fährt man genau auf
  einer Grenze, kann sie einmal hin- und herspringen.
- **Auf Hängen sind die Hufe manchmal leicht im Gras versteckt** (bis ca. 20 cm), weil die Kuh auf dem
  tiefsten Punkt unter dem Körper steht und das Bild eine flache Tafel ist. Dafür schwebt nie ein Bein.
- **Zwei Büsche stehen auf der Böschung zwischen zwei Kehren** (bei 1400 m rechts, vor dem Fels). Dort
  lagen schon vorher Steine; glaubhaft, aber nicht schön.
- **Weit weg ohne Bäume** (hinter 900 m) gibt es nur Farbe; aus grosser Höhe wirkt das weich/aufgemalt.
- Die Weide 270–430 m rechts hat heute keine Kühe (Zufall). Mit einem anderen `kuehe.seed` ändert sich das.

### Ideen/Vorschläge (nicht umgesetzt)

- **Kuhglocke / Muhen** als Ton, lauter, je näher man an einer Herde ist.
- **Tiere, die sich leicht bewegen:** Kopf heben/senken beim Grasen, Schwanz schwingen, ab und zu ein paar
  Schritte gehen (neue Posen im selben Bild).
- **Alphütten und Heustadel** als einfache Low-Poly-Gebäude auf den Alpwiesen und an den Weiden.
- **Gleiten an Leitplanken** (aus M2a, weiter offen): flach an die Planke = entlangschrammen statt bremsen.
- Mehr Kühe näher an der Strasse (z. B. eine Weide ohne Zaun direkt am Bankett mit Viehgatter), damit man
  sie beim Fahren grösser sieht.
- Fernwald noch weiter hinaus mit „Waldstück“-Sprites (eine Gruppe Tannen in einem Bild), falls der
  Horizont aus der Höhe zu weich wirkt.

---

## Meilenstein 2a.1: Sperren natürlicher, mehr Schilder ✅ (Verlauf, Stand damals)

### Was war das Problem?

Die gesperrten Kurven („nicht schneiden“) waren zugemauert: Jede Sperre bestand aus vielen Reihen, und
jede Reihe mischte Felsen, Tannen und Stämme. In den Kehren laufen diese Reihen alle in die Mitte der
Kehre zusammen, darum lagen dort Stämme in Felsen und alles dicht an dicht. **Ursache: alles gemischt und
zu dicht.**

### Was geändert wurde

**Teil 1: Sperren** (`js/sperren.js`, `config.js` Block `sperren`)

1. **Ein Thema pro Kurve.** Die Reihen einer Kurve werden zusammen geplant (gleiche Seite, weniger als
   40 m auseinander = eine Kurve). Jede Kurve bekommt **eine** Sorte. Nachbarkurven bekommen nie dieselbe.
   Die Wahl kommt aus dem festen Zufall (`seed`), lässt sich aber pro Kurve von Hand setzen.

   | Kurve | Thema | Reihen vorher → nachher | Teile vorher → nachher | stecken ineinander vorher → nachher |
   |---|---|---|---|---|
   | 1350–1415 links (Kehre 1) | **Stämme** | 5 → 3 | 27 → 4 (4 Stämme in 3 Stapeln) | 63 → 0 |
   | 1496–1562 rechts (Kehre 2) | **Tannen** | 7 → 3 | 31 → 8 (8 Tannen) | 48 → 0 |
   | 1789–1854 rechts (Kehre 4) | **Felsen** | 5 → 4 | 25 → 9 (6 Brocken, 3 kleine Steine) | 58 → 0 |
   | 3196–3234 links (Schikane) | **Stämme** | 1 → 1 | 4 → 3 (1 Stapel aus 3 Stämmen) | 1 → 0 |

   („Teile“ = Felsbrocken, Stämme, Tannen und kleine Steine. Vorher waren es in jeder Kehre 2–6 Felsen,
   6–9 Stämme und 12–13 kleine Steine durcheinander. „stecken ineinander“ = Paare von Teilen, deren
   Umrisse sich überschneiden.)
2. **Viel weniger dicht.** Statt 18 Reihen gibt es noch **11**. Eine Reihe reicht jetzt 2 m statt 4 m
   über die tiefste Abkürzung hinaus (`reserve`). Und: Was schon steht, zählt für die Kette mit – auch
   Bäume und Steine aus der Landschaft. Treffen sich zwei Reihen in der Kehre, teilen sie sich die Teile,
   statt nebeneinander je eine eigene Mauer zu bauen. Lücken zwischen Teilen sind erlaubt, aber nie
   grösser als 1.4 m (das Auto ist 1.8 m breit).
3. **Nichts steckt ineinander.** Beim Planen hält jedes Teil Abstand zu allen anderen Teilen und zu den
   Bäumen/Steinen der Landschaft (sichtbare Grösse plus 20 cm, `abstandTeile`). Passt ein Teil nicht,
   wird es verschoben, kleiner gemacht, gedreht oder ein Stamm gekürzt. Gezählt: **0** Teile ineinander.
4. **Mehr Abwechslung:** Felsen liegen in lockeren Gruppen (ab und zu ein kleinerer Brocken daneben,
   dazu 2–4 kleine Steine). Tannen stehen in Gruppen, vorne an der Strasse junge, kleine Tannen (die
   Kronen hängen nicht über die Strasse), weiter hinten grosse. Stämme liegen schräg, mal einzeln, mal
   2 oder 3 gestapelt, lieber lang als hoch gestapelt.
5. **Welche Kurven gesperrt sind, bleibt genau gleich** (`nichtSchneiden` / `schneiden` unverändert, die
   Pace-Notes aus M4 hängen daran). `js/abkuerzungen.js` wurde neu erzeugt, aber **nur die Liste
   `sperren`** (die Reihen innerhalb der 4 gesperrten Kurven), mit dem neuen Modus
   `node tools/abkuerzungen.mjs --nur-reihen --offen tools/abkuerzungen-offen-m2a.json`. Die Datei
   `tools/abkuerzungen-offen-m2a.json` merkt sich, welche Abkürzungen vor M2a.1 offen waren: Alles, was
   damals zu war, muss wieder zu sein, und was offen war, muss offen bleiben.

**Teil 2: Schilder** (`js/strassenrand.js`, `js/pixel.js`, `config.js` Block `strassenrand.schilder`)

- **5 Tempo-Tafeln** (rund, weiss, roter Rand, schwarze Zahl, ohne Landes- oder Markenzeichen). **Reine
  Optik, kein Tempolimit.** Sie werden aus der Strecke abgeleitet (Kurvenfolgen und Krümmung):

  | Wo | Tafel | Warum |
  |---|---|---|
  | 85 m rechts | 80 | Talabschnitt (kurz nach dem Start) |
  | 1206 m **links** | 60 | vor der Kehrengruppe (50 m vor der Doppelkurve-Warnung) |
  | 1915 m rechts | 80 | nach den Kehren wieder aufheben |
  | 3061 m **links** | 50 | vor der engen Schikane, **unter** der Doppelkurve-Warnung am selben Pfosten |
  | 3423 m rechts | 80 | nach der Schikane wieder aufheben |

  Wunsch war „rechts“. Zweimal ging das nicht: Vor den Kehren ist rechts bis 1280 m Sperrzone der
  freien Kurve 1085–1230 („schneiden“ + 50 m Puffer) und danach zu nah an der Kehren-Nummer; vor der
  Schikane steht rechts die Felswand. Dann kommt die Tafel unter die Kurvenwarnung (wenn man diese gut
  sieht) oder auf einen eigenen Pfosten links.
- **2 weitere Schilder** im Talabschnitt (rotes Dreieck wie die anderen Warnungen):
  - **„Kreuzung“** (280 m rechts): 60 m vor dem ersten offenen Weidetor (340 m), dort mündet ein Feldweg.
  - **„Kühe“** (612 m rechts): vor der Wiese mit den meisten Zäunen im Tal (735–870 m), bereitet M2b vor.
- **Keine Schilderwälder:** Neue Schilder stehen mindestens 60 m von jedem anderen Schild weg (beide
  Strassenseiten). Ausnahme: Tempo-Tafel und Kurvenwarnung derselben Stelle (bewusst gepaart).
- **Sichtbar:** Neue Schilder werden nur dort aufgestellt, wo von 30 m davor keine Baumkrone im Weg ist.
- **Alle Schilder 20 % grösser** (`groesse: 1.2`), Warn-Dreieck jetzt 1.56 m, Tempo-Tafel 1.08 m.
- Wie bisher: nichts auf der Fahrbahn, nichts in Abkürzungs-Sperren und nichts auf der Innenseite der
  Abkürzungs-Kurven.

### So testest du

| Wo | Was |
|---|---|
| Kehre 1 (1350–1415 m, links) | nur umgefallene Stämme, 3 Stapel |
| Kehre 2 (1496–1562 m, rechts) | nur Tannen, vorne kleine |
| Kehre 4 (1789–1854 m, rechts) | nur Felsbrocken mit ein paar kleinen Steinen |
| Schikane (3196–3234 m, links) | ein Stapel Stämme |
| 85 m, 1206 m, 1915 m, 3061 m, 3423 m | Tempo-Tafeln 80, 60, 80, 50 (unter der Warnung), 80 |
| 280 m / 612 m rechts | Schild „Kreuzung“ / „Kühe“ |

Bitte ausprobieren:
1. Erkennt man in jeder Kehre ein Thema? Wirkt es natürlich oder nur anders künstlich?
2. **Versuch, die gesperrten Kehren zu schneiden** (vor allem zwischen den Teilen durch). Es sollte nirgends
   gehen. Wenn doch: Stelle (Kilometertafel/Meter) und Screenshot schicken.
3. Sind die Schilder jetzt gut zu sehen? Zu gross?

### Wo man schrauben kann (`js/config.js`)

Block `sperren`:
- `themen` – **Thema pro Kurve von Hand**, z. B. `{ 1350: 'fels', 1496: 'staemme', 1789: 'baeume' }`
  (Schlüssel = ein Streckenmeter in der Kurve; `'fels'`, `'staemme'` oder `'baeume'`). Leer = Zufall
  (`seed`). Heute: 1350 Stämme, 1496 Tannen, 1789 Felsen, 3196 Stämme.
- `beimischung` – in der ersten Tannen-Kurve dürfen 20 % Felsbrocken sein (heute zufällig 0). `anteil: 0`
  = ganz rein.
- Dichte: `luecke` (0.3–1.2 m zwischen den Teilen), `abstandTeile` (0.2 m Luft), `felsBegleit`,
  `begleitSteine`, `baumBegleit`, `stammStapel`, `stammLaenge`.
- **Wichtig:** Nach jeder Änderung im Block `sperren` stehen die Teile anders. Dann
  `node tools/abkuerzungen.mjs --pruefen` laufen lassen; meldet es Durchkommen in gesperrten Kurven,
  `node tools/abkuerzungen.mjs --nur-reihen --offen tools/abkuerzungen-offen-m2a.json`.

Block `strassenrand.schilder`:
- `groesse` (1.2) – alle Schilder grösser (1.0 = wie M2a, höchstens 1.25).
- `tempo.an` (false = keine Tempo-Tafeln), `tempo.tal` / `kehren` / `eng` / `aufheben` (80 / 60 / 50 / 80),
  `tempo.engRadius` (30 m: Kurven enger als das gelten als enge Passage), `tempo.max` (6), `tempo.groesse`
  (0.9 m Durchmesser, mal `groesse`).
- `talSchilder` (false = keine Schilder „Kühe“ und „Kreuzung“), `abstandNeu` (60 m).

### Selbst getestet

- **Abkürzungen** (`node tools/abkuerzungen.mjs --pruefen`, vorher und nachher):

  | Kurve | Liste | übrig vorher → nachher |
  |---|---|---|
  | 1350–1415 links | nicht schneiden | 0 → 0 |
  | 1496–1562 rechts | nicht schneiden | 0 → 0 |
  | 1789–1854 rechts | nicht schneiden | 0 → 0 |
  | 3196–3234 links | nicht schneiden | 0 → 0 |
  | 482–752 links | schneiden | 128 → 128 Linien, bis 7.1 m |
  | 1085–1230 rechts | schneiden | 5 → 5 Linien, bis 3.2 m |
  | 1643–1708 links | schneiden | 342 → 342 Linien, bis 6.3 m |
  | 2484–2710 links | schneiden | 84 → 84 Linien, bis 5.1 m |

  Es sind sogar genau dieselben Linien offen wie vorher (Vergleich mit `tools/abkuerzungen-offen-m2a.json`).
  Grösste Lücke in einer Sperre: 1.22 m (Auto 1.8 m). Nächster sichtbarer Teil zur Strassenmitte:
  Felsbrocken 5.72 m, Stämme 5.78 m, Tannenstamm 6.45 m (Bankett endet bei 5.5 m).
- **Schilder** (vorher 28 Pfosten / 29 Tafeln, nachher 34 Pfosten / 36 Tafeln): 12 Chevrons,
  4 Kehren-Nummern, 3 Doppelkurve, 2 Steinschlag, 1 Gefälle, 7 Kilometertafeln (alles wie vorher), neu
  5 Tempo-Tafeln (3× 80, 1× 60, 1× 50), 1× Kühe, 1× Kreuzung.
- **Leistung** (Software-Modus ohne Grafikkarte, hinter dem Auto):

  | Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
  |---|---|---|
  | Tal (100 m) | 107 → 108 (neue Schilder) | 110 688 → 109 182 |
  | Kehre 1 (1352 m) | 105 → 105 | 132 658 → 131 110 |
  | Kehren (1475 m) | 70 → 66 | 96 476 → 94 300 |
  | Schikane (3175 m) | 64 → 64 | 98 190 → 96 656 |

  Durchlauf alle 50 m: höchstens +2 Zeichenaufrufe (bei 610 m, wegen des Schilds „Kühe“), Dreiecke nirgends
  mehr als vorher.
- `testfahrer.mjs`: Zeiten auf die Hundertstel gleich (2:33.24 / 2:19.11 / 2:10.41), kein Aufprall,
  nirgends hängen geblieben. `aufprall-test.mjs`, `strassenrand-test.mjs`, `lenk-test.mjs`: alle
  Prüfungen erfüllt, `getriebe-test.mjs` läuft durch. Keine Fehler in der Konsole.
- **Screenshots** (1280x720, ohne HUD) unter `screenshots/m2a-1/`: `a` = vorher, `b` = nachher.
  `01`–`04` jede gesperrte Kurve hinter dem Auto und schräg von oben, `05` Kehre 2 von oben,
  `06b` jedes neue Schild aus 20 m, `07b` Tempo-Tafel aus 15, 30 und 45 m.
  Neu erzeugen: `node tools/sperren-bilder.mjs --endung b` (vorher: `--wurzel <alte Version> --endung a`).
- **Ehrlich zur Optik:** Pro Kurve erkennt man ein Thema, und nichts steckt mehr ineinander. Am
  natürlichsten wirkt die Tannen-Kehre (sieht aus wie ein Wäldchen). Die Felsen-Kehre wirkt wie Geröll,
  locker, eher etwas klein von weitem. Die Stämme-Kehre ist ok, die Stapel liegen aber sternförmig zur
  Mitte der Kehre (das kommt von der Geometrie: alle Reihen zeigen in die Mitte der Kehre). Der Stapel
  in der Schikane sieht eher nach Holzbeige (gesägt, gestapelt) als nach umgefallenem Baum aus.

### Bekannte Probleme

- **Zahl auf der Tempo-Tafel erst ab ca. 15–19 m lesbar**, nicht aus 40–50 m. Im 320x180-Bild ist die
  Tafel aus 15 m ca. 12 Pixel gross (Zahl gut lesbar), aus 20 m ca. 9 Pixel (gerade noch), aus 30 m ca.
  6 Pixel (roter Punkt mit grauer Mitte), aus 45 m ca. 4 Pixel. Damit man die Zahl aus 40–50 m liest,
  müsste die Tafel etwa 3 m gross sein – das wäre Fantasiegrösse, darum nicht gemacht. Aus der Ferne
  erkennt man: „rundes Schild mit rotem Rand“.
- **60 und 50 stehen links** statt rechts (Gründe siehe oben).
- **Die Doppelkurve-Warnung bei 1256 m links** (aus M2a) steht hinter Bäumen und ist kaum zu sehen. Darum
  hängt die 60 nicht an diesem Pfosten, sondern steht 50 m davor. Die Warnung selbst habe ich nicht
  verschoben (war nicht Teil des Auftrags).
- **Die Sperren hängen am festen Zufall.** Jede Änderung am Block `sperren` oder an `js/sperren.js`
  stellt die Teile anders auf; danach muss die Prüfung laufen (siehe „Wo man schrauben kann“).
- **Voller Neulauf von `tools/abkuerzungen.mjs`** (ohne `--nur-reihen`) würde heute eine 5. freie Kurve
  melden (1876–1955 m, eine einzige Linie mit 3.7 m Gewinn), die früher zufällig von einer Sperre
  mit zugemacht wurde. Mit `--nur-reihen` bleibt alles wie es war. Darum: für Sperren immer `--nur-reihen`.

### Ideen/Vorschläge (nicht umgesetzt)

- Die versteckte Doppelkurve-Warnung bei 1256 m an eine besser sichtbare Stelle setzen (rechts ab 1281 m,
  zusammen mit der 60 an einem Pfosten).
- Tempo-Zahl aus grösserer Entfernung: eine eigene, schärfere Textur nur für Schilder (andere
  Mipmap-Stufe). Kostet einen Zeichenaufruf mehr pro Stück, wäre aber ohne Fantasiegrösse.
- Ein einzelner langer umgefallener Baum mit Wurzelteller (statt gesägter Stämme) für die Stämme-Kurven.
- Kühe-Schild und Kühe aus M2b zusammen platzieren (Kühe auf der Weide hinter dem Schild).
- Pace-Notes (M4) könnten die Tempo-Tafeln aus `strassenrand.plan.schilder.tempo` lesen.

---

## Meilenstein 2a: Strassenrand (Leitplanken, Holzzäune, Schilder) ✅ (Verlauf, Stand damals)

### Was gebaut wurde

Alles wird beim Laden **automatisch aus der Strecke abgeleitet**, nichts ist von Hand pro Kurve gesetzt
(neue Datei `js/strassenrand.js`, Werte in `js/config.js`, Block `strassenrand`).

1. **Leitplanken** (insgesamt ca. 1.2 km, 9 Stücke): durchgehendes Band aus verzinktem Wellblech, dunkle
   Pfosten alle 4 m, an jedem 3. Pfosten ein kleiner Reflektor (rechts orange, links weiss). Sie stehen
   - auf der **Talseite**, wo das Gelände hinter der Planke stark abfällt (mind. 3 m auf 8 m),
   - **aussen in allen vier Kehren** (und 15 m davor/danach).
   Am Anfang und Ende taucht die Planke schräg ins Gelände ab (kein abgeschnittenes Stück). Kürzer als
   15 m gibt es nicht. Eine Lücke (Zufahrt, ca. 9 m) bei ca. 2400 m.
2. **Holzzäune** (ca. 870 m, 16 Stücke): Pfosten alle 2.5 m, 2 oder 3 Latten, leicht schief, ab und zu
   fehlt eine Latte, hängt eine runter oder steht ein Pfosten schief. Nur an Wiesen (wenig Wald, keine
   Felswand, keine Planke), **abwechselnd links oder rechts**, nur selten auf beiden Seiten. Genau **50 %**
   der Wiesenstrecke haben einen Zaun. 5 **Weidetore** (4–6 m Lücke mit dickeren Torpfosten, 4 davon mit
   offenem, ins Feld gedrehtem Tor). Hinter einem Tor steht nie ein Baum oder Stein.
3. **Schilder** (28 Stück, bewusst wenige):
   - 3 **Kurvenwarnungen** ca. 100 m vor den engen Kurvenfolgen, alle als „Doppelkurve“: vor dem Waldstück
     (678 m), vor den Kehren (1256 m, links, weil rechts kein freier Platz war) und vor der Schikane in der
     Abfahrt (3061 m, links, weil rechts die Felswand ist). Abgeleitet aus der Krümmung der Strecke.
   - 4 **Kehren-Nummern** (blaue Tafel, 1–4) kurz vor jeder Kehre, aussen.
   - 12 **Richtungstafeln (Chevrons)**, je 3 aussen in jeder Kehre (rot mit weissem Pfeil).
   - **Steinschlag** vor beiden Felswänden; vor der Abfahrt hängen **Gefälle** und Steinschlag
     übereinander am selben Pfosten (2828 m).
   - 7 **Kilometertafeln** bei 0.5, 1.0 … 3.5 km (Streckenmeter ab Strassenanfang, passt später zu
     Pace-Notes/Minimap).
   Die Schilder sind kleine Tafeln aus Formen (keine Sprites), weil sie zur Strasse schauen müssen und
   nicht zur Kamera. Sie sind in groben Pixeln gezeichnet, damit sie im kleinen Bild lesbar bleiben.
4. **Kollision**: Planke, Zaun, Torpfosten, offenes Tor und Schilderpfosten sind Hindernisse (Kreise
   alle 0.6–0.7 m). Es gilt die bestehende Aufprall-Physik, die habe ich **nicht verändert**.
5. **Vorbereitet für M3**: Der Abstand zur Strassenmitte kommt aus der Funktion `randAbstand(s, seite)`
   in `js/strassenrand.js`. Heute liefert sie fest 6.0 m. Wird die Strasse in M3 je Abschnitt breiter
   oder anders, wandern Planken, Zäune und Schilder automatisch mit.

### Regeln, die nie gebrochen werden

- Nichts auf der **Felswand-Seite**.
- Nichts auf der **Innenseite der Abkürzungs-Kurven** („nicht schneiden“ +20 m Puffer, „schneiden“
  +50 m Puffer). Ob man abkürzen kann, entscheidet weiterhin nur die Spielbalance aus M1.2.
  `js/abkuerzungen.js` wurde **nicht** neu erzeugt.
- Nichts bei den Checkpoint-Toren (±8 m) und nichts nahe an einem anderen Ast der Strecke (z. B. in den
  Kehren an der Strasse darüber).

### So testest du (wo man was sieht)

| Wo | Was |
|---|---|
| Start (0–100 m) | Zaun links mit einer Tor-Lücke bei 50 m |
| Talabschnitt (270–430 m, 735–870 m) | Zaun rechts mit offenem Tor bei 340 m, später auf beiden Seiten |
| 500 m rechts | Kilometertafel 0.5 |
| 678 m rechts | Warnschild „Doppelkurve“ vor dem Waldstück |
| 1256 m links | Warnschild vor den Kehren |
| Kehren (1350–1855 m) | Leitplanken aussen und an der Talseite, Kehren-Nummern 1–4, je 3 Chevrons |
| Felswand 1 (1880–2480 m) | Steinschlag-Schild links bei 1854 m, Leitplanke rechts über dem Tal, Lücke bei 2400 m |
| Passhöhe (2600–2920 m) | Zäune auf der Hochweide, ein offenes Tor |
| 2828 m rechts | Gefälle + Steinschlag übereinander vor der Abfahrt |
| Abfahrt (2950–3400 m) | Leitplanke links über dem Tal, Doppelkurve-Warnung vor der Schikane |
| Zielgerade | Zaun rechts mit offenem Tor |

Bitte ausprobieren:
1. Wirkt es nach Alpenpass? Zu viel, zu wenig, zu gleichförmig?
2. **Absichtlich in eine Planke fahren:** frontal oder steil (ab ca. 60° zur Planke) = harter Stopp wie an
   einem Baum. Flach (15–30°) schrammt man entlang und verliert 15–40 % Tempo. Fühlt sich das gut an?
3. Durch ein Weidetor ins Feld fahren (z. B. bei 340 m rechts).
4. FPS mit F3 auf beiden Rechnern.

### Wo man schrauben kann (`js/config.js`, Block `strassenrand`)

- `abstand` (6.0) – Abstand der Planken-Vorderkante zur Strassenmitte. Zäune stehen `zaun.versatz` (0.35 m)
  dahinter, Schilder `schilder.versatz` (1.0 m) dahinter.
- `seed` (77) – anderer Wert = andere Verteilung der Zäune, Tore und kaputten Latten.
- `planke.an` / `zaun.an` / `schilder.an` – ganz ausschalten.
- `planke.abhangHoehe` (3) / `abhangWeite` (8) – ab wie viel Abfall eine Planke kommt. Kleiner = mehr Planken.
- `planke.hoehe` (0.75), `pfostenAbstand` (4), `reflektorAlle` (3), `zufahrtAlle` / `zufahrt` (Lücken).
- `zaun.quote` (0.55) – Anteil der Wiese mit Zaun (heute ergibt das 50 %), `beideSeiten` (0.15),
  `torAlle` / `tor` / `torOffen` (Weidetore), `latteFehlt` / `latteHaengt` / `pfostenSchief` (kaputte Stellen).
- `schilder.chevrons` – **false = keine Richtungstafeln.** In `KONZEPT.md` steht „Mag nicht:
  Kurvenpfeil-Schilder“, der Auftrag wollte sie aber ausdrücklich. Falls sie dich stören: ein Wort ändern.
- `schilder.warnRadius` (80) – Kurven enger als das bekommen eine Warnung. `warnVor` (80–120 m).
- `schilder.kmAlle` (500), `warnGroesse` (1.3 m), `chevronGroesse`, `kehreGroesse`, `kmGroesse`.
- `sichtweite` (550) – weiter weg werden Randstücke nicht gezeichnet (sind dort kleiner als ein Pixel).

### Selbst getestet

- **Screenshots** (1280x720, ohne HUD) unter `screenshots/m2a/`: `a` = vorher, `b` = nachher für Start,
  Talabschnitt (2x), Kehren hinter dem Auto, Kehren von aussen, Kehre 1, Felswand, Passhöhe, Abfahrt,
  Schikane, Ziel. Dazu Nahaufnahmen `12b`–`16b` (Doppelkurve, Kehre 1 mit Chevrons, Gefälle+Steinschlag,
  offenes Weidetor, Kilometertafel). Neu erzeugen: `node tools/strassenrand-bilder.mjs --endung b`.
- **Leistung** (Software-Modus ohne Grafikkarte, Kamera hinter dem Auto):

| Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
|---|---|---|
| Start | 109 → 112 | 106 874 → 109 442 |
| Talabschnitt (300 m) | 109 → 113 | 129 048 → 132 666 |
| Kehren (1475 m) | 63 → 70 | 93 078 → 96 476 |
| Kehre 1 (1352 m) | 99 → 105 | 130 672 → 132 658 |
| Felswand (2150 m) | 98 → 103 | 112 384 → 114 886 |
| Passhöhe (2586 m) | 74 → 79 | 102 480 → 106 404 |
| Abfahrt (3080 m) | 63 → 68 | 98 028 → 100 252 |
| Ziel (3560 m) | 51 → 53 | 77 108 → 78 444 |

  Schlimmste Stelle beim Durchlauf alle 50 m über die ganze Strecke: **+9 Zeichenaufrufe** (bei 710 m)
  und **+4 428 Dreiecke** (bei 2460 m). Der ganze Strassenrand hat 14 180 Dreiecke in 26 Stücken.
- **Ladezeit** (je 5 Mal abwechselnd alt/neu geladen, Median): vorher 1 688 ms, nachher 1 665 ms, also
  kein messbarer Unterschied. Der Strassenrand selbst braucht beim Laden ca. 70–90 ms.
- `node tools/strassenrand-test.mjs` (neu) – **alle Prüfungen erfüllt**:

| Aufprall (80 km/h, Winkel zur Planke) | Tempo direkt danach | 0.4 s danach |
|---|---|---|
| Leitplanke 15° (streifen) | 75 → 65 km/h | 50 km/h |
| Leitplanke 30° | 78 → 49 km/h | 31 km/h |
| Leitplanke 45° | 79 → 23 km/h | 13 km/h |
| Leitplanke 60° / 75° | 79 → 1–2 km/h | 0 km/h |
| Holzzaun 30° / 60° (70 km/h) | 68 → 44 / 69 → 2 km/h | 31 / 0 km/h |
| Kilometertafel 30° / 60° (60 km/h) | → 1 km/h | 0 km/h |

  Danach jedes Mal 6–7 m rückwärts raus (beim Schild 2.6–5.9 m), nirgends steckengeblieben (0.00 m im
  Hindernis). Durch ein offenes Weidetor fährt man ohne Aufprall 30 m ins Feld. Durch die Lücke in der
  Planke kommt man bis an die unsichtbare Abhang-Grenze (siehe unten). Keine Fehler in der Konsole.
- **Abkürzungen unverändert** (Test + `node tools/abkuerzungen.mjs --pruefen`, vorher und nachher gleich):

| Kurve | Liste | Planke/Zaun/Schild innen | Abkürzungen übrig vorher → nachher |
|---|---|---|---|
| 1350–1415 links | nicht schneiden | keine | 0 → 0 |
| 1496–1562 rechts | nicht schneiden | keine | 0 → 0 |
| 1789–1854 rechts | nicht schneiden | keine | 0 → 0 |
| 3196–3234 links | nicht schneiden | keine | 0 → 0 |
| 482–752 links | schneiden | keine | 128 → 128 Linien, bis 7.1 m |
| 1085–1230 rechts | schneiden | keine | 5 → 5 Linien, bis 3.2 m |
| 1643–1708 links | schneiden | keine | 342 → 342 Linien, bis 6.3 m |
| 2484–2710 links | schneiden | keine | 84 → 84 Linien, bis 5.1 m |

  (Mit 20 m Puffer hatte ein Zaun bei 773 m eine einzige lange Abkürzung 599–799 m zugemacht, darum
  haben die „schneiden“-Kurven jetzt 50 m Puffer.)
- `node tools/testfahrer.mjs` – Zeiten **auf die Hundertstel gleich** wie vorher (vorsichtig 2:33.24,
  mittel 2:19.11, flott 2:10.41), kein Aufprall, nirgends hängen geblieben. Der flotte Fahrer kommt
  höchstens 4.8 m neben die Mitte, die Planke steht bei 6.0 m.
- `aufprall-test.mjs`, `lenk-test.mjs`: alle Prüfungen erfüllt. `getriebe-test.mjs` läuft durch.

### Bekannte Probleme

- **Schilder sind klein.** Im 320x180-Bild ist ein Warnschild ca. 10–20 Pixel gross. Das Symbol erkennt
  man nur aus der Nähe, von weitem sieht man vor allem das rote Dreieck. Grösser machen geht mit
  `warnGroesse`, wirkt dann aber schnell wie ein Spielzeug.
- **Leitplanke aus der Ferne / von oben** (Bild `05b`) kaum zu sehen. Hinter dem Auto ist sie gut sichtbar.
- **Lücke in der Planke an der Felswand** (2400 m): Man fährt in die Lücke, wird aber 0.6 m dahinter von
  der unsichtbaren Abhang-Grenze gestoppt (gab es vor M2a schon überall am Abhang). Wirkt wie eine
  Ausweichstelle, nicht wie eine Zufahrt.
- **Schon vorher da, jetzt gefunden:** Fährt man langsam (unter ca. 25 km/h) quer von der Strasse weg,
  bleibt das Auto an manchen Stellen an der Bankett-Kante hängen (z. B. bei 89 m links). Die Prüfung
  „zu steiler Hang“ hält die 5 cm Stufe vom Bankett aufs Gras für eine Wand. Das hat nichts mit den Zäunen
  zu tun (in der alten Version genau gleich), ist aber beim Weidetor-Test aufgefallen. Nicht geändert.
- Zwei Stellen mit Zaun auf beiden Seiten (803–870 m und 2835–2923 m) wirken kurz wie ein Korridor.
  Wenn es stört: `zaun.beideSeiten` auf 0.
- Auf der Felswand-Strecke zwischen 1945 und 2070 m steht rechts keine Planke, weil das Gelände dort
  ansteigt statt abfällt. Das ist richtig so, sieht aber lückenhaft aus.

### Ideen/Vorschläge (nicht umgesetzt)

- **Gleiten an Leitplanken:** Flach (15–30°) an die Planke kostet heute 15–40 % Tempo, wie an einem
  Baumstamm. Auf echten Pässen schrammt man an der Planke entlang. Man könnte für Planken eine eigene,
  kleinere Reibung nehmen (frontal bliebe es ein harter Stopp).
- Bankett-Kante: die Hang-Prüfung erst ab ein paar Zentimetern Stufe greifen lassen (siehe oben).
- Zufahrten nur dort, wo man wirklich wegfahren kann (mit kleinem Feldweg aus Schotter, passt zu M3).
- Leitpfosten (weiss-schwarze Pfosten mit Reflektor) an Stellen ohne Planke, typisch für Schweizer Pässe.
- Pace-Notes (M4) könnten die Kurvenwarnungen und Kilometertafeln direkt aus `strassenrand.plan` nehmen.

---

## Meilenstein 1.3b: Dunst-Korrektur ✅ (Verlauf, Stand damals)

### Was war das Problem?

Nach M1.3 lag zwischen den Bergen und den Bäumen/der Wiese immer noch ein schmaler, milchiger Streifen
ohne Struktur – nur grünlich statt hellblau. Ursache: Der Dunst war noch zu dicht. Fernes Gelände
(ab ca. 400–500 m, wo keine Bäume mehr stehen) wurde zu 60–80 % Dunstfarbe und sah aus wie eine
Nebelschicht. In einer klaren Alpenszene wirkt so eine Schicht immer wie ein Fehler, egal in welcher
Farbe.

### Was geändert wurde

Nur vier Zahlen in `js/config.js`, Block `nebel` – keine neue Logik:

| Wert | vorher | jetzt | Bedeutung |
|---|---|---|---|
| `nebel.ende` | 1000 | 3000 | hier ist der Dunst am dichtesten (Meter) |
| `nebel.maxDichte` | 0.8 | 0.45 | so dicht wird der Dunst höchstens |
| `nebel.bergDunst` | 0.2 | 0.15 | Dunst auf den Gipfeln |
| `nebel.bergDunstUnten` | 0.6 | 0.3 | so viel Dunst kommt am Bergfuss dazu |

Der Dunst macht jetzt nur noch eine leichte Tiefenwirkung. Die Berge setzen direkt auf grünen Hügeln
auf. Bergfuss = 0.15 + 0.3 = 0.45 = `maxDichte`, damit passt der Bergfuss weiterhin zum fernen
Gelände. Nicht verändert: `nebel.start` (120), Dunstfarbe `#aabdc8`, `gelaende.feinBis` (480),
Bergformen.

### So testest du

1. **Start, Kehren (ca. 1400 m), Passhöhe (ca. 2590 m), Zielgerade:** Zwischen Bergen und Gelände
   sollte kein milchiger Streifen mehr sein. Die grünen Hügel laufen bis an die Bergfüsse.
2. Wirken die Berge noch nach Alpen (helle Gipfel)? Oder sind die Bergfüsse zu dunkel/grau?
3. Wirkt es zu klar, so als fehle die Tiefe? Dann `maxDichte` ein wenig höher (siehe unten).

### Wo man schrauben kann (alles in `js/config.js`, Block `nebel`)

- `ende` (3000) – wo der Dunst am dichtesten ist. Kleiner = dunstiger.
- `maxDichte` (0.45) – wie dicht der Dunst höchstens wird. **Je höher `maxDichte`, desto eher entsteht
  wieder ein Dunststreifen.** Lieber in kleinen Schritten (0.05) drehen.
- `bergDunst` (0.15) – Dunst auf den Gipfeln. Höher = Berge blasser und weiter weg.
- `bergDunstUnten` (0.3) – zusätzlicher Dunst am Bergfuss. `bergDunst` + `bergDunstUnten` sollte etwa
  `maxDichte` sein. Wirken die Bergfüsse zu dunkel: in 0.05er-Schritten höher.

### Selbst getestet

- Vorher/Nachher-Screenshots (1280x720, ohne HUD) an Start, Kehren (1400 m), Passhöhe (2586 m) und
  Ziel (3600 m): `screenshots/m1-3b/` (`a` = vorher, `b` = nachher). Der milchige Streifen ist an
  **allen vier Stellen weg**. Am deutlichsten an der Zielgeraden (dort war er am breitesten) und am
  Start.
- Gipfel bleiben weiss/hell, die Bergflanken grau, die Füsse grau-grün. Zum Vergleich auch
  `bergDunstUnten` 0.35 ausprobiert: kaum ein sichtbarer Unterschied, darum bei 0.3 geblieben.
- Himmel am Horizont passt weiterhin (gleiche Dunstfarbe, nichts verändert).
- **Leistung** (Software-Modus), vorher → nachher genau gleich, es sind ja nur Werte:

| Stelle | Zeichenaufrufe | Dreiecke |
|---|---|---|
| Start | 109 → 109 | 106 874 → 106 874 |
| Kehren (1400 m) | 65 → 65 | 114 670 → 114 670 |
| Passhöhe (2586 m) | 74 → 74 | 102 480 → 102 480 |
| Ziel (3600 m) | 51 → 51 | 77 108 → 77 108 |

- `node tools/testfahrer.mjs` – Zeiten auf die Hundertstel gleich (2:33.24 / 2:19.11 / 2:10.41), kein
  Aufprall. `node tools/aufprall-test.mjs` – alle Prüfungen erfüllt. Keine Fehler in der
  Browser-Konsole.

### Bekannte Probleme

- Der Wald hört weiterhin ca. 230 m neben der Strasse auf, dahinter kahle grüne Hügel. Mit weniger
  Dunst sieht man das noch etwas besser. Gehört zu Meilenstein 2 (dichtere Landschaft).
- Die Bergfüsse sind jetzt grau-grün statt weisslich. Falls dir das zu dunkel ist: `bergDunstUnten`
  etwas höher (siehe oben).

---

## Meilenstein 1.3: Horizont-Dunst ✅ (Verlauf, Stand damals)

### Was war das Problem?

Zwischen den Hintergrund-Bergen und dem Wald lag ein flaches, hellblaues Band – wie eine Nebelwand.
**Ursache (bestätigt, Linos Vermutung stimmt):** Der Dunst auf dem Gelände war ab 420 m Entfernung zu
**100 %** dicht. Das Gelände reicht aber je nach Blickrichtung 1100 bis 3000 m weit. Alles dahinter
wurde darum eine einfarbige hellblaue Fläche. Die Berge haben ihren Dunst anders bekommen (eigene
Einfärbung, die danach noch von der Sonne aufgehellt wurde) und waren am Fuss weisslich-grau. So
entstand die Abfolge „grüner Wald → flaches Hellblau → grauer Berg“.

Nachgeprüft mit Ein-/Ausschalten: Nebel aus → Band weg; Himmel aus → Band bleibt; Gelände aus → nur
noch Dunstfarbe. Nur den Nebel weiter weg zu schieben reicht nicht: Irgendwo ist das Gelände immer
weiter weg als das Nebel-Ende, dort wäre es wieder ganz hellblau (darum wurde Linos Versuch mit 120/850
nur dünner).

### Was geändert wurde

1. **Dunst weiter weg und nie ganz dicht.** Der Dunst beginnt jetzt bei 120 m (vorher 70 m), ist bei
   1000 m am dichtesten (vorher 420 m) und deckt **höchstens 80 %** ab (vorher 100 %). Ferne Hügel
   werden zum Horizont hin heller und blauer, bleiben aber leicht grün – keine flache Fläche mehr.
   Bäume, Steine, Sperren und Strasse bekommen genau denselben Dunst.
2. **Dunstfarbe etwas dunkler:** `#aabdc8` statt `#b9c8d6`. Drei Varianten verglichen (`#aabdc8`,
   leicht grünlich `#a6bcbf`, heller `#b3c3cc`). Die grünliche machte die Berge „matschig“, die
   hellere sah fast aus wie vorher. Der Himmel unten am Horizont nimmt dieselbe Farbe, das Blau oben
   bleibt.
3. **Bergfüsse passen zum fernen Gelände.** Die Berge bekommen ihren Dunst jetzt gleich wie das
   Gelände (erst Sonne, dann Dunst in genau derselben Farbe), am Fuss so dicht wie das ferne Gelände.
   Ihr unterster Teil ist dunkelgrün (bewaldet) und geht nach oben in Fels über, die Gipfel bleiben
   weiss. Form und Anzahl der Berge sind genau gleich wie vorher.
4. Schritt 5 aus dem Auftrag (zusätzliche Vorgebirgs-Kämme) war **nicht nötig**.
5. Technisch nötig: Bis wohin das Gelände fein gezeichnet wird, hing bisher am Nebel-Ende. Mit 1000 m
   wäre das viel mehr Arbeit für die Grafikkarte geworden. Jetzt ist es ein eigener Wert
   (`gelaende.feinBis`, 480 m wie vorher). Geprüft: Ob fein oder grob, unterscheidet sich auf der
   ganzen Strecke um höchstens 43 von 57 600 Bildpunkten (einzelne Pixel an Hügelkanten), kein
   sichtbares „Ploppen“.

### So testest du

1. **Start:** Hinter der Startlinie bis zu den Bergen schauen. Kein hellblauer Streifen mehr, die
   Hügel laufen grün-dunstig bis an die Bergfüsse?
2. **Kehren (ca. 1400 m)** und **Passhöhe (ca. 2590 m):** Wirkt der Horizont noch nach Alpen (weisse
   Gipfel gut sichtbar)? Ist es zu klar oder zu dunstig?
3. **Zielgerade:** Hier war das Band am stärksten. Jetzt grüne Hügel, die zum Berg hin dunstiger werden.
4. Beim Fahren: Tauchen Bäume, Steine oder Sperren irgendwo „aus dem Nichts“ auf? (Sollte nicht: sie
   werden immer alle gezeichnet und stehen höchstens 230 m neben der Strasse.)
5. **FPS (F3)** auf beiden Rechnern wie bisher.

### Wo man schrauben kann (alles in `js/config.js`)

- `nebel.start` (120) / `nebel.ende` (1000) – wo der Dunst beginnt und wo er am dichtesten ist (Meter).
  Kleiner = dunstiger, mehr Tiefe; grösser = klarer Tag.
- `nebel.maxDichte` (0.8) – wie dicht der Dunst höchstens wird. **1 = alter Zustand mit Band.** Tiefer
  (z. B. 0.65) = Ferne grüner und klarer.
- `farben.dunst` (`#aabdc8`) – Dunstfarbe (gilt für Gelände, Bergfüsse und Himmel am Horizont).
- `nebel.bergDunst` (0.2) – Dunst auf den Gipfeln. Höher = Berge blasser und weiter weg.
- `nebel.bergDunstUnten` (0.6) – so viel Dunst kommt zum Bergfuss dazu. Bergdunst + das hier sollte
  etwa `maxDichte` sein, sonst passt der Bergfuss nicht zum fernen Gelände.
- `farben.bergFuss` (`#3f6a30`) und `berge.fussBis` (0.3) – Farbe des bewaldeten Bergfusses und bis zu
  welchem Anteil der Berghöhe er reicht.
- `gelaende.feinBis` (480) – bis so weit wird das Gelände fein gezeichnet (Leistung).

### Selbst getestet

- Vorher/Nachher-Screenshots (1280x720) an Start, Kehren (1400 m), Passhöhe (2586 m) und kurz vor dem
  Ziel, dazu die Kehren von oben: `screenshots/m1-3/` (`a` = vorher, `b` = nachher). Das Band ist an
  allen Stellen weg.
- **Leistung**, alte und neue Version direkt nacheinander (Software-Modus ohne Grafikkarte):

| Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
|---|---|---|
| Start | 109 → 109 | 106 874 → 106 874 |
| Kehren (1400 m) | 65 → 65 | 114 670 → 114 670 |
| Passhöhe (2586 m) | 74 → 74 | 102 480 → 102 480 |
| Ziel | 51 → 51 | 77 108 → 77 108 |

  FPS gleich (5–7 im Software-Modus, schwankt je Lauf gleich stark wie vorher), Ladezeit gleich
  (ca. 1.0–1.2 s). **Echte FPS bitte mit F3 auf beiden Rechnern prüfen.**
- Sichtweite von Hindernissen: Bäume, Steine und Sperren haben **keine eigene Sichtweite**, sie werden
  immer alle gezeichnet (bis 9000 m Kamera-Sichtweite). Sie stehen höchstens 230 m neben der Strasse
  und sind jetzt sogar früher und klarer zu sehen als vorher.
- `node tools/testfahrer.mjs` – Zeiten **auf die Hundertstel gleich wie in M1.2** (vorsichtig 2:33.24,
  mittel 2:19.11, flott 2:10.41), kein Aufprall, nirgends hängen geblieben.
- `node tools/aufprall-test.mjs`, `getriebe-test.mjs`, `lenk-test.mjs` – laufen durch, alle Prüfungen
  erfüllt.
- Spiel startet ohne Fehler in der Browser-Konsole.

### Bekannte Probleme

- ~~**Zielgerade:** Der ferne Hügelkamm ist dort ein ziemlich gleichmässiger grau-grüner Streifen vor
  dem Berg.~~ **Behoben in M1.3b** (weniger Dunst, jetzt grüne Hügel bis an den Berg). Die Berge sind
  dort weiterhin sehr nah und gross.
- Weil die Ferne jetzt klarer ist, sieht man, dass der Wald ca. 230 m neben der Strasse aufhört. Die
  Hügel dahinter sind kahl grün (gut sichtbar in `05b-kehren-von-oben-nachher.png`).
- Ein paar einzelne Pixel an Hügelkanten in 480 m Entfernung können beim Fahren minimal springen
  (Wechsel fein/grob, siehe oben). Falls du es siehst: `gelaende.feinBis` höher (kostet Leistung).
- Die Gipfel sind etwas heller/dunstiger als vorher (der Dunst wird jetzt anders gerechnet). Zu blass?
  → `nebel.bergDunst` tiefer, z. B. 0.1.

### Ideen/Vorschläge (nicht umgesetzt)

- Ferne Waldflächen auf den Hügeln (z. B. dunkelgrüne Flecken im Gelände oder sehr einfache
  Fern-Bäume), damit der Wald nicht bei 230 m aufhört.
- Leichter Farbverlauf im Dunst je nach Sonnenrichtung (zur Sonne hin heller/wärmer).
- Hintergrundberge an der Zielgerade etwas weiter weg oder niedriger, damit sie nicht so wandartig
  wirken.
- Später für Wetter/Tageszeit: `nebel.start/ende/maxDichte` und `farben.dunst` je Wetter umschalten
  (z. B. Föhn = klar, Regen = dicht).

---

## Meilenstein 1.2: Kurven schneiden, Lenken, Schalten, Tachos ✅ (Verlauf, Stand damals)

### Was neu ist

**1. Sperren nur noch in 4 von 9 Kurven**
- Vorher standen in **allen 9** Kurven, in denen man abkürzen konnte, Sperren (29 Stück). Jetzt
  entscheidet das Werkzeug `tools/abkuerzungen.mjs` pro Kurve: **gesperrt** (Sperren stehen, später
  Pace-Note „nicht schneiden“) oder **frei** (keine Sperren, Schneiden erlaubt, später Pace-Note
  „schneiden“).
- Ergebnis: **4 gesperrt, 5 frei = 44 %** (Ziel 40 %, erlaubt 30–50 %).
- Wie ausgewählt wird (in dieser Reihenfolge):
  1. **Pflicht:** Spart eine Abkürzung mehr als 12 m Weg oder mit echter Fahrphysik mehr als 0.5 s,
     wird immer gesperrt. → Das trifft **die Schikane (3196 m)**: Dort spart Schneiden laut
     Testfahrer ca. 1.5 s (siehe unten).
  2. **Von Hand:** Listen `immerSperren` / `immerFrei` in `config.js` (zurzeit leer).
  3. **Grösster Gewinn zuerst**, aber Kurven, in denen die Sperre eine lange Reihe auf offener Wiese
     wäre, bleiben frei (Talkurve 612 m, Passhöhe 2586 m – Linos „Steinriegel am Feldrand“ sind weg).
     Wald, Hang oder Felswand in der Nähe machen eine Kurve eher zur gesperrten.
  4. **Abwechslung:** Ist die Kurve davor oder danach schon gesperrt, wird diese seltener gesperrt.

| Kurve (Streckenmeter) | Innenseite | Gewinn (Weg) | Schneiden spart (Zeit) | jetzt | Grund |
|---|---|---|---|---|---|
| 482 – 752 (Talkurve) | links | 7.1 m | −5.9 s (langsamer!) | **frei** | offene Wiese, Sperre wäre eine 21 m lange Reihe |
| 1085 – 1230 (Waldstück) | rechts | 4.0 m | −0.8 s | **frei** | kleiner Gewinn, Kehre 1 daneben ist schon gesperrt |
| 1350 – 1415 (Kehre 1) | links | 6.9 m | −0.3 s | gesperrt | grosser Gewinn, dichter Wald, Hang 23 % |
| 1496 – 1562 (Kehre 2) | rechts | 8.4 m | 0.0 s | gesperrt | grösster Gewinn, Wald, Hang 22 % |
| 1643 – 1708 (Kehre 3) | links | 7.3 m | −0.3 s | **frei** | beide Nachbarkehren sind gesperrt (Abwechslung) |
| 1789 – 1854 (Kehre 4) | rechts | 6.3 m | −0.3 s | gesperrt | Gewinn, dichter Wald, Hang 20 % |
| 1876 – 1955 (nach den Kehren) | links | 4.9 m | −0.9 s | frei* | kleiner Gewinn |
| 2484 – 2710 (Passhöhe) | links | 5.1 m | −4.8 s (langsamer!) | **frei** | offene Wiese, Sperre wäre eine 16 m lange Reihe |
| 3196 – 3234 (Schikane) | links | 3.2 m | **+1.5 s** | gesperrt | **Pflicht-Sperre** (spart mehr als 0.5 s) |

\* In der Kurve 1876 – 1955 steht keine eigene Sperre, aber die Sperre von Kehre 4 macht die paar
geraden Abkürzungen dort trotzdem zu. Sie steht darum nicht in der Liste „schneiden“.

- Reihenfolge entlang der Strecke (G = gesperrt, F = frei): **F F G G F G F F G** – gesperrte und
  freie Kurven wechseln sich ab, nirgends alle am Stück.
- **Zeitvergleich mit echter Fahrphysik** (neues Werkzeug `node tools/testfahrer.mjs --schneiden`,
  inklusive Getriebe): Der Testfahrer fährt jede Kurve einmal auf der Ideallinie (bleibt auf Strasse
  und Bankett) und einmal quer über die Wiese, von 90 m vor bis 60 m nach der Kurve, je mit den
  8 besten Abkürzungen. **In allen freien Kurven ist Schneiden gleich schnell oder langsamer** (Spalte
  „Zeit“ oben, minus = langsamer): Das Gras bremst so stark, dass sich übertriebenes Schneiden nicht
  lohnt – in den weiten Kurven kostet es sogar 5–6 s. Richtwert „höchstens 0.3 s“: erfüllt.
- In den gesperrten Kurven kommt man nirgends mehr durch (0 Abkürzungslinien, auch mit 1.8 m
  Autobreite). In den freien Kurven bleiben 559 Linien offen – gewollt.
- Sperren sehen aus wie in M1.1 (gleiche Bausteine, grösste Lücke 1.27 m, Strasse und Bankett frei).

| | M1.1 | M1.2 |
|---|---|---|
| gesperrte Kurven | 9 von 9 | **4 von 9** |
| Sperren | 29 | **18** |
| Felsbrocken / Stämme | 41 / 38 | 22 / 24 |
| Hindernisse gesamt (F3) | 7607 | **7425** |
| Ladezeit (Testumgebung) | 1.1–1.6 s | 1.6 s (schwankt je Lauf) |

- **Für die Pace-Notes (Meilenstein 4)** gibt es in `js/abkuerzungen.js` jetzt zwei Listen:
  `nichtSchneiden` (die 4 gesperrten Kurven) und neu `schneiden` (die 4 freien Kurven, in denen
  Schneiden Weg spart, mit Meterzahl). Beides erzeugt das Werkzeug automatisch, im Spiel sieht man noch
  nichts davon.

**2. Mehr Lenkeinschlag im Schritttempo**
- Unter ca. 7 km/h lenken die Räder jetzt bis **48°** ein (vorher 27°), bis ca. 30 km/h läuft das weich
  aus. Ab 30 km/h ist alles genau wie vorher. Gilt vorwärts und rückwärts, Tastatur und Gamepad.

| Tempo, voller Einschlag | Einschlag | Wendekreis-Radius | Drehrate |
|---|---|---|---|
| 5 km/h | 27° → **48°** | 4.9 m → **2.3 m** | 16°/s → **35°/s** |
| 10 km/h | 25° → **47°** | 5.4 m → **2.4 m** | 29°/s → **67°/s** |
| 5 km/h rückwärts | 27° → **48°** | 4.9 m → **2.3 m** | 16°/s → **35°/s** |
| 20 km/h | 22° → 32° | 6.2 m → 4.4 m | 52°/s → 75°/s |
| 30 km/h | 20° → 20° | gleich | gleich |
| 40 / 100 / 150 km/h | 18° / 10° / 5.5° | **genau gleich wie vorher** | **genau gleich** |

- Das Rückwärtsfahren selbst (Tempo, Beschleunigung) ist unverändert – der Extra-Einschlag wirkt nur
  aufs Drehen.
- Die Vorderräder drehen sichtbar höchstens 35° ein (bei 48° standen sie unglaubwürdig quer, siehe
  Screenshots `14a`/`14b`). Die Physik rechnet trotzdem mit 48°.

**3. Getriebe mit Schaltpause**
- Das Auto hat jetzt **5 Gänge plus R und N**. Geschaltet wird automatisch, aber es fühlt sich an wie
  ein Handschalter: Bei jedem Gangwechsel gibt es eine kurze Pause (hoch 0.28 s, runter 0.18 s), in der
  der Motor nicht antreibt – das Auto rollt kurz, dann zieht es wieder.
- Der Motor hat eine Drehmomentkurve: unter 2000 U/min schwach, 4000–6000 voll, bis 7000 leicht
  abfallend. In tiefen Gängen zieht das Auto kräftig (1. Gang bis 8 m/s²), in hohen weniger.
- Anfahren: Kupplung schleift, darum kein lahmer Start. Auf Gras drehen die Räder durch (höchstens
  5.3 statt 7.5 m/s² Antrieb).
- Ohne Gas bremst der Motor im tiefen Gang bei hoher Drehzahl spürbar mehr (1. Gang bis 0.7 m/s²) als
  im 5. Gang (0.2–0.3 m/s²).
- Automatik: Hochschalten bei 4500 U/min (wenig Gas) bis 6900 U/min (Vollgas), runterschalten unter
  1800–2600 U/min, beim Bremsen schon unter 3200. **Kickdown:** Gas voll durchtreten bei niedriger
  Drehzahl → ein oder zwei Gänge tiefer. Nach jedem Schaltvorgang 0.6 s Pause, und kurzes Lupfen am
  Gas löst kein Hochschalten aus (kein Hin und Her).
- Rückwärts: „R“, genau wie bisher, ohne Schaltpause. Im Stand ohne Gas und Bremse nach 0.5 s „N“.

| Vollgas aus dem Stand | M1.1 (ohne Getriebe) | M1.2 |
|---|---|---|
| 0 auf 100 km/h | 5.03 s | **5.13 s** (mit 2 Schaltpausen) |
| 0 auf 160 km/h | 10.7 s | 12.8 s |
| 0 auf 185 km/h | 20.2 s | 24.4 s |
| Höchsttempo | 188 km/h | **188 km/h** (5. Gang, 6750 U/min, weich auslaufend) |

| Hochschalten (Vollgas) | bei | Tempo während der Pause | Beschleunigung davor → danach |
|---|---|---|---|
| 1 → 2 | 47 km/h | −0.1 km/h | 6.7 → 6.3 m/s² |
| 2 → 3 | 81 km/h | −0.5 km/h | 5.0 → 4.8 m/s² |
| 3 → 4 | 116 km/h | −1.2 km/h | 3.4 → 3.2 m/s² |
| 4 → 5 | 154 km/h | −2.2 km/h | 1.7 → 1.5 m/s² |

- Gegenüber „durchgehend Gas ohne Pause“ verliert das Auto pro Hochschaltung 4–7 km/h (siehe
  Bekannte Probleme).
- Bremstest (voll bremsen ab 180 km/h): 5 → 3 bei 89 km/h, 3 → 2 bei 54 km/h, 2 → 1 bei 24 km/h,
  Stand nach 4.4 s.
- Handbremse in der Kehre (40 und 60 km/h, 0.7 s Handbremse, dann Gas): dreht genau so weit wie
  vorher (33° bzw. 32°; danach mit Gas 111° statt 114° bzw. 74° wie vorher), bleibt im 1./2. Gang –
  gut kontrollierbar wie bisher.

**4. Analoge Tachos**
- Unten rechts zwei runde Pixel-Tachos im 80er-Look statt der grossen Zahl: rechts **Tempo** (0–200,
  Zahlen alle 40, kleine digitale km/h-Zahl unten drin), links **Drehzahl** (0–8 × 1000 U/min, roter
  Bereich ab 7, Gangzahl im Kästchen: 1–5, „R“ rot, „N“).
- Rote Nadeln mit Schatten, die Tempo-Nadel folgt gedämpft, die Drehzahl-Nadel schneller. In der
  Schaltpause fällt die Drehzahl-Nadel ab, die Gangzahl wechselt erst am Ende der Pause.
- Die Zifferblätter sind halbdurchsichtig, damit sie nicht zu viel vom Bild zudecken.
- F3 zeigt zusätzlich `GANG x U/MIN xxxx`.

**5. Zeitanzeige kleiner**
- Die Zeit steht klein (5 × 7 Pixel) auf einer dunklen Tafel mit hellem Rand und abgeschrägten Ecken,
  daneben winzig „ZEIT“. Weiss, wenn sie läuft, gelb vor dem Start. Die Breite springt nicht.
- Darunter drei kleine Quadrate für die Checkpoints: leer = noch nicht, gelb = erreicht.
- Die Zwischenzeit („CP 1 00:26.33“) erscheint wie bisher 3 Sekunden, jetzt klein und gelb unter
  der Tafel. Zielanzeige unverändert.

**6. Nebenbei behoben**
- **Nach dem Ziel rollte das Auto von selbst rückwärts davon** (bis 22 km/h, war schon in M1.1 so):
  Die automatische Bremse nach dem Ziel ging im Stand in den Rückwärtsgang über. Jetzt bleibt das Auto
  stehen.
- **Nur lenken im Stand liess das Auto rückwärts kriechen** (war schon in M1.1 so: 3.7 m in 2 s).
  Mit dem neuen Einschlag hätte es sich dabei sogar im Kreis gedreht. Jetzt bleibt es stehen, solange
  kein Pedal gedrückt ist.

### So testest du

1. **Kurven schneiden:** Probier es in den freien Kurven: Talkurve (ca. 600 m), Waldstück (ca. 1150 m),
   **Kehre 3** (ca. 1675 m), Passhöhe (ca. 2590 m). Lohnt es sich? Ist es zu einfach oder zu
   bestrafend? In Kehre 1, 2, 4 und in der Schikane sollte es nicht gehen.
2. **Schaltgefühl:** Vollgas aus dem Stand. Spürst du die kurzen Pausen beim Schalten? Zu lang, zu kurz,
   zu oft? Schaut auf den Drehzahlmesser: Nadel fällt beim Schalten, Gangzahl springt.
3. **Kehren:** Bremst du vor der Kehre, schaltet er runter; beim Rausbeschleunigen Kickdown. Fühlt sich
   das gut an? Schaltet er mal unnötig hin und her?
4. **Lenken im Schritttempo:** Absichtlich in einen Baum fahren, dann rückwärts und mit vollem Einschlag
   zurück auf die Strasse. Geht das jetzt besser? Zu viel?
5. **Tachos und Zeit:** Gut lesbar auf beiden Rechnern? Decken die Tachos etwas Wichtiges zu?
6. **FPS (F3)** wie bisher auf beiden Rechnern.
7. **Ganze Etappe:** Deine Zeit im Vergleich zu vorher? (Der Testfahrer ist ca. 1–2 s langsamer.)

### Wo man schrauben kann (alles in `js/config.js`)

- **Schaltgefühl** (Abschnitt `getriebe`):
  - `schaltDauerHoch` (0.28 s) / `schaltDauerRunter` (0.18 s) – wie lange beim Schalten kein Antrieb
    wirkt. Kürzer = sportlicher, länger = schwerfälliger. 0 = ohne Pause.
  - Schaltpunkte: `hochWenigGas` (4500) / `hochVollgas` (6900) = wann hochgeschaltet wird,
    `runterWenigGas` (1800) / `runterVollgas` (2600) / `runterBremsen` (3200) = wann runter,
    `kickdownGas` / `kickdownUnter` / `kickdownMax` = Kickdown, `schaltSperre` (0.6 s) = Pause
    zwischen zwei Schaltvorgängen.
  - `drehmoment` – die Drehmomentkurve als Liste [U/min, Anteil]. Zum Beispiel unten mehr Kraft:
    `[2000, 0.7]` statt `[2000, 0.55]`.
  - `zugkraft` – Schub je Gang (1. bis 5.). Alle etwas höher = schneller, höher in den hohen Gängen =
    mehr Durchzug über 100 km/h (dann `auto.luftwiderstand` mit erhöhen, sonst steigt das Höchsttempo).
  - `gaenge` – Tempo je Gang bei 7000 U/min (bestimmt, wann geschaltet wird).
  - `traktion` – wie viel Schub auf den Boden kommt (mal Grip: Gras weniger).
- Höchsttempo: `auto.luftwiderstand` (höher = langsamer oben raus).
- Lenkung im Schritttempo: `auto.lenkwinkelStand` (48°), `auto.lenkStandBisTempo` (8 m/s),
  sichtbarer Radeinschlag `autoOptik.radEinschlagMax` (35°).
- Welche Kurven gesperrt sind: Abschnitt `abkuerzung` – `sperrQuote` (0.4), `immerSperren` und
  `immerFrei` (z. B. `immerFrei: [1520]` für Kehre 2), `pflichtGewinn`, `pflichtZeit`. **Danach muss das
  Werkzeug neu laufen** (`node tools/abkuerzungen.mjs`) – sag Claude einfach „Kurve bei 1520 m bitte
  frei“.
- Tachos: Abschnitt `hud.tacho` (Grösse, Abstände, Farben, Skalen, wie schnell die Nadeln folgen).
- Zeittafel: Abschnitt `hud.zeit` (Grösse, Farben, Checkpoint-Punkte).

### Selbst getestet

- Spiel startet ohne Fehler in der Browser-Konsole. Etappe, Zeit, Checkpoints, Zwischenzeiten,
  Zielanzeige und F3 funktionieren (Screenshots).
- **Automatischer Testfahrer** – neu als Werkzeug im Projekt (`node tools/testfahrer.mjs`), fährt der
  Strassenmitte nach, bremst vor Kurven, ohne Handbremse. Gleicher Fahrer auf der alten Version (M1.1)
  und der neuen:

| Profil | M1.1 | M1.2 | Unterschied |
|---|---|---|---|
| vorsichtig | 2:32.52 | 2:33.24 | +0.7 s |
| mittel | 2:17.85 | 2:19.11 (CP 0:26 / 1:22 / 1:54) | +1.3 s |
| flott | 2:08.35 | 2:10.41 | +2.1 s |

  Etwas langsamer, weil das Auto über 100 km/h weniger zieht und die Schaltpausen Zeit kosten. Kein
  Aufprall, nirgends hängen geblieben, alle Checkpoints und das Ziel erkannt, nächste Sperre 4.1 m
  entfernt. 32–47 Gangwechsel pro Etappe, davon 0–1 „hin und her“ (vorher 20, behoben mit dem
  geglätteten Gaspedal). Die Zeiten aus M1.1 weiter unten stammen von einem anderen Testfahrer und
  sind nicht direkt vergleichbar.
- `node tools/getriebe-test.mjs` – Zeitreihe Vollgas alle 0.25 s (Tempo, Gang, Drehzahl, Schaltpause),
  0–100, Höchsttempo, Bremstest, Motorbremse, Kickdown, Anfahren auf Gras, Leerlauf/Rückwärts.
- `node tools/lenk-test.mjs` – Lenkwerte vorher/nachher (Tabelle oben), alle Prüfungen erfüllt.
- `node tools/aufprall-test.mjs` – **Aufprall unverändert**: 100 → 2 km/h frontal, 45° → 30 %,
  75° → 80 %, nie eingedrungen, alle Prüfungen erfüllt.
- `node tools/abkuerzungen.mjs` – `js/abkuerzungen.js` neu erzeugt, 0 Abkürzungen in gesperrten Kurven.
- Leistung im Software-Modus (ohne Grafikkarte), alte und neue Version direkt nacheinander gemessen:
  gleich viele Zeichenaufrufe, ca. 1400 Dreiecke weniger, FPS gleich (4–6, schwankt). **Echte FPS bitte
  mit F3 auf beiden Rechnern prüfen.**
- Screenshots unter `screenshots/m1-2/`:
  - `01-hud-stand.png`, `02-hud-100kmh.png` (3. Gang), `03-hud-schaltpause.png` (mitten in 2 → 3,
    Nadel fällt, Gang noch „2“), `04-hud-hoechsttempo.png` (187 km/h, 5. Gang)
  - `05-zwischenzeit.png`, `06-ziel.png`, `07-f3-debug.png`
  - `08-gesperrte-kehre-2-innen.png`, `11-gesperrte-kehre-4-innen.png`,
    `15-gesperrte-schikane-innen.png` – Sperren im Kurveninnern
  - `09-freie-kehre-3-innen.png`, `10-freie-talkurve-innen.png` – frei, keine Sperren mehr
  - `12-kehren-von-oben.png`, `13-freie-kehre-3-von-oben.png`
  - `14a-raeder-48grad-ungebremst.png` / `14b-raeder-sichtbar-35grad.png` – Radeinschlag

### Bekannte Probleme

- **Luftwiderstand geändert** (6.2 → 3.25 bei 190 km/h): Mit Getriebe ging das alte Mass nicht auf –
  der 5. Gang hätte stärker ziehen müssen als der 1. Das Auslaufen beim Höchsttempo ist weiterhin weich,
  Spitze 188 km/h wie vorher.
- **Über 100 km/h zieht das Auto weniger als in M1.1** (0–160 in 12.8 statt 10.7 s), weil hohe Gänge
  weniger Schub haben. Etappe dadurch 1–2 s langsamer. Wenn dir das zu zäh ist: `zugkraft` der hohen
  Gänge erhöhen (siehe oben).
- **Tempoverlust beim Schalten:** Während der Pause fällt das Tempo nur leicht (0.1–2.2 km/h, wie
  gewünscht). Gegenüber „ohne Pause durchziehen“ fehlen aber 4–7 km/h pro Hochschaltung (gewünscht
  waren 1–3) – bei 0.28 s ohne Antrieb und 5–7 m/s² Beschleunigung geht es nicht weniger. Das macht
  0–100 ca. 0.5 s langsamer, ist aber genau das, was man spürt. Zu stark? → `schaltDauerHoch` kürzer.
- Direkt nach dem Hochschalten ist die Beschleunigung nur wenig geringer als davor (z. B. 6.7 → 6.3
  m/s²). Spürbar ist vor allem die Pause.
- **Schikane = Pflicht-Sperre:** Der Testfahrer spart dort beim Schneiden 1.5 s. Wahrscheinlich ist der
  Wert zu hoch, weil der Testfahrer die Ideallinie durch die S-Kurve nicht optimal fährt. Gesperrt war
  sie ohnehin.
- Der Zeitvergleich beim Schneiden stammt von einem einfachen Testfahrer ohne Handbremse. Ein geübter
  Fahrer findet in **Kehre 3** vielleicht doch ein paar Zehntel (Testfahrer: −0.3 s). Bitte ausprobieren.
- Rückwärts mit vollem Einschlag und dann Gas bremst das Rückwärtsrollen nur langsam (war schon
  vorher so, bewusst nicht angefasst, weil sich Rückwärtsfahren richtig anfühlt).
- Die Tempo-Nadel liegt im Stand über der „0“ – wie bei einem echten Tacho.
- Leistung nur im Software-Modus messbar (siehe Meilenstein 1).

### Ideen/Vorschläge (nicht umgesetzt)

- Manuelles Schalten auf Tasten (z. B. Q/E, Gamepad LB/RB) – vorbereitet mit `getriebe.modus`.
- Schaltblitz: Gangzahl blinkt kurz vor dem Hochschalten oder im roten Bereich.
- Kleiner Ruck der Karosserie (Nicken) beim Schalten – ohne Kamera-Wackeln.
- Motorsound mit Drehzahl (Sound war hier ausdrücklich nicht dran).
- Zeittafel: am Ziel oder an Checkpoints die Differenz zur Bestzeit (+/−) anzeigen.
- In M4 könnten die freien Kurven neben „schneiden“ auch zeigen, wie viel man spart.
- Testfahrer mit Handbremse in den Kehren (dann sind die Testzeiten näher an einem Menschen).

---

## Meilenstein 1.1: Harter Aufprall und Schluss mit Abkürzungen ✅ (Verlauf, Stand damals)

Hinweis: Seit Meilenstein 1.2 sind nur noch 4 von 9 Kurven gesperrt (18 statt 29 Sperren), und der
Rückwärtsgang und das Fahren mit Gas laufen über das Getriebe. Der Aufprall ist unverändert.

### Was neu ist

**1. Ein Aufprall bringt dich hart zum Halt**
- Vorher: Nach einem Baum rutschte das Auto zur Seite weg (oft nach links), drehte sich und fuhr
  mit Gas gleich wieder mit rund 100 km/h weiter.
- Warum „immer nach links“? Das Auto war für die Kollision aus drei Kreisen gebaut, ein Baum ist
  auch ein Kreis. Rund auf rund rutscht ab: Traf man den Baum etwas rechts der Automitte, wurde das
  Auto nach links weggeschoben – und dazu noch absichtlich zur Seite abgelenkt. Beides ist weg.
- Jetzt ist das Auto für die Kollision ein Rechteck mit flacher Front (wie eine Stossstange).
  Fährst du gerade auf einen Baum, ist das immer ein frontaler Aufprall, egal ob der Baum mittig
  oder am Rand der Front steht.
- **Frontal:** Das Auto steht praktisch sofort (100 km/h → 2 km/h), dreht sich nicht, rutscht nicht
  zur Seite und prallt nur ein winziges Stück zurück.
- **Rückwärts raus:** Bremse/Rückwärts halten (S, Pfeil runter, LT/L2) – das Auto fährt rückwärts
  weg und bleibt nicht hängen.
- **Gas weiter halten:** Das Auto bleibt ruhig am Baum stehen – kein Zittern, kein Hineinschieben,
  kein Wegrutschen.
- **Schräg:** Je flacher du triffst, desto mehr Schwung bleibt, das Auto schrammt am Hindernis
  entlang und wird sanft parallel gedrückt. Streifschuss = nur ein Kratzer.
- Gilt gleich für Tannen, Laubbäume, Steine und die neuen Felsbrocken und Baumstämme.
- Felswand, Abhang und die 45-m-Grenze funktionieren wie bisher.
- F3 zeigt weiterhin „AUFPRALL tempo vorher -> nachher“.
- Nebenbei behoben: Ein Hindernis ganz am Rand der Karte konnte „unsichtbar“ sein (Rechenfehler beim
  Einsortieren). Betraf höchstens die äussersten Bäume.

| Aufprall (mit 100 km/h) | Tempo danach |
|---|---|
| frontal bis ca. 30° | ca. 2 km/h (Stopp) |
| 45° schräg | ca. 30 km/h |
| 60° | ca. 55 km/h |
| 75° (Streifschuss) | ca. 80 km/h |
| 85° | ca. 94 km/h |

(Winkel = zwischen Fahrtrichtung und Hindernis; 0° = genau drauf, 90° = parallel daneben.)

**2. Sperren gegen Abkürzungen**
- Ein kleines Werkzeug misst auf dem echten Gelände mit den echten Bäumen, wo man abkürzen kann:
  Für jeden Strassenpunkt und jeden Punkt bis 200 m weiter wird die gerade Linie dazwischen geprüft.
  Eine Linie ist eine Abkürzung, wenn sie mindestens 3 m spart, nirgends zu steil bergauf geht, nicht
  durch die Felswand oder über den Abhang führt, das Auto dabei neben das Bankett auf die Wiese kommt
  und ein 2.2 m breites Auto an keinem Baum oder Stein hängen bleibt.
- Danach setzt es Sperren ins Kurveninnere, immer dort, wo eine Sperre die meisten Abkürzungen
  abschneidet. Eine Sperre beginnt neben dem Bankett und führt ins Kurveninnere – leicht schräg,
  pendelnd und aus gemischten Bausteinen, damit es nicht wie eine Mauer aussieht:
  - **Felsbrocken** (neu, 2 bis 3.5 m hoch, mit Moos und Rissen), einzeln oder in Gruppen
  - **Tannengruppen** (3 bis 6 Tannen eng zusammen), nur weiter weg von der Strasse, damit die
    Kronen nicht über die Fahrbahn hängen
  - **umgefallene Baumstämme** (4 bis 8 m lang, einzeln, zu zweit oder zu dritt gestapelt), echte
    kleine 3D-Stämme mit Rinde, hellem Holzring an den Enden und abgebrochenen Ästen
  - dazu ein paar kleine Steine drumherum
- Zwischen zwei Teilen einer Sperre ist nie mehr als 1.4 m Platz – das Auto (1.8 m) passt nicht durch.
- Strasse und Bankett bleiben komplett frei. Der nächste Felsbrocken ist 5.6 m von der Strassenmitte
  entfernt, der nächste Stamm 5.8 m (das Bankett endet bei 5.5 m), Tannen der Sperren mindestens 10 m.

**Abkürzungen vorher / nachher** (gerade Linien, Gewinn mindestens 3 m)

| Kurve (Streckenmeter) | Kurveninnenseite | grösster Gewinn vorher | Linien vorher | nachher |
|---|---|---|---|---|
| 482 – 752 (Talabschnitt, weite Linkskurve) | links | 7.1 m | 48 | 0 |
| 1085 – 1230 (Waldstück, Rechtskurve) | rechts | 4.0 m | 3 | 0 |
| 1350 – 1415 (Kehre 1) | links | 6.8 m | 181 | 0 |
| 1496 – 1562 (Kehre 2) | rechts | 8.4 m | 178 | 0 |
| 1643 – 1708 (Kehre 3) | links | 6.3 m | 160 | 0 |
| 1789 – 1854 (Kehre 4) | rechts | 6.2 m | 144 | 0 |
| 1876 – 1955 (Linkskurve nach den Kehren) | links | 4.9 m | 7 | 0 |
| 2484 – 2710 (Passhöhe, Linkskurve) | links | 4.9 m | 31 | 0 |
| 3196 – 3234 (Schikane, links) | links | 3.2 m | 9 | 0 |
| **Total** | | | **761** (mit 1.8 m Autobreite: 898) | **0** (auch mit 1.8 m: 0) |

- Mit 5 m Mindestgewinn wären es vorher 137 Linien, mit 10 m **keine einzige**. Deshalb steht der
  Mindestgewinn auf 3 m statt auf den vorgeschlagenen 10 m: Die Bäume aus Meilenstein 1 versperren
  alle langen Abkürzungen schon, die Abkürzungen, die du fährst, sparen 3 bis 8 m.
- Es gibt jetzt **29 Sperren** mit 41 Felsbrocken, 38 Stämmen, 25 Tannen und 65 kleinen Steinen
  (471 Kollisionskreise). An jedem Kehren-Scheitel stehen 4 bis 7 Sperren dicht beisammen – das
  sieht aus wie ein Felsgarten im Kehreninnern.
- Wo die Sperren stehen, steht in `js/abkuerzungen.js` (vom Werkzeug geschrieben, nicht von Hand
  ändern). Ändern sich Strecke, Gelände oder Bäume, muss das Werkzeug neu laufen
  (`node tools/abkuerzungen.mjs`, macht Claude). Passt die Datei nicht zur Strecke, lässt das Spiel
  die Sperren weg und meldet das in der Browser-Konsole.

**3. Vorbereitet für die Pace-Notes (Meilenstein 4)**
- Für jede gesperrte Kurve gibt es einen Eintrag „nicht schneiden“ (von/bis Meter, Kurveninnenseite),
  ebenfalls automatisch vom Werkzeug erzeugt. Im Spiel sieht man davon noch nichts.

### So testest du

1. **Aufprall frontal:** Im Waldstück (ab 900 m) gerade in einen Baum fahren, 80–120 km/h. Steht
   das Auto sofort? Mit F3 siehst du z. B. „AUFPRALL 100 -> 2 KM/H“.
2. **Gas halten:** Nach dem Aufprall weiter Gas geben – bleibt das Auto ruhig stehen?
3. **Rückwärts raus:** Bremse/Rückwärts halten. Kommst du gut weg? Ist der Rückwärtsgang zu lahm?
4. **Aufprall schräg und Streifschuss:** Einen Baum, Felsbrocken oder Stamm schräg oder nur
   seitlich touchieren. Fühlt sich das richtig an? Bleibt das Auto kontrollierbar?
5. **Abkürzungen:** Versuch in möglichst vielen Kurven abzukürzen, vor allem in den vier Kehren
   (1350–1860 m), in der weiten Linkskurve im Tal (ca. 600 m), auf der Passhöhe (ca. 2590 m) und in
   der Schikane (ca. 3200 m). Findest du noch einen Weg? Bitte mit Meterzahl aus F3 melden.
6. **Aussehen:** Wirken die Sperren natürlich? Zu viel, zu wenig, zu künstlich?
7. **FPS (F3)** an den Kehren – merkst du einen Unterschied zu vorher?

### Wo man schrauben kann (alles in `js/config.js`)

- Aufprall: Abschnitt `kollision`
  - `reibung` – wie stark schräge Aufpralle bremsen (höher = mehr Tempoverlust)
  - `rueckprall` – wie stark das Auto zurückprallt (0.02 = kaum)
  - `ausrichten` – wie stark ein Streifschuss das Auto parallel zum Hindernis drückt
  - `autoLaenge`, `autoBreite`, `eckRadius` – Grösse des Auto-Rechtecks für die Kollision
- Abkürzungs-Analyse: Abschnitt `abkuerzung` (`minGewinn`, `autoBreite`, `wieseAb`)
- Aussehen der Sperren: Abschnitt `sperren` – Mischung (`mischung`), Grössen der Felsbrocken,
  Tannen und Stämme, Lücken (`luecke`, `maxLuecke`), wie schräg und unregelmässig (`schraeg`,
  `seitlich`, `begleitChance`), Abstand zur Strasse (`abstandMitte`, `baumAbstandMitte`).
  Das wirkt sofort beim Neuladen. Nur wenn sich dadurch die Lücken ändern, sollte Claude das
  Werkzeug neu laufen lassen, damit die Prüfung wieder stimmt.

### Selbst getestet

**Aufprall** (Testlauf `node tools/aufprall-test.mjs`, echte Fahrphysik, flacher Asphalt):
1. Frontal mit 100 km/h gegen eine Tanne: **100 → 2 km/h**, seitlich **0.00 m**, Blickrichtung
   **0.0°** gedreht, Rückprall 2 km/h.
   - Bremse/Rückwärts ab dem Aufprall gehalten: 2 s nach dem Stillstand **8.3 m** weg.
   - Aus dem Stand direkt am Baum: nach 2 s **5.2 m** weg, 8 m nach 2.5 s (siehe Bekannte Probleme).
   - Gas gehalten: in 2 s **1 mm** bewegt, 0° gedreht – steht ruhig.
2. Spiegeltest (Tanne links/rechts der Mitte): 0.4 m → beide 2.0 km/h, 0.00 m; 0.9 m → beide
   1.7 km/h, ±0.10 m, ±0.17°; 1.2 m (nur die Ecke streift) → beide 67.6 km/h, ±7.9 m, ±17°.
   Links und rechts sind exakt spiegelbildlich.
3. Gegen einen liegenden Stamm: 20° → 2 % Tempo bleiben, 45° → **30 %**, 75° → **80 %** (20 %
   Verlust), Übergang fliessend (Tabelle oben). 1 s nach dem 75°-Streifschuss noch 68 km/h, um
   14° parallel gedreht.
4. 190 km/h frontal → 4 km/h. 104 Anfahrten mit 190 km/h (Baum −1.3 bis +1.3 m versetzt) und 300
   Anfahrten aus zufälligen Richtungen gegen Tannen, Stämme und Felsbrocken: **nie** eingedrungen.
5. Stein (Radius 0.6 m) und Felsbrocken (Radius 1.4 m): genau wie der Baum (100 → 2 km/h).
- Im Spiel (Headless-Browser): Tanne im Waldstück bei 901 m mit 100 km/h → F3 „96 -> 2 KM/H“,
  nach 1 s Tempo 0, Drehung 0°. Screenshots `screenshots/m1-1/01a-…` und `01b-…`.

**Abkürzungen** (Werkzeug `node tools/abkuerzungen.mjs`):
- Vorher 761 Abkürzungslinien, nachher **0** – sowohl mit 2.2 m als auch mit 1.8 m (= Autobreite).
- Grösste Lücke in einer Sperre: **1.27 m** (Engstelle der Kette, gemessen von Kante zu Kante).
- **Gegenprobe mit echter Fahrphysik:** Das Auto ist alle früheren Abkürzungslinien (1659, die
  Listen für 2.2 m und 1.8 m zusammen) mit ca. 58 km/h abgefahren. Ohne Sperren kam es bei 1489
  durch, **mit Sperren bei keiner einzigen**.
- **Automatischer Testfahrer** (fährt der Strassenmitte nach, ohne Handbremse), mit und ohne Sperren:
  vorsichtig 2:24, mittel **2:12** (CP 1 0:25, CP 2 1:19, CP 3 1:49), flott 2:21 (ein Baum-Aufprall
  im Waldstück wegen zu weiter Linie). Die Zeiten sind **auf die Hundertstel gleich** wie ohne
  Sperren, kein einziger Kontakt mit einer Sperre (nächster Abstand Auto–Sperre 4.2 m), alle
  Checkpoints und das Ziel erkannt.
- Hindernisse: 7136 → **7607** (F3 „HINDERNISSE“).
- Ladezeit im Headless-Browser: mit und ohne Sperren gleich (1.1–1.5 s, schwankt je Lauf).
- Grafik: 5 Zeichenaufrufe und ca. 3600 Dreiecke mehr pro Bild (z. B. bei Kehre 1: 94 → 99
  Zeichenaufrufe, 128 000 → 132 000 Dreiecke). FPS im Software-Modus ohne Grafikkarte vorher und
  nachher gleich (4.5–5.8, schwankt). **Echte FPS bitte mit F3 auf beiden Rechnern prüfen.**
- Screenshots unter `screenshots/m1-1/`:
  - `01a-aufprall-kurz-davor-F3.png`, `01b-aufprall-danach-F3.png` – frontal, danach Tempo 0
  - `02-sperre-felsbrocken.png` – Felsbrocken am Eingang von Kehre 1
  - `03-sperre-staemme.png` – Stammstapel an Kehre 3
  - `04-sperre-baumgruppe.png` – Tannengruppe mit Felsbrocken in der Talkurve (ca. 612 m)
  - `05a-spitzkehre-fahrersicht.png`, `05b-spitzkehre-von-oben.png` – Kehre 2 mit ihren Sperren
  - `06-karte-kehren.png` – Karte von oben (Hilfsbild): rote Linien = Abkürzungen vorher,
    blaue Punkte = Sperren, grüne Punkte = Bäume und Steine, braun-grau = zu steil

### Bekannte Probleme

- **Rückwärts aus dem Stand nur 5.2 m in 2 s** (Ziel war 8 m). Der Rückwärtsgang beschleunigt mit
  3 m/s² und war nicht Teil dieses Meilensteins (Fahrphysik ausserhalb von Kollisionen bleibt).
  Hält man die Bremse schon beim Aufprall, ist man nach gut 2 s über 8 m weg. Vorschlag unten.
- **Mindestgewinn 3 m statt 10 m** (siehe oben) – mit 10 m hätte die Analyse nichts gefunden.
- **Offene Wiese:** In der weiten Talkurve (612 m) und auf der Passhöhe (2586 m) ist das Kurveninnere
  flach und offen. Dort ist die Sperre eine 20–27 m lange Reihe aus Tannen, Felsbrocken und Steinen
  quer in die Wiese – das wirkt wie eine Hecke oder ein Steinriegel am Feldrand. Natürlich genug?
  Bitte anschauen. Weit aussen (hinter dem Ende der Reihe) kann man theoretisch herumfahren, spart
  dann aber nichts mehr.
- **Geprüft werden gerade Linien.** Wer sich in Schlangenlinien durch den normalen Wald fädelt,
  findet vielleicht noch einen Weg. Darum reichen die Sperren 4 m weiter ins Kurveninnere als nötig.
- Die kleinen Steine (aus Meilenstein 1, auch rund um die Sperren) wirken in der Sonne recht hell.
- Ein Baum, der nur die Ecke des Autos streift (ca. 1.2 m neben der Mitte), zählt als Streifschuss:
  Das Auto verliert ein Drittel Tempo und dreht sich um ca. 17° – gewollt, aber bitte beurteilen.
- Leistung nur im Software-Modus messbar (siehe Meilenstein 1).

### Ideen/Vorschläge (nicht umgesetzt)

- **Rückwärtsgang kräftiger:** `auto.rueckwaertsBeschl` von 3 auf 5 → 8 m in 2 s aus dem Stand.
- Kleine Steine etwas dunkler (gleiches Problem, das die Felsbrocken zuerst hatten).
- Aufprall-Effekt: Kamera wackelt kurz, Rinden-/Nadel-Pixel fliegen, Geräusch (Kamera-Ruck und Sound
  waren hier ausdrücklich nicht dran).
- Leichter Schaden am Auto nach harten Aufprallen (später).
- In M2 können Holzzäune an offenen Wiesen-Kurven die langen Sperr-Reihen ersetzen oder ergänzen.
- Das Werkzeug könnte bei jedem Push automatisch prüfen, ob `js/abkuerzungen.js` noch zur Strecke
  passt (GitHub Action).

---

## Meilenstein 1: Die erste echte Etappe ✅ (Verlauf, Stand damals)

Hinweis: Das Aufprall-Verhalten und die Aufprall-Werte in `config.js` aus diesem Abschnitt gelten
nicht mehr – siehe Meilenstein 1.1.

### Was neu ist

**1. Die Strasse bleibt bis zum Horizont grau**
- Vorher wurde die Strasse schon wenige Meter vor dem Auto braun. Grund: Asphalt, Bankett und
  Mittellinie waren in *einem* kleinen Bild (Textur) gemalt. Für die Ferne rechnet die Grafikkarte
  automatisch verkleinerte Versionen dieses Bildes (sogenannte Mipmaps) – und in den kleinen
  Versionen wurden Grau und Braun zu einem braungrauen Brei vermischt.
- Jetzt sind Asphalt, die zwei Bankette und die Mittellinie eigene Streifen mit eigenem Bild.
  Da kann nichts mehr vermischt werden. Nah sind die Pixel weiterhin hart und kantig.
- Die Mittellinie wird in der Ferne mindestens 1 Bildpunkt breit gezeichnet und geht dort in eine
  schwache, durchgehende Linie über – so flimmert sie nicht. Man sieht sie deutlich über 100 m weit.
- Vergleich: `screenshots/m1/01-strasse-vorher.png` und `02-strasse-nachher.png`.

**2. Man kracht jetzt in Bäume und Steine**
- Bei Bäumen zählt nur der Stamm (ca. 45 cm Radius), nicht die Krone – man kann also mit dem
  Dach unter den Ästen durchrutschen, aber nicht durch den Stamm. Steine sind so breit wie sie
  aussehen.
- Was passiert beim Aufprall: Das Tempo Richtung Baum ist fast ganz weg, das Auto prallt ein
  kleines bisschen zurück, schrammt seitlich weiter und wird herumgerissen.
  - frontal mit 100 km/h: danach ca. 43 km/h, das Auto dreht sich um ca. 60–80°
  - Streifschuss mit 100 km/h: danach ca. 75–85 km/h, das Auto dreht sich um ca. 20–40°
  - auch mit 190 km/h rutscht man nie durch einen Stamm
  - mit Gas langsam gegen einen Baum: das Auto dreht sich langsam weg, es bleibt nicht kleben
- Felswand, Abhang und die 45-m-Grenze funktionieren wie bisher.
- F3 zeigt jetzt auch die Anzahl Hindernisse und den letzten Aufprall („AUFPRALL 105 -> 45 KM/H“).

**3. Die Etappe „Passstrasse“**

Die Strasse ist **3668 m** lang, von der Startlinie (bei 25 m) bis zur Ziellinie (bei 3623 m)
sind es **3.6 km**. Es geht insgesamt **158 m** bergauf, die steilste Stelle hat **11 %**.

| Abschnitt | Meter | Höhe | Was dich erwartet |
|---|---|---|---|
| 1. Start im Tal | 0 – 250 | 0 m | gerade, offene Wiese, Berge voraus |
| 2. Talabschnitt | 250 – 900 | 0 → 31 m | weite, flüssige Rechts- und Linkskurven |
| 3. Waldstück | 900 – 1290 | 31 → 51 m | dichter Tannenwald direkt neben der Strasse – Vorsicht, Bäume! |
| 4. Kehrengruppe | 1290 – 1890 | 51 → 105 m | vier Spitzkehren: links, rechts, links, rechts, steile Rampen dazwischen |
| 5. Felswand 1 | 1890 – 2490 | 105 → 151 m | Felswand links, Abhang ins Tal rechts |
| 6. Passhöhe | 2490 – 2900 | 151 → 157 m | offenes Hochplateau, wenig Bäume, schnell (Höchsttempo!) |
| 7. Abfahrt | 2900 – 3420 | 157 → 123 m | Felswand **rechts**, Abhang links, bergab, enge Rechts-Links-Schikane |
| 8. Zielgerade | 3420 – 3668 | 123 m | flach, Ziellinie (Schachbrett) |

- Die Kehren liegen am Hang übereinander. Dazwischen ist der Hang so steil, dass man nicht
  abkürzen kann (und falls doch: siehe Checkpoints).
- Die Landschaft richtet sich jetzt automatisch nach der Strecke: Hinter den Felswänden steht ein
  Berg, unter den Abhängen liegt ein Tal, weit weg von der Strasse steigen die Talflanken an. Die
  Hintergrundberge stehen immer hinter dem Gelände, egal wie gross die Strecke wird.
- Bäume und Steine stehen jetzt entlang der ganzen Strecke, dichter als im Prototyp:
  ca. 5450 Tannen, 720 Laubbäume, 970 Steine (Prototyp: 1600 / 220 / 320 auf 1.3 km).
  Im Waldstück und an den Kehren deutlich dichter, auf der Passhöhe bewusst licht.
- Die Strecke steht in `js/track.js` als Punkteliste mit Überschriften pro Abschnitt. Pro Abschnitt
  kann man dort einstellen, wie viele Bäume es gibt und auf welcher Seite eine Felswand steht.

**4. Checkpoints**
- Drei Tore mit gelb-schwarzem Banner und Nummer (CP 1, CP 2, CP 3), damit man sie nicht mit der
  Ziellinie (Schachbrett) verwechselt:
  - **CP 1** bei 900 m (Ende Talabschnitt)
  - **CP 2** bei 1870 m (nach der letzten Kehre – etwas vor 1900 m, weil dort schon die Felswand beginnt)
  - **CP 3** bei 2880 m (Ende Passhöhe – etwas vor 2900 m, aus dem gleichen Grund)
- Beim Durchfahren steht 3 Sekunden lang die Zwischenzeit oben im Bild, z. B. „CP 1 00:27.42“.
- **Abkürzen lohnt sich nicht:** Wer an einem Checkpoint vorbeikommt, ohne durchs Tor zu fahren
  (z. B. quer über den Hang), sieht „CHECKPOINT VERPASST“ und wird zurück auf die Strassenmitte
  beim letzten erreichten Checkpoint gesetzt (beim ersten: an die Startlinie). Tempo 0, Blick in
  Fahrtrichtung, die Zeit läuft weiter. Ins Ziel kommt man nur mit allen Checkpoints.
- Ausschalten: in `js/config.js` bei `checkpoints` den Wert `abkuerzungenVerhindern: false` setzen.
  Dann gibt es nur die Meldung, kein Zurücksetzen.
- Taste R (Gamepad: Start) setzt wie bisher an der aktuellen Stelle zurück auf die Strasse.
- Am Ziel stehen unter der Endzeit die drei Zwischenzeiten.
- F3 zeigt den nächsten Checkpoint und wie weit es noch ist.

### So testest du

1. GitHub-Pages-Adresse öffnen (nach dem Mergen auf `main`). „Strecke wird gebaut …“ dauert in der
   Testumgebung knapp 2 Sekunden, etwa gleich lang wie beim Prototyp.
2. Einmal die ganze Etappe fahren. Zeit nehmen: Wie lange brauchst du? (Testfahrer siehe unten.)
3. Worauf achten:
   - **Strasse in der Ferne:** bleibt sie grau? Ist die Mittellinie gut zu sehen, flimmert sie?
   - **Waldstück (ab 900 m):** absichtlich mal in einen Baum fahren. Fühlt sich der Aufprall wie
     „Rallyauto kracht in Baum“ an? Zu hart, zu weich, dreht es zu viel oder zu wenig?
     Mit F3 siehst du das Tempo vor und nach dem Aufprall.
   - **Kehrengruppe (ab 1290 m):** Machen die vier Kehren Spass? Zu eng, zu weit?
   - **Felswand 2 (ab 2900 m):** Sieht die Wand rechts gut aus? Ist die Schikane fahrbar?
   - **Checkpoints:** Versuch mal abzukürzen – wirst du zurückgesetzt? Ist das fair?
   - **FPS (F3) auf beiden Rechnern**, besonders im Waldstück und bei den Kehren. Wenn es ruckelt:
     Bitte melden, mit Meterzahl aus F3.
4. Feedback am besten mit Screenshot und Meterzahl (F3).

### Wo man schrauben kann (alles in `js/config.js`)

- Aufprall: Abschnitt `kollision` – z. B. `ablenkung` (wie viel Tempo nach frontalem Aufprall
  bleibt), `drehRuck`/`maxRuck` (wie stark das Auto herumgerissen wird), `stammRadius`.
- Checkpoints: Abschnitt `checkpoints` – Positionen (`beiMeter`), Anzeigedauer, Ein/Aus.
- Bäume: `sprites.tannenProKm`, `laubProKm`, `steineProKm` (mehr = dichter, aber mehr Arbeit
  für die Grafikkarte). Pro Abschnitt zusätzlich `baeume` in `js/track.js`.
- Mittellinie: `strasse.mittellinieBreite`, `mittellinieMinPixel`.
- Gelände: `gelaende.kernRand` (bis wohin das Gelände fein ist), `wandBerg`, `talTiefe`.

### Selbst getestet

- Spiel startet ohne Fehler in der Browser-Konsole (Chromium ohne Grafikkarte, Software-Modus).
- **Automatischer Testfahrer** (fährt der Strassenmitte nach, bremst vor Kurven, ohne Handbremse)
  ist die ganze Etappe gefahren, alle drei Checkpoints und das Ziel wurden erkannt:
  - flott: **2:10**, mittel: **2:25** (CP 1 0:27, CP 2 1:26, CP 3 2:00), vorsichtig: **2:31 / 2:46**.
    Ein Mensch, der die Strecke noch nicht kennt, landet wohl eher bei 2:45 bis 3:30.
  - Dabei kein einziger Baum-Aufprall, nie weiter als 6 m neben der Strassenmitte.
- **Abkürzungs-Test:** Der Testfahrer „springt“ an CP 2 vorbei → „CHECKPOINT VERPASST“, zurück bei
  CP 1, Zeit läuft weiter, danach regulär ins Ziel (alle drei Zwischenzeiten). Gleiches mit CP 1
  (→ zurück an die Startlinie). Mit `abkuerzungenVerhindern: false`: nur Meldung, Ziel zählt,
  Zwischenzeit von CP 2 steht als „--:--.--“.
- **Baum-Tests:** frontal mit 100 km/h → 43 km/h, Drehung ca. 60–80°. Streifschuss → 75–85 km/h.
  190 km/h frontal → 80 km/h, nicht durch den Stamm. 300 Anfahrten mit 190 km/h aus zufälligen
  Richtungen an zufällige Bäume: kein einziges Mal in einen Stamm eingedrungen.
- **Strasse geprüft** (jeder Meter, quer alle 50 cm): Das Gelände sticht nirgends durch den Asphalt.
  Ganz aussen am Bankett (äusserste 50 cm) ragt das Gras an ein paar Stellen bis 40 cm drüber
  (neben den Kehren) – sieht aus wie ein Grasrand. Auf der Felswand-Seite steckt das Bankett zum
  Teil im Fels, das ist so gewollt.
- Steilste Stelle 11.4 % (in den Kehren-Rampen), die Fahrphysik wurde nicht angefasst.
- Screenshots unter `screenshots/m1/`: Strassen-Fix vorher/nachher, Baum-Aufprall (kurz davor und
  danach mit F3), Start, Waldstück, Kehren (Anfahrt und von oben), Felswand 1, Passhöhe,
  Felswand 2 rechts, Schikane, Zielgerade, Checkpoint-Tor, Zwischenzeit, Zielanzeige.
- **Leistung – nur bedingt prüfbar:** Die Testumgebung hat keine Grafikkarte. Dort läuft die neue
  Etappe mit 4–6 FPS, der Prototyp mit 7–10 FPS. Der Unterschied kommt fast nur von den vielen
  Bäumen (im Software-Modus teuer, für eine echte Grafikkarte bei 320×180 Pixeln eine Kleinigkeit).
  Damit die Grafikkarte nicht mehr Arbeit hat als nötig, ist das Gelände nur nahe der Strasse fein,
  und alles, was weiter weg ist als der Dunst reicht, wird ganz grob gezeichnet. So zeichnet das
  Spiel pro Bild ca. 90 000 – 125 000 Dreiecke, etwa gleich viel wie der Prototyp, obwohl die Welt
  fast dreimal so gross ist. **Bitte mit F3 auf beiden Rechnern prüfen.**

### Bekannte Probleme

- **Fahrgefühl beim Aufprall ist nur nachgerechnet**, nicht erfühlt. Bitte Feedback!
- **Andere Texturen mit dem gleichen Mipmap-Effekt (geprüft):**
  - Gras/Fels-Körnung: unkritisch, ist nur grau und wird mit der Geländefarbe gemischt.
  - **Bäume und Steine (Sprites): ja, ähnlicher Effekt.** In der Ferne werden die durchsichtigen
    Ränder mit Schwarz vermischt. Ferne Bäume bekommen dadurch dunklere Ränder und werden etwas
    dünner/flimmern leicht. Fällt im Dunst kaum auf, wäre aber behebbar (Vorschlag unten).
  - Checkpoint-Banner: wird in der Ferne olivgrau (gelb + schwarz gemischt) – harmlos.
- Die Grenze „zu weit weg von der Strasse“ (45 m) und der Abhang halten das Auto weiterhin mit einer
  unsichtbaren Wand – Leitplanken kommen in M2.
- Fährt man neben dem Tor vorbei (mehr als ca. 9 m neben der Strassenmitte), zählt das als verpasst.
- Zwischen den Kehren-Ästen kann man nach unten auf den tieferen Ast rutschen. Dann muss man die
  Kehren halt nochmal fahren – Zeit verliert man selbst.
- Gamepad: wie bisher nur Controller mit Standard-Belegung.

### Ideen/Vorschläge (nicht umgesetzt)

- Sprite-Ränder in der Ferne: durchsichtige Pixel mit der Nachbarfarbe füllen statt Schwarz, dann
  bleiben ferne Bäume sauber (kleine Änderung in `js/pixel.js`).
- Kurzer Aufprall-Effekt: Kamera wackelt kurz, ein paar Nadel-/Blätter-Pixel fliegen.
- Nach „CHECKPOINT VERPASST“ kurz einblenden, wie viel Zeit es gekostet hat.
- Countdown 3-2-1 am Start und Start-/Zielbogen über der Strasse.
- Checkpoint-Tore mit Werbebanner-Fantasienamen (Sponsoren wie bei echten Rallyes).
- Taste zum kompletten Neustart mitten im Rennen (z. B. R lange halten).
- Bestzeit merken (im Browser gespeichert) und am Ziel anzeigen.
- Abschnittsname in der F3-Anzeige (macht Feedback einfacher).
- Unterschiedliche Tannen je nach Höhe (oben kleiner/dunkler, auf der Passhöhe Latschen).
- Ältere Ideen aus M0: Staubwolke hinter dem Auto, Kamera bei hohem Tempo weiter, schärfere Pixel
  durch ganzzahlige Skalierung (`ganzzahligSkalieren: true`), Sonne für mehr Kontrast an der Felswand.

---

## Meilenstein 0: Fahrbarer 3D-Prototyp ✅ (Verlauf, Stand damals)

Ziel: herausfinden, ob **Pixel-Look** und **Fahrgefühl** funktionieren. Bewusst klein.

### Was gebaut wurde

- **Pixel-Look:** Das Spiel rechnet intern nur mit 320 × 180 Pixeln und skaliert das Bild scharf
  (ohne Weichzeichnen) auf das Browserfenster. Seitenverhältnis 16:9, schwarze Balken wenn nötig.
  Kein Antialiasing, kantige Low-Poly-Formen, flache Schattierung.
- **Licht und Dunst:** sonniger Tag (eine Sonne + Umgebungslicht). Die nahe Landschaft verschwindet
  in der Ferne in hellem Blaugrau. Die grossen Hintergrundberge haben einen eigenen, schwächeren
  Dunst, damit sie sichtbar bleiben.
- **Teststrecke (ca. 1.3 km, von A nach B):**
  1. Startgerade mit Startlinie (Schachbrett)
  2. weite Rechts- und Linkskurve
  3. Steigung
  4. zwei Spitzkehren übereinander am Hang
  5. Abschnitt mit Felswand links und Abhang ins Tal rechts
  6. Zielgerade mit Ziellinie
- **Strasse:** 7 m Asphalt mit dezenter, unterbrochener Mittellinie, links und rechts erdiges Bankett.
  Alles als kleine Pixel-Texturen im Code gemalt.
- **Gelände:** liegt sauber an der Strasse an (neben der Strasse flach, danach weicher Übergang
  in Hügel). Steile Stellen werden automatisch zu Fels.
- **Hintergrund:** zwei Reihen grosser Low-Poly-Berge mit Schneekappen rundherum.
- **Bäume und Steine als 2D-Sprites** (Linos Idee): ca. 1600 Tannen, 220 Laubbäume, 320 Steine.
  Sie drehen sich nur um die Hochachse zur Kamera, wie bei N64/PS1. Pixel-Texturen im Code
  gezeichnet, harte Kanten. Platzierung ist bei jeder Fahrt gleich (fester Zufalls-Startwert).
- **Auto „Ringwerk RT4“:** weisses, kantiges 80er-Rally-Coupé aus Boxen mit einem roten Streifen,
  Kastenkotflügeln, steiler Frontscheibe. Räder drehen sich, Vorderräder lenken ein.
  Kleiner dunkler Fleck als Schatten.
- **Fahrphysik (Arcade mit Gewicht):**
  - 0 auf 100 in ca. 5 Sekunden, Spitze ca. 188 km/h, nähert sich weich an (kein harter Anschlag)
  - bergab nur leicht schneller, bergauf leicht langsamer
  - Lenkung tempoabhängig (langsam direkt, schnell ruhig)
  - das Auto kann rutschen; zu schnell in die Kurve = es schiebt nach aussen
  - Handbremse: Hinterräder blockieren, das Heck kommt – zum Driften durch die Spitzkehren
  - auf Bankett etwas, auf Gras deutlich langsamer (Gras: max. ca. 85 km/h)
  - Auto folgt dem Gelände und neigt sich mit dem Untergrund; die Karosserie neigt sich leicht
    in Kurven und beim Bremsen
- **Begrenzungen:** Man fährt nicht durch die Felswand (das Auto schrammt entlang) und fällt nicht
  den Abhang hinunter (unsichtbare Grenze). Zu steile Hänge kommt man nicht hoch.
  Mehr als 45 m neben der Strasse geht es nicht.
- **Kamera:** Verfolgerkamera hinter dem Auto, leicht erhöht, weich nachgeführt. Sie schwenkt beim
  Driften verzögert mit, damit man den Drift sieht.
- **HUD:** Zeit oben Mitte, Tempo unten rechts – in einer eigenen Pixelschrift (keine Schriftdatei).
  Die Zeit startet beim Überfahren der Startlinie und stoppt an der Ziellinie. Danach grosse
  Endzeit-Anzeige.
- **Debug-Panel (F3):** FPS, gefahrene Meter, Tempo, Driftwinkel, Untergrund.

### Selbst getestet

- Startet ohne Fehler in der Browser-Konsole (Chromium, ohne Grafikkarte im Software-Modus).
- Ein automatischer Testfahrer (ohne Handbremse, eher vorsichtig) ist die ganze Strecke gefahren:
  ca. 59 s von Start bis Ziel. Zeitmessung und Zielanzeige funktionieren, R setzt zurück bzw.
  startet neu. Kannst du ihn schlagen?
- Dabei gefunden und behoben: Das Auto konnte zuerst einfach den Felshang zwischen den Kehren
  hochfahren (Abkürzung) und blieb frontal an der Felswand kleben. Beides ist jetzt gelöst.
- Felswand, Abhang und 45-m-Grenze halten das Auto; frontal in die Wand bleibt es nicht kleben.
- Geprüft, dass das Gelände nirgends durch den Asphalt sticht.
- Fahrwerte nachgerechnet: 0–100 in 5.0 s, Spitze 188 km/h, bergab (8 %) 194 km/h,
  Gras max. ca. 88 km/h.
- Screenshots unter `screenshots/m0/`: Start, Spitzkehre, Felswand, Hintergrundberge.
- **Nicht** getestet: echte 60 FPS. In der Testumgebung gibt es keine Grafikkarte
  (Software-Rendering, ca. 11 FPS) – das sagt nichts über deine Rechner aus. Bitte mit F3 prüfen.
  Die Welt ist bewusst sparsam gebaut (ca. 60 Zeichenaufrufe, Bäume in einem Rutsch je Sorte).

### Bekannte Probleme / was noch wackelt

- **Fahrgefühl ist nur nachgerechnet, nicht „erfühlt“.** Das ist der wichtigste Punkt für dein Feedback.
- **Abkürzungen:** An flachen Stellen kann man über die Wiese abkürzen (z. B. Kurveninnenseiten).
  Zwischen den Spitzkehren verhindert der zu steile Hang das meist, aber nicht garantiert.
  Es gibt noch keine Kontrollpunkte.
- **Mitten im Rennen ganz neu starten** geht nur über Neuladen der Seite (F5). R setzt nur auf die
  Strasse zurück, die Zeit läuft weiter.
- Sprite-Bäume sehen von oben (steile Kamera) flach aus – aus der Fahrerkamera passt es.
- Ferne Bäume können beim Fahren leicht flimmern (gewollter Retro-Effekt, ggf. anpassbar).
- Gamepad: Nur Controller mit Standard-Belegung. Ein PlayStation-Controller in Firefox meldet sich
  manchmal anders an – dann bitte mit Chrome/Edge testen.

### Ideen/Vorschläge (nicht umgesetzt)

- Kontrollpunkte entlang der Strecke, damit Abkürzungen nicht zählen.
- Taste zum kompletten Neustart mitten im Rennen (z. B. R lange halten).
- Ein kleiner Countdown (3-2-1) vor dem Start.
- Start- und Zielbogen (Banner über der Strasse), damit man das Ziel von weitem sieht.
- Kamera: Blickwinkel bei hohem Tempo leicht weiten (Tempogefühl).
- Mehrere Varianten der Pixel-Tannen (verschneit, dunkler) je nach Höhe.
- Leichte Staubwolke hinter dem Auto auf Bankett und Gras (als Pixel-Sprites).
- Schärfere Pixel durch ganzzahlige Skalierung (`ganzzahligSkalieren: true` in der Config ausprobieren).
- Sonnenposition so drehen, dass die Felswand mehr Licht/Schatten-Kontrast bekommt.
