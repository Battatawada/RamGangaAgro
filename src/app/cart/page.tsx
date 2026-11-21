import Link from "next/link";
import { formatPaise } from "@/lib/money";
import { metadataFor } from "@/content/seo";
import { readCart } from "@/server/cart-cookie";
import { resolveCartLines } from "@/server/catalog";
import { requireFlag } from "@/server/require-commerce";
import { DEFAULT_SHIPPING_PAISE } from "@/server/shipping";
import { isEnabled } from "@/server/flags";

export const metadata = metadataFor("/cart");

export default async function CartPage() {
  requireFlag("CHECKOUT_ENABLED");

  const lines = await readCart();
  const resolved = await resolveCartLines(lines);

  if (!resolved.ok || resolved.items.length === 0) {
    return (
      <div className="container-page section">
        <h1 className="type-h1">Your bag</h1>
        <p className="mt-6 text-ink-muted">Your bag is empty.</p>
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
  const total = itemsSubtotal + shippingPaise;

  return (
    <div className="container-page section">
      <h1 className="type-h1">Your bag</h1>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {resolved.items.map((item) => (
          <li key={item.variantId} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-ink-muted">{item.name}</p>
              <p className="type-caption mt-1">Qty {item.quantity}</p>
            </div>
            <p className="font-medium sm:text-right">
              {formatPaise(item.unitPricePaise * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 max-w-md">
        <p>Subtotal: {formatPaise(itemsSubtotal)}</p>
        <p className="mt-1">Shipping: {formatPaise(shippingPaise)}</p>
        <p className="mt-3 type-h3">Total: {formatPaise(total)}</p>
        <p className="mt-8">
          <Link href="/checkout" className="btn btn-shop inline-flex">
            {isEnabled("PAYMENTS_ENABLED") ? "Continue to checkout" : "Continue"}
          </Link>
        </p>
      </div>
    </div>
  );
}