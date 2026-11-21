import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { metadataFor } from "@/content/seo";
import { readCart } from "@/server/cart-cookie";
import { resolveCartLines } from "@/server/catalog";
import { requireFlag } from "@/server/require-commerce";
import { DEFAULT_SHIPPING_PAISE } from "@/server/shipping";
import { isEnabled } from "@/server/flags";

export const metadata = metadataFor("/checkout");

export default async function CheckoutPage() {
  requireFlag("CHECKOUT_ENABLED");

  const lines = await readCart();
  const resolved = await resolveCartLines(lines);

  if (!resolved.ok || resolved.items.length === 0) {
    return (
      <div className="container-page section">
        <h1 className="type-h1">Checkout</h1>
        <p className="mt-6 text-ink-muted">Add something to your bag first.</p>
        <p className="mt-6">
          <Link href="/shop" className="text-link">
            Visit the harvest
          </Link>
        </p>
      </div>
    );
  }

  const itemsSubtotal = resolved.items.reduce(
    (sum, item) => sum + item.unitPricePaise * item.quantity,
    0,
  );
  const shippingPaise = DEFAULT_SHIPPING_PAISE;

  return (
    <div className="container-page section">
      <h1 className="type-h1">Checkout</h1>
      <p className="mt-4 max-w-[36ch] text-ink-muted">
        Delivery in India only. Totals are calculated on the server before
        payment.
      </p>
      <div className="mt-10">
        <CheckoutForm
          itemTotalPaise={itemsSubtotal}
          shippingPaise={shippingPaise}
          paymentsEnabled={isEnabled("PAYMENTS_ENABLED")}
        />
      </div>
    </div>
  );
}