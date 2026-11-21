import Link from "next/link";
import { metadataFor } from "@/content/seo";
import { requireFlag } from "@/server/require-commerce";

export const metadata = metadataFor("/checkout/cancel");

export default function CheckoutCancelPage() {
  requireFlag("CHECKOUT_ENABLED");

  return (
    <div className="container-page section max-w-xl">
      <h1 className="type-h1">Payment not completed</h1>
      <p className="mt-6 text-ink-muted">
        Checkout was cancelled or did not finish. Nothing has been charged.
      </p>
      <p className="mt-6 flex flex-wrap gap-4">
        <Link href="/cart" className="text-link">
          Return to your bag
        </Link>
        <Link href="/contact" className="text-link">
          Contact the farm
        </Link>
      </p>
    </div>
  );
}