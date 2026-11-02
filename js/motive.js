// Motive (seit M10b): Landesfahnen als Pixelbild, im Code gezeichnet (keine Bilddateien).
// Welche Fahne eine Strecke zeigt, steht in der Streckendatei (deko.fahne, siehe CONFIG.deko).
// Je Motiv:
//   gross(x, y)  – Fahne am Mast, 12x8 Pixel: true = Zeichen (Kreuz), false = Grund
//   klein(x, y)  – Fahne in der Hand der Zuschauer, 5x5 Pixel: true = Zeichen
//   grund, zeichen – Farben: 'rot'/'weiss' = die Rot- und Weisstöne des jeweiligen Bildes, sonst #rrggbb
//   schluessel   – welcher Teil der kleinen Fahne die Zuschauer-Farbe (Farbschlüssel) trägt: 'grund' oder 'zeichen'
//   zuschauerFarbe – Farbe für den Schlüssel (null = CONFIG.startZiel.zuschauer.fahnenRot)

export const FAHNEN = {
  // Weisses Kreuz in der Mitte auf Rot
  schweiz: {
    gross: (x, y) => (x >= 5 && x <= 6 && y >= 1 && y <= 6) || (y >= 3 && y <= 4 && x >= 3 && x <= 8),
    klein: (x, y) => (x === 2 && y >= 1 && y <= 3) || (y === 2 && x >= 1 && x <= 3),
    grund: 'rot', zeichen: 'weiss', schluessel: 'grund', zuschauerFarbe: null,
  },
  // Blaues, nach links verschobenes Kreuz (nordisches Kreuz) auf Weiss
  finnland: {
    gross: (x, y) => (x >= 3 && x <= 4) || (y >= 3 && y <= 4),
    klein: (x, y) => x === 1 || y === 2,
    grund: 'weiss', zeichen: '#1f4f9e', schluessel: 'zeichen', zuschauerFarbe: '#1f4f9e',
  },
};

// Motiv nach Namen; unbekannt = Fehler (der Prüfer meldet das schon vorher)
export function fahne(name) {
  const f = FAHNEN[name];
  if (!f) throw new Error(`Fahnen-Motiv "${name}" unbekannt (bekannt: ${Object.keys(FAHNEN).join(', ')})`);
  return f;
}

// Farbe eines Teils: 'rot'/'weiss' aus dem Bild (rot, weiss als RGB), sonst #rrggbb -> RGB
export function motivFarbe(wert, rot, weiss, hexZuRgb) {
  return wert === 'rot' ? rot : wert === 'weiss' ? weiss : hexZuRgb(wert);
}
