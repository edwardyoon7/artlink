import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { InstructorForm } from "@/components/instructor-form";
import { WEEKDAY_LABEL } from "@/lib/schedule";

export default async function AdminInstructorsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const instructors = await prisma.instructor.findMany({
    include: { regions: true, availableDays: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">강사 관리</h1>
        <p className="mt-2 text-sm text-ink/70">
          아마추어 작가가 코칭 예약 시 지역별로 노출되는 강사 목록입니다.
        </p>

        <div className="mt-10 space-y-4">
          {instructors.length === 0 && (
            <p className="text-sm text-ink/60">등록된 강사가 없습니다.</p>
          )}
          {instructors.map((instructor) => (
            <div key={instructor.id} className="rounded-sm border border-ink/20 p-6">
              <p className="font-[var(--font-serif-kr)] text-lg">{instructor.name}</p>
              <p className="mt-2 text-sm text-ink/70">
                담당 지역: {instructor.regions.map((r) => r.region).join(", ")}
              </p>
              <p className="text-sm text-ink/70">
                가능 요일: {instructor.availableDays.map((d) => WEEKDAY_LABEL[d.weekday]).join(", ")}
              </p>
              {instructor.education && <p className="mt-1 text-sm text-ink/60">학력: {instructor.education}</p>}
              {instructor.exhibitions && <p className="text-sm text-ink/60">전시: {instructor.exhibitions}</p>}
              {instructor.awards && <p className="text-sm text-ink/60">수상경력: {instructor.awards}</p>}
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-[var(--font-serif-kr)] text-2xl">새 강사 등록</h2>
          <InstructorForm />
        </div>
      </section>
    </div>
  );
}
