# Alpine Rally – Stand

## Meilenstein 0: Fahrbarer 3D-Prototyp ✅

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

### Steuerung

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

### So testest du

1. Die GitHub-Pages-Adresse des Repos öffnen (nach dem Mergen auf `main`).
   *Hinweis:* Die Datei `index.html` direkt per Doppelklick öffnen geht **nicht** (der Browser
   blockiert dann die Programmteile). Es muss über GitHub Pages oder einen kleinen lokalen
   Webserver laufen.
2. Kurz warten („Strecke wird gebaut …“, ca. 1 Sekunde).
3. Gas geben, über die Startlinie fahren – die Zeit läuft.
4. Worauf achten:
   - Gefällt der Pixel-Look? Sind die Sprite-Bäume gut so oder stören sie?
   - Fühlt sich das Auto schwer genug an? Zu viel / zu wenig Rutschen?
   - Spitzkehren: Klappt es mit Handbremse + Lenken? Kommt das Heck zu stark/zu schwach?
   - Kamera: zu nah, zu fern, zu träge?
   - F3 drücken und die FPS auf beiden Rechnern anschauen (Ziel: 60).
5. Feedback am besten mit Screenshot und kurzer Beschreibung, wo auf der Strecke (F3 zeigt die Meter).

### Wo man schrauben kann

Alle Zahlen stehen in `js/config.js` mit kurzer Erklärung, z. B.:
- Tempo: `beschleunigung`, `hoechsttempo`
- Rutschen: `gripVorne`, `gripHinten`, `stabilitaet`, `handbremseGrip`
- Kamera: `abstand`, `hoehe`, `nachfuehren`
- Dunst: `nebel.start`, `nebel.ende`, `bergDunst`
- Farben: Abschnitt `farben`

Die Strecke selbst steht als Punkteliste in `js/track.js`.

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
