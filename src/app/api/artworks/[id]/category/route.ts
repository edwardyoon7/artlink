import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SELECTABLE_ARTWORK_CATEGORIES } from "@/lib/artwork-category";
import type { ArtworkCategory } from "@/generated/prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const category = body?.category;
  if (
    typeof category !== "string" ||
    !SELECTABLE_ARTWORK_CATEGORIES.includes(category as ArtworkCategory)
  ) {
    return NextResponse.json({ error: "올바른 구분을 선택해주세요." }, { status: 400 });
  }

  const artwork = await prisma.artwork.findUnique({ where: { id } });
  if (!artwork || artwork.artistId !== session.user.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const updated = await prisma.artwork.update({
    where: { id },
    data: { category: category as ArtworkCategory },
  });

  return NextResponse.json({ ok: true, artwork: updated });
}
