# M10d – Arbeitsstand (höchstens 15 Zeilen)

Ziel: Schaltton-Fix, Wums lauter, Wand-Strafe härter, Alpen mit 3 Sprüngen, Schatten, Deko. Version 0.10d. Tests: `tools/m10d-test.mjs`.
Referenzen: 0.10c.2 = b14cecc, vor dem Schaltton-Fehler = 017fb8f (je `git worktree add`).

- **A erledigt:** Ursache `js/main.js` (M10c Teil C, 9c1c555): Kommentar „(M10c: frei drehend in der Luft)“ schluckte
  `tonZ.zielGang`/`tonZ.schaltet`. Sonst keine auskommentierten Code-Zeilen in den M10c-Diffs. Schaltton-Pegel = vor dem Fehler
  (Δ 0.00 dB, 5 Autos, hoch/runter, beide Strecken). Wächter: (a) Ereignisse = Gangwechsel (rt4 Alpen 56 = 56, kaputt 0),
  (b) `tools/kommentar-waechter.mjs` (2 begründete Ausnahmen in musikstueck.js), (c) Pegel > −24 dB.
- **Wums** (`sprung.ton.wumms.laenger`): Bass-Abfall ×2.2 (hart) / ×2.6 (sehr hart), Ducking −9 dB 0.3 s; Rauschen ×1.0
  (mehr Rauschen hob die Spitze über −1 dBFS). Im Mix: hart +6.7 → +8.8 dB, sehr hart +10.3 → +12.2 dB, sauber +2.0 gleich;
  Spitze ≤ −1.05 dBFS; Ducking gemessen −8.4 dB.
- Offen B: Strafe-Werte, Kurven-Vergleich mit Gas-Rampe. wand.js-Entwurf liegt im Scratchpad.
