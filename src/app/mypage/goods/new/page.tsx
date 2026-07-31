import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { GoodsIdeaForm } from "@/components/goods-idea-form";
import { GoodsProcessInfo } from "@/components/goods-process-info";

export default async function NewGoodsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "PRO") redirect("/mypage");

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">굿즈 아이디어 제안</h1>
        <p className="mt-3 text-sm text-ink/70">
          아이디어 제출은 무료입니다. 이후 아이디어 컨설팅 · 제작 의뢰 · 샘플 검토 비용은
          각 단계에 도달했을 때 건별로 안내드리며, 계좌이체로 결제합니다.
        </p>
        <GoodsProcessInfo />
        <GoodsIdeaForm />
      </section>
    </div>
  );
}
