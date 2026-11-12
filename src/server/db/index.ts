import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

function createDatabase(url: string) {
  const client = postgres(url, {
    max: 5,
    ssl: url.includes("sslmode=disable") ? false : "prefer",
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
