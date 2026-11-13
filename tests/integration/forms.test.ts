import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectResolved } from "@/server/db/connect";
import { closeDbForTests } from "@/server/db";
import { operationLimits } from "@/server/rate-limit-policy";
import { assertDevelopmentDatabase } from "../../scripts/development-branch";
import { loadEnvFile } from "../../scripts/load-env-file";

const local = loadEnvFile(".env.local");
const operator = loadEnvFile(".env.operator");
const stamp = randomBytes(4).toString("hex");
const email = `form-check-${stamp}@example.com`;
const message = "Form integration check for the development database.";

function open(url: string) {
  const pooled = url.includes("-pooler");
  return postgres(url, {
    max: 1,
    prepare: !pooled,
    ssl: url.includes("sslmode=disable") ? false : "prefer",
    socket: connectResolved as never,
  });
}

describe("public form writes on the development database", () => {
  const appUrl = local.DATABASE_URL ?? "";
  const readerUrl = operator.DATABASE_URL_MESSAGES ?? "";
  const privacyUrl = operator.DATABASE_URL_PRIVACY ?? "";
  let reader: ReturnType<typeof open> | undefined;
  let privacy: ReturnType<typeof open> | undefined;
  let app: ReturnType<typeof open> | undefined;

  beforeAll(async () => {
    if (!appUrl || !readerUrl || !privacyUrl) {
      throw new Error("Form integration tests need the development database logins.");
    }
    assertDevelopmentDatabase(appUrl, "rga_app");
    assertDevelopmentDatabase(readerUrl, "rga_messages_reader");
    assertDevelopmentDatabase(privacyUrl, "rga_privacy");

    process.env.DATABASE_URL = appUrl;
    process.env.RATE_LIMIT_PROVIDER = "postgres";
    process.env.RATE_LIMIT_IP_SOURCE = "direct";

    const { setRateLimiterForTests } = await import("@/server/rate-limit");
    setRateLimiterForTests(undefined);

    reader = open(readerUrl);
    privacy = open(privacyUrl);
    app = open(appUrl);
    await app`delete from rate_limit_buckets`;
    await privacy`delete from contact_messages where email like ${"form-check-%@example.com"}`;
    await privacy`delete from subscribers where email like ${"form-check-%@example.com"}`;
  });

  afterAll(async () => {
    if (privacy) {
      await privacy`delete from contact_messages where email like ${"form-check-%@example.com"}`;
      await privacy`delete from subscribers where email like ${"form-check-%@example.com"}`;
    }
    if (app) {
      await app`delete from rate_limit_buckets where bucket_key like ${"contact:%"} or bucket_key like ${"newsletter:%"} or bucket_key like ${"unsubscribe:%"}`;
      await app.end({ timeout: 5 });
    }
    await reader?.end({ timeout: 5 });
    await privacy?.end({ timeout: 5 });
    await closeDbForTests();
  });

  it("stores a contact note the app role cannot read back", async () => {
    const { submitContact } = await import("@/server/actions/core/contact");
    const result = await submitContact(
      {
        name: "Form Check",
        email,
        message,
        company: "",
      },
      { ip: "203.0.113.21" },
    );
    expect(result.ok).toBe(true);

    const rows = await reader!<{ name: string; email: string; message: string }[]>`
      select name, email, message from contact_messages where email = ${email}
    `;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: "Form Check", email, message });

    await expect(
      app!`select message from contact_messages where email = ${email}`,
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("subscribes and unsubscribes without saying which addresses were listed", async () => {
    const { submitNewsletter } = await import("@/server/actions/core/newsletter");
    const { submitUnsubscribe } = await import("@/server/actions/core/unsubscribe");
    const { messages } = await import("@/server/actions/result");

    const subscribed = await submitNewsletter(
      { email, consent: "on", source: "homepage", company: "" },
      { ip: "203.0.113.23" },
    );
    expect(subscribed.ok).toBe(true);

    const listed = await app!<{ unsubscribed_at: Date | null }[]>`
      select unsubscribed_at from subscribers where email = ${email}
    `;
    expect(listed).toHaveLength(1);
    expect(listed[0]?.unsubscribed_at).toBeNull();

    const unknown = await submitUnsubscribe(
      { email: `form-check-missing-${stamp}@example.com` },
      { ip: "203.0.113.24" },
    );
    const known = await submitUnsubscribe({ email }, { ip: "203.0.113.25" });
    expect(unknown).toEqual({ ok: true, message: messages.unsubscribeDone });
    expect(known).toEqual(unknown);

    const after = await app!<{ unsubscribed_at: Date | null }[]>`
      select unsubscribed_at from subscribers where email = ${email}
    `;
    expect(after[0]?.unsubscribed_at).toBeInstanceOf(Date);

    const missing = await app!<{ email: string }[]>`
      select email from subscribers where email = ${`form-check-missing-${stamp}@example.com`}
    `;
    expect(missing).toHaveLength(0);
  });

  it("limits contact, newsletter and unsubscribe independently", async () => {
    const { submitContact } = await import("@/server/actions/core/contact");
    const { submitNewsletter } = await import("@/server/actions/core/newsletter");
    const { messages } = await import("@/server/actions/result");
    const ip = "203.0.113.41";

    for (let attempt = 1; attempt <= operationLimits.contact.perIp; attempt += 1) {
      const result = await submitContact(
        {
          name: "Form Check",
          email: `form-check-${stamp}-${attempt}@example.com`,
          message,
          company: "",
        },
        { ip },
      );
      expect(result.ok).toBe(true);
    }

    const blocked = await submitContact(
      {
        name: "Form Check",
        email: `form-check-${stamp}-blocked@example.com`,
        message,
        company: "",
      },
      { ip },
    );
    expect(blocked).toEqual({ ok: false, message: messages.contactTooMany });

    const followed = await submitNewsletter(
      {
        email: `form-check-${stamp}-follow@example.com`,
        consent: "on",
        source: "homepage",
        company: "",
      },
      { ip },
    );
    expect(followed.ok).toBe(true);

    const keys = await app!<{ bucket_key: string }[]>`
      select bucket_key from rate_limit_buckets
      where bucket_key like ${"contact:ip:203.0.113.41"}
         or bucket_key like ${"newsletter:ip:203.0.113.41"}
         or bucket_key = ${"contact:all"}
         or bucket_key = ${"newsletter:all"}
    `;
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.some((row) => row.bucket_key.includes("@"))).toBe(false);
  });
});
