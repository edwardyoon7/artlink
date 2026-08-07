import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PAYMENT_TYPE_TO_NEXT_STAGE } from "@/lib/goods";

const VALID_STATUSES = ["CONFIRMED", "REJECTED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = body?.status;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "잘못된 상태 값입니다." }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { id },
    data: { status, confirmedAt: status === "CONFIRMED" ? new Date() : null },
  });

  if (status === "CONFIRMED") {
    if (payment.artworkId) {
      await prisma.artwork.update({
        where: { id: payment.artworkId },
        data: { status: "LISTED" },
      });
    }
    if (payment.coachingBookingId) {
      // 입금 확인만으로 바로 최종 확정하지 않는다 — 관리자가 강사에게 해당 시간 가능 여부를
      // 재확인한 뒤 /api/coaching-bookings/[id]/confirm으로 별도 최종 확정해야 CONFIRMED가 됨.
      await prisma.coachingBooking.update({
        where: { id: payment.coachingBookingId },
        data: { status: "PAYMENT_CONFIRMED" },
      });
    }
    if (payment.goodsId) {
      const nextStage = PAYMENT_TYPE_TO_NEXT_STAGE[payment.type];
      if (nextStage) {
        await prisma.goods.update({
          where: { id: payment.goodsId },
          data: { stage: nextStage },
        });
      }
    }
    if (payment.artistProfileId) {
      await prisma.artistProfile.update({
        where: { id: payment.artistProfileId },
        data: { isPublished: true },
      });
    }
  }

  return NextResponse.json({ ok: true, payment });
}
