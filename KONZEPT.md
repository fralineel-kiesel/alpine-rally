# Alpine Rally – Konzept

Retro-Rallyspiel im Browser, echtes 3D im Pixel-Look (N64/PS1), gefahren auf Schweizer Alpenstrassen. Arbeitstitel "Alpine Rally" (Name kann sich noch ändern).

## Entscheidungen
- Look: Renderauflösung 320x180, Low-Poly, flat shading, harte Pixel. Bäume, Steine, Kühe als 2D-Sprites (Billboards) im 3D-Raum, spart Leistung und passt zum Retro-Look. Kühe haben 8 Ansichten je nach Blickwinkel (seit M2b), damit sie nicht wie Pappe wirken. Leitplanken, Zäune und Schilder sind kleine Low-Poly-Formen mit Pixel-Textur (seit M2a: sie müssen zur Strasse schauen, nicht zur Kamera).
- Palette: erdig und rau (Schotterbraun, Steingrau, Tannengrün), aber sattes grünes Gras und blauer Himmel. Sonniger Tag zum Start, anderes Wetter später.
- Kamera: nur hinter dem Auto (Vorbild V-Rally 3, GBA: dichte Landschaft).
- Spielziel: Etappe von A nach B gegen die Uhr, mit Checkpoints. Beifahrer-Ansagen (Pace-Notes) kommen als Symbole oben im Bild. Gegner und Geister später.
- Fahrphysik: Arcade mit Gewicht (schweres 80er-Rallyauto) und Handbremse für Kehren. Handbremse: kurz ziehen = Heck kommt, Tempo bleibt; lange halten = Auto wird langsamer und steht (seit M3a.2). Ohne Rutschen fährt das Auto nach dem Lenken schnell wieder geradeaus (seit M3a.2).
- Fahrphysik mit Automatik-Getriebe (5 Gänge) und kurzer Schaltpause wie bei einem Handschalter (seit M1.2). Manuelles Schalten evtl. später als eigener Meilenstein.
- Steuerung: Tastatur und Gamepad (seit M5a Tasten frei belegbar, Esc / Start = Pause). Menüs auch mit Maus. Handy (Touch) evtl. später, das Menü ist dafür vorbereitet.
- Menüs (seit M5a): im selben Pixel-Look wie das HUD (dunkelblaue Tafeln, heller Rand, Auswahl orange mit Pfeil), dahinter fährt das Auto als Demo. Deutsch (Schweizer Schreibweise) und Englisch.
- Autos: aus einfachen Formen gebaut, Fantasienamen. Erstes Auto: Ringwerk RT4 (Quattro-Typ). Auto-Look und Feinschliff später.
- Version 1 = eine Etappe fahrbar mit Zeitmessung.

## Was Lino mag / nicht mag
- Start und Ziel (seit M3c): Die Strasse hört nie sichtbar auf. Hinter dem Start und hinter dem Ziel läuft sie weiter (Nebenast wie die Stummel, die Rennlogik kennt ihn nicht), ist abgesperrt (Start: Strohballen, Ziel nach ca. 200 m Ausrollstrecke: Reifen) und verschwindet hinter Kurve und Kuppe. Start und Ziel sind die belebtesten Stellen: Bogen mit Banner (START / ZIEL mit Schachbrett), Absperrband und Strohballen, ca. 100 Zuschauer (Pixel-Figuren, winken, Fahnen), Zeitnahme, Servicezelt, parkierte Autos, erfundene Sponsoren.
- Leben an der Strecke (seit M3d): Nicht nur Start und Ziel sind belebt. Fans an drei Stellen (Kehre 3, Passhöhe, Almweg-Abzweig) hinter Absperrband mit Bannern erfundener Fanclubs, Klappstühlen, Wohnmobil; der Wiesenweg ist eine Alpweide (Zaun, Kühe, Alphütte, Heustadel, Brunnen, Wegweiser, Heurollen); zwei Unfallautos (Fantasie-Rallyeautos im Stil der 80er-Gruppe B, keine echten Modelle, kein Mensch im Auto, kein Blut) mit Warndreieck, gelber Flagge und Streckenposten. Belebt, aber nicht überladen. Kühe und Bäume bleiben bei Änderungen an ihrem Platz (feste Zufallsfolgen).
- Mag: Rallye-typische Abzweige statt Belagwechsel mitten auf der Strasse (Strasse fängt nie aus dem Nichts an, Absperrung direkt an der Kreuzung als gebogene Leitwand, die auf den Nebenweg leitet; seit M3a.1), erdiges Bankett statt Randsteinen, Temposchilder (seit M2a.1 als runde Tafeln 80/60/50, nur Optik), Leitplanke und Holzzaun als durchgehendes Band, Kollision mit Tempoverlust, Felswand als feste Fläche (Auto stoppt an der sichtbaren Oberfläche, am Wandfuss Erde und Geröll statt Gras; seit M3a.3), Fahrgefühl wie ein schweres 80er-Rallyauto.
- Aufprall: frontal hart zum Halt, danach rückwärts rausfahren (kein Wegschleudern, kein Weiterrutschen).
- Pace-Notes (seit M4.1): nur Symbole, fast kein Text, keine Distanz ("in keinem Rally-Spiel gibt es eine Distanzanzeige, es macht es zu einfach"), kein Ton. Kleine Kacheln ganz oben in der Mitte, höchstens 2, erst ca. 4 s vorher. Stufen 1–6 wie in echten Rallyes (1 = Haarnadel, 6 = Vollgas) als Zahl, dazu höchstens ein kleines Zusatzzeichen und grün/rot für schneiden/nicht schneiden. Zeit oben links. Felswand, Senke, Gerade werden nicht angezeigt (knapper). Sprachausgabe höchstens später als Idee.
- Taste R (zurück auf die Strasse) ist kein Abkürzungs-Trick: im Rennen erst nach ca. 4 s Wartezeit, Auto gesperrt, Zeit läuft (seit M4.1).
- Kurven schneiden gehört dazu: Nur ca. 40 % der Kurven sind mit Steinen, Bäumen oder umgefallenen Stämmen im Kurveninnern gesperrt (Pace-Note "nicht schneiden"), die anderen sind frei (Pace-Note "schneiden"). Gras bremst stark, darum lohnt übertriebenes Schneiden nicht.
- Sperren sollen natürlich aussehen: pro Kurve nur eine Sorte (nur ein paar Felsen, nur Stämme oder nur Tannen), locker statt Mauer, nichts steckt ineinander (seit M2a.1).
- Schalten soll man spüren: kurze Pause ohne Antrieb bei jedem Gangwechsel.
- Analoge Tachos (Drehzahl mit Gangzahl, Tempo mit kleiner Digitalanzeige) im 80er-Look.
- Mag nicht: Formel-1-Randsteine, Kurvenpfeil-Schilder (Ausnahme seit M3a.1: Chevrons und Richtungstafel an den Absperrungen der Nebenwege), Alleen (gleichmässige Baumreihen), zu starkes Beschleunigen bergab, hartes Höchsttempo.
- Später gewünscht: sichtbare Auto-Seite beim Lenken, Wetter und Tageszeit. (Schotter- und Wiesenabschnitte im Wechsel und Abzweigungen mit Rally-Absperrung gibt es seit M3a/M3b.)

## Fahrplan
- M0 Prototyp (fertig)
- M1 Erste Etappe: Strassen-Fix, Kollisionen, 3-4 km Strecke, Checkpoints (fertig)
- M1.1 Harter Aufprall, Abkürzungssperren (Felsbrocken, Baumgruppen, umgefallene Stämme) (fertig)
- M1.2 Sperren nur noch in ca. 40 % der Kurven, engere Lenkung im Schritttempo, Getriebe mit Schaltpause, analoge Tachos, kleinere Zeitanzeige (fertig)
- M1.3 Horizont-Dunst: kein hellblauer Nebelstreifen mehr zwischen Bergen und Wald, Dunst nie ganz dicht, Bergfüsse passen zum fernen Gelände (fertig)
- M2a Strassenrand: Leitplanken an Abhängen und in den Kehren, Holzzäune an den Wiesen mit Weidetoren, Schilder (Kurvenwarnungen, Kehren-Nummern, Richtungstafeln, Steinschlag/Gefälle, Kilometertafeln) (fertig)
- M2a.1 Sperren natürlicher: pro gesperrter Kurve nur eine Sorte (Felsbrocken, umgefallene Stämme oder Tannen), lockerer, nichts steckt ineinander; mehr Schilder: Tempo-Tafeln 80/60/50 (nur Optik), "Kühe" und "Kreuzung" im Tal, alle Schilder etwas grösser (fertig)
- M2b Leben im Gelände: Kühe in Herden auf Weiden und Alpwiesen (8 Ansichten je Kuh), Büsche, Alpenrosen, Heidelbeeren, Grasbüschel, Jungtannen, Wald auch in der Ferne (Geländefarbe und grosse Fernbäume) (fertig)
- M2c Raus aus dem Gras: Rückwärtsgang je Untergrund (auf Gras und Bankett kräftiger, auch bergauf raus), kein Hängenbleiben mehr an der Bankett-Kante (fertig)
- M3a Erster Nebenweg: Abzweig von der Hauptstrasse auf Schotter (800–1020 m), Stummel der Hauptstrasse mit Absperrung (Flatterband, Reifen; Heu und Holzbock vorbereitet), Ende nie sichtbar, Schotter-Fahrgefühl und Staub (fertig)
- M3a.1 Nebenweg-Korrektur: Kreuzungen sauber (kein Schotter auf dem Asphalt, saubere Ausfransung), keine Stufe an der Einmündung, Staub an beiden Hinterrädern, Absperrungen als grosse gebogene Leitwand direkt an der Kreuzung mit Verbots-Symbol, Chevrons und Richtungstafel 70 m vorher, Waldrand am Nebenweg locker in Gruppen (185 statt 505 Tannen) (fertig)
- M3a.2 Fahrphysik-Feinschliff: Handbremse lange gehalten bremst das Auto bis zum Stand (kein endloses Kreisen mehr, kurz ziehen kostet kaum Tempo), Dreher rutschen weich aus statt schlagartig zu stoppen, nach dem Lenken bei hohem Tempo schnell wieder geradeaus (Geradeauslauf-Hilfe, nicht beim Einlenken und nicht im Drift) (fertig)
- M3a.3 Felswand: Das Auto stoppt an der sichtbaren Wandfläche (geprüft mit dem ganzen Umriss des Autos, nicht nur der Mitte; vorher steckte es bis 1.6 m in der Wand), Kamera hält Abstand zur Wand, am Wandfuss Erde/Geröll statt Gras (fertig)
- M3c Start- und Zielbereich: Strasse läuft an Start und Ziel weiter (abgesperrt, Ende nie sichtbar), Ausrollstrecke nach dem Ziel, Start- und Zielbogen, Absperrband, Strohballen, Zuschauer, Zeitnahme, Servicezelt, Autos, mehr Bäume (fertig)
- M3b Weitere Nebenwege: Almweg (Schotter, nach den Kehren, 1986–2401 m, lange Gerade über die Alp) und Wiesenweg (neuer Belag: Feldweg mit Fahrspuren und Gras, auf der Abfahrt, 2798–3108 m, mit Checkpoint 3), driftfreudig aber gutmütig; Absperr-Arten wechseln reihum (jetzt auch Heu und Holzböcke im Spiel), Strohballen kleiner (1.64 m) (fertig)
- M3d Leben an der Strecke: Wiesenweg als Alpweide (Holzzaun mit Weidetor, neue Kühe, Alphütte, Heustadel, Brunnen, Steinmännchen, Wegweiser, Heurollen, Findlinge), drei Fan-Spots, zwei Unfallautos mit Rauch, Warndreieck und Streckenposten; Kühe eingefroren wie die Bäume (fertig)
- M4 Pace-Notes oben im Bild unter der Zeit: Symbol + kurzer Text + Distanz, höchstens 3 Zeilen. Kurven mit Stufe 1–6 (an der echten Fahrphysik gemessen) und Zusatz (eng, weit, lang, öffnet, zieht zu), Kehren mit Nummer (1/4 …), Schikane, Gerade mit Länge, Kuppe, Senke, Abzweig/Einmündung mit Belag (Schotter, Wiesenweg), Felswand, Ziel, "schneiden"/"nicht schneiden" als grünes/rotes Zeichen. Alles automatisch aus der Strecke, Taste N aus/ein (fertig)
- M4.1 Pace-Notes kleiner und knapper: Zeit nach oben links, Ansagen als kleine Symbol-Kacheln ganz oben mittig (Symbol + Stufen-Zahl + höchstens ein Zusatzzeichen, schneiden grün / nicht schneiden rot, eigene Symbole für Kehre, Kuppe, Abzweig/Einmündung, Ziel, Schikane), keine Wörter und keine Meter mehr, höchstens 2 Kacheln, ca. 4 s vorher (50–160 m, bei Kehren/Abzweigen bis 25 % mehr); R mit 4 s Wartezeit (fertig)
- M5a Menüs: Titelbildschirm („TASTE DRÜCKEN“), Hauptmenü (Starten, Auto, Etappe, Bestzeiten, Einstellungen, Steuerung mit Symbol-Legende, Credits) mit Demo-Fahrt dahinter (Testfahrer, 4 weiche Kameras), Pause (Esc / Start, auch automatisch beim Tab-Wechsel; alles eingefroren), Einstellungen (Vollbild, Pixelgrösse 320x180/480x270/640x360, Pace-Notes, km/h/mph, FPS, Tasten belegen, Lenkempfindlichkeit, Gamepad-Totzone, Lautstärke, Sprache) im Browser gespeichert, Deutsch/Englisch (alle Texte in js/texte.js), Zustandsmaschine für M5b (fertig)
- M5b (als Nächstes) Rennen drumherum: Countdown vor dem Start, Zielbildschirm, Bestzeiten (Top 10), Statistik
- Danach: Minimap, Feinschliff (Auto, Fahrphysik), Ton (M7)

