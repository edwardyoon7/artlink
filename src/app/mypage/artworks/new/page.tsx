import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { ArtworkForm } from "@/components/artwork-form";
import { LISTING_FEE, COMMISSION_RATE } from "@/lib/pricing";
import { getPriceSuggestion } from "@/lib/price-suggestion";

export default async function NewArtworkPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.artistLevel !== "PRO") redirect("/mypage");

  const suggestion = await getPriceSuggestion(session.user.id);

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">내 작품 등록</h1>
        <p className="mt-3 text-sm text-ink/70">
          등록 시 위탁판매 등록비 {LISTING_FEE.toLocaleString()}원이 발생하며, 입금 확인 후
          작품이 노출됩니다. 판매 시 수수료는 판매가의 {COMMISSION_RATE * 100}%입니다.
        </p>
        <ArtworkForm suggestion={suggestion} />
      </section>
    </div>
  );
}
