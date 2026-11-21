import { describe, expect, it } from "vitest";
import { assertPurchasableProduct } from "@/server/catalog";

describe("catalog guards", () => {
  it("refuses purchasable dairy without allergens", () => {
    expect(() =>
      assertPurchasableProduct({
        category: "dairy",
        allergens: null,
        purchasable: true,
      }),
    ).toThrow(/allergens/);
  });

  it("allows grain packs without allergens", () => {
    expect(() =>
      assertPurchasableProduct({
        category: "grains",
        allergens: null,
        purchasable: true,
      }),
    ).not.toThrow();
  });
});