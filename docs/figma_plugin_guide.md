# Guida: Plugin Figma — Import Wireframes SVG (ZIP support)

Questa guida spiega come installare e usare il plugin Figma incluso nel progetto per importare direttamente gli SVG (anche da ZIP) come frame in Figma.

Percorsi rilevanti nel repo:
- `figma-plugin/manifest.json` — manifest del plugin
- `figma-plugin/code.js` — codice principale del plugin (crea frame dai SVG)
- `figma-plugin/ui.html` — UI del plugin (supporta drag&drop e ZIP)
- `wireframes_figma.zip` — ZIP generato con gli SVG dei wireframe (se presente nella root)

Requisiti
- Figma Desktop (consigliato) o Web con modalità sviluppo plugin

Installazione del plugin (Developer Mode)
1. Apri Figma Desktop.
2. Menu → Plugins → Development → "New Plugin..." → "Link existing plugin".
3. Seleziona la cartella `figma-plugin` all'interno del progetto MindGarden.

Importare wireframes (ZIP o SVG)
1. Estrai `wireframes_figma.zip` localmente oppure usa direttamente lo ZIP generato.
2. In Figma, avvia il plugin: Plugins → Development → Import Wireframes SVG.
3. Nella UI del plugin puoi:
   - Trascinare uno o più file SVG, oppure
   - Trascinare lo ZIP contenente gli SVG (il plugin estrarrà i file client-side), oppure
   - Usare il pulsante file input per selezionare manualmente file SVG o ZIP.
4. Premi `Importa in Figma` per creare frame dalla lista di SVG.

Cosa fa il plugin
- Estrae (se necessario) e legge i file SVG.
- Per ogni SVG crea un nodo vettoriale in Figma usando `createNodeFromSvg`.
- Avvolge il nodo in un `Frame` e lo posiziona sulla pagina corrente.

Limitazioni e note
- Il plugin esegue l'estrazione ZIP client-side usando JSZip (CDN). Assicurati che il tuo ambiente Figma possa caricare risorse esterne.
- Alcuni SVG complessi (con font esterni o filtri avanzati) potrebbero importare con differenze visive; considera la conversione in tracciati se necessario.
- Il plugin non invia dati a server esterni; tutto avviene localmente nel tuo account Figma.

Suggerimenti post-import
- Organizza i frame in pagine separate: `Check-in`, `Garden view`, `AR view`, `AI Coach`.
- Aggiungi note e annotazioni: usa sticky notes o layer di commento per spiegare micro-interactions.
- Crea prototype links in Figma per simulare i flussi (hotspots su `Conferma Check-in`, `Innaffia`, ecc.).

Debug
- Se l'import fallisce, apri la console plugin (Plugins → Development → Open Console) per vedere errori.
- Se ZIP non viene letto, prova ad estrarre manualmente e usare i singoli SVG.

Bundling (includere JSZip localmente)
------------------------------------
Per evitare dipendenze CDN e rendere il plugin completamente offline, esegui lo script che scarica `jszip.min.js` nella cartella del plugin:

```powershell
# dalla root del progetto
.\scripts\bundle_figma_plugin.ps1
```

Questo salverà `jszip.min.js` in `figma-plugin/libs/` e l'`ui.html` del plugin usa la versione locale.

Se preferisci non eseguire lo script, il plugin proverà a usare la versione relativa e mostrerà errori se il file non è presente.

Vuoi che:
- Prepari una versione del plugin che non dipenda da CDN (includendo JSZip localmente)? Rispondi `BUNDLE`.
- Generi immagini PNG ad alta risoluzione dei wireframe e le posizioni in `design/wireframes/png/`? Rispondi `EXPORT PNG`.
