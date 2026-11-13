import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { connection } from "next/server";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";
import { jsonLd, publicStructuredData } from "@/content/structured-data";
import { site } from "@/content/site";
import { indexingDecision } from "@/server/indexing";
import { requestNonce } from "@/server/request-nonce";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  const indexable = indexingDecision(host) === "index";

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — a working farm`,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: "en",
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: { icon: "/icon.svg" },
  };
}

const structuredData = jsonLd(publicStructuredData());

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Strict CSP needs a per-request nonce, so the tree renders on the request.
  await connection();
  const nonce = requestNonce(await headers());

  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        {nonce ? (
          <script
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: structuredData }}
          />
        ) : null}
        {/*
          The Clerk CSP guide wraps this in Suspense so the rest of the page
          can still be a static shell. This tree is dynamic already, because
          of connection() above, and a Suspense boundary around the page body
          flushes a 200 before a page can call notFound(). So the provider
          sits in the tree directly.
        */}
        <ClerkProvider dynamic>
          <SkipLink />
          <div id="app-shell">
            <SiteHeader />
            <main id="content">{children}</main>
            <SiteFooter />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
