"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { newsletterAction } from "@/server/actions";
import type { ActionResult } from "@/server/actions/result";

export function NewsletterForm({ source }: { source: "homepage" | "footer" }) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    newsletterAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      router.push("/follow");
      return;
    }
    if (state.fieldErrors?.email) emailRef.current?.focus();
    else if (state.fieldErrors?.consent) consentRef.current?.focus();
  }, [state, router]);

  const emailError = state && !state.ok ? state.fieldErrors?.email : undefined;
  const consentError = state && !state.ok ? state.fieldErrors?.consent : undefined;

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="source" value={source} />

      <div>
        <label className="field-label" htmlFor={`newsletter-email-${source}`}>
          Email
        </label>
        <input
          ref={emailRef}
          id={`newsletter-email-${source}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field-input"
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? `newsletter-email-error-${source}` : undefined}
        />
        {emailError ? (
          <p className="field-error" id={`newsletter-email-error-${source}`}>
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="flex items-start gap-3">
        <input
          ref={consentRef}
          id={`newsletter-consent-${source}`}
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-5 w-5 shrink-0"
          aria-invalid={consentError ? true : undefined}
          aria-describedby={
            consentError ? `newsletter-consent-error-${source}` : undefined
          }
        />
        <label
          className="text-sm text-ink-muted"
          htmlFor={`newsletter-consent-${source}`}
        >
          Send me harvest notes when the farm starts sending them. I can
          unsubscribe at any time.
        </label>
      </div>
      {consentError ? (
        <p className="field-error" id={`newsletter-consent-error-${source}`}>
          {consentError}
        </p>
      ) : null}

      {/* Honeypot. Hidden from everyone, including assistive technology. */}
      <input type="text" name="company" hidden defaultValue="" />

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Sending…" : "Join the farm journal"}
        </button>
      </div>

      <p aria-live="polite" className="field-error empty:hidden">
        {state && !state.ok ? state.message : ""}
      </p>

      <p className="text-sm text-ink-muted">
        <Link href="/privacy" className="text-link">
          How the farm handles your address
        </Link>
      </p>
    </form>
  );
}
