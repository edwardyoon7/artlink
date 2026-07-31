import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { AdminGoodsActions } from "@/components/admin-goods-actions";
import { GOODS_STAGE_LABELS, GOODS_STAGE_CLASSES, GOODS_FEE_TYPE_LABELS } from "@/lib/goods";

export default async function AdminGoodsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const goods = await prisma.goods.findUnique({
    where: { id },
    include: { artist: true, payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!goods) notFound();

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pt-40 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="font-[var(--font-serif-kr)] text-3xl">{goods.title}</h1>
          <span className={`rounded-full px-3 py-1 text-xs tracking-wide ${GOODS_STAGE_CLASSES[goods.stage]}`}>
            {GOODS_STAGE_LABELS[goods.stage]}
          </span>
        </div>

        <div className="mt-4 text-sm text-ink/70">
          <p>{goods.artist.name} · {goods.artist.email} · {goods.artist.phone}</p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <p className="text-xs tracking-wide text-ink/50">아이디어 설명</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{goods.concept}</p>
          </div>
          {goods.targetAudience && (
            <div>
              <p className="text-xs tracking-wide text-ink/50">타겟층 메모</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{goods.targetAudience}</p>
            </div>
          )}
        </div>

        {goods.payments.length > 0 && (
          <div className="mt-8">
            <p className="text-xs tracking-wide text-ink/50">결제 이력</p>
            <div className="mt-2 space-y-2">
              {goods.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-2 text-sm">
                  <span>{GOODS_FEE_TYPE_LABELS[payment.type] ?? payment.type}</span>
                  <span className="text-ink/60">{payment.amount.toLocaleString()}원 · {payment.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <AdminGoodsActions
            goods={{
              id: goods.id,
              stage: goods.stage,
              sampleImageUrl: goods.sampleImageUrl,
            }}
          />
        </div>
      </section>
    </div>
  );
}
