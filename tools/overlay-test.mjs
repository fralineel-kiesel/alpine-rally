// Test für Meilenstein 6 (Minimap, Live-Vergleich, Taste H, Einstellungen ANZEIGE):  node tools/overlay-test.mjs
//  (a) Minimap-Geometrie: Punkt bei Start, Mitte, Ziel (und auf der Wiese) an der richtigen Stelle, ganze Strecke in
//      der Tafel, keine Überlappung mit Pace-Notes, Zeit-Tafel, Live-Vergleich, Meldung
//  (b) Färbung: wächst nur (maxS), nicht beim Rückwärtsfahren oder R; Checkpoint weiss -> grün, rot bei verpasst;
//      nicht jedes Bild neu gemalt
//  (c) Fahrspur: komplette Fahrt = ca. 361 Werte, streng aufsteigend, letzter = Endzeit, Zeitpunkte stimmen
//  (d) Vergleich: identischer Lauf unter 0.05 s, langsamer = positiv und wachsend, schneller = negativ;
//      Vorzeichen, Farbe, Rundung; kein Flackern (Hysterese, höchstens 5 Mal pro Sekunde)
//  (e) keine Referenz: nichts angezeigt; alte Bestzeiten ohne Spur: Näherung, am Checkpoint genau;
//      Einstellung Bestzeit / Letzter Lauf
//  (f) Browser-Speicher blockiert: keine Fehler, Vergleich in der Sitzung
//  (g) Taste H: aus/an, Countdown/ZIEL!/Zielbildschirm/Pause bleiben, belegbar, Tausch, nicht gespeichert
//  (h) Einstellungen sofort wirksam und nach dem Neuladen noch da; Texte de/en, alle Zeichen in der Pixelschrift
//  (i) Leistung: keine neuen Zeichenaufrufe (auch gegen die alte Version, falls angegeben), HUD-Zeit mit/ohne Minimap
// Dazu: keine Fehler in der Konsole.
//   Optional: node tools/overlay-test.mjs <ordner der alten Version>  (Zeichenaufrufe alt gegen neu)

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

let fehlerZahl = 0;
const pruefe = (ok, text, info = '') => {
  console.log(`  ${ok ? 'OK   ' : 'FEHLER'} ${text}${info ? `  (${info})` : ''}`);
  if (!ok) fehlerZahl++;
};
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
const altOrdner = process.argv[2] ? path.resolve(process.argv[2]) : null;
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;

// Spiel laden (Standard: am Menü vorbei, Physik von aussen). opt.ohneSpeicher: localStorage blockiert
async function lade(opt = {}) {
  const spiel = await starteSpiel({ breite: 640, hoehe: 360, wurzel: opt.wurzel || WURZEL });
  if (opt.ohneSpeicher) {
    await spiel.page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blockiert', 'SecurityError'); } });
    });
  }
  if (opt.speicher) await spiel.page.addInitScript((d) => { if (!sessionStorage.getItem('gesetzt')) { localStorage.clear(); for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); sessionStorage.setItem('gesetzt', '1'); } }, opt.speicher);
  else if (!opt.ohneSpeicher && !opt.behalten) await spiel.page.addInitScript(() => { if (!sessionStorage.getItem('leer')) { localStorage.clear(); sessionStorage.setItem('leer', '1'); } });
  await spiel.ladeSpiel(true, { menue: !!opt.menue });
  await bilderAbwarten(spiel.page);
  await spiel.page.evaluate((code) => {
    window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const A = window.__alpineRally;
    if (!A.vergleich) return; // alte Version
    const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false, hud: false };
    window.__T = {
      LEER,
      // Lauf mit dem Testfahrer: ganze Etappe (fahreEtappe, fliegender Start wie die Testfahrer-Zeiten) oder bis bisS
      // mit A.rennSchritt (gas: Faktor fürs Gaspedal). mit(e) wird nach jedem Schritt aufgerufen.
      // Der Vergleich wird dabei jeden Schritt wie in der Spielschleife aktualisiert (Bild = 1/120 s).
      async fahre(profil, { bisS = Infinity, gas = 1, ganz = false, mit = null, countdown = false } = {}) {
        const f = await import(window.__fahrerUrl);
        const proSchritt = (e) => {
          A.vergleich.aktualisiere(A.SCHRITT, A.rennen.letztesS, A.rennen.zeit, A.rennen.zustand === 'laeuft');
          if (mit) mit(e);
        };
        if (ganz) { const r = f.fahreEtappe(A, profil, proSchritt); A.rennSchritt(A.SCHRITT, LEER); return r; }
        A.start({ countdown });
        if (countdown) while (A.ablauf.zustand === 'countdown') A.rennSchritt(A.SCHRITT, LEER);
        f.fahreBis(A, profil, { bisS, gas, proSchritt });
        if (A.rennen.zustand === 'ziel') A.rennSchritt(A.SCHRITT, LEER);
        return { zeit: A.rennen.endZeit, ziel: A.rennen.zustand === 'ziel', cps: A.rennen.zwischenzeiten.slice() };
      },
      // Mitschnitt des Vergleichs während einer Fahrt: Rohwert, angezeigte Stufe/Zahl, Wechsel
      mitschnitt() {
        const m = { max: 0, maxWo: 0, roh: [], stufen: 0, zahlen: 0, letzte: null, alle: new Set(), updates: 0, version: -1, vorz: 0, letztesVorz: 0 };
        m.mit = () => {
          if (A.rennen.zustand !== 'laeuft') return;
          const d = A.rennen.zeit - A.vergleich.referenzBei(A.rennen.letztesS);
          if (Math.abs(d) > m.max) { m.max = Math.abs(d); m.maxWo = A.rennen.letztesS; }
          m.roh.push([A.rennen.letztesS, d]);
          const a = A.vergleich.anzeige;
          if (!a.sichtbar) return;
          if (a.version !== m.version) {
            m.updates++; m.version = a.version;
            const txt = a.stufe === 0 ? '0.0' : `${a.stufe < 0 ? '-' : '+'}${Math.floor(a.wert / 10)}.${a.wert % 10}`;
            if (m.letzte && m.letzte.stufe !== a.stufe) m.stufen++;
            if (m.letzte && m.letzte.txt !== txt) m.zahlen++;
            if (a.stufe !== 0 && m.letztesVorz !== 0 && a.stufe !== m.letztesVorz) m.vorz++;
            if (a.stufe !== 0) m.letztesVorz = a.stufe;
            m.letzte = { stufe: a.stufe, txt, roh: A.vergleich.roh };
            m.alle.add(txt);
          }
        };
        return m;
      },
      // Pixel der HUD-Leinwand (320x180) in einem Rechteck: Anzahl sichtbarer Pixel und Farbzählung
      hudPixel(x, y, b, h, farben = []) {
        const c = document.getElementById('hud').getContext('2d');
        const d = c.getImageData(x, y, b, h).data;
        let sichtbar = 0;
        const n = farben.map(() => 0);
        const rgb = farben.map((f) => [parseInt(f.slice(1, 3), 16), parseInt(f.slice(3, 5), 16), parseInt(f.slice(5, 7), 16)]);
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] > 0) sichtbar++;
          rgb.forEach((r, k) => { if (d[i + 3] > 200 && Math.abs(d[i] - r[0]) < 12 && Math.abs(d[i + 1] - r[1]) < 12 && Math.abs(d[i + 2] - r[2]) < 12) n[k]++; });
        }
        return { sichtbar, n };
      },
      // Farbe eines Pixels der Minimap-Karte (Leinwand der Karte)
      kartenPixel(u, v) {
        const d = A.hud.minimap.karte.getContext('2d').getImageData(u, v, 1, 1).data;
        return `#${[d[0], d[1], d[2]].map((w) => w.toString(16).padStart(2, '0')).join('')}`;
      },
      // so viele Pixel der Karte haben die Farbe "gefahren"
      gefahrenPixel() {
        const k = A.hud.minimap.karte, d = k.getContext('2d').getImageData(0, 0, k.width, k.height).data;
        const f = A.CONFIG.hud.minimap.farbeGefahren, r = parseInt(f.slice(1, 3), 16), g = parseInt(f.slice(3, 5), 16), b = parseInt(f.slice(5, 7), 16);
        let n = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] === r && d[i + 1] === g && d[i + 2] === b) n++;
        return n;
      },
    };
  }, fahrerCode);
  return spiel;
}
async function bilderAbwarten(p, n = 3) {
  await p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
}
const A = (p, f, arg) => p.evaluate(f, arg);
const gleicheFarbe = (a, b) => a.toLowerCase() === b.toLowerCase();

// =====================================================================
console.log('(a) Minimap-Geometrie');
{
  const spiel = await lade();
  const p = spiel.page;
  // erwartete Lage, unabhängig vom Spiel aus Strecke und config.js gerechnet
  const g = await A(p, () => {
    const A = window.__alpineRally, S = A.strecke, c = A.CONFIG.hud.minimap, m = A.hud.minimap;
    const w = S.box.maxX - S.box.minX, h = S.box.maxZ - S.box.minZ;
    const mass = Math.min((c.maxBreite - 2 * c.rand - 1) / w, (c.maxHoehe - 2 * c.rand - 1) / h);
    const ex = (x) => m.x + c.rand + 0.5 + (x - S.box.minX) * mass, ez = (z) => m.y + c.rand + 0.5 + (z - S.box.minZ) * mass;
    // ganze Strecke in der Tafel (innerhalb des 1-Pixel-Randes)
    let drin = true, minU = 1e9, maxU = -1e9, minV = 1e9, maxV = -1e9;
    for (let i = 0; i < S.anzahl; i++) {
      const u = Math.floor(ex(S.px[i])), v = Math.floor(ez(S.pz[i]));
      minU = Math.min(minU, u); maxU = Math.max(maxU, u); minV = Math.min(minV, v); maxV = Math.max(maxV, v);
      if (u < m.x + 1 || u > m.x + m.breite - 2 || v < m.y + 1 || v > m.y + m.hoehe - 2) drin = false;
    }
    return { x: m.x, y: m.y, b: m.breite, h: m.hoehe, mass, drin, minU, maxU, minV, maxV, maxB: c.maxBreite, maxH: c.maxHoehe, ms: A.minimapMs, nordenOben: ez(-1000) < ez(0) };
  });
  pruefe(g.b <= g.maxB && g.h <= g.maxH && g.x + g.b <= 320 - 1 && g.y >= 1, `Tafel ${g.b} x ${g.h} Pixel oben rechts (höchstens ${g.maxB} x ${g.maxH})`, `bei x ${g.x}..${g.x + g.b - 1}, y ${g.y}..${g.y + g.h - 1}, ${(g.mass * 1000).toFixed(1)} Pixel pro km, gebaut in ${g.ms.toFixed(1)} ms`);
  pruefe(g.drin, 'die ganze Strecke liegt in der Tafel (innerhalb des Randes)', `Linie x ${g.minU}..${g.maxU}, y ${g.minV}..${g.maxV}`);
  pruefe(g.nordenOben, 'Norden oben (kleineres z = weiter oben auf der Karte)');
  // Punkt bei Start, Mitte, Ziel: Teleport, ein Bild abwarten
  for (const [name, wo] of [['Start', 'start'], ['Mitte', 'mitte'], ['Ziel', 'ziel'], ['Wiese (40 m neben der Strasse)', 'wiese']]) {
    const r0 = await A(p, (wo) => {
      const A = window.__alpineRally, S = A.strecke;
      const s = wo === 'start' ? S.startS : wo === 'ziel' ? S.zielS : (S.startS + S.zielS) / 2;
      A.start({ countdown: false });
      A.setzeAuf(s, wo === 'wiese' ? 40 : 0);
      if (wo === 'wiese') A.physikSchritt(A.SCHRITT, window.__T.LEER); // Stelle aus der Abfrage der Spielschleife
      return { s: A.rennen.letztesS };
    }, wo);
    await bilderAbwarten(p, 3);
    const r = await A(p, (s) => {
      const A = window.__alpineRally, S = A.strecke, c = A.CONFIG.hud.minimap, m = A.hud.minimap;
      const w = S.box.maxX - S.box.minX, h = S.box.maxZ - S.box.minZ;
      const mass = Math.min((c.maxBreite - 2 * c.rand - 1) / w, (c.maxHoehe - 2 * c.rand - 1) / h);
      const i = Math.round(s);
      const ex = m.x + c.rand + 0.5 + (S.px[i] - S.box.minX) * mass, ez = m.y + c.rand + 0.5 + (S.pz[i] - S.box.minZ) * mass;
      const auto = { x: m.x + c.rand + 0.5 + (A.physik.x - S.box.minX) * mass, z: m.y + c.rand + 0.5 + (A.physik.z - S.box.minZ) * mass };
      const pk = m.punkt;
      const hell = window.__T.hudPixel(pk.rx, pk.ry, 2, 2, [c.farbeAuto]);
      // hell genug? (der Punkt pulsiert leicht)
      const d = document.getElementById('hud').getContext('2d').getImageData(pk.rx, pk.ry, 1, 1).data;
      return { ex, ez, px: pk.x, py: pk.y, mitteX: pk.rx + 1, mitteY: pk.ry + 1, hell: Math.min(d[0], d[1], d[2]), auto, abstand: A.strecke.abfrage(A.physik.x, A.physik.z).abstand, sichtbar: hell.sichtbar };
    }, r0.s);
    const ab = Math.hypot(r.mitteX - r.ex, r.mitteY - r.ez);
    pruefe(ab < 1 && Math.hypot(r.px - r.ex, r.py - r.ez) < 1e-3 && r.hell > 150, `Punkt bei ${name}: Abweichung ${ab.toFixed(2)} Pixel gegen die Projektion des Streckenpunkts`,
      `erwartet ${r.ex.toFixed(2)} / ${r.ez.toFixed(2)}, Quadrat-Mitte ${r.mitteX} / ${r.mitteY}, Helligkeit ${r.hell}${wo === 'wiese' ? `, Auto ${r.abstand.toFixed(1)} m neben der Mitte, Punkt bleibt auf der Linie` : ''}`);
  }
  // Überlappung: Zeit-Tafel, Live-Vergleich (breitester Fall), Meldungen, Pace-Notes (breitester Fall) gegen die Minimap
  const u = await A(p, async () => {
    const A = window.__alpineRally, PN = A.CONFIG.pacenotes, m = A.hud.minimap, L = A.hud.lage;
    const { TEXTE } = await import('/js/texte.js');
    const maxB = Math.max(...A.paceNotes.anzeige.alle.map((k) => k.breite));
    // breitester Fall: zwei der breitesten Kacheln nebeneinander, die erste mittig
    const notesL = 160 - Math.round(maxB / 2) - PN.innen - 1, notesR = 160 - Math.round(maxB / 2) + maxB + PN.luecke + maxB + PN.innen;
    const V = A.CONFIG.hud.vergleich, Z = A.CONFIG.hud.zeit;
    const vglB = Math.max(L.zeit.b, Z.innen * 2 + 4 * 5 - 1 + Z.luecke + (6 * 6 * V.groesse - V.groesse) + 2); // "LETZT" und "+99.9."
    const meldungB = Math.max(...['hud.cp', 'hud.cpVerpasst', 'hud.ansagenAn', 'hud.ansagenAus'].flatMap((k) => ['de', 'en'].map((s) => TEXTE[k][s].replace('{n}', '3').replace('{zeit}', '00:00.00').length * 6 - 1)));
    return { notesL, notesR, notesY: PN.oben + 0, zeitR: L.zeit.x + L.zeit.b, vglR: Z.links + vglB, mx: m.x, my: m.y, mh: m.hoehe, meldungR: Z.links + meldungB, maxB };
  });
  pruefe(u.notesR < u.mx, 'Minimap überlappt die Pace-Notes nicht (auch nicht bei zwei breiten Kacheln)', `Pace-Notes höchstens bis x ${u.notesR}, Minimap ab x ${u.mx}`);
  pruefe(u.zeitR < u.notesL && u.vglR < u.notesL && u.vglR < u.mx, 'Zeit-Tafel und Live-Vergleich (auch "+99.9") überlappen weder Pace-Notes noch Minimap',
    `Zeit bis x ${u.zeitR}, Vergleich höchstens bis x ${u.vglR}, Pace-Notes ab x ${u.notesL}`);
  pruefe(u.meldungR < u.mx, 'die längste Meldung (de/en) reicht nicht bis zur Minimap', `bis x ${u.meldungR}`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(b) Färbung der gefahrenen Strecke, Checkpoints');
{
  const spiel = await lade();
  const p = spiel.page;
  const stand = () => A(p, () => ({ maxS: window.__alpineRally.vergleich.spur.maxS, s: window.__alpineRally.rennen.letztesS, px: window.__T.gefahrenPixel(), gemalt: window.__alpineRally.hud.minimap.stand.neuGemalt }));
  const cpFarben = () => A(p, () => window.__alpineRally.hud.minimap.cps.map((c) => window.__T.kartenPixel(c.u, c.v)));
  const C = await A(p, () => window.__alpineRally.CONFIG.hud.minimap);
  // bis 600 m, dann bis zum Stand bremsen
  await A(p, async () => {
    const A = window.__alpineRally;
    await window.__T.fahre('flott', { bisS: 600 });
    for (let i = 0; i < 1200 && A.physik.tempo > 0.3; i++) A.rennSchritt(A.SCHRITT, { ...window.__T.LEER, bremse: 1 });
  });
  await bilderAbwarten(p, 3);
  const s1 = await stand();
  // rückwärts: 5 s Bremse/Rückwärts aus dem Stand
  await A(p, () => { const A = window.__alpineRally; for (let i = 0; i < 600; i++) A.rennSchritt(A.SCHRITT, { ...window.__T.LEER, bremse: 1 }); });
  await bilderAbwarten(p, 3);
  const s2 = await stand();
  // R: zurück auf die Strasse (4 s Wartezeit), dazu ein Sprung 80 m zurück
  await A(p, () => { const A = window.__alpineRally; A.rTaste(); for (let i = 0; i < 600; i++) A.rennSchritt(A.SCHRITT, window.__T.LEER); A.setzeAuf(A.rennen.letztesS - 80); A.rennSchritt(A.SCHRITT, window.__T.LEER); });
  await bilderAbwarten(p, 3);
  const s3 = await stand();
  pruefe(s1.px > 10 && s1.maxS > 590, `nach 600 m und Bremsen: ${s1.px} Pixel gefahren (gelb/orange)`, `maxS ${s1.maxS.toFixed(0)} m`);
  // (aus dem Stand rollt das Auto beim Umschalten noch Millimeter vor: maxS darf nur so wenig wachsen)
  const gleich = (a, b) => b.maxS >= a.maxS && b.maxS - a.maxS < 0.5 && b.px === a.px;
  pruefe(s2.s < s1.s - 5 && gleich(s1, s2), 'rückwärts gefahren: Färbung bleibt gleich (schrumpft nicht)', `Auto ${s1.s.toFixed(1)} -> ${s2.s.toFixed(1)} m, maxS ${s1.maxS.toFixed(2)} -> ${s2.maxS.toFixed(2)} m, ${s1.px} -> ${s2.px} Pixel`);
  pruefe(s3.s < s1.s - 50 && gleich(s2, s3), 'R und Sprung zurück: Färbung bleibt gleich', `Auto bei ${s3.s.toFixed(0)} m, maxS ${s3.maxS.toFixed(2)} m, ${s3.px} Pixel`);
  const f0 = await cpFarben();
  pruefe(f0.every((f) => gleicheFarbe(f, C.farbeCpOffen)), 'vor Checkpoint 1: alle Checkpoint-Striche weiss', f0.join(' '));
  // weiter bis hinter Checkpoint 1 (900 m), dabei zählen, wie oft die Karte neu gemalt wird
  const gemaltVor = (await stand()).gemalt;
  let bilder = 0;
  for (let ziel = 620; ziel <= 960; ziel += 20) {
    await A(p, async (z) => { const f = await import(window.__fahrerUrl); f.fahreBis(window.__alpineRally, 'flott', { bisS: z }); }, ziel);
    await bilderAbwarten(p, 2); bilder += 2;
  }
  const s4 = await stand();
  const f1 = await cpFarben();
  pruefe(s4.px > s1.px && s4.maxS > 950, 'weiter vorwärts: Färbung wächst', `${s1.px} -> ${s4.px} Pixel`);
  pruefe(gleicheFarbe(f1[0], C.farbeCpDurch) && gleicheFarbe(f1[1], C.farbeCpOffen), 'Checkpoint 1 durchfahren: Strich grün, Checkpoint 2 weiss', f1.join(' '));
  const neu = s4.gemalt - gemaltVor;
  pruefe(neu <= Math.ceil((s4.maxS - s3.maxS) / C.neuFaerbenAb) + 1 && neu < bilder, `Karte nicht jedes Bild neu gemalt: ${neu} Mal in ${bilder} Bildern (${(s4.maxS - s3.maxS).toFixed(0)} m, alle ${C.neuFaerbenAb} m)`);
  // Checkpoint 2 auslassen (Sprung hinter das Tor): "CHECKPOINT VERPASST", Strich rot, Auto zurück
  await A(p, () => { const A = window.__alpineRally; A.setzeAuf(A.checkpoints[1].s + 10); A.rennSchritt(A.SCHRITT, window.__T.LEER); });
  await bilderAbwarten(p, 3);
  const f2 = await cpFarben();
  const m2 = await A(p, () => ({ meldung: window.__alpineRally.hudMeldung(), s: window.__alpineRally.rennen.letztesS, maxS: window.__alpineRally.vergleich.spur.maxS }));
  pruefe(gleicheFarbe(f2[1], C.farbeCpVerpasst) && /VERPASST/.test(m2.meldung) && m2.maxS === s4.maxS, 'Checkpoint 2 ausgelassen: Strich rot (solange "CHECKPOINT VERPASST" steht), Färbung springt nicht mit', `${f2.join(' ')}, Auto zurück bei ${m2.s.toFixed(0)} m`);
  await A(p, () => { const A = window.__alpineRally; for (let i = 0; i < 400; i++) A.rennSchritt(A.SCHRITT, window.__T.LEER); });
  await bilderAbwarten(p, 3);
  const f3 = await cpFarben();
  pruefe(gleicheFarbe(f3[1], C.farbeCpOffen), 'nach der Meldung (Auto steht wieder davor): Checkpoint 2 wieder weiss', f3.join(' '));
  // ohne Zurücksetzen (abkuerzungenVerhindern aus): verpasst bleibt rot
  await A(p, () => { const A = window.__alpineRally; A.CONFIG.checkpoints.abkuerzungenVerhindern = false; A.setzeAuf(A.checkpoints[1].s + 10); A.rennSchritt(A.SCHRITT, window.__T.LEER); for (let i = 0; i < 480; i++) A.rennSchritt(A.SCHRITT, window.__T.LEER); A.CONFIG.checkpoints.abkuerzungenVerhindern = true; });
  await bilderAbwarten(p, 3);
  const f4 = await cpFarben();
  pruefe(gleicheFarbe(f4[1], C.farbeCpVerpasst), 'verpasst und übersprungen (abkuerzungenVerhindern aus): Strich bleibt rot', f4.join(' '));
  // neuer Lauf: alles wieder blaugrau
  await A(p, () => window.__alpineRally.start({ countdown: false }));
  await bilderAbwarten(p, 3);
  const s5 = await stand(), f5 = await cpFarben();
  pruefe(s5.px === 0 && f5.every((f) => gleicheFarbe(f, C.farbeCpOffen)), 'neuer Lauf: nichts gefahren, alle Striche weiss');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(c) Fahrspur, (d) Vergleich');
let flott = null; // Ergebnis der ersten Fahrt (für Teil e)
{
  const spiel = await lade();
  const p = spiel.page;
  // (c) komplette Fahrt "flott" (fliegender Start wie die Testfahrer-Zeiten), jeden Schritt mitschreiben
  const c = await A(p, async () => {
    const A = window.__alpineRally, V = A.vergleich, S = A.strecke;
    const schritte = []; // [maxS, zeit] nach jedem Schritt mit laufender Zeit
    const fahrt = await window.__T.fahre('flott', { ganz: true, mit: () => schritte.push([V.spur.maxS, A.rennen.zeit, A.rennen.zustand]) });
    const best = JSON.parse(localStorage.getItem('alpineRally.bestzeiten')).passstrasse[0];
    const letzter = JSON.parse(localStorage.getItem('alpineRally.letzterLauf')).passstrasse;
    // echte Zeit beim Erreichen jeder Stelle: Schritt, in dem maxS sie zum ersten Mal erreicht (und eingepasst)
    const D = V.abstand, abw = [], abwSchritt = [];
    let j = 0;
    for (let k = 0; k < V.K; k++) {
      const sk = S.startS + k * D;
      while (j < schritte.length && !(schritte[j][0] >= sk && schritte[j][2] !== 'bereit')) j++;
      if (j >= schritte.length) { abw.push(99); continue; }
      const [m1, t1] = schritte[j], [m0, t0] = j > 0 && schritte[j - 1][2] === 'laeuft' ? schritte[j - 1] : [m1, t1];
      const echt = m1 > m0 ? t0 + (t1 - t0) * (sk - m0) / (m1 - m0) : t1;
      abw.push(Math.abs(best.spur[k] - echt));
      abwSchritt.push(Math.abs(best.spur[k] - t1));
    }
    return { fahrt, spur: best.spur, endZeit: best.zeit, letzter, K: V.K, D, abwMax: Math.max(...abw), abwSchrittMax: Math.max(...abwSchritt), proben: [0, 90, 180, 270, 359].map((k) => [k, best.spur[k], abw[k]]), schritt: A.SCHRITT };
  });
  flott = c.fahrt;
  const steigt = c.spur.every((v, i) => i === 0 || v > c.spur[i - 1]);
  pruefe(c.fahrt.ziel && fmt(c.fahrt.zeit) === '2:31.92', `Testfahrer "flott" im Ziel: ${fmt(c.fahrt.zeit)} (unverändert)`);
  pruefe(c.spur.length === c.K + 1 && c.spur.length > 350 && c.spur.length < 370, `Fahrspur mit der Bestzeit gespeichert: ${c.spur.length} Werte (alle ${c.D} m von der Startlinie bis kurz vor dem Ziel, dazu die Endzeit)`);
  pruefe(steigt, 'Fahrspur streng aufsteigend');
  pruefe(Math.abs(c.spur[c.spur.length - 1] - c.endZeit) <= 0.01 && c.spur.every((v) => Math.round(v * 100) === v * 100 || Math.abs(Math.round(v * 100) - v * 100) < 1e-6),
    'letzter Wert = Endzeit (±0.01), alle Werte auf 0.01 s gerundet', `${c.spur[c.spur.length - 1]} / ${c.endZeit.toFixed(3)}`);
  pruefe(c.abwMax <= 0.0051 && c.abwSchrittMax <= c.schritt + 0.0051, `Zeitpunkt jedes Werts stimmt: höchstens ${c.abwMax.toFixed(4)} s neben der echten Zeit beim Erreichen der Stelle (eingepasst zwischen zwei Schritten)`,
    `gegen die Zeit des Schritts: höchstens ${c.abwSchrittMax.toFixed(4)} s; Stichproben ${c.proben.map(([k, v, a]) => `${k}: ${v} s (±${a.toFixed(3)})`).join(', ')}`);
  pruefe(c.letzter && c.letzter.zeit === c.endZeit && JSON.stringify(c.letzter.spur) === JSON.stringify(c.spur), 'derselbe Lauf ist als "letzter Lauf" gespeichert (mit Spur)');

  // Speicherbedarf: Bestzeiten-Liste mit 10 Spuren
  const kb = await A(p, async () => {
    const B = await import('/js/bestzeiten.js');
    const best = B.ladeBestzeiten('passstrasse')[0];
    const sicher = localStorage.getItem('alpineRally.bestzeiten');
    for (let i = 1; i < 10; i++) B.speichereBestzeit('passstrasse', { ...best, zeit: best.zeit + i * 1.37, spur: best.spur.map((v) => Math.round(v * (1 + i * 0.009) * 100) / 100) });
    const roh = localStorage.getItem('alpineRally.bestzeiten');
    const n = JSON.parse(roh).passstrasse.length;
    localStorage.setItem('alpineRally.bestzeiten', sicher);
    return { zeichen: roh.length, n };
  });
  pruefe(kb.n === 10 && kb.zeichen < 200000, `Speicherbedarf: Bestzeiten-Liste mit 10 Spuren = ${(kb.zeichen / 1024).toFixed(1)} KB Text (Browser speichert 2 Byte je Zeichen: ca. ${(kb.zeichen * 2 / 1024).toFixed(0)} KB)`);

  // (d) zweiter, identischer Lauf gegen die erste Bestzeit
  const d1 = await A(p, async () => {
    const m = window.__T.mitschnitt();
    const r = await window.__T.fahre('flott', { ganz: true, mit: m.mit });
    return { zeit: r.zeit, max: m.max, maxWo: m.maxWo, alle: [...m.alle], stufen: m.stufen, updates: m.updates, art: window.__alpineRally.vergleich.ref.art };
  });
  pruefe(d1.art === 'spur' && d1.max < 0.05, `identischer Lauf: Unterschied auf der ganzen Strecke unter 0.05 s (höchstens ${d1.max.toFixed(3)} s bei ${d1.maxWo.toFixed(0)} m)`);
  pruefe(d1.alle.length === 1 && d1.alle[0] === '0.0' && d1.stufen === 0, 'identischer Lauf: Anzeige immer weiss "0.0"', `angezeigt: ${d1.alle.join(', ')}`);
  // langsamerer Lauf: höchstens 90 % Gas
  const d2 = await A(p, async () => {
    const m = window.__T.mitschnitt();
    const r = await window.__T.fahre('flott', { gas: 0.9, mit: m.mit });
    const n = m.roh.length, q = (f) => m.roh[Math.min(n - 1, Math.floor(n * f))][1];
    return { zeit: r.zeit, ziel: r.ziel, viertel: [q(0.25), q(0.5), q(0.75), m.roh[n - 1][1]], letzte: m.letzte, vorz: m.vorz, positivAb: m.roh.findIndex(([, d]) => d > 0.3), negNach: m.roh.filter(([, d], i) => i > m.roh.findIndex(([, x]) => x > 0.3) && d < 0).length };
  });
  await bilderAbwarten(p, 3);
  const C = await A(p, () => window.__alpineRally.CONFIG.hud.vergleich);
  // Farbe im HUD: im Rennen anhalten und die Tafel lesen
  const farbe = async () => A(p, (C) => { const L = window.__alpineRally.hud.lage.vergleich; return L.y < 0 ? null : window.__T.hudPixel(L.x, L.y, L.b, L.h, [C.farbeSchneller, C.farbeLangsamer, C.farbeGleich]).n; }, C);
  pruefe(d2.ziel && d2.zeit > flott.zeit, `langsamerer Lauf (90 % Gas): ${fmt(d2.zeit)}`);
  const w = d2.viertel;
  pruefe(w.every((x) => x > 0) && w[0] < w[1] && w[1] < w[2] && w[2] < w[3], 'langsamer: Unterschied positiv und wächst', w.map((x) => `+${x.toFixed(2)}`).join(' -> '));
  pruefe(d2.letzte.stufe === 1 && d2.letzte.txt === `+${(Math.round(d2.letzte.roh * 10) / 10).toFixed(1)}` && d2.vorz === 0 && d2.negNach === 0,
    'langsamer: zuletzt rot mit Plus, richtig gerundet, nie ein Vorzeichenwechsel', `zuletzt "${d2.letzte.txt}" bei ${d2.letzte.roh.toFixed(3)} s`);
  // in der Mitte eines langsamen Laufs anhalten: Tafel rot
  await A(p, async () => { await window.__T.fahre('flott', { gas: 0.9, bisS: 1500 }); });
  await bilderAbwarten(p, 3);
  const fr = await farbe();
  pruefe(fr && fr[1] > 20 && fr[0] === 0, 'im HUD: Zahl rot (langsamer)', fr && `rot ${fr[1]}, grün ${fr[0]} Pixel`);
  // schneller: Referenz = letzter Lauf (der langsame), "flott" mit vollem Gas
  const d3 = await A(p, async () => {
    const E = await import('/js/einstellungen.js');
    const A = window.__alpineRally;
    await window.__T.fahre('flott', { gas: 0.9 }); // dieser langsame Lauf wird der letzte Lauf
    E.setze('vergleichMit', 'letzter');
    const m = window.__T.mitschnitt();
    await window.__T.fahre('flott', { bisS: 1500, mit: m.mit });
    const n = m.roh.length;
    return { quelle: A.vergleich.ref.quelle, roh: m.roh[n - 1][1], letzte: m.letzte, vorz: m.vorz, posNach: m.roh.filter(([, d], i) => i > m.roh.findIndex(([, x]) => x < -0.3) && d > 0).length };
  });
  await bilderAbwarten(p, 3);
  const fg = await farbe();
  pruefe(d3.quelle === 'letzter' && d3.roh < 0 && d3.letzte.stufe === -1 && d3.letzte.txt.startsWith('-') && d3.posNach === 0 && d3.vorz === 0,
    'schneller (gegen den letzten, langsamen Lauf): negativ, grün mit Minus, kein Vorzeichenwechsel', `"${d3.letzte.txt}" bei ${d3.roh.toFixed(2)} s`);
  pruefe(fg && fg[0] > 20 && fg[1] === 0, 'im HUD: Zahl grün (schneller)', fg && `grün ${fg[0]}, rot ${fg[1]} Pixel`);
  // konstanter Abstand: Referenz = eigene Spur + 0.5 s (überall), gleicher Lauf -> immer "-0.5" (keine Vorzeichenwechsel)
  const d4 = await A(p, async () => {
    const A = window.__alpineRally, B = await import('/js/bestzeiten.js');
    const best = B.ladeBestzeiten('passstrasse')[0];
    const res = {};
    for (const versatz of [0.5, 0.06, -0.3]) {
      const m = window.__T.mitschnitt();
      const f = await import(window.__fahrerUrl);
      // fahreEtappe startet mit A.neustart() (lädt die Referenz): danach die verschobene Referenz setzen
      const neustart = A.neustart;
      A.neustart = () => { neustart(); A.vergleich.setzeReferenz({ ...best, spur: best.spur.map((v) => v + versatz), zeit: best.zeit + versatz }, 'best'); };
      f.fahreEtappe(A, 'flott', () => { A.vergleich.aktualisiere(A.SCHRITT, A.rennen.letztesS, A.rennen.zeit, A.rennen.zustand === 'laeuft'); m.mit(); });
      A.neustart = neustart;
      res[versatz] = { vorz: m.vorz, stufen: m.stufen, zahlen: m.zahlen, updates: m.updates, alle: [...m.alle], sekunden: A.rennen.zeit };
    }
    return res;
  });
  pruefe(d4[0.5].vorz === 0 && d4[0.5].stufen === 0, `konstanter Abstand 0.5 s: 0 Vorzeichenwechsel`, `angezeigt: ${d4[0.5].alle.join(', ')}; die Zahl wechselte ${d4[0.5].zahlen} Mal in ${d4[0.5].sekunden.toFixed(0)} s`);
  pruefe(d4[-0.3].vorz === 0 && d4[-0.3].stufen === 0, `konstanter Abstand -0.3 s: 0 Vorzeichenwechsel`, `angezeigt: ${d4[-0.3].alle.join(', ')}; die Zahl wechselte ${d4[-0.3].zahlen} Mal`);
  pruefe(d4[0.06].vorz === 0, `konstanter Abstand 0.06 s (knapp an der Grenze 0.05): kein Wechsel zwischen grün und rot`, `angezeigt: ${d4[0.06].alle.join(', ')}; Farbe wechselte ${d4[0.06].stufen} Mal (zwischen weiss "0.0" und grün)`);
  // Rundung, Grenze, Hysterese und Takt direkt
  const r = await A(p, () => {
    const A = window.__alpineRally, V = A.vergleich;
    // Referenz mit Zeit = s / 10 (10 m/s gleichmässig), eigene Zeit = s/10 + d
    const S = A.strecke, K = V.K;
    const spur = [];
    for (let k = 0; k < K; k++) spur.push(Math.round((k * V.abstand / 10 + 5) * 100) / 100);
    spur.push(Math.round(((S.zielS - S.startS) / 10 + 5) * 100) / 100);
    V.setzeReferenz({ zeit: spur[K], cps: [], spur }, 'best');
    const zeig = (d) => { V.zuruecksetzen(); V.setzeReferenz({ zeit: spur[K], cps: [], spur }, 'best'); const a = V.aktualisiere(0.016, 1025, 105 + d, true); return a.stufe === 0 ? '0.0' : `${a.stufe < 0 ? '-' : '+'}${Math.floor(a.wert / 10)}.${a.wert % 10}`; };
    const faelle = [0.84, 0.86, -1.24, -1.26, 0.04, -0.049, 0.06, 0.12, 12.34, -0.06];
    const texte = faelle.map(zeig);
    // Hysterese: abwechselnd 0.04 / 0.06 (über die Grenze 0.05) und 0.44 / 0.46 (über die Rundungsgrenze), je 0.2 s
    const wechsel = (a, b) => { V.zuruecksetzen(); V.setzeReferenz({ zeit: spur[K], cps: [], spur }, 'best'); let v = -1, n = -1; for (let i = 0; i < 50; i++) { const x = V.aktualisiere(0.2, 1025, 105 + (i % 2 ? b : a), true); if (x.version !== v) { v = x.version; n++; } } return n; };
    // Takt: 1 s lang jedes Bild (1/120 s) ein anderer Wert
    V.zuruecksetzen(); V.setzeReferenz({ zeit: spur[K], cps: [], spur }, 'best');
    let v = -1, neu = 0;
    for (let i = 0; i < 120; i++) { const x = V.aktualisiere(1 / 120, 1025, 105 + i * 0.05, true); if (x.version !== v) { v = x.version; neu++; } }
    return { faelle, texte, w1: wechsel(0.04, 0.06), w2: wechsel(0.44, 0.46), w3: wechsel(-0.3, 0.3), neu };
  });
  const soll = ['+0.8', '+0.9', '-1.2', '-1.3', '0.0', '0.0', '+0.1', '+0.1', '+12.3', '-0.1'];
  pruefe(JSON.stringify(r.texte) === JSON.stringify(soll), 'Rundung auf eine Stelle, Vorzeichen, unter 0.05 s weiss "0.0"', r.faelle.map((f, i) => `${f} -> ${r.texte[i]}`).join(', '));
  pruefe(r.w1 === 0 && r.w2 === 0, 'kein Flackern: Rauschen um die Grenze 0.05 und um eine Rundungsgrenze ändert die Anzeige nicht', `0.04/0.06: ${r.w1} Wechsel, 0.44/0.46: ${r.w2} Wechsel in 10 s`);
  pruefe(r.w3 === 49, 'echte Wechsel (-0.3 / +0.3) werden angezeigt', `${r.w3} Wechsel`);
  pruefe(r.neu <= 6, `höchstens 5 Mal pro Sekunde neu (1 s lang jedes Bild ein anderer Wert: ${r.neu} Mal angezeigt)`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(e) Keine Referenz, alte Bestzeiten ohne Spur, Bestzeit / Letzter Lauf');
{
  const spiel = await lade();
  const p = spiel.page;
  // keine Referenz (Speicher leer): nichts angezeigt
  const e1 = await A(p, async () => {
    const m = window.__T.mitschnitt();
    await window.__T.fahre('flott', { bisS: 800, mit: m.mit });
    return { updates: m.updates, sichtbar: window.__alpineRally.vergleich.anzeige.sichtbar, n: window.__alpineRally.vergleich.ref.n };
  });
  await bilderAbwarten(p, 3);
  const L1 = await A(p, () => window.__alpineRally.hud.lage);
  pruefe(e1.n === 0 && e1.updates === 0 && !e1.sichtbar && L1.vergleich.y < 0, 'keine Referenz (erste Fahrt): nichts angezeigt, keine Platzhalter-Zahl');
  // Letzter Lauf gewählt, aber noch keiner da
  const e2 = await A(p, async () => {
    const E = await import('/js/einstellungen.js');
    E.setze('vergleichMit', 'letzter');
    const m = window.__T.mitschnitt();
    await window.__T.fahre('flott', { bisS: 300, mit: m.mit });
    E.setze('vergleichMit', 'best');
    return { updates: m.updates, n: window.__alpineRally.vergleich.ref.n };
  });
  pruefe(e2.n === 0 && e2.updates === 0, '"Letzter Lauf" gewählt, aber noch keiner: nichts angezeigt');
  // andere Etappe (gibt es noch nicht): Bestzeit einer anderen Etappe zählt nicht
  const e3 = await A(p, async () => {
    localStorage.setItem('alpineRally.bestzeiten', JSON.stringify({ andere: [{ zeit: 150, cps: [30, 90, 130], datum: null }] }));
    window.__alpineRally.start({ countdown: false });
    return window.__alpineRally.vergleich.ref.n;
  });
  pruefe(e3 === 0, 'Bestzeit nur von einer anderen Etappe: keine Referenz');
  // alte Bestzeit ohne Spur (wie aus M5b): Zeit und Zwischenzeiten der flotten Fahrt
  const e4 = await A(p, async (fl) => {
    const A = window.__alpineRally;
    localStorage.setItem('alpineRally.bestzeiten', JSON.stringify({ passstrasse: [{ zeit: fl.zeit, cps: fl.cps, datum: '2026-10-16T12:00:00.000Z' }] }));
    const cpS = A.checkpoints.map((c) => c.s);
    const amCp = [];
    let naechster = 0;
    const m = window.__T.mitschnitt();
    await window.__T.fahre('flott', {
      ganz: true,
      mit: () => {
        m.mit();
        // im Schritt, in dem die Zwischenzeit genommen wird
        if (naechster < cpS.length && A.rennen.zwischenzeiten[naechster] != null) {
          amCp.push(A.rennen.zeit - A.vergleich.referenzBei(A.rennen.letztesS));
          naechster++;
        }
      },
    });
    return { art: A.vergleich.ref.art, n: A.vergleich.ref.n, amCp, max: m.max, maxWo: m.maxWo };
  }, flott);
  pruefe(e4.art === 'naeherung' && e4.n === 5, 'alte Bestzeit ohne Spur: Näherung aus Start, 3 Zwischenzeiten und Endzeit', `${e4.n} Punkte`);
  pruefe(e4.amCp.length === 3 && e4.amCp.every((d) => Math.abs(d) < 0.02), 'gleicher Lauf, an den Checkpoints stimmt der Unterschied genau', e4.amCp.map((d) => d.toFixed(3)).join(' / '));
  console.log(`         (dazwischen geglättet: höchstens ${e4.max.toFixed(2)} s daneben, bei ${e4.maxWo.toFixed(0)} m)`);
  // Bestzeit (Platz 1) gegen letzten Lauf: Einstellung wählt die Referenz
  const e5 = await A(p, async () => {
    const A = window.__alpineRally, E = await import('/js/einstellungen.js');
    localStorage.setItem('alpineRally.bestzeiten', JSON.stringify({ passstrasse: [{ zeit: 160, cps: [30, 90, 140], datum: null }, { zeit: 150, cps: [28, 85, 132], datum: null }] }));
    localStorage.setItem('alpineRally.letzterLauf', JSON.stringify({ passstrasse: { zeit: 175, cps: [33, 99, 152], spur: null, datum: null } }));
    const ende = () => A.vergleich.referenzBei(A.strecke.zielS + 10);
    E.setze('vergleichMit', 'best');
    A.start({ countdown: false });
    const best = [ende(), A.vergleich.ref.quelle];
    E.setze('vergleichMit', 'letzter');
    const sofort = [ende(), A.vergleich.ref.quelle];
    A.start();
    const naechster = [ende(), A.vergleich.ref.quelle];
    E.setze('vergleichMit', 'best');
    A.start();
    return { best, sofort, naechster, zurueck: [ende(), A.vergleich.ref.quelle] };
  });
  pruefe(e5.best[0] === 150 && e5.best[1] === 'best', '"Bestzeit": Platz 1 der Top 10 (150 s, nicht die erste in der Liste)');
  pruefe(e5.naechster[0] === 175 && e5.naechster[1] === 'letzter' && e5.sofort[0] === 175, '"Letzter Lauf": der letzte Lauf (175 s), wirkt beim nächsten Start (und schon sofort)');
  pruefe(e5.zurueck[0] === 150, 'zurück auf "Bestzeit": wieder Platz 1');
  // der Zielbildschirm vergleicht weiter mit der Bestzeit (auch wenn "Letzter Lauf" gewählt ist)
  const e6 = await A(p, async () => {
    const A = window.__alpineRally, E = await import('/js/einstellungen.js');
    E.setze('vergleichMit', 'letzter');
    A.start({ countdown: false });
    A.setzeAuf(A.strecke.zielS - 30);
    const ph = A.physik; ph.vx = Math.sin(ph.richtung) * 20; ph.vz = Math.cos(ph.richtung) * 20; ph.vVor = 20;
    A.rennen.zustand = 'laeuft'; A.rennen.zwischenzeiten = [30, 90, 140]; A.rennen.naechsterCp = 3;
    for (let n = 0; n < 2000 && A.rennen.zustand !== 'ziel'; n++) A.physikSchritt(A.SCHRITT, { gas: 0.5, bremse: 0, lenkung: 0 });
    A.rennen.endZeit = 155; A.rennen.zeit = 155;
    A.rennSchritt(A.SCHRITT, window.__T.LEER);
    E.setze('vergleichMit', 'best');
    return A.lauf.ergebnis.bisher.zeit;
  });
  pruefe(e6 === 150, 'Zielbildschirm vergleicht weiter mit der Bestzeit (nicht mit dem letzten Lauf)', `bisher ${e6} s`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(f) Browser-Speicher blockiert');
{
  const spiel = await lade({ ohneSpeicher: true });
  const p = spiel.page;
  const f = await A(p, async () => {
    const A = window.__alpineRally;
    const erst = await window.__T.fahre('flott', { ganz: true });
    const gespeichert = A.lauf.ergebnis.gespeichert;
    const m = window.__T.mitschnitt();
    await window.__T.fahre('flott', { ganz: true, mit: m.mit });
    const E = await import('/js/einstellungen.js');
    E.setze('vergleichMit', 'letzter');
    A.start({ countdown: false });
    const letzter = A.vergleich.ref.art;
    E.setze('vergleichMit', 'best');
    return { erst: erst.zeit, gespeichert, art: A.vergleich.ref.art, max: m.max, updates: m.updates, letzter };
  });
  pruefe(!f.gespeichert && f.art === 'spur' && f.updates > 0 && f.max < 0.05, 'ohne Browser-Speicher: kein Fehler, Vergleich mit der Bestzeit der Sitzung funktioniert', `höchstens ${f.max.toFixed(3)} s`);
  pruefe(f.letzter === 'spur', 'ohne Browser-Speicher: "Letzter Lauf" der Sitzung ebenso');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(g) Taste H: HUD aus/an');
{
  const spiel = await lade();
  const p = spiel.page;
  // Bereiche: Zeit-Tafel, Minimap, Tachos, Pace-Notes-Zeile; Hinweis unten Mitte; Countdown/ZIEL! in der Mitte
  const bereiche = await A(p, () => { const m = window.__alpineRally.hud.minimap; return { zeit: [2, 2, 70, 20], minimap: [m.x, m.y, m.breite, m.hoehe], tachos: [210, 120, 108, 58], hinweis: [100, 150, 120, 18], mitte: [100, 45, 120, 60] }; });
  const zaehle = (name) => A(p, ([b]) => window.__T.hudPixel(...b).sichtbar, [bereiche[name]]);
  await A(p, async () => { await window.__T.fahre('flott', { bisS: 400 }); });
  await bilderAbwarten(p, 3);
  const an = { zeit: await zaehle('zeit'), minimap: await zaehle('minimap'), tachos: await zaehle('tachos') };
  await p.keyboard.press('KeyH'); await bilderAbwarten(p, 3);
  const aus = { an: await A(p, () => window.__alpineRally.hudSchalter.an), zeit: await zaehle('zeit'), minimap: await zaehle('minimap'), tachos: await zaehle('tachos'), hinweis: await zaehle('hinweis') };
  pruefe(an.zeit > 100 && an.minimap > 500 && an.tachos > 500, 'HUD an: Zeit-Tafel, Minimap, Tachos sichtbar');
  pruefe(!aus.an && aus.zeit === 0 && aus.minimap === 0 && aus.tachos === 0 && aus.hinweis > 50, 'Taste H: Zeit-Tafel, Minimap, Tachos weg, kurzer Hinweis "HUD AUS" unten', `${aus.hinweis} Pixel Hinweis`);
  // Hinweis verschwindet nach ca. 1.5 s
  await p.waitForTimeout(1800); await bilderAbwarten(p, 2);
  pruefe((await zaehle('hinweis')) === 0, 'Hinweis nach 1.5 s weg (ganzes Bild leer)', `${(await A(p, () => window.__T.hudPixel(0, 0, 320, 180).sichtbar))} Pixel im ganzen HUD`);
  // Pause bleibt sichtbar
  await A(p, () => window.__alpineRally.pausieren()); await p.waitForTimeout(400); await bilderAbwarten(p, 2);
  const pause = await A(p, () => ({ z: window.__alpineRally.ablauf.zustand, sicht: window.__alpineRally.blenden.sicht, seite: window.__alpineRally.menue.seite.id }));
  await A(p, () => window.__alpineRally.weiter());
  pruefe(pause.z === 'pause' && pause.sicht > 0.9 && pause.seite === 'pause', 'HUD aus: Pause-Menü bleibt sichtbar');
  // Countdown bleibt sichtbar
  await A(p, () => { const A = window.__alpineRally; A.start(); A.lauf.countdown = 1.4; });
  await bilderAbwarten(p, 3);
  const cd = { mitte: await zaehle('mitte'), zeit: await zaehle('zeit'), an: await A(p, () => window.__alpineRally.hudSchalter.an) };
  pruefe(!cd.an && cd.mitte > 200 && cd.zeit === 0, 'HUD aus: Countdown-Zahl bleibt sichtbar (Zeit-Tafel nicht)', `${cd.mitte} Pixel in der Mitte`);
  // ZIEL! und Zielbildschirm bleiben sichtbar
  await A(p, () => {
    const A = window.__alpineRally, LEER = window.__T.LEER;
    while (A.ablauf.zustand === 'countdown') A.rennSchritt(A.SCHRITT, LEER);
    A.setzeAuf(A.strecke.zielS - 30);
    const ph = A.physik; ph.vx = Math.sin(ph.richtung) * 20; ph.vz = Math.cos(ph.richtung) * 20; ph.vVor = 20;
    A.rennen.zwischenzeiten = [30, 90, 140]; A.rennen.naechsterCp = 3;
    for (let n = 0; n < 2000 && A.rennen.zustand !== 'ziel'; n++) A.rennSchritt(A.SCHRITT, { ...LEER, gas: 0.5 });
  });
  await bilderAbwarten(p, 3);
  const ziel = await zaehle('mitte');
  await A(p, () => { const A = window.__alpineRally; for (let n = 0; n < 400 && A.ablauf.zustand !== 'ziel'; n++) A.rennSchritt(A.SCHRITT, window.__T.LEER); });
  await p.waitForTimeout(400); await bilderAbwarten(p, 2);
  const zs = await A(p, () => ({ z: window.__alpineRally.ablauf.zustand, sicht: window.__alpineRally.blenden.sicht, seite: window.__alpineRally.menue.seite.id }));
  pruefe(ziel > 500, 'HUD aus: "ZIEL!" bleibt sichtbar', `${ziel} Pixel`);
  pruefe(zs.z === 'ziel' && zs.sicht > 0.9 && zs.seite === 'ziel', 'HUD aus: Zielbildschirm bleibt sichtbar');
  // wieder an
  await A(p, () => window.__alpineRally.start({ countdown: false })); await bilderAbwarten(p, 2);
  await p.keyboard.press('KeyH'); await bilderAbwarten(p, 3);
  pruefe((await A(p, () => window.__alpineRally.hudSchalter.an)) && (await zaehle('zeit')) > 100, 'nochmals H: HUD wieder an');
  // belegbar: J statt H; Doppelbelegung wird getauscht
  const b = await A(p, async () => {
    const E = await import('/js/einstellungen.js');
    const r1 = E.belegeTaste('hud', 0, 'KeyJ');
    return { r1, hud: E.einstellungen.tasten.hud.slice() };
  });
  await p.keyboard.press('KeyH'); await bilderAbwarten(p, 2);
  const nachH = await A(p, () => window.__alpineRally.hudSchalter.an);
  await p.keyboard.press('KeyJ'); await bilderAbwarten(p, 2);
  const nachJ = await A(p, () => window.__alpineRally.hudSchalter.an);
  await p.keyboard.press('KeyJ'); await bilderAbwarten(p, 2);
  pruefe(b.r1.ok && b.hud[0] === 'KeyJ' && nachH === true && nachJ === false, 'Taste belegbar: auf J gelegt, H tut nichts mehr, J schaltet');
  const t2 = await A(p, async () => {
    const E = await import('/js/einstellungen.js');
    const r = E.belegeTaste('hud', 0, 'KeyN');
    const t = JSON.parse(JSON.stringify(E.einstellungen.tasten));
    const seite = window.__alpineRally.seiten.tasten.eintraege.some((e) => e.typ === 'taste' && e.aktion === 'hud');
    E.tastenStandard();
    const steuerung = window.__alpineRally.seiten.steuerung.eintraege.map((e) => (e.inhalt ? e.inhalt() : '')).filter((x) => /HUD/.test(x));
    return { r, t, seite, steuerung, std: E.einstellungen.tasten.hud.slice() };
  });
  pruefe(t2.r.art === 'getauscht' && t2.r.mit === 'notes' && t2.t.hud[0] === 'KeyN' && t2.t.notes[0] === 'KeyJ', 'Doppelbelegung (N): getauscht, Pace-Notes bekommt J');
  pruefe(t2.seite && t2.steuerung.length === 1 && /HUD AUS\/AN \| H/.test(t2.steuerung[0]) && t2.std[0] === 'KeyH', 'in TASTEN BELEGEN und auf der Seite STEUERUNG dabei, Standard = H', t2.steuerung[0]);
  // nicht gespeichert: aus, neu laden -> an
  await p.keyboard.press('KeyH'); await bilderAbwarten(p, 2);
  const vorLaden = await A(p, () => window.__alpineRally.hudSchalter.an);
  await p.reload(); await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 }); await bilderAbwarten(p, 3);
  const nachLaden = await A(p, () => ({ an: window.__alpineRally.hudSchalter.an, roh: localStorage.getItem('alpineRally.einstellungen') || '' }));
  pruefe(vorLaden === false && nachLaden.an === true && !/hudAn|hudAus/.test(nachLaden.roh), 'nicht gespeichert: nach dem Neuladen ist das HUD wieder an');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}
{
  // alte gespeicherte Tastenbelegung ohne "hud", H schon selbst vergeben (Handbremse): bleibt, HUD bekommt eine freie Taste
  const alt = { tasten: { gas: ['ArrowUp', 'KeyW'], bremse: ['ArrowDown', 'KeyS'], links: ['ArrowLeft', 'KeyA'], rechts: ['ArrowRight', 'KeyD'], handbremse: ['KeyH', 'Space'], zurueck: ['KeyR', null], notes: ['KeyN', null] }, sprache: 'de' };
  const spiel = await lade({ speicher: { 'alpineRally.einstellungen': JSON.stringify(alt) } });
  const t = await A(spiel.page, () => JSON.parse(JSON.stringify(window.__alpineRally.einstellungen.tasten)));
  pruefe(t.handbremse[0] === 'KeyH' && t.handbremse[1] === 'Space' && t.hud[0] === 'KeyJ' && t.gas[1] === 'KeyW',
    'alte Belegung (H auf Handbremse) bleibt erhalten, HUD bekommt die erste freie Taste (J)', `Handbremse ${t.handbremse.join('/')}, HUD ${t.hud[0]}`);
  await spiel.schliessen();
}

// =====================================================================
console.log('(h) Einstellungen ANZEIGE, Texte');
{
  const spiel = await lade();
  const p = spiel.page;
  const gruppen = await A(p, () => window.__alpineRally.seiten.einstellungen.eintraege.filter((e) => e.typ === 'gruppe').map((e) => e.text));
  const anzeige = await A(p, () => { const l = window.__alpineRally.seiten.einstellungen.eintraege; const i = l.findIndex((e) => e.text === 'einst.anzeige'); return l.slice(i + 1, i + 4).map((e) => `${e.typ}:${e.text}`); });
  pruefe(gruppen.indexOf('einst.anzeige') === gruppen.indexOf('einst.grafik') + 1 && gruppen.indexOf('einst.steuerung') === gruppen.indexOf('einst.anzeige') + 1,
    'Gruppe ANZEIGE zwischen GRAFIK und STEUERUNG', gruppen.join(', '));
  pruefe(anzeige.join() === 'umschalter:einst.minimap,umschalter:einst.vergleich,auswahl:einst.vergleichMit', 'darin: Minimap, Live-Vergleich, Vergleich mit', anzeige.join(', '));
  const std = await A(p, () => ({ m: window.__alpineRally.einstellungen.minimap, v: window.__alpineRally.einstellungen.vergleich, mit: window.__alpineRally.einstellungen.vergleichMit }));
  pruefe(std.m === true && std.v === true && std.mit === 'best', 'Standard: Minimap an, Live-Vergleich an, Vergleich mit Bestzeit');
  // sofort wirksam: Referenz fahren, dann aus- und einschalten
  await A(p, async () => { await window.__T.fahre('flott', { ganz: true }); await window.__T.fahre('flott', { bisS: 700, gas: 0.9 }); });
  await bilderAbwarten(p, 3);
  const lage = await A(p, () => { const m = window.__alpineRally.hud.minimap; return { mm: [m.x, m.y, m.breite, m.hoehe], v: window.__alpineRally.hud.lage.vergleich }; });
  const px = (b) => A(p, (b) => window.__T.hudPixel(...b).sichtbar, b);
  const vglB = [lage.v.x, lage.v.y, lage.v.b, lage.v.h];
  const vor = { mm: await px(lage.mm), v: await px(vglB) };
  await A(p, async () => { const E = await import('/js/einstellungen.js'); E.setze('minimap', false); E.setze('vergleich', false); });
  await bilderAbwarten(p, 2);
  const nach = { mm: await px(lage.mm), v: await px(vglB), meldungY: await A(p, () => window.__alpineRally.hud.lage.meldungY) };
  pruefe(vor.mm > 500 && vor.v > 300 && nach.mm === 0 && nach.v === 0, 'Minimap und Live-Vergleich aus: sofort weg (nächstes Bild)', `Minimap ${vor.mm} -> ${nach.mm}, Vergleich ${vor.v} -> ${nach.v} Pixel`);
  await A(p, async () => { const E = await import('/js/einstellungen.js'); E.setze('vergleichMit', 'letzter'); });
  await p.reload(); await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 }); await bilderAbwarten(p, 3);
  const geladen = await A(p, () => ({ m: window.__alpineRally.einstellungen.minimap, v: window.__alpineRally.einstellungen.vergleich, mit: window.__alpineRally.einstellungen.vergleichMit }));
  pruefe(geladen.m === false && geladen.v === false && geladen.mit === 'letzter', 'nach dem Neuladen: Minimap aus, Vergleich aus, Vergleich mit Letzter Lauf (gespeichert)');
  await A(p, async () => { const E = await import('/js/einstellungen.js'); E.setze('minimap', true); E.setze('vergleich', true); E.setze('vergleichMit', 'best'); });
  // Texte
  const tx = await A(p, async () => {
    const { TEXTE } = await import('/js/texte.js');
    const { SCHRIFT } = await import('/js/pixel.js');
    const { MINI } = await import('/js/tacho.js');
    const neu = ['einst.anzeige', 'einst.minimap', 'einst.vergleich', 'einst.vergleichHinweis', 'einst.vergleichMit', 'wert.bestzeit', 'wert.letzterLauf', 'aktion.hud', 'hud.vergleichBest', 'hud.vergleichLetzter', 'hud.hudAus', 'hud.hudAn'];
    const fehlt = [], zeichen = new Set(), mini = new Set();
    for (const k of neu) for (const s of ['de', 'en']) {
      if (!TEXTE[k] || !TEXTE[k][s]) { fehlt.push(`${k}.${s}`); continue; }
      const txt = TEXTE[k][s].replace(/\{\w+\}/g, '').toUpperCase();
      if (txt.includes('ß')) fehlt.push(`${k}.${s}: ß`);
      for (const c of txt) if (!SCHRIFT[c]) zeichen.add(c);
      // das Etikett steht in der kleinen Tacho-Schrift
      if (k.startsWith('hud.vergleich')) for (const c of txt) if (!MINI[c]) mini.add(c);
    }
    for (const c of '+-.0123456789') if (!SCHRIFT[c]) zeichen.add(c);
    return { n: neu.length, fehlt, zeichen: [...zeichen], mini: [...mini] };
  });
  pruefe(tx.fehlt.length === 0, `${tx.n} neue Text-Schlüssel in de und en, kein ß`, tx.fehlt.join(', '));
  pruefe(tx.zeichen.length === 0 && tx.mini.length === 0, 'alle Zeichen in der Pixelschrift (auch + - . für den Vergleich, BEST/LETZT/LAST in der kleinen Schrift)', [...tx.zeichen, ...tx.mini].join(' '));
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(i) Leistung');
{
  const STELLEN = [['Start', 22.66], ['900 m', 900], ['1948 m', 1948], ['3170 m', 3170], ['Ziel', 3622]];
  // Zeichenaufrufe (3D) an festen Stellen; Minimap an und aus
  async function aufrufe(spiel, mitMinimap) {
    const p = spiel.page;
    const r = [];
    for (const [, s] of STELLEN) {
      r.push(await A(p, async ([s, mm]) => {
        const A = window.__alpineRally;
        if (A.vergleich) { const E = await import('/js/einstellungen.js'); E.setze('minimap', mm); }
        A.setzeAuf(s); A.kameraSofort();
        await new Promise((res) => { let k = 0; const f = () => (++k >= 4 ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); });
        return A.renderer.info.render.calls;
      }, [s, mitMinimap]));
    }
    return r;
  }
  const spiel = await lade();
  const p = spiel.page;
  await A(p, async () => { await window.__T.fahre('flott', { ganz: true }); window.__alpineRally.start({ countdown: false }); });
  const mit = await aufrufe(spiel, true), ohne = await aufrufe(spiel, false);
  let alt = null;
  if (altOrdner) {
    const sa = await lade({ wurzel: altOrdner });
    alt = await aufrufe(sa, true);
    await sa.schliessen();
  }
  pruefe(JSON.stringify(mit) === JSON.stringify(ohne) && (!alt || JSON.stringify(alt) === JSON.stringify(mit)),
    'Zeichenaufrufe (3D) gleich mit und ohne Minimap' + (alt ? ' und wie in der alten Version' : ''),
    STELLEN.map(([n], i) => `${n} ${alt ? `${alt[i]} -> ` : ''}${mit[i]}`).join(', '));
  // HUD-Zeit pro Bild mit und ohne Minimap (gemessen: das Zeichnen des HUDs, 300 Bilder, im Rennen mit Vergleich)
  const zeit = await A(p, async () => {
    const A = window.__alpineRally, E = await import('/js/einstellungen.js');
    await window.__T.fahre('flott', { bisS: 1200, gas: 0.9 });
    const orig = A.hud.zeichne;
    const miss = async (mm, n = 300) => {
      E.setze('minimap', mm);
      let summe = 0, k = 0, start = 0;
      A.hud.zeichne = function (z) { const t0 = performance.now(); orig.call(this, z); summe += performance.now() - t0; k++; };
      const t0 = performance.now();
      await new Promise((res) => { const f = () => (k >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); });
      start = performance.now() - t0;
      A.hud.zeichne = orig;
      return { hud: summe / k, bild: start / k };
    };
    await miss(true, 60);
    const r = { mit: await miss(true), ohne: await miss(false), mit2: await miss(true), ohne2: await miss(false) };
    E.setze('minimap', true);
    return r;
  });
  const mitMs = (zeit.mit.hud + zeit.mit2.hud) / 2, ohneMs = (zeit.ohne.hud + zeit.ohne2.hud) / 2;
  pruefe(mitMs - ohneMs < 0.5, `HUD zeichnen pro Bild: mit Minimap ${mitMs.toFixed(3)} ms, ohne ${ohneMs.toFixed(3)} ms`,
    `ganzes Bild (Software-Grafik im Test): mit ${((zeit.mit.bild + zeit.mit2.bild) / 2).toFixed(1)} ms, ohne ${((zeit.ohne.bild + zeit.ohne2.bild) / 2).toFixed(1)} ms`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log(fehlerZahl ? `\n${fehlerZahl} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehlerZahl ? 1 : 0);
