/**
 * Re-applies grant sections 2 to 5. Role creation in section 1 is not repeated.
 * The default connection is the development migrator. `--target production`
 * uses `.env.production.operator` and refuses every other host.
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { connectResolved } from "../src/server/db/connect";
import { isProductionTarget, migratorUrl } from "./database-target";
import { databaseSsl, redactConnectionString } from "./development-branch";

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
  const production = isProductionTarget(process.argv);
  const url = migratorUrl(production);
  const statements = statementsAfterRoles(readFileSync("db/grants.sql", "utf8"));
  const sql = postgres(url, {
    max: 1,
    ssl: databaseSsl(url),
    socket: connectResolved as never,
  });

  try {
    for (const statement of statements) {
      await sql.unsafe(statement);
    }
    const branch = production ? "production" : "development";
    console.log(`Applied ${statements.length} grant statements on the ${branch} branch.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown failure.";
  console.error(redactConnectionString(message));
  process.exit(1);
});
