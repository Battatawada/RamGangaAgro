import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { formatPaise } from "@/lib/money";
import { getOrderForUser } from "@/server/orders";
import { requireFlag } from "@/server/require-commerce";

type Props = { params: Promise<{ id: string }> };

export default async function AccountOrderPage({ params }: Props) {
  requireFlag("ACCOUNTS_ENABLED");
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const { id } = await params;
  const order = await getOrderForUser(id, session.userId);
  if (!order) notFound();

  return (
    <div className="container-page section max-w-xl">
      <p className="type-eyebrow text-green">Order</p>
      <h1 className="type-h1 mt-4">{order.id}</h1>
      <p className="mt-4 text-ink-muted">Status: {order.status}</p>
      <p className="mt-2">Total: {formatPaise(order.totalPaise)}</p>
      <p className="mt-8">
        <Link href="/account" className="text-link">
          All orders
        </Link>
      </p>
    </div>
  );
}