-- Ram Ganga Agro database roles and grants.
-- Section 1 (roles and schema grants) runs before the first migration.
-- Sections 2 to 5 run after it, because they name tables. Re-run sections
-- 2 to 5 after every later migration. See docs/runbook.md.
-- Four logins, four jobs. See docs/19 and docs/runbook.md.
--
-- Replace every :password placeholder before running. Do not commit real
-- passwords to this file.

-- 1. Roles ------------------------------------------------------------------

CREATE ROLE rga_migrator        LOGIN PASSWORD 'replace-me-migrator';
CREATE ROLE rga_app             LOGIN PASSWORD 'replace-me-app';
CREATE ROLE rga_messages_reader LOGIN PASSWORD 'replace-me-reader';
CREATE ROLE rga_privacy         LOGIN PASSWORD 'replace-me-privacy';

-- Nothing is granted by the public schema's default.
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO rga_app, rga_messages_reader, rga_privacy;
GRANT USAGE, CREATE ON SCHEMA public TO rga_migrator;

-- 2. rga_migrator: DDL only -------------------------------------------------
-- It owns the tables so migrations can alter them. It is never the runtime
-- connection, and it never reads the inbox.

ALTER DEFAULT PRIVILEGES FOR ROLE rga_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO rga_app;

REVOKE SELECT ON TABLE contact_messages FROM rga_migrator;

-- 3. rga_app: the running site ----------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON
  users, subscribers, webhook_events,
  products, product_variants, harvests, inventory,
  orders, order_items, addresses, media
TO rga_app;

-- The inbox is write-only for the site. A bug cannot list it.
GRANT INSERT ON TABLE contact_messages TO rga_app;
REVOKE SELECT, UPDATE, DELETE ON TABLE contact_messages FROM rga_app;

-- The audit log is append-only. The app may read it, and may not rewrite it.
GRANT SELECT, INSERT ON TABLE audit_log TO rga_app;
REVOKE UPDATE, DELETE ON TABLE audit_log FROM rga_app;

-- 4. rga_messages_reader: the operator's inbox script ------------------------
-- Exactly two privileges. Nothing else in the database.

GRANT SELECT ON TABLE contact_messages TO rga_messages_reader;
GRANT INSERT ON TABLE audit_log TO rga_messages_reader;
REVOKE SELECT, UPDATE, DELETE ON TABLE audit_log FROM rga_messages_reader;
REVOKE UPDATE, DELETE ON TABLE contact_messages FROM rga_messages_reader;

-- 5. rga_privacy: erasure only ----------------------------------------------
-- It deletes one address's rows and records that it did. It is not used to
-- browse the inbox, and it is not the migrator.

GRANT DELETE ON TABLE contact_messages, subscribers TO rga_privacy;
GRANT SELECT ON TABLE subscribers TO rga_privacy;
GRANT INSERT ON TABLE audit_log TO rga_privacy;
REVOKE SELECT ON TABLE contact_messages FROM rga_privacy;
-- Postgres needs SELECT on the columns a DELETE matches on. Only the address
-- is readable, so this login can erase a person's messages and cannot read
-- one.
GRANT SELECT (id, email) ON TABLE contact_messages TO rga_privacy;
REVOKE UPDATE, DELETE ON TABLE audit_log FROM rga_privacy;

-- Re-run sections 2 to 5 after every migration, so a table added later does
-- not inherit a default privilege that this file means to refuse.
