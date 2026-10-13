# Alpine Rally – Stand

Aktuell: **Meilenstein 1.1 fertig** – harter Aufprall statt Wegschleudern, und Sperren aus
Felsbrocken, Tannengruppen und umgefallenen Stämmen gegen Abkürzungen. Dazu die erste Etappe
„Passstrasse“ aus Meilenstein 1. Das Konzept und der Fahrplan stehen in `KONZEPT.md`.

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

Tastatur und Gamepad gehen gleichzeitig, nichts einzustellen.

---

## Meilenstein 1.1: Harter Aufprall und Schluss mit Abkürzungen ✅

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
