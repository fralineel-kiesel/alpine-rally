// Automatisch erzeugt von tools/pacenotes-test.mjs --schreiben – bitte nicht von Hand ändern.
// Neu erzeugen nach Änderungen an Strecke, Belägen oder Fahrphysik: node tools/pacenotes-test.mjs --schreiben
//
// Grenztempo jeder Kurve (km/h), gemessen mit der echten Fahrphysik: Der Testfahrer hält ein festes Tempo
// und folgt der Strassenmitte; das grösste Tempo, bei dem er ohne Aufprall und höchstens 1 m auf dem
// Bankett durchkommt. Gilt für den Belag der Kurve (Schotter, Wiesenweg). kmh: null = Vollgas (die Kurve
// bremst nicht). von/bis = Streckenmeter (so findet js/pacenotes.js die Kurve wieder).
// Daraus macht js/pacenotes.js die Stufe 1-6 (Grenzen: config.js, pacenotes.stufenGrenzen).

export const KURVEN_TEMPO = {
  kurven: [
    { von: 265, bis: 418, kmh: 155 }, // rechts 30°, Radius 227 m, asphalt
    { von: 504, bis: 749, kmh: 142.4 }, // links 64°, Radius 168 m, asphalt
    { von: 796, bis: 847, kmh: 59.9 }, // rechts 82°, Radius 25 m, schotter
    { von: 850, bis: 914, kmh: 58.9 }, // links 70°, Radius 31 m, schotter
    { von: 917, bis: 979, kmh: 67.8 }, // rechts 66°, Radius 33 m, schotter
    { von: 981, bis: 1026, kmh: 62.1 }, // links 67°, Radius 23 m, schotter
    { von: 1028, bis: 1057, kmh: null }, // rechts 27°, Radius 31 m, asphalt, Vollgas
    { von: 1088, bis: 1226, kmh: 99 }, // rechts 80°, Radius 79 m, asphalt
    { von: 1353, bis: 1413, kmh: 42.7 }, // links 179°, Radius 13 m, asphalt, Kehre
    { von: 1499, bis: 1560, kmh: 42.7 }, // rechts 180°, Radius 13 m, asphalt, Kehre
    { von: 1645, bis: 1706, kmh: 42.7 }, // links 179°, Radius 13 m, asphalt, Kehre
    { von: 1792, bis: 1852, kmh: 42.7 }, // rechts 179°, Radius 13 m, asphalt, Kehre
    { von: 1879, bis: 1953, kmh: null }, // links 26°, Radius 101 m, asphalt, Vollgas
    { von: 1976, bis: 2022, kmh: 73.2 }, // rechts 46°, Radius 24 m, schotter
    { von: 2027, bis: 2078, kmh: 77.9 }, // links 27°, Radius 70 m, schotter
    { von: 2288, bis: 2361, kmh: 92.2 }, // rechts 47°, Radius 59 m, schotter
    { von: 2365, bis: 2411, kmh: 82.2 }, // links 42°, Radius 35 m, schotter
    { von: 2508, bis: 2706, kmh: 149.6 }, // links 45°, Radius 189 m, asphalt
    { von: 2779, bis: 2829, kmh: 85.8 }, // rechts 43°, Radius 47 m, asphalt
    { von: 2833, bis: 2883, kmh: 78.9 }, // links 29°, Radius 64 m, wiesenweg
    { von: 3022, bis: 3089, kmh: 87.2 }, // rechts 31°, Radius 46 m, wiesenweg
    { von: 3092, bis: 3120, kmh: 73.6 }, // links 32°, Radius 31 m, wiesenweg
    { von: 3161, bis: 3192, kmh: 82.5 }, // rechts 37°, Radius 24 m, asphalt
    { von: 3197, bis: 3231, kmh: null }, // links 37°, Radius 24 m, asphalt, Vollgas
    { von: 3292, bis: 3374, kmh: 147.4 }, // rechts 20°, Radius 201 m, asphalt
  ],
};
