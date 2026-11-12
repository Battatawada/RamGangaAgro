"use client";

import { useActionState } from "react";
import { unsubscribeAction } from "@/server/actions";
import type { ActionResult } from "@/server/actions/result";

export function UnsubscribeForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    unsubscribeAction,
    null,
  );

  return (
    <form action={formAction} className="grid max-w-[28rem] gap-4">
      <div>
        <label className="field-label" htmlFor="unsubscribe-email">
          Email
        </label>
        <input
          id="unsubscribe-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="field-input"
        />
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Sending…" : "Remove this address"}
        </button>
      </div>

      {/* The same sentence for every address, listed or not. */}
      <p aria-live="polite" className="empty:hidden">
        {state ? state.message : ""}
      </p>
    </form>
  );
}
