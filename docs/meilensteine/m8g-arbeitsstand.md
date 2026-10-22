# M8g – Arbeitsstand (Faden für neue Sitzungen)

Ziel: Tacho je Auto (Skala, Look, Gang-Anzeige, Schaltlicht, Ladedruck), Garage-Vorschau, Einstellung TACHO (auto/klassisch).
Branch `claude/zen-planck-g7q7wd`, ein Commit je Teil. Bericht später: `docs/meilensteine/m8g.md`.
Vergleichsstand 0.8f: `git worktree add <scratchpad>/alt-08f 3ed7aae` → `node tools/m8g-test.mjs --alt <ordner>`.

- [x] A Stil-Tabelle `hud.tachoStile` (klassisch = Form-Werte, Farben aus hud.tacho; fünf Auto-Stile noch leer = klassisch),
      Profil-Block `tacho: { stil, …, klassisch: {…} }` (Subora 9/8 in beiden), `tacho.js`: tachoStil(), tachoFuer(),
      Vorrat je (Stil, Skala, Einheit) für alle Tachos, setzeModus(); Einstellung `tacho` (Standard auto), Menü TACHO
      neben EINHEITEN, Texte de/en. Prüfung (a): 60 direkt gemalte Fälle + 30 HUD-Ausschnitte pixelgleich zu 0.8f.
- [x] B Skalen nach Regel (Begrenzer 6850 -> 8000, rot 6500; Subora 9000/8000), Tempo 200 km/h / 130 mph; Stile delto
      (schwarz, blauer Ring, weisse Nadel mit roter Spitze), escorta (creme, schwarz, Digitalfenster), l073 (LED: Segmentband,
      Punkte, grün, gelbe Nadel), imprexa (blau, Innenring, gelb); audan = klassisch + Skala. Ziffern: zahlenLage() ohne
      Berührung; beim Tempo fällt die 200 weg (über der Digitalanzeige), Escorta (ohne Schatten) zeigt alle. Test (b) ok.
- [ ] C Gang-Anzeige, Schaltlicht, Ladedruck
- [ ] D Garage-Vorschau
- [ ] E Tests, Bilder, Bericht, Version 0.8g

Messwerte (Teil B, aus tools/fahrmessung.js): Höchsttempo km/h Audan 189.8, Delto 177.9, Escorta 172.4, Lanza 182.6,
Subora 185.6. Begrenzer (audio.motor.begrenzerAb) 6850, Subora 8200. Drehzahl bei Höchsttempo im 5. Gang: Delto 7502,
Escorta 7184 (über dem Begrenzer, das Getriebe begrenzt nicht; nur der Ton).

Offene Fragen: –
