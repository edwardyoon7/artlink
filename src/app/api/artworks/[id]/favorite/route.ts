import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const artwork = await prisma.artwork.findUnique({ where: { id } });
  if (!artwork || (artwork.status !== "LISTED" && artwork.status !== "SOLD")) {
    return NextResponse.json({ error: "작품을 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.favorite.upsert({
    where: { userId_artworkId: { userId: session.user.id, artworkId: id } },
    create: { userId: session.user.id, artworkId: id },
    update: {},
  });

  return NextResponse.json({ ok: true, favorited: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.favorite.deleteMany({ where: { userId: session.user.id, artworkId: id } });

  return NextResponse.json({ ok: true, favorited: false });
}
