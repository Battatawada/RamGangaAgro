import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { UnsubscribeForm } from "@/components/UnsubscribeForm";
import { metadataFor } from "@/content/seo";

export const metadata: Metadata = metadataFor("/unsubscribe");

export default function UnsubscribePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Unsubscribe" }]} path="/unsubscribe" />
      <div className="container-page section">
        <h1 className="type-h1">Unsubscribe.</h1>
        <div className="prose-page mt-8">
          <p className="text-ink-muted">
            Enter the address you want removed from the harvest notes list.
            The reply is the same whether or not that address was on the list.
          </p>
        </div>
        <div className="mt-8">
          <UnsubscribeForm />
        </div>
      </div>
    </>
  );
}
