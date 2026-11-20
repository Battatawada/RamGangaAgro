import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { connection } from "next/server";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { Analytics } from "@/components/Analytics";
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

  const gsc = process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim();

  return {
    metadataBase: new URL(site.url),
    ...(gsc ? { verification: { google: gsc } } : {}),
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
        <SkipLink />
        <div id="app-shell">
          <SiteHeader />
          <main id="content">{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
