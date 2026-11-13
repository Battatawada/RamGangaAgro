import {
  assertDevelopmentDatabase,
  assertProductionDatabase,
} from "./development-branch";
import { loadEnvFile } from "./load-env-file";

const OPERATOR_KEYS = {
  rga_migrator: "DATABASE_URL_MIGRATE",
  rga_messages_reader: "DATABASE_URL_MESSAGES",
  rga_privacy: "DATABASE_URL_PRIVACY",
} as const;

type OperatorRole = keyof typeof OPERATOR_KEYS;

export function isProductionTarget(argv: readonly string[]): boolean {
  const index = argv.indexOf("--target");
  if (index < 0) return false;
  const value = argv[index + 1];
  if (value !== "production" && value !== "development") {
    throw new Error("--target must be production or development.");
  }
  return value === "production";
}

/**
 * Development reads the process environment, then `.env.operator`, and
 * refuses the production endpoint. `--target production` reads only
 * `.env.production.operator`, so a development URL cannot satisfy it.
 * Every operator login uses the direct host.
 */
export function operatorUrl(production: boolean, role: OperatorRole): string {
  const key = OPERATOR_KEYS[role];
  if (production) {
    const url = loadEnvFile(".env.production.operator")[key];
    if (!url) {
      throw new Error(`${key} is not set in .env.production.operator.`);
    }
    assertProductionDatabase(url, role, "direct");
    return url;
  }

  const url = process.env[key] ?? loadEnvFile(".env.operator")[key];
  if (!url) {
    throw new Error(`${key} is not set.`);
  }
  assertDevelopmentDatabase(url, role);
  return url;
}

export function migratorUrl(production: boolean): string {
  return operatorUrl(production, "rga_migrator");
}
