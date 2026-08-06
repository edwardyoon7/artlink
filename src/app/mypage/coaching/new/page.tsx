import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { CoachingForm } from "@/components/coaching-form";
import { CoachingFeeDetailButton } from "@/components/coaching-fee-detail-button";
import { COACHING_FEE } from "@/lib/pricing";

export default async function NewCoachingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "AMATEUR") redirect("/mypage");

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">코칭 예약</h1>
        <p className="mt-3 text-sm text-ink/70">
          예약 시 코칭 비용 {COACHING_FEE.toLocaleString()}원이 발생하며, 입금 확인 후 예약이
          확정됩니다. <CoachingFeeDetailButton />
        </p>
        <CoachingForm />
      </section>
    </div>
  );
}
