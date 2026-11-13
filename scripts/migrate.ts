/**
 * Applies migrations with DATABASE_URL_MIGRATE, the rga_migrator login.
 * The application process never receives this URL.
 *
 * Drizzle's own migrator runs CREATE SCHEMA. That needs database CREATE, which
 * this login does not have and must not be given back. The drizzle schema is
 * created once, by a superuser, and this script only adds tables inside it.
 */
import { readMigrationFiles } from "drizzle-orm/migrator";
import postgres from "postgres";
import { connectResolved } from "../src/server/db/connect";
import { migratorUrl, isProductionTarget } from "./database-target";
import { databaseSsl, redactConnectionString } from "./development-branch";
import { migrationsToApply, statementsIn, type MigrationFile } from "./pending-migrations";

async function main() {
  const production = isProductionTarget(process.argv);
  const url = migratorUrl(production);

  const sql = postgres(url, {
    max: 1,
    ssl: databaseSsl(url),
    socket: connectResolved as never,
  });
  try {
    const schemas = await sql<{ schema_name: string }[]>`
      select schema_name from information_schema.schemata where schema_name = 'drizzle'
    `;
    if (schemas.length === 0) {
      throw new Error(
        "The drizzle schema does not exist. A superuser must run CREATE SCHEMA drizzle AUTHORIZATION rga_migrator once. Do not grant this login database CREATE.",
      );
    }

    const migrations = readMigrationFiles({
      migrationsFolder: "./drizzle",
    }) as MigrationFile[];
    const applied = await sql<{ created_at: string | number }[]>`
      select created_at from drizzle.__drizzle_migrations
      order by created_at desc
      limit 1
    `;
    const lastCreatedAt = applied[0] ? Number(applied[0].created_at) : null;
    const pending = migrationsToApply(migrations, lastCreatedAt);

    if (pending.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    await sql.begin(async (tx) => {
      for (const migration of pending) {
        for (const statement of statementsIn(migration)) {
          await tx.unsafe(statement);
        }
        await tx`
          insert into drizzle.__drizzle_migrations (hash, created_at)
          values (${migration.hash}, ${migration.folderMillis})
        `;
      }
    });

    const branch = production ? "production" : "development";
    console.log(
      `Applied ${pending.length} migration${pending.length === 1 ? "" : "s"} on the ${branch} branch. Re-run db/grants.sql now.`,
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown failure.";
  console.error(redactConnectionString(message));
  process.exit(1);
});
