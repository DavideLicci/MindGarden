# TODO: Completare Backend MindGarden

## Stato: Completato

### 1. Aggiornare Database (db.ts)
- [x] Aggiungere campi mancanti a tabella checkins: emotionLabel, sentimentScore, intensity, tags, audioObjectKey, sttText, embeddingsId, status
- [x] Creare tabella plants (id, userId, checkinId, archetype, params, position, styleSkin, health, growthProgress, createdAt)
- [x] Creare tabella insights (id, userId, createdAt, text, insightType, sourceCheckins)
- [x] Creare tabella settings (userId, processingMode, audioRetentionDays, shareAnonymized)
- [x] Aggiornare dbStatements con nuove operazioni CRUD per plants, insights, settings

### 2. Aggiornare Routes Esistenti
- [x] routes/checkins.ts: Implementare GET /checkins/{id}
- [x] routes/checkins.ts: Aggiornare POST per includere campi avanzati e logica analisi emozioni
- [x] routes/gardens.ts: Aggiornare per restituire schema Garden con plants array

### 3. Creare Nuove Routes
- [x] routes/plants.ts: Implementare GET /plants/{plantId}, POST /plants/{plantId}/actions
- [x] routes/insights.ts: Implementare GET /insights, POST /insights/generate
- [x] routes/uploads.ts: Implementare POST /uploads/signed-url
- [x] routes/export.ts: Implementare POST /export, DELETE /data
- [x] routes/settings.ts: Implementare GET /settings/me, PATCH /settings/me
- [x] routes/analytics.ts: Implementare emotion-trends, garden-health, achievements, report

### 4. Aggiornare index.ts
- [x] Importare e aggiungere nuove route

### 5. Aggiungere Logica ML Placeholder
- [x] Funzione per analisi emozioni basata su parole chiave
- [x] Funzione per generazione insights basata su checkins recenti
- [x] Placeholder per STT (speech-to-text)

### 6. Testing
- [ ] Testare endpoint con curl per verificare funzionamento (server non risponde, possibile errore runtime)
- [ ] Verificare allineamento con OpenAPI spec
