"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function HeaderAuth() {
  return (
    <Show
      when="signed-in"
      fallback={
        <SignInButton mode="modal">
          <button type="button" className="btn btn-quiet min-h-11 px-4 text-[15px]">
            Sign in
          </button>
        </SignInButton>
      }
    >
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="hidden min-h-11 items-center text-[15px] hover:text-raktshali sm:inline-flex"
        >
          Account
        </Link>
        <UserButton />
      </div>
    </Show>
  );
}