import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AboutArtieum } from "@/components/about-artieum";

const nav = [
  { label: "작가", href: "/#artists" },
  { label: "교육", href: "/#education" },
  { label: "작품", href: "/artworks" },
  { label: "굿즈", href: "/goods" },
  { label: "전시·협회", href: "/#exhibitions" },
  { label: "문의", href: "/#contact" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-base/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-[var(--font-serif-en)] text-xl tracking-[0.2em]">
            ART·IEUM
          </span>
          <span className="font-[var(--font-sans-kr)] text-xs tracking-wide text-terracotta">
            아트이음
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <MobileNav
            nav={nav}
            isLoggedIn={!!session?.user}
            isAdmin={session?.user?.role === "ADMIN"}
          />
          <nav className="hidden items-center gap-8 text-sm md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="tracking-wide text-ink/70 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link
                  href={session.user.role === "ADMIN" ? "/admin" : "/mypage"}
                  className="tracking-wide text-ink/70 transition-colors hover:text-ink"
                >
                  {session.user.role === "ADMIN" ? "관리자" : "마이페이지"}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="tracking-wide text-ink/70 transition-colors hover:text-ink"
              >
                로그인
              </Link>
            )}
            <AboutArtieum />
          </nav>
        </div>
      </div>
    </header>
  );
}
