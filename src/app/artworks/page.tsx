import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ArtworkCard } from "@/components/artwork-card";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ARTWORK_CATEGORY_LABELS, ARTWORK_CATEGORY_FILTER_OPTIONS } from "@/lib/artwork-category";
import type { ArtworkCategory, Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 12;

type SearchParams = {
  page?: string;
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function ArtworksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page: pageParam, q, category, minPrice: minPriceParam, maxPrice: maxPriceParam } =
    await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const keyword = q?.trim() || "";
  const selectedCategory = ARTWORK_CATEGORY_FILTER_OPTIONS.includes(category as ArtworkCategory)
    ? (category as ArtworkCategory)
    : "";
  const minPrice = Number(minPriceParam);
  const maxPrice = Number(maxPriceParam);
  const hasMinPrice = Number.isFinite(minPrice) && minPriceParam;
  const hasMaxPrice = Number.isFinite(maxPrice) && maxPriceParam;

  const where: Prisma.ArtworkWhereInput = {
    status: { in: ["LISTED", "SOLD"] },
    ...(keyword && {
      OR: [
        { title: { contains: keyword } },
        { artist: { name: { contains: keyword } } },
      ],
    }),
    ...(selectedCategory && { category: selectedCategory }),
    ...((hasMinPrice || hasMaxPrice) && {
      price: {
        ...(hasMinPrice && { gte: minPrice }),
        ...(hasMaxPrice && { lte: maxPrice }),
      },
    }),
  };

  const session = await auth();

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

  const favoritedIds = session?.user
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: { userId: session.user.id, artworkId: { in: artworks.map((a) => a.id) } },
            select: { artworkId: true },
          })
        ).map((f) => f.artworkId),
      )
    : new Set<string>();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filterQuery = new URLSearchParams();
  if (keyword) filterQuery.set("q", keyword);
  if (selectedCategory) filterQuery.set("category", selectedCategory);
  if (hasMinPrice) filterQuery.set("minPrice", minPriceParam!);
  if (hasMaxPrice) filterQuery.set("maxPrice", maxPriceParam!);
  const filterQueryString = filterQuery.toString();

  function pageHref(target: number) {
    const params = new URLSearchParams(filterQueryString);
    params.set("page", String(target));
    return `/artworks?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pt-40 pb-20">
        <p className="font-[var(--font-serif-en)] text-xs tracking-[0.35em] text-terracotta">
          ARTWORKS
        </p>
        <h1 className="mt-2 font-[var(--font-serif-kr)] text-3xl">전체 작품 ({total})</h1>

        <form method="get" className="mt-8 flex flex-wrap items-end gap-4 rounded-sm border border-ink/20 p-6">
          <label className="block text-sm">
            <span className="text-ink/70">작품명·작가명</span>
            <input
              type="text"
              name="q"
              defaultValue={keyword}
              placeholder="검색어 입력"
              className="mt-1 w-48 rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink/70">구분</span>
            <select
              name="category"
              defaultValue={selectedCategory}
              className="mt-1 w-32 rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
            >
              <option value="">전체</option>
              {ARTWORK_CATEGORY_FILTER_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {ARTWORK_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-ink/70">최소 가격</span>
            <input
              type="number"
              name="minPrice"
              min={0}
              defaultValue={minPriceParam}
              className="mt-1 w-32 rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink/70">최대 가격</span>
            <input
              type="number"
              name="maxPrice"
              min={0}
              defaultValue={maxPriceParam}
              className="mt-1 w-32 rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-2 text-sm tracking-wide text-base"
          >
            검색
          </button>
          {(keyword || selectedCategory || hasMinPrice || hasMaxPrice) && (
            <Link href="/artworks" className="text-sm text-ink/60 underline">
              초기화
            </Link>
          )}
        </form>

        {artworks.length === 0 ? (
          <p className="mt-12 text-sm text-ink/50">조건에 맞는 작품이 없습니다.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                showFavorite={!!session?.user}
                isFavorited={favoritedIds.has(artwork.id)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4 text-sm">
            <Link
              href={pageHref(page - 1)}
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
              href={pageHref(page + 1)}
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
