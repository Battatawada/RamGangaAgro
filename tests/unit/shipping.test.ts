import { describe, expect, it } from "vitest";
import { parcelMixAllowed, pinServicesOrder } from "@/server/shipping";

describe("shipping rules", () => {
  it("refuses chilled lines", () => {
    expect(parcelMixAllowed(["chilled"])).toMatch(/Chilled/);
  });

  it("refuses mixed chilled and dry", () => {
    expect(parcelMixAllowed(["dry", "chilled"])).toMatch(/same parcel/);
  });

  it("allows dry and shelf-stable together", () => {
    expect(parcelMixAllowed(["dry", "shelf_stable"])).toBeNull();
  });

  it("accepts a six-digit PIN", () => {
    expect(pinServicesOrder("323001")).toBe(true);
    expect(pinServicesOrder("12")).toBe(false);
  });
});