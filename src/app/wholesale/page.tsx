import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WholesaleForm } from "@/components/WholesaleForm";
import { farmLocation } from "@/content/contact-config";
import { metadataFor } from "@/content/seo";

export const metadata: Metadata = metadataFor("/wholesale");

export default function WholesalePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Wholesale" }]} path="/wholesale" />
      <div className="container-page section">
        <h1 className="type-h1">Wholesale enquiries</h1>
        <p className="type-deck prose-measure mt-6 text-ink-muted">
          Request a quote for Raktshali rice or wheat from {farmLocation}. MOQ:{" "}
          {"{{WHOLESALE_MOQ}}"}. Pack sizes: 25 kg and 50 kg. Lead time:{" "}
          {"{{WHOLESALE_LEAD_TIME}}"}. Payment terms: {"{{WHOLESALE_PAYMENT_TERMS}}"}.
          Promised reply: {"{{WHOLESALE_REPLY_TIME}}"}.
        </p>
        <p className="mt-4 text-sm text-ink-muted">
          Nothing on this form is an order or a contract. The farm confirms
          availability on reply.
        </p>
        <div className="mt-10 max-w-[40rem]">
          <WholesaleForm />
        </div>
        <p className="mt-8">
          <Link href="/contact" className="text-link">
            General contact
          </Link>
        </p>
      </div>
    </>
  );
}