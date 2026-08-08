import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { GoodsCard } from "@/components/goods-card";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export default async function GoodsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = { stage: { in: ["LISTED", "SOLD_OUT"] as ("LISTED" | "SOLD_OUT")[] } };
  const [goodsList, total] = await Promise.all([
    prisma.goods.findMany({
      where,
      include: { artist: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.goods.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pt-40 pb-20">
        <p className="font-[var(--font-serif-en)] text-xs tracking-[0.35em] text-terracotta">
          GOODS
        </p>
        <h1 className="mt-2 font-[var(--font-serif-kr)] text-3xl">전체 굿즈 ({total})</h1>

        <div className="mt-10 overflow-hidden rounded-sm border border-ink/10">
          <Image
            src="/goods-images/goods-idea-banner.jpg"
            alt="작품과 일상을 잇는 굿즈 아이디어 — 작가 작품을 활용한 굿즈 제작 예시"
            width={2304}
            height={960}
            className="h-auto w-full"
            priority
          />
        </div>

        {goodsList.length === 0 ? (
          <p className="mt-12 text-sm text-ink/50">등록된 굿즈가 없습니다.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {goodsList.map((goods) => (
              <GoodsCard key={goods.id} goods={goods} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4 text-sm">
            <Link
              href={`/goods?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={`rounded-full border border-ink/20 px-4 py-1.5 ${
                page <= 1 ? "pointer-events-none opacity-30" : "hover:border-ink"
              }`}
            >
              ← 이전
            </Link>
            <span className="text-ink/60">
              {page} / {totalPages}
            </span>
            <Link
              href={`/goods?page=${page + 1}`}
              aria-disabled={page >= totalPages}
              className={`rounded-full border border-ink/20 px-4 py-1.5 ${
                page >= totalPages ? "pointer-events-none opacity-30" : "hover:border-ink"
              }`}
            >
              다음 →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
