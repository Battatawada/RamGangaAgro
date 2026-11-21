import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { formatPaise } from "@/lib/money";
import { metadataFor } from "@/content/seo";
import { getOrdersForUser } from "@/server/orders";
import { requireFlag } from "@/server/require-commerce";

export const metadata = metadataFor("/account");

export default async function AccountPage() {
  requireFlag("ACCOUNTS_ENABLED");
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const orders = session.userId ? await getOrdersForUser(session.userId) : [];

  return (
    <div className="container-page section">
      <h1 className="type-h1">Your account</h1>
      <h2 className="type-h2 mt-10">Orders</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-ink-muted">No orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id} className="py-4">
              <Link href={`/account/orders/${order.id}`} className="text-link">
                {order.id}
              </Link>
              <p className="type-caption mt-1">
                {order.status} · {formatPaise(order.totalPaise)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}