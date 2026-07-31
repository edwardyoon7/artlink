"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";

type Payment = {
  id: string;
  kind: string;
  artistName: string;
  amount: number;
  status: string;
  depositorName: string | null;
  createdAt: string;
  artworkTitle: string | null;
  artworkPrice: number | null;
  region: string | null;
  instructorName: string | null;
  preferredDate: string | null;
  curriculum: string | null;
  goodsTitle: string | null;
};

export function AdminPaymentRow({ payment }: { payment: Payment }) {
  const router = useRouter();
  const [status, setStatus] = useState(payment.status);
  const [updating, setUpdating] = useState(false);

  async function updateStatus(next: "CONFIRMED" | "REJECTED") {
    setUpdating(true);
    const res = await fetch(`/api/payments/${payment.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setUpdating(false);
    if (res.ok) {
      setStatus(next);
      router.refresh();
    }
  }

  return (
    <div className="rounded-sm border border-ink/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-ink/60">
            {payment.kind}
          </span>
          <p className="mt-1 font-[var(--font-serif-kr)] text-lg">{payment.artistName}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-3 space-y-1 text-sm text-ink/70">
        {payment.artworkTitle && (
          <p>
            작품명: {payment.artworkTitle}
            {payment.artworkPrice != null && ` · 판매가 ${payment.artworkPrice.toLocaleString()}원`}
          </p>
        )}
        {payment.instructorName && <p>담당 강사: {payment.instructorName}</p>}
        {payment.region && <p>지역: {payment.region}</p>}
        {payment.preferredDate && <p>희망 일시: {payment.preferredDate}</p>}
        {payment.curriculum && <p>요청 내용: {payment.curriculum}</p>}
        {payment.goodsTitle && <p>굿즈: {payment.goodsTitle}</p>}
        <p>
          결제 금액: {payment.amount.toLocaleString()}원
          {payment.depositorName && ` · 입금자명: ${payment.depositorName}`}
        </p>
        <p>신청일: {payment.createdAt}</p>
      </div>

      {status === "WAITING" && (
        <div className="mt-4 flex gap-2">
          <button
            disabled={updating}
            onClick={() => updateStatus("CONFIRMED")}
            className="rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-base disabled:opacity-40"
          >
            입금 확인
          </button>
          <button
            disabled={updating}
            onClick={() => updateStatus("REJECTED")}
            className="rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-base disabled:opacity-40"
          >
            반려
          </button>
        </div>
      )}
    </div>
  );
}
