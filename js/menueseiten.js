// Die Menüseiten (seit M5a): Titel, Hauptmenü, Auto, Etappe, Bestzeiten, Einstellungen,
// Tastenbelegung, Steuerung, Symbol-Legende, Credits, Pause und Rückfrage; seit M5b der Zielbildschirm.
// Was die Einträge tun, kommt von main.js (api). Texte: js/texte.js.

import { CONFIG, VERSION } from './config.js';
import { pixelText, textBreite } from './pixel.js';
import { t, setzeSprache, aktuelleSprache } from './texte.js';
import { einstellungen, setze, AKTIONEN, tastenStandard } from './einstellungen.js';
import { tastenVon, tastenName, knopfName } from './input.js';
import { zeichneKachel, kachelBreite } from './pacenotesbild.js';
import { ladeBestzeiten, loescheBestzeiten, formatDatum, hundertstel } from './bestzeiten.js';
import { AUTOS, ETAPPEN, auswahl } from './inhalte.js';
import { formatZeit } from './hud.js';

// api: { menue, zumMenue, starten, weiter, neustartEtappe, zumHauptmenue, zumTitel, paceNotes, vollbild(b),
//        M5b: neuStarten, ergebnis() (Zielbildschirm), markiert() (gerade eingetragener Lauf) }
export function baueSeiten(api) {
  const M = CONFIG.menue;
  const RA = CONFIG.rennablauf;
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

  // --- Bestzeiten (seit M5b gefüllt): Top 10 der gewählten Etappe als Tabelle Platz | Zeit | Datum ---
  // Der gerade eingetragene Lauf ist orange hervorgehoben (nur bis zum nächsten Start, api.markiert()).
  // Wie die Etappenliste: je Etappe eine eigene Liste (weitere Etappen brauchen keinen Umbau).
  const LUECKE = 12;
  const spaltenZeiten = () => ({
    a: Math.max(textBreite(t('bestzeiten.platz')), textBreite('10.')),
    b: Math.max(textBreite(t('bestzeiten.zeit')), textBreite('00:00.00')),
    c: Math.max(textBreite(t('bestzeiten.datum')), textBreite(formatDatum('2026-12-31T12:00:00Z', aktuelleSprache()))),
  });
  const breiteZeiten = () => { const s = spaltenZeiten(); return s.a + s.b + s.c + 2 * LUECKE; };
  const kopfZeiten = {
    typ: 'info', hoehe: 10, breite: breiteZeiten,
    zeichne(c, x, y, b) {
      const s = spaltenZeiten(), x0 = x + Math.round((b - breiteZeiten()) / 2);
      pixelText(c, t('bestzeiten.platz'), x0 + s.a, y + 1, 1, M.farbeGruppe, 'rechts');
      pixelText(c, t('bestzeiten.zeit'), x0 + s.a + LUECKE, y + 1, 1, M.farbeGruppe);
      pixelText(c, t('bestzeiten.datum'), x0 + s.a + LUECKE + s.b + LUECKE, y + 1, 1, M.farbeGruppe);
    },
  };
  const zeitZeile = (z, platz, neu) => ({
    typ: 'info', hoehe: 9, breite: breiteZeiten, neu, // (neu: für Tests)
    inhalt: () => `${platz}. ${formatZeit(z.zeit)} ${formatDatum(z.datum, aktuelleSprache())}`,
    zeichne(c, x, y, b) {
      const s = spaltenZeiten(), x0 = x + Math.round((b - breiteZeiten()) / 2);
      const farbe = neu ? RA.farbeNeu : M.farbeText;
      if (neu) { c.fillStyle = M.farbeAuswahlGrund; c.fillRect(x - 4, y, b + 8, 9); }
      pixelText(c, `${platz}.`, x0 + s.a, y + 1, 1, neu ? farbe : M.farbeWert, 'rechts');
      pixelText(c, formatZeit(z.zeit), x0 + s.a + LUECKE, y + 1, 1, farbe);
      pixelText(c, formatDatum(z.datum, aktuelleSprache()), x0 + s.a + LUECKE + s.b + LUECKE, y + 1, 1, neu ? farbe : M.farbeHinweis);
    },
  });
  const bestzeitenSeite = {
    id: 'bestzeiten', titel: 'bestzeiten.titel',
    eintraege: () => {
      const etappe = ETAPPEN[auswahl.etappe];
      const liste = ladeBestzeiten(etappe.id);
      const mark = api.markiert ? api.markiert() : null;
      const zeilen = liste.length
        ? [kopfZeiten, ...liste.map((z, i) => zeitZeile(z, i + 1, !!mark && mark.etappe === etappe.id && mark.datum === z.datum))]
        : [leer(4), textZeile('bestzeiten.leer', M.farbeHinweis, true), leer(4)];
      return [textZeile(() => t(etappe.name), M.farbeGruppe, true), ...zeilen, leer(3), ZURUECK];
    },
  };

  // --- Rückfrage "SICHER?" (M5a, seit M5b für mehrere Fragen): text = Erklärung, ja = was JA tut. NEIN ist vorgewählt
  const frageSeite = (text, ja) => ({
    id: 'frage', titel: 'frage.titel', start: 3,
    eintraege: [
      textZeile(text, M.farbeHinweis, true), leer(3),
      { typ: 'aktion', text: 'frage.ja', aktion: ja },
      { typ: 'aktion', text: 'frage.nein', aktion: () => menue.schliesse() },
    ],
  });
  // Bestzeiten löschen (Einstellungen, Gruppe DATEN): alle Etappen, danach kurze Meldung
  const loeschFrage = frageSeite('frage.loeschen', () => {
    loescheBestzeiten();
    menue.schliesse();
    menue.zeigeMeldung(t('einst.geloescht'), M.farbeTitel);
  });

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
      // M6: Minimap und Live-Vergleich (sofort wirksam)
      { typ: 'gruppe', text: 'einst.anzeige' },
      { typ: 'umschalter', text: 'einst.minimap', lesen: () => einstellungen.minimap, setzen: (b) => setze('minimap', b) },
      { typ: 'umschalter', text: 'einst.vergleich', hinweis: 'einst.vergleichHinweis', lesen: () => einstellungen.vergleich, setzen: (b) => setze('vergleich', b) },
      {
        typ: 'auswahl', text: 'einst.vergleichMit',
        optionen: () => [{ wert: 'best', text: 'wert.bestzeit' }, { wert: 'letzter', text: 'wert.letzterLauf' }],
        lesen: () => einstellungen.vergleichMit, setzen: (w) => setze('vergleichMit', w),
      },
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
      // M7a.1: Signaltöne (Menü, Countdown, Checkpoint, Ziel) zusätzlich leiser/lauter
      {
        typ: 'regler', text: 'einst.signale', hinweis: 'einst.signaleHinweis', min: 0, max: 100, schritt: M.lautSchritt,
        lesen: () => einstellungen.signale, setzen: (w) => setze('signale', w), anzeige: (w) => `${w}%`,
      },
      { typ: 'gruppe', text: 'einst.sprache' },
      {
        typ: 'auswahl', text: 'einst.sprache',
        optionen: () => [{ wert: 'de', text: 'sprache.de' }, { wert: 'en', text: 'sprache.en' }],
        lesen: () => einstellungen.sprache, setzen: (w) => { setze('sprache', w); setzeSprache(w); },
      },
      // M5b: Daten (alle Bestzeiten löschen, mit Rückfrage)
      { typ: 'gruppe', text: 'einst.daten' },
      { typ: 'aktion', text: 'einst.bestzeitenLoeschen', hinweis: 'einst.loeschenHinweis', aktion: () => menue.oeffne(loeschFrage) },
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
    ['aktion.hud', tastenVon('hud'), t('pad.keiner')],
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
    inhalt: () => (n < 0 ? '' : steuerZeilen()[n].map((w, i) => (i ? w : t(w))).join(' | ')), // (für Tests)
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
  const frage = frageSeite('frage.text', () => api.zumHauptmenue());
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

  // --- Zielbildschirm (M5b) ---------------------------------------------------------------------
  // Titel ZIEL! (bei neuer Bestzeit blinkend NEUE BESTZEIT!), Platz, Endzeit gross, Vergleich zur Bestzeit vor
  // diesem Lauf, Zwischenzeiten, Statistik, NEU STARTEN (vorgewählt) / HAUPTMENÜ. Esc tut nichts, R = Neu starten.
  const erg = () => (api.ergebnis ? api.ergebnis() : null);
  // Unterschied zweier Zeiten in Hundertstel (wie die Anzeige): Text und Farbe
  const unterschied = (neu, alt) => {
    const d = hundertstel(neu) - hundertstel(alt), a = Math.abs(d);
    const sek = Math.floor(a / 100), hs = String(a % 100).padStart(2, '0');
    const zahl = sek >= 60 ? `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, '0')}.${hs}` : `${sek}.${hs}`;
    if (d < 0) return { text: `-${zahl}`, farbe: RA.farbeSchneller };
    if (d > 0) return { text: `+${zahl}`, farbe: RA.farbeLangsamer };
    return { text: zahl, farbe: RA.farbeGleich };
  };
  const grosseZeit = (zeit) => ({
    typ: 'info', hoehe: 25, breite: () => textBreite(formatZeit(zeit), 3), inhalt: () => formatZeit(zeit),
    zeichne(c, x, y, b) { pixelText(c, formatZeit(zeit), x + b / 2, y + 2, 3, M.farbeText, 'mitte'); },
  });
  const vergleichZeile = (e) => {
    const u = e.bisher ? unterschied(e.zeit, e.bisher.zeit) : null;
    if (!u) return textZeile('ziel.ersteZeit', M.farbeHinweis, true);
    return {
      typ: 'info', hoehe: 17, breite: () => textBreite(u.text, 2), inhalt: () => u.text, farbe: u.farbe,
      zeichne(c, x, y, b) { pixelText(c, u.text, x + b / 2, y + 1, 2, u.farbe, 'mitte'); },
    };
  };
  const CP_B = 30, CP_ZEIT = 48, CP_LUECKE = 12, CP_DIFF = 36; // Spalten: "CP 1" | Zeit | Unterschied (z. B. +12.34)
  const cpZeile = (e, n) => {
    const zz = e.cps[n], alt = e.bisher && e.bisher.cps ? e.bisher.cps[n] : null;
    const u = zz != null && alt != null ? unterschied(zz, alt) : null;
    const zeit = zz == null ? '--:--.--' : formatZeit(zz);
    return {
      typ: 'info', hoehe: 9, breite: CP_B + CP_ZEIT + CP_LUECKE + CP_DIFF,
      inhalt: () => `${t('ziel.cp', { n: n + 1 })} ${zeit}${u ? ` ${u.text}` : ''}`, farbe: u ? u.farbe : null,
      zeichne(c, x, y, b) {
        const x0 = x + Math.round((b - (CP_B + CP_ZEIT + CP_LUECKE + CP_DIFF)) / 2);
        pixelText(c, t('ziel.cp', { n: n + 1 }), x0, y + 1, 1, M.farbeGruppe);
        pixelText(c, zeit, x0 + CP_B, y + 1, 1, M.farbeText);
        if (u) pixelText(c, u.text, x0 + CP_B + CP_ZEIT + CP_LUECKE, y + 1, 1, u.farbe);
      },
    };
  };
  // Statistik in drei Spalten: Überschrift (hellblau), darunter der Wert
  const statWerte = (e) => {
    const mph = einstellungen.einheit === 'mph';
    const v = Math.round(e.hoechstTempo * 3.6 / (mph ? 1.609344 : 1));
    return [
      [t('ziel.aufpralle'), String(e.aufpralle)],
      [t('ziel.resets'), String(e.resets)],
      [t('ziel.hoechstTempo'), `${v} ${t(mph ? 'einheit.mph' : 'einheit.kmh')}`],
    ];
  };
  const statZeile = (e) => ({
    typ: 'info', hoehe: 19,
    breite: () => 3 * Math.max(...statWerte(e).flat().map((w) => textBreite(w))) + 2 * 10,
    inhalt: () => statWerte(e).map((w) => w.join(' ')).join(' · '),
    zeichne(c, x, y, b) {
      statWerte(e).forEach(([titel, wert], i) => {
        const xm = x + Math.round(b * (i + 0.5) / 3);
        pixelText(c, titel, xm, y + 1, 1, M.farbeGruppe, 'mitte');
        pixelText(c, wert, xm, y + 11, 1, M.farbeText, 'mitte');
      });
    },
  });
  const zielSeite = {
    id: 'ziel',
    titel: () => t(erg() && erg().neueBest ? 'ziel.neueBestzeit' : 'ziel.titel'),
    // neue Bestzeit: Titel blinkt (gelb / grün); sonst wird die Seite nicht neu gezeichnet
    get blinkt() { const e = erg(); return !!(e && e.neueBest); },
    titelFarbe: (blinkAn) => (erg() && erg().neueBest && !blinkAn ? RA.farbeSchneller : M.farbeTitel),
    zurueck: () => false, // Esc / B tun hier nichts (keine Pause im Zielbildschirm, auch kein Ton)
    kurztaste: (code) => { const T = einstellungen.tasten.zurueck; if (code === T[0] || code === T[1]) api.neuStarten(); },
    eintraege: () => {
      const e = erg();
      const knoepfe = [
        { typ: 'aktion', text: 'ziel.neuStarten', aktion: () => api.neuStarten() },
        { typ: 'aktion', text: 'ziel.hauptmenue', aktion: () => api.zumHauptmenue() },
      ];
      if (!e) return knoepfe;
      const platz = !e.neueBest && e.platz > 0 && e.bisher
        ? [textZeile(() => t('ziel.platz', { p: e.platz, n: e.anzahl }), M.farbeGruppe, true)] : [];
      return [
        ...platz,
        grosseZeit(e.zeit),
        vergleichZeile(e),
        leer(4),
        ...e.cps.map((_, n) => cpZeile(e, n)),
        leer(5),
        statZeile(e),
        ...(e.gespeichert ? [leer(4)] : [leer(2), textZeile('ziel.nichtGespeichert', M.farbeHinweis, true)]),
        ...knoepfe,
      ];
    },
  };

  return {
    ziel: zielSeite,
    titel, haupt, auto: autoSeite, etappe: etappeSeite, bestzeiten: bestzeitenSeite, einstellungen: einstellungenSeite,
    tasten: tastenSeite, steuerung: steuerungSeite, symbole: legendeSeite, credits: creditsSeite, pause, frage,
  };
}
