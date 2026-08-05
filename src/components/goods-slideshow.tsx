"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Goods = {
  id: string;
  title: string;
  price: number | null;
  stage: string;
  imageUrl: string | null;
  artist: { name: string };
};

const AUTO_ADVANCE_MS = 4500;

export function GoodsSlideshow({ goods }: { goods: Goods[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (goods.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % goods.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [goods.length]);

  if (goods.length === 0) return null;

  const current = goods[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + goods.length) % goods.length);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/goods/${current.id}`} className="group block">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-ink/5">
          {current.imageUrl ? (
            <Image
              key={current.id}
              src={current.imageUrl}
              alt={current.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover transition-opacity duration-500"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-ink/40">
              이미지 없음
            </div>
          )}
          {current.stage === "SOLD_OUT" && (
            <span className="absolute right-3 top-3 rounded-full bg-ink px-3 py-1 text-xs text-base">
              품절
            </span>
          )}
        </div>
        <p className="mt-4 font-[var(--font-serif-kr)] text-xl">{current.title}</p>
        <p className="text-sm text-ink/60">
          {current.artist.name} · {current.price != null ? `${current.price.toLocaleString()}원` : "-"}
        </p>
      </Link>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="이전 굿즈"
          className="rounded-full border border-ink/20 px-3 py-1 text-sm hover:border-ink"
        >
          ←
        </button>
        <div className="flex gap-1.5">
          {goods.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번째 굿즈`}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-ink" : "bg-ink/20"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="다음 굿즈"
          className="rounded-full border border-ink/20 px-3 py-1 text-sm hover:border-ink"
        >
          →
        </button>
      </div>
    </div>
  );
}
