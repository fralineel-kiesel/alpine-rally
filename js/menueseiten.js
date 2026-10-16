// Die Menüseiten (seit M5a): Titel, Hauptmenü, Auto, Etappe, Bestzeiten, Einstellungen,
// Tastenbelegung, Steuerung, Symbol-Legende, Credits, Pause und Rückfrage.
// Was die Einträge tun, kommt von main.js (api). Texte: js/texte.js.

import { CONFIG, VERSION } from './config.js';
import { pixelText, textBreite } from './pixel.js';
import { t, setzeSprache } from './texte.js';
import { einstellungen, setze, AKTIONEN, tastenStandard } from './einstellungen.js';
import { tastenVon, tastenName, knopfName } from './input.js';
import { zeichneKachel, kachelBreite } from './pacenotesbild.js';
import { ladeBestzeiten } from './bestzeiten.js';
import { AUTOS, ETAPPEN, auswahl } from './inhalte.js';
import { formatZeit } from './hud.js';

// api: { menue, zumMenue, starten, weiter, neustartEtappe, zumHauptmenue, zumTitel, paceNotes, vollbild(b) }
export function baueSeiten(api) {
  const M = CONFIG.menue;
  const menue = api.menue;
  const ZURUECK = { typ: 'zurueck' };

  // Textzeile ohne Auswahl (Daten, Hinweise)
  const textZeile = (text, farbe = M.farbeText, mitte = false) => ({
    typ: 'info', hoehe: 10, breite: () => textBreite(typeof text === 'function' ? text() : t(text)),
    farbe, inhalt: () => (typeof text === 'function' ? text() : t(text)), // (inhalt: für Tests)
    zeichne(c, x, y, b) {
      const s = typeof text === 'function' ? text() : t(text);
      pixelText(c, s, mitte ? x + b / 2 : x, y + 1, 1, farbe, mitte ? 'mitte' : 'links');
    },
  });
  const leer = (h = 5) => ({ typ: 'info', hoehe: h, breite: 0, zeichne() {} });

  // --- Titelbildschirm ---
  const titel = {
    id: 'titel', blinkt: true,
    zeichne(c, uhr, blinkAn) {
      pixelText(c, t('titel.name'), 160, 58, 3, M.farbeTitel, 'mitte', '#101418');
      if (blinkAn) pixelText(c, t('titel.taste'), 160, 112, 1, M.farbeText, 'mitte');
      pixelText(c, t('credits.version', { v: VERSION }), 316, 170, 1, M.farbeHinweis, 'rechts');
    },
    taste: () => api.zumMenue(),
  };

  // --- Auto / Etappe: Liste, je Eintrag Name und kurze Daten ---
  const karte = (name, zeilen, gewaehlt) => ({
    typ: 'info', waehlbar: true, hoehe: 12 + zeilen().length * 9 + 3,
    breite: () => Math.max(textBreite(t(name)) + 10 + textBreite(t('auswahl.gewaehlt')), ...zeilen().map((z) => textBreite(z) + 10)),
    zeichne(c, x, y, b, w) {
      pixelText(c, t(name), x + 10, y + 3, 1, w ? M.farbeAuswahl : M.farbeTitel);
      if (w) pixelText(c, '▶', x, y + 3, 1, M.farbeAuswahl);
      if (gewaehlt()) pixelText(c, t('auswahl.gewaehlt'), x + b, y + 3, 1, M.farbeHinweis, 'rechts');
      zeilen().forEach((z, i) => pixelText(c, z, x + 10, y + 13 + i * 9, 1, M.farbeText));
    },
  });
  const autoSeite = {
    id: 'auto', titel: 'auto.titel',
    eintraege: () => [
      ...AUTOS.map((a, i) => karte(a.name, () => a.daten.map((d) => t(d)), () => auswahl.auto === i)),
      leer(), textZeile('auto.spaeter', M.farbeHinweis, true), leer(3), ZURUECK,
    ],
  };
  const etappeSeite = {
    id: 'etappe', titel: 'etappe.titel',
    eintraege: () => [
      ...ETAPPEN.map((e, i) => karte(e.name, () => [t('etappe.daten1', { km: e.laenge.toFixed(1), cps: e.checkpoints }), ...e.daten.map((d) => t(d))], () => auswahl.etappe === i)),
      leer(), textZeile('etappe.spaeter', M.farbeHinweis, true), leer(3), ZURUECK,
    ],
  };

  // --- Bestzeiten (Top 10 kommt in M5b; die Seite liest schon den Speicher) ---
  const bestzeitenSeite = {
    id: 'bestzeiten', titel: 'bestzeiten.titel',
    eintraege: () => {
      const etappe = ETAPPEN[auswahl.etappe];
      const liste = ladeBestzeiten(etappe.id);
      const zeilen = liste.length
        ? liste.map((z, i) => textZeile(() => `${String(i + 1).padStart(2, ' ')}. ${formatZeit(z.zeit)}`))
        : [leer(4), textZeile('bestzeiten.leer', M.farbeHinweis, true), leer(4)];
      return [textZeile(() => t(etappe.name), M.farbeGruppe, true), ...zeilen, leer(3), ZURUECK];
    },
  };

  // --- Einstellungen ---
  const R = M.aufloesungen;
  const prozent = (w) => `${Math.round(w * 100)}%`;
  const tastenSeite = {
    id: 'tasten', titel: 'tasten.titel', hinweis: 'tasten.hinweis',
    eintraege: [
      {
        typ: 'info', hoehe: 9, breite: 0,
        zeichne(c, x, y, b) {
          // Spaltenköpfe über den Tasten-Feldern (rechtsbündig wie die Felder)
          pixelText(c, t('tasten.kopf1'), x + b - 56 - 4 - 28, y, 1, M.farbeGruppe, 'mitte');
          pixelText(c, t('tasten.kopf2'), x + b - 28, y, 1, M.farbeGruppe, 'mitte');
        },
      },
      ...AKTIONEN.map((a) => ({ typ: 'taste', aktion: a })),
      leer(3),
      { typ: 'aktion', text: 'tasten.standard', aktion: () => { tastenStandard(); menue.zeigeMeldung(t('tasten.zurueckgesetzt'), M.farbeTitel); } },
      ZURUECK,
    ],
  };
  const einstellungenSeite = {
    id: 'einstellungen', titel: 'einst.titel',
    eintraege: [
      { typ: 'gruppe', text: 'einst.grafik' },
      { typ: 'umschalter', text: 'einst.vollbild', lesen: () => einstellungen.vollbild, setzen: (b) => { setze('vollbild', b); api.vollbild(b, true); } },
      {
        typ: 'auswahl', text: 'einst.aufloesung', hinweis: 'einst.aufloesungHinweis',
        optionen: () => R.map((r, i) => ({ wert: i, text: () => `${r[0]}X${r[1]}` })),
        lesen: () => einstellungen.aufloesung, setzen: (w) => setze('aufloesung', w),
      },
      {
        typ: 'umschalter', text: 'einst.paceNotes', hinweis: () => t('einst.paceNotesHinweis', { taste: tastenName(einstellungen.tasten.notes[0]) }),
        lesen: () => api.paceNotes.anzeige.an, setzen: (b) => { if (b !== api.paceNotes.anzeige.an) api.paceNotes.umschalten(); },
      },
      {
        typ: 'auswahl', text: 'einst.einheiten',
        optionen: () => [{ wert: 'kmh', text: 'einheit.kmh' }, { wert: 'mph', text: 'einheit.mph' }],
        lesen: () => einstellungen.einheit, setzen: (w) => setze('einheit', w),
      },
      { typ: 'umschalter', text: 'einst.fps', lesen: () => einstellungen.fps, setzen: (b) => setze('fps', b) },
      { typ: 'gruppe', text: 'einst.steuerung' },
      { typ: 'aktion', text: 'einst.tasten', aktion: () => menue.oeffne(tastenSeite) },
      {
        typ: 'regler', text: 'einst.lenk', hinweis: 'einst.mitteHinweis', min: 0, max: M.lenkStufen.length - 1, schritt: 1,
        lesen: () => einstellungen.lenkStufe, setzen: (w) => setze('lenkStufe', w), anzeige: (w) => prozent(M.lenkStufen[w]),
      },
      {
        typ: 'regler', text: 'einst.totzone', hinweis: 'einst.mitteHinweis', min: 0, max: M.totzonen.length - 1, schritt: 1,
        lesen: () => einstellungen.totzoneStufe, setzen: (w) => setze('totzoneStufe', w), anzeige: (w) => prozent(M.totzonen[w]),
      },
      { typ: 'gruppe', text: 'einst.ton' },
      {
        typ: 'regler', text: 'einst.lautstaerke', hinweis: 'einst.lautHinweis', min: 0, max: 100, schritt: M.lautSchritt,
        lesen: () => einstellungen.lautstaerke, setzen: (w) => setze('lautstaerke', w), anzeige: (w) => `${w}%`,
      },
      { typ: 'gruppe', text: 'einst.sprache' },
      {
        typ: 'auswahl', text: 'einst.sprache',
        optionen: () => [{ wert: 'de', text: 'sprache.de' }, { wert: 'en', text: 'sprache.en' }],
        lesen: () => einstellungen.sprache, setzen: (w) => { setze('sprache', w); setzeSprache(w); },
      },
      ZURUECK,
    ],
  };

  // --- Steuerung: aktuelle Belegung (aus den Einstellungen) und Symbol-Legende ---
  const G = M.gamepad;
  const steuerZeilen = () => [
    ['aktion.gas', tastenVon('gas'), knopfName(G.gas)],
    ['aktion.bremse', tastenVon('bremse'), knopfName(G.bremse)],
    ['aktion.links', tastenVon('links'), t('pad.stickLinks')],
    ['aktion.rechts', tastenVon('rechts'), t('pad.stickLinks')],
    ['aktion.handbremse', tastenVon('handbremse'), knopfName(G.handbremse)],
    ['aktion.zurueck', tastenVon('zurueck'), knopfName(G.zurueck)],
    ['aktion.notes', tastenVon('notes'), t('pad.keiner')],
    ['aktion.pause', tastenName('Escape'), knopfName(G.pause)],
    ['aktion.debug', 'F3', t('pad.keiner')],
  ];
  // Spalten: Aktion | Tastatur | Gamepad
  const spalten = () => {
    const z = steuerZeilen();
    const a = Math.max(...z.map((r) => textBreite(t(r[0])))), b = Math.max(textBreite(t('steuerung.tastatur')), ...z.map((r) => textBreite(r[1])));
    const g = Math.max(textBreite(t('steuerung.gamepad')), ...z.map((r) => textBreite(r[2])));
    return { a, b, g, breite: a + 8 + b + 8 + g };
  };
  const steuerZeile = (n) => ({
    typ: 'info', hoehe: n < 0 ? 10 : 9, breite: () => spalten().breite,
    zeichne(c, x, y) {
      const s = spalten();
      if (n < 0) {
        pixelText(c, t('steuerung.tastatur'), x + s.a + 8, y + 1, 1, M.farbeGruppe);
        pixelText(c, t('steuerung.gamepad'), x + s.a + 8 + s.b + 8, y + 1, 1, M.farbeGruppe);
        return;
      }
      const r = steuerZeilen()[n];
      pixelText(c, t(r[0]), x, y + 1, 1, M.farbeText);
      pixelText(c, r[1], x + s.a + 8, y + 1, 1, M.farbeWert);
      pixelText(c, r[2], x + s.a + 8 + s.b + 8, y + 1, 1, M.farbeHinweis);
    },
  });

  // Legende: die Kacheln werden mit denselben Zeichenfunktionen gemalt wie im Rennen
  const LEGENDE = [
    [{ symbol: 'kurve56', richtung: 1, farbe: 'gruen', stufe: 6 }, 'legende.kurve56'],
    [{ symbol: 'kurve34', richtung: 1, farbe: 'gelb', stufe: 4 }, 'legende.kurve34'],
    [{ symbol: 'kurve12', richtung: 1, farbe: 'rot', stufe: 2 }, 'legende.kurve12'],
    [{ symbol: 'kehre', richtung: -1, farbe: 'rot', kehrenNr: 1, kehrenAnzahl: 4 }, 'legende.kehre'],
    [{ symbol: 'schikane', richtung: 1, farbe: 'gelb', stufe: 3 }, 'legende.schikane'],
    [{ symbol: 'kuppe', richtung: 1, farbe: 'weiss' }, 'legende.kuppe'],
    [{ symbol: 'abzweig', richtung: 1, farbe: 'gelb', stufe: 3 }, 'legende.abzweig'],
    [{ symbol: 'einmuendung', richtung: 1, farbe: 'gelb', stufe: 4 }, 'legende.einmuendung'],
    [{ symbol: 'ziel', richtung: 1, farbe: 'weiss' }, 'legende.ziel'],
    [{ symbol: 'kurve34', richtung: 1, farbe: 'gelb', stufe: 4, schneiden: 'schneiden' }, 'legende.schneiden'],
    [{ symbol: 'kurve34', richtung: -1, farbe: 'gelb', stufe: 3, schneiden: 'nichtSchneiden' }, 'legende.nichtSchneiden'],
    [{ symbol: 'kurve34', richtung: 1, farbe: 'gelb', stufe: 4, form: 'eng' }, 'legende.eng'],
    [{ symbol: 'kurve34', richtung: 1, farbe: 'gelb', stufe: 4, form: 'weit' }, 'legende.weit'],
    [{ symbol: 'kurve56', richtung: 1, farbe: 'gruen', stufe: 5, form: 'lang' }, 'legende.lang'],
    [{ symbol: 'kurve34', richtung: -1, farbe: 'gelb', stufe: 3, form: 'oeffnet' }, 'legende.oeffnet'],
    [{ symbol: 'kurve12', richtung: 1, farbe: 'rot', stufe: 2, form: 'ziehtZu' }, 'legende.ziehtZu'],
    [{ symbol: 'abzweig', richtung: 1, farbe: 'rot', stufe: 2, belag: 'schotter' }, 'legende.schotter'],
    [{ symbol: 'abzweig', richtung: -1, farbe: 'gelb', stufe: 3, belag: 'wiesenweg' }, 'legende.wiesenweg'],
  ];
  const KB = 40; // Zeiger + Spalte für die Kachel
  const legendeSeite = {
    id: 'symbole', titel: 'symbole.titel', hinweis: 'symbole.farben',
    eintraege: [
      ...LEGENDE.map(([k, text]) => ({
        typ: 'info', waehlbar: true, hoehe: 16, breite: () => KB + textBreite(t(text)),
        zeichne(c, x, y, b, w) {
          // dunkles Feld wie die Pace-Notes-Tafel im Rennen
          if (w) pixelText(c, '▶', x, y + 5, 1, M.farbeAuswahl);
          c.fillStyle = CONFIG.pacenotes.farbeTafel;
          c.fillRect(x + 9, y, kachelBreite(k) + 2, 16);
          zeichneKachel(c, k, x + 10, y + 1);
          pixelText(c, t(text), x + KB, y + 5, 1, w ? M.farbeAuswahl : M.farbeText);
        },
      })),
      leer(3), ZURUECK,
    ],
  };
  const steuerungSeite = {
    id: 'steuerung', titel: 'steuerung.titel',
    eintraege: [
      steuerZeile(-1), ...steuerZeilen().map((_, n) => steuerZeile(n)), leer(4),
      { typ: 'aktion', text: 'steuerung.symbole', aktion: () => menue.oeffne(legendeSeite) },
      ZURUECK,
    ],
  };

  // --- Credits ---
  // M5a.1: dazu die Namenslisten aus config.js (menue.credits), je mit Überschrift; leere Liste = keine Gruppe.
  // Die Seite rollt mit hoch/runter, wenn sie nicht ganz auf den Bildschirm passt (rollen: true).
  const namensGruppe = (titel, namen) => (namen && namen.length
    ? [leer(6), textZeile(titel, M.farbeGruppe, true), ...namen.map((n) => textZeile(() => n, M.farbeText, true))]
    : []);
  const creditsSeite = {
    id: 'credits', titel: 'credits.titel', rollen: true,
    eintraege: () => [
      leer(2),
      textZeile('titel.name', M.farbeTitel, true),
      textZeile(() => t('credits.version', { v: VERSION }), M.farbeHinweis, true),
      leer(6),
      textZeile('credits.idee', M.farbeText, true),
      textZeile('credits.gebaut', M.farbeText, true),
      ...namensGruppe('credits.mitwirkende', M.credits && M.credits.mitwirkende),
      ...namensGruppe('credits.unterstuetzer', M.credits && M.credits.unterstuetzer),
      leer(6),
      textZeile('credits.erfunden', M.farbeHinweis, true),
      ZURUECK,
    ],
  };

  // --- Hauptmenü ---
  const haupt = {
    id: 'haupt', titel: 'menue.haupt', logo: true, oben: 30,
    zurueck: () => api.zumTitel(),
    eintraege: [
      { typ: 'aktion', text: 'menue.starten', aktion: () => api.starten() },
      { typ: 'aktion', text: 'menue.auto', aktion: () => menue.oeffne(autoSeite) },
      { typ: 'aktion', text: 'menue.etappe', aktion: () => menue.oeffne(etappeSeite) },
      { typ: 'aktion', text: 'menue.bestzeiten', aktion: () => menue.oeffne(bestzeitenSeite) },
      { typ: 'aktion', text: 'menue.einstellungen', aktion: () => menue.oeffne(einstellungenSeite) },
      { typ: 'aktion', text: 'menue.steuerung', aktion: () => menue.oeffne(steuerungSeite) },
      { typ: 'aktion', text: 'menue.credits', aktion: () => menue.oeffne(creditsSeite) },
    ],
  };

  // --- Pause und Rückfrage ---
  const frage = {
    id: 'frage', titel: 'frage.titel', start: 3,
    eintraege: [
      textZeile('frage.text', M.farbeHinweis, true), leer(3),
      { typ: 'aktion', text: 'frage.ja', aktion: () => api.zumHauptmenue() },
      { typ: 'aktion', text: 'frage.nein', aktion: () => menue.schliesse() },
    ],
  };
  const pause = {
    id: 'pause', titel: 'pause.titel',
    zurueck: () => api.weiter(), startKnopf: () => api.weiter(),
    eintraege: [
      { typ: 'aktion', text: 'pause.weiter', aktion: () => api.weiter() },
      { typ: 'aktion', text: 'pause.neustart', aktion: () => api.neustartEtappe() },
      { typ: 'aktion', text: 'pause.einstellungen', aktion: () => menue.oeffne(einstellungenSeite) },
      { typ: 'aktion', text: 'pause.hauptmenue', aktion: () => menue.oeffne(frage) },
    ],
  };

  return {
    titel, haupt, auto: autoSeite, etappe: etappeSeite, bestzeiten: bestzeitenSeite, einstellungen: einstellungenSeite,
    tasten: tastenSeite, steuerung: steuerungSeite, symbole: legendeSeite, credits: creditsSeite, pause, frage,
  };
}
