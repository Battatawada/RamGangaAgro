import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { apexUrl, indexingDecision } from "@/server/indexing";

/**
 * Next.js 16 runs this file as the proxy. On Next.js 15 and below the same
 * call belongs in middleware.ts.
 *
 * This is not the authorization boundary. Pages, Server Actions and route
 * handlers do their own checks. createRouteMatcher is deprecated and is not
 * used here: clerkMiddleware stays bare, and only sets the strict CSP.
 *
 * www.rgagro.me redirects to the apex. Any other host, including a Vercel
 * preview or the temporary production URL, is marked noindex.
 */
export default clerkMiddleware((_auth, request) => {
  const decision = indexingDecision(request.headers.get("host"));

  if (decision === "redirect") {
    return NextResponse.redirect(
      apexUrl(request.nextUrl.pathname, request.nextUrl.search),
      308,
    );
  }

  const response = NextResponse.next();
  if (decision === "noindex") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}, {
  contentSecurityPolicy: { strict: true },
});

export const config = {
  matcher: [
    // Everything except Next internals and static files, unless they appear
    // in a search parameter.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
