import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
  if (body?.status !== "SOLD") {
    return NextResponse.json({ error: "잘못된 상태 값입니다." }, { status: 400 });
  }

  const artwork = await prisma.artwork.update({
    where: { id },
    data: { status: "SOLD" },
  });

  return NextResponse.json({ ok: true, artwork });
}
