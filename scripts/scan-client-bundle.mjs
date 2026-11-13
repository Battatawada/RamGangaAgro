/**
 * Fails if a secret-shaped string reached the built client assets.
 * Run after `next build`.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const FORBIDDEN = [
  "sk_live_",
  "sk_test_",
  "CLERK_SECRET",
  "DATABASE_URL",
  "WHSEC_",
  "postgres://",
  "postgresql://",
  "neon.tech",
];
const ROOTS = [".next/static"];

/**
 * `process.env.CLERK_SECRET_KEY` appears in Clerk's own browser bundle as a
 * property read that is undefined in a browser. The name is not the value, so
 * a bare `env.NAME` lookup is not a finding. A literal value still is.
 */
function isEnvLookup(contents, index) {
  return /(?:process\.)?(?:\w+\.)?env\.$/.test(
    contents.slice(Math.max(0, index - 24), index),
  );
}

/**
 * The Postgres driver builds a URL with `'postgres://' + rest`. That source
 * text is not a credential. A real URL continues with a user or host.
 */
function isSchemePrefix(contents, index, needle) {
  if (needle !== "postgres://" && needle !== "postgresql://") return false;
  const rest = contents.slice(index, index + needle.length + 4);
  // 'postgres://' + rest, or the driver's 'postgres://x' + rest parser.
  return (
    /postgres(?:ql)?:\/\/['"`+]/.test(rest) ||
    /postgres(?:ql)?:\/\/x['"]/.test(rest)
  );
}

/** Clerk checks key prefixes in its own browser code. A real key is longer. */
function isKeyPrefixCheck(contents, index, needle) {
  if (needle !== "sk_live_" && needle !== "sk_test_") return false;
  const around = contents.slice(Math.max(0, index - 16), index + needle.length + 2);
  return around.includes(`"${needle}"`) || around.includes(`'${needle}'`);
}

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

async function main() {
  const findings = [];

  for (const root of ROOTS) {
    try {
      await stat(root);
    } catch {
      console.error(`${root} is missing. Run the build first.`);
      process.exit(1);
    }

    for await (const file of walk(root)) {
      if (!/\.(js|mjs|css|json|map|txt|html)$/.test(file)) continue;
      const contents = await readFile(file, "utf8");
      for (const needle of FORBIDDEN) {
        let index = contents.indexOf(needle);
        while (index > -1) {
          if (
            !isEnvLookup(contents, index) &&
            !isSchemePrefix(contents, index, needle) &&
            !isKeyPrefixCheck(contents, index, needle)
          ) {
            findings.push(`${needle} in ${file}`);
            break;
          }
          index = contents.indexOf(needle, index + needle.length);
        }
      }
    }
  }

  if (findings.length > 0) {
    console.error("Secret-shaped strings in the client bundle:");
    for (const finding of findings) console.error(`  ${finding}`);
    process.exit(1);
  }

  console.log("Client bundle scan clean.");
}

main();
