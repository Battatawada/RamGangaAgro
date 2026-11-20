import type { MetadataRoute } from "next";
import { siteContentLastModified } from "@/content/content-revision";
import { crops } from "@/content/crops";
import { journalPosts } from "@/content/journal";
import { site } from "@/content/site";
import { indexablePaths } from "@/content/seo";
import { isPageSearchIndexable } from "@/content/search-index";

/** Public URLs only. Dormant routes and noindex pages are omitted. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...indexablePaths(),
    ...crops
      .map((crop) => `/grow/${crop.slug}`)
      .filter((path) => isPageSearchIndexable(path)),
    ...journalPosts
      .map((post) => `/journal/${post.slug}`)
      .filter(() => isPageSearchIndexable("/journal")),
  ];

  return paths.map((path) => ({
    url: path === "/" ? site.url : `${site.url}${path}`,
    lastModified: siteContentLastModified,
  }));
}