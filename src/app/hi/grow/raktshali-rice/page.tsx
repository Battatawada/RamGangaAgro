import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

const path = "/grow/raktshali-rice";

export const metadata: Metadata = {
  title: "रक्तशाली चावल — राम गंगा एग्रो",
  alternates: { canonical: `${site.url}${path}` },
  robots: { index: false, follow: true },
};

export default function HindiRaktshaliPage() {
  return (
    <div className="container-page section max-w-[40rem]">
      <Link href={path} className="text-link">
        English crop page
      </Link>
      <h1 className="type-h1 mt-6">रक्तशाली चावल</h1>
      <p className="mt-6 text-ink-muted">{"{{HINDI_RAKTSHALI_BODY}}"}</p>
    </div>
  );
}