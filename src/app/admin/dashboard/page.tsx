import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcSettlement } from "@/lib/pricing";
import { GOODS_FEE_TYPE_LABELS, GOODS_STAGE_LABELS, GOODS_STAGE_CLASSES } from "@/lib/goods";
import { SiteHeader } from "@/components/site-header";

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  LISTING_FEE: "작품 위탁판매 등록비",
  COACHING_FEE: "코칭 예약비",
  ...GOODS_FEE_TYPE_LABELS,
};
const PAYMENT_TYPE_ORDER = [
  "LISTING_FEE",
  "COACHING_FEE",
  "GOODS_IDEA_FEE",
  "GOODS_PRODUCTION_FEE",
  "GOODS_SAMPLE_FEE",
];

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "제출됨",
  RECEIVED: "접수",
  APPROVED: "승인",
  REJECTED: "반려",
};
const APPLICATION_STATUS_ORDER = ["PENDING", "RECEIVED", "APPROVED", "REJECTED"];

const ARTWORK_STATUS_LABELS: Record<string, string> = {
  DRAFT: "입금 대기",
  LISTED: "위탁판매 중",
  SOLD: "판매 완료",
};
const ARTWORK_STATUS_ORDER = ["DRAFT", "LISTED", "SOLD"];

const COACHING_STATUS_LABELS: Record<string, string> = {
  PENDING: "입금 대기",
  CONFIRMED: "예약 확정",
  COMPLETED: "코칭 완료",
  CANCELLED: "취소",
};
const COACHING_STATUS_ORDER = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const GOODS_STAGE_ORDER = [
  "REQUESTED",
  "CONSULTING",
  "COMMISSIONED",
  "SAMPLE_REVIEW",
  "APPROVED",
  "LISTED",
  "SOLD_OUT",
];

// 상태 배지 색상: 중립(대기)=ink/10, 진행중=terracotta, 완료/긍정=ink 채움, 부정=red
const NEUTRAL = "bg-ink/10 text-ink";
const IN_PROGRESS = "bg-terracotta/15 text-terracotta";
const DONE = "bg-ink text-base";
const NEGATIVE = "bg-red-100 text-red-800";

const APPLICATION_STATUS_CLASSES: Record<string, string> = {
  PENDING: NEUTRAL,
  RECEIVED: IN_PROGRESS,
  APPROVED: DONE,
  REJECTED: NEGATIVE,
};
const ARTWORK_STATUS_CLASSES: Record<string, string> = {
  DRAFT: NEUTRAL,
  LISTED: IN_PROGRESS,
  SOLD: DONE,
};
const COACHING_STATUS_CLASSES: Record<string, string> = {
  PENDING: NEUTRAL,
  CONFIRMED: IN_PROGRESS,
  COMPLETED: DONE,
  CANCELLED: NEGATIVE,
};

function won(n: number) {
  return `${n.toLocaleString()}원`;
}

function StatTile({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: string;
  href?: string;
  hint?: string;
}) {
  const body = (
    <div className="rounded-sm border border-ink/20 p-5 transition-colors hover:border-ink/40">
      <p className="text-xs tracking-wide text-ink/60">{label}</p>
      <p className="mt-2 font-[var(--font-serif-kr)] text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function CountBreakdown({
  counts,
  order,
  labels,
  classes,
}: {
  counts: Record<string, number>;
  order: string[];
  labels: Record<string, string>;
  classes: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {order.map((key) => (
        <span
          key={key}
          className={`rounded-full px-3 py-1 text-xs tracking-wide ${classes[key] ?? NEUTRAL}`}
        >
          {labels[key] ?? key} {counts[key] ?? 0}
        </span>
      ))}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    revenueAllTime,
    revenueThisMonth,
    waitingPayments,
    applicationGroups,
    artworkGroups,
    soldArtworkSum,
    coachingGroups,
    goodsGroups,
    collectorCount,
  ] = await Promise.all([
    prisma.payment.groupBy({
      by: ["type"],
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["type"],
      where: { status: "CONFIRMED", confirmedAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "WAITING" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.application.groupBy({ by: ["type", "status"], _count: { _all: true } }),
    prisma.artwork.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.artwork.aggregate({ where: { status: "SOLD" }, _sum: { price: true } }),
    prisma.coachingBooking.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.goods.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.user.count({ where: { role: "COLLECTOR" } }),
  ]);

  const toAmountMap = (rows: { type: string; _sum: { amount: number | null } }[]) =>
    Object.fromEntries(rows.map((r) => [r.type, r._sum.amount ?? 0]));
  const allTimeByType = toAmountMap(revenueAllTime);
  const thisMonthByType = toAmountMap(revenueThisMonth);
  const allTimeTotal = Object.values(allTimeByType).reduce((a, b) => a + b, 0);
  const thisMonthTotal = Object.values(thisMonthByType).reduce((a, b) => a + b, 0);

  const applicationCounts: Record<string, { PRO: number; AMATEUR: number }> = {};
  for (const status of APPLICATION_STATUS_ORDER) applicationCounts[status] = { PRO: 0, AMATEUR: 0 };
  let pendingApplicationCount = 0;
  for (const g of applicationGroups) {
    applicationCounts[g.status][g.type as "PRO" | "AMATEUR"] = g._count._all;
    if (g.status === "PENDING" || g.status === "RECEIVED") pendingApplicationCount += g._count._all;
  }

  const artworkCounts = Object.fromEntries(artworkGroups.map((g) => [g.status, g._count._all]));
  const coachingCounts = Object.fromEntries(coachingGroups.map((g) => [g.status, g._count._all]));
  const goodsCounts = Object.fromEntries(goodsGroups.map((g) => [g.stage, g._count._all]));

  const { settlement: soldSettlementTotal } = calcSettlement(soldArtworkSum._sum.price ?? 0);
  const goodsInProgressCount =
    (goodsCounts.REQUESTED ?? 0) +
    (goodsCounts.CONSULTING ?? 0) +
    (goodsCounts.COMMISSIONED ?? 0) +
    (goodsCounts.SAMPLE_REVIEW ?? 0);

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-40 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="font-[var(--font-serif-kr)] text-3xl">대시보드</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/admin" className="underline hover:text-ink">
              신청 접수 관리
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
          전체 운영 현황을 한눈에 확인합니다. 금액은 입금 확인(CONFIRMED)이 끝난 결제만 집계합니다.
        </p>

        {/* 처리 대기 작업 */}
        <div className="mt-10">
          <h2 className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
            NEEDS ATTENTION
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              label="신청 대기"
              value={`${pendingApplicationCount}건`}
              href="/admin"
              hint="제출됨·접수 상태"
            />
            <StatTile
              label="입금 확인 대기"
              value={`${waitingPayments._count._all}건`}
              href="/admin/payments"
              hint={won(waitingPayments._sum.amount ?? 0)}
            />
            <StatTile
              label="위탁판매 중 작품"
              value={`${artworkCounts.LISTED ?? 0}점`}
              href="/admin/artworks"
            />
            <StatTile
              label="굿즈 진행 중"
              value={`${goodsInProgressCount}건`}
              href="/admin/goods"
            />
          </div>
        </div>

        {/* 매출 요약 */}
        <div className="mt-12">
          <h2 className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
            REVENUE (CONFIRMED)
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <StatTile label="이번 달 확정 매출" value={won(thisMonthTotal)} />
            <StatTile label="누적 확정 매출" value={won(allTimeTotal)} />
          </div>
          <div className="mt-4 divide-y divide-ink/10 rounded-sm border border-ink/20">
            <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-ink/50">
              <span>항목</span>
              <span className="text-right">이번 달</span>
              <span className="text-right">누적</span>
            </div>
            {PAYMENT_TYPE_ORDER.map((type) => (
              <div key={type} className="grid grid-cols-3 gap-2 px-4 py-2 text-sm">
                <span className="text-ink/80">{PAYMENT_TYPE_LABELS[type]}</span>
                <span className="text-right">{won(thisMonthByType[type] ?? 0)}</span>
                <span className="text-right">{won(allTimeByType[type] ?? 0)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink/50">
            판매완료(SOLD) 작품 작가 정산 예정액 누적: {won(soldSettlementTotal)} (수수료 30% 차감,
            실제 지급은 별도 처리)
          </p>
        </div>

        {/* 신청 현황 */}
        <div className="mt-12">
          <h2 className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
            APPLICATIONS
          </h2>
          <div className="mt-3 space-y-3 rounded-sm border border-ink/20 p-5">
            {APPLICATION_STATUS_ORDER.map((status) => (
              <div key={status} className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs tracking-wide ${APPLICATION_STATUS_CLASSES[status]}`}
                >
                  {APPLICATION_STATUS_LABELS[status]}
                </span>
                <span className="text-sm text-ink/70">
                  프로 {applicationCounts[status].PRO}건 · 아마추어 {applicationCounts[status].AMATEUR}건
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 작품 / 코칭 / 굿즈 현황 */}
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div>
            <h2 className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
              ARTWORKS
            </h2>
            <div className="mt-3">
              <CountBreakdown
                counts={artworkCounts}
                order={ARTWORK_STATUS_ORDER}
                labels={ARTWORK_STATUS_LABELS}
                classes={ARTWORK_STATUS_CLASSES}
              />
            </div>
          </div>
          <div>
            <h2 className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
              COACHING
            </h2>
            <div className="mt-3">
              <CountBreakdown
                counts={coachingCounts}
                order={COACHING_STATUS_ORDER}
                labels={COACHING_STATUS_LABELS}
                classes={COACHING_STATUS_CLASSES}
              />
            </div>
          </div>
          <div>
            <h2 className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
              GOODS
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOODS_STAGE_ORDER.map((stage) => (
                <span
                  key={stage}
                  className={`rounded-full px-3 py-1 text-xs tracking-wide ${
                    GOODS_STAGE_CLASSES[stage] ?? NEUTRAL
                  }`}
                >
                  {GOODS_STAGE_LABELS[stage] ?? stage} {goodsCounts[stage] ?? 0}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-12 text-xs text-ink/50">가입 컬렉터(일반 구매자 회원) {collectorCount}명</p>
      </section>
    </div>
  );
}
