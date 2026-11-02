// Start (seit M10a): lädt das Spiel (js/main.js). Kann die Strecke nicht geladen werden (Datei fehlt, ungültig),
// kommt statt eines leeren Bildschirms die Fehlerseite (js/fehlerseite.js).

import { aktuellerEintrag, streckenAdresse } from './strecken.js';

// Streckendatei schon jetzt holen (parallel zum Spiel; der Lader findet sie dann fertig vor)
import(streckenAdresse(aktuellerEintrag())).catch(() => { /* Fehler meldet der Lader */ });

import('./main.js').catch(async (e) => {
  if (!e || e.name !== 'StreckenFehler') throw e;
  const { zeigeFehlerseite } = await import('./fehlerseite.js');
  zeigeFehlerseite(e);
});
