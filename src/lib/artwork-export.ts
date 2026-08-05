import { prisma } from "@/lib/prisma";

export const SELLER_NAME = "애다기획(아트이음)";

export type SoldArtworkRow = {
  soldAt: string;
  title: string;
  editionNumber: string;
  price: number;
  seller: string;
  artist: string;
  imageUrl: string;
  buyerName: string;
  buyerContact: string;
};

export async function getSoldArtworkRows(): Promise<SoldArtworkRow[]> {
  const artworks = await prisma.artwork.findMany({
    where: { status: "SOLD" },
    orderBy: { soldAt: "desc" },
    include: { artist: true },
  });

  return artworks.map((artwork) => ({
    soldAt: artwork.soldAt
      ? new Date(artwork.soldAt).toLocaleString("ko-KR")
      : "",
    title: artwork.title,
    editionNumber: artwork.editionNumber ?? "",
    // 세무 제출용 매출장 기준 — 실제 최종 판매가(협상이 있었다면 그 금액)를 우선하고,
    // 이 필드가 생기기 전에 판매완료 처리된 기존 건은 위탁 등록가로 대체한다.
    price: artwork.finalPrice ?? artwork.price,
    seller: SELLER_NAME,
    artist: artwork.artist.name,
    imageUrl: artwork.imageUrl ?? "",
    buyerName: artwork.buyerName ?? "",
    buyerContact: artwork.buyerContact ?? "",
  }));
}
