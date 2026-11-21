import { crops } from "@/content/crops";
import { journalPosts } from "@/content/journal";
import { indexablePaths } from "@/content/seo";
import { isPageSearchIndexable } from "@/content/search-index";
import { isEnabled } from "@/server/flags";
import { listCatalog } from "@/server/catalog";

/** Paths that belong in the sitemap, robots discovery, and llms.txt together. */
export async function listDiscoveryPaths(): Promise<string[]> {
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

  return paths;
}