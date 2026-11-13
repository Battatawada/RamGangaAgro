# 30 — Authentication and the admin path

Checked against the installed `@clerk/nextjs` 7.9.25 on 13 November 2026. The types used below are in that install: `factorVerificationAge` is `[firstFactorAge, secondFactorAge] | null` on the auth object, and `users.getUser()` returns `publicMetadata`, `unsafeMetadata`, and `twoFactorEnabled`. No authentication code was changed in this pass. The live checks from `25-phase-1-integration-verification.md` still stand. This document does not certify the system.

## Public visitors

Browsing does not require a session. Home, the farm pages, the crop, the journal, contact, follow, unsubscribe, privacy, and terms do not call `auth.protect()`.

Contact and the harvest-notes signup do not require an account. They store what the person typed, under the rate limit in `33-rate-limiting.md`. Unsubscribe removes a listed address, or changes nothing, and uses one public sentence either way.

Sign-in and sign-up routes exist for the invited operator. They are not linked from the public navigation. Access mode stays invite-only. The five flags stay false, so account, shop, cart, checkout, and admin URLs 404.

## Future customers

Customer accounts turn on only when `ACCOUNTS_ENABLED` is set to `true` on purpose. That change does not alter admin authorization.

The intended steps, already sketched in `23-future-commerce-plan.md`:

1. The farm decides accounts are a real launch, not a preview.
2. Clerk’s production access mode changes from invite-only to open in the Dashboard. That is a separate decision from the flag.
3. The public nav may then show Account. Browsing, contact, and the notes list stay available without a session.
4. `requireUser()` resolves `auth().userId` and loads the row by that id. A missing row is created only after `users.getUser()` confirms the id. The role on that row comes from live `publicMetadata`, and is `customer` unless that metadata is exactly `admin`.
5. A future order or address is loaded with the internal user id from that row. A client-supplied id is not the owner.

Session claims, including a stale `metadata.role`, are not an authorization decision. `unsafeMetadata` is not read.

## Administrators

The gate is `requireAdmin()` in `src/server/auth/require-admin.ts`. It already does this, and the development instance was tested against it:

1. Refuse a missing session (`no_session`).
2. Read `factorVerificationAge[1]`. Null or `-1` means no second factor is enrolled (`no_second_factor`). Reverification alone is not enough, because Clerk downgrades a second-factor check when nothing is enrolled.
3. Call `clerkClient().users.getUser(userId)`. A throw is `lookup_failed` and the call stops.
4. Accept only live `publicMetadata.role === "admin"` (`not_admin` otherwise).
5. Require `twoFactorEnabled === true`.

A role that was true in the session and has since been revoked fails on the next call. That was tested without signing out. `unsafeMetadata.role` does not grant admin. Instance-wide “require MFA” stays off so it is not forced on future customers. SMS MFA stays off. TOTP and backup codes stay on. A passkey does not satisfy this gate.

There is no admin UI. `ADMIN_UI_ENABLED` is false, and `/admin` has no page, so it 404s. Do not add the page until the path below is built.

## Future admin UI

When `ADMIN_UI_ENABLED` is turned on, the work is:

1. The flag is the only thing that mounts the routes. While it is false, `notFound()` runs before a query. The proxy is not the authorization boundary. Every page, action, and route handler calls `requireAdmin()` itself.
2. A mutation also calls the auth object’s `has({ reverification: "strict" })`. In this SDK, `"strict"` is a `ReverificationConfig`. If it fails, return the reverification error and do not write. This call is not wired today, because there is no admin mutation to protect.
3. The mutation and its `audit_log` row commit in one transaction. The note records the action and the target. It does not store a message body, a token, or a secret.
4. The runtime connection remains `rga_app`. The migrator, the inbox reader, and the privacy login are not placed in the hosting environment. Reading contact messages stays on `npm run messages:read` until an admin reader is built that commits the audit row before showing anything.
5. Role changes go through the Clerk Backend API `updateUserMetadata` on `publicMetadata`, then wait for the webhook to move the replica. The form does not write `users.role` by itself.
6. Revocation is the live `getUser()` check. A stale session claim must keep failing, as it did in the development test. Backend lookup failures stay closed.

Least privilege for a future editor is still the `admin` role plus the second factor. Do not add a second role until there is a job that should not be able to do what an admin can do.
