# 29 — Production architecture

A Vercel project named `ram-ganga-agro` exists on the team `pracheersrivastavas-projects`. Its functions run in Singapore (`sin1`). The current production deployment is a CLI upload of this working tree, aliased to `https://ram-ganga-agro.vercel.app`. That hostname is temporary. It sends `noindex`. `rgagro.me` is not attached. Namecheap DNS was not changed. No production webhook was created. The Namecheap certificate was not installed.

The production Neon branch is `ep-curly-salad-a10wokga` in AWS Singapore. The running site uses the pooled `rga_app` login only. The GitHub repository `Battatawada/RamGangaAgro` is not connected yet: the Vercel GitHub installation on this team cannot see that repository. Until it can, a push does not deploy.

## Hosting

Use Vercel for the first production host.

The app is Next.js 16 with `src/proxy.ts`, server actions, and a strict Clerk CSP that needs a nonce on each request. Vercel runs that model directly. `next.config.ts` already adds HSTS when `VERCEL_ENV` is `production`, so a Vercel production deployment sends HSTS without a second switch. Another host must set `APP_ENV=production` or it will not.

Vercel also gives separate environment variables for production and preview, a previous deployment to roll back to, and request logs. The rate-limit address source `vercel` trusts `x-vercel-forwarded-for`, which Vercel overwrites. That matches `33-rate-limiting.md`.

Put the app in the same region as the production database once that region is chosen. `docs/24` recommends a region in India if the farm wants the data there. Do not guess a city here.

Do not put `DATABASE_URL_MIGRATE`, `DATABASE_URL_MESSAGES`, or `DATABASE_URL_PRIVACY` in the hosting project. The running site gets `DATABASE_URL` for `rga_app` only. Operator commands run from a trusted machine with `.env.operator`.

Preview deployments must not use the production database or the production Clerk keys. Give them the development services, or no database, until a preview policy exists. All five flags stay false in every environment.

Rollback is the previous Vercel deployment. Do not point the domain at a deployment that has not passed `npm run build` and `npm run test:e2e`.

## Domain and TLS

The domain is `rgagro.me`, registered at Namecheap. Do not change DNS until the Vercel project exists and a deployment has passed the route tests.

Vercel’s managed certificate is the production TLS. Do not activate the separate Namecheap certificate. A second certificate is useful only if the site is later moved to a host that does not terminate TLS. HSTS in DNS (preload) waits until HTTPS is serving on every hostname.

Records to add at Namecheap after the project exists, and not before. Copy them from the project’s domain card. Vercel has been moving apex addresses and gives each project its own `www` target. Older values still resolve, and a guessed record can be the wrong one.

| Host | Type | What to copy |
|---|---|---|
| `@` | A | The IPv4 address on the domain card. Older projects show `76.76.21.21`. Newer cards show addresses such as `216.198.79.1`. |
| `www` | CNAME | The project hostname on the domain card, often `*.vercel-dns-017.com`. Older docs say `cname.vercel-dns.com`. |

Use the card if it disagrees with this table. Add a TXT record at `_vercel` only when the card asks for one. Leave MX and other mail records alone. Do not publish a CAA record that blocks Let’s Encrypt, or the managed certificate cannot be issued.

Add the DNS records the production Clerk dashboard displays for its Frontend API if a custom Clerk domain is turned on. Do not invent that CNAME. The site works on `rgagro.me` with Clerk’s own Frontend API host if a custom Clerk domain is left off.

## Production Clerk

A new Clerk instance. Development keys, the development webhook secret, and the development users do not move.

| Setting | Production value |
|---|---|
| Allowed origins | `https://rgagro.me`, `https://www.rgagro.me` |
| Sign-in URL | `https://rgagro.me/sign-in` |
| Sign-up URL | `https://rgagro.me/sign-up` |
| After sign-in | `https://rgagro.me` |
| Access mode | Invite-only, until customer accounts are an explicit launch |
| Email | Required, verified with a code |
| Password | On, with lockout. Enumeration protection stays on |
| MFA | Authenticator app and backup codes. SMS off. Instance-wide require-MFA off |
| Organizations, Billing | Off |
| Session claim | `{ "metadata": { "role": "{{user.public_metadata.role}}" } }` |
| Webhook | `https://rgagro.me/api/webhooks/clerk`, events `user.created`, `user.updated`, `user.deleted` only, new signing secret |

First administrator: create the person in the production Dashboard, set `publicMetadata` to `{ "role": "admin" }` there, and have them enrol TOTP and store the backup codes before any future admin UI exists. The application still refuses a password-only admin. Details are in `30-authentication-and-admin-path.md`.

Environment on the host, production only:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # pk_live_…
CLERK_SECRET_KEY=                     # sk_live_…
CLERK_WEBHOOK_SIGNING_SECRET=         # a new whsec_…
```

After DNS and TLS are serving, send one signed `user.updated` and confirm a single `webhook_events` row. Replay it and confirm it does not apply twice. A bad signature must return 400.

## Production database

Development Neon is not production. Do not reuse endpoint `ep-flat-credit-a1e3xifz`, branch `br-dark-dawn-a11uo2oz`, or any development password.

Decision, to be confirmed before anything is created:

| Choice | Recommendation |
|---|---|
| Provider | Neon, a new production branch or a separate project. Not the development branch. |
| Region | The same region chosen for the app. Prefer India if the farm wants the data there. |
| Logins | The four roles in `db/grants.sql`, created with SQL and passwords that are not committed. Not a shared owner login. |
| App connection | Pooled `DATABASE_URL` for `rga_app`. The client already sets `prepare: false` on a pooled URL. |
| Operator connections | Direct hosts for migrate, inbox, and erasure. They stay off the app. |
| Schema | A superuser runs `CREATE SCHEMA drizzle AUTHORIZATION rga_migrator` once. Database `CREATE` does not stay on the migrator. |
| Migrations | `npm run db:migrate:production`, then `npm run db:grants:production`. Those commands read `.env.production.operator` and accept only the production endpoint with the direct `rga_migrator` login. The default commands still refuse that endpoint. npm consumes a bare `--production` flag, so the scripts use `--target production` instead. |
| Rate limit | `RATE_LIMIT_PROVIDER=postgres` on that same app login. No second database URL. |
| Backups | Neon point-in-time recovery enabled on the production branch. See below. |

The empty commerce tables may travel with the schema. They stay empty. Do not add further tables for products, orders, or traceability until those features are approved.

## Backups and recovery

A launch is not complete until a restore has been practised. No restore drill has been run. Do not describe the backups as tested.

| Question | Plan | Done |
|---|---|---|
| What is backed up | The production Postgres data: users, subscribers, contact messages, webhook events, the audit log, rate-limit buckets. Story copy and drawings are in git. Clerk user records are Clerk’s, and a Clerk export is a separate decision. | Not created |
| Frequency | Continuous point-in-time recovery, once the provider feature is switched on | Not switched on |
| Retention | Record the window the provider actually gives, on the day it is enabled. Do not assume a number here. | Unknown |
| Restore owner | The person who holds the production operator access. Named when the first admin is chosen. | Unnamed |
| Restore test | Create a new branch or database from a chosen time. With a read-only session, confirm one user row and that the Raktshali content module still matches what the site shows. Do not point the live domain at the restored database unless the live one is being replaced on purpose. | Not run |
| Assumption | Until the drill passes, the recovery time and the recovery point are unknown. A backup setting in a dashboard is not evidence. | — |

The steps are also in `docs/runbook.md`. They remain a procedure, not a completed test.
