import type { MetadataRoute } from "next";
import { siteContentLastModified } from "@/content/content-revision";
import { crops } from "@/content/crops";
import { journalPosts } from "@/content/journal";
import { site } from "@/content/site";
import { indexablePaths } from "@/content/seo";
import { isPageSearchIndexable } from "@/content/search-index";
import { isEnabled } from "@/server/flags";
import { listCatalog } from "@/server/catalog";

/** Public URLs only. Dormant routes and noindex pages are omitted. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    ...indexablePaths(),
    ...crops
      .map((crop) => `/grow/${crop.slug}`)
      .filter((path) => isPageSearchIndexable(path)),
    ...journalPosts
      .map((post) => `/journal/${post.slug}`)
      .filter(() => isPageSearchIndexable("/journal")),
  ];

  if (isEnabled("STOREFRONT_ENABLED")) {
    paths.push("/shop");
    try {
      const groups = await listCatalog();
      for (const group of groups) {
        for (const product of group.products) {
          paths.push(`/shop/${product.slug}`);
        }
      }
    } catch {
      // Database may be absent in static generation.
    }
  }

  return paths.map((path) => ({
    url: path === "/" ? site.url : `${site.url}${path}`,
    lastModified: siteContentLastModified,
  }));
}