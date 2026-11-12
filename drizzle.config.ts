import { defineConfig } from "drizzle-kit";

/** Schema changes run as the migrator role, never as the app role. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL_MIGRATE ?? "",
  },
  strict: true,
});
