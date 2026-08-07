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

  // /api/instructors/[id]/slots가 GET 시점에 이미 걸러주지만, 그 사이 다른 사람이 같은
  // 시간대를 먼저 예약해버리는 경합(race condition)을 막기 위해 제출 시점에 한 번 더 확인.
  const requestedEnd = new Date(parsedDate.getTime() + durationHours * 60 * 60 * 1000);
  const conflicting = await prisma.coachingBooking.findMany({
    where: {
      instructorId,
      status: { not: "CANCELLED" },
      preferredDate: { lt: requestedEnd },
    },
    select: { preferredDate: true, durationHours: true },
  });
  const hasConflict = conflicting.some((b) => {
    const bEnd = new Date(b.preferredDate.getTime() + b.durationHours * 60 * 60 * 1000);
    return parsedDate < bEnd && requestedEnd > b.preferredDate;
  });
  if (hasConflict) {
    return NextResponse.json(
      { error: "방금 다른 신청자가 선택한 시간대입니다. 다른 시간을 선택해주세요." },
      { status: 409 },
    );
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
