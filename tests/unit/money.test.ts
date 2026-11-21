import { describe, expect, it } from "vitest";
import { formatPaise, netQuantityLabel } from "@/lib/money";

describe("formatPaise", () => {
  it("formats whole rupees from paise", () => {
    expect(formatPaise(10050)).toMatch(/100\.50/);
    expect(formatPaise(0)).toMatch(/0/);
  });
});

describe("netQuantityLabel", () => {
  it("prefers kilograms for clean multiples", () => {
    expect(netQuantityLabel({ weightGrams: 5000, volumeMl: null })).toBe("5 kg");
    expect(netQuantityLabel({ weightGrams: null, volumeMl: 1000 })).toBe("1 L");
  });
});