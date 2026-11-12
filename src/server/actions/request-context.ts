import "server-only";
import { headers } from "next/headers";

/**
 * The caller's address, used only as a rate-limit key. A missing or spoofed
 * header falls back to one shared bucket, which throttles rather than opens.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerList.get("x-real-ip")?.trim() || "unknown";
}
