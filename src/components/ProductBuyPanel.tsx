"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { NewsletterForm } from "@/components/NewsletterForm";
import { formatPaise, netQuantityLabel } from "@/lib/money";
import { cartAction } from "@/server/actions";
import { idleResult } from "@/server/actions/result";
import type { CatalogProduct } from "@/server/catalog";

type Props = {
  product: CatalogProduct;
  checkoutEnabled: boolean;
};

export function ProductBuyPanel({ product, checkoutEnabled }: Props) {
  const activeVariants = useMemo(
    () => product.variants.filter((variant) => variant.active),
    [product.variants],
  );

  const defaultVariant =
    activeVariants.find((variant) => variant.quantity > 0) ?? activeVariants[0];

  const [variantId, setVariantId] = useState(defaultVariant?.id ?? "");
  const selected = activeVariants.find((variant) => variant.id === variantId);

  const [state, formAction] = useActionState(cartAction, idleResult);

  const chilledBlocked = product.shippingClass === "chilled";
  const canBuy =
    checkoutEnabled &&
    product.purchasable &&
    selected &&
    selected.pricePaise > 0 &&
    selected.quantity > 0 &&
    !chilledBlocked;

  if (!product.purchasable || !selected) {
    return (
      <p className="text-ink-muted">
        This pack is not for sale yet.{" "}
        {product.growHref ? (
          <Link href={product.growHref} className="text-link">
            Read the crop story
          </Link>
        ) : null}
      </p>
    );
  }

  const soldOut = activeVariants.every((variant) => variant.quantity <= 0);
  if (soldOut) {
    return (
      <div>
        <p className="text-ink-muted">Sold out for this harvest.</p>
        <div className="mt-6">
          <NewsletterForm source={`waitlist:${product.slug}`} />
        </div>
      </div>
    );
  }

  const quantityLabel = netQuantityLabel({
    weightGrams: selected.weightGrams,
    volumeMl: selected.volumeMl,
  });

  const useSelect = activeVariants.length > 3;

  const variantPicker = useSelect ? (
    <label className="block">
      <span className="field-label">Pack</span>
      <select
        className="field-input"
        value={variantId}
        onChange={(event) => setVariantId(event.target.value)}
      >
        {activeVariants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.name}
            {netQuantityLabel(variant) ? ` · ${netQuantityLabel(variant)}` : ""}
          </option>
        ))}
      </select>
    </label>
  ) : (
    <fieldset>
      <legend className="field-label">Pack</legend>
      <div className="mt-2 flex flex-col gap-3">
        {activeVariants.map((variant) => (
          <label key={variant.id} className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="variant"
              value={variant.id}
              checked={variantId === variant.id}
              onChange={() => setVariantId(variant.id)}
            />
            <span>
              {variant.name}
              {netQuantityLabel(variant) ? ` · ${netQuantityLabel(variant)}` : ""}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="lg:sticky lg:top-24">
      <p className="type-h3">{formatPaise(selected.pricePaise)}</p>
      {quantityLabel ? (
        <p className="type-caption mt-2">Net quantity: {quantityLabel}</p>
      ) : null}

      <div className="mt-6">{variantPicker}</div>

      {chilledBlocked ? (
        <p className="mt-6 text-ink-muted">
          Chilled delivery is not open yet. This pack cannot be ordered online.
        </p>
      ) : null}

      {canBuy ? (
        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="variantId" value={selected.id} />
          <label className="block">
            <span className="field-label">Quantity</span>
            <input
              className="field-input max-w-[8rem]"
              type="number"
              name="quantity"
              min={1}
              max={Math.min(99, selected.quantity)}
              defaultValue={1}
            />
          </label>
          {!state?.ok && state && "message" in state ? (
            <p className="field-error" role="alert">
              {state.message}
            </p>
          ) : null}
          <Button type="submit" variant="shop">
            Add to bag
          </Button>
        </form>
      ) : checkoutEnabled ? (
        <p className="mt-6 text-ink-muted">This pack cannot be added yet.</p>
      ) : null}

      {canBuy ? (
        <p className="type-caption mt-4">
          <Link href="/cart" className="text-link">
            View your bag
          </Link>
        </p>
      ) : null}
    </div>
  );
}