// HUD: Tachos, Zeit (oben links), Pace-Notes (oben Mitte, seit M4.1 als Kacheln), R-Countdown,
// Zielanzeige und Debug-Panel.
// Gezeichnet mit einer eigenen 5x7-Pixelschrift (keine externen Fonts, seit M5a in js/pixel.js).
// Alle Texte kommen aus js/texte.js (Deutsch/Englisch).

import { CONFIG } from './config.js';
import { baueTachos, miniText, miniBreite } from './tacho.js';
import { zeichneKachel, zeichneReset, KACHEL_HOEHE } from './pacenotesbild.js';
import { pixelText, zeichneTafel } from './pixel.js';
import { t, beiSprachwechsel } from './texte.js';
import { einstellungen, beiAenderung } from './einstellungen.js';
import { tastenName, knopfName } from './input.js';

export function formatZeit(sek) {
  const ms = Math.floor(sek * 100);
  const m = Math.floor(ms / 6000), s = Math.floor((ms % 6000) / 100), h = ms % 100;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(h).padStart(2, '0')}`;
}

export function baueHud(canvas) {
  const B = CONFIG.bild.breite, H = CONFIG.bild.hoehe;
  canvas.width = B;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const FARBEN = { weiss: '#f4f4ee', gelb: '#ffd23c', rot: '#ff4a3a' };
  const PN = CONFIG.pacenotes;

  // Text zeichnen (Pixelschrift aus js/pixel.js, mit Schatten)
  const text = (tx, x, y, groesse = 1, farbe = 'weiss', ausrichtung = 'links') =>
    pixelText(ctx, tx, x, y, groesse, FARBEN[farbe] || farbe, ausrichtung);

  const tachos = baueTachos(ctx, text);
  tachos.setzeEinheit(einstellungen.einheit);

  // Feste Texte mit Tastennamen (Hilfe vor dem Start, Neustart im Ziel): nur bei Änderung neu bauen
  const feste = { hilfe: [], zielNeustart: '', zeit: '' };
  function festeTexte() {
    const T = einstellungen.tasten;
    const fahren = ['gas', 'bremse', 'links', 'rechts'].map((a) => tastenName(T[a][0])).join('');
    const fahren2 = ['gas', 'bremse', 'links', 'rechts'].every((a) => T[a][1]) ? `/${['gas', 'bremse', 'links', 'rechts'].map((a) => tastenName(T[a][1])).join('')}` : '';
    feste.hilfe = [
      t('hud.hilfeFahren', { tasten: fahren + fahren2 }),
      t('hud.hilfeHandbremse', { taste: tastenName(T.handbremse[0]) }),
      t('hud.hilfeZurueck', { taste: tastenName(T.zurueck[0]) }),
      t('hud.hilfeNotes', { taste: tastenName(T.notes[0]) }),
    ];
    feste.zielNeustart = t('hud.zielNeustart', { taste: tastenName(T.zurueck[0]), knopf: knopfName(CONFIG.menue.gamepad.zurueck) });
    feste.zeit = t('hud.zeit');
  }
  festeTexte();
  beiSprachwechsel(festeTexte);
  beiAenderung((name, wert) => {
    if (name === 'tasten') festeTexte();
    if (name === 'einheit') tachos.setzeEinheit(wert);
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
    tafel(x, y, b, c.hoehe, c.ecke, CONFIG.hud.tacho.farbeBlatt, c.farbeRand);
    const yText = y + Math.round((c.hoehe - 7) / 2);
    miniText(ctx, feste.zeit, x + 1 + c.innen, yText + 1, c.farbeBeschriftung);
    text(zeit, x + 1 + c.innen + bWort + c.luecke, yText, 1, z.zustand === 'laeuft' ? 'weiss' : 'gelb');
    // Checkpoint-Punkte mittig unter der Tafel: leer = noch nicht erreicht, gelb gefüllt = erreicht
    const n = z.anzahlCps, g = c.cpGroesse;
    const bPunkte = n * g + (n - 1) * c.cpAbstand;
    const yP = y + c.hoehe + c.cpUnter;
    for (let i = 0; i < n; i++) {
      const xp = Math.round(x + b / 2 - bPunkte / 2) + i * (g + c.cpAbstand);
      ctx.fillStyle = 'rgba(10, 14, 20, 0.7)'; // Schatten
      ctx.fillRect(xp + 1, yP + 1, g, g);
      if (z.zwischenzeiten[i] != null) {
        ctx.fillStyle = c.farbeCpErreicht;
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
    zeichne(z) {
      ctx.clearRect(0, 0, B, H);
      // Zeit oben links auf der Tafel, darunter die Checkpoint-Punkte
      const unterTafel = zeitTafel(z);
      // Pace-Notes oben Mitte, darunter ggf. der R-Countdown
      const unterNotes = zeichnePaceNotes(z.notes, z.dt);
      if (z.countdown > 0) zeichneCountdown(z.countdown, Math.max(unterNotes, PN.oben + pnH) + CONFIG.zurueck.oben);
      // Tachos unten rechts (Drehzahl mit Gang, Tempo)
      tachos.zeichne(z.dt, z.kmh, z.drehzahl, z.gang);

      if (z.zustand === 'bereit' && z.hilfe) {
        for (let i = 0; i < 4; i++) text(feste.hilfe[i], 5, H - 43 + i * 9);
      }
      // Meldung oben (Zwischenzeit oder "Checkpoint verpasst")
      if (z.meldung && z.zustand !== 'ziel') text(z.meldung.text, CONFIG.hud.zeit.links, unterTafel + CONFIG.hud.zeit.meldungUnter, 1, z.meldung.farbe);
      if (z.zustand === 'ziel') {
        ctx.fillStyle = 'rgba(10,14,20,0.55)';
        ctx.fillRect(0, 42, B, 96);
        text(t('hud.ziel'), B / 2, 47, 4, 'gelb', 'mitte');
        text(formatZeit(z.endZeit), B / 2, 79, 3, 'weiss', 'mitte');
        // Zwischenzeiten der Checkpoints
        for (let n = 0; n < z.anzahlCps; n++) {
          const zz = z.zwischenzeiten[n];
          const x = B / 2 + (n - (z.anzahlCps - 1) / 2) * 100;
          text(`CP ${n + 1}  ${zz == null ? '--:--.--' : formatZeit(zz)}`, x, 107, 1, 'weiss', 'mitte');
        }
        text(feste.zielNeustart, B / 2, 124, 1, 'gelb', 'mitte');
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
