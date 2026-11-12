import type { MetadataRoute } from "next";
import { crops } from "@/content/crops";
import { journalPosts } from "@/content/journal";
import { site } from "@/content/site";

/** Public Phase 1 URLs only. Dormant and unlinked routes are omitted. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/our-farm",
    "/our-farm/story",
    "/our-farm/the-land",
    "/our-farm/practices",
    "/grow",
    ...crops.map((crop) => `/grow/${crop.slug}`),
    "/journal",
    ...journalPosts.map((post) => `/journal/${post.slug}`),
    "/contact",
    "/follow",
    "/unsubscribe",
    "/privacy",
    "/terms",
  ];

  return paths.map((path) => ({ url: `${site.url}${path}` }));
}
