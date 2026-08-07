import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WEEKDAYS, timeStringToMinutes, type WeekdayCode } from "@/lib/schedule";
import { REGIONS } from "@/lib/regions";

type WeekdayRangeInput = { weekday: WeekdayCode; startTime: string; endTime: string };

function parseWeekdayRanges(weekdays: unknown): { weekday: WeekdayCode; startMinute: number; endMinute: number }[] {
  if (!Array.isArray(weekdays)) {
    throw new Error("가능 요일을 하나 이상 선택해주세요.");
  }
  const parsed = weekdays.map((entry: WeekdayRangeInput) => {
    if (!WEEKDAYS.includes(entry?.weekday)) {
      throw new Error("잘못된 요일 값입니다.");
    }
    const startMinute = timeStringToMinutes(entry.startTime);
    const endMinute = timeStringToMinutes(entry.endTime);
    if (startMinute == null || endMinute == null) {
      throw new Error("시작~종료 시간을 올바르게 입력해주세요.");
    }
    if (startMinute >= endMinute) {
      throw new Error(`${entry.weekday} 요일의 종료 시간은 시작 시간보다 늦어야 합니다.`);
    }
    return { weekday: entry.weekday, startMinute, endMinute };
  });
  if (parsed.length === 0) {
    throw new Error("가능 요일을 하나 이상 선택해주세요.");
  }
  return parsed;
}

// 강사 정보(이메일·학력·전시·수상경력·담당지역·가능 요일 시간대)를 전체 교체 방식으로 수정한다.
// InstructorAvailability는 항상 기존 것을 지우고 다시 만든다 — 부분 수정(특정 요일만 변경)보다
// 폼 전체를 다시 제출하는 방식이 훨씬 단순하고, 강사 수가 적어 성능상 문제도 없다.
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
  const { name, email, education, exhibitions, awards, regions, weekdays } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "강사명을 입력해주세요." }, { status: 400 });
  }
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "이메일을 입력해주세요." }, { status: 400 });
  }
  const regionList: string[] = Array.isArray(regions)
    ? regions.filter((r): r is string => REGIONS.includes(r))
    : [];
  if (regionList.length === 0) {
    return NextResponse.json({ error: "담당 지역을 하나 이상 선택해주세요." }, { status: 400 });
  }

  let weekdayRanges;
  try {
    weekdayRanges = parseWeekdayRanges(weekdays);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const existing = await prisma.instructor.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "강사를 찾을 수 없습니다." }, { status: 404 });
  }

  const instructor = await prisma.$transaction(async (tx) => {
    await tx.instructorRegion.deleteMany({ where: { instructorId: id } });
    await tx.instructorAvailability.deleteMany({ where: { instructorId: id } });
    return tx.instructor.update({
      where: { id },
      data: {
        name,
        email: email.trim(),
        education: typeof education === "string" ? education : null,
        exhibitions: typeof exhibitions === "string" ? exhibitions : null,
        awards: typeof awards === "string" ? awards : null,
        regions: { create: regionList.map((region) => ({ region })) },
        availableDays: { create: weekdayRanges },
      },
      include: { regions: true, availableDays: true },
    });
  });

  return NextResponse.json({ ok: true, instructor });
}
