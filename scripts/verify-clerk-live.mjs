/**
 * Development Clerk checks. Prints statuses only.
 * Passwords and TOTP secrets stay in .verify-clerk.local.
 */
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

function readEnv(path) {
  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    values[line.slice(0, index)] = line.slice(index + 1);
  }
  return values;
}

function writeVerify(values) {
  const lines = Object.entries(values)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`);
  writeFileSync(".verify-clerk.local", `${lines.join("\n")}\n`);
}

const env = readEnv(".env.local");
const secret = env.CLERK_SECRET_KEY;
if (!secret?.startsWith("sk_test_")) {
  console.error("development secret missing");
  process.exit(1);
}

const email = "rga.phase1+clerk_test@example.com";
const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) console.error(`FAIL ${name} ${detail}`);
}

async function clerk(path, method, body) {
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: response.status, json };
}

const instance = await clerk("/instance", "GET");
record("instance-readable", instance.status === 200, String(instance.status));

const listed = await clerk(
  `/users?email_address=${encodeURIComponent(email)}&limit=1`,
  "GET",
);
record("list-test-user", listed.status === 200, String(listed.status));
let user = listed.json?.[0] ?? null;
const stored = readEnv(".verify-clerk.local");

if (!user) {
  const password = randomBytes(18).toString("base64url");
  const created = await clerk("/users", "POST", {
    email_address: [email],
    password,
    skip_password_checks: true,
    public_metadata: { role: "customer" },
  });
  record("create-invited-test-user", created.status === 200, String(created.status));
  user = created.json;
  if (user?.id) {
    writeVerify({ EMAIL: email, PASSWORD: password, USER_ID: user.id });
  }
}

if (!user?.id) {
  console.log(JSON.stringify({ passed: 0, failed: 1, results }, null, 2));
  process.exit(1);
}

const initialRole = user.public_metadata?.role ?? "unset";
record("initial-role-recorded", true, String(initialRole));
record(
  "two-factor-before",
  true,
  String(user.two_factor_enabled),
);

const password = stored.PASSWORD || randomBytes(18).toString("base64url");
if (!stored.PASSWORD) {
  const updated = await clerk(`/users/${user.id}`, "PATCH", { password });
  record("password-reset", updated.status === 200, String(updated.status));
  writeVerify({
    EMAIL: email,
    PASSWORD: password,
    USER_ID: user.id,
    TOTP_SECRET: stored.TOTP_SECRET,
  });
} else {
  record("password-already-stored", true);
}

const customerFirst = await clerk(`/users/${user.id}/metadata`, "PATCH", {
  public_metadata: { role: "customer" },
});
record("role-starts-as-customer", customerFirst.status === 200, String(customerFirst.status));

const unsafe = await clerk(`/users/${user.id}/metadata`, "PATCH", {
  unsafe_metadata: { role: "admin" },
});
record("unsafe-metadata-write", unsafe.status === 200, String(unsafe.status));
const afterUnsafe = await clerk(`/users/${user.id}`, "GET");
record(
  "unsafe-metadata-does-not-grant-admin",
  afterUnsafe.json?.public_metadata?.role !== "admin",
  String(afterUnsafe.json?.public_metadata?.role ?? "unset"),
);

const renamed = await clerk(`/users/${user.id}`, "PATCH", { first_name: "Phase" });
record("profile-update", renamed.status === 200, String(renamed.status));
record(
  "profile-update-does-not-grant-admin",
  renamed.json?.public_metadata?.role !== "admin",
  String(renamed.json?.public_metadata?.role ?? "unset"),
);

const openSignup = await clerk("/sign_ups", "POST", {
  email_address: `uninvited.person+${Date.now()}@example.com`,
  password: randomBytes(12).toString("base64url"),
});
const signupCodes = (openSignup.json?.errors ?? []).map((error) => error.code).join(",");
record(
  "uninvited-signup-rejected",
  openSignup.status === 403 || openSignup.status === 404 || openSignup.status === 422,
  `${openSignup.status}${signupCodes ? ` ${signupCodes}` : ""}`,
);

const host = decodePublishableKey(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
record("publishable-key-is-development", env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_test_"));
const environment = await fapi(host, "/v1/environment", "GET");
record("frontend-environment", environment.status === 200, String(environment.status));
const settings = summariseEnvironment(environment.json);
if (!settings.signUpMode) settings.topKeys = Object.keys(environment.json ?? {});

let totpSecret = stored.TOTP_SECRET;
const signedIn = await signInWithPassword(host, email, readEnv(".verify-clerk.local").PASSWORD || password);
record(
  "password-sign-in",
  signedIn.ok,
  signedIn.detail,
);
if (signedIn.session) {
  record(
    "first-factor-session-has-no-second-factor",
    signedIn.session.secondFactorAge === -1 || signedIn.session.secondFactorAge === null,
    String(signedIn.session.secondFactorAge),
  );
}

if (!afterUnsafe.json?.two_factor_enabled && signedIn.jar) {
  const createdTotp = await fapi(host, "/v1/me/totp", "POST", {}, signedIn.jar);
  const secretValue = createdTotp.json?.response?.secret || createdTotp.json?.secret;
  const codes = (createdTotp.json?.errors ?? []).map((error) => error.code).join(",");
  if (createdTotp.status === 200 && secretValue) {
    totpSecret = secretValue;
    const verified = await fapi(host, "/v1/me/totp/attempt_verification", "POST", {
      code: totpCode(decodeTotp(totpSecret)),
    }, signedIn.jar);
    record("totp-verified", verified.status === 200, String(verified.status));
  } else {
    record("totp-create", false, `${createdTotp.status}${codes ? ` ${codes}` : ""}`);
  }
} else if (afterUnsafe.json?.two_factor_enabled && !totpSecret) {
  record("totp-secret-available-for-browser", false, "already-enabled-without-local-secret");
} else if (afterUnsafe.json?.two_factor_enabled) {
  record("totp-already-enabled", true);
}

if (totpSecret) {
  const current = readEnv(".verify-clerk.local");
  writeVerify({ ...current, TOTP_SECRET: totpSecret, EMAIL: email, USER_ID: user.id, PASSWORD: current.PASSWORD || password });
}

const failed = results.filter((item) => !item.ok);
console.log(
  JSON.stringify(
    {
      userPrefix: user.id.slice(0, 8),
      environmentType: instance.json?.environment_type ?? null,
      settings,
      passed: results.length - failed.length,
      failed: failed.length,
      results,
    },
    null,
    2,
  ),
);
process.exit(failed.length === 0 ? 0 : 1);

function decodePublishableKey(key) {
  let encoded = key.replace(/^pk_(test|live)_/, "");
  encoded += "=".repeat((4 - (encoded.length % 4)) % 4);
  return Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "");
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
}

function storeCookies(jar, response) {
  const cookies = response.headers.getSetCookie?.() ?? [];
  for (const item of cookies) {
    const pair = item.split(";")[0];
    const index = pair.indexOf("=");
    if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }
}

async function fapi(host, path, method, form, jar = new Map()) {
  const headers = { Origin: "http://localhost:3000" };
  const cookie = cookieHeader(jar);
  if (cookie) headers.Cookie = cookie;
  let body;
  if (form && method !== "GET") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(form);
  }
  const response = await fetch(`https://${host}${path}`, { method, headers, body });
  storeCookies(jar, response);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: response.status, json, jar };
}

function summariseEnvironment(json) {
  const user = json?.user_settings ?? json?.auth_config ?? {};
  const attributes = user.attributes ?? {};
  return {
    signUpMode: user.sign_up?.mode ?? json?.display_config?.sign_up_mode ?? null,
    organizations: json?.organization_settings?.enabled ?? null,
    password: attributes.password?.enabled ?? user.password_settings?.enabled ?? null,
    email: attributes.email_address?.enabled ?? null,
    firstFactors: attributes.email_address?.first_factors ?? user.first_factors ?? null,
    secondFactors: user.second_factors ?? attributes.authenticator_app ?? null,
  };
}

async function signInWithPassword(host, identifier, passwordValue) {
  const jar = new Map();
  await fapi(host, "/v1/client?_is_native=true", "GET", undefined, jar);
  const response = await fapi(host, "/v1/client/sign_ins?_is_native=true", "POST", {
    identifier,
    password: passwordValue,
    strategy: "password",
  }, jar);
  const payload = response.json?.response ?? response.json ?? {};
  const codes = (response.json?.errors ?? payload.errors ?? []).map((error) => error.code).join(",");
  const session = sessionFacts(response.json);
  const ok = response.status === 200 && (payload.status === "complete" || payload.status === "needs_second_factor");
  return {
    ok,
    detail: `${response.status} ${payload.status ?? codes}`,
    session,
    jar,
  };
}

function sessionFacts(json) {
  const session = json?.client?.sessions?.[0] ?? json?.response?.sessions?.[0] ?? null;
  const age = session?.factor_verification_age ?? session?.user?.factor_verification_age ?? null;
  if (!session && !age) return null;
  return {
    secondFactorAge: Array.isArray(age) ? (age[1] ?? null) : null,
  };
}

function decodeTotp(input) {
  if (/^[A-Z2-7]+=*$/i.test(input)) return base32Decode(input);
  return Buffer.from(input, "base64");
}

function base32Decode(input) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.replace(/=+$/g, "").toUpperCase();
  let bits = "";
  for (const char of clean) {
    const value = alphabet.indexOf(char);
    if (value < 0) continue;
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function totpCode(key) {
  const counter = Math.floor(Date.now() / 30000);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}
