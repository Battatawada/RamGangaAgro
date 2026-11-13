/**
 * Prints the rate-limit decision without printing secrets or opening a store.
 *
 *   npm run check:rate-limit
 *   npm run check:rate-limit -- --production
 */
import { resolveIpSource, resolveRateLimitConfig } from "../src/server/rate-limit-config";
import { assertDevelopmentDatabase } from "./development-branch";
import { applyEnvFile, loadEnvFile } from "./load-env-file";

function isDevelopmentDatabase(url: string): boolean {
  try {
    assertDevelopmentDatabase(url, "rga_app");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("not the development branch")) return false;
    throw error;
  }
}

function main() {
  applyEnvFile(".env.local");
  const production = process.argv.includes("--production");
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
    } else if (isDevelopmentDatabase(url)) {
      console.error("Production is still pointed at the development database.");
      process.exit(1);
    } else {
      console.log("Database URL is present and is not the development branch.");
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
