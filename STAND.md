# Alpine Rally – Stand

Aktuell: **Meilenstein 5b fertig** – das Rennen hat jetzt einen Anfang und ein Ende: **Countdown 3 – 2 – 1 – GO!**
(Auto steht mit der Schnauze an der Startlinie, Zeit startet bei GO), nach der Ziellinie ein **Zielbildschirm** mit
Endzeit, Vergleich zur Bestzeit (grün schneller / rot langsamer), Zwischenzeiten und **Statistik** (Aufpralle, Resets,
Höchsttempo), dazu **Bestzeiten Top 10** pro Etappe (im Browser gespeichert) und **BESTZEITEN LÖSCHEN** in den
Einstellungen.
Davor: 5a.1 (Credits mit Namen, Rückwärts auf Asphalt 32 km/h, Felswand ohne Bäume im Fels und ohne Wurf), 5a (Menüs: Titel, Hauptmenü mit Demo-Fahrt, Pause, Einstellungen, Tasten belegen, Deutsch/Englisch), 4.1 (Pace-Notes als kleine Symbol-Kacheln, R mit Wartezeit), 4 (Pace-Notes mit Text und Distanz), 3d (Leben an der Strecke: Alpweide, Fan-Spots, Unfallautos), 3b (Almweg und Wiesenweg), 3c (Start- und Zielbereich), 3a.3 (Felswand: Auto stoppt an der sichtbaren Wand), 3a.2 (Fahrphysik-Feinschliff), 3a.1 (Nebenweg-Korrektur), 3a (erster Nebenweg: bei
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

Im Menü: Pfeile oder WASD (bzw. Steuerkreuz/linker Stick) zum Wählen, **Enter/Leertaste** (A / Kreuz) zum
Bestätigen, **Esc/Rücktaste** (B / Kreis) für zurück. Die Maus geht auch (zeigen = wählen, klicken = bestätigen,
Regler ziehen). Tastatur, Gamepad und Maus gehen gleichzeitig, nichts einzustellen. Geschaltet wird automatisch.
Alle Tasten ausser Esc, Enter und F3 kann man unter EINSTELLUNGEN → TASTEN BELEGEN ändern.

Alle Einstellungen (auch N) merkt sich der Browser.

---

## Meilenstein 5b: Countdown, Zielbildschirm, Bestzeiten, Statistik ✅

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
| Aufpralle | jeder harte Kontakt mit Baum, Stein, Stamm, Absperrung, Zaun, Leitplanke, Kuh, Felswand und den unsichtbaren Grenzen (Abhang, 45 m neben der Strasse), wenn das Tempo **Richtung Hindernis** über der Schwelle liegt. Ein Aufprall zählt **einmal**: Danach zählt eine kurze Sperrzeit lang nichts (Entlangschleifen, Kleben mit Gas) | Schwelle 3 m/s (11 km/h), Sperrzeit 0.6 s |
| Resets | wie oft R wirklich ausgelöst hat (erst, wenn die Wartezeit durch ist und das Auto zurückgesetzt wurde) | – |
| Höchsttempo | höchstes Tempo zwischen GO und Ziel | – |

Alles wird bei jedem Start auf 0 gesetzt (auch NEUSTART aus der Pause). Gemessen wird an den Stellen, die es schon gab
(Kollision mit Hindernissen, Felswand, Grenzen); die Physik selbst ist unverändert.

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
   auf beiden Rechnern gut lesbar? Sollen die Aufpralle an den unsichtbaren Grenzen mitzählen?

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

- **Neuer Test `node tools/rennablauf-test.mjs`** – **alle 74 Prüfungen bestanden**, keine Konsolenfehler:
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
  - (g) Baumaufprall (61 → 1 km/h, danach gut 1 s Vollgas am Baum): **genau 1**; R-Reset: 1; Höchsttempo = höchstes
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
- Als Aufprall zählen auch die **unsichtbaren Grenzen** (Abhang ohne Leitplanke, 45 m neben der Strasse), wenn man
  schneller als 11 km/h hineinfährt. Falls das nicht gewünscht ist: sag es, dann zählen nur sichtbare Hindernisse.
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
