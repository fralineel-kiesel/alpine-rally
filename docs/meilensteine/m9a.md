# Meilenstein 9a – Touch-Steuerung fürs Handy (Version 0.9a)

**Wichtig vorweg:** Ich habe **kein echtes Handy** und nur **Chromium** (kein Safari/WebKit, kein Firefox). Alles, was
unten als „geprüft“ steht, ist **Chromium mit Touch-Emulation** (Playwright, `hasTouch`, `isMobile`, Mehrfinger über
CDP). Wie es sich auf deinem iPhone anfühlt, ob Safari und Firefox so reagieren wie Chromium, wie der Stumm-Schalter
wirkt und wo die Notch wirklich liegt, kannst nur du beurteilen. Bitte die Test-Anleitung unten durchgehen.

## Was gebaut wurde

- **Touch-Knöpfe** im Pixel-Look des Spiels (dunkelblau halbtransparent, heller Rand, **orange wenn gedrückt**):
  D-Pad (Kreuz mit vier Dreiecken), A und B (rund, B tiefer und weiter links), L und R (Schulterknöpfe),
  START / SELECT / NOTES (kleine runde Knöpfe mit Beschriftung darunter). Jeder Zustand wird einmal gemalt
  (`js/touchbild.js`), beim Drücken wird nur das fertige Bild kopiert – kein Neuzeichnen im Bildtakt.
- **Erkennung** (`js/touch.js`): Einstellung **TOUCH-STEUERUNG** = AUTO (Standard) / AN / AUS. AUTO schaltet ein bei
  grobem Zeiger (`pointer: coarse`), `maxTouchPoints > 0` oder bei der ersten echten Berührung (Knöpfe erscheinen
  sofort). AN zeigt die Knöpfe auch am Computer (mit der Maus bedienbar). AUS = alles wie 0.8h.
- **Layout** (`js/touchlayout.js`, reine Rechnung, Werte in `CONFIG.touch`):
  - **Hochformat:** Bild in voller Fensterbreite (16:9), mittig im schwarzen Raum über der Steuerfläche, nie unter der
    Notch. Steuerfläche unten (mindestens 46 % der Fensterhöhe, dunkle Fläche mit feiner Linie oben): L und R in den
    oberen Ecken, D-Pad links, A/B rechts, SELECT · START · NOTES unten in der Mitte.
  - **Querformat:** Bild in der Mitte, so gross wie die Seitenzonen erlauben (Zone mindestens 130 und höchstens 22 % der
    Breite; sonst werden die Knöpfe kleiner, nie unter 44 x 44 Trefferfläche). Links L, D-Pad; rechts R, A/B.
    START/SELECT/NOTES liegen **unter dem Bild**, wenn das Bild dadurch nicht kleiner wird, sonst **in den Seitenzonen**
    (links SELECT, rechts NOTES und START) – z. B. bei 874 x 330 (Safari-Leisten).
  - Abstand zum Rand mindestens 24 und mindestens der Safe-Area-Rand (`env(safe-area-inset-*)`, Viewport `viewport-fit=cover`).
  - Drehen, Adressleiste, Fenstergrösse: Layout sofort neu (`resize`, `orientationchange`, `visualViewport`).
- **Eingabe:** jeder Finger ist ein Pointer mit eigener Id und merkt sich seinen Knopf; **Gleiten** von Knopf zu Knopf
  (A → B) oder im D-Pad (← → ↖ → ↑) wechselt die Auslösung. Mehrere Finger gleichzeitig (Lenken + Gas + Handbremse).
  Die Knöpfe lösen **Aktionen** aus (nicht Tastencodes): neue Quelle `touchEingabe` in `js/input.js`, **Lenken über
  denselben weichen Aufbau wie die Pfeiltasten** (auch mit der Lenkempfindlichkeit; Verlauf Bild für Bild gleich).
- **Menü:** D-Pad = Pfeiltasten (gehalten: Wiederholung nach 0.4 s, dann alle 0.12 s – nach der Uhr, nicht nach der
  Spielzeit), A = Enter, B = Esc, START = wie Gamepad-Start (Pause: weiter), R = was die R-Taste auf der Seite tut
  (Zielbildschirm: NEU STARTEN). Menüpunkte direkt **antippen** (wie die Maus im 320x180-Raster). Im Rennen zählt
  Tippen aufs Bild nicht. Nachgemachte Mausklicks des Browsers werden unterdrückt (`preventDefault` auf den
  Touch-Ereignissen, dazu 1 s Mauspause nach jeder Berührung).
- **Titel:** „TIPPEN“ / „TAP TO START“; das Menü kommt beim **Loslassen** (`touchend`, zählt auf dem iPhone als Geste,
  erst dann darf der Ton starten). Zusätzlich weckt jedes `touchend` einen angehaltenen Ton (`ton.fortsetzen`).
- **Nie hängende Knöpfe:** Abbruch (`pointercancel`), Fokusverlust, Tab-Wechsel, Drehen, Wechsel in Menü/Pause/Ziel
  und Seitenwechsel lösen alle Finger. Ein gelöster Finger zählt erst wieder nach neuem Aufsetzen (Gas in der Pause
  bleibt also nicht „gedrückt“). Drehen im Rennen löst **keine** Pause aus.
- **Seite im Touch-Modus:** kein Scrollen, kein Zoomen (auch iOS-Pinch über `gesture*`), kein Kontextmenü, kein
  Markieren, keine Tipp-Hervorhebung; Höhe aus `window.innerHeight`. Nur unter der Klasse `html.touch`.
- **Vollbild:** ohne Vollbild im Browser (iPhone-Safari) zeigt VOLLBILD keinen Schalter, sondern „HOME-BILDSCHIRM“ mit
  dem Hinweis **ZUM HOME-BILDSCHIRM HINZUFÜGEN FÜR VOLLBILD** (als Web-App: „WEB-APP“). Wo es geht (Android-Chrome),
  wie bisher; Verlassen des Vollbilds = Pause.
- **Texte:** Hilfezeilen vor dem Start mit Knopfnamen (D-PAD: LENKEN A: GAS B: BREMSE …), Steuerungs-Seite mit
  Abschnitt **TOUCH** (im Touch-Modus oben, sonst nach SYMBOLE; die Seite rollt und wählt gemischt, Flag `rollenWahl`),
  Garage „A ODER ANTIPPEN = WÄHLEN“, Pace-Notes „GLEICH WIE KNOPF NOTES“. Alles de + en.
- **Web-App-Modus:** `manifest.webmanifest` (relative Pfade, `display: fullscreen` mit Rückfall `standalone`,
  `orientation: any`), Icons 192 / 512 / maskable 512 / apple-touch 180 aus **eigenem Werkzeug**
  `tools/icons-bauen.mjs` (Pixel-Motiv: Berge, Wiese, Strasse, ALPINE RALLY in der Spiel-Schrift, keine Marken),
  Meta-Zeilen für iOS und Android. **Kein Service Worker.**

## Belegung (fest in M9a)

| Knopf | Rennen | Menü |
|---|---|---|
| D-Pad ← / → | Lenken (wie die Pfeiltasten) | ändern / Regler (gehalten wiederholt) |
| D-Pad ↑ / ↓ | Gas / Bremse, Schrägen = lenken und Gas/Bremse | wählen (gehalten wiederholt) |
| A | Gas | bestätigen (Enter) |
| B | Bremse / Rückwärts | zurück (Esc) |
| L | Handbremse (gehalten) | – |
| R | zurück auf die Strasse (Rennen mit Wartezeit, vor dem Start sofort) | Zielbildschirm: NEU STARTEN |
| START | Pause | Pause: weiter |
| SELECT | HUD aus/an (wie H) | – |
| NOTES | Pace-Notes aus/an (wie N) | – |

Tastatur und Gamepad gehen gleichzeitig weiter; das Gamepad blendet die Knöpfe nicht aus.

## Layout-Regeln und Zahlen (`CONFIG.touch`, alles Richtwerte)

Rand 24 · D-Pad 146 (nie unter 96) · A/B 72, B um 76 links und 40 tiefer · L/R 80 x 40 · klein 36 (Treffer 44) ·
Trefferfläche ≥ 44 x 44 · Totzone D-Pad 20 % des Radius · Schräge 40° breit · Hochformat Steuerfläche ≥ 46 % ·
Querformat Faktor 0.9, Seitenzone ≥ 130 und ≤ 22 %, unter 330 Höhe verhältnismässig kleiner · Abstand zum Bild 8.

Fenstergrössen (CSS-Pixel; „+ Safe-Area“ = **geschätzte** Ränder eines iPhone 16 Pro: hoch oben 62 / unten 34,
quer links/rechts 62 / unten 21 – Chromium kennt keine Notch, die echten Werte sehe ich nicht):

| Gerät | Fenster | Format | Bild | D-Pad | A/B | L/R | klein | Zone | kleine Knöpfe | Rand l/r |
|---|---|---|---|---|---|---|---|---|---|---|
| iPhone 16 Pro hoch | 402x874 | hoch | 402x226 | 146 | 72 | 80x40 | 36 | – | unten | 24/24 |
| iPhone 16 Pro hoch + Safe-Area | 402x874 | hoch | 402x226 | 146 | 72 | 80x40 | 36 | – | unten | 24/24 |
| kleines iPhone hoch | 375x667 | hoch | 375x211 | 146 | 72 | 80x40 | 36 | – | unten | 24/24 |
| Pixel/Xiaomi hoch | 412x915 | hoch | 412x232 | 146 | 72 | 80x40 | 36 | – | unten | 24/24 |
| kleines Android hoch | 360x640 | hoch | 360x203 | 146 | 72 | 80x40 | 36 | – | unten | 24/24 |
| iPhone 16 Pro quer | 874x402 | quer | 544x306 | 131 | 65 | 72x36 | 32 | 165 | unter dem Bild | 24/24 |
| iPhone 16 Pro quer + Safe-Area | 874x402 | quer | 491x276 | 120 | 59 | 66x33 | 30 | 191 | unter dem Bild | 62/62 |
| iPhone quer, Safari-Leisten | 874x330 | quer | 544x306 | 131 | 65 | 72x36 | 32 | 165 | seitlich | 24/24 |
| iPhone quer, Safari-Leisten + Safe-Area | 874x330 | quer | 478x269 | 120 | 59 | 66x33 | 30 | 198 | seitlich | 62/62 |
| Pixel/Xiaomi quer | 915x412 | quer | 585x329 | 131 | 65 | 72x36 | 32 | 165 | unter dem Bild | 24/24 |
| kleines iPhone quer | 667x375 | quer | 378x213 | 111 | 55 | 61x30 | 27 | 144 | unter dem Bild | 24/24 |
| kleines iPhone quer + Safe-Area | 667x375 | quer | 335x188 | 96 | 46 | 51x26 | 23 | 166 | unter dem Bild | 62/62 |
| kleines Android quer | 640x360 | quer | 363x204 | 105 | 52 | 58x29 | 26 | 139 | unter dem Bild | 24/24 |
| Tablet hoch | 820x1180 | hoch | 820x461 | 146 | 72 | 80x40 | 36 | – | unten | 24/24 |
| Tablet quer | 1180x820 | quer | 850x478 | 131 | 65 | 72x36 | 32 | 165 | unter dem Bild | 24/24 |

In allen Fällen geprüft: nichts überlappt, alles im sichtbaren Bereich (ohne Safe-Area-Streifen), Treffer ≥ 44 x 44
(kleine Knöpfe sind sichtbar kleiner, ihre Trefferfläche nicht), Rand ≥ 24, Bild exakt 16:9, Hochformat volle Breite,
Querformat so gross wie die Regeln erlauben, Lage auf der Seite = Rechnung.

## Tests

`node tools/m9a-test.mjs --alt <ordner 0.8h> [--nur a,b,…] [--lang]` (0.8h: `git worktree add <ordner> b796508`).

Voller Lauf `--alt <0.8h> --lang` (einmal, ca. 4 h): **158 Prüfungen bestanden, 7 rot** – Erklärung unter der Tabelle.

| Teil | Was | Ergebnis |
|---|---|---|
| (a) | jede Knopf-Aktion: A/B/L/↑/↓ gehalten, ←/→ lenken, A + ↑ = Gas (nicht doppelt), SELECT = HUD, NOTES = Pace-Notes, R vor dem Start sofort und im Rennen mit Wartezeit, START = Pause und weiter, R auf dem Zielbildschirm = NEU STARTEN | bestanden (15) |
| (b) | D-Pad: 8 Richtungen und Grenzwinkel, Totzone, Gleiten ← ↖ ↑, Gleiten D-Pad → B → A; Lenkverlauf D-Pad ← **Bild für Bild gleich** wie Pfeiltaste ← (Lenkempfindlichkeit 0, 2, 4) | bestanden (7) |
| (c) | Mehrfinger: ← + A (Lenkung −0.5 und mehr, Gas 1), dazu L, einzeln loslassen, drei Finger (↗, B, L) | bestanden (6) |
| (d) | Titel: Aufsetzen nichts, Loslassen = Menü; D-Pad kurz = genau 1 Schritt, 1 s gehalten = Wiederholung; Regler LAUTSTÄRKE gehalten; A öffnet, B zurück; Garage markieren (D-Pad) und wählen (A), Hinweis „A ODER ANTIPPEN“; Bestzeiten-Seite Auto wechseln; ETAPPE direkt angetippt; Pause: START und B = weiter | bestanden (9) |
| (e) | keine Doppelauslösung: Titel 1 Wechsel, Antippen 1 Seite, A 1 Seite, 0 Mausereignisse; nachgemachter Klick direkt nach Berührung verworfen, 1.1 s später zählt die Maus | bestanden (4) |
| (f) | nichts hängt: touchcancel, Drehen im Rennen (keine Pause), gelöster Finger zählt erst nach neuem Aufsetzen, Fokusverlust, Pause mit gehaltenem A, Tab versteckt | bestanden (7) |
| (g) | im Rennen 4 Mal aufs Bild getippt und gezogen: keine Eingabe, Menü nie gefragt | bestanden (1) |
| (h) | Tastatur und Gamepad: menue-test (bis auf den bekannten Credits-Fehler), rennablauf-test, m8h-test (k) (Gamepad simuliert), lenk-test | bestanden (4) |
| (i) | Erkennung (Handy AUTO an, AUS aus, Desktop AUTO aus, AN an, Unsinn = AUTO, erste Berührung schaltet ein, Umschalten sofort); Layout in 11 Grössen + 5 mit Safe-Area | bestanden (23) |
| (j) | 25 neue Texte de/en, alle Zeichen in der Pixelschrift, längster 257 Pixel | bestanden (2) |
| (k) | Hilfezeilen Touch de/en berühren nichts im HUD; Steuerungs-Seite Touch/Desktop × de/en: rollt ganz, jede Zeile sichtbar, SYMBOLE und ZURÜCK wählbar; Hinweise Garage/Pace-Notes | bestanden (7) |
| (l) | Desktop ohne Touch gegen 0.8h: Lage der Bühne in 7 Grössen, 10 Menüseiten pixelgleich (Titel und Credits bis auf die Versionszeile 0.8H → 0.9A), HUD vor dem Start pixelgleich, ganzes Bild (3D + HUD) gleich | im vollen Lauf 1 rot (Messung zu früh), danach allein grün (13/13). Unter Last (paralleler Test) wich einmal das Bildschirmfoto von **0.8h selbst** ab: der Vergleich des ganzen Bilds ist lastempfindlich, allein immer gleich |
| (m) | Manifest (JSON, relative Pfade), Icons 192/512/maskable/180 aus den PNG-Köpfen, 7 Meta-Zeilen, kein Service Worker | bestanden (9) |
| (n) | Laden mit Manifest Desktop und Handy ohne Konsolenfehler, VOLLBILD ohne Vollbild-API (iPhone nachgestellt, Browser und Web-App), Ladezeit 1517 → 1500 ms (−17) | bestanden (5) |
| (u) | **Unveränderlich:** 19 Dateien (Ton, Physik, Autos, Strecke, Tacho, Bestzeiten …) unverändert, config.js nur ergänzt; über m8g-test: Tacho klassisch und im Spiel pixelgleich, Fahrmessung aller Profile bit-genau, Aussehen der Autos gleich, Testfahrer Prototyp **2:59.33 / 2:42.35 / 2:31.92** und alle fünf Autos gleich wie 0.8h, Ton aller Profile gleich (Rechenrauschen), Abkürzungen **127 / 2 / 342 / 84**, Strecke **3667.587 m**, Bildzeit 792 → 809 ms (+2.2 %, 9 Draw Calls je Auto), Ladezeit +9 ms; Regression aller bisherigen Tests | 47 bestanden, 6 rot (siehe unten) |

**Rot im vollen Lauf (7 Zeilen):**
- **(l) Lage der Bühne** bei 500x1000 und 1366x768: die Messung las die Lage, bevor der langsame Test-Browser das
  `resize`-Ereignis verarbeitet hatte (allein lief sie vorher zweimal grün). Messung wartet jetzt auf `resize`; danach grün.
- **menue-test, m8c, m8d, m8e:** der bekannte Credits-Fehler (kennt nur SHAI-RON) – **bekannt seit 0.8e**.
- **m8b / m8d (j):** eine Kurve (Audan bei 1028 m) ausserhalb des Zielbereichs – **bekannt seit 0.8g**.
- **m8d:** Garagen-Speicher „Geometrien 112 → 113“: einzeln nachgeprüft – im **unveränderten 0.8h** genauso rot, im
  neuen Stand einzeln grün: ein Wackler, nicht aus M9a.
- **overlay-test – ein echter Fehler aus M9a:** er las `seiten.steuerung.eintraege` als Liste, ich hatte daraus eine
  Funktion gemacht. Behoben (Getter, liefert wieder eine Liste). Danach meldete er „genau eine Zeile mit HUD auf der
  Steuerungs-Seite“ als rot, weil der Abschnitt TOUCH absichtlich eine zweite hat (SELECT | HUD AUS/AN): diese alte
  Prüfung habe ich angepasst (ohne die SELECT-Zeile). Danach einzeln **grün (121 OK)**. Die lange Regression habe ich
  nicht noch einmal laufen lassen (laut Auftrag nur einmal).

**Bildzeit:** Die Knöpfe zeichnen nichts im Bildtakt (nur bei Ereignissen und Layout-Änderungen); am Desktop ohne Touch
werden sie gar nicht gebaut. Bildzeit am Desktop 792 → 809 ms Summe der fünf Autos (+2.2 %, im Rauschen des Test-Browsers,
Grenze +20 %).

## Was ein Ziel nicht erreicht hat / Abweichungen

- **Delta-Screenshot „IMG_6160.png“** liegt nicht im Repo und nicht in meiner Umgebung – ich konnte nur gegen deine
  Beschreibung vergleichen, nicht gegen das Bild.
- **Querformat mit Safe-Area:** Mit den geschätzten 62 Pixeln Rand links/rechts wird die Zone breiter und das Bild
  kleiner (491 x 276 statt 544 x 306), die Knöpfe werden etwas kleiner (D-Pad 120). Auf dem kleinen iPhone quer mit
  Safe-Area landet das D-Pad bei der Untergrenze 96 und A/B bei 46 (knapp über 44). Ob die echten Ränder so gross sind,
  weiss ich nicht.
- **Querformat ist kleiner als im Auftrag:** D-Pad 131 statt 140–150 (Faktor 0.9, für ein grösseres Bild). Wenn dir
  das zu klein ist: `CONFIG.touch.quer.faktor` auf 1.
- **Tests vs. langsamer Test-Browser:** Im Menü schafft die Software-Grafik teils nur 3 Bilder/s und blockiert die
  Seite gelegentlich ca. 1 s; dann kommt das Loslassen eines Fingers verspätet an. Die Menü-Tests blenden darum die
  3D-Szene aus und werten einen kurzen Tipp nur, wenn das Loslassen rechtzeitig ankam (höchstens 4 Versuche). Auf
  einem echten Handy mit 60 Bildern/s sollte das nicht auftreten – geprüft habe ich es nicht.
- **HUD im Hochformat klein:** Das Bild ist nur ca. 1.26 x so gross wie das 320x180-Raster (402 breit); Zeit und Tachos
  sind klein. Nicht Teil des Auftrags (Idee unten).
- Der Commit von Teil A enthält schon einen Teil des Codes von B und C (die Steuerung ist ein Baustein, `js/touch.js`);
  B und C haben danach die Tests und Korrekturen.

## Ehrlich beurteilt – wo ich am unsichersten bin

1. **Safari und Firefox auf dem iPhone** habe ich nie gesehen. Pointer Events, `touch-action`, `preventDefault` auf
   `touchstart/touchend`, `gesturestart` und `viewport-fit=cover` sollten dort gehen, getestet ist nur Chromium.
2. **Ton:** ob das erste Antippen des Titels auf dem iPhone den Ton freischaltet (Entsperren im `touchend`), und wie der
   **Stumm-Schalter** wirkt (Web-Audio ist bei eingeschaltetem Stumm-Schalter auf iOS oft stumm). Ich habe daran nichts
   gedreht (Ton unverändert).
3. **Fingergefühl:** Grösse, Abstand, Totzone (20 %) und Schrägen (40°) des D-Pads sind geschätzt. Ob man mit dem
   Daumen sauber zwischen ← und ↖ trifft, merkt man nur in der Hand.
4. **Rand-Wischen:** Safari-„Zurück“ vom linken Rand – 24 Pixel Abstand plus `touch-action: none` sollten reichen, sicher
   bin ich nicht.
5. **Adressleiste:** Safari zeigt im Querformat Leisten; das Spiel richtet sich nach `innerHeight` und `visualViewport`.
   Ob Safari die Leisten auf- und zuklappt, während du spielst, weiss ich nicht (Scrollen ist gesperrt).
6. **Notch / Safe-Area:** Werte nur geschätzt (Chromium meldet immer 0).
7. **Auto-Lock:** Der Bildschirm kann sich beim Spielen mit Touch nicht von selbst ausschalten, solange du tippst; bei
   langen Pausen schon (kein Wake Lock, siehe Ideen).
8. **Touchscreen-Laptop:** Hat dein Lenovo einen Touchscreen, erscheinen mit AUTO die Knöpfe auch dort. Dann
   TOUCH-STEUERUNG auf AUS.

## Bilder (`screenshots/m9a/`, `node tools/m9a-bilder.mjs`)

- `hoch-titel.png`, `hoch-menue.png`, `hoch-rennen.png` – 402 x 874 (iPhone 16 Pro hoch)
- `quer-rennen.png` – 874 x 402, `quer-safari.png` – 874 x 330 (mit Safari-Leisten)
- `android-hoch.png` – 360 x 640
- `garage.png` – Garage, D-Pad ↓ gedrückt (markiert das nächste Auto)
- `einstellung.png` – EINSTELLUNGEN mit TOUCH-STEUERUNG gewählt, `steuerung.png` – Seite STEUERUNG mit TOUCH oben
- `gedrueckt.png` – Steuerfläche mit ↖, A und L gleichzeitig gedrückt

**Vergleich mit dem Delta-Screenshot (nach deiner Beschreibung, das Bild selbst hatte ich nicht):** Ähnlich: Bild oben
in voller Breite mit schwarzem Raum darüber und darunter, Steuerfläche unten, D-Pad links, A oben rechts und B tiefer
links davon, L/R oben in den Ecken, drei kleine runde Knöpfe unten. Anders: Pixel-Look des Spiels statt Delta-Look,
dunkle Steuerfläche statt Skin-Grafik, die drei kleinen Knöpfe heissen SELECT / START / NOTES und sitzen nebeneinander in
der Mitte, Bild 16:9 statt GBA 3:2.

## Test-Anleitung für Lino (Klickpfad, „Wenn X, dann Y“)

1. **iPhone, Safari und Firefox:** Seite öffnen (Neuladen: Tab schliessen und neu öffnen bzw. lange auf Neuladen
   drücken, kein Strg+F5). Siehst du unten die Knöpfe und das Bild in voller Breite?
   - Wenn keine Knöpfe: EINSTELLUNGEN → TOUCH-STEUERUNG auf AN, dann melden (Erkennung hat versagt).
   - Wenn das Bild seitlich abgeschnitten oder unter der Notch ist: Screenshot schicken.
2. **Titel antippen:** Kommt das Menü und der Ton?
   - Wenn kein Ton: Stumm-Schalter an der Seite des iPhones prüfen, Lautstärke hoch, noch einmal antippen; dann melden,
     ob es mit Stumm-Schalter aus/an geht.
3. **Menü nur mit D-Pad und A/B:** wählen, A = OK, B = zurück. EINSTELLUNGEN → LAUTSTÄRKE: D-Pad → **halten**, der Regler
   läuft weiter. Auch direkt **antippen** probieren.
   - Wenn ein Tipp zwei Schritte macht oder ein Regler nicht weiterläuft: melden.
4. **Rennen starten:** gleichzeitig lenken (D-Pad, linker Daumen) und Gas (A, rechter Daumen); L = Handbremse,
   R = zurück auf die Strasse, START = Pause, SELECT = HUD, NOTES = Pace-Notes. Fühlt sich das Lenken an wie mit den
   Pfeiltasten? Triffst du ↖ / ↗ (lenken und Gas mit einem Daumen)?
   - Wenn ein Knopf „hängen bleibt“ (Auto gibt weiter Gas): melden, was du vorher gemacht hast.
5. **Handy drehen (Querformat):** Knöpfe links und rechts, Bild in der Mitte, nichts verdeckt? Drehen mitten im Rennen:
   keine Pause, kein hängender Knopf?
   - Wenn Knöpfe zu klein: melden (dann `quer.faktor` auf 1).
6. **Vom linken Rand wischen:** Kommt Safari-„Zurück“?
   - Wenn ja: melden, dann vergrössere ich den Abstand (`CONFIG.touch.rand`).
7. **Zum Home-Bildschirm:** Safari → Teilen → „Zum Home-Bildschirm“. Vom Symbol starten: Vollbild ohne Leisten?
   Hochformat und Querformat noch einmal. (Ob Firefox auf dem iPhone das auch anbietet, bitte ausprobieren – ich weiss
   es nicht.) VOLLBILD in den Einstellungen zeigt dort „WEB-APP“.
8. **EINSTELLUNGEN → TOUCH-STEUERUNG** auf AUS (Knöpfe weg, Bild wie am Computer) und wieder auf AN / AUTO.
9. **Freunde-Test** (Xiaomi, Pixel mit Chrome, andere iPhones): Knopfgrössen, Layout, Gefühl; **Handymodell und Browser
   dazuschreiben**. Auf Android-Chrome geht VOLLBILD in den Einstellungen (echtes Vollbild).
