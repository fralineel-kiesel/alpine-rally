// Strecke "Skigebiet" (seit M11b, ersetzt den Gletscher) – reine Daten, Format: docs/strecken-format.md
// Skigebiet an einem strahlenden Tag: Start im Dorf bei der Talstation, schmale Pistenraupen-Zufahrt mit Spitzkehren
// steil den Hang hoch, Bergstation, Grat mit Ausblick, steile Abfahrt mit Kuppen und Funpark-Kickern, Ziel in der
// Zielarena im Talboden. Der Verlauf kommt aus tools/skigebiet-entwurf.mjs (Gerade / Kurve mit Radius, Höhenprofil):
// dort ändern, nicht hier.

export default {
  format: 1,
  id: 'skigebiet',
  etappe: 'skigebiet',        // Kennung für Bestzeiten und letzten Lauf – nie ändern (sonst sind die Bestzeiten weg)
  revision: 1,                 // Verlauf-Stand: neuer Verlauf = neue Zahl, alte Bestzeiten zählen dann nicht mehr
  name: { de: 'SKIGEBIET', en: 'SKI RESORT' },
  beschreibung: { de: 'SCHNEE, STEIL, SPRÜNGE', en: 'SNOW, STEEP, JUMPS' },
  untergrundInfo: { de: 'SCHNEE', en: 'SNOW' },
  laenge: 1164.098,              // Meter (Kontrolle: das Spiel rechnet nach, mehr als 0.5 m daneben = Fehlerseite)

  // Deko-Sets: was der Spielcode malt (Pixelbilder im Code)
  deko: {
    fahne: 'schweiz',          // Schweizer Fahnen bei den Zuschauern
    tier: 'steinbock',         // Steinböcke am Hang (reine Deko)
    tierKlang: null,           // ... ohne Ton (keine Glocken)
    haus: 'alphuette',         // Berghütte
    stadel: 'heustadel',       // kleiner Holzschopf
    nadelbaum: 'kiefer',       // (M11a.1: keine Bäume mehr auf der Etappe; nur noch für Sperren, die es hier nicht gibt)
    laubbaum: 'laub',          // (keine Laubbäume: laubProKm 0)
    unterholz: null,
    tierschild: 'allgemein',
  },

  sprung: [],

  // --- Zufallszahlen (gleiche Zahl = gleiche Welt) ---
  seeds: {
    gelaende: 3210, sprites: 3211, buesche: 3212, fernwald: 3213, berge: 3214, kuehe: 3215, nebenwegWald: 3216,
    stummelSichtschutz: 3217, absperrung: 3218, sperren: 3219, strassenrand: 3220, startZiel: 3221, leben: 3222,
    lebenZaun: 3223, lebenKuehe: 3224, umgebung: 3225,
  },

  // --- Abschnitte (baeume, wald, nah, voegel; keine Vögel im Hochgebirge) ---
  // --- Abschnitte (baeume, wald, nah, voegel) ---
  abschnitte: {
    'Dorf': { baeume: 0, wald: 0, voegel: 0 },
  },

  punkte: [
    // <punkte> (geschrieben von tools/skigebiet-entwurf.mjs – Entwurf dort ändern)
    'Dorf',
    [0.0, 0.0, 0.00],
    // gerade 300 m
    [0.0, -25.0, 0.00],
    [0.0, -50.0, 0.00],
    [0.0, -75.0, 0.00],
    [0.0, -100.0, 0.00],
    [0.0, -125.0, 0.00],
    [0.0, -150.0, 0.00],
    [0.0, -175.0, 0.00],
    [0.0, -200.0, 0.00],
    [0.0, -225.0, 0.00],
    [0.0, -250.0, 0.00],
    [0.0, -275.0, 0.00],
    [0.0, -300.0, 0.00],
    // Kurve rechts 60°, Radius 150 m
    [2.3, -326.0, 0.00],
    [9.0, -351.3, 0.00],
    [20.1, -375.0, 0.00],
    [35.1, -396.4, 0.00],
    [53.6, -414.9, 0.00],
    [75.0, -429.9, 0.00],
    // gerade 250 m
    [96.7, -442.4, 0.00],
    [118.3, -454.9, 0.00],
    [140.0, -467.4, 0.00],
    [161.6, -479.9, 0.00],
    [183.3, -492.4, 0.00],
    [204.9, -504.9, 0.00],
    [226.6, -517.4, 0.00],
    [248.2, -529.9, 0.00],
    [269.9, -542.4, 0.00],
    [291.5, -554.9, 0.00],
    // Kurve links 60°, Radius 150 m
    [312.9, -569.9, 0.00],
    [331.4, -588.4, 0.00],
    [346.4, -609.8, 0.00],
    [357.5, -633.5, 0.00],
    [364.2, -658.8, 0.00],
    [366.5, -684.8, 0.00],
    // gerade 300 m
    [366.5, -709.8, 0.00],
    [366.5, -734.8, 0.00],
    [366.5, -759.8, 0.00],
    [366.5, -784.8, 0.00],
    [366.5, -809.8, 0.00],
    [366.5, -834.8, 0.00],
    [366.5, -859.8, 0.00],
    [366.5, -884.8, 0.00],
    [366.5, -909.8, 0.00],
    [366.5, -934.8, 0.00],
    [366.5, -959.8, 0.00],
    [366.5, -984.8, 0.00],
    // </punkte>
  ],

  strasse: { startBeiMeter: 25, zielVorEnde: 45, spawnBeiMeter: 10 },
  // Rand (M11a.1): keine Leitplanken; neben der Strasse Tiefschnee (bremst stark, keine Strafe, wie Gras in den Alpen),
  // Schneestangen markieren den Rand; der weiche Schneewall (js/schneewall.js) steht nur noch in den Hohlwegen als Bank
  strassenrand: { ohnePlanke: [[0, 4400, -1], [0, 4400, 1]], ohneZaun: true, tiefschnee: true, schneewall: { an: true, ohne: [], nurHohlwege: true } },
  checkpoints: [300, 600, 900],
  nebenwege: [],
  belagAbschnitte: [
    { von: 0, bis: 99999, belag: 'schnee' },
  ],

  umgebung: {
    farben: {
      himmelOben: '#2a63c9',     // tiefblauer Himmel
      dunst: '#cfe2f6',          // klarer, heller Horizont (= Nebelfarbe)
      gras: '#eef3f9',           // Schneehänge (das Gelände)
      grasDunkel: '#d7e1ee',
      fels: '#4b4f58',           // dunkler Fels als Kontrast
      felsDunkel: '#33363d',
      erde: '#8a909a',
      bankett: '#aab6c6',        // festgefahrener, grauer Schneerand
      asphalt: '#4a4c50',
      mittellinie: '#d8d4c8',
      schotter: '#9a9184',       // Moränen-Schotter, grau
      schotterSpur: '#7f776c',
      wiesenweg: '#8a7d6a',
      wiesenwegSpur: '#76695a',
      wiesenwegGras: '#c9d4e2',
      bergFels: '#55617a',       // ferne Gipfel
      bergFuss: '#7c889c',
      schnee: '#f7faff',
      // M11a: Schneestrasse und Eis (js/pixel.js schneeTextur/eisTextur): Fahrbahn grauer als die Hänge, dunkle Spurrillen
      schneeWeg: '#a0abbc',      // (M11a: vorher #c2ccd9, im Gegenlicht nur 20 Stufen; M11a.1: #a8b3c3 → etwas dunkler, 600 m nur 38)
      schneeSpur: '#646f80',
      schneeGlitzer: '#ffffff',
      eisWeg: '#6fa3d2',         // (vorher #8fbde3)
      eisGlanz: '#d8ecff',
      eisRiss: '#5f93c4',
      // M11a.1: Eisseen (js/eissee.js): hellblau, schon von weitem klar anders als die graue Schneestrasse
      seeEis: '#549ce6',         // Grund des Sees
      seeEisHell: '#76b2ec',     // hellere Flecken
      seeRand: '#4f8ed2',        // zum Ufer hin (dickes Eis) ...
      seeRandDunkel: '#3d70a8',  // ... ganz aussen und die Kante
      seeRissDunkel: '#355f92',  // Risse: dunkle Linie ...
      seeRissHell: '#eef8ff',    // ... mit heller Kante
      seeStaub: '#e9f1f9',       // Schneestaub auf dem Eis
      seeGlanz: '#d6edff',       // glänzende Streifen
    },
    licht: {
      sonneStaerke: 2.3,         // Mittagssonne ...
      sonneFarbe: '#fff4e6',     // ... fast weiss
      sonneRichtung: [0.35, 0.82, 0.45], // hoch im Süden
      umgebungStaerke: 1.0,
      umgebungFarbe: '#a9c1ea',  // bläuliches Himmelslicht (Schattenseiten)
    },
    nebel: { start: 160, ende: 3400, maxDichte: 0.32, bergDunst: 0.18, bergDunstUnten: 0.15 }, // klare Sicht
    // M11a.1: Talkessel – vier Reihen (Alpen: zwei), höhere Gipfel, Schnee in drei Weisstönen, dunkler Fels im Schnee,
    // blaue Gletscherzungen zur Strecke hin, Gipfelkreuz auf dem Berg beim Ziel
    berge: {
      anzahl: 28, abstand: [1200, 2000], hoehe: [1000, 1800], bezugsAbstand: 3300, schneeAb: 0.22, fussBis: 0.5,
      reihen: [{ r: 1.15, h: 1.1, n: 30 }, { r: 1, h: 0.9, n: 28 }, { r: 0.86, h: 0.62, n: 24 }, { r: 0.74, h: 0.4, n: 20 }],
      extra: {
        schneeStufen: ['#f7faff', '#dde7f3', '#c2d0e3'], felsImSchnee: 0.12, eis: '#7db5e8', zungeAlle: 4,
        gipfelkreuz: { hoehe: 60, dicke: 6, farbe: '#3a2a1e' }, // (gross: der Berg ist ca. 2 km weit weg)
      },
    },
    fernwald: { waldFarbe: '#56625c', waldDunkel: '#3f4944', wiesenFarbe: '#e3eaf3', geroellFarbe: '#7a808b', baeume: false, faerben: false }, // M11a.1: kein Wald, keine Fernbäume
    gelaende: { huegelHoehe: 5, grundWeite: 250, wandBerg: 0, talTiefe: 0, randAnstiegAb: 320, randAnstiegBis: 950, randHoehe: 110 },
    landschaft: [],
    boeschung: { schulter: 3, steigung: 0.28, weich: 5, reichweite: 40 },
  },

  // Kunst-Schatten: Mittagssonne aus Süden (kurz wie in den Alpen), bläulich auf dem Schnee (farbe, M11a)
  schatten: { sonne: 170, laenge: 0.7, dunkelheit: 0.55, steine: true, farbe: '#3a5c9a' },

  // --- Natur: über der Baumgrenze (M11a.1: keine Bäume mehr), viele Steine und Findlinge ---
  natur: {
    sprites: { tannenProKm: 0, laubProKm: 0, steineProKm: 1100, mindestAbstand: 12, waldAbstand: 12 },
    buesche: { an: false, blueten: 0, beeren: 0 },
    kuehe: {                   // (Tiere: Steinböcke, deko.tier)
      anzahl: 4, einzeln: 2, anteilTal: 1, alpAb: 999, alpBreite: [20, 40], passBei: 2000,
      zusatzHerden: [],
    },
    nebenwegWaldGruppen: [],
  },

  // --- Start (Talstation) und Ziel (Bergstation) ---
  startZiel: {
    start: {
      form: { gerade: 80, kurve: -40, radius: 60, rest: 50, kuppe: 0.5, abfall: 0.04, seitenschutz: 'zaun', sichtschutz: 0, sichtschutzSeed: 3601 },
      sperreBei: 34, sperreBogen: 1.6, sperreUeber: 0.3, sperreArt: 'band',
    },
    ziel: {
      form: { gerade: 170, kurve: 40, radius: 60, rest: 55, kuppe: 0.5, abfall: 0.04, seitenschutz: 'zaun', sichtschutz: 0, sichtschutzSeed: 3602 },
      sperreBei: 150, sperreBogen: 2.0, sperreUeber: 0.3, sperreArt: 'reifen',
    },
    landschaft: {
      gruppen: [], // M11a.1: keine Bäume an der Talstation (stattdessen Findlinge, leben.wiesenweg.findlinge)
      proGruppe: [1, 3], gruppeRadius: 6, laubAnteil: 0, strasse: 12, buesche: 0, buschLat: [8, 30],
    },
  },

  // --- Leben: Berghütte, Bergstation, Zuschauer in Winterjacken, Steinböcke ---
  leben: {
    an: true,
    sichtweite: 600, abstandStrasse: 7, pufferNichtSchneiden: 20, pufferSchneiden: 50, innenRadius: 130, innenVorNach: 20, innenBreite: 60,
    zaeune: [],
    torAlle: [24, 40], tor: [4, 5.5],
    kuehe: {
      herdenAbstand: 30,
      herden: [],
    },
    wiesenweg: {
      holzstapel: false,
      haeuser: [],
      stege: [], boote: [], holzstapelOrte: [], briefkaesten: [], holzzaeune: [], parkwagen: [], heurollen: [],
      findlinge: [],
    },
    fans: {
      abstand: 7.2, gruppe: [3, 7], gruppeLaenge: 6, radius: 0.35, dicht: 0.75, blickStreuung: 0.6,
      posen: [0.2, 0.16, 0.14, 0.22, 0.08, 0.1, 0.1],
      kinder: 0.1,
      spots: [],
    },
    wracks: [],
    kreisRadius: 0.92, postenJacken: ['#ff6a10', '#e2f02a'], postenFahne: '#f4d21a',
    rauch: { anzahl: 0, leben: 5, steigen: 0.5, groesse: [0.5, 1.9], dichte: 0.38, farbe: '#a9a7a2', wind: [0.35, 0.15] },
  },

  // --- Beschriftungen (erfundene Namen) ---
  beschriftung: {
    banner: {},
    wegweiser: ['BERGSTATION 2 KM', 'TALSTATION', 'ZIELARENA 4 KM'],
    sponsoren: [
      ['FIRNWERK', '#1f4f9e', '#f2f0e8'], ['PULVERBRÄU', '#c8202a', '#f2f0e8'], ['EISKRISTALL', '#7fb8e6', '#13233a'], ['BERGFUNK', '#f0c020', '#1c1c1c'],
    ],
  },

  // --- Umgebungsklang: pfeifender Wind (Böen auf der Hochebene), sonst Stille, ferne Zuschauer ---
  klang: {
    publikumOrte: {
      start: { staerke: 0.8, von: -70, bis: 70 },
      ziel: { staerke: 0.9, von: -70, bis: 350 },
    },
    boeenAbschnitt: 'Dorf', // Windböen (pfeifender Wind) auf der Hochebene
    wasser: [],
  },

  abkuerzung: { immerSperren: [], immerFrei: [], sperrThemen: {} },

  // --- Von Werkzeugen erzeugt – bitte nicht von Hand ändern ---
  erzeugt: {
    // <erzeugt abkuerzungen>
    // Automatisch erzeugt von tools/abkuerzungen.mjs – bitte nicht von Hand ändern.
    // Neu erzeugen (z. B. nach Änderungen an Strecke, Gelände, Bäumen oder an
    // "abkuerzung" in config.js):
    //   node tools/abkuerzungen.mjs
    //
    // sperren: wo Abkürzungs-Sperren stehen. s = Streckenmeter, seite = +1 rechts / -1 links
    //   (Kurveninnenseite), von/bis = Abstand zur Strassenmitte (Meter). Wie die Sperren
    //   aussehen, steht in config.js unter "sperren".
    // Seit Meilenstein 1.2 wird nur ein Teil der Kurven gesperrt (config.js: abkuerzung.sperrQuote,
    // immerSperren, immerFrei, pflichtGewinn, pflichtZeit). Für die Pace-Notes (Meilenstein 4):
    // nichtSchneiden: gesperrte Kurven (Sperren stehen) -> Pace-Note "nicht schneiden".
    // schneiden: freie Kurven ohne Sperren, in denen Schneiden etwas bringt (Gewinn mindestens
    //   minGewinn Meter Weg gegenüber der Strassenmitte) -> Pace-Note "schneiden".
    //   sVon/sBis = Streckenmeter, seite = Kurveninnenseite, gewinn = gesparte Meter.
    abkuerzungen: {
      streckenLaenge: 1164.1,
      minGewinn: 3,
      sperren: [
      ],
      nichtSchneiden: [
      ],
      schneiden: [
      ],
    },
    // </erzeugt>
    // <erzeugt kurvenTempo>
    // Automatisch erzeugt von tools/pacenotes-test.mjs --schreiben – bitte nicht von Hand ändern.
    // Neu erzeugen nach Änderungen an Strecke, Belägen oder Fahrphysik: node tools/pacenotes-test.mjs --schreiben
    //
    // Grenztempo jeder Kurve (km/h), gemessen mit der echten Fahrphysik: Der Testfahrer hält ein festes Tempo
    // und folgt der Strassenmitte; das grösste Tempo, bei dem er ohne Aufprall und höchstens 1 m auf dem
    // Bankett durchkommt. Gilt für den Belag der Kurve (Schotter, Wiesenweg). kmh: null = Vollgas (die Kurve
    // bremst nicht). von/bis = Streckenmeter (so findet js/pacenotes.js die Kurve wieder).
    // Daraus macht js/pacenotes.js die Stufe 1-6 (Grenzen: config.js, pacenotes.stufenGrenzen).
    kurvenTempo: {
      kurven: [
        { von: 290, bis: 467, kmh: 95.8 }, // rechts 61°, Radius 123 m, schnee
        { von: 698, bis: 874, kmh: 96.2 }, // links 60°, Radius 123 m, schnee
      ],
    },
    // </erzeugt>
  },
};
