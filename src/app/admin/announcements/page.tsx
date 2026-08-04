import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { AnnouncementCreateForm } from "@/components/announcement-create-form";
import { AdminAnnouncementRow } from "@/components/admin-announcement-row";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-40 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="font-[var(--font-serif-kr)] text-3xl">공지사항 관리</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/admin/dashboard" className="underline hover:text-ink">
              대시보드
            </Link>
            <Link href="/admin" className="underline hover:text-ink">
              신청 접수 관리
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-ink/70">
          “게시 중”으로 표시된 공지사항이 메인 화면(/) 방문 시 팝업으로 노출됩니다. 여러 건이
          동시에 게시 중이면 화면에서 이전/다음으로 넘겨볼 수 있습니다.
        </p>

        <div className="mt-8">
          <AnnouncementCreateForm />
        </div>

        <div className="mt-10 space-y-4">
          {announcements.length === 0 && (
            <p className="text-sm text-ink/60">등록된 공지사항이 없습니다.</p>
          )}
          {announcements.map((a) => (
            <AdminAnnouncementRow
              key={a.id}
              announcement={{
                id: a.id,
                title: a.title,
                content: a.content,
                isActive: a.isActive,
                createdAt: a.createdAt.toLocaleString("ko-KR"),
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
