import { describe, expect, it } from "vitest";
import { assertFlagInvariant, readFlags } from "@/server/flags";

describe("flags", () => {
  it("defaults every flag to false", () => {
    const flags = readFlags({} as unknown as NodeJS.ProcessEnv);
    expect(flags).toEqual({
      ACCOUNTS_ENABLED: false,
      ADMIN_UI_ENABLED: false,
      STOREFRONT_ENABLED: false,
      CHECKOUT_ENABLED: false,
      PAYMENTS_ENABLED: false,
    });
  });

  it("treats anything but the string 'true' as false", () => {
    const flags = readFlags({
      STOREFRONT_ENABLED: "yes",
    } as unknown as NodeJS.ProcessEnv);
    expect(flags.STOREFRONT_ENABLED).toBe(false);
  });

  it("refuses checkout without a storefront", () => {
    expect(() =>
      assertFlagInvariant({
        ACCOUNTS_ENABLED: false,
        ADMIN_UI_ENABLED: false,
        STOREFRONT_ENABLED: false,
        CHECKOUT_ENABLED: true,
        PAYMENTS_ENABLED: false,
      }),
    ).toThrow(/CHECKOUT_ENABLED requires STOREFRONT_ENABLED/);
  });

  it("refuses payments without checkout", () => {
    expect(() =>
      assertFlagInvariant({
        ACCOUNTS_ENABLED: false,
        ADMIN_UI_ENABLED: false,
        STOREFRONT_ENABLED: true,
        CHECKOUT_ENABLED: false,
        PAYMENTS_ENABLED: true,
      }),
    ).toThrow(/PAYMENTS_ENABLED requires CHECKOUT_ENABLED/);
  });

  it("is false for all five flags in .env.example", async () => {
    const { readFile } = await import("node:fs/promises");
    const example = await readFile(".env.example", "utf8");
    for (const name of [
      "ACCOUNTS_ENABLED",
      "ADMIN_UI_ENABLED",
      "STOREFRONT_ENABLED",
      "CHECKOUT_ENABLED",
      "PAYMENTS_ENABLED",
    ]) {
      expect(example).toContain(`${name}=false`);
    }
  });
});
