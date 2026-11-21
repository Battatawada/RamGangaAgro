"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/Button";
import { formatPaise } from "@/lib/money";
import { checkoutAction } from "@/server/actions";
import { idleResult, type ActionResult } from "@/server/actions/result";

type Props = {
  itemTotalPaise: number;
  shippingPaise: number;
  paymentsEnabled: boolean;
};

export function CheckoutForm({
  itemTotalPaise,
  shippingPaise,
  paymentsEnabled,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    (ActionResult & { redirectUrl?: string; orderId?: string }) | null,
    FormData
  >(checkoutAction, idleResult);

  useEffect(() => {
    if (!state?.ok) return;
    if (state.redirectUrl) {
      window.location.href = state.redirectUrl;
      return;
    }
    if (state.orderId) {
      router.push(`/checkout/success?order=${state.orderId}`);
    }
  }, [state, router]);

  const total = itemTotalPaise + shippingPaise;

  return (
    <form action={formAction} className="grid max-w-xl gap-4">
      <input type="hidden" name="country" value="IN" />
      <input type="text" name="website" hidden defaultValue="" tabIndex={-1} autoComplete="off" />

      <div>
        <label className="field-label" htmlFor="checkout-name">
          Name
        </label>
        <input id="checkout-name" name="name" required className="field-input" autoComplete="name" />
      </div>
      <div>
        <label className="field-label" htmlFor="checkout-email">
          Email
        </label>
        <input
          id="checkout-email"
          name="email"
          type="email"
          required
          className="field-input"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="checkout-phone">
          Phone
        </label>
        <input
          id="checkout-phone"
          name="phone"
          type="tel"
          required
          className="field-input"
          autoComplete="tel"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="checkout-line1">
          Address
        </label>
        <input id="checkout-line1" name="line1" required className="field-input" autoComplete="street-address" />
      </div>
      <div>
        <label className="field-label" htmlFor="checkout-line2">
          Apartment, suite (optional)
        </label>
        <input id="checkout-line2" name="line2" className="field-input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="checkout-city">
            City
          </label>
          <input id="checkout-city" name="city" required className="field-input" autoComplete="address-level2" />
        </div>
        <div>
          <label className="field-label" htmlFor="checkout-region">
            State
          </label>
          <input id="checkout-region" name="region" required className="field-input" autoComplete="address-level1" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="checkout-postal">
          PIN code
        </label>
        <input
          id="checkout-postal"
          name="postalCode"
          required
          className="field-input max-w-[10rem]"
          inputMode="numeric"
          pattern="\d{6}"
          autoComplete="postal-code"
        />
      </div>

      <div className="surface mt-4 p-5 text-sm">
        <p>Items: {formatPaise(itemTotalPaise)}</p>
        <p className="mt-1">Shipping: {formatPaise(shippingPaise)}</p>
        <p className="mt-3 font-medium">Total: {formatPaise(total)}</p>
      </div>

      {!paymentsEnabled ? (
        <p className="text-ink-muted">
          Payment is not enabled on this site yet. You can still save your order
          details for testing.
        </p>
      ) : null}

      {state && !state.ok ? (
        <p className="field-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" variant="shop" disabled={pending}>
        {pending
          ? "Working…"
          : paymentsEnabled
            ? "Pay securely"
            : "Place order (no payment)"}
      </Button>
    </form>
  );
}