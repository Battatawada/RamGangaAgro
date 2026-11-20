import { shareImageLines } from "@/components/share-image";
import { cropDescription } from "@/content/seo";
import { fileContent } from "@/content/source";
import { publicPageSeo } from "@/content/seo";

export const OG_PATH_MAX_LENGTH = 120;

/** Paths that may request a customised Open Graph image. */
export const OG_ALLOWED_PATHS = new Set<string>([
  "/",
  ...publicPageSeo.map((page) => page.path),
  "/grow/raktshali-rice",
  "/grow/wheat",
]);

const byPath = new Map(publicPageSeo.map((page) => [page.path, page]));

export function normalizeOgPath(raw: string | null): string | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > OG_PATH_MAX_LENGTH) return null;
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.includes("..") || trimmed.includes("//") || trimmed.includes("?")) return null;
  return trimmed;
}

export function isAllowedOgPath(path: string): boolean {
  return OG_ALLOWED_PATHS.has(path) || /^\/grow\/[a-z0-9-]+$/.test(path);
}

export function ogLinesForPath(path: string): { title: string; description: string } {
  const page = byPath.get(path as (typeof publicPageSeo)[number]["path"]);
  if (page) {
    return { title: page.title, description: page.description };
  }

  const cropMatch = path.match(/^\/grow\/([^/]+)$/);
  if (cropMatch) {
    const crop = fileContent.getCrop(cropMatch[1]);
    if (crop) {
      return {
        title: crop.name,
        description: cropDescription(crop.slug, crop.summary),
      };
    }
  }

  if (path === "/") {
    return shareImageLines();
  }

  return shareImageLines({
    title: "Ram Ganga Agro",
    description: "Farm at Mamoni, Baran district, Rajasthan.",
  });
}