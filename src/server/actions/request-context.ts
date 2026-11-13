import "server-only";
import { headers } from "next/headers";
import { clientIpFromHeaders } from "@/server/client-ip";
import { resolveIpSource } from "@/server/rate-limit-config";

/**
 * The caller's address, used only as a rate-limit key. Production refuses a
 * missing or direct source. A header that is not a real address becomes the
 * shared `untrusted` bucket, which throttles rather than opening a new one.
 */
export async function getClientIp(): Promise<string> {
  const source = resolveIpSource(
    process.env,
    process.env.NODE_ENV ?? "development",
  );
  const headerList = await headers();
  return clientIpFromHeaders(headerList, source);
}
