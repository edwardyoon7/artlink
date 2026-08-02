"use client";

import Image from "next/image";
import Link from "next/link";
import { useBgTheme } from "@/components/theme-provider";

const MAIN_HERO_IMAGE = "/home-images/main-hero.png";

export function HomeHero() {
  const { theme } = useBgTheme();
  const themed = theme !== "basic";

  return (
    <section className="flex min-h-screen items-center px-6 py-32">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 md:grid-cols-2">
        <div
          className={`text-center md:text-left ${
            themed ? "rounded-2xl bg-ink/45 p-8 backdrop-blur-sm md:p-10" : ""
          }`}
        >
          <p
            className={`font-[var(--font-serif-en)] text-sm tracking-[0.35em] ${
              themed ? "text-white/80" : "text-terracotta"
            }`}
          >
            ARTIST · EDUCATION · ARTWORK
          </p>
          <h1
            className={`mt-6 font-[var(--font-serif-kr)] text-4xl leading-snug md:text-6xl ${
              themed ? "text-white" : "text-ink"
            }`}
          >
            작가와 컬렉터를 잇다, Artieum
          </h1>
          <p
            className={`mx-auto mt-6 max-w-xl text-lg md:mx-0 ${
              themed ? "text-white/80" : "text-ink/70"
            }`}
          >
            당신의 취미가, 작품이 되고, 작가가 됩니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link
              href="/artworks"
              className={`rounded-full px-8 py-3 text-sm tracking-wide ${
                themed ? "bg-base text-ink" : "bg-ink text-base"
              }`}
            >
              작품 둘러보기
            </Link>
            <Link
              href="#artists"
              className={`rounded-full border-2 px-8 py-3 text-sm tracking-wide ${
                themed ? "border-white text-white" : "border-terracotta text-terracotta"
              }`}
            >
              작가로 등록하기
            </Link>
          </div>
        </div>
        <div
          className={`relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-sm border md:max-w-none ${
            themed ? "border-white/30" : "border-ink/20"
          }`}
        >
          <Image
            src={MAIN_HERO_IMAGE}
            alt="Artieum"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
