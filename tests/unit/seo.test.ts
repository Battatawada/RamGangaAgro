import { describe, expect, it } from "vitest";
import { breadcrumbStructuredData, publicStructuredData } from "@/content/structured-data";
import { cropDescription, publicPageSeo } from "@/content/seo";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { apexUrl, indexingDecision } from "@/server/indexing";

const forbidden = [
  "organic",
  "chemical-free",
  "pesticide-free",
  "certified",
  "traditional",
  "red rice",
  "best farm",
  "premium",
  "streetaddress",
  "aggregaterating",
  "telephon",
  "openinghours",
];

describe("indexing hosts", () => {
  it("indexes only the apex and redirects www", () => {
    expect(indexingDecision("rgagro.me")).toBe("index");
    expect(indexingDecision("rgagro.me:443")).toBe("index");
    expect(indexingDecision("www.rgagro.me")).toBe("redirect");
    expect(indexingDecision("ram-ganga-agro.vercel.app")).toBe("noindex");
    expect(indexingDecision("localhost:3000")).toBe("noindex");
    expect(indexingDecision("127.0.0.1:3111")).toBe("noindex");
    expect(indexingDecision("rgagro.me.evil.example")).toBe("noindex");
    expect(indexingDecision(null)).toBe("noindex");
  });

  it("keeps the path when sending www to the apex", () => {
    expect(apexUrl("/our-farm/practices", "?from=www").href).toBe(
      "https://rgagro.me/our-farm/practices?from=www",
    );
  });
});

describe("public page SEO", () => {
  it("gives every public page a distinct title and description on the canonical origin", () => {
    const titles = publicPageSeo.map((page) => page.title);
    const descriptions = publicPageSeo.map((page) => page.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);

    const text = [...titles, ...descriptions, cropDescription("raktshali-rice", ""), cropDescription("wheat", "")]
      .join("\n")
      .toLowerCase();
    for (const phrase of forbidden) {
      expect(text, phrase).not.toContain(phrase);
    }
    expect(text).toContain("raktshali");
    expect(text).toContain("natural farming");
    expect(cropDescription("raktshali-rice", "fallback")).toContain("not for sale");
    expect(cropDescription("wheat", "fallback")).not.toContain("not for sale");
  });

  it("keeps unsubscribe out of the sitemap and points every url at the apex", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain("https://rgagro.me/grow/raktshali-rice");
    expect(urls).toContain("https://rgagro.me/our-farm/practices");
    expect(urls.some((url) => url.includes("unsubscribe"))).toBe(false);
    expect(urls.some((url) => url.includes("sign-in"))).toBe(false);
    expect(urls.some((url) => url.includes("vercel.app"))).toBe(false);
    expect(urls.every((url) => url.startsWith("https://rgagro.me"))).toBe(true);
  });

  it("allows crawling on a production build and blocks a preview build", () => {
    const previous = process.env.VERCEL_ENV;
    delete process.env.VERCEL_ENV;
    const production = robots();
    process.env.VERCEL_ENV = "preview";
    const preview = robots();
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;

    expect(production.sitemap).toBe("https://rgagro.me/sitemap.xml");
    expect(production.host).toBe("rgagro.me");
    expect(production.rules).toMatchObject({ allow: "/", disallow: ["/sign-in", "/sign-up", "/api/"] });
    expect(preview.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(preview.sitemap).toBeUndefined();
  });
});

describe("structured data", () => {
  it("names the farm and the site without a location, a rating, or a price", () => {
    const graph = JSON.stringify(publicStructuredData()).toLowerCase();
    expect(graph).toContain("website");
    expect(graph).toContain("organization");
    expect(graph).toContain("https://rgagro.me");
    for (const phrase of ["streetaddress", "aggregaterating", "telephon", "openinghours", "pricerange", "geo"]) {
      expect(graph, phrase).not.toContain(phrase);
    }

    const crumbs = JSON.stringify(
      breadcrumbStructuredData(
        [{ label: "What we grow", href: "/grow" }, { label: "Raktshali rice" }],
        "/grow/raktshali-rice",
      ),
    );
    expect(crumbs).toContain("https://rgagro.me/grow/raktshali-rice");
    expect(crumbs).toContain("Ram Ganga Agro");
  });
});
