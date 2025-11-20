# TODO: Implementazione Frontend MindGarden

## Stato: In Progress

### 1. Setup Progetto React
- [ ] Creare directory `frontend` e inizializzare app React con Vite (React + TypeScript)
- [ ] Installare dipendenze: @react-three/fiber, @react-three/drei, react-router-dom, axios, @types/node, etc.

### 2. Struttura Progetto
- [ ] Creare cartelle: src/components/, src/pages/, src/services/, src/hooks/, src/utils/
- [ ] Configurare TypeScript e ESLint

### 3. Integrazione API Backend
- [ ] Creare servizio API con Axios per chiamate a backend (auth, checkins, gardens, etc.)
- [ ] Implementare gestione JWT e refresh token

### 4. Componenti Autenticazione
- [ ] Componente LoginForm
- [ ] Componente RegisterForm
- [ ] Hook per gestione auth state

### 5. Componente Check-In
- [ ] Form per check-in testuale
- [ ] Supporto per upload audio (placeholder per ora)
- [ ] Integrazione con API /checkins

### 6. Garden Viewer 3D
- [ ] Componente GardenViewer con Three.js
- [ ] Fetch dati giardino da /gardens/me
- [ ] Rendering piante 3D basato su PlantInstance (archetype, position, health, etc.)
- [ ] Interazioni base (zoom, rotate)

### 7. AR Preview
- [ ] Componente ARPreview (placeholder iniziale)
- [ ] Overlay o simulazione AR per anteprima giardino

### 8. Routing e Navigazione
- [ ] Setup React Router con route per: /login, /register, /garden, /checkin, /ar-preview
- [ ] Componente Navigation/Layout

### 9. Testing e Ottimizzazioni
- [ ] Testare integrazione API con backend in esecuzione
- [ ] Verificare rendering 3D e performance
- [ ] Aggiungere stili CSS/Tailwind se necessario

### 10. Deploy e Finalizzazione
- [ ] Build produzione
- [ ] Aggiornare README.md con istruzioni frontend
