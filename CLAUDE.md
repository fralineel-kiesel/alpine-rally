# Alpine Rally – Regeln für Claude Code

- Lies zuerst KONZEPT.md und STAND.md.
- Lino kann nicht programmieren. Er testet über GitHub Pages auf zwei Rechnern (Lenovo-Laptop und Gaming-PC) und gibt Feedback, oft mit Screenshots.
- Kein Build-Schritt, kein npm im ausgelieferten Spiel. Alles muss direkt über GitHub Pages laufen (index.html + ES-Module).
- Three.js als gepinnte Version, eingebunden per Import-Map, oder als lokale Datei unter lib/.
- Alle Werte, an denen man schrauben will (Tempo, Grip, Kamera, Nebel, Farben), gehören in js/config.js mit kurzem deutschem Kommentar.
- Kleine Meilensteine. Nur das bauen, was im Prompt steht. Ideen ausserhalb des Auftrags in STAND.md unter "Ideen/Vorschläge" notieren statt umsetzen.
- Nach jedem Meilenstein STAND.md aktualisieren (auf Deutsch, verständlich ohne Programmierkenntnisse): was gebaut wurde, wie man es testet, bekannte Probleme.
- Code-Kommentare auf Deutsch, kurz und verständlich.
- Keine echten Automarken, Logos oder Originaldesigns. Autos haben Fantasienamen.
- Keine externen Assets (Bilder, Modelle, Fonts) ohne Rückfrage. Grafiken werden aus Formen gebaut oder im Code als Pixel-Textur erzeugt.

