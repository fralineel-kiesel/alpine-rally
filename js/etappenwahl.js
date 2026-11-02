// Etappenwahl (seit M10b): Infos aller Strecken für die Menüseite ETAPPE und die Bestzeiten-Seite.
// Die gerade gebaute Strecke ist schon geladen (STRECKE); die anderen Streckendateien holt das Spiel erst, wenn die
// Seite ETAPPE oder BESTZEITEN sie braucht (nur die Daten, ohne Welt). Vorschau-Karte: Draufsicht der Stützpunkte im
// Pixel-Look, je Strecke einmal gemalt. Wählen = merken und die Seite neu laden (alle Bauteile entstehen beim Laden
// aus genau einer Strecke); nach dem Neuladen geht es direkt ins Hauptmenü (Zeile ETAPPE).

import { CONFIG } from './config.js';
import { STRECKEN, dateiAdresse, merkeId } from './strecken.js';
import { STRECKE } from './streckenlader.js';
import { pruefeStrecke } from './streckenpruefung.js';
import { TEXTE } from './texte.js';

export const NACH_WAHL = 'alpineRally.nachEtappenwahl'; // (sessionStorage) nach dem Neuladen ins Hauptmenü

// Je Strecke: { id, etappe, name (Text-Schlüssel), laengeKm, status: 'offen' | 'laedt' | 'da' | 'fehler', punkte, karte }
export const ETAPPEN_INFO = STRECKEN.map((e) => ({ id: e.id, eintrag: e, etappe: null, name: null, laengeKm: 0, status: 'offen', punkte: null, karte: null, grund: '' }));

function fuelle(info, d) {
  info.etappe = d.etappe;
  info.name = `strecke.${d.id}.name`;
  TEXTE[info.name] = d.name;
  TEXTE[`strecke.${d.id}.untergrund`] = d.untergrundInfo || d.beschreibung;
  info.untergrund = `strecke.${d.id}.untergrund`;
  // gefahrene Länge: Start bis Ziel (wie im Spiel, main.js), aus den Daten
  info.laengeKm = (d.laenge - d.strasse.startBeiMeter - d.strasse.zielVorEnde) / 1000;
  info.punkte = d.punkte.filter(Array.isArray);
  info.startS = d.strasse.startBeiMeter;
  info.zielS = d.laenge - d.strasse.zielVorEnde;
  info.status = 'da';
}
// Die gebaute Strecke sofort
for (const info of ETAPPEN_INFO) if (info.id === STRECKE.id) fuelle(info, STRECKE);

export const aktuelleInfo = () => ETAPPEN_INFO.find((i) => i.id === STRECKE.id);

// Alle anderen Strecken laden (nur die Daten). Kaputte Datei: status 'fehler' (die Liste zeigt sie grau, wählen geht nicht)
let laden = null;
export function ladeAlleInfos() {
  if (laden) return laden;
  laden = Promise.all(ETAPPEN_INFO.filter((i) => i.status === 'offen').map(async (info) => {
    info.status = 'laedt';
    try {
      const d = (await import(dateiAdresse(info.eintrag))).default;
      const f = pruefeStrecke(d);
      if (f.length) throw new Error(f[0]);
      fuelle(info, d);
    } catch (e) {
      info.status = 'fehler';
      info.grund = String(e && e.message || e).split('\n')[0];
    }
  }));
  return laden;
}

// Vorschau-Karte (Draufsicht): Leinwand b x h, einmal gemalt. Strasse hell, Start grün, Ziel weiss/schwarz, Rand dunkel.
export function vorschauKarte(info, b, h) {
  if (!info || info.status !== 'da') return null;
  if (info.karte && info.karte.width === b && info.karte.height === h) return info.karte;
  const V = CONFIG.menue.etappenKarte;
  const c = document.createElement('canvas');
  c.width = b; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = V.grund; x.fillRect(0, 0, b, h);
  const P = info.punkte;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [px, pz] of P) { minX = Math.min(minX, px); maxX = Math.max(maxX, px); minZ = Math.min(minZ, pz); maxZ = Math.max(maxZ, pz); }
  const rand = V.rand, m = Math.min((b - 2 * rand) / Math.max(1, maxX - minX), (h - 2 * rand) / Math.max(1, maxZ - minZ));
  const ox = (b - (maxX - minX) * m) / 2, oz = (h - (maxZ - minZ) * m) / 2;
  const bild = (p) => [Math.round(ox + (p[0] - minX) * m), Math.round(oz + (p[1] - minZ) * m)]; // Norden oben
  // Linie Pixel für Pixel (harte Pixel, kein Glätten), erst ein dunkler Schatten, dann hell
  const linie = (farbe, dx, dy) => {
    x.fillStyle = farbe;
    for (let i = 1; i < P.length; i++) {
      const [x0, y0] = bild(P[i - 1]), [x1, y1] = bild(P[i]);
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let k = 0; k <= n; k++) x.fillRect(Math.round(x0 + ((x1 - x0) * k) / n) + dx, Math.round(y0 + ((y1 - y0) * k) / n) + dy, 1, 1);
    }
  };
  linie(V.schatten, 1, 1);
  linie(V.strasse, 0, 0);
  // Start und Ziel: Punkt an der Stelle (nächster Stützpunkt zur Linie, grob über die Länge)
  const beiMeter = (s) => { let l = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (l + d >= s) return P[i]; l += d; } return P[P.length - 1]; };
  const [sx, sy] = bild(beiMeter(info.startS)), [zx, zy] = bild(beiMeter(info.zielS));
  x.fillStyle = V.start; x.fillRect(sx - 1, sy - 1, 3, 3);
  x.fillStyle = V.ziel; x.fillRect(zx - 1, zy - 1, 3, 3);
  x.fillStyle = '#101418'; x.fillRect(zx, zy - 1, 1, 1); x.fillRect(zx - 1, zy, 1, 1); x.fillRect(zx + 1, zy, 1, 1); x.fillRect(zx, zy + 1, 1, 1);
  info.karte = c;
  return c;
}

// Etappe wählen: gleiche Strecke = nichts tun (false); sonst merken und mit dieser Strecke neu laden (true).
// Die Adresse verliert ein ?strecke= (sonst würde wieder die alte geladen), alles andere bleibt.
export function waehleEtappe(id, neuLaden = () => window.location.replace(adresseOhneStrecke())) {
  if (id === STRECKE.id) return false;
  merkeId(id);
  try { window.sessionStorage.setItem(NACH_WAHL, '1'); } catch (e) { /* ohne Speicher: nach dem Laden der Titel */ }
  neuLaden();
  return true;
}
export function adresseOhneStrecke() {
  const u = new URL(window.location.href);
  u.searchParams.delete('strecke');
  return u.href;
}
// Nach dem Neuladen: direkt ins Hauptmenü? (einmal)
export function nachEtappenwahl() {
  try {
    const ja = window.sessionStorage.getItem(NACH_WAHL) === '1';
    window.sessionStorage.removeItem(NACH_WAHL);
    return ja;
  } catch (e) { return false; }
}
