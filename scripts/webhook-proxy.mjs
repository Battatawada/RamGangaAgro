/**
 * Forwards only the Clerk webhook to the local app.
 * Every other request is refused, so a tunnel does not publish the site.
 */
import http from "node:http";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const server = http.createServer((request, response) => {
  const path = request.url?.split("?")[0];
  if (request.method !== "POST" || path !== "/api/webhooks/clerk") {
    response.writeHead(404);
    response.end();
    return;
  }

  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => {
    const body = Buffer.concat(chunks);
    const headerFile = join(tmpdir(), "rga-last-webhook-headers.json");
    const bodyFile = join(tmpdir(), "rga-last-webhook-body.bin");
    writeFileSync(headerFile, JSON.stringify(request.headers));
    writeFileSync(bodyFile, body);
    const headers = { ...request.headers, host: "localhost:3000" };
    const upstream = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        path: "/api/webhooks/clerk",
        method: "POST",
        headers,
      },
      (upstreamResponse) => {
        const parts = [];
        upstreamResponse.on("data", (chunk) => parts.push(chunk));
        upstreamResponse.on("end", () => {
          response.writeHead(upstreamResponse.statusCode ?? 502);
          response.end(Buffer.concat(parts));
        });
      },
    );
    upstream.on("error", () => {
      response.writeHead(502);
      response.end();
    });
    upstream.end(body);
  });
});

server.listen(8787, "127.0.0.1", () => {
  console.log("webhook-proxy-ready");
});
