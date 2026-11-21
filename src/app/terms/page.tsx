import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { commercePolicy, policyOrGap } from "@/content/commerce-legal";
import { metadataFor } from "@/content/seo";

export const metadata: Metadata = metadataFor("/terms");

const LAST_UPDATED = "20 November 2026";

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Terms" }]} path="/terms" />
      <div className="container-page section">
        <h1 className="type-h1">Terms</h1>
        <p className="type-caption mt-4">Last updated: {LAST_UPDATED}</p>
        <p className="type-caption mt-2 text-ink-muted">
          TODO: professional legal review before launch.
        </p>

        <div className="prose-page mt-8">
          <h2 className="type-h2">What this site is</h2>
          <p className="mt-4 text-ink-muted">
            Ram Ganga Agro publishes information about its farm at Mamoni, Baran
            district, Rajasthan. Nothing on rgagro.me is an offer to sell grain
            online today. Enquiries and waitlist signups are not orders.
          </p>

          <h2 className="type-h2 mt-10">Pricing and availability</h2>
          <p className="mt-4 text-ink-muted">
            Prices, packs, and availability are not listed on this site until the
            farm publishes them (TODO: legal review when sales begin). Wholesale
            quotes are confirmed only in writing from the farm.
          </p>

          <h2 className="type-h2 mt-10">Delivery</h2>
          <p className="mt-4 text-ink-muted">
            {policyOrGap(commercePolicy.deliveryStates, "delivery states")}
          </p>
          <p className="mt-4 text-ink-muted">
            {policyOrGap(commercePolicy.shipping, "shipping policy")}
          </p>

          <h2 className="type-h2 mt-10">Returns</h2>
          <p className="mt-4 text-ink-muted">
            {policyOrGap(commercePolicy.returns, "returns policy")}
          </p>
          <p className="mt-4 text-ink-muted">
            {policyOrGap(commercePolicy.refunds, "refund policy")}
          </p>

          <h2 className="type-h2 mt-10">Liability</h2>
          <p className="mt-4 text-ink-muted">
            The site is provided as information about the farm (TODO: legal review
            of limitation of liability). To the extent
            permitted by law, Ram Ganga Agro is not liable for indirect loss from
            use of the website. Health or nutrition claims are not made on this
            site.
          </p>

          <h2 className="type-h2 mt-10">Content and copyright</h2>
          <p className="mt-4 text-ink-muted">
            Ask the farm before republishing text or drawings. Illustrations are
            not photographs of the farm unless labelled as such.
          </p>

          <h2 className="type-h2 mt-10">Contact and privacy</h2>
          <p className="mt-4 text-ink-muted">
            Messages are handled as described on the{" "}
            <Link href="/privacy" className="text-link">
              privacy page
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}