import Link from "next/link";
import { formatPaise } from "@/lib/money";
import { getOrderByAccessToken } from "@/server/orders";
import { requireFlag } from "@/server/require-commerce";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function GuestOrderAccessPage({ searchParams }: Props) {
  requireFlag("CHECKOUT_ENABLED");
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="container-page section max-w-xl">
        <h1 className="type-h1">Order lookup</h1>
        <p className="mt-6 text-ink-muted">This link is missing a token.</p>
      </div>
    );
  }

  const order = await getOrderByAccessToken(token);
  if (!order) {
    return (
      <div className="container-page section max-w-xl">
        <h1 className="type-h1">Order lookup</h1>
        <p className="mt-6 text-ink-muted">We could not find that order.</p>
      </div>
    );
  }

  return (
    <div className="container-page section max-w-xl">
      <h1 className="type-h1">Your order</h1>
      <p className="mt-4 text-ink-muted">Status: {order.status}</p>
      <p className="mt-2">Total: {formatPaise(order.totalPaise)}</p>
      <p className="mt-8">
        <Link href="/contact" className="text-link">
          Questions about this order
        </Link>
      </p>
    </div>
  );
}