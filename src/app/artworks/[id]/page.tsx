import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: { artist: true },
  });

  if (!artwork || (artwork.status !== "LISTED" && artwork.status !== "SOLD")) {
    notFound();
  }

  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 pt-40 pb-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-ink/5">
            {artwork.imageUrl ? (
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">
                이미지 없음
              </div>
            )}
            {artwork.status === "SOLD" && (
              <span className="absolute right-3 top-3 rounded-full bg-ink px-3 py-1 text-xs text-base">
                판매완료
              </span>
            )}
          </div>

          <div>
            <p className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-terracotta">
              ARTWORK
            </p>
            <h1 className="mt-2 font-[var(--font-serif-kr)] text-3xl">{artwork.title}</h1>
            <p className="mt-2 text-sm text-ink/60">{artwork.artist.name} 작가</p>

            {isLoggedIn ? (
              <div className="mt-8 space-y-6">
                <p className="text-2xl font-[var(--font-serif-kr)]">
                  {artwork.price.toLocaleString()}원
                </p>
                {artwork.description && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">
                    {artwork.description}
                  </p>
                )}
                <div className="rounded-sm border border-ink/20 p-4 text-sm text-ink/70">
                  <p className="font-medium text-ink">구입 방법</p>
                  <p className="mt-1">
                    Artlink가 작가와 컬렉터 사이에서 거래를 중개합니다. 아래 문의하기를 통해
                    구매를 요청하시면 운영자가 확인 후 안내드립니다.
                  </p>
                </div>
                <a
                  href={`mailto:edwardyoon7@gmail.com?subject=${encodeURIComponent(
                    `[구매문의] ${artwork.title}`,
                  )}`}
                  className="inline-block rounded-full bg-terracotta px-8 py-3 text-sm tracking-wide text-base"
                >
                  구매 문의하기
                </a>
              </div>
            ) : (
              <div className="mt-8 rounded-sm border-2 border-terracotta/40 bg-terracotta/5 p-6">
                <p className="font-[var(--font-serif-kr)] text-lg">
                  회원가입 후 자세한 설명과 구입 방법을 확인하실 수 있습니다.
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  가입은 1분이면 충분합니다. 이미 계정이 있으시다면 로그인해주세요.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    href="/signup"
                    className="rounded-full bg-terracotta px-6 py-2 text-sm tracking-wide text-base"
                  >
                    회원가입
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-ink/30 px-6 py-2 text-sm tracking-wide text-ink"
                  >
                    로그인
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
