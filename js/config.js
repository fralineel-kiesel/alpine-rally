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
    mittellinieStrich: 3,      // davon ist so viel Strich (Meter)
    mittellinieBreite: 0.2,    // Breite der Mittellinie (Meter)
    mittellinieMinPixel: 1,    // in der Ferne mind. so viele Bildpunkte breit (gegen Flimmern)
    startBeiMeter: 25,         // Startlinie: so viele Meter nach Strassenanfang
    zielVorEnde: 45,           // Ziellinie: so viele Meter vor Strassenende
    spawnBeiMeter: 10,         // hier steht das Auto beim Start
  },

  // --- Gelände --------------------------------------------------------
  gelaende: {
    raster: 4,                 // Abstand der Geländepunkte nahe der Strecke (Meter)
    kachel: 64,                // Gelände ist in Kacheln dieser Grösse aufgeteilt (Meter)
    kernRand: 100,             // bis so weit von der Strecke ist das Gelände fein (raster)
    mittelRand: 300,           // bis hier halb so fein (2 x raster)
    fernRand: 800,             // bis hier 4 x raster, danach ganz grob (32 m) – liegt im Dunst
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
  },

  // --- Sprites (Bäume, Steine) ----------------------------------------
  sprites: {
    seed: 4242,                // Zufallszahl für die Platzierung (gleich = gleiche Welt)
    tannenProKm: 4200,         // Versuche pro km Strecke (wie viele stehen bleiben, hängt vom Abschnitt ab)
    laubProKm: 500,
    steineProKm: 700,
    breite: 230,               // so weit links und rechts der Strasse stehen Sprites (Meter)
    verteilung: 1.8,           // > 1 = nahe der Strasse dichter, weiter weg dünner
    mindestAbstand: 9,         // so nah dürfen Objekte an die Strassenmitte
    waldAbstand: 7.5,          // im Waldstück dürfen Bäume näher ran
    tannenHoehe: [8, 15],      // Höhe von bis (Meter)
    laubHoehe: [7, 11],
    steinHoehe: [0.8, 2.2],
    helligkeit: 1.0,           // Helligkeit der Sprites
  },

  // --- Hintergrundberge -----------------------------------------------
  berge: {
    anzahl: 34,                // Berge im hinteren Kranz (vorne kommen 70 % dazu)
    abstand: [1400, 2200],     // Entfernung hinter dem Geländerand (Meter)
    hoehe: [1000, 1750],       // Gipfelhöhe (bei bezugsAbstand, weiter weg etwas höher)
    bezugsAbstand: 3300,       // bei dieser Entfernung gilt die Gipfelhöhe
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

  // --- Kollision mit Bäumen und Steinen ---------------------------------
  kollision: {
    // Das Auto als 3 Kreise: versatz = Abstand vor (+) / hinter (-) der Automitte
    autoKreise: [
      { versatz: 1.35, r: 0.9 },  // vorne
      { versatz: 0, r: 0.9 },     // Mitte
      { versatz: -1.35, r: 0.9 }, // hinten
    ],
    stammRadius: 0.45,         // Bäume: nur der Stamm zählt (Meter)
    steinFaktor: 0.42,         // Steine: Radius = Breite des Steins mal diesem Wert
    rueckprall: 0.08,          // wie stark das Auto zurückprallt (0 = gar nicht, 1 = Gummi)
    reibung: 0.3,              // seitliches Reiben am Hindernis (höher = bremst mehr)
    ablenkung: 0.42,           // frontaler Aufprall: so viel Tempo bleibt als Rutschen zur Seite
    drehStoss: 0.15,           // wie stark ein Stoss an der Ecke das Auto dreht
    drehNachlauf: 0.3,         // nach dem Ruck dreht das Auto noch etwas weiter
    maxDrehung: 1.8,           // höchstens so schnell dreht ein Aufprall das Auto (rad/s)
    drehRuck: 0.6,             // Anteil der Drehung Richtung Rutschrichtung (Ruck beim Aufprall)
    maxRuck: 50,               // höchstens so viel Grad Ruck
    ruckSofort: 35,            // davon so viel Grad sofort im selben Moment
    ruckTempo: 6,              // den Rest so schnell (rad/s)
    ruhigNach: 0.8,            // so lange nach einem harten Aufprall wird das Weiterdrehen gedämpft (s)
    drehDaempfung: 6,          // wie stark gedämpft wird
    drehAbTempo: 15,           // ab diesem Aufpralltempo (m/s) volle Drehung, darunter weniger
    wegDrehen: 0.01,           // Auto drückt ins Hindernis: dreht so viel pro Schritt davon weg (rad)
    zelle: 8,                  // Rastergrösse für die schnelle Suche (Meter)
    pruefSchritt: 0.25,        // Weg wird in so kurzen Stücken geprüft (gegen Durchrutschen)
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
