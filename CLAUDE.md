# Alpine Rally – Regeln für Claude Code

- Lies zuerst `CLAUDE.md`, `KONZEPT.md` und `STAND.md` (alle drei sind klein).
- Lino kann nicht programmieren. Er testet über GitHub Pages auf zwei Rechnern (Lenovo-Laptop und Gaming-PC) und gibt Feedback, oft mit Screenshots.
- Kein Build-Schritt, kein npm im ausgelieferten Spiel. Alles muss direkt über GitHub Pages laufen (index.html + ES-Module).
- Three.js als gepinnte Version, eingebunden per Import-Map, oder als lokale Datei unter lib/.
- Alle Werte, an denen man schrauben will (Tempo, Grip, Kamera, Nebel, Farben), gehören in js/config.js mit kurzem deutschem Kommentar.
- Kleine Meilensteine. Nur das bauen, was im Prompt steht. Ideen ausserhalb des Auftrags in STAND.md unter "Ideen/Vorschläge" notieren statt umsetzen.
- Nach jedem Meilenstein STAND.md aktualisieren (auf Deutsch, verständlich ohne Programmierkenntnisse): was gebaut wurde, wie man es testet, bekannte Probleme.
  Der ausführliche Bericht kommt nach `docs/meilensteine/<name>.md`, in STAND.md nur eine Zusammenfassung (höchstens 15 Zeilen) mit Verweis.
- Code-Kommentare auf Deutsch, kurz und verständlich.
- Keine echten Automarken, Logos oder Originaldesigns. Autos haben Fantasienamen. Fantasienamen: Anfangsbuchstaben von Marke und Modell wie beim echten Vorbild, sonst erfunden und nie ein echter Name (z. B. Audan Quarto für den Quattro-Typ, Id `rt4`).
- Keine externen Assets (Bilder, Modelle, Fonts) ohne Rückfrage. Grafiken werden aus Formen gebaut oder im Code als Pixel-Textur erzeugt.

## Kontext sparen

- Das Archiv `docs/archiv/` und die Berichte in `docs/meilensteine/` **nie ganz lesen**, nur gezielt: `docs/archiv/INDEX.md`, `grep -n`, `sed -n 'a,bp'`.
  Kommentare, die „STAND.md, Meilenstein 8x“ (bis M8e) nennen, meinen `docs/archiv/STAND-bis-m8e.md`.
- Grosse Quelldateien (`js/config.js`, `js/main.js`, `js/audio.js`, `js/autos.js`, grosse Tests) nur bereichsweise lesen: erst `grep -n`, dann `sed -n` oder Read mit offset/limit.
- Lange Test- und Messausgaben in Dateien umleiten (`> /tmp/x.log 2>&1`) und nur `tail` oder `grep` lesen.
- Bilder sparsam ansehen und vorher auf den nötigen Ausschnitt zuschneiden. Wo Zahlen reichen, Zahlen.
- Reine Suchfragen („wo wird X gesetzt?“) an einen Explore-Subagent geben.
- Während eines Meilensteins nach jedem Teil `docs/meilensteine/<name>-arbeitsstand.md` (10 bis 20 Zeilen) nachführen und mit committen.

## Compact instructions

Beim Zusammenfassen erhalten: Ziel des Meilensteins, erledigte Teile, Messwerte, offene Fragen, Pfad von `docs/meilensteine/<name>-arbeitsstand.md`.
