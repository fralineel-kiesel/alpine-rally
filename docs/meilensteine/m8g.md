# Meilenstein 8g – Tachos je Auto (Skala, Look, Gang-Anzeige, Schaltlicht, Ladedruck), Garage-Vorschau, Einstellung „Tacho klassisch“

Version **0.8g**. Reine Anzeige: Fahrverhalten, Ton, Physik und Strecke sind unverändert (gemessen, siehe „Selbst getestet“).
**Ehrlich vorweg:** Ich sehe die Bilder, aber ich fahre nicht. Ob ein Tacho „im Fahren gut lesbar“ ist, kann ich nur an
Bildern (vergrössert) und an Zahlen (Kontrast, Pixel) beurteilen – nicht im Spiel mit Tempo und Kurven.

## Was ist neu?

### Teil A – Grundlage: Tacho-Stile als Daten, Einstellung TACHO
- `config.js` → `hud.tachoStile`: je Stil (`klassisch`, `audan`, `delto`, `escorta`, `l073`, `imprexa`) die Look-Werte:
  Farben (Blatt, Rand, Striche, Ziffern, Nadel, Nabe, Rotbereich), Strichform (Linie/Punkt), Zifferblatt-Muster (glatt,
  Innenring, Segmentband), Nadel (Breite, Länge, Schatten, Spitze), Rotband-Breite, Gang-Anzeige, Schaltlicht, Ladedruck.
  Ein Stil nennt nur, was vom klassischen abweicht. **`klassisch` nimmt alle Farben und Masse aus `hud.tacho`** (unverändert).
- Fahrprofil-Block `tacho: { stil, drehzahlMax, drehzahlRotAb, tempoMax, tempoMaxMph, schaltlicht, lader, klassisch: {…} }`.
  Der Unterblock `klassisch` ist die Skala bei TACHO = KLASSISCH (nur der Subora hat einen: 9 / 8 wie in 0.8f).
  Prototyp ohne Block = klassisch.
- `js/tacho.js`: Stil als Parameter; jedes Zifferblatt wird **einmal je (Stil, Skala, Einheit)** gemalt und liegt danach in
  einem gemeinsamen Vorrat (HUD und Garage). Kein Garbage pro Bild, der Vorrat wächst beim Hin- und Herwechseln nicht.
- **EINSTELLUNGEN → TACHO = AUTO-STIL / KLASSISCH** (neben EINHEITEN), Hinweiszeile „AUTO-STIL = JEDES AUTO HAT SEINEN TACHO“
  (en: GAUGES = CAR STYLE / CLASSIC). Gemerkt im Browser, wirkt sofort (auch im Rennen und in der Pause).
  KLASSISCH = **pixelgleich zu 0.8f** (kein Schaltlicht, keine Ladedruck-Anzeige).

### Teil B – Fünf Stile und Skalen (nach Messung)
Drehzahl: bis zur nächsten Tausend **mindestens 8 % über dem Begrenzer**, rot ab **500 unter dem Begrenzer** (auf 500 gerundet).
Tempo: alle bleiben bei **200 km/h** (180 hätte jedes Auto über 95 % gebracht, der Escorta 95.8 %); in mph **130** statt 120
(sonst stünde die Nadel beim Audan bei 98 %). **Das Tempo unterscheidet sich also vor allem im Look, nicht in den Zahlen.**

| Auto | Begrenzer | Schalten (Vollgas) | Drehzahl bis | Rot ab | Höchsttempo | Drehzahl dort | Tempo-Nadel (200 km/h) | mph-Nadel (130) | Drehzahl-Nadel bei Höchsttempo | … beim Begrenzer |
|---|---|---|---|---|---|---|---|---|---|---|
| Audan Quarto | 6850 | 6900 | 8000 | 6500 | 189.8 km/h (118.0 mph) | 6814 | 94.9 % | 90.7 % | 85.2 % | 85.6 % |
| Lanza Delto | 6850 | 6900 | 8000 | 6500 | 177.9 km/h (110.5 mph) | 7502 | 88.9 % | 85.0 % | 93.8 % | 85.6 % |
| Fard Escorta | 6850 | 6900 | 8000 | 6500 | 172.4 km/h (107.1 mph) | 7184 | 86.2 % | 82.4 % | 89.8 % | 85.6 % |
| Lanza 073 | 6850 | 6600 | 8000 | 6500 | 182.6 km/h (113.4 mph) | 6798 | 91.3 % | 87.3 % | 85.0 % | 85.6 % |
| Subora Imprexa | 8200 | 7800 | 9000 | 8000* | 185.6 km/h (115.3 mph) | 7816 | 92.8 % | 88.7 % | 86.8 % | 91.1 % |

\* Subora bleibt 9 / 8 (Auftrag); die Regel gäbe rot ab 7500. Audan: rot ab 6500 statt 7000 – die Nadel wird jetzt rot,
wenn der Begrenzer wirkt. (Begrenzer = `audio.motor.begrenzerAb`; das Getriebe selbst begrenzt nicht, darum drehen Delto und
Escorta bei Höchsttempo im 5. Gang über 6850.)

Looks (Werk-Lack als Anker; Grundform bleibt: Tempo + Drehzahl rund):

| Auto | Blatt | Rand | Ziffern | Nadel | Striche / Muster | Kontrast Ziffern |
|---|---|---|---|---|---|---|
| Audan Quarto | dunkel (wie bisher) | hell | gelb | rot | Linien (wie bisher) | 8.6 |
| Lanza Delto | tiefschwarz | blauer Doppelring | weiss | weiss, rote Spitze | Linien, Rotband 3 px breit | 16.5 |
| Fard Escorta | cremeweiss (Vintage) | dunkelblau | schwarz, ohne Schatten | schwarz, ohne Schatten | Linien, mattes Rot; Digitaltempo im dunklen Fenster | 13.4 |
| Lanza 073 | dunkel, grünlich | grau-grün | grün | gelb, lang | Punkte auf einem Segmentband (LED-Look) | 11.6 |
| Subora Imprexa | blau `#0f2150` | gelb | gelb | gelb | heller blauer Ring `#1d46a8` unter den Strichen | 9.4 |

Kontrast nach WCAG (1 bis 21; 4.5 = gut lesbare Schrift), Blatt halbtransparent über Gras-Grün gerechnet.
**Skalenzahlen ohne Überlappung:** im Auto-Stil setzt `zahlenLage()` die Zahlen so, dass zwischen zwei Zahlen mindestens ein
leeres Pixel bleibt und keine Zahl auf einem Strich, der Beschriftung, der Gang-Anzeige oder dem Schaltlicht liegt. Beim
Subora stehen jetzt alle Zahlen 0 bis 9 frei (vorher berührten sich 6 und 7). Beim **Tempo fällt die „200“ weg**: über der
Digitalanzeige ist kein Platz, ohne etwas zu berühren (der lange Strich bei 200 bleibt). Nur der Escorta (Ziffern ohne
Schatten) zeigt auch die 200.

### Teil C – Gang-Anzeige, Schaltlicht, Ladedruck (nur im Auto-Stil)
- **Gang:** Audan Kästchen wie bisher; Delto Kästchen mit blauem Rahmen, weisse Ziffer; Escorta ohne Kasten, schlichte schwarze
  Ziffer; **Lanza 073 grüne 7-Segment-LED** (1–5, n, r aus Pixeln; die dunklen Segmente sind ganz schwach sichtbar);
  Subora blauer Kasten mit gelber Ziffer. R ist immer rot.
- **Schaltlicht** oben im Drehzahlmesser, nur Anzeige: an ab **95 % der Vollgas-Schaltdrehzahl** (auf 50 gerundet), **blinkt
  mit 7 Hz ab 250/min unter dem Begrenzer**, aus in N, R und in der Schaltpause; im 5. Gang dasselbe („Begrenzer nah“).
  Bei den Reihen (Delto, Lanza) füllen sich die Punkte von „füllt ab“ bis „an“, der letzte (rote) leuchtet ab „an“.

| Auto | Bauform | Schalten Vollgas | an ab (95 %) | Reihe füllt ab | Begrenzer | blinkt ab (−250) | gemessen: Blinken |
|---|---|---|---|---|---|---|---|
| Audan Quarto | rote runde Lampe (5 px) | 6900 | 6550 | – | 6850 | 6600 | 6.8 Hz |
| Lanza Delto | 3 Punkte: blau, blau, rot | 6900 | 6550 | 5950 | 6850 | 6600 | 6.8 Hz |
| Fard Escorta | kleine rote Lampe (3 px) | 6900 | 6550 | – | 6850 | 6600 | 6.8 Hz |
| Lanza 073 | 5 LEDs: grün, grün, gelb, gelb, rot | 6600 | 6250 | 5250 | 6850 | 6600 | 6.8 Hz |
| Subora Imprexa | gelbe Lampe, am Begrenzer rot blinkend | 7800 | 7400 | – | 8200 | 7950 | 6.8 Hz |

  Die Schwellen stehen als Zahlen im Fahrprofil (`tacho.schaltlicht`), der Test prüft sie gegen die Regel.
- **Ladedruck / Lader:** eine kleine Tafel **direkt über dem Drehzahlmesser** (47 x 9 Pixel, in den Farben des Stils):
  Audan, Delto, Subora „BOOST“ mit dem **echten Ladedruck** (`getriebe.ladedruck`), weich nachgeführt; Lanza 073 „LADER“
  (en „BLOWER“) mit 5 Segmenten, die **Drehzahl mal Gas** folgen (der Kompressor dreht fest mit dem Motor); Escorta (Sauger)
  ohne. Die Tacho-Gruppe wird dadurch **4 Pixel höher** (erlaubt: 8), nicht breiter.
- Datenweg: `main.js` reicht `ladedruck`, `gas`, `turboAn` (und wie bisher `schaltet`) an das HUD; keine neuen Objekte pro Bild.

### Teil D – Tacho-Vorschau in der Garage
- Rechts neben dem drehenden 3D-Auto steht **der Drehzahlmesser des markierten Autos** (mit Gang N, Schaltlicht und
  BOOST/LADER-Tafel), so wie man ihn im Rennen sieht (bei TACHO = KLASSISCH der klassische). Das Tempo-Blatt passt nicht
  dazu (zu wenig Platz in der Tafel).
- **Zwei Layouts verglichen** (de, 480x270): `30-garage-layout-rechts` (Tacho rechts, 3D-Vorschau 130 statt 182 Pixel breit)
  und `31-garage-layout-ecke` (Tacho unten rechts über dem 3D-Auto). **Gewählt: rechts** – in der Ecke verdeckt der Tacho
  einen Teil der Drehscheibe und des Autos. Umschaltbar in `config.js` → `garage.tacho.lage`.
- Bei 320x180 passt es genauso (das Menü ist in allen Auflösungen 320x180 gross, nur schärfer).
- **Aufheulen:** die Nadel folgt der Aufheul-Drehzahl (Audan: Spitze 4658/min bei Motor 4669/min); weil das Aufheulen nur bis
  ca. 4700/min geht, gilt fürs Schaltlicht in der Garage: **ab 90 % der Aufheul-Spitze ist es an** (`garage.tacho.lichtAb`),
  so „blitzt“ es oben kurz mit (die Reihen füllen sich dabei). Ohne Aufheulen: Leerlauf 1000/min, Gang N.

### Teil E – Tests, Bilder, Bericht, Version 0.8g
`tools/m8g-test.mjs` (a) bis (i), `tools/m8g-bilder.mjs`, `tools/m8g-karte.mjs` (Text-Pixelkarte des Tacho-Ausschnitts,
für die Planung ohne Bilder), dieser Bericht, Version 0.8g.

## Selbst getestet (`node tools/m8g-test.mjs --alt <ordner 0.8f> --lang`)

Ein voller Lauf `--alt <0.8f> --lang` (ca. 4 Stunden im Test-Browser mit Software-Grafik), danach Nachprüfungen einzeln
(siehe unten). „ok“ = bestanden.

| Teil | Ergebnis |
|---|---|
| (a) Klassisch pixelgleich zu 0.8f | ok: 60 direkt gemalte Fälle (Prototyp + 5 Autos, km/h und mph, 5 Zustände: Leerlauf, 3. Gang, Höchsttempo, R, über dem Skalenende) und 30 HUD-Ausschnitte im Spiel (5 Autos, km/h/mph, 320x180/480x270/640x360) gleich wie 0.8f |
| (b) Skalen, Ziffern, Kontrast | ok: Skalen-Regel für alle 5 (Subora als Ausnahme gemeldet), Tempo-Nadel 86–95 %, Kontraste 8.6 bis 16.5, Skalenzahlen: jede Zahl mit allen Pixeln da, keine berührt eine andere (15 Zifferblätter; beim Tempo fehlt bei 4 Autos die 200) |
| (c) Schaltlicht | ok: Schwellen = Regel, aus unter der Schwelle, an dazwischen, Reihen füllen sich, aus in N/R/Schaltpause, Blinken 6.8–7.3 Hz (auch im 5. Gang), Subora blinkt rot |
| (d) Ladedruck / Lader | ok: BOOST bei Ladedruck 0 / 0.5 / 1 → 0 / 50 / 100 % gefüllt, weich (0.1 s nach dem Sprung erst 61 %); LADER 6000/min mit Gas 80 % (5 Segmente; Soll 75 %), ohne Gas 0 %; Escorta keine Tafel; im Spiel (Delto, 4 s Vollgas) Ladedruck 0.70 und Leiste gefüllt; Speicher pro Bild im Auto-Stil nie höher als klassisch (die Heap-Messung des Test-Browsers schwankt zwischen 2 und 121 Byte pro Bild, auch klassisch) |
| (e) Gang-Anzeige | ok: 1–5, N, R in allen sechs Stilen sichtbar, alle verschieden, nichts ausserhalb des Kastens, R rot |
| (f) Garage | ok: 320x180 / 480x270 / 640x360 je de und en: Tacho in der Tafel, nicht über der 3D-Vorschau, nicht über den Werte-Balken, Nadel im Leerlauf 1000/min; 3 x 20 Wechsel: Vorrat 16 → 16 Zifferblätter, Speicher +156 KB (Grenze 300); neues Zifferblatt 1.9 ms, aus dem Vorrat 0.07 ms; Aufheulen: Nadel-Spitze 4658/min bei Motor 4669/min, Schaltlicht in 3 von 17 Bildern an, danach 1004/min; KLASSISCH zeigt den klassischen Tacho |
| (g) Einstellung | ok: Standard AUTO-STIL, wirkt sofort im Rennen und in der Pause, gemerkt (auch nach neuem Laden), Texte de/en 29 bis 239 Pixel breit |
| (h) Unveränderlich | ok: alle 21 Fahrmessungen und die Motorwerte aller 6 Profile bit-genau wie 0.8f; Aussehen der 5 Autos (73 Prüfsummen: Lack-Texturen, Geometrie, Räder); Garage-Werte-Balken; Testfahrer aller 6 Profile, je 3 Stile, Zeiten/Zwischenzeiten/Aufpralle gleich (Prototyp 2:59.33 / 2:42.35 / 2:31.92, Audan 2:58.65 / 2:41.76 / 2:31.22, Delto 2:58.61 / 2:41.60 / 2:31.22, Escorta 3:00.68 / 2:44.02 / 2:34.68, Lanza 2:58.03 / 2:40.96 / 2:33.37, Subora 2:58.89 / 2:41.62 / 2:30.98); Ton aller 6 Profile: 566 bis 716 Zahlen gleich, je 3–4 nur in der 5.–7. Stelle (Rechenrauschen des Test-Browsers, wie in M8f); Ton-, Physik-, Getriebe-, Auto- und Streckendateien unverändert; Abkürzungen 127 / 2 / 342 / 84; Strecke 3667.587 m |
| Platz im HUD | im vollen Lauf FEHLER – aber ein Messfehler meines Tests: der Messkasten schloss die Hilfezeilen ein (sie reichen bis x 160, der Tacho beginnt bei x 211). Korrigiert und nach (d) verschoben, Nachprüfung: ok – Tacho-Gruppe x 212–316, y 120–176 (klassisch y 124–176): 4 Pixel höher, nicht breiter, berührt nichts (Hilfezeilen x 5–154) |
| (i) Regression | getriebe, lenk, handbremse, belag, rueckwaerts, aufprall, pacenotes, rennablauf, overlay, ton, auto-test und m8f-test (a–d, f) bestanden. Nicht bestanden, **schon in 0.8e/0.8f so** (siehe Bericht M8f): menue-test (Credits: der Test kennt nur SHAI-RON) – davon betroffen auch m8b/m8c/m8d/m8e, die menue-test mit anrufen; Pace-Notes des Audan bei 1028 m (m8b, m8d). Einmal wackelnd: ton-umgebung-test (Musik in der Pause Pegel 0.40 statt 0.5) – im selben Lauf innerhalb von m8d bestanden, Nachprüfung: einzeln bestanden (Pegel 0.50). Wegen M8g angepasst: m8c-test (j) prüfte die Werte-Balken gegen die Breite der 3D-Vorschau; seit M8g steht rechts daneben der Tacho, die Balken liegen darunter und haben die ganze rechte Spalte (182 Pixel). Nachprüfung: `m8c-test --nur j` bestanden (auch im Lauf innerhalb von m8d) |
| Bildzeit | ok: im Spiel 158 bis 174 ms pro Bild im Test-Browser, je 9 Draw Calls; gegen 0.8f (Summe der 5 Autos) 830 → 838 ms (+0.9 %, Grenze +20 %) |
| Ladezeit | ok: Median aus 9: 0.8f 1607 ms, 0.8g 1601 ms (−6 ms, Grenze +30) |

**Review (unabhängig, gegnerisch geprüft):** 5 Prüfer suchten Fehler im Diff (Tacho-Logik, Klassisch-Gleichheit, Einbindung,
Speicher/Leistung, Repo-Regeln), je 3 Skeptiker versuchten jeden Befund zu widerlegen. 8 Befunde, 2 hielten (beide leicht)
und sind behoben: (1) die BOOST/LADER-Tafel malte ihr halbtransparentes Blatt über die deckende Randfarbe, das Innere wurde
dadurch eine deckende Mischfarbe (Audan: mittleres Grau) – jetzt Blatt innen, Rand nur 1 Pixel; (2) in `config.js` fehlte die
Erklärung zu `musterBreite` und `schaltlicht.farbeAus` – ergänzt. Nach den Korrekturen nachgeprüft: `m8g-test --nur a,d,f` alle 21 Prüfungen bestanden (klassisch weiter pixelgleich, BOOST/LADER-Füllung, Platz, Garage); Bilder 10–14, 40, 41, 50 neu gemacht.

## Was ein Ziel nicht erreicht hat (offen gemeldet)

1. **Tempo-Blatt ohne „200“** im Auto-Stil (Audan, Delto, Lanza, Subora): über der Digitalanzeige ist kein Platz, ohne
   etwas zu berühren; der lange Strich bei 200 bleibt. Nur der Escorta (Ziffern ohne Schatten) zeigt sie.
2. **mph-Skala 130:** Nadel bei Höchsttempo beim Escorta 82.4 % und beim Delto 85.0 % (Ziel „ca. 85 bis 95 %“ galt für km/h;
   120 mph hätte den Audan auf 98 % gebracht).
3. **Garage: nur der Drehzahlmesser**, kein Tempo-Blatt; dafür ist die 3D-Vorschau schmaler (130 statt 182 Pixel).
4. **Ladedruck-Anzeige nicht im Zifferblatt**, sondern als Tafel direkt darüber (+4 Pixel Höhe): im Zifferblatt war kein
   Platz, ohne Gang-Anzeige, X1000 oder Ziffern zu berühren.
5. **Schaltlicht-Regel ergibt kaum Abstand** zwischen „an“ und „blinkt“ (Audan, Delto, Escorta: 6550 / 6600), siehe unten.
6. **„Ton bit-gleich“** lässt sich im Test-Browser nicht Sample für Sample zeigen (die Offline-Rechnung schwankt um ca. 1e-4,
   wie in M8f); belegt ist: Ton-Dateien unverändert, Eingaben an den Ton unverändert, Messung gleich bis auf Rechenrauschen.
7. **Garage-Aufheulen geht nur bis ca. 4700/min**, das Schaltlicht (ab 6550) würde nie angehen; darum gilt in der Garage
   eine eigene Anzeige-Regel (an ab 90 % der Aufheul-Spitze).
8. **Testumgebung:** die Garage läuft im Test-Browser nur mit 3 bis 5 Bildern pro Sekunde (0.8f genauso); die Garage-Prüfungen
   warten darum auf die Nadel statt auf eine feste Zeit. Der volle Lauf dauerte ca. 4 Stunden.

## Ehrlich beurteilt – wo ich am unsichersten bin

1. **Lesbarkeit im Fahren:** nur an Bildern und Zahlen beurteilt. Am heikelsten: die **Punkte und LEDs** (2 x 2 Pixel)
   beim Delto und Lanza, die **7-Segment-Ziffer** des Lanza (die nicht leuchtenden Segmente sind jetzt sehr dunkel; vorher
   wirkten sie im Kleinen wie eine „8“ dahinter) und das **cremeweisse Escorta-Blatt** vor hellem Himmel/Schnee (es ist fast
   deckend, darum sollte es gehen).
2. **Das Schaltlicht blinkt fast immer, bevor geschaltet wird:** bei Audan, Delto, Escorta liegen „an“ (6550) und „blinkt“
   (6600) nur 50/min auseinander, weil die Regel (95 % von 6900, Begrenzer 6850 − 250) es so ergibt; die Automatik schaltet
   bei angezeigt ca. 6630 bis 6880. Delto und Escorta drehen bei Höchsttempo im 5. Gang über den Begrenzer (7502 / 7184): dort
   **blinkt es dauernd**. Das ist regelgerecht („Begrenzer nah“), kann aber nerven.
3. **BOOST/LADER als Tafel über dem Drehzahlmesser** statt im Zifferblatt: im Zifferblatt war kein Platz, ohne Gang-Anzeige,
   X1000 oder Ziffern zu berühren. Ob die Tafel als „Teil des Tachos“ wirkt oder als Fremdkörper, kann nur Lino sagen.
4. **Lader-Anzeige des Lanza** zeigt keine echte Grösse (es gibt im Spiel keinen Lader-Druck), sondern Drehzahl mal Gas.
5. **Audan „Original“:** das Blatt ist wie bisher, aber Rotbereich (6500) und mph-Skala (130) sind neu – nach der Regel.
6. **Garage-Schaltlicht** ist eine Anzeige-Regel nur für die Vorschau (90 % der Aufheul-Spitze), nicht die echte Schwelle.

## Bilder (`screenshots/m8g/`)

- `10-` bis `14-tacho-<auto>-4fach.png` – Tempo + Drehzahl im Auto-Stil, 4-fach, Schaltlicht an, Ladedruck 70 %.
- `20-` bis `24-tacho-<auto>-klassisch-4fach.png` – dasselbe mit TACHO = KLASSISCH (3. Gang, 5200/min, 95 km/h).
- `30-garage-layout-rechts-480x270.png`, `31-garage-layout-ecke-480x270.png` – die zwei Layouts (gewählt: rechts).
- `40-garage-tacho-480x270.png` (Delto markiert), `41-garage-lanza073-480x270.png` – Garage mit Tacho-Vorschau.
- `50-rennen-lanza073-schaltlicht-480x270.png` – HUD im Rennen: Lanza 073, 2. Gang, 6322/min, Schaltlicht an, LADER.
- `60-einstellung-tacho-480x270.png` – EINSTELLUNGEN mit TACHO = AUTO-STIL.
- `skalen.md`, `schaltlicht.md` – die Tabellen oben, vom Test geschrieben.

## Test-Anleitung für Lino (M8g)

Am besten auf beiden Rechnern. Jeder Punkt ist ein Klickpfad; darunter, was du mir schreiben kannst.

**1. Spiel öffnen → Garage**
Hauptmenü → AUTO. Rechts neben dem drehenden Auto steht jetzt sein Drehzahlmesser. Mit Pfeil hoch/runter jedes Auto
markieren und den Tacho vergleichen.
- Wenn ein Tacho **schlecht lesbar** ist → schreib Auto und was (Ziffern, Nadel, Gang, Lampe).
- Wenn dir ein **Look nicht passt** → z. B. „Delto Rand blau → rot“, „Escorta Blatt weniger gelb“, „Lanza Ziffern weiss“.
  (Alles steht in `config.js` → `hud.tachoStile`, das wird M8g.1.)
- Wenn das **3D-Auto jetzt zu schmal** wirkt → schreib „Vorschau breiter“; dann probiere ich das andere Layout (Tacho in der Ecke).

**2. Motor aufheulen**
In der Garage das markierte Auto mit **Leertaste** wählen: der Motor heult auf, die Nadel geht hoch und fällt zurück, oben
blitzt das Schaltlicht (beim Lanza füllt sich die LED-Reihe), bei Turbo-Autos füllt sich BOOST.
- Wenn die Nadel **nicht mitgeht** oder das Licht **nicht blitzt** → schreib Auto und Rechner.

**3. Rennen fahren, Vollgas**
Ein Auto wählen → STARTEN → auf der Startgeraden Vollgas.
- Schaltlicht: kurz vor dem Hochschalten an, kurz davor blinkt es; in N, R und in der Schaltpause aus.
  - Wenn es **zu früh** oder **zu spät** kommt → schreib „Schaltlicht früher/später“ und das Auto.
  - Wenn das **Blinken nervt** (z. B. beim Delto bei Höchsttempo) → schreib „weniger blinken“.
- Ladedruck (Audan, Delto, Subora): die BOOST-Leiste über dem Drehzahlmesser füllt sich mit Gas, fällt ohne Gas.
  Lanza 073: LADER folgt Drehzahl mal Gas. Escorta: keine Leiste.
  - Wenn die Leiste **stört** oder **zu klein** ist → schreib das; Alternative wäre ein Bogen im Zifferblatt.
- Rotbereich: beim Audan beginnt er jetzt bei 6500 (früher 7000) – die Nadel wird kurz vor dem Schalten rot.

**4. EINSTELLUNGEN → TACHO = KLASSISCH und zurück**
Pause (Esc) oder Hauptmenü → EINSTELLUNGEN → TACHO mit links/rechts auf KLASSISCH.
- Erwartet: sofort der Tacho von 0.8f (bei allen Autos gleich, Subora bis 9), kein Schaltlicht, keine BOOST-Leiste.
  Zurück auf AUTO-STIL: wieder die Tachos je Auto.
- Wenn KLASSISCH **anders aussieht als vorher** → bitte Screenshot; das darf nicht sein.

**5. Einheiten km/h ↔ mph**
EINSTELLUNGEN → EINHEITEN auf MPH: das Tempo-Blatt geht im Auto-Stil bis 130 mph (klassisch bis 120).
- Wenn dir **130** nicht passt → schreib die Zahl.

Ton und Fahrgefühl habe ich nicht verändert (gemessen gleich wie 0.8f).
