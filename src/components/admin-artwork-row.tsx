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
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const { commission, settlement } = calcSettlement(artwork.price);

  async function confirmSold() {
    setUpdating(true);
    const res = await fetch(`/api/artworks/${artwork.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "SOLD",
        buyerName: buyerName.trim() || null,
        buyerContact: buyerContact.trim() || null,
      }),
    });
    setUpdating(false);
    if (res.ok) {
      setStatus("SOLD");
      setShowSaleForm(false);
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

      {status === "LISTED" && !showSaleForm && (
        <button
          onClick={() => setShowSaleForm(true)}
          className="mt-4 rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-base"
        >
          판매완료 처리
        </button>
      )}

      {status === "SOLD" && (
        <a
          href={`/api/artworks/${artwork.id}/certificate`}
          className="mt-4 inline-block rounded-full border border-terracotta/50 px-4 py-1.5 text-xs tracking-wide text-terracotta transition-colors hover:bg-terracotta hover:text-base"
        >
          진품보증서 발급 (PDF)
        </a>
      )}

      {status === "LISTED" && showSaleForm && (
        <div className="mt-4 space-y-3 rounded-sm border border-ink/10 bg-ink/5 p-4">
          <p className="text-xs text-ink/60">
            구매자 정보는 선택 입력입니다 (내부 유통내역 관리용, 외부 제출 시에는 별도 옵션으로
            제외할 수 있습니다).
          </p>
          <label className="block text-sm">
            <span className="text-ink/70">구매자 성함 (선택)</span>
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-1.5 outline-none focus:border-ink"
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink/70">구매자 연락처 (선택)</span>
            <input
              value={buyerContact}
              onChange={(e) => setBuyerContact(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-1.5 outline-none focus:border-ink"
            />
          </label>
          <div className="flex gap-2">
            <button
              disabled={updating}
              onClick={confirmSold}
              className="rounded-full bg-ink px-4 py-1.5 text-xs tracking-wide text-base disabled:opacity-40"
            >
              {updating ? "처리 중..." : "판매완료 확정"}
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={() => setShowSaleForm(false)}
              className="rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
