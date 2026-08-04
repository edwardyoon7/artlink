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
  const body = await request.json().catch(() => ({}));
  const { title, content, isActive } = body;

  const data: { title?: string; content?: string; isActive?: boolean } = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
    }
    data.title = title.trim();
  }
  if (content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }
    data.content = content.trim();
  }
  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "잘못된 값입니다." }, { status: 400 });
    }
    data.isActive = isActive;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 내용이 없습니다." }, { status: 400 });
  }

  const announcement = await prisma.announcement.update({ where: { id }, data });

  return NextResponse.json({ ok: true, announcement });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  await prisma.announcement.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
