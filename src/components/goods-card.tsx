import Image from "next/image";
import Link from "next/link";

type Goods = {
  id: string;
  title: string;
  price: number | null;
  stage: string;
  imageUrl: string | null;
  artist: { name: string };
};

export function GoodsCard({ goods }: { goods: Goods }) {
  return (
    <Link href={`/goods/${goods.id}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-ink/5">
        {goods.imageUrl ? (
          <Image
            src={goods.imageUrl}
            alt={goods.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">
            이미지 없음
          </div>
        )}
        {goods.stage === "SOLD_OUT" && (
          <span className="absolute right-2 top-2 rounded-full bg-ink px-3 py-1 text-xs text-base">
            품절
          </span>
        )}
      </div>
      <p className="mt-3 font-[var(--font-serif-kr)]">{goods.title}</p>
      <p className="text-sm text-ink/60">
        {goods.artist.name} · {goods.price != null ? `${goods.price.toLocaleString()}원` : "-"}
      </p>
    </Link>
  );
}
