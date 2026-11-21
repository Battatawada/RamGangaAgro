import { describe, expect, it } from "vitest";
import { parseTransactionalSender } from "@/lib/email-sender";

describe("parseTransactionalSender", () => {
  it("parses plain email", () => {
    expect(parseTransactionalSender("notifications@rgagro.me")).toEqual({
      email: "notifications@rgagro.me",
    });
  });

  it("parses name and angle-bracket email", () => {
    expect(
      parseTransactionalSender("Ram Ganga Naturals <notifications@rgagro.me>"),
    ).toEqual({
      email: "notifications@rgagro.me",
      name: "Ram Ganga Naturals",
    });
  });

  it("rejects invalid strings", () => {
    expect(parseTransactionalSender("")).toBeNull();
    expect(parseTransactionalSender("not-an-email")).toBeNull();
  });
});