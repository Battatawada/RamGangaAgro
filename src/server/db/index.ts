import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { assertAppConnection, databaseSsl } from "./connection-policy";
import { connectResolved } from "./connect";
import * as schema from "./schema";

type SqlClient = ReturnType<typeof postgres>;

function createDatabase(url: string) {
  // Neon's pooled endpoint is PgBouncer in transaction mode, which rejects
  // prepared statements. Direct connections keep them.
  // prefer and require do not check the server certificate. verify-full does.
  const pooled = url.includes("-pooler");
  const client = postgres(url, {
    max: 5,
    prepare: !pooled,
    ssl: databaseSsl(url),
    socket: connectResolved as never,
  });
  return { client, db: drizzle(client, { schema }) };
}

export type Database = ReturnType<typeof createDatabase>["db"];

let sqlClient: SqlClient | undefined;
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
    assertAppConnection(url, process.env.NODE_ENV ?? "development");
    const opened = createDatabase(url);
    sqlClient = opened.client;
    database = opened.db;
  }
  return database;
}

/** Closes the app pool. The form integration test calls this so the process can exit. */
export async function closeDbForTests(): Promise<void> {
  if (sqlClient) {
    await sqlClient.end({ timeout: 5 });
  }
  sqlClient = undefined;
  database = undefined;
}

export { schema };
