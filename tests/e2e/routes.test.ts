import { describe, expect, it } from "vitest";

const baseUrl = `http://127.0.0.1:${process.env.E2E_PORT ?? 3111}`;

const publicPaths = [
  "/",
  "/our-farm",
  "/our-farm/story",
  "/our-farm/the-land",
  "/our-farm/practices",
  "/grow",
  "/grow/raktshali-rice",
  "/grow/wheat",
  "/journal",
  "/contact",
  "/follow",
  "/unsubscribe",
  "/privacy",
  "/terms",
];

const dormantPaths = [
  "/shop",
  "/shop/raktshali-rice",
  "/cart",
  "/checkout",
  "/account",
  "/account/orders/1",
  "/admin",
  "/harvest/demo",
];

async function get(path: string) {
  return fetch(`${baseUrl}${path}`, { redirect: "manual" });
}

describe("public routes", () => {
  it.each(publicPaths)("%s returns 200", async (path) => {
    const response = await get(path);
    expect(response.status).toBe(200);
  });

  it("an unknown journal slug returns 404", async () => {
    const response = await get("/journal/not-a-real-slug");
    expect(response.status).toBe(404);
  });

  it("an unknown crop slug returns 404", async () => {
    const response = await get("/grow/not-a-real-crop");
    expect(response.status).toBe(404);
  });
});

describe("dormant routes", () => {
  it.each(dormantPaths)("%s returns 404", async (path) => {
    const response = await get(path);
    expect(response.status).toBe(404);

    const body = await response.text();
    expect(body).not.toContain("Add to cart");
    expect(body).not.toContain("Your orders");
  });
});

describe("the homepage says what it is allowed to say", () => {
  it("carries the hero line, the status and the sale sentence", async () => {
    const html = await (await get("/")).text();

    expect(html).toContain("Good food begins long before the table.");
    expect(html).toContain("Currently growing");
    expect(html).toContain("It is not for sale.");
    expect(html).toContain("Raktshali, still in the field.");
  });

  it("carries nothing the farm has not confirmed", async () => {
    const html = await (await get("/")).text();

    expect(html).toContain("Natural farming.");
    expect(html).toContain("Wheat");
    for (const forbidden of [
      "Add to cart",
      "₹",
      "Shop now",
      "red rice",
      "traditional",
      "organic",
      "certified",
      "chemical-free",
      "Design reference only",
    ]) {
      expect(html, forbidden).not.toContain(forbidden);
    }
  });

  it("publishes a canonical url and a sharing title", async () => {
    const html = await (await get("/")).text();

    expect(html).toContain('rel="canonical"');
    expect(html).toContain("https://rgagro.me");
    expect(html).toContain('property="og:title"');
    expect(html).toContain("Ram Ganga Agro");
  });

  it("does not link a shop, a cart or an account", async () => {
    const html = await (await get("/")).text();

    for (const href of ['href="/shop"', 'href="/cart"', 'href="/account"']) {
      expect(html, href).not.toContain(href);
    }
  });
});

describe("the crop page", () => {
  it("names the crop without a price or a claim", async () => {
    const html = await (await get("/grow/raktshali-rice")).text();

    expect(html).toContain("Raktshali rice");
    expect(html).toContain("Grown at Ram Ganga Agro. It is not for sale.");
    expect(html).toContain("Currently growing");
    for (const forbidden of ["₹", "Add to cart", "red rice", "traditional", "TBD"]) {
      expect(html, forbidden).not.toContain(forbidden);
    }
  });

  it("names wheat without a season, a variety, or a sale", async () => {
    const html = await (await get("/grow/wheat")).text();

    expect(html).toContain("Wheat");
    expect(html).toContain("Grown at Ram Ganga Agro.");
    expect(html).toContain("The story is still being written.");
    expect(html).not.toContain("Currently growing");
    expect(html).not.toContain("It is not for sale.");
    for (const forbidden of [
      "₹",
      "Add to cart",
      "organic",
      "certified",
      "chemical-free",
      "TBD",
    ]) {
      expect(html, forbidden).not.toContain(forbidden);
    }
  });
});

describe("response headers", () => {
  it("sets the headers Clerk's CSP helper does not", async () => {
    const response = await get("/");

    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("permissions-policy")).toContain("camera=()");
    expect(response.headers.get("x-powered-by")).toBeNull();
  });

  it("sets a strict content security policy with a nonce", async () => {
    const response = await get("/");
    const csp = response.headers.get("content-security-policy");

    expect(csp).toBeTruthy();
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toMatch(/'nonce-/);
  });
});

describe("search files", () => {
  it("publishes a canonical sitemap and does not block the public site", async () => {
    const robots = await (await get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: https://rgagro.me/sitemap.xml");
    expect(robots).toContain("Allow: /");
    expect(robots).not.toMatch(/Disallow:\s+\/\s*$/m);

    const sitemap = await (await get("/sitemap.xml")).text();
    expect(sitemap).toContain("https://rgagro.me/grow/raktshali-rice");
    expect(sitemap).toContain("https://rgagro.me/our-farm/practices");
    expect(sitemap).not.toContain("unsubscribe");
    expect(sitemap).not.toContain("vercel.app");
    expect(sitemap).not.toContain("/sign-in");
  });

  it("marks this host noindex while the canonical url stays the apex", async () => {
    const response = await get("/");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    const html = await response.text();
    expect(html).toContain('rel="canonical" href="https://rgagro.me"');
    expect(html).toContain("noindex");
    expect(html).toContain('"@type":"Organization"');
    expect(html).not.toContain("streetAddress");
    expect(html.toLowerCase()).not.toContain("aggregaterating");
  });

  it("states only published facts in llms.txt", async () => {
    const response = await get("/llms.txt");
    expect(response.status).toBe(200);
    const text = (await response.text()).toLowerCase();
    expect(text).toContain("natural farming");
    expect(text).toContain("raktshali");
    expect(text).toContain("not for sale");
    for (const phrase of ["organic", "certified", "chemical-free", "red rice", "traditional"]) {
      expect(text, phrase).not.toContain(phrase);
    }
  });
});

describe("the sign-in route exists and is not advertised", () => {
  it("answers on /sign-in", async () => {
    const response = await get("/sign-in");
    expect([200, 404]).toContain(response.status);
  });

  it("is not linked from the homepage", async () => {
    const html = await (await get("/")).text();
    expect(html).not.toContain('href="/sign-in"');
    expect(html).not.toContain('href="/sign-up"');
  });
});
