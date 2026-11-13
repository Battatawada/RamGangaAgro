import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

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
console.log(JSON.stringify({
  status: response.status,
  keys: Object.keys(json ?? {}),
  codes: (json.errors ?? []).map((error) => error.code),
}));
if (!json.svix_url) process.exit(0);
const file = join(tmpdir(), "rga-svix-url.txt");
writeFileSync(file, json.svix_url ?? "");

const imported = await import(
  pathToFileURL(join(tmpdir(), "rga-playwright", "node_modules", "playwright-core", "index.js")).href
);
const chromium = imported.chromium ?? imported.default.chromium;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.goto(json.svix_url, { waitUntil: "domcontentloaded", timeout: 30000 });
try {
  await page.getByText("Add Endpoint").first().waitFor({ timeout: 20000 });
  await page.getByText("Add Endpoint").first().click();
} catch {
  const text = (await page.locator("body").innerText()).replace(/https?:\/\/\S+/g, "[url]").replace(/\s+/g, " ").slice(0, 200);
  console.log(JSON.stringify({ title: await page.title(), text }));
  await browser.close();
  process.exit(0);
}
await page.waitForTimeout(1500);
const fields = await page.evaluate(() =>
  [...document.querySelectorAll("input, textarea, label")].map((node) => ({
    tag: node.tagName,
    type: node.getAttribute("type"),
    name: node.getAttribute("name"),
    placeholder: node.getAttribute("placeholder"),
    text: node.tagName === "LABEL" ? node.textContent?.trim().slice(0, 80) : undefined,
  })),
);
console.log(JSON.stringify({ title: await page.title(), fields }, null, 2));
await browser.close();
