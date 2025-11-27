# MindGarden — README di progetto

Breve guida per sviluppatori: validazione OpenAPI, generazione stub e passaggi successivi per il progetto MindGarden (diario visivo delle emozioni).

**Contenuto principale creato finora**
- `openapi/mindgarden.yaml` — specifica OpenAPI (v3) per gli endpoint core.
- `scripts/validate_openapi.py` — script Python per validare lo YAML (usa `openapi-spec-validator`).

**Requisiti locali**
- Windows with PowerShell (documento creato su Windows).
- Python 3.11+ (virtualenv consigliato). Il progetto ha già una virtualenv in `.venv` (se presente).
- Docker (opzionale) per generazione stub con `openapi-generator-cli` se non vuoi installare Java.

## Validare lo OpenAPI (rapido)
Il repository include uno script per validare la specifica. Se non hai ancora creato una virtualenv, creane una e installa le dipendenze:

```powershell
# dalla root del progetto
python -m venv .venv
& .\.venv\Scripts\pip.exe install --upgrade pip
& .\.venv\Scripts\pip.exe install pyyaml openapi-spec-validator
```

Esegui la validazione:

```powershell
& ".\.venv\Scripts\python.exe" .\scripts\validate_openapi.py
```

Se preferisci usare il Python globale (non raccomandato), sostituisci il percorso.

Output atteso: `OpenAPI validation: SUCCESS`.

## Generare server/client stub (opzioni)

- Con Docker (`openapi-generator-cli`):

```powershell
# genera server Express (esempio)
docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli generate -i /local/openapi/mindgarden.yaml -g nodejs-express-server -o /local/backend-stub

# genera client TypeScript (esempio)
docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli generate -i /local/openapi/mindgarden.yaml -g typescript-fetch -o /local/frontend-client
```

- Senza Docker (richiede Java + openapi-generator-cli installato):

```powershell
openapi-generator-cli generate -i openapi/mindgarden.yaml -g nodejs-express-server -o backend-stub
```

Scegli il `generator` più adatto (`nodejs-express-server`, `spring`, `python-flask`, `typescript-fetch`, ecc.).

## Struttura suggerita del repo (per sviluppo)

- `backend/` — API implementation (es. NestJS / Express). Puoi iniziare copiando lo stub generato.
- `mobile/` — Unity project + scene del giardino (AR Foundation).
- `web/` — React + Three.js per viewer web.
- `ml/` — worker ML (STT, NLP, embedding scripts).
- `openapi/` — specifica OpenAPI (questa cartella).
- `scripts/` — helper scripts (es. validate, generate assets).
- `infra/` — terraform/ARM/CloudFormation per infrastruttura.

## Esempi utili di sviluppo

- Avviare una DB Postgres in Docker (sviluppo):

```powershell
docker run --name mg-postgres -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres
```

- Avviare lo script di validazione in CI (GitHub Actions):

```yaml
name: Validate OpenAPI
on: [push, pull_request]
jobs:
  validate:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install deps
        run: |
          python -m pip install --upgrade pip
          pip install pyyaml openapi-spec-validator
      - name: Validate OpenAPI
        run: python scripts/validate_openapi.py
```

## Next steps consigliati (possono essere eseguiti da me su richiesta)
- Generare server stub (`STUB`) per iniziare a implementare gli endpoint.
- Creare migrazione SQL iniziale (`MIGRATION`) basata sullo schema DB definito.
- Disegnare wireframes bassa fedeltà (`WIREFRAMES`) per Check-in, Garden View, AR e AI Coach.

---
File creati finora:
- `openapi/mindgarden.yaml`
- `scripts/validate_openapi.py`

Grazie — procediamo quando vuoi. 🌱
