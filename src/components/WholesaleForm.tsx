"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useRef } from "react";
import { trackEvent } from "@/components/Analytics";
import { wholesaleAction } from "@/server/actions";
import type { ActionResult } from "@/server/actions/result";

export function WholesaleForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    wholesaleAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) trackEvent("contact_submit", { form: "wholesale" });
  }, [state]);

  if (state?.ok) {
    return (
      <div className="surface p-8">
        <p className="type-h3">Enquiry received.</p>
        <p className="mt-4 text-ink-muted">
          The farm will reply when available. Check your inbox for an automatic
          confirmation if email is configured.
        </p>
      </div>
    );
  }

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="grid gap-5">
      <FieldBlock label="Your name" error={errors.name} id="wholesale-name">
        <input
          ref={nameRef}
          id="wholesale-name"
          name="name"
          required
          className="field-input"
          autoComplete="name"
        />
      </FieldBlock>

      <FieldBlock label="Email" error={errors.email} id="wholesale-email">
        <input id="wholesale-email" name="email" type="email" required className="field-input" />
      </FieldBlock>

      <FieldBlock label="Phone" error={errors.phone} id="wholesale-phone">
        <input id="wholesale-phone" name="phone" type="tel" required className="field-input" />
      </FieldBlock>

      <FieldBlock label="Company" error={errors.company} id="wholesale-company">
        <input id="wholesale-company" name="company" required className="field-input" />
      </FieldBlock>

      <FieldBlock label="Product" error={errors.product} id="wholesale-product">
        <select id="wholesale-product" name="product" required className="field-input" defaultValue="">
          <option value="" disabled>
            Choose
          </option>
          <option value="raktshali-rice">Raktshali rice</option>
          <option value="wheat">Wheat</option>
        </select>
      </FieldBlock>

      <FieldBlock label="Quantity (kg)" error={errors.quantityKg} id="wholesale-qty">
        <input
          id="wholesale-qty"
          name="quantityKg"
          type="number"
          min={25}
          step={1}
          required
          className="field-input"
        />
      </FieldBlock>

      <FieldBlock label="Destination" error={errors.destination} id="wholesale-dest">
        <input id="wholesale-dest" name="destination" required className="field-input" />
      </FieldBlock>

      <FieldBlock label="GSTIN" error={errors.gstin} id="wholesale-gstin">
        <input id="wholesale-gstin" name="gstin" required className="field-input" maxLength={15} />
      </FieldBlock>

      <div className="flex items-start gap-3">
        <input id="wholesale-sample" name="sample" type="checkbox" value="on" className="mt-1 h-5 w-5" />
        <label htmlFor="wholesale-sample" className="text-sm text-ink-muted">
          I would like a sample when the farm can offer one.
        </label>
      </div>

      <input type="text" name="website" hidden defaultValue="" readOnly tabIndex={-1} />

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Request quote"}
      </button>

      <p aria-live="polite" className="field-error empty:hidden">
        {state && !state.ok ? state.message : ""}
      </p>
    </form>
  );
}

function FieldBlock({
  label,
  error,
  id,
  children,
}: {
  label: string;
  error?: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}