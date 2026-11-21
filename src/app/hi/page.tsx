import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { farmLocation } from "@/content/contact-config";
import { site } from "@/content/site";
import { isEnabled } from "@/server/flags";

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
      <p className="type-eyebrow mt-6 text-green tracking-[0.14em]">
        राम गंगा एग्रो · मामोनी, बारां
      </p>
      <h1 className="type-h1 mt-4">
        मामोनी, बारां में रक्तशाली चावल और गेहूँ।
      </h1>
      <p className="mt-6 text-ink-muted">
        राम गंगा एग्रो प्राकृतिक खेती करता है। इस पृष्ठ पर अभी बिक्री शुरू नहीं
        हुई है।
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/our-farm">खेत पढ़ें</Button>
        <Button href="/grow" variant="quiet">
          हम क्या उगाते हैं
        </Button>
        <Button href="/hi/contact" variant="quiet">
          संपर्क
        </Button>
        {isEnabled("STOREFRONT_ENABLED") ? (
          <Link href="/shop" className="btn btn-quiet min-h-11">
            The harvest (English shop)
          </Link>
        ) : null}
      </div>
    </div>
  );
}