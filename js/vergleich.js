// Live-Vergleich zur Bestzeit oder zum letzten Lauf (Meilenstein 6).
//
// Fahrspur: Während des Rennens wird alle rennablauf.spurAbstand Meter (10 m) die Rennzeit notiert, zu der das Auto
// diese Stelle zum ersten Mal erreicht hat (über maxS = weitester Punkt in diesem Lauf: zurückfahren überschreibt
// nichts). Am Ende kommt die Endzeit dazu. Die Spur wird mit der Bestzeit und als "letzter Lauf" gespeichert.
//   Stelle k der Spur liegt bei strecke.startS + k x Abstand (k = 0 ist die Startlinie), der letzte Wert ist die Endzeit
//   (bei der Ziellinie strecke.zielS).
// Referenz: die Spur von Platz 1 (oder vom letzten Lauf), geladen beim Start des Laufs. Alte Bestzeiten ohne Spur:
// grob aus Start (0 s), den Zwischenzeiten der Checkpoints und der Endzeit, linear dazwischen.
// Anzeige: eigene Rennzeit minus Referenzzeit an der aktuellen Stelle s (linear zwischen den Werten), höchstens
// 5 Mal pro Sekunde neu, mit kleiner Hysterese (kein Flackern zwischen "0.0" und "+0.1").
// Liest nur (Stelle, Rennzeit), die Physik merkt nichts davon. Im Bildtakt entstehen keine neuen Objekte.
// Seit M6.1: Vergleich am Checkpoint (für die Farbe der Zwischenzeit-Meldung): eigene Zwischenzeit gegen die
// Zwischenzeit der Referenz an diesem Checkpoint, auf Hundertstel (wie der Zielbildschirm). Fehlt sie in der
// Referenz, die Referenzzeit an der Stelle des Checkpoints (wie der Live-Vergleich).

import { CONFIG } from './config.js';
import { hundertstel } from './bestzeiten.js';

export function baueVergleich(strecke, checkpoints) {
  const RA = CONFIG.rennablauf, V = CONFIG.hud.vergleich;
  const D = RA.spurAbstand;
  const s0 = strecke.startS, zielS = strecke.zielS;
  // so viele Stellen liegen vor der Ziellinie (die letzte immer echt davor, damit die Spur streng aufsteigt)
  const K = Math.max(1, Math.ceil((zielS - s0) / D));
  // Vorlauf beim Stehstart: Bei GO (Zeit 0) steht die Automitte so weit vor der Startlinie
  const vorlauf = CONFIG.grenze.wandHuelle.laenge / 2 + RA.schnauzeVorLinie;
  const runde = (t) => Math.round(t * 100) / 100;

  // --- Fahrspur des laufenden Laufs ---
  const zeiten = new Float64Array(K);
  const spur = {
    maxS: -Infinity,   // weitester Punkt (Meter) in diesem Lauf, nur während die Zeit läuft (auch für die Minimap)
    n: 0,              // so viele Stellen sind schon erreicht
    fertig: false,     // Ziel erreicht (Endzeit gemerkt)
    endZeit: 0,
    zeiten,
    anzahl: K + 1,     // Länge der fertigen Spur (Stellen + Endzeit)
  };

  let vorZeit = 0; // Rennzeit beim vorigen Schritt (die Stellen dazwischen werden genau eingepasst)

  function zuruecksetzen() {
    spur.maxS = -Infinity; spur.n = 0; spur.fertig = false; spur.endZeit = 0;
    zeiten.fill(0);
    vorZeit = 0;
    anzeige.sichtbar = false; anzeige.wert = 0; anzeige.stufe = 0; anzeige.uhr = 0; anzeige.version++;
    roh = 0;
  }

  // Nach jedem Physik-Schritt (main.js): s = Stelle des Autos, zeit = Rennzeit, zustand = rennen.zustand
  function schritt(s, zeit, zustand) {
    if (zustand !== 'laeuft' && !(zustand === 'ziel' && !spur.fertig && spur.maxS > -Infinity)) return;
    const vorMax = spur.maxS;
    if (s > spur.maxS) spur.maxS = s;
    // Neu erreichte Stellen: Zeitpunkt zwischen dem vorigen und diesem Schritt eingepasst (genauer als 1/120 s).
    // Springt das Auto über mehrere Stellen (z. B. über die Wiese auf den nächsten Ast), werden sie so verteilt.
    const bis = Math.min(K, Math.floor((spur.maxS - s0) / D) + 1); // Stellen 0 .. bis-1 sind erreicht
    for (let k = spur.n; k < bis; k++) {
      const f = vorMax > -Infinity && spur.maxS > vorMax ? Math.max(0, Math.min(1, (s0 + k * D - vorMax) / (spur.maxS - vorMax))) : 1;
      zeiten[k] = runde(vorZeit + (zeit - vorZeit) * f);
    }
    if (bis > spur.n) spur.n = bis;
    vorZeit = zeit;
    if (zustand === 'ziel') { spur.fertig = true; spur.endZeit = zeit; }
  }

  // Die fertige Spur als Zahlenliste (nur einmal am Ziel). Ohne vollständige Spur: null
  function fertigeSpur(endZeit) {
    if (spur.n < K) return null;
    const liste = Array.from(zeiten);
    liste.push(runde(endZeit));
    for (let i = 1; i < liste.length; i++) if (!(liste[i] > liste[i - 1])) return null; // muss streng steigen
    return liste;
  }

  // --- Referenz ---
  // Punkte (Stelle, Zeit), aufsteigend; Platz für die Spur oder die Näherung aus den Zwischenzeiten
  const refS = new Float64Array(K + 2 + checkpoints.length), refT = new Float64Array(K + 2 + checkpoints.length);
  const ref = { n: 0, art: null, quelle: null }; // art: 'spur' oder 'naeherung'; quelle: 'best' / 'letzter'
  const refCps = new Float64Array(checkpoints.length); // Zwischenzeiten der Referenz (NaN = fehlt), M6.1
  let cursor = 0;
  // eintrag: { zeit, cps, spur } oder null (keine Referenz)
  function setzeReferenz(eintrag, quelle) {
    ref.n = 0; ref.art = null; ref.quelle = quelle || null; cursor = 0;
    refCps.fill(NaN);
    if (!eintrag || !Number.isFinite(eintrag.zeit)) return false;
    if (Array.isArray(eintrag.cps)) for (let i = 0; i < refCps.length; i++) if (Number.isFinite(eintrag.cps[i])) refCps[i] = eintrag.cps[i];
    const sp = eintrag.spur;
    if (Array.isArray(sp) && sp.length === K + 1 && sp.every(Number.isFinite)) {
      for (let k = 0; k < K; k++) { refS[k] = s0 + k * D; refT[k] = sp[k]; }
      refS[K] = zielS; refT[K] = sp[K];
      ref.n = K + 1; ref.art = 'spur';
    } else {
      // Näherung: Start 0 s, Zwischenzeiten an den Checkpoints, Endzeit im Ziel
      let n = 0;
      refS[n] = s0; refT[n] = 0; n++;
      const cps = Array.isArray(eintrag.cps) ? eintrag.cps : [];
      checkpoints.forEach((cp, i) => {
        const z = cps[i];
        if (Number.isFinite(z) && z > refT[n - 1] && cp.s > refS[n - 1] && z < eintrag.zeit) { refS[n] = cp.s; refT[n] = z; n++; }
      });
      refS[n] = zielS; refT[n] = eintrag.zeit; n++;
      ref.n = n; ref.art = 'naeherung';
    }
    return true;
  }
  // Referenzzeit an der Stelle s (linear zwischen den Punkten). Vor der Startlinie (Stehstart): von 0 s bei GO
  // bis zum ersten Wert. Keine Referenz: NaN
  function referenzBei(s) {
    const n = ref.n;
    if (!n) return NaN;
    if (s <= refS[0]) {
      const a = refS[0] - vorlauf;
      return s <= a ? 0 : refT[0] * (s - a) / vorlauf;
    }
    if (s >= refS[n - 1]) return refT[n - 1];
    // das Auto bewegt sich von Bild zu Bild nur wenig: vom letzten Platz aus suchen
    let i = Math.min(cursor, n - 2);
    while (i > 0 && refS[i] > s) i--;
    while (i < n - 2 && refS[i + 1] < s) i++;
    cursor = i;
    const f = (s - refS[i]) / (refS[i + 1] - refS[i]);
    return refT[i] + (refT[i + 1] - refT[i]) * f;
  }

  // Am Checkpoint n mit der Zwischenzeit zeit (M6.1): -1 = schneller, 1 = langsamer, 0 = gleich (in Hundertstel)
  // oder keine Referenz. Hängt nicht davon ab, ob der Live-Vergleich angezeigt wird.
  function zwischenVergleich(n, zeit) {
    if (!ref.n || n < 0 || n >= checkpoints.length || !Number.isFinite(zeit)) return 0;
    const r = Number.isFinite(refCps[n]) ? refCps[n] : referenzBei(checkpoints[n].s);
    if (!Number.isFinite(r)) return 0;
    return Math.sign(hundertstel(zeit) - hundertstel(r));
  }

  // --- Anzeige: ruhig, höchstens alle hud.vergleich.aktualisieren Sekunden ---
  // stufe: -1 = schneller (grün, "-0.8"), 0 = gleich (weiss, "0.0"), 1 = langsamer (rot, "+1.2")
  // wert: angezeigter Betrag in Zehntel-Sekunden (ganze Zahl); version zählt bei jeder sichtbaren Änderung hoch
  const anzeige = { sichtbar: false, wert: 0, stufe: 0, uhr: 0, version: 0 };
  let roh = 0; // letzter ungerundeter Unterschied (für Tests)
  // dt = Zeit dieses Bildes (0 in der Pause), s = Stelle, zeit = Rennzeit, laeuft = Zeit läuft
  function aktualisiere(dt, s, zeit, laeuft) {
    const sichtbar = laeuft && ref.n > 0;
    if (!sichtbar) {
      if (anzeige.sichtbar) { anzeige.sichtbar = false; anzeige.version++; }
      anzeige.uhr = 0;
      return anzeige;
    }
    anzeige.uhr -= dt;
    if (anzeige.sichtbar && anzeige.uhr > 0) return anzeige;
    anzeige.uhr = V.aktualisieren;
    const d = zeit - referenzBei(s);
    roh = d;
    // Hysterese: die Stufe wechselt erst deutlich über/unter der Grenze nullBis
    const g = V.nullBis, h = V.hysterese;
    let st = anzeige.sichtbar ? anzeige.stufe : (d >= g ? 1 : d <= -g ? -1 : 0);
    if (st === 0) { if (d >= g + h) st = 1; else if (d <= -(g + h)) st = -1; } else if (st === 1) {
      if (d <= -(g + h)) st = -1; else if (d < g - h) st = 0;
    } else if (d >= g + h) st = 1; else if (d > -(g - h)) st = 0;
    // Betrag in Zehnteln; mit Vorzeichen nie "+0.0" / "-0.0". Auch die Zahl springt erst um, wenn der Unterschied
    // klar (Rundung + Hysterese) vom angezeigten Wert weg ist: kein Hin und Her zwischen 0.4 und 0.5
    let w = st === 0 ? 0 : Math.max(1, Math.round(Math.abs(d) * 10));
    if (anzeige.sichtbar && st === anzeige.stufe && st !== 0 && Math.abs(Math.abs(d) - anzeige.wert / 10) < 0.05 + h) w = anzeige.wert;
    if (!anzeige.sichtbar || w !== anzeige.wert || st !== anzeige.stufe) {
      anzeige.wert = w; anzeige.stufe = st; anzeige.sichtbar = true; anzeige.version++;
    }
    return anzeige;
  }

  zuruecksetzen();
  return {
    spur, ref, anzeige, K, abstand: D,
    zuruecksetzen, schritt, fertigeSpur, setzeReferenz, referenzBei, aktualisiere, zwischenVergleich, refCps,
    get roh() { return roh; },
  };
}
