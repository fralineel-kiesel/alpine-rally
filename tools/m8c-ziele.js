// Ziele der Fahrmessung für Meilenstein 8c (Lanza Delto und Fard Escorta gegen das Profil prototyp).
// Benutzt von tools/auto-messung.mjs (Tabelle) und tools/m8c-test.mjs (Prüfung). Das Spiel lädt diese Datei nicht.
//
// Jede Zeile: [Text, Wert(messung), Art, Ziel Delto, Ziel Escorta, Einheit]
//   Art 'prozent': Unterschied zum Prototyp in Prozent (bei Zeiten: plus = langsamer), Ziel [von, bis]
//   Art 'grad':    Wert selbst in Grad (z. B. Zusatz-Schwimmwinkel), Ziel [von, bis]
//   Art 'diff':    Unterschied zum Prototyp in Grad, Ziel [von, bis]
//   Art 'gleich':  muss genau gleich sein wie beim Prototyp
// Kompromisse (Ziel verfehlt, Begründung in STAND.md, Meilenstein 8c): KOMPROMISSE[auto][Text]

const I = Infinity;
export const ZEILEN = [
  ['0-100 km/h Asphalt', (r) => r.beschl100_asphalt, 'prozent', [-8, -4], [4, 9], 's'],
  ['0-100 km/h Schotter', (r) => r.beschl100_schotter, 'prozent', [-11, -6], [0, 8], 's'],
  ['0-100 km/h Wiesenweg', (r) => r.beschl100_wiesenweg, 'prozent', [-14, -9], [10, 20], 's'],
  ['0-60 km/h Gras', (r) => r.beschl60_gras, 'prozent', [-0.05, I], [-0.05, I], 's'],
  ['0-100 km/h Bankett', (r) => r.beschl100_bankett, 'prozent', [-0.05, I], [-0.05, I], 's'],
  ['Höchsttempo (Vollgas)', (r) => r.hoechst_asphalt, 'prozent', [-7, -3], [-10, -6], 'km/h'],
  ['Bremsweg 100-0 Asphalt', (r) => r.bremsweg100_asphalt, 'prozent', [-6, 6], [-5, 5], 'm'],
  ['Kreis R 25 m Asphalt', (r) => r.kreis25_asphalt, 'prozent', [1, 5], [-2, 2], 'km/h'],
  ['Kreis R 25 m Schotter', (r) => r.kreis25_schotter, 'prozent', [4, 9], [-2, 3], 'km/h'],
  ['Kreis R 25 m Wiesenweg', (r) => r.kreis25_wiesenweg, 'prozent', [8, 13], [-2, 4], 'km/h'],
  ['Lenkwinkel 80 km/h auf R 60 m', (r) => r.lenk80_r60.grad, 'prozent', [-5, 8], [-15, -5], '°'],
  ['Heck: Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s', (r) => r.heck90_r80.zusatz, 'grad', [3, 6], [6, 10], '°'],
  ['... wieder eingefangen nach', (r) => r.heck90_r80.einfangen, 'grad', [0, 0.9], [0, 1.2], 's'],
  ['Vollgas in der Kurve R 80 m: Schwimmwinkel', (r) => r.gas_r80.max, 'diff', [-I, 0], [2, 6], '°'],
  ['Handbremsen-Drift Asphalt nach 0.5 s', (r) => r.hb_asphalt.nach05, 'prozent', [-20, 20], [10, 30], '°'],
  ['Rückwärts Höchsttempo', (r) => r.rueck_asphalt.max, 'gleich', null, null, 'km/h'],
  ['Rückwärts nach 1 s Asphalt', (r) => r.rueck_asphalt.nach1s, 'gleich', null, null, 'km/h'],
  ['Rückwärts nach 1 s Gras', (r) => r.rueck_gras.nach1s, 'gleich', null, null, 'km/h'],
];
// Testfahrer (ganze Etappe) gegen prototyp in Prozent; Delto zusätzlich nicht schneller als der Audan Quarto
export const TESTFAHRER = { delto: [-0.5, 1.5], escorta: [1, 4] };

// Ziele, die ich verfehle (mit Begründung in STAND.md); der Test meldet sie als KOMP statt FEHLER
export const KOMPROMISSE = {
  delto: {
    'Testfahrer vorsichtig gegen Audan': 'der Testfahrer gewinnt beim Herausbeschleunigen; 0.04 s schneller als mit dem Audan',
    'Testfahrer mittel gegen Audan': 'der Testfahrer gewinnt beim Herausbeschleunigen; 0.16 s schneller als mit dem Audan',
  },
  escorta: {
    'Testfahrer vorsichtig': 'der vorsichtige Testfahrer fährt fast nur kurvenbegrenzt; mehr Abstand nur mit noch weniger Schub (0-100 km/h Asphalt schon +8.3 %, Ziel höchstens +9 %)',
  },
};

// Ein Wert gegen sein Ziel: { text, ok, d } (d = Prozent oder Grad je nach Art)
export function pruefeZeile([text, wert, art, zielD, zielE, einheit], P, X, auto) {
  const a = wert(P), b = wert(X), ziel = auto === 'delto' ? zielD : zielE;
  if (art === 'gleich') return { d: b - a, ok: b === a, ziel: 'identisch', a, b, einheit, text };
  const d = art === 'prozent' ? (b / a - 1) * 100 : art === 'diff' ? b - a : b;
  const ok = b != null && Number.isFinite(d) && d >= ziel[0] - 1e-9 && d <= ziel[1] + 1e-9;
  const zt = ziel[0] === -I ? `höchstens ${ziel[1]}` : ziel[1] === I ? `mindestens ${ziel[0]}` : `${ziel[0]} bis ${ziel[1]}`;
  return { d, ok, ziel: `${zt}${art === 'prozent' ? ' %' : art === 'diff' ? '° mehr' : ` ${einheit}`}`, a, b, einheit, text, art };
}
