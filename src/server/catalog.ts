import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { crops } from "@/content/crops";
import { getDb } from "./db";
import {
  inventory,
  productVariants,
  products,
} from "./db/schema";
import type { ShippingClass } from "./shipping";

export type CatalogVariant = {
  id: string;
  name: string;
  sku: string;
  pricePaise: number;
  weightGrams: number | null;
  volumeMl: number | null;
  quantity: number;
  active: boolean;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  category: "grains" | "dairy" | "other";
  shippingClass: ShippingClass;
  ingredients: string | null;
  allergens: string | null;
  purchasable: boolean;
  status: string;
  variants: CatalogVariant[];
  growHref: string | null;
};

const categoryOrder = ["grains", "dairy", "other"] as const;

export function assertPurchasableProduct(product: {
  category: string;
  allergens: string | null;
  purchasable: boolean;
}): void {
  if (product.purchasable && product.category === "dairy" && !product.allergens) {
    throw new Error("Dairy products must list allergens before they are purchasable.");
  }
}

export async function hasPublicPurchasableVariant(): Promise<boolean> {
  try {
    const rows = await getDb()
      .select({ id: productVariants.id })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .innerJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(
        and(
          eq(products.purchasable, true),
          eq(productVariants.active, true),
          sql`${productVariants.pricePaise} > 0`,
          sql`${inventory.quantity} > 0`,
        ),
      )
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

function growHrefForProductSlug(slug: string): string | null {
  const crop = crops.find((c) => c.productSlug === slug || c.slug === slug);
  return crop ? `/grow/${crop.slug}` : null;
}

export async function listCatalog(): Promise<
  { category: (typeof categoryOrder)[number]; products: CatalogProduct[] }[]
> {
  const productRows = await getDb().select().from(products);
  if (productRows.length === 0) return [];

  const ids = productRows.map((row) => row.id);
  const variantRows = await getDb()
    .select()
    .from(productVariants)
    .where(inArray(productVariants.productId, ids));

  const variantIds = variantRows.map((row) => row.id);
  const stockRows =
    variantIds.length > 0
      ? await getDb()
          .select()
          .from(inventory)
          .where(inArray(inventory.variantId, variantIds))
      : [];

  const stockByVariant = new Map(
    stockRows.map((row) => [row.variantId, row.quantity]),
  );

  const catalogProducts: CatalogProduct[] = productRows.map((row) => {
    assertPurchasableProduct({
      category: row.category,
      allergens: row.allergens,
      purchasable: row.purchasable,
    });
    const variants = variantRows
      .filter((variant) => variant.productId === row.id)
      .map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        pricePaise: variant.pricePaise,
        weightGrams: variant.weightGrams,
        volumeMl: variant.volumeMl,
        quantity: stockByVariant.get(variant.id) ?? 0,
        active: variant.active,
      }));

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      summary: row.summary,
      category: row.category as CatalogProduct["category"],
      shippingClass: row.shippingClass as ShippingClass,
      ingredients: row.ingredients,
      allergens: row.allergens,
      purchasable: row.purchasable,
      status: row.status,
      variants,
      growHref: growHrefForProductSlug(row.slug),
    };
  });

  return categoryOrder
    .map((category) => ({
      category,
      products: catalogProducts.filter((product) => product.category === category),
    }))
    .filter((group) => group.products.length > 0);
}

export async function getCatalogProduct(
  slug: string,
): Promise<CatalogProduct | null> {
  const [row] = await getDb()
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!row) return null;

  assertPurchasableProduct({
    category: row.category,
    allergens: row.allergens,
    purchasable: row.purchasable,
  });

  const variantRows = await getDb()
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, row.id));

  const variantIds = variantRows.map((variant) => variant.id);
  const stockRows =
    variantIds.length > 0
      ? await getDb()
          .select()
          .from(inventory)
          .where(inArray(inventory.variantId, variantIds))
      : [];

  const stockByVariant = new Map(
    stockRows.map((stock) => [stock.variantId, stock.quantity]),
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    category: row.category as CatalogProduct["category"],
    shippingClass: row.shippingClass as ShippingClass,
    ingredients: row.ingredients,
    allergens: row.allergens,
    purchasable: row.purchasable,
    status: row.status,
    growHref: growHrefForProductSlug(row.slug),
    variants: variantRows.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      pricePaise: variant.pricePaise,
      weightGrams: variant.weightGrams,
      volumeMl: variant.volumeMl,
      quantity: stockByVariant.get(variant.id) ?? 0,
      active: variant.active,
    })),
  };
}

export async function resolveCartLines(
  lines: { variantId: string; quantity: number }[],
): Promise<
  | {
      ok: true;
      items: {
        variantId: string;
        quantity: number;
        unitPricePaise: number;
        name: string;
        productName: string;
        shippingClass: ShippingClass;
        maxQuantity: number;
      }[];
      shippingClasses: ShippingClass[];
    }
  | { ok: false; message: string }
> {
  if (lines.length === 0) return { ok: false, message: "Your bag is empty." };

  const ids = lines.map((line) => line.variantId);
  const rows = await getDb()
    .select({
      variantId: productVariants.id,
      name: productVariants.name,
      pricePaise: productVariants.pricePaise,
      active: productVariants.active,
      productName: products.name,
      purchasable: products.purchasable,
      shippingClass: products.shippingClass,
      quantity: inventory.quantity,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(inArray(productVariants.id, ids));

  const byId = new Map(rows.map((row) => [row.variantId, row]));
  const items: {
    variantId: string;
    quantity: number;
    unitPricePaise: number;
    name: string;
    productName: string;
    shippingClass: ShippingClass;
    maxQuantity: number;
  }[] = [];

  for (const line of lines) {
    const row = byId.get(line.variantId);
    if (!row || !row.active || !row.purchasable || row.pricePaise <= 0) {
      return { ok: false, message: "Something in your bag is no longer available." };
    }
    const available = row.quantity ?? 0;
    if (available <= 0) {
      return { ok: false, message: "Something in your bag is sold out." };
    }
    const quantity = Math.min(line.quantity, available);
    items.push({
      variantId: line.variantId,
      quantity,
      unitPricePaise: row.pricePaise,
      name: row.name,
      productName: row.productName,
      shippingClass: row.shippingClass as ShippingClass,
      maxQuantity: available,
    });
  }

  return {
    ok: true,
    items,
    shippingClasses: [...new Set(items.map((item) => item.shippingClass))],
  };
}