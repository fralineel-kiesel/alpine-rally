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

  // --- Checkpoints -------------------------------------------------------
  checkpoints: {
    beiMeter: [900, 1870, 2880], // wo die Tore stehen (Meter ab Strassenanfang)
    abkuerzungenVerhindern: true, // true = wer einen Checkpoint auslässt, wird zurückgesetzt
    anzeigeDauer: 3,           // so lange steht die Zwischenzeit oben im Bild (Sekunden)
    torBreite: 12.4,           // Abstand der Pfosten (Strasse 7 m + Bankett)
    torHoehe: 5.2,             // Höhe des Banners über der Strasse
    durchfahrtBreite: 9,       // so weit von der Strassenmitte zählt die Durchfahrt noch
  },

  // --- Begrenzung ---------------------------------------------------------
  grenze: {
    maxAbstand: 45,            // weiter weg von der Strasse geht es nicht (unsichtbare Wand)
    abhangGrenze: 6.6,         // am Abhang: unsichtbare Grenze (Abstand Strassenmitte)
    wandGrenze: 4.3,           // an der Felswand: hier stoppt das Auto
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
  // Wie sie aussehen, steht hier.
  sperren: {
    seed: 815,                 // Zufallszahl (gleich = gleiche Sperren)
    abstandMitte: 6,           // Hindernisse halten so viel Abstand zur Strassenmitte (Asphalt endet bei 3.5, Bankett bei 5.5)
    baumAbstandMitte: 8.5,     // Tannen erst ab hier (sonst hängen die Kronen über die Strasse)
    reserve: 4,                // Sperre reicht so viel weiter ins Kurveninnere als die tiefste gefundene Abkürzung
    maxTiefe: 40,              // ... aber höchstens so weit weg von der Strassenmitte
    mindestAbstand: 5,         // zwei Sperren auf derselben Seite stehen mindestens so weit auseinander (Meter)
    luecke: [0.15, 1.0],       // Lücke zwischen zwei Teilen (Meter, Kante zu Kante)
    maxLuecke: 1.4,            // nie grösser (das Auto ist 1.8 m breit)
    seitlich: 1.4,             // so weit pendeln die Teile seitlich (unregelmässig, keine Mauer)
    schraeg: 18,               // die Sperre verläuft bis so viel Grad schräg statt genau quer
    begleitChance: 0.35,       // so oft steht neben einem Teil noch ein Brocken oder eine Tanne
    mischung: { fels: 0.36, baeume: 0.3, stamm: 0.34 }, // Anteile der Bausteine
    felsHoehe: [2, 3.5],       // Felsbrocken: Höhe (Meter)
    felsFaktor: 0.4,           // Felsbrocken: Kollisionsradius = Breite mal diesem Wert
    felsGruppe: [1, 3],        // so viele Brocken pro Gruppe
    baumGruppe: [3, 6],        // so viele Tannen pro Gruppe
    baumHoehe: [7, 12],        // Höhe der Tannen in den Gruppen
    baumAbstand: [1.3, 2.0],   // Abstand der Stämme in der Gruppe
    stammLaenge: [4, 8],       // umgefallene Stämme: Länge (Meter)
    stammDicke: [0.7, 1.0],    // ... Durchmesser
    stammStapel: [1, 3],       // ... so viele übereinander/nebeneinander
    stammDrehung: 22,          // ... so viel Grad schräg (zufällig)
    stammSeiten: 7,            // ... Ecken des Zylinders (Low-Poly)
    stammKreisAbstand: 0.6,    // ... Kollision: alle so viele Meter ein Kreis
    stammAufliegen: 0.8,       // ... Achse so viele Radien über dem höchsten Geländepunkt darunter
    aeste: [2, 4],             // ... abgebrochene Äste pro Stamm
    begleitSteine: [1, 3],     // kleine Steine rund um die Sperre
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
