import { describe, expect, it, vi } from "vitest";
import {
  readContactMessages,
  type ReaderClient,
} from "@/server/scripts/read-contact-messages";

const message = {
  id: "1",
  name: "A Reader",
  email: "reader@example.com",
  message: "A note.",
  createdAt: new Date("2026-11-12T00:00:00Z"),
};

function client(overrides: Partial<ReaderClient> = {}): ReaderClient {
  return {
    insertAuditRowAndCommit: vi.fn(async () => {}),
    selectMessages: vi.fn(async () => [message]),
    ...overrides,
  };
}

describe("reading the contact inbox", () => {
  it("commits the audit row before any message is selected", async () => {
    const order: string[] = [];
    const reader = client({
      insertAuditRowAndCommit: vi.fn(async () => {
        order.push("audit committed");
      }),
      selectMessages: vi.fn(async () => {
        order.push("messages selected");
        return [message];
      }),
    });

    const result = await readContactMessages(reader, {
      reason: "replying to a note",
    });

    expect(result.ok).toBe(true);
    expect(order).toEqual(["audit committed", "messages selected"]);
  });

  it("prints nothing when the audit insert fails", async () => {
    const selectMessages = vi.fn(async () => [message]);
    const reader = client({
      insertAuditRowAndCommit: vi.fn(async () => {
        throw new Error("insert refused");
      }),
      selectMessages,
    });

    const result = await readContactMessages(reader, {
      reason: "replying to a note",
    });

    expect(result.ok).toBe(false);
    expect(selectMessages).not.toHaveBeenCalled();
  });

  it("prints nothing when the commit fails", async () => {
    const selectMessages = vi.fn(async () => [message]);
    const reader = client({
      insertAuditRowAndCommit: vi.fn(async () => {
        throw new Error("could not commit");
      }),
      selectMessages,
    });

    const result = await readContactMessages(reader, { reason: "an audit check" });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toMatch(/did not commit/);
    expect(selectMessages).not.toHaveBeenCalled();
  });

  it("requires a reason before it reads anything", async () => {
    const reader = client();

    const result = await readContactMessages(reader, { reason: "  " });

    expect(result.ok).toBe(false);
    expect(reader.insertAuditRowAndCommit).not.toHaveBeenCalled();
    expect(reader.selectMessages).not.toHaveBeenCalled();
  });

  it("records the reason and the time in the audit note", async () => {
    const insertAuditRowAndCommit = vi.fn(async () => {});
    const reader = client({ insertAuditRowAndCommit });

    await readContactMessages(reader, {
      reason: "replying to a note about the harvest",
      now: () => new Date("2026-11-12T10:00:00Z"),
    });

    expect(insertAuditRowAndCommit).toHaveBeenCalledWith({
      action: "contact_messages.read",
      targetType: "contact_messages",
      note: {
        reason: "replying to a note about the harvest",
        at: "2026-11-12T10:00:00.000Z",
      },
    });
  });
});
