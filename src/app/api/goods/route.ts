import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "PRO") {
    return NextResponse.json({ error: "승인된 프로 작가만 굿즈 컨설팅을 신청할 수 있습니다." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, concept, targetAudience } = body;

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "굿즈 아이디어 제목을 입력해주세요." }, { status: 400 });
  }
  if (typeof concept !== "string" || !concept.trim()) {
    return NextResponse.json({ error: "아이디어 설명을 입력해주세요." }, { status: 400 });
  }

  const goods = await prisma.goods.create({
    data: {
      title,
      concept,
      targetAudience: typeof targetAudience === "string" && targetAudience.trim() ? targetAudience : null,
      artistId: user.id,
    },
  });

  return NextResponse.json({ ok: true, goods });
}
