import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { ArtworkForm } from "@/components/artwork-form";
import {
  FREE_ARTWORK_COUNT,
  LISTING_FEE,
  COMMISSION_RATE,
  COMMISSION_PROMO_RATE,
  COMMISSION_PROMO_DEADLINE,
  isCommissionPromoActive,
  getListingFee,
} from "@/lib/pricing";
import { getPriceSuggestion } from "@/lib/price-suggestion";
import { formatDateKST } from "@/lib/format-date";

export default async function NewArtworkPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "PRO") redirect("/mypage");

  const suggestion = await getPriceSuggestion(session.user.id);
  const existingArtworkCount = await prisma.artwork.count({ where: { artistId: session.user.id } });
  const fee = getListingFee(existingArtworkCount);
  const commissionPromoActive = isCommissionPromoActive();

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">내 작품 등록</h1>
        <p className="mt-3 text-sm text-ink/70">
          {fee === 0 ? (
            <>
              처음 {FREE_ARTWORK_COUNT}개 작품은 등록비 없이 바로 노출됩니다 (현재{" "}
              {existingArtworkCount + 1}번째 작품, 무료 등록).
            </>
          ) : (
            <>
              등록 시 위탁판매 등록비 {LISTING_FEE.toLocaleString()}원이 발생하며, 입금 확인 후
              작품이 노출됩니다 (처음 {FREE_ARTWORK_COUNT}개 무료 등록은 모두 사용하셨습니다).
            </>
          )}{" "}
          {commissionPromoActive ? (
            <>
              {formatDateKST(COMMISSION_PROMO_DEADLINE)}까지 판매완료 처리되면 수수료는 판매가의{" "}
              {COMMISSION_PROMO_RATE * 100}%(프로모션)입니다. 이후 판매완료 처리되는 건은 정상
              요율({COMMISSION_RATE * 100}%)이 적용됩니다.
            </>
          ) : (
            <>판매 시 수수료는 판매가의 {COMMISSION_RATE * 100}%입니다.</>
          )}
        </p>
        <ArtworkForm suggestion={suggestion} />
      </section>
    </div>
  );
}
