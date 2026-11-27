import { describe, expect, it } from "vitest";
import { testmailAddress } from "@/lib/testmail";

describe("testmail addresses", () => {
  it("builds the namespace address", () => {
    expect(testmailAddress("mpm97", "order-access")).toBe(
      "mpm97.order-access@inbox.testmail.app",
    );
  });

  it("refuses a tag that could change the inbox", () => {
    expect(() => testmailAddress("mpm97", "a@b")).toThrow(/plain labels/);
  });
});