import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  DEVELOPMENT_ENDPOINT,
  PRODUCTION_ENDPOINT,
  assertDevelopmentDatabase,
} from "../../scripts/development-branch";

describe("development database guard", () => {
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
});
