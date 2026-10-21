# M8f – Arbeitsstand (Faden für neue Sitzungen) – FERTIG

Ziel: Lanza 073 (Keil-Heck, fangbar, tiefer + lauter Lader), Subora (Blau-Gelb, höhere Drehzahl, Tacho-Skala), Kontext-Diät.
Branch `claude/stoic-davinci-osu37c`, ein Commit je Teil. Bericht: `docs/meilensteine/m8f.md`.

- [x] 0 STAND.md → docs/archiv/STAND-bis-m8e.md (566183 B, sha256 6118f43c…bb347 gleich), neue STAND.md, CLAUDE.md
- [x] A Lanza-Heck: Deckel 1.02→0.83 m (9.2°), Finnen, Kamm/Tal, Flügel 1.04 m; flache Strecke 1.11→0 m (tools/m8f-form.js)
- [x] B Lanza fangbar: stabilitaet 6.8, gewichtstransfer 0.75, gasImDrift 0.1; K1 1.16 s, K3 34° (vorher 104°)
- [x] C Lanza Ton 420 Hz bei 7000, Lader +7 dB / 2.2 kHz; Gänge [48,82,117,149,188], hoch 6600, eigenes Drehmoment
- [x] D Subora #1d46a8/#f5d020, ROT als 4. Lack; Schalten 7800, nenn 8000; Tacho-Skala je Profil (9/8)
- [x] E tools/m8f-test.mjs (a)–(f) bestanden, 3 KOMP; Regression einzeln (2-h-Limit); Version 0.8f

Nicht erreicht: Lanza vmax −2.93 % (Ziel −3), K2 1.13 s (0.8), K4 11.9 m (4), Gänge +10/+15 % statt +5–8 %, keine Goldfelgen,
Ladezeit +32…+82 ms (Grenze +30, Rauschen?). Schon in 0.8e kaputt: menue-test (Credits), Audan-Kurve 1028 m, m8c (d) Speicher.
Achtung: flotter Testfahrer prallt mit Lanza bei 2760 m bei kleinsten Gang-/Grip-Änderungen.
