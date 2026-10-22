# M8g – Arbeitsstand (Faden für neue Sitzungen) – FERTIG

Ziel: Tacho je Auto (Skala, Look, Gang, Schaltlicht, Ladedruck), Garage-Vorschau, Einstellung TACHO (auto/klassisch).
Branch `claude/zen-planck-g7q7wd`, ein Commit je Teil. Bericht: `docs/meilensteine/m8g.md`.
Vergleichsstand 0.8f: `git worktree add <ordner> 3ed7aae` → `node tools/m8g-test.mjs --alt <ordner>`.

- [x] A `hud.tachoStile` (klassisch = Farben aus hud.tacho), Profil-Block `tacho` mit Unterblock `klassisch`, Vorrat je
      (Stil, Skala, Einheit), Einstellung TACHO; klassisch pixelgleich zu 0.8f (60 + 30 Fälle).
- [x] B Skalen nach Regel (bis 8000, rot 6500; Subora 9000/8000; 200 km/h, 130 mph), fünf Looks, Ziffern ohne Berührung
      (beim Tempo fällt die 200 weg, ausser Escorta).
- [x] C Gang je Stil (Lanza 7-Segment), Schaltlicht (95 % / Begrenzer − 250, 7 Hz), BOOST/LADER-Tafel über dem Drehzahlmesser.
- [x] D Garage: Drehzahlmesser rechts neben dem 3D-Auto (Layout „rechts“ gewählt), folgt dem Aufheulen.
- [x] E Tests, Bilder, Bericht, Version 0.8g. Voller Lauf `--alt --lang` (ca. 4 h): (a)–(h) ok; Regression nur bekannte
      Fehler (Credits, Audan 1028 m) und ein Wackler (ton-umgebung, einzeln ok); m8c (j) an die Garage angepasst.
      Review-Workflow: 2 leichte Befunde behoben (Tafel-Farben, Kommentare), danach a/d/f, m8c j, ton-umgebung einzeln ok.

Messwerte: Höchsttempo Audan 189.8, Delto 177.9, Escorta 172.4, Lanza 182.6, Subora 185.6 km/h; Begrenzer 6850 (Subora 8200).
Offen für M8g.1: Linos Rückmeldung zu Looks, Schaltlicht-Schwellen (blinkt fast immer vor dem Schalten), BOOST-Tafel.
Achtung: alte Tests schreiben Spektrogramme/JSON in screenshots/m7*–m8f und tools/ – danach `git checkout --` (nicht committen).
