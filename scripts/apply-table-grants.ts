/**
 * Re-applies grant sections 2 to 5. Role creation in section 1 is not repeated.
 * The connection has to be the development migrator. Production is refused.
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { connectResolved } from "../src/server/db/connect";
import { assertDevelopmentDatabase, redactConnectionString } from "./development-branch";
import { loadEnvFile } from "./load-env-file";

function statementsAfterRoles(sqlText: string): string[] {
  const start = sqlText.indexOf("-- 2. rga_migrator");
  if (start < 0) throw new Error("db/grants.sql is missing section 2.");
  const body = sqlText
    .slice(start)
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  return body
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function main() {
  const operator = loadEnvFile(".env.operator");
  const url = process.env.DATABASE_URL_MIGRATE ?? operator.DATABASE_URL_MIGRATE;
  if (!url) {
    console.error("DATABASE_URL_MIGRATE is not set.");
    process.exit(1);
  }

  assertDevelopmentDatabase(url, "rga_migrator");
  const statements = statementsAfterRoles(readFileSync("db/grants.sql", "utf8"));
  const sql = postgres(url, { max: 1, socket: connectResolved as never });

  try {
    for (const statement of statements) {
      await sql.unsafe(statement);
    }
    console.log(`Applied ${statements.length} grant statements on the development branch.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown failure.";
  console.error(redactConnectionString(message));
  process.exit(1);
});
