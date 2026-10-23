// HUD: Tachos, Zeit (oben links), Pace-Notes (oben Mitte, seit M4.1 als Kacheln), R-Countdown,
// Zielanzeige (bis der Zielbildschirm kommt, M5b) und Debug-Panel.
// Seit M6: Minimap oben rechts (js/minimap.js), Live-Vergleich unter der Zeit-Tafel (Zahl aus js/vergleich.js),
// Taste H blendet das HUD aus (Countdown, "ZIEL!", Menüs und ein kurzer Hinweis bleiben).
// Seit M7a: Minimap kleiner (49 x 49), Checkpoint-Punkte grün/rot/gelb wie die Zwischenzeit-Meldung.
// Seit M6.1: Minimap als mitfahrender Ausschnitt, Live-Vergleich genau so gross wie die Zeit-Tafel,
// Meldungen (Zwischenzeit, "CHECKPOINT VERPASST", "ANSAGEN") auf einer eigenen Tafel im selben Stil.
// Gezeichnet mit einer eigenen 5x7-Pixelschrift (keine externen Fonts, seit M5a in js/pixel.js).
// Alle Texte kommen aus js/texte.js (Deutsch/Englisch).

import { CONFIG } from './config.js';
import { baueTachos, miniText, miniBreite } from './tacho.js';
import { zeichneKachel, zeichneReset, KACHEL_HOEHE } from './pacenotesbild.js';
import { pixelText, zeichneTafel, textBreite } from './pixel.js';
import { t, beiSprachwechsel } from './texte.js';
import { einstellungen, beiAenderung } from './einstellungen.js';
import { tastenName } from './input.js';
import { baueMinimap } from './minimap.js';
import { aktivesProfil } from './fahrprofil.js';
import { touchAn, beiTouchWechsel } from './touch.js'; // M9a: Hilfezeilen mit Knopfnamen

export function formatZeit(sek) {
  const ms = Math.floor(sek * 100);
  const m = Math.floor(ms / 6000), s = Math.floor((ms % 6000) / 100), h = ms % 100;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(h).padStart(2, '0')}`;
}

// strecke, checkpoints (M6): für die Minimap (wird hier einmal gebaut)
export function baueHud(canvas, strecke = null, checkpoints = []) {
  const B = CONFIG.bild.breite, H = CONFIG.bild.hoehe;
  canvas.width = B;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const FARBEN = { weiss: '#f4f4ee', gelb: '#ffd23c', rot: '#ff4a3a' };
  const PN = CONFIG.pacenotes;

  // Text zeichnen (Pixelschrift aus js/pixel.js, mit Schatten)
  // (M8g: schatten = null ohne Schatten, fehlt = dunkler Schatten wie bisher)
  const text = (tx, x, y, groesse = 1, farbe = 'weiss', ausrichtung = 'links', schatten) =>
    pixelText(ctx, tx, x, y, groesse, FARBEN[farbe] || farbe, ausrichtung, schatten);

  const tachos = baueTachos(ctx, text);
  tachos.setzeEinheit(einstellungen.einheit);
  tachos.setzeModus(einstellungen.tacho); // M8g: Einstellung TACHO (auto / klassisch)

  // Feste Texte mit Tastennamen (Hilfe vor dem Start): nur bei Änderung neu bauen
  // (der Hinweis "R = Neustart" im Ziel ist seit M5b weg: dafür gibt es den Zielbildschirm)
  const feste = { hilfe: [], zeit: '' };
  // M6: Live-Vergleich und Hinweis "HUD AUS" werden auf kleine Leinwände gemalt, nur wenn sie sich ändern
  const vglStand = { version: -1, etikett: null, breite: 0 };
  const hinweisStand = { aus: null, breite: 0 };
  const meldungStand = { meldung: null, breite: 0 }; // M6.1: Meldung auf eigener Tafel
  function festeTexte() {
    const T = einstellungen.tasten;
    const fahren = ['gas', 'bremse', 'links', 'rechts'].map((a) => tastenName(T[a][0])).join('');
    const fahren2 = ['gas', 'bremse', 'links', 'rechts'].every((a) => T[a][1]) ? `/${['gas', 'bremse', 'links', 'rechts'].map((a) => tastenName(T[a][1])).join('')}` : '';
    // M9a: im Touch-Modus mit den Namen der Knöpfe statt der Tasten
    feste.hilfe = touchAn() ? [t('hud.touchFahren'), t('hud.touchHandbremse'), t('hud.touchPause'), t('hud.touchNotes')] : [
      t('hud.hilfeFahren', { tasten: fahren + fahren2 }),
      t('hud.hilfeHandbremse', { taste: tastenName(T.handbremse[0]) }),
      t('hud.hilfeZurueck', { taste: tastenName(T.zurueck[0]) }),
      t('hud.hilfeNotes', { taste: tastenName(T.notes[0]) }),
    ];
    feste.zeit = t('hud.zeit');
    vglStand.etikett = null; hinweisStand.aus = null; meldungStand.meldung = null; // neu malen (Sprache oder Taste geändert)
  }
  festeTexte();
  beiSprachwechsel(festeTexte);
  beiTouchWechsel(festeTexte);
  beiAenderung((name, wert) => {
    if (name === 'tasten') festeTexte();
    if (name === 'einheit') tachos.setzeEinheit(wert);
    if (name === 'tacho') tachos.setzeModus(wert); // M8g: sofort, auch im Rennen und in der Pause
  });

  // Rechteck mit pixelig abgeschrägten Ecken (seit M5a in js/pixel.js, auch für die Menüs)
  const tafel = (x, y, b, h, e, fuellung, rand) => zeichneTafel(ctx, x, y, b, h, e, fuellung, rand);

  // Zeit-Tafel oben links (seit M4.1, vorher Mitte). Ergebnis: y unter den Checkpoint-Punkten
  function zeitTafel(z) {
    const c = CONFIG.hud.zeit;
    const zeit = formatZeit(z.zeit);           // immer 8 Zeichen -> feste Breite
    const bWort = miniBreite(feste.zeit);
    const b = c.innen * 2 + bWort + c.luecke + 8 * 6 - 1 + 2;
    const x = c.links, y = c.oben;
    zeitB = b;
    tafel(x, y, b, c.hoehe, c.ecke, CONFIG.hud.tacho.farbeBlatt, c.farbeRand);
    const yText = y + Math.round((c.hoehe - 7) / 2);
    miniText(ctx, feste.zeit, x + 1 + c.innen, yText + 1, c.farbeBeschriftung);
    text(zeit, x + 1 + c.innen + bWort + c.luecke, yText, 1, z.zustand === 'laeuft' ? 'weiss' : 'gelb');
    // Checkpoint-Punkte mittig unter der Tafel: leer = noch nicht erreicht, gefüllt = erreicht.
    // Seit M7a in der Farbe der Zwischenzeit-Meldung: grün = schneller als die Referenz, rot = langsamer,
    // gelb = gleich schnell oder keine Referenz (z.cpVergleich: dieselbe Entscheidung wie die Meldung, aus main.js)
    const n = z.anzahlCps, g = c.cpGroesse;
    const bPunkte = n * g + (n - 1) * c.cpAbstand;
    const yP = y + c.hoehe + c.cpUnter;
    for (let i = 0; i < n; i++) {
      const xp = Math.round(x + b / 2 - bPunkte / 2) + i * (g + c.cpAbstand);
      ctx.fillStyle = 'rgba(10, 14, 20, 0.7)'; // Schatten
      ctx.fillRect(xp + 1, yP + 1, g, g);
      if (z.zwischenzeiten[i] != null) {
        const u = z.cpVergleich ? z.cpVergleich[i] : 0;
        ctx.fillStyle = u < 0 ? CONFIG.hud.vergleich.farbeSchneller : u > 0 ? CONFIG.hud.vergleich.farbeLangsamer : c.farbeCpErreicht;
        ctx.fillRect(xp, yP, g, g);
      } else {
        ctx.fillStyle = c.farbeCpLeer;
        ctx.fillRect(xp, yP, g, g);
        ctx.fillStyle = CONFIG.hud.tacho.farbeBlatt;
        ctx.fillRect(xp + 1, yP + 1, g - 2, g - 2);
      }
    }
    return yP + g;
  }

  let zeitB = 0; // Breite der Zeit-Tafel (der Live-Vergleich ist seit M6.1 genau so breit)
  let lageVergleichY = -1, lageMeldungY = 0, lageMeldungSichtbar = false; // (für Tests)

  // --- Live-Vergleich (M6): kleine Tafel unter den Checkpoint-Punkten, "BEST -0.8" -------------------
  // Seit M6.1 genau wie die Zeit-Tafel: gleiche Höhe und Breite, Etikett in der kleinen Schrift wie "ZEIT",
  // die Zahl in der Pixelschrift Grösse 1 wie die Ziffern der Zeit (rechtsbündig, das Vorzeichen springt nicht).
  // Gemalt wird nur, wenn sich die Zahl ändert (höchstens 5 Mal pro Sekunde, js/vergleich.js), sonst kopiert.
  const V = CONFIG.hud.vergleich, Z = CONFIG.hud.zeit;
  const vglBild = document.createElement('canvas');
  vglBild.width = B; vglBild.height = Z.hoehe;
  const vglCtx = vglBild.getContext('2d');
  vglCtx.imageSmoothingEnabled = false;
  // a = Anzeige aus js/vergleich.js, quelle = 'best' / 'letzter'. Ergebnis: y unter der Tafel
  function zeichneVergleich(a, quelle, y) {
    const etikett = t(quelle === 'letzter' ? 'hud.vergleichLetzter' : 'hud.vergleichBest');
    if (a.version !== vglStand.version || etikett !== vglStand.etikett || zeitB !== vglStand.breite) {
      vglStand.version = a.version; vglStand.etikett = etikett;
      const zahl = a.stufe === 0 ? '0.0' : `${a.stufe < 0 ? '-' : '+'}${Math.floor(a.wert / 10)}.${a.wert % 10}`;
      const farbe = a.stufe < 0 ? V.farbeSchneller : a.stufe > 0 ? V.farbeLangsamer : V.farbeGleich;
      const b = zeitB; // immer genau so breit wie die Zeit-Tafel
      vglStand.breite = b;
      const yText = Math.round((Z.hoehe - 7) / 2); // wie in der Zeit-Tafel
      vglCtx.clearRect(0, 0, B, Z.hoehe);
      zeichneTafel(vglCtx, 0, 0, b, Z.hoehe, Z.ecke, CONFIG.hud.tacho.farbeBlatt, Z.farbeRand);
      miniText(vglCtx, etikett, 1 + Z.innen, yText + 1, Z.farbeBeschriftung);
      pixelText(vglCtx, zahl, b - 1 - Z.innen, yText, 1, farbe, 'rechts');
    }
    ctx.drawImage(vglBild, 0, 0, vglStand.breite, Z.hoehe, Z.links, y, vglStand.breite, Z.hoehe);
    return y + Z.hoehe;
  }

  // --- Meldung unter der Zeit-Tafel (seit M6.1 auf eigener Tafel wie die Zeit-Tafel) ---
  // Zwischenzeit grün/rot/gelb (Farbe kommt aus main.js), "CHECKPOINT VERPASST" rot, "ANSAGEN AN/AUS" gelb.
  // Gemalt wird nur, wenn eine neue Meldung kommt, sonst kopiert.
  const meldungBild = document.createElement('canvas');
  meldungBild.width = B; meldungBild.height = Z.hoehe;
  const meldungCtx = meldungBild.getContext('2d');
  function zeichneMeldung(m, y) {
    if (m !== meldungStand.meldung) {
      meldungStand.meldung = m;
      const b = Math.min(B - Z.links, Z.innen * 2 + textBreite(m.text) + 2); // Textbreite plus Rand
      meldungStand.breite = b;
      meldungCtx.clearRect(0, 0, B, Z.hoehe);
      zeichneTafel(meldungCtx, 0, 0, b, Z.hoehe, Z.ecke, CONFIG.hud.tacho.farbeBlatt, Z.farbeRand);
      pixelText(meldungCtx, m.text, 1 + Z.innen, Math.round((Z.hoehe - 7) / 2), 1, FARBEN[m.farbe] || m.farbe);
    }
    ctx.drawImage(meldungBild, 0, 0, meldungStand.breite, Z.hoehe, Z.links, y, meldungStand.breite, Z.hoehe);
  }

  // --- Hinweis "HUD AUS" / "HUD AN" (M6), unten in der Mitte ---
  const HS = CONFIG.hud.hudSchalter;
  const hinweisBild = document.createElement('canvas');
  hinweisBild.width = B; hinweisBild.height = 13;
  const hinweisCtx = hinweisBild.getContext('2d');
  function zeichneHinweis(aus, rest) {
    if (aus !== hinweisStand.aus) {
      hinweisStand.aus = aus;
      const tx = t(aus ? 'hud.hudAus' : 'hud.hudAn'); // seit M6.1 ohne Tastenname
      const b = textBreite(tx) + 10;
      hinweisStand.breite = b;
      hinweisCtx.clearRect(0, 0, B, 13);
      zeichneTafel(hinweisCtx, 0, 0, b, 13, 2, CONFIG.hud.tacho.farbeBlatt, CONFIG.hud.zeit.farbeRand);
      pixelText(hinweisCtx, tx, 5, 3, 1, FARBEN.gelb);
    }
    ctx.globalAlpha = Math.min(1, rest / 0.3); // in den letzten 0.3 s ausblenden
    const b = hinweisStand.breite;
    ctx.drawImage(hinweisBild, 0, 0, b, 13, Math.round(B / 2 - b / 2), H - HS.hinweisUnten - 13, b, 13);
    ctx.globalAlpha = 1;
  }

  // --- Minimap (M6): oben rechts, beim Laden gebaut ---
  let minimap = strecke ? baueMinimap(strecke, checkpoints) : null;

  // --- Pace-Notes (M4.1): kleine Kacheln oben Mitte, nur Symbole -----------------------------------
  // Alle Kacheln der Etappe werden einmal (beim ersten Bild) auf ein gemeinsames Bild gemalt.
  // Pro Bild kommen nur noch die Tafel und je Kachel ein Bildausschnitt dazu (keine neuen Objekte).
  let atlas = null;
  function baueAtlas(alle) {
    let breite = 0;
    for (const k of alle) breite += k.breite + 1;
    atlas = document.createElement('canvas');
    atlas.width = Math.max(1, breite); atlas.height = KACHEL_HOEHE;
    const ax = atlas.getContext('2d');
    let x = 0;
    for (const k of alle) { k.atlasX = x; zeichneKachel(ax, k, x, 0); x += k.breite + 1; }
  }
  const pnH = KACHEL_HOEHE + PN.innen * 2 + 1;
  let pnLinks = 0, pnRechts = 0;
  // Ergebnis: y unter der Tafel (für den R-Countdown)
  function zeichnePaceNotes(a, dt) {
    const y = PN.oben;
    if (!a || !a.anzahl) { pnLinks = pnRechts = 0; return y; }
    if (!atlas) baueAtlas(a.alle);
    let links = 1e9, rechts = -1e9, maxA = 0;
    for (let k = 0; k < a.anzahl; k++) {
      const e = a.kacheln[k], kk = a.alle[e.nr];
      if (e.x < links) links = e.x;
      if (e.x + kk.breite > rechts) rechts = e.x + kk.breite;
      if (e.alpha > maxA) maxA = e.alpha;
    }
    // Tafel wird weich breiter/schmaler
    const f = Math.min(1, dt * 14);
    pnLinks = pnRechts ? pnLinks + (links - pnLinks) * f : links;
    pnRechts = pnRechts ? pnRechts + (rechts - pnRechts) * f : rechts;
    const x0 = Math.round(pnLinks) - PN.innen - 1, b = Math.round(pnRechts) - x0 + PN.innen;
    ctx.globalAlpha = Math.min(1, maxA * 1.5);
    tafel(x0, y, b, pnH, 2, PN.farbeTafel, PN.farbeRand);
    for (let k = 0; k < a.anzahl; k++) {
      const e = a.kacheln[k], kk = a.alle[e.nr];
      ctx.globalAlpha = e.alpha * e.alpha; // weicher Übergang
      ctx.drawImage(atlas, kk.atlasX, 0, kk.breite, KACHEL_HOEHE, Math.round(e.x), y + PN.innen + 1, kk.breite, KACHEL_HOEHE);
    }
    ctx.globalAlpha = 1;
    return y + pnH;
  }

  // R-Countdown (M4.1): kleines Reset-Zeichen und eine Ziffer, mittig unter den Pace-Notes
  const ZIFFER = [...'0123456789'];
  function zeichneCountdown(rest, y) {
    const c = CONFIG.zurueck;
    const zahl = ZIFFER[Math.min(9, Math.max(1, Math.ceil(rest)))];
    const b = 7 + 3 + 5, h = 9;
    const x = Math.round(B / 2 - b / 2);
    tafel(x - 3, y, b + 6, h + 4, 2, PN.farbeTafel, PN.farbeRand);
    zeichneReset(ctx, x, y + 3, c.farbe, PN.farbeSchatten);
    text(zahl, x + 10, y + 3, 1, 'gelb');
  }

  return {
    get minimap() { return minimap; },
    tachos, // M8f: für Tests (Skala je Auto)
    // für Tests und Bilder: Minimap mit den aktuellen Werten aus config.js neu bauen (z. B. anderer Zoom)
    minimapNeuBauen() { if (strecke) minimap = baueMinimap(strecke, checkpoints); return minimap; },
    // Wo liegen die Tafeln? (für Tests: Überlappung prüfen)
    get lage() {
      return {
        zeit: { x: CONFIG.hud.zeit.links, y: CONFIG.hud.zeit.oben, b: zeitB, h: CONFIG.hud.zeit.hoehe },
        notes: { x: Math.round(pnLinks) - PN.innen - 1, b: Math.round(pnRechts) - (Math.round(pnLinks) - PN.innen - 1) + PN.innen, y: PN.oben, h: pnH },
        vergleich: { x: CONFIG.hud.zeit.links, y: lageVergleichY, b: vglStand.breite, h: Z.hoehe },
        meldungY: lageMeldungY,
        meldung: { x: CONFIG.hud.zeit.links, y: lageMeldungY, b: meldungStand.breite, h: Z.hoehe, sichtbar: lageMeldungSichtbar },
      };
    },
    zeichne(z) {
      ctx.clearRect(0, 0, B, H);
      // M6: Taste H blendet alles aus ausser "ZIEL!", Countdown, Menüs (die malt main.js) und dem Hinweis
      if (!z.hudAus) {
        // Zeit oben links auf der Tafel, darunter die Checkpoint-Punkte
        let unterTafel = zeitTafel(z);
        // M6: Live-Vergleich in einer eigenen Zeile unter den Punkten (nur Rennen und Pause, nur mit Referenz)
        lageVergleichY = -1;
        if (einstellungen.vergleich && z.vergleich && z.vergleich.sichtbar && z.zustand === 'laeuft') {
          lageVergleichY = unterTafel + V.unter;
          unterTafel = zeichneVergleich(z.vergleich, z.vergleichQuelle, lageVergleichY);
        }
        // Pace-Notes oben Mitte, darunter ggf. der R-Countdown
        const unterNotes = zeichnePaceNotes(z.notes, z.dt);
        if (z.countdown > 0) zeichneCountdown(z.countdown, Math.max(unterNotes, PN.oben + pnH) + CONFIG.zurueck.oben);
        // M6: Minimap oben rechts (nicht nach dem Ziel: dort zählen die Zeiten)
        if (minimap && einstellungen.minimap && z.zustand !== 'ziel') {
          minimap.zeichne(ctx, z.autoX, z.autoZ, z.richtung, z.maxS, z.zwischenzeiten, z.cpNaechster, z.meldung ? z.meldung.verpasstCp : -1);
        }
        // Tachos unten rechts (Drehzahl mit Gang, Tempo); M8f: Skala des gewählten Autos; M8g: Stil je Auto
        tachos.setzeSkala(aktivesProfil());
        tachos.zeichne(z.dt, z.kmh, z.drehzahl, z.gang, z); // (M8g: z.ladedruck, z.gas, z.schaltet für Schaltlicht und Lader)

        if (z.zustand === 'bereit' && z.hilfe) {
          for (let i = 0; i < 4; i++) text(feste.hilfe[i], 5, H - 43 + i * 9);
        }
        // Meldung oben (Zwischenzeit oder "Checkpoint verpasst"), seit M6 unter dem Live-Vergleich, seit M6.1 mit Tafel
        lageMeldungY = unterTafel + CONFIG.hud.zeit.meldungUnter;
        lageMeldungSichtbar = !!(z.meldung && z.zustand !== 'ziel');
        if (lageMeldungSichtbar) zeichneMeldung(z.meldung, lageMeldungY);
      }
      if (z.hudHinweis > 0) zeichneHinweis(!!z.hudAus, z.hudHinweis);
      // Grosses "ZIEL!" mit Endzeit, bis der Zielbildschirm kommt (M5b: z.zielSchirm)
      if (z.zustand === 'ziel' && !z.zielSchirm) {
        ctx.fillStyle = 'rgba(10,14,20,0.55)';
        ctx.fillRect(0, 42, B, 78);
        text(t('hud.ziel'), B / 2, 47, 4, 'gelb', 'mitte');
        text(formatZeit(z.endZeit), B / 2, 79, 3, 'weiss', 'mitte');
        // Zwischenzeiten der Checkpoints
        for (let n = 0; n < z.anzahlCps; n++) {
          const zz = z.zwischenzeiten[n];
          const x = B / 2 + (n - (z.anzahlCps - 1) / 2) * 100;
          text(`CP ${n + 1}  ${zz == null ? '--:--.--' : formatZeit(zz)}`, x, 107, 1, 'weiss', 'mitte');
        }
      }
      if (z.debug) {
        // Tempo in der gewählten Einheit (km/h oder mph)
        const mph = einstellungen.einheit === 'mph', f = mph ? 1 / 1.609344 : 1, einheit = t(mph ? 'einheit.mph' : 'einheit.kmh');
        const zeilen = [
          t('debug.fps', { n: Math.round(z.fps) }),
          t('debug.meter', { a: Math.max(0, Math.round(z.meter)), b: Math.round(z.laenge) }),
          t('debug.tempo', { v: Math.round(z.kmh * f), einheit }),
          t('debug.gang', { g: z.gang, d: Math.round(z.drehzahl) }),
          t('debug.drift', { d: Math.round(z.drift) }),
          t('debug.untergrund', { u: t(`untergrund.${z.untergrund}`) }),
          t('debug.hindernisse', { n: z.hindernisse }),
          z.naechsterCp.nummer
            ? t('debug.naechsterCp', { n: z.naechsterCp.nummer, m: Math.round(z.naechsterCp.abstand) })
            : t('debug.zielIn', { m: Math.round(z.naechsterCp.abstand) }),
          z.aufprall
            ? t('debug.aufprall', { a: Math.round(z.aufprall.vorher * 3.6 * f), b: Math.round(z.aufprall.nachher * 3.6 * f), einheit })
            : t('debug.aufprallKein'),
          t('debug.ansagen', { an: t(z.notes && z.notes.an ? 'wert.an' : 'wert.aus'), taste: tastenName(einstellungen.tasten.notes[0]) }),
        ];
        // die nächsten Ansagen als Text (intern, nur hier)
        const a = z.notes;
        if (a) for (let n = a.naechste; n < Math.min(a.notes.length, a.naechste + 3); n++) zeilen.push(`> ${a.notes[n].text}`);
        ctx.fillStyle = 'rgba(10,14,20,0.6)';
        ctx.fillRect(2, 44, 158, zeilen.length * 9 + 4);
        zeilen.forEach((t, i) => text(t, 5, 47 + i * 9));
      }
    },
  };
}
