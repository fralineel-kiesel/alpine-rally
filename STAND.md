# Alpine Rally – Stand

## Aktuell

Aktuell: **Meilenstein 8f fertig** (Version 0.8f) – **Lanza 073 überarbeitet**: Heck als Gruppe-B-Keil statt Pritsche,
fangbar statt „Seife“ (kein Dreher mehr im Tastatur-Slalom), Motor tiefer, Lader deutlich lauter, längere Gänge.
**Subora Imprexa** jetzt **blau mit gelber Schrift** (der alte rote Lack heisst ROT), dreht bis ca. 7800/min, eigener
Tacho bis 9000/min. Dazu die Kontext-Diät: alte STAND.md im Archiv. Ton nicht gehört, Fahrgefühl nicht gespürt: alles
gemessen, nicht erlebt. **Bitte zuerst die Test-Anleitung in `docs/meilensteine/m8f.md`.**
Davor: 8e (Lanza 073 und Subora Imprexa, Garage für fünf Autos, Aufheulen, Flamme).
Konzept und Fahrplan: `KONZEPT.md`. Die alte, lange Stand-Datei (alle Berichte bis M8e) liegt in
`docs/archiv/STAND-bis-m8e.md` – **nie ganz lesen**, Inhaltsverzeichnis mit Zeilennummern: `docs/archiv/INDEX.md`.
Ausführliche Berichte ab M8f: `docs/meilensteine/<name>.md`.

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


## Wo steht was

Spiel (`index.html` lädt `js/main.js`; Three.js liegt unter `lib/`). Hilfsseiten: `auto-labor.html`, `ton-labor.html`,
Fahr-Labor im Spiel mit `index.html?fahrlabor=1`, anderes Auto mit `?auto=<id>`.

- `js/abkuerzungen.js` – Automatisch erzeugt von tools/abkuerzungen.mjs – bitte nicht von Hand…
- `js/ablauf.js` – Ablauf des Spiels (seit M5a): eine kleine Zustandsmaschine.
- `js/absperrungen.js` – Absperrungen (seit Meilenstein 3a, als Leitwand seit M3a.1): Wo die E…
- `js/audio.js` – Ton (Meilenstein 7a, M7a.1): Motor, Reifen, Wind, Aufprall und Signale – all…
- `js/autolabor.js` – Auto-Labor (M8a): Hilfsseite zum Ansehen des Autos ohne Fahren (auto-lab…
- `js/autos.js` – Modelldaten der Autos (seit M8a). js/car.js baut daraus das 3D-Modell (baueA…
- `js/baumfolge.js` – Feste Zufallsfolge der Bäume und Steine (seit Meilenstein 3a) – bitte ni…
- `js/bestzeiten.js` – Bestzeiten (Seite im Hauptmenü seit M5a, gefüllt seit M5b beim Erreiche…
- `js/car.js` – Das Auto als 3D-Modell (seit M8a): baueAuto(modell, lackierung) baut es aus de…
- `js/checkpoints.js` – Checkpoints: Tore quer über die Strasse (zwei Pfosten und ein Banner).
- `js/config.js` – alle Stellschrauben an einem Ort (gross: nur bereichsweise lesen)
- `js/demofahrt.js` – Demo-Fahrt hinter Titel und Hauptmenü (seit M5a).
- `js/einstellungen.js` – Einstellungen (seit M5a): Werte, Standardwerte aus config.js (Block…
- `js/fahrlabor.js` – Fahr-Labor (Meilenstein 8a): Seitenpanel zum Nachstellen des Fahrgefühls…
- `js/fahrprofil.js` – Fahrprofile (Meilenstein 8a): Das heutige Fahrverhalten steht in config…
- `js/federung.js` – Federung der Karosserie (Meilenstein 8a): Feder und Dämpfer (zweiter Ordn…
- `js/garage.js` – Garage (Meilenstein 8c): drehendes 3D-Modell auf der Menüseite AUTO.
- `js/getriebe.js` – Getriebe und Motor (Meilenstein 1.2): 5 Gänge plus Rückwärts, Automatik m…
- `js/hud.js` – HUD: Tachos, Zeit (oben links), Pace-Notes (oben Mitte, seit M4.1 als Kacheln)…
- `js/inhalte.js` – Autos und Etappen für die Menüseiten AUTO und ETAPPE (seit M5a).
- `js/input.js` – Steuerung: Tastatur und Gamepad gleichzeitig.
- `js/kollision.js` – Kollisionen mit Bäumen, Steinen und Baumstämmen.
- `js/kuehe.js` – Kühe (Meilenstein 2b): Herden auf den eingezäunten Weiden im Tal und auf den…
- `js/kuhbild.js` – Kuh-Sprites (Meilenstein 2b), im Code gezeichnet wie alle anderen Pixel-Te…
- `js/kuhfolge.js` – Feste Kuh-Liste (seit Meilenstein 3d) – bitte nicht von Hand ändern (neu…
- `js/leben.js` – Leben an der Strecke (Meilenstein 3d).
- `js/lebenbild.js` – Pixel-Bilder für "Leben an der Strecke" (Meilenstein 3d), im Code gezeic…
- `js/main.js` – Start des Spiels und Spielschleife.
- `js/menue.js` – Menü-Baustein (seit M5a): Seiten mit einer Liste von Einträgen, gezeichnet i…
- `js/menueseiten.js` – Die Menüseiten (seit M5a): Titel, Hauptmenü, Auto, Etappe, Bestzeiten,…
- `js/minimap.js` – Minimap oben rechts (Meilenstein 6, seit M6.1 ein mitfahrender Ausschnitt)…
- `js/musik.js` – Menü-Musik (M7b): spielt das Stück aus js/musikstueck.js mit Web Audio, alle…
- `js/musikstueck.js` – Menü-Musik (M7b): Notendaten des Stücks "Passfahrt" – Eigenkomposition…
- `js/netz.js` – Strassennetz (Meilenstein 3a): die Etappe plus die Stummel an den Nebenwegen.
- `js/pacenotes-tempo.js` – Automatisch erzeugt von tools/pacenotes-test.mjs --schreiben – bit…
- `js/pacenotes.js` – Pace-Notes (Meilenstein 4): Ansagen des Beifahrers oben im Bild.
- `js/pacenotesbild.js` – Pixel-Symbole der Pace-Notes, im Code gezeichnet (keine Bilder).
- `js/physics.js` – Fahrphysik des Autos (Arcade mit etwas Gewicht).
- `js/pixel.js` – Pixel-Texturen, im Code gezeichnet (keine Bilddateien).
- `js/rennablauf.js` – Rennablauf (seit M5b): Anzeige des Countdowns 3 - 2 - 1 - GO! in der Bi…
- `js/sperren.js` – Abkürzungs-Sperren: Felsbrocken, Tannengruppen oder umgefallene Baumstämme
- `js/sprites.js` – Bäume und Steine als 2D-Sprites (Billboards) wie bei N64/PS1.
- `js/startziel.js` – Start- und Zielbereich (Meilenstein 3c).
- `js/startzielbild.js` – Pixel-Bilder für den Start- und Zielbereich (Meilenstein 3c), im Cod…
- `js/staub.js` – Staub auf Schotter (Meilenstein 3a): helle Wölkchen hinter den Hinterrädern.
- `js/strassenrand.js` – Strassenrand (Meilenstein 2a): Leitplanken, Holzzäune und Schilder.
- `js/tacho.js` – Analoge Tachos im Pixel-Look (Meilenstein 1.2): Tempo und Drehzahl, unten re…
- `js/texte.js` – Alle sichtbaren Texte des Spiels (seit M5a), Deutsch (Schweizer Schreibweise…
- `js/tonfahrt.js` – Feste kurze Fahrt für den Motor-Vergleich (Meilenstein 8d): Ton-Labor (Kn…
- `js/tonlabor.js` – Ton-Labor (M7a): Hilfsseite zum Anhören aller Töne, ohne zu fahren (ton-l…
- `js/track.js` – Streckenverlauf der Etappe "Passstrasse" (Meilenstein 1).
- `js/umgebung.js` – Umgebungsklänge (M7b): Kuhglocken, Publikum (Gemurmel, Jubel, Klatschen),…
- `js/util.js` – Kleine Hilfsfunktionen: Zufall mit festem Startwert, Rauschen, Mathe.
- `js/vergleich.js` – Live-Vergleich zur Bestzeit oder zum letzten Lauf (Meilenstein 6).
- `js/world.js` – Die Welt: Gelände, Strasse, Felswand, Hintergrundberge, Himmel.

Werkzeuge in `tools/` (nur für Tests, das Spiel lädt sie nicht):
- **Tests der Meilensteine:** `m8b-test.mjs` … `m8f-test.mjs` (je Meilenstein, Buchstaben-Prüfungen, `--nur a,b`), dazu `*-ziele.js` (Zieltabellen).
- **Fach-Tests:** `auto-test`, `aufprall-test`, `belag-test`, `felswand-test`, `getriebe-test`, `gras-test`, `handbremse-test`, `kuh-test`,
  `leben-test`, `lenk-test`, `menue-test`, `nebenweg-test`, `overlay-test`, `pacenotes-test`, `rennablauf-test`, `rueckwaerts-test`,
  `startziel-test`, `strassenrand-test`, `ton-test`, `ton-umgebung-test` (alle `.mjs`).
- **Messwerkzeuge:** `fahrmessung.js`, `auto-messung.mjs`, `ton-messung.mjs`, `testfahrer.mjs` (+ `testfahrer-browser.js`), `abkuerzungen.mjs`,
  `ladezeit.mjs`, `m7a-leistung.mjs`, `m7b-leistung.mjs`, `m8b-messung.mjs`, `m8b-ton.mjs`; Messdaten als `*.json`.
- **Bildwerkzeuge:** `m2b-bilder.mjs` … `m8f-bilder.mjs`, `sperren-bilder.mjs`, `strassenrand-bilder.mjs` (Bilder nach `screenshots/<meilenstein>/`).
- **Hilfen:** `spiel-browser.mjs` (Webserver + Headless-Browser), `node-three.mjs` (car.js ohne Browser) und kleinere Skripte.

## Unveränderliche Referenzwerte (jedes Mal prüfen)

- Strecke **3667.587 m** ±0.5.
- `node tools/abkuerzungen.mjs --pruefen` = **127 / 2 / 342 / 84**.
- Testfahrer mit Profil `prototyp`: **2:59.33 / 2:42.35 / 2:31.92** (Zwischenzeiten und Statistik gleich).
- Pace-Notes-Tabelle (`js/pacenotes-tempo.js`), Abkürzungs-Daten (`js/abkuerzungen.js`) und `tools/schneiden-zeiten.json` nicht neu schreiben.
- Profil `prototyp` bleibt bit-gleich (Referenz für Pace-Notes, Sperren, Testfahrer). Fertige Autos bleiben bit-gleich, wenn der
  Auftrag sie nicht nennt (Aussehen, Fahrgefühl, Ton, Tacho).
- **Limits:** Draw Calls pro Auto ≤ 12, Dreiecke pro Auto ≤ 1800, kein Garbage pro Bild, Ladezeit gleich, Ton ändert nie das Spiel.

## Werkzeuge und Tests

- `node tools/m8e-test.mjs` – alle Prüfungen (a) bis (j); einzelne Teile mit `--nur d,g`. Dauert lange (Testfahrer, Ton).
- `node tools/m8e-bilder.mjs` – alle Bilder nach `screenshots/m8e/` (einzeln: `--nur garage,flamme`).
- `node tools/ton-messung.mjs m8e-l073 --profil l073 --bilder screenshots/m8e` – Ton-Messung eines Autos mit Spektrogrammen.
- `node tools/auto-messung.mjs` – Fahrmessung aller Profile, Messtabellen M8e.
- `node tools/m8f-test.mjs --alt <ordner 0.8e>` – alle Prüfungen von M8f (a) bis (g); einzeln `--nur b,d`; Regression mit `--lang`.
- `node tools/m8f-bilder.mjs --alt <ordner 0.8e>` – Bilder nach `screenshots/m8f/` (vorher/nachher braucht den alten Stand).
- `tools/m8f-ziele.js` – Zieltabellen und Kontrolltests K1–K4 (Tastatur-Rampe wie im Spiel), `tools/m8f-form.js` – Seitenprofil eines Autos.
- `node tools/abkuerzungen.mjs --pruefen` und `node tools/testfahrer.mjs` – Referenzwerte oben.
- Lange Ausgaben in eine Datei umleiten (`> /tmp/x.log 2>&1`) und nur `tail` / `grep` lesen.

## Bekannte Probleme

- **Ähnlichkeit der Allradler:** Audan, Delto und Subora liegen in 8–9 von 12 Messzeilen nah beieinander (Regel: höchstens 2),
  siehe Vergleich – weil sich ihre Zielbereiche überlappen.
- Mehrere Fahrmesswerte liegen **knapp am Rand** des Ziels (siehe Messtabelle); schon kleine Änderungen an Lanza-Werten
  (`antriebHinten`, `schwerpunktVorne`, `gripHinten`) können eine Zeile kippen lassen.
- **M8f, Lanza 073:** Höchsttempo −2.9 % statt höchstens −3 % (die Drehzahl ging vor); Kontrolltests K2 (Gegenlenken, 1.13 s
  statt 0.8 s) und K4 (Wiesenweg mit Vollgas, 12 m statt 4 m) nicht erreicht – auch Delto/Escorta/Prototyp erreichen sie nicht.
  Der **flotte Testfahrer** ist an der Rechtskurve bei 2760 m sehr empfindlich: 4. Gang 150 statt 149 oder `gripHinten` 1.05
  lassen ihn aufprallen. Details: `docs/meilensteine/m8f.md`.
- **M8f, Subora-Tacho:** die Skala bis 9 macht die Ziffern 4 und 5 eng (eigene Tachos je Auto: M8g).
- `menue-test` scheitert an den Credits (kennt nur SHAI-RON; seit Linos Liste „SHAI-RON, BENJAMIN“) – schon in 0.8e.
- Ladezeit 0.8f gegen 0.8e: +32 bis +82 ms in drei Läufen (Grenze +30, Streuung ±100) – Ursache nicht gefunden.
- Im Auftrag hatten Audan, Delto und Escorta „zwei Rohre“ – ihre Modelle haben **ein** Rohr und sollten unverändert bleiben;
  die Flamme kommt dort aus dem einen Rohr.
- `ton-test` scheitert im Test-Browser an vier zeitkritischen Prüfungen (Puffer-Häppchen 17 ms, Tempo mit `?ton=aus`, Neustart
  mit 8 Rauschquellen, Gas im Countdown) – **genauso mit dem unveränderten Stand 0.8d** im selben Browser, also die Umgebung,
  nicht M8e. `ton-umgebung-test` (in `m8b-test`) wackelt aus demselben Grund manchmal.
- Offline-Ton ist im Test-Browser nicht Sample für Sample wiederholbar (zwei gleiche Rechnungen unterscheiden sich um ca.
  1e-4); der Flammen-Test prüft darum „Ereignisse identisch, Samples im Rechenrauschen“.
- Die Flamme beim Aufheulen in der Garage sieht man nur, wenn das Heck gerade zur Kamera zeigt (die Vorschau dreht sich).
- Kein echtes Gamepad und kein Touch getestet (nur simuliert).

## Ideen/Vorschläge (nicht umgesetzt)

- **Bestzeiten je Auto getrennt** (eine Liste je Auto oder ein Filter): mit gemeinsamer Liste kann das schnellste Auto
  (Lanza 073) die Liste füllen. Lino hat „gemeinsam“ gewählt, darum nur hier notiert.
- **Motorgeräusch von innen und von aussen** (je nach Kamera; im Spiel gibt es nur die Kamera hinter dem Auto).
- **Getriebeheulen beim Mittelmotor** (Lanza: das Getriebe sitzt hinter dem Fahrer, ein leises Zahnrad-Heulen unter Last).
- **Schaltvorgang animiert** (z. B. kurzes Nicken der Karosserie beim Schalten oder ein Schalthebel im HUD).
- **Flamme auch beim Aufheulen in der Garage gut sichtbar machen** (die Vorschau dreht sich, das Heck ist nicht immer zu sehen).
- **Rauschen im Lader-Heulen** (etwas Bandrauschen um die Heulton-Höhe), falls der reine Ton zu „elektronisch“ klingt.
- **Felgenfarbe je Lackierung** (z. B. goldene Felgen für den blauen Subora): braucht einen Slot im Baukasten (M8f nicht umgebaut).
- **Tastatur-Lenkung je Auto** oder ein „Gegenlenk-Tipp“ (bei der Tastatur pendeln alle Autos, wenn man die Gegentaste hält).
- **Testfahrer robuster machen** (spätes Bremsen vor der Rechtskurve bei 2760 m), damit kleine Fahrwerks-Änderungen nicht kippen.

- (Ältere Ideen: in `docs/archiv/STAND-bis-m8e.md`, je Meilenstein unter „Ideen/Vorschläge“, über `INDEX.md` finden.)

## Regel für neue Meilensteine

- Der ausführliche Bericht (Messtabellen, Selbsttest, Test-Anleitung für Lino, Bilderliste) kommt nach `docs/meilensteine/<name>.md`.
- Hier in `STAND.md` steht je Meilenstein nur eine Zusammenfassung von **höchstens 15 Zeilen** und der Verweis; „Aktuell“ wird nachgeführt.
- Während der Arbeit: `docs/meilensteine/<name>-arbeitsstand.md` (10 bis 20 Zeilen: erledigt, Werte, offene Fragen) nach jedem Teil nachführen.

## Meilensteine (Zusammenfassungen, neueste oben)

- **M8f** (0.8f) – Bericht mit Messtabellen, Test-Anleitung und Bildern: `docs/meilensteine/m8f.md`.
  - **Lanza 073:** Heck als Gruppe-B-Keil (Deckel fällt 9°, Finnen vom Dach, Kotflügel-Kamm, Flügel auf Stützen); fangbar
    (Heck beim Bremsen in der Kurve +5.7° statt +10°, gefangen nach 0.68 s statt 1.28 s, Tastatur-Slalom ohne Dreher);
    Motor tiefer (420 statt 554 Hz bei 7000/min), Lader +7 dB und tiefer (2.2 kHz), Gänge länger (bei Höchsttempo 6800
    statt 7700/min).
  - **Subora Imprexa:** Werk-Lack blau mit gelber Schrift, vierter Lack ROT (der alte); schaltet bei 7800/min, Ton bis
    8300/min, Tacho bis 9000/min (Tacho-Skala je Auto, alle anderen Tachos unverändert).
  - **Kontext-Diät:** alte STAND.md (566 KB) unverändert im Archiv, neue STAND.md ca. 16 KB, Spar-Regeln in CLAUDE.md.
  - **Nicht erreicht:** Lanza-Höchsttempo −2.9 % statt −3 %, Kontrolltests K2 und K4, goldene Felgen (kein Slot).
  - Testen: `node tools/m8f-test.mjs --alt <ordner 0.8e>`; Ton und Fahrgefühl nur gemessen, nicht erlebt.
- **M8e** Lanza 073 und Subora Imprexa, Garage für fünf Autos, Aufheulen, Flamme. Bericht: `docs/archiv/STAND-bis-m8e.md` ab Zeile 44.
- **Bis M8e:** alle Berichte im Archiv, siehe `docs/archiv/INDEX.md`.
