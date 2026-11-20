import type { Metadata } from "next";
import { isPageSearchIndexable } from "@/content/search-index";
import { site } from "@/content/site";

/** English path → Hindi path. Hindi routes stay noindex until copy is ready. */
const HREFLANG_PAIRS: ReadonlyArray<{ en: string; hi: string }> = [
  { en: "/", hi: "/hi" },
  { en: "/contact", hi: "/hi/contact" },
  { en: "/grow/raktshali-rice", hi: "/hi/grow/raktshali-rice" },
  { en: "/grow/wheat", hi: "/hi/grow/wheat" },
];

/**
 * hreflang only when both language URLs are search-indexable. Noindex Hindi
 * placeholders must not appear in alternates for English pages.
 */
export function hreflangAlternates(path: string): Metadata["alternates"] | undefined {
  const pair = HREFLANG_PAIRS.find((entry) => entry.en === path);
  if (!pair) return undefined;
  if (!isPageSearchIndexable(pair.en) || !isPageSearchIndexable(pair.hi)) {
    return undefined;
  }

  const canonical = pair.en === "/" ? site.url : new URL(pair.en, site.url).href;
  const hindi = new URL(pair.hi, site.url).href;

  return {
    canonical,
    languages: {
      "en-IN": canonical,
      "hi-IN": hindi,
    },
  };
}