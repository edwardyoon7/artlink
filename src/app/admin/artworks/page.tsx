import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { AdminArtworkRow } from "@/components/admin-artwork-row";
import { ArtworkExportPanel } from "@/components/artwork-export-panel";

export default async function AdminArtworksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const artworks = await prisma.artwork.findMany({
    orderBy: { createdAt: "desc" },
    include: { artist: true, payment: true },
  });

  return (
    <div className="min-h-screen bg-base text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pt-40 pb-20">
        <h1 className="font-[var(--font-serif-kr)] text-3xl">작품 관리</h1>
        <p className="mt-2 text-sm text-ink/70">
          입금 확인이 끝나 위탁판매 중인 작품이 실제로 판매되면 “판매완료 처리”를 눌러주세요.
        </p>

        <div className="mt-10">
          <ArtworkExportPanel />
        </div>

        <div className="mt-10 space-y-4">
          {artworks.length === 0 && <p className="text-sm text-ink/60">등록된 작품이 없습니다.</p>}
          {artworks.map((artwork) => (
            <AdminArtworkRow
              key={artwork.id}
              artwork={{
                id: artwork.id,
                title: artwork.title,
                artistName: artwork.artist.name,
                price: artwork.price,
                finalPrice: artwork.finalPrice,
                status: artwork.status,
                paymentStatus: artwork.payment?.status ?? "WAITING",
                soldAt: artwork.soldAt,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
