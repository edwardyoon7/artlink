import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WEEKDAYS, type WeekdayCode } from "@/lib/schedule";
import { REGIONS } from "@/lib/regions";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");

  const instructors = await prisma.instructor.findMany({
    where: region ? { regions: { some: { region } } } : undefined,
    include: { regions: true, availableDays: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ instructors });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { name, education, exhibitions, awards, regions, weekdays } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "강사명을 입력해주세요." }, { status: 400 });
  }
  const regionList: string[] = Array.isArray(regions)
    ? regions.filter((r): r is string => REGIONS.includes(r))
    : [];
  const weekdayList: WeekdayCode[] = Array.isArray(weekdays)
    ? weekdays.filter((w): w is WeekdayCode => WEEKDAYS.includes(w))
    : [];
  if (regionList.length === 0) {
    return NextResponse.json({ error: "담당 지역을 하나 이상 선택해주세요." }, { status: 400 });
  }
  if (weekdayList.length === 0) {
    return NextResponse.json({ error: "가능 요일을 하나 이상 선택해주세요." }, { status: 400 });
  }

  const instructor = await prisma.instructor.create({
    data: {
      name,
      education: typeof education === "string" ? education : null,
      exhibitions: typeof exhibitions === "string" ? exhibitions : null,
      awards: typeof awards === "string" ? awards : null,
      regions: { create: regionList.map((region) => ({ region })) },
      availableDays: { create: weekdayList.map((weekday) => ({ weekday })) },
    },
    include: { regions: true, availableDays: true },
  });

  return NextResponse.json({ ok: true, instructor });
}
