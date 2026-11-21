import Link from "next/link";
import { metadataFor } from "@/content/seo";
import { requireFlag } from "@/server/require-commerce";

export const metadata = metadataFor("/checkout/success");

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  requireFlag("CHECKOUT_ENABLED");
  const { order } = await searchParams;

  return (
    <div className="container-page section max-w-xl">
      <h1 className="type-h1">Thank you</h1>
      <p className="mt-6 text-ink-muted">
        {order
          ? `We are confirming payment for order ${order}. If payment completed, you will receive a plain email with the details.`
          : "We are confirming your payment. This page does not mark an order as paid."}
      </p>
      <p className="mt-6">
        <Link href="/" className="text-link">
          Back to the farm
        </Link>
      </p>
    </div>
  );
}