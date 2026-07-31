"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { NEXT_INVOICE_TYPE, GOODS_FEE_TYPE_LABELS } from "@/lib/goods";

type Goods = {
  id: string;
  stage: string;
  sampleImageUrl: string | null;
};

export function AdminGoodsActions({ goods }: { goods: Goods }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextInvoiceType = NEXT_INVOICE_TYPE[goods.stage] ?? null;

  async function handleInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const res = await fetch(`/api/goods/${goods.id}/invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(formData.get("amount")) }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "청구 중 오류가 발생했습니다.");
      return;
    }
    router.refresh();
  }

  async function handleSampleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const res = await fetch(`/api/goods/${goods.id}/sample`, {
      method: "POST",
      body: formData,
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "업로드 중 오류가 발생했습니다.");
      return;
    }
    router.refresh();
  }

  async function handleToggleAvailability() {
    setSubmitting(true);
    setError("");
    const nextStage = goods.stage === "LISTED" ? "SOLD_OUT" : "LISTED";
    const res = await fetch(`/api/goods/${goods.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "처리 중 오류가 발생했습니다.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-700">{error}</p>}

      {nextInvoiceType && (
        <form onSubmit={handleInvoice} className="rounded-sm border border-ink/20 p-6">
          <p className="text-sm font-medium">{GOODS_FEE_TYPE_LABELS[nextInvoiceType]} 청구</p>
          <div className="mt-3 flex items-center gap-2">
            <input
              name="amount"
              type="number"
              min={1}
              required
              placeholder="금액 (원)"
              className="w-40 rounded-sm border border-ink/20 bg-base px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-ink px-5 py-2 text-xs tracking-wide text-base disabled:opacity-60"
            >
              청구하기
            </button>
          </div>
        </form>
      )}

      {goods.stage === "SAMPLE_REVIEW" && (
        <form onSubmit={handleSampleUpload} className="rounded-sm border border-ink/20 p-6">
          <p className="text-sm font-medium">초도 샘플 사진/영상 업로드</p>
          <p className="mt-1 text-xs text-ink/50">
            {goods.sampleImageUrl ? "이미 업로드된 파일이 있습니다. 다시 업로드하면 교체됩니다." : "작가에게 공유할 사진/영상을 업로드해주세요."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              name="file"
              type="file"
              accept="image/*,video/*"
              required
              className="text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink/10 file:px-4 file:py-2 file:text-ink"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-ink px-5 py-2 text-xs tracking-wide text-base disabled:opacity-60"
            >
              업로드
            </button>
          </div>
        </form>
      )}

      {(goods.stage === "LISTED" || goods.stage === "SOLD_OUT") && (
        <button
          onClick={handleToggleAvailability}
          disabled={submitting}
          className="rounded-full bg-ink px-5 py-2 text-xs tracking-wide text-base disabled:opacity-60"
        >
          {goods.stage === "LISTED" ? "품절 처리" : "판매중으로 전환"}
        </button>
      )}

      {!nextInvoiceType && goods.stage !== "SAMPLE_REVIEW" && goods.stage !== "LISTED" && goods.stage !== "SOLD_OUT" && (
        <p className="text-sm text-ink/60">현재 단계에서는 관리자 조치가 필요하지 않습니다.</p>
      )}
    </div>
  );
}
