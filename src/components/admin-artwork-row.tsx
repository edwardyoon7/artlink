"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calcSettlement } from "@/lib/pricing";

type Artwork = {
  id: string;
  title: string;
  artistName: string;
  price: number;
  status: string;
  paymentStatus: string;
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "입금 대기",
  LISTED: "위탁판매 중",
  SOLD: "판매 완료",
};

export function AdminArtworkRow({ artwork }: { artwork: Artwork }) {
  const router = useRouter();
  const [status, setStatus] = useState(artwork.status);
  const [updating, setUpdating] = useState(false);
  const { commission, settlement } = calcSettlement(artwork.price);

  async function markSold() {
    setUpdating(true);
    const res = await fetch(`/api/artworks/${artwork.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SOLD" }),
    });
    setUpdating(false);
    if (res.ok) {
      setStatus("SOLD");
      router.refresh();
    }
  }

  return (
    <div className="rounded-sm border border-ink/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-[var(--font-serif-kr)] text-lg">{artwork.title}</p>
          <p className="text-sm text-ink/60">작가: {artwork.artistName}</p>
        </div>
        <span className="rounded-full bg-ink/10 px-3 py-1 text-xs">{STATUS_LABEL[status]}</span>
      </div>
      <p className="mt-3 text-sm text-ink/70">
        판매가 {artwork.price.toLocaleString()}원 · 수수료(30%) {commission.toLocaleString()}원 ·
        작가 정산액 {settlement.toLocaleString()}원
      </p>

      {status === "LISTED" && (
        <button
          disabled={updating}
          onClick={markSold}
          className="mt-4 rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-base disabled:opacity-40"
        >
          판매완료 처리
        </button>
      )}
    </div>
  );
}
