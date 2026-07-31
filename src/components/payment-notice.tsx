"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  paymentId: string;
  amount: number;
  status: string;
  depositorName: string | null;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export function PaymentNotice({
  paymentId,
  amount,
  status,
  depositorName,
  bankName,
  accountNumber,
  accountHolder,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(depositorName ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (status === "CONFIRMED") {
    return <p className="text-sm text-ink/60">입금 확인 완료 ({amount.toLocaleString()}원)</p>;
  }
  if (status === "REJECTED") {
    return <p className="text-sm text-red-700">입금이 확인되지 않아 반려되었습니다.</p>;
  }

  async function handleDeclare() {
    if (!name.trim()) return;
    setSubmitting(true);
    setMessage("");
    const res = await fetch(`/api/payments/${paymentId}/declare`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depositorName: name }),
    });
    setSubmitting(false);
    if (res.ok) {
      setMessage("입금자명이 등록되었습니다. 운영자 확인 후 서비스가 활성화됩니다.");
      router.refresh();
    } else {
      setMessage("등록에 실패했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <div className="rounded-sm border border-terracotta/40 bg-terracotta/5 p-4 text-sm">
      <p className="font-medium text-ink">입금 안내 — {amount.toLocaleString()}원</p>
      <p className="mt-1 text-ink/70">
        {bankName} {accountNumber} ({accountHolder})
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="입금자명"
          className="rounded-sm border border-ink/20 bg-base px-3 py-1.5 outline-none focus:border-ink"
        />
        <button
          onClick={handleDeclare}
          disabled={submitting}
          className="rounded-full bg-terracotta px-4 py-1.5 text-xs tracking-wide text-base disabled:opacity-60"
        >
          {submitting ? "등록 중..." : "입금 완료 신고"}
        </button>
      </div>
      {message && <p className="mt-2 text-ink/60">{message}</p>}
    </div>
  );
}
