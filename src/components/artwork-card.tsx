import Image from "next/image";
import Link from "next/link";
import { ARTWORK_CATEGORY_LABELS } from "@/lib/artwork-category";
import { FavoriteButton } from "@/components/favorite-button";
import type { ArtworkCategory } from "@/generated/prisma/client";

type Artwork = {
  id: string;
  title: string;
  price: number;
  status: string;
  category: ArtworkCategory;
  imageUrl: string | null;
  artist: { name: string };
};

export function ArtworkCard({
  artwork,
  isFavorited = false,
  showFavorite = false,
}: {
  artwork: Artwork;
  isFavorited?: boolean;
  showFavorite?: boolean;
}) {
  return (
    <Link href={`/artworks/${artwork.id}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-ink/5">
        {showFavorite && <FavoriteButton artworkId={artwork.id} initialFavorited={isFavorited} variant="overlay" />}
        {artwork.imageUrl ? (
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">
            이미지 없음
          </div>
        )}
        {artwork.status === "SOLD" && (
          <span className="absolute right-2 top-2 rounded-full bg-ink px-3 py-1 text-xs text-base">
            판매완료
          </span>
        )}
      </div>
      <p className="mt-3 font-[var(--font-serif-kr)]">{artwork.title}</p>
      <p className="text-sm text-ink/60">
        {artwork.artist.name} · {ARTWORK_CATEGORY_LABELS[artwork.category]} · {artwork.price.toLocaleString()}원
      </p>
    </Link>
  );
}
