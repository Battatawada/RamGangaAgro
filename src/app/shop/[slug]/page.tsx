import Link from "next/link";
import { notFound } from "next/navigation";
import { IllustrationImage } from "@/components/IllustrationImage";
import { PhotoSlot } from "@/components/PhotoSlot";
import { ProductBuyPanel } from "@/components/ProductBuyPanel";
import { ShopFaqList } from "@/components/ShopFaqList";
import { trustDetails } from "@/content/contact-config";
import { packLegal } from "@/content/commerce-legal";
import { mediaById } from "@/content/media";
import { crops } from "@/content/crops";
import { metadataForShopProduct } from "@/content/seo";
import { getCatalogProduct } from "@/server/catalog";
import { requireFlag } from "@/server/require-commerce";
import { isEnabled } from "@/server/flags";
import { shippingClassLabel } from "@/server/shipping";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug).catch(() => null);
  if (!product) return {};
  return metadataForShopProduct(product.name, `/shop/${slug}`);
}

export default async function ShopProductPage({ params }: Props) {
  requireFlag("STOREFRONT_ENABLED");
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof getCatalogProduct>> = null;
  try {
    product = await getCatalogProduct(slug);
  } catch {
    product = null;
  }
  if (!product) notFound();

  const crop = crops.find(
    (entry) => entry.productSlug === slug || entry.slug === slug,
  );
  const illustration = crop ? mediaById(crop.mediaId) : null;

  return (
    <div className="container-page section">
      <p className="type-eyebrow text-green">Pack</p>
      <div className="mt-4 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          {illustration ? (
            <IllustrationImage asset={illustration} className="mx-auto h-auto w-full max-w-md" sizes="(min-width: 1024px) 480px, 90vw" />
          ) : (
            <PhotoSlot label="A pack photograph will appear here when the farm supplies one." />
          )}
        </div>
        <div>
          <h1 className="type-h1">{product.name}</h1>
          {product.summary ? (
            <p className="mt-4 text-ink-muted">{product.summary}</p>
          ) : null}
          <p className="type-caption mt-4">{shippingClassLabel(product.shippingClass)}</p>
          {product.growHref ? (
            <p className="mt-4">
              <Link href={product.growHref} className="text-link">
                Read the crop story
              </Link>
            </p>
          ) : null}

          <div className="mt-8">
            <ProductBuyPanel
              product={product}
              checkoutEnabled={isEnabled("CHECKOUT_ENABLED")}
            />
          </div>

          {product.ingredients ? (
            <p className="mt-8 text-ink-muted">
              <span className="font-medium text-ink">Ingredients: </span>
              {product.ingredients}
            </p>
          ) : null}
          {product.allergens ? (
            <p className="mt-2 text-ink-muted">
              <span className="font-medium text-ink">Allergens: </span>
              {product.allergens}
            </p>
          ) : null}

          <ul className="type-caption mt-8 space-y-1">
            {trustDetails.fssai ? <li>FSSAI: {trustDetails.fssai}</li> : null}
            {packLegal.mrpNote ? <li>{packLegal.mrpNote}</li> : null}
            {packLegal.packerName && packLegal.packerAddress ? (
              <li>
                Packed by {packLegal.packerName}, {packLegal.packerAddress}
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="mt-16 max-w-2xl">
        <ShopFaqList />
      </div>
    </div>
  );
}