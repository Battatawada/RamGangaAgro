import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

/** Not linked from the public navigation. An invitation ticket is required. */
export default function SignUpPage() {
  return (
    <div className="container-page section flex justify-center">
      <SignUp />
    </div>
  );
}
