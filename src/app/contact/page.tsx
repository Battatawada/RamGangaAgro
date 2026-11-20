import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactChannels } from "@/components/ContactChannels";
import { ContactForm } from "@/components/ContactForm";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";
import { TrustBlock } from "@/components/TrustBlock";
import { farmLocation } from "@/content/contact-config";
import { metadataFor } from "@/content/seo";

export const metadata: Metadata = metadataFor("/contact");

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} path="/contact" />
      <div className="container-page section">
        <h1 className="type-h1">Contact</h1>
        <p className="type-deck prose-measure mt-6 text-ink-muted">
          Write about Raktshali rice, wheat, or wholesale from {farmLocation}. You
          will receive one automatic confirmation by email when your message is
          stored.
        </p>

        <ContactChannels />

        <div className="mt-12 grid items-start gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.7fr)] lg:gap-20">
          <ContactForm />
          <aside className="max-w-[36ch] border-t border-line pt-6 lg:border-t-0 lg:pt-0">
            <h2 className="type-h3">What happens next</h2>
            <p className="mt-4 text-ink-muted">
              The farm reads your message and replies by email when possible.
            </p>
            <h2 className="type-h3 mt-10">Harvest waitlist</h2>
            <p className="mt-4 text-ink-muted">
              Prefer one email at harvest time? Use the form on{" "}
              <Link href="/follow" className="text-link">
                Follow the farm
              </Link>
              .
            </p>
            <TrustBlock />
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/follow" className="text-link">
                First-harvest waitlist
              </Link>
              <Link href="/grow" className="text-link">
                What we grow
              </Link>
              <Link href="/wholesale" className="text-link">
                Wholesale
              </Link>
            </p>
            <DecorativeMark id="seeds" className="mt-8 h-14 w-44" />
          </aside>
        </div>
      </div>
    </>
  );
}