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
      await prisma.coachingBooking.update({
        where: { id: payment.coachingBookingId },
        data: { status: "CONFIRMED" },
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
  }

  return NextResponse.json({ ok: true, payment });
}
