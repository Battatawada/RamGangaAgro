import { describe, expect, it } from "vitest";
import {
  isAllowedOgPath,
  normalizeOgPath,
  ogLinesForPath,
  OG_PATH_MAX_LENGTH,
} from "@/content/og-lines";

describe("og path validation", () => {
  it("accepts known public paths", () => {
    expect(normalizeOgPath("/contact")).toBe("/contact");
    expect(isAllowedOgPath("/contact")).toBe(true);
    expect(ogLinesForPath("/contact").description.length).toBeGreaterThan(10);
  });

  it("rejects traversal, query strings, and overlong paths", () => {
    expect(normalizeOgPath("/../etc")).toBeNull();
    expect(normalizeOgPath("/grow//wheat")).toBeNull();
    expect(normalizeOgPath("/contact?x=1")).toBeNull();
    expect(normalizeOgPath(`/${"a".repeat(OG_PATH_MAX_LENGTH + 1)}`)).toBeNull();
    expect(normalizeOgPath(null)).toBeNull();
  });

  it("returns default home lines for unknown but normalised paths", () => {
    const lines = ogLinesForPath("/not-in-catalog");
    expect(lines.title).toContain("Ram Ganga Agro");
  });

  it("allows crop slugs under /grow", () => {
    expect(isAllowedOgPath("/grow/wheat")).toBe(true);
    expect(isAllowedOgPath("/grow/not-a-real-crop")).toBe(true);
  });
});