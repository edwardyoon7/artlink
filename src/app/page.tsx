import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ArtworkSlideshow } from "@/components/artwork-slideshow";
import { GoodsSlideshow } from "@/components/goods-slideshow";
import { ThemeBackground } from "@/components/theme-background";
import { HomeHero } from "@/components/home-hero";
import { prisma } from "@/lib/prisma";

const HOME_PREVIEW_COUNT = 9;

// 프로/아마추어 작가 카드용 이미지: 실제 작품 사진을 쓰면 "이 그림은 프로가, 저 그림은
// 아마추어가 그렸다"는 오해를 줄 수 있어 별도로 준비한 대표 이미지를 고정으로 사용
const PRO_ARTIST_IMAGE = "/home-images/pro-artist.jpg";
const AMATEUR_ARTIST_IMAGE = "/home-images/amateur-artist.jpg";
const EDUCATION_IMAGE = "/home-images/education.png";

export default async function Home() {
  const [artworks, artworkCount] = await Promise.all([
    prisma.artwork.findMany({
      where: { status: { in: ["LISTED", "SOLD"] } },
      include: { artist: true },
      orderBy: { createdAt: "desc" },
      take: HOME_PREVIEW_COUNT,
    }),
    prisma.artwork.count({ where: { status: { in: ["LISTED", "SOLD"] } } }),
  ]);

  const [goodsItems, goodsCount] = await Promise.all([
    prisma.goods.findMany({
      where: { stage: { in: ["LISTED", "SOLD_OUT"] } },
      include: { artist: true },
      orderBy: { updatedAt: "desc" },
      take: HOME_PREVIEW_COUNT,
    }),
    prisma.goods.count({ where: { stage: { in: ["LISTED", "SOLD_OUT"] } } }),
  ]);

  return (
    <div className="relative min-h-screen text-ink">
      <ThemeBackground />
      <SiteHeader />

      {/* 히어로: 작가·교육·작품을 잇는다는 메시지 (배경 테마에 따라 텍스트 색이 전환됨) */}
      <HomeHero />

      {/* 작가: 프로/아마추어 두 축을 색으로 구분 */}
      <section id="artists" className="border-y border-ink/10 bg-base">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <SectionHeading kr="작가" en="Artists" />
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <ArtistCard
              href="/artists/pro"
              accent="ink"
              badge="PRO"
              title="프로 작가"
              description="미술을 전공하고 전업으로 창작 활동을 이어가는 작가입니다. 이력과 전시 경력을 중심으로 신뢰도를 보여줍니다."
              imageUrl={PRO_ARTIST_IMAGE}
            />
            <ArtistCard
              href="/artists/amateur"
              accent="terracotta"
              badge="AMATEUR"
              title="아마추어 작가"
              description="미술을 전공하지 않았지만 취미로 창작을 이어가는 작가입니다. 커리큘럼 참여 전후의 성장 서사를 보여줍니다."
              imageUrl={AMATEUR_ARTIST_IMAGE}
            />
          </div>
        </div>
      </section>

      {/* 교육: 사설기관 커리큘럼 → 전문기관 진학 지원 */}
      <section id="education" className="border-y border-ink/10 bg-base">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <SectionHeading kr="교육" en="Education" />
          <div className="mt-12 grid gap-10 md:grid-cols-[2fr_1fr]">
            <div className="grid gap-10 sm:grid-cols-3 md:gap-8">
              <EducationStep
                step="01"
                title="맞춤 커리큘럼"
                description="비전공·취미 활동자를 위한 다양한 커리큘럼으로 시작합니다."
              />
              <EducationStep
                step="02"
                title="1:1 코칭"
                description="작가로 성장할 수 있도록 개인 맞춤 코칭을 제공합니다."
              />
              <EducationStep
                step="03"
                title="전문기관 진학 지원"
                description="본인의 의지에 따라 전문 교육기관 진학까지 지원합니다."
              />
            </div>
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm border border-ink/10">
              <Image
                src={EDUCATION_IMAGE}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 작품: 가격 + 작가 스토리를 함께 노출 */}
      <section id="artworks" className="border-y border-ink/10 bg-base">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <SectionHeading kr="작품" en="Artworks" />
          <p className="mt-6 max-w-2xl text-ink/70">
            작품 사진과 가격뿐 아니라, 그 작품을 만든 작가의 이야기를 함께 소개합니다.
          </p>
          {artworks.length === 0 ? (
            <p className="mt-12 text-sm text-ink/50">아직 등록된 작품이 없습니다.</p>
          ) : (
            <div className="mt-12">
              <ArtworkSlideshow artworks={artworks} />
              <div className="mt-10 text-center">
                <Link
                  href="/artworks"
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:underline"
                >
                  전체 작품 보기 ({artworkCount}) →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 굿즈: 작가의 아이디어를 실물 상품으로, 외주 제작·샘플 검토를 Artlink가 함께 */}
      <section id="goods" className="border-y border-ink/10 bg-base">
        <div className="mx-auto max-w-6xl px-6 py-32">
          <SectionHeading kr="굿즈" en="Goods" />
          <p className="mt-6 max-w-2xl text-ink/70">
            작가의 아이디어를 실물 굿즈로 완성해가는 과정입니다. Artieum가 아이디어 컨설팅·제작
            의뢰·샘플 검토를 함께합니다.
          </p>
          {goodsItems.length === 0 ? (
            <p className="mt-12 text-sm text-ink/50">아직 등록된 굿즈가 없습니다.</p>
          ) : (
            <div className="mt-12">
              <GoodsSlideshow goods={goodsItems} />
              <div className="mt-10 text-center">
                <Link
                  href="/goods"
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:underline"
                >
                  전체 굿즈 보기 ({goodsCount}) →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 전시·협회: 향후 개설 예정 */}
      <section id="exhibitions" className="border-y border-ink/10 bg-ink text-base">
        <div className="mx-auto max-w-6xl px-6 py-32 text-center">
          <SectionHeading kr="전시·협회" en="Exhibitions & Association" inverted />
          <p className="mx-auto mt-6 max-w-xl text-base/80">
            향후 협회 설립을 통해 판매 목적의 전시회를 기획·개최하고,
            작가와 작품을 알리는 홍보 채널로 확장할 예정입니다.
          </p>
        </div>
      </section>

      {/* 문의/신청 CTA */}
      <section id="contact" className="border-y border-ink/10 bg-base">
        <div className="mx-auto max-w-6xl px-6 py-32 text-center">
          <SectionHeading kr="문의" en="Contact" />
          <p className="mx-auto mt-6 max-w-xl text-ink/70">
            작가 등록, 코칭 신청, 작품 문의를 남겨주시면 순서대로 안내드립니다.
          </p>
          <a
            href="mailto:edwardyoon7@gmail.com"
            className="mt-10 inline-block rounded-full bg-terracotta px-8 py-3 text-sm tracking-wide text-base"
          >
            문의하기
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  kr,
  en,
  inverted,
}: {
  kr: string;
  en: string;
  inverted?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-[var(--font-serif-en)] text-xs tracking-[0.35em] ${
          inverted ? "text-terracotta" : "text-terracotta"
        }`}
      >
        {en.toUpperCase()}
      </p>
      <h2 className="mt-2 font-[var(--font-serif-kr)] text-3xl">{kr}</h2>
    </div>
  );
}

function ArtistCard({
  href,
  accent,
  badge,
  title,
  description,
  imageUrl,
}: {
  href: string;
  accent: "ink" | "terracotta";
  badge: string;
  title: string;
  description: string;
  imageUrl?: string | null;
}) {
  const accentClass = accent === "ink" ? "border-ink text-ink" : "border-terracotta text-terracotta";
  const overlayClass = accent === "ink" ? "bg-ink/35" : "bg-terracotta/25";
  return (
    <Link
      href={href}
      className={`group block overflow-hidden rounded-sm border-2 transition-all hover:-translate-y-1 hover:shadow-lg ${accentClass}`}
    >
      {imageUrl && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className={`absolute inset-0 ${overlayClass}`} />
        </div>
      )}
      <div className="p-8">
        <span className="font-[var(--font-serif-en)] text-xs tracking-[0.3em]">{badge}</span>
        <h3 className="mt-4 font-[var(--font-serif-kr)] text-2xl text-ink">{title}</h3>
        <p className="mt-4 text-sm text-ink/70">{description}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink">
          자세히 보기
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

function EducationStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="font-[var(--font-serif-en)] text-2xl text-terracotta">{step}</span>
      <h3 className="mt-3 font-[var(--font-serif-kr)] text-xl">{title}</h3>
      <p className="mt-2 text-sm text-ink/70">{description}</p>
    </div>
  );
}
