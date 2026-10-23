# M9a – Arbeitsstand (Faden für neue Sitzungen)

Ziel: Touch-Steuerung fürs Handy (Hoch- und Querformat), D-Pad/A/B/L/R/START/SELECT/NOTES im Pixel-Look, Menü mit
D-Pad und Antippen, Web-App-Modus. Fahren, Ton, Physik, Autos, Tachos, Bestzeiten unverändert. Desktop ohne Touch wie 0.8h.
Branch `claude/busy-turing-9e4fou`, ein Commit je Teil. Vergleichsstand 0.8h: `git worktree add /tmp/alt08h b796508`.

- [x] A Erkennung (`js/touch.js`: AUTO/AN/AUS, grober Zeiger, maxTouchPoints, erste Berührung), Layout (`js/touchlayout.js`,
      reine Rechnung), Knopfbilder (`js/touchbild.js`), CSS nur unter `html.touch`, Viewport `viewport-fit=cover`,
      Einstellung TOUCH-STEUERUNG, VOLLBILD ohne API = Hinweis HOME-BILDSCHIRM. Werte in `CONFIG.touch`.
- [x] B Eingabe: Pointer je Finger mit eigener Trefferrechnung (Gleiten), D-Pad 8 Richtungen + Totzone, Aktionen über
      `touchEingabe` (input.js, gleicher Lenk-Aufbau wie die Pfeiltasten), Menü-Wiederholung nach der Uhr (nicht Spielzeit),
      Titel beim touchend, alle Finger lösen bei Abbruch/Blur/Drehen/Zustands- und Seitenwechsel. Tests (a)-(h) grün.
      Test-Browser: im Menü teils nur 3 Bilder/s, Loslassen kommt bis 1.1 s zu spät -> Tests blenden die 3D-Szene aus
      und werten kurze Tipps nur bei rechtzeitigem Loslassen (bis 4 Versuche).
- [x] C (Code schon im Commit von A) Hilfezeilen Touch, Steuerungs-Seite mit TOUCH (Menü-Flag `rollenWahl`: rollen und
      wählen gemischt), Hinweise Garage/Pace-Notes, Beschriftung aus texte.js. Tests (i)-(l) grün, Desktop pixelgleich.
- [ ] D Manifest, Icons, Meta-Zeilen, Tests (m) (n)
- [ ] E Bericht, Bilder, Version 0.9a, volle Regression einmal

Werte (Richtwerte, config.js): Rand 24, D-Pad 146, A/B 72, L/R 80x40, klein 36, Treffer ≥ 44, Querformat Faktor 0.9,
Seitenzone ≥ 130 und ≤ 22 % der Breite; kleine Knöpfe im Querformat unter dem Bild, wenn das Bild dadurch nicht kleiner wird.
Offen: Safe-Area nur geschätzt (Chromium kennt keine Notch); Delta-Screenshot IMG_6160.png liegt nicht im Repo.
