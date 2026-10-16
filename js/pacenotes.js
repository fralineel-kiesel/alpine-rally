// Pace-Notes (Meilenstein 4): Ansagen des Beifahrers oben im Bild.
// Alles wird beim Laden aus der Strecke berechnet (Krümmung, Höhenprofil, Felswand,
// Nebenwege, Abkürzungs-Listen) – nichts ist von Hand pro Kurve eingetragen.
// Werte und Texte: config.js, Block "pacenotes". Liste ansehen und prüfen: node tools/pacenotes-test.mjs
//
// Eine Ansage (note) hat: s (Streckenmeter, ab hier gilt sie; beim Passieren verschwindet sie),
// teile (eine oder zwei Ansagen, mit "UND" verbunden), zusatz (kleine Zeichen rechts: Schneiden,
// nicht schneiden, Belag), text (fertiger Text) und stufe (1-6, nur bei Kurven).

import { CONFIG } from './config.js';
import { KURVEN_TEMPO } from './pacenotes-tempo.js';

const GRAD = 180 / Math.PI;

// --- Krümmung je Streckenpunkt (1/Meter, + = Rechtskurve), geglättet -----------------------
export function kruemmung(strecke, glaetten = CONFIG.pacenotes.glaetten) {
  const { tx, tz, anzahl: n } = strecke;
  const roh = new Float32Array(n);
  for (let i = 3; i < n - 3; i++) roh[i] = ((tx[i + 3] - tx[i - 3]) * -tz[i] + (tz[i + 3] - tz[i - 3]) * tx[i]) / 6;
  const k = new Float32Array(n);
  let summe = 0;
  for (let i = 0; i < Math.min(n, glaetten); i++) summe += roh[i];
  for (let i = 0; i < n; i++) {
    if (i + glaetten < n) summe += roh[i + glaetten];
    if (i - glaetten - 1 >= 0) summe -= roh[i - glaetten - 1];
    k[i] = summe / (Math.min(n - 1, i + glaetten) - Math.max(0, i - glaetten) + 1);
  }
  return k;
}

// Geschätztes Kurventempo (m/s), nur als Reserve für Kurven ohne Messung (z. B. nach einer
// Streckenänderung, bevor tools/pacenotes-test.mjs --schreiben gelaufen ist):
// Wurzel(Querbeschleunigung x Grip x wirksamer Radius). Wirksamer Radius: der kleinste Radius plus
// etwas Strassenbreite, mit der man eine kurze Kurve begradigen kann (je kleiner der Winkel, desto mehr).
export function kurvenTempo(rMin, winkel, grip, P = CONFIG.pacenotes) {
  const halb = Math.min(winkel, 180) / 2 / GRAD;
  const rEff = rMin + P.breiteNutzen / Math.max(0.02, 1 - Math.cos(halb));
  return Math.sqrt(P.querBeschl * grip * rEff);
}

// Gemessenes Grenztempo einer Kurve (km/h, Infinity = Vollgas) aus js/pacenotes-tempo.js, sonst null.
// Die Kurve muss dort mit (fast) gleichem Anfang und Ende stehen.
export function gemessenesTempo(von, bis, daten = KURVEN_TEMPO) {
  for (const m of daten.kurven) {
    if (Math.abs(m.von - von) <= 3 && Math.abs(m.bis - bis) <= 3) return m.kmh == null ? Infinity : m.kmh;
  }
  return null;
}

// Stufe 1-6 aus dem Kurventempo (km/h)
export function stufeAusTempo(kmh, P = CONFIG.pacenotes) {
  let st = 1;
  for (const g of P.stufenGrenzen) if (kmh >= g) st++;
  return st;
}

// --- Kurven finden ----------------------------------------------------------------------------
// Stücke mit gleicher Richtung, die stärker gekrümmt sind als minKruemmung (kurze Lücken gefüllt).
// Ergebnis je Kurve: von, bis (Meter), richtung (+1 rechts, -1 links), winkel (Grad), rMin (Meter),
// belag und grip am engsten Punkt, tempo (geschätzt, m/s), stufe, kehre (true/false), form (Zusatz).
export function findeKurven(strecke, netz, k = kruemmung(strecke), P = CONFIG.pacenotes) {
  const n = strecke.anzahl;
  const roh = [];
  let cur = null;
  for (let i = 0; i < n; i++) {
    if (Math.abs(k[i]) < P.minKruemmung) continue;
    const sg = Math.sign(k[i]);
    if (cur && cur.richtung === sg && i - cur.bis <= P.lueckeFuellen) cur.bis = i;
    else { cur = { von: i, bis: i, richtung: sg }; roh.push(cur); }
  }
  const kurven = [];
  for (const c of roh) {
    let winkel = 0, maxK = 0, iMax = c.von;
    for (let i = c.von; i <= c.bis; i++) {
      winkel += k[i];
      if (Math.abs(k[i]) > maxK) { maxK = Math.abs(k[i]); iMax = i; }
    }
    winkel = Math.abs(winkel) * GRAD;
    if (winkel < P.minWinkel) continue;
    const belag = netz ? netz.belag[iMax] : 'asphalt';
    const grip = CONFIG.untergrund[belag] ? CONFIG.untergrund[belag].grip : 1;
    const rMin = 1 / maxK;
    // Kurventempo: gemessen mit der echten Fahrphysik (Datei), sonst geschätzt
    const gemessen = gemessenesTempo(c.von, c.bis);
    const tempo = gemessen != null ? gemessen / 3.6 : kurvenTempo(rMin, winkel, grip, P);
    // Form: mittlere Krümmung im ersten und im letzten Drittel
    const l = c.bis - c.von + 1, d = Math.max(1, Math.floor(l / 3));
    let kA = 0, kE = 0;
    for (let i = 0; i < d; i++) { kA += Math.abs(k[c.von + i]); kE += Math.abs(k[c.bis - i]); }
    const kehre = rMin < P.kehreRadius && winkel >= P.kehreWinkel;
    kurven.push({
      von: c.von, bis: c.bis, laenge: l, richtung: c.richtung, winkel, rMin, iMax, belag, grip,
      tempo, kmh: tempo * 3.6, gemessen: gemessen != null, stufe: kehre ? 1 : stufeAusTempo(tempo * 3.6, P), kehre,
      oeffnet: kA >= P.oeffnetFaktor * kE, ziehtZu: kE >= P.oeffnetFaktor * kA,
    });
  }
  return kurven;
}

// Zusatz zur Kurve (höchstens einer): ZIEHT ZU, ÖFFNET, LANG, ENG oder WEIT
function formZusatz(c, P) {
  const T = P.texte;
  // (bei Vollgas-Kurven, Stufe 6, sagt "zieht zu"/"öffnet" nichts)
  if (c.ziehtZu && c.stufe < 6) return T.ziehtZu;
  if (c.oeffnet && c.stufe < 6) return T.oeffnet;
  if (c.winkel >= P.langWinkel || c.laenge >= P.langLaenge) return T.lang;
  const g = P.stufenGrenzen, st = c.stufe;
  if (st <= 1 || st >= 6) return null;
  const unten = g[st - 2], oben = g[st - 1], anteil = (c.kmh - unten) / (oben - unten);
  if (anteil < P.engWeitAnteil) return T.eng;
  if (anteil > 1 - P.engWeitAnteil) return T.weit;
  return null;
}

// --- Kuppen und Senken aus dem Höhenprofil ---------------------------------------------------------
export function findeKnicke(strecke, P = CONFIG.pacenotes) {
  const { py, anzahl: n } = strecke;
  const L = P.knickStrecke;
  const knick = new Float32Array(n); // + = Kuppe (Steigung nimmt ab), - = Senke
  for (let i = L; i < n - L; i++) knick[i] = (py[i] - py[i - L]) / L - (py[i + L] - py[i]) / L;
  // Kann man vor der Kuppe die Strasse dahinter sehen? (nur das Höhenprofil, Strasse als Band)
  const versteckt = (i) => {
    for (let e = i - 40; e <= i - 10; e += 2) {
      if (e < 0) continue;
      const hAug = py[e] + P.kuppeAugHoehe;
      for (let d = P.kuppeSicht[0]; d <= P.kuppeSicht[1]; d += 5) {
        const t = e + d;
        if (t <= i || t >= n) continue;
        const hZiel = py[t] + 0.3;
        for (let m = e + 1; m < t; m++) {
          const hLinie = hAug + (hZiel - hAug) * (m - e) / (t - e);
          if (py[m] > hLinie) return true;
        }
      }
    }
    return false;
  };
  const liste = [];
  for (const [art, vz, min] of [['kuppe', 1, P.kuppeMinKnick], ['senke', -1, P.senkeMinKnick]]) {
    let best = -1;
    for (let i = L; i <= n - L; i++) {
      const w = i < n - L ? knick[i] * vz : 0;
      if (w >= min) { if (best < 0 || w > knick[best] * vz) best = i; }
      else if (best >= 0) {
        // Kuppe: nur wenn die Strasse dahinter verschwindet. Senke: nur am Ende eines Gefälles (echte Mulde)
        const gVor = (py[best] - py[best - L]) / L;
        if (art === 'senke' ? gVor <= P.senkeVorGefaelle : versteckt(best)) liste.push({ art, s: best, knick: knick[best] * vz });
        best = -1;
      }
    }
  }
  return liste.sort((a, b) => a.s - b.s);
}

// --- Alle Ansagen berechnen ---------------------------------------------------------------------
export function berechnePaceNotes(strecke, netz, P = CONFIG.pacenotes) {
  const T = P.texte;
  const k = kruemmung(strecke, P.glaetten);
  const kurven = findeKurven(strecke, netz, k, P);
  const start = strecke.startS, ziel = strecke.zielS;
  const RICHTUNG = (r) => (r > 0 ? T.rechts : T.links);
  const farbeStufe = (st) => (st <= 2 ? 'rot' : st <= 4 ? 'gelb' : 'gruen');
  // Nur was zwischen Start und Ziel liegt
  const imRennen = (s) => s >= start - 5 && s <= ziel;

  // 1. Kehren und ihre Gruppen (Nummer 1/4, 2/4 ...)
  const kehren = kurven.filter((c) => c.kehre);
  let gruppe = [];
  const gruppen = [];
  for (const c of kehren) {
    if (gruppe.length && c.von - gruppe[gruppe.length - 1].bis > P.kehrenGruppe) { gruppen.push(gruppe); gruppe = []; }
    gruppe.push(c);
  }
  if (gruppe.length) gruppen.push(gruppe);
  for (const g of gruppen) g.forEach((c, j) => { c.kehrenNr = j + 1; c.kehrenAnzahl = g.length; });

  // 2. Nebenwege: Kreuzung (Abzweig/Einmündung) mit der Kurve, die dort abbiegt
  const kreuzungen = [];
  for (const nw of CONFIG.nebenwege || []) {
    for (const [art, sK] of [['abzweig', nw.abzweig], ['einmuendung', nw.einmuendung]]) {
      // Kurve, die an der Kreuzung liegt (oder knapp davor/danach beginnt)
      let kurve = null;
      for (const c of kurven) {
        if (c.kehre || c.von > sK + P.abzweigFang || c.bis < sK - P.abzweigFang) continue;
        const abstand = sK < c.von ? c.von - sK : sK > c.bis ? sK - c.bis : 0;
        if (!kurve || abstand < kurve.abstand) kurve = { c, abstand };
      }
      // Richtung: aus der Kurve, sonst aus der Richtungsänderung der Etappe an der Kreuzung
      let richtung;
      if (kurve) richtung = kurve.c.richtung;
      else {
        let w = 0;
        for (let i = Math.max(0, Math.round(sK) - 10); i <= Math.min(strecke.anzahl - 1, Math.round(sK) + 40); i++) w += k[i];
        richtung = Math.sign(w) || 1;
      }
      if (kurve) kurve.c.kreuzung = art;
      kreuzungen.push({ art, s: sK, richtung, kurve: kurve && kurve.c, nebenweg: nw.name, belag: nw.belag });
    }
  }

  // 3. Schikanen: zwei kurze Gegenkurven direkt hintereinander (keine Kehre, keine Kreuzung)
  const inSchikane = new Set();
  const schikanen = [];
  for (let j = 0; j + 1 < kurven.length; j++) {
    const a = kurven[j], b = kurven[j + 1];
    if (a.kehre || b.kehre || a.kreuzung || b.kreuzung || inSchikane.has(a)) continue;
    if (a.richtung === b.richtung || b.von - a.bis > P.schikaneLuecke) continue;
    if (a.winkel > P.schikaneWinkel || b.winkel > P.schikaneWinkel || b.bis - a.von > P.schikaneLaenge) continue;
    inSchikane.add(a); inSchikane.add(b);
    schikanen.push({ a, b, von: a.von, bis: b.bis });
  }

  // --- Ansagen bauen (ein "teil" je Ereignis) ---
  // teil: { art, s, sEnde, richtung, stufe, symbol, farbe, varianten: [Text lang ... kurz], kurven: [...] }
  const teile = [];
  for (const c of kurven) {
    if (inSchikane.has(c) || c.kreuzung || !imRennen(c.von)) continue;
    if (c.kehre) {
      const nr = c.kehrenAnzahl > 1 ? ` (${c.kehrenNr}/${c.kehrenAnzahl})` : '';
      teile.push({
        art: 'kehre', s: c.von, sEnde: c.bis, richtung: c.richtung, stufe: 1, symbol: 'kehre', farbe: 'rot',
        varianten: [`${T.kehre} ${RICHTUNG(c.richtung)}${nr}`, `${T.kehre} ${RICHTUNG(c.richtung)}`], kurven: [c],
      });
      continue;
    }
    const zusatz = formZusatz(c, P);
    const basis = `${RICHTUNG(c.richtung)} ${c.stufe}`;
    teile.push({
      art: 'kurve', s: c.von, sEnde: c.bis, richtung: c.richtung, stufe: c.stufe, form: zusatz,
      symbol: c.stufe <= 2 ? 'kurve12' : c.stufe <= 4 ? 'kurve34' : 'kurve56', farbe: farbeStufe(c.stufe),
      varianten: zusatz ? [`${basis} ${zusatz}`, basis] : [basis], kurven: [c],
    });
  }
  for (const sk of schikanen) {
    if (!imRennen(sk.von)) continue;
    const stufe = Math.min(sk.a.stufe, sk.b.stufe);
    teile.push({
      art: 'schikane', s: sk.von, sEnde: sk.bis, richtung: sk.a.richtung, stufe, symbol: 'schikane', farbe: farbeStufe(stufe),
      varianten: [`${T.schikane} ${RICHTUNG(sk.a.richtung)}-${RICHTUNG(sk.b.richtung)}`, `${T.schikane} ${stufe}`],
      kurven: [sk.a, sk.b],
    });
  }
  for (const kr of kreuzungen) {
    const wort = kr.art === 'abzweig' ? T.abzweig : T.einmuendung;
    const c = kr.kurve;
    const s = c ? Math.min(c.von, kr.s) : kr.s;
    const varianten = c
      ? [`${wort} ${RICHTUNG(kr.richtung)} ${c.stufe}`, `${wort} ${RICHTUNG(kr.richtung)}`]
      : [`${wort} ${RICHTUNG(kr.richtung)}`];
    teile.push({
      art: kr.art, s, sEnde: c ? Math.max(c.bis, kr.s) : kr.s, sKreuzung: kr.s, richtung: kr.richtung, stufe: c ? c.stufe : null,
      symbol: c ? (c.stufe <= 2 ? 'kurve12' : c.stufe <= 4 ? 'kurve34' : 'kurve56') : 'gerade', farbe: c ? farbeStufe(c.stufe) : 'weiss',
      varianten, kurven: c ? [c] : [], nebenweg: kr.nebenweg,
    });
  }

  // 4. Belagwechsel (Schotter, Wiesenweg) am Anfang des Abschnitts
  const belagWechsel = [];
  if (netz) {
    for (let i = 1; i < strecke.anzahl; i++) {
      const b = netz.belag[i];
      if (b !== netz.belag[i - 1] && b !== 'asphalt' && T[b]) belagWechsel.push({ s: i, belag: b });
    }
  }

  // 5. Kuppen und Senken
  for (const kn of findeKnicke(strecke, P)) {
    if (!imRennen(kn.s)) continue;
    // kürzeste Variante '' = nur das Zeichen (wenn die Zeile sonst zu lang wird)
    teile.push({ art: kn.art, s: kn.s, sEnde: kn.s, symbol: kn.art, farbe: 'weiss', varianten: [T[kn.art], ''] });
  }

  // 6. Felswand: nur wo eine Kurve im Felswand-Stück die Wand aussen hat
  {
    const n = strecke.anzahl;
    let i = 0;
    while (i < n) {
      const ws = strecke.wandSeite[i];
      if (!ws) { i++; continue; }
      let j = i;
      while (j + 1 < n && strecke.wandSeite[j + 1] === ws) j++;
      const gefahr = teile.some((t) => t.kurven && t.stufe <= P.wandMaxStufe
        && t.kurven.some((c) => c.richtung === -ws && c.bis >= i && c.von <= j));
      if (gefahr && imRennen(i)) {
        teile.push({
          art: 'felswand', s: i, sEnde: j, richtung: ws, symbol: 'gefahr', farbe: 'gelb',
          varianten: [`${T.felswand} ${RICHTUNG(ws)}`],
        });
      }
      i = j + 1;
    }
  }

  // 7. Ziel
  teile.push({ art: 'ziel', s: ziel, sEnde: ziel, symbol: 'ziel', farbe: 'weiss', varianten: [T.ziel], vorlauf: P.zielVor });

  teile.sort((a, b) => a.s - b.s || a.art.localeCompare(b.art));

  // 8. Geraden: lange Stücke ohne angesagte Kurve (bis zur nächsten Kurve oder zum Ziel)
  {
    const kurvig = teile.filter((t) => t.kurven && t.kurven.length);
    let ende = start;
    const neu = [];
    for (const t of [...kurvig, { s: ziel, sEnde: ziel }]) {
      const laenge = t.s - ende;
      if (laenge >= P.geradeMin) {
        const l = Math.floor(laenge / P.geradeRunden) * P.geradeRunden;
        neu.push({ art: 'gerade', s: ende, sEnde: t.s, laenge: l, symbol: 'gerade', farbe: 'weiss', varianten: [`${T.gerade} ${l}`] });
      }
      ende = Math.max(ende, t.sEnde);
    }
    teile.push(...neu);
    teile.sort((a, b) => a.s - b.s || a.art.localeCompare(b.art));
  }

  // 9. Schneiden / nicht schneiden: an die passende Kurven-Ansage (Überlappung, Innenseite = Kurvenrichtung)
  const abkuerzungen = [];
  for (const [liste, art] of [[strecke.nichtSchneiden || [], 'nichtSchneiden'], [strecke.schneiden || [], 'schneiden']]) {
    for (const e of liste) {
      const seite = e.seite === 'rechts' ? 1 : -1;
      let best = null, bestUeber = 0;
      for (const t of teile) {
        if (!t.kurven || !t.kurven.length || t.schneiden) continue;
        for (const c of t.kurven) {
          if (c.richtung !== seite) continue;
          const ueber = Math.min(c.bis, e.sBis) - Math.max(c.von, e.sVon);
          if (ueber > bestUeber) { bestUeber = ueber; best = t; }
        }
      }
      const eintrag = { art, sVon: e.sVon, sBis: e.sBis, seite: e.seite };
      if (best) {
        best.schneiden = art;
        best.abkuerzung = eintrag;
      } else {
        // keine passende Kurve: eigene Ansage am Anfang des Bereichs
        teile.push({
          art, s: e.sVon, sEnde: e.sBis, symbol: art, farbe: art === 'schneiden' ? 'gruen' : 'rot', schneiden: art, abkuerzung: eintrag,
          varianten: [`${art === 'schneiden' ? T.schneiden : T.nichtSchneiden} ${RICHTUNG(seite)}`],
        });
      }
      abkuerzungen.push(eintrag);
    }
  }
  teile.sort((a, b) => a.s - b.s || a.art.localeCompare(b.art));

  // 10. Belag: an die Ansage an dieser Stelle hängen (z. B. "ABZWEIG RECHTS SCHOTTER"), sonst eigene Ansage
  for (const bw of belagWechsel) {
    if (!imRennen(bw.s)) continue;
    // am liebsten an die Kreuzung (Abzweig/Einmündung), sonst an die nächste Ansage
    let best = null, bestWert = Infinity;
    for (const t of teile) {
      const d = Math.abs(t.s - bw.s);
      if (d >= P.zusammen) continue;
      const wert = d - (t.art === 'abzweig' || t.art === 'einmuendung' ? 1000 : 0);
      if (wert < bestWert) { bestWert = wert; best = t; }
    }
    if (best) {
      best.belag = bw.belag;
      // mit Belag-Wort, als letzte Möglichkeit ohne (dann zeigt nur das Belag-Zeichen den Wechsel)
      const ohne = best.varianten[best.varianten.length - 1];
      best.varianten = [...best.varianten.filter((v) => v).map((v) => `${v} ${T[bw.belag]}`), ohne];
    } else {
      teile.push({ art: 'belag', s: bw.s, sEnde: bw.s, belag: bw.belag, symbol: 'belag', farbe: 'weiss', varianten: [T[bw.belag]] });
    }
  }
  teile.sort((a, b) => a.s - b.s || a.art.localeCompare(b.art));

  // 11. Zusammenfassen: Ansagen näher als "zusammen" Meter werden eine Ansage mit "UND"
  const notes = [];
  for (const t of teile) {
    const letzte = notes[notes.length - 1];
    if (letzte && t.s - letzte.teile[letzte.teile.length - 1].s < P.zusammen) letzte.teile.push(t);
    else notes.push({ s: t.s, teile: [t] });
  }
  for (const nt of notes) fertigeNote(nt, P);
  return { notes, kurven, kehren, schikanen, kreuzungen, belagWechsel, abkuerzungen, kruemmung: k };
}

// Text, Stufe, Farbe und Zusatz-Zeichen einer Ansage festlegen
function fertigeNote(nt, P) {
  const T = P.texte;
  const und = ` ${T.und} `;
  // Text: jede Teil-Ansage hat Varianten (lang -> kurz); so lange kürzen, bis es passt
  const wahl = nt.teile.map(() => 0);
  const text = () => nt.teile.map((t, j) => t.varianten[wahl[j]]).filter((v) => v).join(und);
  while (text().length > P.maxZeichen) {
    let j = -1;
    for (let m = nt.teile.length - 1; m >= 0; m--) if (wahl[m] < nt.teile[m].varianten.length - 1) { j = m; break; }
    if (j < 0) break;
    wahl[j]++;
  }
  nt.text = text();
  nt.stuecke = nt.teile.map((t, j) => ({
    text: t.varianten[wahl[j]], symbol: t.symbol, farbe: t.farbe, richtung: t.richtung || 1,
    stufe: t.kurven && t.kurven.length && t.art !== 'kehre' && t.art !== 'schikane' ? t.stufe : null,
  }));
  // Zusatz-Zeichen rechts: Schneiden / nicht schneiden; Belag nur, wenn das Wort nicht mehr im Text steht
  nt.zusatz = [];
  for (const t of nt.teile) {
    if (t.schneiden && t.kurven && t.kurven.length) nt.zusatz.push(t.schneiden);
    if (t.belag && !nt.text.includes(T[t.belag])) nt.zusatz.push(t.belag);
  }
  nt.stufe = nt.teile.reduce((m, t) => (t.stufe ? Math.min(m, t.stufe) : m), 99);
  if (nt.stufe === 99) nt.stufe = null;
  nt.arten = nt.teile.map((t) => t.art);
  nt.vorlauf = nt.teile[0].vorlauf || null;
}

// =====================================================================
// Anzeige im Spiel: welche Ansagen gerade oben stehen (ohne neue Objekte pro Bild)
// =====================================================================
export function bauePaceNotes(strecke, netz) {
  const P = CONFIG.pacenotes;
  const t0 = performance.now();
  const daten = berechnePaceNotes(strecke, netz, P);
  const notes = daten.notes;
  const N = notes.length;
  const ms = performance.now() - t0;
  const alpha = new Float32Array(N), yPos = new Float32Array(N), gezeigt = new Uint8Array(N);

  // An/Aus merken (Browser-Speicher darf fehlen)
  let an = P.an;
  try {
    const w = window.localStorage.getItem(P.speicherName);
    if (w === '0' || w === '1') an = w === '1';
  } catch { /* kein Speicher: Standard */ }

  // Ergebnis für das HUD (immer dieselben Objekte)
  const zeilen = [];
  for (let z = 0; z < P.maxZeilen + 1; z++) zeilen.push({ nr: -1, alpha: 0, y: 0, distanz: 0 });
  const anzeige = { an, zeilen, anzahl: 0, notes };

  let sVorher = -1e9;
  return {
    notes, daten, anzeige, ms,
    umschalten() {
      an = !an;
      anzeige.an = an;
      try { window.localStorage.setItem(P.speicherName, an ? '1' : '0'); } catch { /* egal */ }
    },
    // Alles von vorn (Neustart)
    zuruecksetzen() {
      alpha.fill(0); gezeigt.fill(0); sVorher = -1e9;
    },
    // s = Streckenmeter des Autos, v = Tempo (m/s), zustand = Rennzustand
    aktualisiere(dt, s, v, zustand) {
      const sichtbar = an && zustand !== 'ziel';
      // Sprung zurück (Taste R): was vor dem Auto liegt, kommt neu
      if (s < sVorher - 15) for (let j = 0; j < N; j++) if (notes[j].s > s) gezeigt[j] = 0;
      sVorher = s;
      const vorlauf = Math.min(P.vorlaufMax, Math.max(P.vorlaufMin, v * P.vorlaufZeit));
      // Zeilen von oben: zuerst die gerade passierten (blenden aus), dann die nächsten vor dem Auto.
      // Eine neue Ansage kommt nur, wenn eine Zeile frei ist; was schon steht, bleibt (kein Flackern).
      let reihe = 0;
      for (let j = 0; j < N; j++) {
        const nt = notes[j];
        const d = nt.s - s;
        if (d > P.vorlaufMax + 60) { gezeigt[j] = 0; if (alpha[j] === 0) break; }
        let soll = false;
        if (sichtbar && d > 0) {
          if (!gezeigt[j] && reihe < P.maxZeilen && d <= (nt.vorlauf || vorlauf)) gezeigt[j] = 1;
          soll = gezeigt[j] === 1 && (alpha[j] > 0 || reihe < P.maxZeilen);
        }
        const vorher = alpha[j];
        if (soll) alpha[j] = Math.min(1, alpha[j] + dt / P.einblenden);
        else if (alpha[j] > 0) alpha[j] = Math.max(0, alpha[j] - dt / P.ausblenden);
        if (alpha[j] > 0) {
          if (vorher === 0) yPos[j] = reihe; // neue Zeile erscheint an ihrem Platz
          else yPos[j] += (reihe - yPos[j]) * Math.min(1, dt * P.nachruecken); // rückt weich nach
          reihe++;
        }
      }
      // Für das HUD: höchstens maxZeilen (+1 ausblendende) Zeilen, oben die dringendste
      let z = 0;
      for (let j = 0; j < N && z < zeilen.length; j++) {
        if (alpha[j] <= 0) continue;
        const zl = zeilen[z++];
        zl.nr = j; zl.alpha = alpha[j]; zl.y = yPos[j];
        const d = Math.max(0, notes[j].s - s);
        zl.distanz = Math.round(d / P.distanzRunden) * P.distanzRunden;
      }
      anzeige.anzahl = z;
      return anzeige;
    },
  };
}
