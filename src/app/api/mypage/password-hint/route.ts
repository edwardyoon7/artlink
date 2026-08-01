import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const { question, answer } = body;

  if (
    typeof question !== "string" || !question.trim() ||
    typeof answer !== "string" || !answer.trim()
  ) {
    return NextResponse.json({ error: "힌트 질문과 답변을 모두 입력해주세요." }, { status: 400 });
  }

  const passwordHintAnswerHash = await bcrypt.hash(answer.trim().toLowerCase(), 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHintQuestion: question.trim(), passwordHintAnswerHash },
  });

  return NextResponse.json({ ok: true });
}
