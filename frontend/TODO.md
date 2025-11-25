# Frontend Reorganization TODO

## Create New Folder Structure
- [x] Create src/features/auth/
- [x] Create src/features/checkin/
- [x] Create src/features/garden/
- [x] Create src/features/analytics/
- [x] Create src/shared/
- [x] Create src/core/

## Move Files
- [x] Move LoginForm.tsx to src/features/auth/
- [x] Move useAuth.tsx to src/features/auth/
- [x] Move CheckInForm.tsx to src/features/checkin/
- [x] Move GardenViewer.tsx to src/features/garden/
- [x] Move ARPreview.tsx to src/features/garden/
- [x] Move AnalyticsDashboard.tsx to src/features/analytics/
- [x] Move Navigation.tsx to src/shared/
- [x] Move api.ts to src/core/

## Update Imports
- [ ] Update imports in App.tsx
- [ ] Update imports in moved components (LoginForm, CheckInForm, GardenViewer, AnalyticsDashboard)
- [ ] Update imports in useAuth.tsx

## Add Analytics Route
- [ ] Add analytics route to Navigation.tsx
- [ ] Add analytics route to App.tsx

## Cleanup
- [ ] Delete old directories (src/components/, src/hooks/, src/services/)

## Testing
- [ ] Test build
- [ ] Test routing
