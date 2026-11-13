# Ram Ganga Agro

The public website for a working farm at [rgagro.me](https://rgagro.me). Phase 1 is the farm pages, the design system, privacy and terms, contact, the newsletter with consent, the database foundation, Clerk invite-only with a user replica, and the security utilities and tests in `docs/21`.

It does not sell. All five commerce flags stay false.

## Stack

Next.js App Router (16), TypeScript, Tailwind, Clerk (`@clerk/nextjs` ≥ 7.7.8), PostgreSQL, Drizzle, Zod, a shared rate limiter.

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Clerk keys and a database are required for sign-in and for the forms that write. The public pages render without a database when the forms are not submitted.

## Scripts

| Command | Job |
|---|---|
| `npm run dev` | Local server |
| `npm run build` | Production build |
| `npm test` | Unit tests |
| `npm run test:e2e` | Route tests against `next start` (build first) |
| `npm run db:migrate` | Migrations as `rga_migrator` on the development branch |
| `npm run db:migrate:production` | Same, reading `.env.production.operator` and refusing every other host |
| `npm run db:grants` | Re-apply table grants on the development branch |
| `npm run db:grants:production` | Same, for the production branch only |
| `npm run test:forms` | Contact, newsletter, and unsubscribe against the development database |
| `npm run check:rate-limit` | Validate the development rate-limit configuration without printing secrets |
| `npm run check:rate-limit:production` | Same check for `.env.production.local`. Fails closed until that file exists |
| `npm run messages:read` | Read the inbox as `rga_messages_reader` |
| `npm run contact:erase` | Erase one address as `rga_privacy` |
| `npm run scan:client` | Fail if a secret-shaped string is in the client bundle |
| `npm run audit:policy` | Fail on high/critical advisories not allowlisted |

## Docs

Start at `docs/README.md`. The Phase 1 plan is `docs/22-phase-1-implementation-plan.md`. The runbook is `docs/runbook.md`.

Static HTML in `design/mockups/` is a design reference. It is not the application.
