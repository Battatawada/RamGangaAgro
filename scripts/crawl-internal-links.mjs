/**
 * Crawl internal links from the homepage on a deployed host. Reports non-200 and loops.
 */
const base = process.argv[2] ?? "https://ram-ganga-agro.vercel.app";
const origin = new URL(base).origin;
const seen = new Set();
const queue = ["/"];
const failures = [];

async function check(path) {
  if (seen.has(path)) return;
  seen.add(path);
  const url = `${origin}${path}`;
  const response = await fetch(url, { redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location") ?? "";
    if (location.startsWith("/") && seen.has(location)) {
      failures.push({ path, issue: `redirect loop to ${location}` });
    }
    return;
  }
  if (response.status !== 200) {
    failures.push({ path, issue: `HTTP ${response.status}` });
    return;
  }
  const html = await response.text();
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    if (!queue.includes(href) && !seen.has(href)) queue.push(href);
  }
}

async function main() {
  while (queue.length > 0) {
    await check(queue.shift());
  }
  console.log(JSON.stringify({ origin, visited: [...seen].sort(), failures }, null, 2));
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});