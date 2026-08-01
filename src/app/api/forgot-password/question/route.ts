import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email;

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "이메일을 입력해주세요." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (!user || !user.passwordHintQuestion || !user.passwordHintAnswerHash) {
    return NextResponse.json(
      { error: "계정을 찾을 수 없거나 비밀번호 힌트가 등록되어 있지 않습니다. 관리자에게 문의해주세요." },
      { status: 404 },
    );
  }

  return NextResponse.json({ question: user.passwordHintQuestion });
}
