// Prüfung einer Streckendatei (seit M10a). Reine Rechnung ohne Three.js und ohne config.js:
// der Lader (js/streckenlader.js) prüft schnell (Version, Pflichtfelder), das Werkzeug
// tools/strecke-pruefen.mjs prüft alles (voll: true). Format: docs/strecken-format.md.
//
// Ergebnis: Liste von Fehlern als Text mit Pfad, z. B. "checkpoints[2]: 3700 liegt hinter dem Ziel (3622.6)".
// Leere Liste = in Ordnung.

import { pruefeSprung } from './sprung.js';

export const FORMAT = 1;

// Bekannte Beläge (müssen zu den Schlüsseln von config.belaege passen, prüft tools/m10a-test.mjs)
export const BELAEGE = ['asphalt', 'schotter', 'wiesenweg'];
// Bekannte Absperrungen und Seitenschutz an Stummeln und Verlängerungen
export const SPERREN = ['band', 'reifen', 'heu', 'zaun'];
export const SEITENSCHUTZ = ['planke', 'zaun'];
// Themen der Abkürzungs-Sperren
export const SPERR_THEMEN = ['fels', 'staemme', 'baeume'];
// Diese Seeds muss jede Strecke haben (gleiche Zahl = gleiche Welt)
export const SEEDS = ['gelaende', 'sprites', 'buesche', 'fernwald', 'berge', 'kuehe', 'nebenwegWald', 'stummelSichtschutz',
  'absperrung', 'sperren', 'strassenrand', 'startZiel', 'leben', 'lebenZaun', 'lebenKuehe', 'umgebung'];
// M10b: bekannte Deko-Typen (müssen zu den Pixelfunktionen im Code passen, prüft tools/m10b-test.mjs):
// Fahnen js/motive.js, Tiere js/kuhbild.js, Häuser js/leben.js (HAUS_TYPEN), Bäume js/pixel.js
export const DEKO = {
  fahne: ['schweiz', 'finnland'],
  tier: ['kuh', 'rentier'],
  tierKlang: ['glocke', 'rentier', null], // (M10b.2: rentier)
  haus: ['alphuette', 'heustadel', 'holzhaus', 'holzschuppen'],
  stadel: ['alphuette', 'heustadel', 'holzhaus', 'holzschuppen'],
  // (M10b.1: Haus-Typen je Haus in leben.wiesenweg.haeuser[].typ, = HAUS_TYPEN in js/leben.js)
  nadelbaum: ['tanne', 'kiefer', 'fichte', 'nordwald'],
  laubbaum: ['laub', 'birke'],
  unterholz: [null, 'nordisch'],   // M10b.1
  tierschild: ['allgemein', 'elch'], // M10b.1
};
// M10b.1: alle Haus-Typen (js/leben.js, HAUS_TYPEN) für leben.wiesenweg.haeuser[].typ
export const HAUS_TYPEN_PRUEFER = ['alphuette', 'heustadel', 'holzhaus', 'holzschuppen', 'scheune', 'saunahuette'];
// Pflichtfelder (oberste Ebene) und ihre Art
const PFLICHT = {
  format: 'zahl', id: 'text', etappe: 'text', name: 'objekt', beschreibung: 'objekt', laenge: 'zahl', seeds: 'objekt',
  abschnitte: 'objekt', punkte: 'liste', strasse: 'objekt', checkpoints: 'liste', nebenwege: 'liste', umgebung: 'objekt',
  natur: 'objekt', startZiel: 'objekt', leben: 'objekt', beschriftung: 'objekt', klang: 'objekt', abkuerzung: 'objekt',
  erzeugt: 'objekt',
};
const FARBEN = ['himmelOben', 'dunst', 'gras', 'grasDunkel', 'fels', 'felsDunkel', 'erde', 'bankett', 'asphalt', 'mittellinie',
  'schotter', 'schotterSpur', 'wiesenweg', 'wiesenwegSpur', 'wiesenwegGras', 'bergFels', 'bergFuss', 'schnee'];

const istZahl = (x) => typeof x === 'number' && Number.isFinite(x);
const istObjekt = (x) => x != null && typeof x === 'object' && !Array.isArray(x);
const art = (x) => (Array.isArray(x) ? 'liste' : istObjekt(x) ? 'objekt' : typeof x === 'string' ? 'text' : istZahl(x) ? 'zahl' : typeof x);
const farbe = (x) => typeof x === 'string' && /^#[0-9a-f]{6}$/i.test(x);
const r1 = (x) => Math.round(x * 10) / 10;

export function pruefeStrecke(d, { voll = false } = {}) {
  const f = [];
  const fehler = (pfad, text) => f.push(`${pfad}: ${text}`);
  if (!istObjekt(d)) return ['(Datei): kein Daten-Objekt (export default { ... } fehlt?)'];
  if (d.format !== FORMAT) fehler('format', `ist ${JSON.stringify(d.format)}, erwartet ${FORMAT}`);
  for (const [k, a] of Object.entries(PFLICHT)) {
    if (!(k in d)) fehler(k, 'fehlt');
    else if (art(d[k]) !== a) fehler(k, `ist ${art(d[k])}, erwartet ${a}`);
  }
  if (f.length || !voll) return f;

  // --- Kopf ---
  if (!/^[a-z0-9-]+$/.test(d.id)) fehler('id', `"${d.id}": nur Kleinbuchstaben, Ziffern und -`);
  if (!/^[a-z0-9-]+$/.test(d.etappe)) fehler('etappe', `"${d.etappe}": nur Kleinbuchstaben, Ziffern und -`);
  for (const k of ['name', 'beschreibung']) for (const s of ['de', 'en']) {
    const t = d[k][s];
    if (typeof t !== 'string' || !t.trim()) fehler(`${k}.${s}`, 'fehlt');
    else if (t !== t.toUpperCase()) fehler(`${k}.${s}`, `"${t}": Pixelschrift kennt nur Grossbuchstaben`);
  }
  if (!(d.laenge >= 200 && d.laenge <= 50000)) fehler('laenge', `${d.laenge} m liegt nicht zwischen 200 und 50000`);

  // M10b.1: Verlauf-Stand (Ganzzahl ab 1, fehlt = 1). Neuer Verlauf = höhere Zahl: die Bestzeiten bekommen einen neuen Schlüssel
  if ('revision' in d && !(Number.isInteger(d.revision) && d.revision >= 1 && d.revision <= 999)) fehler('revision', `${JSON.stringify(d.revision)}: ganze Zahl ab 1 erwartet`);

  // --- Optionale Felder seit M10b (fehlen sie, gilt die Datei weiter) ---
  if ('untergrundInfo' in d) {
    if (!istObjekt(d.untergrundInfo)) fehler('untergrundInfo', 'Objekt { de, en } erwartet');
    else for (const s of ['de', 'en']) {
      const t = d.untergrundInfo[s];
      if (typeof t !== 'string' || !t.trim()) fehler(`untergrundInfo.${s}`, 'fehlt');
      else if (t !== t.toUpperCase()) fehler(`untergrundInfo.${s}`, `"${t}": Pixelschrift kennt nur Grossbuchstaben`);
      else if (t.length > 22) fehler(`untergrundInfo.${s}`, `"${t}": höchstens 22 Zeichen (Platz in der Etappenwahl)`);
    }
  }
  if ('deko' in d) {
    if (!istObjekt(d.deko)) fehler('deko', 'Objekt erwartet');
    else for (const [k, v] of Object.entries(d.deko)) {
      if (!(k in DEKO)) fehler(`deko.${k}`, `unbekanntes Feld (bekannt: ${Object.keys(DEKO).join(', ')})`);
      else if (!DEKO[k].includes(v)) fehler(`deko.${k}`, `${JSON.stringify(v)} unbekannt (bekannt: ${DEKO[k].map((x) => JSON.stringify(x)).join(', ')})`);
    }
  }
  if ('sprung' in d) {
    // Markierte Kuppen; seit M10c mit Sprungzone (von/bis …) echte Sprünge, ohne Zone nur Markierung
    if (!Array.isArray(d.sprung)) fehler('sprung', 'Liste erwartet');
    else d.sprung.forEach((sp, i) => {
      if (!istObjekt(sp) || !istZahl(sp.s) || typeof sp.name !== 'string' || !sp.name.trim()) { fehler(`sprung[${i}]`, '{ s: Streckenmeter, name } erwartet'); return; }
      if (!(sp.s > 0 && sp.s < d.laenge)) fehler(`sprung[${i}].s`, `${sp.s} liegt nicht auf der Strecke (0 bis ${d.laenge})`);
      if (i > 0 && istZahl(d.sprung[i - 1].s) && sp.s <= d.sprung[i - 1].s) fehler(`sprung[${i}].s`, `${sp.s} nicht hinter sprung[${i - 1}] (${d.sprung[i - 1].s})`);
    });
    // M10c: Sprungzonen (von, bis, kante, landeVon, landeBis, staerke, form): Regeln in js/sprung.js
    pruefeSprung(d, fehler);
  }

  if ('belagAbschnitte' in d) {
    // Untergrund ohne Abzweig: { von, bis, belag }, aufsteigend, ohne Überlappung
    if (!Array.isArray(d.belagAbschnitte)) fehler('belagAbschnitte', 'Liste erwartet');
    else d.belagAbschnitte.forEach((b, i) => {
      const p = `belagAbschnitte[${i}]`;
      if (!istObjekt(b) || !istZahl(b.von) || !istZahl(b.bis) || !(b.bis > b.von)) { fehler(p, '{ von < bis, belag } erwartet'); return; }
      if (!BELAEGE.includes(b.belag)) fehler(`${p}.belag`, `"${b.belag}" unbekannt (bekannt: ${BELAEGE.join(', ')})`);
      const vor = d.belagAbschnitte[i - 1];
      if (i > 0 && istObjekt(vor) && istZahl(vor.bis) && b.von < vor.bis) fehler(p, `überlappt belagAbschnitte[${i - 1}] (bis ${vor.bis})`);
    });
  }
  if ('wasser' in d) {
    const W = d.wasser;
    if (!istObjekt(W)) fehler('wasser', 'Objekt { seen, fluesse } erwartet');
    else {
      (Array.isArray(W.seen) ? W.seen : W.seen == null ? [] : (fehler('wasser.seen', 'Liste erwartet'), [])).forEach((w, i) => {
        const p = `wasser.seen[${i}]`;
        if (!istObjekt(w) || !['s', 'lat', 'rx', 'rz', 'tiefe'].every((k) => istZahl(w[k])) || (w.seite !== 1 && w.seite !== -1)) { fehler(p, '{ s, seite: 1/-1, lat, rx, rz, tiefe } erwartet'); return; }
        if (!(w.s >= 0 && w.s <= d.laenge)) fehler(`${p}.s`, `${w.s} liegt nicht auf der Strecke`);
        if (!(w.rx > 0 && w.rz > 0)) fehler(p, 'rx und rz müssen grösser als 0 sein');
        if (w.lat - w.rx < 12) fehler(p, `Ufer nur ${(w.lat - w.rx).toFixed(1)} m neben der Strasse (mindestens 12)`);
      });
      (Array.isArray(W.fluesse) ? W.fluesse : W.fluesse == null ? [] : (fehler('wasser.fluesse', 'Liste erwartet'), [])).forEach((w, i) => {
        const p = `wasser.fluesse[${i}]`;
        if (!istObjekt(w) || !['s', 'breite', 'laenge', 'tiefe'].every((k) => istZahl(w[k]))) { fehler(p, '{ s, breite, laenge, winkel, tiefe } erwartet'); return; }
        if (!(w.s > 0 && w.s < d.laenge)) fehler(`${p}.s`, `${w.s} liegt nicht auf der Strecke`);
        if (!(w.breite > 0 && w.breite <= 30)) fehler(`${p}.breite`, `${w.breite}: 0 bis 30 m erwartet`);
        if (w.winkel != null && !(Math.abs(w.winkel) <= 45)) fehler(`${p}.winkel`, `${w.winkel}: höchstens 45° schräg`);
      });
    }
  }

  // --- Seeds ---
  for (const k of SEEDS) {
    if (!(k in d.seeds)) fehler(`seeds.${k}`, 'fehlt');
    else if (!Number.isInteger(d.seeds[k]) || d.seeds[k] < 0) fehler(`seeds.${k}`, `${d.seeds[k]}: ganze Zahl ab 0 erwartet`);
  }

  // --- Abschnitte ---
  for (const [n, a] of Object.entries(d.abschnitte)) {
    const p = `abschnitte["${n}"]`;
    if (!istObjekt(a)) { fehler(p, 'kein Objekt'); continue; }
    if (a.baeume != null && !(a.baeume >= 0 && a.baeume <= 5)) fehler(`${p}.baeume`, `${a.baeume}: 0 bis 5 erwartet`);
    if (a.wald != null && !(a.wald >= 0 && a.wald <= 1)) fehler(`${p}.wald`, `${a.wald}: 0 bis 1 erwartet`);
    if (a.nah != null && typeof a.nah !== 'boolean') fehler(`${p}.nah`, 'true/false erwartet');
    if (a.wand != null && a.wand !== 'links' && a.wand !== 'rechts') fehler(`${p}.wand`, `"${a.wand}": 'links' oder 'rechts' erwartet`);
    if (a.voegel != null && !(a.voegel >= 0 && a.voegel <= 2)) fehler(`${p}.voegel`, `${a.voegel}: 0 bis 2 erwartet`);
  }

  // --- Punkte: lückenlos und stetig ---
  let n = 0, vorher = null, richtung = null;
  if (typeof d.punkte[0] !== 'string') fehler('punkte[0]', 'muss ein Abschnitts-Name sein (gilt für die Punkte danach)');
  d.punkte.forEach((e, i) => {
    const p = `punkte[${i}]`;
    if (typeof e === 'string') { if (!(e in d.abschnitte)) fehler(p, `Abschnitt "${e}" steht nicht in abschnitte`); return; }
    if (!Array.isArray(e) || e.length !== 3 || !e.every(istZahl)) { fehler(p, 'erwartet [x, z, h] (drei Zahlen)'); return; }
    n++;
    if (vorher) {
      const dx = e[0] - vorher[0], dz = e[1] - vorher[1], l = Math.hypot(dx, dz);
      if (l < 0.5) fehler(p, `nur ${l.toFixed(2)} m nach dem Punkt davor (mindestens 0.5)`);
      else if (l > 60) fehler(p, `Lücke: ${l.toFixed(1)} m nach dem Punkt davor (höchstens 60)`);
      else {
        const steigung = Math.abs(e[2] - vorher[2]) / l;
        if (steigung > 0.3) fehler(p, `Sprung in der Höhe: ${(steigung * 100).toFixed(0)} % Steigung (höchstens 30 %)`);
        const w = Math.atan2(dx, -dz);
        if (richtung != null) {
          let dw = Math.abs(w - richtung) % (2 * Math.PI);
          if (dw > Math.PI) dw = 2 * Math.PI - dw;
          if (dw > Math.PI / 3) fehler(p, `Knick: Richtung ändert sich um ${(dw * 180 / Math.PI).toFixed(0)}° (höchstens 60°)`);
        }
        richtung = w;
      }
    }
    vorher = e;
  });
  if (n < 4) fehler('punkte', `nur ${n} Punkte (mindestens 4)`);
  // Grobe Länge (Polylinie) gegen laenge: der Spline ist etwas länger, nie viel
  {
    let l = 0, a = null;
    for (const e of d.punkte) if (Array.isArray(e) && e.length === 3) { if (a) l += Math.hypot(e[0] - a[0], e[1] - a[1], e[2] - a[2]); a = e; }
    if (n >= 4 && Math.abs(l - d.laenge) > Math.max(5, d.laenge * 0.01)) fehler('laenge', `${d.laenge} m passt nicht zu den Punkten (Linie ca. ${r1(l)} m)`);
  }

  // --- Start, Checkpoints, Ziel ---
  const S = d.strasse;
  for (const k of ['startBeiMeter', 'zielVorEnde', 'spawnBeiMeter']) if (!istZahl(S[k]) || S[k] < 0) fehler(`strasse.${k}`, `${S[k]}: Zahl ab 0 erwartet`);
  const startS = S.startBeiMeter, zielS = d.laenge - S.zielVorEnde;
  if (istZahl(S.spawnBeiMeter) && S.spawnBeiMeter >= startS) fehler('strasse.spawnBeiMeter', `${S.spawnBeiMeter} muss vor der Startlinie (${startS}) liegen`);
  if (!(zielS - startS >= 200)) fehler('strasse', `Start (${startS}) bis Ziel (${r1(zielS)}) ist kürzer als 200 m`);
  if (!d.checkpoints.length) fehler('checkpoints', 'leer (mindestens ein Checkpoint)');
  d.checkpoints.forEach((s, i) => {
    const p = `checkpoints[${i}]`;
    if (!istZahl(s)) { fehler(p, 'keine Zahl'); return; }
    if (s <= startS + 50) fehler(p, `${s} liegt nicht nach dem Start (${startS} + 50 m)`);
    if (s >= zielS - 50) fehler(p, `${s} liegt hinter dem Ziel (${r1(zielS)} − 50 m)`);
    if (i > 0 && !(s > d.checkpoints[i - 1] + 50)) fehler(p, `${s} liegt nicht mindestens 50 m nach checkpoints[${i - 1}] (${d.checkpoints[i - 1]})`);
  });

  // --- Nebenwege (Untergrund-Abschnitte) ---
  d.nebenwege.forEach((w, i) => {
    const p = `nebenwege[${i}]`;
    if (!istObjekt(w)) { fehler(p, 'kein Objekt'); return; }
    if (typeof w.name !== 'string' || !w.name) fehler(`${p}.name`, 'fehlt');
    if (!istZahl(w.abzweig) || !istZahl(w.einmuendung) || !(w.einmuendung > w.abzweig + 20)) fehler(p, `abzweig (${w.abzweig}) muss mindestens 20 m vor einmuendung (${w.einmuendung}) liegen`);
    else {
      if (w.abzweig <= startS || w.einmuendung >= zielS) fehler(p, `${w.abzweig}–${w.einmuendung} liegt nicht zwischen Start und Ziel`);
      if (i > 0 && istZahl(d.nebenwege[i - 1].einmuendung) && w.abzweig < d.nebenwege[i - 1].einmuendung) fehler(p, `überlappt nebenwege[${i - 1}] (der Reihe nach angeben)`);
    }
    if (!BELAEGE.includes(w.belag)) fehler(`${p}.belag`, `"${w.belag}" unbekannt (bekannt: ${BELAEGE.join(', ')})`);
    for (const k of ['sperreAbzweig', 'sperreEinmuendung']) if (w[k] != null && !SPERREN.includes(w[k])) fehler(`${p}.${k}`, `"${w[k]}" unbekannt (bekannt: ${SPERREN.join(', ')})`);
    for (const k of ['stummelAbzweig', 'stummelEinmuendung']) if (w[k] && w[k].seitenschutz != null && !SEITENSCHUTZ.includes(w[k].seitenschutz)) fehler(`${p}.${k}.seitenschutz`, `"${w[k].seitenschutz}" unbekannt`);
  });

  // --- Umgebung (Farben, Licht, Nebel, Berge, Gelände) ---
  const U = d.umgebung;
  for (const k of ['farben', 'licht', 'nebel', 'berge', 'gelaende', 'fernwald']) if (!istObjekt(U[k])) fehler(`umgebung.${k}`, 'fehlt');
  if (istObjekt(U.farben)) for (const k of FARBEN) if (!farbe(U.farben[k])) fehler(`umgebung.farben.${k}`, `${JSON.stringify(U.farben[k])}: Farbe wie "#4e9a2c" erwartet`);
  if (istObjekt(U.licht)) {
    if (!farbe(U.licht.sonneFarbe) || !farbe(U.licht.umgebungFarbe)) fehler('umgebung.licht', 'sonneFarbe/umgebungFarbe: Farbe erwartet');
    if (!(U.licht.sonneStaerke >= 0 && U.licht.sonneStaerke <= 10)) fehler('umgebung.licht.sonneStaerke', `${U.licht.sonneStaerke}: 0 bis 10 erwartet`);
  }
  if (istObjekt(U.nebel)) {
    if (!(U.nebel.start >= 0 && U.nebel.ende > U.nebel.start)) fehler('umgebung.nebel', `start (${U.nebel.start}) muss vor ende (${U.nebel.ende}) liegen`);
    if (!(U.nebel.maxDichte >= 0 && U.nebel.maxDichte <= 1)) fehler('umgebung.nebel.maxDichte', `${U.nebel.maxDichte}: 0 bis 1 erwartet`);
  }
  if (!Array.isArray(U.landschaft)) fehler('umgebung.landschaft', 'Liste erwartet (darf leer sein)');
  else U.landschaft.forEach((b, i) => { if (!['x', 'z', 'radius', 'hoehe'].every((k) => istZahl(b[k])) || b.radius <= 0) fehler(`umgebung.landschaft[${i}]`, '{ x, z, radius > 0, hoehe } erwartet'); });
  // M10b.2: Kunst-Schatten (freiwillig, oberste Ebene): Sonne (Himmelsrichtung), Länge, Dunkelheit
  if ('schatten' in d) {
    const Sch = d.schatten, BER = { sonne: [0, 360], laenge: [0.2, 6], dunkelheit: [0.1, 1] };
    if (!istObjekt(Sch)) fehler('schatten', 'Objekt { sonne, laenge, dunkelheit } erwartet');
    else for (const [k, [a, b]] of Object.entries(BER)) if (!istZahl(Sch[k]) || Sch[k] < a || Sch[k] > b) fehler(`schatten.${k}`, `${JSON.stringify(Sch[k])}: Zahl von ${a} bis ${b} erwartet`);
  }
  // M10b.2: Böschung (freiwillig): flache Schulter, höchste Steigung, weicher Ansatz, Reichweite
  if ('boeschung' in U) {
    const B = U.boeschung, BEREICH = { schulter: [0, 10], steigung: [0.05, 0.6], weich: [0, 20], reichweite: [10, 80] };
    if (!istObjekt(B)) fehler('umgebung.boeschung', 'Objekt { schulter, steigung, weich, reichweite } erwartet');
    else for (const [k, [a, b]] of Object.entries(BEREICH)) {
      if (!istZahl(B[k]) || B[k] < a || B[k] > b) fehler(`umgebung.boeschung.${k}`, `${JSON.stringify(B[k])}: Zahl von ${a} bis ${b} erwartet`);
    }
  }

  // --- Klang ---
  const K = d.klang;
  if ('wasser' in K) {
    if (!Array.isArray(K.wasser) || !K.wasser.every((w) => Array.isArray(w) && w.length === 2 && w.every(istZahl) && w[0] >= 0 && w[0] <= d.laenge)) fehler('klang.wasser', 'Liste von [Streckenmeter, seitlich] erwartet');
  }
  if (K.boeenAbschnitt != null && !(K.boeenAbschnitt in d.abschnitte)) fehler('klang.boeenAbschnitt', `"${K.boeenAbschnitt}" steht nicht in abschnitte`);
  if (!istObjekt(K.publikumOrte)) fehler('klang.publikumOrte', 'Objekt erwartet');
  else {
    for (const k of ['start', 'ziel']) if (!istObjekt(K.publikumOrte[k])) fehler(`klang.publikumOrte.${k}`, 'fehlt');
    const spots = (d.leben.fans && d.leben.fans.spots) || [];
    for (const sp of spots) if (!(sp.name in K.publikumOrte)) fehler('klang.publikumOrte', `Fan-Spot "${sp.name}" (leben.fans.spots) fehlt`);
  }

  // --- Leben und Beschriftung ---
  const banner = d.beschriftung.banner || {};
  for (const [k, v] of Object.entries(banner)) if (!Array.isArray(v) || typeof v[0] !== 'string' || !farbe(v[1]) || !farbe(v[2])) fehler(`beschriftung.banner.${k}`, '[Text, Grundfarbe, Schriftfarbe] erwartet');
  const L = d.leben;
  if (L.an) {
    (L.fans && L.fans.spots || []).forEach((sp, i) => {
      for (const [, , name] of sp.banner || []) if (!(name in banner)) fehler(`leben.fans.spots[${i}].banner`, `"${name}" steht nicht in beschriftung.banner`);
      if (!Array.isArray(sp.s) || !(sp.s[1] > sp.s[0])) fehler(`leben.fans.spots[${i}].s`, '[von, bis] erwartet');
    });
    const WW = L.wiesenweg || {};
    // (M10b.1: dazu holzstapelOrte, briefkaesten, holzzaeune, parkwagen, boote)
    for (const k of ['haeuser', 'stege', 'holzstapelOrte', 'briefkaesten', 'holzzaeune', 'parkwagen', 'boote']) if (k in WW) {
      if (!Array.isArray(WW[k])) { fehler(`leben.wiesenweg.${k}`, 'Liste erwartet'); continue; }
      WW[k].forEach((h, i) => {
        const pflicht = k === 'haeuser' ? ['s', 'lat', 'laenge', 'tiefe', 'hoehe'] : k === 'stege' || k === 'holzzaeune' ? ['s', 'lat', 'laenge'] : ['s', 'lat'];
        if (!istObjekt(h) || !pflicht.every((x) => istZahl(h[x])) || (h.seite !== 1 && h.seite !== -1)) fehler(`leben.wiesenweg.${k}[${i}]`, `{ ${pflicht.join(', ')}, seite: 1/-1 } erwartet`);
        else if (k === 'haeuser' && h.typ != null && !HAUS_TYPEN_PRUEFER.includes(h.typ)) fehler(`leben.wiesenweg.haeuser[${i}].typ`, `"${h.typ}" unbekannt (bekannt: ${HAUS_TYPEN_PRUEFER.join(', ')})`);
        else if (k === 'haeuser' && h.dach != null && !['rot', 'braun', 'grau'].includes(h.dach)) fehler(`leben.wiesenweg.haeuser[${i}].dach`, `"${h.dach}" unbekannt (rot, braun, grau)`);
      });
    }
    (L.wracks || []).forEach((w, i) => { if (w.sponsor && !(w.sponsor in banner)) fehler(`leben.wracks[${i}].sponsor`, `"${w.sponsor}" steht nicht in beschriftung.banner`); });
  }
  if (!Array.isArray(d.beschriftung.wegweiser) || !Array.isArray(d.beschriftung.sponsoren)) fehler('beschriftung', 'wegweiser und sponsoren: Listen erwartet');

  // --- Abkürzungen von Hand ---
  const A = d.abkuerzung;
  for (const k of ['immerSperren', 'immerFrei']) if (!Array.isArray(A[k]) || !A[k].every(istZahl)) fehler(`abkuerzung.${k}`, 'Liste von Streckenmetern erwartet');
  if (!istObjekt(A.sperrThemen)) fehler('abkuerzung.sperrThemen', 'Objekt erwartet');
  else for (const [s, t] of Object.entries(A.sperrThemen)) if (!SPERR_THEMEN.includes(t)) fehler(`abkuerzung.sperrThemen["${s}"]`, `"${t}" unbekannt (bekannt: ${SPERR_THEMEN.join(', ')})`);

  // --- Erzeugte Daten (Werkzeuge schreiben sie; passen sie nicht, nimmt das Spiel sie nicht) ---
  const E = d.erzeugt;
  // (baumfolge und kuhfolge seit M10b freiwillig: nur Strecken mit "eingefrorener" Welt wie die Alpen brauchen sie)
  for (const k of ['abkuerzungen', 'kurvenTempo']) if (!istObjekt(E[k])) fehler(`erzeugt.${k}`, 'fehlt (Werkzeug laufen lassen, siehe docs/strecken-format.md)');
  if (istObjekt(E.abkuerzungen)) {
    if (!(Math.abs(E.abkuerzungen.streckenLaenge - d.laenge) <= 0.5)) fehler('erzeugt.abkuerzungen.streckenLaenge', `${E.abkuerzungen.streckenLaenge} passt nicht zu laenge ${d.laenge} (neu: node tools/abkuerzungen.mjs)`);
    (E.abkuerzungen.sperren || []).forEach((x, i) => { if (!istZahl(x.s) || (x.seite !== 1 && x.seite !== -1)) fehler(`erzeugt.abkuerzungen.sperren[${i}]`, '{ s, seite: 1/-1, von, bis } erwartet'); });
  }
  if (istObjekt(E.kurvenTempo)) (E.kurvenTempo.kurven || []).forEach((k, i) => { if (!(k.bis > k.von) || !(k.kmh === null || k.kmh > 0)) fehler(`erzeugt.kurvenTempo.kurven[${i}]`, '{ von < bis, kmh > 0 oder null (= ohne Grenze) } erwartet'); });
  if (istObjekt(E.baumfolge) && E.baumfolge.seed !== d.seeds.sprites) fehler('erzeugt.baumfolge.seed', `${E.baumfolge.seed} passt nicht zu seeds.sprites (${d.seeds.sprites})`);
  if (istObjekt(E.kuhfolge) && E.kuhfolge.seed !== d.seeds.kuehe) fehler('erzeugt.kuhfolge.seed', `${E.kuhfolge.seed} passt nicht zu seeds.kuehe (${d.seeds.kuehe})`);
  return f;
}

// M10b.1: Schlüssel der Bestzeiten und des letzten Laufs einer Strecke. Ohne revision (oder 1) genau die Etappe (Alpen:
// 'passstrasse', unverändert). Ab revision 2 mit Zusatz (Finnland: 'finnland-r2'): Zeiten des alten Verlaufs bleiben im
// Speicher liegen, werden aber nicht mehr gezeigt (sie passen nicht zur neuen Strecke).
export function bestzeitSchluessel(d) {
  return Number.isInteger(d.revision) && d.revision > 1 ? `${d.etappe}-r${d.revision}` : d.etappe;
}
