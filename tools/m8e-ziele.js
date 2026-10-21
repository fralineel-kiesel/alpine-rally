// Ziele für Meilenstein 8e (Lanza 073 und Subora Imprexa): Fahrmessung gegen das Profil prototyp und Motorklang gegen
// den Audan. Benutzt von tools/m8e-test.mjs und tools/auto-messung.mjs. Das Spiel lädt diese Datei nicht.
//
// Fahrmessung: dieselben Zeilen wie in M8c (tools/m8c-ziele.js), je Zeile [Text, Wert(messung), Art, Ziel l073, Ziel imprexa,
// Einheit]. Arten: 'prozent' (Unterschied zum Prototyp in %, bei Zeiten plus = langsamer), 'grad' (Wert selbst),
// 'diff' (Unterschied zum Prototyp in Grad), 'gleich' (genau wie der Prototyp).

const I = Infinity;
export const AUTOS_M8E = ['l073', 'imprexa'];
export const ZEILEN = [
  ['0-100 km/h Asphalt', (r) => r.beschl100_asphalt, 'prozent', [-13, -8], [-6, -3], 's'],
  ['0-100 km/h Schotter', (r) => r.beschl100_schotter, 'prozent', [-6, 0], [-9, -5], 's'],
  ['0-100 km/h Wiesenweg', (r) => r.beschl100_wiesenweg, 'prozent', [0, 10], [-14, -9], 's'],
  ['0-60 km/h Gras', (r) => r.beschl60_gras, 'prozent', [-0.05, I], [-0.05, I], 's'],
  ['0-100 km/h Bankett', (r) => r.beschl100_bankett, 'prozent', [-0.05, I], [-0.05, I], 's'],
  ['Höchsttempo (Vollgas)', (r) => r.hoechst_asphalt, 'prozent', [-8, -3], [-4, 0], 'km/h'],
  ['Bremsweg 100-0 Asphalt', (r) => r.bremsweg100_asphalt, 'prozent', [-6, 6], [-5, 5], 'm'],
  ['Kreis R 25 m Asphalt', (r) => r.kreis25_asphalt, 'prozent', [3, 7], [1.5, 4], 'km/h'],
  ['Kreis R 25 m Schotter', (r) => r.kreis25_schotter, 'prozent', [0, 5], [4, 8], 'km/h'],
  ['Kreis R 25 m Wiesenweg', (r) => r.kreis25_wiesenweg, 'prozent', [0, 6], [9, 13], 'km/h'],
  ['Lenkwinkel 80 km/h auf R 60 m', (r) => r.lenk80_r60.grad, 'prozent', [-20, -10], [-3, 5], '°'],
  ['Heck: Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s', (r) => r.heck90_r80.zusatz, 'grad', [8, 12], [2.5, 4.5], '°'],
  ['... wieder eingefangen nach', (r) => r.heck90_r80.einfangen, 'grad', [0.9, 1.5], [0, 0.6], 's'],
  ['Vollgas in der Kurve R 80 m: Schwimmwinkel', (r) => r.gas_r80.max, 'diff', [2.5, 6], [-I, 0], '°'],
  ['Handbremsen-Drift Asphalt nach 0.5 s', (r) => r.hb_asphalt.nach05, 'prozent', [25, 45], [-15, 15], '°'],
  ['Rückwärts Höchsttempo', (r) => r.rueck_asphalt.max, 'gleich', null, null, 'km/h'],
  ['Rückwärts nach 1 s Asphalt', (r) => r.rueck_asphalt.nach1s, 'gleich', null, null, 'km/h'],
  ['Rückwärts nach 1 s Gras', (r) => r.rueck_gras.nach1s, 'gleich', null, null, 'km/h'],
];
// Testfahrer (ganze Etappe): l073 innerhalb ±1.5 % der Delto-Zeit und höchstens 1 % schneller als der Audan;
// imprexa 0.2 bis 0.7 % schneller als der Prototyp und höchstens 0.3 % Unterschied zum Audan
export const TESTFAHRER = { l073: { gegenDelto: [-1.5, 1.5], gegenAudanMin: -1 }, imprexa: { gegenPrototyp: [-0.7, -0.2], gegenAudan: 0.3 } };

// Ziele, die ich verfehle (mit Begründung in STAND.md): der Test meldet sie als KOMP statt FEHLER
export const KOMPROMISSE = { l073: {}, imprexa: {} };

// Ein Wert gegen sein Ziel: { text, ok, d } (d = Prozent oder Grad je nach Art)
export function pruefeZeile([text, wert, art, zielA, zielB, einheit], P, X, auto) {
  const a = wert(P), b = wert(X), ziel = auto === 'l073' ? zielA : zielB;
  if (art === 'gleich') return { d: b - a, ok: b === a, ziel: 'identisch', a, b, einheit, text, art };
  const d = art === 'prozent' ? (b / a - 1) * 100 : art === 'diff' ? b - a : b;
  const ok = b != null && Number.isFinite(d) && d >= ziel[0] - 1e-9 && d <= ziel[1] + 1e-9;
  const zt = ziel[0] === -I ? `höchstens ${ziel[1]}` : ziel[1] === I ? `mindestens ${ziel[0]}` : `${ziel[0]} bis ${ziel[1]}`;
  return { d, ok, ziel: `${zt}${art === 'prozent' ? ' %' : art === 'diff' ? '° mehr' : ` ${einheit}`}`, a, b, einheit, text, art };
}

// Motorklang gegen den Audan (Werte aus tools/ton-messung.mjs --profil, Block "motor" und "profil"):
// [Text, Wert(messung), Art, Ziel l073, Ziel imprexa]; Arten: 'prozent' gegen den Audan, 'db' (Unterschied in dB),
// 'faktor' (mal), 'wert' (Wert selbst), 'hoechstens' (nicht höher als der Audan), null = gilt für dieses Auto nicht
const motor = (rpm) => (m) => m.motor.find((x) => x.rpm === rpm);
export const POPS = (m) => m.profil.pops.pops + m.profil.pops.knistern + m.profil.pops.schaltknall; // alle Pops (60-s-Fahrt)
export const TON_ZEILEN = [
  ['Grundton Leerlauf (Hz)', (m) => m.profil.leerlauf.f0, 'prozent', [-23, -17], [-23, -17]],
  ['Grundton bei 7000 U/min (Hz)', (m) => motor(7000)(m).f0, 'prozent', [15, 30], [-10, -3]],
  ['Spektralschwerpunkt Vollgas 5000 U/min (Hz)', (m) => motor(5000)(m).schwerpunkt, 'prozent', [20, 45], [-20, -5]],
  ['Energie unter 200 Hz bei Teillast (2500 U/min, Gas 0.4)', (m) => m.profil.teillast.unter200, 'prozent', [-45, -20], [25, 60]],
  ['Unregelmässigkeit (Schwankung 20 ms, 20-200 Hz; Mittel Leerlauf und Teillast)', (m) => m.profil.unrund.mittel, 'prozent', [20, 60], [50, 150]],
  ['Lader-Heulen: Tonhöhe bei 7000 U/min (Hz)', (m) => (m.profil.lader.an ? m.profil.lader.hz7000 : null), 'wert', [2500, 4000], null],
  ['Lader-Heulen: Korrelation Tonhöhe/Drehzahl (Vergleichsfahrt)', (m) => (m.profil.lader.an ? m.profil.lader.korrelation : null), 'wert', [0.98, 1], null],
  ['Lader-Heulen: Pegel gegen den Motor (dB, Vollgas 5000)', (m) => (m.profil.lader.an ? m.profil.lader.gegenMotorDb : null), 'wert', [-14, -8], null],
  ['Lader-Heulen: Anstieg nach Gasstoss (s, bis 90 %)', (m) => (m.profil.lader.an ? m.profil.lader.anstieg : null), 'wert', [0, 0.06], null],
  ['Turbo-Pfeifen: Tonhöhe (Hz)', (m) => m.profil.turbo.ton, 'prozent', null, [-25, -15]],
  ['Turbo-Pfeifen: Pegel (RMS)', (m) => m.profil.turbo.rms, 'prozent', null, [-50, -30]],
  ['Lautstärke Motor Vollgas 5000 (RMS)', (m) => motor(5000)(m).rms, 'db', [-1.5, 1.5], [-1.5, 1.5]],
  ['Spitze vor dem Limiter', (m) => m.profil.spitze, 'hoechstens', [-I, 0], [-I, 0]],
  ['Pops je Minute (Knall, Knistern, Schaltknall; feste 60-s-Fahrt)', POPS, 'faktor', [0.8, 1.2], [1.3, 2.2]],
  ['Pop-Mittelfrequenz (Schwerpunkt eines Pops, Hz)', (m) => m.pop.schwerpunkt, 'prozent', [-25, -10], [-40, -25]],
];
// Ein Ton-Wert gegen sein Ziel (A = Messung des Audan, X = des Autos)
export function pruefeTon([text, wert, art, zielA, zielB], A, X, auto) {
  const ziel = auto === 'l073' ? zielA : zielB;
  const a = wert(A), b = wert(X);
  if (!ziel) return null;
  const d = art === 'prozent' ? (b / a - 1) * 100 : art === 'db' ? 20 * Math.log10(b / a) : art === 'faktor' ? b / a : art === 'hoechstens' ? 20 * Math.log10(b / a) : b;
  const ok = b != null && Number.isFinite(d) && d >= ziel[0] - 1e-9 && d <= ziel[1] + 1e-9;
  return { text, a, b, d, ok, art, ziel };
}
