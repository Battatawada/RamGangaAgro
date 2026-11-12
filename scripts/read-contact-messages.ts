/**
 * Reads the contact inbox.
 *
 *   npm run messages:read -- --reason "replying to a note about the harvest"
 *
 * It uses DATABASE_URL_MESSAGES, which is the rga_messages_reader login. That
 * login may select contact_messages and insert audit_log, and nothing else.
 * The migration login is not used here. The audit row commits before the
 * first message is printed; if that commit fails, nothing is printed and the
 * exit code is non-zero.
 */
import postgres from "postgres";
import {
  readContactMessages,
  type ReaderClient,
} from "../src/server/scripts/read-contact-messages";

function readReason(argv: string[]): string {
  const index = argv.indexOf("--reason");
  return index >= 0 ? (argv[index + 1] ?? "") : "";
}

async function main() {
  const url = process.env.DATABASE_URL_MESSAGES;
  if (!url) {
    console.error("DATABASE_URL_MESSAGES is not set.");
    process.exit(1);
  }

  const reason = readReason(process.argv);
  const sql = postgres(url, { max: 1 });

  const client: ReaderClient = {
    async insertAuditRowAndCommit(input) {
      await sql.begin(async (tx) => {
        await tx`
          insert into audit_log (action, target_type, note)
          values (${input.action}, ${input.targetType}, ${sql.json(input.note)})
        `;
      });
    },
    async selectMessages(limit) {
      const rows = await sql<
        { id: string; name: string; email: string; message: string; created_at: Date }[]
      >`
        select id, name, email, message, created_at
        from contact_messages
        order by created_at desc
        limit ${limit}
      `;
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message,
        createdAt: row.created_at,
      }));
    },
  };

  try {
    const result = await readContactMessages(client, { reason });

    if (!result.ok) {
      console.error(result.error);
      process.exitCode = 1;
      return;
    }

    if (result.messages.length === 0) {
      console.log("No messages.");
      return;
    }

    for (const message of result.messages) {
      console.log("—".repeat(40));
      console.log(`${message.createdAt} · ${message.name} <${message.email}>`);
      console.log(message.message);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown failure.");
  process.exit(1);
});
