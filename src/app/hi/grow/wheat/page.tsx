import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

const path = "/grow/wheat";

export const metadata: Metadata = {
  title: "गेहूँ — राम गंगा एग्रो",
  alternates: { canonical: `${site.url}${path}` },
  robots: { index: false, follow: true },
};

export default function HindiWheatPage() {
  return (
    <div className="container-page section max-w-[40rem]">
      <Link href={path} className="text-link">
        English crop page
      </Link>
      <h1 className="type-h1 mt-6">गेहूँ</h1>
      <p className="mt-6 text-ink-muted">{"{{HINDI_WHEAT_BODY}}"}</p>
    </div>
  );
}