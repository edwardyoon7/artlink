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
    price: artwork.price,
    seller: SELLER_NAME,
    artist: artwork.artist.name,
    imageUrl: artwork.imageUrl ?? "",
    buyerName: artwork.buyerName ?? "",
    buyerContact: artwork.buyerContact ?? "",
  }));
}
