// `server-only` throws when it is imported outside a React Server Component
// build. The modules under test are server modules, so the guard is stubbed.
import { vi } from "vitest";

vi.mock("server-only", () => ({}));
