import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { connectResolved } from "./connect";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

function createDatabase(url: string) {
  // Neon's pooled endpoint is PgBouncer in transaction mode, which rejects
  // prepared statements. Direct connections keep them.
  const pooled = url.includes("-pooler");
  const client = postgres(url, {
    max: 5,
    prepare: !pooled,
    ssl: url.includes("sslmode=disable") ? false : "prefer",
    socket: connectResolved as never,
  });
  return drizzle(client, { schema });
}

let database: Database | undefined;

/**
 * The runtime opens DATABASE_URL, which is the rga_app role. It never opens
 * the migrator, inbox reader or privacy URLs.
 */
export function getDb(): Database {
  if (!database) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set.");
    }
    database = createDatabase(url);
  }
  return database;
}

export { schema };
