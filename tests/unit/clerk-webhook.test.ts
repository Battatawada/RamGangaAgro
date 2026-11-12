import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import type { ClerkUserUpsert } from "@/server/db/repositories";

const verifyWebhook = vi.fn();

const seenEvents = new Set<string>();
const users = new Map<string, ClerkUserUpsert & { deleted?: boolean }>();

vi.mock("@clerk/nextjs/webhooks", () => ({
  verifyWebhook: (request: unknown) => verifyWebhook(request),
}));

vi.mock("@/server/db/repositories", () => ({
  applyClerkEventOnce: async (
    eventId: string,
    effect: "upsert" | "delete",
    user: ClerkUserUpsert,
  ) => {
    if (seenEvents.has(eventId)) return { applied: false };
    seenEvents.add(eventId);
    if (effect === "delete") {
      const existing = users.get(user.clerkUserId);
      if (existing) existing.deleted = true;
    } else {
      users.set(user.clerkUserId, { ...user });
    }
    return { applied: true };
  },
}));

const { POST } = await import("@/app/api/webhooks/clerk/route");

function request(eventId: string): NextRequest {
  return new Request("https://rgagro.me/api/webhooks/clerk", {
    method: "POST",
    headers: { "svix-id": eventId },
  }) as unknown as NextRequest;
}

function userCreated(id: string, extras: Record<string, unknown> = {}) {
  return {
    type: "user.created",
    data: {
      id,
      email_addresses: [{ id: "idn_1", email_address: "reader@example.com" }],
      primary_email_address_id: "idn_1",
      first_name: "A",
      last_name: "Reader",
      public_metadata: {},
      unsafe_metadata: {},
      ...extras,
    },
  };
}

describe("clerk webhook", () => {
  beforeEach(() => {
    verifyWebhook.mockReset();
    seenEvents.clear();
    users.clear();
  });

  it("returns 400 and writes no user when the signature is bad", async () => {
    verifyWebhook.mockRejectedValue(new Error("bad signature"));

    const response = await POST(request("evt_bad"));

    expect(response.status).toBe(400);
    expect(users.size).toBe(0);
    expect(seenEvents.size).toBe(0);
  });

  it("applies the same event id once", async () => {
    verifyWebhook.mockResolvedValue(userCreated("user_1"));

    const first = await POST(request("evt_1"));
    const second = await POST(request("evt_1"));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(users.size).toBe(1);
  });

  it("stores a customer when unsafe_metadata asks for admin", async () => {
    verifyWebhook.mockResolvedValue(
      userCreated("user_2", {
        public_metadata: {},
        unsafe_metadata: { role: "admin" },
      }),
    );

    await POST(request("evt_2"));

    expect(users.get("user_2")?.role).toBe("customer");
  });

  it("stores admin when publicMetadata says admin on a verified event", async () => {
    verifyWebhook.mockResolvedValue(
      userCreated("user_3", { public_metadata: { role: "admin" } }),
    );

    await POST(request("evt_3"));

    expect(users.get("user_3")?.role).toBe("admin");
  });

  it("stores an unknown role as customer", async () => {
    verifyWebhook.mockResolvedValue(
      userCreated("user_4", { public_metadata: { role: "superuser" } }),
    );

    await POST(request("evt_4"));

    expect(users.get("user_4")?.role).toBe("customer");
  });

  it("returns 500 so Clerk retries when storage fails", async () => {
    verifyWebhook.mockResolvedValue(userCreated("user_5"));
    const repositories = await import("@/server/db/repositories");
    const spy = vi
      .spyOn(repositories, "applyClerkEventOnce")
      .mockRejectedValueOnce(new Error("connection lost"));

    const response = await POST(request("evt_5"));

    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  it("refuses a delivery with no event id", async () => {
    verifyWebhook.mockResolvedValue(userCreated("user_6"));

    const response = await POST(
      new Request("https://rgagro.me/api/webhooks/clerk", {
        method: "POST",
      }) as unknown as NextRequest,
    );

    expect(response.status).toBe(400);
    expect(users.size).toBe(0);
  });
});
