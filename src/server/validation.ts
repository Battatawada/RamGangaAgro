import { z } from "zod";

/**
 * Every action parses with .strict(), so an unexpected field is a rejection
 * rather than something that is quietly carried into a query.
 */
export const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .pipe(z.email("Enter an email address.")),
    message: z
      .string()
      .trim()
      .min(10, "Write at least a sentence.")
      .max(2000, "That message is too long."),
    company: z.string().max(0),
  })
  .strict();

export const newsletterSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .pipe(z.email("Enter an email address.")),
    consent: z.literal("on", {
      error: "Say that you want harvest notes.",
    }),
    source: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .refine(
        (value) =>
          value === "homepage" ||
          value === "footer" ||
          value.startsWith("waitlist:"),
        { message: "Unknown source." },
      ),
    company: z.string().max(0),
  })
  .strict();

export const unsubscribeSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .pipe(z.email("Enter an email address.")),
  })
  .strict();

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;

const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const wholesaleSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .pipe(z.email("Enter an email address.")),
    phone: z
      .string()
      .trim()
      .min(10, "Enter a phone number.")
      .max(20, "That phone number is too long."),
    company: z.string().trim().min(1, "Enter a company name.").max(120),
    product: z.enum(["raktshali-rice", "wheat"], {
      error: "Choose a product.",
    }),
    quantityKg: z.coerce
      .number()
      .int("Enter whole kilograms.")
      .min(25, "Minimum enquiry is 25 kg."),
    destination: z.string().trim().min(2, "Enter a destination.").max(200),
    gstin: z
      .string()
      .trim()
      .toUpperCase()
      .regex(gstinPattern, "Enter a valid 15-character GSTIN."),
    sample: z.literal("on").optional(),
    website: z.string().max(0),
  })
  .strict();

export type WholesaleInput = z.infer<typeof wholesaleSchema>;

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .pipe(z.email("Enter an email address.")),
    phone: z
      .string()
      .trim()
      .min(10, "Enter a phone number.")
      .max(20, "That phone number is too long."),
    line1: z.string().trim().min(3, "Enter the address.").max(120),
    line2: z
      .string()
      .trim()
      .max(120)
      .transform((value) => (value.length === 0 ? undefined : value))
      .optional(),
    city: z.string().trim().min(2, "Enter the city.").max(80),
    region: z.string().trim().min(2, "Enter the state.").max(80),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter a six-digit PIN code."),
    country: z.literal("IN"),
    website: z.string().max(0),
  })
  .strict();

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartUpdateSchema = z
  .object({
    variantId: z.string().uuid(),
    quantity: z.coerce.number().int().min(0).max(99),
  })
  .strict();
