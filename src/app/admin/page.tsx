import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { AdminApplicationRow } from "@/components/admin-application-row";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { documents: true },
  });

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-40 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="font-[var(--font-serif-kr)] text-3xl">신청 접수 관리</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/dashboard" className="underline hover:text-ink">
              대시보드
            </Link>
            <Link href="/admin/payments" className="underline hover:text-ink">
              입금 확인
            </Link>
            <Link href="/admin/artworks" className="underline hover:text-ink">
              작품 관리
            </Link>
            <Link href="/admin/goods" className="underline hover:text-ink">
              굿즈 관리
            </Link>
            <Link href="/admin/instructors" className="underline hover:text-ink">
              강사 관리
            </Link>
            <Link href="/admin/announcements" className="underline hover:text-ink">
              공지사항 관리
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-ink/70">
          접수 확인 후 상태를 변경하면 신청자가 마이페이지에서 즉시 확인할 수 있습니다.
        </p>

        <div className="mt-10 space-y-4">
          {applications.length === 0 && (
            <p className="text-sm text-ink/60">접수된 신청이 없습니다.</p>
          )}
          {applications.map((app) => (
            <AdminApplicationRow
              key={app.id}
              application={{
                id: app.id,
                type: app.type,
                status: app.status,
                name: app.name,
                phone: app.phone,
                email: app.email,
                education: app.education,
                career: app.career,
                exhibitionCount: app.exhibitionCount,
                motivation: app.motivation,
                createdAt: app.createdAt.toLocaleString("ko-KR"),
                documents: app.documents.map((d) => ({ id: d.id, filename: d.filename })),
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
