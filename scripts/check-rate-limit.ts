/**
 * Prints the rate-limit decision without printing secrets or opening a store.
 *
 *   npm run check:rate-limit
 *   npm run check:rate-limit:production
 *
 * The production command passes `--target production`. npm itself consumes
 * a bare `--production` flag, so that word is not the switch.
 */
import { resolveIpSource, resolveRateLimitConfig } from "../src/server/rate-limit-config";
import { isProductionTarget } from "./database-target";
import {
  assertDevelopmentDatabase,
  assertProductionDatabase,
} from "./development-branch";
import { applyEnvFile, loadEnvFile } from "./load-env-file";

function main() {
  const production = isProductionTarget(process.argv);
  if (production) {
    const file = loadEnvFile(".env.production.local");
    if (!file.RATE_LIMIT_PROVIDER) {
      console.error(
        "Production rate limit is not configured. .env.production.local does not set RATE_LIMIT_PROVIDER.",
      );
      process.exit(1);
    }
    // Replace ambient development values. The production file is the only source.
    for (const [key, value] of Object.entries(file)) process.env[key] = value;
  } else {
    applyEnvFile(".env.local");
  }
  const nodeEnv = production ? "production" : "development";
  const config = resolveRateLimitConfig(process.env, nodeEnv);

  console.log(`Checking rate limit configuration as ${nodeEnv}.`);
  console.log(`Provider variable: ${process.env.RATE_LIMIT_PROVIDER?.trim() || "(empty)"}`);
  console.log(`Address source variable: ${process.env.RATE_LIMIT_IP_SOURCE?.trim() || "(empty)"}`);

  if (!config.ok) {
    console.error(config.reason);
    process.exit(1);
  }

  console.log(`Provider: ${config.provider}.`);

  if (config.provider === "postgres") {
    const url = process.env.DATABASE_URL ?? "";
    if (!production) {
      assertDevelopmentDatabase(url, "rga_app");
      console.log("Database URL is the development app login.");
    } else {
      assertProductionDatabase(url, "rga_app", "pooled");
      console.log("Database URL is the production pooled app login.");
    }
  }

  if (config.provider === "upstash") {
    console.log("Upstash URL uses HTTPS. The token was not printed.");
  }

  try {
    const source = resolveIpSource(process.env, nodeEnv);
    console.log(`Client address source: ${source}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Address source was refused.");
    process.exit(1);
  }

  if (!production) {
    const asProduction = resolveRateLimitConfig(loadEnvFile(".env.local"), "production");
    let sourceReady = true;
    try {
      resolveIpSource(loadEnvFile(".env.local"), "production");
    } catch {
      sourceReady = false;
    }
    if (!asProduction.ok || !sourceReady) {
      console.log(
        "Production is not configured yet. Set RATE_LIMIT_PROVIDER and RATE_LIMIT_IP_SOURCE on the production host.",
      );
    }
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unknown failure.");
  process.exit(1);
}
