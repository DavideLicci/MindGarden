# MindGarden Project Fixes and Reorganization

## ✅ Completed Tasks
- [x] Fixed backend import error in checkins.ts (changed '../db' to '../services/database.service')
- [x] Added missing uuid dependency to backend/package.json
- [x] Fixed frontend Tokens interface usage in useAuth.tsx (changed tokens.access to tokens.accessToken)
- [x] Created missing backend/src/ml.ts file with ML service functions
- [x] Backend build now passes without errors
- [x] Frontend build passes without errors

## 🔄 Remaining Tasks

### Backend Reorganization
- [ ] Move backend/src/db.ts to backend/src/services/database.service.ts
- [ ] Move backend/src/ml.ts to backend/src/services/ml.service.ts
- [ ] Update all import paths in backend routes to use new service locations
- [ ] Update backend/src/index.ts imports to use new service paths

### Frontend Reorganization
- [ ] Create feature-based folder structure in frontend/src/
- [ ] Move components to appropriate feature folders:
  - LoginForm.tsx → src/features/auth/
  - CheckInForm.tsx → src/features/checkin/
  - GardenViewer.tsx → src/features/garden/
  - AnalyticsDashboard.tsx → src/features/analytics/
  - ARPreview.tsx → src/features/garden/
  - Navigation.tsx → src/shared/
- [ ] Move hooks to feature folders:
  - useAuth.tsx → src/features/auth/
- [ ] Move services to core folder:
  - api.ts → src/core/
- [ ] Update all import paths in components and App.tsx

### Project Structure Cleanup
- [ ] Move root-level files to appropriate folders:
  - scripts/ → scripts/
  - docs/ → docs/
  - design/ → design/
  - openapi/ → openapi/
  - figma-plugin/ → figma-plugin/
- [ ] Update any references to moved files

### Testing
- [ ] Run backend build to ensure all imports work
- [ ] Run frontend build to ensure all imports work
- [ ] Test that both backend and frontend start successfully

## 📁 Target Project Structure

```
mindgarden/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   │       ├── database.service.ts (moved from db.ts)
│   │       └── ml.service.ts (moved from ml.ts)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── core/
│   │   │   └── api.ts (moved from services/api.ts)
│   │   ├── shared/
│   │   │   └── Navigation.tsx (moved from components/)
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── useAuth.tsx
│   │   │   ├── checkin/
│   │   │   │   └── CheckInForm.tsx
│   │   │   ├── garden/
│   │   │   │   ├── GardenViewer.tsx
│   │   │   │   └── ARPreview.tsx
│   │   │   ├── analytics/
│   │   │   │   └── AnalyticsDashboard.tsx
│   │   │   └── settings/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── scripts/
├── docs/
├── design/
├── openapi/
├── figma-plugin/
├── README.md
├── TODO.md
└── CHANGELOG.md
