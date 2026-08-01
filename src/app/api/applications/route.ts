import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const formData = await request.formData();

  const type = formData.get("type");
  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const password = formData.get("password");
  const passwordHintQuestion = formData.get("passwordHintQuestion");
  const passwordHintAnswer = formData.get("passwordHintAnswer");
  const education = formData.get("education");
  const career = formData.get("career");
  const exhibitionCountRaw = formData.get("exhibitionCount");
  const motivation = formData.get("motivation");
  const files = formData.getAll("documents").filter((f): f is File => f instanceof File && f.size > 0);

  if (type !== "PRO" && type !== "AMATEUR") {
    return NextResponse.json({ error: "잘못된 신청 유형입니다." }, { status: 400 });
  }
  if (
    typeof name !== "string" || !name.trim() ||
    typeof phone !== "string" || !phone.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof password !== "string" || password.length < 8 ||
    typeof passwordHintQuestion !== "string" || !passwordHintQuestion.trim() ||
    typeof passwordHintAnswer !== "string" || !passwordHintAnswer.trim()
  ) {
    return NextResponse.json(
      { error: "성함, 전화번호, 이메일, 8자 이상의 비밀번호, 비밀번호 힌트 질문·답변을 모두 입력해주세요." },
      { status: 400 },
    );
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `증빙서류는 최대 ${MAX_FILES}개까지 첨부할 수 있습니다.` }, { status: 400 });
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `파일 크기는 10MB를 넘을 수 없습니다: ${file.name}` }, { status: 400 });
    }
  }

  let exhibitionCount: number | null = null;
  if (type === "PRO") {
    const parsed = Number(exhibitionCountRaw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return NextResponse.json({ error: "전시 횟수를 0 이상의 숫자로 입력해주세요." }, { status: 400 });
    }
    exhibitionCount = Math.round(parsed);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  let userId: string;

  if (existingUser) {
    const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다. 기존 비밀번호로 다시 시도하거나 로그인 후 신청해주세요." },
        { status: 409 },
      );
    }
    userId = existingUser.id;
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    const passwordHintAnswerHash = await bcrypt.hash(
      (passwordHintAnswer as string).trim().toLowerCase(),
      10,
    );
    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        passwordHash,
        passwordHintQuestion: (passwordHintQuestion as string).trim(),
        passwordHintAnswerHash,
      },
    });
    userId = newUser.id;
  }

  const application = await prisma.application.create({
    data: {
      type,
      name,
      phone,
      email,
      education: typeof education === "string" ? education : null,
      career: typeof career === "string" ? career : null,
      exhibitionCount,
      motivation: typeof motivation === "string" ? motivation : null,
      userId,
    },
  });

  if (files.length > 0) {
    const appDir = path.join(UPLOAD_ROOT, application.id);
    await mkdir(appDir, { recursive: true });

    for (const file of files) {
      const safeName = path.basename(file.name).replace(/[^\w.\-가-힣 ]/g, "_");
      const storedPath = path.join(appDir, `${Date.now()}-${safeName}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(storedPath, buffer);

      await prisma.document.create({
        data: {
          filename: safeName,
          storedPath,
          applicationId: application.id,
        },
      });
    }
  }

  return NextResponse.json({ ok: true, applicationId: application.id });
}
