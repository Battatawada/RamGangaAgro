"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { contactAction } from "@/server/actions";
import type { ActionResult } from "@/server/actions/result";

export function ContactForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    contactAction,
    null,
  );

  useEffect(() => {
    if (!state || state.ok) return;
    if (state.fieldErrors?.name) nameRef.current?.focus();
    else if (state.fieldErrors?.email) emailRef.current?.focus();
    else if (state.fieldErrors?.message) messageRef.current?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <div className="surface p-8">
        <p className="type-h3">Your note has been received.</p>
        <p className="mt-4">
          <Link href="/" className="text-link">
            Back to the farm
          </Link>
        </p>
      </div>
    );
  }

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="grid max-w-[40rem] gap-5">
      <div>
        <label className="field-label" htmlFor="contact-name">
          Name
        </label>
        <input
          ref={nameRef}
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={80}
          className="field-input"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name ? (
          <p className="field-error" id="contact-name-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label className="field-label" htmlFor="contact-email">
          Email
        </label>
        <input
          ref={emailRef}
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="field-input"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email ? (
          <p className="field-error" id="contact-email-error">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label className="field-label" htmlFor="contact-message">
          Message
        </label>
        <textarea
          ref={messageRef}
          id="contact-message"
          name="message"
          required
          rows={7}
          minLength={10}
          maxLength={2000}
          className="field-input"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <p className="field-error" id="contact-message-error">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot. Hidden from everyone, including assistive technology. */}
      <input type="text" name="company" hidden defaultValue="" />

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </button>
      </div>

      <p aria-live="polite" className="field-error empty:hidden">
        {state && !state.ok ? state.message : ""}
      </p>

      <p className="text-sm text-ink-muted">
        <Link href="/privacy" className="text-link">
          What the farm does with this note
        </Link>
      </p>
    </form>
  );
}
