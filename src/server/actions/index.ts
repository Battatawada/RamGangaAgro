"use server";

import { cookies } from "next/headers";
import { getClientIp } from "./request-context";
import { submitContact } from "./core/contact";
import { submitNewsletter } from "./core/newsletter";
import { submitUnsubscribe } from "./core/unsubscribe";
import type { ActionResult } from "./result";

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
  const ip = await getClientIp();
  return submitContact(read(formData, ["name", "email", "message", "company"]), {
    ip,
  });
}

export async function newsletterAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const input = read(formData, ["email", "consent", "source", "company"]);
  const result = await submitNewsletter(input, { ip });

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
  const ip = await getClientIp();
  return submitUnsubscribe(read(formData, ["email"]), { ip });
}
