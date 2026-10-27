// Die Menüseiten (seit M5a): Titel, Hauptmenü, Auto, Etappe, Bestzeiten, Einstellungen,
// Tastenbelegung, Steuerung, Symbol-Legende, Credits, Pause und Rückfrage; seit M5b der Zielbildschirm.
// Was die Einträge tun, kommt von main.js (api). Texte: js/texte.js.

import { CONFIG, VERSION } from './config.js';
import { pixelText, textBreite } from './pixel.js';
import { t, setzeSprache, aktuelleSprache } from './texte.js';
import { einstellungen, setze, AKTIONEN, tastenStandard } from './einstellungen.js';
import { tastenVon, tastenName, knopfName } from './input.js';
import { zeichneKachel, kachelBreite } from './pacenotesbild.js';
import { ladeBestzeiten, ladeGesamtTop, loescheBestzeiten, formatDatum, hundertstel, BESTZEITEN_ANZAHL, GESAMT_ANZAHL } from './bestzeiten.js';
import { AUTOS, ETAPPEN, auswahl } from './inhalte.js';
import { AUTO_MODELLE, kurzName } from './autos.js';
import { formatZeit } from './hud.js';
import { touchAn, webAppModus } from './touch.js'; // M9a
import { testTick } from './haptik.js'; // M9a.1

// api: { menue, zumMenue, starten, weiter, neustartEtappe, zumHauptmenue, zumTitel, paceNotes, vollbild(b),
//        M5b: neuStarten, ergebnis() (Zielbildschirm), markiert() (gerade eingetragener Lauf),
//        M8c: autoWechseln(id, lack), autoWahl() ({ auto, modell, profil }), autoModell() (das gebaute Modell, js/car.js),
//        M9a: vollbildGeht() (kann der Browser Vollbild? iPhone-Safari nicht) }
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
      if (blinkAn) pixelText(c, t(touchAn() ? 'titel.tippen' : 'titel.taste'), 160, 112, 1, M.farbeText, 'mitte'); // M9a: TIPPEN
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
  // --- Garage (M8c, Seite AUTO): links die Autos und LACK, rechts oben das drehende 3D-Modell (main.js zeichnet es mit
  // js/garage.js in den Rahmen garageRahmen), rechts unten vier Werte-Balken, unten zwei Zeilen Daten.
  // M8d: Zeiger bewegen wählt nichts (die Vorschau zeigt nur das markierte Auto); erst Bestätigen (Enter, Leertaste,
  // Gamepad A, Klick) wählt das Auto (Modell, Fahrprofil, Ton), die Garage bleibt offen. LACK gehört immer zum
  // bestätigten Auto. (Bis M8c wechselte schon das blosse Zeigen das Auto – mit der Tastatur kam man so nur über
  // ESCORTA zu LACK.)
  const GA = CONFIG.garage;
  const lackVon = (name) => CONFIG.autoOptik.lackierungen[name] || {};
  const garage = { rahmen: null, tacho: null }; // Vorschau-Rahmen und Tacho-Mitte (M8g; Pixel im 320x180-Raster), gesetzt beim Zeichnen
  const WERTE = [['beschleunigung', 'garage.beschleunigung'], ['tempo', 'garage.tempo'], ['grip', 'garage.grip'], ['drift', 'garage.drift']];
  const modellJetzt = () => (api.autoModell ? api.autoModell().modell : AUTO_MODELLE[AUTOS[auswahl.auto].id]); // bestätigt
  // M8d: Auto der Vorschau = das markierte (Zeiger auf einer Auto-Zeile), sonst das bestätigte
  const markiertesAuto = () => {
    if (menue.seite !== autoSeite) return null;
    const e = autoSeite.eintraege()[menue.wahl];
    return e && e.autoId ? e.autoId : null;
  };
  const vorschauModell = () => AUTO_MODELLE[markiertesAuto()] || modellJetzt();
  garage.vorschauId = () => vorschauModell().id; // (main.js: welches Modell dreht sich in der Vorschau)
  function garageRechts(c, x, y, b, h, tafel) {
    // Vorschau: dunkle Tafel mit hellem Rand (die 3D-Szene kommt darüber, nur während die Seite offen ist)
    // M8g: rechts daneben der Tacho des markierten Autos (main.js zeichnet ihn jedes Bild an garage.tacho = Mitte)
    const T = GA.tacho, rechts = !!(T && T.an && T.lage === 'rechts');
    const px = x + 2, py = y, pb = (b - M.innen - 4 - (rechts ? T.breite : 0)) & ~1, ph = GA.vorschauHoehe;
    garage.rahmen = { x: px, y: py, b: pb, h: ph };
    garage.tacho = !(T && T.an) ? null : rechts
      ? { cx: px + pb + 2 + Math.floor(T.breite / 2), cy: py + Math.round(ph / 2) + 4 }
      : { cx: px + pb - 25, cy: py + ph - 25 };
    c.fillStyle = M.farbeRand; c.globalAlpha = 0.5; c.fillRect(px - 1, py - 1, pb + 2, ph + 2); c.globalAlpha = 1;
    c.fillStyle = GA.hintergrund; c.fillRect(px, py, pb, ph);
    // Werte-Balken: 1 bis 10 Kästchen (des markierten Autos)
    const m = vorschauModell();
    const lb = Math.max(...WERTE.map(([, k]) => textBreite(t(k))));
    WERTE.forEach(([feld, k], i) => {
      const ly = py + ph + 5 + i * 9;
      pixelText(c, t(k), px, ly + 1, 1, M.farbeGruppe);
      const w = Math.max(0, Math.min(10, Math.round(m.werte ? m.werte[feld] : 0)));
      for (let n = 0; n < 10; n++) {
        const bx = px + lb + 6 + n * 6;
        c.fillStyle = '#101418'; c.fillRect(bx + 1, ly + 2, 5, 5);
        c.fillStyle = n < w ? M.farbeWert : M.farbeRegler; c.fillRect(bx, ly + 1, 5, 5);
      }
    });
    // zwei Zeilen Daten (Antrieb, Bauart), über die ganze Tafel
    const mitte = tafel.x0 + Math.round(tafel.breite / 2);
    // (M8e: mit Hinweiszeile darunter 3 Pixel tiefer, damit zwischen Werte-Balken und Daten Luft bleibt)
    const dy = autoSeite.hinweis ? 16 : 19;
    [`auto.${m.id}.daten1`, `auto.${m.id}.daten2`].forEach((k, i) => pixelText(c, t(k), mitte, y + h - dy + i * 9, 1, M.farbeText, 'mitte'));
  }
  const autoZeile = (a) => ({
    typ: 'aktion', text: a.name, autoId: a.id, // (autoId: für Tests)
    // das gewählte Auto steht gelb, auch wenn der Zeiger woanders ist (z. B. auf LACK)
    farbeText: () => ((api.autoWahl ? api.autoWahl().modell : AUTOS[auswahl.auto].id) === a.id ? M.farbeWert : M.farbeText),
    // M8d: bestätigen = dieses Auto wählen, die Garage bleibt offen (schon gewählt: nichts zu tun, nur der Ton)
    // M8e: dazu heult der Motor kurz auf, statt des Bestätigungstons (ohne Ton: der Bestätigungston wie bisher)
    aktion: () => { if (api.autoWechseln) api.autoWechseln(a.id); return api.aufheulen && api.aufheulen() ? 'ohneTon' : undefined; },
  });
  const lackZeile = {
    typ: 'auswahl', text: () => '', lack: true,
    optionen: () => modellJetzt().lackierungen.map((n) => ({ wert: n, text: `lack.${n}` })),
    lesen: () => (api.autoModell ? api.autoModell().lackName : modellJetzt().lackierungen[0]),
    setzen: (w) => { if (api.autoWechseln) api.autoWechseln(api.autoWahl().auto, w); },
    probe: (w) => { const l = lackVon(w); return [l.lack, l.streifen0 || l.akzent || l.unten].filter(Boolean); },
  };
  const autoSeite = {
    id: 'auto', titel: 'garage.titel', breite: GA.tafelBreite, spalte: GA.spalte, minHoehe: GA.tafelHoehe,
    // der Zeiger beginnt beim gewählten Auto
    get start() { return Math.max(0, AUTOS.findIndex((a) => a.id === (api.autoWahl ? api.autoWahl().modell : AUTOS[auswahl.auto].id))); },
    eintraege: () => [
      ...AUTOS.map(autoZeile),
      leer(6), { typ: 'gruppe', text: 'garage.lack' }, lackZeile, leer(4), ZURUECK,
    ],
    zeichneRechts: garageRechts,
    // M8e: Hinweiszeile unten (wie wählt man?), mit der Taste der zuletzt benutzten Eingabe (Gamepad: A)
    // (M9a: nach Touch "A ODER ANTIPPEN")
    hinweis: () => t(menue.letzteEingabe === 'gamepad' ? 'garage.hinweisPad' : menue.letzteEingabe === 'touch' ? 'garage.hinweisTouch' : 'garage.hinweis'),
  };
  const etappeSeite = {
    id: 'etappe', titel: 'etappe.titel',
    eintraege: () => [
      ...ETAPPEN.map((e, i) => karte(e.name, () => [t('etappe.daten1', { km: e.laenge.toFixed(1), cps: e.checkpoints }), ...e.daten.map((d) => t(d))], () => auswahl.etappe === i)),
      leer(), textZeile('etappe.spaeter', M.farbeHinweis, true), leer(3), ZURUECK,
    ],
  };

  // --- Bestzeiten (seit M5b gefüllt). M8h: eine Seite mit oben der GESAMT TOP 3 (alle Autos, je Zeile der Kurzname)
  // und darunter den TOP 10 eines Autos; Links/Rechts (Tastatur, Gamepad, Klick auf die Pfeile) wechselt das Auto.
  // Der gerade eingetragene Lauf ist orange hervorgehoben (nur bis zum nächsten Start, api.markiert(), Schlüssel Auto + Datum).
  // Platz: Das Menü ist in jeder Pixelgrösse 320x180, die Tafel höchstens 172 hoch. Damit 3 + 10 Zeilen ohne Rollen passen,
  // sind die Zeit-Zeilen 8 Pixel hoch (bis 0.8g 9) und die Etappe steht rechts in der Kopfzeile der Gesamtwertung.
  // Wie die Etappenliste: je Etappe eine eigene Liste (weitere Etappen brauchen keinen Umbau).
  const LUECKE = 12;
  const ZEIT_ZEILE = 8; // Höhe einer Zeit-Zeile (Pixelschrift 7 hoch, 1 Pixel Abstand)
  const spaltenZeiten = () => ({
    a: Math.max(textBreite(t('bestzeiten.platz')), textBreite('10.')),
    b: Math.max(textBreite(t('bestzeiten.zeit')), textBreite('00:00.00')),
    c: Math.max(textBreite(t('bestzeiten.datum')), textBreite(formatDatum('2026-12-31T12:00:00Z', aktuelleSprache()))),
    d: Math.max(textBreite(t('bestzeiten.auto')), textBreite('PROTO'), ...Object.values(AUTO_MODELLE).map((m) => textBreite(m.kurz))),
  });
  const breiteZeiten = () => { const s = spaltenZeiten(); return s.a + s.b + s.d + s.c + 3 * LUECKE; };
  // Kopfzeile einer Liste: links die Überschrift (hellblau), rechts optional ein Zusatz (grau, z. B. die Etappe)
  const kopfZeiten = (links, rechts = null) => ({
    typ: 'info', hoehe: 10, breite: () => Math.max(breiteZeiten(), textBreite(t(links)) + (rechts ? LUECKE + textBreite(rechts()) : 0)),
    inhalt: () => (rechts ? `${t(links)} ${rechts()}` : t(links)), kopf: true, // (für Tests)
    zeichne(c, x, y, b) {
      const bz = Math.max(breiteZeiten(), textBreite(t(links)) + (rechts ? LUECKE + textBreite(rechts()) : 0));
      const x0 = x + Math.round((b - bz) / 2);
      pixelText(c, t(links), x0, y + 1, 1, M.farbeGruppe);
      if (rechts) pixelText(c, rechts(), x0 + bz, y + 1, 1, M.farbeHinweis, 'rechts');
    },
  });
  // Kurzname des Autos in der Gesamtwertung (PROTO = Vergleichsprofil; ohne gültige Id, z. B. Zeiten von vor M8a: --)
  const autoName = (id) => (id != null && kurzName(id)) || '--';
  // Eine Zeit: Platz | Zeit | Auto (nur in der Gesamtwertung) | Datum
  const zeitZeile = (z, platz, neu, mitAuto) => ({
    typ: 'info', hoehe: ZEIT_ZEILE, breite: breiteZeiten, neu, // (neu: für Tests)
    inhalt: () => `${platz}. ${formatZeit(z.zeit)} ${formatDatum(z.datum, aktuelleSprache())}`,
    autoKurz: mitAuto ? () => autoName(z.auto) : null, // M8c (für Tests): Kurzname des Autos in dieser Zeile
    zeichne(c, x, y, b) {
      const s = spaltenZeiten(), x0 = x + Math.round((b - breiteZeiten()) / 2);
      const farbe = neu ? RA.farbeNeu : M.farbeText;
      if (neu) { c.fillStyle = M.farbeAuswahlGrund; c.fillRect(x - 4, y, b + 8, ZEIT_ZEILE); }
      pixelText(c, `${platz}.`, x0 + s.a, y + 1, 1, neu ? farbe : M.farbeWert, 'rechts');
      pixelText(c, formatZeit(z.zeit), x0 + s.a + LUECKE, y + 1, 1, farbe);
      if (mitAuto) pixelText(c, autoName(z.auto), x0 + s.a + LUECKE + s.b + LUECKE, y + 1, 1, neu ? farbe : M.farbeGruppe);
      pixelText(c, formatDatum(z.datum, aktuelleSprache()), x0 + s.a + LUECKE + s.b + LUECKE + s.d + LUECKE, y + 1, 1, neu ? farbe : M.farbeHinweis);
    },
  });
  let bestAuto = 0; // Nummer in AUTOS: wessen Top 10 die Seite zeigt
  const autoWahlZeile = {
    typ: 'auswahl', text: 'bestzeiten.auto',
    optionen: () => AUTOS.map((a, i) => ({ wert: i, text: a.name })),
    lesen: () => bestAuto, setzen: (w) => { bestAuto = w; },
  };
  const bestzeitenSeite = {
    id: 'bestzeiten', titel: 'bestzeiten.titel',
    // beim Öffnen (menue.oeffne liest start einmal): Auto = das eben gefahrene (markierter Lauf), sonst das der Garage.
    // null = der Zeiger steht auf dem ersten wählbaren Eintrag (AUTO)
    get start() {
      const mark = api.markiert ? api.markiert() : null;
      const i = mark ? AUTOS.findIndex((a) => a.id === mark.auto) : -1;
      bestAuto = i >= 0 ? i : auswahl.auto;
      return null;
    },
    eintraege: () => {
      const etappe = ETAPPEN[auswahl.etappe];
      const auto = AUTOS[bestAuto] || AUTOS[0];
      const mark = api.markiert ? api.markiert() : null;
      const neu = (z) => !!mark && mark.etappe === etappe.id && mark.datum === z.datum && mark.auto === z.auto;
      const gesamt = ladeGesamtTop(etappe.id);
      const liste = ladeBestzeiten(etappe.id, auto.id);
      // Kürzere Listen werden mit Leerraum auf 3 bzw. 10 Zeilen aufgefüllt: die Tafel bleibt gleich hoch, AUTO und
      // ZURÜCK springen beim Umschalten nicht (sonst trifft ein zweiter Mausklick daneben)
      const block = (zeilen, leerText, n) => {
        const l = zeilen.length ? zeilen : [textZeile(leerText, M.farbeHinweis, true)];
        const rest = n * ZEIT_ZEILE - l.reduce((h, e) => h + e.hoehe, 0);
        return rest > 0 ? [...l, leer(rest)] : l;
      };
      return [
        kopfZeiten('bestzeiten.gesamt', () => t(etappe.name)),
        ...block(gesamt.map((z, i) => zeitZeile(z, i + 1, neu(z), true)), 'bestzeiten.leer', GESAMT_ANZAHL),
        leer(2),
        autoWahlZeile,
        kopfZeiten('bestzeiten.top10'),
        ...block(liste.map((z, i) => zeitZeile(z, i + 1, neu(z), false)), 'bestzeiten.leerAuto', BESTZEITEN_ANZAHL),
        leer(2), ZURUECK,
      ];
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
  // VOLLBILD (M9a): ohne Vollbild im Browser (iPhone-Safari) kein wirkungsloser Schalter, sondern ein Hinweis
  const vollbildGeht = () => (api.vollbildGeht ? api.vollbildGeht() : true);
  const vollbildHinweis = () => (webAppModus() ? 'einst.vollbildWebApp' : 'einst.vollbildHome');
  const vollbildEintrag = {
    get typ() { return vollbildGeht() ? 'umschalter' : 'aktion'; },
    text: 'einst.vollbild',
    get hinweis() { return vollbildGeht() ? undefined : vollbildHinweis(); },
    lesen: () => einstellungen.vollbild, setzen: (b) => { setze('vollbild', b); api.vollbild(b, true); },
    wert: () => t(webAppModus() ? 'wert.webApp' : 'wert.homeBildschirm'),
    aktion: () => { menue.zeigeMeldung(t(vollbildHinweis()), M.farbeTitel); return 'ohneTon'; }, // schaltet nichts
  };
  // M9a.1: AUTO-GAS (und HAPTIK) nur im Touch-Modus, direkt nach TOUCH-STEUERUNG (am Desktop alles wie bisher)
  const nurTouch = [
    { typ: 'umschalter', text: 'einst.autoGas', hinweis: 'einst.autoGasHinweis', lesen: () => einstellungen.touchAutoGas, setzen: (b) => setze('touchAutoGas', b) },
    {
      typ: 'auswahl', text: 'einst.haptik', hinweis: 'einst.haptikHinweis',
      optionen: () => [{ wert: 'aus', text: 'wert.aus' }, { wert: 'knoepfe', text: 'wert.knoepfe' }, { wert: 'voll', text: 'wert.voll' }],
      lesen: () => einstellungen.haptik, setzen: (w) => setze('haptik', w),
    },
    // ein Tick zum Ausprobieren (läuft im Touch-Ereignis: A oder Antippen); die Meldung sagt, welcher Weg es war
    { typ: 'aktion', text: 'einst.haptikTesten', hinweis: 'einst.haptikTestenHinweis', aktion: () => { menue.zeigeMeldung(t(`haptik.${testTick()}`), M.farbeTitel); } },
  ];
  const einstellungenListe = [
      { typ: 'gruppe', text: 'einst.grafik' },
      vollbildEintrag,
      {
        typ: 'auswahl', text: 'einst.aufloesung', hinweis: 'einst.aufloesungHinweis',
        optionen: () => R.map((r, i) => ({ wert: i, text: () => `${r[0]}X${r[1]}` })),
        lesen: () => einstellungen.aufloesung, setzen: (w) => setze('aufloesung', w),
      },
      {
        typ: 'umschalter', text: 'einst.paceNotes',
        hinweis: () => (touchAn() ? t('einst.paceNotesHinweisTouch') : t('einst.paceNotesHinweis', { taste: tastenName(einstellungen.tasten.notes[0]) })),
        lesen: () => api.paceNotes.anzeige.an, setzen: (b) => { if (b !== api.paceNotes.anzeige.an) api.paceNotes.umschalten(); },
      },
      {
        typ: 'auswahl', text: 'einst.einheiten',
        optionen: () => [{ wert: 'kmh', text: 'einheit.kmh' }, { wert: 'mph', text: 'einheit.mph' }],
        lesen: () => einstellungen.einheit, setzen: (w) => setze('einheit', w),
      },
      // M8g: TACHO = AUTO-STIL (jedes Auto sein eigener Tacho) oder KLASSISCH (der Tacho bis 0.8f für alle), sofort
      {
        typ: 'auswahl', text: 'einst.tacho', hinweis: 'einst.tachoHinweis',
        optionen: () => [{ wert: 'auto', text: 'wert.tachoAuto' }, { wert: 'klassisch', text: 'wert.tachoKlassisch' }],
        lesen: () => einstellungen.tacho, setzen: (w) => setze('tacho', w),
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
      // M9a: Touch-Knöpfe AUTO (nur auf Touch-Geräten) / AN (immer, auch am Computer) / AUS
      {
        typ: 'auswahl', text: 'einst.touch', hinweis: 'einst.touchHinweis',
        optionen: () => [{ wert: 'auto', text: 'wert.auto' }, { wert: 'an', text: 'wert.an' }, { wert: 'aus', text: 'wert.aus' }],
        lesen: () => einstellungen.touch, setzen: (w) => setze('touch', w),
      },
      ...nurTouch,
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
      // M7b: Musik (Menü, Pause, Zielbildschirm) zusätzlich leiser/lauter
      {
        typ: 'regler', text: 'einst.musik', hinweis: 'einst.musikHinweis', min: 0, max: 100, schritt: M.lautSchritt,
        lesen: () => einstellungen.musik, setzen: (w) => setze('musik', w), anzeige: (w) => `${w}%`,
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
  ];
  const einstellungenDesktop = einstellungenListe.filter((e) => !nurTouch.includes(e));
  const einstellungenSeite = {
    id: 'einstellungen', titel: 'einst.titel',
    get eintraege() { return touchAn() ? einstellungenListe : einstellungenDesktop; }, // (eine Liste, wie bis 0.9a)
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
  // M9a: Abschnitt TOUCH (Knopf | Aktion, dazu zwei Zeilen fürs Menü); im Touch-Modus oben, sonst nach SYMBOLE
  const TOUCH_ZEILEN = [
    ['touch.dpadLenken', 'aktion.lenken'], ['touch.dpadGas', 'aktion.gas'], ['touch.dpadBremse', 'aktion.bremse'],
    ['touch.r', 'aktion.handbremse'], ['touch.l', 'aktion.zurueck'], ['touch.start', 'aktion.pause'], // M9a.1: R/L getauscht
    ['touch.select', 'aktion.hud'], ['touch.notes', 'aktion.notes'],
  ];
  const touchSpalte = () => Math.max(...TOUCH_ZEILEN.map((z) => textBreite(t(z[0]))));
  const touchZeile = ([knopf, aktion]) => ({
    typ: 'info', hoehe: 9, breite: () => touchSpalte() + 8 + textBreite(t(aktion)), inhalt: () => `${t(knopf)} | ${t(aktion)}`,
    zeichne(c, x, y) {
      pixelText(c, t(knopf), x, y + 1, 1, M.farbeWert);
      pixelText(c, t(aktion), x + touchSpalte() + 8, y + 1, 1, M.farbeText);
    },
  });
  const touchAbschnitt = [
    { typ: 'gruppe', text: 'steuerung.touch' }, ...TOUCH_ZEILEN.map(touchZeile), leer(2),
    textZeile('steuerung.touchMenue', M.farbeHinweis), textZeile('steuerung.touchTippen', M.farbeHinweis),
  ];
  const tastaturAbschnitt = [steuerZeile(-1), ...steuerZeilen().map((_, n) => steuerZeile(n))];
  const symboleKnopf = { typ: 'aktion', text: 'steuerung.symbole', aktion: () => menue.oeffne(legendeSeite) };
  const steuerungDesktop = [...tastaturAbschnitt, leer(4), symboleKnopf, leer(6), ...touchAbschnitt, leer(4), ZURUECK];
  const steuerungTouch = [...touchAbschnitt, leer(4), symboleKnopf, leer(6), ...tastaturAbschnitt, leer(4), ZURUECK];
  const steuerungSeite = {
    id: 'steuerung', titel: 'steuerung.titel', rollenWahl: true,
    get eintraege() { return touchAn() ? steuerungTouch : steuerungDesktop; }, // (eine Liste, wie bis 0.8h)
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
  // Statistik in Spalten (seit M8c vier: dazu das Auto): Überschrift (hellblau), darunter der Wert
  const statWerte = (e) => {
    const mph = einstellungen.einheit === 'mph';
    const v = Math.round(e.hoechstTempo * 3.6 / (mph ? 1.609344 : 1));
    return [
      [t('ziel.aufpralle'), String(e.aufpralle)],
      [t('ziel.resets'), String(e.resets)],
      [t('ziel.hoechstTempo'), `${v} ${t(mph ? 'einheit.mph' : 'einheit.kmh')}`],
      [t('bestzeiten.auto'), kurzName(e.auto)], // M8c: mit welchem Auto (gemeinsame Bestzeiten)
    ];
  };
  const statZeile = (e) => ({
    typ: 'info', hoehe: 19,
    breite: () => statWerte(e).length * Math.max(...statWerte(e).flat().map((w) => textBreite(w))) + (statWerte(e).length - 1) * 10,
    inhalt: () => statWerte(e).map((w) => w.join(' ')).join(' · '),
    zeichne(c, x, y, b) {
      statWerte(e).forEach(([titel, wert], i) => {
        const xm = x + Math.round(b * (i + 0.5) / statWerte(e).length);
        pixelText(c, titel, xm, y + 1, 1, M.farbeGruppe, 'mitte');
        pixelText(c, wert, xm, y + 11, 1, M.farbeText, 'mitte');
      });
    },
  });
  // Zeile über der grossen Zeit (M8h): "PLATZ p VON n" (Liste des Autos) und/oder "GESAMT PLATZ 2" (nur 2 und 3, der
  // Rekord steht im Titel); beide in einer Zeile, damit die Seite nicht höher wird als bis 0.8g
  const platzZeile = (e) => {
    const teile = [];
    if (!e.neueBest && e.platz > 0 && e.bisher) teile.push({ text: () => t('ziel.platz', { p: e.platz, n: e.anzahl }), farbe: M.farbeGruppe });
    if (!e.gesamtRekord && (e.gesamtPlatz === 2 || e.gesamtPlatz === 3)) teile.push({ text: () => t('ziel.gesamtPlatz', { p: e.gesamtPlatz }), farbe: M.farbeTitel });
    if (!teile.length) return [];
    const LUECKE_P = 14;
    const breite = () => teile.reduce((b, x) => b + textBreite(x.text()), 0) + (teile.length - 1) * LUECKE_P;
    return [{
      typ: 'info', hoehe: 10, breite, inhalt: () => teile.map((x) => x.text()).join(' · '), farbe: teile[teile.length - 1].farbe,
      farben: teile.map((x) => x.farbe), // (für Tests)
      zeichne(c, x, y, b) {
        let xl = x + Math.round((b - breite()) / 2);
        for (const tl of teile) { pixelText(c, tl.text(), xl, y + 1, 1, tl.farbe); xl += textBreite(tl.text()) + LUECKE_P; }
      },
    }];
  };
  // Titel: Gesamtrekord (M8h) vor neuer Bestzeit des Autos vor ZIEL!; beide blinken (gelb / grün)
  const feiern = () => { const e = erg(); return !!(e && (e.gesamtRekord || e.neueBest)); };
  const zielSeite = {
    id: 'ziel',
    titel: () => { const e = erg(); return t(e && e.gesamtRekord ? 'ziel.gesamtRekord' : e && e.neueBest ? 'ziel.neueBestzeit' : 'ziel.titel'); },
    // neue Bestzeit oder Gesamtrekord: Titel blinkt (gelb / grün); sonst wird die Seite nicht neu gezeichnet
    get blinkt() { return feiern(); },
    titelFarbe: (blinkAn) => (feiern() && !blinkAn ? RA.farbeSchneller : M.farbeTitel),
    zurueck: () => false, // Esc / B tun hier nichts (keine Pause im Zielbildschirm, auch kein Ton)
    kurztaste: (code) => { const T = einstellungen.tasten.zurueck; if (code === T[0] || code === T[1]) api.neuStarten(); },
    eintraege: () => {
      const e = erg();
      const knoepfe = [
        { typ: 'aktion', text: 'ziel.neuStarten', aktion: () => api.neuStarten() },
        { typ: 'aktion', text: 'ziel.hauptmenue', aktion: () => api.zumHauptmenue() },
      ];
      if (!e) return knoepfe;
      // (vergleichZeile und Zwischenzeiten vergleichen mit e.bisher = Bestzeit dieses Autos vor dem Lauf, M8h)
      return [
        ...platzZeile(e),
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
    garage, // M8c: Vorschau-Rahmen der Garage (main.js)
    titel, haupt, auto: autoSeite, etappe: etappeSeite, bestzeiten: bestzeitenSeite, einstellungen: einstellungenSeite,
    tasten: tastenSeite, steuerung: steuerungSeite, symbole: legendeSeite, credits: creditsSeite, pause, frage,
  };
}
