# 22 — Phase 1 implementation plan

Do this in order. Do not start Phase 2 in the same change. Do not create the files in “Do not create”.

## Mandatory

### 0. Repository

Create the Next.js app in this project, App Router, TypeScript, Tailwind, ESLint. Do not use the Pages Router. Add `.gitignore` entries for `.env`, `.env.local`, `.env*.local`. Add `.env.example` with empty keys from doc 20 plus:

```
DATABASE_URL=
DATABASE_URL_MIGRATE=
DATABASE_URL_MESSAGES=
DATABASE_URL_PRIVACY=
RATE_LIMIT_REDIS_URL=
RATE_LIMIT_TOKEN=
ACCOUNTS_ENABLED=false
ADMIN_UI_ENABLED=false
STOREFRONT_ENABLED=false
CHECKOUT_ENABLED=false
PAYMENTS_ENABLED=false
```

`next.config` sets `poweredByHeader: false`. No `images.remotePatterns` until a real media host exists.

### 1. Tokens

Map `design/*.json` to CSS variables and Tailwind theme keys. Load Fraunces and Outfit with `next/font`. Copy the SVGs into `src/assets` or import them from `design/illustrations`. Do not redraw them.

### 2. Flags and security shell

`src/server/flags.ts` with the boot invariant. `src/proxy.ts` (or `middleware.ts` if Next 15) with bare `clerkMiddleware` and strict CSP, matcher from the Clerk docs, including `/__clerk/(.*)`. Root layout with the suspense and `ClerkProvider dynamic` pattern from the CSP guide.

Headers that Clerk’s CSP helper does not set: nosniff, referrer policy, permissions policy. HSTS only when `VERCEL_ENV` or the host’s production signal is production.

### 3. Chrome

`SiteHeader`, `SiteFooter`, `SkipLink`, `Breadcrumbs`, `Button`, `SectionHeading` from doc 16. Nav config. Layout wraps every public page.

### 4. Public pages, in this order

Home, our farm and three children, grow, raktshali, journal, journal slug (404), contact, follow, privacy, terms. Content in `src/content/*.ts`. Draft sentences only from the specs.

Dormant routes: a single `src/app/shop/page.tsx` is still a public URL if the file exists. Do not create those files. Absence plus a test that requests them is the control. If a file is required for a typed future link, it must call `notFound()` before any read. Prefer not creating them.

### 5. Database

Drizzle schema from doc 19. Migration. Grants for four roles: app, migrator, messages reader, privacy erasure. The runtime client uses `DATABASE_URL`. The migrate script uses `DATABASE_URL_MIGRATE`. The inbox script uses `DATABASE_URL_MESSAGES`. The erasure script uses `DATABASE_URL_PRIVACY`. Document the grants in `docs/runbook.md` as SQL the operator runs. The app never opens the migrator, reader, or privacy URLs. `rga_app` may insert into `contact_messages` and may not select from it.

### 6. Clerk webhook and user replica

`src/app/api/webhooks/clerk/route.ts`. Verify, dedupe, upsert. Tests 8–11 from doc 21. Sign-in and sign-up routes with Clerk’s components, unlinked.

`requireAdmin` in `src/server/auth/require-admin.ts` with tests. No admin page.

### 7. Forms

Zod schemas. Server Actions for contact, newsletter, and unsubscribe. Rate limiter adapter with an in-memory implementation used only when `NODE_ENV=test`, and the shared implementation for dev and prod. Honeypot on the two public write forms. Consent. `/unsubscribe` as specified in doc 11, including the identical response for known and unknown addresses. Privacy copy matches the columns and names both scripts.

### 8. Tests and CI

The Phase 1 automated list in doc 21. CI: typecheck, lint, test, audit, secret scan of the client build.

### 9. Runbook

`docs/runbook.md` written by the implementer, covering: how to invite the first admin, `scripts/read-contact-messages.ts` with the reader role and a required reason, the rule that the audit commit finishes before any message is printed, `scripts/erase-contact.ts` with the privacy role, and a statement that the migration URL is not used for either. Also how backups are switched on, and the restore steps. The restore drill itself is not executed in Phase 1 unless the operator asks.

## Optional, only after the mandatory list

- Contour SVG behind the journey, if contrast stays AAA.
- A second pass on focus order with an external screen reader.
- Open Graph image drawn from the mark, not a fake field photo.

## Do not create

`src/app/admin/**`, `src/app/account/**`, `src/app/cart/**`, `src/app/checkout/**`, `src/app/shop/**`, `src/app/harvest/**`, payment provider modules, a price component that renders in the tree, seed data with a rupee amount, a blog post, stock photos, Clerk Billing, Organizations.

## Definition of done

- The pages in step 4 match the section order in the specs at 360 and 1280.
- The mockup banner is not in the app.
- All five flags are false in `.env.example` and in the production environment.
- Tests in doc 21 that are marked automated are green.
- `npm` audit policy is enforced.
- Privacy and terms are linked from the forms.
- No sentence states a founding year, a certificate, a price, or a place the farm did not supply.
- The implementer writes, in the pull request, that security tests were run and that the site is not claimed to be secure beyond those tests.

## Deployment, when the operator asks

Separate Clerk production instance. Production database and app role. Secrets in the host, not in git. HTTPS. Domain `rgagro.me`. Webhook endpoint pointed at `/api/webhooks/clerk` with the production signing secret. HSTS after the certificate covers the host. Error monitoring that scrubs the headers named in doc 18. Uptime check on `/`. Debug routes absent. This deployment is not part of writing the code. It is the operator’s launch list.
