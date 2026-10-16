# Alpine Rally – Stand

Aktuell: **Meilenstein 4 fertig** – **Pace-Notes**: Wie in einer echten Rallye sagt der Beifahrer an, was als Nächstes
kommt – oben im Bild, unter der Zeit: kleines Symbol, kurzer Text, Distanz in Metern. Kurven mit Stufe 1–6, Kehren
(1/4 … 4/4), Schikane, Gerade, Kuppe, Senke, Abzweig/Einmündung mit Belag, Felswand, Ziel und „schneiden“ /
„nicht schneiden“. Alles wird beim Laden aus der Strecke berechnet; die Stufen sind an der echten Fahrphysik gemessen.
Taste **N** schaltet die Ansagen aus und ein.
Davor: 3d (Leben an der Strecke: Alpweide, Fan-Spots, Unfallautos), 3b (Almweg und Wiesenweg), 3c (Start- und Zielbereich), 3a.3 (Felswand: Auto stoppt an der sichtbaren Wand), 3a.2 (Fahrphysik-Feinschliff), 3a.1 (Nebenweg-Korrektur), 3a (erster Nebenweg: bei
800 m rechts auf Schotter, bei 1020 m zurück auf die Hauptstrasse), 2c (raus aus dem Gras), 2b (Kühe, Büsche,
Wald in der Ferne), 2a.1 (natürlichere Sperren, Tempo-Tafeln), 2a (Leitplanken, Holzzäune, Schilder), 1.3b (kein
Dunststreifen), 1.2 (Kurven schneiden, Getriebe, Tachos), 1.1 (harter Aufprall) und 1 (Etappe „Passstrasse“).
Das Konzept und der Fahrplan stehen in `KONZEPT.md`.

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
| Pace-Notes (Ansagen) aus/ein | N | – |

Tastatur und Gamepad gehen gleichzeitig, nichts einzustellen. Geschaltet wird automatisch.
Die Einstellung von N merkt sich der Browser (beim nächsten Start gleich wie vorher).

---

## Meilenstein 4: Pace-Notes (Ansagen oben im Bild) ✅

### Was wurde gebaut?

Wie in einer echten Rallye sagt der Beifahrer an, was als Nächstes kommt. Bei uns steht das **oben in der Mitte,
direkt unter der Zeit und den Checkpoint-Punkten**, auf einer kleinen halbdurchsichtigen dunklen Tafel im Stil der
Zeit-Tafel. Kein Ton, nur Symbol und Text. Zeit, Checkpoint-Punkte und Tachos sind unverändert.

Jede Zeile: **Symbol** (Pixel-Pfeil in der Form der Kurve, farbig nach Schwierigkeit) + **Text** (z. B.
`RECHTS 4 LANG`, die Stufen-Zahl in der Farbe des Symbols) + kleine **Zusatz-Zeichen** (schneiden / nicht schneiden)
+ rechts die **Distanz** in Metern mit kleinem „m“, die in 10-m-Schritten herunterzählt.

- **Höchstens 3 Zeilen**, die dringendste (nächste) oben.
- **Wann erscheint eine Ansage?** Etwa **7 Sekunden** vorher beim aktuellen Tempo, aber mindestens **100 m** und
  höchstens **350 m** vorher (bei 50 km/h also ca. 100 m, bei 140 km/h ca. 270 m). „ZIEL“ immer 200 m vorher.
- **Beim Passieren** (Kurvenanfang erreicht) blendet die Zeile weich aus, die anderen rutschen weich nach oben,
  erst dann kommt eine neue dazu. Eine Ansage, die einmal steht, bleibt bis zum Passieren (auch wenn man bremst) –
  so flackert nichts.
- Steht gerade eine **Zwischenzeit** („CP 1 …“) unter den Punkten, rutscht die Tafel weich darunter.
- **Nach dem Ziel** keine Ansagen mehr, nach dem **Neustart** (R) geht es wieder von vorn los.
- **Taste N** schaltet die Ansagen aus und ein (kurze Meldung „ANSAGEN AUS“ / „ANSAGEN AN“). Der Browser merkt sich
  die Einstellung (falls der Browser-Speicher gesperrt ist, sind sie beim Start einfach an). Steht auch in der
  Start-Hilfe unten links und in der F3-Anzeige („ANSAGEN AN (TASTE N)“).
- Die Schrift hat dafür jetzt **Ä, Ö, Ü** (z. B. `EINMÜNDUNG`, `ÖFFNET`).

**Alles wird beim Laden automatisch aus der Strecke berechnet** (`js/pacenotes.js`, ca. 3–5 ms): Krümmung,
Höhenprofil, Felswand, Nebenwege, Beläge und die Abkürzungs-Listen. Nichts ist von Hand pro Kurve eingetragen. Nur
das **Kurventempo** jeder Kurve kommt aus einer Messung mit der echten Fahrphysik (siehe unten), gespeichert in
`js/pacenotes-tempo.js` (erzeugt vom Werkzeug, wie `js/abkuerzungen.js`).

### Die Symbole

| Symbol | Bedeutung | Farbe |
|---|---|---|
| Pfeil schräg nach oben | sanfte Kurve, Stufe 5–6 | grün |
| Pfeil rechtwinklig | Kurve Stufe 3–4 | gelb |
| Pfeil, der über 90° hinaus und nach unten biegt | enge Kurve, Stufe 1–2 | rot |
| schmales U mit Pfeil ganz nach unten | **Kehre** (Spitzkehre, immer Stufe 1), mit Nummer `(1/4)` … `(4/4)` wie die Kehren-Schilder | rot |
| Versatz rechts-links | **Schikane** (zwei kurze Gegenkurven als eine Ansage) | nach Stufe |
| Pfeil gerade nach oben | **Gerade** mit Länge (`GERADE 200`) | weiss |
| Buckel | **Kuppe** (die Strasse verschwindet dahinter) | weiss |
| Mulde | **Senke** | weiss |
| Warndreieck mit ! | **Felswand** (nur wo man in einer Kurve aussen an die Wand getragen wird) | gelb |
| Zielflagge | **Ziel** | weiss |
| kleiner grüner Pfeil quer | Zusatz: **schneiden** lohnt sich (frei) | grün |
| kleiner roter Verbotskreis | Zusatz: **nicht schneiden** (Sperren im Kurveninnern) | rot |
| Körner | Belagwechsel (nur als Zeichen, wenn das Wort nicht mehr in die Zeile passt) | beige |

Für Linkskurven ist der Pfeil gespiegelt. Zusätze im Text (höchstens einer pro Kurve): **ZIEHT ZU** (wird gegen Ende
enger), **ÖFFNET** (wird gegen Ende weiter), **LANG** (mehr als 100° oder länger als 130 m), **ENG** / **WEIT**
(im untersten / obersten Fünftel des Tempobereichs der Stufe, wie „minus“/„plus“ bei echten Notes).

### Die Stufen (gemessen mit der echten Fahrphysik)

Für jede Kurve misst `node tools/pacenotes-test.mjs`, wie schnell man **gerade noch** durchkommt: Der Testfahrer
startet kurz vor der Kurve mit festem Tempo, hält es und folgt der Strassenmitte. Geschafft heisst: kein Aufprall,
Automitte höchstens 1 m auf dem Bankett, nie im Gras. Das grösste Tempo, das klappt, ist das **Grenztempo**. Folgt
eine Kurve direkt auf eine andere, fährt der Testfahrer durch die erste höchstens mit deren Grenztempo an.

| Stufe | Bedeutung | Grenze (config) | gemessen | Kurven |
|---|---|---|---|---|
| 1 | Haarnadel/Kehre, fast Schritttempo | unter 50 km/h | 43 km/h | 4 (die vier Kehren) |
| 2 | sehr eng | 50–70 km/h | 59–68 km/h | 4 (Talschleife: Abzweig, 850, 917, Einmündung) |
| 3 | eng | 70–85 km/h | 73–83 km/h | 6 (Almweg-Abzweig, 2027, Almweg-Einmündung, 2833, Wiesenweg-Einmündung, Schikane) |
| 4 | mittel | 85–100 km/h | 86–99 km/h | 4 (1088, 2288, Wiesenweg-Abzweig, 3022) |
| 5 | schnell | 100–125 km/h | – | 0 |
| 6 | fast gerade, **Vollgas** | ab 125 km/h | 142 km/h bis Vollgas | 6 (265, 504, 1028, 1879, 2508, 3292) |

Die Zuordnung ist **monoton**: schnellere Kurve = gleiche oder höhere Stufe (prüft der Test). Ehrlich: **Stufe 5
kommt auf dieser Strecke nicht vor** – zwischen 99 und 142 km/h gibt es keine Kurve. Die Strecke hat entweder
richtige Kurven (bis ca. 100 km/h) oder Bögen, durch die man mit Vollgas fährt. Bei „Vollgas“ bremst die Kurve gar
nicht (selbst mit 198 km/h Anlauf kommt man durch); das gilt z. B. für die Rechts nach der Talschleifen-Einmündung
(1028 m) und die Links nach Kehre 4 (1879 m) – man kommt ja aus einer langsamen Stelle.

**Belag (Schotter, Wiesenweg) – meine Entscheidung:** Beides. Die Stufe gilt für den **Belag, auf dem die Kurve
liegt** (gemessen auf Schotter bzw. Wiesenweg, dieselbe Kurve wäre auf Asphalt schneller) – sonst würde eine „4“
auf Schotter lügen. Und am **Anfang** des Abschnitts steht das Wort dabei: `ABZWEIG RECHTS SCHOTTER`,
`ABZWEIG RECHTS WIESENWEG`. So weiss man beim ersten Mal, warum es rutschiger wird, und die Zahl stimmt trotzdem.

### Die Ansagen dieser Etappe (30 Zeilen)

| Meter | Ansage | Zusatz |
|---|---|---|
| 25 | GERADE 200 | |
| 265 | RECHTS 6 LANG | |
| 504 | LINKS 6 LANG | schneiden |
| 796 | ABZWEIG RECHTS SCHOTTER (Stufe 2) | |
| 850 | LINKS 2 ZIEHT ZU | |
| 905 | KUPPE UND RECHTS 2 | |
| 945 | SENKE | |
| 981 | EINMÜNDUNG LINKS 2 | |
| 1028 | RECHTS 6 | |
| 1088 | RECHTS 4 LANG | schneiden |
| 1353 | KEHRE LINKS (1/4) | nicht schneiden |
| 1499 | KEHRE RECHTS (2/4) | nicht schneiden |
| 1645 | KEHRE LINKS (3/4) | schneiden |
| 1792 | KEHRE RECHTS (4/4) | nicht schneiden |
| 1879 | LINKS 6 | |
| 1976 | ABZWEIG RECHTS SCHOTTER (Stufe 3) | |
| 2027 | LINKS 3 | |
| 2078 | GERADE 200 | |
| 2288 | RECHTS 4 | |
| 2365 | EINMÜNDUNG LINKS 3 | |
| 2508 | LINKS 6 LANG | schneiden |
| 2779 | ABZWEIG RECHTS WIESENWEG (Stufe 4) + Kuppe-Zeichen | |
| 2833 | LINKS 3 | |
| 3022 | RECHTS 4 ENG | |
| 3092 | EINMÜNDUNG LINKS 3 | |
| 3132 | FELSWAND RECHTS | |
| 3161 | SCHIKANE RECHTS-LINKS (Stufe 3) | nicht schneiden |
| 3292 | RECHTS 6 | |
| 3374 | GERADE 200 | |
| 3623 | ZIEL (erscheint 200 m vorher) | |

Nach Art: 13 Kurven, 4 Kehren, 1 Schikane, 3 Abzweige, 3 Einmündungen, 3 Geraden, 2 Kuppen, 1 Senke, 1 Felswand,
1 Ziel; 4× „schneiden“ und 4× „nicht schneiden“ (genau die 8 Einträge aus `js/abkuerzungen.js`, alle an ihrer
Kurve – keine brauchte eine eigene Ansage).

Regeln dahinter (alle Zahlen in `config.js`, Block `pacenotes`):
- **Kurve** = Stück, das enger ist als Radius 350 m und die Richtung um mindestens 15° ändert. Flachere Bögen
  bekommen keine Ansage.
- **Kehre** = enger als 18 m Radius und mindestens 120° (wie die Kehren-Schilder). Kehren mit weniger als 300 m
  Abstand bilden eine Gruppe (1/4 … 4/4).
- **Schikane** = zwei Gegenkurven mit höchstens 15 m Gerade dazwischen, je höchstens 75°, zusammen höchstens 100 m.
  Stufe = die langsamere der beiden.
- **Gerade** = mindestens 180 m ohne angesagte Kurve, Länge auf 50 m abgerundet.
- **Kuppe** = die Steigung kippt um mindestens 5 % **und** aus Augenhöhe (1.3 m) verschwindet die Strasse dahinter
  (Sichtlinie übers Höhenprofil). **Senke** = am Ende eines Gefälles kippt es um mindestens 6 % in Steigung.
- **Abzweig / Einmündung** an den Metern aus `nebenwege` (800/1020.5, 1985.6/2400.8, 2797.7/3107.9). Liegt dort
  eine Kurve, wird sie zur Abzweig-Ansage (Richtung und Stufe von dieser Kurve).
- **Felswand** nur, wenn in einem Felswand-Stück eine Kurve höchstens Stufe 4 die Wand **aussen** hat (wer zu weit
  rausträgt, landet an der Wand). Das ist auf dieser Strecke nur die Schikane auf der Abfahrt.
- **Schneiden / nicht schneiden**: Jeder Eintrag aus `schneiden` / `nichtSchneiden` kommt an die Kurve, deren
  Meter sich am meisten mit `sVon`–`sBis` überschneiden und deren Innenseite die Seite des Eintrags ist.
- **Zusammenfassen**: Zwei Ansagen näher als 28 m werden eine Zeile mit „UND“. Wird die Zeile länger als
  24 Zeichen, fallen erst Zusätze weg (z. B. die Stufen-Zahl beim Abzweig – die Farbe des Pfeils zeigt sie
  trotzdem), eine Kuppe bleibt dann nur als Zeichen.

### Wo man schrauben kann (`js/config.js`, Block `pacenotes`)

| Wert | Was |
|---|---|
| `an`, `taste` | Standard beim ersten Start, Taste (N) |
| `stufenGrenzen` | km/h-Grenzen der Stufen 1–6 (heute 50 / 70 / 85 / 100 / 125) |
| `minKruemmung`, `minWinkel` | ab wann eine Kurve angesagt wird |
| `kehreRadius`, `kehreWinkel`, `kehrenGruppe` | was eine Kehre ist |
| `engWeitAnteil`, `langWinkel`, `langLaenge`, `oeffnetFaktor` | Zusätze ENG/WEIT, LANG, ÖFFNET/ZIEHT ZU |
| `schikane…` | was als Schikane zählt |
| `geradeMin`, `geradeRunden` | ab welcher Länge „GERADE“ |
| `kuppe…`, `senke…`, `knickStrecke` | Kuppe und Senke |
| `wandMaxStufe` | Felswand-Ansage nur bei Kurven bis zu dieser Stufe |
| `zielVor` | „ZIEL“ so viele Meter vorher |
| `zusammen`, `maxZeichen` | Zusammenfassen mit „UND“, längste Zeile |
| `vorlaufZeit`, `vorlaufMin`, `vorlaufMax` | wann eine Ansage erscheint (7 s, 100–350 m) |
| `maxZeilen`, `einblenden`, `ausblenden`, `nachruecken`, `distanzRunden` | Anzeige |
| `farbeTafel`, `farbeRand`, `farbeText`, `farbeDistanz`, `farben` | Farben (rot / gelb / grün / weiss) |
| `texte` | alle Wörter (LINKS, RECHTS, KEHRE, …) |

Nach Änderungen an Strecke oder Fahrphysik: `node tools/pacenotes-test.mjs --schreiben` misst die Kurven neu und
schreibt `js/pacenotes-tempo.js`. Ohne Messung schätzt das Spiel das Tempo aus Radius und Belag (Reserve, ungenauer).

### So testest du

1. Start: oben unter der Zeit steht `GERADE 200`, nach dem Losfahren kommt `RECHTS 6 LANG`.
2. **Talschleife** (ca. 30 s nach dem Start): `ABZWEIG RECHTS SCHOTTER` – fährst du rechts ab und nicht in die Absperrung?
   Danach `LINKS 2 ZIEHT ZU`, `KUPPE UND RECHTS 2`, `SENKE`, `EINMÜNDUNG LINKS 2`.
3. **Kehren**: `KEHRE LINKS (1/4)` mit rotem Verbotskreis, bei Kehre 3 der grüne Pfeil (schneiden lohnt sich).
4. **Abfahrt**: `FELSWAND RECHTS`, dann `SCHIKANE RECHTS-LINKS` mit rotem Verbotskreis.
5. **N** drücken: Tafel weg („ANSAGEN AUS“), nochmal N: wieder da. Seite neu laden: Einstellung bleibt.
6. Stimmen die Stufen mit deinem Gefühl? Eine 6 sollte Vollgas gehen, eine 2 deutlich bremsen.
7. Lesbar auf beiden Rechnern? Stört die Tafel die Sicht?

### Bilder (`screenshots/m4/`, 1280x720, neu erzeugen: `node tools/m4-bilder.mjs`)

01 Start, 02 vor Kehre 1, 03 vor der Schikane (mit Einmündung und Felswand), 04 vor „nicht schneiden“ (Kehre 2),
05 vor „schneiden“ (Rechts 4 lang), 06 vor dem Abzweig Talschleife (3 Zeilen), 07 vor der Einmündung Almweg,
08 auf der Passhöhe, 09 kurz vor dem Ziel, 10 ausgeschaltet (N), 11 nach dem Ziel (keine Ansagen),
12/13 dieselben Stellen in Originalgrösse 320x180.

### Selbst getestet

- **Neuer Test `node tools/pacenotes-test.mjs`** – alles bestanden:
  - (a) 898 Stellen, an denen die Strasse auf 50 m mehr als 25° dreht: alle haben eine Kurven-Ansage.
  - (b) alle 8 Einträge aus `schneiden`/`nichtSchneiden` genau einmal in den Ansagen, an der richtigen Kurve und Seite.
  - (c) Stufen monoton zum gemessenen Grenztempo (Tabelle oben), alle 25 Kurven gemessen, Datei aktuell.
  - (d) kleinster Abstand zweier Ansagen 36 m (nie unter 25 m), längste Zeile 24 Zeichen.
  - (e) alle 3 Abzweige und 3 Einmündungen: Meter wie in `nebenwege`, Richtung wie im Strassennetz (alle Abzweige
    rechts, alle Einmündungen links). Die Ansage gilt ab 4–40 m vor der Kreuzung (ab dem Anfang der Abbiege-Kurve)
    und erscheint bei 50–75 km/h ca. 100–150 m vor der Kreuzung; wer schneller kommt, sieht sie früher (7 s
    Vorlauf). In der Testfahrt: Abzweige 250 / 128 / 258 m vorher (bei 127 / 61 / 123 km/h), Einmündungen
    140 / 251 / 185 m vorher.
  - (f) die Liste ist bei zwei Läufen und nach neuem Laden genau gleich.
  - (g) während einer ganzen Testfahrt: nie mehr als 3 Zeilen, nichts verschwindet vor dem Passieren, jede Ansage
    erscheint 100–276 m vorher (ausser `GERADE 200` direkt an der Startlinie: sie steht schon beim Warten da),
    nach dem Ziel keine, nach dem Neustart wieder `GERADE 200`.
- **Stichproben** (Testfahrt „mittel“, 24 Kurven-Ansagen): Bei allen 24 lenkt der Testfahrer in die angesagte
  Richtung. Beispiele (Ansage → Tempo des Testfahrers in der Kurve): `KEHRE LINKS (1/4)` → 30 km/h,
  `ABZWEIG RECHTS SCHOTTER` (Stufe 2) → 38 km/h, `LINKS 3` (2027 m, Schotter) → 62 km/h, `RECHTS 4 LANG` → 76 km/h,
  `LINKS 6 LANG` (Passhöhe) → 115 km/h, `RECHTS 6 LANG` (Tal) → 128 km/h. Ehrlich: Der Testfahrer „mittel“ fährt
  vorsichtiger als das Grenztempo (z. B. Schikane mit 41 km/h statt der möglichen 83) und richtet sein Tempo nur
  nach der Krümmung, darum ist seine Reihenfolge nicht ganz dieselbe (z. B. `RECHTS 4 ENG` mit 46 km/h langsamer als
  `LINKS 3` mit 62 km/h). Massgeblich für die Stufen ist das gemessene Grenztempo.
- **Unverändert**: Streckenlänge 3667.587 m, Abkürzungen (`node tools/abkuerzungen.mjs --pruefen`) **127 / 2 / 342 / 84**,
  Testfahrer **2:59.33 / 2:42.35 / 2:31.92**, Sichtlinien 0. Alle bisherigen Tests bestanden, keine Konsolenfehler.
- **Leistung**: Die Tafel wird auf das HUD-Bild gemalt (2D), also **keine neuen Zeichenaufrufe** in der 3D-Szene
  (gleiche Zahl mit Ansagen an und aus). Jede Ansage wird einmal als kleines Bild gemalt, wenn sie zum ersten Mal
  kommt; pro Bild kommen nur dieses Bild und die Distanz dazu, ohne neue Objekte (kein Müll für den Speicher).
  **Ladezeit**: LADEZEIT_PLATZHALTER

### Ehrlich beurteilt

- **Lesbar bei 320x180?** Ja: gleiche 5x7-Schrift wie die Zeit, Zeilen 10 Pixel hoch, heller Text auf dunkler Tafel.
  Die Symbole sind 9 Pixel hoch und gut zu unterscheiden; die feinen Unterschiede (enge Kurve gegen Kehre) sieht man
  eher an der Farbe und am Text als an der Form.
- **Verdeckt es etwas?** Die Zeit und die Punkte nicht (Tafel beginnt 3 Pixel darunter). Bei 3 langen Zeilen ist die
  Tafel bis ca. 200 von 320 Pixeln breit und ca. 34 Pixel hoch – sie liegt dann über Bergen und Wald, nicht über der
  Strasse. Mit einer kurzen Zeile (`RECHTS 6`) ist sie klein. Ehrlich: Bei drei Zeilen ist sie schon präsent.
- **Stimmen Stufen und Richtungen?** Richtungen: bei allen 24 Kurven-Ansagen ja. Stufen: nach dem gemessenen
  Grenztempo ja; ob sie sich für dich richtig anfühlen, musst du sagen – die Messung fährt stur der Mitte nach.

### Bekannte Probleme

- Stufe 5 gibt es auf dieser Strecke nicht (siehe oben). Wenn sich eine 6 nicht nach Vollgas anfühlt, kann man
  `stufenGrenzen` anpassen.
- Die Kurven direkt nach langsamen Stellen (z. B. `RECHTS 6` nach der Talschleife, `LINKS 6` nach Kehre 4) sind
  „Vollgas“, weil man aus einer langsamen Stelle kommt. Wer dort schon schnell ankommt (z. B. abgekürzt), kann sich
  wundern.
- Kuppe bei 2779 m (Wiesenweg-Abzweig) steht nur als Zeichen, das Wort passt nicht mehr in die Zeile.
- Wer weit neben der Strasse fährt (z. B. quer über eine Wiese), bekommt die Ansagen nach dem nächsten
  Streckenpunkt – auf einem Hang zwischen zwei Kehren kann das kurz springen.

### Ideen/Vorschläge (nicht umgesetzt)

- Sprachausgabe des Beifahrers („Rechts vier lang!“), z. B. mit der Sprachausgabe des Browsers – Lino wollte vorerst
  keinen Ton.
- „Achtung Wrack“ / gelbe Flagge als Ansage an den zwei Unfallautos.
- „ASPHALT“ beim Zurückkommen auf die Hauptstrasse (mehr Grip).
- Ein Gamepad-Knopf für N.
- Eine Einstellung „früh / normal / spät“ für den Vorlauf (heute 7 s).
- Kehren-Fans, Zuschauer und Absperrungen als „ACHTUNG ZUSCHAUER“ (für später, wenn es mehr Etappen gibt).

---

## Meilenstein 3d: Leben an der Strecke (Wiesenweg, Fan-Spots, Unfallautos) ✅ (Verlauf, Stand damals)

### Was wurde gebaut?

**1. Wiesenweg als Alpweide (2798–3108 m)**
- **Holzzaun mit Weidetor** links von 2888 bis 2952 m (nach Checkpoint 3), gebaut wie die Zäune von M2a (Abstand
  per `randAbstand` an den schmalen Feldweg angepasst, Tor bei 2905 m steht offen ins Feld). Zusammen mit dem
  Zaun von M2a rechts (2931–3068 m) gibt es nur ein kurzes Stück (ca. 20 m) mit Zaun auf beiden Seiten – kein Korridor.
- **Kühe**: Die 44 Kühe von vorher stehen genau gleich (siehe unten, eingefroren). Dazu **3 neue kleine Herden**
  (10 Kühe, eigener seed): vor der Alphütte (ca. 3000 m links), rechts hinter dem alten Zaun (ca. 2990 m) und am
  Hang rechts beim Abzweig (ca. 2858 m). Alle mindestens 11 m neben der Wegmitte.
- **Alphütte** bei **2988 m links, 38 m neben dem Weg**: Steinsockel, dunkle Bretterwände, Satteldach mit
  Schindeln, Kamin, kleine Fenster mit rot-weissen Läden, Tür, Bank, Holzstapel unter einem Vordach.
  Daneben ein **Brunnentrog** mit Brunnenstock und Röhre (2979 m, 31 m).
- **Heustadel** (kleiner, auf Steinblöcken) bei **2900 m rechts, 52 m** am Hang.
- **Kleinigkeiten**: gelber **Wegweiser** (ALP 1 STD / FURGGA 2 STD / SEELI 40 MIN, erfundene Ziele) bei 2957 m
  links am Wegrand, **3 Steinmännchen**, **5 Heurollen** (3 rechts beim Abzweig, 2 links vor der Einmündung),
  **3 Findlinge**. Bewusst wenig: Der Wiesenweg bleibt offen und weit.

**2. Drei Fan-Spots** (Zuschauer-System von M3c: Pixel-Figuren, schauen zur Strasse, manche winken / schwenken
Fahnen; alle hinter einem Absperrband, mindestens 8.1 m neben jeder Strassenmitte)

| Spot | Wo | Fans | Dazu |
|---|---|---|---|
| **Kehren** | 1694–1716 m rechts, aussen an **Kehre 3** am Hang hinter der Leitplanke (man sieht die Kehre und die Strasse darüber) | 22 | Banner „FANCLUB KEHRE 3“, 2 Fahnen, 3 Klappstühle mit sitzenden Fans |
| **Passhöhe** | 2590–2652 m rechts (grösster Spot) | 28 | **Wohnmobil** mit Markise, Pavillon mit Tisch, Banner „HOPP HOPP PASSFANS“ und „TURBO SENN“, 3 Fahnen, 4 Klappstühle |
| **Almweg-Abzweig** | 1970–1990 m links, bei der Strohballen-Wand am Abzweig | 14 | **Pickup**, Banner „ALMRAUSCH FANS“, Fahne, 2 Klappstühle |

Die vorgeschlagenen Orte passten: Kehren-Spot 1694–1716 m (statt „1450–1800“ irgendwo: Kehre 3 hat aussen einen
Hang, der ansteigt), Passhöhe ca. 30 m später als vorgeschlagen (2590–2652 statt 2540–2620, damit der Spot nicht
gleich neben dem Wrack der Abfahrt steht), Almweg genau am Abzweig.

**3. Zwei Unfallautos (stehende Wracks)** – Fantasie-Rallyeautos im Stil der 80er-Gruppe B, **keine echten Modelle**:
kantige Karosserie, stark ausgestellte eckige Radkästen, Heckflügel, Dachhutze, Zusatzscheinwerfer-Leiste (4 Lampen),
Überrollkäfig (sieht man durch die kaputten Scheiben), Schmutzfänger, helle Rallye-Felgen, Startnummern an beiden
Türen und auf dem Dach, erfundene Sponsoren. Kein Mensch im Auto, kein Blut (die Splitter am Boden sind bewusst
nur hell/glasig – rote Splitter sahen auf dem Gras wie Blutstropfen aus).

| Wrack | Wo | Typ / Look | Schaden |
|---|---|---|---|
| **Tal** | **637 m rechts, 10.7 m** neben der Mitte, mit der Front an einem einzeln stehenden Laubbaum (der Baum stand schon da), aussen an der langen Linkskurve | „Brunnwald“ (Keil-Coupé, Flügel hoch auf Stützen), weiss-rot, **Nr. 14**, Sponsor FIRNWERK | Front eingedrückt (seitlich versetzt), Motorhaube aufgesprungen und geknickt, rechtes Vorderrad schief, Front- und Seitenscheibe zerbrochen, 2 Zusatzlampen kaputt |
| **Abfahrt** | **2488 m rechts, 9.6 m**, an der Böschung gleich nach dem Ende der Leitplanke (vor dem Weidezaun) | „Vallora“ (kantiger Kompakter, Flügel auf der Heckklappe, grosse Hutze), blau-gelb, **Nr. 23**, Sponsor MURMELI OEL | linke Seite eingedrückt, linkes Vorderrad ab (liegt daneben), Fahrertür abgesprungen (liegt im Gras), Heckflügel schief, Scheiben kaputt, Auto hängt schief |

- Je Wrack eine **dezente Rauchfahne** (6 gerasterte Wölkchen wie der Staub, laufen im Shader: kein Rechnen pro Bild).
- **Warndreieck** 24 m (Tal) bzw. 26 m (Abfahrt) vor dem Wrack am Strassenrand, **gelbe Flagge** 18–20 m davor,
  je **2 Streckenposten** (Warnweste orange/gelb mit Reflexstreifen, gelbe Fahne) 12.5–15.5 m neben der Strasse.
  Das Warndreieck hat keine Kollision (steht neben dem Bankett, blockiert nichts).
- **Kollision**: drei Kreise (Radius 0.92 m) entlang der Karosserie, hart wie die anderen Hindernisse.
- Abstand zur nächsten Kreuzung 163 m (Tal) bzw. 87 m (Abfahrt), beide weit weg von Start und Ziel.

**4. Kühe eingefroren** (`js/kuhfolge.js`, wie `js/baumfolge.js` bei den Bäumen): In M3b wurden alle Kühe neu
verteilt, weil eine Zufallsfolge für alle Herden galt. Jetzt stehen die 44 Kühe vom Stand M3b als feste Liste
in der Datei. Beim Laden wird jede noch mit den Regeln geprüft (Strasse, Zäune, Innenseiten …) – passt eine nicht
mehr, fällt sie weg (heute: keine). Neue Herden kommen mit eigenem seed dazu. Neu schreiben (nur wenn man die
Kühe absichtlich neu verteilen will): `node tools/kuhfolge-schreiben.mjs`.

**Regeln, die überall gelten** (prüft `tools/leben-test.mjs`): nichts Neues näher als 6.5 m (Kante) an einer
Strassenmitte (auch an den Stummeln), Fans mindestens 7.2 m und hinter dem Band, nichts auf der Innenseite der
Kurven aus `nichtSchneiden`/`schneiden` (plus 20 bzw. 50 m Puffer) und keiner Kurve enger als 130 m Radius (auch auf
den Nebenwegen), nichts auf Bäumen, Zäunen, Kühen. Passt ein Objekt nicht genau an die Wunschstelle, sucht der Code
ein paar Meter daneben und meldet das (heute: alles an der Wunschstelle).

### Wo man schrauben kann (`js/config.js`, Block `leben`)

| Wert | Was |
|---|---|
| `leben.an` | false = alles wie vor M3d |
| `leben.zaeune`, `torAlle`, `tor` | neue Zäune am Wiesenweg (von, bis, Seite, Tore) |
| `leben.kuehe` | neue Herden (wo, wie viele, wie weit verstreut), eigener seed |
| `leben.wiesenweg` | Alphütte, Heustadel, Brunnen, Wegweiser, Steinmännchen, Heurollen, Findlinge (je s, Seite, Abstand) |
| `leben.fans` | Abstand, Gruppen, Posen; je Spot: Bereich, Anzahl, Band, Banner, Fahnen, Stühle, Wohnmobil/Zelt/Pickup |
| `leben.wracks` | je Wrack: Typ, Farben, Startnummer, Sponsor, Ort (am Baum oder frei), Schaden, Warndreieck, Flagge, Posten |
| `leben.rauch` | Anzahl Wölkchen, Lebensdauer, Steigen, Grösse, Dichte, Farbe, Wind |
| `leben.sichtweite` | weiter weg als 600 m wird ein Ort nicht gezeichnet |

Erfundene Namen (Fanclubs, Sponsoren, Wegweiser-Ziele) stehen in `js/lebenbild.js`.

### So testest du

1. **Wiesenweg** (nach der Passhöhe, durch Checkpoint 3): links der neue Zaun mit Kühen dahinter, weiter vorne links
   die Alphütte mit Brunnen, rechts am Hang der Heustadel und Heurollen, gelber Wegweiser am Wegrand.
   Wirkt es nach Alpweide – und trotzdem noch offen?
2. **Kehre 3** (ca. 1:20 nach dem Start): aussen am Hang hinter der Leitplanke stehen die Fans.
3. **Almweg-Abzweig**: hinter der Strohballen-Wand links stehen Fans mit einem Pickup.
4. **Passhöhe**: rechts der grosse Spot mit Wohnmobil und Pavillon.
5. **Wracks**: im Tal (ca. 25 s nach dem Start, 637 m) rechts am Baum, auf der Abfahrt nach der Leitplanke rechts.
   Reinfahren: hart zum Halt, rückwärts wieder raus.
6. F3: bleibt es auf dem Laptop bei 60 FPS (Kehren, Passhöhe, Wiesenweg)?

### Bilder (`screenshots/m3d/`, „a“ = vorher, „b“ = nachher)

01/02 Wiesenweg Fahrersicht, 03 Wiesenweg von weitem, 04 Alphütte aus der Nähe, 05 Heustadel und Heurollen,
06/07 Kehren-Fans (Fahrersicht, aus 30 m), 08/09 Passhöhe, 10/11 Almweg-Abzweig, 12–15 Wrack Tal (aus 60/30/10 m,
Fahrersicht), 16–19 Wrack Abfahrt. Neu erzeugen: `node tools/m3d-bilder.mjs --endung b`
(und `--wurzel <alter Ordner> --endung a`).

### Selbst getestet

- **Etappe unverändert**: An Strecke, Checkpoints und Listen wurde nichts geändert: Länge 3667.587 m, Checkpoints
  900/1870/2880, `sperren`/`nichtSchneiden`/`schneiden` gleich. **Abkürzungen** (`node tools/abkuerzungen.mjs --pruefen`):
  **127 / 2 / 342 / 84**, 0 in gesperrten Kurven (genau wie vorher – die neuen Objekte sperren und öffnen keine Linie).
- **Testfahrer** (`node tools/testfahrer.mjs`): **2:59.33 / 2:42.35 / 2:31.92** (auf die Hundertstel gleich), keine Aufpralle.
- **Sichtlinien** (`node tools/stummel-sicht.mjs`): alle 6 Stummel und beide Verlängerungen **0** sichtbare Enden.
- **Neuer Test `node tools/leben-test.mjs`** – alles bestanden:
  - Je Wrack 8 Anfahrten (von der Strasse gerade, ±30° schräg, aufs Heck; je 30 und 50 km/h; von der Seite war der
    Weg durch Baum/Zaun versperrt): immer Aufprall, **nach 0.4 s 0 km/h** (aus 53 km/h), nie mehr als 0 cm im
    Wrack, rückwärts immer raus (9–20 m).
  - Regeln: nächste Kante eines neuen Hindernisses **6.48 m** neben einer Strassenmitte (Bankett endet bei 5.5 m),
    nächster Fan/Posten **8.09 m**, alle Fans hinter ihrem Band, nichts auf einer Kurven-Innenseite, Wracks
    10.7 / 9.6 m neben der Mitte, 163 / 87 m bis zur nächsten Kreuzung, nichts weggelassen oder verschoben.
  - Kühe: 44 von 44 alten Kühen genau an ihrem Platz, 10 neue (mindestens 11 m von der Strasse).
  - Sichtlinien wie oben, gleicher seed = gleicher Aufbau, keine Fehler in der Browser-Konsole.
- `aufprall`, `strassenrand`, `kuh`, `nebenweg`, `startziel`, `felswand`, `gras`, `belag`, `lenk`, `getriebe`,
  `handbremse`: alle bestanden, keine Konsolenfehler.
- Ehrlich zu den Test-Anpassungen:
  - `kuh-test`: Die Prüfung „gleicher seed = gleiche Kühe“ plant die Kühe jetzt mit denselben Eingaben wie das Spiel
    (ohne die Hindernisse von M3d, die erst nach den Kühen gebaut werden, und mit den freien Plätzen für die neuen Herden).
  - Im `leben-test` gilt „Innenseite“ bezogen auf das nächste Stück Etappe (und einen zweiten Ast daneben). Eine
    grobere Prüfung („irgendein Kurvenpunkt in 45 m“) meldete die Fans an Kehre 3 als Innenseite, obwohl sie aussen
    an der Kehre stehen: In einer Haarnadel liegt alles neben dem Ausgangs-Ast auch „links“ vom Eingangs-Ast. Dass
    sie keine Abkürzung stören, zeigen die unveränderten 342 Linien genau in dieser Kurve. Das Absperrband an Kehre 3
    beginnt deshalb erst bei 1692 m (davor hätte es diese Regel verletzt).

**Leistung** (`node tools/m3d-bilder.mjs`, Auto dort, Kamera wie im Spiel, Headless):

| Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
|---|---|---|
| Start | 122 → 123 | 148 026 → 148 522 (+500) |
| Kehren (1650 m) | 114 → 117 | 153 772 → 154 276 (+500) |
| Kehren-Fans (1690 m) | 75 → 77 | 141 594 → 142 046 (+450) |
| Passhöhe (2590 m) | 89 → 92 | 142 592 → 145 262 (+2 700) |
| Abfahrt mit Wrack und Pass-Spot im Bild (2470 m) | 97 → 103 | 160 764 → 163 902 (+3 100) |
| Wiesenweg (2950 m) | 78 → 79 | 149 600 → 151 242 (+1 600) |
| Tal mit Wrack (610 m) | 108 → 111 | 142 424 → 142 936 (+500) |
| Ziel (30 m vor der Linie) | 59 → 59 | 107 526 → 107 562 |
| schlimmste Stelle (alle 25 m) | 124 → 128 | 168 230 → 171 228 (+3 000) |

Budget +8 Zeichenaufrufe / +30 000 Dreiecke: eingehalten (höchstens +6 / +3 100). Je Ort ein Teil, Figuren und
Rauch instanziert, weiter weg als 600 m wird nichts davon gezeichnet. Zäune und Kühe kommen in die schon
bestehenden Zeichenaufrufe. **Ladezeit** (`node tools/ladezeit.mjs`, 9 Messungen abwechselnd, Median): 2211 → 2297 ms
(+86 ms, Budget +300 ms; die eingefrorenen Kühe sparen etwas Rechenzeit).

### Ehrlich beurteilt

- **Lebendig, aber nicht überladen?** Ja, meistens. Der **Kehren-Spot** wirkt am besten: Fans an der Leitplanke und
  verteilt am Hang, das sieht nach Rallye aus. Die **Passhöhe** ist der belebteste Ort ausser Start/Ziel. Der
  **Wiesenweg** wirkt jetzt nach Alp (Hütte, Zaun, Kühe), bleibt aber weit – aus der Fahrersicht sieht man die Hütte
  links und Kühe, der Rest ist Wiese. Am **Almweg** ist der Spot klein und steht etwas hinter Tannen: aus der
  Fahrersicht sieht man die Fans erst kurz vor der Strohballen-Wand.
- **Sehen die Wracks nach Group-B-Rallyeautos aus?** Aus 10–30 m: ja – breite eckige Radkästen, Flügel, Hutze,
  Lampenleiste, Startnummer und die rot-weisse bzw. blau-gelbe Lackierung sind klar zu erkennen, und sie sehen nicht
  nach einem echten Modell aus (keine Grill-/Logo-Kopie, eigene Proportionen). Ehrlich: Aus 60 m sind sie im
  320x180-Bild nur ein kleiner farbiger Fleck, und die Sponsor-Schrift ist auch aus der Nähe eher Pixel-Muster.
  Die Startnummern sieht man erst aus ca. 10 m.
- **Rauch**: dezent, als gerastertes Pünktchen-Muster wie der Staub. Aus der Nähe sieht man das Raster deutlich
  (passt zum Pixel-Look, ist aber nicht „weich“).
- **Stört etwas das Fahren oder die Sicht?** Nein: Abkürzungen, Testfahrer-Zeiten und Sichtlinien sind exakt gleich,
  nichts steht auf Fahrbahn oder Bankett. Das Warndreieck an der Abfahrt steht direkt vor der Leitplanke am Rand des
  Banketts (ohne Kollision).

### Bekannte Probleme

- Leistung nur im Headless-Browser gemessen; bitte auf dem Laptop mit F3 an der Passhöhe (Fans + Wrack im Bild)
  und an Kehre 3 prüfen.
- Die Streckenposten und Fans reagieren nicht auf das Auto.
- Die Figuren haben wie in M3c 4 Ansichten; sitzende Fans auf den Klappstühlen sieht man von schräg hinten etwas flach.

### Ideen/Vorschläge (nicht umgesetzt)

- Streckenposten schwenken die gelbe Flagge schneller, wenn das Auto naht; Fans jubeln beim Vorbeifahren.
- Pace-Note „Achtung, Wrack“ / gelbe Flagge als Symbol (M4).
- Rauch etwas weicher (z. B. zwei Grautöne statt Raster), wenn es auf dem Laptop gut läuft.
- Ein drittes, ausgebranntes Wrack als Hingucker an einer Kehre.
- Heuballen-Stapel und ein Melkstand an der Alphütte; Glockengeläut der Kühe, wenn es Ton gibt.
- Fan-Spot an Kehre 1 oder 2 (Platz wäre da) für mehr Stimmung in der Kehrengruppe.

---

## Meilenstein 3b: Zwei weitere Nebenwege (Almweg, Wiesenweg) ✅ (Verlauf, Stand damals)

### Was wurde gebaut?

**1. Almweg (Schotter) nach den Kehren – 1985.6 bis 2400.8 m (ca. 415 m)**
- Kurz nach dem Anfang der Felswand (die Wand hört jetzt vor dem Abzweig auf) biegt die Etappe bei **1985.6 m nach
  rechts** ab (45°, Talseite). Danach eine grosse Linkskurve (Radius 110 m), eine **lange Gerade (ca. 220 m)** leicht
  bergauf (ca. 8 %, wie die Hauptstrasse, mit einer kleinen Kuppe), eine grosse Rechtskurve (Radius 80 m), und bei
  **2400.8 m** kommt der Almweg **von links (Bergseite)** zurück auf die Hauptstrasse. Danach geht die Felswand weiter.
- Abstand zu den Kurven aus `nichtSchneiden`/`schneiden`: Abzweig 131 m nach 1854, Einmündung 83 m vor 2484.
- Checkpoint 2 (1870 m) steht davor auf Asphalt, unverändert.
- Absperrungen (automatisch reihum): **Strohballen** am Abzweig, **Holzböcke** an der Einmündung.

**2. Wiesenweg (neuer Belag) auf der Abfahrt – 2797.7 bis 3107.9 m (ca. 310 m)**
- Bei **2797.7 m** geht es **rechts** weg auf einen **Feldweg über die Wiese** (Kreuzung flacher, 36°), Kurve links,
  lange Gerade bergab (ca. 5 %), Kurve rechts, bei **3107.9 m** von links zurück auf die Hauptstrasse. Die Felswand der
  Abfahrt beginnt erst danach.
- Abstand zu den Kurven: Abzweig 88 m nach 2710, Einmündung 88 m vor 3196.
- **Checkpoint 3 (2880 m) steht auf dem Wiesenweg**, gleich nach der Linkskurve am Anfang der Geraden. Das Tor ist
  schmaler (10.6 m statt 12.4 m, `checkpoints.torBreiteWiesenweg`).
- Absperrungen: **Flatterband** am Abzweig, **Reifen** an der Einmündung.
- **Aussehen** (`wiesenwegTextur()` in `js/pixel.js`): erdbraun, zwei dunklere festgefahrene **Fahrspuren**, in der
  Mitte und am Rand wächst **Gras** herein (wellig, ausgefranst), einzelne Halme in der Erde, kein Mittelstrich.
  Statt des erdigen Banketts hat er einen **grasigen Rand** (`wiesenwegRandTextur()`), damit er wie ein Feldweg in der
  Wiese aussieht und nicht wie eine Wiese mit braunem Streifen. Breite 5.2 m (Schotter 6.2 m, Asphalt 7 m).
- **Fahrgefühl** (`untergrund.wiesenweg`): Grip 0.64, Rollen 0.9 / 0.03, dazu Heck 0.7 und Stabilität 0.5. Wie in
  M3a gelernt: Mit weniger Grip allein wurde das Auto nur träger (Drift 3° statt 8° auf Schotter). Mit dem
  lockereren Heck driftet es unter Gas jetzt **mehr als auf Schotter**, lässt sich aber immer einfangen (Zahlen unten).
- **Staub**: dunkler, erdig und schwächer als auf Schotter (`staub.belaege`). F3 zeigt „UNTERGRUND WIESENWEG“.

**3. Was sonst dazugekommen ist**
- **Strohballen kleiner**: flache Ballen (1.2 x 1.1 x 0.82 m), zwei Lagen = **1.64 m statt 2.4 m**. Das gilt auch für die
  Strohballen-Wand hinter dem Start (dieselbe Absperrart).
- Die **Absperr-Arten wechseln automatisch**: Band, Reifen (Talschleife, unverändert) → Heu, Holzböcke (Almweg) →
  Band, Reifen (Wiesenweg). Nie zweimal dieselbe hintereinander; Heu und Holzböcke stehen jetzt zum ersten Mal im Spiel.
- **Richtungstafeln** ca. 70 m vor jeder neuen Kreuzung (1916, 2298, 2728, 3018 m). Findet sich auf der üblichen Seite
  kein Platz (dichter Waldrand), sucht sie weiter vorne/hinten und zuletzt auf der anderen Seite. Steht sie hinter einer
  freien Kurve („schneiden“), hält sie wie Zäune und Planken 50 m Abstand zu deren Innenseite (sonst stand eine Tafel
  einer Abkürzungs-Linie im Weg).
- **Stummel**: Die Hauptstrasse läuft an allen vier neuen Kreuzungen weiter (Asphalt, Mittelstrich, Holzzaun als
  Seitenschutz), biegt hinter der Absperrung ab und verschwindet hinter Kuppe und Kurve. Weil die neuen Kreuzungen
  flacher sind (36–45° statt 66–80°), liegen Stummel und Etappe länger übereinander – darum liegt der Stummel länger genau
  auf der Höhe der Etappe (`hoeheAngleichen` je Stummel). Vorher gab es am Wiesenweg-Abzweig eine **30-cm-Stufe**, jetzt 0.1 cm.
- **Waldrand** (je Nebenweg eigene Werte, `nebenwege[].wald`): Alp und Wiese mit **lockeren Gruppen und viel Wiese**,
  dicht nur auf der Innenseite der Kurven (dort könnte man abkürzen). Am Wiesenweg mehr Felsbrocken statt Tannen (30 %).
  Drei von Hand gesetzte Gruppen: Almweg 2075 m links, Wiesenweg 2765 und 2812 m rechts (ein kleines Wäldchen in der
  Ecke des flachen Abzweigs: Quer über die Wiese sparte man dort sonst bis 8.7 m = 1.7 s).
- **Strecke**: Die Etappe ist **genau gleich lang** (3667.587 m, Abweichung 0.000002 m). Alles bis 1966 m liegt auf den
  Millimeter gleich, alles nach 3150 m höchstens 2 mm daneben. Nur direkt neben den Anschlusspunkten bewegt sich die
  Strasse ein paar Zentimeter (2422–2470 m bis 8 cm, 3131–3150 m bis 11 cm) – so rechnet die Kurve durch die Punkte.
- **Abschnitte**: „Felswand 1“ ist jetzt zweigeteilt (vor dem Almweg und danach), die Abfahrt mit Felswand beginnt erst
  nach dem Wiesenweg (3108 statt 2904 m).

### Wo man schrauben kann (`js/config.js`)

| Wert | Was |
|---|---|
| `nebenwege` | die drei Nebenwege: `abzweig`/`einmuendung` (Meter), `belag`, Absperrung (leer = reihum), Stummel-Form, `wald` |
| `belaege.wiesenweg` | Breite (5.2 m), kein Mittelstrich, `grasRand` (Rand grasig statt Erde) |
| `untergrund.wiesenweg` | `grip`, `rollen`, `rollenTempo`, `heck`, `stabilitaet`, `geradeaus`, `rueckwaerts` |
| `farben.wiesenweg`, `.wiesenwegSpur`, `.wiesenwegGras` | Erde, Fahrspuren, Gras des Feldwegs |
| `staub.belaege` | Staubfarbe und -stärke je Belag (Wiesenweg: dunkler, Stärke 0.55) |
| `checkpoints.torBreiteWiesenweg` | Torbreite auf dem Wiesenweg (10.6 m) |
| `absperrung.heu` | Grösse der Strohballen (jetzt 1.2 x 1.1 x 0.82 m) |
| `absperrung.sichtweite` | Absperrungen der neuen Nebenwege weiter weg als 350 m nicht zeichnen (spart Leistung) |
| `nebenwegWald.gruppen` | von Hand gesetzte Baumgruppen (jetzt auch am Almweg und Wiesenweg) |

### So testest du

1. **Almweg** (ab dem Start ca. 1:40): Nach den Kehren und dem Anfang der Felswand kommt die gelbe Tafel (Pfeil rechts),
   dann die Strohballen-Wand. Rechts auf den Schotter, die lange Gerade hoch, bei der Einmündung von links auf den
   Asphalt (Holzböcke rechts).
2. **Wiesenweg** (nach der Passhöhe): Tafel mit Pfeil rechts, Flatterband, rechts auf den Feldweg, durch Checkpoint 3.
   Driften, Handbremse, bremsen, anfahren. F3 zeigt „WIESENWEG“. Ist der Staub dunkler und schwächer als auf Schotter?
3. **Kreuzungen** langsam anfahren und anschauen (60/30/15 m): Liegt irgendwo Schotter oder Feldweg auf dem Asphalt?
   Sieht man irgendwo, wo der Asphalt aufhört?
4. **In die Absperrungen** fahren und versuchen, aussen herum in die Stummel zu kommen – soll nicht gehen.
5. **Abkürzen** über die Wiese an den Kreuzungen und in den Kurven – soll sich nicht lohnen.
6. F3: bleibt es auf dem Laptop bei 60 FPS (besonders am Wiesenweg)?

### Bilder (`screenshots/m3b/`, „a“ = vorher, „b“ = nachher)

Je Nebenweg (01–12 Almweg, 13–24 Wiesenweg): Abzweig aus 60/30/15 m, Fahrersicht mit Stummel (25 m vor dem Abzweig,
Blick in den Stummel), mitten im Weg, Fahrersicht 25 m vor der Einmündung, Einmündung aus 60/30/15 m, Staub bei normaler
Fahrt, jede Absperrung aus 20 m. Die „a“-Bilder zeigen dieselben Streckenmeter in der alten Version (dort noch Hauptstrasse).
Neu erzeugen: `node tools/m3b-bilder.mjs --endung b` (und `--wurzel <alter Ordner> --endung a`).

### Selbst getestet

- **Streckenlänge** 3667.5869 m (unverändert), Checkpoints 900/1870/2880, Listen `sperren`, `nichtSchneiden`,
  `schneiden` unverändert.
- **Abkürzungen** (`node tools/abkuerzungen.mjs --pruefen`): **127 / 2 / 342 / 84** (genau wie vorher), 0 in gesperrten
  Kurven, **keine neuen Abkürzungs-Zonen** an den neuen Nebenwegen.
- **Waldrand** (`node tools/nebenweg-wald.mjs`, jetzt für alle Nebenwege, auch Linien aus einer Kurve davor über die
  Kreuzungsecke): Talschleife, Almweg und Wiesenweg je **0 Abkürzungs-Linien**. Talschleife unverändert 185 Tannen +
  30 Felsen; Almweg 201 Tannen + 24 Felsen (auf 415 m), Wiesenweg 132 Tannen + 43 Felsen (auf 310 m).
- **Sichtlinien** (`node tools/stummel-sicht.mjs`): Stummel 3–6 mit 5540 / 722 / 7169 / 1444 Strahlen – **0** sehen das
  Ende (auch nur mit dem Gelände, ohne Bäume: 0). Start und Ziel unverändert 0.
- **`node tools/nebenweg-test.mjs`** (jetzt für alle drei Nebenwege) – alles bestanden:
  - Rennlogik: an allen 6 Stummeln zählt die Etappe, „R“ setzt auf die Etappe; in jeden Abzweig-Stummel bis zur
    Absperrung und zurück, dann über den Nebenweg: kein „VERPASST“, CP1 und CP3 zählen.
  - Jede Absperrart an allen 6 Leitwänden (je 270 Anfahrten, 40/70/100 km/h, 0°/±20°/±40°): nie durch, frontal
    Stillstand nach höchstens 0.18 s, schräg nach 0.3 s höchstens 24 % Tempo, rückwärts immer raus (mind. 6.8 m).
  - Umfahren: je Stummel 1080 Versuche (6480 insgesamt) – **0** kamen auf einen Stummel.
  - Höhenprofil: grösste Stufe am Almweg und Wiesenweg 0.1 cm (übrige Strecke 3.5 cm), Steigungsänderung höchstens 0.9 %
    auf 2 m (übrige Strecke 2.8 %).
  - Fahrtest über die Kreuzungen: Almweg 7.5 m/s² / 3.0 °/s, Wiesenweg 4.4 m/s² / 4.6 °/s (übrige Strecke 6.8 m/s² / 9.6 °/s).
  - Staub geradeaus: Schotter links 7 / rechts 7, Wiesenweg links 3 / rechts 3 Wölkchen (beidseitig gleich, schwächer).
- **Fahrgefühl je Belag** (`node tools/belag-test.mjs`, neu, ohne Browser):

  | Belag | Drift unter Gas (max / Mittel) | Handbremse: Drift, wieder gerade nach | Bremsweg 80→0 | 80 km/h ausrollen, nach 3 s | 0→50 km/h, 8 % bergauf | engster Radius bei 60 km/h |
  |---|---|---|---|---|---|---|
  | Asphalt | 4.7° / 3.7° | 17°, 0.6 s | 23.2 m | 70 km/h | 2.3 s | 32 m |
  | Schotter | 9.2° / 8.0° | 17°, 0.8 s | 22.2 m | 65 km/h | 2.7 s | 40 m |
  | **Wiesenweg** | **15.7° / 10.7°** | **15°, 0.8 s** | **23.9 m** | **56 km/h** | **4.0 s** | **52 m** |
  | Gras | 2.4° / 1.8° | 13°, 0.5 s | 19.6 m | 32 km/h | 9.3 s | 51 m |

  Asphalt und Schotter genau wie vorher. Wiesenweg: driftet am meisten, wird aber in 0.8 s eingefangen (kein Eis),
  bremst kaum schlechter als Asphalt, hält in Kurven so wenig wie Gras, bremst beim Ausrollen weniger als Gras.
- **Testfahrer** (`node tools/testfahrer.mjs`): **2:59.33 / 2:42.35 / 2:31.92** (vorher 2:43.28 / 2:27.62 / 2:18.27, also
  +16.1 / +14.7 / +13.7 s – gewollt, Nebenwege sind langsamer). CP1 und CP2 auf die Hundertstel gleich. Auf beiden
  neuen Wegen höchstens 0.8 m neben der Mitte, **0 s neben dem Weg**, keine Aufpralle.
- `aufprall-test`, `strassenrand-test`, `kuh-test`, `lenk-test`, `getriebe-test`, `handbremse-test`, `gras-test`,
  `startziel-test`, `felswand-test`: alle bestanden, keine Fehler in der Browser-Konsole.
- Ehrlich zu den Test-Anpassungen:
  - `felswand-test` prüfte fest bei 2117, 2300 und 3100 m – dort steht jetzt keine Felswand mehr. Er sucht sich die
    Stellen jetzt selbst (Mitte jedes Wandstücks mit voller Höhe: 2446 und 3275 m).
  - `gras-test` zählte „zurück auf der Strasse“ nur auf Asphalt. Neben dem Almweg und dem Wiesenweg kommt man rückwärts
    auf Schotter bzw. den Feldweg zurück – das zählt jetzt auch (807 von 807).
  - `nebenweg-test`: Bei der flachen Wiesenweg-Kreuzung stand ein Anlauf-Startpunkt im Weidezaun. Der Test sucht jetzt
    einen freien Anlauf (12, 9 oder 7 m); gefunden wurde überall einer.
  - `nebenweg-bogen.mjs`: kann jetzt mehrere Nebenwege nacheinander rechnen (`--nur Name`) und nimmt am Start/Ende die
    Richtung der Kurve statt der Sehne (sonst entstand dort ein kleiner Knick).

**Leistung** (`node tools/m3b-bilder.mjs`, Auto dort, Kamera wie im Spiel, Headless):

| Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
|---|---|---|
| Start | 120 → 122 | 144 431 → 148 026 (+3 600) |
| Nebenweg 1 (900 m) | 93 → 94 | 150 189 → 152 696 (+2 500) |
| Almweg (2150 m) | 105 → 99 | 136 056 → 140 238 (+4 200) |
| Wiesenweg (2950 m) | 73 → 78 | 134 388 → 149 600 (+15 200, vor allem die Reifenwand der Einmündung) |
| Ziel (30 m vor der Linie) | 59 → 59 | 108 114 → 107 526 |
| schlimmste Stelle (alle 25 m) | 122 → 124 | 165 301 → 168 230 (+2 900) |

Budget +10 Zeichenaufrufe / +20 000 Dreiecke: eingehalten (höchstens +5 / +15 200). Damit es reicht, sind zwei Dinge
neu: Die Absperrungen der neuen Nebenwege sind je eine eigene Geometrie und gehen weiter weg als 350 m aus (vorher
wären alle Absperrungen überall mitgezeichnet worden, +11 000 Dreiecke schon am Start), und der Belag der Nebenwege ist
nur noch an den Kreuzungen in 8 Streifen geteilt (dort braucht es sie), sonst in einen. **Ladezeit**
(`node tools/ladezeit.mjs`, 7 Messungen abwechselnd, Median): 1677 → 1903 ms (+226 ms, Budget +300 ms).

### Ehrlich beurteilt

- **Asphaltanfang/-ende**: Auf keinem Bild und laut Sichtlinien-Check nirgends zu sehen. **Belag auf dem Asphalt**:
  nein – der Schotter/Feldweg liegt unter dem Asphalt, die Kante ist sauber ausgefranst.
- **Wiesenweg**: sieht wie ein Feldweg aus (zwei Erdspuren, Grasstreifen in der Mitte, grasiger Rand). Aus der Ferne
  wird er eher zu einem dunklen, erdigen Band – das ist gewollt (ruhig, kein Flimmern).
- **Staub**: Bei normaler Fahrt (Bilder 10 und 22) ist er absichtlich schwach, nur ein paar gerasterte Pünktchen –
  auf dem Wiesenweg noch weniger und erdbraun. Richtig sichtbar wird er beim Driften und mit der Handbremse.
- **Fahrgefühl Wiesenweg**: rutschig und driftfreudig, aber gutmütig (Zahlen oben). Anfahren am Berg dauert länger
  (4 s auf 50 km/h statt 2.7 s auf Schotter), das Auto rollt aber nie zurück. Ob es sich *spassig* anfühlt, kann nur
  Lino am Lenkrad sagen – bitte ausprobieren und Feedback geben (Werte in `untergrund.wiesenweg`).
- **Kreuzungen am Wiesenweg** sind flacher (36°) als die anderen. Grund: Die Etappe muss genau gleich lang bleiben,
  und die alte Strasse war dort fast gerade – ein steilerer Abzweig hätte zu viel Umweg gemacht. Darum sind die
  Leitwände dort länger (ca. 37 m) und Stummel und Feldweg laufen ein Stück nebeneinander.
- **Almweg und Wiesenweg** sind mit 415 m bzw. 310 m etwas länger als geschätzt (250–400 / 200–300 m) – aus demselben
  Grund (gleiche Länge, die Kreuzungen brauchen Platz).
- **Bäume**: Wiese mit Gruppen, kein Allee-Gefühl auf den Geraden; auf der Innenseite der Kurven aber dichte Tannen
  (sonst könnte man abkürzen). Am Almweg vor der Einmündung wirkt die Innenseite der Rechtskurve recht dicht.

### Bekannte Probleme

- **Kühe neu verteilt**: 44 statt 35 Kühe. Weil die Felswand beim Almweg jetzt eine offene Alpwiese ist und am
  Wiesenweg mehr Wiese liegt, würfelt der Kuh-Planer alle Herden neu (eine Zufallsfolge für alle). Der Kuh-Test ist
  erfüllt (alle erreichbar, nicht auf der Strasse), aber sie stehen an anderen Stellen als vorher.
- Die Strohballen-Wand am Start ist mit den kleineren Ballen auch niedriger (1.64 m statt 2.4 m).
- Leistung nur im Headless-Browser gemessen; bitte auf dem Laptop mit F3 prüfen (vor allem am Wiesenweg).

### Weitere Nebenwege hinzufügen (aktualisiert für M3b)

1. Ein Stück der Etappe aussuchen. **Wichtig: Der neue Weg muss genau so lang sein wie das ersetzte Stück** – auf einer
   fast geraden Strasse ist darum nur wenig Umweg möglich (Almweg: ca. 16 m, Wiesenweg: ca. 6 m). Kreuzungen mit 35–50°
   und kleine Radien (25–30 m) kosten am wenigsten Weg.
2. In `tools/nebenweg-bogen.mjs` einen Eintrag in `BOGEN_LISTE`: Start- und Endpunkt (Stützpunkte, die bleiben),
   `startNach`/`endeVor` (die alten Nachbarpunkte, für die Richtung), die Stücke (je eine Gerade `frei: 'lage'` zweimal –
   **nicht parallel**, eine Kurve `frei: 'laenge'`, eine `frei: 'richtung'`), Abschnitt-Zeilen am Abzweig und nach der
   Einmündung, `anzahlPunkte` = so viele Punkte, wie zwischen Start und Ende stehen (dann bleibt der Rest auf den mm gleich).
3. In `js/track.js` die alten Punkte zwischen Start und Ende mit den Zeilen `// <nebenweg NAME>` und `// </nebenweg>`
   einrahmen (die alten Punkte dazwischen lassen!), dann `node tools/nebenweg-bogen.mjs --nur NAME`. Findet es keine
   Lösung, zeigt `--zeigen --abtasten` die Längen (zu lang: weniger Umweg, zu kurz: mehr Kurven).
4. In `js/config.js` bei `nebenwege` den Eintrag mit `abzweig`/`einmuendung` aus der Ausgabe „Streckenmeter“.
   **Stummel-Kurve**: Biegt die Etappe am Abzweig rechts ab, muss der Abzweig-Stummel nach links (`kurve` negativ);
   mündet sie mit einer Linkskurve ein, muss der Einmündungs-Stummel ebenfalls nach links (sonst kreuzt er den Nebenweg).
   Bei flachen Kreuzungen `hoeheAngleichen` vergrössern.
5. Prüfen: `node tools/stummel-sicht.mjs`, `node tools/nebenweg-wald.mjs`, `node tools/abkuerzungen.mjs --pruefen`,
   `node tools/nebenweg-test.mjs`, `node tools/testfahrer.mjs`; bei offenen Abkürzungen von Hand Gruppen in
   `nebenwegWald.gruppen` setzen.

### Ideen/Vorschläge (nicht umgesetzt)

- Kuh-Herden „einfrieren“ wie die Bäume (feste Zufallsfolge je Herde), damit Streckenänderungen sie nicht mehr verschieben. (umgesetzt in M3d)
- Am Wiesenweg ein Weidegatter oder ein Heuschober als Blickfang neben dem Weg. (umgesetzt in M3d)
- Spritzer aus Erdklumpen statt Staub, wenn es nass ist (mit dem Wetter in einem späteren Meilenstein).
- Pace-Notes „Achtung Feldweg“ / „Schotter“ an den Abzweigen (M4).
- Kreuzungen steiler machen, wenn man dafür das ersetzte Stück länger wählt (z. B. mit einer zusätzlichen Kurve der
  alten Strasse) – braucht etwas Planung, weil die Strecke gleich lang bleiben muss.

---

## Meilenstein 3c: Start- und Zielbereich ✅ (Verlauf, Stand damals)

### Was war das Problem – und was wurde gemacht?

**1. Die Strasse hörte an Start und Ziel abrupt auf („Stummel“)**
- *Lösung:* Hinter dem Strassenanfang und hinter dem Strassenende läuft die Strasse jetzt weiter – mit Asphalt,
  Bankett und Mittelstrich, genau wie die Stummel am Nebenweg (M3a). Es sind **Nebenäste**: Rennlogik, Zeit,
  Checkpoints und „R“ kennen sie nicht. Die Etappe selbst ist **genau gleich** (3667.587 m, alle Streckenmeter,
  Checkpoints, Abkürzungs-Listen und Sperren unverändert).
  - **Start:** Hinter dem Auto läuft die Strasse 80 m geradeaus, dann eine Rechtskurve (75°) über eine kleine Kuppe.
    34 m hinter dem Strassenanfang (44 m hinter dem Auto) ist sie mit einer **gebogenen Wand aus Strohballen** zu,
    dahinter parkt der **Service-Transporter** auf der Strasse, daneben das **Servicezelt**. Links und rechts der
    Absperrung geht ein Holzzaun weiter, so kommt niemand aussen herum.
  - **Ziel:** Hinter der Ziellinie läuft die Strasse noch **ca. 200 m** als Ausrollstrecke weiter, dann kommt eine
    **gebogene Wand aus Reifenstapeln**, dahinter eine Linkskurve (80°) über eine Kuppe in den Wald.
  - **Ausrollen:** Nach dem Ziel bremst das Auto wie bisher von selbst, jetzt etwas kräftiger (`startZiel.zielBremse`
    0.35 → 0.6), damit es auch aus 180 km/h sicher vor der Absperrung steht (siehe Zahlen unten). Die Zeit ist zu
    diesem Moment schon gestoppt – an der Fahrzeit ändert das nichts.
  - **Unsichtbare Grenze:** Die Ausrollstrecke zählt bis zur Absperrung wie die Strasse (sonst hätte die alte
    45-m-Grenze das Auto nach dem Ziel abgefangen).
  - **Boden:** Auf den Verlängerungen ist es Asphalt, am Übergang gibt es keine Gras-Lücke mehr (vorher waren die
    letzten 0.5 m der Strasse und alles dahinter „Gras“).
  - **Kamera:** Fährt man rückwärts in die Absperrung, hebt sich die Kamera über die Strohballen (sonst sah man ins Stroh).

**2. Am Start und im Ziel war fast nichts los**
- **Startbogen und Zielbogen** über der Linie: Alu-Gerüst mit Banner „START“ (blau, Zielflaggen) bzw. „ZIEL“
  (Schachbrett). Das Banner hängt mindestens 4.1 m über der Strasse, die Pfosten stehen ausserhalb von Band/Zaun.
- **Absperrband** an rot-weissen Stangen entlang beider Seiten (ca. 70 m vor und nach den Linien, am Start ab der
  Absperrung). Wo schon ein **Weidezaun** steht, bleibt der Zaun (die Zuschauer stehen dahinter), und die
  **Weidetore** sind mit **Strohballen** zu. Dazu lockere Strohballen-Stapel vor Band und Zaun.
- **96 Zuschauer** (Start 50, Ziel 46) in Gruppen: Pixel-Figuren mit bunten Jacken, Hosen, Mützen und Haaren,
  7 Posen (stehend, winkend, jubelnd, Schweizer Fahne, einfarbige Fahne, Fotograf, Mütze/Hände in den Taschen),
  ein paar Kinder. Sie **schauen zur Strasse** (4 Ansichten je nach Blickwinkel, wie die Kühe), wer winkt oder eine
  Fahne hat, bewegt sich (2 Bilder). Immer mindestens 7.4 m neben der Strassenmitte.
- **Start:** Startuhr (0:30, Lampen), rotes Zeitnahme-Zelt mit Schild „ZEITNAHME“, Servicezelt + Transporter hinter
  der Absperrung, ein parkiertes Auto (blau).
- **Ziel:** Zeitnahme-Container mit Fenstern, Tür, Treppe und Schild, gelb-blaues Zelt, ein parkiertes Auto (gelb).
- Fahnenmasten (Schweizer Kreuz, Zielflagge, farbig), Beachflags und Werbebanden mit **erfundenen Sponsoren**
  (BERGKRAFT, SENNHOF, RINGWERK, PASSGOLD).
- **Landschaft:** 222 Bäume mehr (148 Tannen, 74 Laubbäume) (Tannen und Laubbäume in Gruppen, auch entlang der Ausrollstrecke und um die
  versteckten Enden), Büsche hinter den Zuschauern, **2 neue Kuhherden** (je 5 Kühe: Start rechts bei ca. 150 m,
  Ziel rechts auf der Weide vor dem Zuschauerbereich). Alle 25 bisherigen Kühe stehen genau gleich wie vorher.
- Alles, was man anfahren kann, ist ein **Hindernis** (hart zum Halt wie ein Zaun), nichts steht auf Fahrbahn oder
  Bankett. Alle Mengen und Abstände in `config.js`, Block `startZiel`, fest gewürfelt (seed).

### Wo man schrauben kann (`js/config.js`)

| Wert | Was |
|---|---|
| `startZiel.an` | false = alles wie vor M3c |
| `startZiel.zielBremse` | so stark bremst das Auto nach dem Ziel von selbst (0.6; vorher 0.35) |
| `startZiel.start` / `.ziel` | Form der Verlängerung (`form`: gerade, Kurve, Radius, Kuppe), wo die Absperrung steht (`sperreBei`), wie gebogen, welche Art |
| `startZiel.bereich` | wie weit vor/nach der Linie Band und Zuschauer gehen (70 / 70 m) |
| `startZiel.bogen` | Höhe, Pfostenabstand, Bannerbreite der Bögen |
| `startZiel.band`, `.stroh`, `.bande`, `.fahne` | Absperrband, Strohballen, Werbebanden, Fahnenmasten |
| `startZiel.platz` | wo Startuhr, Zelte, Container, Autos, Beachflags stehen (Meter ab der Linie, seitlich) |
| `startZiel.zuschauer` | Anzahl, Abstand zur Strasse, Gruppen, Posen-Anteile, Kinder, Farben |
| `startZiel.landschaft` | Baumgruppen (wo, wie viele), Büsche |
| `kuehe.zusatzHerden` | die zwei neuen Herden bei Start und Ziel |

Nach Änderungen an der Form der Verlängerungen: `node tools/stummel-sicht.mjs` (Ende darf man nie sehen) und
`node tools/startziel-test.mjs`.

### So testest du

1. **Start:** Schau dich in der Startaufstellung um. Fahr **rückwärts** nach hinten: Nach ca. 44 m kommt die
   Strohballen-Wand, dahinter Transporter und Servicezelt. Kommst du irgendwo vorbei (Band, Zaun)? Soll nicht gehen.
   Wenden und zurückschauen: Die Strasse läuft weiter und verschwindet in einer Kurve – siehst du irgendwo ihr Ende?
2. **Zeit:** Die Zeit startet weiterhin erst an der Startlinie.
3. **Ziel:** Mit Vollgas durchs Ziel und Gas gedrückt halten: Das Auto bremst von selbst und steht deutlich vor der
   Reifenwand (aus 180 km/h ca. 165 m nach der Linie, Wand bei ca. 200 m).
4. Zuschauer anschauen: Winken sie, schauen sie zur Strasse? Wirkt es lebendig, aber nicht überladen?
5. Leistung: Bleibt es an Start und Ziel bei 60 FPS (F3)?

### Bilder (`screenshots/m3c/`, „a“ = vorher, „b“ = nachher)

01 Startaufstellung (Fahrersicht), 02 Start von hinten/oben, 03 Blick rückwärts (Auto gewendet), 04/05 Zieleinfahrt
aus 100 m / 30 m, 06 nach dem Ziel beim Ausrollen, 07 Ende der Ausrollzone, 08 Start von der Seite, 09 Ziel von oben,
10 Servicepark hinter der Absperrung, 11 Zeitnahme-Container, 12 Zuschauer aus der Nähe, 13 Zielbogen aus 12 m.
Neu erzeugen: `node tools/m3c-bilder.mjs --endung b`.

### Selbst getestet

- **Etappe unverändert:** Länge 3667.5869 m, Startlinie 25 m, Ziellinie 45 m vor dem Ende, Checkpoints 900/1870/2880,
  Abkürzungs-Listen unverändert. **Abkürzungen** (`--pruefen`): **127 / 2 / 342 / 84**, 0 in gesperrten Kurven.
- **Testfahrer:** mittel **2:27.62**, flott **2:18.27** (genau gleich), vorsichtig **2:43.28** (vorher 2:43.29).
  Ehrlich zu den 0.01 s: Der Testfahrer plant sein Tempo bis ans Strassenende. Der letzte Strassenpunkt war vorher
  „Gras“, jetzt Asphalt – darum plant er dort minim später zu bremsen und ist an der Ziellinie 0.04 m/s schneller.
  Fahrphysik und Etappe sind gleich (alle Zwischenzeiten auf die Hundertstel gleich).
- **Neuer Test `node tools/startziel-test.mjs`** – alles bestanden:
  - Rennlogik: Auto auf der Verlängerung hat das s der Etappe (vor 0 bzw. nach dem Ende), „R“ setzt auf die Etappe,
    vom Start rückwärts bis zur Absperrung und zurück: Zeit startet erst an der Startlinie (bei 25.1 m), keine Meldung;
    nach dem Ziel bleibt die Endzeit, auch auf der Ausrollstrecke.
  - Ausrollen (Auto lenkt der Strasse nach, Bremshilfe):

    | Tempo vor dem Ziel | mit Gas gedrückt: steht nach … hinter der Linie | ohne Gas |
    |---|---|---|
    | 120 km/h | 95 m | 72 m |
    | 150 km/h | 127 m | 109 m |
    | 180 km/h | 164 m (34 m vor der Reifenwand) | 149 m |

    Nie ein Aufprall.
  - Rückwärts am Start: 45 Versuche (3 Spuren, gerade und schräg bis 35°, mit voll eingeschlagener Lenkung, 14 s voll
    rückwärts): nie hinter die Absperrung, danach immer wieder weg.
  - Vorwärts in die Reifenwand am Ende der Ausrollstrecke (ohne Bremshilfe, 40–100 km/h, 0°/±20°/±40°): nie hindurch,
    frontal Stillstand nach höchstens 0.19 s, rückwärts raus.
  - Umfahren: Start 1800, Ziel 1440 Versuche (von der Strasse und der Wiese, um beide Enden herum, mit/ohne
    Handbremse): **0** kamen hinter eine Absperrung.
  - Kein Hängenbleiben: Bögen, Zuschauer, Strohballen, Band, Zelte, Container, Autos, Banden, Fahnen mit 45 km/h
    angefahren (von der Strasse und von der Wiese): steckt nie drin, rückwärts immer raus.
  - Regeln: 96 Zuschauer, mindestens 7.42 m neben jeder Strassenmitte, schauen zur Strasse; nächstes Hindernis
    5.65 m neben der Mitte (Bankett endet bei 5.5 m); tiefster Teil über der Strasse 4.1 m (Banner); Boden auf den
    Verlängerungen und an den Übergängen überall Asphalt; gleicher seed = gleicher Aufbau.
- **Sichtlinien** (`node tools/stummel-sicht.mjs`, erweitert): Kameras 2.5 m hoch, 3.1 m und 6.9 m hinter dem Auto,
  auf der Etappe bis 400 m vor Start/Ende und auf der Verlängerung bis zur Absperrung, das Auto in Fahrtrichtung
  **und gewendet**: Start 15 066, Ziel 21 546 Strahlen – **0** sehen das Ende. Schon allein durch das Gelände (ohne
  Bäume) 0. Zur Kontrolle: Der Check sieht die Verlängerung bis 121 m (Start, Länge 189 m) bzw. 222 m (Ziel, 300 m) –
  das Ende ist also mit Abstand versteckt.
- `aufprall-test`, `strassenrand-test`, `kuh-test`, `nebenweg-test`, `gras-test`, `lenk-test`, `getriebe-test`,
  `felswand-test`, `handbremse-test`: alle bestanden, keine Fehler in der Browser-Konsole.
- Ehrlich zu den Test-Anpassungen: Im `kuh-test` plant die Prüfung „gleicher seed = gleiche Kühe“ die Kühe jetzt mit
  denselben Eingaben wie das Spiel (ohne den Start- und Zielbereich, der erst nach den Kühen aufgebaut wird). Im
  `nebenweg-test` werden nur noch die Stummel der Nebenwege geprüft (nicht die neuen Verlängerungen, die hat ihr eigener Test).

**Leistung** (`node tools/m3c-bilder.mjs`, Kamera wie im Spiel, Headless):

| Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
|---|---|---|
| Start (Startaufstellung) | 118 → 120 | 137 295 → 144 431 (+7 100) |
| Ziel (30 m vor der Linie) | 55 → 59 | 96 584 → 108 114 (+11 500) |
| Mitte (1835 m) | 99 → 99 | 118 526 → 123 130 (+4 600, die Asphaltbänder der Verlängerungen) |
| Start von der Seite (am meisten im Bild) | 124 → 126 | 135 714 → 142 850 |

Budget +8 Zeichenaufrufe / +25 000 Dreiecke: eingehalten (höchstens +4 / +11 500). Weit weg (über 650 m) wird der
Aufbau gar nicht gezeichnet. **Ladezeit** (`node tools/ladezeit.mjs`, 7 Messungen abwechselnd, Median):
1488 → 1605 ms (+117 ms, Budget +250 ms).

### Ehrlich beurteilt

- **Asphalt-Ende:** Auf keinem Bild und laut Sichtlinien-Check nirgends zu sehen. Am Start sieht man beim
  Zurückschauen die Strohballen-Wand und dahinter die Strasse in eine Kurve verschwinden, am Ziel die Reifenwand
  und dahinter Kuppe und Wald.
- **Leben:** Am Ziel wirkt es jetzt richtig nach Rallye (Bogen, Zuschauer dicht am Band, Fahnen, Container). Am Start
  ist es aus der Fahrersicht etwas ruhiger: Links steht der Weidezaun mit der Kuhherde (die gab es schon), die
  Zuschauer stehen vor allem rechts und um den Bogen; aus 15–25 m sind sie nur ein paar Pixel gross. Überladen
  wirkt es nicht.
- Das Banner „ZIEL“ ist ab ca. 20 m gut lesbar, aus 30 m nur gerade noch zu erkennen (das Bild hat nur 320x180
  Pixel); „START“ ist aus der Startaufstellung gut lesbar. Die Werbebanden sind
  im 320x180-Bild eher Farbflecken.
- Die Ausrollstrecke selbst ist eher kahl (Wiese, ein paar Baumgruppen) – absichtlich ruhig nach dem Trubel im Ziel.

### Bekannte Probleme

- Leistung nur im Headless-Browser gemessen; bitte auf dem Laptop an Start und Ziel mit F3 prüfen, ob es 60 FPS bleiben.
- Die Zuschauer haben 4 Ansichten (vorne, seitlich, hinten), keine Schrägansichten – von schräg vorne springt das
  Bild je nach Winkel von „vorne“ auf „seitlich“.
- Die Zuschauer reagieren nicht auf das Auto (z. B. jubeln, wenn es vorbeifährt).

### Ideen/Vorschläge (nicht umgesetzt)

- Zuschauer jubeln/winken stärker, wenn das Auto nah vorbeifährt; Kamerablitze beim Fotografen.
- Startampel, die vor dem Losfahren rot-rot-grün zählt (heute steht die Startuhr nur da).
- Zielbildschirm mit Zeit (M5) direkt unter dem Zielbogen.
- Streckenposten mit Flagge an der Absperrung der Ausrollstrecke.
- Lautsprecher-Durchsagen / Publikumsjubel, wenn es Ton gibt.

---

## Meilenstein 3a.3: Felswand (Kollision, Grasstellen) ✅ (Verlauf, Stand damals)

### Was war das Problem – und was wurde gemacht?

**1. Man fuhr in die Felswand hinein**
- *Ursache (gemessen):* Die Wand prüfte nur die **Mitte des Autos**: Sie durfte höchstens 4.3 m neben die
  Strassenmitte. Wie das Auto dabei steht, war egal. Fährt man schräg oder frontal an die Wand, ragt die Front
  aber bis zu 2.24 m weiter nach aussen als die Mitte. Darum steckte das Auto je nach Winkel **60 cm (15°) bis
  1.64 m (frontal)** in der Wand. Auch parallel stand die Karosserie im Mittel 10 cm, an manchen Stellen bis
  17 cm in der Wand, weil die Wand zerklüftet ist (jeder Meter etwas anders) und die Grenze überall gleich war.
  Dazu kamen ein paar Meter an den Wand-Enden, wo die Wand schon sichtbar war, aber gar nicht bremste.
- *Lösung:* Die Kollision prüft jetzt den **ganzen Umriss** des Autos (24 Punkte rundherum, alle gut 50 cm)
  gegen die **echte, sichtbare Wandfläche** an genau dieser Stelle. Die Welt merkt sich dafür die Form der
  Felswand (dieselben Querschnitte und Dreiecke, aus denen die Wand gezeichnet wird). Die Wand selbst sieht
  genau gleich aus wie vorher. Das Abprallen bleibt wie bisher: frontal harter Halt, schräg rutscht das Auto
  an der Wand entlang, rückwärts kommt man raus.
- *Kamera:* hält jetzt mindestens 50 cm Luft zur sichtbaren Wandfläche (zusätzlich zur alten Regel).

**2. Grasstellen am Fuss der Felswand**
- *Ursache (gemessen):* Das Bankett fällt nach aussen um 35 cm ab, das Gelände daneben liegt aber nur 30 cm unter
  der Strasse. Ab ca. 5.2 m neben der Mitte schaute darum das Gelände über das Bankett, bis es in der Wand
  verschwand – und das Gelände war dort wie Wiese (grün) gefärbt. An den Wand-Enden, wo die Wand flach
  ausläuft, sah man noch mehr davon. Das kam an **220 von 535 Wand-Querschnitten** vor (alle 2 m einer).
  Durch die Felsflächen selbst sticht nirgends Gelände (gemessen); die Grasflecken „an der Wand“ waren dieselben
  Stellen am Fuss und an den Wand-Enden.
- *Lösung:* Das Gelände wird auf der Wandseite (bis ca. 18 m neben der Strassenmitte, dann weicher Übergang)
  nicht mehr als Wiese gefärbt, sondern als **Erde mit Geröll-Flecken und ein paar dunklen Steinen**. An den
  Wand-Enden blendet das mit der Wand zusammen ein und aus. Nur Farben, keine neuen Zeichenaufrufe, keine
  geänderten Höhen (Fahrstrecke und Abkürzungen bleiben genau gleich).

### Zahlen vorher → nachher (`node tools/felswand-test.mjs`, neu; mit `--wurzel <ordner>` misst er eine alte Version)

Sichtbare Wandfläche (Strahl von der Strasse quer nach aussen, jeden Meter, 1049 Messpunkte) gegen Kollisionskante:

| | vorher | nachher |
|---|---|---|
| Auto parallel zur Wand: Karosserie in der Wand | im Mittel 10 cm, bis 17 cm (95 %), grösster Unterschied 33 cm | Kollisionskante höchstens **4 cm** in der Wand, höchstens 7 cm davor |
| Auto schräg / frontal | Ecken ragen bis 2.24 m weiter als die Mitte | gleich wie parallel (ganzer Umriss geprüft) |
| Wand sichtbar, aber keine Kollision | 20 Stellen (an den 4 Wand-Enden) | 0 |

Aufprall an 2117, 2300 und 3100 m, 20 / 60 / 100 km/h, unter 15° / 30° / 60° / 90°, danach 1 s Vollgas gegen die Wand:

| | vorher | nachher |
|---|---|---|
| Karosserie steckt in der sichtbaren Wand (am tiefsten) | 15°: 57–82 cm, 30°: 104–119 cm, 60°: 141–162 cm, 90°: 144–**164 cm** | höchstens **1 cm** |
| Tempo 0.2 s nach dem Aufprall, 90° | 0–1 km/h (20 km/h: 26 km/h, rutschte in die Wand) | 0–2 km/h |
| Tempo 0.2 s nach dem Aufprall, 60° | 0–11 km/h | 0–8 km/h |
| rückwärts raus (3 s nach dem Stillstand) | ja | ja, 7.6–13.2 m |

Kamera, wenn das Auto an der Wand steht (parallel, schräg mit dem Heck zur Wand, Heck zur Wand): mindestens 69 cm
Luft zur Wand (vorher auch, die Kamera war schon vorher nicht das Problem).

### Wo man schrauben kann (`js/config.js`)

| Wert | Was |
|---|---|
| `grenze.wandHuelle.laenge` / `breite` | so gross ist das Auto für die Felswand (4.48 x 1.86 m, die sichtbare Karosserie) |
| `grenze.wandHuelle.ueberBoden` | in welcher Höhe über dem Boden geprüft wird (0.1 m; unten steht die Wand am weitesten vor) |
| `kamera.wandAbstand` | so viel Luft hält die Kamera zur Felswand (0.5 m) |
| `felswand.fussFarben` | false = Gelände am Wandfuss wieder wie früher (Wiese) |
| `felswand.fussBreite` | bis wohin (Meter neben der Strassenmitte) das Gelände Erde/Geröll ist und wo der Übergang endet (18 / 26) |
| `felswand.fussGeroell` | Farbe der Geröll-Flecken |

`grenze.wandGrenze` (4.3 m) wird nur noch von der Abkürzungs-Analyse gebraucht (die rechnet mit einem Punkt).

### So testest du

1. **Felswand 1** (ca. 1915–2495 m, links) und **Abfahrt** (ca. 2930–3420 m, rechts): frontal, schräg und
   streifend an die Wand fahren. Das Auto soll an der Felsfläche stoppen, nichts vom Auto verschwindet im Fels.
   Danach rückwärts raus.
2. Bei **2117 m** (Linos Stelle) frontal an die Wand: Die Stossstange berührt den Fels, steckt aber nicht drin.
3. Am Auto vorbei auf den **Wandfuss** schauen (auch an den Wand-Enden bei 1915 m, 2490 m, 2930 m, 3415 m):
   Zwischen Bankett und Wand ist es braun-grau (Erde, Geröll), kein grüner Streifen mehr.
4. Mit dem Heck an die Wand stellen und lenken: Die Kamera soll nicht in die Wand rutschen.

### Bilder (`screenshots/m3a-3/`, „a“ = vorher, „b“ = nachher)

Je für 2117 m, 2300 m und 3100 m: `fahrer` (Fahrersicht), `1m` (1 m vor dem Wandfuss), `auto` (nach einem Aufprall mit
60 km/h unter 30°, Kamera wie im Spiel), `auto-nah` (dieselbe Stelle von der Strasse her). Dazu Wandanfang bei
1925 m, Wandende bei 2485 m und ein Überblick bei 3000 m. Neu erzeugen: `node tools/m3a3-bilder.mjs --endung b`.
Gut zu sehen: `10a`/`10b` (3100 m, grüne Flecken am Fuss weg), `03a`/`03b` und `11a`/`11b` (Auto steckt vorher sichtbar im
Fels, nachher steht es davor).

### Selbst getestet

- **`felswand-test`** (neu): alle Prüfungen erfüllt (Zahlen oben).
- **Abkürzungs-Analyse** (`node tools/abkuerzungen.mjs --pruefen`): 127 / 2 / 342 / 84, wie vorher.
- **Testfahrer**: 2:43.29 / 2:27.62 / 2:18.27 – **genau gleich** wie vorher, keine Aufpralle.
- `aufprall-test`, `strassenrand-test`, `nebenweg-test`, `kuh-test`: alle Prüfungen erfüllt, keine Fehler in der
  Browser-Konsole.
- **Leistung**: genau gleich wie vorher (gleiche Zeichenaufrufe und Dreiecke an allen Stellen, z. B. 2117 m:
  107 Zeichenaufrufe / 145 564 Dreiecke; meiste Dreiecke 160 697 bei 810 m, meiste Zeichenaufrufe 122 bei 360 m).
  Die neue Kollision rechnet nur, wenn das Auto nahe an der Wand ist.

### Ehrlich beurteilt

- **Kollision**: Messbar sauber – das Auto steckt höchstens 1 cm in der Wand, das sieht man nicht. An den
  zerklüfteten Stellen kann es aber passieren, dass zwischen Auto und Fels ein paar Zentimeter Luft bleiben
  (höchstens 7 cm, meist 0).
- **Wandfuss**: Der grüne Streifen und die Grasflecken sind weg, dort ist es jetzt erdig-grau mit ein paar
  dunkleren Steinen. Weil das Gelände nur alle 4 m eine Farbe hat, sind die Geröll-Flecken eher grob und weich
  verlaufen, keine einzelnen kleinen Steine. Ob die Mischung zum Bankett schön genug ist, musst du auf deinen
  Rechnern beurteilen; die Farben stehen in `config.js`.

### Bekannte Probleme

- Oben auf der Felswand (über der Wandkante) sieht man aus manchen Blickwinkeln Wiese und Tannen auf dem Berg
  dahinter. Das ist gewollt (dort ist der Berg), aber nicht Teil dieses Meilensteins.

### Ideen/Vorschläge (nicht umgesetzt)

- Kleine Geröll-Sprites (wie die Steine) am Wandfuss würden einzelne Steine zeigen statt nur Farbflecken. Kostet
  einen Zeichenaufruf (oder kann in den bestehenden Stein-Aufruf), war hier ausdrücklich nicht gewünscht.
- Kratzgeräusch / kleine Staubwolke beim Streifen der Wand (wenn es Ton gibt).

## Meilenstein 3a.2: Fahrphysik-Feinschliff (Handbremse, Geradeauslauf) ✅

### Was war das Problem – und was wurde gemacht?

**1. Mit gehaltener Handbremse fuhr das Auto endlos im Kreis**
- *Ursache (gemessen):* Drei Dinge zusammen.
  1. Der Motor schob mit gezogener Handbremse **voll weiter**. Im 1. Gang sind das 8 m/s² Schub, die Handbremse
     bremste nur mit 3.5 m/s². Mit Gas hielt sich das Auto darum ewig bei ca. **18–25 km/h im Kreis**.
  2. Die Handbremse bremste nur in Längsrichtung. Rutschte das Auto quer, bremste sie fast gar nicht mehr.
  3. Ohne Gas war es umgekehrt: Sobald sich das Auto quer stellte (Dreher), hielt es **schlagartig** an
     (von 60 auf 10 km/h in 0.1 s). Ein alter Effekt aus der Langsam-Lenkung: Unter 18 km/h Längstempo wurde
     das seitliche Rutschen einfach gelöscht – auch wenn das Auto noch mit 60 km/h quer rutschte.
- *Lösung:*
  - Je länger man die Handbremse hält, desto stärker bremst sie (von 3.5 auf 5 m/s² in 1.2 s) und desto weniger
    Antrieb kommt an (nach 1.2 s nur noch 30 %). **Kurz ziehen bleibt fast wie vorher.**
  - Die Handbremse bremst jetzt in jede Rutschrichtung, auch quer.
  - Dreher: Rutscht das Auto schnell quer, rutscht es mit der Reibung der Reifen weich aus, statt schlagartig
    stehen zu bleiben.

**2. Nach dem Lenken bei hohem Tempo dauerte es zu lange, bis das Auto geradeaus fuhr**
- *Ursache (gemessen):* Nicht die Lenkung selbst – der Radeinschlag ist nach dem Loslassen nach 0.17 s
  (Tastatur) bzw. sofort (Gamepad) wieder gerade. Es lag am **Auto**: Es dreht nach dem Loslassen noch weiter
  und schiebt seitlich (der Schwimmwinkel wächst nach dem Loslassen sogar noch von 4° auf über 6°), dann pendelt
  es leicht zurück. Drehen und seitliches Schieben klangen gemeinsam nur langsam ab (zu wenig Dämpfung).
- *Lösung:* **Geradeauslauf-Hilfe**: Steht die Lenkung (fast) gerade und das Auto rutscht nicht, hört es schnell
  auf zu drehen, und die Fahrtrichtung dreht zur Blickrichtung (das Tempo bleibt dabei gleich). Die Hilfe wirkt
  nur, wenn das Auto stärker dreht, als die Räder vorgeben – **beim Einlenken also nicht**. Einlenkgefühl,
  Kurvenfahrt und Lenkung im Schritttempo bleiben wie vorher. Nicht bei Handbremse und nicht im Drift (ab 8°
  Schwimmwinkel schwächer, ab 15° ganz aus): Ein Drift schiebt also weiter wie bisher. Auf Schotter wirkt sie
  schwächer (40 %), dort schiebt das Auto etwas länger.

### Zahlen vorher → nachher (`node tools/handbremse-test.mjs`, neu)

Handbremse lange halten, ab 80 km/h, voll lenken:

| Untergrund, Gas | Tempo nach 1 / 2 / 3 / 5 s vorher | nachher | unter 10 km/h vorher → nachher |
|---|---|---|---|
| Asphalt, ohne Gas | 58 / 2 / 0 / 0 km/h (schlagartig) | 56 / 24 / 0 / 0 km/h | 1.55 s → 2.47 s |
| Asphalt, mit Gas | 77 / 11 / 18 / **17** km/h (kreist ewig) | 70 / 41 / 12 / 1 km/h | 1.63 s, danach wieder 18 km/h → 3.07 s |
| Schotter, ohne Gas | 58 / 3 / 0 / 0 km/h (schlagartig) | 56 / 31 / 9 / 0 km/h | 1.62 s → 2.94 s |
| Schotter, mit Gas | 78 / 11 / 16 / **17** km/h (kreist ewig) | 70 / 48 / 27 / 0 km/h | 1.74 s, danach wieder 17 km/h → 3.82 s |

Stärkstes Abbremsen (über 15 km/h): vorher bis **310 m/s²** (= Ruck), nachher höchstens 9.4 m/s².

Handbremse kurz ziehen (Tempoverlust gegenüber gleichem Lenken ohne Handbremse, 1.5 s nach dem Ziehen):
0.3 s gezogen vorher −1 bis −2 km/h, nachher −2 bis −3 km/h; 0.5 s gezogen vorher −10 bis −13 km/h, nachher −8
bis −14 km/h (das meiste davon kommt vom Quer-Rutschen, nicht von der Handbremse).

Geradeaus nach dem Loslassen (0.5 s voll einlenken, loslassen; „gerade“ = Drehen unter 1 °/s und Schwimmwinkel
unter 0.5°, ab Loslassen der Taste gezählt):

| | Tastatur vorher → nachher | Gamepad vorher → nachher |
|---|---|---|
| Asphalt 60 km/h | 0.86 s → **0.46 s** | 0.73 s → 0.31 s |
| Asphalt 120 km/h | 1.47 s → **0.57 s** | 1.36 s → 0.42 s |
| Asphalt 180 km/h | 2.35 s → **0.62 s** | 2.28 s → 0.47 s |
| Schotter 60 km/h | 0.93 s → 0.62 s | 0.76 s → 0.47 s |
| Schotter 120 km/h | 2.81 s → 0.93 s | 2.70 s → 0.76 s |
| Schotter 180 km/h | 3.50 s → 1.05 s | 3.50 s → 0.92 s |

Drift mit Handbremse (0.6 s), danach alles los: Schwimmwinkel 0.3 s danach 19.6° (Asphalt) bzw. 20.1° (Schotter)
– genau wie ohne Geradeauslauf-Hilfe.

### Wo man schrauben kann (`js/config.js`, Block `auto`)

| Wert | Was |
|---|---|
| `handbremseBremse` | Bremswirkung gleich nach dem Ziehen (3.5 m/s², wie bisher) – bestimmt, wie viel kurzes Ziehen kostet |
| `handbremseBremseLang` | Bremswirkung lange gehalten (5 m/s²). Höher = steht schneller |
| `handbremseAufbau` | nach so vielen Sekunden gilt der Lang-Wert (1.2 s) |
| `handbremseAntrieb` | so viel Antrieb kommt bei lange gehaltener Handbremse noch an (0.3; 1 = wie vorher, kreist wieder) |
| `geradeauslauf.gier` | wie schnell das Auto aufhört nachzudrehen (8; 0 = aus, wie vorher) |
| `geradeauslauf.schwimm` | wie schnell das seitliche Schieben verschwindet (4) |
| `geradeauslauf.lenkBis` | ab so viel Lenkung wirkt die Hilfe nicht mehr (0.15) |
| `geradeauslauf.rutschAb` / `rutschBis` | ab diesem Schwimmwinkel (8° / 15°) gilt es als Rutschen, Hilfe schwächer / aus |
| `dreher.abSeit`, `dreher.drehBremse` | ab welchem Quer-Tempo ein Dreher weich ausrutscht, wie schnell er aufhört zu drehen |
| `untergrund.schotter.geradeaus` | Geradeauslauf-Hilfe auf Schotter (0.4; 0 = schiebt wie vorher lange weiter) |

### So testest du

1. **Handbremse halten**: Auf der Geraden mit ca. 80 km/h Handbremse ziehen, voll lenken und halten (mit und ohne
   Gas): Das Auto dreht sich, wird spürbar langsamer und steht nach ca. 2.5–4 s. Kein endloses Kreisen mehr,
   kein schlagartiges Anhalten.
2. **Handbremse antippen** vor einer Kehre (unter 0.5 s): Das Heck kommt wie bisher, das Tempo bleibt grösstenteils.
3. **Geradeauslauf**: Bei 120–180 km/h kurz einlenken und loslassen: Das Auto ist nach gut einer halben Sekunde
   wieder gerade, kein Nachdrehen und Pendeln mehr. Einlenken soll sich genau gleich anfühlen wie vorher.
4. **Drift**: Mit Handbremse quer stellen und Lenkung loslassen – das Auto schiebt weiter quer wie bisher.
5. **Schotter** (Nebenweg 800–1020 m): Nach dem Lenken schiebt das Auto etwas länger als auf Asphalt.

### Selbst getestet

- **`node tools/handbremse-test.mjs`** (neu): alle Prüfungen erfüllt (Zahlen oben). Mit `--wurzel <ordner>` misst er
  eine alte Version (so sind die Vorher-Zahlen entstanden).
- **`lenk-test`** und **`getriebe-test`**: Ausgabe **Zeichen für Zeichen gleich** wie vorher.
- **Testfahrer**: 2:43.29 / 2:27.62 / 2:18.27 (vorher 2:43.28 / 2:27.63 / 2:18.16, im Auftrag genannt 2:43.25 /
  2:27.63 / 2:18.23): Abweichung höchstens 0.11 s, keine Aufpralle.
- **`aufprall-test`**: alle Prüfungen erfüllt. Drei Messwerte haben sich leicht verändert, weil das Auto nach einem
  Streifschuss jetzt schneller wieder geradeaus fährt: Streifen an einem Baum mit 1.2 m Versatz: Drehung 17.0° →
  13.2°, seitlich 8.1 → 6.7 m; Stamm schräg 45°: 1 s danach 5 → 4 km/h; Stamm schräg 75°: 1 s danach 70 → 66 km/h.
  Ohne Geradeauslauf (`gier: 0`) ist die Ausgabe genau gleich wie vorher.
- `strassenrand-test`, `kuh-test`, `nebenweg-test`, `gras-test`: alle Prüfungen erfüllt, keine Fehler in der
  Browser-Konsole.

### Ehrlich beurteilt

- **Handbremse**: Aus 80 km/h mit Vollausschlag steht das Auto auf Asphalt nach ca. 2.5–3 s, auf Schotter nach
  3–4 s – mit Vollausschlag dreht es sich dabei fast immer ganz quer (das bremst am meisten). Ohne Gas also
  etwas schneller als Linos Schätzung von 3–5 s. Wer es länger rutschen lassen will: `handbremseBremseLang`
  senken (z. B. 4).
- **Kurz ziehen**: 0.3 s kostet 2–3 km/h (vorher 1–2 km/h), bleibt also fast wie vorher.
- **Geradeauslauf**: Rein gemessen klar besser (120 km/h: 1.47 → 0.57 s). Wie es sich anfühlt, kann ich nicht
  fahren – möglich, dass es bei hohem Tempo jetzt etwas „auf Schienen“ wirkt. Dann `geradeauslauf.gier` und
  `schwimm` etwas senken (z. B. 5 und 2.5).

### Bekannte Probleme

- Mit Vollausschlag und Handbremse dreht sich das Auto sehr leicht ganz herum (war vorher auch so). Danach
  steht es meistens quer oder leicht rückwärts.

### Ideen/Vorschläge (nicht umgesetzt)

- Bei einem ganzen Dreher (Auto rutscht rückwärts) rechnet die Fahrphysik nur grob: kein echtes Reifenmodell
  für Rückwärts-Rutschen. Könnte man in M5 (Feinschliff Fahrphysik) verbessern.
- Handbremse am Gamepad analog (halb ziehen = halbe Wirkung), falls Lino einen Controller mit analoger Taste nutzt.

---

## Meilenstein 3a.1: Nebenweg-Korrektur (5 Punkte) ✅ (Verlauf, Stand damals)

### Was war das Problem – und was wurde gemacht?

**1. Schotter lag auf dem Asphalt (Abzweig und Einmündung)**
- *Ursache:* Wo der Schotterweg über dem Asphalt der Hauptstrasse liegt, lag er an manchen Stellen 2–3 cm
  *höher* als der Asphalt. Das Schotterband hatte quer nur zwei Punkte, das Absenken unter dem Asphalt griff
  darum nur grob. Von weitem rettete das die Zeichen-Reihenfolge (`polygonOffset`), aus der Nähe nicht mehr –
  darum „je näher, desto mehr Schotter“. Dazu war die Ausfransung zackig (jede Pixelzeile zufällig tief) und
  dunkel (die durchsichtigen Pixel wurden in der Ferne schwarz eingemischt).
- *Lösung:* Schotterband quer in 8 Streifen, jeder Punkt unter dem Asphalt liegt 8 cm tiefer (er kann nicht mehr
  durchschauen). Ausfransung schmaler (0.4 statt 0.7 m), mit weichem, wellenförmigem Rand statt Zacken, als
  Bild ohne schwarze Ränder, und sie liegt jetzt über dem dunklen Asphaltrand. Die abgerundete Ecke
  („Trichter“) folgt jetzt genau der gebogenen Kante des Nebenwegs (vorher eine gerade Kante: dazwischen
  schauten Gras und braune Erdpixel durch).

**2. Staub nur rechts**
- *Ursache:* Ein Fehler beim Wechsel zwischen den Hinterrädern: Der Zähler „welches Rad ist dran“ fing jedes Bild
  wieder beim selben Rad an. Bei ruhiger Fahrt entsteht nur etwa ein Wölkchen pro Bild – also immer am
  selben Rad. Mit Handbremse (mehrere Wölkchen pro Bild) stimmte es zufällig.
- *Lösung:* Der Zähler wird über die Bilder hinweg gemerkt. Beim Driften wirft jedes Rad den Staub zusätzlich
  nach aussen (beide Seiten gleich, `staub.driftSeitlich`).

**3. Buckel an der Einmündung**
- *Ursache:* Die kleine Senke im Nebenweg endete genau in der Einmündungskurve. Der Nebenweg stieg dort mit
  9–12 % an, die Hauptstrasse (Stummel) nur mit 5 %. Darum lag die Hauptstrasse bis **58 cm** höher als der
  Schotter – das Auto fuhr auf eine Stufe.
- *Lösung:* Die Senke liegt jetzt früher (endet ca. 20 m vor der Einmündungskurve), dort hat der Nebenweg
  die gleiche Steigung wie die Hauptstrasse. Dazu liegt der Stummel an der Kreuzung Punkt für Punkt genau auf
  der Höhe der Etappe und geht erst danach weich in seine eigene Höhe über (`stummel.hoeheAngleichen`).
  Die Strecke bleibt genau gleich lang.

**4. Absperrungen: zu klein, falsch platziert, nicht lesbar**
- *Ursache:* Die Absperrung stand ca. 30 m hinter der Kreuzung quer über dem Stummel – wer geradeaus fährt,
  sieht die Abbiegung zu spät. Das Schild „STRASSE GESPERRT“ war bei 320x180 Pixeln nicht lesbar.
- *Lösung:* Die Absperrung ist jetzt eine **gebogene Leitwand direkt an der Kreuzung**: Sie beginnt an der
  Aussenseite der Kurve (gleich am Rand der Hauptstrasse), schwingt sich über die Geradeaus-Richtung und läuft
  zum Nebenweg hin. Sie folgt der Kurve (0.5 m neben dem Bankett) und lässt die Fahrbahn frei. An beiden
  Enden schliesst lückenlos der Seitenschutz (Zaun bzw. Leitplanke) an.
  - Grösser: Reifenstapel 5 Reifen (1.3 m) in zwei versetzten Reihen, mit hellen Flanken und abwechselnd weiss
    gestrichenen Stapeln; Strohballen als 1.2-m-Würfel in zwei Lagen; Flatterband (zwei Bänder) an 1.5 m hohen
    Stangen; Holzböcke 1.3 m mit drei Brettern.
  - Lesbar: Statt des Schilds ein grosses **Verbots-Symbol** (rotes Rund, weisser Balken, 1.4 m) genau dort, wo
    die Geradeaus-Richtung die Leitwand kreuzt; **rot-weisse Chevrons** auf der ganzen Leitwand (zeigen in die
    Abbiegerichtung, halb zum anfahrenden Fahrer gedreht); **grosse gelbe Richtungstafel** mit drei Winkeln ca.
    70 m vor jeder Kreuzung (Abzweig: 730 m, Pfeil rechts; Einmündung: 923 m, Pfeil links).
  - Alles zusammen ist weiterhin **ein Zeichenaufruf** (ein Bild, ein Material).
  - Hinweis: Lino mochte bisher keine Kurvenpfeil-Schilder. Die Chevrons gibt es darum nur an den Absperrungen
    der Nebenwege (dort wollte Lino sie ausdrücklich), nicht in normalen Kurven.

**5. Zu viele Bäume am Nebenweg**
- *Ursache:* Der Waldrand aus M3a stellte links und rechts alle 1.5–2.1 m eine Tanne (plus eine zweite Reihe),
  auch dort, wo man gar nicht abkürzen kann – wie eine Allee.
- *Lösung:* Messung zuerst: Ganz ohne Waldrand gäbe es 123 Abkürzungs-Linien, mit der Fahrphysik aber alle
  langsamer als die Strasse – nur knapp (bis −0.01 s). Darum jetzt: **Gruppen mit Lücken**, dazwischen Wiese,
  ein paar Felsbrocken. Dicht nur auf der **Innenseite der Kurven** (nur dort kann man abkürzen), aussen
  lockere Gruppen. Eine Gruppe aus Tannen und Felsen vor dem Abzweig (766 m links) hält die Abkürzung aus der
  freien Kurve davor so zu wie in M3a. Ergebnis: **185 Tannen + 30 Felsbrocken statt 505 Tannen** (−63 % Tannen),
  0 Abkürzungs-Linien, mit drei verschiedenen Zufallszahlen geprüft.

### Wo man schrauben kann (`js/config.js`)

| Block | Was |
|---|---|
| `absperrung` | `abstandWeg` (Abstand der Leitwand zum Bankett), Grössen von `band`, `reifen`, `heu`, `zaun`, `symbol`, `chevron`, `richtungstafel` (`vorher` = Meter vor der Kreuzung) |
| `kreuzung` | `fransen` (Breite der Ausfransung), `schotterStreifen`, `unterAsphalt`, `eckEinzug` |
| `stummel.hoeheAngleichen` | bis wie weit der Stummel auf Höhe der Etappe liegt und wo er weich in seine eigene Höhe übergeht |
| `staub.driftSeitlich` | wie stark der Staub beim Driften seitlich weggeworfen wird |
| `nebenwegWald` | `innen` / `aussen` (Abstand, Gruppengrösse, Lücken, zweite Reihe), `steinAnteil`, `gruppen` (von Hand gesetzte Gruppen) |

Nach Änderungen am Waldrand: `node tools/nebenweg-wald.mjs` und `node tools/abkuerzungen.mjs --pruefen`.

### So testest du

1. **Kreuzungen aus der Nähe**: langsam auf den Abzweig (800 m) und die Einmündung (ca. 1000 m) zufahren, auch
   mal anhalten und schauen: Asphalt bleibt Asphalt, der Schotter beginnt an der Kante mit einer leichten,
   sauberen Ausfransung.
2. **Einmündung überfahren**: kein Hupfer mehr, das Auto rollt ohne Stufe auf die Hauptstrasse.
3. **Staub**: ruhig über den Schotter fahren – Staub links und rechts hinter dem Auto. Driften: mehr und breiter.
4. **Absperrungen**: Siehst du ca. 70 m vorher die gelbe Tafel? Erkennst du an der Kreuzung sofort, dass es
   nicht geradeaus geht? Fahr absichtlich in die Leitwand (geradeaus) und versuch, aussen herum oder beim
   Nebenweg vorbei in den Stummel zu kommen – soll nicht gehen.
5. **Wald**: Wirkt der Nebenweg natürlich (Gruppen, Wiese, Felsen) statt wie eine Allee? Versuch über die
   Kreuzungsecken oder durch den Wald abzukürzen – lohnt sich das?

### Selbst getestet

- **Streckenlänge** 3667.5869 m (unverändert, Abweichung 0.0000001 m). Checkpoints, Listen `sperren`,
  `nichtSchneiden`, `schneiden` unverändert.
- **Abkürzungen** (`node tools/abkuerzungen.mjs --pruefen`): **127 / 2 / 342 / 84** offene Linien in den freien
  Kurven (gleich wie vorher), 0 in gesperrten Kurven.
- **Waldrand** (`node tools/nebenweg-wald.mjs`, neu): 0 Abkürzungs-Linien zwischen 735 und 1110 m; mit den
  Zufallszahlen 6060, 6061, 6062 jedes Mal 0.
- **Höhe** (Etappe 780–1100 m in 0.5-m-Schritten, Mitte und 2.5 m daneben):

| | vorher | nachher | übrige Strecke |
|---|---|---|---|
| grösste Stufe | **58.1 cm** (999.5 m, Einmündung) | 2.4 cm (887 m, nicht an einer Kreuzung) | 3.5 cm |
| grösste Steigungsänderung auf 2 m | 35.9 % | 3.0 % | 2.8 % |
| Fahrtest Einmündung: senkrechte Beschleunigung / Nicken | **79.7 m/s² / 124 °/s** | 1.4 m/s² / 1.9 °/s | 6.9 m/s² / 10.7 °/s |
| Fahrtest Abzweig | 8.1 m/s² / 17.9 °/s | 3.0 m/s² / 1.6 °/s | |

- **`node tools/nebenweg-test.mjs`** (erweitert) – alles bestanden: Etappenlogik; jede Absperrart als Leitwand
  je 90 Anfahrten (3 Stellen, 40/70/100 km/h, 0°/±20°/±40°): nie durch, frontal Stillstand nach höchstens
  0.18 s, schräg gleitet das Auto an der Leitwand entlang (nach 0.3 s höchstens 24 % Tempo), rückwärts immer
  raus; **Umfahren: 2160 Versuche** (auch um beide Enden der Leitwand herum), **0** kamen auf den Stummel;
  Sichtlinien 0; Leitwand mindestens 0.5 m neben Weg + Bankett; Höhenprofil und Fahrtest wie die übrige
  Strecke; Staub geradeaus links 7 / rechts 7 Wölkchen.
- **Testfahrer**: 2:43.28 / 2:27.63 / 2:18.16 (vorher 2:43.25 / 2:27.63 / 2:18.23), keine Aufpralle.
- `aufprall-test`, `strassenrand-test`, `kuh-test` (25 Kühe wie vorher), `lenk-test`, `gras-test`,
  `stummel-sicht`: alle Prüfungen erfüllt; `getriebe-test` läuft durch. Keine Fehler in der Browser-Konsole.
- Ehrlich: Im `strassenrand-test` musste ich eine Prüfung anpassen. Sie verlangt, dass auf der Innenseite
  freier Kurven (plus 50 m Puffer) nichts steht. Die neue Leitwand beginnt direkt am Abzweig (800 m) – 48 m
  nach dem Ende der freien Kurve 482–752, aber noch im Puffer. Teile der Absperrung und des Stummel-
  Seitenschutzes zählen dort jetzt nicht mehr (sie gehören zur Kreuzung, nicht zur Kurve).

**Leistung** (`node tools/m3a1-bilder.mjs`, hinter dem Auto, Headless):

| Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
|---|---|---|
| Start | 118 → 118 | 128 184 → 137 295 |
| 60 m vor dem Abzweig | 88 → 89 | 139 822 → 149 453 |
| 700 m | 94 → 95 | 141 574 → 151 205 |
| mitten im Nebenweg (900 m) | 93 → 93 | 136 338 → 145 585 |
| nach der Einmündung (1100 m) | 85 → 85 | 131 786 → 131 220 |
| Ziel | 55 → 55 | 97 150 → 96 584 |
| schlimmste Stelle | 121 → 122 | 151 066 → 160 697 |

Also höchstens **+1 Zeichenaufruf** (Budget +4) und ca. **+9 600 Dreiecke** (vor allem die Reifenstapel: zwei
Reihen à 5 Reifen; dafür nur 8 Ecken pro Reifen). **Ladezeit** (`node tools/ladezeit.mjs`, 7 Messungen
abwechselnd, Median): 1411 → 1494 ms.

**Screenshots** in `screenshots/m3a-1/` (`a` = vorher, `b` = nachher): 01–05 Abzweig aus 60/30/15/8/4 m,
06–10 Einmündung aus 60/30/15/8/4 m, 11/12 beide Kreuzungen von oben, 13–20 jede Absperrart aus 20 m und aus
Fahrersicht 60 m vor dem Abzweig, 21 Staub bei normaler Fahrt, 22/23 Richtungstafeln aus 40 m (nur nachher).

### Ehrlich beurteilt

- **Kreuzungen**: Asphalt bleibt Asphalt, Kante sauber. Ganz aus der Nähe (Kamera 1–2 m über dem Boden)
  blitzen in der Ecke der Einmündung noch einzelne braune Pixel auf (Rand des Schotterwegs).
- **Absperrungen** sind aus 20–30 m sehr deutlich. Aus 60 m (Fahrersicht) sind sie bei 320x180 Pixeln nur ein
  paar Pixel hoch – dort helfen vor allem die gelbe Richtungstafel und die roten Chevrons. Die Leitwand läuft
  zuerst ein Stück am Rand entlang, die Stelle „quer über die Geradeaus-Richtung“ liegt ca. 19–22 m nach der
  Kreuzung (das ergibt sich aus der Kurve mit 28 m Radius).
- **Heu** ist mit 2 Lagen 1.2-m-Würfeln 2.4 m hoch – sehr massiv. Falls zu viel: `absperrung.heu.obenAnteil`.
- **Staub** bei ruhiger Fahrt ist absichtlich schwach (wenige Wölkchen); jetzt aber links und rechts.

### Bekannte Probleme

- Etwas mehr Dreiecke (+9 600) durch die grossen Reifenstapel; auf dem Laptop bitte prüfen, ob es 60 FPS bleiben.
- Im Headless-Browser gemessen (Software-Grafik); echte FPS auf Laptop und Gaming-PC bitte selbst prüfen.

### Ideen/Vorschläge (nicht umgesetzt)

- Staubschleier, der bei ruhiger Fahrt länger in der Luft hängt (dann sieht man ihn auch aus der Fahrersicht).
- Pace-Note „Kreuzung rechts/links“ in M4 an derselben Stelle wie die Richtungstafel.
- Die Leitwand bei Kreuzungen mit flacherem Winkel (grosser Radius) kürzer machen, damit die Stelle quer zur
  Geradeaus-Richtung näher an die Kreuzung rückt.

---

## Meilenstein 3a: Erster Nebenweg (Abzweig, Schotter, Einmündung, Absperrungen) ✅ (Verlauf, Stand damals)

### Was gebaut wurde

**1. Neuer Streckenverlauf zwischen 752 und 1085 m** (`js/track.js`, gerechnet mit `tools/nebenweg-bogen.mjs`)

| Streckenmeter | Was |
|---|---|
| bis 800 | Hauptstrasse (Asphalt) wie bisher |
| 800 | **Abzweig**: Kurve rechts 80°, Radius 28 m, auf den Schotterweg |
| ca. 840–880 | Kurve links 67°, Radius 35 m, leicht bergauf (Kuppe ca. 2.6 m) |
| ca. 900 | Checkpoint 1 (steht jetzt auf dem Schotter, Tor etwas schmaler) |
| ca. 930–970 | Kurve rechts 62°, Radius 38 m, leichte Senke |
| 1020 | **Einmündung**: Kurve links 66°, Radius 28 m, wieder auf die Hauptstrasse (Asphalt) |
| 1020–1085 | Hauptstrasse, Kurve rechts 28°, dann wie bisher |

Der Nebenweg ist **220 m** lang und liegt im Waldstück. **Die Strecke ist genau gleich lang wie vorher**
(3667.587 m, Unterschied 0.000002 m). Alles vor 752 m liegt exakt gleich, alles nach 1085 m höchstens
0.1 mm daneben. Checkpoints (900/1870/2880 m), Sperren, Schilder und Zeitmessung stimmen darum weiter.

**2. Stummel: die Hauptstrasse läuft weiter** (`js/netz.js`)

- Beim Abzweig geht die Asphaltstrasse geradeaus weiter (154 m), nach 30 m ist sie mit **Flatterband**
  abgesperrt, danach eine Linkskurve (75°, Radius 50 m) über eine kleine Kuppe – dahinter verschwindet sie.
  Links und rechts davon ein **Holzzaun** (passend zur Wiese).
- Bei der Einmündung läuft die Hauptstrasse nach hinten weiter (156 m), nach 32 m mit **Reifenstapeln**
  abgesperrt, dann eine Linkskurve (70°, Radius 55 m) bergab in den Wald. Links und rechts **Leitplanken**.
- Die Stummel haben Asphalt, Bankett und Mittelstrich wie die Hauptstrasse. Ihr Ende liegt hinter Kuppe
  und Kurve (vom Gelände verdeckt), dazu stehen dort ein paar Tannen als Waldkante.
- **Kreuzungen wie echte**: Der Strassenrand der Hauptstrasse geht in den Nebenweg über, die Ecken sind
  abgerundet (Schotter-„Trichter“), und der Asphalt franst an der Einfahrt leicht in den Schotter aus.

**3. Absperrungen** (`js/absperrungen.js`, ein Bild mit allen Teilen in `js/pixel.js`, ein Zeichenaufruf)

Vier Arten, je Kreuzung eine andere (ohne Angabe reihum, nie zweimal dieselbe hintereinander):

| Art | Aussehen |
|---|---|
| `band` | rot-weisses Flatterband an rot-weissen Warnstangen, Schild „STRASSE GESPERRT“, gelber Rally-Pfeil zum Nebenweg |
| `reifen` | alte Autoreifen, 2–3 übereinander gestapelt, schwarz mit grauen, verwitterten Stellen |
| `heu` | Strohballen, in der Mitte zwei Lagen |
| `zaun` | Holzböcke (A-Beine, oben rot-weisses Brett, unten Holz), leicht schief |

Alle gehen quer über die ganze Strasse und 2.8 m über den Asphaltrand hinaus. Aufprall **hart wie beim
Zaun** (vorwärts Stopp, rückwärts raus). Daneben läuft der Seitenschutz (Zaun bzw. Leitplanke), bis der
Stummel ausserhalb der unsichtbaren Grenze (45 m) liegt: **Um die Absperrung herum kommt man nicht.**
Im Spiel stehen heute nur Band und Reifen (zwei Kreuzungen); Heu und Holzbock kommen bei weiteren
Nebenwegen dran (Bilder 16 und 17 zeigen sie trotzdem).

**4. Schotter** (`js/pixel.js` `schotterTextur`, Physik in `config.js` `untergrund.schotter`, Staub `js/staub.js`)

- Helles Graubeige mit Kieseln, zwei festgefahrene Fahrspuren, lockerer Rand. Weg 6.2 m breit (Asphalt 7 m),
  kein Mittelstrich. Zäune, Planken und Schilder rücken auf dem schmaleren Weg mit.
- Fahrgefühl: weniger Grip (0.8), das Heck hält zusätzlich etwas weniger (0.8), die Stabilitätshilfe ist
  halb so stark. Ergebnis: Unter Gas driftet das Auto etwa doppelt so stark wie auf Asphalt (ca. 10° statt 5°),
  mit Handbremse dreht es schön ein und lässt sich in knapp 2 s wieder einfangen. Kein Eis.
- **Staub**: helle, gerasterte Wölkchen hinter den Hinterrädern, nur auf Schotter. Stark beim Driften, mit
  Handbremse und beim Anfahren mit viel Gas, schwach bei ruhiger Fahrt. Höchstens 60 Wölkchen, ein
  Zeichenaufruf, kein Speichermüll pro Bild. Durch das Pixelmuster sieht man immer hindurch.
- F3-Anzeige: „UNTERGRUND SCHOTTER“.

**5. Waldrand am Nebenweg** (`js/sprites.js`, Block `nebenwegWald`)

Damit man im Wald nicht abkürzen kann, stehen am Nebenweg (und an den Innenecken der Kreuzungen) links und
rechts dicht Tannen, die Lücken sind kleiner als das Auto. So bleiben die freien Kurven davor und danach
genau so, wie sie waren (siehe Abkürzungen unten).

**6. Hinter den Kulissen**

- **Netz statt nur Strecke** (`js/netz.js`): Gelände, Strassenband, Boden unter dem Auto, Bäume, Büsche,
  Kühe und Strassenrand kennen jetzt auch die Stummel. Die **Rennlogik** (Fortschritt, Checkpoints, „R“,
  Zeit, Abkürzungen) kennt **nur die Etappe** – ein Stummel zählt dort nie.
- **Der Wald bleibt, wo er war** (`js/baumfolge.js`): Bisher hätte jede Änderung an der Strecke ALLE Bäume
  der Welt neu gewürfelt (die Zufallszahlen rutschten). Jetzt hat jeder Baum-Versuch seinen festen Platz in
  der Zufallsfolge. Ergebnis: Ausserhalb des Umbaus stehen alle Bäume, Steine und Sperren genau wie vorher.
  Das hilft auch bei M3b.
- **Kühe** (`kuehe.seed` 1291 → 1300): Die grösste Weide im Tal (830–845 m) ist jetzt Wald am Nebenweg.
  Die Kühe sind darum neu verteilt, es sind **25 statt 34** (weniger freie Weide). Mit dem alten seed
  waren es 29, aber zu wenige frei anfahrbar für den Kuh-Test.
- Zäune und Schilder nach dem Umbau haben sich neu verteilt (die Zaun-Felder werden der Reihe nach gewürfelt).

### Wo man schrauben kann (`js/config.js`)

| Block | Was |
|---|---|
| `nebenwege` | wo abgezweigt und eingemündet wird, Belag, welche Absperrung, Form der Stummel (Kurve, Radius, Seitenschutz) |
| `stummel` | Standardform der Stummel: Gerade, Kurve, Rest, Kuppe, Gefälle, Seitenschutz, Sichtschutz-Tannen |
| `absperrung` | Reihenfolge der Arten, Überstand, Kollision, Grösse von Band, Reifen, Heu, Holzböcken |
| `kreuzung` | Radius der abgerundeten Ecke, wie weit der Asphalt ausfranst |
| `belaege` | Breite je Belag (Asphalt 7 m, Schotter 6.2 m), Mittelstrich ja/nein |
| `untergrund.schotter` | `grip`, `heck`, `stabilitaet`, `rollen`, `rollenTempo`, `rueckwaerts` |
| `staub` | Menge, Grösse, Lebensdauer, Dichte, wann wie stark |
| `nebenwegWald` | Waldrand am Nebenweg (Abstand, Dichte, Höhe) |
| `checkpoints.torBreiteSchotter` | Breite des Tors auf Schotter (11.6 m, auf Asphalt 12.4 m) |
| `farben.schotter`, `farben.schotterSpur` | Farbe des Schotters und der Fahrspuren |

### So testest du

1. **Nebenweg abfahren**: Ab dem Start ca. 40 s. Bei 800 m kommt die Kreuzung, die Absperrung (Flatterband)
   steht geradeaus, der Schotterweg geht rechts weg. Auf Schotter driften, Handbremse ausprobieren, auf den
   Staub achten. F3 zeigt „SCHOTTER“.
2. **In die Absperrung fahren** (geradeaus statt abbiegen, oder bei 1020 m nach rechts in die Reifen):
   Das Auto stoppt hart, rückwärts kommt man wieder raus. Versuche, links oder rechts um die Absperrung
   herumzufahren (Zaun/Leitplanke) – das soll nicht gehen.
3. **Stummel suchen**: Siehst du irgendwo, wo der Asphalt aufhört oder anfängt? (Soll nie der Fall sein.)
   Auch beim Rückwärtsschauen nach der Einmündung und von den Kehren oben.
4. **Checkpoint 1** bei 900 m steht auf dem Schotter: Passt das schmalere Tor?
5. Rest der Etappe: soll sich anfühlen wie vorher.

### Selbst getestet

- **Streckenlänge** vorher 3667.5869 m, nachher 3667.5869 m (Unterschied 0.000002 m).
- **Abkürzungen** (`node tools/abkuerzungen.mjs --pruefen`): offene Linien **127 / 2 / 342 / 84**
  (vorher 128 / 5 / 342 / 84). Die Listen `sperren`, `nichtSchneiden`, `schneiden` in `js/abkuerzungen.js`
  sind **unverändert**, durch gesperrte Kurven kommt man weiterhin nicht (0 Linien). Ursache der kleinen
  Änderung: Vier alte Linien hatten ein Ende im umgebauten Stück (1 Linie 599–799 m, 3 Linien ab 1017 m auf
  dem alten Strassenstück, das es nicht mehr gibt). Neue Abkürzungen am Nebenweg: **keine** (Waldrand).
  In der freien Kurve 1085–1230 ist der grösste Gewinn jetzt 3.1 m statt 3.2 m.
- **Neuer Test `node tools/nebenweg-test.mjs`** – alles bestanden:
  1. Etappenlogik: Auto vor der Absperrung hat das s der Etappe (821 m bzw. 997 m), „R“ setzt auf die Etappe,
     in den Stummel bis zur Absperrung und zurück, dann über den Nebenweg: CP1 zählt, kein „VERPASST“.
  2. Jede Absperrart: je 90 Anfahrten (40/70/100 km/h, 0°/±20°/±40°, mittig und seitlich): nie durch,
     frontal Stillstand nach höchstens 0.25 s, schräg nach 0.3 s höchstens 19 % Tempo (gleitet dann am
     Hindernis entlang wie am Zaun), rückwärts immer raus (mind. 3.2 m). Ehrlich: Die vier Arten haben
     dieselbe Kollisionslinie, darum sind die Zahlen gleich.
  3. Umfahren: **2160 Versuche** (Start auf Hauptstrasse und Nebenweg, Ziele hinter und seitlich um die
     Absperrung, 30/70/110 km/h, mit und ohne Handbremse): **0** kamen auf den Stummel.
  4. Sichtlinien (`node tools/stummel-sicht.mjs`): 9170 Strahlen von der Etappe (alle 5 m, ±200 m um jede
     Kreuzung, Mitte und ±2.5 m, Kamera 3.1 m und 6.9 m hinter dem Auto, 2.5 m hoch) zu den letzten 40 m
     jedes Stummels: **0 sehen das Ende** – schon allein durch das Gelände (Kuppe und Kurve), ohne Bäume.
- **Testfahrer** (`node tools/testfahrer.mjs`): **2:43.25 / 2:27.63 / 2:18.23** (vorher 2:33.24 / 2:19.11 /
  2:10.41). Die ganzen ca. 8–10 s gehen auf das Stück bis CP1 und den Nebenweg (enge Abbiege-Kurven statt
  der schnellen Talkurven, Schotter). Ab CP2 sind die Abschnittszeiten auf die Hundertstel gleich wie vorher.
  Auf dem Nebenweg höchstens 0.7 m neben der Mitte (nie vom Schotter gerutscht), kein Aufprall.
  „Vorsichtig“ schaltet am Nebenweg öfter hin und her (6 statt 1 Mal).
- `lenk-test`, `aufprall-test`, `strassenrand-test`, `kuh-test`, `gras-test`: alle Prüfungen erfüllt,
  `getriebe-test` läuft durch. Keine Fehler in der Browser-Konsole.

**Leistung** (`node tools/m3a-bilder.mjs`, hinter dem Auto):

| Stelle | Zeichenaufrufe vorher → nachher | Dreiecke vorher → nachher |
|---|---|---|
| Start | 114 → 118 | 122 884 → 128 184 |
| 100 m vor dem Abzweig (700 m) | 90 → 94 | 136 880 → 141 574 |
| mitten im Nebenweg (900 m) | 89 → 93 | 130 806 → 136 338 |
| nach der Einmündung (1100 m) | 85 → 85 | 127 526 → 131 786 |
| Kehren (1400 m) | 74 → 77 | 130 338 → 135 240 |
| Ziel | 55 → 55 | 93 314 → 97 150 |
| schlimmste Stelle | 118 → 121 | 146 360 → 151 066 |

Also höchstens **+4 Zeichenaufrufe** und **+5 600 Dreiecke** (Budget +10 / +20 000). Neu sind: Schotter,
Ausfransen, Absperrungen, Staub (nur wenn es staubt), Seitenschutz an den Stummeln. **Ladezeit**
(`node tools/ladezeit.mjs`, drei Messreihen, Median): +61 / +86 / +221 ms (Budget +300 ms).

**Screenshots** in `screenshots/m3a/` (`a` = vorher, `b` = nachher): 01 Start, 02–04 200/100/40 m vor
dem Abzweig, 05 im Abzweig, 06 mitten im Nebenweg, 07 vor der Einmündung, 08/09 nach der Einmündung,
10/11 beide Kreuzungen von oben, 12 Kehren, 13 Ziel, 14–17 jede Absperrart aus ca. 15 m, 18/19 Blick in
die Stummel hinein.

### Ehrlich beurteilt

- **Asphalt hört nirgends sichtbar auf**: Laut Sichtlinien-Check nie, auch auf den Bildern nicht. Man sieht
  den Stummel bis über die Absperrung hinaus in eine Kurve und Kuppe verschwinden.
- **Kreuzungen** wirken echt (abgerundete Ecken, Bankett läuft herum). Das Ausfransen des Asphalts sieht aus
  der Nähe etwas zackig/dunkel aus.
- **Absperrungen**: Band, Holzbock und Heu sind gut erkennbar. Die Reifen sind im kleinen Bild eher eine
  schwarze Reihe als einzelne Reifen. Das Schild „STRASSE GESPERRT“ ist aus der Fahrt kaum lesbar (zu klein
  für 320x180), der gelbe Pfeil schon.
- **Schotter** passt farblich zum Bankett und zum Wald. Aus der Nähe sind die Kiesel recht grob.
- **Waldrand**: Der Nebenweg ist jetzt ein richtiger Waldweg, die Tannen stehen dicht an beiden Seiten. Das
  wirkt stellenweise wie eine Allee (sehr regelmässig dicht). Auch die Hauptstrasse 40 m vor dem Abzweig hat
  jetzt Wald an beiden Seiten (vorher Wiese).

### Bekannte Probleme

- Etappenzeit ca. 8–10 s länger (enger, Schotter) – gewollt, aber anders als vorher.
- 25 statt 34 Kühe (Weide im Tal ist jetzt Wald).
- Die Pace-Note-Listen (`nichtSchneiden`/`schneiden`) wissen noch nichts vom Nebenweg; für M4 reicht das, weil
  man dort nicht schneiden kann.
- Im Headless-Browser gemessen; bitte auf dem Laptop prüfen, ob es 60 FPS bleiben.

### Weitere Nebenwege hinzufügen (für M3b; aktuelle Anleitung: siehe Meilenstein 3b oben)

1. In `tools/nebenweg-bogen.mjs` einen Eintrag in `BOGEN_LISTE` anlegen: Start- und Endpunkt (Stützpunkte,
   die bleiben) und die Stücke dazwischen (Gerade / Kurve mit Radius, je eine Gerade `frei: 'lage'` zweimal,
   eine Kurve `frei: 'laenge'`, eine `frei: 'richtung'`).
2. In `js/track.js` die alten Punkte dazwischen durch die zwei Marker-Zeilen `// <nebenweg NAME>` und
   `// </nebenweg>` ersetzen, dann `node tools/nebenweg-bogen.mjs` laufen lassen (rechnet so lange, bis die
   Strecke wieder genau gleich lang ist, und schreibt die Punkte hinein).
3. In `js/config.js` bei `nebenwege` einen Eintrag mit `abzweig`/`einmuendung` (Meter laut Ausgabe des
   Werkzeugs), `belag` und optional den Absperrungen und der Stummel-Form.
4. Prüfen: `node tools/nebenweg-test.mjs`, `node tools/stummel-sicht.mjs`,
   `node tools/abkuerzungen.mjs --pruefen`, `node tools/testfahrer.mjs`, Bilder mit `tools/m3a-bilder.mjs`.

### Ideen/Vorschläge (nicht umgesetzt)

- Schild „Kreuzung“ vor dem echten Abzweig (heute steht es vor einem Weidetor im Tal).
- Reifenstapel abwechselnd weiss/rot gestrichen (in echten Rallyes üblich, im kleinen Bild besser lesbar).
- Absperrung leicht nachgeben lassen (Strohballen rutschen, Band reisst) statt hart wie ein Zaun.
- Lockerer Waldrand: ab und zu eine Lichtung oder ein Holzstapel statt durchgehend Tannen.
- Staub sichtbar bleiben lassen, wenn man langsam hinterherfährt (Staubschleier in der Luft).
- Pace-Notes für Abzweig und Einmündung („Kreuzung rechts“, „Achtung Schotter“).
- Schotter-Geräusch/Rütteln, wenn Sound kommt.

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
