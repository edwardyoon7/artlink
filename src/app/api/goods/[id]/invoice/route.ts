import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NEXT_INVOICE_TYPE } from "@/lib/goods";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const goods = await prisma.goods.findUnique({ where: { id } });
  if (!goods) {
    return NextResponse.json({ error: "굿즈를 찾을 수 없습니다." }, { status: 404 });
  }

  const expectedType = NEXT_INVOICE_TYPE[goods.stage];
  if (!expectedType) {
    return NextResponse.json({ error: "현재 단계에서는 청구할 수 없습니다." }, { status: 400 });
  }

  const existingWaiting = await prisma.payment.findFirst({
    where: { goodsId: id, type: expectedType, status: "WAITING" },
  });
  if (existingWaiting) {
    return NextResponse.json({ error: "이미 청구되어 입금 확인 대기 중인 결제가 있습니다." }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const amountNumber = Number(body.amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return NextResponse.json({ error: "올바른 금액을 입력해주세요." }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      type: expectedType,
      amount: Math.round(amountNumber),
      goodsId: id,
    },
  });

  return NextResponse.json({ ok: true, payment });
}
