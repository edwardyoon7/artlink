const LABELS: Record<string, string> = {
  PENDING: "제출됨",
  RECEIVED: "접수",
  APPROVED: "승인",
  REJECTED: "반려",
  WAITING: "입금 대기",
  CONFIRMED: "입금 확인",
};

const CLASSES: Record<string, string> = {
  PENDING: "bg-ink/10 text-ink",
  RECEIVED: "bg-terracotta/15 text-terracotta",
  APPROVED: "bg-ink text-base",
  REJECTED: "bg-red-100 text-red-800",
  WAITING: "bg-terracotta/15 text-terracotta",
  CONFIRMED: "bg-ink text-base",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs tracking-wide ${CLASSES[status] ?? "bg-ink/10 text-ink"}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
