import { describe, expect, it } from "vitest";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { migrationsToApply, statementsIn, type MigrationFile } from "../../scripts/pending-migrations";

const migrations = readMigrationFiles({ migrationsFolder: "./drizzle" }) as MigrationFile[];

describe("pending migrations", () => {
  it("applies only journal entries newer than the stored time", () => {
    const latest = Math.max(...migrations.map((migration) => migration.folderMillis));
    expect(migrationsToApply(migrations, null)).toHaveLength(migrations.length);
    expect(migrationsToApply(migrations, latest)).toHaveLength(0);
    expect(migrationsToApply(migrations, latest - 1).map((migration) => migration.folderMillis)).toEqual([
      latest,
    ]);
  });

  it("keeps the rate-limit statements and does not create a schema", () => {
    const rateLimit = migrations.find((migration) =>
      migration.sql.some((statement) => statement.includes("rate_limit_buckets")),
    );
    expect(rateLimit).toBeDefined();
    const statements = statementsIn(rateLimit!);
    expect(statements.some((statement) => statement.startsWith("CREATE TABLE"))).toBe(true);
    expect(statements.some((statement) => statement.includes("CREATE SCHEMA"))).toBe(false);
    expect(statements.join("\n")).toContain("rate_limit_buckets_count_check");
  });
});
