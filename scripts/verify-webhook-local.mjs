import { readFileSync, unlinkSync, existsSync } from "node:fs";

if (existsSync(".svix-create.json")) {
  const data = JSON.parse(readFileSync(".svix-create.json", "utf8"));
  const url = new URL(data.svix_url);
  console.log(JSON.stringify({ host: url.host, hasToken: url.search.length > 0 }));
  unlinkSync(".svix-create.json");
}

const missing = await fetch("http://localhost:3000/api/webhooks/clerk", {
  method: "POST",
  body: "{}",
});
const bad = await fetch("http://localhost:3000/api/webhooks/clerk", {
  method: "POST",
  headers: {
    "svix-id": "msg_phase1_invalid",
    "svix-timestamp": String(Math.floor(Date.now() / 1000)),
    "svix-signature": "v1,invalid",
  },
  body: JSON.stringify({ type: "user.updated", data: { id: "user_invalid_probe" } }),
});
console.log(JSON.stringify({ missing: missing.status, bad: bad.status }));
