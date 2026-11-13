import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";
import { metadataFor } from "@/content/seo";

export const metadata: Metadata = metadataFor("/contact");

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} path="/contact" />
      <div className="container-page section">
        <h1 className="type-h1">Contact.</h1>
        <p className="type-deck prose-measure mt-6 text-ink-muted">
          Write to the farm. A note about a harvest is welcome. The list on
          the homepage is the way to hear when the farm has something to say.
        </p>

        <div className="mt-12 grid items-start gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.7fr)] lg:gap-20">
          <ContactForm />
          <aside className="max-w-[36ch] border-t border-line pt-6 lg:border-t-0 lg:pt-0">
            <h2 className="type-h3">What happens next</h2>
            <p className="mt-4 text-ink-muted">
              The note is stored for the farm to read. There is no automatic
              reply.
            </p>
            <h2 className="type-h3 mt-10">No public address</h2>
            <p className="mt-4 text-ink-muted">
              An email address, a telephone number, and a place are not
              published here. The story is still being written.
            </p>
            <DecorativeMark id="seeds" className="mt-8 h-14 w-44" />
          </aside>
        </div>
      </div>
    </>
  );
}
