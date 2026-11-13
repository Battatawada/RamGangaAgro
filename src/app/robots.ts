import type { MetadataRoute } from "next";
import { site } from "@/content/site";

function previewBuild(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development";
}

/**
 * Production allows the public site and names the canonical sitemap.
 * A preview build refuses every path, so a preview URL cannot be treated as
 * the site. The production deployment still noindex-es any host other than
 * rgagro.me at request time.
 */
export default function robots(): MetadataRoute.Robots {
  if (previewBuild()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/sign-in", "/sign-up", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.domain,
  };
}
