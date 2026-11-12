/**
 * The inbox read, as logic that can be tested without a database.
 *
 * The rule the shape of this file exists to enforce: the audit row has to be
 * durable before a single message is produced. A select inside the same
 * uncommitted transaction is not enough, so the audit insert gets its own
 * transaction and that transaction has to commit first.
 */

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date | string;
};

export type ReaderClient = {
  /** Inserts the audit row and commits it. It must reject if either fails. */
  insertAuditRowAndCommit(input: {
    action: string;
    targetType: string;
    note: { reason: string; at: string };
  }): Promise<void>;
  selectMessages(limit: number): Promise<ContactMessageRow[]>;
};

export type ReadResult =
  | { ok: true; messages: ContactMessageRow[] }
  | { ok: false; error: string };

export async function readContactMessages(
  client: ReaderClient,
  options: { reason: string; limit?: number; now?: () => Date },
): Promise<ReadResult> {
  const reason = options.reason.trim();
  if (reason.length < 8) {
    return { ok: false, error: "A reason of at least 8 characters is required." };
  }

  const at = (options.now ?? (() => new Date()))().toISOString();

  try {
    await client.insertAuditRowAndCommit({
      action: "contact_messages.read",
      targetType: "contact_messages",
      note: { reason, at },
    });
  } catch (error) {
    // Nothing is read and nothing is printed if the audit row did not commit.
    return {
      ok: false,
      error: `The audit row did not commit, so no message was read. ${
        error instanceof Error ? error.message : ""
      }`.trim(),
    };
  }

  const messages = await client.selectMessages(options.limit ?? 100);
  return { ok: true, messages };
}
