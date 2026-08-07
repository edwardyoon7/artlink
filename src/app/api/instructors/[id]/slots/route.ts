import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  JS_DAY_TO_CODE,
  kstDateTimeToUtc,
  utcToKstMinutesSinceMidnight,
  type WeekdayCode,
} from "@/lib/schedule";
import { COACHING_DURATIONS, getCoachingFee } from "@/lib/pricing";

const SLOT_STEP_MINUTES = 30;

// month는 0-indexed (kstDateTimeToUtc 등 이 파일의 다른 호출부와 통일).
function weekdayFromDateParts(year: number, month: number, day: number): WeekdayCode {
  const jsDay = new Date(Date.UTC(year, month, day)).getUTCDay();
  return JS_DAY_TO_CODE[jsDay];
}

// [start, start+duration) 구간이 이미 점유된 구간들과 겹치는지 확인.
function overlapsAny(start: number, duration: number, occupied: { start: number; end: number }[]): boolean {
  const end = start + duration;
  return occupied.some((o) => start < o.end && end > o.start);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date"); // "YYYY-MM-DD" (한국시간 기준 달력 날짜)

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateParam ?? "");
  if (!match) {
    return NextResponse.json({ error: "올바른 날짜 형식이 아닙니다." }, { status: 400 });
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1; // 0-indexed for Date.UTC/kstDateTimeToUtc 호출부와 통일
  const day = Number(match[3]);
  const weekday = weekdayFromDateParts(year, month, day);

  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: { availableDays: { where: { weekday } } },
  });
  if (!instructor) {
    return NextResponse.json({ error: "강사를 찾을 수 없습니다." }, { status: 404 });
  }

  const dayRange = instructor.availableDays[0];
  if (!dayRange || dayRange.startMinute == null || dayRange.endMinute == null) {
    return NextResponse.json({ slots: [] });
  }

  const dayStartUtc = kstDateTimeToUtc(year, month, day, 0);
  const dayEndUtc = kstDateTimeToUtc(year, month, day, 24 * 60);

  const existingBookings = await prisma.coachingBooking.findMany({
    where: {
      instructorId: id,
      status: { not: "CANCELLED" },
      preferredDate: { gte: dayStartUtc, lt: dayEndUtc },
    },
    select: { preferredDate: true, durationHours: true },
  });
  const occupied = existingBookings.map((b) => {
    const start = utcToKstMinutesSinceMidnight(b.preferredDate);
    return { start, end: start + b.durationHours * 60 };
  });

  const slots: { startMinute: number; endMinute: number; durationHours: number; fee: number; startAt: string }[] = [];
  for (const durationHours of COACHING_DURATIONS) {
    const durationMinutes = durationHours * 60;
    for (
      let start = dayRange.startMinute;
      start + durationMinutes <= dayRange.endMinute;
      start += SLOT_STEP_MINUTES
    ) {
      if (overlapsAny(start, durationMinutes, occupied)) continue;
      slots.push({
        startMinute: start,
        endMinute: start + durationMinutes,
        durationHours,
        fee: getCoachingFee(durationHours),
        startAt: kstDateTimeToUtc(year, month, day, start).toISOString(),
      });
    }
  }
  slots.sort((a, b) => a.startMinute - b.startMinute || a.durationHours - b.durationHours);

  return NextResponse.json({ slots });
}
