import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ArtworkCard } from "@/components/artwork-card";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export default async function ArtworksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = { status: { in: ["LISTED", "SOLD"] as ("LISTED" | "SOLD")[] } };
  const [artworks, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      include: { artist: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.artwork.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pt-40 pb-20">
        <p className="font-[var(--font-serif-en)] text-xs tracking-[0.35em] text-terracotta">
          ARTWORKS
        </p>
        <h1 className="mt-2 font-[var(--font-serif-kr)] text-3xl">전체 작품 ({total})</h1>

        {artworks.length === 0 ? (
          <p className="mt-12 text-sm text-ink/50">등록된 작품이 없습니다.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4 text-sm">
            <Link
              href={`/artworks?page=${page - 1}`}
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
              href={`/artworks?page=${page + 1}`}
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
