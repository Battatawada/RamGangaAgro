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
    source: z.enum(["homepage", "footer"]),
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
