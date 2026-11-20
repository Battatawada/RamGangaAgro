/**
 * Fails the build when a page marked search-indexable still contains {{PLACEHOLDERS}}.
 */
import { readFile } from "node:fs/promises";

const PLACEHOLDER = /\{\{[A-Z0-9_]+\}\}/;

const indexablePaths = [
  "/",
  "/grow",
  "/contact",
  "/privacy",
  "/terms",
];

const sources = [
  { path: "/", files: ["src/app/page.tsx", "src/content/seo.ts"] },
  { path: "/grow", files: ["src/app/grow/page.tsx", "src/content/seo.ts"] },
  { path: "/contact", files: ["src/app/contact/page.tsx"] },
  { path: "/privacy", files: ["src/app/privacy/page.tsx"] },
  { path: "/terms", files: ["src/app/terms/page.tsx"] },
];

async function main() {
  const failures = [];

  for (const { path, files } of sources) {
    if (!indexablePaths.includes(path)) continue;
    for (const file of files) {
      const text = await readFile(file, "utf8");
      if (PLACEHOLDER.test(text)) {
        failures.push(`${path}: placeholder remains in ${file}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error("Indexable pages still contain placeholders:");
    for (const line of failures) console.error(`  ${line}`);
    process.exit(1);
  }

  console.log("Indexable placeholder check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});