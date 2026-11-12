import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to Ram Ganga Agro.",
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="container-page section">
        <h1 className="type-h1">Contact.</h1>
        <p className="type-deck prose-measure mt-6 text-ink-muted">
          Write to the farm. If you are asking about a harvest, the notes list
          is the surer way to hear back.
        </p>

        {/*
          The right column holds published contact details. The farm has not
          supplied an address, a phone number or a public email, so there is
          no second column to draw.
        */}
        <div className="mt-12">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
