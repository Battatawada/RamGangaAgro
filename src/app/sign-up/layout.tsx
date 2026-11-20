import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

/** Clerk loads only on sign-up so the public site does not pull bot-protection scripts. */
export default function SignUpLayout({ children }: { children: ReactNode }) {
  return <ClerkProvider dynamic>{children}</ClerkProvider>;
}