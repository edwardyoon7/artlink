import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "RECEIVED", "APPROVED", "REJECTED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = body?.status;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "잘못된 상태 값입니다." }, { status: 400 });
  }

  const application = await prisma.application.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: application.userId },
      data: { artistLevel: application.type },
    });
  }

  return NextResponse.json({ ok: true, application });
}
