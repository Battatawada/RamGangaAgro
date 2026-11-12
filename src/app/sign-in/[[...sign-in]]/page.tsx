import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/** Not linked from the public navigation. The instance is invite-only. */
export default function SignInPage() {
  return (
    <div className="container-page section flex justify-center">
      <SignIn />
    </div>
  );
}
