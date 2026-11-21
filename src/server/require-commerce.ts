import "server-only";
import { notFound } from "next/navigation";
import { isEnabled, type FlagName } from "./flags";

export function requireFlag(flag: FlagName): void {
  if (!isEnabled(flag)) notFound();
}