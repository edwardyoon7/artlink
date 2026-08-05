import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProfileFee } from "@/lib/pricing";

const PHOTO_ROOT = path.join(process.cwd(), "public", "profile-uploads");
const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB

async function savePhoto(profileId: string, file: File) {
  await mkdir(PHOTO_ROOT, { recursive: true });
  const safeName = path.basename(file.name).replace(/[^\w.\-가-힣 ]/g, "_");
  const fileName = `${profileId}-${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(PHOTO_ROOT, fileName), buffer);
  return `/profile-uploads/${fileName}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "PRO") {
    return NextResponse.json({ error: "승인된 프로 작가만 신청할 수 있습니다." }, { status: 403 });
  }

  const existing = await prisma.artistProfile.findUnique({ where: { artistId: user.id } });
  if (existing) {
    return NextResponse.json({ error: "이미 프로필 서비스를 신청하셨습니다." }, { status: 409 });
  }

  const formData = await request.formData();
  const photo = formData.get("photo");
  const education = formData.get("education");
  const exhibitions = formData.get("exhibitions");
  const awards = formData.get("awards");

  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;
  if (!photoFile) {
    return NextResponse.json({ error: "증명사진(2x2)을 업로드해주세요." }, { status: 400 });
  }
  if (!photoFile.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  }
  if (photoFile.size > MAX_PHOTO_SIZE) {
    return NextResponse.json({ error: "이미지 크기는 10MB를 넘을 수 없습니다." }, { status: 400 });
  }

  const amount = getProfileFee();

  const profile = await prisma.artistProfile.create({
    data: {
      artistId: user.id,
      education: typeof education === "string" && education.trim() ? education.trim() : null,
      exhibitions: typeof exhibitions === "string" && exhibitions.trim() ? exhibitions.trim() : null,
      awards: typeof awards === "string" && awards.trim() ? awards.trim() : null,
      payment: {
        create: { type: "PROFILE_FEE", amount },
      },
    },
    include: { payment: true },
  });

  const photoUrl = await savePhoto(profile.id, photoFile);
  const updated = await prisma.artistProfile.update({
    where: { id: profile.id },
    data: { photoUrl },
    include: { payment: true },
  });

  return NextResponse.json({ ok: true, profile: updated });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const profile = await prisma.artistProfile.findUnique({ where: { artistId: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "신청된 프로필이 없습니다." }, { status: 404 });
  }

  const formData = await request.formData();
  const photo = formData.get("photo");
  const education = formData.get("education");
  const exhibitions = formData.get("exhibitions");
  const awards = formData.get("awards");

  const data: {
    education?: string | null;
    exhibitions?: string | null;
    awards?: string | null;
    photoUrl?: string;
  } = {};

  if (typeof education === "string") data.education = education.trim() || null;
  if (typeof exhibitions === "string") data.exhibitions = exhibitions.trim() || null;
  if (typeof awards === "string") data.awards = awards.trim() || null;

  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;
  if (photoFile) {
    if (!photoFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
    }
    if (photoFile.size > MAX_PHOTO_SIZE) {
      return NextResponse.json({ error: "이미지 크기는 10MB를 넘을 수 없습니다." }, { status: 400 });
    }
    data.photoUrl = await savePhoto(profile.id, photoFile);
  }

  const updated = await prisma.artistProfile.update({
    where: { id: profile.id },
    data,
  });

  return NextResponse.json({ ok: true, profile: updated });
}
