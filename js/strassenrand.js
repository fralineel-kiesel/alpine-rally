// Strassenrand (Meilenstein 2a): Leitplanken, Holzzäune und Schilder.
//
// Alles wird beim Laden aus der Strecke abgeleitet, nichts ist von Hand pro Kurve
// gesetzt:
//   - Leitplanken: auf der Talseite, wo das Gelände stark abfällt, und aussen in den Kehren
//   - Holzzäune: an Wiesen (wenig Wald, keine Felswand), abwechselnd links/rechts, mit Weidetoren
//   - Schilder: Kurvenwarnungen vor engen Kurven, Kehren-Nummern, Richtungstafeln (Chevrons),
//     Steinschlag/Gefälle, Kilometertafeln; seit M2a.1 Tempo-Tafeln (aus der Krümmung abgeleitet,
//     reine Optik, kein Tempolimit), Kühe und Kreuzung im Tal
// Werte zum Schrauben: config.js, Block "strassenrand". Fester Zufall (seed): gleiche Strecke =
// gleiche Zäune.
//
// Regeln, die nie gebrochen werden:
//   - kein Randobjekt auf der Felswand-Seite
//   - kein Randobjekt auf der Innenseite der Kurven aus js/abkuerzungen.js ("nichtSchneiden"
//     und "schneiden", plus Puffer): Ob man abkürzen kann, entscheidet allein die Spielbalance
//   - nichts bei den Checkpoint-Toren und nichts nahe an einem anderen Ast der Strecke
//
// Gezeichnet wird alles mit einem Material (ein Bild mit allen Texturen, siehe pixel.js),
// in Stücken von ca. 130 m entlang der Strecke: ein Zeichenaufruf pro Stück, Stücke ausserhalb
// des Bildes oder weit weg werden übersprungen.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische, rauschen } from './util.js';
import { strassenrandAtlas } from './pixel.js';
import { baueKollision } from './kollision.js';

// Seitlicher Abstand der Randobjekte zur Strassenmitte (Vorderkante der Leitplanke), Meter.
// s = Streckenmeter, seite = -1 links / +1 rechts.
// Heute ein fester Wert aus config.js. Ab Meilenstein 3 (Schotter, Wiese, breitere Stellen)
// kann er hier je Abschnitt wechseln – Planken, Zäune und Schilder wandern dann automatisch mit.
export function randAbstand(s, seite) { // eslint-disable-line no-unused-vars
  return CONFIG.strassenrand.abstand;
}

// Weidetore (M2b): Prüft, ob ein Kreis (x, z, r) die Durchfahrt eines Tors frei lässt:
// mindestens "abstand" von der Lücke weg und nicht auf dem Weg "tiefe" Meter ins Feld dahinter.
// Für Kühe und Büsche. plan = Ergebnis von planeStrassenrand.
export function torPruefer(plan) {
  const tore = plan.tore.map((t) => {
    const s = (t.von + t.bis) / 2;
    const p = plan.punkt(s, t.seite * (randAbstand(s, t.seite) + CONFIG.strassenrand.zaun.versatz));
    return { x: p.x, z: p.z, ux: p.tx, uz: p.tz, nx: -p.tz * t.seite, nz: p.tx * t.seite, halb: (t.bis - t.von) / 2 };
  });
  return function torFrei(x, z, r, abstand, tiefe) {
    for (const t of tore) {
      const dx = x - t.x, dz = z - t.z;
      const entlang = Math.abs(dx * t.ux + dz * t.uz), quer = dx * t.nx + dz * t.nz;
      if (Math.hypot(Math.max(0, entlang - t.halb), quer) < abstand + r) return false;
      if (quer > -2 && quer < tiefe && entlang < t.halb + 1.5 + r) return false;
    }
    return true;
  };
}

const zwischen = (rnd, [a, b]) => mische(a, b, rnd());
const nr =(seite) => (seite > 0 ? 1 : 0);
const SEITEN = [-1, 1];

// Zusammenhängende Stücke (Indizes von..bis), in denen arr[i] gesetzt ist
function laeufe(arr, von = 0, bis = arr.length - 1) {
  const liste = [];
  let start = -1;
  for (let i = von; i <= bis + 1; i++) {
    const an = i <= bis && arr[i];
    if (an && start < 0) start = i;
    if (!an && start >= 0) { liste.push({ von: start, bis: i - 1 }); start = -1; }
  }
  return liste;
}

// =====================================================================
// Plan: wo steht was (ohne 3D-Objekte; die Tests brauchen das auch)
// =====================================================================
// kronen: Bäume mit Grösse { x, z, b } (für die Sichtprüfung der neuen Schilder, M2a.1)
export function planeStrassenrand(strecke, welt, pflanzenHindernisse = [], kronen = []) {
  const c = CONFIG.strassenrand;
  const n = strecke.anzahl;
  const { px, py, pz, tx, tz } = strecke;
  // eigener Zufall für Planken und Zäune: eine Änderung an den Planken würfelt die Zäune nicht neu
  const rndPlanke = zufall(c.seed), rnd = zufall(c.seed + 101);
  const q = {}, q2 = {}, P = {};

  // Punkt bei s Metern, lat Meter neben der Mitte (+ = rechts). Ergebnis in ziel.
  function punkt(s, lat, ziel = {}) {
    const f = Math.max(0, Math.min(n - 1.001, s));
    const i = Math.floor(f), t = f - i, j = i + 1;
    const ux = tx[i] + (tx[j] - tx[i]) * t, uz = tz[i] + (tz[j] - tz[i]) * t;
    const l = Math.hypot(ux, uz) || 1;
    ziel.tx = ux / l; ziel.tz = uz / l;
    ziel.x = px[i] + (px[j] - px[i]) * t - ziel.tz * lat;
    ziel.z = pz[i] + (pz[j] - pz[i]) * t + ziel.tx * lat;
    ziel.h = py[i] + (py[j] - py[i]) * t;
    return ziel;
  }
  const idx = (s) => Math.max(0, Math.min(n - 1, Math.round(s)));

  // --- Krümmung (+ = Rechtskurve) ------------------------------------------
  const kr = new Float32Array(n);
  for (let i = 3; i < n - 3; i++) {
    kr[i] = ((tx[i + 3] - tx[i - 3]) * -tz[i] + (tz[i + 3] - tz[i - 3]) * tx[i]) / 6;
  }
  // Kurven: Stücke mit gleicher Richtung, die mehr als nur leicht gebogen sind
  function kurven(minK) {
    const liste = [];
    let cur = null;
    for (let i = 3; i < n - 3; i++) {
      const sg = Math.sign(kr[i]);
      if (Math.abs(kr[i]) > minK && cur && cur.richtung === sg) {
        cur.bis = i; cur.maxK = Math.max(cur.maxK, Math.abs(kr[i])); cur.winkel += kr[i];
      } else if (Math.abs(kr[i]) > minK) {
        cur = { von: i, bis: i, richtung: sg, maxK: Math.abs(kr[i]), winkel: kr[i] };
        liste.push(cur);
      } else cur = null;
    }
    for (const k of liste) k.winkel = Math.abs(k.winkel) * 180 / Math.PI;
    return liste.filter((k) => k.bis - k.von >= 5);
  }

  // --- Sperrzonen ---------------------------------------------------------
  // Innenseite der Abkürzungs-Kurven (plus Puffer): kein Zaun, keine Planke, kein Schild
  const innenFrei = [new Uint8Array(n), new Uint8Array(n)];
  for (const [liste, puffer] of [[strecke.nichtSchneiden, c.puffer], [strecke.schneiden, c.pufferSchneiden]]) {
    for (const k of liste) {
      const sd = k.seite === 'rechts' ? 1 : -1;
      for (let i = idx(k.sVon - puffer); i <= idx(k.sBis + puffer); i++) innenFrei[nr(sd)][i] = 1;
    }
  }
  // Checkpoint-Tore (Pfosten stehen bei 6.2 m)
  const cpZone = new Uint8Array(n);
  for (const cp of CONFIG.checkpoints.beiMeter) for (let i = idx(cp - c.cpFrei); i <= idx(cp + c.cpFrei); i++) cpZone[i] = 1;
  // Felswand-Seite (mit 5 m Rand)
  const wand = [new Uint8Array(n), new Uint8Array(n)];
  for (let i = 0; i < n; i++) {
    const ws = strecke.wandSeite[i];
    if (ws) for (let j = Math.max(0, i - 5); j <= Math.min(n - 1, i + 5); j++) wand[nr(ws)][j] = 1;
  }
  // Steht ein Punkt bei Abstand lat wirklich neben DIESEM Stück Strasse (und nicht nahe an
  // einem anderen Ast, z. B. der nächsten Kehre)?
  function eigenerAst(s, lat) {
    punkt(s, lat, P);
    strecke.abfrage(P.x, P.z, q);
    if (Math.abs(q.s - s) > 4 || q.abstand < Math.abs(lat) - 0.3) return false;
    return !strecke.andererAst(P.x, P.z, s, 30, Math.abs(lat) + 2.5, q2);
  }
  const grundFrei = (sd, i) => !wand[nr(sd)][i] && !innenFrei[nr(sd)][i] && !cpZone[i];
  // Bäume, Steine und Sperren (damit Lücken und Schilder nicht in einen Baum führen)
  const kolBasis = baueKollision(pflanzenHindernisse);

  // --- Kehren (Spitzkehren) --------------------------------------------------
  const kehren = kurven(1 / c.planke.kehrenRadius).map((k, j) => ({
    nr: j + 1, von: k.von, bis: k.bis, innen: k.richtung, aussen: -k.richtung, winkel: k.winkel,
  }));
  const kehreAussen = [new Uint8Array(n), new Uint8Array(n)];
  for (const k of kehren) {
    for (let i = idx(k.von - c.planke.kehreVorNach); i <= idx(k.bis + c.planke.kehreVorNach); i++) kehreAussen[nr(k.aussen)][i] = 1;
  }

  // =====================================================================
  // 1. Leitplanken
  // =====================================================================
  const cp = c.planke;
  const plankeOk = [new Uint8Array(n), new Uint8Array(n)];
  const planke = [new Uint8Array(n), new Uint8Array(n)];
  for (const sd of SEITEN) {
    for (let i = 0; i < n; i++) {
      if (!grundFrei(sd, i)) continue;
      const L = randAbstand(i, sd);
      if (!eigenerAst(i, sd * L)) continue;
      plankeOk[nr(sd)][i] = 1;
      // fällt das Gelände hinter der Planke ab?
      const h = punkt(i, 0, P).h;
      punkt(i, sd * (L + cp.abhangWeite), P);
      const g1 = welt.gelaendeHoehe(P.x, P.z);
      punkt(i, sd * (L + cp.abhangWeite / 2), P);
      const g2 = welt.gelaendeHoehe(P.x, P.z);
      if (h - Math.min(g1, g2) >= cp.abhangHoehe || kehreAussen[nr(sd)][i]) planke[nr(sd)][i] = 1;
    }
  }
  const plankenLaeufe = [];
  for (const sd of SEITEN) {
    const a = planke[nr(sd)], ok = plankeOk[nr(sd)];
    // kurze Lücken schliessen (nur wo eine Planke stehen darf)
    for (const l of laeufe(a.map((v) => 1 - v))) {
      if (l.von === 0 || l.bis === n - 1 || l.bis - l.von + 1 > cp.lueckeFuellen) continue;
      let alleOk = true;
      for (let i = l.von; i <= l.bis; i++) if (!ok[i]) alleOk = false;
      if (alleOk) for (let i = l.von; i <= l.bis; i++) a[i] = 1;
    }
    // kurze Stücke weg, lange ab und zu für eine Zufahrt unterbrechen
    for (const l of laeufe(a)) {
      if (l.bis - l.von < cp.mindestLaenge) continue;
      let start = l.von;
      let naechste = start + zwischen(rndPlanke, cp.zufahrtAlle);
      while (naechste + cp.zufahrt[1] + cp.mindestLaenge < l.bis) {
        const lang = zwischen(rndPlanke, cp.zufahrt);
        const iz = Math.round(naechste);
        // keine Zufahrt in einer Kehre, und hinter der Lücke muss Platz sein (kein Baum, kein Stein)
        let ok = true;
        for (let i = iz - 5; i <= iz + lang + 5; i++) if (kehreAussen[nr(sd)][idx(i)]) ok = false;
        for (let i = iz; i <= iz + lang && ok; i += 1.5) {
          for (const d of [1.5, 3]) {
            punkt(i, sd * (randAbstand(i, sd) + d), P);
            if (!kolBasis.frei(P.x, P.z, 1.0)) ok = false;
          }
        }
        if (ok && naechste - start >= cp.mindestLaenge) {
          plankenLaeufe.push({ seite: sd, von: start, bis: naechste });
          start = naechste + lang;
          naechste += lang + zwischen(rndPlanke, cp.zufahrtAlle);
        } else naechste += 8; // hier geht es nicht: etwas weiter versuchen
      }
      plankenLaeufe.push({ seite: sd, von: start, bis: l.bis });
    }
  }
  if (!cp.an) plankenLaeufe.length = 0;
  const hatPlanke = [new Uint8Array(n), new Uint8Array(n)];
  for (const l of plankenLaeufe) for (let i = idx(l.von); i <= idx(l.bis); i++) hatPlanke[nr(l.seite)][i] = 1;

  // =====================================================================
  // 2. Holzzäune an Wiesen
  // =====================================================================
  const cz = c.zaun;
  const wiese = [new Uint8Array(n), new Uint8Array(n)];
  for (const sd of SEITEN) {
    for (let i = 0; i < n; i++) {
      if (strecke.waldAnteil[i] > cz.waldMax || strecke.wandSeite[i] || !grundFrei(sd, i)) continue;
      let planNah = false;
      for (let j = Math.max(0, i - 6); j <= Math.min(n - 1, i + 6); j++) if (hatPlanke[nr(sd)][j]) planNah = true;
      if (planNah) continue;
      const L = randAbstand(i, sd) + cz.versatz;
      if (!eigenerAst(i, sd * L)) continue;
      const h = punkt(i, sd * L, P).h;
      const g0 = welt.gelaendeHoehe(P.x, P.z);
      punkt(i, sd * (L + 4), P);
      const g1 = welt.gelaendeHoehe(P.x, P.z);
      if (Math.abs(g1 - g0) > cz.steilMax || Math.abs(g0 - h) > 1.2) continue;
      wiese[nr(sd)][i] = 1;
    }
  }
  const zaunLaeufe = [], tore = [];
  let letzteSeite = rnd() < 0.5 ? -1 : 1;
  const wieseBisher = { alle: 0, zaun: 0 };
  for (let s = 0; s < n;) {
    const von = s, bis = Math.min(n - 1, Math.round(s + zwischen(rnd, cz.feldLaenge)));
    s = bis + Math.round(zwischen(rnd, [3, 10])); // Ecke zwischen zwei Feldern
    const wieseIn = (sd) => laeufe(wiese[nr(sd)], von, bis).filter((l) => l.bis - l.von >= 10);
    const meter = (sd) => wieseIn(sd).reduce((m, l) => m + l.bis - l.von, 0);
    if (meter(-1) < 10 && meter(1) < 10) continue;
    // Zaun ja/nein: so, dass am Ende ungefähr "quote" der Wiese eingezäunt ist (mit etwas Zufall)
    let feldWiese = 0;
    for (let i = von; i <= bis; i++) if (wiese[0][i] || wiese[1][i]) feldWiese++;
    const bisher = (wieseBisher.zaun + feldWiese * 0.5) / (wieseBisher.alle + feldWiese);
    wieseBisher.alle += feldWiese;
    if (bisher > cz.quote + (rnd() - 0.5) * 0.3) continue;
    const zaunVorher = zaunLaeufe.length, toreVorher = tore.length;
    // abwechselnd links/rechts, selten beide (sonst wirkt es wie ein Korridor)
    let seiten = rnd() < cz.beideSeiten ? [-1, 1] : [-letzteSeite];
    // auf der gewünschten Seite keine Wiese: manchmal die andere Seite, sonst bleibt das Feld offen
    if (seiten.length === 1 && meter(seiten[0]) < 10) {
      if (rnd() < 0.5) continue;
      seiten = [-seiten[0]];
    }
    if (seiten.length === 1) letzteSeite = seiten[0];
    for (const sd of seiten) {
      for (const l of wieseIn(sd)) {
        // Weidetore: Lücken mit Torpfosten, manche mit offenem Tor
        const latten = rnd() < 0.5 ? 2 : 3;
        let start = l.von, tor = start + zwischen(rnd, cz.torAlle);
        // hinter dem Tor muss Platz sein (kein Baum, kein Stein in der Einfahrt)
        const torFrei = (a, b) => {
          for (let i = a; i <= b; i += 1) {
            for (const d of [1.5, 4]) {
              punkt(i, sd * (randAbstand(i, sd) + cz.versatz + d), P);
              if (!kolBasis.frei(P.x, P.z, 1.0)) return false;
            }
          }
          return true;
        };
        while (tor + cz.tor[1] + 8 < l.bis) {
          const b = zwischen(rnd, cz.tor);
          if (!torFrei(tor, tor + b)) { tor += 5; continue; }
          if (tor - start >= 6) {
            zaunLaeufe.push({ seite: sd, von: start, bis: tor, latten, torEnde: true, torAnfang: start !== l.von });
            tore.push({ seite: sd, von: tor, bis: tor + b, offen: rnd() < cz.torOffen, winkel: zwischen(rnd, [80, 105]), anfang: rnd() < 0.5 });
            start = tor + b;
          }
          tor += b + zwischen(rnd, cz.torAlle);
        }
        zaunLaeufe.push({ seite: sd, von: start, bis: l.bis, latten, torEnde: false, torAnfang: start !== l.von });
      }
    }
    // wie viel Wiese in diesem Feld hat jetzt wirklich einen Zaun (oder ein Tor)?
    const neu = [...zaunLaeufe.slice(zaunVorher), ...tore.slice(toreVorher)];
    for (let i = von; i <= bis; i++) {
      if ((wiese[0][i] || wiese[1][i]) && neu.some((z) => i >= z.von && i <= z.bis)) wieseBisher.zaun++;
    }
  }
  if (!cz.an) { zaunLaeufe.length = 0; tore.length = 0; }
  // Anteil der Wiese mit Zaun (links oder rechts)
  let wiesenMeter = 0, zaunMeter = 0;
  {
    const z = new Uint8Array(n);
    for (const l of [...zaunLaeufe, ...tore]) for (let i = idx(l.von); i <= idx(l.bis); i++) z[i] = 1;
    for (let i = 0; i < n; i++) {
      if (wiese[0][i] || wiese[1][i]) { wiesenMeter++; if (z[i]) zaunMeter++; }
    }
  }

  // =====================================================================
  // 3. Schilder
  // =====================================================================
  const cs = c.schilder;
  const G = cs.groesse || 1;            // alle Schilder etwas grösser (M2a.1, Lesbarkeit im kleinen Bild)
  const W = cs.warnGroesse * G;         // Kantenlänge der Warn-Dreiecke
  const schilder = [];
  // Freien Platz für ein Schild suchen: erst an der Wunschstelle, dann etwas davor/danach,
  // dann (falls erlaubt) auf der anderen Seite
  // abstandAlle: so viele Meter Abstand zu jedem anderen Schild (beide Seiten, gegen Schilderwälder)
  // versuche: eigene Liste der Verschiebungen (Meter), z. B. nur nach vorne
  // sicht: der Fahrer muss das Schild sehen (kein Baum davor, siehe sichtbar)
  // ausser: Schilder, die für abstandAlle nicht zählen (bewusst gepaart: Warnung + Tempo derselben Stelle)
  function platz(sWunsch, seiteWunsch, { andereSeite = true, schieben = 20, gruppe = null, abstandAlle = 0, versuche = null, sicht = false, ausser = [] } = {}) {
    if (!versuche) {
      versuche = [0];
      for (let d = 3; d <= schieben; d += 3) versuche.push(d, -d);
    }
    for (const sd of andereSeite ? [seiteWunsch, -seiteWunsch] : [seiteWunsch]) {
      for (const ds of versuche) {
        const s = sWunsch + ds, i = Math.round(s);
        if (i < 2 || i > n - 3 || !grundFrei(sd, i)) continue;
        const lat = randAbstand(s, sd) + cs.versatz;
        if (!eigenerAst(s, sd * lat)) continue;
        punkt(s, sd * lat, P);
        if (!kolBasis.frei(P.x, P.z, 1.0)) continue;
        const zuNah = schilder.some((o) => o.seite === sd &&
          Math.abs(o.s - s) < (gruppe != null && o.gruppe === gruppe ? 3 : gruppe != null || o.gruppe != null ? 5 : cs.mindestAbstand));
        if (zuNah) continue;
        if (abstandAlle && schilder.some((o) => !ausser.includes(o) && Math.abs(o.s - s) < abstandAlle)) continue;
        if (sicht && !sichtbar(s, P.x, P.z)) continue;
        if (tore.some((t) => t.seite === sd && s > t.von - 1.5 && s < t.bis + 1.5)) continue;
        return { s, seite: sd, x: P.x, z: P.z };
      }
    }
    return null;
  }
  // Sieht der Fahrer das Schild? Von der Strassenmitte sichtWeite Meter davor bis zum Schild
  // darf keine Baumkrone (halbe Breite des Baums plus sichtFrei) auf der Sichtlinie liegen.
  function sichtbar(s, x, z) {
    const v = punkt(s - cs.sichtWeite, 0, {});
    const nah = kronen.filter((k) => Math.hypot(k.x - x, k.z - z) < cs.sichtWeite + 10);
    for (let f = 0.25; f <= 1.0001; f += 0.05) {
      const px2 = v.x + (x - v.x) * f, pz2 = v.z + (z - v.z) * f;
      if (nah.some((k) => Math.hypot(k.x - px2, k.z - pz2) < k.b * 0.5 + cs.sichtFrei)) return false;
    }
    return true;
  }
  // Schild aufstellen: schaut zur Strasse etwas vor ihm (dort kommt der Fahrer her)
  function stelle(ort, art, tafeln, gruppe = null) {
    if (!ort) return null;
    const ziel = punkt(ort.s - cs.blickVor, 0, {});
    let dx = ziel.x - ort.x, dz = ziel.z - ort.z;
    const l = Math.hypot(dx, dz) || 1;
    dx /= l; dz /= l;
    const sch = { art, ...ort, dx, dz, tafeln, gruppe, y: welt.gelaendeHoehe(ort.x, ort.z) };
    schilder.push(sch);
    return sch;
  }

  if (cs.an) {
    // a) Richtungstafeln (Chevrons) aussen in sehr engen Kurven
    let gruppe = 0;
    for (const k of cs.chevrons ? kurven(1 / cs.chevronRadius) : []) {
      const aussen = -k.richtung;
      const anzahl = k.winkel < 90 ? cs.chevronAnzahl[0] : k.winkel < 200 ? cs.chevronAnzahl[0] + 1 : cs.chevronAnzahl[1];
      gruppe++;
      for (let j = 0; j < anzahl; j++) {
        const s = mische(k.von, k.bis, (j + 0.5) / anzahl);
        stelle(platz(s, aussen, { andereSeite: false, schieben: 4, gruppe }), 'chevron', [{
          kachel: 'chevron', b: cs.chevronGroesse[0] * G, h: cs.chevronGroesse[1] * G, unten: cs.chevronHoehe,
          spiegeln: k.richtung > 0, form: 'rechteck',
        }], gruppe);
      }
    }
    // b) Kehren-Nummern an der Kehre (aussen, kurz vor der Kehre)
    for (const k of kehren) {
      stelle(platz(k.von - 6, k.aussen, { andereSeite: false, schieben: 9 }), 'kehre', [{
        kachel: `kehre${k.nr}`, b: cs.kehreGroesse[0] * G, h: cs.kehreGroesse[1] * G, unten: 1.3, form: 'rechteck',
      }]);
    }
    // c) Kurvenwarnungen vor engen Kurven (eine Folge enger Kurven = ein Schild "Doppelkurve")
    const eng = kurven(1 / 400).filter((k) => k.maxK > 1 / cs.warnRadius);
    const folgen = [];
    for (const k of eng) {
      const f = folgen[folgen.length - 1];
      if (f && k.von - f.bis < cs.gruppenLuecke) { f.bis = k.bis; f.anzahl++; f.maxK = Math.max(f.maxK, k.maxK); } else folgen.push({ von: k.von, bis: k.bis, richtung: k.richtung, anzahl: 1, maxK: k.maxK });
    }
    const warnungen = [];
    for (const f of folgen) {
      const mitte = (cs.warnVor[0] + cs.warnVor[1]) / 2;
      const kachel = f.anzahl > 1 ? 'warnDoppel' : 'warnKurve';
      const sch = stelle(platz(f.von - mitte, 1, { schieben: (cs.warnVor[1] - cs.warnVor[0]) / 2 }), 'warnung', [{
        kachel, b: W, h: W * 0.875, unten: cs.warnHoehe, spiegeln: f.richtung < 0, form: 'dreieck',
      }]);
      warnungen.push({ ...f, art: kachel === 'warnDoppel' ? 'Doppelkurve' : 'Kurve', schild: sch });
    }
    // d) Gefahr-Schilder: Steinschlag vor Felswänden, Gefälle vor der Abfahrt.
    //    Liegen zwei nahe beisammen, kommen sie übereinander an einen Pfosten.
    const gefahren = [];
    for (const l of laeufe(Uint8Array.from(strecke.wandSeite, (v) => (v ? 1 : 0)))) {
      if (l.bis - l.von > 50) gefahren.push({ s: l.von - cs.gefahrVor, kachel: 'warnStein' });
    }
    {
      let bergab = false;
      const w = cs.gefaelleStrecke;
      // Beginn einer langen Abfahrt: hier geht es schon bergab, und über die nächsten
      // gefaelleStrecke Meter im Mittel mehr als gefaelleAb
      for (let i = 0; i + w < n; i += 2) {
        const steigung = (py[i + w] - py[i]) / w, jetzt = (py[i + 20] - py[i]) / 20;
        if (!bergab && steigung < -cs.gefaelleAb && jetzt < -cs.gefaelleAb * 0.6) {
          gefahren.push({ s: i - cs.gefahrVor, kachel: 'warnGefaelle' });
          bergab = true;
        }
        if (bergab && steigung > -0.02) bergab = false;
      }
    }
    gefahren.sort((a, b) => a.s - b.s);
    for (let j = 0; j < gefahren.length; j++) {
      const g = gefahren[j], tafeln = [g.kachel];
      while (j + 1 < gefahren.length && gefahren[j + 1].s - g.s < 50) tafeln.push(gefahren[++j].kachel);
      stelle(platz(g.s, 1, { schieben: 21 }), 'gefahr', tafeln.map((k, t) => ({
        kachel: k, b: W, h: W * 0.875, unten: cs.warnHoehe + t * (W * 0.875 + 0.08), form: 'dreieck',
      })));
    }
    // e) Kilometertafeln alle 500 m
    for (let s = cs.kmAlle; s < strecke.laenge - 30; s += cs.kmAlle) {
      const zahl = (s / 1000).toFixed(1);
      stelle(platz(s, 1, { schieben: 30 }), 'km', [{
        kachel: `km${zahl}`, b: cs.kmGroesse[0] * G, h: cs.kmGroesse[1] * G, unten: cs.kmHoehe, form: 'rechteck', zahl,
      }]);
    }

    // f) Tempo-Tafeln (M2a.1, reine Optik): aus den Kurvenfolgen abgeleitet.
    //    Talabschnitt am Start, vor einer Kehrengruppe, vor einer engen Passage (enger als
    //    engRadius), und wieder aufheben, wenn danach lange keine enge Kurve mehr kommt.
    //    Rechts in Fahrtrichtung, mit Abstand zu allen anderen Schildern. Geht das nicht (z. B.
    //    Felswand rechts), kommt die Tafel unter die Kurvenwarnung derselben Stelle.
    const tc = cs.tempo;
    const tempo = [];
    // Verschiebungen für platz(): nur nach vorne / nur nach hinten (Meter)
    const vorne = (bis) => { const v = []; for (let d = 0; d <= bis; d += 3) v.push(d); return v; };
    const hinten = (bis) => { const v = []; for (let d = 0; d <= bis; d += 3) v.push(-d); return v; };
    if (tc && tc.an) {
      const D = tc.groesse * G;
      const tafel = (wert, unten = tc.hoehe) => ({ kachel: `tempo${wert}`, b: D, h: D, unten, form: 'kreis', zahl: wert });
      const wuensche = [{ s: strecke.startS + tc.startNach, wert: tc.tal, wo: 'Talabschnitt', versuche: vorne(60) }];
      folgen.forEach((f, j) => {
        const kehre = kehren.some((k) => k.von >= f.von - 1 && k.bis <= f.bis + 1);
        const wert = kehre ? tc.kehren : 1 / f.maxK < tc.engRadius ? tc.eng : null;
        if (!wert) return;
        wuensche.push({ s: f.von - tc.vor[0], wert, wo: kehre ? 'vor den Kehren' : 'vor enger Passage', versuche: hinten(tc.vor[1] - tc.vor[0]), folge: f });
        const naechste = folgen[j + 1];
        if ((naechste ? naechste.von : n) - f.bis >= tc.aufhebenNach) {
          wuensche.push({ s: f.bis + tc.nach[0], wert: tc.aufheben, wo: 'nach der Folge (aufheben)', versuche: vorne(tc.nach[1] - tc.nach[0]) });
        }
      });
      for (const w of wuensche.slice(0, tc.max)) {
        // Die Kurvenwarnung derselben Folge gehört dazu (bewusst gepaart): für sie gilt abstandNeu nicht
        const warn = w.folge && warnungen.find((x) => x.von === w.folge.von && x.schild);
        const ausser = warn ? [warn.schild] : [];
        // 1. rechts, eigener Pfosten
        const ort = platz(w.s, 1, { andereSeite: false, versuche: w.versuche, abstandAlle: cs.abstandNeu, sicht: true, ausser });
        if (ort) { tempo.push({ ...w, schild: stelle(ort, 'tempo', [tafel(w.wert)]) }); continue; }
        // 2. unter die Kurvenwarnung (gleicher Pfosten), wenn man diese gut sieht
        if (warn && tc.zurWarnung && sichtbar(warn.schild.s, warn.schild.x, warn.schild.z)) {
          const sch = warn.schild, t0 = sch.tafeln[0];
          sch.tafeln = [tafel(w.wert, tc.hoehePaar), { ...t0, unten: tc.hoehePaar + D + 0.08 }];
          tempo.push({ ...w, schild: sch, gepaart: true });
          continue;
        }
        // 3. links, eigener Pfosten
        const links = platz(w.s, -1, { andereSeite: false, versuche: w.versuche, abstandAlle: cs.abstandNeu, sicht: true, ausser });
        if (links) tempo.push({ ...w, schild: stelle(links, 'tempo', [tafel(w.wert)]) });
      }
    }
    schilder.tempo = tempo;

    // g) Kühe und Kreuzung im Talabschnitt (M2a.1). Kreuzung: vor dem ersten offenen Weidetor
    //    (dort mündet ein Feldweg ein). Kühe: vor der Wiese mit den meisten Zäunen im Tal.
    if (cs.talSchilder) {
      const talBis = (folgen.find((f) => kehren.some((k) => k.von >= f.von - 1 && k.bis <= f.bis + 1)) || { von: n }).von - 100;
      const tor = tore.filter((t) => t.offen && t.von < talBis).sort((a, b) => a.von - b.von)[0];
      const dreieck = (kachel) => [{ kachel, b: W, h: W * 0.875, unten: cs.warnHoehe, form: 'dreieck' }];
      if (tor) stelle(platz(tor.von - cs.gefahrVor, tor.seite, { schieben: 30, abstandAlle: cs.abstandNeu, sicht: true }), 'gefahr', dreieck('warnKreuzung'));
      // Zäune im Tal zu Wiesen zusammenfassen (Lücken unter 60 m), die mit den meisten Zaunmetern nehmen
      const wiesen = [];
      for (const l of zaunLaeufe.filter((z) => z.bis < talBis).sort((a, b) => a.von - b.von)) {
        const w = wiesen[wiesen.length - 1];
        if (w && l.von - w.bis < 60) { w.bis = Math.max(w.bis, l.bis); w.meter += l.bis - l.von; } else wiesen.push({ von: l.von, bis: l.bis, meter: l.bis - l.von });
      }
      const weide = wiesen.sort((a, b) => b.meter - a.meter)[0];
      if (weide) stelle(platz(weide.von - cs.gefahrVor, 1, { versuche: hinten(90).concat(vorne(30)), abstandAlle: cs.abstandNeu, sicht: true }), 'gefahr', dreieck('warnKuh'));
    }
    schilder.warnungen = warnungen;
  }

  return {
    plankenLaeufe, zaunLaeufe, tore, schilder, kehren, punkt,
    wiesenMeter, zaunMeter,
    innenFrei, // für Tests: hier darf nichts stehen
  };
}

// =====================================================================
// Aufbau: Geometrie, Kollisionskreise, Sichtbarkeit
// =====================================================================
export function baueStrassenrand(szene, strecke, welt, pflanzen) {
  const t0 = performance.now();
  const c = CONFIG.strassenrand;
  const plan = planeStrassenrand(strecke, welt, pflanzen ? pflanzen.hindernisse : [],
    pflanzen ? [...pflanzen.tannen, ...pflanzen.laubbaeume] : []);
  const tPlan = performance.now() - t0;
  const { punkt } = plan;
  const rndPlanke = zufall(c.seed + 1), rnd = zufall(c.seed + 2); // Helligkeit, kaputte Latten, schiefe Pfosten
  const kmZahlen = plan.schilder.filter((s) => s.art === 'km').map((s) => s.tafeln[0].zahl);
  const tempoZahlen = [...new Set(plan.schilder.flatMap((s) => s.tafeln.filter((t) => t.form === 'kreis').map((t) => t.zahl)))];
  const atlas = strassenrandAtlas(kmZahlen, Math.max(4, plan.kehren.length), 61, tempoZahlen);
  const hindernisse = [];
  const gelaende = (x, z) => welt.gelaendeHoehe(x, z);

  // --- Geometrie in Stücken entlang der Strecke --------------------------------
  const stuecke = new Map();
  function stueck(s) {
    const k = Math.max(0, Math.floor(s / c.stueckLaenge));
    if (!stuecke.has(k)) stuecke.set(k, { pos: [], uv: [], col: [], idx: [] });
    return stuecke.get(k);
  }
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vn = new THREE.Vector3();
  // Viereck a-b-c-d (unten links, unten rechts, oben rechts, oben links), schaut in Richtung
  // "blick" (nur diese Seite wird gezeichnet). Texturbereich: Kachel, optional nur ein Teil davon.
  function viereck(st, a, b, cc, d, kachel, blick, hell = 1, spiegeln = false, teil = null) {
    const t = atlas.kachel(kachel);
    let u0 = t.u0, u1 = t.u1, v0 = t.v0, v1 = t.v1;
    if (teil) {
      const du = t.u1 - t.u0, dv = t.v1 - t.v0;
      [u0, u1, v0, v1] = [t.u0 + du * teil[0], t.u0 + du * teil[1], t.v0 + dv * teil[2], t.v0 + dv * teil[3]];
    }
    if (spiegeln) [u0, u1] = [u1, u0];
    const basis = st.pos.length / 3;
    st.pos.push(...a, ...b, ...cc, ...d);
    st.uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
    for (let k = 0; k < 4; k++) st.col.push(hell, hell, hell);
    va.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    vb.set(d[0] - a[0], d[1] - a[1], d[2] - a[2]);
    vn.crossVectors(va, vb);
    if (vn.x * blick[0] + vn.y * blick[1] + vn.z * blick[2] >= 0) st.idx.push(basis, basis + 1, basis + 2, basis, basis + 2, basis + 3);
    else st.idx.push(basis, basis + 2, basis + 1, basis, basis + 3, basis + 2);
  }
  // Pfosten: Quader (4 Seiten + Deckel), unten Mitte (x, y, z), entlang (ux, uz),
  // kipp = Verschiebung der Oberseite (schiefer Pfosten)
  function pfosten(st, x, y, z, ux, uz, breite, hoehe, kachel, hell = 1, kipp = [0, 0]) {
    const rx = -uz, rz = ux, b = breite / 2;
    const ecke = (a, r, oben) => [
      x + ux * a * b + rx * r * b + (oben ? kipp[0] : 0), y + (oben ? hoehe : 0), z + uz * a * b + rz * r * b + (oben ? kipp[1] : 0),
    ];
    const seiten = [[[-1, -1], [1, -1], [-rx, -rz]], [[1, -1], [1, 1], [ux, uz]], [[1, 1], [-1, 1], [rx, rz]], [[-1, 1], [-1, -1], [-ux, -uz]]];
    for (const [[a1, r1], [a2, r2], [bx, bz]] of seiten) {
      viereck(st, ecke(a1, r1, false), ecke(a2, r2, false), ecke(a2, r2, true), ecke(a1, r1, true), kachel, [bx, 0, bz], hell);
    }
    viereck(st, ecke(-1, -1, true), ecke(1, -1, true), ecke(1, 1, true), ecke(-1, 1, true), kachel, [0, 1, 0], hell * 0.9, false, [0, 1, 0.8, 1]);
  }
  // Kollisionskreise entlang einer Linie
  function kreisLinie(ax, az, bx, bz, r, abstand, art) {
    const l = Math.hypot(bx - ax, bz - az), m = Math.max(1, Math.round(l / abstand));
    for (let k = 0; k <= m; k++) hindernisse.push({ x: ax + ((bx - ax) * k) / m, z: az + ((bz - az) * k) / m, r, rand: art });
  }

  // --- 1. Leitplanken ----------------------------------------------------------
  const cp = c.planke;
  const A = {}, B = {};
  let plankenMeter = 0;
  for (const l of plan.plankenLaeufe) {
    const sd = l.seite;
    const laenge = l.bis - l.von;
    plankenMeter += laenge;
    const ende = Math.min(cp.endeLaenge, laenge / 4);
    const m = Math.max(1, Math.round((laenge - 2 * ende) / cp.pfostenAbstand));
    // Stützpunkte: Abschluss-Ende, Pfosten ..., Abschluss-Ende
    const punkte = [];
    for (let j = -1; j <= m + 1; j++) {
      const s = j < 0 ? l.von : j > m ? l.bis : l.von + ende + ((laenge - 2 * ende) * j) / m;
      const amEnde = j < 0 || j > m;
      const L = randAbstand(s, sd) + (amEnde ? cp.endeAbwinkeln : 0);
      const p = punkt(s, sd * L, {});
      const g = gelaende(p.x, p.z);
      // Oberkante: am Ende auf Bodenhöhe abgesenkt
      p.oben = amEnde ? g + 0.02 : g + cp.hoehe;
      p.g = g; p.s = s; p.pfosten = !amEnde; p.j = j;
      punkte.push(p);
    }
    // aussen = von der Strasse weg
    for (let j = 0; j < punkte.length - 1; j++) {
      const a = punkte[j], b = punkte[j + 1];
      const st = stueck((a.s + b.s) / 2);
      const ox = -a.tz * sd, oz = a.tx * sd;       // nach aussen
      const ox2 = -b.tz * sd, oz2 = b.tx * sd;
      const d = 0.05;                              // Dicke des Blechs
      const hell = 0.92 + rndPlanke() * 0.12;
      const au = [a.x, a.oben - cp.profil, a.z], ao = [a.x, a.oben, a.z];
      const bu = [b.x, b.oben - cp.profil, b.z], bo = [b.x, b.oben, b.z];
      const au2 = [a.x + ox * d, a.oben - cp.profil, a.z + oz * d], ao2 = [a.x + ox * d, a.oben, a.z + oz * d];
      const bu2 = [b.x + ox2 * d, b.oben - cp.profil, b.z + oz2 * d], bo2 = [b.x + ox2 * d, b.oben, b.z + oz2 * d];
      // vorne (zur Strasse), hinten, oben
      const zurStrasse = [-ox, 0, -oz];
      viereck(st, au, bu, bo, ao, 'planke', zurStrasse, hell);
      viereck(st, bu2, au2, ao2, bo2, 'planke', [ox, 0, oz], hell * 0.85);
      viereck(st, ao, bo, bo2, ao2, 'planke', [0, 1, 0], hell, false, [0, 1, 0.75, 1]);
      // Kollision: Kreise knapp hinter der Vorderkante (am Abschluss nur, solange er hoch genug ist)
      const r = cp.kreisRadius;
      const bis = j === punkte.length - 2 ? 0.4 : 1;
      const von = j === 0 ? 0.6 : 0;
      const ax = a.x + (b.x - a.x) * von, az = a.z + (b.z - a.z) * von;
      const bx = a.x + (b.x - a.x) * bis, bz = a.z + (b.z - a.z) * bis;
      kreisLinie(ax + ox * r, az + oz * r, bx + ox2 * r, bz + oz2 * r, r, cp.kreisAbstand, 'planke');
    }
    // Pfosten hinter dem Blech, Reflektoren vorne drauf
    for (const p of punkte) {
      if (!p.pfosten) continue;
      const st = stueck(p.s);
      const ox = -p.tz * sd, oz = p.tx * sd;
      pfosten(st, p.x + ox * 0.11, p.g - 0.15, p.z + oz * 0.11, p.tx, p.tz, 0.1, cp.hoehe + 0.12, 'stahl', 0.95);
      if (p.j % cp.reflektorAlle === 1) {
        const y = p.oben - cp.profil * 0.5, x = p.x - ox * 0.01, z = p.z - oz * 0.01;
        const w = 0.07, h = 0.05;
        viereck(st, [x - p.tx * w, y - h, z - p.tz * w], [x + p.tx * w, y - h, z + p.tz * w],
          [x + p.tx * w, y + h, z + p.tz * w], [x - p.tx * w, y + h, z - p.tz * w],
          sd > 0 ? 'reflOrange' : 'reflWeiss', [-ox, 0, -oz], 1.25);
      }
    }
  }

  // --- 2. Holzzäune -----------------------------------------------------------
  const cz = c.zaun;
  let zaunMeter = 0;
  const wackeln = (s, sd) => (rauschen(s / 14, sd * 7.3, c.seed) - 0.5) * 0.18;
  for (const l of plan.zaunLaeufe) {
    const sd = l.seite;
    const laenge = l.bis - l.von;
    zaunMeter += laenge;
    const m = Math.max(1, Math.round(laenge / cz.pfostenAbstand));
    const hoehen = l.latten === 2 ? [cz.latten[0] + 0.1, cz.latten[2] - 0.05] : cz.latten;
    const posten = [];
    for (let j = 0; j <= m; j++) {
      const s = l.von + (laenge * j) / m;
      const L = randAbstand(s, sd) + cz.versatz + wackeln(s, sd);
      const p = punkt(s, sd * L, {});
      p.g = gelaende(p.x, p.z); p.s = s;
      p.tor = (j === 0 && l.torAnfang) || (j === m && l.torEnde);
      // ab und zu ein schiefer Pfosten (kippt nach aussen oder entlang)
      p.kipp = [0, 0];
      if (!p.tor && rnd() < cz.pfostenSchief) {
        const ox = -p.tz * sd, oz = p.tx * sd, a = (rnd() - 0.3) * 0.25, b = (rnd() - 0.5) * 0.25;
        p.kipp = [ox * a + p.tx * b, oz * a + p.tz * b];
      }
      posten.push(p);
    }
    for (let j = 0; j < posten.length; j++) {
      const p = posten[j];
      const st = stueck(p.s);
      const dicke = p.tor ? 0.17 : 0.12, hoch = p.tor ? cz.hoehe + 0.15 : cz.hoehe;
      pfosten(st, p.x, p.g - 0.1, p.z, p.tx, p.tz, dicke, hoch + 0.1, 'holzpfosten', 0.85 + rnd() * 0.2, p.kipp);
      if (j === posten.length - 1) continue;
      const q = posten[j + 1];
      const ox = -p.tz * sd, oz = p.tx * sd, ox2 = -q.tz * sd, oz2 = q.tx * sd;
      // Latten vorne an den Pfosten (Strassenseite), leicht schief, manchmal fehlt eine
      for (const h of hoehen) {
        if (rnd() < cz.latteFehlt) continue;
        let ya = p.g + h + (rnd() - 0.5) * cz.schief, yb = q.g + h + (rnd() - 0.5) * cz.schief;
        if (rnd() < cz.latteHaengt) { if (rnd() < 0.5) ya = p.g + 0.12; else yb = q.g + 0.12; }
        const vorn = 0.09, hinten = 0.05, lh = 0.05;
        const kA = (f) => [p.x - ox * f + p.kipp[0] * (h / cz.hoehe), 0, p.z - oz * f + p.kipp[1] * (h / cz.hoehe)];
        const kB = (f) => [q.x - ox2 * f + q.kipp[0] * (h / cz.hoehe), 0, q.z - oz2 * f + q.kipp[1] * (h / cz.hoehe)];
        const [a1, , a3] = kA(vorn), [b1, , b3] = kB(vorn), [c1, , c3] = kA(hinten), [d1, , d3] = kB(hinten);
        const hell = 0.82 + rnd() * 0.22;
        viereck(st, [a1, ya - lh, a3], [b1, yb - lh, b3], [b1, yb + lh, b3], [a1, ya + lh, a3], 'latte', [-ox, 0, -oz], hell);
        viereck(st, [d1, yb - lh, d3], [c1, ya - lh, c3], [c1, ya + lh, c3], [d1, yb + lh, d3], 'latte', [ox, 0, oz], hell * 0.85);
        viereck(st, [a1, ya + lh, a3], [b1, yb + lh, b3], [d1, yb + lh, d3], [c1, ya + lh, c3], 'latte', [0, 1, 0], hell, false, [0, 1, 0, 0.3]);
      }
      // Kollision: Linie knapp hinter den Latten
      const r = cz.kreisRadius, f = 0.09 - r;
      kreisLinie(p.x - ox * f, p.z - oz * f, q.x - ox2 * f, q.z - oz2 * f, r, cz.kreisAbstand, 'zaun');
    }
  }
  // Weidetore: offenes Tor ist ins Feld gedreht (die Lücke bleibt befahrbar)
  for (const t of plan.tore) {
    if (!t.offen) continue;
    const sd = t.seite;
    const sAngel = t.anfang ? t.von : t.bis, sAndere = t.anfang ? t.bis : t.von;
    const L = randAbstand(sAngel, sd) + cz.versatz + wackeln(sAngel, sd);
    const p = punkt(sAngel, sd * L, {});
    const breite = Math.abs(t.bis - t.von) - 0.35;
    const lang = (sAndere > sAngel ? 1 : -1);  // in die Lücke hinein
    const w = (t.winkel * Math.PI) / 180;
    const ox = -p.tz * sd, oz = p.tx * sd;
    const dx = p.tx * lang * Math.cos(w) + ox * Math.sin(w), dz = p.tz * lang * Math.cos(w) + oz * Math.sin(w);
    const ex = p.x + dx * breite, ez = p.z + dz * breite;
    const ga = gelaende(p.x, p.z), ge = gelaende(ex, ez);
    const st = stueck(sAngel);
    const nx = -dz, nz = dx; // senkrecht zum Tor
    for (const h of [0.35, 0.65, 0.95]) {
      const hell = 0.85 + rnd() * 0.15, lh = 0.05;
      const a = [p.x, ga + h, p.z], b = [ex, ge + h, ez];
      viereck(st, [a[0], a[1] - lh, a[2]], [b[0], b[1] - lh, b[2]], [b[0], b[1] + lh, b[2]], [a[0], a[1] + lh, a[2]], 'latte', [nx, 0, nz], hell);
      viereck(st, [b[0], b[1] - lh, b[2]], [a[0], a[1] - lh, a[2]], [a[0], a[1] + lh, a[2]], [b[0], b[1] + lh, b[2]], 'latte', [-nx, 0, -nz], hell * 0.85);
    }
    // Querstrebe schräg und kleiner Pfosten am Ende des Tors
    const sa = [p.x, ga + 0.35, p.z], sb = [ex, ge + 0.95, ez];
    viereck(st, [sa[0], sa[1] - 0.05, sa[2]], [sb[0], sb[1] - 0.05, sb[2]], [sb[0], sb[1] + 0.05, sb[2]], [sa[0], sa[1] + 0.05, sa[2]], 'latte', [nx, 0, nz], 0.8);
    viereck(st, [sb[0], sb[1] - 0.05, sb[2]], [sa[0], sa[1] - 0.05, sa[2]], [sa[0], sa[1] + 0.05, sa[2]], [sb[0], sb[1] + 0.05, sb[2]], 'latte', [-nx, 0, -nz], 0.7);
    pfosten(st, ex, ge + 0.2, ez, dx, dz, 0.08, 0.85, 'holzpfosten', 0.9);
    kreisLinie(p.x + dx * 0.3, p.z + dz * 0.3, ex, ez, 0.15, 0.6, 'tor');
  }

  // --- 3. Schilder ---------------------------------------------------------------
  const cs = c.schilder;
  for (const sch of plan.schilder) {
    const st = stueck(sch.s);
    const { dx, dz } = sch;
    const rx = dz, rz = -dx;  // rechts aus Sicht des Fahrers, der auf das Schild schaut
    const oben = Math.max(...sch.tafeln.map((t) => t.unten + t.h));
    pfosten(st, sch.x, sch.y - 0.1, sch.z, rx, rz, 0.07, oben + 0.05, 'stahl', 1);
    for (const t of sch.tafeln) {
      const cx = sch.x + dx * 0.05, cz2 = sch.z + dz * 0.05, y0 = sch.y + t.unten, y1 = y0 + t.h, b = t.b / 2;
      const ru = (f) => [cx + rx * b * f, cz2 + rz * b * f];
      const [lx, lz] = ru(-1), [qx, qz] = ru(1);
      viereck(st, [lx, y0, lz], [qx, y0, qz], [qx, y1, qz], [lx, y1, lz], t.kachel, [dx, 0, dz], 1.05, !!t.spiegeln);
      // Rückseite (2 cm dahinter)
      const bx = -dx * 0.02, bz = -dz * 0.02;
      viereck(st, [qx + bx, y0, qz + bz], [lx + bx, y0, lz + bz], [lx + bx, y1, lz + bz], [qx + bx, y1, qz + bz],
        t.form === 'dreieck' ? 'warnRuecken' : t.form === 'kreis' ? 'tempoRuecken' : 'blech', [-dx, 0, -dz], 0.9);
    }
    hindernisse.push({ x: sch.x, z: sch.z, r: cs.kreisRadius, rand: 'schild' });
  }

  // --- Meshes: ein Material für alles ------------------------------------------------
  const material = new THREE.MeshLambertMaterial({
    map: atlas.textur, vertexColors: true, alphaTest: 0.5, flatShading: true,
  });
  const meshes = [];
  let dreiecke = 0;
  for (const [k, st] of [...stuecke.entries()].sort((a, b) => a[0] - b[0])) {
    if (!st.idx.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(st.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(st.uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(st.col, 3));
    geo.setIndex(st.idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, material);
    mesh.name = `strassenrand-${k}`;
    meshes.push(mesh);
    szene.add(mesh);
    dreiecke += st.idx.length / 3;
  }

  // Jedes Bild: Stücke weit weg von der Kamera nicht zeichnen (sind eh unter einem Pixel)
  const weit = c.sichtweite;
  function aktualisiere(kamPos) {
    for (const m of meshes) {
      const kugel = m.geometry.boundingSphere;
      m.visible = kugel.center.distanceTo(kamPos) - kugel.radius < weit;
    }
  }

  const zaehle = (art) => plan.schilder.filter((s) => s.art === art).length;
  const statistik = {
    ms: Math.round(performance.now() - t0), msPlan: Math.round(tPlan),
    plankenMeter: Math.round(plankenMeter), plankenStuecke: plan.plankenLaeufe.length,
    zaunMeter: Math.round(zaunMeter), zaunStuecke: plan.zaunLaeufe.length,
    tore: plan.tore.length, toreOffen: plan.tore.filter((t) => t.offen).length,
    wiesenAnteilMitZaun: plan.wiesenMeter ? Math.round((plan.zaunMeter / plan.wiesenMeter) * 100) : 0,
    schilder: plan.schilder.length,
    schilderArten: { warnung: zaehle('warnung'), chevron: zaehle('chevron'), kehre: zaehle('kehre'), gefahr: zaehle('gefahr'), km: zaehle('km'), tempo: zaehle('tempo') },
    tempoTafeln: plan.schilder.flatMap((s) => s.tafeln).filter((t) => t.form === 'kreis').length,
    kehren: plan.kehren.length, hindernisse: hindernisse.length, stuecke: meshes.length, dreiecke,
  };
  return { plan, hindernisse, meshes, aktualisiere, statistik };
}
