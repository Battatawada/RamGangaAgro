/**
 * Fails when any commerce flag would be true in a production deployment without
 * ALLOW_PRODUCTION_FEATURE_FLAGS=true.
 */
import { readFile } from "node:fs/promises";

const FLAGS = [
  "ACCOUNTS_ENABLED",
  "ADMIN_UI_ENABLED",
  "STOREFRONT_ENABLED",
  "CHECKOUT_ENABLED",
  "PAYMENTS_ENABLED",
];

const envFiles = [".env.production.local", ".env.production"];

async function readEnv(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function flagValue(raw, name) {
  const match = raw.match(new RegExp(`^${name}=(.*)$`, "m"));
  return match?.[1]?.trim();
}

async function main() {
  if (process.env.ALLOW_PRODUCTION_FEATURE_FLAGS === "true") {
    console.log("Production feature flags explicitly allowed.");
    return;
  }

  const inProduction =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  const violations = [];

  for (const name of FLAGS) {
    if (process.env[name] === "true") {
      violations.push(`process.env.${name}=true`);
    }
  }

  if (inProduction) {
    for (const file of envFiles) {
      const raw = await readEnv(file);
      if (!raw) continue;
      for (const name of FLAGS) {
        if (flagValue(raw, name) === "true") {
          violations.push(`${file}: ${name}=true`);
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error("Feature flags must stay false in production:");
    for (const line of violations) console.error(`  ${line}`);
    process.exit(1);
  }

  console.log("Production feature flag check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});