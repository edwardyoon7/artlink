"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { AboutArtieum } from "@/components/about-artieum";

type NavItem = { label: string; href: string };

export function MobileNav({
  nav,
  isLoggedIn,
  isAdmin,
}: {
  nav: NavItem[];
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        className="flex h-8 w-8 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
        />
        <span className={`block h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
        <span
          className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-ink/10 bg-base px-6 py-6 shadow-sm">
          <nav className="flex flex-col gap-4 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="tracking-wide text-ink/70 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/mypage"}
                  onClick={() => setOpen(false)}
                  className="tracking-wide text-ink/70 transition-colors hover:text-ink"
                >
                  {isAdmin ? "관리자" : "마이페이지"}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="tracking-wide text-ink/70 transition-colors hover:text-ink"
              >
                로그인
              </Link>
            )}
            <AboutArtieum />
          </nav>
        </div>
      )}
    </div>
  );
}
