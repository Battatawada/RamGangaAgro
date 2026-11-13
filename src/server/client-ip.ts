import { isIP } from "node:net";
import type { IpSource } from "@/server/rate-limit-config";

/**
 * Turns one forwarded hop into an address, or nothing. A value that is not an
 * IP must not become its own bucket: otherwise a caller who can set the header
 * can mint a fresh allowance by changing the string.
 */
export function normalizeIp(value: string): string | null {
  let token = value.trim();
  if (!token) return null;

  if (token.startsWith("[")) {
    const end = token.indexOf("]");
    if (end <= 1) return null;
    token = token.slice(1, end);
  } else {
    const colon = token.lastIndexOf(":");
    const onlyOneColon = token.indexOf(":") === colon;
    if (onlyOneColon && colon > 0 && /^\d{1,5}$/.test(token.slice(colon + 1))) {
      const withoutPort = token.slice(0, colon);
      if (isIP(withoutPort) === 4) token = withoutPort;
    }
  }

  if (isIP(token) === 0) return null;
  return token.toLowerCase();
}

type HeaderList = { get(name: string): string | null };

/**
 * `direct` ignores every forwarded header. `vercel` reads only the header
 * Vercel overwrites. `trusted-proxy` reads the left-most X-Forwarded-For hop,
 * which is safe only when that proxy replaces the header instead of appending
 * to a client-supplied value.
 */
export function clientIpFromHeaders(headerList: HeaderList, source: IpSource): string {
  if (source === "direct") return "local";

  const headerName =
    source === "vercel" ? "x-vercel-forwarded-for" : "x-forwarded-for";
  const first = headerList.get(headerName)?.split(",")[0] ?? "";
  return normalizeIp(first) ?? "untrusted";
}
