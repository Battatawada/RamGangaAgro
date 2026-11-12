import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Next.js 16 runs this file as the proxy. On Next.js 15 and below the same
 * call belongs in middleware.ts.
 *
 * This is not the authorization boundary. Pages, Server Actions and route
 * handlers do their own checks. createRouteMatcher is deprecated and is not
 * used here: clerkMiddleware stays bare, and only sets the strict CSP.
 */
export default clerkMiddleware({
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
