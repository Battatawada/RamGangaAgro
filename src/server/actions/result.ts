/** Actions answer with one of a fixed set of sentences. No stack traces. */
export const messages = {
  contactFailed: "The note was not sent. Check the fields and try again.",
  contactTooMany: "Too many notes from here. Try again later.",
  newsletterFailed: "That did not go through. Check the fields and try again.",
  newsletterTooMany: "Too many requests from here. Try again later.",
  unsubscribeDone: "If this address was on the list, it has been removed.",
  unsubscribeTooMany: "This form was submitted too often. Try again later.",
  cartFailed: "The bag could not be updated. Try again.",
  checkoutFailed: "Checkout could not be completed. Check the fields and try again.",
  checkoutTooMany: "Too many checkout attempts from here. Try again later.",
  checkoutPending:
    "Your order is recorded. Payment is not open on this site yet — the farm will confirm next steps.",
} as const;

export type FieldErrors = Record<string, string>;

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export const idleResult: ActionResult | null = null;

export function fieldErrorsFrom(
  issues: { path: PropertyKey[]; message: string }[],
): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
