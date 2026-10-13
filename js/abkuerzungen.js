// Automatisch erzeugt von tools/abkuerzungen.mjs – bitte nicht von Hand ändern.
// Neu erzeugen (z. B. nach Änderungen an Strecke, Gelände oder Bäumen):
//   node tools/abkuerzungen.mjs
//
// sperren: wo Abkürzungs-Sperren stehen. s = Streckenmeter, seite = +1 rechts / -1 links
//   (Kurveninnenseite), von/bis = Abstand zur Strassenmitte (Meter). Wie die Sperren
//   aussehen, steht in config.js unter "sperren".
// nichtSchneiden: gesperrte Kurven, für die Pace-Note "nicht schneiden" (Meilenstein 4).

export const ABKUERZUNGEN = {
  streckenLaenge: 3667.59,
  minGewinn: 3,
  sperren: [
    { s: 612, seite: -1, von: 6, bis: 27.4 },
    { s: 1104, seite: 1, von: 6, bis: 10.8 },
    { s: 1203, seite: 1, von: 6, bis: 10.2 },
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
    { s: 1649, seite: -1, von: 6, bis: 10.8 },
    { s: 1654, seite: -1, von: 6, bis: 10.6 },
    { s: 1662, seite: -1, von: 6, bis: 12.6 },
    { s: 1668, seite: -1, von: 6, bis: 11.1 },
    { s: 1673, seite: -1, von: 6, bis: 11.1 },
    { s: 1687, seite: -1, von: 6, bis: 13.1 },
    { s: 1692, seite: -1, von: 6, bis: 10.6 },
    { s: 1811, seite: 1, von: 6, bis: 12.8 },
    { s: 1816, seite: 1, von: 6, bis: 10.7 },
    { s: 1832, seite: 1, von: 6, bis: 10.7 },
    { s: 1833, seite: 1, von: 6, bis: 12.4 },
    { s: 1838, seite: 1, von: 6, bis: 12 },
    { s: 2586, seite: -1, von: 6, bis: 22.4 },
    { s: 3205, seite: -1, von: 6, bis: 11 },
  ],
  nichtSchneiden: [
    { sVon: 482, sBis: 752, seite: 'links' }, // Gewinn bis 7.1 m
    { sVon: 1085, sBis: 1230, seite: 'rechts' }, // Gewinn bis 4 m
    { sVon: 1350, sBis: 1415, seite: 'links' }, // Gewinn bis 6.8 m
    { sVon: 1496, sBis: 1562, seite: 'rechts' }, // Gewinn bis 8.4 m
    { sVon: 1643, sBis: 1708, seite: 'links' }, // Gewinn bis 6.3 m
    { sVon: 1789, sBis: 1854, seite: 'rechts' }, // Gewinn bis 6.2 m
    { sVon: 1876, sBis: 1955, seite: 'links' }, // Gewinn bis 4.9 m
    { sVon: 2484, sBis: 2710, seite: 'links' }, // Gewinn bis 4.9 m
    { sVon: 3196, sBis: 3234, seite: 'links' }, // Gewinn bis 3.2 m
  ],
};
