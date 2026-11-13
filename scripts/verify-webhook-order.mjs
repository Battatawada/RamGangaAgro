/**
 * Signed out-of-order webhook check against the development database.
 * Prints statuses only.
 */
import { randomUUID } from "node:crypto";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
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
const secret = local.CLERK_WEBHOOK_SIGNING_SECRET;
const clerkUserId = `user_phase1_${randomUUID().slice(0, 8)}`;

function sign(id, payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const key = Buffer.from(secret.slice("whsec_".length), "base64");
  const signature = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest("base64");
  return {
    "svix-id": id,
    "svix-timestamp": String(timestamp),
    "svix-signature": `v1,${signature}`,
    "content-type": "application/json",
  };
}

async function post(type, metadata) {
  const payload = JSON.stringify({
    type,
    data: {
      id: clerkUserId,
      first_name: "Order",
      email_addresses: [],
      public_metadata: metadata,
      unsafe_metadata: { role: "admin" },
    },
  });
  const response = await fetch("http://localhost:3000/api/webhooks/clerk", {
    method: "POST",
    headers: sign(`msg_${randomUUID()}`, payload),
    body: payload,
  });
  return response.status;
}

const created = await post("user.updated", {});
const deleted = await post("user.deleted", {});
const late = await post("user.updated", { role: "admin" });

const url = new URL(local.DATABASE_URL);
if (!url.hostname.startsWith("ep-flat-credit-a1e3xifz")) {
  throw new Error("refusing a connection that is not the development branch");
}
const resolver = new Resolver();
resolver.setServers(["1.1.1.1", "8.8.8.8"]);
const addresses = await resolver.resolve4(url.hostname).catch(async () => {
  const cname = await resolver.resolveCname(url.hostname);
  return resolver.resolve4(cname[0]);
});
const sql = postgres({
  host: addresses[0],
  port: Number(url.port || 5432),
  username: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  ssl: { servername: url.hostname, rejectUnauthorized: true },
  max: 1,
});

try {
  const [row] = await sql`
    select role, deleted_at is not null as deleted
    from users
    where clerk_user_id = ${clerkUserId}
  `;
  const ok = created === 200 && deleted === 200 && late === 200 && row?.deleted === true && row?.role !== "admin";
  console.log(JSON.stringify({
    ok,
    created,
    deleted,
    late,
    role: row?.role ?? "absent",
    deletedFlag: row?.deleted ?? false,
  }));
  process.exit(ok ? 0 : 1);
} finally {
  await sql.end({ timeout: 5 });
}
