import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LISTING_FEE } from "@/lib/pricing";
import { SELECTABLE_ARTWORK_CATEGORIES } from "@/lib/artwork-category";
import type { ArtworkCategory } from "@/generated/prisma/client";

const IMAGE_ROOT = path.join(process.cwd(), "public", "artwork-uploads");
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "PRO") {
    return NextResponse.json({ error: "승인된 프로 작가만 작품을 등록할 수 있습니다." }, { status: 403 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const caption = formData.get("caption");
  const description = formData.get("description");
  const price = formData.get("price");
  const category = formData.get("category");
  const image = formData.get("image");
  const editionNumber = formData.get("editionNumber");

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "작품명을 입력해주세요." }, { status: 400 });
  }
  const priceNumber = Number(price);
  if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
    return NextResponse.json({ error: "올바른 가격을 입력해주세요." }, { status: 400 });
  }
  if (
    typeof category !== "string" ||
    !SELECTABLE_ARTWORK_CATEGORIES.includes(category as ArtworkCategory)
  ) {
    return NextResponse.json({ error: "작품 구분을 선택해주세요." }, { status: 400 });
  }
  const imageFile = image instanceof File && image.size > 0 ? image : null;
  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
    }
    if (imageFile.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "이미지 크기는 50MB를 넘을 수 없습니다." }, { status: 400 });
    }
  }

  const artwork = await prisma.artwork.create({
    data: {
      title,
      caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
      description: typeof description === "string" ? description : null,
      price: Math.round(priceNumber),
      category: category as ArtworkCategory,
      editionNumber:
        typeof editionNumber === "string" && editionNumber.trim() ? editionNumber.trim() : null,
      artistId: user.id,
      payment: {
        create: {
          type: "LISTING_FEE",
          amount: LISTING_FEE,
        },
      },
    },
    include: { payment: true },
  });

  let finalArtwork = artwork;
  if (imageFile) {
    await mkdir(IMAGE_ROOT, { recursive: true });
    const safeName = path.basename(imageFile.name).replace(/[^\w.\-가-힣 ]/g, "_");
    const fileName = `${artwork.id}-${safeName}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(path.join(IMAGE_ROOT, fileName), buffer);

    finalArtwork = await prisma.artwork.update({
      where: { id: artwork.id },
      data: { imageUrl: `/artwork-uploads/${fileName}` },
      include: { payment: true },
    });
  }

  return NextResponse.json({ ok: true, artwork: finalArtwork });
}
