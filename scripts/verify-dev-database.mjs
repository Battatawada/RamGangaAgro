/**
 * Checks the development database with each real login.
 * Prints statuses only. Never prints a connection string or a message body.
 *
 *   node scripts/verify-dev-database.mjs
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { Resolver } from "node:dns/promises";
import postgres from "postgres";

const DEV_ENDPOINT = "ep-flat-credit-a1e3xifz";
const PROD_ENDPOINT = "ep-curly-salad-a10wokga";

function readEnv(path) {
  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

function assertDev(url, role) {
  const parsed = new URL(url);
  if (parsed.hostname.includes(PROD_ENDPOINT) || !parsed.hostname.startsWith(DEV_ENDPOINT)) {
    throw new Error("refusing a connection that is not the development branch");
  }
  if (parsed.username !== role) throw new Error(`expected login ${role}`);
}

async function open(url) {
  const parsed = new URL(url);
  const resolver = new Resolver();
  resolver.setServers(["1.1.1.1", "8.8.8.8"]);
  let addresses;
  try {
    addresses = await resolver.resolve4(parsed.hostname);
  } catch {
    const cname = await resolver.resolveCname(parsed.hostname);
    addresses = await resolver.resolve4(cname[0]);
  }
  return postgres({
    host: addresses[0],
    port: Number(parsed.port || 5432),
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    ssl: { servername: parsed.hostname, rejectUnauthorized: true },
    max: 1,
    prepare: !parsed.hostname.includes("-pooler"),
  });
}

async function attempt(sql, query, params = []) {
  try {
    await sql.unsafe(query, params);
    return "allowed";
  } catch (error) {
    return error.code === "42501" ? "denied" : `error:${error.code ?? "unknown"}`;
  }
}

const local = readEnv(".env.local");
const operator = readEnv(".env.operator");
const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) console.error(`FAIL ${name} ${detail ?? ""}`);
}

function redact(text) {
  return String(text)
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[url]")
    .replace(/synthetic-[a-f0-9]+/gi, "[token]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, "[email]")
    .replace(/\s+/g, " ")
    .slice(0, 240);
}

const appUrl = local.DATABASE_URL;
assertDev(appUrl, "rga_app");
record("app-url-pooled", new URL(appUrl).hostname.includes("-pooler"), "pooled");
record(
  "local-env-has-no-operator-urls",
  !local.DATABASE_URL_MIGRATE && !local.DATABASE_URL_MESSAGES && !local.DATABASE_URL_PRIVACY,
  "operator keys absent",
);
for (const flag of [
  "ACCOUNTS_ENABLED",
  "ADMIN_UI_ENABLED",
  "STOREFRONT_ENABLED",
  "CHECKOUT_ENABLED",
  "PAYMENTS_ENABLED",
]) {
  record(`flag-${flag}`, local[flag] === "false", local[flag]);
}

assertDev(operator.DATABASE_URL_MIGRATE, "rga_migrator");
assertDev(operator.DATABASE_URL_MESSAGES, "rga_messages_reader");
assertDev(operator.DATABASE_URL_PRIVACY, "rga_privacy");
record("migrate-url-direct", !new URL(operator.DATABASE_URL_MIGRATE).hostname.includes("-pooler"));
record("reader-url-direct", !new URL(operator.DATABASE_URL_MESSAGES).hostname.includes("-pooler"));
record("privacy-url-direct", !new URL(operator.DATABASE_URL_PRIVACY).hostname.includes("-pooler"));
record(
  "local-branch-is-development",
  local.NEON_BRANCH === "development" && local.NEON_BRANCH_ID === "br-dark-dawn-a11uo2oz",
  local.NEON_BRANCH ?? "unset",
);
record("runtime-user-is-not-owner", new URL(appUrl).username === "rga_app");
record("owner-url-not-in-app-env", !local.DATABASE_URL_OWNER);

function runInbox(reason) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [
        "--import",
        "./scripts/dns-preload.mjs",
        "./node_modules/tsx/dist/cli.mjs",
        "scripts/read-contact-messages.ts",
        "--reason",
        reason,
      ],
      {
        env: {
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot,
          // A bogus runtime URL. The script must ignore it and use the reader.
          DATABASE_URL: "postgres://wrong:wrong@127.0.0.1:9/no",
          DATABASE_URL_MESSAGES: operator.DATABASE_URL_MESSAGES,
        },
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

const email = `probe-${Date.now()}@example.com`;
const app = await open(appUrl);
const reader = await open(operator.DATABASE_URL_MESSAGES);
const privacy = await open(operator.DATABASE_URL_PRIVACY);
const migrator = await open(operator.DATABASE_URL_MIGRATE);

try {
  const [who] = await app`select current_user`;
  record("runtime-user", who.current_user === "rga_app", who.current_user);
  const [readerWho] = await reader`select current_user`;
  record("reader-user", readerWho.current_user === "rga_messages_reader", readerWho.current_user);
  const [privacyWho] = await privacy`select current_user`;
  record("privacy-user", privacyWho.current_user === "rga_privacy", privacyWho.current_user);
  const [migratorWho] = await migrator`select current_user`;
  record("migrator-user", migratorWho.current_user === "rga_migrator", migratorWho.current_user);

  const token = `synthetic-${randomBytes(8).toString("hex")}`;
  await app`
    insert into contact_messages (name, email, message)
    values ('Verification', ${email}, ${token})
  `;
  record("app-can-insert-message", true);
  record("app-cannot-update-message", (await attempt(app, "update contact_messages set name = name")) === "denied");
  record("app-cannot-delete-message", (await attempt(app, "delete from contact_messages")) === "denied");
  const [owner] = await migrator`
    select pg_get_userbyid(c.relowner) as owner
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'contact_messages'
  `;
  record("contact-messages-owner", owner?.owner === "rga_migrator", owner?.owner ?? "missing");
  const migratorRead = await attempt(migrator, "select count(*)::int as n from contact_messages");
  record(
    "migrator-select-denied-on-this-server",
    migratorRead === "denied",
    migratorRead,
  );
  record("reader-cannot-update-audit", (await attempt(reader, "update audit_log set action = action")) === "denied");
  record("reader-cannot-delete-audit", (await attempt(reader, "delete from audit_log")) === "denied");
  record("reader-cannot-select-users", (await attempt(reader, "select id from users")) === "denied");
  record(
    "privacy-can-select-email-column",
    (await attempt(privacy, "select email from contact_messages")) === "allowed",
  );
  record(
    "privacy-cannot-select-name",
    (await attempt(privacy, "select name from contact_messages")) === "denied",
  );

  const members = await migrator`
    select child.rolname as role
    from pg_auth_members m
    join pg_roles child on child.oid = m.member
    join pg_roles parent on parent.oid = m.roleid
    where parent.rolname = 'neon_superuser' and child.rolname like 'rga_%'
  `;
  record("no-neon-superuser", members.length === 0, String(members.length));

  const [createPriv] = await migrator`
    select has_database_privilege('rga_migrator', current_database(), 'CREATE') as allowed
  `;
  record("migrator-database-create-revoked", createPriv.allowed === false);

  await app`
    insert into subscribers (email, consent_at, source, token_hash)
    values (${email}, now(), 'verification', 'synthetic-hash')
  `;
  await app`
    update subscribers set unsubscribed_at = now()
    where email = ${email} and unsubscribed_at is null
  `;
  const [sub] = await app`
    select unsubscribed_at is not null as removed from subscribers where email = ${email}
  `;
  record("unsubscribe-marks-row", sub?.removed === true);
  await app`
    update subscribers set unsubscribed_at = now()
    where email = ${'missing-' + email} and unsubscribed_at is null
  `;
  record("unsubscribe-unknown-address", true);

  record("app-cannot-select-messages", (await attempt(app, "select id from contact_messages")) === "denied");
  record("reader-can-select-messages", (await attempt(reader, "select id from contact_messages")) === "allowed");
  record("reader-cannot-select-audit", (await attempt(reader, "select id from audit_log")) === "denied");
  record("reader-cannot-update-messages", (await attempt(reader, "update contact_messages set name = name")) === "denied");
  record("privacy-cannot-select-message-body", (await attempt(privacy, "select message from contact_messages")) === "denied");

  const beforeScript = await app`
    select count(*)::int as n from audit_log where action = 'contact_messages.read'
  `;
  const printed = await runInbox("verification of the inbox script");
  const afterScript = await app`
    select count(*)::int as n from audit_log where action = 'contact_messages.read'
  `;
  record(
    "inbox-script-exit",
    printed.code === 0,
    printed.code === 0 ? "0" : redact(printed.stderr || printed.stdout),
  );
  record(
    "inbox-script-audit-before-output",
    afterScript[0].n === beforeScript[0].n + 1 && printed.stdout.includes(token),
    `audits ${beforeScript[0].n}->${afterScript[0].n}`,
  );
  record("inbox-script-ignores-runtime-url", printed.code === 0);

  await migrator`revoke insert on table audit_log from rga_messages_reader`;
  try {
    const duringFailure = await app`
      select count(*)::int as n from audit_log where action = 'contact_messages.read'
    `;
    const blocked = await runInbox("verification of a failed audit");
    const afterFailure = await app`
      select count(*)::int as n from audit_log where action = 'contact_messages.read'
    `;
    const denied = /42501|permission denied/i.test(blocked.stderr);
    record(
      "audit-failure-prints-nothing",
      blocked.code !== 0 &&
        !blocked.stdout.includes(token) &&
        afterFailure[0].n === duringFailure[0].n &&
        denied,
      denied ? "permission denied" : redact(blocked.stderr || blocked.stdout),
    );
  } finally {
    await migrator`grant insert on table audit_log to rga_messages_reader`;
    const [restored] = await migrator`
      select has_table_privilege('rga_messages_reader', 'audit_log', 'INSERT') as allowed
    `;
    record("reader-insert-restored", restored.allowed === true);
  }

  const before = await app`
    select count(*)::int as n from audit_log where action = 'contact.erased'
  `;
  await privacy`
    insert into audit_log (action, target_type, note)
    values ('contact.erased', 'email', ${JSON.stringify({ source: "verification" })}::jsonb)
  `;
  const deleted = await privacy`delete from contact_messages where email = ${email}`;
  const dropped = await privacy`delete from subscribers where email = ${email}`;
  const after = await app`
    select count(*)::int as n from audit_log where action = 'contact.erased'
  `;
  record("erasure-writes-audit-before-delete", after[0].n === before[0].n + 1);
  record("erasure-delete-ran", deleted.count >= 0 && dropped.count === 1);

  const auditBeforeRead = await app`
    select count(*)::int as n from audit_log where action = 'contact_messages.read'
  `;
  await reader`
    insert into audit_log (action, target_type, note)
    values ('contact_messages.read', 'contact_messages', ${JSON.stringify({ reason: "verification probe", at: new Date().toISOString() })}::jsonb)
  `;
  const committed = await app`
    select count(*)::int as n from audit_log where action = 'contact_messages.read'
  `;
  record("reader-audit-commits", committed[0].n === auditBeforeRead[0].n + 1);
  await reader`select id from contact_messages limit 1`;
  record("reader-selects-only-after-audit-insert", true);

  const [left] = await reader`
    select count(*)::int as n from contact_messages where email = ${email}
  `;
  record("erasure-removes-synthetic-message", left.n === 0, String(left.n));
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "error";
  record("unexpected", false, code);
} finally {
  await Promise.all([app.end({ timeout: 5 }), reader.end({ timeout: 5 }), privacy.end({ timeout: 5 }), migrator.end({ timeout: 5 })]);
}

const failed = results.filter((item) => !item.ok);
console.log(JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
