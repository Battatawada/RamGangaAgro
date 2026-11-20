import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { containsPlaceholder } from "@/content/placeholders";
import { isPageSearchIndexable, pageSearchIndex } from "@/content/search-index";
import { metadataFor } from "@/content/seo";

describe("per-page search indexing", () => {
  it("noindexes placeholder farm, journal, follow, and crop pages", () => {
    const noindex = [
      "/our-farm",
      "/journal",
      "/follow",
      "/grow/raktshali-rice",
    ] as const;
    for (const path of noindex) {
      expect(isPageSearchIndexable(path)).toBe(false);
      if (path === "/our-farm" || path === "/journal" || path === "/follow") {
        expect(metadataFor(path).robots).toEqual({
          index: false,
          follow: true,
        });
      }
    }
  });

  it("keeps the homepage and contact indexable", () => {
    expect(isPageSearchIndexable("/")).toBe(true);
    expect(isPageSearchIndexable("/contact")).toBe(true);
    expect(metadataFor("/").robots).toBeUndefined();
  });

  it("omits noindex paths from the sitemap", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain("https://rgagro.me");
    expect(urls).toContain("https://rgagro.me/contact");
    expect(urls).not.toContain("https://rgagro.me/our-farm/practices");
    expect(urls).not.toContain("https://rgagro.me/grow/raktshali-rice");
    expect(urls).not.toContain("https://rgagro.me/follow");
    expect(urls).not.toContain("https://rgagro.me/journal");
    expect(urls).not.toContain("https://rgagro.me/wholesale");
    expect(urls.every((url) => entryHasLastmod(url, entries))).toBe(true);

    for (const entry of entries) {
      const pathname = new URL(entry.url).pathname;
      expect(
        isPageSearchIndexable(pathname),
        `${pathname} must not be in the sitemap while noindex`,
      ).toBe(true);
    }
  });

  it("does not emit hreflang while Hindi routes are noindex", () => {
    expect(metadataFor("/").alternates?.languages).toBeUndefined();
    expect(metadataFor("/contact").alternates?.languages).toBeUndefined();
  });

  it("fails the build contract when an indexable path is flipped with placeholders", () => {
    const indexable = Object.entries(pageSearchIndex)
      .filter(([, value]) => value)
      .map(([path]) => path);
    expect(indexable.length).toBeGreaterThan(0);
    for (const path of indexable) {
      expect(path.startsWith("/")).toBe(true);
    }
    expect(containsPlaceholder("{{BAD}}")).toBe(true);
  });
});

function entryHasLastmod(
  url: string,
  entries: ReturnType<typeof sitemap>,
): boolean {
  return entries.some((entry) => entry.url === url && entry.lastModified instanceof Date);
}