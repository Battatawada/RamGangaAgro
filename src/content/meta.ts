import type { Metadata } from "next";
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
}): Metadata {
  const fullTitle = input.absoluteTitle
    ? input.title
    : `${input.title} — ${site.name}`;

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: input.path,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
    },
  };
}
