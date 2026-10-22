# Meilenstein 8h – Bestzeiten je Auto, Gesamt-Top-3, Vergleich mit dem eigenen Auto

Version im Spiel: **0.8h**. Fahren, Ton, Physik, Strecke, Autos und Tachos sind unverändert (gemessen, siehe unten).
Die Übernahme der alten Zeiten ist mit **erfundenen Altdaten** geprüft, nicht mit Linos echten Browser-Daten.

## Was ist neu?

### Teil A – Speicher: Bestzeiten je Auto (`js/bestzeiten.js`)

- **Neuer Speicher-Schlüssel** `alpineRally.bestzeiten2` (in `js/config.js`: `menue.bestzeitenNameV2`). Je Etappe und je Auto
  eine Liste mit den **Top 10** (schnellste zuerst, verglichen in Hundertsteln, bei Gleichstand steht die ältere vorn).
- Zeiten **ohne gültige Auto-Id** (fehlt, `prototyp`, unbekannt) liegen im Behälter `_ohne` (auch Top 10) und zählen
  **nur in der Gesamtwertung**.
- Die **Gesamtliste wird nicht gespeichert**, sondern aus allen Behältern abgeleitet (`ladeGesamtTop(etappe, 3)`); ein Auto
  darf alle drei Plätze belegen.
- Beispiel (gekürzt):

  ```
  { "passstrasse": {
      "rt4":  [ { "zeit": 152.41, "cps": [30.5, 83.8, 137.2], "datum": "2026-10-03T12:00:00.000Z", "auto": "rt4",
                 "aufpralle": 0, "resets": 0, "hoechstTempo": 50.1, "spur": [0, 0.98, … 152.41] }, … ],
      "l073": [ … ],
      "_ohne": [ { "zeit": 155, "cps": [29, 87, 135], "datum": "2026-10-13T12:00:00.000Z", "auto": null, … } ] } }
  ```

- **API:** `ladeBestzeiten(etappe, auto)` = Top 10 dieses Autos; ohne `auto` die schnellsten 10 über alle (alte Bedeutung,
  damit alte Aufrufe weiter stimmen). `speichereBestzeit` legt in die Liste von `eintrag.auto` ein und gibt wie bisher
  `platz` / `bisher` / `anzahl` (jetzt **je Auto**) zurück, neu `gesamtPlatz` (1–3, 0 = nicht drin) und `gesamtBisher`.
  `loescheBestzeiten()` löscht **beide** Schlüssel (alt und neu). „Letzter Lauf“ bleibt je Etappe, egal mit welchem Auto.
- **Speicher voll:** Scheitert das Schreiben, gelten die Zeiten bis zum Neuladen (vorher ging in diesem Fall die neue Zeit
  sofort verloren, nur der Zielbildschirm zeigte sie). Speicher blockiert und kaputte Daten wie bisher.

### Übernahme der alten Zeiten (Migration)

- **Was passiert:** Beim ersten Lesen in 0.8h gibt es den neuen Schlüssel noch nicht. Dann werden die Zeiten aus dem alten
  Schlüssel `alpineRally.bestzeiten` (bis 0.8g eine gemeinsame Top 10 je Etappe) **nach Auto-Id kopiert** (je Auto bis 10).
  Danach gilt nur noch der neue Schlüssel.
- **Was nicht passiert:** Der alte Schlüssel wird **nie verändert und nie gelöscht** (ausser mit BESTZEITEN LÖSCHEN). Er ist
  der Rettungsanker: die alten Zeiten liegen weiter im Browser. Zeiten, die später noch in den alten Schlüssel kommen
  (z. B. aus einem noch offenen Tab mit 0.8g), werden **nicht** mehr übernommen.
- Alte Zeiten **ohne Auto-Id** (vor M8a, gefahren mit dem damaligen Fahrverhalten = Prototyp) und Zeiten mit `prototyp`
  stehen **nur in der Gesamtwertung**, mit „--“ bzw. „PROTO“ als Auto. Bis 0.8g stand bei Zeiten ohne Id „QUARTO“; in
  der Audan-Liste stehen sie jetzt nicht, darum habe ich „--“ gewählt (sonst stünde QUARTO in der Gesamtliste, aber die
  Zeit fehlte in der Audan-Liste).
- Wiederholbar ohne Doppelungen: Fehlt der neue Schlüssel (oder ist er kaputt), wird neu übernommen, mit genau demselben
  Ergebnis. Ohne alte Zeiten wird nichts geschrieben.

### Speichergrösse

Voll belegt (5 Autos × 10 + 10 ohne Auto, alle mit Fahrspur von ca. 367 Zahlen): **ca. 146 KB Text, ca. 293 KB im Browser**
(2 Byte je Zeichen). Dazu bleibt der alte Schlüssel (höchstens 10 Einträge, ca. 25 KB). Grenze der Browser meist 5 MB je
Seite – genug Luft. Läuft der Speicher trotzdem voll: kein Fehler, „ZEIT WIRD NICHT GESPEICHERT“, Zeiten bis zum Neuladen.

### Teil B – Live-Vergleich und Zielbildschirm je Auto (`js/main.js`, `js/menueseiten.js`)

- **Live-Vergleich** mit Einstellung **BESTZEIT AUTO** (en **CAR BEST**, vorher BESTZEIT / BEST TIME): Referenz ist die
  Bestzeit **des gefahrenen Autos**. Hat das Auto noch keine Zeit: **keine Referenz** (kein Live-Vergleich, am Ziel
  „ERSTE ZEIT“), kein Rückfall auf andere Autos. LETZTER LAUF bleibt: der letzte Lauf, egal mit welchem Auto.
- **Garage:** Geprüft: Die Referenz wurde schon bisher bei jedem Start neu geladen, eine veraltete Referenz aus der Garage
  hätte also nie gezählt. Trotzdem lädt der Autowechsel sie jetzt sofort nach (eine Zeile, billig), damit nie eine
  falsche dasteht.
- **Zielbildschirm:** Titel **GESAMTREKORD!** (schneller als die gesamtbeste Zeit vorher; blinkt) vor **NEUE BESTZEIT!**
  (des Autos) vor **ZIEL!**. Die allererste Zeit überhaupt ist kein Rekord, nur „ERSTE ZEIT“. Zeile **GESAMT PLATZ 2/3**
  (gelb) bei Platz 2 oder 3 der Gesamtwertung. Damit die Seite nicht höher wird, stehen „PLATZ p VON n“ (Liste des Autos)
  und „GESAMT PLATZ 3“ **in einer Zeile** („PLATZ 2 VON 5 · GESAMT PLATZ 3“). Höchste Tafel: 163 Pixel, wie bis 0.8g.
- **Fanfare:** die lange Fanfare bei neuer Bestzeit des Autos und auch beim Gesamtrekord (derselbe Klang).

### Teil C – Bestzeiten-Seite (`js/menueseiten.js`)

- Eine Seite: Kopf **GESAMT TOP 3** (Etappe rechts daneben) · drei Zeilen (Platz, Zeit, Kurzname des Autos, Datum) ·
  **AUTO < NAME >** (Links/Rechts wechselt zwischen den fünf Autos, rundum) · Kopf **TOP 10** · bis zu zehn Zeilen
  (Platz, Zeit, Datum) · ZURÜCK.
- Beim Öffnen steht das Auto der Garage in der Auswahl, **nach einem Lauf das gefahrene Auto**. Der neue Lauf ist orange
  hinterlegt, in der Gesamtliste und in der Liste seines Autos (Schlüssel Auto + Datum).
- Leer: „NOCH KEINE ZEITEN“ (Gesamt), „NOCH KEINE ZEITEN MIT DIESEM AUTO“ / „NO TIMES WITH THIS CAR YET“.
- Bedienung: Tastatur, Gamepad (Steuerkreuz) und Maus (Klick rechts vom Namen = nächstes Auto, links = voriges; wie in den
  Einstellungen). Ton wie bei den anderen Auswahlfeldern (keine neuen Klänge).
- **Platz:** Das Menü wird in **jeder Pixelgrösse im 320x180-Raster** gezeichnet (480x270 und 640x360 ändern nur das
  3D-Bild dahinter). Die Abstufung aus dem Auftrag (480x270 voll, 320x180 kompakt) gibt es darum nicht: **die Seite ist in
  allen drei Grössen gleich** und passt überall ohne Rollen. Dafür sind die Zeit-Zeilen **8 statt 9 Pixel** hoch (1 Pixel
  Abstand zwischen den Zeilen), die Etappe steht rechts in der Kopfzeile statt in einer eigenen Zeile, und die Abstände
  um AUTO sind 2 Pixel. Die Tafel ist immer **172 Pixel** hoch (kürzere Listen werden mit Leerraum aufgefüllt), damit AUTO
  und ZURÜCK beim Umschalten nicht springen – sonst traf ein zweiter Mausklick daneben (im Test gefunden).
- **BESTZEITEN LÖSCHEN** löscht alles (alle Autos, beide Schlüssel); Rückfrage jetzt „ALLE BESTZEITEN ALLER AUTOS WERDEN
  GELÖSCHT.“

### Teil D – Tests, Bilder, Bericht, Version 0.8h

`tools/m8h-test.mjs` (a)–(n), `tools/m8h-bilder.mjs`, dieser Bericht, Version 0.8h.

## Selbst getestet (`node tools/m8h-test.mjs --alt <ordner 0.8g> --lang`)

Voller Lauf mit `--alt <0.8g> --lang` (ca. 3 h 10 min): **148 Prüfungen bestanden, 6 rot** – alle 6 in der Regression
(alte Tests), siehe unten. Die Übernahme ist an **erfundenen Altdaten** geprüft.

| Teil | Prüfung | Ergebnis |
|---|---|---|
| (a) | Übernahme: 12 Audan-Zeiten → Top 10; Delto/Escorta/Lanza/Subora richtig; ohne Id, `prototyp`, unbekannt → `_ohne`; Gesamt-Top-3 mit Gleichstand; andere Etappe; alter Schlüssel bitgleich; Spur und Datum übernommen | bestanden (8) |
| (b) | 5× lesen ohne Doppelung; neuer Schlüssel weg → gleiches Ergebnis; danach gilt der neue Schlüssel; ohne alte Zeiten nichts geschrieben | bestanden (4) |
| (c) | Platz je Auto, `bisher` je Auto, `gesamtPlatz`, `gesamtBisher`, prototyp nur gesamt, elfte Zeit, zu langsam, Gleichstand je Auto und über zwei Autos, alter Schlüssel nie geschrieben | bestanden (13) |
| (d) | ein Auto auf allen drei Gesamtplätzen; ein Behälter je Auto | bestanden (2) |
| (e) | kaputtes JSON (neu und alt), Speicher blockiert, Speicher voll (gilt bis zum Neuladen), geht wieder; Grösse 146 KB Text | bestanden (6) |
| (f) | Löschen: beide Schlüssel weg, Listen leer; letzter Lauf bleibt | bestanden (2) |
| (h) | Referenz je Auto: Audan = Audan-Bestzeit; Delto ohne Zeit = keine (Garage und Start); Wechsel in der Garage lädt nach; LETZTER LAUF egal welches Auto | bestanden (5) |
| (i) | Zielbildschirm: allererste Zeit, erste Delto-Zeit hinter Audan (GESAMT PLATZ 2), langsamer (eine Zeile „PLATZ 2 VON 2 · GESAMT PLATZ 3“), neue Bestzeit, Gesamtrekord, Rekord mit erster Zeit, Speicher voll; Farben, Blinken, Fanfaren; Layout 3 Auflösungen de/en (Tafel höchstens 163 wie 0.8g); en-Titel; Einstellungstext, EINSTELLUNGEN nicht breiter (283) | bestanden (12) |
| (j) | Zwei echte Testfahrer-Läufe Delto „mittel“: 1. ohne Referenz (Audan-Zeit zählt nicht), 2. gegen den 1. (Unterschied höchstens 0.049 s), beide **2:41.60** | bestanden (4) |
| (k) | Seite: Gesamt sortiert mit Kurznamen (PROTO), Auto der Garage beim Öffnen, Tastatur, Maus (Klick auf < >), Gamepad (simuliert), Top 10 bei 12 Zeiten, Auto ohne Zeiten, Tafel springt nicht, ZURÜCK, Markierung nach einem Lauf (öffnet beim gefahrenen Auto), leer, englisch | bestanden (13) |
| (l) | Layout voll und leer, de/en, 320x180 / 480x270 / 640x360: Tafel 214x172 (en 220x172), nichts gerollt, Rand durchgehend, nichts Helles am Rand, Spaltenlücken leer, ZURÜCK sichtbar, 13 Zeit-Zeilen | bestanden (13) |
| (m) | BESTZEITEN LÖSCHEN über das Menü: Rückfrage, beide Schlüssel weg, nach dem Neuladen leer | bestanden (5) |
| (n) | **Unveränderlich gegen 0.8g:** Tacho AUTO-STIL und KLASSISCH je 60 Fälle pixelgleich, im Spiel 30 Ausschnitte pixelgleich; 19 Dateien (Ton, Physik, Autos, Strecke, Tacho, HUD, Live-Vergleich, Garage …) unverändert; Fahrmessung aller 6 Profile bit-genau; Aussehen der Autos 73 Prüfsummen gleich; Testfahrer (Prototyp **2:59.33 / 2:42.35 / 2:31.92**, alle fünf Autos gleich wie 0.8g); Ton aller Profile gleich (nur Rechenrauschen in der 5.–7. Stelle); Abkürzungen **127 / 2 / 342 / 84**; Strecke **3667.587 m**; Bildzeit 761 gegen 762 ms (−0.1 %), 9 Draw Calls je Auto; Ladezeit 1341 gegen 1367 ms (−26 ms) | bestanden |
| (g) | alte Tests mit `bestzeiten.js`: rennablauf, overlay, m8c (g), m8b (b) grün; m8e (e) grün bis auf den bekannten Credits-Fehler | bestanden |
| Regression | getriebe, lenk, handbremse, belag, rueckwaerts, aufprall, pacenotes, rennablauf, ton, ton-umgebung, auto, m8f grün | siehe unten |

**Rot in der Regression (6 Zeilen):**
- **menue-test** (direkt und in m8b, m8c, m8d, m8e): Credits kennen nur SHAI-RON – **bekannt seit 0.8e**.
- **m8b / m8d (j):** eine Kurve (Audan bei 1028 m) ausserhalb des Zielbereichs – **bekannt seit 0.8g**.
- **overlay-test:** „Hinweis nach 1.5 s weg“ einmal rot (Zeitmessung im langsamen Test-Browser); im selben Lauf in (g) und
  danach einzeln **grün** – ein Wackler.
- **m8c / m8d:** `rennablauf-test --auto rt4/delto/escorta` (k) erwartete noch, dass alte Zeiten ohne Auto zur Liste des
  Audan zählen. Das ist das **gewollte neue Verhalten** (nur Gesamtwertung); die Prüfung ist angepasst und danach mit
  `--auto rt4` einzeln **grün**. Die lange Regression habe ich danach nicht nochmals laufen lassen (nur einmal laut Auftrag).
- **m8d:** einmal „Speicher: Geometrien 112 → 113“ beim 30-fachen Autowechsel; im selben Lauf in m8c und einzeln grün
  (112 → 112) – ein Wackler, nicht aus M8h (der Wechsel lädt nur zusätzlich die Referenz, keine Geometrie).

**Angepasste alte Tests** (mit Kommentar „M8h“): rennablauf (neuer Schlüssel, Gesamt-Zeilen der Seite, GESAMTREKORD! statt
NEUE BESTZEIT! bei nur einem Auto, Platz-Zeile mit „· GESAMT PLATZ“, (k) je Auto), overlay („alte Daten“ = nur der alte
Schlüssel, Speicherbedarf am neuen Schlüssel), m8c (g) (Gesamt-Top-3 und Live-Vergleich je Auto statt gemeinsam), m8e (e)
(Kurznamen in der Gesamt-Top-3), ton-test und menue-test (beide Schlüssel).

## Was ein Ziel nicht erreicht hat (offen gemeldet)

- **Abgestufte Darstellung 480x270 / 320x180:** gibt es nicht, weil das Menü in jeder Pixelgrösse 320x180 ist. Stattdessen
  passt die Seite in allen Grössen ohne Rollen – dafür sind die Zeit-Zeilen 8 statt 9 Pixel hoch und die Etappe steht in
  der Kopfzeile statt in einer eigenen Zeile.
- **Layout-Bilder vor dem Festlegen:** Die zwei Bilder (de, 480x270 und 320x180) habe ich in der Sitzung gezeigt und bin
  dann ohne Antwort weitergegangen (beide sind gleich, siehe oben). Wenn dir das Layout nicht gefällt, ist es schnell geändert.
- **Volle Regression:** 6 rote Zeilen, alle erklärt (bekannte Fehler, zwei Wackler, eine angepasste Prüfung, die danach
  einzeln grün ist; siehe oben). Nicht nochmals komplett gelaufen.
- Die Kurznamen-Spalte zeigt bei Zeiten ohne Auto jetzt „--“ statt „QUARTO“ (Änderung gegenüber M8c, begründet oben).

## Ehrlich beurteilt – wo ich am unsichersten bin

1. **Linos echte Daten.** Die Übernahme ist an erfundenen Altdaten geprüft (gemischte Autos, ohne Id, `prototyp`, ohne
   Spur, mehr als 10, gleiche Zeiten, kaputtes JSON). Was wirklich in Linos Browser steht, kenne ich nicht. Rückweg: der
   alte Schlüssel bleibt unberührt.
2. **Zeiten ohne Auto-Id** stehen nur in der Gesamtwertung, mit „--“. Hat Lino viele alte Zeiten von vor M8a, sieht er sie
   in keiner Auto-Liste – so war es im Auftrag angenommen, aber es kann überraschen.
3. **Engere Zeilen** (8 statt 9 Pixel) auf der Bestzeiten-Seite: an Bildern gut lesbar, auf einem kleinen Bildschirm nicht
   selbst gesehen.
4. **Offener alter Tab:** Wer gleichzeitig noch einen Tab mit 0.8g offen hat und dort fährt, schreibt in den alten
   Schlüssel; diese Zeit taucht in 0.8h nicht auf.
5. Den **Gesamtrekord** gibt es auch mit der ersten Zeit eines Autos (Titel GESAMTREKORD!, darunter ERSTE ZEIT, weil das
   Auto nichts zum Vergleichen hat). Das ist logisch, sieht aber ungewohnt aus.

## Bilder (`screenshots/m8h/`, 640x360, Testdaten erfunden)

- `01-bestzeiten-480x270-de.png` / `-en.png` – Bestzeiten-Seite, drei Autos, Lanza 073 gerade gefahren (markiert).
- `02-bestzeiten-320x180-de.png` – dieselbe in 320x180 (Menü gleich, nur das 3D-Bild gröber).
- `03-bestzeiten-delto-480x270-de.png` – nach Links: Lanza Delto.
- `04-bestzeiten-ohne-zeiten-de.png` – Auto ohne Zeiten.
- `05-ziel-gesamtrekord-de.png` – Zielbildschirm GESAMTREKORD!.
- `06-ziel-neue-bestzeit-de.png` – Zielbildschirm NEUE BESTZEIT! mit GESAMT PLATZ 2.
- `07-einstellung-vergleich-de.png` – EINSTELLUNGEN, VERGLEICH MIT = BESTZEIT AUTO.

## Test-Anleitung für Lino (M8h)

Wichtig vorab: Ich habe die Übernahme nur mit **erfundenen** alten Zeiten getestet, nicht mit deinen. Deine alten Zeiten
bleiben auf jeden Fall im Browser liegen (alter Speicher, unberührt), bis du „BESTZEITEN LÖSCHEN“ drückst.

1. Spiel öffnen (**Strg+F5**) → **BESTZEITEN**.
   - Sind deine alten Zeiten da? Stehen sie beim richtigen Auto? (Links/Rechts wechselt das Auto, oder Klick auf < >.)
   - Stimmt **GESAMT TOP 3** (die drei schnellsten, egal welches Auto)?
   - Wenn Zeiten fehlen, die du mit einem Auto gefahren bist → bitte Screenshot, ich prüfe die Übernahme.
   - Wenn eine Zeit mit „--“ dasteht → das ist eine sehr alte Zeit ohne Auto (vor M8a), sie zählt nur in GESAMT.
2. Mit einem Auto fahren, das noch **keine Zeit** hat.
   - Dann: kein grün/roter Live-Vergleich unter der Zeit, am Ziel „ERSTE ZEIT“.
   - Wenn doch ein Vergleich erscheint → Screenshot (dann vergleicht er mit einem anderen Auto, das wäre ein Fehler).
3. Dasselbe Auto nochmal, schneller.
   - Dann: Live-Vergleich gegen die eigene Zeit dieses Autos, am Ziel „NEUE BESTZEIT!“ (blinkt) und die lange Fanfare.
4. Mit dem **schnellsten** Auto eine Zeit unter die besten drei fahren.
   - Platz 2 oder 3: Zielbildschirm zeigt „GESAMT PLATZ 2“ (gelb). Schneller als alle: Titel „GESAMTREKORD!“.
   - Danach BESTZEITEN: die neue Zeit ist orange markiert, oben in GESAMT und unten beim Auto.
5. EINSTELLUNGEN → BESTZEITEN LÖSCHEN → JA → alles weg; Seite neu laden: bleibt weg.
   - Wenn danach alte Zeiten wieder auftauchen → bitte melden (dann wurde der alte Speicher nicht gelöscht).

Weiteres: EINSTELLUNGEN → VERGLEICH MIT heisst jetzt „BESTZEIT AUTO“ / „LETZTER LAUF“.
