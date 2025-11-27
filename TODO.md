# Vercel Configuration Fix TODO

## Tasks
- [x] Update vercel.json: Remove builds property, change functions pattern to "api/**/*.ts", update routes to only "/api/(.*)" -> "/api/$1"
- [x] Move pages/api/ contents to api/ directory
- [ ] Test deployment
- [ ] Deploy frontend separately if needed
