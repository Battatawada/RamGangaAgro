import { site } from "@/content/site";

/** Dynamic share image for a public path. The /og route validates allowed paths. */
export function ogImageUrl(path: string): string {
  const url = new URL("/og", site.url);
  url.searchParams.set("path", path.startsWith("/") ? path : `/${path}`);
  return url.href;
}