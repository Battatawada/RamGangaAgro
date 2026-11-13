# Runbook — Phase 1

This is the operator’s book for the public site. Completing a step here does not make the site secure. The security tests in `21-testing-and-acceptance-criteria.md` are the claim that can be made.

## Environment

Keys are listed empty in `.env.example`. None of them go into git.

| Variable | Who uses it |
|---|---|
| `DATABASE_URL` | The Next.js process. Role `rga_app`. |
| `DATABASE_URL_MIGRATE` | `npm run db:migrate` only. Role `rga_migrator`. |
| `DATABASE_URL_MESSAGES` | `npm run messages:read` only. Role `rga_messages_reader`. |
| `DATABASE_URL_PRIVACY` | `npm run contact:erase` only. Role `rga_privacy`. |
| `RATE_LIMIT_PROVIDER` | `postgres` or `upstash`. Required outside tests. `postgres` uses `DATABASE_URL` and no other database URL. | 
| `RATE_LIMIT_IP_SOURCE` | `direct` on a local machine. `vercel` or `trusted-proxy` in production. `direct` is refused when `NODE_ENV` is production. |
| `RATE_LIMIT_REDIS_URL`, `RATE_LIMIT_TOKEN` | Only when the provider is `upstash`. The URL must be `https`. |
| Clerk keys | As in `docs/20-clerk-integration-plan.md`. |

The app process never receives the migrator, reader or privacy URLs.

## First database

1. Create a Postgres database.
2. As a superuser, run only the role section of `db/grants.sql` (the four `CREATE ROLE` statements and the schema grants), with real passwords that are not committed. The table grants cannot run yet, because the tables do not exist.
3. As a superuser, run `CREATE SCHEMA drizzle AUTHORIZATION rga_migrator` once. Do not leave database `CREATE` on `rga_migrator`. The migrate script refuses to create that schema itself.
4. Set `DATABASE_URL_MIGRATE` to the `rga_migrator` login and run `npm run db:migrate`. The script refuses any host that is not the development branch until that guard is deliberately changed for a production database. The migrator owns the tables it creates.
5. Run `npm run db:grants` (sections 2 to 5 of `db/grants.sql`). Re-run it after every later migration, so a new table does not inherit a privilege this file means to refuse.
6. Set `DATABASE_URL` to the app role. Set `RATE_LIMIT_PROVIDER=postgres` and `RATE_LIMIT_IP_SOURCE` to `vercel` or `trusted-proxy`, then deploy. `npm run check:rate-limit -- --production` must pass against the production environment before forms are expected to succeed.

## First admin

1. In the production Clerk Dashboard, create the person as a user (invite-only).
2. Set `publicMetadata` to `{ "role": "admin" }` from the Dashboard. Never from the browser.
3. Have them enrol TOTP and store the backup codes before any future admin UI is used.
4. Instance-wide “Require multi-factor authentication” stays off. Application code still refuses a session whose second factor is not enrolled.

## Reading the contact inbox

There is no admin UI. The migration login is not the workaround.

```
npm run messages:read -- --reason "replying to a note about the harvest"
```

- Requires `DATABASE_URL_MESSAGES`.
- Requires a `--reason` of at least eight characters.
- The script inserts an audit row (`contact_messages.read`) and commits that transaction. Only after the commit succeeds does it select and print messages.
- If the insert fails, the commit fails, or the connection drops before commit, the script prints nothing, writes no file, and exits non-zero.
- The reader role cannot update or delete a message, and it cannot update or delete its own audit row.

## Erasing a contact address

```
npm run contact:erase -- --email someone@example.com --reason "erasure request via contact form"
```

- Requires `DATABASE_URL_PRIVACY`.
- Deletes that address’s rows in `contact_messages` and `subscribers`.
- Writes an audit row first. It is not the reader and not the migrator.

## Clerk webhook

Point the production Clerk instance at `https://rgagro.me/api/webhooks/clerk` with the production signing secret. A bad signature returns 400. A storage failure returns 500 so Clerk retries. A duplicate `svix-id` returns 200 and changes nothing.

## Backups

Switch on the provider’s point-in-time recovery. A restore drill, into a separate database, checking one user row and one crop, is required before production. Phase 1 does not claim the drill has been run.

Restore outline:

1. Create a new empty database.
2. Restore from the provider’s PITR to a chosen time.
3. Connect with a read-only session and confirm one `users` row and one `products` or content crop.
4. Do not point the live site at the restored database until the check passes.

## Flags

All five stay false until a later phase turns them on with a deliberate change:

```
ACCOUNTS_ENABLED=false
ADMIN_UI_ENABLED=false
STOREFRONT_ENABLED=false
CHECKOUT_ENABLED=false
PAYMENTS_ENABLED=false
```

Checkout without a storefront, or payments without checkout, throws at boot.
