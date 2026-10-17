# Procure AI

Next.js (App Router, TypeScript) · custom CSS · Prisma + SQLite · cookie/JWT auth.
One app, multiple portals via route groups: `/vendor` and `/admin`.

## Structure

```
src/
  app/
    (public)/        landing, login
    (vendor)/vendor/ vendor portal (layout + pages)
    (admin)/admin/   admin portal (layout + pages)
  features/          business logic per domain (auth, rfq, bids, vendors...)
    <feature>/{components,actions,queries,schemas}
  components/
    ui/              shared primitives
    layout/          shared shells
  lib/               db, session, constants
  styles/            tokens.css, base.css, components.css
  middleware.ts      role guard for /admin and /vendor
prisma/              schema.prisma, seed.ts
```

## Run

```
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Seed logins (password `password123`): `admin@procure.ai`, `vendor@procure.ai`.

## Rules

- Pages in `app/` stay thin; logic lives in `features/`.
- Both portals share `features/`, `components/`, `lib/`.
- Role access enforced in `middleware.ts`; re-check with `getSession()` in server actions.
