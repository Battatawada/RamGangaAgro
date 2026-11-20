import type { Metadata } from "next";
import Link from "next/link";
import { farmLocation } from "@/content/contact-config";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "संपर्क — राम गंगा एग्रो",
  description: `${farmLocation} में राम गंगा एग्रो से संपर्क करें।`,
  alternates: { canonical: `${site.url}/contact` },
  robots: { index: false, follow: true },
};

export default function HindiContactPage() {
  return (
    <div className="container-page section max-w-[40rem]">
      <p className="type-caption text-ink-muted">
        <Link href="/contact" className="text-link">
          English contact form
        </Link>
      </p>
      <h1 className="type-h1 mt-6">संपर्क</h1>
      <p className="mt-6 text-ink-muted">
        फॉर्म अभी अंग्रेज़ी पृष्ठ पर है। {"{{HINDI_CONTACT_BODY}}"}
      </p>
      <p className="mt-6">
        <Link href="/contact" className="text-link">
          Contact form (English)
        </Link>
      </p>
    </div>
  );
}