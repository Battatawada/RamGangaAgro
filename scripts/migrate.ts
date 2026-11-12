/**
 * Applies migrations with DATABASE_URL_MIGRATE, the rga_migrator login.
 * The application process never receives this URL.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL_MIGRATE;
  if (!url) {
    console.error("DATABASE_URL_MIGRATE is not set.");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });
  try {
    await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
    console.log("Migrations applied. Re-run db/grants.sql now.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown failure.");
  process.exit(1);
});
