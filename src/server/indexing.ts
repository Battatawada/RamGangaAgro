const APEX_HOST = "rgagro.me";
const WWW_HOST = "www.rgagro.me";

export type IndexingDecision = "index" | "redirect" | "noindex";

/** The hostname a request was actually served on, without a port. */
export function hostnameOf(hostHeader: string | null): string {
  const first = hostHeader?.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.replace(/:\d+$/, "");
}

/**
 * Only the canonical apex may be indexed. www redirects there. Every other
 * host, including preview deployments and the temporary Vercel URL, is
 * noindex so it cannot become a second copy of the site.
 */
export function indexingDecision(hostHeader: string | null): IndexingDecision {
  const host = hostnameOf(hostHeader);
  if (host === APEX_HOST) return "index";
  if (host === WWW_HOST) return "redirect";
  return "noindex";
}

export function apexUrl(pathname: string, search: string): URL {
  const url = new URL("https://rgagro.me");
  url.pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  url.search = search;
  return url;
}
