import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCoachingFee, isCoachingDurationHours } from "@/lib/pricing";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "AMATEUR") {
    return NextResponse.json({ error: "승인된 아마추어 작가만 코칭을 예약할 수 있습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { curriculum, preferredDate, region, instructorId, durationHours } = body;

  if (typeof curriculum !== "string" || !curriculum.trim()) {
    return NextResponse.json({ error: "희망 커리큘럼을 입력해주세요." }, { status: 400 });
  }
  const parsedDate = new Date(preferredDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "올바른 희망 일시를 선택해주세요." }, { status: 400 });
  }
  if (typeof region !== "string" || !region.trim()) {
    return NextResponse.json({ error: "방문 가능 지역을 선택해주세요." }, { status: 400 });
  }
  if (typeof instructorId !== "string" || !instructorId.trim()) {
    return NextResponse.json({ error: "강사를 선택해주세요." }, { status: 400 });
  }
  if (!isCoachingDurationHours(durationHours)) {
    return NextResponse.json({ error: "코칭 시간(2시간/4시간)을 선택해주세요." }, { status: 400 });
  }

  const instructor = await prisma.instructor.findUnique({
    where: { id: instructorId },
    include: { regions: true },
  });
  if (!instructor || !instructor.regions.some((r) => r.region === region)) {
    return NextResponse.json({ error: "선택한 지역을 담당하는 강사가 아닙니다." }, { status: 400 });
  }

  const booking = await prisma.coachingBooking.create({
    data: {
      curriculum,
      region,
      preferredDate: parsedDate,
      durationHours,
      artistId: user.id,
      instructorId,
      payment: {
        create: {
          type: "COACHING_FEE",
          amount: getCoachingFee(durationHours),
        },
      },
    },
    include: { payment: true },
  });

  return NextResponse.json({ ok: true, booking });
}
