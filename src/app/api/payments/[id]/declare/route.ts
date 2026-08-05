import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { artwork: true, coachingBooking: true, goods: true, artistProfile: true },
  });
  if (!payment) {
    return NextResponse.json({ error: "결제 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const ownerId =
    payment.artwork?.artistId ??
    payment.coachingBooking?.artistId ??
    payment.goods?.artistId ??
    payment.artistProfile?.artistId;
  if (ownerId !== session.user.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  const depositorName = body?.depositorName;
  if (typeof depositorName !== "string" || !depositorName.trim()) {
    return NextResponse.json({ error: "입금자명을 입력해주세요." }, { status: 400 });
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: { depositorName },
  });

  return NextResponse.json({ ok: true, payment: updated });
}
