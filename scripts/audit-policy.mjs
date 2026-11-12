/**
 * Fails CI on a high or critical advisory, unless the advisory id is named in
 * security/audit-allowlist.json with a reviewer and a review date.
 */
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);
const ALLOWLIST = "security/audit-allowlist.json";
const BLOCKING = new Set(["high", "critical"]);

async function readAllowlist() {
  try {
    const parsed = JSON.parse(await readFile(ALLOWLIST, "utf8"));
    const allowed = new Map();
    for (const entry of parsed.allowed ?? []) {
      if (!entry.advisory || !entry.reviewedOn || !entry.reviewedBy) {
        console.error(
          `${ALLOWLIST}: every entry needs advisory, reviewedBy and reviewedOn.`,
        );
        process.exit(1);
      }
      allowed.set(String(entry.advisory), entry);
    }
    return allowed;
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }
}

async function main() {
  const allowed = await readAllowlist();

  let stdout = "";
  try {
    ({ stdout } = await run("npm", ["audit", "--json"], {
      shell: process.platform === "win32",
      maxBuffer: 20 * 1024 * 1024,
    }));
  } catch (error) {
    // npm audit exits non-zero when it finds anything. The report still comes.
    stdout = error.stdout ?? "";
    if (!stdout) throw error;
  }

  const report = JSON.parse(stdout);
  const blocking = [];

  for (const [name, advisory] of Object.entries(report.vulnerabilities ?? {})) {
    if (!BLOCKING.has(advisory.severity)) continue;
    const ids = (advisory.via ?? [])
      .filter((via) => typeof via === "object" && via.url)
      .map((via) => String(via.source ?? via.url));
    const excused = ids.length > 0 && ids.every((id) => allowed.has(id));
    if (!excused) blocking.push(`${name} (${advisory.severity}) ${ids.join(", ")}`);
  }

  if (blocking.length > 0) {
    console.error("High or critical advisories that are not allowlisted:");
    for (const line of blocking) console.error(`  ${line}`);
    process.exit(1);
  }

  console.log("Audit policy satisfied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
