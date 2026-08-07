import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { PaymentNotice } from "@/components/payment-notice";
import { getBankInfo, calcSettlement } from "@/lib/pricing";
import { GOODS_STAGE_LABELS, GOODS_STAGE_CLASSES } from "@/lib/goods";
import { ArtworkCategoryEditor } from "@/components/artwork-category-editor";
import { ArtworkSizeEditor } from "@/components/artwork-size-editor";
import { ArtistProfileEditor } from "@/components/artist-profile-editor";
import { ArtworkCard } from "@/components/artwork-card";
import { PROFILE_FEE, PROFILE_FEE_PROMO, isProfileFeePromoActive } from "@/lib/pricing";
import { formatDateKST, formatDateTimeKST } from "@/lib/format-date";

const ARTWORK_STATUS_LABEL: Record<string, string> = {
  DRAFT: "입금 대기",
  LISTED: "위탁판매 중",
  SOLD: "판매 완료",
};

const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "입금 대기",
  PAYMENT_CONFIRMED: "입금 확인됨 · 강사 확인 중",
  CONFIRMED: "예약 확정",
  COMPLETED: "코칭 완료",
  CANCELLED: "취소됨",
};

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isCollector = session.user.role === "COLLECTOR";
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { documents: true },
  });

  const artworks = user?.artistLevel === "PRO"
    ? await prisma.artwork.findMany({
        where: { artistId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { payment: true },
      })
    : [];

  const goodsList = user?.artistLevel === "PRO"
    ? await prisma.goods.findMany({
        where: { artistId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : [];

  const coachingBookings = user?.artistLevel === "AMATEUR"
    ? await prisma.coachingBooking.findMany({
        where: { artistId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { payment: true, instructor: true },
      })
    : [];

  const artistProfile = user?.artistLevel === "PRO"
    ? await prisma.artistProfile.findUnique({
        where: { artistId: session.user.id },
        include: { payment: true },
      })
    : null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { artwork: { include: { artist: true } } },
  });

  const bankInfo = getBankInfo();
  const promoActive = isProfileFeePromoActive();

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pt-40 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="font-[var(--font-serif-kr)] text-3xl">마이페이지</h1>
          <Link href="/mypage/settings" className="text-sm text-ink/60 underline hover:text-ink">
            계정 설정
          </Link>
        </div>
        {isCollector ? (
          <p className="mt-2 text-sm text-ink/70">{session.user.name}님, 컬렉터로 가입되어 있습니다.</p>
        ) : (
          <p className="mt-2 text-sm text-ink/70">{session.user.name}님의 신청 현황입니다.</p>
        )}

        {isCollector ? (
          <div className="mt-10 rounded-sm border border-ink/20 p-6">
            <p className="text-sm text-ink/70">
              관심 있는 작품을 둘러보고, 마음에 드는 작품은 상세 페이지에서 구매 문의를 남겨보세요.
            </p>
            <Link
              href="/artworks"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink hover:underline"
            >
              작품 전체 보기 →
            </Link>
          </div>
        ) : (
        <div className="mt-10 space-y-6">
          {applications.length === 0 && (
            <p className="text-sm text-ink/60">아직 제출한 신청이 없습니다.</p>
          )}
          {applications.map((app) => (
            <div key={app.id} className="rounded-sm border border-ink/20 p-6">
              <div className="flex items-center justify-between">
                <span className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
                  {app.type === "PRO" ? "PRO ARTIST" : "AMATEUR ARTIST"}
                </span>
                <StatusBadge status={app.status} />
              </div>
              <p className="mt-3 text-sm text-ink/70">
                신청일: {formatDateKST(app.createdAt)}
              </p>
              {app.documents.length > 0 && (
                <div className="mt-1 text-sm text-ink/60">
                  <p>첨부 서류 ({app.documents.length}건):</p>
                  <ul className="ml-4 list-disc">
                    {app.documents.map((doc) => (
                      <li key={doc.id}>
                        <a href={`/api/documents/${doc.id}`} className="underline hover:text-ink">
                          {doc.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        )}

        <div className="mt-16">
          <h2 className="font-[var(--font-serif-kr)] text-2xl">찜한 작품</h2>
          {favorites.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">
              아직 찜한 작품이 없습니다. 마음에 드는 작품을 찾으면 하트 아이콘을 눌러 담아보세요.
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {favorites.map((favorite) => (
                <ArtworkCard
                  key={favorite.id}
                  artwork={favorite.artwork}
                  showFavorite
                  isFavorited
                />
              ))}
            </div>
          )}
        </div>

        {user?.artistLevel === "PRO" && (
          <div className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-serif-kr)] text-2xl">내 작품</h2>
              <Link
                href="/mypage/artworks/new"
                className="rounded-full bg-ink px-5 py-2 text-xs tracking-wide text-base"
              >
                + 새 작품 등록
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {artworks.length === 0 && (
                <p className="text-sm text-ink/60">등록한 작품이 없습니다.</p>
              )}
              {artworks.map((artwork) => {
                const settlementBasis = artwork.finalPrice ?? artwork.price;
                const { commission, settlement } = calcSettlement(settlementBasis);
                return (
                  <div key={artwork.id} className="rounded-sm border border-ink/20 p-6">
                    <div className="flex items-center justify-between">
                      <p className="font-[var(--font-serif-kr)] text-lg">{artwork.title}</p>
                      <span className="rounded-full bg-ink/10 px-3 py-1 text-xs">
                        {ARTWORK_STATUS_LABEL[artwork.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink/70">
                      {artwork.status === "SOLD" ? "최종 판매가" : "판매가"} {settlementBasis.toLocaleString()}원
                      {artwork.status === "SOLD" &&
                        ` · 수수료 ${commission.toLocaleString()}원 · 정산액 ${settlement.toLocaleString()}원`}
                    </p>
                    <ArtworkCategoryEditor artworkId={artwork.id} category={artwork.category} />
                    <ArtworkSizeEditor
                      artworkId={artwork.id}
                      widthCm={artwork.widthCm}
                      heightCm={artwork.heightCm}
                    />
                    {artwork.payment && artwork.payment.status !== "CONFIRMED" && (
                      <div className="mt-3">
                        <PaymentNotice
                          paymentId={artwork.payment.id}
                          amount={artwork.payment.amount}
                          status={artwork.payment.status}
                          depositorName={artwork.payment.depositorName}
                          bankName={bankInfo.bankName}
                          accountNumber={bankInfo.accountNumber}
                          accountHolder={bankInfo.accountHolder}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {user?.artistLevel === "PRO" && (
          <div className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-serif-kr)] text-2xl">작가 프로필 노출 서비스</h2>
              {!artistProfile && (
                <Link
                  href="/mypage/profile/new"
                  className="rounded-full bg-terracotta px-5 py-2 text-xs tracking-wide text-base"
                >
                  + 신청하기
                </Link>
              )}
            </div>
            {!artistProfile ? (
              <p className="mt-4 text-sm text-ink/60">
                작품 상세 페이지에 사진·학력·전시경력·수상경력을 노출하는 프리미엄 서비스입니다.{" "}
                {promoActive
                  ? `프로모션가 ${PROFILE_FEE_PROMO.toLocaleString()}원 (정가 ${PROFILE_FEE.toLocaleString()}원)`
                  : `${PROFILE_FEE.toLocaleString()}원`}
                . 아직 신청하지 않으셨습니다.
              </p>
            ) : (
              <div className="mt-4 rounded-sm border border-ink/20 p-6">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      artistProfile.isPublished ? "bg-ink text-base" : "bg-ink/10 text-ink"
                    }`}
                  >
                    {artistProfile.isPublished ? "게시 중" : "입금 대기"}
                  </span>
                </div>
                {artistProfile.payment && artistProfile.payment.status !== "CONFIRMED" && (
                  <div className="mt-3">
                    <PaymentNotice
                      paymentId={artistProfile.payment.id}
                      amount={artistProfile.payment.amount}
                      status={artistProfile.payment.status}
                      depositorName={artistProfile.payment.depositorName}
                      bankName={bankInfo.bankName}
                      accountNumber={bankInfo.accountNumber}
                      accountHolder={bankInfo.accountHolder}
                    />
                  </div>
                )}
                <ArtistProfileEditor
                  profile={{
                    photoUrl: artistProfile.photoUrl,
                    education: artistProfile.education,
                    exhibitions: artistProfile.exhibitions,
                    awards: artistProfile.awards,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {user?.artistLevel === "PRO" && (
          <div className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-serif-kr)] text-2xl">내 굿즈</h2>
              <Link
                href="/mypage/goods/new"
                className="rounded-full bg-ink px-5 py-2 text-xs tracking-wide text-base"
              >
                + 새 굿즈 아이디어 제출
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {goodsList.length === 0 && (
                <p className="text-sm text-ink/60">제출한 굿즈 아이디어가 없습니다.</p>
              )}
              {goodsList.map((goods) => {
                const latestPayment = goods.payments[0] ?? null;
                return (
                  <Link
                    key={goods.id}
                    href={`/mypage/goods/${goods.id}`}
                    className="block rounded-sm border border-ink/20 p-6 hover:border-ink"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-[var(--font-serif-kr)] text-lg">{goods.title}</p>
                      <span className={`rounded-full px-3 py-1 text-xs ${GOODS_STAGE_CLASSES[goods.stage]}`}>
                        {GOODS_STAGE_LABELS[goods.stage]}
                      </span>
                    </div>
                    {latestPayment && latestPayment.status !== "CONFIRMED" && (
                      <p className="mt-2 text-sm text-terracotta">
                        {latestPayment.status === "WAITING" ? "결제 대기 중입니다." : "결제가 반려되었습니다."}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {user?.artistLevel === "AMATEUR" && (
          <div className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-serif-kr)] text-2xl">코칭 예약</h2>
              <Link
                href="/mypage/coaching/new"
                className="rounded-full bg-terracotta px-5 py-2 text-xs tracking-wide text-base"
              >
                + 코칭 예약하기
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {coachingBookings.length === 0 && (
                <p className="text-sm text-ink/60">예약한 코칭이 없습니다.</p>
              )}
              {coachingBookings.map((booking) => (
                <div key={booking.id} className="rounded-sm border border-ink/20 p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-[var(--font-serif-kr)] text-lg">
                      {formatDateTimeKST(booking.preferredDate)}
                    </p>
                    <span className="rounded-full bg-terracotta/15 px-3 py-1 text-xs text-terracotta">
                      {BOOKING_STATUS_LABEL[booking.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink/70">
                    {booking.region && `${booking.region} · `}
                    {booking.instructor?.name && `${booking.instructor.name} 강사 · `}
                    {booking.durationHours}시간
                  </p>
                  <p className="mt-1 text-sm text-ink/70">{booking.curriculum}</p>
                  {booking.payment && booking.payment.status !== "CONFIRMED" && (
                    <div className="mt-3">
                      <PaymentNotice
                        paymentId={booking.payment.id}
                        amount={booking.payment.amount}
                        status={booking.payment.status}
                        depositorName={booking.payment.depositorName}
                        bankName={bankInfo.bankName}
                        accountNumber={bankInfo.accountNumber}
                        accountHolder={bankInfo.accountHolder}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
