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

export const ABKUERZUNGEN = {
  streckenLaenge: 3667.59,
  minGewinn: 3,
  sperren: [
    { s: 1371, seite: -1, von: 6, bis: 13.1 },
    { s: 1384, seite: -1, von: 6, bis: 11.9 },
    { s: 1389, seite: -1, von: 6, bis: 11.1 },
    { s: 1396, seite: -1, von: 6, bis: 13.9 },
    { s: 1401, seite: -1, von: 6, bis: 11.1 },
    { s: 1506, seite: 1, von: 6, bis: 11.5 },
    { s: 1516, seite: 1, von: 6, bis: 13.9 },
    { s: 1521, seite: 1, von: 6, bis: 10.9 },
    { s: 1530, seite: 1, von: 6, bis: 12.7 },
    { s: 1535, seite: 1, von: 6, bis: 11 },
    { s: 1539, seite: 1, von: 6, bis: 10.8 },
    { s: 1542, seite: 1, von: 6, bis: 12.3 },
    { s: 1811, seite: 1, von: 6, bis: 12.8 },
    { s: 1816, seite: 1, von: 6, bis: 10.7 },
    { s: 1832, seite: 1, von: 6, bis: 10.7 },
    { s: 1833, seite: 1, von: 6, bis: 12.4 },
    { s: 1838, seite: 1, von: 6, bis: 12 },
    { s: 3205, seite: -1, von: 6, bis: 11 },
  ],
  nichtSchneiden: [
    { sVon: 1350, sBis: 1415, seite: 'links' }, // Gewinn bis 6.9 m – Gewinn 6.9 m, Umgebung: 4.84 Bäume/Steine pro 100 m², Hang 23 %
    { sVon: 1496, sBis: 1562, seite: 'rechts' }, // Gewinn bis 8.4 m – Gewinn 8.4 m, Umgebung: 3.88 Bäume/Steine pro 100 m², Hang 22 %
    { sVon: 1789, sBis: 1854, seite: 'rechts' }, // Gewinn bis 6.3 m – Gewinn 6.3 m, Umgebung: 4.53 Bäume/Steine pro 100 m², Hang 20 %
    { sVon: 3196, sBis: 3234, seite: 'links' }, // Gewinn bis 3.2 m – Pflicht: Schneiden spart 1.54 s >= 0.5 s
  ],
  schneiden: [
    { sVon: 482, sBis: 752, seite: 'links', gewinn: 7.1 }, // offene Wiese (Sperre wäre eine 21.4 m lange Reihe)
    { sVon: 1085, sBis: 1230, seite: 'rechts', gewinn: 3.2 }, // Quote erreicht, kleinerer Gewinn (4.0 m) oder Nachbar schon gesperrt
    { sVon: 1643, sBis: 1708, seite: 'links', gewinn: 6.3 }, // Quote erreicht, kleinerer Gewinn (7.3 m) oder Nachbar schon gesperrt
    { sVon: 2484, sBis: 2710, seite: 'links', gewinn: 5.1 }, // offene Wiese (Sperre wäre eine 16.4 m lange Reihe)
  ],
};
