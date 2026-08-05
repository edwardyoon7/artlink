import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// public/ 밖에 두는 이유는 src/app/api/artworks/route.ts의 IMAGE_ROOT 주석 참고
const SAMPLE_ROOT = path.join(process.cwd(), "runtime-uploads", "goods-samples");
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const goods = await prisma.goods.findUnique({ where: { id } });
  if (!goods) {
    return NextResponse.json({ error: "굿즈를 찾을 수 없습니다." }, { status: 404 });
  }
  if (goods.stage !== "SAMPLE_REVIEW") {
    return NextResponse.json({ error: "샘플 검토 단계에서만 업로드할 수 있습니다." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "파일을 선택해주세요." }, { status: 400 });
  }
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "이미지 또는 영상 파일만 업로드할 수 있습니다." }, { status: 400 });
  }
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "이미지 크기는 10MB를 넘을 수 없습니다." }, { status: 400 });
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: "영상 크기는 50MB를 넘을 수 없습니다." }, { status: 400 });
  }

  await mkdir(SAMPLE_ROOT, { recursive: true });
  const safeName = path.basename(file.name).replace(/[^\w.\-가-힣 ]/g, "_");
  const fileName = `${goods.id}-${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(SAMPLE_ROOT, fileName), buffer);

  const updated = await prisma.goods.update({
    where: { id },
    data: { sampleImageUrl: `/goods-samples/${fileName}` },
  });

  return NextResponse.json({ ok: true, goods: updated });
}
