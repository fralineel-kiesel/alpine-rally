// =====================================================================
// Alpine Rally – alle Stellschrauben an einem Ort.
// Einheiten: Meter, Sekunden, m/s (1 m/s = 3.6 km/h), Grad wo angegeben.
// =====================================================================

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
    dunst: '#b9c8d6',          // helles Blaugrau am Horizont (= Nebelfarbe)
    gras: '#4e9a2c',           // sattes Gras
    grasDunkel: '#3b7d22',     // dunklere Grasflecken
    fels: '#7f7b74',           // Steingrau (steile Hänge, Felswand)
    felsDunkel: '#5f5b55',     // dunkler Fels
    erde: '#7a6446',           // Erde an steilen, nicht ganz felsigen Stellen
    bankett: '#8b6e4a',        // Schotterbraun neben der Strasse
    asphalt: '#56585b',        // Strassenbelag
    mittellinie: '#c9c9bd',    // dezente Mittellinie
    bergFels: '#596070',         // Hintergrundberge, Fels
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
    start: 70,                 // ab hier beginnt der Dunst (Meter)
    ende: 420,                 // hier ist alles im Dunst verschwunden
    bergDunst: 0.22,           // Hintergrundberge: wie stark bläulich eingefärbt (0..1)
    bergDunstUnten: 0.6,       // zusätzlicher Dunst am Bergfuss (0..1)
  },

  // --- Strasse --------------------------------------------------------
  strasse: {
    breite: 7,                 // Asphaltbreite
    bankett: 2,                // Breite des erdigen Randstreifens je Seite
    abstandMittellinie: 8,     // Strich + Lücke der Mittellinie zusammen (Meter)
    startBeiMeter: 25,         // Startlinie: so viele Meter nach Strassenanfang
    zielVorEnde: 45,           // Ziellinie: so viele Meter vor Strassenende
    spawnBeiMeter: 10,         // hier steht das Auto beim Start
  },

  // --- Gelände --------------------------------------------------------
  gelaende: {
    raster: 4,                 // Abstand der Geländepunkte nahe der Strecke (Meter)
    kernRand: 130,             // so weit um die Strecke herum ist das Gelände fein
    aussenRand: 1100,          // so weit reicht das Gelände insgesamt (grob, im Dunst)
    flachBis: 7.5,             // bis zu diesem Abstand von der Strassenmitte ist es flach
    uebergang: 12,             // danach geht es über so viele Meter ins natürliche Gelände
    huegelHoehe: 7,            // Höhe der kleinen Zufallshügel
    seed: 1987,                // Zufallszahl für Hügel (gleich = gleiches Gelände)
  },

  // --- Felswand / Abhang ----------------------------------------------
  felswand: {
    hoehe: 13,                 // Höhe der Felswand über der Strasse
    abstand: 5.2,              // Wandfuss: Abstand von der Strassenmitte
    talBoden: 6,               // Höhe des Talbodens unter dem Abhang
    abhangStart: 7.5,          // ab diesem Abstand fällt der Hang ab
  },

  // --- Sprites (Bäume, Steine) ----------------------------------------
  sprites: {
    seed: 4242,                // Zufallszahl für die Platzierung (gleich = gleiche Welt)
    tannen: 1600,              // Anzahl Tannen
    laubbaeume: 220,           // Anzahl Laubbäume
    steine: 320,               // Anzahl Steine
    mindestAbstand: 9,         // so nah dürfen Objekte an die Strassenmitte
    tannenHoehe: [8, 15],      // Höhe von bis (Meter)
    laubHoehe: [7, 11],
    steinHoehe: [0.8, 2.2],
    helligkeit: 1.0,           // Helligkeit der Sprites
  },

  // --- Hintergrundberge -----------------------------------------------
  berge: {
    anzahl: 34,                // Berge im hinteren Kranz (vorne kommen 70 % dazu)
    radius: [2900, 3700],      // Entfernung von der Streckenmitte
    hoehe: [1000, 1750],       // Gipfelhöhe
    schneeAb: 0.5,             // Schnee ab diesem Anteil der Höhe
    seed: 77,
  },

  // --- Fahrphysik -----------------------------------------------------
  auto: {
    name: 'Ringwerk RT4',
    beschleunigung: 6.2,       // Grundbeschleunigung (m/s²). Höher = schneller auf 100
    hoechsttempo: 52.5,        // m/s, dem nähert sich das Auto weich (52.5 = 189 km/h)
    motorbremse: 0.35,         // Abbremsen ohne Gas (m/s²)
    bremse: 10,                // Bremskraft (m/s²)
    rueckwaertsTempo: 6,       // max. Tempo rückwärts (m/s)
    rueckwaertsBeschl: 3,      // Beschleunigung rückwärts (m/s²)
    steigungsFaktor: 0.45,     // wie stark Steigung/Gefälle wirkt (1 = voll, 0 = gar nicht)

    radstand: 2.52,            // Abstand Vorder- zu Hinterachse
    schwerpunktVorne: 0.48,    // Anteil Radstand vom Schwerpunkt bis Vorderachse (0..1)
    traegheit: 2.3,            // Drehträgheit. Höher = Auto dreht träger (schwerer)

    lenkwinkelLangsam: 32,     // max. Lenkwinkel im Stand (Grad)
    lenkwinkelSchnell: 4.5,    // max. Lenkwinkel bei Referenztempo (Grad)
    lenkReferenzTempo: 45,     // ab diesem Tempo (m/s) gilt lenkwinkelSchnell

    gripVorne: 1.0,            // Haftung Vorderachse (etwas weniger = Auto schiebt eher)
    gripHinten: 1.12,          // Haftung Hinterachse
    reifenSteifigkeit: 9,      // wie schnell die Reifen Seitenkraft aufbauen
    handbremseGrip: 0.8,       // Reibung der blockierten Hinterräder (seitlich halten sie kaum)
    handbremseBremse: 3.5,     // Bremswirkung der Handbremse (m/s²)
    gasImDrift: 0.12,          // Gas im Drift lockert das Heck etwas (0 = aus)
    stabilitaet: 5,            // zieht das Auto aus dem Drift zurück gerade. 0 = aus, höher = braver
    stabilitaetRueckkehr: 2.5, // wie schnell die Stabilität nach der Handbremse zurückkommt
  },

  // --- Untergrund -------------------------------------------------------
  untergrund: {
    asphalt: { grip: 1.0, rollen: 0.05, rollenTempo: 0.0 },
    bankett: { grip: 0.85, rollen: 0.6, rollenTempo: 0.02 },
    gras:    { grip: 0.62, rollen: 2.2, rollenTempo: 0.11 },
  },

  // --- Begrenzung ---------------------------------------------------------
  grenze: {
    maxAbstand: 45,            // weiter weg von der Strasse geht es nicht (unsichtbare Wand)
    abhangGrenze: 6.6,         // am Abhang: unsichtbare Grenze (Abstand Strassenmitte)
    wandGrenze: 4.3,           // an der Felswand: hier stoppt das Auto
    abprallen: 0.2,            // wie stark das Auto von Grenzen abprallt
    steilsterHang: 0.55,       // steiler als das (0.55 = ca. 29°) kommt das Auto nicht hoch
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
    sichtweite: 9000,          // weiter weg wird nichts gezeichnet
  },

  // --- Steuerung -------------------------------------------------------
  steuerung: {
    totzone: 0.12,             // Gamepad-Stick: so viel Bewegung wird ignoriert
    tastaturLenkTempo: 3.2,    // Tastatur: wie schnell der Lenkeinschlag aufbaut
    tastaturRueckTempo: 6,     // Tastatur: wie schnell die Lenkung zurück in die Mitte geht
  },

  // --- Optik am Auto -----------------------------------------------------
  autoOptik: {
    rollen: 0.012,             // Karosserie neigt sich in Kurven (pro m/s²)
    nicken: 0.008,             // Karosserie nickt beim Bremsen/Gas
    blobSchatten: true,        // dunkler Fleck unter dem Auto
  },
};
