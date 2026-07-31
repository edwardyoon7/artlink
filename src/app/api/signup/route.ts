import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, password } = body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof phone !== "string" || !phone.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof password !== "string" || password.length < 8
  ) {
    return NextResponse.json(
      { error: "성함, 전화번호, 이메일, 8자 이상의 비밀번호를 모두 입력해주세요." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "이미 가입된 이메일입니다. 로그인해주세요." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "COLLECTOR" },
  });

  return NextResponse.json({ ok: true });
}
