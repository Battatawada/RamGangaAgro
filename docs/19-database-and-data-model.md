# 19 — Database and data model

PostgreSQL. Drizzle. Parameterized queries only. No string concatenation into SQL.

## Roles

| Role | Can | Cannot |
|---|---|---|
| `rga_migrator` | DDL during migrations. Owns the tables it creates. This is a trusted operator login, not an application path. | Be the Next.js runtime connection. Be the inbox script. On the Neon development branch, PostgreSQL 18.7 honoured `REVOKE SELECT` and this login could not read `contact_messages`. Older PostgreSQL releases let owners bypass that revoke, so the denial is not a portable guarantee. |
| `rga_app` | DML on business tables except as narrowed below. INSERT and SELECT on `audit_log` | DDL. DELETE or UPDATE on `audit_log`. SELECT on `contact_messages` |
| `rga_messages_reader` | SELECT on `contact_messages` only. INSERT on `audit_log` only | Every other table. UPDATE, DELETE, or SELECT on `audit_log`. DDL. Any use by the Next.js runtime |

`DATABASE_URL` is the app role. `DATABASE_URL_MIGRATE` is the migrator. `DATABASE_URL_MESSAGES` is the reader. The app process does not receive the migrator URL or the reader URL.

### Reading contact messages

There is no admin UI in Phase 1, and the migration login is not the workaround.

The operator runs one script, `scripts/read-contact-messages.ts`, with `DATABASE_URL_MESSAGES` and a required reason string. The script opens a transaction, inserts one `audit_log` row (`action`: `contact_messages.read`, `note`: the reason and the time), and commits that transaction. Only after the commit returns success may it select `contact_messages` and print them. If the insert fails, the commit fails, or the connection drops before commit, the script prints nothing, writes no file, and exits non-zero. A select inside the uncommitted transaction is not enough: the audit row has to be durable before any message is shown. The reader role cannot update or delete a message, and it cannot update or delete its own audit row. “Mark as read” waits for a later admin tool.

The app role’s grant on `contact_messages` is INSERT only, so a bug in the public site cannot list the inbox.

## Tables in the first migration

### users

- `id` uuid primary key
- `clerk_user_id` text not null unique
- `role` text not null default `customer` check in (`customer`, `admin`)
- `email` text
- `name` text
- `deleted_at` timestamptz
- `created_at`, `updated_at` timestamptz not null

No password column.

### subscribers

- `id` uuid pk
- `email` text not null unique
- `consent_at` timestamptz not null
- `confirmed_at` timestamptz null
- `unsubscribed_at` timestamptz null
- `source` text not null
- `token_hash` text not null
- `created_at` timestamptz not null

### contact_messages

- `id` uuid pk
- `name` text not null
- `email` text not null
- `message` text not null
- `created_at` timestamptz not null

No public read API.

### webhook_events

- `provider` text not null
- `event_id` text not null
- `received_at` timestamptz not null
- primary key (`provider`, `event_id`)

### audit_log

- `id` uuid pk
- `actor_clerk_user_id` text null
- `action` text not null
- `target_type` text not null
- `target_id` text null
- `note` jsonb null
- `created_at` timestamptz not null

`note` must not contain secrets, tokens, or full message bodies.

## Tables created empty, unused by Phase 1 UI

Created so later commerce does not invent a parallel schema. No Phase 1 route reads them except tests that assert they exist.

### products

`id`, `slug` unique, `name`, `summary`, `status` check in (`currently_growing`, `seasonal_harvest`, `coming_soon`, `available_soon`), `purchasable` boolean not null default false, timestamps.

### product_variants

`id`, `product_id` fk restrict, `name`, `sku` unique, `price_paise` integer not null check `>= 0`, `weight_grams` integer check `> 0`, `active` boolean.

### harvests

`id`, `product_id` fk, `batch_code` unique, `harvested_on` date, `field_label` text, `notes` text, `is_public` boolean default false.

### inventory

`id`, `variant_id` fk, `harvest_id` fk, `quantity` integer not null check `>= 0`.

### orders / order_items

Orders: `id`, `user_id` fk null, `email` text, `status`, `total_paise` integer check `>= 0`, `currency` text default `INR`, timestamps. Check: `user_id` is not null or `email` is not null. Phase 1 inserts nothing.

Order items: `order_id` fk restrict, `variant_id`, `harvest_id` null, `quantity` check `> 0`, `unit_price_paise` check `>= 0`.

### addresses

`user_id` fk restrict, lines, city, region, postal_code, country, `is_default`.

### media

`id`, `kind` check in (`illustration`, `image`, `video`), `src`, `alt`, `poster`.

Phase 1 may leave `media` empty and keep SVGs in the repo.

## Indexes

Unique indexes are the constraints above. Additional: `addresses.user_id`, `order_items.order_id`, `product_variants.product_id`, `harvests.product_id`.

## Deletion

Deleting a user row is restricted if orders exist. Phase 1 has no self-serve account deletion. A privacy request is a second script, `scripts/erase-contact.ts`, using `DATABASE_URL_PRIVACY` and role `rga_privacy`. That role may delete rows in `contact_messages` and `subscribers` for one email address, and may insert an audit row. It cannot select the inbox for browsing, and it is not the migrator. The read script and the erase script are different logins. Both write an audit row before they change or reveal anything.

## Seeds

Seed one product row for Raktshali only if the public pages read from the database. If they read from `src/content`, do not seed a price. `purchasable` stays false. Prefer content modules in Phase 1 so the site does not depend on a product row to render. The tables still migrate.

## Backups

Provider point-in-time recovery. Restore steps in `22`. A drill is a production-launch requirement, not a Phase 1 code task. Do not claim it has been done.
