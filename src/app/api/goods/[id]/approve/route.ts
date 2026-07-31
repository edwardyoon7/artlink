import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const goods = await prisma.goods.findUnique({ where: { id } });
  if (!goods) {
    return NextResponse.json({ error: "굿즈를 찾을 수 없습니다." }, { status: 404 });
  }
  if (goods.artistId !== session.user.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  if (goods.stage !== "SAMPLE_REVIEW") {
    return NextResponse.json({ error: "현재 단계에서는 승인할 수 없습니다." }, { status: 400 });
  }

  const updated = await prisma.goods.update({ where: { id }, data: { stage: "APPROVED" } });
  return NextResponse.json({ ok: true, goods: updated });
}
