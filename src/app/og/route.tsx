import { shareImage, shareContentType, shareSize } from "@/components/share-image";
import {
  isAllowedOgPath,
  normalizeOgPath,
  ogLinesForPath,
} from "@/content/og-lines";

export const runtime = "nodejs";

const CACHE_HEADER = "public, max-age=31536000, immutable";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("path");
  const path = normalizeOgPath(raw);

  const lines =
    path && isAllowedOgPath(path)
      ? ogLinesForPath(path)
      : ogLinesForPath("/");

  const response = shareImage(lines);
  response.headers.set("Cache-Control", CACHE_HEADER);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const size = shareSize;
export const contentType = shareContentType;