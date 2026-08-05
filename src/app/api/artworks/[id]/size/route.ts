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
  const body = await request.json().catch(() => ({}));
  const widthCm = Number(body?.widthCm);
  const heightCm = Number(body?.heightCm);

  if (!Number.isFinite(widthCm) || widthCm <= 0 || widthCm > 1000) {
    return NextResponse.json({ error: "올바른 가로 크기(cm)를 입력해주세요." }, { status: 400 });
  }
  if (!Number.isFinite(heightCm) || heightCm <= 0 || heightCm > 1000) {
    return NextResponse.json({ error: "올바른 세로 크기(cm)를 입력해주세요." }, { status: 400 });
  }

  const artwork = await prisma.artwork.findUnique({ where: { id } });
  if (!artwork || artwork.artistId !== session.user.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const updated = await prisma.artwork.update({
    where: { id },
    data: { widthCm, heightCm },
  });

  return NextResponse.json({ ok: true, artwork: updated });
}
