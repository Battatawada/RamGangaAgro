import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const getUser = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => auth(),
  clerkClient: async () => ({ users: { getUser: (id: string) => getUser(id) } }),
}));

const { requireAdmin } = await import("@/server/auth/require-admin");

describe("requireAdmin", () => {
  beforeEach(() => {
    auth.mockReset();
    getUser.mockReset();
  });

  it("refuses a missing session", async () => {
    auth.mockResolvedValue({ userId: null });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: false, reason: "no_session" });
    expect(getUser).not.toHaveBeenCalled();
  });

  it("refuses a customer, even with a second factor enrolled", async () => {
    auth.mockResolvedValue({ userId: "user_1", factorVerificationAge: [30, 30] });
    getUser.mockResolvedValue({
      publicMetadata: { role: "customer" },
      twoFactorEnabled: true,
    });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: false, reason: "not_admin" });
  });

  it("refuses a session whose second factor age is -1, even with an admin claim", async () => {
    auth.mockResolvedValue({
      userId: "user_2",
      factorVerificationAge: [12, -1],
      sessionClaims: { metadata: { role: "admin" } },
    });
    getUser.mockResolvedValue({
      publicMetadata: { role: "admin" },
      twoFactorEnabled: false,
    });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: false, reason: "no_second_factor" });
    // The Backend API is never reached, so a stale claim cannot help either.
    expect(getUser).not.toHaveBeenCalled();
  });

  it("refuses an admin whose live user has two-factor off", async () => {
    auth.mockResolvedValue({ userId: "user_3", factorVerificationAge: [5, 5] });
    getUser.mockResolvedValue({
      publicMetadata: { role: "admin" },
      twoFactorEnabled: false,
    });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: false, reason: "no_second_factor" });
  });

  it("refuses a stale admin claim when live metadata says customer", async () => {
    auth.mockResolvedValue({
      userId: "user_4",
      factorVerificationAge: [5, 5],
      sessionClaims: { metadata: { role: "admin" } },
    });
    getUser.mockResolvedValue({
      publicMetadata: { role: "customer" },
      twoFactorEnabled: true,
    });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: false, reason: "not_admin" });
  });

  it("fails closed when the live lookup throws", async () => {
    auth.mockResolvedValue({ userId: "user_5", factorVerificationAge: [5, 5] });
    getUser.mockRejectedValue(new Error("clerk unavailable"));

    const result = await requireAdmin();

    expect(result).toEqual({ ok: false, reason: "lookup_failed" });
  });

  it("admits a live admin with a second factor enrolled", async () => {
    auth.mockResolvedValue({ userId: "user_6", factorVerificationAge: [5, 5] });
    getUser.mockResolvedValue({
      publicMetadata: { role: "admin" },
      twoFactorEnabled: true,
    });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: true, userId: "user_6" });
  });

  it("reads the fva claim when the auth object does not expose the array", async () => {
    auth.mockResolvedValue({
      userId: "user_7",
      sessionClaims: { fva: [2, -1] },
    });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: false, reason: "no_second_factor" });
  });
});
