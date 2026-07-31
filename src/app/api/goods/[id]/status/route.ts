import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TOGGLEABLE_STAGES = ["LISTED", "SOLD_OUT"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const nextStage = body.stage;
  if (!TOGGLEABLE_STAGES.includes(nextStage)) {
    return NextResponse.json({ error: "허용되지 않은 상태입니다." }, { status: 400 });
  }

  const goods = await prisma.goods.findUnique({ where: { id } });
  if (!goods) {
    return NextResponse.json({ error: "굿즈를 찾을 수 없습니다." }, { status: 404 });
  }
  if (!TOGGLEABLE_STAGES.includes(goods.stage as (typeof TOGGLEABLE_STAGES)[number])) {
    return NextResponse.json({ error: "공개(발행) 이전에는 상태를 전환할 수 없습니다." }, { status: 400 });
  }

  const updated = await prisma.goods.update({ where: { id }, data: { stage: nextStage } });
  return NextResponse.json({ ok: true, goods: updated });
}
