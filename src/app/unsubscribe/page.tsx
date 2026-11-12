import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { UnsubscribeForm } from "@/components/UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Remove an address from the harvest notes list.",
};

export default function UnsubscribePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Unsubscribe" }]} />
      <div className="container-page section">
        <h1 className="type-h1">Unsubscribe.</h1>
        <div className="prose-page mt-8">
          <p className="text-ink-muted">
            Enter the address you want removed from the harvest notes list.
          </p>
        </div>
        <div className="mt-8">
          <UnsubscribeForm />
        </div>
      </div>
    </>
  );
}
