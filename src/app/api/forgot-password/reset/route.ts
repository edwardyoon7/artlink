import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, answer, newPassword } = body;

  if (
    typeof email !== "string" || !email.trim() ||
    typeof answer !== "string" || !answer.trim() ||
    typeof newPassword !== "string" || newPassword.length < 8
  ) {
    return NextResponse.json(
      { error: "이메일, 답변, 8자 이상의 새 비밀번호를 모두 입력해주세요." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (!user || !user.passwordHintQuestion || !user.passwordHintAnswerHash) {
    return NextResponse.json(
      { error: "계정을 찾을 수 없거나 비밀번호 힌트가 등록되어 있지 않습니다." },
      { status: 404 },
    );
  }

  const valid = await bcrypt.compare(answer.trim().toLowerCase(), user.passwordHintAnswerHash);
  if (!valid) {
    return NextResponse.json({ error: "답변이 일치하지 않습니다." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
