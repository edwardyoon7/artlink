import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const IMAGE_ROOT = path.join(process.cwd(), "public", "goods");
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const goods = await prisma.goods.findUnique({ where: { id } });
  if (!goods) {
    return NextResponse.json({ error: "굿즈를 찾을 수 없습니다." }, { status: 404 });
  }
  if (goods.artistId !== session.user.id) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  if (goods.stage !== "APPROVED") {
    return NextResponse.json({ error: "샘플 승인 이후에만 공개할 수 있습니다." }, { status: 400 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const price = formData.get("price");
  const image = formData.get("image");

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "상품명을 입력해주세요." }, { status: 400 });
  }
  const priceNumber = Number(price);
  if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
    return NextResponse.json({ error: "올바른 가격을 입력해주세요." }, { status: 400 });
  }
  const imageFile = image instanceof File && image.size > 0 ? image : null;
  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
    }
    if (imageFile.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "이미지 크기는 10MB를 넘을 수 없습니다." }, { status: 400 });
    }
  }

  let imageUrl: string | undefined;
  if (imageFile) {
    await mkdir(IMAGE_ROOT, { recursive: true });
    const safeName = path.basename(imageFile.name).replace(/[^\w.\-가-힣 ]/g, "_");
    const fileName = `${goods.id}-${safeName}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(path.join(IMAGE_ROOT, fileName), buffer);
    imageUrl = `/goods/${fileName}`;
  }

  const updated = await prisma.goods.update({
    where: { id },
    data: {
      title,
      description: typeof description === "string" && description.trim() ? description : null,
      price: Math.round(priceNumber),
      ...(imageUrl ? { imageUrl } : {}),
      stage: "LISTED",
    },
  });

  return NextResponse.json({ ok: true, goods: updated });
}
