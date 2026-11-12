import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const grants = await readFile("db/grants.sql", "utf8");

/** Comment lines are prose about the rules, not the rules themselves. */
const statements = grants
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

function mentions(pattern: RegExp): boolean {
  return pattern.test(statements);
}

describe("database grants", () => {
  it("never grants the running app SELECT on contact_messages", () => {
    expect(mentions(/GRANT INSERT ON TABLE contact_messages TO rga_app;/)).toBe(true);
    expect(
      mentions(/REVOKE SELECT, UPDATE, DELETE ON TABLE contact_messages FROM rga_app;/),
    ).toBe(true);
    expect(mentions(/GRANT[^;]*SELECT[^;]*contact_messages[^;]*TO rga_app/)).toBe(
      false,
    );
  });

  it("never grants the migrator SELECT on contact_messages", () => {
    expect(mentions(/REVOKE SELECT ON TABLE contact_messages FROM rga_migrator;/)).toBe(
      true,
    );
    expect(mentions(/GRANT[^;]*contact_messages[^;]*TO rga_migrator/)).toBe(false);
  });

  it("gives the inbox reader only SELECT on contact_messages and INSERT on audit_log", () => {
    const readerGrants = statements
      .split("\n")
      .filter(
        (line) =>
          /GRANT/.test(line) &&
          /rga_messages_reader/.test(line) &&
          /ON TABLE/.test(line),
      )
      .map((line) => line.trim());

    expect(readerGrants).toEqual([
      "GRANT SELECT ON TABLE contact_messages TO rga_messages_reader;",
      "GRANT INSERT ON TABLE audit_log TO rga_messages_reader;",
    ]);
    expect(
      mentions(
        /REVOKE SELECT, UPDATE, DELETE ON TABLE audit_log FROM rga_messages_reader;/,
      ),
    ).toBe(true);
  });

  it("keeps the audit log append-only for the app", () => {
    expect(mentions(/REVOKE UPDATE, DELETE ON TABLE audit_log FROM rga_app;/)).toBe(
      true,
    );
  });

  it("gives erasure its own login that cannot read a message body", () => {
    expect(
      mentions(/GRANT DELETE ON TABLE contact_messages, subscribers TO rga_privacy;/),
    ).toBe(true);
    expect(mentions(/REVOKE SELECT ON TABLE contact_messages FROM rga_privacy;/)).toBe(
      true,
    );
    expect(
      mentions(/GRANT SELECT \(id, email\) ON TABLE contact_messages TO rga_privacy;/),
    ).toBe(true);
  });
});
