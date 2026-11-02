// Start (seit M10a): lädt das Spiel (js/main.js). Kann die Strecke nicht geladen werden (Datei fehlt, ungültig),
// kommt statt eines leeren Bildschirms die Fehlerseite (js/fehlerseite.js).

import { aktuellerEintrag, streckenAdresse, STRECKEN, merkeId } from './strecken.js';

// Streckendatei schon jetzt holen (parallel zum Spiel; der Lader findet sie dann fertig vor)
import(streckenAdresse(aktuellerEintrag())).catch(() => { /* Fehler meldet der Lader */ });

import('./main.js').catch(async (e) => {
  if (!e || e.name !== 'StreckenFehler') throw e;
  const { zeigeFehlerseite } = await import('./fehlerseite.js');
  // M10b: Ist eine gewählte, andere Strecke kaputt, merkt sich das Spiel wieder die erste (Standard); eine Taste oder
  // Antippen lädt neu – so bleibt man nie auf der Fehlerseite hängen
  const zurueck = aktuellerEintrag().id !== STRECKEN[0].id;
  if (zurueck) merkeId(STRECKEN[0].id);
  zeigeFehlerseite(e, { zurueck });
});
