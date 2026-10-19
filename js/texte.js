// Alle sichtbaren Texte des Spiels (seit M5a), Deutsch (Schweizer Schreibweise, ss statt ß) und Englisch.
// Ändern: einfach den Text zwischen den Anführungszeichen anpassen. {name} sind Platzhalter
// (z. B. {taste} wird durch den Tastennamen ersetzt) und müssen stehen bleiben.
// Die Pixelschrift kennt nur Grossbuchstaben, Ziffern, Ä Ö Ü und ein paar Zeichen (js/pixel.js).

export const TEXTE = {
  // --- Laden ---
  'lade.titel': { de: 'ALPINE RALLY', en: 'ALPINE RALLY' },
  'lade.bauen': { de: 'Strecke wird gebaut …', en: 'Building the stage …' },
  'lade.fehler': { de: 'Fehler beim Starten:', en: 'Error while starting:' },
  'dokument.titel': { de: 'Alpine Rally', en: 'Alpine Rally' },

  // --- Titelbildschirm ---
  'titel.name': { de: 'ALPINE RALLY', en: 'ALPINE RALLY' },
  'titel.taste': { de: 'TASTE DRÜCKEN', en: 'PRESS ANY KEY' },

  // --- Hauptmenü ---
  'menue.haupt': { de: 'HAUPTMENÜ', en: 'MAIN MENU' },
  'menue.starten': { de: 'STARTEN', en: 'START' },
  'menue.auto': { de: 'AUTO', en: 'CAR' },
  'menue.etappe': { de: 'ETAPPE', en: 'STAGE' },
  'menue.bestzeiten': { de: 'BESTZEITEN', en: 'BEST TIMES' },
  'menue.einstellungen': { de: 'EINSTELLUNGEN', en: 'SETTINGS' },
  'menue.steuerung': { de: 'STEUERUNG', en: 'CONTROLS' },
  'menue.credits': { de: 'CREDITS', en: 'CREDITS' },
  'menue.zurueck': { de: 'ZURÜCK', en: 'BACK' },

  // --- Auto und Etappe ---
  'auto.titel': { de: 'AUTO', en: 'CAR' },
  'auto.rt4.name': { de: 'RINGWERK RT4', en: 'RINGWERK RT4' },
  'auto.rt4.daten1': { de: 'ALLRAD · TURBO · 5 GÄNGE AUTOMATIK', en: 'AWD · TURBO · 5-SPEED AUTOMATIC' },
  'auto.rt4.daten2': { de: 'SCHWERES RALLYAUTO, VIEL TRAKTION', en: 'HEAVY RALLY CAR, LOTS OF TRACTION' },
  'auswahl.gewaehlt': { de: 'GEWÄHLT', en: 'SELECTED' },
  'auto.spaeter': { de: 'WEITERE AUTOS FOLGEN', en: 'MORE CARS TO COME' },
  'etappe.titel': { de: 'ETAPPE', en: 'STAGE' },
  'etappe.pass.name': { de: 'PASSSTRASSE', en: 'MOUNTAIN PASS' },
  'etappe.daten1': { de: '{km} KM · {cps} CHECKPOINTS', en: '{km} KM · {cps} CHECKPOINTS' },
  'etappe.pass.daten2': { de: 'ASPHALT, SCHOTTER, WIESENWEG', en: 'TARMAC, GRAVEL, MEADOW TRACK' },
  'etappe.spaeter': { de: 'WEITERE ETAPPEN FOLGEN', en: 'MORE STAGES TO COME' },

  // --- Bestzeiten ---
  'bestzeiten.titel': { de: 'BESTZEITEN', en: 'BEST TIMES' },
  'bestzeiten.leer': { de: 'NOCH KEINE ZEITEN', en: 'NO TIMES YET' },
  // M5b: Spaltenköpfe der Tabelle
  'bestzeiten.platz': { de: 'PLATZ', en: 'RANK' },
  'bestzeiten.zeit': { de: 'ZEIT', en: 'TIME' },
  'bestzeiten.datum': { de: 'DATUM', en: 'DATE' },

  // --- Einstellungen ---
  'einst.titel': { de: 'EINSTELLUNGEN', en: 'SETTINGS' },
  'einst.grafik': { de: 'GRAFIK', en: 'GRAPHICS' },
  'einst.vollbild': { de: 'VOLLBILD', en: 'FULLSCREEN' },
  'einst.aufloesung': { de: 'PIXELGRÖSSE', en: 'PIXEL SIZE' },
  'einst.aufloesungHinweis': { de: 'SCHÄRFER = WENIGER RETRO UND MEHR LAST', en: 'SHARPER = LESS RETRO AND MORE LOAD' },
  'einst.paceNotes': { de: 'PACE-NOTES', en: 'PACE NOTES' },
  'einst.paceNotesHinweis': { de: 'GLEICH WIE TASTE {taste}', en: 'SAME AS KEY {taste}' },
  'einst.einheiten': { de: 'EINHEITEN', en: 'UNITS' },
  'einst.fps': { de: 'FPS-ANZEIGE (F3)', en: 'FPS DISPLAY (F3)' },
  'einst.steuerung': { de: 'STEUERUNG', en: 'CONTROLS' },
  'einst.tasten': { de: 'TASTEN BELEGEN', en: 'KEY BINDINGS' },
  'einst.lenk': { de: 'LENKEMPFINDLICHKEIT', en: 'STEERING SENSITIVITY' },
  'einst.totzone': { de: 'GAMEPAD-TOTZONE', en: 'GAMEPAD DEADZONE' },
  'einst.mitteHinweis': { de: 'MITTE = WIE BISHER', en: 'MIDDLE = DEFAULT' },
  'einst.ton': { de: 'TON', en: 'SOUND' },
  'einst.lautstaerke': { de: 'LAUTSTÄRKE', en: 'VOLUME' },
  'einst.lautHinweis': { de: 'FÜR ALLES (MOTOR, UMGEBUNG, MUSIK, SIGNALE)', en: 'FOR ALL (ENGINE, AMBIENCE, MUSIC, SIGNALS)' }, // M7b (M7a: GILT FÜR DEN GANZEN TON)
  'einst.signale': { de: 'SIGNALTÖNE', en: 'SIGNALS' }, // M7a.1
  'einst.signaleHinweis': { de: 'MENÜ, COUNTDOWN, CHECKPOINT, ZIEL', en: 'MENU, COUNTDOWN, CHECKPOINT, FINISH' },
  'einst.musik': { de: 'MUSIK', en: 'MUSIC' }, // M7b
  'einst.musikHinweis': { de: 'MENÜ, PAUSE, ZIEL - ZUSÄTZLICH ZUR LAUTSTÄRKE', en: 'MENU, PAUSE, FINISH - ON TOP OF VOLUME' },
  'einst.sprache': { de: 'SPRACHE', en: 'LANGUAGE' },
  'wert.an': { de: 'AN', en: 'ON' },
  'wert.aus': { de: 'AUS', en: 'OFF' },
  'sprache.de': { de: 'DEUTSCH', en: 'DEUTSCH' },
  'sprache.en': { de: 'ENGLISH', en: 'ENGLISH' },
  'einheit.kmh': { de: 'KM/H', en: 'KM/H' },
  'einheit.mph': { de: 'MPH', en: 'MPH' },
  // M6: Gruppe ANZEIGE
  'einst.anzeige': { de: 'ANZEIGE', en: 'DISPLAY' },
  'einst.minimap': { de: 'MINIMAP', en: 'MINIMAP' },
  'einst.vergleich': { de: 'LIVE-VERGLEICH', en: 'LIVE DELTA' },
  'einst.vergleichHinweis': { de: 'GRÜN = SCHNELLER, ROT = LANGSAMER', en: 'GREEN = FASTER, RED = SLOWER' },
  'einst.vergleichMit': { de: 'VERGLEICH MIT', en: 'COMPARE WITH' },
  'wert.bestzeit': { de: 'BESTZEIT', en: 'BEST TIME' },
  'wert.letzterLauf': { de: 'LETZTER LAUF', en: 'LAST RUN' },
  // M5b: Gruppe DATEN
  'einst.daten': { de: 'DATEN', en: 'DATA' },
  'einst.bestzeitenLoeschen': { de: 'BESTZEITEN LÖSCHEN', en: 'DELETE BEST TIMES' },
  'einst.loeschenHinweis': { de: 'ALLE ETAPPEN, NUR AUF DIESEM GERÄT', en: 'ALL STAGES, ONLY ON THIS DEVICE' },
  'einst.geloescht': { de: 'BESTZEITEN GELÖSCHT', en: 'BEST TIMES DELETED' },

  // --- Tastenbelegung ---
  'tasten.titel': { de: 'TASTEN BELEGEN', en: 'KEY BINDINGS' },
  'tasten.kopf1': { de: 'TASTE 1', en: 'KEY 1' },
  'tasten.kopf2': { de: 'TASTE 2', en: 'KEY 2' },
  'tasten.standard': { de: 'STANDARD', en: 'DEFAULTS' },
  'tasten.druecken': { de: 'TASTE DRÜCKEN…', en: 'PRESS A KEY…' },
  'tasten.abbrechen': { de: 'ESC = ABBRECHEN  ENTF = LEEREN', en: 'ESC = CANCEL  DEL = CLEAR' },
  'tasten.hinweis': { de: 'ESC, ENTER UND F3 SIND RESERVIERT', en: 'ESC, ENTER AND F3 ARE RESERVED' },
  'tasten.reserviert': { de: '{taste} IST RESERVIERT', en: '{taste} IS RESERVED' },
  'tasten.getauscht': { de: 'GETAUSCHT MIT {aktion}', en: 'SWAPPED WITH {aktion}' },
  'tasten.belegt': { de: 'SCHON BELEGT: {aktion}', en: 'ALREADY USED: {aktion}' },
  'tasten.nichtLeer': { de: 'TASTE 1 DARF NICHT LEER SEIN', en: 'KEY 1 CANNOT BE EMPTY' },
  'tasten.zurueckgesetzt': { de: 'STANDARD WIEDERHERGESTELLT', en: 'DEFAULTS RESTORED' },
  'tasten.leer': { de: '-', en: '-' },

  // --- Aktionen (Tastenbelegung, Steuerung) ---
  'aktion.gas': { de: 'GAS', en: 'THROTTLE' },
  'aktion.bremse': { de: 'BREMSE/RÜCKWÄRTS', en: 'BRAKE/REVERSE' },
  'aktion.links': { de: 'LINKS', en: 'LEFT' },
  'aktion.rechts': { de: 'RECHTS', en: 'RIGHT' },
  'aktion.lenken': { de: 'LENKEN', en: 'STEER' },
  'aktion.handbremse': { de: 'HANDBREMSE', en: 'HANDBRAKE' },
  'aktion.zurueck': { de: 'ZURÜCK AUF STRASSE', en: 'BACK ON ROAD' },
  'aktion.notes': { de: 'PACE-NOTES AN/AUS', en: 'PACE NOTES ON/OFF' },
  'aktion.hud': { de: 'HUD AUS/AN', en: 'HUD OFF/ON' },
  'aktion.pause': { de: 'PAUSE', en: 'PAUSE' },
  'aktion.debug': { de: 'FPS/DEBUG', en: 'FPS/DEBUG' },

  // --- Tastennamen (alle anderen Tasten: Buchstabe/Ziffer bzw. Name der Taste) ---
  'taste.Space': { de: 'LEERTASTE', en: 'SPACE' },
  'taste.Enter': { de: 'ENTER', en: 'ENTER' },
  'taste.Escape': { de: 'ESC', en: 'ESC' },
  'taste.Backspace': { de: 'RÜCKTASTE', en: 'BACKSPACE' },
  'taste.Tab': { de: 'TAB', en: 'TAB' },
  'taste.ShiftLeft': { de: 'SHIFT L', en: 'SHIFT L' },
  'taste.ShiftRight': { de: 'SHIFT R', en: 'SHIFT R' },
  'taste.ControlLeft': { de: 'CTRL L', en: 'CTRL L' },
  'taste.ControlRight': { de: 'CTRL R', en: 'CTRL R' },
  'taste.AltLeft': { de: 'ALT L', en: 'ALT L' },
  'taste.AltRight': { de: 'ALT GR', en: 'ALT R' },
  'taste.unbekannt': { de: '?', en: '?' },

  // --- Gamepad-Knöpfe (Standard-Belegung Xbox / PlayStation) ---
  'pad.0': { de: 'A / KREUZ', en: 'A / CROSS' },
  'pad.1': { de: 'B / KREIS', en: 'B / CIRCLE' },
  'pad.2': { de: 'X / QUADRAT', en: 'X / SQUARE' },
  'pad.3': { de: 'Y / DREIECK', en: 'Y / TRIANGLE' },
  'pad.6': { de: 'LT / L2', en: 'LT / L2' },
  'pad.7': { de: 'RT / R2', en: 'RT / R2' },
  'pad.8': { de: 'BACK / SHARE', en: 'BACK / SHARE' },
  'pad.9': { de: 'START', en: 'START' },
  'pad.stickLinks': { de: 'LINKER STICK', en: 'LEFT STICK' },
  'pad.keiner': { de: '-', en: '-' },

  // --- Steuerung (Hilfe-Seite) ---
  'steuerung.titel': { de: 'STEUERUNG', en: 'CONTROLS' },
  'steuerung.tastatur': { de: 'TASTATUR', en: 'KEYBOARD' },
  'steuerung.gamepad': { de: 'GAMEPAD', en: 'GAMEPAD' },
  'steuerung.symbole': { de: 'PACE-NOTES-SYMBOLE', en: 'PACE NOTE SYMBOLS' },
  'symbole.titel': { de: 'PACE-NOTES-SYMBOLE', en: 'PACE NOTE SYMBOLS' },
  'symbole.farben': { de: 'ROT = STUFE 1-2, GELB = 3-4, GRÜN = 5-6', en: 'RED = GRADE 1-2, YELLOW = 3-4, GREEN = 5-6' },
  'legende.kurve56': { de: 'SANFTE KURVE, STUFE 5-6 (6 = VOLLGAS)', en: 'EASY CURVE, GRADE 5-6 (6 = FLAT OUT)' },
  'legende.kurve34': { de: 'KURVE, STUFE 3-4', en: 'CURVE, GRADE 3-4' },
  'legende.kurve12': { de: 'ENGE KURVE, STUFE 1-2', en: 'TIGHT CURVE, GRADE 1-2' },
  'legende.kehre': { de: 'KEHRE, NUMMER IN DER FOLGE (1/4)', en: 'HAIRPIN, NUMBER IN THE SERIES (1/4)' },
  'legende.schikane': { de: 'SCHIKANE (RICHTUNG = ERSTE KURVE)', en: 'CHICANE (DIRECTION = FIRST CURVE)' },
  'legende.kuppe': { de: 'KUPPE: DAHINTER SIEHT MAN NICHTS', en: 'CREST: YOU CANNOT SEE BEYOND' },
  'legende.abzweig': { de: 'ABZWEIG: GERADEAUS IST GESPERRT', en: 'TURN-OFF: STRAIGHT ON IS CLOSED' },
  'legende.einmuendung': { de: 'EINMÜNDUNG: DIE ANDERE SEITE IST ZU', en: 'T-JUNCTION: THE OTHER WAY IS CLOSED' },
  'legende.ziel': { de: 'ZIEL', en: 'FINISH' },
  'legende.schneiden': { de: 'GRÜNER PFEIL: SCHNEIDEN LOHNT SICH', en: 'GREEN ARROW: CUTTING PAYS OFF' },
  'legende.nichtSchneiden': { de: 'ROTES X: NICHT SCHNEIDEN (HINDERNIS)', en: 'RED X: DO NOT CUT (OBSTACLES)' },
  'legende.eng': { de: 'MINUS: ENGER ALS DIE STUFE', en: 'MINUS: TIGHTER THAN THE GRADE' },
  'legende.weit': { de: 'PLUS: WEITER ALS DIE STUFE', en: 'PLUS: WIDER THAN THE GRADE' },
  'legende.lang': { de: 'MASS-STRICH: LANGE KURVE', en: 'BAR: LONG CURVE' },
  'legende.oeffnet': { de: '<: KURVE GEHT AUF', en: '<: CURVE OPENS UP' },
  'legende.ziehtZu': { de: '>: KURVE ZIEHT ZU', en: '>: CURVE TIGHTENS' },
  'legende.schotter': { de: 'KÖRNER: ABZWEIG AUF SCHOTTER', en: 'GRAINS: TURN-OFF ONTO GRAVEL' },
  'legende.wiesenweg': { de: 'GRAS: ABZWEIG AUF WIESENWEG', en: 'GRASS: TURN-OFF ONTO MEADOW TRACK' },

  // --- Credits ---
  'credits.titel': { de: 'CREDITS', en: 'CREDITS' },
  'credits.version': { de: 'VERSION {v}', en: 'VERSION {v}' },
  'credits.idee': { de: 'IDEE UND DESIGN: LINO', en: 'IDEA AND DESIGN: LINO' },
  'credits.gebaut': { de: 'GEBAUT MIT CLAUDE', en: 'BUILT WITH CLAUDE' },
  'credits.erfunden': { de: 'ALLE AUTOS, NAMEN UND ORTE SIND ERFUNDEN.', en: 'ALL CARS, NAMES AND PLACES ARE FICTIONAL.' },
  // M5a.1: Überschriften der Namenslisten (die Namen selbst stehen in config.js, menue.credits)
  'credits.mitwirkende': { de: 'MITWIRKENDE', en: 'CONTRIBUTORS' },
  'credits.unterstuetzer': { de: 'UNTERSTÜTZER', en: 'SUPPORTERS' },

  // --- Pause und Rückfrage ---
  'pause.titel': { de: 'PAUSE', en: 'PAUSE' },
  'pause.weiter': { de: 'WEITER', en: 'CONTINUE' },
  'pause.neustart': { de: 'NEUSTART DER ETAPPE', en: 'RESTART STAGE' },
  'pause.einstellungen': { de: 'EINSTELLUNGEN', en: 'SETTINGS' },
  'pause.hauptmenue': { de: 'ZUM HAUPTMENÜ', en: 'TO MAIN MENU' },
  'frage.titel': { de: 'SICHER?', en: 'ARE YOU SURE?' },
  'frage.text': { de: 'DIE FAHRT WIRD ABGEBROCHEN.', en: 'THE CURRENT RUN WILL BE LOST.' },
  'frage.ja': { de: 'JA', en: 'YES' },
  'frage.nein': { de: 'NEIN', en: 'NO' },
  'frage.loeschen': { de: 'ALLE BESTZEITEN WERDEN GELÖSCHT.', en: 'ALL BEST TIMES WILL BE DELETED.' },

  // --- Zielbildschirm (M5b) ---
  'ziel.titel': { de: 'ZIEL!', en: 'FINISH!' },
  'ziel.neueBestzeit': { de: 'NEUE BESTZEIT!', en: 'NEW BEST TIME!' },
  'ziel.platz': { de: 'PLATZ {p} VON {n}', en: 'RANK {p} OF {n}' },
  'ziel.ersteZeit': { de: 'ERSTE ZEIT', en: 'FIRST TIME' },
  'ziel.cp': { de: 'CP {n}', en: 'CP {n}' },
  'ziel.aufpralle': { de: 'AUFPRÄLLE', en: 'IMPACTS' },
  'ziel.resets': { de: 'RESETS', en: 'RESETS' },
  'ziel.hoechstTempo': { de: 'HÖCHSTTEMPO', en: 'TOP SPEED' },
  'ziel.neuStarten': { de: 'NEU STARTEN', en: 'RESTART' },
  'ziel.hauptmenue': { de: 'HAUPTMENÜ', en: 'MAIN MENU' },
  'ziel.nichtGespeichert': { de: 'ZEIT WIRD NICHT GESPEICHERT', en: 'TIME IS NOT SAVED' },

  // --- HUD (im Rennen) ---
  'hud.zeit': { de: 'ZEIT', en: 'TIME' },
  'tacho.drehzahl': { de: 'X1000', en: 'X1000' },
  'hud.cp': { de: 'CP {n}  {zeit}', en: 'CP {n}  {zeit}' },
  'hud.cpVerpasst': { de: 'CHECKPOINT VERPASST', en: 'CHECKPOINT MISSED' },
  'hud.ansagenAn': { de: 'ANSAGEN AN', en: 'PACE NOTES ON' },
  'hud.ansagenAus': { de: 'ANSAGEN AUS', en: 'PACE NOTES OFF' },
  'hud.ziel': { de: 'ZIEL!', en: 'FINISH!' },
  // M6: Live-Vergleich (kleines Etikett vor der Zahl) und Taste H
  'hud.vergleichBest': { de: 'BEST', en: 'BEST' },
  'hud.vergleichLetzter': { de: 'LETZT', en: 'LAST' },
  'hud.hudAus': { de: 'HUD AUS', en: 'HUD OFF' },
  'hud.hudAn': { de: 'HUD AN', en: 'HUD ON' },
  'hud.hilfeFahren': { de: '{tasten}: FAHREN', en: '{tasten}: DRIVE' },
  'hud.hilfeHandbremse': { de: '{taste}: HANDBREMSE', en: '{taste}: HANDBRAKE' },
  'hud.hilfeZurueck': { de: '{taste}: AUF STRASSE  F3: DEBUG', en: '{taste}: BACK ON ROAD  F3: DEBUG' },
  'hud.hilfeNotes': { de: '{taste}: ANSAGEN  ESC: PAUSE', en: '{taste}: PACE NOTES  ESC: PAUSE' },

  // --- Debug-Anzeige (F3) ---
  'debug.fps': { de: 'FPS {n}', en: 'FPS {n}' },
  'debug.meter': { de: 'METER {a} / {b}', en: 'METRE {a} / {b}' },
  'debug.tempo': { de: 'TEMPO {v} {einheit}', en: 'SPEED {v} {einheit}' },
  'debug.gang': { de: 'GANG {g} U/MIN {d}', en: 'GEAR {g} RPM {d}' },
  'debug.drift': { de: 'DRIFT {d}°', en: 'DRIFT {d}°' },
  'debug.untergrund': { de: 'UNTERGRUND {u}', en: 'SURFACE {u}' },
  'debug.hindernisse': { de: 'HINDERNISSE {n}', en: 'OBSTACLES {n}' },
  'debug.naechsterCp': { de: 'NÄCHSTER CP {n} IN {m} M', en: 'NEXT CP {n} IN {m} M' },
  'debug.zielIn': { de: 'ZIEL IN {m} M', en: 'FINISH IN {m} M' },
  'debug.aufprall': { de: 'AUFPRALL {a} -> {b} {einheit}', en: 'IMPACT {a} -> {b} {einheit}' },
  'debug.aufprallKein': { de: 'AUFPRALL -', en: 'IMPACT -' },
  'debug.ansagen': { de: 'ANSAGEN {an} (TASTE {taste})', en: 'PACE NOTES {an} (KEY {taste})' },
  'untergrund.asphalt': { de: 'ASPHALT', en: 'TARMAC' },
  'untergrund.bankett': { de: 'BANKETT', en: 'VERGE' },
  'untergrund.gras': { de: 'GRAS', en: 'GRASS' },
  'untergrund.schotter': { de: 'SCHOTTER', en: 'GRAVEL' },
  'untergrund.wiesenweg': { de: 'WIESENWEG', en: 'MEADOW TRACK' },
};

export const SPRACHEN = ['de', 'en'];
let sprache = 'de';
const beobachter = [];

export function aktuelleSprache() { return sprache; }

// Sprache wechseln ('de' oder 'en'); alle, die zuhören, zeichnen neu
export function setzeSprache(s) {
  if (!SPRACHEN.includes(s) || s === sprache) return;
  sprache = s;
  for (const f of beobachter) f(s);
}
export function beiSprachwechsel(f) { beobachter.push(f); }

// Text holen. p = Platzhalter, z. B. t('hud.cp', { n: 1, zeit: '00:12.34' })
export function t(schluessel, p) {
  const e = TEXTE[schluessel];
  const s = e ? (e[sprache] || e.de) : schluessel;
  if (!p) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (p[k] != null ? String(p[k]) : m));
}
