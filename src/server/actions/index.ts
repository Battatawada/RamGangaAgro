"use server";

import { cookies } from "next/headers";
import { getClientIp } from "./request-context";
import { submitContact } from "./core/contact";
import { submitNewsletter } from "./core/newsletter";
import { submitUnsubscribe } from "./core/unsubscribe";
import { messages, type ActionResult } from "./result";

/** A missing or refused client address fails the form. It does not open the write. */
async function addressOr(failure: ActionResult): Promise<{ ip: string } | ActionResult> {
  try {
    return { ip: await getClientIp() };
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Rate limit client address was refused.",
    );
    return failure;
  }
}

/** The form body is read field by field. Unknown fields fail the .strict() parse. */
function read(formData: FormData, keys: string[]): Record<string, unknown> {
  const input: Record<string, unknown> = {};
  for (const key of keys) {
    const value = formData.get(key);
    if (value !== null) input[key] = typeof value === "string" ? value : "";
  }
  return input;
}

export async function contactAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const context = await addressOr({ ok: false, message: messages.contactFailed });
  if (!("ip" in context)) return context;
  return submitContact(read(formData, ["name", "email", "message", "company"]), context);
}

export async function newsletterAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const context = await addressOr({ ok: false, message: messages.newsletterFailed });
  if (!("ip" in context)) return context;
  const input = read(formData, ["email", "consent", "source", "company"]);
  const result = await submitNewsletter(input, context);

  if (result.ok) {
    // /follow uses this to tell a real submission from a direct visit. It is
    // not an identity and it grants nothing.
    const jar = await cookies();
    jar.set("rga_followed", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
  }

  return result;
}

export async function unsubscribeAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const context = await addressOr({
    ok: false,
    message: messages.unsubscribeTooMany,
  });
  if (!("ip" in context)) return context;
  return submitUnsubscribe(read(formData, ["email"]), context);
}
