# 25 — Phase 1 integration verification

Date: 13 November 2026.

Environment: local Next.js 16.4.6 development server, Clerk development instance, Neon project `quiet-sea-21156950`, development branch `br-dark-dawn-a11uo2oz` (child of production `br-delicate-river-a1cseyut`). PostgreSQL 18.7. Clerk SDK `@clerk/nextjs` 7.9.25.

Starting commit: `c5b286c0acfaf1df5953ac269a6c260250118b9e` (“Checkpoint Phase 1 after local checks.”).

Verification commit: `99d05b8d1f550da72c3fd5213432a1747f562192`. This paragraph was added immediately after that commit so the hash can be named.

The five flags stayed `false`: `ACCOUNTS_ENABLED`, `ADMIN_UI_ENABLED`, `STOREFRONT_ENABLED`, `CHECKOUT_ENABLED`, `PAYMENTS_ENABLED`. Nothing was deployed. Production Neon was not connected to and was not migrated. Production Clerk webhooks were not configured.

This is not a security certification. It records what was run, against which system, and what remains blocked.

## How to read a result

- **Real service** — the development Clerk instance or the development Neon branch did the work.
- **Local test** — Vitest, with mocks or an in-memory stand-in.
- **Browser** — Chrome driving `http://localhost:3000`. Next.js 16 does not hydrate a dev server opened as `127.0.0.1`, so the browser pass used `localhost`.
- **Not tested** — the check was not run.
- **Blocked** — a missing human step or a missing service stopped the check.

## Clerk

Real service, in Chrome, with the dedicated invited `+clerk_test` address.

Passed:

- The development instance answered the Backend API. The publishable key is a test key.
- Uninvited registration is rejected. The Backend API returned 404 for an open sign-up. The sign-up page showed “Access restricted. Sign ups are currently disabled.”
- Password sign-in completed after Clerk’s development email-code step. That address uses Clerk’s published test code. It is not a production inbox.
- A password-only session, with `publicMetadata.role` set to `admin` from the Backend API, was refused by `requireAdmin()` with `no_second_factor`.
- TOTP was enrolled from the signed-in Clerk user. A later sign-in completed the authenticator step. `twoFactorEnabled` was true.
- The same second-factor session was refused with `not_admin` while the live role was `customer`.
- Assigning `publicMetadata.role` to `admin` through the Backend API made that same session pass `requireAdmin()`.
- Revoking the role back to `customer`, without signing out, made the next call return `not_admin`. The homepage still returned 200.
- Signing out made the admin probe return `no_session`.
- Writing `unsafe_metadata.role = admin` did not change `publicMetadata`. A profile name change did not either.
- The account was left as `customer`, with TOTP still enrolled.

Local test, not a live Clerk outage: `requireAdmin()` returns `lookup_failed` when the Backend API throws. That failure was not induced against the live instance.

Not tested: waiting for a Clerk session to expire by the clock. Sign-out and live role revocation were tested instead. A human did not enrol an authenticator by hand; the test enrolled TOTP through Clerk’s user API inside the signed-in browser.

The temporary admin probe route used for these calls was removed before the verification commit.

## Webhook

Real service for the delivery. A temporary Cloudflare tunnel forwarded only `POST /api/webhooks/clerk` to the local app. The development Svix endpoint subscribes to `user.created`, `user.updated`, and `user.deleted`. The signing secret is in `.env.local` only.

Passed on the running app and the development database, as `rga_app`:

- Clerk delivered a signed `user.updated` after a Backend API profile change. The bytes and `svix-*` headers were captured. The signature matched the stored secret. The event was stored once.
- Replaying those same bytes returned 200 and did not insert a second event row.
- A missing signature and an invalid signature each returned 400.
- A locally signed unknown event (`email.created`) returned 200 and did not change a user.
- A locally signed `user.updated` whose `unsafe_metadata.role` was `admin` and whose `public_metadata` was empty left the user as `customer`.
- Out of order, with three locally signed events for a synthetic user: an update, then a delete, then a later update that asked for `admin`. The row stayed deleted and stayed `customer`.

Local test: a storage failure returns 500 so Clerk will retry. That path was not induced on the development database.

The tunnel URL is temporary and is not recorded here. The development endpoint should be deleted in the Svix portal when the tunnel is stopped, so Clerk does not keep retrying it. It is not a production webhook.

## Database

Real service. Each check used the login it names. The last full run of `scripts/verify-dev-database.mjs` passed 46 checks and failed 0. Production’s endpoint host was refused by the script before any query.

Passed:

- `.env.local` holds pooled `rga_app` and none of the operator URLs. The five flags in that file are `false`.
- `rga_migrator`, `rga_messages_reader`, and `rga_privacy` use direct hosts.
- None of the four `rga_` logins is a member of `neon_superuser`.
- `rga_migrator` no longer has database `CREATE`.
- `rga_app` can insert a contact message and cannot select, update, or delete messages.
- `rga_messages_reader` can select messages, cannot update them, cannot read or rewrite `audit_log`, and cannot read `users`.
- The inbox script, run with only the reader URL, committed `contact_messages.read` and then printed the synthetic message. A bogus `DATABASE_URL` in that process was ignored.
- While `INSERT` on `audit_log` was revoked, the same script exited non-zero, printed nothing, and added no audit row. The insert grant was restored and checked.
- `rga_privacy` can read `email`, cannot read `message` or `name`, writes `contact.erased`, and deleted the synthetic message and subscriber. The audit rows were kept.
- Unsubscribe through `rga_app` set `unsubscribed_at` for a listed address and changed nothing for an unknown address.
- `rga_migrator` owns `contact_messages`. On this PostgreSQL 18.7 server, `REVOKE SELECT` is enforced: `has_table_privilege` is false and `SELECT` returns `42501`. Older PostgreSQL releases let a table owner bypass that revoke, so this denial is not a portable guarantee. The login was not granted `SELECT` back. It is still not an application credential.

Neon’s operation list for this session shows compute start and suspend on the development branch only. The latest production operation in that list is a compute suspend from 12 November 2026. This session did not open a production database connection.

## Browser and accessibility

Browser, Chrome, `http://localhost:3000`.

Passed at 360, 390, 768, 1024, 1280, and 1440: the homepage returned 200 and did not scroll sideways.

Passed at 200: home, the farm pages, Raktshali, journal, contact, follow, unsubscribe, privacy, and terms.

Passed at 404: an unknown journal slug, and `/shop`, `/cart`, `/checkout`, `/account`, `/admin`, `/harvest/demo`.

The homepage and sitemap do not link shop, cart, account, or sign-in. The homepage contains “It is not for sale.” and does not contain a rupee sign.

Mobile menu at 390px, with reduced motion: opens, `aria-expanded` is true, focus moves into the dialog, Tab stays inside it, the page shell is `inert`, Escape closes it, and focus returns to Menu. No horizontal overflow.

Contact: an empty required field is blocked in the browser. A short message is rejected with “Write at least a sentence.” A filled honeypot is rejected with the generic failure sentence. An invalid newsletter address is rejected. Unsubscribe, with no rate-limit store configured, returns “This form was submitted too often. Try again later.” for a nonexistent address. That is fail-closed. It is not the success sentence, and it does not say whether the address was listed.

Removal of a listed address was proven with `rga_app` SQL, not through the form, because the form cannot reach the database until the rate-limit store is configured.

Programmatic accessibility was checked (names, expanded state, inert, focus). A person using a screen reader was not part of this run.

## Security review

Reviewed the application boundaries that Phase 1 actually ships. Findings, not a certification:

- `requireAdmin()` reads the live user from Clerk’s Backend API, refuses a missing session, refuses a second-factor age of `-1` before it trusts a role, and fails closed when the lookup throws. The live revocation test confirmed the role is not taken from the stale session.
- Dormant shop, cart, checkout, account, admin, and harvest routes have no pages, so they 404 without a database query.
- Contact, newsletter, and unsubscribe inputs are strict Zod objects. The honeypot is rejected. Queries go through Drizzle parameters.
- The webhook route verifies the Svix signature before it reads the event. `unsafe_metadata` is not a role source. A duplicate `svix-id` does not apply twice. A delete is not undone by a later update.
- Operator database URLs are not in `.env.local`. Next.js does not load `.env.operator`. The runtime client sets `prepare: false` on a pooled URL.
- Security headers from `next.config.ts`: `nosniff`, a strict referrer policy, and a locked-down permissions policy. Clerk strict CSP is set per request in `src/proxy.ts`. HSTS is added only when `VERCEL_ENV` or `APP_ENV` is `production`. A host that is not Vercel must set `APP_ENV=production` or it will not send HSTS.
- Rate limiting is fail-closed when Redis is absent. Unsubscribe used to catch that failure and still return the success sentence. It now returns the same “too often” sentence for every address and does not mark the address removed. That fix is covered by a unit test.
- `x-forwarded-for` is the rate-limit key when the header is present. The production proxy must overwrite that header. Otherwise a caller can pick a fresh bucket.
- `ALTER DEFAULT PRIVILEGES` grants `rga_app` full table DML on tables the migrator creates later. `db/grants.sql` says to re-run sections 2–5 after every migration. A forgotten re-run would leave a new table more open than the inbox rules.
- No file upload exists in Phase 1. No mail provider is installed, and no mail was sent.
- Dependency audit is recorded with the command results below. The allowlist in `security/audit-allowlist.json` is empty.

## Content that still needs the farm

Do not treat any of this as approved farm fact. The pages already avoid certification, acreage, yield, price, and testimonials. The farm still has to replace the holding sentences.

- Home deck and the five journey lines, including “Soil, water, and time” and “How the grain is handled.”
- “Ram Ganga Agro is a working farm.”
- Raktshali: the name, “Grown at Ram Ganga Agro. It is not for sale.”, “Currently growing”, and the empty essay slots.
- Our farm, story, land, and practices: every paragraph that says the farm will write it later.
- Journal: the empty state. There are no posts.
- Privacy and terms: both pages say they are drafts waiting for the farm’s reviewer.
- Follow: it says nothing will be emailed yet.
- Illustrations are marked as illustrations, not photographs of the farm.

## Deployment readiness

Review only. No DNS change, no certificate order, no production database, and no deploy was made.

- Hosting: a Next.js 16 host that can run the Node server, server actions, and `src/proxy.ts`. Vercel is the path that already sets `VERCEL_ENV` for HSTS. Another host must set `APP_ENV=production`.
- Domain: `rgagro.me` is registered at Namecheap. Point DNS at the host only after the production project exists. Use HTTPS. Do not turn on HSTS in DNS until the certificate is serving.
- Clerk: a separate production instance. Invite-only stays on. New production keys. Do not copy the development secret, publishable key, or webhook secret.
- Neon: a production branch or project in a chosen region, with its own four logins created by SQL, not the console role workflow. Do not reuse `br-dark-dawn-a11uo2oz` or the development passwords. Run migrations with the direct migrator URL, then re-run grant sections 2–5, then revoke database `CREATE` if it was granted for the first migration.
- Webhook: a production endpoint for `user.created`, `user.updated`, and `user.deleted` only, with a new signing secret.
- Environment: production `DATABASE_URL` is pooled `rga_app`. Operator URLs stay off the app. All five flags stay `false` until a later phase.
- Rate limit: a production Redis URL and token before the contact, follow, or unsubscribe forms are expected to succeed.
- Backups: turn on point-in-time recovery and run the restore drill in `docs/runbook.md` before launch. That drill has not been run.
- Monitoring: error reporting and uptime checks are not configured.
- Rollback: keep the previous deployment available. Do not point the domain at a build that has not passed the production-build route tests.
- Headers and CSP: confirm HSTS and the strict Clerk CSP on the production host.
- Privacy, terms, and farm copy: approval from the farm before the domain serves this draft.

## Command results

Recorded with this working tree, after the verification edits.

| Command | Result |
|---|---|
| `npm run typecheck` | Passed. The production build also finished its TypeScript check. |
| `npm run lint` | Passed. |
| `npm test` | Passed. 8 files, 50 tests. |
| `npm run build` | Passed. Next.js 16.4.6. The temporary admin probe is not in the route list. |
| `npm run test:e2e` | Passed. 31 production-build route tests. |
| `npm run scan:client` | Passed. “Client bundle scan clean.” |
| `npm audit` | 11 moderate, 0 high, 0 critical. The allowlist is empty, so none of the moderate advisories are waived. High severity would fail the audit policy. |

## What this does not claim

Phase 1’s real Clerk sign-in, live admin revocation, development-database role checks, signed webhook delivery, and browser pass were all exercised. Launch is still blocked by farm copy, privacy and terms approval, a production rate-limit store, production Clerk, production Neon, the production webhook, DNS, and the backup drill.
