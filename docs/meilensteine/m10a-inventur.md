# M10a – Inventur: was ist streckenspezifisch?

Stand 0.9a.2. **D** = Daten (kommt in die Streckendatei `strecken/alpen.js`), **R** = Regel (bleibt im Code, wirkt aus
den Datenwerten). Seeds stehen ab M10a alle im Feld `seeds` der Streckendatei (Ausnahme siehe unten).

| Was | Wo heute (0.9a.2) | D/R | Wohin in der Datei |
|---|---|---|---|
| Mittellinie (Stützpunkte x/z/h) und Abschnitte (Bäume, Wald, nah, Felswand-Seite) | `js/track.js` `STRECKEN_PUNKTE` | D | `punkte`, `abschnitte` |
| Spline, 1-m-Raster, Felswand-Blende 25 m, Dichte-Blende 80 m, Suchraster | `js/track.js` `baueStrecke` | R | – |
| Höhenprofil | in den Stützpunkten (h) | D | `punkte` |
| Start-, Ziellinie, Startplatz des Autos | `config.strasse.startBeiMeter/zielVorEnde/spawnBeiMeter` | D | `strasse` |
| Breite, Bankett, Mittellinie | `config.strasse`, `config.belaege` | R | – (Belag-Katalog) |
| Untergrund-Abschnitte (Nebenwege mit Schotter/Wiesenweg) | `config.nebenwege` | D | `nebenwege` |
| Belag je Meter, Stummel, Kreuzungen | `js/netz.js` | R | – |
| Checkpoints (Orte) | `config.checkpoints.beiMeter` | D | `checkpoints` |
| Tore, Durchfahrt, Zwischenzeiten | `js/checkpoints.js`, `js/main.js` | R | – |
| Felswände (wo) | Abschnitte mit `wand` in `track.js` | D | `abschnitte` |
| Felswand-Profil, Böschung, Tal unter dem Abhang | `config.felswand`, `config.gelaende`, `js/world.js` | R | – |
| Landschafts-Charakter (Hügelhöhe, Berg hinter Wand, Taltiefe, Talflanken) | `config.gelaende` | D | `umgebung.gelaende` |
| Hügel/Senken von Hand | `js/world.js` `LANDSCHAFT` | D | `umgebung.landschaft` |
| Bäume/Steine (Dichte je km, Verteilung) | `config.sprites`, `js/sprites.js` | D (Dichte) / R | `natur.sprites` |
| Eingefrorene Baumfolge | `js/baumfolge.js` (erzeugt) | D | `erzeugt.baumfolge` |
| Büsche, Alpenrosen, Heidelbeeren | `config.buesche` | D (Anteile) / R | `natur.buesche` |
| Fernwald, Geländefarben in der Ferne | `config.fernwald` | D (Farben) / R | `umgebung.fernwald` |
| Waldrand an den Nebenwegen, Gruppen von Hand | `config.nebenwegWald.gruppen` | D | `natur.nebenwegWaldGruppen` |
| Kühe (Anzahl, Alp ab, Herde auf der Passhöhe, Zusatzherden) | `config.kuehe` | D / R | `natur.kuehe` |
| Eingefrorene Kuhliste | `js/kuhfolge.js` (erzeugt) | D | `erzeugt.kuhfolge` |
| Leben an der Strecke (Alpweide, Fan-Spots, Wracks, Zäune, Herden) | `config.leben`, Rückfall `2950` in `js/leben.js` | D | `leben` |
| Beschriftungen (Fan-Banner, Wegweiser, Sponsoren) | `js/lebenbild.js`, `js/startzielbild.js` | D | `beschriftung` |
| Start/Ziel-Verlängerung, Landschaftsgruppen um Start/Ziel | `config.startZiel.start/ziel/landschaft` | D | `startZiel` |
| Aufbau an Start/Ziel (Bögen, Band, Zelte relativ zur Linie) | `config.startZiel` (Rest), `js/startziel.js` | R | – |
| Leitplanken, Zäune, Schilder, km-Tafeln | aus der Geometrie, `js/strassenrand.js` | R | – |
| Abkürzungs-Sperren, „schneiden“/„nicht schneiden“ | `js/abkuerzungen.js` (erzeugt) | D | `erzeugt.abkuerzungen` |
| Abkürzungs-Wünsche von Hand (immer sperren/frei, Themen) | `config.abkuerzung`, `config.sperren.themen` | D | `abkuerzung` |
| Pace-Notes | aus der Geometrie berechnet, `js/pacenotes.js` | R | – |
| Grenztempo je Kurve (für die Stufen) | `js/pacenotes-tempo.js` (erzeugt) | D | `erzeugt.kurvenTempo` |
| Minimap | aus der Geometrie, `js/minimap.js` | R | – |
| Himmel, Dunst/Nebel, Licht, Palette, Hintergrundberge | `config.farben/nebel/licht/berge` | D | `umgebung.*` |
| Umgebungsklang: Vögel je Abschnitt, Böen-Abschnitt, Publikum-Orte | `config.audio.umgebung` | D | `abschnitte[].voegel`, `klang` |
| Kuhglocken, Brunnen, Publikum (Klang) | aus Kühen/Leben, `js/umgebung.js` | R | – |
| Etappen-Kennung, Name, Beschreibung | `js/inhalte.js`, `js/texte.js` | D | `etappe`, `name`, `beschreibung` |
| Bestzeiten (Schlüssel `alpineRally.bestzeiten2`, darin je Etappen-Kennung) | `js/bestzeiten.js` | R | – |
| Demo-Fahrt, Ton-Fahrt, Fahr-Labor | nur `spawnBeiMeter`/`zielS` | R | – |
| Seeds der Welt (Gelände, Bäume, Büsche, Fernwald, Berge, Kühe, Leben, Start/Ziel, Sperren, Rand, Absperrungen, Umgebungsklang) | verteilt in `config.*.seed` | D | `seeds` |

**Ausnahmen (bleiben Regel, bewusst):** Textur-Seeds (Pixel-Bilder in `pixel.js`, `kuhbild.js`, `lebenbild.js`,
`startzielbild.js`), die Rausch-Muster der Geländefarbe in `world.js` (31, 57, 99, 7, 41, 77, 321), Staub (909) und Ton (707).
Sie erzeugen nur Muster, keine Orte. Die Seeds der Sichtschutz-Tannen an den Verlängerungen stehen in der jeweiligen Form
(`startZiel.start.form.sichtschutzSeed`), wie bisher.

**Noch Alpen-typisch, aber Regel (für M10b anschauen):** Zuschauer mit Schweizer Fahne (Pose und Fahnenbild in
`startziel.js`/`leben.js`), Kuh-Bilder, Alphütte/Heustadel als Bauformen, Tempo-Tafel „Tal“ nach dem Start.
