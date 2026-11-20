import type { Metadata } from "next";
import Link from "next/link";
import { farmLocation } from "@/content/contact-config";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "राम गंगा एग्रो — मामोनी, बारां",
  description: `मामोनी, ${farmLocation} में राम गंगा एग्रो रक्तशाली चावल और गेहूँ उगाता है।`,
  alternates: { canonical: site.url },
  robots: { index: false, follow: true },
};

export default function HindiHomePage() {
  return (
    <div className="container-page section max-w-[40rem]">
      <p className="type-caption text-ink-muted">
        <Link href="/" className="text-link">
          English
        </Link>
      </p>
      <h1 className="type-h1 mt-6">राम गंगा एग्रो</h1>
      <p className="mt-6 text-ink-muted">
        मामोनी, बारां जिले में रक्तशाली (रक्तशाली) चावल और गेहूँ। {"{{HINDI_HOME_BODY}}"}
      </p>
      <p className="mt-6">
        <Link href="/hi/contact" className="text-link">
          संपर्क
        </Link>
      </p>
    </div>
  );
}