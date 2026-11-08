# Alpine Rally – Stand

## Aktuell

Aktuell: **Meilenstein 11a fertig** (Version 0.11a) – **Schnee und Eis** als Untergrund (Allrad im Vorteil, Eis sehr
rutschig), **Schneewall** als weicher Rand (bremst, keine Strafe) und die **dritte Etappe „Gletscher“** (ca. 4.3 km, 3 Kehren,
7 Eisstellen, 3 Sprünge, strahlender Tag). Zielbildschirm rollt nie mehr. **Zwei offene Punkte** (Eiskehre mit Escorta/Lanza 073,
Lanza „flott“ an der Kreuzung) und **nur Chromium, kein Handy, kein Gamepad, Ton nur gemessen.** **Bitte zuerst die
Test-Anleitung in `docs/meilensteine/m11a.md`.** Nächster Schritt: siehe KONZEPT.md, Fahrplan (M11b Gletscherspalten, Eistunnel).
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
**Handy (seit M9a, Belegung seit M9a.1):** D-Pad = lenken (↑ Gas, ↓ Bremse, Schrägen gehen), A = Gas, B = Bremse,
**R = Handbremse**, **L = zurück auf die Strasse**, START = Pause, SELECT = HUD, NOTES = Pace-Notes; im Menü D-Pad, A = OK,
B = zurück, L = wie Taste R (Zielbildschirm: NEU STARTEN), oder antippen. EINSTELLUNGEN → TOUCH-STEUERUNG = AUTO / AN / AUS,
AUTO-GAS = AN / AUS, KNOPFGRÖSSE, LAYOUT (GESPIEGELT: D-Pad rechts), HAPTIK = AUS / NUR KNÖPFE / VOLL (nur Touch;
HAPTIK nur auf Geräten, die vibrieren können). **HUD-GRÖSSE** (unter ANZEIGE, alle Geräte) macht Zeit, Ansagen, Karte und Tacho kleiner/grösser.

Alle Einstellungen (auch N) merkt sich der Browser. Nur H nicht: Bei jedem Start ist das HUD wieder an.

---


## Wo steht was

Spiel (`index.html` lädt `js/start.js`, das `js/main.js`; die Strecke steht in `strecken/alpen.js`, Format `docs/strecken-format.md`; Three.js liegt unter `lib/`). Hilfsseiten: `auto-labor.html`, `ton-labor.html`,
Fahr-Labor im Spiel mit `index.html?fahrlabor=1`, anderes Auto mit `?auto=<id>`.

- `js/ablauf.js` – Ablauf des Spiels (seit M5a): eine kleine Zustandsmaschine.
- `js/absperrungen.js` – Absperrungen (seit Meilenstein 3a, als Leitwand seit M3a.1): Wo die E…
- `js/audio.js` – Ton (Meilenstein 7a, M7a.1): Motor, Reifen, Wind, Aufprall und Signale – all…
- `js/autolabor.js` – Auto-Labor (M8a): Hilfsseite zum Ansehen des Autos ohne Fahren (auto-lab…
- `js/autos.js` – Modelldaten der Autos (seit M8a). js/car.js baut daraus das 3D-Modell (baueA…
- `js/bestzeiten.js` – Bestzeiten (seit M5b; seit M8h Top 10 je Auto unter `alpineRally.bestzeiten2`, Gesamt-Top-3 abgeleitet, Übernahme der alten Liste; letzter Lauf).
- `js/car.js` – Das Auto als 3D-Modell (seit M8a): baueAuto(modell, lackierung) baut es aus de…
- `js/checkpoints.js` – Checkpoints: Tore quer über die Strasse (zwei Pfosten und ein Banner).
- `js/config.js` – alle Stellschrauben an einem Ort (gross: nur bereichsweise lesen)
- `js/demofahrt.js` – Demo-Fahrt hinter Titel und Hauptmenü (seit M5a).
- `js/etappenwahl.js` – Etappenwahl (M10b): Infos aller Strecken, Vorschau-Karte, Wählen = merken + neu laden.
- `js/einstellungen.js` – Einstellungen (seit M5a): Werte, Standardwerte aus config.js (Block…
- `js/fehlerseite.js` – Fehlerseite (M10a), wenn die Strecke nicht geladen werden kann (Pixel-Look, de/en).
- `js/fahrlabor.js` – Fahr-Labor (Meilenstein 8a): Seitenpanel zum Nachstellen des Fahrgefühls…
- `js/haptik.js` – Haptik (M9a.1): Vibration nur mit `navigator.vibrate` (Android), nur im Touch-Modus (M9a.2: ohne iPhone-Trick).
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
- `js/leben.js` – Leben an der Strecke (Meilenstein 3d).
- `js/lebenbild.js` – Pixel-Bilder für "Leben an der Strecke" (Meilenstein 3d), im Code gezeic…
- `js/main.js` – Start des Spiels und Spielschleife.
- `js/menue.js` – Menü-Baustein (seit M5a): Seiten mit einer Liste von Einträgen, gezeichnet i…
- `js/menueseiten.js` – Die Menüseiten (seit M5a): Titel, Hauptmenü, Auto, Etappe, Bestzeiten,…
- `js/motive.js` – Landesfahnen als Pixelbild (M10b), Wahl in der Streckendatei (`deko.fahne`).
- `js/minimap.js` – Minimap oben rechts (Meilenstein 6, seit M6.1 ein mitfahrender Ausschnitt)…
- `js/musik.js` – Menü-Musik (M7b): spielt das Stück aus js/musikstueck.js mit Web Audio, alle…
- `js/musikstueck.js` – Menü-Musik (M7b): Notendaten des Stücks "Passfahrt" – Eigenkomposition…
- `js/netz.js` – Strassennetz (Meilenstein 3a): die Etappe plus die Stummel an den Nebenwegen.
- `js/pacenotes.js` – Pace-Notes (Meilenstein 4): Ansagen des Beifahrers oben im Bild.
- `js/pacenotesbild.js` – Pixel-Symbole der Pace-Notes, im Code gezeichnet (keine Bilder).
- `js/physics.js` – Fahrphysik des Autos (Arcade mit etwas Gewicht).
- `js/pixel.js` – Pixel-Texturen, im Code gezeichnet (keine Bilddateien).
- `js/rennablauf.js` – Rennablauf (seit M5b): Anzeige des Countdowns 3 - 2 - 1 - GO! in der Bi…
- `js/sperren.js` – Abkürzungs-Sperren: Felsbrocken, Tannengruppen oder umgefallene Baumstämme
- `js/schneewall.js` – Schneewall (M11a): weicher Rand der Gletscher-Etappe (bremst, schiebt heraus, keine Strafe), Wall und Schneestangen.
- `js/sprites.js` – Bäume und Steine als 2D-Sprites (Billboards) wie bei N64/PS1.
- `js/start.js` – Start (M10a): lädt `js/main.js`, bei einem StreckenFehler die Fehlerseite.
- `js/startziel.js` – Start- und Zielbereich (Meilenstein 3c).
- `js/startzielbild.js` – Pixel-Bilder für den Start- und Zielbereich (Meilenstein 3c), im Cod…
- `js/staub.js` – Staub auf Schotter (Meilenstein 3a): helle Wölkchen hinter den Hinterrädern.
- `js/strecken.js` – Strecken-Register (M10a): Liste der Strecken (`alpen`, seit M10b `finnland`, seit M11a `gletscher`), gewählte Strecke.
- `js/streckenlader.js` – Lader (M10a): Streckendatei holen, schnell prüfen, `STRECKE` bereitstellen.
- `js/streckenpruefung.js` – Prüfung einer Streckendatei (M10a; schnell im Lader, voll in `tools/strecke-pruefen.mjs`).
- `js/strassenrand.js` – Strassenrand (Meilenstein 2a): Leitplanken, Holzzäune und Schilder.
- `js/tacho.js` – Analoge Tachos im Pixel-Look (Meilenstein 1.2): Tempo und Drehzahl, unten re…
- `js/texte.js` – Alle sichtbaren Texte des Spiels (seit M5a), Deutsch (Schweizer Schreibweise…
- `js/tonfahrt.js` – Feste kurze Fahrt für den Motor-Vergleich (Meilenstein 8d): Ton-Labor (Kn…
- `js/tonlabor.js` – Ton-Labor (M7a): Hilfsseite zum Anhören aller Töne, ohne zu fahren (ton-l…
- `js/touch.js` – Touch-Steuerung (M9a): Erkennung AUTO/AN/AUS, Knöpfe auf der Seite, Mehrfinger, Menü mit D-Pad und Antippen.
- `js/touchbild.js` – Aussehen der Touch-Knöpfe im Pixel-Look (M9a), jeder Zustand einmal gemalt.
- `js/touchlayout.js` – Lage von Bild und Touch-Knöpfen im Hoch- und Querformat (M9a), reine Rechnung.
- `js/track.js` – Streckenverlauf (Meilenstein 1): Spline durch die Stützpunkte der Streckendatei.
- `js/umgebung.js` – Umgebungsklänge (M7b): Kuhglocken, Publikum (Gemurmel, Jubel, Klatschen),…
- `js/util.js` – Kleine Hilfsfunktionen: Zufall mit festem Startwert, Rauschen, Mathe.
- `js/vergleich.js` – Live-Vergleich zur Bestzeit oder zum letzten Lauf (Meilenstein 6).
- `js/wasser.js` – Seen, Flüsse und Holzbrücken (M10b), Orte in der Streckendatei (`wasser`).
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

- Strecke **3667.587 m** ±0.5. Seit M10d: 3 Sprungzonen (Kante 180 / 2140 / 3440 m), `revision` 2, Schatten.
- `node tools/abkuerzungen.mjs --pruefen` = **127 / 2 / 342 / 84**.
- Testfahrer mit Profil `prototyp`: seit M10d (Sprünge, revision 2) **3:01.80 / 2:43.73 / 2:32.40** (vorher 2:59.33 / 2:42.35 / 2:31.92).
- Pace-Notes-Tabelle und Abkürzungs-Daten (seit M10a in `strecken/alpen.js` unter `erzeugt`) und `tools/schneiden-zeiten.json` nicht neu schreiben.
- Profil `prototyp` bleibt bit-gleich (Referenz für Pace-Notes, Sperren, Testfahrer). Fertige Autos bleiben bit-gleich, wenn der
  Auftrag sie nicht nennt (Aussehen, Fahrgefühl, Ton, Tacho).
- **Finnland (seit M10c):** Länge 4161.6 m, Draufsicht/Checkpoints/Untergrund wie 0.10b.2, 4 Sprungzonen (Kante 495 / 1830 /
  3090 / 3656 m), `revision` 3, Hang-Check 0 Stellen über 0.45. Seit M10c.1: Seekehre (keine Planke aussen 3260–3400 m, See).
  Testfahrer-Zeiten: Tabelle in `docs/meilensteine/m10c1.md`.
- **Gletscher (seit M11a):** Länge 4345.3 m (gefahren 4275 m), Belag Schotter 7.0 / Schnee 78.3 / Eis 13.1 / Asphalt 1.6 %,
  Sprünge 16.0 / 21.7 / 23.7 m bei 100 km/h, Bestzeiten-Schlüssel `gletscher` (revision 1), Hang-Check 0 Stellen, Testfahrer
  „mittel“: Allrad 3:34.0–3:34.4, Escorta 3:45.9, Lanza 073 3:46.7, Prototyp 3:39.7. Schnee/Eis-Werte: Tabelle in `m11a.md`.
- **Limits:** Draw Calls pro Auto ≤ 12, Dreiecke pro Auto ≤ 1800, kein Garbage pro Bild, Ladezeit gleich, Ton ändert nie das Spiel.

## Werkzeuge und Tests

- `node tools/m11a-test.mjs --alt <0.10d = 40c41f3> [--nur a,b] [--lang]` – alle Prüfungen von M11a (a … x, zz = frühere Tests
  mit `--lang`); `node tools/m11a-bilder.mjs` – Bilder nach `screenshots/m11a/`; `node tools/schnee-messung.mjs` – Bremsweg,
  0–60, Kreis und Drift je Auto auf Asphalt/Schotter/Schnee/Eis (ohne Browser); `node tools/gletscher-entwurf.mjs [--schreiben]`
  – Verlauf und Höhenprofil des Gletschers; `strecke-abfahren --kurven-vergleich` prüft jetzt auch den Schneewall.
- `node tools/m10d-test.mjs --alt <0.10c.2 = b14cecc> --alt017 <017fb8f> --altC <059fad6> [--nur a,b] [--lang]` – alle Prüfungen von
  M10d (a … ac, zz = frühere Tests mit `--lang`); `node tools/m10d-bilder.mjs` – Bilder nach `screenshots/m10d/`;
  `node tools/kommentar-waechter.mjs` – findet auskommentierte Code-Zeilen in `js/*.js` (Schaltton-Fehler aus M10c).
- `node tools/m10c1-test.mjs --alt <ordner 0.10c = 612cc62> [--nur a,b] [--lang]` – alle Prüfungen von M10c.1 (a … ae, bz =
  Bildzeit je Auflösung, x1–x5 Alpen, zz = frühere Tests mit `--lang`); `node tools/m10c1-bilder.mjs` – Bilder nach
  `screenshots/m10c1/`; `node tools/wand-kurven.mjs --strecke <id> --auto <id>` – Wert der Wand je Kurve; Stil `--stil wand`.
  **Alle Werkzeuge laufen jetzt fest mit 320x180** (`?aufloesung=320x180`), anders mit `--aufloesung 640x360` oder `auto`.
- `node tools/m10c-test.mjs --alt <ordner 0.10b.2 = ffca7c3> [--nur a,b] [--lang]` – alle Prüfungen von M10c (a … y, Alpen x1–x5,
  Finnland alt/neu x6, frühere Tests z); `node tools/m10c-bilder.mjs` – Bilder nach `screenshots/m10c/`;
  `strecke-abfahren.mjs --json <datei>` meldet die Sprünge je Stil (Weite, Zeit, Höhe, Verlust).
- `node tools/m10b2-test.mjs --alt <ordner 0.10b.1> --vorE <ordner d1eb680>` – alle Prüfungen von M10b.2 (a … x, Alpen x1–x5);
  einzeln `--nur a,x2` (`x1-5` = alle Alpen-Tests); Regression mit `--lang` (0.10b.1: `git worktree add <ordner> a289fad`).
  `node tools/m10b2-bilder.mjs --alt <0.10b.1>` – Bilder nach `screenshots/m10b2/`. `node tools/hang-pruefen.mjs --strecke <id>`
  (Hang-Check), `strecke-abfahren --stil digital` (Tastatur-Fahrer), `node --import ./tools/node-three.mjs tools/schotter-messung.mjs`.

- `node tools/m10b1-test.mjs --alt <ordner 0.10b>` – alle Prüfungen von M10b.1 (a … p, Alpen x1–x5); einzeln `--nur a,x2`; Regression
  mit `--lang` (0.10b: `git worktree add <ordner> 61004a7`). `node tools/m10b1-bilder.mjs --alt <0.10b>` – Bilder nach `screenshots/m10b1/`.
  Finnland-Verlauf: `tools/finnland-entwurf.mjs` (Gerade/Kurve, Höhenprofil, Nebenwege); `strecke-abfahren --tempo` = Tempoprofil.

- `node tools/m10b-test.mjs --alt <ordner 0.10a>` – alle Prüfungen von M10b (a1–a5, b … s); einzeln `--nur e,f`; Regression
  mit `--lang` (0.10a: `git worktree add <ordner> e7054e3`). `node tools/m10b-bilder.mjs` – Bilder nach `screenshots/m10b/`.
  Strecken-Werkzeuge nehmen `--strecke <id>` (Standard `alpen`); Finnland-Verlauf: `tools/finnland-entwurf.mjs`.

- `node tools/m10a-test.mjs --alt <ordner 0.9a.2>` – alle Prüfungen von M10a (a) bis (l); einzeln `--nur e,f`; Regression mit
  `--lang` (0.9a.2: `git worktree add <ordner> 90df3d8`). Bilder: eigene Bild-Uhr im Test (pixelgleich vergleichbar).
- **Strecken (M10a):** `node tools/strecke-pruefen.mjs <datei>` (Prüfer, 0/1), `node tools/strecke-karte.mjs <datei>` (Karte,
  Höhenprofil, Bericht), `node tools/strecke-abfahren.mjs <datei> [--auto <id>]` (Testfahrer fährt die Strecke). Anleitung:
  `docs/strecken-format.md`. Erzeugte Daten lesen/schreiben: `tools/strecke-erzeugt.mjs`.
- `node tools/m9a2-test.mjs --alt <ordner 0.9a.1>` – alle Prüfungen von M9a.2 (a) bis (m), (u), (v); einzeln `--nur b,e`;
  Regression mit `--lang` (0.9a.1: `git worktree add <ordner> 4a265b2`). `node tools/m9a2-bilder.mjs` – Bilder nach `screenshots/m9a2/`.
- `node tools/m9a1-test.mjs --alt <ordner 0.9a>` – alle Prüfungen von M9a.1 (a) bis (v); einzeln `--nur e,f`; Regression
  mit `--lang` (0.9a: `git worktree add <ordner> 12de5b8`). `node tools/m9a1-bilder.mjs` – Bilder nach `screenshots/m9a1/`.
- `node tools/m9a-test.mjs --alt <ordner 0.8h>` – alle Prüfungen von M9a (a) bis (n) und (u); einzeln `--nur a,d`; Regression
  mit `--lang`. Touch nur in Chromium emuliert. `node tools/m9a-bilder.mjs` – Bilder nach `screenshots/m9a/`.
  `node tools/icons-bauen.mjs` – Icons für den Web-App-Modus neu malen (`icons/`).

- `node tools/m8e-test.mjs` – alle Prüfungen (a) bis (j); einzelne Teile mit `--nur d,g`. Dauert lange (Testfahrer, Ton).
- `node tools/m8e-bilder.mjs` – alle Bilder nach `screenshots/m8e/` (einzeln: `--nur garage,flamme`).
- `node tools/ton-messung.mjs m8e-l073 --profil l073 --bilder screenshots/m8e` – Ton-Messung eines Autos mit Spektrogrammen.
- `node tools/auto-messung.mjs` – Fahrmessung aller Profile, Messtabellen M8e.
- `node tools/m8f-test.mjs --alt <ordner 0.8e>` – alle Prüfungen von M8f (a) bis (g); einzeln `--nur b,d`; Regression mit `--lang`.
- `node tools/m8h-test.mjs --alt <ordner 0.8g>` – alle Prüfungen von M8h (a) bis (n); einzeln `--nur c,k`; Regression mit `--lang`.
  `node tools/m8h-bilder.mjs` – Bilder nach `screenshots/m8h/` (einzeln `--nur bestzeiten,klein,ziel,einstellung,leer`).
- `node tools/m8g-test.mjs --alt <ordner 0.8f>` – alle Prüfungen von M8g (a) bis (i); einzeln `--nur a,f`; Regression mit `--lang`.
  (a) = Tacho KLASSISCH pixelgleich zu 0.8f (ohne `--alt` gegen `tools/m8g-referenz-08f.json`).
- `node tools/m8g-bilder.mjs` – Bilder nach `screenshots/m8g/` (einzeln `--nur tacho,klassisch,layout,garage,rennen,einstellung`);
  `node tools/m8g-karte.mjs <auto>` – Tacho-Ausschnitt als Text-Pixelkarte (billiger als ein Bild).
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
- **M8g, Tacho:** beim Tempo fehlt im Auto-Stil die „200“ (kein Platz über der Digitalanzeige; nur der Escorta zeigt sie);
  das Schaltlicht von Audan, Delto, Escorta blinkt fast immer vor dem Schalten (an 6550, blinkt 6600, nach Regel), Delto und
  Escorta blinken bei Höchsttempo dauernd (drehen dort über den Begrenzer); in der Garage nur der Drehzahlmesser, das 3D-Auto
  ist schmaler (130 statt 182 Pixel). Lesbarkeit nur an Bildern beurteilt. Details: `docs/meilensteine/m8g.md`.
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
- **M9a, Touch:** nur Chromium-Emulation; Safari/Firefox, Stumm-Schalter, Notch (Safe-Area geschätzt), Rand-Wischen und
  Fingergefühl ungeprüft. Im Querformat mit Safe-Area wird das Bild kleiner (491x276 auf 874x402). HUD im Hochformat klein.
  Test-Browser: im Menü teils nur 3 Bilder/s, Menü-Tests blenden darum die 3D-Szene aus. Details: `docs/meilensteine/m9a.md`.
- Touchscreen-Laptop: mit TOUCH-STEUERUNG = AUTO erscheinen dort die Knöpfe (dann AUS wählen).
- **M9a.2:** Querformat mit KNOPFGRÖSSE GROSS: Bild deutlich kleiner (874x402: 439x247, mit Safe-Area 373x210);
  HUD GROSS: Tacho 41 % der Bildbreite (Ziel ein Drittel nicht erreichbar, schon MITTEL sind es 35 %). Details: `docs/meilensteine/m9a2.md`.
- **M9a.1:** (iOS-Haptik seit M9a.2 entfernt) Querformat-Bild wegen des grösseren
  D-Pads ca. 8–9 % kleiner (874x402: 501x282); quer liegt rechts vom Kreuz kaum Platz für die Lenk-Zone (nur senkrecht
  grosszügig); kleines iPhone quer mit Safe-Area sehr knapp (A/B 44, R 53x29). Details: `docs/meilensteine/m9a1.md`.

## Ideen/Vorschläge (nicht umgesetzt)

- **Offen aus M11a:** Kurven-Vergleich Eiskehre (Escorta −1.65 s, Lanza 073 −0.75 s mit Wall schneller; Escorta Kehre 1 −0.11 s);
  Lanza 073 „flott“ rutscht an der Gletscher-Kreuzung (356 m) in die Absperrung. Gipfelkreuz am Horizont, echte kleine
  Zwergkiefern, EIS-Symbol in der Legende (STEUERUNG), Zeit je Gletscher-Sprung messen. Alpen-Deko (Teil E aus M10d:
  Holzstapel, Heuballen, Wegkreuz, Murmeltiere) bleibt eine offene Idee (Lino: „die Alpen haben schon viel Deko“).
- **Offen aus M10d:** Teil E (mehr Deko in den Alpen: Holzstapel, Heuballen, Wegkreuz/Bergkapelle, Murmeltiere) nicht gebaut
  (Kontext-Regel: E fällt zuerst weg). Kartierung der vorhandenen Alpen-Deko im Bericht. Ideen: Schatten auch für die Alphütten
  (liegen 38–52 m neben der Strasse, ausserhalb `schatten.nahStrecke`), Hinweistext SCHATTEN („NUR AUF STRECKEN MIT SCHATTEN“)
  stimmt noch, könnte jetzt „ALPEN UND FINNLAND“ heissen; bei kleinen Streifern (10–15 km/h) eine mildere Stufe, falls Lino
  3 s zu hart findet.
- **Offen aus M10c.2 (mit M10d erledigt: Strafe härter, Schaltton, Wums):** Kurven-Vergleich: in 7 von 20 Alpen-Kehren lohnte sich die Planke noch (Escorta alle vier: die Drossel
  wirkt beim Hinterradler mit Vollgas wie eine Traktionshilfe; Lanza 073 Kehre 1/3, Imprexa Kehre 4: mit Drossel weniger
  Schleifen). Vorschlag V1 `wandStrafe.leistungStart` 0.1 statt 0.25 (Zahlen im Bericht). Ideen: Strafe zusätzlich als
  Tempo-Limit (Begrenzer tiefer), Testfahrer mit Gefühl am Gas als Messlatte, Schalt-Ton im Rennen reparieren (siehe Bekannte
  Probleme), Wums-Lautstärke nach Linos Hörtest (`LANDUNG_WUMMS_LAUTSTAERKE`).
- **Offen aus M10c.1:** (In den Alpen-Kehren lohnte sich die Planke noch – mit M10c.2 für Audan, Delto weg, siehe oben.) Seekehre: Ufer 2–7 m statt 3–4 m (ein See = ein
  Wasserspiegel, die Strasse steigt), Zuschauer nur aussen (innen verbietet die Abkürzungs-Regel). Ideen: Wand-Strafe als
  Einstellung (MILD / MITTEL / STRENG), Delle oder Kratzer am Auto nach Einschlägen, Wasserbad-Zähler in der Statistik.

- **Offen aus M10c:** **Teil E (ein bis zwei Sprünge in den Alpen) nicht gebaut** (Eingriff in die Alpen, eigene Prüfung der
  Abkürzungen und Bestzeiten nötig). Birkenkuppe liegt wegen Checkpoint 2 (1707 m) bei 1830 statt 1751 m; die alte flache Kuppe
  bei 1747 m bleibt eine normale Kuppe. Lanza 073 bleibt im Testfahrer unfallträchtig. Ideen: Luftlenkung (von Lino abgelehnt,
  nur als Idee), Sprungrekord-Anzeige in der Etappenwahl, Wasserbad-Zähler in der Fahrtstatistik, Sprung-Marken auf der
  Minimap, Zuschauer auch an der Hochwaldkuppe, Landehang je Sprung im Strecken-Editor.

- **Offen aus M10b.2:** Schatten unter Schildern und der Brücke fehlen; zwei Hang-Stellen an der Brücke 0.38/0.42 (Fluss
  liegt schräg nah an der Strasse); der Testfahrer zeigt nicht, dass der Lanza 073 schneller als der Escorta ist (er fliegt
  im Stil „digital“ öfter ab). Ideen: Wasserbad-Zähler in der Fahrtstatistik, Fluss etwas von der Strasse weg legen,
  Schatten auf den Alpen, Schatten-Länge je Tageszeit, Rentier-Glöckchen (manche Herden tragen welche).

- **Erledigt in M10b.2 (aus M10b.1):** Kunst-Schatten, Rentier-Ton. **Offen aus M10b.1 (alt):** **Kunst-Schatten** (Teil D: Streckenfeld `schatten`, Flecken unter Auto, Bäumen, Häusern, Einstellung
  SCHATTEN AN/AUS) – nicht gebaut. Fahrbarkeit: Audan/Subora flott und Lanza 073 mittel haben im Testfahrer noch 1–2
  Aufpralle auf Finnland (Bericht). Ideen: Testfahrer mit eigener Kurven-Messung je Auto (statt der Prototyp-Tempi),
  Wohnmobil an der Birkenkuppe (kein Platz), Rentier-Ton, Fahnenmast im Dorf, Zuschauer auch an den Kehren.

- **Strecken (M10b-Ideen):** Rentier-Warnschild (heute allgemeine Tier-Silhouette), Sonnenscheibe/Abendrot am Himmel,
  Spiegelung im See, Ton nach dem Etappenwechsel ohne neue Eingabe (geht im Browser nicht ohne Klick), Strecke
  wechseln ohne Neuladen, eigene Grip-Abstimmung der Hecktriebler auf Schotter (M10c mit Auto-Gewicht).

- **Strecken (M10a-Ideen):** Geisterauto aus der Fahrspur, Rally-Modus mit mehreren Etappen hintereinander, Wetter und
  Tageszeit als Streckendaten, Strecken-Editor im Browser. (Fahne als Datenwert und `--strecke` sind seit M10b erledigt.)

- **Touch (M9a.2-Ideen):** kurzer Klickton als Ersatz für die iPhone-Haptik, eigener Handbremsen-Knopf neben A/B,
  analoge Lenkung nach Daumenposition im D-Pad, Knöpfe frei verschieben (ziehen), Wake Lock (Bildschirm bleibt an).

- **Touch (M9a.1-Ideen):** eigener Handbremsen-Knopf neben A/B, Knopfgrösse einstellbar, Drift-Hilfe über B (z. B. B kurz
  antippen = Lastwechsel), analoge Lenkung nach Daumenposition im D-Pad (weiter aussen = stärker), Wake Lock
  (Bildschirm bleibt an), Lenk-Zone und Winkel einstellbar.

- **Touch (M9a-Ideen):** Knopfgrösse und Lage einstellbar (KLEIN/NORMAL/GROSS), Vibration beim Aufprall (Android),
  Bildschirm wach halten (Wake Lock), Gas automatisch als Hilfe, Neigungssteuerung, Tasten-Layout für Linkshänder,
  Standard-Auflösung auf dem Handy, Touch-Belegung umstellbar, grösseres HUD im Hochformat (Zeit, Tachos),
  Ton trotz Stumm-Schalter (`navigator.audioSession`, nur wenn Lino das will).

- **Bestzeit des markierten Autos in der Garage anzeigen** (M8h-Idee, z. B. eine Zeile unter den Werte-Balken).
- **Geisterauto aus der Fahrspur der Bestzeit** (die Spur je Auto liegt seit M6 im Speicher).
- **„Letzter Lauf“ je Auto** (heute je Etappe, egal mit welchem Auto).
- **Motorgeräusch von innen und von aussen** (je nach Kamera; im Spiel gibt es nur die Kamera hinter dem Auto).
- **Getriebeheulen beim Mittelmotor** (Lanza: das Getriebe sitzt hinter dem Fahrer, ein leises Zahnrad-Heulen unter Last).
- **Schaltvorgang animiert** (z. B. kurzes Nicken der Karosserie beim Schalten oder ein Schalthebel im HUD).
- **Flamme auch beim Aufheulen in der Garage gut sichtbar machen** (die Vorschau dreht sich, das Heck ist nicht immer zu sehen).
- **Rauschen im Lader-Heulen** (etwas Bandrauschen um die Heulton-Höhe), falls der reine Ton zu „elektronisch“ klingt.
- **Felgenfarbe je Lackierung** (z. B. goldene Felgen für den blauen Subora): braucht einen Slot im Baukasten (M8f nicht umgebaut).
- **Tastatur-Lenkung je Auto** oder ein „Gegenlenk-Tipp“ (bei der Tastatur pendeln alle Autos, wenn man die Gegentaste hält).
- **Testfahrer robuster machen** (spätes Bremsen vor der Rechtskurve bei 2760 m), damit kleine Fahrwerks-Änderungen nicht kippen.
- **Digitaltempo als 7-Segment-LED** beim Lanza 073 (wie die Gang-Anzeige), und beim Escorta eine Kilometerzähler-Walze.
- **Tempo-Blatt auch in der Garage** (braucht eine breitere Tafel oder ein zweites Layout).
- **Öldruck / Wassertemperatur** als kleine Zusatzanzeigen je Auto (nur Optik), falls die Tachos „echter“ wirken sollen.

- (Ältere Ideen: in `docs/archiv/STAND-bis-m8e.md`, je Meilenstein unter „Ideen/Vorschläge“, über `INDEX.md` finden.)

## Regel für neue Meilensteine

- Der ausführliche Bericht (Messtabellen, Selbsttest, Test-Anleitung für Lino, Bilderliste) kommt nach `docs/meilensteine/<name>.md`.
- Hier in `STAND.md` steht je Meilenstein nur eine Zusammenfassung von **höchstens 15 Zeilen** und der Verweis; „Aktuell“ wird nachgeführt.
- Während der Arbeit: `docs/meilensteine/<name>-arbeitsstand.md` (10 bis 20 Zeilen: erledigt, Werte, offene Fragen) nach jedem Teil nachführen.

## Meilensteine (Zusammenfassungen, neueste oben)

- **M11a** (0.11a) – **Schnee und Eis** (`untergrund.schnee/eis`, ein Block): Bremsweg aus 100 km/h gegen Schotter 1.48 / 2.81,
  `schneeGrip`/`eisGrip` je Auto, Allrad 0–60 auf Schnee 4.2–4.4 s, Hinterrad 6.9–7.4 s, Escorta ohne Schotter-Bonus. Ton (dumpfes
  Knirschen, Eis-Zischen), weisser Staub, Pace-Note EIS (Schneeflocke, 150 m). **Schneewall** (`js/schneewall.js`): bremst ca.
  45 %/s, rutscht heraus, keine Strafe. **Etappe „Gletscher“** (`strecken/gletscher.js`): 4275 m, 3 Kehren (eine auf Eis), 7
  Eisstellen, 3 Sprünge (16 / 22 / 24 m), Kontrast 40–54 Stufen, Hang-Check 0, Bildzeit 79 ms (Finnland 356). Etappenwahl mit 3
  Zeilen, eigene Bestzeiten. **Zielbildschirm** ohne Rollen (Zeit + Unterschied in einer Zeile). Alte rote Tests (pacenotes 981 m,
  Credits) begründet umgestellt. Alpen/Finnland bit- und pixelgleich. Offen: Eiskehre (Escorta/Lanza), Lanza „flott“ an der
  Kreuzung. Bericht: `docs/meilensteine/m11a.md`.
- **M10d** (0.10d) – Review M10c.2: **Schaltton** repariert (seit M10c schluckte ein Kommentar am Zeilenende in `js/main.js`
  `tonZ.zielGang`/`tonZ.schaltet`; Pegel wie vorher), Wächter `tools/kommentar-waechter.mjs` + Zähltest. **Wums** hart/sehr
  hart länger (`sprung.ton.wumms.laenger`): im Mix +8.8 / +12.2 dB (vorher +6.7 / +10.3), Spitze ≤ −1.05 dBFS. **Wand-Strafe**
  3–6 s, stapelt bis 9 s, 1 s Motor fast aus (0.03), dann glatt zurück; Kurven-Vergleich inkl. sanfter Gas-Rampe: „wand“
  gewinnt in **keiner** Kurve mehr (vorher 4, alte Messlatte 7). Kontaktfreie Läufe bit-gleich. **Alpen-Sprünge** STARTKUPPE
  180 / ALMKUPPE 2140 / ZIELKUPPE 3440 m (16.6 / 19.6 / 22.5 m bei 100 km/h), Alpen `revision` 2. **Mittags-Schatten** in den
  Alpen (Sonne 125°, kurz, kontrastarm, mit Steinen; Budget 60). Teil E (Deko) offen. Bericht: `docs/meilensteine/m10d.md`.
- **M10c.2** (0.10c.2) – Review M10c.1: **Wand-Strafe** (`js/wand.js`, `kollision.wandStrafe`): ab 10 km/h Tempoverlust im
  Wand-Kontakt Motor 25 → 100 % in 2–4 s (frontal 4 s), Schalten ×2, Drehzahl-Einbruch, Ladedruck und Ton mit, 3 Aussetzer,
  MOTOR-Leuchte neben dem Drehzahlmesser; stapelt bis 6 s; R, Wasser, Neustart, Menü, Countdown löschen, Pause friert ein.
  Kurven-Vergleich (`strecke-abfahren --kurven-vergleich`): Audan/Delto und ganz Finnland frei, 7 Alpen-Kehren noch nicht
  (Escorta, Lanza 073, Imprexa – Gründe im Bericht). Läufe ohne Kontakt bit-gleich, keine neue `revision`. Alte rote Tests
  entschieden (3 Erwartungen angepasst, nebenweg-Skript behoben). **Sprungkamera** AUS / RUHIG (= 0.10c.1) / NORMAL (Standard:
  Zoom 7 %, Neigung Sprung 3 8.6°, Ruck 1.1 %, 0.32 s; `sprung.SPRUNGKAMERA_STUFEN`), AN → NORMAL. **Wums** (Bass, Rauschen,
  Klack, Aua, Ducking −6 dB, Regler `LANDUNG_WUMMS_LAUTSTAERKE`): im Mix +2.0 / +6.7 / +10.3 dB gegen das Fahrgeräusch
  (vorher −2.9 / −0.3 / +4.9), Spitze ≤ −1.03 dBFS. Bericht: `docs/meilensteine/m10c2.md`.
- **M10c.1** (0.10c.1) – Review M10c: **Sprungkamera** steifer (`sprung.kamera`: zurück 0.05, heben 0.24 m, folgt in der Luft
  der Autohöhe, Ruck 0.4–0.6 % der Bildhöhe, 0.25 s). **Wand-Strafe** `js/wand.js` für Leitplanke, Zaun, Geländer, Absperr-Wand,
  Felswand (Winkel zur Wand: 25/60/75 %, Schleifen 35 %/s, keine Ausrichtung); Testfahrer-Stil `wand`, `tools/wand-kurven.mjs`:
  Exploit-Kurven 25 → 16 (Finnland 0, **Alpen-Kehren 1–4 noch +0.3–0.9 s**). Läufe ohne Wandkontakt bit-gleich, keine neue
  `revision`. **Seekehre** Finnland 3284–3376 m: Planke weg (`strassenrand.ohnePlanke`), naher See (neue Seefelder `nah`, `pegel`,
  `ufer` …, Ufer 2–7 m), Wasserbad zurück auf 3270 m, Zuschauer und Findlinge. **ETAPPE**: Karte 74x62 (60 %), Sprungrekord in
  der Liste. **PIXELGRÖSSE AUTO** (`js/aufloesung.js`, Standard, 640x360, zwei 4-s-Fenster unter 50 FPS = eine Stufe tiefer,
  gemerkt; altes 320x180 wird AUTO). Werkzeuge laufen fest mit 320x180 (`--aufloesung`). Bericht: `docs/meilensteine/m10c1.md`.
- **M10c** (0.10c) – **Sprünge mit Flugphase**: neues Modul `js/sprung.js` (Streckenfeld `sprung` mit Zone, Kante, Landezone,
  `staerke`, `form`; Höhen-Zusatz der Strasse ohne Änderung von Länge/Draufsicht; Abheben nur in Zonen und nur von der Fahrbahn;
  echte Wurfbahn; Landung: Verlust nur bei hartem Aufprall, Nase voran oder schräg, höchstens 35 %). Finnland: vier Sprünge
  (100 km/h: 14.5 / 23.8 / 38.0 / 30.3 m), Pace-Note SPRUNG (175 m vor der Kante), keine Schilder in Landezonen, Bestzeiten neu
  (`finnland-r3`). Sprungkamera (zurück, Landungs-Ruck in ganzen Bildpunkten, Einstellung SPRUNGKAMERA), Ton (Reifen aus, Motor
  frei, Wumms in drei Stärken, Jubel), Schatten bleibt am Boden und wird heller, Staub, Haptik. Sprung-Statistik im Zielbildschirm,
  Sprungrekord je Etappe. Alpen bit-gleich (ausser Zeile SPRUNGKAMERA in den Einstellungen). **Nicht gebaut:** Teil E (Alpen).
  Bericht, Tabellen, Test-Anleitung: `docs/meilensteine/m10c.md`.

- **M10b.2** (0.10b.2) – Finnland nach Linos Test: **Hang** zum See bei 969 m abgeschliffen (Streckenfeld `umgebung.boeschung`:
  Schulter, höchstens 0.3 Gefälle, Ufer weich; vorher sprang das Gelände senkrecht = „Faltenwurf“), Hang-Check-Werkzeug
  (Finnland 7 → 0 Stellen über 0.45; Alpen nur Bericht). **Wasser:** zu tief = Platsch, 3 s schwarz mit HUD, Zeit läuft, zurück
  auf die letzte sichere Strassenstelle. **Escorta:** Tastatur-Testfahrer „digital“ zeigte 23 s Rückstand und 37° Drift auf
  Schotter; neue Werte `schotterHeck/-Stabil/-Traktion` (nur Escorta, nur Schotter) → 0.6 s vor dem Imprexa, ohne Abflug.
  **Rentier-Ton** (Schnauben, Klicken), **Kunst-Schatten** (Streckenfeld `schatten`, Einstellung SCHATTEN AN/AUS). Alpen gleich.
  Bericht: `docs/meilensteine/m10b2.md`.

- **M10b.1** (0.10b.1) – Finnland-Feinschliff nach Linos Test: Strecke 4161.6 m (vorher 2.8 km) mit drei Spitzkehren, Schikane,
  geraden Bremszonen; Untergrundwechsel wie in den Alpen an vier Einmündungen (Stummel abgesperrt); `revision` → Bestzeiten
  `finnland-r2` (alte bleiben liegen). Wald: Fichten (dunkel), Kiefern dunkler, Birken kühler (57/28/15 %), Unterholz,
  Dorf mit 6 Gebäuden in 4 Bauarten, Boote, Elch-Schild. Escorta `schotterGrip` 1.065 (mittel 0.5 s vor Audan/Subora).
  Bildzeit: Wald für den Software-Renderer abgespeckt, Testlauf trotzdem +30 % (Einzelmessung +2–5 %), nicht sicher erreicht.
  Testfahrer Prototyp 2:55.88 / 2:39.06 / 2:28.61 (Schnitt vorsichtig 83.7 km/h). **Nicht erreicht:** Kunst-Schatten,
  Unfälle Audan/Subora flott und Lanza 073 mittel (je 1–2), Schnitt knapp unter 85 km/h. Alpen gleich (ausser Escorta auf
  Schotter). Bericht, Testtabelle, Test-Anleitung: `docs/meilensteine/m10b1.md`.

- **M10b** (0.10b) – Etappenwahl (Liste + Vorschau-Karte, wählen = kurz neu laden, Hauptmenü zeigt die Etappe), Bestzeiten
  je Etappe mit Umschalter, neue Strecke **Finnland-Schotter** (2.7 km, 89 % Schotter, Seen, Dorf, Holzbrücke, Spitzkehre,
  4 markierte Kuppen für M10c), Deko-Sets als Streckendaten (Fahne, Tier, Haus, Bäume), Werkzeuge mit `--strecke`.
  Alpen gegen 0.10a gleich. Bericht, Tests, Testfahrer-Zeiten, Unsicherheiten, Test-Anleitung: `docs/meilensteine/m10b.md`.

- **M10a** (0.10a) – Bericht mit Inventur, Format, Tests alt/neu, Unsicherheiten, Test-Anleitung: `docs/meilensteine/m10a.md`.
  - **Strecke als Daten:** `strecken/alpen.js` (52 KB, reine Daten), Lader `js/streckenlader.js`, Register `js/strecken.js`;
    `config.js` bindet die Werte unter den alten Namen ein. Kein neues Feature, Menü ETAPPE unverändert.
  - **Gleich wie 0.9a.2:** 3667.587 m, Abkürzungen 127/2/342/84, Testfahrer Prototyp und alle fünf Autos zeilengleich,
    30 Pace-Notes, 26 Bilder (nur die Versionszeile anders), Ton, Bestzeiten unter `passstrasse` erhalten.
  - **Fehlerseite** bei fehlender/kaputter Datei; **Werkzeuge** Prüfer, Karte/Höhenprofil, Abfahren mit dem Testfahrer.
  - **Unsicher:** Safari/iOS-Laden (await auf oberster Ebene, ab iOS 15), Ladezeit auf GitHub Pages, Alpen-Regeln im Code
    (Schweizer Fahne, Kühe, Alphütte).

- **M9a.2** (0.9a.2) – Bericht mit Zahlen, Fenstergrössen, HUD-Massen, Tests, Unsicherheiten, Test-Anleitung: `docs/meilensteine/m9a2.md`.
  - **R** wieder oben rechts in der Ecke (wie M9a), L oben links; quer mit Safari-Leisten NOTES unter R.
  - **HAPTIK** nur mit `navigator.vibrate` (Android); iPhone-Schalter-Trick und seine Texte entfernt.
  - **KNOPFGRÖSSE** 0.85 / 1 / 1.2 (in engen Fenstern begrenzt), **LAYOUT GESPIEGELT** (D-Pad rechts), beide sofort, nur Touch.
  - **HUD-GRÖSSE** 0.8 / 1 / 1.43 (Tacho 1.25): eigene Leinwand je Faktor, sauberer Pixel-Look; MITTEL pixelgleich zu 0.9a.1.
  - **Unsicher:** Fingergefühl KLEIN/GROSS, Spiegelung im Alltag, HUD GROSS auf dem Handy, Android-Haptik nur gezählt.

- **M9a.1** (0.9a.1) – Bericht mit Zahlen, Fenstergrössen, Tests, Unsicherheiten, Test-Anleitung und Bildern: `docs/meilensteine/m9a1.md`.
  - **Belegung:** R = Handbremse (über A, 80x44), L = zurück auf die Strasse; im Menü L = bisheriges R, R tut nichts.
  - **Kleine Knöpfe** als Pillen (26 hoch, Treffer quer 36), quer 29 % weniger Fläche; seitlich NOTES oben rechts.
  - **D-Pad quer** 176 (statt 131), Bild mittig zwischen den Zonen; **Lenk-Zonen beim Fahren** ←/→ ±50°, ↑/↓ ±15°,
    35 % über/unter dem Kreuz; im Menü klassisch.
  - **AUTO-GAS** (Standard aus): Gas von allein im Rennen, B bremst, R lässt Gas an; A zeigt AUTO.
  - **HAPTIK** (Standard voll): Android `vibrate`, iPhone Schalter-Trick, Knopf-Ticks im Pointer-Down, Rate-Limit 40/120 ms.
  - **Unsicher:** iPhone-Haptik und Fingergefühl nur von dir prüfbar; Desktop pixelgleich zu 0.9a (gemessen).

- **M9a** (0.9a) – Bericht mit Layout-Tabelle, Belegung, Tests, Unsicherheiten, Test-Anleitung und Bildern: `docs/meilensteine/m9a.md`.
  - **Knöpfe:** D-Pad, A/B (diagonal), L/R, START/SELECT/NOTES im Pixel-Look, orange wenn gedrückt, einmal gemalt.
  - **Layout:** Hochformat Bild in voller Breite über der dunklen Steuerfläche; Querformat Bild in der Mitte, Knöpfe
    links/rechts, kleine Knöpfe unter dem Bild oder seitlich; Rand ≥ 24 und Safe-Area, Treffer ≥ 44, Werte in `CONFIG.touch`.
  - **Eingabe:** Mehrfinger (Pointer je Finger, Gleiten wechselt den Knopf), Lenken wie die Pfeiltasten, Menü mit D-Pad
    (Wiederholung) und Antippen, Titel per Tippen (Ton beim Loslassen), nichts hängt (Abbruch, Drehen, Pause, Fokus).
  - **Einstellung TOUCH-STEUERUNG** AUTO/AN/AUS; VOLLBILD ohne Vollbild-API = Hinweis HOME-BILDSCHIRM.
  - **Web-App:** Manifest, eigene Pixel-Icons, Meta-Zeilen, kein Service Worker.
  - **Unsicher:** nur Chromium emuliert (kein iPhone, kein Safari/Firefox), Safe-Area geschätzt, Ton auf iOS ungeprüft.
  - Testen: `node tools/m9a-test.mjs --alt <ordner 0.8h>`; Desktop, Fahren, Ton, Autos, Tachos, Bestzeiten unverändert (gemessen).

- **M8h** (0.8h) – Bericht mit Speicherformat, Migration, Tests, Test-Anleitung und Bildern: `docs/meilensteine/m8h.md`.
  - **Speicher:** neuer Schlüssel `alpineRally.bestzeiten2`, je Etappe und Auto Top 10; Zeiten ohne gültiges Auto (alt,
    PROTO) zählen nur in der Gesamtwertung (Anzeige „--“ / „PROTO“). Gesamt-Top-3 wird abgeleitet. Voll ca. 290 KB.
  - **Übernahme:** beim ersten Lesen werden die alten Zeiten nach Auto kopiert; der alte Schlüssel bleibt, wie er ist
    (BESTZEITEN LÖSCHEN löscht beide).
  - **Rennen:** Live-Vergleich (BESTZEIT AUTO) gegen das eigene Auto, ohne eigene Zeit keiner; Zielbildschirm
    GESAMTREKORD! / NEUE BESTZEIT! / ZIEL!, Zeile „GESAMT PLATZ 2/3“ (mit „PLATZ p VON n“ in einer Zeile).
  - **Bestzeiten-Seite:** GESAMT TOP 3 oben, AUTO < NAME > (Links/Rechts, Maus, Gamepad), TOP 10 des Autos; passt in
    allen Pixelgrössen ohne Rollen (Menü ist immer 320x180; Zeilen 8 statt 9 Pixel).
  - **Unsicher:** Übernahme nur an erfundenen Daten getestet; alte Zeiten ohne Auto stehen in keiner Auto-Liste.
  - Testen: `node tools/m8h-test.mjs --alt <ordner 0.8g>`; Fahren, Ton, Autos, Tachos unverändert (gemessen).
- **M8g** (0.8g) – Bericht mit Skalen- und Schaltlicht-Tabelle, Tests, Test-Anleitung und Bildern: `docs/meilensteine/m8g.md`.
  - **Tacho je Auto:** Skala nach Messung (bis 8000, rot ab 6500; Subora 9000 / 8000), Tempo 200 km/h / 130 mph; Looks:
    Audan wie bisher, Delto schwarz mit blauem Ring, Escorta cremeweiss/schwarz, Lanza 073 LED-grün, Subora blau-gelb.
  - **Gang-Anzeige** je Stil (Lanza: 7-Segment-LED), **Schaltlicht** (an ab 95 % der Schaltdrehzahl, blinkt 7 Hz ab 250 unter
    dem Begrenzer, aus in N/R/Schaltpause), **BOOST / LADER**-Leiste über dem Drehzahlmesser (Escorta ohne).
  - **Garage:** Drehzahlmesser des markierten Autos neben dem 3D-Auto, folgt dem Aufheulen.
  - **EINSTELLUNGEN → TACHO** = AUTO-STIL / KLASSISCH; klassisch pixelgleich zu 0.8f (90 Fälle geprüft).
  - **Nicht erreicht / unsicher:** Tempo ohne „200“ im Auto-Stil, Schaltlicht blinkt fast immer, Lesbarkeit nur an Bildern.
  - Testen: `node tools/m8g-test.mjs --alt <ordner 0.8f>`; Fahren und Ton unverändert (gemessen).
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
