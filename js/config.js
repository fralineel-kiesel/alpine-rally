// =====================================================================
// Alpine Rally – alle Stellschrauben an einem Ort.
// Einheiten: Meter, Sekunden, m/s (1 m/s = 3.6 km/h), Grad wo angegeben.
// =====================================================================

// Versionsnummer (Credits im Menü)
export const VERSION = '0.7a';

export const CONFIG = {
  // --- Bild / Pixel-Look -------------------------------------------
  bild: {
    breite: 320,               // interne Renderbreite in Pixeln
    hoehe: 180,                // interne Renderhöhe in Pixeln (16:9)
    ganzzahligSkalieren: false // true = nur ganze Vielfache (schärfer, aber evtl. grössere schwarze Ränder)
  },

  // --- Farben (Palette) -----------------------------------------------
  farben: {
    himmelOben: '#2d6fd2',     // klares Blau im Zenit
    dunst: '#aabdc8',          // Blaugrau am Horizont (= Nebelfarbe, auch für Gelände und Bergfüsse)
    gras: '#4e9a2c',           // sattes Gras
    grasDunkel: '#3b7d22',     // dunklere Grasflecken
    fels: '#7f7b74',           // Steingrau (steile Hänge, Felswand)
    felsDunkel: '#5f5b55',     // dunkler Fels
    erde: '#7a6446',           // Erde an steilen, nicht ganz felsigen Stellen
    bankett: '#8b6e4a',        // Schotterbraun neben der Strasse
    asphalt: '#56585b',        // Strassenbelag
    mittellinie: '#c9c9bd',    // dezente Mittellinie
    schotter: '#ada48f',       // Schotter-Nebenweg: helles Graubeige (seit M3a)
    schotterSpur: '#968d7a',   // ... festgefahrene Fahrspuren, etwas dunkler
    wiesenweg: '#7c6243',      // Wiesenweg (M3b): erdbraun ...
    wiesenwegSpur: '#6a523a',  // ... die zwei festgefahrenen Fahrspuren, dunkler
    wiesenwegGras: '#4e9a2c',  // ... Gras in der Mitte und am Rand (wie farben.gras)
    bergFels: '#596070',         // Hintergrundberge, Fels
    bergFuss: '#3f6a30',       // Hintergrundberge, bewaldeter Fuss (passt zum fernen Gelände)
    schnee: '#f2f5fa',         // Schneekappen
    autoLack: '#f1f1ec',       // Auto: weiss
    autoStreifen: '#c8202c',   // Auto: der eine farbige Streifen
    autoScheiben: '#22303c',   // Auto: Fenster
    autoSchwarz: '#1c1c1e',    // Auto: Stossstangen, Reifen
  },

  // --- Licht ----------------------------------------------------------
  licht: {
    sonneStaerke: 2.2,         // Helligkeit der Sonne
    sonneFarbe: '#fff3df',     // leicht warmes Sonnenlicht
    sonneRichtung: [0.5, 0.9, 0.35], // woher die Sonne scheint (x, y, z)
    umgebungStaerke: 1.15,     // Grundhelligkeit (Schattenseiten)
    umgebungFarbe: '#c9d6ec',  // leicht bläuliches Umgebungslicht
  },

  // --- Nebel / Dunst --------------------------------------------------
  nebel: {
    start: 120,                // ab hier beginnt der Dunst (Meter)
    ende: 3000,                // hier ist der Dunst am dichtesten (Meter)
    maxDichte: 0.45,           // so dicht wird der Dunst höchstens (0..1). Nur leichte Tiefenwirkung:
                               // je höher, desto eher entsteht wieder ein milchiger Dunststreifen
    bergDunst: 0.15,           // Hintergrundberge: so viel Dunst liegt auf den Gipfeln (0..1)
    bergDunstUnten: 0.3,       // ... und so viel kommt zum Bergfuss hin dazu. Fuss = beide zusammen,
                               // sollte etwa maxDichte sein, dann passt der Fuss zum fernen Gelände
  },

  // --- Strasse --------------------------------------------------------
  strasse: {
    breite: 7,                 // Asphaltbreite
    bankett: 2,                // Breite des erdigen Randstreifens je Seite
    abstandMittellinie: 8,     // Strich + Lücke der Mittellinie zusammen (Meter)
    mittellinieStrich: 3,      // davon ist so viel Strich (Meter)
    mittellinieBreite: 0.2,    // Breite der Mittellinie (Meter)
    mittellinieMinPixel: 1,    // in der Ferne mind. so viele Bildpunkte breit (gegen Flimmern)
    startBeiMeter: 25,         // Startlinie: so viele Meter nach Strassenanfang
    zielVorEnde: 45,           // Ziellinie: so viele Meter vor Strassenende
    spawnBeiMeter: 10,         // hier steht das Auto beim Start
  },

  // --- Beläge (Meilenstein 3a) ------------------------------------------
  // Breite der Fahrbahn je Belag. Das Bankett (strasse.bankett) kommt auf beiden Seiten dazu.
  belaege: {
    asphalt: { breite: 7, mittellinie: true },     // wie bisher
    schotter: { breite: 6.2, mittellinie: false }, // Schotter-Nebenweg: etwas schmaler, kein Mittelstrich
    wiesenweg: { breite: 5.2, mittellinie: false, grasRand: true }, // M3b: Feldweg über die Wiese, schmaler; Rand grasig statt Erde
  },

  // --- Nebenwege (Meilenstein 3a) ---------------------------------------
  // Die Etappe biegt von der Hauptstrasse auf einen Nebenweg ab und mündet später wieder ein.
  // Die Hauptstrasse läuft an beiden Stellen als Stummel weiter (abgesperrt, Ende versteckt).
  // Die Stützpunkte des Nebenwegs stehen in js/track.js (gerechnet mit tools/nebenweg-bogen.mjs).
  // Weiterer Nebenweg: neuer Eintrag hier + Stützpunkte (Anleitung in STAND.md, Meilenstein 3b).
  nebenwege: [
    {
      name: 'Talschleife',
      abzweig: 800,            // hier verlässt die Etappe die Hauptstrasse (Streckenmeter, Anfang der Abbiege-Kurve)
      einmuendung: 1020.5,     // hier ist sie wieder auf der Hauptstrasse (Ende der Einmündungs-Kurve)
      belag: 'schotter',       // Belag dazwischen
      sperreAbzweig: 'band',   // Absperrung auf dem Stummel: 'band', 'reifen', 'heu', 'zaun' (leer = reihum)
      sperreEinmuendung: 'reifen',
      // Form der Stummel (fehlt etwas, gilt der Wert aus "stummel" unten)
      stummelAbzweig: { kurve: -75, radius: 50, seitenschutz: 'zaun' },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'planke' },
    },
    {
      // M3b: nach den Kehren, ca. 415 m: biegt nach rechts ab (Talseite), lange Gerade über die Alp, kommt von links
      // (Bergseite) zurück. Die Felswand hört davor auf und beginnt danach wieder.
      name: 'Almweg',
      abzweig: 1985.6,         // Werte laut tools/nebenweg-bogen.mjs (Ausgabe "Streckenmeter")
      einmuendung: 2400.8,
      belag: 'schotter',
      // Absperrungen ohne Angabe: reihum (absperrung.reihenfolge), hier Strohballen (heu) und Holzböcke (zaun)
      // Waldrand (M3b, sonst wie nebenwegWald): Alp und Wiese, nur lockere Gruppen mit viel Wiese dazwischen.
      // Dichter nur, wo man sonst abkürzen könnte (geprüft mit tools/nebenweg-wald.mjs)
      wald: {
        innenAbKruemmung: 1 / 130, // auch die weiten Kurven (Radius bis 130 m) haben eine dichte Innenseite
        innen: { abstand: [6.2, 6.9], gruppe: [3, 6], schritt: [1.7, 2.3], luecke: [0.5, 1.1], zweiteReihe: 0.35, zweiteAbstand: [9, 12] },
        aussen: { abstand: [8, 15], gruppe: [1, 3], schritt: [2, 3.5], luecke: [16, 38], zweiteReihe: 0.15, zweiteAbstand: [11, 16] },
      },
      // Kreuzungen mit flacherem Winkel (40-45°) als bei der Talschleife: Etappe und Stummel liegen länger
      // übereinander, darum liegt der Stummel länger genau auf der Höhe der Etappe (hoeheAngleichen)
      stummelAbzweig: { kurve: -70, radius: 50, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
    },
    {
      // M3b: auf der Abfahrt, nach rechts über die Wiese (Feldweg), ca. 310 m. Checkpoint 3 liegt darauf.
      name: 'Wiesenweg',
      abzweig: 2797.7,
      einmuendung: 3107.9,
      belag: 'wiesenweg',
      // Absperrungen ohne Angabe: reihum (absperrung.reihenfolge), hier Flatterband (band) und Reifen
      // Waldrand (M3b, sonst wie nebenwegWald): Alp und Wiese, nur lockere Gruppen mit viel Wiese dazwischen.
      // Dichter nur, wo man sonst abkürzen könnte (geprüft mit tools/nebenweg-wald.mjs)
      wald: {
        innenAbKruemmung: 1 / 130, // auch die weiten Kurven (Radius bis 130 m) haben eine dichte Innenseite
        innen: { abstand: [6.2, 6.9], gruppe: [3, 6], schritt: [1.7, 2.3], luecke: [0.5, 1.1], zweiteReihe: 0.35, zweiteAbstand: [9, 12] },
        aussen: { abstand: [8, 15], gruppe: [1, 3], schritt: [2, 3.5], luecke: [16, 38], zweiteReihe: 0.15, zweiteAbstand: [11, 16] },
        steinAnteil: 0.3,          // Wiese: mehr Felsbrocken statt Tannen
      },
      // Kreuzungen mit flachem Winkel (36°): Stummel länger auf der Höhe der Etappe (siehe Almweg)
      stummelAbzweig: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [32, 54] },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [32, 54] },
    },
  ],
  // Standardform eines Stummels (Hauptstrasse, die hinter der Absperrung weiterläuft)
  stummel: {
    gerade: 34,                // erst so weit geradeaus (Meter ab Abzweig/Einmündung)
    kurve: -70,                // dann eine Kurve (Grad, - = links, + = rechts) ...
    radius: 55,                // ... mit diesem Radius (Meter)
    rest: 55,                  // danach noch so weit geradeaus, dann hört der Stummel (versteckt) auf
    kuppe: 1.6,                // der Stummel steigt bis zur Kurvenmitte um so viele Meter an ...
    abfall: 0.07,              // ... und fällt danach so steil ab (0.07 = 7 %): das Ende liegt hinter der Kuppe
    hoeheAngleichen: [12, 30], // M3a.1: bis 12 m genau auf Höhe der Etappe (keine Stufe an der Kreuzung), bis 30 m weich zur eigenen Höhe
    seitenschutz: 'planke',    // links und rechts hinter der Absperrung: 'planke' (Leitplanke) oder 'zaun' (Holzzaun)
    schutzBisAbstand: 52,      // Seitenschutz läuft, bis er so weit von der Etappe weg ist (grenze.maxAbstand + Reserve)
    sichtschutz: 14,           // so viele Tannen stehen dicht quer vor dem Stummel-Ende (Sichtschutz)
    sichtschutzSeed: 3301,     // Zufallszahl für den Sichtschutz
  },
  // Waldrand am Nebenweg (M3a, seit M3a.1 locker; js/sprites.js): Tannen in Gruppen mit Lücken,
  // ein paar Felsbrocken, dazwischen Wiese. Dicht nur auf der Innenseite der Kurven (nur dort kann man
  // abkürzen). Nach einer Änderung prüfen: node tools/nebenweg-wald.mjs (Abkürzen nicht schneller als
  // die Strasse) und node tools/abkuerzungen.mjs --pruefen.
  nebenwegWald: {
    an: true,
    seed: 6060,                // Zufallszahl
    vor: 42,                   // so viele Meter vor dem Abzweig beginnt der Waldrand ...
    nach: 72,                  // ... und so viele nach der Einmündung hört er auf
    innenAbKruemmung: 1 / 90,  // ab dieser Krümmung (1/Radius) gilt eine Seite als Kurven-Innenseite ...
    innenVorNach: 18,          // ... auch so viele Meter vor und nach der Kurve
    // Kurven-Innenseite: dichte Gruppen, kleine Lücken (kleiner als das Auto), versetzte zweite Reihe
    innen: { abstand: [6.2, 6.9], gruppe: [3, 6], schritt: [1.7, 2.3], luecke: [0.5, 1.1], zweiteReihe: 0.35, zweiteAbstand: [9, 12] },
    // Aussenseite und Geraden: lockere Gruppen, grosse Lücken (Wiese), nur fürs Auge
    aussen: { abstand: [6.8, 10], gruppe: [1, 4], schritt: [1.8, 3], luecke: [7, 20], zweiteReihe: 0.3, zweiteAbstand: [10, 14] },
    steinAnteil: 0.1,          // so ein Anteil wird statt einer Tanne ein Felsbrocken
    // von Hand gesetzte Gruppen (Tannen und Felsen gemischt): s = Streckenmeter (Mitte), seite -1 links / +1 rechts
    // 766 links: vor dem Abzweig, schliesst wie in M3a die Linien aus der freien Kurve 482-752 bis an den Abzweig
    gruppen: [
      { s: 766, seite: -1, abstand: [7, 10.5], laenge: 12, anzahl: 6, steine: 0.4 },
      // M3b: Almweg, Innenseite der grossen Linkskurve (dort blieb eine Lücke für eine Abkürzungs-Linie)
      { s: 2075, seite: -1, abstand: [9, 22], laenge: 30, anzahl: 10, steine: 0.3 },
      // M3b: Wiesenweg, kleines Wäldchen in der Ecke rechts vom Abzweig: Die Kreuzung ist flach (36°),
      // quer über die Wiese sparte man dort sonst bis 8.7 m (1.7 s)
      { s: 2765, seite: 1, abstand: [7, 22], laenge: 34, anzahl: 18, steine: 0.25 },
      { s: 2812, seite: 1, abstand: [7, 18], laenge: 30, anzahl: 14, steine: 0.25 },
    ],
    steinHoehe: [0.9, 1.6],    // Höhe der Felsbrocken (Meter)
    hoehe: [4.5, 11],          // Höhe der Tannen (vorne eher junge, kleine)
    stummelFrei: 7,            // so viel Platz bleibt um die Mitte der Stummel (Asphalt, Bankett, Seitenschutz)
    checkpointFrei: 2.5,       // so viele Meter vor/nach einem Checkpoint-Tor kein Baum (Pfosten; M3a.1: 4 -> 2.5)
  },

  // Absperrungen auf den Stummeln (js/absperrungen.js). Kollision hart wie ein Zaun.
  absperrung: {
    reihenfolge: ['band', 'reifen', 'heu', 'zaun'], // ohne Angabe beim Nebenweg: reihum, nie zweimal dieselbe hintereinander
    abstandWeg: 0.5,           // M3a.1: Leitwand steht so weit (Meter) neben dem Bankett der Etappe (Kurven-Aussenseite)
    kreisRadius: 0.32,         // Kollision: Kreise entlang der Leitwand ...
    kreisAbstand: 0.5,         // ... alle so viele Meter
    seed: 4711,                // Zufallszahl (Höhe der Reifenstapel, schiefe Böcke ...)
    sichtweite: 350,           // M3b: Absperrungen der weiteren Nebenwege weiter weg als das nicht zeichnen (dort unter 1 Pixel)
    // Grössen seit M3a.1 deutlich grösser (aus 60-80 m erkennbar)
    band: { pfostenAbstand: 2.6, hoehe: 1.5, hoehen: [1.38, 0.9], durchhang: 0.06 },      // Warnstangen (Abstand, Höhe), zwei Bänder, Durchhang
    reifen: { radius: 0.36, hoehe: 0.26, lagen: [5, 5], lagenHinten: [4, 5], weissAnteil: 0.3, hell: 1.7, seiten: 8 }, // Altreifen: vorne 5 hoch (1.3 m), hinten versetzt; Ecken pro Reifen
    heu: { laenge: 1.2, tiefe: 1.1, hoehe: 0.82, obenAnteil: 0.8 },                    // Strohballen (M3b: flacher, zwei Lagen = ca. 1.6 m statt 2.4 m); Anteil mit zweiter Lage
    zaun: { bockBreite: 2.6, hoehe: 1.3, schief: 4 },                                  // Holzböcke: Breite, Höhe, bis so viel Grad schief
    symbol: { durchmesser: 1.4, ueber: 0.15 },                                         // Verbots-Symbol (rotes Rund, weisser Balken): Grösse, so hoch über der Absperrung
    chevron: { abstand: 3.4, breite: 0.8, hoehe: 1.0, zumFahrer: 1.0 },               // rot-weisse Chevrons auf der Leitwand: Abstand, Grösse, wie stark zum anfahrenden Fahrer gedreht (0 = zur Kurvenmitte)
    richtungstafel: { an: true, vorher: 70, breite: 2.6, hoehe: 1.1, unten: 1.0, abstand: 1.0 }, // grosse Tafel so viele Meter vor der Kreuzung (Kurven-Aussenseite)
  },
  // Kreuzungen: Einfahrt in den Nebenweg
  kreuzung: {
    eckRadius: 7,              // abgerundete Ecke zwischen Hauptstrasse und Nebenweg (Meter)
    eckEinzug: 0.45,           // die Ecke greift so weit über den Rand des Nebenwegs (deckt dessen Erdpixel zu)
    fransen: 0.4,              // Asphalt franst so weit (Meter) in den Schotter aus (M3a.1: 0.7 -> 0.4, sauberer)
    schotterStreifen: 8,       // Schotterband quer in so viele Streifen geteilt (damit es unter dem Asphalt bleibt)
    unterAsphalt: 0.08,        // so viel (Meter) liegt der Schotter unter dem Asphalt, wo sich beide überlappen
  },

  // --- Start- und Zielbereich (Meilenstein 3c, js/startziel.js) ----------
  // Hinter dem Strassenanfang und hinter dem Strassenende läuft die Strasse weiter (Nebenast wie die
  // Stummel: Rennlogik, Zeit, Checkpoints und "R" kennen ihn nicht), ist abgesperrt und verschwindet
  // hinter Kurve und Kuppe. Dazu Bögen, Absperrband, Strohballen, Zuschauer, Zelte, Autos, Bäume.
  // Alle Mengen fest gewürfelt (seed): gleiche Zahl = gleicher Aufbau. Nach Änderungen an der Form
  // der Verlängerungen prüfen: node tools/stummel-sicht.mjs (Ende darf man nie sehen).
  startZiel: {
    an: true,                  // false = alles wie vor M3c (Strasse hört an Start und Ziel auf)
    seed: 3030,                // Zufallszahl für Zuschauer, Strohballen, Bäume
    zielBremse: 0.6,           // nach dem Ziel bremst das Auto von selbst so stark (0..1; bis M3c 0.35). Aus 180 km/h
                               // steht es so nach ca. 130 m (Ausrollstrecke bis zur Absperrung: ca. 200 m)
    // Verlängerung hinter dem Start (Richtung Strassenanfang, hinter dem Auto)
    start: {
      form: { gerade: 80, kurve: 75, radius: 45, rest: 50, kuppe: 1.8, abfall: 0.08, seitenschutz: 'zaun', sichtschutz: 16, sichtschutzSeed: 3401 },
      sperreBei: 34,           // Absperrung so viele Meter hinter dem Strassenanfang (Auto steht 10 m davor)
      sperreBogen: 1.6,        // ... Mitte der Absperrung so viel weiter hinten als die Enden (gebogen)
      sperreUeber: 0.3,        // ... reicht so weit über das Bankett hinaus (dort beginnt der Seitenschutz)
      sperreArt: 'heu',        // 'band', 'reifen', 'heu', 'zaun' (wie bei den Nebenwegen)
    },
    // Verlängerung hinter dem Ziel: Ausrollstrecke, dann Absperrung, Kurve, versteckt
    ziel: {
      form: { gerade: 175, kurve: -80, radius: 50, rest: 55, kuppe: 2.4, abfall: 0.09, seitenschutz: 'zaun', sichtschutz: 18, sichtschutzSeed: 3402 },
      sperreBei: 155,          // Absperrung so viele Meter nach dem Strassenende (Ziellinie 45 m davor: ca. 200 m Ausrollen)
      sperreBogen: 2.0,
      sperreUeber: 0.3,
      sperreArt: 'reifen',
    },
    bereich: { vor: 70, nach: 70 }, // Absperrband und Zuschauer so viele Meter vor und nach der Linie (Start: ab der Absperrung)
    sichtweite: 650,           // weiter weg von der Kamera wird der Aufbau nicht gezeichnet (unter 1 Pixel)
    // Bögen über Start- und Ziellinie (Alu-Gerüst). Pfosten ausserhalb von Band und Zaun, Banner hoch über Auto und Kamera
    bogen: { hoehe: 6.6, dicke: 0.5, pfosten: 7.4, bannerBreite: 8.6 }, // Höhe Oberkante, Dicke Gerüst, Pfosten so weit neben der Mitte, Breite Banner (Unterkante ca. 4.1 m)
    // Absperrband an rot-weissen Stangen, nur wo kein Weidezaun steht (Zäune bleiben, Tore werden mit Stroh zu)
    band: { abstand: 6.3, pfostenAbstand: 3, hoehe: 1.05, baender: [0.95, 0.55], durchhang: 0.05 },
    stroh: { abstand: 5.95, alle: [11, 19], ballen: [0.95, 0.48, 0.42], obenAnteil: 0.5 }, // Kleinballen vor Band/Zaun: Abstand zur Mitte, alle so viele Meter, Grösse (L, T, H)
    bande: { abstand: 6.75, alle: [18, 30] },  // Werbebanden hinter dem Band (erfundene Sponsoren)
    fahne: { hoehe: 6, breite: 1.5, hoehe2: 1.0, // Fahnenmasten: Höhe, Grösse der Fahne
      plaetze: [[2, -8.8, 'kreuz'], [-4, 9.2, 'karo'], [-24, 9.6, 'farbe'], [28, -9.2, 'kreuz'], [44, 9.6, 'farbe']] }, // [Meter ab Linie, seitlich, Art]
    // Plätze (Meter ab der Linie, seitlich: + rechts / - links in Fahrtrichtung)
    platz: {
      uhr: 7.2,                // Startuhr (rechts, kurz vor der Startlinie)
      zeitzelt: 10.8,          // Zeitnahme-Zelt am Start (rechts)
      servicezelt: 11.5,       // Servicezelt hinter der Absperrung am Start (rechts), davor der Transporter auf der Strasse
      container: -11.6,        // Zeitnahme-Container am Ziel (links)
      zielzelt: 10.8,          // Zelt am Ziel (rechts, vor der Linie)
      autoStart: [33, 19, 35], // parkiertes Auto am Start: Meter, seitlich, Drehung (Grad)
      autoZiel: [36, 20, -25], // ... am Ziel
      beachflags: [[-3, 7.7], [3, -7.7], [-8, -7.8]],
    },
    autoFarben: ['#2f5fb0', '#e0b020'],
    // Zuschauer (Pixel-Figuren, schauen zur Strasse): hinter Band und Zaun, nie näher als abstand[0] an einer Strassenmitte
    zuschauer: {
      start: 50, ziel: 46,      // so viele (ungefähr; passen nicht alle hin, sind es weniger)
      abstand: [7.4, 13],       // so weit neben der Strassenmitte (vorne dichter)
      gruppe: [3, 8],           // Grösse der Gruppen
      gruppeLaenge: 7,          // eine Gruppe steht über so viele Meter verteilt
      radius: 0.35,             // Kollision (hart wie ein Baum) und Platzbedarf
      dicht: 0.75,              // so nah stehen zwei Zuschauer höchstens (Mitte zu Mitte)
      blickStreuung: 0.7,       // Blick zur Strasse, so viel (Bogenmass) zufällig daneben
      posen: [0.22, 0.16, 0.12, 0.1, 0.1, 0.18, 0.12], // Anteil: stehend, winkend, jubelnd, Schweizer Fahne, Fotograf, Mütze, Fahne einfarbig
      kinder: 0.12,             // so ein Anteil sind Kinder (kleiner)
      groesse: [1.6, 1.88],     // Grösse der Erwachsenen (Meter)
      winken: [1.5, 3],         // Winken und Fahnen: so oft pro Sekunde wechselt das Bild
      jacken: ['#d23b2c', '#2b5fc2', '#f0c020', '#2f9a48', '#ef7d22', '#8a3fb5', '#f2f0e8', '#1f9aa0', '#c43a7a', '#3a3f48'],
      hosen: ['#2a3550', '#26262a', '#5a5f66', '#5b4632', '#3d5a8a'],
      muetzen: ['#d0202a', '#f2f0e8', '#f0c020', '#2b5fc2', '#2f9a48', '#ef7d22'],
      haare: ['#3b2a1c', '#1c1714', '#c9a24a', '#7a3b1e', '#9a9a9a'],
      fahnenRot: '#d0202a',     // die meisten Fahnen sind rot (Schweizer Kreuz)
    },
    // Bäume und Büsche: Übergang zur Landschaft. gruppen: bereich, seite, Meter ab der Linie (von, bis), seitlich (von, bis), Anzahl Gruppen
    landschaft: {
      gruppen: [
        { bereich: 'start', seite: 1, m: [-90, 120], lat: [22, 70], anzahl: 8 },
        { bereich: 'start', seite: -1, m: [-110, -30], lat: [16, 60], anzahl: 5 },
        { bereich: 'start', seite: -1, m: [-230, -110], lat: [12, 50], anzahl: 6 },
        { bereich: 'start', seite: 1, m: [-230, -110], lat: [12, 50], anzahl: 6 },
        { bereich: 'ziel', seite: 1, m: [-90, 120], lat: [24, 70], anzahl: 8 },
        { bereich: 'ziel', seite: -1, m: [-90, 120], lat: [22, 70], anzahl: 7 },
        { bereich: 'ziel', seite: 1, m: [80, 190], lat: [14, 40], anzahl: 4 },   // entlang der Ausrollstrecke
        { bereich: 'ziel', seite: -1, m: [80, 190], lat: [14, 40], anzahl: 4 },
        { bereich: 'ziel', seite: 1, m: [190, 350], lat: [12, 50], anzahl: 8 },
        { bereich: 'ziel', seite: -1, m: [190, 350], lat: [12, 50], anzahl: 8 },
      ],
      proGruppe: [3, 7],        // Bäume pro Gruppe
      gruppeRadius: 7,          // ... so weit verstreut
      laubAnteil: 0.3,          // so ein Anteil Laubbäume (Rest Tannen)
      strasse: 11,              // Bäume mindestens so weit von jeder Strassenmitte
      buesche: 45,              // Büsche je Bereich (Versuche)
      buschLat: [8, 30],        // ... so weit neben der Strasse
    },
  },

  // --- Leben an der Strecke (Meilenstein 3d, js/leben.js) --------------
  // Wiesenweg als Alpweide (Zaun, Kühe, Alphütte, Heustadel, Brunnen, Steinmännchen, Wegweiser, Heurollen,
  // Findlinge), drei Fan-Spots und zwei Unfallautos (stehende Wracks). Alles hat eigene seeds: Bäume, Kühe,
  // Zäune und Schilder von vorher bleiben genau, wo sie sind. Orte: s = Streckenmeter, seite -1 links / +1
  // rechts (in Fahrtrichtung), lat = so weit neben der Strassenmitte (Meter), drehung in Grad.
  // Regeln (prüft tools/leben-test.mjs): nie näher als abstandStrasse an einer Strassenmitte (auch Stummel),
  // nie auf der Innenseite einer Kurve (Abkürzungs-Kurven plus Puffer, dazu jede engere Kurve der Etappe).
  leben: {
    an: true,                  // false = alles wie vor M3d
    seed: 3131,                // Zufallszahl für Fans, Stühle, Steine, Schäden (gleich = gleicher Aufbau)
    sichtweite: 600,           // weiter weg von der Kamera wird ein Ort nicht gezeichnet (unter 1 Pixel)
    abstandStrasse: 6.5,       // Hütten, Details, Wracks mindestens so weit neben jeder Strassenmitte
    pufferNichtSchneiden: 20,  // Innenseite der gesperrten Kurven (sVon–sBis plus so viel) bleibt frei
    pufferSchneiden: 50,       // ... und der freien Kurven
    innenRadius: 130,          // dazu jede Kurve enger als das (auch auf den Nebenwegen): Innenseite frei ...
    innenVorNach: 20,          // ... auch so viele Meter vor und nach der Kurve ...
    innenBreite: 60,           // ... bis so weit neben der Strasse

    // Holzzaun am Wiesenweg (dazu der Zaun von M2a rechts bei 2931–3068 m). Gebaut wie die anderen Zäune
    // (Abstand per randAbstand an die schmale Strasse angepasst), mit Weidetoren (Lücken wie in M2a)
    zaeune: [
      { seite: -1, von: 2888, bis: 2952, latten: 3, tore: [2905] },  // links nach Checkpoint 3: Weide mit der Herde von vorher; tore: Lücke ab diesem Meter (leer = reihum)
    ],
    zaunSeed: 3132,            // Zufall für Tore, Latten, schiefe Pfosten der neuen Zäune
    torAlle: [24, 40],         // ein Weidetor alle so viele Meter Zaun
    tor: [4, 5.5],             // Breite der Lücke (Meter)

    // Neue Kühe (eigene Herden mit eigenem seed; die alten Kühe sind in js/kuhfolge.js eingefroren)
    kuehe: {
      seed: 3133,
      herdenAbstand: 26,       // neue Herden mindestens so weit von jeder anderen Herde (Mitte zu Mitte)
      herden: [
        { s: 3008, seite: -1, lat: [13, 24], anzahl: 4, radius: 6 },   // vor der Alphütte
        { s: 2985, seite: 1, lat: [11, 18], anzahl: 3, radius: 5 },    // rechts hinter dem Zaun von M2a
        { s: 2862, seite: 1, lat: [26, 36], anzahl: 3, radius: 6 },    // rechts am Hang beim Abzweig
      ],
    },

    // Wiesenweg (2798–3108 m): Alphütte, Heustadel, Kleinigkeiten
    wiesenweg: {
      huette: { s: 2988, seite: -1, lat: 38, drehung: 12, laenge: 7.6, tiefe: 5.6, hoehe: 2.5 }, // Alphütte (laenge entlang der Strasse)
      stadel: { s: 2900, seite: 1, lat: 52, drehung: -18, laenge: 5.2, tiefe: 4.2, hoehe: 2.3 },  // kleiner Heustadel weiter weg
      brunnen: { s: 2979, seite: -1, lat: 31, drehung: 20 },       // Brunnentrog mit Röhre
      holzstapel: true,                                           // Holzstapel an der Hüttenwand
      wegweiser: { s: 2957, seite: -1, lat: 7.4 },                // gelber Wanderwegweiser (erfundene Ziele)
      steinmaennchen: [[2852, 1, 21], [2918, 1, 31], [3043, -1, 20]], // [s, seite, lat]
      heurollen: [[2866, 1, 19], [2869.5, 1, 22.2], [2862, 1, 23.5], [3057, -1, 25], [3062.5, -1, 28]],
      findlinge: [[2908, -1, 25, 2.0], [3000, 1, 13, 1.6], [2945, 1, 42, 2.6]], // [s, seite, lat, Höhe]
    },

    // Fan-Spots (Zuschauer wie in M3c: Pixel-Figuren, schauen zur Strasse, hinter dem Absperrband)
    fans: {
      abstand: 7.2,            // Zuschauer mindestens so weit neben jeder Strassenmitte
      gruppe: [3, 7],          // Grösse der Gruppen
      gruppeLaenge: 6,         // eine Gruppe steht über so viele Meter verteilt
      radius: 0.35,            // Kollision und Platzbedarf je Zuschauer
      dicht: 0.75,             // so nah stehen zwei Zuschauer höchstens
      blickStreuung: 0.6,      // Blick zur Strasse, so viel (Bogenmass) zufällig daneben
      posen: [0.22, 0.18, 0.14, 0.14, 0.1, 0.12, 0.1], // stehend, winkend, jubelnd, Schweizer Fahne, Fotograf, Mütze, Fahne
      kinder: 0.1,
      spots: [
        {
          name: 'kehren', s: [1694, 1716], seite: 1, lat: [8.5, 19], anzahl: 22, blickS: 1668, // am Hang aussen an Kehre 3
          band: [[1692, 1718, 7.9]],               // Absperrband: von, bis, lat
          banner: [[1704.5, 9.6, 'kehre']],          // Fan-Banner auf zwei Pfosten: s, lat, Name (lebenbild.js)
          fahnen: [[1697, 16, 'kreuz'], [1706, 13.5, 'gruen']],
          stuehle: 3,                              // Klappstühle (mit sitzenden Fans)
        },
        {
          name: 'pass', s: [2590, 2652], seite: 1, lat: [8, 17], anzahl: 28, blickS: null,   // Passhöhe, grösster Spot
          band: [[2596, 2656, 7.2]],
          banner: [[2616, 9.2, 'pass'], [2641, 9.4, 'turbo']],
          fahnen: [[2600, 11, 'kreuz'], [2624, 12.5, 'kreuz'], [2646, 11.5, 'rot']],
          stuehle: 4,
          camper: [2630, 21.5, 14],                // Wohnmobil: s, lat, Drehung
          zelt: [2609, 17.5],                      // Pavillon
        },
        {
          name: 'alm', s: [1970, 1990], seite: -1, lat: [8.5, 14], anzahl: 14, blickS: 1984,  // hinter der Strohballen-Wand am Almweg-Abzweig
          band: [[1968, 1986, 7.8]],
          banner: [[1977, 9.4, 'alm']],
          fahnen: [[1984, 12.5, 'kreuz']],
          stuehle: 2,
          pickup: [1979, 18.5, -60],               // parkierter Pickup: s, lat, Drehung
        },
      ],
    },

    // Unfallautos (stehende Wracks, Fantasie-Rallyeautos im Stil der 80er-Gruppe B, keine echten Modelle)
    //   typ 'brunnwald' (Keil-Coupé) oder 'vallora' (kantiger Kompakter), Farben, Startnummer, Sponsor
    //   baum: [s, seite, lat] = das Auto steckt mit der Front am nächsten Baum dort (Baum bleibt, wo er ist)
    //   sonst s/seite/lat/drehung (Grad: 0 = in Fahrtrichtung, 90 = schaut von der Strasse weg)
    //   warndreieck: so viele Meter davor am Strassenrand (lat), posten: Streckenposten [s, lat]
    wracks: [
      {
        name: 'tal', typ: 'brunnwald', lack: '#f2f0e8', akzent: '#c8202a', nummer: '14', sponsor: 'firn',
        baum: [638, 1, 12.2], anstoss: 0.28, winkel: 42,   // Front 0.28 m neben der Mitte am Stamm, so schräg zur Strasse
        schaden: 'front',                                   // Front eingedrückt, Haube offen, Rad schief
        warndreieck: { vor: 24, lat: 6.3 }, flagge: { vor: 20, lat: 7.0 },
        posten: [[651, 13.5], [626, 15.5]],
      },
      {
        name: 'abfahrt', typ: 'vallora', lack: '#2f62c8', akzent: '#f0c020', nummer: '23', sponsor: 'murmeli',
        s: 2488, seite: 1, lat: 9.6, drehung: 62,           // an der Böschung gleich nach dem Ende der Leitplanke (vor dem Weidezaun)
        schaden: 'seite',                                   // Seite eingedrückt, Rad ab, Tür abgesprungen, Flügel schief
        warndreieck: { vor: 26, lat: 5.85 }, flagge: { vor: 18, lat: 6.6 },
        posten: [[2503, 13.5], [2474, 12.5]],
      },
    ],
    kreisRadius: 0.92,         // Wrack-Kollision: drei Kreise entlang der Karosserie mit diesem Radius
    postenJacken: ['#ff6a10', '#e2f02a'], // Warnwesten (orange, gelb)
    postenFahne: '#f4d21a',    // gelbe Flagge
    rauch: { anzahl: 6, leben: 5, steigen: 0.5, groesse: [0.5, 1.9], dichte: 0.38, farbe: '#a9a7a2', wind: [0.35, 0.15] }, // dezente Rauchfahne je Wrack (Wölkchen, Lebensdauer s, Steigen m/s, Grösse m, Dichte 0..1)
  },

  // --- Gelände --------------------------------------------------------
  gelaende: {
    raster: 4,                 // Abstand der Geländepunkte nahe der Strecke (Meter)
    kachel: 64,                // Gelände ist in Kacheln dieser Grösse aufgeteilt (Meter)
    kernRand: 100,             // bis so weit von der Strecke ist das Gelände fein (raster)
    mittelRand: 300,           // bis hier halb so fein (2 x raster)
    fernRand: 800,             // bis hier 4 x raster, danach ganz grob (32 m) – liegt im Dunst
    feinBis: 480,              // so weit von der Kamera wird das Gelände fein gezeichnet, dahinter grob (spart Leistung)
    aussenRand: 1100,          // so weit über die Strecke hinaus reicht das Gelände
    stueck: 6,                 // so viele Kacheln (pro Richtung) werden zu einem Stück zusammengefasst
    flachBis: 7.5,             // bis zu diesem Abstand von der Strassenmitte ist es flach
    uebergang: 12,             // danach geht es über so viele Meter ins natürliche Gelände
    randSteigung: 0.35,        // so steil darf es gleich neben der Strasse höchstens ansteigen
    huegelHoehe: 7,            // Höhe der kleinen Zufallshügel
    grundWeite: 250,           // Grundhöhe der Landschaft = Strassenhöhe, über so viele Meter gemittelt
    wandBerg: 75,              // Berg hinter den Felswänden (Höhe über der Grundhöhe)
    talTiefe: 55,              // Tal unter den Abhängen (Tiefe unter der Grundhöhe)
    randAnstiegAb: 350,        // ab diesem Abstand von der Strecke steigt das Land an ...
    randAnstiegBis: 1000,      // ... bis hier ...
    randHoehe: 170,            // ... um so viele Meter (Talflanken, liegen im Dunst)
    seed: 1987,                // Zufallszahl für Hügel (gleich = gleiches Gelände)
  },

  // --- Felswand / Abhang ----------------------------------------------
  felswand: {
    hoehe: 13,                 // Höhe der Felswand über der Strasse
    abstand: 5.2,              // Wandfuss: Abstand von der Strassenmitte
    talBoden: 6,               // Höhe des Talbodens unter dem Abhang
    abhangStart: 7.5,          // ab diesem Abstand fällt der Hang ab
    // M3a.3: Gelände am Wandfuss (zwischen Bankett und Wand) und hinter der Wand ohne Gras
    fussFarben: true,          // false = wie früher (Wiese schaut am Wandfuss hervor)
    fussBreite: [18, 26],      // so weit neben der Strassenmitte (Meter) ist es Erde/Geröll, danach weicher Übergang
    fussGeroell: '#736e66',    // Farbe der Geröll-Flecken (dazu farben.erde und dunkler Fels)
    // M5a.1: Bäume, Büsche, Steine usw. nicht im Fels. Ein Objekt steht im Fels, wenn die Felsfläche an seinem
    // Stamm höher ist als das Gelände (plus diese Toleranz in Metern; hinter der Wand am Berg ist das Gelände höher).
    imFelsToleranz: 0.05,
  },

  // --- Sprites (Bäume, Steine) ----------------------------------------
  sprites: {
    seed: 4242,                // Zufallszahl für die Platzierung (gleich = gleiche Welt)
    tannenProKm: 4200,         // Versuche pro km Strecke (wie viele stehen bleiben, hängt vom Abschnitt ab)
    laubProKm: 2800,
    steineProKm: 1600,
    breite: 230,               // so weit links und rechts der Strasse stehen Sprites (Meter)
    verteilung: 1.8,           // > 1 = nahe der Strasse dichter, weiter weg dünner
    mindestAbstand: 9,         // so nah dürfen Objekte an die Strassenmitte
    waldAbstand: 7.5,          // im Waldstück dürfen Bäume näher ran
    tannenHoehe: [8, 15],      // Höhe von bis (Meter)
    laubHoehe: [7, 11],
    steinHoehe: [0.8, 2.2],
    helligkeit: 1.0,           // Helligkeit der Sprites
  },

  // --- Büsche, Jungtannen, Grasbüschel (Meilenstein 2b) -----------------
  // Reine Deko ohne Kollision (man fährt "drüber"), darum ändern sie nichts an den Abkürzungen.
  // Eigener seed: die Bäume und Steine von oben bleiben genau gleich.
  buesche: {
    an: true,                  // false = keine Büsche, Jungtannen und Grasbüschel
    seed: 5150,                // Zufallszahl (gleich = gleiche Büsche)
    mindestAbstand: 6,         // so nah dürfen sie an die Strassenmitte (Bankett endet bei 5.5)
    hoehe: [0.6, 1.2],         // Büsche: Höhe von bis (Meter)
    grasHoehe: [0.45, 0.85],   // hohe Gras-/Blumenbüschel
    jungHoehe: [1.1, 1.9],     // Jungtannen (unter 2 m, darum ohne Kollision)
    jungAbstand: 9,            // Jungtannen erst ab so vielen Metern neben der Strassenmitte (verdecken keine Schilder)
    randGruppenProKm: 70,      // Gruppen von Büschen am Strassenrand (Versuche pro km)
    gruppe: [2, 4],            // ... so viele Büsche pro Gruppe
    gruppeRadius: 2.2,         // ... so weit verstreut (Meter)
    randBreite: [6.5, 14],     // ... so weit neben der Strassenmitte
    zaunProKm: 90,             // Büsche hinter Zäunen und Leitplanken (Versuche pro km, nur wo welche stehen)
    waldrandProKm: 900,        // Büsche und Jungtannen am Waldrand (Versuche pro km)
    wieseProKm: 260,           // vereinzelte Büsche und Grasbüschel auf den Wiesen (Versuche pro km)
    breite: 140,               // Waldrand und Wiese: so weit neben der Strasse (Meter)
    verteilung: 1.6,           // > 1 = nahe der Strasse dichter
    blueten: 0.18,             // so ein Anteil der Büsche blüht (rosa Alpenrosen)
    beeren: 0.15,              // ... so ein Anteil sind Heidelbeer-Sträucher
    abstandKuh: 1.8,           // so weit weg von Kühen
    maxSteil: 0.6,             // nicht an steileren Hängen (0.6 = 60 %, dort ist Fels)
  },

  // --- Wald in der Ferne (Meilenstein 2b) --------------------------------
  // Hinter der Sprite-Reichweite (sprites.breite = 230 m) war das Gelände kahl. Jetzt:
  // 1. Geländefarbe nach denselben Waldstücken wie nahe der Strasse (kostet nichts beim Zeichnen)
  // 2. eine dünne Schicht grosser Tannen zwischen ca. 200 und 700 m (ein Zeichenaufruf)
  fernwald: {
    faerben: true,             // false = Gelände in der Ferne wie früher (nur Gras/Fels)
    farbeAb: [140, 230],       // ab so vielen Metern neben der Strasse wird eingefärbt, voll ab dem zweiten Wert
    dichteAb: [250, 600],      // Talflanken: ab hier wird der Wald dichter als an der Strasse, ab dem zweiten Wert normal
                               // (an der Strasse gilt die Baumdichte des Abschnitts, z. B. im Tal nur 35 %)
    waldFarbe: '#224821',      // Tannengrün der Waldstücke ...
    waldDunkel: '#163418',     // ... mit dunkleren Flecken (Kronen)
    waldStaerke: 1.0,          // wie stark der Wald die Grasfarbe ersetzt (0..1)
    wiesenFarbe: '#5da838',    // offene Wiese in der Ferne: etwas heller
    wiesenStaerke: 0.35,       // ... so stark (0 = wie früher)
    geroellFarbe: '#77736a',   // Geröllflecken an Hängen
    geroell: 0.74,             // Geröll, wo das Rauschen über diesem Wert liegt (höher = weniger Flecken)
    baeume: true,              // false = keine Fernbäume
    seed: 2024,                // Zufallszahl für die Fernbäume
    baeumeProKm: 6500,         // Versuche pro km Strecke (stehen bleiben nur die an Waldstellen)
    von: 195,                  // Fernbäume ab so vielen Metern neben der Strasse ...
    voll: 270,                 // ... voll dicht ab hier (weicher Übergang zu den nahen Bäumen)
    aus: 700,                  // ... ab hier werden sie weniger ...
    bis: 900,                  // ... und hier hören sie auf (dahinter nur noch die Geländefarbe)
    hoehe: [12, 22],           // Höhe (Meter), grösser als die nahen Tannen
    hang: 1.4,                 // an Hängen etwas mehr Bäume (1 = gleich wie flach)
    einsinken: 0.8,            // so tief stehen sie im Boden (das grobe Gelände weit weg ist ungenau)
    helligkeit: [0.7, 0.88],   // etwas dunkler als die nahen Bäume (Tiefe)
  },

  // --- Kühe (Meilenstein 2b) --------------------------------------------
  // Herden auf den eingezäunten Weiden im Tal und auf den Alpwiesen oben. Jede Kuh hat eine
  // zufällige Blickrichtung; gezeigt wird die Ansicht, die zum Winkel zur Kamera passt (8 Ansichten).
  kuehe: {
    an: true,                  // false = keine Kühe
    seed: 1300,                // Zufallszahl (gleich = gleiche Kühe an gleicher Stelle). M3a: 1291 -> 1300, die grösste Weide im Tal ist jetzt Wald am Nebenweg
    anzahl: 34,                // so viele Kühe insgesamt (ungefähr; passen nicht alle hin, sind es weniger)
    herde: [2, 6],             // Herdengrösse von bis
    einzeln: 3,                // dazu so viele Einzeltiere
    anteilTal: 0.6,            // so ein Anteil der Kühe steht auf den Weiden im Tal (Rest auf den Alpwiesen)
    alpAb: 120,                // Alpwiese: Strasse höher als so viele Meter über dem Start ...
    alpBreite: [10, 30],       // ... Kühe so weit neben der Strasse (mehr als 45 m kommt man mit dem Auto nicht hin)
    passBei: 2586,             // nahe dieser Stelle (Passhöhe, Streckenmeter) steht sicher eine Herde auf der Alpwiese
    weideTiefe: [3, 25],       // Weide hinter einem Zaun: so weit hinter dem Zaun
    abstandStrasse: 8,         // nie näher an die Strassenmitte (auch nicht an eine andere Kehre)
    abstandZaun: 3.5,          // so weit weg von Zaun, Leitplanke und Schildern (nicht in die Pfosten)
    abstandTor: 5,             // so weit weg von einem Weidetor (die Durchfahrt bleibt frei) ...
    torTiefe: 20,              // ... und hinter dem Tor bleibt so ein langer Weg ins Feld frei
    abstandBaum: 2.5,          // so weit weg von Bäumen, Steinen, Sperren
    abstandKuh: 2.4,           // Kühe untereinander (Mitte zu Mitte)
    herdeRadius: [4, 12],      // eine Herde verteilt sich so weit um ihre Mitte (mehr Tiere = weiter)
    herdenAbstand: 45,         // zwei Herden stehen mindestens so weit auseinander (Mitte zu Mitte)
    sichtVersuche: 4,          // pro Herde so viele Plätze auswürfeln, genommen wird der mit der freiesten Sicht von der Strasse
    maxSteigung: 0.2,          // nur wo das Gelände flach ist (0.2 = 20 %)
    maxWald: 0.25,             // nur wo kein Wald ist (0..1)
    pufferNichtSchneiden: 20,  // Innenseite der gesperrten Kurven (sVon–sBis plus so viele Meter) bleibt frei
    pufferSchneiden: 50,       // ... und der freien Kurven (lange Abkürzungen kommen erst ca. 50 m danach zurück)
    posen: [0.45, 0.35, 0.2],  // Anteil stehend, grasend (Kopf unten), liegend (wiederkäuend)
    gleicheRichtung: 0.5,      // so oft schaut eine Kuh ungefähr in dieselbe Richtung wie ihre Herde
    groesse: [0.92, 1.06],     // Grösse (1 = 1.4 m hoch, 2.4 m lang)
    radius: 0.95,              // Kollision: Kreis um den Körper (Meter) ...
    radiusLiegend: 0.75,       // ... bei liegenden Kühen
    // M3c: zusätzliche Herden beim Start und beim Ziel (s = Streckenmeter, seite -1 links / +1 rechts,
    // lat = so weit neben der Strasse). Werden zuletzt geplant: alle anderen Kühe bleiben gleich.
    zusatzHerden: [
      { s: 150, seite: 1, lat: [26, 40], anzahl: 5 },   // Start: Wiese rechts, nach dem Zuschauerbereich
      { s: 3505, seite: 1, lat: [20, 34], anzahl: 5 },  // Ziel: Weide rechts hinter dem Zaun, vor dem Zuschauerbereich
    ],
  },

  // --- Hintergrundberge -----------------------------------------------
  berge: {
    anzahl: 34,                // Berge im hinteren Kranz (vorne kommen 70 % dazu)
    abstand: [1400, 2200],     // Entfernung hinter dem Geländerand (Meter)
    hoehe: [1000, 1750],       // Gipfelhöhe (bei bezugsAbstand, weiter weg etwas höher)
    bezugsAbstand: 3300,       // bei dieser Entfernung gilt die Gipfelhöhe
    schneeAb: 0.5,             // Schnee ab diesem Anteil der Höhe
    fussBis: 0.3,              // bis zu diesem Anteil der Höhe geht der Bergfuss von Grün (farben.bergFuss) in Fels über
    seed: 77,
  },

  // --- Fahrphysik -----------------------------------------------------
  auto: {
    name: 'Ringwerk RT4',
    // Antrieb und Schalten: siehe "getriebe" weiter unten
    luftwiderstand: 3.25,      // Bremsung durch die Luft bei 190 km/h (m/s²), wächst mit dem Tempo im Quadrat.
                               // Zusammen mit dem 5. Gang ergibt das das Höchsttempo (weich, kein harter Anschlag)
    motorbremse: 0.35,         // Abbremsen ohne Gas (m/s², Mittelwert; je nach Gang und Drehzahl mehr oder weniger)
    bremse: 10,                // Bremskraft (m/s²)
    rueckwaertsTempo: 6,       // max. Tempo rückwärts (m/s); auf Asphalt mal untergrund.asphalt.rueckwaertsMax (M5a.1)
    rueckwaertsBeschl: 3,      // Beschleunigung rückwärts (m/s²)
    steigungsFaktor: 0.45,     // wie stark Steigung/Gefälle wirkt (1 = voll, 0 = gar nicht)

    radstand: 2.52,            // Abstand Vorder- zu Hinterachse
    schwerpunktVorne: 0.48,    // Anteil Radstand vom Schwerpunkt bis Vorderachse (0..1)
    traegheit: 2.3,            // Drehträgheit. Höher = Auto dreht träger (schwerer)

    lenkwinkelLangsam: 32,     // max. Lenkwinkel im Stand (Grad)
    lenkwinkelSchnell: 4.5,    // max. Lenkwinkel bei Referenztempo (Grad)
    lenkReferenzTempo: 45,     // ab diesem Tempo (m/s) gilt lenkwinkelSchnell
    lenkwinkelStand: 48,       // max. Lenkwinkel im Schritttempo, z. B. nach einem Aufprall (Grad, 0 = aus)
    lenkStandBisTempo: 8,      // bis zu diesem Tempo (m/s, 8 = ca. 30 km/h) läuft der Extra-Einschlag weich aus;
                               // voll gilt er bis zu einem Viertel davon (2 m/s = ca. 7 km/h)

    gripVorne: 1.0,            // Haftung Vorderachse (etwas weniger = Auto schiebt eher)
    gripHinten: 1.12,          // Haftung Hinterachse
    reifenSteifigkeit: 9,      // wie schnell die Reifen Seitenkraft aufbauen
    handbremseGrip: 0.8,       // Reibung der blockierten Hinterräder (seitlich halten sie kaum)
    handbremseBremse: 3.5,     // Bremswirkung der Handbremse gleich nach dem Ziehen (m/s²): kurz ziehen kostet wenig Tempo
    handbremseBremseLang: 5, // M3a.2: ... und lange gehalten (m/s², in jede Rutschrichtung; mal Grip: auf Schotter etwas weniger)
    handbremseAufbau: 1.2,     // M3a.2: nach so vielen Sekunden Halten gilt handbremseBremseLang und handbremseAntrieb voll
    handbremseAntrieb: 0.3,    // M3a.2: so viel vom Antrieb kommt bei lange gehaltener Handbremse noch an (1 = alles, vorher so)
    gasImDrift: 0.12,          // Gas im Drift lockert das Heck etwas (0 = aus)
    stabilitaet: 5,            // zieht das Auto aus dem Drift zurück gerade. 0 = aus, höher = braver
    stabilitaetRueckkehr: 2.5, // wie schnell die Stabilität nach der Handbremse zurückkommt
    // Geradeauslauf (M3a.2): nach dem Loslassen der Lenkung findet das Auto schnell wieder geradeaus,
    // solange es nicht rutscht. Einlenken und Kurvenfahrt bleiben wie vorher.
    geradeauslauf: {
      gier: 8,                 // so schnell (1/s) hört das Auto auf nachzudrehen. 0 = aus (wie vor M3a.2)
      schwimm: 4,              // so schnell (1/s) dreht die Fahrtrichtung zur Blickrichtung (seitliches Schieben weg)
      lenkBis: 0.15,           // wirkt voll bei gerader Lenkung, ab so viel Lenkung (0..1) gar nicht mehr
      rutschAb: 8,             // ab diesem Schwimmwinkel (Grad) wird die Hilfe schwächer ...
      rutschBis: 15,           // ... ab diesem ist sie aus: das Auto rutscht, es soll weiter schieben (Drift)
    },
    // Dreher (M3a.2): rutscht das Auto schneller als abSeit (m/s) seitwärts, rutscht es mit der Reibung der Reifen
    // weich aus statt schlagartig zu stehen; das Drehen wird dabei höchstens mit drehBremse (rad/s²) gebremst
    dreher: { abSeit: 1.5, drehBremse: 4 },
  },

  // --- Getriebe und Motor (Meilenstein 1.2) ----------------------------
  // Automatik, die sich wie ein Handschalter mit kurzer Schaltpause anfühlt.
  // Schaltgefühl anpassen: schaltDauerHoch/-Runter, Schaltpunkte (hoch.../runter...),
  // Drehmomentkurve (drehmoment) und Schub je Gang (zugkraft).
  getriebe: {
    modus: 'automatik',        // 'automatik' (später evtl. 'manuell' mit Tasten)
    gaenge: [48, 82, 118, 156, 195], // Tempo (km/h) bei nennDrehzahl im 1. bis 5. Gang
    nennDrehzahl: 7000,        // U/min, auf die sich "gaenge" bezieht
    leerlauf: 1000,            // U/min im Leerlauf
    standgas: 4500,            // im Stand mit Vollgas dreht der Motor bis hierhin (Kupplung schleift)
    kupplungDrehzahl: 3500,    // beim Anfahren im 1. Gang zählt mindestens dieses Drehmoment (kein lahmer Start)
    // Drehmomentkurve: [U/min, Anteil 0..1]. Unten schwach, 4000–6000 voll, oben leicht abfallend
    drehmoment: [[0, 0.45], [1000, 0.5], [2000, 0.55], [3000, 0.78], [4000, 1.0], [6000, 1.0], [7000, 0.85], [8000, 0.65]],
    zugkraft: [8.0, 6.55, 5.4, 4.45, 3.65], // Schub (m/s²) bei vollem Drehmoment im 1. bis 5. Gang. Höher = schneller
    traktion: 8.5,             // mehr Schub geht nicht auf den Boden (mal Grip: Asphalt 1.0, Bankett 0.85, Gras 0.62)
    schaltDauerHoch: 0.28,     // Schaltpause beim Hochschalten (Sekunden): kein Antrieb, das Auto rollt
    schaltDauerRunter: 0.18,   // Schaltpause beim Runterschalten (Sekunden)
    hochWenigGas: 4500,        // hochschalten bei dieser Drehzahl mit wenig Gas ...
    hochVollgas: 6900,         // ... und bei dieser mit Vollgas (dazwischen gemischt)
    runterWenigGas: 1800,      // runterschalten unter dieser Drehzahl ohne Gas ...
    runterVollgas: 2600,       // ... und unter dieser mit Vollgas
    runterBremsen: 3200,       // beim Bremsen schon unter dieser Drehzahl runterschalten
    runterReserve: 1.3,        // beim Runterschalten so viel über der Runterschalt-Drehzahl landen (sonst 2 Gänge runter)
    kickdownGas: 0.9,          // Kickdown: ab so viel Gas ...
    kickdownUnter: 4200,       // ... und unter dieser Drehzahl in einen tieferen Gang ...
    kickdownMax: 6500,         // ... wenn die Drehzahl dort unter diesem Wert bleibt
    gasGlattRauf: 0.1,         // Schaltpunkte folgen dem Gaspedal so schnell (Sekunden), wenn man mehr Gas gibt ...
    gasGlattRunter: 1.0,       // ... und so langsam, wenn man vom Gas geht (kein Hochschalten beim kurzen Lupfen)
    schaltSperre: 0.6,         // nach einem Schaltvorgang so lange (Sekunden) nicht wieder schalten
    leerlaufNach: 0.5,         // so lange (Sekunden) im Stand ohne Gas und Bremse, dann "N"
    motorbremseBezugGang: 3,   // in diesem Gang ...
    motorbremseBezugDrehzahl: 4000, // ... und bei dieser Drehzahl gilt auto.motorbremse genau
    drehzahlFolgen: 14,        // wie schnell die Drehzahl-Anzeige folgt (höher = direkter)
    drehzahlFolgenSchalten: 9, // ... während der Schaltpause (Nadel fällt sichtbar ab)
  },

  // --- Untergrund -------------------------------------------------------
  // rueckwaerts: so stark schiebt der Rückwärtsgang hier (mal auto.rueckwaertsBeschl).
  // 1.0 = wie auf der Strasse. Auf Gras höher, damit man auch bergauf (bis grenze.steilsterHang)
  // rückwärts aus der Wiese kommt. Wirkt nur im Rückwärtsgang.
  // rueckwaertsMax (M5a.1): Rückwärts-Höchsttempo hier = auto.rueckwaertsTempo mal diesem Wert (fehlt er, gilt 1).
  // Nur Asphalt ist schneller (1.5 = 9 m/s = ca. 32 km/h); Bankett, Gras, Schotter, Wiesenweg bleiben bei 6 m/s
  // (sonst ändert sich das "Raus aus dem Gras"). Wechselt man schnell rückwärts vom Asphalt aufs Gras, läuft das
  // Tempo über die Reibung des Untergrunds aus (kein Ruck).
  untergrund: {
    asphalt: { grip: 1.0, rollen: 0.05, rollenTempo: 0.0, rueckwaerts: 1.0, rueckwaertsMax: 1.5 },
    bankett: { grip: 0.85, rollen: 0.6, rollenTempo: 0.02, rueckwaerts: 1.5 },
    gras:    { grip: 0.62, rollen: 2.2, rollenTempo: 0.11, rueckwaerts: 2.2 },
    // Schotter (M3a): rutscht früher als Asphalt (mit Handbremse schön quer), bremst etwas mehr,
    // hält aber deutlich besser als Gras. Startwerte, durch Fahren feinjustieren.
    //   heck: Grip hinten zusätzlich mal diesem Wert (unter 1 = Heck kommt früher, Drift)
    //   stabilitaet: Stabilitätshilfe (auto.stabilitaet) mal diesem Wert (unter 1 = Drift hält länger)
    //   geradeaus (M3a.2): Geradeauslauf-Hilfe (auto.geradeauslauf) mal diesem Wert (unter 1 = schiebt nach
    //   dem Loslassen der Lenkung länger seitlich, 0 = wie vor M3a.2)
    // (fehlen sie, gilt 1 = wie bisher; Asphalt, Bankett und Gras sind darum unverändert)
    schotter: { grip: 0.8, rollen: 0.35, rollenTempo: 0.01, rueckwaerts: 1.2, heck: 0.8, stabilitaet: 0.5, geradeaus: 0.4 },
    // Wiesenweg (M3b): Erde und Gras – stumpfer und schwammiger als Schotter, wenig Haftung, kaum Bremswirkung
    // (rollen klein), aber nicht wie Eis: Heck und Stabilität so, dass er kontrollierbar driftet.
    // Gemessen mit tools/belag-test.mjs: weniger Grip allein machte das Auto nur träger (Drift 3° statt 8° auf
    // Schotter, wie in M3a). Mit heck 0.7 und stabilitaet 0.5 kommt das Heck unter Gas deutlich (ca. 11-16°),
    // lässt sich nach der Handbremse aber in unter 1 s wieder einfangen.
    wiesenweg: { grip: 0.64, rollen: 0.9, rollenTempo: 0.03, rueckwaerts: 1.4, heck: 0.7, stabilitaet: 0.5, geradeaus: 0.4 },
  },

  // --- Staub auf Schotter (Meilenstein 3a, js/staub.js) -------------------
  staub: {
    an: true,                  // false = kein Staub
    max: 60,                   // höchstens so viele Wölkchen gleichzeitig
    seed: 909,                 // Zufallszahl
    farbe: '#d6ccb4',          // helles Staub-Beige
    proSekunde: 55,            // so viele Wölkchen pro Sekunde bei voller Stärke
    ruhig: 0.15,               // Stärke bei ruhiger Fahrt (bei 30 m/s = 108 km/h; langsamer weniger)
    drift: 0.9,                // ... dazu beim Driften (voll ab 25° Driftwinkel)
    handbremse: 0.6,           // ... dazu mit Handbremse
    anfahren: 0.7,             // ... dazu beim Anfahren mit viel Gas (unter 40 km/h)
    leben: [0.8, 1.5],         // so lange (Sekunden) lebt ein Wölkchen
    groesse: [0.4, 2.0],       // Grösse am Anfang und am Ende (Meter)
    deckkraft: 0.5,            // höchstens so dicht (0..1): gerastert, man sieht immer durch
    mitnehmen: 0.25,           // so viel vom Autotempo nimmt der Staub mit
    streuung: 1.6,             // seitliche Streuung (m/s)
    driftSeitlich: 1.5,        // beim Driften (ab 25°) wirft jedes Hinterrad den Staub so schnell (m/s) zusätzlich nach aussen (M3a.1)
    aufsteigen: 0.8,           // steigt so schnell auf (m/s)
    bremsen: 1.8,              // so schnell wird der Staub in der Luft langsamer
    // je Belag (M3b): Farbe und Stärke (mal die Werte oben). Asphalt staubt nie.
    belaege: {
      schotter: { farbe: '#d6ccb4', staerke: 1 },      // helles Staub-Beige
      wiesenweg: { farbe: '#8c7356', staerke: 0.55 },  // dunkler, erdig, schwächer
    },
  },

  // --- Checkpoints -------------------------------------------------------
  checkpoints: {
    beiMeter: [900, 1870, 2880], // wo die Tore stehen (Meter ab Strassenanfang)
    abkuerzungenVerhindern: true, // true = wer einen Checkpoint auslässt, wird zurückgesetzt
    anzeigeDauer: 3,           // so lange steht die Zwischenzeit oben im Bild (Sekunden)
    torBreite: 12.4,           // Abstand der Pfosten (Strasse 7 m + Bankett)
    torBreiteSchotter: 11.6,   // ... auf einem Schotter-Nebenweg (schmaler, 6.2 m): Tor passt sich an (M3a)
    torBreiteWiesenweg: 10.6,  // ... auf dem Wiesenweg (5.2 m) (M3b)
    torHoehe: 5.2,             // Höhe des Banners über der Strasse
    durchfahrtBreite: 9,       // so weit von der Strassenmitte zählt die Durchfahrt noch
  },

  // --- Begrenzung ---------------------------------------------------------
  grenze: {
    maxAbstand: 45,            // weiter weg von der Strasse geht es nicht (unsichtbare Wand)
    abhangGrenze: 6.6,         // am Abhang: unsichtbare Grenze (Abstand Strassenmitte)
    wandGrenze: 4.3,           // an der Felswand: hier stoppt die Automitte (seit M3a.3 nur noch für die Abkürzungs-Analyse)
    // Felswand (seit M3a.3): Das Auto stoppt an der sichtbaren Wandfläche, geprüft mit seinem Umriss
    wandHuelle: {
      laenge: 4.48,            // so lang ist das Auto für die Felswand (sichtbare Karosserie, Meter)
      breite: 1.86,            // so breit (mit Kotflügeln)
      ueberBoden: 0.1,         // geprüft knapp über dem Boden (unten steht die Wand am weitesten vor)
    },
    // M5a.1: Felswand von der Wiese her (Anfang/Ende der Wand): kein Wurf mehr auf die Strasse
    wandSprungMax: 0.03,       // so viel (Meter) darf die Wand das Auto pro Schritt mehr verschieben, als es gefahren ist
    wandVorneToleranz: 0.1,    // stand ein Punkt des Autos vorher höchstens so tief (m) in der Wand, kam er von der Strasse her
    abprallen: 0.2,            // wie stark das Auto von Grenzen abprallt
    steilsterHang: 0.55,       // steiler als das (0.55 = ca. 29°) kommt das Auto nicht hoch
  },

  // --- Kollision mit Bäumen, Steinen und Baumstämmen ---------------------
  kollision: {
    // Das Auto als Rechteck mit runden Ecken (flache Front = frontaler Aufprall)
    autoLaenge: 4.4,           // Länge (Meter)
    autoBreite: 1.8,           // Breite (Meter)
    eckRadius: 0.3,            // Rundung der Ecken (Meter)
    stammRadius: 0.45,         // Bäume: nur der Stamm zählt (Meter)
    steinFaktor: 0.42,         // Steine: Radius = Breite des Steins mal diesem Wert
    rueckprall: 0.02,          // wie stark das Auto zurückprallt (0 = gar nicht, 1 = Gummi)
    reibung: 0.62,             // Reibung am Hindernis: höher = schräge Aufpralle bremsen mehr
                               // (0.62: bis ca. 30° Stopp, 45° -> 27 % Tempo, 75° -> 80 %)
    ausrichten: 0.02,          // Streifschuss: wie stark das Hindernis das Auto parallel drückt
    glaetten: 0.4,             // Hindernisse so nah beisammen (Meter) wirken wie eine glatte Fläche (Stämme)
    drehBremse: 0.5,           // ein Drehen des Autos wird beim Aufprall so stark gebremst (1 = gar nicht)
    zelle: 8,                  // Rastergrösse für die schnelle Suche (Meter)
    pruefSchritt: 0.25,        // Weg wird in so kurzen Stücken geprüft (gegen Durchrutschen)
  },

  // --- Abkürzungen (Analyse) -------------------------------------------
  abkuerzung: {
    minGewinn: 3,              // so viele Meter muss eine gerade Linie sparen, damit sie als Abkürzung zählt
                               // (10 m fand mit den Bäumen von M1 nichts, Linos Abkürzungen sparen 3-8 m)
    maxLaenge: 200,            // Linien über höchstens so viele Strassenmeter prüfen
    autoBreite: 2.2,           // so breit muss eine Durchfahrt sein (Auto 1.8 m plus Reserve)
    wieseAb: 5.5,              // erst wenn die Automitte so weit neben der Strassenmitte ist (Bankett-Ende),
                               // zählt eine Linie als Abkürzung – vorher ist es die Ideallinie
    linienAbstand: 2,          // alle so viele Meter beginnt und endet eine geprüfte Linie
    pruefSchritt: 0.25,        // entlang der Linie alle so viele Meter prüfen

    // Welche Kurven werden gesperrt? (Meilenstein 1.2) Schneiden gehört zum Spiel:
    // nur ein Teil der Kurven bekommt Sperren ("nicht schneiden"), die anderen bleiben
    // frei ("schneiden"). Nach einer Änderung muss tools/abkuerzungen.mjs neu laufen.
    sperrQuote: 0.4,           // so ein Anteil der Kurvenzonen wird gesperrt (0.4 = 40 %)
    sperrQuoteMin: 0.3,        // ... aber mindestens so viel
    sperrQuoteMax: 0.5,        // ... und höchstens so viel (ausser Pflicht-Sperren)
    pflichtGewinn: 12,         // spart eine Abkürzung so viele Meter, wird immer gesperrt
    pflichtZeit: 0.5,          // spart Schneiden mit echter Fahrphysik so viele Sekunden, wird immer gesperrt
    immerSperren: [],          // Streckenmeter irgendwo in einer Kurve, die immer gesperrt sein soll, z. B. [1520]
    immerFrei: [],             // Streckenmeter irgendwo in einer Kurve, die immer frei sein soll, z. B. [612]
    wieseReihe: 16,            // eine Sperre, die länger als das quer in die Wiese ragt, ...
    wieseDichte: 1.2,          // ... und dort weniger Bäume/Steine pro 100 m² hat, gilt als "offene Wiese"
    wieseFaktor: 0.35,         // offene Wiese: Kurve wird so viel seltener gesperrt (sieht künstlich aus)
    waldDichte: 1.5,           // ab so vielen Bäumen/Steinen pro 100 m² wirkt eine Sperre ganz natürlich
    nachbarFaktor: 0.6,        // ist die Kurve davor/danach schon gesperrt, wird diese seltener gesperrt (Abwechslung)
  },

  // --- Abkürzungs-Sperren (Felsbrocken, Tannengruppen, Baumstämme) -------
  // Wo Sperren stehen, rechnet tools/abkuerzungen.mjs aus (-> js/abkuerzungen.js).
  // Wie sie aussehen, steht hier. WICHTIG: Jede Änderung hier stellt die Teile anders auf. Danach
  // nachprüfen, ob die Sperren noch halten:  node tools/abkuerzungen.mjs --pruefen
  // Halten sie nicht mehr, nur die Reihen neu planen (die Wahl der Kurven bleibt gleich):
  //   node tools/abkuerzungen.mjs --nur-reihen --offen tools/abkuerzungen-offen-m2a.json
  sperren: {
    seed: 815,                 // Zufallszahl (gleich = gleiche Sperren und gleiche Themen)
    // Thema pro Kurve (seit M2a.1): 'fels' = nur Felsbrocken mit ein paar kleinen Steinen,
    // 'staemme' = nur umgefallene Baumstämme, 'baeume' = nur Tannengruppen.
    // Leer = per Zufall (seed), Nachbarkurven nie gleich. Von Hand: Schlüssel = ein
    // Streckenmeter in der Kurve, z. B. { 1350: 'fels', 1496: 'staemme', 1789: 'baeume' }
    themen: {},
    // Beimischung: in der ersten Kurve mit Thema "in" wird so ein Anteil der Teile durch
    // "thema" ersetzt (Felsbrocken zwischen den Tannen). anteil: 0 = alle Kurven rein.
    beimischung: { in: 'baeume', thema: 'fels', anteil: 0.2 },
    gruppenAbstand: 40,        // Reihen auf derselben Seite, die weniger weit auseinander sind, gehören zur selben Kurve
    abstandMitte: 6,           // Hindernisse halten so viel Abstand zur Strassenmitte (Asphalt endet bei 3.5, Bankett bei 5.5)
    kroneAbstand: 4.8,         // Tannenkronen bleiben so weit von der Strassenmitte weg (nahe der Strasse nur junge, kleine Tannen)
    reserve: 2,                // Werkzeug: Sperre reicht so viel weiter ins Kurveninnere als die tiefste gefundene Abkürzung
                               // (bis M2a.1: 4; weniger = kürzere Reihen, weniger Teile)
    maxTiefe: 40,              // ... aber höchstens so weit weg von der Strassenmitte
    mindestAbstand: 5,         // zwei Sperren auf derselben Seite stehen mindestens so weit auseinander (Meter)
    luecke: [0.3, 1.2],        // Lücke zwischen zwei Teilen einer Kette (Meter, Kante zu Kante)
    maxLuecke: 1.4,            // nie grösser (das Auto ist 1.8 m breit)
    abstandTeile: 0.2,         // so viel Luft bleibt mindestens zwischen zwei Teilen (nichts steckt ineinander)
    korridor: 1.5,             // was so nah neben der Linie einer Reihe schon steht, zählt für deren Kette mit
    seitlich: 1.4,             // so weit pendeln die Teile seitlich (unregelmässig, keine Mauer)
    schraeg: 18,               // die Kette verläuft bis so viel Grad schräg statt genau quer
    felsHoehe: [2, 3.5],       // Felsbrocken: Höhe (Meter)
    felsFaktor: 0.4,           // Felsbrocken: Kollisionsradius = Breite mal diesem Wert
    felsSicht: 0.45,           // Felsbrocken/Steine: so breit (mal Breite) sieht man sie (für "nichts ineinander")
    felsBegleit: 0.5,          // so oft liegt neben einem Brocken der Kette ein kleinerer (lockere Gruppe statt Reihe)
    begleitSteine: [2, 4],     // Felsen-Kurve: so viele kleine Steine rund um die Brocken
    steinHoehe: [0.5, 1.1],    // ... so hoch
    baumHoehe: [7, 12],        // Höhe der Tannen in den Gruppen (nahe der Strasse kleiner, siehe kroneAbstand)
    jungHoehe: 3.5,            // kleinste Tanne (junge Tannen vorne an der Strasse; kleiner geht nicht, dann steht dort keine)
    baumBegleit: 0.6,          // so oft bekommt eine Tanne der Kette 1–2 Nachbarn (Gruppe statt Reihe)
    baumAbstand: [1.6, 2.6],   // Abstand der Nachbarn in der Gruppe
    stammLaenge: [4, 8],       // umgefallene Stämme: Länge (Meter)
    stammKurz: 2.5,            // ... kürzer nie (wenn Platz fehlt, wird gekürzt)
    stammDicke: [0.7, 1.0],    // ... Durchmesser
    stammStapel: [1, 3],       // ... so viele übereinander/nebeneinander
    stammDrehung: 22,          // ... so viel Grad schräg (zufällig)
    stammSeiten: 7,            // ... Ecken des Zylinders (Low-Poly)
    stammKreisAbstand: 0.6,    // ... Kollision: alle so viele Meter ein Kreis
    stammAufliegen: 0.8,       // ... Achse so viele Radien über dem höchsten Geländepunkt darunter
    aeste: [2, 4],             // ... abgebrochene Äste pro Stamm
  },

  // --- Strassenrand: Leitplanken, Holzzäune, Schilder (Meilenstein 2a) ---
  // Wo was steht, wird beim Laden aus der Strecke abgeleitet (js/strassenrand.js).
  // Gleicher seed = gleiche Zäune und Lücken bei jeder Fahrt.
  strassenrand: {
    seed: 77,                  // Zufallszahl für Zaun-Felder, Lücken, Tore, kaputte Latten (77: Zäune gut verteilt)
    abstand: 6.0,              // Abstand Strassenmitte -> Vorderkante Leitplanke (Bankett endet bei 5.5).
                               // Zaun und Schilder stehen etwas dahinter (siehe versatz)
    puffer: 20,                // so viele Meter vor/nach einer gesperrten Kurve ("nicht schneiden") bleibt die Innenseite frei
    pufferSchneiden: 50,       // ... und so viele bei freien Kurven ("schneiden"): lange Abkürzungen kommen erst
                               // bis ca. 50 m nach der Kurve auf die Strasse zurück
    cpFrei: 8,                 // so viele Meter vor/nach einem Checkpoint-Tor steht nichts (Torpfosten)
    sichtweite: 550,           // Stücke weiter weg von der Kamera werden nicht gezeichnet (sind eh unter 1 Pixel)
    stueckLaenge: 130,         // Leitplanken/Zäune/Schilder werden in Stücken dieser Länge gezeichnet

    planke: {
      an: true,                // false = keine Leitplanken
      hoehe: 0.75,             // Oberkante der Planke über dem Boden
      profil: 0.32,            // Höhe des Wellprofils (Blech)
      pfostenAbstand: 4,       // Abstand der Pfosten (Meter)
      reflektorAlle: 3,        // an jedem 3. Pfosten ein Reflektor (also alle ca. 12 m)
      abhangHoehe: 3,          // Planke auf der Talseite, wenn das Gelände um mindestens so viele Meter ...
      abhangWeite: 8,          // ... auf so vielen Metern hinter der Planke abfällt
      kehrenRadius: 18,        // Kurven enger als dieser Radius gelten als Kehre: aussen immer Planke
      kehreVorNach: 15,        // ... und so viele Meter vor und nach der Kehre auch
      mindestLaenge: 15,       // kürzere Stücke werden weggelassen (keine Schnipsel)
      lueckeFuellen: 12,       // kürzere Lücken zwischen zwei Stücken werden geschlossen
      zufahrtAlle: [180, 320], // ab und zu eine Unterbrechung (Zufahrt): alle so viele Meter Planke ...
      zufahrt: [6, 10],        // ... so lang (Meter)
      endeLaenge: 4,           // Abschluss: auf so vielen Metern ins Gelände abgesenkt ...
      endeAbwinkeln: 0.7,      // ... und so weit nach aussen abgewinkelt
      kreisAbstand: 0.7,       // Kollision: alle so viele Meter ein Kreis
      kreisRadius: 0.28,       // ... mit diesem Radius
    },

    zaun: {
      an: true,                // false = keine Holzzäune
      versatz: 0.35,           // steht so viel weiter weg als die Leitplanken (randAbstand + versatz)
      hoehe: 1.1,              // Höhe der Pfosten
      latten: [0.4, 0.75, 1.0], // Höhe der Querlatten (2 oder 3 Stück)
      pfostenAbstand: 2.5,     // Abstand der Pfosten
      waldMax: 0.15,           // nur wo der Waldanteil der Strecke kleiner ist (Wiese)
      steilMax: 2.5,           // nicht wo das Gelände 4 m hinter dem Zaun mehr als so viel steigt/fällt
      feldLaenge: [70, 160],   // die Wiese wird in Felder dieser Länge aufgeteilt ...
      quote: 0.55,             // ... so ein Anteil der Wiese bekommt einen Zaun (Ziel 40–70 %)
      beideSeiten: 0.15,       // so oft hat ein Feld auf beiden Seiten einen Zaun (sonst abwechselnd)
      torAlle: [45, 90],       // ein Weidetor (Lücke) alle so viele Meter Zaun
      tor: [4, 6],             // Breite der Lücke (Meter, befahrbar)
      torOffen: 0.5,           // so oft steht das Tor offen (ins Feld gedreht), sonst nur Lücke mit Torpfosten
      latteFehlt: 0.05,        // so oft fehlt eine Latte (kaputte Stelle)
      latteHaengt: 0.03,       // so oft hängt eine Latte auf einer Seite runter
      pfostenSchief: 0.06,     // so oft steht ein Pfosten schief
      schief: 0.06,            // Latten liegen bis so viele Meter schief (leicht unregelmässig)
      kreisAbstand: 0.6,       // Kollision: alle so viele Meter ein Kreis
      kreisRadius: 0.25,       // ... mit diesem Radius (enger als 0.6/0.25: die Autoecke rutscht sonst in die Lücken)
    },

    schilder: {
      an: true,                // false = keine Schilder
      versatz: 1.0,            // stehen so viel hinter der Leitplanken-Linie (randAbstand + versatz)
      warnRadius: 80,          // Kurvenwarnung vor Kurven, die enger sind als dieser Radius (Meter)
      warnVor: [80, 120],      // ... so viele Meter vor der Kurve (bevorzugt 100)
      gruppenLuecke: 120,      // enge Kurven mit weniger Abstand gelten als eine Folge -> Schild "Doppelkurve"
      chevrons: true,          // false = keine Richtungstafeln (KONZEPT.md: Lino mochte früher keine Kurvenpfeil-Schilder)
      chevronRadius: 25,       // Richtungstafeln (Chevrons) aussen in Kurven enger als das
      chevronAnzahl: [2, 4],   // so viele pro Kurve (mehr bei engeren/längeren Kurven)
      kmAlle: 500,             // Kilometertafel alle so viele Meter (0.5, 1.0, ...)
      gefaelleAb: 0.05,        // Schild "Gefälle", wo es über gefaelleStrecke Meter mehr als 5 % bergab geht
      gefaelleStrecke: 150,
      gefahrVor: 60,           // Gefahr-Schilder (Steinschlag, Gefälle) so viele Meter vor der Stelle
      mindestAbstand: 12,      // zwei Schilder auf derselben Seite mindestens so weit auseinander
      blickVor: 20,            // Schilder schauen zur Strasse so viele Meter vor ihnen (zum Fahrer hin)
      warnGroesse: 1.3,        // Kantenlänge der Warn-Dreiecke (Meter, grösser als echt: das Bild ist nur 320x180)
      warnHoehe: 1.4,          // Unterkante der Warnschilder über dem Boden
      chevronGroesse: [0.7, 0.875], // Breite, Höhe der Chevrons
      chevronHoehe: 0.8,       // Unterkante der Chevrons
      kehreGroesse: [0.7, 0.6], // Kehren-Nummern-Tafel (Breite, Höhe)
      kmGroesse: [0.65, 0.38], // Kilometertafel (Breite, Höhe)
      kmHoehe: 1.0,
      kreisRadius: 0.15,       // Kollision: Kreis um den Pfosten
      // --- seit M2a.1 ---
      groesse: 1.2,            // alle Schilder so viel grösser als oben angegeben (1.2 = +20 %, höchstens 1.25),
                               // damit man sie im kleinen Bild (320x180) besser erkennt
      abstandNeu: 60,          // neue Schilder (Tempo, Kühe, Kreuzung) stehen so weit von jedem anderen Schild weg
      sichtWeite: 30,          // neue Schilder: von so weit davor muss man sie sehen ...
      sichtFrei: 0.3,          // ... und so viel Luft bleibt zwischen Sichtlinie und Baumkrone
      talSchilder: true,       // Schilder "Kühe" (vor der grössten Weide im Tal) und "Kreuzung" (vor dem ersten offenen Tor)
      tempo: {                 // Tempo-Tafeln: reine Optik, KEIN Tempolimit im Spiel
        an: true,              // false = keine Tempo-Tafeln
        tal: 80,               // Talabschnitt (kurz nach dem Start)
        kehren: 60,            // vor einer Kurvenfolge mit Kehre
        eng: 50,               // vor einer engen Passage (Kurve enger als engRadius, keine Kehre)
        engRadius: 30,         // ... Meter
        aufheben: 80,          // nach der Folge wieder, wenn danach mindestens aufhebenNach Meter keine enge Kurve kommt
        aufhebenNach: 250,
        startNach: 60,         // Talabschnitt: so viele Meter nach der Startlinie
        vor: [60, 160],        // vor einer Folge: so viele Meter davor (Wunsch, weitester Abstand)
        nach: [60, 200],       // aufheben: so viele Meter nach dem Ende der Folge (Wunsch, weitester Abstand)
        max: 6,                // höchstens so viele Tempo-Tafeln
        groesse: 0.9,          // Durchmesser (Meter, wird noch mit "groesse" oben malgenommen)
        hoehe: 1.4,            // Unterkante über dem Boden
        zurWarnung: true,      // rechts kein Platz (z. B. Felswand)? Dann unter die Kurvenwarnung (gleicher Pfosten)
        hoehePaar: 1.0,        // ... Unterkante der Tafel dort, die Warnung kommt darüber
      },
    },
  },

  // --- Kamera -----------------------------------------------------------
  kamera: {
    sichtfeld: 62,             // Blickwinkel (Grad)
    abstand: 6.9,              // Abstand hinter dem Auto
    hoehe: 2.5,                // Höhe über dem Auto
    blickHoehe: 1.2,           // wohin geschaut wird (Höhe über dem Auto)
    blickVoraus: 4,            // wie weit vor das Auto geschaut wird
    nachfuehren: 3.2,          // wie schnell die Kamera der Drehung folgt (höher = direkter)
    fahrtrichtungAnteil: 0.3,  // 0 = nur Blickrichtung des Autos, 1 = nur Fahrtrichtung
    positionGlaetten: 12,      // Glättung der Kameraposition
    wandAbstand: 0.5,          // so viel Luft (Meter) hält die Kamera mindestens zur Felswand (M3a.3)
    sichtweite: 9000,          // weiter weg wird nichts gezeichnet
  },

  // --- Steuerung -------------------------------------------------------
  steuerung: {
    totzone: 0.12,             // Gamepad-Stick: so viel Bewegung wird ignoriert
    tastaturLenkTempo: 3.2,    // Tastatur: wie schnell der Lenkeinschlag aufbaut
    tastaturRueckTempo: 6,     // Tastatur: wie schnell die Lenkung zurück in die Mitte geht
  },

  // --- Anzeigen (HUD) ----------------------------------------------------
  // Masse in Pixeln des 320x180-Bildes.
  hud: {
    // Zeit oben links auf einer kleinen Tafel, darunter die Checkpoint-Punkte (seit M4.1 links, vorher Mitte)
    zeit: {
      links: 3,                // Abstand der Tafel vom linken Bildrand
      oben: 3,                 // Abstand der Tafel vom oberen Bildrand
      hoehe: 13,               // Höhe der Tafel
      innen: 3,                // Rand innen links und rechts
      luecke: 4,               // Abstand zwischen "ZEIT" und der Zeit
      ecke: 2,                 // so viele Pixel sind die Ecken abgeschrägt
      farbeTafel: 'rgba(18, 24, 32, 0.74)', // dunkel, halbtransparent (wie die Tachos)
      farbeRand: '#e6e2d3',    // heller Rand, 1 Pixel
      farbeBeschriftung: '#e6e2d3', // das winzige "ZEIT"
      cpGroesse: 4,            // Checkpoint-Punkte: Kantenlänge
      cpAbstand: 4,            // ... Abstand dazwischen
      cpUnter: 2,              // ... Abstand unter der Tafel
      farbeCpLeer: '#e6e2d3',  // Rahmen eines noch nicht erreichten Checkpoints
      farbeCpErreicht: '#ffd23c', // erreichter Checkpoint (gefüllt)
      meldungUnter: 4,         // Meldung (Zwischenzeit, seit M6.1 auf eigener Tafel) so weit unter den Punkten bzw. dem Live-Vergleich
    },
    // Minimap oben rechts (M6, seit M6.1 ein Ausschnitt): Umgebung des Autos, Norden oben, die Karte fährt mit
    minimap: {
      groesse: 49,             // Tafel so breit und so hoch (Pixel, mit Rand; ungerade, damit das Auto genau in der Mitte steht; M7a: 49 statt 61)
      sichtMeter: 95.6,        // Zoom: so viele Meter reichen vom Auto bis zum Rand der Tafel (kleiner = näher dran);
                               // M7a: 95.6 statt 120, damit es gleich viele Pixel pro Meter bleiben wie vorher (23.5 / 95.6 = 29.5 / 120)
      rechts: 3,               // Abstand der Tafel vom rechten Bildrand
      oben: 3,                 // Abstand der Tafel vom oberen Bildrand
      ecke: 2,                 // abgeschrägte Ecken der Tafel (wie die Zeit-Tafel)
      punktAbstand: 4,         // die Karte nimmt alle ... Streckenmeter einen Punkt (kleiner = rundere Kurven)
      neuFaerbenAb: 15,        // die gefahrene Strecke wird erst weitergemalt, wenn das Auto ... Meter weiter ist
      farbeTafel: 'rgba(18, 24, 32, 0.74)', // dunkelblaue Tafel (wie die Zeit-Tafel)
      farbeRand: '#e6e2d3',    // heller Rand
      farbeOffen: '#8796a6',   // noch nicht gefahrene Strecke (helles Blaugrau), 2 Pixel breit
      farbeGefahren: '#ffa62e', // schon gefahrene Strecke (Gelb/Orange)
      farbeStrassenRand: '#101418', // dünner dunkler Rand um die Strasse (lesbar auf jedem Untergrund)
      farbeStart: '#5fe35a',   // Start (Quadrat, grün)
      startGroesse: 4,         // ... so viele Pixel gross
      farbeZielHell: '#f4f4ee', // Ziel: Karo, helle Felder ...
      farbeZielDunkel: '#101418', // ... und dunkle Felder
      zielGroesse: 4,          // ... so viele Pixel gross
      farbeCpOffen: '#f4f4ee', // Checkpoint-Strich: noch nicht durchfahren (weiss)
      farbeCpDurch: '#5fe35a', // ... durchfahren (grün)
      farbeCpVerpasst: '#ff4a3a', // ... verpasst (rot)
      cpLaenge: 6,             // Checkpoint-Strich quer zur Strecke, so viele Pixel lang (2 Pixel dick)
      farbeAuto: '#ffffff',    // Auto: Pfeil 5x5 Pixel in Blickrichtung (8 Richtungen), hell ...
      farbeAutoRand: '#101418', // ... mit dunklem Rand
    },
    // Live-Vergleich unter der Zeit-Tafel (Meilenstein 6): "-0.8" grün = schneller, "+1.2" rot = langsamer
    vergleich: {
      // Tafel, Schrift und Beschriftung wie die Zeit-Tafel (hud.zeit: Höhe, Ecken, Rand, gleich breit), seit M6.1
      unter: 2,                // Tafel so viele Pixel unter den Checkpoint-Punkten
      aktualisieren: 0.2,      // die Zahl wird höchstens alle ... Sekunden neu angezeigt (5 Mal pro Sekunde)
      nullBis: 0.05,           // Unterschied unter so vielen Sekunden: weiss "0.0"
      hysterese: 0.02,         // gegen Flackern: Farbe/Vorzeichen wechselt erst ... Sekunden über/unter der Grenze
      farbeSchneller: '#5fe35a', // schneller als die Referenz (grün, "-0.8")
      farbeLangsamer: '#ff5a46', // langsamer (rot, "+1.2")
      farbeGleich: '#f4f4ee',  // gleich schnell (weiss, "0.0")
      // (seit M6.1 färben farbeSchneller / farbeLangsamer auch die Zwischenzeit-Meldung am Checkpoint)
    },
    // Taste H (Meilenstein 6): ganzes HUD aus/an, kurzer Hinweis unten in der Mitte
    hudSchalter: {
      hinweisDauer: 1.5,       // so lange steht "HUD AUS" / "HUD AN" (Sekunden)
      hinweisUnten: 12,        // Hinweis so viele Pixel über dem unteren Bildrand
    },
    // Analoge Tachos unten rechts (Meilenstein 1.2)
    tacho: {
      randRechts: 3,           // Abstand des Tempo-Tachos vom rechten Bildrand
      randUnten: 3,            // Abstand der Tachos vom unteren Bildrand
      abstand: 3,              // Abstand zwischen den beiden Tachos
      tempoRadius: 25,         // Grösse des Tempo-Tachos (Radius, Durchmesser = 2 x Radius + 1)
      drehzahlRadius: 22,      // Grösse des Drehzahlmessers
      bogen: 240,              // Nadelbogen in Grad (links unten bis rechts unten)
      tempoMax: 200,           // Skala Tempo bis (km/h)
      tempoStrichLang: 20,     // lange Striche alle ... km/h
      tempoStrichKurz: 10,     // kurze Striche alle ... km/h
      tempoZahlen: 40,         // Zahlen alle ... km/h
      tempoMaxMph: 120,        // Skala in mph (Einstellung "Einheiten", M5a): bis ... mph
      tempoStrichLangMph: 20,  // ... lange Striche alle ... mph
      tempoStrichKurzMph: 10,  // ... kurze Striche alle ... mph
      tempoZahlenMph: 40,      // ... Zahlen alle ... mph
      drehzahlMax: 8,          // Skala Drehzahl bis (x 1000 U/min)
      drehzahlRotAb: 7,        // roter Bereich ab (x 1000 U/min)
      nadelBreite: 1,          // Nadel 1 oder 2 Pixel breit
      tempoNadelFolgen: 7,     // wie schnell die Tempo-Nadel folgt (höher = direkter, gedämpft)
      drehzahlNadelFolgen: 22, // Drehzahl-Nadel folgt schneller
      farbeBlatt: 'rgba(18, 24, 32, 0.74)', // Zifferblatt (halbtransparent dunkel)
      farbeRand: '#e6e2d3',    // heller Rand
      farbeRandAussen: 'rgba(8, 10, 14, 0.8)', // dunkler Ring aussen herum
      farbeStriche: '#e6e2d3', // Skalenstriche
      farbeZahlen: '#ffd23c',  // Skalenzahlen (gelb)
      farbeRot: '#d8352a',     // roter Bereich auf dem Drehzahlmesser
      farbeNadel: '#ff3b2e',   // Nadel
      farbeSchatten: '#101418', // Schatten von Nadel und Schrift
      farbeNabe: '#9aa0a6',    // Knopf in der Mitte
      farbeKasten: 'rgba(0, 0, 0, 0.55)', // Kästchen hinter der Gangzahl
    },
  },

  // --- Pace-Notes: Ansagen des Beifahrers oben im Bild (Meilenstein 4) ----------
  // Alles wird beim Laden aus der Strecke berechnet (js/pacenotes.js), nichts von Hand pro Kurve.
  // Prüfen und Liste ansehen: node tools/pacenotes-test.mjs
  pacenotes: {
    an: true,                  // Standard beim ersten Start (danach merkt sich der Browser die Taste)
    taste: 'KeyN',             // Taste zum Ein-/Ausschalten (N)
    speicherName: 'alpineRally.paceNotes', // unter diesem Namen merkt sich der Browser "an/aus"

    // --- Kurven finden ---
    glaetten: 4,               // Krümmung über so viele Meter vor und nach jedem Punkt mitteln
    minKruemmung: 1 / 350,     // flacher als Radius 350 m zählt nicht als Kurve
    lueckeFuellen: 12,         // zwei Stücke in die gleiche Richtung mit kürzerer Lücke (Meter) = eine Kurve
    minWinkel: 15,             // Kurven mit weniger Richtungsänderung (Grad) bekommen keine Ansage
    kehreRadius: 18,           // enger als das (Meter) und ...
    kehreWinkel: 120,          // ... mindestens so viel Richtungsänderung (Grad) = Kehre (wie die Kehren-Schilder)
    kehrenGruppe: 300,         // Kehren mit weniger Abstand (Meter) gehören zur selben Gruppe (1/4, 2/4 ...)

    // --- Kurventempo -> Stufe (kalibriert mit tools/pacenotes-test.mjs an der echten Fahrphysik) ---
    // Kurventempo = Grenztempo: so schnell kommt der Testfahrer gerade noch durch die Kurve (Automitte höchstens
    // 1 m auf dem Bankett, kein Aufprall). Gemessen auf dem Belag der Kurve (auf Schotter langsamer) und
    // gespeichert in js/pacenotes-tempo.js (neu messen: node tools/pacenotes-test.mjs --schreiben).
    // Stufen-Grenzen (km/h): unter dem 1. Wert Stufe 1, ab dem letzten Wert Stufe 6 (= Vollgas)
    stufenGrenzen: [50, 70, 85, 100, 125],
    // Nur Reserve, falls eine Kurve nicht gemessen ist: geschätztes Tempo = Wurzel(querBeschl x Grip des
    // Belags x wirksamer Radius); wirksamer Radius = kleinster Radius + etwas Strassenbreite zum Begradigen
    querBeschl: 8.5,           // so viel Querbeschleunigung (m/s²) hält das Auto auf Asphalt (aus den Messungen)
    breiteNutzen: 1.5,         // so viel Strassenbreite (Meter) nutzt man zum Begradigen der Kurve
    engWeitAnteil: 0.2,        // im untersten 20 % des Tempobereichs der Stufe "ENG", im obersten "WEIT"
    langWinkel: 100,           // Kurve mit mehr Richtungsänderung (Grad, keine Kehre) = "LANG"
    langLaenge: 130,           // ... oder länger als so viele Meter = "LANG"
    oeffnetFaktor: 1.7,        // Radius am Ende so viel grösser als der kleinste = "ÖFFNET" (am Anfang: "ZIEHT ZU")

    // --- Schikane ---
    schikaneLuecke: 15,        // zwei Gegenkurven mit höchstens so viel Gerade dazwischen (Meter) ...
    schikaneWinkel: 75,        // ... je höchstens so viel Richtungsänderung (Grad) ...
    schikaneLaenge: 100,       // ... und zusammen höchstens so lang (Meter) = eine Schikane

    // --- Gerade, Kuppe, Senke ---
    geradeMin: 180,            // so lange (Meter) ohne angesagte Kurve = "GERADE" mit Länge
    geradeRunden: 50,          // Länge der Geraden auf so viele Meter abrunden
    kuppeAugHoehe: 1.3,        // Kuppe: Augenhöhe des Fahrers über der Strasse (Meter) ...
    kuppeSicht: [25, 70],      // ... die Strasse so weit voraus (Meter) muss hinter der Kuppe verschwinden
    kuppeMinKnick: 0.05,       // ... und die Steigung muss um mindestens so viel kippen (0.05 = 5 %)
    senkeMinKnick: 0.06,       // Senke: Gefälle kippt um mindestens so viel in Steigung (0.06 = 6 %) ...
    senkeVorGefaelle: 0.01,    // ... und vorher geht es bergab (Steigung höchstens 1 %): echte Mulde
    knickStrecke: 25,          // Steigung vor und nach dem Knick über so viele Meter gemessen

    // --- Felswand ---
    // "FELSWAND" nur, wenn in einem Felswand-Stück eine Kurve liegt, die die Wand AUSSEN hat
    // (wer zu weit rausträgt, landet an der Wand), und ihre Ansage höchstens diese Stufe hat
    wandMaxStufe: 4,

    // --- Ziel ---
    zielVor: null,             // "ZIEL" so viele Meter vorher (null = wie alle anderen Ansagen, nach Vorlaufzeit)

    // --- Zusammenfassen ---
    zusammen: 28,              // Ansagen näher beisammen (Meter) werden intern eine Ansage (Text mit "UND")
    abzweigFang: 30,           // Abzweig/Einmündung: Kurve so nah an der Kreuzung (Meter) gehört dazu
    maxZeichen: 24,            // längster Text einer Ansage (nur intern und für F3)

    // --- Was wird angezeigt (M4.1: knapper) ---
    // Diese Ansagen werden weiter berechnet, aber nur gezeigt, wenn hier true steht
    anzeigen: {
      felswand: false,         // Warndreieck "Felswand"
      senke: false,            // Mulde
      gerade: false,           // Pfeil "Gerade"
      belag: false,            // Belagwechsel als eigene Ansage (beim Abzweig steht er immer als kleines Zeichen)
    },

    // --- Wann erscheint eine Kachel (M4.1: später, höchstens 2) ---
    vorlaufZeit: 4,            // so viele Sekunden vorher (bei der aktuellen Geschwindigkeit) ...
    vorlaufMin: 50,            // ... aber mindestens so viele Meter vorher ...
    vorlaufMax: 160,           // ... und höchstens so viele
    vorlaufBremsen: 1.25,      // bei Kehren, Abzweigen und Einmündungen so viel mal früher (dort muss man vorher bremsen)
    maxKacheln: 2,             // höchstens so viele Kacheln gleichzeitig
    gruppeAbstand: 40,         // Ansagen näher beisammen (Meter) erscheinen zusammen (z. B. links 3, rechts 4)
    einblenden: 0.2,           // Sekunden zum Einblenden
    ausblenden: 0.3,           // Sekunden zum Ausblenden (beim Passieren der Kurvenmitte)
    nachruecken: 10,           // wie schnell die nächste Kachel nach links rutscht (höher = schneller)

    // --- Aussehen (Pixel im 320x180-Bild) ---
    oben: 1,                   // Abstand der Tafel vom oberen Bildrand (Tafel ist mittig)
    innen: 1,                  // Rand innen (zwischen Tafel-Rand und Kachel), Tafel ist dann 17 Pixel hoch
    luecke: 3,                 // Platz zwischen zwei Kacheln
    farbeTafel: 'rgba(18, 24, 32, 0.62)', // dunkel, halbtransparent
    farbeRand: 'rgba(230, 226, 211, 0.35)', // sehr dezenter heller Rand
    farbeSchatten: '#101418',  // Schatten unter den Symbolen
    farbeZeichen: '#f4f4ee',   // kleine Zeichen (eng, weit, lang, öffnet, zieht zu, Kehren-Nummer)
    farbeGesperrt: '#8a9096',  // abgesperrter Ast beim Abzweig/bei der Einmündung (grau)
    farbeSchotter: '#d8c08a',  // Zeichen "Schotter" beim Abzweig
    farbeWiese: '#9be07a',     // Zeichen "Wiesenweg" beim Abzweig
    farben: {                  // Farben der Symbole und der Stufen-Zahl
      rot: '#ff4a3a',          // Stufe 1-2, Kehre, "NICHT SCHNEIDEN", Absperrung
      gelb: '#ffd23c',         // Stufe 3-4
      gruen: '#7ee05a',        // Stufe 5-6, "SCHNEIDEN"
      weiss: '#f4f4ee',        // Kuppe, Ziel (und die abschaltbaren: Gerade, Senke, Belag)
    },
    // Texte (Grossbuchstaben)
    texte: {
      links: 'LINKS', rechts: 'RECHTS', und: 'UND', kehre: 'KEHRE', schikane: 'SCHIKANE',
      gerade: 'GERADE', kuppe: 'KUPPE', senke: 'SENKE', abzweig: 'ABZWEIG', einmuendung: 'EINMÜNDUNG',
      schotter: 'SCHOTTER', wiesenweg: 'WIESENWEG', felswand: 'FELSWAND', ziel: 'ZIEL',
      schneiden: 'SCHNEIDEN', nichtSchneiden: 'NICHT SCHNEIDEN',
      eng: 'ENG', weit: 'WEIT', lang: 'LANG', oeffnet: 'ÖFFNET', ziehtZu: 'ZIEHT ZU',
    },
  },

  // --- Taste R: zurück auf die Strasse (M4.1: mit Wartezeit) -------------------------
  // Während der Wartezeit ist das Auto gesperrt (bremst bis zum Stand, kein Gas, keine Lenkung),
  // die Rennzeit läuft weiter. Danach steht das Auto auf der Strassenmitte, Tempo 0.
  // Vor dem Start (sofort zurück) und nach dem Ziel (Neustart) gilt die Wartezeit nicht.
  zurueck: {
    wartezeit: 4,              // Sekunden (3-5 sinnvoll; 0 = sofort wie früher)
    bremse: 0.7,               // so stark bremst das gesperrte Auto (0..1, wie das Bremspedal)
    oben: 3,                   // Anzeige "Zeichen + Zahl" so viele Pixel unter der Pace-Notes-Tafel (mittig)
    farbe: '#ffd23c',          // Farbe von Zeichen und Zahl
  },

  // --- Menüs, Pause, Einstellungen (Meilenstein 5a) ---------------------------------
  // Masse in Pixeln des 320x180-Bildes (Menüs bleiben immer in diesem Raster).
  menue: {
    an: true,                  // false = Spiel startet direkt ohne Titel und Menü (wie ?menue=aus in der Adresse)
    speicherName: 'alpineRally.einstellungen', // unter diesem Namen merkt sich der Browser die Einstellungen
    bestzeitenName: 'alpineRally.bestzeiten',  // Bestzeiten (Top 10 je Etappe, seit M5b gefüllt; seit M6 mit Fahrspur)
    letzterLaufName: 'alpineRally.letzterLauf', // der letzte fertige Lauf je Etappe (M6, für den Live-Vergleich)
    // Standardwerte der Einstellungen (gelten beim ersten Start und mit "STANDARD")
    standard: {
      vollbild: false,         // Vollbild an/aus (wird beim ersten Tastendruck auf dem Titel wieder eingeschaltet)
      aufloesung: 0,           // Pixelgrösse: Nummer in "aufloesungen" (0 = 320x180, Original-Look)
      einheit: 'kmh',          // 'kmh' oder 'mph'
      fps: false,              // FPS-/Debug-Anzeige (wie Taste F3)
      lenkStufe: 2,            // Lenkempfindlichkeit: Nummer in "lenkStufen" (2 = Mitte = wie bisher)
      totzoneStufe: 2,         // Gamepad-Totzone: Nummer in "totzonen" (2 = Mitte = wie bisher)
      lautstaerke: 70,         // Lautstärke in Prozent (seit M7a für den ganzen Ton; wirkt quadratisch, siehe audio.lautKurve)
      sprache: 'de',           // 'de' (Deutsch) oder 'en' (Englisch)
      // Tastenbelegung: je Aktion Taste 1 und Taste 2 (null = keine). Namen = Tasten-Codes des Browsers
      tasten: {
        gas: ['ArrowUp', 'KeyW'],
        bremse: ['ArrowDown', 'KeyS'],
        links: ['ArrowLeft', 'KeyA'],
        rechts: ['ArrowRight', 'KeyD'],
        handbremse: ['Space', null],
        zurueck: ['KeyR', null],    // zurück auf die Strasse (R)
        notes: ['KeyN', null],      // Pace-Notes an/aus (N)
        hud: ['KeyH', null],        // ganzes HUD aus/an (H, M6; wird nicht gespeichert, jeder Start mit HUD)
      },
      // Anzeige (M6)
      minimap: true,           // Minimap oben rechts an/aus
      vergleich: true,         // Live-Vergleich unter der Zeit an/aus
      vergleichMit: 'best',    // 'best' = Platz 1 der Bestzeiten, 'letzter' = der letzte fertige Lauf
    },
    aufloesungen: [[320, 180], [480, 270], [640, 360]], // 3D-Bild; HUD und Menü bleiben 320x180
    lenkStufen: [0.6, 0.8, 1, 1.25, 1.5], // Lenkempfindlichkeit: Faktor fürs Einlenken (Tastatur) und den Stick
    totzonen: [0.04, 0.08, 0.12, 0.18, 0.25], // Gamepad-Totzone je Stufe (Mitte = steuerung.totzone von früher)
    lautSchritt: 5,            // Lautstärke-Regler in Schritten von ... Prozent
    reserviert: ['Escape', 'Enter', 'NumpadEnter', 'F3'], // diese Tasten kann man nicht belegen
    // Gamepad (fest, Standard-Belegung): Knopf-Nummern
    gamepad: {
      gas: 7,                  // RT / R2 (analog)
      bremse: 6,               // LT / L2 (analog)
      handbremse: 0,           // A / Kreuz
      zurueck: 3,              // Y / Dreieck: zurück auf die Strasse (Start ist seit M5a die Pause)
      pause: 9,                // Start / Options
      bestaetigen: 0,          // Menü: A / Kreuz
      abbrechen: 1,            // Menü: B / Kreis
      hoch: 12, runter: 13, links: 14, rechts: 15, // Menü: Steuerkreuz
    },
    stickSchwelle: 0.5,        // Menü: so weit muss der Stick ausschlagen
    wiederholenNach: 0.4,      // Menü: gehaltene Richtung wiederholt nach ... Sekunden ...
    wiederholenAlle: 0.12,     // ... und dann alle ... Sekunden

    // Aussehen (wie die Zeit-Tafel des HUDs)
    farbeTafel: 'rgba(18, 24, 32, 0.86)', // dunkelblaue Tafel (etwas dichter als im HUD, für die Lesbarkeit)
    farbeRand: '#e6e2d3',      // heller Rand
    farbeText: '#f4f4ee',      // normaler Text
    farbeTitel: '#ffd23c',     // Titelzeile (gelb)
    farbeAuswahl: '#ff9a2e',   // gewählter Eintrag (orange) mit Pfeil davor
    farbeAuswahlGrund: 'rgba(255, 154, 46, 0.16)', // ... und leicht orange hinterlegt
    farbeGruppe: '#8fb4d8',    // Gruppen-Überschrift (hellblau)
    farbeWert: '#ffd23c',      // Werte (AN/AUS, 320X180 ...)
    farbeHinweis: '#aab4be',   // kleine Hinweise unten
    farbeWarnung: '#ff6a4a',   // Warnung (Taste reserviert, schon belegt)
    farbeRegler: '#56606a',    // Regler: leerer Teil
    ecke: 2,                   // abgeschrägte Ecken der Tafeln (Pixel)
    zeile: 11,                 // Höhe einer Zeile (auch Trefferfläche für Maus/Touch)
    innen: 6,                  // Rand innen links/rechts
    abdunkeln: 0.32,           // Szene hinter Titel/Hauptmenü so stark abdunkeln (0..1)
    abdunkelnPause: 0.45,      // ... hinter der Pause (eingefrorenes Bild)
    blende: 0.2,               // Übergang zwischen Seiten (Sekunden, aus- und einblenden zusammen)
    blinken: 0.55,             // "TASTE DRÜCKEN" blinkt so schnell (Sekunden an / aus)
    meldungDauer: 2.2,         // Warnung in der Tastenbelegung bleibt so lange stehen (Sekunden)
    rollenSchritt: 10,         // Textseiten (Credits): so viele Pixel rollt die Seite pro Tastendruck (M5a.1)

    // Credits (M5a.1): Namen unter "Gebaut mit Claude", ein Name pro Zeile, werden nicht übersetzt.
    // Hier weitere Namen eintragen, Grossbuchstaben, ohne Sonderzeichen. Leere Liste [] = Gruppe erscheint nicht.
    credits: {
      mitwirkende: ['LOUIS'],      // Überschrift MITWIRKENDE / CONTRIBUTORS
      unterstuetzer: ['SHAI-RON'], // Überschrift UNTERSTÜTZER / SUPPORTERS
    },

    // Demo-Fahrt hinter Titel und Hauptmenü: der Testfahrer fährt die Etappe, die Kamera wechselt
    demo: {
      profil: 'mittel',        // Fahrstil des Testfahrers: Querbeschleunigung (m/s²) und Bremsen (m/s²)
      quer: 6, bremsen: 6.5,
      endeNachZiel: 30,        // so viele Meter nach dem Ziel beginnt die Fahrt von vorn
      schwarzblende: 0.6,      // Abblenden beim Neubeginn (Sekunden)
      wechsel: 1.6,            // so lange dauert der weiche Wechsel zwischen zwei Kameras (Sekunden)
      drehGlaetten: 1.5,       // so weich folgen die Kameras der Drehung des Autos
      // Kameras: Lage relativ zum Auto (rechts, hoch, vor = Meter; negativ = links/hinten),
      // Blickziel relativ zum Auto, Dauer in Sekunden
      kameras: [
        { name: 'verfolger seitlich', pos: [3.6, 2.4, -7.5], blick: [0, 1.0, 3], dauer: 9 },
        { name: 'front tief', pos: [1.4, 0.55, 8], blick: [0, 0.8, 0], dauer: 7 },
        { name: 'vorn oben', pos: [-3, 8, 12], blick: [0, 0.5, -1], dauer: 7 },
        { name: 'berge, Auto klein', pos: [18, 10, -26], blick: [-6, 7, 30], dauer: 9 },
      ],
    },
  },

  // --- Rennablauf: Countdown, Zielbildschirm, Statistik (Meilenstein 5b) -------------
  // Masse in Pixeln des 320x180-Bildes.
  rennablauf: {
    // Countdown 3 - 2 - 1 - GO (vor jedem Start aus dem Menü, der Pause und dem Zielbildschirm)
    schnauzeVorLinie: 0.1,     // so viele Meter steht die Schnauze des Autos vor der Startlinie (Auto steht in der Mitte
                               // dann bei Startlinie - halbe Autolänge - dieser Wert). Testweg ohne Countdown: strasse.spawnBeiMeter
    zahlDauer: 1,              // jede Zahl (3, 2, 1) steht so viele Sekunden (Countdown dauert 3 x so lang)
    goDauer: 0.8,              // "GO!" steht so lange (Sekunden); das Auto ist dann schon frei, die Zeit läuft
    popDauer: 0.08,            // so lange ist jede Zahl am Anfang eine Stufe grösser ("Pop", Sekunden)
    ausblenden: 0.25,          // in den letzten ... Sekunden blendet jede Zahl aus
    groesse: 6,                // Pixelgrösse der Zahlen (6 = jeder Schriftpunkt 6x6 Pixel, Zahl 30x42 Pixel)
    hoehe: 48,                 // Zahl so viele Pixel von oben (zwischen Start-Banner und Autodach)
    farbeZahl: '#ffd23c',      // Farbe von 3, 2, 1 (gelb wie die Zeit)
    farbeGo: '#5fe35a',        // Farbe von GO! (grün)
    farbeSchatten: '#101418',  // Schatten unter den Zahlen

    // Ziel und Zielbildschirm
    zielSchirmNach: 3,         // so viele Sekunden nach der Ziellinie erscheint der Zielbildschirm (vorher: grosses "ZIEL!")
    abdunkeln: 0.45,           // Szene hinter dem Zielbildschirm so stark abdunkeln (0..1, wie die Pause)
    farbeSchneller: '#5fe35a', // schneller als die Bestzeit (grün, z. B. "-0.80")
    farbeLangsamer: '#ff5a46', // langsamer (rot, z. B. "+1.23")
    farbeGleich: '#f4f4ee',    // genau gleich schnell ("0.00")
    farbeNeu: '#ff9a2e',       // Bestzeiten-Seite: der gerade eingetragene Lauf (orange wie die Auswahl)

    // Statistik (nur im Rennen, zwischen GO und Ziel; die Demo-Fahrt zählt nichts)
    aufprallSchwelle: 3,       // Aufprall zählt ab diesem Tempo Richtung Hindernis (m/s; 3 m/s = 11 km/h)
    aufprallSperre: 0.6,       // nach einem gezählten Aufprall zählt so lange (Sekunden) kein weiterer (Entlangschleifen)

    // Fahrspur (M6): alle ... Streckenmeter wird die Rennzeit notiert (für den Live-Vergleich, mit der Bestzeit gespeichert)
    spurAbstand: 10,
  },

  // --- Ton (Meilenstein 7a, js/audio.js) ---------------------------------------------
  // Alles im Code erzeugt (Web Audio: Oszillatoren, Rauschen, Filter, Verstärker), keine Dateien, keine Samples.
  // Pegel = Verstärkung (0..1, 1 = voll), Tonhöhen in Hz, Zeiten in Sekunden, Tempo in m/s (1 m/s = 3.6 km/h).
  // Probehören ohne zu fahren: ton-labor.html (benutzt genau diesen Code und diese Werte).
  audio: {
    an: true,                  // false = gar kein Ton (wie ?ton=aus in der Adresse)
    lautKurve: 2,              // Regler LAUTSTÄRKE wirkt so: (Prozent / 100) hoch diesem Wert (2 = quadratisch, fühlt sich gleichmässig an)
    maxStimmen: 16,            // höchstens so viele einmalige Klänge gleichzeitig (Aufprall, Signale); ältere werden ausgeblendet
    glaetten: 0.03,            // Lautstärken und Tonhöhen folgen dem Spiel so weich (Zeitkonstante; nie ein Sprung, kein Knacken)
    seed: 707,                 // feste Zufallsfolge (Knallen, Aufprall-Varianten): gleiches Fahren = gleiche Töne
    pufferSchritt: 8,          // Klänge berechnen nach dem Entsperren: höchstens so viele ms am Stück, dann ist das Spiel wieder dran
    // Schienen (Busse) unter dem Lautstärke-Regler
    busse: {
      fahrzeug: 1.0,           // Motor, Reifen, Aufprall, Schleifen
      umgebung: 1.0,           // Wind (M7b: Kuhglocken, Zuschauer, Vögel)
      signale: 0.8,            // Menü, Pause, Countdown, Checkpoint, Ziel, Pace-Notes
      musik: 0.0,              // noch leer (M7b: Menü-Musik mit eigenem Regler)
    },
    // Begrenzer am Ausgang: nichts übersteuert, auch bei Vollgas, Drift und Aufprall zugleich
    limiter: { schwelle: -6, knie: 0, verhaeltnis: 20, angriff: 0.002, loslassen: 0.12 }, // dB, -, -, s, s
    // Pause: Motor stumm, Reifen und Umgebung dumpf und leiser
    pause: {
      motorAus: 0.15,          // Motor blendet in so vielen Sekunden aus
      filter: 800,             // Tiefpass auf Reifen und Umgebung (Hz)
      pegel: 0.45,             // ... und so viel leiser (Anteil)
      blende: 0.2,             // Ein-/Ausblenden der Dämpfung (Sekunden)
    },
    zielStand: { ab: 0.4, blende: 1.2 }, // Zielbildschirm: steht das Auto (unter ... m/s), blendet der Motor in ... s aus

    // Motor: 5-Zylinder-Turbo wie die Gruppe-B-Autos der 80er. Grundlage ist die Drehzahl aus dem Getriebe (getriebe.drehzahl).
    motor: {
      zuendFaktor: 2.5,        // Grundton = Drehzahl / 60 x diesem Wert (5 Zylinder, Viertakt: 5 Zündungen pro 2 Umdrehungen)
      hoechstDrehzahl: 7200,   // obere Drehzahl für den Ton (U/min; 300 Hz Grundton). Leerlauf: getriebe.leerlauf (ca. 42 Hz)
      pegel: 0.5,              // Gesamtlautstärke des Motors (der lauteste Teil)
      saege: 0.55,             // Körper: Sägezahn auf dem Grundton ...
      rechteck: 0.28,          // ... plus Rechteck (hohl, kernig) ...
      unter: 0.35,             // ... plus Dreieck auf dem halben Grundton (das typische 5-Zylinder-Brummen)
      oberwelle: 0.12,         // Brabbeln: dazu die 2. Oberwelle ...
      schwebung: 3.5,          // ... um so viele Hz verstimmt (langsames Schweben)
      amTiefe: 0.22,           // Brabbeln: Lautstärke schwankt im Takt des halben Grundtons (0 = gar nicht, 1 = sehr stark)
      amTiefeLeerlauf: 0.42,   // ... im Leerlauf stärker (unregelmässiger)
      leerlaufZittern: 0.01,   // Leerlauf: Drehzahl zittert um so viel (0.01 = 1 %)
      rauh: 0.10,              // rauhes Rauschen um die rauhOberwelle-te Oberwelle (mehr = kratziger)
      rauhOberwelle: 6,
      verzerrung: 1.8,         // leichte Sättigung (1 = sauber, mehr = rauer)
      filterGrund: 240,        // Helligkeit: Tiefpass (Hz) ohne Gas im Leerlauf ...
      filterDrehzahl: 0.30,    // ... plus so viele Hz pro U/min ...
      filterGas: 1800,         // ... plus so viele Hz mit Vollgas (unter Last heller)
      filterQ: 1.3,            // Resonanz des Tiefpasses (mehr = "röhriger")
      lastPegel: 1.0,          // Lautstärke mit Vollgas ...
      schubPegel: 0.42,        // ... ohne Gas (Schubbetrieb, Motorbremse: leiser, brummig)
      leerlaufPegel: 0.55,     // ... im Leerlauf
      drehzahlPegel: 0.35,     // bei Höchstdrehzahl so viel lauter als unten (Anteil)
      // Turbo: leises Pfeifen, folgt dem Ladedruck (läuft Gas und Drehzahl hinterher)
      turboAb: 3000,           // Ladedruck baut sich erst ab dieser Drehzahl auf ...
      turboVoll: 5500,         // ... und ist hier voll (mit Vollgas)
      turboRauf: 0.4,          // Ladedruck steigt so träge (Sekunden) ...
      turboRunter: 0.6,        // ... und fällt so träge
      turboTonMin: 2200,       // Pfeifen: Tonhöhe bei wenig Ladedruck (Hz) ...
      turboTonMax: 5200,       // ... und bei vollem
      turboPegel: 0.035,       // Lautstärke des Pfeifens bei vollem Ladedruck (leise, nie dominant)
      // Blow-off: Zischen, wenn man bei Ladedruck schnell vom Gas geht (und beim Schalten unter Last)
      blowOffAb: 0.5,          // nur bei Ladedruck über diesem Wert (0..1)
      blowOffGasFall: 0.5,     // ... und wenn das Gas in ca. blowOffZeit Sekunden um so viel gefallen ist
      blowOffZeit: 0.12,
      blowOffDauer: 0.3,       // Zischen dauert so lange
      blowOffTon: 2600,        // Mitte des Zischens (Hz), fällt auf die Hälfte
      blowOffPegel: 0.16,
      // Knallen beim Gaswegnehmen (Auspuff). Feste Zufallsfolge (audio.seed): gleiches Fahren = gleiches Knallen
      knallAb: 4000,           // nur über dieser Drehzahl
      knallChance: 0.45,       // so wahrscheinlich knallt es beim Gaswegnehmen (0..1) ...
      knallZweiter: 0.35,      // ... und so wahrscheinlich kommt ein zweiter Knall (höchstens 2)
      knallFenster: [0.05, 0.4], // der Knall kommt so viele Sekunden nach dem Gaswegnehmen (zufällig dazwischen)
      knallPegel: 0.32,
      knallSperre: 1.5,        // danach so lange kein neues Knallen (sonst nervt es)
      knall: { laenge: 0.15, knall: [1.0, 0.012, 1500], schlag: [120, 55, 0.035, 0.9] }, // Klang (wie aufprall.klang)
      // Drehzahlbegrenzer: nahe der Höchstdrehzahl mit Vollgas stottert der Motor
      begrenzerAb: 6850,       // ab dieser Drehzahl (U/min) mit Vollgas ...
      begrenzerNach: 0.12,     // ... und nach so vielen Sekunden dort (kurz vor dem Hochschalten nicht)
      begrenzerHz: 13,         // Stottern so schnell (Hz)
      begrenzerTiefe: 0.85,    // so stark (1 = ganz aus)
      // Rückwärts: Getriebeheulen dazu (Tonhöhe folgt dem Tempo)
      heulenGrund: 280,        // Tonhöhe beim Anfahren (Hz) ...
      heulenProMs: 120,        // ... plus so viele Hz pro m/s
      heulenPegel: 0.05,
    },

    // Reifen und Untergrund
    reifen: {
      bezugTempo: 30,          // bei diesem Tempo (m/s, 108 km/h) gilt der Pegel unten; schneller etwas lauter
      // Rollgeräusch je Untergrund: art = Schicht (surren = Asphalt, kies = körnig, weich = dumpf), pegel,
      // grenze = Helligkeit (Hz) im Schritttempo, grenzeTempo = so viele Hz heller pro m/s
      belaege: {
        asphalt: { art: 'surren', pegel: 0.10, grenze: 160, grenzeTempo: 22 },
        bankett: { art: 'weich', pegel: 0.12, grenze: 420, grenzeTempo: 10 },
        gras: { art: 'weich', pegel: 0.08, grenze: 240, grenzeTempo: 5 },
        schotter: { art: 'kies', pegel: 0.16, grenze: 2600, grenzeTempo: 40 },
        wiesenweg: { art: 'weich', pegel: 0.11, grenze: 340, grenzeTempo: 8 },
      },
      wechsel: 0.05,           // Überblendung beim Untergrundwechsel (Zeitkonstante; nach ca. 0.15 s fertig)
      kiesRate: 0.7,           // Kies: Abspieltempo im Schritttempo ...
      kiesRateTempo: 0.012,    // ... plus so viel pro m/s (Tonhöhe steigt leicht mit dem Tempo)
      kiesKlicks: 900,         // Kies: so viele Knackser pro Sekunde
      // Quietschen (nur auf Asphalt)
      quietschAb: 8,           // ab diesem Driftwinkel (Grad) ...
      quietschVoll: 25,        // ... voll bei diesem
      quietschTempo: [4, 14],  // unter dem ersten Tempo (m/s) nichts, ab dem zweiten voll
      quietschTon: [900, 1400], // Tonhöhe (Hz): leicht ... stark
      quietschWackeln: 60,     // der Ton schwankt um so viele Hz ...
      quietschWackelnHz: 6,    // ... so schnell
      quietschPegel: 0.09,
      handbremseQuietschen: 0.6, // Handbremse gezogen und Tempo: mindestens so viel Quietschen bzw. Rutschen (0..1)
      // Rutschen auf losem Untergrund (Schotter, Bankett, Gras, Wiesenweg): lauteres Knirschen statt Quietschen
      rutschPegel: 0.22,
      rutschGrenze: 1800,      // Mitte des Knirschens (Hz)
      // Handbremse ziehen: kurzes Ratschen
      ratschKlacks: 5,
      ratschDauer: 0.15,
      ratschPegel: 0.12,
    },

    // Fahrtwind (Schiene "umgebung": in der Pause mit gedämpft)
    wind: {
      pegel: 0.05,             // Lautstärke bei bezugTempo (wächst mit dem Quadrat des Tempos; ganz leise)
      bezugTempo: 45,          // m/s (162 km/h)
      grenze: 450,             // Helligkeit (Hz) ...
      hellAb: 33,              // ... ab diesem Tempo (m/s, ca. 120 km/h) heller ...
      hellProMs: 70,           // ... um so viele Hz pro m/s darüber
    },

    // Aufprall und Schleifen. Die Statistik "Aufpralle" zählt unabhängig davon (rennablauf.aufprallSchwelle, aufprallSperre)
    aufprall: {
      ab: 1.5,                 // Kontakt macht ab diesem Tempo Richtung Hindernis (m/s) ein Geräusch
      voll: 14,                // bei dieser Wucht (m/s, ca. 50 km/h) voller Pegel und volle Härte
      pegel: 0.9,              // Lautstärke bei voller Wucht (kurz das Lauteste)
      kurve: 0.7,              // Lautstärke = (Wucht / voll) hoch diesem Wert (unter 1: leichte Kontakte etwas lauter)
      sperre: 0.1,             // nach einem Aufprallton so lange (s) keiner (mehrere Kontakte rattern nicht)
      grenzeLeicht: 900,       // Helligkeit (Hz) beim leichten Streifschuss ...
      grenzeHart: 9000,        // ... beim harten Aufprall
      schlagAb: 6,             // ab dieser Wucht (m/s) dazu ein tiefer Schlag
      schlagPegel: 0.7,
      schlag: { laenge: 0.5, knall: [0.2, 0.01, 300], schlag: [78, 42, 0.16, 1.0] },
      // Ducking: bei hartem Aufprall werden Motor und Umgebung kurz leiser, damit der Knall durchkommt
      duckAb: 6,               // ab dieser Wucht (m/s)
      duckDb: -5,              // so viel leiser (dB)
      duckDauer: 0.3,          // so lange
      duckZurueck: 0.12,       // ... dann weich zurück (Zeitkonstante)
      // Schleifen: Auto rutscht an Wand, Leitplanke, Zaun entlang
      schleifenAb: 2,          // ab diesem Tempo (m/s)
      schleifenVoll: 15,       // voll bei diesem
      schleifenPegel: 0.18,
      // Materialien (Reihenfolge = Nummer in der Kollisionsliste) und welche Hindernis-Art welches Material ist
      materialien: ['baum', 'stein', 'holz', 'weich', 'metall', 'fels'],
      artVon: {
        baum: 'baum', tanne: 'baum', stein: 'stein', fels: 'stein', stamm: 'holz', // Bäume, Steine, Sperren
        planke: 'metall', zaun: 'holz', tor: 'holz', schild: 'metall',              // Strassenrand, Absperrungen
        band: 'weich', reifen: 'weich', heu: 'weich', stroh: 'weich', heurolle: 'weich', kuh: 'weich',
        zuschauer: 'weich', posten: 'weich', wegweiser: 'holz', steinmann: 'stein', findling: 'stein', bande: 'holz',
        banner: 'metall', fahne: 'metall', flagge: 'metall', stuhl: 'metall', markise: 'metall', wrack: 'metall',
        bogen: 'metall', uhr: 'metall',
      },
      // Klang je Material (einmal berechnet). laenge = Ausklingzeit (s). knall: [Pegel, Abklingen s, Helligkeit Hz],
      // moden: Eigentöne [Hz, Abklingen s, Pegel], schlag: tiefer Schlag [Hz Anfang, Hz Ende, Abklingen s, Pegel],
      // rascheln: Knistern/Splittern/Schleifen [Pegel, Dauer s, Knackser pro s]
      klang: {
        baum: { laenge: 0.7, knall: [0.5, 0.02, 2200], moden: [[180, 0.08, 0.2], [330, 0.06, 0.12]], schlag: [95, 55, 0.12, 0.8], rascheln: [0.4, 0.6, 450] },
        stein: { laenge: 0.45, knall: [0.9, 0.012, 7000], moden: [[820, 0.07, 0.35], [1270, 0.05, 0.3], [2140, 0.04, 0.2], [3300, 0.03, 0.12]], schlag: [140, 90, 0.05, 0.4], rascheln: [0.25, 0.25, 900] },
        holz: { laenge: 0.55, knall: [0.7, 0.015, 4000], moden: [[230, 0.09, 0.3], [410, 0.07, 0.22], [690, 0.05, 0.15]], schlag: [110, 70, 0.08, 0.5], rascheln: [0.55, 0.35, 1500] },
        weich: { laenge: 0.4, knall: [0.4, 0.04, 600], moden: [], schlag: [80, 50, 0.15, 0.9], rascheln: [0.15, 0.2, 200] },
        metall: { laenge: 1.1, knall: [0.8, 0.01, 8000], moden: [[340, 0.5, 0.25], [523, 0.45, 0.22], [817, 0.4, 0.2], [1180, 0.35, 0.16], [1690, 0.3, 0.12], [2410, 0.25, 0.08]], schlag: [120, 80, 0.06, 0.4], rascheln: [0.2, 0.3, 600] },
        fels: { laenge: 0.8, knall: [0.5, 0.03, 1500], moden: [[95, 0.15, 0.3]], schlag: [60, 38, 0.2, 1.0], rascheln: [0.45, 0.6, 300] },
      },
      // Schleifen je Material: [Mitte Hz, Güte] (Bandpass auf Rauschen)
      schleifen: { baum: [1200, 2], stein: [1500, 2], holz: [900, 2.5], weich: [300, 1], metall: [2600, 4], fels: [500, 1.2] },
    },

    // Signale: kurze Töne im Retro-Stil (form: 'square' = Rechteck, 'triangle' = Dreieck, 'sine' = Sinus).
    // ton: Tonhöhe (Hz) oder [Anfang, Ende], dauer (s), pegel (mal signale.pegel und busse.signale)
    signale: {
      pegel: 0.5,
      menue: {
        tick: { form: 'square', ton: 1800, dauer: 0.018, pegel: 0.10 },        // Auswahl bewegen (sehr leise)
        bestaetigen: { form: 'square', ton: [660, 990], dauer: 0.07, pegel: 0.22 }, // höherer Blip
        zurueck: { form: 'square', ton: [520, 350], dauer: 0.07, pegel: 0.20 },  // tieferer Blip
        regler: { form: 'triangle', ton: [300, 1200], dauer: 0.035, pegel: 0.2 }, // Tick, Tonhöhe je nach Wert (min..max)
        fehler: { form: 'square', ton: [140, 118], dauer: 0.18, pegel: 0.22 },  // "SCHON BELEGT", "RESERVIERT"
        sperre: 0.045,         // derselbe Menü-Ton höchstens alle ... s (kein Doppelton, wenn Maus und Tastatur dasselbe tun)
      },
      pause: { form: 'square', ton: [440, 262], dauer: 0.12, pegel: 0.25 },    // beim Pausieren (tief)
      weiter: { form: 'square', ton: [262, 523], dauer: 0.12, pegel: 0.25 },   // beim Weiterfahren (hoch)
      countdown: { form: 'square', ton: 440, dauer: 0.15, pegel: 0.32 },      // 3, 2, 1
      go: { form: 'square', ton: 880, dauer: 0.4, pegel: 0.34 },              // GO!
      checkpoint: {
        form: 'triangle', dauer: 0.09, luecke: 0.035, pegel: 0.3,             // zwei Töne ("Ding-Ding")
        schneller: [880, 1319],  // aufsteigend
        langsamer: [740, 622],   // leicht absteigend und tiefer
        neutral: [880, 880],     // gleich schnell oder keine Referenz
      },
      verpasst: { form: 'square', ton: [130, 92], dauer: 0.38, pegel: 0.28 }, // CHECKPOINT VERPASST: tiefer Buzz
      paceNote: { form: 'sine', ton: 1200, dauer: 0.05, pegel: 0.12, abstand: 0.09 }, // pro neuer Kachel (abstand: zweite Kachel im selben Bild)
      // Ziel-Fanfaren (eigene Melodien): [Note, Schläge]; 'R' = Pause. tempo in Schlägen pro Minute
      fanfare: {
        pegel: 0.3, tempo: 165,
        kurz: {   // beim Überfahren der Ziellinie (ca. 2 s)
          melodie: [['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 1], ['E5', 0.5], ['G5', 0.5], ['C6', 2.5]],
          zweite: [['R', 3.5], ['E5', 2.5]],
          bass: [['C3', 1.5], ['G2', 1.5], ['C3', 3]],
        },
        lang: {   // NEUE BESTZEIT, zum Zielbildschirm (ca. 3.5 s)
          melodie: [['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 0.5], ['B5', 0.5], ['G5', 0.5], ['A5', 1],
            ['F5', 0.5], ['A5', 0.5], ['C6', 0.5], ['D6', 0.5], ['E6', 3]],
          zweite: [['R', 2], ['D5', 0.5], ['E5', 0.5], ['F5', 1], ['R', 2], ['G5', 3]],
          bass: [['C3', 2], ['G2', 2], ['F2', 2], ['C3', 3]],
        },
      },
    },

    // Nur für tools/ton-test.mjs: erwartete Lautstärke (RMS) der Klänge, offline gerechnet (Bereich [min, max])
    pruefung: {
      rmsMotor: [0.03, 0.45], rmsKlang: [0.01, 0.5], spitzeMax: 0.98,
    },
  },

  // --- Optik am Auto -----------------------------------------------------
  autoOptik: {
    rollen: 0.012,             // Karosserie neigt sich in Kurven (pro m/s²)
    nicken: 0.008,             // Karosserie nickt beim Bremsen/Gas
    blobSchatten: true,        // dunkler Fleck unter dem Auto
    radEinschlagMax: 35,       // so weit (Grad) drehen die Vorderräder sichtbar höchstens ein (nur Optik)
  },
};
