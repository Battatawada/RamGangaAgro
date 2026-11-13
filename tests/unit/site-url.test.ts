import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/content/site";
import { securityHeaders, serverActionOrigins } from "@/server/security-headers";

describe("production origin", () => {
  it("defaults to the apex and accepts only the two public hostnames", () => {
    expect(resolveSiteUrl(undefined)).toBe("https://rgagro.me");
    expect(resolveSiteUrl("  https://www.rgagro.me  ")).toBe("https://www.rgagro.me");
    expect(() => resolveSiteUrl("http://localhost:3000")).toThrow(/SITE_URL/);
    expect(() => resolveSiteUrl("https://rgagro.me.evil.example")).toThrow(/SITE_URL/);
    expect(() => resolveSiteUrl("https://rgagro.me/contact")).toThrow(/SITE_URL/);
  });

  it("does not add a development origin to server actions", async () => {
    expect(serverActionOrigins).toEqual(["rgagro.me", "www.rgagro.me"]);
    const config = await readFile("next.config.ts", "utf8");
    expect(config).not.toContain("localhost");
  });

  it("sends HSTS only for a production host", () => {
    expect(securityHeaders({}).map((header) => header.key)).not.toContain(
      "Strict-Transport-Security",
    );
    const production = securityHeaders({ VERCEL_ENV: "production" });
    expect(production).toContainEqual({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
    expect(securityHeaders({ APP_ENV: "production" })).toContainEqual({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  });
});
