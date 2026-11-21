import type { MetadataRoute } from "next";
import { siteContentLastModified } from "@/content/content-revision";
import { listDiscoveryPaths } from "@/content/discovery-paths";
import { site } from "@/content/site";

/** Public URLs only. Dormant routes and noindex pages are omitted. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await listDiscoveryPaths();

  return paths.map((path) => ({
    url: path === "/" ? site.url : `${site.url}${path}`,
    lastModified: siteContentLastModified,
  }));
}