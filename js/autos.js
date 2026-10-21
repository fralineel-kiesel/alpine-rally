// Modelldaten der Autos (seit M8a). js/car.js baut daraus das 3D-Modell (baueAuto), ohne eigenes Wissen über ein
// bestimmtes Auto. Ein weiteres Auto = ein weiterer Eintrag hier (die Garage zeigt alle in dieser Reihenfolge), dazu
// Texte in js/texte.js (auto.<id>.name, auto.<id>.daten1/2), Lackierungen und ein Fahrprofil in js/config.js.
// M8c: Masse je Auto (Felswand, Kollision, Staub hängen am gewählten Modell), Kurzname für die Bestzeiten.
//
// Koordinaten in Metern, Auto schaut nach +z (vorne), +x = links (Fahrerseite), y = Höhe über dem Boden.
// Farben stehen als Namen: zuerst die Farben der Lackierung (config.js, autoOptik.lackierungen), sonst die festen
// Farben (autoOptik.farben). Alle Texte nur mit Zeichen der Pixelschrift (js/pixel.js).
//
// teile: Formen, aus denen die Karosserie zusammengesetzt wird (alles wird zu wenigen Geometrien zusammengefasst):
//   prisma   Umriss in der Seitenansicht [[z, y], ...], quer von x[0] bis x[1] gezogen (spiegeln: auch auf der anderen Seite)
//   quader   Kiste von min [x, y, z] bis max [x, y, z]
//   trapez   Kiste mit schrägen Seiten: unten/oben je [y, halbe Breite, z vorne, z hinten] (Kabine, Flügel, Hutze)
//            scheiben: ['vorne', 'hinten'] (M8d) = Front-/Heckfläche nimmt die Farbe immer aus der Ansicht vorne/hinten
//            (für flache Scheiben, deren Normale eher nach oben zeigt; ohne die Option zählt die Richtung der Normale)
//   zylinder Achse 'x' oder 'z', mitte [x, y, z], radius, laenge, segmente
//   slot: 'lack' = Lackierung (Textur je Blickrichtung), 'fluegel' = eigene Fläche oben, sonst eine feste Farbe
//   licht: 'vorne' (Scheinwerfer), 'hinten' (Rücklicht/Bremslicht), 'rueck' (Rückfahrlicht) = eigene, unbeleuchtete Teile
// bemalung: wird in die Lack-Textur gemalt. Ansichten: seite (z, y, auf beiden Seiten), oben (x, z), vorne (x, y),
//   hinten (x, y), fluegel (x, z). lesbarVon: von wo man einen Text auf "oben"/"fluegel" lesen kann (vorne/hinten).
//   abBreite: erst ab dieser Bildbreite (480 = 480x270) malen – kleine Schrift wird bei 320x180 nur Pixelrauschen.
//   Flächen, die nach vorne/hinten schauen, aber mitten im Auto liegen (Radlauf-Wände, Enden der Kotflügel und
//   Schweller), sind dunkel (radhaus) statt bemalt.

const bogen = (zMitte, yMitte, r, n) => {
  // Radlauf-Bogen von vorne (z gross) über oben nach hinten, n Stücke
  const p = [];
  for (let k = 0; k <= n; k++) {
    const w = (Math.PI * k) / n;
    p.push([zMitte + r * Math.cos(w), yMitte + r * Math.sin(w)]);
  }
  return p;
};
// Kotflügel-Verbreiterung: Kiste von zVon bis zBis (oben schräg: yObenVorne, yObenHinten) mit Radlauf-Ausschnitt
const kotfluegel = (zRad, r, zVon, zBis, yUnten, yObenVorne, yObenHinten) => [
  [zVon, yUnten], [zRad + r, yUnten], ...bogen(zRad, 0.33, r, 6), [zRad - r, yUnten], [zBis, yUnten], [zBis, yObenHinten], [zVon, yObenVorne],
];

// Lanza 073 (M8f): Oberkante des Motordeckels (Mitte) und der Hinterkotflügel (Kamm) in der Seitenansicht, [z, y] von
// hinten nach vorne. Der Deckel fällt durchgehend nach hinten ab, der Kamm steht über dem Rad etwas höher als der Deckel.
const L073_DECKEL = [[-1.75, 0.86], [-1.45, 0.91], [-1.15, 0.957], [-0.9, 0.998], [-0.7, 1.03]];
const L073_KAMM = [[-1.9, 0.865], [-1.72, 0.925], [-1.5, 0.96], [-1.25, 0.985], [-1.02, 0.995], [-0.82, 0.965], [-0.6, 0.9]];

export const AUTO_MODELLE = {
  rt4: {
    id: 'rt4',
    name: 'AUDAN QUARTO',       // Anzeigename (M8b; die Id rt4 bleibt, daran hängen Bestzeiten und Fahrprofil)
    fahrprofil: 'rt4',          // Fahrprofil in config.js (fahrprofile)
    nummer: '4',                // Startnummer (Türen, Dach, Motorhaube)
    kennzeichen: 'AQ 4',        // erfundenes Kennzeichen (hinten)
    kurz: 'QUARTO',             // M8c: Kurzname in den Bestzeiten (so schmal, dass die Zeile bei 320x180 passt)
    lackierungen: ['werk', 'gletscher', 'dunkel'], // Lackierungen aus config.js, autoOptik.lackierungen
    // Masse (Kollision, Felswand, Staub und Physik hängen daran; car.js prüft sie nicht, tools/auto-test.mjs schon)
    // (M8c: laenge/breite = Hülle für die Felswand; der Radstand der Physik steht im Fahrprofil, auto.radstand)
    masse: { laenge: 4.48, breite: 1.86, radstand: 2.52, spur: 1.6, radRadius: 0.33 },
    kollision: { laenge: 4.4, breite: 1.8 }, // M8c: Rechteck mit runden Ecken gegen Bäume, Steine, Zäune (kollision.js)
    staub: { hinten: 1.3, seite: 0.75 },     // M8c: Staub tritt so weit hinter der Mitte und so weit seitlich aus (Hinterräder)
    schwerpunktHoehe: 0.5,      // um diesen Punkt (Höhe) neigt sich die Karosserie (Federung)
    auspuff: [{ x: 0.52, y: 0.25, z: -2.24 }], // M8e: Enden der Auspuffrohre (dort kommt beim Poppen die Flamme heraus)
    raeder: {
      x: 0.8, z: 1.26,          // Radmitten bei (±x, Radius, ±z)
      radius: 0.33, breite: 0.24, felgeRadius: 0.2, felgeTiefe: 0.03, segmente: 14, speichen: 5,
      radlaufLuft: 0.09,        // so weit (m) darf ein Radlauf beim Einfedern höchstens herunterkommen (Radlauf 0.44 m, eckig)
    },
    // Lack-Textur: Pixel je Meter je Ansicht (Heck und Front feiner, die sieht man am meisten), bemalbar bis zur Höhe
    // hoeheBis (m); der Heckflügel hat oben einen eigenen Streifen von fluegelZ[0] bis fluegelZ[1] (z, Meter)
    textur: { breite: 512, hoehe: 128, seite: 32, oben: 32, vorne: 48, hinten: 48, fluegel: 32, hoeheBis: 1.44, fluegelZ: [-1.66, -2.26] },
    // Schattenfleck unter dem Auto (Meter)
    schatten: { breite: 2.0, laenge: 4.5 },
    // Flächen nach vorne/hinten zwischen z = ±zBis und unter yBis (Radlauf-Wände, Enden der Kotflügel) in dieser Farbe
    innenFlaechen: { zBis: 1.95, yBis: 0.86, farbe: 'radhaus' },
    // werte (M8c, Garage, 1 bis 10): aus den Messungen von tools/auto-messung.mjs abgeleitet (siehe WERTE_VORSCHRIFT unten)
    werte: { beschleunigung: 7, tempo: 6, grip: 8, drift: 5 },

    teile: [
      // --- Unterbau: Seitenansicht mit keilförmiger Motorhaube und zwei Radläufen ---
      {
        art: 'prisma', slot: 'lack', x: [-0.86, 0.86],
        profil: [
          [2.12, 0.2], [1.7, 0.2], ...bogen(1.26, 0.33, 0.44, 6), [0.82, 0.2],
          [-0.82, 0.2], ...bogen(-1.26, 0.33, 0.44, 6), [-1.7, 0.2],
          [-2.12, 0.2], [-2.12, 0.86], [-1.08, 0.86], [0.7, 0.86], [2.12, 0.7],
        ],
      },
      // Radhäuser innen (dunkel, damit man nicht quer durch das Auto sieht; Platz für den Lenkeinschlag)
      { art: 'quader', slot: 'radhaus', min: [-0.45, 0.2, 0.86], max: [0.45, 0.73, 1.66] },
      { art: 'quader', slot: 'radhaus', min: [-0.45, 0.2, -1.66], max: [0.45, 0.73, -0.86] },
      // Kastenkotflügel vorne und hinten (breiter als der Körper, Räder stehen sichtbar im Radlauf)
      { art: 'prisma', slot: 'lack', x: [0.86, 0.93], spiegeln: true, profil: kotfluegel(1.26, 0.44, 1.86, 0.68, 0.24, 0.72, 0.8) },
      { art: 'prisma', slot: 'lack', x: [0.86, 0.93], spiegeln: true, profil: kotfluegel(-1.26, 0.44, -0.66, -2.12, 0.24, 0.8, 0.8) }, // bis ans Heck: von hinten sieht man die Verbreiterung
      // Seitenschweller zwischen den Rädern
      { art: 'quader', slot: 'lack', spiegeln: true, min: [0.86, 0.2, -0.66], max: [0.905, 0.34, 0.66] },
      // Kabine: steile Frontscheibe, kantiges Dach, Heckscheibe
      { art: 'trapez', slot: 'lack', unten: [0.86, 0.8, 0.7, -1.08], oben: [1.34, 0.62, 0.3, -0.74], ohne: ['unten'] },
      // Dachlufthutze (Öffnung vorne wird schwarz gemalt)
      { art: 'trapez', slot: 'lack', unten: [1.34, 0.2, 0.22, -0.2], oben: [1.395, 0.17, 0.05, -0.2], ohne: ['unten'] },
      // Frontschürze mit Lufteinlässen, Splitter, Heckschürze
      { art: 'quader', slot: 'lack', min: [-0.86, 0.2, 2.08], max: [0.86, 0.44, 2.2] },
      { art: 'quader', slot: 'schwarz', min: [-0.88, 0.17, 2.06], max: [0.88, 0.2, 2.23] },
      { art: 'quader', slot: 'lack', min: [-0.93, 0.18, -2.2], max: [0.93, 0.46, -2.08] },
      // Aussenspiegel (Gehäuse und Fuss)
      { art: 'quader', slot: 'akzent', spiegeln: true, min: [0.81, 0.93, 0.48], max: [0.92, 1.03, 0.57] },
      { art: 'quader', slot: 'schwarz', spiegeln: true, min: [0.74, 0.96, 0.5], max: [0.81, 0.99, 0.55] },
      // Heckflügel auf zwei Stützen, mit Endplatten
      { art: 'trapez', slot: 'fluegel', unten: [1.12, 0.89, -1.8, -2.17], oben: [1.17, 0.89, -1.78, -2.17] },
      { art: 'quader', slot: 'akzent', spiegeln: true, min: [0.89, 0.99, -2.19], max: [0.925, 1.23, -1.74] },
      { art: 'quader', slot: 'schwarz', spiegeln: true, min: [0.48, 0.86, -2.04], max: [0.53, 1.12, -1.9] },
      // Schlammlappen hinter den Rädern
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.62, 0.07, 0.83], max: [0.92, 0.46, 0.85] },
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.62, 0.07, -1.68], max: [0.92, 0.46, -1.66] },
      // Auspuff-Endrohr links (Fahrerseite = +x)
      { art: 'zylinder', slot: 'chrom', achse: 'z', mitte: [0.52, 0.25, -2.16], radius: 0.045, laenge: 0.16, segmente: 6 },
      // Abschlepp-Öse vorne rechts (rot)
      { art: 'quader', slot: 'rot', min: [-0.48, 0.2, 2.18], max: [-0.42, 0.25, 2.235] },
      // Gehäuse der vier Zusatzscheinwerfer (Gruppe-B-Look)
      ...[0.15, 0.43].flatMap((x) => [x, -x]).map((x) => ({
        art: 'zylinder', slot: 'schwarz', achse: 'z', mitte: [x, 0.52, 2.165], radius: 0.1, laenge: 0.09, segmente: 8,
      })),

      // --- Lichter (unbeleuchtete, helle Flächen; eigene Teile) ---
      { art: 'quader', licht: 'vorne', farbe: 'scheinwerfer', spiegeln: true, min: [0.6, 0.5, 2.12], max: [0.84, 0.61, 2.13] },
      ...[0.15, 0.43].flatMap((x) => [x, -x]).map((x) => ({
        art: 'zylinder', licht: 'vorne', farbe: 'zusatzscheinwerfer', achse: 'z', mitte: [x, 0.52, 2.212], radius: 0.078, laenge: 0.006, segmente: 8,
      })),
      { art: 'quader', licht: 'hinten', spiegeln: true, min: [0.35, 0.565, -2.128], max: [0.9, 0.69, -2.12] },
      { art: 'quader', licht: 'rueck', min: [-0.27, 0.59, -2.126], max: [-0.15, 0.665, -2.12] },
    ],

    bemalung: [
      // --- Seite (beide Seiten; Texte stehen für den Betrachter immer richtig herum) ---
      { art: 'rechteck', ansicht: 'seite', von: [-2.3, 0], bis: [2.3, 0.4], farbe: 'unten' },       // Unterteil
      { art: 'rechteck', ansicht: 'seite', von: [-2.3, 0.55], bis: [2.3, 0.7], farbe: 'streifen0' },   // Seitenstreifen (so hoch wie das Rücklicht-Band)
      { art: 'rechteck', ansicht: 'seite', von: [-2.3, 0.505], bis: [2.3, 0.54], farbe: 'streifen1' }, // zweiter, dünner Streifen
      { art: 'ring', ansicht: 'seite', mitte: [1.26, 0.33], r: [0.4, 0.49], farbe: 'kante' },     // Radlauf-Kanten
      { art: 'ring', ansicht: 'seite', mitte: [-1.26, 0.33], r: [0.4, 0.49], farbe: 'kante' },
      // Türfugen und Türgriff (eine lange Coupé-Tür)
      { art: 'rechteck', ansicht: 'seite', von: [0.655, 0.36], bis: [0.685, 0.85], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.48, 0.36], bis: [-0.45, 1.32], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.42, 0.77], bis: [-0.3, 0.8], farbe: 'fuge' },
      // Seitenscheiben (dunkel) mit Rahmen in Wagenfarbe: grosse Türscheibe, kleines Fenster dahinter
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[0.6, 0.9], [0.3, 1.285], [-0.4, 1.285], [-0.4, 0.9]] },
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[-0.53, 0.9], [-0.53, 1.285], [-0.72, 1.285], [-0.98, 0.9]] },
      { art: 'rechteck', ansicht: 'seite', von: [-0.4, 1.24], bis: [0.33, 1.27], farbe: 'glasHell' },
      // Helme (Fahrer links, Beifahrer rechts; man sieht jeweils den Kopf auf der eigenen Seite), Visier nach vorne.
      // M8b: kleiner und in gedeckten Farben (nur dezent zu ahnen); schulter = [Breite, Höhe] der Schultern mal r
      { art: 'helm', ansicht: 'seite', nur: 'links', mitte: [-0.15, 1.08], r: 0.085, farbe: 'helmFahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'seite', nur: 'rechts', mitte: [-0.15, 1.08], r: 0.085, farbe: 'helmBeifahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      // Startnummer auf der Tür (auf dem Streifen), Sponsoren
      { art: 'nummer', ansicht: 'seite', mitte: [0.22, 0.62] },
      { art: 'text', ansicht: 'seite', text: 'AUDAN', mitte: [0, 0.29], farbe: 'sponsorHell', abBreite: 480 }, // (schräg von hinten bei 320x180 nur Rauschen)

      // --- Oben ---
      { art: 'nummer', ansicht: 'oben', mitte: [0, 1.36], lesbarVon: 'vorne' },
      { art: 'text', ansicht: 'oben', text: 'MURMELI', mitte: [0, 1.88], lesbarVon: 'vorne', farbe: 'sponsor0', abBreite: 480 },
      { art: 'rechteck', ansicht: 'oben', von: [-0.2, 0.05], bis: [0.2, 0.22], farbe: 'schwarz' }, // Öffnung der Dachhutze
      { art: 'rechteck', ansicht: 'oben', von: [-0.16, 0.08], bis: [0.16, 0.1], farbe: 'gitter' },
      { art: 'nummer', ansicht: 'oben', mitte: [0, -0.44], lesbarVon: 'hinten' },
      // Heckdeckel: ein ruhiger Farbblock (Sponsor-Feld), Schrift darauf erst ab 640 Pixel Breite (sonst nur Rauschen)
      { art: 'rechteck', ansicht: 'oben', von: [-0.8, -1.16], bis: [0.8, -2.06], farbe: 'sponsorFeld' },
      { art: 'text', ansicht: 'oben', text: 'SENNEREI', mitte: [0, -1.3], lesbarVon: 'hinten', farbe: 'sponsorFeldSchrift', abBreite: 640 },
      { art: 'text', ansicht: 'oben', text: 'HÖCHI', mitte: [0, -1.53], lesbarVon: 'hinten', farbe: 'sponsorFeldSchrift', abBreite: 640 },
      // Lüftungsschlitze auf der Motorhaube
      { art: 'rechteck', ansicht: 'oben', von: [0.3, 0.86], bis: [0.62, 0.92], farbe: 'gitter', spiegeln: true },

      // --- Vorne ---
      { art: 'polygon', ansicht: 'vorne', farbe: 'glas', punkte: [[-0.72, 0.89], [0.72, 0.89], [0.565, 1.285], [-0.565, 1.285]] },
      { art: 'helm', ansicht: 'vorne', mitte: [0.36, 1.04], r: 0.08, farbe: 'helmFahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'vorne', mitte: [-0.36, 1.04], r: 0.08, farbe: 'helmBeifahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'rechteck', ansicht: 'vorne', von: [-0.6, 1.15], bis: [0.6, 1.3], farbe: 'banner' }, // Sonnenstreifen
      { art: 'text', ansicht: 'vorne', text: 'AUDAN', mitte: [0, 1.225], farbe: 'bannerSchrift', abBreite: 480 }, // (AUDAN QUARTO wäre 71 Pixel, der Streifen hat 58)
      { art: 'rechteck', ansicht: 'vorne', von: [-0.58, 0.46], bis: [0.58, 0.63], farbe: 'gitter' },      // Kühlergrill
      { art: 'rechteck', ansicht: 'vorne', von: [0.57, 0.48], bis: [0.87, 0.63], farbe: 'schwarz', spiegeln: true }, // Scheinwerfer-Rahmen
      { art: 'rechteck', ansicht: 'vorne', von: [-0.9, 0], bis: [0.9, 0.44], farbe: 'unten' },           // Frontschürze
      { art: 'rechteck', ansicht: 'vorne', von: [-0.48, 0.22], bis: [0.48, 0.36], farbe: 'gitter' },     // Kühllufteinlass
      { art: 'rechteck', ansicht: 'vorne', von: [0.6, 0.24], bis: [0.8, 0.34], farbe: 'gitter', spiegeln: true },

      // --- Hinten ---
      // Heckscheibe: ruhig und dunkel (M8b: keine Köpfe mehr, die wirkten von hinten wie helle Punkte), oben ein
      // dezenter Glanzstreifen wie an den Seitenscheiben
      { art: 'polygon', ansicht: 'hinten', farbe: 'glas', punkte: [[-0.72, 0.89], [0.72, 0.89], [0.565, 1.285], [-0.565, 1.285]] },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.5, 1.23], bis: [0.5, 1.255], farbe: 'glasHell' },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.95, 0.55], bis: [0.95, 0.7], farbe: 'schwarz' },     // Rücklicht-Band
      { art: 'rechteck', ansicht: 'hinten', von: [-0.34, 0.57], bis: [0.34, 0.685], farbe: 'heckblende' },
      { art: 'text', ansicht: 'hinten', text: 'TALWERK', mitte: [0, 0.78], farbe: 'sponsor0', abBreite: 480 },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.95, 0], bis: [0.95, 0.46], farbe: 'schwarz' },       // Heckschürze
      { art: 'kennzeichen', ansicht: 'hinten', mitte: [0, 0.33] },

      // --- Heckflügel oben ---
      { art: 'rechteck', ansicht: 'fluegel', von: [-0.9, -2.2], bis: [0.9, -2.1], farbe: 'akzent' },
    ],
  },  // Lanza Delto (Id delto, M8c): kantiger Kompakt-Allrad im Gruppe-B/A-Look (Delta-Typ, eigenes Design, kein Nachbau).
  // Fliessheck mit steiler Heckklappe und Dachspoiler, breite Kastenkotflügel, Haube mit Wölbung und Lüftungsschlitzen,
  // zwei grosse Scheinwerfer und zwei runde Zusatzscheinwerfer in der Schürze, Heckwischer, Auspuff rechts.
  delto: {
    id: 'delto',
    name: 'LANZA DELTO',
    fahrprofil: 'delto',
    nummer: '3',
    kennzeichen: 'LD 3',
    kurz: 'DELTO',
    lackierungen: ['deltoWerk', 'rosso', 'waldgruen'],
    masse: { laenge: 4.03, breite: 1.8, radstand: 2.48, spur: 1.52, radRadius: 0.325 },
    kollision: { laenge: 3.95, breite: 1.74 },
    staub: { hinten: 1.28, seite: 0.71 },
    schwerpunktHoehe: 0.5,
    auspuff: [{ x: -0.5, y: 0.24, z: -2.005 }], // M8e: Enden der Auspuffrohre (dort kommt beim Poppen die Flamme heraus)
    raeder: {
      x: 0.76, z: 1.24,
      radius: 0.325, breite: 0.23, felgeRadius: 0.2, felgeTiefe: 0.03, segmente: 14, speichen: 6,
      radlaufLuft: 0.08,
    },
    textur: { breite: 512, hoehe: 128, seite: 32, oben: 32, vorne: 48, hinten: 48, fluegel: 32, hoeheBis: 1.47, fluegelZ: [-1.34, -1.78] },
    schatten: { breite: 1.95, laenge: 4.05 },
    innenFlaechen: { zBis: 1.9, yBis: 0.86, farbe: 'radhaus' },
    // werte (Garage, 1 bis 10): aus tools/auto-messung.mjs abgeleitet, Rechenvorschrift bei WERTE_VORSCHRIFT unten
    werte: { beschleunigung: 8, tempo: 3, grip: 8, drift: 7 },

    teile: [
      // --- Unterbau: kurze, hohe Schnauze, Gürtellinie fast waagrecht bis zur Heckklappe ---
      {
        art: 'prisma', slot: 'lack', x: [-0.84, 0.84],
        profil: [
          [1.96, 0.2], [1.66, 0.2], ...bogen(1.24, 0.33, 0.42, 6), [0.82, 0.2],
          [-0.82, 0.2], ...bogen(-1.24, 0.33, 0.42, 6), [-1.66, 0.2],
          [-1.96, 0.2], [-1.96, 0.9], [0.74, 0.9], [1.9, 0.8], [1.96, 0.72],
        ],
      },
      { art: 'quader', slot: 'radhaus', min: [-0.45, 0.2, 0.84], max: [0.45, 0.72, 1.64] },
      { art: 'quader', slot: 'radhaus', min: [-0.45, 0.2, -1.64], max: [0.45, 0.72, -0.84] },
      // breite Kastenkotflügel vorne und hinten (Räder stehen sichtbar in den Radläufen)
      { art: 'prisma', slot: 'lack', x: [0.84, 0.9], spiegeln: true, profil: kotfluegel(1.24, 0.43, 1.86, 0.6, 0.22, 0.74, 0.8) },
      { art: 'prisma', slot: 'lack', x: [0.84, 0.9], spiegeln: true, profil: kotfluegel(-1.24, 0.43, -0.6, -1.92, 0.22, 0.82, 0.82) },
      // Seitenschweller
      { art: 'quader', slot: 'lack', spiegeln: true, min: [0.84, 0.2, -0.6], max: [0.875, 0.32, 0.6] },
      // Kabine: Frontscheibe schräg, langes flaches Dach, steile Heckklappe bis fast ans Heck (Fliessheck)
      // (scheiben, M8d: die flache Frontscheibe holt ihre Farbe aus der Ansicht vorne, die Heckklappe aus hinten)
      { art: 'trapez', slot: 'lack', unten: [0.9, 0.8, 0.78, -1.92], oben: [1.41, 0.66, 0.14, -1.54], ohne: ['unten'], scheiben: ['vorne', 'hinten'] },
      // Dachspoiler an der Hinterkante des Dachs (von hinten klar zu sehen)
      { art: 'trapez', slot: 'fluegel', unten: [1.39, 0.66, -1.36, -1.56], oben: [1.45, 0.7, -1.38, -1.74] },
      // Motorhaube mit Wölbung (Lüftungsschlitze werden aufgemalt)
      { art: 'trapez', slot: 'lack', unten: [0.86, 0.5, 1.78, 0.9], oben: [0.92, 0.38, 1.68, 0.96], ohne: ['unten'] },
      // Front- und Heckschürze
      { art: 'quader', slot: 'lack', min: [-0.88, 0.18, 1.94], max: [0.88, 0.44, 2.0] },
      { art: 'quader', slot: 'schwarz', min: [-0.86, 0.16, 1.93], max: [0.86, 0.19, 2.01] },
      { art: 'quader', slot: 'lack', min: [-0.9, 0.18, -2.0], max: [0.9, 0.46, -1.94] },
      // Aussenspiegel
      { art: 'quader', slot: 'akzent', spiegeln: true, min: [0.79, 0.95, 0.5], max: [0.89, 1.04, 0.58] },
      { art: 'quader', slot: 'schwarz', spiegeln: true, min: [0.72, 0.97, 0.52], max: [0.79, 1.0, 0.56] },
      // Schlammlappen
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.6, 0.07, 0.8], max: [0.88, 0.44, 0.82] },
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.6, 0.07, -1.66], max: [0.88, 0.44, -1.64] },
      // Auspuff rechts (Beifahrerseite = -x)
      { art: 'zylinder', slot: 'chrom', achse: 'z', mitte: [-0.5, 0.24, -1.975], radius: 0.045, laenge: 0.06, segmente: 6 },
      // Abschlepp-Öse vorne links
      { art: 'quader', slot: 'rot', min: [0.46, 0.2, 1.99], max: [0.52, 0.25, 2.02] },
      // Gehäuse der zwei runden Zusatzscheinwerfer in der Schürze
      ...[0.36, -0.36].map((x) => ({ art: 'zylinder', slot: 'schwarz', achse: 'z', mitte: [x, 0.31, 2.0], radius: 0.085, laenge: 0.04, segmente: 8 })),

      // --- Lichter ---
      // zwei grosse Scheinwerfer (rechteckig, fast so breit wie die halbe Front)
      { art: 'quader', licht: 'vorne', farbe: 'scheinwerfer', spiegeln: true, min: [0.38, 0.53, 1.96], max: [0.78, 0.66, 1.968] },
      ...[0.36, -0.36].map((x) => ({ art: 'zylinder', licht: 'vorne', farbe: 'zusatzscheinwerfer', achse: 'z', mitte: [x, 0.31, 2.022], radius: 0.068, laenge: 0.004, segmente: 8 })),
      { art: 'quader', licht: 'hinten', spiegeln: true, min: [0.4, 0.6, -1.968], max: [0.84, 0.74, -1.96] },
      { art: 'quader', licht: 'rueck', min: [0.18, 0.62, -1.966], max: [0.32, 0.7, -1.96] },
    ],

    bemalung: [
      // --- Seite ---
      { art: 'rechteck', ansicht: 'seite', von: [-2.1, 0], bis: [2.1, 0.38], farbe: 'unten' },
      { art: 'rechteck', ansicht: 'seite', von: [-2.1, 0.62], bis: [2.1, 0.74], farbe: 'streifen0' },
      { art: 'rechteck', ansicht: 'seite', von: [-2.1, 0.56], bis: [2.1, 0.6], farbe: 'streifen1' },
      { art: 'ring', ansicht: 'seite', mitte: [1.24, 0.33], r: [0.39, 0.47], farbe: 'kante' },
      { art: 'ring', ansicht: 'seite', mitte: [-1.24, 0.33], r: [0.39, 0.47], farbe: 'kante' },
      // vier Türen (Fugen) und Türgriffe
      { art: 'rechteck', ansicht: 'seite', von: [0.64, 0.36], bis: [0.67, 0.88], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.42, 0.36], bis: [-0.39, 1.36], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-1.2, 0.42], bis: [-1.17, 0.9], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.32, 0.8], bis: [-0.22, 0.83], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-1.1, 0.8], bis: [-1.0, 0.83], farbe: 'fuge' },
      // Seitenscheiben: vordere Tür, hintere Tür, kleines Fenster an der Heckklappe
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[0.7, 0.95], [0.22, 1.36], [-0.35, 1.36], [-0.35, 0.95]] },
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[-0.47, 0.95], [-0.47, 1.36], [-1.12, 1.36], [-1.12, 0.95]] },
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[-1.24, 1.02], [-1.24, 1.33], [-1.36, 1.33], [-1.52, 1.02]] }, // (breite C-Säule)
      { art: 'rechteck', ansicht: 'seite', von: [-0.35, 1.31], bis: [0.26, 1.34], farbe: 'glasHell' },
      // Helme (nur dezent, nur seitlich und vorne)
      { art: 'helm', ansicht: 'seite', nur: 'links', mitte: [-0.12, 1.12], r: 0.08, farbe: 'helmFahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'seite', nur: 'rechts', mitte: [-0.12, 1.12], r: 0.08, farbe: 'helmBeifahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'nummer', ansicht: 'seite', mitte: [0.12, 0.68] },
      { art: 'text', ansicht: 'seite', text: 'TALBANK', mitte: [0, 0.28], farbe: 'sponsorHell', abBreite: 480 }, // zwischen den Radläufen

      // --- Oben ---
      { art: 'nummer', ansicht: 'oben', mitte: [0, -0.5], lesbarVon: 'hinten' },
      { art: 'nummer', ansicht: 'oben', mitte: [0, 0.4], lesbarVon: 'vorne' },
      // Lüftungsschlitze links und rechts auf der Haubenwölbung
      ...[1.05, 1.17, 1.29, 1.41].map((z) => ({ art: 'rechteck', ansicht: 'oben', von: [0.14, z], bis: [0.36, z + 0.05], farbe: 'gitter', spiegeln: true })),
      // Heckklappe oben (schräg, von hinten zu sehen): ruhiger Farbblock
      { art: 'rechteck', ansicht: 'oben', von: [-0.62, -1.62], bis: [0.62, -1.9], farbe: 'sponsorFeld' },

      // --- Vorne ---
      { art: 'polygon', ansicht: 'vorne', farbe: 'glas', punkte: [[-0.72, 0.93], [0.72, 0.93], [0.6, 1.37], [-0.6, 1.37]] },
      { art: 'helm', ansicht: 'vorne', mitte: [0.33, 1.07], r: 0.075, farbe: 'helmFahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'vorne', mitte: [-0.33, 1.07], r: 0.075, farbe: 'helmBeifahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'rechteck', ansicht: 'vorne', von: [-0.64, 1.22], bis: [0.64, 1.37], farbe: 'banner' },
      { art: 'text', ansicht: 'vorne', text: 'ALPENKRAFT', mitte: [0, 1.295], farbe: 'bannerSchrift', abBreite: 480 },
      { art: 'rechteck', ansicht: 'vorne', von: [-0.36, 0.53], bis: [0.36, 0.66], farbe: 'gitter' },          // Kühlergrill
      { art: 'rechteck', ansicht: 'vorne', von: [0.36, 0.51], bis: [0.8, 0.68], farbe: 'schwarz', spiegeln: true }, // Scheinwerfer-Rahmen
      { art: 'rechteck', ansicht: 'vorne', von: [-0.9, 0], bis: [0.9, 0.44], farbe: 'unten' },              // Schürze
      { art: 'rechteck', ansicht: 'vorne', von: [-0.2, 0.24], bis: [0.2, 0.38], farbe: 'gitter' },          // Lufteinlass Mitte

      // --- Hinten ---
      // Heckscheibe (ruhig und dunkel, keine Köpfe) mit Heckwischer
      { art: 'polygon', ansicht: 'hinten', farbe: 'glas', punkte: [[-0.7, 0.95], [0.7, 0.95], [0.6, 1.37], [-0.6, 1.37]] },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.5, 1.32], bis: [0.5, 1.345], farbe: 'glasHell' },
      { art: 'polygon', ansicht: 'hinten', farbe: 'wischer', punkte: [[-0.02, 0.97], [0.02, 0.97], [0.48, 1.2], [0.46, 1.23]] },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.04, 0.95], bis: [0.04, 1.0], farbe: 'schwarz' },     // Wischer-Achse
      { art: 'rechteck', ansicht: 'hinten', von: [-0.9, 0.58], bis: [0.9, 0.76], farbe: 'schwarz' },     // Rücklicht-Band
      { art: 'text', ansicht: 'hinten', text: 'SCHNEEFINK', mitte: [0, 0.83], farbe: 'sponsor0', abBreite: 480 },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.95, 0], bis: [0.95, 0.46], farbe: 'unten' },        // Heckschürze
      { art: 'kennzeichen', ansicht: 'hinten', mitte: [0, 0.32] },

      // --- Dachspoiler oben ---
      { art: 'rechteck', ansicht: 'fluegel', von: [-0.72, -1.7], bis: [0.72, -1.74], farbe: 'akzent' },
    ],
  },  // Fard Escorta (Id escorta, M8c): kastiges Rallye-Coupé der 70er/80er mit Hinterradantrieb (Escort-Typ, eigenes
  // Design). Drei Kästen (flache Haube, Kabine, Kofferraum), gerade schmale Karosserie mit dezent verbreiterten
  // Kotflügeln, zwei runde Scheinwerfer und zwei Zusatzscheinwerfer im Kühlergrill, kleine Spoilerlippe, keine Dachhutze,
  // verchromte Stossstangen, Auspuff hinten links.
  escorta: {
    id: 'escorta',
    name: 'FARD ESCORTA',
    fahrprofil: 'escorta',
    nummer: '5',
    kennzeichen: 'FE 5',
    kurz: 'ESCORTA',
    lackierungen: ['escortaWerk', 'kanarie', 'tannengruen'],
    masse: { laenge: 4.1, breite: 1.76, radstand: 2.4, spur: 1.48, radRadius: 0.325 },
    kollision: { laenge: 4.02, breite: 1.7 },
    staub: { hinten: 1.24, seite: 0.69 },
    schwerpunktHoehe: 0.48,
    auspuff: [{ x: 0.52, y: 0.2, z: -2.05 }], // M8e: Enden der Auspuffrohre (dort kommt beim Poppen die Flamme heraus)
    raeder: {
      x: 0.74, z: 1.2,
      radius: 0.325, breite: 0.22, felgeRadius: 0.19, felgeTiefe: 0.03, segmente: 14, speichen: 4,
      radlaufLuft: 0.08,
    },
    textur: { breite: 512, hoehe: 128, seite: 32, oben: 32, vorne: 48, hinten: 48, fluegel: 32, hoeheBis: 1.38, fluegelZ: [-1.86, -2.02] },
    schatten: { breite: 1.9, laenge: 4.1 },
    innenFlaechen: { zBis: 1.9, yBis: 0.82, farbe: 'radhaus' },
    werte: { beschleunigung: 3, tempo: 2, grip: 6, drift: 10 },

    teile: [
      // --- Unterbau: flache Haube und flacher Kofferraum auf gleicher Höhe (Stufenheck) ---
      {
        art: 'prisma', slot: 'lack', x: [-0.82, 0.82],
        profil: [
          [1.98, 0.22], [1.62, 0.22], ...bogen(1.2, 0.33, 0.41, 6), [0.79, 0.22],
          [-0.79, 0.22], ...bogen(-1.2, 0.33, 0.41, 6), [-1.62, 0.22],
          [-1.98, 0.22], [-1.98, 0.8], [-1.9, 0.84], [1.9, 0.84], [1.98, 0.8],
        ],
      },
      { art: 'quader', slot: 'radhaus', min: [-0.44, 0.22, 0.82], max: [0.44, 0.7, 1.58] },
      { art: 'quader', slot: 'radhaus', min: [-0.44, 0.22, -1.58], max: [0.44, 0.7, -0.82] },
      // dezent verbreiterte Kotflügel (schmaler als beim Audan, runde Radläufe)
      { art: 'prisma', slot: 'lack', x: [0.82, 0.88], spiegeln: true, profil: kotfluegel(1.2, 0.42, 1.68, 0.72, 0.26, 0.68, 0.68) },
      { art: 'prisma', slot: 'lack', x: [0.82, 0.88], spiegeln: true, profil: kotfluegel(-1.2, 0.42, -0.72, -1.7, 0.26, 0.68, 0.68) },
      // Kabine: Frontscheibe, gerades Dach, schräge Heckscheibe zum Kofferraum
      // (scheiben, M8d: Front- und Heckscheibe holen ihre Farbe aus der Ansicht vorne bzw. hinten, egal wie flach)
      { art: 'trapez', slot: 'lack', unten: [0.84, 0.76, 0.86, -1.16], oben: [1.34, 0.64, 0.22, -0.66], ohne: ['unten'], scheiben: ['vorne', 'hinten'] },
      // kleine Spoilerlippe am Kofferraum (statt grossem Flügel)
      { art: 'trapez', slot: 'fluegel', unten: [0.84, 0.74, -1.86, -1.98], oben: [0.9, 0.74, -1.9, -2.0] },
      // Stossstangen (verchromt) vorne und hinten, Frontschürze darunter
      { art: 'quader', slot: 'chrom', min: [-0.86, 0.26, 1.97], max: [0.86, 0.36, 2.05] },
      { art: 'quader', slot: 'chrom', min: [-0.86, 0.26, -2.05], max: [0.86, 0.36, -1.97] },
      { art: 'quader', slot: 'schwarz', min: [-0.8, 0.16, 1.9], max: [0.8, 0.24, 1.99] },
      // Aussenspiegel (rund, auf der Tür)
      { art: 'quader', slot: 'chrom', spiegeln: true, min: [0.79, 0.88, 0.62], max: [0.86, 0.95, 0.7] },
      // Schlammlappen
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.58, 0.07, 0.76], max: [0.84, 0.42, 0.78] },
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.58, 0.07, -1.64], max: [0.84, 0.42, -1.62] },
      // Auspuff links (Fahrerseite = +x)
      { art: 'zylinder', slot: 'chrom', achse: 'z', mitte: [0.52, 0.2, -1.99], radius: 0.04, laenge: 0.12, segmente: 6 },
      // Gehäuse der runden Scheinwerfer und der Zusatzscheinwerfer im Grill
      ...[0.58, -0.58].map((x) => ({ art: 'zylinder', slot: 'schwarz', achse: 'z', mitte: [x, 0.6, 1.98], radius: 0.12, laenge: 0.03, segmente: 10 })),
      ...[0.27, -0.27].map((x) => ({ art: 'zylinder', slot: 'schwarz', achse: 'z', mitte: [x, 0.6, 1.985], radius: 0.08, laenge: 0.03, segmente: 8 })),

      // --- Lichter ---
      ...[0.58, -0.58].map((x) => ({ art: 'zylinder', licht: 'vorne', farbe: 'scheinwerfer', achse: 'z', mitte: [x, 0.6, 1.997], radius: 0.1, laenge: 0.004, segmente: 10 })),
      ...[0.27, -0.27].map((x) => ({ art: 'zylinder', licht: 'vorne', farbe: 'zusatzscheinwerfer', achse: 'z', mitte: [x, 0.6, 2.002], radius: 0.064, laenge: 0.004, segmente: 8 })),
      { art: 'quader', licht: 'hinten', spiegeln: true, min: [0.5, 0.48, -1.988], max: [0.8, 0.76, -1.98] },
      { art: 'quader', licht: 'rueck', spiegeln: true, min: [0.38, 0.5, -1.986], max: [0.48, 0.58, -1.98] },
    ],

    bemalung: [
      // --- Seite ---
      { art: 'rechteck', ansicht: 'seite', von: [-2.1, 0], bis: [2.1, 0.36], farbe: 'unten' },
      { art: 'rechteck', ansicht: 'seite', von: [-2.1, 0.6], bis: [2.1, 0.7], farbe: 'streifen0' },
      { art: 'rechteck', ansicht: 'seite', von: [-2.1, 0.54], bis: [2.1, 0.57], farbe: 'streifen1' },
      { art: 'ring', ansicht: 'seite', mitte: [1.2, 0.33], r: [0.38, 0.46], farbe: 'kante' },
      { art: 'ring', ansicht: 'seite', mitte: [-1.2, 0.33], r: [0.38, 0.46], farbe: 'kante' },
      // lange Coupé-Tür mit Griff
      { art: 'rechteck', ansicht: 'seite', von: [0.7, 0.38], bis: [0.73, 0.82], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.52, 0.38], bis: [-0.49, 1.3], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.44, 0.76], bis: [-0.32, 0.79], farbe: 'chrom' },
      // Seitenscheiben: Türscheibe und kleines Seitenfenster hinten
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[0.76, 0.88], [0.26, 1.29], [-0.44, 1.29], [-0.44, 0.88]] },
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[-0.58, 0.88], [-0.58, 1.29], [-0.7, 1.29], [-1.06, 0.88]] },
      { art: 'rechteck', ansicht: 'seite', von: [-0.44, 1.25], bis: [0.3, 1.28], farbe: 'glasHell' },
      // Helme (dezent, nur seitlich und vorne)
      { art: 'helm', ansicht: 'seite', nur: 'links', mitte: [-0.2, 1.05], r: 0.08, farbe: 'helmFahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'seite', nur: 'rechts', mitte: [-0.2, 1.05], r: 0.08, farbe: 'helmBeifahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'nummer', ansicht: 'seite', mitte: [0.2, 0.65] },
      { art: 'text', ansicht: 'seite', text: 'SENNHOF', mitte: [0, 0.27], farbe: 'sponsorHell', abBreite: 480 }, // zwischen den Radläufen

      // --- Oben ---
      { art: 'rechteck', ansicht: 'oben', von: [-0.88, 0.84], bis: [0.88, 1.99], farbe: 'haube' },  // Haube (Werk: blau)
      { art: 'rechteck', ansicht: 'oben', von: [-0.66, 0.24], bis: [0.66, -0.68], farbe: 'dach' },  // Dach (Tannengrün: weiss)
      { art: 'nummer', ansicht: 'oben', mitte: [0, 1.4], lesbarVon: 'vorne' },
      { art: 'nummer', ansicht: 'oben', mitte: [0, -0.24], lesbarVon: 'hinten' },
      { art: 'text', ansicht: 'oben', text: 'MURMELI', mitte: [0, 1.82], lesbarVon: 'vorne', farbe: 'sponsor0', abBreite: 480 },
      { art: 'rechteck', ansicht: 'oben', von: [-0.7, -1.3], bis: [0.7, -1.75], farbe: 'sponsorFeld' },  // Kofferraum
      { art: 'text', ansicht: 'oben', text: 'SENNHOF', mitte: [0, -1.52], lesbarVon: 'hinten', farbe: 'sponsorFeldSchrift', abBreite: 640 },

      // --- Vorne ---
      { art: 'polygon', ansicht: 'vorne', farbe: 'glas', punkte: [[-0.7, 0.88], [0.7, 0.88], [0.6, 1.3], [-0.6, 1.3]] },
      { art: 'helm', ansicht: 'vorne', mitte: [0.32, 1.02], r: 0.075, farbe: 'helmFahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'vorne', mitte: [-0.32, 1.02], r: 0.075, farbe: 'helmBeifahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'rechteck', ansicht: 'vorne', von: [-0.62, 1.16], bis: [0.62, 1.3], farbe: 'banner' },
      { art: 'text', ansicht: 'vorne', text: 'BERGBLICK', mitte: [0, 1.23], farbe: 'bannerSchrift', abBreite: 480 },
      { art: 'rechteck', ansicht: 'vorne', von: [-0.8, 0.44], bis: [0.8, 0.76], farbe: 'gitter' },        // breiter Kühlergrill
      { art: 'rechteck', ansicht: 'vorne', von: [-0.9, 0], bis: [0.9, 0.26], farbe: 'unten' },

      // --- Hinten ---
      { art: 'polygon', ansicht: 'hinten', farbe: 'glas', punkte: [[-0.68, 0.88], [0.68, 0.88], [0.6, 1.3], [-0.6, 1.3]] },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.48, 1.25], bis: [0.48, 1.275], farbe: 'glasHell' },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.84, 0.46], bis: [0.84, 0.78], farbe: 'schwarz' },     // Heckblende mit Lichtern
      { art: 'rechteck', ansicht: 'hinten', von: [-0.9, 0], bis: [0.9, 0.26], farbe: 'unten' },
      { art: 'kennzeichen', ansicht: 'hinten', mitte: [0, 0.62] },                                       // zwischen den Rücklichtern

      // --- Spoilerlippe oben ---
      { art: 'rechteck', ansicht: 'fluegel', von: [-0.74, -1.97], bis: [0.74, -2.0], farbe: 'akzent' },
    ],
  },  // Lanza 073 (Id l073, M8e): flaches, kurzes Mittelmotor-Coupé der Gruppe B (037-Typ, eigenes Design, kein Nachbau).
  // Niedrige Keilnase, Kabine weit vorne mit grossen Scheiben, dahinter der Motordeckel mit Lüftungsschlitzen,
  // Lufteinlässe seitlich hinter den Türen, deutlich breitere Hinterkotflügel und Hinterräder, Doppelauspuff in der
  // Mitte hinten, kein Heckfenster. M8f: Heck als Keil statt Pritsche – der Deckel fällt nach hinten ab (ca. 9°), die
  // Hinterkotflügel stehen als Kamm seitlich darüber (Tal in der Mitte), kurze Rückwand, Heckflügel auf zwei Stützen.
  l073: {
    id: 'l073',
    name: 'LANZA 073',
    fahrprofil: 'l073',
    nummer: '7',
    kennzeichen: 'LZ 7',
    kurz: '073',
    lackierungen: ['l073Werk', 'l073Nacht', 'l073Eis'],
    masse: { laenge: 3.95, breite: 1.82, radstand: 2.42, spur: 1.48, radRadius: 0.33 },
    kollision: { laenge: 3.88, breite: 1.76 },
    staub: { hinten: 1.24, seite: 0.74 },
    schwerpunktHoehe: 0.44,
    auspuff: [{ x: 0.1, y: 0.3, z: -2.05 }, { x: -0.1, y: 0.3, z: -2.05 }], // M8e: Enden der Auspuffrohre (dort kommt beim Poppen die Flamme heraus)
    raeder: {
      x: 0.74, z: 1.21,
      radius: 0.33, breite: 0.22, felgeRadius: 0.21, felgeTiefe: 0.03, segmente: 14, speichen: 5,
      breiteHinten: 0.28, xHinten: 0.77, // M8e: hinten breitere Reifen und weiter aussen (breite Hinterkotflügel)
      radlaufLuft: 0.08,
    },
    textur: { breite: 512, hoehe: 128, seite: 32, oben: 32, vorne: 48, hinten: 48, fluegel: 32, hoeheBis: 1.28, fluegelZ: [-1.72, -2.02] },
    schatten: { breite: 1.95, laenge: 4.0 },
    innenFlaechen: { zBis: 1.88, yBis: 0.86, farbe: 'radhaus' },
    werte: { beschleunigung: 9, tempo: 4, grip: 6, drift: 10 }, // (Drift gerechnet 14.5, auf 10 begrenzt)

    teile: [
      // --- Unterbau: flache Keilnase, Gürtellinie tief bei der Kabine, dahinter der Motordeckel ---
      // M8f: der Deckel fällt von ca. 1.03 m an der Kabine leicht gewölbt auf ca. 0.83 m am Heck, kurze Rückwand
      {
        art: 'prisma', slot: 'lack', x: [-0.82, 0.82],
        profil: [
          [1.975, 0.22], [1.64, 0.22], ...bogen(1.21, 0.33, 0.43, 6), [0.78, 0.22],
          [-0.78, 0.22], ...bogen(-1.21, 0.33, 0.44, 6), [-1.65, 0.22],
          [-1.975, 0.22], [-1.975, 0.78], [-1.94, 0.83], ...L073_DECKEL, [-0.62, 0.84], [0.86, 0.8], [1.9, 0.5], [1.975, 0.42],
        ],
      },
      { art: 'quader', slot: 'radhaus', min: [-0.45, 0.22, 0.78], max: [0.45, 0.56, 1.6] }, // (unter der flachen Haube)
      { art: 'quader', slot: 'radhaus', min: [-0.45, 0.22, -1.65], max: [0.45, 0.76, -0.77] },
      // Kotflügel: vorne schmal, hinten deutlich breiter (die breiten Hinterräder stehen darin)
      { art: 'prisma', slot: 'lack', x: [0.82, 0.86], spiegeln: true, profil: kotfluegel(1.21, 0.43, 1.88, 0.62, 0.24, 0.52, 0.8) },
      // M8f: hinten mit Kamm (Oberkante ca. 1.0 m über dem Rad, fällt nach hinten ab); innen ein Kamm-Teil über dem
      // Deckel, damit der Deckel in der Mitte tiefer liegt (Tal) und die Kotflügel seitlich darüber stehen
      {
        art: 'prisma', slot: 'lack', x: [0.82, 0.91], spiegeln: true,
        profil: [[-0.6, 0.24], [-0.77, 0.24], ...bogen(-1.21, 0.33, 0.44, 6), [-1.65, 0.24], [-1.975, 0.24], [-1.975, 0.78], ...L073_KAMM],
      },
      { art: 'prisma', slot: 'lack', x: [0.6, 0.82], spiegeln: true, profil: [[-0.72, 0.8], [-1.93, 0.8], ...L073_KAMM.filter(([z]) => z > -1.93 && z < -0.72), [-0.72, 0.92]] },
      // Seitenschweller
      { art: 'quader', slot: 'lack', spiegeln: true, min: [0.82, 0.22, -0.6], max: [0.86, 0.34, 0.62] },
      // Kabine weit vorne: flache Frontscheibe, kurzes Dach, Rückwand fällt steil in den Motordeckel
      // (scheiben: die flache Frontscheibe holt ihre Farbe aus der Ansicht vorne)
      { art: 'trapez', slot: 'lack', unten: [0.8, 0.8, 0.86, -0.84], oben: [1.25, 0.64, 0.18, -0.56], ohne: ['unten'], scheiben: ['vorne'] },
      // M8f: Finnen vom Dach schräg hinunter auf die Kotflügel (die Seitenlinie fällt vom Dach bis zum Heck durchgehend ab,
      // dazwischen die steile Rückwand der Kabine und tiefer der Deckel)
      { art: 'prisma', slot: 'lack', x: [0.55, 0.65], spiegeln: true, profil: [[-0.5, 1.0], [-0.5, 1.24], [-0.62, 1.232], [-0.9, 1.125], [-1.18, 1.005], [-1.32, 0.975], [-1.32, 0.9], [-0.75, 0.9]] },
      // M8f: Heckflügel auf zwei kurzen Stützen (Oberkante ca. 1.04 m), statt der kleinen Lippe
      { art: 'trapez', slot: 'fluegel', unten: [0.995, 0.84, -1.74, -1.96], oben: [1.04, 0.84, -1.78, -2.0] },
      { art: 'quader', slot: 'schwarz', spiegeln: true, min: [0.42, 0.82, -1.92], max: [0.47, 1.0, -1.86] },
      // Lufteinlässe seitlich hinter den Türen (dunkle Kästen vor den Hinterkotflügeln)
      { art: 'quader', slot: 'gitter', spiegeln: true, min: [0.8, 0.58, -0.62], max: [0.86, 0.8, -0.5] },
      // Frontsplitter und Heckschürze
      { art: 'quader', slot: 'schwarz', min: [-0.84, 0.16, 1.88], max: [0.84, 0.22, 2.0] },
      { art: 'quader', slot: 'schwarz', min: [-0.9, 0.18, -2.0], max: [0.9, 0.42, -1.94] },
      // Aussenspiegel
      { art: 'quader', slot: 'akzent', spiegeln: true, min: [0.78, 0.9, 0.58], max: [0.88, 0.98, 0.66] },
      // Schlammlappen
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.6, 0.07, 0.76], max: [0.84, 0.4, 0.78] },
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.62, 0.07, -1.67], max: [0.9, 0.42, -1.65] },
      // Doppelauspuff in der Mitte
      ...[0.1, -0.1].map((x) => ({ art: 'zylinder', slot: 'chrom', achse: 'z', mitte: [x, 0.3, -2.0], radius: 0.045, laenge: 0.1, segmente: 6 })),
      // Gehäuse des runden Zusatzlichts in der Nase
      { art: 'zylinder', slot: 'schwarz', achse: 'z', mitte: [0, 0.34, 1.955], radius: 0.085, laenge: 0.04, segmente: 8 },

      // --- Lichter ---
      // zwei flache Scheinwerfer in der Keilnase und ein Zusatzlicht in der Mitte
      { art: 'quader', licht: 'vorne', farbe: 'scheinwerfer', spiegeln: true, min: [0.42, 0.34, 1.97], max: [0.74, 0.43, 1.978] },
      { art: 'zylinder', licht: 'vorne', farbe: 'zusatzscheinwerfer', achse: 'z', mitte: [0, 0.34, 1.978], radius: 0.068, laenge: 0.004, segmente: 8 },
      // runde Heckleuchten paarweise (eckig angedeutet), Rückfahrlicht dazwischen
      ...[0.48, 0.72].flatMap((x) => [x, -x]).map((x) => ({ art: 'zylinder', licht: 'hinten', achse: 'z', mitte: [x, 0.67, -1.978], radius: 0.08, laenge: 0.006, segmente: 8 })),
      { art: 'quader', licht: 'rueck', min: [0.2, 0.63, -1.98], max: [0.32, 0.71, -1.975] },
    ],

    bemalung: [
      // --- Seite ---
      { art: 'rechteck', ansicht: 'seite', von: [-2.1, 0], bis: [2.1, 0.36], farbe: 'unten' },
      // breiter Schrägstreifen (Werk: grün und gelb) von der Nase unten zum Motordeckel oben
      { art: 'polygon', ansicht: 'seite', farbe: 'streifen0', punkte: [[1.7, 0.36], [1.1, 0.36], [-0.7, 1.02], [-0.05, 1.02]] },
      { art: 'polygon', ansicht: 'seite', farbe: 'streifen1', punkte: [[1.98, 0.36], [1.82, 0.36], [0.0, 1.02], [0.18, 1.02]] },
      { art: 'ring', ansicht: 'seite', mitte: [1.21, 0.33], r: [0.42, 0.46], farbe: 'kante' }, // (schmal: die Nase ist niedrig)
      { art: 'ring', ansicht: 'seite', mitte: [-1.21, 0.33], r: [0.42, 0.47], farbe: 'kante' },
      // Tür (Fuge, Griff) und Lufteinlass
      { art: 'rechteck', ansicht: 'seite', von: [0.72, 0.36], bis: [0.75, 0.8], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.47, 0.36], bis: [-0.44, 1.2], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.36, 0.74], bis: [-0.26, 0.77], farbe: 'fuge' },
      { art: 'polygon', ansicht: 'seite', farbe: 'gitter', punkte: [[-0.5, 0.6], [-0.5, 0.8], [-0.66, 0.84], [-0.66, 0.6]] },
      // grosse Seitenscheibe (die Kabine sitzt weit vorne)
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[0.8, 0.84], [0.22, 1.215], [-0.48, 1.215], [-0.6, 0.86]] },
      { art: 'rechteck', ansicht: 'seite', von: [-0.46, 1.17], bis: [0.26, 1.2], farbe: 'glasHell' },
      // Helme (dezent, nur seitlich und vorne)
      { art: 'helm', ansicht: 'seite', nur: 'links', mitte: [-0.12, 1.0], r: 0.08, farbe: 'helmFahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'seite', nur: 'rechts', mitte: [-0.12, 1.0], r: 0.08, farbe: 'helmBeifahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'nummer', ansicht: 'seite', mitte: [0.3, 0.56] },
      { art: 'text', ansicht: 'seite', text: 'ALPGAS', mitte: [-1.3, 0.87], farbe: 'sponsor0', abBreite: 480 }, // auf dem Hinterkotflügel

      // --- Oben ---
      { art: 'polygon', ansicht: 'oben', farbe: 'streifen0', punkte: [[-0.3, 1.95], [0.3, 1.95], [0.3, 0.86], [-0.3, 0.86]] }, // Mittelstreifen auf der Haube
      { art: 'nummer', ansicht: 'oben', mitte: [0, 1.36], lesbarVon: 'vorne' },
      { art: 'nummer', ansicht: 'oben', mitte: [0, -0.2], lesbarVon: 'hinten' },
      // Motordeckel (im Tal zwischen den Kotflügeln): Lüftungsschlitze in zwei Reihen, dahinter der Schriftzug
      ...[-0.9, -1.03, -1.16, -1.29, -1.42].map((z) => ({ art: 'rechteck', ansicht: 'oben', von: [0.1, z - 0.05], bis: [0.54, z], farbe: 'gitter', spiegeln: true })),
      { art: 'text', ansicht: 'oben', text: 'GIPFELWERK', mitte: [0, -1.6], lesbarVon: 'hinten', farbe: 'sponsor0', abBreite: 640 },

      // --- Vorne ---
      { art: 'polygon', ansicht: 'vorne', farbe: 'glas', punkte: [[-0.76, 0.82], [0.76, 0.82], [0.62, 1.24], [-0.62, 1.24]] },
      { art: 'helm', ansicht: 'vorne', mitte: [0.33, 0.98], r: 0.075, farbe: 'helmFahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'vorne', mitte: [-0.33, 0.98], r: 0.075, farbe: 'helmBeifahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'rechteck', ansicht: 'vorne', von: [-0.62, 1.11], bis: [0.62, 1.24], farbe: 'banner' },
      { art: 'text', ansicht: 'vorne', text: 'FIRNBRAU', mitte: [0, 1.175], farbe: 'bannerSchrift', abBreite: 480 },
      { art: 'rechteck', ansicht: 'vorne', von: [0.4, 0.32], bis: [0.78, 0.45], farbe: 'schwarz', spiegeln: true }, // Scheinwerfer-Rahmen
      { art: 'rechteck', ansicht: 'vorne', von: [-0.3, 0.24], bis: [0.3, 0.3], farbe: 'gitter' },                 // Lufteinlass unter dem Zusatzlicht
      { art: 'rechteck', ansicht: 'vorne', von: [-0.9, 0], bis: [0.9, 0.24], farbe: 'unten' },

      // --- Hinten (kein Heckfenster: Rückwand der Kabine, kurze Rückwand am Heck) ---
      { art: 'rechteck', ansicht: 'hinten', von: [-0.6, 1.04], bis: [0.6, 1.2], farbe: 'gitter' },        // Rückwand der Kabine (Lüftung)
      { art: 'rechteck', ansicht: 'hinten', von: [-0.86, 0.56], bis: [0.86, 0.78], farbe: 'schwarz' },   // Heckblende mit Leuchten
      { art: 'rechteck', ansicht: 'hinten', von: [-0.95, 0], bis: [0.95, 0.42], farbe: 'unten' },
      { art: 'kennzeichen', ansicht: 'hinten', mitte: [0, 0.5] },

      // --- Heckflügel oben (hintere Kante als Akzent) ---
      { art: 'rechteck', ansicht: 'fluegel', von: [-0.8, -1.96], bis: [0.8, -2.0], farbe: 'akzent' },
    ],
  },  // Subora Imprexa (Id imprexa, M8e): kompakte Allrad-Limousine mit Boxermotor und Turbo (Impreza-Typ, eigenes
  // Design, kein Nachbau). Stufenheck mit vier Türen, Haubenhutze (Ladeluftkühler), grosser Heckflügel auf dem
  // Kofferraum, breite Kotflügel, zwei Scheinwerfer und Zusatzleuchten in der Schürze, tiefer Lufteinlass, ein Auspuff.
  imprexa: {
    id: 'imprexa',
    name: 'SUBORA IMPREXA',
    fahrprofil: 'imprexa',
    nummer: '6',
    kennzeichen: 'SI 6',
    kurz: 'IMPREXA',
    lackierungen: ['imprexaWerk', 'imprexaPolar', 'imprexaDunkel'],
    masse: { laenge: 4.35, breite: 1.77, radstand: 2.52, spur: 1.5, radRadius: 0.325 },
    kollision: { laenge: 4.27, breite: 1.71 },
    staub: { hinten: 1.32, seite: 0.72 },
    schwerpunktHoehe: 0.46,
    auspuff: [{ x: -0.5, y: 0.25, z: -2.25 }], // M8e: Enden der Auspuffrohre (dort kommt beim Poppen die Flamme heraus)
    raeder: {
      x: 0.75, z: 1.26,
      radius: 0.325, breite: 0.23, felgeRadius: 0.2, felgeTiefe: 0.03, segmente: 14, speichen: 5,
      radlaufLuft: 0.08,
    },
    textur: { breite: 512, hoehe: 128, seite: 32, oben: 32, vorne: 48, hinten: 48, fluegel: 32, hoeheBis: 1.44, fluegelZ: [-1.76, -2.2] },
    schatten: { breite: 1.9, laenge: 4.35 },
    innenFlaechen: { zBis: 2.05, yBis: 0.86, farbe: 'radhaus' },
    werte: { beschleunigung: 8, tempo: 5, grip: 8, drift: 6 },

    teile: [
      // --- Unterbau: lange Haube, Stufenheck mit Kofferraum ---
      {
        art: 'prisma', slot: 'lack', x: [-0.84, 0.84],
        profil: [
          [2.175, 0.22], [1.69, 0.22], ...bogen(1.26, 0.33, 0.43, 6), [0.83, 0.22],
          [-0.83, 0.22], ...bogen(-1.26, 0.33, 0.43, 6), [-1.69, 0.22],
          [-2.175, 0.22], [-2.175, 0.86], [-2.12, 0.92], [-1.24, 0.92], [0.98, 0.9], [2.1, 0.78], [2.175, 0.7],
        ],
      },
      { art: 'quader', slot: 'radhaus', min: [-0.45, 0.22, 0.83], max: [0.45, 0.72, 1.69] },
      { art: 'quader', slot: 'radhaus', min: [-0.45, 0.22, -1.69], max: [0.45, 0.72, -0.83] },
      // breite Kotflügel vorne und hinten
      { art: 'prisma', slot: 'lack', x: [0.84, 0.885], spiegeln: true, profil: kotfluegel(1.26, 0.43, 2.0, 0.66, 0.24, 0.76, 0.86) },
      { art: 'prisma', slot: 'lack', x: [0.84, 0.885], spiegeln: true, profil: kotfluegel(-1.26, 0.43, -0.66, -2.05, 0.24, 0.86, 0.86) },
      // Seitenschweller
      { art: 'quader', slot: 'lack', spiegeln: true, min: [0.84, 0.22, -0.66], max: [0.87, 0.34, 0.66] },
      // Kabine (Limousine): schräge Frontscheibe, Dach, schräge Heckscheibe zum Kofferraum
      // (scheiben: Front- und Heckscheibe holen ihre Farbe aus der Ansicht vorne bzw. hinten)
      { art: 'trapez', slot: 'lack', unten: [0.9, 0.8, 0.98, -1.26], oben: [1.42, 0.66, 0.24, -0.74], ohne: ['unten'], scheiben: ['vorne', 'hinten'] },
      // Haubenhutze (Ladeluftkühler; Öffnung vorne wird schwarz gemalt)
      { art: 'trapez', slot: 'lack', unten: [0.84, 0.24, 1.62, 1.12], oben: [0.93, 0.2, 1.56, 1.12], ohne: ['unten'] },
      // grosser Heckflügel auf zwei Stützen
      { art: 'trapez', slot: 'fluegel', unten: [1.1, 0.82, -1.8, -2.17], oben: [1.15, 0.82, -1.78, -2.17] },
      { art: 'quader', slot: 'akzent', spiegeln: true, min: [0.82, 0.96, -2.19], max: [0.85, 1.2, -1.76] },
      { art: 'quader', slot: 'schwarz', spiegeln: true, min: [0.5, 0.92, -2.06], max: [0.55, 1.1, -1.92] },
      // Frontschürze (tief, mit Splitter) und Heckschürze
      { art: 'quader', slot: 'lack', min: [-0.88, 0.18, 2.13], max: [0.88, 0.46, 2.21] },
      { art: 'quader', slot: 'schwarz', min: [-0.86, 0.15, 2.12], max: [0.86, 0.18, 2.24] },
      { art: 'quader', slot: 'lack', min: [-0.88, 0.18, -2.21], max: [0.88, 0.46, -2.15] },
      // Aussenspiegel
      { art: 'quader', slot: 'akzent', spiegeln: true, min: [0.79, 0.95, 0.66], max: [0.88, 1.03, 0.74] },
      { art: 'quader', slot: 'schwarz', spiegeln: true, min: [0.72, 0.97, 0.68], max: [0.79, 1.0, 0.72] },
      // Schlammlappen
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.6, 0.07, 0.81], max: [0.87, 0.42, 0.83] },
      { art: 'quader', slot: 'lappen', spiegeln: true, min: [0.6, 0.07, -1.71], max: [0.87, 0.42, -1.69] },
      // ein Auspuff hinten rechts (Beifahrerseite = -x)
      { art: 'zylinder', slot: 'chrom', achse: 'z', mitte: [-0.5, 0.25, -2.2], radius: 0.05, laenge: 0.1, segmente: 6 },
      // Gehäuse der Zusatzleuchten in der Schürze
      ...[0.58, -0.58].map((x) => ({ art: 'zylinder', slot: 'schwarz', achse: 'z', mitte: [x, 0.33, 2.21], radius: 0.085, laenge: 0.03, segmente: 8 })),

      // --- Lichter ---
      { art: 'quader', licht: 'vorne', farbe: 'scheinwerfer', spiegeln: true, min: [0.44, 0.6, 2.176], max: [0.78, 0.69, 2.182] },
      ...[0.58, -0.58].map((x) => ({ art: 'zylinder', licht: 'vorne', farbe: 'zusatzscheinwerfer', achse: 'z', mitte: [x, 0.33, 2.227], radius: 0.066, laenge: 0.004, segmente: 8 })),
      { art: 'quader', licht: 'hinten', spiegeln: true, min: [0.42, 0.72, -2.183], max: [0.84, 0.84, -2.176] },
      { art: 'quader', licht: 'rueck', min: [0.26, 0.74, -2.18], max: [0.38, 0.82, -2.176] },
    ],

    bemalung: [
      // --- Seite ---
      { art: 'rechteck', ansicht: 'seite', von: [-2.3, 0], bis: [2.3, 0.36], farbe: 'unten' },
      { art: 'rechteck', ansicht: 'seite', von: [-2.3, 0.6], bis: [2.3, 0.72], farbe: 'streifen0' }, // breiter Streifen
      { art: 'rechteck', ansicht: 'seite', von: [-2.3, 0.54], bis: [2.3, 0.57], farbe: 'streifen1' },
      { art: 'ring', ansicht: 'seite', mitte: [1.26, 0.33], r: [0.4, 0.47], farbe: 'kante' },
      { art: 'ring', ansicht: 'seite', mitte: [-1.26, 0.33], r: [0.4, 0.47], farbe: 'kante' },
      // vier Türen (Fugen) und Türgriffe
      { art: 'rechteck', ansicht: 'seite', von: [0.78, 0.36], bis: [0.81, 0.88], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.3, 0.36], bis: [-0.27, 1.38], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-1.18, 0.42], bis: [-1.15, 0.9], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-0.2, 0.8], bis: [-0.1, 0.83], farbe: 'fuge' },
      { art: 'rechteck', ansicht: 'seite', von: [-1.06, 0.8], bis: [-0.96, 0.83], farbe: 'fuge' },
      // Seitenscheiben: vordere und hintere Tür
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[0.88, 0.95], [0.3, 1.38], [-0.24, 1.38], [-0.24, 0.95]] },
      { art: 'polygon', ansicht: 'seite', farbe: 'glas', punkte: [[-0.34, 0.95], [-0.34, 1.38], [-0.72, 1.38], [-1.12, 0.95]] },
      { art: 'rechteck', ansicht: 'seite', von: [-0.24, 1.33], bis: [0.32, 1.36], farbe: 'glasHell' },
      // Helme (dezent, nur seitlich und vorne)
      { art: 'helm', ansicht: 'seite', nur: 'links', mitte: [0.02, 1.13], r: 0.08, farbe: 'helmFahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'seite', nur: 'rechts', mitte: [0.02, 1.13], r: 0.08, farbe: 'helmBeifahrer', visier: 'vorne', schulter: [1.3, 1.6] },
      { art: 'nummer', ansicht: 'seite', mitte: [0.3, 0.66] },
      { art: 'text', ansicht: 'seite', text: 'NORDHANG', mitte: [0, 0.28], farbe: 'sponsorHell', abBreite: 480 }, // zwischen den Radläufen

      // --- Oben ---
      { art: 'rechteck', ansicht: 'oben', von: [-0.2, 1.62], bis: [0.2, 1.56], farbe: 'gitter' }, // Öffnung der Haubenhutze
      { art: 'nummer', ansicht: 'oben', mitte: [0, -0.25], lesbarVon: 'hinten' },
      { art: 'nummer', ansicht: 'oben', mitte: [0, 0.0], lesbarVon: 'vorne' },
      { art: 'rechteck', ansicht: 'oben', von: [-0.7, -1.3], bis: [0.7, -1.72], farbe: 'sponsorFeld' }, // Kofferraum

      // --- Vorne ---
      { art: 'polygon', ansicht: 'vorne', farbe: 'glas', punkte: [[-0.76, 0.93], [0.76, 0.93], [0.63, 1.4], [-0.63, 1.4]] },
      { art: 'helm', ansicht: 'vorne', mitte: [0.33, 1.1], r: 0.075, farbe: 'helmFahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'helm', ansicht: 'vorne', mitte: [-0.33, 1.1], r: 0.075, farbe: 'helmBeifahrer', visier: 'mitte', schulter: [1.3, 1.6] },
      { art: 'rechteck', ansicht: 'vorne', von: [-0.64, 1.26], bis: [0.64, 1.4], farbe: 'banner' },
      { art: 'text', ansicht: 'vorne', text: 'TALFUNK', mitte: [0, 1.33], farbe: 'bannerSchrift', abBreite: 480 },
      { art: 'rechteck', ansicht: 'vorne', von: [-0.22, 0.85], bis: [0.22, 0.92], farbe: 'gitter' },          // Öffnung Hutze
      { art: 'rechteck', ansicht: 'vorne', von: [-0.4, 0.6], bis: [0.4, 0.7], farbe: 'gitter' },            // Kühlergrill
      { art: 'rechteck', ansicht: 'vorne', von: [0.42, 0.58], bis: [0.8, 0.72], farbe: 'schwarz', spiegeln: true }, // Scheinwerfer-Rahmen
      { art: 'rechteck', ansicht: 'vorne', von: [-0.9, 0], bis: [0.9, 0.46], farbe: 'unten' },              // Schürze
      { art: 'rechteck', ansicht: 'vorne', von: [-0.4, 0.2], bis: [0.4, 0.4], farbe: 'gitter' },            // tiefer Lufteinlass

      // --- Hinten ---
      { art: 'polygon', ansicht: 'hinten', farbe: 'glas', punkte: [[-0.72, 0.95], [0.72, 0.95], [0.62, 1.39], [-0.62, 1.39]] },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.5, 1.33], bis: [0.5, 1.355], farbe: 'glasHell' },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.86, 0.7], bis: [0.86, 0.86], farbe: 'schwarz' },      // Rücklicht-Band
      { art: 'text', ansicht: 'hinten', text: 'KRISTALL', mitte: [0, 0.61], farbe: 'sponsor0', abBreite: 480 },
      { art: 'rechteck', ansicht: 'hinten', von: [-0.95, 0], bis: [0.95, 0.46], farbe: 'unten' },
      { art: 'kennzeichen', ansicht: 'hinten', mitte: [0, 0.36] },

      // --- Heckflügel oben ---
      { art: 'rechteck', ansicht: 'fluegel', von: [-0.84, -2.14], bis: [0.84, -2.18], farbe: 'akzent' },
    ],
  },
};

// WERTE_VORSCHRIFT (M8c): so entstehen die Werte-Balken der Garage (werte, 1 bis 10) aus den Messungen von
// tools/auto-messung.mjs (Physik ohne Browser, jedes Auto gegen das Profil prototyp; tools/m8c-test.mjs rechnet nach):
//   beschleunigung = 5.5 + 40 x (Mittel aus prototyp/Auto der Zeiten 0-100 km/h Asphalt und Schotter - 1)
//   tempo          = 5.5 + 40 x (Höchsttempo Auto / prototyp - 1)
//   grip           = 5.5 + 40 x (Mittel aus Auto/prototyp der Grenztempi Kreis R 25 m Asphalt, Schotter, Wiesenweg - 1)
//   drift          = 2 + Zusatz-Schwimmwinkel beim Bremsen in der Kurve (90 km/h, R 80 m, Grad)
//                      + 10 x (Handbremsen-Drift Asphalt nach 0.5 s Auto/prototyp - 1)
//   gerundet, höchstens 10, mindestens 1. Der Prototyp hätte 6 / 6 / 6 / 2. Nach einer Änderung am Fahrprofil neu messen
//   (node tools/auto-messung.mjs) und die Zahlen hier nachtragen (der Test meldet, wenn sie nicht mehr passen).
export function werteAusMessung(P, X) {
  const runde = (w) => Math.max(1, Math.min(10, Math.round(w)));
  const b = (P.beschl100_asphalt / X.beschl100_asphalt + P.beschl100_schotter / X.beschl100_schotter) / 2;
  const g = ['asphalt', 'schotter', 'wiesenweg'].reduce((s, a) => s + X[`kreis25_${a}`] / P[`kreis25_${a}`], 0) / 3;
  return {
    beschleunigung: runde(5.5 + 40 * (b - 1)),
    tempo: runde(5.5 + 40 * (X.hoechst_asphalt / P.hoechst_asphalt - 1)),
    grip: runde(5.5 + 40 * (g - 1)),
    drift: runde(2 + X.heck90_r80.zusatz + 10 * (X.hb_asphalt.nach05 / P.hb_asphalt.nach05 - 1)),
  };
}

// Das Modell zu einer Id (unbekannt: das erste)
export function autoModell(id) {
  return AUTO_MODELLE[id] || Object.values(AUTO_MODELLE)[0];
}

// M8c: Auswahl (Menü, ?auto=..., Bestzeiten). "prototyp" = Aussehen des Audan Quarto mit dem Referenz-Fahrprofil.
export const STANDARD_AUTO = 'rt4';
export const PROTOTYP = 'prototyp';
export const gibtAuto = (id) => id === PROTOTYP || Object.prototype.hasOwnProperty.call(AUTO_MODELLE, id);
// Welches Modell und welches Fahrprofil gehören zu einer Auswahl? (unbekannt: Standard)
export function autoZuordnung(id) {
  const a = gibtAuto(id) ? id : STANDARD_AUTO;
  if (a === PROTOTYP) return { auto: a, modell: STANDARD_AUTO, profil: PROTOTYP };
  return { auto: a, modell: a, profil: AUTO_MODELLE[a].fahrprofil };
}
// Kurzname für die Bestzeiten-Liste: alte Einträge ohne Id = Audan Quarto (das einzige Auto bis M8b)
export function kurzName(id) {
  if (id === PROTOTYP) return 'PROTO';
  if (id == null) return AUTO_MODELLE[STANDARD_AUTO].kurz;
  return AUTO_MODELLE[id] ? AUTO_MODELLE[id].kurz : '';
}

// Alle Texte eines Modells (für die Prüfung: nur Zeichen der Pixelschrift)
export function texteDesModells(m) {
  return [m.nummer, m.kennzeichen, ...m.bemalung.filter((b) => b.art === 'text').map((b) => b.text)];
}
