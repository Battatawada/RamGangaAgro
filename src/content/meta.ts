import type { Metadata } from "next";
import { ogImageUrl } from "@/content/og";
import { site } from "@/content/site";

/**
 * Titles, descriptions, canonical URLs, and sharing tags for a public page.
 * The root layout supplies the title template and the site-wide image.
 */
export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  /** Use the title as written, without the site-name template. */
  absoluteTitle?: boolean;
  /** Journal notes use Article. Everything else stays a website. */
  type?: "website" | "article";
}): Metadata {
  const fullTitle = input.absoluteTitle
    ? input.title
    : `${input.title} — ${site.name}`;
  const canonical =
    input.path === "/" ? site.url : new URL(input.path, site.url).href;
  const type = input.type ?? "website";

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonical,
      siteName: site.name,
      locale: "en_IN",
      type,
      images: [{ url: ogImageUrl(input.path), alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      images: [ogImageUrl(input.path)],
    },
  };
}
