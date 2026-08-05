"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const HEART_FILLED = "♥";
const HEART_OUTLINE = "♡";

export function FavoriteButton({
  artworkId,
  initialFavorited,
  variant = "inline",
}: {
  artworkId: string;
  initialFavorited: boolean;
  variant?: "inline" | "overlay";
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    setPending(true);
    const next = !favorited;
    const res = await fetch(`/api/artworks/${artworkId}/favorite`, {
      method: next ? "POST" : "DELETE",
    });
    setPending(false);
    if (res.ok) {
      setFavorited(next);
      router.refresh();
    }
  }

  if (variant === "overlay") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={favorited ? "찜 해제" : "찜하기"}
        aria-pressed={favorited}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-base/90 text-base leading-none text-terracotta shadow-sm transition-transform hover:scale-110 disabled:opacity-60"
      >
        <span aria-hidden>{favorited ? HEART_FILLED : HEART_OUTLINE}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorited}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/30 px-3 py-1 text-xs tracking-[0.1em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
    >
      <span aria-hidden className="text-terracotta">
        {favorited ? HEART_FILLED : HEART_OUTLINE}
      </span>
      {favorited ? "찜한 작품" : "찜하기"}
    </button>
  );
}
