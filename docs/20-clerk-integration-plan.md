# 20 — Clerk integration plan

Docs read on 12 November 2026. No Clerk application is connected to this repository. Dashboard settings below are instructions for the human who owns the Clerk account. Claude does not click through production. Claude reads the keys from the environment.

## Docs that fix the API shape

- `clerkMiddleware()` in `proxy.ts` for Next.js 16, `middleware.ts` for 15 and below. `https://clerk.com/docs/reference/nextjs/clerk-middleware`
- Protect each page, action, and handler with `auth()` / `auth.protect()`. `https://clerk.com/docs/nextjs/guides/secure/protect-content`
- Organization `has({ permission })` is the wrong model here. `https://clerk.com/docs/nextjs/guides/secure/authorization-checks` states that role and permission checks need an active Organization.
- Metadata RBAC: `https://clerk.com/docs/guides/secure/basic-rbac`
- Session claim freshness, up to 60 seconds, and the 1.2KB custom-claim budget: `https://clerk.com/docs/guides/sessions/customize-session-tokens`
- `fva` / `factorVerificationAge`: `https://clerk.com/docs/guides/sessions/session-tokens` and the Auth object reference
- Reverification downgrades if no second factor exists: `https://clerk.com/docs/guides/secure/reverification`
- `verifyWebhook` from `@clerk/nextjs/webhooks`: `https://clerk.com/docs/nextjs/guides/development/webhooks/syncing`
- Public, private, and unsafe metadata: `https://clerk.com/docs/guides/users/extending`
- Invite-only access mode (`restricted`): `https://clerk.com/docs/guides/secure/restricting-access`
- Suspicious sign-up challenges: `https://clerk.com/docs/guides/protect/bot-protection`
- Billing is subscriptions, USD, Stripe, and not refunds inside Clerk: `https://clerk.com/docs/guides/billing/overview`
- CSP strict mode and the 7.7.8 floor: `https://clerk.com/docs/guides/secure/best-practices/csp-headers`

`createRouteMatcher` is deprecated. Do not add it.

## Two instances

Development and production are separate Clerk instances and separate databases. User data does not move between them. Production uses custom Google credentials. Development may use Clerk’s shared social credentials.

Production domain `rgagro.me`. Allowed origins and redirect URLs include `https://rgagro.me` and the local dev origin. No wildcard.

## Dashboard

| Setting | Value |
|---|---|
| Access mode | Invite-only |
| Email | Required. Verify with a code |
| Sign-in | Email code, Google, password. Preferred first factor: email code |
| Password | On, with lockout and Device Trust, because the requirements asked for password recovery. Enumeration protection must stay on |
| MFA methods | Authenticator app, backup codes. SMS off |
| Require MFA for all users | Off |
| Passkeys | On |
| Organizations | Off |
| Billing | Off |
| Protections | Challenge suspicious sign-ups. Lockout. Enumeration protection. Block disposable emails. Block subaddresses |
| Session claim | `{ "metadata": { "role": "{{user.public_metadata.role}}" } }` |
| First admin | Created in the Dashboard. `publicMetadata` set to `{ "role": "admin" }` by the Dashboard, then TOTP enrolled before any future admin UI is used |

## Application

- `ClerkProvider` with `dynamic`, inside suspense, in the root layout, after `connection()` if strict CSP requires it.
- `<SignIn />` and `<SignUp />` on the Clerk catch-all routes. No link to them in the public nav.
- Webhook route as in doc 18. Signing secret `CLERK_WEBHOOK_SIGNING_SECRET`. The route is not behind `auth.protect()`.
- `src/server/auth/require-user.ts` resolves `auth().userId` to a `users` row, creating a `customer` row only after `getUser()` confirms the id, and only with role `customer` unless live metadata says `admin`.
- `src/server/auth/require-admin.ts` implements the gate in doc 18. Phase 1 exports it and tests it with a mocked `auth` and a mocked client. No page imports it into a rendered admin UI.

## What Phase 1 does not render

`<UserButton />`, `<UserProfile />`, an account link, an organization switcher, a pricing table.

## Environment

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

`CLERK_SECRET_KEY` and the webhook secret are server-only. The publishable key is the only `NEXT_PUBLIC` Clerk value.

## Unverified until install

The exact version number beyond the documented floor of 7.7.8 for CSP. The precise TypeScript name of `factorVerificationAge` on the object returned by `auth()` in that version. Claude checks the installed type definitions and uses the field the types expose (`factorVerificationAge` or the `fva` claim on `sessionClaims`). The behaviour to preserve is: second factor age `-1` means none is enrolled.
