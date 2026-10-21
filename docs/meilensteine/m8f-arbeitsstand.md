# M8f – Arbeitsstand (Faden für neue Sitzungen)

Ziel: Lanza 073 (Keil-Heck, fangbar, tiefer + lauter Lader), Subora Imprexa (Blau-Gelb, höhere Drehzahl, Tacho-Skala), Kontext-Diät. Version 0.8f.
Branch `claude/stoic-davinci-osu37c`, ein Commit je Teil (0, A–E).

- [x] Teil 0 – STAND.md archiviert (566183 B, sha256 6118f43c…bb347, Byte-gleich), neue STAND.md 165 Z. / 13.7 KB, CLAUDE.md geschärft
- [x] Teil A – Lanza Heck als Keil: Deckel 1.03→0.83 m, Kamm-Kotflügel, Finnen Dach→Kotflügel, Flügel auf Stützen (OK 1.04).
  Profil: flach<3° vorher 1.11 m, nachher 0.00 m; Höhe±2 cm 0.59→0.19 m; Neigung -1.9..-0.9: 2.0°→14.4°. 9 Calls / 1376 Dreiecke. Messung: tools/m8f-form.js
- [x] Teil B – Lanza fangbar: stabilitaet 4.5→6.8, gewichtstransfer 0.8→0.75, gasImDrift 0.15→0.1, gripHinten 1.0 (1.05 → Testfahrer
  flott prallt bei 2794 m), heckJeBelag 1.34/1.4. Heck Bremse 10.0→6.06°, Fang 1.28→0.78 s, Vollgas R80 +2.52→+1.61°, HB +23 %.
  K1 23.8°/1.67 s → 17.5°/1.17 s; K2 1.14 s (Ziel 0.8 NICHT, Delto 1.10, Escorta 1.72); K3 104°→34° (kein Dreher); K4 17.5→11.9 m
  (Ziel 4 NICHT, Escorta 21.3, Prototyp 9.3). Testfahrer 177.84/161.06/152.68 (Delto 178.61/161.60/151.22), 0 Aufpralle.
  Kippschwelle glatt. Werte grip 6→7. Pace-Notes l073: 3 ausserhalb (M8e 4). testfahrer-browser.js unverändert ([3,9] bleibt).
- [x] Teil C – Lanza Klang: hoechstTon 580→440 (f0@7000 554→420 Hz, Audan 462), saege .5 puls .45 unter .25 bissHz 2300 filterGas 3800,
  Lader pegel .075→.17 faktor 9.5 gasAnteil .85 (2216 Hz, +7.1 dB, ohne Gas +1.1 dB, -4.2 dB gg. Motor), schaltKnallPegel 1.1 (Spitze).
  Gänge [48,82,117,149,188] (+4..+15 %), hochVollgas 6600, drehmoment ab 5800 fallend. Drehzahl gg. Audan max +4.7 %, Schaltpunkte
  darunter, vmax 182.6 (-2.93 %, Ziel -3 knapp VERFEHLT, Drehzahl vor Tempo), 6799/min (M8e 7700). Testfahrer 178.03/160.96/153.37,
  0 Aufpralle (4. Gang 150 → Aufprall 2760 m!). Luftwiderstand verworfen (ändert Rückwärts-Tempo).
- [x] Teil D – Subora: imprexaWerk Blau #1d46a8/#0f2150 mit Gelb #f5d020, alter Werk-Lack = imprexaRot (4. Lack), keine Felgen-Slot →
  keine Goldfelgen. Getriebe nenn 8000, gaenge [48,82,118,150,190], hoch 7800/5200, runter 3000, kickdown 4800/7400, zkf 1.03,
  allrad.gras 0.99, drehmoment bis 8800. vmax 185.7 (-1.3 %) bei 7820/min. Ton: hoechstDrehzahl 8300, begrenzerAb 8200, hoechstTon 540
  (f0@7000 434 wie M8e), schaltKnallPegel 1.1 (Spitze 1.21). Testfahrer 178.89/161.62/150.98 (P -0.25/-0.45/-0.62 %, A +0.13/-0.09/-0.16).
  Tacho: profil.tacho {9,8}, tacho.setzeSkala(id) in hud.js; andere Autos pixelgleich 0.8e (Ziffern 4/5 beim Subora eng).
- [ ] Teil E – tools/m8f-test.mjs, Bilder, Bericht docs/meilensteine/m8f.md, Version

Werte / offene Fragen: (noch keine)
