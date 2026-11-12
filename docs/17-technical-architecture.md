# 17 — Technical architecture

This is the baseline from the approved security review, checked against Clerk and Next.js documentation on 12 November 2026. No package is installed in this repository, so exact npm versions are unverified. Claude installs current stable releases and re-checks the floors named here against the release notes before relying on them.

The documentation does not make the future site secure.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js App Router, TypeScript. Next.js 16 uses `proxy.ts`, not `middleware.ts`. If the installed major is 15 or below, the same Clerk code goes in `middleware.ts`. |
| UI | React Server Components, Tailwind, tokens from `design/` |
| Identity | Clerk, `@clerk/nextjs` |
| Data | PostgreSQL, Drizzle, migrations |
| Validation | Zod |
| Rate limit | A shared store. Upstash is the suggested service, not a confirmed account |
| Media bytes | Object storage later. Phase 1 uses the SVGs in the repo |
| Payments | None in Phase 1. An interface only in the future plan |
| Host | Managed Next.js. The provider is an open decision |

## Trust boundaries

1. The browser is untrusted. Props, form fields, and `unsafeMetadata` are untrusted.
2. `proxy.ts` may redirect. It is not the authorization boundary. Clerk’s own guide says to protect the code that reads the data. Next.js says the same about Server Actions: the action is a public POST.
3. `auth()` in a Server Component, Route Handler, or Server Action is the session boundary.
4. Clerk Backend API (`clerkClient().users.getUser`) is the live role boundary for mutations.
5. PostgreSQL is the business-data boundary. The app role cannot change schema.
6. Webhooks are untrusted until `verifyWebhook()` succeeds.
7. Environment variables that are not `NEXT_PUBLIC_` stay on the server. The only public Clerk value is the publishable key.

## Request flow

Browser → `proxy.ts` (`clerkMiddleware`, strict CSP) → page or action → data access function that calls `auth()` if the data is private → Drizzle with parameters → Postgres.

Public pages do not call `auth.protect()`. They may call `auth()` only to know whether to show a future account link. Phase 1 does not show one.

## Flags

Server environment variables, read in one module `src/server/flags.ts`. All default false.

- `ACCOUNTS_ENABLED`
- `ADMIN_UI_ENABLED`
- `STOREFRONT_ENABLED`
- `CHECKOUT_ENABLED`
- `PAYMENTS_ENABLED`

Boot invariant: checkout requires storefront. Payments require checkout. If the invariant fails, the process throws at startup and does not serve traffic.

A false flag means the route calls `notFound()` before any query, and the nav config filters the link out.

## Data access

`src/server/db` holds the client. Queries live in functions that take an explicit scope, for example `getOrderForUser(userId, orderId)`. There is no `getOrder(orderId)` in application code.

Content that is public (crops, pages) can be typed modules in `src/content` in Phase 1, with fields shaped like the future tables, so a later move to the database does not change the pages. Users, subscribers, contact messages, webhook events, and the audit log are in Postgres from the start.

## Rendering and CSP

Strict CSP (`contentSecurityPolicy: { strict: true }` on `clerkMiddleware`) needs a nonce per request. Clerk’s guide says pages then render on the request, with `ClerkProvider` set to `dynamic` inside suspense, and `connection()` in that tree. That costs the static shell. It is accepted. The package must be `@clerk/nextjs` ≥ 7.7.8 so the fraud-protection hosts on non-443 ports are included. Older 7.5–7.7 builds allow those hosts only on 443 and will break bot protection under CSP.

`createRouteMatcher` is deprecated. Do not add it. Keep `clerkMiddleware()` bare. Do not protect routes only in the proxy.

## Errors

Actions return a small result object: `{ ok: true }` or `{ ok: false, message }` where `message` is one of a fixed set. Logs get the detail with `Authorization`, `Cookie`, and webhook signatures removed.

## Files the app will have

Listed in `22-phase-1-implementation-plan.md`. This document does not create them.
