// Menü-Baustein (seit M5a): Seiten mit einer Liste von Einträgen, gezeichnet im 320x180-Raster.
// Unabhängig von der Eingabeart: Tastatur, Gamepad und Maus (später Touch) rufen nur
// hoch(), runter(), links(), rechts(), bestaetigen(), zurueck(), maus(x, y, art) auf.
//
// Eintrag-Typen:
//   { typ: 'aktion', text, aktion(), wert?() }            Knopf (wert = Text rechts, optional)
//   { typ: 'umschalter', text, lesen(), setzen(b) }        AN / AUS
//   { typ: 'auswahl', text, optionen() -> [{ wert, text }], lesen(), setzen(w) }
//   { typ: 'regler', text, min, max, schritt, lesen(), setzen(w), anzeige(w) }
//   { typ: 'taste', aktion }                               Tastenbelegung (Taste 1 und Taste 2)
//   { typ: 'gruppe', text }                                Überschrift (nicht wählbar)
//   { typ: 'info', hoehe, breite, zeichne(ctx, x, y, b, gewaehlt), waehlbar? }  freie Zeile
//   { typ: 'zurueck' }                                     "ZURÜCK" (immer der letzte Punkt)
// text: Schlüssel aus js/texte.js oder eine Funktion, die den Text liefert. hinweis: ebenso (unten in der Tafel).
// Eine Seite: { id, titel, eintraege (Liste oder Funktion), start?, oben?, logo?, zurueck?(), hinweis?, startKnopf?(), rollen?,
//               zeichne?(ctx, uhr, blinkAn) + taste?() + blinkt für ganz eigene Seiten (Titelbildschirm) }
// rollen (M5a.1): Textseite (z. B. Credits) mit kaum wählbaren Einträgen: hoch/runter (und Mausrad) rollen die Seite,
//               statt die Auswahl zu wechseln (die Auswahl bleibt auf ZURÜCK). Passt sie ganz, ist alles wie sonst.
// Seiten werden nur bei Änderung neu gezeichnet (auf ein eigenes Bild), sonst nur kopiert.

import { CONFIG } from './config.js';
import { pixelText, textBreite, zeichneTafel } from './pixel.js';
import { t, beiSprachwechsel } from './texte.js';

const B = 320, H = 180;
const ZEIGER = '▶';

// tasteBelegen(aktion, platz, code) -> Ergebnis wie einstellungen.belegeTaste, tasteLesen(aktion, platz) -> Code,
// tasteName(code) und aktionName(aktion) -> Text für die Anzeige
export function baueMenue({ tasteBelegen, tasteLesen, tasteName, aktionName }) {
  const M = CONFIG.menue;
  const leinwand = () => {
    const c = document.createElement('canvas');
    c.width = B; c.height = H;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return { c, x };
  };
  let bild = leinwand(), bildAlt = leinwand();
  const stapel = [];          // offene Seiten: { seite, wahl, scroll, platz }
  let schmutzig = true;       // neu zeichnen?
  let blende = 1;             // Übergang zwischen Seiten: 0 = gerade gewechselt, 1 = fertig
  let uhr = 0, blinkAn = true;
  let warten = null;          // Tastenbelegung: wartet auf eine Taste { aktion, platz }
  let meldung = null;         // Warnung unten { text, farbe, bis }
  let ziehen = null;          // Maus zieht gerade einen Regler { nr }
  let druckNr = -1;           // Maus gedrückt auf Eintrag Nr.
  let treffer = [];           // Trefferflächen der sichtbaren Einträge (für Maus und später Touch)
  const padZustand = { richtung: 0, zeit: 0 };
  beiSprachwechsel(() => { schmutzig = true; });

  const txt = (x) => (typeof x === 'function' ? x() : t(x));
  const oben = () => stapel[stapel.length - 1];
  const liste = (s) => (typeof s.eintraege === 'function' ? s.eintraege() : s.eintraege || []);
  const waehlbar = (e) => e && e.typ !== 'gruppe' && !(e.typ === 'info' && !e.waehlbar);

  function erster(s, ab = 0) {
    const l = liste(s);
    for (let i = ab; i < l.length; i++) if (waehlbar(l[i])) return i;
    return -1;
  }

  // --- Seiten öffnen / schliessen (mit kurzem Aus- und Einblenden) ---
  function wechselBild() {
    // das bisherige Bild bleibt für das Ausblenden stehen
    const a = bildAlt; bildAlt = bild; bild = a;
    blende = 0;
    schmutzig = true;
    warten = null; meldung = null; ziehen = null; druckNr = -1;
    treffer = []; // alte Trefferflächen gelten nicht mehr (neue nach dem nächsten Zeichnen)
  }
  function oeffne(seite, ohneBlende = false) {
    const l = liste(seite);
    const start = seite.start != null && waehlbar(l[seite.start]) ? seite.start : erster(seite);
    if (!ohneBlende) wechselBild(); else { schmutzig = true; treffer = []; }
    stapel.push({ seite, wahl: start, scroll: 0, platz: 0, maxScroll: 0 });
  }
  function schliesse() {
    if (stapel.length <= 1) return false;
    wechselBild();
    stapel.pop();
    return true;
  }
  // ganzer Stapel neu (z. B. Pause, Hauptmenü)
  function zeige(seite, ohneBlende = false) {
    if (!ohneBlende && stapel.length) wechselBild();
    stapel.length = 0;
    oeffne(seite, true);
    if (ohneBlende) blende = 1;
  }

  // --- Bedienung (für alle Eingabearten gleich) ---
  function waehle(nr) {
    const o = oben();
    if (!o || nr === o.wahl) return;
    o.wahl = nr;
    schmutzig = true;
  }
  function schritt(r) {
    const o = oben();
    if (!o || o.seite.zeichne) return;
    // Textseite, die nicht ganz passt: rollen statt wählen (maxScroll merkt sich render)
    if (o.seite.rollen && o.maxScroll > 0) {
      const neu = Math.max(0, Math.min(o.maxScroll, o.scroll + r * M.rollenSchritt));
      if (neu !== o.scroll) { o.scroll = neu; schmutzig = true; }
      return;
    }
    const l = liste(o.seite);
    if (!l.length) return;
    let i = o.wahl;
    for (let n = 0; n < l.length; n++) {
      i = (i + r + l.length) % l.length;
      if (waehlbar(l[i])) { waehle(i); return; }
    }
  }
  const eintrag = () => { const o = oben(); return o && o.wahl >= 0 ? liste(o.seite)[o.wahl] : null; };

  function aendern(e, r) {
    if (!e) return;
    if (e.typ === 'umschalter') e.setzen(!e.lesen());
    else if (e.typ === 'auswahl') {
      const opt = e.optionen();
      const i = Math.max(0, opt.findIndex((o) => o.wert === e.lesen()));
      e.setzen(opt[(i + r + opt.length) % opt.length].wert);
    } else if (e.typ === 'regler') {
      const w = Math.min(e.max, Math.max(e.min, e.lesen() + r * e.schritt));
      e.setzen(w);
    } else if (e.typ === 'taste') {
      oben().platz = r > 0 ? 1 : 0;
    } else return;
    schmutzig = true;
  }

  function bestaetigen() {
    const o = oben();
    if (!o) return;
    if (o.seite.zeichne) { if (o.seite.taste) o.seite.taste(); return; }
    const e = eintrag();
    if (!e) return;
    if (e.typ === 'aktion') e.aktion();
    else if (e.typ === 'zurueck') zurueck();
    else if (e.typ === 'umschalter' || e.typ === 'auswahl') aendern(e, 1);
    else if (e.typ === 'taste') { warten = { aktion: e.aktion, platz: o.platz }; meldung = null; }
    schmutzig = true;
  }

  function zurueck() {
    if (warten) { warten = null; schmutzig = true; return; }
    const o = oben();
    if (!o) return;
    if (o.seite.zurueck) o.seite.zurueck();
    else schliesse();
  }

  function zeigeMeldung(text, farbe = M.farbeWarnung) {
    meldung = { text, farbe, bis: uhr + M.meldungDauer };
    schmutzig = true;
  }

  // Tastatur. Ergebnis true = Taste erledigt
  function taste(code, wiederholt) {
    const o = oben();
    if (!o) return false;
    if (warten) {
      if (wiederholt) return true;
      if (code === 'Escape') { warten = null; schmutzig = true; return true; }
      const w = warten;
      warten = null;
      const erg = tasteBelegen(w.aktion, w.platz, code === 'Delete' ? null : code);
      if (erg.art === 'reserviert') zeigeMeldung(t('tasten.reserviert', { taste: tasteName(code) }));
      else if (erg.art === 'belegt') zeigeMeldung(t('tasten.belegt', { aktion: aktionName(erg.mit) }));
      else if (erg.art === 'nichtLeer') zeigeMeldung(t('tasten.nichtLeer'));
      else if (erg.art === 'getauscht') zeigeMeldung(t('tasten.getauscht', { aktion: aktionName(erg.mit) }), M.farbeTitel);
      schmutzig = true;
      return true;
    }
    if (o.seite.zeichne) { if (!wiederholt && o.seite.taste) o.seite.taste(); return true; }
    switch (code) {
      case 'ArrowUp': case 'KeyW': schritt(-1); return true;
      case 'ArrowDown': case 'KeyS': schritt(1); return true;
      case 'ArrowLeft': case 'KeyA': aendern(eintrag(), -1); return true;
      case 'ArrowRight': case 'KeyD': aendern(eintrag(), 1); return true;
      case 'Enter': case 'NumpadEnter': case 'Space': if (!wiederholt) bestaetigen(); return true;
      case 'Escape': case 'Backspace': if (!wiederholt) zurueck(); return true;
      default: return true; // im Menü sonst nichts
    }
  }

  // Gamepad (einmal pro Bild): Steuerkreuz/linker Stick mit Wiederholung, A = bestätigen, B = zurück
  function gamepad(dt, pad) {
    const o = oben();
    if (!o || !pad.da) return;
    const G = M.gamepad;
    if (warten) { if (pad.neu[G.abbrechen]) { warten = null; schmutzig = true; } return; }
    if (o.seite.zeichne) { if (pad.irgendeinNeu && o.seite.taste) o.seite.taste(); return; }
    if (pad.neu[G.bestaetigen]) { bestaetigen(); return; }
    if (pad.neu[G.abbrechen]) { zurueck(); return; }
    if (pad.neu[G.pause] && o.seite.startKnopf) { o.seite.startKnopf(); return; }
    const s = M.stickSchwelle;
    let r = 0;
    if (pad.gedrueckt[G.hoch] || pad.achseY < -s) r = 1;
    else if (pad.gedrueckt[G.runter] || pad.achseY > s) r = 2;
    else if (pad.gedrueckt[G.links] || pad.achseX < -s) r = 3;
    else if (pad.gedrueckt[G.rechts] || pad.achseX > s) r = 4;
    const p = padZustand;
    let los = false;
    if (r !== p.richtung) { p.richtung = r; p.zeit = M.wiederholenNach; los = r !== 0; }
    else if (r) { p.zeit -= dt; if (p.zeit <= 0) { p.zeit = M.wiederholenAlle; los = true; } }
    if (!los) return;
    if (r === 1) schritt(-1); else if (r === 2) schritt(1); else aendern(eintrag(), r === 3 ? -1 : 1);
  }

  // Maus (später auch Touch): x, y im 320x180-Raster; art = 'bewegen', 'druecken', 'loslassen', 'rad' (dy)
  function trefferBei(x, y) {
    for (const h of treffer) if (x >= h.x && x < h.x + h.b && y >= h.y && y < h.y + h.h) return h;
    return null;
  }
  function reglerAuf(h, x) {
    const e = liste(oben().seite)[h.nr];
    const f = Math.min(1, Math.max(0, (x - h.reglerX) / h.reglerB));
    const w = Math.round((e.min + f * (e.max - e.min)) / e.schritt) * e.schritt;
    if (w !== e.lesen()) { e.setzen(w); schmutzig = true; }
  }
  function maus(x, y, art, dy = 0) {
    const o = oben();
    if (!o) return;
    if (o.seite.zeichne) { if (art === 'druecken' && o.seite.taste) o.seite.taste(); return; }
    if (art === 'rad') { if (!warten) schritt(dy > 0 ? 1 : -1); return; }
    const h = trefferBei(x, y);
    if (art === 'bewegen') {
      if (ziehen) { reglerAuf(ziehen, x); return; }
      if (h && !warten) {
        waehle(h.nr);
        if (h.platz != null && h.platz !== o.platz) { o.platz = h.platz; schmutzig = true; }
      }
      return;
    }
    if (art === 'druecken') {
      if (warten) { warten = null; schmutzig = true; return; }
      druckNr = h ? h.nr : -1;
      if (h) {
        waehle(h.nr);
        if (h.reglerB && x >= h.reglerX - 3) { ziehen = h; reglerAuf(h, x); }
      }
      return;
    }
    if (art === 'loslassen') {
      if (ziehen) { ziehen = null; druckNr = -1; return; }
      if (h && h.nr === druckNr) {
        const e = liste(o.seite)[h.nr];
        if (e.typ === 'auswahl') aendern(e, x < h.mitte ? -1 : 1);
        else if (e.typ === 'taste') { if (h.platz != null) { o.platz = h.platz; bestaetigen(); } }
        else if (e.typ !== 'regler') bestaetigen();
      }
      druckNr = -1;
    }
  }

  // --- Zeichnen ----------------------------------------------------------------------------------
  const zeilenHoehe = (e) => e.hoehe || (e.typ === 'gruppe' ? 10 : M.zeile);
  const SLOT = 56; // Breite eines Tasten-Felds in der Tastenbelegung

  function optionText(e, w) { const o = e.optionen().find((x) => x.wert === w); return o ? txt(o.text) : ''; }
  // Werte stehen rechtsbündig an einer gemeinsamen Kante (Platz für den Pfeil ">" daneben).
  // Regler: Balken und Zahl bei allen Reglern einer Seite gleich breit (reglerZahl = breiteste Zahl)
  const PFEIL = 8, BALKEN = 42;
  let reglerZahl = 0;
  const reglerZahlBreite = (e) => Math.max(textBreite(e.anzeige(e.min)), textBreite(e.anzeige(e.max)));
  // Breite des Wert-Teils rechts (für die Tafelbreite: immer das Breiteste, damit nichts springt)
  function wertBreite(e) {
    if (e.typ === 'umschalter') return Math.max(textBreite(t('wert.an')), textBreite(t('wert.aus'))) + 2 * PFEIL;
    if (e.typ === 'auswahl') return Math.max(...e.optionen().map((o) => textBreite(txt(o.text)))) + 2 * PFEIL;
    if (e.typ === 'regler') return BALKEN + 4 + reglerZahl + PFEIL;
    if (e.typ === 'aktion' && e.wert) return textBreite(e.wert()) + PFEIL;
    return 0;
  }

  function render() {
    const { x: c } = bild;
    c.clearRect(0, 0, B, H);
    treffer = [];
    const o = oben();
    if (!o) return;
    const s = o.seite;
    if (s.zeichne) { s.zeichne(c, uhr, blinkAn); return; }
    const l = liste(s);
    const innen = M.innen;
    const tasten = l.filter((e) => e.typ === 'taste');
    const tasteLabel = tasten.length ? Math.max(...tasten.map((e) => textBreite(aktionName(e.aktion)))) : 0;
    reglerZahl = 0;
    for (const e of l) if (e.typ === 'regler') reglerZahl = Math.max(reglerZahl, reglerZahlBreite(e));

    // Breite: so schmal wie möglich
    let inhalt = s.titel ? textBreite(txt(s.titel)) : 0;
    for (const e of l) {
      let b;
      if (e.typ === 'gruppe') b = textBreite(txt(e.text));
      else if (e.typ === 'info') b = typeof e.breite === 'function' ? e.breite() : e.breite || 0;
      else if (e.typ === 'taste') b = 10 + tasteLabel + 8 + SLOT * 2 + 4;
      else { const w = wertBreite(e); b = 10 + textBreite(e.typ === 'zurueck' ? t('menue.zurueck') : txt(e.text)) + (w ? 10 + w : 0); }
      if (b > inhalt) inhalt = b;
      if (e.hinweis) inhalt = Math.max(inhalt, textBreite(txt(e.hinweis)));
    }
    if (s.hinweis) inhalt = Math.max(inhalt, textBreite(txt(s.hinweis)));
    if (tasten.length) inhalt = Math.max(inhalt, textBreite(t('tasten.abbrechen')), textBreite(t('tasten.druecken')));
    if (meldung) inhalt = Math.max(inhalt, textBreite(meldung.text));
    const breite = Math.min(B - 4, inhalt + 2 * innen + 2);

    // Höhe, ggf. mit Rollen
    const sel = l[o.wahl];
    const hinweis = meldung ? meldung.text
      : warten ? t('tasten.druecken')
      : sel && sel.hinweis ? txt(sel.hinweis) : s.hinweis ? txt(s.hinweis) : '';
    const mitHinweis = !!(s.hinweis || l.some((e) => e.hinweis) || tasten.length);
    const kopf = s.titel ? 5 + 7 + 6 : 5;
    const fuss = (mitHinweis ? 4 + 7 + 1 : 0) + 4;
    const yOben = s.oben ?? null;
    const maxH = H - (yOben ?? 4) - 4;
    let gesamt = 0;
    for (const e of l) gesamt += zeilenHoehe(e);
    const sichtH = Math.min(gesamt, maxH - kopf - fuss);
    const hoehe = kopf + sichtH + fuss;
    const x0 = Math.round((B - breite) / 2);
    const y0 = yOben ?? Math.round((H - hoehe) / 2);

    o.maxScroll = Math.max(0, gesamt - sichtH);
    o.masse = { gesamt, sichtH, breite, inhalt, y0, hoehe }; // für Tests (Seite passt? rollt?)
    // Rollen: der gewählte Eintrag (mit seiner Überschrift) bleibt sichtbar
    // (Textseiten rollen selbst, siehe schritt(); sie beginnen oben)
    if (s.rollen) o.scroll = Math.max(0, Math.min(o.maxScroll, o.scroll));
    else if (gesamt > sichtH && o.wahl >= 0) {
      let y = 0, yWahl = 0;
      for (let i = 0; i < l.length; i++) { if (i === o.wahl) yWahl = y; y += zeilenHoehe(l[i]); }
      let von = yWahl;
      if (o.wahl > 0 && l[o.wahl - 1].typ === 'gruppe') von -= zeilenHoehe(l[o.wahl - 1]);
      const bis = yWahl + zeilenHoehe(sel);
      if (von < o.scroll) o.scroll = von;
      if (bis > o.scroll + sichtH) o.scroll = bis - sichtH;
      o.scroll = Math.max(0, Math.min(gesamt - sichtH, o.scroll));
    } else o.scroll = 0;

    // Schriftzug über der Tafel (Hauptmenü)
    if (s.logo) pixelText(c, t('titel.name'), B / 2, 8, 2, M.farbeTitel, 'mitte');
    zeichneTafel(c, x0, y0, breite, hoehe, M.ecke, M.farbeTafel, M.farbeRand);
    const xi = x0 + 1 + innen, xr = x0 + breite - 1 - innen;
    if (s.titel) {
      pixelText(c, txt(s.titel), x0 + breite / 2, y0 + 5, 1, M.farbeTitel, 'mitte');
      c.fillStyle = M.farbeRand;
      c.globalAlpha = 0.35;
      c.fillRect(x0 + 4, y0 + 15, breite - 8, 1);
      c.globalAlpha = 1;
    }
    // Einträge
    const yL = y0 + kopf;
    c.save();
    c.beginPath(); c.rect(x0 + 1, yL, breite - 2, sichtH); c.clip();
    let y = yL - o.scroll;
    for (let i = 0; i < l.length; i++) {
      const e = l[i], h = zeilenHoehe(e);
      const sichtbar = y + h > yL && y < yL + sichtH;
      if (sichtbar) zeile(c, e, i, i === o.wahl, x0, xi, xr, y, h, breite, tasteLabel, o);
      y += h;
    }
    c.restore();
    // Rollen-Pfeile
    if (gesamt > sichtH) {
      // rechts im Rand, neben den Werten
      if (o.scroll > 0) pixelText(c, '▲', x0 + breite - 7, yL, 1, M.farbeTitel);
      if (o.scroll < gesamt - sichtH) pixelText(c, '▼', x0 + breite - 7, yL + sichtH - 6, 1, M.farbeTitel);
    }
    // Hinweis / Warnung unten
    if (mitHinweis && hinweis) {
      const farbe = meldung ? meldung.farbe : warten ? M.farbeAuswahl : M.farbeHinweis;
      pixelText(c, hinweis, x0 + breite / 2, y0 + hoehe - 4 - 7 - 1, 1, farbe, 'mitte');
    }
    if (warten) pixelText(c, t('tasten.abbrechen'), x0 + breite / 2, y0 + hoehe + 3, 1, M.farbeHinweis, 'mitte');
  }

  // Eine Zeile zeichnen und ihre Trefferfläche merken
  function zeile(c, e, i, gewaehlt, x0, xi, xr, y, h, breite, tasteLabel, o) {
    const ty = y + Math.floor((h - 7) / 2);
    if (e.typ === 'gruppe') {
      pixelText(c, txt(e.text), xi, y + 2, 1, M.farbeGruppe);
      return;
    }
    if (e.typ === 'info') {
      if (gewaehlt) { c.fillStyle = M.farbeAuswahlGrund; c.fillRect(x0 + 2, y, breite - 4, h); }
      e.zeichne(c, xi, y, xr - xi, gewaehlt);
      if (e.waehlbar) treffer.push({ nr: i, x: x0, y, b: breite, h });
      return;
    }
    const farbe = gewaehlt ? M.farbeAuswahl : M.farbeText;
    if (gewaehlt) {
      c.fillStyle = M.farbeAuswahlGrund;
      c.fillRect(x0 + 2, y, breite - 4, h);
      pixelText(c, ZEIGER, xi, ty, 1, M.farbeAuswahl);
    }
    const h0 = { nr: i, x: x0, y, b: breite, h };
    treffer.push(h0);
    const label = e.typ === 'zurueck' ? t('menue.zurueck') : e.typ === 'taste' ? aktionName(e.aktion) : txt(e.text);
    pixelText(c, label, xi + 10, ty, 1, farbe);
    const wf = gewaehlt ? M.farbeAuswahl : M.farbeWert;
    const xw = xr - PFEIL; // rechte Kante der Werte
    if (e.typ === 'umschalter' || e.typ === 'auswahl') {
      const wert = e.typ === 'umschalter' ? t(e.lesen() ? 'wert.an' : 'wert.aus') : optionText(e, e.lesen());
      const tb = pixelText(c, wert, xw, ty, 1, wf, 'rechts');
      // Pfeile zeigen: mit links/rechts umstellen
      if (gewaehlt) { pixelText(c, '<', xw - tb - PFEIL + 1, ty, 1, wf); pixelText(c, '>', xr - 5, ty, 1, wf); }
      h0.mitte = xw - tb / 2;
    } else if (e.typ === 'aktion' && e.wert) pixelText(c, e.wert(), xw, ty, 1, wf, 'rechts');
    else if (e.typ === 'regler') {
      const bx = xw - reglerZahl - 4 - BALKEN, by = y + Math.floor(h / 2) - 2;
      const f = (e.lesen() - e.min) / (e.max - e.min);
      c.fillStyle = '#101418'; c.fillRect(bx + 1, by + 1, BALKEN, 5);
      c.fillStyle = M.farbeRegler; c.fillRect(bx, by, BALKEN, 5);
      c.fillStyle = wf; c.fillRect(bx, by, Math.round(BALKEN * f), 5);
      // Knopf
      const kx = bx + Math.round((BALKEN - 2) * f);
      c.fillStyle = '#101418'; c.fillRect(kx + 1, by - 1, 3, 8);
      c.fillStyle = gewaehlt ? '#ffffff' : M.farbeRand; c.fillRect(kx, by - 2, 2, 9);
      pixelText(c, e.anzeige(e.lesen()), xw, ty, 1, wf, 'rechts');
      h0.reglerX = bx; h0.reglerB = BALKEN;
    } else if (e.typ === 'taste') {
      const sx = xr - SLOT * 2 - 4; // Felder rechtsbündig
      for (let k = 0; k < 2; k++) {
        const fx = sx + k * (SLOT + 4);
        const aktiv = gewaehlt && o.platz === k;
        const wartetHier = warten && warten.aktion === e.aktion && warten.platz === k;
        c.fillStyle = aktiv ? 'rgba(255, 154, 46, 0.28)' : 'rgba(255, 255, 255, 0.06)';
        c.fillRect(fx, y + 1, SLOT, h - 2);
        if (aktiv) {
          c.fillStyle = M.farbeAuswahl;
          c.fillRect(fx, y + 1, SLOT, 1); c.fillRect(fx, y + h - 2, SLOT, 1);
          c.fillRect(fx, y + 1, 1, h - 2); c.fillRect(fx + SLOT - 1, y + 1, 1, h - 2);
        }
        const name = wartetHier ? (blinkAn ? '…' : '') : tasteName(tasteLesen(e.aktion, k));
        pixelText(c, name, fx + SLOT / 2, ty, 1, aktiv ? M.farbeAuswahl : M.farbeWert, 'mitte');
        treffer.push({ nr: i, x: fx, y, b: SLOT, h, platz: k });
      }
    }
  }

  return {
    oeffne, schliesse, zeige, zurueck, bestaetigen, schritt, aendern, taste, gamepad, maus, zeigeMeldung,
    hoch: () => schritt(-1), runter: () => schritt(1), links: () => aendern(eintrag(), -1), rechts: () => aendern(eintrag(), 1),
    neuZeichnen() { schmutzig = true; },
    get seite() { const o = oben(); return o ? o.seite : null; },
    get wahl() { const o = oben(); return o ? o.wahl : -1; },
    get wartet() { return !!warten; },
    // für Tests (M5a.1): wie weit ist die Seite gerollt, wie weit kann sie rollen, Masse der Tafel (Pixel)
    get rollen() { const o = oben(); return o ? { scroll: o.scroll, max: o.maxScroll, ...o.masse } : null; },
    get stapel() { return stapel; },
    get treffer() { return treffer; },
    // Jedes Bild: Zeit weiter, bei Bedarf neu zeichnen, auf ctx kopieren (alpha = Sichtbarkeit 0..1)
    zeichne(ctx, dt, alpha = 1) {
      uhr += dt;
      const blink = Math.floor(uhr / M.blinken) % 2 === 0;
      const s = oben() && oben().seite;
      if (blink !== blinkAn) { blinkAn = blink; if (warten || (s && s.blinkt)) schmutzig = true; }
      if (meldung && uhr > meldung.bis) { meldung = null; schmutzig = true; }
      if (schmutzig) { render(); schmutzig = false; }
      if (blende < 1) blende = Math.min(1, blende + dt / M.blende);
      if (alpha <= 0) return;
      if (blende < 0.5) {
        ctx.globalAlpha = alpha * (1 - blende * 2);
        ctx.drawImage(bildAlt.c, 0, 0);
      } else {
        ctx.globalAlpha = alpha * (blende * 2 - 1);
        ctx.drawImage(bild.c, 0, 0);
      }
      ctx.globalAlpha = 1;
    },
  };
}
