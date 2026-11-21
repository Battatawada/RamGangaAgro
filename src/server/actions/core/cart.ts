import { readCart, writeCart, type CartLine } from "@/server/cart-cookie";
import { cartUpdateSchema } from "@/server/validation";
import { fieldErrorsFrom, messages, type ActionResult } from "../result";

export async function updateCartLine(input: unknown): Promise<ActionResult> {
  const parsed = cartUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: messages.cartFailed,
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const lines = await readCart();
  const next: CartLine[] = lines.filter(
    (line) => line.variantId !== parsed.data.variantId,
  );

  if (parsed.data.quantity > 0) {
    next.push({
      variantId: parsed.data.variantId,
      quantity: parsed.data.quantity,
    });
  }

  await writeCart(next);
  return { ok: true };
}