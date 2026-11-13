import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { UnsubscribeForm } from "@/components/UnsubscribeForm";
import { pageMeta } from "@/content/meta";

export const metadata: Metadata = pageMeta({
  title: "Unsubscribe",
  description: "Remove an address from the harvest notes list.",
  path: "/unsubscribe",
});

export default function UnsubscribePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Unsubscribe" }]} />
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
