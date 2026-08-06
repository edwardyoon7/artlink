import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { ArtistProfileApplyForm } from "@/components/artist-profile-apply-form";
import { PROFILE_FEE, PROFILE_FEE_PROMO, PROFILE_FEE_PROMO_DEADLINE, isProfileFeePromoActive } from "@/lib/pricing";
import { formatDateKST } from "@/lib/format-date";

export default async function NewArtistProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "PRO") redirect("/mypage");

  const existing = await prisma.artistProfile.findUnique({ where: { artistId: user.id } });
  if (existing) redirect("/mypage");

  const promoActive = isProfileFeePromoActive();

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">작가 프로필 노출 서비스</h1>
        <p className="mt-3 text-sm text-ink/70">
          내 작품 상세 페이지에 사진·학력·전시경력·수상경력이 담긴 프로필을 노출합니다. 구매를
          고민하는 컬렉터가 작가에 대한 신뢰 정보를 얻을 수 있는 프리미엄 서비스입니다.
        </p>
        <div className="mt-4 rounded-sm border border-terracotta/40 bg-terracotta/5 p-4 text-sm">
          {promoActive ? (
            <>
              <p className="font-medium text-ink">
                프로모션가 {PROFILE_FEE_PROMO.toLocaleString()}원{" "}
                <span className="text-ink/50 line-through">{PROFILE_FEE.toLocaleString()}원</span>
              </p>
              <p className="mt-1 text-ink/60">
                {formatDateKST(PROFILE_FEE_PROMO_DEADLINE)}까지 신청 시 50% 할인가로
                적용됩니다. 이후에는 정가 {PROFILE_FEE.toLocaleString()}원입니다.
              </p>
            </>
          ) : (
            <p className="font-medium text-ink">{PROFILE_FEE.toLocaleString()}원 (1회 결제)</p>
          )}
        </div>
        <p className="mt-2 text-xs text-ink/50">
          결제는 계좌이체 + 운영자 확인 방식이며, 입금 확인 즉시 프로필이 공개됩니다. 신청 이후
          내용 수정은 추가 비용 없이 마이페이지에서 언제든 가능합니다.
        </p>
        <ArtistProfileApplyForm />
      </section>
    </div>
  );
}
