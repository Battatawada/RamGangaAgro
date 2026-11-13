import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { isProductionTarget } from "../../scripts/database-target";
import {
  DEVELOPMENT_ENDPOINT,
  PRODUCTION_ENDPOINT,
  assertAppConnection,
  assertDevelopmentDatabase,
  assertProductionDatabase,
} from "../../scripts/development-branch";

describe("development database guard", () => {
  it("treats only --target production as the production command", () => {
    expect(isProductionTarget(["node", "script"])).toBe(false);
    expect(isProductionTarget(["node", "script", "--production"])).toBe(false);
    expect(isProductionTarget(["node", "script", "--target", "development"])).toBe(false);
    expect(isProductionTarget(["node", "script", "--target", "production"])).toBe(true);
    expect(() => isProductionTarget(["node", "script", "--target", "live"])).toThrow(
      /--target/,
    );
  });
  it("matches the endpoint identifiers in the existing database script", async () => {
    const source = await readFile("scripts/verify-dev-database.mjs", "utf8");
    expect(source).toContain(`"${DEVELOPMENT_ENDPOINT}"`);
    expect(source).toContain(`"${PRODUCTION_ENDPOINT}"`);
  });

  it("refuses the production endpoint and accepts the development app login", () => {
    expect(() =>
      assertDevelopmentDatabase(
        `postgres://rga_app:placeholder@${PRODUCTION_ENDPOINT}.region.aws.neon.tech/neondb`,
        "rga_app",
      ),
    ).toThrow(/not the development branch/);

    expect(() =>
      assertDevelopmentDatabase(
        `postgres://rga_app:placeholder@${DEVELOPMENT_ENDPOINT}-pooler.region.aws.neon.tech/neondb`,
        "rga_app",
      ),
    ).not.toThrow();

    expect(() =>
      assertDevelopmentDatabase(
        `postgres://rga_migrator:placeholder@${DEVELOPMENT_ENDPOINT}.region.aws.neon.tech/neondb`,
        "rga_app",
      ),
    ).toThrow(/rga_app/);
  });

  it("accepts only the named production role on the matching host", () => {
    const pooled = `postgres://rga_app:placeholder@${PRODUCTION_ENDPOINT}-pooler.region.aws.neon.tech/neondb`;
    const direct = `postgres://rga_migrator:placeholder@${PRODUCTION_ENDPOINT}.region.aws.neon.tech/neondb`;

    expect(() => assertProductionDatabase(pooled, "rga_app", "pooled")).not.toThrow();
    expect(() => assertProductionDatabase(direct, "rga_migrator", "direct")).not.toThrow();
    expect(() => assertProductionDatabase(pooled, "rga_app", "direct")).toThrow(
      /not the production branch/,
    );
    expect(() =>
      assertProductionDatabase(
        `postgres://neondb_owner:placeholder@${PRODUCTION_ENDPOINT}.region.aws.neon.tech/neondb`,
        "rga_migrator",
        "direct",
      ),
    ).toThrow(/not the production branch/);
    expect(() =>
      assertProductionDatabase(
        `postgres://rga_app:placeholder@${DEVELOPMENT_ENDPOINT}-pooler.region.aws.neon.tech/neondb`,
        "rga_app",
        "pooled",
      ),
    ).toThrow(/not the production branch/);
  });

  it("lets the app open only rga_app, and only the production pool in production", () => {
    const productionPool = `postgres://rga_app:placeholder@${PRODUCTION_ENDPOINT}-pooler.region.aws.neon.tech/neondb`;
    const developmentPool = `postgres://rga_app:placeholder@${DEVELOPMENT_ENDPOINT}-pooler.region.aws.neon.tech/neondb`;

    expect(() => assertAppConnection(productionPool, "production")).not.toThrow();
    expect(() => assertAppConnection(developmentPool, "production")).toThrow(/pooled rga_app/);
    expect(() => assertAppConnection(productionPool, "development")).toThrow(
      /production database/,
    );
    expect(() => assertAppConnection(developmentPool, "development")).not.toThrow();
    expect(() =>
      assertAppConnection(
        `postgres://neondb_owner:placeholder@${PRODUCTION_ENDPOINT}-pooler.region.aws.neon.tech/neondb`,
        "production",
      ),
    ).toThrow(/rga_app/);
  });
});
