import Link from "next/link";
import { ShopFaqList } from "@/components/ShopFaqList";
import { formatPaise, netQuantityLabel } from "@/lib/money";
import { metadataFor } from "@/content/seo";
import { commercePolicy } from "@/content/commerce-legal";
import { listCatalog } from "@/server/catalog";
import { requireFlag } from "@/server/require-commerce";
import { isEnabled } from "@/server/flags";
import { shippingClassLabel } from "@/server/shipping";

export const metadata = metadataFor("/shop");

const categoryTitles = {
  grains: "Grains",
  dairy: "Dairy",
  other: "From the farm",
} as const;

export default async function ShopPage() {
  requireFlag("STOREFRONT_ENABLED");

  let groups: Awaited<ReturnType<typeof listCatalog>> = [];
  try {
    groups = await listCatalog();
  } catch {
    groups = [];
  }

  return (
    <div className="container-page section">
      <p className="type-eyebrow text-green">The harvest</p>
      <h1 className="type-h1 mt-4 max-w-[18ch]">Packs from the farm.</h1>
      <p className="mt-5 max-w-[36ch] text-ink-muted">
        Names, weights, and prices appear here when the farm confirms them. Each
        pack links back to its crop story.
      </p>

      {groups.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          No packs are listed yet. Read what we grow, or join the harvest waitlist
          on the{" "}
          <Link href="/" className="text-link">
            home page
          </Link>
          .
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.category} className="mt-14">
            <h2 className="type-h2">{categoryTitles[group.category]}</h2>
            <ul className="mt-8 grid gap-8 lg:grid-cols-2">
              {group.products.map((product) => {
                const variant = product.variants.find((v) => v.active);
                const qty = netQuantityLabel({
                  weightGrams: variant?.weightGrams ?? null,
                  volumeMl: variant?.volumeMl ?? null,
                });
                return (
                  <li key={product.id} className="surface p-6">
                    <h3 className="type-h3">
                      <Link href={`/shop/${product.slug}`} className="text-link no-underline">
                        {product.name}
                      </Link>
                    </h3>
                    {product.summary ? (
                      <p className="mt-3 text-ink-muted">{product.summary}</p>
                    ) : null}
                    <p className="type-caption mt-3">{shippingClassLabel(product.shippingClass)}</p>
                    {variant && product.purchasable && variant.pricePaise > 0 ? (
                      <p className="mt-3">{formatPaise(variant.pricePaise)}</p>
                    ) : null}
                    {qty ? <p className="type-caption mt-1">Net: {qty}</p> : null}
                    <p className="mt-4">
                      <Link href={`/shop/${product.slug}`} className="text-link">
                        View pack
                      </Link>
                      {product.growHref ? (
                        <>
                          {" · "}
                          <Link href={product.growHref} className="text-link">
                            Read the story
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      {commercePolicy.shipping ? (
        <p className="mt-12 max-w-[40ch] text-ink-muted">{commercePolicy.shipping}</p>
      ) : null}

      <ShopFaqList />

      {isEnabled("CHECKOUT_ENABLED") ? (
        <p className="mt-10">
          <Link href="/cart" className="text-link">
            Your bag
          </Link>
        </p>
      ) : null}
    </div>
  );
}