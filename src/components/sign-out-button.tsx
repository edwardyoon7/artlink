"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-left tracking-wide text-ink/70 transition-colors hover:text-ink"
    >
      로그아웃
    </button>
  );
}
