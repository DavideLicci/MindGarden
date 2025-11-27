# Fix Netlify Deploy for Next.js

## Pending Tasks
- [ ] Add Next.js dependencies to root package.json (next, react, react-dom, @types/react, @types/react-dom)
- [ ] Configure next.config.js to use frontend/ as source directory
- [ ] Update root package.json build script to "next build"
- [ ] Move root pages/api/ to frontend/pages/api/ to consolidate API routes
- [ ] Convert frontend from Vite/React Router to Next.js app router:
  - [ ] Move frontend/src/ to frontend/app/
  - [ ] Create frontend/app/layout.tsx with common layout (theme, navigation, etc.)
  - [ ] Create frontend/app/page.tsx for home route
  - [ ] Create sub-pages: app/checkin/page.tsx, app/garden/page.tsx, app/analytics/page.tsx, app/chatbot/page.tsx, app/settings/page.tsx
  - [ ] Update Navigation component to use Next.js Link instead of React Router Link
  - [ ] Remove React Router from App.tsx and adapt components
- [ ] Ensure API routes work with Next.js (imports from backend/ should bundle)
- [ ] Test the build process
