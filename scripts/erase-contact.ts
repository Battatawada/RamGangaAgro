/**
 * Erases one address on request.
 *
 *   npm run contact:erase -- --email someone@example.com --reason "erasure request"
 *
 * It uses DATABASE_URL_PRIVACY, which is the rga_privacy login. That login may
 * delete that address's contact messages and subscriber row and insert an
 * audit row. It cannot browse the inbox, it is not the reader, and it is not
 * the migrator. The audit row commits before anything is deleted.
 */
import postgres from "postgres";
import { connectResolved } from "../src/server/db/connect";
import { isProductionTarget, operatorUrl } from "./database-target";
import { databaseSsl, redactConnectionString } from "./development-branch";

function readFlag(argv: string[], name: string): string {
  const index = argv.indexOf(name);
  return index >= 0 ? (argv[index + 1] ?? "").trim() : "";
}

async function main() {
  const url = operatorUrl(isProductionTarget(process.argv), "rga_privacy");

  const email = readFlag(process.argv, "--email").toLowerCase();
  const reason = readFlag(process.argv, "--reason");

  if (!email.includes("@")) {
    console.error("An --email address is required.");
    process.exit(1);
  }
  if (reason.length < 8) {
    console.error("A --reason of at least 8 characters is required.");
    process.exit(1);
  }

  const sql = postgres(url, {
    max: 1,
    ssl: databaseSsl(url),
    socket: connectResolved as never,
  });

  try {
    await sql.begin(async (tx) => {
      await tx`
        insert into audit_log (action, target_type, note)
        values (
          'contact.erased',
          'email',
          ${sql.json({ reason, at: new Date().toISOString() })}
        )
      `;
    });

    const messages = await sql`delete from contact_messages where email = ${email}`;
    const subscriber = await sql`delete from subscribers where email = ${email}`;

    console.log(
      `Erased ${messages.count} contact message(s) and ${subscriber.count} subscriber row(s).`,
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(
    redactConnectionString(error instanceof Error ? error.message : "Unknown failure."),
  );
  process.exit(1);
});
