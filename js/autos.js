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
  },
};

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
