# Alpine Rally – Konzept

Retro-Rallyspiel im Browser, echtes 3D im Pixel-Look (N64/PS1), gefahren auf Schweizer Alpenstrassen. Arbeitstitel "Alpine Rally" (Name kann sich noch ändern).

## Entscheidungen
- Look: Renderauflösung 320x180, Low-Poly, flat shading, harte Pixel. Bäume, Steine, Kühe als 2D-Sprites (Billboards) im 3D-Raum, spart Leistung und passt zum Retro-Look. Leitplanken, Zäune und Schilder sind kleine Low-Poly-Formen mit Pixel-Textur (seit M2a: sie müssen zur Strasse schauen, nicht zur Kamera).
- Palette: erdig und rau (Schotterbraun, Steingrau, Tannengrün), aber sattes grünes Gras und blauer Himmel. Sonniger Tag zum Start, anderes Wetter später.
- Kamera: nur hinter dem Auto (Vorbild V-Rally 3, GBA: dichte Landschaft).
- Spielziel: Etappe von A nach B gegen die Uhr, mit Checkpoints. Beifahrer-Ansagen (Pace-Notes) kommen als Symbole oben im Bild. Gegner und Geister später.
- Fahrphysik: Arcade mit Gewicht (schweres 80er-Rallyauto) und Handbremse für Kehren.
- Fahrphysik mit Automatik-Getriebe (5 Gänge) und kurzer Schaltpause wie bei einem Handschalter (seit M1.2). Manuelles Schalten evtl. später als eigener Meilenstein.
- Steuerung: Tastatur und Gamepad. Handy evtl. später.
- Autos: aus einfachen Formen gebaut, Fantasienamen. Erstes Auto: Ringwerk RT4 (Quattro-Typ). Auto-Look und Feinschliff später.
- Version 1 = eine Etappe fahrbar mit Zeitmessung.

## Was Lino mag / nicht mag
- Mag: erdiges Bankett statt Randsteinen, Temposchilder (seit M2a.1 als runde Tafeln 80/60/50, nur Optik), Leitplanke und Holzzaun als durchgehendes Band, Kollision mit Tempoverlust, Fahrgefühl wie ein schweres 80er-Rallyauto.
- Aufprall: frontal hart zum Halt, danach rückwärts rausfahren (kein Wegschleudern, kein Weiterrutschen).
- Kurven schneiden gehört dazu: Nur ca. 40 % der Kurven sind mit Steinen, Bäumen oder umgefallenen Stämmen im Kurveninnern gesperrt (Pace-Note "nicht schneiden"), die anderen sind frei (Pace-Note "schneiden"). Gras bremst stark, darum lohnt übertriebenes Schneiden nicht.
- Sperren sollen natürlich aussehen: pro Kurve nur eine Sorte (nur ein paar Felsen, nur Stämme oder nur Tannen), locker statt Mauer, nichts steckt ineinander (seit M2a.1).
- Schalten soll man spüren: kurze Pause ohne Antrieb bei jedem Gangwechsel.
- Analoge Tachos (Drehzahl mit Gangzahl, Tempo mit kleiner Digitalanzeige) im 80er-Look.
- Mag nicht: Formel-1-Randsteine, Kurvenpfeil-Schilder, zu starkes Beschleunigen bergab, hartes Höchsttempo.
- Später gewünscht: Schotter- und Wiesenabschnitte im Wechsel, Abzweigung mit Rally-Absperrung, sichtbare Auto-Seite beim Lenken, Wetter und Tageszeit.

## Fahrplan
- M0 Prototyp (fertig)
- M1 Erste Etappe: Strassen-Fix, Kollisionen, 3-4 km Strecke, Checkpoints (fertig)
- M1.1 Harter Aufprall, Abkürzungssperren (Felsbrocken, Baumgruppen, umgefallene Stämme) (fertig)
- M1.2 Sperren nur noch in ca. 40 % der Kurven, engere Lenkung im Schritttempo, Getriebe mit Schaltpause, analoge Tachos, kleinere Zeitanzeige (fertig)
- M1.3 Horizont-Dunst: kein hellblauer Nebelstreifen mehr zwischen Bergen und Wald, Dunst nie ganz dicht, Bergfüsse passen zum fernen Gelände (fertig)
- M2a Strassenrand: Leitplanken an Abhängen und in den Kehren, Holzzäune an den Wiesen mit Weidetoren, Schilder (Kurvenwarnungen, Kehren-Nummern, Richtungstafeln, Steinschlag/Gefälle, Kilometertafeln) (fertig)
- M2a.1 Sperren natürlicher: pro gesperrter Kurve nur eine Sorte (Felsbrocken, umgefallene Stämme oder Tannen), lockerer, nichts steckt ineinander; mehr Schilder: Tempo-Tafeln 80/60/50 (nur Optik), "Kühe" und "Kreuzung" im Tal, alle Schilder etwas grösser (fertig)
- M2b Dichtere Landschaft: Kühe, mehr Wald, Wald auch ausserhalb der 230 m neben der Strasse (als Nächstes)
- M3 Untergründe: Schotter und Wiese, Abzweigung mit Absperrung
- M4 Pace-Notes als Symbole, inkl. "nicht schneiden" an den gesperrten und "schneiden" an den freien Kurven (Daten liegen seit M1.2 bereit)
- M5 Drumherum: Zielbildschirm, Minimap, Feinschliff (Auto, Fahrphysik)

