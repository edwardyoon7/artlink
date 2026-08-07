import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 관리자가 입금 확인 이후 강사에게 해당 시간이 실제로 가능한지 재확인을 마치고 누르는
// "최종 확정" 액션. PAYMENT_CONFIRMED 상태일 때만 허용 — 아직 입금 확인 전(PENDING)이거나
// 이미 확정/취소된 건에는 쓸 수 없다.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const booking = await prisma.coachingBooking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });
  }
  if (booking.status !== "PAYMENT_CONFIRMED") {
    return NextResponse.json(
      { error: "입금 확인이 먼저 완료되어야 최종 확정할 수 있습니다." },
      { status: 400 },
    );
  }

  const updated = await prisma.coachingBooking.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });

  return NextResponse.json({ ok: true, booking: updated });
}
