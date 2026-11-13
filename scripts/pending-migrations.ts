export type MigrationFile = {
  folderMillis: number;
  hash: string;
  sql: string[];
};

/**
 * Drizzle applies a file only when its journal time is newer than the latest
 * stored `created_at`. The comparison is copied from drizzle-orm's migrator.
 */
export function migrationsToApply(
  migrations: MigrationFile[],
  lastCreatedAt: number | null,
): MigrationFile[] {
  return migrations.filter(
    (migration) => lastCreatedAt === null || lastCreatedAt < migration.folderMillis,
  );
}

/** Drops blank pieces left by a statement breakpoint. The SQL itself is unchanged. */
export function statementsIn(migration: MigrationFile): string[] {
  return migration.sql.map((statement) => statement.trim()).filter((statement) => statement.length > 0);
}
