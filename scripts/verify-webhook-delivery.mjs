/**
 * Sends a real Clerk user update and checks the development webhook.
 * Prints statuses only.
 */
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHmac, randomUUID } from "node:crypto";
import { Resolver } from "node:dns/promises";
import postgres from "postgres";

function readEnv(path) {
  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

const local = readEnv(".env.local");
const stored = readEnv(".verify-clerk.local");
const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) console.error(`FAIL ${name} ${detail}`);
}

const headerFile = join(tmpdir(), "rga-last-webhook-headers.json");
const bodyFile = join(tmpdir(), "rga-last-webhook-body.bin");
for (const file of [headerFile, bodyFile]) if (existsSync(file)) unlinkSync(file);

const updated = await fetch(`https://api.clerk.com/v1/users/${stored.USER_ID}`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${local.CLERK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ first_name: "Filed" }),
});
record("clerk-user-update", updated.status === 200, String(updated.status));

const deadline = Date.now() + 20000;
while (!existsSync(bodyFile) && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 500));
}
record("real-delivery-captured", existsSync(bodyFile));
if (existsSync(headerFile)) {
  const names = Object.keys(JSON.parse(readFileSync(headerFile, "utf8")));
  record(
    "delivery-header-names",
    names.includes("svix-id") && names.includes("svix-signature"),
    names.filter((name) => name.startsWith("svix") || name.startsWith("content")).join(","),
  );
}

let replayStatus = 0;
let deliveryId = "";
if (existsSync(bodyFile)) {
  const headers = JSON.parse(readFileSync(headerFile, "utf8"));
  deliveryId = headers["svix-id"] ?? "";
  const body = readFileSync(bodyFile);
  const replay = await fetch("http://localhost:3000/api/webhooks/clerk", {
    method: "POST",
    headers: {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
      "content-type": headers["content-type"] ?? "application/json",
    },
    body,
  });
  replayStatus = replay.status;
}
record("replayed-delivery-accepted", replayStatus === 200, String(replayStatus));
if (existsSync(bodyFile)) {
  const headers = JSON.parse(readFileSync(headerFile, "utf8"));
  const body = readFileSync(bodyFile);
  const key = Buffer.from(local.CLERK_WEBHOOK_SIGNING_SECRET.slice("whsec_".length), "base64");
  const expected = createHmac("sha256", key)
    .update(`${headers["svix-id"]}.${headers["svix-timestamp"]}.${body.toString("utf8")}`)
    .digest("base64");
  const age = Math.abs(Date.now() / 1000 - Number(headers["svix-timestamp"]));
  record(
    "captured-signature-matches-stored-secret",
    String(headers["svix-signature"] ?? "").includes(expected),
    `age ${Math.round(age)}s bytes ${body.length}`,
  );
}

const secret = local.CLERK_WEBHOOK_SIGNING_SECRET;
function sign(id, payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const key = Buffer.from(secret.slice("whsec_".length), "base64");
  const signature = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest("base64");
  return {
    "svix-id": id,
    "svix-timestamp": String(timestamp),
    "svix-signature": `v1,${signature}`,
  };
}

async function postSigned(id, payload) {
  const response = await fetch("http://localhost:3000/api/webhooks/clerk", {
    method: "POST",
    headers: { ...sign(id, payload), "content-type": "application/json" },
    body: payload,
  });
  return response.status;
}

const unknownPayload = JSON.stringify({ type: "email.created", data: { id: "idn_probe" } });
record("unknown-event-accepted", (await postSigned(`msg_${randomUUID()}`, unknownPayload)) === 200);

const unsafePayload = JSON.stringify({
  type: "user.updated",
  data: {
    id: stored.USER_ID,
    first_name: "Phase",
    email_addresses: [],
    public_metadata: {},
    unsafe_metadata: { role: "admin" },
  },
});
record(
  "unsafe-webhook-accepted",
  (await postSigned(`msg_${randomUUID()}`, unsafePayload)) === 200,
);

const url = local.DATABASE_URL;
const parsed = new URL(url);
if (!parsed.hostname.startsWith("ep-flat-credit-a1e3xifz")) {
  throw new Error("refusing a connection that is not the development branch");
}
const resolver = new Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);
let addresses;
try {
  addresses = await resolver.resolve4(parsed.hostname);
} catch {
  const cname = await resolver.resolveCname(parsed.hostname);
  addresses = await resolver.resolve4(cname[0]);
}
const sql = postgres({
  host: addresses[0],
  port: Number(parsed.port || 5432),
  username: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.replace(/^\//, ""),
  ssl: { servername: parsed.hostname, rejectUnauthorized: true },
  max: 1,
});

try {
  const [who] = await sql`select current_user`;
  record("webhook-check-uses-app-role", who.current_user === "rga_app", who.current_user);
  const events = await sql`
    select count(*)::int as n from webhook_events where provider = 'clerk' and event_id = ${deliveryId}
  `;
  record("real-event-recorded-once", deliveryId !== "" && events[0].n === 1, String(events[0].n));
  const [user] = await sql`
    select role from users where clerk_user_id = ${stored.USER_ID}
  `;
  record("webhook-did-not-grant-admin", !user || user.role !== "admin", user?.role ?? "absent");
} finally {
  await sql.end({ timeout: 5 });
  for (const file of [headerFile, bodyFile]) if (existsSync(file)) unlinkSync(file);
}

const failed = results.filter((item) => !item.ok);
console.log(JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results }, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
