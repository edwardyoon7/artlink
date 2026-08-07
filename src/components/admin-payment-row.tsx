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
  instructorEmail: string | null;
  preferredDate: string | null;
  durationHours: number | null;
  curriculum: string | null;
  goodsTitle: string | null;
  coachingBookingId: string | null;
  coachingBookingStatus: string | null;
};

const COACHING_BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "입금 대기",
  PAYMENT_CONFIRMED: "입금 확인됨 · 강사 확인 대기",
  CONFIRMED: "최종 확정됨",
  COMPLETED: "코칭 완료",
  CANCELLED: "취소됨",
};

export function AdminPaymentRow({ payment }: { payment: Payment }) {
  const router = useRouter();
  const [status, setStatus] = useState(payment.status);
  const [bookingStatus, setBookingStatus] = useState(payment.coachingBookingStatus);
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
      if (payment.coachingBookingId && next === "CONFIRMED") {
        setBookingStatus("PAYMENT_CONFIRMED");
      }
      router.refresh();
    }
  }

  async function confirmBooking() {
    if (!payment.coachingBookingId) return;
    setUpdating(true);
    const res = await fetch(`/api/coaching-bookings/${payment.coachingBookingId}/confirm`, {
      method: "PATCH",
    });
    setUpdating(false);
    if (res.ok) {
      setBookingStatus("CONFIRMED");
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
        <div className="flex items-center gap-2">
          {payment.coachingBookingId && bookingStatus && (
            <span className="rounded-full bg-terracotta/15 px-3 py-1 text-xs text-terracotta">
              {COACHING_BOOKING_STATUS_LABEL[bookingStatus] ?? bookingStatus}
            </span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm text-ink/70">
        {payment.artworkTitle && (
          <p>
            작품명: {payment.artworkTitle}
            {payment.artworkPrice != null && ` · 판매가 ${payment.artworkPrice.toLocaleString()}원`}
          </p>
        )}
        {payment.instructorName && (
          <p>
            담당 강사: {payment.instructorName}
            {payment.instructorEmail && ` (${payment.instructorEmail})`}
          </p>
        )}
        {payment.region && <p>지역: {payment.region}</p>}
        {payment.preferredDate && (
          <p>
            희망 일시: {payment.preferredDate}
            {payment.durationHours != null && ` · ${payment.durationHours}시간`}
          </p>
        )}
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

      {payment.coachingBookingId && bookingStatus === "PAYMENT_CONFIRMED" && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-ink/50">
            강사에게 해당 시간에 코칭 진행이 가능한지 확인한 뒤 눌러주세요.
          </p>
          <button
            disabled={updating}
            onClick={confirmBooking}
            className="rounded-full bg-terracotta px-4 py-1.5 text-xs tracking-wide text-base disabled:opacity-40"
          >
            최종 확정
          </button>
        </div>
      )}
    </div>
  );
}
