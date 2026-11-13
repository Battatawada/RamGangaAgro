import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        resolve: {
          alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
        },
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
          setupFiles: ["tests/setup.ts"],
        },
      },
      {
        resolve: {
          alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
        },
        test: {
          name: "forms",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          setupFiles: ["tests/integration/setup.ts"],
          testTimeout: 60_000,
          hookTimeout: 60_000,
          fileParallelism: false,
        },
      },
      {
        resolve: {
          alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
        },
        test: {
          name: "e2e",
          environment: "node",
          include: ["tests/e2e/**/*.test.ts"],
          globalSetup: ["tests/e2e/server.ts"],
          testTimeout: 30_000,
        },
      },
    ],
  },
});
