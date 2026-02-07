# trace-app

Desktop-first enterprise document tracking UI built with Next.js App Router, TypeScript, and TailwindCSS.

## Getting started (Windows)

```powershell
$env:DATABASE_URL="file:./dev.db"
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## Notes
- No authentication.
- SQLite + Prisma-backed data.
