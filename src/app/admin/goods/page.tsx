import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { GOODS_STAGE_LABELS, GOODS_STAGE_CLASSES } from "@/lib/goods";

export default async function AdminGoodsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const goodsList = await prisma.goods.findMany({
    orderBy: { createdAt: "desc" },
    include: { artist: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">굿즈 관리</h1>
        <p className="mt-2 text-sm text-ink/70">
          단계별 비용 청구, 샘플 업로드, 품절 처리는 상세 페이지에서 진행합니다.
        </p>

        <div className="mt-10 space-y-4">
          {goodsList.length === 0 && <p className="text-sm text-ink/60">제출된 굿즈 아이디어가 없습니다.</p>}
          {goodsList.map((goods) => {
            const latestPayment = goods.payments[0] ?? null;
            return (
              <Link
                key={goods.id}
                href={`/admin/goods/${goods.id}`}
                className="block rounded-sm border border-ink/20 p-6 hover:border-ink"
              >
                <div className="flex items-center justify-between">
                  <p className="font-[var(--font-serif-kr)] text-lg">{goods.title}</p>
                  <span className={`rounded-full px-3 py-1 text-xs ${GOODS_STAGE_CLASSES[goods.stage]}`}>
                    {GOODS_STAGE_LABELS[goods.stage]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/70">{goods.artist.name}</p>
                {latestPayment && (
                  <p className="mt-1 text-xs text-ink/50">
                    최근 결제: {latestPayment.amount.toLocaleString()}원 ({latestPayment.status})
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
