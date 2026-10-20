# Alpine Rally – Stand

Aktuell: **Meilenstein 8d fertig** – zwei Fehler behoben und **jedes Auto klingt anders**. Die **Frontscheibe** von Lanza
Delto und Fard Escorta ist jetzt dunkles Glas (statt Wagenfarbe). In der **Garage** wählt der Zeiger nichts mehr von allein:
mit Pfeilen ansehen, mit **Leertaste oder Enter wählen** (das Auto wird gelb), die Lackierung gehört immer zum gewählten Auto.
**Motorklang je Auto:** Audan Quarto wie bisher (5-Zylinder-Turbo), **Lanza Delto** als 4-Zylinder-Turbo (höher, heller,
giftiger, Pfeifen höher), **Fard Escorta** als 4-Zylinder-Sauger (heiser, warm, ohne Pfeifen, mehr Knistern). Im Ton-Labor gibt
es dafür den Knopf **VERGLEICH**. **Wichtig: Ton nicht gehört, Fahrgefühl nicht gespürt – bitte zuerst die Hör-Anleitung (M8d).**
Davor: 8c (Garage, Lanza Delto und Fard Escorta, gemeinsame Bestzeiten).
Davor: 8b (Name Audan Quarto, Fahrer hinten weg, spürbareres Fahrgefühl, Turbo im Ton am echten Ladedruck).
Davor: 8a (Ringwerk RT4 – heute Audan Quarto – als richtiges 3D-Modell mit Lackierung, Federung, Lichtern, Dreck,
Auto-Labor; Fahrprofile mit eigenem Fahrgefühl, Fahr-Labor). Die Hörtest-Anleitung von M7b gilt weiter (M7b.1 ist noch offen).
Davor: 7b (Umgebungsklänge mit Stereo und Abstand: Kuhglocken, Publikum, Vögel, Brunnen, Windböen; Menü-Musik, Regler MUSIK), 7a.1 (Motor härter und höher, Poppen, Schalten, Signale lauter mit Regler SIGNALTÖNE, Stein dumpf, Heulen), 7a (Ton: Motor, Reifen, Wind, Aufprall, Signale, Ton-Labor; Minimap 49 x 49, farbige Checkpoint-Punkte), 6.1 (Minimap fährt mit, Vergleich so gross wie die Zeit, Meldungen mit Tafel und Farbe), 6 (Minimap, Live-Vergleich zur Bestzeit oder zum letzten Lauf, Einstellungen ANZEIGE, Taste H = HUD aus/an), 5b (Countdown 3-2-1-GO, Zielbildschirm, Bestzeiten Top 10, Statistik), 5a.1 (Credits mit Namen, Rückwärts auf Asphalt 32 km/h, Felswand ohne Bäume im Fels und ohne Wurf), 5a (Menüs: Titel, Hauptmenü mit Demo-Fahrt, Pause, Einstellungen, Tasten belegen, Deutsch/Englisch), 4.1 (Pace-Notes als kleine Symbol-Kacheln, R mit Wartezeit), 4 (Pace-Notes mit Text und Distanz), 3d (Leben an der Strecke: Alpweide, Fan-Spots, Unfallautos), 3b (Almweg und Wiesenweg), 3c (Start- und Zielbereich), 3a.3 (Felswand: Auto stoppt an der sichtbaren Wand), 3a.2 (Fahrphysik-Feinschliff), 3a.1 (Nebenweg-Korrektur), 3a (erster Nebenweg: bei
800 m rechts auf Schotter, bei 1020 m zurück auf die Hauptstrasse), 2c (raus aus dem Gras), 2b (Kühe, Büsche,
Wald in der Ferne), 2a.1 (natürlichere Sperren, Tempo-Tafeln), 2a (Leitplanken, Holzzäune, Schilder), 1.3b (kein
Dunststreifen), 1.2 (Kurven schneiden, Getriebe, Tachos), 1.1 (harter Aufprall) und 1 (Etappe „Passstrasse“).
Das Konzept und der Fahrplan stehen in `KONZEPT.md`.

## Steuerung (Standard-Belegung, Tasten seit M5a frei belegbar)

| Aktion | Tastatur | Gamepad (Xbox / PlayStation) |
|---|---|---|
| Gas | Pfeil hoch oder W | RT / R2 (analog) |
| Bremse / Rückwärts | Pfeil runter oder S | LT / L2 |
| Lenken | Pfeil links/rechts oder A/D | linker Stick |
| Handbremse | Leertaste | A / Kreuz |
| Zurück auf die Strasse (im Rennen nach 4 s Wartezeit) | R | **Y / Dreieck** (neu, Start ist jetzt die Pause) |
| Neu starten nach dem Ziel (mit Countdown) | R | Y / Dreieck (oder NEU STARTEN im Zielbildschirm) |
| **Pause** (neu) | **Esc** | **Start / Options** |
| Debug-Anzeige | F3 | – |
| Pace-Notes (Ansagen) aus/ein | N | – |
| **HUD aus/an** (neu in M6, für Screenshots) | **H** | – |

Im Menü: Pfeile oder WASD (bzw. Steuerkreuz/linker Stick) zum Wählen, **Enter/Leertaste** (A / Kreuz) zum
Bestätigen, **Esc/Rücktaste** (B / Kreis) für zurück. Die Maus geht auch (zeigen = wählen, klicken = bestätigen,
Regler ziehen). **Garage (seit M8d):** zeigen/Pfeile = Auto nur ansehen, **Leertaste/Enter** (A / Kreuz, Klick) = Auto wählen. Tastatur, Gamepad und Maus gehen gleichzeitig, nichts einzustellen. Geschaltet wird automatisch.
Alle Tasten ausser Esc, Enter und F3 kann man unter EINSTELLUNGEN → TASTEN BELEGEN ändern.

Alle Einstellungen (auch N) merkt sich der Browser. Nur H nicht: Bei jedem Start ist das HUD wieder an.

---

## Meilenstein 8d: Scheiben-Fehler, Garage mit Tastatur, Motorklang je Auto ✅

> **Ehrlich vorneweg: Ich habe den Ton nicht gehört und das Fahrgefühl nicht gespürt.** Die zwei neuen Motorklänge sind
> **gerechnet und gemessen** (offline, Spektrogramme, Messtabelle unten) – ob der Delto „giftig“ und der Escorta „heiser“
> klingt, kannst nur du entscheiden. Darum zuerst die **Hör-Anleitung** unten.
> **Für Änderungen schreib einfach, was dir nicht gefällt, das wird dann M8d.1.**

Vier Teile, vier Commits im selben Pull Request: **A = Scheiben-Fehler**, **B = Garage mit Tastatur**, **C = Motorklang:
Mechanik und Ton-Labor**, **D = Motorklang: Delto und Escorta** (dazu in D: Tests, Bilder, diese Beschreibung). Der **Audan
Quarto ist unverändert** (Aussehen, Fahrgefühl, Ton – gemessen, siehe „Selbst getestet“), das Profil `prototyp` auch.

### A – Scheiben-Fehler (Frontscheibe in Wagenfarbe)

- **Fehler:** Bei Lanza Delto und Fard Escorta war die **Frontscheibe in Wagenfarbe** statt dunklem Glas.
- **Ursache:** Der Baukasten (`js/car.js`) holt die Farbe jeder Fläche aus der „Ansicht“, in die sie am stärksten schaut
  (vorne, hinten, oben, Seite). Die Kabine ist eine schräge Kiste. Beim Audan ist die Frontscheibe steil (zeigt mehr nach
  vorne als nach oben) und bekommt die Ansicht **vorne**, wo das Glas gemalt ist. Bei Delto und Escorta ist sie flacher
  (zeigt mehr nach oben) und bekam die Ansicht **oben** = Dach, ohne Glas. Die Heckscheibe des Escorta liegt genau auf 45°:
  dort entschied nur die Rundung der Zahlen (zufällig richtig).
- **Fix im Baukasten** (nicht pro Auto geflickt): Eine Kabine kann jetzt `scheiben: ['vorne', 'hinten']` haben. Dann holen
  Front- und Heckscheibe ihre Farbe **immer** aus der Ansicht vorne bzw. hinten, egal wie flach sie sind. Gesetzt bei Delto
  und Escorta (Front und Heck). Ohne die Option ist alles wie bisher: **Audan pixelgleich** (Lack-Textur und Geometrie
  gleich wie 0.8c, Bilder im Auto-Labor gleich).
- Die Glas-Flächen mussten nicht verschoben werden: Sie füllen das Fenster schon mit etwas Rahmen in Wagenfarbe (von vorne
  sieht man bei der flachen Scheibe vor allem den Sonnenstreifen oben und die zwei Helme).
- **Alle Autos, alle Ansichten, alle Lackierungen angeschaut** (Front, Front schräg, Heck, Heck schräg, Seite, oben):
  Heckklappe des Delto und Heckfenster des Escorta waren schon dunkel; sonst lag nirgends Wagenfarbe auf einer Scheibe.
- **Neuer Baukasten-Test** (`tools/m8d-test.mjs`, Teil c): Für jedes Auto und jede Glas-Bemalung vorne/hinten muss eine Fläche
  der Karosserie in genau diese Ansicht fallen (sonst Fehler mit dem Namen des Autos), und im Bild (Front/Heck, 640x360) muss
  die Scheibenmitte in **jeder Lackierung** dunkel sein. Mit dem alten Baukasten schlägt er bei Delto und Escorta (Front) an –
  so fällt ein solcher Fehler beim nächsten Auto (M8e) sofort auf.

### B – Garage mit Tastatur

- **Fehler:** In der Garage wechselte das Auto schon, sobald der Zeiger darauf stand. Mit der Tastatur führte der Weg von
  DELTO zu LACK über ESCORTA – das dabei gewählt wurde. Nur mit der Maus kam man zur Lackierung des Delto.
- **Neu:**
  - **Zeiger bewegen wählt nichts.** Steht der Zeiger auf einem Auto, zeigt die Vorschau (drehendes Modell, Balken, die zwei
    Textzeilen) **dieses markierte** Auto; auf LACK und ZURÜCK das **gewählte**.
  - **Leertaste oder Enter** (Gamepad A/Kreuz, Mausklick auf die Zeile) **wählt das Auto**: Modell, Fahrgefühl und Motorklang
    wechseln, die Zeile wird **gelb**, Bestätigungston, **die Garage bleibt offen**, der Zeiger bleibt stehen. Das schon
    gewählte Auto nochmals bestätigen: nur der Ton, sonst nichts.
  - **LACK** gehört immer zum **gewählten (gelben)** Auto (Pfeile links/rechts). Hoch und runter darf man frei.
  - **Maus:** Zeigen = markieren (Vorschau), **Klick = wählen**. Lack-Pfeile per Klick wie bisher.
  - **Zurück/Esc:** Garage zu, das gewählte Auto bleibt (ein nur markiertes zählt nicht). Beim nächsten Öffnen steht der Zeiger
    auf dem gewählten Auto.
- Technik: Das markierte Auto wird für die Vorschau **erst beim Markieren** gebaut (nicht in der Spielwelt) und beim Schliessen
  der Garage wieder freigegeben.
- **Andere Menüseiten geprüft:** Nur die Garage hat beim blossen Bewegen etwas gewählt (Einträge mit `beimWaehlen`). Alle
  anderen Seiten wählen erst beim Bestätigen oder mit links/rechts – unverändert.

### C – Motorklang je Auto: Mechanik und Ton-Labor

- **Warum klangen alle gleich?** Alle Motorwerte (`audio.motor` in `js/config.js`) waren eine einzige feste Menge; nur
  Turbo an/aus und die Pop-Häufigkeit kamen seit M8c aus dem Fahrprofil.
- **Neu:** Der Block `ton` im Fahrprofil hat `motor: { ... }` – **nur die Werte, die vom Audan abweichen** (auch einzelne
  Werte in `pop`/`klack`, Listen wie `knisternAnzahl`). **Audan und Prototyp: leer** = Ton wie 0.8c. Beim Laden merkt sich
  das Spiel die Referenz (`audio.motor`), beim Wechsel wird zuerst die Referenz hergestellt und dann das Auto darübergelegt
  (gleich wie beim Fahrgefühl): **kein Wert bleibt hängen**, auch nicht nach 30 Wechseln.
- **Umschalten nur im Menü** (Motor ist dort still), nie im Rennen, Countdown, in der Pause oder im Zielbildschirm. Was der
  Ton jedes Bild liest, wirkt sofort; was beim Bau fest ist (Wellenform, Härte-Kurve, Biss, Rauheit, Anteile der Schichten,
  die Puffer für Pop, Klack und Blow-off), wird **an denselben Klangbausteinen neu gesetzt** – es entstehen keine neuen
  Audio-Knoten. Die Puffer werden in kleinen Häppchen gerechnet (wie beim Laden) und gemerkt: zurück zum Audan = wieder genau
  seine Puffer. Das **gemerkte Auto** klingt schon beim ersten Tastendruck (Ton entsperren) richtig.
- Das **Fahr-Labor** (`?fahrlabor=1`) schaltet weiter nur das Fahrgefühl um, nicht den Motorklang.
- **Ton-Labor** (`ton-labor.html`):
  - Neuer Bereich **MOTORKLANG JE AUTO**: **VERGLEICH** spielt dieselbe kurze Fahrt (je 8 s: Leerlauf, Vollgas aus dem Stand
    durch zwei Gänge mit Schalten, Gas weg mit Pops, Bremsen, Leerlauf) nacheinander mit **Audan, Delto, Escorta** und zeigt
    gross den Namen des Autos, das gerade klingt. Dazu je Auto ein Knopf **NUR …** und **STOPP**.
  - **FAHRPROFIL (TON)** schaltet jetzt auch den Motorklang um. Der **Feinschliff** zeigt und ändert die Motorwerte **des
    gewählten Autos** (Zeile „Motorwerte von: …“). **WERTE KOPIEREN** liefert Zeilen wie
    `fahrprofile.delto.ton.motor.rauh = 0.45` (mit dem Auto in jeder Zeile), **ALLES ZURÜCK** stellt **nur das gewählte
    Auto** auf den Stand von config.js (die anderen behalten ihre Änderungen).
  - Neue Regler im Feinschliff: `zuendFaktor`, `tonKurve`, `saege`, `puls`, `pulsBreite`, `oberwelle`, `hoch`,
    `rauhOberwelle`, `rauhGuete`, `clip`, `filterGrund`, `filterDrehzahl`, `bissHz`, `bissDb`, `turboTonMin`, `turboTonMax`,
    `turboPegel`, `pop.mitte`, `knisternChance`, `zwischengasKnallChance` (dazu die bisherigen).

### D – Motorklang: Lanza Delto und Fard Escorta

Der Audan bleibt die Referenz. Die zwei neuen Klänge entstehen **nur durch wenige Überschreibungen** (Delto 14 Werte,
Escorta 17, davon 5 nur für Auspuff-Knistern, Knall beim Schalten und den Getriebe-Klack), kein neues Klangmodell.

**Lanza Delto – 4-Zylinder-Turbo, höher und giftiger** (`fahrprofile.delto.ton.motor`):

| Wert | Audan | Delto | Wozu |
|---|---|---|---|
| `zuendFaktor` | 2.5 | **2.0** | 4 statt 5 Zylinder: Grundton im Leerlauf −20 % |
| `hoechstTon` / `tonKurve` | 480 / 1.3 | **540 / 1.4** | dreht höher, ruhigere Mitte |
| `amTiefe` / `unter` | 0.4 / 0.16 | **0.28 / 0.12** | weniger Brabbeln und Brummen (glatter als der Fünfzylinder) |
| `rauh` / `rauhOberwelle` | 0.3 / 6 | **0.27 / 7** | Rauheit höher angesetzt (schärfer), nicht mehr Rauschen |
| `bissHz` / `bissDb` | 2200 / 5 | **2800 / 5** | Biss höher = giftiger |
| `filterGas` | 4500 | **5000** | unter Gas heller |
| `turboTonMin` / `turboTonMax` / `turboPegel` | 2200 / 5200 / 0.035 | **2530 / 5980 / 0.04** | Pfeifen 15 % höher und lauter |
| `pop.mitte` | 2400 | **3000** | Pops härter und heller |

**Fard Escorta – 4-Zylinder-Sauger, heiser, ohne Pfeifen** (`fahrprofile.escorta.ton.motor`; kein Turbo-Geräusch und
halb so viele Pops gelten seit M8c weiter):

| Wert | Audan | Escorta | Wozu |
|---|---|---|---|
| `zuendFaktor` | 2.5 | **2.0** | 4 Zylinder |
| `hoechstTon` / `tonKurve` | 480 / 1.3 | **440 / 1.2** | dreht tiefer |
| `rauh` / `rauhOberwelle` / `rauhGuete` | 0.3 / 6 / 3 | **0.54 / 4 / 2.2** | heiser: mehr, tieferes und breiteres Ansaug-Röcheln |
| `verzerrung` / `puls` / `saege` | 6 / 0.45 / 0.5 | **3.5 / 0.32 / 0.52** | weniger hart, runder |
| `filterGas` / `bissDb` | 4500 / 5 | **2400 / 1** | dunkler, warm |
| `pegel` | 0.36 | **0.44** | weniger hart = leiser: so viel lauter gestellt, dass er so laut ist wie der Audan |
| `knisternChance` / `knisternAnzahl` | 0.5 / [1, 3] | **0.8 / [2, 4]** | mehr Knistern statt Salven |
| `schaltKnallChance` / `zwischengasKnallChance` | 0.7 / 0.35 | **0.2 / 0.2** | Sauger: selten Knall beim Schalten |
| `klackPegel` | 0.3 | **0.375** | Getriebe-Klack etwas lauter (+25 %, altes Getriebe) |

**Abweichungen von den Startwerten im Auftrag** (weil die Messung es verlangte): Delto `bissDb` 5 statt 7 und `filterGas`
5000 statt 5400 (mit 7 dB lag die Energie über 2.5 kHz bei +69 % statt höchstens +40 %), Delto `rauh` 0.27 statt 0.34 (sonst
Rauschanteil +51 % statt ±10 %); Escorta `rauh` 0.54 statt 0.5 (mehr Abstand zur unteren Grenze), `filterGas` 2400 statt 3400
und `bissDb` 1 statt 3 (der Tiefpass wirkt bei Vollgas erst über 6 kHz – dunkler wird der Escorta fast nur über den Biss),
dazu `pegel` 0.44 (sonst −2.3 dB leiser als der Audan).

### Messtabelle Motorklang (gerechnet, nicht gehört)

`node tools/m8d-test.mjs --nur f` (rechnet `node tools/ton-messung.mjs m8d-<auto> --profil <auto>` für alle drei; Zahlen:
`tools/ton-messung-m8d-rt4.json`, `…-delto.json`, `…-escorta.json`; Bild: `screenshots/m8d/60-messtabelle.png`).
Prozent = Unterschied zum Audan. Offline gerechnet mit `js/audio.js`, vor dem Limiter.

| Messung | Audan Quarto | Lanza Delto | Ziel Delto | Fard Escorta | Ziel Escorta |
|---|---|---|---|---|---|
| Grundton Leerlauf (Hz) | 42 | 33 (-20.0 %) ✅ | -23 bis -17 % | 33 (-20.0 %) ✅ | -23 bis -17 % |
| Grundton bei 7000 U/min (Hz) | 462 | 517 (+12.0 %) ✅ | 5 bis 15 % | 424 (-8.1 %) ✅ | -12 bis -5 % |
| Spektralschwerpunkt Vollgas 5000 U/min (Hz) | 822 | 916 (+11.5 %) ✅ | 10 bis 25 % | 641 (-22.0 %) ✅ | -25 bis -10 % |
| Energie über 2.5 kHz Vollgas (Mittel 3000/5000/7000) | 6.84 % | 9.41 % (+37.6 %) ✅ | 15 bis 40 % | 5.04 % (-26.3 %) ✅ | -45 bis -20 % |
| Rauschanteil 2-6 kHz (Energie ausserhalb der Obertöne) | 0.92 % | 0.96 % (+4.3 %) ✅ | -10 bis 10 % | 1.54 % (+67.4 %) ✅ | 40 bis 100 % |
| Turbo-Pfeifen: Tonhöhe (Hz) | 5185 | 5960 (+14.9 %) ✅ | 10 bis 20 % | kein Pfeifen ✅ | kein Pfeifen |
| Lautstärke Motor Vollgas 5000 (RMS, dB) | 0.213 | 0.231 (+0.68 dB) ✅ | -1.5 bis 1.5 dB | 0.195 (-0.78 dB) ✅ | -1.5 bis 1.5 dB |
| Spitze vor dem Limiter (dB gegen Audan, höchstens 0) | 1.318 | 1.163 (-1.09 dB) ✅ | nicht höher | 0.584 (-7.08 dB) ✅ | nicht höher |
| Grosse Pops je Minute (feste 60-s-Fahrt; ohne Knistern und Schaltknall) | 46 | 51 (+10.9 %) ✅ | -20 bis 20 % | 21 (-54.3 %) ✅ | -65 bis -35 % |
| Knistern je Minute (Faktor) | 34 | 22 (x0.65) | – | 61 (x1.79) ✅ | x1.5 bis x3 |

- **Rauschanteil** = Energie zwischen den Obertönen (alles, was nicht auf einem Vielfachen des halben Grundtons liegt) im
  Band 2–6 kHz bei Vollgas 5000 U/min. Beim Escorta auch die spektrale Flachheit: 0.061 gegen 0.033 beim Audan (+82 %).
- **Pops:** auf derselben 60-s-Fahrt wie in M8c. Grosse Pops = einzelne Knalle der Salven (ohne Knistern und Schaltknall).
  Salven (Gaswegnehmen mit mindestens einem Pop): Audan 22, Delto 21, Escorta 7 – beim Escorta also nur
  ein Drittel der Salven, aber mit etwas mehr Pops pro Salve (Zufall aus der festen Folge, `knallMal` 0.5 unverändert).
  Knistern: Audan 34, Delto 22 (Zufall), Escorta 61 (x1.8).
- **Kein Pfeifen, kein Blow-off beim Escorta:** Pegel des Pfeif-Bandes mit und ohne Pfeif-Oszillator gleich (Rauschboden),
  0 Blow-off auf der 60-s-Fahrt.
- **Lautstärke vergleichbar:** Motor bei Vollgas 5000/min innerhalb ±0.8 dB des Audan, also weiter **lauter als Reifen,
  Wind, Umgebung und Turbo-Pfeifen** (Pfeifen beim Delto −18.3 dB unter dem Motor, Audan −18.8 dB).
- **Spektrogramme** (Leerlauf → Vollgas → Schalten → Gas weg → Bremsen, dieselbe Fahrt wie VERGLEICH):
  `screenshots/m8d/61-spektrogramme-vergleichsfahrt.png` (alle drei untereinander) und je Auto `m8d-<auto>-fahrt.png`,
  `-motor-3000/5000/7000.png`, `-pop-salve.png`, `-schalten-hoch.png`. Gut zu sehen: der Audan mit Pfeif-Linie bei ca. 5 kHz,
  der Delto mit höherer Pfeif-Linie und höher drehenden Obertönen, der Escorta ohne Pfeif-Linie und mit mehr Rauschen
  zwischen den Obertönen.

**Kompromisse:** Alle Zeilen im Ziel. Zwei Dinge sind nur indirekt erfüllt: „halb so viele grosse Pops“ beim Escorta stimmt
für die Zahl der Pops (−54 %), die Zahl der **Salven** ist aber nur ein Drittel (7 statt 22, Zufall); und der Delto knistert auf
der Testfahrt weniger als der Audan (Zufall, nicht eingestellt).

### Hör-Anleitung für Lino (M8d)

1. **Ton-Labor:** dieselbe Adresse wie das Spiel, nur mit `ton-labor.html` am Schluss (statt `index.html`). **TON STARTEN**,
   dann im Bereich **MOTORKLANG JE AUTO** auf **VERGLEICH** drücken. Du hörst nacheinander **Audan Quarto, Lanza Delto, Fard
   Escorta** (je 8 s: Leerlauf, Vollgas mit zwei Mal Schalten, Gas weg mit Pops, Bremsen); der Name des Autos steht gross
   darunter. Mit **NUR LANZA DELTO** usw. hörst du ein Auto allein, so oft du willst.
2. **Im Spiel:** Hauptmenü → **AUTO** (Garage) → mit Pfeil runter zum Auto → **Leertaste** (oder Enter) → das Auto wird gelb →
   ZURÜCK → STARTEN. Einmal kurz fahren: **Vollgas** durch ein paar Gänge, **Gas weg** (Pops), **Leerlauf**. Dann das nächste
   Auto. Auch ausprobieren: in der Garage mit der Tastatur zu **LACK** gehen und die Lackierung des gewählten Autos wechseln.
3. **Feinschliff:** im Ton-Labor oben bei **FAHRPROFIL (TON)** das Auto wählen, unten im **Feinschliff** die Regler verstellen
   (gilt nur für dieses Auto, hörbar mit **NUR …** oder den Knöpfen im Bereich „Motor und Fahrt“), dann **WERTE KOPIEREN** und
   den Text in den Chat einfügen.

**Wenn X, dann Y** (Werte im Feinschliff des Ton-Labors; in `js/config.js` stehen sie bei `fahrprofile.<auto>.ton.motor`):

| Wenn … | dann … |
|---|---|
| der Delto zu schrill ist | `hoechstTon` und `bissDb` runter (z. B. 510 / 3), evtl. `bissHz` 2400 |
| der Delto zu zahm ist (nicht giftig genug) | `bissDb` hoch (6–7), `rauhOberwelle` 8, `verzerrung` 7 |
| der Delto zu nah am Audan klingt | `zuendFaktor` (2.0 = Vierzylinder) und `unter` prüfen: `unter` 0.06, `amTiefe` 0.2 |
| der Delto zu dünn klingt | `unter` hoch (0.16 wie der Audan), `saege` hoch |
| der Escorta zu dumpf ist | `filterGas` hoch (z. B. 3400), `bissDb` 3 |
| der Escorta zu wenig heiser ist | `rauh` hoch (0.6–0.7), `rauhGuete` runter (1.5 = breiter) |
| der Escorta zu kratzig/verrauscht ist | `rauh` runter (0.4), `rauhOberwelle` 5 |
| der Escorta zu weich ist | `verzerrung` hoch (4.5), `puls` 0.4 |
| ein Auto zu leise/zu laut ist | `pegel` (Audan 0.36, Escorta 0.44) |
| das Pfeifen zu laut ist | `turboPegel` runter (Delto 0.04, Audan 0.035) |
| das Pfeifen zu hoch/zu tief ist | `turboTonMin` / `turboTonMax` |
| der Escorta zu viel/zu wenig knistert | `knisternChance` (0.8; 0.5 wie der Audan) |
| die Pops des Delto zu spitz sind | `pop.mitte` runter (2400 wie der Audan) |

**Für Änderungen schreib einfach, was dir nicht gefällt (oder füge die kopierten Werte ein), das wird dann M8d.1.**

### So testest du (Werkzeuge)

- `node tools/m8d-test.mjs` (neu: (a) bis (h); einzeln z. B. `--nur c,d,e`; `--alt <ordner 0.8c>` für die Ladezeit und die
  Audan-Textur direkt gegen 0.8c; `--ton-alt` nimmt in (b)/(f) vorhandene Messungen statt neu zu rechnen)
- `node tools/m8d-bilder.mjs` (neu: Scheiben vorher/nachher mit `--name vorher|nachher`, alle Lackierungen, Garage)
- `node tools/ton-messung.mjs <name> --profil <auto>` (neu: Motorklang eines Autos messen, Spektrogramme nach `screenshots/m8d/`)

### Bilder (`screenshots/m8d/`)

| Datei | Was |
|---|---|
| `10-scheibe-vorher-…`, `10-scheibe-nachher-…` | Delto und Escorta: Front, Front schräg, Heck, Heck schräg, je 320x180 und 1280x720 |
| `20-alle-lacke-ansichten-320x180` | alle drei Autos in allen Lackierungen, sechs Ansichten (Originalgrösse) |
| `21-<auto>-front-heck-lacke-1280` | Front und Heck je Auto in allen Lackierungen, 4-fach vergrössert |
| `22-alle-front-heck-640x360` | Front, Heck und schräg, alle Autos und Lackierungen bei 640x360 |
| `30-garage-zeiger-auf-delto-audan-gewaehlt-…` | Zeiger auf DELTO (Vorschau Delto), AUDAN noch gelb (gewählt) |
| `31-garage-delto-bestaetigt-escorta-markiert-…` | nach der Leertaste: DELTO gelb, Zeiger auf ESCORTA (Vorschau Escorta) |
| `32-garage-zeiger-auf-lack-delto-…`, `33-garage-lack-delto-rosso-…` | Zeiger auf LACK (Vorschau wieder Delto), Lackierung des Delto gewechselt |
| `50-ton-labor`, `51-ton-labor-vergleich` | Ton-Labor mit den neuen Knöpfen, VERGLEICH läuft |
| `60-messtabelle.png/.md` | die Messtabelle |
| `61-spektrogramme-vergleichsfahrt`, `m8d-<auto>-…` | Spektrogramme der drei Motoren |

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/car.js`, `js/autos.js` | Option `scheiben` für die Kabine; gesetzt bei Delto und Escorta |
| `js/menueseiten.js`, `js/menue.js`, `js/main.js` | Garage: Zeiger markiert, Bestätigen wählt, Vorschau-Modelle; Motorklang beim Autowechsel |
| `js/fahrprofil.js` | Motorklang je Profil (Schnappschuss von `audio.motor`, `waehleMotorTon`) |
| `js/audio.js` | `motorNeu()`: feste Teile neu setzen, Motor-Puffer gemerkt oder in Häppchen gerechnet |
| `js/tonfahrt.js` | **neu**: die feste Vergleichsfahrt (Ton-Labor und Messung) |
| `js/tonlabor.js`, `ton-labor.html` | VERGLEICH, Knöpfe je Auto, Feinschliff je Profil, neue Regler |
| `js/fahrlabor.js` | schaltet nur das Fahrgefühl um (nicht den Motorklang) |
| `js/config.js` | `ton.motor` je Profil (Delto, Escorta), Version 0.8d |
| `tools/m8d-test.mjs`, `tools/m8d-bilder.mjs`, `tools/m8d-referenz-audan.json`, `tools/ton-messung-08c.json` | **neu** |
| `tools/ton-messung.mjs` | `--profil <id>` |
| `tools/m8c-test.mjs`, `tools/ton-test.mjs` | angepasst (siehe „Selbst getestet“) |

### Selbst getestet

- **`node tools/m8d-test.mjs --alt <0.8c>`** (neu, (a) bis (h)):
  - (a) **Profil `prototyp` bit-genau**: Werte wie 0.7b, 70-s-Prüfsumme **3d98a02d**, Testfahrer **2:59.33 / 2:42.35 / 2:31.92**
    mit gleichen Zwischenzeiten und Statistik, Abkürzungen **127 / 2 / 342 / 84** (gesperrt durchkommen 0). **Ton** gegen 0.8c
    (`tools/ton-messung-08c.json`): 567 Zahlen gleich, 2 nur in der 6./7. Stelle anders (Rechenrauschen wie in M8b/M8c),
    107 Audio-Knoten wie 0.8c. ✅
  - (b) **Audan unverändert**: 20 Fahrmessungen gleich wie M8b, Auto-Labor-Bilder **0 Pixel anders**, 9 Draw Calls / 1306
    Dreiecke; Motorwerte = `audio.motor` von 0.8c (auch nach Delto/Escorta wieder zurück); Ton-Messung mit `--profil rt4`:
    Motor wie 0.8c, 60-s-Fahrt 22 Salven / 46 Pops / 25 Blow-off wie in M8c. ✅
  - (c) **Scheiben**: Baukasten-Test und Bildtest für 3 Autos × 3 Lackierungen × Front/Heck (Scheibenmitte 0.08–0.13, Lack
    0.22–0.94); Audan-Lack-Textur (3 Lackierungen × 3 Bildbreiten) und Geometrie gleich wie 0.8c. Mit dem alten Baukasten schlägt
    der Test bei Delto und Escorta (Front) an. ✅
  - (d) **Garage** nur mit echten Tastatur-Ereignissen (Enter und Leertaste), mit simuliertem Gamepad (Stick und A) und mit der
    Maus: [unten, bestätigen] wählt Delto; [unten, unten] über Escorta nach LACK ändert nichts; [rechts] wechselt die Lackierung
    des Delto (Escorta unberührt); frei hoch/runter; gewähltes Auto nochmals bestätigen; Escorta markiert + Esc → Delto bleibt,
    Vorschau-Modelle freigegeben; erneut öffnen → Zeiger auf Delto, gelb; STARTEN → Delto fährt mit Profil und Lackierung;
    Maus: zeigen markiert, Klick wählt, Lack-Pfeil per Klick; Konsole ohne Fehler. ✅
  - (e) **Motorklang-Wechsel**: 30 Wechsel im Menü, nach jedem stimmen Ton-Profil, alle 87 Motorwerte, Sättigung, Biss, Güten,
    Anteile und Motor-Puffer; **0 neue Audio-Knoten beim Umschalten** (dauerhafte Knoten 6 → 6, Stimmen 0, Dauer-Quellen 8 → 8);
    JS-Heap +0.38 MB; Puffer: 1 neu gerechnet, 21 aus dem Lager, längstes Häppchen 1.4 ms; **kein Knacken** (grösster Sprung von
    Sample zu Sample beim Wechsel 0.011, davor durch die Musik 0.026); kein Wechsel im Countdown, Rennen, in der Pause; das
    gemerkte Auto (Escorta, Delto) klingt beim ersten Entsperren richtig, ohne Umschalten. ✅
  - (f) **Ton-Messung**: alle Zeilen der Tabelle im Ziel (siehe oben), Escorta ohne Pfeifen und ohne Blow-off. ✅
  - (g) **Ton-Labor**: neue Regler da, Feinschliff wirkt je Profil, WERTE KOPIEREN nennt das Profil in jeder Zeile, ALLES ZURÜCK
    nur für das gewählte Profil, VERGLEICH (Audan, Delto, Escorta, 26 s) und die drei Einzelknöpfe spielen ohne Fehler. Beim
    ersten Lauf **gefunden und behoben**: ein Wert aus config.js zwischen zwei Reglerstufen (Escorta `klackPegel` 0.375, der
    Regler zeigt 0.38) zählte als „geändert“. ✅ (nach der Korrektur)
  - (h) **Stabilität** (Profil prototyp): `getriebe-test`, `lenk-test`, `handbremse-test`, `belag-test`, `rueckwaerts-test`,
    `aufprall-test`, `pacenotes-test`, `menue-test`, `rennablauf-test`, **`ton-test`** (diesmal im ersten Versuch) und
    `ton-umgebung-test` bestanden; `auto-test` (97 ok), `m8b-test` (78 ok), `m8c-test` (a)–(k) (211 ok, mit den drei bekannten
    Testfahrer-Kompromissen aus M8c) bestanden. **Draw Calls**: je Auto weiter 9 (höchstens 12); die Garage zeichnet wie in M8c
    nur auf der Seite AUTO. **Ladezeit**: im Testlauf (Median aus 9) 0.8c 1510 ms, 0.8d 1567 ms (+57 ms – über dem Ziel), in
    einer zweiten Messung mit 21 Ladungen abwechselnd 1479 → 1495 ms (**+16 ms**, im Ziel); beim Laden passiert nichts Neues
    (die Motor-Puffer der zwei neuen Klänge werden erst bei der Wahl gebaut), die Streuung im Test-Browser ist ca. ±100 ms.
    Bildzeit: im Spiel kommt pro Bild nur eine Zahl-Vergleichung im Ton dazu.
- **Was ich an alten Tests ändern musste**:
  - `tools/m8c-test.mjs` (d) und (j): Das Wählen in der Garage braucht jetzt **Bestätigen** (Enter, Mausklick, Gamepad A) –
    vorher reichte das Zeigen. Sonst unverändert.
  - `tools/ton-test.mjs` (Ton-Labor-Feinschliff): WERTE KOPIEREN schreibt Motorwerte jetzt mit dem Profil
    (`fahrprofile.prototyp.ton.motor.verzerrung = 9.5` statt `audio.motor.verzerrung = 9.5`); die Prüfung erwartet das neue Format.
  - Alle anderen Tests unverändert.
- **Bilder** angeschaut: Scheiben vorher/nachher, alle Lackierungen in sechs Ansichten (320x180, 640x360, vergrössert), Garage
  (320x180 und 1280x720), Ton-Labor, Spektrogramme.
- **Nicht gemacht: den Ton gehört und das Fahrgefühl gespürt.**

### Ehrlich beurteilt – wo ich am unsichersten bin

- **Ton nicht gehört, Fahrgefühl nicht gespürt.** Sicher messbar sind **Grundton** (Leerlauf −20 %, bei 7000/min Delto +12 %,
  Escorta −8 %), **Helligkeit** (Spektralschwerpunkt, Energie über 2.5 kHz), **Lautstärke** und **Pfeif-Tonhöhe**. „Giftig“ und
  „heiser“ sind nur **indirekt** gemessen: giftig ≈ heller + mehr Biss + höheres Pfeifen, heiser ≈ mehr Rauschen zwischen den
  Obertönen. Ob das im Ohr so ankommt, weiss ich nicht.
- **Am unsichersten:** beim **Escorta**, ob „heiser“ wirklich heiser klingt oder einfach **verrauscht/kratzig**: Der Rauschanteil
  ist +67 %, liegt aber absolut immer noch klein (1.5 % der Energie zwischen 2 und 6 kHz) – vielleicht hört man es kaum, vielleicht
  zu stark. Beim **Delto**, ob er sich genug vom Audan abhebt: Biss und Pfeifen sind nur moderat anders (der Grundton ist tiefer
  im Leerlauf und höher oben – das sollte man am deutlichsten hören).
- **Zuerst im Ton-Labor ausprobieren:** Escorta `rauh` (0.4 / 0.54 / 0.7) und `filterGas` (2400 / 3400); Delto `bissDb`
  (5 / 7) und `hoechstTon` (510 / 540 / 570).
- **Scheiben:** In allen 9 Lackierungen und allen 6 Ansichten angeschaut und mit dem Bildtest geprüft (Front und Heck): stimmt.
  Die Scheibe des Delto ist von vorne sehr flach (man sieht viel Sonnenstreifen) – das ist die Form, nicht die Farbe.
- **Garage:** Tastatur (Enter und Leertaste), Gamepad (Stick und A), Maus (zeigen, klicken, Lack-Pfeil), Esc mit markiertem
  Auto, erneutes Öffnen, Lack wechseln, hin und her, Rennstart mit gewähltem Auto und Lack: alles getestet und stimmt. Was
  ich nicht testen kann: echtes Gamepad (nur simuliert) und Touch.

### Bekannte Probleme

- `ton-test` bleibt im Test-Browser zeitkritisch (siehe M8a–M8c), wird bei einem Fehler einmal wiederholt (diesmal nicht nötig).
- Ladezeit schwankt im Test-Browser stark (+57 ms in einer Messung mit 9, +16 ms mit 21 Ladungen).
- Von vorne ist die flache Frontscheibe von Delto und Escorta nur ein schmaler dunkler Streifen mit dem Sonnenstreifen
  darüber (Form der Kabine, wie beim echten Vorbild).
- Die Garage sagt nicht, dass man mit Leertaste/Enter wählt (kein Hinweistext; siehe Ideen).
- Pops sind Zufall aus einer festen Folge: auf kurzen Fahrten kann der Escorta auch einmal mehr poppen als der Audan.

### Ideen/Vorschläge (nicht umgesetzt)

- **Motor in der Garage kurz aufheulen** lassen, wenn man ein Auto wählt (dann hört man den Klang ohne zu fahren).
- **Klang für Lanza 073** (Kompressor-Heulen, Mittelmotor) und **Subora Imprexa** (Boxer-Blubbern) in **M8e**, gleich mit den Autos.
- **Motorgeräusch von innen und von aussen** (je nach Kamera; im Spiel gibt es nur die Kamera hinter dem Auto).
- **Flamme aus dem Auspuff beim Poppen** (kleiner Pixel-Blitz; Escorta seltener).
- **Hinweis in der Garage** „LEERTASTE = WÄHLEN“ (unten in der Tafel), falls die Bedienung nicht von selbst klar ist.
- Die **Vergleichsfahrt** auch im Spiel (z. B. im Ton-Labor-Stil auf der Garage-Seite).

---

## Meilenstein 8c: Garage und zwei neue Autos – Lanza Delto und Fard Escorta ✅ (Verlauf, Stand damals – Garage-Bedienung, Frontscheibe von Delto/Escorta und Motorklang seit M8d anders)

> **Ehrlich vorneweg: Ich habe das Fahrgefühl nicht gespürt und den Ton nicht gehört.** Alles ist **gemessen** (Fahrphysik
> mit festen Fahrprogrammen, Testfahrer über die ganze Etappe, Ton offline gerechnet) und auf Bildern in drei Pixelgrössen
> angeschaut. Ob sich der Delto wendig und der Escorta verspielt anfühlt (oder zickig), kannst nur du entscheiden. Darum
> zuerst die **Test-Anleitung** unten. **Für Änderungen schreib einfach, was dir nicht gefällt, das wird dann M8c.1.**

Vier Teile, vier Commits im selben Pull Request: **A = Mechanik für mehrere Autos**, **B = Garage**, **C = Lanza Delto**,
**D = Fard Escorta** (dazu in D: Tests, Bilder, diese Beschreibung). Der **Audan Quarto ist unverändert** (Aussehen,
Fahrgefühl, Ton: gemessen, siehe „Selbst getestet“).

### Was ist neu?

**A – Mechanik für mehrere Autos**
- **Auswahl wirkt sofort**: Wählst du im Menü (Seite AUTO, jetzt Garage) ein Auto, wird **sein Modell gebaut** (das alte wird
  sauber freigegeben, kein Speicherleck) und **sein Fahrprofil** eingeschaltet. Getriebe, Federung und Dreck fangen sauber
  von vorn an, die **Demo-Fahrt** im Menü fährt sofort mit dem neuen Auto (von vorn). Gewechselt wird **nur im Menü**, nie im
  Rennen, im Countdown, in der Pause oder im Zielbildschirm.
- **Masse je Auto**: Felswand (das Auto stoppt an der sichtbaren Wand), Kollision an Bäumen, Zäunen und Zuschauern, Radstand,
  Radpositionen, Staub hinter den Hinterrädern, Schatten und Dreck kommen vom gewählten Auto (`js/autos.js`). Beim Audan
  genau wie bisher (4.48 x 1.86 m).
- **Gemerkt**: gewähltes Auto und **Lackierung je Auto** merkt sich der Browser (bei den Einstellungen). Unbekannte Werte:
  Audan Quarto, erste Lackierung. `index.html?auto=prototyp|rt4|delto|escorta` geht weiter (für Tests, wird nicht gemerkt).
- **Bestzeiten gemeinsam**: eine Top 10 für alle Autos, in jeder Zeile der **Kurzname** des Autos (QUARTO, DELTO, ESCORTA,
  PROTO für Läufe mit `?auto=prototyp`; alte Einträge ohne Auto = QUARTO). Im Zielbildschirm steht das Auto als vierte Spalte
  bei der Statistik. Der Live-Vergleich misst gegen die gemeinsame Bestzeit wie bisher. Format und Speicher unverändert.
- **Ton je Auto (nur das Nötigste)**: neuer Block `ton: { turboMal, knallMal }` im Fahrprofil. Audan und Delto 1 / 1 (Ton wie
  0.8b), **Escorta 0 / 0.5**: kein Turbo-Pfeifen, kein Blow-off, etwa halb so viele Pops. Motorklang je Auto kommt in M8d.
- **Ton-Labor**: neue Auswahl **FAHRPROFIL (TON)** (Prototyp, Audan, Delto, Escorta). **Fahr-Labor**: ein Knopf je Profil.

**B – Garage (Menü → AUTO)**
- Links die **Autos** (das gewählte steht gelb), darunter **LACK:** mit Pfeilen und kleiner Farbprobe. Rechts oben das
  **drehende 3D-Modell** auf einer Drehscheibe (8 s pro Umdrehung, gleiche Pixelgrösse wie das Spiel, Räder stehen still),
  rechts unten **vier Werte-Balken** (BESCHLEUNIGUNG, HÖCHSTTEMPO, GRIP, DRIFT), unten zwei Zeilen zu Antrieb und Bauart.
- Wählen = sofort wechseln (Tastatur, Maus, Gamepad). ENTER auf einem Auto = zurück ins Hauptmenü. Gestartet wird wie
  bisher über STARTEN im Hauptmenü.
- Technik: keine zweite WebGL-Leinwand, sondern eine kleine zweite Szene im selben Renderer (nur der Rahmen der Vorschau
  wird neu gezeichnet). **Nur solange die Seite AUTO offen ist** – sonst kostet die Garage nichts (geprüft).
- Die **Werte-Balken** sind nicht geschätzt, sondern aus den Messungen gerechnet (Vorschrift `WERTE_VORSCHRIFT` in
  `js/autos.js`, nachgerechnet von `tools/auto-messung.mjs` und `tools/m8c-test.mjs`):

| Auto | Beschleunigung | Höchsttempo | Grip | Drift |
|---|---|---|---|---|
| Audan Quarto | 7 | 6 | 8 | 5 |
| Lanza Delto | 8 | 3 | 8 | 7 |
| Fard Escorta | 3 | 2 | 6 | 10 |
| (Prototyp, nicht in der Garage) | 6 | 6 | 6 | 2 |

  (Beschleunigung aus 0–100 km/h Asphalt und Schotter, Höchsttempo aus dem Höchsttempo, Grip aus den drei Kreisfahrten
  R 25 m, Drift aus dem Heck beim Bremsen in der Kurve und dem Handbremsen-Drift; 40 Punkte pro 100 % Unterschied.)
- **Auto-Labor** (`auto-labor.html`): neue Auswahl **Auto** (alle drei) mit ihren Lackierungen.

**C – Lanza Delto** (Id `delto`, Lancia-Delta-Typ, eigenes Design)
- **Kantiger Kompakt-Allrad**: Fliessheck mit **steiler Heckklappe** und **Dachspoiler**, breite Kastenkotflügel (Räder
  stehen sichtbar in den Radläufen), Haube mit **Wölbung und Lüftungsschlitzen**, zwei grosse Scheinwerfer und zwei runde
  Zusatzscheinwerfer in der Schürze, **Heckwischer**, breite C-Säule mit kleinem Fenster, Auspuff rechts, Heckscheibe ohne
  Fahrer. Masse: **4.03 x 1.80 x 1.45 m**, Radstand 2.48 m, Spur 1.52 m, Radradius 0.325 m. Kennzeichen **LD 3**, Nummer **3**.
- **Lackierungen**: **Werk** (weiss, blauer und roter Streifen), **Rosso** (rot, schwarzes Unterteil), **Waldgrün**
  (dunkelgrün, gelbe Akzente). Sponsoren erfunden: TALBANK, ALPENKRAFT, SCHNEEFINK (Schrift erst ab 480x270).
- **Fahrgefühl** (`fahrprofile.delto`): wendig, neutral (kein Schieben über die Front wie beim Audan), Allrad-Traktion auf
  Schotter und Wiesenweg, dezenter Turbo (baut in 0.4 s auf), etwas weniger Höchsttempo.

**D – Fard Escorta** (Id `escorta`, Ford-Escort-Typ, eigenes Design)
- **Kastiges Rallye-Coupé** mit Stufenheck: flache Haube, flacher Kofferraum, gerade schmale Karosserie mit dezent
  verbreiterten Kotflügeln, **zwei runde Scheinwerfer** und **zwei Zusatzscheinwerfer im Grill**, verchromte Stossstangen,
  **kleine Spoilerlippe** statt Flügel, keine Dachhutze, Auspuff hinten links. Masse: **4.10 x 1.76 x 1.34 m**, Radstand
  2.40 m, Spur 1.48 m, Radradius 0.325 m. Kennzeichen **FE 5**, Nummer **5**.
- **Lackierungen**: **Werk** (weiss, blauer Streifen, **blaue Haube**), **Kanarie** (gelb, schwarzes Unterteil),
  **Tannengrün** (hellgrün, **weisses Dach**). Sponsoren erfunden: SENNHOF, BERGBLICK, MURMELI.
- **Fahrgefühl** (`fahrprofile.escorta`): **Hinterrad-Drifter** ohne Turbo. Das Heck kommt leicht (mit Gas, beim Bremsen in
  der Kurve, mit der Handbremse), ist aber nach gut einer Sekunde wieder eingefangen. Weniger Traktion auf losem Boden,
  etwas weniger Leistung, kürzere Höchstgeschwindigkeit.
- **Neue Schraube in der Physik: `auto.antriebHinten`** (nur im Profil escorta gesetzt, sonst ohne Wirkung): Der Schub der
  Hinterräder braucht einen Teil ihrer Haftung auf (wie ein Reibungskreis) – mit Gas halten sie seitlich weniger, das Heck
  schiebt unter Gas nach aussen. Ohne diesen Term liess sich „Heck kommt mit Gas“ nicht messbar machen (gasImDrift allein
  wirkt erst, wenn das Auto schon rutscht).

### Messtabelle Fahrgefühl (gegen `prototyp`, Audan zur Orientierung)

`node tools/auto-messung.mjs` (Zahlen: `tools/auto-messung.json`, Bild: `screenshots/m8c/80-messtabelle.png`). Prozent =
Unterschied zum Prototyp (bei Zeiten: plus = langsamer).

| Messung | Prototyp | Audan | **Delto** | Ziel Delto | **Escorta** | Ziel Escorta |
|---|---|---|---|---|---|---|
| 0–100 km/h Asphalt | 5.13 s | −2.1 % | **−4.4 %** ✅ | −4 bis −8 % | **+8.3 %** ✅ | +4 bis +9 % |
| 0–100 km/h Schotter | 5.78 s | −5.6 % | **−7.1 %** ✅ | −6 bis −11 % | **+7.9 %** ✅ | 0 bis +8 % |
| 0–100 km/h Wiesenweg | 8.28 s | −12.8 % | **−10.5 %** ✅ | −9 bis −14 % | **+16.0 %** ✅ | +10 bis +20 % |
| 0–60 km/h Gras | 10.10 s | ±0 % | **±0 %** ✅ | gleich/langsamer | **±0 %** ✅ | gleich/langsamer |
| 0–100 km/h Bankett | 6.15 s | −2.0 % | **+1.8 %** ✅ | gleich/langsamer | **+9.2 %** ✅ | gleich/langsamer |
| Höchsttempo (Vollgas) | 188.1 km/h | +0.9 % | **−5.4 %** (177.9) ✅ | −3 bis −7 % | **−8.3 %** (172.4) ✅ | −6 bis −10 % |
| Bremsweg 100 → 0 Asphalt | 35.8 m | ±0 % | **−0.3 %** ✅ | ±6 % | **−0.4 %** ✅ | ±5 % |
| Kreis R 25 m Asphalt | 54.4 km/h | +2.5 % | **+1.9 %** ✅ | +1 bis +5 % | **+0.4 %** ✅ | −2 bis +2 % |
| Kreis R 25 m Schotter | 49.3 km/h | +5.3 % | **+4.6 %** ✅ | +4 bis +9 % | **−0.1 %** ✅ | −2 bis +3 % |
| Kreis R 25 m Wiesenweg | 40.9 km/h | +12.5 % | **+11.9 %** ✅ | +8 bis +13 % | **+0.5 %** ✅ | −2 bis +4 % |
| Lenkwinkel 80 km/h auf R 60 m | 3.54° | +16.9 % | **+7.4 %** ✅ (neutral) | −5 bis +8 % | **−11.5 %** ✅ (dreht ein) | −15 bis −5 % |
| Heck: 90 km/h, R 80 m, Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s | −0.3° | +3.6° | **+3.2°** ✅ | +3 bis +6° | **+6.3°** ✅ | +6 bis +10° |
| … wieder eingefangen nach | – | 0.57 s | **0.38 s** ✅ | unter 0.9 s | **1.05 s** ✅ | unter 1.2 s |
| Vollgas in der Kurve R 80 m: Schwimmwinkel | 3.9° | 2.8° | **3.2°** ✅ | kleiner/gleich | **6.4° (+2.4°)** ✅ | +2 bis +6° mehr |
| Handbremsen-Drift Asphalt nach 0.5 s | 6.7° | −6.6 % | **+19.7 %** ✅ | ±20 % | **+26.3 %** ✅ | +10 bis +30 % |
| Rückwärts (Höchsttempo, nach 1 s, Gras) | | identisch | **identisch** ✅ | identisch | **identisch** ✅ | identisch |

**Testfahrer (ganze Etappe, alle ohne Aufprall und ohne Hänger):**

| Fahrer | Prototyp | Audan Quarto | **Lanza Delto** | **Fard Escorta** |
|---|---|---|---|---|
| vorsichtig | 2:59.33 | 2:58.65 (−0.4 %) | **2:58.61 (−0.40 %)** | **3:00.68 (+0.75 %)** |
| mittel | 2:42.35 | 2:41.76 (−0.4 %) | **2:41.60 (−0.46 %)** | **2:44.02 (+1.03 %)** |
| flott | 2:31.92 | 2:31.22 (−0.5 %) | **2:31.22 (−0.46 %)** | **2:34.68 (+1.82 %)** |

**Zeitunterschied für deine Bestzeiten** (gemeinsame Liste): Der Testfahrer ist mit dem **Delto praktisch gleich schnell wie
mit dem Audan** (0.00 bis 0.16 s schneller, je nach Fahrstil) und mit dem **Escorta 2 bis 3.5 s langsamer** als mit dem
Audan (1.4 bis 2.3 % gegen den Audan, 0.75 bis 1.8 % gegen den Prototyp). Ein Mensch, der den Grip des Delto in den
Schotterkurven nutzt, sollte mit ihm etwas schneller sein als der Testfahrer (der plant das Kurventempo für alle Autos gleich).

**Kompromisse (ehrlich, und welche Ziele ich verfehle):**
- **Delto knapp schneller als der Audan (verfehlt):** vorsichtig 0.04 s, mittel 0.16 s schneller (flott gleich). Ziel war
  „nicht schneller als der Audan“. Der Testfahrer gewinnt mit dem Delto beim Herausbeschleunigen (0–100 km/h −4.4 % war
  gefordert). Weniger Schub hätte 0–100 km/h unter −4 % gedrückt. Ausgeglichen habe ich mit **kürzerem 4. und 5. Gang**
  (`gaenge` 140 / 166 km/h statt 156 / 195): oben herum zieht der Delto weniger, das kostet dem Testfahrer Zeit.
- **Escorta vorsichtig nur +0.75 % langsamer statt 1 bis 4 % (verfehlt):** Der vorsichtige Testfahrer fährt fast überall
  kurvenbegrenzt (gleiches geplantes Kurventempo für alle Autos), da hilft weniger Leistung kaum. Mehr Abstand ginge nur mit
  noch weniger Schub – aber 0–100 km/h Asphalt liegt mit +8.3 % schon fast an der Grenze (+9 %).
- **Testfahrer-Werkzeug für den Escorta angepasst** (nur `tools/testfahrer-browser.js`, nicht das Spiel, wie im Auftrag
  vorgesehen): Ohne Anpassung drehte sich der flotte Testfahrer beim Herausbeschleunigen (Heck unter Gas = genau der
  Charakter). Jetzt nimmt er beim Escorta das Gas zurück, wenn der Schwimmwinkel über 3° steigt (bei 9° ganz weg), wie ein
  Mensch. Alle anderen Autos fahren genau wie bisher.
- **Delto: Heck beim Bremsen +3.2° (knapp über der unteren Grenze).** Mit `gewichtstransfer` über 0.4 kam der flotte
  Testfahrer bei **694–730 m** (lange Linkskurve, Bremsen mit 130 km/h) quer – dieselbe Stelle wie beim Audan in M8b. Dafür
  fängt `stabilitaet` 7.5 (Prototyp 5) das Heck schneller ein (0.38 s). Achtung: Diese Stelle ist eine scharfe Kante, schon
  kleine Änderungen (0.42 / 0.44) lassen den flotten Testfahrer dort wieder quer kommen.
- **Escorta: Vollgas in der Kurve kippt.** `antriebHinten` 1.12 gibt +2.4° mehr Schwimmwinkel als der Prototyp (Ziel +2 bis
  +6°). Schon bei 1.13 kippt das Auto in einen langen Drift (+5.9°), bei 1.15 +9.5°. Darunter bleibt es ruhig. Das ist genau
  das Verhalten eines Hinterradantriebs am Limit, kann sich aber **plötzlich** anfühlen. Auf **Schotter mit Vollgas** in der
  Kurve geht der Escorta stark quer (gemessen bis 29° Schwimmwinkel in der Kurve R 80 m, Prototyp 3°; Info, ohne Dreher).
- **Escorta: `heckJeBelag`** (Schotter 1.15, Wiesenweg 1.25) – klingt nach mehr Heck-Grip, gleicht aber nur aus, dass der
  Hinterradantrieb im Kreis auf losem Boden Haftung kostet (sonst Kreis Schotter −5 %). Unter Gas bleibt das Heck locker.

**Pace-Notes** (`node tools/pacenotes-test.mjs --auto <id>`, nur gemeldet, nichts neu geschrieben; Grenztempo der 25 Kurven):
- **Delto**: 24 von 25 im Zielbereich (Schotter/Wiesenweg +1.9 bis +8.3 %, Asphalt −0.5 bis +3.5 %). Andere Stufe wären:
  **917–979 m** (Schotter) 2 → 3 und **1028–1057 m** 6 → 3 (dieselbe Messketten-Kurve wie beim Audan, siehe M8b).
- **Escorta**: Asphalt −1.8 bis +2.8 %; auf losem Boden langsamer. Ausserhalb ±5 %: **850–914 m** −6.1 %, **917–979 m** −5.8 %
  (Talschleife), **2027–2078 m −19.4 %** (Almweg, S-Kurve direkt nach dem Abzweig), **3092–3120 m −9.8 %** (Wiesenweg) und
  die Messketten-Kurven 1028–1057 m und 3197–3231 m. Andere Stufe wären: 2027–2078 m 3 → 2, 3022–3089 m 4 → 3,
  3092–3120 m 3 → 2, 1028 m und 3197 m 6 → 3. Das passt zum Hinterradantrieb (die Messung hält in der Kurve das Tempo mit
  Gas), aber **die Almweg-S-Kurve ist mit dem Escorta merklich langsamer** als angesagt. Die Pace-Notes bleiben auf der Referenz.
  (Eine erste Fassung des Hinterrad-Terms machte den Wiesenweg 3022–3089 m −24 % langsamer; ich habe ihn darum entschärft:
  er rechnet jetzt gegen den Grip auf Asphalt, nicht gegen den kleineren Grip auf losem Boden.)

**Abkürzungen** (`node tools/abkuerzungen.mjs --pruefen --auto <id>`): mit **delto** und **escorta** je **127 / 2 / 342 / 84**
übrige Linien (wie die Referenz), gesperrt durchkommen: **0**. Gras und Bankett ohne Vorteil (0–60 km/h Gras gleich, 0–100
km/h Bankett langsamer; Delto mit `allrad.bankett` 0.9, damit er dort trotz mehr Schub nicht schneller ist).

### Messungen Ton (gerechnet, nicht gehört)

`node tools/m8c-test.mjs --nur h`, offline mit `js/audio.js` und dem echten Getriebe, vor dem Limiter:

| Messung | Prototyp | Audan | Delto | Escorta |
|---|---|---|---|---|
| Turbo-Pfeifen bei Vollgas (Anteil, RMS) | −34.0 dBFS (eigenes Modell) | −29.5 dBFS | −29.5 dBFS | **kein Pfeifen** (0) |
| Blow-off über 60 s fester Fahrt | 24 | 25 | 26 | **0** |
| Salven mit Pops über 60 s (Pops) | 16 (41) | 22 (46) | 21 (51) | **10 (22) = 63 %** |

- Audan und Prototyp: Ton **wie 0.8b** (`tools/ton-messung.mjs` gegen die Referenz, siehe „Selbst getestet“).
- Delto wie Audan (gleicher Turbo-Ton, der Ladedruck baut 0.4 statt 0.35 s auf).
- Escorta: `turboMal` 0 schaltet Pfeifen und Blow-off ganz aus, auch das eigene Pfeif-Modell des Tons (Ladedruck im Ton bleibt
  0); `knallMal` 0.5 halbiert die Knall-Chance (Zufall: über 60 s 63 %).

### Werte zum Drehen

**Fahrgefühl** (`js/config.js`, Blöcke `fahrprofile.delto` und `fahrprofile.escorta`; im Fahr-Labor sofort). Die Werte in
`auto` und `getriebe` selbst bleiben die Referenz (Profil `prototyp`), nicht dort ändern.

| Wert | Prototyp | Audan | Delto | Escorta |
|---|---|---|---|---|
| `auto.radstand` | 2.52 | 2.52 | 2.48 | 2.40 |
| `auto.traegheit` | 2.3 | 2.5 | 2.25 | 2.2 |
| `auto.schwerpunktVorne` | 0.48 | 0.46 | 0.49 | 0.5 |
| `auto.lastVorneAnteil` | 0.5 | 0.555 | 0.53 | 0.5 |
| `auto.gewichtstransfer` | 0 | 0.45 | 0.4 | 0.6 |
| `auto.stabilitaet` | 5 | 5 | 7.5 | 4.5 |
| `auto.gripHinten` | 1.12 | 1.12 | 1.12 | 1.04 |
| `auto.gasImDrift` | 0.12 | 0.07 | 0.12 | 0.22 |
| `auto.antriebHinten` (neu) | – | – | – | 1.12 |
| `auto.vorneJeBelag` Schotter / Wiesenweg | 1 / 1 | 1.06 / 1.06 | 1.06 / 1.08 | 1 / 1 |
| `auto.heckJeBelag` Schotter / Wiesenweg | 1 / 1 | 1.15 / 1.25 | 1.12 / 1.22 | 1.15 / 1.25 |
| `getriebe.allrad` Schotter / Wiesenweg / Bankett | 1 / 1 / 1 | 1.2 / 1.15 / 1 | 1.15 / 1.1 / 0.9 | 0.95 / 0.9 / 1 |
| `getriebe.zugkraftFaktor` | 1 | 0.99 | 1.02 | 0.92 |
| `getriebe.gaenge` (km/h je Gang) | 48/82/118/156/195 | wie Prototyp | 48/80/112/140/166 | 48/82/118/150/168 |
| `getriebe.turbo` | aus | an | an, Aufbau 0.4 s | aus |
| `ton` (turboMal / knallMal) | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0.5 |

**Garage**: `js/config.js`, Block `garage` (Tafel, Vorschau-Höhe, Drehdauer 8 s, Kamera, Drehscheibe).
**Lackierungen**: `js/config.js`, `autoOptik.lackierungen` (deltoWerk, rosso, waldgruen, escortaWerk, kanarie, tannengruen).

### Test-Anleitung für Lino (M8c)

**Zuerst die Garage (5 Minuten), dann fahren (20 Minuten), dann hören (5 Minuten).** Am besten auf beiden Rechnern.

1. **Hauptmenü → AUTO** (das ist jetzt die **Garage**): Mit Pfeil hoch/runter (oder Maus, oder Gamepad) durch die drei Autos
   gehen – das Modell rechts wechselt sofort und dreht sich. Zur Zeile **LACK:** gehen und mit links/rechts die drei
   Lackierungen durchschalten. Schau auf die **Balken** (Beschleunigung, Höchsttempo, Grip, Drift) und die zwei Zeilen unten.
   Wirken die Autos auch bei 320x180 eigenständig? Dann ein Auto wählen, ZURÜCK, **STARTEN**.
2. **Lanza Delto** und **Fard Escorta** je ein paar Minuten fahren, **immer in dieser Reihenfolge**:
   - **Kehren** (Kehre 1 bei ca. 1350 m) und **raus beschleunigen**: der Delto sollte kräftig ziehen, der Escorta mit Gas das
     Heck kommen lassen.
   - **Nebenwege**: Talschleife (Schotter, ab 800 m), Almweg (ab 1986 m), Wiesenweg (ab 2798 m). Delto: viel Halt, zieht.
     Escorta: rutschiger, mit Gas quer – **achte auf die S-Kurve gleich nach dem Almweg-Abzweig (ca. 2030 m)**, da ist der
     Escorta laut Messung deutlich langsamer.
   - **In die Kurve bremsen** (z. B. lange Linkskurve ab 504 m): Delto kurz, Escorta deutlich – kommt er nach ca. 1 s
     wieder gerade? **Vorsicht um 695 m** (harter Bremspunkt mit ca. 130 km/h).
   - **Handbremse** in den Kehren.
3. **A/B-Vergleich**: dieselben Stellen mit `index.html?auto=prototyp` (altes Fahrverhalten, Aussehen Audan) fahren.
4. **Bestzeiten** ansehen (Hauptmenü → BESTZEITEN): jede Zeile hat den Kurznamen des Autos (QUARTO, DELTO, ESCORTA).
   Deine alten Zeiten stehen als QUARTO drin.
5. **Ton-Labor** (`ton-labor.html`): TON STARTEN, bei **FAHRPROFIL (TON)** zuerst **AUDAN QUARTO**, dann **FARD ESCORTA**
   wählen und je **Anfahren bis 160 km/h** und mehrmals **Pop-Salve** drücken: Der Escorta hat kein Turbo-Pfeifen und kein
   Blow-off und poppt seltener. Dann im Spiel: Gas wegnehmen mit dem Escorta.
6. **Fahr-Labor** (`index.html?fahrlabor=1`): oben die vier Knöpfe PROTOTYP / AUDAN QUARTO / LANZA DELTO / FARD ESCORTA
   (schalten nur das Fahrgefühl, das Aussehen bleibt). Regler drehen, **WERTE KOPIEREN** und mir schicken (die erste Zeile
   nennt das Profil).

**Wenn X, dann Y** (Wert in `js/config.js`, Profil delto bzw. escorta, oder im Fahr-Labor ausprobieren und mir die Zeilen schicken):

| Wenn … | dann … |
|---|---|
| der Escorta zu zickig ist (Heck kommt zu leicht / zu plötzlich) | `fahrprofile.escorta.auto.gasImDrift` runter (z. B. 0.15) oder `auto.stabilitaet` hoch (z. B. 5) |
| der Escorta unter Gas zu plötzlich quer geht | `auto.antriebHinten` runter (1.0 = merklich ruhiger, 0 = aus); nur in kleinen Schritten hoch (ab 1.13 kippt es) |
| der Escorta zu brav ist | `auto.antriebHinten` 1.13 bis 1.15, `auto.gripHinten` 1.0 |
| das Heck des Escorta beim Bremsen zu stark kommt | `fahrprofile.escorta.auto.gewichtstransfer` runter (z. B. 0.5) |
| der Escorta zu langsam auf Asphalt ist | `fahrprofile.escorta.getriebe.zugkraftFaktor` hoch (z. B. 0.96) |
| der Escorta auf Schotter/Wiesenweg zu wenig zieht | `getriebe.allrad.schotter` / `.wiesenweg` hoch (1 = wie der Prototyp) |
| der Delto zu zahm ist | `fahrprofile.delto.getriebe.allrad` hoch (z. B. Schotter 1.2) oder `auto.gewichtstransfer` hoch (Achtung 695 m) |
| der Delto zu nervös ist (Heck beim Bremsen) | `fahrprofile.delto.auto.gewichtstransfer` runter (z. B. 0.3) |
| der Delto auf Schotter zu viel Grip hat | `auto.vorneJeBelag.schotter` und `heckJeBelag.schotter` runter (z. B. 1.03 / 1.06) |
| der Delto zu langsam ist (oben herum) | `fahrprofile.delto.getriebe.gaenge` 4./5. Gang länger (z. B. 150 / 175) |
| die Drehscheibe zu schnell / zu langsam dreht | `garage.drehDauer` (Sekunden pro Umdrehung) |
| dir die Balken komisch vorkommen | sag es – sie sind aus den Messungen gerechnet (`WERTE_VORSCHRIFT` in `js/autos.js`) |

**Für Änderungen schreib einfach, was dir nicht gefällt (mit Screenshot oder den kopierten Werten), das wird dann M8c.1.**

### So testest du (Werkzeuge)

- `node tools/m8c-test.mjs` (neu: Prüfungen (a) bis (l), mit (i) und (l) mehrere Stunden; einzeln z. B. `--nur c,d,j`;
  `--kurz` ohne die langen Läufe in (i); `--alt <ordner 0.8b>` misst in (l) die Ladezeit)
- `node tools/m8c-bilder.mjs` (neu: alle Bilder unten)
- `node tools/auto-messung.mjs` (jetzt alle Profile, Messtabelle M8c, Werte-Balken; `--nur-tabelle` ohne zu messen)
- wie bisher mit `--auto delto` oder `--auto escorta`: `tools/testfahrer.mjs`, `tools/pacenotes-test.mjs`,
  `tools/abkuerzungen.mjs --pruefen`, `tools/felswand-test.mjs`, `tools/aufprall-test.mjs`, `tools/menue-test.mjs`,
  `tools/rennablauf-test.mjs`

### Bilder (`screenshots/m8c/`)

| Datei | Was |
|---|---|
| `10-garage-<auto>-<lack>-320x180/-1280x720` | Garage mit jedem Auto und jeder Lackierung (9 je Grösse) |
| `11-garage-en-…` | Garage englisch |
| `20-<auto>-heck/-dreiviertel/-seite/-front` | Audan (rt4), Delto, Escorta im Spiel an der Startlinie, je 1280x720 und `…-320x180` |
| `30-delto-kurve`, `30-escorta-kurve` | in der Kehre (Seite sichtbar), je 1280x720 und 320x180 |
| `31-escorta-drift-schotter`, `32-escorta-drift-gas-schotter` | Escorta im Drift auf Schotter (Handbremse; mit Gas) |
| `40-labor-<auto>-ansichten/-heck-lackierungen/-lackierungen-dreiviertel-<grösse>` | Auto-Labor, `<grösse>` = 320x180, 480x270, 640x360 (Originalgrösse) |
| `41-alle-drei-320x180/-640x360` | Audan, Delto, Escorta nebeneinander von hinten (wie im Spiel) und drei Viertel |
| `70-bestzeiten-de/en-320x180/-1280x720` | gemeinsame Bestzeiten mit Kurznamen |
| `80-messtabelle.png`, `80-messtabelle.md` | die Messtabelle |
| `90-fahrlabor`, `91-auto-labor`, `92-ton-labor-escorta` | Fahr-Labor mit vier Profilen, Auto-Labor mit Auswahl, Ton-Labor mit Profil Escorta |

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/main.js` | Autowechsel (`autoWechseln`), Masse vom Modell, gemerkte Auswahl, Garage zeichnen (nur auf der Seite AUTO), Ton je Profil |
| `js/garage.js` | **neu**: Drehscheibe, zweite kleine Szene im selben Renderer |
| `js/autos.js` | Kurzname, Kollision und Staub je Auto, Werte-Balken mit Rechenvorschrift; **neu** Lanza Delto und Fard Escorta |
| `js/car.js` | Lackierung gehört zum Auto, `dispose()`, Lichtzustand (für die Garage) |
| `js/config.js` | Profile delto und escorta, Block `ton` je Profil, sechs Lackierungen, Heckwischer-Farbe, Block `garage`, Einstellungen `auto`/`lacke`, Version 0.8c |
| `js/physics.js` | `antriebHinten` (Hinterradantrieb, im Prototyp ohne Wirkung) |
| `js/fahrprofil.js` | Ton-Werte des Profils (`tonWerte`) |
| `js/kollision.js`, `js/staub.js`, `js/vergleich.js` | Masse des gewählten Autos (Umriss, Staub-Austritt, Vorlauf beim Stehstart) |
| `js/einstellungen.js`, `js/inhalte.js` | Auto und Lackierungen gemerkt; Autoliste aus `js/autos.js` |
| `js/menue.js`, `js/menueseiten.js`, `js/texte.js` | Garage (Spalte, Vorschau, Balken, Farbprobe), Kurznamen in den Bestzeiten und im Zielbildschirm, Texte de/en |
| `js/audio.js`, `js/tonlabor.js`, `ton-labor.html` | `turboMal`/`knallMal`, Auswahl FAHRPROFIL (TON) |
| `js/fahrlabor.js`, `js/autolabor.js`, `auto-labor.html` | ein Knopf je Profil; Auswahl Auto |
| `tools/m8c-test.mjs`, `tools/m8c-bilder.mjs`, `tools/m8c-ziele.js`, `tools/m8c-referenz-audan.json` | **neu** |
| `tools/auto-messung.mjs`, `tools/fahrmessung.js` | alle Profile, Höchsttempo, Tabelle M8c, `--nur-tabelle` |
| `tools/testfahrer-browser.js` | Gas zurück im Drift, **nur für den Escorta** |
| `tools/felswand-test.mjs` | Umriss aus `grenze.wandHuelle` statt fest 4.48 x 1.86 (beim Audan dieselben Zahlen) |

### Selbst getestet

- **`node tools/m8c-test.mjs`** (neu, (a) bis (l)):
  - (a) **Profil `prototyp` bit-genau**: Werte wie 0.7b, 70-s-Fahrt-Prüfsumme **3d98a02d**, Testfahrer **2:59.33 / 2:42.35 /
    2:31.92** mit Zwischenzeiten und Statistik, Abkürzungen **127 / 2 / 342 / 84** (gesperrt durchkommen 0), **Ton** wie 0.8b
    (gleich bis auf Rechenrauschen in der 4. Stelle, wie schon in M8b). ✅
  - (b) **Audan Quarto unverändert**: alle 20 Fahrmessungen gleich wie M8b (`tools/m8b-messung.json`), **9 Draw Calls,
    1306 Dreiecke** (wie M8b), Bilder im Auto-Labor (Heck, Drei-Viertel, Seite bei 320x180, Drei-Viertel vorne bei 640x360)
    **pixelgleich** mit 0.8b (0 Pixel anders). ✅
  - (c) **Modelle**: Delto 4.034 x 1.800 x 1.450 m, Escorta 4.100 x 1.760 x 1.340 m, Audan 4.475 x 1.860 m; Radstand, Spur,
    Radradius wie vorgegeben; je **9 Draw Calls**, Dreiecke 1306 / 1150 / 1196; kein NaN; keine Helme hinten, Helme seitlich
    und vorne klein (r ≤ 0.085) und dunkel; alle neun Lackierungen malen ohne Fehler; nur Pixelschrift; **kein RINGWERK,
    keine echte Marke** (Suche nach 27 Namen in allen Texten: nichts; „LIVE DELTA“ = englisch für Live-Vergleich ist erlaubt). ✅
  - (d) **Wechsel**: 30 Wechsel mit der Tastatur in der Garage – Profil, Modell, Kollision, Felswand, Radstand, Räder, Staub,
    Dreck, Federung folgen jedes Mal; **Speicher stabil** (Geometrien 87 → 87, Texturen 25 → 25, JS-Heap +0.53 MB nach
    Aufräumen); Bremslicht am neuen Auto geht; **kein Wechsel** im Countdown, im Rennen, in der Pause; nach Neuladen Auto
    und Lackierung je Auto erhalten; unbekannte Werte → Audan, Lack WERK; `?auto=` setzt Modell und Profil. ✅
  - (e) **Masse im Spiel**: `felswand-test` mit jedem Auto bestanden (Karosserie höchstens **1 cm** in der sichtbaren Wand,
    Kamera ≥ 63 cm Luft), `aufprall-test` mit jedem Auto bestanden (kein Hängenbleiben an Bäumen, Zäunen, Steinen), Staub
    höchstens 0.22 m neben dem Hinterrad. ✅
  - (f) **Fahrmessungen**: alle Zeilen der Tabelle im Ziel; **3 Kompromisse** beim Testfahrer (siehe oben); keine Dreher;
    Werte-Balken = Messung. ✅ (mit Kompromissen)
  - (g) **Bestzeiten**: Lauf mit jedem Auto eingetragen (Auto-Id im Eintrag), gemeinsame Liste mit QUARTO / DELTO / ESCORTA /
    PROTO, alte Einträge (ohne Id, rt4, prototyp) richtig, Live-Vergleich gegen die gemeinsame Bestzeit, Felder unverändert. ✅
  - (h) **Ton**: Tabelle oben; Escorta ohne Pfeifen und Blow-off, Pops 63 %; Konsole ohne Fehler. ✅
  - (i) **Demo-Fahrt** mit jedem Auto: ganze Etappe, 0 Aufpralle, 0 Kontakte, nie hängen geblieben. `menue-test` mit allen
    drei Autos bestanden; `rennablauf-test` mit allen drei Autos bestanden (mit der angepassten Soll-Zeit, siehe unten). ✅
  - (j) **Garage**: ohne Seite AUTO zeichnet die Garage nichts (Zeichenaufrufe = nur die Szene, 89), offen dreht sie (11
    Zeichenaufrufe für Auto und Drehscheibe), Tafel 312 x 172 bei 320x180, Lack wechselt, Balken zeigen die Daten, Texte de
    und en passen, Tastatur, Maus und Gamepad wechseln das Auto, geschlossen wieder ohne Aufwand. ✅
  - (k) **Fahr-Labor**: vier Knöpfe schalten live, Regler wirken auf das gewählte Profil, WERTE KOPIEREN nennt das Profil;
    ohne `?fahrlabor=1` kein Panel. **Auto-Labor**: drei Autos mit je drei Lackierungen. ✅
  - (l) **Stabilität** (Profil prototyp): `getriebe-test`, `lenk-test`, `handbremse-test`, `belag-test`, `rueckwaerts-test`,
    `aufprall-test`, `pacenotes-test`, `menue-test`, `rennablauf-test`, `ton-umgebung-test` **bestanden**, `auto-test` (a)–(n)
    bestanden (nach der Anpassung unten), `m8b-test` (a)–(g) bestanden.
  - **`ton-test` ehrlich: nicht bestanden** – nur an Zeit-Prüfpunkten im Test-Browser („?ton=aus / ?menue=aus: das Spiel
    läuft, Tempo 0.4 statt über 0.5 m/s nach 0.8 s“ und „Neustart: 8 Rauschquellen“). Die **unveränderte 0.8b** scheitert im
    selben Test-Browser an denselben Punkten (gleicher Lauf direkt danach: „Tempo 0.5 m/s“, „8 Rauschquellen“). Alle
    Ton-Inhalte (Pegel, Klänge, Signale, Musik) bestehen: 209 ok-Zeilen (0.8b: 210). Diese Punkte hängen an der Bildzeit des
    Test-Browsers (ca. 0.3 s pro Bild), siehe auch M8a/M8b.
- **Was ich an alten Tests ändern musste**:
  - `tools/felswand-test.mjs`: Umriss der Karosserie aus `grenze.wandHuelle` statt fest 4.48 x 1.86 m (beim Audan dieselben Zahlen).
  - `tools/auto-test.mjs` (f): prüft die Lackierungen des gebauten Modells statt aller Lackierungen in `config.js` (die sechs
    neuen gehören zu Delto und Escorta).
  - `tools/rennablauf-test.mjs`: die erwartete Testfahrer-Zeit „flott“ hängt mit `--auto` vom Auto ab (Standard prototyp
    2:31.92 wie bisher).
  - `tools/testfahrer-browser.js`: Gas zurück im Drift nur für den Escorta (siehe Kompromisse).
  - `tools/auto-messung.mjs`, `tools/fahrmessung.js`: erweitert (alle Profile, Höchsttempo); die alten Ausgaben bleiben.
  - Alle anderen Tests unverändert.
- **Leistung**: **Ladezeit** (Median aus 9, abwechselnd mit 0.8b) **1863 → 1815 ms** (−48 ms, Streuung ±200 ms; es wird nur
  das gewählte Auto gebaut). Zeichenaufrufe der Szene ohne Garage wie M8b (108 / 99 / 67 an drei Stellen, gleiche Zahl mit
  allen Autos). Die Garage kostet nur auf der Seite AUTO 11 Zeichenaufrufe zusätzlich.
- **Bilder** in 320x180, 480x270, 640x360 und 1280x720 angeschaut (Garage, alle Lackierungen, Spiel, Kurve, Drift, Labore).
- **Nicht gemacht: das Fahrgefühl gespürt und den Ton gehört.**

### Ehrlich beurteilt – wo ich am unsichersten bin

- **Eigenständig bei 320x180?** Ja, von hinten klar: der **Audan** ist breit und flach mit grossem Flügel und rotem
  Rücklichtband, der **Delto** ein kürzerer, höherer Kasten mit Dachspoiler-Kante und dunklem Heckband (Fliessheck mit
  steiler Klappe gut lesbar), der **Escorta** niedrig mit flachem Kofferraum, Chrom-Stossstange und zwei roten Rücklichtern.
  Von der Seite und vorne noch deutlicher (Kombi-artiger Kompakt gegen Stufenheck-Coupé). Mit gleicher Lackfarbe wären sie
  von weit hinten am ehesten über die Höhe zu unterscheiden – darum haben alle drei eigene Farben.
- **Fahrgefühl nicht gespürt.** Am unsichersten bin ich beim **Escorta unter Gas**: Der Hinterrad-Term kippt nahe am Limit
  (siehe Kompromisse). Er kann sich **zickig** anfühlen – oder genau wie ein Hinterrad-Drifter. Zweitens: Der Escorta auf
  **Schotter mit Vollgas** in der Kurve geht stark quer (bis 29°) – das kann Spass machen oder nerven. Drittens: Der **Delto** könnte **zu zahm** wirken – er ist auf dem
  Papier ein „besserer Audan“ (neutraler, gleich viel Grip), das Heck kommt beim Bremsen nur knapp (+3.2°).
- **Zuerst ausprobieren**: Escorta aus der Kehre heraus beschleunigen und die Almweg-S-Kurve, dann den Delto auf der
  Talschleife gegen den Audan.
- **Ton nicht gehört, nur gemessen.** Der Escorta klingt wie der Prototyp-Motor ohne Turbo-Pfeifen – einen eigenen
  4-Zylinder-Klang gibt es erst in M8d.

### Bekannte Probleme

- **Testfahrer**: Delto 0.04 / 0.16 s schneller als der Audan, Escorta vorsichtig nur +0.75 % (siehe Kompromisse).
- **Pace-Notes mit dem Escorta**: auf losem Boden mehrere Kurven langsamer als angesagt, die Almweg-S-Kurve (2027 m) −19 %.
  Die Pace-Notes bleiben auf der Referenz (wie gewollt).
- **694–730 m** (lange Linkskurve) bleibt für den flotten Testfahrer eine Kante: mit etwas mehr `gewichtstransfer` kommen
  Audan und Delto dort beim harten Bremsen quer.
- Die **Unfallautos** an der Strecke sind weiterhin die alten Klötzchen-Autos.
- `ton-test` scheitert im Test-Browser an Zeit-Prüfpunkten (Bildzeit) – mit 0.8b genauso (siehe „Selbst getestet“);
  `ton-umgebung-test` bestand diesmal. Schrift am Auto erst ab 480x270.

### Ideen/Vorschläge (nicht umgesetzt)

- **Motorklang je Auto (M8d)**: Delto 4-Zylinder-Turbo, Escorta 4-Zylinder ohne Turbo (heller, kerniger, kein Pfeifen);
  Lanza 073 (Mittelmotor) und Subora Imprexa mit **Boxer**-Klang.
- **Flamme aus dem Auspuff** beim Poppen (kleiner Pixel-Blitz; Escorta seltener, Delto rechts, Audan und Escorta links).
- **Dellen und Schaden** nach harten Aufprallen.
- **Unfallautos mit den neuen Modellen** (statt der alten Klötzchen-Autos).
- **Bestzeiten getrennt je Auto**, falls dich die gemeinsame Liste stört (Umschalter auf der Bestzeiten-Seite).
- Der **Testfahrer** könnte das Kurventempo aus dem Grip des Autos planen (dann zeigt er die Vorteile ehrlicher).
- Ein **„Auto-Info“** in der Pause (welches Auto, welche Lackierung).

---

## Meilenstein 8b: Name „Audan Quarto“, Fahrer-Feinschliff, spürbareres Fahrgefühl, Turbo im Ton ✅ (Verlauf, Stand damals – seit M8c gibt es drei Autos und die Garage)

> **Ehrlich vorneweg: Ich habe das Fahrgefühl nicht gespürt und den Ton nicht gehört.** Alles ist **gemessen** (Fahrphysik
> mit festen Fahrprogrammen, Testfahrer, Ton offline gerechnet und ausgewertet) und mit Bildern in drei Pixelgrössen
> angeschaut. Ob der Audan Quarto sich jetzt „deutlich anders“ anfühlt und ob der Turbo gut klingt, kannst nur du
> entscheiden. Darum zuerst die **Test-Anleitung** unten. **Für Änderungen schreib einfach, was dir nicht gefällt, das wird
> dann M8b.1.**

Vier Teile, vier Commits im selben Pull Request: **A = Fahrer**, **B = Name**, **C = Fahrgefühl**, **D = Turbo im Ton**
(dazu in D: Tests, Bilder, diese Beschreibung). So kannst du notfalls einen Teil getrennt zurückdrehen.

### Was ist neu?

**A – Fahrer** (`js/autos.js`, `js/car.js`, Farben in `js/config.js` unter `autoOptik.farben`)
- **Hinten keine Köpfe mehr.** Die Heckscheibe ist eine ruhige dunkle Scheibe mit einem dezenten, etwas helleren
  Glanzstreifen oben (wie an den Seitenscheiben). Keine hellen Punkte, keine Schultern.
- **Seite und Front dezenter**: Helme etwa 30 % kleiner (Seite Radius 0.12 → 0.085, Front 0.11 → 0.08), **gedeckte Farben**
  statt Weiss und Gelb: Fahrer **dunkles Blaugrau** (`helmFahrer` `#5c6b7a`), Beifahrer **dunkles Anthrazit** mit einem
  etwas anderen Ton (`helmBeifahrer` `#55585e`), damit man zwei Personen ahnt. Visier bleibt (schwarz), Schultern kleiner und
  dunkler (`schulter` `#23272d`). Der Helligkeitsunterschied zur Scheibe ist **um ca. 2/3 kleiner** als in M8a (mehr als
  halbiert, weil du „dunkel“ wolltest).

**B – Name: Audan Quarto** (Marke **AUDAN**, Modell **QUARTO**)
- Überall, wo man den Namen sieht: Menü AUTO (deutsch und englisch), Auto-Labor (Titel und Infozeile), Fahr-Labor (Knopf
  **AUDAN QUARTO** statt RT4, Anzeige „Profil AUDAN QUARTO“), `config.js` (`auto.name`), `js/autos.js`, Kommentare.
- **Am Auto**: Seite unten **AUDAN** (statt RINGWERK), Sonnenstreifen vorne **AUDAN** („AUDAN QUARTO“ wäre 71 Pixel breit, der
  Streifen hat bei 480x270 nur 58 Pixel), Kennzeichen **AQ 4** (statt RR 4). Die anderen Sponsoren bleiben.
- **Start/Ziel-Banner**: **AUDAN** statt RINGWERK (gleiche Farben, Rot/Weiss). „RINGWERK“ steht im Spiel (js, html) nirgends mehr.
- **Die Id bleibt `rt4`** (auch `?auto=rt4` und das Fahrprofil `rt4`): **deine Bestzeiten bleiben stehen**.
- **Namensregel** (neu in `CLAUDE.md` und `KONZEPT.md`): Fantasienamen mit **denselben Anfangsbuchstaben** von Marke und
  Modell wie beim echten Vorbild, sonst erfunden, nie ein echter Name, keine echten Logos.

**C – Fahrgefühl** (nur Profil `rt4` in `js/config.js`, `fahrprofile.rt4`; `prototyp` ist bit-genau wie vorher)
- **Neue Schraube `auto.vorneJeBelag`**: Grip der **Vorderachse** je Belag (wie `heckJeBelag` fürs Heck; fehlt ein Belag = 1).
  Im Prototyp 1 (wirkungslos). Warum? Auf Schotter rutscht im Kreis zuerst die Vorderachse – genau da half der bessere
  Heck-Grip aus M8a nicht (darum fühlte es sich nur „etwas“ besser an).

| Wert (`fahrprofile.rt4`) | Prototyp | M8a | **M8b** | Was es bewirkt |
|---|---|---|---|---|
| `auto.vorneJeBelag` | 1 | – | **Schotter 1.06, Wiesenweg 1.06** | Front beisst auf losem Boden (Asphalt, Bankett, Gras: nichts) |
| `auto.heckJeBelag` | 1 | Schotter 1.1, Wiesenweg 1.15 | **Schotter 1.15, Wiesenweg 1.25** | Heck hält mit, sonst rutscht jetzt hinten zuerst |
| `getriebe.allrad` | 1 | Schotter 1.15, Wiesenweg 1.1 | **Schotter 1.2, Wiesenweg 1.15** | kräftiger raus aus Kehren und vom Wiesenweg |
| `auto.gewichtstransfer` | 0 | 0.35 | **0.45** | Heck kommt beim Bremsen in der Kurve deutlicher |
| alle anderen | | | wie M8a | (lastVorneAnteil 0.555, schwerpunktVorne 0.46, traegheit 2.5, gasImDrift 0.07, zugkraftFaktor 0.99, Turbo an) |

- **Fahr-Labor** (`index.html?fahrlabor=1`): jetzt **14 Regler**, neu `auto.vorneJeBelag.schotter` und
  `getriebe.allrad.wiesenweg`.

**D – Turbo im Ton** (`js/audio.js`, `js/main.js`, `js/config.js` unter `audio.motor`, `js/tonlabor.js`, `ton-labor.html`)
- Das Spiel gibt dem Ton jetzt den **echten Ladedruck** (`getriebe.ladedruck`) und ob das Fahrprofil einen Turbo hat. **Nur
  mit Turbo** (Audan Quarto) folgt der Ton diesem Ladedruck; im Profil `prototyp` rechnet der Ton wie bisher (identisch).
- **Pfeifen**: steigt nach dem Gasgeben mit dem Aufbau des Ladedrucks (in ca. 0.35 s, Tonhöhe 2200 → 5200 Hz), bleibt in der
  **Schaltpause** dank Anti-Lag hörbar (Ladedruck mindestens 0.7) und ist um `turboPegelMal` **1.35** lauter (+2.6 dB) – der
  Motor bleibt bei Vollgas **16 dB lauter** als das Pfeifen.
- **Blow-off** (Zischen beim Gaswegnehmen): liest den echten Ladedruck.
- **Pops**: mit aktivem Anti-Lag (Gas weg über 4000 U/min, Ladedruck hoch) etwas öfter: Knall-Chance **+0.15**
  (`turboKnallPlus`), Salven, Abstand und Sperre (1 s) unverändert.
- Motor (Grundton, Oktavschicht, Rauheit, Schaltknall, Klack), Reifen, Wind, Aufprall, Signale, Umgebung, Musik: unverändert.
- **Ton-Labor** (`ton-labor.html`, Bereich Motor): Schalter **ECHTER LADEDRUCK AN** und Regler **LADEDRUCK (Test)** (0 bis 1);
  mit dem Schalter liefert auch „Anfahren bis 160 km/h“ den echten Ladedruck (Getriebe mit Turbo). Im Feinschliff neu:
  `turboPegelMal` und `turboKnallPlus`.

### Messtabelle Fahrgefühl (Audan Quarto gegen `prototyp`)

`node tools/m8b-messung.mjs` (Bild: `screenshots/m8b/80-messtabelle.png`, Zahlen: `tools/m8b-messung.json`). Prozent = Unterschied
zum Prototyp (bei Zeiten: minus = schneller).

| Messung | Prototyp | M8a | **M8b** | Ziel M8b | erfüllt? |
|---|---|---|---|---|---|
| 0–100 km/h Asphalt | 5.13 s | −2.1 % | **−2.1 %** | ±3 % | ✅ |
| 0–100 km/h Schotter | 5.78 s | −5.2 % | **−5.6 %** | −7 bis −10 % | ❌ Kompromiss |
| 0–60 km/h Schotter (Info: aus der Kehre) | 3.01 s | −6.9 % | **−7.8 %** | – | – |
| 0–100 km/h Wiesenweg | 8.28 s | −9.5 % | **−12.8 %** | −11 bis −14 % | ✅ |
| 0–60 km/h Gras | 10.10 s | ±0 % | **±0 %** | gleich | ✅ |
| 0–100 km/h Bankett | 6.15 s | −2.0 % | **−2.0 %** | nicht schneller als M8a | ✅ |
| Bremsweg 100 → 0 Asphalt | 35.8 m | ±0 % | **±0 %** | ±5 % | ✅ |
| Kreis R 25 m Grenztempo Asphalt | 54.4 km/h | +2.6 % | **+2.5 %** | +1 bis +3 % | ✅ |
| Kreis R 25 m Grenztempo **Schotter** | 49.3 km/h | +2.6 % | **+5.3 %** | +5 bis +8 % | ✅ (knapp) |
| Kreis R 25 m Grenztempo Wiesenweg | 40.9 km/h | +8.5 % | **+12.5 %** | +10 bis +14 % | ✅ |
| Lenkwinkel 80 km/h auf R 60 m | 3.54° | +15.8 % | **+16.9 %** | +10 bis +20 % | ✅ |
| Heck: 90 km/h, R 80 m, Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s | −0.3° | +2.3° | **+3.6°** | +3.5 bis +5° | ✅ (knapp) |
| … wieder eingefangen nach | – | 0.38 s | **0.57 s** | unter 0.8 s | ✅ |
| Heck: dasselbe mit Vollbremsung | −0.4° | +4.4° | **+5.3°** | höchstens 7° | ✅ |
| Vollgas in der Kurve R 80 m: Schwimmwinkel | 3.9° | −25.9 % | **−29.6 %** | kleiner oder gleich | ✅ (Gas hält das Heck ruhig) |
| … auf Schotter (Info) | 3.3° | −5.6 % | **−1.4 %** | – | – |
| Handbremsen-Drift Asphalt nach 0.5 s | 6.7° | −8.8 % | **−6.6 %** | ±15 % | ✅ |
| Rückwärts (Höchsttempo, nach 1 s, Gras) | | identisch | **identisch** | identisch | ✅ |

**Testfahrer (ganze Etappe, ohne Aufprall, ohne Hänger):**

| Fahrer | Prototyp | RT4 0.8a | **Audan Quarto 0.8b** | gegen Prototyp | Wiesenweg | Asphalt-Abschnitte |
|---|---|---|---|---|---|---|
| vorsichtig | 2:59.33 | 2:58.73 | **2:58.65** | −0.4 % (−0.68 s) | 17.43 → 17.20 s (−1.3 %) | −0.3 % |
| mittel | 2:42.35 | 2:41.83 | **2:41.76** | −0.4 % (−0.59 s) | 15.58 → 15.38 s (−1.3 %) | −0.3 % |
| flott | 2:31.92 | 2:31.24 | **2:31.22** | −0.5 % (−0.70 s) | 14.50 → 14.34 s (−1.1 %) | −0.4 % |

**Zeitunterschied für deine Bestzeiten:** Gegen 0.8a ist der Testfahrer mit dem Audan Quarto nur **0.02 bis 0.08 s**
schneller, gegen das alte Fahrverhalten (0.7b, `prototyp`) **0.6 bis 0.7 s** (0.4 bis 0.5 %). Deine Bestzeiten bleiben also
fair. Ein Mensch, der den besseren Grip auf Schotter und Wiesenweg in den Kurven nutzt, sollte mehr gewinnen als der
Testfahrer (siehe Kompromisse).

**Kompromisse (ehrlich, und welche Ziele ich verfehle):**
- **0–100 km/h auf Schotter −5.6 % statt −7 bis −10 % (verfehlt).** Auf Schotter ist der Prototyp nur im **1. Gang** (bis
  48 km/h) durch den Grip begrenzt, darüber bremst ihn der **Motor**, nicht der Boden. Allrad hilft also nur bis 48 km/h – ab
  `allrad.schotter` ca. 1.21 bringt mehr Allrad gar nichts mehr (gemessen: auch mit 2.0 nur −5.8 %). Mehr ginge nur mit mehr
  Motorleistung (`zugkraftFaktor`), aber dann wären **Asphalt (−3.1 %) und Bankett (−2.8 %)** ausserhalb – und Asphalt hat
  Vorrang. Was du auf Schotter spürst, ist eher das Anfahren aus der Kehre: **0–60 km/h −7.8 %**.
- **Testfahrer nur 0.4 bis 0.5 % schneller statt 0.5 bis 1.5 % (knapp verfehlt).** Wie in M8a: Der Testfahrer plant das
  Kurventempo für beide Autos gleich (aus Krümmung, Belag und einer festen Querbeschleunigung je Fahrer) und nutzt den
  besseren Kurven-Grip auf Schotter und Wiesenweg darum nicht. Er gewinnt nur beim Herausbeschleunigen. Mehr ginge wieder
  nur über mehr Schub auf Asphalt (siehe oben).
- **Heck beim Bremsen: `gewichtstransfer` 0.45 statt höher.** Mit 0.47 wäre das Heck +3.9°, aber dann rutscht der
  **flotte Testfahrer bei 695 m** (in der langen Linkskurve 504–749 m, beim Bremsen mit ca. 130 km/h) von der Strasse und
  prallt auf (126 → 3 km/h; schon ab 0.46 ein leichter Kontakt). 0.45 ist knapp unter dieser Kante: Heck +3.6° (Ziel ab +3.5°), sauber eingefangen nach 0.57 s.
- **`heckJeBelag` auch erhöht** (Schotter 1.1 → 1.15, Wiesenweg 1.15 → 1.25): Mit mehr Grip vorne allein rutschte im
  Kreis plötzlich das Heck zuerst (Wiesenweg fiel sogar von +8.5 % auf +3.2 %). Folge: Der Handbremsen-Drift auf Schotter ist
  jetzt fast wie beim Prototyp (−1.5 % statt −6.6 %), auf Asphalt −6.6 % (Ziel ±15 %).
- **Kreis Schotter +5.3 % und Heck +3.6°** liegen knapp an der unteren Grenze der Ziele – bewusst, damit Schotter nicht zu
  viel Grip bekommt und das Heck nicht nervös wird. Mehr: `auto.vorneJeBelag.schotter` 1.08 gibt ca. +5.9 %.

**Pace-Notes mit dem Audan Quarto** (`node tools/pacenotes-test.mjs --auto rt4`, nur gemeldet, nichts neu geschrieben): 24 von
25 Kurven im Zielbereich (Asphalt −1.7 bis +3.5 %, Schotter und Wiesenweg +1.9 bis +7.2 %). Andere Stufe für den Audan wären:
**917–979 m** (Schotter, Talschleife) 2 → 3, **1088–1226 m** (Asphalt) 4 → 5 (wie schon in M8a) und **1028–1057 m** (Asphalt,
direkt nach der Einmündung der Talschleife) **6 → 3**. Die letzte ist ein Effekt der Messkette: Diese Kurve ist nur „Vollgas“,
weil man aus der Schotterkurve davor (981–1026 m) langsam herauskommt. Der Audan kommt dort ca. 1 km/h schneller heraus
(64.6 statt 63.5 km/h) und schafft die Kurve dann mit Vollgas nicht mehr ganz (gemessen: **auch der Prototyp** rutscht dort
mit 64.6 km/h Einfahrt über den Rand). Im Spiel heisst das: Nach der Talschleife bei „RECHTS 6“ evtl. kurz lupfen. Die
Pace-Notes bleiben wie gewollt auf der Referenz.

**Abkürzungen**: mit `prototyp` und mit `rt4` je **127 / 2 / 342 / 84** übrige Linien, gesperrt durchkommen: 0. Gras und
Bankett bekommen keinen neuen Vorteil (dort wirken `vorneJeBelag`, `heckJeBelag` und `allrad` nicht). Kreis R 25 m auf Gras
+3.3 %, Bankett +2.9 % – genau wie in M8a (+3.3 / +3.0 %, kommt von der Gewichtsverteilung `lastVorneAnteil` aus M8a);
Anfahren auf Gras gleich, auf dem Bankett −2.0 % wie in M8a.

### Messungen Turbo-Ton (gerechnet, nicht gehört)

`node tools/m8b-ton.mjs` (Zahlen: `tools/m8b-ton.json`), offline mit `js/audio.js` und dem echten Getriebe, vor dem Limiter:

| Messung | ohne Turbo (Prototyp, wie 0.8a) | mit Turbo (Audan Quarto) | Ziel |
|---|---|---|---|
| Pfeifen bei vollem Ladedruck (RMS) | −32.2 dBFS | **−29.5 dBFS** (+2.7 dB) | etwas präsenter (`turboPegelMal` 1.35 = +2.6 dB) ✅ |
| Spektralschwerpunkt des Pfeifens (voll / halb) | 5200 Hz | **5200 / 3700 Hz** | Tonhöhe steigt mit dem Ladedruck ✅ |
| Motor bei Vollgas lauter als das Pfeifen (5000 / 7000 U/min) | 18.8 / 19.5 dB | **16.1 / 16.9 dB** | Motor klar lauter, nie dominant ✅ |
| Spitze Motor + Pfeifen (vor dem Limiter, 5000 U/min) | 0.612 | **0.628** | wie bisher, unter dem Limiter ✅ |
| Aufbau nach Vollgas (3. Gang, 4400 U/min): Ladedruck im Ton 95 % / Pegel 90 % | 1.32 / 1.28 s (eigenes träges Modell) | **0.35 / 0.42 s** | `turbo.aufbau` 0.35 s ±25 % (0.26–0.44 s) ✅ |
| Schaltpause 2 → 3 mit Vollgas: Pfeifen in der Pause (RMS, kleinster Wert) | fällt auf 0.0089 (vorher 0.0119) | **0.0186** (Ladedruck nie unter 0.70) | nie unter dem Pegel bei Ladedruck 0.7 (0.0164) ✅ |
| Pops über eine feste 60-s-Fahrt (24 Mal Gas weg) | 16 Salven, 41 Pops | **22 Salven, 46 Pops** | etwas mehr ✅ |

- **Prototyp-Ton wie 0.8a**: dieselbe Messung wie `tools/ton-messung.mjs` (Motor, Turbo, Aufpralle, Pops, Klack, Signale,
  Heulen, Audio-Knoten) gegen `tools/ton-messung-08a.json` (gemessen mit 0.8a): gleich. **Ehrlich:** Zwei Läufe weichen in der
  4. Nachkommastelle ab (z. B. Schwerpunkt 220.721 / 220.7215 Hz) – das tut auch **0.8a gegen sich selbst** (Rechenrauschen
  des Offline-Renderers im Test-Browser). Der Vergleich lässt darum 0.1 % Unterschied zu; es gibt keine echte Abweichung.
- **Speicher pro Bild**: mit Turbo-Ton gleich wie ohne (Unterschied 4.5 Byte im Test-Browser, ein neues Objekt wären 16 Byte
  und mehr; die Messung schwankt dort stark, darum das Minimum aus 4 abwechselnden Läufen).

### Werte zum Drehen

**Fahrgefühl** (`js/config.js`, Block `fahrprofile.rt4`; im Fahr-Labor sofort): Tabelle oben unter „C – Fahrgefühl“. Die Werte
in `auto` und `getriebe` selbst bleiben die Referenz (Profil `prototyp`), nicht dort ändern.

**Turbo-Ton** (`js/config.js`, `audio.motor`; im Ton-Labor unter Feinschliff sofort):

| Wert | Standard | Was |
|---|---|---|
| `turboPegelMal` | 1.35 | Pfeifen mit Turbo so viel lauter als `turboPegel` (0.035) |
| `turboKnallPlus` | 0.15 | so viel mehr Knall-Chance mit Anti-Lag (Grundwert `knallChance` 0.7) |
| `turboEchtGlaetten` | 0.03 | so weich (Sekunden) folgt das Pfeifen dem Ladedruck |
| `turboTonMin` / `turboTonMax` | 2200 / 5200 | Tonhöhe des Pfeifens bei wenig / vollem Ladedruck (Hz) |
| `blowOffAb`, `blowOffPegel` | 0.5, 0.16 | Zischen ab diesem Ladedruck, so laut |

**Aussehen**: `autoOptik.farben.helmFahrer` / `helmBeifahrer` / `schulter` (Farben), Grösse der Helme in `js/autos.js`
(`r`, `schulter: [Breite, Höhe]`).

### Test-Anleitung für Lino (M8b)

**Zuerst ansehen (5 Minuten), dann fahren (15 Minuten), dann hören (10 Minuten).** Am besten auf beiden Rechnern.

1. **Auto-Labor** (`…/alpine-rally/auto-labor.html`): oben steht jetzt **AUDAN QUARTO**.
   - Pixelgrösse **320x180**, Knopf **HECK** (wie im Spiel): In der Heckscheibe sollten **keine Köpfe** mehr sein, nur eine
     ruhige dunkle Scheibe. Lackierung umschalten (werk, gletscher, dunkel): nirgends ein heller Punkt.
   - **SEITE LINKS** und **FRONT**: Die Helme sind klein und grau/dunkel. Sieht man noch, dass da jemand sitzt? Stört es?
   - Bei **480x270**: an der Seite steht **AUDAN**, vorne im Sonnenstreifen **AUDAN**, hinten das Kennzeichen **AQ 4**.
2. **Menü → AUTO**: Der Name ist **AUDAN QUARTO** (auch auf Englisch). Deine alten Bestzeiten stehen noch unter BESTZEITEN.
3. **Fahren** (`index.html`), am besten **A/B-Vergleich**: abwechselnd normal und mit `index.html?auto=prototyp` (altes
   Fahrverhalten) dieselben Stellen fahren:
   - **Kehren und Nebenwege**: Talschleife (Schotter, ab 800 m), Almweg (ab 1986 m), Wiesenweg (ab 2798 m). Der Audan sollte
     in den Schotter- und Wiesenkurven **mehr Tempo halten** und **kräftiger herausziehen**.
   - **In die Kurve bremsen** (z. B. vor Kehre 1 oder in der langen Linkskurve ab 504 m): Das Heck sollte **deutlich, aber
     kurz** kommen und sich in ca. einer halben Sekunde wieder fangen. **Vorsicht um 695 m**: Wer dort mit ca. 130 km/h hart
     bremst, kann jetzt quer kommen.
   - **Handbremse** in den Kehren: wie gewohnt.
   - Nach der Talschleife (bei 1028 m, Ansage „RECHTS 6“): Mit dem Audan kommst du schneller aus dem Schotter, evtl. kurz lupfen.
4. **Ton-Labor** (`ton-labor.html`): **TON STARTEN**, dann im Bereich **Motor und Fahrt**:
   - Drehzahl ca. 5000, Gas 100 %, **LADEDRUCK (Test)** auf 100 %: einmal mit **ECHTER LADEDRUCK AN** und einmal ohne – mit
     dem Schalter ist das Pfeifen etwas lauter und folgt genau dem Regler (Regler langsam schieben: Tonhöhe steigt).
   - **Pop-Salve** mehrmals drücken (mit Schalter an und Ladedruck über 50 % kommen öfter Pops).
   - Schalter an, **Anfahren bis 160 km/h**: Pfeifen baut sich nach dem Gasgeben auf und reisst beim Schalten nicht ab.
   - Dann **im Spiel**: Vollgas, Gas wegnehmen (Zischen, Pops), Schalten – achte auf das Turbo-Pfeifen und die Pops.
     Vergleich: `index.html?auto=prototyp` klingt wie vorher.
5. **Fahr-Labor** (`index.html?fahrlabor=1`): 14 Regler, neu **`auto.vorneJeBelag.schotter`** und **`getriebe.allrad.wiesenweg`**.
   **WERTE KOPIEREN** und mir schicken.

**Wenn X, dann Y** (Wert in `js/config.js`, oder im Fahr-Labor / Ton-Labor ausprobieren und mir die Zeilen schicken):

| Wenn … | dann … |
|---|---|
| das Heck beim Bremsen zu stark oder zu nervös kommt | `fahrprofile.rt4.auto.gewichtstransfer` runter (z. B. 0.4; M8a: 0.35) |
| das Heck beim Bremsen immer noch zu wenig kommt | `gewichtstransfer` höher (0.46 bis 0.5) – Achtung, ab 0.46 rutscht der flotte Testfahrer bei 695 m weg |
| Schotter zu viel Grip vorne hat (fährt wie auf Schienen) | `fahrprofile.rt4.auto.vorneJeBelag.schotter` runter (z. B. 1.03; 1 = wie M8a) |
| Schotter immer noch zu wenig anders ist | `vorneJeBelag.schotter` höher (z. B. 1.08 bis 1.1) und `heckJeBelag.schotter` 1.2 |
| der Wiesenweg zu leicht ist | `fahrprofile.rt4.auto.vorneJeBelag.wiesenweg` und `heckJeBelag.wiesenweg` runter (z. B. 1.03 / 1.15) |
| er auf dem Wiesenweg zu wenig zieht | `fahrprofile.rt4.getriebe.allrad.wiesenweg` höher (z. B. 1.2) |
| er aus Schotter-Kehren zu wenig zieht | `getriebe.allrad.schotter` hilft nur bis 1.21; darüber nichts mehr (siehe Kompromisse) |
| der Handbremsen-Drift auf Schotter zu kurz ist | `fahrprofile.rt4.auto.heckJeBelag.schotter` runter (z. B. 1.1) |
| das Turbo-Pfeifen zu laut ist | `audio.motor.turboPegelMal` runter (z. B. 1.0 = wie vorher) |
| das Turbo-Pfeifen zu leise ist | `turboPegelMal` höher (z. B. 1.8) |
| zu viele Pops kommen | `audio.motor.turboKnallPlus` runter (z. B. 0.05; 0 = wie der Prototyp) |
| zu wenig Pops kommen | `turboKnallPlus` höher (z. B. 0.25) |
| das Pfeifen zu hoch / zu tief klingt | `audio.motor.turboTonMax` (z. B. 4500 statt 5200) |
| die Helme von der Seite zu dunkel / gar nicht zu sehen sind | `autoOptik.farben.helmFahrer` heller (z. B. `#6e7e8e`) |
| dir der alte Name lieber war | sag es – die Id bleibt `rt4`, nur der Anzeigename ändert sich |

**Für Änderungen schreib einfach, was dir nicht gefällt (mit Screenshot oder den kopierten Werten), das wird dann M8b.1.**

### So testest du (Werkzeuge)

- `node tools/m8b-test.mjs` (neu: Prüfungen (a) bis (h), mit (h) ca. 1 Stunde; einzeln z. B. `--nur a,b`)
- `node tools/m8b-messung.mjs [--alt <ordner 0.8a>]` (neu: Fahr-Messtabelle M8a / M8b / Ziel, Bild `80-messtabelle.png`)
- `node tools/m8b-ton.mjs` (neu: Turbo-Ton-Messungen)
- `node tools/m8b-bilder.mjs [--alt <ordner 0.8a>]` (neu: alle Bilder unten)
- wie bisher: `node tools/auto-test.mjs`, `node tools/testfahrer.mjs --auto rt4`, `node tools/pacenotes-test.mjs --auto rt4`,
  `node tools/abkuerzungen.mjs --pruefen [--auto rt4]`, `node tools/ton-messung.mjs <name> [ordner]`

### Bilder (`screenshots/m8b/`)

| Datei | Was |
|---|---|
| `01-vorher-heck/-dreiviertel/-seite/-front` | **0.8a**: Auto an der Startlinie (Heck = Spielkamera), je 1280x720 und `…-320x180` (Originalgrösse) |
| `02-nachher-heck/-dreiviertel/-seite/-front` | **0.8b**: dasselbe |
| `10-vorher-ansichten-<grösse>` | Auto-Labor 0.8a: Heck, Seite, Front, Drei-Viertel hinten, Drei-Viertel vorne, oben |
| `11-nachher-ansichten-<grösse>` | dasselbe 0.8b |
| `11-nachher-heck-lackierungen-<grösse>` | werk, gletscher, dunkel von hinten (oben wie im Spiel, unten nah) |
| `11-nachher-helme-nah-<grösse>` | Helme nah: Seite und Front, alle drei Lackierungen |
| `50-auto-labor-seite` | die Seite `auto-labor.html` mit dem neuen Titel |
| `60-menue-auto-de/en-320x180/-1280x720` | Menüseite AUTO mit AUDAN QUARTO |
| `70-fahrlabor` | Fahr-Labor mit den neuen Reglern |
| `71-ton-labor` | Ton-Labor mit ECHTER LADEDRUCK AN und LADEDRUCK (Test) |
| `80-messtabelle.png`, `80-messtabelle.md` | die Fahr-Messtabelle |

`<grösse>` = 320x180, 480x270, 640x360 (Originalgrösse, nicht vergrössert).

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/autos.js` | Helme hinten weg, Seite/Front kleiner (mit Schulter-Grösse), Glanzstreifen Heckscheibe, Name, AUDAN, AQ 4 |
| `js/car.js` | Schulter-Grösse aus den Daten; `zuAtlas` (für Tests) |
| `js/config.js` | Helmfarben, `auto.name`, neu `auto.vorneJeBelag` (neutral), Profil `rt4` (C), Turbo-Ton-Werte (D), Version 0.8b |
| `js/physics.js` | Grip vorne je Belag (`vorneJeBelag`, im Prototyp ohne Wirkung) |
| `js/audio.js` | Pfeifen, Blow-off und Pops folgen mit Turbo dem echten Ladedruck; ohne Turbo wie bisher |
| `js/main.js` | gibt `ladedruck` und `turboAn` an den Ton |
| `js/texte.js`, `js/startzielbild.js`, `js/fahrprofil.js`, `js/fahrlabor.js`, `js/autolabor.js`, `auto-labor.html` | Name Audan Quarto (Fahr-Labor: 14 Regler) |
| `js/tonlabor.js`, `ton-labor.html` | ECHTER LADEDRUCK AN, LADEDRUCK (Test), Feinschliff `turboPegelMal`, `turboKnallPlus` |
| `CLAUDE.md`, `KONZEPT.md`, `STAND.md` | Namensregel, M8b, als Nächstes M8c |
| `tools/m8b-test.mjs`, `tools/m8b-messung.mjs`, `tools/m8b-ton.mjs`, `tools/m8b-bilder.mjs` | **neu** (siehe oben) |
| `tools/m8b-messung.json`, `tools/m8b-ton.json`, `tools/ton-messung-08a.json` | **neu**: Messwerte (0.8a als Vergleich) |
| `tools/fahrmessung.js` | zusätzlich 0–60 km/h auf Schotter (Info) |
| `tools/auto-test.mjs` | (g) Anzeigename `auto.name` beim 0.7b-Vergleich ausgenommen; `vorneJeBelag` als neuer neutraler Wert; (h) mit den Zielen von M8b; (m) 14 Regler |

### Selbst getestet

- **`node tools/m8b-test.mjs`** (neu, (a) bis (h)):
  - (a) Helme: keine Helme in der Ansicht „hinten“, Radius Seite/Front 0.085 / 0.08, Helligkeitsunterschied zur Scheibe
    −68 % (Fahrer) und −67 % (Beifahrer) gegen M8a; im gemalten Atlas **0 Pixel** mit Helm-, Visier- oder Schulterfarbe in der
    Heckscheibe, Helme an Seite und Front vorhanden – für **werk, gletscher, dunkel**. ✅
  - (b) Name: **0 Treffer** für RINGWERK/Ringwerk in `js/` und `*.html`; `auto.name`, Menü (de/en), Auto-Labor, Fahr-Labor,
    Kennzeichen **AQ 4**, alle Zeichen in der Pixelschrift; Menütafel bei 320x180 227 Pixel breit (passt); Id `rt4`, eine alte
    Bestzeit im Format von M8a steht nach dem Laden noch da. ✅
  - (c) **prototyp bit-genau**: Werte wie 0.7b, 70-s-Fahrt-Prüfsumme **3d98a02d**, Testfahrer **2:59.33 / 2:42.35 / 2:31.92** mit
    Zwischenzeiten, Höchsttempo 148.6 / 153.8 / 157.5 km/h, 0 Aufpralle, 0 Resets; Abkürzungen **127 / 2 / 342 / 84** (auch mit
    rt4), gesperrt durchkommen 0; **Ton** wie 0.8a (siehe Messungen Turbo-Ton, Rundung in der 4. Stelle). ✅
  - (d) Fahrmessung nach Teil C: 16 ok, **4 Kompromisse** (0–100 Schotter, Testfahrer ×3, siehe oben); `vorneJeBelag` im
    Prototyp 1; Vorteile nur auf Schotter und Wiesenweg; Gras/Bankett kein neuer Vorteil gegen M8a. ✅
  - (e) Pace-Notes mit rt4 (nur gemeldet): 24 von 25 im Zielbereich, drei andere Stufen (siehe oben); Abkürzungen mit rt4
    127 / 2 / 342 / 84; `js/pacenotes-tempo.js` und `tools/schneiden-zeiten.json` nicht neu geschrieben. ✅ (gemeldet)
  - (f) Turbo-Ton: alle Ziele aus Teil D.7 erfüllt (Tabelle oben), `turboAn` im Prototyp falsch, Konsole ohne Fehler,
    Speicher pro Bild gleich. ✅
  - (g) Fahr-Labor: 14 Regler, die neuen wirken sofort, WERTE KOPIEREN, ALLES ZURÜCK, ohne `?fahrlabor=1` kein Panel;
    Ton-Labor: ECHTER LADEDRUCK AN und LADEDRUCK (Test) wirken, Feinschliff `turboPegelMal`/`turboKnallPlus` live, ALLES ZURÜCK. ✅
  - (h) Stabilität (Profil prototyp): `getriebe-test`, `lenk-test`, `handbremse-test`, `belag-test`, `rueckwaerts-test`,
    `aufprall-test`, `pacenotes-test`, `menue-test`, `rennablauf-test`, `ton-umgebung-test` **bestanden**; `auto-test` (a)–(n)
    mit rt4 bestanden (97 ok, 5 Kompromisse). **Draw Calls des Autos 9** (höchstens 12), 1306 Dreiecke.
  - **`ton-test` ehrlich**: Im langen Lauf zweimal an einem Zeit-Prüfpunkt gescheitert („Puffer in Häppchen: längstes 16.7 ms
    statt unter 15 ms“), einzeln danach viermal gefahren: 0.8b **1× bestanden**, 2× nur „?ton=aus … Tempo 0.4 statt über
    0.5 m/s nach 0.8 s“, 1× Häppchen-Zeit. **0.8a (vor M8b) im selben Test-Browser: 2 von 2 Läufen gescheitert**, an denselben
    Zeit-Punkten. Diese Punkte hängen an der Bildzeit des Test-Browsers (ca. 0.3 s pro Bild), nicht am Spiel; alle
    Ton-Inhalte (Pegel, Klänge, Signale) bestehen.
- **Was ich an alten Tests ändern musste**: nur `tools/auto-test.mjs`: (g) vergleicht den Anzeigenamen `auto.name` nicht mehr
  mit 0.7b (der Name ist keine Physik), `vorneJeBelag` ist als neuer neutraler Wert eingetragen, (h) prüft die Ziele von M8b
  statt M8a, (m) erwartet 14 statt 12 Regler. Alle anderen Tests unverändert.
- **Leistung**: Renderzeit eines Bildes im Test-Browser (Software-Grafik) **353.5 → 353.1 ms**, 110 Zeichenaufrufe in der
  Szene (gleich); Physik + Auto **0.10 ms** je Bild (gleich). Ladezeit bis die Welt steht (Median aus 9, abwechselnd)
  **1507 → 1532 ms** (Streuung ±200 ms). Der Bildabstand (requestAnimationFrame) schwankt im Test-Browser in Stufen von
  16.7 ms (0.8a 283–317 ms, 0.8b 300–333 ms in drei Läufen) – die Renderzeit selbst ist gleich.
- **Bilder** in 320x180, 480x270, 640x360 angeschaut (Heck, Seite, Front, Drei-Viertel, alle Lackierungen, Menü, Labore).
- **Nicht gemacht: das Fahrgefühl gespürt und den Ton gehört.**

### Ehrlich beurteilt – wo ich am unsichersten bin

- **Köpfe hinten**: wirklich weg. Die Heckscheibe ist bei 320x180 eine ruhige dunkle Fläche (der Glanzstreifen ist dort
  kaum zu sehen, erst nah). Auf allen drei Lackierungen kein heller Punkt (auch vom Test geprüft: 0 Pixel mit Helmfarbe).
- **Seite und Front**: Von der Seite ist der Helm bei 320x180 ein **kleiner grauer Fleck mit dunklem Visier** – man ahnt einen
  Kopf, mehr nicht. Von vorne sind es **zwei dunkle Flecken** in der Scheibe. Nichts leuchtet. Wenn dir das zu wenig „Fahrer“
  ist: `helmFahrer` etwas heller.
- **Fahrgefühl nicht gespürt.** Am unsichersten bin ich beim **Heck beim Bremsen**: 0.45 liegt knapp unter der Kante, an der
  der flotte Testfahrer bei 695 m quer kommt. Es kann sich für dich **nervös** anfühlen – oder genau richtig. Zweitens:
  **Wiesenweg** könnte jetzt **zu leicht** wirken (Kreis +12.5 %, Anfahren −12.8 %). Drittens: Auf **Schotter** ist der
  Unterschied beim Beschleunigen über 50 km/h klein (Motor-Grenze), spürbar sollte er vor allem in den Kurven sein.
- **Zuerst ausprobieren**: Talschleife und Wiesenweg im A/B-Vergleich mit `?auto=prototyp`, dann bewusst **in eine Kurve
  hineinbremsen** (Heck).
- **Ton nicht gehört, nur gemessen.** Das Pfeifen ist mit +2.6 dB nur leicht präsenter, 16 dB unter dem Motor. Ob man es im
  Spiel hört, hängt stark von den Lautsprechern ab (5 kHz ist hoch). Die Pops kommen mit Turbo öfter (22 statt 16 von 24
  Mal) – das kann schnell zu viel werden.

### Bekannte Probleme

- **Zwei Ziele aus Teil C verfehlt** (0–100 km/h Schotter, Testfahrer-Gewinn) – siehe Kompromisse. Kreis Schotter und Heck
  knapp an der unteren Grenze.
- **Pace-Notes**: Für den Audan wären drei Kurven eine andere Stufe (eine davon, 1028 m, wegen der Messkette). Die Pace-Notes
  bleiben auf der Referenz.
- **Flotter Testfahrer bei 695 m**: Ab `gewichtstransfer` 0.46 kommt er beim harten Bremsen quer. Mit 0.45 nicht.
- **Ton-Messung**: Der Offline-Renderer im Test-Browser rechnet nicht ganz bit-genau gleich (Abweichung in der 4. Stelle, auch
  0.8a gegen sich selbst); der Vergleich mit 0.8a lässt darum 0.1 % zu.
- Die **Unfallautos** an der Strecke sind weiterhin die alten Klötzchen-Autos (siehe Ideen).
- **`ton-test`** scheitert im Test-Browser oft an Zeit-Prüfpunkten (siehe „Selbst getestet“) – mit 0.8a genauso.
- Weiter wie in M8a: `ton-umgebung-test` („Pause: leise Variante“) kann im Test-Browser fehlschlagen (Bildzeit), im
  2. Versuch besteht er; Schrift am Auto erst ab 480x270.

### Ideen/Vorschläge (nicht umgesetzt)

- **Flamme aus dem Auspuff beim Poppen** (kleiner Pixel-Blitz am Auspuff links, passend zu den Pops, mit Turbo öfter).
- **Dellen und Schaden** nach harten Aufprallen (schiefer Spoiler, zerbrochenes Licht, Kratzer in der Textur).
- **3D-Vorschau auf der Seite AUTO mit der Garage (M8c)**: drehendes Modell, Lackierung wählen.
- **Unfallautos mit dem neuen Modell** (heute noch die alten Klötzchen-Autos).
- **Namen für die vier weiteren Autos (M8c)**, nach der Namensregel (gleiche Anfangsbuchstaben wie das Vorbild). Sie
  **ersetzen die alten Vorschläge aus M8a** (Valmora Spada, Valmora Brenta, Hoshiro Raiden, Marlowe Harrier – gelten nicht mehr):
  - **Lanza 073** – Lancia-037-Typ (Mittelmotor, Hinterrad). Bei einer Zahl lassen sich keine Buchstaben anpassen, darum die
    Ziffern gedreht; beginnt wie das Vorbild mit 0.
  - **Lanza Delto** – Lancia-Delta-Typ (kantiger Kompakt-Allrad).
  - **Subora Imprexa** – Subaru-Impreza-Typ (Limousine, Allrad).
  - **Fard Escorta** – Ford-Escort-Typ (Hinterrad).
  Nur eingetragen, nichts gebaut. Jedes Auto bekommt später zwei Texte (Name, Daten) in `js/texte.js` wie `auto.rt4.*`.
- Ein Regler im Fahr-Labor für die **Heck-Grip-Werte je Belag** (heute nur über `config.js`), falls du am Wiesenweg drehen willst.
- Der Testfahrer könnte das Kurventempo aus dem Grip des Autos planen (dann zeigt er den Vorteil eines Autos ehrlicher).

---

## Meilenstein 8a: Ringwerk RT4 – 3D-Modell, Federung, Details und eigenes Fahrgefühl ✅ (Verlauf, Stand damals – Name, Helme, Fahrwerte und Turbo-Ton seit M8b anders)

> **Ehrlich vorneweg: Ich habe das Fahrgefühl nicht gespürt** und das Auto nur auf Bildern gesehen. Alles ist **gemessen**
> (Fahrphysik mit festen Fahrprogrammen, Testfahrer, Bilder in drei Pixelgrössen) und von Tests geprüft. Ob sich der RT4
> wie ein Traktions-Monster anfühlt, ob das Untersteuern zu stark ist und ob der Turbo spürbar ist, kannst nur du
> entscheiden. Darum zuerst die **Test-Anleitung** unten. **Für Änderungen am Aussehen oder Fahrgefühl schreib einfach,
> was dir nicht gefällt, das wird dann M8a.1.**

Zwei Teile, zwei Commits im selben Pull Request: **A = Optik** (das neue Auto), **B = Fahrgefühl** (Fahrprofile). So kannst du
notfalls einen Teil getrennt beurteilen oder zurückdrehen.

### Was ist neu? – Teil A: Optik

**1. Das Modell** (`js/autos.js` = Daten, `js/car.js` = Baukasten). Ein eigenes 80er-Gruppe-B-Allrad-Coupé, kein Nachbau:
keilförmige Motorhaube, steile Frontscheibe, kantiges Dach mit **Dachlufthutze**, **Kastenkotflügel** vorne und hinten
(die Räder stehen sichtbar in Radläufen, die hinteren gehen bis ans Heck), **Seitenschweller**, **Frontschürze mit
Splitter**, **grosser Heckflügel auf zwei Stützen** mit Endplatten, Heckschürze mit **Auspuff links**, **Schlammlappen**
hinter allen Rädern, **Aussenspiegel**, **Abschlepp-Öse** (rot), vorne **zwei Scheinwerfer und vier runde
Zusatzscheinwerfer**, hinten ein **Rücklicht-Band** über die ganze Breite.
- Masse: **Länge 4.475 m** (höchstens 4.48), **Breite 1.86 m** mit Kotflügeln, **Höhe 1.395 m**, Radstand 2.52 m,
  Spur 1.6 m, Radradius 0.33 m, Radmitten bei x ±0.8 / z ±1.26 (wie bisher: Kollision, Felswand, Staub und Physik
  bleiben gleich).
- **Seite**: dunkle Scheiben mit Rahmen (grosse Türscheibe, kleines Fenster dahinter = Coupé), Türfuge und Türgriff,
  Radlauf-Kanten, breiter Seitenstreifen mit der **Startnummer 4** auf der Tür, darunter dunkles Unterteil mit
  **RINGWERK** (ab 480x270). Im Fenster ein **Helm** (Fahrer links weiss, Beifahrer rechts gelb, Visier nach vorne).
- **Front**: Sonnenstreifen „RINGWERK“ an der Frontscheibe, zwei Helme, Startnummer und „MURMELI“ auf der Haube,
  Kühlergrill, Lufteinlässe in der Schürze.
- **Heck**: Heckscheibe mit zwei Hinterköpfen, Sponsorfeld auf dem Heckdeckel („SENNEREI HÖCHI“), „TALWERK“ über dem
  Rücklicht-Band, Kennzeichen **RR 4**, Startnummer auf dem Dach (von hinten lesbar).
- Alle Sponsoren sind erfunden. **Schrift erscheint erst ab 480x270** (Seite, Heck, Haube, Sonnenstreifen; der
  Heckdeckel-Text ab 640x360): bei 320x180 wäre sie nur Pixelrauschen, dort sieht man ruhige Farbflächen. Die
  Startnummer und das Kennzeichen sind immer da.

**2. Lackierung als Pixel-Textur** (512x128 Pixel, im Code gemalt, scharf ohne Verwischen): **werk** (Weiss, roter
Streifen, dunkelgraues Unterteil, weisser Flügel mit roten Endplatten – Standard), **gletscher** (Weiss mit dunkel- und
hellblauem Streifen, gelbe Akzente, blauer Flügel), **dunkel** (Anthrazit mit orangem Streifen und orangem Flügel).
Umschalten: `autoOptik.lackierung` in `js/config.js` oder im Auto-Labor (eine Auswahl im Menü kommt mit der Garage, M8c).

**3. Räder**: Reifen mit Profil und heller Flanke, Felge mit **5 Speichen und Mittelmutter**, man sieht sie drehen
(rückwärts andersherum). Ab **79 km/h** (`autoOptik.radUnschaerfeAb` 22 m/s) wird die Felge über 6 m/s weich zur
gleichmässigen Scheibe (sonst sähe ein Speichenrad bei 60 Bildern pro Sekunde rückwärts drehend aus). Die Vorderräder
schlagen sichtbar ein (bis 35°); sie bleiben in den Radläufen.

**4. Federung mit Nachschwingen** (`js/federung.js`): Nicken (Bremsen = Nase taucht, Gas = Heck setzt sich), Rollen
(in der Kurve nach aussen), Einfedern über Kuppen und Senken (aus der Krümmung des Bodens) und ein **Stoss beim
Aufprall** – wie eine gedämpfte Feder (2.2 Hz, Dämpfung 0.55: ein kleiner Überschwinger, nach ca. 0.5 s ruhig).
Drehpunkt auf Schwerpunkthöhe. Ein **Anschlag** verhindert, dass ein Reifen bei starkem Nicken und Einfedern durch den
Kotflügel sticht. Nur Optik: Physik, Kamera und die Zählung der Aufpralle merken nichts.

**5. Lichter**: Rücklichter dunkelrot, beim **Bremsen und mit der Handbremse hellrot**; das **Rückfahrlicht** (weiss)
nur im Rückwärtsgang. Scheinwerfer hell, aber ohne Lichtschein (wie gewünscht).

**6. Dreck**: Auf **Schotter, Wiesenweg, Gras und Bankett** wird das Auto unten schmutzig (Karosserie, Radläufe,
Schlammlappen, Reifen; Farbe je Belag), höchstens bis 0.85 Deckung. **Asphalt wäscht nichts ab.** Sauber bei jedem Start
und Neustart (die Demo-Fahrt im Menü nimmt nichts mit). Der Staub kommt weiter aus `js/staub.js` (unverändert) und steigt
hinter den Hinterrädern auf.

**7. Auto-Labor** (`auto-labor.html`): das Auto in Ruhe ansehen, ohne zu fahren – siehe Test-Anleitung.

### Was ist neu? – Teil B: Fahrgefühl

**1. Fahrprofile** (`js/fahrprofil.js`, Werte in `js/config.js`, Block `fahrprofile`). Das Fahrverhalten bis 0.7b bleibt
als **Profil „prototyp“** erhalten und ist die **Referenz**: Daran hängen die Pace-Notes-Stufen, die Abkürzungs-Sperren
und die Testfahrer-Zeiten. Der RT4 ist ein **eigenes Profil**, das nur einzelne Werte überschreibt. Warum so? Die
Pace-Notes sagen die Kurve an, nicht das Auto – sonst bräuchte jedes Auto eigene Tabellen (später fünf).
- Auswahl: **`index.html?auto=prototyp`** (alt) oder **`?auto=rt4`**; ohne Angabe (und bei unbekanntem Wert) gilt **rt4**.
- Mit `prototyp` ist alles **bit-genau wie in 0.7b** (geprüft: Testfahrer-Zeiten, Zwischenzeiten, Statistik, eine feste
  70-s-Fahrt über alle Beläge mit Prüfsumme).
- Alle bisherigen Werkzeuge fahren standardmässig `prototyp`, umschaltbar mit `--auto rt4`.

**2. Neue Physikterme** (im Prototyp neutral, also wirkungslos):
- **Gewichtsverlagerung** (`auto.gewichtstransfer`): Bremsen = mehr Last vorne, weniger hinten (das Heck kommt, wenn man
  in der Kurve bremst – Rally-Technik); Gas = mehr Last hinten (Heck stabil, Front schiebt etwas). Weich geglättet
  (0.1 s), je Achse höchstens 0.6 bis 1.4 der normalen Last.
- **Gewichtsverteilung** (`auto.lastVorneAnteil`): mehr Last = mehr Haftung auf dieser Achse.
- **Allrad-Traktion** (`getriebe.allrad`, je Belag) und **Heck-Grip je Belag** (`auto.heckJeBelag`).
- **Turbo** (`getriebe.turbo`): Ladedruck baut sich nach dem Gasgeben in 0.35 s auf (darunter 12 % weniger Schub,
  voll 4 % mehr), fällt beim Gaswegnehmen in 0.25 s; **Anti-Lag**: in der Schaltpause und beim Gaswegnehmen über
  4000 U/min bleibt er bei mindestens 0.7. Lesbar als `getriebe.ladedruck`. **Der Motorton liest ihn noch nicht**
  (Motorton unverändert).

**3. Der RT4** („Traktions-Monster“):

| Wert | Prototyp | RT4 | Was es bewirkt |
|---|---|---|---|
| `auto.lastVorneAnteil` | 0.5 | **0.555** | frontlastig: vorne mehr Haftung |
| `auto.schwerpunktVorne` | 0.48 | **0.46** | schiebt in schnellen Kurven eher über die Vorderräder |
| `auto.traegheit` | 2.3 | **2.5** | schwerer, ruhiger Wagen |
| `auto.gewichtstransfer` | 0 | **0.35** | Heck kommt beim Bremsen in der Kurve |
| `auto.gasImDrift` | 0.12 | **0.07** | Gas lockert das Heck weniger (Allrad zieht) |
| `auto.heckJeBelag` | 1 | **Schotter 1.1, Wiesenweg 1.15** | Heck hält auf losem Boden besser |
| `getriebe.allrad` | 1 | **Schotter 1.15, Wiesenweg 1.1** (Gras, Bankett, Asphalt 1) | kräftig raus aus Kehren und von den Nebenwegen |
| `getriebe.turbo.an` | aus | **an** | dezenter Turbo (0.35 s Aufbau) |
| `getriebe.zugkraftFaktor` | 1 | **0.99** | siehe Kompromisse |

**4. Fahr-Labor** (`index.html?fahrlabor=1`): Seitenpanel mit 12 Reglern – siehe Test-Anleitung.

**5. Menüseite AUTO**: „ALLRAD · TURBO · 5 GÄNGE AUTOMATIK“ und „SCHWERES RALLYAUTO, VIEL TRAKTION“ (englisch: „AWD ·
TURBO · 5-SPEED AUTOMATIC“, „HEAVY RALLY CAR, LOTS OF TRACTION“).

**6. Bestzeiten**: Format und Speicher unverändert, der RT4 behält die Id `rt4`, alte Bestzeiten bleiben stehen. Läufe mit
`?auto=prototyp` werden mit der Id `prototyp` eingetragen (damit Vergleichsfahrten nicht als RT4 zählen).
**Zeitunterschied für deine Bestzeiten:** Der Testfahrer ist mit dem RT4 **0.3 bis 0.45 % schneller** als mit dem
alten Fahrverhalten: **2:58.73 / 2:41.83 / 2:31.24** statt 2:59.33 / 2:42.35 / 2:31.92 (vorsichtig / mittel / flott), also
etwa **0.5 bis 0.7 Sekunden** auf der ganzen Etappe. Deine alten Bestzeiten bleiben fair: Ein neuer Rekord wird mit dem
RT4 nur ein wenig leichter – am meisten holst du auf Schotter und dem Wiesenweg, wenn du früh aufs Gas gehst.

### Messtabellen

Alle Zahlen: `node tools/auto-messung.mjs` (Ergebnis in `tools/auto-messung.json`, Bild davon in
`screenshots/m8a/40-messtabelle.png`). Physik ohne Browser mit festen Fahrprogrammen, 120 Schritte pro Sekunde.

**Optik und Leistung (vorher = 0.7b, nachher = 0.8a):**

| Messung | vorher | nachher | Ziel |
|---|---|---|---|
| Zeichenaufrufe des Autos | 23 | **9** | höchstens 12 ✅ |
| Dreiecke des Autos | 412 | **1306** | höchstens 1800 ✅ |
| Zeichenaufrufe der ganzen Szene bei 60 / 1170 / 2900 m | 122 / 113 / 81 | **108 / 99 / 67** | – (weniger, weil das Auto aus weniger Teilen besteht) |
| Bildzeit (Test-Browser, Rennen) | 316.6 ms | 316.7 ms | gleich ✅ (`renderer.render` je 1.7 ms) |
| Ladezeit bis die Welt steht (Median aus 9) | 1336 ms | 1307 ms | höchstens +30 ms ✅ |
| Speichermüll pro Bild (Auto, Federung, Räder, Lichter, Dreck) | – | 0.06 Byte | keiner ✅ (ein neues Objekt wären 16 Byte) |
| Auto bauen (`baueAuto`, mit Lackierung malen) | 0.5 ms | 4.6 ms | einmal beim Laden |

**Fahrgefühl: RT4 gegen prototyp (Tabelle B3):**

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

**Kompromisse (ehrlich):**
- **Bankett 0–100 km/h 2 % schneller statt gleich oder langsamer.** Auf dem Bankett gibt es keinen Allrad-Vorteil (Faktor
  1), der Unterschied kommt vom Turbo, der in den höheren Gängen 4 % mehr Schub gibt – genauso wie auf Asphalt (dort
  −2.1 %, im Ziel ±3 %). Ganz weg ginge es nur mit weniger Schub auf Asphalt oder einem Bankett-Faktor unter 1 (Allrad
  schlechter als Hinterrad – unlogisch). Das Bankett ist ohnehin nur ein schmaler Streifen am Rand.
- **Kreis R 25 m auf Schotter +2.6 % statt +4 bis +10 %.** Auf Schotter rutscht im Kreis bei beiden Profilen zuerst die
  **Vorderachse**; der bessere Heck-Grip auf Schotter (`heckJeBelag` 1.1) hilft dort nicht. Mehr Grip vorne (mehr Last
  vorne) würde Schotter anheben, aber Asphalt gleich stark mit (über die erlaubten +3 %). Auf dem Wiesenweg ist der Kreis
  +8.5 % schneller.
- **`lastVorneAnteil` 0.555 statt ca. 0.54, `schwerpunktVorne` 0.46 statt ca. 0.45:** Mit `schwerpunktVorne` 0.45 lag
  der Lenkbedarf bei 80 km/h bei +20.7 % (knapp über dem Ziel, zu stumpf), mit 0.46 sind es +15.8 %. Mit
  `lastVorneAnteil` 0.555 statt 0.54 kommt der Kreis auf Schotter näher ans Ziel (+2.6 % statt +1.8 %), Asphalt bleibt
  mit +2.6 % im Rahmen.
- **`zugkraftFaktor` 0.99** (die eine erlaubte Zusatz-Schraube, −1 %): Ohne lag 0–100 auf Asphalt bei −3.1 % (Turbo +4 %
  in den höheren Gängen), also knapp ausserhalb von ±3 %. Mit 0.99 sind es −2.1 %.

**Testfahrer (ganze Etappe, Zeiten je Abschnitt):**

| Profil | prototyp | RT4 | Unterschied | Almweg | Wiesenweg | Talschleife | Asphalt (Summe) | Aufpralle / Hänger RT4 |
|---|---|---|---|---|---|---|---|---|
| vorsichtig | 2:59.33 | 2:58.73 | -0.3 % | 20.47 → 20.45 s (-0.1 %) | 17.43 → 17.27 s (-1.0 %) | 18.50 → 18.42 s (-0.5 %) | 122.91 → 122.59 s (-0.3 %) | 0 / 0 |
| mittel | 2:42.35 | 2:41.83 | -0.3 % | 18.71 → 18.66 s (-0.3 %) | 15.58 → 15.43 s (-1.0 %) | 16.03 → 16.02 s (-0.1 %) | 112.03 → 111.71 s (-0.3 %) | 0 / 0 |
| flott | 2:31.92 | 2:31.24 | -0.4 % | 17.10 → 17.02 s (-0.4 %) | 14.50 → 14.38 s (-0.8 %) | 14.53 → 14.51 s (-0.2 %) | 105.79 → 105.33 s (-0.4 %) | 0 / 0 |

- **Ganze Etappe: 0.3 bis 0.45 % schneller** (Ziel 0 bis 4 %) ✅, ohne Aufprall und ohne Hängenbleiben.
- **Asphalt-Abschnitte zusammen −0.3 bis −0.4 %** (Ziel ±2 %) ✅.
- **Almweg und Wiesenweg nur 0.1 bis 1 % schneller statt 3 bis 8 %** ❌ Kompromiss: Der Testfahrer plant das Kurventempo aus
  der Krümmung, dem Grip des Belags und einer festen Querbeschleunigung je Fahrer (vorsichtig/mittel/flott) – für beide
  Autos gleich – und nutzt den besseren Grip des RT4 in der Kurve also nicht. Der RT4 gewinnt bei ihm nur beim
  Herausbeschleunigen in den unteren Gängen. Ein Mensch, der auf Schotter früher aufs Gas geht, sollte mehr gewinnen
  (Anfahren auf Schotter −5 %, Wiesenweg −10 %).

**Pace-Notes mit dem RT4** (`node tools/pacenotes-test.mjs --auto rt4`, nur gemeldet): alle 25 Kurven im Zielbereich
(Asphalt −1.7 bis +3.5 %, Schotter und Wiesenweg +1.3 bis +4.3 %). Nur bei **einer** Kurve (1088–1226 m, Asphalt) wäre die
Stufe für den RT4 eins höher (4 → 5, Grenztempo 100.1 statt 99.0 km/h, genau an der Grenze 100). Die Pace-Notes bleiben
wie gewollt auf der Referenz.

**Abkürzungen**: mit prototyp und mit RT4 je **127 / 2 / 342 / 84** übrige Linien (wie 0.7b), gesperrt durchkommen: 0.

### Werte zum Drehen (`js/config.js`)

**Aussehen** (`autoOptik`, wirkt beim nächsten Laden; im Auto-Labor sofort):

| Wert | Standard | Was |
|---|---|---|
| `autoOptik.lackierung` | `'werk'` | `'werk'`, `'gletscher'` oder `'dunkel'` |
| `autoOptik.lackierungen.<name>.*` | – | Farben jeder Lackierung (Lack, Streifen, Unterteil, Flügel, Sponsoren, Startnummer) |
| `autoOptik.radEinschlagMax` | 35 | so weit (Grad) schlagen die Vorderräder sichtbar ein |
| `autoOptik.radUnschaerfeAb` / `radUnschaerfeBreite` | 22 / 6 | ab 22 m/s (79 km/h) verwischt die Felge, über 6 m/s weich |
| `autoOptik.feder.frequenz` / `daempfung` | 2.2 / 0.55 | Federung: höher = straffer / weniger Nachschwingen |
| `autoOptik.feder.nicken` / `rollen` / `hub` | 0.0045 / 0.009 / 0.012 | wie stark die Karosserie nickt, rollt, einfedert |
| `autoOptik.feder.nickenMax` / `rollenMax` / `hubMax` | 4° / 5° / 0.12 m | Grenzen |
| `autoOptik.feder.stossNicken` / `stossRollen` / `stossHub` | 0.05 / 0.04 / 0.02 | Wippen beim Aufprall |
| `autoOptik.dreck.max` | 0.85 | so schmutzig wird es höchstens |
| `autoOptik.dreck.belaege.<belag>.aufbau` | Wiesenweg 0.02, Schotter 0.012, Gras 0.03, Bankett 0.004 | Dreck pro gefahrenem Meter |
| `autoOptik.farben.ruecklichtAus` / `ruecklichtAn` / `rueckfahrAn` | – | Farben der Lichter |

**Fahrgefühl RT4** (`fahrprofile.rt4`, wirkt beim nächsten Laden; im Fahr-Labor sofort): Tabelle oben unter „Der RT4“.
Dazu für alle Autos mit Turbo `getriebe.turbo`: `ab` 3000 U/min, `aufbau` 0.35 s, `abbau` 0.25 s, `verlust` 0.12,
`mehr` 0.04, `antiLagAb` 4000 U/min, `antiLagMin` 0.7; und `auto.gewichtstransferGlaettung` 0.1 s.
**Die Werte in `auto` und `getriebe` selbst nicht ändern**: Sie sind die Referenz (Profil „prototyp“), an der Pace-Notes,
Sperren und Testfahrer-Zeiten hängen. Für den RT4 immer im Block `fahrprofile.rt4` ändern (fehlt ein Wert dort, einfach
dazuschreiben, z. B. `gripHinten: 1.05` unter `auto`).

### Test-Anleitung für Lino (M8a)

**Zuerst ansehen (5 Minuten), dann fahren (15 Minuten).** Am besten auf beiden Rechnern.

1. **Auto-Labor** öffnen: `…/alpine-rally/auto-labor.html` (gleiche Adresse wie das Spiel, nur `auto-labor.html` statt
   `index.html`). Hier fährt nichts, du schaust das Auto nur an.
   - Rechts die **Pixelgrösse** wählen (320x180 / 480x270 / 640x360) – so gross wie im Spiel. Hintergrund hell/dunkel.
   - **Maus**: ziehen = drehen, Rad = näher/weiter. Knöpfe für **6 Ansichten** (Heck wie im Spiel, Seite, Heck schräg,
     Front, Front schräg, oben) und **Drehscheibe**.
   - Regler: **Lenkung**, **Tempo** (Räder drehen, ab 79 km/h verwischt die Felge), **Nicken**, **Rollen**, **Hub**,
     **Dreck**; Knöpfe **STOSS** / **BREMSEN** / **GERADE** zeigen das Nachschwingen der Federung.
   - Schalter: **Bremslicht**, **Rückfahrlicht**, **Lackierung** (werk / gletscher / dunkel), **Staub**.
   - **BILD SPEICHERN** speichert genau das Bild als PNG – ideal, um mir zu zeigen, was nicht passt.
2. **Spiel normal starten** (`index.html`): Du fährst jetzt den RT4 mit eigenem Fahrgefühl.
   - **Anfahren auf Asphalt**: etwa gleich schnell wie vorher (0–100 km/h 5.0 s statt 5.1 s).
   - **Kehren mit Schotter-Ausgang** (Nebenweg bei 800 m) und **Wiesenweg**: Er sollte spürbar besser herausziehen.
   - **Schnelle Kurven**: Er schiebt eher über die Vorderräder (braucht mehr Lenkung), das Heck bleibt ruhig.
   - **In der Kurve bremsen**: Das Heck sollte leicht kommen und sich schnell wieder fangen.
   - **Handbremse**: Das Heck kommt weiterhin, der Drift ist etwas kürzer.
   - **Turbo**: Nach dem Gasgeben kommt der volle Schub nach etwa einer Drittelsekunde – das ist absichtlich dezent.
     Hörbar ist er noch nicht (Motorton unverändert).
3. **Vergleich mit dem alten Fahrgefühl**: `index.html?auto=prototyp` – die gleiche Etappe mit dem Fahrverhalten bis 0.7b
   (das Auto sieht trotzdem neu aus). Abwechselnd fahren und vergleichen.
4. **Fahr-Labor**: `index.html?fahrlabor=1` – rechts ein Panel mit 12 Reglern. Während du fährst, schiebst du Werte
   (z. B. `auto.gripHinten` = Haftung hinten oder `getriebe.allrad.schotter` = Allrad auf Schotter; jeder Regler
   hat eine kurze Erklärung und einen Knopf zum Zurücksetzen), oben **PROTOTYP / RT4** schaltet die Werte um.
   **WERTE KOPIEREN** kopiert die geänderten Werte als Text (z. B. `auto.gripVorne = 0.95`) – den kannst du mir einfach schicken. Nichts wird
   gespeichert; nach dem Neuladen ist alles wie vorher. **ALLES ZURÜCK** stellt das gewählte Profil wieder her.
   Mit der Maus auf einen Regler klicken nimmt den Fokus nicht weg: die Tasten fahren weiter das Auto.
5. **Fahrgefühl beim Fahren beachten** (beim Bremsen taucht die Nase, beim Gas setzt sich das Heck, in der Kurve lehnt das
   Auto nach aussen, über Kuppen federt es, beim Aufprall wippt es kurz), **Dreck** nach dem Wiesenweg, **Bremslicht**
   und **Rückfahrlicht** (rückwärts fahren).

**Wenn X, dann Y** (Wert in `js/config.js`, oder im Fahr-Labor ausprobieren und mir die Zeilen schicken):

| Wenn … | dann … |
|---|---|
| der RT4 in schnellen Kurven zu viel Lenkung braucht (schiebt über die Front) | `fahrprofile.rt4.auto.schwerpunktVorne` höher (z. B. 0.47; 0.48 = wie früher) |
| die Front im Grenzbereich zu früh rutscht | `auto.gripVorne` höher oder `fahrprofile.rt4.auto.lastVorneAnteil` höher (mehr Last vorne = mehr Haftung vorne) |
| das Heck beim Bremsen in der Kurve zu wild kommt | `fahrprofile.rt4.auto.gewichtstransfer` kleiner (z. B. 0.25) |
| das Heck beim Bremsen gar nicht kommt | `gewichtstransfer` grösser (z. B. 0.45) |
| er aus Schotter-Kehren zu wenig zieht | `fahrprofile.rt4.getriebe.allrad.schotter` grösser (z. B. 1.25) |
| er sich zu träge / zu schwer anfühlt | `fahrprofile.rt4.auto.traegheit` kleiner (2.3 = wie früher) |
| der Turbo zu wenig spürbar ist | `getriebe.turbo.verlust` grösser (z. B. 0.2) oder `aufbau` länger (z. B. 0.5) |
| der Turbo nervt | im Profil `rt4` bei `getriebe.turbo` `an: false` |
| der Drift mit Gas zu schnell abbricht | `fahrprofile.rt4.auto.gasImDrift` grösser (0.12 = wie früher) |
| die Karosserie zu stark wippt | `autoOptik.feder.daempfung` grösser (z. B. 0.7) oder `nicken`/`rollen` kleiner |
| die Federung zu steif wirkt | `autoOptik.feder.frequenz` kleiner (z. B. 1.8) |
| das Auto zu schnell / zu langsam dreckig wird | `autoOptik.dreck.belaege.<belag>.aufbau` (z. B. Wiesenweg 0.02 → 0.01) |
| die Felge zu früh / zu spät verwischt | `autoOptik.radUnschaerfeAb` (m/s; 22 = 79 km/h) |
| dir eine andere Lackierung besser gefällt | `autoOptik.lackierung`: `'gletscher'` oder `'dunkel'` |
| dir das alte Fahrgefühl besser gefällt | `index.html?auto=prototyp`, und sag mir, was am RT4 stört |

**Für Änderungen am Aussehen oder Fahrgefühl schreib einfach, was dir auffällt (mit Screenshot oder den kopierten Werten
aus dem Fahr-Labor), das wird dann M8a.1.**

### So testest du (Werkzeuge)

- `node tools/auto-test.mjs` (neu: Prüfungen (a) bis (n); `--nur o` = alle bisherigen Tests nacheinander, dauert ca. 1 Stunde)
- `node tools/auto-messung.mjs [--alt <alte Version>]` (neu: Messtabellen, schreibt `tools/auto-messung.json`)
- `node tools/m8a-bilder.mjs [--alt <alte Version>]` (neu: alle Bilder unten)
- `node tools/testfahrer.mjs --auto rt4`, `node tools/pacenotes-test.mjs --auto rt4`, `node tools/abkuerzungen.mjs --pruefen --auto rt4`

### Bilder (`screenshots/m8a/`)

Jedes Spielbild gibt es zweimal: gross (1280x720) und in Originalgrösse (`…-320x180.png`, so wie das Spiel rechnet).

| Datei | Was |
|---|---|
| `01-vorher-heck/-dreiviertel/-seite` | **0.7b**: das alte Auto an der Startlinie (Spielkamera, schräg von hinten, Seite) |
| `02-nachher-heck/-dreiviertel/-seite` | **0.8a**: dasselbe mit dem neuen RT4 |
| `02-nachher-10-start` | Start (Countdown-Stellung, HUD an) |
| `02-nachher-11-kurve-seite` | in Kehre 2: man sieht die Seite beim Lenken |
| `02-nachher-12-bremsen` | Vollbremsung von 120 km/h: Nase taucht |
| `02-nachher-13-beschleunigen` | Vollgas aus dem Stand: Heck setzt sich |
| `02-nachher-14-kuppe` | schnell über die stärkste Kuppe |
| `02-nachher-15-drift-handbremse` | Drift mit Handbremse auf Schotter |
| `02-nachher-16-nach-wiesenweg-dreck` | nach dem Wiesenweg: Dreck unten am Auto |
| `02-nachher-17-staub-schotter` | Staub auf dem Almweg |
| `02-nachher-18-rueckwaerts-rueckfahrlicht` | rückwärts: Rückfahrlicht |
| `02-nachher-19-demo-front-tief/-verfolger-seitlich/-vorn-oben` | die Demo-Kameras im Menü (Menü für das Bild ausgeblendet) |
| `20-fahrlabor` | Fahr-Labor (`?fahrlabor=1`) mit einem verstellten Wert und WERTE KOPIEREN |
| `30-auto-labor-seite` | die Seite `auto-labor.html` |
| `31-labor-ansichten-<grösse>` | sechs Ansichten (Heck, Drei-Viertel hinten, Seite, Drei-Viertel vorne, Front, oben) |
| `32-labor-lackierungen-<grösse>` | werk, gletscher, dunkel |
| `33-labor-lenkung-links-rechts-<grösse>` | Vorderräder voll eingeschlagen |
| `34-labor-nicken-rollen-<grösse>` | Federung am Anschlag (Nicken, Rollen) |
| `35-labor-dreck-0-05-1-<grösse>` | Dreck 0 / 0.5 / voll |
| `36-labor-bremslicht-rueckfahrlicht-<grösse>` | aus / Bremslicht / Rückfahrlicht |
| `37-labor-raeder-stand-tempo-<grösse>` | Räder im Stand (Speichen) und bei Tempo (Scheibe) |
| `40-messtabelle.png`, `40-messtabelle.md` | die Messtabellen |

`<grösse>` = 320x180, 480x270 und 640x360 (Originalgrösse, nicht vergrössert).

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/autos.js` | **neu**: Modell-Daten des RT4 (Teile, Masse, Räder, Bemalung, Lichter). Weitere Autos (M8c) = neue Einträge |
| `js/car.js` | **neu geschrieben**: baut das Auto aus den Daten (Karosserie, Räder, Lichter, Schatten), malt die Lackierung, Räder, Federung, Lichter, Dreck |
| `js/federung.js` | **neu**: Feder und Dämpfer für Nicken, Rollen, Hub, Stoss (nur Optik) |
| `js/fahrprofil.js` | **neu**: Fahrprofile wählen (`?auto=`), Referenz merken, Profil darüberlegen |
| `js/fahrlabor.js` | **neu**: Seitenpanel `?fahrlabor=1` (wird nur dann geladen) |
| `js/physics.js` | Achslasten (Gewichtsverteilung, Gewichtsverlagerung), Heck-Grip je Belag – im Prototyp neutral |
| `js/getriebe.js` | Allrad-Traktion je Belag, Turbo mit Ladedruck (`getriebe.ladedruck`), `zugkraftFaktor` – im Prototyp neutral |
| `js/main.js` | Profil vor dem Start wählen, Belag an Getriebe und Physik, Federung, Lichter, Dreck, Fahr-Labor |
| `js/config.js` | `autoOptik` (Lackierungen, Feder, Dreck, Räder), neue neutrale Werte in `auto`/`getriebe`, Block `fahrprofile`, Version 0.8a |
| `js/texte.js` | AUTO-Seite: zwei neue Zeilen (de/en) |
| `auto-labor.html`, `js/autolabor.js` | **neu**: Auto-Labor |
| `tools/auto-test.mjs` | **neu**: Prüfungen (a)–(o) |
| `tools/auto-messung.mjs`, `tools/fahrmessung.js`, `tools/auto-messung.json` | **neu**: Messtabellen (Fahrphysik ohne Browser, Optik und Testfahrer im Browser), Ergebnis vorher/nachher |
| `tools/auto-referenz-07b.json` | **neu**: Schnappschuss der Werte `auto`/`getriebe`/`untergrund` aus 0.7b (Beweis „prototyp = 0.7b“) |
| `tools/fahrspur.js` | **neu**: feste 70-s-Fahrt über alle Beläge mit Prüfsumme (bit-genauer Vergleich) |
| `tools/node-three.mjs` | **neu**: lädt das Auto ohne Browser (für die Speicher-Messung) |
| `tools/m8a-bilder.mjs` | **neu**: alle Bilder unter `screenshots/m8a/` |
| `tools/spiel-browser.mjs` | Werkzeuge fahren standardmässig `prototyp`, Schalter `--auto rt4` |
| `tools/abkuerzungen.mjs`, `tools/testfahrer.mjs`, `tools/pacenotes-test.mjs` | Schalter `--auto`; `pacenotes-test --auto rt4` vergleicht mit der Referenz (schreibt nichts) |
| `KONZEPT.md`, `STAND.md` | M8a eingetragen, als Nächstes M8b |

### Selbst getestet

- **`node tools/auto-test.mjs`** (neu): (a) bis (n) **alles ok**; zwei Messwerte als **KOMP** (Kompromiss, siehe oben).
  - (a) Masse 4.475 x 1.86 x 1.395 m, Radmitten und Radradius 0.33 exakt, 9 Zeichenaufrufe, 1306 Dreiecke, kein NaN.
  - (b) nur vorne lenken, höchstens 35°, Drehung = Strecke / Radius, rückwärts umgekehrt, Felge weich zur Scheibe.
  - (c) Federung: ein Überschwinger, nach 0.4–0.5 s ruhig, Grenzen gehalten, Physik mit/ohne Federung bit-genau gleich,
    kein Speichermüll pro Bild (0.06 Byte).
  - (d) Lichter, (e) Dreck je Belag (Asphalt nichts, Obergrenze, sauber bei Start/Neustart/nach der Demo), (f) drei
    Lackierungen ohne geladene Dateien, (n) Auto-Labor inkl. BILD SPEICHERN.
  - (g) **prototyp = 0.7b**: Werte gleich dem Schnappschuss, feste 70-s-Fahrt mit Prüfsumme `3d98a02d` wie 0.7b,
    Testfahrer **2:59.33 / 2:42.35 / 2:31.92** inkl. Zwischenzeiten, Höchsttempo 148.6 / 153.8 / 157.5 km/h, 0 Aufpralle,
    0 Resets; `?auto=rt4`, ohne `?auto` und `?auto=quattro` geben rt4 ohne Konsolenfehler.
  - (h) Tabelle B3 wie oben, Testfahrer RT4 **2:58.73 / 2:41.83 / 2:31.24** ohne Aufprall und Hänger.
  - (i) Turbo: voll nach 0.350 s, leer nach 0.250 s, Anti-Lag nie unter 0.7; im Prototyp nie Ladedruck.
  - (j) `pacenotes-test --auto rt4`: 25 Kurven im Zielbereich, eine Kurve wäre eine Stufe höher (nur gemeldet);
    `js/pacenotes-tempo.js` nicht neu geschrieben.
  - (k) **Abkürzungen 127 / 2 / 342 / 84** mit prototyp und mit rt4, gesperrt durchkommen 0.
  - (l) Demo-Fahrt mit rt4: ganze Etappe (3653 m) ohne Aufprall und ohne Hängenbleiben, Rennstand unberührt.
  - (m) Fahr-Labor: 12 Regler, sofort wirksam, WERTE KOPIEREN, Zurücksetzen, PROTOTYP/RT4 nur Werte, Pfeiltasten
    fahren nach einem Klick ins Panel weiter das Auto (der Regler schluckt sie nicht); ohne `?fahrlabor=1` nicht geladen.
- **(o) alle 19 bisherigen Tests mit prototyp bestanden** (getriebe, lenk, handbremse, belag, rueckwaerts, aufprall,
  pacenotes, menue, rennablauf, ton, ton-umgebung (im 2. Versuch, siehe Probleme), felswand, gras, kuh, leben, nebenweg,
  startziel, strassenrand, overlay). **Mit rt4**: `menue-test` und `ton-umgebung-test` bestanden; `ton-test` 211 von 212
  Prüfungen – die eine ist ein Rundungsfehler im Testaufbau (siehe Probleme).
- **Unverändert gegenüber 0.7b** (geprüft mit git): Strecke, Sperren, Pace-Notes und `js/pacenotes-tempo.js`,
  `tools/schneiden-zeiten.json`, Checkpoints, Kollision, Kühe/Zuschauer, Ton, Musik, HUD, Menüs (ausser den zwei Texten
  auf der Seite AUTO), Kamera-Werte, Bestzeiten-Format, Demo-Werte.
- **Leistung**: Bildzeit gleich, Ladezeit nicht länger, 14 Zeichenaufrufe weniger in der Szene (Tabelle oben).
- **Bilder** in allen drei Pixelgrössen angesehen. Dabei korrigiert: Seitenschrift erst ab 480x270 (sonst Rauschen),
  das Fahr-Labor-Panel verdeckte den rechten Bildrand (jetzt steht das Spielbild links daneben), Demo-Bilder ohne Menü.
- **Nicht gemacht: das Fahrgefühl selbst gespürt.**

### Ehrlich beurteilt – wo ich am unsichersten bin

- **Fahrgefühl nicht gespürt.** Alle Zahlen stammen aus festen Fahrprogrammen (gerade beschleunigen, Kreis fahren,
  bremsen) und dem Testfahrer. Ob „Traktions-Monster“ beim Fahren ankommt, merkt man erst am Lenkrad bzw. an der
  Tastatur – am ehesten in den Kehren mit Schotter-Ausgang und auf dem Wiesenweg.
- **Der Unterschied ist bewusst klein.** Auf Asphalt fährt der RT4 fast wie der Prototyp (Kreis +2.6 %, 0–100 −2 %).
  Spürbar anders sollten sein: Anfahren auf Schotter (−5 %) und Wiesenweg (−10 %), mehr Lenkung in schnellen Kurven
  (+16 %), das Heck beim Bremsen in der Kurve, ruhigeres Heck mit Gas. Wenn dir das zu wenig ist: Fahr-Labor.
- **Untersteuern**: +16 % Lenkbedarf bei 80 km/h ist deutlich. Es kann sich „stumpf“ anfühlen. Erster Wert zum Drehen:
  `fahrprofile.rt4.auto.schwerpunktVorne` (0.48 statt 0.46: Lenkbedarf nur noch +6 % statt +16 %).
- **Turbo**: Ohne Ton ist ein Ladedruck-Aufbau von 0.35 s kaum zu spüren (12 % weniger Schub nur in der ersten
  Drittelsekunde nach dem Gasgeben). Hörbar wird er erst mit M8b.
- **Aussehen bei 320x180**: Das Auto ist dort klein. Helme, Türgriff, Spiegel und Abschlepp-Öse sind nur
  einzelne Pixel; das ist so gewollt (Pixel-Look), aber ob das Modell „wie ein Rallyauto der 80er“ wirkt, entscheidest du.
  Die Bilder in `screenshots/m8a/` zeigen alle drei Pixelgrössen nebeneinander.
- **Federung**: Die Stärken (Nicken 0.0045 rad pro m/s², Rollen 0.009) sind geschätzt. Beim harten Bremsen taucht die
  Nase ca. 2.6°. Wenn es zu „schwammig“ oder zu steif wirkt: `autoOptik.feder`.
- **Dreck**: Bei 320x180 sieht der Dreck auf dunklen Teilen (Heckschürze, Schweller) eher wie ein Fleckenmuster aus
  (helle Flecken auf Schwarz). Wenn dir das zu unruhig ist: `autoOptik.dreck.raster` kleiner (z. B. 8 = gröbere,
  ruhigere Flecken) oder `max` kleiner.

### Bekannte Probleme

- **Zwei Messwerte und die Nebenweg-Zeiten des Testfahrers verfehlen das Ziel** (Bankett, Kreis auf Schotter,
  Almweg/Wiesenweg beim Testfahrer) – siehe Kompromisse unter den Messtabellen.
- **Die Unfallautos an der Strecke** sind noch die alten Klötzchen-Autos (absichtlich unverändert, siehe Ideen).
- **Der Turbo ist nicht zu hören**: Der Motorton liest den Ladedruck noch nicht (M8b).
- **Bestzeiten**: Alte Bestzeiten (Fahrverhalten 0.7b) und neue mit dem RT4 stehen in derselben Liste (Id `rt4`). Der
  RT4 ist beim Testfahrer 0.3–0.45 % schneller (ca. 0.5–0.7 s auf 2:30–3:00), ein neuer Rekord wird also etwas
  leichter. Läufe mit `?auto=prototyp` stehen mit der Id `prototyp` in derselben Liste.
- **Test `ton-umgebung-test` (Prüfung „Pause: leise Variante“)** schlägt im Test-Browser manchmal fehl: Er erwartet die
  Pausen-Musik 0.7 s nach dem Pausieren bei Pegel 0.5. Im Test-Browser dauert ein Bild aber ca. 0.33 s (Software-Grafik),
  die Musik startet erst mit dem nächsten Bild – je nach Zufall zu spät. **Das passiert mit 0.7b genauso** (gemessen: in
  4 von 16 Versuchen mit 0.7b, 6 von 16 mit 0.8a, Bildzeit gleich). Im echten Browser mit 60 Bildern pro Sekunde kein
  Problem. Der Test bleibt unverändert; `auto-test --nur o` wiederholt einen fehlgeschlagenen Test einmal und sagt es.
- **Test `ton-test` mit `--auto rt4`, Prüfung „CP 3 gleich = gelb“**: Der Test baut die Referenz aus der Zeit an CP 3,
  **aufgerundet** auf Hundertstel; das Spiel vergleicht (richtig) die **angezeigten, abgeschnittenen** Hundertstel. Mit dem
  RT4 liegt die Zeit an CP 3 genau auf 123.625 s: angezeigt 2:03.62 gegen Referenz 2:03.63 = „schneller“ = grün statt
  gelb. Ein Fehler im Testaufbau, nicht im Spiel (mit prototyp, 124.133 s, fällt er nicht auf). Bestehende Tests sollten
  unverändert bleiben, darum ist er nicht korrigiert; `auto-test --nur o` meldet ihn als **BEKANNT**. In einem Einzellauf
  schlug zusätzlich einmal „?ton=aus: … das Spiel läuft“ knapp fehl (Tempo 0.5 statt über 0.5 m/s nach 0.8 s): Im
  Test-Browser laufen in 0.8 s nur zwei, drei Bilder, und der RT4 hat in den ersten 0.35 s 12 % weniger Schub (Turboloch).
  Im Lauf (o) bestand diese Prüfung.
- Die Schrift am Auto (Sponsoren) erscheint erst ab 480x270 (bei 320x180 wäre sie Pixelrauschen).
- Der Staub kommt weiterhin aus `js/staub.js` (unverändert); er steigt hinter den Hinterrädern auf, nicht an jedem Rad
  einzeln.

### Ideen/Vorschläge (nicht umgesetzt)

- **Auspuff-Flamme** beim Poppen und Schalten (kleiner Pixel-Blitz am Auspuff links, passend zum Knall aus M7a.1).
- **Beulen und Schäden** nach harten Aufprallen (z. B. schiefer Spoiler, zerbrochenes Licht, Kratzer in der Textur).
- **Turbo-Pfeifen** und Abblasen aus dem echten Ladedruck (`getriebe.ladedruck` ist schon lesbar) – passt zu **M8b**
  (Motorklang für den RT4).
- **3D-Vorschau auf der Seite AUTO** mit Garage (drehendes Modell, Lackierung wählen) – passt zu **M8c**.
- **Unfallautos** an der Strecke mit dem neuen Modell (heute noch die alten Klötzchen-Autos, absichtlich unverändert).
- **Namen für die nächsten Autos** (Fantasienamen, keine echten Marken): **Valmora Spada**, **Valmora Brenta**,
  **Hoshiro Raiden**, **Marlowe Harrier**.
- Dreck auch oben auf der Motorhaube nach Wasserdurchfahrten oder Spritzer von vorausfahrenden Autos (wenn es mal
  Gegner gibt).
- Das Auto-Labor könnte zusätzlich die Fahrspur einer gespeicherten Bestzeit abspielen (Federung und Räder in Bewegung).
- Sicht aus der Motorhaube oder dem Cockpit (das Modell hat jetzt Helme und Scheiben, eine Cockpit-Kamera wäre möglich).

---

## Meilenstein 7b: Umgebungsklänge mit Stereo und Abstand, Menü-Musik, Regler MUSIK ✅ (Verlauf, Stand damals)

> **Ehrlich vorneweg: Ich habe nichts davon gehört.** Alles ist **gemessen** (offline gerechnet: Pegel, Spitze,
> Spektralschwerpunkt, Tonhöhe, Ausklingzeit, Stereo-Verteilung, Spektrogramme) und von Tests geprüft. Ob die Glocken nach
> Treicheln klingen, der Jubel nach Menschen und die Musik nach 80er-Arcade-Rally, kannst nur du entscheiden. Darum zuerst
> die **Hörtest-Anleitung** unten. **Musik:** Melodie, Schlagzeug und Mischung sind am unsichersten – sag einfach, was dir
> nicht gefällt, das wird dann **M7b.1**.

### Was ist neu?

**1. Raum: Stereo und Abstand** (für alle Umgebungsklänge). Der Hörer ist die **Kamera** (wo sie steht und wohin sie
schaut), damit der Ton zum Bild passt.
- **Links/rechts**: Pan aus dem Winkel zur Blickrichtung (`sin(Winkel)` x 0.8). Quelle links = links, vorne/hinten = Mitte.
- **Abstand**: bis zur „Referenz“ voller Pegel, dann leiser (halber Pegel bei doppeltem Abstand), ab dem „Radius“ still
  (auf den letzten 15 % weich auslaufend). Dazu ein **Tiefpass**: nah 9000 Hz, in 150 m 1500 Hz (fern = dumpf).
- **Hinten**: Quellen hinter der Kamera sind leiser (x0.7) und dumpfer (höchstens 2500 Hz), weich über den Winkel.
- Alles wird **weich nachgeführt** (0.05 s), auch bei 100 km/h kein Knacken.
- **Ehrlich zur Vorgabe „Pan wechselt von links nach rechts“:** Fährst du an einer Quelle vorbei, die links neben der
  Strasse steht, **bleibt sie links**: vorne Mitte → ganz links (wenn du daneben bist) → hinten Mitte (und dumpfer). Sie
  wandert nie auf die rechte Seite, das wäre physikalisch falsch. Das Bild `screenshots/m7b/20-pan-verlauf-vorbeifahrt.png`
  zeigt beide Fälle (Quelle links und rechts).
- Umgebung gibt es nur im **Countdown, Rennen, Zielbildschirm** und – durch den Pausenfilter dumpf und leiser – in der
  **Pause** (dort wird nichts Neues ausgelöst, die Welt steht). Titel, Menü, Demo-Fahrt: keine Umgebung.
- **Eigener Stimmen-Topf**: höchstens **8** einmalige Umgebungsklänge zugleich, getrennt von Aufprall und Signalen
  (die werden nie verdrängt). Dauerklänge: höchstens 2 Gemurmel, 1 Brunnen, 1 Böen.

**2. Kuhglocken (Treicheln)**: jede der **17 Herden** (54 Kühe, Tal und Alp, auch die Herden bei Start und Ziel) ist
eine Quelle. Der Klang: 3 Teiltöne in unharmonischen Verhältnissen (z. B. 1 : 2.3 : 3.9) plus ein schwebender Zwilling
des Grundtons und ein kurzes Rasseln, weicher Anschlag. **Grundton 240–400 Hz**, 3 Varianten pro Herde (feste
Zufallsfolge), Ausklingen **0.51–0.88 s**, Schwerpunkt **ca. 400 Hz** (dumpf, kein Glöckchen). Die Herde bimmelt
unregelmässig (Abstand **0.5–1.8 s**, im Mittel 1.0 s bei 6 Kühen; je mehr Kühe, desto dichter), manchmal ein
**„bim-bom“**. Grasende Kühe läuten am meisten, stehende seltener, **liegende kaum**. Hörbar bis ca. **70 m** vor der
Herde, nur die **2 nächsten** Herden. Unter **25 m** läutet die Herde **1.5-mal dichter** („aufgeschreckt“, nur Klang).
Jeder Schlag kommt von einer zufälligen Kuh der Herde (der Klang wandert also ein bisschen). Kühe selbst: unverändert.

**3. Publikum** an **Start** (±70 m um die Linie), **Ziel** (−70 … +350 m, auch die Ausrollstrecke) und den Fan-Spots
**Kehre 3**, **Passhöhe**, **Almweg** (Stärke 1.0 / 1.0 / 0.6 / 0.8 / 0.5). Klangpunkte alle 25 m auf der Zuschauerseite.
- **Gemurmel** (Dauerklang): Rauschen durch drei „Stimmen“-Bänder (300 / 800 / 2200 Hz), langsam schwankend, mit
  Silben-Flattern; nahtlose 4-s-Schleife. Hörbar bis ca. **80 m**. Im Countdown am Start bist du mitten drin.
- **Jubel-Welle** (ca. 2.4 s): Rauschen mit wandernden Vokal-Formanten (a/o/e/ä), dazu „Ooh/Yeah“-Rufe (Sägezahn durch
  Formantfilter, gleitende Tonhöhe) und Klatschen, mit zufälligem Anschwellen. Ausgelöst **beim Vorbeifahren** an einem
  Fan-Spot (25 m davor, einmal pro Durchfahrt, höchstens alle 20 s pro Ort; ein R-Sprung zählt nicht), **bei GO** am Start
  (kräftiger) und **an der Ziellinie** (noch kräftiger, mit Klatsch-Ausbruch). Bei **neuer Bestzeit** kommt mit der langen
  Fanfare der **lange Jubel** (ca. 5 s). Läuft ein Jubel, folgen Pan und Pegel der Kamera.
- **Klatschen**: dichte, kurze Rauschimpulse (**25–40 pro Sekunde**, Bandpass um 2.2 kHz), in jeder Welle und als eigener
  Ausbruch an der Ziellinie.
- Zuschauer-Figuren und ihre Animation: unverändert (Bild und Ton laufen unabhängig).

**4. Vögel**: 8 Ruf-Arten (Aufwärts- und Abwärts-Pfiff, Triller, Doppel-Ton, „tü-tü-tü“, schneller Triller, Schwung,
„Zick“), **2–5 kHz**, **65–190 ms**, scharf. Sie rufen seitlich **10–40 m** neben und **5–25 m** vor/hinter der Kamera,
im Mittel alle **5 s** bei Dichte 1. Dichte je Abschnitt (weich über 40 m übergeblendet):

| Abschnitt | Dichte | gemessen |
|---|---|---|
| Start im Tal | 0.7 | 0.68 |
| Talabschnitt | 1.0 | 1.01 |
| Waldstück | 1.0 | 1.01 |
| Kehrengruppe | 0.5 | 0.48 |
| Felswand 1 (beide Teile) | 0 | 0 (keine Rufe) |
| Almweg | 0.7 | 0.68 |
| Passhöhe | 0.15 | 0.13 |
| Wiesenweg | 1.0 | 1.01 |
| Abfahrt (mit Felswand rechts) | 0.4 | 0.41 |
| Zielgerade | 0.6 | 0.61 |

Je schneller, desto weniger Rufe (bei 180 km/h noch 30 %); im Countdown volle Dichte.

**5. Brunnen** (Alpweide, Wiesenweg bei 2979 m, **31 m links** neben der Strasse): Plätschern aus der Röhre (Rauschen
1–4 kHz mit schnellem Blubbern) und kleine Tropfen (kurze Tonsprünge), nahtlose 3-s-Schleife, hörbar bis **60 m**.
**Ehrlich: Es gibt im Spiel keinen Bach** – nur diesen Brunnen. Einen echten Bach müsste man zuerst als Gelände und
Grafik bauen; das steht unter den Ideen.

**6. Windböen auf der Passhöhe** (2495–2794 m, davor und danach 80 m weich ein und aus): tiefes Rauschen, links und
rechts aus zwei unabhängigen Quellen (breit, kein Pan), mit **langsamen Böen** (anschwellen 1.5–3 s, abschwellen
2–4 s, Pause 2–6 s) und einem leisen **Heulton** (schmaler Bandpass, wandert zwischen 300 und 700 Hz). Unabhängig vom
Tempo (auch im Stand), **zusätzlich** zum Fahrtwind (der ist unverändert).

**7. Menü-Musik „Passfahrt“** – eine **Eigenkomposition** (keine bekannten Motive) im Stil 80er-Arcade-Rally, aus Noten im
Code gespielt (`js/musikstueck.js`), vier Kanäle wie ein 80er-Computer:
- **Melodie**: Pulswelle 25 % (Strophe) / 12.5 % (Refrain), leichtes Vibrato bei langen Noten, **Echo** (3/16,
  Rückkopplung 0.3, Tiefpass); im Schluss-Refrain mit leiser Oktave darunter („voller“).
- **Arpeggio**: Pulswelle 50 %, schnelle 16tel auf den Akkorden; im Refrain eine **Gegenstimme** (absteigende Linien).
- **Bass**: halb Dreieck, halb Sägezahn mit Tiefpass, **pumpende Achtel** (Grundton auf der Zählzeit, Oktave/Quinte
  dazwischen); im Break Viertel.
- **Schlagzeug**: Kick (Sinus, Tonhöhe fällt 150 → 46 Hz), Snare (Rauschen + Sinus), Hi-Hat zu/offen (Rauschen, hell);
  **Fill** im letzten Takt jeder 8er-Gruppe.
- Auf dem Mix: sanfter Tiefpass (3.8 kHz, runde Flanken wie ein 80er-Computer), sanfter Kompressor und eine Decke (nie
  über −8.3 dBFS).
- **Tempo 138 BPM**, a-Moll, **76 Takte = 2:12**, dann nahtlos von vorn. Die endgültige Tabelle:

| Abschnitt | Takte | Harmonie (ein Akkord pro Takt) | Charakter |
|---|---|---|---|
| Intro | 1–4 | Am Am F G | Bass und Schlagzeug, Arpeggio ab Takt 3 |
| A (Strophe) | 5–12 | Am Am F G / Am Am Dm E | Melodie mit kurzem rhythmischem Motiv, Frage und Antwort |
| B (Aufbau) | 13–20 | F G Am Am / F G E E | steigende Linie bis a'', Schlagzeug dichter (16tel-Hi-Hat) |
| C (Refrain) | 21–28 | Am G F E / Am G F E | Hook (3+3+2, mit Pause) zweimal gleich, beim dritten Mal variiert; Gegenstimme |
| A' | 29–36 | wie A | gleiche Fragen, Antworten höher und anders |
| Break | 37–40 | Dm Dm E E | ohne Schlagzeug und Melodie, Arpeggio und Bass; Rauschen-Anstieg im 4. Takt |
| B' | 41–48 | wie B | |
| C' | 49–56 | wie C | |
| D (Schluss-Refrain) | 57–64 | Bm A G F♯ / Bm A G F♯ | ein Ganzton höher (h-Moll), Melodie mit Oktave darunter, Gegenstimme |
| C'' | 65–72 | wie D | Takt 5, 7, 8 variiert, Höhepunkt bis h'' |
| Rückführung | 73–76 | Em F E E | führt nach a-Moll zurück, im letzten Takt Stille in der Melodie, Schlagzeug-Fill |
| (Ausklang, nur Zielbildschirm) | 8 | Am Am Dm Dm F F E E | ruhige Schleife: Arpeggio, Bass, sanfte Melodie (Dreieck), ohne Schlagzeug |

**8. Wo die Musik läuft**: **Titel und Hauptmenü samt Unterseiten** (auch mit der Demo-Fahrt dahinter): startet beim
Entsperren (erster Tastendruck) mit dem Intro, blendet in 0.8 s ein und **läuft über alle Seiten durch** (kein Neustart).
**STARTEN**: blendet in **1.0 s** aus und stoppt; Countdown und Rennen **ohne Musik** (Countdown-Pieps, Motor, Umgebung
wie gehabt). **Pause** (auch im Countdown): leise Variante ab Abschnitt A, **ohne Schlagzeug**, Tiefpass 1200 Hz, halber
Pegel, 0.4 s ein; **Weiter**: 0.4 s aus. **Zielbildschirm**: nach **ca. 1 s** (bei neuer Bestzeit erst nach der langen
Fanfare, **ca. 5 s**) der ruhige Ausklang in Schleife, Pegel 0.7. **Hauptmenü** (aus Pause, Rennen, Zielbildschirm):
Musik wieder vom Intro. R / Neustart: keine Musik. Mit `?ton=aus` und `?menue=aus`: ganz stumm.

**9. Regler MUSIK** (EINSTELLUNGEN → TON, unter SIGNALTÖNE): 0–100 % in 5er-Schritten, **Standard 60 %**, gespeichert
(alter Speicher ohne den Wert = 60 %), quadratisch wie die anderen, wirkt sofort und weich, **zusätzlich** zu LAUTSTÄRKE.
Englisch: MUSIC. Hinweis: „MENÜ, PAUSE, ZIEL - ZUSÄTZLICH ZUR LAUTSTÄRKE“. Der Hinweis unter LAUTSTÄRKE heisst jetzt
**„FÜR ALLES (MOTOR, UMGEBUNG, MUSIK, SIGNALE)“** („FOR ALL (ENGINE, AMBIENCE, MUSIC, SIGNALS)“). Beim Verstellen hörst du
den Regler-Tick und die Musik selbst lauter/leiser.

**10. Ducking**: Menü-Bestätigen/Zurück/Fehler und Checkpoint-/Ziel-Signale senken die Musik für 150 ms um **4 dB**.
Das Ducking des Motors (M7a.1) ist unverändert.

**11. Ton-Labor** (`ton-labor.html`): neue Bereiche **Umgebung** (Klangart, Abstand 0–150 m, Seite −90° … 180°,
ABSPIELEN, **VORBEIFAHREN** mit 90 km/h in 15 m Abstand, Anzeige von Pan, Pegel, Tiefpass) und **Musik** (SPIELEN/STOPP,
Abschnitt zum Springen, Art Menü/Pause/Ziel, Tempo 110–160 BPM, Musik-Pegel = Regler MUSIK, Kanäle einzeln stumm, Anzeige
von Abschnitt und Takt). Im **Feinschliff** 15 neue Regler (Glocken-Reichweite, Glocken-Dichte, Glocken-Pegel,
Gemurmel-Pegel, Jubel-Pegel, Vögel-Dichte, Vögel-Pegel, Brunnen-Pegel, Böen-Pegel, Pan-Stärke, Tiefpass in der Ferne,
Echo-Pegel, Lead-, Bass-, Schlagzeug-Pegel); WERTE KOPIEREN und ALLES ZURÜCK nehmen sie mit.

### Quellen im Spiel (Positionen in Weltkoordinaten stimmen zur Strecke auf ±1 m, Test (a))

| Quelle | wo | Reichweite |
|---|---|---|
| 17 Herden (54 Kühe) | Mittelpunkt und Radius aus den Kühen (`kuehe.js`, nur gelesen) | 70 m ab Herdenrand |
| Start | 6 Punkte, 25 m Abstand, −70 … +70 m um die Startlinie (auch auf der Verlängerung) | 80 m (Jubel 160 m) |
| Ziel | 17 Punkte, −70 … +350 m (Ausrollstrecke) | 80 m |
| Fan-Spot Kehre 3 | 1694–1716 m, rechts, 13.8 m neben der Mitte (2 Punkte) | 80 m, Jubel ab 1669 m |
| Fan-Spot Passhöhe | 2590–2652 m, rechts, 12.5 m (4 Punkte) | 80 m, Jubel ab 2565 m |
| Fan-Spot Almweg | 1970–1990 m, links, 11.3 m (2 Punkte) | 80 m, Jubel ab 1945 m |
| Brunnen | dort, wo er gebaut ist (Kollisionskreise aus `leben.js`), 31 m neben der Strasse | 60 m |
| Böen | Abschnitt Passhöhe 2495–2794 m | ± 80 m weich |
| Vögel | rund um die Kamera, Dichte je Abschnitt | 70 m |

### Messtabelle (offline gerechnet, LAUTSTÄRKE und MUSIK 100 %, lauterer Kanal)

**Umgebung gegen den Motor** (Motor 5000/min Vollgas mit Turbo, Reifen, Wind: RMS **−10.6 dBFS**; Grenze: kein
Umgebungsklang lauter als Motor − 6 dB)

| Klangart | Abstand | RMS | Spitze | gegen Motor (RMS) | Ziel |
|---|---|---|---|---|---|
| Kuhglocke | 6 m | −39.1 dBFS | **−20.0 dBFS** | −28.6 dB | Spitze ca. −20 |
| Gemurmel | 10 m | **−36.3 dBFS** | −23.6 | −25.7 dB | RMS ca. −36 |
| Jubel kurz (an der Ziellinie, kräftig) | 10 m | −33.3 | −15.8 | −22.7 dB | (Spitze einfacher Jubel **−18.1**, Ziel ca. −18) |
| Jubel lang (neue Bestzeit) | 10 m | −33.8 | −16.4 | −23.2 dB | |
| Klatschen (Ausbruch) | 10 m | **−28.7** | −9.6 | −18.9 dB | RMS ca. −28 |
| Vogel | 15 m | −29.8 (während des Rufs) | **−26.0** | −19.2 dB | Spitze ca. −26 |
| Brunnen | 4 m / 31 m (Strasse) | **−38.7** / −53.0 | −24.8 | −28.3 dB | RMS ca. −38 |
| Böen (voll) | – | **−29.8** (schwankt um 14 dB) | −10.5 | −18.7 dB | RMS ca. −30 |
| alles zugleich + Motor + harter Aufprall + Fanfare | | | **0.924** | | unter 0.98 |

**Musik** (jeder Abschnitt einzeln gerechnet)

| Abschnitt | RMS | Spitze | Schwerpunkt | über 2 kHz |
|---|---|---|---|---|
| Intro | −22.8 dBFS | −11.0 dBFS | 198 Hz | 1.0 % |
| A / A' | −20.6 / −20.7 | −9.3 / −9.0 | 670 / 730 Hz | 5.7 / 5.8 % |
| B / B' | −20.3 | −9.4 | 822 Hz | 6.7 % |
| C / C' | −21.7 | −9.5 | 1000 Hz | 16.4 % |
| Break | −20.9 | −12.7 | 232 Hz | 1.3 % |
| D / C'' | −21.5 | −9.1 | 971 / 985 Hz | 15.3 / 15.7 % |
| Rückführung | −20.8 | −9.7 | 633 Hz | 6.0 % |

Ziel war RMS ca. −20 dBFS (±3), Spitze unter −8 dBFS: erfüllt (RMS −20.3 bis −22.8). Grösster Sprung zwischen zwei
Abtastwerten (ohne Schlagzeug) unter 0.1. **Signal gegen Musik**: Menü-Bestätigen Spitze −8.7 dBFS, Musik RMS −21.6 dBFS
→ **13 dB** Abstand (mindestens 10 verlangt), mit Ducking (−4.0 dB gemessen) 17 dB. Bei MUSIK 60 % (Standard) ist die
Musik nochmals 8.9 dB leiser.

### Zahlen

- **Zeichenaufrufe (3D)** 60 m / 1170 m / 2900 m: **122 / 113 / 81 → 122 / 113 / 81** (unverändert).
- **Audio-Knoten**: dauerhaft **79 → 118** (+39: Musik 22 – Kanäle, Echo, Bass-Tiefpass, Mix-Tiefpass, Kompressor, Decke,
  Pause-Tiefpass, Blenden, Ducking, Regler MUSIK; Umgebung 17 – 2 Gemurmel, Brunnen je Pegel/Tiefpass/Panner, Böen mit
  3 Rausch-Quellen, 2 Tiefpässen, Merger, Heul-Bandpass, 2 Pegeln; dazu die Schleifen-Quellen). In einem vollen Moment
  kommen dazu: Umgebung höchstens 8 Stimmen x 4 Knoten, Musik höchstens 14 Töne x 2 Knoten (im Menü typisch 6 Töne).
- **Puffer-Aufbau nach dem Entsperren** (`node tools/m7b-leistung.mjs <alte Version>`): **162 → 263 ms** Rechenzeit
  (**+101 ms**, Budget +200), 20 → 33 Häppchen, **längstes 9.4 ms**. Gemurmel, Brunnen, Glocken, Jubel und Klatschen
  werden mit halber Abtastrate gerechnet (ihr Klang liegt unter 6 kHz; der Browser rechnet beim Abspielen um) – das
  halbiert die Rechenzeit. Das Schlagzeug der Musik wird zuerst gerechnet (die Musik beginnt sofort).
- **Bildzeit mit / ohne Ton** (Test-Rechner mit Software-Grafik, nur zum Vergleich): Rennen an Kehre 3 (Gemurmel, Vögel,
  Motor Vollgas) **216.7 / 216.7 ms**, Menü mit Musik **283.3 / 283.3 ms** – kein Unterschied.
- **tonBild()** im Rennen: **5.5 µs** pro Bild (M7a.1: 1.8 µs). **Speicher pro Bild** (Heap-Profiler des Browsers, ohne
  einmalige Klänge): **157 → 240 Byte** im Rennen. Unser eigener Code legt pro Bild keine Objekte an (in Node mit
  Attrappen gemessen: 0); was bleibt, entsteht im Browser bei jedem Web-Audio-Auftrag (ca. 12 Byte pro Aufruf) – das war
  beim Motor schon seit M7a so (157 Byte). Zwei Fallen habe ich dabei gefunden und umgangen: `Math.hypot` und Zahlen aus
  einem `Float32Array` als Funktions-Argument kosten im Browser jedes Mal ein kleines Objekt.
- **Ladezeit** (`node tools/ladezeit.mjs <alte Version> 9`, abwechselnd, Median): **1571 → 1497 ms** – kein messbarer
  Unterschied (Schwankung dieser Messung ca. ±150 ms). Beim Laden wird nichts Neues gerechnet: Quellenliste und Noten
  entstehen erst beim Entsperren (zusammen ca. 4 ms).

### Hörtest-Anleitung für Lino (M7b)

**Schritt 1: Ton-Labor** (`https://fralineel-kiesel.github.io/alpine-rally/ton-labor.html`), Kopfhörer wenn möglich
(für links/rechts), nicht zu laut, **TON STARTEN**.
1. **Umgebung** (Bereich „Umgebung“): Klangart der Reihe nach wählen – **Kuhglocken** (Abstand 6 m, dann 40 m, dann
   70 m), **Gemurmel** (10 m), **Jubel kurz** und **Jubel lang** (ABSPIELEN), **Klatschen**, **Vögel** (läuft von selbst;
   ABSPIELEN = einer genau an der Stelle), **Brunnen** (4 m, dann 31 m = von der Strasse), **Böen** (warten, sie kommen und
   gehen langsam).
2. **Seite**: bei Kuhglocken oder Gemurmel den Regler „Seite“ von −90 (links) über 0 (vorne) nach +90 (rechts) und 180
   (hinten: dumpfer) schieben.
3. **VORBEIFAHREN** bei Kuhglocken, Gemurmel und Brunnen (Seite −90 = Quelle links, +90 = rechts): 90 km/h, 15 m daneben.
   Kommt der Klang von vorne, ist er neben dir am lautesten und wird hinten dumpfer?
4. **Musik** (Bereich „Musik“): SPIELEN mit Abschnitt **Intro**, dann **A**, **C** (Refrain), **Break**, **D**
   (Schluss-Refrain). Kanäle einzeln stumm schalten (z. B. nur Lead an), um jede Stimme zu hören. Art **Pause** (dumpf,
   leise, ohne Schlagzeug) und **Ziel** (Ausklang). Tempo-Regler ausprobieren.

**Schritt 2: im Spiel**, in dieser Reihenfolge:
1. **Titelbild**: Taste drücken → Musik beginnt (Intro). Durch das Menü und die Unterseiten blättern: Die Musik läuft
   durch. EINSTELLUNGEN → TON → **MUSIK** verstellen.
2. **STARTEN**: Musik blendet in 1 s aus. Im **Countdown** am Start: Gemurmel rundherum, bei **GO** Jubel.
3. Strecke abfahren: **Vögel** im Tal und im Wald, keine an der Felswand; **Kuhglocken** bei den Herden (Tal, Alpweiden);
   Fan-Spots **Kehre 3**, **Almweg-Abzweig**, **Passhöhe** (Jubel beim Vorbeifahren), auf der **Passhöhe** die **Böen**.
4. **Wiesenweg**: der **Brunnen** links bei der Alphütte (von der Strasse aus leise – kurz anhalten und hinhören).
5. **Ziel**: Jubel und Klatschen an der Linie, dann **Zielbildschirm** mit ruhigem Ausklang (nach ca. 1 s).
6. **Pause** (Esc) im Rennen: leise, dumpfe Musik; Weiter: weg.

**Wenn X, dann Y** (die meisten Werte gibt es im Feinschliff des Ton-Labors mit genau diesem Namen):

| Wenn … | dann … | jetzt |
|---|---|---|
| Glocken zu laut / zu leise | `audio.umgebung.kuhglocken.pegel` | 0.142 |
| Glocken zu hell / zu tief | `audio.umgebung.kuhglocken.grundton` (Hz) | [240, 400] |
| Glocken zu weit / zu kurz hörbar | `audio.umgebung.kuhglocken.radius` (m) | 70 |
| Glocken bimmeln zu oft / zu selten | `audio.umgebung.kuhglocken.abstand` (s) | [0.5, 1.8] |
| Gemurmel zu laut / zu leise | `audio.umgebung.publikum.gemurmel.pegel` | 0.0222 |
| Jubel zu laut / zu leise | `audio.umgebung.publikum.jubel.pegel` | 0.178 |
| Jubel klingt unecht | `audio.umgebung.publikum.jubel.gleiter` (mehr/weniger Rufe), `…publikum.klatschen.pegel`; sonst sag mir, was fehlt | 14 / 0.44 |
| Jubel zu oft (Fan-Spots) | `audio.umgebung.publikum.jubel.sperre` (s) | 20 |
| Klatschen zu laut | `audio.umgebung.publikum.klatschen.pegel` | 0.44 |
| zu viele / zu wenige Vögel | `audio.umgebung.voegel.dichteFaktor`, je Abschnitt `audio.umgebung.voegel.dichte` | 1 |
| Vögel zu laut | `audio.umgebung.voegel.pegel` | 0.062 |
| Brunnen nicht hörbar | `audio.umgebung.brunnen.pegel`, `…brunnen.rolloff` (kleiner = weiter hörbar) | 0.0176 / 0.6 |
| Böen zu laut / zu leise | `audio.umgebung.boeen.pegel` | 0.032 |
| links/rechts zu stark / zu schwach | `audio.raum.pan` | 0.8 |
| Ferne zu dumpf | `audio.raum.tiefpassFern` (Hz) | 1500 |
| Musik zu hektisch / zu lahm | `audio.musik.bpm` | 138 |
| Musik zu laut gegen Signale | Regler MUSIK, oder `audio.musik.pegel` | 60 % / 0.9 |
| Melodie zu leise / zu laut | `audio.musik.lead` | 0.26 |
| Bass dröhnt / zu dünn | `audio.musik.bass` | 0.075 |
| Schlagzeug zu dünn / zu laut | `audio.musik.schlagzeug` | 0.25 |
| Echo zu viel | `audio.musik.echo.pegel` | 0.28 |
| Musik zu dumpf | `audio.musik.tiefpass` (Hz, höher = heller) | 3800 |
| Pause-Musik zu laut | `audio.musik.pausePegel` | 0.5 |
| Ziel-Musik kommt zu früh / zu spät | `audio.musik.zielNach`, `zielNachBestzeit` (s) | 1 / 5 |

**So schickst du mir deine Zahlen**: im Ton-Labor unten im **Feinschliff** verstellen, **WERTE KOPIEREN** drücken und den
Text in den Chat einfügen (z. B. `audio.umgebung.kuhglocken.radius = 70`). Werte, die nicht im Feinschliff sind, einfach
dazuschreiben. **Für Musik-Änderungen** (andere Melodie, anderes Tempo, mehr Abwechslung, anderes Schlagzeug) **schreib
einfach, was dir nicht gefällt – das wird dann M7b.1.**

### Wie der Ton aufgebaut ist (Stand M7b)

```
master (Regler LAUTSTÄRKE, quadratisch) -> Limiter -> Sicherheits-Decke -> Lautsprecher
  fahrzeug: Motor + Reifen (über das Ducking), Aufprall, Schleifen
  umgebung: Fahrtwind, Kuhglocken, Publikum, Vögel, Brunnen, Böen (js/umgebung.js) – Pausen-Tiefpass und Ducking
            jede Quelle: Pegel -> Tiefpass (Abstand) -> Panner (links/rechts); eigener Stimmen-Topf (8)
  signale:  Menü, Pause, Countdown, Checkpoint, Ziel, Pace-Notes (Regler SIGNALTÖNE)
  musik:    Regler MUSIK -> Ducking -> Blende -> Art-Pegel -> Pause-Tiefpass -> Decke <- Pegel <- Kompressor
            <- Mix-Tiefpass <- Melodie (mit Echo), Arpeggio/Gegenstimme, Bass (Tiefpass), Schlagzeug (js/musik.js)
```

- Das Spiel gibt dem Ton pro Bild zusätzlich die **Kamera** (Ort, Blickrichtung), den **Streckenmeter** und den
  **musikModus** (Menü, Pause, Ziel, aus) und einmal nach dem Bau der Welt die **Quellenliste** (`umgebungsQuellen`).
- **Musik** wird auf der Audio-Uhr geplant (0.4 s im Voraus, alle 80 ms und bei jedem Bild); bleibt der Zeitgeber stehen
  (Seite im Hintergrund), wird nichts nachgeholt.
- Alle neuen Werte: `js/config.js`, Blöcke `audio.raum`, `audio.umgebung`, `audio.musik`; Noten: `js/musikstueck.js`.

### So testest du

1. Hörtest-Anleitung oben (Ton-Labor zuerst).
2. `node tools/ton-umgebung-test.mjs` (neu, Umgebung und Musik), `node tools/ton-test.mjs` (M7a/M7a.1),
   `node tools/m7b-leistung.mjs <alte Version>`, `node tools/m7b-bilder.mjs`.

### Bilder (`screenshots/m7b/`)

- Spektrogramme (Zeit nach rechts, Tonhöhe nach oben, hell = laut): `10-kuhglocke`, `11-gemurmel`, `12-jubel-kurz`,
  `13-jubel-lang`, `14-vogelrufe` (alle 8 nacheinander), `15-brunnen`, `16-boeen` (30 s), `17-musik-intro`, `-a`, `-c`,
  `-break`, `-d` (je 4 Takte).
- `20-pan-verlauf-vorbeifahrt`: Pan, Pegel und Tiefpass bei 90 km/h, 15 m neben einer Quelle (links und rechts).
- `30-ton-labor`: das Ton-Labor mit den Bereichen Umgebung, Musik und dem erweiterten Feinschliff.
- `31-einstellungen-lautstaerke-signaltoene-musik`, `32-einstellungen-music-englisch` (je auch `-320x180`).

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/umgebung.js` | **neu**: Raum (Pan, Abstand, Tiefpass, hinten), Quellenliste, Klänge (Glocken, Gemurmel, Jubel, Klatschen, Vögel, Brunnen, Böen), eigener Stimmen-Topf |
| `js/musik.js` | **neu**: Musik-Spieler (vorausplanend, 4 Kanäle, Echo, Arten Menü/Pause/Ziel, Blenden, Ducking, `status`, `testRender`) |
| `js/musikstueck.js` | **neu**: Noten und Abschnitte des Stücks |
| `js/audio.js` | Umgebung und Musik eingebaut, Regler MUSIK, Ducking der Musik, Jubel bei GO/Ziel/Bestzeit, Puffer in kleineren Häppchen (auch mit eigener Abtastrate) |
| `js/main.js` | gibt dem Ton Kamera, Streckenmeter, musikModus und einmal die Quellenliste; sonst unverändert |
| `js/config.js` | `audio.raum`, `audio.umgebung`, `audio.musik`, `busse.musik` 0 → 1, `menue.standard.musik` 60, Version 0.7b |
| `js/einstellungen.js`, `js/menueseiten.js`, `js/texte.js` | Regler MUSIK (gespeichert, Texte de/en), Hinweis unter LAUTSTÄRKE |
| `ton-labor.html`, `js/tonlabor.js` | Bereiche Umgebung und Musik, 15 neue Feinschliff-Regler |
| `tools/ton-umgebung-test.mjs`, `tools/umgebung-pruefung.js` | **neu**: Tests (a)–(n) und Messhilfen (Stereo-Rendering, Klick-Messer) |
| `tools/m7b-leistung.mjs`, `tools/m7b-bilder.mjs`, `tools/m7b-messung.json` | **neu**: Leistung, Bilder, Messwerte |
| `tools/ton-test.mjs` | eine Grenze angepasst: Puffer-Aufbau zusammen < 500 ms (vorher < 300 ms; Budget +200 ms für M7b) |

### Selbst getestet

- **`node tools/ton-umgebung-test.mjs` – alle 107 Prüfungen bestanden**, keine Konsolenfehler:
  (a) 17 Herden / 54 Kühe, jede Kuh in einer Herde; Start/Ziel/Fan-Spots ±0.0001 m an der Strecke, Brunnen am gebauten
  Brunnen; Vögel-Tabelle hat alle 10 Abschnittsnamen. (b) Pan links −0.8 / rechts +0.8 / vorne 0; Pegel monoton, 1 bis zur
  Referenz, 0 ab Radius; Tiefpass fällt; hinten x0.7 und 2500 Hz; Vorbeifahrt: grösster Pan-Schritt 0.009 pro Bild, kein
  NaN; gerechnetes Stereo: die Seite der Quelle ist 12 dB lauter. (c) Glocken 240–400 Hz (gemessen = Soll), Ausklingen
  0.51–0.88 s, 0.52–1.80 s Abstand über 292 Schläge (74 Doppel), aufgeschreckt x1.5, nur im Radius, höchstens 2 Herden, −20.0 dBFS bei
  6 m, Schwerpunkt 407 Hz, liegende Kühe läuten kaum. (d) Gemurmel-Naht nahtlos, −36.2 dBFS bei 10 m, still ab 80 m; Jubel
  einmal pro Durchfahrt, 20-s-Sperre, kein Jubel bei R-Sprung, GO, Ziellinie, langer Jubel nur bei neuer Bestzeit;
  Klatschen 30–40 pro Sekunde (gezählt 31.8). (e) Vögel-Dichten ±5 % (siehe Tabelle), Felswand 0, Übergänge weich, 2–5 kHz, 65–190 ms,
  mit Tempo weniger, −26.0 dBFS bei 15 m, alle 8 Arten kommen vor. (f) Brunnen −38.7 dBFS bei 4 m, still ab 60 m, Naht
  nahtlos; Böen folgen der Passhöhe, tempo-unabhängig, −29.8 dBFS, L/R unabhängig. (g) siehe Messtabelle. (h) Topf nie
  über 8, Aufprall/Fanfare/Checkpoint bekommen ihre Stimmen, Pause gedämpft ohne Neues, Menü still, keine hängenden
  Knoten (auch nach einer Minute Fahrt). (i) 76 Takte, 132.17 s, Tonmenge, Lead 220–880 Hz (D bis 988), Bass 55–196 Hz,
  alle Phrasen enden auf Akkordtönen, höchstens 10 gleichzeitige Töne, Naht ohne Klick (Sprung 0.014). (j) alle Abschnitte im Ziel,
  Break ohne Schlagzeug, D genau einen Ganzton höher (Bass 55.0 → 61.7 Hz). (k) Musik ab Entsperren, Unterseiten ohne
  Neustart, STARTEN 1.0 s Rampe, Pause-Variante, Weiter 0.4 s, Hauptmenü → Intro, Ziel nach 0.98 / 4.98 s, Ausklang,
  `?ton=aus`/`?menue=aus` stumm. (l) Regler 60 % Standard, gespeichert, alter Speicher = 60, quadratisch, 0 % still, kein
  Knacken. (m) Ducking −4.0 dB, Signal 13 dB über der Musik.
- **`node tools/ton-test.mjs` – alle 212 Prüfungen bestanden** (eine Grenze angepasst, siehe oben; Puffer-Aufbau dort
  284 ms, längstes Häppchen 8.9 ms). In einem früheren Durchlauf schlug einmal die zeitabhängige Prüfung „?menue=aus: das
  Spiel läuft“ knapp fehl (Tempo 0.5 statt über 0.5 m/s nach 0.8 s, ohne Ton) – im nächsten Durchlauf bestanden.
- **Alte Tests** (unverändert): `testfahrer` **2:59.33 / 2:42.35 / 2:31.92**, `abkuerzungen --pruefen` **127 / 2 / 342 / 84**,
  `rennablauf-test` (Statistik Aufpralle/Resets/Höchsttempo), `menue-test`, `startziel`, `leben`, `kuh`, `pacenotes`,
  `aufprall`, `getriebe` – alle bestanden. `overlay-test`: einmal bestanden, einmal eine zeitabhängige Prüfung („Hinweis
  nach 1.5 s weg“, gemessen nach 1.8 s echter Zeit bei ca. 250 ms pro Bild) nicht – die **alte Version** (M7a.1) scheitert
  im selben Test-Rechner genau gleich; der Test läuft ohne Ton (`?menue=aus`). Strecke, Physik, Kollision, Sperren,
  Abkürzungen, Pace-Notes, Checkpoints, Rennzeit, Fahrspur, Bestzeiten, Kühe und Zuschauer nicht angefasst; „mit und
  ohne Ton genau gleich“ (Ton-Test Teil 1 (d)) besteht weiter.

### Ehrlich beurteilt – wo ich am unsichersten bin

- **Nicht gehört.** Alle Ziele sind gemessen erreicht, aber Klangqualität kann ich nicht beurteilen.
- **Jubel**: Menschliche Stimmen aus Rauschen und Sägezahn sind schwer. Es klingt vermutlich **„stilisiert“** (Rauschen mit
  Vokal-Färbung, ein paar gleitende „Ooh“-Töne, Klatschen) und nicht wie echte Menschen. **Das zuerst anhören** (Labor:
  Jubel kurz / lang).
- **Musik**: Die Melodie folgt sauber den Regeln (Stufen, Phrasen auf Akkordtönen, Hook mit Pause), kann aber **zu brav**
  oder zu „Übungsstück“ wirken. Das **Schlagzeug** ist einfach (ein Kick, eine Snare, Hi-Hats) und könnte **dünn** klingen.
  Kompromiss: ein Tiefpass bei 3.8 kHz auf der ganzen Musik (für runde Flanken ohne Klicks) – das macht sie etwas dumpfer
  als ein heller Chip-Sound. Zu dumpf: `audio.musik.tiefpass` höher.
- **Glocken**: dumpf gemessen (Schwerpunkt 400 Hz), aber ob es nach Treichel oder nach Gong klingt, weiss ich nicht.
- **Brunnen**: von der Strasse (31 m) mit −53 dBFS sehr leise, beim Fahren praktisch nicht hörbar – nur wenn du anhältst.
  Das passt zur Vorgabe „leise“; wenn du ihn hören willst: Pegel hoch oder `rolloff` kleiner.
- **Pan „links nach rechts“**: bewusst nicht so (siehe Punkt 1): eine Quelle neben der Strasse bleibt auf ihrer Seite.
- **Klatschen**: um RMS −28 dBFS zu erreichen, haben einzelne Klatscher Spitzen bis −9.6 dBFS (Klatschen ist sehr
  spitzig) – unter dem Motor, aber hörbar „knackig“.
- **Speicher pro Bild**: +83 Byte pro Bild im Rennen durch Web-Audio-Aufträge des Browsers (siehe Zahlen) – klein, aber
  nicht ganz null.

### Bekannte Probleme

- Wie seit M7a: **Gamepad allein entsperrt den Ton nicht** (Browser-Regel) – erst ein Tastendruck oder Klick. Damit
  startet auch die Musik erst dann.
- Im Test-Rechner (Software-Grafik, langsame Bilder) gemessen; die Zeit bis zur Ziel-Musik zählt in Spielzeit (Bildern)
  – auf echten Rechnern ist das gleich wie die Uhr.
- Die Musik plant im Voraus: Wechselt man sehr schnell zwischen Pause und Weiter, klingt die letzte geplante Note kurz aus.

### Ideen/Vorschläge (nicht umgesetzt)

- **Echter Bach** (z. B. entlang der Alpweide oder im Tal): müsste zuerst als Gelände und Grafik gebaut werden, dann
  Plätschern mit Abstand wie beim Brunnen.
- **Doppler** für die Glocken (Tonhöhe ändert sich leicht beim Vorbeifahren).
- Fanfare je nach Platz leicht anders (aus M7a).
- **Echo in den Kehren mit Felswand** (Pops, Schaltknall, Jubel leicht nachhallend).
- **Mehrere Musikstücke** (z. B. eines fürs Menü, eines für den Zielbildschirm) oder eine Auswahl im Menü.
- **Hinweis auf dem Titel**, dass eine Taste oder ein Klick den Ton aktiviert (für Gamepad-Spieler).
- **Motor leicht stereo** (aus M7a.1).
- Feinschliff-Werte im Labor als Link teilen (aus M7a.1).

---

## Meilenstein 7a.1: Motor härter und höher, Poppen, Schalten, Signale lauter (Regler SIGNALTÖNE), Aufprall dumpfer und lauter, Heulen ✅ (Verlauf, Stand damals)

> **Ehrlich vorneweg: Ich habe wieder nicht gehört.** Ich habe zuerst den Ton von M7a **gemessen** (offline gerechnet:
> Tonhöhe, Spektralschwerpunkt = „wo der Klang wohnt“, Energie in den Höhen, Pegel, Ausklingzeit), dann geändert und
> **gleich nochmal gemessen**. Ob es jetzt nach Gruppe B klingt, entscheidest du. Darum gibt es im Ton-Labor den neuen
> Bereich **Feinschliff**: Du kannst die wichtigsten Werte selber verstellen und mir die Zahlen schicken.

### Was ist neu?

**1. Motor: härter, rauher, höher**
- **Tonlage**: Der Grundton steigt jetzt von ca. **42 Hz im Leerlauf** auf **480 Hz bei Höchstdrehzahl** (vorher 300 Hz).
  Dazwischen ist die Kurve leicht nach oben gebogen (die Mitte bleibt tiefer, oben steigt er schneller): 3000/min
  142 Hz, 5000/min 290 Hz, 7000/min 462 Hz. Das ist Spiel-Klang, kein Naturgesetz – Wert `hoechstTon`.
- **Härte**: viel weniger „weiches Brummen“ (Dreieck auf dem halben Ton 0.35 → 0.16), stärker gesättigt und oben hart
  abgeschnitten (`verzerrung` 1.8 → 6, neu `clip`), eine **Impulswelle mit schmalen Zacken** statt Rechteck (Kanten
  statt rund), der Tiefpass ist viel offener (unter Vollgas bei 5000/min ca. 7.9 kHz statt 3.5 kHz) und ein kleiner
  **Biss** bei 2.2 kHz (+5 dB).
- **Höhe beim Hochdrehen**: eine zusätzliche **Oktav-Schicht** (2. und 4. Oberwelle), die erst ab ca. 2200/min einblendet
  und mit der Drehzahl stärker wird (ohne Gas schwächer).
- **Rauheit**: dreimal so viel rauhes Rauschen (`rauh` 0.10 → 0.30), enger gebündelt und **im Takt der Zündungen
  pulsierend** (wie Auspuff-Stösse). Mehr **Brabbeln** unter Last (`amTiefe` 0.22 → 0.40), im Leerlauf unregelmässig wie bisher.
- **Leerlauf** etwas kerniger (heller), **ohne Gas** dumpfer als unter Last, aber nicht mehr weich.
- **Lautstärke**: Ein harter Klang hat mehr Energie in den Höhen, die das Ohr lauter hört. Darum ist der Motor im
  gemessenen Pegel (RMS) **ca. 2 dB leiser** als in M7a, aber **A-bewertet** (so wie das Ohr hört) **ca. 0.4–1.2 dB
  lauter** – also gefühlt etwa gleich laut. Der **Turbo** ist unverändert und im Verhältnis sogar 2 dB besser hörbar.

**2. Poppen vom Auspuff**: Statt ein bis zwei tiefe Knalle jetzt **Salven aus 1–4 kurzen, hellen Pops** (je ca. 25 ms,
Abstand 40–140 ms, Mitte ca. 2.5 kHz mit kurzem tiefem Anteil, jeder etwas anders laut und hoch). **Häufiger**: Chance
70 % (vorher 45 %) beim Gaswegnehmen aus hoher Last schon **ab 3500/min** (vorher 4000). Dazu in der Hälfte der Fälle
ein ganz **leises Knistern** (1–3 Mini-Pops in den ersten 0.8 s). Danach 1.0 s Ruhe (vorher 1.5 s). Der Blow-off
(Zischen) ist gleich wie vorher. Ohne Last vorher (Rollen ohne Gas) knallt und knistert nichts.

**3. Schalten im Gruppe-B-Stil** (Schaltpause und Drehzahl kommen unverändert aus dem Getriebe)
- **Hochschalten unter Last** (Gas über 50 %): Die Zündung wird sofort unterbrochen – der Motor fällt in ca. 20 ms auf
  **20 %** (vorher blieb er bei 42 %). Beim Wiedereinsetzen in 70 % der Fälle ein **Schaltknall** (etwas lauter als ein
  Pop), der **Blow-off** ist dabei 30 % lauter, und beim Einlegen des Gangs kommt ein **Getriebe-Klack** (kurzer
  mechanischer Schlag 600–2500 Hz plus tiefer Tock bei 90 Hz).
- **Runterschalten**: **Zwischengas** – beim Einlegen 0.15 s lang lauter und heller (wie ein Gasstoss), dazu Klack,
  und mit etwas Gas in 35 % der Fälle ein kleiner Pop.
- **Ohne Last** (Gas unter 20 %): nur ein **leises Klack**, kein Knall.
- **Bewusste Abweichung vom Auftrag**: Das **Zwischengas gibt es auch beim Runterschalten ohne Gas** (beim Bremsen), weil
  im Spiel fast alle Runterschaltungen beim Bremsen passieren – sonst würdest du es fast nie hören. Es knallt dabei
  nicht, das Klack ist leise. Wenn dir das nicht gefällt: `audio.motor.zwischengasOhneLast = false`.

**4. Signale lauter und neuer Regler SIGNALTÖNE**
- Die Signale waren 9–21 dB leiser als der Motor. Jetzt (Spitze bei LAUTSTÄRKE und SIGNALTÖNE 100 %): Countdown, GO,
  Checkpoint, Verpasst, Pause/Weiter, Fanfaren **0.53–0.59** (vorher 0.10–0.22), Menü Bestätigen/Zurück/Fehler **0.37**
  (vorher 0.08–0.09), Menü-Tick, Regler-Tick und Pace-Signal **0.21–0.22** (vorher 0.04–0.08). Das ist 3–5 Mal lauter.
- **Ducking**: Bei Countdown, GO, Checkpoint, Verpasst und Fanfare wird der Motor (mit den Reifen) für 0.25 s um
  **3.5 dB** leiser und kommt weich zurück. Bei Menü-Tönen, Pause und Pace-Signal nicht.
- **Neuer Regler SIGNALTÖNE** in EINSTELLUNGEN → TON direkt unter LAUTSTÄRKE (0–100 % in 5er-Schritten, Standard 100 %,
  gleiche Kurve wie LAUTSTÄRKE, 0 % = alle Signale stumm). Er wirkt **zusätzlich** zu LAUTSTÄRKE. Beim Verstellen hörst
  du den Regler-Tick schon in der neuen Stärke. Englisch: SIGNALS. Der Hinweis unter LAUTSTÄRKE („GILT FÜR DEN GANZEN
  TON“) stimmt weiter (LAUTSTÄRKE regelt alles, SIGNALTÖNE nur die Signale). Alte gespeicherte Einstellungen ohne
  den Wert bekommen 100 %.

**5. Aufprall tiefer, dumpfer, lauter**
- **Stein**: dumpfes „Tock/Wumm“ statt Klirren: Eigentöne nur noch **140 / 250 / 400 Hz** (vorher 820 / 1270 / 2140 /
  3300 Hz = Metallklang), Helligkeit **1700 Hz** (vorher 7000), eigener tiefer Schlag 110 → 55 Hz, leises Gruss-Rascheln
  um 650 Hz. Der grosse tiefe Schlag, den alle Materialien ab 22 km/h dazubekommen, fällt beim Stein weg (er hat ja
  seinen eigenen) – sonst klingt er zu lange nach. **Ausklingzeit 0.19 s** (vorher 0.47 s).
- **Alle Aufpralle ca. +5 dB** (`aufprall.pegel` 0.9 → 1.6, `schlagPegel` 0.7 → 1.25). **Leichte Kontakte** sind
  zusätzlich lauter (`aufprall.kurve` 0.7 → 0.55), damit man sie hört. **Schleifen** +3 dB. Ducking beim harten Aufprall
  **-7 dB** (vorher -5).
- Baum, Holz, Weich, Felswand und Metall klingen wie vorher (nur lauter). Metall bleibt hell mit Nachklang.
- Neu hinter dem Limiter eine **Sicherheits-Decke** (bis 0.85 unverändert, nie über 0.965), weil die lauteren Aufpralle
  zusammen mit Vollgas und Drift sonst knapp an 0.98 kamen.
- Die Statistik „Aufpralle“ ist unverändert.

**6. Rückwärts-Heulen**: folgt jetzt der **Motordrehzahl** wie ein Zahnrad (Drehzahl / 60 x 5.5), statt dem Tempo. Beim
Rückwärtsfahren auf Asphalt (Bremse gehalten, 3500–4724/min) liegt es bei **320–434 Hz** (vorher bis **1360 Hz**). Es
ist ein Sinus mit etwas 2. Oberwelle durch einen Tiefpass bei 1.2 kHz (klingt nach Getriebe, nicht nach Pfeifen), etwas
lauter als vorher (0.06 statt 0.05), aber immer 6–11 dB leiser als der Motor.
**Abweichung vom Richtwert**: Der Richtwert war `heulenFaktor` 4. Mit den echten Rückwärts-Drehzahlen des Spiels (höchstens
4724/min) gäbe das nur 315 Hz; verlangt waren ca. 400–500 Hz. Darum **5.5**.

**7. Ton-Labor: Feinschliff** (`ton-labor.html`, unten): 15 Regler, jeder mit dem **Namen des Werts in `config.js`**,
der aktuellen Zahl und einem **Rücksetz-Knopf** (↺): Tonlage bei Höchstdrehzahl, Härte (Verzerrung), Rauheit,
Brabbeln, Helligkeit unter Gas, Anteil tiefes Brummen, Motor-Lautstärke, Knall-Chance, Pop-Lautstärke,
Schaltknall-Chance, Klack-Lautstärke, Aufprall Stein: Helligkeit, Aufprall-Lautstärke gesamt, Heulen-Faktor,
Signale-Pegel. Sie wirken **sofort** (Härte und Stein-Helligkeit bauen den betroffenen Teil neu). **WERTE KOPIEREN**
kopiert alle geänderten Werte als Text (`audio.motor.verzerrung = 6.2`, eine Zeile pro Wert) und zeigt ihn zusätzlich
im Feld darunter (falls der Browser das Kopieren nicht erlaubt: dort markieren und kopieren). **ALLES ZURÜCK** stellt
alles wie in `config.js`. Die Regler ändern **nur diese Seite** und nur bis zum Neuladen; das Spiel bleibt, wie es ist.
Neu im Labor ausserdem: Regler **Signaltöne**, Knöpfe **Ein Pop**, **Pop-Salve**, **Hochschalten**, **Runterschalten**,
und die Anzeige zeigt die Tonhöhe des Heulens.

### Messtabelle vorher (M7a) / nachher (M7a.1)

Offline gerechnet (`node tools/ton-messung.mjs vorher <alte Version>` und `… nachher`), Pegel vor dem Limiter bei Regler 100 %.

**Motor mit Vollgas (ohne Turbo)**

| U/min | Grundton | Schwerpunkt | Energie über 1 kHz | über 2.5 kHz | Spitze | RMS | A-bewertet |
|---|---|---|---|---|---|---|---|
| 1500 | 62.5 → 58.3 Hz | 128 → 221 Hz | 1.9 → 4.8 % | 0.2 → 1.4 % | 0.54 → 0.60 | -12.5 → -14.9 dBFS | +0.4 dB |
| 3000 | 125 → 142 Hz | 241 → 504 Hz | 4.2 → 12.4 % | 0.8 → 3.9 % | 0.52 → 0.55 | -12.1 → -14.2 dBFS | +1.2 dB |
| 5000 | 208 → 290 Hz | **381 → 822 Hz (x2.2)** | 8.3 → 19.4 % | **1.8 → 7.4 %** | 0.55 → 0.58 | -11.3 → -13.4 dBFS | +1.0 dB |
| 7000 | 292 → 462 Hz | 515 → 1157 Hz | 8.8 → 24.4 % | 3.4 → 9.1 % | 0.59 → 0.54 | -10.5 → -12.6 dBFS | +1.0 dB |
| 7200 | 300 → **480 Hz** | | | | | | |

Turbo gegen Motor (RMS): 5000/min **-21.0 → -18.8 dB**, 7000/min -21.6 → -19.5 dB (Turbo selbst unverändert).

**Aufprall** (Pegel = RMS der ersten 0.15 s, Material und tiefer Schlag zusammen)

| | Stein mittel (7 m/s) | Stein hart (16 m/s) | Metall hart |
|---|---|---|---|
| Schwerpunkt (Material allein) | 857 → **110 Hz** | 844 → **110 Hz** | 694 → 617 Hz |
| stärkste Spitze über 1 kHz | -3.8 → **-32.2 dB** | -3.9 → **-32.4 dB** | -6.3 → -6.3 dB |
| Ausklingen bis -40 dB | 0.47 → **0.19 s** | 0.47 → **0.19 s** | 1.01 → 1.13 s |
| Spitze | 0.56 → 1.45 | 0.99 → 2.36 | 1.07 → 2.01 |
| Pegel | -16.5 → -10.7 dBFS (+5.8) | -10.8 → -6.5 dBFS (+4.3) | -9.3 → -4.3 dBFS (+5.0) |

Alle Materialien mittel/hart: Baum +5.5/+4.9, Stein +5.8/+4.3, Holz +5.7/+5.2, Weich +5.4/+4.8, Metall +5.4/+5.0,
Felswand +6.0/+5.3 dB. Leichter Kontakt (1.5 m/s): -15 bis -21 dBFS (vorher -23 bis -33). Pop: Spitze 1.06 (73 % von
Stein mittel), 25 ms, Schwerpunkt ca. 2.5 kHz. Klack: Spitze 0.27, 45 ms.

**Signale gegen den Motor** (Motor bei 5000/min Vollgas mit Turbo: RMS -11.2 dBFS vorher, -13.4 dBFS nachher)

| Signal | Spitze vorher → nachher | gegen den Motor vorher → nachher | im Mix mit Ducking |
|---|---|---|---|
| Countdown / GO | 0.13 / 0.14 → 0.53 / 0.54 | -9.3 / -8.8 → **+5.2 / +5.4 dB** | +8.2 / +8.0 dB |
| Checkpoint (alle drei) | 0.12 → 0.55 | -14.1 → **+1.4 dB** | +4.6 dB |
| Verpasst | 0.11 → 0.53 | -10.4 → +5.3 dB | +8.1 dB |
| Pause / Weiter | 0.10 → 0.53 | -11.4 → +5.2 dB | +5.1 dB (kein Ducking) |
| Fanfare kurz / lang | 0.22 → 0.59 | -10.6 / -11.3 → +0.3 / -0.4 dB | +0.8 dB / lang auf dem Zielbildschirm +8.4 dB |
| Menü Bestätigen / Zurück / Fehler | 0.08–0.09 → 0.37 | -13 → +2 dB | (kein Motor im Menü) |
| Menü-Tick / Regler-Tick | 0.04 / 0.08 → 0.22 / 0.21 | -21 / -17 → -4 / -6 dB | |
| Pace-Signal | 0.05 → 0.22 | -19.7 → -4.3 dB | (soll Tippen bleiben) |

**Rückwärts-Heulen** (echte Rückwärtsfahrt im Spiel, Bremse gehalten): 3500/min **1360 Hz → 320 Hz**, 4724/min
(9 m/s, schnellstes Rückwärts) **1360 Hz → 434 Hz**; folgt der Drehzahl, nicht dem Tempo.

### Hörtest-Anleitung für Lino (M7a.1)

**Schritt 1: Ton-Labor** (`…/alpine-rally/ton-labor.html`, bei GitHub Pages vermutlich
`https://fralineel-kiesel.github.io/alpine-rally/ton-labor.html`), Lautsprecher nicht zu laut, **TON STARTEN**.
In dieser Reihenfolge anhören (Zustand „Rennen“):
1. **Motor bei drei Drehzahlen**: Gas 100 %, Drehzahl ca. 2000, 4500 und 7000. Hart und rauh? Oder schon kratzig/schrill?
2. **Hochdrehen**: Gas 100 %, den Drehzahl-Regler langsam von links nach ganz rechts ziehen. Steigt der Ton deutlich?
3. **Poppen**: „Pop-Salve“ ein paar Mal drücken. Dann echt: Drehzahl 5500, Gas 100 %, 1 s warten, Gas schnell auf 0.
4. **Schalten hoch**: Drehzahl 6500, Gas 100 %, „Hochschalten“ (Unterbrechung, Knall, Klack). **Runter**: Gas 0,
   Drehzahl 3000, „Runterschalten“ (Zwischengas, Klack). Und **„Anfahren bis 160 km/h“** (alle Gänge, dann ausrollen).
5. **Stein-Aufprall**: Stein leicht / mittel / hart. Dumpf genug? Dann zum Vergleich Metall und Baum.
6. **Signale gegen den Motor**: Drehzahl 5000, Gas 100 %, dann Countdown-Pieps, GO, Checkpoint, Fanfare kurz drücken.
   Kommen sie gut durch? Zu laut?
7. **Rückwärts**: Häkchen „Rückwärts“, Tempo 20 km/h, Drehzahl zwischen 3500 und 4700. Tief genug?

**Schritt 2: im Spiel**: Einmal die Etappe fahren (Schalten, Poppen vor den Kehren, Checkpoint-Ton bei Vollgas),
einmal in einen Stein und in die Leitplanke, rückwärts raus. EINSTELLUNGEN → TON → **SIGNALTÖNE** ausprobieren.

**Wenn X, dann Y** (die Werte findest du im Feinschliff mit genau diesem Namen):

| Wenn … | dann … | jetzt |
|---|---|---|
| Motor noch zu weich | `audio.motor.verzerrung` hoch, `audio.motor.filterGas` hoch, `audio.motor.unter` runter | 6 / 4500 / 0.16 |
| Motor zu schrill / kreischend | `audio.motor.hoechstTon` runter, `audio.motor.filterGas` runter | 480 / 4500 |
| Ton steigt zu wenig beim Hochdrehen | `audio.motor.hoechstTon` hoch (z. B. 550) | 480 |
| zu kratzig / zu viel Rauschen | `audio.motor.rauh` runter | 0.30 |
| zu wenig Brabbeln / zu viel | `audio.motor.amTiefe` | 0.40 |
| Motor zu laut / zu leise | `audio.motor.pegel` | 0.36 |
| poppt zu oft / zu selten | `audio.motor.knallChance` | 0.7 |
| Pops zu laut / zu leise | `audio.motor.popPegel` | 1.2 |
| Schaltknall zu oft | `audio.motor.schaltKnallChance` | 0.7 |
| Klack zu laut / zu leise | `audio.motor.klackPegel` | 0.3 |
| Schalten zu ruckelig (Motor fällt zu stark) | `audio.motor.schaltDip` hoch (z. B. 0.35) | 0.2 |
| Zwischengas beim Bremsen stört | `audio.motor.zwischengasOhneLast = false` | true |
| Stein noch zu hell / zu dumpf | `audio.aufprall.klang.stein.knall[2]` (Helligkeit, Hz) | 1700 |
| Aufpralle zu laut | `audio.aufprall.pegel` | 1.6 |
| Heulen zu hoch / zu tief | `audio.motor.heulenFaktor` | 5.5 |
| alle Signale zu laut / zu leise | Regler SIGNALTÖNE, oder `audio.signale.pegel` | 1.0 |
| Motor duckt sich zu stark unter den Signalen | `audio.signale.duckDb` näher an 0 | -3.5 |

**So schickst du mir deine Zahlen**: Im Ton-Labor unten im **Feinschliff** die Regler verstellen, bis es dir gefällt,
dann **WERTE KOPIEREN** drücken und den Text in den Chat einfügen (z. B. `audio.motor.verzerrung = 7.5`). Geht das
Kopieren nicht automatisch, steht der Text im Feld darunter: markieren, kopieren, einfügen. Werte, die nicht im
Feinschliff sind (z. B. `schaltDip`), schreibst du einfach dazu.

### Werte zum Drehen (`js/config.js`, Block `audio`) – neu und geändert

| Wert | Was | M7a → M7a.1 |
|---|---|---|
| `motor.hoechstTon`, `tonKurve` | Tonlage bei Höchstdrehzahl, Kurve dazwischen | (300) → 480 Hz, 1.3 |
| `motor.pegel` | Motor-Lautstärke | 0.5 → 0.36 |
| `motor.puls`, `pulsBreite` | Impulswelle (Kanten) statt Rechteck | Rechteck 0.28 → 0.45 / 0.16 |
| `motor.unter` | tiefes Brummen | 0.35 → 0.16 |
| `motor.hoch`, `hochAb`, `hochSchub` | Oktav-Schicht beim Hochdrehen | neu: 0.4 / 0.2 / 0.55 |
| `motor.amTiefe` | Brabbeln unter Last | 0.22 → 0.40 |
| `motor.rauh`, `rauhGuete`, `rauhPuls` | Rauheit, Bündelung, Pulsieren im Zündtakt | 0.10 → 0.30, 2 → 3, neu 0.85 |
| `motor.verzerrung`, `clip` | Härte | 1.8 → 6, neu 0.8 |
| `motor.filterGrund`, `filterDrehzahl`, `filterGas`, `filterQ` | Helligkeit | 240 / 0.30 / 1800 / 1.3 → 450 / 0.6 / 4500 / 1.6 |
| `motor.bissHz`, `bissDb`, `bissGuete` | Biss | neu: 2200 Hz / +5 dB / 1.1 |
| `motor.knallAb`, `knallChance`, `knallSperre` | Poppen ab, Chance, Ruhe danach | 4000 / 0.45 / 1.5 → 3500 / 0.7 / 1.0 |
| `motor.popAnzahl`, `popAbstand`, `popPegel`, `popStaerke`, `popTempo`, `pop` | Salve | neu (statt `knallZweiter`, `knallPegel`, `knall`) |
| `motor.knisternChance`, `knisternAnzahl`, `knisternFenster`, `knisternPegel` | leises Knistern | neu: 0.5 / 1–3 / 0.8 s / 0.16 |
| `motor.schaltLastAb`, `schaltOhneLast` | ab wann „unter Last“ / „ohne Last“ | neu: 0.5 / 0.2 |
| `motor.schaltDip`, `schaltDipZeit` | Zünd-Unterbrechung | neu: 0.2 / 0.007 s |
| `motor.schaltKnallChance`, `schaltKnallPegel`, `schaltBlowOff` | Schaltknall, lauterer Blow-off | neu: 0.7 / 1.25 / 1.3 |
| `motor.klackPegel`, `klackLeise`, `klack` | Getriebe-Klack | neu: 0.3 / 0.45 |
| `motor.zwischengasDauer`, `zwischengasStaerke`, `zwischengasOhneLast`, `zwischengasKnallChance` | Zwischengas | neu: 0.15 s / 0.9 / true / 0.35 |
| `motor.schaltTonSperre` | eigene Sperre für Schaltknall und Klack | neu: 0.15 s |
| `motor.heulenFaktor`, `heulenOberwelle`, `heulenFilter`, `heulenPegel` | Heulen | 280 Hz + 120 Hz pro m/s → 5.5 / 0.3 / 1200 Hz / 0.06 |
| `signale.*.pegel`, `signale.pegel`, `busse.signale` | Signal-Pegel | siehe Tabelle; 0.5 → 1.0; 0.8 → 1.0 |
| `signale.duckDb`, `duckDauer`, `duckZurueck` | Ducking für Signale | neu: -3.5 dB / 0.25 s / 0.1 |
| `aufprall.pegel`, `kurve`, `schlagPegel`, `duckDb`, `schleifenPegel` | Aufprall | 0.9 / 0.7 / 0.7 / -5 / 0.18 → 1.6 / 0.55 / 1.25 / -7 / 0.25 |
| `aufprall.klang.stein` | Stein-Klang (neu auch `schlagMit`, `pegel`, `kurve` je Material) | siehe oben |
| `decke.weich`, `decke.max` | Sicherheits-Decke hinter dem Limiter | neu: 0.85 / 0.965 |
| `menue.standard.signale` | Regler SIGNALTÖNE | neu: 100 % |

Turbo, Pause, Untergrund-Rollen, Quietschen, Wind, Klang der Menü-Töne und des Pace-Signals: **unverändert** (nur die
Pegel der Signale).

### So testest du

1. Ton-Labor nach der Hörtest-Anleitung oben (zuerst!).
2. Spiel: Taste drücken (Blip, jetzt lauter), EINSTELLUNGEN → TON: **LAUTSTÄRKE** und darunter **SIGNALTÖNE**. SIGNALTÖNE
   auf 0 % → Menü-Ticks weg, Motor im Rennen bleibt. Zurück auf 100 %.
3. STARTEN: Countdown-Pieps und GO klar über dem Motor? Fahren: Hochschalten (Unterbrechung + Klack, manchmal Knall),
   vor Kurven vom Gas (Pop-Salven), beim Bremsen runterschalten (Zwischengas).
4. Stein und Leitplanke (leicht und hart), rückwärts raus (Heulen tiefer).
5. Checkpoint bei Vollgas, Ziel mit Fanfare.

### Zahlen

- **Audio-Knoten** (dauerhaft angelegt): **69 → 77** (+8: Impulswelle statt Rechteck ±0, Oktav-Schicht 2, pulsierende
  Rauheit 2, Biss-Filter 1, Heulen-Tiefpass 1, Regler SIGNALTÖNE 1, Sicherheits-Decke 1). Pops, Klack und Schaltknall
  sind wie alle einmaligen Klänge kurzlebige Stimmen (höchstens 16 gleichzeitig, wie bisher).
- **Zeichenaufrufe (3D)**: 60 m / 1170 m / 2900 m **122 / 113 / 81 → 122 / 113 / 81** (unverändert).
- **Bildzeit mit / ohne Ton** (`node tools/m7a-leistung.mjs`, alle Ton-Schichten an): Median **250.0 / 249.9 ms** –
  gleich (Test-Rechner mit Software-Grafik, nur zum Vergleich). `tonBild()` kostet im Hauptthread **1.8 µs** pro Bild
  (M7a: 1.4 µs); pro Bild entstehen keine neuen Objekte.
- **Puffer-Aufbau nach dem Entsperren**: **123–148 ms** Rechenzeit in 15–18 Häppchen, längstes 9–11 ms (M7a: 114–158 ms) –
  zwei neue kleine Puffer (Pop, Klack), der alte Knall und ein Teil des Steins fallen weg. Einmal, als parallel ein
  zweiter Test lief, waren es 200 ms mit einem Häppchen von 17.5 ms.
- **Ladezeit** (`node tools/ladezeit.mjs`, 9 Ladungen abwechselnd, Median alt → neu): **1484 → 1530 ms**. Das liegt im
  Rauschen dieser Messung (in M7a schwankte sie zwischen 1409 und 1522 ms); beim Laden wird kein Ton gebaut.
- **Spitzenpegel**: alles zugleich (Vollgas am Begrenzer, Drift, Schleifen, zwei harte Aufpralle, Fanfaren, Signale, Pops,
  Blow-off) **0.949**; harter Aufprall + Vollgas + Drift **0.90–0.95** je Material; alle Motor-Schichten zugleich 0.91.
  Grenze 0.98.

### Bilder (`screenshots/m7a-1/`)

- **Spektrogramme vorher / nachher** (`node tools/ton-messung.mjs …`; Zeit nach rechts, Tonhöhe nach oben, hell = laut):
  `vorher-` / `nachher-motor-3000`, `-motor-5000`, `-motor-7000`, `-stein-mittel`, `-stein-hart`, `-pop-salve`,
  `-schalten-hoch`, `-schalten-runter`, `-heulen`.
- `30-einstellungen-lautstaerke-signaltoene` (+ `-320x180`), `31-einstellungen-signals-englisch` (+ `-320x180`)
  (`node tools/m7a1-bilder.mjs`)
- `21-ton-labor-feinschliff` (Ton-Labor mit Feinschliff, zwei Werte geändert, WERTE KOPIEREN gedrückt)
- `10-…` bis `16-…`: die Spektrogramme aus dem Ton-Test (wie in M7a, jetzt mit dem neuen Klang)

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/audio.js` | Motor neu (Tonkurve `motorTon`, Impulswelle, Oktav-Schicht, pulsierende Rauheit, harte Sättigung, Biss), Pops, Salven, Knistern, Schalten (Zünd-Unterbrechung, Schaltknall, Klack, Zwischengas), Ducking für Signale, Regler SIGNALTÖNE, Stein ohne grossen Schlag, Heulen nach Drehzahl, Sicherheits-Decke, `neuBauen` fürs Labor; Puffer mit eigener Zufallsfolge |
| `js/config.js` | Block `audio` (siehe Tabelle), `menue.standard.signale`, Version 0.7a.1 |
| `js/einstellungen.js`, `js/menueseiten.js`, `js/texte.js` | Regler SIGNALTÖNE (gespeichert, Texte de/en) |
| `js/main.js` | gibt dem Ton zusätzlich den Ziel-Gang (für rauf/runter) und den Regler SIGNALTÖNE; sonst unverändert |
| `ton-labor.html`, `js/tonlabor.js` | Feinschliff, WERTE KOPIEREN, ALLES ZURÜCK, Regler Signaltöne, Pop-, Salve-, Hoch-/Runterschalten-Knöpfe |
| `tools/ton-test.mjs`, `tools/ton-pruefung.js` | Teil 1 (M7a, angepasst) und Teil 2 (M7a.1 (a)–(l)); neue Messhilfen (Spektrum, Schwerpunkt, A-Pegel, Hüllkurve, Verlauf) |
| `tools/ton-messung.mjs`, `tools/ton-messung-vorher.json`, `tools/ton-messung-nachher.json` | **neu**: Messung vorher/nachher mit Spektrogrammen |
| `tools/m7a1-bilder.mjs` | **neu**: Bilder der Einstellungen |

### Selbst getestet

- **`node tools/ton-test.mjs` – alle 212 Prüfungen bestanden**, keine Konsolenfehler.
  - **Teil 1 = die M7a-Tests (a)–(k)** laufen weiter. **Angepasst habe ich**: der Soll-Grundton kommt aus der neuen Kurve
    (`motorTon`) statt Drehzahl / 60 x 2.5; „Knallen höchstens 2“ ist jetzt „Salven 1–4 Pops ab 3500/min“; das Heulen wird
    nach Drehzahl statt Tempo geprüft; der Wucht-Test nimmt den Baum statt den Stein (der Stein hat keinen grossen Schlag
    mehr) und erwartet hart > 2.5 x leicht statt 3 x (leichte Kontakte sind lauter); Ducking -7 statt -5 dB; im
    Offline-Teil Pop und Klack statt Knall; die Spektrogramme gehen nach `screenshots/m7a-1/`. Alles andere ist gleich.
  - **Teil 2 = M7a.1 (a)–(l)**:
    (a) Grundton bei 1000/1500/3000/5000/7000/7200 genau auf der Soll-Kurve (0.00 %), **480 Hz** oben, 41.7 Hz im
    Leerlauf, steigt von 600 bis 7900/min bei jedem 10er-Schritt.
    (b) Härte bei allen vier Drehzahlen: Schwerpunkt x1.7 / x2.1 / **x2.2** / x2.2, Energie über 2.5 kHz x2.7–x7, RMS
    -2.1 bis -2.4 dB (höchstens +1 erlaubt), Spitze 0.54–0.60, kein NaN, keine Gleichspannung; alle Motor-Schichten
    zugleich 0.91.
    (c) Turbo-Werte genau wie M7a, Turbo gegen Motor -21.0 → -18.8 dB (besser).
    (d) 200 Mal Gas weg: Salve in **67 %** (Chance 70), Verteilung 1/2/3/4 Pops = 32/47/25/30, Abstände 40–140 ms,
    Knistern 53 %, gleich gefahren = gleich gepoppt, unter 3500/min nie, Sperre hält, ohne Last vorher nie; Pop-Spitze
    73 % von Stein mittel, 25 ms, 2.5 kHz.
    (e) Hochschalten unter Last: Motor 100 % → **18 %** (nach 33 ms unter 30 %) → zurück; Schaltknall in 72 % von 120
    Schaltungen; Blow-off x1.30; Klack genau im ersten Bild nach der Schaltpause; ohne Last nur leises Klack;
    Runterschalten mit Zwischengas (7.1 kHz statt 3–4.6 kHz Helligkeit direkt danach) und Klack; echtes Getriebe
    0 → 160 km/h → 20 km/h: 7 Gangwechsel, 7 Klacks.
    (f) alle 16 Signale im Zielbereich; alle Renn-Signale im Mix bei Vollgas lauter als der Motor (+0.8 bis +8.2 dB,
    lange Fanfare auf dem Zielbildschirm +8.4 dB); Ducking 3.5 dB bei Countdown, GO, Checkpoint, Verpasst, Fanfare,
    keines bei Menü, Pace, Pause.
    (g) SIGNALTÖNE quadratisch (50 % = 0.25), Master unverändert, Standard 100, gespeichert, nach Neuladen gleich, alter
    Speicher = 100, steht direkt unter LAUTSTÄRKE, Pfeil links = 65 % mit Tick, 0 % = alles stumm.
    (h) Stein mittel/hart 110 Hz, 0.19 s, keine Spitze über 1 kHz über -32 dB; Metall wie M7a (±15 %); alle Materialien
    +4.3 bis +6.0 dB; harter Aufprall lauter als Motor und alle Signale; leichter Kontakt -15 bis -21 dBFS; mit Vollgas
    und Drift Spitze 0.90–0.95; Ducking -7.0 dB; der Limiter ist nach 0.27–0.37 s wieder wie vorher, das Ducking erst
    nach 0.65 s – also kein zusätzliches Einbrechen.
    (i) Heulen = Drehzahl / 60 x 5.5 (genau), gleiche Drehzahl = gleiche Tonhöhe bei 3 und 8 m/s, echte Rückwärtsfahrt
    320–434 Hz, nur rückwärts, 6–11 dB leiser als der Motor.
    (j) Ton-Labor: 15 Feinschliff-Regler wirken sofort (Tonlage 480 → 560 Hz, Sättigung neu, Stein-Puffer neu, …),
    WERTE KOPIEREN im richtigen Format, ALLES ZURÜCK = config.js, `CONFIG.audio` im Spiel unverändert.
    (k) Pause während einer Pop-Salve: alles stumm; Hauptmenü stumm, keine Stimme hängt. (Dazu Teil 1 (f).)
    (l) Stimmen-Limit, Lecks, Texte, Pixelschrift: Teil 1 (h) und (k), neue Texte de/en drin.
- **Alle bisherigen Tests bestanden** (unverändert): `testfahrer` **2:59.33 / 2:42.35 / 2:31.92**,
  `abkuerzungen --pruefen` **127 / 2 / 342 / 84**, `overlay-test`, `menue-test`, `rennablauf-test` (Statistik
  Aufpralle/Resets/Höchsttempo), `aufprall`, `belag`, `felswand`, `felswand-sprites`, `getriebe`, `gras`, `handbremse`,
  `kuh`, `leben`, `lenk`, `nebenweg`, `pacenotes`, `rueckwaerts`, `startziel`, `strassenrand`. Strecke, Physik,
  Kollisionsrechnung, Sperren, Abkürzungen, Pace-Notes, Checkpoints, Rennzeit, Fahrspur, Bestzeiten nicht angefasst;
  „mit und ohne Ton genau gleich“ (Teil 1 (d)) besteht weiter.

### Ehrlich beurteilt – wo ich am unsichersten bin

- **Nicht gehört.** Die Ziele sind gemessen erreicht (Schwerpunkt x2.2, Tonlage 480 Hz, Stein ohne Eigentöne über 1 kHz,
  Signale über dem Motor), aber ob es gut klingt, weiss ich nicht.
- **Motor „hart“ oder schon „Fuzz-Gitarre“?** Die Sättigung schneidet bei Vollgas fast die ganze Welle ab. Das gibt Kanten,
  kann aber auch nach verzerrtem Synthesizer klingen. **Das solltest du zuerst anhören** (Labor Punkt 1 und 2). Zu viel:
  `verzerrung` 4, `clip` 0.9.
- **480 Hz oben**: Bei 7000/min ist der Grundton fast eine Oktave höher als echt. Das kann „ruhig kreischen“ oder nerven.
- **Pops**: Die Vorgabe „Spitze ca. 80 % eines mittleren Aufpralls“ gilt jetzt gegen die **lauteren** Aufpralle – ein
  Pop ist damit vor dem Limiter so laut wie früher ein harter Aufprall (1.06). Der Limiter fängt es ab, aber die Pops
  könnten zu laut oder zu spitz sein. Mit 70 % Chance und bis zu 4 Pops könnte es auch **zu oft** sein.
- **Schalten zu ruckelig?** Der Motor fällt beim Hochschalten auf 20 % – das ist sehr deutlich (0.28 s lang).
- **Kompromiss Härte gegen Pegel**: Härter = mehr Höhen = klingt lauter. Ich habe den Motor im gemessenen Pegel 2 dB
  leiser gemacht, damit er gefühlt (A-bewertet) etwa gleich laut bleibt (+0.4 bis +1.2 dB). Der Turbo kommt dadurch
  etwas besser durch (+2 dB).
- **Kompromiss Signale**: Die kurze Fanfare ist bei Vollgas nur knapp lauter als der Motor (+0.8 dB im Mix), weil sie viele
  Pausen hat und die Spitze bei 0.6 bleiben sollte. Die lange Fanfare kommt erst auf dem Zielbildschirm (Motor im Leerlauf,
  +8.4 dB); bei Vollgas wäre sie 0.4 dB leiser als der Motor. Menü-Tick, Regler-Tick und Pace-Signal sind absichtlich
  leiser als der Motor (Vorgabe 0.2–0.25).
- **Aufpralle +5 dB**: Vor dem Limiter kommen harte Aufpralle jetzt auf 2.0–2.6. Der Limiter drückt dann das ganze
  Bild bis ca. 0.3 s lang zusammen – das liegt innerhalb des Duckings (Motor ist dann sowieso 7 dB leiser), aber man
  könnte ein kurzes „Pumpen“ hören.

### Bekannte Probleme

- Wie in M7a: Gamepad allein entsperrt den Ton nicht (Browser-Regel).
- Das Zwischengas kommt auch beim Bremsen ohne Gas (bewusst, siehe oben).
- Im Test-Rechner (Software-Grafik, stummes Ausgabegerät) gemessen; auf echten Rechnern kann der Puffer-Aufbau anders
  lange dauern (nie ein Stück über ca. 12 ms am Stück).
- Im Ton-Labor kopiert der Browser manchmal nicht automatisch in die Zwischenablage (z. B. ohne https) – dann steht der
  Text im Feld darunter.

### Ideen/Vorschläge (nicht umgesetzt)

- Motor leicht **stereo** und **Abstand** (aus M7a, passt zu M7b).
- **Kies prasselt** gegen den Unterboden auf Schotter (aus M7a).
- Fanfare je nach Platz leicht anders (aus M7a).
- Pops und Schaltknall **leicht nachhallend** in Kehren mit Felswand (Echo), sonst trocken.
- Feinschliff-Werte im Labor **als Link teilen** (Werte in der Adresse), damit du nicht kopieren musst.
- Ein Regler **EFFEKTE** (Motor, Reifen, Aufprall) zusätzlich zu SIGNALTÖNE, falls der Motor im Verhältnis zur Musik (M7b) zu laut ist.

---

## Meilenstein 7a: Ton (Motor, Reifen, Aufprall, Signale) plus zwei HUD-Korrekturen ✅ (Verlauf, Stand damals – Motor, Knallen, Schalten, Signal-Pegel, Stein, Heulen seit M7a.1 anders)

> **Ehrlich vorneweg: Ich kann nicht hören.** Alles hier ist nach **Zahlen und Bildern** beurteilt (Tonhöhen, Pegel,
> Filter, offline gerechnete Klänge, Spektrogramme), **nicht gehört**. Ob der Motor nach Gruppe B klingt oder nach
> Staubsauger, kannst nur du entscheiden. Darum gibt es das **Ton-Labor** und unten eine **Hörtest-Anleitung**.

### Was ist neu?

**Teil 0: zwei HUD-Korrekturen**
- **Minimap kleiner**: Tafel **49 x 49** Pixel statt 61 x 61 (gut 20 % kleiner; 49 statt 48, weil die Zahl ungerade
  sein muss, damit das Auto genau in der Mitte steht). **Gleich viel Detail**: gleich viele Pixel pro Meter, dafür
  reicht der Ausschnitt jetzt **95.6 m** statt 120 m weit. Position und alle anderen Regeln wie in M6.1.
- **Checkpoint-Punkte unter der Zeit in Farbe**: Ein erreichter Punkt ist **grün** (an diesem Checkpoint schneller als
  die Referenz), **rot** (langsamer) oder **gelb** (gleich schnell oder keine Referenz). Es ist **dieselbe
  Entscheidung** wie bei der Meldung „CP 1 …“ (wird einmal gerechnet und gemerkt). Die Farbe bleibt den ganzen Lauf
  stehen, auch mit ausgeschaltetem Live-Vergleich. Noch nicht erreichte Punkte bleiben leer, die Minimap-Striche wie
  bisher.

**Teil 1–6: Ton** – alles im Code erzeugt (Web Audio: Oszillatoren, Rauschen, Filter, Verstärker), **keine Dateien,
keine Samples**. Der Ton **liest nur** Zahlen aus dem Spiel und ändert nie etwas (Zeiten, Statistik, Physik sind mit
und ohne Ton auf den Millimeter gleich).

- **Wann gibt es Ton?** Erst nach dem **ersten Tastendruck oder Mausklick auf dem Titel** („TASTE DRÜCKEN“) – vorher
  erlauben Browser keinen Ton. Die Demo-Fahrt hinter dem Menü ist **stumm**, im Menü gibt es nur **Klicks**.
  Mit `?ton=aus` in der Adresse gibt es nie Ton (und mit `?menue=aus`, das brauchen die Tests).
- **Motor (5-Zylinder-Turbo wie die Gruppe-B-Autos)**: Der Grundton folgt der Drehzahl (Leerlauf ca. 42 Hz, bei
  7200/min 300 Hz), gebaut aus Sägezahn + Rechteck + einem Brummen auf dem halben Ton (das typische 5-Zylinder-„Brabbeln“),
  leicht verzerrt und gefiltert. **Mit Gas lauter und heller**, ohne Gas leiser und dumpfer (Motorbremse).
  **Turbo**: leises Pfeifen, das dem Gas mit Verzögerung folgt (ca. 0.4 s hoch, 0.6 s runter), erst ab ca. 3000/min.
  **Blow-off**: kurzes Zischen, wenn du bei Ladedruck **schnell** vom Gas gehst und beim Schalten unter Last.
  **Knallen**: beim Gaswegnehmen über 4000/min **manchmal** ein Knall (ca. jedes zweite Mal, höchstens 2, danach 1.5 s
  Ruhe; immer gleich bei gleichem Fahren). **Begrenzer**: hängst du mit Vollgas an der Höchstdrehzahl, stottert der
  Motor (13 Mal pro Sekunde). **Schalten**: in der Schaltpause fällt der Ton hörbar (ca. 35 %) und der Motor wird ohne
  Last leiser. **Leerlauf**: tief und etwas unregelmässig. **Rückwärts**: dazu ein leises Getriebeheulen.
  **Im Countdown** läuft der Motor im Leerlauf – Gas ändert nichts (das Auto ist ja gesperrt).
- **Reifen und Untergrund**: Asphalt **surrt** (heller mit dem Tempo), Schotter **knirscht** (viele kleine Knackser),
  Bankett, Gras und Wiesenweg **rauschen weich** (Gras am dumpfsten). Beim Wechsel wird in ca. 0.15 s übergeblendet.
  **Quietschen** nur auf Asphalt, ab ca. 8° Drift oder mit Handbremse bei Tempo; auf Schotter, Bankett, Gras,
  Wiesenweg stattdessen ein lauteres **Rutschen/Kies-Knirschen**. **Handbremse ziehen** = kurzes Ratschen.
- **Fahrtwind**: ganz leises Rauschen, wächst mit dem Quadrat des Tempos, ab ca. 120 km/h heller.
- **Aufprall**: jeder Kontakt ab 1.5 m/s macht ein Geräusch, je härter, desto lauter und heller, ab ca. 22 km/h
  mit tiefem Schlag. **Je Material**: Baum (dumpf, Rascheln), Stein/Fels (hartes Klacken), Holz (Zaun, Wegweiser,
  liegende Stämme: Splittern), Weich (Strohballen, Reifen, Band, Heu, Kühe: dumpf), Metall (Leitplanke, Schilder,
  Wracks: Scheppern mit Nachklang), **Felswand** (dumpfer Schlag und Schleifen). Die **unsichtbaren Grenzen** machen
  **keinen** Ton (wie bei der Statistik). Eigene Sperre 0.1 s, damit es nicht rattert. Rutschst du an Wand,
  Leitplanke oder Zaun entlang (über 2 m/s), hörst du ein **Schleifen**. Bei einem harten Aufprall werden Motor und
  Umgebung kurz **5 dB leiser** („Ducking“), damit der Knall durchkommt. Die **Statistik „Aufpralle“ ist davon
  unabhängig** und zählt genau wie seit M5b.
- **Signale** (kurz, Retro-Stil): Menü: Auswahl = leises **Tick**, Bestätigen = höherer **Blip**, Zurück = tieferer
  Blip, Regler = Tick mit **Tonhöhe je nach Wert** (bei LAUTSTÄRKE hörst du gleich die neue Stärke), Fehler („SCHON
  BELEGT“, „RESERVIERT“) = tiefer **Buzz**. Pause = kurzer tiefer Ton, Weiter = kurzer hoher Ton.
  **Countdown**: drei Pieps genau beim Erscheinen von 3, 2, 1, bei **GO** ein höherer, längerer Ton.
  **Checkpoint**: „Ding-Ding“ – **aufsteigend** = schneller, **leicht absteigend und tiefer** = langsamer, **gleich
  hoch** = gleich / keine Referenz (dieselbe Entscheidung wie Meldung und Punkt). „CHECKPOINT VERPASST“ = tiefer Buzz.
  **Ziel**: kurze **Fanfare** (ca. 2 s) beim Überfahren der Ziellinie; bei **NEUER BESTZEIT** zum Zielbildschirm
  zusätzlich eine längere, festlichere (ca. 3.5 s). Beide Melodien sind eigene Erfindungen.
  **Pace-Notes**: ein leises, kurzes „Tipp“ (1.2 kHz, 50 ms) **pro neuer Kachel** (nicht beim Wegblenden, nicht mit
  Ansagen aus, nicht in der Demo; auch nicht bei ausgeblendetem HUD, Taste H).
- **Pause**: Motor stumm, Reifen und Wind dumpf (Tiefpass 800 Hz) und leiser. **Neustart / Hauptmenü**: alles
  blendet weich aus, nichts bleibt hängen. **Zielbildschirm**: das Auto rollt aus, der Motor geht in den Leerlauf und
  blendet aus, wenn es steht. **Tab versteckt / Fenster ohne Fokus**: der Ton wird angehalten, beim Zurückkommen geht
  er weiter.
- **Regler LAUTSTÄRKE** (EINSTELLUNGEN → TON) wirkt jetzt sofort auf alles, **quadratisch** (50 % = ein Viertel der
  Leistung, das fühlt sich gleichmässig an), 0 % = stumm. Der Hinweis darunter heisst jetzt „GILT FÜR DEN GANZEN TON“
  („APPLIES TO ALL SOUND“). Den Regler MUSIK gibt es erst in M7b.

### Wie der Ton aufgebaut ist (Stand M7a; seit M7b mit Umgebung und Musik, siehe M7b oben)

```
master (Regler LAUTSTÄRKE, quadratisch) -> Limiter (nichts übersteuert) -> Lautsprecher
  fahrzeug: Motor + Reifen (über das Ducking), Aufprall, Schleifen
  umgebung: Fahrtwind – mit Pausen-Tiefpass und Ducking; seit M7b auch Kuhglocken, Publikum, Vögel, Brunnen, Böen
  signale:  Menü, Pause, Countdown, Checkpoint, Ziel, Pace-Notes
  musik:    seit M7b die Menü-Musik mit eigenem Regler MUSIK
```

- **Dauerklänge** (Motor, Reifen, Wind, Quietschen, Schleifen) laufen immer und werden nur lauter/leiser gestellt –
  **weich** nachgeführt, nie gesprungen (kein Knacken). Es gibt genau **einen** Motor.
- **Einmalige Klänge** (Aufprall, Knall, Zischen, Ratschen, Fanfaren) und das Rauschen werden **nach dem Entsperren
  einmal berechnet**, in kleinen Häppchen (jedes unter ca. 10 ms, damit das Spiel nicht ruckelt), und dann immer
  wieder abgespielt. Beim Laden der Seite passiert nichts (die Ladezeit bleibt gleich).
- **Höchstens 16 einmalige Klänge** gleichzeitig (`audio.maxStimmen`), ältere werden ausgeblendet.
- Neue Dateien: `js/audio.js` (alles zum Ton), `ton-labor.html` + `js/tonlabor.js` (Labor). Das Spiel gibt dem Ton
  einmal pro Bild die Zahlen (Drehzahl, Gang, Schaltpause, Pedale, Tempo, Untergrund, Drift, Handbremse, Aufprall)
  und meldet Ereignisse (Countdown, Checkpoint, Ziel, Pause, Menü) an den Stellen, wo sie sowieso passieren.

### Hörtest-Anleitung für Lino

**Schritt 1: Ton-Labor öffnen** (eine Hilfsseite, nicht im Menü verlinkt): dieselbe Adresse wie das Spiel, aber am
Ende `ton-labor.html` statt `index.html`, also **`…/alpine-rally/ton-labor.html`** (bei GitHub Pages vermutlich
`https://fralineel-kiesel.github.io/alpine-rally/ton-labor.html`). Lautsprecher nicht zu laut, dann **TON STARTEN**
klicken. Rechts siehst du Pegel-Balken (rot = sehr laut, der Limiter fängt es ab).

**Schritt 2: im Labor anhören** (Zustand oben links auf „Rennen“ lassen):
1. **Motor bei drei Drehzahlen**: Gas auf 60 %, Drehzahl auf ca. 1000, 3000 und 6000 stellen. Klingt es tief und rauh
   wie ein Rallye-Fünfzylinder, oder eher wie ein Rasenmäher / Staubsauger / Synthesizer?
2. **Last**: bei 5000/min Gas zwischen 0 und 100 % schieben: unter Last heller und lauter, ohne Gas dumpfer?
3. **Turbo**: Drehzahl 5000, Gas 100 %, 1–2 s warten: hörst du ein leises Pfeifen? Zu laut / zu leise / zu hoch?
4. **Blow-off** und **Knall**: die Knöpfe drücken. Dann echt: Gas auf 100 %, warten, Gas schnell auf 0 schieben
   (Zischen, manchmal Knall).
5. **Schalten**: Knopf „Schalten“ bei ca. 6000/min. Und **„Anfahren bis 160 km/h“**: das echte Getriebe schaltet
   durch alle Gänge, danach rollt das Auto aus (Blow-off, Knallen, Motorbremse). **Das ist der wichtigste Test.**
6. **Begrenzer**: Drehzahl ganz nach rechts, Gas 100 %: Stottern?
7. **Untergründe**: Tempo 80 km/h, Untergrund durchschalten (Asphalt, Bankett, Gras, Schotter, Wiesenweg).
8. **Quietschen**: Asphalt, Tempo 80, Driftwinkel auf 20°. Dann Schotter mit Drift (Knirschen statt Quietschen).
   Handbremse an/aus (Ratschen).
9. **Rückwärts**: Häkchen „Rückwärts“, Tempo 20 km/h (Heulen).
10. **Aufprall je Material**: alle Knöpfe leicht / mittel / hart. Klingt Metall nach Leitplanke, Baum nach Holz?
    „Schleifen an“ auf Metall und Tempo 40: Schleifen an der Leitplanke.
11. **Signale**: Countdown-Pieps, GO, die vier Checkpoint-Töne, Fanfare kurz und lang, Pace-Note-Signal, Menü-Töne.
12. **Pause**: Zustand auf „Pause“ stellen (Motor weg, Reifen dumpf), zurück auf „Rennen“.

**Schritt 3: im Spiel fahren**:
- Titel: Taste drücken (Blip). Im Menü hoch/runter (Tick), EINSTELLUNGEN → LAUTSTÄRKE links/rechts (Tick wird
  leiser/lauter). Ist der Menü-Tick zu laut oder nervig?
- STARTEN: **Countdown** – kommen die drei Pieps genau mit 3, 2, 1 und der hohe Ton genau mit GO? Gas im Countdown
  drücken: der Motor darf nicht hochdrehen.
- Fahren: Schalten hörbar? Turbo/Zischen beim Gaswegnehmen in die Kurve? Knallt es zu oft?
- **Checkpoint 1**: Ding-Ding. Fahre zweimal: einmal schneller (aufsteigend, Punkt grün), einmal langsamer (absteigend,
  Punkt rot).
- Einmal leicht und einmal hart in die Leitplanke, in einen Baum, an die Felswand. Kurz auf Schotter / Gras.
- **Esc** (Pause): Motor weg, Rest dumpf? Nochmals Esc: alles wieder da?
- Ziel: Fanfare. Mit neuer Bestzeit: lange Fanfare zum Zielbildschirm.
- Auf beiden Rechnern (Lenovo und Gaming-PC) einmal kurz: ruckelt etwas, seit es Ton gibt?

**Am ehesten nachbessern muss man vermutlich**: den **Motor** (Charakter, Rauheit, Lautstärke im Verhältnis), den
**Turbo** (Höhe und Pegel), das **Knallen** (Häufigkeit, Klang), die **Aufprall-Klänge** (vor allem Holz und Metall)
und die **Fanfaren** (Melodie, Tempo, Lautstärke).

### Werte zum Drehen (`js/config.js`, Block `audio`)

| Wenn … | dann … | heute |
|---|---|---|
| alles zu laut / zu leise | Regler LAUTSTÄRKE, oder `audio.busse.fahrzeug`, `umgebung`, `signale` | 1.0 / 1.0 / 0.8 |
| Motor zu laut / zu leise | `audio.motor.pegel` | 0.5 |
| Motor zu dumpf / zu hell | `audio.motor.filterGrund`, `filterDrehzahl`, `filterGas` (Hz) | 240 / 0.30 pro U/min / 1800 |
| Motor zu sauber / zu kratzig | `audio.motor.verzerrung` (1 = sauber), `rauh` | 1.8 / 0.10 |
| zu wenig / zu viel „Brabbeln“ | `audio.motor.unter`, `amTiefe`, `amTiefeLeerlauf`, `leerlaufZittern` | 0.35 / 0.22 / 0.42 / 0.01 |
| Motorbremse (ohne Gas) zu leise | `audio.motor.schubPegel` | 0.42 |
| **Turbo zu laut** | `audio.motor.turboPegel` kleiner | 0.035 |
| Turbo zu hoch / zu tief | `audio.motor.turboTonMin`, `turboTonMax` (Hz) | 2200 / 5200 |
| Turbo zu träge / zu flink | `audio.motor.turboRauf`, `turboRunter` (Sekunden) | 0.4 / 0.6 |
| Blow-off zu laut / zu lang / zu hell | `audio.motor.blowOffPegel`, `blowOffDauer`, `blowOffTon` | 0.16 / 0.3 s / 2600 Hz |
| **Knallt zu oft** | `audio.motor.knallChance` kleiner (0..1), `knallZweiter`, `knallSperre` grösser | 0.45 / 0.35 / 1.5 s |
| Knall zu laut | `audio.motor.knallPegel` | 0.32 |
| Begrenzer nervt | `audio.motor.begrenzerTiefe` kleiner, `begrenzerAb` höher | 0.85 / 6850 |
| Rückwärts-Heulen | `audio.motor.heulenPegel` | 0.05 |
| Reifen je Untergrund | `audio.reifen.belaege.<belag>.pegel`, `.grenze` (Helligkeit) | z. B. Asphalt 0.10 / 160 Hz |
| Quietschen zu früh / zu laut | `audio.reifen.quietschAb` (Grad), `quietschPegel` | 8° / 0.09 |
| Quietschen zu schrill | `audio.reifen.quietschTon` (Hz) | 900–1400 |
| Kies-Rutschen | `audio.reifen.rutschPegel` | 0.22 |
| Handbremsen-Ratschen | `audio.reifen.ratschPegel` | 0.12 |
| Wind | `audio.wind.pegel`, `hellAb` (m/s) | 0.05 / 33 |
| Aufprall zu laut | `audio.aufprall.pegel`, `schlagPegel` | 0.9 / 0.7 |
| Aufprall schon bei kleinen Kontakten | `audio.aufprall.ab` (m/s) | 1.5 |
| Klang eines Materials | `audio.aufprall.klang.<material>` (Eigentöne, Rascheln, Schlag, Länge) | |
| welches Hindernis welches Material | `audio.aufprall.artVon` | |
| Ducking zu stark | `audio.aufprall.duckDb` (näher an 0) | -5 dB |
| Schleifen | `audio.aufprall.schleifenPegel` | 0.18 |
| Signale allgemein | `audio.signale.pegel` | 0.5 |
| Menü-Tick zu laut | `audio.signale.menue.tick.pegel` | 0.10 |
| Countdown-Pieps / GO | `audio.signale.countdown`, `go` (Ton, Dauer, Pegel) | 440 Hz / 880 Hz |
| Checkpoint-Töne | `audio.signale.checkpoint.schneller`, `langsamer`, `neutral` (Hz) | |
| Pace-Note-Signal | `audio.signale.paceNote.pegel`, `ton` | 0.12 / 1200 Hz |
| Fanfaren | `audio.signale.fanfare.pegel`, `tempo`, `kurz`/`lang` (Noten) | 0.3 / 165 |
| Pause zu dumpf | `audio.pause.filter` (Hz), `pegel` | 800 / 0.45 |
| Regler-Kurve | `audio.lautKurve` (2 = quadratisch, 1 = gerade) | 2 |
| kein Ton | `audio.an = false` (oder `?ton=aus` in der Adresse) | an |
| Minimap-Grösse / Zoom | `hud.minimap.groesse` (ungerade), `sichtMeter` | 49 / 95.6 m |

### So testest du

1. Zuerst das **Ton-Labor** (siehe Hörtest-Anleitung).
2. Spiel öffnen: vor dem Tastendruck ist es still, danach Blip und Menü-Ticks. Die Demo-Fahrt bleibt stumm.
3. STARTEN, Countdown, fahren, Checkpoint 1, Pause, Weiter, ins Ziel (siehe oben).
4. Zweite Fahrt: unter der Zeit stehen die Checkpoint-Punkte jetzt **grün** oder **rot**. Die **Minimap** oben rechts
   ist kleiner (49 x 49). Frage: Ist sie gut so, oder zu klein?

### Zahlen

- **Zeichenaufrufe (3D) vorher → nachher**: 60 m **122 → 122**, 1170 m **113 → 113**, 2900 m **81 → 81** (Ton und
  HUD bringen keine 3D-Objekte).
- **Ladezeit** (`node tools/ladezeit.mjs`, 2 x 9 Ladungen, Median alt → neu): **1522 → 1409 ms** und **1429 →
  1455 ms** – kein messbarer Unterschied (Budget +30 ms; beim Laden wird nur ein leeres Ton-Objekt angelegt).
- **Puffer-Aufbau nach dem Entsperren**: **114–158 ms** Rechenzeit in 14–19 Häppchen, **längstes 8.7–10.2 ms**,
  fertig **ca. 170–240 ms** nach dem Tastendruck (im Testrechner mit Software-Grafik; auf echten Rechnern schneller).
- **Bildzeit mit / ohne Ton** (`node tools/m7a-leistung.mjs`, alle Ton-Schichten an): Median **233.4 / 233.4 ms** –
  gleich. (Im Testrechner rendert die Grafik in Software, darum so langsam; die Zahl taugt nur zum Vergleich.) Der
  Ton kostet im Hauptthread **1.4 µs pro Bild**; der Klang selbst wird vom Browser in einem eigenen Thread gerechnet.
  Pro Bild entstehen keine neuen Objekte.
- **Spitzenpegel** bei allem zugleich (Vollgas am Begrenzer, Drift, Schleifen, zwei harte Aufpralle, beide
  Fanfaren, Signale, Knall, Blow-off): **0.941–0.944** (mehrere Läufe) – der Limiter hält, nichts übersteuert (Grenze 0.98).

### Bilder (`screenshots/m7a/`; Spielbilder 1280x720 und `-320x180`; neu: `node tools/m7a-bilder.mjs`, Spektrogramme: `node tools/ton-test.mjs`)

- `00-minimap-alt-neu` (M6.1 gegen M7a an den Kehren und auf dem Almweg, 4fach vergrössert)
- `01-hud-punkt-gruen` (CP 1 schneller), `02-hud-punkte-gruen-rot` (CP 1 grün, CP 2 rot, Meldung rot), `03-minimap-kehren`
- `04-einstellungen-lautstaerke` (Hinweis „GILT FÜR DEN GANZEN TON“), `05-einstellungen-lautstaerke-englisch`
- `06-ton-labor` (die Labor-Seite)
- Spektrogramme (Zeit nach rechts, Tonhöhe nach oben, hell = laut): `10-…-motor-1000`, `-3000`, `-6000`,
  `11-…-blowoff`, `12-…-aufprall-baum`, `13-…-aufprall-metall`, `14-…-fanfare-lang`, `15-…-fanfare-kurz`,
  `16-…-alles-zugleich`

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/audio.js` | **neu**: alles zum Ton (Busse, Motor, Reifen, Wind, Aufprall, Signale, Puffer-Rezepte, Stimmen-Limit) |
| `ton-labor.html`, `js/tonlabor.js` | **neu**: Ton-Labor (Hilfsseite, nicht im Menü) |
| `js/main.js` | Ton erzeugen (erst beim Tastendruck), einmal pro Bild die Zahlen geben, Ereignisse (Countdown, Checkpoint, Ziel, Pause), Material bei Aufprall/Felswand, Punkt-Farbe pro Checkpoint |
| `js/kollision.js` | merkt sich **nur für den Ton** das Material (Nummer) je Hindernis und welches getroffen wurde; die Rechnung ist unverändert |
| `js/sprites.js`, `js/sperren.js`, `js/startziel.js`, `js/absperrungen.js` | Hindernisse bekommen eine Art fürs Material (`ton: 'baum'` usw.), nur für den Ton |
| `js/menue.js`, `js/menueseiten.js` | Menü-Töne an den bestehenden Aufrufen (Tick, Blip, Zurück, Regler, Fehler) |
| `js/pacenotes.js` | zählt neu erscheinende Kacheln (für das Signal); die Berechnung ist unverändert |
| `js/hud.js` | Checkpoint-Punkte grün/rot/gelb |
| `js/config.js`, `js/texte.js` | Block `audio` neu, Minimap 49 / 95.6 m, Hinweis LAUTSTÄRKE, Version 0.7a |
| `tools/ton-test.mjs`, `tools/ton-pruefung.js` | **neu**: Ton-Test (a)–(k) |
| `tools/m7a-bilder.mjs`, `tools/m7a-leistung.mjs` | **neu**: Bilder und Leistungsmessung |
| `tools/spiel-browser.mjs` | Chromium-Schalter von aussen (für den Ton-Test: Autoplay) |
| `tools/overlay-test.mjs` | erwartete Minimap-Grösse 47–50 statt 56–64 |

### Selbst getestet

- **`node tools/ton-test.mjs` – alle 106 Prüfungen bestanden**, keine Konsolenfehler:
  - **(a) Entsperren**: auf dem Titel **kein AudioContext**, nach dem ersten Tastendruck **„running“** und genau ein
    Blip (ohne Autoplay-Schalter, also mit der echten Browser-Regel). `?ton=aus` und `?menue=aus`: nie ein
    AudioContext. **Ohne Web Audio** (im Browser abgeschaltet): Menü, Countdown, Rennen, Pause gehen stumm, keine Fehler.
  - **(b) Motor**: Grundton **41.8 / 125.0 / 250.0 Hz** bei 1000 / 3000 / 6000/min (Abweichung 0.34 % / 0 % / 0 %).
    Turbo mit Vollgas 16 Mal lauter als mit wenig Gas, bei 2000/min aus, Ladedruck nach 0.4 s bei 58 %. Blow-off:
    schnell vom Gas = 1, ein bisschen weniger Gas / langsam lösen / ohne Ladedruck = 0, Schalten unter Last = 1.
    Knallen: 40 Mal Gas weg bei 5500/min = **29 Knalle, 18 Mal keiner, nie mehr als 2**, zweimal gerechnet genau gleich;
    unter 4000/min nie. Begrenzer erst nach kurzer Zeit an der Höchstdrehzahl mit Vollgas. Schaltpause: Grundton
    **277 → 175 Hz** (37 % tiefer), Pegel 0.49 → 0.18. Rückwärts: Heulen 878 Hz bei 5 m/s. Countdown: Gas ändert nichts.
  - **(c) Untergrund**: Asphalt surrt, Schotter knirscht, Bankett/Gras/Wiesenweg weich (Gras am dumpfsten: 342 Hz
    gegen 499 / 618 Hz). Überblendung Asphalt → Schotter: nach 51 ms noch 37 %, nach 0.4 s 0 %. Quietschen nur auf
    Asphalt ab 8°, sonst Rutschen. Ratschen einmal pro Ziehen, nicht im Countdown.
  - **(d) Aufprall**: jedes der 6 Materialien spielt seinen eigenen Klang; Lautstärke **0.23 → 0.90** und Helligkeit
    **2057 → 9000 Hz** von 2 bis 14 m/s, unter 1.5 m/s still, ab 6 m/s mit Schlag. Dauerkontakt 0.5 s = 5 Töne (Sperre
    0.1 s). Ducking: nach 90 ms **0.56 (= -5 dB)**, nach 0.9 s wieder 1.00. **Statistik wie in M5b** (Baum 1, R 1,
    Höchsttempo 108.2 km/h) **mit und ohne Ton genau gleich**, auch Rennzeit und Lage. Unsichtbare Grenze: kein Ton.
    Felswand (1932 m): Fels-Ton.
  - **(e) Signale**: Tick, Blip, Regler-Tick (Wert 0.65 bei 65 %), Fehler-Buzz (F3), Zurück; **kein Doppelton** bei
    Maus + Tastatur. Pause / Weiter je ein Ton, kein Blip dazu. **Countdown auf den Schritt genau**: Piep bei Schritt
    1 (3), 121 (2), 241 (1), GO-Ton bei Schritt 360 – genau dann, wenn die Zahl erscheint. Pause im Countdown: Pieps hört
    auf, nichts nachgeholt, nichts doppelt. Checkpoint ohne Referenz / schneller / langsamer / gleich: Ton, Meldung und
    Punkt passen immer zusammen. Verpasst = Buzz. Fanfaren: erste Zeit und Platz 2 = nur die kurze; neue Bestzeit =
    kurze an der Linie und lange zum Zielbildschirm. Pace-Notes: 13 Kacheln bis 1800 m = 13 Signale; Ansagen aus = 0;
    Demo = 0.
  - **(f) Zustände**: Pause: Motor 1.00 → 0.000, Umgebung und Reifen 800 Hz / 0.45; Weiter: alles zurück. Neustart
    (während Drift und Turbo, mit laufendem Aufprall und Fanfare): alle Schichten 0, **0 Stimmen**, genau ein Motor,
    immer 8 Rauschquellen. Hauptmenü mit Demo: stumm. Tab versteckt: „suspended“, zurück: „running“.
  - **(g) Regler**: 0 % = 0, 30 % = 0.09, 50 % = 0.25, 70 % = 0.49, 100 % = 1 (quadratisch), gleitet ohne Sprung.
  - **(h) Stimmen**: 200 Aufpralle plus Signale in Folge: **höchstens 16** gleichzeitig, danach 0 Stimmen und 0 Knoten
    übrig. Eine Minute Fahrt mit dem Testfahrer: höchstens 16, danach 0 übrig (keine Lecks).
  - **(i) Offline gerechnet**: Motor bei 1000 / 3000 / 6000/min: Spitze 0.59–0.64, RMS 0.22–0.33, keine Gleichspannung,
    Grundton im Spektrum genau. Alle 13 einmaligen Klänge: erstes Sample 0, sauberer Anfang (3 ms), klingen genau in
    der eingestellten Länge auf 0 aus, kein NaN. **Alles zugleich: Spitze 0.941** (Limiter hält).
  - **(j) HUD**: Minimap **49 x 49** bei x 268, y 3, Auto genau in der Mitte, **245.8 Pixel pro km wie vorher**;
    Kehren: bis zu 3 / 4 / 5 Strassenstücke in einer Bildzeile bei 1170 / 1260 / 1350 m (Zickzack). Punkte: ohne
    Referenz gelb, schneller grün, langsamer rot, gleich gelb – bleiben stehen, auch mit Live-Vergleich aus, nach
    Neustart leer.
  - **(k)** Hinweis de/en neu, alle Zeichen in der Pixelschrift.
- **Alle bisherigen Tests bestanden** (unverändert, ausser der Minimap-Grösse im Overlay-Test): `testfahrer`
  **2:59.33 / 2:42.35 / 2:31.92**, `abkuerzungen --pruefen` **127 / 2 / 342 / 84**, `overlay-test` (121 Prüfungen,
  inkl. Überlappung), `menue-test`, `rennablauf-test` (Statistik, Countdown, Zielbildschirm), `aufprall`, `belag`,
  `felswand`, `felswand-sprites`, `getriebe`, `gras`, `handbremse`, `kuh`, `leben`, `lenk`, `nebenweg`, `pacenotes`,
  `rueckwaerts`, `startziel`, `strassenrand`. Strecke, Physik, Kollisionsrechnung, Sperren, Abkürzungen,
  Pace-Notes-Berechnung, Checkpoints, Rennzeit, Fahrspur und Bestzeiten-Format nicht angefasst.

### Ehrlich beurteilt

- **Nicht gehört.** Gemessen ist: Die Tonhöhen stimmen (Grundton auf 0.0–0.4 % genau), Pegel und Filter folgen dem
  Spiel, alles blendet weich, nichts übersteuert, nichts bleibt hängen, nichts ändert das Spiel. **Ob es gut klingt,
  weiss ich nicht.** Synthetische Motoren klingen schnell nach „Synthesizer“; das ist das grösste Risiko.
- **Minimap 49 x 49**: Proportional passt sie jetzt besser zur Zeit-Tafel (74 x 13) und zu den Tachos und nimmt oben
  rechts deutlich weniger Platz weg. Die **Kehren sind weiter als Zickzack lesbar**, sobald man in ihnen ist (siehe
  `02-…` und `03-…`). **Ehrlicher Nachteil**: man sieht weniger weit voraus – 95 m statt 120 m, bei 100 km/h gut 3 s
  statt gut 4 s. Vor der ersten Kehre (1150 m) sieht man nur den Anfang des Pakets.
- **Punkte**: grün und rot sind klar zu unterscheiden (auch bei 320x180), gelb und grün sind bei nur 4 x 4 Pixeln
  etwas näher beieinander, aber unterscheidbar. Für Farbenblinde (rot/grün) ist es schwierig – das gilt aber schon für
  Meldung und Live-Vergleich.

### Bekannte Probleme

- **Gamepad allein entsperrt den Ton nicht**: Ein Gamepad-Knopf zählt im Browser nicht als „Benutzer hat etwas getan“.
  Wer nur mit dem Gamepad durchs Menü geht, hat erst Ton, wenn er einmal eine Taste drückt oder klickt.
- **Im Countdown erscheint auf dieser Etappe keine Pace-Notes-Kachel** (die erste Kurve ist zu weit weg), also gibt es
  dort auch kein Signal. Kommt eine, piept sie genau einmal (so gebaut und getestet).
- Der **Fahrtwind und die Reifen klingen in der Pause gedämpft weiter** (so gewünscht: „Umgebung gedämpft“); weil das
  Auto in der Pause eingefroren ist, bleibt ihr Pegel stehen.
- Am Ende des Zielbildschirms rollt das Auto aus; erst wenn es steht, blendet der Motor aus (ca. 1.2 s).
- Im Test-Rechner wurde mit einem stummen Ausgabegerät und Software-Grafik gemessen; auf echten Rechnern kann der
  Puffer-Aufbau etwas anders lange dauern (es ist aber nie ein Stück über ca. 10 ms am Stück).

### Ideen/Vorschläge (nicht umgesetzt)

- Motorton leicht **stereo** (Auspuff hinten links/rechts) – passt zu M7b (Stereo und Abstand).
- Kurzes **Klacken beim Schalten** (Getriebe) zusätzlich zum Drehzahlabfall.
- **Kies prasselt** gegen den Unterboden auf Schotter bei hohem Tempo (zusätzlich zum Rollgeräusch).
- Eigener Regler **EFFEKTE** (Fahrzeug) und **SIGNALE** getrennt, falls die Menü-Klicks stören.
- Fanfare je nach Platz leicht anders (Platz 1, Top 3, Rest).
- Minimap in der Pause grösser (aus M6.1).

---

## Meilenstein 6.1: Minimap zoomt und fährt mit, Vergleich kleiner, Meldungen mit Tafel und Farbe ✅ (Verlauf, Stand damals – Minimap seit M7a 49 x 49 und 95.6 m)

### Was ist neu?

**1. Minimap: Ausschnitt statt ganzer Strecke**
- Die Tafel oben rechts ist jetzt **61 x 61 Pixel** (bei 320x180; vorher 45 x 46) und zeigt **nur die Umgebung des
  Autos**: vom Auto bis zum Tafelrand sind es **120 m**. Was weiter weg ist, ist abgeschnitten.
- **Das Auto steht immer in der Mitte**, die Karte schiebt sich darunter durch. **Norden bleibt oben**, die Karte dreht
  sich nicht (wie bisher).
- Die Strasse ist jetzt **2 Pixel breit mit einem dünnen dunklen Rand** – auf hellem Fels und dunklem Wald gleich gut
  lesbar. Kurven und **Kehren sieht man als Form** (das Kehren-Paket ist ein deutliches Zickzack).
- Farben wie bisher: **noch offen = helles Blaugrau**, **schon gefahren = Gelb/Orange** (bis zum weitesten Punkt,
  schrumpft nie), **Start = grünes Quadrat**, **Ziel = kleines Karo**, **Checkpoints = Querstrich** (weiss, grün nach
  der Durchfahrt, rot wenn verpasst). Sie erscheinen, sobald sie im Ausschnitt liegen.
- **Das Auto ist ein Pfeil** (5 x 5 Pixel, weiss mit dunklem Rand), der in die Richtung zeigt, **in die das Auto
  schaut** (auf 8 Richtungen gerundet: N, NO, O, SO, S, SW, W, NW). Fährst du rückwärts, zeigt er weiter nach vorne
  (Blickrichtung). Er ersetzt den pulsierenden Punkt.
- Die Lage kommt jetzt aus der **echten Autoposition**: Stehst du neben der Strasse, siehst du die Strasse neben dem
  Pfeil (vorher blieb der Punkt immer auf der Linie).
- Die Karte rückt **immer um ganze Pixel** weiter (kein Flimmern der Linien). Bei R, beim Neustart und bei
  „Checkpoint verpasst“ springt der Ausschnitt einfach mit, ohne Übergang.
- Sonst wie M6: sichtbar im Countdown, im Rennen und in der Pause; Ein/Aus unter EINSTELLUNGEN → ANZEIGE und mit H.

**Welcher Zoom? Drei Werte ausprobiert** (Bild `00-zoom-vergleich.png`: Minimap an vier Stellen, 4fach vergrössert)

| Zoom | Kehren (1170 m) | Almweg-Abzweig (1965 m) | Lange Gerade (Almweg) | Urteil |
|---|---|---|---|---|
| **80 m** | nur der Anfang der ersten Kehre am Rand | eine Kehre hinter dir | gut | zu nah: man sieht kaum, was kommt (bei 100 km/h knapp 3 s) |
| **120 m** | das Kehren-Paket als klares Zickzack, Abstände sichtbar | Kehren hinter dir, Abzweig vorne | gut | **gewählt**: nächste Kurve lesbar, gut 4 s voraus |
| **180 m** | Kehren kleben fast zusammen (1–2 Pixel Lücke) | Zickzack wird ein Block | gut | zu weit weg: Kurven werden wieder klein |

**2. Live-Vergleich so gross wie die Zeit-Tafel**
- Die Tafel unter den Punkten ist jetzt **genau gleich hoch (13) und gleich breit (74 Pixel)** wie die Zeit-Tafel,
  mit denselben Ecken, Rand und Füllung.
- **Nur zwei Schriften, dieselben wie in der Zeit-Tafel**: „BEST“ / „LETZT“ (englisch „LAST“) klein wie „ZEIT“, die
  Zahl so gross wie die Ziffern der Zeit, beide auf derselben Linie. Die Zahl steht rechtsbündig (das Vorzeichen
  springt nicht), „+99.9“ passt noch hinein.
- Farben, Rundung, Ruhe (höchstens 5 Mal pro Sekunde) wie in M6.

**3. Hinweis bei Taste H**
- Unten in der Mitte steht nur noch **„HUD AUS“** bzw. **„HUD AN“** (englisch „HUD OFF“ / „HUD ON“), ohne Tastenname.
  Die Tafel ist so breit wie der Text, sonst wie bisher (1.5 s, am Ende ausblenden).

**4. Meldungen mit Tafel, Zwischenzeit grün oder rot**
- Alle Meldungen unter der Zeit (**„CP 1  00:13.40“**, **„CHECKPOINT VERPASST“**, **„ANSAGEN AN/AUS“**) stehen jetzt auf
  einer **Tafel wie die Zeit-Tafel** (gleiche Höhe, Rand, Ecken, linksbündig), so breit wie der Text. Sie liegt unter
  dem Live-Vergleich (bzw. ohne Vergleich direkt unter den Punkten), nichts überlappt.
- **Farbe der Zwischenzeit**: **grün** = du warst an diesem Checkpoint **schneller** als die Referenz, **rot** =
  **langsamer**, **gelb** = auf die Hundertstel **gleich schnell** oder **keine Referenz** (erste Fahrt, Speicher leer,
  „Letzter Lauf“ gewählt, aber noch keiner gefahren).
- **Wie die Referenz gewählt wird**: dieselbe wie beim Live-Vergleich – **Platz 1** der Bestzeiten oder der **letzte
  Lauf**, je nach Einstellung **VERGLEICH MIT**. Verglichen wird **deine Zwischenzeit mit der Zwischenzeit der
  Referenz an diesem Checkpoint**, auf Hundertstel (so wie der Zielbildschirm). Das geht auch mit **alten Bestzeiten
  ohne Fahrspur** (die haben ihre Zwischenzeiten). Fehlt der Referenz eine Zwischenzeit (Checkpoint damals verpasst),
  nimmt das Spiel die Referenzzeit an der Stelle des Checkpoints aus der Fahrspur.
- Das gilt **auch, wenn der Live-Vergleich ausgeschaltet ist** – nur VERGLEICH MIT zählt.
- „CHECKPOINT VERPASST“ bleibt **rot**, „ANSAGEN AN/AUS“ bleibt **gelb**. Dauer wie bisher (3 s).

### Werte zum Drehen (`js/config.js`)

| Wert | Was | heute |
|---|---|---|
| `hud.minimap.sichtMeter` | **Zoom**: so viele Meter vom Auto bis zum Tafelrand (kleiner = näher dran) | 120 m |
| `hud.minimap.groesse` | Tafel so breit und hoch (Pixel, ungerade, damit das Auto genau in der Mitte steht) | 61 |
| `hud.minimap.rechts`, `oben`, `ecke` | Abstand zum Bildrand, abgeschrägte Ecken | 3 / 3 / 2 px |
| `hud.minimap.punktAbstand` | die Karte nimmt alle … m einen Streckenpunkt (kleiner = rundere Kurven) | 4 m |
| `hud.minimap.neuFaerbenAb` | die orange Linie wird erst nach … m weitergemalt | 15 m |
| `hud.minimap.farbeOffen`, `farbeGefahren`, `farbeStrassenRand` | Strasse offen / gefahren / dunkler Rand | Blaugrau / Orange / fast schwarz |
| `hud.minimap.startGroesse`, `zielGroesse`, `cpLaenge` | Grösse von Start-Quadrat, Ziel-Karo, Checkpoint-Strich | 4 / 4 / 6 px |
| `hud.minimap.farbeAuto`, `farbeAutoRand` | Pfeil und sein Rand | weiss / fast schwarz |
| `hud.vergleich.unter` | Vergleichs-Tafel so weit unter den Punkten | 2 px |
| `hud.vergleich.farbeSchneller`, `farbeLangsamer` | grün / rot, **auch für die Zwischenzeit-Meldung** | |
| `hud.zeit.meldungUnter` | Meldung so weit unter dem Vergleich bzw. den Punkten | 4 px |
| `VERSION` (ganz oben) | Versionsnummer | 0.6.1 |

Weggefallen: `hud.minimap.maxBreite`, `maxHoehe`, `rand` (Massstab aus der ganzen Strecke), `blinkenHz`,
`blinkenTiefe` (der Punkt pulsierte); `hud.vergleich.hoehe`, `groesse`, `zeichenPlatz`, `farbeEtikett` (jetzt die Werte
der Zeit-Tafel `hud.zeit`). Texte: `hud.hudAus` / `hud.hudAn` ohne `{taste}`.

### So testest du

1. **STARTEN**: Oben rechts die Minimap, das Auto als weisser Pfeil nach oben in der Mitte, das grüne Start-Quadrat
   liegt im Countdown unter dem Pfeil und taucht nach ca. 25 m hinter dir auf.
2. Fahren: Die Karte schiebt sich ruhig mit, hinter dir wird die Strasse orange. Bei ca. 1100 m siehst du oben das
   Zickzack der Kehren kommen. In den Kehren dreht sich der Pfeil mit.
3. Kurz auf die Wiese fahren: Die Strasse liegt neben dem Pfeil. **R**: der Ausschnitt springt mit.
4. Eine Bestzeit fahren, dann **NEU STARTEN**: Unter der Zeit „BEST“ mit der Zahl – die Tafel ist jetzt genau so gross
   wie die Zeit-Tafel. Am Checkpoint 1 steht „CP 1 …“ in einer Tafel: grün, wenn du schneller warst, rot, wenn langsamer.
5. **H**: unten „HUD AUS“, nochmals H: „HUD AN“.
6. Fragen an dich: Ist die Minimap jetzt auf beiden Rechnern lesbar? Ist 120 m ein guter Zoom (sonst `sichtMeter`
   auf 100 oder 150 stellen)? Wirkt die linke Seite (Zeit, Punkte, Vergleich, Meldung) aufgeräumt?

### Bilder (`screenshots/m6-1/`, 1280x720, dazu je `-320x180`; neu erzeugen: `node tools/m61-bilder.mjs`)

- `00-zoom-vergleich` (alle drei Zoomwerte an Kehre, Almweg-Abzweig, langer Gerade und Schikane, 4fach vergrössert)
- `01-zoom-80m-…`, `01-zoom-120m-…`, `01-zoom-180m-…` (je `kehre`, `almweg-abzweig`, `gerade`, `schikane`)
- `02-minimap-start` (Start-Quadrat hinter dem Auto), `04-minimap-kurve` (in Kehre 1), `06-minimap-kurz-vor-dem-ziel` (Ziel-Karo voraus)
- `03-meldung-rot-vergleich-rot` (langsamer Lauf: Vergleich und Zwischenzeit rot, beide Tafeln gleich hoch wie die Zeit)
- `05-checkpoint-verpasst` (rot, mit Tafel), `07-meldung-gruen-vergleich-gruen` (schneller als der letzte Lauf, „LETZT“)
- `08-hud-aus`, `09-hud-an`, `10-englisch-meldung-gruen` („LAST“, „CP 2“ grün), `11-englisch-hud-off`

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/minimap.js` | neu geschrieben: grosse Karte beim Laden gemalt (Strasse 2 Pixel mit dunklem Rand), pro Bild nur ein Ausschnitt in die Tafel kopiert, orange Linie nur das neue Stück, Pfeil in 8 Richtungen |
| `js/hud.js` | Minimap bekommt Autoposition und Blickrichtung; Vergleichs-Tafel wie die Zeit-Tafel; Meldung auf eigener Tafel; Hinweis ohne Tastenname |
| `js/vergleich.js` | neu: Vergleich am Checkpoint (`zwischenVergleich`), Zwischenzeiten der Referenz werden mit geladen |
| `js/main.js` | Farbe der Zwischenzeit-Meldung; Autoposition und Blickrichtung ans HUD |
| `js/config.js`, `js/texte.js` | Block `hud.minimap` neu, `hud.vergleich` aufgeräumt, Texte „HUD AUS/AN“, Version 0.6.1 |
| `tools/overlay-test.mjs` | Tests der alten Ganze-Strecke-Karte ersetzt durch [6.1 a]–[6.1 g], Text-Test erweitert |
| `tools/m61-bilder.mjs` | **neu**: Bilder für diesen Meilenstein |

### Selbst getestet

- **`node tools/overlay-test.mjs` – alle 121 Prüfungen bestanden**, keine Konsolenfehler. Die M6-Tests zur alten
  Ganze-Strecke-Karte (Massstab aus der Streckenbox, „Punkt auf der Linie“) sind ersetzt durch:
  - **[6.1 a] Auto in der Mitte**: An Start, Mitte, Ziel, 40 m seitlich versetzt und vier weiteren Stellen liegt die
    echte Autoposition im Mittelpixel der Tafel (höchstens **0.49 Pixel** von dessen Mitte). Start, Ziel und
    Checkpoints erscheinen genau dann, wenn sie im Ausschnitt liegen, und dann höchstens 1.5 Pixel neben der Stelle,
    die unabhängig aus Weltlage und Zoom gerechnet wurde (ausser direkt unter dem Pfeil, siehe unten). Tafel 61 x 61
    bei x 256–316, y 3–63, ganz im Bild. Abstand zu den Pace-Notes (breitester Fall, bis x 200): **55 Pixel**;
    Zeit- und Vergleichs-Tafel bis x 77; längste Meldung mit Tafel bis x 124.
  - **[6.1 b] Scrollen**: Fahrt mit Countdown durch die Kehren bis 1400 m, Teleport, R, Neustart, weiter bis 700 m –
    10 298 Schritte: Ausschnitt **immer in ganzen Pixeln**, **höchstens 1 Pixel pro Schritt und pro Bild (1/60 s)**,
    nie weiter, als das Tempo hergibt (+1). **Genau 3 Sprünge**: Teleport, R (7 Pixel, 30 m) und Neustart.
    Kein Hin-und-her-Zittern (0 Richtungswechsel innerhalb von 6 Schritten).
  - **[6.1 c] Färbung**: wächst nur; Rückwärtsfahren, R und Sprung zurück ändern nichts; Checkpoint weiss → grün,
    verpasst rot (und wieder weiss, wenn das Auto davor zurückgesetzt wird); auf 307 m **15 Mal weitergemalt** (in 36
    Bildern), dabei **nie die ganze Karte neu**. Neuer Lauf: alles blaugrau.
  - **[6.1 d] Pfeil**: Gerade (Almweg), Kehre 1, Kurve bei 1500 m, Start: zeigt in Blickrichtung (aus den Bildpixeln
    gelesen). 16 Blickrichtungen: immer auf die nächste der 8 gerundet, alle 8 Pfeile verschieden. **Rückwärts** mit
    30 km/h: Pfeil zeigt nach vorne, die Fahrtrichtung ist genau entgegengesetzt.
  - **[6.1 e] Vergleichs-Tafel**: „+99.9“, „-9.9“, „0.0“ (LETZT), „+1.2“ und „+99.9“ (LAST, Englisch), „-0.7“: Tafel
    immer **74 x 13 wie die Zeit-Tafel** (aus den Bildpixeln gemessen), Etikett in den Zeilen 4–8 und Zahl in den
    Zeilen 3–9 – **genau wie „ZEIT“ und die Ziffern der Zeit**; Zahl endet immer an derselben Stelle (rechtsbündig).
  - **[6.1 f] Hinweis H**: de „HUD AUS“ / „HUD AN“, en „HUD OFF“ / „HUD ON“; die Tafel ist 51 bzw. 45 Pixel breit
    (Text + Rand), kein Tastenname.
  - **[6.1 g] Meldung**: alle mit Tafel 13 Pixel hoch, Rand, linksbündig bei x 3, so breit wie der Text, unter dem
    Vergleich (bzw. den Punkten). Zwischenzeit: keine Referenz = **gelb**, gleicher Lauf = **gelb**, langsamer =
    **rot**, Live-Vergleich ausgeschaltet = **trotzdem rot**, „Letzter Lauf“ langsamer bzw. schneller = **grün** bzw.
    **rot**, alte Bestzeit ohne Fahrspur = grün / gelb / rot richtig, Rundung (13.409 gegen 13.40 = gleich). „CHECKPOINT
    VERPASST“ rot, „ANSAGEN AUS/AN“ gelb, beide mit Tafel.
  - **[6.1 h]** 16 Text-Schlüssel (M6 und 6.1) in de und en, alle Zeichen in der Pixelschrift. Die übrigen M6-Tests
    (Fahrspur, Vergleich, Referenz, ohne Speicher, Taste H belegen, Einstellungen) laufen unverändert weiter.
- **Zahlen**:
  - **Zeichenaufrufe (3D) vorher → nachher: Start 123 → 123, 900 m 98 → 98, 1948 m 108 → 108, 3170 m 70 → 70,
    Ziel 59 → 59** – gleich, mit und ohne Minimap (die Minimap ist 2D und liegt auf dem HUD-Bild).
  - **HUD zeichnen pro Bild**: mit Minimap **0.19 ms**, ohne **0.15 ms**. Ganzes Bild im Test (Software-Grafik):
    243 ms mit, 241 ms ohne Minimap – gleich. Pro Bild kopiert die Minimap nur vier kleine Bildstücke (Tafel,
    Ausschnitt, Rand, Pfeil); es entstehen keine neuen Objekte. Vergleich und Meldung werden nur bei einer Änderung
    neu gemalt.
  - **Karte beim Laden**: 598 x 604 Pixel, gebaut in **13–16 ms** (M6: 5–10 ms).
  - **Ladezeit** (`node tools/ladezeit.mjs`, 2 x 9 Ladungen, Median alt → neu): **1517 → 1508 ms** und **1474 →
    1430 ms** – kein messbarer Unterschied (Budget +30 ms; die paar ms der grösseren Karte gehen im Rauschen unter).
- **Bisherige Tests unverändert**: `testfahrer` **2:59.33 / 2:42.35 / 2:31.92**, `abkuerzungen --pruefen`
  **127 / 2 / 342 / 84**, `menue-test` und `rennablauf-test` bestanden. Strecke, Physik, Sperren, Pace-Notes,
  Checkpoints, Rennzeit, Fahrspur und Bestzeiten-Format nicht angefasst.

### Ehrlich beurteilt (bei 320x180 in Originalgrösse angeschaut)

- **Ist die Minimap jetzt lesbar?** Ja, viel besser. Die **Kehren sind als Zickzack** zu sehen, mit Lücken
  dazwischen; **wo du bist**, sagt der Pfeil sofort (auch die Richtung), **wohin es geht**, zeigt die blaugraue Linie
  vor dem Pfeil – bei 120 m sieht man bei 100 km/h gut 4 s voraus. Der dunkle Rand macht die Linie auf Wald, Wiese
  und Fels gleich gut lesbar. **Schwächer**: Die **Schikane** ist nur ein leichter Knick (ihre Gegenkurven versetzen
  die Strasse nur um 1–2 Pixel), und das **Ziel-Karo** (4 x 4) ist klein.
- **Ist 120 m ein guter Mittelweg?** Ja: 80 m zeigt zu wenig voraus, bei 180 m kleben die Kehren fast zusammen.
- **Wirkt das Scrollen ruhig?** Ja, kein Zittern und keine Sprünge beim Fahren. Ehrlich: Weil die Karte in ganzen
  Pixeln rückt, „tickt“ sie bei 100 km/h etwa 7 Mal pro Sekunde um einen Pixel weiter – fein, aber nicht fliessend.
  Das ist der Preis für scharfe 2-Pixel-Linien (halbe Pixel würden flimmern).
- **Ist der Vergleich gleich gross?** Ja, pixelgenau gleich hoch und breit wie die Zeit-Tafel, gleiche Schriften.
- **Drängt sich links zu viel?** Mit Meldung stehen drei gleich hohe Tafeln untereinander (bis ca. y 54, ein knappes
  Drittel der Bildhöhe) – weil alle gleich gebaut sind, wirkt es ordentlich, und die Meldung verschwindet nach 3 s.
  Was mich noch stört: Die Meldungs-Tafel ist **breiter** (91 bzw. 121 Pixel) als die zwei Tafeln darüber (74), die
  linke Spalte hat dadurch keine ganz saubere rechte Kante.
- **Pfeil**: Der gerade Pfeil (N, O, S, W) ist sehr klar. Die schrägen (NO usw.) sind mit 5 x 5 Pixeln etwas
  „zerrupfter“, aber erkennbar.

### Bekannte Probleme

- **Im Countdown liegt das Start-Quadrat unter dem Pfeil** (das Auto steht ja auf der Startlinie). Nach ca. 25 m
  taucht es hinter dem Pfeil auf. Allgemein: Was genau unter dem Pfeil liegt (z. B. ein Checkpoint-Strich beim
  Durchfahren), ist für einen Moment verdeckt.
- Die **Schikane** ist auf der Karte nur ein leichter Knick, das **Ziel-Karo** ist klein.
- Die Karte rückt in ganzen Pixeln weiter („Ticken“, siehe oben).
- Grün/rot der Zwischenzeit wird **auf Hundertstel** verglichen, der Live-Vergleich zeigt unter 0.05 s weiss „0.0“.
  Am Checkpoint kann darum die Meldung schon grün oder rot sein, während der Vergleich noch „0.0“ zeigt. Das ist so
  gewollt (gleiche Hundertstel = gelb), kann aber im ersten Moment überraschen.
- Die Tafeln sind wie die Zeit-Tafel leicht durchsichtig; vor hellem Fels/Schnee scheint der Hintergrund etwas durch.
- Aus M6 gilt weiter: alte Bestzeiten ohne Fahrspur nur an den Checkpoints genau, „letzter Lauf“ wird bei BESTZEITEN
  LÖSCHEN nicht gelöscht, Tachos schauen unter dem Zielbildschirm hervor, kein Gamepad-Knopf für H.

### Ideen/Vorschläge (nicht umgesetzt)

- Zoom, der sich dem Tempo anpasst (langsam = näher dran, schnell = weiter weg), ruhig und in Stufen.
- Ziel-Karo und Start-Quadrat etwas grösser, oder mit dunklem Rand wie die Strasse.
- Minimap in der Pause grösser (ganze Strecke) – dort stört sie nicht.
- Die Zwischenzeit-Meldung könnte den Unterschied gleich mitzeigen („CP 1 00:13.40 -0.8“), wie der Zielbildschirm.
- Pfeil leicht grösser (7 x 7), falls er auf dem Gaming-PC-Bildschirm zu klein wirkt.

---

## Meilenstein 6: Minimap, Live-Vergleich zur Bestzeit, HUD-Schalter ✅ (Verlauf, Stand damals – Minimap, Grösse des Vergleichs, Hinweis bei H und Meldung seit M6.1 anders)

### Was ist neu?

**1. Minimap oben rechts**
- Kleine Tafel im HUD-Stil (dunkelblau, heller Rand), **45 x 46 Pixel** (bei 320x180). Die Etappe ist fast so hoch
  wie breit, darum ist die Tafel fast quadratisch (erlaubt waren höchstens 64 x 46).
- **Ganze Strecke, Norden oben**, die Karte dreht sich nicht mit. Massstab: 21 Pixel pro Kilometer.
- **Noch nicht gefahren**: helles Blaugrau. **Schon gefahren**: Orange – bis zum **weitesten Punkt**, den das Auto in
  diesem Lauf erreicht hat. Rückwärtsfahren, R und „Checkpoint verpasst“ machen die orange Linie **nicht** kürzer.
- **Start**: grünes Quadrat (2x2 Pixel), **Ziel**: kleines Karo (3x3 Pixel, schwarz/weiss).
- **Checkpoints**: kurzer Querstrich (3 Pixel) – **weiss** = noch nicht durch, **grün** = durchfahren (wie die gelben
  Punkte unter der Zeit), **rot** = verpasst (solange „CHECKPOINT VERPASST“ steht; danach steht das Auto wieder vor
  dem Tor und der Strich wird wieder weiss).
- **Auto**: heller Punkt (2x2 Pixel) mit dunklem Rand, pulsiert ganz leicht (2 Mal pro Sekunde etwas dunkler, kein
  hartes Blinken). Er sitzt immer **auf der Linie** (an der Stelle der Strecke, die dem Auto am nächsten ist), auch
  wenn man über die Wiese fährt.
- Sichtbar im **Countdown, im Rennen und in der Pause**. Nicht im Titel, Menü, Demo-Fahrt, nicht nach der Ziellinie
  („ZIEL!“ und Zielbildschirm: dort zählen die Zeiten).

**2. Live-Vergleich unter der Zeit**
- Kleine Tafel direkt unter den Checkpoint-Punkten, gleich breit wie die Zeit-Tafel: links klein **BEST** (oder
  **LETZT**), rechts gross (doppelte Schrift) die Zahl mit einer Nachkommastelle:
  **grün „-0.8“** = so viel schneller, **rot „+1.2“** = so viel langsamer, **weiss „0.0“** = weniger als 0.05 s Unterschied.
- **Ständig aktuell**, nicht nur an den Checkpoints. Die Zahl ändert sich aber **höchstens 5 Mal pro Sekunde** und
  springt erst um, wenn der Unterschied deutlich (0.02 s) über der Grenze liegt – kein Flackern zwischen „0.0“ und
  „+0.1“ oder zwischen „0.4“ und „0.5“.
- Die **Meldung** (Zwischenzeit am Checkpoint, „CHECKPOINT VERPASST“, „ANSAGEN AN/AUS“) rutscht eine Zeile tiefer,
  unter den Vergleich (ohne Vergleich steht sie wie bisher direkt unter den Punkten).
- Sichtbar **nur im Rennen und in der Pause**, nicht im Countdown und nicht nach der Ziellinie (dort vergleicht wie
  bisher der Zielbildschirm, und zwar **immer mit der Bestzeit**).
- **Keine Referenz** (erste Fahrt, Speicher leer, „Letzter Lauf“ gewählt, aber noch keiner gefahren): **nichts**
  (keine „0.0“, keine Platzhalter).

**3. Einstellungen → neue Gruppe ANZEIGE** (zwischen Grafik und Steuerung, alles sofort wirksam, im Browser gespeichert)

| Einstellung | Standard | Was es macht |
|---|---|---|
| MINIMAP | AN | Minimap oben rechts an/aus |
| LIVE-VERGLEICH | AN | Vergleich unter der Zeit an/aus (Hinweis unten: „GRÜN = SCHNELLER, ROT = LANGSAMER“) |
| VERGLEICH MIT | BESTZEIT | **BESTZEIT** = Platz 1 der Top 10 dieser Etappe, **LETZTER LAUF** = der zuletzt beendete Lauf (auch ein langsamer, der nicht in die Top 10 kam). Wirkt sofort (auch mitten im Lauf aus der Pause) und bei jedem Start |

**4. Taste H: ganzes HUD aus / an**
- Blendet **Zeit-Tafel, Punkte, Meldungen, Live-Vergleich, Minimap, Tachos und Pace-Notes** aus (auch das kleine
  R-Zeichen und die Tasten-Hilfe vor dem Start).
- Es bleiben: **Countdown**, **„ZIEL!“**, **Zielbildschirm**, **Pause**, **Menü** und unten in der Mitte für 1.5 s ein
  kleiner Hinweis **„HUD AUS  H = AN“** bzw. **„HUD AN“** (damit man weiss, wie man es zurückholt). Die F3-Anzeige
  bleibt, wenn man sie eingeschaltet hat (sie ist ja selbst ein Schalter).
- **Nicht gespeichert**: Bei jedem Start der Seite ist das HUD wieder an.
- Nur Tastatur. Unter **TASTEN BELEGEN** frei belegbar wie die anderen (Doppelbelegung wird getauscht), auf der Seite
  **STEUERUNG** steht „HUD AUS/AN | H“.
- Hattest du H schon selbst für etwas anderes belegt, bleibt deine Belegung, und HUD aus/an bekommt die erste freie
  Buchstabentaste (meist J). Unter TASTEN BELEGEN kannst du es ändern.

### Wie rechnet der Vergleich?

1. **Fahrspur**: Während die Zeit läuft, wird **alle 10 Meter** Strecke notiert, wann das Auto diese Stelle **zum
   ersten Mal** erreicht hat (ab der Startlinie). Fährt man zurück und wieder vor, wird nichts überschrieben. Am Ende
   kommt die Endzeit dazu: **361 Zahlen** pro Lauf, auf 0.01 s gerundet. Der Zeitpunkt wird zwischen zwei
   Rechenschritten (1/120 s) eingepasst, er stimmt auf 0.005 s.
2. Im Ziel wird die Fahrspur **mit der Bestzeit gespeichert** (neues Feld `spur` im Eintrag) und jeder fertige Lauf
   zusätzlich als **„letzter Lauf“** (eigener Speicher `alpineRally.letzterLauf`, je Etappe einer).
3. **Beim Start** wird die Referenz geladen (Platz 1 oder der letzte Lauf, je nach Einstellung).
4. **Jedes Bild**: An der Stelle, wo das Auto gerade ist, wird die Zeit der Referenz nachgeschaut (zwischen zwei
   10-m-Werten gerade verbunden). **Unterschied = deine Rennzeit minus die Zeit der Referenz an dieser Stelle.**
   Minus = du bist früher dort = schneller.
5. R-Reset und „Checkpoint verpasst“ werden nicht extra behandelt: Der Vergleich geht einfach über die Stelle weiter
   (die verlorene Zeit zeigt sich als grösseres Plus).

**Alte Bestzeiten** (aus M5b, ohne Fahrspur): Der Vergleich nimmt dann nur Start (0 s), die drei Zwischenzeiten und
die Endzeit und verbindet sie gerade. **An den Checkpoints stimmt der Vergleich dann genau, dazwischen ist er nur
grob** – gemessen mit dem gleichen Lauf: bis **4.7 s** daneben (bei den Kehren, wo man viel langsamer ist als im
Schnitt). **Einfach einmal eine neue Bestzeit fahren, dann ist der Vergleich genau** (ab dann hat Platz 1 eine Spur).
Die alten Zeiten bleiben in der Liste und funktionieren wie bisher.

**Speicherbedarf**: Eine Bestzeiten-Liste mit **10 Spuren** braucht **24 KB** Text (der Browser rechnet 2 Byte pro
Zeichen, also ca. **48 KB**; erlaubt sind je Website meist 5 MB). Der letzte Lauf noch einmal ca. 2.4 KB.

### Werte zum Drehen (`js/config.js`)

| Wert | Was | heute |
|---|---|---|
| `hud.minimap.maxBreite`, `maxHoehe` | grösste Tafel (Pixel, mit Rand) | 64 x 46 |
| `hud.minimap.rand`, `rechts`, `oben` | Abstand Strecke–Tafelrand, Tafel–Bildrand | 3 / 3 / 3 px |
| `hud.minimap.punktAbstand` | die Karte nimmt alle … m einen Streckenpunkt | 8 m |
| `hud.minimap.neuFaerbenAb` | orange Linie wird erst nach … m neu gemalt | 15 m |
| `hud.minimap.farbeOffen`, `farbeGefahren` | Strecke: noch nicht / schon gefahren | Blaugrau / Orange |
| `hud.minimap.farbeStart`, `farbeZielHell/Dunkel` | Start, Ziel-Karo | grün / weiss-schwarz |
| `hud.minimap.farbeCpOffen/Durch/Verpasst`, `cpLaenge` | Checkpoint-Strich | weiss / grün / rot, 3 px |
| `hud.minimap.farbeAuto`, `farbeAutoRand`, `blinkenHz`, `blinkenTiefe` | Auto-Punkt und sein Pulsieren | weiss, 2 Mal/s, 35 % dunkler |
| `hud.vergleich.groesse`, `hoehe`, `unter` | Schriftgrösse der Zahl, Tafelhöhe, Abstand unter den Punkten | 2 / 18 px / 2 px |
| `hud.vergleich.aktualisieren` | Zahl höchstens alle … s neu | 0.2 s (5 Mal pro Sekunde) |
| `hud.vergleich.nullBis` | darunter weiss „0.0“ | 0.05 s |
| `hud.vergleich.hysterese` | gegen Flackern: so weit über die Grenze, bevor die Anzeige wechselt | 0.02 s |
| `hud.vergleich.farbeSchneller/Langsamer/Gleich/Etikett` | Farben | grün / rot / weiss / hell |
| `hud.hudSchalter.hinweisDauer`, `hinweisUnten` | Hinweis „HUD AUS/AN“: Dauer, Abstand vom unteren Rand | 1.5 s / 12 px |
| `rennablauf.spurAbstand` | Fahrspur: alle … m eine Zeit | 10 m |
| `menue.standard.minimap`, `vergleich`, `vergleichMit` | Standard der neuen Einstellungen | an / an / 'best' |
| `menue.standard.tasten.hud` | Taste für HUD aus/an | H |
| `menue.letzterLaufName` | Speichername des letzten Laufs | `alpineRally.letzterLauf` |
| `VERSION` (ganz oben) | Versionsnummer | 0.6 |

Texte (Deutsch/Englisch) in `js/texte.js`: `einst.anzeige`, `einst.minimap`, `einst.vergleich`,
`einst.vergleichHinweis`, `einst.vergleichMit`, `wert.bestzeit`, `wert.letzterLauf`, `aktion.hud`,
`hud.vergleichBest` (BEST), `hud.vergleichLetzter` (LETZT / LAST), `hud.hudAus`, `hud.hudAn`.

### So testest du

1. **STARTEN**: Im Countdown oben rechts die Minimap, alles blaugrau, Punkt beim grünen Start. Noch kein Vergleich
   (beim allerersten Mal gibt es ja keine Bestzeit).
2. Fahren: Die Linie hinter dir wird orange, beim Checkpoint wird der Strich grün. Kurz rückwärts fahren oder R:
   Das Orange bleibt.
3. Ins Ziel fahren (das ist jetzt deine Bestzeit mit Fahrspur). **NEU STARTEN**: Jetzt steht unter der Zeit
   „BEST“ mit einer Zahl. Langsamer fahren → rot mit Plus, Kurven besser → die Zahl wird kleiner oder grün.
4. Eine Zwischenzeit abwarten: Die Meldung „CP 1 …“ steht unter dem Vergleich, nichts überlappt.
5. Taste **H**: alles weg, unten kurz „HUD AUS  H = AN“. Nochmals H: alles wieder da.
6. Pause → EINSTELLUNGEN → ANZEIGE: Minimap aus (sofort weg), VERGLEICH MIT → LETZTER LAUF (Etikett „LETZT“).
7. Fragen an dich: Erkennst du auf der Minimap die Strecke und dich selbst (auf beiden Rechnern)? Ist dir die
   grosse Zahl zu dominant, oder genau richtig? Hilft „Letzter Lauf“ beim Üben?

### Bilder (`screenshots/m6/`, 1280x720, dazu je `-320x180`; neu erzeugen: `node tools/m6-bilder.mjs`)

- `01-countdown-minimap-beginn` (Minimap zu Beginn, im Countdown, noch kein Vergleich)
- `02-vergleich-rot-minimap-mitte` (langsamerer Lauf, 90 % Gas, bei 1650 m: rot, Minimap halb orange)
- `03-vergleich-mit-checkpoint-meldung` (direkt nach CP 2: Meldung unter dem Vergleich, Überlappungstest)
- `04-pause`, `05-minimap-kurz-vor-dem-ziel`
- `06-vergleich-gruen-letzter-lauf` (schnellerer Lauf gegen den letzten Lauf: grün, Etikett „LETZT“)
- `07-hud-aus` (Taste H, mit Hinweis), `08-hud-aus-ohne-hinweis` (der „Clean Look“)
- `09-einstellungen-anzeige`, `10-englisch-rennen`, `11-englisch-einstellungen`

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/minimap.js` | **neu**: Minimap (Karte beim Laden einmal gemalt, Färben nur bei Änderung, Punkt) |
| `js/vergleich.js` | **neu**: Fahrspur aufzeichnen, Referenz (Spur oder Näherung), ruhige Anzeige mit Hysterese |
| `js/hud.js` | Minimap und Live-Vergleich einbinden, Meldung rutscht unter den Vergleich, Taste H, Hinweis |
| `js/main.js` | Fahrspur nach jedem Physik-Schritt (nur lesen), Referenz beim Start laden, Spur und letzten Lauf im Ziel speichern, Taste H |
| `js/bestzeiten.js` | Feld `spur` im Eintrag (alte Einträge ohne werden gelesen), letzter Lauf speichern/laden (mit Ersatzspeicher) |
| `js/einstellungen.js` | neue Einstellungen; neue Aktion `hud` (alte gespeicherte Belegungen bleiben gültig) |
| `js/input.js` | Taste für `hud` |
| `js/menueseiten.js` | Gruppe ANZEIGE, Zeile HUD auf der Seite STEUERUNG |
| `js/tacho.js` | kleine Schrift: A, B, L, S dazu (für BEST / LETZT / LAST) |
| `js/config.js`, `js/texte.js` | Blöcke `hud.minimap`, `hud.vergleich`, `hud.hudSchalter`, neue Texte, Version 0.6 |
| `tools/overlay-test.mjs` | **neu**: Test (a)–(i) |
| `tools/m6-bilder.mjs` | **neu**: Bilder für diesen Meilenstein |
| `tools/testfahrer-browser.js` | neue Hilfe `fahreBis` (im Spiel fahren bis zu einer Stelle, auch mit weniger Gas); die bisherigen Fahrten sind unverändert |

### Selbst getestet

- **Neuer Test `node tools/overlay-test.mjs`** – **alle 84 Prüfungen bestanden**, keine Konsolenfehler:
  - (a) Minimap 45 x 46 Pixel, gebaut in 5–10 ms. Punkt bei Start / Mitte / Ziel / 40 m neben der Strasse höchstens
    **0.63 Pixel** neben der Projektion des Streckenpunkts (das 2x2-Quadrat liegt auf ganzen Pixeln); auf der Wiese
    bleibt er auf der Linie. Die ganze Strecke liegt innerhalb des Tafelrandes. Keine Überlappung bei 320x180:
    Pace-Notes reichen im breitesten Fall (zwei breite Kacheln) bis x 200, die Minimap beginnt bei x 272; Zeit-Tafel
    bis x 77, Live-Vergleich höchstens bis x 104 (auch mit „+99.9“), Pace-Notes beginnen frühestens bei x 146;
    die längste Meldung (de/en) endet bei x 116.
  - (b) Nach 600 m 15 Pixel orange; 25 m rückwärts, dann R und ein Sprung 80 m zurück: gleich viele Pixel, maxS
    unverändert. Weiter vorwärts: 22 Pixel. Checkpoint 1 durchfahren: grün; Checkpoint 2 ausgelassen: rot, solange
    „CHECKPOINT VERPASST“ steht, danach wieder weiss (Auto steht davor); mit abgeschalteter Zurücksetz-Regel bleibt er
    rot. Neuer Lauf: alles blaugrau. Die Karte wurde auf 307 m **15 Mal** neu gefärbt (in 36 Bildern), nicht jedes Bild.
  - (c) Testfahrer „flott“ **2:31.92** (unverändert), Fahrspur **361 Werte**, streng aufsteigend, letzter = Endzeit
    (151.92), alle auf 0.01 s. Jeder Wert höchstens **0.005 s** neben der echten Zeit beim Erreichen der Stelle.
    Gleicher Lauf auch als „letzter Lauf“ gespeichert. **Speicher: 10 Spuren = 23.9 KB Text (ca. 48 KB im Browser).**
  - (d) **Identischer zweiter Lauf: höchstens 0.045 s Unterschied** (in den Kehren bei 1510 m, sonst weniger), angezeigt
    immer weiss „0.0“. Langsamer (90 % Gas, 2:34.14): +0.41 → +0.92 → +1.63 → +2.22, rot, richtig gerundet, nie ein
    Vorzeichenwechsel; im HUD 172 rote, 0 grüne Pixel. Schneller (gegen den langsamen letzten Lauf): „-0.7“ grün.
    Konstanter Abstand 0.5 s bzw. -0.3 s über die ganze Etappe: **0 Vorzeichenwechsel, die Zahl wechselte 0 Mal**.
    Rundung: 0.84 → +0.8, 0.86 → +0.9, -1.26 → -1.3, 0.04 → 0.0, 0.06 → +0.1. Rauschen um 0.05 bzw. um 0.45: kein
    Wechsel. Höchstens 5 neue Anzeigen pro Sekunde.
  - (e) Keine Referenz / „Letzter Lauf“ ohne Lauf / nur andere Etappe: nichts angezeigt. Alte Bestzeit ohne Spur:
    Näherung mit 5 Punkten, am Checkpoint **-0.004 / -0.002 / -0.003 s** (genau), dazwischen bis 4.68 s daneben
    (siehe oben). „Bestzeit“ = Platz 1 (auch wenn er nicht zuerst im Speicher steht), „Letzter Lauf“ = der letzte
    Lauf, Wechsel wirkt sofort und beim nächsten Start. Der Zielbildschirm vergleicht weiter mit der Bestzeit.
  - (f) Browser-Speicher blockiert: keine Fehler, Vergleich innerhalb der Sitzung (höchstens 0.045 s beim gleichen
    Lauf), „Letzter Lauf“ der Sitzung ebenso.
  - (g) H: Zeit-Tafel, Minimap, Tachos weg, Hinweis unten, nach 1.5 s ist das ganze HUD leer; Pause, Countdown,
    „ZIEL!“ und Zielbildschirm bleiben sichtbar; nochmals H: wieder da. Auf J umgelegt: H tut nichts, J schaltet.
    Auf N gelegt: getauscht (Pace-Notes bekommt J). In TASTEN BELEGEN und STEUERUNG dabei. Nach dem Neuladen wieder an.
    Alte gespeicherte Belegung mit H auf der Handbremse: bleibt, HUD bekommt J.
  - (h) Gruppe ANZEIGE zwischen GRAFIK und STEUERUNG, Standardwerte an / an / Bestzeit, aus = im nächsten Bild weg,
    nach dem Neuladen noch so. 12 neue Texte in de und en, kein ß, alle Zeichen in der Pixelschrift (für BEST / LETZT /
    LAST bekam die kleine Tacho-Schrift A, B, L, S; `+` gab es schon).
  - (i) siehe Zahlen unten.
- **Zahlen**:
  - **Zeichenaufrufe (3D) vorher → nachher, gleiche Stellen: Start 123 → 123, 900 m 98 → 98, 1948 m 108 → 108,
    3170 m 70 → 70, Ziel 59 → 59** – gleich, mit und ohne Minimap. Minimap und Vergleich werden auf das HUD-Bild (2D)
    gemalt, nicht in die 3D-Szene.
  - **HUD zeichnen pro Bild**: mit Minimap ca. **0.18 ms**, ohne **0.15 ms** (+0.03 ms). Das ganze Bild dauert im Test
    mit Software-Grafik ca. 230 ms mit und ohne Minimap (gleich; die echte Grafikkarte ist viel schneller).
    Im Bildtakt entstehen durch Minimap und Vergleich keine neuen Objekte (Karte und Zahl werden nur bei einer Änderung
    neu gemalt, Zahlen-Puffer sind beim Laden angelegt).
  - **Ladezeit** (`node tools/ladezeit.mjs`, 2 x 9 Ladungen, Median alt → neu): 1406 → 1397 ms und 1361 → 1363 ms,
    also **kein messbarer Unterschied** (Budget +30 ms; die Karte selbst braucht 5–10 ms, das geht im Rauschen von
    ±150 ms unter).
- **Alle bisherigen Tests unverändert** (alte und neue Version gleichzeitig laufen gelassen, Ausgaben verglichen):
  Zeile für Zeile gleich bis auf Bauzeiten in ms, Datum und Zeitpunkte der Echtzeit-Tests: `testfahrer` **2:59.33 /
  2:42.35 / 2:31.92**, `abkuerzungen --pruefen` **127 / 2 / 342 / 84**, `pacenotes-test`, `startziel-test`, `aufprall`,
  `belag`, `felswand`, `felswand-sprites`, `getriebe`, `gras`, `handbremse`, `kuh`, `leben`, `lenk`, `nebenweg`,
  `rueckwaerts`, `strassenrand`, `stummel-sicht`, `nebenweg-wald`. **`menue-test` und `rennablauf-test` laufen ohne
  Anpassung durch** (im Menü-Test stehen jetzt die neuen Einstellungen in der Liste und 196 statt 184 Texte).
  Strecke, Physik, Sperren, Abkürzungen, Pace-Notes-Berechnung, Checkpoints, Rennzeit nicht angefasst (die Fahrspur
  liest nur Stelle und Zeit).

### Ehrlich beurteilt (bei 320x180 in Originalgrösse angeschaut)

- **Ist die Minimap bei 320x180 lesbar?** Teilweise. Man erkennt die **Form** der Etappe (unten links los, lange
  hinauf, oben nach rechts zum Ziel), **Start** (grün) und **Ziel** (Karo) sofort, das **Auto** dank dunklem Rand gut
  und die orange Linie zeigt klar, wie weit man ist. Die **Kehren** sieht man aber nicht einzeln: 1.8 x 1.9 km passen
  in 39 x 40 Pixel, eine Kehre ist kleiner als ein Pixel – sie werden zu einem kleinen Zickzack. Die
  **Checkpoint-Striche** sind klein (3 Pixel); weiss auf Blaugrau sieht man, grün auf Orange nur, wenn man hinschaut.
- **Stört sie das Bild oder die Pace-Notes?** Nein. Sie sitzt im Himmel/Berg-Bereich oben rechts, weit weg von den
  Pace-Notes (über 70 Pixel Abstand) und vom Auto. Die Tafel ist leicht durchsichtig wie die Zeit-Tafel; bei hellem
  Hintergrund (Fels, Schnee) scheint er etwas durch, die Linie bleibt aber lesbar.
- **Ist „-0.8“ auf einen Blick lesbar?** Ja, sehr: doppelte Schrift, grün/rot, mit Vorzeichen. Ehrlich: Die Zahl ist
  **grösser als die Zeit selbst** und zieht den Blick an – das ist Absicht (sie ist die wichtigere Information),
  kann aber dominant wirken. Wer das nicht mag, schaltet sie unter ANZEIGE aus.
- **Ruhig oder nervös?** Ruhig. Höchstens 5 Mal pro Sekunde, beim konstanten Abstand im Test wechselte die Zahl über
  die ganze Etappe kein einziges Mal. Nur wenn man **genau an der Grenze** fährt (z. B. konstant 0.06 s schneller),
  wechselt sie ein paar Mal zwischen weiss „0.0“ und grün „-0.1“ (im Test 4 Mal in 2.5 Minuten) – nie zwischen grün
  und rot.

### Bekannte Probleme

- **Alte Bestzeiten ohne Fahrspur** (aus M5b): Der Vergleich ist nur an den Checkpoints genau, dazwischen bis zu
  4.7 s daneben (bei den Kehren). Lösung: einmal eine neue Bestzeit fahren.
- Der Vergleich ist zwischen zwei 10-m-Werten gerade verbunden. Beim gleichen Lauf macht das höchstens 0.045 s aus
  (in den Kehren, wo das Tempo stark wechselt) – die Anzeige zeigt dann „0.0“.
- Bestzeiten des Testfahrers (fliegender Start) und Spielzeiten (Stehstart) sind wie bisher nicht direkt
  vergleichbar; in der ersten Sekunde nach GO ist der Vergleich gegen so eine Zeit etwas daneben.
- Minimap: Kehren nicht einzeln zu sehen (Massstab), Checkpoint-Striche klein.
- In den 3 s „ZIEL!“ verschwinden Minimap und Vergleich schon (die Zeiten zeigt dann der Zielbildschirm).
- Die Tachos schauen weiterhin unter dem Zielbildschirm hervor (mit H kann man sie jetzt ausblenden).
- Der „letzte Lauf“ wird bei BESTZEITEN LÖSCHEN nicht gelöscht.
- Gamepad hat keinen Knopf für HUD aus/an (wie gewünscht nur Tastatur).

### Ideen/Vorschläge (nicht umgesetzt)

- **Geisterauto aus der Fahrspur**: Die Spur sagt, wann die Bestzeit an jeder Stelle war – daraus lässt sich ein
  halbdurchsichtiges Auto fahren lassen (als nächster möglicher Schritt; Position alle 10 m reicht, dazwischen auf der
  Strassenmitte).
- Die Näherung für alte Bestzeiten besser machen: statt gerade zwischen den Checkpoints mit dem Tempo-Profil der
  Pace-Notes (in den Kehren langsamer) verteilen.
- Live-Vergleich kurz einblenden, wenn er sich stark ändert (z. B. nach einem Aufprall), sonst kleiner.
- In der Minimap die Nebenwege (Stummel) oder die Kehren-Nummern andeuten, oder eine grössere Karte in der Pause.
- „BESTZEITEN LÖSCHEN“ könnte auch den letzten Lauf löschen (heute bleibt er).
- Am Zielbildschirm wahlweise auch gegen den letzten Lauf vergleichen.

---

## Meilenstein 5b: Countdown, Zielbildschirm, Bestzeiten, Statistik ✅ (Verlauf, Stand damals)

### So läuft ein Rennen jetzt

1. **STARTEN** (Hauptmenü), **NEUSTART DER ETAPPE** (Pause) oder **NEU STARTEN** (Zielbildschirm) → **Countdown**.
   - Das Auto steht **mit der Schnauze an der Startlinie** (10 cm davor) und ist **gesperrt**: Gas, Lenken,
     Handbremse, Bremse/Rückwärts tun nichts, das Auto bewegt sich keinen Millimeter (auch nicht am Hang, es wird
     während des Countdowns gar nicht gerechnet).
   - In der Bildmitte erscheinen grosse gelbe Pixelzahlen **3**, **2**, **1** (je 1 s). Jede Zahl ist ganz am Anfang
     kurz eine Stufe grösser („Pop“, 0.08 s) und blendet in der letzten Viertelsekunde aus. Dann **GO!** in Grün
     (0.8 s). Kein Wackeln, kein Zoomen.
   - Die Hilfe unten links (Tasten) ist sichtbar wie vor dem Start, die Zeit steht auf 00:00.00 (gelb).
   - **R** und **N** (Pace-Notes) tun im Countdown nichts. **Esc / Start** und Fokusverlust (Tab wechseln) **frieren den
     Countdown ein**, WEITER macht genau dort weiter.
   - Pace-Notes: Sie laufen im Countdown wie früher vor dem Start. **Ehrlich:** Stehend sieht man dort noch **keine**
     Kachel, weil die erste Kurve weiter als 50 m weg ist (so war es auch früher vor dem Start). Die erste Kachel
     kommt kurz nach GO.
2. Bei **GO** wird das Auto frei, die Rennzeit beginnt bei **0.00**. An der Startlinie wird **nicht mehr** gemessen
   (die Linie zählt nur noch beim Testweg, siehe unten).
3. **Ziellinie** (wie bisher nur, wenn alle Checkpoints passiert sind): grosses „ZIEL!“ mit Endzeit und Zwischenzeiten
   wie bisher, das Auto rollt aus (`startZiel.zielBremse`). Die Zeit wird **sofort gespeichert**. Der alte Hinweis
   „R = Neustart“ ist weg.
4. Nach **3 Sekunden** blendet der **Zielbildschirm** ein. Dahinter läuft die Welt weiter (Auto rollt aus, Zuschauer
   jubeln), leicht abgedunkelt wie in der Pause. Pause gibt es hier keine, Esc tut nichts.

### Der Zielbildschirm

Tafel im Menü-Stil (dunkelblau, heller Rand, Titel gelb), von oben nach unten:

| Zeile | Was |
|---|---|
| Titel | **ZIEL!** – bei einer neuen Bestzeit stattdessen **NEUE BESTZEIT!**, blinkt gelb/grün |
| Platz | „PLATZ 4 VON 10“ (klein, hellblau), nur wenn die Zeit in den Top 10 ist und es keine neue Bestzeit ist. Beim allerersten Lauf nicht (dort steht „ERSTE ZEIT“) |
| Endzeit | gross (dreifache Schrift), Format wie das HUD: `02:31.91` |
| Vergleich | doppelt gross: **grün „-0.80“** = so viel schneller als die bisherige Bestzeit, **rot „+1.23“** = langsamer, weiss „0.00“ = gleich. Noch keine Zeit: „ERSTE ZEIT“. Verglichen wird mit der Bestzeit **vor** diesem Lauf |
| CP 1–3 | Zwischenzeiten, daneben der Unterschied zur Zwischenzeit der Bestzeit (gleiche Farben), falls es eine gibt. Verpasst: „--:--.--“ |
| Statistik | AUFPRÄLLE · RESETS · HÖCHSTTEMPO (km/h oder mph wie eingestellt) |
| Knöpfe | **NEU STARTEN** (vorgewählt) · **HAUPTMENÜ** (ohne Rückfrage, die Zeit ist schon gespeichert). R (Gamepad Y) = Neu starten |

Ohne Browser-Speicher steht klein „ZEIT WIRD NICHT GESPEICHERT“ über den Knöpfen.

### Bestzeiten

- **Top 10 pro Etappe**, schnellste zuerst. Bei gleicher Zeit steht die ältere vorn. Ein langsamerer Lauf kommt bei
  vollen 10 nicht hinein, ein schnellerer verdrängt den langsamsten.
- „Gleich“ heisst gleich in **Hundertsteln**, genau wie die Anzeige: Was auf dem Bildschirm gleich aussieht, zählt als
  gleich schnell (keine „neue Bestzeit“ für eine tausendstel Sekunde, die man nicht sieht).
- **Wo liegen sie?** Im Browser (pro Gerät, also Lenovo und Gaming-PC getrennt) unter dem Namen
  `alpineRally.bestzeiten`. Inhalt (je Etappe eine Liste, damit weitere Etappen ohne Umbau gehen):
  `{ "passstrasse": [ { "zeit": 151.91, "cps": [29.33, 86.4, 133.1], "datum": "2026-10-16T14:30:00.000Z",
  "auto": "rt4", "aufpralle": 0, "resets": 0, "hoechstTempo": 41.9 } ] }` – Zeiten in Sekunden, `hoechstTempo` in m/s,
  `auto` = Auto-Id aus `js/inhalte.js` (für später, wenn es mehrere Autos gibt). Alte Einträge aus M5a (nur `zeit`,
  `cps`, `datum`) werden genauso gelesen.
- **Seite BESTZEITEN**: Tabelle PLATZ | ZEIT | DATUM (Deutsch `16.10.26`, Englisch `2026-10-16`). Der Lauf, der gerade
  eingetragen wurde, ist **orange hinterlegt** – nur bis zum nächsten Start. Leer: „NOCH KEINE ZEITEN“.
- **Löschen im Menü**: EINSTELLUNGEN → Gruppe **DATEN** → **BESTZEITEN LÖSCHEN** → „SICHER?“ (NEIN ist vorgewählt) →
  JA löscht alle Etappen, danach steht kurz „BESTZEITEN GELÖSCHT“.
- **Löschen ohne Menü**: im Browser F12 → Konsole → `localStorage.removeItem('alpineRally.bestzeiten')` eingeben,
  Enter. (Oder in den Browser-Einstellungen die Website-Daten löschen – dann sind auch die Einstellungen weg.)
- **Ohne Browser-Speicher** (blockiert, privates Fenster mit Sperre): Das Spiel läuft normal. Die Zeiten gelten dann
  nur bis zum Neuladen (der Vergleich im Zielbildschirm geht innerhalb der Sitzung trotzdem), der Zielbildschirm sagt
  „ZEIT WIRD NICHT GESPEICHERT“.

### Statistik (nur im Rennen zwischen GO und Ziel; die Demo-Fahrt zählt nichts)

| Wert | Definition | Standard |
|---|---|---|
| Aufpralle | jeder harte Kontakt mit Baum, Stein, Stamm, Absperrung, Zaun, Leitplanke, Kuh und Felswand, wenn das Tempo **Richtung Hindernis** über der Schwelle liegt. Die **unsichtbaren Grenzen** (Abhang ohne Leitplanke, 45 m neben der Strasse) zählen **nicht** (Linos Entscheidung nach dem ersten Stand von M5b). Ein Aufprall zählt **einmal**: Danach zählt eine kurze Sperrzeit lang nichts (Entlangschleifen, Kleben mit Gas) | Schwelle 3 m/s (11 km/h), Sperrzeit 0.6 s |
| Resets | wie oft R wirklich ausgelöst hat (erst, wenn die Wartezeit durch ist und das Auto zurückgesetzt wurde) | – |
| Höchsttempo | höchstes Tempo zwischen GO und Ziel | – |

Alles wird bei jedem Start auf 0 gesetzt (auch NEUSTART aus der Pause). Gemessen wird an den Stellen, die es schon gab
(Kollision mit Hindernissen, Felswand); die Physik selbst ist unverändert.

### Testweg ohne Countdown (für die Test-Werkzeuge)

- `index.html?menue=aus` und `window.__alpineRally.start({ countdown: false })` starten **wie vor M5b**: Auto bei
  Meter 10 (`strasse.spawnBeiMeter`), die Zeit beginnt beim **Überfahren der Startlinie** (fliegender Start). NEU STARTEN
  und R nach dem Ziel bleiben auf diesem Weg ebenfalls ohne Countdown.
- `window.__alpineRally.start()` ohne Angabe = wie STARTEN im Menü (mit Countdown).
- Alle bisherigen Tests laufen so unverändert, die **Testfahrer-Zeiten bleiben 2:59.33 / 2:42.35 / 2:31.92**.
- **Ehrlich: Zeiten aus dem Spiel sind nicht direkt mit den Testfahrer-Zeiten vergleichbar.** Im Spiel ist es ein
  **Stehstart** an der Linie, die Testfahrer haben 15 m Anlauf. Gemessen (gleicher Testfahrer, einmal mit Stehstart):
  **+1.72 s** bei allen drei Profilen (3:01.04 / 2:44.08 / 2:33.65), an CP 1 ebenfalls +1.72 s.
- Kleine Eigenheit, schon immer so: Das Testwerkzeug rundet (2:31.92), das Spiel schneidet ab wie eine Stoppuhr
  (HUD und Zielbildschirm zeigen für denselben Lauf 02:31.91).

### Werte zum Drehen (`js/config.js`, neuer Block `rennablauf`)

| Wert | Was | heute |
|---|---|---|
| `schnauzeVorLinie` | so weit steht die Schnauze vor der Startlinie (Meter) | 0.1 |
| `zahlDauer` | Dauer jeder Zahl 3, 2, 1 (Countdown = 3 × so lang) | 1 s |
| `goDauer` | so lange steht GO! (das Auto fährt dann schon) | 0.8 s |
| `popDauer`, `ausblenden` | Pop am Anfang jeder Zahl, Ausblenden am Ende | 0.08 s / 0.25 s |
| `groesse`, `hoehe` | Grösse der Zahlen (Pixel je Schriftpunkt), Abstand von oben | 6 / 48 px |
| `farbeZahl`, `farbeGo`, `farbeSchatten` | Farben des Countdowns | gelb / grün / fast schwarz |
| `zielSchirmNach` | so lange nach der Ziellinie kommt der Zielbildschirm | 3 s |
| `abdunkeln` | Szene hinter dem Zielbildschirm abdunkeln | 0.45 (wie Pause) |
| `farbeSchneller`, `farbeLangsamer`, `farbeGleich` | Farben des Vergleichs | grün / rot / weiss |
| `farbeNeu` | Bestzeiten-Seite: gerade eingetragener Lauf | orange |
| `aufprallSchwelle` | Aufprall zählt ab diesem Tempo Richtung Hindernis | 3 m/s |
| `aufprallSperre` | danach zählt so lange kein weiterer Aufprall | 0.6 s |
| `VERSION` (ganz oben) | Versionsnummer | 0.5B |

Texte (Deutsch/Englisch) in `js/texte.js`: `ziel.*`, `bestzeiten.platz/zeit/datum`, `einst.daten`,
`einst.bestzeitenLoeschen`, `einst.loeschenHinweis`, `einst.geloescht`, `frage.loeschen`.

### So testest du

1. **STARTEN**: Countdown 3 – 2 – 1 – GO!. Während des Countdowns Gas geben und lenken: Das Auto rührt sich nicht.
   Bei GO losfahren: Die Zeit beginnt bei 0.
2. Im Countdown **Esc** drücken: Countdown steht. WEITER: Er läuft genau dort weiter. Dasselbe mit Tab-Wechsel.
3. Bis ins Ziel fahren: „ZIEL!“, nach 3 s der Zielbildschirm. Beim ersten Mal steht „ERSTE ZEIT“.
4. **NEU STARTEN** (oder R / Y): Countdown, Zeit 0. Nochmals ins Ziel: grün mit Minus = schneller (dann blinkt
   „NEUE BESTZEIT!“), rot mit Plus = langsamer, dazu „PLATZ … VON …“.
5. **HAUPTMENÜ** → BESTZEITEN: dein Lauf ist orange hinterlegt.
6. EINSTELLUNGEN → DATEN → BESTZEITEN LÖSCHEN → NEIN (nichts passiert) / JA (Liste leer).
7. Fragen an dich: Passt der Countdown zur Stimmung (oder lieber Ampel / Rallye-Startuhr)? Ist der Zielbildschirm
   auf beiden Rechnern gut lesbar? (Die unsichtbaren Grenzen zählen nicht als Aufprall, wie gewünscht.)

### Bilder (`screenshots/m5b/`, 1280x720, dazu je `-320x180`; neu erzeugen: `node tools/m5b-bilder.mjs`)

- `01-countdown-3`, `02-countdown-2`, `03-countdown-1`, `04-countdown-go`
- `05-ziel-neue-bestzeit` (vorher 2:45.00, jetzt 2:41.37: grün -3.63), `06-ziel-langsamer` (rot +3.25, Platz 2 von 2),
  `07-ziel-platz-5-von-10` (rot +8.62), `13-ziel-englisch-mph`, `15-ziel-erste-zeit`,
  `16-ziel-vor-dem-zielbildschirm` (die ersten 3 s: „ZIEL!“ wie bisher, ohne „R = Neustart“)
- `08-bestzeiten-10-hervorgehoben` (direkt nach Platz 5), `14-bestzeiten-englisch`, `12-bestzeiten-leer`
- `09-einstellungen-daten`, `10-rueckfrage-loeschen` („SICHER?“), `11-einstellungen-geloescht` (Meldung)

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/rennablauf.js` | **neu**: Anzeige des Countdowns (Zahlen einmal gemalt, dann nur kopiert) |
| `js/bestzeiten.js` | Speichern (Top 10, Platz, bisherige Bestzeit), Laden (auch altes Format), Löschen, Datum; alles mit `try/catch` |
| `js/main.js` | Zustände `countdown` und `ziel`, Start mit/ohne Countdown, Ziel eintragen, Statistik, Pause aus dem Countdown |
| `js/menueseiten.js` | Zielbildschirm, Bestzeiten-Tabelle, Gruppe DATEN, Rückfrage als wiederverwendbarer Baustein |
| `js/menue.js` | zwei kleine Erweiterungen: Titelfarbe pro Seite (Blinken), Kurztaste pro Seite (R = Neu starten) |
| `js/kollision.js` | gibt die Wucht des letzten Aufpralls nach aussen (`kollision.wucht`, nur lesen) |
| `js/hud.js` | „ZIEL!“ nur bis zum Zielbildschirm, Hinweis „R = Neustart“ entfernt |
| `js/ablauf.js` | Kommentar: die zwei neuen Zustände |
| `js/config.js`, `js/texte.js` | Block `rennablauf`, neue Texte, Version 0.5B |
| `tools/rennablauf-test.mjs` | **neu**: Test (a)–(k) |
| `tools/menue-test.mjs` | angepasst: STARTEN / NEUSTART führen jetzt in den Countdown (Teile a, c, g, h, i) |
| `tools/m5b-bilder.mjs` | **neu**: Bilder für diesen Meilenstein |

### Selbst getestet

- **Neuer Test `node tools/rennablauf-test.mjs`** – **alle 75 Prüfungen bestanden**, keine Konsolenfehler:
  - (a) Countdown in der echten Spielschleife mit gehaltenem Gas, Lenken, Handbremse und Bremse: Auto bewegt sich
    **keinen Millimeter** (genau gleiche Position), Zeit 0, R und N tun nichts (`rTaste()` = „gesperrt“). Auto steht
    mit der Schnauze bei 24.90 m (Startlinie 25 m). Dauer im Zeitraffer: **360 Schritte = 3.000 s** (eingestellt 3 s).
    Bei GO Zeit genau 0, 1 s später 1.000 s und das Auto fährt (18 km/h, 2.3 m). Am Hang (748 m, 5.4 % Gefälle): steht.
    `start({ countdown: false })`: ohne Countdown bei Meter 10.
  - (b) Esc im Countdown: Countdown steht 2.5 s lang auf 0.667 s; WEITER: +0.100 s im ersten Bild (ein Bild), dann
    weiter. Fokusverlust ebenso. Pause → NEUSTART DER ETAPPE beginnt den Countdown von vorn.
  - (c) Testfahrer „flott“ (Testweg ohne Countdown) bis ins Ziel: **2:31.92** (unverändert). Zielbildschirm nach
    **3.000 s** (360 Schritte), zeigt 02:31.91 (siehe „Eigenheit“ oben), „ERSTE ZEIT“. Esc und Rücktaste tun nichts,
    NEU STARTEN ist vorgewählt, Fokusverlust macht keine Pause.
  - (d) 10 Läufe sortiert, Plätze beim Eintragen stimmen; elfter schnellerer Lauf verdrängt den langsamsten, nie mehr
    als 10; langsamerer Lauf bei vollen 10: Platz 0, Liste unverändert; gleiche Zeit (in Hundertsteln) kommt hinter
    die ältere. Eintrag mit Zwischenzeiten, Auto, Aufprallen, Resets, Höchsttempo, Datum. „NEUE BESTZEIT!“ nur bei
    echter Verbesserung (nicht beim ersten Lauf, nicht bei gleicher Zeit).
  - (e) langsamer: rot „+1.23“, „PLATZ 2 VON 2“; Zwischenzeiten -0.20 grün / +1.23 rot / 0.00 weiss; schneller: grün
    „-0.80“, NEUE BESTZEIT! (blinkt gelb/grün), verglichen mit der Bestzeit **vor** dem Lauf; Höchsttempo 144 km/h =
    89 mph.
  - (f) localStorage blockiert: kein Fehler, „ZEIT WIRD NICHT GESPEICHERT“, Vergleich in der Sitzung geht, NEU STARTEN
    geht, BESTZEITEN zeigt die Zeiten der Sitzung.
  - (g) Baumaufprall (61 → 1 km/h, danach gut 1 s Vollgas am Baum): **genau 1**; mit 72 km/h in die unsichtbare
    Grenze 45 m neben der Strasse: **0**; R-Reset: 1; Höchsttempo = höchstes
    `physik.tempo` (108.2 km/h); Neustart: alles 0; Demo-Fahrt 60 s (auch mit erzwungenem Aufprall): 0.
  - (h) NEU STARTEN mit Enter, Taste R und Maus: Countdown, Zeit 0, Checkpoints zurück. HAUPTMENÜ: ohne Rückfrage,
    Demo fährt. **Gamepad** (simuliert): A auf STARTEN, A = NEU STARTEN, Y = Neu starten, B und Start tun im
    Zielbildschirm nichts.
  - (i) BESTZEITEN-Seite zeigt die Zeilen, der neue Lauf hervorgehoben, nach dem nächsten Start nicht mehr; Datum
    Englisch 2026-10-02; Löschen: Gruppe DATEN, SICHER? mit NEIN vorgewählt, NEIN löscht nichts, JA alles, danach
    „NOCH KEINE ZEITEN“.
  - (j) 19 neue Text-Schlüssel in de und en, kein ß, alle Zeichen in der Pixelschrift (es fehlte keines, `+` und `-`
    gab es schon). Der alte Text „R = Neustart“ ist weg.
  - (k) Bestzeiten im alten Format (nur zeit, cps, datum, unsortiert) werden gelesen, sortiert angezeigt und beim
    nächsten Lauf mit verglichen.
- **`node tools/menue-test.mjs`**: **alle Prüfungen bestanden**. Angepasst (weil STARTEN jetzt in den Countdown führt):
  (a) „STARTEN → Countdown“ statt „→ Rennen“, (c) ebenso, (g) wartet vor dem Fahren das Ende des Countdowns ab,
  (h) NEUSTART aus der Pause → Countdown, Auto an der Startlinie, (i) STARTEN → Auto an der Startlinie, Countdown.
- **Alle anderen Tests unverändert** (alte und neue Version gleichzeitig laufen gelassen, Ausgaben verglichen):
  **Zeile für Zeile gleich** bis auf Ordnerpfade und Bauzeiten in ms: `testfahrer` **2:59.33 / 2:42.35 / 2:31.92**,
  `pacenotes-test`, `startziel-test`, `aufprall`, `belag`, `felswand`, `felswand-sprites`, `getriebe`, `gras`,
  `handbremse`, `kuh`, `leben`, `lenk`, `nebenweg`, `rueckwaerts`, `strassenrand`, `stummel-sicht`, `nebenweg-wald`,
  `abkuerzungen --pruefen` **127 / 2 / 342 / 84**. Strecke, Physik, Sperren, Pace-Notes-Berechnung, Checkpoints nicht
  angefasst (die Statistik liest nur das Tempo, bevor eine Grenze wirkt).
- **Zeichenaufrufe** (3D, alt gegen neu an denselben Stellen): **genau gleich** – Start/Countdown 123, 900 m 98,
  1948 m 108, 3170 m 70, Ziel/Zielbildschirm 55. Countdown und Zielbildschirm werden auf das HUD-Bild (2D) gemalt:
  die Zahlen einmal beim ersten Zeigen, danach nur kopiert; der Zielbildschirm nur bei einer Änderung (bei neuer
  Bestzeit zweimal pro Sekunde fürs Blinken). Pro Bild entsteht dabei kein neues Objekt.
- **Ladezeit** (`node tools/ladezeit.mjs`, 2 Durchgänge mit je 9 Ladungen, Median alt → neu): 1433 → 1490 ms und
  1489 → 1488 ms, im Mittel **ca. +28 ms** (Budget +50 ms). Die einzelnen Ladungen schwanken um ±150 ms, die Messung
  ist hier ungenau.
- **Nebenbei gefunden und behoben**: Startete man mit dem **Gamepad** (A auf STARTEN, oder WEITER / Start in der
  Pause), lief die Spielschleife in diesem einen Bild ohne Eingabe in einen Fehler, und **über dem Spiel erschien der
  Fehlerbildschirm** („Cannot read properties of null“). Mit simuliertem Gamepad in der alten Version nachgestellt.
  Jetzt gilt in so einem Bild eine leere Eingabe. Lino hatte das Gamepad noch nicht getestet, darum ist es nie
  aufgefallen.

### Ehrlich beurteilt

- **Passt der Countdown zur Stimmung?** Ja, ziemlich: grosse gelbe Pixelzahlen (gleiches Gelb wie die Zeit) zwischen
  START-Banner und Autodach, GO! in Grün, nur ein kurzer Pop, nichts wackelt. Es wirkt eher Arcade (V-Rally) als echte
  Rallye (dort zählt eine Startuhr oder ein Streckenposten 5 – 4 – 3 – 2 – 1). Ohne Ton ist er noch etwas stumm –
  mit Piepsern in M7 wird er viel besser. Die „3“ der 5x7-Schrift sieht in Gross etwas eckig aus.
- **Ist der Zielbildschirm bei 320x180 lesbar und nicht überladen?** Lesbar ja: Endzeit dreifach, Unterschied
  doppelt gross, der Rest in der normalen Schrift mit klaren Spalten. Die Tafel ist aber gross (229 x 145 Pixel, mit
  Platz-Zeile 155, mit Platz-Zeile und Speicher-Hinweis 163 von 180 Pixeln hoch; sie rollt nie) – voll, aber geordnet. Mehr sollte nicht dazukommen.
- **Sieht man sofort, ob man schneller oder langsamer war?** Ja: Die grosse grüne oder rote Zahl direkt unter der
  Zeit ist das Zweite, was man sieht. Plus/Minus steht immer dabei, das hilft auch, wer Rot und Grün schlecht
  unterscheidet.
- **Stört das Ausrollen dahinter?** Nein. Nach 3 s rollt das Auto meist nur noch langsam, die Tafel deckt es zu, die
  Szene ist abgedunkelt. Nicht ganz schön: Unten rechts schauen die **Tachos halb unter der Tafel hervor**.

### Bekannte Probleme

- Im Countdown ist noch **keine Pace-Notes-Kachel** zu sehen (die erste Kurve ist im Stand weiter als 50 m weg; so war
  es auch früher vor dem Start). Sie kommt kurz nach GO.
- Spielzeiten (Stehstart) sind ca. **1.7 s langsamer** als die Testfahrer-Zeiten (fliegender Start), siehe oben.
- Die Tachos schauen unten rechts unter der Zielbildschirm-Tafel hervor.
- Die Hilfe unten links erscheint nur vor dem **ersten** Start einer Sitzung (wie bisher: sie verschwindet, sobald man
  einmal gefahren ist).
- R in den 3 Sekunden „ZIEL!“ startet sofort neu (wie bisher); die Zeit ist dann schon gespeichert, nur den
  Zielbildschirm sieht man nicht.
- Bestzeiten liegen pro Browser und Gerät (Lenovo und Gaming-PC haben je eigene Listen); ein privates Fenster vergisst
  sie beim Schliessen.
- Gamepad nur simuliert getestet (Knöpfe), nicht mit einem echten Gamepad.

### Ideen/Vorschläge (nicht umgesetzt)

- Die Startuhr der Zeitnahme neben dem Start-Bogen (zeigt heute fest „0:30“) mit dem Countdown mitzählen lassen.
- Piepser beim Countdown (3 tiefe, GO hoch) mit dem Ton in M7.
- Der Beifahrer „liest“ im Countdown schon die erste Ansage vor (erste Kachel sichtbar, auch wenn sie weiter weg ist).
- Tachos hinter dem Zielbildschirm ausblenden.
- Auf der Bestzeiten-Seite einen Eintrag wählen und seine Zwischenzeiten und Statistik ansehen.
- Zielbildschirm: „noch 0.42 bis Platz 4“, wenn man knapp an einem besseren Platz vorbei ist.
- Später ein Geist (Ghost) der Bestzeit – die Zwischenzeiten sind dafür schon gespeichert.

---

## Meilenstein 5a.1: Credits, Rückwärts-Tempo, Felswand (Bäume im Fels, Wurf) ✅ (Verlauf, Stand damals)

### 1. Credits: Mitwirkende und Unterstützer

- Unter „IDEE UND DESIGN: LINO / GEBAUT MIT CLAUDE“ stehen jetzt zwei Gruppen, je mit hellblauer Überschrift (gleiche
  Farbe wie die Gruppen in den Einstellungen) und darunter die Namen, **ein Name pro Zeile**:
  **MITWIRKENDE** (englisch CONTRIBUTORS): LOUIS – **UNTERSTÜTZER** (englisch SUPPORTERS): SHAI-RON.
- **Namen eintragen**: in `js/config.js`, Block `menue`, ganz unten:
  `credits: { mitwirkende: ['LOUIS'], unterstuetzer: ['SHAI-RON'] }`. Weitere Namen mit Komma dazu, z. B.
  `mitwirkende: ['LOUIS', 'ANNA']`. Grossbuchstaben, ohne Sonderzeichen (die Pixelschrift kennt A–Z, Ä Ö Ü, Ziffern,
  Bindestrich und ein paar Zeichen; der Menü-Test meldet, wenn ein Zeichen fehlt). Namen werden nicht übersetzt.
  Ist eine Liste leer (`[]`), erscheint die ganze Gruppe nicht.
- Die Überschriften stehen in `js/texte.js` (`credits.mitwirkende`, `credits.unterstuetzer`, Deutsch und Englisch).
- Mit den zwei Namen passt die Seite ganz auf den Bildschirm. Mit vielen Namen **rollt** sie: Pfeil runter / Mausrad
  (gelbe ▲/▼ am Rand wie bei den Einstellungen), Enter geht wie immer auf ZURÜCK. Neu im Menü-Baustein dafür:
  Seiten mit `rollen: true` (Textseiten) rollen mit hoch/runter, statt die Auswahl zu wechseln (`menue.rollenSchritt`
  = 10 Pixel pro Druck). Getestet mit 2, 6 und 12 Namen.
- Versionsnummer jetzt **0.5A.1**.

### 2. Rückwärts auf Asphalt schneller

- Vorher war rückwärts überall bei **6 m/s (22 km/h)** Schluss. Jetzt auf **Asphalt 9 m/s (32 km/h)**. Auf
  **Gras, Bankett, Schotter und Wiesenweg bleibt es bei 6 m/s** (sonst ändert sich das „Raus aus dem Gras“ aus M2c).
- Die Beschleunigung rückwärts ist **unverändert** (`auto.rueckwaertsBeschl` = 3 m/s²). Darum dauert es auf ebenem
  Asphalt aus dem Stand **ca. 3.5 s bis 32 km/h** (vorher 2.3 s bis 22 km/h); nach 2 s ist man gleich schnell wie
  vorher.
- **Kein Ruck**: Fährt man mit 32 km/h rückwärts vom Asphalt aufs Bankett oder ins Gras, springt das Tempo nicht auf
  22 km/h, sondern läuft mit der Reibung des Untergrunds aus (Gras: in ca. 0.9 s, Bankett: ca. 2.6 s). Gemessen:
  höchstens 3.6 m/s² Tempoverlust (Gras), ein harter Deckel wären 360 m/s² gewesen (Sprung in einem Bild).
- Tacho, Gang **R**, Drehzahl (ca. 4700 U/min bei 32 km/h), Digitalzahl, F3-Anzeige, km/h und mph (20 mph) stimmen.
- **Werte zum Drehen** (`js/config.js`):

| Wert | Was | heute |
|---|---|---|
| `untergrund.asphalt.rueckwaertsMax` | Rückwärts-Höchsttempo auf Asphalt = `auto.rueckwaertsTempo` mal diesem Wert | 1.5 (= 9 m/s = 32 km/h) |
| `auto.rueckwaertsTempo` | Rückwärts-Höchsttempo auf allen anderen Belägen | 6 m/s (22 km/h) |
| `auto.rueckwaertsBeschl` | wie schnell das Auto rückwärts losfährt (nicht geändert) | 3 m/s² |

  Andere Beläge können denselben Wert `rueckwaertsMax` bekommen (fehlt er, gilt 1).

### 3. Felswand

**Die Wand-Abschnitte** (aus den Streckendaten, Meter ab Strassenanfang; an jedem Ende 25 m weich ein-/ausgeblendet):

| Abschnitt | Seite | von – bis |
|---|---|---|
| Felswand 1 vor dem Almweg | links | 1914 – 1966 m |
| Felswand 1 nach dem Almweg | links | 2423 – 2494 m |
| Abfahrt-Wand (nach dem Wiesenweg) | rechts | 3132 – 3417 m |

**3a. Bäume im Fels – Ursache (zuerst mit einem Test gesucht, dann geändert)**
- Neuer Test (`tools/felswand-sprites-test.mjs`, Teil a): Für **jedes** Objekt aller Sorten (25 650 Stück: Tannen,
  Laubbäume, Steine, Felsbrocken, Stämme, Büsche, Grasbüschel, Jungtannen, Fernwald, Nebenweg-Wald, Sichtschutz,
  Strassenrand, Kühe, Fan-Spots/Alpweide/Wracks, Zuschauer, Start/Ziel, Absperrungen) wird mit einem senkrechten Strahl
  von oben geprüft, ob am Stamm (Mitte und rundherum) die **echte Felsfläche** (das gezeichnete Wand-Mesh) höher liegt
  als das Gelände. 1577 Objekte stehen bis 30 m an einer Wand, 1327 davon sind „Grenzfälle“ (der nächste
  Strassenpunkt hat keine Wand, aber einer daneben).
- **Ergebnis vorher: 29 Objekte im Fels – alle vom „Nebenweg-Wald“** (die lockeren Tannengruppen entlang der
  Abzweige, seit M3a). Dieser Teil prüfte die Felswand **gar nicht**. Er beginnt 42 m vor dem Almweg-Abzweig, also bei
  **ca. 1944 m – genau Linos Stelle bei 1948 m** (Tannen bis 14 m tief im Fels, die Krone schaut oben und vorne heraus).
  Weitere Stellen: nach der Almweg-Einmündung (2430 m, ein Stein am Wandanfang) und nach dem Wiesenweg (3164–3179 m,
  Abfahrt-Wand rechts, Tannen und Steine).
- Die Vermutung mit dem „nächsten Strassenpunkt“ (Wand-Enden, Kurven-Innenseiten) habe ich nachgemessen: Bei den
  normalen Bäumen, Büschen usw. stand **kein** Objekt im Fels (die Regel „bis 26 m neben der Strasse nichts“ ist dort
  grosszügig genug). Trotzdem prüfen jetzt auch diese beim Platzieren die echte Felsfläche (als Sicherung; heute fällt
  dort nichts weg).
- **Lösung**: Neu weiss die Welt, wie hoch der Fels an jedem Punkt ist (`welt.felsHoehe`, aus denselben Dreiecken wie
  das Wand-Mesh, unabhängig vom nächsten Strassenpunkt), und `welt.imFels(x, z, Radius)`. Der Nebenweg-Wald stellt
  keinen Baum und keinen Stein mehr dorthin. **Wichtig**: geprüft wird erst *nach* dem Würfeln, darum bleibt die
  Zufallsfolge gleich – **alle anderen Objekte stehen genau am selben Platz** (nachgeprüft: alle ~25 600 Positionen
  alt gegen neu verglichen, nur die 29 sind weg, keines ist neu oder verschoben). Die Wand selbst (Form, Höhe,
  Kollision) ist unverändert.
- **Entfernt (nach Sorte)**: **24 Tannen** und **5 Steine** (alle Nebenweg-Wald). Sonst nichts: 0 Laubbäume, 0
  Büsche/Gras, 0 Jungtannen, 0 Fernwald, 0 Strassenrand, 0 Kühe, 0 Leben, 0 Start/Ziel, 0 Absperrungen.
  Insgesamt 6190 statt 6214 Tannen und 866 statt 871 Steine.

**3b. Wurf am Wandanfang – Ursache und Lösung**
- *Ursache (gemessen, die Vermutung stimmte)*: Die Wand-Kollision (seit M3a.3) misst für jeden Punkt am Umriss des
  Autos „Abstand von der Strassenmitte minus Wandfläche“ und schiebt das Auto um diese Tiefe **quer zur Strasse**
  zurück. Kommt man aber von der Wiese her an den Anfang (oder das Ende) der Wand, steht das Auto schon *hinter* der
  Wandfläche – die Tiefe war dann 5 bis 8 m, und das Auto wurde **in einem einzigen Physik-Schritt (1/120 s) bis 7.7 m
  zur Strasse geschoben** (in 38 von 162 Testfahrten bis auf die Strasse). Dasselbe, schwächer, am weich
  auslaufenden Wand-Ende: Dort kommt die Wandfläche beim Längsfahren auf das Auto zu.
- *Lösung*: Jeder Umriss-Punkt wird auch dort geprüft, wo er einen Schritt vorher war.
  - **Von der Strasse her** (der Punkt war vor der Wandfläche und ist selbst quer hineingefahren): genau wie in M3a.3
    (Auto stoppt an der sichtbaren Fläche, Aufprall, Kamera) – der alte Felswand-Test ergibt Zeile für Zeile dieselben
    Zahlen (ausser den Rückwärts-Metern, siehe Teil 2).
  - **Von der Wiese, von hinten oder vom Wand-Ende her**: Der Fels wirkt wie ein zu steiler Hang. Nur der Teil der
    Bewegung *in den Fels hinein* wird zurückgenommen (und das Tempo in diese Richtung), entlang darf das Auto
    weiterrutschen. Frontal bleibt es stehen (wie an einem Baum), schräg rutscht es ab.
  - **Nie ein Sprung**: Die Korrektur ist pro Schritt höchstens so gross wie der Weg, den das Auto gefahren ist, plus
    3 cm (`grenze.wandSprungMax`).
- *Kamera*: Stand das Auto hinter der Wandfläche (auf der Wiese am Wandanfang oder am Hang hinter der Wand), setzte
  die Kamera-Regel aus M3a.3 die Kamera quer vor die Wand **auf die Strasse** – das sah auch wie ein Wurf aus (das war
  schon vor M5a.1 so). Jetzt bleibt die Kamera dann hinter dem Auto und wird nur aus dem Fels zum Auto hin gezogen.
  Von der Strasse her ist alles wie bisher.
- **Werte** (`js/config.js`, Block `grenze`): `wandSprungMax` (0.03 m: so viel darf die Wand pro Schritt mehr
  verschieben, als das Auto gefahren ist), `wandVorneToleranz` (0.1 m: stand ein Punkt vorher höchstens so tief in der
  Wand, zählt er als „von der Strasse her“). Block `felswand`: `imFelsToleranz` (0.05 m: ab so viel Fels über dem
  Gelände steht ein Objekt „im Fels“).

### So testest du

1. **Credits**: Hauptmenü → CREDITS: unter „Gebaut mit Claude“ MITWIRKENDE / LOUIS und UNTERSTÜTZER / SHAI-RON.
   Einstellungen → Sprache English: CONTRIBUTORS / SUPPORTERS. Zum Ausprobieren in `config.js` ein paar Namen dazu
   schreiben: Die Seite rollt mit Pfeil runter.
2. **Rückwärts**: auf der Strasse anhalten, Pfeil runter halten: Tacho geht bis ca. 32 km/h (Gang R). Ins Gras
   rückwärts: dort höchstens 22 km/h, beim Übergang kein Ruck, das Auto wird weich langsamer.
3. **Bäume im Fels**: bei **1948 m** (F3 zeigt die Meter) und an den Wand-Enden (1914, 1966, 2423, 2494, 3132, 3417 m)
   und bei 3170 m an die Wand schauen: keine Tanne mehr, die aus dem Fels wächst.
4. **Wurf**: vor 1914 m links neben der Strasse auf die Wiese (ca. 10–20 m neben der Strasse) und geradeaus auf den
   Anfang der Wand zufahren. Das Auto prallt am Fels ab oder rutscht daran entlang, bleibt aber auf der Wiese. Dasselbe
   am Ende der Wand (von 1990 m rückwärts zur Wand) und an der rechten Wand der Abfahrt (vor 3132 m, nach 3417 m).
5. Von der Strasse her gegen die Wand fahren: wie bisher (stoppt am Fels, rückwärts raus, Kamera vor der Wand).

### Bilder (`screenshots/m5a-1/`, 1280x720, „-a“ = vorher, „-b“ = nachher; neu erzeugen: `node tools/m5a1-bilder.mjs`)

- `credits-de-b.png`, `credits-en-b.png` (dazu je `-320x180`), `credits-probe-6-namen-oben/unten-b.png` (Probe mit
  6 Namen: oben und ganz hinunter gerollt).
- `fels-01` … `fels-09` (a und b): 1948 m (nah und Fahrersicht), Wandanfang 1914 m, Wandende 1966 m, 2430 m,
  Wandende 2494 m, 3170 m (Abfahrt), Wandanfang 3132 m, Wandende 3417 m. Gut zu sehen: `fels-04` (1966 m),
  `fels-05` (2430 m) und `fels-07` (3170 m) – vorher Tannen quer durch den Fels, nachher sauberer Fels.
  `fels-09` ist vorher und nachher gleich (dort stand nichts im Fels).
- `wurf-fest-1/2/3` und `wurf-spiel-1/2/3` (a und b): Auto fährt 18 m neben der Strasse mit 60 km/h geradeaus auf
  den Wandanfang bei 1914 m; Bilder kurz vor, kurz nach der Berührung und 0.6 s später, einmal mit fester Kamera von
  der anderen Strassenseite, einmal mit der Spielkamera. Vorher (a): im zweiten Bild steht das Auto plötzlich auf der
  Strasse vor der Wand (in 3 Physik-Schritten, also 0.025 s, gut 10 m zur Strasse hin, auf 5 m neben der Mitte). Nachher (b): es prallt seitlich an den Fels
  und bleibt auf der Wiese stehen.

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/world.js` | `welt.felsHoehe(x, z)` und `welt.imFels(x, z, r)`: Felsfläche aus den Wand-Dreiecken (Raster, schnell) |
| `js/sprites.js` | Nebenweg-Wald, Bäume/Steine und Büsche prüfen die echte Felsfläche (erst nach dem Würfeln) |
| `js/main.js` | Wand-Kollision `wandKontakt` (von der Strasse her / von der Wiese her, nie ein Sprung), Kamera hinter der Wand |
| `js/physics.js` | Rückwärts-Höchsttempo je Untergrund, weicher Übergang beim Belagwechsel |
| `js/menue.js`, `js/menueseiten.js` | Credits mit Namenslisten, Textseiten rollen |
| `js/config.js`, `js/texte.js` | neue Werte (siehe oben), Überschriften, Version 0.5A.1 |
| `tools/felswand-sprites-test.mjs` | **neu**: (a) Objekte im Fels, (b) Wurf-Test |
| `tools/rueckwaerts-test.mjs` | **neu**: Rückwärts-Tempo je Untergrund, Übergang ohne Ruck, Gang R und Tacho |
| `tools/menue-test.mjs` | neuer Teil (j): Credits |
| `tools/gras-test.mjs` | Prüfstellen nur, wenn auf dem Weg zur Strasse kein Fels steht (siehe unten) |
| `tools/m5a1-bilder.mjs` | **neu**: Bilder für diesen Meilenstein |

### Selbst getestet

- **`node tools/felswand-sprites-test.mjs`** (neu, den alten `felswand-test` habe ich nicht verändert):
  - (a) 25 621 Objekte geprüft, 1548 bis 30 m an einer Wand, 1327 Grenzfälle: **0 im Fels** (vorher 29). Gegenprobe
    `welt.imFels` gegen den Strahl auf das Mesh: 0 Abweichungen.
  - (b) 162 Fahrten von der Wiese (8 / 12 / 18 m neben der Strasse, 30 / 60 / 100 km/h, 0° / 15° / 45°, Anfang und Ende
    aller drei Wände): grösster Überschuss pro Schritt **3 cm** (vorher **7.7 m**), **0** Fahrten nur wegen der Wand auf
    der Strasse (vorher 38). Karosserie im Fels: Median 0 cm, 90 % höchstens 5 cm, am meisten 20 cm.
- **`node tools/felswand-test.mjs`** (Strassenseite, M3a.3): **Zeile für Zeile gleich** wie vorher, ausser den
  Rückwärts-Metern nach dem Aufprall (bis +1.1 m, schnellerer Rückwärtsgang). Gegenprobe mit Rückwärts-Faktor 1:
  ganz gleich. Kamera an der Wand: mindestens 63 cm Luft (gleich).
- **`node tools/rueckwaerts-test.mjs`** (neu): Asphalt 9.00 m/s, 99 % davon nach 3.47 s; Bankett, Gras, Schotter,
  Wiesenweg 6.00 m/s; Untergrund ohne `rueckwaertsMax` 6.00 m/s; Übergang Asphalt → Gras höchstens 3.6 m/s²,
  → Bankett 1.2 m/s² (harter Deckel wären 360 m/s²); Gang R, 4724 U/min, 32 km/h / 20 mph. Alles erfüllt.
- **`node tools/menue-test.mjs`**: **alle 50 Prüfungen bestanden** (neu (j): Deutsch und Englisch die richtigen
  Überschriften und Namen, ein Name pro Zeile; leere Liste = keine Gruppe; 2 Namen passen ohne Rollen
  (Tafel 259x149 Pixel), 6 und 12 Namen rollen bis ganz unten und zurück, Tafel bleibt im Bild; Enter nach dem Rollen
  = ZURÜCK; Namen nur mit Zeichen der Pixelschrift; neue Schlüssel in de und en). Keine Konsolenfehler.
- **Unverändert** (alte und neue Version laufen gelassen, Ausgaben verglichen): `testfahrer` **2:59.33 / 2:42.35 /
  2:31.92** (gleich), `pacenotes-test` (gleich, nur die Rechenzeit in ms schwankt), `abkuerzungen --pruefen`
  **127 / 2 / 342 / 84** (gleich; nur 29 Hindernisse weniger), `belag-test`, `getriebe-test`, `handbremse-test`
  (gleich). Strecke 3667.587 m, Sperren, Checkpoints, Pace-Notes-Berechnung nicht angefasst.
- **Abweichungen, alle vom schnelleren Rückwärtsgang** (Prüfungen weiter erfüllt): `aufprall-test` (rückwärts weg
  8.28 → 8.39 m), `kuh-test` und `leben-test` (rückwärts 19.1 → 20.3 m usw.), `strassenrand-test` (8.8 → 8.9 m),
  `lenk-test` (rückwärts 21.6 → 25.1 km/h nach 1.5 s), `startziel-test` (nach dem Rückwärtsfahren mind. 7.5 statt
  3.3 m weg), `nebenweg-test` (Stummel-Manöver 20.64 → 21.47 s; mit Rückwärts-Faktor 1 Zeile für Zeile gleich).
- **`gras-test`** fiel zuerst durch (18 von 20): Durch die 29 entfernten Objekte gibt es andere freie Wiesenstellen,
  und der Test wählte zwei Stellen direkt hinter Wand-Enden (2495 m links, 3420 m rechts), wo zwischen Auto und Strasse
  **bis 12 m hoher Fels** steht. Die alte Version kam dort nur **dank des Wurf-Bugs** raus (Sprünge von 7 m durch die
  Wand, nachgemessen). Der Test wählte diese Stellen, weil er (wie die Bäume) nur den nächsten Strassenpunkt fragte.
  Jetzt nimmt er nur Stellen, deren Weg zur Strasse frei von Fels ist: **20 von 20 raus**, alle anderen Prüfungen wie
  vorher (die Physik-Werte am Anfang sind gleich).
- **`nebenweg-wald`**: „Abkürzen ist nirgends schneller als die Strasse“ (gleich); Almweg 354 statt 372 Tannen, Wiesenweg
  271 statt 277 Tannen im Messbereich.
- **Leistung**: Zeichenaufrufe an 6 Stellen **genau gleich** (Start 123, 900 m 98, 1948 m 108, 2430 m 104, 3170 m 70,
  Ziel 59), 58 Dreiecke weniger (die 29 Sprites). Die Wand-Prüfung rechnet nur nahe einer Wand (±40 m) und braucht
  keine neuen Objekte pro Bild. **Ladezeit** (`node tools/ladezeit.mjs`, je 9 Ladungen, Median): alt 1528 ms, neu
  1471 ms – kein messbarer Unterschied (Schwankung ±200 ms).

### Ehrlich beurteilt

- **Wand-Enden**: sehen jetzt sauber aus. Es fehlen nur Bäume, die *im* Fels standen; der Wald neben und hinter den
  Wand-Enden ist unverändert, eine kahle Stelle sehe ich nicht – wo vorher eine Tanne quer durch die Wand ragte, sieht
  man jetzt den Fels (bei 1966 m und 3170 m ein Stück mehr Fels, bei 2430 m ein Stück Wandanfang mehr).
- **Auto an der Wand von der Wiese her**: wirkt wie an einem Felsen: frontal hart zum Halt (von 57 auf 1 km/h, wie an
  einem Baum), schräg rutscht es ab. Das Auto steckt dabei meist gar nicht im Fels (Median 0 cm, 90 % der Fahrten
  höchstens 5 cm), am meisten 20 cm (am Ende der Abfahrt-Wand, schräg mit 30 km/h). Das sieht man kaum, ist aber nicht
  ganz so genau wie von der Strasse her (dort höchstens 1 cm).
- Am Wandanfang ist das Gelände auf der Wandseite oft steil (Hang); dort kippt das Auto sichtbar zur Seite. Das war
  vorher auch so.

### Bekannte Probleme

- Von der Wiese her kann die Karosserie an schrägen Stellen bis ca. 20 cm im Fels stecken (siehe oben).
- Fährt man am weich auslaufenden Wand-Ende (die ersten/letzten Meter) längs ganz nahe am Fels, lenkt die schräge
  Wandfläche das Auto etwas zur Strasse hin (höchstens so viel, wie es fährt, kein Sprung). In 1 von 162 Testfahrten
  kam das Auto dadurch 0.1 s früher auf die Strasse als ganz ohne Wand (es fuhr sowieso dorthin).
- Gamepad testet Lino später (unverändert seit M5a).

### Ideen/Vorschläge (nicht umgesetzt)

- Ein kleines Kratz-/Staubwölkchen, wenn das Auto am Fels entlangrutscht (passt zu Ton in M7).
- Credits: Namen in zwei Spalten, wenn es mehr als ca. 8 werden (dann rollt die Seite weniger).

---

## Meilenstein 5a: Menüs (Titel, Hauptmenü, Pause, Einstellungen, Sprache) ✅ (Verlauf, Stand damals – Credits und Version seit M5a.1 erweitert)

### Was wurde gebaut?

**1. Ablauf**
- **Laden** → **Titelbildschirm**: gross „ALPINE RALLY“, darunter blinkend „TASTE DRÜCKEN“, unten rechts die
  Versionsnummer. Jede Taste, jeder Mausklick und jeder Gamepad-Knopf geht weiter (dieser erste Tastendruck wird
  später gebraucht, damit der Browser Ton erlaubt).
- **Hauptmenü** → **STARTEN** → Rennen wie bisher (noch **ohne** Countdown, der kommt in M5b).
- Im Rennen: **Esc** (Gamepad: **Start**) = **Pause**. Wechselt man den Browser-Tab oder klickt in ein anderes
  Fenster, kommt die Pause **von selbst**. Verlässt man das Vollbild, ebenso.
- Esc im Hauptmenü geht zurück zum Titel.

**2. Demo-Fahrt hinter Titel und Hauptmenü**
- Hinter dem Menü läuft die echte 3D-Welt: Der **Testfahrer** (gleiche Lenk- und Tempo-Logik wie
  `tools/testfahrer-browser.js`, Fahrstil „mittel“) fährt die Etappe mit der echten Fahrphysik. Staub,
  Zuschauer, Rauch bewegen sich wie im Spiel.
- Die Kamera wechselt alle 7–9 Sekunden **weich** (1.6 s Überblendung der Kameraposition, kein Schnitt) zwischen
  4 Blickwinkeln: **Verfolger seitlich**, **Front tief** (vor dem Auto, knapp über der Strasse), **von vorn oben**,
  **Berge mit Auto klein** (weit hinten seitlich, Blick über das Auto hinweg in die Berge). Die Kameras gehen nicht
  in die Felswand und nicht unter das Gelände (gleiche Regeln wie die Spielkamera).
- Nach dem Ziel rollt das Auto aus, das Bild blendet kurz ab und die Fahrt beginnt von vorn.
- Die Szene ist leicht abgedunkelt (32 %), damit die Menütafeln gut lesbar sind.
- Die Demo-Fahrt schreibt **nichts** in den Rennstand (keine Zeit, keine Checkpoints, keine Pace-Notes, keine
  Bestzeit). Technisch: sie benutzt nur den Fahr-Teil des Physik-Schritts, die Zeitmessung läuft gar nicht.
  **STARTEN** setzt das Auto sauber an die Startposition (Zeit 0, alles zurück).
- Kein HUD, keine Pace-Notes während der Demo. Es kommen keine neuen 3D-Objekte dazu.

**3. Hauptmenü und Seiten**

STARTEN · AUTO · ETAPPE · BESTZEITEN · EINSTELLUNGEN · STEUERUNG · CREDITS

- **AUTO**: das eine Auto (Ringwerk RT4, „Allrad · 5 Gänge Automatik“, „Schweres Rallyauto der 80er“), mit „GEWÄHLT“.
  **ETAPPE**: Passstrasse, **3.6 km** (Startlinie bis Ziellinie, aus der Strecke gerechnet), **3 Checkpoints**,
  Beläge. Beides sind Listen (`js/inhalte.js`): ein weiteres Auto oder eine weitere Etappe ist ein neuer Eintrag,
  das Menü zeigt dann alle untereinander.
- **BESTZEITEN**: zeigt „NOCH KEINE ZEITEN“. Die Seite liest schon den Speicher `alpineRally.bestzeiten`; M5b muss
  dort nur noch Zeiten hineinschreiben.
- **STEUERUNG**: Tabelle der **aktuell** belegten Tasten und Gamepad-Knöpfe (aus der Belegung gelesen, ändert sich
  mit), darunter **PACE-NOTES-SYMBOLE**: alle 18 Symbole, gemalt mit **denselben Zeichenfunktionen** wie im Rennen
  (`js/pacenotesbild.js`), je mit einem kurzen Satz. Die Liste rollt (Pfeile).
- **CREDITS**: Titel, Version (`VERSION` oben in `js/config.js`, jetzt „0.5A“), „Idee und Design: Lino“, „Gebaut mit
  Claude“, „Alle Autos, Namen und Orte sind erfunden.“
- Jede Seite hat eine Titelzeile und **ZURÜCK** als letzten Punkt.

**4. Aussehen**
- Tafeln wie die Zeit-Tafel des HUDs: dunkelblau, heller 1-Pixel-Rand, abgeschrägte Ecken. Titelzeile gelb.
- Der **gewählte Eintrag**: **Pfeil ▶ davor** + **orange** Schrift + leicht orange hinterlegt (nicht nur Farbe).
  Gruppen-Überschriften hellblau, Werte gelb, Hinweise grau.
- Alles im 320x180-Raster mit der eigenen 5x7-Pixelschrift. Die Schrift steht jetzt in `js/pixel.js` (vorher in
  `js/hud.js`) und hat neue Zeichen bekommen: ? % < … ' & · Pfeile (↑ ↓ ← →) und ▲ ▼ ▶. Ä Ö Ü gab es schon.
- Seitenwechsel: kurz ausblenden und einblenden (0.2 s zusammen). Tafeln sind nur so breit wie nötig.
- Ist eine Seite länger als der Bildschirm (Einstellungen, Symbole), rollt sie mit; gelbe ▲/▼ am rechten Rand
  zeigen, dass es weitergeht.

**5. Einstellungen** (alle sofort wirksam, alle im Browser gespeichert unter `alpineRally.einstellungen`;
ohne Browser-Speicher läuft alles mit den Standardwerten)

| Gruppe | Einstellung | Standard | Was es macht |
|---|---|---|---|
| Grafik | Vollbild | aus | an/aus; ist es gespeichert, geht es beim ersten Tastendruck auf dem Titel wieder an (Browser erlauben Vollbild nur nach einem Tastendruck) |
| Grafik | Pixelgrösse | 320x180 | 320x180 (Original-Look), 480x270, 640x360. Nur das 3D-Bild wird feiner, HUD und Menü bleiben im 320x180-Raster. Hinweis im Menü: „Schärfer = weniger Retro und mehr Last“ |
| Grafik | Pace-Notes | an | gleich wie Taste N (beide bleiben gleich) |
| Grafik | Einheiten | km/h | km/h oder mph: Tacho (eigenes Zifferblatt bis 120 mph), Digitalzahl und F3-Anzeige |
| Grafik | FPS-Anzeige (F3) | aus | gleich wie Taste F3 (wird jetzt auch gemerkt) |
| Steuerung | Tasten belegen | siehe Tabelle oben | eigene Seite, siehe unten |
| Steuerung | Lenkempfindlichkeit | 100 % (Mitte) | 5 Stufen: 60 / 80 / **100** / 125 / 150 %. Tastatur: so schnell baut sich der Lenkeinschlag auf. Stick: bei mehr als 100 % lenkt schon wenig Ausschlag stärker. 100 % = genau wie bisher |
| Steuerung | Gamepad-Totzone | 12 % (Mitte) | 5 Stufen: 4 / 8 / **12** / 18 / 25 %. 12 % = genau wie bisher |
| Ton | Lautstärke | 70 % | 0–100 % in 5er-Schritten. Wirkt erst, wenn es Ton gibt (M7), wird aber schon gespeichert |
| Sprache | Sprache | Deutsch | Deutsch / English, sofort |

**Tasten belegen**: Tabelle mit Gas, Bremse/Rückwärts, Links, Rechts, Handbremse, Zurück auf Strasse, Pace-Notes,
je **Taste 1** und **Taste 2**. Mit Pfeil links/rechts das Feld wählen, Enter → „TASTE DRÜCKEN…“ → neue Taste.
- **Esc** bricht ab, **Entf** leert das Feld (nur bei Taste 2; Taste 1 darf nicht leer sein).
- Ist die Taste schon vergeben, wird **getauscht** (die andere Aktion bekommt die alte Taste von hier), Meldung
  „GETAUSCHT MIT …“. Eine Taste ist **nie doppelt** belegt. Geht ein Tausch nicht (die andere Aktion hätte gar keine
  Taste mehr), kommt „SCHON BELEGT: …“.
- **Esc, Enter und F3** sind reserviert („… IST RESERVIERT“).
- **STANDARD** stellt alle Tasten zurück.
- Die Hilfe vor dem Start (unten links) und „R oder Y = Neustart“ im Ziel zeigen die aktuelle Belegung.
- Das Gamepad ist fest belegt (Standard-Belegung, Knopf-Nummern in `config.js`, `menue.gamepad`).

**6. Pause**
- WEITER · NEUSTART DER ETAPPE · EINSTELLUNGEN · ZUM HAUPTMENÜ (mit Rückfrage „SICHER?“, NEIN ist vorgewählt).
- **Alles friert ein**: Rennzeit, Physik, R-Countdown, Staub, winkende Zuschauer, Rauch, Tacho-Nadeln, Pace-Notes.
  Die Zeit läuft in der Pause nicht weiter; nach WEITER geht es nahtlos weiter (kein Sprung).
- Hintergrund: das eingefrorene Bild, abgedunkelt (45 %), das HUD bleibt sichtbar.
- NEUSTART setzt Zeit, Checkpoints, Pace-Notes und Auto wie ein frischer Start zurück, ohne die Seite neu zu laden.
- Esc oder Start in der Pause = WEITER.

**7. Sprache**
- Alle sichtbaren Texte stehen jetzt in **einer** Datei: **`js/texte.js`**, Deutsch und Englisch nebeneinander
  (163 Texte), Deutsch in Schweizer Schreibweise (ss). Auch die HUD-Texte („ZEIT“/„TIME“, „ZIEL!“, „CHECKPOINT
  VERPASST“, F3-Anzeige, Tacho-Beschriftung „KM/H“/„MPH“, Lade-Text) kommen von dort.
- **Texte ändern**: in `js/texte.js` den Text zwischen den Anführungszeichen ändern. `{taste}` usw. sind Platzhalter
  und müssen stehen bleiben. Die Pixelschrift kennt nur Grossbuchstaben, Ziffern, Ä Ö Ü und ein paar Zeichen – der
  Test meldet, wenn ein Zeichen fehlt.
- Die Pace-Notes sind Symbole und bleiben gleich.

**8. Bedienung (Tastatur, Gamepad, Maus gleichzeitig)**
- Tastatur: Pfeile/WASD, Enter/Leertaste = bestätigen, Esc/Rücktaste = zurück. Links/rechts ändert Werte.
- Gamepad: Steuerkreuz oder linker Stick (gehalten = wiederholt), A/Kreuz = bestätigen, B/Kreis = zurück,
  Start = Pause/Weiter.
- Maus: zeigen = wählen, klicken = bestätigen (bei Auswahl: linke Hälfte = zurück, rechte = weiter), Regler ziehen,
  Mausrad = rauf/runter.
- **Touch vorbereitet**: Das Menü ist ein kleiner Baustein (`js/menue.js`) mit Einträgen vom Typ Aktion,
  Umschalter, Regler, Auswahl, Tastenbelegung (dazu Überschrift und freie Zeile). Er kennt keine Eingabeart, nur
  „hoch, runter, links, rechts, bestätigen, zurück, Zeiger bei x/y“. Jede Zeile ist eine Trefferfläche über die
  ganze Tafelbreite und 11 Pixel hoch (bei 1280x720 also 44 Bildschirm-Pixel). Touch muss später nur noch die
  Finger-Ereignisse an dieselben Funktionen geben.

**9. Vorbereitung für M5b**
- **Zustandsmaschine** in `js/ablauf.js`: Zustände titel, menue, rennen, pause. Jeder Zustand sagt, ob die Welt läuft
  (Rennen, Demo oder eingefroren), ob HUD und Menü sichtbar sind und wie stark abgedunkelt wird. M5b hängt
  „countdown“ und „ziel“ mit `ablauf.registriere(...)` ein, ohne die Spielschleife umzubauen.
- Bestzeiten: Seite `bestzeiten`, Speicher `alpineRally.bestzeiten`, Lesen in `js/bestzeiten.js` (Top 10 je Etappe).

### Neue und geänderte Dateien

| Datei | Was |
|---|---|
| `js/ablauf.js` | Zustandsmaschine (titel, menue, rennen, pause; M5b: countdown, ziel) |
| `js/menue.js` | Menü-Baustein: Seiten, Einträge, Zeichnen, Bedienung, Trefferflächen |
| `js/menueseiten.js` | alle Menüseiten |
| `js/texte.js` | alle sichtbaren Texte Deutsch/Englisch |
| `js/einstellungen.js` | Einstellungen laden/speichern, Tastenbelegung (tauschen, nie doppelt) |
| `js/demofahrt.js` | Demo-Fahrt und Demo-Kameras |
| `js/inhalte.js` | Listen der Autos und Etappen fürs Menü |
| `js/bestzeiten.js` | Bestzeiten lesen (für M5b) |
| `js/pixel.js` | Pixelschrift (von `hud.js` hierher, mit neuen Zeichen) und Tafel-Zeichnen |
| `js/input.js` | Tasten frei belegbar, Lenkempfindlichkeit, Totzone, Esc/Start = Pause, Gamepad-Knöpfe einmal pro Bild |
| `js/hud.js`, `js/tacho.js` | Texte aus `texte.js`, Tacho in km/h oder mph |
| `js/main.js` | Ablauf, Demo, Pause, Einstellungen; der Physik-Schritt kann „nur fahren“ (Demo) |
| `js/config.js` | neuer Block `menue`, Konstante `VERSION`, mph-Skala beim Tacho |

### Werte zum Drehen (`js/config.js`, Block `menue`)

| Wert | Was | heute |
|---|---|---|
| `menue.an` | false = ohne Titel/Menü starten (wie `?menue=aus`) | true |
| `menue.standard` | alle Standardwerte der Einstellungen inkl. Tastenbelegung | siehe Tabelle oben |
| `menue.aufloesungen` | die Pixelgrössen zur Auswahl | 320x180, 480x270, 640x360 |
| `menue.lenkStufen`, `menue.totzonen` | Stufen der zwei Regler (Mitte = wie bisher) | 0.6–1.5 / 0.04–0.25 |
| `menue.reserviert` | Tasten, die man nicht belegen kann | Esc, Enter, F3 |
| `menue.gamepad` | Knopf-Nummern (Gas, Bremse, Handbremse, Zurück, Pause, Menü) | Standard-Belegung |
| `menue.farbe…` | Farben der Tafeln, Auswahl (orange), Titel (gelb), Gruppen (hellblau) | |
| `menue.zeile`, `menue.innen`, `menue.ecke` | Zeilenhöhe (auch Trefferfläche), Rand, Ecken | 11 / 6 / 2 px |
| `menue.abdunkeln`, `menue.abdunkelnPause` | Szene hinter Menü / Pause abdunkeln | 0.32 / 0.45 |
| `menue.blende`, `menue.blinken` | Seitenwechsel, Blinken von „TASTE DRÜCKEN“ | 0.2 s / 0.55 s |
| `menue.demo.kameras` | die 4 Demo-Kameras: Lage zum Auto, Blickziel, Dauer | 9 / 7 / 7 / 9 s |
| `menue.demo.wechsel` | Dauer der weichen Kamera-Überblendung | 1.6 s |
| `menue.demo.quer`, `menue.demo.bremsen` | Fahrstil des Demo-Fahrers | 6 / 6.5 (wie „mittel“) |
| `VERSION` (ganz oben) | Versionsnummer in den Credits und auf dem Titel | 0.5A |

### Für Tests: am Menü vorbei

- In der Adresse **`?menue=aus`** anhängen (z. B. `…/alpine-rally/index.html?menue=aus`): Das Spiel startet wie
  früher direkt im Rennen (ohne Titel und Menü). Die Pause mit Esc gibt es trotzdem.
- Oder im Browser: `window.__alpineRally.start()` – wie „STARTEN“ im Menü.
- Die Test-Werkzeuge laden das Spiel über `tools/spiel-browser.mjs`; dort hängt `ladeSpiel()` jetzt `?menue=aus`
  an (und `tools/abkuerzungen.mjs`, das einen eigenen Server hat). Die Tests selbst sind unverändert.
  Mit `ladeSpiel(false, { menue: true })` lädt ein Werkzeug das Spiel mit Menü (so macht es der neue Menü-Test).

### So testest du

1. Spiel öffnen: Titel „ALPINE RALLY“, darunter blinkt „TASTE DRÜCKEN“, dahinter fährt das Auto. Eine Taste drücken.
2. Im Hauptmenü ein paar Sekunden nichts tun: Die Kamera wechselt weich, das Auto fährt die ganze Etappe.
3. Alle Seiten anschauen (Pfeile + Enter, Esc zurück), auch mit Maus und Gamepad.
4. EINSTELLUNGEN: Pixelgrösse auf 640x360 stellen, starten, vergleichen. Einheiten auf mph: Tacho zeigt bis 120.
   Sprache auf English: alles sofort Englisch. Seite neu laden: alles ist noch so eingestellt.
5. TASTEN BELEGEN: z. B. Gas auf G legen, starten, mit G fahren. Eine schon vergebene Taste nehmen: wird getauscht.
6. Im Rennen Esc: Pause, Zeit steht. Ein paar Sekunden warten, WEITER: Zeit läuft ohne Sprung weiter. Während der
   Fahrt den Tab wechseln: beim Zurückkommen ist Pause.
7. Pause → NEUSTART DER ETAPPE: Zeit 0, Auto am Start. Pause → ZUM HAUPTMENÜ → SICHER? → JA.
8. Fragen an dich: Ist die Schrift auf beiden Rechnern gut lesbar? Gefällt dir die Demo-Fahrt? Ist Orange als
   Auswahlfarbe gut? Lohnt sich 480x270 oder 640x360 auf dem Lenovo (Leistung)?

### Bilder (`screenshots/m5a/`, neu erzeugen: `node tools/m5a-bilder.mjs`)

Jede Seite in 1280x720 und in Originalgrösse (`…-320x180.png`), Deutsch (`de-…`) und Englisch (`en-…`):
01 Titel, 02 Hauptmenü, 03 Etappe, 04 Auto, 05 Bestzeiten, 06–08 Einstellungen (Grafik / Steuerung / Ton und
Sprache), 09 Tastenbelegung, 10 Tastenbelegung mitten im Belegen („TASTE DRÜCKEN…“), 11 Steuerung, 12–13
Pace-Notes-Symbole (oben / weiter unten), 14 Credits, 15 Pause, 16 Rückfrage. Dazu
`rennen-pixelgroesse-320x180.png`, `…-480x270.png`, `…-640x360.png`: dieselbe Stelle (Kehren) in den drei
Pixelgrössen. `demo-kamera-1…4-….png`: die vier Kameras der Demo-Fahrt (ohne Menü, nicht abgedunkelt).

### Selbst getestet

- **Neuer Test `node tools/menue-test.mjs`** – **alle 40 Prüfungen bestanden**, keine Konsolenfehler:
  - (a) Tastatur: Titel → beliebige Taste → Hauptmenü; jede Seite öffnen, alle Einträge einmal durch (auch Rollen),
    Unterseiten (Tasten belegen, Symbole), zurück mit Esc und Rücktaste; ZURÜCK ist überall der letzte Punkt;
    Esc im Hauptmenü → Titel; Pause → Einstellungen → zurück; Rückfrage: NEIN vorgewählt, NEIN → Pause, JA →
    Hauptmenü. Maus: Zeigen wählt, Klick öffnet, Regler ziehen (Lautstärke auf 50 %).
  - (b) Pixelgrösse 480x270, Pace-Notes aus, mph, FPS an, Lenkung Stufe 4, Totzone Stufe 2, Lautstärke 50 %,
    Englisch → Seite neu laden → alles gleich (3D-Bild wirklich 480 Pixel breit).
  - (c) localStorage blockiert: Standardwerte, Einstellungen ändern geht trotzdem, Rennen startet.
  - (d) Pause: Rennzeit vor/nach 3 s gleich (0.850 → 0.850 s), Auto, R-Countdown (3.80 s), Zuschauer/Rauch stehen;
    nach WEITER +0.100 s im ersten Bild (ein Bild, kein Sprung), dann läuft sie weiter.
  - (e) Fenster verliert Fokus → Pause; Tab wird versteckt → Pause.
  - (f) alle 164 Texte haben Deutsch und Englisch, keiner leer, kein ß, gleiche Platzhalter, jedes Zeichen gibt es in
    der Pixelschrift.
  - (g) Gas auf G: G beschleunigt (ca. 80 km/h), Pfeil hoch nicht mehr (0 km/h); Enter ist reserviert; Esc bricht ab;
    G auf Bremse → getauscht (Gas bekommt Pfeil runter), auch bei Taste 2; nie doppelt; STANDARD stellt zurück.
  - (h) Checkpoint 1 echt durchfahren (Zeit 28.6 s), Pause → NEUSTART: Zeit 0, kein Checkpoint, Auto am Start.
  - (i) Demo fährt, Rennstand (Zeit, Checkpoints, R-Countdown, Pace-Notes) bleibt Zeichen für Zeichen gleich; im
    Zeitraffer fährt die Demo die ganze Etappe (168 s bis hinter das Ziel, nie hängen geblieben) und beginnt von vorn;
    keine Bestzeit gespeichert; STARTEN: Auto 0.000 m von der Startposition, Zeit 0, Gang N.
- **Alle bisherigen Tests laufen unverändert** (über `?menue=aus`), alte und neue Version nacheinander laufen gelassen
  und die Ausgaben verglichen: **Zeile für Zeile gleich** (nur die Bauzeiten in ms schwanken): `pacenotes`,
  `aufprall`, `belag`, `felswand`, `getriebe`, `gras`, `handbremse`, `kuh`, `leben`, `lenk`, `nebenweg`,
  `startziel`, `strassenrand`, `stummel-sicht`, `testfahrer`, `abkuerzungen --pruefen`. Alle bestanden.
- **Testfahrer**: **2:59.33 / 2:42.35 / 2:31.92** (gleich). **Abkürzungen** 127 / 2 / 342 / 84 (gleich).
  Strecke, Physik, Sperren, Pace-Notes-Berechnung, Checkpoints nicht angefasst.
- **Zeichenaufrufe** (3D, durch die echte Spielschleife gemessen, alte gegen neue Version an 9 Stellen): **genau
  gleich**, z. B. Start 123 → 123, Talschleife 98 → 98, Kehren 64 → 64, Ziel 56 → 56; in der Pause 56 (gleich wie
  davor). Das Menü wird auf das HUD-Bild (2D) gemalt, nicht in die 3D-Szene.
- **Abfall pro Bild im Rennen**: Im Rennen läuft vom Menü nichts (es wird erst wieder gezeichnet, wenn es sichtbar
  ist); die Gamepad-Abfrage benutzt feste Felder. Menüseiten werden nur bei einer Änderung neu gemalt (sonst wird ein
  fertiges Bild kopiert).
- **Ladezeit** (`node tools/ladezeit.mjs`, 3 Durchgänge mit 9–11 Ladungen, Median alt → neu): 1299 → 1355 ms,
  1330 → 1329 ms, 1467 → 1526 ms. Im Mittel etwa **+38 ms**, also knapp unter dem Budget von +50 ms – aber die
  einzelnen Ladungen schwanken um ±120 ms, die Messung ist hier ungenau. Der Weg des Demo-Fahrers (7 ms) wird erst
  beim ersten Bild berechnet, nicht beim Laden.
- **Pixelgrössen**: gleiche Stelle in 320x180, 480x270, 640x360 verglichen: Auto, Bäume, Schilder, HUD stehen gleich
  gross am gleichen Platz; Nebel/Dunst gleich; nur Kanten werden feiner (die Texturen bleiben pixelig).
- **Nebenbei gefunden**: Beim allerersten Bild lag der Zeitstempel des Browsers manchmal *vor* dem Ende des Ladens,
  die Zeit pro Bild war dann negativ (alte, harmlose Eigenheit, sie verzögerte nur den Start der Physik um ein paar
  Bilder). Für die Überblendungen des Menüs war das schlecht (Titel erschien erst nach Sekunden). Jetzt wird sie bei 0
  begrenzt.

### Ehrlich beurteilt

- **Lesbar?** Ja, auch in Originalgrösse 320x180: 5x7-Schrift mit Schatten auf dunkler Tafel. Am knappsten sind
  die Einstellungen (15 Zeilen, die Seite rollt) und die Symbol-Legende (lange Sätze, Tafel fast bildschirmbreit).
- **Passt der Stil zum HUD?** Ja: gleiche Tafel (dunkelblau, heller Rand, abgeschrägte Ecken), gleiche Schrift,
  Gelb wie die Zeit. Orange für die Auswahl hebt sich klar ab, zusammen mit dem Pfeil ▶ und dem hinterlegten Balken.
- **Demo-Fahrt**: schön ruhig. Die weiten Bilder (Berge mit Auto klein, Verfolger) sehen am besten aus. Die
  Front-Kamera knapp über der Strasse wirkt in Kurven manchmal seltsam (sie steht 8 m vor dem Auto in Richtung des
  Autos, in engen Kurven also neben der Strasse, dann sieht man das Auto von schräg vorne). In den Kehren schwenkt
  die seitliche Kamera spürbar mit. Kein Ruckeln durch das Menü; der Neubeginn am Ende ist eine kurze Schwarzblende.
- **Höhere Auflösungen**: stimmig – es wird nur schärfer, nichts verrutscht. 640x360 verliert aber einiges vom
  Retro-Look (Kanten glatt, Texturen grob): Der Unterschied „glatte Kanten, grobe Texturen“ ist sichtbar.
- **Titel**: „ALPINE RALLY“ steht über dem Start-Bogen der Demo-Fahrt; das ist etwas unruhig, aber lesbar.

### Bekannte Probleme

- In **Firefox und Safari** geht Esc im Vollbild zuerst ans Vollbild (der Browser verlässt das Vollbild). Das Spiel
  pausiert dann trotzdem (Verlassen des Vollbilds = Pause). In Chrome/Edge geht Esc ans Spiel (Tastatur-Sperre), zum
  Verlassen Esc lange halten.
- Vollbild kann ein Browser nur nach einem Tastendruck oder Klick einschalten; mit dem Gamepad klappt es evtl. nicht
  (dann springt die Einstellung zurück auf AUS).
- Die **3D-Welt** bleibt deutsch (START/ZIEL-Banner, Schilder, Sponsoren) – das ist Teil der Schweizer Landschaft,
  nicht der Menüs.
- In der **F3-Anzeige** stehen die Pace-Notes-Texte (z. B. „> RECHTS 4 LANG“) weiter nur auf Deutsch (intern).
- Die **Gamepad-Knöpfe** kann man (noch) nicht umbelegen; Pace-Notes haben keinen Gamepad-Knopf.
- Die **Front-Kamera** der Demo steht in engen Kurven neben der Strasse (siehe oben), manchmal mit Bäumen davor.
- Im Testbrowser (ohne Grafikkarte) dauern die ersten Bilder lang; auf echten Rechnern sollte der Titel nach
  ca. 0.6 s voll da sein – bitte auf beiden Rechnern anschauen.
- Gamepad, Maus und Vollbild habe ich nur im Testbrowser geprüft (Maus ja, Gamepad und Vollbild nicht echt).

### Ideen/Vorschläge (nicht umgesetzt)

- Ein kleines 3D-Vorschaubild des Autos auf der Seite AUTO (drehend).
- Auf der Etappen-Seite eine kleine Streckenkarte (passt zur Minimap-Idee).
- Gamepad-Knöpfe ebenfalls frei belegbar.
- Demo-Fahrt: ab und zu die Handbremse in den Kehren ziehen (sieht spektakulärer aus); der Testfahrer fährt ohne.
- Eine Einstellung „Bildschirm-Rand“ (ganzzahliges Skalieren an/aus, gibt es schon in `config.js`).
- Pace-Notes-Texte in der F3-Anzeige auch auf Englisch.

---

## Meilenstein 4.1: Pace-Notes kleiner, nur Symbole, später; R mit Wartezeit ✅ (Verlauf, Stand damals – Gamepad-Start ist seit M5a die Pause)

### Was wurde gebaut?

**1. Neue Aufteilung oben im Bild**
- Die **Zeit-Tafel** steht jetzt **oben links**, die Checkpoint-Punkte direkt darunter (mittig unter der Tafel), die
  Zwischenzeit („CP 1 …“) und Meldungen wie „ANSAGEN AUS“ links darunter. Die Tachos bleiben unten rechts.
- Die **Pace-Notes** stehen **ganz oben am Bildrand in der Mitte** als kleine **Kacheln nebeneinander** auf einem
  dunklen, halbdurchsichtigen Feld, das nur so gross ist wie die Kacheln.
- **Grösse** (Pixel im 320x180-Bild): Feld **17 Pixel hoch**. Eine Kachel: **21 px** breit (mit Schneiden-Zeichen
  27 px, Kuppe 15 px, Ziel 15 px). Zwei Kacheln: **36–48 px** (Ziel war höchstens ca. 60 von 320).
- **Keine Wörter, keine Meter mehr.** Die Kachel erscheint, bleibt an ihrem Platz stehen und verschwindet.
  Die nächste (dringendste) Kachel steht genau in der Mitte, eine zweite rechts daneben. Verschwindet die erste,
  rutscht die zweite weich in die Mitte.

**2. Die Kacheln (Symbol-Legende)**

Jede Kachel: grosses Symbol (11x13 Pixel, für links gespiegelt) + rechts daneben die Stufen-Zahl (farbig) +
darunter höchstens **ein** kleines Zusatz-Zeichen + ganz rechts ggf. das Schneiden-Zeichen.

| Symbol (beschrieben) | Bedeutung |
|---|---|
| Pfeil, der leicht schräg nach oben abbiegt, **grün**, Zahl 5 oder 6 | sanfte Kurve, Stufe 5–6 (6 = Vollgas) |
| Pfeil mit rechtem Winkel, **gelb**, Zahl 3 oder 4 | Kurve Stufe 3–4 |
| Pfeil, der über 90° hinaus schräg nach unten biegt, **rot**, Zahl 1 oder 2 | enge Kurve, Stufe 1–2 |
| schmales **U**, Pfeil gerade nach unten, **rot**, daneben ein kleiner Bruch (z. B. 1 über 4) | **Kehre** (Spitzkehre), Nummer in der Kehren-Folge (1/4 … 4/4) |
| Versatz: hoch, kurz zur Seite, wieder hoch (Pfeil gerade nach oben), Farbe nach Stufe | **Schikane** (Richtung = erste Kurve) |
| Buckel über einem Strich, weiss | **Kuppe** (Blindkuppe, dahinter sieht man die Strasse nicht) |
| Strasse mit Ast zur Seite (Pfeil in Stufen-Farbe), geradeaus **grauer** Stummel mit **rot-weisser** Absperrung | **Abzweig**: die Etappe biegt ab, geradeaus ist gesperrt |
| T-Kreuzung: von unten kommend, Pfeil zur Seite, die andere Seite grau mit rot-weisser Absperrung | **Einmündung**: die Etappe biegt auf die Querstrasse, die andere Richtung ist gesperrt |
| Schachbrett-Fahne | **Ziel** |
| **grüner** schräger Pfeil (ganz rechts in der Kachel) | **schneiden** lohnt sich (Kurveninneres frei) |
| **rotes ✗** (ganz rechts in der Kachel) | **nicht schneiden** (Steine/Bäume/Stämme im Kurveninnern) |
| kleines **−** unter der Zahl | eng (enger als die Stufe sonst, wie „4 minus“) |
| kleines **+** unter der Zahl | weit (wie „4 plus“) |
| kleines **\|–\|** (Mass-Strich) | lang (mehr als 100° oder länger als 130 m) |
| kleines **<** (geht auf) | öffnet (wird gegen Ende weiter) |
| kleines **>** (geht zu) | zieht zu (wird gegen Ende enger) |
| beige Körner (nur beim Abzweig) | Schotter |
| grüne Grasbüschel (nur beim Abzweig) | Wiesenweg |

Farben der Stufen wie bisher: rot 1–2, gelb 3–4, grün 5–6.

**Nicht mehr angezeigt** (werden weiter berechnet, in `config.js` unter `pacenotes.anzeigen` wieder einschaltbar,
Standard aus): **Felswand**, **Senke**, **Gerade** und Belagwechsel als eigene Ansage.
Die Wort-Texte (z. B. `RECHTS 4 LANG`) gibt es nur noch **intern**: im Test und in der **F3-Anzeige** (dort stehen
unten die nächsten drei Ansagen als Text, mit „>“ davor).

**Meine Entscheidung beim Abzweig:** Im Auftrag stand „Geradeaus-Pfeil = bleib auf der Strasse“. Auf unserer
Strecke **biegt die Etappe an jedem Abzweig und jeder Einmündung ab**, geradeaus (bzw. die andere Seite) ist mit
Reifen/Heu/Holzböcken **abgesperrt**. Ein Geradeaus-Pfeil würde dich in die Absperrung schicken. Darum zeigt der
helle Pfeil (in der Farbe der Stufe, mit Zahl) in die Richtung der Etappe, und der gesperrte Ast ist grau mit einer
kleinen rot-weissen Absperrung als „Vorsicht“-Zeichen. Statt eines Warndreiecks – das wäre bei 13 Pixeln zusammen
mit Pfeil nicht lesbar gewesen. Falls du es anders willst, sag es.

**3. Timing: später und höchstens 2**
- Eine Kachel erscheint ca. **4 Sekunden** vorher (beim aktuellen Tempo), aber **mindestens 50 m** und **höchstens
  160 m** vorher. Bei **Kehren, Abzweigen und Einmündungen 25 % früher** (also 62–200 m), weil man dort vorher
  bremsen muss. Beispiele: bei 50 km/h ca. 56 m, bei 90 km/h 100 m (Kehre 125 m), bei 140 km/h 156 m.
- **Höchstens 2 Kacheln** gleichzeitig. Die zweite kommt erst, wenn **sie selbst** in ihrem Zeitfenster ist – nie
  nur, weil Platz ist. Liegen zwei Ansagen **weniger als 40 m** auseinander, kommen sie **zusammen** (z. B. Kuppe +
  Rechts 2 in der Talschleife, Abzweig Wiesenweg + Kuppe) und zählen als die zwei.
- **Verschwinden**: beim Passieren der **Kurvenmitte** (Kuppe: auf der Kuppe, Ziel: an der Linie), weich in ca.
  **0.3 s**; danach rutscht die nächste in die Mitte. Nichts springt hin und her.
- **Kehren** (4 in Folge): Es steht immer nur die nächste Kehre da, mit ihrer Nummer als kleinem Bruch (1/4 …).
  Die nächste kommt erst ca. 60–80 m vorher.
- Taste **N** (an/aus), die Stufen-Grenzen und die Stufen-Messung (`js/pacenotes-tempo.js`) sind unverändert.

**4. Taste R mit Wartezeit**
- **Im Rennen** startet R einen **Countdown von 4 Sekunden** (`config.js`, `zurueck.wartezeit`, 3–5 sinnvoll).
  Währenddessen ist das Auto **gesperrt**: es bremst bis zum Stand, Gas und Lenkung wirken nicht. Die **Rennzeit
  läuft weiter**. Anzeige: kleines Reset-Zeichen (Kreispfeil) und eine gelbe Zahl (4, 3, 2, 1) mittig knapp unter
  den Pace-Notes. Danach wie bisher: Auto auf der Strassenmitte, Blickrichtung der Strasse, Tempo 0.
- **Nochmals R** während des Countdowns ändert nichts (kein Neustart des Countdowns). Abbrechen geht nicht.
- **Vor dem Start** (Zeit läuft noch nicht): R setzt wie bisher **sofort** auf die Strasse zurück.
  **Nach dem Ziel**: R ist wie bisher der **Neustart** der Etappe. Beides ist unverändert.
- Ein laufender Countdown wird abgebrochen, wenn das Auto sowieso zurückgesetzt wird („Checkpoint verpasst“) oder
  ins Ziel rollt.

### Werte zum Drehen (`js/config.js`)

| Wert | Was | heute |
|---|---|---|
| `pacenotes.vorlaufZeit` | Sekunden vorher | 4 |
| `pacenotes.vorlaufMin`, `vorlaufMax` | frühestens/spätestens (Meter) | 50 / 160 |
| `pacenotes.vorlaufBremsen` | Faktor für Kehren, Abzweige, Einmündungen | 1.25 |
| `pacenotes.maxKacheln` | höchstens so viele gleichzeitig | 2 |
| `pacenotes.gruppeAbstand` | näher beisammen = erscheinen zusammen (Meter) | 40 |
| `pacenotes.einblenden`, `ausblenden`, `nachruecken` | weiche Übergänge | 0.2 s / 0.3 s / 10 |
| `pacenotes.anzeigen` | Felswand, Senke, Gerade, Belag wieder einschalten | alle aus |
| `pacenotes.oben`, `innen`, `luecke` | Lage und Ränder der Tafel (Pixel) | 1 / 1 / 3 |
| `pacenotes.farben`, `farbeTafel`, `farbeRand`, `farbeZeichen`, `farbeGesperrt`, `farbeSchotter`, `farbeWiese` | Farben | |
| `pacenotes.zielVor` | Ziel fest so viele Meter vorher (null = wie alle) | null |
| `zurueck.wartezeit` | R-Wartezeit (Sekunden, 0 = sofort wie früher) | 4 |
| `zurueck.bremse` | so stark bremst das gesperrte Auto | 0.7 |
| `zurueck.oben`, `zurueck.farbe` | Lage und Farbe der Countdown-Anzeige | 3 px / gelb |
| `hud.zeit.links`, `hud.zeit.oben` | Lage der Zeit-Tafel | 3 / 3 |

Die Pixel-Symbole selbst stehen in `js/pacenotesbild.js` (als kleine Bilder aus Zeichen, gut von Hand änderbar).

### So testest du

1. Start: Zeit oben links, Mitte oben leer. Losfahren: bei ca. 130 m vor der ersten Kurve kommt eine grüne **6** mit
   Mass-Strich (lang).
2. **Talschleife**: Abzweig-Symbol mit roter **2** und Schotter-Körnern. Danach Links 2 mit **>** (zieht zu), dann
   Kuppe + Rechts 2, dann Einmündung.
3. **Kehren**: rotes U mit **1/4** und rotem **✗**, bei Kehre 3 ein **grüner Pfeil** (schneiden lohnt sich).
4. Fahr bewusst ins Gras und drück **R**: Auto bremst, Zahl 4–3–2–1 unter den Kacheln, Gas/Lenken wirken nicht,
   die Zeit läuft. Danach steht das Auto auf der Strasse. Nochmals R während der Zahl: nichts passiert.
5. **N**: Kacheln weg / wieder da. **F3**: unten im Debug-Feld stehen die nächsten Ansagen als Text.
6. Fragen an dich: Erkennst du die Symbole ohne Nachdenken? Kommt die Kachel früh genug, um zu bremsen? Sind 4 s
   Wartezeit bei R richtig?

### Bilder (`screenshots/m4-1/`, neu erzeugen: `node tools/m41-bilder.mjs`)

Je Stelle 1280x720 und dieselbe Stelle in Originalgrösse (`…-320x180.png`): 01 Start (Zeit links), 02 vor Kurve
Stufe 6 (Rechts 6 lang), 03 vor Kurve Stufe 2 (Links 2 zieht zu), 04 vor Kehre 1 (1/4, nicht schneiden),
05 vor „schneiden“ (Rechts 6 + Rechts 4 lang mit grünem Pfeil, zwei Kacheln), 06 vor „nicht schneiden“ (Schikane),
07 vor dem Abzweig Talschleife, 08 vor der Kuppe (Abzweig Wiesenweg + Kuppe), 09 vor dem Ziel, 10 R-Countdown
(steht auf 3, über Kehre 1), 11 Notes ausgeschaltet (N).

### Selbst getestet

- **`node tools/pacenotes-test.mjs`** – alles bestanden:
  - (a)–(f) wie bisher auf der internen Liste (Texte): alle bestanden, Liste unverändert (30 Ansagen).
  - (g) ganze Testfahrt „mittel“: **nie mehr als 2 Kacheln**, nichts verschwindet vor der Kurvenmitte, nichts kommt
    wieder, alle 27 Kacheln erscheinen, nach dem Ziel keine, nach dem Neustart wieder von vorn.
    **Gezählt:** 27-mal wechselte die Anzeige auf **eine** Kachel, 16-mal auf **zwei**. Zeitanteil der Fahrt
    (2:42): ca. 91 s eine Kachel, 41 s zwei, 32 s keine.
  - (h) keine Kachel erscheint weiter als 160 m (Kehre/Abzweig/Einmündung 200 m) vor ihrer Stelle – in der Testfahrt
    (weitester: Abzweig Talschleife 179 m bei 129 km/h, Ziel 160 m bei 149 km/h) und bei festem Tempo
    50 / 90 / 140 km/h (weitester Vorlauf 69 / 125 / 194 m). Keine Kachel kommt vor ihrem eigenen Zeitfenster.
  - (i) R im Rennen: Reset genau nach **4.000 s** (nicht früher), genau **ein** Reset, zweites R nach 2 s startet den
    Countdown nicht neu; während der Wartezeit steht das Auto trotz Vollgas und Lenken; danach Strassenmitte,
    Tempo 0, Blickrichtung der Strasse; Rennzeit lief weiter; danach fährt es wieder. Vor dem Start: sofort zurück.
    Nach dem Ziel: Neustart.
- **Testfahrer unverändert**: 2:59.33 / 2:42.35 / 2:31.92 (vorher und nachher Zeichen für Zeichen gleich). Der
  Testfahrer drückt nie R; die Tests, die das Auto zurücksetzen (`nebenweg`, `startziel`), rufen direkt
  `aufStrasse()` auf (das sofortige Zurücksetzen) – das ist dasselbe wie vorher, darum musste dort nichts geändert
  werden. Die Wartezeit hängt nur an der Taste (`rTaste()`).
- Ebenfalls bestanden: `aufprall`, `nebenweg`, `startziel`, `handbremse`, `lenk`, `getriebe`, `felswand`, `gras`,
  `belag`, `kuh`, `leben`, `strassenrand`. Keine Konsolenfehler.
- **Strecke, Physik, Sperren, Abkürzungen, Checkpoints** nicht angefasst (3667.587 m, 127 / 2 / 342 / 84).
- **Zeichenaufrufe** (3D-Szene, an 8 Stellen gemessen, alte Version gegen neue): vorher = nachher, z. B. vor dem
  Abzweig Talschleife 98 → 98, vor Kehre 1 120 → 120, vor dem Ziel 61 → 61. Die Kacheln werden auf das HUD-Bild
  gemalt; alle Kacheln der Etappe werden **einmal** beim ersten Bild auf ein gemeinsames kleines Bild vorgezeichnet,
  pro Bild kommt je Kachel nur ein Bildausschnitt dazu, ohne neue Objekte.

### Ehrlich beurteilt (bei 320x180, in Originalgrösse angeschaut)

- **Kurven**: Stufe 6 (schräger grüner Pfeil), 3–4 (Winkel) und 1–2 (rote Schlaufe nach unten) sind auf einen Blick
  verschieden, die Zahl daneben ist gut lesbar.
- **Kehre gegen enge Kurve**: unterscheidbar – die Kehre ist ein U mit Pfeil gerade nach unten und hat statt einer
  Zahl den kleinen Bruch 1/4; die enge Kurve ist eine Schlaufe mit schrägem Pfeil und einer roten 2. Beide sind rot;
  auf den ersten Blick hilft vor allem „Zahl oder Bruch“.
- **SCHNEIDEN / NICHT SCHNEIDEN**: eindeutig – grüner schräger Pfeil gegen rotes ✗, in einer eigenen Spalte. Mein
  erster Versuch (Zeichen im Kurveninnern) war es **nicht**: in einer grünen 6er-Kurve verschwand der grüne Pfeil in
  der Kurvenlinie. Darum die eigene Spalte (macht die Kachel 6 Pixel breiter).
- **Abzweig/Einmündung**: als Kreuzung erkennbar; der graue gesperrte Ast ist bei 320x180 eher schwach, die rot-weisse
  Absperrung nur 5 Pixel breit. Die Richtung (heller Pfeil) ist klar.
- **Schikane**: erster Entwurf sah aus wie eine schräge 6er-Kurve, jetzt ein Versatz mit Pfeil gerade nach oben –
  unterscheidbar, aber nicht das schönste Symbol.
- **Kleine Zeichen** (−, +, |–|, <, >): klar zu sehen, aber man muss die Bedeutung einmal gelernt haben (Legende).
- **Kehren-Bruch** 1/4 ist mit 3x5-Ziffern sehr klein, lesbar, wenn man hinschaut.
- **Breite**: eine Kachel 21 px, zwei 36–48 px von 320, Höhe 17 px.

### Bekannte Probleme

- **Dichte Stellen** kommen teils spät, weil höchstens 2 Kacheln stehen: in der Talschleife (Links 2 → Kuppe →
  Rechts 2) erscheint Rechts 2 in der Testfahrt nur ca. 31 m vorher, Links 3 nach dem Wiesenweg-Abzweig ca. 33 m
  vorher. Bei 3 statt 2 Kacheln (`maxKacheln: 3`) wäre es früher, aber voller.
- Mit zwei Kacheln steht die Tafel nicht genau mittig (die erste steht in der Mitte, die zweite rechts daneben) –
  so bewegt sich die erste nicht, wenn die zweite dazukommt.
- Die Countdown-Zahl hat nur eine Ziffer (bis 9 s Wartezeit).
- Rot/Grün: wer rot-grün-schwach sieht, muss sich an der Form orientieren (✗ gegen Pfeil) – das geht.
- Stufe 5 gibt es auf dieser Strecke weiterhin nicht (siehe M4).

### Ideen/Vorschläge (nicht umgesetzt)

- Das grosse Symbol für Kehren etwas dicker (2 Pixel), damit es sich noch stärker von der engen Kurve abhebt.
- Eine Einstellung „früh / normal / spät“ für die Vorlaufzeit im Spiel.
- Beim R-Countdown die Kamera langsam etwas anheben (zeigt, dass „etwas passiert“).
- Ein Gamepad-Knopf für N.

---

## Meilenstein 4: Pace-Notes (Ansagen oben im Bild) ✅ (Verlauf, Stand damals – Aussehen und Timing seit M4.1 anders)

### Was wurde gebaut?

Wie in einer echten Rallye sagt der Beifahrer an, was als Nächstes kommt. Bei uns steht das **oben in der Mitte,
direkt unter der Zeit und den Checkpoint-Punkten**, auf einer kleinen halbdurchsichtigen dunklen Tafel im Stil der
Zeit-Tafel. Kein Ton, nur Symbol und Text. Zeit, Checkpoint-Punkte und Tachos sind unverändert.

Jede Zeile: **Symbol** (Pixel-Pfeil in der Form der Kurve, farbig nach Schwierigkeit) + **Text** (z. B.
`RECHTS 4 LANG`, die Stufen-Zahl in der Farbe des Symbols) + kleine **Zusatz-Zeichen** (schneiden / nicht schneiden)
+ rechts die **Distanz** in Metern (graublau, mit kleinem „m“), die in 10-m-Schritten herunterzählt.

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
  - (d) kleinster Abstand zweier Ansagen 29 m (Felswand → Schikane; nie unter 25 m), längste Zeile 24 Zeichen.
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
  **Zeichenaufrufe** vor dem Abzweig Talschleife: 96 mit Ansagen, 96 ohne (N).
  **Ladezeit** (`node tools/ladezeit.mjs`, 9 Messungen abwechselnd, Median): 1547 → 1469 ms – der Unterschied ist
  Messrauschen; die Berechnung selbst dauert im Spiel 3–5 ms (beim allerersten Mal bis ca. 20 ms), Budget +50 ms.

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
