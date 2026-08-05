import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { AdminPaymentRow } from "@/components/admin-payment-row";
import { GOODS_FEE_TYPE_LABELS } from "@/lib/goods";

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      artwork: { include: { artist: true } },
      coachingBooking: { include: { artist: true, instructor: true } },
      goods: { include: { artist: true } },
      artistProfile: { include: { artist: true } },
    },
  });

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">입금 확인</h1>
        <p className="mt-2 text-sm text-ink/70">
          작가가 입금자명을 등록하면 실제 입금 내역과 대조한 뒤 확인 처리해주세요.
        </p>

        <div className="mt-10 space-y-4">
          {payments.length === 0 && <p className="text-sm text-ink/60">결제 내역이 없습니다.</p>}
          {payments.map((payment) => {
            const artist =
              payment.artwork?.artist ??
              payment.coachingBooking?.artist ??
              payment.goods?.artist ??
              payment.artistProfile?.artist;
            const booking = payment.coachingBooking;
            const kind = payment.artwork
              ? "작품 위탁판매 등록비"
              : booking
              ? "코칭 예약"
              : payment.goods
              ? (GOODS_FEE_TYPE_LABELS[payment.type] ?? "굿즈")
              : payment.artistProfile
              ? "작가 프로필 노출 서비스"
              : "알 수 없음";
            return (
              <AdminPaymentRow
                key={payment.id}
                payment={{
                  id: payment.id,
                  kind,
                  artistName: artist?.name ?? "알 수 없음",
                  amount: payment.amount,
                  status: payment.status,
                  depositorName: payment.depositorName,
                  createdAt: payment.createdAt.toLocaleString("ko-KR"),
                  artworkTitle: payment.artwork?.title ?? null,
                  artworkPrice: payment.artwork?.price ?? null,
                  region: booking?.region ?? null,
                  instructorName: booking?.instructor?.name ?? null,
                  preferredDate: booking?.preferredDate.toLocaleString("ko-KR") ?? null,
                  curriculum: booking?.curriculum ?? null,
                  goodsTitle: payment.goods?.title ?? null,
                }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
