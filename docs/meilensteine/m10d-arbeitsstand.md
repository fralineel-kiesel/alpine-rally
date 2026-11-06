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
- **B erledigt:** Dauer 3–6 s, Stapeln 9 s, Phase 1 0.03 für 1 s, 0.15 s glatt auf 0.10, smoothstep auf 1; Drehzahl 30 %
  für 1 s, 5 Aussetzer. Kurven-Vergleich inkl. Gas-Rampe: 0.10c.2 4 Kurven offen (alte Messlatte 7) → **0**; kleinster Wert
  Alpen +0.62 s, Finnland +0.28 s. Kein Nachziehen nötig. Streifer 10/15 km/h +1.15/+1.25 s, frontal +3.46 s (150 m).
  37 Läufe ohne Kontakt bit-gleich, keine revision. Lanza 073 Finnland digital: 1 Strafe 4.0 s, 3:10.38 → 3:13.18.
  M10c.2-Tests a, b, d, e, g umgestellt (Kommentar „M10d“); (g) prüft jetzt „frei“, Gleichheit vom selben Zustand in m10d (m).
- Nächster: C (Alpen-Sprünge).
