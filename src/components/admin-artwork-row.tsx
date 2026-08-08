"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calcSettlement } from "@/lib/pricing";

type Artwork = {
  id: string;
  title: string;
  artistName: string;
  price: number;
  finalPrice: number | null;
  status: string;
  paymentStatus: string;
  soldAt: Date | null;
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
  const [finalPrice, setFinalPrice] = useState(String(artwork.price));
  const [buyerName, setBuyerName] = useState("");
  const [buyerContact, setBuyerContact] = useState("");

  const settlementBasis = artwork.finalPrice ?? artwork.price;
  // 이미 판매완료된 건은 그때(soldAt) 적용됐던 수수료율을 그대로 보여주고,
  // 아직 판매 전(LISTED)인 건은 "지금 확정하면" 적용될 요율을 미리보기로 보여준다.
  const { commission, settlement, rate } = calcSettlement(settlementBasis, artwork.soldAt ?? undefined);
  const finalPriceDiffersFromListed = Number(finalPrice) > 0 && Number(finalPrice) !== artwork.price;

  async function confirmSold() {
    setUpdating(true);
    const res = await fetch(`/api/artworks/${artwork.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "SOLD",
        finalPrice: Number(finalPrice),
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
        {status === "SOLD" ? "최종 판매가" : "위탁 등록가"} {settlementBasis.toLocaleString()}원 ·
        수수료({Math.round(rate * 100)}%) {commission.toLocaleString()}원 · 작가 정산액{" "}
        {settlement.toLocaleString()}원
      </p>
      {status === "SOLD" && artwork.finalPrice != null && artwork.finalPrice !== artwork.price && (
        <p className="mt-1 text-xs text-terracotta">
          ⚠ 위탁 등록가 {artwork.price.toLocaleString()}원과 다르게 판매되었습니다(협상가 적용).
        </p>
      )}

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
          <label className="block text-sm">
            <span className="text-ink/70">
              최종 판매가 (원) — 위탁 등록가 {artwork.price.toLocaleString()}원
            </span>
            <input
              type="number"
              min={1}
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-1.5 outline-none focus:border-ink"
            />
            <span className="mt-1 block text-xs text-ink/50">
              원칙적으로 위탁 등록가 그대로 판매되어야 합니다. 이 값이 유통내역(세무 제출용
              매출장)·작가 정산액 계산의 기준이 되니, 협상(네고) 없이 등록가대로 판매됐다면 그대로
              두시면 됩니다.
            </span>
            {finalPriceDiffersFromListed && (
              <span className="mt-1 block text-xs font-medium text-terracotta">
                ⚠ 위탁 등록가와 다른 금액입니다 — 협상 판매인 경우에만 변경해주세요.
              </span>
            )}
          </label>
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
              disabled={updating || !finalPrice || Number(finalPrice) <= 0}
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
