import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";

const COOKIE_NAME = "rga_cart";

const lineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const cartSchema = z.array(lineSchema).max(20);

export type CartLine = z.infer<typeof lineSchema>;

function secret(): string {
  const value =
    process.env.CART_COOKIE_SECRET?.trim() ||
    process.env.CLERK_SECRET_KEY?.trim();
  if (!value && process.env.NODE_ENV === "test") {
    return "test-cart-secret";
  }
  if (!value) {
    throw new Error("CART_COOKIE_SECRET is not set.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(lines: CartLine[]): string {
  const json = JSON.stringify(lines);
  const payload = Buffer.from(json, "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(raw: string | undefined): CartLine[] {
  if (!raw) return [];
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return [];
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return [];
  } catch {
    return [];
  }
  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const parsed = cartSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export async function readCart(): Promise<CartLine[]> {
  const jar = await cookies();
  return decode(jar.get(COOKIE_NAME)?.value);
}

export async function writeCart(lines: CartLine[]): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, encode(lines), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearCart(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function cartItemCount(): Promise<number> {
  const lines = await readCart();
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}