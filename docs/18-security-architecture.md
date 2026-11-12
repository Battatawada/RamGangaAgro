# 18 — Security architecture

Verified against Clerk and Next.js docs on 12 November 2026, as cited in `20-clerk-integration-plan.md`. Packages are not installed. Completing this document does not secure a system that has not been built.

## Identity

Clerk is the identity provider. The public site does not require a session. Access mode is Invite-only until customer accounts are an explicit launch. Nobody becomes an admin by signing up.

The role authority is `publicMetadata.role`, written by the Clerk Dashboard or `users.updateUserMetadata` on the server. The session token carries only:

```json
{ "metadata": { "role": "{{user.public_metadata.role}}" } }
```

That claim can lag by up to 60 seconds. Postgres `users.role` is a replica written by the verified webhook. A mutation that grants power calls `users.getUser()` and reads the live metadata.

`unsafeMetadata` is never read for a decision.

Clerk’s `has({ role })` and `has({ permission })` need an active Organization. This project does not use Organizations. Do not copy the organization permission examples. Use the basic metadata RBAC guide, and then the live `getUser()` check, which that guide’s sample omits.

Allowed roles: `admin`, `customer`. Anything else is stored as `customer`.

## Admin MFA

Instance-wide “Require multi-factor authentication” stays off, because it applies to every user. Admin routes, when they exist, require:

1. A session.
2. Live `publicMetadata.role === "admin"`.
3. A second factor enrolled: `factorVerificationAge[1] !== -1`, and on a mutation `twoFactorEnabled === true`.

This second check is mandatory. Clerk downgrades a `second_factor` reverification to `first_factor` when no second factor is enrolled. Reverification alone would admit a password-only admin.

SMS MFA stays off. TOTP and backup codes stay on. Passkeys may be on. A passkey does not, by Clerk’s docs, turn MFA on by itself, so it does not satisfy the admin gate.

Phase 1 ships `requireAdmin()` and tests for it. It does not ship `/admin` pages. The URL 404s while `ADMIN_UI_ENABLED` is false. The function is still tested so the gate exists before the UI.

Sensitive future actions also call `has({ reverification: "strict" })` and return `reverificationError("strict")`.

## Ownership

Customer data, when it exists, is loaded with the internal user id resolved from `auth().userId`. A client-supplied id is not the owner. A missing user row fails closed.

## Webhooks

`POST /api/webhooks/clerk` is public. `verifyWebhook()` from `@clerk/nextjs/webhooks` runs before the body is trusted. Bad signatures return 400. Database failures return 500 so Clerk retries. Success returns 200 after commit.

`webhook_events` has a unique `(provider, event_id)`. Insert that row in the same transaction as the effect. A conflict means the event was already done. Return 200.

Upsert users on `clerk_user_id`. Store the event time. A later delete wins over an earlier update. Role on the replica comes from `public_metadata` only when the value is exactly `admin` or `customer`.

Do not log the raw payload.

## Headers and input

Strict CSP as in doc 17. Also `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` that disables camera, microphone, and geolocation, `poweredByHeader: false`. HSTS in production only, after every hostname on the certificate is HTTPS. Preload is a later decision.

Zod `.strict()` on every action. Rate limits in a shared store. Server Action body size stays at the 1MB default. Next.js checks `Origin` against `Host`. Set `serverActions.allowedOrigins` only for the real hosts.

Journal and crop bodies, when they come from the database, are Markdown rendered without raw HTML.

## Secrets

`.env` and `.env.local` are gitignored. `.env.example` lists keys with empty values. CI fails if the client build contains `sk_live`, `sk_test`, `CLERK_SECRET`, `DATABASE_URL`, or `WHSEC_`.

## Database

Four roles. The app role does the site’s writes and may not select contact messages. The migration role changes schema and may not read the inbox. The messages reader may select contact messages and insert an audit row, and nothing else. That audit row is committed before any message is shown. If the commit fails, the read stops with no output. The privacy role may delete one address’s contact and subscriber rows and insert an audit row, and is not used to browse. Connections use TLS. Backups are the provider’s point-in-time recovery. A restore drill is required before production, into a separate database, checking one user row and one crop. The drill is operational. Phase 1 documents the steps in the runbook and does not pretend a drill has been run. Reading uses the script in doc 19, not a session with the migrator.

## Audit

The table exists in Phase 1. Writers in Phase 1: webhook processing (event received, user upserted) and role conflicts. Admin content mutations wait for Phase 2 and must use the same table in the same transaction as the change.

## Threats the tests must show they can catch

A forged webhook. A signup-shaped role. A customer id swap, once orders exist. A stale admin claim, once admin mutations exist. A payment return URL, once payments exist. Secret strings in the client bundle. Those tests that can run in Phase 1 are listed in doc 21. The rest are specified now and gated on the feature existing, so they are not forgotten and not faked.

## Privacy

Collect name, email, message, consent time. Do not collect a phone number. Do not log tokens or message bodies at info level. Deletion in Phase 1 is a manual process described on the privacy page: a person writes via the contact form, and the operator deletes or anonymises the rows. Self-serve deletion arrives with accounts.
