/**
 * Adds the development Clerk webhook endpoint in the Svix portal.
 * Writes the signing secret into .env.local and does not print it.
 *
 *   WEBHOOK_PUBLIC_BASE=https://example.trycloudflare.com node scripts/configure-dev-webhook.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const base = process.env.WEBHOOK_PUBLIC_BASE;
if (!base?.startsWith("https://")) {
  console.error("WEBHOOK_PUBLIC_BASE missing");
  process.exit(1);
}

async function readSecret(page) {
  return page.evaluate(() => {
    const fromText = document.body.innerText.match(/whsec_[^\s]+/)?.[0]?.replace(/[.,;]+$/g, "");
    if (fromText) return fromText;
    for (const input of document.querySelectorAll("input, textarea")) {
      if (typeof input.value === "string" && input.value.startsWith("whsec_")) return input.value;
    }
    return "";
  });
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const response = await fetch("https://api.clerk.com/v1/webhooks/svix_url", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});
const json = await response.json();
if (!json.svix_url) {
  console.log(JSON.stringify({ portal: response.status }));
  process.exit(1);
}

const imported = await import(
  pathToFileURL(join(tmpdir(), "rga-playwright", "node_modules", "playwright-core", "index.js")).href
);
const chromium = imported.chromium ?? imported.default.chromium;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
let apiAuth = "";
let apiOrigin = "";
page.on("request", (request) => {
  const header = request.headers().authorization;
  if (!header) return;
  try {
    const url = new URL(request.url());
    if (!url.hostname.includes("svix")) return;
    apiAuth = header;
    apiOrigin = url.origin;
  } catch {
    // ignore non-URL requests
  }
});

try {
  await page.goto(json.svix_url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.locator("a[href*='/endpoints/ep_']").first().waitFor({ timeout: 20000 });
  await page.locator("a[href*='/endpoints/ep_']").first().click();
  await page.waitForTimeout(1500);
  const reveal = page.getByRole("button", { name: "Click to reveal" });
  if (await reveal.count()) await reveal.click();
  await page.waitForTimeout(300);
  const portalPath = new URL(page.url()).pathname;
  const ids = portalPath.match(/\/(app_[^/]+)\/endpoints\/(ep_[^/]+)/);
  let secret = await readSecret(page);
  if (!secret && ids && apiAuth && apiOrigin) {
    const secretResponse = await fetch(
      `${apiOrigin}/api/v1/app/${ids[1]}/endpoint/${ids[2]}/secret`,
      { headers: { Authorization: apiAuth, Accept: "application/json" } },
    );
    const secretText = await secretResponse.text();
    secret = secretText.match(/whsec_[^\s"]+/)?.[0] ?? "";
    if (!secret) {
      const hint = await page.evaluate(() => ({
        hasWhsec: document.body.innerText.includes("whsec_"),
        inputs: [...document.querySelectorAll("input, code, pre")].filter((node) =>
          (node.value || node.textContent || "").includes("whsec_"),
        ).length,
      }));
      console.log(JSON.stringify({
        secretStatus: secretResponse.status,
        secretLength: secretText.length,
        hint,
      }));
    }
  }
  if (!secret.startsWith("whsec_")) {
    const text = (await page.locator("body").innerText()).replace(/https?:\/\/\S+/g, "[url]").replace(/\s+/g, " ").slice(0, 180);
    console.log(JSON.stringify({ created: false, text }));
    process.exit(1);
  }
  const current = readFileSync(".env.local", "utf8");
  const next = current.includes("CLERK_WEBHOOK_SIGNING_SECRET=")
    ? current.replace(/CLERK_WEBHOOK_SIGNING_SECRET=.*/, `CLERK_WEBHOOK_SIGNING_SECRET=${secret}`)
    : `${current.trimEnd()}\nCLERK_WEBHOOK_SIGNING_SECRET=${secret}\n`;
  writeFileSync(".env.local", next);
  console.log(JSON.stringify({ created: true, secretStored: true }));
} finally {
  await browser.close();
}
