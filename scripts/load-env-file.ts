import { existsSync, readFileSync } from "node:fs";

/** Reads KEY=value lines. It does not print them and does not override existing values. */
export function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const values: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    if (!key) continue;
    values[key] = line.slice(index + 1);
  }
  return values;
}

export function applyEnvFile(path: string): void {
  for (const [key, value] of Object.entries(loadEnvFile(path))) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
