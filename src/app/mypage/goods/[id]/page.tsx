import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { PaymentNotice } from "@/components/payment-notice";
import { GoodsDetailActions } from "@/components/goods-detail-actions";
import { getBankInfo } from "@/lib/pricing";
import { GOODS_STAGE_LABELS, GOODS_STAGE_CLASSES } from "@/lib/goods";

export default async function GoodsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  const goods = await prisma.goods.findUnique({
    where: { id },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!goods || goods.artistId !== session.user.id) notFound();

  const latestPayment = goods.payments[0] ?? null;
  const bankInfo = getBankInfo();

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-6 pt-40 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="font-[var(--font-serif-kr)] text-3xl">{goods.title}</h1>
          <span className={`rounded-full px-3 py-1 text-xs tracking-wide ${GOODS_STAGE_CLASSES[goods.stage]}`}>
            {GOODS_STAGE_LABELS[goods.stage]}
          </span>
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

        {latestPayment && latestPayment.status !== "CONFIRMED" && (
          <div className="mt-6">
            <PaymentNotice
              paymentId={latestPayment.id}
              amount={latestPayment.amount}
              status={latestPayment.status}
              depositorName={latestPayment.depositorName}
              bankName={bankInfo.bankName}
              accountNumber={bankInfo.accountNumber}
              accountHolder={bankInfo.accountHolder}
            />
          </div>
        )}

        <div className="mt-8">
          <GoodsDetailActions
            goods={{
              id: goods.id,
              stage: goods.stage,
              sampleImageUrl: goods.sampleImageUrl,
              title: goods.title,
            }}
          />
        </div>
      </section>
    </div>
  );
}
