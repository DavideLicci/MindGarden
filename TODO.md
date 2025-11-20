# TODO: Completare Backend MindGarden

## Stato: In Progress

### 1. Aggiornare Database (db.ts)
- [ ] Aggiungere campi mancanti a tabella checkins: emotionLabel, sentimentScore, intensity, tags, audioObjectKey, sttText, embeddingsId, status
- [ ] Creare tabella plants (id, userId, checkinId, archetype, params, position, styleSkin, health, growthProgress, createdAt)
- [ ] Creare tabella insights (id, userId, createdAt, text, insightType, sourceCheckins)
- [ ] Creare tabella settings (userId, processingMode, audioRetentionDays, shareAnonymized)
- [ ] Aggiornare dbStatements con nuove operazioni CRUD per plants, insights, settings

### 2. Aggiornare Routes Esistenti
- [ ] routes/checkins.ts: Implementare GET /checkins/{id}
- [ ] routes/checkins.ts: Aggiornare POST per includere campi avanzati e logica analisi emozioni
- [ ] routes/gardens.ts: Aggiornare per restituire schema Garden con plants array

### 3. Creare Nuove Routes
- [ ] routes/plants.ts: Implementare GET /plants/{plantId}, POST /plants/{plantId}/actions
- [ ] routes/insights.ts: Implementare GET /insights, POST /insights/generate
- [ ] routes/uploads.ts: Implementare POST /uploads/signed-url
- [ ] routes/export.ts: Implementare POST /export, DELETE /data
- [ ] routes/settings.ts: Implementare GET /settings/me, PATCH /settings/me

### 4. Aggiornare index.ts
- [ ] Importare e aggiungere nuove route

### 5. Aggiungere Logica ML Placeholder
- [ ] Funzione per analisi emozioni basata su parole chiave
- [ ] Funzione per generazione insights basata su checkins recenti
- [ ] Placeholder per STT (speech-to-text)

### 6. Testing
- [ ] Testare endpoint con curl per verificare funzionamento
- [ ] Verificare allineamento con OpenAPI spec
