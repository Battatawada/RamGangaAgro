import type { MetadataRoute } from "next";
import { crops } from "@/content/crops";
import { journalPosts } from "@/content/journal";
import { site } from "@/content/site";
import { indexablePaths } from "@/content/seo";

/** Public URLs only. Dormant routes and the unsubscribe form are omitted. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...indexablePaths(),
    ...crops.map((crop) => `/grow/${crop.slug}`),
    ...journalPosts.map((post) => `/journal/${post.slug}`),
  ];

  return paths.map((path) => ({ url: path === "/" ? site.url : `${site.url}${path}` }));
}
