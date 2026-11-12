import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";

const PORT = Number(process.env.E2E_PORT ?? 3111);
export const baseUrl = `http://127.0.0.1:${PORT}`;

let server: ChildProcess | undefined;

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/`, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`The test server did not answer on ${baseUrl}.`);
}

export async function setup() {
  if (!existsSync(".next/BUILD_ID")) {
    throw new Error("Run `npm run build` before `npm run test:e2e`.");
  }

  server = spawn("npx", ["next", "start", "--port", String(PORT)], {
    // The server's own output is not inherited: on Windows an inherited pipe
    // outlives the run and the test command appears to hang.
    stdio: "ignore",
    detached: process.platform !== "win32",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      NODE_ENV: "production",
      // The public pages do not need a live Clerk instance to render, but
      // ClerkProvider refuses to start without a well-formed key.
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
        "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk",
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "sk_test_e2e-placeholder",
      ACCOUNTS_ENABLED: "false",
      ADMIN_UI_ENABLED: "false",
      STOREFRONT_ENABLED: "false",
      CHECKOUT_ENABLED: "false",
      PAYMENTS_ENABLED: "false",
    },
  });

  await waitForServer();
}

export async function teardown() {
  if (!server?.pid) return;

  if (process.platform === "win32") {
    // `shell: true` means the child is a shell, so the whole tree goes.
    spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"], {
      stdio: "ignore",
    });
  } else {
    process.kill(-server.pid, "SIGTERM");
  }
}
